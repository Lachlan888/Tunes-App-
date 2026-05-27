import SubmitButton from "@/components/SubmitButton"
import {
  addUserInstrument,
  removeUserInstrument,
} from "@/lib/actions/user-instruments"
import type { UserInstrument } from "@/lib/types"

type ProfileDraft = {
  username: string
  displayName: string
  bio: string
  showIdentity: boolean
  showInstruments: boolean
  showPublicListsOnProfile: boolean
  showComposedTunesOnProfile: boolean
  showRepertoireSummary: boolean
  showRepertoireToFriends: boolean
  showCommentActivity: boolean
  showCompareDiscoverability: boolean
  compareRequiresFriend: boolean
  practiceDiaryEnabled: boolean
}

type UserInstrumentsSectionProps = {
  instruments: UserInstrument[]
  instrumentErrorMessage: string | null
  instrumentSaved: boolean
  instrumentRemoved: boolean
  profileDraft: ProfileDraft
}

const inputClassName =
  "flex-1 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const primaryButtonClassName =
  "rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-70"

const secondaryButtonClassName =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-70"

function ProfileDraftHiddenInputs({
  profileDraft,
}: {
  profileDraft: ProfileDraft
}) {
  return (
    <>
      <input
        type="hidden"
        name="profile_username"
        value={profileDraft.username}
      />
      <input
        type="hidden"
        name="profile_display_name"
        value={profileDraft.displayName}
      />
      <input type="hidden" name="profile_bio" value={profileDraft.bio} />
      <input
        type="hidden"
        name="profile_show_identity"
        value={String(profileDraft.showIdentity)}
      />
      <input
        type="hidden"
        name="profile_show_instruments"
        value={String(profileDraft.showInstruments)}
      />
      <input
        type="hidden"
        name="profile_show_public_lists_on_profile"
        value={String(profileDraft.showPublicListsOnProfile)}
      />
      <input
        type="hidden"
        name="profile_show_composed_tunes_on_profile"
        value={String(profileDraft.showComposedTunesOnProfile)}
      />
      <input
        type="hidden"
        name="profile_show_repertoire_summary"
        value={String(profileDraft.showRepertoireSummary)}
      />
      <input
        type="hidden"
        name="profile_show_repertoire_to_friends"
        value={String(profileDraft.showRepertoireToFriends)}
      />
      <input
        type="hidden"
        name="profile_show_comment_activity"
        value={String(profileDraft.showCommentActivity)}
      />
      <input
        type="hidden"
        name="profile_show_compare_discoverability"
        value={String(profileDraft.showCompareDiscoverability)}
      />
      <input
        type="hidden"
        name="profile_compare_requires_friend"
        value={String(profileDraft.compareRequiresFriend)}
      />
      <input
        type="hidden"
        name="profile_practice_diary_enabled"
        value={String(profileDraft.practiceDiaryEnabled)}
      />
    </>
  )
}

export default function UserInstrumentsSection({
  instruments,
  instrumentErrorMessage,
  instrumentSaved,
  instrumentRemoved,
  profileDraft,
}: UserInstrumentsSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Instruments
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Add the instruments you play so your public profile is more useful to
        other musicians.
      </p>

      {instrumentSaved && (
        <p className="mt-5 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm">
          Instrument added.
        </p>
      )}

      {instrumentRemoved && (
        <p className="mt-5 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm">
          Instrument removed.
        </p>
      )}

      {instrumentErrorMessage && (
        <p className="mt-5 rounded-2xl border border-destructive bg-muted p-4 text-sm font-medium text-destructive shadow-sm">
          {instrumentErrorMessage}
        </p>
      )}

      <form
        action={addUserInstrument}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input type="hidden" name="redirect_to" value="/dashboard" />
        <ProfileDraftHiddenInputs profileDraft={profileDraft} />

        <input
          name="instrument_name"
          placeholder="Add an instrument"
          className={inputClassName}
        />

        <SubmitButton
          label="Add"
          pendingLabel="Adding..."
          className={primaryButtonClassName}
        />
      </form>

      {instruments.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {instruments.map((instrument) => (
            <li
              key={instrument.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-foreground">
                {instrument.instrument_name}
              </span>

              <form action={removeUserInstrument}>
                <input
                  type="hidden"
                  name="instrument_id"
                  value={instrument.id}
                />
                <input type="hidden" name="redirect_to" value="/dashboard" />
                <ProfileDraftHiddenInputs profileDraft={profileDraft} />

                <SubmitButton
                  label="Remove"
                  pendingLabel="Removing..."
                  className={secondaryButtonClassName}
                />
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No instruments added yet.
        </p>
      )}
    </section>
  )
}
