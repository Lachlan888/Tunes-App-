type CompareStatusTone = "success" | "warning" | "error" | "neutral"

type CompareStatusMessageProps = {
  tone: CompareStatusTone
  children: React.ReactNode
}

function getClasses(tone: CompareStatusTone) {
  if (tone === "success") {
    return "mb-6 rounded-2xl border border-success bg-[#e6edd6] p-4 text-sm font-medium text-[#435336] shadow-sm"
  }

  if (tone === "warning") {
    return "mb-6 rounded-2xl border border-[#c5ad67] bg-[#f1e7bf] p-4 text-sm font-medium text-[#675622] shadow-sm"
  }

  if (tone === "error") {
    return "mb-6 rounded-2xl border border-destructive bg-[#f2dfd6] p-4 text-sm font-medium text-[#6f3f36] shadow-sm"
  }

  return "mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-muted-foreground shadow-sm"
}

export default function CompareStatusMessage({
  tone,
  children,
}: CompareStatusMessageProps) {
  return <div className={getClasses(tone)}>{children}</div>
}