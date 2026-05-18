import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import { COMPARE_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import type { PageOptionsPreferences } from "@/lib/page-options/types"

type ComparePageHeaderProps = {
  pagePreferences: PageOptionsPreferences
  redirectTo: string
}

export default function ComparePageHeader({
  pagePreferences,
  redirectTo,
}: ComparePageHeaderProps) {
  return (
    <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Compare Tunes
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Build a group, then see the tunes common to everyone in it.
          </p>
        </div>

        <PageOptionsModal
          config={COMPARE_PAGE_OPTIONS_CONFIG}
          preferences={pagePreferences}
          redirectTo={redirectTo}
        />
      </div>
    </section>
  )
}