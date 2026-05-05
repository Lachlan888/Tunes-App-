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

  return (
    <header className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        {title}
      </h1>

      {profile.show_identity && profile.bio ? (
        <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {profile.bio}
        </p>
      ) : null}

      {isOwnProfile ? (
        <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
          This is your public profile as other musicians see it. Visibility
          settings on your Profile page control what appears here.
        </div>
      ) : null}

      {!profile.show_identity ? (
        <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
          This musician has chosen limited public identity visibility.
        </div>
      ) : null}
    </header>
  )
}