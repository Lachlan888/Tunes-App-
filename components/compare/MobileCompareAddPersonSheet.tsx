"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import UserIdentityLink from "@/components/UserIdentityLink"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { CompareError, CompareSuggestion } from "@/lib/loaders/compare"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"

type CompareCandidateProfile = ProfileSearchRow | RankedProfileMatch

type MobileCompareAddPersonSheetProps = {
  isOpen: boolean
  onClose: () => void
  compareSuggestions: CompareSuggestion[]
  filterPreservedUsers: string[]
  includePractice: boolean
  matchingProfiles: ProfileSearchRow[]
  searchMatches: RankedProfileMatch[]
  primarySearchValue: string
  redirectTo: string
  error: CompareError
}

function getProfileLabel(profile: {
  username: string | null
  display_name: string | null
}) {
  return profile.display_name || profile.username || "Unnamed player"
}

export default function MobileCompareAddPersonSheet({
  isOpen,
  onClose,
  compareSuggestions,
  filterPreservedUsers,
  includePractice,
  matchingProfiles,
  searchMatches,
  primarySearchValue,
  error,
}: MobileCompareAddPersonSheetProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [pendingValue, setPendingValue] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const candidateProfiles: CompareCandidateProfile[] =
    error === "multiple_matches" ? matchingProfiles : searchMatches

  const visibleSuggestions = useMemo(() => {
    const selected = new Set(
      filterPreservedUsers.map((user) => user.toLowerCase())
    )

    return compareSuggestions.filter(
      (suggestion) => !selected.has(suggestion.username.toLowerCase())
    )
  }, [compareSuggestions, filterPreservedUsers])

  if (!isOpen) {
    return null
  }

  function goToCompareWithUsers(nextUsers: string[], pendingLabel: string) {
    const href = buildCompareHref(nextUsers, { includePractice })
    setPendingValue(pendingLabel)

    startTransition(() => {
      router.push(href)
      onClose()
    })
  }

  function addQuery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()
    if (!trimmedQuery) return

    const existingUsers = filterPreservedUsers.filter(Boolean)

    const nextUsers = existingUsers.some(
      (user) => user.toLowerCase() === trimmedQuery.toLowerCase()
    )
      ? existingUsers
      : [...existingUsers, trimmedQuery]

    goToCompareWithUsers(nextUsers, trimmedQuery)
  }

  function addProfile(profile: CompareCandidateProfile) {
    if (!profile.username) return

    const nextUsers = [
      ...removeUserOnce(filterPreservedUsers, primarySearchValue),
      profile.username,
    ].filter(Boolean)

    goToCompareWithUsers(nextUsers, profile.username)
  }

  function addSuggestion(suggestion: CompareSuggestion) {
    const nextUsers = [...filterPreservedUsers, suggestion.username].filter(
      Boolean
    )

    goToCompareWithUsers(nextUsers, suggestion.username)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-foreground/30"
      role="dialog"
      aria-modal="true"
      aria-label="Add person to compare"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close add person sheet"
        onClick={onClose}
      />

      <section className="relative z-10 flex max-h-[90vh] w-full max-w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl">
        <header className="shrink-0 border-b border-border bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Compare
              </p>

              <h2 className="mt-1 text-xl font-semibold text-foreground">
                Add person
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Close
            </button>
          </div>

          <form onSubmit={addQuery} className="mt-4 flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
              placeholder="Search username or display name"
            />

            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingValue === query.trim() && isPending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoadingSpinner label="Searching..." size="sm" decorative />
                  <span>Searching...</span>
                </span>
              ) : (
                "Search"
              )}
            </button>
          </form>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {error === "user_not_found" ? (
            <p className="mb-5 border-y border-border py-3 text-sm text-muted-foreground">
              No user found for “{primarySearchValue}”.
            </p>
          ) : null}

          {error === "self_compare" ? (
            <p className="mb-5 border-y border-border py-3 text-sm text-muted-foreground">
              You cannot add your own profile to the compare group.
            </p>
          ) : null}

          {candidateProfiles.length > 0 ? (
            <section className="mb-7">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Search results
              </h3>

              <div className="mt-3 divide-y divide-border border-y border-border">
                {candidateProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        <UserIdentityLink
                          username={profile.username}
                          displayName={profile.display_name}
                          fallbackLabel="Unnamed player"
                          className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                        />
                      </p>

                      {profile.username ? (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          @{profile.username}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      disabled={!profile.username || isPending}
                      onClick={() => addProfile(profile)}
                      className="shrink-0 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profile.username &&
                      pendingValue === profile.username &&
                      isPending ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <LoadingSpinner label="Adding..." size="sm" decorative />
                          <span>Adding...</span>
                        </span>
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Friends
            </h3>

            {visibleSuggestions.length > 0 ? (
              <div className="mt-3 divide-y divide-border border-y border-border">
                {visibleSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.user_id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getProfileLabel(suggestion)}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        @{suggestion.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => addSuggestion(suggestion)}
                      className="shrink-0 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingValue === suggestion.username && isPending ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <LoadingSpinner label="Adding..." size="sm" decorative />
                          <span>Adding...</span>
                        </span>
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 border-y border-border py-4 text-sm leading-6 text-muted-foreground">
                No friend suggestions available. Search by username or display
                name to add someone.
              </p>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}
