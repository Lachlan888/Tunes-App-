"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type AuthMode = "login" | "signup" | "reset"

function isAlreadyRegisteredMessage(message: string) {
  return message.toLowerCase().includes("already registered")
}

function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "")
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "http://localhost:3000"
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

const primaryButtonClassName =
  "w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"

const modeButtonClassName =
  "text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const supabase = createClient()

  function resetMessages() {
    setMessage("")
    setErrorMessage("")
  }

  async function handleLogin() {
    resetMessages()
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setIsSubmitting(false)
      setErrorMessage(error.message)
      return
    }

    setIsRedirecting(true)
    window.location.href = "/"
  }

  async function handleSignup() {
    resetMessages()
    setIsSubmitting(true)

    const siteUrl = getSiteUrl()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      },
    })

    if (error) {
      setIsSubmitting(false)

      if (isAlreadyRegisteredMessage(error.message)) {
        setMessage("That email already has an account. Sign in instead.")
        setMode("login")
        return
      }

      setErrorMessage(error.message)
      return
    }

    if (data.session) {
      setIsRedirecting(true)
      window.location.href = "/"
      return
    }

    setIsSubmitting(false)

    if (data.user) {
      setMessage(
        "Account created. Check your email to confirm your account, then sign in."
      )
      setMode("login")
      return
    }

    setMessage("Check your email to confirm your account, then sign in.")
    setMode("login")
  }

  async function handlePasswordReset() {
    resetMessages()
    setIsSubmitting(true)

    const siteUrl = getSiteUrl()

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/update-password`,
    })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setMessage(
      "If an account exists for that email, a password reset link has been sent."
    )
  }

  const isLogin = mode === "login"
  const isSignup = mode === "signup"
  const isReset = mode === "reset"
  const isBusy = isSubmitting || isRedirecting

  return (
    <main className="mx-auto grid max-w-[1300px] grid-cols-1 gap-6 px-4 py-6 text-foreground sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,520px)] lg:items-start lg:gap-8 lg:py-10">
      <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm lg:block lg:p-8">
        <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          Remember what you play, and build repertoire as culture.
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          Tunes App helps musicians organise tunes, practise them deliberately,
          and connect repertoire with other players. Add tunes, place them in
          lists, move them into practice, mark what you know, and compare common
          ground with friends.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Organise
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Keep tune lists for sessions, styles, projects, and repertoire
              clusters.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Practise
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Use staged review to keep active tunes alive instead of letting
              them dissolve.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Connect
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Compare overlap, browse public lists, and find the tunes you share
              with other musicians.
            </p>
          </div>
        </div>
      </section>

      <section
        id="sign-in"
        className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8"
      >
        <div className="lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes App
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to manage your tunes, lists, practice, and repertoire.
          </p>
        </div>

        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground lg:mt-0">
          {isLogin && "Sign in"}
          {isSignup && "Create account"}
          {isReset && "Reset password"}
        </h1>

        <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:text-base lg:block">
          {isLogin &&
            "Sign in to manage your tunes, lists, practice, and repertoire."}
          {isSignup &&
            "Create an account to start building your repertoire memory system."}
          {isReset &&
            "Enter your email and we’ll send you a link to set a new password."}
        </p>

        {isRedirecting && (
          <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground shadow-sm">
            Loading your tunes...
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-success bg-background/70 p-4 text-sm text-success shadow-sm">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-destructive bg-background/70 p-4 text-sm text-destructive shadow-sm">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              className={inputClassName}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={isBusy}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {!isReset && (
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                className={inputClassName}
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="Password"
                value={password}
                disabled={isBusy}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          )}

          {isLogin && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleLogin}
              className={primaryButtonClassName}
            >
              {isRedirecting
                ? "Loading your tunes..."
                : isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
            </button>
          )}

          {isSignup && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleSignup}
              className={primaryButtonClassName}
            >
              {isRedirecting
                ? "Loading your tunes..."
                : isSubmitting
                  ? "Creating account..."
                  : "Create account"}
            </button>
          )}

          {isReset && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handlePasswordReset}
              className={primaryButtonClassName}
            >
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 border-t border-border pt-5">
          {!isLogin && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                resetMessages()
                setMode("login")
              }}
              className={modeButtonClassName}
            >
              Already have an account? Sign in
            </button>
          )}

          {!isSignup && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                resetMessages()
                setMode("signup")
              }}
              className={modeButtonClassName}
            >
              New here? Create a new account
            </button>
          )}

          {!isReset && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => {
                resetMessages()
                setMode("reset")
              }}
              className={modeButtonClassName}
            >
              Forgot your password?
            </button>
          )}
        </div>
      </section>
    </main>
  )
}