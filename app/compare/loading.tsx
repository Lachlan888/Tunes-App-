import RouteLoadingShell from "@/components/RouteLoadingShell"

export default function CompareLoading() {
  return (
    <RouteLoadingShell
      label="Compare"
      title="Loading comparison"
      description="Checking player profiles, shared repertoire, filters, and common tunes."
      primarySectionTitle="Players"
      secondarySectionTitle="Common tunes"
      mode="split"
    />
  )
}