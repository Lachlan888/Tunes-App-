"use client"

import { useEffect } from "react"

export default function useScrollToPiece(scrollPieceId: string) {
  useEffect(() => {
    if (!scrollPieceId) return

    const element = document.getElementById(`piece-${scrollPieceId}`)

    if (!element) return

    requestAnimationFrame(() => {
      element.scrollIntoView({
        block: "center",
      })
    })
  }, [scrollPieceId])
}