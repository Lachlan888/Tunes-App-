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
    : "Tunes App user"
  const showUsername =
    profile.show_identity && profile.display_name && profile.display_name !== profile.username

  return (
    <header className="min-w-0 max-w-full rounded-2xl bg-card p-4 shadow-sm md:rounded-3xl md:border md:border-border md:p-6">
      <h1 className="min-w-0 max-w-full break-words font-serif text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
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
        <div className="mt-5 border-t border-border pt-4 text-sm leading-6 text-muted-foreground md:mt-6 md:rounded-2xl md:border md:bg-background/70 md:p-4">
          This is your public profile as other musicians see it. Visibility
          settings on your Profile page control what appears here.
        </div>
      ) : null}

      {!profile.show_identity ? (
        <div className="mt-5 border-t border-border pt-4 text-sm leading-6 text-muted-foreground md:mt-6 md:rounded-2xl md:border md:bg-background/70 md:p-4">
          This musician has chosen limited public identity visibility.
        </div>
      ) : null}
    </header>
  )
}
