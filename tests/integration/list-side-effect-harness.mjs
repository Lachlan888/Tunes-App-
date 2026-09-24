import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { prepareListPagerHarness, startListPagerHarness } from "./list-pager-harness.mjs"

/** Observe attempted side effects, not merely the unchanged read-only fixture. */
export async function prepareListSideEffectHarness() {
  const directory = await prepareListPagerHarness()
  const put = async (name, source) => {
    await mkdir(path.dirname(path.join(directory, name)), { recursive: true })
    await writeFile(path.join(directory, name), source)
  }
  await put("tests/integration/fixtures/list-side-effects.ts", await readFile(new URL("./fixtures/list-side-effects.ts", import.meta.url), "utf8"))
  const loaderPath = path.join(directory, "lib/loaders/lists.ts")
  const loader = await readFile(loaderPath, "utf8")
  const boundary = 'import { createListPagerFixtures } from "@/tests/integration/fixtures/list-pagers"'
  if (loader.split(boundary).length !== 2) throw new Error("Pager fixture loader boundary changed")
  await put("lib/loaders/lists.ts", loader.slice(0, loader.indexOf(boundary)) + `
import { createListSideEffectFixtures } from "@/tests/integration/fixtures/list-side-effects"
export async function loadListsData() { return createListSideEffectFixtures() }
`)
  await put("side-effect-audit.jsonl", "")
  await put("lib/fixture-audit.ts", `import { appendFileSync, readFileSync } from "node:fs"
import path from "node:path"
const auditPath = path.join(process.cwd(), "side-effect-audit.jsonl")
export function recordAttempt(kind: string, target: string) {
  appendFileSync(auditPath, JSON.stringify({ kind, target, at: new Date().toISOString() }) + "\\n")
}
export function readAttempts() {
  return readFileSync(auditPath, "utf8").split("\\n").filter(Boolean).map(line => JSON.parse(line))
}
`)
  await put("lib/supabase/server.ts", `import { recordAttempt } from "@/lib/fixture-audit"
export function createClient(): never {
  recordAttempt("database-client", "server")
  throw new Error("Fixture harness forbids database access")
}
`)
  // Browser-side access must fail closed too; browser console errors remain an
  // acceptance failure (the fs-backed server audit cannot run in a client).
  await put("proxy.ts", `import { NextResponse, type NextRequest } from "next/server"
import { recordAttempt } from "@/lib/fixture-audit"
export function proxy(request: NextRequest) {
  if (!["GET", "HEAD"].includes(request.method)) {
    recordAttempt("write-request", request.method + " " + request.nextUrl.pathname)
    return new NextResponse("Fixture harness rejects writes", { status: 405 })
  }
  return NextResponse.next()
}
`)
  await put("app/fixture-audit/route.ts", `import { readAttempts } from "@/lib/fixture-audit"
import { createListSideEffectSnapshot } from "@/tests/integration/fixtures/list-side-effects"
export const dynamic = "force-dynamic"
export function GET() {
  return Response.json({ attempts: readAttempts(), fixture: createListSideEffectSnapshot() }, { headers: { "Cache-Control": "no-store" } })
}
`)
  const manifest = JSON.parse(await readFile(path.join(directory, "HARNESS.json"), "utf8"))
  await put("HARNESS.json", JSON.stringify({ ...manifest, audit: "/fixture-audit", acceptance: "pending; immutable fixture equality alone is not persistence proof" }, null, 2))
  return directory
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = await prepareListSideEffectHarness()
  console.log(directory)
  if (process.argv.includes("--serve")) {
    const child = startListPagerHarness(directory, 4320)
    for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal))
    child.once("exit", code => { process.exitCode = code ?? 1 })
  }
}
