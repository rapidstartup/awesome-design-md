import { supabase }              from './lib/supabase.js'
import { applyVariableOverrides } from './lib/variables.js'

// ── Design catalogue ──────────────────────────────────────────────────────────
const CATEGORIES = {
  'AI & ML': [
    { slug: 'claude',      name: 'Claude' },
    { slug: 'cohere',      name: 'Cohere' },
    { slug: 'elevenlabs',  name: 'ElevenLabs' },
    { slug: 'minimax',     name: 'Minimax' },
    { slug: 'mistral.ai',  name: 'Mistral AI' },
    { slug: 'ollama',      name: 'Ollama' },
    { slug: 'opencode.ai', name: 'OpenCode AI' },
    { slug: 'replicate',   name: 'Replicate' },
    { slug: 'runwayml',    name: 'RunwayML' },
    { slug: 'together.ai', name: 'Together AI' },
    { slug: 'voltagent',   name: 'VoltAgent' },
    { slug: 'x.ai',        name: 'xAI' },
  ],
  'Dev Tools': [
    { slug: 'cursor',      name: 'Cursor' },
    { slug: 'expo',        name: 'Expo' },
    { slug: 'linear.app',  name: 'Linear' },
    { slug: 'lovable',     name: 'Lovable' },
    { slug: 'mintlify',    name: 'Mintlify' },
    { slug: 'posthog',     name: 'PostHog' },
    { slug: 'raycast',     name: 'Raycast' },
    { slug: 'resend',      name: 'Resend' },
    { slug: 'sentry',      name: 'Sentry' },
    { slug: 'supabase',    name: 'Supabase' },
    { slug: 'superhuman',  name: 'Superhuman' },
    { slug: 'vercel',      name: 'Vercel' },
    { slug: 'warp',        name: 'Warp' },
    { slug: 'zapier',      name: 'Zapier' },
  ],
  'Infra': [
    { slug: 'clickhouse',  name: 'ClickHouse' },
    { slug: 'composio',    name: 'Composio' },
    { slug: 'hashicorp',   name: 'HashiCorp' },
    { slug: 'mongodb',     name: 'MongoDB' },
    { slug: 'sanity',      name: 'Sanity' },
    { slug: 'stripe',      name: 'Stripe' },
  ],
  'Design': [
    { slug: 'airtable',    name: 'Airtable' },
    { slug: 'brandbuildr', name: 'BrandBuildr' },
    { slug: 'cal',         name: 'Cal.com' },
    { slug: 'clay',        name: 'Clay' },
    { slug: 'figma',       name: 'Figma' },
    { slug: 'framer',      name: 'Framer' },
    { slug: 'intercom',    name: 'Intercom' },
    { slug: 'miro',        name: 'Miro' },
    { slug: 'notion',      name: 'Notion' },
    { slug: 'pinterest',   name: 'Pinterest' },
    { slug: 'webflow',     name: 'Webflow' },
  ],
  'Fintech': [
    { slug: 'coinbase',    name: 'Coinbase' },
    { slug: 'kraken',      name: 'Kraken' },
    { slug: 'revolut',     name: 'Revolut' },
    { slug: 'wise',        name: 'Wise' },
  ],
  'Enterprise': [
    { slug: 'airbnb',      name: 'Airbnb' },
    { slug: 'apple',       name: 'Apple' },
    { slug: 'bmw',         name: 'BMW' },
    { slug: 'ibm',         name: 'IBM' },
    { slug: 'nvidia',      name: 'NVIDIA' },
    { slug: 'spacex',      name: 'SpaceX' },
    { slug: 'spotify',     name: 'Spotify' },
    { slug: 'uber',        name: 'Uber' },
  ],
}

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  category:  'AI & ML',
  slug:      'claude',
  mode:      'light',
  minimized: false,
}

// ── DOM ───────────────────────────────────────────────────────────────────────
const iframe = document.getElementById('preview')
const modal  = document.getElementById('modal')
const veil   = document.getElementById('veil')

// ── HTML cache — keyed by "slug:mode" ─────────────────────────────────────────
const cache = {}

const ANCHOR_PATCH = `<script>(function(){document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var h=a.getAttribute('href');if(!h||!h.startsWith('#'))return;e.preventDefault();var id=h.slice(1);if(!id)return;var t=document.getElementById(id);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});});})();<\/script>`

async function fetchDesign(slug, mode) {
  const key = `${slug}:${mode}`
  if (cache[key]) return cache[key]
  const file = mode === 'dark' ? 'preview-dark.html' : 'preview.html'
  const res  = await fetch(`/design-md/${slug}/${file}`)
  const raw  = await res.text()
  const html = raw.includes('</body>')
    ? raw.replace('</body>', ANCHOR_PATCH + '</body>')
    : raw + ANCHOR_PATCH
  cache[key] = { html, swatches: extractSwatches(raw) }
  return cache[key]
}

function extractSwatches(html) {
  const hits = [...html.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)]
  const seen = new Set()
  const out  = []
  for (const [, varName, hex] of hits) {
    const lower = hex.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    out.push({ label: varName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), hex })
    if (out.length >= 20) break
  }
  return out
}

// ── Apply built-in design ─────────────────────────────────────────────────────
async function applyDesign(slug, mode) {
  veil.classList.add('visible')
  try {
    const { html, swatches } = await fetchDesign(slug, mode)
    iframe.srcdoc = html
    renderSwatches(swatches)
  } catch (err) {
    iframe.srcdoc = `<body style="font-family:sans-serif;padding:40px;color:#f87171;background:#111">Failed: ${err.message}</body>`
  }
  iframe.onload = () => { iframe.onload = null; veil.classList.remove('visible') }
  setTimeout(() => veil.classList.remove('visible'), 2000)
}

// ── Apply custom (Supabase-saved) design ──────────────────────────────────────
async function applyCustomDesign(design) {
  veil.classList.add('visible')
  try {
    const base = design.base_slug || 'vercel'
    const { html: baseHtml, swatches } = await fetchDesign(base, state.mode)
    iframe.srcdoc = applyVariableOverrides(baseHtml, design.variables || {})
    renderSwatches(swatches)
  } catch (err) {
    iframe.srcdoc = `<body style="font-family:sans-serif;padding:40px">Failed: ${err.message}</body>`
  }
  iframe.onload = () => { iframe.onload = null; veil.classList.remove('visible') }
  setTimeout(() => veil.classList.remove('visible'), 2000)
}

// ── Custom designs from Supabase ──────────────────────────────────────────────
async function loadCustomDesigns() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const { data, error } = await supabase
    .from('md_designs')
    .select('id, name, base_slug, variables')
    .order('updated_at', { ascending: false })

  if (error || !data?.length) return

  CATEGORIES['My Designs'] = data.map(d => ({
    slug:      `custom:${d.id}`,
    name:      d.name,
    isCustom:  true,
    baseSlug:  d.base_slug,
    variables: d.variables,
  }))

  // If currently on My Designs, re-render the list
  if (state.category === 'My Designs') renderList()
  renderCategories() // update pills to include new category
}

// ── Modal rendering ───────────────────────────────────────────────────────────
function renderCategories() {
  const row = modal.querySelector('[data-slot="categories"]')
  row.innerHTML = ''
  for (const key of Object.keys(CATEGORIES)) {
    const btn = document.createElement('button')
    btn.className = 'cat-pill' + (key === state.category ? ' active' : '')
    btn.textContent = key
    btn.setAttribute('data-tooltip', key)
    btn.addEventListener('click', () => {
      state.category = key
      state.slug = CATEGORIES[key][0].slug
      render()
    })
    row.appendChild(btn)
  }
  row.querySelector('.active')?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  requestAnimationFrame(updateCatArrows)
}

function renderList() {
  const list = modal.querySelector('[data-slot="list"]')
  list.innerHTML = ''
  const designs = CATEGORIES[state.category] || []
  for (const d of designs) {
    const item = document.createElement('div')
    item.className = 'design-item' + (d.slug === state.slug ? ' active' : '')
    item.textContent = d.name
    item.addEventListener('click', () => { state.slug = d.slug; render() })
    list.appendChild(item)
  }
  list.querySelector('.active')?.scrollIntoView({ block: 'nearest' })
}

function renderMode() {
  modal.querySelectorAll('.mode-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.mode === state.mode)
  )
}

function renderCurrentName() {
  const all = Object.values(CATEGORIES).flat()
  const d   = all.find(x => x.slug === state.slug)
  modal.querySelector('[data-slot="current-name"]').textContent = d?.name ?? ''
}

function renderSwatches(swatches) {
  const row = modal.querySelector('[data-slot="swatches"]')
  if (!swatches) { row.innerHTML = '<span class="swatches-loading">···</span>'; return }
  row.innerHTML = ''
  for (const { label, hex } of swatches) {
    const s = document.createElement('div')
    s.className = 'swatch'
    s.style.background = hex
    s.setAttribute('data-tooltip', `${label}  ${hex}`)
    row.appendChild(s)
  }
}

function renderMinimized() {
  modal.classList.toggle('minimized', state.minimized)
  const btn = modal.querySelector('[data-slot="minimize-btn"]')
  btn.textContent = state.minimized ? '+' : '−'
  btn.setAttribute('data-tooltip', state.minimized ? 'Expand' : 'Minimize')
}

function render() {
  renderCategories()
  renderList()
  renderMode()
  renderCurrentName()
  renderMinimized()

  const isCustom = state.slug.startsWith('custom:')
  if (isCustom) {
    const id     = state.slug.replace('custom:', '')
    const design = (CATEGORIES['My Designs'] || []).find(d => d.slug === state.slug)
    if (design) applyCustomDesign(design)
  } else {
    applyDesign(state.slug, state.mode)
  }
}

// ── Drag ──────────────────────────────────────────────────────────────────────
function initDrag() {
  const header = modal.querySelector('.modal-header')
  let startX, startY, startLeft, startTop

  header.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return
    const rect = modal.getBoundingClientRect()
    startX = e.clientX; startY = e.clientY
    startLeft = rect.left; startTop = rect.top
    modal.style.left = startLeft + 'px'; modal.style.top = startTop + 'px'
    modal.style.bottom = 'auto'; modal.style.right = 'auto'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    e.preventDefault()
  })

  function onMove(e) {
    modal.style.left = Math.max(0, Math.min(startLeft + e.clientX - startX, window.innerWidth  - modal.offsetWidth))  + 'px'
    modal.style.top  = Math.max(0, Math.min(startTop  + e.clientY - startY, window.innerHeight - modal.offsetHeight)) + 'px'
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
}

// ── Build modal DOM ───────────────────────────────────────────────────────────
function buildModal() {
  modal.innerHTML = `
    <div class="modal-header">
      <span class="drag-hint" aria-hidden="true">⠿</span>
      <span data-slot="current-name" class="current-name"></span>
      <span class="modal-badge">design.md</span>
      <button class="btn-icon" data-slot="minimize-btn" data-tooltip="Minimize">−</button>
    </div>
    <div class="modal-body">
      <div class="section categories-section">
        <button class="cat-arrow cat-arrow-left" aria-label="Scroll left">‹</button>
        <div class="cat-pills-scroll" data-slot="categories"></div>
        <button class="cat-arrow cat-arrow-right" aria-label="Scroll right">›</button>
      </div>
      <div class="section list-section" data-slot="list"></div>
      <div class="section mode-section">
        <span class="section-label">Mode</span>
        <div class="mode-toggle">
          <button class="mode-btn" data-mode="light" data-tooltip="Light mode">☀</button>
          <button class="mode-btn" data-mode="dark"  data-tooltip="Dark mode">◐</button>
        </div>
      </div>
      <div class="section swatches-section" data-slot="swatches"></div>
      <div class="section actions-section">
        <button class="action-btn" id="btn-download" data-tooltip="Download DESIGN.md">↓ DESIGN.md</button>
        <button class="action-btn" id="btn-copy"     data-tooltip="Copy to clipboard">⎘ Copy</button>
        <a class="action-btn" href="/builder" data-tooltip="Open designer">✏ Designer</a>
      </div>
    </div>
  `
}

function updateCatArrows() {
  const scroll = modal.querySelector('.cat-pills-scroll')
  const left   = modal.querySelector('.cat-arrow-left')
  const right  = modal.querySelector('.cat-arrow-right')
  left.classList.toggle('faded',  scroll.scrollLeft <= 0)
  right.classList.toggle('faded', scroll.scrollLeft + scroll.clientWidth >= scroll.scrollWidth - 1)
}

function initEvents() {
  const catScroll = modal.querySelector('.cat-pills-scroll')
  modal.querySelector('.cat-arrow-left').addEventListener('click',  () => catScroll.scrollBy({ left: -90, behavior: 'smooth' }))
  modal.querySelector('.cat-arrow-right').addEventListener('click', () => catScroll.scrollBy({ left:  90, behavior: 'smooth' }))
  catScroll.addEventListener('scroll', updateCatArrows)

  modal.querySelector('[data-slot="minimize-btn"]').addEventListener('click', () => {
    state.minimized = !state.minimized
    renderMinimized()
  })

  modal.querySelectorAll('.mode-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode
      renderMode()
      const isCustom = state.slug.startsWith('custom:')
      if (isCustom) {
        const design = (CATEGORIES['My Designs'] || []).find(d => d.slug === state.slug)
        if (design) applyCustomDesign(design)
      } else {
        applyDesign(state.slug, state.mode)
      }
    })
  )

  modal.querySelector('#btn-download').addEventListener('click', () => {
    if (state.slug.startsWith('custom:')) return
    const a = document.createElement('a')
    a.href = `/design-md/${state.slug}/DESIGN.md`
    a.download = `${state.slug}-DESIGN.md`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  })

  modal.querySelector('#btn-copy').addEventListener('click', async () => {
    const btn = modal.querySelector('#btn-copy')
    try {
      if (state.slug.startsWith('custom:')) {
        const design = (CATEGORIES['My Designs'] || []).find(d => d.slug === state.slug)
        await navigator.clipboard.writeText(JSON.stringify(design?.variables || {}, null, 2))
      } else {
        const res  = await fetch(`/design-md/${state.slug}/DESIGN.md`)
        await navigator.clipboard.writeText(await res.text())
      }
      btn.textContent = '✓ Copied!'; btn.classList.add('copied')
    } catch {
      btn.textContent = '✗ Failed'; btn.classList.add('failed')
    }
    setTimeout(() => { btn.textContent = '⎘ Copy'; btn.classList.remove('copied', 'failed') }, 2000)
  })
}

// ── Boot ──────────────────────────────────────────────────────────────────────
buildModal()
initDrag()
initEvents()
render()
// Silently try to load custom designs (no-op if not authenticated)
loadCustomDesigns()
