import type {
  PageColumnMode,
  PageDensity,
  PageLayoutPresetId,
  PageOptionsPreferences,
  PageVisibleSections,
} from "@/lib/page-options/types"

const DEFAULT_COLUMN_MODE: PageColumnMode = "auto"
const DEFAULT_DENSITY: PageDensity = "standard"

export function visibleSections(
  sections: Record<string, boolean>
): PageVisibleSections {
  return sections
}

export function preferences(options: {
  layoutPreset: PageLayoutPresetId
  columnMode?: PageColumnMode
  density?: PageDensity
  visibleSections: PageVisibleSections
}): PageOptionsPreferences {
  return {
    layoutPreset: options.layoutPreset,
    columnMode: options.columnMode ?? DEFAULT_COLUMN_MODE,
    density: options.density ?? DEFAULT_DENSITY,
    visibleSections: options.visibleSections,
  }
}