import Link from "next/link"
import { notFound } from "next/navigation"
import { loadPublicProfileData } from "@/lib/loaders/profile-public"

type PublicProfilePageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params
  const { profile, instruments, publicLists } = await loadPublicProfileData(
    username
  )

  if (!profile) {
    notFound()
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        {profile.show_identity
          ? profile.display_name || profile.username
          : "User profile"}
      </h1>

      {profile.show_identity && (
        <p className="mt-2 text-gray-600">@{profile.username}</p>
      )}

      {profile.show_identity && profile.bio && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">About</h2>
          <p className="mt-3 whitespace-pre-wrap text-gray-700">{profile.bio}</p>
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
          ) : (
            <p className="mt-4 text-gray-600">No instruments listed.</p>
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
          ) : (
            <p className="mt-4 text-gray-600">No public lists yet.</p>
          )}
        </section>
      )}
    </main>
  )
}