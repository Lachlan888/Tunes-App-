import Link from "next/link"
import { notFound } from "next/navigation"
import { buttonStyles } from "@/components/ui/buttonStyles"
import FestivalSessions from "@/components/events/FestivalSessions"
import {
  loadPublicFestivalFoundation,
  type PublicFestivalCollection,
} from "@/lib/loaders/festivals"

export const dynamic = "force-dynamic"

type FestivalPageProps = {
  params: Promise<{ slug: string }>
}

const collectionSections = [
  { kind: "artist", label: "Artists and leaders" },
  { kind: "tradition", label: "Traditions" },
  { kind: "general", label: "More festival repertoire" },
] as const

function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`))
}

function CollectionCard({ collection }: { collection: PublicFestivalCollection }) {
  const title = collection.display_title || collection.learning_list.name
  return (
    <article className="flex h-full min-w-0 flex-col border-b border-hairline py-5 first:border-t">
      <div className="flex flex-wrap gap-2 text-xs font-semibold  tracking-[0.12em] text-text-muted">
        {collection.tradition_label ? <span>{collection.tradition_label}</span> : null}
        {collection.display_credit ? <span>Curated by {collection.display_credit}</span> : null}
      </div>
      <h3 className="mt-3 break-words font-sans text-2xl font-bold leading-tight text-text-primary">
        {title}
      </h3>
      {collection.learning_list.description ? (
        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-text-muted">
          {collection.learning_list.description}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-6 text-text-muted">
        Suggested repertoire for listening and learning—not a fixed setlist.
      </p>
      <Link
        href={`/public-lists/${collection.learning_list.id}`}
        className={`${buttonStyles.secondaryStrong} mt-5 sm:w-full`}
      >
        Explore tunes and references
      </Link>
    </article>
  )
}

export default async function FestivalPage({ params }: FestivalPageProps) {
  const { slug } = await params
  const result = await loadPublicFestivalFoundation(slug)
  if (result.status === "not_found") notFound()

  const { festival, collections, sessions } = result
  const hasHubContent = collections.length > 0 || sessions.length > 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 text-text-primary md:px-6 md:py-10">
      <header className="overflow-hidden border-y border-hairline">
        {festival.branding_image_url && festival.branding_alt ? (
          // Supplied festival branding may live on an organiser-controlled host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={festival.branding_image_url}
            alt={festival.branding_alt}
            className="max-h-72 w-full border-b border-hairline object-cover"
          />
        ) : null}
        <div className="p-5 sm:p-8 md:p-10">
          <h1 className="max-w-4xl break-words font-sans text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {festival.name}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{[festival.lifecycle === "archived" ? "Festival archive" : "Festival hub", festival.curator_credit ? `Curated by ${festival.curator_credit}` : null].filter(Boolean).join(" · ")}</p>
          {festival.description ? (
            <p className="mt-5 max-w-3xl break-words text-base leading-7 text-text-muted md:text-lg">
              {festival.description}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {festival.programme_url ? (
              <a href={festival.programme_url} className={buttonStyles.secondaryStrong} rel="noreferrer" target="_blank">
                Official programme
              </a>
            ) : null}
            <Link href="/compare" className={buttonStyles.secondary}>
              Find tunes in common
            </Link>
          </div>
        </div>
      </header>

      <section className="mt-7 border-y border-hairline bg-surface-note/60 px-1 py-5 md:px-4 md:py-6" aria-labelledby="festival-context-title">
        <h2 id="festival-context-title" className="font-sans text-2xl font-bold">Before you join in</h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-text-muted md:text-base">
          Some tunes to get familiar with before joining in. Every session takes its own direction. These collections are suggested repertoire, not guaranteed setlists or a record of what was played.
        </p>
        <p className="mt-3 text-sm font-medium text-text-primary">
          Met someone to play with? Use Compare to find tunes you both know.
        </p>
      </section>

      {sessions.length > 0 ? (
        <section className="mt-10" aria-labelledby="session-preview-title">
          <div className="max-w-3xl">
            <h2 id="session-preview-title" className="font-sans text-3xl font-bold md:text-4xl">Playing together</h2>
            <p className="mt-2 text-sm font-semibold text-text-muted">Programme sessions</p>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Times are shown in {festival.timezone} as programme information
              {festival.programme_snapshot_date ? ` from the ${formatSnapshotDate(festival.programme_snapshot_date)} snapshot` : " from the available programme snapshot"}.
              {festival.programme_url ? " Check the official programme for changes." : " Details may change."}
            </p>
          </div>
          <FestivalSessions sessions={sessions} />
        </section>
      ) : null}

      {collectionSections.map(({ kind, label }) => {
        const sectionCollections = collections.filter((collection) => collection.collection_kind === kind)
        if (sectionCollections.length === 0) return null
        return (
          <section className="mt-10" key={kind} aria-labelledby={`collections-${kind}`}>
            <h2 id={`collections-${kind}`} className="font-sans text-3xl font-bold md:text-4xl">{label}</h2>
            <div className="mt-5 divide-y divide-hairline sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
              {sectionCollections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
            </div>
          </section>
        )
      })}

      {!hasHubContent ? (
        <section className="mt-10 border-y border-dashed border-hairline bg-surface-note/60 py-6 text-center">
          <h2 className="font-sans text-2xl font-bold">Collections are being prepared</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-muted">
            There are no published repertoire collections or programme sessions here yet. Check back when the festival shares more details.
          </p>
        </section>
      ) : null}

      <footer className="mt-12 border-t border-hairline pt-6 text-sm leading-6 text-text-muted">
        <p>
          This page preserves curated repertoire and programme snapshot context. It does not confirm who attended or which tunes were played.
        </p>
      </footer>
    </main>
  )
}
