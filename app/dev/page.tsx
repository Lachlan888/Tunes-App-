import DevSummaryCards from "@/components/dev/DevSummaryCards"
import FeatureUsagePanel from "@/components/dev/FeatureUsagePanel"
import FeedbackInbox from "@/components/dev/FeedbackInbox"
import MetricVisualiser from "@/components/dev/MetricVisualiser"
import UserActivityTable from "@/components/dev/UserActivityTable"
import { loadDevDashboardData } from "@/lib/loaders/dev"

type DevPageProps = {
  searchParams?: Promise<{
    dev_feedback?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getStatusMessage(status: string) {
  if (status === "updated") return "Feedback updated."
  if (status === "updated_notified") {
    return "Feedback updated and the submitting user was messaged."
  }
  if (status === "resolved") return "Feedback resolved and archived."
  if (status === "resolved_notified") {
    return "Feedback resolved, archived, and the submitting user was messaged."
  }
  if (status === "missing_feedback") {
    return "Couldn’t tell which feedback item to update."
  }
  if (status === "invalid_status") return "Invalid feedback status."
  if (status === "invalid_priority") return "Invalid feedback priority."
  if (status === "message_error") {
    return "Feedback was updated, but the user message could not be sent."
  }
  if (status === "error") return "Couldn’t update feedback."

  return null
}

export default async function DevPage({ searchParams }: DevPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const statusMessage = getStatusMessage(
    getSingleValue(resolvedSearchParams?.dev_feedback)
  )

  const data = await loadDevDashboardData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Dev
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Beta cockpit
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Review beta feedback, watch feature usage, and check whether the
            app is becoming part of users&apos; real practice behaviour.
          </p>
        </div>

        <div className="mt-6">
          <DevSummaryCards summary={data.summary} />
        </div>
      </section>

      <section className="mb-10">
        <MetricVisualiser visualisations={data.metricVisualisations} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Feedback inbox
        </h2>
        <div className="mt-5">
          <FeedbackInbox feedbackItems={data.feedbackItems} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Feature usage
        </h2>
        <div className="mt-5">
          <FeatureUsagePanel rows={data.featureUsage} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          User activity
        </h2>
        <div className="mt-5">
          <UserActivityTable rows={data.userActivity} />
        </div>
      </section>
    </main>
  )
}
