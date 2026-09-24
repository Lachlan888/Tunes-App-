export const SETTINGS_SECTIONS = [
  { id: 'profile', title: 'Profile', description: 'Name, bio and the instruments you play.' },
  { id: 'privacy', title: 'Privacy and sharing', description: 'Choose what other musicians can see.' },
  { id: 'practice', title: 'Practice preferences', description: 'Optional diary and practice context.' },
  { id: 'notifications', title: 'Notifications', description: 'Email updates and your digest.' },
  { id: 'security', title: 'Account and security', description: 'Password and signing out.' },
] as const
export type SettingsSection = typeof SETTINGS_SECTIONS[number]['id']
export const PRIVACY_OPTIONS = [
  ['show_identity','Show identity','Share your display name and bio. Your username remains the address of your profile.'],
  ['show_instruments','Show instruments','Share the instruments you play.'],
  ['show_public_lists_on_profile','Show public lists','Feature your public lists on your profile.'],
  ['show_composed_tunes_on_profile','Show composed tunes','Feature tunes credited to you as composer.'],
  ['show_repertoire_summary','Show repertoire summary','Publish counts of Known tunes and tunes in Practice.'],
  ['show_repertoire_to_friends','Share repertoire with friends','Allow accepted friends to browse your Known and Practice tunes.'],
  ['show_comment_activity','Share musical contributions','Allow friends to see comments, lore, recordings and tune contributions.'],
  ['show_compare_discoverability','Allow Compare discovery','Let musicians compare repertoire with you.'],
  ['compare_requires_friend','Require friendship for Compare','Limit comparison to accepted friends.'],
] as const
export const NOTIFICATION_OPTIONS = [
  ['email_enabled','Email notifications','Turning email off keeps in-app notifications available.'],
  ['email_friend_requests','Friend requests','Email when someone sends a request.'],
  ['email_direct_messages','Direct messages','Allow message email where available.'],
  ['email_setlist_invites','Setlist invitations','Email when someone invites you to a setlist.'],
  ['digest_include_practice','Practice in my digest','Practice activity and tunes needing attention.'],
  ['digest_include_friends','Friends in my digest','Visible activity from accepted friends.'],
  ['digest_include_community','Community in my digest','New tunes and reference media.'],
  ['digest_include_updates','Replies and badges in my digest','Lower-urgency personal updates.'],
] as const
export function settingsPatch(section: string, form: FormData): { patch: Record<string,string | boolean | null>; error?: string } {
  if (section === 'profile') {
    const username = String(form.get('username') ?? '').trim().toLowerCase()
    const name = String(form.get('display_name') ?? '').trim()
    const bio = String(form.get('bio') ?? '').trim()
    if (!/^[a-z0-9_]{3,30}$/.test(username)) return { patch:{}, error:'Use 3–30 letters, numbers or underscores for your username.' }
    if (name.length > 80 || bio.length > 500) return { patch:{}, error:'Keep your name within 80 characters and bio within 500.' }
    return { patch:{username, display_name:name || null,bio:bio || null} }
  }
  const options = section === 'privacy' ? PRIVACY_OPTIONS : section === 'notifications' ? NOTIFICATION_OPTIONS : section === 'practice' ? [['practice_diary_enabled']] : null
  if (!options) return {patch:{},error:'Choose a valid settings group.'}
  const patch: Record<string,string | boolean | null> = Object.fromEntries(options.map(([key]) => [key,form.get(key) === 'on']))
  if (section === 'notifications') {
    const digest = String(form.get('digest_frequency') ?? '')
    if (!['daily','weekly','never'].includes(digest)) return {patch:{},error:'Choose a valid digest frequency.'}
    patch.digest_frequency = digest
    patch.email_comment_replies = patch.digest_include_updates
    patch.email_activity_replies = patch.digest_include_updates
    patch.email_badges = patch.digest_include_updates
  }
  return {patch}
}
