/**
 * Background remover using sharp — replaces near-white/cream pixels with transparency.
 * Usage: node scripts/remove-bg.mjs <input-file> <output-file>
 * Example: node scripts/remove-bg.mjs ~/Downloads/veggie-house.png public/images/veggie-house.png
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'

const [,, input, output] = process.argv
if (!input || !output) {
  console.error('Usage: node scripts/remove-bg.mjs <input> <output>')
  process.exit(1)
}

const img = sharp(input).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const buf = Buffer.from(data)

// BFS flood-fill from all four border edges to erase connected background
const visited = new Uint8Array(width * height)
const queue = []

function pixelAt(x, y) { return (y * width + x) * channels }
function isBackground(i) {
  const r = buf[i], g = buf[i+1], b = buf[i+2]
  // cream/white: high R, high G, slightly lower B, all above 185
  return r > 185 && g > 175 && b > 165 && Math.abs(r - g) < 50 && Math.abs(g - b) < 60
}

// Seed from all border pixels
for (let x = 0; x < width; x++) {
  queue.push([x, 0])
  queue.push([x, height - 1])
}
for (let y = 1; y < height - 1; y++) {
  queue.push([0, y])
  queue.push([width - 1, y])
}

let head = 0
while (head < queue.length) {
  const [x, y] = queue[head++]
  if (x < 0 || x >= width || y < 0 || y >= height) continue
  const idx = y * width + x
  if (visited[idx]) continue
  const i = pixelAt(x, y)
  if (!isBackground(i)) continue
  visited[idx] = 1
  buf[i + 3] = 0 // erase alpha
  queue.push([x-1,y],[x+1,y],[x,y-1],[x,y+1])
}

// Also erase any remaining isolated background pixels inside (optional pass)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = pixelAt(x, y)
    if (buf[i+3] > 0 && isBackground(i)) {
      // check if surrounded by transparent pixels — isolated bg speckle
      const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]
      const transparentNeighbors = neighbors.filter(([nx,ny]) => {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) return true
        return buf[pixelAt(nx,ny)+3] === 0
      })
      if (transparentNeighbors.length >= 3) buf[i+3] = 0
    }
  }
}

await sharp(buf, { raw: { width, height, channels } })
  .png()
  .toFile(output)

console.log(`Done! Saved to ${output}`)
