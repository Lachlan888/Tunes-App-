import { readFile, writeFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const routes = ['/', '/library', '/review', '/compare', '/learning-lists', '/trends', '/friends']
const build = JSON.parse(await readFile('.next/build-manifest.json', 'utf8'))
const sharedChunks = [...build.rootMainFiles, ...build.polyfillFiles]
const measurements = []
for (const route of routes) {
  const directory = path.join('.next/server/app', route)
  const manifest = await readFile(path.join(directory, 'page_client-reference-manifest.js'), 'utf8')
  const data = JSON.parse(manifest.slice(manifest.indexOf(' = {', manifest.indexOf('globalThis.__RSC_MANIFEST[')) + 3).replace(/;\s*$/, ''))
  // Conservative route client-module upper bound, including async chunks. This is not measured network transfer.
  const chunks = [...new Set([...sharedChunks, ...Object.values(data.clientModules).flatMap(module => module.chunks)])].filter(chunk => chunk.endsWith('.js'))
  let rawBytes = 0, gzipBytes = 0
  for (const chunk of chunks) {
    const bytes = await readFile(path.join('.next', chunk.replace(/^\/_next\//, '')))
    rawBytes += bytes.length; gzipBytes += gzipSync(bytes).length
  }
  measurements.push({route, chunks: chunks.length, rawBytes, gzipBytes})
}
const report = {measuredAt: new Date().toISOString(), metric: 'all route client-reference chunks, gzip upper bound; not initial network transfer', measurements}
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
