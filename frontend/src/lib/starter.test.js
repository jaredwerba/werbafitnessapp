import { describe, it, expect } from 'vitest'
import { PROGRAMS, programById, programBundle, starterRoutines, dayOfRoutine, dayLine } from './starter.js'
import { EXIDX } from './exercises.js'
import { GLYPHS } from './glyphs.js'

// The seventeen ids demoSeed.js prices out in its PROG map (demoSeed.js:9-13). If a program
// edit ever changes what starterRoutines() returns, the demo build seeds history against
// exercises it has no weights for — silently, and only in a build nobody runs locally.
const DEMO_SEED_IDS = [
  '0025', '0047', '0426', '0334', '0241', '0251',
  '2330', '0027', '1323', '0031', '0313',
  '0043', '0085', '0739', '0585', '0586', '0605',
]

describe('starterRoutines — the contract demoSeed.js depends on', () => {
  it('returns Push, Pull and Leg Day, in that order', () => {
    expect(starterRoutines().map(r => r.name)).toEqual(['Push Day', 'Pull Day', 'Leg Day'])
  })

  it('covers exactly the exercises demoSeed prices', () => {
    const ids = starterRoutines().flatMap(r => r.ex.map(e => e.id))
    expect([...new Set(ids)].sort()).toEqual([...DEMO_SEED_IDS].sort())
  })

  it('emits bare entries — the shape the old three-tuple built', () => {
    // Byte-identity matters: a stray `mode` or `bodyweight` here would land in every
    // client's localStorage and every exported plan file, for no behaviour change.
    const [push] = starterRoutines()
    expect(push.ex[0]).toEqual({ id: '0025', sets: 4, reps: 8, weight: 0 })
    for (const r of starterRoutines()) {
      for (const e of r.ex) expect(Object.keys(e)).toEqual(['id', 'sets', 'reps', 'weight'])
      expect(r.prog).toBeUndefined()
    }
  })

  it('mints a fresh routine id each call', () => {
    expect(starterRoutines()[0].id).not.toBe(starterRoutines()[0].id)
  })
})

describe('every program is loadable', () => {
  it.each(PROGRAMS.map(p => [p.id, p]))('%s resolves every exercise', (_id, p) => {
    const declared = new Set((p.customEx || []).map(c => '@' + c.key))
    for (const r of programBundle(p).routines) {
      for (const e of r.ex) {
        if (e.id.startsWith('@')) expect(declared).toContain(e.id)
        else expect(EXIDX[e.id], `unknown exercise ${e.id}`).toBeTruthy()
      }
    }
  })

  // The config sheet forces a cardio-body-part exercise into cardio mode and hides the
  // reps/time choice (sheets.jsx:487,491), so a drill parked on a cardio id turns into a
  // twenty-minute jog the first time a client opens it. Catch that here, not there.
  it.each(PROGRAMS.map(p => [p.id, p]))('%s keeps cardio mode and cardio ids together', (_id, p) => {
    for (const r of programBundle(p).routines) {
      for (const e of r.ex) {
        if (e.id.startsWith('@')) { expect(e.mode).not.toBe('cardio'); continue }
        const cardioBp = EXIDX[e.id].bp === 'cardio'
        const mode = e.mode || (cardioBp ? 'cardio' : 'reps')
        expect(mode === 'cardio', `${e.id} mode=${mode} bp=${EXIDX[e.id].bp}`).toBe(cardioBp)
      }
    }
  })

  it.each(PROGRAMS.map(p => [p.id, p]))('%s keeps per-side targets even, and off timed holds', (_id, p) => {
    for (const r of programBundle(p).routines) {
      for (const e of r.ex) {
        if (e.side) {
          expect(e.mode === 'time', `${e.id}: a hold has no reps to split`).toBe(false)
          expect(e.reps % 2, `${e.id}: ${e.reps} reps cannot split evenly`).toBe(0)
        }
      }
    }
  })

  it.each(PROGRAMS.map(p => [p.id, p]))('%s schedules real routines on real weekdays', (_id, p) => {
    const b = programBundle(p)
    for (const d of Object.keys(p.week || {})) {
      expect(+d).toBeGreaterThanOrEqual(0)
      expect(+d).toBeLessThanOrEqual(6)
      expect(p.routines[p.week[d]], `week[${d}] points at no routine`).toBeTruthy()
    }
    expect(b.scheduledDays).toBe(Object.keys(p.week || {}).length)
  })

  it.each(PROGRAMS.map(p => [p.id, p]))('%s uses glyphs the picker can draw', (_id, p) => {
    expect(GLYPHS).toContain(p.glyph)
    for (const r of programBundle(p).routines) expect(GLYPHS).toContain(r.emoji)
  })

  it('gives every program a distinct id, a name and a blurb', () => {
    const ids = PROGRAMS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of PROGRAMS) {
      expect(p.name.length).toBeGreaterThan(0)
      expect(p.blurb.length).toBeGreaterThan(0)
    }
  })

  it('ships Nick’s five programs plus one general split', () => {
    expect(PROGRAMS.filter(p => !p.general).map(p => p.id))
      .toEqual(['run', 'sprint', 'movement', 'recovery', 'power'])
    expect(PROGRAMS.filter(p => p.general).map(p => p.id)).toEqual(['ppl'])
  })
})

describe('programBundle', () => {
  it('links a superset as one group, on adjacent entries', () => {
    const upper = programBundle(programById('movement')).routines[1].ex
    const linked = upper.filter(e => e.sg)
    expect(linked).toHaveLength(2)
    expect(linked[0].sg).toBe(linked[1].sg)
    expect(upper.indexOf(linked[1]) - upper.indexOf(linked[0])).toBe(1)
  })

  it('numbers superset groups per routine, not across the program', () => {
    // Two routines both using `sg: 1` must not end up sharing one group id.
    const groups = PROGRAMS.flatMap(p => programBundle(p).routines
      .map(r => [...new Set(r.ex.filter(e => e.sg).map(e => e.sg))]))
    const all = groups.flat()
    expect(new Set(all).size).toBe(all.length)
  })

  it('carries custom exercises with the entries that reference them', () => {
    const b = programBundle(programById('recovery'))
    expect(b.customEx.map(c => c.id)).toEqual(['@breath360'])
    expect(b.customEx[0]).toMatchObject({ n: '360° breathing — supine', bp: 'waist' })
    expect(b.routines[0].ex[0].id).toBe('@breath360')
  })

  it('spells a spec out into the right mode', () => {
    const run = programBundle(programById('run'))
    const cardio = run.routines[2].ex[0]
    expect(cardio).toEqual({ id: '0685', sets: 1, min: 25, speed: 9 })   // no mode: inferred
    const hold = run.routines[2].ex[1]
    expect(hold).toMatchObject({ mode: 'time', sec: 45 })
    expect(hold.reps).toBeUndefined()
  })

  it('flags bodyweight only when the dataset disagrees', () => {
    const rec = programBundle(programById('recovery'))
    const assisted = rec.routines[1].ex[0]          // eq: 'assisted' — not bodyweight upstream
    expect(assisted.bodyweight).toBe(true)
    const stretch = rec.routines[0].ex[3]           // eq: 'body weight' — already implied
    expect(stretch.bodyweight).toBeUndefined()
  })

  it('applies a plan-level progression rule to every routine, and lets one override', () => {
    for (const r of programBundle(programById('recovery')).routines) expect(r.prog).toBe('off')
    for (const r of programBundle(programById('movement')).routines) expect(r.prog).toBeUndefined()
  })

  it('maps the week onto the routines it actually built', () => {
    const p = programById('recovery')
    const b = programBundle(p)
    expect(b.week).toEqual({ 2: 'r0', 4: 'r1', 0: 'r2' })
    expect(dayLine(b.week)).toBe('Tu · Th · Su')      // Monday-first, Sunday last
    expect(dayOfRoutine(p, 0)).toBe('Tu')
    expect(dayOfRoutine(p, 2)).toBe('Su')
  })

  it('counts what the picker shows', () => {
    const b = programBundle(programById('sprint'))
    expect(b.routineCount).toBe(3)
    expect(b.exerciseCount).toBe(b.routines.reduce((n, r) => n + r.ex.length, 0))
    expect(b.dropped).toBe(0)
  })
})
