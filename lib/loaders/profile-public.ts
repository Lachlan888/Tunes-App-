import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { canBrowseProfileRepertoire, PROFILE_PAGE_SIZE, profileSearchPattern, profileHref, type ProfileQuery } from '@/lib/profile-navigation'
import type { Piece, Profile, PublicProfileCreatedBadge, PublicProfileReceivedBadge, PublicProfileList, UserInstrument } from '@/lib/types'

type Client = Awaited<ReturnType<typeof createClient>>
const identityColumns = 'id,title,type,key,style,time_signature,composer,reference_url'
const visibilityColumns = 'id,username,show_identity,show_instruments,show_public_lists_on_profile,show_composed_tunes_on_profile,show_repertoire_summary,show_repertoire_to_friends,show_comment_activity,show_compare_discoverability,compare_requires_friend'
function checked<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message)
  return result.data
}
async function repertoirePage(db: Client, userId: string, query: ProfileQuery) {
  const table = query.group === 'practice' ? 'user_pieces' : 'user_known_pieces'
  let read = db.from(table).select(`piece_id,pieces!inner(${identityColumns})`).eq('user_id', userId)
  if (query.group === 'practice') read = read.eq('status', 'learning')
  if (query.q) read = read.ilike('pieces.title', profileSearchPattern(query.q))
  const start = (query.page - 1) * PROFILE_PAGE_SIZE
  const rows = checked(await read.order('pieces(title)', { ascending: true }).order('piece_id').range(start, start + PROFILE_PAGE_SIZE)) ?? []
  return (rows as unknown as { pieces: Piece }[]).map(row => row.pieces)
}

export async function loadPublicProfileData(username: string, query: ProfileQuery) {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(profileHref(username, query))}`)
  const viewerId = user.id
  // Read visibility before identity or inventory. Hidden bio/name never enter a visitor payload.
  const flags = checked<Profile>(await db.from('profiles').select(visibilityColumns).eq('username', username.trim().toLowerCase()).maybeSingle())
  if (!flags) return null
  const owner = viewerId === flags.id
  const isOwnProfile = owner && !query.preview
  let profile = { ...flags, display_name: null, bio: null } as Profile
  if (flags.show_identity) {
    const identity = checked<{display_name:string | null;bio:string | null}>(await db.from('profiles').select('display_name,bio').eq('id', flags.id).eq('show_identity', true).maybeSingle())
    if (identity) profile = { ...profile, ...identity, bio: identity.bio?.slice(0, 500) ?? null }
  }
  const connection = viewerId && !owner ? checked<{id:number;status:string;requester_id:string}>(await db.from('connections').select('id,status,requester_id').or(`and(requester_id.eq.${viewerId},addressee_id.eq.${flags.id}),and(requester_id.eq.${flags.id},addressee_id.eq.${viewerId})`).limit(1).maybeSingle()) : null
  const isAcceptedFriend = !query.preview && connection?.status === 'accepted'
  const canViewFullRepertoire = canBrowseProfileRepertoire(owner, isAcceptedFriend, flags.show_repertoire_to_friends, query.preview)
  const canCompare = Boolean(viewerId && !owner && flags.show_compare_discoverability && (!flags.compare_requires_friend || isAcceptedFriend))
  let instruments: UserInstrument[] = []
  let publicLists: PublicProfileList[] = []
  let tunes: Piece[] = []
  let featuredTunes: Piece[] = []
  let sharedTunes: Piece[] = []
  let createdBadges: PublicProfileCreatedBadge[] = []
  let receivedBadges: PublicProfileReceivedBadge[] = []
  let summary: { known_count: number; practice_count: number } | null = null
  let activity: { id: number; event_type: string; created_at: string; piece_id: number | null; title?: string }[] = []
  let overlap: number | null = null
  let hasNext = false
  const start = (query.page - 1) * PROFILE_PAGE_SIZE

  if (query.tab === 'overview') {
    if (!owner && canViewFullRepertoire) {
      const candidates = (await repertoirePage(db, flags.id, {...query, group: 'known', page: 1, q: ''})).slice(0, PROFILE_PAGE_SIZE)
      const ids = candidates.map(tune => tune.id)
      if (ids.length) {
        const [known, practice] = await Promise.all([
          db.from('user_known_pieces').select('piece_id').eq('user_id', viewerId).in('piece_id', ids),
          db.from('user_pieces').select('piece_id').eq('user_id', viewerId).eq('status', 'learning').in('piece_id', ids),
        ])
        const shared = new Set([...(checked(known) ?? []), ...(checked(practice) ?? [])].map(row => row.piece_id))
        sharedTunes = candidates.filter(tune => shared.has(tune.id)).slice(0, 3)
      }
    }
    if (flags.show_instruments) instruments = checked(await db.from('user_instruments').select('id,instrument_name,position').eq('user_id', flags.id).order('position').limit(20)) ?? []
    if (flags.show_repertoire_summary) {
      const [known, practice] = await Promise.all([
        db.from('user_known_pieces').select('piece_id', { count: 'exact', head: true }).eq('user_id', flags.id),
        db.from('user_pieces').select('piece_id', { count: 'exact', head: true }).eq('user_id', flags.id).eq('status', 'learning'),
      ])
      checked(known); checked(practice)
      summary = { known_count: known.count ?? 0, practice_count: practice.count ?? 0 }
    }
    if (flags.show_composed_tunes_on_profile) featuredTunes = (checked(await db.from('pieces').select(identityColumns).eq('composer_user_id', flags.id).order('title').order('id').limit(3)) ?? []) as unknown as Piece[]
    if (!query.preview && (owner || isAcceptedFriend) && flags.show_comment_activity) {
      activity = checked(await db.from('user_activity_events').select('id,event_type,created_at,piece_id').eq('user_id', flags.id).in('event_type', ['piece_created','piece_details_added','piece_lore_added','piece_media_link_added','piece_sheet_music_link_added']).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(3)) ?? []
      const ids = activity.flatMap(event => event.piece_id ? [event.piece_id] : [])
      const pieces = ids.length ? checked(await db.from('pieces').select('id,title').in('id', ids)) ?? [] : []
      activity = activity.map(event => ({...event, title: pieces.find(piece => piece.id === event.piece_id)?.title}))
    }
  }
  if ((query.tab === 'overview' || query.tab === 'lists') && flags.show_public_lists_on_profile) {
    let read = db.from('learning_lists').select('id,name,description,visibility,learning_list_items(count)').eq('user_id', flags.id).eq('visibility', 'public')
    if (query.tab === 'lists' && query.q) read = read.ilike('name', profileSearchPattern(query.q))
    const rows = checked(await read.order('name').order('id').range(query.tab === 'overview' ? 0 : start, query.tab === 'overview' ? 2 : start + PROFILE_PAGE_SIZE)) ?? []
    hasNext = rows.length > PROFILE_PAGE_SIZE
    publicLists = rows.slice(0, PROFILE_PAGE_SIZE).map(row => ({ id: row.id, name: row.name, description: row.description, visibility: row.visibility, tune_count: row.learning_list_items?.[0]?.count ?? 0 }))
  }
  if (query.tab === 'repertoire') {
    if (query.group === 'composed' && flags.show_composed_tunes_on_profile) {
      let read = db.from('pieces').select(identityColumns).eq('composer_user_id', flags.id)
      if (query.q) read = read.ilike('title', profileSearchPattern(query.q))
      tunes = (checked(await read.order('title').order('id').range(start, start + PROFILE_PAGE_SIZE)) ?? []) as unknown as Piece[]
    } else if (query.group !== 'composed' && canViewFullRepertoire) tunes = await repertoirePage(db, flags.id, query)
    hasNext = tunes.length > PROFILE_PAGE_SIZE
    tunes = tunes.slice(0, PROFILE_PAGE_SIZE)
    if (viewerId && !owner && canViewFullRepertoire && tunes.length) {
      const ids = tunes.map(t => t.id)
      const [known, practice] = await Promise.all([
        db.from('user_known_pieces').select('piece_id').eq('user_id', viewerId).in('piece_id', ids),
        db.from('user_pieces').select('piece_id').eq('user_id', viewerId).eq('status','learning').in('piece_id', ids),
      ])
      overlap = new Set([...(checked(known) ?? []), ...(checked(practice) ?? [])].map(row => row.piece_id)).size
    }
  }
  if (query.tab === 'badges' || query.tab === 'overview') {
    const limit = query.tab === 'overview' ? 2 : 10
    const offset = query.tab === 'overview' ? 0 : (query.page - 1) * limit
    let created = db.from('badges').select('id,name,slug,category,description,created_at,badge_awards(count)').eq('owner_user_id', flags.id).eq('visibility','public')
    let received = db.from('badge_awards').select('id,awarded_at,awarded_by_user_id,badges!inner(id,name,slug,category,description,owner_user_id)').eq('recipient_user_id',flags.id).eq('badges.visibility','public')
    if (query.tab === 'badges' && query.q) { created = created.ilike('name',profileSearchPattern(query.q)); received = received.ilike('badges.name',profileSearchPattern(query.q)) }
    const [createdResult, receivedResult] = await Promise.all([created.order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+limit),received.order('awarded_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+limit)])
    const c = checked(createdResult) ?? []; const r = checked(receivedResult) ?? []
    if (query.tab === 'badges') hasNext = c.length > limit || r.length > limit
    createdBadges = c.slice(0,limit).map(row => ({...row, recipient_count:row.badge_awards?.[0]?.count ?? 0})) as PublicProfileCreatedBadge[]
    const awards = r.slice(0,limit)
    const awarderIds = [...new Set(awards.map(row => row.awarded_by_user_id))]
    const awarders = awarderIds.length ? checked(await db.from('profiles').select('id,username,display_name').eq('show_identity',true).in('id',awarderIds)) ?? [] : []
    receivedBadges = awards.map(row => ({award_id:row.id,awarded_at:row.awarded_at,badge:Array.isArray(row.badges) ? row.badges[0] : row.badges,awarded_by_profile:awarders.find(p => p.id === row.awarded_by_user_id) ?? null})) as PublicProfileReceivedBadge[]
  }
  return { viewerId, profile, isOwnProfile, owner, isAcceptedFriend, canViewFullRepertoire, canCompare, compareBlockedByFriendship:Boolean(flags.show_compare_discoverability && flags.compare_requires_friend && !owner && !isAcceptedFriend), hasPendingOutgoingRequest:connection?.status === 'pending' && connection.requester_id === viewerId, hasPendingIncomingRequest:connection?.status === 'pending' && connection.requester_id !== viewerId, pendingIncomingConnectionId:connection?.status === 'pending' && connection.requester_id !== viewerId ? connection.id : null, instruments, publicLists, tunes, featuredTunes, sharedTunes, createdBadges, receivedBadges, summary, activity, overlap, hasNext }
}
