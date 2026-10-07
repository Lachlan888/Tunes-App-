"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  createFestivalHubFromForm,
  removeFestivalCollectionFromForm,
  selectFestivalForHomeFromForm,
  setFestivalLifecycleFromForm,
  updateFestivalHubFromForm,
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
import { getFestivalSetupSummary } from "@/lib/festivals/setup"
import { festivalWorkspaceHref, type FestivalWorkspaceTab } from "@/lib/festivals/workspace"

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
  activeFestivalId: number | null
  activeTab: FestivalWorkspaceTab
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

function CreateFestivalForm({ openInitially }: { openInitially: boolean }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createFestivalHubFromForm, initialState)
  useEffect(() => {
    if (state.status === "success" && state.festivalId) {
      router.push(festivalWorkspaceHref(state.festivalId, "details"))
    }
  }, [router, state])
  return (
    <details className="border-y border-hairline py-5" open={openInitially ? true : undefined}>
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
    <form action={action} className="grid gap-4 py-6 sm:grid-cols-2">
      <input name="festival_id" type="hidden" value={festival.id} />
      <input name="curator_profile_id" type="hidden" value={festival.curator_profile_id ?? ""} />
      <h2 className="sm:col-span-2 font-sans text-2xl font-bold">Festival details</h2>
      <h3 className="sm:col-span-2 border-t border-hairline pt-5 text-base font-semibold">Identity</h3>
      <Field label="Name" name="name" defaultValue={festival.name} required />
      <Field label="Stable slug" name="slug" defaultValue={festival.slug} required />
      <label className="sm:col-span-2">
        <span className={formStyles.label}>Description</span>
        <textarea className={formStyles.textarea} name="description" defaultValue={festival.description ?? ""} />
      </label>
      <Field label="Timezone" name="timezone" defaultValue={festival.timezone} required />
      <Field label="Editorial order" name="editorial_order" type="number" defaultValue={festival.editorial_order} required />
      <Field label="Curator credit" name="curator_credit" defaultValue={festival.curator_credit} />
      <h3 className="sm:col-span-2 border-t border-hairline pt-5 text-base font-semibold">Branding</h3>
      <Field label="Branding image URL (optional)" name="branding_image_url" type="url" defaultValue={festival.branding_image_url} />
      <Field label="Branding alt text" name="branding_alt" defaultValue={festival.branding_alt} />
      <h3 className="sm:col-span-2 border-t border-hairline pt-5 text-base font-semibold">Programme source</h3>
      <Field label="Official programme URL" name="programme_url" type="url" defaultValue={festival.programme_url} />
      <Field label="Programme snapshot date" name="programme_snapshot_date" type="date" defaultValue={festival.programme_snapshot_date} />
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
    <li className="border-b border-hairline py-4">
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

function OwnerPreview({ festival, collections, sessions }: { festival: FestivalHub; collections: OwnerCollection[]; sessions: FestivalSession[] }) {
  return (
    <section className="overflow-hidden border-y border-hairline" aria-label="Owner-only festival preview">
      {festival.branding_image_url && festival.branding_alt ? (
        <div
          className="h-40 bg-cover bg-center"
          role="img"
          aria-label={festival.branding_alt}
          style={{ backgroundImage: `url(${festival.branding_image_url})` }}
        />
      ) : null}
      <div className="py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border-b border-state-due px-1 py-1 text-xs font-semibold capitalize">{festival.lifecycle}</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {festival.lifecycle === "draft" ? "Owner-only preview while Draft" : "Owner preview of the direct hub"}
          </span>
        </div>
        <h3 className="mt-4 font-sans text-2xl font-bold">{festival.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">/events/{festival.slug} · {festival.timezone}</p>
        {festival.description ? <p className="mt-4 max-w-3xl text-sm leading-6">{festival.description}</p> : null}
        {festival.curator_credit ? <p className="mt-3 text-sm text-muted-foreground">Curated by {festival.curator_credit}</p> : null}
        <div className="mt-5">
          <p className="text-sm font-semibold">Repertoire</p>
          {collections.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {collections.map((collection) => (
                <li key={collection.id} className="border-b border-hairline px-1 py-2 text-sm">
                  {collection.display_title ?? collection.learning_lists.name}
                  {collection.tradition_label ? ` · ${collection.tradition_label}` : ""}
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">No collections attached.</p>}
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold">Sessions</p>
          {sessions.length > 0 ? (
            <ul className="mt-2 divide-y divide-hairline">
              {sessions.map((session) => (
                <li key={session.id} className="py-2 text-sm">
                  {session.local_date ?? "Date not supplied"} · {session.title}
                  {session.needs_review ? <span className="ml-2 text-muted-foreground">Held for review · hidden from public hub</span> : null}
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">No sessions added.</p>}
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
    <section className="border-t border-hairline py-6">
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
        <p className="mt-6 border-t border-hairline py-5 text-sm text-muted-foreground">No public lists attached yet.</p>
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
    <form action={action} className="grid gap-4 border-t border-hairline py-5 sm:grid-cols-2">
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
              <label key={collection.id} className="flex items-start gap-3 border-b border-hairline py-3 text-sm">
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
      <label className="sm:col-span-2 flex items-start gap-3 border-l-4 border-state-due py-2 pl-3">
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
    <section className="border-t border-hairline py-6">
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
            <details key={session.id} className="border-t border-hairline">
              <summary className="cursor-pointer py-4 font-semibold">
                {session.local_date ?? "Date not supplied"} · {session.title}
                {session.needs_review ? <span className="ml-2 text-sm font-medium text-foreground">Held for review</span> : null}
              </summary>
              <SessionForm
                festival={festival}
                session={session}
                collections={collections}
                associations={sessionCollections.filter((association) => association.session_id === session.id)}
              />
            </details>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ReviewPanel({
  festival,
  settings,
  collections,
  sessions,
}: {
  festival: FestivalHub
  settings: FestivalSettings
  collections: OwnerCollection[]
  sessions: FestivalSession[]
}) {
  const [confirmLifecycle, setConfirmLifecycle] = useState<"draft" | "published" | "archived" | null>(null)
  const [lifecycleState, lifecycleAction, lifecyclePending] = useActionState(setFestivalLifecycleFromForm, initialState)
  const [selectionState, selectionAction, selectionPending] = useActionState(selectFestivalForHomeFromForm, initialState)
  useRefreshAfterSuccess(lifecycleState)
  useRefreshAfterSuccess(selectionState)
  const setup = getFestivalSetupSummary(festival, collections, sessions)
  const selected = settings.selected_festival_id === festival.id

  return (
    <div className="grid gap-8 py-6">
      <section aria-labelledby="festival-setup-title">
        <h2 id="festival-setup-title" className="font-sans text-2xl font-bold">Setup check</h2>
        <p className="mt-2 text-sm text-muted-foreground">Saved material for this festival. Review it against your source before publishing.</p>
        <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
          {([
            { label: "Core details", value: setup.details, tab: "details" },
            { label: "Branding (optional)", value: setup.branding, tab: "details" },
            { label: "Programme source (optional)", value: setup.programme, tab: "details" },
            { label: "Repertoire", value: setup.repertoire, tab: "repertoire" },
            { label: "Sessions", value: setup.sessions, tab: "sessions" },
          ] as const).map(({ label, value, tab }) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-5 gap-y-1 py-3 text-sm">
              <dt className="font-semibold"><Link className="underline-offset-2 hover:underline" href={festivalWorkspaceHref(festival.id, tab)}>{label}</Link></dt>
              <dd className="text-muted-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="festival-preview-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="festival-preview-title" className="font-sans text-2xl font-bold">Owner preview</h2>
          {festival.lifecycle !== "draft" ? (
            <Link className={buttonStyles.secondary} href={`/events/${festival.slug}`}>Open public hub</Link>
          ) : null}
        </div>
        <OwnerPreview festival={festival} collections={collections} sessions={sessions} />
      </section>

      <section className="border-t border-hairline pt-6" aria-labelledby="festival-publication-title">
        <h2 id="festival-publication-title" className="font-sans text-2xl font-bold">Publication</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {festival.lifecycle === "draft"
            ? "Draft is private to the owner. Publishing opens its direct public link."
            : festival.lifecycle === "published"
              ? "The direct hub link is public, even when Festival mode is off."
              : "The archive remains available at its direct link and cannot appear on Home."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {festival.lifecycle !== "published" ? (
            <button className={buttonStyles.primary} type="button" onClick={() => setConfirmLifecycle("published")}>
              {festival.lifecycle === "archived" ? "Republish hub" : "Publish hub"}
            </button>
          ) : null}
          {festival.lifecycle === "published" ? (
            <button className={buttonStyles.secondaryStrong} type="button" onClick={() => setConfirmLifecycle("archived")}>Archive hub</button>
          ) : null}
          {festival.lifecycle !== "draft" ? (
            <button className={buttonStyles.destructiveSecondary} type="button" onClick={() => setConfirmLifecycle("draft")}>Return to private draft</button>
          ) : null}
        </div>
        {confirmLifecycle ? (
          <div className="mt-5 border-l-4 border-state-due py-2 pl-4">
            <p className="font-semibold">Confirm {confirmLifecycle === "published" ? "publication" : confirmLifecycle === "archived" ? "archiving" : "withdrawal"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {confirmLifecycle === "published"
                ? "The direct hub link will become public. Festival mode will stay off until this hub is selected and enabled on Developer tools."
                : confirmLifecycle === "archived"
                  ? "The direct link will remain public as an archive. Its Home promotion will turn off."
                  : "The direct public link will stop working. Its Home promotion will turn off."}
            </p>
            {confirmLifecycle === "published" && setup.publicContentCount === 0 ? (
              <p className="mt-2 text-sm font-semibold text-foreground">No public lists or reviewed sessions are ready to appear on this hub.</p>
            ) : null}
            {confirmLifecycle === "published" && setup.heldSessions > 0 ? (
              <p className="mt-2 text-sm font-semibold text-foreground">{setup.heldSessions} held {setup.heldSessions === 1 ? "session will" : "sessions will"} stay hidden.</p>
            ) : null}
            <form action={lifecycleAction} className="mt-4 flex flex-wrap gap-3">
              <input type="hidden" name="festival_id" value={festival.id} />
              <input type="hidden" name="lifecycle" value={confirmLifecycle} />
              <button className={confirmLifecycle === "draft" ? buttonStyles.destructiveSecondary : buttonStyles.primary} type="submit" disabled={lifecyclePending}>
                {lifecyclePending ? "Saving…" : `Confirm ${confirmLifecycle === "published" ? "publication" : confirmLifecycle === "archived" ? "archiving" : "withdrawal"}`}
              </button>
              <button className={buttonStyles.secondary} type="button" onClick={() => setConfirmLifecycle(null)}>Cancel</button>
            </form>
          </div>
        ) : null}
        <ActionFeedback state={lifecycleState} />
      </section>

      <section className="border-t border-hairline pt-6" aria-labelledby="festival-home-selection-title">
        <h2 id="festival-home-selection-title" className="font-sans text-2xl font-bold">App-wide Home selection</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {selected
            ? settings.mode_enabled ? "This festival is live on Home." : "This festival is selected. Festival mode is off."
            : "Selecting this festival does not turn Festival mode on."}
        </p>
        {selected ? (
          <Link href="/dev" className={joinClasses(buttonStyles.secondary, "mt-4")}>Go to Festival mode switch</Link>
        ) : festival.lifecycle === "published" ? (
          <form action={selectionAction} className="mt-4">
            <input type="hidden" name="festival_id" value={festival.id} />
            <button className={buttonStyles.secondaryStrong} type="submit" disabled={selectionPending}>
              {selectionPending ? "Selecting…" : "Select for Home"}
            </button>
            {settings.mode_enabled ? (
              <p className="mt-2 text-sm text-muted-foreground">The current Home promotion will turn off when you change the selection.</p>
            ) : null}
            <ActionFeedback state={selectionState} />
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Publish this hub before selecting it for Home.</p>
        )}
      </section>
    </div>
  )
}

const tabs: Array<{ id: FestivalWorkspaceTab; label: string }> = [
  { id: "details", label: "Details" },
  { id: "repertoire", label: "Repertoire" },
  { id: "sessions", label: "Sessions" },
  { id: "review", label: "Review & publish" },
]

export default function FestivalManager({ settings, festivals, collections, sessions, sessionCollections, publicLists, activeFestivalId, activeTab }: FestivalManagerProps) {
  const router = useRouter()
  const festival = festivals.find((candidate) => candidate.id === activeFestivalId) ?? null
  const selectedFestival = festivals.find((candidate) => candidate.id === settings.selected_festival_id)
  const festivalCollections = collections.filter((collection) => collection.festival_id === activeFestivalId)
  const festivalSessions = sessions.filter((session) => session.festival_id === activeFestivalId)
  const festivalSessionCollections = sessionCollections.filter((association) => association.festival_id === activeFestivalId)
  const isSelected = festival?.id === settings.selected_festival_id
  const isLive = isSelected && settings.mode_enabled && festival?.lifecycle === "published"
  const heldSessionCount = festivalSessions.filter((session) => session.needs_review).length
  return (
    <div className="grid gap-6">
      <CreateFestivalForm openInitially={festivals.length === 0} />
      {festivals.length > 0 ? (
        <div className="grid gap-4 border-y border-hairline py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label>
            <span className={formStyles.label}>Festival to edit</span>
            <select
              className={formStyles.select}
              value={activeFestivalId ?? ""}
              onChange={(event) => router.push(festivalWorkspaceHref(Number(event.target.value), "details"))}
            >
              {festivals.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.lifecycle})</option>
              ))}
            </select>
          </label>
          <p className="text-sm text-muted-foreground">Selected for Home: {selectedFestival?.name ?? "None"} · Mode {settings.mode_enabled ? "On" : "Off"}</p>
        </div>
      ) : null}
      {festival ? (
        <>
          <header>
            <h2 className="font-sans text-3xl font-bold">{festival.name}</h2>
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="capitalize">{festival.lifecycle}</span>
              {isSelected ? <span>Selected for Home</span> : null}
              {isLive ? <span className="font-semibold text-state-known">Live on Home</span> : null}
              {festival.lifecycle === "draft" ? <span>Private owner preview</span> : <span>Direct link available</span>}
            </p>
          </header>
          <nav className="grid grid-cols-2 gap-x-2 border-b border-hairline sm:flex" aria-label="Festival setup sections">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={festivalWorkspaceHref(festival.id, tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
                className={joinClasses(
                  "min-h-11 border-b-2 px-3 py-3 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--focus-ring)]",
                  activeTab === tab.id ? "border-action-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.id === "repertoire" ? ` (${festivalCollections.length})` : null}
                {tab.id === "sessions" ? ` (${festivalSessions.length}${heldSessionCount ? `, ${heldSessionCount} held` : ""})` : null}
              </Link>
            ))}
          </nav>
          {activeTab === "details" ? <FestivalDetailsForm key={festival.id} festival={festival} /> : null}
          {activeTab === "repertoire" ? <CollectionsPanel key={festival.id} festival={festival} collections={festivalCollections} publicLists={publicLists} /> : null}
          {activeTab === "sessions" ? (
            <SessionsPanel key={festival.id} festival={festival} sessions={festivalSessions} collections={festivalCollections} sessionCollections={festivalSessionCollections} />
          ) : null}
          {activeTab === "review" ? <ReviewPanel key={`${festival.id}:${festival.lifecycle}`} festival={festival} settings={settings} collections={festivalCollections} sessions={festivalSessions} /> : null}
        </>
      ) : (
        <p className="border-y border-hairline py-8 text-center text-sm text-muted-foreground">
          Create a private draft festival to begin.
        </p>
      )}
    </div>
  )
}
