type CompareStatusTone = "success" | "warning" | "error" | "neutral"

type CompareStatusMessageProps = {
  tone: CompareStatusTone
  children: React.ReactNode
}

function getClasses(tone: CompareStatusTone) {
  if (tone === "success") {
    return "mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800"
  }

  if (tone === "warning") {
    return "mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800"
  }

  if (tone === "error") {
    return "mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800"
  }

  return "mb-6 rounded border border-gray-400 bg-gray-50 p-3 text-sm text-gray-800"
}

export default function CompareStatusMessage({
  tone,
  children,
}: CompareStatusMessageProps) {
  return <div className={getClasses(tone)}>{children}</div>
}