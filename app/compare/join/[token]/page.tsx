import Link from "next/link"
import ConnectAndCompareButton from "@/components/compare/ConnectAndCompareButton"
import { buildCompareJoinPath } from "@/lib/compare-invite-paths"
import { loadCompareInvitePreview } from "@/lib/loaders/compare-invites"
import EnterCompareCodeForm from "@/components/compare/EnterCompareCodeForm"

export const dynamic = "force-dynamic"

type CompareJoinPageProps = {
  params: Promise<{ token: string }>
}

function StatusLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-y border-hairline py-4 text-sm leading-6 text-muted-foreground">
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
      <section>
        {preview.state === "invalid" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              This comparison code isn’t valid
            </h1>
            <div className="mt-5">
              <StatusLine>Ask the musician to create a new code.</StatusLine>
            </div>
          </>
        ) : null}

        {preview.state === "expired" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              This comparison code has expired
            </h1>
            <div className="mt-5">
              <StatusLine>Ask them to create a new one.</StatusLine>
            </div>
          </>
        ) : null}

        {preview.state === "revoked" || preview.state === "consumed" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              This invitation is no longer available
            </h1>
            <div className="mt-5">
              <StatusLine>Ask the musician to create a new code.</StatusLine>
            </div>
          </>
        ) : null}

        {preview.state === "self" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              This is your own comparison code
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Ask another musician to scan it with their phone camera.
            </p>
          </>
        ) : null}

        {preview.state === "valid" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              {preview.inviter.name} wants to compare repertoires
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Accepting will add {preview.inviter.name} as a connection.
              Connected musicians can see the repertoire information used by
              Compare.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {preview.isSignedIn ? (
                <ConnectAndCompareButton inviteCode={token} />
              ) : (
                <>
                  <Link
                    href={signupHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-control border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    Sign up to compare
                  </Link>
                  <Link
                    href={loginHref}
                    className="inline-flex min-h-12 items-center justify-center rounded-control border border-border bg-background/70 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  >
                    Log in
                  </Link>
                </>
              )}

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-control px-5 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Not now
              </Link>
            </div>
          </>
        ) : null}

        {preview.state === "already_connected" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              You’re already connected
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Continue to compare repertoires with {preview.inviter.name}.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ConnectAndCompareButton inviteCode={token} label="Compare now" />
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-control px-5 py-3 text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Not now
              </Link>
            </div>
          </>
        ) : null}

        {preview.state === "accepted" ? (
          <>
            <h1 className="font-sans text-4xl font-bold tracking-tight">
              Connected with {preview.inviter.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This invitation has already been accepted by you.
            </p>
            <Link
              href={preview.compareHref}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-control border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:w-auto"
            >
              Compare now
            </Link>
          </>
        ) : null}

        {preview.state === "invalid" || preview.state === "expired" || preview.state === "revoked" || preview.state === "consumed" ? (
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <Link href="/compare" className="inline-flex min-h-11 items-center rounded-control border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Start a new comparison</Link>
            </div>
            <EnterCompareCodeForm />
          </div>
        ) : null}
      </section>
    </main>
  )
}
