"use client"

import { useState } from "react"
import CommunicationSettingsModal from "@/components/profile/CommunicationSettingsModal"
import ProfileDetailsSection from "@/components/profile/ProfileDetailsSection"
import UserInstrumentsSection from "@/components/profile/UserInstrumentsSection"
import type { NotificationPreferences, Profile, UserInstrument } from "@/lib/types"

type ProfileEditorProps = {
  email: string | null
  profile: Profile | null
  notificationPreferences: NotificationPreferences
  communicationSettingsMessage: {
    tone: "success" | "warning" | "error"
    text: string
  } | null
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
  initialShowComposedTunesOnProfile: boolean
  initialShowRepertoireSummary: boolean
  initialShowRepertoireToFriends: boolean
  initialShowCommentActivity: boolean
  initialShowCompareDiscoverability: boolean
  initialCompareRequiresFriend: boolean
  initialPracticeDiaryEnabled: boolean
}

export default function ProfileEditor({
  email,
  profile,
  notificationPreferences,
  communicationSettingsMessage,
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
  initialShowComposedTunesOnProfile,
  initialShowRepertoireSummary,
  initialShowRepertoireToFriends,
  initialShowCommentActivity,
  initialShowCompareDiscoverability,
  initialCompareRequiresFriend,
  initialPracticeDiaryEnabled,
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
  const [showComposedTunesOnProfile, setShowComposedTunesOnProfile] = useState(
    initialShowComposedTunesOnProfile
  )
  const [showRepertoireSummary, setShowRepertoireSummary] = useState(
    initialShowRepertoireSummary
  )
  const [showRepertoireToFriends, setShowRepertoireToFriends] = useState(
    initialShowRepertoireToFriends
  )
  const [showCommentActivity, setShowCommentActivity] = useState(
    initialShowCommentActivity
  )
  const [showCompareDiscoverability, setShowCompareDiscoverability] = useState(
    initialShowCompareDiscoverability
  )
  const [compareRequiresFriend, setCompareRequiresFriend] = useState(
    initialCompareRequiresFriend
  )
  const [practiceDiaryEnabled, setPracticeDiaryEnabled] = useState(
    initialPracticeDiaryEnabled
  )

  const profileDraft = {
    username,
    displayName,
    bio,
    showIdentity,
    showInstruments,
    showPublicListsOnProfile,
    showComposedTunesOnProfile,
    showRepertoireSummary,
    showRepertoireToFriends,
    showCommentActivity,
    showCompareDiscoverability,
    compareRequiresFriend,
    practiceDiaryEnabled,
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
        showComposedTunesOnProfile={showComposedTunesOnProfile}
        setShowComposedTunesOnProfile={setShowComposedTunesOnProfile}
        showRepertoireSummary={showRepertoireSummary}
        setShowRepertoireSummary={setShowRepertoireSummary}
        showRepertoireToFriends={showRepertoireToFriends}
        setShowRepertoireToFriends={setShowRepertoireToFriends}
        showCommentActivity={showCommentActivity}
        setShowCommentActivity={setShowCommentActivity}
        showCompareDiscoverability={showCompareDiscoverability}
        setShowCompareDiscoverability={setShowCompareDiscoverability}
        compareRequiresFriend={compareRequiresFriend}
        setCompareRequiresFriend={setCompareRequiresFriend}
        practiceDiaryEnabled={practiceDiaryEnabled}
        setPracticeDiaryEnabled={setPracticeDiaryEnabled}
      />

      <UserInstrumentsSection
        instruments={instruments}
        instrumentErrorMessage={instrumentErrorMessage}
        instrumentSaved={instrumentSaved}
        instrumentRemoved={instrumentRemoved}
        profileDraft={profileDraft}
      />

      <CommunicationSettingsModal
        preferences={notificationPreferences}
        statusMessage={communicationSettingsMessage?.text ?? null}
        statusTone={communicationSettingsMessage?.tone ?? null}
      />
    </div>
  )
}
