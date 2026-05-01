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
  showRepertoireSummary: boolean
  showCompareDiscoverability: boolean
  compareRequiresFriend: boolean
}

type UserInstrumentsSectionProps = {
  instruments: UserInstrument[]
  instrumentErrorMessage: string | null
  instrumentSaved: boolean
  instrumentRemoved: boolean
  profileDraft: ProfileDraft
}

function ProfileDraftHiddenInputs({
  profileDraft,
}: {
  profileDraft: ProfileDraft
}) {
  return (
    <>
      <input type="hidden" name="profile_username" value={profileDraft.username} />
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
        name="profile_show_repertoire_summary"
        value={String(profileDraft.showRepertoireSummary)}
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
    <section className="rounded border p-6">
      <h2 className="text-xl font-semibold">Instruments</h2>
      <p className="mt-1 text-sm text-gray-600">
        Add the instruments you play so your public profile is more useful to
        other musicians.
      </p>

      {instrumentSaved && (
        <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
          Instrument added.
        </p>
      )}

      {instrumentRemoved && (
        <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
          Instrument removed.
        </p>
      )}

      {instrumentErrorMessage && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {instrumentErrorMessage}
        </p>
      )}

      <form action={addUserInstrument} className="mt-4 flex gap-2">
        <input type="hidden" name="redirect_to" value="/dashboard" />
        <ProfileDraftHiddenInputs profileDraft={profileDraft} />
        <input
          name="instrument_name"
          placeholder="Add an instrument"
          className="flex-1 rounded border p-2"
        />
        <SubmitButton
          label="Add"
          pendingLabel="Adding..."
          className="rounded bg-black px-4 py-2 text-white"
        />
      </form>

      {instruments.length > 0 ? (
        <ul className="mt-4 space-y-2 text-gray-700">
          {instruments.map((instrument) => (
            <li
              key={instrument.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <span>{instrument.instrument_name}</span>

              <form action={removeUserInstrument}>
                <input type="hidden" name="instrument_id" value={instrument.id} />
                <input type="hidden" name="redirect_to" value="/dashboard" />
                <ProfileDraftHiddenInputs profileDraft={profileDraft} />
                <SubmitButton
                  label="Remove"
                  pendingLabel="Removing..."
                  className="rounded border px-3 py-1 text-sm"
                />
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-600">No instruments added yet.</p>
      )}
    </section>
  )
}