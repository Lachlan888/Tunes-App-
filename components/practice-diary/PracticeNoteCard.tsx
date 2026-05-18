"use client"

import { useState } from "react"
import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import {
  deletePracticeNote,
  updatePracticeNote,
} from "@/lib/actions/practice-diary"
import type {
  PracticeNote,
  PracticeNoteCategory,
} from "@/lib/loaders/practice-diary"

type PracticeNoteCardProps = {
  note: PracticeNote
  categories: PracticeNoteCategory[]
  redirectTo: string
}

const textareaClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-lg leading-8 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)] md:text-base md:leading-7"

const selectClassName =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"

function NoteContextLabels({ note }: { note: PracticeNote }) {
  if (!note.category && !note.focus) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {note.category ? (
        <Link
          href={`/review/diary/categories/${note.category.id}`}
          className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={note.category.prompt ?? undefined}
        >
          {note.category.name}
        </Link>
      ) : null}

      {note.focus ? (
        <Link
          href={`/review/foci/${note.focus.id}`}
          className="rounded-full border border-border bg-background/70 px-2.5 py-1 text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={note.focus.description ?? undefined}
        >
          Focus: {note.focus.title}
        </Link>
      ) : null}
    </div>
  )
}

export default function PracticeNoteCard({
  note,
  categories,
  redirectTo,
}: PracticeNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm md:bg-card">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Note
          </p>

          <NoteContextLabels note={note} />
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-fit rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Edit
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <form action={updatePracticeNote} className="space-y-3">
            <input type="hidden" name="note_id" value={note.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <textarea
              name="body"
              rows={6}
              defaultValue={note.body}
              className={textareaClassName}
              required
            />

            <div className="flex flex-wrap items-center gap-3">
              <select
                name="category_id"
                className={selectClassName}
                defaultValue={note.category_id ?? ""}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <SubmitButton
                label="Save changes"
                pendingLabel="Saving..."
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              />

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
            </div>
          </form>

          <form action={deletePracticeNote}>
            <input type="hidden" name="note_id" value={note.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            {note.piece_id ? (
              <input type="hidden" name="piece_id" value={note.piece_id} />
            ) : null}

            <SubmitButton
              label="Delete note"
              pendingLabel="Deleting..."
              className="rounded-full border border-destructive/40 bg-background px-4 py-2 text-sm font-medium text-destructive shadow-sm transition hover:border-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </form>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-lg leading-8 text-foreground md:text-base md:leading-7">
          {note.body}
        </p>
      )}
    </div>
  )
}