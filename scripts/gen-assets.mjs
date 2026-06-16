import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'assets')
fs.mkdirSync(outDir, { recursive: true })

function makeSvg(size, showWordmark = false) {
  const s = size
  const iconSize = showWordmark ? s * 0.22 : s * 0.6
  const cx = s / 2
  const cy = showWordmark ? s / 2 - s * 0.04 : s / 2
  const fontSize = iconSize
  const wordmarkSize = s * 0.075
  const wordmarkY = s / 2 + s * 0.16

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </radialGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#g)"/>
  <text
    x="${cx}" y="${cy}"
    font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >S</text>
  ${showWordmark ? `<text
    x="${cx}" y="${wordmarkY}"
    font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif"
    font-size="${wordmarkSize}"
    font-weight="600"
    fill="rgba(255,255,255,0.85)"
    text-anchor="middle"
    dominant-baseline="central"
  >sravel</text>` : ''}
</svg>`
}

// Icon 1024×1024
await sharp(Buffer.from(makeSvg(1024)))
  .png()
  .toFile(path.join(outDir, 'icon.png'))
console.log('✓ icon.png (1024×1024)')

// Splash 2732×2732
await sharp(Buffer.from(makeSvg(2732, true)))
  .png()
  .toFile(path.join(outDir, 'splash.png'))
console.log('✓ splash.png (2732×2732)')

// Dark mode icon (same — blue works on dark too)
await sharp(Buffer.from(makeSvg(1024)))
  .png()
  .toFile(path.join(outDir, 'icon-dark.png'))
console.log('✓ icon-dark.png')

// Foreground icon (for Android adaptive icons — logo on transparent)
const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <text
    x="512" y="512"
    font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif"
    font-size="580"
    font-weight="800"
    fill="white"
    text-anchor="middle"
    dominant-baseline="central"
  >S</text>
</svg>`

await sharp(Buffer.from(foregroundSvg))
  .png()
  .toFile(path.join(outDir, 'icon-foreground.png'))
console.log('✓ icon-foreground.png (Android adaptive foreground)')
