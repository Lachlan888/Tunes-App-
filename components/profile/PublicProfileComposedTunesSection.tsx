import Link from "next/link"
import TuneCard from "@/components/TuneCard"
import type { PublicProfileComposedTune } from "@/lib/types"

type PublicProfileComposedTunesSectionProps = {
  tunes: PublicProfileComposedTune[]
  displayName: string
}

function getTuneMetadata(tune: PublicProfileComposedTune) {
  return [
    tune.key ? `Key: ${tune.key}` : null,
    tune.style ? `Style: ${tune.style}` : null,
    tune.time_signature ? `Time: ${tune.time_signature}` : null,
  ].filter(Boolean)
}

export default function PublicProfileComposedTunesSection({
  tunes,
  displayName,
}: PublicProfileComposedTunesSectionProps) {
  if (tunes.length === 0) {
    return null
  }

  return (
    <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Composed tunes
          </p>
          <h2 className="mt-2 break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
            Tunes by {displayName}
          </h2>
        </div>

        <span className="w-fit text-sm font-medium text-muted-foreground md:rounded-full md:border md:border-border md:bg-background/70 md:px-3 md:py-1">
          {tunes.length} tune{tunes.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="mt-5 divide-y divide-border md:hidden">
        {tunes.map((tune) => {
          const metadata = getTuneMetadata(tune)

          return (
            <li key={tune.id}>
              <Link
                href={`/library/${tune.id}`}
                className="block py-4 transition hover:text-primary"
              >
                <span className="block break-words font-serif text-xl font-bold leading-tight text-foreground">
                  {tune.title}
                </span>

                {metadata.length > 0 ? (
                  <span className="mt-2 block break-words text-sm leading-6 text-muted-foreground">
                    {metadata.join(" | ")}
                  </span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>

      <ul className="mt-5 hidden grid-cols-1 gap-4 md:grid md:grid-cols-2">
        {tunes.map((tune) => (
          <li key={tune.id}>
            <TuneCard
              id={tune.id}
              title={tune.title}
              keyValue={tune.key}
              style={tune.style}
              timeSignature={tune.time_signature}
              referenceUrl={tune.reference_url}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
