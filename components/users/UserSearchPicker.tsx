"use client"

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type {
  ListShareRecipientSearchResponse,
  ListShareRecipientSearchResult,
} from "@/lib/actions/lists"

type UserSearchPickerProps = {
  learningListId: number
  disabled?: boolean
  searchUsers: (input: {
    learningListId: number
    query: string
    limit?: number
  }) => Promise<ListShareRecipientSearchResponse>
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

function getUserLabel(user: ListShareRecipientSearchResult) {
  return user.displayName || user.username || "Unnamed player"
}

function getUsernameLabel(user: ListShareRecipientSearchResult) {
  return user.username ? `@${user.username}` : "No username"
}

export default function UserSearchPicker({
  learningListId,
  disabled = false,
  searchUsers,
}: UserSearchPickerProps) {
  const inputId = useId()
  const listboxId = useId()
  const [query, setQuery] = useState("")
  const [selectedUser, setSelectedUser] =
    useState<ListShareRecipientSearchResult | null>(null)
  const [results, setResults] = useState<ListShareRecipientSearchResult[]>([])
  const [resultGroup, setResultGroup] =
    useState<ListShareRecipientSearchResponse["group"]>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (selectedUser) return

    const trimmedQuery = query.trim()
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    if (trimmedQuery.length < 2) {
      setResults([])
      setResultGroup(null)
      setErrorMessage(null)
      setHasSearched(false)
      setActiveIndex(-1)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setHasSearched(true)
      setErrorMessage(null)
      setResults([])
      setResultGroup(null)
      setActiveIndex(-1)

      startTransition(async () => {
        const response = await searchUsers({
          learningListId,
          query: trimmedQuery,
          limit: 8,
        })

        if (requestId !== requestIdRef.current) return

        if (response.status === "error") {
          setResults([])
          setResultGroup(null)
          setErrorMessage(response.message ?? "Couldn't search users. Try again.")
          return
        }

        setResults(response.results)
        setResultGroup(response.group)
        setErrorMessage(null)
        setActiveIndex(response.results.length > 0 ? 0 : -1)
      })
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [learningListId, query, searchUsers, selectedUser])

  function selectUser(user: ListShareRecipientSearchResult) {
    setSelectedUser(user)
    setQuery("")
    setResults([])
    setResultGroup(null)
    setErrorMessage(null)
    setHasSearched(false)
    setActiveIndex(-1)
  }

  function changeSelection() {
    setSelectedUser(null)
    setQuery("")
    setResults([])
    setResultGroup(null)
    setErrorMessage(null)
    setHasSearched(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setResults([])
      setResultGroup(null)
      setActiveIndex(-1)
      return
    }

    if (results.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % results.length)
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1
      )
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      selectUser(results[activeIndex])
    }
  }

  if (selectedUser) {
    return (
      <div className="space-y-3">
        <input
          type="hidden"
          name="recipient_user_id"
          value={selectedUser.id}
        />

        <div className="flex flex-col gap-3 border-y border-border/70 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sharing with
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {getUserLabel(selectedUser)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getUsernameLabel(selectedUser)}
            </p>
          </div>

          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={changeSelection}
            disabled={disabled}
          >
            Change
          </button>
        </div>

        <SubmitButton
          label="Share access"
          pendingLabel="Sharing..."
          className={buttonStyles.primary}
          disabled={disabled}
        />
      </div>
    )
  }

  const showResults = results.length > 0
  const showEmpty =
    hasSearched && !isPending && !errorMessage && query.trim().length >= 2
  const groupLabel = resultGroup === "friends" ? "Friends" : "Other users"

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Search friends or users
        </label>
        <input
          id={inputId}
          value={query}
          onChange={(event) => {
            setSelectedUser(null)
            setQuery(event.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by name or username"
          className={inputClass}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-${results[activeIndex].id}` : undefined
          }
        />
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Searching...</p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      {showResults ? (
        <div
          id={listboxId}
          role="listbox"
          className="max-h-72 overflow-y-auto divide-y divide-border/70 border-y border-border/70"
        >
          <p className="py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {groupLabel}
          </p>

          {results.map((user, index) => {
            const isActive = activeIndex === index

            return (
              <button
                key={user.id}
                id={`${listboxId}-${user.id}`}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`flex min-h-16 w-full flex-col items-start justify-center gap-1 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                  isActive ? "bg-muted/70" : "hover:bg-muted/50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectUser(user)}
                disabled={disabled}
              >
                <span className="text-sm font-medium text-foreground">
                  {getUserLabel(user)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {getUsernameLabel(user)}
                  {user.isFriend ? " · Friend" : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : showEmpty ? (
        <p className="text-sm text-muted-foreground">No users found.</p>
      ) : null}

      <SubmitButton
        label="Share access"
        pendingLabel="Sharing..."
        className={buttonStyles.primary}
        disabled
      />
    </div>
  )
}
