# Copy Audit

Generated on 2026-06-07 by scanning `app`, `components`, and user-facing `lib` modules for JSX text, UI props/config copy, server-action status messages, email/notification text, placeholders, labels, modal copy, and responsive mobile/desktop branches.

Rows marked `needs runtime verification` are source-visible copy where viewport or condition cannot be proven from static inspection alone. Dynamic values are represented with placeholders where the source composes them.

| Area / Route | Component / File | UI Context | Desktop Copy | Mobile Copy | Notes |
|---|---|---|---|---|---|
| / | app/page.tsx | returned status/helper text | Could not save page options. | Could not save page options. | needs runtime verification; conditional/status path |
| / | app/page.tsx | returned status/helper text | Home page options reset. | Home page options reset. | needs runtime verification; conditional/status path |
| / | app/page.tsx | returned status/helper text | Home page options saved. | Home page options saved. | needs runtime verification; conditional/status path |
| / | app/page.tsx | visible text | A working memory system for tunes you know, tunes you are practising, and the lists that hold them together. | A working memory system for tunes you know, tunes you are practising, and the lists that hold them together. | needs runtime verification |
| / | app/page.tsx | visible text | Home | Home | needs runtime verification |
| / | app/page.tsx | visible text | Signed in | Signed in | needs runtime verification |
| / | app/page.tsx | visible text | Tunes App | Tunes App | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | conditional visible text | {progressPercent}% | {progressPercent}% | needs runtime verification; conditional copy |
| / | components/home/GettingStartedSection.tsx | visible text | After that | After that | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | First session | First session | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Get started | Get started | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Home updates from real app activity as you add tunes, mark Known, start Practice, create lists, and review. | Home updates from real app activity as you add tunes, mark Known, start Practice, create lists, and review. | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Next step | Next step | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Progress: | Progress: | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Set up enough of the app that it can start acting like your repertoire memory system. These steps use the real app, so Home updates as soon as you add tunes, start practice, create lists, or review. | Set up enough of the app that it can start acting like your repertoire memory system. These steps use the real app, so Home updates as soon as you add tunes, start practice, create lists, or review. | needs runtime verification |
| / | components/home/GettingStartedSection.tsx | visible text | Start with the next useful step | Start with the next useful step | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | conditional visible text | Created · {badgeCategoryLabel(badge.category)} | Created · {badgeCategoryLabel(badge.category)} | needs runtime verification; conditional copy |
| / | components/home/HomeBadgesPanel.tsx | conditional visible text | Received · {badgeCategoryLabel(badge.category)} | Received · {badgeCategoryLabel(badge.category)} | needs runtime verification; conditional copy |
| / | components/home/HomeBadgesPanel.tsx | visible text | Badges | Badges | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | visible text | Created | Created | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | visible text | No badges yet. Browse badges or create one to start making community recognition visible. | No badges yet. Browse badges or create one to start making community recognition visible. | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | visible text | Received | Received | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | visible text | Recognition you have received and badges you award. | Recognition you have received and badges you award. | needs runtime verification |
| / | components/home/HomeBadgesPanel.tsx | visible text | View all | View all | needs runtime verification |
| / | components/home/HomeFriendsActivityBox.tsx | visible text | Friend activity | Friend activity | needs runtime verification |
| / | components/home/HomeFriendsActivityBox.tsx | visible text | No recent friend activity yet. | No recent friend activity yet. | needs runtime verification |
| / | components/home/HomeFriendsActivityBox.tsx | visible text | View all | View all | needs runtime verification |
| / | components/home/HomeMobileSummarySwitcher.tsx | conditional visible text |  | {badge.kind} · {badgeCategoryLabel(badge.category)} | mobile-only; conditional copy |
| / | components/home/HomeMobileSummarySwitcher.tsx | conditional visible text |  | Stage {userPiece.stage} | mobile-only; conditional copy |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Attention | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Badges | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Due | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Known | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Lists | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Practice | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Repertoire | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Social | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | config/action label |  | Today | mobile-only; derived from constant/config |
| / | components/home/HomeMobileSummarySwitcher.tsx | returned status/helper text |  | In: {options.firstListName} | mobile-only; conditional/status path |
| / | components/home/HomeMobileSummarySwitcher.tsx | returned status/helper text |  | In: {options.firstListName} + {options.listNames.length - 1} more | mobile-only; conditional/status path |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Badges | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Currently in practice | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Due next | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Friend activity | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Learning queue | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Repertoire state | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Social | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Today | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | title/heading prop |  | Your lists | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Add tunes to lists before starting Practice to build this queue. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Compare | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Friends | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | No badges yet. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | No lists yet. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | No recent friend activity yet. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | No tunes in practice yet. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Nothing due today. | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Practice | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | Shared | mobile-only |
| / | components/home/HomeMobileSummarySwitcher.tsx | visible text |  | View | mobile-only |
| / | components/home/HomeSummarySection.tsx | button/link label | In practice | In practice | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | Known | Known | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | Lists | Lists | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | Open queue | Open queue | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | Opening Practice... | Opening Practice... | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | button/link label | View all | View all | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | conditional visible text | Stage {userPiece.stage} | Stage {userPiece.stage} | needs runtime verification; conditional copy |
| / | components/home/HomeSummarySection.tsx | helper/description prop | Tunes already in your hands. | Tunes already in your hands. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | helper/description prop | Tunes inside Stage review. | Tunes inside Stage review. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | returned status/helper text | In: {options.firstListName} | In: {options.firstListName} | needs runtime verification; conditional/status path |
| / | components/home/HomeSummarySection.tsx | returned status/helper text | In: {options.firstListName} + {options.listNames.length - 1} more | In: {options.firstListName} + {options.listNames.length - 1} more | needs runtime verification; conditional/status path |
| / | components/home/HomeSummarySection.tsx | title/heading prop | Currently in practice | Currently in practice | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | title/heading prop | Learning queue | Learning queue | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | title/heading prop | Your lists | Your lists | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Attention | Attention | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Due next | Due next | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Due today | Due today | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | No lists yet. | No lists yet. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | No saved tunes waiting to start. Add tunes to lists before starting Practice to build this queue. | No saved tunes waiting to start. Add tunes to lists before starting Practice to build this queue. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | No tunes in practice yet. | No tunes in practice yet. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Nothing due today. | Nothing due today. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Overdue tunes for catch-up. | Overdue tunes for catch-up. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Practice action state | Practice action state | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Repertoire state | Repertoire state | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Scheduled reviews ready now. | Scheduled reviews ready now. | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | Today | Today | needs runtime verification |
| / | components/home/HomeSummarySection.tsx | visible text | View all | View all | needs runtime verification |
| / | lib/loaders/homepage.ts | config helper text | Add tunes you already know, then place them into Known or Practice. | Add tunes you already know, then place them into Known or Practice. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Add your name, username, and at least one instrument so other musicians can recognise you. | Add your name, username, and at least one instrument so other musicians can recognise you. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Clear anything due today so Home can show that your practice work is up to date. | Clear anything due today so Home can show that your practice work is up to date. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Known tunes count as part of your repertoire without putting them into active review. | Known tunes count as part of your repertoire without putting them into active review. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Put one tune In practice so Stage review can begin. | Put one tune In practice so Stage review can begin. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Review a due tune and choose an outcome to move it through Stage scheduling. | Review a due tune and choose an outcome to move it through Stage scheduling. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config helper text | Use lists to organise tunes by session, gig, teacher, style, or learning goal. | Use lists to organise tunes by session, gig, teacher, style, or learning goal. | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Complete your first review | Complete your first review | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Complete your profile | Complete your profile | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Create a list | Create a list | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Finish today’s due practice | Finish today’s due practice | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Import or add tunes | Import or add tunes | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Mark a tune Known | Mark a tune Known | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Opening import... | Opening import... | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Opening Lists... | Opening Lists... | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Opening Practice... | Opening Practice... | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Opening Profile... | Opening Profile... | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Opening Tunes... | Opening Tunes... | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | config/action label | Start Practice on a tune | Start Practice on a tune | needs runtime verification; derived from constant/config |
| / | lib/loaders/homepage.ts | returned status/helper text | 9999-12-31T23:59:59.999Z-{item.id} | 9999-12-31T23:59:59.999Z-{item.id} | needs runtime verification; conditional/status path |
| / | lib/loaders/homepage.ts | returned status/helper text | Untitled tune | Untitled tune | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | /badges/{encodeURIComponent(badge.slug)} | /badges/{encodeURIComponent(badge.slug)} | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | Add a short description explaining what this badge rewards. | Add a short description explaining what this badge rewards. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | Badge name is required. | Badge name is required. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | Choose a condition type and complete the matching condition fields. | Choose a condition type and complete the matching condition fields. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | Choose a valid badge type. | Choose a valid badge type. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | Could not update badge. | Could not update badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | returned status/helper text | This badge has already been awarded, so its unlock condition cannot be changed. | This badge has already been awarded, so its unlock condition cannot be changed. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/edit/page.tsx | visible text | Back to Badge | Back to Badge | needs runtime verification |
| /badges | app/badges/[slug]/edit/page.tsx | visible text | Badges | Badges | needs runtime verification |
| /badges | app/badges/[slug]/edit/page.tsx | visible text | Edit Badge | Edit Badge | needs runtime verification |
| /badges | app/badges/[slug]/edit/page.tsx | visible text | Update the public wording for this badge. If the badge has not been awarded yet, you can also change its unlock condition. | Update the public wording for this badge. If the badge has not been awarded yet, you can also change its unlock condition. | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | /badges/{encodeURIComponent(data.badge.slug)}/edit | /badges/{encodeURIComponent(data.badge.slug)}/edit | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | /users/{encodeURIComponent(profile.username)} | /users/{encodeURIComponent(profile.username)} | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Badge created. | Badge created. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Badge updated. | Badge updated. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Could not delete badge. | Could not delete badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Only the badge creator can delete this badge. | Only the badge creator can delete this badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Only the badge creator can edit this badge. | Only the badge creator can edit this badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /badges | app/badges/[slug]/page.tsx | visible text | . When a user meets the condition, the badge is attributed to | . When a user meets the condition, the badge is attributed to | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Automatic when eligible | Automatic when eligible | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Awarded by | Awarded by | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Awarding | Awarding | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Awarding model | Awarding model | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Back to Badges | Back to Badges | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Edit badge | Edit badge | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Public | Public | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Recipients | Recipients | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | This badge is public. The condition was created by | This badge is public. The condition was created by | needs runtime verification |
| /badges | app/badges/[slug]/page.tsx | visible text | Visibility | Visibility | needs runtime verification |
| /badges | app/badges/new/page.tsx | returned status/helper text | Add a short description explaining what this badge rewards. | Add a short description explaining what this badge rewards. | needs runtime verification; conditional/status path |
| /badges | app/badges/new/page.tsx | returned status/helper text | Badge name is required. | Badge name is required. | needs runtime verification; conditional/status path |
| /badges | app/badges/new/page.tsx | returned status/helper text | Choose a condition type and complete the matching condition fields. | Choose a condition type and complete the matching condition fields. | needs runtime verification; conditional/status path |
| /badges | app/badges/new/page.tsx | returned status/helper text | Choose a valid badge type. | Choose a valid badge type. | needs runtime verification; conditional/status path |
| /badges | app/badges/new/page.tsx | returned status/helper text | Could not create badge. | Could not create badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/new/page.tsx | visible text | Back to Badges | Back to Badges | needs runtime verification |
| /badges | app/badges/new/page.tsx | visible text | Badges | Badges | needs runtime verification |
| /badges | app/badges/new/page.tsx | visible text | Create a public badge by defining what it rewards. The app checks the condition, and the badge is attributed to you when users receive it. | Create a public badge by defining what it rewards. The app checks the condition, and the badge is attributed to you when users receive it. | needs runtime verification |
| /badges | app/badges/new/page.tsx | visible text | Create Badge | Create Badge | needs runtime verification |
| /badges | app/badges/page.tsx | returned status/helper text | Badge created. | Badge created. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Badge deleted. | Badge deleted. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Badge was already gone. | Badge was already gone. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Badges page options reset. | Badges page options reset. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Badges page options saved. | Badges page options saved. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Could not delete badge. | Could not delete badge. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | returned status/helper text | Could not save Badges page options. | Could not save Badges page options. | needs runtime verification; conditional/status path |
| /badges | app/badges/page.tsx | visible text | Badges | Badges | needs runtime verification |
| /badges | app/badges/page.tsx | visible text | Create Badge | Create Badge | needs runtime verification |
| /badges | app/badges/page.tsx | visible text | Create the first public badge to start turning community values into visible recognition. A good first test is a repertoire badge based on a public list, such as Monroe Mayhem. | Create the first public badge to start turning community values into visible recognition. A good first test is a repertoire badge based on a public list, such as Monroe Mayhem. | needs runtime verification |
| /badges | app/badges/page.tsx | visible text | Log in to create badges | Log in to create badges | needs runtime verification |
| /badges | app/badges/page.tsx | visible text | No badges yet | No badges yet | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | accessibility label | Show next badge | Show next badge | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | accessibility label | Show previous badge | Show previous badge | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | conditional visible text | Edit filters | Edit filters | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeBrowser.tsx | conditional visible text | Search | Search | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeBrowser.tsx | config/action label | All | All | needs runtime verification; derived from constant/config |
| /badges | components/badges/BadgeBrowser.tsx | config/action label | Created | Created | needs runtime verification; derived from constant/config |
| /badges | components/badges/BadgeBrowser.tsx | config/action label | Received | Received | needs runtime verification; derived from constant/config |
| /badges | components/badges/BadgeBrowser.tsx | eyebrow prop | Badge search | Badge search | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | form placeholder | Search badges... | Search badges... | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | helper/description prop | Find badges by name, category, style, key, or progress. | Find badges by name, category, style, key, or progress. | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | cursor-not-allowed opacity-45 | cursor-not-allowed opacity-45 | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | No created badges | No created badges | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | No matching badges | No matching badges | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | No public badges match this view. | No public badges match this view. | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | No received badges | No received badges | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | Try clearing a filter or searching for a broader style, condition, badge name, or creator. | Try clearing a filter or searching for a broader style, condition, badge name, or creator. | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | You have not created any badges yet. | You have not created any badges yet. | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | returned status/helper text | You have not received any badges yet. | You have not received any badges yet. | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeBrowser.tsx | title/heading prop | Search and filter | Search and filter | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | All progress | All progress | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | All types | All types | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Any key | Any key | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Any style | Any style | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Badge | Badge | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Clear | Clear | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Edit filters | Edit filters | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | In progress | In progress | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Key | Key | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Next | Next | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Not received | Not received | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Prev | Prev | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Progress | Progress | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Search | Search | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Show badges | Show badges | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Showing | Showing | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Style | Style | needs runtime verification |
| /badges | components/badges/BadgeBrowser.tsx | visible text | Type | Type | needs runtime verification |
| /badges | components/badges/BadgeCard.tsx | conditional visible text | Open badge {badge.name} | Open badge {badge.name} | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeCard.tsx | returned status/helper text | /users/{encodeURIComponent(badge.owner_profile.username)} | /users/{encodeURIComponent(badge.owner_profile.username)} | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeCard.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeCard.tsx | visible text | Awarded by | Awarded by | needs runtime verification |
| /badges | components/badges/BadgeCard.tsx | visible text | Condition | Condition | needs runtime verification |
| /badges | components/badges/BadgeConditionSummary.tsx | visible text | Unlock condition | Unlock condition | needs runtime verification |
| /badges | components/badges/BadgeProgressSummary.tsx | conditional visible text | {percentage}% | {percentage}% | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeProgressSummary.tsx | conditional visible text | Eligible | Eligible | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeProgressSummary.tsx | conditional visible text | en-AU | en-AU | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeProgressSummary.tsx | conditional visible text | In progress | In progress | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeProgressSummary.tsx | visible text | Awarded on | Awarded on | needs runtime verification |
| /badges | components/badges/BadgeProgressSummary.tsx | visible text | Log in to see your progress. | Log in to see your progress. | needs runtime verification |
| /badges | components/badges/BadgeProgressSummary.tsx | visible text | This badge includes a condition that is only partly measurable in the current app. | This badge includes a condition that is only partly measurable in the current app. | needs runtime verification |
| /badges | components/badges/BadgeProgressSummary.tsx | visible text | Your status | Your status | needs runtime verification |
| /badges | components/badges/BadgeRecipientsList.tsx | conditional visible text | en-AU | en-AU | needs runtime verification; conditional copy |
| /badges | components/badges/BadgeRecipientsList.tsx | returned status/helper text | /users/{encodeURIComponent(profile.username)} | /users/{encodeURIComponent(profile.username)} | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRecipientsList.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRecipientsList.tsx | visible text | Awarded | Awarded | needs runtime verification |
| /badges | components/badges/BadgeRecipientsList.tsx | visible text | No one has received this badge yet. | No one has received this badge yet. | needs runtime verification |
| /badges | components/badges/BadgeRecipientsList.tsx | visible text | Recipients | Recipients | needs runtime verification |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | returned status/helper text | Already in practice | Already in practice | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | returned status/helper text | Already in practice · Stage {tune.stage} | Already in practice · Stage {tune.stage} | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | returned status/helper text | Log in to track | Log in to track | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | returned status/helper text | Not in repertoire | Not in repertoire | needs runtime verification; conditional/status path |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | visible text | Add to List | Add to List | needs runtime verification |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | visible text | in practice | in practice | needs runtime verification |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | visible text | Reference | Reference | needs runtime verification |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | visible text | Required tunes | Required tunes | needs runtime verification |
| /badges | components/badges/BadgeRequiredTunesSection.tsx | visible text | These are the tunes this badge is built around. Open a tune page to inspect it, or add missing tunes to one of your lists. | These are the tunes this badge is built around. Open a tune page to inspect it, or add missing tunes to one of your lists. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | button/link label | Delete badge | Delete badge | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | button/link label | Deleting badge... | Deleting badge... | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Add lore entries | Add lore entries | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Add missing tune details | Add missing tune details | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Add reference media links | Add reference media links | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Know at least X tunes matching filters | Know at least X tunes matching filters | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Know every tune in a public list | Know every tune in a public list | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | config/action label | Know selected tunes | Know selected tunes | needs runtime verification; derived from constant/config |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. 10 | e.g. 10 | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. 15 | e.g. 15 | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. 20 | e.g. 20 | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. 25 | e.g. 25 | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. Monroe Mayhem | e.g. Monroe Mayhem | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | form placeholder | e.g. Recognises players who know a core set of Bill Monroe tunes. | e.g. Recognises players who know a core set of Bill Monroe tunes. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | returned status/helper text | Search for tunes and add them to the badge condition. | Search for tunes and add them to the badge condition. | needs runtime verification; conditional/status path |
| /badges | components/badges/CreateBadgeForm.tsx | returned status/helper text | Tunes required for this badge | Tunes required for this badge | needs runtime verification; conditional/status path |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | , so its unlock condition is locked. You can still edit the name and description. | , so its unlock condition is locked. You can still edit the name and description. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Alternate title | Alternate title | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any field | Any field | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any key | Any key | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any list | Any list | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any lore category | Any lore category | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any style | Any style | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Any time signature | Any time signature | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Badge identity | Badge identity | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Badge name | Badge name | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Badge type | Badge type | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Badges are public. You define the conditions. When another user meets the condition, the badge can be awarded automatically and attributed to you. | Badges are public. You define the conditions. When another user meets the condition, the badge can be awarded automatically and attributed to you. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Catalogue | Catalogue | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Choose a public list | Choose a public list | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Collector | Collector | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Condition | Condition | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Delete badge | Delete badge | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Delete this badge permanently. This removes the badge, its recipient records, and linked badge notifications. | Delete this badge permanently. This removes the badge, its recipient records, and linked badge notifications. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Informant | Informant | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Key | Key | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Known tune count | Known tune count | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Lore | Lore | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Media | Media | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Missing details | Missing details | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Only count tunes that were missing media. This is approximate until missing-media history is fully tracked. | Only count tunes that were missing media. This is approximate until missing-media history is fully tracked. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Public list | Public list | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Reference media | Reference media | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Reference URL | Reference URL | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Region | Region | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Repertoire | Repertoire | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Search for tunes by title and add the ones required for this badge. | Search for tunes by title and add the ones required for this badge. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Selected tunes | Selected tunes | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Short description | Short description | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Story / folklore note | Story / folklore note | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Style | Style | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | The badge is awarded for adding lore entries. | The badge is awarded for adding lore entries. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | The badge is awarded for adding reference media links. | The badge is awarded for adding reference media links. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | The badge is awarded for improving missing tune details. | The badge is awarded for improving missing tune details. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | The badge is awarded when the user knows enough tunes matching these filters. | The badge is awarded when the user knows enough tunes matching these filters. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | The badge is awarded when the user knows every tune in this list. | The badge is awarded when the user knows every tune in this list. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | This badge has already been awarded to | This badge has already been awarded to | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | This is the public explanation users will see on the badge. | This is the public explanation users will see on the badge. | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Time signature | Time signature | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Tune family | Tune family | needs runtime verification |
| /badges | components/badges/CreateBadgeForm.tsx | visible text | Unlock condition | Unlock condition | needs runtime verification |
| /badges | lib/actions/badges.ts | returned status/helper text | {safeBase}-{Date.now()} | {safeBase}-{Date.now()} | needs runtime verification; conditional/status path |
| /badges | lib/actions/badges.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /badges | lib/actions/badges.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /badges | lib/page-options/configs/badges.ts | config heading/name | Badges Page Options | Badges Page Options | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | Choose how the Badges page is arranged. | Choose how the Badges page is arranged. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | Feedback after creating or deleting badges. | Feedback after creating or deleting badges. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | Focuses on the badge browser only. | Focuses on the badge browser only. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | Guidance shown when no badges exist. | Guidance shown when no badges exist. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | Shows creation status and the full badge browser. | Shows creation status and the full badge browser. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | The create-badge or login action in the masthead. | The create-badge or login action in the masthead. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config helper text | The main public badge browsing surface. | The main public badge browsing surface. | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Badge browser | Badge browser | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Community | Community | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Create badge action | Create badge action | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Empty state | Empty state | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /badges | lib/page-options/configs/badges.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| /compare | app/compare/loading.tsx | button/link label | Compare | Compare | needs runtime verification |
| /compare | app/compare/loading.tsx | helper/description prop | Checking player profiles, shared repertoire, filters, and common tunes. | Checking player profiles, shared repertoire, filters, and common tunes. | needs runtime verification |
| /compare | app/compare/loading.tsx | returned status/helper text | Common tunes | Common tunes | needs runtime verification; conditional/status path |
| /compare | app/compare/loading.tsx | title/heading prop | Loading comparison | Loading comparison | needs runtime verification |
| /compare | components/compare/CompareBlockedSection.tsx | button/link label | Send request | Send request | needs runtime verification |
| /compare | components/compare/CompareBlockedSection.tsx | button/link label | Sending... | Sending... | needs runtime verification |
| /compare | components/compare/CompareBlockedSection.tsx | conditional visible text | Open profile for {label} | Open profile for {label} | needs runtime verification; conditional copy |
| /compare | components/compare/CompareBlockedSection.tsx | returned status/helper text | Unnamed player | Unnamed player | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareBlockedSection.tsx | visible text | Permission needed | Permission needed | needs runtime verification |
| /compare | components/compare/CompareBlockedSection.tsx | visible text | This user requires friendship before others can compare with them. | This user requires friendship before others can compare with them. | needs runtime verification |
| /compare | components/compare/CompareBlockedSection.tsx | visible text | User found | User found | needs runtime verification |
| /compare | components/compare/CompareCandidateListSection.tsx | button/link label | Add to compare | Add to compare | needs runtime verification |
| /compare | components/compare/CompareCandidateListSection.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| /compare | components/compare/CompareCandidateListSection.tsx | button/link label | Send request | Send request | needs runtime verification |
| /compare | components/compare/CompareCandidateListSection.tsx | button/link label | Sending... | Sending... | needs runtime verification |
| /compare | components/compare/CompareCandidateListSection.tsx | conditional visible text | Open profile for {label} | Open profile for {label} | needs runtime verification; conditional copy |
| /compare | components/compare/CompareCandidateListSection.tsx | returned status/helper text | Unnamed player | Unnamed player | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareCandidateListSection.tsx | visible text | No username available | No username available | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | conditional visible text | More than one user matched “{primarySearchValue}”. | More than one user matched “{primarySearchValue}”. | needs runtime verification; conditional copy |
| /compare | components/compare/CompareDesktop.tsx | helper/description prop | Select the person you want to add to this compare group. | Select the person you want to add to this compare group. | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | title/heading prop | Choose a user | Choose a user | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | visible text | Add one or more players on the left. Tunes shared by everyone in the group will appear here. | Add one or more players on the left. Tunes shared by everyone in the group will appear here. | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | visible text | Build a group, then see the tunes common to everyone in it. | Build a group, then see the tunes common to everyone in it. | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | visible text | Common tunes | Common tunes | needs runtime verification |
| /compare | components/compare/CompareDesktop.tsx | visible text | Compare Tunes | Compare Tunes | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | conditional visible text | Unnamed player | Unnamed player | needs runtime verification; conditional copy |
| /compare | components/compare/CompareMobile.tsx | visible text | Add | Add | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Add a player to see the tunes you have in common. | Add a player to see the tunes you have in common. | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Add person | Add person | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Compare | Compare | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Permission needed | Permission needed | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Shared repertoire | Shared repertoire | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Start compare | Start compare | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | Suggested friends | Suggested friends | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | This user requires friendship before comparison is available. Send a request from the full desktop compare view for now, or open their profile. | This user requires friendship before comparison is available. Send a request from the full desktop compare view for now, or open their profile. | needs runtime verification |
| /compare | components/compare/CompareMobile.tsx | visible text | You are always included. Add another player to start comparing repertoire. | You are always included. Add another player to start comparing repertoire. | needs runtime verification |
| /compare | components/compare/CompareMutualPiecesSection.tsx | helper/description prop | You may still have tunes in common. Clear the filters to see the full overlap. | You may still have tunes in common. Clear the filters to see the full overlap. | needs runtime verification |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | /compare?{params.toString()} | /compare?{params.toString()} | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Clear filters | Clear filters | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Find friends | Find friends | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Key: {piece.key} | Key: {piece.key} | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Search by title | Search by title | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Search mutual tunes | Search mutual tunes | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Style: {piece.style} | Style: {piece.style} | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | returned status/helper text | Time: {piece.time_signature} | Time: {piece.time_signature} | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareMutualPiecesSection.tsx | title/heading prop | No common tunes match these filters | No common tunes match these filters | needs runtime verification |
| /compare | components/compare/CompareMutualPiecesSection.tsx | title/heading prop | No common tunes yet | No common tunes yet | needs runtime verification |
| /compare | components/compare/ComparePageHeader.tsx | visible text | Build a group, then see the tunes common to everyone in it. | Build a group, then see the tunes common to everyone in it. | needs runtime verification |
| /compare | components/compare/ComparePageHeader.tsx | visible text | Compare Tunes | Compare Tunes | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | A pending or accepted connection already exists with that user. | A pending or accepted connection already exists with that user. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | Add at least one username or display name to start comparing. | Add at least one username or display name to start comparing. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | Friend request sent. | Friend request sent. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | No user found for “ | No user found for “ | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | Please choose a valid user. | Please choose a valid user. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | That user could not be found. | That user could not be found. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | You cannot add your own profile to the compare group. | You cannot add your own profile to the compare group. | needs runtime verification |
| /compare | components/compare/ComparePageStatusMessages.tsx | visible text | You cannot send a friend request to yourself. | You cannot send a friend request to yourself. | needs runtime verification |
| /compare | components/compare/CompareResultsHeader.tsx | conditional visible text | this group | this group | needs runtime verification; conditional copy |
| /compare | components/compare/CompareResultsHeader.tsx | returned status/helper text | this player | this player | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareResultsHeader.tsx | visible text | in common with | in common with | needs runtime verification |
| /compare | components/compare/CompareScopeToggle.tsx | button/link label | Updating compare scope... | Updating compare scope... | needs runtime verification |
| /compare | components/compare/CompareScopeToggle.tsx | conditional visible text | Include practice tunes | Include practice tunes | needs runtime verification; conditional copy |
| /compare | components/compare/CompareScopeToggle.tsx | visible text | Known tunes are always compared. Turn this on to also include tunes each player has in active practice. | Known tunes are always compared. Turn this on to also include tunes each player has in active practice. | needs runtime verification |
| /compare | components/compare/CompareScopeToggle.tsx | visible text | Updating compare scope... | Updating compare scope... | needs runtime verification |
| /compare | components/compare/CompareSearchForm.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /compare | components/compare/CompareSearchForm.tsx | conditional visible text | Add | Add | needs runtime verification; conditional copy |
| /compare | components/compare/CompareSearchForm.tsx | form placeholder | Search by username or display name | Search by username or display name | needs runtime verification |
| /compare | components/compare/CompareSearchForm.tsx | visible text | Add user to compare | Add user to compare | needs runtime verification |
| /compare | components/compare/CompareSearchForm.tsx | visible text | Adding... | Adding... | needs runtime verification |
| /compare | components/compare/CompareSuggestionsSection.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| /compare | components/compare/CompareSuggestionsSection.tsx | conditional visible text | Add to compare | Add to compare | needs runtime verification; conditional copy |
| /compare | components/compare/CompareSuggestionsSection.tsx | conditional visible text | Already added | Already added | needs runtime verification; conditional copy |
| /compare | components/compare/CompareSuggestionsSection.tsx | conditional visible text | Open profile for {label} | Open profile for {label} | needs runtime verification; conditional copy |
| /compare | components/compare/CompareSuggestionsSection.tsx | returned status/helper text | Unnamed player | Unnamed player | needs runtime verification; conditional/status path |
| /compare | components/compare/CompareSuggestionsSection.tsx | visible text | Add a friend | Add a friend | needs runtime verification |
| /compare | components/compare/CompareSuggestionsSection.tsx | visible text | Quick suggestions from your accepted friends. | Quick suggestions from your accepted friends. | needs runtime verification |
| /compare | components/compare/CurrentCompareGroupSection.tsx | button/link label | Remove | Remove | needs runtime verification |
| /compare | components/compare/CurrentCompareGroupSection.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /compare | components/compare/CurrentCompareGroupSection.tsx | returned status/helper text | Unnamed player | Unnamed player | needs runtime verification; conditional/status path |
| /compare | components/compare/CurrentCompareGroupSection.tsx | visible text | Current group | Current group | needs runtime verification |
| /compare | components/compare/CurrentCompareGroupSection.tsx | visible text | No confirmed users in the group yet. | No confirmed users in the group yet. | needs runtime verification |
| /compare | components/compare/CurrentCompareGroupSection.tsx | visible text | You are always included. Add other players to find tunes common to the whole group. | You are always included. Add other players to find tunes common to the whole group. | needs runtime verification |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | accessibility label |  | Add person to compare | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | accessibility label |  | Close add person sheet | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | button/link label |  | Adding... | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | button/link label |  | Searching... | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | conditional visible text |  | Add | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | conditional visible text |  | Search | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | form placeholder |  | Search username or display name | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | returned status/helper text |  | Unnamed player | mobile-only; conditional/status path |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Add person | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Adding... | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Close | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Compare | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Friends | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | No friend suggestions available. Search by username or display name to add someone. | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | No user found for “ | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Search results | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | Searching... | mobile-only |
| /compare | components/compare/MobileCompareAddPersonSheet.tsx | visible text |  | You cannot add your own profile to the compare group. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | button/link label |  | Removing... | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | button/link label |  | Updating... | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | {activeFilterCount} | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | Known + practice | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | Known only | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | Off | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | On | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | conditional visible text |  | Remove {profile.display_name \|\| profile.username \|\| "playe} | mobile-only; conditional copy |
| /compare | components/compare/MobileCompareResultsPanel.tsx | form placeholder |  | Search common tunes | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | helper/description prop |  | Select filters, then close this panel to keep browsing the results. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | returned status/helper text |  | Unnamed player | mobile-only; conditional/status path |
| /compare | components/compare/MobileCompareResultsPanel.tsx | title/heading prop |  | Filter common tunes | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | title/heading prop |  | Key | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | title/heading prop |  | Style | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | title/heading prop |  | Time | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Add person | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Clear the search or filters to return to all common tunes. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Common tunes | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Filters | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Group | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Include practice tunes | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Key: | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | No keys available. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | No styles available. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | No time signatures available. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | No tunes match this view. | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Search: | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Style: | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Time: | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Tunes | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | Updating | mobile-only |
| /compare | components/compare/MobileCompareResultsPanel.tsx | visible text |  | You | mobile-only |
| /compare | lib/comparePageStatus.ts | returned status/helper text | Compare page options reset. | Compare page options reset. | needs runtime verification; conditional/status path |
| /compare | lib/comparePageStatus.ts | returned status/helper text | Compare page options saved. | Compare page options saved. | needs runtime verification; conditional/status path |
| /compare | lib/comparePageStatus.ts | returned status/helper text | Could not save Compare page options. | Could not save Compare page options. | needs runtime verification; conditional/status path |
| /compare | lib/page-options/configs/compare.ts | config heading/name | Compare Page Options | Compare Page Options | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Choose how the Compare page is arranged. | Choose how the Compare page is arranged. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Friend request and compare lookup feedback. | Friend request and compare lookup feedback. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Prioritises search and results. | Prioritises search and results. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Shows only search and results. | Shows only search and results. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Shows search, suggestions, status, and results. | Shows search, suggestions, status, and results. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | Suggested users or compare prompts. | Suggested users or compare prompts. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | The common tunes result panel. | The common tunes result panel. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | The controls for adding users to a compare group. | The controls for adding users to a compare group. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | The current compare group summary. | The current compare group summary. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config helper text | User match lists when a search is ambiguous. | User match lists when a search is ambiguous. | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Candidate matches | Candidate matches | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Current group | Current group | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Results panel | Results panel | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Search panel | Search panel | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Social | Social | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Suggestions | Suggestions | needs runtime verification; derived from constant/config |
| /compare | lib/page-options/configs/compare.ts | config/action label | Working | Working | needs runtime verification; derived from constant/config |
| /dashboard / profile | app/dashboard/page.tsx | conditional visible text | Unknown | Unknown | needs runtime verification; conditional copy |
| /dashboard / profile | app/dashboard/page.tsx | email/notification copy | Choose a valid digest frequency. | Choose a valid digest frequency. | needs runtime verification; derived from constant/config |
| /dashboard / profile | app/dashboard/page.tsx | email/notification copy | Communication settings saved. | Communication settings saved. | needs runtime verification; derived from constant/config |
| /dashboard / profile | app/dashboard/page.tsx | email/notification copy | Could not save communication settings. | Could not save communication settings. | needs runtime verification; derived from constant/config |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Add an instrument name before saving. | Add an instrument name before saving. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Could not remove instrument. Please try again. | Could not remove instrument. Please try again. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Could not save instrument. Please try again. | Could not save instrument. Please try again. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Could not save Profile page options. | Could not save Profile page options. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Could not save profile. Please try again. | Could not save profile. Please try again. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Could not tell which instrument to remove. | Could not tell which instrument to remove. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Profile page options reset. | Profile page options reset. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Profile page options saved. | Profile page options saved. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | That instrument is already on your profile. | That instrument is already on your profile. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | That username is already taken. | That username is already taken. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | returned status/helper text | Username must be 3–30 characters and can only contain letters, numbers, and underscores. | Username must be 3–30 characters and can only contain letters, numbers, and underscores. | needs runtime verification; conditional/status path |
| /dashboard / profile | app/dashboard/page.tsx | visible text | Control your public identity, instruments, visibility, comparison settings, and optional practice diary. | Control your public identity, instruments, visibility, comparison settings, and optional practice diary. | needs runtime verification |
| /dashboard / profile | app/dashboard/page.tsx | visible text | Logged in as | Logged in as | needs runtime verification |
| /dashboard / profile | app/dashboard/page.tsx | visible text | Manage your profile | Manage your profile | needs runtime verification |
| /dashboard / profile | app/dashboard/page.tsx | visible text | Profile | Profile | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | button/link label | Save settings | Save settings | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Immediate email when another musician sends a friend request. | Immediate email when another musician sends a friend request. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Immediate email when someone invites you to collaborate on a setlist. | Immediate email when someone invites you to collaborate on a setlist. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Include badge awards in a daily or weekly digest. | Include badge awards in a daily or weekly digest. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Include replies to your activity in a daily or weekly digest. | Include replies to your activity in a daily or weekly digest. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Include replies to your tune comments in a daily or weekly digest. | Include replies to your tune comments in a daily or weekly digest. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Not active yet. Keep this on only if you want future list summaries. | Not active yet. Keep this on only if you want future list summaries. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Not active yet. Keep this on only if you want future product updates. | Not active yet. Keep this on only if you want future product updates. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Not active yet. Keep this on only if you want future reminders. | Not active yet. Keep this on only if you want future reminders. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Not active yet. Keep this on only if you want future summaries. | Not active yet. Keep this on only if you want future summaries. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config helper text | Reserved for direct message email when that workflow is enabled. | Reserved for direct message email when that workflow is enabled. | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Activity replies | Activity replies | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Badge activity | Badge activity | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Comment replies | Comment replies | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Daily | Daily | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Direct messages | Direct messages | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Friend requests | Friend requests | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Never | Never | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Practice reminders | Practice reminders | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Product updates | Product updates | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Public list activity summary | Public list activity summary | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Setlist invites | Setlist invites | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Weekly | Weekly | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | config/action label | Weekly practice summary | Weekly practice summary | needs runtime verification; derived from constant/config |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | eyebrow prop | Profile | Profile | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | helper/description prop | Friend requests and setlist invites can send immediate emails. Comment replies, activity replies, and badge awards can be bundled into a digest. Important activity can still appear inside Tunes App when email is off. | Friend requests and setlist invites can send immediate emails. Comment replies, activity replies, and badge awards can be bundled into a digest. Important activity can still appear inside Tunes App when email is off. | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | title/heading prop | Communication settings | Communication settings | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Allow Tunes App to send selected updates by email. Turning this off keeps in-app notifications available. | Allow Tunes App to send selected updates by email. Turning this off keeps in-app notifications available. | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Choose immediate emails for actionable updates and digest emails for lower-urgency summaries. | Choose immediate emails for actionable updates and digest emails for lower-urgency summaries. | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Communication settings | Communication settings | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Digest frequency | Digest frequency | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Digests only include lower-urgency updates you have allowed: comment replies, activity replies, and badge awards. | Digests only include lower-urgency updates you have allowed: comment replies, activity replies, and badge awards. | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Manage communication settings | Manage communication settings | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Switching email off does not remove in-app notifications. | Switching email off does not remove in-app notifications. | needs runtime verification |
| /dashboard / profile | components/profile/CommunicationSettingsModal.tsx | visible text | Updates | Updates | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | button/link label | Save profile | Save profile | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | button/link label | View public profile | View public profile | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | conditional visible text | Unknown | Unknown | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | form placeholder | How other users should see your name | How other users should see your name | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | form placeholder | Tell other users a little about yourself | Tell other users a little about yourself | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | 3–30 characters, letters, numbers, and underscores only. | 3–30 characters, letters, numbers, and underscores only. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Bio | Bio | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Display name | Display name | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Manage how your identity appears around the app, whether your profile can be compared, and whether your optional practice diary is enabled. | Manage how your identity appears around the app, whether your profile can be compared, and whether your optional practice diary is enabled. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Profile details | Profile details | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Profile saved. | Profile saved. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Public username | Public username | needs runtime verification |
| /dashboard / profile | components/profile/ProfileDetailsSection.tsx | visible text | Signed in as | Signed in as | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Create a date-bound diary of reviewed tunes and practice activity. This does not change Stage, due dates, streaks, or backlog rules. | Create a date-bound diary of reviewed tunes and practice activity. This does not change Stage, due dates, streaks, or backlog rules. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Display canonical tunes that are attributed to you as composer on your public profile. | Display canonical tunes that are attributed to you as composer on your public profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Display your public tune lists on your profile page and allow public-list activity to appear to friends. | Display your public tune lists on your profile page and allow public-list activity to appear to friends. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | If enabled, users must be friends with you before they can compare. | If enabled, users must be friends with you before they can compare. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Let accepted friends browse the tunes you know or have in practice from your public profile. | Let accepted friends browse the tunes you know or have in practice from your public profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Let friends see when you comment on tunes or add public tune information such as lore, missing details, recordings, or sheet music. | Let friends see when you comment on tunes or add public tune information such as lore, missing details, recordings, or sheet music. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Let other users find and compare with your profile. | Let other users find and compare with your profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Let other users see the instruments listed on your profile. | Let other users see the instruments listed on your profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Show simple known and practice tune counts on your public profile. | Show simple known and practice tune counts on your public profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | helper/description prop | Show your display name, username, and bio on your public profile. | Show your display name, username, and bio on your public profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Allow compare discovery | Allow compare discovery | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Enable Practice Diary | Enable Practice Diary | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Require friendship for compare | Require friendship for compare | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show comment and contribution activity | Show comment and contribution activity | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show composed tunes | Show composed tunes | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show identity | Show identity | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show instruments | Show instruments | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show public lists | Show public lists | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show repertoire summary | Show repertoire summary | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | title/heading prop | Show repertoire to friends | Show repertoire to friends | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | visible text | Control what other users can see on your public profile, whether they can compare with you, and which kinds of activity appear to friends. | Control what other users can see on your public profile, whether they can compare with you, and which kinds of activity appear to friends. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | visible text | Practice settings | Practice settings | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | visible text | Public profile settings | Public profile settings | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | visible text | These settings will be saved when you save your profile. | These settings will be saved when you save your profile. | needs runtime verification |
| /dashboard / profile | components/profile/ProfileVisibilitySection.tsx | visible text | Turn on optional practice diary logging. When enabled, formal reviews are grouped into dated diary pages. | Turn on optional practice diary logging. When enabled, formal reviews are grouped into dated diary pages. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Accept friend request | Accept friend request | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Accepting... | Accepting... | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Compare repertoire | Compare repertoire | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Edit profile | Edit profile | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Log in | Log in | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Send friend request | Send friend request | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Send message | Send message | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | button/link label | Sending... | Sending... | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | form placeholder | Write a direct message... | Write a direct message... | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | returned status/helper text | /compare?user={encodeURIComponent(username)} | /compare?user={encodeURIComponent(username)} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Comparison is available once you are friends. | Comparison is available once you are friends. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Connect | Connect | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Edit your name, bio, instruments, visibility, and public repertoire settings from your private profile page. | Edit your name, bio, instruments, visibility, and public repertoire settings from your private profile page. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Friend request sent | Friend request sent | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Friends | Friends | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Log in to message this musician, send a friend request, or compare repertoire. | Log in to message this musician, send a friend request, or compare repertoire. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Message | Message | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | This user is not discoverable through compare. | This user is not discoverable through compare. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileActions.tsx | visible text | Your profile | Your profile | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | {displayName} has not created any badges yet. | {displayName} has not created any badges yet. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | {displayName} has not received any badges yet. | {displayName} has not received any badges yet. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | {titleCase(badge.category)} · awarded {badge.recipient_count} time{badge.recipient_count === 1 ? "" : "s"} | {titleCase(badge.category)} · awarded {badge.recipient_count} time{badge.recipient_count === 1 ? "" : "s"} | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | Open badge {title} | Open badge {title} | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | they have | they have | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | you have | you have | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | You have not created any badges yet. | You have not created any badges yet. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | conditional visible text | You have not received any badges yet. | You have not received any badges yet. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | returned status/helper text | /badges/{encodeURIComponent(award.badge.slug)} | /badges/{encodeURIComponent(award.badge.slug)} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | returned status/helper text | /badges/{encodeURIComponent(badge.slug)} | /badges/{encodeURIComponent(badge.slug)} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | returned status/helper text | /users/{encodeURIComponent(profile.username)} | /users/{encodeURIComponent(profile.username)} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | · awarded by | · awarded by | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | award and badges | award and badges | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | Badges | Badges | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | Badges awarded | Badges awarded | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | Badges received | Badges received | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | Browse badges | Browse badges | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | received. | received. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileBadgesSection.tsx | visible text | Recognition | Recognition | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileComposedTunesSection.tsx | returned status/helper text | Key: {tune.key} | Key: {tune.key} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileComposedTunesSection.tsx | returned status/helper text | Style: {tune.style} | Style: {tune.style} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileComposedTunesSection.tsx | returned status/helper text | Time: {tune.time_signature} | Time: {tune.time_signature} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileComposedTunesSection.tsx | visible text | Composed tunes | Composed tunes | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileComposedTunesSection.tsx | visible text | Tunes by | Tunes by | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileHeader.tsx | visible text | This is your public profile as other musicians see it. Visibility settings on your Profile page control what appears here. | This is your public profile as other musicians see it. Visibility settings on your Profile page control what appears here. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileHeader.tsx | visible text | This musician has chosen limited public identity visibility. | This musician has chosen limited public identity visibility. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | helper/description prop | Add instruments on your Profile page so other players know what you play. | Add instruments on your Profile page so other players know what you play. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | helper/description prop | Make one of your lists public if you want other users to browse or import it. | Make one of your lists public if you want other users to browse or import it. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | helper/description prop | Public lists this user chooses to share will appear here. | Public lists this user chooses to share will appear here. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | helper/description prop | This user has not added instruments to their profile yet. | This user has not added instruments to their profile yet. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | returned status/helper text | {count} tune{count === 1 ? "" : "s"} | {count} tune{count === 1 ? "" : "s"} | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | returned status/helper text | Edit Profile | Edit Profile | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | returned status/helper text | Manage Lists | Manage Lists | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | title/heading prop | No instruments listed | No instruments listed | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | title/heading prop | No public lists yet | No public lists yet | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | In practice | In practice | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | Instruments | Instruments | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | Known tunes | Known tunes | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | Public lists | Public lists | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileOverview.tsx | visible text | Repertoire | Repertoire | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | {profileName}’s repertoire | {profileName}’s repertoire | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | Accepted friends can browse these tunes from your public profile. | Accepted friends can browse these tunes from your public profile. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | Browse tunes your friend knows or is practising, then add useful ones to one of your own lists. | Browse tunes your friend knows or is practising, then add useful ones to one of your own lists. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | This friend does not have visible known or practice tunes yet. | This friend does not have visible known or practice tunes yet. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | Tunes you mark known or start practising will appear here. | Tunes you mark known or start practising will appear here. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | You can see this here, but it is hidden from friends until you opt in. | You can see this here, but it is hidden from friends until you opt in. | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | conditional visible text | Your repertoire | Your repertoire | needs runtime verification; conditional copy |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | form placeholder | Search their tunes | Search their tunes | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | helper/description prop | Try broadening the search, key, style, time, or relationship filter. | Try broadening the search, key, style, time, or relationship filter. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | helper/description prop | Turn on “Show repertoire to friends” in Profile settings if you want accepted friends to browse the tunes you know or have in practice. | Turn on “Show repertoire to friends” in Profile settings if you want accepted friends to browse the tunes you know or have in practice. | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | {profileName} is practising | {profileName} is practising | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | {profileName} knows | {profileName} knows | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | All their tunes | All their tunes | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | Edit Profile | Edit Profile | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | In my lists | In my lists | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | In my practice | In my practice | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | Known by me | Known by me | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | returned status/helper text | New to me | New to me | needs runtime verification; conditional/status path |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | title/heading prop | No repertoire to show yet | No repertoire to show yet | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | title/heading prop | No tunes match these filters | No tunes match these filters | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | title/heading prop | Your repertoire is hidden from friends | Your repertoire is hidden from friends | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Add to list | Add to list | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | All keys | All keys | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | All styles | All styles | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | All times | All times | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Clear filters | Clear filters | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Friend repertoire | Friend repertoire | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Friend repertoire view | Friend repertoire view | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Key | Key | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Search | Search | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Showing | Showing | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Style | Style | needs runtime verification |
| /dashboard / profile | components/profile/PublicProfileRepertoireSection.tsx | visible text | Time | Time | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | button/link label | Add | Add | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | button/link label | Remove | Remove | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | form placeholder | Add an instrument | Add an instrument | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | visible text | Add the instruments you play so your public profile is more useful to other musicians. | Add the instruments you play so your public profile is more useful to other musicians. | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | visible text | Instrument added. | Instrument added. | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | visible text | Instrument removed. | Instrument removed. | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | visible text | Instruments | Instruments | needs runtime verification |
| /dashboard / profile | components/profile/UserInstrumentsSection.tsx | visible text | No instruments added yet. | No instruments added yet. | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Could not tell which feedback item to update. | Could not tell which feedback item to update. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Could not update feedback. | Could not update feedback. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Feedback resolved and archived. | Feedback resolved and archived. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Feedback resolved, archived, and the submitting user was messaged. | Feedback resolved, archived, and the submitting user was messaged. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Feedback updated and the submitting user was messaged. | Feedback updated and the submitting user was messaged. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Feedback updated. | Feedback updated. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Feedback was updated, but the user message could not be sent. | Feedback was updated, but the user message could not be sent. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Invalid feedback priority. | Invalid feedback priority. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | returned status/helper text | Invalid feedback status. | Invalid feedback status. | needs runtime verification; conditional/status path |
| /dev / feedback | app/dev/page.tsx | visible text | Beta cockpit | Beta cockpit | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | visible text | Dev | Dev | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | visible text | Feature usage | Feature usage | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | visible text | Feedback inbox | Feedback inbox | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | visible text | Review beta feedback, watch feature usage, and check whether the app is becoming part of users&apos; real practice behaviour. | Review beta feedback, watch feature usage, and check whether the app is becoming part of users&apos; real practice behaviour. | needs runtime verification |
| /dev / feedback | app/dev/page.tsx | visible text | User activity | User activity | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Active this week | Active this week | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Launch blockers | Launch blockers | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Most reported page | Most reported page | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Open feedback | Open feedback | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Reviews this week | Reviews this week | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | button/link label | Total users | Total users | needs runtime verification |
| /dev / feedback | components/dev/DevSummaryCards.tsx | conditional visible text | {summary.totalFeedback} feedback reports loaded | {summary.totalFeedback} feedback reports loaded | needs runtime verification; conditional copy |
| /dev / feedback | components/dev/FeatureUsagePanel.tsx | visible text | Count | Count | needs runtime verification |
| /dev / feedback | components/dev/FeatureUsagePanel.tsx | visible text | Feature/event | Feature/event | needs runtime verification |
| /dev / feedback | components/dev/FeatureUsagePanel.tsx | visible text | Last seen | Last seen | needs runtime verification |
| /dev / feedback | components/dev/FeatureUsagePanel.tsx | visible text | No usage events yet. | No usage events yet. | needs runtime verification |
| /dev / feedback | components/dev/FeatureUsagePanel.tsx | visible text | Unique users | Unique users | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | button/link label | Resolving… | Resolving… | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | button/link label | Update feedback | Update feedback | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | button/link label | Updating… | Updating… | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Browser: | Browser: | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Fixed | Fixed | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | High | High | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Launch blocker | Launch blocker | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Low | Low | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Medium | Medium | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Needs more info | Needs more info | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | New | New | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | No page link | No page link | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | No unresolved beta feedback. | No unresolved beta feedback. | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Open page | Open page | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Owner notes | Owner notes | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Owner priority | Owner priority | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Planned | Planned | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Send this note to the submitting user as a normal inbox message when updating. Resolving always sends them a message. | Send this note to the submitting user as a normal inbox message when updating. Resolving always sends them a message. | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Severity: | Severity: | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Status | Status | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Triaged | Triaged | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Viewport: | Viewport: | needs runtime verification |
| /dev / feedback | components/dev/FeedbackInbox.tsx | visible text | Won&apos;t fix | Won&apos;t fix | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | conditional visible text | {width}% | {width}% | needs runtime verification; conditional copy |
| /dev / feedback | components/dev/MetricVisualiser.tsx | conditional visible text | None | None | needs runtime verification; conditional copy |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | % of total | % of total | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | % share | % share | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Details | Details | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Distribution | Distribution | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Metric visualiser | Metric visualiser | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | No metrics available yet. | No metrics available yet. | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | No rows for this metric yet. | No rows for this metric yet. | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Ranked chart | Ranked chart | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Rows | Rows | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | rows by | rows by | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Select metric | Select metric | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Top | Top | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Top item | Top item | needs runtime verification |
| /dev / feedback | components/dev/MetricVisualiser.tsx | visible text | Total | Total | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Feedback | Feedback | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Joined | Joined | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Known | Known | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Last active | Last active | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Lists | Lists | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | No users found. | No users found. | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Practice | Practice | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | Reviews | Reviews | needs runtime verification |
| /dev / feedback | components/dev/UserActivityTable.tsx | visible text | User | User | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | button/link label | Send feedback | Send feedback | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | button/link label | Sending… | Sending… | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | form placeholder | What was broken, confusing, awkward, or missing? | What was broken, confusing, awkward, or missing? | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | returned status/helper text | {window.location.pathname}{window.location.search}{window.location.hash} | {window.location.pathname}{window.location.search}{window.location.hash} | needs runtime verification; conditional/status path |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Beta feedback | Beta feedback | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Broken thing | Broken thing | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Captured page | Captured page | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Close | Close | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Design feedback | Design feedback | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Feature request | Feature request | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Function confusion | Function confusion | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | High | High | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | How serious is it? | How serious is it? | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Low | Low | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Medium | Medium | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Other | Other | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | Send feedback | Send feedback | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | This includes the exact page path so the issue can be opened from the Dev Cockpit. | This includes the exact page path so the issue can be opened from the Dev Cockpit. | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | What happened? | What happened? | needs runtime verification |
| /dev / feedback | components/feedback/BetaFeedbackModal.tsx | visible text | What kind of feedback is this? | What kind of feedback is this? | needs runtime verification |
| /dev / feedback | components/feedback/FloatingFeedbackButton.tsx | accessibility label | Send beta feedback | Send beta feedback | needs runtime verification |
| /dev / feedback | components/feedback/FloatingFeedbackButton.tsx | visible text | Feedback | Feedback | needs runtime verification |
| /dev / feedback | lib/actions/beta-feedback.ts | status/error message | Could not send feedback. Please try again. | Could not send feedback. Please try again. | needs runtime verification; derived from constant/config |
| /dev / feedback | lib/actions/beta-feedback.ts | status/error message | Feedback sent. Thanks. | Feedback sent. Thanks. | needs runtime verification; derived from constant/config |
| /dev / feedback | lib/actions/beta-feedback.ts | status/error message | Please log in again before sending feedback. | Please log in again before sending feedback. | needs runtime verification; derived from constant/config |
| /dev / feedback | lib/actions/beta-feedback.ts | status/error message | Write a short note before sending feedback. | Write a short note before sending feedback. | needs runtime verification; derived from constant/config |
| /dev / feedback | lib/actions/dev-feedback.ts | returned status/helper text | {cleaned.slice(0, 180).trim()}… | {cleaned.slice(0, 180).trim()}… | needs runtime verification; conditional/status path |
| /dev / feedback | lib/actions/dev-feedback.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /dev / feedback | lib/actions/dev-feedback.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /dev / feedback | lib/actions/dev-feedback.ts | returned status/helper text | Needs more info | Needs more info | needs runtime verification; conditional/status path |
| /dev / feedback | lib/actions/dev-feedback.ts | returned status/helper text | Won't fix | Won't fix | needs runtime verification; conditional/status path |
| /friends | app/friends/page.tsx | button/link label | Accept | Accept | needs runtime verification |
| /friends | app/friends/page.tsx | button/link label | Accepting... | Accepting... | needs runtime verification |
| /friends | app/friends/page.tsx | button/link label | Refuse | Refuse | needs runtime verification |
| /friends | app/friends/page.tsx | button/link label | Refusing... | Refusing... | needs runtime verification |
| /friends | app/friends/page.tsx | button/link label | Send | Send | needs runtime verification |
| /friends | app/friends/page.tsx | button/link label | Sending... | Sending... | needs runtime verification |
| /friends | app/friends/page.tsx | helper/description prop | Friend requests from other users will appear here. | Friend requests from other users will appear here. | needs runtime verification |
| /friends | app/friends/page.tsx | helper/description prop | No unconnected users matched that search. If you are already friends or already have a pending request, they will appear in your friends or requests sections instead. | No unconnected users matched that search. If you are already friends or already have a pending request, they will appear in your friends or requests sections instead. | needs runtime verification |
| /friends | app/friends/page.tsx | helper/description prop | Search by username or display name. Once connected, you can compare repertoire and see relevant activity. |  | desktop-only |
| /friends | app/friends/page.tsx | returned status/helper text | /friends?q={encodeURIComponent(searchQuery)} | /friends?q={encodeURIComponent(searchQuery)} | needs runtime verification; conditional/status path |
| /friends | app/friends/page.tsx | returned status/helper text | /users/{encodeURIComponent(username)} | /users/{encodeURIComponent(username)} | needs runtime verification; conditional/status path |
| /friends | app/friends/page.tsx | title/heading prop | Find musicians to connect with |  | desktop-only |
| /friends | app/friends/page.tsx | title/heading prop | No incoming requests | No incoming requests | needs runtime verification |
| /friends | app/friends/page.tsx | title/heading prop | No new users found | No new users found | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | A pending or accepted connection already exists with that user. | A pending or accepted connection already exists with that user. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Accept requests from musicians who want to connect with you. | Accept requests from musicians who want to connect with you. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Could not tell which friend request to accept. | Could not tell which friend request to accept. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Could not tell which friend request to refuse. | Could not tell which friend request to refuse. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Find friends | Find friends | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Find musicians | Find musicians | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Friend request accepted. | Friend request accepted. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Friend request refused. | Friend request refused. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Friend request sent. | Friend request sent. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Friends | Friends | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Incoming requests | Incoming requests | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Please choose a user from the search results. | Please choose a user from the search results. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Requests | Requests | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Search | Search | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Search for musicians, send friend requests, compare repertoire, and see relevant activity from people you are connected with. | Search for musicians, send friend requests, compare repertoire, and see relevant activity from people you are connected with. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | Search returns users you are not already connected with. Existing friends and pending requests appear in the sections below. | Search returns users you are not already connected with. Existing friends and pending requests appear in the sections below. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | That friend request could not be found. | That friend request could not be found. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | That request is no longer pending. | That request is no longer pending. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | That user could not be found. | That user could not be found. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | You are not allowed to accept that request. | You are not allowed to accept that request. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | You are not allowed to refuse that request. | You are not allowed to refuse that request. | needs runtime verification |
| /friends | app/friends/page.tsx | visible text | You cannot send a friend request to yourself. | You cannot send a friend request to yourself. | needs runtime verification |
| /friends | components/friends/FriendSearchForm.tsx | button/link label | Searching... | Searching... | needs runtime verification |
| /friends | components/friends/FriendSearchForm.tsx | conditional visible text | Search | Search | needs runtime verification; conditional copy |
| /friends | components/friends/FriendSearchForm.tsx | form placeholder | Search by name or username | Search by name or username | needs runtime verification |
| /friends | components/friends/FriendSearchForm.tsx | visible text | Searching... | Searching... | needs runtime verification |
| /friends | components/friends/FriendsListSection.tsx | conditional visible text | Open profile for {label} | Open profile for {label} | needs runtime verification; conditional copy |
| /friends | components/friends/FriendsListSection.tsx | conditional visible text | Show all ({friends.length}) | Show all ({friends.length}) | needs runtime verification; conditional copy |
| /friends | components/friends/FriendsListSection.tsx | conditional visible text | Show less | Show less | needs runtime verification; conditional copy |
| /friends | components/friends/FriendsListSection.tsx | helper/description prop | Search for another user, send a request, and then compare your repertoire once connected. | Search for another user, send a request, and then compare your repertoire once connected. | needs runtime verification |
| /friends | components/friends/FriendsListSection.tsx | returned status/helper text | /users/{encodeURIComponent(friend.username)} | /users/{encodeURIComponent(friend.username)} | needs runtime verification; conditional/status path |
| /friends | components/friends/FriendsListSection.tsx | returned status/helper text | Compare tunes | Compare tunes | needs runtime verification; conditional/status path |
| /friends | components/friends/FriendsListSection.tsx | returned status/helper text | Search users | Search users | needs runtime verification; conditional/status path |
| /friends | components/friends/FriendsListSection.tsx | title/heading prop | No friends yet | No friends yet | needs runtime verification |
| /friends | components/friends/FriendsListSection.tsx | visible text | Connections | Connections | needs runtime verification |
| /friends | components/friends/FriendsListSection.tsx | visible text | Friends | Friends | needs runtime verification |
| /friends | components/friends/FriendsListSection.tsx | visible text | Musicians you are connected with for repertoire comparison and relevant activity. | Musicians you are connected with for repertoire comparison and relevant activity. | needs runtime verification |
| /friends | components/friends/FriendsMobileSwitcher.tsx | config/action label |  | Activity | mobile-only; derived from constant/config |
| /friends | components/friends/FriendsMobileSwitcher.tsx | config/action label |  | Add friends | mobile-only; derived from constant/config |
| /friends | components/friends/FriendUserActionCard.tsx | conditional visible text | Open profile for {label} | Open profile for {label} | needs runtime verification; conditional copy |
| /friends | components/friends/RecentFriendActivitySection.tsx | helper/description prop | Once you have friends, recent public practice and list activity can appear here. | Once you have friends, recent public practice and list activity can appear here. | needs runtime verification |
| /friends | components/friends/RecentFriendActivitySection.tsx | title/heading prop | No recent friend activity | No recent friend activity | needs runtime verification |
| /friends | components/friends/RecentFriendActivitySection.tsx | visible text | Activity from musicians you are connected with. React, reply, or open the tune for more context. | Activity from musicians you are connected with. React, reply, or open the tune for more context. | needs runtime verification |
| /friends | components/friends/RecentFriendActivitySection.tsx | visible text | Recent activity | Recent activity | needs runtime verification |
| /friends | components/friends/RecentFriendActivitySection.tsx | visible text | Social | Social | needs runtime verification |
| /friends | lib/actions/friends.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /friends | lib/actions/friends.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /friends | lib/actions/friends.ts | status/error message | Friend request was not created. | Friend request was not created. | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | {diffDays} day{diffDays === 1 ? "" : "s"} ago | {diffDays} day{diffDays === 1 ? "" : "s"} ago | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | {diffHours} hr ago | {diffHours} hr ago | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | {diffMinutes} min ago | {diffMinutes} min ago | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | {fields.slice(0, -1).join(", ")}, and {fields[fields.length - 1]} | {fields.slice(0, -1).join(", ")}, and {fields[fields.length - 1]} | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | {fields[0]} and {fields[1]} | {fields[0]} and {fields[1]} | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | missing details | missing details | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | reference link | reference link | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | returned status/helper text | time signature | time signature | needs runtime verification; conditional/status path |
| /friends | lib/friend-activity.tsx | visible text | added a new tune: | added a new tune: | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | added a reference link for | added a reference link for | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | added lore to | added lore to | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | added sheet music for | added sheet music for | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | as known | as known | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | commented on | commented on | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | created a public list: | created a public list: | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | created the | created the | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | did something | did something | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | received the badge | received the badge | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | started practising | started practising | needs runtime verification |
| /friends | lib/friend-activity.tsx | visible text | updated the public list | updated the public list | needs runtime verification |
| /inbox | app/inbox/page.tsx | button/link label | Archive all | Archive all | needs runtime verification |
| /inbox | app/inbox/page.tsx | button/link label | Archiving... | Archiving... | needs runtime verification |
| /inbox | app/inbox/page.tsx | button/link label | Mark all read | Mark all read | needs runtime verification |
| /inbox | app/inbox/page.tsx | button/link label | Marking read... | Marking read... | needs runtime verification |
| /inbox | app/inbox/page.tsx | email/notification copy | Conversation archived. | Conversation archived. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Could not tell which message to update. | Could not tell which message to update. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Could not tell which user to message. | Could not tell which user to message. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Message deleted. | Message deleted. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Message edited. | Message edited. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Message sent. | Message sent. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | That user could not be found. | That user could not be found. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | Write a message before sending. | Write a message before sending. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | email/notification copy | You cannot send a direct message to yourself. | You cannot send a direct message to yourself. | needs runtime verification; derived from constant/config |
| /inbox | app/inbox/page.tsx | visible text | All caught up | All caught up | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Good craic! reactions, replies, and moderation outcomes appear here. | Good craic! reactions, replies, and moderation outcomes appear here. | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Inbox | Inbox | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Messages | Messages | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Notifications | Notifications | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Threaded direct messages, activity replies, tune-comment replies, moderation outcomes, and Good craic! reactions from other musicians. | Threaded direct messages, activity replies, tune-comment replies, moderation outcomes, and Good craic! reactions from other musicians. | needs runtime verification |
| /inbox | app/inbox/page.tsx | visible text | Unread total | Unread total | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Archive | Archive | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Archiving... | Archiving... | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Delete | Delete | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Save edit | Save edit | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Send reply | Send reply | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | button/link label | Sending... | Sending... | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | conditional visible text | en-AU | en-AU | needs runtime verification; conditional copy |
| /inbox | components/inbox/DirectMessageThreadList.tsx | conditional visible text | Received | Received | needs runtime verification; conditional copy |
| /inbox | components/inbox/DirectMessageThreadList.tsx | conditional visible text | Reply to {userLabel} | Reply to {userLabel} | needs runtime verification; conditional copy |
| /inbox | components/inbox/DirectMessageThreadList.tsx | conditional visible text | Sent | Sent | needs runtime verification; conditional copy |
| /inbox | components/inbox/DirectMessageThreadList.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /inbox | components/inbox/DirectMessageThreadList.tsx | visible text | Edit | Edit | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | visible text | Latest | Latest | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | visible text | No direct messages yet. Messages sent from public profile pages will appear here. | No direct messages yet. Messages sent from public profile pages will appear here. | needs runtime verification |
| /inbox | components/inbox/DirectMessageThreadList.tsx | visible text | View profile | View profile | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | button/link label | Archive | Archive | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | button/link label | Archiving... | Archiving... | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | button/link label | Mark read | Mark read | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | conditional visible text | · Read | · Read | needs runtime verification; conditional copy |
| /inbox | components/inbox/InboxItemList.tsx | conditional visible text | · Unread | · Unread | needs runtime verification; conditional copy |
| /inbox | components/inbox/InboxItemList.tsx | conditional visible text | en-AU | en-AU | needs runtime verification; conditional copy |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | a badge | a badge | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | a setlist | a setlist | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | Open {item.badge.name} | Open {item.badge.name} | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | Open {item.learning_list.name} | Open {item.learning_list.name} | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | Open {item.piece.title} | Open {item.piece.title} | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | Open {item.setlist.name} | Open {item.setlist.name} | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | returned status/helper text | Open profile | Open profile | needs runtime verification; conditional/status path |
| /inbox | components/inbox/InboxItemList.tsx | visible text | a tune | a tune | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | awarded you the badge | awarded you the badge | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | gave your activity Good craic! | gave your activity Good craic! | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | invited you to | invited you to | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | No notifications yet. Reactions, replies, moderation outcomes, setlist changes, and badge awards will appear here. | No notifications yet. Reactions, replies, moderation outcomes, setlist changes, and badge awards will appear here. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | one of your tunes | one of your tunes | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | replied to your activity. | replied to your activity. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | replied to your tune comment. | replied to your tune comment. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | sent you a notification. | sent you a notification. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | started practising | started practising | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | was approved. | was approved. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | was rejected. | was rejected. | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | You were tagged as composer | You were tagged as composer | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | Your edit request | Your edit request | needs runtime verification |
| /inbox | components/inbox/InboxItemList.tsx | visible text | your tune | your tune | needs runtime verification |
| /inbox | lib/actions/direct-messages.ts | returned status/helper text | {cleaned.slice(0, 180).trim()}… | {cleaned.slice(0, 180).trim()}… | needs runtime verification; conditional/status path |
| /inbox | lib/actions/direct-messages.ts | returned status/helper text | {redirectTo}{separator}direct_message={status} | {redirectTo}{separator}direct_message={status} | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | button/link label | Remove | Remove | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | conditional visible text | Mark as known | Mark as known | needs runtime verification; conditional copy |
| /learning-lists | app/learning-lists/[id]/page.tsx | conditional visible text | Mark known | Mark known | needs runtime verification; conditional copy |
| /learning-lists | app/learning-lists/[id]/page.tsx | conditional visible text | Private | Private | needs runtime verification; conditional copy |
| /learning-lists | app/learning-lists/[id]/page.tsx | conditional visible text | Public | Public | needs runtime verification; conditional copy |
| /learning-lists | app/learning-lists/[id]/page.tsx | conditional visible text | Set as known | Set as known | needs runtime verification; conditional copy |
| /learning-lists | app/learning-lists/[id]/page.tsx | returned status/helper text | Key: {piece.key} | Key: {piece.key} | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | returned status/helper text | Manage List | Manage List | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | returned status/helper text | Open reference video | Open reference video | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | returned status/helper text | Style: {styleLabels.join(", ")} | Style: {styleLabels.join(", ")} | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | returned status/helper text | Time: {piece.time_signature} | Time: {piece.time_signature} | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Already in practice | Already in practice | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Back to Lists | Back to Lists | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Could not remove tune. | Could not remove tune. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Could not tell which list to edit. | Could not tell which list to edit. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Could not tell which tune to remove from the list. | Could not tell which tune to remove from the list. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Could not tell which tune to remove. | Could not tell which tune to remove. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Could not update list. | Could not update list. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | In practice | In practice | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Invalid list visibility. | Invalid list visibility. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Known | Known | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | List deleted. | List deleted. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | List not found or you do not own it. | List not found or you do not own it. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | List updated. | List updated. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Please enter a list name. | Please enter a list name. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | This list has no tunes yet. | This list has no tunes yet. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Tune removed from this list. | Tune removed from this list. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Tune removed from your app. | Tune removed from your app. | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Tunes | Tunes | needs runtime verification |
| /learning-lists | app/learning-lists/[id]/page.tsx | visible text | Your editable copy | Your editable copy | needs runtime verification |
| /learning-lists | app/learning-lists/loading.tsx | button/link label | Lists | Lists | needs runtime verification |
| /learning-lists | app/learning-lists/loading.tsx | helper/description prop | Gathering your tune collections, list summaries, and unlisted repertoire. | Gathering your tune collections, list summaries, and unlisted repertoire. | needs runtime verification |
| /learning-lists | app/learning-lists/loading.tsx | returned status/helper text | Your lists | Your lists | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/loading.tsx | title/heading prop | Loading your lists | Loading your lists | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | helper/description prop | Lists are where you organise tunes for learning, repertoire, sessions, or publishing. Use Create List above to start one. | Lists are where you organise tunes for learning, repertoire, sessions, or publishing. Use Create List above to start one. | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | helper/description prop | Try clearing the search or filters. | Try clearing the search or filters. | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | /learning-lists?{params.toString()} | /learning-lists?{params.toString()} | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Bookmark removed. | Bookmark removed. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Bookmarking is not available until the bookmark table migration has been applied. | Bookmarking is not available until the bookmark table migration has been applied. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Browse Tunes | Browse Tunes | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Could not save Lists page options. | Could not save Lists page options. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Could not update that bookmark. | Could not update that bookmark. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Lists page options reset. | Lists page options reset. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Lists page options saved. | Lists page options saved. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Reset view | Reset view | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Search by list name | Search by list name | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | Search lists | Search lists | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | returned status/helper text | That shared list could not be found. | That shared list could not be found. | needs runtime verification; conditional/status path |
| /learning-lists | app/learning-lists/page.tsx | title/heading prop | No lists match this view | No lists match this view | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | title/heading prop | No lists yet | No lists yet | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Editable lists you created or copied. | Editable lists you created or copied. | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Keep repertoire, practice queues, session sets, and copied collections in clear working lists. | Keep repertoire, practice queues, session sets, and copied collections in clear working lists. | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Lists | Lists | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Logged in as | Logged in as | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Organise your tunes | Organise your tunes | needs runtime verification |
| /learning-lists | app/learning-lists/page.tsx | visible text | Your lists | Your lists | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | button/link label | Remove bookmark | Remove bookmark | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | conditional visible text | Shared lists you saved as references. | Shared lists you saved as references. | needs runtime verification; conditional copy |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | returned status/helper text | {count} tune{count === 1 ? "" : "s"} | {count} tune{count === 1 ? "" : "s"} | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | title/heading prop | Bookmarked shared lists | Bookmarked shared lists | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | Bookmark shared lists to save them here as references. | Bookmark shared lists to save them here as references. | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | bookmarked as reference material. | bookmarked as reference material. | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | Bookmarked shared lists | Bookmarked shared lists | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | By | By | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | No bookmarked shared lists yet. | No bookmarked shared lists yet. | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | Open bookmarks | Open bookmarks | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | Recent: | Recent: | needs runtime verification |
| /learning-lists | components/lists/BookmarkedSharedListsModal.tsx | visible text | shared list | shared list | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | button/link label | Create | Create | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | form placeholder | e.g. Session tunes | e.g. Session tunes | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | form placeholder | Optional description | Optional description | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | visible text | Description | Description | needs runtime verification |
| /learning-lists | components/lists/CreateListForm.tsx | visible text | Name | Name | needs runtime verification |
| /learning-lists | components/lists/CreateListModal.tsx | eyebrow prop | Lists | Lists | needs runtime verification |
| /learning-lists | components/lists/CreateListModal.tsx | helper/description prop | Make a container for repertoire, practice plans, session sets, or copied tune groups. | Make a container for repertoire, practice plans, session sets, or copied tune groups. | needs runtime verification |
| /learning-lists | components/lists/CreateListModal.tsx | title/heading prop | Create List | Create List | needs runtime verification |
| /learning-lists | components/lists/CreateListModal.tsx | visible text | Create List | Create List | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Delete List | Delete List | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Remove from List | Remove from List | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Save List Details | Save List Details | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | conditional visible text | Delete this list? This will remove the list and its contents, but it will not delete the tunes from your app. | Delete this list? This will remove the list and its contents, but it will not delete the tunes from your app. | needs runtime verification; conditional copy |
| /learning-lists | components/lists/EditListModal.tsx | conditional visible text | Key {tune.key} | Key {tune.key} | needs runtime verification; conditional copy |
| /learning-lists | components/lists/EditListModal.tsx | conditional visible text | Opening {tune.title}... | Opening {tune.title}... | needs runtime verification; conditional copy |
| /learning-lists | components/lists/EditListModal.tsx | conditional visible text | Private | Private | needs runtime verification; conditional copy |
| /learning-lists | components/lists/EditListModal.tsx | conditional visible text | Public | Public | needs runtime verification; conditional copy |
| /learning-lists | components/lists/EditListModal.tsx | eyebrow prop | Lists | Lists | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | helper/description prop | Edit this list container, remove tunes from this list only, or delete the list. | Edit this list container, remove tunes from this list only, or delete the list. | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | title/heading prop | Manage List | Manage List | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | Danger zone | Danger zone | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | Delete this list container. This removes the list and its list memberships only. It will not delete the tunes from your app. | Delete this list container. This removes the list and its list memberships only. It will not delete the tunes from your app. | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | Description | Description | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | List details | List details | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | Name | Name | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | This list has no tunes. | This list has no tunes. | needs runtime verification |
| /learning-lists | components/lists/EditListModal.tsx | visible text | Tunes in this list | Tunes in this list | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | conditional visible text | No key or time signature set | No key or time signature set | needs runtime verification; conditional copy |
| /learning-lists | components/lists/LearningQueueModal.tsx | conditional visible text | Opening {tuneTitle}... | Opening {tuneTitle}... | needs runtime verification; conditional copy |
| /learning-lists | components/lists/LearningQueueModal.tsx | returned status/helper text | {firstListName} + {remainingListNames.length} more | {firstListName} + {remainingListNames.length} more | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/LearningQueueModal.tsx | returned status/helper text | No list | No list | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/LearningQueueModal.tsx | returned status/helper text | Saved earlier | Saved earlier | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | Close | Close | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | First saved: | First saved: | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | in your lists but not yet in Practice or Known. | in your lists but not yet in Practice or Known. | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | In: | In: | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | Learning Queue | Learning Queue | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | Next oldest: | Next oldest: | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | Open queue | Open queue | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | Saved for later | Saved for later | needs runtime verification |
| /learning-lists | components/lists/LearningQueueModal.tsx | visible text | These tunes are in at least one of your lists, but they are not yet in Practice or Known. Oldest saved tunes appear first so old intentions do not disappear. | These tunes are in at least one of your lists, but they are not yet in Practice or Known. Oldest saved tunes appear first so old intentions do not disappear. | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | button/link label | Open | Open | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | button/link label | View List | View List | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | conditional visible text | Open list {list.name} | Open list {list.name} | needs runtime verification; conditional copy |
| /learning-lists | components/lists/ListOverviewCard.tsx | returned status/helper text | Manage List | Manage List | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/ListOverviewCard.tsx | visible text | Styles included | Styles included | needs runtime verification |
| /learning-lists | components/lists/ListOverviewCard.tsx | visible text | Your editable copy | Your editable copy | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | 1–10 tunes | 1–10 tunes | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | 11–25 tunes | 11–25 tunes | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | 26–50 tunes | 26–50 tunes | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | 51+ tunes | 51+ tunes | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | Copied | Copied | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | Mine | Mine | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | Private | Private | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | Public | Public | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | config/action label | Style: {style} | Style: {style} | needs runtime verification; derived from constant/config |
| /learning-lists | components/lists/ListSearchFilters.tsx | helper/description prop | Narrow your list overview by size, style, source, or visibility. | Narrow your list overview by size, style, source, or visibility. | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | title/heading prop | Filter lists | Filter lists | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | title/heading prop | Size | Size | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | title/heading prop | Source | Source | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | title/heading prop | Style | Style | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | title/heading prop | Visibility | Visibility | needs runtime verification |
| /learning-lists | components/lists/ListSearchFilters.tsx | visible text | No styles available. | No styles available. | needs runtime verification |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | config/action label |  | Cleanup | mobile-only; derived from constant/config |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | config/action label |  | Learning Queue | mobile-only; derived from constant/config |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | config/action label |  | Lists | mobile-only; derived from constant/config |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | config/action label |  | My Tunes | mobile-only; derived from constant/config |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | config/action label |  | Overview | mobile-only; derived from constant/config |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | helper/description prop |  | Learning queue and unlisted tune prompts will appear here. | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | helper/description prop |  | Try clearing the search or filters. | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | helper/description prop |  | Use Create List from Overview to start one. | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | returned status/helper text |  | Browse Tunes | mobile-only; conditional/status path |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | returned status/helper text |  | Reset view | mobile-only; conditional/status path |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | returned status/helper text |  | Search by list name | mobile-only; conditional/status path |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | returned status/helper text |  | Search lists | mobile-only; conditional/status path |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | title/heading prop |  | No lists match this view | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | title/heading prop |  | No lists yet | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | title/heading prop |  | Nothing to clean up | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Cleanup | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Editable lists you created or copied. Showing | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Lists | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Organise tunes | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Reset | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Review saved-for-later tunes and organise unlisted practice or known tunes. | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Signed in as | mobile-only |
| /learning-lists | components/lists/ListsMobileSwitcher.tsx | visible text |  | Your lists | mobile-only |
| /learning-lists | components/lists/ListsResultsHeader.tsx | visible text | Collections | Collections | needs runtime verification |
| /learning-lists | components/lists/ListsResultsHeader.tsx | visible text | Reset view | Reset view | needs runtime verification |
| /learning-lists | components/lists/ListsResultsHeader.tsx | visible text | Showing | Showing | needs runtime verification |
| /learning-lists | components/lists/ListsResultsHeader.tsx | visible text | Your lists | Your lists | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Could not create list. | Could not create list. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Could not tell which list to edit. | Could not tell which list to edit. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Could not tell which tune to remove from the list. | Could not tell which tune to remove from the list. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Could not update list. | Could not update list. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Invalid list visibility. | Invalid list visibility. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | List created. | List created. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | List deleted. | List deleted. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | List not found or you do not own it. | List not found or you do not own it. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | List updated. | List updated. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Please enter a list name. | Please enter a list name. | needs runtime verification |
| /learning-lists | components/lists/ListsStatusMessages.tsx | visible text | Tune removed from this list. | Tune removed from this list. | needs runtime verification |
| /learning-lists | components/lists/ListsSummaryGrid.tsx | helper/description prop | Tunes you mark as known or start practising will appear here. | Tunes you mark as known or start practising will appear here. | needs runtime verification |
| /learning-lists | components/lists/ListsSummaryGrid.tsx | returned status/helper text | Browse Tunes | Browse Tunes | needs runtime verification; conditional/status path |
| /learning-lists | components/lists/ListsSummaryGrid.tsx | title/heading prop | No personal tunes yet | No personal tunes yet | needs runtime verification |
| /learning-lists | components/lists/ListsSummaryGrid.tsx | visible text | Known and active practice tunes. | Known and active practice tunes. | needs runtime verification |
| /learning-lists | components/lists/ListsSummaryGrid.tsx | visible text | Repertoire | Repertoire | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | conditional visible text | Opening {tune.title}... | Opening {tune.title}... | needs runtime verification; conditional copy |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Close | Close | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | In practice | In practice | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Known | Known | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Known and active practice tunes. | Known and active practice tunes. | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | My Tunes | My Tunes | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | No tunes yet. | No tunes yet. | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Open tune page | Open tune page | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Opening | Opening | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | Repertoire | Repertoire | needs runtime verification |
| /learning-lists | components/lists/MyTunesModal.tsx | visible text | View My Tunes | View My Tunes | needs runtime verification |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | conditional visible text | Opening {pieceTitle}... | Opening {pieceTitle}... | needs runtime verification; conditional copy |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | conditional visible text | Untitled tune | Untitled tune | needs runtime verification; conditional copy |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | visible text | Add to List | Add to List | needs runtime verification |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | visible text | Close | Close | needs runtime verification |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | visible text | Known tunes | Known tunes | needs runtime verification |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | visible text | need organising. | need organising. | needs runtime verification |
| /learning-lists | components/lists/UnlistedKnownTunesModal.tsx | visible text | Review tunes | Review tunes | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | conditional visible text | Opening {pieceTitle}... | Opening {pieceTitle}... | needs runtime verification; conditional copy |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | conditional visible text | Untitled tune | Untitled tune | needs runtime verification; conditional copy |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | Add to List | Add to List | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | Close | Close | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | In practice, not in a list | In practice, not in a list | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | need organising. | need organising. | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | Practice | Practice | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | Review tunes | Review tunes | needs runtime verification |
| /learning-lists | components/lists/UnlistedPracticeTunesModal.tsx | visible text | Stage | Stage | needs runtime verification |
| /learning-lists | lib/actions/lists.ts | config heading/name | {sourceList.name} (Copy) | {sourceList.name} (Copy) | needs runtime verification; derived from constant/config |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | {basePath}{separator}list_add={status} | {basePath}{separator}list_add={status} | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | Could not create list. | Could not create list. | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | Enter a list name. | Enter a list name. | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | Invalid list visibility. | Invalid list visibility. | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | returned status/helper text | Please log in again. | Please log in again. | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | status/error message | Copied lists cannot be made public | Copied lists cannot be made public | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | status/error message | Invalid visibility request | Invalid visibility request | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | status/error message | List not found | List not found | needs runtime verification; conditional/status path |
| /learning-lists | lib/actions/lists.ts | status/error message | List not found or not owned by user. | List not found or not owned by user. | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/[id]/page.tsx | conditional visible text | Public | Public | needs runtime verification; conditional copy |
| /library / tune detail | app/library/[id]/page.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/[id]/page.tsx | title/heading prop | Tune | Tune | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | title/heading prop | Tune not found | Tune not found | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | visible text | Back to Tunes | Back to Tunes | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | visible text | Could not load tune. | Could not load tune. | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | visible text | Key: | Key: | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | visible text | Public lists | Public lists | needs runtime verification |
| /library / tune detail | app/library/[id]/page.tsx | visible text | Your lists | Your lists | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Could not remove tune. | Could not remove tune. | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Could not tell which tune to remove. | Could not tell which tune to remove. | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Known library | Known library | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Known tunes | Known tunes | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | That tune is already in this list. | That tune is already in this list. | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Tune added to list. | Tune added to list. | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Tune removed from your app. | Tune removed from your app. | needs runtime verification |
| /library / tune detail | app/library/known/page.tsx | visible text | Tunes you have marked as already known. | Tunes you have marked as already known. | needs runtime verification |
| /library / tune detail | app/library/loading.tsx | button/link label | Tunes | Tunes | needs runtime verification |
| /library / tune detail | app/library/loading.tsx | helper/description prop | Finding tunes, filters, list state, known repertoire, and practice state. | Finding tunes, filters, list state, known repertoire, and practice state. | needs runtime verification |
| /library / tune detail | app/library/loading.tsx | title/heading prop | Loading the tune catalogue | Loading the tune catalogue | needs runtime verification |
| /library / tune detail | app/library/page.tsx | returned status/helper text | Could not save Tunes page options. | Could not save Tunes page options. | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/page.tsx | returned status/helper text | Search by title | Search by title | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/page.tsx | returned status/helper text | Search tunes | Search tunes | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/page.tsx | returned status/helper text | Tunes page options reset. | Tunes page options reset. | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/page.tsx | returned status/helper text | Tunes page options saved. | Tunes page options saved. | needs runtime verification; conditional/status path |
| /library / tune detail | app/library/page.tsx | visible text | Browse the tune catalogue | Browse the tune catalogue | needs runtime verification |
| /library / tune detail | app/library/page.tsx | visible text | Logged in as | Logged in as | needs runtime verification |
| /library / tune detail | app/library/page.tsx | visible text | Search the shared tune library, add tunes to lists, mark known repertoire, or deliberately move tunes into practice. | Search the shared tune library, add tunes to lists, mark known repertoire, or deliberately move tunes into practice. | needs runtime verification |
| /library / tune detail | app/library/page.tsx | visible text | Tunes | Tunes | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Could not remove tune from practice. | Could not remove tune from practice. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Could not tell which practice tune to remove. | Could not tell which practice tune to remove. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | In practice | In practice | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Practice library | Practice library | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | That practice tune could not be found. | That practice tune could not be found. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | That tune is already in this list. | That tune is already in this list. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Tune added to list. | Tune added to list. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Tune removed from practice. | Tune removed from practice. | needs runtime verification |
| /library / tune detail | app/library/practice/page.tsx | visible text | Tunes currently in your active review system. | Tunes currently in your active review system. | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | button/link label | Remove | Remove | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | button/link label | Save media link | Save media link | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | conditional visible text | Other | Other | needs runtime verification; conditional copy |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | conditional visible text | Untitled media link | Untitled media link | needs runtime verification; conditional copy |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | returned status/helper text | {buttonStyles.secondary} cursor-pointer | {buttonStyles.secondary} cursor-pointer | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | visible text | Add media link | Add media link | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | visible text | Additional media links | Additional media links | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | visible text | No additional media links yet. | No additional media links yet. | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | visible text | Open link | Open link | needs runtime verification |
| /library / tune detail | components/library/AdditionalMediaLinksSection.tsx | visible text | Other useful recordings, lessons, performances, or source material. | Other useful recordings, lessons, performances, or source material. | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | button/link label | Import Known Tunes | Import Known Tunes | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | button/link label | Importing tunes... | Importing tunes... | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | conditional visible text | Change CSV File | Change CSV File | needs runtime verification; conditional copy |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | conditional visible text | Download Template | Download Template | needs runtime verification; conditional copy |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | conditional visible text | Downloading... | Downloading... | needs runtime verification; conditional copy |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | conditional visible text | Select CSV File | Select CSV File | needs runtime verification; conditional copy |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | returned status/helper text | .csv,text/csv | .csv,text/csv | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | returned status/helper text | {buttonStyles.primary} {isSubmitting ? "pointer-events-none opacity-50" : } | {buttonStyles.primary} {isSubmitting ? "pointer-events-none opacity-50" : } | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | returned status/helper text | inline-block {buttonStyles.secondary} {isSubmitting ? "pointer-} | inline-block {buttonStyles.secondary} {isSubmitting ? "pointer-} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | returned status/helper text | pointer-events-none opacity-50 | pointer-events-none opacity-50 | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Bulk Import Known Tunes | Bulk Import Known Tunes | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Choose completed CSV | Choose completed CSV | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Close | Close | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | CSV template | CSV template | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Import | Import | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Selected file: | Selected file: | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | This is the quickest way to make the app useful: your known tunes will count as repertoire immediately, without putting everything into practice. | This is the quickest way to make the app useful: your known tunes will count as repertoire immediately, without putting everything into practice. | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Upload a CSV of tunes you already know. We’ll add them to your known tunes and place them in your Uploaded Tunes list. | Upload a CSV of tunes you already know. We’ll add them to your known tunes and place them in your Uploaded Tunes list. | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | Use these columns in this exact order: title, key, style, time_signature, reference_url | Use these columns in this exact order: title, key, style, time_signature, reference_url | needs runtime verification |
| /library / tune detail | components/library/BulkImportKnownTunesModal.tsx | visible text | We’ll check the file format, match existing tunes where possible, create missing tunes, add them to your known tunes, and place them in Uploaded Tunes. | We’ll check the file format, match existing tunes where possible, create missing tunes, add them to your known tunes, and place them in Uploaded Tunes. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | button/link label | Create | Create | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | conditional visible text | Hide | Hide | needs runtime verification; conditional copy |
| /library / tune detail | components/library/CreateTuneForm.tsx | conditional visible text | No key | No key | needs runtime verification; conditional copy |
| /library / tune detail | components/library/CreateTuneForm.tsx | conditional visible text | Show | Show | needs runtime verification; conditional copy |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Alternate title | Alternate title | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Collector | Collector | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Region | Region | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Source | Source | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Story / folklore note | Story / folklore note | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | config/action label | Tune family | Tune family | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | Add a source, alternate title, regional note, tune-family link, or bit of folklore | Add a source, alternate title, regional note, tune-family link, or bit of folklore | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. 4/4 or 6/8 | e.g. 4/4 or 6/8 | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. Bill Monroe, trad., unknown | e.g. Bill Monroe, trad., unknown | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. Mandolin tab | e.g. Mandolin tab | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. Session video | e.g. Session video | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. Soldier’s Joy | e.g. Soldier’s Joy | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | form placeholder | e.g. YouTube, archive, or recording link | e.g. YouTube, archive, or recording link | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | title/heading prop | Use format like 4/4 or 6/8 | Use format like 4/4 or 6/8 | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Add one notation, tab, transcription, or source page link now. More can still be added later on the tune detail page. | Add one notation, tab, transcription, or source page link now. More can still be added later on the tune detail page. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Add one source note, alternate title, regional note, collector note, tune-family link, or bit of folklore. | Add one source note, alternate title, regional note, collector note, tune-family link, or bit of folklore. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Add optional media, sheet music, sources, or lore while creating the tune. | Add optional media, sheet music, sources, or lore while creating the tune. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Add to known | Add to known | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Add to list | Add to list | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Advanced details | Advanced details | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | After create | After create | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Also | Also | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Choose a category | Choose a category | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Choose a list | Choose a list | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Composer | Composer | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Do nothing | Do nothing | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Extra media link | Extra media link | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Key | Key | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | List | List | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Lore category | Lore category | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Lore text | Lore text | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Media label | Media label | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Media URL | Media URL | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Optional. Add one useful reference link for this tune, such as a YouTube video, field recording, or other version-defining source. | Optional. Add one useful reference link for this tune, such as a YouTube video, field recording, or other version-defining source. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Optional. Enter as numbers with a slash, for example 4/4, 3/4, or 6/8. | Optional. Enter as numbers with a slash, for example 4/4, 3/4, or 6/8. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Optional. Use the common playing key for this tune entry if that is musically relevant. | Optional. Use the common playing key for this tune entry if that is musically relevant. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Optional. Use this only where a composer or useful attribution is known. | Optional. Use this only where a composer or useful attribution is known. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Primary reference URL | Primary reference URL | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Sheet music / tab | Sheet music / tab | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Sheet music label | Sheet music label | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Sheet music URL | Sheet music URL | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Source or lore entry | Source or lore entry | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Start Practice | Start Practice | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Styles | Styles | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Time signature | Time signature | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Title | Title | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Use the common tune title only. Avoid adding key names, instrument notes, or version labels in the title. | Use the common tune title only. Avoid adding key names, instrument notes, or version labels in the title. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | Use this for another recording, video, or listening reference. The primary reference URL above will still remain the main tune reference. | Use this for another recording, video, or listening reference. The primary reference URL above will still remain the main tune reference. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneForm.tsx | visible text | You do not have any lists yet. | You do not have any lists yet. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneModal.tsx | eyebrow prop | Catalogue | Catalogue | needs runtime verification |
| /library / tune detail | components/library/CreateTuneModal.tsx | helper/description prop | Add a tune to the shared catalogue, then optionally place it straight into your own repertoire workflow. | Add a tune to the shared catalogue, then optionally place it straight into your own repertoire workflow. | needs runtime verification |
| /library / tune detail | components/library/CreateTuneModal.tsx | title/heading prop | Create Tune | Create Tune | needs runtime verification |
| /library / tune detail | components/library/CreateTuneModal.tsx | visible text | Create Tune | Create Tune | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | button/link label | Delete canonical tune | Delete canonical tune | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | eyebrow prop | Moderator destructive action | Moderator destructive action | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | helper/description prop | This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications. | This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications. | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | title/heading prop | Delete canonical tune | Delete canonical tune | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /library / tune detail | components/library/DeleteCanonicalTuneModal.tsx | visible text | To confirm, type this exactly: | To confirm, type this exactly: | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | accessibility label | Close status menu | Close status menu | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | button/link label | Tune catalogue results | Tune catalogue results | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | conditional visible text | Delete canonical tune {piece.title} | Delete canonical tune {piece.title} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/LibraryList.tsx | helper/description prop | Try removing a filter, changing the title search, or creating the tune if it is genuinely missing. | Try removing a filter, changing the title search, or creating the tune if it is genuinely missing. | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | helper/description prop | Use Create Tune or Bulk Import Known Tunes above to start building the canonical tune library. | Use Create Tune or Bulk Import Known Tunes above to start building the canonical tune library. | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | returned status/helper text | {redirectTo}{separator}scroll_piece={pieceId} | {redirectTo}{separator}scroll_piece={pieceId} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryList.tsx | returned status/helper text | piece-{piece.id} | piece-{piece.id} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryList.tsx | returned status/helper text | relative z-0 scroll-mt-28 | relative z-0 scroll-mt-28 | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryList.tsx | returned status/helper text | relative z-50 scroll-mt-28 | relative z-50 scroll-mt-28 | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryList.tsx | returned status/helper text | Reset filters | Reset filters | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryList.tsx | title/heading prop | Moderator only. Review the warning before deleting this shared tune for everyone. | Moderator only. Review the warning before deleting this shared tune for everyone. | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | title/heading prop | No tunes in the library yet | No tunes in the library yet | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | title/heading prop | No tunes match this search | No tunes match this search | needs runtime verification |
| /library / tune detail | components/library/LibraryList.tsx | visible text | Catalogue | Catalogue | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | accessibility label | Tune catalogue pages | Tune catalogue pages | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | conditional visible text | , page {currentPage} of {totalPages} | , page {currentPage} of {totalPages} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | conditional visible text | All | All | needs runtime verification; conditional copy |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | returned status/helper text | /library?{params.toString()} | /library?{params.toString()} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | returned status/helper text | ellipsis-{index} | ellipsis-{index} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | All tunes | All tunes | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | Catalogue | Catalogue | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | Next | Next | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | Per page | Per page | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | Previous | Previous | needs runtime verification |
| /library / tune detail | components/library/LibraryResultsHeader.tsx | visible text | Showing | Showing | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | . Already in list: | . Already in list: | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | . Already known: | . Already known: | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | . Reused existing pieces: | . Reused existing pieces: | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | A tune with that title already exists; either add that tune or give this one a new title. For example, if Black Mountain Rag already exists in D you can make it in A by titling it Black Mountain Rag in A. | A tune with that title already exists; either add that tune or give this one a new title. For example, if Black Mountain Rag already exists in D you can make it in A by titling it Black Mountain Rag in A. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Added to known tunes: | Added to known tunes: | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Added to Uploaded Tunes list: | Added to Uploaded Tunes list: | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Bulk import completed. | Bulk import completed. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Canonical tune deleted. | Canonical tune deleted. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Choose a YouTube video URL for this reference. | Choose a YouTube video URL for this reference. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Choose at least one list before adding the tune. | Choose at least one list before adding the tune. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not add reference. | Could not add reference. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not add tune to list/s. | Could not add tune to list/s. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not create tune. | Could not create tune. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not delete canonical tune. | Could not delete canonical tune. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not find that saved loop. | Could not find that saved loop. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not find that tune. | Could not find that tune. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not remove tune from practice. | Could not remove tune from practice. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not remove tune. | Could not remove tune. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not save loop: choose a valid start and end point. | Could not save loop: choose a valid start and end point. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not save loop: missing label or video. | Could not save loop: missing label or video. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not tell which canonical tune to delete. | Could not tell which canonical tune to delete. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not tell which practice item to remove. | Could not tell which practice item to remove. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not tell which tune to add. | Could not tell which tune to add. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not tell which tune to remove. | Could not tell which tune to remove. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not tell which tune to update. | Could not tell which tune to update. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not update loop. | Could not update loop. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Could not update preferred reference. | Could not update preferred reference. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | CSV headers are invalid. Use the template and keep this exact column order: title, key, style, time_signature, reference_url | CSV headers are invalid. Use the template and keep this exact column order: title, key, style, time_signature, reference_url | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | CSV parsed successfully. Header row is valid and data rows were found. | CSV parsed successfully. Header row is valid and data rows were found. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | CSV received. Next step is parsing and validation. | CSV received. Next step is parsing and validation. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | CSV row | CSV row | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | CSV validated successfully. All rows have the right column count and a title. | CSV validated successfully. All rows have the right column count and a title. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | does not have exactly 5 columns. | does not have exactly 5 columns. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Invalid key. Format is &quot;D&quot;, &quot;Dm&quot; or &quot;D modal&quot; for modal tunes. | Invalid key. Format is &quot;D&quot;, &quot;Dm&quot; or &quot;D modal&quot; for modal tunes. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | is missing a title. | is missing a title. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Loop deleted. | Loop deleted. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Loop saved. | Loop saved. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | No tunes were available to import. | No tunes were available to import. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Only moderators can delete canonical tunes. | Only moderators can delete canonical tunes. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Please choose a CSV file. | Please choose a CSV file. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Please enter a tune title. | Please enter a tune title. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Preferred reference removed. | Preferred reference removed. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Preferred reference saved. | Preferred reference saved. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Preferred references must be YouTube links for now. | Preferred references must be YouTube links for now. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Reference added. | Reference added. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Start Practice | Start Practice | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | That does not look like a valid URL. | That does not look like a valid URL. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | That file does not look like a CSV. | That file does not look like a CSV. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | That tune could not be found. It may already have been deleted. | That tune could not be found. It may already have been deleted. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | That tune is already in the selected list/s. | That tune is already in the selected list/s. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | That tune is no longer in active practice. | That tune is no longer in active practice. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | The CSV could not be parsed. Check for broken quotes or malformed rows. | The CSV could not be parsed. Check for broken quotes or malformed rows. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | The CSV has a valid header row but no tune rows underneath it. | The CSV has a valid header row but no tune rows underneath it. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | The selected CSV file is empty. | The selected CSV file is empty. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | This tune already has a reference. | This tune already has a reference. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Tune added to selected list/s. | Tune added to selected list/s. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Tune added to the selected list/s that did not already contain it. | Tune added to the selected list/s that did not already contain it. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Tune created. | Tune created. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Tune removed from active practice. | Tune removed from active practice. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Tune removed from your app. | Tune removed from your app. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | Typed confirmation did not match. The canonical tune was not deleted. | Typed confirmation did not match. The canonical tune was not deleted. | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | View Known Tunes | View Known Tunes | needs runtime verification |
| /library / tune detail | components/library/LibraryStatusMessages.tsx | visible text | View Uploaded Tunes | View Uploaded Tunes | needs runtime verification |
| /library / tune detail | components/library/LibraryTuneCardActions.tsx | visible text | Add to list | Add to list | needs runtime verification |
| /library / tune detail | components/library/LibraryTuneCardActions.tsx | visible text | Find reference | Find reference | needs runtime verification |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Add lore entry | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Adding... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Delete | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Deleting... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Post comment | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Posting... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Reply | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Replying... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Reporting... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Save lore entry | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Saving... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | button/link label |  | Submit report | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | conditional visible text |  | Delete this comment? | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | conditional visible text |  | Delete this lore entry? | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Alternate title | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Collector | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Region | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Source | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Story / folklore note | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | config/action label |  | Tune family | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | displayName config |  | Unknown user | mobile-only; derived from constant/config |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | form placeholder |  | Add a source, alternate title, regional note, tune-family link, or bit of folklore | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | form placeholder |  | Ask a question, add a playing note, or continue the conversation | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | form placeholder |  | Optional details for moderators | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | form placeholder |  | Optional moderator note | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | form placeholder |  | Reply to this comment | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | title/heading prop |  | Comments | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | title/heading prop |  | Edit lore entry | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | title/heading prop |  | Report lore entry | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | title/heading prop |  | Sources & lore | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Abuse or harassment | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Added by | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Choose a reason | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Close | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Edit | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Hateful content | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Lore and comment sections are hidden in Tune Page Options. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Misleading or bad-faith | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | No comments yet. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | No sources or lore yet. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Other | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Posted by | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Reply from | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Report | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Sexual content | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | Spam | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | This comment has been hidden by a moderator. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneLoreSection.tsx | visible text |  | This reply has been hidden by a moderator. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Adding... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Remove preferred reference | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Removing... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Save preferred reference | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Save sheet music link | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | button/link label |  | Saving... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | conditional visible text |  | No primary reference saved yet. | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | conditional visible text |  | Using default tune reference. | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | conditional visible text |  | Using your preferred reference. | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | title/heading prop |  | Preferred reference | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | title/heading prop |  | Reference media | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | title/heading prop |  | Sheet music / tab | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | Add sheet music link | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | Find reference | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | Media and sheet music sections are hidden in Tune Page Options. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | No sheet music links yet. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | Open default reference | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | Set the reference you want to see for this tune. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneMediaSection.tsx | visible text |  | The main reference version for this tune. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | button/link label |  | Save notes | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | button/link label |  | Saving... | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | conditional visible text |  | Rough | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | conditional visible text |  | Shaky | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | conditional visible text |  | Solid | mobile-only; conditional copy |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | form placeholder |  | Add your private notes for this tune | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | title/heading prop |  | My notes | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | title/heading prop |  | Practice history | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | visible text |  | No diary notes for this tune yet. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneNotesSection.tsx | visible text |  | Notes sections are hidden in Tune Page Options. | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | button/link label |  | Known | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | button/link label |  | Lists | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | button/link label |  | Practice | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | button/link label |  | Set as known | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | returned status/helper text |  | Already in practice | mobile-only; conditional/status path |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | returned status/helper text |  | Not in practice | mobile-only; conditional/status path |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | returned status/helper text |  | Not known | mobile-only; conditional/status path |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | title/heading prop |  | Tune state | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | visible text |  | Already in practice | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | visible text |  | Already marked known | mobile-only |
| /library / tune detail | components/library/mobile/MobileTuneStateSection.tsx | visible text |  | Practice and tune-detail sections are hidden in Tune Page Options. | mobile-only |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Delete | Delete | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Post comment | Post comment | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Posting... | Posting... | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Reply | Reply | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Replying... | Replying... | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Reporting... | Reporting... | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | button/link label | Submit report | Submit report | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | conditional visible text | Delete this comment? | Delete this comment? | needs runtime verification; conditional copy |
| /library / tune detail | components/library/PieceCommentsSection.tsx | displayName config | Unknown user | Unknown user | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceCommentsSection.tsx | form placeholder | Ask a question, add a playing note, or continue the conversation | Ask a question, add a playing note, or continue the conversation | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | form placeholder | Optional details for moderators | Optional details for moderators | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | form placeholder | Reply to this comment | Reply to this comment | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Abuse or harassment | Abuse or harassment | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Choose a reason | Choose a reason | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Comments | Comments | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Conversation about this tune. Replies stay attached to the tune, and may also appear in inbox notifications. | Conversation about this tune. Replies stay attached to the tune, and may also appear in inbox notifications. | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Hateful content | Hateful content | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Misleading or bad-faith | Misleading or bad-faith | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | No comments yet. | No comments yet. | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Other | Other | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Posted by | Posted by | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Reply from | Reply from | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Report | Report | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Sexual content | Sexual content | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | Spam | Spam | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | This comment has been hidden by a moderator. | This comment has been hidden by a moderator. | needs runtime verification |
| /library / tune detail | components/library/PieceCommentsSection.tsx | visible text | This reply has been hidden by a moderator. | This reply has been hidden by a moderator. | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Add lore entry | Add lore entry | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Delete | Delete | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Reporting... | Reporting... | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Save lore entry | Save lore entry | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | button/link label | Submit lore report | Submit lore report | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | conditional visible text | Delete this lore entry? | Delete this lore entry? | needs runtime verification; conditional copy |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Alternate title | Alternate title | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Collector | Collector | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Region | Region | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Source | Source | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Story / folklore note | Story / folklore note | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | config/action label | Tune family | Tune family | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | displayName config | Unknown user | Unknown user | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/PieceLoreSection.tsx | form placeholder | Add a source, alternate title, regional note, tune-family link, or bit of folklore | Add a source, alternate title, regional note, tune-family link, or bit of folklore | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | form placeholder | Optional moderator note | Optional moderator note | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | form placeholder | What should moderators look at? | What should moderators look at? | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | helper/description prop | Edit the existing lore entry. The current category and text are prefilled. | Edit the existing lore entry. The current category and text are prefilled. | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | helper/description prop | Send this lore entry to moderators for review. Explain what seems wrong, duplicated, misleading, or inappropriate. | Send this lore entry to moderators for review. Explain what seems wrong, duplicated, misleading, or inappropriate. | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | title/heading prop | Edit lore entry | Edit lore entry | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | title/heading prop | Report lore entry | Report lore entry | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Add shared background, source notes, alternate titles, regional notes, tune-family links, or folklore. | Add shared background, source notes, alternate titles, regional notes, tune-family links, or folklore. | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Added by | Added by | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Choose a reason | Choose a reason | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Close | Close | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Duplicate | Duplicate | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Edit | Edit | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Inappropriate | Inappropriate | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Incorrect | Incorrect | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Misleading | Misleading | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | No sources or lore yet. | No sources or lore yet. | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Other | Other | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Report | Report | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Reported entry | Reported entry | needs runtime verification |
| /library / tune detail | components/library/PieceLoreSection.tsx | visible text | Sources &amp; Lore | Sources &amp; Lore | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | button/link label | Remove preferred reference | Remove preferred reference | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | button/link label | Save preferred reference | Save preferred reference | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | conditional visible text | Set preferred reference | Set preferred reference | needs runtime verification; conditional copy |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | conditional visible text | Update preferred reference | Update preferred reference | needs runtime verification; conditional copy |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | returned status/helper text | Open loop controls | Open loop controls | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | Default reference is still available. | Default reference is still available. | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | Find reference | Find reference | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | Open default reference | Open default reference | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | Reference media | Reference media | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | The main reference version for this tune. | The main reference version for this tune. | needs runtime verification |
| /library / tune detail | components/library/PieceMediaLinksSection.tsx | visible text | This only changes the reference you see. The default tune reference stays unchanged for other users. | This only changes the reference you see. The default tune reference stays unchanged for other users. | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | conditional visible text | {chip.groupLabel}: {chip.value} | {chip.groupLabel}: {chip.value} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/PieceSearchFilters.tsx | helper/description prop | Select as many filters as you like. | Select as many filters as you like. | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | returned status/helper text | {group}:{value} | {group}:{value} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/PieceSearchFilters.tsx | title/heading prop | Filter tunes | Filter tunes | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | title/heading prop | Key | Key | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | title/heading prop | Sort | Sort | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | title/heading prop | Style | Style | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | title/heading prop | Time | Time | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | No keys available. | No keys available. | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | No styles available. | No styles available. | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | No time signatures available. | No time signatures available. | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | Oldest added first | Oldest added first | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | Order | Order | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | Recently added first | Recently added first | needs runtime verification |
| /library / tune detail | components/library/PieceSearchFilters.tsx | visible text | Title A–Z | Title A–Z | needs runtime verification |
| /library / tune detail | components/library/PieceSheetMusicSection.tsx | button/link label | Add sheet music link | Add sheet music link | needs runtime verification |
| /library / tune detail | components/library/PieceSheetMusicSection.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /library / tune detail | components/library/PieceSheetMusicSection.tsx | visible text | No sheet music links yet. | No sheet music links yet. | needs runtime verification |
| /library / tune detail | components/library/PieceSheetMusicSection.tsx | visible text | Sheet music / tab | Sheet music / tab | needs runtime verification |
| /library / tune detail | components/library/ReferenceMediaEmbed.tsx | conditional visible text | {title} reference video | {title} reference video | needs runtime verification; conditional copy |
| /library / tune detail | components/library/ReferenceMediaEmbed.tsx | returned status/helper text | accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share | accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/ReferenceMediaEmbed.tsx | visible text | Watch the reference here, or open the full player for loop points, saved loops and speed controls. | Watch the reference here, or open the full player for loop points, saved loops and speed controls. | needs runtime verification |
| /library / tune detail | components/library/ReferenceMediaModal.tsx | button/link label | Loading saved loops... | Loading saved loops... | needs runtime verification |
| /library / tune detail | components/library/ReferenceMediaModal.tsx | conditional visible text | {title} video | {title} video | needs runtime verification; conditional copy |
| /library / tune detail | components/library/ReferenceMediaModal.tsx | eyebrow prop | Reference media | Reference media | needs runtime verification |
| /library / tune detail | components/library/ReferenceMediaModal.tsx | status/error message | Could not load saved loops. | Could not load saved loops. | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | button/link label | Submit edit request | Submit edit request | needs runtime verification |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | button/link label | Submitting... | Submitting... | needs runtime verification |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | conditional visible text | Composer, currently {piece.composer \|\| "missing"} | Composer, currently {piece.composer \|\| "missing"} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | conditional visible text | Time signature, currently {piece.time_signature \|\| "missing"} | Time signature, currently {piece.time_signature \|\| "missing"} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | conditional visible text | Title, currently {piece.title} | Title, currently {piece.title} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | form placeholder | Reference URL | Reference URL | needs runtime verification |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | form placeholder | Why should this be changed? | Why should this be changed? | needs runtime verification |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | visible text | Request a correction | Request a correction | needs runtime verification |
| /library / tune detail | components/library/RequestTuneEditForm.tsx | visible text | Suggest corrections to the shared tune record. To add background, source notes, alternate titles, or folklore, use the Lore section instead. | Suggest corrections to the shared tune record. To add background, source notes, alternate titles, or folklore, use the Lore section instead. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Composer | Composer | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Delete canonical tune | Delete canonical tune | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Key | Key | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Reference URL | Reference URL | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Save canonical details | Save canonical details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Save missing details | Save missing details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Style | Style | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Time signature | Time signature | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | button/link label | Title | Title | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | conditional visible text | (selected) | (selected) | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Add composer or attribution | Add composer or attribution | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Add reference URL | Add reference URL | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Add time signature, eg "4/4" | Add time signature, eg "4/4" | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Composer text attribution, eg trad. or Bill Monroe | Composer text attribution, eg trad. or Bill Monroe | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Optional audit note explaining the edit | Optional audit note explaining the edit | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Reference URL | Reference URL | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Search by username or display name | Search by username or display name | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Time signature, eg "4/4" | Time signature, eg "4/4" | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | form placeholder | Title | Title | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | helper/description prop | Add canonical information that is currently missing. Existing details should be changed through a correction request. | Add canonical information that is currently missing. Existing details should be changed through a correction request. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | helper/description prop | Suggest corrections to the shared tune record. To add background, source notes, alternate titles, or folklore, use the Lore section instead. | Suggest corrections to the shared tune record. To add background, source notes, alternate titles, or folklore, use the Lore section instead. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | helper/description prop | This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications. | This permanently removes this tune from the shared catalogue for everyone. It may also remove connected practice state, known status, list entries, comments, lore, media links, moderation requests, and notifications. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | helper/description prop | Update shared tune data directly. This affects the canonical tune record and creates an audit log entry. | Update shared tune data directly. This affects the canonical tune record and creates an audit log entry. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | returned status/helper text | {profile.display_name ?? ""} {profile.username ?? ""} | {profile.display_name ?? ""} {profile.username ?? ""} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | returned status/helper text | /users/{encodeURIComponent(composerProfile.username)} | /users/{encodeURIComponent(composerProfile.username)} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | title/heading prop | Add missing details | Add missing details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | title/heading prop | Delete canonical tune | Delete canonical tune | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | title/heading prop | Edit canonical details | Edit canonical details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | title/heading prop | Request a correction | Request a correction | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Add missing details | Add missing details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Attribution: | Attribution: | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Choose key | Choose key | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Choose style | Choose style | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Clear linked composer | Clear linked composer | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Close | Close | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Delete canonical tune | Delete canonical tune | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Edit canonical details | Edit canonical details | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | filling in. | filling in. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Link this tune to a user profile when the tune is composed by that Tunes App user. | Link this tune to a user profile when the tune is composed by that Tunes App user. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Linked Tunes App composer | Linked Tunes App composer | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Missing | Missing | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | No key | No key | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | No linked composer selected. | No linked composer selected. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | No profiles found. | No profiles found. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | No style | No style | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Request correction | Request correction | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Shared canonical tune data. | Shared canonical tune data. | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | shared detail | shared detail | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | To confirm, type this exactly: | To confirm, type this exactly: | needs runtime verification |
| /library / tune detail | components/library/TuneCanonicalDetailsCard.tsx | visible text | Tune details | Tune details | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | accessibility label | This tune is marked as known | This tune is marked as known | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | button/link label | Set as known | Set as known | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | conditional visible text | Already in practice | Already in practice | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneDetailActions.tsx | conditional visible text | Known | Known | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneDetailActions.tsx | conditional visible text | Not in practice | Not in practice | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneDetailActions.tsx | conditional visible text | Not known | Not known | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Already in practice | Already in practice | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Already marked known | Already marked known | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Known | Known | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Lists | Lists | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Practice | Practice | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Status | Status | needs runtime verification |
| /library / tune detail | components/library/TuneDetailActions.tsx | visible text | Tune state | Tune state | needs runtime verification |
| /library / tune detail | components/library/TuneDetailMobileSwitcher.tsx | config/action label |  | Lore | mobile-only; derived from constant/config |
| /library / tune detail | components/library/TuneDetailMobileSwitcher.tsx | config/action label |  | Media | mobile-only; derived from constant/config |
| /library / tune detail | components/library/TuneDetailMobileSwitcher.tsx | config/action label |  | Notes | mobile-only; derived from constant/config |
| /library / tune detail | components/library/TuneDetailMobileSwitcher.tsx | config/action label |  | Practice | mobile-only; derived from constant/config |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | conditional visible text | Diary-only check. Does not change Stage or review scheduling. | Diary-only check. Does not change Stage or review scheduling. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | conditional visible text | Formal review updates Stage and the next review date. | Formal review updates Stage and the next review date. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | conditional visible text | Practice check | Practice check | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | conditional visible text | Review | Review | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | conditional visible text | Save {selectedOutcome.label} | Save {selectedOutcome.label} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | config/action label | Rough | Rough | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | config/action label | Shaky | Shaky | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | config/action label | Solid | Solid | needs runtime verification; derived from constant/config |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | form placeholder | What happened with this tune today? | What happened with this tune today? | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | returned status/helper text | {reviewOutcome.mode}-{reviewOutcome.outcome} | {reviewOutcome.mode}-{reviewOutcome.outcome} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Add an optional note for | Add an optional note for | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Category | Category | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Close | Close | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Enable Practice Diary on your Profile page to log practice checks for tunes that are not in practice. | Enable Practice Diary on your Profile page to log practice checks for tunes that are not in practice. | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | No category | No category | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Optional note | Optional note | needs runtime verification |
| /library / tune detail | components/library/TunePageReviewPanel.tsx | visible text | Practice diary | Practice diary | needs runtime verification |
| /library / tune detail | components/library/TunePrivateNotesSection.tsx | button/link label | Save notes | Save notes | needs runtime verification |
| /library / tune detail | components/library/TunePrivateNotesSection.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/TunePrivateNotesSection.tsx | form placeholder | Add your private notes for this tune | Add your private notes for this tune | needs runtime verification |
| /library / tune detail | components/library/TunePrivateNotesSection.tsx | visible text | My notes | My notes | needs runtime verification |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | conditional visible text | Choose how this tune sits in your account. | Choose how this tune sits in your account. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | conditional visible text | Start practising this tune, or mark it as already known. | Start practising this tune, or mark it as already known. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | eyebrow prop | Tune status | Tune status | needs runtime verification |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | visible text | Close | Close | needs runtime verification |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | visible text | Current status | Current status | needs runtime verification |
| /library / tune detail | components/library/TuneStatusActionSheet.tsx | visible text | My status: | My status: | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Remove from my library | Remove from my library | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Remove from practice | Remove from practice | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Add to my tunes | Add to my tunes | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Change status | Change status | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Choose how this tune sits in your account. | Choose how this tune sits in your account. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Mark "{piece.title}" as known? This removes it from active practice. | Mark "{piece.title}" as known? This removes it from active practice. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Mark as known | Mark as known | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Move "{piece.title}" from Known into Practice? This removes its known-only state and starts the review schedule. | Move "{piece.title}" from Known into Practice? This removes its known-only state and starts the review schedule. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Remove "{piece.title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists. | Remove "{piece.title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Remove "{piece.title}" from your library? This removes it from your practice, known tunes, and your lists, but does not delete the shared tune. | Remove "{piece.title}" from your library? This removes it from your practice, known tunes, and your lists, but does not delete the shared tune. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Set as known | Set as known | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | conditional visible text | Start practising this tune, or mark it as already known. | Start practising this tune, or mark it as already known. | needs runtime verification; conditional copy |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | returned status/helper text | Add to my tunes | Add to my tunes | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | returned status/helper text | In my lists | In my lists | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | returned status/helper text | In practice | In practice | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | returned status/helper text | relative z-[70] | relative z-[70] | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | visible text | Close menu | Close menu | needs runtime verification |
| /library / tune detail | components/library/TuneStatusDropdown.tsx | visible text | My status: | My status: | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | button/link label | Delete | Delete | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | button/link label | Loading YouTube controls... | Loading YouTube controls... | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | button/link label | Save loop | Save loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | / {formatTime(duration, true)} | / {formatTime(duration, true)} | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | Delete saved loop "{loop.label}"? | Delete saved loop "{loop.label}"? | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | Hide loops | Hide loops | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | Loop off | Loop off | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | Loop on | Loop on | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | conditional visible text | Show loops | Show loops | needs runtime verification; conditional copy |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | form placeholder | Optional note | Optional note | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | returned status/helper text | {minutes}:{Math.floor(remainingSeconds) .toString() .} | {minutes}:{Math.floor(remainingSeconds) .toString() .} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | returned status/helper text | {minutes}:{remainingSeconds.toFixed(1).padStart(4, "0")} | {minutes}:{remainingSeconds.toFixed(1).padStart(4, "0")} | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | returned status/helper text | not set | not set | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | returned status/helper text | shrink-0 whitespace-nowrap | shrink-0 whitespace-nowrap | needs runtime verification; conditional/status path |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | ← Previous section | ← Previous section | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Adjust loop | Adjust loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Clear | Clear | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Current time: | Current time: | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Double loop | Double loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Halve loop | Halve loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | In | In | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Next section → | Next section → | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Out | Out | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Play loop | Play loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Press Tap in at the start of the phrase, then Tap out at the end. | Press Tap in at the start of the phrase, then Tap out at the end. | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Reference controls | Reference controls | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Save loop | Save loop | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Save the current loop points with a label so they appear on this tune next time. | Save the current loop points with a label so they appear on this tune next time. | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Saved loops | Saved loops | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Speed | Speed | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Tap in | Tap in | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Tap out | Tap out | needs runtime verification |
| /library / tune detail | components/library/YouTubeLoopPlayer.tsx | visible text | Use a smaller nudge for fine trimming, or a larger nudge for rough movement. | Use a smaller nudge for fine trimming, or a larger nudge for rough movement. | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | button/link label | Searching YouTube... | Searching YouTube... | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | button/link label | Searching... | Searching... | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | conditional visible text | Search | Search | needs runtime verification; conditional copy |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | eyebrow prop | Reference media | Reference media | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | form placeholder | Search tune title, player, source, or style | Search tune title, player, source, or style | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | status/error message | Enter at least two characters to search. | Enter at least two characters to search. | needs runtime verification; conditional/status path |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | status/error message | YouTube search failed. | YouTube search failed. | needs runtime verification; conditional/status path |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | status/error message | YouTube search failed. Check your connection and try again. | YouTube search failed. Check your connection and try again. | needs runtime verification; conditional/status path |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | title/heading prop | Find reference recording | Find reference recording | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | visible text | Choose a useful public reference recording. This saves the selected video to the shared tune record, so other users can use it too. | Choose a useful public reference recording. This saves the selected video to the shared tune record, so other users can use it too. | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | visible text | No YouTube results found. Try a broader search. | No YouTube results found. Try a broader search. | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | visible text | Search YouTube | Search YouTube | needs runtime verification |
| /library / tune detail | components/reference-media/FindReferenceModal.tsx | visible text | Searching... | Searching... | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Add media link | Add media link | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Remove preferred | Remove preferred | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | button/link label | Set preferred | Set preferred | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | conditional visible text | Preferred | Preferred | needs runtime verification; conditional copy |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | eyebrow prop | Reference media | Reference media | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | title/heading prop | Choose reference | Choose reference | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | visible text | Choose reference | Choose reference | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | visible text | Make this my preferred reference | Make this my preferred reference | needs runtime verification |
| /library / tune detail | components/reference-media/PreferredReferenceControl.tsx | visible text | No reference media has been saved for this tune yet. | No reference media has been saved for this tune yet. | needs runtime verification |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | button/link label | Use this | Use this | needs runtime verification |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | conditional visible text | Hide preview | Hide preview | needs runtime verification; conditional copy |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | conditional visible text | Preview | Preview | needs runtime verification; conditional copy |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | conditional visible text | Preview {result.title} | Preview {result.title} | needs runtime verification; conditional copy |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | returned status/helper text | accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share | accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share | needs runtime verification; conditional/status path |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | visible text | Make preferred | Make preferred | needs runtime verification |
| /library / tune detail | components/reference-media/YouTubeSearchResultList.tsx | visible text | No results yet. Search for the tune title, player, source, style, or recording you want to use. | No results yet. Search for the tune title, player, source, style, or recording you want to use. | needs runtime verification |
| /library / tune detail | lib/actions/media-links.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/media-links.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-comments.ts | returned status/helper text | {cleaned.slice(0, 180).trim()}… | {cleaned.slice(0, 180).trim()}… | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-comments.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-comments.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-edit-requests.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-edit-requests.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-lore.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/piece-lore.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/reference-media.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/reference-media.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/user-piece-metadata.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/user-piece-metadata.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/actions/user-pieces.ts | returned status/helper text | {nextUrl}#{hash} | {nextUrl}#{hash} | needs runtime verification; conditional/status path |
| /library / tune detail | lib/page-options/configs/library.ts | config heading/name | Tunes Page Options | Tunes Page Options | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Choose how the tune catalogue page is arranged. | Choose how the tune catalogue page is arranged. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Create tune, bulk import, and other catalogue actions. | Create tune, bulk import, and other catalogue actions. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Feedback after creating, importing, deleting, or updating tunes. | Feedback after creating, importing, deleting, or updating tunes. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Prioritises actions, feedback, and full result controls. | Prioritises actions, feedback, and full result controls. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Repeated result count and pagination controls below the tune list. | Repeated result count and pagination controls below the tune list. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Result count and pagination summary above the tune list. | Result count and pagination summary above the tune list. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Shows actions, filters, result summaries, and tune results. | Shows actions, filters, result summaries, and tune results. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | Shows filters and tune results with less surrounding chrome. | Shows filters and tune results with less surrounding chrome. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config helper text | The catalogue tune cards. | The catalogue tune cards. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Bottom results header | Bottom results header | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Catalogue | Catalogue | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Filters | Filters | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Header actions | Header actions | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Management | Management | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Top results header | Top results header | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/library.ts | config/action label | Tune results | Tune results | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config heading/name | Tune Page Options | Tune Page Options | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Choose which sections appear on tune detail pages. | Choose which sections appear on tune detail pages. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Community discussion for this tune. | Community discussion for this tune. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Community tune lore, source notes, alternate titles, and history. | Community tune lore, source notes, alternate titles, and history. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Dated notes from your Practice Diary for this tune. | Dated notes from your Practice Diary for this tune. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Formal review for tunes already in practice, or diary-only checks for other tunes. | Formal review for tunes already in practice, or diary-only checks for other tunes. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Prioritises canonical details, media, sheet music, and lore. | Prioritises canonical details, media, sheet music, and lore. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Prioritises lore, comments, media links, and public tune context. | Prioritises lore, comments, media links, and public tune context. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Prioritises tune state, review, notes, and practice history. | Prioritises tune state, review, notes, and practice history. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Reference recordings and other tune-linked media. | Reference recordings and other tune-linked media. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Shared tune metadata such as key, style, time signature, and reference URL. | Shared tune metadata such as key, style, time signature, and reference URL. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Sheet music, tab, and chart links. | Sheet music, tab, and chart links. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Shows only the main tune state and canonical tune details. | Shows only the main tune state and canonical tune details. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Shows practice state, review, notes, media, lore, and comments. | Shows practice state, review, notes, media, lore, and comments. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config helper text | Your stable private notes for this tune. | Your stable private notes for this tune. | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Canonical details | Canonical details | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Comments | Comments | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Community View | Community View | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Lore | Lore | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Media links | Media links | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | My notes | My notes | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Practice First | Practice First | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Practice history | Practice history | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Reference View | Reference View | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Review / practice check | Review / practice check | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Sheet music / tab | Sheet music / tab | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Tune state | Tune state | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/page-options/configs/tune-detail.ts | config/action label | Working View | Working View | needs runtime verification; derived from constant/config |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Add a title and URL for the media link. | Add a title and URL for the media link. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Add at least one proposed change. | Add at least one proposed change. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Additional media link removed. | Additional media link removed. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Additional media link saved. | Additional media link saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Canonical tune details updated. | Canonical tune details updated. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose a list before adding the tune. | Choose a list before adding the tune. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose a lore report reason. | Choose a lore report reason. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose a report reason. | Choose a report reason. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose a valid lore category. | Choose a valid lore category. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose one of your active practice note categories. | Choose one of your active practice note categories. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Choose Rough, Shaky, or Solid. | Choose Rough, Shaky, or Solid. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Comment report submitted. | Comment report submitted. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not add tune to list. | Could not add tune to list. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not attach that note to the selected practice item. | Could not attach that note to the selected practice item. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not find that media link. | Could not find that media link. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not find that saved loop. | Could not find that saved loop. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not find that tune. | Could not find that tune. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not save canonical details. | Could not save canonical details. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not save loop: choose a valid start and end point. | Could not save loop: choose a valid start and end point. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not save loop: missing label or video. | Could not save loop: missing label or video. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not save reference recording. | Could not save reference recording. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not save tune page options. | Could not save tune page options. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not submit comment report. | Could not submit comment report. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not submit edit request. | Could not submit edit request. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not submit lore report. | Could not submit lore report. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not update loop. | Could not update loop. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not update lore entry. | Could not update lore entry. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not update media links. | Could not update media links. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Could not update preferred reference. | Could not update preferred reference. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Edit request submitted. | Edit request submitted. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Enable Practice Diary before logging tune practice checks. | Enable Practice Diary before logging tune practice checks. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Enter a valid reference URL. | Enter a valid reference URL. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Loop deleted. | Loop deleted. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Loop saved. | Loop saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Lore entry text is required. | Lore entry text is required. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Lore entry updated. | Lore entry updated. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Lore report submitted. | Lore report submitted. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Practice check saved. | Practice check saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Practice note deleted. | Practice note deleted. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Practice note saved. | Practice note saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Preferred reference removed. This tune will use the default reference again. | Preferred reference removed. This tune will use the default reference again. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Preferred reference saved. | Preferred reference saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Preferred references must be YouTube links for now. | Preferred references must be YouTube links for now. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Reference recording saved. | Reference recording saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Reference recordings currently need to be YouTube links. | Reference recordings currently need to be YouTube links. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That comment is already hidden. | That comment is already hidden. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That key is not valid. | That key is not valid. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That linked composer profile could not be found. | That linked composer profile could not be found. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That lore entry could not be found. | That lore entry could not be found. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That media link URL is not valid. | That media link URL is not valid. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | That reference URL is not valid. | That reference URL is not valid. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | This tune already has a primary reference recording. | This tune already has a primary reference recording. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | This tune is already in the selected list. | This tune is already in the selected list. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Title is required. | Title is required. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Tune added to list. | Tune added to list. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Tune added to new lists. It was already in at least one selected list. | Tune added to new lists. It was already in at least one selected list. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Tune page options reset. | Tune page options reset. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Tune page options saved. | Tune page options saved. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | Write a note before saving. | Write a note before saving. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | You cannot report your own comment. | You cannot report your own comment. | needs runtime verification; conditional/status path |
| /library / tune detail | lib/tune-detail-status.ts | returned status/helper text | You cannot report your own lore entry. | You cannot report your own lore entry. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | button/link label | Approve request | Approve request | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Approving... | Approving... | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Dismiss report | Dismiss report | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Dismissing... | Dismissing... | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Hide comment | Hide comment | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Hiding... | Hiding... | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Mark actioned | Mark actioned | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Reject request | Reject request | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Rejecting... | Rejecting... | needs runtime verification |
| /moderator | app/moderator/page.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /moderator | app/moderator/page.tsx | form placeholder | Optional moderation note | Optional moderation note | needs runtime verification |
| /moderator | app/moderator/page.tsx | form placeholder | Optional moderator comment | Optional moderator comment | needs runtime verification |
| /moderator | app/moderator/page.tsx | form placeholder | Reason for rejection | Reason for rejection | needs runtime verification |
| /moderator | app/moderator/page.tsx | form placeholder | What action did you take? | What action did you take? | needs runtime verification |
| /moderator | app/moderator/page.tsx | form placeholder | Why are you dismissing this report? | Why are you dismissing this report? | needs runtime verification |
| /moderator | app/moderator/page.tsx | returned status/helper text | Comment hidden. | Comment hidden. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Comment report dismissed. | Comment report dismissed. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Could not save Moderator page options. | Could not save Moderator page options. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Could not tell which comment to update. | Could not tell which comment to update. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Could not tell which lore report to update. | Could not tell which lore report to update. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Could not tell which report to update. | Could not tell which report to update. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Could not tell which request to update. | Could not tell which request to update. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Lore report dismissed. | Lore report dismissed. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Lore report marked actioned. | Lore report marked actioned. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Moderator page options reset. | Moderator page options reset. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Moderator page options saved. | Moderator page options saved. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | One of the proposed keys was invalid. | One of the proposed keys was invalid. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | One of the proposed URLs was invalid. | One of the proposed URLs was invalid. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Something went wrong. Please try again. | Something went wrong. Please try again. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | That comment could not be found. | That comment could not be found. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | That request could not be found. | That request could not be found. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | That tune could not be found. | That tune could not be found. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Tune edit request approved. | Tune edit request approved. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | returned status/helper text | Tune edit request rejected. | Tune edit request rejected. | needs runtime verification; conditional/status path |
| /moderator | app/moderator/page.tsx | visible text | . Comment by | . Comment by | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | . Lore added by | . Lore added by | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Comment reports | Comment reports | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Lore reports | Lore reports | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Moderator | Moderator | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | No pending comment reports. | No pending comment reports. | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | No pending lore reports. | No pending lore reports. | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | No pending tune edit requests. | No pending tune edit requests. | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Open tune to edit lore | Open tune to edit lore | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Pending | Pending | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Pending comment reports | Pending comment reports | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Pending lore reports | Pending lore reports | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Pending tune edit requests | Pending tune edit requests | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Reason | Reason | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Report details | Report details | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Reported by | Reported by | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Reported comment | Reported comment | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Reported lore entry | Reported lore entry | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Requested by | Requested by | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Review proposed corrections to canonical tune details, handle reported comments, and judge reported lore entries. | Review proposed corrections to canonical tune details, handle reported comments, and judge reported lore entries. | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Tune edit requests | Tune edit requests | needs runtime verification |
| /moderator | app/moderator/page.tsx | visible text | Tune edits, comment reports, and lore reports | Tune edits, comment reports, and lore reports | needs runtime verification |
| /moderator | lib/actions/moderation.ts | returned status/helper text | {outcome} Moderator note: {comment} | {outcome} Moderator note: {comment} | needs runtime verification; conditional/status path |
| /moderator | lib/actions/moderation.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /moderator | lib/actions/moderation.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /moderator | lib/page-options/configs/moderator.ts | config heading/name | Moderator Page Options | Moderator Page Options | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Canonical tune edit requests awaiting review. | Canonical tune edit requests awaiting review. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Choose how the moderator workspace is arranged. | Choose how the moderator workspace is arranged. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Counts for pending edit requests, comment reports, and lore reports. | Counts for pending edit requests, comment reports, and lore reports. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Prioritises canonical tune edit requests. | Prioritises canonical tune edit requests. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Prioritises comment and lore reports. | Prioritises comment and lore reports. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Reported comments awaiting moderation. | Reported comments awaiting moderation. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Reported lore entries awaiting moderation. | Reported lore entries awaiting moderation. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Shows summary counts and the main review queues. | Shows summary counts and the main review queues. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config helper text | Shows summary counts, tune edit requests, comment reports, and lore reports. | Shows summary counts, tune edit requests, comment reports, and lore reports. | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Comment reports | Comment reports | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Lore reports | Lore reports | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Reports | Reports | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Summary counts | Summary counts | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Triage | Triage | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Tune edit requests | Tune edit requests | needs runtime verification; derived from constant/config |
| /moderator | lib/page-options/configs/moderator.ts | config/action label | Tune edits | Tune edits | needs runtime verification; derived from constant/config |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Bookmark list | Bookmark list | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Bookmarking... | Bookmarking... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Copy list | Copy list | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Copy selected tunes | Copy selected tunes | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Copying... | Copying... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Mark as known | Mark as known | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Remove bookmark | Remove bookmark | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | conditional visible text | a new private list. | a new private list. | needs runtime verification; conditional copy |
| /public-lists | app/public-lists/[id]/page.tsx | conditional visible text | currentColor | currentColor | needs runtime verification; conditional copy |
| /public-lists | app/public-lists/[id]/page.tsx | conditional visible text | Select {piece.title} to copy | Select {piece.title} to copy | needs runtime verification; conditional copy |
| /public-lists | app/public-lists/[id]/page.tsx | returned status/helper text | desktop-select-piece-{piece.id} | desktop-select-piece-{piece.id} | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/[id]/page.tsx | returned status/helper text | Key: {piece.key} | Key: {piece.key} | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/[id]/page.tsx | returned status/helper text | M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z | M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/[id]/page.tsx | returned status/helper text | Style: {piece.style} | Style: {piece.style} | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/[id]/page.tsx | returned status/helper text | Time: {piece.time_signature} | Time: {piece.time_signature} | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/[id]/page.tsx | title/heading prop | Bookmark list | Bookmark list | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | title/heading prop | Remove bookmark | Remove bookmark | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Add selected tunes to | Add selected tunes to | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | All selected tunes were already in that list. | All selected tunes were already in that list. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Already in practice | Already in practice | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Back to Public Lists | Back to Public Lists | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Bookmark and copy | Bookmark and copy | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Bookmark list | Bookmark list | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Bookmark table missing. Run the bookmark migration. | Bookmark table missing. Run the bookmark migration. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Bookmarked this shared list as a saved reference. | Bookmarked this shared list as a saved reference. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Bookmarking... | Bookmarking... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | By | By | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Choose one of your lists | Choose one of your lists | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Choose one of your lists before copying selected tunes. | Choose one of your lists before copying selected tunes. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Copied | Copied | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Copied the full list into | Copied the full list into | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Copy list to my lists | Copy list to my lists | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Copy selected tunes | Copy selected tunes | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Copying creates your own editable version. It will not affect the original shared list, start practice, or mark tunes as known. | Copying creates your own editable version. It will not affect the original shared list, start practice, or mark tunes as known. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Could not complete that copy. | Could not complete that copy. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Could not update that bookmark. | Could not update that bookmark. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Create a list first, then come back to copy selected tunes. | Create a list first, then come back to copy selected tunes. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Known | Known | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Log in to bookmark this shared list as a reference, copy tunes into your own lists, start practice, or mark tunes as known. | Log in to bookmark this shared list as a reference, copy tunes into your own lists, start practice, or mark tunes as known. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Log in to start practice or mark known. | Log in to start practice or mark known. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | More actions | More actions | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Open editable list | Open editable list | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Remove bookmark | Remove bookmark | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Removed this shared list from your bookmarks. | Removed this shared list from your bookmarks. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Removing... | Removing... | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Select at least one tune to copy. | Select at least one tune to copy. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | selected tune | selected tune | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Shared lists are discovery objects. Bookmark useful lists as saved references, or copy tunes into your own editable lists when you want to organise them privately. | Shared lists are discovery objects. Bookmark useful lists as saved references, or copy tunes into your own editable lists when you want to organise them privately. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Skipped | Skipped | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | That public list could not be found. | That public list could not be found. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | That shared list could not be found. | That shared list could not be found. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | This list has no tunes yet. | This list has no tunes yet. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | This shared list is already bookmarked. | This shared list is already bookmarked. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Tunes | Tunes | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Unknown user | Unknown user | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Your own public lists stay editable from Lists and do not need bookmarking. | Your own public lists stay editable from Lists and do not need bookmarking. | needs runtime verification |
| /public-lists | app/public-lists/[id]/page.tsx | visible text | Your public list | Your public list | needs runtime verification |
| /public-lists | app/public-lists/loading.tsx | button/link label | Shared | Shared | needs runtime verification |
| /public-lists | app/public-lists/loading.tsx | helper/description prop | Finding public tune lists from other users. | Finding public tune lists from other users. | needs runtime verification |
| /public-lists | app/public-lists/loading.tsx | returned status/helper text | Public lists | Public lists | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/loading.tsx | title/heading prop | Loading public lists | Loading public lists | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | helper/description prop | Try clearing the search or filters. | Try clearing the search or filters. | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | returned status/helper text | /public-lists?{params.toString()} | /public-lists?{params.toString()} | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/page.tsx | returned status/helper text | Could not save Public Lists page options. | Could not save Public Lists page options. | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/page.tsx | returned status/helper text | Public Lists page options reset. | Public Lists page options reset. | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/page.tsx | returned status/helper text | Public Lists page options saved. | Public Lists page options saved. | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/page.tsx | returned status/helper text | Reset view | Reset view | needs runtime verification; conditional/status path |
| /public-lists | app/public-lists/page.tsx | title/heading prop | No public lists match this view | No public lists match this view | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | visible text | public list | public list | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | visible text | Public lists | Public lists | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | visible text | Reset view | Reset view | needs runtime verification |
| /public-lists | app/public-lists/page.tsx | visible text | Showing | Showing | needs runtime verification |
| /public-lists | components/shared/PublicListSearchFilters.tsx | config/action label | Alphabetical | Alphabetical | needs runtime verification; derived from constant/config |
| /public-lists | components/shared/PublicListSearchFilters.tsx | config/action label | Most tunes | Most tunes | needs runtime verification; derived from constant/config |
| /public-lists | components/shared/PublicListSearchFilters.tsx | config/action label | Recently added | Recently added | needs runtime verification; derived from constant/config |
| /public-lists | components/shared/PublicListSearchFilters.tsx | config/action label | Style: {style} | Style: {style} | needs runtime verification; derived from constant/config |
| /public-lists | components/shared/PublicListSearchFilters.tsx | helper/description prop | Narrow public lists by tune style or browsing order. | Narrow public lists by tune style or browsing order. | needs runtime verification |
| /public-lists | components/shared/PublicListSearchFilters.tsx | returned status/helper text | Search public lists | Search public lists | needs runtime verification; conditional/status path |
| /public-lists | components/shared/PublicListSearchFilters.tsx | title/heading prop | Filter public lists | Filter public lists | needs runtime verification |
| /public-lists | components/shared/PublicListSearchFilters.tsx | title/heading prop | Sort | Sort | needs runtime verification |
| /public-lists | components/shared/PublicListSearchFilters.tsx | title/heading prop | Style | Style | needs runtime verification |
| /public-lists | components/shared/PublicListSearchFilters.tsx | visible text | No styles available. | No styles available. | needs runtime verification |
| /public-lists | components/shared/SharedListCard.tsx | button/link label | Browse | Browse | needs runtime verification |
| /public-lists | components/shared/SharedListCard.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /public-lists | components/shared/SharedListCard.tsx | conditional visible text | Open public list {list.name} | Open public list {list.name} | needs runtime verification; conditional copy |
| /public-lists | components/shared/SharedListCard.tsx | visible text | By | By | needs runtime verification |
| /public-lists | components/shared/SharedListCard.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /public-lists | components/shared/SharedListCard.tsx | visible text | Your public list | Your public list | needs runtime verification |
| /public-lists | components/shared/SharedListsEmptyState.tsx | visible text | No public lists yet. | No public lists yet. | needs runtime verification |
| /public-lists | components/shared/SharedListsEmptyState.tsx | visible text | Public lists | Public lists | needs runtime verification |
| /public-lists | components/shared/SharedListsErrorState.tsx | visible text | Could not load public lists. | Could not load public lists. | needs runtime verification |
| /public-lists | components/shared/SharedListsErrorState.tsx | visible text | Public Lists | Public Lists | needs runtime verification |
| /public-lists | components/shared/SharedListsHeader.tsx | visible text | Browse public tune lists from other users, bookmark useful references, or copy tunes into your own editable lists. | Browse public tune lists from other users, bookmark useful references, or copy tunes into your own editable lists. | needs runtime verification |
| /public-lists | components/shared/SharedListsHeader.tsx | visible text | Public Lists | Public Lists | needs runtime verification |
| /public-lists | components/shared/SharedListsMobileList.tsx | button/link label |  | Open | mobile-only |
| /public-lists | components/shared/SharedListsMobileList.tsx | button/link label |  | Opening... | mobile-only |
| /public-lists | components/shared/SharedListsMobileList.tsx | returned status/helper text |  | {count} tune{count === 1 ? "" : "s"} | mobile-only; conditional/status path |
| /public-lists | components/shared/SharedListsMobileList.tsx | visible text |  | By | mobile-only |
| /public-lists | components/shared/SharedListsMobileList.tsx | visible text |  | Public lists | mobile-only |
| /public-lists | components/shared/SharedListsMobileList.tsx | visible text |  | Your public list | mobile-only |
| /repertoire | app/repertoire/page.tsx | form placeholder | Description | Description | needs runtime verification |
| /repertoire | app/repertoire/page.tsx | form placeholder | List name | List name | needs runtime verification |
| /repertoire | app/repertoire/page.tsx | visible text | Create | Create | needs runtime verification |
| /repertoire | app/repertoire/page.tsx | visible text | Create List | Create List | needs runtime verification |
| /repertoire | app/repertoire/page.tsx | visible text | Logged in as | Logged in as | needs runtime verification |
| /repertoire | app/repertoire/page.tsx | visible text | Manage Library | Manage Library | needs runtime verification |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | conditional visible text | No known tunes yet. | No known tunes yet. | needs runtime verification; conditional copy |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | conditional visible text | No tunes in practice yet. | No tunes in practice yet. | needs runtime verification; conditional copy |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | conditional visible text | Remove "{piece.title}" from your known tunes, practice, and all your lists? | Remove "{piece.title}" from your known tunes, practice, and all your lists? | needs runtime verification; conditional copy |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | returned status/helper text | No due date | No due date | needs runtime verification; conditional/status path |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | visible text | Add to List | Add to List | needs runtime verification |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | visible text | Due | Due | needs runtime verification |
| /repertoire | components/repertoire/RepertoireTuneList.tsx | visible text | Stage | Stage | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | returned status/helper text | {value}T12:00:00 | {value}T12:00:00 | needs runtime verification; conditional/status path |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | Back to diary | Back to diary | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | No notes have been tagged with this category yet. | No notes have been tagged with this category yet. | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | Notes in this category | Notes in this category | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | Practice category | Practice category | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | Practice notes you have tagged with this category. | Practice notes you have tagged with this category. | needs runtime verification |
| /review / practice | app/review/diary/categories/[id]/page.tsx | visible text | Untitled note | Untitled note | needs runtime verification |
| /review / practice | app/review/diary/index/categories/[id]/page.tsx | conditional visible text | A focused view of notes and tunes linked to this practice category. | A focused view of notes and tunes linked to this practice category. | needs runtime verification; conditional copy |
| /review / practice | app/review/diary/index/categories/[id]/page.tsx | visible text | Back to index | Back to index | needs runtime verification |
| /review / practice | app/review/diary/index/categories/[id]/page.tsx | visible text | Practice category | Practice category | needs runtime verification |
| /review / practice | app/review/diary/index/page.tsx | visible text | Practice | Practice | needs runtime verification |
| /review / practice | app/review/diary/index/page.tsx | visible text | Practice index | Practice index | needs runtime verification |
| /review / practice | app/review/diary/index/page.tsx | visible text | Search across foci, note categories, and recent practice notes without digging through the diary day by day. | Search across foci, note categories, and recent practice notes without digging through the diary day by day. | needs runtime verification |
| /review / practice | app/review/diary/page.tsx | returned status/helper text | Daily notebook, reflection, due tunes, and tune notes. | Daily notebook, reflection, due tunes, and tune notes. | needs runtime verification; conditional/status path |
| /review / practice | app/review/diary/page.tsx | returned status/helper text | Monthly habit and coverage summary. | Monthly habit and coverage summary. | needs runtime verification; conditional/status path |
| /review / practice | app/review/diary/page.tsx | returned status/helper text | Weekly patterns, tunes touched, and category activity. | Weekly patterns, tunes touched, and category activity. | needs runtime verification; conditional/status path |
| /review / practice | app/review/diary/page.tsx | visible text | Practice | Practice | needs runtime verification |
| /review / practice | app/review/diary/page.tsx | visible text | Practice diary | Practice diary | needs runtime verification |
| /review / practice | app/review/foci/[id]/page.tsx | conditional visible text | Use this focus to group related known and active-practice tunes. | Use this focus to group related known and active-practice tunes. | needs runtime verification; conditional copy |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Add a title before saving this focus. | Add a title before saving this focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Choose a tune first. | Choose a tune first. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Could not find that focus. | Could not find that focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Could not find that tune link. | Could not find that tune link. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Only active foci can be changed. | Only active foci can be changed. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Only tunes in your known repertoire or active practice can be added to a focus. | Only tunes in your known repertoire or active practice can be added to a focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Practice focus archived. | Practice focus archived. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Practice focus updated. | Practice focus updated. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | That focus could not be found. | That focus could not be found. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Tune added to focus. | Tune added to focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | returned status/helper text | Tune removed from focus. | Tune removed from focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/[id]/page.tsx | visible text | Back to foci | Back to foci | needs runtime verification |
| /review / practice | app/review/foci/[id]/page.tsx | visible text | Practice focus | Practice focus | needs runtime verification |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Add a title before creating a focus. | Add a title before creating a focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Choose a tune first. | Choose a tune first. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Could not find that focus. | Could not find that focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Could not find that tune link. | Could not find that tune link. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Only active foci can be changed. | Only active foci can be changed. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Only active-practice tunes can be added to a focus. | Only active-practice tunes can be added to a focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Practice focus archived. | Practice focus archived. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Practice focus created. | Practice focus created. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Practice focus deleted. | Practice focus deleted. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Practice focus updated. | Practice focus updated. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | That focus could not be found. | That focus could not be found. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Tune added to focus. | Tune added to focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | returned status/helper text | Tune removed from focus. | Tune removed from focus. | needs runtime verification; conditional/status path |
| /review / practice | app/review/foci/page.tsx | visible text | Broader musical projects for the tunes you are actively practising. | Broader musical projects for the tunes you are actively practising. | needs runtime verification |
| /review / practice | app/review/foci/page.tsx | visible text | Group active-practice tunes around broader musical projects, without changing Stage, due dates, streaks, or diary history. | Group active-practice tunes around broader musical projects, without changing Stage, due dates, streaks, or diary history. | needs runtime verification |
| /review / practice | app/review/foci/page.tsx | visible text | Practice | Practice | needs runtime verification |
| /review / practice | app/review/foci/page.tsx | visible text | Practice foci | Practice foci | needs runtime verification |
| /review / practice | app/review/loading.tsx | button/link label | Practice | Practice | needs runtime verification |
| /review / practice | app/review/loading.tsx | helper/description prop | Checking due tunes, catch-up work, active practice items, and streak state. | Checking due tunes, catch-up work, active practice items, and streak state. | needs runtime verification |
| /review / practice | app/review/loading.tsx | returned status/helper text | Due next | Due next | needs runtime verification; conditional/status path |
| /review / practice | app/review/loading.tsx | returned status/helper text | Practice state | Practice state | needs runtime verification; conditional/status path |
| /review / practice | app/review/loading.tsx | title/heading prop | Loading today’s practice | Loading today’s practice | needs runtime verification |
| /review / practice | app/review/page.tsx | button/link label | Catch-up | Catch-up | needs runtime verification |
| /review / practice | app/review/page.tsx | button/link label | Due today | Due today | needs runtime verification |
| /review / practice | app/review/page.tsx | conditional visible text | catch-up | catch-up | needs runtime verification; conditional copy |
| /review / practice | app/review/page.tsx | conditional visible text | due-today | due-today | needs runtime verification; conditional copy |
| /review / practice | app/review/page.tsx | returned status/helper text | Could not save Practice page options. | Could not save Practice page options. | needs runtime verification; conditional/status path |
| /review / practice | app/review/page.tsx | returned status/helper text | Practice page options reset. | Practice page options reset. | needs runtime verification; conditional/status path |
| /review / practice | app/review/page.tsx | returned status/helper text | Practice page options saved. | Practice page options saved. | needs runtime verification; conditional/status path |
| /review / practice | app/review/page.tsx | visible text | Practice | Practice | needs runtime verification |
| /review / practice | app/review/page.tsx | visible text | Review tunes and rate recall. | Review tunes and rate recall. | needs runtime verification |
| /review / practice | app/review/page.tsx | visible text | Review your tunes | Review your tunes | needs runtime verification |
| /review / practice | components/practice-diary/DailyReflectionForm.tsx | button/link label | Save reflection | Save reflection | needs runtime verification |
| /review / practice | components/practice-diary/DailyReflectionForm.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /review / practice | components/practice-diary/DailyReflectionForm.tsx | form placeholder | What happened in practice overall today? | What happened in practice overall today? | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | config/action label | Latest | Latest | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | config/action label | Notes | Notes | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | config/action label | Tunes | Tunes | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | returned status/helper text | No notes yet | No notes yet | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | · latest | · latest | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | Category map | Category map | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | No notes have been saved to this category yet. | No notes have been saved to this category yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | No tune-linked notes in this category yet. | No tune-linked notes in this category yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | Notes | Notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | Tune | Tune | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryDetail.tsx | visible text | Tunes in this category | Tunes in this category | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Add category | Add category | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Archive | Archive | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Archiving... | Archiving... | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Create starter categories | Create starter categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | form placeholder | Tone | Tone | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | form placeholder | What changed about the sound today? | What changed about the sound today? | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | Add category | Add category | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | Category name | Category name | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | Current categories | Current categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | No prompt yet. | No prompt yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | Prompt | Prompt | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManager.tsx | visible text | You do not have any active practice categories yet. | You do not have any active practice categories yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManagerModal.tsx | eyebrow prop | Practice diary | Practice diary | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManagerModal.tsx | title/heading prop | Manage categories | Manage categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManagerModal.tsx | visible text | Manage categories | Manage categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManagerModal.tsx | visible text | Manage note categories for tempo, form, technique, variations, or any other practice lens. | Manage note categories for tempo, form, technique, variations, or any other practice lens. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategoryManagerModal.tsx | visible text | Practice categories | Practice categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | conditional visible text | Open {summary.categoryName} category | Open {summary.categoryName} category | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | conditional visible text | Read less | Read less | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | conditional visible text | Read more | Read more | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | visible text | General note | General note | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | visible text | Show | Show | needs runtime verification |
| /review / practice | components/practice-diary/PracticeCategorySummaryList.tsx | visible text | Show less | Show less | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | returned status/helper text | {year}-{String(month).padStart(2, "0")}-{String(day).padStart( 2, "0" )} | {year}-{String(month).padStart(2, "0")}-{String(day).padStart( 2, "0" )} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Next | Next | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Open calendar | Open calendar | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Practice Day | Practice Day | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Previous | Previous | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Show this month | Show this month | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayCalendarPicker.tsx | visible text | Today | Today | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayNavigator.tsx | visible text | Next day | Next day | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayNavigator.tsx | visible text | Previous day | Previous day | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayNavigator.tsx | visible text | Today | Today | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayView.tsx | emptyMessage prop | No active-practice tunes are currently due on this day. | No active-practice tunes are currently due on this day. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayView.tsx | visible text | Due on this day | Due on this day | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayView.tsx | visible text | Session summary | Session summary | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayView.tsx | visible text | Tunes scheduled for review on this date. | Tunes scheduled for review on this date. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDayView.tsx | visible text | Write one overall reflection for the day: energy, patterns, problems, breakthroughs, or what you want to remember next time. | Write one overall reflection for the day: energy, patterns, problems, breakthroughs, or what you want to remember next time. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | accessibility label | Practice index views | Practice index views | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | button/link label | Practice foci | Practice foci | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | button/link label | Practice notes | Practice notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | conditional visible text | {latestNote.piece.title}: | {latestNote.piece.title}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | conditional visible text | {note.piece.title} · | {note.piece.title} · | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | conditional visible text | +{focus.tuneTitles.length - 6} more | +{focus.tuneTitles.length - 6} more | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | config heading/name | Foci | Foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | config heading/name | Notes | Notes | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | config/action label | Foci | Foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | config/action label | Notes | Notes | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | Daily reflection | Daily reflection | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | General note | General note | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | No notes yet | No notes yet | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | Review note | Review note | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | returned status/helper text | Tune note | Tune note | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | · last touched | · last touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | ”, but the search appears elsewhere in the practice index. | ”, but the search appears elsewhere in the practice index. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Foci | Foci | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Focus: | Focus: | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Found elsewhere | Found elsewhere | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Latest note: | Latest note: | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | No diary notes have been indexed yet. Review tunes, add tune notes, or write daily reflections to build this view. | No diary notes have been indexed yet. Review tunes, add tune notes, or write daily reflections to build this view. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | No foci match “ | No foci match “ | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | No notes match “ | No notes match “ | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | No practice foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | No practice foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Notes | Notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Nothing in the selected view matches “ | Nothing in the selected view matches “ | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Open day | Open day | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Open focus | Open focus | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Open tune | Open tune | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryIndex.tsx | visible text | Tunes: | Tunes: | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryNav.tsx | accessibility label | Practice sections | Practice sections | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryNav.tsx | config/action label | Diary | Diary | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryNav.tsx | config/action label | Foci | Foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryNav.tsx | config/action label | Index | Index | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryNav.tsx | config/action label | Review | Review | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | accessibility label | Practice diary view options | Practice diary view options | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config helper text | Coverage | Coverage | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config helper text | Detailed notes | Detailed notes | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config helper text | Patterns | Patterns | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config/action label | Day | Day | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config/action label | Month | Month | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDiaryViewSwitcher.tsx | config/action label | Week | Week | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-diary/PracticeDueTuneList.tsx | conditional visible text | clamp(1.05rem, 4.6vw, 1.45rem) | clamp(1.05rem, 4.6vw, 1.45rem) | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeDueTuneList.tsx | returned status/helper text | {dueTune.userPieceId}-{dueTune.dueDate} | {dueTune.userPieceId}-{dueTune.dueDate} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDueTuneList.tsx | visible text | Stage | Stage | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDueTuneList.tsx | visible text | Unknown tune | Unknown tune | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDueTuneMiniList.tsx | returned status/helper text | {dueTune.userPieceId}-{dueTune.dueDate} | {dueTune.userPieceId}-{dueTune.dueDate} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDueTuneMiniList.tsx | returned status/helper text | Unknown tune | Unknown tune | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeDueTuneMiniList.tsx | visible text | Due | Due | needs runtime verification |
| /review / practice | components/practice-diary/PracticeDueTuneMiniList.tsx | visible text | Show less | Show less | needs runtime verification |
| /review / practice | components/practice-diary/PracticeEventList.tsx | conditional visible text | Unknown tune | Unknown tune | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeEventList.tsx | returned status/helper text | Free practice | Free practice | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeEventList.tsx | returned status/helper text | Gig prep | Gig prep | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeEventList.tsx | returned status/helper text | Practice check | Practice check | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeEventList.tsx | returned status/helper text | Setlist prep | Setlist prep | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeEventList.tsx | returned status/helper text | Target work | Target work | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeEventList.tsx | visible text | Diary only | Diary only | needs runtime verification |
| /review / practice | components/practice-diary/PracticeEventList.tsx | visible text | Nothing has been logged for this day yet. Formal reviews and diary-only practice checks will appear here once the Practice Diary is enabled. | Nothing has been logged for this day yet. Formal reviews and diary-only practice checks will appear here once the Practice Diary is enabled. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeEventList.tsx | visible text | Reviewed tunes | Reviewed tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeEventList.tsx | visible text | Stage | Stage | needs runtime verification |
| /review / practice | components/practice-diary/PracticeEventList.tsx | visible text | Tune-specific practice records for this date. | Tune-specific practice records for this date. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeFocusSummaryList.tsx | conditional visible text | {latestNote.tuneTitle}: | {latestNote.tuneTitle}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeFocusSummaryList.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeFocusSummaryList.tsx | visible text | · latest | · latest | needs runtime verification |
| /review / practice | components/practice-diary/PracticeFocusSummaryList.tsx | visible text | Open | Open | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Active days | Active days | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Due tunes | Due tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Foci touched | Foci touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Note categories | Note categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Practice checks | Practice checks | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Reviews | Reviews | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Tune notes | Tune notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | button/link label | Tunes touched | Tunes touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | · {summary.noteCount} {pluralise( summary.noteC} | · {summary.noteCount} {pluralise( summary.noteC} | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | · Stage {summary.latestStage} | · Stage {summary.latestStage} | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | {getDayNumber(day.date)} {getCompactActivityText( day } | {getDayNumber(day.date)} {getCompactActivityText( day } | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | {latestNote.tuneTitle}: | {latestNote.tuneTitle}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | {summary.notes[0].tuneTitle}: | {summary.notes[0].tuneTitle}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Foci | Foci | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Fri | Fri | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Mon | Mon | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Month | Month | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Notes | Notes | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Sat | Sat | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Sun | Sun | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Thu | Thu | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Tue | Tue | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Tunes | Tunes | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | conditional visible text | Wed | Wed | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | emptyMessage prop | No categorised notes this month. | No categorised notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | emptyMessage prop | No focus-linked notes this month. | No focus-linked notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | emptyMessage prop | No tune practice has been logged in this month yet. | No tune practice has been logged in this month yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Days with practice | Days with practice | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Diary-only checks | Diary-only checks | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Formal review events | Formal review events | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Linked this month | Linked this month | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Scheduled this month | Scheduled this month | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Tune-linked notes | Tune-linked notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Unique tunes | Unique tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | helper/description prop | Used this month | Used this month | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | returned status/helper text | {day}-{index} | {day}-{index} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | returned status/helper text | No practice logged | No practice logged | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | returned status/helper text | ring-2 ring-[var(--focus-ring)] | ring-2 ring-[var(--focus-ring)] | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | · latest | · latest | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | A read-only habit and coverage view for the selected month. Use Day view to write, and Week view to inspect shorter-term patterns. | A read-only habit and coverage view for the selected month. Use Day view to write, and Week view to inspect shorter-term patterns. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Active days | Active days | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Activity | Activity | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Current | Current | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Darker days have more logged practice activity. Due tunes are listed on the day they are currently scheduled. | Darker days have more logged practice activity. Due tunes are listed on the day they are currently scheduled. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Foci touched | Foci touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | foci. | foci. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Latest: | Latest: | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Month | Month | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Month at a glance | Month at a glance | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Month summary | Month summary | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Most practised tunes | Most practised tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Next | Next | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | No categorised notes this month. | No categorised notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | No focus-linked notes this month. | No focus-linked notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | No practice logged | No practice logged | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | No tune practice has been logged in this month yet. | No tune practice has been logged in this month yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | No tune practice logged | No tune practice logged | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Note categories | Note categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | note categories. | note categories. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Open | Open | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Practice intentions that received focus-linked notes this month. | Practice intentions that received focus-linked notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Previous | Previous | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Showing | Showing | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | The practice lenses that appeared in notes this month. | The practice lenses that appeared in notes this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Today | Today | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | Tunes with the most logged practice activity this month. | Tunes with the most logged practice activity this month. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeMonthView.tsx | visible text | tunes. | tunes. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeNoteForm.tsx | button/link label | Save note | Save note | needs runtime verification |
| /review / practice | components/practice-diary/PracticeNoteForm.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /review / practice | components/practice-diary/PracticeNoteForm.tsx | visible text | Add note for | Add note for | needs runtime verification |
| /review / practice | components/practice-diary/PracticeNoteForm.tsx | visible text | No category | No category | needs runtime verification |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | conditional visible text | Read less | Read less | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | conditional visible text | Read more | Read more | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | visible text | Latest note | Latest note | needs runtime verification |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | visible text | Show | Show | needs runtime verification |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | visible text | Show less | Show less | needs runtime verification |
| /review / practice | components/practice-diary/PracticeTuneSummaryList.tsx | visible text | Stage | Stage | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Active days | Active days | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Due tunes | Due tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Foci touched | Foci touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Note categories | Note categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Practice checks | Practice checks | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Reviews | Reviews | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Tune notes | Tune notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | button/link label | Tunes touched | Tunes touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | conditional visible text | {latestNote.tuneTitle}: | {latestNote.tuneTitle}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | conditional visible text | {summary.notes[0].tuneTitle}: | {summary.notes[0].tuneTitle}: | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | conditional visible text | + {dueTunesForDay.length - 2} more | + {dueTunesForDay.length - 2} more | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | emptyMessage prop | No categorised notes this week. | No categorised notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | emptyMessage prop | No focus-linked notes this week. | No focus-linked notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | emptyMessage prop | No tune practice has been logged in this week yet. | No tune practice has been logged in this week yet. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Days with practice activity | Days with practice activity | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Diary-only checks | Diary-only checks | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Formal review events | Formal review events | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Linked this week | Linked this week | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Scheduled this week | Scheduled this week | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Tune-linked notes | Tune-linked notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Unique tunes | Unique tunes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | helper/description prop | Used this week | Used this week | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | returned status/helper text | {count} due {count === 1 ? "tune" : "tunes"} | {count} due {count === 1 ? "tune" : "tunes"} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | returned status/helper text | {day}/{month} | {day}/{month} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | returned status/helper text | No practice logged | No practice logged | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | returned status/helper text | Unknown tune | Unknown tune | needs runtime verification; conditional/status path |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | · latest | · latest | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | A read-only pattern view of what happened across the selected week. Use Day view to write session summaries and tune notes. | A read-only pattern view of what happened across the selected week. Use Day view to write session summaries and tune notes. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Active practice intentions that received focus-linked notes this week. | Active practice intentions that received focus-linked notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Activity | Activity | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Click any day to open the detailed day view. Due tunes appear on the day they are currently scheduled. | Click any day to open the detailed day view. Due tunes appear on the day they are currently scheduled. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Current | Current | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Foci | Foci | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Foci touched | Foci touched | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | foci. | foci. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Next | Next | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | No categorised notes this week. | No categorised notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | No focus-linked notes this week. | No focus-linked notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | No practice logged | No practice logged | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | No tune practice logged | No tune practice logged | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Note categories | Note categories | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | note categories. | note categories. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Notes | Notes | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Previous | Previous | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Showing | Showing | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | The practice lenses that showed up in notes this week. | The practice lenses that showed up in notes this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Today | Today | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Tunes touched this week | Tunes touched this week | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Tunes with logged practice activity this week. | Tunes with logged practice activity this week. | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Week | Week | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Week at a glance | Week at a glance | needs runtime verification |
| /review / practice | components/practice-diary/PracticeWeekView.tsx | visible text | Week summary | Week summary | needs runtime verification |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | conditional visible text | Rough | Rough | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | conditional visible text | Shaky | Shaky | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | conditional visible text | Solid | Solid | needs runtime verification; conditional copy |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | visible text | Dated notes from your Practice Diary for this tune. These are separate from the stable private notes above. | Dated notes from your Practice Diary for this tune. These are separate from the stable private notes above. | needs runtime verification |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | visible text | No diary notes for this tune yet. | No diary notes for this tune yet. | needs runtime verification |
| /review / practice | components/practice-diary/TunePracticeHistorySection.tsx | visible text | Practice history | Practice history | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | accessibility label | Choose practice focus | Choose practice focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | accessibility label | Focus actions | Focus actions | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | button/link label | Archive focus | Archive focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | button/link label | Archiving... | Archiving... | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | button/link label | Delete focus | Delete focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | conditional visible text | Close edit | Close edit | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | conditional visible text | Current | Current | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | conditional visible text | Delete "{focus.title}" permanently? This cannot be undone. | Delete "{focus.title}" permanently? This cannot be undone. | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | conditional visible text | Edit focus | Edit focus | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | config heading/name | Active foci | Active foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | config heading/name | Archived foci | Archived foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | config heading/name | Completed foci | Completed foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | config heading/name | Paused foci | Paused foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | returned status/helper text | {tuneLabel} · target {formatDateOnly(focus.target_date)} | {tuneLabel} · target {formatDateOnly(focus.target_date)} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Change focus | Change focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Choose a focus | Choose a focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Close | Close | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Current focus | Current focus | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Focus actions | Focus actions | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Open another focus from your current practice foci. | Open another focus from your current practice foci. | needs runtime verification |
| /review / practice | components/practice-foci/FocusActionMenu.tsx | visible text | Practice foci | Practice foci | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | button/link label | Create focus | Create focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | form placeholder | Tempo security | Tempo security | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | form placeholder | What are you trying to improve over time? | What are you trying to improve over time? | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | returned status/helper text | cursor-pointer list-none | cursor-pointer list-none | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Create a practice focus | Create a practice focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Description | Description | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | New focus | New focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Optional target date | Optional target date | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Show | Show | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Title | Title | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusCreateForm.tsx | visible text | Use foci for broader arcs of work, like right-hand looseness, session tempo, Australian tunes in D, or festival set prep. | Use foci for broader arcs of work, like right-hand looseness, session tempo, Australian tunes in D, or festival set prep. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | button/link label | Save focus | Save focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Description | Description | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Edit focus | Edit focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | No focus-linked notes yet. Add one from a review card by choosing this focus in the practice diary note modal. | No focus-linked notes yet. Add one from a review card by choosing this focus in the practice diary note modal. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Notes saved from review cards or diary entries against this focus. | Notes saved from review cards or diary entries against this focus. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Optional target date | Optional target date | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Recent notes | Recent notes | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Title | Title | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusDetail.tsx | visible text | Tunes in this focus | Tunes in this focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | accessibility label | Choose practice focus | Choose practice focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | conditional visible text | Selected | Selected | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | config heading/name | Active foci | Active foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | config heading/name | Archived foci | Archived foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | config heading/name | Completed foci | Completed foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | config heading/name | Paused foci | Paused foci | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | returned status/helper text | {tuneLabel} · target {targetDate} | {tuneLabel} · target {targetDate} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | status/error message | No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | status/error message | No archived foci. | No archived foci. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | status/error message | No completed foci. | No completed foci. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | status/error message | No paused foci. | No paused foci. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Choose a focus | Choose a focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Choose focus | Choose focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Choose one focus to display here. | Choose one focus to display here. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Close | Close | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | No practice foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | No practice foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | No tunes have been added to this focus yet. | No tunes have been added to this focus yet. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Open focus | Open focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Practice foci | Practice foci | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Select one focus to display on this page. | Select one focus to display on this page. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Selected focus | Selected focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Tunes in this focus | Tunes in this focus | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Unknown tune | Unknown tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusList.tsx | visible text | Your foci | Your foci | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | button/link label | Add | Add | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | button/link label | Add tune | Add tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | button/link label | Remove | Remove | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | conditional visible text | · {tune.style} | · {tune.style} | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | conditional visible text | · Key: {tune.key} | · Key: {tune.key} | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | conditional visible text | Remove {tuneTitle} from this focus | Remove {tuneTitle} from this focus | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | conditional visible text | Tune details unavailable | Tune details unavailable | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | conditional visible text | Untitled tune | Untitled tune | needs runtime verification; conditional copy |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | form placeholder | Search tunes... | Search tunes... | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | In practice | In practice | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Key unknown | Key unknown | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Key: {piece.key} | Key: {piece.key} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | stage {tune.stage} | stage {tune.stage} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Stage {tune.stage} | Stage {tune.stage} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Style unknown | Style unknown | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Style: {piece.style} | Style: {piece.style} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Time unknown | Time unknown | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | returned status/helper text | Time: {piece.time_signature} | Time: {piece.time_signature} | needs runtime verification; conditional/status path |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Add repertoire tune | Add repertoire tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Add tune | Add tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Choose a tune | Choose a tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Choose from | Choose from | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Close | Close | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | from this practice focus only. It will not remove the tune from practice, lists, known tunes, or the library. | from this practice focus only. It will not remove the tune from practice, lists, known tunes, or the library. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Known and practice tunes | Known and practice tunes | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | known or active-practice | known or active-practice | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | No matching known or active-practice tunes. | No matching known or active-practice tunes. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | No more known or active-practice tunes are available for this focus. | No more known or active-practice tunes are available for this focus. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | No tunes added yet. | No tunes added yet. | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Remove from this focus? | Remove from this focus? | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Remove tune | Remove tune | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Search known and practice tunes | Search known and practice tunes | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | This will remove | This will remove | needs runtime verification |
| /review / practice | components/practice-foci/PracticeFocusTuneManager.tsx | visible text | Tune | Tune | needs runtime verification |
| /review / practice | components/practice/ActiveLearningSection.tsx | conditional visible text | , {piece.style} | , {piece.style} | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActiveLearningSection.tsx | conditional visible text | , {piece.time_signature} | , {piece.time_signature} | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActiveLearningSection.tsx | conditional visible text | , key {piece.key} | , key {piece.key} | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActiveLearningSection.tsx | visible text | In Practice | In Practice | needs runtime verification |
| /review / practice | components/practice/ActiveLearningSection.tsx | visible text | No tunes in practice yet. | No tunes in practice yet. | needs runtime verification |
| /review / practice | components/practice/ActivePracticeFoci.tsx | conditional visible text | Hide | Hide | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeFoci.tsx | conditional visible text | Show | Show | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeFoci.tsx | visible text | Active foci | Active foci | needs runtime verification |
| /review / practice | components/practice/ActivePracticeFoci.tsx | visible text | for this tune | for this tune | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | button/link label | Remove from practice | Remove from practice | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | conditional visible text | No due date | No due date | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeSection.tsx | conditional visible text | Overdue | Overdue | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeSection.tsx | conditional visible text | Scheduled | Scheduled | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeSection.tsx | conditional visible text | Unknown | Unknown | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeSection.tsx | conditional visible text | Untitled piece | Untitled piece | needs runtime verification; conditional copy |
| /review / practice | components/practice/ActivePracticeSection.tsx | returned status/helper text | No due date | No due date | needs runtime verification; conditional/status path |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | \| Style: | \| Style: | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | \| Time: | \| Time: | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | Currently in practice ( | Currently in practice ( | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | Due: | Due: | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | Full list of tunes currently in your practice system. | Full list of tunes currently in your practice system. | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | Key: | Key: | needs runtime verification |
| /review / practice | components/practice/ActivePracticeSection.tsx | visible text | No tunes in practice yet. | No tunes in practice yet. | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | button/link label | Create category | Create category | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | conditional visible text | Add | Add | needs runtime verification; conditional copy |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | conditional visible text | Hide | Hide | needs runtime verification; conditional copy |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | form placeholder | Tone | Tone | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | form placeholder | What changed about the sound today? | What changed about the sound today? | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | visible text | Add a practice lens without going back to the diary page. | Add a practice lens without going back to the diary page. | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | visible text | Category name | Category name | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | visible text | Creating a category refreshes the review page. Reopen this tune’s review note and the new category will be available. | Creating a category refreshes the review page. Reopen this tune’s review note and the new category will be available. | needs runtime verification |
| /review / practice | components/practice/AddCategoryInReviewDisclosure.tsx | visible text | Need a new category? | Need a new category? | needs runtime verification |
| /review / practice | components/practice/CatchUpSection.tsx | button/link label | Catch-up review queue | Catch-up review queue | needs runtime verification |
| /review / practice | components/practice/CatchUpSection.tsx | emptyMessage prop | Nothing overdue right now. | Nothing overdue right now. | needs runtime verification |
| /review / practice | components/practice/CatchUpSection.tsx | visible text | Catch up ( | Catch up ( | needs runtime verification |
| /review / practice | components/practice/CatchUpSection.tsx | visible text | Nothing overdue right now. | Nothing overdue right now. | needs runtime verification |
| /review / practice | components/practice/CatchUpSection.tsx | visible text | Overdue tunes that need review. | Overdue tunes that need review. | needs runtime verification |
| /review / practice | components/practice/DueTodaySection.tsx | button/link label | Due today review queue | Due today review queue | needs runtime verification |
| /review / practice | components/practice/DueTodaySection.tsx | returned status/helper text | Due today | Due today | needs runtime verification; conditional/status path |
| /review / practice | components/practice/DueTodaySection.tsx | visible text | Due today | Due today | needs runtime verification |
| /review / practice | components/practice/DueTodaySection.tsx | visible text | due today. Work through one tune at a time. | due today. Work through one tune at a time. | needs runtime verification |
| /review / practice | components/practice/DueTodaySection.tsx | visible text | No tunes due today. | No tunes due today. | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | accessibility label | Beat accent pattern | Beat accent pattern | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | accessibility label | Metronome beat unit | Metronome beat unit | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | accessibility label | Open metronome settings | Open metronome settings | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | button/link label | Beats | Beats | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Beat {beatNumber}, {accentLabels[accent].toLowerCase()} accent | Beat {beatNumber}, {accentLabels[accent].toLowerCase()} accent | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Beat {beatNumber}, {accentLabels[accent].toLowerCase()} accent. Change accent. | Beat {beatNumber}, {accentLabels[accent].toLowerCase()} accent. Change accent. | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Start | Start | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Start metronome | Start metronome | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Stop | Stop | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | conditional visible text | Stop metronome | Stop metronome | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeMetronome.tsx | eyebrow prop | Practice tool | Practice tool | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | {beatNumber}-{accent} | {beatNumber}-{accent} | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Decrease beats | Decrease beats | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Decrease BPM | Decrease BPM | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Increase beats | Increase beats | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Increase BPM | Increase BPM | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | M10 14h4 | M10 14h4 | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | m12 4 4 8 | m12 4 4 8 | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | M6 20 11 4h2l5 16 | M6 20 11 4h2l5 16 | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | M9 20h6 | M9 20h6 | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Metronome beats per bar | Metronome beats per bar | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | Metronome BPM | Metronome BPM | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | returned status/helper text | ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-card | ring-2 ring-[var(--focus-ring)] ring-offset-2 ring-offset-card | needs runtime verification; conditional/status path |
| /review / practice | components/practice/PracticeMetronome.tsx | title/heading prop | Metronome | Metronome | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Beat | Beat | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Metronome | Metronome | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Practice metronome | Practice metronome | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Settings | Settings | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Tap tempo | Tap tempo | needs runtime verification |
| /review / practice | components/practice/PracticeMetronome.tsx | visible text | Unit | Unit | needs runtime verification |
| /review / practice | components/practice/PracticeProgress.tsx | conditional visible text | {progress}% | {progress}% | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeProgress.tsx | visible text | REVIEW PROGRESS | REVIEW PROGRESS | needs runtime verification |
| /review / practice | components/practice/PracticeReviewCard.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| /review / practice | components/practice/PracticeReviewCard.tsx | conditional visible text | Preferred reference | Preferred reference | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeReviewCard.tsx | conditional visible text | Reference | Reference | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeReviewCard.tsx | conditional visible text | Remove "{title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists. | Remove "{title}" from active practice? This stops review scheduling for this tune, but does not delete the shared tune or remove it from your lists. | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeReviewCard.tsx | conditional visible text | Unknown | Unknown | needs runtime verification; conditional copy |
| /review / practice | components/practice/PracticeReviewCard.tsx | visible text | How did it go? | How did it go? | needs runtime verification |
| /review / practice | components/practice/PracticeReviewCard.tsx | visible text | Key: | Key: | needs runtime verification |
| /review / practice | components/practice/PracticeReviewCard.tsx | visible text | Style: | Style: | needs runtime verification |
| /review / practice | components/practice/PracticeReviewCard.tsx | visible text | Time: | Time: | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not find that saved loop. | Could not find that saved loop. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not find that tune. | Could not find that tune. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not remove tune from practice. | Could not remove tune from practice. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not save loop: choose a valid start and end point. | Could not save loop: choose a valid start and end point. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not save loop: missing label or video. | Could not save loop: missing label or video. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not tell which practice item to remove. | Could not tell which practice item to remove. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not update loop. | Could not update loop. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Could not update preferred reference. | Could not update preferred reference. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Loop deleted. | Loop deleted. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Loop saved. | Loop saved. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Preferred reference saved. | Preferred reference saved. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Preferred references must be YouTube links for now. | Preferred references must be YouTube links for now. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | That does not look like a valid URL. | That does not look like a valid URL. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | That practice item no longer exists. | That practice item no longer exists. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Tune completed its final practice review and moved to known tunes. | Tune completed its final practice review and moved to known tunes. | needs runtime verification |
| /review / practice | components/practice/PracticeStatusMessages.tsx | visible text | Tune removed from practice. | Tune removed from practice. | needs runtime verification |
| /review / practice | components/practice/RecentPracticeNotes.tsx | conditional visible text | Hide | Hide | needs runtime verification; conditional copy |
| /review / practice | components/practice/RecentPracticeNotes.tsx | conditional visible text | Show | Show | needs runtime verification; conditional copy |
| /review / practice | components/practice/RecentPracticeNotes.tsx | returned status/helper text | {day}/{month}/{year} | {day}/{month}/{year} | needs runtime verification; conditional/status path |
| /review / practice | components/practice/RecentPracticeNotes.tsx | visible text | for this tune | for this tune | needs runtime verification |
| /review / practice | components/practice/RecentPracticeNotes.tsx | visible text | recent note | recent note | needs runtime verification |
| /review / practice | components/practice/RecentPracticeNotes.tsx | visible text | Recent notes | Recent notes | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | conditional visible text | (already linked) | (already linked) | needs runtime verification; conditional copy |
| /review / practice | components/practice/ReviewNoteModal.tsx | conditional visible text | Add an optional note for {title}. Saving will also record the {selectedOutcome.label.toLowerCase()} review result. | Add an optional note for {title}. Saving will also record the {selectedOutcome.label.toLowerCase()} review result. | needs runtime verification; conditional copy |
| /review / practice | components/practice/ReviewNoteModal.tsx | conditional visible text | Save {selectedOutcome.label} | Save {selectedOutcome.label} | needs runtime verification; conditional copy |
| /review / practice | components/practice/ReviewNoteModal.tsx | eyebrow prop | Practice diary | Practice diary | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | form placeholder | What happened with this tune today? | What happened with this tune today? | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | Also add this tune to the selected focus from now on. | Also add this tune to the selected focus from now on. | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | Category | Category | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | Focus | Focus | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | No category | No category | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | No focus | No focus | needs runtime verification |
| /review / practice | components/practice/ReviewNoteModal.tsx | visible text | Optional note | Optional note | needs runtime verification |
| /review / practice | components/practice/ReviewOutcomeButtons.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /review / practice | components/practice/ReviewOutcomeButtons.tsx | returned status/helper text | left-1/2 -translate-x-1/2 | left-1/2 -translate-x-1/2 | needs runtime verification; conditional/status path |
| /review / practice | components/practice/reviewOutcomeConfig.ts | config/action label | Rough | Rough | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/reviewOutcomeConfig.ts | config/action label | Shaky | Shaky | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/reviewOutcomeConfig.ts | config/action label | Solid | Solid | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/reviewOutcomeConfig.ts | tooltip config | Use Rough when you could not recall the tune reliably. It comes back sooner. | Use Rough when you could not recall the tune reliably. It comes back sooner. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/reviewOutcomeConfig.ts | tooltip config | Use Shaky when you got through it, but it felt uncertain. It repeats the current Stage. | Use Shaky when you got through it, but it felt uncertain. It repeats the current Stage. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/reviewOutcomeConfig.ts | tooltip config | Use Solid when recall felt clean and confident. It moves forward to the next Stage. | Use Solid when recall felt clean and confident. It moves forward to the next Stage. | needs runtime verification; derived from constant/config |
| /review / practice | components/practice/StreakSummarySection.tsx | button/link label | Practice | Practice | needs runtime verification |
| /review / practice | components/practice/StreakSummarySection.tsx | button/link label | Revision | Revision | needs runtime verification |
| /review / practice | components/practice/StreakSummarySection.tsx | returned status/helper text | Cleared all due tunes | Cleared all due tunes | needs runtime verification; conditional/status path |
| /review / practice | components/practice/StreakSummarySection.tsx | returned status/helper text | Did any qualifying practice activity | Did any qualifying practice activity | needs runtime verification; conditional/status path |
| /review / practice | components/practice/StreakSummarySection.tsx | visible text | Best | Best | needs runtime verification |
| /review / practice | components/practice/StreakSummarySection.tsx | visible text | Streaks | Streaks | needs runtime verification |
| /review / practice | lib/actions/practice-diary.ts | config heading/name | Form | Form | needs runtime verification; derived from constant/config |
| /review / practice | lib/actions/practice-diary.ts | config heading/name | Harmony | Harmony | needs runtime verification; derived from constant/config |
| /review / practice | lib/actions/practice-diary.ts | config heading/name | Technique | Technique | needs runtime verification; derived from constant/config |
| /review / practice | lib/actions/practice-diary.ts | config heading/name | Tempo | Tempo | needs runtime verification; derived from constant/config |
| /review / practice | lib/actions/practice-diary.ts | config heading/name | Variations | Variations | needs runtime verification; derived from constant/config |
| /review / practice | lib/actions/practice-diary.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /review / practice | lib/actions/practice-diary.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /review / practice | lib/actions/practice-foci.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /review / practice | lib/actions/practice-foci.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /review / practice | lib/actions/reviews.ts | returned status/helper text | {nextUrl}#{hash} | {nextUrl}#{hash} | needs runtime verification; conditional/status path |
| /review / practice | lib/review.ts | returned status/helper text | {year}-{month}-{day} | {year}-{month}-{day} | needs runtime verification; conditional/status path |
| /review / practice | lib/review.ts | returned status/helper text | Due now | Due now | needs runtime verification; conditional/status path |
| /review / practice | lib/review.ts | returned status/helper text | Overdue (longest) | Overdue (longest) | needs runtime verification; conditional/status path |
| /review / practice | lib/review.ts | status/error message | Could not determine app date parts | Could not determine app date parts | needs runtime verification; conditional/status path |
| /setlists | app/setlists/[id]/page.tsx | visible text | Back to Setlists | Back to Setlists | needs runtime verification |
| /setlists | app/setlists/page.tsx | button/link label | Accept | Accept | needs runtime verification |
| /setlists | app/setlists/page.tsx | button/link label | Accepting... | Accepting... | needs runtime verification |
| /setlists | app/setlists/page.tsx | button/link label | Decline | Decline | needs runtime verification |
| /setlists | app/setlists/page.tsx | button/link label | Declining... | Declining... | needs runtime verification |
| /setlists | app/setlists/page.tsx | returned status/helper text | Could not save Setlists page options. | Could not save Setlists page options. | needs runtime verification; conditional/status path |
| /setlists | app/setlists/page.tsx | returned status/helper text | Setlists page options reset. | Setlists page options reset. | needs runtime verification; conditional/status path |
| /setlists | app/setlists/page.tsx | returned status/helper text | Setlists page options saved. | Setlists page options saved. | needs runtime verification; conditional/status path |
| /setlists | app/setlists/page.tsx | visible text | Browse tunes | Browse tunes | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Build shared working setlists for gigs, sessions, jams, and rehearsals. Collaborators can add tunes, attach charts, set performance keys, and see who knows what. | Build shared working setlists for gigs, sessions, jams, and rehearsals. Collaborators can add tunes, attach charts, set performance keys, and see who knows what. | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Create a setlist when you need a shared working list for a gig, rehearsal, jam, workshop, or session. | Create a setlist when you need a shared working list for a gig, rehearsal, jam, workshop, or session. | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | invited you to | invited you to | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Logged in as | Logged in as | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | No setlists yet. | No setlists yet. | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Pending invitations | Pending invitations | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Prepare music together | Prepare music together | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Setlists | Setlists | needs runtime verification |
| /setlists | app/setlists/page.tsx | visible text | Your setlists | Your setlists | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | button/link label | Add to setlist | Add to setlist | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | returned status/helper text | Choose a tune from quick matches or search results before adding it to the setlist. | Choose a tune from quick matches or search results before adding it to the setlist. | needs runtime verification; conditional/status path |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | returned status/helper text | Selected tune | Selected tune | needs runtime verification; conditional/status path |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | visible text | Add a tune to this setlist | Add a tune to this setlist | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | visible text | Add tune | Add tune | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | visible text | Close | Close | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | visible text | Select a tune first | Select a tune first | needs runtime verification |
| /setlists | components/setlists/AddTuneToSetlistModal.tsx | visible text | Start typing to pick from quick matches, or run a broader normalised search if the tune does not appear immediately. | Start typing to pick from quick matches, or run a broader normalised search if the tune does not appear immediately. | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | button/link label | Create setlist | Create setlist | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | eyebrow prop | New setlist | New setlist | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | form placeholder | Festival set | Festival set | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | form placeholder | Notes about the gig, jam, or rehearsal. | Notes about the gig, jam, or rehearsal. | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | helper/description prop | Use setlists for gigs, sessions, rehearsals, workshops, or any shared playing context. | Use setlists for gigs, sessions, rehearsals, workshops, or any shared playing context. | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | title/heading prop | Create a shared working list | Create a shared working list | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | visible text | Create setlist | Create setlist | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | visible text | Description | Description | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | visible text | Event date | Event date | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | visible text | Location | Location | needs runtime verification |
| /setlists | components/setlists/CreateSetlistModal.tsx | visible text | Name | Name | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | button/link label | Save tune details | Save tune details | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | conditional visible text | Default: {item.piece.key} | Default: {item.piece.key} | needs runtime verification; conditional copy |
| /setlists | components/setlists/EditSetlistItemModal.tsx | conditional visible text | Optional | Optional | needs runtime verification; conditional copy |
| /setlists | components/setlists/EditSetlistItemModal.tsx | form placeholder | Duo chart, fiddle handout, rehearsal recording... | Duo chart, fiddle handout, rehearsal recording... | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Audio | Audio | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Chart label | Chart label | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Chart or music URL | Chart or music URL | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Choose | Choose | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Close | Close | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Edit | Edit | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Image | Image | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | MuseScore | MuseScore | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Notes | Notes | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Other | Other | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Performance key | Performance key | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Setlist tune | Setlist tune | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | These details belong to this setlist only. They do not edit the canonical tune record. | These details belong to this setlist only. They do not edit the canonical tune record. | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Type | Type | needs runtime verification |
| /setlists | components/setlists/EditSetlistItemModal.tsx | visible text | Video | Video | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | button/link label | Delete setlist | Delete setlist | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | button/link label | Save setlist | Save setlist | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | conditional visible text | Delete "{setlist.name}"? This removes the shared setlist for all collaborators. | Delete "{setlist.name}"? This removes the shared setlist for all collaborators. | needs runtime verification; conditional copy |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Close | Close | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Danger zone | Danger zone | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Deleting a setlist removes the shared setlist for all collaborators. It does not delete tunes or anyone’s repertoire state. | Deleting a setlist removes the shared setlist for all collaborators. It does not delete tunes or anyone’s repertoire state. | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Description | Description | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Edit setlist | Edit setlist | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Event date | Event date | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Location | Location | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Name | Name | needs runtime verification |
| /setlists | components/setlists/EditSetlistModal.tsx | visible text | Setlist details | Setlist details | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | button/link label | Invite | Invite | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | button/link label | Inviting... | Inviting... | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | returned status/helper text | {name} (@{friend.username}) | {name} (@{friend.username}) | needs runtime verification; conditional/status path |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | visible text | Choose a friend | Choose a friend | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | visible text | Invite collaborator | Invite collaborator | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | visible text | No available friends to invite. Friends already in this setlist or already invited are hidden here. | No available friends to invite. Friends already in this setlist or already invited are hidden here. | needs runtime verification |
| /setlists | components/setlists/InviteSetlistCollaboratorForm.tsx | visible text | Only accepted friends appear here. Invited users receive an Inbox notification and can accept from the Setlists page. | Only accepted friends appear here. Invited users receive an Inbox notification and can accept from the Setlists page. | needs runtime verification |
| /setlists | components/setlists/SetlistCollaboratorsSection.tsx | conditional visible text | Pending: | Pending: | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistCollaboratorsSection.tsx | visible text | Collaborators | Collaborators | needs runtime verification |
| /setlists | components/setlists/SetlistCoverageSection.tsx | visible text | Coverage comes from each collaborator’s Known and Practice state. Setlist membership itself does not make a tune known. | Coverage comes from each collaborator’s Known and Practice state. Setlist membership itself does not make a tune known. | needs runtime verification |
| /setlists | components/setlists/SetlistCoverageSection.tsx | visible text | This setlist has no tunes yet. | This setlist has no tunes yet. | needs runtime verification |
| /setlists | components/setlists/SetlistCoverageSection.tsx | visible text | Tunes and coverage | Tunes and coverage | needs runtime verification |
| /setlists | components/setlists/SetlistHeader.tsx | returned status/helper text | {count} {count === 1 ? singular : plural} | {count} {count === 1 ? singular : plural} | needs runtime verification; conditional/status path |
| /setlists | components/setlists/SetlistHeader.tsx | visible text | known by everyone | known by everyone | needs runtime verification |
| /setlists | components/setlists/SetlistHeader.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /setlists | components/setlists/SetlistHeader.tsx | visible text | Setlist | Setlist | needs runtime verification |
| /setlists | components/setlists/SetlistHeader.tsx | visible text | with gaps | with gaps | needs runtime verification |
| /setlists | components/setlists/SetlistOverviewCard.tsx | conditional visible text | Open setlist {setlist.name} | Open setlist {setlist.name} | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistOverviewCard.tsx | returned status/helper text | {count} {count === 1 ? singular : plural} | {count} {count === 1 ? singular : plural} | needs runtime verification; conditional/status path |
| /setlists | components/setlists/SetlistOverviewCard.tsx | visible text | Creator | Creator | needs runtime verification |
| /setlists | components/setlists/SetlistOverviewCard.tsx | visible text | known by everyone | known by everyone | needs runtime verification |
| /setlists | components/setlists/SetlistOverviewCard.tsx | visible text | No description yet. | No description yet. | needs runtime verification |
| /setlists | components/setlists/SetlistOverviewCard.tsx | visible text | View setlist | View setlist | needs runtime verification |
| /setlists | components/setlists/SetlistOverviewCard.tsx | visible text | with gaps | with gaps | needs runtime verification |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Choose someone to invite. | Choose someone to invite. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Could not find that invitation. | Could not find that invitation. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Could not find the setlist for that invitation. | Could not find the setlist for that invitation. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Could not find the setlist. | Could not find the setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Could not find the tune or setlist item. | Could not find the tune or setlist item. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Could not move that tune. | Could not move that tune. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Invitation accepted. | Invitation accepted. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Invitation declined. | Invitation declined. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Invitation sent. | Invitation sent. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Only the setlist creator can delete this setlist. | Only the setlist creator can delete this setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Setlist created. | Setlist created. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Setlist deleted. | Setlist deleted. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Setlist name is required. | Setlist name is required. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Setlist order updated. | Setlist order updated. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Setlist updated. | Setlist updated. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Something went wrong with the invitation. | Something went wrong with the invitation. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Something went wrong with the setlist action. | Something went wrong with the setlist action. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Something went wrong with the setlist item action. | Something went wrong with the setlist item action. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That invitation could not be found. | That invitation could not be found. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That invitation is no longer pending. | That invitation is no longer pending. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That setlist could not be found. | That setlist could not be found. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That setlist item could not be found. | That setlist item could not be found. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That tune is already in this setlist. | That tune is already in this setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | That user has already been invited to this setlist. | That user has already been invited to this setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Tune added to setlist. | Tune added to setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Tune details updated. | Tune details updated. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | Tune removed from setlist. | Tune removed from setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | You are already on this setlist. | You are already on this setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | You can only invite accepted friends to a setlist. | You can only invite accepted friends to a setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | You do not have permission to edit that setlist item. | You do not have permission to edit that setlist item. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | You do not have permission to edit that setlist. | You do not have permission to edit that setlist. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistStatusMessages.tsx | email/notification copy | You do not have permission to manage that invitation. | You do not have permission to manage that invitation. | needs runtime verification; derived from constant/config |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Remove | Remove | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Remove from practice | Remove from practice | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Removing... | Removing... | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Mark "{title}" as known? This removes it from active practice. | Mark "{title}" as known? This removes it from active practice. | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Mark as known | Mark as known | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Move "{title}" from Known into Practice? This removes its known-only state and starts the review schedule. | Move "{title}" from Known into Practice? This removes its known-only state and starts the review schedule. | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | No key | No key | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Open chart/music | Open chart/music | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Remove "{title}" from active practice? This stops review scheduling for this tune, but does not remove it from the setlist. | Remove "{title}" from active practice? This stops review scheduling for this tune, but does not remove it from the setlist. | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Remove "{title}" from this setlist? | Remove "{title}" from this setlist? | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Set as known | Set as known | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | conditional visible text | Unknown tune | Unknown tune | needs runtime verification; conditional copy |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | returned status/helper text | Add to my tunes | Add to my tunes | needs runtime verification; conditional/status path |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | returned status/helper text | Already in practice | Already in practice | needs runtime verification; conditional/status path |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | returned status/helper text | Stage {coverage.stage} | Stage {coverage.stage} | needs runtime verification; conditional/status path |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | Close menu | Close menu | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | Default: | Default: | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | Key: | Key: | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | My status: | My status: | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | My tune status | My tune status | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | Style: | Style: | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | This changes your own practice or known state. It does not change the shared setlist. | This changes your own practice or known state. It does not change the shared setlist. | needs runtime verification |
| /setlists | components/setlists/SetlistTuneMatrix.tsx | visible text | Time: | Time: | needs runtime verification |
| /setlists | lib/actions/setlists.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /setlists | lib/actions/setlists.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| /setlists | lib/actions/setlists.ts | returned status/helper text | a tune | a tune | needs runtime verification; conditional/status path |
| /setlists | lib/actions/setlists.ts | returned status/helper text | this setlist | this setlist | needs runtime verification; conditional/status path |
| /setlists | lib/page-options/configs/setlists.ts | config heading/name | Setlists Page Options | Setlists Page Options | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | Choose how your setlist workspace is arranged. | Choose how your setlist workspace is arranged. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | Feedback after setlist and invitation actions. | Feedback after setlist and invitation actions. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | Invitations to collaborate on setlists. | Invitations to collaborate on setlists. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | Shows creation, invitations, and your setlists. | Shows creation, invitations, and your setlists. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | Shows only invitations and setlists. | Shows only invitations and setlists. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | The setlist creation action in the masthead. | The setlist creation action in the masthead. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config helper text | The setlists you own or collaborate on. | The setlists you own or collaborate on. | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Create setlist | Create setlist | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Management | Management | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Pending invitations | Pending invitations | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| /setlists | lib/page-options/configs/setlists.ts | config/action label | Your setlists | Your setlists | needs runtime verification; derived from constant/config |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Most In Practice in {resolvedStyleName} | Most In Practice in {resolvedStyleName} | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Most Known in {resolvedStyleName} | Most Known in {resolvedStyleName} | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | No starting-point tunes found for this style yet. | No starting-point tunes found for this style yet. | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Popular Among Your Friends in {resolvedStyleName} | Popular Among Your Friends in {resolvedStyleName} | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Popular in {resolvedStyleName} you don’t know yet | Popular in {resolvedStyleName} you don’t know yet | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Popular starting points in {resolvedStyleName} | Popular starting points in {resolvedStyleName} | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Strong entry-point tunes in this style based on how many users already know them. | Strong entry-point tunes in this style based on how many users already know them. | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Top Public Lists in {resolvedStyleName} | Top Public Lists in {resolvedStyleName} | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | Widely known tunes in this style that are not yet in your known or practice set. | Widely known tunes in this style that are not yet in your known or practice set. | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | conditional visible text | You already know or practise the most popular tunes in this style. | You already know or practise the most popular tunes in this style. | needs runtime verification; conditional copy |
| /trends | app/trends/[style]/page.tsx | helper/description prop | Public lists with the strongest overlap with this style. | Public lists with the strongest overlap with this style. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | helper/description prop | The tunes in this style most often marked as known across the app. | The tunes in this style most often marked as known across the app. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | helper/description prop | The tunes in this style most often sitting in active practice. | The tunes in this style most often sitting in active practice. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | helper/description prop | Tunes in this style that are most common across your accepted friends’ repertoire. | Tunes in this style that are most common across your accepted friends’ repertoire. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | returned status/helper text | In practice for | In practice for | needs runtime verification; conditional/status path |
| /trends | app/trends/[style]/page.tsx | returned status/helper text | Known by | Known by | needs runtime verification; conditional/status path |
| /trends | app/trends/[style]/page.tsx | returned status/helper text | Known or practised by | Known or practised by | needs runtime verification; conditional/status path |
| /trends | app/trends/[style]/page.tsx | visible text | Discovery and repertoire patterns for this style, drawn from known tunes, practice activity, public lists, and your friend network. | Discovery and repertoire patterns for this style, drawn from known tunes, practice activity, public lists, and your friend network. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | No friend repertoire patterns found in this style yet. | No friend repertoire patterns found in this style yet. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | No known-tune trends found for this style yet. | No known-tune trends found for this style yet. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | No practice trends found for this style yet. | No practice trends found for this style yet. | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | Style view | Style view | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | Top | Top | needs runtime verification |
| /trends | app/trends/[style]/page.tsx | visible text | Trends | Trends | needs runtime verification |
| /trends | app/trends/page.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /trends | app/trends/page.tsx | button/link label | View style trends | View style trends | needs runtime verification |
| /trends | app/trends/page.tsx | conditional visible text | None yet | None yet | needs runtime verification; conditional copy |
| /trends | app/trends/page.tsx | returned status/helper text | {entry.slug}-{entry.styleName}-{index} | {entry.slug}-{entry.styleName}-{index} | needs runtime verification; conditional/status path |
| /trends | app/trends/page.tsx | returned status/helper text | Known or practised by | Known or practised by | needs runtime verification; conditional/status path |
| /trends | app/trends/page.tsx | visible text | Browse by style | Browse by style | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Explore overall repertoire trends, then drill into a specific style. | Explore overall repertoire trends, then drill into a specific style. | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | No styles found yet. | No styles found yet. | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Overall summary | Overall summary | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Popular among your friends | Popular among your friends | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | public list | public list | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Social overview of the repertoire world your friends inhabit. | Social overview of the repertoire world your friends inhabit. | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Top known tune: | Top known tune: | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Top tunes among your friends | Top tunes among your friends | needs runtime verification |
| /trends | app/trends/page.tsx | visible text | Trends &amp; Patterns | Trends &amp; Patterns | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | button/link label | Find friends | Find friends | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | button/link label | View | View | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | visible text | Keys your friends play | Keys your friends play | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | visible text | No key patterns found yet. | No key patterns found yet. | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | visible text | No style patterns found yet. | No style patterns found yet. | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | visible text | Styles your friends play | Styles your friends play | needs runtime verification |
| /trends | components/trends/TrendFriendPatternsSection.tsx | visible text | You do not have any accepted friends yet. | You do not have any accepted friends yet. | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | button/link label | Opening... | Opening... | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | button/link label | View list | View list | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | conditional visible text | Unknown user | Unknown user | needs runtime verification; conditional copy |
| /trends | components/trends/TrendPublicListSection.tsx | visible text | By | By | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | visible text | in this style | in this style | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | visible text | matching tune | matching tune | needs runtime verification |
| /trends | components/trends/TrendPublicListSection.tsx | visible text | No public lists found for this style yet. | No public lists found for this style yet. | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | button/link label | Mark as known | Mark as known | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | button/link label | Start Practice | Start Practice | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | button/link label | Starting... | Starting... | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | returned status/helper text | {metricLabel} {count} {count === 1 ? metricUnit.slice(0, -1) : metricUnit} | {metricLabel} {count} {count === 1 ? metricUnit.slice(0, -1) : metricUnit} | needs runtime verification; conditional/status path |
| /trends | components/trends/TrendTuneList.tsx | returned status/helper text | Key: {piece.key} | Key: {piece.key} | needs runtime verification; conditional/status path |
| /trends | components/trends/TrendTuneList.tsx | returned status/helper text | Style: {piece.style} | Style: {piece.style} | needs runtime verification; conditional/status path |
| /trends | components/trends/TrendTuneList.tsx | returned status/helper text | Time: {piece.time_signature} | Time: {piece.time_signature} | needs runtime verification; conditional/status path |
| /trends | components/trends/TrendTuneList.tsx | visible text | Add to List | Add to List | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | visible text | Already in practice | Already in practice | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | visible text | In these lists: | In these lists: | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | visible text | Known | Known | needs runtime verification |
| /trends | components/trends/TrendTuneList.tsx | visible text | No tunes found for this section yet. | No tunes found for this section yet. | needs runtime verification |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | A pending or accepted connection already exists with that user. | A pending or accepted connection already exists with that user. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Could not tell which friend request to accept. | Could not tell which friend request to accept. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Could not tell which user to message. | Could not tell which user to message. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Could not tell which user to send the request to. | Could not tell which user to send the request to. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Friend request accepted. | Friend request accepted. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Friend request sent. | Friend request sent. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Message sent. | Message sent. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | That friend request could not be found. | That friend request could not be found. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | That request is no longer pending. | That request is no longer pending. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | That tune is already in the selected list. | That tune is already in the selected list. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | That user could not be found. | That user could not be found. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Tune added to your list. | Tune added to your list. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | Write a message before sending. | Write a message before sending. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | You are not allowed to accept that request. | You are not allowed to accept that request. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | You cannot send a direct message to yourself. | You cannot send a direct message to yourself. | needs runtime verification; derived from constant/config |
| /users/[username] | app/users/[username]/page.tsx | email/notification copy | You cannot send a friend request to yourself. | You cannot send a friend request to yourself. | needs runtime verification; derived from constant/config |
| app | app/api/media-loops/route.ts | returned status/helper text | Authentication required | Authentication required | needs runtime verification; conditional/status path |
| app | app/api/media-loops/route.ts | returned status/helper text | Could not load media loops | Could not load media loops | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | Enter at least two characters to search. | Enter at least two characters to search. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | The app has reached today's shared YouTube search limit of {quota.global_daily_limit} searches. Try again tomorrow. | The app has reached today's shared YouTube search limit of {quota.global_daily_limit} searches. Try again tomorrow. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | Unknown channel | Unknown channel | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | Untitled YouTube video | Untitled YouTube video | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | You have used today's {quota.user_daily_limit} YouTube searches. Try again tomorrow. | You have used today's {quota.user_daily_limit} YouTube searches. Try again tomorrow. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search could not be reached. Check your connection and try again. | YouTube search could not be reached. Check your connection and try again. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search failed. Check the API key, quota, and YouTube Data API settings. | YouTube search failed. Check the API key, quota, and YouTube Data API settings. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search is limited to one search per minute. Try again in {seconds} seconds. | YouTube search is limited to one search per minute. Try again in {seconds} seconds. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search is limited to one search per minute. Try again in a second. | YouTube search is limited to one search per minute. Try again in a second. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search is not configured. Add YOUTUBE_DATA_API_KEY to .env.local, then restart the dev server. | YouTube search is not configured. Add YOUTUBE_DATA_API_KEY to .env.local, then restart the dev server. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | returned status/helper text | YouTube search is temporarily limited. Try again shortly. | YouTube search is temporarily limited. Try again shortly. | needs runtime verification; conditional/status path |
| app | app/api/youtube/search/route.ts | status/error message | Could not check YouTube search quota. | Could not check YouTube search quota. | needs runtime verification; derived from constant/config |
| app | app/api/youtube/search/route.ts | status/error message | You must be logged in to search YouTube. | You must be logged in to search YouTube. | needs runtime verification; derived from constant/config |
| app | app/loading.tsx | button/link label | Loading your tunes | Loading your tunes | needs runtime verification |
| auth | app/auth/confirm/route.ts | returned status/helper text | {redirectBaseUrl}{safeNextPath} | {redirectBaseUrl}{safeNextPath} | needs runtime verification; conditional/status path |
| auth | app/auth/confirm/route.ts | returned status/helper text | {redirectBaseUrl}/login?auth=confirmation-error | {redirectBaseUrl}/login?auth=confirmation-error | needs runtime verification; conditional/status path |
| auth | app/auth/confirm/route.ts | returned status/helper text | {redirectBaseUrl}/login?auth=missing-confirmation-token | {redirectBaseUrl}/login?auth=missing-confirmation-token | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | button/link label | Creating account... | Creating account... | needs runtime verification |
| auth | app/login/page.tsx | button/link label | Loading your tunes... | Loading your tunes... | needs runtime verification |
| auth | app/login/page.tsx | button/link label | Sending reset link... | Sending reset link... | needs runtime verification |
| auth | app/login/page.tsx | button/link label | Signing in... | Signing in... | needs runtime verification |
| auth | app/login/page.tsx | conditional visible text | Create account | Create account | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Create an account to start building your repertoire memory system. | Create an account to start building your repertoire memory system. | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | current-password | current-password | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Enter your email and we’ll send you a link to set a new password. | Enter your email and we’ll send you a link to set a new password. | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | new-password | new-password | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Reset password | Reset password | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Send reset link | Send reset link | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Sign in | Sign in | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | conditional visible text | Sign in to manage your tunes, lists, practice, and repertoire. | Sign in to manage your tunes, lists, practice, and repertoire. | needs runtime verification; conditional copy |
| auth | app/login/page.tsx | form placeholder | Password | Password | needs runtime verification |
| auth | app/login/page.tsx | form placeholder | you@example.com | you@example.com | needs runtime verification |
| auth | app/login/page.tsx | returned status/helper text | already registered | already registered | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | status/error message | Account created. Check your email to confirm your account, then sign in. | Account created. Check your email to confirm your account, then sign in. | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | status/error message | Check your email to confirm your account, then sign in. | Check your email to confirm your account, then sign in. | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | status/error message | If an account exists for that email, a password reset link has been sent. | If an account exists for that email, a password reset link has been sent. | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | status/error message | That email already has an account. Sign in instead. | That email already has an account. Sign in instead. | needs runtime verification; conditional/status path |
| auth | app/login/page.tsx | visible text | Already have an account? Sign in | Already have an account? Sign in | needs runtime verification |
| auth | app/login/page.tsx | visible text | Compare overlap, browse public lists, and find the tunes you share with other musicians. | Compare overlap, browse public lists, and find the tunes you share with other musicians. | needs runtime verification |
| auth | app/login/page.tsx | visible text | Connect | Connect | needs runtime verification |
| auth | app/login/page.tsx | visible text | Email | Email | needs runtime verification |
| auth | app/login/page.tsx | visible text | Forgot your password? | Forgot your password? | needs runtime verification |
| auth | app/login/page.tsx | visible text | Keep tune lists for sessions, styles, projects, and repertoire clusters. | Keep tune lists for sessions, styles, projects, and repertoire clusters. | needs runtime verification |
| auth | app/login/page.tsx | visible text | New here? Create a new account | New here? Create a new account | needs runtime verification |
| auth | app/login/page.tsx | visible text | Organise | Organise | needs runtime verification |
| auth | app/login/page.tsx | visible text | Password | Password | needs runtime verification |
| auth | app/login/page.tsx | visible text | Practise | Practise | needs runtime verification |
| auth | app/login/page.tsx | visible text | Remember what you play, and build repertoire as culture. | Remember what you play, and build repertoire as culture. | needs runtime verification |
| auth | app/login/page.tsx | visible text | Sign in to manage your tunes, lists, practice, and repertoire. | Sign in to manage your tunes, lists, practice, and repertoire. | needs runtime verification |
| auth | app/login/page.tsx | visible text | Tunes App | Tunes App | needs runtime verification |
| auth | app/login/page.tsx | visible text | Tunes App helps musicians organise tunes, practise them deliberately, and connect repertoire with other players. Add tunes, place them in lists, move them into practice, mark what you know, and compare common ground with friends. | Tunes App helps musicians organise tunes, practise them deliberately, and connect repertoire with other players. Add tunes, place them in lists, move them into practice, mark what you know, and compare common ground with friends. | needs runtime verification |
| auth | app/login/page.tsx | visible text | Use staged review to keep active tunes alive instead of letting them dissolve. | Use staged review to keep active tunes alive instead of letting them dissolve. | needs runtime verification |
| auth | app/update-password/page.tsx | conditional visible text | Update password | Update password | needs runtime verification; conditional copy |
| auth | app/update-password/page.tsx | conditional visible text | Updating password... | Updating password... | needs runtime verification; conditional copy |
| auth | app/update-password/page.tsx | status/error message | Password updated. Redirecting to Home... | Password updated. Redirecting to Home... | needs runtime verification; conditional/status path |
| auth | app/update-password/page.tsx | visible text | Confirm new password | Confirm new password | needs runtime verification |
| auth | app/update-password/page.tsx | visible text | Enter a new password for your Tunes App account. | Enter a new password for your Tunes App account. | needs runtime verification |
| auth | app/update-password/page.tsx | visible text | New password | New password | needs runtime verification |
| auth | app/update-password/page.tsx | visible text | Set new password | Set new password | needs runtime verification |
| components | components/activity/ActivityInteractionPanel.tsx | button/link label | Delete | Delete | needs runtime verification |
| components | components/activity/ActivityInteractionPanel.tsx | button/link label | Deleting... | Deleting... | needs runtime verification |
| components | components/activity/ActivityInteractionPanel.tsx | button/link label | Save edit | Save edit | needs runtime verification |
| components | components/activity/ActivityInteractionPanel.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| components | components/activity/ActivityInteractionPanel.tsx | returned status/helper text | /users/{encodeURIComponent( repl} | /users/{encodeURIComponent( repl} | needs runtime verification; conditional/status path |
| components | components/activity/ActivityInteractionPanel.tsx | returned status/helper text | Unknown user | Unknown user | needs runtime verification; conditional/status path |
| components | components/activity/ActivityInteractionPanel.tsx | visible text | Edit | Edit | needs runtime verification |
| components | components/activity/ActivityReplyForm.tsx | button/link label | Posting... | Posting... | needs runtime verification |
| components | components/activity/ActivityReplyForm.tsx | conditional visible text | Reply | Reply | needs runtime verification; conditional copy |
| components | components/activity/ActivityReplyForm.tsx | conditional visible text | Reply to comment | Reply to comment | needs runtime verification; conditional copy |
| components | components/activity/ActivityReplyForm.tsx | conditional visible text | Reply to this activity | Reply to this activity | needs runtime verification; conditional copy |
| components | components/activity/ActivityReplyForm.tsx | conditional visible text | Reply to this tune comment | Reply to this tune comment | needs runtime verification; conditional copy |
| components | components/activity/OptimisticActivityReactionButton.tsx | visible text | Could not sync reaction. It may update after refresh. | Could not sync reaction. It may update after refresh. | needs runtime verification |
| components | components/AddToListModal.tsx | button/link label | Adding... | Adding... | needs runtime verification |
| components | components/AddToListModal.tsx | button/link label | Create list | Create list | needs runtime verification |
| components | components/AddToListModal.tsx | button/link label | Creating... | Creating... | needs runtime verification |
| components | components/AddToListModal.tsx | conditional visible text | Add to {selectedAddableListIds.length} lists | Add to {selectedAddableListIds.length} lists | needs runtime verification; conditional copy |
| components | components/AddToListModal.tsx | conditional visible text | Add to selected lists | Add to selected lists | needs runtime verification; conditional copy |
| components | components/AddToListModal.tsx | eyebrow prop | Lists | Lists | needs runtime verification |
| components | components/AddToListModal.tsx | form placeholder | e.g. Session tunes | e.g. Session tunes | needs runtime verification |
| components | components/AddToListModal.tsx | title/heading prop | Add to List | Add to List | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | Already in this list | Already in this list | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | Choose lists | Choose lists | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | Create new list | Create new list | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | New list name | New list name | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | Select one or more lists to add this tune. | Select one or more lists to add this tune. | needs runtime verification |
| components | components/AddToListModal.tsx | visible text | You do not have any lists yet. | You do not have any lists yet. | needs runtime verification |
| components | components/AddToListSection.tsx | visible text | Add Tune | Add Tune | needs runtime verification |
| components | components/AddToListSection.tsx | visible text | Add Tune to List | Add Tune to List | needs runtime verification |
| components | components/AddToListSection.tsx | visible text | Select a list | Select a list | needs runtime verification |
| components | components/AddToListSection.tsx | visible text | Select a tune | Select a tune | needs runtime verification |
| components | components/EmptyState.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| components | components/filters/FilterChip.tsx | conditional visible text | Remove filter {label} | Remove filter {label} | needs runtime verification; conditional copy |
| components | components/filters/FilterPanel.tsx | eyebrow prop | Filters | Filters | needs runtime verification |
| components | components/filters/FilterPanel.tsx | returned status/helper text | Close filters | Close filters | needs runtime verification; conditional/status path |
| components | components/filters/FilterPanel.tsx | visible text | Clear all | Clear all | needs runtime verification |
| components | components/filters/FilterPanel.tsx | visible text | Close filters | Close filters | needs runtime verification |
| components | components/filters/FilterShell.tsx | button/link label | Searching... | Searching... | needs runtime verification |
| components | components/filters/FilterShell.tsx | button/link label | Updating filters... | Updating filters... | needs runtime verification |
| components | components/filters/FilterShell.tsx | button/link label | Updating... | Updating... | needs runtime verification |
| components | components/filters/FilterShell.tsx | conditional visible text | {panelId}-search | {panelId}-search | needs runtime verification; conditional copy |
| components | components/filters/FilterShell.tsx | conditional visible text | Filters | Filters | needs runtime verification; conditional copy |
| components | components/filters/FilterShell.tsx | conditional visible text | Filters ({activeFilterCount}) | Filters ({activeFilterCount}) | needs runtime verification; conditional copy |
| components | components/filters/FilterShell.tsx | conditional visible text | Search | Search | needs runtime verification; conditional copy |
| components | components/filters/FilterShell.tsx | returned status/helper text | {panelId}-search | {panelId}-search | needs runtime verification; conditional/status path |
| components | components/filters/FilterShell.tsx | visible text | Clear filters | Clear filters | needs runtime verification |
| components | components/filters/FilterShell.tsx | visible text | Searching... | Searching... | needs runtime verification |
| components | components/filters/FilterShell.tsx | visible text | Updating... | Updating... | needs runtime verification |
| components | components/LogoutButton.tsx | button/link label | Logging out... | Logging out... | needs runtime verification |
| components | components/LogoutButton.tsx | conditional visible text | Logout | Logout | needs runtime verification; conditional copy |
| components | components/LogoutButton.tsx | visible text | Logging out... | Logging out... | needs runtime verification |
| components | components/mobile/MobileFilterSheet.tsx | eyebrow prop |  | Mobile | mobile-only |
| components | components/mobile/MobileTuneRow.tsx | returned status/helper text |  | Key: {tuneKey} | mobile-only; conditional/status path |
| components | components/mobile/MobileTuneRow.tsx | visible text |  | Stage | mobile-only |
| components | components/NavDropdown.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | button/link label | Reset to default | Reset to default | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | button/link label | Resetting... | Resetting... | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | button/link label | Save Page Options | Save Page Options | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | button/link label | Saving... | Saving... | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | config helper text | Larger panels and less visual compression. | Larger panels and less visual compression. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | Let the app choose the best layout for the screen. | Let the app choose the best layout for the screen. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | One-column layout with maximum focus. | One-column layout with maximum focus. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | The normal app rhythm. | The normal app rhythm. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | Three-column dashboard layout where space allows. | Three-column dashboard layout where space allows. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | Tighter panels for denser management pages. | Tighter panels for denser management pages. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config helper text | Two-column layout for a calmer working surface. | Two-column layout for a calmer working surface. | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Auto | Auto | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Comfortable | Comfortable | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Compact | Compact | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Spacious | Spacious | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Standard | Standard | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | config/action label | Wide | Wide | needs runtime verification; derived from constant/config |
| components | components/page-options/PageOptionsModal.tsx | eyebrow prop | Page Options | Page Options | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | returned status/helper text | section_{section.id} | section_{section.id} | needs runtime verification; conditional/status path |
| components | components/page-options/PageOptionsModal.tsx | visible text | Cancel | Cancel | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Columns | Columns | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Core | Core | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Current preset: | Current preset: | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Density | Density | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Layout preset | Layout preset | needs runtime verification |
| components | components/page-options/PageOptionsModal.tsx | visible text | Sections shown | Sections shown | needs runtime verification |
| components | components/PendingNavLink.tsx | button/link label | Loading... | Loading... | needs runtime verification |
| components | components/ReferenceMediaLink.tsx | returned status/helper text | {pathname}?{search} | {pathname}?{search} | needs runtime verification; conditional/status path |
| components | components/ReferenceMediaLink.tsx | returned status/helper text | Open reference | Open reference | needs runtime verification; conditional/status path |
| components | components/ReferenceMediaLink.tsx | visible text | Open reference | Open reference | needs runtime verification |
| components | components/TuneCard.tsx | conditional visible text | Open tune page for {title} | Open tune page for {title} | needs runtime verification; conditional copy |
| components | components/TuneCard.tsx | returned status/helper text | Open reference video | Open reference video | needs runtime verification; conditional/status path |
| components | components/TuneCard.tsx | visible text | In: | In: | needs runtime verification |
| components | components/TuneSearchSelect.tsx | form placeholder | e.g. Angeline the Baker | e.g. Angeline the Baker | needs runtime verification |
| components | components/TuneSearchSelect.tsx | returned status/helper text | {piece.title} · {metadata} | {piece.title} · {metadata} | needs runtime verification; conditional/status path |
| components | components/TuneSearchSelect.tsx | visible text | No available tunes matched that search. Try a shorter title fragment if the tune exists under a slightly different name. | No available tunes matched that search. Try a shorter title fragment if the tune exists under a slightly different name. | needs runtime verification |
| components | components/TuneSearchSelect.tsx | visible text | Quick matches | Quick matches | needs runtime verification |
| components | components/TuneSearchSelect.tsx | visible text | Remove | Remove | needs runtime verification |
| components | components/TuneSearchSelect.tsx | visible text | Search | Search | needs runtime verification |
| components | components/TuneSearchSelect.tsx | visible text | Search results | Search results | needs runtime verification |
| components | components/TuneSearchSelect.tsx | visible text | Search tunes | Search tunes | needs runtime verification |
| components | components/ui/ClickableCard.tsx | config/action label | aria-label | aria-label | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/AppHeader.tsx | visible text | Tunes App | Tunes App | needs runtime verification |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Dev |  | desktop-only |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Lists |  | desktop-only |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Login |  | desktop-only |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Moderator |  | desktop-only |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Profile |  | desktop-only |
| global nav/layout | components/layout/DesktopNav.tsx | button/link label | Social |  | desktop-only |
| global nav/layout | components/layout/MobileMoreMenu.tsx | button/link label |  | Loading... | mobile-only |
| global nav/layout | components/layout/MobileMoreMenu.tsx | visible text |  | More | mobile-only |
| global nav/layout | components/layout/MobileNav.tsx | conditional visible text |  | Close | mobile-only; conditional copy |
| global nav/layout | components/layout/MobileNav.tsx | conditional visible text |  | Lists | mobile-only; conditional copy |
| global nav/layout | components/layout/MobileNav.tsx | conditional visible text |  | More | mobile-only; conditional copy |
| global nav/layout | components/layout/MobileNav.tsx | conditional visible text |  | Social | mobile-only; conditional copy |
| global nav/layout | components/layout/MobileNav.tsx | config/action label |  | Dev | mobile-only; derived from constant/config |
| global nav/layout | components/layout/MobileNav.tsx | config/action label |  | Moderator | mobile-only; derived from constant/config |
| global nav/layout | components/layout/MobileNav.tsx | config/action label |  | Profile | mobile-only; derived from constant/config |
| global nav/layout | components/layout/MobileNav.tsx | title/heading prop |  | Lists | mobile-only |
| global nav/layout | components/layout/MobileNav.tsx | title/heading prop |  | More | mobile-only |
| global nav/layout | components/layout/MobileNav.tsx | title/heading prop |  | Social | mobile-only |
| global nav/layout | components/layout/navItems.ts | config/action label | Badges | Badges | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Compare | Compare | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Friends | Friends | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Home | Home | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Inbox | Inbox | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | My Lists | My Lists | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Practice | Practice | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Public Lists | Public Lists | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Setlists | Setlists | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Trends | Trends | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | config/action label | Tunes | Tunes | needs runtime verification; derived from constant/config |
| global nav/layout | components/layout/navItems.ts | returned status/helper text | {href}/ | {href}/ | needs runtime verification; conditional/status path |
| lib | lib/actions/activity-interactions/reactions.ts | status/error message | That activity could not be found. | That activity could not be found. | needs runtime verification; derived from constant/config |
| lib | lib/actions/activity-interactions/reactions.ts | status/error message | That reaction is not available. | That reaction is not available. | needs runtime verification; derived from constant/config |
| lib | lib/actions/activity-interactions/reactions.ts | status/error message | You cannot react to this activity. | You cannot react to this activity. | needs runtime verification; derived from constant/config |
| lib | lib/actions/activity-interactions/reactions.ts | status/error message | You need to be signed in to react. | You need to be signed in to react. | needs runtime verification; derived from constant/config |
| lib | lib/actions/activity-interactions/shared.ts | returned status/helper text | {cleaned.slice(0, 180).trim()}… | {cleaned.slice(0, 180).trim()}… | needs runtime verification; conditional/status path |
| lib | lib/actions/bulk-import.ts | config helper text | Created automatically from bulk tune upload | Created automatically from bulk tune upload | needs runtime verification; derived from constant/config |
| lib | lib/actions/bulk-import.ts | returned status/helper text | {normaliseForDuplicateMatch(title)}\|\|\|{normaliseForDuplicateMatch( key )} | {normaliseForDuplicateMatch(title)}\|\|\|{normaliseForDuplicateMatch( key )} | needs runtime verification; conditional/status path |
| lib | lib/actions/bulk-import.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/actions/bulk-import.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/actions/media-loops.ts | returned status/helper text | {rawRedirectTo}{separator}loop={status} | {rawRedirectTo}{separator}loop={status} | needs runtime verification; conditional/status path |
| lib | lib/actions/page-preferences.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/actions/page-preferences.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/actions/pieces.ts | returned status/helper text | {url}?{key}={encodeURIComponent(value)} | {url}?{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/actions/pieces.ts | returned status/helper text | {url}&{key}={encodeURIComponent(value)} | {url}&{key}={encodeURIComponent(value)} | needs runtime verification; conditional/status path |
| lib | lib/page-options/configs/home.ts | config heading/name | Home Page Options | Home Page Options | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | A general overview of repertoire, practice, lists, badges, and social activity. | A general overview of repertoire, practice, lists, badges, and social activity. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | A small preview of tunes inside the review system. | A small preview of tunes inside the review system. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | A small preview of your tune lists. | A small preview of your tune lists. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Badges received and badges you award. | Badges received and badges you award. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Choose what Home prioritises when you open the app. | Choose what Home prioritises when you open the app. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Guidance shown when the account is still being set up. | Guidance shown when the account is still being set up. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Keeps Home quiet and focused on the most important practice signals. | Keeps Home quiet and focused on the most important practice signals. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Prioritises due tunes, learning queue, catch-up pressure, current practice, and streaks. | Prioritises due tunes, learning queue, catch-up pressure, current practice, and streaks. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Prioritises friend activity, badges, and community-facing signals. | Prioritises friend activity, badges, and community-facing signals. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Prioritises lists, learning queue, repertoire state, and current practice organisation. | Prioritises lists, learning queue, repertoire state, and current practice organisation. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Recent activity from accepted friends. | Recent activity from accepted friends. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Revision and practice streak cards. | Revision and practice streak cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | The account card in the Home masthead. | The account card in the Home masthead. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | The next due tunes that need review attention. | The next due tunes that need review attention. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config helper text | Tunes saved in lists but not yet started in Practice or marked Known. | Tunes saved in lists but not yet started in Practice or marked Known. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Badges | Badges | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Balanced Dashboard | Balanced Dashboard | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Currently in practice | Currently in practice | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Due next | Due next | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Friend activity | Friend activity | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Getting started | Getting started | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Learning queue | Learning queue | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Organiser | Organiser | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Practice First | Practice First | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Repertoire state | Repertoire state | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Signed-in card | Signed-in card | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Social | Social | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Streaks | Streaks | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/home.ts | config/action label | Your lists | Your lists | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config heading/name | Lists Page Options | Lists Page Options | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Choose how your list-management page is arranged. | Choose how your list-management page is arranged. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Feedback after creating, editing, or deleting lists. | Feedback after creating, editing, or deleting lists. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Keeps every list-management and learning-queue surface visible. | Keeps every list-management and learning-queue surface visible. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | My Tunes, Learning Queue, and unlisted-tune organisation prompts. | My Tunes, Learning Queue, and unlisted-tune organisation prompts. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Search and filter controls for list browsing. | Search and filter controls for list browsing. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Shows creation, Learning Queue, clean-up prompts, filters, and list cards. | Shows creation, Learning Queue, clean-up prompts, filters, and list cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Shows only filters and list results. | Shows only filters and list results. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | Summary of the current filtered list view. | Summary of the current filtered list view. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | The create-list action near the top of the page. | The create-list action near the top of the page. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config helper text | The list overview cards. | The list overview cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Create list | Create list | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Filters | Filters | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | List results | List results | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Management | Management | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Organiser | Organiser | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Results header | Results header | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/lists.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config heading/name | Practice Page Options | Practice Page Options | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | All tunes currently inside the practice system. | All tunes currently inside the practice system. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Choose how the Practice page prioritises review work. | Choose how the Practice page prioritises review work. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Feedback after updating practice state. | Feedback after updating practice state. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Links between Review, Diary, and future practice surfaces. | Links between Review, Diary, and future practice surfaces. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Overdue tunes waiting for review. | Overdue tunes waiting for review. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Prioritises catch-up and due-today work. | Prioritises catch-up and due-today work. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Revision and practice streak cards. | Revision and practice streak cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Shows only the core review queues. | Shows only the core review queues. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Shows the full practice workflow. | Shows the full practice workflow. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config helper text | Tunes scheduled for review today. | Tunes scheduled for review today. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Active practice | Active practice | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Catch-up | Catch-up | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Due today | Due today | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Practice First | Practice First | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Practice navigation | Practice navigation | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Review | Review | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Status messages | Status messages | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/practice.ts | config/action label | Streaks | Streaks | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config heading/name | Profile Page Options | Profile Page Options | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config helper text | Choose how your private profile page is shown. | Choose how your private profile page is shown. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config helper text | Keeps the profile page focused on the editor. | Keeps the profile page focused on the editor. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config helper text | Shows the full profile settings editor. | Shows the full profile settings editor. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config helper text | The private profile, instruments, and visibility editor. | The private profile, instruments, and visibility editor. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config/action label | Profile editor | Profile editor | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/profile.ts | config/action label | Settings | Settings | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config heading/name | Public Lists Page Options | Public Lists Page Options | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | Choose how public list discovery is shown. | Choose how public list discovery is shown. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | Guidance shown when no public lists are available. | Guidance shown when no public lists are available. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | Shows only the public-list cards. | Shows only the public-list cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | Shows the full public-list discovery surface. | Shows the full public-list discovery surface. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | The public list cards. | The public list cards. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config helper text | The public-list discovery masthead. | The public-list discovery masthead. | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config/action label | Discovery | Discovery | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config/action label | Empty state | Empty state | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config/action label | Minimal | Minimal | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config/action label | Public lists | Public lists | needs runtime verification; derived from constant/config |
| lib | lib/page-options/configs/shared-page.ts | config/action label | Public Lists header | Public Lists header | needs runtime verification; derived from constant/config |
| notifications/email | app/api/cron/notification-digests/route.ts | returned status/helper text | Notification digest processing failed. | Notification digest processing failed. | needs runtime verification; conditional/status path |
| notifications/email | app/api/cron/notification-digests/route.ts | status/error message | Missing required server environment variable: CRON_SECRET | Missing required server environment variable: CRON_SECRET | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} awarded you a badge | {name} awarded you a badge | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} invited you to a setlist | {name} invited you to a setlist | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} replied to your activity | {name} replied to your activity | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} replied to your tune comment | {name} replied to your tune comment | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} sent you a friend request | {name} sent you a friend request | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | {name} sent you a message | {name} sent you a message | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | email/notification copy | New Tunes App notification | New Tunes App notification | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | : {item.bodyPreview} | : {item.bodyPreview} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {digestTypeLabel(type)} {lines} | {digestTypeLabel(type)} {lines} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {intro} {textGroups}{actionText} {preferencesFooter} | {intro} {textGroups}{actionText} {preferencesFooter} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {item.actorName} awarded you a badge{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | {item.actorName} awarded you a badge{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {item.actorName} replied to your activity{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | {item.actorName} replied to your activity{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {item.actorName} replied to your tune comment{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | {item.actorName} replied to your tune comment{item.bodyPreview ? `: ${item.bodyPreview}` : "."} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | {message}{actionText} {preferencesFooter} | {message}{actionText} {preferencesFooter} | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | Activity replies | Activity replies | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | Badge awards | Badge awards | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | Comment replies | Comment replies | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | Open inbox | Open inbox | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | Open notification | Open notification | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | View activity | View activity | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | View badge | View badge | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | View comment | View comment | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | View friend request | View friend request | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | returned status/helper text | View setlist invite | View setlist invite | needs runtime verification; conditional/status path |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} awarded you a badge. {preview} | {name} awarded you a badge. {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} invited you to a setlist. {preview} | {name} invited you to a setlist. {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} replied to your activity: {preview} | {name} replied to your activity: {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} replied to your tune comment: {preview} | {name} replied to your tune comment: {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} sent you a friend request on Tunes App. | {name} sent you a friend request on Tunes App. | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name} sent you a message: {preview} | {name} sent you a message: {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/email-templates.ts | status/error message | {name}: {preview} | {name}: {preview} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-digests.ts | status/error message | Digest notification sent markers were not updated. | Digest notification sent markers were not updated. | needs runtime verification; conditional/status path |
| notifications/email | lib/services/notification-digests.ts | status/error message | Recipient email lookup failed: {errorMessage} | Recipient email lookup failed: {errorMessage} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-digests.ts | status/error message | Recipient email unavailable from Supabase Auth. | Recipient email unavailable from Supabase Auth. | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-emails.ts | status/error message | {String(preferenceField)} disabled. | {String(preferenceField)} disabled. | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-emails.ts | status/error message | Email notifications disabled. | Email notifications disabled. | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-emails.ts | status/error message | No safe email preference mapping for notification type. | No safe email preference mapping for notification type. | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-emails.ts | status/error message | Recipient email lookup failed: {errorMessage} | Recipient email lookup failed: {errorMessage} | needs runtime verification; derived from constant/config |
| notifications/email | lib/services/notification-emails.ts | status/error message | Recipient email unavailable from Supabase Auth. | Recipient email unavailable from Supabase Auth. | needs runtime verification; derived from constant/config |
