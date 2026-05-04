import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import {
  addPieceLoreEntry,
  deletePieceLoreEntry,
} from "@/lib/actions/piece-lore"

export type PieceLoreCategory =
  | "region"
  | "informant"
  | "collector"
  | "alternate_title"
  | "tune_family"
  | "story_folklore_note"

export type PieceLoreEntry = {
  id: number
  category: PieceLoreCategory
  entry_text: string
  created_at: string
  user_id: string
}

type LoreAuthor = {
  displayName: string
  username: string | null
}

type PieceLoreSectionProps = {
  pieceId: number
  loreEntries: PieceLoreEntry[]
  profileMap: Record<string, LoreAuthor>
  currentUserId: string
}

const LORE_CATEGORY_OPTIONS: {
  value: PieceLoreCategory
  label: string
}[] = [
  { value: "region", label: "Region" },
  { value: "informant", label: "Informant" },
  { value: "collector", label: "Collector" },
  { value: "alternate_title", label: "Alternate title" },
  { value: "tune_family", label: "Tune family" },
  { value: "story_folklore_note", label: "Story / folklore note" },
]

const LORE_CATEGORY_LABELS: Record<PieceLoreCategory, string> = {
  region: "Region",
  informant: "Informant",
  collector: "Collector",
  alternate_title: "Alternate titles",
  tune_family: "Tune family",
  story_folklore_note: "Story / folklore notes",
}

function groupLoreEntries(entries: PieceLoreEntry[]) {
  return LORE_CATEGORY_OPTIONS.map((category) => ({
    category: category.value,
    label: LORE_CATEGORY_LABELS[category.value],
    entries: entries.filter((entry) => entry.category === category.value),
  })).filter((group) => group.entries.length > 0)
}

export default function PieceLoreSection({
  pieceId,
  loreEntries,
  profileMap,
  currentUserId,
}: PieceLoreSectionProps) {
  const groupedLoreEntries = groupLoreEntries(loreEntries)

  return (
    <section className="rounded border p-4">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold">Sources &amp; Lore</h2>
        <p className="mt-1 text-sm text-gray-600">
          Region, informants, collectors, alternate titles, tune-family notes,
          and folklore from players.
        </p>
      </div>

      <form action={addPieceLoreEntry} className="mb-8 max-w-2xl space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <select name="category" className="w-full rounded border p-2" required>
          {LORE_CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <textarea
          name="entry_text"
          rows={4}
          placeholder="Add a source, alternate title, tune-family note, or bit of folklore"
          className="w-full rounded border p-3"
          required
        />

        <SubmitButton
          label="Add lore entry"
          pendingLabel="Adding..."
          className="border px-4 py-2 text-sm"
        />
      </form>

      {groupedLoreEntries.length > 0 ? (
        <div className="space-y-7">
          {groupedLoreEntries.map((group) => (
            <div key={group.category}>
              <h3 className="mb-3 text-lg font-semibold">{group.label}</h3>

              <ul className="space-y-3">
                {group.entries.map((entry) => {
                  const author = profileMap[entry.user_id] ?? {
                    displayName: "Unknown user",
                    username: null,
                  }

                  const isOwnEntry = entry.user_id === currentUserId

                  return (
                    <li key={entry.id} className="rounded border p-4">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <p className="text-sm text-gray-600">
                          Added by{" "}
                          {author.username ? (
                            <Link
                              href={`/users/${author.username}`}
                              className="underline hover:no-underline"
                            >
                              {author.displayName}
                            </Link>
                          ) : (
                            author.displayName
                          )}
                        </p>

                        {isOwnEntry ? (
                          <form action={deletePieceLoreEntry}>
                            <input
                              type="hidden"
                              name="piece_id"
                              value={pieceId}
                            />
                            <input
                              type="hidden"
                              name="redirect_to"
                              value={`/library/${pieceId}`}
                            />
                            <input
                              type="hidden"
                              name="lore_entry_id"
                              value={entry.id}
                            />

                            <SubmitButton
                              label="Delete"
                              pendingLabel="Deleting..."
                              className="border px-3 py-1 text-xs"
                            />
                          </form>
                        ) : null}
                      </div>

                      <p className="whitespace-pre-wrap text-gray-800">
                        {entry.entry_text}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-700">No sources or lore yet.</p>
      )}
    </section>
  )
}