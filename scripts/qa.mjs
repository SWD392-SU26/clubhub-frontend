import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat, mkdir } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const root = resolve('dist')
const output = resolve('../../work/qa-clubhub')
await mkdir(output, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
const server = createServer(async (request, response) => {
  try {
    let target = join(root, decodeURIComponent(request.url?.split('?')[0] || '/'))
    try {
      const info = await stat(target)
      if (info.isDirectory()) target = join(target, 'index.html')
    } catch {
      target = join(root, 'index.html')
    }
    const body = await readFile(target)
    response.writeHead(200, { 'content-type': types[extname(target)] || 'application/octet-stream' })
    response.end(body)
  } catch (error) {
    response.writeHead(500)
    response.end(String(error))
  }
})

await new Promise(resolveListen => server.listen(4173, '127.0.0.1', resolveListen))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })

for (const [name, route] of [
  ['home', '/'], ['login', '/login'], ['student', '/dashboard'],
  ['club-admin', '/club-admin'], ['system-admin', '/system-admin'],
]) {
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(output, `${name}.png`), fullPage: true })
}

await page.setViewportSize({ width: 375, height: 812 })
for (const [name, route] of [['mobile-student', '/dashboard'], ['mobile-admin', '/club-admin']]) {
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(output, `${name}.png`), fullPage: true })
}

await browser.close()
await new Promise(resolveClose => server.close(resolveClose))
