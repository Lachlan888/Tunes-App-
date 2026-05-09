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
  showRepertoireSummary: boolean
  setShowRepertoireSummary: (value: boolean) => void
  showCommentActivity: boolean
  setShowCommentActivity: (value: boolean) => void
  showCompareDiscoverability: boolean
  setShowCompareDiscoverability: (value: boolean) => void
  compareRequiresFriend: boolean
  setCompareRequiresFriend: (value: boolean) => void
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
  showRepertoireSummary,
  setShowRepertoireSummary,
  showCommentActivity,
  setShowCommentActivity,
  showCompareDiscoverability,
  setShowCompareDiscoverability,
  compareRequiresFriend,
  setCompareRequiresFriend,
}: ProfileVisibilitySectionProps) {
  return (
    <div className="rounded-3xl border border-border bg-muted p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Public profile settings
      </h3>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        Control what other users can see on your public profile, whether they
        can compare with you, and which kinds of activity appear to friends.
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
          description="Let other users see the instruments listed on your profile."
        />

        <VisibilityToggle
          name="show_public_lists_on_profile"
          checked={showPublicListsOnProfile}
          onChange={setShowPublicListsOnProfile}
          title="Show public lists"
          description="Display your public tune lists on your profile page and allow public-list activity to appear to friends."
        />

        <VisibilityToggle
          name="show_repertoire_summary"
          checked={showRepertoireSummary}
          onChange={setShowRepertoireSummary}
          title="Show repertoire activity"
          description="Let friends see repertoire movement such as tunes marked known, tunes started in practice, and tune reviews."
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
          description="Let other users find and compare with your profile."
        />

        <VisibilityToggle
          name="compare_requires_friend"
          checked={compareRequiresFriend}
          onChange={setCompareRequiresFriend}
          title="Require friendship for compare"
          description="If enabled, users must be friends with you before they can compare."
        />
      </div>

      {profile === null && (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          These settings will be saved when you save your profile.
        </p>
      )}
    </div>
  )
}