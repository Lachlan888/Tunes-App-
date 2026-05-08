export const VALID_LORE_CATEGORIES = [
  "region",
  "informant",
  "collector",
  "alternate_title",
  "tune_family",
  "story_folklore_note",
] as const

export type LoreCategory = (typeof VALID_LORE_CATEGORIES)[number]

export function isValidLoreCategory(category: string): category is LoreCategory {
  return VALID_LORE_CATEGORIES.includes(category as LoreCategory)
}