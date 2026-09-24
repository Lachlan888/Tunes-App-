import Link from "next/link"
import CreateSetlistModal from "@/components/setlists/CreateSetlistModal"
import SetlistOverviewCard from "@/components/setlists/SetlistOverviewCard"
import SetlistStatusMessages from "@/components/setlists/SetlistStatusMessages"
import SubmitButton from "@/components/SubmitButton"
import PageHeader from "@/components/ui/PageHeader"
import {
  acceptSetlistInvite,
  createSetlist,
  declineSetlistInvite,
} from "@/lib/actions/setlists"
import { loadSetlistsPageData } from "@/lib/loaders/setlists"

type SetlistsPageProps = {
  searchParams?: Promise<{
    setlist?: string | string[]
    setlist_invite?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function profileLabel(profile: {
  username: string | null
  display_name: string | null
} | null) {
  return profile?.display_name || profile?.username || "Someone"
}

export default async function SetlistsPage({ searchParams }: SetlistsPageProps) {
  const resolvedSearchParams = await searchParams
  const showSection = (sectionId: string) => {
    void sectionId
    return true
  }

  const setlistStatus = getSingleValue(resolvedSearchParams?.setlist)
  const inviteStatus = getSingleValue(resolvedSearchParams?.setlist_invite)

  const { setlists, pendingInvites } = await loadSetlistsPageData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <PageHeader
        title="Setlists"
        actions={
          showSection("create_setlist") ? (
            <CreateSetlistModal createSetlist={createSetlist} />
          ) : null
        }
      />

      {showSection("status_messages") ? (
        <SetlistStatusMessages
          setlistStatus={setlistStatus}
          inviteStatus={inviteStatus}
        />
      ) : null}

      {showSection("pending_invites") && pendingInvites.length > 0 ? (
        <section className="mb-8 border-y border-hairline py-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Pending invitations
          </h2>

          <div className="mt-5 space-y-3">
            {pendingInvites.map((invite) => (
              <article
                key={invite.membership_id}
                className="flex flex-col gap-4 border-b border-hairline py-4 last:border-b-0 md:flex-row md:items-center md:justify-between"
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
                      className="min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
                      className="min-h-11 inline-flex items-center justify-center rounded-control border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    />
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {showSection("setlists") ? (
        <section className="border-t border-hairline pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your setlists
          </h2>

          {setlists.length === 0 ? (
            <div className="mt-5 border-y border-hairline py-5">
              <p className="font-medium text-foreground">No setlists yet.</p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create a setlist when you need a shared working list for a gig,
                rehearsal, jam, workshop, or session.
              </p>

              <Link
                href="/library"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Browse tunes
              </Link>
            </div>
          ) : (
            <div className="mt-3 border-t border-hairline">
              {setlists.map((setlist) => (
                <SetlistOverviewCard key={setlist.id} setlist={setlist} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}
