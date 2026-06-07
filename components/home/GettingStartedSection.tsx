import PendingLinkButton from "@/components/PendingLinkButton"
import type {
  GettingStartedState,
  GettingStartedTask,
  GettingStartedTaskGroup,
} from "@/lib/types"

type GettingStartedSectionProps = {
  state: GettingStartedState
}

const TASK_GROUPS: GettingStartedTaskGroup[] = [
  "Account setup",
  "Repertoire setup",
  "Practice setup",
]

function TaskStatusIcon({ isComplete }: { isComplete: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
        isComplete
          ? "border-success bg-success text-success-foreground"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {isComplete ? "✓" : "○"}
    </span>
  )
}

function TaskRow({ task }: { task: GettingStartedTask }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4">
      <TaskStatusIcon isComplete={task.isComplete} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">{task.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>

          {!task.isComplete && (
            <PendingLinkButton
              href={task.href}
              label={task.actionLabel}
              pendingLabel={task.pendingLabel}
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          )}
        </div>
      </div>
    </li>
  )
}

function CompactTaskRow({ task }: { task: GettingStartedTask }) {
  return (
    <li className="flex items-start gap-3">
      <TaskStatusIcon isComplete={task.isComplete} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{task.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
      </div>
    </li>
  )
}

export default function GettingStartedSection({
  state,
}: GettingStartedSectionProps) {
  if (!state.shouldShow) {
    return null
  }

  const incompleteTasks = state.tasks.filter((task) => !task.isComplete)
  const afterNextTasks = incompleteTasks
    .filter((task) => task.id !== state.nextTask?.id)
    .slice(0, 3)
  const progressPercent =
    state.totalCount > 0
      ? Math.round((state.completedCount / state.totalCount) * 100)
      : 0

  return (
    <>
      <section className="mb-6 hidden rounded-3xl border border-border bg-card p-5 shadow-sm md:block">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              First session
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold">
              Start with the next useful step
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Home updates from real app activity as you add tunes, mark Known,
              start Practice, create lists, and review.
            </p>

            {state.nextTask ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Next step
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold">
                    {state.nextTask.label}
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {state.nextTask.description}
                  </p>
                </div>

                <PendingLinkButton
                  href={state.nextTask.href}
                  label={state.nextTask.actionLabel}
                  pendingLabel={state.nextTask.pendingLabel}
                  className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </div>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                {state.completedCount} of {state.totalCount} complete
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {progressPercent}%
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {afterNextTasks.length > 0 ? (
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  After that
                </p>
                <ul className="space-y-3">
                  {afterNextTasks.map((task) => (
                    <CompactTaskRow key={task.id} task={task} />
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:hidden">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              First session
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold">Get started</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Set up enough of the app that it can start acting like your
              repertoire memory system. These steps use the real app, so Home
              updates as soon as you add tunes, start practice, create lists,
              or review.
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Progress: {state.completedCount} of {state.totalCount} complete
            </p>
          </div>

          {state.nextTask && (
            <div className="w-full rounded-2xl border border-border bg-background/70 p-5 sm:w-80">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Next step
              </p>
              <p className="mt-2 font-serif text-xl font-bold">
                {state.nextTask.label}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {state.nextTask.description}
              </p>
              <div className="mt-4">
                <PendingLinkButton
                  href={state.nextTask.href}
                  label={state.nextTask.actionLabel}
                  pendingLabel={state.nextTask.pendingLabel}
                  className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {TASK_GROUPS.map((group) => {
            const tasks = state.tasks.filter((task) => task.group === group)

            return (
              <section key={group}>
                <h3 className="mb-3 font-serif text-xl font-bold">{group}</h3>
                <ul className="space-y-3">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </section>
    </>
  )
}
