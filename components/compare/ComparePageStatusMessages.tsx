import CompareStatusMessage from "@/components/compare/CompareStatusMessage"
import type { CompareError } from "@/lib/loaders/compare"

type ComparePageStatusMessagesProps = {
  friendRequestStatus: string
  error: CompareError
  primarySearchValue: string
}

export default function ComparePageStatusMessages({
  friendRequestStatus,
  error,
  primarySearchValue,
}: ComparePageStatusMessagesProps) {
  return (
    <>
      {friendRequestStatus === "sent" ? (
        <CompareStatusMessage tone="success">
          Friend request sent.
        </CompareStatusMessage>
      ) : null}

      {friendRequestStatus === "missing_user" ? (
        <CompareStatusMessage tone="warning">
          Please choose a valid player.
        </CompareStatusMessage>
      ) : null}

      {friendRequestStatus === "self" ? (
        <CompareStatusMessage tone="warning">
          You cannot send a friend request to yourself.
        </CompareStatusMessage>
      ) : null}

      {friendRequestStatus === "not_found" ? (
        <CompareStatusMessage tone="error">
          That player could not be found.
        </CompareStatusMessage>
      ) : null}

      {friendRequestStatus === "duplicate" ? (
        <CompareStatusMessage tone="neutral">
          A pending or accepted connection already exists with that player.
        </CompareStatusMessage>
      ) : null}

      {error === "missing_search" ? (
        <CompareStatusMessage tone="neutral">
          Search for a player to start comparing.
        </CompareStatusMessage>
      ) : null}

      {error === "user_not_found" ? (
        <CompareStatusMessage tone="error">
          No player found for “{primarySearchValue}”.
        </CompareStatusMessage>
      ) : null}

      {error === "self_compare" ? (
        <CompareStatusMessage tone="warning">
          You cannot add your own profile to the compare group.
        </CompareStatusMessage>
      ) : null}
    </>
  )
}
