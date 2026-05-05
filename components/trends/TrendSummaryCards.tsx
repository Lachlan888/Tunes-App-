import type { TrendSummaryCard } from "@/lib/loaders/trends"

type TrendSummaryCardsProps = {
  cards: TrendSummaryCard[]
}

const borderToneByIndex = [
  "border-l-primary",
  "border-l-accent",
  "border-l-success",
  "border-l-warning-strong",
]

export default function TrendSummaryCards({ cards }: TrendSummaryCardsProps) {
  if (cards.length === 0) {
    return null
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <li
          key={card.label}
          className={`rounded-2xl border border-border border-l-8 bg-card p-5 shadow-sm ${
            borderToneByIndex[index % borderToneByIndex.length]
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-3 font-serif text-4xl font-bold text-foreground">
            {card.value}
          </p>
        </li>
      ))}
    </ul>
  )
}