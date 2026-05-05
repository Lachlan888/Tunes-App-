import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow } from "@/lib/profile-search"
import { renderProfileLink } from "@/lib/compare-page"

type CompareBlockedSectionProps = {
  matchedProfile: ProfileSearchRow
  isAcceptedFriend: boolean
  redirectTo: string
}

const secondaryButtonClass =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

export default function CompareBlockedSection({
  matchedProfile,
  isAcceptedFriend,
  redirectTo,
}: CompareBlockedSectionProps) {
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Permission needed
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          User found
        </h2>
      </div>

      <article className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-foreground">
            {renderProfileLink(
              matchedProfile.username,
              matchedProfile.display_name || matchedProfile.username
            )}
          </p>

          {matchedProfile.username && (
            <p className="mt-1 text-sm text-muted-foreground">
              <Link
                href={`/users/${matchedProfile.username}`}
                className="underline underline-offset-4 transition hover:text-foreground"
              >
                @{matchedProfile.username}
              </Link>
            </p>
          )}
        </div>

        {!isAcceptedFriend && (
          <form action={sendFriendRequest}>
            <input type="hidden" name="addressee_id" value={matchedProfile.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Send request"
              pendingLabel="Sending..."
              className={secondaryButtonClass}
            />
          </form>
        )}
      </article>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        This user requires friendship before others can compare with them.
      </p>
    </section>
  )
}