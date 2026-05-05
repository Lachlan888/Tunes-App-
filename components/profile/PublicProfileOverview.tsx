import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import type {
  Profile,
  PublicProfileList,
  RepertoireSummary,
  UserInstrument,
} from "@/lib/types"

type PublicProfileOverviewProps = {
  profile: Profile
  instruments: UserInstrument[]
  publicLists: PublicProfileList[]
  repertoireSummary: RepertoireSummary | null
  isOwnProfile: boolean
}

function pluraliseTuneCount(count: number) {
  return `${count} tune${count === 1 ? "" : "s"}`
}

export default function PublicProfileOverview({
  profile,
  instruments,
  publicLists,
  repertoireSummary,
  isOwnProfile,
}: PublicProfileOverviewProps) {
  return (
    <div className="space-y-6">
      {profile.show_repertoire_summary && repertoireSummary ? (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Repertoire
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-4xl font-bold leading-none text-foreground">
                {repertoireSummary.known_count}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Known tunes
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-4xl font-bold leading-none text-foreground">
                {repertoireSummary.practice_count}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                In practice
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {profile.show_instruments ? (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Instruments
            </p>

            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground">
              {instruments.length} listed
            </span>
          </div>

          {instruments.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {instruments.map((instrument) => (
                <li
                  key={instrument.id}
                  className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  {instrument.instrument_name}
                </li>
              ))}
            </ul>
          ) : isOwnProfile ? (
            <EmptyState
              title="No instruments listed"
              description="Add instruments on your Profile page so other players know what you play."
              primaryActionHref="/dashboard"
              primaryActionLabel="Edit Profile"
              className="mt-5"
            />
          ) : (
            <EmptyState
              title="No instruments listed"
              description="This user has not added instruments to their profile yet."
              className="mt-5"
            />
          )}
        </section>
      ) : null}

      {profile.show_public_lists_on_profile ? (
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Public lists
            </p>

            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground">
              {publicLists.length} list{publicLists.length === 1 ? "" : "s"}
            </span>
          </div>

          {publicLists.length > 0 ? (
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {publicLists.map((list) => (
                <li key={list.id}>
                  <Link
                    href={`/public-lists/${list.id}`}
                    className="group block h-full rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-2xl font-bold leading-tight text-foreground underline-offset-4 group-hover:underline">
                          {list.name}
                        </h3>

                        {list.description ? (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {list.description}
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            No description yet.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm font-medium text-muted-foreground">
                        <span>{pluraliseTuneCount(list.tune_count)}</span>
                        <span
                          aria-hidden="true"
                          className="transition group-hover:translate-x-0.5 group-hover:text-foreground"
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : isOwnProfile ? (
            <EmptyState
              title="No public lists yet"
              description="Make one of your lists public if you want other users to browse or import it."
              primaryActionHref="/learning-lists"
              primaryActionLabel="Manage Lists"
              className="mt-5"
            />
          ) : (
            <EmptyState
              title="No public lists yet"
              description="Public lists this user chooses to share will appear here."
              className="mt-5"
            />
          )}
        </section>
      ) : null}
    </div>
  )
}