'use client'
import { useState } from 'react'
import SettingsForm from './SettingsForm'
import { saveProfileInstrument } from '@/lib/actions/account-settings'
import type { UserInstrument } from '@/lib/types'

export default function InstrumentSettings({instruments}: {instruments:UserInstrument[]}) {
  const [removeId,setRemoveId] = useState<number | null>(null)
  return <section className="space-y-3 border-t border-border pt-5"><h2 className="text-lg font-semibold">Instruments</h2>
    <ul className="divide-y divide-border">{instruments.map(instrument => <li key={instrument.id} className="flex items-center justify-between gap-3 py-2"><span>{instrument.instrument_name}</span><button type="button" className="min-h-11 px-2 text-sm underline" onClick={() => setRemoveId(instrument.id)}>Remove<span className="sr-only"> {instrument.instrument_name}</span></button></li>)}</ul>
    {removeId !== null && <div className="rounded-xl border border-destructive p-4"><p>Remove {instruments.find(i => i.id === removeId)?.instrument_name} from your profile?</p><SettingsForm action={saveProfileInstrument} label="Confirm removal" onSaved={() => setRemoveId(null)}><input type="hidden" name="remove_id" value={removeId} /></SettingsForm><button type="button" onClick={() => setRemoveId(null)} className="min-h-11 underline">Cancel</button></div>}
    <SettingsForm action={saveProfileInstrument} label="Add instrument" resetOnSuccess><label className="block text-sm">Instrument name<input name="instrument_name" required maxLength={80} className="mt-1 block w-full rounded-xl border border-border bg-surface px-3 py-3" /></label></SettingsForm>
  </section>
}
