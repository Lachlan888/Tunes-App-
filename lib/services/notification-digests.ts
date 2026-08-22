import "server-only"

import { canShowActivityForProfile } from "@/lib/loaders/friends"
import { sendTransactionalEmail } from "@/lib/services/email"
import { createAdminClient, getUserEmailForNotificationRecipient } from "@/lib/supabase/admin"
import type { createClient } from "@/lib/supabase/server"
import { loadTuneMediaBundles } from "@/lib/tune-media"
import type { NotificationDigestFrequency } from "@/lib/types"
import { capAndAggregateFriendActivity, categoriseDueTunes, digestContentStart, digestDeliveryEffects, isDigestDue, utcDateKey } from "./digest-logic"
import { buildTunesDigestEmail, hasDigestContent, type DigestLinkItem, type TunesDigest } from "./tunes-digest-template"

type Supabase = Awaited<ReturnType<typeof createClient>>
type Frequency = Exclude<NotificationDigestFrequency, "never">
type Preference = { user_id: string; digest_frequency: NotificationDigestFrequency; digest_include_practice: boolean; digest_include_friends: boolean; digest_include_community: boolean; digest_include_updates: boolean; last_digest_sent_at: string | null }
type CommunityItem = { pieceId: number; title: string; detail: string; mediaUrl: string | null; createdAt: string }
export type NotificationDigestRunSummary = { ok: boolean; usersChecked: number; eligible: number; digestsSent: number; skipped: number; failed: number }
export type TestDigestResult = { ok: boolean; email: string | null; error?: string }

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || (process.env.VERCEL_URL?.trim() ? `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}` : null)
const absoluteUrl = (path: string) => `${getSiteUrl()}${path}`
const joined = <T>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] ?? null : value
const profileLabel = (p?: { display_name: string | null; username: string | null }) => p?.display_name || p?.username || "Someone"
const message = (error: unknown) => error instanceof Error ? error.message : String(error)

async function loadPreferences(supabase: Supabase) {
  const { data, error } = await supabase.from("notification_preferences").select("user_id,digest_frequency,digest_include_practice,digest_include_friends,digest_include_community,digest_include_updates,last_digest_sent_at").eq("email_enabled", true).in("digest_frequency", ["daily", "weekly"])
  if (error) throw new Error(error.message)
  return (data ?? []) as Preference[]
}

async function loadPractice(supabase: Supabase, userId: string, start: string, now: Date): Promise<TunesDigest["practice"]> {
  const [eventResult, queueResult] = await Promise.all([
    supabase.from("practice_events").select("id,practice_day_id,piece_id,counted_as_review,practice_outcome,created_at,pieces(id,title,reference_url),review_events(resulting_stage)").eq("user_id", userId).gte("created_at", start).order("created_at", { ascending: false }).limit(100),
    supabase.from("user_pieces").select("id,piece_id,next_review_due,stage,pieces(id,title,reference_url)").eq("user_id", userId).eq("status", "learning").not("next_review_due", "is", null).lte("next_review_due", new Date(now.getTime() + 3 * 86400000).toISOString()).order("next_review_due").limit(20),
  ])
  if (eventResult.error) throw new Error(eventResult.error.message)
  if (queueResult.error) throw new Error(queueResult.error.message)
  const events = eventResult.data ?? []
  const queue = queueResult.data ?? []
  const pieces = new Map<number, { id: number; title: string; reference_url: string | null }>()
  for (const row of [...events, ...queue]) {
    const piece = joined(row.pieces as never) as { id: number; title: string; reference_url: string | null } | null
    if (piece) pieces.set(piece.id, piece)
  }
  const media = await loadTuneMediaBundles({ supabase: supabase as never, pieces: [...pieces.values()], userId })
  const counts = new Map<number, { count: number; latest: (typeof events)[number] }>()
  for (const event of events) if (event.piece_id) {
    const previous = counts.get(event.piece_id)
    counts.set(event.piece_id, { count: (previous?.count ?? 0) + 1, latest: previous?.latest ?? event })
  }
  const practised: DigestLinkItem[] = [...counts.entries()].slice(0, 5).map(([pieceId, value]) => {
    const stage = joined(value.latest.review_events as never) as { resulting_stage: number | null } | null
    return { label: pieces.get(pieceId)?.title ?? "Untitled tune", url: absoluteUrl(`/library/${pieceId}`), detail: `${value.count} ${value.count === 1 ? "event" : "events"}${stage?.resulting_stage ? ` · Stage ${stage.resulting_stage}` : ""}`, mediaUrl: media.get(pieceId)?.effectiveReference?.url }
  })
  const due = categoriseDueTunes(queue.map((row) => ({ pieceId: row.piece_id, title: (joined(row.pieces as never) as { title: string } | null)?.title ?? "Untitled tune", dueDate: String(row.next_review_due).slice(0, 10), stage: row.stage, mediaUrl: media.get(row.piece_id)?.effectiveReference?.url })), now)
  const mapDue = (items: typeof due.overdue): DigestLinkItem[] => items.map((item) => ({ label: item.title, url: absoluteUrl(`/library/${item.pieceId}`), detail: `Stage ${item.stage ?? "—"} · ${item.dueDate}`, mediaUrl: item.mediaUrl }))
  return { days: new Set(events.map((e) => e.practice_day_id)).size, events: events.length, distinctTunes: counts.size, practised, overdue: mapDue(due.overdue), dueToday: mapDue(due.today), upcoming: mapDue(due.upcoming) }
}

async function loadFriends(supabase: Supabase, userId: string, start: string): Promise<DigestLinkItem[]> {
  const { data: connections, error } = await supabase.from("connections").select("requester_id,addressee_id").eq("status", "accepted").or(`requester_id.eq.${userId},addressee_id.eq.${userId}`).limit(200)
  if (error) throw new Error(error.message)
  const friendIds = (connections ?? []).map((row) => row.requester_id === userId ? row.addressee_id : row.requester_id)
  if (!friendIds.length) return []
  const { data: events, error: eventError } = await supabase.from("user_activity_events").select("id,user_id,event_type,piece_id,learning_list_id,comment_id,metadata,created_at").in("user_id", friendIds).gte("created_at", start).order("created_at", { ascending: false }).limit(40)
  if (eventError) throw new Error(eventError.message)
  const profileIds = [...new Set((events ?? []).map((e) => e.user_id))]
  const pieceIds = [...new Set((events ?? []).map((e) => e.piece_id).filter((id): id is number => Boolean(id)))]
  const profileResult = profileIds.length ? await supabase.from("profiles").select("id,username,display_name,show_repertoire_summary,show_comment_activity,show_public_lists_on_profile").in("id", profileIds) : { data: [] }
  const pieceResult = pieceIds.length ? await supabase.from("pieces").select("id,title").in("id", pieceIds) : { data: [] }
  const profiles = new Map((profileResult.data ?? []).map((p) => [p.id, p]))
  const pieces = new Map((pieceResult.data ?? []).map((p) => [p.id, p.title]))
  const verbs: Record<string, string> = { started_practice: "started practising", tune_reviewed: "reviewed", marked_known: "marked as known", comment_added: "commented on", piece_created: "added", piece_details_added: "added details to", piece_lore_added: "added lore to", piece_media_link_added: "added media to", piece_sheet_music_link_added: "added sheet music to", public_list_created: "created a public list", public_list_updated: "updated a public list", badge_created: "created a badge", badge_awarded: "received a badge" }
  const visible = (events ?? []).filter((event) => canShowActivityForProfile(event as never, profiles.get(event.user_id) as never)).map((event) => ({ ...event, userId: event.user_id, eventType: event.event_type, pieceId: event.piece_id }))
  return capAndAggregateFriendActivity(visible).map((event) => {
    const profile = profiles.get(event.user_id)
    const tune = event.piece_id ? pieces.get(event.piece_id) : null
    return { label: `${profileLabel(profile)} ${verbs[event.event_type] ?? "shared an update"}${tune ? ` ${tune}` : ""}`, url: tune ? absoluteUrl(`/library/${event.piece_id}`) : profile?.username ? absoluteUrl(`/users/${encodeURIComponent(profile.username)}`) : null }
  })
}

async function loadCommunity(supabase: Supabase, start: string): Promise<CommunityItem[]> {
  const [pieceResult, linkResult] = await Promise.all([
    supabase.from("pieces").select("id,title,key,style,reference_url,created_at").gte("created_at", start).order("created_at", { ascending: false }).limit(8),
    supabase.from("piece_media_links").select("piece_id,url,created_at,pieces(id,title,reference_url)").gte("created_at", start).order("created_at", { ascending: false }).limit(8),
  ])
  if (pieceResult.error) throw new Error(pieceResult.error.message)
  if (linkResult.error) throw new Error(linkResult.error.message)
  const items: CommunityItem[] = (pieceResult.data ?? []).map((piece) => ({ pieceId: piece.id, title: piece.title, detail: `New tune${piece.key ? ` · ${piece.key}` : ""}${piece.style ? ` · ${piece.style}` : ""}`, mediaUrl: piece.reference_url, createdAt: piece.created_at }))
  for (const link of linkResult.data ?? []) {
    if (items.some((item) => item.pieceId === link.piece_id)) continue
    const piece = joined(link.pieces as never) as { title: string; reference_url: string | null } | null
    if (piece) items.push({ pieceId: link.piece_id, title: piece.title, detail: "New public reference media", mediaUrl: link.url || piece.reference_url, createdAt: link.created_at })
  }
  return items.sort((a, b) => Number(Boolean(b.mediaUrl)) - Number(Boolean(a.mediaUrl)) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
}

async function loadUpdates(supabase: Supabase, userId: string, start: string) {
  const { data, error } = await supabase.from("user_notifications").select("id,notification_type,body_preview").eq("recipient_user_id", userId).in("notification_type", ["comment_reply", "activity_reply", "badge_awarded"]).gte("created_at", start).is("digest_email_sent_at", null).order("created_at", { ascending: false }).limit(20)
  if (error) throw new Error(error.message)
  const fallbacks: Record<string, string> = { comment_reply: "New reply to your comment", activity_reply: "New reply to your activity", badge_awarded: "You received a badge" }
  return (data ?? []).map((row) => ({ id: row.id, item: { label: row.body_preview || fallbacks[row.notification_type] || "New update", url: absoluteUrl("/inbox") } }))
}

async function writeDeliveryLog(supabase: Supabase, values: Record<string, unknown>) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { data, error } = await supabase.from("email_delivery_log").insert(values).select("id").single()
    if (!error && data) return data.id as number
    if (attempt === 2) throw new Error(error?.message ?? "Delivery log write failed")
  }
  throw new Error("Delivery log write failed")
}

async function recordSuccessfulCadence(supabase: Supabase, userId: string, sentAt: string) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const { error } = await supabase.from("notification_preferences").update({ last_digest_sent_at: sentAt, updated_at: sentAt }).eq("user_id", userId)
    if (!error) return
    if (attempt === 2) throw new Error(error.message)
  }
}

async function processUser(supabase: Supabase, preference: Preference, communityCache: Map<Frequency, CommunityItem[]>, now: Date, testSend = false, recipientEmail?: string) {
  const effects = digestDeliveryEffects(testSend)
  const frequency = preference.digest_frequency as Frequency
  const startDate = digestContentStart(frequency, now)
  const [practice, friends, updates] = await Promise.all([
    preference.digest_include_practice ? loadPractice(supabase, preference.user_id, startDate.toISOString(), now) : undefined,
    preference.digest_include_friends ? loadFriends(supabase, preference.user_id, startDate.toISOString()) : undefined,
    preference.digest_include_updates ? loadUpdates(supabase, preference.user_id, startDate.toISOString()) : [],
  ])
  const community = preference.digest_include_community ? communityCache.get(frequency) ?? [] : []
  const digest: TunesDigest = { frequency, periodLabel: `${utcDateKey(startDate)} to ${utcDateKey(now)}`, practice, friends, community: community.map((item) => ({ label: item.title, detail: item.detail, url: absoluteUrl(`/library/${item.pieceId}`), mediaUrl: item.mediaUrl })), updates: updates.map((update) => update.item) }
  if (!testSend && !hasDigestContent(digest)) return "skipped" as const
  const to = recipientEmail ?? await getUserEmailForNotificationRecipient(preference.user_id)
  if (!to) return "skipped" as const
  const template = buildTunesDigestEmail({ digest, practiceUrl: absoluteUrl("/review"), preferencesUrl: absoluteUrl("/dashboard?communication_settings=open") })
  try {
    const result = await sendTransactionalEmail({ to, ...template })
    const sentAt = new Date().toISOString()
    const providerMessageId = result && typeof result === "object" && "messageId" in result ? String(result.messageId) : null
    const logId = await writeDeliveryLog(supabase, { notification_id: null, recipient_user_id: preference.user_id, notification_type: "notification_digest", template_key: `${frequency}_tunes_digest${testSend ? "_dev_test" : ""}`, to_email: to, status: "sent", provider: "brevo", provider_message_id: providerMessageId, created_at: sentAt, sent_at: sentAt })
    if (effects.updateLastDigestSentAt) {
      await recordSuccessfulCadence(supabase, preference.user_id, sentAt)
    }
    if (effects.markNotificationsSent && updates.length) {
      const { error } = await supabase.from("user_notifications").update({ digest_email_sent_at: sentAt, digest_email_log_id: logId }).in("id", updates.map((update) => update.id))
      if (error) console.error("Digest sent but notification markers failed:", { recipientUserId: preference.user_id, error })
    }
    return "sent" as const
  } catch (error) {
    await supabase.from("email_delivery_log").insert({ notification_id: null, recipient_user_id: preference.user_id, notification_type: "notification_digest", template_key: `${frequency}_tunes_digest${testSend ? "_dev_test" : ""}`, to_email: to, status: "failed", provider: "brevo", error_message: message(error) })
    console.error("Tunes digest failed:", { recipientUserId: preference.user_id, frequency, error })
    return "failed" as const
  }
}

export async function sendTestNotificationDigest(userId: string): Promise<TestDigestResult> {
  if (!getSiteUrl()) return { ok: false, email: null, error: "The site URL is not configured." }
  const supabase = createAdminClient() as unknown as Supabase
  const { data, error } = await supabase.from("notification_preferences").select("user_id,digest_frequency,digest_include_practice,digest_include_friends,digest_include_community,digest_include_updates,last_digest_sent_at").eq("user_id", userId).maybeSingle()
  if (error) return { ok: false, email: null, error: "Could not load digest preferences." }
  const preference: Preference = data ? data as Preference : { user_id: userId, digest_frequency: "weekly", digest_include_practice: true, digest_include_friends: true, digest_include_community: true, digest_include_updates: true, last_digest_sent_at: null }
  if (preference.digest_frequency === "never") preference.digest_frequency = "weekly"
  const frequency = preference.digest_frequency as Frequency
  let email: string | null = null
  try {
    email = await getUserEmailForNotificationRecipient(userId)
    if (!email) return { ok: false, email: null, error: "Your account does not have an email address." }
    const community = preference.digest_include_community ? await loadCommunity(supabase, digestContentStart(frequency, new Date()).toISOString()) : []
    const result = await processUser(supabase, preference, new Map([[frequency, community]]), new Date(), true, email)
    return result === "sent" ? { ok: true, email } : { ok: false, email, error: "The test digest could not be sent." }
  } catch (error) {
    console.error("Developer test digest failed:", { userId, error })
    return { ok: false, email, error: "The test digest could not be sent." }
  }
}

export async function processNotificationDigests(now = new Date()): Promise<NotificationDigestRunSummary> {
  if (!getSiteUrl()) throw new Error("NEXT_PUBLIC_SITE_URL or VERCEL_URL is required for digest links")
  const supabase = createAdminClient() as unknown as Supabase
  const preferences = await loadPreferences(supabase)
  const due = preferences.filter((preference) => isDigestDue({ frequency: preference.digest_frequency, lastSentAt: preference.last_digest_sent_at, now }))
  const frequencies = [...new Set(due.filter((p) => p.digest_include_community).map((p) => p.digest_frequency as Frequency))]
  const communityCache = new Map<Frequency, CommunityItem[]>()
  await Promise.all(frequencies.map(async (frequency) => communityCache.set(frequency, await loadCommunity(supabase, digestContentStart(frequency, now).toISOString()))))
  const summary: NotificationDigestRunSummary = { ok: true, usersChecked: preferences.length, eligible: due.length, digestsSent: 0, skipped: preferences.length - due.length, failed: 0 }
  for (const preference of due) {
    try {
      const result = await processUser(supabase, preference, communityCache, now)
      if (result === "sent") summary.digestsSent += 1
      else if (result === "failed") summary.failed += 1
      else summary.skipped += 1
    } catch (error) {
      summary.failed += 1
      console.error("Digest recipient processing failed:", { recipientUserId: preference.user_id, error })
    }
  }
  summary.ok = summary.failed === 0
  return summary
}
