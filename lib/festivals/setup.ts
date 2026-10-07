type SetupFestival = {
  name: string
  slug: string
  timezone: string
  branding_image_url: string | null
  programme_url: string | null
  programme_snapshot_date: string | null
}

export function getFestivalSetupSummary(
  festival: SetupFestival,
  collections: Array<{ id: number }>,
  sessions: Array<{ id: number; needs_review: boolean }>
) {
  const heldSessions = sessions.filter((session) => session.needs_review).length
  const publicSessions = sessions.length - heldSessions
  return {
    details: festival.name && festival.slug && festival.timezone ? "Saved" : "Needs details",
    branding: festival.branding_image_url ? "Added" : "Not added",
    programme: festival.programme_url && festival.programme_snapshot_date
      ? "Link and snapshot date added"
      : festival.programme_url
        ? "Link added · snapshot date not added"
        : festival.programme_snapshot_date
          ? "Snapshot date added · link not added"
          : "Not added",
    repertoire: collections.length === 0
      ? "No public lists attached"
      : `${collections.length} public ${collections.length === 1 ? "list" : "lists"} attached`,
    sessions: sessions.length === 0
      ? "No sessions added"
      : `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}${heldSessions ? ` · ${heldSessions} held for review` : ""}`,
    heldSessions,
    publicContentCount: collections.length + publicSessions,
  }
}
