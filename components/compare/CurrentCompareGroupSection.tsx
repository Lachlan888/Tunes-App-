import PendingLinkButton from "@/components/PendingLinkButton"
import UserIdentityLink from "@/components/UserIdentityLink"
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
    <section className="mb-8 border-b border-hairline pb-5">
      <h2 className="text-xl font-semibold text-foreground">
        Current group
      </h2>

      <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
        You’re included automatically. Add other players to find shared tunes.
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
        <div className="mt-5 divide-y divide-hairline border-t border-hairline">
          {selectedProfiles.map((profile) => {
            const nextUsers = removeUserOnce(
              filterPreservedUsers,
              profile.username ?? ""
            )

            return (
              <div
                key={profile.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  <UserIdentityLink
                    username={profile.username}
                    displayName={profile.display_name}
                    fallbackLabel="Unnamed player"
                    className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                  />
                </span>

                {profile.username && (
                  <PendingLinkButton
                    href={buildCompareHref(nextUsers, {
                      includePractice,
                    })}
                    label="Remove"
                    pendingLabel="Removing..."
                    className="inline-flex min-h-11 rounded-control border border-border bg-transparent px-3 py-1 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
                    refresh
                  />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 border-t border-hairline pt-4 text-sm text-muted-foreground">
          No confirmed players in the group yet.
        </p>
      )}
    </section>
  )
}
