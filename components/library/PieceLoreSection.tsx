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
  { value: "informant", label: "Source" },
  { value: "collector", label: "Collector" },
  { value: "alternate_title", label: "Alternate title" },
  { value: "tune_family", label: "Tune family" },
  { value: "story_folklore_note", label: "Story / folklore note" },
]

const LORE_CATEGORY_LABELS: Record<PieceLoreCategory, string> = {
  region: "Region",
  informant: "Sources",
  collector: "Collectors",
  alternate_title: "Alternate titles",
  tune_family: "Tune family",
  story_folklore_note: "Story / folklore notes",
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

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
    <div>
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Sources &amp; Lore
        </h3>
      </div>

      <form action={addPieceLoreEntry} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={`/library/${pieceId}`} />

        <select name="category" className={inputClassName} required>
          {LORE_CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <textarea
          name="entry_text"
          rows={4}
          placeholder="Add a source, alternate title, regional note, tune-family link, or bit of folklore"
          className={inputClassName}
          required
        />

        <SubmitButton
          label="Add lore entry"
          pendingLabel="Adding..."
          className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </form>

      {groupedLoreEntries.length > 0 ? (
        <div className="mt-8 space-y-7">
          {groupedLoreEntries.map((group) => (
            <section key={group.category}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </h4>

              <ul className="mt-3 space-y-3">
                {group.entries.map((entry) => {
                  const author = profileMap[entry.user_id] ?? {
                    displayName: "Unknown user",
                    username: null,
                  }

                  const isOwnEntry = entry.user_id === currentUserId

                  return (
                    <li
                      key={entry.id}
                      className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                          {entry.entry_text}
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
                              className="rounded-full border border-destructive bg-background/70 px-3 py-1 text-xs font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                            />
                          </form>
                        ) : null}
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">
                        Added by{" "}
                        {author.username ? (
                          <Link
                            href={`/users/${author.username}`}
                            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                          >
                            {author.displayName}
                          </Link>
                        ) : (
                          author.displayName
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No sources or lore yet.
        </p>
      )}
    </div>
  )
}