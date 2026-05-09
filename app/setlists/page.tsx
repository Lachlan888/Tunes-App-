import Link from "next/link"
import CreateSetlistModal from "@/components/setlists/CreateSetlistModal"
import SetlistOverviewCard from "@/components/setlists/SetlistOverviewCard"
import SetlistStatusMessages from "@/components/setlists/SetlistStatusMessages"
import SubmitButton from "@/components/SubmitButton"
import {
  acceptSetlistInvite,
  createSetlist,
  declineSetlistInvite,
} from "@/lib/actions/setlists"
import { loadSetlistsPageData } from "@/lib/loaders/setlists"

type SetlistsPageProps = {
  searchParams?: Promise<{
    setlist?: string
    setlist_invite?: string
  }>
}

function profileLabel(profile: {
  username: string | null
  display_name: string | null
} | null) {
  return profile?.display_name || profile?.username || "Someone"
}

export default async function SetlistsPage({ searchParams }: SetlistsPageProps) {
  const resolvedSearchParams = await searchParams
  const setlistStatus = resolvedSearchParams?.setlist ?? ""
  const inviteStatus = resolvedSearchParams?.setlist_invite ?? ""

  const { user, setlists, pendingInvites } = await loadSetlistsPageData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Setlists
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">
              Prepare music together
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Build shared working setlists for gigs, sessions, jams, and
              rehearsals. Collaborators can add tunes, attach charts, set
              performance keys, and see who knows what.
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Logged in as {user.email}
            </p>
          </div>

          <CreateSetlistModal createSetlist={createSetlist} />
        </div>
      </section>

      <SetlistStatusMessages
        setlistStatus={setlistStatus}
        inviteStatus={inviteStatus}
      />

      {pendingInvites.length > 0 ? (
        <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pending invitations
          </h2>

          <div className="mt-5 space-y-3">
            {pendingInvites.map((invite) => (
              <article
                key={invite.membership_id}
                className="flex flex-col gap-4 rounded-2xl border border-primary bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {profileLabel(invite.invited_by_profile)} invited you to{" "}
                    <span className="font-semibold">
                      {invite.setlist.name}
                    </span>
                    .
                  </p>

                  {invite.setlist.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {invite.setlist.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={acceptSetlistInvite}>
                    <input
                      type="hidden"
                      name="membership_id"
                      value={invite.membership_id}
                    />
                    <input type="hidden" name="redirect_to" value="/setlists" />
                    <SubmitButton
                      label="Accept"
                      pendingLabel="Accepting..."
                      className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    />
                  </form>

                  <form action={declineSetlistInvite}>
                    <input
                      type="hidden"
                      name="membership_id"
                      value={invite.membership_id}
                    />
                    <input type="hidden" name="redirect_to" value="/setlists" />
                    <SubmitButton
                      label="Decline"
                      pendingLabel="Declining..."
                      className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    />
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your setlists
        </h2>

        {setlists.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-border bg-background/70 p-5">
            <p className="font-medium text-foreground">No setlists yet.</p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create a setlist when you need a shared working list for a gig,
              rehearsal, jam, workshop, or session.
            </p>

            <Link
              href="/library"
              className="mt-4 inline-flex rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Browse tunes
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {setlists.map((setlist) => (
              <SetlistOverviewCard key={setlist.id} setlist={setlist} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}