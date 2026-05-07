import RouteLoadingShell from "@/components/RouteLoadingShell"

export default function ReviewLoading() {
  return (
    <RouteLoadingShell
      label="Practice"
      title="Loading today’s practice"
      description="Checking due tunes, catch-up work, active practice items, and streak state."
      primarySectionTitle="Due next"
      secondarySectionTitle="Practice state"
      mode="split"
    />
  )
}