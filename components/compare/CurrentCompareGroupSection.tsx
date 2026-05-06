import PendingLinkButton from "@/components/PendingLinkButton"
import CompareScopeToggle from "@/components/compare/CompareScopeToggle"
import type { ProfileSearchRow } from "@/lib/profile-search"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"

type CurrentCompareGroupSectionProps = {
  selectedProfiles: ProfileSearchRow[]
  filterPreservedUsers: string[]
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
  includePractice: boolean
}

function getProfileDisplayName(profile: ProfileSearchRow) {
  return profile.display_name || profile.username || "Unnamed player"
}

export default function CurrentCompareGroupSection({
  selectedProfiles,
  filterPreservedUsers,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  includePractice,
}: CurrentCompareGroupSectionProps) {
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Current group
      </h2>

      <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
        You are always included. Add other players to find tunes common to the
        whole group.
      </p>

      <CompareScopeToggle
        includePractice={includePractice}
        filterPreservedUsers={filterPreservedUsers}
        titleQuery={titleQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
      />

      {selectedProfiles.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {selectedProfiles.map((profile) => {
            const displayName = getProfileDisplayName(profile)
            const nextUsers = removeUserOnce(
              filterPreservedUsers,
              profile.username ?? ""
            )

            return (
              <div
                key={profile.id}
                className="flex items-center gap-3 rounded-full border border-border bg-background/70 px-4 py-2 text-sm shadow-sm"
              >
                <span className="font-medium text-foreground">
                  {displayName}
                </span>

                {profile.username && (
                  <PendingLinkButton
                    href={buildCompareHref(nextUsers, {
                      q: titleQuery,
                      key: selectedKeys,
                      style: selectedStyles,
                      time_signature: selectedTimeSignatures,
                      includePractice,
                    })}
                    label="Remove"
                    pendingLabel="Removing..."
                    className="rounded-full border border-border bg-transparent px-3 py-1 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No confirmed users in the group yet.
        </p>
      )}
    </section>
  )
}