"use client"

import { useMemo, useState } from "react"
import type { DevMetricVisualisation } from "@/lib/types/dev"

type MetricVisualiserProps = {
  visualisations: DevMetricVisualisation[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-AU").format(value)
}

function getShare(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

export default function MetricVisualiser({
  visualisations,
}: MetricVisualiserProps) {
  const [selectedId, setSelectedId] = useState(
    visualisations[0]?.id ?? "feature_families"
  )

  const selectedVisualisation = useMemo(() => {
    return (
      visualisations.find((visualisation) => visualisation.id === selectedId) ??
      visualisations[0] ??
      null
    )
  }, [selectedId, visualisations])

  const rows = selectedVisualisation?.rows ?? []
  const visibleRows = rows.slice(0, 10)
  const topRow = visibleRows[0] ?? null
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0)
  const maxValue =
    visibleRows.length > 0 ? Math.max(...visibleRows.map((row) => row.value)) : 0

  if (!selectedVisualisation) {
    return (
      <div className="border-y border-hairline py-6 text-sm text-muted-foreground">
        No metrics available yet.
      </div>
    )
  }

  return (
    <section className="border-b border-hairline">
      <div className="border-b border-border bg-card-strong/70 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight">
              {selectedVisualisation.label}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {selectedVisualisation.description}
            </p>
          </div>

          <label className="block w-full max-w-sm">
            <span className="text-sm font-semibold text-foreground">
              Select metric
            </span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full rounded-object border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {visualisations.map((visualisation) => (
                <option key={visualisation.id} value={visualisation.id}>
                  {visualisation.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border-b border-hairline py-4">
            <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">
              Total
            </p>
            <p className="mt-2 font-sans text-4xl font-bold">
              {formatNumber(totalValue)}
            </p>
          </div>

          <div className="border-b border-hairline py-4">
            <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">
              Rows
            </p>
            <p className="mt-2 font-sans text-4xl font-bold">
              {formatNumber(rows.length)}
            </p>
          </div>

          <div className="border-b border-hairline py-4">
            <p className="text-xs font-semibold  tracking-[0.14em] text-muted-foreground">
              Top item
            </p>
            <p className="mt-2 truncate font-sans text-2xl font-bold">
              {topRow ? topRow.label : "None"}
            </p>
            {topRow ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {formatNumber(topRow.value)}{" "}
                {selectedVisualisation.primaryLabel.toLowerCase()}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">
          No rows for this metric yet.
        </div>
      ) : (
        <div className="p-5">
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold  tracking-[0.16em] text-muted-foreground">
                  Ranked chart
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {visibleRows.map((row, index) => {
                const width =
                  maxValue > 0 ? Math.max((row.value / maxValue) * 100, 4) : 0
                const share = getShare(row.value, totalValue)

                return (
                  <div key={row.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-foreground">
                            {row.label}
                          </p>
                          {row.helper ? (
                            <p className="text-xs text-muted-foreground">
                              {row.helper}
                            </p>
                          ) : null}
                          {row.secondaryValue !== null && row.secondaryValue !== undefined ? (
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(row.secondaryValue)} {row.secondaryLabel ?? ""}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-sans text-2xl font-bold">
                          {formatNumber(row.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {share}% of total
                        </p>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden bg-surface-note">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </section>
  )
}
