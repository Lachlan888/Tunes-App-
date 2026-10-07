import Link from "next/link"
import type { BadgeAwardWithProfiles } from "@/lib/types"

type BadgeRecipientsListProps = {
  awards: BadgeAwardWithProfiles[]
}

function profileName(profile: BadgeAwardWithProfiles["recipient_profile"]) {
  return profile?.display_name || profile?.username || "Unknown player"
}

function profileHref(profile: BadgeAwardWithProfiles["recipient_profile"]) {
  return profile?.username ? `/users/${encodeURIComponent(profile.username)}` : null
}

export default function BadgeRecipientsList({
  awards,
}: BadgeRecipientsListProps) {
  if (awards.length === 0) {
    return (
      <section className="pb-4">
        <p className="text-sm text-muted-foreground">
          No one has received this badge yet.
        </p>
      </section>
    )
  }

  return (
    <section className="pb-4">
      <ul className="divide-y divide-hairline border-t border-hairline">
        {awards.map((award) => {
          const href = profileHref(award.recipient_profile)

          return (
            <li
              key={award.id}
              className="py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {href ? (
                    <Link
                      href={href}
                      className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      {profileName(award.recipient_profile)}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-foreground">
                      {profileName(award.recipient_profile)}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-muted-foreground">
                    Awarded{" "}
                    {new Intl.DateTimeFormat("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(award.awarded_at))}
                  </p>
                </div>

                {award.award_note ? (
                  <p className="max-w-md text-sm leading-6 text-muted-foreground">
                    {award.award_note}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
