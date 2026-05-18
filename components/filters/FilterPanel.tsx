import type { ReactNode } from "react"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"

type FilterPanelProps = {
  id: string
  title: string
  description?: string
  children: ReactNode
  hasActiveFilters?: boolean
  isPending?: boolean
  onClearAll?: () => void
  onClose: () => void
  className?: string
}

export default function FilterPanel({
  id,
  title,
  description,
  children,
  hasActiveFilters = false,
  isPending = false,
  onClearAll,
  onClose,
  className,
}: FilterPanelProps) {
  return (
    <ResponsiveModal
      isOpen
      onClose={onClose}
      closeDisabled={isPending}
      closeOnOverlayClick={!isPending}
      closeOnEscape={!isPending}
      mobileMode="full-screen"
      desktopMaxWidth="md:max-w-4xl"
      eyebrow="Filters"
      title={title}
      description={description}
      closeLabel="Close filters"
      panelClassName={className}
      bodyClassName="min-h-0 flex-1 overflow-y-auto p-5 md:p-6"
      footerClassName="pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className={buttonStyles.secondary}
            disabled={isPending}
          >
            Close filters
          </button>

          {hasActiveFilters && onClearAll ? (
            <button
              type="button"
              onClick={onClearAll}
              className={buttonStyles.secondaryStrong}
              disabled={isPending}
            >
              Clear all
            </button>
          ) : null}
        </div>
      }
    >
      <div id={id}>{children}</div>
    </ResponsiveModal>
  )
}