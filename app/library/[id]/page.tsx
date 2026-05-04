import Link from "next/link"
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

export default async function PiecePage({ params }: PiecePageProps) {
  const { id } = await params
  const tuneDetail = await loadTuneDetailData(id)

  if (tuneDetail.status === "load_error") {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Tune</h1>
        <p className="text-red-600">Could not load tune.</p>
        <div className="mt-4">
          <Link href="/library" className="underline">
            Back to Tunes
          </Link>
        </div>
      </main>
    )
  }

  if (tuneDetail.status === "not_found") {
    return (
      <main className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Tune not found</h1>
        <p className="text-gray-600">
          No tune exists at id {tuneDetail.pieceId}.
        </p>
        <div className="mt-4">
          <Link href="/library" className="underline">
            Back to Tunes
          </Link>
        </div>
      </main>
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

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link href="/library" className="text-sm underline">
          Back to Tunes
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section className="rounded border p-4">
            <h1 className="mb-4 text-3xl font-bold">{typedPiece.title}</h1>

            <div className="space-y-2 text-gray-700">
              <p>Key: {typedPiece.key || "—"}</p>
              <p>Style: {typedPiece.style || "—"}</p>
              <p>Time signature: {typedPiece.time_signature || "—"}</p>
              <p>
                Reference{" "}
                {typedPiece.reference_url ? (
                  <a
                    href={typedPiece.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Open reference
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </section>

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
        </div>

        <div className="space-y-8">
          <section className="rounded border p-4">
            <h2 className="mb-2 text-xl font-semibold">My notes</h2>

            <form action={upsertUserPieceNotes} className="space-y-3">
              <input type="hidden" name="piece_id" value={pieceId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <textarea
                name="notes"
                defaultValue={typedUserPieceMetadata?.notes || ""}
                rows={8}
                placeholder="Add your private notes for this tune"
                className="w-full border p-3"
              />

              <SubmitButton
                label="Save notes"
                pendingLabel="Saving..."
                className="border px-4 py-2"
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

          <section className="rounded border p-4">
            <h2 className="mb-2 text-xl font-semibold">Sheet music / tab</h2>

            <form action={addPieceSheetMusicLink} className="mb-6 space-y-3">
              <input type="hidden" name="piece_id" value={pieceId} />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <input
                name="label"
                placeholder="Label, eg Mandolin tab"
                className="w-full border p-2"
                required
              />

              <input
                name="url"
                type="url"
                placeholder="https://..."
                className="w-full border p-2"
                required
              />

              <SubmitButton
                label="Add sheet music link"
                pendingLabel="Adding..."
                className="border px-4 py-2"
              />
            </form>

            {typedSheetMusicLinks.length > 0 ? (
              <ul className="space-y-3">
                {typedSheetMusicLinks.map((link) => (
                  <li key={link.id} className="border p-3">
                    <p className="mb-1 text-sm text-gray-600">{link.label}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all underline"
                    >
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No sheet music links yet.</p>
            )}
          </section>
        </div>
      </div>

      <section className="mt-8">
        <PieceLoreSection
          pieceId={pieceId}
          loreEntries={typedPieceLoreEntries}
          profileMap={profileMap}
          currentUserId={user.id}
        />
      </section>

      <section className="mt-8 rounded border p-4">
        <PieceCommentsSection
          pieceId={pieceId}
          comments={typedPieceComments}
          profileMap={profileMap}
          currentUserId={user.id}
        />
      </section>
    </main>
  )
}