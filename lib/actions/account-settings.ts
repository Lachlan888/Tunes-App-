'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { settingsPatch } from '@/lib/account-settings'

export async function saveAccountSettings(form: FormData): Promise<{ error?: string; saved?: boolean }> {
  const db = await createClient()
  const { data: {user} } = await db.auth.getUser()
  if (!user) return {error:'Your session ended. Sign in again before saving.'}
  const section = String(form.get('section') ?? '')
  const {patch,error} = settingsPatch(section,form)
  if (error) return {error}
  const previous = await db.from('profiles').select('username').eq('id',user.id).maybeSingle()
  if (previous.error) return {error:'Could not load your settings. Please retry.'}
  if (!previous.data && section !== 'profile') return {error:'Create your profile first.'}
  const table = section === 'notifications' ? 'notification_preferences' : 'profiles'
  const values = {...patch, [section === 'notifications' ? 'user_id' : 'id']: user.id, updated_at:new Date().toISOString()}
  // Updates affect this group only; another settings form cannot reset privacy.
  const result = section === 'notifications' || !previous.data
    ? await db.from(table).upsert(values)
    : await db.from(table).update(patch).eq('id',user.id).select('id').single()
  if (result.error) return {error:result.error.code === '23505' ? 'That username is already taken.' : 'Could not save. Your changes are still here; please retry.'}
  for (const path of ['/dashboard','/friends','/compare','/','/review','/review/diary',`/users/${previous.data?.username ?? ''}`,`/users/${patch.username ?? previous.data?.username ?? ''}`]) revalidatePath(path)
  return {saved:true}
}

export async function saveProfileInstrument(form: FormData): Promise<{ error?: string; saved?: boolean }> {
  const db = await createClient()
  const { data: {user} } = await db.auth.getUser()
  if (!user) return {error:'Sign in again before changing instruments.'}
  const removeId = Number(form.get('remove_id'))
  if (form.has('remove_id')) {
    if (!Number.isSafeInteger(removeId) || removeId <= 0) return {error:'Choose an instrument to remove.'}
    const result = await db.from('user_instruments').delete().eq('id',removeId).eq('user_id',user.id).select('id').maybeSingle()
    if (result.error || !result.data) return {error:'Could not remove that instrument. Refresh and retry.'}
  } else {
    const name = String(form.get('instrument_name') ?? '').trim()
    if (!name || name.length > 80) return {error:'Use an instrument name of 1–80 characters.'}
    const existing = await db.from('user_instruments').select('id,instrument_name').eq('user_id',user.id).limit(21)
    if (existing.error) return {error:'Could not load your instruments.'}
    if ((existing.data?.length ?? 0) >= 20) return {error:'You can list up to 20 instruments.'}
    if (existing.data?.some(row => row.instrument_name.toLowerCase() === name.toLowerCase())) return {error:'That instrument is already listed.'}
    const result = await db.from('user_instruments').insert({user_id:user.id,instrument_name:name,position:existing.data?.length ?? 0})
    if (result.error) return {error:'Could not add the instrument. Please retry.'}
  }
  revalidatePath('/dashboard')
  const profile = await db.from('profiles').select('username').eq('id',user.id).maybeSingle()
  if (profile.data?.username) revalidatePath(`/users/${profile.data.username}`)
  return {saved:true}
}
