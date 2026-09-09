import RouteLoadingShell from "@/components/RouteLoadingShell"

export default function ReferenceMediaLoading() {
  return (
    <RouteLoadingShell
      label="Reference Mode"
      title="Opening the recording workspace"
      description="Loading the selected source, saved passages and practice controls."
      primarySectionTitle="media player"
      secondarySectionTitle="saved passages"
      mode="split"
    />
  )
}
