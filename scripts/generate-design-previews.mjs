/**
 * Generates preview.html + preview-dark.html from DESIGN.md YAML color tokens.
 * Run: node scripts/generate-design-previews.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SLUGS = [
  'binance',
  'bmw-m',
  'bugatti',
  'ferrari',
  'lamborghini',
  'mastercard',
  'meta',
  'nike',
  'playstation',
  'renault',
  'shopify',
  'slack',
  'starbucks',
  'tesla',
  'theverge',
  'vodafone',
  'wired',
]

function parseYamlColors(fm) {
  const colors = {}
  const lines = fm.split('\n')
  let inColors = false
  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (trimmed === 'colors:' || /^\s*colors:\s*$/.test(trimmed)) {
      inColors = true
      continue
    }
    if (!inColors) continue
    if (/^[a-z][a-z0-9_-]*:/.test(trimmed) && !/^  /.test(line)) break
    const m = line.match(/^  ([a-z0-9_-]+):\s*(.+)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1)
    v = v.trim()
    if (/^#[0-9a-fA-F]{3,8}$/.test(v)) colors[m[1]] = v.toLowerCase()
  }
  return colors
}

function parseTitleFromMarkdown(text) {
  const m = text.match(/^#\s+Design System Inspired by\s+(.+)$/m)
  if (m) return m[1].trim()
  const m2 = text.match(/^#\s+(.+)/m)
  return m2 ? m2[1].trim().slice(0, 80) : 'Design'
}

function slugKey(label) {
  let k = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36)
  if (!k) k = 'color'
  if (/^[0-9]/.test(k)) k = 'c-' + k
  return k
}

/** Markdown prose DESIGN.md: bullet lines like `- **Name** (\`#RRGGBB\`):` */
function extractColorsFromMarkdown(text) {
  const colors = {}
  const usedKeys = new Set()
  const re =
    /^\s*-\s*\*\*([^*]+)\*\*\s*\(\s*`?(#[0-9a-fA-F]{6})`?\s*\)\s*:?/gim
  let m
  while ((m = re.exec(text)) !== null) {
    const hex = m[2].toLowerCase()
    let base = slugKey(m[1])
    let k = base
    let n = 2
    while (usedKeys.has(k)) k = `${base}-${n++}`
    usedKeys.add(k)
    colors[k] = hex
    if (Object.keys(colors).length >= 48) break
  }
  if (Object.keys(colors).length) return colors

  const seenHex = new Set()
  let i = 0
  const reHex = /#([0-9a-fA-F]{6})\b/g
  while ((m = reHex.exec(text)) !== null && i < 40) {
    const hex = '#' + m[1].toLowerCase()
    if (seenHex.has(hex)) continue
    seenHex.add(hex)
    colors[`token-${++i}`] = hex
  }
  return colors
}

function parseDesignMd(content) {
  const text = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  let name = parseTitleFromMarkdown(text)
  let colors = {}

  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3)
    if (end !== -1) {
      const fm = text.slice(4, end)
      const nm = fm.match(/^name:\s*(.+)$/m)
      if (nm) name = nm[1].trim()
      colors = parseYamlColors(fm)
    }
  }
  if (!Object.keys(colors).length) colors = extractColorsFromMarkdown(text)

  return { name, colors }
}

function colorsToRoot(colors) {
  if (!Object.keys(colors).length) return '  --placeholder-missing: #888888;'
  return Object.entries(colors)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')
}

/** Map first hex token to `--primary` when missing so semantic accents work. */
function ensurePrimaryAlias(colors) {
  if (colors.primary) return
  for (const v of Object.values(colors)) {
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      colors.primary = v
      break
    }
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHtml({ titleLabel, mode, rootVars, swatches, brandWord }) {
  const isDark = mode === 'dark'
  const bodyBg = isDark
    ? `var(--canvas-dark, var(--ink-deep, var(--ink, var(--surface-aubergine, #0c0c0c))))`
    : `var(--canvas, var(--canvas-light, var(--canvas-cream, var(--surface-soft, #ffffff))))`
  const bodyColor = isDark
    ? `var(--body, var(--on-dark, var(--content-text-dark, var(--text-primary, #e8e8e8))))`
    : `var(--body-on-light, var(--ink, var(--body, var(--text-primary, #1a1a1a))))`
  const mutedColor = isDark
    ? `var(--muted, var(--muted-strong, var(--stone, var(--ink-mute, #9ca3af))))`
    : `var(--muted, var(--stone, var(--charcoal, var(--ink-mute, #6b7280))))`
  const primaryBg = `var(--primary, var(--accent-indigo, #3b82f6))`
  const primaryFg = `var(--on-primary, #ffffff)`
  const surfaceBg = isDark
    ? `var(--surface-card-dark, var(--surface-elevated-dark, var(--surface-strong-dark, var(--dark-slate, #1e293b))))`
    : `var(--surface-soft-light, var(--surface-soft, var(--surface-elev, var(--gray-surface, #f4f4f5))))`
  const borderCol = isDark
    ? `var(--hairline-on-dark, var(--hairline, var(--border-strong, #334155)))`
    : `var(--hairline, var(--hairline-on-light, var(--border-default, #e5e7eb)))`

  const swatchRows = swatches
    .slice(0, 28)
    .map(
      ([key, hex]) => `
<div class="color-swatch"><div class="color-swatch-block" style="background:${hex}"></div><div class="color-swatch-info"><div class="color-swatch-name">${escapeHtml(key)}</div><div class="color-swatch-hex">${escapeHtml(hex)}</div></div></div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(titleLabel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
${rootVars}
  --preview-body-bg: ${bodyBg};
  --preview-body-color: ${bodyColor};
  --preview-muted: ${mutedColor};
  --preview-primary-bg: ${primaryBg};
  --preview-primary-fg: ${primaryFg};
  --preview-surface: ${surfaceBg};
  --preview-border: ${borderCol};
}
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    background: var(--preview-body-bg);
    color: var(--preview-body-color);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px;
    background: var(--preview-body-bg);
    border-bottom: 1px solid var(--preview-border);
  }
  .nav-brand { font-size: 15px; font-weight: 600; text-decoration: none; color: inherit; }
  .nav-links { display: flex; gap: 18px; list-style: none; }
  .nav-links a { font-size: 13px; font-weight: 500; color: var(--preview-muted); text-decoration: none; }
  .nav-links a:hover { color: var(--preview-body-color); }
  .nav-cta {
    display: inline-block;
    background: var(--preview-primary-bg);
    color: var(--preview-primary-fg);
    padding: 10px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }
  .hero { padding: 56px 24px; text-align: center; max-width: 720px; margin: 0 auto; }
  .hero h1 { font-size: clamp(28px, 5vw, 44px); font-weight: 600; line-height: 1.15; margin-bottom: 12px; }
  .hero h1 span { color: var(--preview-primary-bg); }
  .hero p { font-size: 16px; color: var(--preview-muted); margin-bottom: 24px; }
  .hero-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn-primary {
    display: inline-block;
    background: var(--preview-primary-bg);
    color: var(--preview-primary-fg);
    padding: 11px 22px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: none;
    cursor: pointer;
  }
  .btn-secondary {
    display: inline-block;
    background: var(--preview-surface);
    color: var(--preview-body-color);
    padding: 11px 22px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid var(--preview-border);
  }
  .section { padding: 40px 24px; max-width: 1000px; margin: 0 auto; }
  .section-label { font-size: 11px; font-weight: 700; color: var(--preview-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .section-title { font-size: 26px; font-weight: 600; line-height: 1.2; margin-bottom: 20px; }
  .section-divider { border: none; border-top: 1px solid var(--preview-border); margin: 0; }
  .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
  .color-swatch { border-radius: 10px; overflow: hidden; border: 1px solid var(--preview-border); }
  .color-swatch-block { height: 52px; }
  .color-swatch-info { padding: 8px 10px; background: var(--preview-surface); }
  .color-swatch-name { font-size: 11px; font-weight: 600; }
  .color-swatch-hex { font-size: 10px; color: var(--preview-muted); font-family: ui-monospace, monospace; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
  .card {
    background: var(--preview-surface);
    border: 1px solid var(--preview-border);
    border-radius: 12px;
    padding: 18px;
  }
  .card h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .card p { font-size: 13px; color: var(--preview-muted); }
  .button-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .form-group { margin-bottom: 14px; max-width: 380px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .form-input {
    width: 100%;
    background: var(--preview-body-bg);
    color: var(--preview-body-color);
    border: 1px solid var(--preview-border);
    padding: 10px 14px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
  }
  .form-input:focus { border-color: var(--preview-primary-bg); box-shadow: 0 0 0 2px color-mix(in srgb, var(--preview-primary-bg) 25%, transparent); }
  @media (max-width: 640px) { .nav-links { display: none; } }
</style>
</head>
<body>

<nav class="nav">
  <a class="nav-brand" href="#">awesome-design-md</a>
  <ul class="nav-links">
    <li><a href="#colors">Colors</a></li>
    <li><a href="#type">Type</a></li>
    <li><a href="#buttons">Buttons</a></li>
    <li><a href="#cards">Cards</a></li>
  </ul>
  <a class="nav-cta" href="#">Primary</a>
</nav>

<section class="hero">
  <h1>Design tokens<br><span>${escapeHtml(brandWord)}</span></h1>
  <p>Generated from DESIGN.md color roles — fork preview catalog.</p>
  <div class="hero-buttons">
    <a class="btn-primary" href="#">Primary action</a>
    <a class="btn-secondary" href="#">Secondary</a>
  </div>
</section>

<hr class="section-divider">

<section class="section" id="colors">
  <div class="section-label">Colors</div>
  <h2 class="section-title">Palette from DESIGN.md</h2>
  <div class="color-grid">${swatchRows}</div>
</section>

<hr class="section-divider">

<section class="section" id="type">
  <div class="section-label">Typography</div>
  <h2 class="section-title">Scale (Inter stand-in)</h2>
  <p style="font-size:28px;font-weight:600;margin-bottom:12px;">Display sample</p>
  <p style="font-size:18px;font-weight:500;margin-bottom:8px;">Section heading</p>
  <p style="color:var(--preview-muted);max-width:560px;">Body — tokens above drive backgrounds, borders, and accents; proprietary fonts from DESIGN.md load on the live brand.</p>
</section>

<hr class="section-divider">

<section class="section" id="buttons">
  <div class="section-label">Buttons</div>
  <h2 class="section-title">Actions</h2>
  <div class="button-row">
    <a class="btn-primary" href="#">Continue</a>
    <a class="btn-secondary" href="#">Cancel</a>
  </div>
</section>

<hr class="section-divider">

<section class="section" id="cards">
  <div class="section-label">Cards</div>
  <h2 class="section-title">Surfaces</h2>
  <div class="card-grid">
    <div class="card"><h3>Module A</h3><p>Surface uses semantic elevation from token roles.</p></div>
    <div class="card"><h3>Module B</h3><p>Hairlines and muted copy reference DESIGN.md.</p></div>
  </div>
</section>

<hr class="section-divider">

<section class="section" id="forms">
  <div class="section-label">Forms</div>
  <h2 class="section-title">Inputs</h2>
  <div class="form-group">
    <label class="form-label">Email</label>
    <input class="form-input" type="email" placeholder="you@example.com">
  </div>
</section>

</body>
</html>
`
}

for (const slug of SLUGS) {
  const dir = join(ROOT, 'design-md', slug)
  const mdPath = join(dir, 'DESIGN.md')
  if (!existsSync(mdPath)) {
    console.warn('[generate-design-previews] skip missing:', mdPath)
    continue
  }
  const raw = readFileSync(mdPath, 'utf8')
  const parsed = parseDesignMd(raw)
  if (!Object.keys(parsed.colors).length) {
    console.warn('[generate-design-previews] no colors in:', slug)
    continue
  }
  ensurePrimaryAlias(parsed.colors)
  const rootVars = colorsToRoot(parsed.colors)
  const swatches = Object.entries(parsed.colors)
  const brandWord = parsed.name.replace(/-design-analysis$/i, '').replace(/-/g, ' ')

  const lightHtml = buildHtml({
    titleLabel: `Design System Preview: ${brandWord} (Light)`,
    mode: 'light',
    rootVars,
    swatches,
    brandWord,
  })
  const darkHtml = buildHtml({
    titleLabel: `Design System Preview: ${brandWord} (Dark)`,
    mode: 'dark',
    rootVars,
    swatches,
    brandWord,
  })

  writeFileSync(join(dir, 'preview.html'), lightHtml, 'utf8')
  writeFileSync(join(dir, 'preview-dark.html'), darkHtml, 'utf8')
  console.log('[generate-design-previews] wrote', slug)
}

console.log('[generate-design-previews] done')
