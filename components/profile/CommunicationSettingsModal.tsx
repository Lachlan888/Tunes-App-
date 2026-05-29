"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { statusStyles } from "@/components/ui/statusStyles"
import { updateNotificationPreferences } from "@/lib/actions/notification-preferences"
import type {
  NotificationDigestFrequency,
  NotificationPreferences,
} from "@/lib/types"

type CommunicationSettingsModalProps = {
  preferences: NotificationPreferences
  statusMessage: string | null
  statusTone: "success" | "warning" | "error" | null
}

type ToggleOption = {
  name: keyof Pick<
    NotificationPreferences,
    | "email_friend_requests"
    | "email_direct_messages"
    | "email_comment_replies"
    | "email_activity_replies"
    | "email_setlist_invites"
    | "email_badges"
    | "email_practice_reminders"
    | "email_weekly_summary"
    | "email_public_list_activity"
    | "email_product_updates"
  >
  label: string
  description: string
}

const toggleOptions: ToggleOption[] = [
  {
    name: "email_friend_requests",
    label: "Friend requests",
    description: "Email me when another musician sends a friend request.",
  },
  {
    name: "email_direct_messages",
    label: "Direct messages",
    description: "Email me when someone sends a direct message.",
  },
  {
    name: "email_comment_replies",
    label: "Comment replies",
    description: "Email me when someone replies to my tune comment.",
  },
  {
    name: "email_activity_replies",
    label: "Activity replies",
    description: "Email me when someone replies to my activity.",
  },
  {
    name: "email_setlist_invites",
    label: "Setlist invites",
    description: "Email me about setlist invitations and collaborator updates.",
  },
  {
    name: "email_badges",
    label: "Badge activity",
    description: "Email me when badge activity needs my attention.",
  },
  {
    name: "email_practice_reminders",
    label: "Practice reminders",
    description: "Email me reminders about practice work.",
  },
  {
    name: "email_weekly_summary",
    label: "Weekly practice summary",
    description: "Email me a summary of recent practice activity.",
  },
  {
    name: "email_public_list_activity",
    label: "Public list activity summary",
    description: "Email me summaries about public list activity.",
  },
  {
    name: "email_product_updates",
    label: "Product updates",
    description: "Email me occasional Tunes App product updates.",
  },
]

const digestOptions: Array<{
  value: NotificationDigestFrequency
  label: string
}> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "never", label: "Never" },
]

function PreferenceToggle({
  name,
  label,
  description,
  defaultChecked,
}: ToggleOption & {
  defaultChecked: boolean
}) {
  return (
    <label className="flex gap-3 border-b border-border/70 py-4 last:border-b-0">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />

      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>

        <span className="mt-1 block text-sm leading-6 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  )
}

export default function CommunicationSettingsModal({
  preferences,
  statusMessage,
  statusTone,
}: CommunicationSettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openModal() {
    setIsSubmitting(false)
    setIsOpen(true)
  }

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Communication settings
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Choose when Tunes App emails you and what stays in the app.
          </p>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Switching email off does not remove in-app notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className={buttonStyles.secondaryStrong}
        >
          Manage communication settings
        </button>
      </div>

      {statusMessage && statusTone ? (
        <p
          className={joinClasses(
            "mt-5 rounded-2xl border p-4 text-sm font-medium shadow-sm",
            statusStyles[statusTone]
          )}
        >
          {statusMessage}
        </p>
      ) : null}

      <ResponsiveModal
        isOpen={isOpen}
        onClose={closeModal}
        closeDisabled={isSubmitting}
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-3xl"
        eyebrow="Profile"
        title="Communication settings"
        description="Choose which updates can be sent by email. Important activity can still appear inside Tunes App even when email is off."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className={buttonStyles.secondary}
            >
              Cancel
            </button>

            <SubmitButton
              label="Save settings"
              pendingLabel="Saving..."
              form="communication-settings-form"
              forcePending={isSubmitting}
              className={buttonStyles.primary}
            />
          </div>
        }
      >
        <form
          id="communication-settings-form"
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            await updateNotificationPreferences(formData)
          }}
          className="space-y-7"
        >
          <section>
            <label className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
              <input
                type="checkbox"
                name="email_enabled"
                defaultChecked={preferences.email_enabled}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />

              <span>
                <span className="block text-sm font-semibold text-foreground">
                  Email notifications
                </span>

                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  Allow Tunes App to send selected updates by email. Turning
                  this off keeps in-app notifications available.
                </span>
              </span>
            </label>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Updates
            </h3>

            <div className="mt-3 rounded-2xl border border-border bg-background/70 px-4 shadow-sm">
              {toggleOptions.map((option) => (
                <PreferenceToggle
                  key={option.name}
                  {...option}
                  defaultChecked={Boolean(preferences[option.name])}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Digest frequency
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {digestOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
                >
                  <input
                    type="radio"
                    name="digest_frequency"
                    value={option.value}
                    defaultChecked={
                      preferences.digest_frequency === option.value
                    }
                    className="mt-1 h-4 w-4 accent-primary"
                  />

                  <span className="text-sm font-semibold text-foreground">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </form>
      </ResponsiveModal>
    </section>
  )
}
