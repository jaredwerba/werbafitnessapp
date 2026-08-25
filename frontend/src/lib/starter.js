// Turns the program data in programs.js into something the app can drop into state.
// Everything here is shape, not content — the programs themselves live next door.
import { uid, DAYS } from './format.js'
import { isCardio, isBodyweightEq } from './exercises.js'
import { DEFAULT_GLYPH } from './glyphs.js'
import { t } from './i18n.js'
import { PROGRAMS } from './programs.js'

const TIME = /^(\d+)s$/
const CARDIO = /^(\d+)min(?:@([\d.]+))?$/
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export { PROGRAMS }
export const programById = id => PROGRAMS.find(p => p.id === id) || null

// One exercise, in exactly the shape the config sheet writes (sheets.jsx:497-524).
// Only fields that DIFFER from what the app would infer are written: a plain barbell
// entry comes out {id, sets, reps, weight} and nothing else, so plan files, diffs and
// stored state stay the shape they were before programs existed.
function buildEx([id, sets, spec, o = {}], sg) {
  const e = { id, sets }
  const mt = typeof spec === 'string' ? TIME.exec(spec) : null
  const mc = typeof spec === 'string' ? CARDIO.exec(spec) : null
  const mode = mc ? 'cardio' : mt ? 'time' : 'reps'
  if (mode !== (isCardio(id) ? 'cardio' : 'reps')) e.mode = mode

  if (mode === 'cardio') {
    // Cardio carries no load, no side and no rule — the config sheet writes these three.
    e.min = +mc[1]
    e.speed = mc[2] == null ? 8 : +mc[2]
    return e
  }
  if (mode === 'time') {
    e.sec = +mt[1]
    e.weight = o.w || 0
  } else {
    // A unilateral target is stored even, or the split lands 7 on one side and 8 on the other.
    e.reps = o.side ? Math.ceil(spec / 2) * 2 : spec
    e.weight = o.w || 0
    if (o.side) e.side = true
  }
  const bw = o.bw == null ? isBodyweightEq(id) : !!o.bw
  if (bw !== isBodyweightEq(id)) e.bodyweight = bw
  if (o.prog) e.prog = o.prog
  if (o.inc > 0) e.inc = o.inc
  if (o.repsMax > 0) e.repsMax = o.repsMax
  if (o.sg != null) e.sg = sg[o.sg] || (sg[o.sg] = 'sg' + uid())
  return e
}

/**
 * A program as a plan-share bundle — the exact shape parsePlan() returns, so mergePlan()
 * can do all the id work: fresh routine ids, custom exercises deduped against the ones a
 * client already has, and the week remapped onto the result. The placeholder ids here
 * ('r0', '@boxjump') never reach state; mergePlan rewrites every one of them.
 */
export function programBundle(p) {
  const customEx = (p.customEx || []).map(c => ({
    id: '@' + c.key, n: c.n, bp: c.bp, ...(c.desc ? { desc: c.desc } : {}),
  }))
  const routines = p.routines.map((r, i) => {
    const sg = {}   // superset groups are numbered per routine
    return {
      id: 'r' + i,
      name: r.name,
      emoji: r.glyph || DEFAULT_GLYPH,
      ...(r.prog || p.prog ? { prog: r.prog || p.prog } : {}),
      ex: r.ex.map(spec => buildEx(spec, sg)),
    }
  })
  const week = {}
  WEEK_ORDER.forEach(d => {
    const i = p.week?.[d]
    if (routines[i] != null) week[d] = routines[i].id
  })
  return {
    name: p.name, routines, week, customEx, dropped: 0,
    routineCount: routines.length,
    exerciseCount: routines.reduce((n, r) => n + r.ex.length, 0),
    scheduledDays: Object.keys(week).length,
  }
}

// Which weekday a routine sits on, for the preview tag ("Mo", "Th"…). null = unscheduled.
export const dayOfRoutine = (p, i) => {
  const d = WEEK_ORDER.find(x => p.week?.[x] === i)
  return d == null ? null : DAYS[d]
}
// "Mo · We · Fr"
export const dayLine = week => WEEK_ORDER.filter(d => week[d]).map(d => t(DAYS[d])).join(' · ')

// The Push/Pull/Legs routines, ready to drop into state. Kept as its own export because
// demoSeed.js fabricates twelve weeks of history on top of exactly these three routines
// and their seventeen exercise ids.
export const starterRoutines = () =>
  programBundle(programById('ppl')).routines.map(r => ({ ...r, id: uid() }))
