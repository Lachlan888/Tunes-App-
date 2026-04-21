import type { Profile } from "@/lib/types"

type PublicProfileHeaderProps = {
  profile: Profile
  isOwnProfile: boolean
}

export default function PublicProfileHeader({
  profile,
  isOwnProfile,
}: PublicProfileHeaderProps) {
  const title = profile.show_identity
    ? profile.display_name || profile.username
    : "User profile"

  return (
    <header className="rounded border p-6">
      <h1 className="text-3xl font-bold">{title}</h1>

      {profile.show_identity && (
        <p className="mt-2 text-gray-600">@{profile.username}</p>
      )}

      {profile.show_identity && profile.bio && (
        <p className="mt-4 whitespace-pre-wrap text-gray-700">{profile.bio}</p>
      )}

      {isOwnProfile && (
        <p className="mt-4 text-sm text-gray-600">
          This is your public profile as other users see it.
        </p>
      )}

      {!profile.show_identity && (
        <p className="mt-4 text-sm text-gray-600">
          This profile is using limited public identity visibility.
        </p>
      )}
    </header>
  )
}