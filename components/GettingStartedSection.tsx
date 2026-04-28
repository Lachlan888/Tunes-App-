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
  "Set up your account",
  "Build repertoire state",
  "Learn the practice loop",
]

function TaskStatusIcon({ isComplete }: { isComplete: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${
        isComplete
          ? "border-green-700 bg-green-50 text-green-800"
          : "border-gray-300 bg-white text-gray-500"
      }`}
    >
      {isComplete ? "✓" : "○"}
    </span>
  )
}

function TaskRow({ task }: { task: GettingStartedTask }) {
  return (
    <li className="flex gap-3 rounded border bg-white p-3">
      <TaskStatusIcon isComplete={task.isComplete} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{task.label}</p>
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          </div>

          {!task.isComplete && (
            <PendingLinkButton
              href={task.href}
              label={task.actionLabel}
              pendingLabel={task.pendingLabel}
              className="rounded border px-3 py-1 text-sm"
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
    <section className="mb-8 rounded-lg border bg-gray-50 p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Get started</h2>
          <p className="mt-2 max-w-2xl text-gray-700">
            Set up enough of the app that it can start acting like your
            repertoire memory system. These steps use the real app, so Home will
            update as soon as you add tunes, start practice, create lists, or
            review.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Progress: {state.completedCount} of {state.totalCount} complete
          </p>
        </div>

        {state.nextTask && (
          <div className="w-full rounded border bg-white p-4 sm:w-72">
            <p className="text-sm font-medium text-gray-600">Next step</p>
            <p className="mt-1 font-semibold">{state.nextTask.label}</p>
            <p className="mt-1 text-sm text-gray-600">
              {state.nextTask.description}
            </p>
            <div className="mt-3">
              <PendingLinkButton
                href={state.nextTask.href}
                label={state.nextTask.actionLabel}
                pendingLabel={state.nextTask.pendingLabel}
                className="rounded bg-black px-4 py-2 text-sm text-white"
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
              <h3 className="mb-3 text-lg font-semibold">{group}</h3>
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
  )
}