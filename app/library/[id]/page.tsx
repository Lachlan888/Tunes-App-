import Link from "next/link"
import type { ReactNode } from "react"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import PieceMediaLinksSection from "@/components/library/PieceMediaLinksSection"
import SubmitButton from "@/components/SubmitButton"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { upsertUserPieceNotes } from "@/lib/actions/user-piece-metadata"
import {
  addPieceMediaLink,
  addPieceSheetMusicLink,
} from "@/lib/actions/piece-links"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"

type PiecePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    edit_request?: string | string[]
    comment_report?: string | string[]
    lore_report?: string | string[]
    lore?: string | string[]
    moderator_edit?: string | string[]
  }>
}

function DetailErrorShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <div className="mt-4 text-sm text-muted-foreground">{children}</div>
        <div className="mt-5">
          <Link
            href="/library"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to Tunes
          </Link>
        </div>
      </section>
    </main>
  )
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getStatusMessage({
  editRequest,
  commentReport,
  loreReport,
  lore,
  moderatorEdit,
}: {
  editRequest: string
  commentReport: string
  loreReport: string
  lore: string
  moderatorEdit: string
}) {
  if (editRequest === "success") return "Edit request submitted."
  if (editRequest === "empty") return "Add at least one proposed change."
  if (editRequest === "invalid_key") return "That key is not valid."
  if (editRequest === "invalid_url") return "That reference URL is not valid."
  if (editRequest === "error") return "Could not submit edit request."

  if (commentReport === "success") return "Comment report submitted."
  if (commentReport === "invalid_reason") return "Choose a report reason."
  if (commentReport === "own_comment") return "You cannot report your own comment."
  if (commentReport === "already_hidden") return "That comment is already hidden."
  if (commentReport === "error") return "Could not submit comment report."

  if (loreReport === "success") return "Lore report submitted."
  if (loreReport === "invalid_reason") return "Choose a lore report reason."
  if (loreReport === "own_entry") return "You cannot report your own lore entry."
  if (loreReport === "entry_not_found") return "That lore entry could not be found."
  if (loreReport === "error") return "Could not submit lore report."

  if (lore === "updated") return "Lore entry updated."
  if (lore === "invalid_category") return "Choose a valid lore category."
  if (lore === "missing_text") return "Lore entry text is required."
  if (lore === "error") return "Could not update lore entry."

  if (moderatorEdit === "success") return "Canonical tune details updated."
  if (moderatorEdit === "missing_title") return "Title is required."
  if (moderatorEdit === "invalid_key") return "That key is not valid."
  if (moderatorEdit === "invalid_url") return "That reference URL is not valid."
  if (moderatorEdit === "error") return "Could not save canonical details."

  return null
}

export default async function PiecePage({
  params,
  searchParams,
}: PiecePageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const tuneDetail = await loadTuneDetailData(id)

  if (tuneDetail.status === "load_error") {
    return (
      <DetailErrorShell title="Tune">
        <p className="text-destructive">Could not load tune.</p>
      </DetailErrorShell>
    )
  }

  if (tuneDetail.status === "not_found") {
    return (
      <DetailErrorShell title="Tune not found">
        <p>No tune exists at id {tuneDetail.pieceId}.</p>
      </DetailErrorShell>
    )
  }

  const {
    user,
    currentUserRole,
    pieceId,
    redirectTo,
    typedPiece,
    typedUserPieceMetadata,
    typedSheetMusicLinks,
    typedMediaLinks,
    typedPieceComments,
    typedPieceLoreEntries,
    typedUserPiece,
    typedUserKnownPiece,
    typedLearningLists,
    typedLearningListItems,
    styleOptions,
    profileMap,
  } = tuneDetail

  const statusMessage = getStatusMessage({
    editRequest: getSingleValue(resolvedSearchParams?.edit_request),
    commentReport: getSingleValue(resolvedSearchParams?.comment_report),
    loreReport: getSingleValue(resolvedSearchParams?.lore_report),
    lore: getSingleValue(resolvedSearchParams?.lore),
    moderatorEdit: getSingleValue(resolvedSearchParams?.moderator_edit),
  })

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href="/library"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Tunes
        </Link>
      </div>

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="max-w-5xl font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
          {typedPiece.title}
        </h1>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="space-y-8">
          <TuneDetailActions
            piece={typedPiece}
            userPiece={typedUserPiece}
            userKnownPiece={typedUserKnownPiece}
            learningLists={typedLearningLists}
            learningListItems={typedLearningListItems}
            redirectTo={redirectTo}
            startLearning={startLearning}
            addToLearningList={addToLearningList}
          />

          <TuneCanonicalDetailsCard
            piece={typedPiece}
            redirectTo={redirectTo}
            styleOptions={styleOptions}
            currentUserRole={currentUserRole}
          />
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              My notes
            </h2>

            <form action={upsertUserPieceNotes} className="mt-5 space-y-3">
              <input type="hidden" name="piece_id" value={pieceId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <textarea
                name="notes"
                defaultValue={typedUserPieceMetadata?.notes || ""}
                rows={8}
                placeholder="Add your private notes for this tune"
                className={inputClassName}
              />

              <SubmitButton
                label="Save notes"
                pendingLabel="Saving..."
                className={buttonStyles.primary}
              />
            </form>
          </section>

          <PieceMediaLinksSection
            pieceId={pieceId}
            redirectTo={redirectTo}
            mediaLinks={typedMediaLinks}
            referenceUrl={typedPiece.reference_url}
            referenceTitle={typedPiece.title}
            addPieceMediaLink={addPieceMediaLink}
          />

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sheet music / tab
            </h2>

            <form action={addPieceSheetMusicLink} className="mt-5 space-y-3">
              <input type="hidden" name="piece_id" value={pieceId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <input
                name="label"
                placeholder="Label, eg Mandolin tab"
                className={inputClassName}
                required
              />

              <input
                name="url"
                type="url"
                placeholder="https://..."
                className={inputClassName}
                required
              />

              <SubmitButton
                label="Add sheet music link"
                pendingLabel="Adding..."
                className={buttonStyles.primary}
              />
            </form>

            {typedSheetMusicLinks.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {typedSheetMusicLinks.map((link) => (
                  <li
                    key={link.id}
                    className="rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {link.label}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                No sheet music links yet.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-8 xl:col-span-2 2xl:col-span-1">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <PieceLoreSection
              pieceId={pieceId}
              loreEntries={typedPieceLoreEntries}
              profileMap={profileMap}
              currentUserId={user.id}
              currentUserRole={currentUserRole}
            />
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <PieceCommentsSection
              pieceId={pieceId}
              comments={typedPieceComments}
              profileMap={profileMap}
              currentUserId={user.id}
            />
          </section>
        </div>
      </div>
    </main>
  )
}