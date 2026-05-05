"use client"

import { useEffect, useRef, type TextareaHTMLAttributes } from "react"

type AutoGrowMessageTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function AutoGrowMessageTextarea({
  className,
  rows = 3,
  ...props
}: AutoGrowMessageTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  function resizeTextarea() {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  useEffect(() => {
    resizeTextarea()
  }, [])

  return (
    <textarea
      ref={textareaRef}
      rows={rows}
      onInput={resizeTextarea}
      className={className}
      {...props}
    />
  )
}