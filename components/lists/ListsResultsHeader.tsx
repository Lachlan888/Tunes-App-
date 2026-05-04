type ListsResultsHeaderProps = {
  filteredCount: number
  totalCount: number
  hasActiveFilters: boolean
}

export default function ListsResultsHeader({
  filteredCount,
  totalCount,
  hasActiveFilters,
}: ListsResultsHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} list
        {totalCount === 1 ? "" : "s"}
      </p>

      {hasActiveFilters && (
        <a href="/learning-lists" className="text-sm underline">
          Reset view
        </a>
      )}
    </div>
  )
}