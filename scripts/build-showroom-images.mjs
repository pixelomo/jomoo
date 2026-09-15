/**
 * Builds the ショールーム page's shipped image from the client's original.
 *
 * design/showroom/src/showroom.png is a 6400x3600 render — 15MB, and gitignored
 * along with the rest of design/. The hero shows it whole, edge to edge, so
 * there is no crop to make here: this only takes it down to a size a browser
 * should be asked to carry.
 *
 * Re-runnable: `node scripts/build-showroom-images.mjs`.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'design/showroom/src')
const out = path.join(root, 'public/images/showroom')

const jobs = [
  {
    name: 'hero.webp',
    file: path.join(src, 'showroom.png'),
    // The picture is 16:9 and the hero is drawn at 16:9, so it is shown whole.
    resize: { width: 2560 },
    quality: 80,
  },
]

await mkdir(out, { recursive: true })

for (const job of jobs) {
  let pipeline = sharp(job.file)
  if (job.resize) pipeline = pipeline.resize({ ...job.resize, withoutEnlargement: true })

  const target = path.join(out, job.name)
  const info = await pipeline.webp({ quality: job.quality ?? 80 }).toFile(target)
  console.log(
    `${job.name.padEnd(16)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ` +
      `${(info.size / 1024).toFixed(0)}kB`
  )
}
