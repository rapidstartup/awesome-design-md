import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const src = resolve(root, 'design-md')
const dest = resolve(root, 'dist', 'design-md')

if (!existsSync(src)) {
  console.warn('[copy-design-md] source folder not found:', src)
  process.exit(0)
}

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })

console.log('[copy-design-md] copied design-md to dist/design-md')
