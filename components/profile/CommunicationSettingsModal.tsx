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
    description: "Immediate email when another musician sends a friend request.",
  },
  {
    name: "email_direct_messages",
    label: "Direct messages",
    description: "Reserved for direct message email when that workflow is enabled.",
  },
  {
    name: "email_comment_replies",
    label: "Comment replies",
    description: "Include replies to your tune comments in a daily or weekly digest.",
  },
  {
    name: "email_activity_replies",
    label: "Activity replies",
    description: "Include replies to your activity in a daily or weekly digest.",
  },
  {
    name: "email_setlist_invites",
    label: "Setlist invites",
    description: "Immediate email when someone invites you to collaborate on a setlist.",
  },
  {
    name: "email_badges",
    label: "Badge activity",
    description: "Include badge awards in a daily or weekly digest.",
  },
  {
    name: "email_practice_reminders",
    label: "Practice reminders",
    description: "Not active yet. Keep this on only if you want future reminders.",
  },
  {
    name: "email_weekly_summary",
    label: "Weekly practice summary",
    description: "Not active yet. Keep this on only if you want future summaries.",
  },
  {
    name: "email_public_list_activity",
    label: "Public list activity summary",
    description: "Not active yet. Keep this on only if you want future list summaries.",
  },
  {
    name: "email_product_updates",
    label: "Product updates",
    description: "Not active yet. Keep this on only if you want future product updates.",
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
            Choose immediate emails for actionable updates and digest emails for
            lower-urgency summaries.
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
        description="Friend requests and setlist invites can send immediate emails. Comment replies, activity replies, and badge awards can be bundled into a digest. Important activity can still appear inside Tunes App when email is off."
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

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Digests only include lower-urgency updates you have allowed:
              comment replies, activity replies, and badge awards.
            </p>

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
