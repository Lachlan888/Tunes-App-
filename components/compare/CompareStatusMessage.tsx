import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"

type CompareStatusMessageProps = {
  tone: StatusTone
  children: React.ReactNode
}

export default function CompareStatusMessage({
  tone,
  children,
}: CompareStatusMessageProps) {
  return (
    <div
      className={`mb-6 rounded-2xl border p-4 text-sm font-medium shadow-sm ${statusStyles[tone]}`}
    >
      {children}
    </div>
  )
}