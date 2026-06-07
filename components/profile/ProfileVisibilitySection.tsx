"use client"

import type { Profile } from "@/lib/types"

type ProfileVisibilitySectionProps = {
  profile: Profile | null
  showIdentity: boolean
  setShowIdentity: (value: boolean) => void
  showInstruments: boolean
  setShowInstruments: (value: boolean) => void
  showPublicListsOnProfile: boolean
  setShowPublicListsOnProfile: (value: boolean) => void
  showComposedTunesOnProfile: boolean
  setShowComposedTunesOnProfile: (value: boolean) => void
  showRepertoireSummary: boolean
  setShowRepertoireSummary: (value: boolean) => void
  showRepertoireToFriends: boolean
  setShowRepertoireToFriends: (value: boolean) => void
  showCommentActivity: boolean
  setShowCommentActivity: (value: boolean) => void
  showCompareDiscoverability: boolean
  setShowCompareDiscoverability: (value: boolean) => void
  compareRequiresFriend: boolean
  setCompareRequiresFriend: (value: boolean) => void
  practiceDiaryEnabled: boolean
  setPracticeDiaryEnabled: (value: boolean) => void
}

type VisibilityToggleProps = {
  name: string
  checked: boolean
  onChange: (value: boolean) => void
  title: string
  description: string
}

function VisibilityToggle({
  name,
  checked,
  onChange,
  title,
  description,
}: VisibilityToggleProps) {
  return (
    <label className="block rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:bg-muted">
      <span className="flex items-start gap-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
        />

        <span>
          <span className="block text-sm font-semibold text-foreground">
            {title}
          </span>

          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
    </label>
  )
}

export default function ProfileVisibilitySection({
  profile,
  showIdentity,
  setShowIdentity,
  showInstruments,
  setShowInstruments,
  showPublicListsOnProfile,
  setShowPublicListsOnProfile,
  showComposedTunesOnProfile,
  setShowComposedTunesOnProfile,
  showRepertoireSummary,
  setShowRepertoireSummary,
  showRepertoireToFriends,
  setShowRepertoireToFriends,
  showCommentActivity,
  setShowCommentActivity,
  showCompareDiscoverability,
  setShowCompareDiscoverability,
  compareRequiresFriend,
  setCompareRequiresFriend,
  practiceDiaryEnabled,
  setPracticeDiaryEnabled,
}: ProfileVisibilitySectionProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-border bg-muted p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice settings
        </h3>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Turn on optional practice diary logging. When enabled, formal reviews
          are grouped into dated diary pages.
        </p>

        <div className="mt-5">
          <VisibilityToggle
            name="practice_diary_enabled"
            checked={practiceDiaryEnabled}
            onChange={setPracticeDiaryEnabled}
            title="Enable Practice Diary"
            description="Create a date-bound diary of reviewed tunes and practice activity. This does not change Stage, due dates, streaks, or backlog rules."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-muted p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Public profile settings
        </h3>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Control what other musicians can see on your public profile, whether
          they can compare with you, and which activity appears to friends.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <VisibilityToggle
            name="show_identity"
            checked={showIdentity}
            onChange={setShowIdentity}
            title="Show identity"
            description="Show your display name, username, and bio on your public profile."
          />

          <VisibilityToggle
            name="show_instruments"
            checked={showInstruments}
            onChange={setShowInstruments}
            title="Show instruments"
            description="Let other musicians see the instruments listed on your profile."
          />

          <VisibilityToggle
            name="show_public_lists_on_profile"
            checked={showPublicListsOnProfile}
            onChange={setShowPublicListsOnProfile}
            title="Show public lists"
            description="Display your public tune lists on your profile page and allow public-list activity to appear to friends."
          />

          <VisibilityToggle
            name="show_composed_tunes_on_profile"
            checked={showComposedTunesOnProfile}
            onChange={setShowComposedTunesOnProfile}
            title="Show composed tunes"
            description="Show shared tunes where you are listed as the composer."
          />

          <VisibilityToggle
            name="show_repertoire_summary"
            checked={showRepertoireSummary}
            onChange={setShowRepertoireSummary}
            title="Show repertoire summary"
            description="Show simple known and practice tune counts on your public profile."
          />

          <VisibilityToggle
            name="show_repertoire_to_friends"
            checked={showRepertoireToFriends}
            onChange={setShowRepertoireToFriends}
            title="Show repertoire to friends"
            description="Let accepted friends browse the tunes you know or have in practice from your public profile."
          />

          <VisibilityToggle
            name="show_comment_activity"
            checked={showCommentActivity}
            onChange={setShowCommentActivity}
            title="Show comment and contribution activity"
            description="Let friends see when you comment on tunes or add public tune information such as lore, missing details, recordings, or sheet music."
          />

          <VisibilityToggle
            name="show_compare_discoverability"
            checked={showCompareDiscoverability}
            onChange={setShowCompareDiscoverability}
            title="Allow compare discovery"
            description="Let other musicians find and compare with your profile."
          />

          <VisibilityToggle
            name="compare_requires_friend"
            checked={compareRequiresFriend}
            onChange={setCompareRequiresFriend}
            title="Require friendship for compare"
            description="If enabled, people must be friends with you before they can compare."
          />
        </div>

        {profile === null && (
          <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            These settings will be saved when you save your profile.
          </p>
        )}
      </section>
    </div>
  )
}
