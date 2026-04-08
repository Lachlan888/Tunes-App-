export function normaliseTuneTitle(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\b(a|an|the)\b/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]/g, "")
}