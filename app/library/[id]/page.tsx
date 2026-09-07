import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import AddToListAction from "@/components/AddToListAction"
import EmptyState from "@/components/EmptyState"
import PendingLinkButton from "@/components/PendingLinkButton"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailPageOptions from "@/components/library/TuneDetailPageOptions"
import TuneDetailViewNav from "@/components/library/TuneDetailViewNav"
import TunePrivateNotesSection from "@/components/library/TunePrivateNotesSection"
import TunePracticeHistorySection from "@/components/practice-diary/TunePracticeHistorySection"
import PracticeProgress from "@/components/practice/PracticeProgress"
import TuneDetailSessionDock from "@/components/session-dock/TuneDetailSessionDock"
import TuneIdentity from "@/components/tunes/TuneIdentity"
import SectionHeader from "@/components/ui/SectionHeader"
import StatusMark, { type StatusTone } from "@/components/ui/StatusMark"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { upsertUserPieceNotes } from "@/lib/actions/user-piece-metadata"
import type {
  PublicTuneListSummary,
  TuneDetailLoadedData,
} from "@/lib/loaders/tune-detail"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"
import {
  APP_TIME_ZONE,
  getOverdueDays,
  isDueExactlyToday,
  isOverdue,
} from "@/lib/review"
import {
  getLoopsForSource,
  getReferenceMediaSources,
  getReferencePracticeHref,
  resolveReferenceMediaSource,
  type TuneMediaSource,
} from "@/lib/tune-media"
import {
  getSingleSearchParamValue,
  getTuneDetailStatusMessage,
} from "@/lib/tune-detail-status"
import {
  getTuneDetailHref,
  resolveTuneDetailView,
  type TuneDetailSearchParam,
} from "@/lib/tune-detail-view"

type PiecePageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    view?: TuneDetailSearchParam
    edit_request?: TuneDetailSearchParam
    comment_report?: TuneDetailSearchParam
    lore_report?: TuneDetailSearchParam
    lore?: TuneDetailSearchParam
    moderator_edit?: TuneDetailSearchParam
    reference_url?: TuneDetailSearchParam
    preferred_reference?: TuneDetailSearchParam
    media_link?: TuneDetailSearchParam
    diary?: TuneDetailSearchParam
    loop?: TuneDetailSearchParam
    list_add?: TuneDetailSearchParam
    create_tune?: TuneDetailSearchParam
  }>
}

const panelClassName =
  "rounded-object bg-surface-paper p-5 shadow-material-rest sm:p-6"

function splitAliases(value: string | null | undefined) {
  return (value ?? "")
    .split(/[;,|]/)
    .map((alias) => alias.trim())
    .filter(Boolean)
}

function getAliases(data: TuneDetailLoadedData) {
  const title = data.typedPiece.title.toLocaleLowerCase()
  const candidates = [
    ...splitAliases(data.typedPiece.alternate_titles),
    ...data.typedPieceLoreEntries
      .filter((entry) => entry.category === "alternate_title")
      .map((entry) => entry.entry_text.trim()),
  ]

  return Array.from(
    new Map(
      candidates
        .filter((alias) => alias && alias.toLocaleLowerCase() !== title)
        .map((alias) => [alias.toLocaleLowerCase(), alias])
    ).values()
  )
}

function getSourceDetails(data: TuneDetailLoadedData) {
  if (data.composerProfile) {
    const name =
      data.composerProfile.display_name ||
      data.composerProfile.username ||
      data.typedPiece.composer ||
      "Linked contributor"

    return {
      source: name,
      confidence: "Linked contributor",
      detail: "The catalogue attribution is linked to a Tunes App profile.",
    }
  }

  if (data.typedPiece.composer) {
    return {
      source: data.typedPiece.composer,
      confidence: "Unverified catalogue attribution",
      detail: "This text attribution is not linked to a contributor profile.",
    }
  }

  const communitySource = data.typedPieceLoreEntries.find(
    (entry) => entry.category === "informant" || entry.category === "collector"
  )

  if (communitySource) {
    const sourceKind =
      communitySource.category === "collector" ? "collector" : "informant"
    return {
      source: `Community ${sourceKind} note`,
      confidence: "Community supplied",
      detail: `${communitySource.entry_text} This source is recorded in community lore and has not been independently verified.`,
    }
  }

  return {
    source: "Source not recorded",
    confidence: "Confidence unknown",
    detail: "No composer, informant, or collector is attached to this tune yet.",
  }
}

function getPersonalState(data: TuneDetailLoadedData) {
  if (data.typedUserPiece) {
    return {
      label: `Already in practice · Stage ${data.typedUserPiece.stage}`,
      tone: "practice" as const,
    }
  }
  if (data.typedUserKnownPiece) return { label: "Known", tone: "known" as const }
  return { label: "Not in practice", tone: "neutral" as const }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded"
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value))
}

function getOutcomeLabel(outcome: string | null | undefined) {
  if (outcome === "failed" || outcome === "rough") return "Rough"
  if (outcome === "shaky") return "Shaky"
  if (outcome === "solid") return "Solid"
  return outcome ? outcome.replaceAll("_", " ") : "No result yet"
}

function getOutcomeTone(outcome: string | null | undefined): StatusTone {
  if (outcome === "failed" || outcome === "rough") return "rough"
  if (outcome === "shaky") return "shaky"
  if (outcome === "solid") return "solid"
  return "neutral"
}

function DetailValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 border-b border-hairline py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-6 text-text-primary">{children}</dd>
    </div>
  )
}

function TunePageOptions({ data, redirectTo }: { data: TuneDetailLoadedData; redirectTo: string }) {
  const hasPersonalRelationship = Boolean(
    data.typedUserPiece || data.typedUserKnownPiece || data.typedLearningListItems.length > 0
  )

  return (
    <TuneDetailPageOptions triggerId={`tune-page-options-${data.pieceId}`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Organisation</p>
        <div className="mt-3">
          <AddToListAction piece={data.typedPiece} learningLists={data.typedLearningLists} learningListItems={data.typedLearningListItems} redirectTo={redirectTo} addToLearningList={addToLearningList} buttonClassName={buttonStyles.secondary} />
        </div>
        <div className="mt-5 border-t border-hairline pt-5">
          <TuneCanonicalDetailsCard piece={data.typedPiece} redirectTo={redirectTo} styleOptions={data.styleOptions} composerProfile={data.composerProfile} composerProfileOptions={data.composerProfileOptions} currentUserRole={data.currentUserRole} variant="mobile" />
        </div>
        {hasPersonalRelationship ? (
          <div className="mt-5 border-t border-action-destructive/35 pt-5">
            <p className="text-sm font-semibold text-text-primary">Remove from my app</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">Removes your personal relationship, not the shared tune record.</p>
            <div className="mt-3">
              <RemoveTuneButton pieceId={data.pieceId} redirectTo={redirectTo} className={buttonStyles.destructiveSecondary} />
            </div>
          </div>
        ) : null}
      </div>
    </TuneDetailPageOptions>
  )
}

function TuneHeader({ data, aliases, redirectTo }: { data: TuneDetailLoadedData; aliases: string[]; redirectTo: string }) {
  const source = getSourceDetails(data)
  const personalState = getPersonalState(data)

  return (
    <header className="rounded-sheet bg-surface-paper p-5 shadow-material-raised sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <TuneIdentity id={data.pieceId} title={data.typedPiece.title} alternateTitles={aliases.join("; ")} tuneType={data.typedPiece.type} style={data.typedPiece.style} tuneKey={data.typedPiece.key} sourceSummary={`${source.source} · ${source.confidence}`} personalState={<StatusMark tone={personalState.tone}>{personalState.label}</StatusMark>} headingLevel="h1" linkTitle={false} headingClassName="break-words font-serif text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl" />
        <TunePageOptions data={data} redirectTo={redirectTo} />
      </div>
    </header>
  )
}

function getDueSummary(data: TuneDetailLoadedData) {
  const due = data.typedUserPiece?.next_review_due
  if (!data.typedUserPiece) return "Starts after you add this tune to Practice"
  if (!due) return "No review scheduled"
  if (isDueExactlyToday(due)) return "Due today"
  if (isOverdue(due)) {
    const days = getOverdueDays(due)
    return `${days} ${days === 1 ? "day" : "days"} overdue`
  }
  return `Due ${formatDate(due)}`
}

function PracticeView({ data, redirectTo }: { data: TuneDetailLoadedData; redirectTo: string }) {
  const latestReview = data.typedReviewHistory[0] ?? null
  const personalState = getPersonalState(data)

  return (
    <div className="space-y-5">
      <section className={panelClassName}>
        <SectionHeader title="Practice" description="Your current stage, schedule and latest result for this tune." actions={<StatusMark tone={personalState.tone}>{personalState.label}</StatusMark>} />
        <dl className="grid gap-x-6 md:grid-cols-3">
          <DetailValue label="Stage">{data.typedUserPiece ? `Stage ${data.typedUserPiece.stage}` : "No active stage"}</DetailValue>
          <DetailValue label="Review schedule">{getDueSummary(data)}</DetailValue>
          <DetailValue label="Last result">
            {latestReview ? <span className="flex flex-wrap items-center gap-2"><StatusMark tone={getOutcomeTone(latestReview.outcome)}>{getOutcomeLabel(latestReview.outcome)}</StatusMark><span>{formatDate(latestReview.created_at)}</span></span> : "No result yet"}
          </DetailValue>
        </dl>
        {data.typedUserPiece ? (
          <>
            <PracticeProgress stage={data.typedUserPiece.stage} className="mt-5 rounded-object bg-surface-note p-4" />
            <PendingLinkButton href="/review#review-queue" label="Open Practice queue" pendingLabel="Opening Practice..." className={`${buttonStyles.practice} mt-5`} />
          </>
        ) : (
          <p className="mt-5 text-sm leading-6 text-text-muted">Use <strong className="text-text-primary">Start Practice</strong> in the session dock to create a review schedule. If it is already active, the dock says <strong className="text-text-primary">Already in practice</strong>.</p>
        )}
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <TunePrivateNotesSection pieceId={data.pieceId} redirectTo={redirectTo} userPieceMetadata={data.typedUserPieceMetadata} upsertUserPieceNotes={upsertUserPieceNotes} />
        <TunePracticeHistorySection notes={data.typedPracticeNotes} reviews={data.typedReviewHistory} />
      </div>
    </div>
  )
}

function getReferenceScope(source: TuneMediaSource, userId: string) {
  if (source.sourceType === "personal-preferred-reference") return "Personal preference"
  if (source.sourceType === "canonical-reference") return "Shared catalogue source"
  return source.createdBy === userId ? "Personal source" : "Community source"
}

function ReferenceView({ data }: { data: TuneDetailLoadedData }) {
  const sources = getReferenceMediaSources(data.tuneMediaBundle)
  const reference = resolveReferenceMediaSource(data.tuneMediaBundle)
  const loops = getLoopsForSource(data.tuneMediaBundle, reference)
  const referenceHref = getReferencePracticeHref(data.pieceId, reference?.id)

  return (
    <section className={panelClassName}>
      <SectionHeader title="Reference" description="The strongest saved source is previewed here; focused playback stays in Reference Mode." />
      {reference ? (
        <div className="rounded-object bg-surface-note p-5">
          <div className="flex flex-wrap items-center gap-2"><StatusMark tone="neutral">{reference.mediaType.replaceAll("-", " ")}</StatusMark><StatusMark tone="social">{getReferenceScope(reference, data.user.id)}</StatusMark></div>
          <h3 className="mt-4 break-words font-serif text-2xl font-semibold text-text-primary">{reference.label}</h3>
          <p className="mt-2 break-words text-sm leading-6 text-text-muted">{reference.notes || (reference.isYouTube ? "Playable video reference" : "Saved external reference")}</p>
          <dl className="mt-5 grid gap-x-6 border-t border-hairline pt-2 sm:grid-cols-3">
            <DetailValue label="Saved passages">{loops.length} {loops.length === 1 ? "passage" : "passages"}</DetailValue>
            <DetailValue label="Reference sources">{sources.length} {sources.length === 1 ? "source" : "sources"}</DetailValue>
            <DetailValue label="Sheet music">{data.tuneMediaBundle.sheetMusic.length} saved</DetailValue>
          </dl>
          <PendingLinkButton href={referenceHref} label="Open Reference Mode" pendingLabel="Opening Reference Mode..." className={`${buttonStyles.primary} mt-5`} />
        </div>
      ) : (
        <EmptyState title="No reference media yet" description="Reference Mode opens with a constructive path to add a recording, video, lesson or source link." primaryActionHref={referenceHref} primaryActionLabel="Open Reference Mode" icon="book" />
      )}
    </section>
  )
}

function getProfileName(publicList: PublicTuneListSummary) {
  const profile = Array.isArray(publicList.profiles) ? publicList.profiles[0] : publicList.profiles
  return profile?.display_name || profile?.username || "Unknown player"
}

function PublicListAppearances({ publicLists }: { publicLists: PublicTuneListSummary[] }) {
  return publicLists.length > 0 ? (
    <ul className="mt-3 flex flex-wrap gap-2">
      {publicLists.map((list) => <li key={list.id}><Link href={`/public-lists/${list.id}`} className="inline-flex min-h-11 max-w-full items-center rounded-pill border border-hairline bg-surface-note px-3 py-2 text-sm font-semibold text-text-primary hover:border-action-primary/45"><span className="truncate">{list.name}</span><span className="ml-2 shrink-0 text-xs text-text-muted">{getProfileName(list)}</span></Link></li>)}
    </ul>
  ) : <p className="mt-2 text-sm text-text-muted">No public-list appearances yet.</p>
}

function CommunitySummary({ data }: { data: TuneDetailLoadedData }) {
  const sourceEntries = data.typedPieceLoreEntries.filter((entry) => entry.category === "informant" || entry.category === "collector" || entry.category === "region" || entry.category === "story_folklore_note")
  const recentComments = data.typedPieceComments.slice(0, 3)

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <div className="rounded-object bg-surface-note p-4">
        <h3 className="font-semibold text-text-primary">Community sources</h3><p className="mt-1 text-sm text-text-muted">Contributor supplied · not independently verified</p>
        {sourceEntries.length > 0 ? <ul className="mt-4 space-y-3">{sourceEntries.map((entry) => <li key={entry.id} className="border-t border-hairline pt-3 first:border-t-0 first:pt-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{entry.category.replaceAll("_", " ")}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-text-primary">{entry.entry_text}</p><p className="mt-1 text-xs text-text-muted">Added by {data.profileMap[entry.user_id]?.displayName || "Unknown player"}</p></li>)}</ul> : <p className="mt-4 text-sm text-text-muted">No source or folklore entries yet.</p>}
      </div>
      <div className="rounded-object bg-surface-note p-4">
        <h3 className="font-semibold text-text-primary">Recent discussion</h3><p className="mt-1 text-sm text-text-muted">Community comments · contributor attributed</p>
        {recentComments.length > 0 ? <ul className="mt-4 space-y-3">{recentComments.map((comment) => <li key={comment.id} className="border-t border-hairline pt-3 first:border-t-0 first:pt-0"><p className="line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-text-primary">{comment.body}</p><p className="mt-1 text-xs text-text-muted">{data.profileMap[comment.user_id]?.displayName || "Unknown player"} · {formatDate(comment.created_at)}</p></li>)}</ul> : <p className="mt-4 text-sm text-text-muted">No comments yet.</p>}
      </div>
    </div>
  )
}

function AboutView({ data, aliases }: { data: TuneDetailLoadedData; aliases: string[] }) {
  const source = getSourceDetails(data)
  const relatedTunes = data.typedPieceLoreEntries.filter((entry) => entry.category === "tune_family")

  return (
    <div className="space-y-5">
      <section className={panelClassName}>
        <SectionHeader title="About" description="Provenance, aliases, related tune notes and secondary catalogue metadata." />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-object bg-surface-note p-4"><h3 className="font-semibold text-text-primary">Provenance</h3><dl className="mt-2"><DetailValue label="Source">{source.source}</DetailValue><DetailValue label="Confidence">{source.confidence}</DetailValue><DetailValue label="Basis">{source.detail}</DetailValue></dl></div>
          <div className="rounded-object bg-surface-note p-4"><h3 className="font-semibold text-text-primary">Catalogue metadata</h3><dl className="mt-2"><DetailValue label="Aliases">{aliases.length > 0 ? aliases.join(" · ") : "No aliases recorded"}</DetailValue><DetailValue label="Related tunes">{relatedTunes.length > 0 ? relatedTunes.map((entry) => entry.entry_text).join(" · ") : "No tune-family links recorded"}</DetailValue><DetailValue label="Time signature">{data.typedPiece.time_signature || "Not recorded"}</DetailValue><DetailValue label="Catalogue record">#{data.pieceId} · added {formatDate(data.typedPiece.created_at)}</DetailValue></dl></div>
        </div>
        <div className="mt-5 border-t border-hairline pt-5"><h3 className="font-semibold text-text-primary">Community</h3><p className="mt-1 text-sm leading-6 text-text-muted">Public lists, source notes and discussion remain attributed to their contributors.</p><PublicListAppearances publicLists={data.typedPublicTuneLists} /><CommunitySummary data={data} /></div>
      </section>
      <details className={panelClassName}>
        <summary className="cursor-pointer text-sm font-semibold text-text-primary">Contribute lore or join the discussion</summary>
        <p className="mt-2 text-sm leading-6 text-text-muted">Contributions are public and keep their author attribution.</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2"><PieceLoreSection pieceId={data.pieceId} loreEntries={data.typedPieceLoreEntries} profileMap={data.profileMap} currentUserId={data.user.id} currentUserRole={data.currentUserRole} /><PieceCommentsSection pieceId={data.pieceId} comments={data.typedPieceComments} profileMap={data.profileMap} currentUserId={data.user.id} /></div>
      </details>
    </div>
  )
}

export default async function PiecePage({ params, searchParams }: PiecePageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const activeView = resolveTuneDetailView(resolvedSearchParams?.view)
  const tuneDetail = await loadTuneDetailData(id, activeView)

  if (tuneDetail.status === "not_found") notFound()
  if (tuneDetail.status === "load_error") throw new Error(`Could not load tune ${tuneDetail.pieceId}`)

  const redirectTo = getTuneDetailHref(tuneDetail.pieceId, activeView)
  const aliases = getAliases(tuneDetail)
  const reference = resolveReferenceMediaSource(tuneDetail.tuneMediaBundle)
  const referenceHref = getReferencePracticeHref(tuneDetail.pieceId, reference?.id)
  const tuneDetailLabel = [tuneDetail.typedPiece.type, tuneDetail.typedPiece.style, tuneDetail.typedPiece.key ? `Key ${tuneDetail.typedPiece.key}` : null].filter(Boolean).join(" · ")
  const statusMessage = getTuneDetailStatusMessage({
    editRequest: getSingleSearchParamValue(resolvedSearchParams?.edit_request), commentReport: getSingleSearchParamValue(resolvedSearchParams?.comment_report), loreReport: getSingleSearchParamValue(resolvedSearchParams?.lore_report), lore: getSingleSearchParamValue(resolvedSearchParams?.lore), moderatorEdit: getSingleSearchParamValue(resolvedSearchParams?.moderator_edit), referenceUrl: getSingleSearchParamValue(resolvedSearchParams?.reference_url), preferredReference: getSingleSearchParamValue(resolvedSearchParams?.preferred_reference), mediaLink: getSingleSearchParamValue(resolvedSearchParams?.media_link), diary: getSingleSearchParamValue(resolvedSearchParams?.diary), loop: getSingleSearchParamValue(resolvedSearchParams?.loop), listAdd: getSingleSearchParamValue(resolvedSearchParams?.list_add), createTune: getSingleSearchParamValue(resolvedSearchParams?.create_tune),
  })

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-5 text-text-primary sm:px-6 sm:py-8">
      <TuneDetailSessionDock pieceId={tuneDetail.pieceId} title={tuneDetail.typedPiece.title} detail={tuneDetailLabel || "Tune detail"} redirectTo={redirectTo} referenceHref={referenceHref} pageOptionsTriggerId={`tune-page-options-${tuneDetail.pieceId}`} isInPractice={Boolean(tuneDetail.typedUserPiece)} practiceStage={tuneDetail.typedUserPiece?.stage ?? null} isKnown={Boolean(tuneDetail.typedUserKnownPiece)} startPractice={startLearning} />
      <Link href="/library" className="inline-flex min-h-11 items-center text-sm font-semibold text-text-muted underline underline-offset-4 hover:text-text-primary">Back to Tunes</Link>
      {statusMessage ? <div className="mt-3 rounded-object bg-surface-note p-4 text-sm font-medium text-text-primary">{statusMessage}</div> : null}
      <div className="mt-3"><TuneHeader data={tuneDetail} aliases={aliases} redirectTo={redirectTo} /></div>
      <div className="mt-4"><TuneDetailViewNav pieceId={tuneDetail.pieceId} activeView={activeView} /></div>
      <div className="mt-5 min-w-0">
        {activeView === "practice" ? <PracticeView data={tuneDetail} redirectTo={redirectTo} /> : null}
        {activeView === "reference" ? <ReferenceView data={tuneDetail} /> : null}
        {activeView === "about" ? <AboutView data={tuneDetail} aliases={aliases} /> : null}
      </div>
    </main>
  )
}
