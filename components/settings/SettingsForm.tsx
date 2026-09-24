'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import SubmitButton from '@/components/SubmitButton'

export default function SettingsForm({children, action, label = 'Save settings', resetOnSuccess = false, onSaved}: {
  children: ReactNode
  action: (form: FormData) => Promise<{error?:string;saved?:boolean}>
  label?: string
  resetOnSuccess?: boolean
  onSaved?: () => void
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const baseline = useRef('')
  const [dirty,setDirty] = useState(false)
  const [pending,setPending] = useState(false)
  const [message,setMessage] = useState('')
  const [error,setError] = useState(false)
  const serialize = (form: HTMLFormElement) => JSON.stringify([...new FormData(form).entries()])
  function restoreSavedValues() {
    if (!formRef.current) return
    const values = new Map<string, string>(JSON.parse(baseline.current))
    for (const element of Array.from(formRef.current.elements)) {
      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') element.checked = values.get(element.name) === element.value
        else element.value = values.get(element.name) ?? ''
      } else if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = values.get(element.name) ?? ''
      }
    }
  }
  useEffect(() => { if (formRef.current) baseline.current = serialize(formRef.current) }, [])
  useEffect(() => {
    if (!dirty && !pending) return
    const unload = (event: BeforeUnloadEvent) => {event.preventDefault();event.returnValue = ''}
    const click = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href]')
      if (link && (pending || !window.confirm('Leave without saving your changes?'))) {event.preventDefault();event.stopPropagation()}
    }
    const currentUrl = window.location.href
    const currentState = window.history.state
    const back = (event: PopStateEvent) => {
      if (pending || !window.confirm('Leave without saving your changes?')) {
        event.stopImmediatePropagation()
        window.history.pushState(currentState, '', currentUrl)
      }
    }
    window.addEventListener('popstate',back,true)
    window.addEventListener('beforeunload',unload)
    document.addEventListener('click',click,true)
    return () => {window.removeEventListener('popstate',back,true);window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true)}
  },[dirty,pending])
  return <form ref={formRef} onChange={() => {
    if (formRef.current) setDirty(serialize(formRef.current) !== baseline.current)
    setMessage(''); setError(false)
  }} onSubmit={async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (pending) return
    setPending(true);setMessage('');setError(false)
    try {
      const result = await action(form)
      if (result.error) {setError(true);setMessage(result.error)}
      else {
        if (formRef.current) {
          if (resetOnSuccess) formRef.current.reset()
          else for (const element of Array.from(formRef.current.elements)) {
            if (element instanceof HTMLInputElement) {element.defaultValue=element.value;element.defaultChecked=element.checked}
            if (element instanceof HTMLTextAreaElement) element.defaultValue=element.value
            if (element instanceof HTMLSelectElement) for (const option of Array.from(element.options)) option.defaultSelected=option.selected
          }
          baseline.current=serialize(formRef.current)
        }
        setDirty(false);setMessage('Saved.');onSaved?.();router.refresh()
      }
    } catch {setError(true);setMessage('Connection problem. Your changes are still here. Please retry.')}
    finally {setPending(false)}
  }} aria-busy={pending} className="space-y-5">
    <fieldset inert={pending} className="min-w-0 space-y-5">{children}</fieldset>
    <div className="sticky bottom-[var(--navigation-dock-space,0px)] flex flex-wrap items-center gap-3 border-t border-border bg-background py-3">
      <SubmitButton disabled={!dirty && label === 'Save settings'} label={label} pendingLabel="Saving…" forcePending={pending} className="rounded-xl bg-action-primary px-4 py-3 font-semibold text-action-primary-foreground" />
      <p role={error ? 'alert' : 'status'} aria-live="polite" className={`text-sm ${error ? 'text-destructive' : 'text-text-muted'}`}>{pending ? 'Saving…' : message || (dirty ? 'Unsaved changes' : 'All changes saved')}</p>
      {dirty && !pending && <button type="button" className="min-h-11 px-2 underline" onClick={() => {restoreSavedValues();setDirty(false);setMessage('Changes discarded.');setError(false)}}>Discard changes</button>}
    </div>
  </form>
}
