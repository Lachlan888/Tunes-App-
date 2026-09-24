# P20 ordinary action radius checklist

23 September 2026. Candidate lines only: inspect semantics before editing; badges, chips, segmented controls, avatars, progress decorations and circular icons remain purposeful exceptions. Do not blindly replace. Line numbers are discovery hints and will drift.

P20-a covers shared review styles and Lists overview Manage. P20-b is split before further app edits: b1 Lists/setlists/shared; b2 Home/social/Compare/trends; b3 Tunes/practice; b4 settings/internal/auth/shared UI plus final radius audit. P20-b4 closes P20-b and preserves P21-01.

- `app/badges/[slug]/page.tsx`: 76
- `app/badges/page.tsx`: 65, 72
- `app/compare/join/[token]/page.tsx`: 97, 103, 112, 132, 150, 160
- `app/dev/design-system/page.tsx`: 249
- `app/inbox/page.tsx`: 53, 57, 64, 85
- `app/learning-lists/[id]/page.tsx`: 128, 129, 132, 141, 276
- `app/learning-lists/page.tsx`: 317, 319
- `app/library/[id]/loading.tsx`: 17
- `app/library/[id]/page.tsx`: 280
- `app/moderator/page.tsx`: 154, 207, 231, 274, 317, 333, 376, 379, 408, 428, 444
- `app/public-lists/[id]/not-found.tsx`: 12, 13
- `app/public-lists/[id]/page.tsx`: 186, 190, 194, 275, 299, 323, 339, 577, 610
- `app/public-lists/page.tsx`: 178
- `app/setlists/[id]/page.tsx`: 32
- `app/setlists/page.tsx`: 101, 115, 142
- `app/trends/[style]/page.tsx`: 98
- `app/trends/page.tsx`: 53
- `components/EmptyState.tsx`: 44
- `components/NavDropdown.tsx`: 24, 76
- `components/PendingNavLink.tsx`: 19, 55
- `components/TuneSearchSelect.tsx`: 301
- `components/activity/ActivityInteractionPanel.tsx`: 80
- `components/activity/OptimisticActivityReactionButton.tsx`: 52, 53, 56, 57
- `components/auth/LoginForm.tsx`: 19
- `components/badges/BadgeBrowser.tsx`: 422, 661, 687
- `components/badges/CreateBadgeForm.tsx`: 89, 92
- `components/compare/CompareBlockedSection.tsx`: 15
- `components/compare/CompareCandidateListSection.tsx`: 25, 28, 90
- `components/compare/CompareInPersonLauncher.tsx`: 13
- `components/compare/CompareInPersonSheet.tsx`: 294, 302, 337, 369, 379
- `components/compare/CompareMobile.tsx`: 59, 64, 65, 93, 102, 150
- `components/compare/CompareOutcomeExperience.tsx`: 112
- `components/compare/CompareSearchForm.tsx`: 66
- `components/compare/CompareSuggestionsSection.tsx`: 65, 66
- `components/compare/ConnectAndCompareButton.tsx`: 69
- `components/compare/CurrentCompareGroupSection.tsx`: 56, 74
- `components/compare/EnterCompareCodeForm.tsx`: 29
- `components/compare/MobileCompareAddPersonSheet.tsx`: 139, 197, 242
- `components/compare/SuggestedSessionSet.tsx`: 107
- `components/dev/FeedbackInbox.tsx`: 69, 72, 75, 88, 93, 197, 205
- `components/dev/MetricVisualiser.tsx`: 154, 179, 181, 207
- `components/feedback/BetaFeedbackModal.tsx`: 97, 188, 197
- `components/feedback/FloatingFeedbackButton.tsx`: 38
- `components/filters/FilterChip.tsx`: 22, 36
- `components/friends/FriendSearchForm.tsx`: 47
- `components/friends/FriendsListSection.tsx`: 22
- `components/home/GettingStartedSection.tsx`: 22, 52, 98
- `components/home/HomeBadgesPanel.tsx`: 69
- `components/home/HomeFriendsActivityBox.tsx`: 25
- `components/home/HomeMobileSummarySwitcher.tsx`: 154
- `components/inbox/DirectMessageThreadList.tsx`: 35, 71
- `components/inbox/InboxItemList.tsx`: 65, 75
- `components/layout/AccountMenu.tsx`: 31, 102
- `components/layout/DesktopNav.tsx`: 29
- `components/layout/NavigationDock.tsx`: 72
- `components/library/LibraryResultsHeader.tsx`: 85, 88, 91
- `components/library/RequestTuneEditForm.tsx`: 104
- `components/library/TuneDetailActions.tsx`: 41
- `components/library/YouTubeLoopPlayer.tsx`: 1015, 1029
- `components/lists/CreateListForm.tsx`: 58
- `components/lists/ListOrderManager.tsx`: 76, 77, 78
- `components/lists/ListOverviewCard.tsx`: 28
- `components/lists/ListPager.tsx`: 18
- `components/lists/ListsResultsHeader.tsx`: 24
- `components/mobile/MobileTuneRow.tsx`: 67, 73
- `components/practice-diary/DailyReflectionForm.tsx`: 52
- `components/practice-diary/PracticeCategoryManager.tsx`: 38, 81, 126
- `components/practice-diary/PracticeCategorySummaryList.tsx`: 84
- `components/practice-diary/PracticeDayCalendarPicker.tsx`: 232, 244, 300, 308
- `components/practice-diary/PracticeDayNavigator.tsx`: 12, 15
- `components/practice-diary/PracticeDiaryIndex.tsx`: 175, 229, 270, 285, 293, 301, 328, 336, 345
- `components/practice-diary/PracticeDueTuneList.tsx`: 52
- `components/practice-diary/PracticeEventList.tsx`: 152, 157, 164
- `components/practice-diary/PracticeFocusSummaryList.tsx`: 60
- `components/practice-diary/PracticeMonthView.tsx`: 16
- `components/practice-diary/PracticeNoteCard.tsx`: 45, 51
- `components/practice-diary/PracticeNoteForm.tsx`: 24, 104
- `components/practice-diary/PracticePeriodHeader.tsx`: 31, 32, 35, 38, 45
- `components/practice-diary/PracticeTuneSummaryList.tsx`: 100, 106, 112
- `components/practice-diary/PracticeWeekView.tsx`: 22, 23
- `components/practice-diary/TunePracticeHistorySection.tsx`: 102, 108
- `components/practice-foci/FocusActionMenu.tsx`: 165
- `components/practice-foci/PracticeFocusCreateForm.tsx`: 21
- `components/practice-foci/PracticeFocusList.tsx`: 104, 151, 181
- `components/practice-foci/PracticeFocusTuneManager.tsx`: 382
- `components/practice/ActivePracticeFoci.tsx`: 39
- `components/practice/ActivePracticeSection.tsx`: 120
- `components/practice/AddCategoryInReviewDisclosure.tsx`: 35
- `components/practice/PracticeMetronome.tsx`: 661, 673
- `components/practice/PracticeProgress.tsx`: 24, 28
- `components/practice/PracticeReviewCard.tsx`: 48, 93
- `components/practice/RecentPracticeNotes.tsx`: 50
- `components/practice/ReviewQueueSection.tsx`: 34
- `components/profile/ProfileDetailsSection.tsx`: 50, 53
- `components/profile/PublicProfileActions.tsx`: 23, 26, 110, 114
- `components/profile/PublicProfileBadgesSection.tsx`: 112
- `components/profile/PublicProfileComposedTunesSection.tsx`: 35
- `components/profile/PublicProfileOverview.tsx`: 68, 78, 109
- `components/profile/PublicProfileRepertoireSection.tsx`: 40, 43, 221, 353, 393, 397
- `components/profile/UserInstrumentsSection.tsx`: 36, 39
- `components/session-dock/SessionDock.tsx`: 108, 116, 208
- `components/setlists/CreateSetlistModal.tsx`: 36, 99
- `components/setlists/EditSetlistItemModal.tsx`: 31, 143
- `components/setlists/InviteSetlistCollaboratorForm.tsx`: 45, 58
- `components/setlists/SetlistCollaboratorsSection.tsx`: 28, 29
- `components/setlists/SetlistHeader.tsx`: 14
- `components/setlists/SetlistOrderManager.tsx`: 113, 114
- `components/setlists/SetlistOverviewCard.tsx`: 33
- `components/setlists/SetlistReadView.tsx`: 23
- `components/setlists/SetlistTuneMatrix.tsx`: 343
- `components/shared/SharedListCard.tsx`: 65
- `components/shared/SharedListsMobileList.tsx`: 82
- `components/trends/PersonalTrendInsights.tsx`: 55, 77, 83, 141, 142, 169, 178
- `components/trends/TrendFriendPatternsSection.tsx`: 25, 61
- `components/trends/TrendPublicListSection.tsx`: 43
- `components/trends/TrendTuneList.tsx`: 158, 168, 175, 189, 196
- `components/ui/CardPager.tsx`: 170
- `components/ui/LoadingSpinner.tsx`: 33
- `components/ui/StatusMark.tsx`: 65
- `components/ui/buttonStyles.ts`: 50, 53, 56
- `components/ui/cardStyles.ts`: 39, 42, 45, 48
- `components/ui/segmentedControlStyles.ts`: 3, 5

## Completed b1 semantic review — 23 September 2026

P20-b1 updated the 17 files recorded in its owned patch. Lists/setlists/shared-list candidates left unchanged are intentional: Reader/Manage mode toggles, bookmark icon actions, member/status badges, collaborator initials, tune numbering and input/select fields. P20-a already handled ListOverviewCard and shared rating styles. Continue with b2 Home/social/Compare/trends; b3 Tunes/practice; b4 auth/settings/internal/shared UI and final audit.

## Completed b2/b3 semantic review — 23 September 2026

P20-b2 updated 39 Home/social/profile/badge/Compare/inbox/trends files; P20-b3 updated 15 Tunes/practice files. Per-slice owned patches and checks list exact inputs. Remaining reviewed full-radius candidates are purposeful chips, tabs/toggles, status/count labels, progress bars and circles; linked category count and circle remove/arrow targets were enlarged without changing shape. SessionDock/metronome action tokens were already aligned. Continue P20-b4 settings/internal/shared UI and final audit. Manual/visual acceptance remains user-owned.

## Completed b4 semantic review — 23 September 2026

Seven files aligned, including the shared TuneSearchSelect Remove action missed in earlier surface groups. Remaining checklist pills are purposeful badges, chips/toggles, circles, progress decoration or fields. See P20-b4 for checks and baseline lint limitations. P20-b code scope complete; manual/visual acceptance user-owned.
