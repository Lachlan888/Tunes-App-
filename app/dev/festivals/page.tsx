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
    <main className="mx-auto max-w-5xl px-6 py-8 text-foreground">
      <PageHeader
        title="Festival hub"
        actions={
          <Link href="/dev" className={buttonStyles.secondary}>
            Back to operations
          </Link>
        }
      />
      <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        Owner-only editing and private preview for reusable festival hubs. New hubs remain Draft until explicitly published.
      </p>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Festival foundation status">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Festival mode</p>
          <p className="mt-2 font-serif text-3xl font-bold">{settings.mode_enabled ? "On" : "Off"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Off keeps the normal Home experience unchanged.</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Selected hub</p>
          <p className="mt-2 font-serif text-2xl font-bold">{selectedFestival?.name ?? "None"}</p>
          <p className="mt-2 text-sm text-muted-foreground">Selecting a hub will not publish it or enable festival mode.</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Festival records</p>
          <p className="mt-2 font-serif text-3xl font-bold">{festivals.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">New hubs start as private drafts.</p>
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
