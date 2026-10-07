import assert from "node:assert/strict"
import test from "node:test"
import { getReferenceSourceCapabilities } from "../lib/reference-source-actions.ts"
import type { TuneMediaSource } from "../lib/tune-media.ts"

function source(overrides: Partial<TuneMediaSource> = {}): TuneMediaSource {
  return {
    id: "media-42",
    sourceType: "additional-media",
    mediaType: "recording",
    label: "Session tape",
    url: "https://example.com/session",
    isYouTube: false,
    youtubeVideoId: null,
    canBePreferredReference: false,
    canUseSavedLoops: false,
    createdBy: "owner",
    ...overrides,
  }
}

test("only the contributing user can remove an additional media source", () => {
  assert.deepEqual(getReferenceSourceCapabilities(source(), "owner"), {
    externalHref: "https://example.com/session",
    removableMediaId: 42,
  })
  assert.equal(getReferenceSourceCapabilities(source(), "another").removableMediaId, null)
  assert.equal(getReferenceSourceCapabilities(source({ sourceType: "canonical-reference" }), "owner").removableMediaId, null)
  assert.equal(getReferenceSourceCapabilities(source({ id: "media-invalid" }), "owner").removableMediaId, null)
})

test("external source actions require an ordinary web URL", () => {
  assert.equal(getReferenceSourceCapabilities(source({ url: "javascript:alert(1)" }), "owner").externalHref, null)
  assert.equal(getReferenceSourceCapabilities(source({ url: "not a URL" }), "owner").externalHref, null)
  assert.equal(getReferenceSourceCapabilities(source({ url: "http://example.com" }), "owner").externalHref, "http://example.com")
  assert.deepEqual(getReferenceSourceCapabilities(null, "owner"), { externalHref: null, removableMediaId: null })
})
