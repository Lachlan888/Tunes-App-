import Link from "next/link"
import FestivalManager from "@/components/dev/FestivalManager"
import PageHeader from "@/components/ui/PageHeader"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadFestivalOwnerFoundation } from "@/lib/loaders/festivals"
import { resolveFestivalWorkspace } from "@/lib/festivals/workspace"

export const dynamic = "force-dynamic"

type FestivalPageProps = {
  searchParams?: Promise<{ festival?: string | string[]; tab?: string | string[] }>
}

export default async function FestivalFoundationPage({ searchParams }: FestivalPageProps) {
  const { settings, festivals, collections, sessions, sessionCollections, publicLists } = await loadFestivalOwnerFoundation()
  const workspace = resolveFestivalWorkspace(searchParams ? await searchParams : {}, settings.selected_festival_id, festivals)
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-foreground md:px-6 md:py-8">
      <PageHeader
        title="Festival management"
        actions={
          <Link href="/dev" className={buttonStyles.secondary}>
            Back to operations
          </Link>
        }
      />
      <p className="-mt-2 mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
        Owner-only editing and preview. Festival mode is {settings.mode_enabled ? "On" : "Off"} on Home.
      </p>
      <section>
        <FestivalManager
          settings={settings}
          festivals={festivals}
          collections={collections}
          sessions={sessions}
          sessionCollections={sessionCollections}
          publicLists={publicLists}
          activeFestivalId={workspace.festivalId}
          activeTab={workspace.tab}
        />
      </section>
    </main>
  )
}
