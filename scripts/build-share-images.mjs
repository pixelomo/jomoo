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
 * Icons — the white JOMOO wordmark on the brand blue (--accent, #0046E5):
 *   src/app/favicon.ico, icon.svg   browser tabs (16, 32, 48 and vector)
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
const BLUE = '#0046E5'

const HERO =
  'https://cdn.sanity.io/images/9f4e5pxd/production/cf68a6f14d13a44ce4210069c323cada671106fb-2752x1536.jpg'

// The wordmark, white and charcoal. Its viewBox is 174.23 x 36.16.
const whiteLogo = await readFile(path.join(root, 'public/logo.svg'), 'utf8')
const darkLogo = await readFile(path.join(root, 'public/logo-black.svg'), 'utf8')
const LOGO_RATIO = 36.16 / 174.23

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
/** The wordmark centred on blue, `scale` of the width across. */
async function icon(size, scale, radius = 0) {
  const logoWidth = Math.round(size * scale)
  const logoHeight = Math.round(logoWidth * LOGO_RATIO)
  const shape = radius
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BLUE}"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${BLUE}"/></svg>`
  return sharp(Buffer.from(shape))
    .composite([
      {
        input: await logoPng(whiteLogo, logoWidth),
        top: Math.round((size - logoHeight) / 2),
        left: Math.round((size - logoWidth) / 2),
      },
    ])
    .png()
    .toBuffer()
}

await mkdir(path.join(root, 'public/icons'), { recursive: true })
const write = async (rel, buf) => {
  await writeFile(path.join(root, rel), buf)
  console.log(`${rel.padEnd(26)} ${(buf.length / 1024).toFixed(1)}kB`)
}

await write('src/app/apple-icon.png', await icon(180, 0.78))
await write('public/icons/icon-192.png', await icon(192, 0.78))
await write('public/icons/icon-512.png', await icon(512, 0.78))
await write('public/icons/maskable-512.png', await icon(512, 0.66))

// Tab icons: rounded corners, and the mark as wide as it can go — at 16px
// every pixel of letter height counts.
const tabSizes = [16, 32, 48]
const tabPngs = await Promise.all(tabSizes.map((s) => icon(s, 0.9, Math.round(s * 0.18))))

// An .ico holding PNGs: a 6-byte header, a 16-byte entry per image, then the images.
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(tabPngs.length, 4)
let offset = 6 + 16 * tabPngs.length
const entries = tabPngs.map((png, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(tabSizes[i], 0)
  e.writeUInt8(tabSizes[i], 1)
  e.writeUInt16LE(1, 4) // colour planes
  e.writeUInt16LE(32, 6) // bits per pixel
  e.writeUInt32LE(png.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += png.length
  return e
})
await write('src/app/favicon.ico', Buffer.concat([header, ...entries, ...tabPngs]))

// The vector tab icon, for browsers that take one: the same wordmark paths.
// Illustrator writes every shape twice, so the duplicates are dropped.
const paths = [...new Set(whiteLogo.match(/<(?:path|polygon)\b[^>]*\/>/g) ?? [])].join('')
if (!paths) throw new Error('logo.svg changed shape; update the icon.svg extraction')
const w = 174.23 * 0.9
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 174.23 174.23">
  <rect width="174.23" height="174.23" rx="31" fill="${BLUE}"/>
  <g fill="#fff" transform="translate(${(174.23 - w) / 2} ${(174.23 - 36.16 * 0.9) / 2}) scale(0.9)">${paths.replace(/class="cls-1"/g, '')}</g>
</svg>
`
await write('src/app/icon.svg', Buffer.from(iconSvg))
