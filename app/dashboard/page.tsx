import SubmitButton from "@/components/SubmitButton"
import { updateProfile } from "@/lib/actions/profile"
import {
  addUserInstrument,
  removeUserInstrument,
} from "@/lib/actions/user-instruments"
import { loadOwnProfileData } from "@/lib/loaders/profile"

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string
    saved?: string
    username?: string
    display_name?: string
    instrument_error?: string
    instrument_saved?: string
    instrument_removed?: string
  }>
}

function getErrorMessage(error?: string) {
  if (error === "username_taken") {
    return "That username is already taken."
  }

  if (error === "invalid_username") {
    return "Username must be 3–30 characters and use only letters, numbers, and underscores."
  }

  if (error === "save_failed") {
    return "Profile could not be saved. Please try again."
  }

  return null
}

function getInstrumentErrorMessage(error?: string) {
  if (error === "blank") {
    return "Instrument name cannot be blank."
  }

  if (error === "duplicate") {
    return "That instrument is already in your profile."
  }

  if (error === "missing") {
    return "Instrument could not be found."
  }

  if (error === "save_failed") {
    return "Instrument could not be saved. Please try again."
  }

  if (error === "delete_failed") {
    return "Instrument could not be removed. Please try again."
  }

  return null
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined
  const { user, profile, instruments } = await loadOwnProfileData()

  const errorMessage = getErrorMessage(params?.error)
  const instrumentErrorMessage = getInstrumentErrorMessage(
    params?.instrument_error
  )

  const usernameValue = params?.username ?? profile?.username ?? ""
  const displayNameValue = params?.display_name ?? profile?.display_name ?? ""
  const bioValue = profile?.bio ?? ""

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <p className="mt-4 text-gray-600">You are logged in as {user.email}</p>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-semibold">Profile details</h2>

        {params?.saved === "1" && (
          <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
            Profile saved.
          </p>
        )}

        {params?.instrument_saved === "1" && (
          <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
            Instrument added.
          </p>
        )}

        {params?.instrument_removed === "1" && (
          <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
            Instrument removed.
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {errorMessage}
          </p>
        )}

        {instrumentErrorMessage && (
          <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {instrumentErrorMessage}
          </p>
        )}

        <form action={updateProfile} className="mt-4 space-y-6">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Public username
            </label>
            <input
              id="username"
              name="username"
              defaultValue={usernameValue}
              className="w-full rounded border p-2"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              3–30 characters, letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label
              htmlFor="display_name"
              className="mb-1 block text-sm font-medium"
            >
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={displayNameValue}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1 block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              defaultValue={bioValue}
              rows={4}
              className="w-full rounded border p-2"
              placeholder="Tell other users a little about yourself"
            />
          </div>

          <div className="rounded border p-4">
            <h3 className="text-lg font-semibold">Profile visibility</h3>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_identity"
                  defaultChecked={profile?.show_identity ?? true}
                />
                <span>Show identity on public profile</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_instruments"
                  defaultChecked={profile?.show_instruments ?? true}
                />
                <span>Show instruments on public profile</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_public_lists_on_profile"
                  defaultChecked={profile?.show_public_lists_on_profile ?? true}
                />
                <span>Show public lists on public profile</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_repertoire_summary"
                  defaultChecked={profile?.show_repertoire_summary ?? false}
                />
                <span>Show repertoire summary on public profile</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_comment_activity"
                  defaultChecked={profile?.show_comment_activity ?? false}
                />
                <span>Show comment activity on public profile</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_compare_discoverability"
                  defaultChecked={profile?.show_compare_discoverability ?? true}
                />
                <span>Allow profile to be discoverable for compare</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="compare_requires_friend"
                  defaultChecked={profile?.compare_requires_friend ?? false}
                />
                <span>Require friendship before others can compare with me</span>
              </label>
            </div>
          </div>

          <SubmitButton
            label="Save profile"
            pendingLabel="Saving..."
            className="rounded bg-black px-4 py-2 text-white"
          />
        </form>
      </section>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-semibold">Instruments</h2>

        <form action={addUserInstrument} className="mt-4 flex gap-2">
          <input type="hidden" name="redirect_to" value="/dashboard" />
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
                className="flex items-center justify-between rounded border p-2"
              >
                <span>{instrument.instrument_name}</span>

                <form action={removeUserInstrument}>
                  <input
                    type="hidden"
                    name="instrument_id"
                    value={instrument.id}
                  />
                  <input type="hidden" name="redirect_to" value="/dashboard" />
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
    </main>
  )
}