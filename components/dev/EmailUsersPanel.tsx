"use client"

import { useActionState, useRef, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { sendAdminEmailAction } from "@/lib/actions/admin-email-broadcasts"
import { initialAdminEmailActionState } from "@/lib/admin-email-action-state"
import type {
  AdminEmailBroadcastHistoryRow,
  AdminEmailRecipientCounts,
} from "@/lib/services/admin-email-broadcasts"
import type { AdminEmailAudience } from "@/lib/services/admin-email-broadcast-logic"

type EmailUsersPanelProps = {
  recipientCounts: AdminEmailRecipientCounts
  recentBroadcasts: AdminEmailBroadcastHistoryRow[]
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"

const audienceLabel: Record<AdminEmailAudience, string> = {
  all_users: "All users",
  digest_subscribers: "Digest subscribers",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function EmailUsersPanel({
  recipientCounts,
  recentBroadcasts,
}: EmailUsersPanelProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [audience, setAudience] =
    useState<AdminEmailAudience>("all_users")
  const [isConfirming, setIsConfirming] = useState(false)
  const [broadcastId, setBroadcastId] = useState("")
  const [state, action, isPending] = useActionState(
    sendAdminEmailAction,
    initialAdminEmailActionState
  )
  const recipientCount = recipientCounts[audience]
  const currentBroadcastHasReturned =
    state.operation === "broadcast" && state.broadcastId === broadcastId

  function openConfirmation() {
    if (!formRef.current?.reportValidity()) return

    setBroadcastId(crypto.randomUUID())
    setIsConfirming(true)
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Email users
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Send a plain-text product update through the branded Tunes template.
          Recipients are resolved from account emails only after you confirm.
        </p>
      </div>

      <form
        ref={formRef}
        id="admin-email-users-form"
        action={action}
        className="mt-6 max-w-3xl space-y-5"
      >
        <input type="hidden" name="broadcast_id" value={broadcastId} />

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Audience
          </span>
          <select
            name="audience"
            value={audience}
            onChange={(event) =>
              setAudience(event.target.value as AdminEmailAudience)
            }
            disabled={isPending}
            className={`${inputClassName} mt-2`}
          >
            <option value="all_users">All users</option>
            <option value="digest_subscribers">Digest subscribers</option>
          </select>
          <span className="mt-2 block text-xs text-muted-foreground">
            {recipientCount} current {recipientCount === 1 ? "recipient" : "recipients"}
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Subject
          </span>
          <input
            type="text"
            name="subject"
            required
            maxLength={200}
            disabled={isPending}
            className={`${inputClassName} mt-2`}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Heading <span className="font-normal normal-case">(optional)</span>
          </span>
          <input
            type="text"
            name="heading"
            maxLength={200}
            disabled={isPending}
            className={`${inputClassName} mt-2`}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Message
          </span>
          <textarea
            name="message"
            required
            maxLength={20_000}
            rows={9}
            disabled={isPending}
            className={`${inputClassName} mt-2 min-h-48 resize-y`}
            placeholder="Plain text only. Blank lines become paragraph breaks."
          />
        </label>

        <fieldset className="rounded-2xl border border-border bg-background/50 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Optional CTA
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Button label
              </span>
              <input
                type="text"
                name="cta_label"
                maxLength={100}
                disabled={isPending}
                className={`${inputClassName} mt-2`}
                placeholder="Manage email settings"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Button URL
              </span>
              <input
                type="text"
                name="cta_url"
                maxLength={2_000}
                disabled={isPending}
                className={`${inputClassName} mt-2`}
                placeholder="/dashboard?communication_settings=open"
              />
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Use an internal path beginning with / or a secure https URL. Both
            CTA fields must be supplied together.
          </p>
        </fieldset>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SubmitButton
            name="intent"
            value="test"
            label="Send test to me"
            pendingLabel="Sending…"
            forcePending={isPending}
            className={buttonStyles.secondaryStrong}
          />
          <button
            type="button"
            disabled={isPending}
            onClick={openConfirmation}
            className={buttonStyles.primary}
          >
            Send to {recipientCount} {recipientCount === 1 ? "user" : "users"}
          </button>
        </div>
      </form>

      {state.message ? (
        <div
          className={joinClasses(
            "mt-5 max-w-3xl rounded-2xl border p-4 text-sm",
            state.status === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800"
          )}
          role="status"
        >
          <p className="font-semibold">{state.message}</p>
          {state.result ? (
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                ["total", "sent", "failed", "skipped"] as const
              ).map((key) => (
                <div key={key}>
                  <dt className="text-xs uppercase tracking-wide opacity-75">
                    {key}
                  </dt>
                  <dd className="mt-1 text-lg font-bold">
                    {state.result?.[key] ?? 0}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground">
          Recent broadcasts
        </h3>
        {recentBroadcasts.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full divide-y divide-border text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Audience</th>
                  <th className="px-4 py-3 text-right font-semibold">Sent</th>
                  <th className="px-4 py-3 text-right font-semibold">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBroadcasts.map((broadcast) => (
                  <tr key={broadcast.id} className="bg-card">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(broadcast.created_at)}
                    </td>
                    <td className="max-w-sm px-4 py-3 font-medium text-foreground">
                      {broadcast.subject}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {audienceLabel[broadcast.audience]}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {broadcast.sent_count}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {broadcast.failed_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No broadcast history yet.
          </p>
        )}
      </div>

      <ResponsiveModal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        closeDisabled={isPending}
        closeOnOverlayClick={!isPending}
        closeOnEscape={!isPending}
        eyebrow="Confirm broadcast"
        title={`Email ${recipientCount} ${recipientCount === 1 ? "user" : "users"}?`}
        description={`Audience: ${audienceLabel[audience]}. Recipients will be resolved again on the server when you send.`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsConfirming(false)}
              className={buttonStyles.secondary}
            >
              {currentBroadcastHasReturned ? "Close" : "Cancel"}
            </button>
            <SubmitButton
              form="admin-email-users-form"
              name="intent"
              value="broadcast"
              label="Send email"
              pendingLabel="Sending email…"
              forcePending={isPending}
              disabled={currentBroadcastHasReturned}
              className={buttonStyles.primary}
            />
          </div>
        }
      >
        <p className="text-sm leading-6 text-muted-foreground">
          Each recipient will receive an individual email through Brevo. This
          action cannot be undone.
        </p>
        {currentBroadcastHasReturned && state.message ? (
          <p
            className={joinClasses(
              "mt-4 rounded-xl border p-3 text-sm font-medium",
              state.status === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800"
            )}
          >
            {state.message}
          </p>
        ) : null}
      </ResponsiveModal>
    </div>
  )
}
