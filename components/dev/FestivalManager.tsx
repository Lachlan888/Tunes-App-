"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  createFestivalHubFromForm,
  removeFestivalCollectionFromForm,
  updateFestivalHubFromForm,
  updateFestivalSettingsFromForm,
  upsertFestivalCollectionFromForm,
  upsertFestivalSessionFromForm,
  type FestivalActionState,
} from "@/lib/actions/festivals"
import type {
  FestivalCollection,
  FestivalHub,
  FestivalSession,
  FestivalSessionCollection,
  FestivalSettings,
} from "@/lib/types/festivals"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { formStyles } from "@/components/ui/formStyles"

type OwnerCollection = FestivalCollection & {
  learning_lists: { id: number; name: string; visibility: "public" }
}

type FestivalManagerProps = {
  settings: FestivalSettings
  festivals: FestivalHub[]
  collections: OwnerCollection[]
  sessions: FestivalSession[]
  sessionCollections: FestivalSessionCollection[]
  publicLists: Array<{ id: number; name: string }>
}

const initialState: FestivalActionState = {
  status: "idle",
  message: null,
  field: null,
}

function ActionFeedback({ state }: { state: FestivalActionState }) {
  if (!state.message) return null
  return (
    <p
      className={joinClasses(
        "mt-3 text-sm font-medium",
        state.status === "success" ? "text-state-known" : "text-action-destructive"
      )}
      role="status"
    >
      {state.message}
    </p>
  )
}

function useRefreshAfterSuccess(state: FestivalActionState) {
  const router = useRouter()
  useEffect(() => {
    if (state.status === "success") router.refresh()
  }, [router, state])
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string | number | null
  required?: boolean
  type?: "text" | "url" | "date" | "time" | "number"
  placeholder?: string
}) {
  return (
    <label>
      <span className={formStyles.label}>{label}</span>
      <input
        className={formStyles.input}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
      />
    </label>
  )
}

function SettingsForm({ settings, festivals }: Pick<FestivalManagerProps, "settings" | "festivals">) {
  const [state, action, pending] = useActionState(updateFestivalSettingsFromForm, initialState)
  useRefreshAfterSuccess(state)
  return (
    <form action={action} className="rounded-object border border-border bg-background/70 p-5">
      <h2 className="font-sans text-2xl font-bold">Launch controls</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Mode controls only the Home promotion. Turning it off does not unpublish a hub or alter saved lists.
      </p>
      <label className="mt-5 flex items-start gap-3">
        <input
          className={formStyles.checkbox}
          name="mode_enabled"
          type="checkbox"
          value="true"
          defaultChecked={settings.mode_enabled}
        />
        <span>
          <span className="block text-sm font-semibold">Festival mode On</span>
          <span className="mt-1 block text-sm text-muted-foreground">Requires the selected hub to be Published.</span>
        </span>
      </label>
      <label className="mt-5 block">
        <span className={formStyles.label}>Selected festival</span>
        <select className={formStyles.select} name="selected_festival_id" defaultValue={settings.selected_festival_id ?? ""}>
          <option value="">None</option>
          {festivals.map((festival) => (
            <option key={festival.id} value={festival.id}>
              {festival.name} ({festival.lifecycle})
            </option>
          ))}
        </select>
      </label>
      <button className={joinClasses(buttonStyles.primary, "mt-5")} disabled={pending} type="submit">
        {pending ? "Saving…" : "Save launch controls"}
      </button>
      <ActionFeedback state={state} />
    </form>
  )
}

function CreateFestivalForm() {
  const [state, action, pending] = useActionState(createFestivalHubFromForm, initialState)
  useRefreshAfterSuccess(state)
  return (
    <details className="rounded-object border border-border bg-background/70 p-5">
      <summary className="cursor-pointer font-sans text-xl font-bold">Create a draft hub</summary>
      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Stable slug" name="slug" placeholder="festival-name-2027" required />
        <Field label="Timezone" name="timezone" defaultValue="Australia/Melbourne" required />
        <Field label="Editorial order" name="editorial_order" type="number" defaultValue={0} required />
        <label className="sm:col-span-2">
          <span className={formStyles.label}>Description</span>
          <textarea className={formStyles.textarea} name="description" />
        </label>
        <div className="sm:col-span-2">
          <button className={buttonStyles.primary} disabled={pending} type="submit">
            {pending ? "Creating…" : "Create private draft"}
          </button>
          <ActionFeedback state={state} />
        </div>
      </form>
    </details>
  )
}

function FestivalDetailsForm({ festival }: { festival: FestivalHub }) {
  const [state, action, pending] = useActionState(updateFestivalHubFromForm, initialState)
  useRefreshAfterSuccess(state)
  return (
    <form action={action} className="grid gap-4 rounded-object border border-border bg-background/70 p-5 sm:grid-cols-2">
      <input name="festival_id" type="hidden" value={festival.id} />
      <input name="curator_profile_id" type="hidden" value={festival.curator_profile_id ?? ""} />
      <div className="sm:col-span-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">Manage and preview</p>
          <h2 className="mt-1 font-sans text-2xl font-bold">{festival.name}</h2>
        </div>
        {festival.lifecycle === "draft" ? (
          <span className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold">Private owner preview</span>
        ) : (
          <Link className={buttonStyles.secondary} href={`/events/${festival.slug}`}>Open public hub</Link>
        )}
      </div>
      <Field label="Name" name="name" defaultValue={festival.name} required />
      <Field label="Stable slug" name="slug" defaultValue={festival.slug} required />
      <label className="sm:col-span-2">
        <span className={formStyles.label}>Description</span>
        <textarea className={formStyles.textarea} name="description" defaultValue={festival.description ?? ""} />
      </label>
      <Field label="Timezone" name="timezone" defaultValue={festival.timezone} required />
      <Field label="Editorial order" name="editorial_order" type="number" defaultValue={festival.editorial_order} required />
      <Field label="Branding image URL (optional)" name="branding_image_url" type="url" defaultValue={festival.branding_image_url} />
      <Field label="Branding alt text" name="branding_alt" defaultValue={festival.branding_alt} />
      <Field label="Official programme URL" name="programme_url" type="url" defaultValue={festival.programme_url} />
      <Field label="Programme snapshot date" name="programme_snapshot_date" type="date" defaultValue={festival.programme_snapshot_date} />
      <Field label="Curator credit" name="curator_credit" defaultValue={festival.curator_credit} />
      <label>
        <span className={formStyles.label}>Lifecycle</span>
        <select className={formStyles.select} name="lifecycle" defaultValue={festival.lifecycle}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <div className="sm:col-span-2">
        <button className={buttonStyles.primary} disabled={pending} type="submit">
          {pending ? "Saving…" : "Save festival details"}
        </button>
        <ActionFeedback state={state} />
      </div>
    </form>
  )
}

function CollectionForm({ collection, festivalId }: { collection: OwnerCollection; festivalId: number }) {
  const [saveState, saveAction, saving] = useActionState(upsertFestivalCollectionFromForm, initialState)
  const [removeState, removeAction, removing] = useActionState(removeFestivalCollectionFromForm, initialState)
  useRefreshAfterSuccess(saveState)
  useRefreshAfterSuccess(removeState)
  return (
    <li className="rounded-object border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{collection.learning_lists.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">Source list #{collection.learning_list_id}; tune membership stays in Lists.</p>
        </div>
        <Link className={buttonStyles.text} href={`/learning-lists/${collection.learning_list_id}`}>Open list editor</Link>
      </div>
      <form action={saveAction} className="mt-4 grid gap-3 sm:grid-cols-4">
        <input name="festival_id" type="hidden" value={festivalId} />
        <input name="learning_list_id" type="hidden" value={collection.learning_list_id} />
        <input name="profile_id" type="hidden" value={collection.profile_id ?? ""} />
        <label>
          <span className={formStyles.label}>Kind</span>
          <select className={formStyles.select} name="collection_kind" defaultValue={collection.collection_kind}>
            <option value="artist">Artist</option>
            <option value="tradition">Tradition</option>
            <option value="general">General</option>
          </select>
        </label>
        <Field label="Display title" name="display_title" defaultValue={collection.display_title} />
        <Field label="Display credit" name="display_credit" defaultValue={collection.display_credit} />
        <Field label="Tradition label" name="tradition_label" defaultValue={collection.tradition_label} />
        <Field label="Order" name="editorial_order" type="number" defaultValue={collection.editorial_order} required />
        <div className="sm:col-span-4 flex flex-wrap gap-3">
          <button className={buttonStyles.secondaryStrong} disabled={saving} type="submit">
            {saving ? "Saving…" : "Save association"}
          </button>
        </div>
        <ActionFeedback state={saveState} />
      </form>
      <form action={removeAction} className="mt-3">
        <input name="festival_id" type="hidden" value={festivalId} />
        <input name="collection_id" type="hidden" value={collection.id} />
        <button className={buttonStyles.destructiveSecondary} disabled={removing} type="submit">
          {removing ? "Detaching…" : "Detach from festival"}
        </button>
        <ActionFeedback state={removeState} />
      </form>
    </li>
  )
}

function OwnerPreview({ festival, collections }: { festival: FestivalHub; collections: OwnerCollection[] }) {
  return (
    <section className="overflow-hidden rounded-object border border-border bg-background/70" aria-label="Owner-only festival preview">
      {festival.branding_image_url && festival.branding_alt ? (
        <div
          className="h-40 bg-cover bg-center"
          role="img"
          aria-label={festival.branding_alt}
          style={{ backgroundImage: `url(${festival.branding_image_url})` }}
        />
      ) : null}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold capitalize">{festival.lifecycle}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {festival.lifecycle === "draft" ? "Owner-only preview while Draft" : "Owner preview of the direct hub"}
          </span>
        </div>
        <h2 className="mt-4 font-sans text-3xl font-bold">{festival.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">/events/{festival.slug} · {festival.timezone}</p>
        {festival.description ? <p className="mt-4 max-w-3xl text-sm leading-6">{festival.description}</p> : null}
        {festival.curator_credit ? <p className="mt-3 text-sm text-muted-foreground">Curated by {festival.curator_credit}</p> : null}
        <div className="mt-5">
          <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">Collection preview</p>
          {collections.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {collections.map((collection) => (
                <li key={collection.id} className="rounded-pill border border-border px-3 py-2 text-sm">
                  {collection.display_title ?? collection.learning_lists.name}
                  {collection.tradition_label ? ` · ${collection.tradition_label}` : ""}
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">No collections attached.</p>}
        </div>
      </div>
    </section>
  )
}

function CollectionsPanel({
  festival,
  collections,
  publicLists,
}: {
  festival: FestivalHub
  collections: OwnerCollection[]
  publicLists: Array<{ id: number; name: string }>
}) {
  const [state, action, pending] = useActionState(upsertFestivalCollectionFromForm, initialState)
  useRefreshAfterSuccess(state)
  const attachedIds = new Set(collections.map((collection) => collection.learning_list_id))
  const available = publicLists.filter((list) => !attachedIds.has(list.id))
  return (
    <section className="rounded-object border border-border bg-background/70 p-5">
      <div>
        <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">Existing public Lists</p>
        <h2 className="mt-1 font-sans text-2xl font-bold">Curated collections</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Associations control festival labels and order only. Detaching never removes tunes or changes the source list.
        </p>
      </div>
      <form action={action} className="mt-5 grid gap-3 sm:grid-cols-4">
        <input name="festival_id" type="hidden" value={festival.id} />
        <label className="sm:col-span-2">
          <span className={formStyles.label}>Public list</span>
          <select className={formStyles.select} name="learning_list_id" required defaultValue="">
            <option disabled value="">Choose a public list</option>
            {available.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
          </select>
        </label>
        <label>
          <span className={formStyles.label}>Kind</span>
          <select className={formStyles.select} name="collection_kind" defaultValue="general">
            <option value="artist">Artist</option>
            <option value="tradition">Tradition</option>
            <option value="general">General</option>
          </select>
        </label>
        <Field label="Order" name="editorial_order" type="number" defaultValue={collections.length} required />
        <div className="sm:col-span-4">
          <button className={buttonStyles.primary} disabled={pending || available.length === 0} type="submit">
            {pending ? "Attaching…" : available.length === 0 ? "No unattached public lists" : "Attach list"}
          </button>
          <ActionFeedback state={state} />
        </div>
      </form>
      {collections.length > 0 ? (
        <ul className="mt-6 grid gap-3">
          {collections.map((collection) => (
            <CollectionForm key={collection.id} collection={collection} festivalId={festival.id} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-object border border-dashed border-border p-5 text-sm text-muted-foreground">No public lists attached yet.</p>
      )}
    </section>
  )
}

function SessionForm({
  festival,
  session,
  collections,
  associations,
}: {
  festival: FestivalHub
  session?: FestivalSession
  collections: OwnerCollection[]
  associations: FestivalSessionCollection[]
}) {
  const [state, action, pending] = useActionState(upsertFestivalSessionFromForm, initialState)
  useRefreshAfterSuccess(state)
  const attachedIds = new Set(associations.map((association) => association.festival_collection_id))
  return (
    <form action={action} className="grid gap-4 rounded-object border border-border bg-background p-4 sm:grid-cols-2">
      <input name="festival_id" type="hidden" value={festival.id} />
      {session ? <input name="id" type="hidden" value={session.id} /> : null}
      <input name="leader_profile_id" type="hidden" value={session?.leader_profile_id ?? ""} />
      <Field label="Session title" name="title" defaultValue={session?.title} required />
      <Field label="Leader or host" name="leader_name" defaultValue={session?.leader_name} />
      <Field label="Published local date" name="local_date" type="date" defaultValue={session?.local_date} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time" name="local_start_time" type="time" defaultValue={session?.local_start_time?.slice(0, 5)} />
        <Field label="End time" name="local_end_time" type="time" defaultValue={session?.local_end_time?.slice(0, 5)} />
      </div>
      <Field label="Venue" name="venue" defaultValue={session?.venue} />
      <label>
        <span className={formStyles.label}>Programme status</span>
        <select className={formStyles.select} name="status" defaultValue={session?.status ?? "scheduled"}>
          <option value="scheduled">Scheduled</option>
          <option value="changed">Changed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <Field label="Order at the same time" name="editorial_order" type="number" defaultValue={session?.editorial_order ?? 0} required />
      <label className="sm:col-span-2">
        <span className={formStyles.label}>Source and review notes</span>
        <textarea
          className={formStyles.textarea}
          name="source_note"
          defaultValue={session?.source_note ?? ""}
          placeholder="Programme photo/page, snapshot date, and any unclear names, dates, times or list matches."
        />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className={formStyles.label}>Existing festival repertoire lists</legend>
        {collections.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {collections.map((collection) => (
              <label key={collection.id} className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                <input
                  className={formStyles.checkbox}
                  name="festival_collection_ids"
                  type="checkbox"
                  value={collection.id}
                  defaultChecked={attachedIds.has(collection.id)}
                />
                <span>
                  <span className="block font-semibold">{collection.display_title ?? collection.learning_lists.name}</span>
                  <span className="mt-1 block text-muted-foreground">Links to public List #{collection.learning_list_id}</span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Attach public collections before matching session repertoire.</p>
        )}
      </fieldset>
      <label className="sm:col-span-2 flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <input
          className={formStyles.checkbox}
          name="needs_review"
          type="checkbox"
          value="true"
          defaultChecked={session?.needs_review ?? true}
        />
        <span>
          <span className="block text-sm font-semibold">Hold for owner review</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Keep this checked while any extracted field or list match is ambiguous. Held sessions never appear on the public hub.
          </span>
        </span>
      </label>
      <div className="sm:col-span-2">
        <button className={session ? buttonStyles.secondaryStrong : buttonStyles.primary} disabled={pending} type="submit">
          {pending ? "Saving…" : session ? "Save reviewed session" : "Create review draft"}
        </button>
        <ActionFeedback state={state} />
      </div>
    </form>
  )
}

function SessionsPanel({
  festival,
  sessions,
  collections,
  sessionCollections,
}: {
  festival: FestivalHub
  sessions: FestivalSession[]
  collections: OwnerCollection[]
  sessionCollections: FestivalSessionCollection[]
}) {
  return (
    <section className="rounded-object border border-border bg-background/70 p-5">
      <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">Reviewed programme intake</p>
      <h2 className="mt-1 font-sans text-2xl font-bold">Day-by-day sessions</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        From a supplied programme photo, prepare draft entries with the visible source and snapshot details, flag every unclear field or list match, then have the owner correct and uncheck the review hold before publication. Never guess missing information.
      </p>
      <details className="mt-5" open={sessions.length === 0}>
        <summary className="cursor-pointer font-semibold">Add a reviewed session draft</summary>
        <div className="mt-4">
          <SessionForm festival={festival} collections={collections} associations={[]} />
        </div>
      </details>
      {sessions.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {sessions.map((session) => (
            <SessionForm
              key={session.id}
              festival={festival}
              session={session}
              collections={collections}
              associations={sessionCollections.filter((association) => association.session_id === session.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default function FestivalManager({ settings, festivals, collections, sessions, sessionCollections, publicLists }: FestivalManagerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(settings.selected_festival_id ?? festivals[0]?.id ?? null)
  const effectiveSelectedId = festivals.some((candidate) => candidate.id === selectedId)
    ? selectedId
    : festivals[0]?.id ?? null
  const festival = festivals.find((candidate) => candidate.id === effectiveSelectedId) ?? null
  const festivalCollections = useMemo(
    () => collections.filter((collection) => collection.festival_id === effectiveSelectedId),
    [collections, effectiveSelectedId]
  )
  const festivalSessions = useMemo(
    () => sessions.filter((session) => session.festival_id === effectiveSelectedId),
    [sessions, effectiveSelectedId]
  )
  const festivalSessionCollections = useMemo(
    () => sessionCollections.filter((association) => association.festival_id === effectiveSelectedId),
    [sessionCollections, effectiveSelectedId]
  )
  return (
    <div className="grid gap-6">
      <SettingsForm settings={settings} festivals={festivals} />
      <CreateFestivalForm />
      {festivals.length > 0 ? (
        <label className="rounded-object border border-border bg-background/70 p-5">
          <span className={formStyles.label}>Hub to manage and preview</span>
          <select
            className={formStyles.select}
            value={effectiveSelectedId ?? ""}
            onChange={(event) => setSelectedId(Number(event.target.value))}
          >
            {festivals.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.lifecycle})</option>
            ))}
          </select>
        </label>
      ) : null}
      {festival ? (
        <>
          <OwnerPreview festival={festival} collections={festivalCollections} />
          <FestivalDetailsForm festival={festival} />
          <CollectionsPanel festival={festival} collections={festivalCollections} publicLists={publicLists} />
          <SessionsPanel
            festival={festival}
            sessions={festivalSessions}
            collections={festivalCollections}
            sessionCollections={festivalSessionCollections}
          />
        </>
      ) : (
        <p className="rounded-object border border-dashed border-border bg-background/50 p-8 text-center text-sm text-muted-foreground">
          Create a private draft hub to begin owner preview.
        </p>
      )}
    </div>
  )
}
