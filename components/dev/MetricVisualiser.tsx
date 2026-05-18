"use client"

import { useMemo, useState } from "react"
import type { DevMetricVisualisation } from "@/lib/types/dev"

type MetricVisualiserProps = {
  visualisations: DevMetricVisualisation[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-AU").format(value)
}

function getInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
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
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        No metrics available yet.
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-card-strong/70 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Metric visualiser
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
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
              className="mt-2 w-full rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
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
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total
            </p>
            <p className="mt-2 font-serif text-4xl font-bold">
              {formatNumber(totalValue)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Rows
            </p>
            <p className="mt-2 font-serif text-4xl font-bold">
              {formatNumber(rows.length)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Top item
            </p>
            <p className="mt-2 truncate font-serif text-2xl font-bold">
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
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="rounded-3xl border border-border bg-background/70 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Ranked chart
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top {visibleRows.length} rows by{" "}
                  {selectedVisualisation.primaryLabel.toLowerCase()}.
                </p>
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {row.label}
                          </p>
                          {row.helper ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {row.helper}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-serif text-2xl font-bold">
                          {formatNumber(row.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {share}% of total
                        </p>
                      </div>
                    </div>

                    <div className="h-5 overflow-hidden rounded-full border border-border bg-card-strong">
                      <div
                        className="h-full rounded-full bg-primary shadow-sm"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-background/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Distribution
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {visibleRows.slice(0, 6).map((row) => {
                  const share = getShare(row.value, totalValue)

                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {getInitials(row.label)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {row.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {share}% share
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 font-serif text-3xl font-bold">
                        {formatNumber(row.value)}
                      </p>

                      {row.secondaryValue !== null &&
                      row.secondaryValue !== undefined ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNumber(row.secondaryValue)}{" "}
                          {row.secondaryLabel ?? ""}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/70 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Details
              </h3>

              <div className="mt-4 divide-y divide-border">
                {visibleRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.label}</p>
                      {row.secondaryValue !== null &&
                      row.secondaryValue !== undefined ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatNumber(row.secondaryValue)}{" "}
                          {row.secondaryLabel ?? ""}
                        </p>
                      ) : null}
                    </div>
                    <p className="font-serif text-xl font-bold">
                      {formatNumber(row.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}