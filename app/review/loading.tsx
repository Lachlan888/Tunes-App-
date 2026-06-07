import RouteLoadingShell from "@/components/RouteLoadingShell"

export default function ReviewLoading() {
  return (
    <RouteLoadingShell
      label="Practice"
      title="Loading today’s practice"
      description="Checking due tunes, catch-up work, active practice items, and streaks."
      primarySectionTitle="Due next"
      secondarySectionTitle="Practice status"
      mode="split"
    />
  )
}
