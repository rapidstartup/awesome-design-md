/**
 * Hand-tuned preview.html + preview-dark.html for upstream-only DESIGN.md entries.
 * Matches Coinbase preview depth (sections 01–08). Run: node scripts/build-rich-previews.mjs
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Coinbase-style semantic slots: --white page, --black text+dark-band bg, --blue accent, etc. */
function buildHtml(p, darkMode) {
  const v = darkMode ? p.dark : p.light
  const modeLabel = darkMode ? 'Dark' : 'Light'
  const radii = p.radius || [8, 16, 24, 32, 56]
  const spaces = p.spacing || [4, 8, 16, 24, 32, 48]
  const swatchesHtml = (p.swatches || [])
    .map(
      s =>
        `<div class="color-swatch"><div class="color-swatch-block" style="background:${esc(s.hex)}"></div><div class="color-swatch-info"><div class="color-swatch-name">${esc(s.name)}</div><div class="color-swatch-hex">${esc(s.hex)}</div><div class="color-swatch-role">${esc(s.role || '')}</div></div></div>`
    )
    .join('\n')
  const typesHtml = (p.types || [])
    .map(t => `<div class="type-sample">${t.html}<div class="type-meta">${esc(t.meta)}</div></div>`)
    .join('\n')
  const cardsHtml = (p.cards || [])
    .map(c => `<div class="card"><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></div>`)
    .join('\n')
  const radiusHtml = radii
    .map((r, i) => {
      const br = r >= 100 ? '9999px' : `${r}px`
      const label = r >= 100 ? 'pill' : `${r}px`
      return `<div class="radius-item"><div class="radius-box" style="border-radius:${br}${r >= 100 ? ';width:52px;height:52px' : ''}"></div><div class="radius-label">${label}</div></div>`
    })
    .join('')
  const spacingHtml = spaces
    .map(
      s =>
        `<div class="spacing-item"><div class="spacing-block" style="width:${s}px"></div><div class="spacing-value">${s}</div></div>`
    )
    .join('')

  const ibg = v.inverseBandBg ?? v.black
  const ifg = v.inverseBandFg ?? v.white
  const cbg = v.cardOnBandBg ?? v.white
  const ch = v.cardOnBandHeading ?? v.black
  const cm = v.cardOnBandMuted ?? v.muted

  const root = `:root {
  --white:${v.white};
  --black:${v.black};
  --blue:${v.blue};
  --hover-blue:${v.hoverBlue};
  --gray-surface:${v.graySurface};
  --dark:${v.dark};
  --muted:${v.muted};
  --cta-text:${v.ctaText ?? '#ffffff'};
  --hero-accent:${v.heroAccent ?? v.blue};
  --inverse-band-bg:${ibg};
  --inverse-band-fg:${ifg};
  --card-on-band-bg:${cbg};
  --card-on-band-heading:${ch};
  --card-on-band-muted:${cm};
}`

  const badgeBg = v.blue
  const badgeFg = v.ctaText ?? '#ffffff'

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Design System Preview: ${esc(p.brand)} (${modeLabel})</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(p.fonts)}" rel="stylesheet">
<style>
  ${root}
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--white); color:var(--black); font-family:${p.fontCss}; font-size:16px; line-height:1.50; -webkit-font-smoothing:antialiased; }
  .hero h1 span { color:var(--hero-accent); }
  .nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 24px; background:var(--white); border-bottom:1px solid var(--gray-surface); }
  .nav-brand { font-size:16px; font-weight:600; color:var(--black); text-decoration:none; }
  .nav-links { display:flex; gap:20px; list-style:none; }
  .nav-links a { font-size:14px; font-weight:600; color:var(--muted); text-decoration:none; }
  .nav-links a:hover { color:var(--black); }
  .nav-cta { display:inline-block; background:var(--blue); color:var(--cta-text); padding:10px 24px; border-radius:${p.navRadius ?? '56px'}; font-size:14px; font-weight:600; text-decoration:none; }

  .hero { padding:80px 24px; text-align:center; }
  .hero h1 { font-size:clamp(36px,6vw,64px); font-weight:${p.heroWeight ?? 600}; line-height:1.05; margin-bottom:16px; }
  .hero p { font-size:18px; color:var(--muted); max-width:560px; margin:0 auto 32px; }
  .hero-buttons { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .btn-blue { display:inline-block; background:var(--blue); color:var(--cta-text); padding:12px 28px; border-radius:${p.btnRadius ?? '56px'}; font-size:16px; font-weight:600; text-decoration:none; border:none; cursor:pointer; transition:background 0.2s; }
  .btn-blue:hover { background:var(--hover-blue); }
  .btn-gray { display:inline-block; background:var(--gray-surface); color:var(--black); padding:12px 28px; border-radius:${p.btnRadius ?? '56px'}; font-size:16px; font-weight:600; text-decoration:none; border:none; cursor:pointer; transition:opacity 0.2s; }
  .btn-dark { display:inline-block; background:var(--dark); color:#ffffff; padding:12px 28px; border-radius:${p.btnRadius ?? '56px'}; font-size:16px; font-weight:600; text-decoration:none; }
  .btn-outline { display:inline-block; background:transparent; color:var(--blue); padding:12px 28px; border-radius:${p.btnRadius ?? '56px'}; border:1px solid var(--blue); font-size:16px; font-weight:600; text-decoration:none; }

  .section { padding:48px 24px; max-width:1100px; margin:0 auto; }
  .section-dark { padding:48px 24px; background:var(--inverse-band-bg); color:var(--inverse-band-fg); }
  .section-dark .inner { max-width:1100px; margin:0 auto; }
  .section-label { font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }
  .section-dark .section-label { color:color-mix(in srgb, var(--inverse-band-fg) 55%, transparent); }
  .section-title { font-size:36px; font-weight:${p.sectionTitleWeight ?? 600}; line-height:1.11; margin-bottom:24px; }
  .section-dark .section-title { color:var(--inverse-band-fg); }
  .section-divider { border:none; border-top:1px solid var(--gray-surface); margin:0; }

  .color-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(140px,1fr)); gap:10px; margin-bottom:20px; }
  .color-swatch { border-radius:12px; overflow:hidden; border:1px solid var(--gray-surface); }
  .color-swatch-block { height:60px; }
  .color-swatch-info { padding:8px 10px; background:var(--white); }
  .section-dark .color-swatch-info { background:var(--card-on-band-bg); }
  .color-swatch-name { font-size:12px; font-weight:600; margin-bottom:2px; }
  .color-swatch-hex { font-size:10px; color:var(--muted); font-family:monospace; }
  .color-swatch-role { font-size:9px; color:var(--muted); margin-top:2px; }
  .color-group-label { font-size:12px; font-weight:600; color:var(--muted); margin:20px 0 8px; }

  .type-sample { margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--gray-surface); }
  .type-sample:last-child { border-bottom:none; }
  .type-meta { font-size:10px; color:var(--muted); margin-top:4px; font-family:monospace; }

  .button-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
  .button-item { text-align:center; }
  .button-label { font-size:10px; color:var(--muted); margin-top:6px; }

  .card-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:12px; }
  .card { background:var(--card-on-band-bg); border:1px solid color-mix(in srgb, var(--inverse-band-fg) 14%, transparent); border-radius:${p.cardRadius ?? '16px'}; padding:20px; }
  .card h3 { font-size:18px; font-weight:600; margin-bottom:8px; color:var(--card-on-band-heading); }
  .card p { font-size:14px; color:var(--card-on-band-muted); }

  .form-group { margin-bottom:16px; max-width:400px; }
  .form-label { display:block; font-size:14px; font-weight:600; margin-bottom:4px; }
  .form-input { width:100%; background:var(--white); color:var(--black); border:1px solid color-mix(in srgb, var(--black) 14%, transparent); padding:12px 16px; border-radius:${p.inputRadius ?? '12px'}; font-family:inherit; font-size:16px; outline:none; }
  .form-input:focus { border-color:var(--blue); box-shadow:0 0 0 1px var(--blue); }
  .form-input--focus { border-color:var(--blue); box-shadow:0 0 0 1px var(--blue); }
  .form-input--error { border-color:#dc2626; box-shadow:0 0 0 1px #dc2626; }
  .form-textarea { width:100%; min-height:80px; background:var(--white); color:var(--black); border:1px solid color-mix(in srgb, var(--black) 14%, transparent); padding:12px 16px; border-radius:${p.inputRadius ?? '12px'}; font-size:16px; resize:vertical; outline:none; font-family:inherit; }
  .form-state-label { font-size:9px; color:var(--muted); margin-top:4px; }

  .spacing-row { display:flex; align-items:flex-end; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .spacing-item { text-align:center; }
  .spacing-block { background:var(--blue); border-radius:4px; margin-bottom:4px; height:24px; }
  .spacing-value { font-size:9px; color:var(--muted); font-family:monospace; }

  .radius-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
  .radius-item { text-align:center; }
  .radius-box { width:52px; height:52px; background:var(--gray-surface); margin-bottom:4px; }
  .radius-label { font-size:9px; color:var(--muted); font-family:monospace; }

  .elevation-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:12px; }
  .elevation-card { background:var(--white); border:1px solid var(--gray-surface); border-radius:16px; padding:16px; text-align:center; }
  .elevation-label { font-size:13px; font-weight:600; margin-bottom:4px; color:var(--black); }
  .elevation-desc { font-size:9px; color:var(--muted); font-family:monospace; }

  .footer { padding:24px; text-align:center; background:var(--black); color:var(--muted); font-size:12px; }
  .footer a { color:var(--blue); text-decoration:underline; }
  ${p.extraCss || ''}

  @media (max-width:768px) { .nav-links { display:none; } .section { padding:32px 16px; } .card-grid { grid-template-columns:1fr; } }
</style>
</head>
<body>

<nav class="nav"><a class="nav-brand" href="#">awesome-design-md</a><ul class="nav-links"><li><a href="#colors">Colors</a></li><li><a href="#typography">Typography</a></li><li><a href="#buttons">Buttons</a></li><li><a href="#cards">Cards</a></li><li><a href="#forms">Forms</a></li></ul><a class="nav-cta" href="#">${esc(p.ctaNav || 'Explore')}</a></nav>
<div style="position:fixed;top:16px;right:16px;z-index:200;background:${badgeBg};color:${badgeFg};font-size:10px;font-weight:600;padding:4px 12px;border-radius:56px;">${modeLabel} preview</div>

<section class="hero"><h1>Design System<br>Inspired by <span>${esc(p.brand)}</span></h1><p>${esc(p.tagline)}</p><div class="hero-buttons"><a class="btn-blue" href="#">${esc(p.primaryCta || 'Primary')}</a><a class="btn-gray" href="#">${esc(p.secondaryCta || 'Secondary')}</a></div></section>

<hr class="section-divider">

<section class="section" id="colors"><div class="section-label">01 / Colors</div><h2 class="section-title">Color Palette</h2>
<div class="color-group-label">Brand & surfaces</div>
<div class="color-grid">
${swatchesHtml}
</div></section>

<hr class="section-divider">

<section class="section" id="typography"><div class="section-label">02 / Typography</div><h2 class="section-title">Typography Scale</h2>
${typesHtml}
</section>

<hr class="section-divider">

<section class="section" id="buttons"><div class="section-label">03 / Buttons</div><h2 class="section-title">Buttons</h2>
<div class="button-row">
<div class="button-item"><a class="btn-blue" href="#">${esc(p.btnPrimaryLabel || 'Primary')}</a><div class="button-label">${esc(p.btnPrimaryNote || 'Accent fill')}</div></div>
<div class="button-item"><a class="btn-gray" href="#">Secondary</a><div class="button-label">Surface</div></div>
<div class="button-item"><a class="btn-dark" href="#">Solid</a><div class="button-label">Ink / dense</div></div>
<div class="button-item"><a class="btn-outline" href="#">Outline</a><div class="button-label">Stroke</div></div>
</div></section>

<div class="section-dark"><div class="inner" id="cards"><div class="section-label">04 / Cards</div><h2 class="section-title">Cards</h2>
<div class="card-grid">
${cardsHtml}
</div></div></div>

<section class="section" id="forms"><div class="section-label">05 / Forms</div><h2 class="section-title">Forms</h2>
<div class="form-group"><label class="form-label">Email</label><input class="form-input" type="email" placeholder="you@example.com"><div class="form-state-label">Default</div></div>
<div class="form-group"><label class="form-label">Focus</label><input class="form-input form-input--focus" type="text" value="Focused field"><div class="form-state-label">Focus ring</div></div>
<div class="form-group"><label class="form-label">Error</label><input class="form-input form-input--error" type="text" value="invalid"><div class="form-state-label">Validation</div></div>
<div class="form-group"><label class="form-label">Note</label><textarea class="form-textarea" placeholder="Optional message"></textarea></div>
</section>

<hr class="section-divider">

<section class="section"><div class="section-label">06 / Spacing</div><h2 class="section-title">Spacing</h2>
<div class="spacing-row">${spacingHtml}</div></section>

<hr class="section-divider">

<section class="section"><div class="section-label">07 / Radius</div><h2 class="section-title">Radius</h2>
<div class="radius-row">${radiusHtml}</div></section>

<hr class="section-divider">

<section class="section"><div class="section-label">08 / Elevation</div><h2 class="section-title">Depth</h2>
<div class="elevation-grid"><div class="elevation-card"><div class="elevation-label">Flat</div><div class="elevation-desc">${esc(p.elevationFlat || 'No shadow')}</div></div><div class="elevation-card" style="box-shadow:0 0 0 1px var(--blue);"><div class="elevation-label">Focus</div><div class="elevation-desc">Accent ring</div></div></div></section>

<footer class="footer">Generated from <a href="${esc(p.url)}">${esc(p.domain || p.brand)}</a> DESIGN.md — awesome-design-md</footer>

</body>
</html>`
}

const PRESETS = {}

function add(slug, p) {
  PRESETS[slug] = p
}

add('binance', {
  brand: 'Binance',
  domain: 'binance.com',
  url: 'https://binance.com',
  fonts: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
  fontCss: "'DM Sans',system-ui,sans-serif",
  tagline: 'Near-black trading canvas, Binance yellow CTAs, hairline grids, green/red motion semantics.',
  btnRadius: '6px',
  navRadius: '6px',
  cardRadius: '8px',
  inputRadius: '6px',
  heroWeight: 700,
  primaryCta: 'Buy crypto',
  secondaryCta: 'Markets',
  ctaNav: 'Register',
  elevationFlat: 'Data-dense chrome',
  light: {
    white: '#ffffff',
    black: '#181a20',
    blue: '#fcd535',
    hoverBlue: '#f0b90b',
    graySurface: '#eaecef',
    dark: '#1e2329',
    muted: '#707a8a',
    ctaText: '#181a20',
    heroAccent: '#fcd535',
  },
  dark: {
    white: '#0b0e11',
    black: '#eaecef',
    blue: '#fcd535',
    hoverBlue: '#f0b90b',
    graySurface: '#2b3139',
    dark: '#1e2329',
    muted: '#929aa5',
    ctaText: '#181a20',
    heroAccent: '#fcd535',
  },
  swatches: [
    { name: 'Primary yellow', hex: '#fcd535', role: 'CTA / brand voltage' },
    { name: 'Primary active', hex: '#f0b90b', role: 'Hover / pressed' },
    { name: 'Canvas dark', hex: '#0b0e11', role: 'Marketing shell' },
    { name: 'Ink', hex: '#181a20', role: 'On-light type' },
    { name: 'Body on dark', hex: '#eaecef', role: 'Primary copy on dark UI' },
    { name: 'Card dark', hex: '#1e2329', role: 'Elevated panels' },
    { name: 'Trading up', hex: '#0ecb81', role: 'Positive ticks' },
    { name: 'Trading down', hex: '#f6465d', role: 'Negative ticks' },
    { name: 'Muted', hex: '#707a8a', role: 'Secondary labels' },
    { name: 'Hairline dark', hex: '#2b3139', role: 'Separators' },
  ],
  types: [
    { html: '<div style="font-size:48px;font-weight:700;line-height:1.1;letter-spacing:-0.03em;">Spot grid</div>', meta: 'BinanceNova — display / tight tracking' },
    { html: '<div style="font-size:28px;font-weight:600;line-height:1.2;">Earn · Trade · Square</div>', meta: 'Title md — product rails' },
    { html: '<div style="font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;">92,431.05 USDT</div>', meta: 'BinancePlex numbers — tabular' },
    { html: '<div style="font-size:14px;font-weight:400;line-height:1.5;color:var(--muted);">Unified cash & margin routes — precision over ornament.</div>', meta: 'Body md — neutral prose' },
  ],
  cards: [
    { t: 'BTC perpetual', d: 'Deep liquidity tier with isolated margin presets and borrow telemetry.' },
    { t: 'Launchpool', d: 'Soft-stake flows with countdown rails and subscription caps.' },
    { t: 'Alpha alerts', d: 'Structured volatility notices with turquoise info pills.' },
  ],
  radius: [2, 4, 6, 8, 12],
  spacing: [4, 8, 12, 16, 24, 32],
})

add('bmw-m', {
  brand: 'BMW M',
  domain: 'bmw.com/m',
  url: 'https://www.bmw.com/en_bmwm/index.html',
  fonts: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap',
  fontCss: "'IBM Plex Sans',system-ui,sans-serif",
  tagline: 'True black canvas, BMW Type Next uppercase gravity, M tricolor voltage on motorsport chrome.',
  btnRadius: '0',
  navRadius: '0',
  cardRadius: '0',
  inputRadius: '4px',
  heroWeight: 700,
  sectionTitleWeight: 700,
  primaryCta: 'Configure',
  secondaryCta: 'Discover',
  ctaNav: 'Models',
  elevationFlat: 'Photography carries depth',
  light: {
    white: '#000000',
    black: '#ffffff',
    blue: '#ffffff',
    hoverBlue: '#e6e6e6',
    graySurface: '#262626',
    dark: '#1a1a1a',
    muted: '#7e7e7e',
    ctaText: '#000000',
    heroAccent: '#0066b1',
    inverseBandBg: '#ececec',
    inverseBandFg: '#111111',
    cardOnBandBg: '#141414',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#bbbbbb',
  },
  dark: {
    white: '#050505',
    black: '#f2f2f2',
    blue: '#ffffff',
    hoverBlue: '#dddddd',
    graySurface: '#1f1f1f',
    dark: '#111111',
    muted: '#8a8a8a',
    ctaText: '#000000',
    heroAccent: '#1c69d4',
    inverseBandBg: '#2a2a2a',
    inverseBandFg: '#fafafa',
    cardOnBandBg: '#080808',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#c8c8c8',
  },
  extraCss: `.hero h1 { text-transform:uppercase; letter-spacing:0.04em; font-size:clamp(32px,5vw,52px);}`,
  swatches: [
    { name: 'Canvas', hex: '#000000', role: 'Motorsport shell' },
    { name: 'M light blue', hex: '#0066b1', role: 'Tricolor lead' },
    { name: 'M dark blue', hex: '#1c69d4', role: 'Brand chroma' },
    { name: 'M red', hex: '#e22718', role: 'Accent stripe' },
    { name: 'Surface card', hex: '#1a1a1a', role: 'Panels' },
    { name: 'Body', hex: '#bbbbbb', role: 'Supporting copy' },
    { name: 'Hairline', hex: '#3c3c3c', role: 'Structure' },
    { name: 'Warning', hex: '#f4b400', role: 'Alerts' },
  ],
  types: [
    { html: '<div style="font-size:56px;font-weight:700;line-height:1;text-transform:uppercase;">M3 Competition</div>', meta: 'Display — BMW Type Next Latin' },
    { html: '<div style="font-size:14px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">/// Motorsport</div>', meta: 'Label uppercase / tracked' },
    { html: '<div style="font-size:16px;font-weight:300;line-height:1.5;color:#bbbbbb;">Carbon roof, M compound brakes, adaptive M suspension.</div>', meta: 'Body Light — engineered cadence' },
  ],
  cards: [
    { t: 'M Performance kit', d: 'Aero blades, kidney surrounds, and exhaust finisher programs.' },
    { t: 'Track telemetry', d: 'Lap overlays with tire compound tagging and coachmarks.' },
    { t: 'Driver coaching', d: 'Steering angle traces exported to M Race app sessions.' },
  ],
  radius: [0, 2, 4, 6],
  spacing: [4, 8, 12, 16, 24, 40],
})

add('bugatti', {
  brand: 'Bugatti',
  domain: 'bugatti.com',
  url: 'https://bugatti.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap',
  fontCss: "'Instrument Sans',system-ui,sans-serif",
  tagline: 'Absolute black void, wide-track display type, zero decorative chrome — photography only.',
  btnRadius: '0',
  navRadius: '0',
  cardRadius: '0',
  inputRadius: '0',
  heroWeight: 400,
  sectionTitleWeight: 400,
  primaryCta: 'Discover',
  secondaryCta: 'Heritage',
  ctaNav: 'Models',
  elevationFlat: 'No elevation language',
  light: {
    white: '#000000',
    black: '#ffffff',
    blue: '#ffffff',
    hoverBlue: '#e6e6e6',
    graySurface: '#1f1f1f',
    dark: '#141414',
    muted: '#999999',
    ctaText: '#000000',
    heroAccent: '#c3d9f3',
    inverseBandBg: '#e5e5e5',
    inverseBandFg: '#141414',
    cardOnBandBg: '#0d0d0d',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#c8c8c8',
  },
  dark: {
    white: '#020202',
    black: '#f5f5f5',
    blue: '#ffffff',
    hoverBlue: '#dedede',
    graySurface: '#1a1a1a',
    dark: '#0d0d0d',
    muted: '#777777',
    ctaText: '#000000',
    heroAccent: '#c3d9f3',
    inverseBandBg: '#2c2c2c',
    inverseBandFg: '#fafafa',
    cardOnBandBg: '#080808',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#bdbdbd',
  },
  extraCss: `.hero h1 { letter-spacing:0.18em; text-transform:uppercase; font-size:clamp(28px,4.5vw,44px);}`,
  swatches: [
    { name: 'Canvas', hex: '#000000', role: 'Cathedral black' },
    { name: 'Primary white', hex: '#ffffff', role: 'CTA fill /type' },
    { name: 'Body', hex: '#cccccc', role: 'Secondary copy' },
    { name: 'Surface card', hex: '#141414', role: 'Elevated plane' },
    { name: 'Hairline', hex: '#262626', role: 'Quiet structure' },
    { name: 'Link ice', hex: '#c3d9f3', role: 'Hyperlink frost' },
  ],
  types: [
    { html: '<div style="font-size:52px;font-weight:400;line-height:1.1;letter-spacing:0.2em;text-transform:uppercase;">Chiron</div>', meta: 'Bugatti Display — spaced caps' },
    { html: '<div style="font-size:15px;font-weight:500;letter-spacing:0.3em;text-transform:uppercase;">Engineering art</div>', meta: 'Micro title — monospace cadence' },
    { html: '<div style="font-size:15px;font-weight:400;line-height:1.6;color:#999;">No gradients. No shadows. Only velocity carved in light.</div>', meta: 'Bugatti Text Regular' },
  ],
  cards: [
    { t: 'Sur Mesure', d: 'Palette-atelier sessions with coachbuilt surfacing studies.' },
    { t: 'Atelier notes', d: 'Carbon weave orientation mapped per panel quadrant.' },
    { t: 'Test chamber', d: 'Thermal imaging overlays for W16 thermal deltas.' },
  ],
  radius: [0, 0, 2, 4],
  spacing: [4, 8, 16, 24, 32, 48],
})

add('ferrari', {
  brand: 'Ferrari',
  domain: 'ferrari.com',
  url: 'https://ferrari.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Cinematic near-black canvas with Rosso Corsa voltage on scarce CTAs.',
  btnRadius: '4px',
  navRadius: '4px',
  cardRadius: '12px',
  inputRadius: '8px',
  heroWeight: 600,
  primaryCta: 'Configure',
  secondaryCta: 'Dealers',
  ctaNav: 'Garage',
  elevationFlat: 'Photographic depth only',
  light: {
    white: '#181818',
    black: '#ffffff',
    blue: '#da291c',
    hoverBlue: '#b01e0a',
    graySurface: '#303030',
    dark: '#303030',
    muted: '#969696',
    ctaText: '#ffffff',
    heroAccent: '#da291c',
    inverseBandBg: '#f1f1f1',
    inverseBandFg: '#181818',
    cardOnBandBg: '#303030',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#cfcfcf',
  },
  dark: {
    white: '#101010',
    black: '#f7f7f7',
    blue: '#da291c',
    hoverBlue: '#9d2211',
    graySurface: '#2a2a2a',
    dark: '#262626',
    muted: '#a8a8a8',
    ctaText: '#ffffff',
    heroAccent: '#fff200',
    inverseBandBg: '#2f2f2f',
    inverseBandFg: '#f7f7f7',
    cardOnBandBg: '#1f1f1f',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#cfcfcf',
  },
  swatches: [
    { name: 'Rosso Corsa', hex: '#da291c', role: 'Primary voltage' },
    { name: 'Canvas', hex: '#181818', role: 'Editorial shell' },
    { name: 'Surface card', hex: '#303030', role: 'Panels / tables' },
    { name: 'Hypersail yellow', hex: '#fff200', role: 'Motorsport accent' },
    { name: 'Ink', hex: '#ffffff', role: 'Display type' },
    { name: 'Body', hex: '#969696', role: 'Supporting copy' },
    { name: 'Canvas light', hex: '#ffffff', role: 'Transactional flip' },
  ],
  types: [
    { html: '<div style="font-size:54px;font-weight:500;line-height:1;">812 Competizione</div>', meta: 'FerrariSans display — cinematic' },
    { html: '<div style="font-size:20px;font-weight:500;color:#da291c;">Corse Clienti</div>', meta: 'Accent title' },
    { html: '<div style="font-size:15px;font-weight:400;line-height:1.55;color:#969696;">Wind-tunnel sculpted panels with racing stripe lineage.</div>', meta: 'Body — restrained contrast' },
  ],
  cards: [
    { t: 'Assetto Fiorano pack', d: 'Magnesium wheels, scoops, and multimatic dampers calibrated for dry laps.' },
    { t: 'Tailor Made', d: 'Heritage leather dyes matched to chassis archival swatches.' },
    { t: 'Classiche certification', d: 'Blueprint authenticity with photographic provenance vault.' },
  ],
  radius: [4, 8, 12, 16],
  spacing: [4, 8, 16, 24, 32, 64],
})

add('lamborghini', {
  brand: 'Lamborghini',
  domain: 'lamborghini.com',
  url: 'https://lamborghini.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap',
  fontCss: "'Barlow Condensed',system-ui,sans-serif",
  tagline: 'Absolute black theatre, Lamborghini Gold CTAs, uppercase velocity, zero-radius blades.',
  btnRadius: '0',
  navRadius: '0',
  cardRadius: '0',
  inputRadius: '0',
  heroWeight: 700,
  sectionTitleWeight: 700,
  primaryCta: 'Discover',
  secondaryCta: 'Motorsport',
  ctaNav: 'Models',
  elevationFlat: 'No shadows — light as drama',
  light: {
    white: '#000000',
    black: '#ffffff',
    blue: '#ffc000',
    hoverBlue: '#917300',
    graySurface: '#202020',
    dark: '#181818',
    muted: '#969696',
    ctaText: '#000000',
    heroAccent: '#ffc000',
    inverseBandBg: '#dcdcdc',
    inverseBandFg: '#111111',
    cardOnBandBg: '#141414',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#cfcfcf',
  },
  dark: {
    white: '#000000',
    black: '#f8f8f8',
    blue: '#ffc000',
    hoverBlue: '#ffce3e',
    graySurface: '#141414',
    dark: '#101010',
    muted: '#9d9d9d',
    ctaText: '#000000',
    heroAccent: '#29abe2',
    inverseBandBg: '#242424',
    inverseBandFg: '#fafafa',
    cardOnBandBg: '#0d0d0d',
    cardOnBandHeading: '#ffffff',
    cardOnBandMuted: '#cfcfcf',
  },
  extraCss: `.hero h1 { text-transform:uppercase; letter-spacing:0.06em;}`,
  swatches: [
    { name: 'Lamborghini Gold', hex: '#ffc000', role: 'Primary CTA' },
    { name: 'Absolute Black', hex: '#000000', role: 'Void canvas' },
    { name: 'Dark Gold', hex: '#917300', role: 'Pressed gold' },
    { name: 'Cyan pulse', hex: '#29abe2', role: 'Telemetry accent' },
    { name: 'Charcoal', hex: '#202020', role: 'Panels above void' },
    { name: 'Smoke text', hex: '#f5f5f5', role: 'Secondary bright copy' },
  ],
  types: [
    { html: '<div style="font-size:72px;font-weight:700;line-height:0.92;text-transform:uppercase;">Revuelto</div>', meta: 'LamboType display — stamped steel' },
    { html: '<div style="font-size:18px;font-weight:600;letter-spacing:0.25em;text-transform:uppercase;">Ad Personam</div>', meta: 'Uppercase micro choir' },
    { html: '<div style="font-size:14px;font-weight:400;line-height:1.5;color:#969696;">Hexagonal pause glyphs mirror fighter-canopy geometry.</div>', meta: 'Body — tactical whitespace' },
  ],
  cards: [
    { t: 'Telemetry lap', d: 'Yaw traces overlaid on Sachs dampening maps per circuit preset.' },
    { t: 'Carbon forged ring', d: 'Rotor bells tinted via oxidized titanium spectrum packs.' },
    { t: 'Essenza SCV12', d: 'Track-only program with FIA-grade endurance fuel protocols.' },
  ],
  radius: [0, 4, 8],
  spacing: [4, 8, 16, 24, 32],
})

add('mastercard', {
  brand: 'Mastercard',
  domain: 'mastercard.com',
  url: 'https://mastercard.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  fontCss: "'Plus Jakarta Sans',system-ui,sans-serif",
  tagline: 'Warm cream editorial canvas, orbital circles, signal orange eyebrow dots, ink-black pills.',
  btnRadius: '20px',
  navRadius: '99px',
  cardRadius: '40px',
  inputRadius: '16px',
  heroWeight: 600,
  primaryCta: 'Start journey',
  secondaryCta: 'Explore',
  ctaNav: 'Solutions',
  elevationFlat: 'Arc diagrams replace shadows',
  light: {
    white: '#f3f0ee',
    black: '#141413',
    blue: '#141413',
    hoverBlue: '#262627',
    graySurface: '#fcfbfa',
    dark: '#141413',
    muted: '#696969',
    ctaText: '#ffffff',
    heroAccent: '#cf4500',
  },
  dark: {
    white: '#141413',
    black: '#f3f0ee',
    blue: '#ffffff',
    hoverBlue: '#e8e4df',
    graySurface: '#262624',
    dark: '#000000',
    muted: '#b8b3ad',
    ctaText: '#141413',
    heroAccent: '#f37338',
  },
  swatches: [
    { name: 'Canvas cream', hex: '#f3f0ee', role: 'Editorial field' },
    { name: 'Ink black', hex: '#141413', role: 'CTA & headlines' },
    { name: 'Signal orange', hex: '#cf4500', role: 'Consent / alerts' },
    { name: 'Light signal', hex: '#f37338', role: 'Carousel ticks' },
    { name: 'Mastercard red', hex: '#eb001b', role: 'Logo mark only' },
    { name: 'Mastercard yellow', hex: '#f79e1b', role: 'Logo mark only' },
    { name: 'Clay brown', hex: '#9a3a0a', role: 'Secondary links' },
  ],
  types: [
    { html: '<div style="font-size:42px;font-weight:500;line-height:1.1;letter-spacing:-0.02em;">Priceless possibilities</div>', meta: 'MarkForMC — magazine cadence' },
    { html: '<div style="font-size:14px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#cf4500;">● Insights</div>', meta: 'Eyebrow dot + caps' },
    { html: '<div style="font-size:16px;font-weight:450;line-height:1.65;color:#555;">Circular portraits dock satellite CTAs on traced orange rails.</div>', meta: 'Body — 450wt softness' },
  ],
  cards: [
    { t: 'Small business uplift', d: 'Dynamic interchange dashboards with fraud-score overlays.' },
    { t: 'Transit wallets', d: 'Tokenized fare caps stitched to municipal ridership APIs.' },
    { t: 'Carbon insights', d: 'Merchant cohort footprints rendered as orbital timelines.' },
  ],
  radius: [20, 40, 99, 1000],
  spacing: [4, 8, 16, 24, 32, 48],
})

add('meta', {
  brand: 'Meta Store',
  domain: 'meta.com',
  url: 'https://www.meta.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Optimistic retail typography, cobalt purchase CTAs, pill silhouettes, photographic PDP grids.',
  btnRadius: '100px',
  navRadius: '100px',
  cardRadius: '24px',
  inputRadius: '16px',
  heroWeight: 500,
  sectionTitleWeight: 500,
  primaryCta: 'Buy now',
  secondaryCta: 'Compare',
  ctaNav: 'Shop',
  elevationFlat: 'Surfaces stay photographic',
  light: {
    white: '#ffffff',
    black: '#1c1e21',
    blue: '#0064e0',
    hoverBlue: '#0457cb',
    graySurface: '#f1f4f7',
    dark: '#000000',
    muted: '#5d6c7b',
    ctaText: '#ffffff',
    heroAccent: '#0064e0',
  },
  dark: {
    white: '#0a1317',
    black: '#f1f4f7',
    blue: '#0091ff',
    hoverBlue: '#57b0ff',
    graySurface: '#1c2428',
    dark: '#000000',
    muted: '#8595a4',
    ctaText: '#ffffff',
    heroAccent: '#1876f2',
  },
  swatches: [
    { name: 'Primary cobalt', hex: '#0064e0', role: 'Commerce CTA' },
    { name: 'Ink', hex: '#1c1e21', role: 'Body copy' },
    { name: 'Canvas', hex: '#ffffff', role: 'Retail shell' },
    { name: 'Surface soft', hex: '#f1f4f7', role: 'Secondary planes' },
    { name: 'Hairline', hex: '#ced0d4', role: 'Chrome rules' },
    { name: 'Success', hex: '#31a24c', role: 'Positive states' },
    { name: 'Attention', hex: '#f2a918', role: 'Calls-to-attention' },
  ],
  types: [
    { html: '<div style="font-size:52px;font-weight:500;line-height:1.16;">Quest 3</div>', meta: 'Optimistic VF substitute — display calm' },
    { html: '<div style="font-size:28px;font-weight:300;line-height:1.21;">Ray-Ban Meta</div>', meta: 'Heading md — airy thin weight' },
    { html: '<div style="font-size:16px;font-weight:400;line-height:1.5;color:#5d6c7b;">Dual-CTA heroes pair ink-black fills with hairline secondaries.</div>', meta: 'Body md — neutral descriptive' },
  ],
  cards: [
    { t: 'Ray-Ban Meta AI', d: 'Live translation captions with HUD-safe luminance curves.' },
    { t: 'Quest accessories', d: 'Elite straps batched with guardian boundary presets.' },
    { t: 'Workrooms', d: 'Desk telemetry fused with passthrough desk anchors.' },
  ],
  radius: [12, 24, 32, 100],
  spacing: [8, 16, 24, 32, 48],
})

add('nike', {
  brand: 'Nike',
  domain: 'nike.com',
  url: 'https://nike.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Campaign Futura lockups, monochrome commerce chrome, pill CTAs, kinetic photography.',
  btnRadius: '9999px',
  navRadius: '9999px',
  cardRadius: '8px',
  inputRadius: '8px',
  heroWeight: 700,
  sectionTitleWeight: 600,
  primaryCta: 'Shop launch',
  secondaryCta: 'Explore',
  ctaNav: 'New',
  extraCss: `.hero h1 span { font-family:'Oswald','Arial Narrow',sans-serif; letter-spacing:0.02em; text-transform:uppercase; }`,
  elevationFlat: 'Panels float on neutral rails',
  light: {
    white: '#ffffff',
    black: '#111111',
    blue: '#111111',
    hoverBlue: '#39393b',
    graySurface: '#f5f5f5',
    dark: '#111111',
    muted: '#707072',
    ctaText: '#ffffff',
    heroAccent: '#111111',
  },
  dark: {
    white: '#111111',
    black: '#ffffff',
    blue: '#ffffff',
    hoverBlue: '#e5e5e5',
    graySurface: '#2a2a2a',
    dark: '#000000',
    muted: '#b5b5b7',
    ctaText: '#111111',
    heroAccent: '#ffffff',
  },
  swatches: [
    { name: 'Ink black', hex: '#111111', role: 'Campaign + CTA' },
    { name: 'Canvas', hex: '#ffffff', role: 'Retail field' },
    { name: 'Soft cloud', hex: '#f5f5f5', role: 'Pills + filters' },
    { name: 'Sale red', hex: '#d30005', role: 'Promotion signal' },
    { name: 'Success green', hex: '#007d48', role: 'Positive commerce' },
    { name: 'Info blue', hex: '#1151ff', role: 'Utility chroma' },
    { name: 'Hairline', hex: '#cacacb', role: 'Grid rails' },
  ],
  types: [
    { html: '<div style="font-family:Oswald,sans-serif;font-size:72px;line-height:0.95;text-transform:uppercase;">AIR MAX</div>', meta: 'Futura ND substitute — campaign stack' },
    { html: '<div style="font-size:18px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Running</div>', meta: 'Section eyebrow — kinetic caps' },
    { html: '<div style="font-size:15px;line-height:1.55;color:#707072;">SNKRS drops pair monospace countdowns with tonal photography masks.</div>', meta: 'Inter — inventory voice' },
  ],
  cards: [
    { t: 'Pegasus Premium', d: 'ZoomX strobel paired with waffle traction maps per terrain dataset.' },
    { t: 'Member unlock', d: 'Geo-fenced reservations with adaptive queue latency messaging.' },
    { t: 'Nike Well Collective', d: 'Coach-led sessions stitched to Apple Health cohort insights.' },
  ],
  radius: [8, 16, 24, 9999],
  spacing: [4, 8, 16, 24, 32, 48],
})

add('playstation', {
  brand: 'PlayStation',
  domain: 'playstation.com',
  url: 'https://playstation.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  fontCss: "'Outfit',system-ui,sans-serif",
  tagline: 'Chaptered black / white / PS Blue canvases, SST-light display, pill commerce CTAs.',
  btnRadius: '9999px',
  navRadius: '9999px',
  cardRadius: '8px',
  inputRadius: '8px',
  heroWeight: 300,
  sectionTitleWeight: 600,
  primaryCta: 'Buy PS5',
  secondaryCta: 'Games',
  ctaNav: 'Store',
  elevationFlat: 'Dividers replace elevation',
  light: {
    white: '#ffffff',
    black: '#000000',
    blue: '#0070d1',
    hoverBlue: '#0064b7',
    graySurface: '#f5f7fa',
    dark: '#181818',
    muted: '#6b6b6b',
    ctaText: '#ffffff',
    heroAccent: '#0070d1',
  },
  dark: {
    white: '#000000',
    black: '#ffffff',
    blue: '#0070d1',
    hoverBlue: '#53b1ff',
    graySurface: '#181818',
    dark: '#121314',
    muted: 'rgba(229,229,229,0.65)',
    ctaText: '#ffffff',
    heroAccent: '#53b1ff',
  },
  swatches: [
    { name: 'PlayStation Blue', hex: '#0070d1', role: 'Primary CTA' },
    { name: 'Canvas light', hex: '#ffffff', role: 'Hero chapters' },
    { name: 'Canvas dark', hex: '#000000', role: 'Cinematic bands' },
    { name: 'Ink elevated', hex: '#181818', role: 'Nav density' },
    { name: 'Commerce orange', hex: '#d53b00', role: 'Retail accents' },
    { name: 'Surface card', hex: '#f5f7fa', role: 'SKU tiles' },
  ],
  types: [
    { html: '<div style="font-size:64px;font-weight:300;line-height:1.05;">PLAY HAS NO LIMITS</div>', meta: 'SST substitute — weight 300 display' },
    { html: '<div style="font-size:22px;font-weight:600;">Marvel\'s Spider-Man 2</div>', meta: 'Tile headline — compact' },
    { html: '<div style="font-size:14px;font-weight:400;line-height:1.6;color:#6b6b6b;">Key art bleeds edge-to-edge; chrome stays quieter than typical gaming skins.</div>', meta: 'Body — neutral clarity' },
  ],
  cards: [
    { t: 'PS Plus Deluxe', d: 'Streaming tier badges with adaptive bitrate messaging per region.' },
    { t: 'DualSense Edge', d: 'Stick tension presets surfaced inline with warranty telemetry.' },
    { t: 'PS VR2', d: 'Passthrough safety grids with interpupillary distance coaches.' },
  ],
  radius: [8, 16, 24, 9999],
  spacing: [8, 16, 24, 32, 48],
})

add('renault', {
  brand: 'Renault',
  domain: 'renault.com',
  url: 'https://renault.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
  fontCss: "'Montserrat',system-ui,sans-serif",
  tagline: 'Sunlight Yellow accents on disciplined monochrome, NouvelR-inspired geometry, square modules.',
  btnRadius: '4px',
  navRadius: '4px',
  cardRadius: '4px',
  inputRadius: '4px',
  heroWeight: 700,
  primaryCta: 'Configure',
  secondaryCta: 'Brochure',
  ctaNav: 'Vehicles',
  elevationFlat: 'Configurator cards stay flat',
  light: {
    white: '#ffffff',
    black: '#000000',
    blue: '#ffed00',
    hoverBlue: '#e6d200',
    graySurface: '#f7f7f7',
    dark: '#000000',
    muted: '#666666',
    ctaText: '#000000',
    heroAccent: '#ffed00',
  },
  dark: {
    white: '#000000',
    black: '#ffffff',
    blue: '#ffed00',
    hoverBlue: '#fff59b',
    graySurface: '#111111',
    dark: '#111111',
    muted: '#c4c4c4',
    ctaText: '#000000',
    heroAccent: '#ffed00',
  },
  swatches: [
    { name: 'Sunlight Yellow', hex: '#ffed00', role: 'Brand accent' },
    { name: 'Ink', hex: '#000000', role: 'Typography' },
    { name: 'Canvas', hex: '#ffffff', role: 'Configurator shell' },
    { name: 'Surface soft', hex: '#f7f7f7', role: 'Tiles' },
    { name: 'Charcoal', hex: '#333333', role: 'Secondary type' },
    { name: 'Hairline', hex: '#f2f2f2', role: 'Grid rules' },
  ],
  types: [
    { html: '<div style="font-size:46px;font-weight:700;line-height:1.05;letter-spacing:-0.02em;">Rafale E-Tech</div>', meta: 'NouvelR substitute — confident sans' },
    { html: '<div style="font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#666;">E-tech hybrid</div>', meta: 'Technical eyebrow' },
    { html: '<div style="font-size:15px;line-height:1.55;color:#444;">Diamond logo rhythm repeats across modular hero slices.</div>', meta: 'Body — rational pacing' },
  ],
  cards: [
    { t: 'OpenR link', d: 'Vertical portrait screen clusters climate + EV routing shortcuts.' },
    { t: 'Esprit Alpine', d: 'Track telemetry skins with yellow punctual accents only.' },
    { t: 'Dealer configurator', d: 'Trim ladders with neutral photography backplates.' },
  ],
  radius: [0, 4, 8, 12],
  spacing: [4, 8, 16, 24, 32],
})

add('shopify', {
  brand: 'Shopify',
  domain: 'shopify.com',
  url: 'https://shopify.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;550;600&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Cinematic black heroes vs cream commerce bands — Neue Haas substitute + Inter UI.',
  btnRadius: '9999px',
  navRadius: '9999px',
  cardRadius: '16px',
  inputRadius: '12px',
  heroWeight: 500,
  sectionTitleWeight: 500,
  primaryCta: 'Start trial',
  secondaryCta: 'Pricing',
  ctaNav: 'Solutions',
  elevationFlat: 'Pastel mint washes replace shadows',
  light: {
    white: '#fbfbf5',
    black: '#000000',
    blue: '#000000',
    hoverBlue: '#3f3f46',
    graySurface: '#ffffff',
    dark: '#000000',
    muted: '#71717a',
    ctaText: '#ffffff',
    heroAccent: '#99b3ad',
  },
  dark: {
    white: '#000000',
    black: '#fbfbf5',
    blue: '#ffffff',
    hoverBlue: '#d4d4d8',
    graySurface: '#0a0a0a',
    dark: '#1e2c31',
    muted: '#a1a1aa',
    ctaText: '#000000',
    heroAccent: '#c1fbd4',
  },
  swatches: [
    { name: 'Ink black', hex: '#000000', role: 'Hero + CTA stroke' },
    { name: 'Canvas cream', hex: '#fbfbf5', role: 'Transactional band' },
    { name: 'Canvas night', hex: '#000000', role: 'Marketing hero' },
    { name: 'Aloe wash', hex: '#c1fbd4', role: 'Mint narrative' },
    { name: 'Pistachio wash', hex: '#d4f9e0', role: 'Secondary wash' },
    { name: 'Cool link', hex: '#9dabad', role: 'Inline hints' },
  ],
  types: [
    { html: '<div style="font-size:56px;font-weight:330;line-height:1;letter-spacing:0.04em;">Grow globally</div>', meta: 'Neue Haas substitute — ultralight display' },
    { html: '<div style="font-size:22px;font-weight:500;">Checkout extensibility</div>', meta: 'Heading — commerce clarity' },
    { html: '<div style="font-size:16px;font-weight:420;line-height:1.55;color:#71717a;">Hydrogen-style rails alternate noir hero with pistachio CRM metaphors.</div>', meta: 'Inter variable tone' },
  ],
  cards: [
    { t: 'Shopify Markets', d: 'Duty-inclusive pricing tables localized per currency hedge.' },
    { t: 'Shop Pay installments', d: 'Issuer-aware schedules with BNPL compliance banners.' },
    { t: 'POS Go', d: 'Hardware telemetry fused with retail staff shift graphs.' },
  ],
  radius: [8, 16, 24, 9999],
  spacing: [8, 16, 24, 32, 48],
})

add('slack', {
  brand: 'Slack',
  domain: 'slack.com',
  url: 'https://slack.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Source+Sans+3:wght@400;600;700&display=swap',
  fontCss: "'Source Sans 3','Lato',system-ui,sans-serif",
  tagline: 'Aubergine anchors, lavender hero washes, blue links, rounded marketing pills.',
  btnRadius: '90px',
  navRadius: '90px',
  cardRadius: '12px',
  inputRadius: '8px',
  heroWeight: 700,
  primaryCta: 'Talk to sales',
  secondaryCta: 'Download',
  ctaNav: 'Product',
  elevationFlat: 'Soft gradients on heroes only',
  extraCss: `.hero { background:linear-gradient(135deg,#f9f0ff 0%,#f4ede4 55%,#ffffff 100%); border-radius:0 0 32px 32px; margin-bottom:8px;}`,
  light: {
    white: '#ffffff',
    black: '#1d1d1d',
    blue: '#4a154b',
    hoverBlue: '#611f69',
    graySurface: '#f9f0ff',
    dark: '#4a154b',
    muted: '#696969',
    ctaText: '#ffffff',
    heroAccent: '#4a154b',
  },
  dark: {
    white: '#1a0f1c',
    black: '#f4ede4',
    blue: '#ecb22e',
    hoverBlue: '#f4d87c',
    graySurface: '#2d1f30',
    dark: '#481a54',
    muted: '#d9bdde',
    ctaText: '#1d1d1d',
    heroAccent: '#ecb22e',
  },
  swatches: [
    { name: 'Aubergine', hex: '#4a154b', role: 'Brand plum' },
    { name: 'Canvas', hex: '#ffffff', role: 'Marketing shell' },
    { name: 'Lavender wash', hex: '#f9f0ff', role: 'Hero fog' },
    { name: 'Cream wash', hex: '#f4ede4', role: 'Secondary fog' },
    { name: 'Link blue', hex: '#1264a3', role: 'Inline anchors' },
    { name: 'Success', hex: '#007a5a', role: 'Confirmation' },
  ],
  types: [
    { html: '<div style="font-size:54px;font-weight:700;line-height:1.08;letter-spacing:-0.02em;">Where work happens</div>', meta: 'Avant Garde substitute — friendly shout' },
    { html: '<div style="font-size:20px;font-weight:600;">Channels, meet huddles</div>', meta: 'Product headline' },
    { html: '<div style="font-size:16px;line-height:1.55;color:#696969;">Mesh illustrations float behind timeline quotes from distributed teams.</div>', meta: 'Salesforce Sans tone' },
  ],
  cards: [
    { t: 'Canvas approvals', d: 'Workflow blocks with emoji-powered routing shortcuts.' },
    { t: 'GovSlack', d: 'FedRAMP overlays surface data residency callouts inline.' },
    { t: 'Salesforce handshake', d: 'Account mirrors hydrate channels with CRM schema guards.' },
  ],
  radius: [8, 12, 24, 90],
  spacing: [4, 8, 16, 24, 32],
})

add('starbucks', {
  brand: 'Starbucks',
  domain: 'starbucks.com',
  url: 'https://starbucks.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap',
  fontCss: "'Nunito Sans',system-ui,sans-serif",
  tagline: 'Four-tier greens, warm cream canvas, full-pill CTAs, Rewards gold ceremony.',
  btnRadius: '50px',
  navRadius: '50px',
  cardRadius: '12px',
  inputRadius: '12px',
  heroWeight: 700,
  primaryCta: 'Order ahead',
  secondaryCta: 'Join Rewards',
  ctaNav: 'Menu',
  elevationFlat: 'Whisper shadows on cards',
  light: {
    white: '#f2f0eb',
    black: '#1e3932',
    blue: '#00754a',
    hoverBlue: '#006241',
    graySurface: '#edebe9',
    dark: '#1e3932',
    muted: '#6b6b6b',
    ctaText: '#ffffff',
    heroAccent: '#00754a',
  },
  dark: {
    white: '#1e3932',
    black: '#f2f0eb',
    blue: '#d4e9e2',
    hoverBlue: '#00754a',
    graySurface: '#2b5148',
    dark: '#14533f',
    muted: '#cdcbc7',
    ctaText: '#1e3932',
    heroAccent: '#cba258',
  },
  swatches: [
    { name: 'Starbucks Green', hex: '#006241', role: 'Historic brand' },
    { name: 'Green Accent', hex: '#00754a', role: 'Primary CTA / Frap' },
    { name: 'House Green', hex: '#1e3932', role: 'Footer bands' },
    { name: 'Cream canvas', hex: '#f2f0eb', role: 'Store warmth' },
    { name: 'Rewards Gold', hex: '#cba258', role: 'Status ritual' },
    { name: 'Green Light', hex: '#d4e9e2', role: 'Utility wash' },
  ],
  types: [
    { html: '<div style="font-size:44px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;">Spring menu</div>', meta: 'SoDoSans substitute — confident warmth' },
    { html: '<div style="font-size:18px;font-weight:600;color:#00754a;">Pick up · Delivery</div>', meta: 'Rewards eyebrow' },
    { html: '<div style="font-size:15px;line-height:1.55;color:#5c5c5c;">Frap CTA floats at 56px with layered shadow snack stack.</div>', meta: 'Body — café signage voice' },
  ],
  cards: [
    { t: 'Oleato lineup', d: 'Partanna olive oil infusion macros surfaced per cup holder.' },
    { t: 'Stars multiplier', d: 'Tiered earnings with partner boost windows localized per city.' },
    { t: 'Gift card skins', d: 'Photographed SKUs replace vector gradients for authenticity.' },
  ],
  radius: [12, 24, 50],
  spacing: [8, 16, 24, 32, 48],
})

add('tesla', {
  brand: 'Tesla',
  domain: 'tesla.com',
  url: 'https://tesla.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Universal Sans discipline — single electric blue CTA, 4px radii, photography-first chrome.',
  btnRadius: '4px',
  navRadius: '4px',
  cardRadius: '12px',
  inputRadius: '4px',
  heroWeight: 500,
  sectionTitleWeight: 500,
  primaryCta: 'Order now',
  secondaryCta: 'Learn',
  ctaNav: 'Vehicles',
  elevationFlat: 'No marketing shadows',
  light: {
    white: '#ffffff',
    black: '#171a20',
    blue: '#3e6ae1',
    hoverBlue: '#3457b8',
    graySurface: '#f4f4f4',
    dark: '#171a20',
    muted: '#5c5e62',
    ctaText: '#ffffff',
    heroAccent: '#3e6ae1',
  },
  dark: {
    white: '#171a20',
    black: '#f4f4f4',
    blue: '#3e6ae1',
    hoverBlue: '#6789e7',
    graySurface: '#393c41',
    dark: '#000000',
    muted: '#a2a3a5',
    ctaText: '#ffffff',
    heroAccent: '#3e6ae1',
  },
  swatches: [
    { name: 'Electric Blue', hex: '#3e6ae1', role: 'Only chromatic CTA' },
    { name: 'Carbon Dark', hex: '#171a20', role: 'Nav + headings' },
    { name: 'Graphite', hex: '#393c41', role: 'Body copy' },
    { name: 'White canvas', hex: '#ffffff', role: 'Gallery frame' },
    { name: 'Light ash', hex: '#f4f4f4', role: 'Alternate surfaces' },
    { name: 'Cloud Gray', hex: '#eeeeee', role: 'Hairlines' },
  ],
  types: [
    { html: '<div style="font-size:40px;font-weight:500;line-height:1.2;">Model Y</div>', meta: 'Universal Sans Display substitute' },
    { html: '<div style="font-size:14px;font-weight:500;line-height:1.2;">Vehicles · Energy · Charging</div>', meta: 'Nav cluster — uniform 14/500' },
    { html: '<div style="font-size:14px;font-weight:400;line-height:1.43;color:#5c5e62;">0.33s cubic easing standardizes every hover without ornamental chrome.</div>', meta: 'Body/UI cadence' },
  ],
  cards: [
    { t: 'Solar retrofit', d: 'Installation timelines fused with inverter efficiency overlays.' },
    { t: 'Cyber vault', d: 'Pickup choreography with biometric handoff checkpoints.' },
    { t: 'Insurance', d: 'Telemetry-linked premiums with regional regulatory footnotes.' },
  ],
  radius: [4, 8, 12],
  spacing: [8, 16, 21, 32, 48],
})

add('theverge', {
  brand: 'The Verge',
  domain: 'theverge.com',
  url: 'https://theverge.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap',
  fontCss: "'Space Grotesk',system-ui,sans-serif",
  tagline: 'StoryStream hazard tape — jelly mint + ultraviolet on newsprint-black canvas.',
  btnRadius: '24px',
  navRadius: '24px',
  cardRadius: '28px',
  inputRadius: '16px',
  heroWeight: 700,
  sectionTitleWeight: 700,
  primaryCta: 'Subscribe',
  secondaryCta: 'Latest',
  ctaNav: 'Tech',
  elevationFlat: '1px borders replace depth',
  extraCss: `.hero h1 { font-family:Anton,Impact,sans-serif; letter-spacing:0.02em; text-transform:uppercase; line-height:0.9;} .tag-mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#949494;}`,
  light: {
    white: '#fafafa',
    black: '#131313',
    blue: '#3cffd0',
    hoverBlue: '#309875',
    graySurface: '#eaeaea',
    dark: '#131313',
    muted: '#555555',
    ctaText: '#000000',
    heroAccent: '#5200ff',
  },
  dark: {
    white: '#131313',
    black: '#ffffff',
    blue: '#3cffd0',
    hoverBlue: '#8cffea',
    graySurface: '#2d2d2d',
    dark: '#000000',
    muted: '#949494',
    ctaText: '#000000',
    heroAccent: '#5200ff',
  },
  swatches: [
    { name: 'Canvas black', hex: '#131313', role: 'Editorial field' },
    { name: 'Jelly mint', hex: '#3cffd0', role: 'Hazard CTA' },
    { name: 'Ultraviolet', hex: '#5200ff', role: 'Secondary hazard' },
    { name: 'Surface slate', hex: '#2d2d2d', role: 'Quiet tiles' },
    { name: 'Secondary text', hex: '#949494', role: 'Timestamps' },
    { name: 'Deep link blue', hex: '#3860be', role: 'Hover bridges' },
  ],
  types: [
    { html: '<div style="font-family:Anton,sans-serif;font-size:clamp(48px,8vw,96px);line-height:0.85;text-transform:uppercase;">THE VERGE</div>', meta: 'Manuka substitute — shout headline' },
    { html: '<div class="tag-mono">14:32 · COMMIT</div>', meta: 'PolySans Mono substitute — timeline rail' },
    { html: '<div style="font-size:18px;font-weight:700;line-height:1.2;">Google\'s AI pivot lands in Congress</div>', meta: 'PolySans tile headline' },
    { html: '<div style="font-size:15px;line-height:1.55;color:#555;">Saturation blocks replace gradients — mint borders fence each StoryStream row.</div>', meta: 'Reading deck' },
  ],
  cards: [
    { t: 'StoryStream tile', d: 'Mint-filled capsule with inverted ink pulled from hazard palette.' },
    { t: 'Gadget Lab', d: 'Purple-rule outline stacking mono timestamps down the spine.' },
    { t: 'Hot Pod', d: 'Acid yellow tile quoting congressional transcripts inline.' },
  ],
  radius: [20, 24, 30, 40],
  spacing: [4, 8, 16, 24, 40],
})

add('vodafone', {
  brand: 'Vodafone',
  domain: 'vodafone.com',
  url: 'https://vodafone.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Scarlet CTAs, massive Vodafone sans headlines, editorial photography rails.',
  btnRadius: '9999px',
  navRadius: '9999px',
  cardRadius: '16px',
  inputRadius: '12px',
  heroWeight: 800,
  sectionTitleWeight: 700,
  primaryCta: 'Shop plans',
  secondaryCta: 'Coverage',
  ctaNav: 'Consumers',
  elevationFlat: 'Bandwidth motifs over shadows',
  extraCss: `.hero h1 span{font-family:'Archivo Black','Arial Black',sans-serif;letter-spacing:-0.03em;}`,
  light: {
    white: '#ffffff',
    black: '#25282b',
    blue: '#e60000',
    hoverBlue: '#bf0000',
    graySurface: '#f2f2f2',
    dark: '#25282b',
    muted: '#7e7e7e',
    ctaText: '#ffffff',
    heroAccent: '#e60000',
  },
  dark: {
    white: '#1b0000',
    black: '#fef4f4',
    blue: '#ff3232',
    hoverBlue: '#ff6666',
    graySurface: '#331010',
    dark: '#120707',
    muted: '#d9b8b8',
    ctaText: '#ffffff',
    heroAccent: '#ff3232',
  },
  swatches: [
    { name: 'Vodafone Red', hex: '#e60000', role: 'Primary CTA' },
    { name: 'Ink', hex: '#25282b', role: 'Headlines' },
    { name: 'Canvas', hex: '#ffffff', role: 'Editorial bands' },
    { name: 'Canvas soft', hex: '#f2f2f2', role: 'Alternate strips' },
    { name: 'Muted body', hex: '#7e7e7e', role: 'Supporting copy' },
  ],
  types: [
    { html: '<div style="font-family:Archivo Black,sans-serif;font-size:clamp(52px,7vw,108px);line-height:0.92;text-transform:uppercase;">TOGETHER</div>', meta: 'Vodafone weight 800 substitute' },
    { html: '<div style="font-size:20px;font-weight:700;">Unlimited data zones</div>', meta: 'Campaign deck' },
    { html: '<div style="font-size:15px;line-height:1.55;color:#7e7e7e;">Massive crop imagery anchors tariff comparisons against scarlet CTAs.</div>', meta: 'Utility sans cadence' },
  ],
  cards: [
    { t: '5G rollout map', d: 'Spectrum overlays with tower-upgrade countdown badges.' },
    { t: 'Trade-in stack', d: 'Residual calculators fused with insurance rider prompts.' },
    { t: 'Business SIP', d: 'QoS graphs stitched into Vodafone Pulse dashboards.' },
  ],
  radius: [12, 24, 9999],
  spacing: [8, 16, 24, 32, 48],
})

add('wired', {
  brand: 'WIRED',
  domain: 'wired.com',
  url: 'https://wired.com',
  fonts: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Inter:wght@400;600;700&display=swap',
  fontCss: "'Inter',system-ui,sans-serif",
  tagline: 'Magazine-black ink on warm-white canvas — Wired Display serif headlines + Apercu sans chrome.',
  btnRadius: '0',
  navRadius: '0',
  cardRadius: '0',
  inputRadius: '0',
  heroWeight: 400,
  sectionTitleWeight: 400,
  primaryCta: 'Subscribe',
  secondaryCta: 'Latest',
  ctaNav: 'Topics',
  elevationFlat: 'Print-flat surfaces',
  extraCss: `.hero h1 { font-family:'Newsreader','Georgia',serif; font-weight:400; letter-spacing:-0.03em;} .deck{font-family:'Newsreader','Georgia',serif;font-size:17px;line-height:1.65;color:#757575;}`,
  light: {
    white: '#ffffff',
    black: '#000000',
    blue: '#000000',
    hoverBlue: '#1a1a1a',
    graySurface: '#f5f5f5',
    dark: '#000000',
    muted: '#757575',
    ctaText: '#ffffff',
    heroAccent: '#057dbc',
  },
  dark: {
    white: '#0d0d0d',
    black: '#f5f5f5',
    blue: '#ffffff',
    hoverBlue: '#d9d9d9',
    graySurface: '#1a1a1a',
    dark: '#000000',
    muted: '#b5b5b5',
    ctaText: '#000000',
    heroAccent: '#4bc3ff',
  },
  swatches: [
    { name: 'Ink', hex: '#000000', role: 'Editorial black' },
    { name: 'Canvas', hex: '#ffffff', role: 'Broadsheet field' },
    { name: 'Canvas soft', hex: '#f5f5f5', role: 'Inset wells' },
    { name: 'Body gray', hex: '#757575', role: 'Supporting prose' },
    { name: 'Link blue', hex: '#057dbc', role: 'Inline citations' },
    { name: 'Hairline', hex: '#e0e0e0', role: 'Column rules' },
  ],
  types: [
    { html: '<div style="font-family:Newsreader,Georgia,serif;font-size:52px;line-height:1.05;">Ideas change everything</div>', meta: 'Wired Display substitute' },
    { html: '<div class="deck">Feature decks breathe like newsprint — serif body pairs with strict sans metadata.</div>', meta: 'Breve Text tone' },
    { html: '<div style="font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#757575;">SECURITY</div>', meta: 'Apercu chrome label' },
  ],
  cards: [
    { t: 'Gear Lab', d: 'Benchmark tables with serif captions and monospace footnotes.' },
    { t: 'Ideas podcast', d: 'Waveform doodles anchored by hairline column gutters.' },
    { t: 'Member extras', d: 'Paywalled longreads inherit Newsreader flowing measure.' },
  ],
  radius: [0, 0, 4],
  spacing: [2, 4, 8, 12, 16, 24],
})

const SLUGS = Object.keys(PRESETS)

for (const slug of SLUGS) {
  const p = PRESETS[slug]
  const dir = join(ROOT, 'design-md', slug)
  writeFileSync(join(dir, 'preview.html'), buildHtml(p, false), 'utf8')
  writeFileSync(join(dir, 'preview-dark.html'), buildHtml(p, true), 'utf8')
  console.log('[build-rich-previews]', slug)
}
console.log('[build-rich-previews] done →', SLUGS.length, 'brands × 2 modes')

