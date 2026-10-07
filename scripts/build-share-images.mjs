/**
 * Builds the site's share cards and icons.
 *
 * Share cards (public/og/) — what Facebook, X, LINE, Slack and the rest show
 * when a link to the site is posted. The source is the トップページ hero, the
 * X40 in the light room, fetched from Sanity at full size:
 *   jomoo-x40-1200x630.jpg   1.91:1, the size every platform's large card uses
 *   jomoo-x40-1200x1200.jpg  1:1, for the apps that crop to a square (WhatsApp,
 *                            LINE on some layouts, iMessage's small card)
 * Product and blog pages share their own Sanity image instead (lib/seo.ts).
 *
 * Icons — jomoo.com's own favicon, the white J on black (see below):
 *   src/app/favicon.ico             browser tabs (16, 24, 32, 48, 256)
 *   src/app/apple-icon.png          iOS home screen, 180x180, full bleed (iOS
 *                                   rounds the corners itself)
 *   public/icons/icon-192/512.png   Android home screen, via manifest.ts
 *   public/icons/maskable-512.png   Android adaptive icon: the mark sits inside
 *                                   the central 80% safe zone, since the
 *                                   launcher may crop to a circle
 *
 * Re-runnable: `node scripts/build-share-images.mjs`.
 */
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const HERO =
  'https://cdn.sanity.io/images/9f4e5pxd/production/cf68a6f14d13a44ce4210069c323cada671106fb-2752x1536.jpg'

// The wordmark, for the share cards. Its viewBox is 174.23 x 36.16.
const darkLogo = await readFile(path.join(root, 'public/logo-black.svg'), 'utf8')

const logoPng = (svg, width) =>
  sharp(Buffer.from(svg), { density: 1200 }).resize({ width }).png().toBuffer()

// ── Share cards ─────────────────────────────────────────────
const hero = Buffer.from(await (await fetch(HERO)).arrayBuffer())
await mkdir(path.join(root, 'public/og'), { recursive: true })

async function card(name, width, height, extract) {
  const logoWidth = Math.round(width * 0.2)
  const margin = Math.round(height * 0.08)
  const target = path.join(root, 'public/og', name)
  const info = await sharp(hero)
    .extract(extract)
    .resize(width, height)
    .composite([{ input: await logoPng(darkLogo, logoWidth), top: margin, left: margin }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(target)
  console.log(`${name.padEnd(26)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}kB`)
}

// The hero is 2752x1536 (1.79:1). 1.91:1 trims a little top and bottom — the
// floor and ceiling, never the toilet.
await card('jomoo-x40-1200x630.jpg', 1200, 630, { left: 0, top: 48, width: 2752, height: 1441 })
// Square: centred on the toilet, which stands just right of the middle.
await card('jomoo-x40-1200x1200.jpg', 1200, 1200, { left: 663, top: 0, width: 1536, height: 1536 })

// ── Icons ───────────────────────────────────────────────────
// The source is scripts/favicon-jomoo-com.ico, jomoo.com's own favicon: a white
// J on #111111, nine sizes. Its 16–48 frames and its 256 PNG go into the tab
// icon as they are (the 64–128 bitmaps are 140kB a tab never asks for); the
// 256 frame is the master for the home-screen sizes.
const ICO_SOURCE = path.join(root, 'scripts/favicon-jomoo-com.ico')
const BLACK = '#111111'

const ico = await readFile(ICO_SOURCE)
const frames = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => {
  const o = 6 + 16 * i
  const size = ico.readUInt32LE(o + 8)
  const offset = ico.readUInt32LE(o + 12)
  return { width: ico[o] || 256, entry: ico.subarray(o, o + 16), data: ico.subarray(offset, offset + size) }
})
const master = frames.find((f) => f.width === 256)
if (!master) throw new Error('favicon-jomoo-com.ico has no 256px frame')

/** The J on a full-bleed square, `scale` of the size across — the platforms round the corners. */
async function icon(size, scale) {
  const inner = Math.round(size * scale)
  const j = sharp(master.data).resize(inner, inner)
  return sharp({ create: { width: size, height: size, channels: 4, background: BLACK } })
    .composite([{ input: await j.png().toBuffer(), gravity: 'center' }])
    .png()
    .toBuffer()
}

await mkdir(path.join(root, 'public/icons'), { recursive: true })
const write = async (rel, buf) => {
  await writeFile(path.join(root, rel), buf)
  console.log(`${rel.padEnd(30)} ${(buf.length / 1024).toFixed(1)}kB`)
}

// The source's transparent corners fall on the same black, so they vanish.
await write('src/app/apple-icon.png', await icon(180, 0.92))
await write('public/icons/icon-192.png', await icon(192, 0.92))
await write('public/icons/icon-512.png', await icon(512, 0.92))
// Android may crop to a circle; the J stays inside the central safe zone.
await write('public/icons/maskable-512.png', await icon(512, 0.75))

const kept = frames.filter((f) => [16, 24, 32, 48, 256].includes(f.width))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(kept.length, 4)
let offset = 6 + 16 * kept.length
const entries = kept.map((f) => {
  const e = Buffer.from(f.entry)
  e.writeUInt32LE(offset, 12)
  offset += f.data.length
  return e
})
await write('src/app/favicon.ico', Buffer.concat([header, ...entries, ...kept.map((f) => f.data)]))
