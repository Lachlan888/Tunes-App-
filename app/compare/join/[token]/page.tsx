import Link from "next/link"
import ConnectAndCompareButton from "@/components/compare/ConnectAndCompareButton"
import { buildCompareJoinPath } from "@/lib/compare-invite-paths"
import { loadCompareInvitePreview } from "@/lib/loaders/compare-invites"

export const dynamic = "force-dynamic"

type CompareJoinPageProps = {
  params: Promise<{ token: string }>
}

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  )
}

export default async function CompareJoinPage({ params }: CompareJoinPageProps) {
  const { token } = await params
  const preview = await loadCompareInvitePreview(token)
  const joinPath = buildCompareJoinPath(token)
  const loginHref = `/login?next=${encodeURIComponent(joinPath)}`
  const signupHref = `${loginHref}&mode=signup`

  return (
    <main className="mx-auto max-w-xl px-4 py-6 text-foreground sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Compare in person
        </p>

        {preview.state === "invalid" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              This comparison code isn’t valid
            </h1>
            <div className="mt-5">
              <StatusCard>Ask the musician to create a new code.</StatusCard>
            </div>
          </>
        ) : null}

        {preview.state === "expired" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              This comparison code has expired
            </h1>
            <div className="mt-5">
              <StatusCard>Ask them to create a new one.</StatusCard>
            </div>
          </>
        ) : null}

        {preview.state === "revoked" || preview.state === "consumed" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              This invitation is no longer available
            </h1>
            <div className="mt-5">
              <StatusCard>Ask the musician to create a new code.</StatusCard>
            </div>
          </>
        ) : null}

        {preview.state === "self" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              This is your own comparison code
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Ask another musician to scan it with their phone camera.
            </p>
          </>
        ) : null}

        {preview.state === "valid" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              {preview.inviter.name} wants to compare repertoires
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Accepting will add {preview.inviter.name} as a connection.
              Connected musicians can see the repertoire information used by
              Compare.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {preview.isSignedIn ? (
                <ConnectAndCompareButton token={token} />
              ) : (
                <>
                  <Link
                    href={signupHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    Sign up to compare
                  </Link>
                  <Link
                    href={loginHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-background/70 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    Log in
                  </Link>
                </>
              )}

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Not now
              </Link>
            </div>
          </>
        ) : null}

        {preview.state === "already_connected" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              You’re already connected
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Continue to compare repertoires with {preview.inviter.name}.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ConnectAndCompareButton token={token} label="Compare now" />
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Not now
              </Link>
            </div>
          </>
        ) : null}

        {preview.state === "accepted" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">
              Connected with {preview.inviter.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This invitation has already been accepted by you.
            </p>
            <Link
              href={preview.compareHref}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:w-auto"
            >
              Compare now
            </Link>
          </>
        ) : null}
      </section>
    </main>
  )
}
