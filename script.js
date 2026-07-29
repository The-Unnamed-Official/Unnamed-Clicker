/* BUTTON // REACTOR v2.0.0 */
(() => {
  'use strict';

  const VERSION = '2.0.0';
  const SAVE_KEY = 'button_reactor_save_v2.0.0';
  const BACKUP_KEY = 'button_reactor_save_v2.0.0_backup';
  const LEGACY_KEYS = [
    'button_clicker_save_v1.0.0',
    'button_clicker_save_v0.9.0',
    'button_clicker_save_v0.8.9'
  ];
  const CRIT_CAP = 0.75;
  const ASCENSION_THRESHOLD = 1e12;
  const CORE_COST_GROWTH = 130;
  const CORE_TREE_WIDTH = 2200;
  const CORE_TREE_HEIGHT = 1500;
  const CORE_NODE_RADIUS = 34;
  const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
  const GOLDEN_ONE_IN = 3333;
  const GOLDEN_MIN_ONE_IN = 333;
  const GOLDEN_CONVERGENCE_TARGETS = Object.freeze([Infinity, 480, 438, 398, 364, 333]);
  const AURA_LUCK_BONUSES = Object.freeze([0, 0.05, 0.10, 0.20]);
  const GLITCHED_GOLDEN_ONE_IN = 30404;
  const GOLDEN_RUSH_ONE_IN = 333;
  const GOLDEN_RUSH_DURATION_MS = 15000;
  const GOLDEN_RUSH_INTERVAL_MS = 300;
  const GLITCH_DURATION_MS = 33000;
  const GLITCH_FADE_MS = 2000;
  const GLITCH_BURST_INTERVAL_MS = 8000;
  const GLITCH_MULTIPLIER = 3333;
  const GLITCH_TRACK_SOURCE = './music/music_glitch.mp3?v=20260729-direct-audio';

  const JUKEBOX_SOUNDS = [
    { id: 'click', name: 'Button Contact', detail: 'Standard manual press' },
    { id: 'crit', name: 'Critical Contact', detail: 'Critical press confirmation' },
    { id: 'buy', name: 'System Purchase', detail: 'Upgrade and tower installation' },
    { id: 'reward', name: 'Reward Acquired', detail: 'Achievement and rare aura reward' },
    { id: 'fail', name: 'Signal Failure', detail: 'Rejected or corrupted input' },
    { id: 'golden', name: 'Golden Capture', detail: 'Golden signal recovery' },
    { id: 'goldenSpawnSelected', name: 'Golden Signal Spawn', detail: 'Preview the currently selected receiver sound' },
    { id: 'glitchSpawn', name: 'Glitched Signal Spawn', detail: 'Fixed corrupted receiver breach sound' },
    { id: 'shutdown', name: 'Reactor Shutdown', detail: 'Ascension power-down sequence' },
    { id: 'reboot', name: 'Heavenly Reboot', detail: 'New-cycle startup sequence' }
  ];

  const GOLDEN_SPAWN_SOUNDS = [
    { id: 'default', name: 'Quiet Spark', sound: 'goldenSpawnDefault', cost: 0, detail: 'The standard restrained receiver ping.' },
    { id: 'simple', name: 'Simple Ping', sound: 'goldenSpawnSimple', cost: 25, detail: 'A clean, inexpensive single-note alert.' },
    { id: 'radiant', name: 'Radiant Chime', sound: 'goldenSpawnRadiant', cost: 1800, detail: 'A brighter two-stage signal that is much easier to notice.' },
    { id: 'comfort', name: 'Comfort Beacon', sound: 'goldenSpawnComfort', cost: 50000, detail: 'A clear, warm triad designed to remain comfortable during long runs.' }
  ];

  const CONVERTER_UPGRADES = [
    { id: 'facetedBit', name: 'Faceted Drill Bit', icon: 'FB', cost: 15, detail: 'Button and charge yield ×1.40.', effect: { kind: 'converterYield', value: 1.4 } },
    { id: 'pulseMotor', name: 'Pulse Motor', icon: 'PM', cost: 60, detail: 'Mining speed ×1.30.', effect: { kind: 'converterSpeed', value: 1.3 } },
    { id: 'leanCatalyst', name: 'Lean Catalyst', icon: 'LC', cost: 300, detail: 'Every crystal counts as 1.20 crystals.', effect: { kind: 'converterEfficiency', value: 1.2 } },
    { id: 'dualShaft', name: 'Dual-Shaft Bore', icon: 'DS', cost: 1400, detail: 'Mining speed ×1.65.', effect: { kind: 'converterSpeed', value: 1.65 } },
    { id: 'spectrumGate', name: 'Spectrum Gate', icon: 'SG', cost: 6500, detail: 'Unlock crystal conversion into Scanner Charge.', unlock: 'charge' },
    { id: 'deepMantle', name: 'Deep-Mantle Sifter', icon: 'DM', cost: 22000, detail: 'All converter yield ×2.50.', effect: { kind: 'converterYield', value: 2.5 } }
  ];

  const CONVERTER_RECIPES = [
    { id: 'buttons', name: 'Button Ore', icon: 'B', detail: 'Compress crystal structure into immediate Buttons.' },
    { id: 'charge', name: 'Scanner Charge', icon: 'R', detail: 'Refine crystals into Observatory capacitor charge.' },
    { id: 'cores', name: 'Heavenly Cores', icon: 'C', detail: 'Late-Heavenly transmutation of dense crystal batches.' }
  ];

  const TOWERS = [
    { id: 'clickbot', name: 'Tap Drone', icon: 'TD', baseCost: 15, baseProd: 0.15, growth: 1.145, desc: 'A tiny pneumatic finger that never gets tired.' },
    { id: 'workshop', name: 'Press Workshop', icon: 'PW', baseCost: 100, baseProd: 1.1, growth: 1.147, desc: 'Builds precise button-pressing mechanisms.' },
    { id: 'server', name: 'Signal Server', icon: 'SS', baseCost: 1100, baseProd: 9, growth: 1.149, desc: 'Turns clean data pulses into synthetic presses.' },
    { id: 'lab', name: 'Probability Lab', icon: 'PL', baseCost: 12000, baseProd: 72, growth: 1.151, desc: 'Studies the statistically ideal press.' },
    { id: 'factory', name: 'Actuator Factory', icon: 'AF', baseCost: 130000, baseProd: 620, growth: 1.153, desc: 'Mass-produces industrial pressure assemblies.' },
    { id: 'temple', name: 'Resonance Temple', icon: 'RT', baseCost: 1.4e6, baseProd: 5400, growth: 1.155, desc: 'Amplifies every press through harmonic ritual.' },
    { id: 'portal', name: 'Phase Gate', icon: 'PG', baseCost: 2e7, baseProd: 70000, growth: 1.157, desc: 'Imports completed presses from adjacent space.' },
    { id: 'aicore', name: 'Cognition Core', icon: 'CC', baseCost: 3.3e8, baseProd: 1.05e6, growth: 1.159, desc: 'Imagines buttons, then makes them real.' },
    { id: 'forge', name: 'Quark Forge', icon: 'QF', baseCost: 5.5e9, baseProd: 1.6e7, growth: 1.161, desc: 'Forges pressure from subatomic collisions.' },
    { id: 'singularity', name: 'Gravity Well', icon: 'GW', baseCost: 9.5e10, baseProd: 2.7e8, growth: 1.163, desc: 'Compresses entire production lines into one point.' },
    { id: 'chrono', name: 'Chrono Loom', icon: 'CL', baseCost: 4e12, baseProd: 1.1e10, growth: 1.166, desc: 'Weaves unused seconds into finished button presses.' },
    { id: 'neutron', name: 'Neutron Press', icon: 'NP', baseCost: 7.6e13, baseProd: 1.76e11, growth: 1.167, desc: 'Collapses neutron-dense tooling onto an unbreakable switch.' },
    { id: 'dimensional', name: 'Dimensional Foundry', icon: 'DF', baseCost: 1.444e15, baseProd: 2.816e12, growth: 1.168, desc: 'Forges production lines across several adjacent dimensions.' },
    { id: 'horizon', name: 'Event Horizon Mill', icon: 'EH', baseCost: 2.7436e16, baseProd: 4.5056e13, growth: 1.169, desc: 'Harvests the final motion of matter crossing a black horizon.' },
    { id: 'timeline', name: 'Timeline Harvester', icon: 'TH', baseCost: 5.21284e17, baseProd: 7.20896e14, growth: 1.17, desc: 'Collects every press that almost happened in abandoned timelines.' },
    { id: 'vacuum', name: 'Vacuum Cathedral', icon: 'VC', baseCost: 9.904396e18, baseProd: 1.1534336e16, growth: 1.171, desc: 'Turns the silence between particles into mechanical pressure.' },
    { id: 'reality', name: 'Reality Compiler', icon: 'RC', baseCost: 1.88183524e20, baseProd: 1.84549376e17, growth: 1.172, desc: 'Compiles button production directly into the laws of the cycle.' },
    { id: 'multiverse', name: 'Multiverse Relay', icon: 'MR', baseCost: 3.575486956e21, baseProd: 2.952790016e18, growth: 1.173, desc: 'Routes successful presses from a limitless network of reactors.' },
    { id: 'entropy', name: 'Entropy Reverser', icon: 'ER', baseCost: 6.7934252164e22, baseProd: 4.7244640256e19, growth: 1.174, desc: 'Rebuilds spent energy into a younger and stronger production state.' },
    { id: 'causal', name: 'Causal Nexus', icon: 'CN', baseCost: 1.290750791116e24, baseProd: 7.55914244096e20, growth: 1.175, desc: 'Makes every future press the cause of its own creation.' },
    { id: 'omega', name: 'Omega Fabricator', icon: 'OF', baseCost: 2.4524265031204e25, baseProd: 1.2094627905536e22, growth: 1.176, desc: 'Manufactures final-form actuators beyond conventional engineering.' },
    { id: 'paradoxTower', name: 'Paradox Engine', icon: 'PE', baseCost: 4.65961035592876e26, baseProd: 1.93514046488576e23, growth: 1.177, desc: 'Produces buttons because the production counter says they already exist.' },
    { id: 'cosmic', name: 'Cosmic Author', icon: 'CA', baseCost: 8.85325967626464e27, baseProd: 3.09622474381722e24, growth: 1.178, desc: 'Writes new production into the margins of the observable universe.' },
    { id: 'infinity', name: 'Infinity Assembly', icon: 'IA', baseCost: 1.68211933849028e29, baseProd: 4.95395959010755e25, growth: 1.179, desc: 'Runs an assembly sequence with no first or final machine.' },
    { id: 'aeternumTower', name: 'Aeternum Array', icon: 'AA', baseCost: 3.19602674313153e30, baseProd: 7.92633534417208e26, growth: 1.18, desc: 'An eternal lattice that continues pressing outside measurable time.' },
    { id: 'you', name: 'The Operator', icon: 'YOU', baseCost: 6.4e31, baseProd: 1.3e28, growth: 1.182, desc: 'The final version of you, operating beyond every machine and timeline.' }
  ];

  const upgrade = (id, name, category, cost, icon, desc, effectText, effect, unlock = {}) => ({
    id, name, category, cost, icon, desc, effectText, effect, unlock
  });

  const ENDGAME_ERAS = [
    'Deep Pressure',
    'Stellar Mechanics',
    'Causal Industry',
    'Quantum Foundry',
    'Timeline Engine',
    'Void Architecture',
    'Reality Furnace',
    'Infinite Assembly',
    'Paradox Network',
    'Cosmic Recursion',
    'Aeternum Grid',
    'Transfinite Works',
    'Absolute Reactor',
    'Finality Machine',
    'Beyond Continuum'
  ];

  const ENDGAME_PHASES = [
    { name: 'Impact Array', category: 'press', kind: 'clickMult', base: 2.2, growth: 0.28, label: value => `Press power ×${value.toFixed(2)}` },
    { name: 'Output Lattice', category: 'production', kind: 'global', base: 1.8, growth: 0.18, label: value => `All output ×${value.toFixed(2)}` },
    { name: 'Tower Manifold', category: 'production', kind: 'towerGlobal', base: 2.1, growth: 0.25, label: value => `All tower output ×${value.toFixed(2)}` },
    { name: 'Critical Amplifier', category: 'critical', kind: 'critPower', base: 0.75, growth: 0.35, label: value => `Critical power +${value.toFixed(2)}×` },
    { name: 'Auric Compressor', category: 'utility', kind: 'goldenReward', base: 2.3, growth: 0.3, label: value => `Golden rewards ×${value.toFixed(2)}` },
    { name: 'Scanner Dynamo', category: 'utility', kind: 'charge', base: 2.2, growth: 0.35, label: value => `Scanner charge ×${value.toFixed(2)}` },
    { name: 'Operator Cascade', category: 'press', kind: 'clickMult', base: 2.7, growth: 0.32, label: value => `Press power ×${value.toFixed(2)}` },
    { name: 'Production Singularity', category: 'production', kind: 'global', base: 2.4, growth: 0.28, label: value => `All output ×${value.toFixed(2)}` },
    { name: 'Autonomous Continuum', category: 'production', kind: 'towerGlobal', base: 3, growth: 0.38, label: value => `All tower output ×${value.toFixed(2)}` },
    { name: 'Era Capstone', category: 'production', kind: 'global', base: 4, growth: 0.7, label: value => `All output ×${value.toFixed(2)}` }
  ];

  const ENDGAME_UPGRADES = ENDGAME_ERAS.flatMap((era, eraIndex) => ENDGAME_PHASES.map((phase, phaseIndex) => {
    const index = eraIndex * ENDGAME_PHASES.length + phaseIndex;
    const id = `continuum${String(index + 1).padStart(3, '0')}`;
    const previousId = index === 0 ? 'calibration5' : `continuum${String(index).padStart(3, '0')}`;
    const value = phase.base + phase.growth * eraIndex;
    const cost = 1e27 * Math.pow(5.5, index);
    return upgrade(
      id,
      `${era} // ${phase.name}`,
      phase.category,
      cost,
      `${eraIndex + 1}.${phaseIndex + 1}`,
      `Endgame sequence ${index + 1} of 150. Extend the ${era.toLowerCase()} layer beyond every standard modification.`,
      phase.label(value),
      { kind: phase.kind, value },
      { requires: previousId, type: 'buttons', value: cost / 3 }
    );
  }));

  const UPGRADES = [
    upgrade('click1', 'Weighted Keycap', 'press', 40, '+', 'Add a denser cap to the manual reactor.', '+1 base press', { kind: 'clickFlat', value: 1 }),
    upgrade('click2', 'Twin Contact', 'press', 350, '×', 'Register a second input at the bottom of each press.', '+3 base press', { kind: 'clickFlat', value: 3 }, { requires: 'click1', type: 'buttons', value: 200 }),
    upgrade('click3', 'Servo Assist', 'press', 2800, '↟', 'A compact servo follows the operator’s motion.', 'Press power ×1.6', { kind: 'clickMult', value: 1.6 }, { requires: 'click2', type: 'buttons', value: 1800 }),
    upgrade('click4', 'Kinetic Return', 'press', 24000, '↻', 'Recycle the force released when the button rises.', '+18 base press', { kind: 'clickFlat', value: 18 }, { requires: 'click3', type: 'buttons', value: 15000 }),
    upgrade('click5', 'Pressure Stack', 'press', 2.2e5, '▤', 'Layer several microscopic presses into one motion.', 'Press power ×2', { kind: 'clickMult', value: 2 }, { requires: 'click4', type: 'buttons', value: 1.4e5 }),
    upgrade('click6', 'Haptic Loop', 'press', 2.8e6, '≈', 'Feed reactor vibration back into your next input.', '+180 base press', { kind: 'clickFlat', value: 180 }, { requires: 'click5', type: 'buttons', value: 1.5e6 }),
    upgrade('click7', 'Quantum Finger', 'press', 4.5e7, 'Ψ', 'Press at several probable positions at once.', 'Press power ×2.5', { kind: 'clickMult', value: 2.5 }, { requires: 'click6', type: 'buttons', value: 2e7 }),
    upgrade('click8', 'Operator Link', 'press', 8e8, '⌁', 'Reduce the distance between intent and input.', '+7,500 base press', { kind: 'clickFlat', value: 7500 }, { requires: 'click7', type: 'buttons', value: 3e8 }),
    upgrade('click9', 'Causal Press', 'press', 1.8e10, '⟲', 'Make the effect arrive slightly before the cause.', 'Press power ×4', { kind: 'clickMult', value: 4 }, { requires: 'click8', type: 'buttons', value: 7e9 }),
    upgrade('click10', 'Infinite Actuation', 'press', 6e12, '∞', 'Teach every press to contain a smaller press.', 'Press power ×8', { kind: 'clickMult', value: 8 }, { requires: 'click9', type: 'buttons', value: 1e12 }),

    upgrade('global1', 'Network Timing', 'production', 900, 'N1', 'Synchronize the first automation loop.', 'All output ×1.2', { kind: 'global', value: 1.2 }, { type: 'towers', value: 5 }),
    upgrade('global2', 'Shared Flywheel', 'production', 12000, 'N2', 'Store unused motion for the whole network.', 'All output ×1.3', { kind: 'global', value: 1.3 }, { requires: 'global1', type: 'buttons', value: 8000 }),
    upgrade('global3', 'Clean Signal Bus', 'production', 2.5e5, 'N3', 'Eliminate collisions between tower signals.', 'All output ×1.45', { kind: 'global', value: 1.45 }, { requires: 'global2', type: 'buttons', value: 1.5e5 }),
    upgrade('global4', 'Industrial Rhythm', 'production', 8e6, 'N4', 'Set the entire facility to one relentless tempo.', 'All output ×1.7', { kind: 'global', value: 1.7 }, { requires: 'global3', type: 'buttons', value: 4e6 }),
    upgrade('global5', 'Zero-Loss Grid', 'production', 3e8, 'N5', 'Route production without thermal waste.', 'All output ×2', { kind: 'global', value: 2 }, { requires: 'global4', type: 'buttons', value: 1.5e8 }),
    upgrade('global6', 'Reactor Chorus', 'production', 5e11, 'N6', 'Every tower reinforces every other tower.', 'All output ×3', { kind: 'global', value: 3 }, { requires: 'global5', type: 'buttons', value: 1e11 }),

    ...TOWERS.map((tower, index) => upgrade(
      `${tower.id}1`,
      `${tower.name} Overclock`,
      'production',
      tower.baseCost * Math.pow(18, 1 + index * 0.08),
      tower.icon,
      `A dedicated tuning package for ${tower.name}.`,
      `${tower.name} output ×2`,
      { kind: 'tower', tower: tower.id, value: 2 },
      { type: 'tower', tower: tower.id, value: 10 }
    )),

    upgrade('efficiency1', 'Bulk Logistics', 'utility', 5e5, '%', 'Consolidated purchasing reduces material waste.', 'Tower prices −4%', { kind: 'discount', value: 0.04 }, { type: 'towers', value: 50 }),
    upgrade('efficiency2', 'Closed-Loop Supply', 'utility', 2e9, '%', 'Everything removed from a tower becomes a component.', 'Tower prices −6%', { kind: 'discount', value: 0.06 }, { requires: 'efficiency1', type: 'towers', value: 500 }),
    upgrade('offline1', 'Standby Capacitors', 'utility', 4e6, 'Zz', 'Save a larger fraction of output while away.', 'Offline output +15%', { kind: 'offline', value: 0.15 }, { type: 'buttons', value: 2e6 }),
    upgrade('golden1', 'Gold Antenna', 'utility', 3e7, 'G', 'Tune the HUD to passing golden frequencies.', 'Golden signals +25% faster', { kind: 'goldenFrequency', value: 0.25 }, { type: 'golden', value: 1 }),
    upgrade('golden2', 'Radiant Capture', 'utility', 8e9, 'G+', 'Keep more energy from every golden contact.', 'Golden rewards ×1.75', { kind: 'goldenReward', value: 1.75 }, { requires: 'golden1', type: 'golden', value: 10 }),
    upgrade('rng1', 'Charge Recycler', 'utility', 1e8, 'R', 'Return scanner waste to the input capacitor.', 'Scanner charge gain ×1.5', { kind: 'charge', value: 1.5 }, { type: 'scans', value: 10 }),

    upgrade('crit1', 'Edge Detection', 'critical', 7500, 'C1', 'Recognize the cleanest fraction of a press.', 'Critical chance +0.50%', { kind: 'crit', value: 0.005 }, { type: 'buttons', value: 5000 }),
    upgrade('crit2', 'Contact Polish', 'critical', 65000, 'C2', 'Reduce noise across the reactor plate.', 'Critical chance +0.75%', { kind: 'crit', value: 0.0075 }, { requires: 'crit1', type: 'buttons', value: 40000 }),
    upgrade('crit3', 'Pressure Lens', 'critical', 6e5, 'C3', 'Focus an input onto the most responsive point.', 'Critical chance +1.00%', { kind: 'crit', value: 0.01 }, { requires: 'crit2', type: 'buttons', value: 3e5 }),
    upgrade('crit4', 'Lucky Bearing', 'critical', 7e6, 'C4', 'A bearing that always seems to stop correctly.', 'Critical chance +1.25%', { kind: 'crit', value: 0.0125 }, { requires: 'crit3', type: 'buttons', value: 3e6 }),
    upgrade('crit5', 'Probability Tap', 'critical', 8e7, 'C5', 'Ask chance for a slightly better outcome.', 'Critical chance +1.50%', { kind: 'crit', value: 0.015 }, { requires: 'crit4', type: 'buttons', value: 3e7 }),
    upgrade('crit6', 'Outcome Filter', 'critical', 1.2e9, 'C6', 'Discard a small share of ordinary results.', 'Critical chance +2.00%', { kind: 'crit', value: 0.02 }, { requires: 'crit5', type: 'buttons', value: 5e8 }),
    upgrade('crit7', 'Fortune Circuit', 'critical', 2e10, 'C7', 'Give favorable outcomes a shorter path.', 'Critical chance +2.50%', { kind: 'crit', value: 0.025 }, { requires: 'crit6', type: 'buttons', value: 8e9 }),
    upgrade('crit8', 'Causal Selection', 'critical', 5e11, 'C8', 'Select a better cause for the result you observed.', 'Critical chance +3.50%', { kind: 'crit', value: 0.035 }, { requires: 'crit7', type: 'buttons', value: 2e11 }),
    upgrade('crit9', 'Destiny Manifold', 'critical', 5e13, 'C9', 'Route the reactor through high-yield futures.', 'Critical chance +5.00%', { kind: 'crit', value: 0.05 }, { requires: 'crit8', type: 'buttons', value: 1e13 }),
    upgrade('calibration1', 'Calibration I', 'critical', 1e15, 'Ⅰ', 'Begin the long final calibration sequence.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'crit9', type: 'buttons', value: 5e14 }),
    upgrade('calibration2', 'Calibration II', 'critical', 1e17, 'Ⅱ', 'Isolate another layer of statistical drift.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'calibration1', type: 'buttons', value: 5e16 }),
    upgrade('calibration3', 'Calibration III', 'critical', 1e19, 'Ⅲ', 'Hold accuracy across planetary-scale output.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'calibration2', type: 'buttons', value: 5e18 }),
    upgrade('calibration4', 'Calibration IV', 'critical', 1e22, 'Ⅳ', 'Correct for uncertainty in the reactor itself.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'calibration3', type: 'buttons', value: 5e21 }),
    upgrade('calibration5', 'Calibration V', 'critical', 1e25, 'Ⅴ', 'Complete the purchased half of perfect probability.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'calibration4', type: 'buttons', value: 5e24 }),
    ...ENDGAME_UPGRADES
  ];

  const AURAS = [
    { id: 'static', name: 'Static', symbol: '·', tier: 'Common', weight: 52, color: '#9ba3aa', effect: { kind: 'global', value: 1.02 }, text: 'All output +2%' },
    { id: 'verdant', name: 'Verdant', symbol: 'V', tier: 'Common', weight: 48, color: '#6bf0a6', effect: { kind: 'click', value: 1.04 }, text: 'Press power +4%' },
    { id: 'cobalt', name: 'Cobalt', symbol: 'C', tier: 'Common', weight: 44, color: '#65aaff', effect: { kind: 'charge', value: 1.08 }, text: 'Charge gain +8%' },
    { id: 'ember', name: 'Ember', symbol: 'E', tier: 'Common', weight: 40, color: '#ff7a45', effect: { kind: 'global', value: 1.035 }, text: 'All output +3.5%' },
    { id: 'lumen', name: 'Lumen', symbol: 'L', tier: 'Uncommon', weight: 28, color: '#d2ff53', effect: { kind: 'click', value: 1.08 }, text: 'Press power +8%' },
    { id: 'tidal', name: 'Tidal', symbol: 'T', tier: 'Uncommon', weight: 26, color: '#55d7ff', effect: { kind: 'global', value: 1.06 }, text: 'All output +6%' },
    { id: 'rosewire', name: 'Rosewire', symbol: 'R', tier: 'Uncommon', weight: 24, color: '#ff7095', effect: { kind: 'critMult', value: 0.75 }, text: 'Critical power +0.75×' },
    { id: 'halcyon', name: 'Halcyon', symbol: 'H', tier: 'Uncommon', weight: 22, color: '#7fe6c4', effect: { kind: 'charge', value: 1.15 }, text: 'Charge gain +15%' },
    { id: 'prism', name: 'Prism', symbol: 'P', tier: 'Rare', weight: 10, color: '#d9a8ff', effect: { kind: 'global', value: 1.11 }, text: 'All output +11%' },
    { id: 'meteor', name: 'Meteor', symbol: 'M', tier: 'Rare', weight: 9, color: '#ffbd5a', effect: { kind: 'golden', value: 1.25 }, text: 'Golden rewards +25%' },
    { id: 'cipher', name: 'Cipher', symbol: '#', tier: 'Rare', weight: 8, color: '#72f0e1', effect: { kind: 'click', value: 1.18 }, text: 'Press power +18%' },
    { id: 'velvet', name: 'Velvet', symbol: '⌁', tier: 'Rare', weight: 7, color: '#b289ff', effect: { kind: 'critMult', value: 1.5 }, text: 'Critical power +1.5×' },
    { id: 'solar', name: 'Solar', symbol: 'S', tier: 'Epic', weight: 3.5, color: '#ffe16b', effect: { kind: 'global', value: 1.2 }, text: 'All output +20%' },
    { id: 'aurora', name: 'Aurora', symbol: 'A', tier: 'Epic', weight: 3.1, color: '#77ffd4', effect: { kind: 'charge', value: 1.35 }, text: 'Charge gain +35%' },
    { id: 'mirage', name: 'Mirage', symbol: '≈', tier: 'Epic', weight: 2.8, color: '#ff96e8', effect: { kind: 'click', value: 1.35 }, text: 'Press power +35%' },
    { id: 'quasar', name: 'Quasar', symbol: 'Q', tier: 'Epic', weight: 2.4, color: '#89a7ff', effect: { kind: 'global', value: 1.28 }, text: 'All output +28%' },
    { id: 'gilded', name: 'Gilded', symbol: 'G', tier: 'Legendary', weight: 0.9, color: '#ffc857', effect: { kind: 'golden', value: 1.8 }, text: 'Golden rewards +80%' },
    { id: 'eventide', name: 'Eventide', symbol: 'D', tier: 'Legendary', weight: 0.75, color: '#a78bfa', effect: { kind: 'global', value: 1.45 }, text: 'All output +45%' },
    { id: 'zenith', name: 'Zenith', symbol: 'Z', tier: 'Legendary', weight: 0.6, color: '#f4ffad', effect: { kind: 'click', value: 1.7 }, text: 'Press power +70%' },
    { id: 'singular', name: 'Singular', symbol: 'Ø', tier: 'Legendary', weight: 0.45, color: '#ff786e', effect: { kind: 'critMult', value: 3 }, text: 'Critical power +3×' },
    { id: 'origin', name: 'Origin', symbol: 'O', tier: 'Mythic', weight: 0.16, color: '#ffffff', effect: { kind: 'global', value: 1.85 }, text: 'All output +85%' },
    { id: 'nexus', name: 'Nexus', symbol: 'N', tier: 'Mythic', weight: 0.12, color: '#76f8ff', effect: { kind: 'charge', value: 2 }, text: 'Charge gain ×2' },
    { id: 'monolith', name: 'Monolith', symbol: '▮', tier: 'Mythic', weight: 0.08, color: '#ff835d', effect: { kind: 'click', value: 2.5 }, text: 'Press power ×2.5' },
    { id: 'paradox', name: 'Paradox', symbol: '∞', tier: 'Transcendent', oneIn: 12500, color: '#d2ff53', effect: { kind: 'global', value: 2.25 }, text: 'All output ×2.25 • Critical method found' },

    { id: 'afterimage', name: 'Afterimage', symbol: 'AI', tier: 'Celestial', oneIn: 18000, color: '#b8fff4', effect: { kind: 'global', value: 2.6 }, text: 'All output ×2.6' },
    { id: 'starfall', name: 'Starfall', symbol: 'SF', tier: 'Celestial', oneIn: 25000, color: '#ffe38d', effect: { kind: 'click', value: 3 }, text: 'Press power ×3' },
    { id: 'chronowire', name: 'Chronowire', symbol: 'CW', tier: 'Celestial', oneIn: 35000, color: '#76ebff', effect: { kind: 'charge', value: 2.4 }, text: 'Charge gain ×2.4' },
    { id: 'nebula', name: 'Nebula', symbol: 'NB', tier: 'Celestial', oneIn: 50000, color: '#da9cff', effect: { kind: 'golden', value: 3 }, text: 'Golden rewards ×3' },
    { id: 'voidglass', name: 'Voidglass', symbol: 'VG', tier: 'Celestial', oneIn: 75000, color: '#93a8ff', effect: { kind: 'critMult', value: 5 }, text: 'Critical power +5×' },
    { id: 'seraphic', name: 'Seraphic', symbol: 'SR', tier: 'Celestial', oneIn: 100000, color: '#fff7cf', effect: { kind: 'global', value: 3.4 }, text: 'All output ×3.4' },
    { id: 'moonless', name: 'Moonless', symbol: 'ML', tier: 'Celestial', oneIn: 140000, color: '#9d9cff', effect: { kind: 'click', value: 4 }, text: 'Press power ×4' },
    { id: 'hyperion', name: 'Hyperion', symbol: 'HY', tier: 'Celestial', oneIn: 200000, color: '#ffbd69', effect: { kind: 'global', value: 4.2 }, text: 'All output ×4.2' },

    { id: 'astralbloom', name: 'Astral Bloom', symbol: 'AB', tier: 'Ethereal', oneIn: 280000, color: '#ff92cf', effect: { kind: 'charge', value: 3 }, text: 'Charge gain ×3' },
    { id: 'ghostlight', name: 'Ghostlight', symbol: 'GL', tier: 'Ethereal', oneIn: 400000, color: '#baffdc', effect: { kind: 'golden', value: 5 }, text: 'Golden rewards ×5' },
    { id: 'eon', name: 'Eon', symbol: 'EO', tier: 'Ethereal', oneIn: 550000, color: '#f0f6ff', effect: { kind: 'global', value: 5 }, text: 'All output ×5' },
    { id: 'eventhorizon', name: 'Event Horizon', symbol: 'EH', tier: 'Ethereal', oneIn: 750000, color: '#ff6d8d', effect: { kind: 'critMult', value: 8 }, text: 'Critical power +8×' },
    { id: 'nullstar', name: 'Nullstar', symbol: 'NS', tier: 'Ethereal', oneIn: 1000000, color: '#8be7ff', effect: { kind: 'click', value: 6 }, text: 'Press power ×6' },
    { id: 'empyrean', name: 'Empyrean', symbol: 'EM', tier: 'Ethereal', oneIn: 1250000, color: '#ffeeb0', effect: { kind: 'global', value: 6.5 }, text: 'All output ×6.5' },
    { id: 'quantumrose', name: 'Quantum Rose', symbol: 'QR', tier: 'Ethereal', oneIn: 1500000, color: '#ff72b8', effect: { kind: 'charge', value: 4 }, text: 'Charge gain ×4' },
    { id: 'dreamwake', name: 'Dreamwake', symbol: 'DW', tier: 'Ethereal', oneIn: 1800000, color: '#c7a5ff', effect: { kind: 'global', value: 8 }, text: 'All output ×8' },

    { id: 'blackaurora', name: 'Black Aurora', symbol: 'BA', tier: 'Abyssal', oneIn: 2100000, color: '#8e80ff', effect: { kind: 'golden', value: 8 }, text: 'Golden rewards ×8' },
    { id: 'omega', name: 'Omega', symbol: 'Ω', tier: 'Abyssal', oneIn: 2400000, color: '#ff587c', effect: { kind: 'global', value: 10 }, text: 'All output ×10' },
    { id: 'causality', name: 'Causality', symbol: 'CA', tier: 'Abyssal', oneIn: 2700000, color: '#8fffea', effect: { kind: 'click', value: 12 }, text: 'Press power ×12' },
    { id: 'antimatter', name: 'Antimatter', symbol: 'AM', tier: 'Abyssal', oneIn: 3000000, color: '#ff9f70', effect: { kind: 'critMult', value: 14 }, text: 'Critical power +14×' },
    { id: 'whitenoise', name: 'White Noise', symbol: 'WN', tier: 'Abyssal', oneIn: 3300000, color: '#ffffff', effect: { kind: 'charge', value: 6 }, text: 'Charge gain ×6' },
    { id: 'godray', name: 'Godray', symbol: 'GR', tier: 'Abyssal', oneIn: 3600000, color: '#fff06e', effect: { kind: 'global', value: 15 }, text: 'All output ×15' },
    { id: 'riftborn', name: 'Riftborn', symbol: 'RB', tier: 'Abyssal', oneIn: 3900000, color: '#7fffd2', effect: { kind: 'golden', value: 12 }, text: 'Golden rewards ×12' },
    { id: 'lastlight', name: 'Last Light', symbol: 'LL', tier: 'Abyssal', oneIn: 4200000, color: '#ffc66d', effect: { kind: 'global', value: 20 }, text: 'All output ×20' },

    { id: 'elsewhere', name: 'Elsewhere', symbol: 'EW', tier: 'Impossible', oneIn: 4500000, color: '#88b8ff', effect: { kind: 'click', value: 24 }, text: 'Press power ×24' },
    { id: 'unwritten', name: 'Unwritten', symbol: 'UW', tier: 'Impossible', oneIn: 4800000, color: '#e2bcff', effect: { kind: 'global', value: 28 }, text: 'All output ×28' },
    { id: 'darkmatter', name: 'Dark Matter', symbol: 'DM', tier: 'Impossible', oneIn: 5100000, color: '#a185ff', effect: { kind: 'critMult', value: 30 }, text: 'Critical power +30×' },
    { id: 'timekeeper', name: 'Timekeeper', symbol: 'TK', tier: 'Impossible', oneIn: 5400000, color: '#64ecff', effect: { kind: 'charge', value: 10 }, text: 'Charge gain ×10' },
    { id: 'exnihilo', name: 'Ex Nihilo', symbol: 'EN', tier: 'Impossible', oneIn: 5700000, color: '#ff789f', effect: { kind: 'global', value: 36 }, text: 'All output ×36' },
    { id: 'infinityengine', name: 'Infinity Engine', symbol: 'IE', tier: 'Impossible', oneIn: 6000000, color: '#d7ff6c', effect: { kind: 'golden', value: 20 }, text: 'Golden rewards ×20' },
    { id: 'deadsignal', name: 'Dead Signal', symbol: 'DS', tier: 'Impossible', oneIn: 6300000, color: '#b7c0ca', effect: { kind: 'click', value: 45 }, text: 'Press power ×45' },
    { id: 'redshift', name: 'Redshift', symbol: 'RS', tier: 'Impossible', oneIn: 6600000, color: '#ff4d68', effect: { kind: 'global', value: 50 }, text: 'All output ×50' },

    { id: 'blueshift', name: 'Blueshift', symbol: 'BS', tier: 'Singularity', oneIn: 6900000, color: '#52c8ff', effect: { kind: 'charge', value: 15 }, text: 'Charge gain ×15' },
    { id: 'omniscient', name: 'Omniscient', symbol: 'OM', tier: 'Singularity', oneIn: 7200000, color: '#fff4bb', effect: { kind: 'global', value: 70 }, text: 'All output ×70' },
    { id: 'nevermore', name: 'Nevermore', symbol: 'NV', tier: 'Singularity', oneIn: 7500000, color: '#c388ff', effect: { kind: 'critMult', value: 75 }, text: 'Critical power +75×' },
    { id: 'absolutezero', name: 'Absolute Zero', symbol: 'AZ', tier: 'Singularity', oneIn: 8000000, color: '#81f5ff', effect: { kind: 'click', value: 100 }, text: 'Press power ×100' },
    { id: 'finality', name: 'Finality', symbol: 'FN', tier: 'Singularity', oneIn: 8500000, color: '#ffcf65', effect: { kind: 'global', value: 150 }, text: 'All output ×150' },
    { id: 'theunmade', name: 'The Unmade', symbol: 'TU', tier: 'Singularity', oneIn: 9000000, color: '#ff658f', effect: { kind: 'golden', value: 100 }, text: 'Golden rewards ×100' },
    { id: 'beyond', name: 'Beyond', symbol: 'BY', tier: 'Singularity', oneIn: 9500000, color: '#a6ffdc', effect: { kind: 'global', value: 333 }, text: 'All output ×333' },
    { id: 'aeternum', name: 'Aeternum', symbol: 'Æ', tier: 'Singularity', oneIn: 10000000, color: '#ffffff', effect: { kind: 'global', value: 1000 }, text: 'All output ×1,000 • Rarest known frequency' }
  ];

  const CORE_NODES = [
    { id: 'starter', name: 'Seed Voltage', symbol: 'I', max: 5, baseCost: 1, x: 1100, y: 1390, requires: {}, effects: [{ kind: 'startButtons', value: 100000 }], desc: 'Begin each cycle with 100K more buttons per level.' },
    { id: 'force', name: 'Operator Force', symbol: 'F', max: 10, baseCost: 10, x: 790, y: 1210, requires: { starter: 1 }, effects: [{ kind: 'clickMult', value: 1.18 }], desc: 'Permanent press power ×1.18 per level.' },
    { id: 'network', name: 'Network Memory', symbol: 'N', max: 10, baseCost: 10, x: 1410, y: 1210, requires: { starter: 1 }, effects: [{ kind: 'towerGlobal', value: 1.15 }], desc: 'Permanent tower output ×1.15 per level.' },

    { id: 'probability', name: 'Probability Weave', symbol: '%', max: 5, baseCost: 850, x: 430, y: 1010, requires: { force: 2 }, effects: [], desc: 'Critical chance +2.5% per level; one of the required routes to the 75% cap.' },
    { id: 'overdrive', name: 'Contact Overdrive', symbol: 'X', max: 5, baseCost: 600, x: 780, y: 950, requires: { force: 2 }, effects: [{ kind: 'critPower', value: 0.75 }], desc: 'Permanent critical power +0.75× per level.' },
    { id: 'fortune', name: 'Signal Fortune', symbol: 'G', max: 5, baseCost: 700, x: 1420, y: 950, requires: { network: 2 }, effects: [{ kind: 'goldenFrequency', value: 0.18 }, { kind: 'charge', value: 1.2 }], desc: 'Golden frequency +18% and scanner charge ×1.20 per level.' },
    { id: 'endurance', name: 'Temporal Battery', symbol: 'T', max: 5, baseCost: 600, x: 1770, y: 1010, requires: { network: 2 }, effects: [{ kind: 'offline', value: 0.08 }], desc: 'Offline output efficiency +8% per level.' },

    { id: 'impactVault', name: 'Impact Vault', symbol: 'IV', max: 3, baseCost: 25000, x: 160, y: 780, requires: { probability: 2 }, effects: [{ kind: 'clickMult', value: 1.75 }], desc: 'Archived impact profiles multiply press power by 1.75 per level.' },
    { id: 'pressureArchive', name: 'Pressure Archive', symbol: 'PA', max: 3, baseCost: 35000, x: 480, y: 720, requires: { probability: 3 }, effects: [{ kind: 'clickBase', value: 1000000 }], desc: 'Add 1 million permanent base press power per level.' },
    { id: 'comboMatrix', name: 'Combo Matrix', symbol: 'CM', max: 3, baseCost: 45000, x: 790, y: 690, requires: { overdrive: 2 }, effects: [{ kind: 'global', value: 1.4 }], desc: 'Retained rhythm multiplies all output by 1.40 per level.' },
    { id: 'precisionCrown', name: 'Precision Crown', symbol: 'PC', max: 3, baseCost: 75000, x: 1010, y: 790, requires: { overdrive: 3 }, effects: [{ kind: 'critPower', value: 2 }], desc: 'Permanent critical power +2× per level without bypassing the 75% chance cap.' },

    { id: 'capacitor', name: 'Infinite Capacitor', symbol: 'IC', max: 3, baseCost: 100000, x: 1260, y: 720, requires: { fortune: 2 }, effects: [{ kind: 'charge', value: 1.8 }], desc: 'Scanner charge generation ×1.80 per level.' },
    { id: 'entropyBattery', name: 'Entropy Battery', symbol: 'EB', max: 1, baseCost: 4000000000, x: 1380, y: 575, requires: { capacitor: 3 }, effects: [{ kind: 'rngAutoCharge', value: 0.5 }], desc: 'One-time installation: the Observatory automatically generates 0.5 scanner charge every second.' },
    { id: 'auraResonance', name: 'Aura Resonance', symbol: 'AR+', max: 3, baseCost: 80000000000, x: 1530, y: 330, requires: { entropyBattery: 1 }, effects: [{ kind: 'auraLuck', value: 1 }], desc: 'Raises every normal-scan Rare-or-better aura chance by 5%, then 10%, then 20% at level three.' },
    { id: 'goldenMemory', name: 'Golden Memory', symbol: 'GM', max: 3, baseCost: 140000, x: 1490, y: 680, requires: { fortune: 3 }, effects: [{ kind: 'goldenReward', value: 1.5 }], desc: 'Golden signal rewards ×1.50 per level.' },
    { id: 'offlineArchive', name: 'Offline Archive', symbol: 'OA', max: 3, baseCost: 120000, x: 1830, y: 780, requires: { endurance: 2 }, effects: [{ kind: 'offline', value: 0.12 }], desc: 'Offline recovery efficiency +12% per level.' },
    { id: 'towerSchema', name: 'Tower Schema', symbol: 'TS', max: 3, baseCost: 220000, x: 2030, y: 650, requires: { endurance: 3 }, effects: [{ kind: 'towerGlobal', value: 1.9 }], desc: 'Every tower family gains a permanent ×1.90 per level.' },

    { id: 'resonance', name: 'Total Resonance', symbol: 'TR', max: 5, baseCost: 5000000, x: 600, y: 480, requires: { impactVault: 2, pressureArchive: 2, comboMatrix: 2 }, effects: [{ kind: 'global', value: 1.8 }], desc: 'Synchronize the pressure branch for ×1.80 all output per level.' },
    { id: 'kineticEngine', name: 'Kinetic Engine', symbol: 'KE', max: 3, baseCost: 8000000, x: 920, y: 470, requires: { comboMatrix: 3, precisionCrown: 2 }, effects: [{ kind: 'clickMult', value: 3 }], desc: 'Convert permanent memory into ×3 press power per level.' },
    { id: 'auricReceiver', name: 'Auric Receiver', symbol: 'AR', max: 3, baseCost: 12000000, x: 1330, y: 470, requires: { capacitor: 2, goldenMemory: 2 }, effects: [{ kind: 'goldenFrequency', value: 0.4 }, { kind: 'goldenReward', value: 2 }], desc: 'Golden frequency +40% and reward output ×2 per level.' },
    { id: 'radiantEngine', name: 'Radiant Engine', symbol: 'RE', max: 3, baseCost: 18000000, x: 1600, y: 460, requires: { goldenMemory: 3, offlineArchive: 2 }, effects: [{ kind: 'goldenReward', value: 3 }], desc: 'Golden signal rewards ×3 per level.' },
    { id: 'automationCore', name: 'Automation Core', symbol: 'AC', max: 3, baseCost: 25000000, x: 1940, y: 430, requires: { towerSchema: 2, offlineArchive: 2 }, effects: [{ kind: 'towerGlobal', value: 3 }], desc: 'All tower production ×3 per level.' },

    { id: 'cycleArchive', name: 'Cycle Archive', symbol: 'CA', max: 3, baseCost: 900000000, x: 380, y: 250, requires: { resonance: 3 }, effects: [{ kind: 'startButtons', value: 100000000000 }], desc: 'Begin each cycle with 100 billion additional buttons per level.' },
    { id: 'signalCompiler', name: 'Signal Compiler', symbol: 'SC', max: 3, baseCost: 1300000000, x: 950, y: 300, requires: { resonance: 2, kineticEngine: 2 }, effects: [{ kind: 'global', value: 4 }], desc: 'Compile every permanent signal into ×4 all output per level.' },
    { id: 'crystalMemory', name: 'Crystal Memory', symbol: 'CR', max: 3, baseCost: 1900000000, x: 1280, y: 260, requires: { kineticEngine: 2, auricReceiver: 2 }, effects: [{ kind: 'charge', value: 3 }, { kind: 'global', value: 2 }], desc: 'Scanner charge ×3 and all output ×2 per level.' },
    { id: 'temporalVault', name: 'Temporal Vault', symbol: 'TV', max: 3, baseCost: 2500000000, x: 1700, y: 260, requires: { radiantEngine: 2, automationCore: 2 }, effects: [{ kind: 'offline', value: 0.15 }, { kind: 'global', value: 2.5 }], desc: 'Offline efficiency +15% and all output ×2.5 per level.' },

    { id: 'crystalDrill', name: 'Crystal Drill Memory', symbol: 'CD', max: 3, baseCost: 7000000, x: 1120, y: 590, requires: { capacitor: 2 }, effects: [{ kind: 'converterYield', value: 1.75 }], desc: 'Permanent Converter yield ×1.75 per level.' },
    { id: 'phaseRotor', name: 'Phase Rotor', symbol: 'PR', max: 3, baseCost: 1100000000, x: 1080, y: 420, requires: { crystalDrill: 2 }, effects: [{ kind: 'converterSpeed', value: 1.6 }], desc: 'Permanent mining speed ×1.60 per level.' },
    { id: 'prismaticCatalyst', name: 'Prismatic Catalyst', symbol: 'PC', max: 3, baseCost: 230000000000, x: 1120, y: 255, requires: { phaseRotor: 2 }, effects: [{ kind: 'converterEfficiency', value: 1.35 }], desc: 'Each spent crystal counts as 1.35 crystals per level.' },
    { id: 'realityKernel', name: 'Reality Kernel', symbol: 'RK', max: 3, baseCost: 400000000000, x: 900, y: 125, requires: { signalCompiler: 3, crystalMemory: 3 }, effects: [{ kind: 'global', value: 10 }], desc: 'Rewrite the next cycle around a permanent ×10 all output per level.' },
    { id: 'singularityCrown', name: 'Singularity Crown', symbol: 'SG', max: 3, baseCost: 700000000000, x: 790, y: 85, requires: { cycleArchive: 3, signalCompiler: 3 }, effects: [{ kind: 'critPower', value: 10 }, { kind: 'global', value: 5 }], desc: 'Critical power +10× and all output ×5 per level.' },
    { id: 'stellarLuck', name: 'Stellar Fortune', symbol: 'SF', max: 3, baseCost: 9000000000000, x: 1510, y: 105, requires: { crystalMemory: 3, temporalVault: 3 }, effects: [{ kind: 'goldenFrequency', value: 1 }, { kind: 'goldenReward', value: 10 }], desc: 'Double golden frequency and multiply golden rewards by 10 per level.' },
    { id: 'goldenConvergence', name: 'Golden Convergence', symbol: '1/N', max: 5, baseCost: 20000000000000, x: 1760, y: 105, requires: { stellarLuck: 3, radiantEngine: 3 }, effects: [], desc: 'Stabilize natural golden signals through 1/480, 1/438, 1/398, 1/364, then the absolute 1/333-per-second cap. Glitched odds never change.' },
    { id: 'coreAlchemy', name: 'Core Alchemy', symbol: 'CA', max: 1, baseCost: 450000000000000, x: 1260, y: 95, requires: { prismaticCatalyst: 3, crystalMemory: 3 }, effects: [], desc: 'Unlock crystal transmutation into Heavenly Cores inside the Converter.' },
    { id: 'musicPlayer', name: 'Heavenly Jukebox', symbol: 'JB', max: 1, baseCost: 8000000000000000, x: 2000, y: 100, requires: { temporalVault: 3, stellarLuck: 1 }, effects: [], desc: 'Late-cycle unlock: play every indexed music track and preview every sound in the Reactor.' }
  ];

  const achievement = (id, name, category, icon, desc, metric, target, reward) => ({
    id, name, category, icon, desc, metric, target, reward
  });

  const ACHIEVEMENTS = [
    achievement('press25', 'Contact', 'press', 'fa-hand-pointer', 'Press the reactor 25 times.', 'clicks', 25, { kind: 'crystals', value: 3 }),
    achievement('press500', 'Muscle Memory', 'press', 'fa-hand-fist', 'Press the reactor 500 times.', 'clicks', 500, { kind: 'crystals', value: 8 }),
    achievement('press10k', 'Operator', 'press', 'fa-gauge-high', 'Press the reactor 10,000 times.', 'clicks', 10000, { kind: 'global', value: 1.04 }),
    achievement('press1m', 'One in a Million', 'press', 'fa-bullseye', 'Press the reactor 1,000,000 times.', 'clicks', 1e6, { kind: 'crit', value: 0.01 }),
    achievement('press10m', 'Pressure Without End', 'press', 'fa-infinity', 'Press the reactor 10 million times.', 'clicks', 1e7, { kind: 'crystals', value: 500 }),
    achievement('crit100', 'Sharp Contact', 'press', 'fa-crosshairs', 'Land 100 critical presses.', 'crits', 100, { kind: 'crystals', value: 12 }),
    achievement('crit10k', 'Golden Reflex', 'press', 'fa-burst', 'Land 10,000 critical presses.', 'crits', 10000, { kind: 'global', value: 1.07 }),
    achievement('crit1m', 'Probability Engine', 'press', 'fa-dice-d20', 'Land 1 million critical presses.', 'crits', 1e6, { kind: 'crystals', value: 1000 }),

    achievement('earn1k', 'Four Figures', 'production', 'fa-coins', 'Produce 1,000 lifetime buttons.', 'buttons', 1000, { kind: 'crystals', value: 4 }),
    achievement('earn1m', 'Signal Millionaire', 'production', 'fa-sack-dollar', 'Produce 1 million lifetime buttons.', 'buttons', 1e6, { kind: 'seconds', value: 180 }),
    achievement('earn1b', 'Industrial Scale', 'production', 'fa-industry', 'Produce 1 billion lifetime buttons.', 'buttons', 1e9, { kind: 'crystals', value: 25 }),
    achievement('earn1t', 'Twelve Zeroes', 'production', 'fa-chart-line', 'Produce 1 trillion lifetime buttons.', 'buttons', 1e12, { kind: 'global', value: 1.1 }),
    achievement('earn1e18', 'Impossible Economy', 'production', 'fa-infinity', 'Produce 1 quintillion lifetime buttons.', 'buttons', 1e18, { kind: 'crit', value: 0.01 }),
    achievement('earn1e30', 'Stellar Economy', 'production', 'fa-star', 'Produce 1 nonillion lifetime buttons.', 'buttons', 1e30, { kind: 'crystals', value: 500 }),
    achievement('earn1e60', 'Transfinite Economy', 'production', 'fa-atom', 'Produce 1e60 lifetime buttons.', 'buttons', 1e60, { kind: 'global', value: 1.2 }),
    achievement('bps100', 'Motion Begins', 'production', 'fa-bolt', 'Reach 100 buttons per second.', 'bps', 100, { kind: 'crystals', value: 6 }),
    achievement('bps1m', 'Unbroken Stream', 'production', 'fa-wave-square', 'Reach 1 million buttons per second.', 'bps', 1e6, { kind: 'seconds', value: 600 }),
    achievement('bps1e18', 'Causal Torrent', 'production', 'fa-arrow-trend-up', 'Reach 1 quintillion buttons per second.', 'bps', 1e18, { kind: 'global', value: 1.15 }),

    achievement('tower1', 'Delegation', 'collection', 'fa-building', 'Purchase your first tower.', 'towers', 1, { kind: 'crystals', value: 4 }),
    achievement('tower100', 'Automation Floor', 'collection', 'fa-industry', 'Own 100 towers in total.', 'towers', 100, { kind: 'global', value: 1.04 }),
    achievement('tower100each', 'Balanced Skyline', 'collection', 'fa-city', 'Own at least 100 of every tower.', 'towerMin', 100, { kind: 'crit', value: 0.01 }),
    achievement('tower1000', 'Machine Metropolis', 'collection', 'fa-city', 'Own 1,000 towers in total.', 'towers', 1000, { kind: 'crystals', value: 250 }),
    achievement('upgrade5', 'Modified', 'collection', 'fa-microchip', 'Install 5 upgrades.', 'upgrades', 5, { kind: 'crystals', value: 6 }),
    achievement('upgrade25', 'Systems Engineer', 'collection', 'fa-gears', 'Install 25 upgrades.', 'upgrades', 25, { kind: 'global', value: 1.06 }),
    achievement('upgrade50', 'Modification Matrix', 'collection', 'fa-layer-group', 'Install 50 upgrades.', 'upgrades', 50, { kind: 'crystals', value: 50 }),
    achievement('upgrade100', 'Continuum Engineer', 'collection', 'fa-cubes', 'Install 100 upgrades.', 'upgrades', 100, { kind: 'global', value: 1.12 }),
    achievement('upgrade150', 'Beyond Standard', 'collection', 'fa-crown', 'Install 150 upgrades.', 'upgrades', 150, { kind: 'crystals', value: 500 }),
    achievement('upgradeAll', 'Perfect Architecture', 'collection', 'fa-sitemap', 'Install every standard and endgame upgrade.', 'upgrades', UPGRADES.length, { kind: 'global', value: 1.35 }),
    achievement('golden1', 'A Golden Signal', 'collection', 'fa-star', 'Catch one golden signal.', 'golden', 1, { kind: 'crystals', value: 8 }),
    achievement('golden25', 'Radiant Receiver', 'collection', 'fa-satellite-dish', 'Catch 25 golden signals.', 'golden', 25, { kind: 'crystals', value: 40 }),
    achievement('golden100', 'Auric Network', 'collection', 'fa-sun', 'Catch 100 golden signals.', 'golden', 100, { kind: 'global', value: 1.12 }),
    achievement('aura1', 'First Frequency', 'collection', 'fa-eye', 'Discover one aura.', 'auras', 1, { kind: 'crystals', value: 8 }),
    achievement('aura12', 'Spectrum Half', 'collection', 'fa-palette', 'Discover half of the aura archive.', 'auras', Math.ceil(AURAS.length / 2), { kind: 'global', value: 1.1 }),
    achievement('aura24', 'Full Spectrum', 'collection', 'fa-rainbow', 'Discover every aura.', 'auras', AURAS.length, { kind: 'crit', value: 0.01 }),

    achievement('arcade1', 'Lab Rat', 'arcade', 'fa-gamepad', 'Win one arcade trial.', 'arcade', 1, { kind: 'crystals', value: 6 }),
    achievement('arcade10', 'Multi-Discipline', 'arcade', 'fa-medal', 'Win 10 arcade trials.', 'arcade', 10, { kind: 'crystals', value: 30 }),
    achievement('arcade50', 'Perfect Timing', 'arcade', 'fa-trophy', 'Win 50 arcade trials.', 'arcade', 50, { kind: 'crit', value: 0.01 }),
    achievement('arcade100', 'Arcade Architect', 'arcade', 'fa-crown', 'Win 100 arcade trials.', 'arcade', 100, { kind: 'global', value: 1.1 }),
    achievement('arcadeHard10', 'No Safety Margin', 'arcade', 'fa-fire', 'Win 10 trials on Hard difficulty.', 'arcadeHard', 10, { kind: 'crystals', value: 150 }),
    achievement('arcadeInsane1', 'Silent Memory', 'arcade', 'fa-brain', 'Clear one Echo Array wave on Insane.', 'arcadeInsane', 1, { kind: 'global', value: 1.08 }),

    achievement('ascend1', 'Again, Differently', 'ascension', 'fa-rocket', 'Complete one ascension cycle.', 'ascensions', 1, { kind: 'crystals', value: 50 }),
    achievement('ascend3', 'Cycle Familiar', 'ascension', 'fa-rotate', 'Complete three ascension cycles.', 'ascensions', 3, { kind: 'crystals', value: 150 }),
    achievement('ascend10', 'Reboot Doctrine', 'ascension', 'fa-arrows-rotate', 'Complete 10 ascension cycles.', 'ascensions', 10, { kind: 'global', value: 1.15 }),
    achievement('ascend25', 'Eternal Operator', 'ascension', 'fa-infinity', 'Complete 25 ascension cycles.', 'ascensions', 25, { kind: 'crystals', value: 1000 }),
    achievement('core10', 'Heavenly Technician', 'ascension', 'fa-atom', 'Purchase 10 Heavenly upgrade levels.', 'coreLevels', 10, { kind: 'crystals', value: 100 }),
    achievement('core50', 'Constellation Engineer', 'ascension', 'fa-circle-nodes', 'Purchase 50 Heavenly upgrade levels.', 'coreLevels', 50, { kind: 'global', value: 1.25 }),

    achievement('secret1', 'Behind the Panel', 'secret', 'fa-key', 'Recover one restricted signal.', 'secrets', 1, { kind: 'crystals', value: 25 }),
    achievement('secret2', 'Restricted Clearance', 'secret', 'fa-user-secret', 'Recover two restricted signals.', 'secrets', 2, { kind: 'crystals', value: 75 }),
    achievement('secret4', 'The Reactor Knows', 'secret', 'fa-eye', 'Recover all restricted signals.', 'secrets', 4, { kind: 'global', value: 1.2 }),
    achievement('secretSevenfold', 'Sevenfold Knock', 'secret', 'fa-hand-pointer', 'Find the hidden contact inside the Reactor name.', 'secretSevenfold', 1, { kind: 'crystals', value: 40 }),
    achievement('secretUpup', 'Old Direction', 'secret', 'fa-keyboard', 'Enter the ancient directional sequence.', 'secretUpup', 1, { kind: 'crystals', value: 100 }),
    achievement('secretEcho', 'The Button Remembers', 'secret', 'fa-comment', 'Decode the phrase preserved by the archive.', 'secretEcho', 1, { kind: 'crystals', value: 150 }),
    achievement('secretHeartbeat', 'Nominal Heartbeat', 'secret', 'fa-heart-pulse', 'Wake the hidden pulse inside the system clock.', 'secretHeartbeat', 1, { kind: 'global', value: 1.08 }),
    achievement('error404', 'Unexpected error occurred. [Code 404]', 'secret', 'fa-triangle-exclamation', 'Capture an impossible corrupted golden signal.', 'glitches', 1, { kind: 'global', value: 41.4 })
  ];

  const SECRETS = [
    { id: 'sevenfold', name: 'Sevenfold Contact', clue: 'The name above is more responsive than it looks.' },
    { id: 'upup', name: 'Old Direction', clue: 'An ancient sequence still opens modern systems.' },
    { id: 'echo', name: 'The Memory Phrase', clue: 'The archive insists: THE BUTTON REMEMBERS.' },
    { id: 'heartbeat', name: 'System Heartbeat', clue: 'Even a nominal clock can be pressed nine times.' }
  ];

  const CRIT_ACHIEVEMENTS = ['press1m', 'earn1e18', 'tower100each', 'arcade50', 'aura24'];
  const TOWER_CRIT_THRESHOLDS = [100, 500, 1500, 5000, 15000, 50000];
  const RARITY_RANK = {
    Common: 0,
    Uncommon: 1,
    Rare: 2,
    Epic: 3,
    Legendary: 4,
    Mythic: 5,
    Transcendent: 6,
    Celestial: 7,
    Ethereal: 8,
    Abyssal: 9,
    Impossible: 10,
    Singularity: 11
  };
  const AURA_FONT_ICONS = Object.freeze([
    'fa-bolt', 'fa-leaf', 'fa-droplet', 'fa-fire', 'fa-sun', 'fa-water', 'fa-gem', 'fa-wind',
    'fa-eye', 'fa-meteor', 'fa-code', 'fa-moon', 'fa-star', 'fa-snowflake', 'fa-atom', 'fa-compass',
    'fa-crown', 'fa-clock', 'fa-infinity', 'fa-radiation', 'fa-satellite-dish', 'fa-ghost', 'fa-flask', 'fa-fingerprint',
    'fa-circle-nodes', 'fa-mountain', 'fa-tornado', 'fa-shield-halved', 'fa-microchip', 'fa-database', 'fa-cubes', 'fa-wave-square'
  ]);
  const TOWER_FONT_ICONS = Object.freeze({
    clickbot: 'fa-robot',
    workshop: 'fa-screwdriver-wrench',
    server: 'fa-server',
    lab: 'fa-flask',
    factory: 'fa-industry',
    temple: 'fa-landmark',
    portal: 'fa-door-open',
    aicore: 'fa-microchip',
    forge: 'fa-hammer',
    singularity: 'fa-circle-nodes',
    chrono: 'fa-clock',
    neutron: 'fa-atom',
    dimensional: 'fa-cubes',
    horizon: 'fa-circle-nodes',
    timeline: 'fa-wave-square',
    vacuum: 'fa-wind',
    reality: 'fa-code',
    multiverse: 'fa-globe',
    entropy: 'fa-arrows-rotate',
    causal: 'fa-diagram-project',
    omega: 'fa-gears',
    paradoxTower: 'fa-infinity',
    cosmic: 'fa-pen-nib',
    infinity: 'fa-industry',
    aeternumTower: 'fa-sun',
    you: 'fa-user-astronaut'
  });
  const CORE_FONT_ICONS = Object.freeze({
    starter: 'fa-power-off',
    force: 'fa-hand-fist',
    network: 'fa-network-wired',
    probability: 'fa-percent',
    overdrive: 'fa-bullseye',
    fortune: 'fa-star',
    endurance: 'fa-clock',
    impactVault: 'fa-vault',
    pressureArchive: 'fa-box-archive',
    comboMatrix: 'fa-table-cells',
    precisionCrown: 'fa-crown',
    capacitor: 'fa-battery-full',
    entropyBattery: 'fa-battery-half',
    auraResonance: 'fa-wand-magic-sparkles',
    goldenMemory: 'fa-coins',
    offlineArchive: 'fa-moon',
    towerSchema: 'fa-building',
    resonance: 'fa-wave-square',
    kineticEngine: 'fa-gears',
    auricReceiver: 'fa-satellite-dish',
    radiantEngine: 'fa-sun',
    automationCore: 'fa-robot',
    cycleArchive: 'fa-rotate',
    signalCompiler: 'fa-code',
    crystalMemory: 'fa-gem',
    temporalVault: 'fa-hourglass-half',
    crystalDrill: 'fa-screwdriver-wrench',
    phaseRotor: 'fa-fan',
    prismaticCatalyst: 'fa-flask-vial',
    realityKernel: 'fa-atom',
    singularityCrown: 'fa-crown',
    stellarLuck: 'fa-meteor',
    goldenConvergence: 'fa-crosshairs',
    coreAlchemy: 'fa-wand-magic-sparkles',
    musicPlayer: 'fa-compact-disc'
  });
  const SEQUENCE_DIFFICULTIES = Object.freeze({
    easy: { flashMs: 290, gapMs: 105, leadMs: 450, startLength: 1, rewardMultiplier: 1, randomTone: false, silent: false },
    medium: { flashMs: 170, gapMs: 75, leadMs: 360, startLength: 1, rewardMultiplier: 1.2, randomTone: false, silent: false },
    hard: { flashMs: 90, gapMs: 40, leadMs: 300, startLength: 3, rewardMultiplier: 1.5, randomTone: true, silent: false },
    insane: { flashMs: 45, gapMs: 20, leadMs: 240, startLength: 5, rewardMultiplier: 2, randomTone: false, silent: true }
  });
  const PULSE_DIFFICULTIES = Object.freeze({
    easy: { cycleMs: 2100, widthScale: 1, rewardMultiplier: 1 },
    hard: { cycleMs: 1050, widthScale: 1, rewardMultiplier: 2 },
    insane: { cycleMs: 700, widthScale: 0.5, rewardMultiplier: 3 }
  });
  const VECTOR_DIFFICULTIES = Object.freeze({
    easy: { goal: 8, durationMs: 10000, reward: 10 },
    medium: { goal: 12, durationMs: 8000, reward: 18 },
    hard: { goal: 16, durationMs: 6500, reward: 30 }
  });
  const CIPHER_DIFFICULTIES = Object.freeze({
    easy: { goal: 3, durationMs: 20000, maxValue: 12, penaltyMs: 800, reward: 12 },
    medium: { goal: 5, durationMs: 14000, maxValue: 20, penaltyMs: 1200, reward: 22 },
    hard: { goal: 7, durationMs: 10000, maxValue: 32, penaltyMs: 1700, reward: 35 }
  });
  const STABILITY_DIFFICULTIES = Object.freeze({
    easy: { cycleMs: 2000, width: 18, rewardPerLock: 4 },
    medium: { cycleMs: 1300, width: 12, rewardPerLock: 6 },
    hard: { cycleMs: 850, width: 8, rewardPerLock: 9 }
  });
  const ARCADE_DIFFICULTY_TABLES = Object.freeze({
    sequence: SEQUENCE_DIFFICULTIES,
    pulse: PULSE_DIFFICULTIES,
    vector: VECTOR_DIFFICULTIES,
    cipher: CIPHER_DIFFICULTIES,
    stability: STABILITY_DIFFICULTIES
  });
  const FIXED_AURA_CHANCE_TOTAL = AURAS.reduce((sum, aura) => sum + (aura.oneIn ? 1 / aura.oneIn : 0), 0);
  const WEIGHTED_AURA_TOTAL = AURAS.reduce((sum, aura) => sum + (aura.oneIn ? 0 : aura.weight), 0);
  const BASE_AURA_PROBABILITIES = Object.freeze(Object.fromEntries(AURAS.map(aura => [
    aura.id,
    aura.oneIn
      ? 1 / aura.oneIn
      : (1 - FIXED_AURA_CHANCE_TOTAL) * aura.weight / WEIGHTED_AURA_TOTAL
  ])));
  const BASE_RARE_AURA_PROBABILITY = AURAS.reduce(
    (sum, aura) => sum + (RARITY_RANK[aura.tier] >= RARITY_RANK.Rare ? BASE_AURA_PROBABILITIES[aura.id] : 0),
    0
  );
  const NAV_ITEMS = [
    { id: 'core', icon: 'fa-hand-pointer', title: 'Reactor', sub: 'Manual input and telemetry', key: '1' },
    { id: 'upgrades', icon: 'fa-microchip', title: 'Upgrades', sub: 'System modifications', key: '2' },
    { id: 'towers', icon: 'fa-industry', title: 'Towers', sub: 'Automation network', key: '3' },
    { id: 'arcade', icon: 'fa-gamepad', title: 'Arcade', sub: 'Skill trials', key: '4' },
    { id: 'achievements', icon: 'fa-trophy', title: 'Achievements', sub: 'Progress and rewards', key: '5' },
    { id: 'observatory', icon: 'fa-dice-d20', title: 'RNG Observatory', sub: 'Aura scanner', key: '6' },
    { id: 'ascension', icon: 'fa-rocket', title: 'Ascension', sub: 'Permanent cycles', key: '7' },
    { id: 'converter', icon: 'fa-arrows-rotate', title: 'Converter', sub: 'Crystal mining and transmutation', key: '8' },
    { id: 'system', icon: 'fa-gear', title: 'System', sub: 'Settings and data', key: 'S' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(finite(value, fallback)));
  const has = (array, value) => Array.isArray(array) && array.includes(value);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const fontAwesomeIcon = (icon, extraClass = '') => `<i class="fa-solid ${icon} ${extraClass}" aria-hidden="true"></i>`;

  function auraIconName(aura) {
    const index = AURAS.findIndex(item => item.id === aura.id);
    return AURA_FONT_ICONS[(index < 0 ? 0 : index) % AURA_FONT_ICONS.length];
  }

  function upgradeIconName(item) {
    const byEffect = {
      clickFlat: 'fa-hand-pointer',
      clickMult: 'fa-hand-fist',
      clickBase: 'fa-hand-pointer',
      global: 'fa-globe',
      tower: 'fa-building',
      towerGlobal: 'fa-city',
      discount: 'fa-tags',
      offline: 'fa-moon',
      goldenFrequency: 'fa-satellite-dish',
      goldenReward: 'fa-coins',
      charge: 'fa-bolt',
      crit: 'fa-crosshairs',
      calibration: 'fa-gauge-high',
      critPower: 'fa-bullseye'
    };
    return byEffect[item.effect?.kind] || 'fa-microchip';
  }

  function createFreshState() {
    const towers = {};
    for (const tower of TOWERS) towers[tower.id] = 0;
    const nodes = {};
    for (const node of CORE_NODES) nodes[node.id] = 0;
    return {
      version: VERSION,
      resources: { buttons: 0, crystals: 0, cores: 0 },
      totals: {
        buttons: 0,
        runButtons: 0,
        clicks: 0,
        crits: 0,
        golden: 0,
        glitches: 0,
        towersPurchased: 0,
        playSeconds: 0,
        arcadeWins: 0,
        achievementCrystals: 0,
        ascensions: 0,
        converterJobs: 0,
        convertedCrystals: 0,
        bestBps: 0
      },
      towers,
      upgrades: [],
      achievements: { claimed: [] },
      rng: {
        charge: 0,
        scans: 0,
        pity: 0,
        discovered: {},
        equipped: null,
        recent: []
      },
      minigames: {
        reactionBest: null,
        sequenceBest: 0,
        pulseBest: null,
        sequenceBestByDifficulty: {},
        pulseBestByDifficulty: {},
        vectorBest: {},
        cipherBest: {},
        stabilityBest: {},
        difficulties: { sequence: 'easy', pulse: 'easy', vector: 'easy', cipher: 'easy', stability: 'easy' },
        difficultyWins: {},
        pulseDifficultySchema: 2,
        arcadeCrystalRemainder: 0,
        streak: 0
      },
      golden: {
        nextAt: Date.now() + 1000,
        activeUntil: 0
      },
      converter: { target: 'buttons', input: 1, upgrades: [], active: null },
      jukebox: { goldenSpawnSound: 'default', unlockedGoldenSpawnSounds: ['default'] },
      buffs: [],
      secrets: { found: [], brandClicks: 0, clockClicks: 0 },
      ascension: { nodes, spentCores: 0, inLimbo: false },
      settings: { sound: 0.55, music: 0.35, motion: 'full', numberFormat: 'suffix', fastNotes: false },
      meta: { createdAt: Date.now(), lastSave: Date.now(), migratedFrom: null, glitchRewardSeen: false },
      ui: { page: 'core', buyMode: '1' }
    };
  }

  function mergeV2State(raw) {
    const fresh = createFreshState();
    const merged = {
      ...fresh,
      ...raw,
      resources: { ...fresh.resources, ...(raw.resources || {}) },
      totals: { ...fresh.totals, ...(raw.totals || {}) },
      towers: { ...fresh.towers, ...(raw.towers || {}) },
      achievements: { ...fresh.achievements, ...(raw.achievements || {}) },
      rng: { ...fresh.rng, ...(raw.rng || {}) },
      minigames: { ...fresh.minigames, ...(raw.minigames || {}) },
      golden: { ...fresh.golden, ...(raw.golden || {}) },
      converter: { ...fresh.converter, ...(raw.converter || {}) },
      jukebox: { ...fresh.jukebox, ...(raw.jukebox || {}) },
      secrets: { ...fresh.secrets, ...(raw.secrets || {}) },
      ascension: {
        ...fresh.ascension,
        ...(raw.ascension || {}),
        nodes: { ...fresh.ascension.nodes, ...(raw.ascension?.nodes || {}) }
      },
      settings: { ...fresh.settings, ...(raw.settings || {}) },
      meta: { ...fresh.meta, ...(raw.meta || {}) },
      ui: { ...fresh.ui, ...(raw.ui || {}) }
    };
    merged.version = VERSION;
    merged.resources.buttons = Math.max(0, finite(merged.resources.buttons));
    merged.resources.crystals = Math.max(0, finite(merged.resources.crystals));
    merged.resources.cores = safeInt(merged.resources.cores);
    for (const key of Object.keys(merged.totals)) merged.totals[key] = Math.max(0, finite(merged.totals[key]));
    for (const tower of TOWERS) merged.towers[tower.id] = safeInt(merged.towers[tower.id]);
    merged.upgrades = [...new Set(Array.isArray(merged.upgrades) ? merged.upgrades : [])].filter(id => UPGRADES.some(up => up.id === id));
    merged.achievements.claimed = [...new Set(Array.isArray(merged.achievements.claimed) ? merged.achievements.claimed : [])].filter(id => ACHIEVEMENTS.some(item => item.id === id));
    merged.secrets.found = [...new Set(Array.isArray(merged.secrets.found) ? merged.secrets.found : [])].filter(id => SECRETS.some(item => item.id === id));
    merged.buffs = Array.isArray(merged.buffs) ? merged.buffs.filter(buff => finite(buff.until) > Date.now()) : [];
    merged.rng.charge = clamp(finite(merged.rng.charge), 0, 100);
    merged.rng.scans = safeInt(merged.rng.scans);
    merged.rng.pity = safeInt(merged.rng.pity);
    merged.rng.discovered = merged.rng.discovered && typeof merged.rng.discovered === 'object' ? merged.rng.discovered : {};
    merged.rng.recent = Array.isArray(merged.rng.recent) ? merged.rng.recent.slice(-12) : [];
    if (!AURAS.some(aura => aura.id === merged.rng.equipped) || !merged.rng.discovered[merged.rng.equipped]) merged.rng.equipped = null;
    merged.minigames.difficulties = { ...fresh.minigames.difficulties, ...(raw.minigames?.difficulties || {}) };
    for (const [game, table] of Object.entries(ARCADE_DIFFICULTY_TABLES)) {
      if (!Object.hasOwn(table, merged.minigames.difficulties[game])) merged.minigames.difficulties[game] = 'easy';
    }
    for (const key of ['sequenceBestByDifficulty', 'pulseBestByDifficulty', 'vectorBest', 'cipherBest', 'stabilityBest', 'difficultyWins']) {
      merged.minigames[key] = merged.minigames[key] && typeof merged.minigames[key] === 'object' ? merged.minigames[key] : {};
    }
    if (safeInt(raw.minigames?.pulseDifficultySchema) < 2) {
      const previousDifficulty = raw.minigames?.difficulties?.pulse;
      if (previousDifficulty === 'medium') merged.minigames.difficulties.pulse = 'hard';
      if (previousDifficulty === 'hard') merged.minigames.difficulties.pulse = 'insane';
      const previousBests = raw.minigames?.pulseBestByDifficulty || {};
      delete merged.minigames.pulseBestByDifficulty.medium;
      delete merged.minigames.pulseBestByDifficulty.hard;
      if (previousBests.medium != null) merged.minigames.pulseBestByDifficulty.hard = previousBests.medium;
      if (previousBests.hard != null) merged.minigames.pulseBestByDifficulty.insane = previousBests.hard;
      const previousHardWins = safeInt(raw.minigames?.difficultyWins?.['pulse:hard']);
      const previousMediumWins = safeInt(raw.minigames?.difficultyWins?.['pulse:medium']);
      delete merged.minigames.difficultyWins['pulse:hard'];
      delete merged.minigames.difficultyWins['pulse:medium'];
      if (previousMediumWins) merged.minigames.difficultyWins['pulse:hard'] = previousMediumWins;
      if (previousHardWins) merged.minigames.difficultyWins['pulse:insane'] = previousHardWins;
    }
    merged.minigames.pulseDifficultySchema = 2;
    merged.minigames.arcadeCrystalRemainder = clamp(finite(merged.minigames.arcadeCrystalRemainder), 0, 0.999999);
    for (const key of Object.keys(merged.minigames.difficultyWins)) merged.minigames.difficultyWins[key] = safeInt(merged.minigames.difficultyWins[key]);
    merged.converter.target = CONVERTER_RECIPES.some(recipe => recipe.id === merged.converter.target) ? merged.converter.target : 'buttons';
    merged.converter.input = clamp(safeInt(merged.converter.input, 1), 1, 1e9);
    merged.converter.upgrades = [...new Set(Array.isArray(merged.converter.upgrades) ? merged.converter.upgrades : [])].filter(id => CONVERTER_UPGRADES.some(upgrade => upgrade.id === id));
    if (merged.converter.active && typeof merged.converter.active === 'object' && CONVERTER_RECIPES.some(recipe => recipe.id === merged.converter.active.target)) {
      merged.converter.active = {
        target: merged.converter.active.target,
        input: clamp(safeInt(merged.converter.active.input, 1), 1, 1e9),
        output: Math.max(0, finite(merged.converter.active.output)),
        startedAt: finite(merged.converter.active.startedAt, Date.now()),
        endsAt: finite(merged.converter.active.endsAt, Date.now())
      };
    } else {
      merged.converter.active = null;
    }
    merged.jukebox.unlockedGoldenSpawnSounds = [...new Set(Array.isArray(merged.jukebox.unlockedGoldenSpawnSounds) ? merged.jukebox.unlockedGoldenSpawnSounds : ['default'])]
      .filter(id => GOLDEN_SPAWN_SOUNDS.some(sound => sound.id === id));
    if (!merged.jukebox.unlockedGoldenSpawnSounds.includes('default')) merged.jukebox.unlockedGoldenSpawnSounds.unshift('default');
    if (!merged.jukebox.unlockedGoldenSpawnSounds.includes(merged.jukebox.goldenSpawnSound)) merged.jukebox.goldenSpawnSound = 'default';
    for (const node of CORE_NODES) merged.ascension.nodes[node.id] = clamp(safeInt(merged.ascension.nodes[node.id]), 0, node.max);
    merged.ascension.inLimbo = Boolean(merged.ascension.inLimbo);
    merged.settings.fastNotes = Boolean(merged.settings.fastNotes);
    merged.meta.glitchRewardSeen = raw.meta?.glitchRewardSeen == null
      ? merged.totals.glitches > 0 || merged.achievements.claimed.includes('error404')
      : Boolean(merged.meta.glitchRewardSeen);
    merged.golden.nextAt = Date.now() + 1000;
    merged.golden.activeUntil = 0;
    if (!NAV_ITEMS.some(item => item.id === merged.ui.page)) merged.ui.page = 'core';
    if (!['1', '10', '25', 'max'].includes(String(merged.ui.buyMode))) merged.ui.buyMode = '1';
    return merged;
  }

  function migrateLegacy(old, legacyKey) {
    const migrated = createFreshState();
    migrated.resources.buttons = Math.max(0, finite(old.mana));
    migrated.resources.crystals = safeInt(old.crystals);
    migrated.totals.buttons = Math.max(
      migrated.resources.buttons,
      finite(old.lifetimeManaEarned),
      finite(old.totalManaEarned)
    );
    migrated.totals.runButtons = Math.max(migrated.resources.buttons, finite(old.totalManaEarned));
    migrated.totals.clicks = safeInt(old.lifetimeClicks || old.totalClicks);
    migrated.totals.crits = safeInt(old.criticalClicks);
    migrated.totals.golden = safeInt(old.secrets?.cometCount);
    migrated.totals.ascensions = safeInt(old.prestige?.ascensions);
    migrated.totals.playSeconds = Math.max(0, finite(old.playTime));

    for (const tower of TOWERS) {
      migrated.towers[tower.id] = safeInt(old.towers?.[tower.id]?.count ?? old.towers?.[tower.id]);
    }
    migrated.totals.towersPurchased = Object.values(migrated.towers).reduce((sum, count) => sum + count, 0);

    const oldUpgrades = Array.isArray(old.upgradesPurchased) ? old.upgradesPurchased : [];
    migrated.upgrades = oldUpgrades.filter(id => UPGRADES.some(up => up.id === id));
    const oldCrit = clamp(finite(old.critChance, 0.02), 0.02, CRIT_CAP);
    let representedCrit = migrated.upgrades
      .map(id => UPGRADES.find(up => up.id === id))
      .filter(up => up?.effect.kind === 'crit' || up?.effect.kind === 'calibration')
      .reduce((sum, up) => sum + up.effect.value, 0);
    for (const up of UPGRADES.filter(item => item.effect.kind === 'crit' || item.effect.kind === 'calibration')) {
      if (representedCrit + 0.02 >= oldCrit - 0.0001) break;
      if (!migrated.upgrades.includes(up.id)) {
        migrated.upgrades.push(up.id);
        representedCrit += up.effect.value;
      }
    }

    const oldResearchCrit = safeInt(old.research?.critStudy);
    const probabilityFromResearch = clamp(Math.floor(oldResearchCrit / 4), 0, 5);
    migrated.ascension.nodes.probability = probabilityFromResearch;
    const heavenlyTotal = safeInt(old.prestige?.heavenly?.total);
    const heavenlySpent = safeInt(old.prestige?.heavenly?.spent);
    migrated.resources.cores = Math.max(0, heavenlyTotal - heavenlySpent);
    migrated.ascension.spentCores = heavenlySpent;

    if (old.secrets?.konami) migrated.secrets.found.push('upup');
    if (old.secrets?.ultraKonami) migrated.secrets.found.push('sevenfold');
    if (old.secrets?.secretShopUnlocked) migrated.secrets.found.push('echo');
    if (old.secrets?.titleClicks >= 9) migrated.secrets.found.push('heartbeat');
    migrated.secrets.found = [...new Set(migrated.secrets.found)];

    const oldRng = old.rng || {};
    migrated.rng.scans = safeInt(oldRng.rolls);
    for (const aura of AURAS) {
      if (oldRng.unlocked?.[aura.id]) migrated.rng.discovered[aura.id] = safeInt(oldRng.unlocked[aura.id], 1) || 1;
    }
    if (migrated.rng.discovered[oldRng.equipped]) migrated.rng.equipped = oldRng.equipped;

    migrated.settings.sound = clamp(finite(old.settings?.soundVol, 0.55), 0, 1);
    migrated.settings.music = clamp(finite(old.settings?.musicVol, 0.35), 0, 1);
    migrated.settings.motion = old.settings?.animations === 'off' ? 'off' : old.settings?.animations === 'reduced' ? 'reduced' : 'full';
    migrated.meta.migratedFrom = legacyKey;
    migrated.meta.createdAt = finite(old.createdAt, Date.now());
    migrated.meta.lastSave = Date.now();
    return mergeV2State(migrated);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return { state: mergeV2State(JSON.parse(raw)), loaded: true, migrated: false };
    } catch (error) {
      console.warn('Primary save could not be loaded.', error);
      try {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) return { state: mergeV2State(JSON.parse(backup)), loaded: true, migrated: false, backup: true };
      } catch (_) {}
    }
    for (const key of LEGACY_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return { state: migrateLegacy(JSON.parse(raw), key), loaded: true, migrated: true };
      } catch (_) {}
    }
    return { state: createFreshState(), loaded: false, migrated: false };
  }

  let loadResult = loadState();
  let state = loadResult.state;
  let modsDirty = true;
  let mods = null;
  let currentBps = 0;
  let currentClickPower = 1;
  let currentCritChance = 0.02;
  let combo = 0;
  let lastManualPress = 0;
  let lastUiUpdate = 0;
  let lastHeavyUpdate = 0;
  let lastChartSample = 0;
  let lastSaveAt = performance.now();
  let lastWallTime = Date.now();
  let buyMode = String(state.ui.buyMode || '1');
  let upgradeCategory = 'all';
  let achievementCategory = 'all';
  let upgradeRefs = {};
  let achievementRefs = {};
  let auraRefs = {};
  let towerRefs = {};
  let converterRecipeRefs = {};
  let converterUpgradeRefs = {};
  let goldenSoundRefs = {};
  let chartSamples = Array(60).fill(0);
  const goldenElements = new Set();
  let savePending = false;
  let brandClickWindow = 0;
  let clockClickWindow = 0;
  let konamiBuffer = [];

  const runtime = {
    reaction: { mode: 'idle', timer: null, goAt: 0 },
    sequence: { active: false, pattern: [], input: [], accepting: false, token: 0, difficulty: 'easy' },
    pulse: { active: false, startedAt: 0, target: 65, width: 14, attempts: 0, locks: 0, bestError: 1, difficulty: 'easy' },
    vector: { active: false, hits: 0, target: -1, startedAt: 0, endsAt: 0, difficulty: 'easy' },
    cipher: { active: false, values: [], selection: [], target: 0, round: 0, startedAt: 0, endsAt: 0, difficulty: 'easy', token: 0 },
    stability: { active: false, holding: false, holdStartedAt: 0, target: 62, width: 18, attempts: 0, locks: 0, bestError: 1, difficulty: 'easy' },
    rng: { scanning: false },
    ascension: { playing: false, pendingGain: 0 },
    tree: { x: 0, y: 0, scale: 1, initialized: false, dragging: false, pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 },
    glitch: { active: false, burst: false, fading: false, burstUntil: 0, nextBurstAt: 0, expiryTimer: null },
    goldenRush: { active: false, nextSpawnAt: 0 },
    jukebox: { tab: 'music' }
  };

  const ui = {
    app: $('#app'),
    workspace: $('#workspace'),
    loader: $('#loader'),
    loaderFill: $('#loaderFill'),
    loaderTip: $('#loaderTip'),
    buttons: $('#buttons'),
    bps: $('#bps'),
    crystals: $('#crystals'),
    cores: $('#cores'),
    buttonsDelta: $('#buttonsDelta'),
    mainButton: $('#mainButton'),
    reactorStage: $('#reactorStage'),
    floatLayer: $('#floatLayer'),
    pressValue: $('#pressValue'),
    clickPower: $('#clickPower'),
    clickBreakdown: $('#clickBreakdown'),
    comboValue: $('#comboValue'),
    comboFill: $('#comboFill'),
    critChance: $('#critChance'),
    critFill: $('#critFill'),
    critNextMarker: $('#critNextMarker'),
    critMethods: $('#critMethods'),
    activeBuffs: $('#activeBuffs'),
    productionChart: $('#productionChart'),
    chartRate: $('#chartRate'),
    chartTrend: $('#chartTrend'),
    bestRate: $('#bestRate'),
    objectiveTitle: $('#objectiveTitle'),
    objectiveText: $('#objectiveText'),
    objectiveReward: $('#objectiveReward'),
    objectiveFill: $('#objectiveFill'),
    objectiveCount: $('#objectiveCount'),
    totalClicks: $('#totalClicks'),
    criticalClicks: $('#criticalClicks'),
    totalButtons: $('#totalButtons'),
    towerCount: $('#towerCount'),
    towerShare: $('#towerShare'),
    goldenCount: $('#goldenCount'),
    goldenEta: $('#goldenEta'),
    upgradeProgress: $('#upgradeProgress'),
    upgradeProgressFill: $('#upgradeProgressFill'),
    upgradeSearch: $('#upgradeSearch'),
    upgradeStatus: $('#upgradeStatus'),
    upgradeSummary: $('#upgradeSummary'),
    upgradesGrid: $('#upgradesGrid'),
    upgradesEmpty: $('#upgradesEmpty'),
    upgradeNavBadge: $('#upgradeNavBadge'),
    towerNavBadge: $('#towerNavBadge'),
    towersList: $('#towersList'),
    networkOutput: $('#networkOutput'),
    efficiencyLeader: $('#efficiencyLeader'),
    efficiencyLeaderSub: $('#efficiencyLeaderSub'),
    nextMastery: $('#nextMastery'),
    arcadeWins: $('#arcadeWins'),
    arcadeStreak: $('#arcadeStreak'),
    reactionPad: $('#reactionPad'),
    reactionStatus: $('#reactionStatus'),
    reactionHint: $('#reactionHint'),
    reactionBest: $('#reactionBest'),
    reactionRecord: $('#reactionRecord'),
    sequenceStart: $('#sequenceStart'),
    sequenceBoard: $('#sequenceBoard'),
    sequenceStatus: $('#sequenceStatus'),
    sequenceWave: $('#sequenceWave'),
    sequenceBest: $('#sequenceBest'),
    sequenceReward: $('#sequenceReward'),
    pulseButton: $('#pulseButton'),
    pulseMarker: $('#pulseMarker'),
    pulseTarget: $('#pulseTarget'),
    pulseStatus: $('#pulseStatus'),
    pulseLocks: $('#pulseLocks'),
    pulseBest: $('#pulseBest'),
    pulseReward: $('#pulseReward'),
    vectorStart: $('#vectorStart'),
    vectorBoard: $('#vectorBoard'),
    vectorStatus: $('#vectorStatus'),
    vectorHits: $('#vectorHits'),
    vectorBest: $('#vectorBest'),
    vectorReward: $('#vectorReward'),
    cipherStart: $('#cipherStart'),
    cipherBoard: $('#cipherBoard'),
    cipherTarget: $('#cipherTarget'),
    cipherStatus: $('#cipherStatus'),
    cipherRound: $('#cipherRound'),
    cipherBest: $('#cipherBest'),
    cipherReward: $('#cipherReward'),
    stabilityPad: $('#stabilityPad'),
    stabilityTarget: $('#stabilityTarget'),
    stabilityFill: $('#stabilityFill'),
    stabilityStatus: $('#stabilityStatus'),
    stabilityLocks: $('#stabilityLocks'),
    stabilityBest: $('#stabilityBest'),
    stabilityReward: $('#stabilityReward'),
    achievementPercent: $('#achievementPercent'),
    achievementUnlocked: $('#achievementUnlocked'),
    achievementClaimable: $('#achievementClaimable'),
    achievementRewards: $('#achievementRewards'),
    achievementNavBadge: $('#achievementNavBadge'),
    achievementsGrid: $('#achievementsGrid'),
    claimAllButton: $('#claimAllButton'),
    auraProgress: $('#auraProgress'),
    auraProgressFill: $('#auraProgressFill'),
    scannerAura: $('#scannerAura'),
    rngChargeText: $('#rngChargeText'),
    rngChargeFill: $('#rngChargeFill'),
    rollAuraButton: $('#rollAuraButton'),
    pityText: $('#pityText'),
    equippedAura: $('#equippedAura'),
    luckGrade: $('#luckGrade'),
    luckBars: $('#luckBars'),
    luckAnalysis: $('#luckAnalysis'),
    auraCollection: $('#auraCollection'),
    auraSearch: $('#auraSearch'),
    auraOddsMode: $('#auraOddsMode'),
    auraScreenFx: $('#auraScreenFx'),
    ascensionCount: $('#ascensionCount'),
    ascensionGain: $('#ascensionGain'),
    ascensionRequirement: $('#ascensionRequirement'),
    ascendButton: $('#ascendButton'),
    beginCycleButton: $('#beginCycleButton'),
    cycleStateHint: $('#cycleStateHint'),
    availableCores: $('#availableCores'),
    availableCoresFocus: $('#availableCoresFocus'),
    ascensionFocusBar: $('#ascensionFocusBar'),
    ascensionOverview: $('#ascensionOverview'),
    ascensionTreePanel: $('#ascensionTreePanel'),
    ascensionActiveNodes: $('#ascensionActiveNodes'),
    ascensionCoreLevels: $('#ascensionCoreLevels'),
    ascensionSpentCores: $('#ascensionSpentCores'),
    ascensionStartReserve: $('#ascensionStartReserve'),
    ascensionOutputMemory: $('#ascensionOutputMemory'),
    ascensionTowerMemory: $('#ascensionTowerMemory'),
    ascensionRngMemory: $('#ascensionRngMemory'),
    constellationViewport: $('#constellationViewport'),
    coreTree: $('#coreTree'),
    treeZoomOut: $('#treeZoomOut'),
    treeReset: $('#treeReset'),
    treeZoomIn: $('#treeZoomIn'),
    converterJobs: $('#converterJobs'),
    converterSpent: $('#converterSpent'),
    converterCrystalBalance: $('#converterCrystalBalance'),
    converterYield: $('#converterYield'),
    converterSpeed: $('#converterSpeed'),
    converterEfficiency: $('#converterEfficiency'),
    converterRecipeList: $('#converterRecipeList'),
    converterInput: $('#converterInput'),
    converterStartButton: $('#converterStartButton'),
    converterStatus: $('#converterStatus'),
    converterProgressFill: $('#converterProgressFill'),
    converterProgressText: $('#converterProgressText'),
    converterActiveTarget: $('#converterActiveTarget'),
    converterActiveOutput: $('#converterActiveOutput'),
    converterCancelButton: $('#converterCancelButton'),
    converterUpgradeList: $('#converterUpgradeList'),
    eventLog: $('#eventLog'),
    systemClock: $('#systemClock'),
    goldenLayer: $('#goldenLayer'),
    toastStack: $('#toastStack'),
    soundButton: $('#soundButton'),
    soundIcon: $('#soundIcon'),
    musicPlayerButton: $('#musicPlayerButton'),
    soundVolume: $('#soundVolume'),
    soundVolumeOutput: $('#soundVolumeOutput'),
    musicVolume: $('#musicVolume'),
    musicVolumeOutput: $('#musicVolumeOutput'),
    motionSetting: $('#motionSetting'),
    numberFormat: $('#numberFormat'),
    fastNotesSetting: $('#fastNotesSetting'),
    saveStatus: $('#saveStatus'),
    saveData: $('#saveData'),
    statsList: $('#statsList'),
    secretCount: $('#secretCount'),
    secretList: $('#secretList'),
    secretForm: $('#secretForm'),
    secretInput: $('#secretInput'),
    critDialog: $('#critDialog'),
    critDialogValue: $('#critDialogValue'),
    critDialogFill: $('#critDialogFill'),
    critSources: $('#critSources'),
    rewardDialog: $('#rewardDialog'),
    rewardTitle: $('#rewardTitle'),
    rewardAmount: $('#rewardAmount'),
    rewardDescription: $('#rewardDescription'),
    commandDialog: $('#commandDialog'),
    commandSearch: $('#commandSearch'),
    commandResults: $('#commandResults'),
    musicPlayerDialog: $('#musicPlayerDialog'),
    musicTrackTitle: $('#musicTrackTitle'),
    musicTrackIndex: $('#musicTrackIndex'),
    musicLibraryCount: $('#musicLibraryCount'),
    musicPrevButton: $('#musicPrevButton'),
    musicPlayButton: $('#musicPlayButton'),
    musicNextButton: $('#musicNextButton'),
    musicSeek: $('#musicSeek'),
    musicTime: $('#musicTime'),
    musicTrackList: $('#musicTrackList'),
    jukeboxMusicPanel: $('#jukeboxMusicPanel'),
    jukeboxSoundPanel: $('#jukeboxSoundPanel'),
    jukeboxSoundList: $('#jukeboxSoundList'),
    goldenSignalSoundShop: $('#goldenSignalSoundShop'),
    ascensionConfirmDialog: $('#ascensionConfirmDialog'),
    ascensionConfirmGain: $('#ascensionConfirmGain'),
    confirmAscendButton: $('#confirmAscendButton'),
    ascensionCutscene: $('#ascensionCutscene'),
    cutsceneStatus: $('#cutsceneStatus'),
    rebootStatus: $('#rebootStatus')
  };

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function formatNumber(value, digits = 2) {
    const number = finite(value);
    if (number === 0) return '0';
    if (state.settings.numberFormat === 'scientific' && Math.abs(number) >= 1000) return number.toExponential(digits);
    if (Math.abs(number) < 1000) {
      if (Math.abs(number) >= 100) return Math.floor(number).toLocaleString('en-US');
      if (Math.abs(number) >= 10) return number.toFixed(number % 1 ? 1 : 0);
      return number.toFixed(number % 1 ? digits : 0);
    }
    const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'];
    const index = Math.floor(Math.log10(Math.abs(number)) / 3) - 1;
    if (index < units.length) {
      const scaled = number / Math.pow(1000, index + 1);
      const precision = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
      return `${scaled.toFixed(precision)}${units[index]}`;
    }
    return number.toExponential(digits);
  }

  function formatDuration(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    if (safe < 60) return `${safe}s`;
    if (safe < 3600) return `${Math.floor(safe / 60)}m ${safe % 60}s`;
    if (safe < 86400) return `${Math.floor(safe / 3600)}h ${Math.floor((safe % 3600) / 60)}m`;
    return `${Math.floor(safe / 86400)}d ${Math.floor((safe % 86400) / 3600)}h`;
  }

  function rewardLabel(reward) {
    if (reward.kind === 'crystals') return `+${reward.value} ◆`;
    if (reward.kind === 'seconds') return `${reward.value}s output`;
    if (reward.kind === 'global') return `Permanent +${Math.round((reward.value - 1) * 100)}%`;
    if (reward.kind === 'crit') return `Critical +${(reward.value * 100).toFixed(0)}%`;
    return 'Reward';
  }

  function totalTowers() {
    return TOWERS.reduce((sum, tower) => sum + safeInt(state.towers[tower.id]), 0);
  }

  function discoveredAuraCount() {
    return AURAS.reduce((sum, aura) => sum + (state.rng.discovered[aura.id] ? 1 : 0), 0);
  }

  function activeBuffMultiplier() {
    const now = Date.now();
    return state.buffs.reduce((product, buff) => buff.until > now ? product * finite(buff.mult, 1) : product, 1);
  }

  function masteryMultiplier(count) {
    const thresholds = [25, 50, 100, 250, 500, 1000];
    return Math.pow(2, thresholds.filter(threshold => count >= threshold).length);
  }

  function achievementMetric(item) {
    switch (item.metric) {
      case 'clicks': return state.totals.clicks;
      case 'crits': return state.totals.crits;
      case 'buttons': return state.totals.buttons;
      case 'bps': return currentBps;
      case 'towers': return totalTowers();
      case 'towerMin': return Math.min(...TOWERS.map(tower => state.towers[tower.id]));
      case 'upgrades': return state.upgrades.length;
      case 'golden': return state.totals.golden;
      case 'glitches': return state.totals.glitches;
      case 'arcade': return state.totals.arcadeWins;
      case 'arcadeHard': return Object.entries(state.minigames.difficultyWins).reduce((sum, [key, wins]) => sum + (key.endsWith(':hard') ? safeInt(wins) : 0), 0);
      case 'arcadeInsane': return safeInt(state.minigames.difficultyWins['sequence:insane']);
      case 'auras': return discoveredAuraCount();
      case 'secrets': return state.secrets.found.length;
      case 'secretSevenfold': return has(state.secrets.found, 'sevenfold') ? 1 : 0;
      case 'secretUpup': return has(state.secrets.found, 'upup') ? 1 : 0;
      case 'secretEcho': return has(state.secrets.found, 'echo') ? 1 : 0;
      case 'secretHeartbeat': return has(state.secrets.found, 'heartbeat') ? 1 : 0;
      case 'ascensions': return state.totals.ascensions;
      case 'coreLevels': return Object.values(state.ascension.nodes).reduce((sum, level) => sum + safeInt(level), 0);
      default: return 0;
    }
  }

  function achievementComplete(item) {
    return achievementMetric(item) >= item.target;
  }

  function recomputeModifiers() {
    const next = {
      clickBase: 1,
      clickMult: 1,
      global: 1,
      towerGlobal: 1,
      critMult: 10,
      towerMult: Object.fromEntries(TOWERS.map(tower => [tower.id, 1])),
      discount: 0,
      offline: 0.25,
      goldenFrequency: 1,
      goldenReward: 1,
      charge: 1,
      rngAutoCharge: 0,
      auraLuck: 0,
      converterYield: 1,
      converterSpeed: 1,
      converterEfficiency: 1,
      startButtons: 0
    };

    for (const id of state.upgrades) {
      const effect = UPGRADES.find(item => item.id === id)?.effect;
      if (!effect) continue;
      if (effect.kind === 'clickFlat') next.clickBase += effect.value;
      if (effect.kind === 'clickMult') next.clickMult *= effect.value;
      if (effect.kind === 'global') next.global *= effect.value;
      if (effect.kind === 'towerGlobal') next.towerGlobal *= effect.value;
      if (effect.kind === 'critPower') next.critMult += effect.value;
      if (effect.kind === 'tower') next.towerMult[effect.tower] *= effect.value;
      if (effect.kind === 'discount') next.discount += effect.value;
      if (effect.kind === 'offline') next.offline += effect.value;
      if (effect.kind === 'goldenFrequency') next.goldenFrequency += effect.value;
      if (effect.kind === 'goldenReward') next.goldenReward *= effect.value;
      if (effect.kind === 'charge') next.charge *= effect.value;
    }

    for (const id of state.converter.upgrades) {
      const effect = CONVERTER_UPGRADES.find(item => item.id === id)?.effect;
      if (!effect) continue;
      if (effect.kind === 'converterYield') next.converterYield *= effect.value;
      if (effect.kind === 'converterSpeed') next.converterSpeed *= effect.value;
      if (effect.kind === 'converterEfficiency') next.converterEfficiency *= effect.value;
    }

    for (const item of ACHIEVEMENTS) {
      if (!has(state.achievements.claimed, item.id) || item.reward.kind !== 'global') continue;
      next.global *= item.reward.value;
    }

    const nodes = state.ascension.nodes;
    for (const node of CORE_NODES) {
      const level = nodes[node.id] || 0;
      if (!level) continue;
      for (const effect of node.effects || []) {
        if (effect.kind === 'startButtons') next.startButtons += effect.value * level;
        if (effect.kind === 'clickBase') next.clickBase += effect.value * level;
        if (effect.kind === 'clickMult') next.clickMult *= Math.pow(effect.value, level);
        if (effect.kind === 'towerGlobal') next.towerGlobal *= Math.pow(effect.value, level);
        if (effect.kind === 'global') next.global *= Math.pow(effect.value, level);
        if (effect.kind === 'critPower') next.critMult += effect.value * level;
        if (effect.kind === 'goldenFrequency') next.goldenFrequency += effect.value * level;
        if (effect.kind === 'goldenReward') next.goldenReward *= Math.pow(effect.value, level);
        if (effect.kind === 'charge') next.charge *= Math.pow(effect.value, level);
        if (effect.kind === 'offline') next.offline += effect.value * level;
        if (effect.kind === 'discount') next.discount += effect.value * level;
        if (effect.kind === 'converterYield') next.converterYield *= Math.pow(effect.value, level);
        if (effect.kind === 'converterSpeed') next.converterSpeed *= Math.pow(effect.value, level);
        if (effect.kind === 'converterEfficiency') next.converterEfficiency *= Math.pow(effect.value, level);
        if (effect.kind === 'rngAutoCharge') next.rngAutoCharge += effect.value * level;
        if (effect.kind === 'auraLuck') next.auraLuck = AURA_LUCK_BONUSES[clamp(level, 0, AURA_LUCK_BONUSES.length - 1)];
      }
    }

    const aura = AURAS.find(item => item.id === state.rng.equipped);
    if (aura && state.rng.discovered[aura.id]) {
      if (aura.effect.kind === 'global') next.global *= aura.effect.value;
      if (aura.effect.kind === 'click') next.clickMult *= aura.effect.value;
      if (aura.effect.kind === 'charge') next.charge *= aura.effect.value;
      if (aura.effect.kind === 'critMult') next.critMult += aura.effect.value;
      if (aura.effect.kind === 'golden') next.goldenReward *= aura.effect.value;
    }

    next.discount = clamp(next.discount, 0, 0.25);
    next.offline = clamp(next.offline, 0.25, 0.85);
    mods = next;
    modsDirty = false;
    currentCritChance = calculateCriticalChance();
    currentClickPower = calculateClickPower();
    currentBps = calculateBps();
  }

  function ensureModifiers() {
    if (modsDirty || !mods) recomputeModifiers();
    return mods;
  }

  function criticalProgress() {
    const critUpgrades = UPGRADES.filter(item => item.effect.kind === 'crit');
    const calibrationUpgrades = UPGRADES.filter(item => item.effect.kind === 'calibration');
    const purchasedCrit = critUpgrades.filter(item => has(state.upgrades, item.id));
    const purchasedCalibration = calibrationUpgrades.filter(item => has(state.upgrades, item.id));
    const towerMethods = TOWER_CRIT_THRESHOLDS.filter(threshold => totalTowers() >= threshold).length;
    const achievementMethods = CRIT_ACHIEVEMENTS.filter(id => has(state.achievements.claimed, id)).length;
    const secretMethods = state.secrets.found.length;
    const coreMethods = state.ascension.nodes.probability;
    const auraMethod = state.rng.discovered.paradox ? 1 : 0;
    const goldenMethod = state.totals.golden >= 100 ? 1 : 0;
    const priorMethods = 1 + purchasedCrit.length + purchasedCalibration.length + towerMethods + achievementMethods + secretMethods + coreMethods + auraMethod + goldenMethod;
    const perfect = priorMethods === 37 ? 1 : 0;
    const chance =
      0.02 +
      purchasedCrit.reduce((sum, item) => sum + item.effect.value, 0) +
      purchasedCalibration.reduce((sum, item) => sum + item.effect.value, 0) +
      towerMethods * 0.02 +
      achievementMethods * 0.01 +
      secretMethods * 0.025 +
      coreMethods * 0.025 +
      auraMethod * 0.03 +
      goldenMethod * 0.03 +
      perfect * 0.02;
    return {
      chance: clamp(chance, 0.02, CRIT_CAP),
      methods: priorMethods + perfect,
      perfect,
      groups: [
        { icon: 'fa-hand-pointer', name: 'Base reactor contact', detail: 'Built into every new cycle', done: 1, total: 1, value: 0.02, max: 0.02 },
        { icon: 'fa-crosshairs', name: 'Critical upgrades', detail: `${purchasedCrit.length} of ${critUpgrades.length} installed`, done: purchasedCrit.length, total: critUpgrades.length, value: purchasedCrit.reduce((sum, item) => sum + item.effect.value, 0), max: 0.18 },
        { icon: 'fa-gauge-high', name: 'Final calibrations', detail: `${purchasedCalibration.length} of ${calibrationUpgrades.length} installed`, done: purchasedCalibration.length, total: calibrationUpgrades.length, value: purchasedCalibration.reduce((sum, item) => sum + item.effect.value, 0), max: 0.075 },
        { icon: 'fa-city', name: 'Tower network mastery', detail: `Next at ${TOWER_CRIT_THRESHOLDS[towerMethods]?.toLocaleString() || 'complete'} total towers`, done: towerMethods, total: 6, value: towerMethods * 0.02, max: 0.12 },
        { icon: 'fa-trophy', name: 'Achievement rewards', detail: `${achievementMethods} of 5 critical rewards claimed`, done: achievementMethods, total: 5, value: achievementMethods * 0.01, max: 0.05 },
        { icon: 'fa-key', name: 'Restricted signals', detail: `${secretMethods} of 4 secrets recovered`, done: secretMethods, total: 4, value: secretMethods * 0.025, max: 0.10 },
        { icon: 'fa-rocket', name: 'Probability Weave', detail: `${coreMethods} of 5 permanent levels`, done: coreMethods, total: 5, value: coreMethods * 0.025, max: 0.125 },
        { icon: 'fa-infinity', name: 'Paradox frequency', detail: auraMethod ? 'Transcendent aura discovered' : 'Undiscovered in the Observatory', done: auraMethod, total: 1, value: auraMethod * 0.03, max: 0.03 },
        { icon: 'fa-star', name: 'Golden mastery', detail: `${Math.min(100, state.totals.golden)} of 100 signals caught`, done: goldenMethod, total: 1, value: goldenMethod * 0.03, max: 0.03 },
        { icon: 'fa-crown', name: 'Perfect calibration', detail: perfect ? 'Every other method completed' : 'Complete all 37 methods above', done: perfect, total: 1, value: perfect * 0.02, max: 0.02 }
      ]
    };
  }

  function calculateCriticalChance() {
    return criticalProgress().chance;
  }

  function calculateClickPower() {
    const current = ensureModifiers();
    return current.clickBase * current.clickMult * current.global;
  }

  function towerProductionEach(tower) {
    const current = ensureModifiers();
    const count = state.towers[tower.id];
    return tower.baseProd * current.towerMult[tower.id] * masteryMultiplier(count) * current.towerGlobal * current.global;
  }

  function calculateBps() {
    return TOWERS.reduce((sum, tower) => sum + towerProductionEach(tower) * state.towers[tower.id], 0);
  }

  function towerUnitCost(tower, owned = state.towers[tower.id]) {
    const current = ensureModifiers();
    const power = Math.pow(tower.growth, owned);
    if (!Number.isFinite(power)) return Number.MAX_VALUE;
    return tower.baseCost * power * (1 - current.discount);
  }

  function towerBulkCost(tower, amount) {
    const count = safeInt(amount);
    if (!count) return 0;
    const first = towerUnitCost(tower);
    const exponent = Math.log(tower.growth) * count;
    if (!Number.isFinite(first) || exponent > 700) return Number.MAX_VALUE;
    return first * Math.expm1(exponent) / (tower.growth - 1);
  }

  function maxAffordableTower(tower) {
    const first = towerUnitCost(tower);
    const buttons = state.resources.buttons;
    if (!Number.isFinite(first) || buttons < first) return 0;
    const ratio = buttons / first;
    let amount;
    if (Number.isFinite(ratio)) {
      amount = Math.floor(Math.log1p(ratio * (tower.growth - 1)) / Math.log(tower.growth));
    } else {
      amount = Math.floor((Math.log(buttons) - Math.log(first) + Math.log(tower.growth - 1)) / Math.log(tower.growth));
    }
    amount = clamp(safeInt(amount), 0, 1e6);
    while (amount > 0 && towerBulkCost(tower, amount) > buttons) amount--;
    while (amount < 1e6 && towerBulkCost(tower, amount + 1) <= buttons) amount++;
    return amount;
  }

  function selectedTowerAmount(tower) {
    return buyMode === 'max' ? maxAffordableTower(tower) : Number(buyMode);
  }

  function addButtons(amount) {
    const gain = Math.max(0, finite(amount));
    if (!gain) return;
    state.resources.buttons = Math.min(Number.MAX_VALUE, state.resources.buttons + gain);
    state.totals.buttons = Math.min(Number.MAX_VALUE, state.totals.buttons + gain);
    state.totals.runButtons = Math.min(Number.MAX_VALUE, state.totals.runButtons + gain);
  }

  function spendButtons(amount) {
    const cost = Math.max(0, finite(amount));
    if (state.resources.buttons + Math.max(1e-9, cost * 1e-12) < cost) return false;
    state.resources.buttons = Math.max(0, state.resources.buttons - cost);
    return true;
  }

  function markDirty() {
    modsDirty = true;
    savePending = true;
  }

  class SoundEngine {
    constructor() {
      this.context = null;
      this.music = null;
      this.trackIndex = -1;
      this.specialTrack = null;
      this.started = false;
      this.shuffleBag = [];
      this.history = [];
      this.historyCursor = -1;
      this.musicPausedByUser = false;
      this.glitchPausedByUser = false;
      this.wasPlayingBeforeCutscene = false;
      this.wasPlayingBeforeGlitch = false;
      this.glitchActive = false;
      this.glitchMusic = null;
      this.glitchSource = null;
      this.glitchDistortion = null;
      this.glitchFilter = null;
      this.glitchDryGain = null;
      this.glitchWetGain = null;
      this.glitchGain = null;
      this.glitchFadeFrame = null;
      this.glitchFadeToken = 0;
      this.tracks = Array.isArray(window.BUTTON_REACTOR_TRACKS)
        ? [...new Set(window.BUTTON_REACTOR_TRACKS.filter(track => typeof track === 'string' && track.trim()))]
        : [];
    }

    ensure({ startMusic = true } = {}) {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.context = new AudioContext();
      }
      if (this.context?.state === 'suspended') this.context.resume().catch(() => {});
      if (this.glitchActive) {
        if (state.settings.music > 0 && !this.glitchPausedByUser && this.glitchMusic?.paused) this.glitchMusic.play().catch(() => {});
        return;
      }
      if (startMusic && !this.started && !this.musicPausedByUser && state.settings.music > 0) this.startMusic();
    }

    tone(frequency, duration, type = 'sine', volume = 0.1, slide = 0) {
      if (!state.settings.sound || !this.context) return;
      const time = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const glitchBurst = this.glitchActive && runtime.glitch.burst;
      const glitchPitch = glitchBurst ? randomBetween(0.48, 1.65) : this.glitchActive ? randomBetween(0.985, 1.015) : 1;
      const startFrequency = Math.max(30, frequency * glitchPitch);
      oscillator.type = glitchBurst && type === 'sine' ? 'sawtooth' : type;
      oscillator.detune.value = glitchBurst ? randomBetween(-75, 75) : this.glitchActive ? randomBetween(-5, 5) : 0;
      oscillator.frequency.setValueAtTime(startFrequency, time);
      if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, startFrequency + slide * glitchPitch), time + duration);
      gain.gain.setValueAtTime(Math.max(0.0001, volume * state.settings.sound), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(time);
      oscillator.stop(time + duration);
    }

    play(name) {
      this.ensure({ startMusic: false });
      if (!this.context) return;
      if (name === 'goldenSpawnSelected') {
        const selected = GOLDEN_SPAWN_SOUNDS.find(sound => sound.id === state.jukebox.goldenSpawnSound) || GOLDEN_SPAWN_SOUNDS[0];
        name = selected.sound;
      }
      if (name === 'click') this.tone(120, 0.055, 'square', 0.025, -30);
      if (name === 'crit') {
        this.tone(430, 0.16, 'triangle', 0.08, 430);
        setTimeout(() => this.tone(860, 0.12, 'sine', 0.05, 300), 45);
      }
      if (name === 'buy') this.tone(260, 0.09, 'triangle', 0.055, 150);
      if (name === 'reward') {
        this.tone(520, 0.18, 'sine', 0.07, 260);
        setTimeout(() => this.tone(780, 0.18, 'sine', 0.06, 260), 90);
      }
      if (name === 'fail') this.tone(150, 0.18, 'sawtooth', 0.045, -80);
      if (name === 'golden') {
        [520, 660, 810].forEach((freq, index) => setTimeout(() => this.tone(freq, 0.24, 'sine', 0.06, 140), index * 65));
      }
      if (name === 'goldenSpawnDefault') this.tone(640, 0.12, 'sine', 0.024, 100);
      if (name === 'goldenSpawnSimple') this.tone(720, 0.16, 'triangle', 0.04, 160);
      if (name === 'goldenSpawnRadiant') {
        this.tone(540, 0.2, 'triangle', 0.048, 220);
        setTimeout(() => this.tone(860, 0.22, 'sine', 0.04, 180), 95);
      }
      if (name === 'goldenSpawnComfort') {
        [523, 659, 784].forEach((freq, index) => setTimeout(() => this.tone(freq, 0.34, 'sine', 0.046, 55), index * 90));
      }
      if (name === 'glitchSpawn') {
        this.tone(96, 0.14, 'sawtooth', 0.042, 310);
        setTimeout(() => this.tone(740, 0.09, 'square', 0.032, -520), 55);
      }
      if (name === 'shutdown') {
        [260, 190, 125, 68].forEach((freq, index) => setTimeout(() => this.tone(freq, 0.44, 'sawtooth', 0.07, -35), index * 150));
      }
      if (name === 'reboot') {
        [110, 220, 440, 660].forEach((freq, index) => setTimeout(() => this.tone(freq, 0.28, 'triangle', 0.06, 80), index * 120));
      }
    }

    refillShuffleBag() {
      const previous = this.trackIndex;
      this.shuffleBag = this.tracks.map((_, index) => index);
      for (let index = this.shuffleBag.length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1));
        [this.shuffleBag[index], this.shuffleBag[swap]] = [this.shuffleBag[swap], this.shuffleBag[index]];
      }
      if (this.shuffleBag.length > 1 && this.shuffleBag.at(-1) === previous) {
        [this.shuffleBag[0], this.shuffleBag[this.shuffleBag.length - 1]] = [this.shuffleBag.at(-1), this.shuffleBag[0]];
      }
    }

    createMusicElement() {
      if (this.music) return;
      this.music = new Audio();
      this.music.preload = 'metadata';
      this.music.volume = state.settings.music;
      this.music.addEventListener('ended', () => this.next());
      this.music.addEventListener('timeupdate', renderMusicPlayer);
      this.music.addEventListener('loadedmetadata', renderMusicPlayer);
      this.music.addEventListener('play', () => {
        this.started = true;
        renderMusicPlayer();
      });
      this.music.addEventListener('pause', () => {
        this.started = false;
        renderMusicPlayer();
      });
      this.music.addEventListener('error', () => {
        toast('Track unavailable', 'Skipping to the next Reactor Radio signal.');
        setTimeout(() => this.next(), 250);
      });
    }

    trackName(index = this.trackIndex) {
      const source = this.tracks[index] || '';
      const filename = decodeURIComponent(source.split('/').pop() || 'Reactor Radio').replace(/\.[^.]+$/, '');
      return filename
        .replace(/[_-]+/g, ' ')
        .replace(/\b(main|music)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, letter => letter.toUpperCase()) || 'Reactor Radio';
    }

    playIndex(index, { record = true, autoplay = true } = {}) {
      if (!this.tracks[index]) return;
      this.createMusicElement();
      this.trackIndex = index;
      this.specialTrack = null;
      this.music.src = this.tracks[index];
      this.music.volume = state.settings.music;
      if (record) {
        this.history = this.history.slice(0, this.historyCursor + 1);
        this.history.push(index);
        this.historyCursor = this.history.length - 1;
      }
      this.shuffleBag = this.shuffleBag.filter(item => item !== index);
      renderMusicPlayer();
      if (autoplay && state.settings.music > 0 && !this.glitchActive) {
        this.musicPausedByUser = false;
        this.music.play().then(() => { this.started = true; }).catch(() => { this.started = false; renderMusicPlayer(); });
      }
    }

    playSpecialTrack(source, name) {
      this.createMusicElement();
      this.trackIndex = -1;
      this.specialTrack = { source, name };
      this.music.src = source;
      this.music.volume = state.settings.music;
      this.music.currentTime = 0;
      this.musicPausedByUser = false;
      renderMusicPlayer();
      if (state.settings.music > 0 && !this.glitchActive) {
        this.music.play().catch(() => toast('Track unavailable', `${name} could not start. Check the Music volume and try again.`));
      }
    }

    next() {
      if (!this.tracks.length) return;
      if (!this.shuffleBag.length) this.refillShuffleBag();
      const index = this.shuffleBag.pop();
      this.playIndex(index);
    }

    previous() {
      if (!this.music || !this.history.length) return;
      if (this.music.currentTime > 5 || this.historyCursor <= 0) {
        this.music.currentTime = 0;
        renderMusicPlayer();
        return;
      }
      this.historyCursor--;
      this.playIndex(this.history[this.historyCursor], { record: false });
    }

    startMusic() {
      if (state.settings.music <= 0 || !this.tracks.length || this.glitchActive || this.musicPausedByUser) return;
      if (this.music?.src) {
        this.music.volume = state.settings.music;
        this.music.play().then(() => { this.started = true; }).catch(() => { this.started = false; });
        return;
      }
      this.next();
    }

    toggleMusic() {
      if (this.glitchActive) {
        if (this.glitchMusic?.paused) {
          this.glitchPausedByUser = false;
          this.glitchMusic.play().catch(() => {});
        } else {
          this.glitchPausedByUser = true;
          this.glitchMusic?.pause();
        }
        return;
      }
      if (!this.music?.src) {
        this.musicPausedByUser = false;
        this.startMusic();
      } else if (this.music.paused) {
        this.musicPausedByUser = false;
        this.music.play().catch(() => {});
      } else {
        this.musicPausedByUser = true;
        this.music.pause();
      }
    }

    distortionCurve(drive = 1.25) {
      const samples = 2048;
      const curve = new Float32Array(samples);
      const normalization = Math.tanh(drive) || 1;
      for (let index = 0; index < samples; index++) {
        const x = index * 2 / samples - 1;
        curve[index] = Math.tanh(drive * x) / normalization;
      }
      return curve;
    }

    connectGlitchGraph() {
      if (!this.context || !this.glitchMusic || this.glitchSource) return;
      try {
        this.glitchSource = this.context.createMediaElementSource(this.glitchMusic);
        this.glitchDistortion = this.context.createWaveShaper();
        this.glitchDistortion.curve = this.distortionCurve(1.03);
        this.glitchDistortion.oversample = '2x';
        this.glitchFilter = this.context.createBiquadFilter();
        this.glitchFilter.type = 'lowpass';
        this.glitchFilter.frequency.value = 19000;
        this.glitchFilter.Q.value = 0.1;
        this.glitchDryGain = this.context.createGain();
        this.glitchDryGain.gain.value = 0.97;
        this.glitchWetGain = this.context.createGain();
        this.glitchWetGain.gain.value = 0.03;
        this.glitchGain = this.context.createGain();
        this.glitchGain.gain.value = Math.min(1.25, state.settings.music * 1.35);
        this.glitchMusic.volume = 1;
        this.glitchSource.connect(this.glitchDryGain).connect(this.glitchGain);
        this.glitchSource
          .connect(this.glitchDistortion)
          .connect(this.glitchFilter)
          .connect(this.glitchWetGain)
          .connect(this.glitchGain);
        this.glitchGain.connect(this.context.destination);
      } catch (_) {
        this.glitchMusic.volume = Math.min(1, state.settings.music * 1.25);
      }
    }

    startGlitch() {
      this.cancelGlitchFade();
      if (!this.glitchActive) {
        this.wasPlayingBeforeGlitch = Boolean(this.music && !this.music.paused);
        this.glitchActive = true;
        this.glitchPausedByUser = false;
      }
      if (this.music) this.music.pause();
      if (!this.glitchMusic) {
        this.glitchMusic = new Audio(GLITCH_TRACK_SOURCE);
        this.glitchMusic.preload = 'auto';
        this.glitchMusic.loop = true;
        this.glitchMusic.preservesPitch = true;
        this.glitchMusic.playbackRate = 1;
        this.glitchMusic.addEventListener('error', () => toast('ERR_AUDIO_404', 'The corrupted music signal could not be decoded.', 'rare'));
        this.glitchMusic.addEventListener('play', renderMusicPlayer);
        this.glitchMusic.addEventListener('pause', renderMusicPlayer);
        this.glitchMusic.addEventListener('loadedmetadata', renderMusicPlayer);
        this.glitchMusic.addEventListener('timeupdate', renderMusicPlayer);
      }
      this.glitchMusic.volume = Math.min(1, state.settings.music * 1.15);
      this.glitchMusic.playbackRate = 1;
      this.glitchMusic.preservesPitch = true;
      if (state.settings.music > 0) {
        this.context?.resume?.().catch(() => {});
        this.glitchMusic.play().catch(() => toast('ERR_AUDIO_404', 'Tap PLAY ERROR in the Jukebox once to authorize the glitch track.', 'rare'));
      }
      renderMusicPlayer();
    }

    setGlitchBurst(active) {
      if (!this.glitchMusic) return;
      this.glitchMusic.preservesPitch = !active;
      this.glitchMusic.playbackRate = active ? randomBetween(0.72, 1.28) : 1;
      this.glitchMusic.volume = Math.min(1, state.settings.music * (active ? 1.25 : 1.15));
      if (active) {
        if (this.glitchMusic.duration && Number.isFinite(this.glitchMusic.duration)) {
          this.glitchMusic.currentTime = clamp(this.glitchMusic.currentTime + randomBetween(-0.12, 0.18), 0, Math.max(0, this.glitchMusic.duration - 0.1));
        }
        this.tone(randomBetween(48, 125), 0.14, 'sawtooth', 0.05, randomBetween(-30, 170));
        setTimeout(() => this.tone(randomBetween(170, 760), 0.07, 'square', 0.025, -80), 45);
      }
    }

    cancelGlitchFade() {
      this.glitchFadeToken++;
      if (this.glitchFadeFrame !== null) cancelAnimationFrame(this.glitchFadeFrame);
      this.glitchFadeFrame = null;
    }

    fadeOutGlitch(duration = GLITCH_FADE_MS) {
      if (!this.glitchMusic || this.glitchMusic.paused) return;
      this.cancelGlitchFade();
      const token = this.glitchFadeToken;
      const startedAt = performance.now();
      const startVolume = this.glitchMusic.volume;
      const fadeDuration = Math.max(1, duration);
      const step = now => {
        if (token !== this.glitchFadeToken || !this.glitchMusic) return;
        const progress = clamp((now - startedAt) / fadeDuration, 0, 1);
        this.glitchMusic.volume = startVolume * (1 - progress);
        if (progress < 1) this.glitchFadeFrame = requestAnimationFrame(step);
        else this.glitchFadeFrame = null;
      };
      this.glitchFadeFrame = requestAnimationFrame(step);
    }

    stopGlitch() {
      if (!this.glitchActive) return;
      this.cancelGlitchFade();
      this.glitchActive = false;
      this.setGlitchBurst(false);
      if (this.glitchMusic) {
        this.glitchMusic.pause();
        this.glitchMusic.currentTime = 0;
      }
      this.glitchPausedByUser = false;
      if (this.wasPlayingBeforeGlitch && state.settings.music > 0) this.startMusic();
      this.wasPlayingBeforeGlitch = false;
      renderMusicPlayer();
    }

    beginCutscene() {
      this.wasPlayingBeforeCutscene = Boolean(this.music && !this.music.paused);
      if (this.music) this.music.pause();
    }

    endCutscene() {
      if (this.wasPlayingBeforeCutscene && state.settings.music > 0) this.startMusic();
      this.wasPlayingBeforeCutscene = false;
    }

    setMusicVolume() {
      if (this.glitchActive) {
        if (this.glitchMusic && !runtime.glitch.fading) this.glitchMusic.volume = Math.min(1, state.settings.music * 1.15);
        if (state.settings.music === 0) this.glitchMusic?.pause();
        else if (!this.glitchPausedByUser && this.glitchMusic?.paused) this.glitchMusic.play().catch(() => {});
        renderMusicPlayer();
        return;
      }
      if (this.music) this.music.volume = state.settings.music;
      if (state.settings.music === 0 && this.music) this.music.pause();
      else if (state.settings.music > 0 && !this.musicPausedByUser && this.music?.paused) this.music.play().catch(() => {});
      else if (state.settings.music > 0 && !this.musicPausedByUser && !this.music) this.startMusic();
      renderMusicPlayer();
    }
  }

  const audio = new SoundEngine();

  function manualPress(event) {
    if (event?.type === 'click' && event.detail === 0) audio.ensure();
    ensureModifiers();
    const now = performance.now();
    const rapid = now - lastManualPress < 650;
    combo = rapid ? clamp(combo + 1, 0, 20) : Math.max(1, combo * 0.4);
    lastManualPress = now;
    const comboMultiplier = 1 + combo * 0.05;
    const critical = Math.random() < currentCritChance;
    const gain = currentClickPower * comboMultiplier * (critical ? mods.critMult : 1);
    addButtons(gain);
    state.totals.clicks++;
    if (critical) state.totals.crits++;
    state.rng.charge = clamp(state.rng.charge + mods.charge, 0, 100);
    savePending = true;

    ui.mainButton.classList.remove('pressed', 'critical');
    void ui.mainButton.offsetWidth;
    ui.mainButton.classList.add('pressed');
    if (critical) ui.mainButton.classList.add('critical');
    setTimeout(() => ui.mainButton.classList.remove('pressed', 'critical'), critical ? 260 : 90);
    spawnFloatNumber(gain, critical, event);
    audio.play(critical ? 'crit' : 'click');
  }

  function spawnFloatNumber(amount, critical, event) {
    if (state.settings.motion === 'off') return;
    const number = document.createElement('span');
    number.className = `float-number${critical ? ' crit' : ''}`;
    number.textContent = `${critical ? 'CRIT ' : '+'}${formatNumber(amount)}`;
    const rect = ui.reactorStage.getBoundingClientRect();
    const x = event?.clientX ? event.clientX - rect.left : rect.width * randomBetween(0.38, 0.62);
    const y = event?.clientY ? event.clientY - rect.top : rect.height * randomBetween(0.42, 0.58);
    number.style.left = `${clamp(x, 50, rect.width - 50)}px`;
    number.style.top = `${clamp(y, 70, rect.height - 40)}px`;
    ui.floatLayer.appendChild(number);
    setTimeout(() => number.remove(), 850);
    while (ui.floatLayer.children.length > 18) ui.floatLayer.firstElementChild.remove();
  }

  function upgradeUnlockMetric(upgradeItem) {
    const unlock = upgradeItem.unlock || {};
    if (unlock.requires && !has(state.upgrades, unlock.requires)) return { value: 0, target: 1, label: 'Previous modification required' };
    if (!unlock.type) return { value: 1, target: 1, label: 'Available' };
    if (unlock.type === 'buttons') return { value: state.totals.buttons, target: unlock.value, label: `Produce ${formatNumber(unlock.value)} lifetime buttons` };
    if (unlock.type === 'towers') return { value: totalTowers(), target: unlock.value, label: `Own ${formatNumber(unlock.value)} total towers` };
    if (unlock.type === 'tower') return { value: state.towers[unlock.tower], target: unlock.value, label: `Own ${unlock.value} ${TOWERS.find(tower => tower.id === unlock.tower)?.name}` };
    if (unlock.type === 'golden') return { value: state.totals.golden, target: unlock.value, label: `Catch ${unlock.value} golden signals` };
    if (unlock.type === 'scans') return { value: state.rng.scans, target: unlock.value, label: `Complete ${unlock.value} aura scans` };
    return { value: 0, target: 1, label: 'Locked' };
  }

  function upgradeUnlocked(upgradeItem) {
    const metric = upgradeUnlockMetric(upgradeItem);
    return metric.value >= metric.target;
  }

  function buyUpgrade(id) {
    const item = UPGRADES.find(upgradeItem => upgradeItem.id === id);
    if (!item || has(state.upgrades, id) || !upgradeUnlocked(item) || !spendButtons(item.cost)) return;
    state.upgrades.push(id);
    markDirty();
    updateUpgradeCards();
    updateAchievementCards();
    audio.play('buy');
    logEvent('Modification installed', `${item.name}: ${item.effectText}`, item.category === 'critical' ? 'gold' : 'good');
    toast('Upgrade installed', item.name, item.category === 'critical' ? 'gold' : '');
  }

  function buyTower(id) {
    const tower = TOWERS.find(item => item.id === id);
    if (!tower) return;
    const amount = selectedTowerAmount(tower);
    const cost = towerBulkCost(tower, amount);
    if (!amount || !spendButtons(cost)) return;
    state.towers[id] += amount;
    state.totals.towersPurchased += amount;
    markDirty();
    updateTowerList();
    updateAchievementCards();
    audio.play('buy');
    logEvent(`${tower.name} expanded`, `Purchased ${formatNumber(amount)} for ${formatNumber(cost)} buttons.`, 'good');
  }

  function getAchievementStats() {
    const unlocked = ACHIEVEMENTS.filter(achievementComplete);
    const claimable = unlocked.filter(item => !has(state.achievements.claimed, item.id));
    return { unlocked, claimable };
  }

  function claimAchievement(id, reveal = true) {
    const item = ACHIEVEMENTS.find(entry => entry.id === id);
    if (!item || !achievementComplete(item) || has(state.achievements.claimed, id)) return false;
    state.achievements.claimed.push(id);
    if (item.reward.kind === 'crystals') {
      state.resources.crystals += item.reward.value;
      state.totals.achievementCrystals += item.reward.value;
    }
    if (item.reward.kind === 'seconds') addButtons(Math.max(currentBps, currentClickPower) * item.reward.value);
    markDirty();
    updateAchievementCards();
    audio.play('reward');
    logEvent('Achievement claimed', `${item.name} — ${rewardLabel(item.reward)}`, 'gold');
    if (reveal) showReward(item.name, rewardLabel(item.reward), rewardDescription(item.reward));
    return true;
  }

  function rewardDescription(reward) {
    if (reward.kind === 'crystals') return 'Crystals transferred to the Observatory.';
    if (reward.kind === 'seconds') return 'Stored production released into your button balance.';
    if (reward.kind === 'global') return 'This permanent multiplier is now active across every cycle.';
    if (reward.kind === 'crit') return 'A new permanent route toward the 75% critical cap is complete.';
    return 'Reward acquired.';
  }

  function claimAllAchievements() {
    const claimable = getAchievementStats().claimable;
    if (!claimable.length) return;
    let count = 0;
    for (const item of claimable) if (claimAchievement(item.id, false)) count++;
    toast('Rewards claimed', `${count} achievement${count === 1 ? '' : 's'} processed.`, 'gold');
    renderAchievements();
  }

  function addArcadeWin(crystals, label, gameName = null, difficulty = null) {
    const exactPayout = Math.max(0, crystals) + state.minigames.arcadeCrystalRemainder;
    const payout = Math.floor(exactPayout + 1e-9);
    state.minigames.arcadeCrystalRemainder = exactPayout - payout;
    state.resources.crystals += payout;
    state.totals.arcadeWins++;
    state.minigames.streak++;
    if (gameName && difficulty) {
      const key = `${gameName}:${difficulty}`;
      state.minigames.difficultyWins[key] = safeInt(state.minigames.difficultyWins[key]) + 1;
    }
    markDirty();
    audio.play('reward');
    toast(`${label} complete`, `+${formatNumber(payout)} crystals`, 'gold');
  }

  function arcadeDifficulty(gameName) {
    const table = ARCADE_DIFFICULTY_TABLES[gameName];
    const selected = state.minigames.difficulties[gameName];
    return Object.hasOwn(table, selected) ? selected : 'easy';
  }

  function arcadeGameRunning(gameName) {
    return Boolean(runtime[gameName]?.active);
  }

  function setArcadeDifficulty(gameName, difficulty) {
    const table = ARCADE_DIFFICULTY_TABLES[gameName];
    if (!table || !Object.hasOwn(table, difficulty)) return;
    if (arcadeGameRunning(gameName)) {
      toast('Trial already running', 'Finish or fail the current run before changing difficulty.');
      return;
    }
    state.minigames.difficulties[gameName] = difficulty;
    runtime[gameName].difficulty = difficulty;
    if (gameName === 'pulse') randomizePulseTarget();
    if (gameName === 'stability') randomizeStabilityTarget();
    savePending = true;
    renderArcade();
  }

  function reactionAction() {
    audio.ensure();
    const game = runtime.reaction;
    if (game.mode === 'idle' || game.mode === 'result') {
      clearTimeout(game.timer);
      game.mode = 'waiting';
      ui.reactionPad.className = 'reaction-pad waiting';
      ui.reactionStatus.textContent = 'WAIT FOR GREEN';
      ui.reactionHint.textContent = 'Early press = failure';
      game.timer = setTimeout(() => {
        if (game.mode !== 'waiting') return;
        game.mode = 'go';
        game.goAt = performance.now();
        ui.reactionPad.className = 'reaction-pad go';
        ui.reactionStatus.textContent = 'PRESS NOW';
        ui.reactionHint.textContent = 'Signal live';
        audio.tone(740, 0.1, 'sine', 0.08, 120);
      }, randomBetween(900, 2800));
      return;
    }
    if (game.mode === 'waiting') {
      clearTimeout(game.timer);
      game.mode = 'result';
      ui.reactionPad.className = 'reaction-pad fail';
      ui.reactionStatus.textContent = 'FALSE START';
      ui.reactionHint.textContent = 'Press to re-arm';
      state.minigames.streak = 0;
      audio.play('fail');
      return;
    }
    if (game.mode === 'go') {
      const reaction = performance.now() - game.goAt;
      game.mode = 'result';
      ui.reactionPad.className = 'reaction-pad';
      ui.reactionStatus.textContent = `${Math.round(reaction)} MS`;
      ui.reactionHint.textContent = 'Press to run again';
      const reward = clamp(12 - Math.floor(Math.max(0, reaction - 150) / 45), 2, 12);
      if (state.minigames.reactionBest == null || reaction < state.minigames.reactionBest) state.minigames.reactionBest = reaction;
      addArcadeWin(reward, 'Signal Break');
    }
  }

  async function startSequence() {
    audio.ensure();
    const game = runtime.sequence;
    game.token++;
    const token = game.token;
    game.difficulty = arcadeDifficulty('sequence');
    const config = SEQUENCE_DIFFICULTIES[game.difficulty];
    game.active = true;
    game.pattern = Array.from({ length: config.startLength }, () => Math.floor(Math.random() * 4));
    game.input = [];
    game.accepting = false;
    ui.sequenceStart.disabled = true;
    ui.sequenceStart.textContent = 'ARRAY ACTIVE';
    ui.sequenceStatus.textContent = 'Reading signal…';
    renderArcade();
    await playSequence(token);
  }

  function playSequenceTone(index, config) {
    if (config.silent) return;
    const frequency = config.randomTone ? randomBetween(170, 980) : 320 + index * 110;
    const type = config.randomTone ? ['sine', 'triangle', 'square'][Math.floor(Math.random() * 3)] : 'sine';
    audio.tone(frequency, Math.max(0.05, config.flashMs / 1000 * 0.7), type, 0.045, config.randomTone ? randomBetween(-120, 160) : 40);
  }

  async function playSequence(token) {
    const game = runtime.sequence;
    if (token !== game.token) return;
    const config = SEQUENCE_DIFFICULTIES[game.difficulty];
    game.accepting = false;
    ui.sequenceStatus.textContent = `Watch wave ${game.pattern.length}`;
    await delay(config.leadMs);
    for (const index of game.pattern) {
      if (token !== game.token) return;
      const button = ui.sequenceBoard.querySelector(`[data-sequence="${index}"]`);
      button.classList.add('active');
      playSequenceTone(index, config);
      await delay(config.flashMs);
      button.classList.remove('active');
      await delay(config.gapMs);
    }
    if (token !== game.token) return;
    game.input = [];
    game.accepting = true;
    ui.sequenceStatus.textContent = 'Repeat the pattern';
  }

  async function sequenceInput(index) {
    const game = runtime.sequence;
    if (!game.accepting) return;
    const config = SEQUENCE_DIFFICULTIES[game.difficulty];
    const button = ui.sequenceBoard.querySelector(`[data-sequence="${index}"]`);
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), Math.min(130, config.flashMs));
    playSequenceTone(index, config);
    const position = game.input.length;
    if (game.pattern[position] !== index) {
      game.active = false;
      game.accepting = false;
      game.token++;
      ui.sequenceStatus.textContent = `Signal lost at wave ${game.pattern.length}`;
      ui.sequenceStart.disabled = false;
      ui.sequenceStart.textContent = 'RESTART ARRAY';
      state.minigames.streak = 0;
      markDirty();
      audio.play('fail');
      renderArcade();
      return;
    }
    game.input.push(index);
    if (game.input.length !== game.pattern.length) return;
    game.accepting = false;
    state.minigames.sequenceBest = Math.max(state.minigames.sequenceBest, game.pattern.length);
    state.minigames.sequenceBestByDifficulty[game.difficulty] = Math.max(safeInt(state.minigames.sequenceBestByDifficulty[game.difficulty]), game.pattern.length);
    addArcadeWin(Math.min(8, game.pattern.length) * config.rewardMultiplier, 'Echo Array', 'sequence', game.difficulty);
    ui.sequenceStatus.textContent = 'Wave confirmed';
    game.pattern.push(Math.floor(Math.random() * 4));
    await delay(600);
    playSequence(game.token);
  }

  function pulseAction() {
    audio.ensure();
    const game = runtime.pulse;
    if (!game.active) {
      game.difficulty = arcadeDifficulty('pulse');
      game.active = true;
      game.startedAt = performance.now();
      game.attempts = 3;
      game.locks = 0;
      game.bestError = 1;
      randomizePulseTarget();
      ui.pulseButton.textContent = 'LOCK FREQUENCY';
      ui.pulseStatus.textContent = 'Track the orange line';
      return;
    }
    const position = pulsePosition(performance.now());
    const center = game.target + game.width / 2;
    const error = Math.abs(position - center) / (game.width / 2);
    const hit = position >= game.target && position <= game.target + game.width;
    game.attempts--;
    if (hit) {
      game.locks++;
      game.bestError = Math.min(game.bestError, error);
      audio.tone(650, 0.12, 'sine', 0.07, 220);
      ui.pulseStatus.textContent = `${Math.round((1 - error) * 100)}% lock`;
    } else {
      audio.play('fail');
      ui.pulseStatus.textContent = 'Frequency missed';
    }
    if (game.attempts <= 0) {
      game.active = false;
      ui.pulseButton.textContent = 'START PULSE';
      if (game.locks > 0) {
        const score = Math.round((game.locks / 3) * 70 + (1 - game.bestError) * 30);
        state.minigames.pulseBest = Math.max(state.minigames.pulseBest || 0, score);
        state.minigames.pulseBestByDifficulty[game.difficulty] = Math.max(safeInt(state.minigames.pulseBestByDifficulty[game.difficulty]), score);
        addArcadeWin(game.locks * 3 * PULSE_DIFFICULTIES[game.difficulty].rewardMultiplier, 'Pulse Lock', 'pulse', game.difficulty);
      } else {
        state.minigames.streak = 0;
        markDirty();
      }
      renderArcade();
    } else {
      randomizePulseTarget();
    }
  }

  function randomizePulseTarget() {
    const config = PULSE_DIFFICULTIES[runtime.pulse.difficulty || arcadeDifficulty('pulse')];
    runtime.pulse.width = randomBetween(11, 17) * config.widthScale;
    runtime.pulse.target = randomBetween(12, 88 - runtime.pulse.width);
    ui.pulseTarget.style.left = `${runtime.pulse.target}%`;
    ui.pulseTarget.style.width = `${runtime.pulse.width}%`;
  }

  function pulsePosition(time) {
    if (!runtime.pulse.active) return 0;
    const config = PULSE_DIFFICULTIES[runtime.pulse.difficulty];
    const phase = ((time - runtime.pulse.startedAt) % config.cycleMs) / config.cycleMs;
    return phase < 0.5 ? phase * 200 : 200 - phase * 200;
  }

  function chooseVectorTarget() {
    const game = runtime.vector;
    const buttons = $$('[data-vector]', ui.vectorBoard);
    for (const button of buttons) {
      button.classList.remove('active');
      button.innerHTML = '';
    }
    let next = Math.floor(Math.random() * buttons.length);
    if (buttons.length > 1 && next === game.target) next = (next + 1 + Math.floor(Math.random() * (buttons.length - 1))) % buttons.length;
    game.target = next;
    buttons[next].classList.add('active');
    buttons[next].innerHTML = fontAwesomeIcon('fa-crosshairs');
  }

  function startVector() {
    if (runtime.vector.active) return;
    audio.ensure();
    const game = runtime.vector;
    game.difficulty = arcadeDifficulty('vector');
    const config = VECTOR_DIFFICULTIES[game.difficulty];
    game.active = true;
    game.hits = 0;
    game.startedAt = performance.now();
    game.endsAt = game.startedAt + config.durationMs;
    ui.vectorStart.disabled = true;
    ui.vectorStart.textContent = 'TRACE ACTIVE';
    chooseVectorTarget();
    renderArcade();
  }

  function vectorInput(index) {
    const game = runtime.vector;
    if (!game.active) return;
    const config = VECTOR_DIFFICULTIES[game.difficulty];
    if (index !== game.target) {
      game.endsAt -= 350;
      ui.vectorStatus.textContent = 'Wrong node • −0.35s';
      audio.play('fail');
      return;
    }
    game.hits++;
    audio.tone(420 + game.hits * 18, 0.08, 'triangle', 0.045, 100);
    if (game.hits >= config.goal) {
      finishVector(true);
      return;
    }
    chooseVectorTarget();
    renderArcade();
  }

  function finishVector(success) {
    const game = runtime.vector;
    if (!game.active) return;
    const config = VECTOR_DIFFICULTIES[game.difficulty];
    const elapsed = performance.now() - game.startedAt;
    game.active = false;
    for (const button of $$('[data-vector]', ui.vectorBoard)) {
      button.classList.remove('active');
      button.innerHTML = '';
    }
    ui.vectorStart.disabled = false;
    ui.vectorStart.textContent = 'START TRACE';
    if (success) {
      const prior = Number.isFinite(state.minigames.vectorBest[game.difficulty])
        ? state.minigames.vectorBest[game.difficulty]
        : Infinity;
      state.minigames.vectorBest[game.difficulty] = Math.min(prior, elapsed);
      ui.vectorStatus.textContent = `${(elapsed / 1000).toFixed(2)}s complete`;
      addArcadeWin(config.reward, 'Vector Trace', 'vector', game.difficulty);
    } else {
      ui.vectorStatus.textContent = `Trace lost at ${game.hits}/${config.goal}`;
      state.minigames.streak = 0;
      markDirty();
      audio.play('fail');
    }
    renderArcade();
  }

  function renderCipherCells() {
    const game = runtime.cipher;
    $$('[data-cipher]', ui.cipherBoard).forEach((button, index) => {
      button.textContent = game.values[index] ?? '?';
      button.classList.toggle('selected', game.selection.includes(index));
      button.disabled = !game.active || game.transitioning;
    });
    ui.cipherTarget.textContent = game.active ? game.target : '—';
  }

  function generateCipherRound() {
    const game = runtime.cipher;
    const config = CIPHER_DIFFICULTIES[game.difficulty];
    let values;
    let validPairs;
    do {
      const generated = new Set();
      while (generated.size < 9) generated.add(1 + Math.floor(Math.random() * config.maxValue));
      values = [...generated];
      const displayedValues = new Set(values);
      validPairs = [];
      for (let first = 0; first < values.length; first++) {
        for (let second = first + 1; second < values.length; second++) {
          const sum = values[first] + values[second];
          if (!displayedValues.has(sum)) validPairs.push({ first, second, sum });
        }
      }
    } while (!validPairs.length);
    game.values = values;
    const solution = validPairs[Math.floor(Math.random() * validPairs.length)];
    game.target = solution.sum;
    game.selection = [];
    game.transitioning = false;
    renderCipherCells();
  }

  function startCipher() {
    if (runtime.cipher.active) return;
    audio.ensure();
    const game = runtime.cipher;
    game.difficulty = arcadeDifficulty('cipher');
    const config = CIPHER_DIFFICULTIES[game.difficulty];
    game.active = true;
    game.round = 0;
    game.token++;
    game.startedAt = performance.now();
    game.endsAt = game.startedAt + config.durationMs;
    ui.cipherStart.disabled = true;
    ui.cipherStart.textContent = 'CIPHER ACTIVE';
    generateCipherRound();
    renderArcade();
  }

  function cipherInput(index) {
    const game = runtime.cipher;
    if (!game.active || game.transitioning || game.selection.includes(index)) return;
    const config = CIPHER_DIFFICULTIES[game.difficulty];
    game.selection.push(index);
    renderCipherCells();
    if (game.selection.length < 2) return;
    const sum = game.selection.reduce((total, selected) => total + game.values[selected], 0);
    if (sum !== game.target) {
      game.endsAt -= config.penaltyMs;
      game.selection = [];
      ui.cipherStatus.textContent = `Checksum rejected • −${(config.penaltyMs / 1000).toFixed(1)}s`;
      audio.play('fail');
      renderCipherCells();
      return;
    }
    game.round++;
    game.transitioning = true;
    ui.cipherStatus.textContent = 'Checksum accepted';
    audio.tone(540 + game.round * 35, 0.1, 'sine', 0.055, 170);
    if (game.round >= config.goal) {
      finishCipher(true);
      return;
    }
    const token = game.token;
    setTimeout(() => {
      if (game.active && token === game.token) generateCipherRound();
    }, 260);
    renderArcade();
  }

  function finishCipher(success) {
    const game = runtime.cipher;
    if (!game.active) return;
    const config = CIPHER_DIFFICULTIES[game.difficulty];
    const elapsed = performance.now() - game.startedAt;
    game.active = false;
    game.transitioning = false;
    game.token++;
    ui.cipherStart.disabled = false;
    ui.cipherStart.textContent = 'START CIPHER';
    if (success) {
      const prior = Number.isFinite(state.minigames.cipherBest[game.difficulty])
        ? state.minigames.cipherBest[game.difficulty]
        : Infinity;
      state.minigames.cipherBest[game.difficulty] = Math.min(prior, elapsed);
      ui.cipherStatus.textContent = `${(elapsed / 1000).toFixed(2)}s solved`;
      addArcadeWin(config.reward, 'Cipher Sum', 'cipher', game.difficulty);
    } else {
      ui.cipherStatus.textContent = `Timeout at ${game.round}/${config.goal}`;
      state.minigames.streak = 0;
      markDirty();
      audio.play('fail');
    }
    renderCipherCells();
    renderArcade();
  }

  function randomizeStabilityTarget() {
    const game = runtime.stability;
    const config = STABILITY_DIFFICULTIES[game.difficulty || arcadeDifficulty('stability')];
    game.width = config.width;
    game.target = randomBetween(14, 86 - game.width);
    ui.stabilityTarget.style.left = `${game.target}%`;
    ui.stabilityTarget.style.width = `${game.width}%`;
  }

  function stabilityPosition(time) {
    const game = runtime.stability;
    if (!game.holding) return 0;
    const config = STABILITY_DIFFICULTIES[game.difficulty];
    const phase = ((time - game.holdStartedAt) % config.cycleMs) / config.cycleMs;
    return phase < 0.5 ? phase * 200 : 200 - phase * 200;
  }

  function stabilityPointerDown(event) {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    audio.ensure();
    const game = runtime.stability;
    if (!game.active) {
      game.difficulty = arcadeDifficulty('stability');
      game.active = true;
      game.attempts = 3;
      game.locks = 0;
      game.bestError = 1;
      randomizeStabilityTarget();
    }
    if (game.holding) return;
    game.holding = true;
    game.holdStartedAt = performance.now();
    ui.stabilityPad.classList.add('holding');
    $('span', ui.stabilityPad).textContent = 'RELEASE TO SEAL';
    ui.stabilityStatus.textContent = 'Pressure rising';
    try { ui.stabilityPad.setPointerCapture(event.pointerId); } catch (_) {}
    renderArcade();
  }

  function stabilityPointerUp(event) {
    const game = runtime.stability;
    if (!game.active || !game.holding) return;
    event.preventDefault();
    const config = STABILITY_DIFFICULTIES[game.difficulty];
    const position = stabilityPosition(performance.now());
    const center = game.target + game.width / 2;
    const error = Math.abs(position - center) / (game.width / 2);
    const hit = position >= game.target && position <= game.target + game.width;
    game.holding = false;
    game.attempts--;
    ui.stabilityPad.classList.remove('holding');
    $('span', ui.stabilityPad).textContent = 'HOLD PRESSURE';
    ui.stabilityFill.style.width = '0%';
    if (hit) {
      game.locks++;
      game.bestError = Math.min(game.bestError, error);
      ui.stabilityStatus.textContent = `${Math.round((1 - error) * 100)}% seal`;
      audio.tone(610, 0.13, 'triangle', 0.06, 210);
    } else {
      ui.stabilityStatus.textContent = 'Seal ruptured';
      audio.play('fail');
    }
    if (game.attempts <= 0) {
      game.active = false;
      if (game.locks > 0) {
        const score = Math.round((game.locks / 3) * 70 + (1 - game.bestError) * 30);
        state.minigames.stabilityBest[game.difficulty] = Math.max(safeInt(state.minigames.stabilityBest[game.difficulty]), score);
        addArcadeWin(game.locks * config.rewardPerLock, 'Pressure Seal', 'stability', game.difficulty);
      } else {
        state.minigames.streak = 0;
        markDirty();
      }
    } else {
      randomizeStabilityTarget();
    }
    renderArcade();
  }

  function rollAura() {
    audio.ensure();
    ensureModifiers();
    if (runtime.rng.scanning) return;
    if (state.rng.charge < 10) {
      toast('Scanner undercharged', mods.rngAutoCharge ? 'The Entropy Battery is recharging the capacitor.' : 'Manual presses refill the capacitor.');
      return;
    }
    state.rng.charge -= 10;
    state.rng.scans++;
    state.rng.pity++;
    runtime.rng.scanning = true;
    ui.rollAuraButton.disabled = true;
    ui.scannerAura.classList.add('scanning');
    ui.scannerAura.innerHTML = `<span>${fontAwesomeIcon('fa-satellite-dish', 'fa-beat-fade')}</span><strong>SCANNING</strong><small>READING ENTROPY</small>`;
    audio.tone(180, 0.65, 'sine', 0.04, 900);
    setTimeout(() => {
      const odds = calculateAuraOdds(state.rng.scans, state.rng.pity);
      let roll = Math.random() * 100;
      const available = AURAS.filter(item => odds.probabilities[item.id] > 0);
      const aura = available.find(item => (roll -= odds.probabilities[item.id]) <= 0) || available.at(-1);
      const isNew = !state.rng.discovered[aura.id];
      state.rng.discovered[aura.id] = safeInt(state.rng.discovered[aura.id]) + 1;
      state.rng.recent.push(RARITY_RANK[aura.tier]);
      state.rng.recent = state.rng.recent.slice(-12);
      if (RARITY_RANK[aura.tier] >= RARITY_RANK.Rare) state.rng.pity = 0;
      if (isNew) {
        state.resources.crystals += Math.max(1, RARITY_RANK[aura.tier]);
        logEvent('New frequency discovered', `${aura.name} • ${aura.tier} • ${aura.text}`, RARITY_RANK[aura.tier] >= 4 ? 'rare' : 'gold');
      } else {
        const refund = Math.max(1, RARITY_RANK[aura.tier]);
        state.resources.crystals += refund;
        toast('Duplicate converted', `${aura.name} became ${refund} crystal${refund === 1 ? '' : 's'}.`);
      }
      ui.scannerAura.classList.remove('scanning');
      runtime.rng.scanning = false;
      ui.scannerAura.style.setProperty('--aura-color', aura.color);
      ui.scannerAura.innerHTML = `<span style="color:${aura.color};border-color:${aura.color};box-shadow:0 0 32px ${aura.color}33">${fontAwesomeIcon(auraIconName(aura))}</span><strong>${aura.name.toUpperCase()}</strong><small style="color:${aura.color}">${aura.tier.toUpperCase()}</small>`;
      renderAuraCollection();
      markDirty();
      audio.play(RARITY_RANK[aura.tier] >= 3 ? 'reward' : 'buy');
    }, 850);
  }

  function equipAura(id) {
    if (!state.rng.discovered[id]) return;
    state.rng.equipped = state.rng.equipped === id ? null : id;
    markDirty();
    renderAuraCollection();
    updateRngUi();
    audio.play('buy');
  }

  function scheduleGolden() {
    state.golden.nextAt = Date.now() + 1000;
    state.golden.activeUntil = 0;
    savePending = true;
  }

  function goldenOneIn() {
    ensureModifiers();
    const rawOneIn = GOLDEN_ONE_IN / Math.max(0.0001, mods.goldenFrequency);
    const convergenceLevel = clamp(safeInt(state.ascension.nodes.goldenConvergence), 0, GOLDEN_CONVERGENCE_TARGETS.length - 1);
    return Math.max(GOLDEN_MIN_ONE_IN, Math.min(rawOneIn, GOLDEN_CONVERGENCE_TARGETS[convergenceLevel]));
  }

  function goldenChancePerSecond() {
    return 1 / goldenOneIn();
  }

  function rollGoldenChance() {
    scheduleGolden();
    if (!document.hidden && Math.random() < goldenChancePerSecond()) spawnGolden();
  }

  function spawnGolden({ rush = false, duration = 15000 } = {}) {
    if (document.hidden || state.ascension.inLimbo) return null;
    const glitched = Math.random() < 1 / GLITCHED_GOLDEN_ONE_IN;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${glitched ? 'golden-button glitched-button' : 'golden-button'}${rush ? ' rush-spawn' : ''}`;
    button.dataset.glitched = String(glitched);
    button.dataset.rush = String(rush);
    button.dataset.expiresAt = String(Date.now() + duration);
    button.setAttribute('aria-label', glitched ? 'Catch corrupted error 404 signal' : 'Catch golden signal');
    button.innerHTML = glitched
      ? '<span class="glitch-shard shard-a"></span><span class="glitch-shard shard-b"></span><span class="glitch-shard shard-c"></span><span class="glitch-shard shard-d"></span><strong>404</strong><em>ERR</em><small>15.0s</small>'
      : `<strong>${fontAwesomeIcon('fa-star')}</strong><small>15.0s</small>`;
    const layerRect = ui.goldenLayer.getBoundingClientRect();
    const buttonSize = glitched ? 126 : 100;
    button.style.left = `${randomBetween(8, Math.max(9, layerRect.width - buttonSize - 8))}px`;
    button.style.top = `${randomBetween(8, Math.max(9, layerRect.height - buttonSize - 34))}px`;
    button.addEventListener('click', catchGolden, { once: true });
    ui.goldenLayer.appendChild(button);
    goldenElements.add(button);
    if (glitched) {
      audio.play('glitchSpawn');
    } else if (!rush) {
      audio.play('goldenSpawnSelected');
    }
    return button;
  }

  function catchGolden(event) {
    const caughtElement = event.currentTarget;
    if (!goldenElements.has(caughtElement)) return;
    goldenElements.delete(caughtElement);
    audio.ensure();
    ensureModifiers();
    const glitched = caughtElement.dataset.glitched === 'true';
    const rushSpawn = caughtElement.dataset.rush === 'true';
    state.totals.golden++;
    const baseReward = Math.max(250, currentBps * 180 + currentClickPower * 60);
    const reward = baseReward * mods.goldenReward * (glitched ? 404 : 1);
    addButtons(reward);
    let surged = false;
    let rushTriggered = false;
    if (glitched) {
      const firstGlitchReward = !state.meta.glitchRewardSeen;
      state.totals.glitches++;
      state.resources.crystals += 33;
      activateGlitchEffect();
      if (!has(state.achievements.claimed, 'error404')) state.achievements.claimed.push('error404');
      state.meta.glitchRewardSeen = true;
      caughtElement.dataset.firstGlitchReward = String(firstGlitchReward);
    } else if (rushSpawn) {
      // Golden Rush contacts are intentionally pure instant-button rewards.
    } else if (Math.random() < 1 / GOLDEN_RUSH_ONE_IN) {
      activateGoldenRush();
      rushTriggered = true;
    } else if (Math.random() < 0.45) {
      const buff = { id: `surge-${Date.now()}`, name: 'Radiant surge', mult: 2, until: Date.now() + 30000 };
      state.buffs.push(buff);
      surged = true;
    } else {
      state.resources.crystals += 3;
    }
    caughtElement.classList.add('leaving');
    setTimeout(() => caughtElement.remove(), 360);
    markDirty();
    if (glitched) {
      audio.play('fail');
      logEvent('UNEXPECTED ERROR [CODE 404]', `Reality corrupted for 33 seconds: ×3,333 production, ${formatNumber(reward)} buttons, 33 crystals, and Permanent +4,040%.`, 'rare');
      if (caughtElement.dataset.firstGlitchReward === 'true') {
        showReward('Unexpected error occurred. [Code 404]', 'PERMANENT +4,040%', 'Reality is corrupted for 33 seconds. All production is temporarily multiplied by 3,333.');
      } else {
        toast('ERR_404 STATUS ACTIVE', '×3,333 production // 33 seconds • permanent reward already recorded', 'rare');
      }
    } else {
      audio.play('golden');
      const result = rushSpawn
        ? 'as an instant Golden Rush reward'
        : rushTriggered
          ? 'and initiated a Golden Rush'
          : surged
            ? 'and a radiant surge'
            : 'and 3 crystals';
      logEvent('Golden signal captured', `Recovered ${formatNumber(reward)} buttons ${result}.`, 'gold');
      if (!rushSpawn) toast(rushTriggered ? 'GOLDEN RUSH!' : 'Golden signal captured', rushTriggered ? 'Signals will flood the screen every 0.3 seconds.' : `+${formatNumber(reward)} buttons`, 'gold');
    }
  }

  function expireGolden(expiredElement) {
    if (!goldenElements.has(expiredElement)) return;
    goldenElements.delete(expiredElement);
    expiredElement.classList.add('leaving');
    setTimeout(() => expiredElement.remove(), 360);
    if (expiredElement.dataset.rush !== 'true') logEvent('Golden signal lost', 'The frequency collapsed before contact.', '');
  }

  function activateGoldenRush() {
    const until = Date.now() + GOLDEN_RUSH_DURATION_MS;
    state.buffs = state.buffs.filter(buff => buff.id !== 'goldenRush');
    state.buffs.push({ id: 'goldenRush', name: 'GOLDEN RUSH // SIGNAL STORM', mult: 1, until });
    runtime.goldenRush.active = true;
    runtime.goldenRush.nextSpawnAt = Date.now();
    logEvent('GOLDEN RUSH INITIATED', 'Pure instant-button golden signals will spawn every 0.3 seconds for 15 seconds.', 'gold');
  }

  function updateGoldenRush(now) {
    const active = state.buffs.some(buff => buff.id === 'goldenRush' && buff.until > now);
    if (!active) {
      if (runtime.goldenRush.active) logEvent('Golden Rush complete', 'The signal storm has returned to normal frequency.', 'good');
      runtime.goldenRush.active = false;
      runtime.goldenRush.nextSpawnAt = 0;
      return;
    }
    if (!runtime.goldenRush.active) {
      runtime.goldenRush.active = true;
      runtime.goldenRush.nextSpawnAt = now;
    }
    if (now >= runtime.goldenRush.nextSpawnAt) {
      spawnGolden({ rush: true, duration: 5000 });
      runtime.goldenRush.nextSpawnAt = now + GOLDEN_RUSH_INTERVAL_MS;
    }
  }

  function converterRecipeUnlocked(target) {
    if (target === 'buttons') return true;
    if (target === 'charge') return has(state.converter.upgrades, 'spectrumGate') || state.ascension.nodes.crystalDrill >= 2;
    if (target === 'cores') return state.ascension.nodes.coreAlchemy >= 1;
    return false;
  }

  function converterRecipeLock(target) {
    if (target === 'charge') return 'REQUIRES SPECTRUM GATE OR CRYSTAL DRILL MEMORY II';
    if (target === 'cores') return 'REQUIRES HEAVENLY CORE ALCHEMY';
    return '';
  }

  function converterPreview(target = state.converter.target, inputValue = state.converter.input) {
    ensureModifiers();
    const input = clamp(safeInt(inputValue, 1), 1, 1e9);
    const effectiveInput = input * mods.converterEfficiency;
    const logarithmicTime = Math.log10(input + 1) * 4;
    if (target === 'charge') {
      const output = Math.max(0, Math.min(100 - state.rng.charge, Math.floor(effectiveInput * 6 * mods.converterYield)));
      return { input, output, duration: (10 + logarithmicTime) / mods.converterSpeed, unit: 'SCANNER CHARGE' };
    }
    if (target === 'cores') {
      const crystalCost = Math.max(250, Math.ceil(5000 / (mods.converterEfficiency * Math.sqrt(mods.converterYield))));
      const output = Math.floor(input / crystalCost);
      return { input, output, duration: (45 + Math.max(0, output - 1) * 6 + logarithmicTime) / mods.converterSpeed, unit: 'HEAVENLY CORES', crystalCost };
    }
    const basePerCrystal = Math.max(500, currentClickPower * 40 + currentBps * 25);
    const output = effectiveInput * basePerCrystal * mods.converterYield;
    return { input, output, duration: (12 + logarithmicTime) / mods.converterSpeed, unit: 'BUTTONS' };
  }

  function converterOutputLabel(target, output) {
    if (target === 'charge') return `${formatNumber(output, 0)} CHARGE`;
    if (target === 'cores') return `${formatNumber(output, 0)} CORE${output === 1 ? '' : 'S'}`;
    return `${formatNumber(output)} BUTTONS`;
  }

  function buildConverterUi() {
    if (!ui.converterRecipeList || ui.converterRecipeList.dataset.ready) return;
    ui.converterRecipeList.dataset.ready = 'true';
    ui.converterRecipeList.innerHTML = CONVERTER_RECIPES.map(recipe => `
      <button class="converter-recipe" type="button" data-converter-target="${recipe.id}">
        <span>${fontAwesomeIcon(recipe.id === 'buttons' ? 'fa-coins' : recipe.id === 'charge' ? 'fa-bolt' : 'fa-atom')}</span>
        <div><strong>${recipe.name}</strong><small>${recipe.detail}</small><em data-converter-recipe-status></em></div>
        <i data-converter-recipe-output></i>
      </button>`).join('');
    converterRecipeRefs = Object.fromEntries(CONVERTER_RECIPES.map(recipe => {
      const card = ui.converterRecipeList.querySelector(`[data-converter-target="${recipe.id}"]`);
      return [recipe.id, {
        card,
        status: $('[data-converter-recipe-status]', card),
        output: $('[data-converter-recipe-output]', card)
      }];
    }));

    ui.converterUpgradeList.innerHTML = CONVERTER_UPGRADES.map(upgrade => `
      <article class="converter-upgrade" data-converter-upgrade-card="${upgrade.id}">
        <span>${fontAwesomeIcon(upgrade.effect?.kind === 'converterSpeed' ? 'fa-gauge-high' : upgrade.effect?.kind === 'converterYield' ? 'fa-coins' : upgrade.effect?.kind === 'converterEfficiency' ? 'fa-scale-balanced' : upgrade.unlock ? 'fa-lock-open' : 'fa-screwdriver-wrench')}</span>
        <div><strong>${upgrade.name}</strong><p>${upgrade.detail}</p><small data-converter-upgrade-state>CRYSTAL UPGRADE</small></div>
        <button type="button" data-buy-converter-upgrade="${upgrade.id}"></button>
      </article>`).join('');
    converterUpgradeRefs = Object.fromEntries(CONVERTER_UPGRADES.map(upgrade => {
      const card = ui.converterUpgradeList.querySelector(`[data-converter-upgrade-card="${upgrade.id}"]`);
      return [upgrade.id, {
        card,
        state: $('[data-converter-upgrade-state]', card),
        button: $('[data-buy-converter-upgrade]', card)
      }];
    }));
  }

  function updateConverterUi(now = Date.now()) {
    if (!ui.converterRecipeList) return;
    buildConverterUi();
    ensureModifiers();
    const active = state.converter.active;
    const selectedPreview = converterPreview(state.converter.target, state.converter.input);
    ui.converterJobs.textContent = formatNumber(state.totals.converterJobs, 0);
    ui.converterSpent.textContent = formatNumber(state.totals.convertedCrystals, 0);
    ui.converterCrystalBalance.textContent = formatNumber(state.resources.crystals, 0);
    ui.converterYield.textContent = `×${mods.converterYield.toFixed(2)}`;
    ui.converterSpeed.textContent = `×${mods.converterSpeed.toFixed(2)}`;
    ui.converterEfficiency.textContent = `×${mods.converterEfficiency.toFixed(2)}`;
    if (document.activeElement !== ui.converterInput) ui.converterInput.value = state.converter.input;

    for (const recipe of CONVERTER_RECIPES) {
      const refs = converterRecipeRefs[recipe.id];
      if (!refs) continue;
      const unlocked = converterRecipeUnlocked(recipe.id);
      const preview = converterPreview(recipe.id, state.converter.input);
      refs.card.classList.toggle('selected', state.converter.target === recipe.id);
      refs.card.classList.toggle('locked', !unlocked);
      refs.card.disabled = !unlocked || Boolean(active);
      refs.status.textContent = unlocked
        ? recipe.id === 'cores'
          ? `${formatNumber(preview.crystalCost, 0)} CRYSTALS / CORE`
          : `${formatDuration(preview.duration)} CYCLE`
        : converterRecipeLock(recipe.id);
      refs.output.textContent = unlocked ? converterOutputLabel(recipe.id, preview.output) : 'LOCKED';
    }

    for (const upgrade of CONVERTER_UPGRADES) {
      const refs = converterUpgradeRefs[upgrade.id];
      if (!refs) continue;
      const owned = has(state.converter.upgrades, upgrade.id);
      const affordable = state.resources.crystals >= upgrade.cost;
      refs.card.classList.toggle('owned', owned);
      refs.card.classList.toggle('affordable', !owned && affordable);
      refs.card.classList.toggle('needs-crystals', !owned && !affordable);
      refs.state.textContent = owned ? 'INSTALLED' : affordable ? 'BUY NOW' : 'NEED CRYSTALS';
      refs.button.disabled = owned || !affordable;
      refs.button.textContent = owned ? 'INSTALLED' : `${formatNumber(upgrade.cost, 0)} ◆`;
    }

    if (active) {
      const recipe = CONVERTER_RECIPES.find(item => item.id === active.target);
      const elapsed = clamp((now - active.startedAt) / Math.max(1, active.endsAt - active.startedAt), 0, 1);
      ui.converterStatus.textContent = 'MINING ACTIVE';
      ui.converterProgressFill.style.width = `${elapsed * 100}%`;
      ui.converterProgressText.textContent = `${formatDuration(Math.ceil(Math.max(0, active.endsAt - now) / 1000))} REMAINING`;
      ui.converterActiveTarget.textContent = recipe?.name || active.target;
      ui.converterActiveOutput.textContent = converterOutputLabel(active.target, active.output);
      ui.converterStartButton.disabled = true;
      ui.converterStartButton.textContent = 'MINING IN PROGRESS';
      ui.converterCancelButton.disabled = false;
    } else {
      const unlocked = converterRecipeUnlocked(state.converter.target);
      const affordable = state.resources.crystals >= state.converter.input;
      const hasOutput = selectedPreview.output > 0;
      ui.converterStatus.textContent = 'CHAMBER READY';
      ui.converterProgressFill.style.width = '0%';
      ui.converterProgressText.textContent = `${formatDuration(selectedPreview.duration)} ESTIMATED`;
      ui.converterActiveTarget.textContent = CONVERTER_RECIPES.find(recipe => recipe.id === state.converter.target)?.name || 'Button Ore';
      ui.converterActiveOutput.textContent = converterOutputLabel(state.converter.target, selectedPreview.output);
      ui.converterStartButton.disabled = !unlocked || !affordable || !hasOutput;
      ui.converterStartButton.textContent = !unlocked
        ? 'RECIPE LOCKED'
        : !hasOutput
          ? state.converter.target === 'cores'
            ? `NEED ${formatNumber(selectedPreview.crystalCost, 0)} CRYSTALS`
            : 'OUTPUT STORAGE FULL'
          : !affordable
            ? 'NEED MORE CRYSTALS'
            : `START WITH ${formatNumber(state.converter.input, 0)} ◆`;
      ui.converterCancelButton.disabled = true;
    }
  }

  function setConverterInput(value) {
    state.converter.input = clamp(safeInt(value, 1), 1, 1e9);
    savePending = true;
    updateConverterUi();
  }

  function startConverterJob() {
    if (state.converter.active || !converterRecipeUnlocked(state.converter.target)) return;
    const input = clamp(safeInt(ui.converterInput.value, state.converter.input), 1, 1e9);
    state.converter.input = input;
    const preview = converterPreview(state.converter.target, input);
    if (preview.output <= 0) {
      toast('Converter cannot start', state.converter.target === 'cores' ? `This recipe requires at least ${formatNumber(preview.crystalCost, 0)} crystals.` : 'The selected output storage is already full.');
      return;
    }
    if (state.resources.crystals < input) {
      toast('Insufficient crystals', `${formatNumber(input - state.resources.crystals, 0)} more required.`);
      return;
    }
    state.resources.crystals -= input;
    const startedAt = Date.now();
    state.converter.active = {
      target: state.converter.target,
      input,
      output: preview.output,
      startedAt,
      endsAt: startedAt + Math.max(1000, preview.duration * 1000)
    };
    markDirty();
    audio.play('buy');
    logEvent('Crystal mining started', `${formatNumber(input, 0)} crystals are being refined into ${converterOutputLabel(state.converter.target, preview.output)}.`, 'good');
    updateConverterUi(startedAt);
  }

  function completeConverterJob() {
    const job = state.converter.active;
    if (!job) return;
    state.converter.active = null;
    if (job.target === 'charge') state.rng.charge = clamp(state.rng.charge + job.output, 0, 100);
    else if (job.target === 'cores') state.resources.cores += safeInt(job.output);
    else addButtons(job.output);
    state.totals.converterJobs++;
    state.totals.convertedCrystals += job.input;
    markDirty();
    audio.play('reward');
    const result = converterOutputLabel(job.target, job.output);
    logEvent('Crystal conversion complete', `${result} recovered from ${formatNumber(job.input, 0)} crystals.`, 'gold');
    toast('Mining cycle complete', `+${result}`, 'gold');
    updateConverterUi();
  }

  function updateConverter(now) {
    if (state.converter.active && now >= state.converter.active.endsAt) completeConverterJob();
  }

  function cancelConverterJob() {
    const job = state.converter.active;
    if (!job) return;
    state.resources.crystals += job.input;
    state.converter.active = null;
    markDirty();
    logEvent('Mining cycle canceled', `${formatNumber(job.input, 0)} crystals returned to storage.`, '');
    updateConverterUi();
  }

  function buyConverterUpgrade(id) {
    const upgrade = CONVERTER_UPGRADES.find(item => item.id === id);
    if (!upgrade || has(state.converter.upgrades, id) || state.resources.crystals < upgrade.cost) return;
    state.resources.crystals -= upgrade.cost;
    state.converter.upgrades.push(id);
    markDirty();
    audio.play('buy');
    logEvent('Converter upgrade installed', `${upgrade.name} // ${upgrade.detail}`, 'gold');
    toast('Converter upgraded', upgrade.name, 'gold');
    updateConverterUi();
  }

  function activateGlitchEffect() {
    const until = Date.now() + GLITCH_DURATION_MS;
    state.buffs = state.buffs.filter(buff => buff.id !== 'glitch404');
    state.buffs.push({
      id: 'glitch404',
      name: 'ERR_404 // REALITY CORRUPTED',
      mult: GLITCH_MULTIPLIER,
      until
    });
    runtime.glitch.active = false;
    updateGlitchStatus(Date.now());
  }

  function updateGlitchStatus(now) {
    const activeBuff = state.buffs.find(buff => buff.id === 'glitch404' && buff.until > now);
    if (activeBuff) {
      if (!runtime.glitch.active) {
        if (runtime.glitch.expiryTimer) clearTimeout(runtime.glitch.expiryTimer);
        runtime.glitch.active = true;
        runtime.glitch.burst = false;
        runtime.glitch.fading = false;
        runtime.glitch.nextBurstAt = now + GLITCH_BURST_INTERVAL_MS;
        document.body.classList.remove('glitch-burst');
        document.body.classList.add('glitch-mode');
        audio.startGlitch();
        audio.setGlitchBurst(false);
        runtime.glitch.expiryTimer = setTimeout(() => {
          state.buffs = state.buffs.filter(buff => buff.id !== 'glitch404' || buff.until > Date.now());
          updateGlitchStatus(Date.now());
          markDirty();
        }, Math.max(0, activeBuff.until - now) + 25);
      }
      const remaining = activeBuff.until - now;
      if (remaining <= GLITCH_FADE_MS && !runtime.glitch.fading) {
        runtime.glitch.fading = true;
        runtime.glitch.burst = false;
        document.body.classList.remove('glitch-burst');
        audio.setGlitchBurst(false);
        audio.fadeOutGlitch(remaining);
      }
      if (!runtime.glitch.fading && !runtime.glitch.burst && now >= runtime.glitch.nextBurstAt) {
        runtime.glitch.burst = true;
        runtime.glitch.burstUntil = now + randomBetween(140, 520);
        runtime.glitch.nextBurstAt = now + GLITCH_BURST_INTERVAL_MS;
        document.body.style.setProperty('--glitch-x', `${randomBetween(-9, 9).toFixed(2)}px`);
        document.body.style.setProperty('--glitch-y', `${randomBetween(-6, 6).toFixed(2)}px`);
        document.body.style.setProperty('--glitch-skew', `${randomBetween(-1.8, 1.8).toFixed(2)}deg`);
        document.body.classList.add('glitch-burst');
        audio.setGlitchBurst(true);
      } else if (runtime.glitch.burst && now >= runtime.glitch.burstUntil) {
        runtime.glitch.burst = false;
        document.body.classList.remove('glitch-burst');
        audio.setGlitchBurst(false);
      }
      return;
    }

    if (!runtime.glitch.active) return;
    runtime.glitch.active = false;
    runtime.glitch.burst = false;
    runtime.glitch.fading = false;
    if (runtime.glitch.expiryTimer) clearTimeout(runtime.glitch.expiryTimer);
    runtime.glitch.expiryTimer = null;
    document.body.classList.remove('glitch-mode', 'glitch-burst');
    document.body.style.removeProperty('--glitch-x');
    document.body.style.removeProperty('--glitch-y');
    document.body.style.removeProperty('--glitch-skew');
    audio.stopGlitch();
    logEvent('Reality checksum restored', 'The 404 corruption has cleared. Production and Reactor Radio are nominal.', 'good');
    toast('SYSTEM RESTORED', 'Glitch status has expired.', 'good');
  }

  function discoverSecret(id) {
    const secret = SECRETS.find(item => item.id === id);
    if (!secret || has(state.secrets.found, id)) return;
    state.secrets.found.push(id);
    state.resources.crystals += 5;
    markDirty();
    audio.play('golden');
    logEvent('Restricted signal recovered', `${secret.name} • Critical chance +2.5%`, 'rare');
    showReward(secret.name, '+2.5% CRITICAL', 'A secret route toward the 75% critical cap is now permanently active.');
  }

  function ascensionPotential() {
    return Math.floor(Math.sqrt(state.totals.runButtons / ASCENSION_THRESHOLD));
  }

  function completeAscension(gain) {
    if (state.converter.active) {
      state.resources.crystals += state.converter.active.input;
      state.converter.active = null;
    }
    state.resources.cores += gain;
    state.totals.ascensions++;
    state.resources.buttons = 0;
    state.totals.runButtons = 0;
    for (const tower of TOWERS) state.towers[tower.id] = 0;
    state.upgrades = [];
    state.rng.charge = 0;
    state.buffs = [];
    state.ascension.inLimbo = true;
    combo = 0;
    for (const golden of goldenElements) golden.remove();
    goldenElements.clear();
    runtime.goldenRush.active = false;
    runtime.goldenRush.nextSpawnAt = 0;
    state.golden.activeUntil = 0;
    markDirty();
    saveNow();
    logEvent('Reactor memory recovered', `${gain} Heavenly Core${gain === 1 ? '' : 's'} transferred. Choose permanent circuitry before the next boot.`, 'rare');
  }

  async function playAscensionCutscene(gain) {
    if (runtime.ascension.playing) return;
    runtime.ascension.playing = true;
    audio.ensure();
    audio.beginCutscene();
    const overlay = ui.ascensionCutscene;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.className = 'ascension-cutscene active approach';
    ui.cutsceneStatus.textContent = 'APPROACHING REACTOR CORE';
    await delay(900);
    overlay.className = 'ascension-cutscene active shutdown';
    ui.cutsceneStatus.textContent = 'PRESSURE SYSTEM SHUTTING DOWN';
    audio.play('shutdown');
    await delay(1250);
    overlay.className = 'ascension-cutscene active blackout';
    ui.cutsceneStatus.textContent = 'SIGNAL LOST';
    await delay(650);
    completeAscension(gain);
    showPage('ascension');
    renderAll();
    requestAnimationFrame(() => resetTreeView());
    ui.cutsceneStatus.textContent = `${gain} CORE${gain === 1 ? '' : 'S'} RECOVERED // CIRCUIT ACCESS GRANTED`;
    await delay(500);
    overlay.className = 'ascension-cutscene active complete';
    await delay(450);
    overlay.className = 'ascension-cutscene';
    overlay.setAttribute('aria-hidden', 'true');
    audio.endCutscene();
    runtime.ascension.playing = false;
  }

  async function ascend() {
    const gain = ascensionPotential();
    if (!gain || runtime.ascension.playing) return;
    runtime.ascension.pendingGain = gain;
    ui.ascensionConfirmGain.textContent = formatNumber(gain, 0);
    ui.ascensionConfirmDialog.returnValue = '';
    if (!ui.ascensionConfirmDialog.open) ui.ascensionConfirmDialog.showModal();
  }

  async function confirmAscension() {
    if (runtime.ascension.playing) return;
    const gain = ascensionPotential();
    runtime.ascension.pendingGain = 0;
    ui.ascensionConfirmDialog.close();
    if (!gain) return;
    await playAscensionCutscene(gain);
  }

  function completeNewCycle() {
    ensureModifiers();
    state.ascension.inLimbo = false;
    state.resources.buttons = mods.startButtons;
    state.totals.runButtons = mods.startButtons;
    scheduleGolden();
    markDirty();
    saveNow();
    logEvent('New cycle online', 'Permanent Heavenly Circuit upgrades restored successfully.', 'good');
    showPage('core');
    renderAll();
  }

  async function beginNewCycle() {
    if (!state.ascension.inLimbo || runtime.ascension.playing) return;
    runtime.ascension.playing = true;
    audio.ensure();
    audio.beginCutscene();
    const overlay = ui.ascensionCutscene;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.className = 'ascension-cutscene active blackout';
    ui.cutsceneStatus.textContent = 'COMMITTING HEAVENLY MEMORY';
    await delay(450);
    completeNewCycle();
    overlay.className = 'ascension-cutscene active reboot';
    ui.rebootStatus.textContent = 'PERMANENT CIRCUIT VERIFIED // STARTING NEW CYCLE';
    audio.play('reboot');
    await delay(1700);
    overlay.className = 'ascension-cutscene active complete';
    await delay(450);
    overlay.className = 'ascension-cutscene';
    overlay.setAttribute('aria-hidden', 'true');
    audio.endCutscene();
    audio.play('reward');
    runtime.ascension.playing = false;
  }

  function coreNodeCost(node, level = state.ascension.nodes[node.id]) {
    return Math.ceil(node.baseCost * Math.pow(CORE_COST_GROWTH, level));
  }

  function coreNodeUnlocked(node) {
    if ((state.ascension.nodes[node.id] || 0) > 0) return true;
    return Object.entries(node.requires || {}).every(([id, level]) => state.ascension.nodes[id] >= level);
  }

  function buyCoreNode(id) {
    const node = CORE_NODES.find(item => item.id === id);
    if (!node) return;
    const level = state.ascension.nodes[id];
    const cost = coreNodeCost(node, level);
    if (!coreNodeUnlocked(node) || level >= node.max || state.resources.cores < cost) return;
    state.resources.cores -= cost;
    state.ascension.spentCores += cost;
    state.ascension.nodes[id]++;
    markDirty();
    renderCoreTree();
    updateAscensionUi();
    applySettings();
    audio.play('buy');
    if (id === 'musicPlayer') {
      logEvent('Heavenly Jukebox online', `${audio.tracks.length} music tracks and ${JUKEBOX_SOUNDS.length} Reactor sounds are ready to control.`, 'gold');
      toast('Jukebox unlocked', 'Music and sound libraries are now available in the HUD.', 'gold');
    }
  }

  function saveNow() {
    try {
      state.meta.lastSave = Date.now();
      state.version = VERSION;
      state.ui.buyMode = buyMode;
      const serialized = JSON.stringify(state);
      const previous = localStorage.getItem(SAVE_KEY);
      if (previous) localStorage.setItem(BACKUP_KEY, previous);
      localStorage.setItem(SAVE_KEY, serialized);
      savePending = false;
      lastSaveAt = performance.now();
      if (ui.saveStatus) {
        ui.saveStatus.textContent = 'SAVED NOW';
        setTimeout(() => { if (ui.saveStatus) ui.saveStatus.textContent = 'AUTO-SAVED'; }, 1600);
      }
      return true;
    } catch (error) {
      console.error('Save failed.', error);
      toast('Save failed', 'Local storage may be full or disabled.');
      return false;
    }
  }

  function stringToBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    }
    return btoa(binary);
  }

  function base64ToString(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  }

  function exportSave() {
    saveNow();
    ui.saveData.value = `BR2.${stringToBase64(JSON.stringify(state))}`;
    ui.saveData.focus();
    ui.saveData.select();
    navigator.clipboard?.writeText(ui.saveData.value).then(() => toast('Save copied', 'Portable backup copied to your clipboard.')).catch(() => toast('Save exported', 'Copy the text from the save vault.'));
  }

  function importSave() {
    const text = ui.saveData.value.trim();
    if (!text) return toast('Nothing to import', 'Paste a BUTTON // REACTOR save first.');
    try {
      const decoded = text.startsWith('BR2.') ? base64ToString(text.slice(4)) : text;
      const parsed = JSON.parse(decoded);
      const imported = parsed.version?.startsWith('2.') ? mergeV2State(parsed) : migrateLegacy(parsed, 'manual import');
      localStorage.setItem(BACKUP_KEY, localStorage.getItem(SAVE_KEY) || '');
      localStorage.setItem(SAVE_KEY, JSON.stringify(imported));
      location.reload();
    } catch (_) {
      toast('Import rejected', 'That save is incomplete or not valid.');
    }
  }

  function resetSave() {
    if (!window.confirm('Reset all BUTTON // REACTOR progress on this device? This cannot be undone unless you exported a backup.')) return;
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(BACKUP_KEY);
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    } finally {
      location.reload();
    }
  }

  function grantOfflineProgress() {
    const elapsed = clamp((Date.now() - finite(state.meta.lastSave, Date.now())) / 1000, 0, MAX_OFFLINE_SECONDS);
    if (elapsed < 30) return;
    ensureModifiers();
    const gain = currentBps * elapsed * mods.offline;
    if (gain <= 0) return;
    addButtons(gain);
    logEvent('Offline capacitor discharged', `${formatNumber(gain)} buttons recovered from ${formatDuration(elapsed)} away at ${Math.round(mods.offline * 100)}% efficiency.`, 'good');
    toast('Welcome back', `+${formatNumber(gain)} offline buttons`);
  }

  function showPage(id) {
    if (state.ascension.inLimbo) id = 'ascension';
    if (!NAV_ITEMS.some(item => item.id === id)) return;
    $$('.page').forEach(page => page.classList.toggle('active', page.dataset.page === id));
    $$('.nav-button[data-page-target]').forEach(button => {
      const active = button.dataset.pageTarget === id;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    state.ui.page = id;
    savePending = true;
    ui.workspace?.scrollTo?.({ top: 0, behavior: state.settings.motion === 'off' ? 'auto' : 'smooth' });
    if (id === 'upgrades') updateUpgradeCards();
    if (id === 'towers') updateTowerList();
    if (id === 'achievements') renderAchievements();
    if (id === 'observatory') {
      renderAuraCollection();
      updateAuraOdds();
    }
    if (id === 'ascension' && state.ascension.inLimbo) requestAnimationFrame(() => runtime.tree.initialized ? applyTreeTransform() : resetTreeView());
    if (id === 'system') renderSystemStats();
  }

  function logEvent(title, text, tone = '') {
    const entry = document.createElement('article');
    entry.className = `log-entry ${tone}`.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    entry.innerHTML = `<strong>${title}</strong><p>${text}</p><time>${time}</time>`;
    ui.eventLog.prepend(entry);
    while (ui.eventLog.children.length > 45) ui.eventLog.lastElementChild.remove();
  }

  function toast(title, text, tone = '') {
    const item = document.createElement('div');
    item.className = `toast ${tone}`.trim();
    item.innerHTML = `<span>${fontAwesomeIcon(tone === 'gold' ? 'fa-star' : tone === 'rare' ? 'fa-burst' : 'fa-circle-info')}</span><div><strong>${title}</strong><p>${text}</p></div>`;
    ui.toastStack.appendChild(item);
    while (ui.toastStack.children.length > 4) ui.toastStack.firstElementChild.remove();
    const exitDuration = state.settings.motion === 'off' ? 0 : 260;
    const totalDuration = state.settings.fastNotes ? 1000 : 3560;
    setTimeout(() => {
      item.classList.add('out');
      setTimeout(() => item.remove(), exitDuration);
    }, totalDuration - exitDuration);
  }

  function showReward(title, amount, description) {
    ui.rewardTitle.textContent = title;
    ui.rewardAmount.textContent = amount;
    ui.rewardDescription.textContent = description;
    if (ui.rewardDialog.open) ui.rewardDialog.close();
    ui.rewardDialog.showModal();
  }

  function updateTopUi() {
    ensureModifiers();
    const buffMultiplier = activeBuffMultiplier();
    const liveBps = currentBps * buffMultiplier;
    const comboMultiplier = 1 + combo * 0.05;
    ui.buttons.textContent = formatNumber(state.resources.buttons);
    ui.bps.textContent = formatNumber(liveBps);
    ui.crystals.textContent = formatNumber(state.resources.crystals, 0);
    ui.cores.textContent = formatNumber(state.resources.cores, 0);
    ui.buttonsDelta.textContent = liveBps > 0 ? `+${formatNumber(liveBps)}/S` : 'READY';
    ui.pressValue.textContent = `+${formatNumber(currentClickPower * comboMultiplier)}`;
    ui.clickPower.textContent = formatNumber(currentClickPower);
    ui.clickBreakdown.textContent = `Base ${formatNumber(mods.clickBase)} × system ${formatNumber(mods.clickMult * mods.global)}`;
    ui.comboValue.textContent = `×${comboMultiplier.toFixed(2)}`;
    ui.comboFill.style.width = `${combo / 20 * 100}%`;

    const crit = criticalProgress();
    const critPercent = crit.chance * 100;
    ui.critChance.textContent = `${critPercent.toFixed(2)}%`;
    ui.critFill.style.width = `${crit.chance / CRIT_CAP * 100}%`;
    ui.critMethods.textContent = `${crit.methods} / 38 methods`;
    const nextMethodPercent = clamp((crit.chance + 0.005) / CRIT_CAP * 100, 0, 100);
    ui.critNextMarker.style.left = `${nextMethodPercent}%`;

    ui.totalClicks.textContent = formatNumber(state.totals.clicks);
    ui.criticalClicks.textContent = `${formatNumber(state.totals.crits)} critical`;
    ui.totalButtons.textContent = formatNumber(state.totals.buttons);
    ui.towerCount.textContent = formatNumber(totalTowers());
    ui.towerShare.textContent = `${liveBps > 0 ? 100 : 0}% of passive output`;
    ui.goldenCount.textContent = formatNumber(state.totals.golden);
    if (goldenElements.size) {
      let glitchedCount = 0;
      for (const golden of goldenElements) {
        const left = Math.max(0, (Number(golden.dataset.expiresAt) - Date.now()) / 1000);
        if (golden.dataset.glitched === 'true') glitchedCount++;
        const timer = $('small', golden);
        if (timer) timer.textContent = `${left.toFixed(1)}s`;
      }
      ui.goldenEta.textContent = `${goldenElements.size} SIGNAL${goldenElements.size === 1 ? '' : 'S'} LIVE${glitchedCount ? ` • ${glitchedCount} ERR_404` : ''}`;
    } else {
      const effectiveOneIn = Math.round(goldenOneIn());
      ui.goldenEta.textContent = `1 / ${effectiveOneIn.toLocaleString('en-US')} EACH SECOND`;
    }

    ui.chartRate.textContent = formatNumber(liveBps);
    ui.bestRate.textContent = `BEST ${formatNumber(state.totals.bestBps)}/s`;
    const previous = chartSamples.at(-2) || 0;
    const trend = previous > 0 ? (liveBps - previous) / previous : 0;
    ui.chartTrend.textContent = trend > 0.01 ? `▲ ${(trend * 100).toFixed(1)}%` : trend < -0.01 ? `▼ ${Math.abs(trend * 100).toFixed(1)}%` : 'STABLE';
    ui.chartTrend.style.color = trend < -0.01 ? 'var(--rose)' : 'var(--success)';

    ui.activeBuffs.innerHTML = state.buffs
      .filter(buff => buff.until > Date.now())
      .map(buff => `<span class="buff-chip ${buff.id === 'goldenRush' ? 'golden-rush' : ''}"><b>${buff.id === 'goldenRush' ? fontAwesomeIcon('fa-star') : `×${buff.mult}`}</b> ${buff.name} • ${formatDuration((buff.until - Date.now()) / 1000)}</span>`)
      .join('');
  }

  function updateObjective() {
    const next = ACHIEVEMENTS.find(item => !has(state.achievements.claimed, item.id)) || ACHIEVEMENTS.at(-1);
    const value = achievementMetric(next);
    const progress = clamp(value / next.target, 0, 1);
    ui.objectiveTitle.textContent = next.name;
    ui.objectiveText.textContent = next.desc;
    ui.objectiveReward.textContent = rewardLabel(next.reward);
    ui.objectiveFill.style.width = `${progress * 100}%`;
    ui.objectiveCount.textContent = `${formatNumber(Math.min(value, next.target))} / ${formatNumber(next.target)}`;
  }

  function renderUpgrades() {
    const search = (ui.upgradeSearch?.value || '').trim().toLowerCase();
    let items = UPGRADES.filter(item => {
      if (upgradeCategory !== 'all' && item.category !== upgradeCategory) return false;
      if (search && !`${item.name} ${item.desc} ${item.effectText}`.toLowerCase().includes(search)) return false;
      return true;
    });
    if ((ui.upgradeStatus?.value || 'available') === 'available') {
      items.sort((a, b) => {
        const rank = item => has(state.upgrades, item.id) ? 3 : !upgradeUnlocked(item) ? 2 : state.resources.buttons >= item.cost ? 0 : 1;
        return rank(a) - rank(b) || a.cost - b.cost;
      });
    }

    ui.upgradesGrid.innerHTML = items.map(item => {
      return `
        <article class="upgrade-card" data-upgrade="${item.id}" data-category="${item.category}">
          <div class="upgrade-icon">${fontAwesomeIcon(upgradeIconName(item))}</div>
          <div class="upgrade-copy">
            <div class="upgrade-meta"><b>${item.category.toUpperCase()}</b><span data-upgrade-state>AVAILABLE</span></div>
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <span class="upgrade-effect">${item.effectText}</span>
          </div>
          <button class="upgrade-action" type="button" data-buy-upgrade="${item.id}">0</button>
          <div class="lock-progress hidden" data-upgrade-lock><i></i></div>
        </article>`;
    }).join('');
    upgradeRefs = Object.fromEntries(items.map(item => {
      const card = ui.upgradesGrid.querySelector(`[data-upgrade="${item.id}"]`);
      return [item.id, {
        card,
        state: $('[data-upgrade-state]', card),
        action: $('[data-buy-upgrade]', card),
        lock: $('[data-upgrade-lock]', card),
        lockFill: $('[data-upgrade-lock] i', card)
      }];
    }));
    updateUpgradeCards();
  }

  function updateUpgradeCards() {
    const status = ui.upgradeStatus?.value || 'available';
    let visibleCount = 0;
    for (const item of UPGRADES) {
      const refs = upgradeRefs[item.id];
      if (!refs) continue;
      const owned = has(state.upgrades, item.id);
      const unlocked = upgradeUnlocked(item);
      const affordable = state.resources.buttons >= item.cost;
      const metric = upgradeUnlockMetric(item);
      const progress = clamp(metric.value / metric.target, 0, 1);
      const visible =
        status === 'all' ||
        (status === 'owned' && owned) ||
        (status === 'locked' && !owned && !unlocked) ||
        (status === 'affordable' && !owned && unlocked && affordable) ||
        (status === 'available' && !owned);
      refs.card.classList.toggle('hidden', !visible);
      refs.card.classList.toggle('owned', owned);
      refs.card.classList.toggle('locked', !owned && !unlocked);
      refs.card.classList.toggle('affordable', !owned && unlocked && affordable);
      refs.card.classList.toggle('needs-buttons', !owned && unlocked && !affordable);
      refs.state.textContent = owned ? 'INSTALLED' : !unlocked ? metric.label.toUpperCase() : affordable ? 'BUY NOW' : 'NEED BUTTONS';
      refs.action.textContent = owned ? 'INSTALLED' : !unlocked ? 'LOCKED' : affordable ? `BUY ${formatNumber(item.cost)}` : formatNumber(item.cost);
      refs.action.disabled = owned || !unlocked || !affordable;
      refs.lock.classList.toggle('hidden', unlocked || owned);
      refs.lockFill.style.width = `${progress * 100}%`;
      if (visible) visibleCount++;
    }
    ui.upgradesEmpty.classList.toggle('hidden', visibleCount > 0);
    ui.upgradeSummary.textContent = `${visibleCount} modification${visibleCount === 1 ? '' : 's'} shown • ${UPGRADES.length - state.upgrades.length} remaining`;
    const affordableCount = UPGRADES.filter(item => !has(state.upgrades, item.id) && upgradeUnlocked(item) && state.resources.buttons >= item.cost).length;
    ui.upgradeNavBadge.textContent = affordableCount;
    ui.upgradeNavBadge.classList.toggle('hidden', affordableCount === 0);
    ui.upgradeProgress.textContent = `${state.upgrades.length} / ${UPGRADES.length}`;
    ui.upgradeProgressFill.style.width = `${state.upgrades.length / UPGRADES.length * 100}%`;
  }

  function buildTowerList() {
    ui.towersList.innerHTML = TOWERS.map((tower, index) => `
      <article class="tower-card" data-tower="${tower.id}">
        <span class="tower-rank">${String(index + 1).padStart(2, '0')}</span>
        <div class="tower-icon">${fontAwesomeIcon(TOWER_FONT_ICONS[tower.id] || 'fa-building')}</div>
        <div class="tower-name"><h3>${tower.name}</h3><p>${tower.desc}</p><span data-tower-next>Next mastery at 25</span></div>
        <div class="tower-contribution">
          <div><span>NETWORK SHARE</span><b data-tower-share>0%</b></div>
          <div class="contribution-track"><i data-tower-bar></i></div>
          <div class="tower-stats"><span>EACH <b data-tower-each>0/s</b></span><span>TOTAL <b data-tower-total>0/s</b></span><span>PAYBACK <b data-tower-payback>—</b></span></div>
        </div>
        <div class="tower-owned"><strong data-tower-owned>0</strong><span>OWNED</span></div>
        <button class="tower-buy" type="button" data-buy-tower="${tower.id}"><b data-tower-buy-label>BUY 1</b><span data-tower-cost>${formatNumber(tower.baseCost)}</span></button>
      </article>`).join('');
    towerRefs = Object.fromEntries(TOWERS.map(tower => {
      const card = ui.towersList.querySelector(`[data-tower="${tower.id}"]`);
      return [tower.id, {
        card,
        next: $('[data-tower-next]', card),
        share: $('[data-tower-share]', card),
        bar: $('[data-tower-bar]', card),
        each: $('[data-tower-each]', card),
        total: $('[data-tower-total]', card),
        payback: $('[data-tower-payback]', card),
        owned: $('[data-tower-owned]', card),
        buyLabel: $('[data-tower-buy-label]', card),
        cost: $('[data-tower-cost]', card),
        buy: $('[data-buy-tower]', card)
      }];
    }));
  }

  function updateTowerList() {
    ensureModifiers();
    const totalOutput = currentBps;
    let efficiency = null;
    const thresholds = [25, 50, 100, 250, 500, 1000];
    for (const tower of TOWERS) {
      const refs = towerRefs[tower.id];
      if (!refs) continue;
      const count = state.towers[tower.id];
      const each = towerProductionEach(tower);
      const output = each * count;
      const share = totalOutput > 0 ? output / totalOutput * 100 : 0;
      const amount = selectedTowerAmount(tower);
      const cost = towerBulkCost(tower, amount);
      const next = thresholds.find(threshold => count < threshold);
      const marginal = each * Math.max(1, amount);
      const payback = marginal > 0 && Number.isFinite(cost) ? cost / marginal : Infinity;
      if (amount > 0 && Number.isFinite(payback) && (!efficiency || payback < efficiency.payback)) efficiency = { tower, payback };
      refs.card.classList.toggle('affordable', amount > 0 && state.resources.buttons >= cost);
      refs.next.textContent = next ? `Next mastery at ${formatNumber(next)}` : 'All masteries complete';
      refs.share.textContent = `${share.toFixed(1)}%`;
      refs.bar.style.width = `${Math.max(share > 0 ? 1 : 0, share)}%`;
      refs.each.textContent = `${formatNumber(each)}/s`;
      refs.total.textContent = `${formatNumber(output)}/s`;
      refs.payback.textContent = Number.isFinite(payback) ? formatDuration(payback) : '—';
      refs.owned.textContent = formatNumber(count);
      refs.buyLabel.textContent = `BUY ${buyMode === 'max' ? 'MAX' : buyMode}`;
      refs.cost.textContent = amount ? formatNumber(cost) : 'Unaffordable';
      refs.buy.disabled = !amount || state.resources.buttons < cost;
    }
    ui.networkOutput.textContent = `${formatNumber(currentBps)}/s`;
    ui.efficiencyLeader.textContent = efficiency?.tower.name || '—';
    ui.efficiencyLeaderSub.textContent = efficiency ? `${formatDuration(efficiency.payback)} estimated payback` : 'Buy your first tower';
    const nextCritMastery = TOWER_CRIT_THRESHOLDS.find(threshold => totalTowers() < threshold);
    ui.nextMastery.textContent = nextCritMastery ? `${formatNumber(nextCritMastery)} total towers` : 'Critical mastery complete';
  }

  function renderAchievements() {
    const items = ACHIEVEMENTS.filter(item => achievementCategory === 'all' || item.category === achievementCategory);
    ui.achievementsGrid.innerHTML = items.map(item => {
      return `
        <article class="achievement-card" data-achievement="${item.id}">
          <div class="achievement-top"><span class="achievement-icon">${fontAwesomeIcon(item.icon)}</span><span class="achievement-state" data-achievement-state>0%</span></div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="achievement-reward"><span>REWARD</span><b>${rewardLabel(item.reward)}</b></div>
          <div class="achievement-progress"><i data-achievement-progress></i></div>
          <button class="achievement-claim hidden" type="button" data-claim-achievement="${item.id}">CLAIM</button>
        </article>`;
    }).join('');
    achievementRefs = Object.fromEntries(items.map(item => {
      const card = ui.achievementsGrid.querySelector(`[data-achievement="${item.id}"]`);
      return [item.id, {
        card,
        state: $('[data-achievement-state]', card),
        progress: $('[data-achievement-progress]', card),
        claim: $('[data-claim-achievement]', card)
      }];
    }));
    updateAchievementCards();
  }

  function updateAchievementCards() {
    for (const item of ACHIEVEMENTS) {
      const refs = achievementRefs[item.id];
      if (!refs) continue;
      const value = achievementMetric(item);
      const complete = achievementComplete(item);
      const claimed = has(state.achievements.claimed, item.id);
      const progress = clamp(value / item.target, 0, 1);
      refs.card.classList.toggle('complete', complete);
      refs.card.classList.toggle('claimed', claimed);
      refs.state.textContent = claimed ? 'CLAIMED' : complete ? 'READY TO CLAIM' : `${Math.floor(progress * 100)}%`;
      refs.progress.style.width = `${progress * 100}%`;
      refs.claim.classList.toggle('hidden', !complete || claimed);
      refs.claim.disabled = !complete || claimed;
    }
    const stats = getAchievementStats();
    const percent = stats.unlocked.length / ACHIEVEMENTS.length * 100;
    const claimedCrystalTotal = state.totals.achievementCrystals;
    $('.achievement-wheel').style.setProperty('--progress', `${percent * 3.6}deg`);
    ui.achievementPercent.textContent = `${Math.floor(percent)}%`;
    ui.achievementUnlocked.textContent = `${stats.unlocked.length} / ${ACHIEVEMENTS.length}`;
    ui.achievementClaimable.textContent = stats.claimable.length;
    ui.achievementRewards.textContent = `${formatNumber(claimedCrystalTotal)} ◆`;
    ui.claimAllButton.disabled = stats.claimable.length === 0;
    ui.achievementNavBadge.textContent = stats.claimable.length;
    ui.achievementNavBadge.classList.toggle('hidden', stats.claimable.length === 0);
  }

  function auraLuckBoost() {
    const level = clamp(safeInt(state.ascension.nodes.auraResonance), 0, AURA_LUCK_BONUSES.length - 1);
    return AURA_LUCK_BONUSES[level];
  }

  function auraRareWeightMultiplier() {
    const boost = auraLuckBoost();
    if (!boost) return 1;
    const boostedRareProbability = BASE_RARE_AURA_PROBABILITY * (1 + boost);
    return boostedRareProbability * (1 - BASE_RARE_AURA_PROBABILITY)
      / (BASE_RARE_AURA_PROBABILITY * (1 - boostedRareProbability));
  }

  function adjustedAuraProbability(aura, rareWeightMultiplier) {
    const base = BASE_AURA_PROBABILITIES[aura.id];
    return RARITY_RANK[aura.tier] >= RARITY_RANK.Rare ? base * rareWeightMultiplier : base;
  }

  function calculateAuraOdds(scanNumber, pityValue) {
    const forcedParadox = scanNumber % 250 === 0 && !state.rng.discovered.paradox;
    const rareGuarantee = !forcedParadox && pityValue >= 50;
    const pool = forcedParadox
      ? AURAS.filter(aura => aura.id === 'paradox')
      : rareGuarantee
        ? AURAS.filter(aura => RARITY_RANK[aura.tier] >= RARITY_RANK.Rare)
        : AURAS;
    const poolIds = new Set(pool.map(aura => aura.id));
    const rareWeightMultiplier = auraRareWeightMultiplier();
    const poolProbability = pool.reduce((sum, aura) => sum + adjustedAuraProbability(aura, rareWeightMultiplier), 0);
    return {
      forcedParadox,
      rareGuarantee,
      probabilities: Object.fromEntries(AURAS.map(aura => [
        aura.id,
        poolIds.has(aura.id) ? adjustedAuraProbability(aura, rareWeightMultiplier) / poolProbability * 100 : 0
      ]))
    };
  }

  function getNextAuraOdds() {
    return calculateAuraOdds(state.rng.scans + 1, state.rng.pity + 1);
  }

  function formatAuraChance(percent) {
    if (percent === 0) return '0%';
    if (percent >= 10) return `${percent.toFixed(1)}%`;
    if (percent >= 0.1) return `${percent.toFixed(2)}%`;
    if (percent >= 0.001) return `${percent.toFixed(3)}%`;
    if (percent >= 0.0001) return `${percent.toFixed(4)}%`;
    return `${percent.toFixed(5)}%`;
  }

  function formatAuraOneIn(percent) {
    if (percent <= 0) return 'NOT IN POOL';
    const denominator = Math.max(1, Math.round(100 / percent));
    return `1 in ${denominator.toLocaleString('en-US')}`;
  }

  function updateAuraOdds(force = false) {
    const signature = `${state.rng.scans}:${state.rng.pity}:${state.rng.discovered.paradox ? 1 : 0}:${state.ascension.nodes.auraResonance || 0}`;
    if (!force && ui.auraCollection.dataset.oddsSignature === signature) return;
    ui.auraCollection.dataset.oddsSignature = signature;
    const odds = getNextAuraOdds();
    const resonance = auraLuckBoost();
    const resonanceLabel = resonance ? ` // HEAVENLY RARE+ CHANCE +${Math.round(resonance * 100)}%` : '';
    ui.auraOddsMode.textContent = (odds.forcedParadox
      ? 'NEXT SCAN // PARADOX OVERRIDE — 100%'
      : odds.rareGuarantee
        ? 'NEXT SCAN // RARE+ PITY GUARANTEE'
        : 'NEXT SCAN // STANDARD WEIGHTING') + resonanceLabel;
    for (const aura of AURAS) {
      const chance = auraRefs[aura.id];
      if (!chance) continue;
      const percent = odds.probabilities[aura.id];
      const percentageLabel = formatAuraChance(percent);
      const oneInLabel = formatAuraOneIn(percent);
      chance.textContent = percentageLabel;
      chance.dataset.oneIn = oneInLabel;
      chance.setAttribute('aria-label', `${percentageLabel}; ${oneInLabel}`);
    }
  }

  function renderAuraCollection() {
    const search = (ui.auraSearch?.value || '').trim().toLowerCase();
    const items = AURAS.filter(aura => !search || `${aura.name} ${aura.tier} ${aura.text}`.toLowerCase().includes(search));
    ui.auraCollection.innerHTML = items.map(aura => {
      const count = safeInt(state.rng.discovered[aura.id]);
      const equipped = state.rng.equipped === aura.id;
      return `
        <button class="aura-card ${count ? 'discovered' : 'locked'} ${equipped ? 'equipped' : ''}" type="button" data-aura="${aura.id}" style="--aura-color:${aura.color}" ${count ? '' : 'disabled'} aria-label="${count ? `${aura.name}, discovered${equipped ? ', equipped' : ''}` : `${aura.name}, locked`}">
          <span class="aura-state"><i></i>${count ? equipped ? 'EQUIPPED' : 'DISCOVERED' : 'LOCKED'}</span>
          <span class="aura-orb">${count ? fontAwesomeIcon(auraIconName(aura)) : fontAwesomeIcon('fa-lock')}</span>
          <strong>${aura.name}</strong>
          <span>${aura.tier}${count > 1 ? ` ×${count}` : ''}</span>
          <small>${count ? aura.text : 'Continue scanning to reveal this frequency.'}</small>
          <div class="aura-chance"><span>NEXT SCAN</span><b data-aura-chance>0%</b></div>
        </button>`;
    }).join('');
    auraRefs = Object.fromEntries(items.map(aura => {
      const card = ui.auraCollection.querySelector(`[data-aura="${aura.id}"]`);
      return [aura.id, $('[data-aura-chance]', card)];
    }));
    const count = discoveredAuraCount();
    ui.auraProgress.textContent = `${count} / ${AURAS.length}`;
    ui.auraProgressFill.style.width = `${count / AURAS.length * 100}%`;
    updateAuraOdds(true);
  }

  function auraEffectSeed(value) {
    let hash = 2166136261;
    for (const character of value) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function applyAuraScreenEffect() {
    const aura = AURAS.find(item => item.id === state.rng.equipped && state.rng.discovered[item.id]);
    const signature = aura?.id || 'none';
    if (ui.auraScreenFx.dataset.signature === signature) return;
    ui.auraScreenFx.dataset.signature = signature;
    document.body.classList.remove(
      'aura-fx-active',
      'aura-fx-high',
      'aura-fx-extreme',
      ...Array.from({ length: 6 }, (_, index) => `aura-fx-pattern-${index}`)
    );
    delete document.body.dataset.auraEffect;
    if (!aura) {
      ui.auraScreenFx.innerHTML = '';
      document.body.style.removeProperty('--aura-fx-color');
      document.body.style.removeProperty('--aura-fx-intensity');
      document.body.style.removeProperty('--aura-fx-speed');
      return;
    }

    const rank = RARITY_RANK[aura.tier] || 0;
    let seed = auraEffectSeed(aura.id);
    const pattern = seed % 6;
    const particleCount = Math.min(34, 5 + rank * 2 + (seed % 4));
    const particles = [];
    for (let index = 0; index < particleCount; index++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const x = seed % 101;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const y = seed % 101;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const size = 2 + seed % Math.max(3, 4 + Math.floor(rank / 2));
      const delay = (seed % 900) / 100;
      const duration = Math.max(1.4, 8.5 - rank * 0.42 + (seed % 240) / 100);
      const travel = 18 + seed % (38 + rank * 5);
      particles.push(`<i style="--x:${x}%;--y:${y}%;--size:${size}px;--delay:-${delay}s;--duration:${duration}s;--travel:-${travel}px"></i>`);
    }

    document.body.dataset.auraEffect = aura.id;
    document.body.style.setProperty('--aura-fx-color', aura.color);
    document.body.style.setProperty('--aura-fx-intensity', String(Math.min(0.3, 0.055 + rank * 0.018)));
    document.body.style.setProperty('--aura-fx-speed', `${Math.max(2.2, 10 - rank * 0.55)}s`);
    document.body.classList.add('aura-fx-active', `aura-fx-pattern-${pattern}`);
    if (rank >= RARITY_RANK.Ethereal) document.body.classList.add('aura-fx-high');
    if (rank >= RARITY_RANK.Impossible) document.body.classList.add('aura-fx-extreme');
    ui.auraScreenFx.innerHTML = `
      <div class="aura-fx-field"></div>
      <div class="aura-fx-orbit">${fontAwesomeIcon(auraIconName(aura))}</div>
      <div class="aura-fx-particles">${particles.join('')}</div>
      <span class="aura-fx-signature">${aura.name.toUpperCase()} // ${aura.tier.toUpperCase()}</span>`;
  }

  function updateRngUi() {
    const count = discoveredAuraCount();
    ui.rngChargeText.textContent = `${Math.floor(state.rng.charge)} / 100${mods?.rngAutoCharge ? ` • +${mods.rngAutoCharge.toFixed(1)}/S` : ''}`;
    ui.rngChargeFill.style.width = `${state.rng.charge}%`;
    ui.rollAuraButton.disabled = state.rng.charge < 10 || runtime.rng.scanning;
    ui.pityText.textContent = state.rng.pity + 1 >= 50 ? 'Next scan guarantees Rare or better' : `Rare guarantee in ${50 - state.rng.pity} scans`;
    const aura = AURAS.find(item => item.id === state.rng.equipped);
    const equippedSignature = aura?.id || 'none';
    if (ui.equippedAura.dataset.signature !== equippedSignature) {
      ui.equippedAura.dataset.signature = equippedSignature;
      ui.equippedAura.innerHTML = aura
        ? `<span style="color:${aura.color};border-color:${aura.color}">${fontAwesomeIcon(auraIconName(aura))}</span><div><strong>${aura.name}</strong><small>${aura.text}</small></div>`
        : `<span>${fontAwesomeIcon('fa-circle-question')}</span><div><strong>None</strong><small>No passive modifier</small></div>`;
    }
    const recent = state.rng.recent.length ? state.rng.recent : Array(12).fill(0);
    const recentSignature = recent.join(',');
    if (ui.luckBars.dataset.signature !== recentSignature) {
      ui.luckBars.dataset.signature = recentSignature;
      ui.luckBars.innerHTML = recent.map(rank => `<i style="height:${Math.min(100, 8 + rank * 8)}%"></i>`).join('');
    }
    const average = state.rng.recent.length ? state.rng.recent.reduce((sum, value) => sum + value, 0) / state.rng.recent.length : 0;
    ui.luckGrade.textContent = average >= 4 ? 'S' : average >= 3 ? 'A' : average >= 2 ? 'B' : 'C';
    ui.luckAnalysis.textContent = state.rng.scans
      ? `${formatNumber(state.rng.scans)} scans • ${count} unique • ${state.rng.pity} current pity${auraLuckBoost() ? ` • +${Math.round(auraLuckBoost() * 100)}% Rare+ resonance` : ''}`
      : 'Start scanning to build a probability profile.';
    applyAuraScreenEffect();
  }

  function constrainTreeView() {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const visibleEdge = Math.min(140, rect.width * 0.25, rect.height * 0.25);
    const scaledWidth = CORE_TREE_WIDTH * runtime.tree.scale;
    const scaledHeight = CORE_TREE_HEIGHT * runtime.tree.scale;
    runtime.tree.x = clamp(runtime.tree.x, visibleEdge - scaledWidth, rect.width - visibleEdge);
    runtime.tree.y = clamp(runtime.tree.y, visibleEdge - scaledHeight, rect.height - visibleEdge);
  }

  function applyTreeTransform() {
    constrainTreeView();
    ui.coreTree.style.setProperty('--tree-inverse-scale', String(1 / runtime.tree.scale));
    ui.coreTree.style.transform = `translate3d(${runtime.tree.x}px, ${runtime.tree.y}px, 0) scale(${runtime.tree.scale})`;
  }

  function resetTreeView() {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      runtime.tree.initialized = false;
      return;
    }
    const paddingX = state.ascension.inLimbo ? 90 : 36;
    const paddingY = state.ascension.inLimbo ? 105 : 36;
    runtime.tree.scale = clamp(
      Math.min((rect.width - paddingX * 2) / CORE_TREE_WIDTH, (rect.height - paddingY * 2) / CORE_TREE_HEIGHT),
      0.34,
      1
    );
    runtime.tree.x = (rect.width - CORE_TREE_WIDTH * runtime.tree.scale) / 2;
    runtime.tree.y = (rect.height - CORE_TREE_HEIGHT * runtime.tree.scale) / 2 + (state.ascension.inLimbo ? 28 : 0);
    runtime.tree.initialized = true;
    applyTreeTransform();
  }

  function zoomTree(direction, clientX, clientY) {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const focusX = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const focusY = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    const worldX = (focusX - runtime.tree.x) / runtime.tree.scale;
    const worldY = (focusY - runtime.tree.y) / runtime.tree.scale;
    const nextScale = clamp(runtime.tree.scale * direction, 0.34, 1.65);
    runtime.tree.scale = nextScale;
    runtime.tree.x = focusX - worldX * nextScale;
    runtime.tree.y = focusY - worldY * nextScale;
    runtime.tree.initialized = true;
    applyTreeTransform();
  }

  function startTreeDrag(event) {
    if (event.button !== 0 || event.target.closest('button')) return;
    runtime.tree.dragging = true;
    runtime.tree.pointerId = event.pointerId;
    runtime.tree.startX = event.clientX;
    runtime.tree.startY = event.clientY;
    runtime.tree.originX = runtime.tree.x;
    runtime.tree.originY = runtime.tree.y;
    ui.constellationViewport.classList.add('dragging');
    ui.constellationViewport.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function moveTree(event) {
    if (!runtime.tree.dragging || event.pointerId !== runtime.tree.pointerId) return;
    runtime.tree.x = runtime.tree.originX + event.clientX - runtime.tree.startX;
    runtime.tree.y = runtime.tree.originY + event.clientY - runtime.tree.startY;
    applyTreeTransform();
  }

  function endTreeDrag(event) {
    if (!runtime.tree.dragging || event.pointerId !== runtime.tree.pointerId) return;
    runtime.tree.dragging = false;
    runtime.tree.pointerId = null;
    ui.constellationViewport.classList.remove('dragging');
    ui.constellationViewport.releasePointerCapture?.(event.pointerId);
  }

  function renderCoreTree() {
    const links = CORE_NODES.flatMap(node => Object.keys(node.requires || {}).map(parentId => {
      const parent = CORE_NODES.find(item => item.id === parentId);
      if (!parent) return '';
      const dx = node.x - parent.x;
      const dy = node.y - parent.y;
      const distance = Math.hypot(dx, dy);
      const startX = parent.x + dx / distance * CORE_NODE_RADIUS;
      const startY = parent.y + dy / distance * CORE_NODE_RADIUS;
      const length = Math.max(0, distance - CORE_NODE_RADIUS * 2);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const active = state.ascension.nodes[parentId] >= node.requires[parentId];
      const targetLevel = state.ascension.nodes[node.id];
      const targetReady = coreNodeUnlocked(node) && targetLevel < node.max && state.resources.cores >= coreNodeCost(node, targetLevel);
      return `<i class="core-link ${active ? 'active' : ''} ${targetReady ? 'ready' : ''}" style="left:${startX}px;top:${startY}px;width:${length}px;transform:rotate(${angle}deg)"></i>`;
    })).join('');
    const nodes = CORE_NODES.map(node => {
      const level = state.ascension.nodes[node.id];
      const cost = coreNodeCost(node, level);
      const maxed = level >= node.max;
      const unlocked = coreNodeUnlocked(node);
      const affordable = unlocked && !maxed && state.resources.cores >= cost;
      const requirements = Object.entries(node.requires || {}).map(([id, required]) => {
        const parent = CORE_NODES.find(item => item.id === id);
        return `${parent?.name || id} ${required}`;
      }).join(' + ');
      return `
        <article class="core-node ${maxed ? 'maxed' : ''} ${unlocked ? 'unlocked' : 'locked'} ${affordable ? 'affordable' : unlocked && !maxed ? 'needs-cores' : ''}" style="left:${node.x}px;top:${node.y}px">
          <button class="core-node-orb" type="button" data-core-node="${node.id}" ${!unlocked || maxed || state.resources.cores < cost ? 'disabled' : ''} aria-label="${node.name}, level ${level} of ${node.max}">
            <small>${maxed ? 'MAXED' : !unlocked ? 'LOCKED' : affordable ? 'BUY NOW' : 'NEED CORES'}</small>
            <span>${fontAwesomeIcon(CORE_FONT_ICONS[node.id] || 'fa-circle-nodes')}</span><i>${level}/${node.max}</i>
          </button>
          <div class="core-node-info">
            <h3>${node.name}</h3>
            <p>${node.desc}</p>
            <div class="core-node-footer"><span>${unlocked ? `LEVEL ${level} / ${node.max}` : `REQUIRES ${requirements}`}</span><b>${maxed ? 'MAXED' : `${formatNumber(cost, 0)} CORE${cost === 1 ? '' : 'S'}`}</b></div>
          </div>
        </article>`;
    }).join('');
    ui.coreTree.innerHTML = `<div class="core-stars"></div>${links}${nodes}`;
    ui.coreTree.style.width = `${CORE_TREE_WIDTH}px`;
    ui.coreTree.style.height = `${CORE_TREE_HEIGHT}px`;
    if (runtime.tree.initialized) applyTreeTransform();
  }

  function coreMemorySummary() {
    const summary = {
      activeNodes: 0,
      levels: 0,
      startButtons: 0,
      global: 1,
      towerGlobal: 1,
      rngAutoCharge: 0,
      auraLuck: 0
    };
    for (const node of CORE_NODES) {
      const level = safeInt(state.ascension.nodes[node.id]);
      if (!level) continue;
      summary.activeNodes++;
      summary.levels += level;
      for (const effect of node.effects || []) {
        if (effect.kind === 'startButtons') summary.startButtons += effect.value * level;
        if (effect.kind === 'global') summary.global *= Math.pow(effect.value, level);
        if (effect.kind === 'towerGlobal') summary.towerGlobal *= Math.pow(effect.value, level);
        if (effect.kind === 'rngAutoCharge') summary.rngAutoCharge += effect.value * level;
        if (effect.kind === 'auraLuck') summary.auraLuck = AURA_LUCK_BONUSES[clamp(level, 0, AURA_LUCK_BONUSES.length - 1)];
      }
    }
    return summary;
  }

  function updateAscensionUi() {
    const gain = ascensionPotential();
    const inLimbo = state.ascension.inLimbo;
    const memory = coreMemorySummary();
    ui.ascensionCount.textContent = formatNumber(state.totals.ascensions, 0);
    ui.ascensionGain.textContent = formatNumber(gain, 0);
    ui.availableCores.textContent = formatNumber(state.resources.cores, 0);
    ui.availableCoresFocus.textContent = formatNumber(state.resources.cores, 0);
    ui.ascendButton.classList.toggle('hidden', inLimbo);
    ui.ascendButton.disabled = gain < 1 || runtime.ascension.playing;
    if (ui.ascensionConfirmDialog.open) {
      runtime.ascension.pendingGain = gain;
      ui.ascensionConfirmGain.textContent = formatNumber(gain, 0);
    }
    ui.beginCycleButton.disabled = runtime.ascension.playing;
    ui.ascensionFocusBar.classList.toggle('active', inLimbo);
    ui.ascensionFocusBar.setAttribute('aria-hidden', String(!inLimbo));
    ui.ascensionOverview.setAttribute('aria-hidden', String(inLimbo));
    ui.ascensionTreePanel.setAttribute('aria-hidden', String(!inLimbo));
    document.body.classList.toggle('ascension-focus', inLimbo);
    ui.ascensionActiveNodes.textContent = `${memory.activeNodes} / ${CORE_NODES.length}`;
    ui.ascensionCoreLevels.textContent = formatNumber(memory.levels, 0);
    ui.ascensionSpentCores.textContent = formatNumber(state.ascension.spentCores, 0);
    ui.ascensionStartReserve.textContent = formatNumber(memory.startButtons, 0);
    ui.ascensionOutputMemory.textContent = `×${formatNumber(memory.global, 2)}`;
    ui.ascensionTowerMemory.textContent = `×${formatNumber(memory.towerGlobal, 2)}`;
    ui.ascensionRngMemory.textContent = memory.rngAutoCharge
      ? `+${memory.rngAutoCharge.toFixed(1)}/S • +${Math.round(memory.auraLuck * 100)}%`
      : 'OFFLINE';
    ui.cycleStateHint.textContent = inLimbo
      ? 'Reactor offline. Spend Heavenly Cores, then begin when your circuit is ready.'
      : 'Permanent circuitry remains active through every reboot.';
    ui.ascensionRequirement.textContent = inLimbo
      ? 'HEAVENLY OS READY // Configure the circuit before beginning.'
      : gain
      ? `Collapse ${formatNumber(state.totals.runButtons)} run buttons into permanent power.`
      : `${formatNumber(Math.max(0, ASCENSION_THRESHOLD - state.totals.runButtons))} more run buttons for the first core.`;
  }

  function renderCritDialog() {
    const progress = criticalProgress();
    ui.critDialogValue.textContent = `${(progress.chance * 100).toFixed(2)}%`;
    ui.critDialogFill.style.width = `${progress.chance / CRIT_CAP * 100}%`;
    ui.critSources.innerHTML = progress.groups.map(group => `
      <div class="crit-source ${group.done === group.total ? 'done' : ''}">
        <span>${fontAwesomeIcon(group.done === group.total ? 'fa-check' : group.icon)}</span>
        <div><strong>${group.name}</strong><small>${group.detail}</small></div>
        <b>+${(group.value * 100).toFixed(group.value < 0.01 ? 2 : 1)}% / ${(group.max * 100).toFixed(1)}%</b>
      </div>`).join('');
  }

  function renderSystemStats() {
    const stats = [
      ['Current buttons', formatNumber(state.resources.buttons)],
      ['Lifetime buttons', formatNumber(state.totals.buttons)],
      ['This cycle', formatNumber(state.totals.runButtons)],
      ['Manual presses', formatNumber(state.totals.clicks)],
      ['Critical presses', formatNumber(state.totals.crits)],
      ['Current B/s', formatNumber(currentBps * activeBuffMultiplier())],
      ['Best B/s', formatNumber(state.totals.bestBps)],
      ['Towers owned', formatNumber(totalTowers())],
      ['Upgrades installed', `${state.upgrades.length} / ${UPGRADES.length}`],
      ['Golden signals', formatNumber(state.totals.golden)],
      ['Glitched signals', formatNumber(state.totals.glitches)],
      ['Aura scans', formatNumber(state.rng.scans)],
      ['Auras found', `${discoveredAuraCount()} / ${AURAS.length}`],
      ['Converter cycles', formatNumber(state.totals.converterJobs)],
      ['Crystals processed', formatNumber(state.totals.convertedCrystals)],
      ['Arcade wins', formatNumber(state.totals.arcadeWins)],
      ['Ascensions', formatNumber(state.totals.ascensions)],
      ['Play time', formatDuration(state.totals.playSeconds)],
      ['Save age', formatDuration((Date.now() - state.meta.createdAt) / 1000)]
    ];
    ui.statsList.innerHTML = stats.map(([label, value]) => `<div class="stat-row"><span>${label}</span><b>${value}</b></div>`).join('');
  }

  function renderSecrets() {
    ui.secretCount.textContent = `${state.secrets.found.length} / ${SECRETS.length}`;
    ui.secretList.innerHTML = SECRETS.map(secret => `
      <div class="secret-slot ${has(state.secrets.found, secret.id) ? 'found' : ''}">
        ${has(state.secrets.found, secret.id) ? `<b>${secret.name}</b><br>+2.5% CRIT` : `LOCKED<br>${secret.clue}`}
      </div>`).join('');
  }

  function renderArcade() {
    if (!runtime.cipher.active && runtime.cipher.values.length === 0) renderCipherCells();
    if (!runtime.pulse.active && !ui.pulseTarget.style.width) randomizePulseTarget();
    if (!runtime.stability.active && !ui.stabilityTarget.style.width) randomizeStabilityTarget();
    ui.arcadeWins.textContent = `${formatNumber(state.totals.arcadeWins)} wins`;
    ui.arcadeStreak.textContent = state.minigames.streak ? `${state.minigames.streak} trial streak` : 'No active streak';
    const reaction = state.minigames.reactionBest;
    ui.reactionBest.textContent = reaction == null ? 'BEST —' : `BEST ${Math.round(reaction)}MS`;
    ui.reactionRecord.textContent = reaction == null ? 'NO RECORD' : `${Math.round(reaction)} MS`;
    const sequenceDifficulty = arcadeDifficulty('sequence');
    const sequenceConfig = SEQUENCE_DIFFICULTIES[sequenceDifficulty];
    const sequenceBest = safeInt(state.minigames.sequenceBestByDifficulty[sequenceDifficulty], sequenceDifficulty === 'easy' ? state.minigames.sequenceBest : 0);
    ui.sequenceBest.textContent = `BEST ${sequenceBest}`;
    ui.sequenceWave.textContent = runtime.sequence.pattern.length || 0;
    ui.sequenceReward.textContent = `◆ ×${sequenceConfig.rewardMultiplier} / WAVE`;

    const pulseDifficulty = arcadeDifficulty('pulse');
    const pulseConfig = PULSE_DIFFICULTIES[pulseDifficulty];
    const pulseBest = state.minigames.pulseBestByDifficulty[pulseDifficulty] ?? (pulseDifficulty === 'easy' ? state.minigames.pulseBest : null);
    ui.pulseBest.textContent = pulseBest == null ? 'BEST —' : `BEST ${pulseBest}%`;
    ui.pulseLocks.textContent = `${runtime.pulse.locks} / 3`;
    const pulseMinimum = 3 * pulseConfig.rewardMultiplier;
    const pulseMaximum = 9 * pulseConfig.rewardMultiplier;
    ui.pulseReward.textContent = `◆ ${pulseMinimum}–${pulseMaximum}`;

    const vectorDifficulty = arcadeDifficulty('vector');
    const vectorConfig = VECTOR_DIFFICULTIES[vectorDifficulty];
    const vectorBest = finite(state.minigames.vectorBest[vectorDifficulty], 0);
    ui.vectorBest.textContent = vectorBest ? `BEST ${(vectorBest / 1000).toFixed(2)}S` : 'BEST —';
    ui.vectorHits.textContent = `${runtime.vector.hits} / ${vectorConfig.goal}`;
    ui.vectorReward.textContent = `◆ ${vectorConfig.reward}`;
    if (runtime.vector.active) ui.vectorStatus.textContent = `${Math.max(0, (runtime.vector.endsAt - performance.now()) / 1000).toFixed(1)}s remaining`;

    const cipherDifficulty = arcadeDifficulty('cipher');
    const cipherConfig = CIPHER_DIFFICULTIES[cipherDifficulty];
    const cipherBest = finite(state.minigames.cipherBest[cipherDifficulty], 0);
    ui.cipherBest.textContent = cipherBest ? `BEST ${(cipherBest / 1000).toFixed(2)}S` : 'BEST —';
    ui.cipherRound.textContent = `${runtime.cipher.round} / ${cipherConfig.goal}`;
    ui.cipherReward.textContent = `◆ ${cipherConfig.reward}`;
    if (runtime.cipher.active) ui.cipherStatus.textContent = `Round ${Math.min(cipherConfig.goal, runtime.cipher.round + 1)} • ${Math.max(0, (runtime.cipher.endsAt - performance.now()) / 1000).toFixed(1)}s`;

    const stabilityDifficulty = arcadeDifficulty('stability');
    const stabilityConfig = STABILITY_DIFFICULTIES[stabilityDifficulty];
    const stabilityBest = safeInt(state.minigames.stabilityBest[stabilityDifficulty]);
    ui.stabilityBest.textContent = stabilityBest ? `BEST ${stabilityBest}%` : 'BEST —';
    ui.stabilityLocks.textContent = `${runtime.stability.locks} / 3`;
    ui.stabilityReward.textContent = `◆ ${stabilityConfig.rewardPerLock} / LOCK`;

    $$('[data-game-difficulty]').forEach(button => {
      const gameName = button.dataset.gameDifficulty;
      button.classList.toggle('active', arcadeDifficulty(gameName) === button.dataset.difficulty);
      button.disabled = arcadeGameRunning(gameName);
    });
  }

  function updateTimedArcadeGames(time) {
    if (runtime.vector.active && time >= runtime.vector.endsAt) finishVector(false);
    if (runtime.cipher.active && time >= runtime.cipher.endsAt) finishCipher(false);
    if (runtime.stability.holding) ui.stabilityFill.style.width = `${stabilityPosition(time)}%`;
  }

  function updateCritAndAchievementBadges() {
    const stats = getAchievementStats();
    ui.achievementNavBadge.textContent = stats.claimable.length;
    ui.achievementNavBadge.classList.toggle('hidden', !stats.claimable.length);
    const affordable = UPGRADES.filter(item => !has(state.upgrades, item.id) && upgradeUnlocked(item) && state.resources.buttons >= item.cost).length;
    ui.upgradeNavBadge.textContent = affordable;
    ui.upgradeNavBadge.classList.toggle('hidden', !affordable);
    const affordableTower = TOWERS.some(tower => state.resources.buttons >= towerBulkCost(tower, 1));
    ui.towerNavBadge.classList.toggle('hidden', !affordableTower);
  }

  function drawChart() {
    const canvas = ui.productionChart;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const context = canvas.getContext('2d');
    context.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;
    const padding = 4;
    const max = Math.max(1, ...chartSamples) * 1.1;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(255,255,255,.055)';
    context.lineWidth = 1;
    for (let row = 1; row < 4; row++) {
      const y = height / 4 * row;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    const points = chartSamples.map((value, index) => ({
      x: padding + index / (chartSamples.length - 1) * (width - padding * 2),
      y: height - padding - value / max * (height - padding * 2)
    }));
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(210,255,83,.22)');
    gradient.addColorStop(1, 'rgba(210,255,83,0)');
    context.beginPath();
    context.moveTo(points[0].x, height);
    points.forEach(point => context.lineTo(point.x, point.y));
    context.lineTo(points.at(-1).x, height);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = '#d2ff53';
    context.lineWidth = 2;
    context.shadowColor = 'rgba(210,255,83,.4)';
    context.shadowBlur = 8;
    context.stroke();
  }

  function renderCommandResults(query = '') {
    const search = query.trim().toLowerCase();
    const items = NAV_ITEMS.filter(item => !search || `${item.title} ${item.sub}`.toLowerCase().includes(search));
    ui.commandResults.innerHTML = items.map((item, index) => `
      <button class="command-result ${index === 0 ? 'selected' : ''}" type="button" data-command-page="${item.id}">
        <span>${fontAwesomeIcon(item.icon)}</span><div><strong>${item.title}</strong><small>${item.sub}</small></div><kbd>${item.key}</kbd>
      </button>`).join('');
  }

  function formatTrackTime(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function buildGoldenSoundShop() {
    if (!ui.goldenSignalSoundShop || ui.goldenSignalSoundShop.dataset.ready) return;
    ui.goldenSignalSoundShop.dataset.ready = 'true';
    ui.goldenSignalSoundShop.innerHTML = GOLDEN_SPAWN_SOUNDS.map(sound => `
      <article class="golden-sound-option" data-golden-sound-card="${sound.id}">
        <button class="golden-sound-preview" type="button" data-preview-golden-sound="${sound.id}" aria-label="Preview ${sound.name}">♪</button>
        <div><strong>${sound.name}</strong><small>${sound.detail}</small><em data-golden-sound-state></em></div>
        <button class="golden-sound-action" type="button" data-golden-sound-action="${sound.id}"></button>
      </article>`).join('');
    goldenSoundRefs = Object.fromEntries(GOLDEN_SPAWN_SOUNDS.map(sound => {
      const card = ui.goldenSignalSoundShop.querySelector(`[data-golden-sound-card="${sound.id}"]`);
      return [sound.id, {
        card,
        state: $('[data-golden-sound-state]', card),
        action: $('[data-golden-sound-action]', card)
      }];
    }));
  }

  function updateGoldenSoundShop() {
    buildGoldenSoundShop();
    for (const sound of GOLDEN_SPAWN_SOUNDS) {
      const refs = goldenSoundRefs[sound.id];
      if (!refs) continue;
      const unlocked = state.jukebox.unlockedGoldenSpawnSounds.includes(sound.id);
      const selected = state.jukebox.goldenSpawnSound === sound.id;
      const affordable = state.resources.crystals >= sound.cost;
      refs.card.classList.toggle('locked', !unlocked);
      refs.card.classList.toggle('selected', selected);
      refs.state.textContent = selected ? 'ACTIVE RECEIVER SOUND' : unlocked ? 'OWNED' : `${formatNumber(sound.cost, 0)} CRYSTALS`;
      refs.action.disabled = selected || (!unlocked && !affordable);
      refs.action.textContent = selected ? 'SELECTED' : unlocked ? 'SELECT' : sound.cost ? `BUY ${formatNumber(sound.cost, 0)} ◆` : 'UNLOCK';
    }
  }

  function previewGoldenSpawnSound(id) {
    const sound = GOLDEN_SPAWN_SOUNDS.find(item => item.id === id);
    if (sound) audio.play(sound.sound);
  }

  function chooseGoldenSpawnSound(id) {
    const sound = GOLDEN_SPAWN_SOUNDS.find(item => item.id === id);
    if (!sound) return;
    const unlocked = state.jukebox.unlockedGoldenSpawnSounds.includes(id);
    if (!unlocked) {
      if (state.resources.crystals < sound.cost) {
        toast('Receiver sound locked', `${formatNumber(sound.cost - state.resources.crystals, 0)} more crystals required.`);
        return;
      }
      state.resources.crystals -= sound.cost;
      state.jukebox.unlockedGoldenSpawnSounds.push(id);
      logEvent('Receiver sound purchased', `${sound.name} added to the Heavenly Jukebox for ${formatNumber(sound.cost, 0)} crystals.`, 'gold');
    }
    state.jukebox.goldenSpawnSound = id;
    markDirty();
    previewGoldenSpawnSound(id);
    updateGoldenSoundShop();
    updateConverterUi();
  }

  function setJukeboxTab(tab) {
    runtime.jukebox.tab = tab === 'sounds' ? 'sounds' : 'music';
    $$('[data-jukebox-tab]').forEach(button => {
      const active = button.dataset.jukeboxTab === runtime.jukebox.tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    ui.jukeboxMusicPanel.classList.toggle('hidden', runtime.jukebox.tab !== 'music');
    ui.jukeboxSoundPanel.classList.toggle('hidden', runtime.jukebox.tab !== 'sounds');
  }

  function renderMusicPlayer() {
    if (!ui.musicPlayerButton) return;
    const unlocked = state.ascension.nodes.musicPlayer >= 1;
    ui.musicPlayerButton.classList.toggle('hidden', !unlocked);
    if (!unlocked) return;
    setJukeboxTab(runtime.jukebox.tab);
    updateGoldenSoundShop();
    if (!ui.jukeboxSoundList.dataset.ready) {
      ui.jukeboxSoundList.dataset.ready = 'true';
      ui.jukeboxSoundList.innerHTML = JUKEBOX_SOUNDS.map((sound, index) => `
        <button type="button" data-jukebox-sound="${sound.id}">
          <span>${String(index + 1).padStart(2, '0')}</span>
          <div><strong>${sound.name}</strong><small>${sound.detail}</small></div>
          <i>PLAY</i>
        </button>`).join('');
    }
    const current = audio.trackIndex;
    const specialTrack = audio.specialTrack;
    const corrupted = audio.glitchActive;
    const duration = audio.music?.duration || 0;
    const elapsed = audio.music?.currentTime || 0;
    ui.musicTrackTitle.textContent = corrupted ? 'ERR_404 // CORRUPTED SIGNAL' : specialTrack?.name || (current >= 0 ? audio.trackName(current) : 'Reactor Radio');
    ui.musicTrackIndex.textContent = corrupted
      ? 'GLITCH OVERRIDE // SIGNAL UNSTABLE'
      : specialTrack
      ? 'RESTRICTED TRACK // MANUAL PLAYBACK'
      : current >= 0
      ? `TRACK ${current + 1} / ${audio.tracks.length} // SHUFFLE ACTIVE`
      : 'SHUFFLE READY';
    const jukeboxTrackCount = audio.tracks.length + 1;
    ui.musicLibraryCount.textContent = `${jukeboxTrackCount} TRACK${jukeboxTrackCount === 1 ? '' : 'S'}`;
    ui.musicPlayButton.textContent = corrupted
      ? audio.glitchMusic && !audio.glitchMusic.paused ? 'PAUSE ERROR' : 'PLAY ERROR'
      : audio.music && !audio.music.paused ? 'PAUSE' : 'PLAY';
    ui.musicPrevButton.disabled = corrupted;
    ui.musicNextButton.disabled = corrupted;
    ui.musicSeek.value = corrupted ? 404 : duration ? Math.round(elapsed / duration * 1000) : 0;
    ui.musicSeek.disabled = corrupted || !duration;
    ui.musicTime.textContent = corrupted ? '33.0s // OVERRIDE' : `${formatTrackTime(elapsed)} / ${formatTrackTime(duration)}`;
    const signature = `${current}:${specialTrack?.source || 'standard'}:${audio.tracks.length}`;
    if (ui.musicTrackList.dataset.signature !== signature) {
      ui.musicTrackList.dataset.signature = signature;
      ui.musicTrackList.innerHTML = `
        ${audio.tracks.map((track, index) => `
          <button class="${index === current ? 'active' : ''}" type="button" data-music-track="${index}">
            <span>${String(index + 1).padStart(2, '0')}</span><strong>${audio.trackName(index)}</strong><i>${index === current ? 'PLAYING' : 'QUEUE'}</i>
          </button>`).join('')}
        <button class="${specialTrack ? 'active' : ''}" type="button" data-jukebox-special-track="glitch">
          <span>404</span><strong>Glitch State Theme <small>music_glitch.mp3</small></strong><i>${specialTrack ? 'PLAYING' : 'PLAY'}</i>
        </button>`;
    }
  }

  function openCommand() {
    renderCommandResults();
    if (!ui.commandDialog.open) ui.commandDialog.showModal();
    setTimeout(() => ui.commandSearch.focus(), 20);
  }

  function closeCustomSelects(except = null) {
    $$('.custom-select.open').forEach(control => {
      if (control === except) return;
      control.classList.remove('open');
      $('.custom-select-trigger', control)?.setAttribute('aria-expanded', 'false');
    });
  }

  function syncCustomSelect(select) {
    const control = select.nextElementSibling;
    if (!control?.classList.contains('custom-select')) return;
    const selected = select.options[select.selectedIndex];
    const triggerLabel = $('.custom-select-value', control);
    if (triggerLabel) triggerLabel.textContent = selected?.textContent || '';
    $$('[data-select-value]', control).forEach(option => {
      const active = option.dataset.selectValue === select.value;
      option.classList.toggle('selected', active);
      option.setAttribute('aria-selected', String(active));
    });
  }

  function initializeCustomSelects() {
    $$('select').forEach(select => {
      if (select.dataset.customized) return;
      select.dataset.customized = 'true';
      select.classList.add('native-select-hidden');
      select.setAttribute('aria-hidden', 'true');
      select.tabIndex = -1;
      const control = document.createElement('div');
      control.className = 'custom-select';
      control.innerHTML = `
        <button class="custom-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="custom-select-value"></span><i aria-hidden="true"></i>
        </button>
        <div class="custom-select-menu" role="listbox" aria-label="${select.getAttribute('aria-label') || select.id.replace(/([A-Z])/g, ' $1')}">
          ${[...select.options].map(option => `<button type="button" role="option" data-select-value="${option.value}"><span>${option.textContent}</span><i>✓</i></button>`).join('')}
        </div>`;
      select.insertAdjacentElement('afterend', control);
      const trigger = $('.custom-select-trigger', control);
      trigger.addEventListener('click', event => {
        event.stopPropagation();
        const opening = !control.classList.contains('open');
        closeCustomSelects(control);
        control.classList.toggle('open', opening);
        trigger.setAttribute('aria-expanded', String(opening));
      });
      trigger.addEventListener('keydown', event => {
        if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        control.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        const options = $$('[data-select-value]', control);
        const selectedIndex = Math.max(0, options.findIndex(option => option.dataset.selectValue === select.value));
        options[event.key === 'ArrowUp' ? Math.max(0, selectedIndex - 1) : selectedIndex]?.focus();
      });
      $$('[data-select-value]', control).forEach((option, index, options) => {
        option.addEventListener('click', event => {
          event.stopPropagation();
          select.value = option.dataset.selectValue;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          syncCustomSelect(select);
          closeCustomSelects();
          trigger.focus();
        });
        option.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            closeCustomSelects();
            trigger.focus();
          }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            options[clamp(index + direction, 0, options.length - 1)]?.focus();
          }
        });
      });
      select.addEventListener('change', () => syncCustomSelect(select));
      syncCustomSelect(select);
    });
    document.addEventListener('click', () => closeCustomSelects());
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeCustomSelects();
    });
  }

  function applySettings() {
    ui.soundVolume.value = Math.round(state.settings.sound * 100);
    ui.soundVolumeOutput.textContent = `${Math.round(state.settings.sound * 100)}%`;
    ui.musicVolume.value = Math.round(state.settings.music * 100);
    ui.musicVolumeOutput.textContent = `${Math.round(state.settings.music * 100)}%`;
    ui.motionSetting.value = state.settings.motion;
    ui.numberFormat.value = state.settings.numberFormat;
    ui.fastNotesSetting.value = state.settings.fastNotes ? 'on' : 'off';
    document.body.classList.toggle('motion-reduced', state.settings.motion === 'reduced');
    document.body.classList.toggle('motion-off', state.settings.motion === 'off');
    ui.soundIcon.innerHTML = fontAwesomeIcon(state.settings.sound || state.settings.music ? 'fa-volume-high' : 'fa-volume-xmark');
    ui.soundButton.setAttribute('aria-label', state.settings.sound || state.settings.music ? 'Mute sound' : 'Restore sound');
    $$('select').forEach(syncCustomSelect);
    renderMusicPlayer();
  }

  function toggleSound() {
    if (state.settings.sound || state.settings.music) {
      state.settings.previousSound = state.settings.sound || 0.55;
      state.settings.previousMusic = state.settings.music || 0.35;
      state.settings.sound = 0;
      state.settings.music = 0;
    } else {
      state.settings.sound = state.settings.previousSound || 0.55;
      state.settings.music = state.settings.previousMusic || 0.35;
    }
    applySettings();
    audio.setMusicVolume();
    savePending = true;
  }

  function cycleBuyMode() {
    const modes = ['1', '10', '25', 'max'];
    buyMode = modes[(modes.indexOf(buyMode) + 1) % modes.length];
    $$('[data-buy-mode]').forEach(button => button.classList.toggle('active', button.dataset.buyMode === buyMode));
    updateTowerList();
  }

  function bindEvents() {
    initializeCustomSelects();
    $$('.modal').forEach(dialog => dialog.addEventListener('click', event => {
      if (event.target === dialog && dialog.open) dialog.close('cancel');
    }));
    ui.mainButton.addEventListener('click', manualPress);
    document.addEventListener('pointerdown', () => audio.ensure(), { once: true });

    document.addEventListener('click', event => {
      const pageButton = event.target.closest('[data-page-target]');
      if (pageButton) showPage(pageButton.dataset.pageTarget);
      const upgradeButton = event.target.closest('[data-buy-upgrade]');
      if (upgradeButton) buyUpgrade(upgradeButton.dataset.buyUpgrade);
      const towerButton = event.target.closest('[data-buy-tower]');
      if (towerButton) buyTower(towerButton.dataset.buyTower);
      const achievementButton = event.target.closest('[data-claim-achievement]');
      if (achievementButton) claimAchievement(achievementButton.dataset.claimAchievement);
      const auraButton = event.target.closest('[data-aura]');
      if (auraButton && !auraButton.disabled) equipAura(auraButton.dataset.aura);
      const coreButton = event.target.closest('[data-core-node]');
      if (coreButton) buyCoreNode(coreButton.dataset.coreNode);
      const converterTarget = event.target.closest('[data-converter-target]');
      if (converterTarget && !converterTarget.disabled) {
        state.converter.target = converterTarget.dataset.converterTarget;
        savePending = true;
        updateConverterUi();
      }
      const converterUpgrade = event.target.closest('[data-buy-converter-upgrade]');
      if (converterUpgrade) buyConverterUpgrade(converterUpgrade.dataset.buyConverterUpgrade);
      const converterPreset = event.target.closest('[data-converter-input]');
      if (converterPreset) setConverterInput(converterPreset.dataset.converterInput === 'max' ? Math.max(1, state.resources.crystals) : converterPreset.dataset.converterInput);
      const musicTrackButton = event.target.closest('[data-music-track]');
      if (musicTrackButton && state.ascension.nodes.musicPlayer >= 1) {
        audio.ensure({ startMusic: false });
        audio.playIndex(Number(musicTrackButton.dataset.musicTrack));
      }
      const specialTrackButton = event.target.closest('[data-jukebox-special-track]');
      if (specialTrackButton && state.ascension.nodes.musicPlayer >= 1 && !audio.glitchActive) {
        audio.ensure({ startMusic: false });
        audio.playSpecialTrack(GLITCH_TRACK_SOURCE, 'Glitch State Theme');
      }
      const jukeboxTabButton = event.target.closest('[data-jukebox-tab]');
      if (jukeboxTabButton && state.ascension.nodes.musicPlayer >= 1) setJukeboxTab(jukeboxTabButton.dataset.jukeboxTab);
      const jukeboxSoundButton = event.target.closest('[data-jukebox-sound]');
      if (jukeboxSoundButton && state.ascension.nodes.musicPlayer >= 1) {
        audio.play(jukeboxSoundButton.dataset.jukeboxSound);
        jukeboxSoundButton.classList.remove('playing');
        requestAnimationFrame(() => jukeboxSoundButton.classList.add('playing'));
        setTimeout(() => jukeboxSoundButton.classList.remove('playing'), 520);
      }
      const goldenSoundPreview = event.target.closest('[data-preview-golden-sound]');
      if (goldenSoundPreview && state.ascension.nodes.musicPlayer >= 1) previewGoldenSpawnSound(goldenSoundPreview.dataset.previewGoldenSound);
      const goldenSoundAction = event.target.closest('[data-golden-sound-action]');
      if (goldenSoundAction && state.ascension.nodes.musicPlayer >= 1) chooseGoldenSpawnSound(goldenSoundAction.dataset.goldenSoundAction);
      const commandButton = event.target.closest('[data-command-page]');
      if (commandButton) {
        showPage(commandButton.dataset.commandPage);
        ui.commandDialog.close();
      }
    });

    $$('[data-buy-mode]').forEach(button => button.addEventListener('click', () => {
      buyMode = button.dataset.buyMode;
      $$('[data-buy-mode]').forEach(item => item.classList.toggle('active', item === button));
      updateTowerList();
    }));

    $$('#upgradeCategories [data-upgrade-category]').forEach(button => button.addEventListener('click', () => {
      upgradeCategory = button.dataset.upgradeCategory;
      $$('#upgradeCategories button').forEach(item => item.classList.toggle('active', item === button));
      renderUpgrades();
    }));
    ui.upgradeSearch.addEventListener('input', renderUpgrades);
    ui.upgradeStatus.addEventListener('change', updateUpgradeCards);

    $$('#achievementCategories [data-achievement-category]').forEach(button => button.addEventListener('click', () => {
      achievementCategory = button.dataset.achievementCategory;
      $$('#achievementCategories button').forEach(item => item.classList.toggle('active', item === button));
      renderAchievements();
    }));
    ui.claimAllButton.addEventListener('click', claimAllAchievements);

    ui.reactionPad.addEventListener('click', reactionAction);
    ui.sequenceStart.addEventListener('click', startSequence);
    ui.sequenceBoard.addEventListener('click', event => {
      const button = event.target.closest('[data-sequence]');
      if (button) sequenceInput(Number(button.dataset.sequence));
    });
    ui.pulseButton.addEventListener('click', pulseAction);
    $$('[data-game-difficulty]').forEach(button => button.addEventListener('click', () => {
      setArcadeDifficulty(button.dataset.gameDifficulty, button.dataset.difficulty);
    }));
    ui.vectorStart.addEventListener('click', startVector);
    ui.vectorBoard.addEventListener('click', event => {
      const button = event.target.closest('[data-vector]');
      if (button) vectorInput(Number(button.dataset.vector));
    });
    ui.cipherStart.addEventListener('click', startCipher);
    ui.cipherBoard.addEventListener('click', event => {
      const button = event.target.closest('[data-cipher]');
      if (button) cipherInput(Number(button.dataset.cipher));
    });
    ui.stabilityPad.addEventListener('pointerdown', stabilityPointerDown);
    ui.stabilityPad.addEventListener('pointerup', stabilityPointerUp);
    ui.stabilityPad.addEventListener('pointercancel', stabilityPointerUp);

    ui.rollAuraButton.addEventListener('click', rollAura);
    ui.auraSearch.addEventListener('input', renderAuraCollection);
    ui.ascendButton.addEventListener('click', ascend);
    ui.confirmAscendButton.addEventListener('click', confirmAscension);
    ui.ascensionConfirmDialog.addEventListener('close', () => {
      if (ui.ascensionConfirmDialog.returnValue !== 'confirm') runtime.ascension.pendingGain = 0;
    });
    ui.beginCycleButton.addEventListener('click', beginNewCycle);
    ui.constellationViewport.addEventListener('pointerdown', startTreeDrag);
    ui.constellationViewport.addEventListener('pointermove', moveTree);
    ui.constellationViewport.addEventListener('pointerup', endTreeDrag);
    ui.constellationViewport.addEventListener('pointercancel', endTreeDrag);
    ui.constellationViewport.addEventListener('wheel', event => {
      event.preventDefault();
      zoomTree(event.deltaY < 0 ? 1.14 : 1 / 1.14, event.clientX, event.clientY);
    }, { passive: false });
    ui.treeZoomOut.addEventListener('click', () => zoomTree(1 / 1.2));
    ui.treeReset.addEventListener('click', resetTreeView);
    ui.treeZoomIn.addEventListener('click', () => zoomTree(1.2));
    ui.converterInput.addEventListener('input', () => {
      state.converter.input = clamp(safeInt(ui.converterInput.value, 1), 1, 1e9);
      savePending = true;
      updateConverterUi();
    });
    ui.converterInput.addEventListener('change', () => setConverterInput(ui.converterInput.value));
    ui.converterStartButton.addEventListener('click', startConverterJob);
    ui.converterCancelButton.addEventListener('click', cancelConverterJob);
    ui.musicPlayerButton.addEventListener('click', () => {
      renderMusicPlayer();
      setJukeboxTab(runtime.jukebox.tab);
      if (!ui.musicPlayerDialog.open) ui.musicPlayerDialog.showModal();
    });
    ui.musicPrevButton.addEventListener('click', () => { audio.ensure({ startMusic: false }); audio.previous(); });
    ui.musicPlayButton.addEventListener('click', () => audio.toggleMusic());
    ui.musicNextButton.addEventListener('click', () => { audio.ensure({ startMusic: false }); audio.next(); });
    ui.musicSeek.addEventListener('input', () => {
      if (audio.glitchActive || !audio.music?.duration) return;
      audio.music.currentTime = Number(ui.musicSeek.value) / 1000 * audio.music.duration;
      renderMusicPlayer();
    });

    $('#critDetailsButton').addEventListener('click', () => {
      renderCritDialog();
      ui.critDialog.showModal();
    });
    $('#commandButton').addEventListener('click', openCommand);
    ui.commandSearch.addEventListener('input', () => renderCommandResults(ui.commandSearch.value));
    ui.commandSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = $('.command-result.selected', ui.commandResults) || $('.command-result', ui.commandResults);
        if (selected) {
          showPage(selected.dataset.commandPage);
          ui.commandDialog.close();
        }
      }
    });

    $('#brandButton').addEventListener('click', () => {
      showPage('core');
      const now = Date.now();
      if (now - brandClickWindow > 4000) state.secrets.brandClicks = 0;
      brandClickWindow = now;
      state.secrets.brandClicks++;
      if (state.secrets.brandClicks >= 7) discoverSecret('sevenfold');
    });
    ui.systemClock.addEventListener('click', () => {
      const now = Date.now();
      if (now - clockClickWindow > 5000) state.secrets.clockClicks = 0;
      clockClickWindow = now;
      state.secrets.clockClicks++;
      if (state.secrets.clockClicks >= 9) discoverSecret('heartbeat');
    });

    ui.secretForm.addEventListener('submit', event => {
      event.preventDefault();
      const phrase = ui.secretInput.value.trim().toUpperCase().replace(/\s+/g, ' ');
      if (phrase === 'THE BUTTON REMEMBERS') {
        discoverSecret('echo');
        ui.secretInput.value = '';
      } else {
        toast('Signal rejected', 'The phrase does not match the archive.');
        audio.play('fail');
      }
    });

    ui.soundButton.addEventListener('click', toggleSound);
    ui.soundVolume.addEventListener('input', () => {
      state.settings.sound = Number(ui.soundVolume.value) / 100;
      ui.soundVolumeOutput.textContent = `${ui.soundVolume.value}%`;
      ui.soundIcon.innerHTML = fontAwesomeIcon(state.settings.sound || state.settings.music ? 'fa-volume-high' : 'fa-volume-xmark');
      savePending = true;
      audio.ensure({ startMusic: false });
      audio.play('click');
    });
    ui.musicVolume.addEventListener('input', () => {
      state.settings.music = Number(ui.musicVolume.value) / 100;
      ui.musicVolumeOutput.textContent = `${ui.musicVolume.value}%`;
      audio.ensure({ startMusic: false });
      audio.setMusicVolume();
      savePending = true;
    });
    ui.motionSetting.addEventListener('change', () => {
      state.settings.motion = ui.motionSetting.value;
      applySettings();
      savePending = true;
    });
    ui.numberFormat.addEventListener('change', () => {
      state.settings.numberFormat = ui.numberFormat.value;
      renderAll();
      savePending = true;
    });
    ui.fastNotesSetting.addEventListener('change', () => {
      state.settings.fastNotes = ui.fastNotesSetting.value === 'on';
      savePending = true;
      toast(
        state.settings.fastNotes ? 'Fast notes enabled' : 'Standard notes restored',
        state.settings.fastNotes ? 'Notifications now clear after one second.' : 'Notifications now remain visible for the standard duration.'
      );
    });

    $('#saveButton').addEventListener('click', () => { if (saveNow()) toast('Progress saved', 'The local save vault is current.'); });
    $('#exportButton').addEventListener('click', exportSave);
    $('#importButton').addEventListener('click', importSave);
    $('#resetButton').addEventListener('click', resetSave);
    $('#clearLogButton').addEventListener('click', () => { ui.eventLog.innerHTML = ''; });

    document.addEventListener('keydown', event => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openCommand();
        return;
      }
      if (typing || $('.modal[open]')) return;
      if (/^[1-8]$/.test(event.key)) showPage(NAV_ITEMS[Number(event.key) - 1].id);
      if (event.key.toLowerCase() === 's') showPage('system');
      if (event.key.toLowerCase() === 'm') toggleSound();
      if (event.key.toLowerCase() === 'b') cycleBuyMode();
      if (event.key === '/') {
        event.preventDefault();
        showPage('upgrades');
        setTimeout(() => ui.upgradeSearch.focus(), 60);
      }
      if ((event.code === 'Space' || event.key === 'Enter') && state.ui.page === 'core') {
        event.preventDefault();
        if (!event.repeat) manualPress(event);
      }
      konamiBuffer.push(event.key.toLowerCase());
      konamiBuffer = konamiBuffer.slice(-10);
      const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
      if (konami.every((key, index) => konamiBuffer[index] === key)) discoverSecret('upup');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        state.meta.lastSave = Date.now();
        saveNow();
      } else {
        lastWallTime = Date.now();
        if (state.golden.nextAt < Date.now()) state.golden.nextAt = Date.now() + 3000;
      }
    });
    window.addEventListener('beforeunload', saveNow);
    window.addEventListener('resize', () => {
      drawChart();
      if (runtime.tree.initialized) applyTreeTransform();
    }, { passive: true });
  }

  function renderAll() {
    ensureModifiers();
    updateTopUi();
    updateObjective();
    renderUpgrades();
    updateTowerList();
    renderAchievements();
    renderAuraCollection();
    updateRngUi();
    renderCoreTree();
    updateAscensionUi();
    buildConverterUi();
    updateConverterUi();
    renderSecrets();
    renderArcade();
    renderSystemStats();
    drawChart();
  }

  function gameLoop(time) {
    const wallNow = Date.now();
    const dt = clamp((wallNow - lastWallTime) / 1000, 0, 60);
    lastWallTime = wallNow;
    ensureModifiers();

    if (dt > 0) {
      const passive = currentBps * activeBuffMultiplier() * dt;
      addButtons(passive);
      if (mods.rngAutoCharge > 0 && state.rng.charge < 100) {
        state.rng.charge = clamp(state.rng.charge + mods.rngAutoCharge * dt, 0, 100);
        savePending = true;
      }
      state.totals.playSeconds += Math.min(dt, 1);
      state.totals.bestBps = Math.max(state.totals.bestBps, currentBps * activeBuffMultiplier());
    }
    state.buffs = state.buffs.filter(buff => buff.until > wallNow);
    updateGlitchStatus(wallNow);
    updateGoldenRush(wallNow);
    updateConverter(wallNow);

    if (time - lastManualPress > 650 && combo > 0) combo = Math.max(0, combo - dt * 5);
    if (runtime.pulse.active) ui.pulseMarker.style.left = `${pulsePosition(time)}%`;
    updateTimedArcadeGames(time);

    if (!state.ascension.inLimbo && wallNow >= state.golden.nextAt) rollGoldenChance();
    for (const golden of goldenElements) {
      if (wallNow >= Number(golden.dataset.expiresAt)) expireGolden(golden);
    }

    if (time - lastUiUpdate >= 100) {
      lastUiUpdate = time;
      updateTopUi();
      updateRngUi();
      updateAscensionUi();
      renderArcade();
      updateObjective();
      updateCritAndAchievementBadges();
      if (state.ui.page === 'upgrades') updateUpgradeCards();
      if (state.ui.page === 'towers') updateTowerList();
      if (state.ui.page === 'achievements') updateAchievementCards();
      if (state.ui.page === 'observatory') updateAuraOdds();
      if (state.ui.page === 'converter') updateConverterUi(wallNow);
      if (ui.musicPlayerDialog.open) updateGoldenSoundShop();
    }

    if (time - lastHeavyUpdate >= 650) {
      lastHeavyUpdate = time;
      if (state.ui.page === 'system') renderSystemStats();
      renderSecrets();
    }

    if (time - lastChartSample >= 1000) {
      lastChartSample = time;
      chartSamples.push(currentBps * activeBuffMultiplier());
      chartSamples.shift();
      drawChart();
    }

    if ((savePending || time - lastSaveAt > 15000) && time - lastSaveAt > 5000) saveNow();
    requestAnimationFrame(gameLoop);
  }

  async function init() {
    const loaderSteps = [
      [18, 'Restoring reactor memory…'],
      [42, 'Balancing tower network…'],
      [68, 'Mapping critical routes…'],
      [88, 'Tuning golden receiver…'],
      [100, 'Pressure system nominal.']
    ];
    for (const [progress, text] of loaderSteps) {
      ui.loaderFill.style.width = `${progress}%`;
      ui.loaderTip.textContent = text;
      await delay(state.settings.motion === 'off' ? 5 : 90);
    }

    applySettings();
    ensureModifiers();
    buildTowerList();
    renderCommandResults();
    bindEvents();
    grantOfflineProgress();
    renderAll();
    showPage(state.ascension.inLimbo ? 'ascension' : state.ui.page);
    updateGlitchStatus(Date.now());
    $$('[data-buy-mode]').forEach(button => button.classList.toggle('active', button.dataset.buyMode === buyMode));

    logEvent('Reactor v2.0 online', `${audio.tracks.length} Reactor Radio tracks indexed. Progression, controls, and the visible golden-signal receiver are initialized.`, 'good');
    if (loadResult.migrated) logEvent('Legacy save migrated', 'v1 resources, towers, upgrades, critical progress, RNG, and prestige were translated into v2.', 'rare');
    if (loadResult.backup) logEvent('Backup recovered', 'The primary save was damaged, so the last valid backup was restored.', 'gold');

    saveNow();
    ui.app.classList.add('ready');
    ui.app.setAttribute('aria-hidden', 'false');
    ui.loader.classList.add('ready');
    setTimeout(() => ui.loader.remove(), 500);
    requestAnimationFrame(gameLoop);
  }

  init().catch(error => {
    console.error('Initialization failed.', error);
    ui.loaderTip.textContent = 'Recovery mode active. Reload to retry.';
    ui.app.classList.add('ready');
    ui.app.setAttribute('aria-hidden', 'false');
    ui.loader.classList.add('ready');
  });
})();
