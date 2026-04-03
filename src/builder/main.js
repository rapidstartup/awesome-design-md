import { supabase, getSession } from '../lib/supabase.js'
import { extractVariables, groupVariables, applyVariableOverrides, inferType } from '../lib/variables.js'

// ── All built-in design slugs for the base selector ───────────────────────────
const BUILTIN = [
  ['AI & ML',            ['claude','cohere','elevenlabs','minimax','mistral.ai','ollama','opencode.ai','replicate','runwayml','together.ai','voltagent','x.ai']],
  ['Dev Tools',          ['cursor','expo','linear.app','lovable','mintlify','posthog','raycast','resend','sentry','supabase','superhuman','vercel','warp','zapier']],
  ['Infra',              ['clickhouse','composio','hashicorp','mongodb','sanity','stripe']],
  ['Design',             ['airtable','cal','clay','figma','framer','intercom','miro','notion','pinterest','webflow']],
  ['Fintech',            ['coinbase','kraken','revolut','wise']],
  ['Enterprise',         ['airbnb','apple','bmw','ibm','nvidia','spacex','spotify','uber']],
]

const ANCHOR_PATCH = `<script>(function(){document.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;var h=a.getAttribute('href');if(!h||!h.startsWith('#'))return;e.preventDefault();var id=h.slice(1);if(!id)return;var t=document.getElementById(id);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});});})();<\/script>`

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  session:    null,
  baseSlug:   'vercel',
  draftVars:  {},           // current override values { '--name': 'value' }
  baseVars:   [],           // extracted vars from base design (source of truth for names/types)
  designName: '',
  savedId:    null,         // uuid of the saved md_designs row being edited
}

const DRAFT_KEY = 'agentix_designer_draft'

// ── DOM refs ──────────────────────────────────────────────────────────────────
const authWall    = document.getElementById('auth-wall')
const app         = document.getElementById('app')
const loginForm   = document.getElementById('login-form')
const loginBtn    = document.getElementById('login-btn')
const authError   = document.getElementById('auth-error')
const preview     = document.getElementById('builder-preview')
const controlsList = document.getElementById('controls-list')
const savedList   = document.getElementById('saved-list')
const baseSelect  = document.getElementById('base-select')
const designName  = document.getElementById('design-name')
const btnSave     = document.getElementById('btn-save')
const btnRefresh  = document.getElementById('btn-refresh')
const btnNew      = document.getElementById('btn-new')
const btnSignout  = document.getElementById('btn-signout')

// ── Debounce util ─────────────────────────────────────────────────────────────
function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}
const saveDraftDebounced = debounce(saveDraft, 800)

// ── Auth ──────────────────────────────────────────────────────────────────────
function showAuthWall() { authWall.style.display = 'flex'; app.classList.add('hidden') }
function showApp()      { authWall.style.display = 'none'; app.classList.remove('hidden') }

loginForm.addEventListener('submit', async e => {
  e.preventDefault()
  loginBtn.disabled = true
  loginBtn.textContent = 'Signing in…'
  authError.textContent = ''
  const email    = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    authError.textContent = error.message
    loginBtn.disabled = false
    loginBtn.textContent = 'Sign in'
    return
  }
  state.session = data.session
  showApp()
  await onAuthed()
})

btnSignout.addEventListener('click', async () => {
  await supabase.auth.signOut()
  state.session = null
  showAuthWall()
})

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  state.session = await getSession()
  if (!state.session) { showAuthWall(); return }
  showApp()
  await onAuthed()
}

async function onAuthed() {
  populateBaseSelect()
  await loadSavedDesigns()
  await loadDraftOrDefault()
}

// ── Base design selector ──────────────────────────────────────────────────────
function populateBaseSelect() {
  baseSelect.innerHTML = '<option value="">— scratch (Vercel base) —</option>'
  for (const [cat, slugs] of BUILTIN) {
    const grp = document.createElement('optgroup')
    grp.label = cat
    for (const slug of slugs) {
      const opt = document.createElement('option')
      opt.value = slug
      opt.textContent = slug
      grp.appendChild(opt)
    }
    baseSelect.appendChild(grp)
  }
  baseSelect.value = state.baseSlug
}

baseSelect.addEventListener('change', async () => {
  state.baseSlug  = baseSelect.value || 'vercel'
  state.draftVars = {}
  state.savedId   = null
  await loadBaseDesign(state.baseSlug)
  saveDraft()
})

// ── Load base design HTML → extract vars → render controls + preview ──────────
async function loadBaseDesign(slug) {
  const res  = await fetch(`/design-md/${slug}/preview.html`)
  const raw  = await res.text()
  state.baseVars = extractVariables(raw)
  renderControls()
  await refreshPreview()
}

// ── Live variable update ──────────────────────────────────────────────────────
// For hex colors and simple values this injects directly — no re-render needed.
function liveUpdateVar(name, value) {
  state.draftVars[name] = value
  try {
    preview.contentDocument?.documentElement.style.setProperty(name, value)
  } catch (_) {}
  saveDraftDebounced()
}

// ── Full preview refresh (re-fetches base, applies all overrides) ─────────────
async function refreshPreview() {
  const slug = state.baseSlug || 'vercel'
  const res  = await fetch(`/design-md/${slug}/preview.html`)
  const raw  = await res.text()
  // Apply current draft vars on top of base CSS
  const merged = Object.fromEntries(
    state.baseVars.map(v => [v.name, state.draftVars[v.name] ?? v.value])
  )
  const patched = applyVariableOverrides(
    raw.replace('</body>', ANCHOR_PATCH + '</body>'),
    merged
  )
  preview.srcdoc = patched
}

btnRefresh.addEventListener('click', refreshPreview)

// ── Render variable controls ──────────────────────────────────────────────────
function renderControls() {
  controlsList.innerHTML = ''
  const groups  = groupVariables(state.baseVars)
  let   isFirst = true

  for (const [groupName, vars] of Object.entries(groups)) {
    const group  = document.createElement('div')
    group.className = 'var-group'

    const header = document.createElement('button')
    header.className = 'var-group-header'
    header.dataset.open = isFirst ? 'true' : 'false'
    header.innerHTML = `<span>${groupName}</span>
      <span class="group-count">${vars.length}</span>
      <span class="group-chevron">▾</span>`

    const body  = document.createElement('div')
    body.className = 'var-group-body'
    if (!isFirst) body.hidden = true

    header.addEventListener('click', () => {
      const open = header.dataset.open === 'true'
      header.dataset.open = String(!open)
      body.hidden = open
    })

    for (const v of vars) body.appendChild(buildVarRow(v))

    group.append(header, body)
    controlsList.appendChild(group)
    isFirst = false
  }
}

function buildVarRow(v) {
  const currentVal = state.draftVars[v.name] ?? v.value

  const row   = document.createElement('div')
  row.className = 'var-row'

  const label = document.createElement('label')
  label.textContent = v.name
  label.title = v.name

  let control
  if (v.type === 'color') {
    control = buildColorControl(v, currentVal)
  } else {
    control = document.createElement('input')
    control.type = 'text'
    control.className = 'text-input' + (v.type === 'shadow' ? ' shadow-input' : '')
    control.value = currentVal
    control.spellcheck = false
    control.addEventListener('input', () => liveUpdateVar(v.name, control.value))
  }

  row.append(label, control)
  return row
}

function buildColorControl(v, currentVal) {
  const wrap  = document.createElement('div')
  wrap.className = 'color-control'

  // Normalise: color picker only accepts 6-digit hex
  const pickerVal = currentVal.match(/^#[0-9a-fA-F]{6}$/)
    ? currentVal
    : (currentVal.match(/^#[0-9a-fA-F]{3}$/)
        ? '#' + [...currentVal.slice(1)].map(c => c+c).join('')
        : '#000000')

  const picker = document.createElement('input')
  picker.type  = 'color'
  picker.value = pickerVal

  const hex = document.createElement('input')
  hex.type      = 'text'
  hex.className = 'hex-input'
  hex.value     = currentVal
  hex.maxLength = 9
  hex.spellcheck = false

  picker.addEventListener('input', () => {
    hex.value = picker.value
    liveUpdateVar(v.name, picker.value)
  })
  hex.addEventListener('change', () => {
    const val = hex.value.trim()
    if (/^#[0-9a-fA-F]{3,8}$/.test(val)) {
      if (/^#[0-9a-fA-F]{6}$/.test(val)) picker.value = val
      liveUpdateVar(v.name, val)
    }
  })

  wrap.append(picker, hex)
  return wrap
}

// ── Save / load to Supabase ───────────────────────────────────────────────────
async function saveDesign() {
  btnSave.disabled  = true
  btnSave.textContent = 'Saving…'

  try {
    const name   = designName.value.trim() || 'Untitled Design'
    const slug   = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
    const userId = state.session.user.id

    // Build final variables map: base defaults merged with draft overrides
    const variables = Object.fromEntries(
      state.baseVars.map(v => [v.name, state.draftVars[v.name] ?? v.value])
    )

    const payload = {
      user_id:   userId,
      name,
      slug,
      base_slug: state.baseSlug,
      category:  'Custom',
      variables,
    }

    let result
    if (state.savedId) {
      result = await supabase
        .from('md_designs')
        .update(payload)
        .eq('id', state.savedId)
        .select('id')
        .single()
    } else {
      result = await supabase
        .from('md_designs')
        .insert(payload)
        .select('id')
        .single()
    }

    if (result.error) throw result.error

    state.savedId = result.data.id
    localStorage.removeItem(DRAFT_KEY)
    btnSave.classList.add('saved')
    btnSave.textContent = '✓ Saved'
    await loadSavedDesigns()
    setTimeout(() => {
      btnSave.classList.remove('saved')
      btnSave.textContent = 'Save'
      btnSave.disabled = false
    }, 2000)
  } catch (err) {
    console.error('Save error', err)
    btnSave.classList.add('error')
    btnSave.textContent = 'Error'
    setTimeout(() => {
      btnSave.classList.remove('error')
      btnSave.textContent = 'Save'
      btnSave.disabled = false
    }, 2000)
  }
}

btnSave.addEventListener('click', saveDesign)

// ── Load list of saved designs ────────────────────────────────────────────────
async function loadSavedDesigns() {
  const { data, error } = await supabase
    .from('md_designs')
    .select('id, name, base_slug, variables')
    .order('updated_at', { ascending: false })

  savedList.innerHTML = ''

  if (error || !data?.length) {
    savedList.innerHTML = '<div class="saved-empty">No saved designs yet</div>'
    return
  }

  for (const design of data) {
    const item   = document.createElement('div')
    item.className = 'saved-item' + (design.id === state.savedId ? ' active' : '')

    const nameEl = document.createElement('span')
    nameEl.className = 'saved-item-name'
    nameEl.textContent = design.name

    const baseEl = document.createElement('span')
    baseEl.className = 'saved-item-base'
    baseEl.textContent = design.base_slug || 'scratch'

    const delBtn = document.createElement('button')
    delBtn.className = 'saved-item-delete'
    delBtn.textContent = '×'
    delBtn.title = 'Delete'
    delBtn.addEventListener('click', async e => {
      e.stopPropagation()
      if (!confirm(`Delete "${design.name}"?`)) return
      await supabase.from('md_designs').delete().eq('id', design.id)
      if (state.savedId === design.id) resetToNew()
      await loadSavedDesigns()
    })

    item.append(nameEl, baseEl, delBtn)
    item.addEventListener('click', () => loadDesignForEdit(design))
    savedList.appendChild(item)
  }
}

// ── Load a saved design into the editor ───────────────────────────────────────
async function loadDesignForEdit(design) {
  state.savedId   = design.id
  state.baseSlug  = design.base_slug || 'vercel'
  state.draftVars = { ...design.variables }
  designName.value = design.name
  baseSelect.value = state.baseSlug

  // Re-extract base vars so group names/types are current
  const res = await fetch(`/design-md/${state.baseSlug}/preview.html`)
  state.baseVars = extractVariables(await res.text())
  renderControls()
  await refreshPreview()

  // Highlight active
  savedList.querySelectorAll('.saved-item').forEach(el =>
    el.classList.toggle('active', el.querySelector('.saved-item-name').textContent === design.name)
  )
}

// ── New design button ─────────────────────────────────────────────────────────
btnNew.addEventListener('click', resetToNew)

function resetToNew() {
  state.savedId   = null
  state.draftVars = {}
  state.baseSlug  = 'vercel'
  designName.value = ''
  baseSelect.value = 'vercel'
  localStorage.removeItem(DRAFT_KEY)
  loadBaseDesign('vercel')
  savedList.querySelectorAll('.saved-item').forEach(el => el.classList.remove('active'))
}

// ── localStorage draft ────────────────────────────────────────────────────────
function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({
    baseSlug:   state.baseSlug,
    draftVars:  state.draftVars,
    designName: designName.value,
    savedId:    state.savedId,
  }))
}

async function loadDraftOrDefault() {
  let draft = null
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)) } catch (_) {}

  if (draft) {
    state.baseSlug   = draft.baseSlug  || 'vercel'
    state.draftVars  = draft.draftVars || {}
    state.savedId    = draft.savedId   || null
    designName.value = draft.designName || ''
    baseSelect.value = state.baseSlug
  } else {
    state.baseSlug = 'vercel'
  }

  const res = await fetch(`/design-md/${state.baseSlug}/preview.html`)
  state.baseVars = extractVariables(await res.text())
  renderControls()
  await refreshPreview()
}

// Auto-save name changes
designName.addEventListener('input', saveDraftDebounced)

// ── Boot ──────────────────────────────────────────────────────────────────────
init()
