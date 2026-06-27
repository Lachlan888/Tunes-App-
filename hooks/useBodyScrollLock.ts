"use client"

import { useEffect } from "react"

const activeLocks = new Set<symbol>()
let previousBodyOverflow: string | null = null

function acquireBodyScrollLock(lockId: symbol) {
  if (typeof document === "undefined") return

  if (activeLocks.has(lockId)) return

  if (activeLocks.size === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }

  activeLocks.add(lockId)
}

function releaseBodyScrollLock(lockId: symbol) {
  if (typeof document === "undefined") return

  if (!activeLocks.delete(lockId)) return

  if (activeLocks.size === 0) {
    document.body.style.overflow = previousBodyOverflow ?? ""
    previousBodyOverflow = null
  }
}

export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    const lockId = Symbol("body-scroll-lock")

    acquireBodyScrollLock(lockId)

    return () => {
      releaseBodyScrollLock(lockId)
    }
  }, [isLocked])
}
