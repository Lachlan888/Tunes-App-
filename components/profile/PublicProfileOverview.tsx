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
    <div className="min-w-0 space-y-6">
      {profile.show_repertoire_summary && repertoireSummary ? (
        <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Repertoire
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 md:mt-5 md:gap-3">
            <div className="min-w-0 rounded-xl bg-card px-4 py-3 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
              <p className="text-3xl font-bold leading-none text-foreground md:text-4xl">
                {repertoireSummary.known_count}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground md:mt-2">
                Known tunes
              </p>
            </div>

            <div className="min-w-0 rounded-xl bg-card px-4 py-3 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
              <p className="text-3xl font-bold leading-none text-foreground md:text-4xl">
                {repertoireSummary.practice_count}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground md:mt-2">
                In practice
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {profile.show_instruments ? (
        <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Instruments
            </p>

            <span className="shrink-0 text-sm font-medium text-muted-foreground md:rounded-full md:border md:border-border md:bg-background/70 md:px-3 md:py-1">
              {instruments.length} listed
            </span>
          </div>

          {instruments.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2 md:mt-5">
              {instruments.map((instrument) => (
                <li
                  key={instrument.id}
                  className="max-w-full break-words rounded-full bg-card px-3 py-1.5 text-sm font-medium text-foreground md:border md:border-border md:bg-background/70"
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
              className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
            />
          ) : (
            <EmptyState
              title="No instruments listed"
              description="This musician has not added instruments to their profile yet."
              className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
            />
          )}
        </section>
      ) : null}

      {profile.show_public_lists_on_profile ? (
        <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Public lists
            </p>

            <span className="shrink-0 text-sm font-medium text-muted-foreground md:rounded-full md:border md:border-border md:bg-background/70 md:px-3 md:py-1">
              {publicLists.length} list{publicLists.length === 1 ? "" : "s"}
            </span>
          </div>

          {publicLists.length > 0 ? (
            <ul className="mt-3 grid gap-3 md:mt-5 lg:grid-cols-2">
              {publicLists.map((list) => (
                <li key={list.id}>
                  <Link
                    href={`/public-lists/${list.id}`}
                    className="group block h-full rounded-xl bg-card p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:rounded-2xl md:border md:border-border md:bg-background/70 md:shadow-sm md:hover:-translate-y-0.5 md:hover:shadow-md"
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-xl font-bold leading-tight text-foreground underline-offset-4 group-hover:underline md:text-2xl">
                          {list.name}
                        </h3>

                        {list.description ? (
                          <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
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
              description="Make one of your lists public if you want other musicians to browse or import it."
              primaryActionHref="/learning-lists"
              primaryActionLabel="Manage Lists"
              className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
            />
          ) : (
            <EmptyState
              title="No public lists yet"
              description="Public lists this musician chooses to share will appear here."
              className="mt-4 border-0 bg-transparent p-0 shadow-none md:mt-5 md:border md:bg-background/70 md:p-4 md:shadow-sm"
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
