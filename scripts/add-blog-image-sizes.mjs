// Stamps every blog body image in src/lib/blog/posts.ts with its intrinsic
// width and height, read from the file in public/. The detail page needs the
// two numbers before it renders: they set the <img> attributes that hold the
// layout still while the picture loads, and they tell it which pictures are
// portrait, so those are laid out taller instead of being cropped to the
// landscape band. Re-runnable — run it after adding or replacing an image.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const POSTS = 'src/lib/blog/posts.ts'
const source = readFileSync(POSTS, 'utf8')

/** sips ships with macOS and reads every format we use, gifs included. */
function intrinsicSize(src) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', join('public', src)], {
    encoding: 'utf8',
  })
  const width = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1])
  const height = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1])
  if (!width || !height) throw new Error(`could not read the size of ${src}`)
  return { width, height }
}

let stamped = 0
const next = source.replace(
  /(\{\s*\n\s*type: 'img',\n(\s*)src: '([^']+)',\n)((?:\s*(?:width|height): \d+,\n)*)/g,
  (_match, head, indent, src) => {
    const { width, height } = intrinsicSize(src)
    stamped += 1
    return `${head}${indent}width: ${width},\n${indent}height: ${height},\n`
  }
)

writeFileSync(POSTS, next)
console.log(`stamped ${stamped} blog images`)
