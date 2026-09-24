import Link from 'next/link'
import { redirect } from 'next/navigation'
import { loadOwnProfileData } from '@/lib/loaders/profile'
import { getOptionalUserContext } from '@/lib/auth/session'
import { getSafeInternalPath } from '@/lib/auth/redirects'
import { SETTINGS_SECTIONS, PRIVACY_OPTIONS, NOTIFICATION_OPTIONS } from '@/lib/account-settings'
import { saveAccountSettings } from '@/lib/actions/account-settings'
import SettingsForm from '@/components/settings/SettingsForm'
import InstrumentSettings from '@/components/settings/InstrumentSettings'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage({searchParams}: {searchParams?:Promise<Record<string,string | string[] | undefined>>}) {
  const params = await searchParams ?? {}
  const section = SETTINGS_SECTIONS.find(item => item.id === params.section)
  const nextPath = getSafeInternalPath(typeof params.next === 'string' ? params.next : '', '')
  const context = await getOptionalUserContext()
  if (!context) redirect(`/login?next=${encodeURIComponent(`/dashboard${section ? `?section=${section.id}` : ''}`)}`)
  const {user,profile,notificationPreferences,instruments} = await loadOwnProfileData()
  const input = 'mt-1 block w-full rounded-xl border border-border bg-surface px-3 py-3'
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
    {section && <Link className="inline-block min-h-11 text-sm underline" href="/dashboard">← Account & settings</Link>}
    <header><h1 className="font-serif text-3xl font-bold">{section?.title ?? 'Account & settings'}</h1><p className="mt-2 text-sm text-text-muted">{section?.description ?? 'Your musical identity, preferences and account.'}</p></header>
    {!section ? <>
      <div className="rounded-2xl bg-card p-4"><p className="font-semibold">{profile?.display_name || profile?.username || 'Welcome to your tunebook'}</p>{profile?.username && <Link className="mt-2 inline-block min-h-11 py-2 text-sm underline" href={`/users/${encodeURIComponent(profile.username)}`}>View my profile</Link>}</div>
      <nav aria-label="Settings groups" className="divide-y divide-border">{SETTINGS_SECTIONS.map(item => <Link key={item.id} href={`/dashboard?section=${item.id}`} className="flex items-center justify-between gap-4 py-5"><span><span className="block font-semibold">{item.title}</span><span className="block text-sm text-text-muted">{item.description}</span></span><span aria-hidden="true">→</span></Link>)}</nav>
    </> : section.id === 'security' ? <>
      <p className="break-words text-sm">Signed in as {user.email}</p>
      <Link className="inline-block min-h-11 py-2 underline" href="/update-password">Change password</Link>
      <section className="border-t border-border pt-5"><h2 className="font-semibold">Sign out or switch account</h2><p className="mb-3 mt-2 text-sm text-text-muted">Sign out, then sign in with the account you want to use.</p><LogoutButton /></section>
    </> : <>
      {!profile && section.id !== 'profile' ? <p>Create your <Link className="underline" href="/dashboard?section=profile">profile</Link> first.</p> : <SettingsForm key={`${section.id}:${profile?.username ?? ''}`} action={saveAccountSettings}>
        <input type="hidden" name="section" value={section.id} />
        {section.id === 'profile' && <>
          <label className="block text-sm font-medium">Username<input className={input} name="username" required pattern="[a-zA-Z0-9_]{3,30}" maxLength={30} defaultValue={profile?.username ?? ''} aria-describedby="username-help" /><span id="username-help" className="mt-1 block text-sm font-normal text-text-muted">3–30 letters, numbers or underscores. This is your profile address.</span></label>
          <label className="block text-sm font-medium">Display name<input className={input} name="display_name" maxLength={80} defaultValue={profile?.display_name ?? ''} /></label>
          <label className="block text-sm font-medium">Musical bio<textarea className={input} rows={4} name="bio" maxLength={500} defaultValue={profile?.bio ?? ''} aria-describedby="bio-help" /><span id="bio-help" className="mt-1 block font-normal text-text-muted">Up to 500 characters. Share favourite styles, traditions or location only if you want them public. Visibility is controlled in Privacy and sharing.</span></label>
        </>}
        {section.id === 'privacy' && PRIVACY_OPTIONS.map(([name,title,description]) => <label key={name} className="flex min-h-11 items-start gap-3 border-b border-border py-3"><input type="checkbox" name={name} defaultChecked={profile?.[name] ?? false} aria-describedby={`${name}-help`} className="mt-1 size-5 shrink-0" /><span><span className="block font-medium">{title}</span><span id={`${name}-help`} className="block text-sm text-text-muted">{description}</span></span></label>)}
        {section.id === 'practice' && <label className="flex gap-3"><input className="size-5 shrink-0" type="checkbox" name="practice_diary_enabled" defaultChecked={profile?.practice_diary_enabled ?? false} aria-describedby="diary-help" /><span>Enable Practice Diary<span id="diary-help" className="mt-1 block text-sm text-text-muted">Keep dated practice notes. This preference does not change Stage, due dates or review scheduling.</span></span></label>}
        {section.id === 'notifications' && <>
          {NOTIFICATION_OPTIONS.map(([name,title,description]) => <label key={name} className="flex gap-3 border-b border-border py-3"><input className="mt-1 size-5 shrink-0" type="checkbox" name={name} defaultChecked={notificationPreferences[name]} aria-describedby={`${name}-help`} /><span><span className="block font-medium">{title}</span><span id={`${name}-help`} className="block text-sm text-text-muted">{description}</span></span></label>)}
          <label className="block text-sm">Digest frequency<select name="digest_frequency" className={input} defaultValue={notificationPreferences.digest_frequency}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="never">Off</option></select></label>
        </>}
      </SettingsForm>}
      {section.id === 'profile' && <InstrumentSettings instruments={instruments} />}
      {section.id === 'profile' && profile?.username && <Link className="block min-h-11 py-2 text-sm underline" href={`/users/${encodeURIComponent(profile.username)}?preview=public`}>Preview public profile</Link>}
      {nextPath && <Link className="block underline" href={nextPath}>Continue to your tunebook</Link>}
    </>}
  </main>
}
