// Reads projects/*.md and people/*.md and writes dist/data.json beside a copy
// of site/* (the page):
//   items[]: { type: project|person, id, name, links, tags, kind?, added,
//              consent?, confirmed?, summary, sections: { heading: text } }
//   edges[]: { from: person id, to: project id }   (from a person's `projects`)
// Exits 1 with every error found.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

const root = new URL('../', import.meta.url).pathname
const KINDS = ['software', 'community', 'idea']
const CONSENT = ['self', 'agreed']
const errors = []
const dateStr = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v == null ? null : String(v))

function read(folder, type) {
  return readdirSync(join(root, folder)).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => {
    const file = `${folder}/${f}`
    const id = f.slice(0, -3)
    const m = readFileSync(join(root, file), 'utf8').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
    if (!m) { errors.push(`${file}: no front matter`); return null }
    let fm
    try { fm = yaml.load(m[1]) ?? {} } catch (e) { errors.push(`${file}: ${e.message}`); return null }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) errors.push(`${file}: file name must be lowercase words joined with -`)
    if (!fm.name) errors.push(`${file}: name is missing`)
    for (const k of ['links', 'tags', 'projects']) if (fm[k] != null && !Array.isArray(fm[k])) errors.push(`${file}: ${k} must be a list`)
    for (const t of fm.tags ?? []) if (!/^[a-z0-9][a-z0-9-]*$/.test(String(t))) errors.push(`${file}: tag "${t}" must be lowercase words joined with -`)
    const parts = m[2].split(/^## +/m)
    const summary = parts[0].trim()
    const sections = Object.fromEntries(parts.slice(1).map((s) => { const i = s.indexOf('\n'); return [s.slice(0, i < 0 ? undefined : i).trim(), i < 0 ? '' : s.slice(i + 1).trim()] }).filter(([, v]) => v))
    if (!summary) errors.push(`${file}: no description`)
    const item = { type, id, name: fm.name ?? id, links: fm.links ?? [], tags: (fm.tags ?? []).map(String), added: dateStr(fm.added), summary, sections }
    if (type === 'project') {
      if (!KINDS.includes(fm.kind)) errors.push(`${file}: kind must be one of ${KINDS.join(', ')}`)
      item.kind = fm.kind
      item.confirmed = fm.confirmed !== false
    } else {
      if (!CONSENT.includes(fm.consent)) errors.push(`${file}: consent must be self or agreed`)
      item.consent = fm.consent
      item.projects = (fm.projects ?? []).map(String)
    }
    return item
  }).filter(Boolean)
}

const projects = read('projects', 'project')
const people = read('people', 'person')
const projectIds = new Set(projects.map((p) => p.id))
const edges = []
for (const p of people) for (const to of p.projects) {
  if (!projectIds.has(to)) errors.push(`people/${p.id}.md: projects names unknown project "${to}"`)
  else edges.push({ from: p.id, to })
}
for (const p of people) delete p.projects
if (errors.length) { console.error(errors.join('\n')); process.exit(1) }
mkdirSync(join(root, 'dist'), { recursive: true })
if (existsSync(join(root, 'site'))) cpSync(join(root, 'site'), join(root, 'dist'), { recursive: true })
const data = { generated: new Date().toISOString().slice(0, 10), items: [...projects, ...people], edges }
writeFileSync(join(root, 'dist/data.json'), JSON.stringify(data, null, 1))
console.log(`built dist/data.json: ${projects.length} project(s), ${people.length} person(s), ${edges.length} edge(s)`)
