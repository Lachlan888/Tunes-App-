import Link from 'next/link'
import { notFound } from 'next/navigation'
import PublicProfileActions from '@/components/profile/PublicProfileActions'
import PublicProfileBadgesSection from '@/components/profile/PublicProfileBadgesSection'
import PublicProfileHeader from '@/components/profile/PublicProfileHeader'
import PublicProfileOverview from '@/components/profile/PublicProfileOverview'
import TuneRow from '@/components/tunes/TuneRow'
import { loadPublicProfileData } from '@/lib/loaders/profile-public'
import { parseProfileQuery, profileHref, PROFILE_TABS } from '@/lib/profile-navigation'

function getFriendRequestMessage(status?: string) {
  if (status === "sent") {
    return {
      tone: "success" as const,
      text: "Friend request sent.",
    }
  }

  if (status === "missing_user") {
    return {
      tone: "warning" as const,
      text: "Couldn’t tell which person to send the request to.",
    }
  }

  if (status === "self") {
    return {
      tone: "warning" as const,
      text: "You cannot send a friend request to yourself.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That person couldn’t be found.",
    }
  }

  if (status === "duplicate") {
    return {
      tone: "neutral" as const,
      text: "A pending or accepted connection already exists with that person.",
    }
  }

  return null
}

function getFriendAcceptMessage(status?: string) {
  if (status === "accepted") {
    return {
      tone: "success" as const,
      text: "Friend request accepted.",
    }
  }

  if (status === "missing_connection") {
    return {
      tone: "warning" as const,
      text: "Couldn’t tell which friend request to accept.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That friend request could not be found.",
    }
  }

  if (status === "forbidden") {
    return {
      tone: "error" as const,
      text: "You are not allowed to accept that request.",
    }
  }

  if (status === "invalid_status") {
    return {
      tone: "warning" as const,
      text: "That request is no longer pending.",
    }
  }

  return null
}

function getDirectMessageMessage(status?: string) {
  if (status === "sent") {
    return {
      tone: "success" as const,
      text: "Message sent.",
    }
  }

  if (status === "missing_user") {
    return {
      tone: "warning" as const,
      text: "Couldn’t tell which person to message.",
    }
  }

  if (status === "missing_body") {
    return {
      tone: "warning" as const,
      text: "Write a message before sending.",
    }
  }

  if (status === "self") {
    return {
      tone: "warning" as const,
      text: "You cannot send a direct message to yourself.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That person couldn’t be found.",
    }
  }

  return null
}

function getListAddMessage(status?: string) {
  if (status === "success") {
    return {
      tone: "success" as const,
      text: "Tune added to your list.",
    }
  }

  if (status === "duplicate") {
    return {
      tone: "neutral" as const,
      text: "That tune is already in the selected list.",
    }
  }

  return null
}

function getMessageClasses(
  tone: "success" | "warning" | "error" | "neutral"
) {
  if (tone === "success") {
    return "mb-6 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "warning") {
    return "mb-6 rounded-2xl border border-warning bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "error") {
    return "mb-6 rounded-2xl border border-destructive bg-muted p-4 text-sm font-medium text-destructive shadow-sm"
  }

  return "mb-6 rounded-2xl border border-border bg-muted p-4 text-sm font-medium text-muted-foreground shadow-sm"
}


export default async function PublicProfilePage({ params, searchParams }: {
  params: Promise<{ username: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { username } = await params
  const search = await searchParams ?? {}
  const query = parseProfileQuery(search)
  const data = await loadPublicProfileData(username, query)
  if (!data) notFound()
  const { profile, isOwnProfile, owner } = data
  const href = (changes = {}) => profileHref(username, query, changes)
  const displayName = profile.show_identity ? profile.display_name || profile.username : 'This musician'
  const notices = [getFriendRequestMessage(String(search.friend_request ?? '')), getFriendAcceptMessage(String(search.friend_accept ?? '')), getDirectMessageMessage(String(search.direct_message ?? '')), getListAddMessage(String(search.list_add ?? ''))].filter(Boolean)
  const inventoryVisible = query.group === 'composed' ? profile.show_composed_tunes_on_profile : data.canViewFullRepertoire
  return <main className="mx-auto max-w-6xl min-w-0 space-y-5 px-4 py-5 sm:px-6 md:py-8">
    {notices.map((notice, i) => notice && <p role="status" key={i} className={getMessageClasses(notice.tone)}>{notice.text}</p>)}
    <PublicProfileHeader profile={profile} isOwnProfile={false} />
    {owner && <div className="flex flex-wrap gap-4 text-sm">
      <Link className="underline" href="/dashboard?section=profile">Edit Profile</Link>
      <Link className="underline" href={href({ preview: !query.preview, page: 1 })}>{query.preview ? 'Return to my profile' : 'Preview public profile'}</Link>
      {query.preview && <p role="status">Public preview · private repertoire and friend activity are hidden.</p>}
    </div>}
    <nav aria-label="Profile views" className="flex gap-1 overflow-x-auto border-b border-border">
      {PROFILE_TABS.map(tab => <Link key={tab} aria-current={query.tab === tab ? 'page' : undefined} href={href({tab, page:1, q:''})} className={`min-h-11 px-3 py-3 text-sm font-semibold capitalize ${query.tab === tab ? 'border-b-2 border-action-primary text-text-primary' : 'text-text-muted'}`}>{tab}</Link>)}
    </nav>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-6">
        {query.tab === 'overview' ? <>
          <PublicProfileOverview profile={profile} instruments={data.instruments} publicLists={data.publicLists} repertoireSummary={data.summary} isOwnProfile={isOwnProfile} listsHref={href({tab:'lists',page:1,q:''})} />
          {data.featuredTunes.length > 0 && <section><h2 className="font-semibold">Composed tunes</h2><div className="divide-y divide-border">{data.featuredTunes.map(tune => <TuneRow key={tune.id} piece={tune} />)}</div><Link className="text-sm underline" href={href({tab:'repertoire',group:'composed',page:1})}>Browse composed tunes</Link></section>}
          {data.activity.length > 0 && <section><h2 className="font-semibold">Recent musical contributions</h2><ul className="divide-y divide-border">{data.activity.map(event => <li key={event.id} className="py-3 text-sm">{({piece_created:'Added a tune',piece_details_added:'Added tune details',piece_lore_added:'Shared tune lore',piece_media_link_added:'Shared a recording',piece_sheet_music_link_added:'Shared sheet music'} as Record<string,string>)[event.event_type]}{event.title && event.piece_id && <> · <Link className="underline" href={`/library/${event.piece_id}`}>{event.title}</Link></>} <time className="text-text-muted" dateTime={event.created_at}>· {event.created_at.slice(0,10)}</time></li>)}</ul></section>}
          {data.sharedTunes.length > 0 && <section><h2 className="font-semibold">A few tunes you share</h2><div className="divide-y divide-border">{data.sharedTunes.map(tune => <TuneRow key={tune.id} piece={tune} />)}</div><Link className="text-sm underline" href={href({tab:'repertoire',page:1,q:''})}>Browse their repertoire</Link></section>}
          {data.canCompare && <Link className="inline-block underline" href={`/compare?user=${encodeURIComponent(username)}`}>Find tunes you can play together</Link>}
          {(data.createdBadges.length > 0 || data.receivedBadges.length > 0) && <><PublicProfileBadgesSection createdBadges={data.createdBadges} receivedBadges={data.receivedBadges} isOwnProfile={isOwnProfile} displayName={displayName} /><Link className="block text-sm underline" href={href({tab:'badges',page:1})}>Browse all public badges</Link></>}
        </> : <>
          <h2 className="text-xl font-semibold capitalize">{query.tab}</h2>
          <form action={`/users/${encodeURIComponent(username)}`} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="tab" value={query.tab} />
            {query.preview && <input type="hidden" name="preview" value="public" />}
            <label className="min-w-0 flex-1 text-sm">Search {query.tab}<input name="q" defaultValue={query.q} maxLength={100} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5" /></label>
            {query.tab === 'repertoire' && <label className="text-sm">Collection<select name="group" defaultValue={query.group} className="mt-1 block rounded-xl border border-border bg-surface px-3 py-2.5"><option value="known">Known</option><option value="practice">In practice</option><option value="composed">Composed</option></select></label>}
            <button className="min-h-11 rounded-xl border border-border px-4" type="submit">Apply</button>
          </form>
          {query.tab === 'repertoire' && <>
            {!inventoryVisible ? <p className="text-sm text-text-muted">This collection is not shared with this view.</p> : <>
              {isOwnProfile && !profile.show_repertoire_to_friends && query.group !== 'composed' && <p className="text-sm text-text-muted">Only you can browse this repertoire here. Sharing with friends is off.</p>}
              {data.overlap !== null && <p className="text-sm">You share {data.overlap} of the tunes on this page.</p>}
              <div className="divide-y divide-border">{data.tunes.map(tune => <TuneRow key={tune.id} piece={tune} personalState={query.group === 'composed' ? 'Composed' : query.group === 'practice' ? 'In practice' : 'Known'} />)}</div>
              {!data.tunes.length && <p>No matching tunes. Try another search or collection.</p>}
            </>}
          </>}
          {query.tab === 'lists' && <>
            <p className="text-sm text-text-muted">Public lists shared by this musician.</p>
            <ul className="divide-y divide-border">{data.publicLists.map(list => <li key={list.id} className="py-4"><Link className="font-semibold underline" href={`/public-lists/${list.id}`}>{list.name}</Link><p className="line-clamp-2 text-sm text-text-muted">{list.description}</p><p className="mt-1 text-sm">{list.tune_count} tunes</p></li>)}</ul>
            {!data.publicLists.length && <p>No matching public lists shared here.</p>}
          </>}
          {query.tab === 'badges' && <PublicProfileBadgesSection createdBadges={data.createdBadges} receivedBadges={data.receivedBadges} isOwnProfile={isOwnProfile} displayName={displayName} />}
          <nav aria-label="Collection pages" className="flex min-h-11 items-center justify-between gap-3 border-t border-border pt-3">
            {query.page > 1 ? <Link className="p-2 underline" href={href({page:query.page-1})}>Previous</Link> : <span />}
            <span className="text-sm">Page {query.page}</span>
            {data.hasNext ? <Link className="p-2 underline" href={href({page:query.page+1})}>Next</Link> : <span />}
          </nav>
        </>}
      </div>
      {!query.preview && <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start"><PublicProfileActions viewerId={data.viewerId} username={username} profileUserId={profile.id} redirectTo={href()} isOwnProfile={isOwnProfile} isAcceptedFriend={data.isAcceptedFriend} hasPendingOutgoingRequest={data.hasPendingOutgoingRequest} hasPendingIncomingRequest={data.hasPendingIncomingRequest} pendingIncomingConnectionId={data.pendingIncomingConnectionId} canCompare={data.canCompare} compareBlockedByFriendship={data.compareBlockedByFriendship} showCompareDiscoverability={profile.show_compare_discoverability} /></aside>}
    </div>
  </main>
}
