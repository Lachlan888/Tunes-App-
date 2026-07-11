export const TIME_SIGNATURE_PATTERN = "[0-9]+/[0-9]+"
export const TIME_SIGNATURE_HELPER_TEXT = "Use format like 4/4 or 6/8"

const timeSignaturePattern = /^[0-9]+\/[0-9]+$/

export function isValidOptionalTimeSignature(value: string) {
  return value === "" || timeSignaturePattern.test(value)
}
