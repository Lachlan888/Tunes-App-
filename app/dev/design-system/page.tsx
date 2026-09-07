import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import SessionDockShowcase from "@/components/session-dock/SessionDockShowcase"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { cardStyles } from "@/components/ui/cardStyles"
import { formStyles } from "@/components/ui/formStyles"
import PageHeader from "@/components/ui/PageHeader"
import RecoveryState from "@/components/ui/RecoveryState"
import SectionHeader from "@/components/ui/SectionHeader"
import { LoadingState, Skeleton } from "@/components/ui/Skeleton"
import StatusMark, { type StatusTone } from "@/components/ui/StatusMark"
import { requireAppAdmin } from "@/lib/auth/roles"

const swatches = [
  ["Canvas parchment", "bg-surface-canvas", "#F4EFE4"],
  ["Raised paper", "bg-surface-paper", "#FFFDF8"],
  ["Soft field note", "bg-surface-note", "#E9E1D3"],
  ["Ink", "bg-text-primary", "#25231F"],
  ["Muted ink", "bg-text-muted", "#675F55"],
  ["Hairline", "bg-hairline", "#D3C7B5"],
  ["Primary umber", "bg-action-primary", "#5B4325"],
  ["Known / Solid", "bg-state-known", "#68754A"],
  ["Practice / Reference", "bg-state-practice", "#466A78"],
  ["Due / Stage / Shaky", "bg-state-due", "#C18B32"],
  ["Overdue / Rough", "bg-state-overdue", "#A9533E"],
  ["Social / badges", "bg-state-social", "#755B72"],
  ["Destructive", "bg-action-destructive", "#8E3934"],
] as const

const statuses: Array<[StatusTone, string]> = [
  ["known", "Known"],
  ["practice", "In practice"],
  ["stage", "Stage 2"],
  ["due", "Due today"],
  ["overdue", "Overdue"],
  ["rough", "Rough"],
  ["shaky", "Shaky"],
  ["solid", "Solid"],
  ["social", "Community"],
  ["destructive", "Remove"],
] as const

const routeExamples = [
  {
    label: "Home",
    title: "Continue your session",
    copy: "The Banshee · Stage 3 · due today",
    tone: "due" as const,
    status: "Due today",
  },
  {
    label: "Tunes",
    title: "The Silver Spear",
    copy: "Reel · D major · traditional",
    tone: "known" as const,
    status: "Known",
  },
  {
    label: "Practice",
    title: "Cooley’s Reel",
    copy: "Active queue · 4 of 12",
    tone: "practice" as const,
    status: "In practice",
  },
  {
    label: "Lists",
    title: "Thursday session set",
    copy: "8 tunes · updated yesterday",
    tone: "stage" as const,
    status: "Stage mix",
  },
  {
    label: "Social",
    title: "You share 24 tunes",
    copy: "A useful starting point for your next session",
    tone: "social" as const,
    status: "Community",
  },
] as const

export default async function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") {
    await requireAppAdmin()
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 text-text-primary md:px-6 md:py-10">
      <PageHeader
        title="Semantic folk design system"
        backHref="/dev"
        backLabel="Back to Dev"
      />

      <p className="mb-10 max-w-3xl text-base leading-7 text-text-muted">
        A protected working preview for the foundation shared by Home, Tunes,
        Practice, Lists and Social. Resize the viewport to inspect phone and
        desktop behaviour.
      </p>

      <section className="mb-12">
        <SectionHeader
          title="Foundation colours"
          description="Components consume semantic jobs; hex values live only in the global token layer."
          variant="editorial"
        />
        <div className="grid gap-px overflow-hidden rounded-object border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {swatches.map(([label, className, value]) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-surface-paper p-4"
            >
              <span
                className={`h-10 w-10 shrink-0 rounded-control border border-black/10 ${className}`}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block font-mono text-xs text-text-muted">
                  {value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <SessionDockShowcase />

      <section className="mb-12">
        <SectionHeader
          eyebrow="Tune identity"
          title="The Maid Behind the Bar"
          description="Editorial serif is reserved for tune titles and selected openings. Controls and metadata stay system sans."
          variant="editorial"
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map(([tone, label]) => (
            <StatusMark key={`${tone}-${label}`} tone={tone}>
              {label}
            </StatusMark>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader
          title="Actions and controls"
          description="Compact radii for controls; pills are reserved for the status marks above."
          variant="editorial"
        />
        <div className="flex flex-wrap gap-3">
          <button type="button" className={buttonStyles.primary}>
            Start Practice
          </button>
          <button type="button" className={buttonStyles.practice}>
            Open Reference
          </button>
          <button type="button" className={buttonStyles.social}>
            Share tune
          </button>
          <button type="button" className={buttonStyles.due}>
            Review due tune
          </button>
          <button type="button" className={buttonStyles.secondary}>
            Add to List
          </button>
          <button type="button" className={buttonStyles.destructiveSecondary}>
            Remove
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label>
            <span className={formStyles.label}>Tune title</span>
            <input className={formStyles.input} placeholder="Search tunes" />
          </label>
          <label>
            <span className={formStyles.label}>Stage</span>
            <select className={formStyles.select} defaultValue="2">
              <option value="1">Stage 1</option>
              <option value="2">Stage 2</option>
              <option value="3">Stage 3</option>
            </select>
          </label>
          <label>
            <span className={formStyles.label}>Practice note</span>
            <textarea
              className={`${formStyles.textarea} min-h-11`}
              rows={1}
              placeholder="What needs attention?"
            />
          </label>
        </div>
      </section>

      <section className="mb-12">
        <SectionHeader
          title="Representative route inheritance"
          description="Opaque reading surfaces, hairline rhythm and semantic states across the five primary areas."
          variant="editorial"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {routeExamples.map((example) => (
            <article key={example.label} className={cardStyles.displayCard}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                {example.label}
              </p>
              <h3 className="mt-3 font-serif text-xl font-semibold leading-tight">
                {example.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                {example.copy}
              </p>
              <StatusMark className="mt-4" tone={example.tone}>
                {example.status}
              </StatusMark>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 grid gap-5 lg:grid-cols-3">
        <div>
          <SectionHeader title="Empty state" />
          <EmptyState
            title="No tunes here yet"
            description="Add a tune when you are ready to begin this list."
            primaryActionHref="/library"
            primaryActionLabel="Browse Tunes"
          />
        </div>
        <div>
          <SectionHeader title="Loading state" />
          <LoadingState label="Loading tune list" rows={3} />
        </div>
        <div>
          <SectionHeader title="Recovery state" />
          <RecoveryState
            title="That list is unavailable"
            description="It may have moved or no longer be shared. Return to your lists and choose another."
            primaryActionHref="/learning-lists"
            primaryActionLabel="Back to Lists"
          />
        </div>
      </section>

      <section>
        <SectionHeader title="List rhythm" />
        <div className="divide-y divide-hairline border-y border-hairline">
          {["The Kesh Jig", "Out on the Ocean", "Banish Misfortune"].map(
            (title, index) => (
              <div key={title} className="flex items-center gap-4 py-4">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg font-semibold">{title}</p>
                  <p className="text-sm text-text-muted">
                    {index === 1 ? "Jig · G major" : "Traditional tune"}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <p className="mt-12 text-sm text-text-muted">
        <Link href="/" className={buttonStyles.text}>
          Return to Tunes
        </Link>
      </p>
    </main>
  )
}
