import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { PublicFestivalHub } from "@/lib/loaders/festivals"

export default function FestivalPromotion({
  festival,
}: {
  festival: PublicFestivalHub
}) {
  return (
    <section
      className="mb-6 overflow-hidden border-b border-hairline bg-surface-note"
      aria-labelledby="home-festival-title"
    >
      {festival.branding_image_url && festival.branding_alt ? (
        // Supplied festival branding may live on an organiser-controlled host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={festival.branding_image_url}
          alt={festival.branding_alt}
          className="max-h-48 w-full border-b border-hairline object-cover"
        />
      ) : null}
      <div className="p-5 md:flex md:items-center md:justify-between md:gap-6 md:p-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-muted">
            Festival repertoire
          </p>
          <h2 id="home-festival-title" className="mt-2 break-words font-sans text-3xl font-bold text-text-primary">
            {festival.name}
          </h2>
          {festival.description ? (
            <p className="mt-2 line-clamp-2 max-w-3xl break-words text-sm leading-6 text-text-muted">
              {festival.description}
            </p>
          ) : null}
        </div>
        <Link href={`/events/${festival.slug}`} className={`${buttonStyles.primary} mt-4 shrink-0 md:mt-0`}>
          Explore the festival hub
        </Link>
      </div>
    </section>
  )
}
