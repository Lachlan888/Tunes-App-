"use client"

import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import EmptyState from "@/components/EmptyState"
import TuneCard from "@/components/TuneCard"
import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import type {
  LearningList,
  Profile,
  PublicProfileRepertoireTune,
} from "@/lib/types"

type RelationshipFilter =
  | "all"
  | "new_to_me"
  | "known_by_me"
  | "in_my_practice"
  | "in_my_lists"

type PublicProfileRepertoireSectionProps = {
  profile: Profile
  tunes: PublicProfileRepertoireTune[]
  viewerLearningLists: LearningList[]
  viewerId: string | null
  isOwnProfile: boolean
  isAcceptedFriend: boolean
  canViewFullRepertoire: boolean
  redirectTo: string
  addToLearningList: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const activeChipClass =
  "rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition"

const inactiveChipClass =
  "rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"

function getProfileDisplayName(profile: Profile) {
  return profile.display_name || profile.username
}

function getViewerStateLabel(state: PublicProfileRepertoireTune["viewer_state"]) {
  if (state === "known_by_me") return "Known by me"
  if (state === "in_my_practice") return "In my practice"
  if (state === "in_my_lists") return "In my lists"
  return "New to me"
}

function getProfileStateLabel(
  state: PublicProfileRepertoireTune["profile_state"],
  profileName: string
) {
  if (state === "practice") return `${profileName} is practising`
  return `${profileName} knows`
}

function getRelationshipFilterLabel(filter: RelationshipFilter) {
  if (filter === "new_to_me") return "New to me"
  if (filter === "known_by_me") return "Known by me"
  if (filter === "in_my_practice") return "In my practice"
  if (filter === "in_my_lists") return "In my lists"
  return "All their tunes"
}

function matchesSearch(tune: PublicProfileRepertoireTune, query: string) {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return true

  return tune.title.toLowerCase().includes(cleanQuery)
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  ).sort((a, b) => a.localeCompare(b))
}

export default function PublicProfileRepertoireSection({
  profile,
  tunes,
  viewerLearningLists,
  viewerId,
  isOwnProfile,
  isAcceptedFriend,
  canViewFullRepertoire,
  redirectTo,
  addToLearningList,
}: PublicProfileRepertoireSectionProps) {
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("")
  const [selectedTimeSignature, setSelectedTimeSignature] = useState("")
  const [relationshipFilter, setRelationshipFilter] =
    useState<RelationshipFilter>("all")
  const [selectedPiece, setSelectedPiece] =
    useState<PublicProfileRepertoireTune | null>(null)
  const [selectedListId, setSelectedListId] = useState("")

  const profileName = getProfileDisplayName(profile)

  const availableKeys = useMemo(
    () => uniqueSorted(tunes.map((tune) => tune.key)),
    [tunes]
  )

  const availableStyles = useMemo(() => {
    return uniqueSorted(
      tunes.flatMap((tune) => {
        const styleLabels = getStyleLabelsFromPiece(tune)
        return styleLabels.length > 0 ? styleLabels : [tune.style]
      })
    )
  }, [tunes])

  const availableTimeSignatures = useMemo(
    () => uniqueSorted(tunes.map((tune) => tune.time_signature)),
    [tunes]
  )

  const filteredTunes = useMemo(() => {
    return tunes.filter((tune) => {
      if (!matchesSearch(tune, query)) return false
      if (selectedKey && tune.key !== selectedKey) return false

      if (
        selectedTimeSignature &&
        tune.time_signature !== selectedTimeSignature
      ) {
        return false
      }

      if (selectedStyle) {
        const styleLabels = getStyleLabelsFromPiece(tune)
        const styleMatches =
          tune.style === selectedStyle || styleLabels.includes(selectedStyle)

        if (!styleMatches) return false
      }

      if (
        relationshipFilter !== "all" &&
        tune.viewer_state !== relationshipFilter
      ) {
        return false
      }

      return true
    })
  }, [
    tunes,
    query,
    selectedKey,
    selectedStyle,
    selectedTimeSignature,
    relationshipFilter,
  ])

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedKey !== "" ||
    selectedStyle !== "" ||
    selectedTimeSignature !== "" ||
    relationshipFilter !== "all"

  function clearFilters() {
    setQuery("")
    setSelectedKey("")
    setSelectedStyle("")
    setSelectedTimeSignature("")
    setRelationshipFilter("all")
  }

  if (!canViewFullRepertoire) {
    if (isOwnProfile) {
      return (
        <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Friend repertoire view
          </p>
          <EmptyState
            title="Your repertoire is hidden from friends"
            description="Turn on “Show repertoire to friends” in Profile settings if you want accepted friends to browse the tunes you know or have in practice."
            primaryActionHref="/dashboard"
            primaryActionLabel="Edit Profile"
            className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
          />
        </section>
      )
    }

    return null
  }

  if (!isOwnProfile && !isAcceptedFriend) {
    return null
  }

  return (
    <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Friend repertoire
          </p>
          <h2 className="mt-2 break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            {isOwnProfile ? "Your repertoire" : `${profileName}’s repertoire`}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {isOwnProfile
              ? profile.show_repertoire_to_friends
                ? "Accepted friends can browse these tunes from your public profile."
                : "You can see this here, but it is hidden from friends until you opt in."
              : "Browse tunes your friend knows or is practising, then add useful ones to one of your own lists."}
          </p>
        </div>

        <span className="w-fit rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground">
          {tunes.length} tune{tunes.length === 1 ? "" : "s"}
        </span>
      </div>

      {tunes.length === 0 ? (
        <EmptyState
          title="No repertoire to show yet"
          description={
            isOwnProfile
              ? "Tunes you mark known or start practising will appear here."
              : "This friend does not have visible known or practice tunes yet."
          }
          className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
        />
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-card p-3 md:mt-6 md:rounded-2xl md:border md:border-border md:bg-muted md:p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(8rem,12rem))]">
              <div>
                <label
                  htmlFor="profile-repertoire-search"
                  className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Search
                </label>
                <input
                  id="profile-repertoire-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className={inputClass}
                  placeholder="Search their tunes"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-repertoire-key"
                  className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Key
                </label>
                <select
                  id="profile-repertoire-key"
                  value={selectedKey}
                  onChange={(event) => setSelectedKey(event.target.value)}
                  className={inputClass}
                >
                  <option value="">All keys</option>
                  {availableKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-repertoire-style"
                  className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Style
                </label>
                <select
                  id="profile-repertoire-style"
                  value={selectedStyle}
                  onChange={(event) => setSelectedStyle(event.target.value)}
                  className={inputClass}
                >
                  <option value="">All styles</option>
                  {availableStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="profile-repertoire-time"
                  className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Time
                </label>
                <select
                  id="profile-repertoire-time"
                  value={selectedTimeSignature}
                  onChange={(event) =>
                    setSelectedTimeSignature(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">All times</option>
                  {availableTimeSignatures.map((timeSignature) => (
                    <option key={timeSignature} value={timeSignature}>
                      {timeSignature}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  "all",
                  "new_to_me",
                  "known_by_me",
                  "in_my_practice",
                  "in_my_lists",
                ] as RelationshipFilter[]
              ).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRelationshipFilter(filter)}
                  className={
                    relationshipFilter === filter
                      ? activeChipClass
                      : inactiveChipClass
                  }
                >
                  {getRelationshipFilterLabel(filter)}
                </button>
              ))}

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Showing {filteredTunes.length} of {tunes.length}
            </span>
          </div>

          {filteredTunes.length === 0 ? (
            <EmptyState
              title="No tunes match these filters"
              description="Try broadening the search, key, style, time, or relationship filter."
              className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
            />
          ) : (
            <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTunes.map((tune) => {
                const canAddToList =
                  Boolean(viewerId) &&
                  !isOwnProfile &&
                  tune.viewer_state === "new_to_me"

                return (
                  <li key={tune.id}>
                    <TuneCard
                      id={tune.id}
                      title={tune.title}
                      keyValue={tune.key}
                      style={tune.style}
                      timeSignature={tune.time_signature}
                      referenceUrl={tune.reference_url}
                      pieceStyles={tune.piece_styles}
                      listNames={tune.viewer_list_names}
                    >
                      <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                        {getProfileStateLabel(tune.profile_state, profileName)}
                      </span>

                      <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                        {getViewerStateLabel(tune.viewer_state)}
                      </span>

                      {canAddToList ? (
                        <button
                          type="button"
                          className={secondaryButtonClass}
                          onClick={() => {
                            setSelectedPiece(tune)
                            setSelectedListId("")
                          }}
                        >
                          Add to list
                        </button>
                      ) : null}
                    </TuneCard>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      {selectedPiece ? (
        <AddToListModal
          selectedPiece={selectedPiece}
          selectedListId={selectedListId}
          learningLists={viewerLearningLists}
          existingListIds={selectedPiece.viewer_list_ids}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedPiece(null)
            setSelectedListId("")
          }}
        />
      ) : null}
    </section>
  )
}
