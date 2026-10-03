export const MAX_COMPARE_PEERS = 7

export function getSuggestedCompareAction(
  selectedUsers: string[],
  suggestedUsername: string
) {
  const nextUsers = selectedUsers.map((user) => user.trim()).filter(Boolean)
  const safeSuggestedUsername = suggestedUsername.trim()
  const alreadySelected = nextUsers.some(
    (user) => user.toLowerCase() === safeSuggestedUsername.toLowerCase()
  )

  if (alreadySelected) {
    return { disabled: true, label: "Already added", nextUsers }
  }

  if (!safeSuggestedUsername || nextUsers.length >= MAX_COMPARE_PEERS) {
    return { disabled: true, label: "Comparison full", nextUsers }
  }

  return {
    disabled: false,
    label: nextUsers.length === 0 ? "Compare" : "Add to comparison",
    nextUsers: [...nextUsers, safeSuggestedUsername],
  }
}
