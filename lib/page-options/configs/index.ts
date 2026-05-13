import type {
  PageOptionsConfig,
  PageOptionsPreferences,
  PageKey,
} from "@/lib/page-options/types"
import { HOME_PAGE_OPTIONS_CONFIG } from "./home"
import { LIBRARY_PAGE_OPTIONS_CONFIG } from "./library"
import { TUNE_DETAIL_PAGE_OPTIONS_CONFIG } from "./tune-detail"
import { LISTS_PAGE_OPTIONS_CONFIG } from "./lists"
import { PRACTICE_PAGE_OPTIONS_CONFIG } from "./practice"
import { SETLISTS_PAGE_OPTIONS_CONFIG } from "./setlists"
import { BADGES_PAGE_OPTIONS_CONFIG } from "./badges"
import { COMPARE_PAGE_OPTIONS_CONFIG } from "./compare"
import { SHARED_PAGE_OPTIONS_CONFIG } from "./shared-page"
import { PROFILE_PAGE_OPTIONS_CONFIG } from "./profile"
import { MODERATOR_PAGE_OPTIONS_CONFIG } from "./moderator"

export * from "./home"
export * from "./library"
export * from "./tune-detail"
export * from "./lists"
export * from "./practice"
export * from "./setlists"
export * from "./badges"
export * from "./compare"
export * from "./shared-page"
export * from "./profile"
export * from "./moderator"

const PAGE_OPTIONS_CONFIGS: Record<PageKey, PageOptionsConfig> = {
  home: HOME_PAGE_OPTIONS_CONFIG,
  library: LIBRARY_PAGE_OPTIONS_CONFIG,
  tune_detail: TUNE_DETAIL_PAGE_OPTIONS_CONFIG,
  lists: LISTS_PAGE_OPTIONS_CONFIG,
  practice: PRACTICE_PAGE_OPTIONS_CONFIG,
  setlists: SETLISTS_PAGE_OPTIONS_CONFIG,
  badges: BADGES_PAGE_OPTIONS_CONFIG,
  compare: COMPARE_PAGE_OPTIONS_CONFIG,
  shared: SHARED_PAGE_OPTIONS_CONFIG,
  profile: PROFILE_PAGE_OPTIONS_CONFIG,
  moderator: MODERATOR_PAGE_OPTIONS_CONFIG,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isAllowedLayoutPreset(
  value: unknown,
  config: PageOptionsConfig
): value is PageOptionsPreferences["layoutPreset"] {
  return (
    typeof value === "string" &&
    config.presets.some((preset) => preset.id === value)
  )
}

function isAllowedColumnMode(
  value: unknown
): value is PageOptionsPreferences["columnMode"] {
  return (
    value === "auto" ||
    value === "compact" ||
    value === "comfortable" ||
    value === "wide"
  )
}

function isAllowedDensity(
  value: unknown
): value is PageOptionsPreferences["density"] {
  return value === "spacious" || value === "standard" || value === "compact"
}

export function getPageOptionsConfig(
  pageKey: PageKey
): PageOptionsConfig | null {
  return PAGE_OPTIONS_CONFIGS[pageKey] ?? null
}

export function normalisePageOptionsPreferences(
  rawPreferences: unknown,
  config: PageOptionsConfig
): PageOptionsPreferences {
  const defaultPreferences = config.defaultPreferences

  if (!isRecord(rawPreferences)) {
    return defaultPreferences
  }

  const rawVisibleSections = rawPreferences.visibleSections
  const visibleSections: Record<string, boolean> = {}

  for (const section of config.sections) {
    const rawValue = isRecord(rawVisibleSections)
      ? rawVisibleSections[section.id]
      : undefined

    visibleSections[section.id] =
      typeof rawValue === "boolean"
        ? rawValue
        : defaultPreferences.visibleSections[section.id] ?? true
  }

  const layoutPreset = isAllowedLayoutPreset(
    rawPreferences.layoutPreset,
    config
  )
    ? rawPreferences.layoutPreset
    : defaultPreferences.layoutPreset

  const columnMode =
    config.allowColumns && isAllowedColumnMode(rawPreferences.columnMode)
      ? rawPreferences.columnMode
      : defaultPreferences.columnMode

  const density =
    config.allowDensity && isAllowedDensity(rawPreferences.density)
      ? rawPreferences.density
      : defaultPreferences.density

  return {
    layoutPreset,
    columnMode,
    density,
    visibleSections,
  }
}