"use client"

import { useState } from "react"
import RequestTuneEditForm from "@/components/library/RequestTuneEditForm"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { directModeratorUpdatePiece } from "@/lib/actions/moderation"
import {
  deleteCanonicalTuneAsModerator,
  updateMissingPieceDetails,
} from "@/lib/actions/pieces"
import { VALID_KEYS } from "@/lib/music/keys"
import type { Piece, StyleOption, UserRole } from "@/lib/types"

type TuneCanonicalDetailsCardProps = {
  piece: Piece
  redirectTo: string
  styleOptions: StyleOption[]
  currentUserRole: UserRole
  variant?: "card" | "mobile"
}

type ModalMode = "missing" | "request" | "moderator" | "delete" | null

function canUseModeratorTools(role: UserRole) {
  return role === "moderator" || role === "admin"
}

function DetailRow({
  label,
  value,
  variant = "card",
}: {
  label: string
  value: string | null | undefined
  variant?: "card" | "mobile"
}) {
  return (
    <div
      className={
        variant === "mobile"
          ? "flex min-w-0 items-center justify-between gap-4 py-3"
          : "min-w-0 max-w-full rounded-2xl border border-border bg-background/70 p-4"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          variant === "mobile"
            ? "min-w-0 break-words text-right text-sm font-medium text-foreground"
            : "mt-2 min-w-0 break-words text-sm font-medium text-foreground"
        }
      >
        {value || <span className="text-muted-foreground">Missing</span>}
      </p>
    </div>
  )
}

function ModalShell({
  title,
  description,
  children,
  onClose,
  destructive = false,
}: {
  title: string
  description: string
  children: React.ReactNode
  onClose: () => void
  destructive?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <div
        className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border bg-card p-4 shadow-xl sm:p-6 ${
          destructive ? "border-destructive" : "border-border"
        }`}
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold uppercase tracking-[0.16em] ${
                destructive ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              Tune details
            </p>
            <h3 className="mt-2 break-words font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.modalClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 min-w-0">{children}</div>
      </div>
    </div>
  )
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const primaryButtonClass = joinClasses(buttonStyles.primary, "py-3")

const secondaryButtonClass = joinClasses(buttonStyles.secondary, "py-3")

const destructiveButtonClass = joinClasses(
  buttonStyles.destructiveSecondary,
  "py-3"
)

const destructivePrimaryButtonClass = joinClasses(
  buttonStyles.destructive,
  "py-3"
)

export default function TuneCanonicalDetailsCard({
  piece,
  redirectTo,
  styleOptions,
  currentUserRole,
  variant = "card",
}: TuneCanonicalDetailsCardProps) {
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const missingFields = [
    !piece.key,
    !piece.style,
    !piece.time_signature,
    !piece.reference_url,
  ].filter(Boolean).length

  const isModerator = canUseModeratorTools(currentUserRole)
  const deleteConfirmation = `DELETE ${piece.title}`
  const isMobile = variant === "mobile"

  return (
    <section
      className={
        isMobile
          ? "min-w-0 border-b border-border pb-6 last:border-b-0 last:pb-0"
          : "w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6"
      }
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tune details
        </h2>

        <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-muted-foreground sm:block">
          Shared canonical tune data.
        </p>
      </div>

      <div
        className={
          isMobile
            ? "mt-4 min-w-0 divide-y divide-border"
            : "mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
        }
      >
        <DetailRow label="Title" value={piece.title} variant={variant} />
        <DetailRow label="Key" value={piece.key} variant={variant} />
        <DetailRow label="Style" value={piece.style} variant={variant} />
        <DetailRow
          label="Time signature"
          value={piece.time_signature}
          variant={variant}
        />
        <DetailRow
          label="Reference URL"
          value={piece.reference_url}
          variant={variant}
        />
      </div>

      {!isModerator && missingFields > 0 ? (
        <p
          className={
            isMobile
              ? "mt-4 text-sm text-muted-foreground"
              : "mt-4 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground"
          }
        >
          {missingFields} shared detail{missingFields === 1 ? "" : "s"} still{" "}
          {missingFields === 1 ? "needs" : "need"} filling in.
        </p>
      ) : null}

      <div className="mt-5 grid gap-2">
        {isModerator ? (
          <>
            <button
              type="button"
              onClick={() => setModalMode("moderator")}
              className={primaryButtonClass}
            >
              Edit canonical details
            </button>

            <button
              type="button"
              onClick={() => setModalMode("delete")}
              className={destructiveButtonClass}
            >
              Delete canonical tune
            </button>
          </>
        ) : (
          <>
            {missingFields > 0 ? (
              <button
                type="button"
                onClick={() => setModalMode("missing")}
                className={primaryButtonClass}
              >
                Add missing details
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setModalMode("request")}
              className={secondaryButtonClass}
            >
              Request correction
            </button>
          </>
        )}
      </div>

      {modalMode === "missing" ? (
        <ModalShell
          title="Add missing details"
          description="Add canonical information that is currently missing. Existing details should be changed through a correction request."
          onClose={() => setModalMode(null)}
        >
          <form action={updateMissingPieceDetails} className="space-y-3">
            <input type="hidden" name="piece_id" value={piece.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            {!piece.key ? (
              <select name="key" defaultValue="" className={inputClassName}>
                <option value="">Choose key</option>
                {VALID_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            ) : null}

            {!piece.style ? (
              <select name="style_id" defaultValue="" className={inputClassName}>
                <option value="">Choose style</option>
                {styleOptions.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            ) : null}

            {!piece.time_signature ? (
              <input
                name="time_signature"
                placeholder='Add time signature, eg "4/4"'
                className={inputClassName}
              />
            ) : null}

            {!piece.reference_url ? (
              <input
                name="reference_url"
                type="url"
                placeholder="Add reference URL"
                className={inputClassName}
              />
            ) : null}

            <div className="grid gap-2 pt-2">
              <SubmitButton
                label="Save missing details"
                pendingLabel="Saving..."
                className={primaryButtonClass}
              />

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {modalMode === "request" ? (
        <ModalShell
          title="Request a correction"
          description="Suggest corrections to the shared tune record. To add background, source notes, alternate titles, or folklore, use the Lore section instead."
          onClose={() => setModalMode(null)}
        >
          <RequestTuneEditForm
            piece={piece}
            redirectTo={redirectTo}
            styleOptions={styleOptions}
          />
        </ModalShell>
      ) : null}

      {modalMode === "moderator" ? (
        <ModalShell
          title="Edit canonical details"
          description="Update shared tune data directly. This affects the canonical tune record and creates an audit log entry."
          onClose={() => setModalMode(null)}
        >
          <form action={directModeratorUpdatePiece} className="space-y-3">
            <input type="hidden" name="piece_id" value={piece.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <input
              name="title"
              defaultValue={piece.title}
              placeholder="Title"
              className={inputClassName}
              required
            />

            <select
              name="key"
              defaultValue={piece.key || ""}
              className={inputClassName}
            >
              <option value="">No key</option>
              {VALID_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>

            <select
              name="style"
              defaultValue={piece.style || ""}
              className={inputClassName}
            >
              <option value="">No style</option>
              {styleOptions.map((style) => (
                <option key={style.id} value={style.label}>
                  {style.label}
                </option>
              ))}
            </select>

            <input
              name="time_signature"
              defaultValue={piece.time_signature || ""}
              placeholder='Time signature, eg "4/4"'
              className={inputClassName}
            />

            <input
              name="reference_url"
              type="url"
              defaultValue={piece.reference_url || ""}
              placeholder="Reference URL"
              className={inputClassName}
            />

            <textarea
              name="moderator_comment"
              rows={4}
              placeholder="Optional audit note explaining the edit"
              className={inputClassName}
            />

            <div className="grid gap-2 pt-2">
              <SubmitButton
                label="Save canonical details"
                pendingLabel="Saving..."
                className={primaryButtonClass}
              />

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {modalMode === "delete" ? (
        <ModalShell
          title="Delete canonical tune"
          description="This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications."
          destructive
          onClose={() => setModalMode(null)}
        >
          <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">
              To confirm, type this exactly:
            </p>
            <p className="mt-2 min-w-0 break-words font-mono text-sm font-semibold text-foreground">
              {deleteConfirmation}
            </p>
          </div>

          <form action={deleteCanonicalTuneAsModerator} className="mt-5 space-y-3">
            <input type="hidden" name="piece_id" value={piece.id} />
            <input type="hidden" name="redirect_to" value="/library" />

            <input
              name="confirmation"
              placeholder={deleteConfirmation}
              className={inputClassName}
              autoComplete="off"
              required
            />

            <div className="grid gap-2 pt-2">
              <SubmitButton
                label="Delete canonical tune"
                pendingLabel="Deleting..."
                className={destructivePrimaryButtonClass}
              />

              <button
                type="button"
                onClick={() => setModalMode(null)}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </section>
  )
}
