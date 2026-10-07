"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { setFestivalModeFromForm, type FestivalActionState } from "@/lib/actions/festivals"
import type { FestivalHub, FestivalSettings } from "@/lib/types/festivals"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

const initialState: FestivalActionState = { status: "idle", message: null, field: null }

export default function FestivalModeControl({
  settings,
  festivals,
}: {
  settings: FestivalSettings
  festivals: Array<Pick<FestivalHub, "id" | "name" | "lifecycle">>
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(setFestivalModeFromForm, initialState)
  const selected = festivals.find((festival) => festival.id === settings.selected_festival_id)
  const canEnable = selected?.lifecycle === "published"

  useEffect(() => {
    if (state.status === "success") router.refresh()
  }, [router, state])

  return (
    <section className="border-y border-hairline py-5" aria-labelledby="dev-festival-mode-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 id="dev-festival-mode-title" className="font-sans text-xl font-bold">Festival mode</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Home feature: {selected ? selected.name : "No festival selected"}
            {selected ? ` · ${selected.lifecycle}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <form action={action}>
            <button
              type="submit"
              name="mode_enabled"
              value={settings.mode_enabled ? "false" : "true"}
              role="switch"
              aria-checked={settings.mode_enabled}
              aria-label={`Festival mode ${settings.mode_enabled ? "on" : "off"}. Turn ${settings.mode_enabled ? "off" : "on"}`}
              disabled={pending || (!settings.mode_enabled && !canEnable)}
              className="flex min-h-11 items-center gap-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={joinClasses(
                "relative h-7 w-12 rounded-full border transition-colors",
                settings.mode_enabled ? "border-action-primary bg-action-primary" : "border-hairline bg-surface-note"
              )} aria-hidden="true">
                <span className={joinClasses(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                  settings.mode_enabled ? "translate-x-5" : "translate-x-0"
                )} />
              </span>
              {pending ? "Saving…" : settings.mode_enabled ? "On" : "Off"}
            </button>
          </form>
          <Link href="/dev/festivals" className={buttonStyles.secondary}>Manage festivals</Link>
        </div>
      </div>
      {!settings.mode_enabled && !canEnable ? (
        <p className="mt-3 text-sm text-muted-foreground">Select a published festival in Manage festivals to turn this on.</p>
      ) : null}
      {state.message ? (
        <p className={joinClasses("mt-3 text-sm font-medium", state.status === "success" ? "text-state-known" : "text-action-destructive")} role="status">
          {state.message}
        </p>
      ) : null}
    </section>
  )
}
