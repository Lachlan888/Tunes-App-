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
      className={`mb-6 border-y py-3 text-sm font-medium ${statusStyles[tone]}`}
    >
      {children}
    </div>
  )
}
