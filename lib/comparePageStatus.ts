export function getComparePageOptionsMessage(status: string) {
  if (status === "saved") return "Compare display options saved."
  if (status === "reset") return "Compare display options reset."
  if (status === "error") return "Couldn’t save display options."

  return null
}
