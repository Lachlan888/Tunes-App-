import type { TrendSummaryCard } from "@/lib/loaders/trends"

type TrendSummaryCardsProps = {
  cards: TrendSummaryCard[]
}

export default function TrendSummaryCards({ cards }: TrendSummaryCardsProps) {
  if (cards.length === 0) {
    return null
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <li
          key={card.label}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">{card.label}</p>
          <p className="mt-2 text-xl font-semibold">{card.value}</p>
        </li>
      ))}
    </ul>
  )
}