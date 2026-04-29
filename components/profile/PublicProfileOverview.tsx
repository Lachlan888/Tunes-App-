import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import type {
  Profile,
  PublicProfileList,
  RepertoireSummary,
  UserInstrument,
} from "@/lib/types"

type PublicProfileOverviewProps = {
  profile: Profile
  instruments: UserInstrument[]
  publicLists: PublicProfileList[]
  repertoireSummary: RepertoireSummary | null
  isOwnProfile: boolean
}

export default function PublicProfileOverview({
  profile,
  instruments,
  publicLists,
  repertoireSummary,
  isOwnProfile,
}: PublicProfileOverviewProps) {
  return (
    <>
      {profile.show_repertoire_summary && repertoireSummary && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">Repertoire summary</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded border p-3">
              <p className="text-sm text-gray-500">Known tunes</p>
              <p className="mt-1 text-2xl font-semibold">
                {repertoireSummary.known_count}
              </p>
            </div>

            <div className="rounded border p-3">
              <p className="text-sm text-gray-500">In practice</p>
              <p className="mt-1 text-2xl font-semibold">
                {repertoireSummary.practice_count}
              </p>
            </div>
          </div>
        </section>
      )}

      {profile.show_instruments && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">
            Instruments ({instruments.length})
          </h2>

          {instruments.length > 0 ? (
            <ul className="mt-4 list-disc pl-5 text-gray-700">
              {instruments.map((instrument) => (
                <li key={instrument.id}>{instrument.instrument_name}</li>
              ))}
            </ul>
          ) : isOwnProfile ? (
            <EmptyState
              title="No instruments listed"
              description="Add instruments on your Profile page so other players know what you play."
              primaryActionHref="/dashboard"
              primaryActionLabel="Edit Profile"
              className="mt-4"
            />
          ) : (
            <EmptyState
              title="No instruments listed"
              description="This user has not added instruments to their profile yet."
              className="mt-4"
            />
          )}
        </section>
      )}

      {profile.show_public_lists_on_profile && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">
            Public lists ({publicLists.length})
          </h2>

          {publicLists.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {publicLists.map((list) => (
                <li key={list.id} className="rounded border p-3">
                  <Link
                    href={`/public-lists/${list.id}`}
                    className="font-medium underline hover:no-underline"
                  >
                    {list.name}
                  </Link>

                  {list.description && (
                    <p className="mt-1 text-gray-600">{list.description}</p>
                  )}

                  <p className="mt-2 text-sm text-gray-500">
                    {list.tune_count} {list.tune_count === 1 ? "tune" : "tunes"}
                  </p>
                </li>
              ))}
            </ul>
          ) : isOwnProfile ? (
            <EmptyState
              title="No public lists yet"
              description="Make one of your lists public if you want other users to browse or import it."
              primaryActionHref="/learning-lists"
              primaryActionLabel="Manage Lists"
              className="mt-4"
            />
          ) : (
            <EmptyState
              title="No public lists yet"
              description="Public lists this user chooses to share will appear here."
              className="mt-4"
            />
          )}
        </section>
      )}
    </>
  )
}