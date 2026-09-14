/**
 * Builds the 採用情報 page's shipped images from the client's originals.
 *
 * The originals live in design/careers/src (gitignored, ~23MB of PNG and
 * full-resolution stock) and never reach the browser; this writes the webp the
 * page actually loads into public/images/career.
 *
 * The crops are not arbitrary — each one was measured off the design screens
 * in design/careers/screens, so the framing the designer chose survives the
 * conversion instead of being re-decided by object-position at render time.
 * Every card is cropped to the card's own 779:484, so the <img> can be a plain
 * cover fill at any width.
 *
 * Re-runnable: `node scripts/build-career-images.mjs`.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'design/careers/src')
const screens = path.join(root, 'design/careers/screens')
const out = path.join(root, 'public/images/career')

/** The proportion every band's photograph is shown at. */
const CARD_W = 1558
const CARD_H = 968

const jobs = [
  {
    name: 'hero.webp',
    file: path.join(src, 'キャリア.png'),
    // The composed four-tile opening, used whole.
    resize: { width: 2560 },
    quality: 78,
  },
  {
    name: 'wash.webp',
    file: path.join(src, 'キャリア_背景_01.png'),
    // The soft wash behind the first and third bands. It is all gradient, so
    // it survives being sent at well under its native size.
    resize: { width: 1440 },
    quality: 72,
  },
  {
    name: 'philosophy.webp',
    file: path.join(src, 'pixta_86402420_M.jpg'),
    // Pulled in 4%, as the design frames it — the full width, cropped to the
    // card's proportion about the centre.
    crop: { left: 0, top: 68, width: 1924, height: 1195 },
    resize: { width: 1600 },
  },
  {
    name: 'growth.webp',
    file: path.join(src, 'pixta_79612093_M.jpg'),
    // Sits a little below centre so the notebook stays in frame.
    crop: { left: 0, top: 54, width: 2000, height: 1243 },
    resize: { width: 1600 },
  },
  {
    name: 'wellbeing.webp',
    file: path.join(src, 'pixta_133942896_L.jpg'),
    crop: { left: 0, top: 91, width: 4000, height: 2485 },
    resize: { width: 1600 },
  },
  {
    // 働きやすい職場環境 is the one band whose photograph was never delivered
    // clean — design/careers/src holds only the watermarked PIXTA comp
    // (pixta_120402930.jpg). This lifts it out of the design screen instead,
    // where it sits at exactly 2x the size it is shown at. Replace this job
    // with a crop of the licensed original when it arrives.
    name: 'workplace.webp',
    file: path.join(screens, 'Screenshot 2026-09-14 at 10.50.45.png'),
    crop: { left: 0, top: 266, width: CARD_W, height: CARD_H },
    // The screen shows the card already rounded, so its two inner corners come
    // out as white wedges. They are squared off again below, because the page
    // rounds the corners itself and a white crescent would show through.
    squareCorners: { radius: 60, corners: ['tr', 'br'] },
  },
]

/**
 * Paints over a rounded corner by stretching the last full column of pixels
 * across it. The corner is re-cut by CSS, so this only has to be opaque and
 * the right colour — the few pixels that survive are the ones nearest the
 * edge, which is exactly what this copies.
 */
async function squareCorners(buffer, { radius, corners }) {
  const image = sharp(buffer)
  const { width, height } = await image.metadata()
  const raw = await image.raw().toBuffer()
  const channels = raw.length / (width * height)

  for (const corner of corners) {
    const right = corner.endsWith('r')
    const bottom = corner.startsWith('b')
    for (let i = 0; i < radius; i++) {
      const y = bottom ? height - 1 - i : i
      // How far the arc bites into this row, and the first pixel it spares.
      const inset = Math.ceil(radius - Math.sqrt(radius * radius - (radius - i) * (radius - i)))
      const donorX = right ? width - 1 - inset : inset
      const donor = (y * width + donorX) * channels
      for (let j = 0; j < inset; j++) {
        const x = right ? width - 1 - j : j
        const target = (y * width + x) * channels
        for (let c = 0; c < channels; c++) raw[target + c] = raw[donor + c]
      }
    }
  }

  return sharp(raw, { raw: { width, height, channels } }).png().toBuffer()
}

await mkdir(out, { recursive: true })

for (const job of jobs) {
  let pipeline = sharp(job.file)
  if (job.crop) pipeline = pipeline.extract({ ...job.crop })

  if (job.squareCorners) {
    pipeline = sharp(await squareCorners(await pipeline.png().toBuffer(), job.squareCorners))
  }

  if (job.resize) pipeline = pipeline.resize({ ...job.resize, withoutEnlargement: true })

  const target = path.join(out, job.name)
  const info = await pipeline.webp({ quality: job.quality ?? 80 }).toFile(target)
  console.log(
    `${job.name.padEnd(16)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ` +
      `${(info.size / 1024).toFixed(0)}kB`
  )
}
