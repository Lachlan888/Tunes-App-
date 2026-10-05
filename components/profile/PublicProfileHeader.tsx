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
    : "Tunes App musician"
  const showUsername =
    profile.show_identity && profile.display_name && profile.display_name !== profile.username

  return (
    <header className="min-w-0 max-w-full border-y border-hairline py-5 md:py-6">
      <h1 className="min-w-0 max-w-full break-words font-sans text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>

      {showUsername ? (
        <p className="mt-2 min-w-0 max-w-full break-words text-sm font-medium text-muted-foreground md:text-base">
          @{profile.username}
        </p>
      ) : null}

      {profile.show_identity && profile.bio ? (
        <p className="mt-4 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground md:mt-5">
          {profile.bio}
        </p>
      ) : null}

      {isOwnProfile ? (
        <div className="mt-5 border-t border-hairline pt-4 text-sm leading-6 text-muted-foreground md:mt-6">
          This is how other musicians see your profile. Change what appears
          from your Profile settings.
        </div>
      ) : null}

      {!profile.show_identity ? (
        <div className="mt-5 border-t border-hairline pt-4 text-sm leading-6 text-muted-foreground md:mt-6">
          This musician has chosen limited public identity visibility.
        </div>
      ) : null}
    </header>
  )
}
