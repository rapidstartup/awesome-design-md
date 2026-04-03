// ── Type inference ────────────────────────────────────────────────────────────
export function inferType(name, value) {
  if (/^#[0-9a-fA-F]{3,8}$/.test(value))          return 'color'
  if (/^rgba?\s*\(|^hsla?\s*\(/.test(value))        return 'color-fn'
  if (/font/i.test(name))                            return 'font'
  if (/^-?[\d.]+px$/.test(value))                   return 'px'
  if (/^-?[\d.]+r?em$/.test(value))                 return 'rem'
  if (/^-?[\d.]+$/.test(value))                     return 'number'
  if (value.includes('rgba') || /shadow/i.test(name)) return 'shadow'
  return 'text'
}

// ── Extract all CSS custom properties from a design's :root block ─────────────
export function extractVariables(html) {
  const match = html.match(/:root\s*\{([\s\S]*?)\}/)
  if (!match) return []
  const out = []
  const re  = /--([\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(match[1])) !== null) {
    const name  = `--${m[1]}`
    const value = m[2].trim()
    out.push({ name, value, type: inferType(name, value) })
  }
  return out
}

// ── Group variables for the builder UI ───────────────────────────────────────
export function groupVariables(vars) {
  const groups = { Colors: [], Typography: [], 'Spacing & Radius': [], Elevation: [], Other: [] }
  for (const v of vars) {
    if (v.type === 'color' || v.type === 'color-fn') {
      groups.Colors.push(v)
    } else if (v.type === 'font' || /font/i.test(v.name)) {
      groups.Typography.push(v)
    } else if (v.type === 'px' || v.type === 'rem' || v.type === 'number'
               || /radius|spacing|gap|pad|margin/i.test(v.name)) {
      groups['Spacing & Radius'].push(v)
    } else if (v.type === 'shadow' || /shadow|elevation/i.test(v.name)) {
      groups.Elevation.push(v)
    } else {
      groups.Other.push(v)
    }
  }
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length))
}

// ── Inject variable overrides into HTML before setting as srcdoc ──────────────
// Appends a second :root {} after </head> — last-defined wins in CSS cascade.
export function applyVariableOverrides(html, overrides) {
  if (!overrides || !Object.keys(overrides).length) return html
  const decls  = Object.entries(overrides).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  const style  = `<style id="agentix-overrides">:root {\n${decls}\n}</style>`
  return html.includes('</head>')
    ? html.replace('</head>', style + '\n</head>')
    : style + html
}
