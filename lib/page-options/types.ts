export type PageKey =
  | "home"
  | "library"
  | "tune_detail"
  | "lists"
  | "practice"
  | "setlists"
  | "badges"
  | "compare"
  | "shared"
  | "profile"
  | "moderator"

export type PageLayoutPresetId =
  | "balanced"
  | "practice_first"
  | "organiser"
  | "social"
  | "minimal"
  | "working"
  | "reference"
  | "community"
  | "catalogue"
  | "management"
  | "review"
  | "triage"
  | "discovery"
  | "settings"
  | "tune_edits"
  | "reports"

export type PageColumnMode = "auto" | "compact" | "comfortable" | "wide"

export type PageDensity = "spacious" | "standard" | "compact"

export type PageVisibleSections = Record<string, boolean>

export type PageOptionsPreferences = {
  layoutPreset: PageLayoutPresetId
  columnMode: PageColumnMode
  density: PageDensity
  visibleSections: PageVisibleSections
}

export type PageOptionsSectionConfig = {
  id: string
  label: string
  description: string
  isCore?: boolean
}

export type PageOptionsPresetConfig = {
  id: PageLayoutPresetId
  label: string
  description: string
  preferences: PageOptionsPreferences
}

export type PageOptionsConfig = {
  pageKey: PageKey
  title: string
  description: string
  helperText: string
  sections: PageOptionsSectionConfig[]
  presets: PageOptionsPresetConfig[]
  defaultPreferences: PageOptionsPreferences
  allowColumns: boolean
  allowDensity: boolean
}