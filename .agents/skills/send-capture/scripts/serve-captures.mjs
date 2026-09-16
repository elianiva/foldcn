#!/usr/bin/env node
/**
 * serve-captures.mjs — zero-dependency static file server for agent-browser
 * captures (screenshots, WebM recordings). Needed only when the captures must
 * be opened remotely (see SKILL.md step 3) — for local-only handoff, the files
 * in .tmp/captures/ are the deliverable and no server is required.
 *
 * Usage:
 *   node .agents/skills/send-capture/scripts/serve-captures.mjs [--dir .tmp/captures] [--port 8321]
 *
 * Serves <dir> at /. Unknown paths 404. `/` renders a small listing page.
 * Run it in the background from the same thread that shares the port,
 * and keep it alive while the user needs the link.
 */
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'

const args = process.argv.slice(2)
function argVal(flag, fallback) {
  const i = args.indexOf(flag)
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1]
  const eq = args.find((a) => a.startsWith(`${flag}=`))
  return eq ? eq.slice(flag.length + 1) : fallback
}

const root = resolve(argVal('--dir', '.tmp/captures'))
const port = Number(argVal('--port', '8321'))
mkdirSync(root, { recursive: true })

const TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.html': 'text/html; charset=utf-8',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname === '/') {
      const files = readdirSync(root)
        .filter((f) => statSync(join(root, f)).isFile())
        .sort()
      const items =
        files.map((f) => `<li><a href="./${encodeURIComponent(f)}">${f}</a></li>`).join('') ||
        '<li>(no captures yet)</li>'
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      res.end(`<!doctype html><title>captures</title><h1>captures</h1><ul>${items}</ul>`)
      return
    }
    const file = resolve(root, `.${sep}${normalize(decodeURIComponent(url.pathname))}`)
    if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
      return
    }
    const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': type, 'content-length': body.length })
    res.end(body)
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain' })
    res.end('error')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`captures: serving ${root} at http://127.0.0.1:${port}/`)
})
