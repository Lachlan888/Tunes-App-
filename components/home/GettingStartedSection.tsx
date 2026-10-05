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
    <li className="flex gap-3 border-b border-hairline py-4">
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
              className="inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
            />
          )}
        </div>
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

  return (
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="mt-1 font-sans text-3xl font-bold">Get started</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Start by adding a few tunes, making a list, or beginning
              practice. Home will update as you go.
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Progress: {state.completedCount} of {state.totalCount} complete
            </p>
          </div>

          {state.nextTask && (
            <div className="w-full border-l-2 border-action-primary bg-surface-note p-5 sm:w-80">
              <p className="text-sm font-semibold text-muted-foreground">
                Next step
              </p>
              <p className="mt-2 font-sans text-xl font-bold">
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
                  className="inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TASK_GROUPS.map((group) => {
            const tasks = state.tasks.filter((task) => task.group === group)

            return (
              <section key={group}>
                <h3 className="mb-3 font-sans text-xl font-bold">{group}</h3>
                <ul className="border-t border-hairline">
                  {tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </section>
  )
}
