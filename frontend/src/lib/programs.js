/* ============================================================================
   Health In Motion — Nick's programs
   ----------------------------------------------------------------------------
   Data only. No logic lives here, so changing a program is a one-line edit:
   swap an exercise id, move a session to another weekday, change a target.
   starter.js turns this into routines; the picker sheet renders it.

   An exercise is [id, sets, spec, opts?]:

     spec   8          8 reps
            '45s'      a 45-second hold
            '25min@9'  25 minutes at 9 km/h  (cardio-body-part ids only — see below)

     opts   side       counts both sides; the target is stored even and shown as "8/side"
            bw         no weight to enter. Needed on band / roller / assisted / custom
                       entries, whose equipment isn't "body weight" in the dataset, so
                       the app would otherwise ask for a load that doesn't exist.
            w          planned load in kg (added load when bw is set)
            prog       progression rule for this exercise: 'off' pins the target
            sg         superset group — any small number; entries sharing one are
                       linked, and they have to be next to each other

   Three constraints the app imposes, learned the hard way:

   1. Cardio mode only works on ids the dataset marks bp:'cardio' (here: '0685' run).
      The config sheet forces those into cardio and hides the reps/time choice, so a
      sprint drill on a cardio id would turn into a 20-minute jog the first time a
      client opened it. Sprints, jumps and ladder work are custom exercises instead.
   2. A timed hold has no reps, so it can't be per-side. Two 45s holds per side is
      four sets of 45s, and that's how they're written below.
   3. '@name' references an entry in the program's own customEx. starter.js hands
      those to mergePlan, which reuses a client's existing custom exercise when the
      name and body part already match — so loading two programs that both want a
      box jump leaves one in their library, not two.
   ========================================================================== */

export const PROGRAMS = [
  /* ------------------------------------------------------------------ run -- */
  {
    id: 'run',
    name: 'Run Without Pain',
    blurb: 'Find what broke down, rebuild the pattern, get back on the road. Corrective work, light loads, most of it one side at a time.',
    glyph: 'figureRun',
    // Corrective work is a prescribed dose, not something to auto-load every week.
    prog: 'off',
    week: { 1: 0, 4: 1, 6: 2 },
    routines: [
      {
        name: 'Reset & Activate', glyph: 'stretch',
        ex: [
          ['1422', 2, 12],                        // pelvic tilt into bridge
          ['3013', 3, 12],                        // low glute bridge on floor
          ['3561', 3, 16, { side: true }],        // glute bridge march
          ['0276', 3, 16, { side: true }],        // dead bug
          ['0710', 3, 20, { side: true }],        // side hip abduction
          ['0979', 2, 16, { side: true, bw: true }], // band horizontal pallof press
          ['1387', 3, 24, { side: true }],        // one leg floor calf raise
        ],
      },
      {
        name: 'Single-Leg Control', glyph: 'legs',
        ex: [
          ['1604', 2, '45s'],                     // world greatest stretch
          ['3645', 3, 16, { side: true }],        // single leg bridge, outstretched leg
          ['2368', 3, 16, { side: true }],        // split squats
          ['0730', 3, 12, { side: true }],        // single leg platform slide
          ['1774', 3, '30s'],                     // side bridge hip abduction
          ['1368', 2, 20, { side: true }],        // ankle circles
          ['1490', 3, 20],                        // standing calf raise on a staircase
        ],
      },
      {
        name: 'Easy Run & Mobility', glyph: 'figureRun',
        ex: [
          ['0685', 1, '25min@9'],                 // run
          // Four sets, not two: a hold can't be marked per-side, so both sides are sets.
          ['1377', 4, '45s'],                     // calf stretch, hands against wall
          ['1511', 4, '45s'],                     // hamstring stretch
          ['2567', 4, '45s'],                     // seated piriformis stretch
          ['1424', 4, '45s'],                     // seated glute stretch
        ],
      },
    ],
  },

  /* --------------------------------------------------------------- sprint -- */
  {
    id: 'sprint',
    name: 'Sprint Faster',
    blurb: 'Mechanics, force production and acceleration. Short efforts at full intent, backed by the strength work that makes them stick.',
    glyph: 'bolt',
    week: { 1: 0, 3: 1, 5: 2 },
    customEx: [
      { key: 'amarch', n: 'A-March (wall drill)', bp: 'upper legs', desc: 'Hands on the wall, body on a straight line from heel to head. Drive one knee to hip height, dorsiflexed foot, and step down through the ball of the foot. Slow and exact — this is a position drill, not a conditioning one.' },
      { key: 'askip', n: 'A-Skip', bp: 'upper legs', desc: 'The A-March with a skip underneath it. Tall posture, quick ground contact, knee to hip height. Rhythm over height.' },
      { key: 'sprint30', n: 'Sprint — 30 m from a two-point start', bp: 'upper legs', desc: 'Two-point start, shin angle out of the blocks, gradual rise over the first 15 m. Full effort every rep. Walk back and take a full 2–3 minutes between reps — this is a quality drill, and tired sprinting is just running.' },
      { key: 'flysprint', n: 'Flying sprint — 20 m build, 20 m max', bp: 'upper legs', desc: 'Build over 20 m, then hold maximum velocity for 20 m. Tall, relaxed, hands from pocket to chin. Full recovery between reps.' },
    ],
    routines: [
      {
        name: 'Acceleration', glyph: 'bolt',
        ex: [
          ['@amarch', 3, 20, { side: true, bw: true, prog: 'off' }],
          ['1472', 4, 5, { prog: 'off' }],        // forward jump
          ['@sprint30', 6, '6s', { bw: true, prog: 'off' }],
          ['0053', 4, 3, { w: 40, prog: 'off' }], // barbell jump squat
          ['0043', 4, 5, { w: 60 }],              // barbell full squat
          ['0085', 3, 8, { w: 50 }],              // barbell romanian deadlift
        ],
      },
      {
        name: 'Top Speed & Elastic', glyph: 'figureRun',
        ex: [
          ['@askip', 3, 20, { side: true, bw: true, prog: 'off' }],
          ['3543', 4, 5, { prog: 'off' }],        // bodyweight drop jump squat
          ['@flysprint', 5, '8s', { bw: true, prog: 'off' }],
          ['0114', 3, 16, { side: true, w: 30 }], // barbell step-up
          ['1373', 3, 20],                        // bodyweight standing calf raise
          ['0276', 3, 16, { side: true, prog: 'off' }], // dead bug
        ],
      },
      {
        name: 'Tempo & Strength', glyph: 'barbell',
        ex: [
          ['0685', 1, '12min@11'],                // run
          ['0116', 3, 8, { w: 50 }],              // barbell straight leg deadlift
          ['0549', 4, 12, { w: 20 }],             // kettlebell swing
          ['2133', 3, '40s', { w: 24 }],          // farmers walk
          ['1015', 3, 16, { side: true, bw: true }], // band vertical pallof press
          ['1511', 2, '45s'],                     // hamstring stretch
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- movement -- */
  {
    id: 'movement',
    name: 'Movement & Gym',
    blurb: 'Corrective movement paired with real gym work. Loaded mobility and functional strength, on a week that keeps progressing.',
    glyph: 'figureStrength',
    // No plan-level rule: the barbell work follows the default linear progression,
    // and only the corrective pieces below pin their targets.
    week: { 1: 0, 3: 1, 5: 2 },
    routines: [
      {
        name: 'Move: Lower', glyph: 'legs',
        ex: [
          ['1604', 2, '45s', { prog: 'off' }],    // world greatest stretch
          ['1760', 4, 10, { w: 16 }],             // dumbbell goblet squat
          ['1459', 3, 10, { w: 20 }],             // dumbbell romanian deadlift
          ['0431', 3, 16, { side: true, w: 12 }], // dumbbell step-up
          ['3561', 2, 16, { side: true, prog: 'off' }], // glute bridge march
          ['1373', 3, 15],                        // bodyweight standing calf raise
        ],
      },
      {
        name: 'Move: Upper', glyph: 'arm',
        ex: [
          ['1271', 2, '40s', { prog: 'off' }],    // chest and front of shoulder stretch
          ['0662', 4, 12, { sg: 1 }],             // push-up            ┐ superset
          ['0292', 4, 16, { side: true, w: 18, sg: 1 }], // one arm row  ┘
          ['0405', 3, 10, { w: 12 }],             // dumbbell seated shoulder press
          ['2330', 3, 10, { w: 35 }],             // cable lat pulldown full ROM
          ['0979', 3, 16, { side: true, bw: true, prog: 'off' }], // band pallof press
        ],
      },
      {
        name: 'Gym: Full Body', glyph: 'barbell',
        ex: [
          ['0043', 4, 6, { w: 50 }],              // barbell full squat
          ['0025', 4, 6, { w: 40 }],              // barbell bench press
          ['0027', 4, 8, { w: 40 }],              // barbell bent over row
          ['0549', 3, 15, { w: 20 }],             // kettlebell swing
          ['2133', 3, '45s', { w: 24 }],          // farmers walk
          ['0276', 3, 16, { side: true, prog: 'off' }], // dead bug
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- recovery -- */
  {
    id: 'recovery',
    name: 'Recovery',
    blurb: 'For a body that has been through it. Breath work, assisted stretching and corrective exercise — a way back to feeling normal.',
    glyph: 'heart',
    prog: 'off',
    week: { 2: 0, 4: 1, 0: 2 },
    customEx: [
      { key: 'breath360', n: '360° breathing — supine', bp: 'waist', desc: 'On your back, knees bent, one hand on the lower ribs and one on the belly. Breathe in through the nose for four and send the air sideways into the ribs, not up into the chest — the hand on your ribs should move out. Out through the mouth for six, letting the ribs come down. Slow, quiet, no strain.' },
    ],
    routines: [
      {
        name: 'Breathe & Release', glyph: 'moon',
        ex: [
          ['@breath360', 3, '90s', { bw: true }],
          ['2208', 2, '60s', { bw: true }],       // roller back stretch
          ['2202', 2, '60s', { bw: true }],       // roller hip stretch
          ['1363', 2, '45s'],                     // spine stretch
          ['1365', 2, '45s'],                     // upper back stretch
          ['1403', 4, '30s'],                     // neck side stretch (both sides)
        ],
      },
      {
        name: 'Assisted Stretch', glyph: 'stretch',
        // Four sets each: two per side, since a hold can't carry a per-side flag.
        ex: [
          ['1709', 4, '45s', { bw: true }],       // assisted lying glutes stretch
          ['1710', 4, '45s', { bw: true }],       // assisted gluteus & piriformis
          ['0016', 4, '45s', { bw: true }],       // assisted prone hamstring
          ['1713', 4, '45s', { bw: true }],       // assisted prone lying quads
          ['1712', 4, '45s', { bw: true }],       // assisted side lying adductor
          ['1708', 4, '45s', { bw: true }],       // assisted lying calves
        ],
      },
      {
        name: 'Corrective Basics', glyph: 'figureStrength',
        ex: [
          ['@breath360', 2, '60s', { bw: true }],
          ['1422', 2, 12],                        // pelvic tilt into bridge
          ['3013', 3, 12],                        // low glute bridge on floor
          ['0276', 3, 16, { side: true }],        // dead bug
          ['0710', 2, 20, { side: true }],        // side hip abduction
          ['1368', 2, 20, { side: true }],        // ankle circles
          ['1511', 4, '45s'],                     // hamstring stretch
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- power -- */
  {
    id: 'power',
    name: 'Power & Plyometrics',
    blurb: 'Jump higher, cut faster, put more force into the ground. Med balls, jumps and ladder work, over a base of real strength.',
    glyph: 'flame',
    week: { 1: 0, 4: 1, 6: 2 },
    customEx: [
      { key: 'boxjump', n: 'Box jump', bp: 'upper legs', desc: 'Set the box so you land in a quarter squat, not a deep one. Swing the arms, jump, and land quiet and stable — step down, never jump down. Stop the set the moment the landings stop being silent.' },
      { key: 'laddericky', n: 'Agility ladder — icky shuffle', bp: 'lower legs', desc: 'In-in, out-out down the ladder, hips square and eyes up. Fast feet, short ground contact. Quality of rhythm beats speed.' },
    ],
    routines: [
      {
        name: 'Med Ball Power', glyph: 'boxing',
        ex: [
          ['1302', 4, 6, { w: 4, prog: 'off' }],  // medicine ball chest pass
          ['1354', 4, 6, { w: 6, prog: 'off' }],  // medicine ball overhead slam
          ['0640', 3, 12, { side: true, w: 4, prog: 'off' }], // one arm slam
          ['1353', 3, 6, { w: 4, prog: 'off' }],  // catch and overhead throw
          ['1306', 3, 6, { prog: 'off' }],        // plyo push up
          ['0276', 3, 16, { side: true, prog: 'off' }], // dead bug
        ],
      },
      {
        name: 'Jumps & Landings', glyph: 'bolt',
        ex: [
          ['@laddericky', 4, '20s', { bw: true, prog: 'off' }],
          ['@boxjump', 5, 3, { bw: true, prog: 'off' }],
          ['1374', 3, 8, { side: true, prog: 'off' }], // box jump down w/ one leg stabilization
          ['0514', 4, 6, { prog: 'off' }],        // jump squat
          ['3582', 3, 12, { side: true, prog: 'off' }], // lunge with jump
          ['1472', 4, 4, { prog: 'off' }],        // forward jump
        ],
      },
      {
        name: 'Strength Behind the Power', glyph: 'barbell',
        ex: [
          ['0043', 5, 5, { w: 60 }],              // barbell full squat
          ['0053', 4, 3, { w: 40, prog: 'off' }], // barbell jump squat
          ['0085', 3, 8, { w: 50 }],              // barbell romanian deadlift
          ['0549', 4, 12, { w: 24 }],             // kettlebell swing
          ['1373', 3, 20],                        // bodyweight standing calf raise
          ['2133', 3, '40s', { w: 24 }],          // farmers walk
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ ppl -- */
  {
    // Not one of Nick's — the classic split, kept for anyone who just wants one,
    // and shown under its own heading in the picker. The demo build also seeds
    // twelve weeks of history onto exactly these routines, so leave the entries
    // as bare [id, sets, reps]: no flags, no rule, nothing extra.
    id: 'ppl',
    name: 'Push / Pull / Legs',
    blurb: 'The classic three-day gym split — chest & shoulders, back & arms, then legs.',
    glyph: 'barbell',
    general: true,
    week: { 1: 0, 3: 1, 5: 2 },
    routines: [
      {
        name: 'Push Day', glyph: 'barbell',
        ex: [['0025', 4, 8], ['0047', 3, 10], ['0426', 3, 10], ['0334', 3, 12], ['0241', 3, 12], ['0251', 3, 10]],
      },
      {
        name: 'Pull Day', glyph: 'pullup',
        ex: [['2330', 4, 10], ['0027', 4, 8], ['1323', 3, 10], ['0031', 3, 10], ['0313', 3, 12]],
      },
      {
        name: 'Leg Day', glyph: 'legs',
        ex: [['0043', 4, 8], ['0085', 3, 10], ['0739', 3, 12], ['0585', 3, 12], ['0586', 3, 12], ['0605', 4, 15]],
      },
    ],
  },
]
