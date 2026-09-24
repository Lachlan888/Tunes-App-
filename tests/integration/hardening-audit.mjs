/** Read-only DOM probe shared by the route matrix and local browser tooling. */
export function inspectHardeningDocument() {
  const visible = node => node.getClientRects().length > 0 && !node.closest('[inert]') && getComputedStyle(node).visibility !== 'hidden' && ![...document.querySelectorAll('details:not([open])')].some(detail => detail.contains(node) && !detail.querySelector(':scope > summary')?.contains(node))
  const controls = [...document.querySelectorAll('main a[href],main button,main input:not([type="hidden"]),main select,main textarea,main summary')].filter(visible)
  const named = node => Boolean(node.getAttribute('aria-label') || node.getAttribute('aria-labelledby') || node.labels?.length || (!['INPUT','SELECT','TEXTAREA'].includes(node.tagName) && node.textContent?.trim()) || node.getAttribute('title'))
  const describe = node => ({tag: node.tagName, name: (node.getAttribute('aria-label') || node.textContent || node.getAttribute('name') || '').trim().slice(0, 90)})
  const ids = [...document.querySelectorAll('[id]')].map(node => node.id)
  return {
    path: location.pathname + location.search,
    width: innerWidth, height: innerHeight,
    title: document.querySelector('main h1')?.textContent?.trim(),
    mainCount: [...document.querySelectorAll('main')].filter(visible).length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
    nestedControls: [...document.querySelectorAll('a a,a button,a input,button a,button button,[role="link"] a,[role="link"] button')].filter(visible).map(describe),
    unnamedControls: controls.filter(node => !named(node)).map(describe),
    smallButtons: controls.filter(node => node.tagName === 'BUTTON' && (node.getBoundingClientRect().height < 43.5 || node.getBoundingClientRect().width < 43.5)).map(describe),
    interactiveNodes: controls.length,
    domNodes: document.querySelectorAll('main *').length,
    frames: document.querySelectorAll('main iframe').length,
    navigationCount: [...document.querySelectorAll('nav[aria-label="Primary navigation"]')].filter(visible).length,
    focusMode: document.documentElement.dataset.focusMode === 'practice',
    recovery: Boolean(document.querySelector('main')?.textContent?.includes('This view could not be loaded')),
  }
}

export const hardeningBudgets = {
  routeClientGzipBytes: 400000, // Conservative all-client-chunks ceiling, not initial transfer.
  warmRouteMs: 5000,
  mainInteractiveNodes: 180,
  mainDOMNodes: 3000,
  disclosureLatencyMs: 200,
  reviewRows: 20,
  focusedPracticePayloadRows: 50,
}
