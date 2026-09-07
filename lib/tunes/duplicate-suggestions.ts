import { normaliseTuneTitle } from "../normalise.ts"

export const DUPLICATE_CANDIDATE_LIMIT = 2_000
export const DUPLICATE_SUGGESTION_LIMIT = 5

export type TuneDuplicateCandidate = {
  id: number
  title: string
  alternate_titles?: string | null
  type?: string | null
  key?: string | null
  style?: string | null
  time_signature?: string | null
  composer?: string | null
}

export type TuneDuplicateSuggestion = TuneDuplicateCandidate & {
  reason: string
  confidence: "exact" | "likely"
  score: number
}

function splitAliases(value: string | null | undefined) {
  return (value ?? "")
    .split(/[;,|]/)
    .map((alias) => alias.trim())
    .filter(Boolean)
}

function words(value: string) {
  return value
    .toLocaleLowerCase("en")
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !["a", "an", "the"].includes(word))
}

function levenshteinDistance(first: string, second: string) {
  if (!first) return second.length
  if (!second) return first.length

  const previous = Array.from({ length: second.length + 1 }, (_, index) => index)

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex]

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const substitutionCost =
        first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1
      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] + substitutionCost
      )
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[second.length]
}

function scoreTitle(query: string, candidate: string) {
  const queryNormalised = normaliseTuneTitle(query)
  const candidateNormalised = normaliseTuneTitle(candidate)

  if (!queryNormalised || !candidateNormalised) return 0
  if (queryNormalised === candidateNormalised) return 1

  const shorterLength = Math.min(queryNormalised.length, candidateNormalised.length)
  if (
    shorterLength >= 4 &&
    (queryNormalised.includes(candidateNormalised) ||
      candidateNormalised.includes(queryNormalised))
  ) {
    return 0.88 * (shorterLength / Math.max(queryNormalised.length, candidateNormalised.length)) + 0.1
  }

  const maxLength = Math.max(queryNormalised.length, candidateNormalised.length)
  const editSimilarity =
    maxLength === 0
      ? 0
      : 1 - levenshteinDistance(queryNormalised, candidateNormalised) / maxLength
  const queryWords = new Set(words(query))
  const candidateWords = new Set(words(candidate))
  const sharedWords = [...queryWords].filter((word) => candidateWords.has(word))
  const wordSimilarity =
    Math.max(queryWords.size, candidateWords.size) === 0
      ? 0
      : sharedWords.length / Math.max(queryWords.size, candidateWords.size)

  return Math.max(editSimilarity, wordSimilarity * 0.82)
}

export function getTuneDuplicateSuggestions(
  query: string,
  candidates: TuneDuplicateCandidate[],
  limit = DUPLICATE_SUGGESTION_LIMIT
) {
  const trimmedQuery = query.trim()
  if (normaliseTuneTitle(trimmedQuery).length < 3) return []

  return candidates
    .flatMap((candidate): TuneDuplicateSuggestion[] => {
      const titleScore = scoreTitle(trimmedQuery, candidate.title)
      const aliases = splitAliases(candidate.alternate_titles)
      const aliasScores = aliases.map((alias) => ({
        alias,
        score: scoreTitle(trimmedQuery, alias),
      }))
      const bestAlias = aliasScores.sort((a, b) => b.score - a.score)[0]
      const score = Math.max(titleScore, bestAlias?.score ?? 0)

      if (score < 0.72) return []

      const exactTitle = titleScore === 1
      const exactAlias = bestAlias?.score === 1
      const reason = exactTitle
        ? "Same title after ignoring articles and punctuation."
        : exactAlias
          ? `Matches the alternate title “${bestAlias.alias}”.`
          : bestAlias && bestAlias.score > titleScore
            ? `Very similar to the alternate title “${bestAlias.alias}”.`
            : "Very similar title; check key, style and source."

      return [
        {
          ...candidate,
          reason,
          confidence: exactTitle || exactAlias ? "exact" : "likely",
          score,
        },
      ]
    })
    .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
    .slice(0, Math.max(0, limit))
}

export function findExactTuneDuplicate(
  title: string,
  candidates: TuneDuplicateCandidate[]
) {
  return getTuneDuplicateSuggestions(title, candidates, candidates.length).find(
    (suggestion) => suggestion.confidence === "exact"
  ) ?? null
}
