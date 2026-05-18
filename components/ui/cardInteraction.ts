export const interactiveCardSelector = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "details",
  "form",
  "[role='button']",
  "[role='link']",
  "[data-card-action]",
].join(", ")

export function clickedInsideInteractiveElement(
  target: EventTarget | null,
  cardRoot?: Element | null
) {
  if (!(target instanceof Element)) return false

  const interactiveElement = target.closest(interactiveCardSelector)

  if (!interactiveElement) return false

  if (cardRoot && interactiveElement === cardRoot) {
    return false
  }

  return true
}