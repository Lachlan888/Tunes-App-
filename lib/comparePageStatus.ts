export function getComparePageOptionsMessage(status: string) {
  if (status === "saved") return "Compare page options saved."
  if (status === "reset") return "Compare page options reset."
  if (status === "error") return "Could not save Compare page options."

  return null
}