import { cp, mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { spawn } from "node:child_process"

const repository = fileURLToPath(new URL("../../", import.meta.url))

/** Disposable snapshot: no .env, proxy, API routes, credentials or live layout. */
export async function prepareListPagerHarness() {
  const directory = await mkdtemp("/private/tmp/tunes-list-pagers-")
  for (const entry of ["components", "hooks", "lib", "public", "package.json", "tsconfig.json", "postcss.config.mjs"]) {
    await cp(path.join(repository, entry), path.join(directory, entry), { recursive: true })
  }
  const put = async (name, contents) => {
    await mkdir(path.dirname(path.join(directory, name)), { recursive: true })
    await writeFile(path.join(directory, name), contents)
  }
  await put("app/learning-lists/page.tsx", await readFile(path.join(repository, "app/learning-lists/page.tsx"), "utf8"))
  for (const route of ["learning-lists", "public-lists"]) {
    const file = `app/${route}/[id]/page.tsx`
    await put(file, await readFile(path.join(repository, file), "utf8"))
  }
  for (const [module, loader, fixture] of [
    ["list-detail", "loadLearningListDetailData", "createListDetailPagerFixture"],
    ["public-list-detail", "loadPublicListDetailData", "createPublicListDetailPagerFixture"],
  ]) {
    // Keep original exported type declarations for the real route/components.
    const source = await readFile(path.join(repository, `lib/loaders/${module}.ts`), "utf8")
    const boundary = `export async function ${loader}(rawListId: string) {`
    if (source.split(boundary).length !== 2) throw new Error(`${module} loader boundary changed`)
    await put(`lib/loaders/${module}.ts`, source.slice(0, source.indexOf(boundary)) + `
import { ${fixture} } from "@/tests/integration/fixtures/list-pagers"
export async function ${loader}(rawListId: string) {
  const fixture = ${fixture}(rawListId)
  if (!fixture) notFound()
  return fixture
}\n`)
  }
  await put("app/globals.css", await readFile(path.join(repository, "app/globals.css"), "utf8"))
  await put("tests/integration/fixtures/list-pagers.ts", await readFile(path.join(repository, "tests/integration/fixtures/list-pagers.ts"), "utf8"))
  await symlink(path.join(repository, "node_modules"), path.join(directory, "node_modules"), "dir")
  await put("next.config.mjs", `export default { devIndicators: false }\n`)
  await put("app/layout.tsx", `import "./globals.css"
import SessionDockProvider from "@/components/session-dock/SessionDockProvider"
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><SessionDockProvider enabled={false}><main id="main-content" className="mx-auto max-w-6xl p-6">{children}</main></SessionDockProvider></body></html>
}\n`)
  // Preserve type declarations used by components; replace only the loader body.
  const loader = await readFile(path.join(repository, "lib/loaders/lists.ts"), "utf8")
  const declaration = "export async function loadListsData() {"
  if (loader.split(declaration).length !== 2) throw new Error("Lists loader boundary changed")
  await put("lib/loaders/lists.ts", loader.slice(0, loader.indexOf(declaration)) + `
import { createListPagerFixtures } from "@/tests/integration/fixtures/list-pagers"
export async function loadListsData() {
  return { learningLists: [], listOverviews: [], learningQueueTunes: [], unlistedPracticeTunes: [], unlistedKnownTunes: [], ...createListPagerFixtures() }
}\n`)
  // Any unexpectedly reached data-backed code fails closed, including actions.
  for (const name of ["server", "client"]) {
    await put(`lib/supabase/${name}.ts`, `export function createClient(): never { throw new Error("Fixture harness forbids database access") }\n`)
  }
  await put("proxy.ts", `import { NextResponse, type NextRequest } from "next/server"
export function proxy(request: NextRequest) {
  if (!["GET", "HEAD"].includes(request.method)) return new NextResponse("Fixture harness rejects writes", { status: 405 })
  return NextResponse.next()
}\n`)
  await put("HARNESS.json", JSON.stringify({ source: repository, scope: "overview-and-detail", database: "blocked", writes: "blocked", details: "owned/shared/public fixture loaders; browser acceptance pending" }, null, 2))
  return directory
}

/** Minimal environment intentionally excludes all inherited service credentials. */
export function startListPagerHarness(directory, port = 4319) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid local port")
  return spawn(process.execPath, [path.join(repository, "node_modules/next/dist/bin/next"), "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: directory,
    env: { PATH: process.env.PATH, HOME: directory, TMPDIR: "/private/tmp", NODE_ENV: "development", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "inherit",
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = await prepareListPagerHarness()
  console.log(directory)
  if (process.argv.includes("--serve")) {
    const child = startListPagerHarness(directory)
    for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => child.kill(signal))
    child.once("exit", code => { process.exitCode = code ?? 1 })
  }
}
