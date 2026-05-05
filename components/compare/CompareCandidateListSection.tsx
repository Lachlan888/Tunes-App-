import SubmitButton from "@/components/SubmitButton"
import PendingLinkButton from "@/components/PendingLinkButton"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"

type CompareCandidateProfile = ProfileSearchRow | RankedProfileMatch

type CompareCandidateListSectionProps = {
  title: string
  description: string
  profiles: CompareCandidateProfile[]
  primarySearchValue: string
  filterPreservedUsers: string[]
  redirectTo: string
}

function getCandidateDisplayName(profile: CompareCandidateProfile) {
  return profile.display_name || profile.username || "Unnamed player"
}

export default function CompareCandidateListSection({
  title,
  description,
  profiles,
  primarySearchValue,
  filterPreservedUsers,
  redirectTo,
}: CompareCandidateListSectionProps) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>

      <p className="mt-3 text-sm text-muted-foreground md:text-base">
        {description}
      </p>

      <div className="mt-5 space-y-3">
        {profiles.map((profile) => {
          const nextUsers = [
            ...removeUserOnce(filterPreservedUsers, primarySearchValue),
            profile.username ?? "",
          ].filter(Boolean)

          return (
            <div
              key={profile.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <p className="text-base font-semibold text-foreground">
                {getCandidateDisplayName(profile)}
              </p>

              <div className="flex flex-wrap gap-2">
                {profile.username ? (
                  <PendingLinkButton
                    href={buildCompareHref(nextUsers)}
                    label="Add to compare"
                    pendingLabel="Loading..."
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                ) : (
                  <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                    No username available
                  </span>
                )}

                <form action={sendFriendRequest}>
                  <input type="hidden" name="addressee_id" value={profile.id} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <SubmitButton
                    label="Send request"
                    pendingLabel="Sending..."
                    className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}