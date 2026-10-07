import Link from "next/link"
import DevSummaryCards from "@/components/dev/DevSummaryCards"
import FeatureUsagePanel from "@/components/dev/FeatureUsagePanel"
import FeedbackInbox from "@/components/dev/FeedbackInbox"
import EmailUsersPanel from "@/components/dev/EmailUsersPanel"
import MetricVisualiser from "@/components/dev/MetricVisualiser"
import UserActivityTable from "@/components/dev/UserActivityTable"
import TestDigestPanel from "@/components/dev/TestDigestPanel"
import FestivalModeControl from "@/components/dev/FestivalModeControl"
import PageHeader from "@/components/ui/PageHeader"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadDevDashboardData } from "@/lib/loaders/dev"
import { loadAdminEmailToolData } from "@/lib/services/admin-email-broadcasts"
import { loadFestivalOwnerLaunch } from "@/lib/loaders/festivals"

type DevPageProps = {
  searchParams?: Promise<{
    dev_feedback?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getStatusMessage(status: string) {
  if (status === "confirmation_required") return "Review the action and confirm its scope before submitting."
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

  const [data, adminEmailData, festivalLaunch] = await Promise.all([
    loadDevDashboardData(),
    loadAdminEmailToolData(),
    loadFestivalOwnerLaunch(),
  ])

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {statusMessage ? (
        <div className="mb-6 border-l-4 border-hairline py-2 pl-3 text-sm font-medium text-foreground">
          {statusMessage}
        </div>
      ) : null}

      <PageHeader
        title="Developer tools"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dev/design-system" className={buttonStyles.secondary}>
              Design system
            </Link>
          </div>
        }
      />

      {festivalLaunch?.status === "ready" ? (
        <div className="mb-8">
          <FestivalModeControl settings={festivalLaunch.settings} festivals={festivalLaunch.festivals} />
        </div>
      ) : festivalLaunch?.status === "unavailable" ? (
        <p className="mb-8 border-y border-hairline py-4 text-sm text-muted-foreground" role="status">
          Festival controls are unavailable. Try reloading this page.
        </p>
      ) : null}

      <section className="mb-8">
        <DevSummaryCards summary={data.summary} />
      </section>

      <section className="mb-10">
        <TestDigestPanel />
      </section>

      <section className="mb-10">
        <EmailUsersPanel
          recipientCounts={adminEmailData.recipientCounts}
          recentBroadcasts={adminEmailData.recentBroadcasts}
        />
      </section>

      <section className="mb-10">
        <MetricVisualiser visualisations={data.metricVisualisations} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Feedback inbox
        </h2>
        <div className="mt-5">
          <FeedbackInbox feedbackItems={data.feedbackItems} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Feature usage
        </h2>
        <div className="mt-5">
          <FeatureUsagePanel rows={data.featureUsage} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          User activity
        </h2>
        <div className="mt-5">
          <UserActivityTable rows={data.userActivity} />
        </div>
      </section>
    </main>
  )
}
