export type PreferredReferenceMetadata = {
  preferred_reference_url: string | null
  preferred_reference_label: string | null
} | null

export function getEffectiveReference({
  defaultReferenceUrl,
  metadata,
}: {
  defaultReferenceUrl: string | null | undefined
  metadata: PreferredReferenceMetadata
}) {
  const preferredUrl = metadata?.preferred_reference_url || null

  return {
    effectiveReferenceUrl: preferredUrl || defaultReferenceUrl || null,
    effectiveReferenceLabel: preferredUrl
      ? metadata?.preferred_reference_label || null
      : null,
    isUsingPreferredReference: Boolean(preferredUrl),
  }
}
