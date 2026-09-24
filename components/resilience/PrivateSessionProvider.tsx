"use client"

import { createContext, useContext, useMemo, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { privateSessionStorage, purgeTunesSessionStorage } from "@/lib/browser-storage"

const PrivateSessionContext = createContext(privateSessionStorage(null))

export default function PrivateSessionProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  const storage = useMemo(() => privateSessionStorage(userId), [userId])
  useEffect(() => {
    const { data: { subscription } } = createClient().auth.onAuthStateChange((event, session) => {
      if (userId && (event === "SIGNED_OUT" || (event === "SIGNED_IN" && session?.user.id !== userId))) {
        purgeTunesSessionStorage()
        // A full navigation also removes the old account's in-memory route and form state.
        window.location.replace("/login")
      }
    })
    return () => subscription.unsubscribe()
  }, [userId])
  return <PrivateSessionContext.Provider value={storage}>{children}</PrivateSessionContext.Provider>
}

export function usePrivateSessionStorage() { return useContext(PrivateSessionContext) }
