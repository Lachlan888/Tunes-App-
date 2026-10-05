"use client"

import { useActionState, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  submitInlinePieceContribution,
  type InlinePieceContributionState,
} from "@/lib/actions/pieces"
import { KEY_OPTIONS } from "@/lib/music/keys"
import {
  TIME_SIGNATURE_HELPER_TEXT,
  TIME_SIGNATURE_PATTERN,
} from "@/lib/music/time-signatures"
import type { PieceContributionField } from "@/lib/pieces/contribution-policy"
import type { Piece, StyleOption, UserRole } from "@/lib/types"

type InlineField = {
  field: PieceContributionField
  label: string
  value: string | null | undefined
}

const inputClassName =
  "h-11 w-full rounded-control border border-hairline bg-surface-paper px-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const initialState: InlinePieceContributionState = {
  status: "idle",
  message: null,
}

function InlineEditor({
  detail,
  pieceId,
  styleOptions,
}: {
  detail: InlineField
  pieceId: number
  styleOptions: StyleOption[]
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [state, action, pending] = useActionState(
    submitInlinePieceContribution,
    initialState
  )

  if (detail.value) {
    return (
      <span className="break-words text-sm text-text-primary">
        {detail.field === "reference_url" ? (
          <a
            href={detail.value}
            className="underline underline-offset-4 hover:text-action-primary"
            rel="noreferrer"
            target="_blank"
          >
            {detail.value}
          </a>
        ) : (
          detail.value
        )}
      </span>
    )
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-h-11 rounded-control px-2 text-left text-sm font-semibold text-action-primary underline decoration-dotted underline-offset-4 focus-visible:outline-2"
      >
        Not recorded — add {detail.label.toLowerCase()}
      </button>
    )
  }

  const fieldId = `inline-piece-${pieceId}-${detail.field}`
  const messageId = `${fieldId}-message`

  return (
    <form action={action} className="mt-2 space-y-2" aria-busy={pending}>
      <input type="hidden" name="piece_id" value={pieceId} />
      <input type="hidden" name="field" value={detail.field} />
      <label htmlFor={fieldId} className="sr-only">
        {detail.label}
      </label>
      {detail.field === "key" ? (
        <select
          id={fieldId}
          name="value"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={inputClassName}
          required
          autoFocus
        >
          <option value="">Choose key</option>
          {KEY_OPTIONS.filter(Boolean).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      ) : detail.field === "style" ? (
        <select
          id={fieldId}
          name="value"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={inputClassName}
          required
          autoFocus
        >
          <option value="">Choose style</option>
          {styleOptions.map((style) => (
            <option key={style.id} value={style.label}>{style.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name="value"
          type={detail.field === "reference_url" ? "url" : "text"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={inputClassName}
          placeholder={detail.field === "time_signature" ? "e.g. 4/4" : `Add ${detail.label.toLowerCase()}`}
          pattern={detail.field === "time_signature" ? TIME_SIGNATURE_PATTERN : undefined}
          title={detail.field === "time_signature" ? TIME_SIGNATURE_HELPER_TEXT : undefined}
          maxLength={detail.field === "composer" ? 500 : detail.field === "reference_url" ? 2048 : undefined}
          required
          autoFocus
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton
          label="Save"
          pendingLabel="Saving…"
          disabled={!draft.trim()}
          className={joinClasses(buttonStyles.primary, "px-3 py-2")}
          ariaDescribedBy={state.message ? messageId : undefined}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setEditing(false)
            setDraft("")
          }}
          className={joinClasses(buttonStyles.text, "px-3 py-2")}
        >
          Cancel
        </button>
      </div>
      {state.message ? (
        <p
          id={messageId}
          role={state.status === "rejected" ? "alert" : "status"}
          aria-live="polite"
          className={state.status === "rejected" ? "text-sm text-action-destructive" : "text-sm text-text-muted"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}

export default function TuneInlineDetails({
  piece,
  styleOptions,
  currentUserRole,
  composerDisplayValue,
}: {
  piece: Piece
  styleOptions: StyleOption[]
  currentUserRole: UserRole
  composerDisplayValue?: string | null
}) {
  const details: InlineField[] = [
    { field: "key", label: "Key", value: piece.key },
    { field: "style", label: "Style", value: piece.style },
    { field: "time_signature", label: "Time signature", value: piece.time_signature },
    { field: "composer", label: "Composer or source", value: composerDisplayValue ?? piece.composer },
    { field: "reference_url", label: "Reference URL", value: piece.reference_url },
  ]
  const isModerator = currentUserRole === "moderator" || currentUserRole === "admin"

  return (
    <div className="border-t border-hairline py-4">
      <h3 className="font-semibold text-text-primary">Tune details</h3>
      <p className="mt-1 text-sm leading-6 text-text-muted">
        Missing shared details can be filled once. Saving never replaces an existing value.
      </p>
      <dl className="mt-2">
        {details.map((detail) => (
          <div key={detail.field} className="border-b border-hairline py-3 last:border-b-0">
            <dt className="text-xs font-semibold text-text-muted">{detail.label}</dt>
            <dd className="mt-1"><InlineEditor detail={detail} pieceId={piece.id} styleOptions={styleOptions} /></dd>
          </div>
        ))}
      </dl>
      {isModerator ? (
        <p className="mt-3 border-t border-hairline pt-3 text-xs leading-5 text-text-muted">
          Need to correct a populated field? Use Manage → Edit shared tune details; corrections are logged.
        </p>
      ) : null}
    </div>
  )
}
