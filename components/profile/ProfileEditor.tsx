"use client"

import { useState } from "react"
import ProfileDetailsSection from "@/components/profile/ProfileDetailsSection"
import UserInstrumentsSection from "@/components/profile/UserInstrumentsSection"
import type { Profile, UserInstrument } from "@/lib/types"

type ProfileEditorProps = {
  email: string | null
  profile: Profile | null
  instruments: UserInstrument[]
  errorMessage: string | null
  saved: boolean
  instrumentErrorMessage: string | null
  instrumentSaved: boolean
  instrumentRemoved: boolean
  initialUsername: string
  initialDisplayName: string
  initialBio: string
  initialShowIdentity: boolean
  initialShowInstruments: boolean
  initialShowPublicListsOnProfile: boolean
  initialShowRepertoireSummary: boolean
  initialShowCompareDiscoverability: boolean
  initialCompareRequiresFriend: boolean
}

export default function ProfileEditor({
  email,
  profile,
  instruments,
  errorMessage,
  saved,
  instrumentErrorMessage,
  instrumentSaved,
  instrumentRemoved,
  initialUsername,
  initialDisplayName,
  initialBio,
  initialShowIdentity,
  initialShowInstruments,
  initialShowPublicListsOnProfile,
  initialShowRepertoireSummary,
  initialShowCompareDiscoverability,
  initialCompareRequiresFriend,
}: ProfileEditorProps) {
  const [username, setUsername] = useState(initialUsername)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [showIdentity, setShowIdentity] = useState(initialShowIdentity)
  const [showInstruments, setShowInstruments] = useState(
    initialShowInstruments
  )
  const [showPublicListsOnProfile, setShowPublicListsOnProfile] = useState(
    initialShowPublicListsOnProfile
  )
  const [showRepertoireSummary, setShowRepertoireSummary] = useState(
    initialShowRepertoireSummary
  )
  const [showCompareDiscoverability, setShowCompareDiscoverability] = useState(
    initialShowCompareDiscoverability
  )
  const [compareRequiresFriend, setCompareRequiresFriend] = useState(
    initialCompareRequiresFriend
  )

  const profileDraft = {
    username,
    displayName,
    bio,
    showIdentity,
    showInstruments,
    showPublicListsOnProfile,
    showRepertoireSummary,
    showCompareDiscoverability,
    compareRequiresFriend,
  }

  return (
    <div className="space-y-6">
      <ProfileDetailsSection
        email={email}
        profile={profile}
        errorMessage={errorMessage}
        saved={saved}
        username={username}
        setUsername={setUsername}
        displayName={displayName}
        setDisplayName={setDisplayName}
        bio={bio}
        setBio={setBio}
        showIdentity={showIdentity}
        setShowIdentity={setShowIdentity}
        showInstruments={showInstruments}
        setShowInstruments={setShowInstruments}
        showPublicListsOnProfile={showPublicListsOnProfile}
        setShowPublicListsOnProfile={setShowPublicListsOnProfile}
        showRepertoireSummary={showRepertoireSummary}
        setShowRepertoireSummary={setShowRepertoireSummary}
        showCompareDiscoverability={showCompareDiscoverability}
        setShowCompareDiscoverability={setShowCompareDiscoverability}
        compareRequiresFriend={compareRequiresFriend}
        setCompareRequiresFriend={setCompareRequiresFriend}
      />

      <UserInstrumentsSection
        instruments={instruments}
        instrumentErrorMessage={instrumentErrorMessage}
        instrumentSaved={instrumentSaved}
        instrumentRemoved={instrumentRemoved}
        profileDraft={profileDraft}
      />
    </div>
  )
}