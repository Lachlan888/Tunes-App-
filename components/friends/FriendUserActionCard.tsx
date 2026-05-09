"use client"

import { useRouter } from "next/navigation"
import SubmitButton from "@/components/SubmitButton"
import UserIdentityLink from "@/components/UserIdentityLink"

type HiddenField = {
  name: string
  value: string | number
}

type FriendUserActionCardProps = {
  userId: string
  username: string | null
  displayName: string | null
  action: (formData: FormData) => Promise<void>
  actionLabel: string
  pendingLabel: string
  hiddenFields: HiddenField[]
}

const primaryButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

function clickedInsideInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "label",
        "summary",
        "details",
        "form",
        "[role='button']",
        "[data-card-action]",
      ].join(", ")
    )
  )
}

export default function FriendUserActionCard({
  userId,
  username,
  displayName,
  action,
  actionLabel,
  pendingLabel,
  hiddenFields,
}: FriendUserActionCardProps) {
  const router = useRouter()
  const label = displayName || username || "Unnamed user"
  const profileHref = username ? `/users/${encodeURIComponent(username)}` : null

  function openProfile(event: React.MouseEvent<HTMLElement>) {
    if (!profileHref) return
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(profileHref)
  }

  return (
    <article
      className={
        profileHref
          ? "flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:flex-row md:items-center md:justify-between"
          : "flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:bg-muted/70 md:flex-row md:items-center md:justify-between"
      }
      onClick={openProfile}
      aria-label={profileHref ? `Open profile for ${label}` : undefined}
      data-user-card-id={userId}
    >
      <div>
        <p className="font-medium text-foreground">
          <UserIdentityLink
            username={username}
            displayName={displayName}
            className="decoration-primary decoration-2 underline-offset-4 hover:underline"
          />
        </p>

        {username && (
          <p className="mt-1">
            <UserIdentityLink
              username={username}
              displayName={displayName}
              showHandle
            />
          </p>
        )}
      </div>

      <form action={action} data-card-action>
        {hiddenFields.map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}

        <SubmitButton
          label={actionLabel}
          pendingLabel={pendingLabel}
          className={primaryButtonClass}
        />
      </form>
    </article>
  )
}