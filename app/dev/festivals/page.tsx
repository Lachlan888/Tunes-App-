import Link from "next/link"
import FestivalManager from "@/components/dev/FestivalManager"
import PageHeader from "@/components/ui/PageHeader"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadFestivalOwnerFoundation } from "@/lib/loaders/festivals"

export const dynamic = "force-dynamic"

export default async function FestivalFoundationPage() {
  const { settings, festivals, collections, sessions, sessionCollections, publicLists } = await loadFestivalOwnerFoundation()
  const selectedFestival = festivals.find(
    (festival) => festival.id === settings.selected_festival_id
  )

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-foreground md:px-6 md:py-8">
      <PageHeader
        title="Festival hub"
        actions={
          <Link href="/dev" className={buttonStyles.secondary}>
            Back to operations
          </Link>
        }
      />
      <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        Owner-only editing and preview.
      </p>

      <section className="grid gap-5 border-t border-hairline sm:grid-cols-3" aria-label="Festival foundation status">
        <div className="border-b border-hairline py-4">
          <p className="text-sm font-semibold text-muted-foreground">Festival mode</p>
          <p className="mt-2 font-sans text-3xl font-bold">{settings.mode_enabled ? "On" : "Off"}</p>
        </div>
        <div className="border-b border-hairline py-4">
          <p className="text-sm font-semibold text-muted-foreground">Selected hub</p>
          <p className="mt-2 font-sans text-2xl font-bold">{selectedFestival?.name ?? "None"}</p>
        </div>
        <div className="border-b border-hairline py-4">
          <p className="text-sm font-semibold text-muted-foreground">Festival records</p>
          <p className="mt-2 font-sans text-3xl font-bold">{festivals.length}</p>
        </div>
      </section>

      <section className="mt-8">
        <FestivalManager
          settings={settings}
          festivals={festivals}
          collections={collections}
          sessions={sessions}
          sessionCollections={sessionCollections}
          publicLists={publicLists}
        />
      </section>
    </main>
  )
}
