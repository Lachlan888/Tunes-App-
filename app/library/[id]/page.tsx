import Link from "next/link"
import type { ReactNode } from "react"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import PieceMediaLinksSection from "@/components/library/PieceMediaLinksSection"
import SubmitButton from "@/components/SubmitButton"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
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

export default async function PiecePage({ params }: PiecePageProps) {
  const { id } = await params
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

  const metadataItems = [
    typedPiece.key ? `Key: ${typedPiece.key}` : "Key: —",
    typedPiece.style ? `Style: ${typedPiece.style}` : "Style: —",
    typedPiece.time_signature
      ? `Time: ${typedPiece.time_signature}`
      : "Time: —",
  ]

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

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="max-w-5xl font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
          {typedPiece.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
          {metadataItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-background/70 px-3 py-1"
            >
              {item}
            </span>
          ))}

          {typedPiece.reference_url ? (
            <a
              href={typedPiece.reference_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-background/70 px-3 py-1 underline underline-offset-4 hover:bg-muted hover:text-foreground"
            >
              Reference
            </a>
          ) : null}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,560px)]">
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
          />

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <PieceLoreSection
              pieceId={pieceId}
              loreEntries={typedPieceLoreEntries}
              profileMap={profileMap}
              currentUserId={user.id}
            />
          </section>
        </div>

        <aside className="space-y-8">
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
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <PieceCommentsSection
              pieceId={pieceId}
              comments={typedPieceComments}
              profileMap={profileMap}
              currentUserId={user.id}
            />
          </section>
        </aside>
      </div>
    </main>
  )
}