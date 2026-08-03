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
  const CORE_TREE_WIDTH = 6800;
  const CORE_TREE_HEIGHT = 6400;
  const CORE_NODE_RADIUS = 34;
  const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
  const MANUAL_RNG_CHARGE = 0.01;
  const AURA_SCAN_COST = 25;
  const BASE_COMBO_LIMIT = 20;
  const COMBO_LIMIT_MULTIPLIERS = Object.freeze([1, 2, 5, 10]);
  const NEVER_CLICK_TARGET = 1e9;
  const MAX_PASSIVE_RNG_CHARGE_PER_SECOND = 1;
  const TOWER_BUY_MAX_ALL_CRYSTAL_COST = 15000;
  const CRYSTALS_PER_SCANNER_CHARGE = 10;
  const MIN_CONVERTER_INPUT = 0.000001;
  const MAX_CONVERTER_INPUT = 1e9;
  const CONVERTER_INPUT_DECIMALS = 6;
  const CONVERTER_INPUT_EPSILON = 1e-9;
  const CONVERTER_BASE_DURATION_SECONDS = 30;
  const CONVERTER_BATCH_TIME_GROWTH = 1.5;
  const TUTORIAL_VERSION = '2.0-complete-tour-1';
  const BASIC_NUMBER_SUFFIXES = Object.freeze(['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']);
  const ILLION_ONES_PREFIXES = Object.freeze(['', 'U', 'D', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No']);
  const ILLION_TENS_SUFFIXES = Object.freeze(['', 'D', 'Vg', 'Tg', 'Qag', 'Qig', 'Sxg', 'Spg', 'Ocg', 'Nog']);
  const MAX_NUMBER_SUFFIX_TIER = Math.floor(Math.log10(Number.MAX_VALUE) / 3);
  const GOLDEN_ONE_IN = 3333;
  const GOLDEN_MIN_ONE_IN = 333;
  const GOLDEN_CONVERGENCE_TARGETS = Object.freeze([Infinity, 480, 438, 398, 364, 333]);
  const AURA_LUCK_BONUSES = Object.freeze([0, 0.05, 0.10, 0.20]);
  const ENTROPY_CHARGE_RATES = Object.freeze([0, 0.0025, 0.005, 0.01]);
  const GLITCHED_GOLDEN_ONE_IN = 30404;
  const NG_PLUS_GLITCHED_GOLDEN_ONE_IN = 4040;
  const GOLDEN_RUSH_ONE_IN = 333;
  const GOLDEN_RUSH_DURATION_MS = 15000;
  const GOLDEN_RUSH_INTERVAL_MS = 300;
  const GLITCH_DURATION_MS = 33000;
  const GLITCH_FADE_MS = 2000;
  const GLITCH_BURST_INTERVAL_MS = 8000;
  const GLITCH_MULTIPLIER = 3333;
  const GLITCH_TRACK_SOURCE = './music/music_glitch.mp3?v=20260729-direct-audio';
  const EVERYTHING_CHEAT_CODE = 'Z2l2ZW1lZXZlcnl0aGluZ3RoYXRpc2ludGhlZ2FtZXJpZ2h0bm93ISEhISEhISE=';
  const EVERYTHING_CHEAT_RESOURCE_AMOUNT = 1e300;

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
    { id: 'facetedBit', name: 'Recursive Transmutation Drill', icon: 'RT', cost: 250, max: 1000, repeatable: true, detail: 'Button conversion yield starts at ×5.00. Every later level uses the previous total as N and calculates the new total as N^1.1.', effect: { kind: 'converterRecursiveYield', value: 5, exponent: 1.1 } },
    { id: 'pulseMotor', name: 'Pulse Motor', icon: 'PM', cost: 60, detail: 'Mining speed ×1.30.', effect: { kind: 'converterSpeed', value: 1.3 } },
    { id: 'leanCatalyst', name: 'Lean Catalyst', icon: 'LC', cost: 300, detail: 'Each crystal counts as 1.20 for Button recovery.', effect: { kind: 'converterEfficiency', value: 1.2 } },
    { id: 'dualShaft', name: 'Dual-Shaft Bore', icon: 'DS', cost: 1400, detail: 'Mining speed ×1.65.', effect: { kind: 'converterSpeed', value: 1.65 } },
    { id: 'spectrumGate', name: 'Spectrum Gate', icon: 'SG', cost: 6500, detail: 'Unlock crystal conversion into Scanner Charge.', unlock: 'charge' },
    { id: 'deepMantle', name: 'Deep-Mantle Sifter', icon: 'DM', cost: 22000, detail: 'Button converter yield ×2.50.', effect: { kind: 'converterYield', value: 2.5 } },
    { id: 'recoveryValve1', name: 'Recovery Valve I', icon: 'RV1', cost: 5000, detail: 'Canceled mining cycles refund 40% of their Crystal input.', effect: { kind: 'converterRefund', value: 0.4 } },
    { id: 'recoveryValve2', name: 'Recovery Valve II', icon: 'RV2', cost: 35000, detail: 'Canceled mining cycles refund 60% of their Crystal input.', requires: 'recoveryValve1', effect: { kind: 'converterRefund', value: 0.6 } },
    { id: 'recoveryValve3', name: 'Recovery Valve III', icon: 'RV3', cost: 245000, detail: 'Canceled mining cycles refund 80% of their Crystal input.', requires: 'recoveryValve2', effect: { kind: 'converterRefund', value: 0.8 } }
  ];

  const CONVERTER_RECIPES = [
    { id: 'buttons', name: 'Button Ore', icon: 'B', detail: 'Compress crystal structure into immediate Buttons.' },
    { id: 'charge', name: 'Scanner Charge', icon: 'R', detail: 'Fixed calibration: every 10 crystals produce exactly 1 Scanner Charge.' }
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
  const TOWER_BY_ID = new Map(TOWERS.map(tower => [tower.id, tower]));

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

  const TOWER_EVOLUTION_UPGRADES = TOWERS.slice(0, -1).flatMap((tower, index) => {
    const stageTwoCost = tower.baseCost * 1e4 * Math.pow(2.4, index);
    const stageThreeCost = tower.baseCost * 1e8 * Math.pow(3.2, index);
    return [
      upgrade(
        `${tower.id}2`,
        `${tower.name} Resonance`,
        'production',
        stageTwoCost,
        `${tower.icon}+`,
        `A second-generation mastery package extends every installed ${tower.name}.`,
        `${tower.name} output Ã—3`,
        { kind: 'tower', tower: tower.id, value: 3 },
        { requires: `${tower.id}1`, type: 'tower', tower: tower.id, value: 25 }
      ),
      upgrade(
        `${tower.id}3`,
        `${tower.name} Singularity`,
        'production',
        stageThreeCost,
        `${tower.icon}++`,
        `The final standard-cycle architecture lets ${tower.name} operate as one synchronized system.`,
        `${tower.name} output Ã—5`,
        { kind: 'tower', tower: tower.id, value: 5 },
        { requires: `${tower.id}2`, type: 'tower', tower: tower.id, value: 50 }
      )
    ];
  });

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
    upgrade('feedback1', 'Motion Feedback', 'press', 4e14, 'MF', 'Route a fraction of the live tower rhythm back through every manual press.', 'Each press gains 0.02 seconds of tower output', { kind: 'clickBps', value: 0.02 }, { requires: 'click10', type: 'buttons', value: 1e14 }),
    upgrade('feedback2', 'Network Grip', 'press', 2e17, 'NG', 'Synchronize hand pressure with the first automation bus.', 'Each press gains 0.03 seconds of tower output', { kind: 'clickBps', value: 0.03 }, { requires: 'feedback1', type: 'buttons', value: 6e16 }),
    upgrade('feedback3', 'Industrial Recoil', 'press', 1e20, 'IR', 'Capture recoil from every tower and return it through the reactor face.', 'Each press gains 0.05 seconds of tower output', { kind: 'clickBps', value: 0.05 }, { requires: 'feedback2', type: 'buttons', value: 3e19 }),
    upgrade('feedback4', 'Causal Feedback', 'press', 8e23, 'CF', 'Let the tower network answer the operator before the press has finished.', 'Each press gains 0.08 seconds of tower output', { kind: 'clickBps', value: 0.08 }, { requires: 'feedback3', type: 'buttons', value: 2e23 }),
    upgrade('feedback5', 'Operator Synchrony', 'press', 4e26, 'OS', 'Merge manual intent with the complete automated production waveform.', 'Each press gains 0.12 seconds of tower output', { kind: 'clickBps', value: 0.12 }, { requires: 'feedback4', type: 'buttons', value: 1e26 }),

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
    ...TOWER_EVOLUTION_UPGRADES,

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
  const UPGRADE_BY_ID = new Map(UPGRADES.map(item => [item.id, item]));

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

  const AURA_BY_ID = new Map(AURAS.map(item => [item.id, item]));
  const AURA_INDEX_BY_ID = new Map(AURAS.map((item, index) => [item.id, index]));

  const BASE_CORE_NODES = [
    { id: 'starter', name: 'Seed Voltage', symbol: 'I', max: 5, baseCost: 1, x: 1100, y: 1390, requires: {}, effects: [{ kind: 'startButtons', value: 100000 }], desc: 'Begin each cycle with 100K more buttons per level.' },
    { id: 'force', name: 'Operator Force', symbol: 'F', max: 10, baseCost: 10, x: 790, y: 1210, requires: { starter: 1 }, effects: [{ kind: 'clickMult', value: 1.18 }], desc: 'Permanent press power ×1.18 per level.' },
    { id: 'network', name: 'Network Memory', symbol: 'N', max: 10, baseCost: 10, x: 1410, y: 1210, requires: { starter: 1 }, effects: [{ kind: 'towerGlobal', value: 1.15 }], desc: 'Permanent tower output ×1.15 per level.' },
    { id: 'operatorFeedback', name: 'Operator Feedback', symbol: 'OF', max: 3, baseCost: 50000000, x: 1100, y: 1080, requires: { force: 3, network: 3 }, effects: [{ kind: 'clickBps', value: 0.05 }], desc: 'Each level permanently adds 0.05 seconds of current tower output to every manual press.' },

    { id: 'probability', name: 'Probability Weave', symbol: '%', max: 5, baseCost: 850, x: 430, y: 1010, requires: { force: 2 }, effects: [], desc: 'Critical chance +2.5% per level; one of the required routes to the 75% cap.' },
    { id: 'overdrive', name: 'Contact Overdrive', symbol: 'X', max: 5, baseCost: 600, x: 780, y: 950, requires: { force: 2 }, effects: [{ kind: 'critPower', value: 0.75 }], desc: 'Permanent critical power +0.75× per level.' },
    { id: 'fortune', name: 'Signal Fortune', symbol: 'G', max: 5, baseCost: 700, x: 1420, y: 950, requires: { network: 2 }, effects: [{ kind: 'goldenFrequency', value: 0.18 }, { kind: 'charge', value: 1.2 }], desc: 'Golden frequency +18% and scanner charge ×1.20 per level.' },
    { id: 'endurance', name: 'Temporal Battery', symbol: 'T', max: 5, baseCost: 600, x: 1770, y: 1010, requires: { network: 2 }, effects: [{ kind: 'offline', value: 0.08 }], desc: 'Offline output efficiency +8% per level.' },

    { id: 'impactVault', name: 'Impact Vault', symbol: 'IV', max: 3, baseCost: 25000, x: 160, y: 780, requires: { probability: 2 }, effects: [{ kind: 'clickMult', value: 1.75 }], desc: 'Archived impact profiles multiply press power by 1.75 per level.' },
    { id: 'pressureArchive', name: 'Pressure Archive', symbol: 'PA', max: 3, baseCost: 35000, x: 480, y: 720, requires: { probability: 3 }, effects: [{ kind: 'clickBase', value: 1000000 }], desc: 'Add 1 million permanent base press power per level.' },
    { id: 'comboMatrix', name: 'Combo Matrix', symbol: 'CM', max: 3, baseCost: 45000, x: 790, y: 690, requires: { overdrive: 2 }, effects: [{ kind: 'global', value: 1.4 }], desc: 'Retained rhythm multiplies all output by 1.40 per level.' },
    { id: 'cadenceReservoir', name: 'Cadence Reservoir', symbol: 'CR', max: 3, baseCost: 5e12, costGrowth: 500, x: 790, y: 520, requires: { comboMatrix: 3 }, effects: [], desc: 'Expand the maximum Combo from 20 to 40, then 100, and finally 200 stacks (×2 / ×5 / ×10). Each level costs 500× the previous one.' },
    { id: 'precisionCrown', name: 'Precision Crown', symbol: 'PC', max: 3, baseCost: 75000, x: 1010, y: 790, requires: { overdrive: 3 }, effects: [{ kind: 'critPower', value: 2 }], desc: 'Permanent critical power +2× per level without bypassing the 75% chance cap.' },

    { id: 'capacitor', name: 'Infinite Capacitor', symbol: 'IC', max: 3, baseCost: 100000, x: 1260, y: 720, requires: { fortune: 2 }, effects: [{ kind: 'charge', value: 1.8 }], desc: 'Scanner charge generation ×1.80 per level.' },
    { id: 'entropyBattery', name: 'Entropy Battery', symbol: 'EB', max: 3, baseCost: 4000000000, x: 1380, y: 575, requires: { capacitor: 3 }, effects: [], desc: 'Passive scanner charge: 0.0025/s at level one, 0.005/s at level two, and 0.01/s at maximum.' },
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

    { id: 'crystalDrill', name: 'Crystal Drill Memory', symbol: 'CD', max: 3, baseCost: 7000000, x: 1120, y: 590, requires: { capacitor: 2 }, effects: [{ kind: 'converterYield', value: 1.75 }], desc: 'Permanent Button Converter yield ×1.75 per level.' },
    { id: 'phaseRotor', name: 'Phase Rotor', symbol: 'PR', max: 3, baseCost: 1100000000, x: 1080, y: 420, requires: { crystalDrill: 2 }, effects: [{ kind: 'converterSpeed', value: 1.6 }], desc: 'Permanent mining speed ×1.60 per level.' },
    { id: 'prismaticCatalyst', name: 'Prismatic Catalyst', symbol: 'PC', max: 3, baseCost: 230000000000, x: 1120, y: 255, requires: { phaseRotor: 2 }, effects: [{ kind: 'converterEfficiency', value: 1.35 }], desc: 'Each spent crystal counts as 1.35 for Button recovery per level.' },
    { id: 'realityKernel', name: 'Reality Kernel', symbol: 'RK', max: 3, baseCost: 400000000000, x: 900, y: 125, requires: { signalCompiler: 3, crystalMemory: 3 }, effects: [{ kind: 'global', value: 10 }], desc: 'Rewrite the next cycle around a permanent ×10 all output per level.' },
    { id: 'singularityCrown', name: 'Singularity Crown', symbol: 'SG', max: 3, baseCost: 700000000000, x: 790, y: 85, requires: { cycleArchive: 3, signalCompiler: 3 }, effects: [{ kind: 'critPower', value: 10 }, { kind: 'global', value: 5 }], desc: 'Critical power +10× and all output ×5 per level.' },
    { id: 'stellarLuck', name: 'Stellar Fortune', symbol: 'SF', max: 3, baseCost: 9000000000000, x: 1510, y: 105, requires: { crystalMemory: 3, temporalVault: 3 }, effects: [{ kind: 'goldenFrequency', value: 1 }, { kind: 'goldenReward', value: 10 }], desc: 'Double golden frequency and multiply golden rewards by 10 per level.' },
    { id: 'goldenConvergence', name: 'Golden Convergence', symbol: '1/N', max: 5, baseCost: 20000000000000, x: 1760, y: 105, requires: { stellarLuck: 3, radiantEngine: 3 }, effects: [], desc: 'Stabilize natural golden signals through 1/480, 1/438, 1/398, 1/364, then the absolute 1/333-per-second cap. Glitched odds never change.' },
    { id: 'musicPlayer', name: 'Heavenly Jukebox', symbol: 'JB', max: 1, baseCost: 8000000000000000, x: 2000, y: 100, requires: { temporalVault: 3, stellarLuck: 1 }, effects: [], desc: 'Late-cycle unlock: play every indexed music track and preview every sound in the Reactor.' }
  ];

  const HEAVENLY_LANE_X = Object.freeze(Array.from({ length: 12 }, (_, lane) => 420 + lane * 535));
  const BASE_CORE_LAYOUT = Object.freeze({
    starter: { x: 3370, y: 100 },
    force: { x: 1900, y: 280 },
    network: { x: 4900, y: 280 },
    operatorFeedback: { x: HEAVENLY_LANE_X[5], y: 850 },
    probability: { x: 850, y: 480 },
    overdrive: { x: 2200, y: 480 },
    fortune: { x: 4000, y: 480 },
    endurance: { x: 5650, y: 480 },
    impactVault: { x: 500, y: 680 },
    pressureArchive: { x: 950, y: 680 },
    comboMatrix: { x: 1550, y: 680 },
    cadenceReservoir: { x: 1550, y: 910 },
    precisionCrown: { x: HEAVENLY_LANE_X[3], y: 850 },
    capacitor: { x: 3500, y: 680 },
    entropyBattery: { x: HEAVENLY_LANE_X[6], y: 930 },
    auraResonance: { x: 3850, y: 1190 },
    goldenMemory: { x: 4300, y: 680 },
    offlineArchive: { x: 5200, y: 680 },
    towerSchema: { x: HEAVENLY_LANE_X[11], y: 850 },
    resonance: { x: 900, y: 880 },
    kineticEngine: { x: 1850, y: 1080 },
    auricReceiver: { x: HEAVENLY_LANE_X[7], y: 900 },
    radiantEngine: { x: 4700, y: 880 },
    automationCore: { x: HEAVENLY_LANE_X[10], y: 1050 },
    cycleArchive: { x: HEAVENLY_LANE_X[2], y: 1120 },
    signalCompiler: { x: 1250, y: 1080 },
    crystalMemory: { x: 3000, y: 1150 },
    temporalVault: { x: HEAVENLY_LANE_X[9], y: 1250 },
    crystalDrill: { x: 2800, y: 830 },
    phaseRotor: { x: 2700, y: 1050 },
    prismaticCatalyst: { x: HEAVENLY_LANE_X[4], y: 1320 },
    realityKernel: { x: HEAVENLY_LANE_X[1], y: 1400 },
    singularityCrown: { x: HEAVENLY_LANE_X[0], y: 1400 },
    stellarLuck: { x: 4500, y: 1360 },
    goldenConvergence: { x: 5050, y: 1480 },
    musicPlayer: { x: HEAVENLY_LANE_X[8], y: 1410 }
  });
  const ARRANGED_BASE_CORE_NODES = BASE_CORE_NODES.map(node => ({
    ...node,
    ...(BASE_CORE_LAYOUT[node.id] || {})
  }));

  const HEAVENLY_STAGE_NAMES = [
    'Ignition', 'Relay', 'Conduit', 'Lattice', 'Manifold', 'Archive',
    'Engine', 'Nexus', 'Prism', 'Vector', 'Horizon', 'Continuum',
    'Paradox', 'Singularity', 'Absolute', 'Transfinite', 'Aeternum', 'Apex'
  ];

  const HEAVENLY_CONSTELLATIONS = [
    {
      id: 'operator', name: 'Operator', symbol: 'O', icon: 'fa-hand-fist', lane: 5, anchor: 'operatorFeedback', anchorLevel: 3, baseCost: 2e12,
      effects: step => step % 3 === 0
        ? [{ kind: 'clickBps', value: 0.004 + step * 0.0002 }]
        : [{ kind: 'clickMult', value: 1.08 + step * 0.006 }]
    },
    {
      id: 'automation', name: 'Automation', symbol: 'A', icon: 'fa-gears', lane: 10, anchor: 'automationCore', anchorLevel: 3, baseCost: 5e12,
      effects: step => step % 4 === 3
        ? [{ kind: 'global', value: 1.04 + step * 0.004 }]
        : [{ kind: 'towerGlobal', value: 1.07 + step * 0.006 }]
    },
    {
      id: 'auric', name: 'Auric', symbol: 'G', icon: 'fa-sun', lane: 7, anchor: 'auricReceiver', anchorLevel: 3, baseCost: 8e12,
      effects: step => step % 3 === 2
        ? [{ kind: 'goldenFrequency', value: 0.025 + step * 0.001 }]
        : [{ kind: 'goldenReward', value: 1.08 + step * 0.007 }]
    },
    {
      id: 'entropy', name: 'Entropy', symbol: 'E', icon: 'fa-battery-full', lane: 6, anchor: 'entropyBattery', anchorLevel: 3, baseCost: 1.4e13,
      effects: step => step % 3 === 0
        ? [{ kind: 'global', value: 1.055 + step * 0.004 }]
        : [{ kind: 'charge', value: 1.07 + step * 0.006 }]
    },
    {
      id: 'prismatic', name: 'Prismatic', symbol: 'P', icon: 'fa-gem', lane: 4, anchor: 'prismaticCatalyst', anchorLevel: 3, baseCost: 3e13,
      effects: step => [
        { kind: ['converterYield', 'converterSpeed', 'converterEfficiency'][step % 3], value: 1.055 + step * 0.004 }
      ]
    },
    {
      id: 'temporal', name: 'Temporal', symbol: 'T', icon: 'fa-clock-rotate-left', lane: 9, anchor: 'temporalVault', anchorLevel: 3, baseCost: 7e13,
      effects: step => step % 3 === 0
        ? [{ kind: 'offline', value: 0.015 + step * 0.0005 }]
        : [{ kind: 'global', value: 1.055 + step * 0.005 }]
    },
    {
      id: 'genesis', name: 'Genesis', symbol: 'S', icon: 'fa-seedling', lane: 2, anchor: 'cycleArchive', anchorLevel: 3, baseCost: 2e14,
      effects: step => step % 3 === 0
        ? [{ kind: 'startButtons', value: 1e12 * Math.pow(10, Math.floor(step / 3)) }]
        : [{ kind: 'global', value: 1.06 + step * 0.005 }]
    },
    {
      id: 'precision', name: 'Precision', symbol: 'C', icon: 'fa-crosshairs', lane: 3, anchor: 'precisionCrown', anchorLevel: 3, baseCost: 5e14,
      effects: step => step % 2
        ? [{ kind: 'clickMult', value: 1.07 + step * 0.006 }]
        : [{ kind: 'critPower', value: 0.35 + step * 0.04 }]
    },
    {
      id: 'schema', name: 'Schema', symbol: 'H', icon: 'fa-network-wired', lane: 11, anchor: 'towerSchema', anchorLevel: 3, baseCost: 1e15,
      effects: step => [{ kind: 'towerGlobal', value: 1.09 + step * 0.007 }]
    },
    {
      id: 'reality', name: 'Reality', symbol: 'R', icon: 'fa-cube', lane: 1, anchor: 'realityKernel', anchorLevel: 3, baseCost: 3e15,
      effects: step => [{ kind: 'global', value: 1.09 + step * 0.008 }]
    },
    {
      id: 'sonic', name: 'Sonic', symbol: 'J', icon: 'fa-compact-disc', lane: 8, anchor: 'musicPlayer', anchorLevel: 1, baseCost: 8e15,
      effects: step => step % 3 === 0
        ? [{ kind: 'global', value: 1.055 + step * 0.005 }]
        : [{ kind: 'goldenReward', value: 1.1 + step * 0.008 }]
    },
    {
      id: 'singularity', name: 'Singularity', symbol: 'X', icon: 'fa-atom', lane: 0, anchor: 'singularityCrown', anchorLevel: 3, baseCost: 2e16,
      effects: step => [
        { kind: step % 2 ? 'towerGlobal' : 'global', value: 1.11 + step * 0.009 },
        { kind: 'clickMult', value: 1.06 + step * 0.005 }
      ]
    }
  ];

  function describeHeavenlyEffects(effects) {
    return effects.map(effect => {
      if (effect.kind === 'clickBps') return `manual presses inherit +${effect.value.toFixed(3)} seconds of tower output`;
      if (effect.kind === 'clickMult') return `press power x${effect.value.toFixed(3)}`;
      if (effect.kind === 'towerGlobal') return `tower output x${effect.value.toFixed(3)}`;
      if (effect.kind === 'global') return `all output x${effect.value.toFixed(3)}`;
      if (effect.kind === 'goldenFrequency') return `golden frequency +${(effect.value * 100).toFixed(1)}%`;
      if (effect.kind === 'goldenReward') return `golden rewards x${effect.value.toFixed(3)}`;
      if (effect.kind === 'charge') return `scanner charge x${effect.value.toFixed(3)}`;
      if (effect.kind === 'converterYield') return `button converter yield x${effect.value.toFixed(3)}`;
      if (effect.kind === 'converterSpeed') return `converter speed x${effect.value.toFixed(3)}`;
      if (effect.kind === 'converterEfficiency') return `button crystal efficiency x${effect.value.toFixed(3)}`;
      if (effect.kind === 'offline') return `offline recovery +${(effect.value * 100).toFixed(1)}%`;
      if (effect.kind === 'startButtons') return `starting reserve +${formatSuffixNumber(effect.value, 1)} buttons`;
      if (effect.kind === 'critPower') return `critical power +${effect.value.toFixed(2)}x`;
      return 'permanent Reactor calibration';
    }).join(' and ');
  }

  const HEAVENLY_EXPANSION_NODES = HEAVENLY_CONSTELLATIONS.flatMap(branch =>
    HEAVENLY_STAGE_NAMES.map((stage, step) => {
      const effects = branch.effects(step);
      const id = `${branch.id}${String(step + 1).padStart(2, '0')}`;
      const previousId = `${branch.id}${String(step).padStart(2, '0')}`;
      return {
        id,
        name: branch.id === 'sonic' && step === 0 ? 'Sonic Resonator' : `${branch.name} ${stage}`,
        symbol: `${branch.symbol}${step + 1}`,
        icon: branch.icon,
        max: 3,
        baseCost: branch.baseCost * Math.pow(12, step),
        x: HEAVENLY_LANE_X[branch.lane] + Math.sin(step * 0.92 + branch.lane * 0.7) * 105,
        y: 1710 + step * 194,
        requires: step === 0 ? { [branch.anchor]: branch.anchorLevel } : { [previousId]: step % 5 === 0 ? 2 : 1 },
        effects,
        desc: `Constellation ${step + 1} of 18: ${describeHeavenlyEffects(effects)} per level.`
      };
    })
  );

  const HEAVENLY_CAPSTONE_NODES = [{
    id: 'autonomousArchitect',
    name: 'Autonomous Architect',
    symbol: 'AA',
    icon: 'fa-wand-magic-sparkles',
    max: 1,
    baseCost: 5e12 * Math.pow(12, 18),
    x: HEAVENLY_LANE_X[10],
    y: 5480,
    requires: { automation18: 3 },
    effects: [{ kind: 'autoUpgrades', value: 1 }],
    desc: 'Final automation protocol: immediately installs every standard upgrade whenever its requirements and Button cost are both satisfied.'
  }];

  const PRE_FINAL_CORE_NODES = [...ARRANGED_BASE_CORE_NODES, ...HEAVENLY_EXPANSION_NODES, ...HEAVENLY_CAPSTONE_NODES];

  function totalMaxedCoreCost(nodes) {
    return nodes.reduce((treeTotal, node) => {
      let nodeTotal = 0;
      for (let level = 0; level < node.max; level++) {
        nodeTotal = Math.min(Number.MAX_VALUE, nodeTotal + Math.ceil(node.baseCost * Math.pow(node.costGrowth ?? CORE_COST_GROWTH, level)));
      }
      return Math.min(Number.MAX_VALUE, treeTotal + nodeTotal);
    }, 0);
  }

  const FINAL_HEAVENLY_PRICE = Math.min(Number.MAX_VALUE, totalMaxedCoreCost(PRE_FINAL_CORE_NODES) * 1000000);
  const FINAL_BRANCH_REQUIREMENTS = Object.fromEntries([
    ...HEAVENLY_CONSTELLATIONS.map(branch => [`${branch.id}18`, 3]),
    ...HEAVENLY_CAPSTONE_NODES.map(node => [node.id, node.max])
  ]);
  const FINAL_HEAVENLY_NODE = {
    id: 'absoluteAscendancy',
    name: 'Absolute Ascendancy',
    symbol: 'Ω',
    icon: 'fa-crown',
    max: 1,
    baseCost: FINAL_HEAVENLY_PRICE,
    x: CORE_TREE_WIDTH / 2,
    y: 6100,
    requires: FINAL_BRANCH_REQUIREMENTS,
    requiresAllMax: true,
    effects: [
      { kind: 'rngLuck', value: 10 },
      { kind: 'crystalGain', value: 5 },
      { kind: 'chargeRestore', value: 5 },
      { kind: 'manualRngCharge', value: 0.1 },
      { kind: 'auraScanCost', value: 15 }
    ],
    desc: 'The final Heavenly protocol. Aura luck ×10, all crystal rewards ×5, charge restoration ×5, physical presses restore 0.1 charge, and aura scans cost only 15 charge.'
  };

  const CORE_NODES = [...PRE_FINAL_CORE_NODES, FINAL_HEAVENLY_NODE];
  const CORE_NODE_BY_ID = new Map(CORE_NODES.map(node => [node.id, node]));
  const NG_PLUS_ACHIEVEMENT_ID = 'beyondAbsolute';

  const achievement = (id, name, category, icon, desc, metric, target, reward, options = {}) => ({
    id, name, category, icon, desc, metric, target, reward, ...options
  });

  const ACHIEVEMENTS = [
    achievement('press25', 'Contact', 'press', 'fa-hand-pointer', 'Press the reactor 25 times.', 'clicks', 25, { kind: 'crystals', value: 3 }),
    achievement('press500', 'Muscle Memory', 'press', 'fa-hand-fist', 'Press the reactor 500 times.', 'clicks', 500, { kind: 'crystals', value: 80 }),
    achievement('press10k', 'Operator', 'press', 'fa-gauge-high', 'Press the reactor 10,000 times.', 'clicks', 10000, { kind: 'global', value: 1.04 }),
    achievement('press1m', 'One in a Million', 'press', 'fa-bullseye', 'Press the reactor 1,000,000 times.', 'clicks', 1e6, { kind: 'crit', value: 0.01 }),
    achievement('press10m', 'Pressure Without End', 'press', 'fa-infinity', 'Press the reactor 10 million times.', 'clicks', 1e7, { kind: 'crystals', value: 30000 }),
    achievement('crit100', 'Sharp Contact', 'press', 'fa-crosshairs', 'Land 100 critical presses.', 'crits', 100, { kind: 'crystals', value: 120 }),
    achievement('crit10k', 'Golden Reflex', 'press', 'fa-burst', 'Land 10,000 critical presses.', 'crits', 10000, { kind: 'global', value: 1.07 }),
    achievement('crit1m', 'Probability Engine', 'press', 'fa-dice-d20', 'Land 100,000 critical presses.', 'crits', 100000, { kind: 'crystals', value: 10000 }),

    achievement('earn1k', 'Four Figures', 'production', 'fa-coins', 'Produce 1,000 lifetime buttons.', 'buttons', 1000, { kind: 'crystals', value: 10 }),
    achievement('earn1m', 'Signal Millionaire', 'production', 'fa-sack-dollar', 'Produce 1 million lifetime buttons.', 'buttons', 1e6, { kind: 'seconds', value: 180 }),
    achievement('earn1b', 'Industrial Scale', 'production', 'fa-industry', 'Produce 1 billion lifetime buttons.', 'buttons', 1e9, { kind: 'crystals', value: 250 }),
    achievement('earn1t', 'Twelve Zeroes', 'production', 'fa-chart-line', 'Produce 1 trillion lifetime buttons.', 'buttons', 1e12, { kind: 'global', value: 1.1 }),
    achievement('earn1e18', 'Impossible Economy', 'production', 'fa-infinity', 'Produce 1 quintillion lifetime buttons.', 'buttons', 1e18, { kind: 'crit', value: 0.01 }),
    achievement('earn1e30', 'Stellar Economy', 'production', 'fa-star', 'Produce 1 nonillion lifetime buttons.', 'buttons', 1e30, { kind: 'crystals', value: 1000 }),
    achievement('earn1e60', 'Transfinite Economy', 'production', 'fa-atom', 'Produce 1e60 lifetime buttons.', 'buttons', 1e60, { kind: 'global', value: 1.2 }),
    achievement('bps100', 'Motion Begins', 'production', 'fa-bolt', 'Reach 100 buttons per second.', 'bps', 100, { kind: 'crystals', value: 15 }),
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
    achievement('aura1', 'First Frequency', 'aura', 'fa-eye', 'Discover one aura.', 'auras', 1, { kind: 'crystals', value: 8 }, { group: 'aura', scope: 'default' }),
    achievement('aura8', 'Signal Cluster', 'aura', 'fa-shapes', 'Discover 8 unique auras.', 'auras', 8, { kind: 'crystals', value: 50 }, { group: 'aura', scope: 'default' }),
    achievement('aura16', 'Quarter Spectrum', 'aura', 'fa-palette', 'Discover 16 unique auras.', 'auras', 16, { kind: 'crystals', value: 250 }, { group: 'aura', scope: 'default' }),
    achievement('aura24unique', 'Chromatic Archive', 'aura', 'fa-swatchbook', 'Discover 24 unique auras.', 'auras', 24, { kind: 'global', value: 1.05 }, { group: 'aura', scope: 'default' }),
    achievement('aura12', 'Spectrum Half', 'aura', 'fa-palette', 'Discover half of the aura archive.', 'auras', Math.ceil(AURAS.length / 2), { kind: 'global', value: 1.1 }, { group: 'aura', scope: 'default' }),
    achievement('aura40', 'Frequency Cartographer', 'aura', 'fa-map', 'Discover 40 unique auras.', 'auras', 40, { kind: 'crystals', value: 5000 }, { group: 'aura', scope: 'default' }),
    achievement('aura48', 'Deep Spectrum', 'aura', 'fa-layer-group', 'Discover 48 unique auras.', 'auras', 48, { kind: 'global', value: 1.15 }, { group: 'aura', scope: 'default' }),
    achievement('aura56', 'Impossible Archive', 'aura', 'fa-book-skull', 'Discover 56 unique auras.', 'auras', 56, { kind: 'crystals', value: 100000 }, { group: 'aura', scope: 'default' }),
    achievement('aura60', 'Edge of Finality', 'aura', 'fa-circle-nodes', 'Discover 60 unique auras.', 'auras', 60, { kind: 'global', value: 1.25 }, { group: 'aura', scope: 'default' }),
    achievement('aura24', 'Full Spectrum', 'aura', 'fa-rainbow', 'Discover every aura.', 'auras', AURAS.length, { kind: 'crit', value: 0.01 }, { group: 'aura', scope: 'default' }),
    achievement('auraRare', 'Rare Resonance', 'aura', 'fa-gem', 'Discover a Rare-or-higher aura.', 'auraRarity', 2, { kind: 'crystals', value: 100 }, { group: 'aura', scope: 'default' }),
    achievement('auraEpic', 'Epic Wavelength', 'aura', 'fa-bolt', 'Discover an Epic-or-higher aura.', 'auraRarity', 3, { kind: 'crystals', value: 250 }, { group: 'aura', scope: 'default' }),
    achievement('auraLegendary', 'Legendary Receiver', 'aura', 'fa-crown', 'Discover a Legendary-or-higher aura.', 'auraRarity', 4, { kind: 'global', value: 1.04 }, { group: 'aura', scope: 'default' }),
    achievement('auraMythic', 'Mythic Contact', 'aura', 'fa-dragon', 'Discover a Mythic-or-higher aura.', 'auraRarity', 5, { kind: 'crystals', value: 1000 }, { group: 'aura', scope: 'default' }),
    achievement('auraTranscendent', 'Beyond the Scanner', 'aura', 'fa-infinity', 'Discover a Transcendent-or-higher aura.', 'auraRarity', 6, { kind: 'global', value: 1.08 }, { group: 'aura', scope: 'default' }),
    achievement('auraCelestial', 'Celestial Lock', 'aura', 'fa-star', 'Discover a Celestial-or-higher aura.', 'auraRarity', 7, { kind: 'crystals', value: 5000 }, { group: 'aura', scope: 'default' }),
    achievement('auraEthereal', 'Ethereal Archive', 'aura', 'fa-ghost', 'Discover an Ethereal-or-higher aura.', 'auraRarity', 8, { kind: 'global', value: 1.12 }, { group: 'aura', scope: 'default' }),
    achievement('auraAbyssal', 'Abyssal Frequency', 'aura', 'fa-eye', 'Discover an Abyssal-or-higher aura.', 'auraRarity', 9, { kind: 'crystals', value: 50000 }, { group: 'aura', scope: 'default' }),
    achievement('auraImpossible', 'Probability Refused', 'aura', 'fa-triangle-exclamation', 'Discover an Impossible-or-higher aura.', 'auraRarity', 10, { kind: 'global', value: 1.2 }, { group: 'aura', scope: 'default' }),
    achievement('auraSingularity', 'The Last Frequency', 'aura', 'fa-atom', 'Discover a Singularity aura.', 'auraRarity', 11, { kind: 'global', value: 1.5 }, { group: 'aura', scope: 'default' }),

    achievement('arcade1', 'Lab Rat', 'arcade', 'fa-gamepad', 'Win one arcade trial.', 'arcade', 1, { kind: 'crystals', value: 6 }),
    achievement('arcade10', 'Multi-Discipline', 'arcade', 'fa-medal', 'Win 10 arcade trials.', 'arcade', 10, { kind: 'crystals', value: 30 }),
    achievement('arcade50', 'Perfect Timing', 'arcade', 'fa-trophy', 'Win 50 arcade trials.', 'arcade', 50, { kind: 'crit', value: 0.01 }),
    achievement('arcade100', 'Arcade Architect', 'arcade', 'fa-crown', 'Win 100 arcade trials.', 'arcade', 100, { kind: 'global', value: 1.1 }),
    achievement('arcadeHard10', 'No Safety Margin', 'arcade', 'fa-fire', 'Win 10 trials on Hard difficulty.', 'arcadeHard', 10, { kind: 'crystals', value: 150 }),
    achievement('cipherHard1', 'NEEEERD!!!', 'arcade', 'fa-calculator', 'Wow, you\'re such a math nerd 🤓', 'cipherHard', 1, { kind: 'crystals', value: 50 }),
    achievement('arcadeInsane1', 'Silent Memory', 'arcade', 'fa-brain', 'Clear one Echo Array wave on Insane.', 'arcadeInsane', 1, { kind: 'global', value: 1.08 }),
    achievement('arcadeInsane5', 'Insane Memory Loop', 'arcade', 'fa-brain', 'Clear five Echo Array rounds on Insane IN A ROW.', 'arcadeInsaneStreak', 5, { kind: 'global', value: 1.4 }),
    achievement('arcadeImpossible1', 'Impossible First Contact', 'arcade', 'fa-brain', 'Clear one Echo Array round on Impossible.', 'arcadeImpossible', 1, { kind: 'crystals', value: 25000 }),
    achievement('arcadeImpossible2', 'Impossible Repetition', 'arcade', 'fa-brain', 'Clear two Echo Array rounds on Impossible.', 'arcadeImpossible', 2, { kind: 'crystals', value: 50000 }),
    achievement('arcadeImpossible3', 'Impossible Echo Doctrine', 'arcade', 'fa-brain', 'Clear three Echo Array rounds on Impossible IN A ROW.', 'arcadeImpossibleStreak', 3, { kind: 'global', value: 1.75 }),

    achievement('ngPress1k', 'Evolved Contact', 'press', 'fa-fingerprint', 'Press the evolved reactor 1,000 times in the second iteration.', 'clicks', 1000, { kind: 'crystals', value: 500 }, { scope: 'ngplus' }),
    achievement('ngPress100k', 'Second-Nature Pressure', 'press', 'fa-hand-fist', 'Press the evolved reactor 100,000 times.', 'clicks', 100000, { kind: 'global', value: 1.12 }, { scope: 'ngplus' }),
    achievement('ngCrit2500', 'Recursive Precision', 'press', 'fa-crosshairs', 'Land 2,500 critical presses after evolution.', 'crits', 2500, { kind: 'crystals', value: 7500 }, { scope: 'ngplus' }),
    achievement('ngEarn1e15', 'Rebuilt Economy', 'production', 'fa-arrow-trend-up', 'Produce 1 quadrillion buttons in the second iteration.', 'buttons', 1e15, { kind: 'crystals', value: 2500 }, { scope: 'ngplus' }),
    achievement('ngEarn1e45', 'Reality-Scale Output', 'production', 'fa-atom', 'Produce 1e45 buttons after starting from nothing again.', 'buttons', 1e45, { kind: 'global', value: 1.2 }, { scope: 'ngplus' }),
    achievement('ngBps1e24', 'Second-Iteration Torrent', 'production', 'fa-wave-square', 'Reach 1e24 buttons per second in New Game+.', 'bps', 1e24, { kind: 'crystals', value: 50000 }, { scope: 'ngplus' }),
    achievement('ngTower250', 'Reconstructed Skyline', 'collection', 'fa-building', 'Rebuild a network of 250 towers.', 'towers', 250, { kind: 'crystals', value: 1200 }, { scope: 'ngplus' }),
    achievement('ngTower5000', 'Architecture Remembers', 'collection', 'fa-city', 'Own 5,000 towers in the second iteration.', 'towers', 5000, { kind: 'global', value: 1.18 }, { scope: 'ngplus' }),
    achievement('ngUpgrade75', 'Recovered Schematics', 'collection', 'fa-microchip', 'Reinstall 75 standard upgrades.', 'upgrades', 75, { kind: 'crystals', value: 6000 }, { scope: 'ngplus' }),
    achievement('ngUpgradeAll', 'Perfect Reconstruction', 'collection', 'fa-sitemap', 'Reinstall every standard and endgame upgrade.', 'upgrades', UPGRADES.length, { kind: 'global', value: 1.3 }, { scope: 'ngplus' }),
    achievement('ngArcade10', 'Skill Survives Memory', 'arcade', 'fa-gamepad', 'Win 10 arcade trials in the second iteration.', 'arcade', 10, { kind: 'crystals', value: 1200 }, { scope: 'ngplus' }),
    achievement('ngArcadeHard25', 'No Inherited Reflexes', 'arcade', 'fa-fire-flame-curved', 'Win 25 Hard arcade trials in New Game+.', 'arcadeHard', 25, { kind: 'global', value: 1.15 }, { scope: 'ngplus' }),
    achievement('ngArcadeInsane5', 'Impossible Muscle Memory', 'arcade', 'fa-brain', 'Clear five Echo Array waves on Insane in New Game+.', 'arcadeInsane', 5, { kind: 'crystals', value: 25000 }, { scope: 'ngplus' }),
    achievement('ngArcadeImpossible3', 'Impossible Triad', 'arcade', 'fa-brain', 'Clear three Echo Array rounds on Impossible in New Game+.', 'arcadeImpossible', 3, { kind: 'crystals', value: 250000 }, { scope: 'ngplus' }),
    achievement('ngTrueNeverClick', 'Evolved Never-Click', 'secret', 'fa-hand-sparkles', 'Reach 1 billion Buttons in the first New Game+ cycle without ever pressing the evolved Reactor.', 'neverClickNgPlus', NEVER_CLICK_TARGET, { kind: 'global', value: 5 }, { scope: 'ngplus', challenge: 'neverClickNgPlus' }),

    achievement('ngAuraScan25', 'Foreign Spectrum', 'aura', 'fa-satellite-dish', 'Complete 25 aura scans in the second iteration.', 'scans', 25, { kind: 'crystals', value: 1500 }, { group: 'aura', scope: 'ngplus' }),
    achievement('ngAuraScan250', 'Recursive Frequency', 'aura', 'fa-wave-square', 'Complete 250 aura scans after evolution.', 'scans', 250, { kind: 'global', value: 1.12 }, { group: 'aura', scope: 'ngplus' }),
    achievement('ngAuraScan1000', 'Spectrum Beyond Memory', 'aura', 'fa-rainbow', 'Complete 1,000 aura scans in New Game+.', 'scans', 1000, { kind: 'crystals', value: 100000 }, { group: 'aura', scope: 'ngplus' }),

    achievement('ascend1', 'Again, Differently', 'ascension', 'fa-rocket', 'Complete one ascension cycle.', 'ascensions', 1, { kind: 'crystals', value: 50 }),
    achievement('ascend3', 'Cycle Familiar', 'ascension', 'fa-rotate', 'Complete three ascension cycles.', 'ascensions', 3, { kind: 'crystals', value: 150 }),
    achievement('ascend10', 'Reboot Doctrine', 'ascension', 'fa-arrows-rotate', 'Complete 10 ascension cycles.', 'ascensions', 10, { kind: 'global', value: 1.15 }),
    achievement('ascend25', 'Eternal Operator', 'ascension', 'fa-infinity', 'Complete 25 ascension cycles.', 'ascensions', 25, { kind: 'crystals', value: 1000 }),
    achievement('core10', 'Heavenly Technician', 'ascension', 'fa-atom', 'Purchase 10 Heavenly upgrade levels.', 'coreLevels', 10, { kind: 'crystals', value: 100 }),
    achievement('core50', 'Constellation Engineer', 'ascension', 'fa-circle-nodes', 'Purchase 50 Heavenly upgrade levels.', 'coreLevels', 50, { kind: 'global', value: 1.25 }),

    achievement('play5m', 'Cold Start', 'playtime', 'fa-power-off', 'Play actively for 5 minutes.', 'playtime', 300, { kind: 'crystals', value: 25 }),
    achievement('play10m', 'Systems Warmed', 'playtime', 'fa-stopwatch', 'Play actively for 10 minutes.', 'playtime', 600, { kind: 'crystals', value: 50 }),
    achievement('play20m', 'Stable Signal', 'playtime', 'fa-signal', 'Play actively for 20 minutes.', 'playtime', 1200, { kind: 'crystals', value: 100 }),
    achievement('play30m', 'Half-Hour Handshake', 'playtime', 'fa-link', 'Play actively for 30 minutes.', 'playtime', 1800, { kind: 'global', value: 1.02 }),
    achievement('play45m', 'Calibration Shift', 'playtime', 'fa-sliders', 'Play actively for 45 minutes.', 'playtime', 2700, { kind: 'crystals', value: 250 }),
    achievement('play1h', 'First Watch', 'playtime', 'fa-clock', 'Play actively for 1 hour.', 'playtime', 3600, { kind: 'global', value: 1.03 }),
    achievement('play2h', 'Double Watch', 'playtime', 'fa-clock-rotate-left', 'Play actively for 2 hours.', 'playtime', 7200, { kind: 'crystals', value: 1000 }),
    achievement('play3h', 'Night Operator', 'playtime', 'fa-moon', 'Play actively for 3 hours.', 'playtime', 10800, { kind: 'global', value: 1.04 }),
    achievement('play4h', 'Continuous Contact', 'playtime', 'fa-hand-pointer', 'Play actively for 4 hours.', 'playtime', 14400, { kind: 'crystals', value: 5000 }),
    achievement('play6h', 'Long Shift', 'playtime', 'fa-business-time', 'Play actively for 6 hours.', 'playtime', 21600, { kind: 'global', value: 1.05 }),
    achievement('play8h', 'Full Shift', 'playtime', 'fa-briefcase', 'Play actively for 8 hours.', 'playtime', 28800, { kind: 'crystals', value: 25000 }),
    achievement('play12h', 'Half Rotation', 'playtime', 'fa-earth-americas', 'Play actively for 12 hours.', 'playtime', 43200, { kind: 'global', value: 1.08 }),
    achievement('play18h', 'Unbroken Vigil', 'playtime', 'fa-eye', 'Play actively for 18 hours.', 'playtime', 64800, { kind: 'crystals', value: 100000 }),
    achievement('play1d', 'One Full Rotation', 'playtime', 'fa-earth-americas', 'Play actively for 1 day.', 'playtime', 86400, { kind: 'global', value: 1.1 }),
    achievement('play2d', 'Forty-Eight Hour Core', 'playtime', 'fa-microchip', 'Play actively for 2 days.', 'playtime', 172800, { kind: 'crystals', value: 1e6 }),
    achievement('play3d', 'Reactor Resident', 'playtime', 'fa-house-laptop', 'Play actively for 3 days.', 'playtime', 259200, { kind: 'global', value: 1.15 }),
    achievement('play5d', 'Five-Day Frequency', 'playtime', 'fa-wave-square', 'Play actively for 5 days.', 'playtime', 432000, { kind: 'crystals', value: 1e7 }),
    achievement('play7d', 'Seven-Day Signal', 'playtime', 'fa-calendar-week', 'Play actively for 1 week.', 'playtime', 604800, { kind: 'global', value: 1.2 }),
    achievement('play10d', 'Ten-Day Transmission', 'playtime', 'fa-tower-broadcast', 'Play actively for 10 days.', 'playtime', 864000, { kind: 'crystals', value: 1e8 }),
    achievement('play14d', 'Fortnight Engine', 'playtime', 'fa-gears', 'Play actively for 14 days.', 'playtime', 1209600, { kind: 'global', value: 1.3 }),
    achievement('play21d', 'Three-Week Continuum', 'playtime', 'fa-infinity', 'Play actively for 21 days.', 'playtime', 1814400, { kind: 'crystals', value: 1e9 }),
    achievement('play30d', 'Monthly Continuity', 'playtime', 'fa-calendar-days', 'Play actively for 30 days.', 'playtime', 2592000, { kind: 'global', value: 1.5 }),
    achievement('play45d', 'Deep-Time Operator', 'playtime', 'fa-user-astronaut', 'Play actively for 45 days.', 'playtime', 3888000, { kind: 'crystals', value: 1e10 }),
    achievement('play60d', 'Two-Month Reactor', 'playtime', 'fa-atom', 'Play actively for 60 days.', 'playtime', 5184000, { kind: 'global', value: 2 }),
    achievement('play90d', 'Quarter-Year Operator', 'playtime', 'fa-hourglass-half', 'Play actively for 90 days.', 'playtime', 7776000, { kind: 'crystals', value: 1e12 }),
    achievement('play120d', 'Seasonless', 'playtime', 'fa-cloud-sun', 'Play actively for 120 days.', 'playtime', 10368000, { kind: 'global', value: 3 }),
    achievement('play180d', 'Half-Year Constant', 'playtime', 'fa-hourglass-end', 'Play actively for 180 days.', 'playtime', 15552000, { kind: 'crystals', value: 1e15 }),
    achievement('play270d', 'Nine-Month Singularity', 'playtime', 'fa-circle-nodes', 'Play actively for 270 days.', 'playtime', 23328000, { kind: 'global', value: 5 }),
    achievement('play365d', 'The Year-Long Press', 'playtime', 'fa-sun', 'Play actively for an entire year.', 'playtime', 31536000, { kind: 'global', value: 10 }),

    achievement('secret1', 'Behind the Panel', 'secret', 'fa-key', 'Recover one restricted signal.', 'secrets', 1, { kind: 'crystals', value: 25 }),
    achievement('secret2', 'Restricted Clearance', 'secret', 'fa-user-secret', 'Recover two restricted signals.', 'secrets', 2, { kind: 'crystals', value: 75 }),
    achievement('secret4', 'The Reactor Knows', 'secret', 'fa-eye', 'Recover all restricted signals.', 'secrets', 4, { kind: 'global', value: 1.2 }),
    achievement('secretSevenfold', 'Sevenfold Knock', 'secret', 'fa-hand-pointer', 'Find the hidden contact inside the Reactor name.', 'secretSevenfold', 1, { kind: 'crystals', value: 40 }),
    achievement('secretUpup', 'Old Direction', 'secret', 'fa-keyboard', 'Enter the ancient directional sequence.', 'secretUpup', 1, { kind: 'crystals', value: 100 }),
    achievement('secretEcho', 'The Button Remembers', 'secret', 'fa-comment', 'Decode the phrase preserved by the archive.', 'secretEcho', 1, { kind: 'crystals', value: 150 }),
    achievement('secretHeartbeat', 'Nominal Heartbeat', 'secret', 'fa-heart-pulse', 'Wake the hidden pulse inside the system clock.', 'secretHeartbeat', 1, { kind: 'global', value: 1.08 }),
    achievement('trueNeverClick', 'True Never-Click', 'secret', 'fa-hand-sparkles', 'Reach 1 billion Buttons in the original first cycle without ever pressing the Reactor.', 'neverClickDefault', NEVER_CLICK_TARGET, { kind: 'global', value: 2 }, { challenge: 'neverClickDefault' }),
    achievement('error404', 'Unexpected error occurred. [Code 404]', 'secret', 'fa-triangle-exclamation', 'Capture an impossible corrupted golden signal.', 'glitches', 1, { kind: 'global', value: 41.4 }),
    {
      ...achievement(
        NG_PLUS_ACHIEVEMENT_ID,
        'The Reactor Remembers You',
        'collection',
        'fa-fingerprint',
        'Rebuild every Heavenly branch inside New Game+ and purchase Absolute Ascendancy a second time.',
        'newGamePlus',
        1,
        { kind: 'ngPlus', production: 1000, rngLuck: 100 },
        { scope: 'ngplus' }
      ),
      hiddenUntilNgPlus: true
    }
  ];

  const ACHIEVEMENT_CATEGORY_LABELS = Object.freeze({
    all: 'All',
    press: 'Pressing',
    production: 'Production',
    collection: 'Collection',
    arcade: 'Arcade',
    ascension: 'Ascension',
    playtime: 'Playtime',
    secret: 'Secret',
    default: 'Default Auras',
    ngplus: 'New Game+ Auras'
  });

  const ACHIEVEMENT_SCOPE_CATEGORIES = Object.freeze({
    default: ['all', 'press', 'production', 'collection', 'arcade', 'ascension', 'playtime', 'secret'],
    ngplus: ['all', 'press', 'production', 'collection', 'arcade', 'secret'],
    aura: ['all', 'default', 'ngplus']
  });

  const SECRETS = [
    { id: 'sevenfold', name: 'Sevenfold Contact', clue: 'The name above is more responsive than it looks.' },
    { id: 'upup', name: 'Old Direction', clue: 'An ancient sequence still opens modern systems.' },
    { id: 'echo', name: 'The Memory Phrase', clue: 'The archive insists: THE BUTTON REMEMBERS.' },
    { id: 'heartbeat', name: 'System Heartbeat', clue: 'Even a nominal build can be pressed nine times.' }
  ];

  const CRIT_ACHIEVEMENTS = ['press1m', 'earn1e18', 'tower100each', 'arcade50', 'aura24'];
  const TOWER_MASTERY_THRESHOLDS = Object.freeze([25, 50, 100, 250, 500, 1000]);
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
    operatorFeedback: 'fa-arrows-left-right-to-line',
    probability: 'fa-percent',
    overdrive: 'fa-bullseye',
    fortune: 'fa-star',
    endurance: 'fa-clock',
    impactVault: 'fa-vault',
    pressureArchive: 'fa-box-archive',
    comboMatrix: 'fa-table-cells',
    cadenceReservoir: 'fa-gauge-high',
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
    musicPlayer: 'fa-compact-disc'
  });
  const SEQUENCE_DIFFICULTIES = Object.freeze({
    easy: { flashMs: 290, gapMs: 105, leadMs: 450, startLength: 1, growth: 1, rewardMultiplier: 1, randomTone: false, silent: false },
    medium: { flashMs: 170, gapMs: 75, leadMs: 360, startLength: 1, growth: 2, rewardMultiplier: 1.2, randomTone: false, silent: false },
    hard: { flashMs: 90, gapMs: 40, leadMs: 300, startLength: 2, growth: 2, rewardMultiplier: 1.5, randomTone: true, silent: false },
    insane: { flashMs: 55, gapMs: 20, leadMs: 240, startLength: 3, growth: 3, rewardMultiplier: 4, randomTone: false, silent: true },
    impossible: { flashMs: 33, gapMs: 10, leadMs: 180, startLength: 5, growth: 5, rewardMultiplier: 10, randomTone: true, silent: false },
  });
  const PULSE_DIFFICULTIES = Object.freeze({
    easy: { cycleMs: 2100, widthScale: 1, rewardMultiplier: 1 },
    medium: { cycleMs: 1400, widthScale: 0.8, rewardMultiplier: 1.5 },
    hard: { cycleMs: 700, widthScale: 0.5, rewardMultiplier: 2 }
  });
  const VECTOR_DIFFICULTIES = Object.freeze({
    easy: { goal: 8, durationMs: 10000, reward: 10 },
    hard: { goal: 12, durationMs: 8000, reward: 18 },
    insane: { goal: 16, durationMs: 6500, reward: 30 }
  });
  const CIPHER_DIFFICULTIES = Object.freeze({
    easy: { goal: 5, durationMs: 22000, maxValue: 12, penaltyMs: 800, reward: 12 },
    medium: { goal: 5, durationMs: 18000, maxValue: 20, penaltyMs: 1200, reward: 22 },
    hard: { goal: 7, durationMs: 14000, maxValue: 50, penaltyMs: 1700, reward: 55 }
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

  const TUTORIAL_STEPS = [
    {
      page: 'core',
      target: '#mainButton',
      icon: 'fa-hand-pointer',
      title: 'The physical Button',
      copy: 'Every physical press creates Buttons, adds 0.01 Scanner Charge, builds manual-press progress, and can extend your Combo. Absolute Ascendancy raises the Charge gain to 0.1. The value above the Button includes every active press, aura, achievement, and Heavenly modifier.'
    },
    {
      page: 'core',
      target: '.reactor-readout',
      icon: 'fa-gauge-high',
      title: 'Combo and press power',
      copy: 'Press again within 0.65 seconds to build Combo. The base limit is 20 stacks, and Cadence Reservoir in the Heavenly Circuit can expand it to 200. Each stack adds 5% to the press. The center readout separates direct press power from the slice of tower production copied into every press.'
    },
    {
      page: 'core',
      target: '#critDetailsButton',
      icon: 'fa-crosshairs',
      title: 'Critical calibration',
      copy: 'Critical presses multiply the complete Combo-adjusted press, including direct power and any tower output copied into the click. Critical chance rises slowly through upgrades, tower milestones, achievements, secrets, Heavenly memory, auras, and golden mastery. Open this readout for every source. The hard cap is exactly 75%, reached only after every possible method is complete.'
    },
    {
      page: 'core',
      target: '.resource-strip',
      icon: 'fa-coins',
      title: 'Your four resources',
      copy: 'Buttons buy standard upgrades and towers. Per Second shows your current automated output. Crystals come from Arcade trials, achievements, and aura duplicates. Heavenly Cores are earned through ascension and purchase permanent upgrades in the Heavenly Circuit.'
    },
    {
      page: 'core',
      target: '.telemetry-panel',
      icon: 'fa-chart-line',
      title: 'Live production telemetry',
      copy: 'The Output Stream records your last 60 seconds of production, including temporary effects. AREA emphasizes total output, LINE makes changes easier to compare, and BAR separates each sample. The current rate, trend, and best rate appear around the graph.'
    },
    {
      page: 'core',
      target: '.objective-panel',
      icon: 'fa-list-check',
      title: 'Next objective',
      copy: 'Objectives provide a guided path through early progression. Each card states one concrete goal, tracks it live, and awards the displayed Crystals automatically when completed before advancing to the next objective.'
    },
    {
      page: 'core',
      target: '.metric-grid',
      icon: 'fa-list-check',
      title: 'Run statistics at a glance',
      copy: 'These cards track physical presses, current-iteration output, tower ownership and output share, and captured golden signals. Open System for the larger statistics archive, including values that remain recorded through every ascension and New Game+.'
    },
    {
      page: 'core',
      target: '#commandButton',
      icon: 'fa-magnifying-glass',
      title: 'Search and quick navigation',
      copy: 'Press Ctrl+K or this search button to jump anywhere. Search also finds this tutorial, so you never have to remember where replay lives. Number keys 1–8 open the main sections and S opens System.'
    },
    {
      page: 'upgrades',
      target: '.filter-bar',
      icon: 'fa-filter',
      title: 'Upgrade discovery and filters',
      copy: 'Affordable Only opens by default. Search by name or effect, combine any number of Press, Output, Critical, and Utility filters, and use Available First to place purchasable upgrades first followed by the locked upgrades closest to meeting their requirements.'
    },
    {
      page: 'upgrades',
      target: '.result-summary-row',
      icon: 'fa-cart-plus',
      title: 'Buy Everything',
      copy: 'Buy Everything repeatedly installs every upgrade you can currently afford, including upgrades unlocked by purchases made during the same action. Use individual cards when you want to save Buttons for a specific path or inspect its exact effect.'
    },
    {
      page: 'towers',
      target: '.tower-sticky-purchase',
      icon: 'fa-layer-group',
      title: 'Tower purchase controls',
      copy: `Choose 1, 10, or 25 for fixed batches. NEXT calculates the amount each tower needs to reach its next mastery, while MAX shows the greatest affordable amount per tower. The Towers navigation badge follows the selected mode. BUY MAX ON ALL costs ${TOWER_BUY_MAX_ALL_CRYSTAL_COST.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Crystals to unlock permanently and spends across every affordable tower type.`
    },
    {
      page: 'towers',
      target: '.tower-overview',
      icon: 'fa-arrow-trend-up',
      title: 'Tower output and masteries',
      copy: 'The overview shows total network output, the tower currently returning the most production per Button spent, and the nearest mastery. Reaching a mastery permanently increases that tower family’s output, which is why NEXT adapts separately for every row.'
    },
    {
      page: 'towers',
      target: '[data-tower="clickbot"]',
      icon: 'fa-industry',
      title: 'Tower detail inspection',
      copy: 'Hover any tower for a cursor-following analysis of ownership, unit and total output, network share, mastery multiplier, next-unit price, selected purchase amount, projected gain, payback time, cost growth, discounts, and its complete production formula.'
    },
    {
      page: 'arcade',
      target: '.arcade-grid',
      icon: 'fa-gamepad',
      title: 'The six Arcade trials',
      copy: 'Signal Break tests reaction, Echo Array tests memory, Pulse Lock tests timing, Vector Relay tests ordered input, Cipher Sum tests arithmetic, and Pressure Seal tests controlled holding. Difficulty changes speed, targets, sequence growth, and Crystal rewards. A failed trial deducts Crystals, consecutive failures make the loss larger, and any successful completion clears the failure streak.'
    },
    {
      page: 'achievements',
      target: '.achievement-summary',
      icon: 'fa-trophy',
      title: 'Achievements and rewards',
      copy: 'Achievements are recorded as soon as their requirements are met. Rewards include Crystals, stored production, permanent global multipliers, and critical calibration. During New Game+, completed reward bonuses remain inactive until normal reality returns.'
    },
    {
      page: 'achievements',
      target: '#achievementViews',
      icon: 'fa-layer-group',
      title: 'Achievement archives',
      copy: 'DEFAULT contains the main progression records, AURAS gathers frequency discoveries and scan milestones, and NEW GAME+ appears after the second iteration begins. New Game+ records only progress during that mode, while previously earned default achievements remain recorded.'
    },
    {
      page: 'achievements',
      target: '#achievementCategories',
      icon: 'fa-clock',
      title: 'Achievement filters and playtime',
      copy: 'Achievement categories can be combined, so Playtime can stay visible beside Pressing, Production, or any other selected archive. Playtime tracks active Reactor time through 34 dense milestones, from 5 minutes to 10 years; only time spent actively running advances these records.'
    },
    {
      page: 'observatory',
      target: '.scanner-panel',
      icon: 'fa-satellite-dish',
      title: 'RNG scanner and Charge',
      copy: 'Aura scans cost 25 Charge, reduced to 15 by Absolute Ascendancy. Physical presses restore Charge, while Entropy Battery provides passive restoration up to the 1.000-per-second cap. Each scan moves through sweep, lock, decode, and verification before revealing its rarity and exact roll chance. Transcendent-or-higher auras receive longer, more intense reveal sequences.'
    },
    {
      page: 'observatory',
      target: '.aura-odds-banner',
      icon: 'fa-dice-d20',
      title: 'Exact aura odds',
      copy: 'Every aura shows its exact next-scan percentage to as many as six useful decimals. Hover one to switch to live 1-in-N odds. Pity, Heavenly luck, and the final 10× luck protocol are already included in the displayed chance.'
    },
    {
      page: 'observatory',
      target: '.collection-heading',
      icon: 'fa-rainbow',
      title: 'Aura collection and visuals',
      copy: 'Discovered auras are clearly separated from unknown frequencies. Equip one for its passive effect. Every aura has its own screen theme, with rarer frequencies becoming more dramatic; Full, Reduced sigil-only, and Off modes are available in System.'
    },
    {
      page: 'ascension',
      target: '.ascension-hero',
      icon: 'fa-rocket',
      title: 'Ascension and Heavenly Cores',
      copy: 'Once the projected Core gain reaches at least one, Ascend opens an in-game confirmation. Collapsing the cycle resets Buttons, towers, standard upgrades, Charge, and temporary effects. After the shutdown sequence, the Heavenly Circuit becomes the full-screen configuration view until you begin a new cycle.'
    },
    {
      page: 'ascension',
      target: '#ascensionOverview',
      icon: 'fa-circle-nodes',
      title: 'Heavenly Circuit and New Game+',
      copy: 'Heavenly upgrades survive normal reboots and cover starting reserves, pressing, towers, RNG, golden signals, conversion, automation, and the Jukebox. Cadence Reservoir raises the Combo limit from 20 to 40, 100, then 200. In the full tree, drag to move, use the wheel to zoom, follow connected requirements, and reboot from the top button. Completing every branch unlocks Absolute Ascendancy and the New Game+ reconstruction challenge.'
    },
    {
      page: 'converter',
      target: '.converter-layout',
      icon: 'fa-arrows-rotate',
      title: 'Crystal conversion',
      copy: 'Commit whole or fractional Crystal amounts—up to six decimal places—to a timed mining cycle. A one-Crystal cycle begins near 30 seconds, and every tenfold increase in batch size adds 50% more base time before speed upgrades. Button recovery is available immediately, while Spectrum Gate unlocks Scanner Charge.'
    },
    {
      page: 'converter',
      target: '.converter-upgrade-panel',
      icon: 'fa-screwdriver-wrench',
      title: 'Converter hardware',
      copy: 'Crystal upgrades persist through normal ascensions. Recursive Transmutation Drill has 1,000 levels and rapidly multiplies Button recovery. Other yield and efficiency hardware improves Button conversion, speed upgrades shorten mining cycles, Spectrum Gate opens Charge conversion, and the chained Recovery Valves raise the default 20% cancellation refund to 40%, 60%, and finally 80%.'
    },
    {
      page: 'core',
      target: '.metric-grid .metric-card:last-child',
      icon: 'fa-star',
      title: 'Golden and glitched signals',
      copy: 'Golden signals appear suddenly around the screen, accompanied by their selected receiver sound but no standard notification. A Golden Rush spawns rapid normal signals. A vastly rarer glitched signal corrupts the interface for 33 seconds, changes the music, multiplies production, and awards a permanent achievement. Other secrets exist, but this tour leaves them hidden.'
    },
    {
      page: 'core',
      target: '.hud-actions',
      icon: 'fa-compact-disc',
      title: 'Sound controls and the Jukebox',
      copy: 'The speaker toggles audio quickly. A late Heavenly upgrade unlocks the Jukebox beside it, with separate MUSIC and SOUNDS libraries. Music files are indexed into the adaptive shuffle, effects can be previewed, and alternate golden-signal receiver sounds can be purchased with Crystals and selected here.'
    },
    {
      page: 'system',
      target: '#soundSettingRow',
      icon: 'fa-volume-high',
      title: 'Effects volume',
      copy: 'Master sound controls presses, purchases, rewards, minigames, golden receivers, ascension, and glitch bursts independently from the music player.'
    },
    {
      page: 'system',
      target: '#musicSettingRow',
      icon: 'fa-music',
      title: 'Music volume',
      copy: 'Music volume is independent from effects and starts at 5% for a new save. Set it to zero for silence, adjust it here at any time, or use the late-game Jukebox for track selection, shuffle navigation, and playback controls.'
    },
    {
      page: 'system',
      target: '#motionSettingRow',
      icon: 'fa-person-running',
      title: 'Motion accessibility',
      copy: 'Full uses the complete animation set, Reduced slows and simplifies decorative movement, and Off removes it. Gameplay timers still use their normal durations. If Aura Visuals remains enabled, the equipped aura’s identifying sigil can stay visible without motion.'
    },
    {
      page: 'system',
      target: '#auraVisualsSettingRow',
      icon: 'fa-eye',
      title: 'Aura visual intensity',
      copy: 'Full shows each aura’s complete visual identity, Reduced keeps the themed sigil and quiet field, and Off hides the visuals while preserving the aura’s gameplay bonus.'
    },
    {
      page: 'system',
      target: '#numberFormatSettingRow',
      icon: 'fa-infinity',
      title: 'Number formatting',
      copy: 'Choose readable named suffixes through the largest representable tiers or scientific notation. This changes display only; all calculations retain the same value.'
    },
    {
      page: 'system',
      target: '#fastNotesSettingRow',
      icon: 'fa-bell',
      title: 'Notification timing',
      copy: 'Fast Notes can shorten bottom-center notifications to 3 seconds or 1 second. Off keeps the standard lifetime. Rare signal spawns stay silent in the notification feed regardless of this setting.'
    },
    {
      page: 'system',
      target: '.stats-panel',
      icon: 'fa-chart-simple',
      title: 'Complete statistics',
      copy: 'System statistics separate the current iteration from a permanent lifetime archive. The archive records output, spending, currencies, presses, purchases, signals, scans, conversion, Arcade wins, ascensions, New Game+ completions, peak production, active playtime, and save age without ever resetting between cycles or iterations.'
    },
    {
      page: 'system',
      target: '.data-panel',
      icon: 'fa-floppy-disk',
      title: 'Save vault',
      copy: 'Progress auto-saves locally. Save Now forces a snapshot, Export creates a portable backup, and Import restores one. Wipe Save opens a final in-game confirmation before permanently clearing local progress. Export before clearing browser data or moving devices.'
    },
    {
      page: 'system',
      target: '.secret-panel',
      icon: 'fa-user-secret',
      title: 'Restricted signals',
      copy: 'The Reactor contains secrets and easter eggs in unusual places. Recovered phrases can be entered here, and secret progress contributes meaningful rewards and critical calibration. Their solutions remain yours to discover.'
    },
    {
      page: 'system',
      target: '.shortcuts-panel',
      icon: 'fa-keyboard',
      title: 'Fast controls',
      copy: 'Space or Enter presses the Button while on the Reactor. Keys 1–8 change main sections, S opens System, Ctrl+K searches, slash focuses upgrade search, B cycles every tower buy mode including NEXT and MAX, and M toggles sound.'
    },
    {
      page: 'system',
      target: '#tutorialReplayRow',
      icon: 'fa-graduation-cap',
      title: 'Tour complete',
      copy: 'Replay this walkthrough from System or search for “tutorial” with Ctrl+K. You can exit at any step and return later; normal production continues while the guide is open.'
    }
  ];

  const COMMAND_ACTIONS = [
    { id: 'tutorial', icon: 'fa-graduation-cap', title: 'Replay Tutorial', sub: 'Complete guided Reactor walkthrough', key: 'START' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }
  const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(finite(value, fallback)));
  function normalizeConverterInput(value, fallback = 1) {
    const scale = 10 ** CONVERTER_INPUT_DECIMALS;
    const rounded = Math.round(finite(value, fallback) * scale) / scale;
    return clamp(rounded, MIN_CONVERTER_INPUT, MAX_CONVERTER_INPUT);
  }
  const has = (array, value) => Array.isArray(array) && array.includes(value);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const fontAwesomeIcon = (icon, extraClass = '') => `<i class="fa-solid ${icon} ${extraClass}" aria-hidden="true"></i>`;

  function auraIconName(aura) {
    const index = AURA_INDEX_BY_ID.get(aura.id) ?? 0;
    return AURA_FONT_ICONS[(index < 0 ? 0 : index) % AURA_FONT_ICONS.length];
  }

  function upgradeIconName(item) {
    const byEffect = {
      clickFlat: 'fa-hand-pointer',
      clickMult: 'fa-hand-fist',
      clickBase: 'fa-hand-pointer',
      clickBps: 'fa-arrows-left-right-to-line',
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
      lifetime: {
        buttonsEarned: 0,
        buttonsSpent: 0,
        crystalsEarned: 0,
        crystalsSpent: 0,
        coresEarned: 0,
        coresSpent: 0,
        manualPresses: 0,
        criticalPresses: 0,
        towerPurchases: 0,
        upgradePurchases: 0,
        converterUpgradePurchases: 0,
        goldenSignals: 0,
        glitchedSignals: 0,
        auraScans: 0,
        arcadeWins: 0,
        converterCycles: 0,
        crystalsProcessed: 0,
        chargeConverted: 0,
        ascensions: 0,
        newGamePlusCompletions: 0,
        playSeconds: 0,
        bestBps: 0
      },
      towers,
      upgrades: [],
      achievements: { claimed: [], progress: {} },
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
        consecutiveWins: {},
        pulseDifficultySchema: 2,
        arcadeCrystalRemainder: 0,
        failureStreak: 0,
        lastFailurePenalty: 0,
        streak: 0
      },
      golden: {
        nextAt: Date.now() + 1000,
        activeUntil: 0
      },
      converter: { target: 'buttons', input: 1, upgrades: [], levels: { facetedBit: 0 }, active: null },
      unlocks: { towerBuyMaxAll: false },
      jukebox: { goldenSpawnSound: 'default', unlockedGoldenSpawnSounds: ['default'] },
      buffs: [],
      secrets: { found: [], brandClicks: 0, clockClicks: 0 },
      challenges: {
        trueNeverClick: {
          defaultEligible: true,
          defaultAchieved: false,
          ngPlusEligible: false,
          ngPlusAchieved: false
        }
      },
      ascension: { nodes, spentCores: 0, inLimbo: false },
      newGamePlus: {
        unlocked: false,
        pending: false,
        active: false,
        completed: false,
        completions: 0
      },
      settings: { sound: 0.55, music: 0.05, motion: 'full', numberFormat: 'suffix', fastNotes: false, fastNotesSeconds: 1, auraVisuals: 'full' },
      meta: {
        createdAt: Date.now(),
        lastSave: Date.now(),
        migratedFrom: null,
        glitchRewardSeen: false,
        tutorialPromptedVersion: null,
        tutorialCompletedVersion: null
      },
      ui: { page: 'core', buyMode: '1', chartMode: 'area' }
    };
  }

  function mergeV2State(raw) {
    const fresh = createFreshState();
    const merged = {
      ...fresh,
      ...raw,
      resources: { ...fresh.resources, ...(raw.resources || {}) },
      totals: { ...fresh.totals, ...(raw.totals || {}) },
      lifetime: { ...fresh.lifetime, ...(raw.lifetime || {}) },
      towers: { ...fresh.towers, ...(raw.towers || {}) },
      achievements: { ...fresh.achievements, ...(raw.achievements || {}) },
      rng: { ...fresh.rng, ...(raw.rng || {}) },
      minigames: { ...fresh.minigames, ...(raw.minigames || {}) },
      golden: { ...fresh.golden, ...(raw.golden || {}) },
      converter: {
        ...fresh.converter,
        ...(raw.converter || {}),
        levels: { ...fresh.converter.levels, ...(raw.converter?.levels || {}) }
      },
      unlocks: { ...fresh.unlocks, ...(raw.unlocks || {}) },
      jukebox: { ...fresh.jukebox, ...(raw.jukebox || {}) },
      secrets: { ...fresh.secrets, ...(raw.secrets || {}) },
      challenges: {
        ...fresh.challenges,
        ...(raw.challenges || {}),
        trueNeverClick: {
          ...fresh.challenges.trueNeverClick,
          ...(raw.challenges?.trueNeverClick || {})
        }
      },
      ascension: {
        ...fresh.ascension,
        ...(raw.ascension || {}),
        nodes: { ...fresh.ascension.nodes, ...(raw.ascension?.nodes || {}) }
      },
      newGamePlus: { ...fresh.newGamePlus, ...(raw.newGamePlus || {}) },
      settings: { ...fresh.settings, ...(raw.settings || {}) },
      meta: { ...fresh.meta, ...(raw.meta || {}) },
      ui: { ...fresh.ui, ...(raw.ui || {}) }
    };
    merged.version = VERSION;
    merged.resources.buttons = Math.max(0, finite(merged.resources.buttons));
    merged.resources.crystals = Math.max(0, finite(merged.resources.crystals));
    merged.resources.cores = safeInt(merged.resources.cores);
    for (const key of Object.keys(merged.totals)) merged.totals[key] = Math.max(0, finite(merged.totals[key]));
    for (const key of Object.keys(merged.lifetime)) merged.lifetime[key] = Math.max(0, finite(merged.lifetime[key]));
    for (const tower of TOWERS) merged.towers[tower.id] = safeInt(merged.towers[tower.id]);
    merged.upgrades = [...new Set(Array.isArray(merged.upgrades) ? merged.upgrades : [])].filter(id => UPGRADE_BY_ID.has(id));
    merged.achievements.claimed = [...new Set(Array.isArray(merged.achievements.claimed) ? merged.achievements.claimed : [])].filter(id => ACHIEVEMENTS.some(item => item.id === id));
    const savedAchievementProgress = merged.achievements.progress && typeof merged.achievements.progress === 'object'
      ? merged.achievements.progress
      : {};
    merged.achievements.progress = {};
    for (const item of ACHIEVEMENTS) {
      const savedProgress = Math.max(0, finite(savedAchievementProgress[item.id]));
      const claimedProgress = merged.achievements.claimed.includes(item.id) ? item.target : 0;
      if (savedProgress > 0 || claimedProgress > 0) {
        merged.achievements.progress[item.id] = Math.max(savedProgress, claimedProgress);
      }
    }
    merged.secrets.found = [...new Set(Array.isArray(merged.secrets.found) ? merged.secrets.found : [])].filter(id => SECRETS.some(item => item.id === id));
    const savedNeverClick = raw.challenges?.trueNeverClick;
    if (!savedNeverClick || typeof savedNeverClick !== 'object') {
      const hasPressed = safeInt(merged.totals.clicks) > 0;
      const hasAscended = safeInt(merged.totals.ascensions) > 0;
      merged.challenges.trueNeverClick.defaultEligible =
        !merged.newGamePlus.active &&
        !merged.newGamePlus.completed &&
        !hasPressed &&
        !hasAscended;
      merged.challenges.trueNeverClick.ngPlusEligible =
        merged.newGamePlus.active &&
        !hasPressed &&
        !hasAscended;
      merged.challenges.trueNeverClick.defaultAchieved = false;
      merged.challenges.trueNeverClick.ngPlusAchieved = false;
    } else {
      merged.challenges.trueNeverClick.defaultEligible = Boolean(merged.challenges.trueNeverClick.defaultEligible);
      merged.challenges.trueNeverClick.defaultAchieved = Boolean(merged.challenges.trueNeverClick.defaultAchieved);
      merged.challenges.trueNeverClick.ngPlusEligible = Boolean(merged.challenges.trueNeverClick.ngPlusEligible);
      merged.challenges.trueNeverClick.ngPlusAchieved = Boolean(merged.challenges.trueNeverClick.ngPlusAchieved);
    }
    merged.buffs = Array.isArray(merged.buffs) ? merged.buffs.filter(buff => finite(buff.until) > Date.now()) : [];
    merged.rng.charge = clamp(finite(merged.rng.charge), 0, 100);
    merged.rng.scans = safeInt(merged.rng.scans);
    merged.rng.pity = safeInt(merged.rng.pity);
    merged.rng.discovered = merged.rng.discovered && typeof merged.rng.discovered === 'object' ? merged.rng.discovered : {};
    merged.rng.recent = Array.isArray(merged.rng.recent) ? merged.rng.recent.slice(-12) : [];
    if (!AURA_BY_ID.has(merged.rng.equipped) || !merged.rng.discovered[merged.rng.equipped]) merged.rng.equipped = null;
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
    merged.minigames.failureStreak = safeInt(merged.minigames.failureStreak);
    merged.minigames.lastFailurePenalty = safeInt(merged.minigames.lastFailurePenalty);
    for (const key of Object.keys(merged.minigames.difficultyWins)) merged.minigames.difficultyWins[key] = safeInt(merged.minigames.difficultyWins[key]);
    merged.converter.target = CONVERTER_RECIPES.some(recipe => recipe.id === merged.converter.target) ? merged.converter.target : 'buttons';
    merged.converter.input = normalizeConverterInput(merged.converter.input, 1);
    merged.converter.upgrades = [...new Set(Array.isArray(merged.converter.upgrades) ? merged.converter.upgrades : [])].filter(id => CONVERTER_UPGRADES.some(upgrade => upgrade.id === id));
    const legacyFacetedBit = merged.converter.upgrades.includes('facetedBit');
    merged.converter.upgrades = merged.converter.upgrades.filter(id => id !== 'facetedBit');
    merged.converter.levels.facetedBit = clamp(
      Math.max(safeInt(merged.converter.levels.facetedBit), legacyFacetedBit ? 1 : 0),
      0,
      1000
    );
    const savedConverterJob = merged.converter.active;
    if (savedConverterJob && typeof savedConverterJob === 'object' && CONVERTER_RECIPES.some(recipe => recipe.id === savedConverterJob.target)) {
      merged.converter.active = {
        target: savedConverterJob.target,
        input: normalizeConverterInput(savedConverterJob.input, 1),
        output: Math.max(0, finite(savedConverterJob.output)),
        startedAt: finite(savedConverterJob.startedAt, Date.now()),
        endsAt: finite(savedConverterJob.endsAt, Date.now())
      };
    } else {
      if (savedConverterJob && typeof savedConverterJob === 'object') {
        const abandonedInput = finite(savedConverterJob.input);
        if (abandonedInput > 0) merged.resources.crystals += normalizeConverterInput(abandonedInput, 1);
      }
      merged.converter.active = null;
    }
    if (merged.converter.active?.target === 'charge' && !merged.converter.upgrades.includes('spectrumGate')) {
      merged.resources.crystals += merged.converter.active.input;
      merged.converter.active = null;
    }
    if (merged.converter.active?.target === 'charge') {
      merged.converter.active.output = scannerChargeFromCrystals(merged.converter.active.input, merged.rng.charge);
    }
    merged.unlocks.towerBuyMaxAll = Boolean(merged.unlocks.towerBuyMaxAll);
    merged.jukebox.unlockedGoldenSpawnSounds = [...new Set(Array.isArray(merged.jukebox.unlockedGoldenSpawnSounds) ? merged.jukebox.unlockedGoldenSpawnSounds : ['default'])]
      .filter(id => GOLDEN_SPAWN_SOUNDS.some(sound => sound.id === id));
    if (!merged.jukebox.unlockedGoldenSpawnSounds.includes('default')) merged.jukebox.unlockedGoldenSpawnSounds.unshift('default');
    if (!merged.jukebox.unlockedGoldenSpawnSounds.includes(merged.jukebox.goldenSpawnSound)) merged.jukebox.goldenSpawnSound = 'default';
    const savedCoreNodes = merged.ascension.nodes;
    merged.ascension.nodes = {};
    let retainedCoreInvestment = 0;
    for (const node of CORE_NODES) {
      const level = clamp(safeInt(savedCoreNodes[node.id]), 0, node.max);
      merged.ascension.nodes[node.id] = level;
      for (let purchasedLevel = 0; purchasedLevel < level; purchasedLevel++) {
        retainedCoreInvestment = Math.min(
          Number.MAX_VALUE,
          retainedCoreInvestment + Math.ceil(node.baseCost * Math.pow(node.costGrowth ?? CORE_COST_GROWTH, purchasedLevel))
        );
      }
    }
    const retiredCoreInvestment = Math.max(0, safeInt(merged.ascension.spentCores) - retainedCoreInvestment);
    merged.resources.cores = Math.min(Number.MAX_VALUE, merged.resources.cores + retiredCoreInvestment);
    merged.ascension.spentCores = retainedCoreInvestment;
    merged.ascension.inLimbo = Boolean(merged.ascension.inLimbo);
    merged.newGamePlus.unlocked = Boolean(merged.newGamePlus.unlocked);
    merged.newGamePlus.pending = Boolean(merged.newGamePlus.pending);
    merged.newGamePlus.active = Boolean(merged.newGamePlus.active);
    merged.newGamePlus.completed = Boolean(merged.newGamePlus.completed);
    merged.newGamePlus.completions = safeInt(merged.newGamePlus.completions);
    if (!raw.newGamePlus && merged.ascension.nodes.absoluteAscendancy >= 1) {
      merged.newGamePlus.unlocked = true;
      merged.newGamePlus.pending = true;
    }
    if (merged.newGamePlus.active) {
      merged.newGamePlus.unlocked = true;
      merged.newGamePlus.pending = false;
    }
    if (merged.newGamePlus.completed || merged.newGamePlus.completions > 0) {
      merged.newGamePlus.unlocked = true;
      merged.newGamePlus.completed = true;
      merged.newGamePlus.active = false;
      merged.newGamePlus.pending = false;
      merged.newGamePlus.completions = Math.max(1, merged.newGamePlus.completions);
    }
    if (merged.achievements.claimed.includes(NG_PLUS_ACHIEVEMENT_ID)) {
      merged.newGamePlus.unlocked = true;
      merged.newGamePlus.completed = true;
      merged.newGamePlus.active = false;
      merged.newGamePlus.pending = false;
      merged.newGamePlus.completions = Math.max(1, merged.newGamePlus.completions);
    } else if (merged.newGamePlus.completed) {
      merged.achievements.claimed.push(NG_PLUS_ACHIEVEMENT_ID);
    }
    if (!raw.lifetime || typeof raw.lifetime !== 'object') {
      const historicalMetric = metric => ACHIEVEMENTS.reduce((highest, item) => {
        if (item.scope === 'ngplus' || item.metric !== metric) return highest;
        return Math.max(highest, finite(merged.achievements.progress[item.id]));
      }, 0);
      const historicalCrystalSpend =
        merged.totals.convertedCrystals +
        merged.converter.upgrades.reduce((sum, id) => sum + (CONVERTER_UPGRADES.find(item => item.id === id)?.cost || 0), 0) +
        merged.jukebox.unlockedGoldenSpawnSounds.reduce((sum, id) => sum + (GOLDEN_SPAWN_SOUNDS.find(item => item.id === id)?.cost || 0), 0) +
        (merged.unlocks.towerBuyMaxAll ? TOWER_BUY_MAX_ALL_CRYSTAL_COST : 0);
      merged.lifetime = {
        ...fresh.lifetime,
        buttonsEarned: Math.max(merged.totals.buttons, historicalMetric('buttons')),
        crystalsEarned: Math.max(merged.resources.crystals, merged.resources.crystals + historicalCrystalSpend + (merged.converter.active?.input || 0)),
        crystalsSpent: historicalCrystalSpend,
        coresEarned: merged.resources.cores + merged.ascension.spentCores,
        coresSpent: merged.ascension.spentCores,
        manualPresses: Math.max(merged.totals.clicks, historicalMetric('clicks')),
        criticalPresses: Math.max(merged.totals.crits, historicalMetric('crits')),
        towerPurchases: merged.totals.towersPurchased,
        upgradePurchases: merged.upgrades.length,
        converterUpgradePurchases: merged.converter.upgrades.length + merged.converter.levels.facetedBit,
        goldenSignals: Math.max(merged.totals.golden, historicalMetric('golden')),
        glitchedSignals: Math.max(merged.totals.glitches, historicalMetric('glitches')),
        auraScans: Math.max(merged.rng.scans, historicalMetric('scans')),
        arcadeWins: Math.max(merged.totals.arcadeWins, historicalMetric('arcade')),
        converterCycles: merged.totals.converterJobs,
        crystalsProcessed: merged.totals.convertedCrystals,
        ascensions: Math.max(merged.totals.ascensions, historicalMetric('ascensions')),
        newGamePlusCompletions: merged.newGamePlus.completions,
        playSeconds: Math.max(merged.totals.playSeconds, historicalMetric('playtime')),
        bestBps: merged.totals.bestBps
      };
    }
    merged.lifetime.buttonsEarned = Math.max(merged.lifetime.buttonsEarned, merged.totals.buttons);
    merged.lifetime.crystalsEarned = Math.max(merged.lifetime.crystalsEarned, merged.resources.crystals);
    merged.lifetime.coresEarned = Math.max(merged.lifetime.coresEarned, merged.resources.cores + merged.ascension.spentCores);
    merged.lifetime.coresSpent = Math.max(merged.lifetime.coresSpent, merged.ascension.spentCores);
    merged.lifetime.manualPresses = Math.max(merged.lifetime.manualPresses, merged.totals.clicks);
    merged.lifetime.criticalPresses = Math.max(merged.lifetime.criticalPresses, merged.totals.crits);
    merged.lifetime.towerPurchases = Math.max(merged.lifetime.towerPurchases, merged.totals.towersPurchased);
    merged.lifetime.upgradePurchases = Math.max(merged.lifetime.upgradePurchases, merged.upgrades.length);
    merged.lifetime.converterUpgradePurchases = Math.max(
      merged.lifetime.converterUpgradePurchases,
      merged.converter.upgrades.length + merged.converter.levels.facetedBit
    );
    merged.lifetime.goldenSignals = Math.max(merged.lifetime.goldenSignals, merged.totals.golden);
    merged.lifetime.glitchedSignals = Math.max(merged.lifetime.glitchedSignals, merged.totals.glitches);
    merged.lifetime.auraScans = Math.max(merged.lifetime.auraScans, merged.rng.scans);
    merged.lifetime.arcadeWins = Math.max(merged.lifetime.arcadeWins, merged.totals.arcadeWins);
    merged.lifetime.converterCycles = Math.max(merged.lifetime.converterCycles, merged.totals.converterJobs);
    merged.lifetime.crystalsProcessed = Math.max(merged.lifetime.crystalsProcessed, merged.totals.convertedCrystals);
    merged.lifetime.ascensions = Math.max(merged.lifetime.ascensions, merged.totals.ascensions);
    merged.lifetime.newGamePlusCompletions = Math.max(merged.lifetime.newGamePlusCompletions, merged.newGamePlus.completions);
    merged.lifetime.playSeconds = Math.max(merged.lifetime.playSeconds, merged.totals.playSeconds);
    merged.lifetime.bestBps = Math.max(merged.lifetime.bestBps, merged.totals.bestBps);
    merged.settings.fastNotes = Boolean(merged.settings.fastNotes);
    merged.settings.fastNotesSeconds = [1, 3].includes(Number(merged.settings.fastNotesSeconds)) ? Number(merged.settings.fastNotesSeconds) : 1;
    const savedAuraVisuals = raw.settings?.auraVisuals;
    merged.settings.auraVisuals = savedAuraVisuals == null || savedAuraVisuals === true
      ? 'full'
      : savedAuraVisuals === false
        ? 'off'
        : ['full', 'reduced', 'off'].includes(savedAuraVisuals)
          ? savedAuraVisuals
          : 'full';
    merged.meta.glitchRewardSeen = raw.meta?.glitchRewardSeen == null
      ? merged.totals.glitches > 0 || merged.achievements.claimed.includes('error404')
      : Boolean(merged.meta.glitchRewardSeen);
    merged.golden.nextAt = Date.now() + 1000;
    merged.golden.activeUntil = 0;
    if (!NAV_ITEMS.some(item => item.id === merged.ui.page)) merged.ui.page = 'core';
    if (!['1', '10', '25', 'next', 'max'].includes(String(merged.ui.buyMode))) merged.ui.buyMode = '1';
    if (!['area', 'line', 'bar'].includes(String(merged.ui.chartMode))) merged.ui.chartMode = 'area';
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
    migrated.upgrades = oldUpgrades.filter(id => UPGRADE_BY_ID.has(id));
    const oldCrit = clamp(finite(old.critChance, 0.02), 0.02, CRIT_CAP);
    let representedCrit = migrated.upgrades
      .map(id => UPGRADE_BY_ID.get(id))
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
    delete migrated.lifetime;
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
  let lastAutoUpgradeAt = 0;
  let lastSaveAt = performance.now();
  let lastWallTime = Date.now();
  let buyMode = String(state.ui.buyMode || '1');
  let upgradeCategories = new Set(['all']);
  let achievementScope = 'default';
  let achievementCategories = new Set(['all']);
  let upgradeRefs = {};
  let achievementRefs = {};
  let auraRefs = {};
  let towerRefs = {};
  let converterRecipeRefs = {};
  let converterUpgradeRefs = {};
  let goldenSoundRefs = {};

  function toggleCategoryFilter(selection, category) {
    if (category === 'all') {
      selection.clear();
      selection.add('all');
      return;
    }
    selection.delete('all');
    if (selection.has(category)) selection.delete(category);
    else selection.add(category);
    if (!selection.size) selection.add('all');
  }
  let chartSamples = Array(60).fill(0);
  const goldenElements = new Set();
  let savePending = false;
  let saveWritesSuspended = false;
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
    rng: { scanning: false, revealTimer: null, revealResolve: null, revealAudioTimers: [] },
    ascension: { playing: false, pendingGain: 0 },
    towerHover: { id: null, x: 0, y: 0 },
    tutorial: { active: false, index: 0, token: 0, frame: 0 },
    tree: {
      x: 0, y: 0, scale: 1,
      targetX: 0, targetY: 0, targetScale: 1,
      initialized: false, dragging: false, pointerId: null,
      startX: 0, startY: 0, originX: 0, originY: 0,
      zoomStartX: 0, zoomStartY: 0, zoomStartScale: 1, animationStartedAt: 0,
      animationFrame: 0
    },
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
    chartModes: $('#chartModes'),
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
    buyAllUpgradesButton: $('#buyAllUpgradesButton'),
    upgradeSummary: $('#upgradeSummary'),
    upgradesGrid: $('#upgradesGrid'),
    upgradesEmpty: $('#upgradesEmpty'),
    upgradeNavBadge: $('#upgradeNavBadge'),
    towerNavBadge: $('#towerNavBadge'),
    buyMaxAllTowersButton: $('#buyMaxAllTowersButton'),
    towersList: $('#towersList'),
    towerTooltip: $('#towerTooltip'),
    networkOutput: $('#networkOutput'),
    efficiencyLeader: $('#efficiencyLeader'),
    efficiencyLeaderSub: $('#efficiencyLeaderSub'),
    nextMastery: $('#nextMastery'),
    arcadeWins: $('#arcadeWins'),
    arcadeStreak: $('#arcadeStreak'),
    reactionDescription: $('#reactionDescription'),
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
    achievementRewards: $('#achievementRewards'),
    achievementNavBadge: $('#achievementNavBadge'),
    achievementViews: $('#achievementViews'),
    achievementCategories: $('#achievementCategories'),
    achievementsGrid: $('#achievementsGrid'),
    auraProgress: $('#auraProgress'),
    auraProgressFill: $('#auraProgressFill'),
    scannerVisual: $('#scannerVisual'),
    scannerAura: $('#scannerAura'),
    rngNav: $('[data-page-target="observatory"]'),
    rngChargeText: $('#rngChargeText'),
    rngChargeTrack: $('.charge-track'),
    rngChargeFill: $('#rngChargeFill'),
    rollAuraButton: $('#rollAuraButton'),
    rollAuraCost: $('#rollAuraButton span'),
    pityText: $('#pityText'),
    equippedAura: $('#equippedAura'),
    luckGrade: $('#luckGrade'),
    luckBars: $('#luckBars'),
    luckAnalysis: $('#luckAnalysis'),
    auraCollection: $('#auraCollection'),
    auraSearch: $('#auraSearch'),
    auraOddsMode: $('#auraOddsMode'),
    auraScreenFx: $('#auraScreenFx'),
    auraRevealCutscene: $('#auraRevealCutscene'),
    auraRevealPrelude: $('#auraRevealPrelude'),
    auraRevealIcon: $('#auraRevealIcon'),
    auraRevealTier: $('#auraRevealTier'),
    auraRevealName: $('#auraRevealName'),
    auraRevealEffect: $('#auraRevealEffect'),
    auraRevealOdds: $('#auraRevealOdds'),
    auraRevealDiscovery: $('#auraRevealDiscovery'),
    auraRevealSkip: $('#auraRevealSkip'),
    ascensionCount: $('#ascensionCount'),
    ascensionNavLabel: $('#ascensionNavLabel'),
    ascensionEyebrow: $('#ascensionEyebrow'),
    ascensionTitle: $('#ascensionTitle'),
    ascensionDescription: $('#ascensionDescription'),
    ngPlusBanner: $('#ngPlusBanner'),
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
    converterNav: $('[data-page-target="converter"]'),
    converterJobs: $('#converterJobs'),
    converterMemoryFault: $('#converterMemoryFault'),
    converterEyebrow: $('#converterEyebrow'),
    converterTitle: $('#converterTitle'),
    converterDescription: $('#converterDescription'),
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
    version: $('#version'),
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
    auraVisualsSetting: $('#auraVisualsSetting'),
    replayTutorialButton: $('#replayTutorialButton'),
    saveStatus: $('#saveStatus'),
    saveData: $('#saveData'),
    statsList: $('#statsList'),
    lifetimeStatsList: $('#lifetimeStatsList'),
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
    offlineDialog: $('#offlineDialog'),
    offlineGain: $('#offlineGain'),
    offlineFormula: $('#offlineFormula'),
    offlineDuration: $('#offlineDuration'),
    offlineRate: $('#offlineRate'),
    offlineEfficiency: $('#offlineEfficiency'),
    offlineCapNote: $('#offlineCapNote'),
    wipeSaveDialog: $('#wipeSaveDialog'),
    confirmWipeSaveButton: $('#confirmWipeSaveButton'),
    commandDialog: $('#commandDialog'),
    commandSearch: $('#commandSearch'),
    commandResults: $('#commandResults'),
    tutorialPromptDialog: $('#tutorialPromptDialog'),
    tutorialStartButton: $('#tutorialStartButton'),
    tutorialOverlay: $('#tutorialOverlay'),
    tutorialSpotlight: $('#tutorialSpotlight'),
    tutorialPanel: $('#tutorialPanel'),
    tutorialIcon: $('#tutorialIcon'),
    tutorialStep: $('#tutorialStep'),
    tutorialTitle: $('#tutorialTitle'),
    tutorialCopy: $('#tutorialCopy'),
    tutorialProgressFill: $('#tutorialProgressFill'),
    tutorialExitButton: $('#tutorialExitButton'),
    tutorialBackButton: $('#tutorialBackButton'),
    tutorialNextButton: $('#tutorialNextButton'),
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

  function largeNumberSuffix(tier) {
    if (tier < BASIC_NUMBER_SUFFIXES.length) return BASIC_NUMBER_SUFFIXES[tier];
    const illionIndex = tier - 1;
    if (illionIndex >= 100) {
      const centillionOffset = Math.min(ILLION_ONES_PREFIXES.length - 1, illionIndex - 100);
      return `${ILLION_ONES_PREFIXES[centillionOffset]}Ce`;
    }
    const tens = Math.floor(illionIndex / 10);
    const ones = illionIndex % 10;
    const tensSuffix = ILLION_TENS_SUFFIXES[tens];
    if (!ones) return tensSuffix;
    return `${ILLION_ONES_PREFIXES[ones]}${tensSuffix.charAt(0).toLowerCase()}${tensSuffix.slice(1)}`;
  }

  function formatSuffixNumber(value, digits = 2) {
    const number = finite(value);
    if (number === 0) return '0';
    if (Math.abs(number) < 1000) {
      if (Math.abs(number) >= 100) return Math.floor(number).toLocaleString('en-US');
      if (Math.abs(number) >= 10) return number.toFixed(number % 1 ? 1 : 0);
      return number.toFixed(number % 1 ? digits : 0);
    }
    let tier = Math.min(MAX_NUMBER_SUFFIX_TIER, Math.floor(Math.log10(Math.abs(number)) / 3));
    let scaled = number / Math.pow(1000, tier);
    let precision = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : digits;
    let rounded = Number(scaled.toFixed(precision));
    if (Math.abs(rounded) >= 1000 && tier < MAX_NUMBER_SUFFIX_TIER) {
      tier++;
      scaled = number / Math.pow(1000, tier);
      precision = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : digits;
      rounded = Number(scaled.toFixed(precision));
    }
    return `${rounded.toFixed(precision)}${largeNumberSuffix(tier)}`;
  }

  function formatNumber(value, digits = 2) {
    const number = finite(value);
    if (state.settings.numberFormat === 'scientific' && Math.abs(number) >= 1000) return number.toExponential(digits);
    return formatSuffixNumber(number, digits);
  }

  function formatPreciseAmount(value, decimals = CONVERTER_INPUT_DECIMALS) {
    const amount = Math.max(0, finite(value));
    if (amount >= 1000) return formatNumber(amount, 2);
    return amount.toFixed(decimals).replace(/\.?0+$/, '');
  }

  function formatCrystalAmount(value) {
    return formatCurrencyAmount(value);
  }

  function formatCoreAmount(value) {
    return formatCurrencyAmount(value);
  }

  function formatCurrencyAmount(value) {
    const number = finite(value);
    if (state.settings.numberFormat === 'scientific' && Math.abs(number) >= 1000) {
      return number.toExponential(2);
    }
    if (Math.abs(number) < 1000) {
      return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    let tier = Math.min(MAX_NUMBER_SUFFIX_TIER, Math.floor(Math.log10(Math.abs(number)) / 3));
    let scaled = number / Math.pow(1000, tier);
    if (Math.abs(Number(scaled.toFixed(2))) >= 1000 && tier < MAX_NUMBER_SUFFIX_TIER) {
      tier++;
      scaled = number / Math.pow(1000, tier);
    }
    return `${scaled.toFixed(2)}${largeNumberSuffix(tier)}`;
  }

  function formatDuration(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    if (safe < 60) return `${safe}s`;
    if (safe < 3600) return `${Math.floor(safe / 60)}m ${safe % 60}s`;
    if (safe < 86400) return `${Math.floor(safe / 3600)}h ${Math.floor((safe % 3600) / 60)}m`;
    return `${Math.floor(safe / 86400)}d ${Math.floor((safe % 86400) / 3600)}h`;
  }

  function rewardLabel(reward) {
    if (state?.newGamePlus?.active) return 'SUPPRESSED // NEW GAME+';
    if (reward.kind === 'crystals') return `+${formatCrystalAmount(reward.value * (mods?.crystalGain || 1))} ◆`;
    if (reward.kind === 'seconds') return `${reward.value}s output`;
    if (reward.kind === 'global') return reward.value >= 2
      ? `Permanent ×${formatNumber(reward.value, 0)}`
      : `Permanent +${Math.round((reward.value - 1) * 100)}%`;
    if (reward.kind === 'crit') return `Critical +${(reward.value * 100).toFixed(0)}%`;
    if (reward.kind === 'ngPlus') return `Production ×${formatNumber(reward.production, 0)} // RNG ×${formatNumber(reward.rngLuck, 0)}`;
    return 'Reward';
  }

  function totalTowers() {
    return TOWERS.reduce((sum, tower) => sum + safeInt(state.towers[tower.id]), 0);
  }

  function discoveredAuraCount() {
    return AURAS.reduce((sum, aura) => sum + (state.rng.discovered[aura.id] ? 1 : 0), 0);
  }

  function highestDiscoveredAuraRank() {
    return AURAS.reduce((highest, aura) => {
      if (!state.rng.discovered[aura.id]) return highest;
      return Math.max(highest, RARITY_RANK[aura.tier] ?? 0);
    }, 0);
  }

  function neverClickChallenge() {
    return state.challenges.trueNeverClick;
  }

  function failNeverClickChallenge(mode = state.newGamePlus.active ? 'ngplus' : 'default') {
    const challenge = neverClickChallenge();
    if (mode === 'ngplus') {
      if (!challenge.ngPlusAchieved) challenge.ngPlusEligible = false;
    } else if (!challenge.defaultAchieved) {
      challenge.defaultEligible = false;
    }
    savePending = true;
  }

  function updateNeverClickChallenge() {
    const challenge = neverClickChallenge();
    const ngPlus = state.newGamePlus.active;
    const eligible = ngPlus ? challenge.ngPlusEligible : challenge.defaultEligible;
    const achieved = ngPlus ? challenge.ngPlusAchieved : challenge.defaultAchieved;
    if (!eligible || achieved || state.totals.buttons < NEVER_CLICK_TARGET) return false;
    if (ngPlus) {
      challenge.ngPlusAchieved = true;
      challenge.ngPlusEligible = false;
      state.achievements.progress.ngTrueNeverClick = NEVER_CLICK_TARGET;
    } else {
      challenge.defaultAchieved = true;
      challenge.defaultEligible = false;
      state.achievements.progress.trueNeverClick = NEVER_CLICK_TARGET;
    }
    markDirty();
    return true;
  }

  function neverClickChallengeFailed(item) {
    const challenge = neverClickChallenge();
    if (item.challenge === 'neverClickDefault') return !challenge.defaultEligible && !challenge.defaultAchieved;
    if (item.challenge === 'neverClickNgPlus') return !challenge.ngPlusEligible && !challenge.ngPlusAchieved;
    return false;
  }

  function activeBuffMultiplier() {
    const now = Date.now();
    return state.buffs.reduce((product, buff) => buff.until > now ? product * finite(buff.mult, 1) : product, 1);
  }

  function masteryMultiplier(count) {
    return Math.pow(2, TOWER_MASTERY_THRESHOLDS.filter(threshold => count >= threshold).length);
  }

  function achievementRawMetric(item) {
    if (item.scope === 'ngplus' && item.metric !== 'newGamePlus' && !state.newGamePlus.active) return 0;
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
      case 'arcadeInsaneStreak': return safeInt(state.minigames.consecutiveWins['sequence:insane']);
      case 'arcadeImpossible': return safeInt(state.minigames.difficultyWins['sequence:impossible']);
      case 'arcadeImpossibleStreak': return safeInt(state.minigames.consecutiveWins['sequence:impossible']);
      case 'cipherHard': return safeInt(state.minigames.difficultyWins['cipher:hard']);
      case 'auras': return discoveredAuraCount();
      case 'auraRarity': return highestDiscoveredAuraRank();
      case 'neverClickDefault': return state.challenges.trueNeverClick.defaultAchieved
        ? NEVER_CLICK_TARGET
        : state.challenges.trueNeverClick.defaultEligible && !state.newGamePlus.active
          ? Math.min(NEVER_CLICK_TARGET, state.totals.buttons)
          : 0;
      case 'neverClickNgPlus': return state.challenges.trueNeverClick.ngPlusAchieved
        ? NEVER_CLICK_TARGET
        : state.challenges.trueNeverClick.ngPlusEligible && state.newGamePlus.active
          ? Math.min(NEVER_CLICK_TARGET, state.totals.buttons)
          : 0;
      case 'scans': return state.rng.scans;
      case 'secrets': return state.secrets.found.length;
      case 'secretSevenfold': return has(state.secrets.found, 'sevenfold') ? 1 : 0;
      case 'secretUpup': return has(state.secrets.found, 'upup') ? 1 : 0;
      case 'secretEcho': return has(state.secrets.found, 'echo') ? 1 : 0;
      case 'secretHeartbeat': return has(state.secrets.found, 'heartbeat') ? 1 : 0;
      case 'ascensions': return state.totals.ascensions;
      case 'coreLevels': return Object.values(state.ascension.nodes).reduce((sum, level) => sum + safeInt(level), 0);
      case 'playtime': return state.lifetime.playSeconds;
      case 'newGamePlus': return state.newGamePlus.completions;
      default: return 0;
    }
  }

  function achievementMetric(item) {
    const current = Math.max(0, finite(achievementRawMetric(item)));
    const saved = Math.max(0, finite(state.achievements.progress?.[item.id]));
    const progress = Math.max(current, saved);
    if (progress > saved) {
      state.achievements.progress[item.id] = progress;
      savePending = true;
    }
    return progress;
  }

  function snapshotAchievementProgress() {
    if (!state.achievements.progress || typeof state.achievements.progress !== 'object') {
      state.achievements.progress = {};
    }
    for (const item of ACHIEVEMENTS) {
      const saved = Math.max(0, finite(state.achievements.progress[item.id]));
      const current = Math.max(0, finite(achievementRawMetric(item)));
      const completed = has(state.achievements.claimed, item.id) ? item.target : 0;
      const progress = Math.max(saved, current, completed);
      if (progress > 0) state.achievements.progress[item.id] = progress;
    }
  }

  function achievementComplete(item) {
    return has(state.achievements.claimed, item.id) || achievementMetric(item) >= item.target;
  }

  function achievementVisible(item) {
    if (item.scope === 'ngplus') return state.newGamePlus.active || state.newGamePlus.completed;
    return !item.hiddenUntilNgPlus || state.newGamePlus.active || state.newGamePlus.completed;
  }

  function recomputeModifiers() {
    const next = {
      clickBase: 1,
      clickMult: 1,
      clickBpsSeconds: 0,
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
      rngLuck: 1,
      crystalGain: 1,
      chargeRestore: 1,
      manualRngCharge: MANUAL_RNG_CHARGE,
      auraScanCost: AURA_SCAN_COST,
      autoUpgrades: false,
      auraLuck: 0,
      converterYield: 1,
      converterButtonYield: 1,
      converterSpeed: 1,
      converterEfficiency: 1,
      comboLimit: BASE_COMBO_LIMIT,
      startButtons: 0
    };

    for (const id of state.upgrades) {
      const effect = UPGRADE_BY_ID.get(id)?.effect;
      if (!effect) continue;
      if (effect.kind === 'clickFlat') next.clickBase += effect.value;
      if (effect.kind === 'clickMult') next.clickMult *= effect.value;
      if (effect.kind === 'clickBps') next.clickBpsSeconds += effect.value;
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
    const facetedBit = CONVERTER_UPGRADES.find(item => item.id === 'facetedBit');
    const facetedBitLevel = clamp(safeInt(state.converter.levels?.facetedBit), 0, facetedBit?.max || 1000);
    if (facetedBitLevel) {
      next.converterButtonYield = converterRecursiveYieldMultiplier(facetedBit, facetedBitLevel);
    }

    if (!state.newGamePlus.active) {
      for (const item of ACHIEVEMENTS) {
        if (!has(state.achievements.claimed, item.id) || item.reward.kind !== 'global') continue;
        next.global *= item.reward.value;
      }
      if (has(state.achievements.claimed, NG_PLUS_ACHIEVEMENT_ID)) {
        next.global *= 1000;
        next.rngLuck *= 100;
      }
    }

    const nodes = state.ascension.nodes;
    for (const node of CORE_NODES) {
      const level = nodes[node.id] || 0;
      if (!level) continue;
      for (const effect of node.effects || []) {
        if (effect.kind === 'startButtons') next.startButtons += effect.value * level;
        if (effect.kind === 'clickBase') next.clickBase += effect.value * level;
        if (effect.kind === 'clickMult') next.clickMult *= Math.pow(effect.value, level);
        if (effect.kind === 'clickBps') next.clickBpsSeconds += effect.value * level;
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
        if (effect.kind === 'autoUpgrades') next.autoUpgrades = true;
        if (effect.kind === 'auraLuck') next.auraLuck = AURA_LUCK_BONUSES[clamp(level, 0, AURA_LUCK_BONUSES.length - 1)];
        if (effect.kind === 'rngLuck') next.rngLuck *= Math.pow(effect.value, level);
        if (effect.kind === 'crystalGain') next.crystalGain *= Math.pow(effect.value, level);
        if (effect.kind === 'chargeRestore') next.chargeRestore *= Math.pow(effect.value, level);
        if (effect.kind === 'manualRngCharge') next.manualRngCharge = Math.max(next.manualRngCharge, effect.value);
        if (effect.kind === 'auraScanCost') next.auraScanCost = Math.min(next.auraScanCost, effect.value);
      }
    }
    next.rngAutoCharge = ENTROPY_CHARGE_RATES[clamp(safeInt(nodes.entropyBattery), 0, ENTROPY_CHARGE_RATES.length - 1)];
    next.comboLimit = BASE_COMBO_LIMIT * COMBO_LIMIT_MULTIPLIERS[
      clamp(safeInt(nodes.cadenceReservoir), 0, COMBO_LIMIT_MULTIPLIERS.length - 1)
    ];

    const aura = AURA_BY_ID.get(state.rng.equipped);
    if (!state.newGamePlus.active && aura && state.rng.discovered[aura.id]) {
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
    const achievementMethods = state.newGamePlus.active
      ? 0
      : CRIT_ACHIEVEMENTS.filter(id => has(state.achievements.claimed, id)).length;
    const secretMethods = state.secrets.found.length;
    const coreMethods = state.ascension.nodes.probability;
    const auraMethod = !state.newGamePlus.active && state.rng.discovered.paradox ? 1 : 0;
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
        { icon: 'fa-trophy', name: 'Achievement rewards', detail: state.newGamePlus.active ? 'Suppressed by New Game+' : `${achievementMethods} of 5 critical rewards claimed`, done: achievementMethods, total: 5, value: achievementMethods * 0.01, max: 0.05 },
        { icon: 'fa-key', name: 'Restricted signals', detail: `${secretMethods} of 4 secrets recovered`, done: secretMethods, total: 4, value: secretMethods * 0.025, max: 0.10 },
        { icon: 'fa-rocket', name: 'Probability Weave', detail: `${coreMethods} of 5 permanent levels`, done: coreMethods, total: 5, value: coreMethods * 0.025, max: 0.125 },
        { icon: 'fa-infinity', name: 'Paradox frequency', detail: state.newGamePlus.active ? 'Aura effects suppressed by New Game+' : auraMethod ? 'Transcendent aura discovered' : 'Undiscovered in the Observatory', done: auraMethod, total: 1, value: auraMethod * 0.03, max: 0.03 },
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
    const directPower = current.clickBase * current.clickMult * current.global;
    const networkPower = calculateBps() * current.clickBpsSeconds;
    return directPower + networkPower;
  }

  function towerProductionEachAtCount(tower, count) {
    const current = ensureModifiers();
    return tower.baseProd * current.towerMult[tower.id] * masteryMultiplier(count) * current.towerGlobal * current.global;
  }

  function towerProductionEach(tower) {
    return towerProductionEachAtCount(tower, state.towers[tower.id]);
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

  function maxAffordableTower(tower, budget = state.resources.buttons) {
    const first = towerUnitCost(tower);
    const availableButtons = Math.max(0, finite(budget));
    if (!Number.isFinite(first) || availableButtons < first) return 0;
    const ratio = availableButtons / first;
    let amount;
    if (Number.isFinite(ratio)) {
      amount = Math.floor(Math.log1p(ratio * (tower.growth - 1)) / Math.log(tower.growth));
    } else {
      amount = Math.floor((Math.log(availableButtons) - Math.log(first) + Math.log(tower.growth - 1)) / Math.log(tower.growth));
    }
    amount = clamp(safeInt(amount), 0, 1e6);
    while (amount > 0 && towerBulkCost(tower, amount) > availableButtons) amount--;
    while (amount < 1e6 && towerBulkCost(tower, amount + 1) <= availableButtons) amount++;
    return amount;
  }

  function selectedTowerAmount(tower) {
    if (buyMode === 'max') return maxAffordableTower(tower);
    if (buyMode === 'next') {
      const owned = state.towers[tower.id];
      const nextMastery = TOWER_MASTERY_THRESHOLDS.find(threshold => owned < threshold);
      return nextMastery ? nextMastery - owned : 0;
    }
    return Number(buyMode);
  }

  function addLifetimeStat(key, amount) {
    const gain = Math.max(0, finite(amount));
    if (!gain || !Object.hasOwn(state.lifetime, key)) return;
    state.lifetime[key] = Math.min(Number.MAX_VALUE, state.lifetime[key] + gain);
  }

  function addButtons(amount) {
    const gain = Math.max(0, finite(amount));
    if (!gain) return;
    state.resources.buttons = Math.min(Number.MAX_VALUE, state.resources.buttons + gain);
    state.totals.buttons = Math.min(Number.MAX_VALUE, state.totals.buttons + gain);
    state.totals.runButtons = Math.min(Number.MAX_VALUE, state.totals.runButtons + gain);
    addLifetimeStat('buttonsEarned', gain);
    updateNeverClickChallenge();
  }

  function addCrystals(amount) {
    ensureModifiers();
    const baseGain = Math.max(0, finite(amount));
    const gain = Math.floor(Math.min(Number.MAX_VALUE, baseGain * mods.crystalGain));
    if (!gain) return 0;
    state.resources.crystals = Math.min(Number.MAX_VALUE, state.resources.crystals + gain);
    addLifetimeStat('crystalsEarned', gain);
    return gain;
  }

  function passiveRngChargeRate() {
    ensureModifiers();
    return Math.min(
      MAX_PASSIVE_RNG_CHARGE_PER_SECOND,
      mods.rngAutoCharge * mods.charge * mods.chargeRestore
    );
  }

  function spendButtons(amount) {
    const cost = Math.max(0, finite(amount));
    if (state.resources.buttons + Math.max(1e-9, cost * 1e-12) < cost) return false;
    state.resources.buttons = Math.max(0, state.resources.buttons - cost);
    addLifetimeStat('buttonsSpent', cost);
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
      if (name === 'click') this.tone(150, 0.065, 'sine', 0.03, -30);
      if (name === 'crit') {
        this.tone(230, 0.16, 'square', 0.01, 430);
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
    failNeverClickChallenge();
    ensureModifiers();
    const now = performance.now();
    const rapid = now - lastManualPress < 650;
    combo = rapid ? clamp(combo + 1, 0, mods.comboLimit) : Math.max(1, combo * 0.4);
    lastManualPress = now;
    const comboMultiplier = 1 + combo * 0.05;
    const critical = Math.random() < currentCritChance;
    const directPower = mods.clickBase * mods.clickMult * mods.global;
    const networkPower = calculateBps() * mods.clickBpsSeconds;
    const comboAdjustedPress = (directPower + networkPower) * comboMultiplier;
    const gain = comboAdjustedPress * (critical ? mods.critMult : 1);
    addButtons(gain);
    state.totals.clicks++;
    addLifetimeStat('manualPresses', 1);
    if (critical) {
      state.totals.crits++;
      addLifetimeStat('criticalPresses', 1);
    }
    state.rng.charge = clamp(state.rng.charge + mods.manualRngCharge, 0, 100);
    savePending = true;
    updateResourceHud(true);

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

  function upgradeUnlockMetric(upgradeItem, ownedUpgrades = null) {
    const unlock = upgradeItem.unlock || {};
    const requirementOwned = !unlock.requires || (ownedUpgrades ? ownedUpgrades.has(unlock.requires) : has(state.upgrades, unlock.requires));
    if (!requirementOwned) return { value: 0, target: 1, label: 'Previous modification required' };
    if (!unlock.type) return { value: 1, target: 1, label: 'Available' };
    if (unlock.type === 'buttons') return { value: state.totals.buttons, target: unlock.value, label: `Produce ${formatNumber(unlock.value)} lifetime buttons` };
    if (unlock.type === 'towers') return { value: totalTowers(), target: unlock.value, label: `Own ${formatNumber(unlock.value)} total towers` };
    if (unlock.type === 'tower') return { value: state.towers[unlock.tower], target: unlock.value, label: `Own ${unlock.value} ${TOWER_BY_ID.get(unlock.tower)?.name}` };
    if (unlock.type === 'golden') return { value: state.totals.golden, target: unlock.value, label: `Catch ${unlock.value} golden signals` };
    if (unlock.type === 'scans') return { value: state.rng.scans, target: unlock.value, label: `Complete ${unlock.value} aura scans` };
    return { value: 0, target: 1, label: 'Locked' };
  }

  function upgradeUnlocked(upgradeItem, ownedUpgrades = null) {
    const metric = upgradeUnlockMetric(upgradeItem, ownedUpgrades);
    return metric.value >= metric.target;
  }

  function upgradeLogProgress(value, target) {
    const safeValue = Math.max(0, finite(value));
    const safeTarget = Math.max(1, finite(target, 1));
    if (safeValue >= safeTarget) return 1;
    if (!safeValue) return 0;
    return clamp(Math.log10(safeValue + 1) / Math.log10(safeTarget + 1), 0, 1);
  }

  function upgradeAcquisitionProgress(item, ownedUpgrades, visited = new Set(), memo = new Map()) {
    if (!item) return 0;
    if (ownedUpgrades.has(item.id)) return 1;
    if (memo.has(item.id)) return memo.get(item.id);
    if (visited.has(item.id)) return 0;
    const nextVisited = new Set(visited);
    nextVisited.add(item.id);
    const unlock = item.unlock || {};
    let prerequisiteProgress = 1;
    if (unlock.requires && !ownedUpgrades.has(unlock.requires)) {
      prerequisiteProgress = upgradeAcquisitionProgress(UPGRADE_BY_ID.get(unlock.requires), ownedUpgrades, nextVisited, memo);
    }
    const metricOwned = new Set(ownedUpgrades);
    if (unlock.requires) metricOwned.add(unlock.requires);
    const metric = upgradeUnlockMetric(item, metricOwned);
    const metricProgress = unlock.type === 'buttons'
      ? upgradeLogProgress(metric.value, metric.target)
      : clamp(metric.value / Math.max(1, metric.target), 0, 1);
    const unlockProgress = Math.min(prerequisiteProgress, metricProgress);
    const costProgress = upgradeLogProgress(state.resources.buttons, item.cost);
    const progress = clamp(unlockProgress * .72 + costProgress * .28, 0, 1);
    memo.set(item.id, progress);
    return progress;
  }

  function sortAvailableUpgrades(items, ownedUpgrades) {
    const progressMemo = new Map();
    const rankMemo = new Map();
    const rank = item => {
      if (rankMemo.has(item.id)) return rankMemo.get(item.id);
      let result;
      if (ownedUpgrades.has(item.id)) {
        result = { stage: 3, progress: 1 };
      } else {
        const unlocked = upgradeUnlocked(item, ownedUpgrades);
        const affordable = unlocked && state.resources.buttons >= item.cost;
        if (affordable) result = { stage: 0, progress: 1 };
        else if (unlocked) result = { stage: 1, progress: upgradeLogProgress(state.resources.buttons, item.cost) };
        else result = { stage: 2, progress: upgradeAcquisitionProgress(item, ownedUpgrades, new Set(), progressMemo) };
      }
      rankMemo.set(item.id, result);
      return result;
    };
    return [...items].sort((a, b) => {
      const aRank = rank(a);
      const bRank = rank(b);
      return aRank.stage - bRank.stage || bRank.progress - aRank.progress || a.cost - b.cost;
    });
  }

  function reorderAvailableUpgradeCards(ownedUpgrades) {
    if ((ui.upgradeStatus?.value || 'affordable') !== 'available') return;
    const ordered = sortAvailableUpgrades(UPGRADES.filter(item => upgradeRefs[item.id]), ownedUpgrades);
    const signature = ordered.map(item => item.id).join('|');
    if (ui.upgradesGrid.dataset.orderSignature === signature) return;
    ui.upgradesGrid.dataset.orderSignature = signature;
    ordered.forEach(item => ui.upgradesGrid.append(upgradeRefs[item.id].card));
  }

  function installUpgrade(item, ownedUpgrades = null) {
    const owned = ownedUpgrades ? ownedUpgrades.has(item?.id) : has(state.upgrades, item?.id);
    if (!item || owned || !upgradeUnlocked(item, ownedUpgrades) || !spendButtons(item.cost)) return false;
    state.upgrades.push(item.id);
    addLifetimeStat('upgradePurchases', 1);
    ownedUpgrades?.add(item.id);
    markDirty();
    return true;
  }

  function buyUpgrade(id) {
    const item = UPGRADE_BY_ID.get(id);
    if (!installUpgrade(item)) return;
    updateUpgradeCards();
    updateAchievementCards();
    updateResourceHud(true);
    audio.play('buy');
    logEvent('Modification installed', `${item.name}: ${item.effectText}`, item.category === 'critical' ? 'gold' : 'good');
    toast('Upgrade installed', item.name, item.category === 'critical' ? 'gold' : '');
  }

  function buyEveryAffordableUpgrade(options = {}) {
    const automatic = options?.automatic === true;
    if (!automatic) audio.ensure();
    const ownedUpgrades = new Set(state.upgrades);
    let purchased = 0;
    let spent = 0;
    let installedInPass = true;
    while (installedInPass) {
      installedInPass = false;
      for (const item of UPGRADES) {
        if (ownedUpgrades.has(item.id) || !upgradeUnlocked(item, ownedUpgrades) || state.resources.buttons < item.cost) continue;
        if (!installUpgrade(item, ownedUpgrades)) continue;
        purchased++;
        spent += item.cost;
        installedInPass = true;
      }
    }
    if (!purchased) return;
    if (state.ui.page === 'upgrades') updateUpgradeCards();
    if (state.ui.page === 'achievements') updateAchievementCards();
    updateResourceHud(true);
    if (!automatic) {
      audio.play('buy');
      logEvent('Upgrade matrix synchronized', `${formatNumber(purchased, 0)} modifications installed for ${formatNumber(spent)} buttons.`, 'good');
      toast('Bulk installation complete', `${purchased} upgrade${purchased === 1 ? '' : 's'} installed.`);
    }
    return purchased;
  }

  function buyTower(id) {
    const tower = TOWERS.find(item => item.id === id);
    if (!tower) return;
    const amount = selectedTowerAmount(tower);
    const cost = towerBulkCost(tower, amount);
    if (!amount || !spendButtons(cost)) return;
    state.towers[id] += amount;
    state.totals.towersPurchased += amount;
    addLifetimeStat('towerPurchases', amount);
    markDirty();
    updateTowerList();
    updateAchievementCards();
    audio.play('buy');
    logEvent(`${tower.name} expanded`, `Purchased ${formatNumber(amount)} for ${formatNumber(cost)} buttons.`, 'good');
  }

  function unlockTowerBuyMaxAll() {
    if (state.unlocks.towerBuyMaxAll) return true;
    const missing = TOWER_BUY_MAX_ALL_CRYSTAL_COST - state.resources.crystals;
    if (missing > 0) {
      toast('Network license locked', `${formatCrystalAmount(missing)} more Crystals are required to unlock BUY MAX ON ALL.`);
      audio.play('fail');
      return false;
    }
    state.resources.crystals -= TOWER_BUY_MAX_ALL_CRYSTAL_COST;
    addLifetimeStat('crystalsSpent', TOWER_BUY_MAX_ALL_CRYSTAL_COST);
    state.unlocks.towerBuyMaxAll = true;
    markDirty();
    updateResourceHud(true);
    updateTowerList();
    audio.play('reward');
    logEvent('Network purchasing license installed', `BUY MAX ON ALL permanently unlocked for ${formatCrystalAmount(TOWER_BUY_MAX_ALL_CRYSTAL_COST)} Crystals.`, 'gold');
    toast('BUY MAX ON ALL unlocked', 'The tower network can now be expanded in one action.', 'gold');
    return true;
  }

  function handleBuyMaxAllTowers() {
    if (!state.unlocks.towerBuyMaxAll) {
      unlockTowerBuyMaxAll();
      return;
    }
    buyMaxAllTowers();
  }

  function buyMaxAllTowers() {
    if (!state.unlocks.towerBuyMaxAll) return;
    audio.ensure();
    const candidates = TOWERS
      .filter(tower => towerUnitCost(tower) <= state.resources.buttons)
      .reverse();
    let purchased = 0;
    let expandedTypes = 0;
    let spent = 0;
    for (let index = 0; index < candidates.length; index++) {
      const tower = candidates[index];
      const remainingTypes = candidates.length - index;
      const firstCost = towerUnitCost(tower);
      if (firstCost > state.resources.buttons) continue;
      const budget = Math.max(firstCost, state.resources.buttons / remainingTypes);
      const amount = maxAffordableTower(tower, budget);
      const cost = towerBulkCost(tower, amount);
      if (!amount || !spendButtons(cost)) continue;
      state.towers[tower.id] += amount;
      state.totals.towersPurchased += amount;
      addLifetimeStat('towerPurchases', amount);
      purchased += amount;
      expandedTypes++;
      spent += cost;
    }
    if (!purchased) return;
    markDirty();
    updateTowerList();
    updateAchievementCards();
    updateResourceHud(true);
    audio.play('buy');
    logEvent('Tower network bulk-expanded', `${formatNumber(purchased)} towers across ${expandedTypes} types for ${formatNumber(spent)} buttons.`, 'good');
    toast('Network expansion complete', `${formatNumber(purchased)} towers purchased across ${expandedTypes} tower type${expandedTypes === 1 ? '' : 's'}.`);
  }

  function achievementInScope(item, scope = achievementScope) {
    if (!achievementVisible(item)) return false;
    if (scope === 'aura') return item.group === 'aura';
    if (item.group === 'aura') return false;
    return scope === 'ngplus' ? item.scope === 'ngplus' : item.scope !== 'ngplus';
  }

  function achievementMatchesCategory(item, scope = achievementScope, categories = achievementCategories) {
    if (categories.has('all')) return true;
    if (scope === 'aura') return categories.has(item.scope || 'default');
    return categories.has(item.category);
  }

  function achievementItemsForScope(scope = achievementScope, applyCategory = false) {
    return ACHIEVEMENTS.filter(item =>
      achievementInScope(item, scope) &&
      (!applyCategory || achievementMatchesCategory(item, scope))
    );
  }

  function getAchievementStats(scope = achievementScope) {
    const visible = achievementItemsForScope(scope);
    const unlocked = visible.filter(achievementComplete);
    const claimable = state.newGamePlus.active
      ? []
      : unlocked.filter(item => !has(state.achievements.claimed, item.id));
    return { visible, unlocked, claimable };
  }

  function rewardDescription(reward) {
    if (reward.kind === 'crystals') return 'Crystals transferred to the Observatory.';
    if (reward.kind === 'seconds') return 'Stored production released into your button balance.';
    if (reward.kind === 'global') return 'This permanent multiplier is now active across every cycle.';
    if (reward.kind === 'crit') return 'A new permanent route toward the 75% critical cap is complete.';
    if (reward.kind === 'ngPlus') return 'Normal reality is restored. Every production source is multiplied by 1,000 and all RNG luck is multiplied by 100.';
    return 'Reward acquired.';
  }

  function autoClaimAchievements({ announce = true } = {}) {
    if (state.newGamePlus.active) return [];
    const ready = ACHIEVEMENTS.filter(item =>
      achievementVisible(item) &&
      achievementComplete(item) &&
      !has(state.achievements.claimed, item.id)
    );
    if (!ready.length) return ready;

    for (const item of ready) state.achievements.claimed.push(item.id);
    markDirty();
    ensureModifiers();

    for (const item of ready) {
      if (item.reward.kind === 'crystals') {
        const payout = addCrystals(item.reward.value);
        state.totals.achievementCrystals += payout;
      }
      if (item.reward.kind === 'seconds') addButtons(Math.max(currentBps, currentClickPower) * item.reward.value);
      logEvent('Achievement unlocked', `${item.name} — ${rewardLabel(item.reward)}`, 'gold');
    }

    audio.play('reward');
    if (announce) {
      if (ready.length === 1) {
        const item = ready[0];
        toast('Achievement claimed', `${item.name} — ${rewardLabel(item.reward)}`, 'gold');
      } else {
        toast('Achievements claimed', `${ready.length} completed rewards activated.`, 'gold');
      }
    }
    return ready;
  }

  function addArcadeWin(crystals, label, gameName = null, difficulty = null) {
    const exactPayout = Math.max(0, crystals) + state.minigames.arcadeCrystalRemainder;
    const payout = Math.floor(exactPayout + 1e-9);
    state.minigames.arcadeCrystalRemainder = exactPayout - payout;
    const crystalReward = addCrystals(payout);
    state.totals.arcadeWins++;
    addLifetimeStat('arcadeWins', 1);
    state.minigames.streak++;
    state.minigames.failureStreak = 0;
    state.minigames.lastFailurePenalty = 0;
    if (gameName && difficulty) {
      const key = `${gameName}:${difficulty}`;
      state.minigames.difficultyWins[key] = safeInt(state.minigames.difficultyWins[key]) + 1;
      if (gameName === 'sequence' && (difficulty === 'insane' || difficulty === 'impossible')) {
        const streakKey = `${gameName}:${difficulty}`;
        state.minigames.consecutiveWins[streakKey] = safeInt(state.minigames.consecutiveWins[streakKey]) + 1;
      }
    }
    markDirty();
    audio.play('reward');
    toast(`${label} complete`, `+${formatCrystalAmount(crystalReward)} crystals`, 'gold');
  }

  function arcadeFailureBase(gameName, difficulty = 'easy') {
    if (gameName === 'reaction') return 3;
    if (gameName === 'sequence') {
      const config = SEQUENCE_DIFFICULTIES[difficulty] || SEQUENCE_DIFFICULTIES.easy;
      return Math.max(2, Math.ceil(config.startLength * config.rewardMultiplier));
    }
    if (gameName === 'pulse') {
      const config = PULSE_DIFFICULTIES[difficulty] || PULSE_DIFFICULTIES.easy;
      return 3 * config.rewardMultiplier;
    }
    if (gameName === 'vector') {
      const config = VECTOR_DIFFICULTIES[difficulty] || VECTOR_DIFFICULTIES.easy;
      return Math.ceil(config.reward / 2);
    }
    if (gameName === 'cipher') {
      const config = CIPHER_DIFFICULTIES[difficulty] || CIPHER_DIFFICULTIES.easy;
      return Math.ceil(config.reward / 2);
    }
    if (gameName === 'stability') {
      const config = STABILITY_DIFFICULTIES[difficulty] || STABILITY_DIFFICULTIES.easy;
      return config.rewardPerLock;
    }
    return 3;
  }

  function addArcadeFailure(label, gameName, difficulty = 'easy') {
    state.minigames.failureStreak = safeInt(state.minigames.failureStreak) + 1;
    state.minigames.streak = 0;
    if (state.minigames.consecutiveWins) {
      for (const streakKey of Object.keys(state.minigames.consecutiveWins)) {
        if (streakKey.startsWith('sequence:')) {
          state.minigames.consecutiveWins[streakKey] = 0;
        }
      }
    }
    const basePenalty = arcadeFailureBase(gameName, difficulty);
    const intendedPenalty = Math.max(
      Math.ceil(basePenalty * state.minigames.failureStreak),
      safeInt(state.minigames.lastFailurePenalty) + Math.max(1, Math.ceil(basePenalty / 2))
    );
    state.minigames.lastFailurePenalty = intendedPenalty;
    const crystalPenalty = Math.min(state.resources.crystals, intendedPenalty);
    state.resources.crystals = Math.max(0, state.resources.crystals - crystalPenalty);
    markDirty();
    updateResourceHud(true);
    const balanceNote = crystalPenalty < intendedPenalty ? ' • balance depleted' : '';
    toast(`${label} failed`, `−${formatCrystalAmount(crystalPenalty)} crystals • failure streak ${state.minigames.failureStreak}${balanceNote}`, 'rare');
    return crystalPenalty;
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
      ui.reactionStatus.textContent = state.newGamePlus.active ? 'WAIT FOR BLUE' : 'WAIT FOR GREEN';
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
      addArcadeFailure('Signal Break', 'reaction');
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
      addArcadeFailure('Echo Array', 'sequence', game.difficulty);
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
    ui.sequenceStatus.textContent = config.growth > 1 ? `Wave confirmed // +${config.growth} signals` : 'Wave confirmed';
    for (let step = 0; step < config.growth; step++) game.pattern.push(Math.floor(Math.random() * 4));
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
        addArcadeFailure('Pulse Lock', 'pulse', game.difficulty);
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
      addArcadeFailure('Vector Trace', 'vector', game.difficulty);
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
      addArcadeFailure('Cipher Sum', 'cipher', game.difficulty);
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
        addArcadeFailure('Pressure Seal', 'stability', game.difficulty);
      }
    } else {
      randomizeStabilityTarget();
    }
    renderArcade();
  }

  function auraRevealIntensity(rank) {
    if (rank < RARITY_RANK.Transcendent) return 0;
    if (rank >= RARITY_RANK.Impossible) return 5;
    if (rank >= RARITY_RANK.Ethereal) return 4;
    if (rank >= RARITY_RANK.Transcendent) return 3;
    if (rank >= RARITY_RANK.Legendary) return 2;
    return 1;
  }

  function auraRevealPrelude(tier) {
    return {
      Rare: 'NONSTANDARD SIGNAL DETECTED',
      Epic: 'FREQUENCY AMPLITUDE SPIKE',
      Legendary: 'LEGENDARY RESONANCE CONFIRMED',
      Mythic: 'MYTHIC SIGNATURE BREAKING CONTAINMENT',
      Transcendent: 'TRANSCENDENT FREQUENCY HAS CROSSED OVER',
      Celestial: 'CELESTIAL ARRAY ALIGNMENT COMPLETE',
      Ethereal: 'ETHEREAL REALITY LAYER UNSEALED',
      Abyssal: 'ABYSSAL SIGNAL EMERGING FROM THE VOID',
      Impossible: 'IMPOSSIBLE PROBABILITY EVENT IN PROGRESS',
      Singularity: 'SINGULARITY // ALL PROBABILITY HAS COLLAPSED'
    }[tier] || 'ANOMALOUS FREQUENCY DETECTED';
  }

  function clearAuraRevealAudio() {
    for (const timer of runtime.rng.revealAudioTimers) clearTimeout(timer);
    runtime.rng.revealAudioTimers = [];
  }

  function finishAuraRevealCutscene() {
    if (!runtime.rng.revealResolve) return;
    clearTimeout(runtime.rng.revealTimer);
    runtime.rng.revealTimer = null;
    clearAuraRevealAudio();
    const resolve = runtime.rng.revealResolve;
    runtime.rng.revealResolve = null;
    ui.auraRevealCutscene.classList.add('closing');
    ui.auraRevealCutscene.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('aura-reveal-active');
    setTimeout(() => {
      if (!runtime.rng.revealResolve) ui.auraRevealCutscene.className = 'aura-reveal-cutscene';
    }, 240);
    resolve();
  }

  function playAuraRevealSound(rank) {
    clearAuraRevealAudio();
    const noteCount = clamp(2 + Math.floor(rank / 2), 3, 8);
    const baseFrequency = 190 + rank * 24;
    if (rank >= RARITY_RANK.Transcendent) audio.tone(48 + rank * 5, 1.15, 'sine', 0.055, 55);
    for (let index = 0; index < noteCount; index++) {
      const timer = setTimeout(() => {
        const frequency = baseFrequency * Math.pow(1.22, index);
        const type = rank >= RARITY_RANK.Impossible && index % 3 === 0 ? 'sawtooth' : index % 2 ? 'triangle' : 'sine';
        audio.tone(frequency, 0.2 + rank * 0.018, type, Math.min(0.075, 0.035 + rank * 0.003), 90 + rank * 15);
      }, index * Math.max(70, 150 - rank * 7));
      runtime.rng.revealAudioTimers.push(timer);
    }
    if (rank >= RARITY_RANK.Ethereal) {
      const impact = setTimeout(() => {
        audio.tone(820 + rank * 35, 0.5, 'sine', 0.065, 520);
        audio.tone(92 + rank * 4, 0.65, 'triangle', 0.05, -25);
      }, 620);
      runtime.rng.revealAudioTimers.push(impact);
    }
  }

  function playAuraRevealCutscene(aura, rolledChance, isNew) {
    const rank = RARITY_RANK[aura.tier] || 0;
    const intensity = auraRevealIntensity(rank);
    if (!intensity) return Promise.resolve();
    if (runtime.rng.revealResolve) finishAuraRevealCutscene();

    const duration = 6250 + (rank - RARITY_RANK.Rare) * 190;
    const secondary = rank >= RARITY_RANK.Abyssal ? '#ff4f8b' : rank >= RARITY_RANK.Transcendent ? '#d2ff53' : '#65ddff';
    ui.auraRevealCutscene.style.setProperty('--reveal-color', aura.color);
    ui.auraRevealCutscene.style.setProperty('--reveal-secondary', secondary);
    const power = (rank + 1) / (RARITY_RANK.Singularity + 1);
    ui.auraRevealCutscene.style.setProperty('--reveal-power', power.toFixed(3));
    ui.auraRevealCutscene.style.setProperty('--reveal-space-opacity', (0.12 + power * 0.42).toFixed(3));
    ui.auraRevealCutscene.style.setProperty('--reveal-scan-opacity', (0.08 + power * 0.28).toFixed(3));
    ui.auraRevealCutscene.style.setProperty('--reveal-beam-opacity', (0.16 + power * 0.55).toFixed(3));
    ui.auraRevealCutscene.style.setProperty('--reveal-beam-blur', `${(5 - power * 3).toFixed(2)}px`);
    ui.auraRevealCutscene.style.setProperty('--reveal-fragment-width', `${Math.round(12 + power * 30)}px`);
    ui.auraRevealCutscene.style.setProperty('--reveal-fragment-opacity', (0.18 + power * 0.72).toFixed(3));
    ui.auraRevealCutscene.style.setProperty('--reveal-icon-glow', `${Math.round(24 + power * 75)}px`);
    ui.auraRevealCutscene.style.setProperty('--reveal-title-glow', `${Math.round(6 + power * 25)}px`);
    ui.auraRevealCutscene.className = `aura-reveal-cutscene active intensity-${intensity} reveal-rank-${rank}`;
    ui.auraRevealCutscene.setAttribute('aria-hidden', 'false');
    ui.auraRevealPrelude.textContent = auraRevealPrelude(aura.tier);
    ui.auraRevealIcon.innerHTML = fontAwesomeIcon(auraIconName(aura));
    ui.auraRevealTier.textContent = `${aura.tier.toUpperCase()} AURA`;
    ui.auraRevealName.textContent = aura.name.toUpperCase();
    ui.auraRevealEffect.textContent = aura.text;
    ui.auraRevealOdds.textContent = `${formatAuraChance(rolledChance)} // ${formatAuraOneIn(rolledChance)}`;
    ui.auraRevealDiscovery.textContent = isNew ? 'NEW FREQUENCY DISCOVERED' : 'KNOWN FREQUENCY RESONANCE';
    document.body.classList.add('aura-reveal-active');
    playAuraRevealSound(rank);
    requestAnimationFrame(() => ui.auraRevealSkip.focus({ preventScroll: true }));

    return new Promise(resolve => {
      runtime.rng.revealResolve = resolve;
      runtime.rng.revealTimer = setTimeout(finishAuraRevealCutscene, duration);
    });
  }

  function rollAura() {
    audio.ensure();
    ensureModifiers();
    if (runtime.rng.scanning) return;
    const scanCost = mods.auraScanCost;
    if (state.rng.charge < scanCost) {
      toast('Scanner undercharged', passiveRngChargeRate() ? 'The Entropy Battery is recharging the capacitor.' : 'Manual presses refill the capacitor.');
      return;
    }
    state.rng.charge -= scanCost;
    state.rng.scans++;
    addLifetimeStat('auraScans', 1);
    state.rng.pity++;
    runtime.rng.scanning = true;
    ui.rollAuraButton.disabled = true;
    ui.scannerVisual.classList.remove('scan-complete');
    ui.scannerVisual.classList.add('is-scanning');
    ui.scannerVisual.dataset.scanStage = 'sweep';
    ui.scannerAura.classList.add('scanning');
    ui.scannerAura.innerHTML = `<span>${fontAwesomeIcon('fa-satellite-dish', 'fa-beat-fade')}</span><strong>SCANNING</strong><small>SWEEPING FREQUENCIES</small>`;
    [
      [210, 'lock', 'ISOLATING SIGNAL'],
      [470, 'decode', 'DECODING SIGNATURE'],
      [690, 'verify', 'VERIFYING RARITY']
    ].forEach(([delayMs, stage, label]) => setTimeout(() => {
      if (!runtime.rng.scanning) return;
      ui.scannerVisual.dataset.scanStage = stage;
      const status = $('small', ui.scannerAura);
      if (status) status.textContent = label;
    }, delayMs));
    audio.tone(180, 0.65, 'sine', 0.04, 900);
    setTimeout(async () => {
      const odds = calculateAuraOdds(state.rng.scans, state.rng.pity);
      let roll = Math.random() * 100;
      const available = AURAS.filter(item => odds.probabilities[item.id] > 0);
      const aura = available.find(item => (roll -= odds.probabilities[item.id]) <= 0) || available.at(-1);
      const rolledChance = odds.probabilities[aura.id];
      const isNew = !state.rng.discovered[aura.id];
      state.rng.discovered[aura.id] = safeInt(state.rng.discovered[aura.id]) + 1;
      state.rng.recent.push(RARITY_RANK[aura.tier]);
      state.rng.recent = state.rng.recent.slice(-12);
      if (RARITY_RANK[aura.tier] >= RARITY_RANK.Rare) state.rng.pity = 0;
      let duplicateNotice = null;
      if (isNew) {
        addCrystals(Math.max(1, RARITY_RANK[aura.tier]));
        logEvent('New frequency discovered', `${aura.name} • ${aura.tier} • ${aura.text}`, RARITY_RANK[aura.tier] >= 4 ? 'rare' : 'gold');
      } else {
        const refund = Math.max(1, RARITY_RANK[aura.tier]);
        const crystalReward = addCrystals(refund);
        duplicateNotice = `${aura.name} became ${formatCrystalAmount(crystalReward)} crystal${crystalReward === 1 ? '' : 's'}.`;
      }
      ui.scannerAura.classList.remove('scanning');
      ui.scannerVisual.classList.remove('is-scanning');
      delete ui.scannerVisual.dataset.scanStage;
      markDirty();
      await playAuraRevealCutscene(aura, rolledChance, isNew);
      ui.scannerVisual.classList.add('scan-complete');
      runtime.rng.scanning = false;
      ui.scannerAura.style.setProperty('--aura-color', aura.color);
      ui.scannerAura.innerHTML = `
        <span style="color:${aura.color};border-color:${aura.color};box-shadow:0 0 32px ${aura.color}33">${fontAwesomeIcon(auraIconName(aura))}</span>
        <strong>${aura.name.toUpperCase()}</strong>
        <small class="scanner-result-meta" style="color:${aura.color}">
          <b>${aura.tier.toUpperCase()}</b>
          <em>${formatAuraChance(rolledChance)} ROLL CHANCE</em>
        </small>`;
      setTimeout(() => ui.scannerVisual.classList.remove('scan-complete'), 900);
      if (duplicateNotice) toast('Duplicate converted', duplicateNotice);
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

  function glitchedGoldenOneIn() {
    return state.newGamePlus.active ? NG_PLUS_GLITCHED_GOLDEN_ONE_IN : GLITCHED_GOLDEN_ONE_IN;
  }

  function spawnGolden({ rush = false, duration = 15000 } = {}) {
    if (document.hidden || state.ascension.inLimbo) return null;
    const glitched = Math.random() < 1 / glitchedGoldenOneIn();
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
    addLifetimeStat('goldenSignals', 1);
    const baseReward = Math.max(250, currentBps * 180 + currentClickPower * 60);
    const reward = baseReward * mods.goldenReward * (glitched ? 404 : 1);
    addButtons(reward);
    let surged = false;
    let rushTriggered = false;
    let crystalReward = 0;
    if (glitched) {
      const firstGlitchReward = !state.meta.glitchRewardSeen;
      state.totals.glitches++;
      addLifetimeStat('glitchedSignals', 1);
      crystalReward = addCrystals(33);
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
      crystalReward = addCrystals(3);
    }
    caughtElement.classList.add('leaving');
    setTimeout(() => caughtElement.remove(), 360);
    markDirty();
    if (glitched) {
      audio.play('fail');
      logEvent('UNEXPECTED ERROR [CODE 404]', `Reality corrupted for 33 seconds: ×3,333 production, ${formatNumber(reward)} buttons, ${formatCrystalAmount(crystalReward)} crystals, and Permanent +4,040%.`, 'rare');
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
            : `and ${formatCrystalAmount(crystalReward)} crystals`;
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
    if (state.newGamePlus.active) return false;
    if (target === 'buttons') return true;
    if (target === 'charge') return has(state.converter.upgrades, 'spectrumGate');
    return false;
  }

  function converterRecipeLock(target) {
    if (state.newGamePlus.active) return 'CORRUPTED BY NEW GAME+';
    if (target === 'charge') return 'REQUIRES SPECTRUM GATE';
    return '';
  }

  function converterUpgradeUnlocked(upgrade) {
    return !upgrade?.requires || has(state.converter.upgrades, upgrade.requires);
  }

  function converterUpgradeLevel(upgrade) {
    if (!upgrade?.repeatable) return has(state.converter.upgrades, upgrade?.id) ? 1 : 0;
    return clamp(safeInt(state.converter.levels?.[upgrade.id]), 0, upgrade.max);
  }

  function converterUpgradeCost(upgrade, level = converterUpgradeLevel(upgrade)) {
    if (!upgrade?.repeatable) return upgrade?.cost || 0;
    if (level >= upgrade.max) return Number.POSITIVE_INFINITY;
    const tripleGrowthSteps = Math.min(level, 3);
    const gentleGrowthSteps = Math.max(0, level - 3);
    return Math.ceil(upgrade.cost * Math.pow(3, tripleGrowthSteps) * Math.pow(1.2, gentleGrowthSteps));
  }

  function converterRecursiveYieldMultiplier(upgrade, level) {
    if (!upgrade || level <= 0) return 1;
    return Math.min(
      Number.MAX_VALUE,
      Math.pow(upgrade.effect.value, Math.pow(upgrade.effect.exponent, level - 1))
    );
  }

  function converterCancelRefundRate() {
    return CONVERTER_UPGRADES.reduce((rate, upgrade) => {
      if (
        upgrade.effect?.kind !== 'converterRefund' ||
        !has(state.converter.upgrades, upgrade.id)
      ) return rate;
      return Math.max(rate, upgrade.effect.value);
    }, 0.2);
  }

  function converterUpgradeIconName(upgrade) {
    if (upgrade.effect?.kind === 'converterSpeed') return 'fa-gauge-high';
    if (upgrade.effect?.kind === 'converterYield' || upgrade.effect?.kind === 'converterRecursiveYield') return 'fa-coins';
    if (upgrade.effect?.kind === 'converterEfficiency') return 'fa-scale-balanced';
    if (upgrade.effect?.kind === 'converterRefund') return 'fa-hand-holding-dollar';
    if (upgrade.unlock) return 'fa-lock-open';
    return 'fa-screwdriver-wrench';
  }

  function scannerChargeFromCrystals(input, currentCharge) {
    return Math.max(0, Math.min(100 - finite(currentCharge), finite(input) / CRYSTALS_PER_SCANNER_CHARGE));
  }

  function converterBatchDuration(input, recipeMultiplier = 1, extraSeconds = 0) {
    const batchMagnitude = Math.log10(Math.max(1, finite(input)));
    const scaledBase = CONVERTER_BASE_DURATION_SECONDS
      * Math.pow(CONVERTER_BATCH_TIME_GROWTH, batchMagnitude)
      * Math.max(1, finite(recipeMultiplier, 1));
    return (scaledBase + Math.max(0, finite(extraSeconds))) / Math.max(1, mods.converterSpeed);
  }

  function converterPreview(target = state.converter.target, inputValue = state.converter.input) {
    ensureModifiers();
    const input = normalizeConverterInput(inputValue, 1);
    const effectiveInput = input * mods.converterEfficiency;
    if (target === 'charge') {
      const output = scannerChargeFromCrystals(input, state.rng.charge);
      return { input, output, duration: converterBatchDuration(input), unit: 'SCANNER CHARGE' };
    }
    const basePerCrystal = 50;
    const output = effectiveInput * basePerCrystal * mods.converterYield * mods.converterButtonYield;
    return { input, output, duration: converterBatchDuration(input), unit: 'BUTTONS' };
  }

  function converterOutputLabel(target, output) {
    if (target === 'charge') return `${formatPreciseAmount(output, CONVERTER_INPUT_DECIMALS + 2)} CHARGE`;
    return `${formatPreciseAmount(output)} BUTTONS`;
  }

  function buildConverterUi() {
    if (!ui.converterRecipeList || ui.converterRecipeList.dataset.ready) return;
    ui.converterRecipeList.dataset.ready = 'true';
    ui.converterRecipeList.innerHTML = CONVERTER_RECIPES.map(recipe => `
      <button class="converter-recipe" type="button" data-converter-target="${recipe.id}">
        <span>${fontAwesomeIcon(recipe.id === 'buttons' ? 'fa-coins' : 'fa-bolt')}</span>
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
        <span>${fontAwesomeIcon(converterUpgradeIconName(upgrade))}</span>
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
    updateConverterNav(now);
    buildConverterUi();
    ensureModifiers();
    const converterDisabled = state.newGamePlus.active;
    const active = state.converter.active;
    ui.converterJobs.textContent = formatNumber(state.totals.converterJobs, 0);
    ui.converterSpent.textContent = formatCrystalAmount(state.totals.convertedCrystals);
    ui.converterCrystalBalance.textContent = formatCrystalAmount(state.resources.crystals);
    ui.converterYield.textContent = `×${formatNumber(mods.converterYield * mods.converterButtonYield, 2)}`;
    ui.converterSpeed.textContent = `×${formatNumber(mods.converterSpeed, 2)}`;
    ui.converterEfficiency.textContent = `×${formatNumber(mods.converterEfficiency, 2)}`;
    if (document.activeElement !== ui.converterInput) ui.converterInput.value = state.converter.input;
    ui.converterInput.disabled = converterDisabled || Boolean(active);
    $$('[data-converter-input]').forEach(button => { button.disabled = converterDisabled || Boolean(active); });

    if (converterDisabled) {
      for (const refs of Object.values(converterRecipeRefs)) {
        refs.card.classList.remove('selected');
        refs.card.classList.add('locked');
        refs.card.disabled = true;
        refs.status.textContent = 'CORRUPTED BY NEW GAME+';
        refs.output.textContent = 'ERR_NULL';
      }
      for (const refs of Object.values(converterUpgradeRefs)) {
        refs.card.classList.remove('affordable', 'needs-crystals', 'prerequisite-locked');
        refs.card.classList.add('corrupted');
        refs.state.textContent = 'MEMORY UNAVAILABLE';
        refs.button.disabled = true;
        refs.button.textContent = 'ERR_404';
      }
      ui.converterStatus.textContent = 'MEMORY FAULT // NG+';
      ui.converterProgressFill.style.width = '100%';
      ui.converterProgressText.textContent = 'SUBSYSTEM UNMOUNTED';
      ui.converterActiveTarget.textContent = 'ERR_NO_RECIPE';
      ui.converterActiveOutput.textContent = '0 / 0 / 0';
      ui.converterStartButton.disabled = true;
      ui.converterStartButton.textContent = 'CONVERTER CORRUPTED';
      ui.converterCancelButton.disabled = true;
      ui.converterCancelButton.textContent = 'CANCEL UNAVAILABLE';
      return;
    }

    const selectedPreview = converterPreview(state.converter.target, state.converter.input);

    for (const recipe of CONVERTER_RECIPES) {
      const refs = converterRecipeRefs[recipe.id];
      if (!refs) continue;
      const unlocked = converterRecipeUnlocked(recipe.id);
      const preview = converterPreview(recipe.id, state.converter.input);
      refs.card.classList.toggle('selected', state.converter.target === recipe.id);
      refs.card.classList.toggle('locked', !unlocked);
      refs.card.disabled = !unlocked || Boolean(active);
      refs.status.textContent = unlocked
        ? `${formatDuration(preview.duration)} CYCLE`
        : converterRecipeLock(recipe.id);
      refs.output.textContent = unlocked ? converterOutputLabel(recipe.id, preview.output) : 'LOCKED';
    }

    for (const upgrade of CONVERTER_UPGRADES) {
      const refs = converterUpgradeRefs[upgrade.id];
      if (!refs) continue;
      const level = converterUpgradeLevel(upgrade);
      const maxed = level >= (upgrade.max || 1);
      const owned = upgrade.repeatable ? maxed : has(state.converter.upgrades, upgrade.id);
      const unlocked = converterUpgradeUnlocked(upgrade);
      const cost = converterUpgradeCost(upgrade, level);
      const affordable = unlocked && !maxed && state.resources.crystals >= cost;
      const requirement = CONVERTER_UPGRADES.find(item => item.id === upgrade.requires);
      const recursiveYieldState = upgrade.effect?.kind === 'converterRecursiveYield'
        ? level > 0
          ? ` • BUTTONS ×${formatNumber(converterRecursiveYieldMultiplier(upgrade, level), 2)}`
          : ` • NEXT ×${formatNumber(upgrade.effect.value, 2)}`
        : '';
      refs.card.classList.toggle('owned', owned);
      refs.card.classList.remove('corrupted');
      refs.card.classList.toggle('prerequisite-locked', !maxed && !unlocked);
      refs.card.classList.toggle('affordable', affordable);
      refs.card.classList.toggle('needs-crystals', !maxed && unlocked && !affordable);
      refs.state.textContent = maxed
        ? upgrade.repeatable ? `MAX LEVEL ${formatNumber(upgrade.max, 0)}${recursiveYieldState}` : 'INSTALLED'
        : !unlocked
          ? `REQUIRES ${requirement?.name?.toUpperCase() || 'PREVIOUS UPGRADE'}`
          : upgrade.repeatable
            ? `LEVEL ${formatNumber(level, 0)} / ${formatNumber(upgrade.max, 0)}${recursiveYieldState}`
          : affordable
            ? 'BUY NOW'
            : 'NEED CRYSTALS';
      refs.button.disabled = maxed || !unlocked || !affordable;
      refs.button.textContent = maxed
        ? upgrade.repeatable ? 'MAXED' : 'INSTALLED'
        : !unlocked
          ? 'LOCKED'
          : `${formatCrystalAmount(cost)} ◆`;
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
      ui.converterCancelButton.textContent = `CANCEL // REFUND ${Math.round(converterCancelRefundRate() * 100)}%`;
    } else {
      const unlocked = converterRecipeUnlocked(state.converter.target);
      const affordable = state.resources.crystals + CONVERTER_INPUT_EPSILON >= state.converter.input;
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
          ? 'OUTPUT STORAGE FULL'
          : !affordable
            ? 'NEED MORE CRYSTALS'
            : `START WITH ${formatCrystalAmount(state.converter.input)} ◆`;
      ui.converterCancelButton.disabled = true;
      ui.converterCancelButton.textContent = 'CANCEL ACTIVE JOB';
    }
  }

  function setConverterInput(value) {
    if (state.newGamePlus.active) return;
    state.converter.input = normalizeConverterInput(value, state.converter.input);
    ui.converterInput.value = state.converter.input;
    savePending = true;
    updateConverterUi();
  }

  function startConverterJob() {
    if (state.newGamePlus.active) return;
    if (state.converter.active || !converterRecipeUnlocked(state.converter.target)) return;
    const input = normalizeConverterInput(ui.converterInput.value, state.converter.input);
    state.converter.input = input;
    ui.converterInput.value = input;
    const preview = converterPreview(state.converter.target, input);
    if (preview.output <= 0) {
      toast('Converter cannot start', 'The selected output storage is already full.');
      return;
    }
    if (state.resources.crystals + CONVERTER_INPUT_EPSILON < input) {
      toast('Insufficient crystals', `${formatCrystalAmount(input - state.resources.crystals)} more required.`);
      return;
    }
    state.resources.crystals = Math.max(0, state.resources.crystals - input);
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
    logEvent('Crystal mining started', `${formatCrystalAmount(input)} crystals are being refined into ${converterOutputLabel(state.converter.target, preview.output)}.`, 'good');
    updateConverterUi(startedAt);
  }

  function completeConverterJob() {
    if (state.newGamePlus.active) return;
    const job = state.converter.active;
    if (!job) return;
    state.converter.active = null;
    if (job.target === 'charge' && !has(state.converter.upgrades, 'spectrumGate')) {
      state.resources.crystals += job.input;
      markDirty();
      logEvent('Charge conversion canceled', 'Spectrum Gate is required. The crystal batch was returned.', '');
      toast('Spectrum Gate required', 'Your crystals were returned.');
      updateConverterUi();
      return;
    }
    if (job.target === 'charge') {
      job.output = scannerChargeFromCrystals(job.input, state.rng.charge);
      state.rng.charge = clamp(state.rng.charge + job.output, 0, 100);
      addLifetimeStat('chargeConverted', job.output);
    }
    else addButtons(job.output);
    state.totals.converterJobs++;
    state.totals.convertedCrystals += job.input;
    addLifetimeStat('converterCycles', 1);
    addLifetimeStat('crystalsProcessed', job.input);
    addLifetimeStat('crystalsSpent', job.input);
    markDirty();
    audio.play('reward');
    const result = converterOutputLabel(job.target, job.output);
    logEvent('Crystal conversion complete', `${result} recovered from ${formatCrystalAmount(job.input)} crystals.`, 'gold');
    toast('Mining cycle complete', `+${result}`, 'gold');
    updateConverterUi();
  }

  function updateConverter(now) {
    if (state.newGamePlus.active) return;
    if (state.converter.active && now >= state.converter.active.endsAt) completeConverterJob();
  }

  function updateConverterNav(now = Date.now()) {
    if (!ui.converterNav) return;
    const active = !state.newGamePlus.active && state.converter.active;
    ui.converterNav.classList.toggle('conversion-active', Boolean(active));
    if (!active) {
      ui.converterNav.style.removeProperty('--converter-progress');
      const label = state.newGamePlus.active ? 'Corrupted Converter' : 'Crystal Converter';
      if (ui.converterNav.getAttribute('aria-label') !== label) ui.converterNav.setAttribute('aria-label', label);
      return;
    }
    const duration = Math.max(1, active.endsAt - active.startedAt);
    const progress = clamp((now - active.startedAt) / duration, 0, 1);
    const percent = progress * 100;
    ui.converterNav.style.setProperty('--converter-progress', `${percent.toFixed(3)}%`);
    const label = 'Crystal Converter, conversion in progress';
    if (ui.converterNav.getAttribute('aria-label') !== label) ui.converterNav.setAttribute('aria-label', label);
  }

  function cancelConverterJob() {
    if (state.newGamePlus.active) return;
    const job = state.converter.active;
    if (!job) return;
    const refundRate = converterCancelRefundRate();
    const refund = job.input * refundRate;
    const consumed = job.input - refund;
    state.resources.crystals += refund;
    addLifetimeStat('crystalsSpent', consumed);
    state.converter.active = null;
    markDirty();
    logEvent(
      'Mining cycle canceled',
      `${formatCrystalAmount(refund)} of ${formatCrystalAmount(job.input)} crystals recovered at ${Math.round(refundRate * 100)}% efficiency.`,
      ''
    );
    toast('Mining cycle canceled', `${formatCrystalAmount(refund)} Crystals refunded (${Math.round(refundRate * 100)}%).`);
    updateConverterUi();
  }

  function buyConverterUpgrade(id) {
    if (state.newGamePlus.active) return;
    const upgrade = CONVERTER_UPGRADES.find(item => item.id === id);
    if (!upgrade) return;
    const level = converterUpgradeLevel(upgrade);
    const maxed = level >= (upgrade.max || 1);
    if (maxed) return;
    if (!converterUpgradeUnlocked(upgrade)) {
      const requirement = CONVERTER_UPGRADES.find(item => item.id === upgrade.requires);
      toast('Upgrade chain locked', `Install ${requirement?.name || 'the previous Recovery Valve'} first.`);
      audio.play('fail');
      return;
    }
    const cost = converterUpgradeCost(upgrade, level);
    if (state.resources.crystals < cost) return;
    state.resources.crystals -= cost;
    addLifetimeStat('crystalsSpent', cost);
    if (upgrade.repeatable) state.converter.levels[id] = level + 1;
    else state.converter.upgrades.push(id);
    addLifetimeStat('converterUpgradePurchases', 1);
    markDirty();
    audio.play('buy');
    const levelLabel = upgrade.repeatable ? ` // LEVEL ${formatNumber(level + 1, 0)}` : '';
    logEvent('Converter upgrade installed', `${upgrade.name}${levelLabel} // ${upgrade.detail}`, 'gold');
    toast('Converter upgraded', `${upgrade.name}${levelLabel}`, 'gold');
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
    addCrystals(5);
    markDirty();
    audio.play('golden');
    logEvent('Restricted signal recovered', `${secret.name} • Critical chance +2.5%`, 'rare');
    showReward(secret.name, '+2.5% CRITICAL', 'A secret route toward the 75% critical cap is now permanently active.');
  }

  function ascensionPotential() {
    return Math.floor(Math.sqrt(state.totals.runButtons / ASCENSION_THRESHOLD));
  }

  function completeAscension(gain) {
    failNeverClickChallenge();
    if (state.converter.active) {
      state.resources.crystals += state.converter.active.input;
      state.converter.active = null;
    }
    state.resources.cores += gain;
    state.totals.ascensions++;
    addLifetimeStat('coresEarned', gain);
    addLifetimeStat('ascensions', 1);
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
    logEvent('Reactor memory recovered', `${formatCoreAmount(gain)} Heavenly Core${gain === 1 ? '' : 's'} transferred. Choose permanent circuitry before the next boot.`, 'rare');
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
    ui.cutsceneStatus.textContent = `${formatCoreAmount(gain)} CORE${gain === 1 ? '' : 'S'} RECOVERED // CIRCUIT ACCESS GRANTED`;
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
    ui.ascensionConfirmGain.textContent = formatCoreAmount(gain);
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
    const enteringNewGamePlus = state.newGamePlus.pending && !state.newGamePlus.active && !state.newGamePlus.completed;
    if (enteringNewGamePlus) enterNewGamePlus();
    ensureModifiers();
    state.ascension.inLimbo = false;
    state.resources.buttons = mods.startButtons;
    state.totals.runButtons = mods.startButtons;
    scheduleGolden();
    markDirty();
    saveNow();
    logEvent(
      enteringNewGamePlus ? 'NEW GAME+ ONLINE' : 'New cycle online',
      enteringNewGamePlus
        ? 'The second iteration begins at zero. Achievement and aura bonuses are suppressed until Absolute Ascendancy is rebuilt.'
        : 'Permanent Heavenly Circuit upgrades restored successfully.',
      enteringNewGamePlus ? 'rare' : 'good'
    );
    showPage('core');
    renderAll();
  }

  async function beginNewCycle() {
    if (!state.ascension.inLimbo || runtime.ascension.playing) return;
    const enteringNewGamePlus = state.newGamePlus.pending && !state.newGamePlus.active && !state.newGamePlus.completed;
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
    ui.rebootStatus.textContent = enteringNewGamePlus
      ? 'MEMORY ERASED // BOOTING SECOND ITERATION FROM ZERO'
      : 'PERMANENT CIRCUIT VERIFIED // STARTING NEW CYCLE';
    audio.play('reboot');
    await delay(1700);
    overlay.className = 'ascension-cutscene active complete';
    await delay(450);
    overlay.className = 'ascension-cutscene';
    overlay.setAttribute('aria-hidden', 'true');
    audio.endCutscene();
    audio.play('reward');
    runtime.ascension.playing = false;
    setTimeout(offerFirstRunTutorial, 650);
  }

  function enterNewGamePlus() {
    snapshotAchievementProgress();
    const retainedLifetime = { ...state.lifetime };
    const retainedAuras = { ...state.rng.discovered };
    const retainedAura = state.rng.equipped;
    const fresh = createFreshState();

    state.resources = { ...fresh.resources };
    state.totals = { ...fresh.totals };
    state.lifetime = retainedLifetime;
    state.towers = { ...fresh.towers };
    state.upgrades = [];
    state.rng = {
      ...fresh.rng,
      discovered: retainedAuras,
      equipped: retainedAura && retainedAuras[retainedAura] ? retainedAura : null
    };
    state.minigames = { ...fresh.minigames };
    state.golden = { ...fresh.golden };
    state.converter = { ...fresh.converter };
    state.unlocks = { ...fresh.unlocks };
    state.jukebox = { ...fresh.jukebox };
    state.buffs = [];
    state.secrets = { ...fresh.secrets };
    state.ascension.nodes = { ...fresh.ascension.nodes };
    state.ascension.spentCores = 0;
    state.newGamePlus.unlocked = true;
    state.newGamePlus.pending = false;
    state.newGamePlus.active = true;
    state.newGamePlus.completed = false;
    state.challenges.trueNeverClick.ngPlusEligible =
      !state.challenges.trueNeverClick.ngPlusAchieved &&
      !has(state.achievements.claimed, 'ngTrueNeverClick');
    combo = 0;
    for (const golden of goldenElements) golden.remove();
    goldenElements.clear();
    runtime.goldenRush.active = false;
    runtime.goldenRush.nextSpawnAt = 0;
    if (ui.musicPlayerDialog.open) ui.musicPlayerDialog.close();
    renderMusicPlayer();
    markDirty();
    applyAuraScreenEffect();
  }

  function completeNewGamePlus() {
    if (!state.newGamePlus.active) return;
    snapshotAchievementProgress();
    if (!state.challenges.trueNeverClick.ngPlusAchieved) {
      state.challenges.trueNeverClick.ngPlusEligible = false;
    }
    state.newGamePlus.active = false;
    state.newGamePlus.completed = true;
    state.newGamePlus.pending = false;
    state.newGamePlus.completions = Math.max(1, state.newGamePlus.completions + 1);
    addLifetimeStat('newGamePlusCompletions', 1);
    markDirty();
    const claimedOnReturn = autoClaimAchievements({ announce: false });
    const finalAchievement = ACHIEVEMENTS.find(item => item.id === NG_PLUS_ACHIEVEMENT_ID);
    if (finalAchievement && claimedOnReturn.some(item => item.id === NG_PLUS_ACHIEVEMENT_ID)) {
      showReward(
        finalAchievement.name,
        rewardLabel(finalAchievement.reward),
        rewardDescription(finalAchievement.reward)
      );
    }
    updateNewGamePlusUi();
    renderAchievements();
    updateConverterUi();
    renderCoreTree();
    updateAscensionUi();
    saveNow();
    logEvent('REALITY RESTORED', 'The second Absolute Ascendancy restored achievement and aura bonuses. Production ×1,000 and RNG luck ×100 are permanently active.', 'rare');
  }

  function coreNodeCost(node, level = state.ascension.nodes[node.id]) {
    return Math.ceil(node.baseCost * Math.pow(node.costGrowth ?? CORE_COST_GROWTH, level));
  }

  function coreNodeUnlocked(node) {
    if ((state.ascension.nodes[node.id] || 0) > 0) return true;
    if (node.requiresAllMax) {
      return CORE_NODES.every(candidate => candidate.id === node.id || state.ascension.nodes[candidate.id] >= candidate.max);
    }
    return Object.entries(node.requires || {}).every(([id, level]) => state.ascension.nodes[id] >= level);
  }

  function buyCoreNode(id) {
    const node = CORE_NODE_BY_ID.get(id);
    if (!node) return;
    const level = state.ascension.nodes[id];
    const cost = coreNodeCost(node, level);
    if (!coreNodeUnlocked(node) || level >= node.max || state.resources.cores < cost) return;
    state.resources.cores -= cost;
    state.ascension.spentCores += cost;
    addLifetimeStat('coresSpent', cost);
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
    if (id === 'absoluteAscendancy') {
      if (state.newGamePlus.active) {
        completeNewGamePlus();
        return;
      }
      if (!state.newGamePlus.completed) {
        state.newGamePlus.unlocked = true;
        state.newGamePlus.pending = true;
        markDirty();
      }
      logEvent('ABSOLUTE ASCENDANCY ACHIEVED', 'Every Heavenly branch is complete. Final RNG, crystal, and scanner protocols are now active.', 'rare');
      showReward(
        'Absolute Ascendancy',
        'NEW GAME+ ARMED',
        'The Heavenly tree is complete. Begin the next cycle to enter a second iteration from zero, retain your collections without their bonuses, and rebuild Absolute Ascendancy one final time.'
      );
    }
  }

  function saveNow() {
    if (saveWritesSuspended) return false;
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
      const serialized = JSON.stringify(imported);
      const previous = localStorage.getItem(SAVE_KEY);
      saveWritesSuspended = true;
      savePending = false;
      if (previous) localStorage.setItem(BACKUP_KEY, previous);
      localStorage.setItem(SAVE_KEY, serialized);
      if (localStorage.getItem(SAVE_KEY) !== serialized) throw new Error('Imported save could not be verified.');
      location.reload();
    } catch (error) {
      saveWritesSuspended = false;
      console.error('Save import failed.', error);
      toast('Import rejected', 'That save is incomplete or not valid.');
    }
  }

  function resetSave() {
    if (!ui.wipeSaveDialog.open) ui.wipeSaveDialog.showModal();
  }

  function confirmResetSave() {
    saveWritesSuspended = true;
    savePending = false;
    ui.wipeSaveDialog.close('confirm');
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(BACKUP_KEY);
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
      location.reload();
    } catch (error) {
      saveWritesSuspended = false;
      console.error('Save wipe failed.', error);
      toast('Wipe failed', 'Browser storage could not be cleared. Your save is still intact.');
    }
  }

  function grantOfflineProgress() {
    const now = Date.now();
    const rawElapsed = Math.max(0, (now - finite(state.meta.lastSave, now)) / 1000);
    const elapsed = clamp(rawElapsed, 0, MAX_OFFLINE_SECONDS);
    if (elapsed < 30 || state.ascension.inLimbo) return null;
    ensureModifiers();
    const offlineRate = currentBps * mods.offline;
    const gain = offlineRate * elapsed;
    state.meta.lastSave = now;
    if (gain <= 0) return null;
    addButtons(gain);
    savePending = true;
    logEvent('Offline capacitor discharged', `${formatNumber(gain)} buttons recovered from ${formatDuration(elapsed)} away at ${Math.round(mods.offline * 100)}% efficiency.`, 'good');
    return {
      elapsed,
      gain,
      networkRate: currentBps,
      offlineRate,
      efficiency: mods.offline,
      capped: rawElapsed > MAX_OFFLINE_SECONDS
    };
  }

  function showOfflineReport(report) {
    if (!report || !ui.offlineDialog) return;
    ui.offlineGain.textContent = `+${formatNumber(report.gain)}`;
    ui.offlineFormula.textContent = `${formatNumber(report.networkRate)}/S × ${Math.round(report.efficiency * 100)}% efficiency`;
    ui.offlineDuration.textContent = formatDuration(report.elapsed);
    ui.offlineRate.textContent = `${formatNumber(report.offlineRate)}/S`;
    ui.offlineEfficiency.textContent = `${Math.round(report.efficiency * 100)}%`;
    ui.offlineCapNote.classList.toggle('hidden', !report.capped);
    if (ui.offlineDialog.open) ui.offlineDialog.close();
    ui.offlineDialog.showModal();
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
    if (id !== 'towers') hideTowerTooltip();
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

  function logEvent() {
    // The retired Signal Feed intentionally does no DOM work. Important events
    // already surface through focused notifications, keeping the hot path lean.
  }

  function toast(title, text, tone = '') {
    const item = document.createElement('div');
    item.className = `toast ${tone}`.trim();
    item.innerHTML = `<span>${fontAwesomeIcon(tone === 'gold' ? 'fa-star' : tone === 'rare' ? 'fa-burst' : 'fa-circle-info')}</span><div><strong>${title}</strong><p>${text}</p></div>`;
    ui.toastStack.appendChild(item);
    while (ui.toastStack.children.length > 4) ui.toastStack.firstElementChild.remove();
    const exitDuration = state.settings.motion === 'off' ? 0 : 260;
    const totalDuration = state.settings.fastNotes ? state.settings.fastNotesSeconds * 1000 : 3560;
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

  let resourceHudSignature = '';

  function updateResourceHud(force = false) {
    ensureModifiers();
    const liveBps = currentBps * activeBuffMultiplier();
    const values = {
      buttons: formatNumber(state.resources.buttons),
      bps: formatNumber(liveBps),
      crystals: formatCrystalAmount(state.resources.crystals),
      cores: formatCoreAmount(state.resources.cores),
      delta: liveBps > 0 ? `+${formatNumber(liveBps)}/S` : 'READY'
    };
    const signature = Object.values(values).join('|');
    if (!force && signature === resourceHudSignature) return;
    resourceHudSignature = signature;
    ui.buttons.textContent = values.buttons;
    ui.bps.textContent = values.bps;
    ui.crystals.textContent = values.crystals;
    ui.cores.textContent = values.cores;
    ui.buttonsDelta.textContent = values.delta;
  }

  function updateTopUi() {
    ensureModifiers();
    const buffMultiplier = activeBuffMultiplier();
    const liveBps = currentBps * buffMultiplier;
    combo = clamp(combo, 0, mods.comboLimit);
    const comboMultiplier = 1 + combo * 0.05;
    updateResourceHud();
    ui.pressValue.textContent = `+${formatNumber(currentClickPower * comboMultiplier)}`;
    ui.clickPower.textContent = formatNumber(currentClickPower);
    const networkPress = calculateBps() * mods.clickBpsSeconds;
    ui.clickBreakdown.textContent = networkPress > 0
      ? `Direct ${formatNumber(mods.clickBase * mods.clickMult * mods.global)} + ${mods.clickBpsSeconds.toFixed(2)}s network · crit ×${formatNumber(mods.critMult)} total`
      : `Base ${formatNumber(mods.clickBase)} × system ${formatNumber(mods.clickMult * mods.global)} · crit ×${formatNumber(mods.critMult)} total`;
    ui.comboValue.textContent = `×${comboMultiplier.toFixed(2)} · ${Math.floor(combo)}/${mods.comboLimit}`;
    ui.comboFill.style.width = `${combo / mods.comboLimit * 100}%`;

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
      ui.goldenEta.textContent = state.newGamePlus.active
        ? `1 / ${effectiveOneIn.toLocaleString('en-US')} EACH SECOND • ERR_404 1 / ${NG_PLUS_GLITCHED_GOLDEN_ONE_IN.toLocaleString('en-US')} PER SIGNAL`
        : `1 / ${effectiveOneIn.toLocaleString('en-US')} EACH SECOND`;
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
    const objectiveScope = state.newGamePlus.active ? 'ngplus' : 'default';
    const visible = achievementItemsForScope(objectiveScope)
      .filter(item => item.category !== 'secret');
    const next = state.newGamePlus.active
      ? visible.find(item => !achievementComplete(item)) || visible.at(-1)
      : visible.find(item => !has(state.achievements.claimed, item.id)) || visible.at(-1);
    if (!next) return;
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
    const ownedUpgrades = new Set(state.upgrades);
    $$('#upgradeCategories [data-upgrade-category]').forEach(button => {
      const active = upgradeCategories.has(button.dataset.upgradeCategory);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    let items = UPGRADES.filter(item => {
      if (!upgradeCategories.has('all') && !upgradeCategories.has(item.category)) return false;
      if (search && !`${item.name} ${item.desc} ${item.effectText}`.toLowerCase().includes(search)) return false;
      return true;
    });
    if ((ui.upgradeStatus?.value || 'affordable') === 'available') {
      items = sortAvailableUpgrades(items, ownedUpgrades);
    }

    delete ui.upgradesGrid.dataset.orderSignature;
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
    const status = ui.upgradeStatus?.value || 'affordable';
    const ownedUpgrades = new Set(state.upgrades);
    let visibleCount = 0;
    for (const item of UPGRADES) {
      const refs = upgradeRefs[item.id];
      if (!refs) continue;
      const owned = ownedUpgrades.has(item.id);
      const unlocked = upgradeUnlocked(item, ownedUpgrades);
      const affordable = state.resources.buttons >= item.cost;
      const metric = upgradeUnlockMetric(item, ownedUpgrades);
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
    reorderAvailableUpgradeCards(ownedUpgrades);
    ui.upgradesEmpty.classList.toggle('hidden', visibleCount > 0);
    ui.upgradeSummary.textContent = `${visibleCount} modification${visibleCount === 1 ? '' : 's'} shown • ${UPGRADES.length - state.upgrades.length} remaining`;
    const affordableCount = UPGRADES.filter(item => !ownedUpgrades.has(item.id) && upgradeUnlocked(item, ownedUpgrades) && state.resources.buttons >= item.cost).length;
    ui.buyAllUpgradesButton.disabled = affordableCount === 0;
    ui.buyAllUpgradesButton.title = affordableCount
      ? `Install all ${affordableCount} currently affordable upgrades, including any newly unlocked during purchase`
      : 'No affordable upgrades';
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

  function towerPurchaseProjection(tower, amount = selectedTowerAmount(tower)) {
    const count = state.towers[tower.id];
    const each = towerProductionEachAtCount(tower, count);
    const output = each * count;
    const purchaseAmount = safeInt(amount);
    const projectedCount = count + purchaseAmount;
    const projectedEach = towerProductionEachAtCount(tower, projectedCount);
    const projectedOutput = projectedEach * projectedCount;
    const gain = Math.max(0, projectedOutput - output);
    const cost = towerBulkCost(tower, purchaseAmount);
    const payback = gain > 0 && Number.isFinite(cost) ? cost / gain : Infinity;
    return { count, each, output, purchaseAmount, projectedCount, projectedEach, projectedOutput, gain, cost, payback };
  }

  function positionTowerTooltip(x = runtime.towerHover.x, y = runtime.towerHover.y) {
    if (!ui.towerTooltip || ui.towerTooltip.classList.contains('hidden')) return;
    if (ui.towerTooltip.parentElement !== document.body) document.body.appendChild(ui.towerTooltip);
    runtime.towerHover.x = x;
    runtime.towerHover.y = y;
    const gap = 11;
    const edge = 8;
    const rect = ui.towerTooltip.getBoundingClientRect();
    let left = x + gap;
    let top = y + 9;
    if (left + rect.width > window.innerWidth - edge) left = x - rect.width - gap;
    if (top + rect.height > window.innerHeight - edge) top = y - rect.height - gap;
    ui.towerTooltip.style.left = `${clamp(left, edge, Math.max(edge, window.innerWidth - rect.width - edge))}px`;
    ui.towerTooltip.style.top = `${clamp(top, edge, Math.max(edge, window.innerHeight - rect.height - edge))}px`;
  }

  function renderTowerTooltip(id = runtime.towerHover.id) {
    const tower = TOWER_BY_ID.get(id);
    if (!tower || !ui.towerTooltip) return;
    ensureModifiers();
    runtime.towerHover.id = id;
    const rank = TOWERS.indexOf(tower) + 1;
    const projection = towerPurchaseProjection(tower);
    const totalOutput = currentBps;
    const share = totalOutput > 0 ? projection.output / totalOutput * 100 : 0;
    const nextMastery = TOWER_MASTERY_THRESHOLDS.find(threshold => projection.count < threshold);
    const affordable = projection.purchaseAmount > 0 && state.resources.buttons >= projection.cost;
    const signature = [
      id,
      buyMode,
      projection.count,
      formatNumber(projection.each),
      formatNumber(projection.output),
      formatNumber(projection.cost),
      formatNumber(projection.gain),
      share.toFixed(3),
      formatNumber(state.resources.buttons),
      nextMastery || 'done'
    ].join('|');
    if (ui.towerTooltip.dataset.signature !== signature) {
      ui.towerTooltip.dataset.signature = signature;
      ui.towerTooltip.innerHTML = `
        <div class="tower-tooltip-head">
          <span>${fontAwesomeIcon(TOWER_FONT_ICONS[tower.id] || 'fa-building')}</span>
          <div><strong>${tower.name}</strong><small>NETWORK UNIT ${String(rank).padStart(2, '0')} / ${TOWERS.length}</small></div>
          <em class="tower-tooltip-state ${affordable ? '' : 'locked'}">${affordable ? 'AFFORDABLE' : 'INSUFFICIENT'}</em>
        </div>
        <p class="tower-tooltip-desc">${tower.desc}</p>
        <div class="tower-tooltip-grid">
          <div><span>OWNED</span><strong>${formatNumber(projection.count, 0)}</strong></div>
          <div><span>OUTPUT EACH</span><strong>${formatNumber(projection.each)}/s</strong></div>
          <div><span>TOTAL OUTPUT</span><strong>${formatNumber(projection.output)}/s</strong></div>
          <div><span>NETWORK SHARE</span><strong>${share.toFixed(2)}%</strong></div>
          <div><span>MASTERY MULTIPLIER</span><strong>×${formatNumber(masteryMultiplier(projection.count), 0)}</strong></div>
          <div><span>NEXT MASTERY</span><strong>${nextMastery ? `${formatNumber(nextMastery - projection.count, 0)} MORE` : 'COMPLETE'}</strong></div>
          <div><span>SELECTED PURCHASE</span><strong>+${formatNumber(projection.purchaseAmount, 0)}</strong></div>
          <div><span>PURCHASE COST</span><strong>${projection.purchaseAmount ? formatNumber(projection.cost) : 'UNAFFORDABLE'}</strong></div>
          <div class="positive"><span>PROJECTED GAIN</span><strong>+${formatNumber(projection.gain)}/s</strong></div>
          <div><span>PROJECTED TOTAL</span><strong>${formatNumber(projection.projectedOutput)}/s</strong></div>
          <div><span>EST. PAYBACK</span><strong>${Number.isFinite(projection.payback) ? formatDuration(projection.payback) : '—'}</strong></div>
          <div><span>NEXT UNIT</span><strong>${formatNumber(towerUnitCost(tower))}</strong></div>
        </div>
        <div class="tower-tooltip-formula">
          <span>BASE <b>${formatNumber(tower.baseProd)}/s</b></span>
          <span>UNIT <b>×${formatNumber(mods.towerMult[tower.id], 2)}</b></span>
          <span>MASTERY <b>×${formatNumber(masteryMultiplier(projection.count), 0)}</b></span>
          <span>TOWER MEMORY <b>×${formatNumber(mods.towerGlobal, 2)}</b></span>
          <span>ALL OUTPUT <b>×${formatNumber(mods.global, 2)}</b></span>
          <span>PRICE GROWTH <b>×${tower.growth.toFixed(3)}</b></span>
          <span>DISCOUNT <b>${Math.round(mods.discount * 100)}%</b></span>
        </div>`;
    }
    ui.towerTooltip.classList.remove('hidden');
    ui.towerTooltip.setAttribute('aria-hidden', 'false');
    positionTowerTooltip();
  }

  function hideTowerTooltip() {
    runtime.towerHover.id = null;
    if (!ui.towerTooltip) return;
    ui.towerTooltip.classList.add('hidden');
    ui.towerTooltip.setAttribute('aria-hidden', 'true');
    ui.towerTooltip.dataset.signature = '';
  }

  function handleTowerPointerMove(event) {
    if (event.pointerType === 'touch') return;
    const card = event.target.closest('[data-tower]');
    if (!card || !ui.towersList.contains(card)) {
      hideTowerTooltip();
      return;
    }
    runtime.towerHover.x = event.clientX;
    runtime.towerHover.y = event.clientY;
    renderTowerTooltip(card.dataset.tower);
  }

  function renderTowerBulkButton(affordableTowerTypes) {
    const unlocked = state.unlocks.towerBuyMaxAll;
    const signature = `${unlocked}:${affordableTowerTypes}:${state.resources.crystals >= TOWER_BUY_MAX_ALL_CRYSTAL_COST}`;
    if (ui.buyMaxAllTowersButton.dataset.signature !== signature) {
      ui.buyMaxAllTowersButton.dataset.signature = signature;
      ui.buyMaxAllTowersButton.classList.toggle('locked', !unlocked);
      ui.buyMaxAllTowersButton.innerHTML = unlocked
        ? `${fontAwesomeIcon('fa-layer-group')} BUY MAX ON ALL`
        : `${fontAwesomeIcon('fa-lock')} UNLOCK BUY MAX · ${formatCrystalAmount(TOWER_BUY_MAX_ALL_CRYSTAL_COST)} ◆`;
    }
    ui.buyMaxAllTowersButton.disabled = unlocked && affordableTowerTypes === 0;
    ui.buyMaxAllTowersButton.title = unlocked
      ? affordableTowerTypes
        ? `Distribute the available balance across ${affordableTowerTypes} affordable tower types`
        : 'No affordable towers'
      : state.resources.crystals >= TOWER_BUY_MAX_ALL_CRYSTAL_COST
        ? 'Spend Crystals to permanently unlock BUY MAX ON ALL'
        : `${formatCrystalAmount(TOWER_BUY_MAX_ALL_CRYSTAL_COST - state.resources.crystals)} more Crystals required`;
    ui.buyMaxAllTowersButton.setAttribute(
      'aria-label',
      unlocked ? 'Buy the maximum across all affordable towers' : `Unlock Buy Max on All for ${formatCrystalAmount(TOWER_BUY_MAX_ALL_CRYSTAL_COST)} Crystals`
    );
  }

  function updateTowerList() {
    ensureModifiers();
    const totalOutput = currentBps;
    let efficiency = null;
    for (const tower of TOWERS) {
      const refs = towerRefs[tower.id];
      if (!refs) continue;
      const count = state.towers[tower.id];
      const each = towerProductionEach(tower);
      const output = each * count;
      const share = totalOutput > 0 ? output / totalOutput * 100 : 0;
      const amount = selectedTowerAmount(tower);
      const projection = towerPurchaseProjection(tower, amount);
      const cost = projection.cost;
      const next = TOWER_MASTERY_THRESHOLDS.find(threshold => count < threshold);
      const payback = projection.payback;
      if (amount > 0 && Number.isFinite(payback) && (!efficiency || payback < efficiency.payback)) efficiency = { tower, payback };
      refs.card.classList.toggle('affordable', amount > 0 && state.resources.buttons >= cost);
      refs.next.textContent = next ? `Next mastery at ${formatNumber(next)}` : 'All masteries complete';
      refs.share.textContent = `${share.toFixed(1)}%`;
      refs.bar.style.width = `${Math.max(share > 0 ? 1 : 0, share)}%`;
      refs.each.textContent = `${formatNumber(each)}/s`;
      refs.total.textContent = `${formatNumber(output)}/s`;
      refs.payback.textContent = Number.isFinite(payback) ? formatDuration(payback) : '—';
      refs.owned.textContent = formatNumber(count);
      const adaptivePurchaseMode = buyMode === 'max' || buyMode === 'next';
      const displayedPurchaseAmount = adaptivePurchaseMode ? amount.toLocaleString('en-US') : buyMode;
      refs.buyLabel.textContent = buyMode === 'next' && !amount ? 'MASTERED' : `BUY ${displayedPurchaseAmount}`;
      refs.buy.setAttribute('aria-label', buyMode === 'next' && !amount
        ? `${tower.name} has reached every mastery`
        : `Buy ${amount.toLocaleString('en-US')} ${tower.name}`);
      refs.cost.textContent = buyMode === 'next' && !amount
        ? 'All milestones reached'
        : amount ? formatNumber(cost) : 'Unaffordable';
      refs.buy.disabled = !amount || state.resources.buttons < cost;
    }
    ui.networkOutput.textContent = `${formatNumber(currentBps)}/s`;
    ui.efficiencyLeader.textContent = efficiency?.tower.name || '—';
    ui.efficiencyLeaderSub.textContent = efficiency ? `${formatDuration(efficiency.payback)} estimated payback` : 'Buy your first tower';
    const nextCritMastery = TOWER_CRIT_THRESHOLDS.find(threshold => totalTowers() < threshold);
    ui.nextMastery.textContent = nextCritMastery ? `${formatNumber(nextCritMastery)} total towers` : 'Critical mastery complete';
    const affordableTowerTypes = TOWERS.filter(tower => towerUnitCost(tower) <= state.resources.buttons).length;
    renderTowerBulkButton(affordableTowerTypes);
    if (runtime.towerHover.id) renderTowerTooltip(runtime.towerHover.id);
  }

  function renderAchievementCategories() {
    let categories = [...ACHIEVEMENT_SCOPE_CATEGORIES[achievementScope]];
    if (achievementScope === 'aura' && !state.newGamePlus.active && !state.newGamePlus.completed) {
      categories = categories.filter(category => category !== 'ngplus');
    }
    achievementCategories = new Set([...achievementCategories].filter(category => categories.includes(category)));
    if (!achievementCategories.size) achievementCategories.add('all');
    ui.achievementCategories.innerHTML = categories.map(category => `
      <button class="${achievementCategories.has(category) ? 'active' : ''}" type="button" data-achievement-category="${category}" aria-pressed="${achievementCategories.has(category)}">
        ${ACHIEVEMENT_CATEGORY_LABELS[category]}
      </button>
    `).join('');
  }

  function updateAchievementViewTabs() {
    const newGamePlusAvailable = state.newGamePlus.active || state.newGamePlus.completed;
    const newGamePlusButton = $('[data-achievement-scope="ngplus"]', ui.achievementViews);
    newGamePlusButton?.classList.toggle('hidden', !newGamePlusAvailable);
    if (!newGamePlusAvailable && achievementScope === 'ngplus') {
      achievementScope = 'default';
      achievementCategories = new Set(['all']);
    }
    $$('[data-achievement-scope]', ui.achievementViews).forEach(button => {
      const active = button.dataset.achievementScope === achievementScope;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function renderAchievements() {
    updateAchievementViewTabs();
    renderAchievementCategories();
    const items = achievementItemsForScope(achievementScope, true);
    ui.achievementsGrid.innerHTML = items.map(item => {
      const origin = item.category === 'secret'
        ? item.scope === 'ngplus' ? 'NEW GAME+ SECRET' : 'SECRET'
        : item.scope === 'ngplus' ? 'NEW GAME+' : item.group === 'aura' ? 'DEFAULT AURA' : 'DEFAULT';
      return `
        <article class="achievement-card ${item.hiddenUntilNgPlus ? 'hidden-achievement' : ''} ${item.scope === 'ngplus' ? 'ng-plus-achievement' : ''} ${item.group === 'aura' ? 'aura-achievement' : ''}" data-achievement="${item.id}">
          <div class="achievement-top">
            <span class="achievement-icon">${fontAwesomeIcon(item.icon)}</span>
            <span class="achievement-status"><small>${origin}</small><span class="achievement-state" data-achievement-state>0%</span></span>
          </div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="achievement-reward"><span>REWARD</span><b>${rewardLabel(item.reward)}</b></div>
          <div class="achievement-progress"><i data-achievement-progress></i></div>
        </article>`;
    }).join('');
    achievementRefs = Object.fromEntries(items.map(item => {
      const card = ui.achievementsGrid.querySelector(`[data-achievement="${item.id}"]`);
      return [item.id, {
        card,
        state: $('[data-achievement-state]', card),
        progress: $('[data-achievement-progress]', card)
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
      const rewardSuppressed = state.newGamePlus.active && complete;
      const challengeFailed = neverClickChallengeFailed(item);
      const progress = clamp(value / item.target, 0, 1);
      refs.card.classList.toggle('complete', complete);
      refs.card.classList.toggle('claimed', claimed);
      refs.card.classList.toggle('reward-suppressed', rewardSuppressed);
      refs.card.classList.toggle('challenge-failed', challengeFailed);
      refs.state.textContent = challengeFailed
        ? 'ATTEMPT LOST'
        : rewardSuppressed
        ? 'UNLOCKED // REWARD OFFLINE'
        : complete || claimed
          ? 'CLAIMED'
          : `${Math.floor(progress * 100)}%`;
      refs.progress.style.width = `${progress * 100}%`;
    }
    const stats = getAchievementStats();
    const globalStats = (() => {
      const visible = ACHIEVEMENTS.filter(achievementVisible);
      const unlocked = visible.filter(achievementComplete);
      const claimable = unlocked.filter(item => !has(state.achievements.claimed, item.id));
      return { visible, unlocked, claimable };
    })();
    const percent = stats.visible.length ? stats.unlocked.length / stats.visible.length * 100 : 0;
    const claimedCrystalTotal = state.totals.achievementCrystals;
    $('.achievement-wheel').style.setProperty('--progress', `${percent * 3.6}deg`);
    ui.achievementPercent.textContent = `${Math.floor(percent)}%`;
    ui.achievementUnlocked.textContent = `${stats.unlocked.length} / ${stats.visible.length}`;
    ui.achievementRewards.textContent = `${formatCrystalAmount(claimedCrystalTotal)} ◆`;
    ui.achievementNavBadge.textContent = globalStats.claimable.length;
    ui.achievementNavBadge.classList.toggle('hidden', globalStats.claimable.length === 0);
  }

  function auraLuckBoost() {
    const level = clamp(safeInt(state.ascension.nodes.auraResonance), 0, AURA_LUCK_BONUSES.length - 1);
    return AURA_LUCK_BONUSES[level];
  }

  function auraRareWeightMultiplier() {
    const boost = auraLuckBoost();
    const finalLuckMultiplier = mods?.rngLuck || 1;
    if (!boost) return finalLuckMultiplier;
    const boostedRareProbability = BASE_RARE_AURA_PROBABILITY * (1 + boost);
    const resonanceMultiplier = boostedRareProbability * (1 - BASE_RARE_AURA_PROBABILITY)
      / (BASE_RARE_AURA_PROBABILITY * (1 - boostedRareProbability));
    return resonanceMultiplier * finalLuckMultiplier;
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
    if (percent < 0.000001) return '<0.000001%';
    return `${percent.toFixed(6).replace(/\.?0+$/, '')}%`;
  }

  function formatRngCharge(value) {
    const clamped = clamp(finite(value), 0, 100);
    const displayed = clamped >= 100 ? 100 : Math.floor(clamped * 10000) / 10000;
    const [whole, fraction = ''] = displayed.toFixed(4).split('.');
    return `${whole}.${fraction.replace(/0+$/, '').padEnd(2, '0')}`;
  }

  function formatAuraOneIn(percent) {
    if (percent <= 0) return 'NOT IN POOL';
    const denominator = Math.max(1, Math.round(100 / percent));
    return `1 in ${denominator.toLocaleString('en-US')}`;
  }

  function updateAuraOdds(force = false) {
    const signature = `${state.rng.scans}:${state.rng.pity}:${state.rng.discovered.paradox ? 1 : 0}:${state.ascension.nodes.auraResonance || 0}:${state.ascension.nodes.absoluteAscendancy || 0}`;
    if (!force && ui.auraCollection.dataset.oddsSignature === signature) return;
    ui.auraCollection.dataset.oddsSignature = signature;
    const odds = getNextAuraOdds();
    const resonance = auraLuckBoost();
    const resonanceLabel = resonance ? ` // HEAVENLY RARE+ CHANCE +${Math.round(resonance * 100)}%` : '';
    const finalLuckLabel = (mods?.rngLuck || 1) > 1 ? ` // ABSOLUTE LUCK ×${formatNumber(mods.rngLuck, 0)}` : '';
    ui.auraOddsMode.textContent = (odds.forcedParadox
      ? 'NEXT SCAN // PARADOX OVERRIDE — 100%'
      : odds.rareGuarantee
        ? 'NEXT SCAN // RARE+ PITY GUARANTEE'
        : 'NEXT SCAN // STANDARD WEIGHTING') + resonanceLabel + finalLuckLabel;
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

  function buildAuraVisualTheme(aura, auraIndex, rank, initialSeed) {
    let seed = initialSeed;
    const nextValue = maximum => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % maximum;
    };
    const angle = (auraIndex * 137.508 + nextValue(37)) % 360;
    const reverseAngle = (angle + 93 + auraIndex * 7) % 360;
    const primaryX = 10 + nextValue(81);
    const primaryY = 10 + nextValue(81);
    const secondaryX = 10 + nextValue(81);
    const secondaryY = 10 + nextValue(81);
    const gap = 20 + auraIndex * 1.35;
    const lineWidth = rank >= RARITY_RANK.Ethereal ? 2 : 1;
    const secondary = `hsl(${(auraIndex * 47 + nextValue(91)) % 360} 94% ${54 + rank % 4 * 4}%)`;
    const background = [
      `radial-gradient(ellipse ${34 + auraIndex % 27}% ${29 + auraIndex * 3 % 31}% at ${primaryX}% ${primaryY}%, color-mix(in srgb, var(--aura-fx-color) ${54 + rank * 3}%, transparent), transparent ${34 + auraIndex % 25}%)`,
      `radial-gradient(circle at ${secondaryX}% ${secondaryY}%, color-mix(in srgb, var(--aura-fx-secondary) ${30 + rank * 4}%, transparent), transparent ${22 + auraIndex % 31}%)`,
      `repeating-linear-gradient(${angle.toFixed(2)}deg, transparent 0 ${gap.toFixed(2)}px, color-mix(in srgb, var(--aura-fx-color) ${20 + rank * 3}%, transparent) ${gap.toFixed(2)}px ${(gap + lineWidth).toFixed(2)}px)`,
      `conic-gradient(from ${reverseAngle.toFixed(2)}deg at ${secondaryX}% ${primaryY}%, transparent 0deg, color-mix(in srgb, var(--aura-fx-secondary) ${20 + rank * 2}%, transparent) ${16 + auraIndex % 29}deg, transparent ${48 + auraIndex % 47}deg)`
    ].join(',');
    const tracePoints = Array.from({ length: 16 }, (_, point) => {
      const x = point / 15 * 100;
      const amplitude = 8 + rank * 1.6 + auraIndex % 9;
      const wave = Math.sin((point + 1) * (0.72 + auraIndex * 0.037)) * amplitude;
      const noise = nextValue(17) - 8;
      return `${x.toFixed(1)},${clamp(50 + wave + noise, 5, 95).toFixed(1)}`;
    }).join(' ');
    const radiusA = 18 + auraIndex * 11 % 33;
    const radiusB = 18 + auraIndex * 17 % 33;
    return {
      background,
      secondary,
      tracePoints,
      orbitLeft: `${4 + auraIndex * 17 % 72}%`,
      orbitTop: `${8 + auraIndex * 23 % 62}%`,
      orbitSize: `${120 + rank * 13 + auraIndex % 5 * 8}px`,
      orbitRadius: `${radiusA}% ${radiusB}% ${53 - radiusA / 2}% ${53 - radiusB / 2}%`,
      orbitTilt: `${-18 + auraIndex * 13 % 37}deg`
    };
  }

  function applyAuraScreenEffect() {
    const visualMode = ['full', 'reduced', 'off'].includes(state.settings.auraVisuals) ? state.settings.auraVisuals : 'full';
    const visualsEnabled = visualMode !== 'off';
    const aura = visualsEnabled && state.rng.discovered[state.rng.equipped] ? AURA_BY_ID.get(state.rng.equipped) : null;
    const signature = `${visualMode}:${aura?.id || 'none'}`;
    if (ui.auraScreenFx.dataset.signature === signature) return;
    ui.auraScreenFx.dataset.signature = signature;
    document.body.classList.remove(
      'aura-fx-active',
      'aura-fx-legendary',
      'aura-fx-high',
      'aura-fx-extreme',
      'aura-fx-reduced',
      ...Array.from({ length: 6 }, (_, index) => `aura-fx-pattern-${index}`)
    );
    delete document.body.dataset.auraEffect;
    if (!aura) {
      ui.auraScreenFx.innerHTML = '';
      document.body.style.removeProperty('--aura-fx-color');
      document.body.style.removeProperty('--aura-fx-secondary');
      document.body.style.removeProperty('--aura-fx-background');
      document.body.style.removeProperty('--aura-fx-intensity');
      document.body.style.removeProperty('--aura-fx-speed');
      document.body.style.removeProperty('--aura-fx-orbit-left');
      document.body.style.removeProperty('--aura-fx-orbit-top');
      document.body.style.removeProperty('--aura-fx-orbit-size');
      document.body.style.removeProperty('--aura-fx-orbit-radius');
      document.body.style.removeProperty('--aura-fx-orbit-tilt');
      return;
    }

    const rank = RARITY_RANK[aura.tier] || 0;
    const auraIndex = AURA_INDEX_BY_ID.get(aura.id) ?? 0;
    let seed = auraEffectSeed(aura.id);
    const theme = buildAuraVisualTheme(aura, auraIndex, rank, seed);
    const particleCount = visualMode === 'reduced' ? 0 : Math.min(48, 5 + rank * 3 + (auraIndex % 4));
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
      const shape = ['50%', '2px', '50% 0', '15% 50%'][((auraIndex * 3) + index) % 4];
      particles.push(`<i style="--x:${x}%;--y:${y}%;--size:${size}px;--delay:-${delay}s;--duration:${duration}s;--travel:-${travel}px;--particle-shape:${shape}"></i>`);
    }

    document.body.dataset.auraEffect = aura.id;
    document.body.style.setProperty('--aura-fx-color', aura.color);
    document.body.style.setProperty('--aura-fx-secondary', theme.secondary);
    document.body.style.setProperty('--aura-fx-background', theme.background);
    document.body.style.setProperty('--aura-fx-intensity', String(Math.min(0.34, 0.035 + rank * 0.026)));
    document.body.style.setProperty('--aura-fx-speed', `${Math.max(2.2, 11 - rank * 0.68)}s`);
    document.body.style.setProperty('--aura-fx-orbit-left', theme.orbitLeft);
    document.body.style.setProperty('--aura-fx-orbit-top', theme.orbitTop);
    document.body.style.setProperty('--aura-fx-orbit-size', theme.orbitSize);
    document.body.style.setProperty('--aura-fx-orbit-radius', theme.orbitRadius);
    document.body.style.setProperty('--aura-fx-orbit-tilt', theme.orbitTilt);
    document.body.classList.add('aura-fx-active');
    if (visualMode === 'reduced') {
      document.body.classList.add('aura-fx-reduced');
    } else {
      if (rank >= RARITY_RANK.Legendary) document.body.classList.add('aura-fx-legendary');
      if (rank >= RARITY_RANK.Ethereal) document.body.classList.add('aura-fx-high');
      if (rank >= RARITY_RANK.Impossible) document.body.classList.add('aura-fx-extreme');
    }
    ui.auraScreenFx.innerHTML = `
      <div class="aura-fx-field"></div>
      <svg class="aura-fx-fingerprint" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${theme.tracePoints}"></polyline></svg>
      <div class="aura-fx-orbit">${fontAwesomeIcon(auraIconName(aura))}</div>
      <div class="aura-fx-particles">${particles.join('')}</div>
      <span class="aura-fx-signature">FX-${String(auraIndex + 1).padStart(2, '0')} // ${aura.name.toUpperCase()} // ${aura.tier.toUpperCase()}</span>`;
  }

  function updateRngNav() {
    if (!ui.rngNav) return;
    const charge = clamp(finite(state.rng.charge), 0, 100);
    const full = charge >= 100;
    ui.rngNav.classList.toggle('rng-charge-full', full);
    ui.rngChargeTrack?.classList.toggle('charge-full', full);
    const progress = `${charge.toFixed(3)}%`;
    if (ui.rngNav.style.getPropertyValue('--rng-charge-progress') !== progress) {
      ui.rngNav.style.setProperty('--rng-charge-progress', progress);
    }
    const scanCost = clamp(finite(mods?.auraScanCost, AURA_SCAN_COST), 0.001, 100);
    const scanStep = `${scanCost.toFixed(3)}%`;
    if (ui.rngNav.style.getPropertyValue('--rng-scan-step') !== scanStep) {
      ui.rngNav.style.setProperty('--rng-scan-step', scanStep);
    }
    const readyCharge = full
      ? 100
      : clamp(Math.floor((charge + 1e-9) / scanCost) * scanCost, 0, 100);
    const readyProgress = `${readyCharge.toFixed(3)}%`;
    if (ui.rngNav.style.getPropertyValue('--rng-ready-progress') !== readyProgress) {
      ui.rngNav.style.setProperty('--rng-ready-progress', readyProgress);
    }
    const readyScans = Math.floor((charge + 1e-9) / scanCost);
    const label = full
      ? `RNG Observatory, scanner fully charged, ${readyScans} scans ready`
      : `RNG Observatory, scanner charge ${Math.floor(charge)}%, ${readyScans} scan${readyScans === 1 ? '' : 's'} ready`;
    if (ui.rngNav.getAttribute('aria-label') !== label) ui.rngNav.setAttribute('aria-label', label);
  }

  function updateRngUi() {
    updateRngNav();
    const count = discoveredAuraCount();
    const scanCost = mods?.auraScanCost || AURA_SCAN_COST;
    const passiveRate = passiveRngChargeRate();
    const passiveCapLabel = passiveRate >= MAX_PASSIVE_RNG_CHARGE_PER_SECOND ? ' MAX' : '';
    ui.rngChargeText.textContent = `${formatRngCharge(state.rng.charge)} / 100${passiveRate ? ` • +${formatRngCharge(passiveRate)}/S${passiveCapLabel}` : ''}`;
    ui.rngChargeFill.style.width = `${state.rng.charge}%`;
    ui.rollAuraButton.disabled = state.rng.charge < scanCost || runtime.rng.scanning;
    ui.rollAuraCost.textContent = `${formatNumber(scanCost, 0)} CHARGE`;
    ui.pityText.textContent = state.rng.pity + 1 >= 50 ? 'Next scan guarantees Rare or better' : `Rare guarantee in ${50 - state.rng.pity} scans`;
    const aura = AURA_BY_ID.get(state.rng.equipped);
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
      ? `${formatNumber(state.rng.scans)} scans • ${count} unique • ${state.rng.pity} current pity${auraLuckBoost() ? ` • +${Math.round(auraLuckBoost() * 100)}% Rare+ resonance` : ''}${(mods?.rngLuck || 1) > 1 ? ` • ×${formatNumber(mods.rngLuck, 0)} absolute luck` : ''}`
      : 'Start scanning to build a probability profile.';
    applyAuraScreenEffect();
  }

  function constrainedTreePosition(x, y, scale) {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x, y };
    const visibleEdge = Math.min(140, rect.width * 0.25, rect.height * 0.25);
    const scaledWidth = CORE_TREE_WIDTH * scale;
    const scaledHeight = CORE_TREE_HEIGHT * scale;
    return {
      x: clamp(x, visibleEdge - scaledWidth, rect.width - visibleEdge),
      y: clamp(y, visibleEdge - scaledHeight, rect.height - visibleEdge)
    };
  }

  function applyTreeTransform() {
    const position = constrainedTreePosition(runtime.tree.x, runtime.tree.y, runtime.tree.scale);
    runtime.tree.x = position.x;
    runtime.tree.y = position.y;
    const target = constrainedTreePosition(runtime.tree.targetX, runtime.tree.targetY, runtime.tree.targetScale);
    runtime.tree.targetX = target.x;
    runtime.tree.targetY = target.y;
    ui.coreTree.style.setProperty('--tree-inverse-scale', String(1 / runtime.tree.scale));
    ui.coreTree.style.transform = `translate3d(${runtime.tree.x}px, ${runtime.tree.y}px, 0) scale(${runtime.tree.scale})`;
    ui.constellationViewport.style.setProperty('--star-x', `${runtime.tree.x % 193}px`);
    ui.constellationViewport.style.setProperty('--star-y', `${runtime.tree.y % 173}px`);
    ui.constellationViewport.style.setProperty('--star-x-far', `${(runtime.tree.x * 0.35) % 311}px`);
    ui.constellationViewport.style.setProperty('--star-y-far', `${(runtime.tree.y * 0.35) % 283}px`);
  }

  function animateTreeView(time) {
    runtime.tree.animationFrame = 0;
    const duration = state.settings.motion === 'off' ? 0 : state.settings.motion === 'reduced' ? 120 : 200;
    const progress = duration ? clamp((time - runtime.tree.animationStartedAt) / duration, 0, 1) : 1;
    const eased = 1 - Math.pow(1 - progress, 3);
    runtime.tree.x = runtime.tree.zoomStartX + (runtime.tree.targetX - runtime.tree.zoomStartX) * eased;
    runtime.tree.y = runtime.tree.zoomStartY + (runtime.tree.targetY - runtime.tree.zoomStartY) * eased;
    runtime.tree.scale = runtime.tree.zoomStartScale + (runtime.tree.targetScale - runtime.tree.zoomStartScale) * eased;
    if (progress >= 1) {
      runtime.tree.x = runtime.tree.targetX;
      runtime.tree.y = runtime.tree.targetY;
      runtime.tree.scale = runtime.tree.targetScale;
    }
    applyTreeTransform();
    if (progress < 1) runtime.tree.animationFrame = requestAnimationFrame(animateTreeView);
  }

  function setTreeTarget(x, y, scale, immediate = false) {
    const position = constrainedTreePosition(x, y, scale);
    runtime.tree.targetX = position.x;
    runtime.tree.targetY = position.y;
    runtime.tree.targetScale = scale;
    runtime.tree.zoomStartX = runtime.tree.x;
    runtime.tree.zoomStartY = runtime.tree.y;
    runtime.tree.zoomStartScale = runtime.tree.scale;
    runtime.tree.animationStartedAt = performance.now();
    runtime.tree.initialized = true;
    if (immediate) {
      if (runtime.tree.animationFrame) cancelAnimationFrame(runtime.tree.animationFrame);
      runtime.tree.animationFrame = 0;
      runtime.tree.x = position.x;
      runtime.tree.y = position.y;
      runtime.tree.scale = scale;
      applyTreeTransform();
      return;
    }
    if (!runtime.tree.animationFrame) runtime.tree.animationFrame = requestAnimationFrame(animateTreeView);
  }

  function resetTreeView() {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      runtime.tree.initialized = false;
      return;
    }
    const root = CORE_NODE_BY_ID.get('starter');
    const scale = state.ascension.inLimbo ? 0.72 : 0.58;
    const x = rect.width / 2 - root.x * scale;
    const y = rect.height * (state.ascension.inLimbo ? 0.2 : 0.25) - root.y * scale;
    setTreeTarget(x, y, scale, true);
  }

  function zoomTree(direction, clientX, clientY) {
    const rect = ui.constellationViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const focusX = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const focusY = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    const baseScale = runtime.tree.targetScale || runtime.tree.scale;
    const baseX = runtime.tree.targetX;
    const baseY = runtime.tree.targetY;
    const worldX = (focusX - baseX) / baseScale;
    const worldY = (focusY - baseY) / baseScale;
    const nextScale = clamp(baseScale * direction, 0.28, 1.75);
    setTreeTarget(focusX - worldX * nextScale, focusY - worldY * nextScale, nextScale);
  }

  function startTreeDrag(event) {
    if (event.button !== 0 || event.target.closest('button')) return;
    if (runtime.tree.animationFrame) cancelAnimationFrame(runtime.tree.animationFrame);
    runtime.tree.animationFrame = 0;
    runtime.tree.targetX = runtime.tree.x;
    runtime.tree.targetY = runtime.tree.y;
    runtime.tree.targetScale = runtime.tree.scale;
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
    runtime.tree.targetX = runtime.tree.x;
    runtime.tree.targetY = runtime.tree.y;
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
      const parent = CORE_NODE_BY_ID.get(parentId);
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
      const requirements = node.requiresAllMax
        ? 'ALL OTHER HEAVENLY UPGRADES MAXED'
        : Object.entries(node.requires || {}).map(([id, required]) => {
          const parent = CORE_NODE_BY_ID.get(id);
          return `${parent?.name || id} ${required}`;
        }).join(' + ');
      return `
        <article class="core-node ${node.id === 'absoluteAscendancy' ? 'final-capstone' : ''} ${maxed ? 'maxed' : ''} ${unlocked ? 'unlocked' : 'locked'} ${affordable ? 'affordable' : unlocked && !maxed ? 'needs-cores' : ''}" style="left:${node.x}px;top:${node.y}px">
          <button class="core-node-orb" type="button" data-core-node="${node.id}" ${!unlocked || maxed || state.resources.cores < cost ? 'disabled' : ''} aria-label="${node.name}, level ${level} of ${node.max}">
            <small>${maxed ? 'MAXED' : !unlocked ? 'LOCKED' : affordable ? 'BUY NOW' : 'NEED CORES'}</small>
            <span>${fontAwesomeIcon(node.icon || CORE_FONT_ICONS[node.id] || 'fa-circle-nodes')}</span><i>${level}/${node.max}</i>
          </button>
          <div class="core-node-info">
            <h3>${node.name}</h3>
            <p>${node.desc}</p>
            <div class="core-node-footer"><span>${unlocked ? `LEVEL ${level} / ${node.max}` : `REQUIRES ${requirements}`}</span><b>${maxed ? 'MAXED' : `${formatCoreAmount(cost)} CORE${cost === 1 ? '' : 'S'}`}</b></div>
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
      clickBpsSeconds: 0,
      comboLimit: BASE_COMBO_LIMIT * COMBO_LIMIT_MULTIPLIERS[
        clamp(safeInt(state.ascension.nodes.cadenceReservoir), 0, COMBO_LIMIT_MULTIPLIERS.length - 1)
      ],
      rngAutoCharge: ENTROPY_CHARGE_RATES[clamp(safeInt(state.ascension.nodes.entropyBattery), 0, ENTROPY_CHARGE_RATES.length - 1)],
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
        if (effect.kind === 'clickBps') summary.clickBpsSeconds += effect.value * level;
        if (effect.kind === 'auraLuck') summary.auraLuck = AURA_LUCK_BONUSES[clamp(level, 0, AURA_LUCK_BONUSES.length - 1)];
      }
    }
    return summary;
  }

  function updateNewGamePlusUi() {
    const active = state.newGamePlus.active;
    document.body.classList.toggle('new-game-plus-active', active);
    ui.ngPlusBanner.classList.toggle('hidden', !active);
    ui.converterMemoryFault.classList.toggle('hidden', !active);
    ui.ascensionNavLabel.textContent = active ? 'New Game+' : 'Ascend';
    const ascensionNav = ui.ascensionNavLabel.closest('[data-page-target="ascension"]');
    ascensionNav?.setAttribute('aria-label', active ? 'New Game Plus' : 'Ascension');
    const converterNav = $('[data-page-target="converter"]');
    const converterNavLabel = $('.nav-label', converterNav);
    const converterNavIcon = $('.nav-icon i', converterNav);
    converterNav?.setAttribute('aria-label', active ? 'Corrupted Converter' : 'Crystal Converter');
    if (converterNavLabel) converterNavLabel.textContent = active ? 'C0NV#RT' : 'Convert';
    if (converterNavIcon) converterNavIcon.className = `fa-solid ${active ? 'fa-bug' : 'fa-arrows-rotate'}`;
    const mainButtonEyebrow = $('.main-button-face small', ui.mainButton);
    const mainButtonTitle = $('.main-button-face strong', ui.mainButton);
    if (mainButtonEyebrow) mainButtonEyebrow.textContent = active ? 'EVOLVED' : 'PRESS';
    if (mainButtonTitle) mainButtonTitle.textContent = active ? 'REACTOR+' : 'BUTTON';
    ui.mainButton.setAttribute('aria-label', active ? 'Press the evolved New Game Plus reactor' : 'Press the reactor button');
    ui.ascensionEyebrow.textContent = active ? 'SECOND ITERATION' : 'CYCLE ENGINE';
    ui.ascensionTitle.textContent = active ? 'New Game+' : 'Heavenly Circuit';
    ui.ascensionDescription.textContent = active
      ? 'Reality is running without inherited achievement or aura power. Rebuild the erased Heavenly Circuit and reach Absolute Ascendancy again.'
      : 'Shut down the reactor, recover Heavenly Cores, and permanently rebuild its operating system.';
    ui.converterEyebrow.textContent = active ? 'ERR_MEMORY_ADDRESS' : 'CRYSTAL INDUSTRY';
    ui.converterTitle.textContent = active ? 'Converter // Corrupted' : 'Crystal Converter';
    ui.converterDescription.textContent = active
      ? 'The transmutation chamber does not exist in this iteration. No recipe, upgrade, input, or queued conversion can function until New Game+ is completed.'
      : 'Mine persistent crystals into useful currencies over time. Refine the chamber to extract more value with less material.';
    ui.reactionDescription.textContent = active
      ? 'Arm the sensor. Press only when the chamber flashes blue. Early presses fail.'
      : 'Arm the sensor. Press only when the chamber flashes green. Early presses fail.';
    if (runtime.reaction.mode === 'waiting') ui.reactionStatus.textContent = active ? 'WAIT FOR BLUE' : 'WAIT FOR GREEN';
    updateAchievementViewTabs();
  }

  function updateAscensionUi() {
    ensureModifiers();
    updateNewGamePlusUi();
    const gain = ascensionPotential();
    const inLimbo = state.ascension.inLimbo;
    const memory = coreMemorySummary();
    ui.ascensionCount.textContent = formatNumber(state.totals.ascensions, 0);
    ui.ascensionGain.textContent = formatCoreAmount(gain);
    ui.availableCores.textContent = formatCoreAmount(state.resources.cores);
    ui.availableCoresFocus.textContent = formatCoreAmount(state.resources.cores);
    ui.ascendButton.classList.toggle('hidden', inLimbo);
    ui.ascendButton.disabled = gain < 1 || runtime.ascension.playing;
    if (ui.ascensionConfirmDialog.open) {
      runtime.ascension.pendingGain = gain;
      ui.ascensionConfirmGain.textContent = formatCoreAmount(gain);
    }
    ui.beginCycleButton.disabled = runtime.ascension.playing;
    ui.ascensionFocusBar.classList.toggle('active', inLimbo);
    ui.ascensionFocusBar.setAttribute('aria-hidden', String(!inLimbo));
    ui.ascensionOverview.setAttribute('aria-hidden', String(inLimbo));
    ui.ascensionTreePanel.setAttribute('aria-hidden', String(!inLimbo));
    document.body.classList.toggle('ascension-focus', inLimbo);
    ui.ascensionActiveNodes.textContent = `${memory.activeNodes} / ${CORE_NODES.length}`;
    ui.ascensionCoreLevels.textContent = formatNumber(memory.levels, 0);
    ui.ascensionSpentCores.textContent = formatCoreAmount(state.ascension.spentCores);
    ui.ascensionStartReserve.textContent = formatNumber(memory.startButtons, 0);
    ui.ascensionOutputMemory.textContent = memory.clickBpsSeconds
      ? `×${formatNumber(memory.global, 2)} • +${memory.clickBpsSeconds.toFixed(2)}S PRESS • COMBO ${memory.comboLimit}`
      : `×${formatNumber(memory.global, 2)} • COMBO ${memory.comboLimit}`;
    ui.ascensionTowerMemory.textContent = `×${formatNumber(memory.towerGlobal, 2)}`;
    const rngMemory = [];
    const passiveCharge = passiveRngChargeRate();
    if (passiveCharge) rngMemory.push(`+${formatRngCharge(passiveCharge)}/S${passiveCharge >= MAX_PASSIVE_RNG_CHARGE_PER_SECOND ? ' CAP' : ''}`);
    if (memory.auraLuck) rngMemory.push(`+${Math.round(memory.auraLuck * 100)}% RARE+`);
    if (mods.rngLuck > 1) rngMemory.push(`LUCK ×${formatNumber(mods.rngLuck, 0)}`);
    if (mods.crystalGain > 1) rngMemory.push(`◆ ×${formatNumber(mods.crystalGain, 0)}`);
    ui.ascensionRngMemory.textContent = rngMemory.join(' • ') || 'OFFLINE';
    ui.cycleStateHint.textContent = inLimbo
      ? state.newGamePlus.active
        ? 'New Game+ reactor offline. Rebuild the erased Circuit until Absolute Ascendancy becomes reachable.'
        : 'Reactor offline. Spend Heavenly Cores, then begin when your circuit is ready.'
      : state.newGamePlus.active
        ? 'Achievement and aura power remain suppressed until the final Heavenly node is rebuilt.'
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
      ['Iteration output', formatNumber(state.totals.buttons)],
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
      ['Crystals processed', formatCrystalAmount(state.totals.convertedCrystals)],
      ['Arcade wins', formatNumber(state.totals.arcadeWins)],
      ['Ascensions', formatNumber(state.totals.ascensions)],
      ['Iteration play time', formatDuration(state.totals.playSeconds)]
    ];
    const lifetime = [
      ['Total output', formatNumber(state.lifetime.buttonsEarned)],
      ['Buttons spent', formatNumber(state.lifetime.buttonsSpent)],
      ['Manual presses', formatNumber(state.lifetime.manualPresses)],
      ['Critical presses', formatNumber(state.lifetime.criticalPresses)],
      ['Critical press rate', `${(state.lifetime.manualPresses ? state.lifetime.criticalPresses / state.lifetime.manualPresses * 100 : 0).toFixed(2)}%`],
      ['Crystals earned', formatCrystalAmount(state.lifetime.crystalsEarned)],
      ['Crystals spent', formatCrystalAmount(state.lifetime.crystalsSpent)],
      ['Heavenly Cores earned', formatCoreAmount(state.lifetime.coresEarned)],
      ['Heavenly Cores spent', formatCoreAmount(state.lifetime.coresSpent)],
      ['Towers purchased', formatNumber(state.lifetime.towerPurchases)],
      ['Upgrades installed', formatNumber(state.lifetime.upgradePurchases)],
      ['Converter upgrades', formatNumber(state.lifetime.converterUpgradePurchases)],
      ['Golden signals', formatNumber(state.lifetime.goldenSignals)],
      ['Glitched signals', formatNumber(state.lifetime.glitchedSignals)],
      ['Aura scans', formatNumber(state.lifetime.auraScans)],
      ['Unique auras found', `${discoveredAuraCount()} / ${AURAS.length}`],
      ['Converter cycles', formatNumber(state.lifetime.converterCycles)],
      ['Crystals processed', formatCrystalAmount(state.lifetime.crystalsProcessed)],
      ['Charge converted', formatNumber(state.lifetime.chargeConverted, 1)],
      ['Arcade wins', formatNumber(state.lifetime.arcadeWins)],
      ['Ascensions', formatNumber(state.lifetime.ascensions)],
      ['New Game+ completions', formatNumber(state.lifetime.newGamePlusCompletions, 0)],
      ['Peak production', `${formatNumber(state.lifetime.bestBps)}/s`],
      ['Active play time', formatDuration(state.lifetime.playSeconds)],
      ['Achievements recorded', `${state.achievements.claimed.length} / ${ACHIEVEMENTS.length}`],
      ['Save age', formatDuration((Date.now() - state.meta.createdAt) / 1000)]
    ];
    ui.statsList.innerHTML = stats.map(([label, value]) => `<div class="stat-row"><span>${label}</span><b>${value}</b></div>`).join('');
    ui.lifetimeStatsList.innerHTML = lifetime.map(([label, value]) => `<div class="stat-row"><span>${label}</span><b>${value}</b></div>`).join('');
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
    ui.arcadeStreak.textContent = state.minigames.failureStreak
      ? `${state.minigames.failureStreak} failure streak • next loss increases`
      : state.minigames.streak
        ? `${state.minigames.streak} trial streak`
        : 'No active streak';
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
    autoClaimAchievements();
    const visibleAchievements = ACHIEVEMENTS.filter(achievementVisible);
    const pendingAchievements = visibleAchievements.filter(item =>
      achievementComplete(item) && !has(state.achievements.claimed, item.id)
    );
    ui.achievementNavBadge.textContent = pendingAchievements.length;
    ui.achievementNavBadge.classList.toggle('hidden', !pendingAchievements.length);
    const ownedUpgrades = new Set(state.upgrades);
    const affordable = UPGRADES.filter(item => !ownedUpgrades.has(item.id) && upgradeUnlocked(item, ownedUpgrades) && state.resources.buttons >= item.cost).length;
    ui.upgradeNavBadge.textContent = affordable;
    ui.upgradeNavBadge.classList.toggle('hidden', !affordable);
    const affordableTower = TOWERS.some(tower => {
      const amount = selectedTowerAmount(tower);
      return amount > 0 && state.resources.buttons >= towerBulkCost(tower, amount);
    });
    ui.towerNavBadge.classList.toggle('hidden', !affordableTower);
  }

  function drawChart() {
    const canvas = ui.productionChart;
    if (!canvas) return;
    const chartMode = ['area', 'line', 'bar'].includes(state.ui.chartMode) ? state.ui.chartMode : 'area';
    $$('[data-chart-mode]', ui.chartModes).forEach(button => {
      const active = button.dataset.chartMode === chartMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    canvas.setAttribute('aria-label', `${chartMode} chart of production over the last 60 seconds`);
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
    const evolvedTheme = state.newGamePlus.active;
    const lineColor = evolvedTheme ? '#65ddff' : '#d2ff53';
    const shadowColor = evolvedTheme ? 'rgba(255,61,132,.55)' : 'rgba(210,255,83,.4)';
    if (chartMode === 'bar') {
      const slotWidth = (width - padding * 2) / chartSamples.length;
      const barWidth = Math.max(1, slotWidth * .64);
      const barGradient = context.createLinearGradient(0, height, 0, 0);
      barGradient.addColorStop(0, evolvedTheme ? 'rgba(255,61,132,.62)' : 'rgba(136,173,36,.72)');
      barGradient.addColorStop(1, evolvedTheme ? '#65ddff' : '#d2ff53');
      context.fillStyle = barGradient;
      context.shadowColor = shadowColor;
      context.shadowBlur = 5;
      chartSamples.forEach((value, index) => {
        const barHeight = Math.max(value > 0 ? 1 : 0, value / max * (height - padding * 2));
        const x = padding + index * slotWidth + (slotWidth - barWidth) / 2;
        context.fillRect(x, height - padding - barHeight, barWidth, barHeight);
      });
      context.shadowBlur = 0;
      return;
    }
    const points = chartSamples.map((value, index) => ({
      x: padding + index / (chartSamples.length - 1) * (width - padding * 2),
      y: height - padding - value / max * (height - padding * 2)
    }));
    if (chartMode === 'area') {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, evolvedTheme ? 'rgba(255,61,132,.24)' : 'rgba(210,255,83,.22)');
      gradient.addColorStop(1, evolvedTheme ? 'rgba(101,221,255,0)' : 'rgba(210,255,83,0)');
      context.beginPath();
      context.moveTo(points[0].x, height);
      points.forEach(point => context.lineTo(point.x, point.y));
      context.lineTo(points.at(-1).x, height);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
    }
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.strokeStyle = lineColor;
    context.lineWidth = 2;
    context.shadowColor = shadowColor;
    context.shadowBlur = 8;
    context.stroke();
  }

  function positionTutorialOverlay() {
    if (!runtime.tutorial.active) return;
    const step = TUTORIAL_STEPS[runtime.tutorial.index];
    const target = step?.target ? $(step.target) : null;
    const targetVisible = target && target.getClientRects().length && getComputedStyle(target).visibility !== 'hidden';
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let focusRect = null;
    if (targetVisible) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const left = clamp(rect.left - 7, 7, viewportWidth - 14);
        const top = clamp(rect.top - 7, 7, viewportHeight - 14);
        const right = clamp(rect.right + 7, 14, viewportWidth - 7);
        const bottom = clamp(rect.bottom + 7, 14, viewportHeight - 7);
        focusRect = {
          left,
          top,
          width: Math.max(0, right - left),
          height: Math.max(0, bottom - top),
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        };
      }
    }
    ui.tutorialOverlay.classList.toggle('targetless', !focusRect);
    if (focusRect) {
      ui.tutorialSpotlight.style.left = `${focusRect.left}px`;
      ui.tutorialSpotlight.style.top = `${focusRect.top}px`;
      ui.tutorialSpotlight.style.width = `${focusRect.width}px`;
      ui.tutorialSpotlight.style.height = `${focusRect.height}px`;
    }
    const panelWidth = ui.tutorialPanel.offsetWidth;
    const panelHeight = ui.tutorialPanel.offsetHeight;
    let panelLeft;
    let panelTop;
    if (!focusRect) {
      panelLeft = (viewportWidth - panelWidth) / 2;
      panelTop = (viewportHeight - panelHeight) / 2;
    } else if (viewportWidth < 760) {
      panelLeft = 10;
      panelTop = focusRect.centerY < viewportHeight / 2
        ? Math.max(10, viewportHeight - panelHeight - 10)
        : 10;
    } else {
      const sideGap = 18;
      const roomOnLeft = focusRect.left - sideGap;
      const roomOnRight = viewportWidth - focusRect.left - focusRect.width - sideGap;
      if (roomOnLeft >= panelWidth || roomOnRight >= panelWidth) {
        panelLeft = roomOnRight >= panelWidth && roomOnRight >= roomOnLeft
          ? viewportWidth - panelWidth - sideGap
          : sideGap;
        panelTop = focusRect.centerY - panelHeight / 2;
      } else {
        panelLeft = (viewportWidth - panelWidth) / 2;
        panelTop = focusRect.centerY < viewportHeight / 2
          ? viewportHeight - panelHeight - sideGap
          : sideGap;
      }
    }
    ui.tutorialPanel.style.left = `${clamp(panelLeft, 10, Math.max(10, viewportWidth - panelWidth - 10))}px`;
    ui.tutorialPanel.style.top = `${clamp(panelTop, 10, Math.max(10, viewportHeight - panelHeight - 10))}px`;
  }

  function scheduleTutorialPosition() {
    if (!runtime.tutorial.active || runtime.tutorial.frame) return;
    runtime.tutorial.frame = requestAnimationFrame(() => {
      runtime.tutorial.frame = 0;
      positionTutorialOverlay();
    });
  }

  async function showTutorialStep(index) {
    if (!runtime.tutorial.active) return;
    runtime.tutorial.index = clamp(safeInt(index), 0, TUTORIAL_STEPS.length - 1);
    const step = TUTORIAL_STEPS[runtime.tutorial.index];
    const token = ++runtime.tutorial.token;
    if (step.page) showPage(step.page);
    ui.tutorialIcon.innerHTML = fontAwesomeIcon(step.icon);
    ui.tutorialStep.textContent = `${runtime.tutorial.index + 1} / ${TUTORIAL_STEPS.length}`;
    ui.tutorialTitle.textContent = step.title;
    ui.tutorialCopy.textContent = step.copy;
    ui.tutorialProgressFill.style.width = `${(runtime.tutorial.index + 1) / TUTORIAL_STEPS.length * 100}%`;
    ui.tutorialBackButton.disabled = runtime.tutorial.index === 0;
    ui.tutorialNextButton.innerHTML = runtime.tutorial.index === TUTORIAL_STEPS.length - 1
      ? `FINISH ${fontAwesomeIcon('fa-check')}`
      : `NEXT ${fontAwesomeIcon('fa-arrow-right')}`;
    ui.tutorialOverlay.classList.add('targetless');
    positionTutorialOverlay();
    await delay(state.settings.motion === 'off' ? 10 : 90);
    if (!runtime.tutorial.active || token !== runtime.tutorial.token) return;
    const target = step.target ? $(step.target) : null;
    if (target?.getClientRects().length) {
      target.scrollIntoView({
        behavior: state.settings.motion === 'off' ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
    await delay(state.settings.motion === 'off' ? 10 : 230);
    if (!runtime.tutorial.active || token !== runtime.tutorial.token) return;
    positionTutorialOverlay();
    ui.tutorialNextButton.focus({ preventScroll: true });
  }

  function startTutorial() {
    if (state.ascension.inLimbo) {
      toast('Tutorial unavailable during shutdown', 'Begin the new cycle first, then replay the tour from System or search.');
      return;
    }
    if (ui.tutorialPromptDialog.open) ui.tutorialPromptDialog.close('start');
    if (ui.commandDialog.open) ui.commandDialog.close();
    hideTowerTooltip();
    runtime.tutorial.active = true;
    runtime.tutorial.index = 0;
    runtime.tutorial.token++;
    document.body.classList.add('tutorial-active');
    ui.tutorialOverlay.classList.remove('hidden');
    ui.tutorialOverlay.setAttribute('aria-hidden', 'false');
    audio.play('click');
    showTutorialStep(0);
  }

  function endTutorial(completed = false) {
    if (!runtime.tutorial.active) return;
    runtime.tutorial.active = false;
    runtime.tutorial.token++;
    if (runtime.tutorial.frame) cancelAnimationFrame(runtime.tutorial.frame);
    runtime.tutorial.frame = 0;
    document.body.classList.remove('tutorial-active');
    ui.tutorialOverlay.classList.add('hidden');
    ui.tutorialOverlay.setAttribute('aria-hidden', 'true');
    if (completed) {
      state.meta.tutorialCompletedVersion = TUTORIAL_VERSION;
      toast('Tutorial complete', 'Replay it from System or search for “tutorial” at any time.', 'gold');
      audio.play('reward');
    }
    savePending = true;
    saveNow();
  }

  function nextTutorialStep() {
    if (!runtime.tutorial.active) return;
    if (runtime.tutorial.index >= TUTORIAL_STEPS.length - 1) {
      endTutorial(true);
      return;
    }
    showTutorialStep(runtime.tutorial.index + 1);
  }

  function previousTutorialStep() {
    if (!runtime.tutorial.active || runtime.tutorial.index === 0) return;
    showTutorialStep(runtime.tutorial.index - 1);
  }

  function offerFirstRunTutorial() {
    if (
      state.ascension.inLimbo ||
      runtime.tutorial.active ||
      state.meta.tutorialPromptedVersion === TUTORIAL_VERSION ||
      ui.tutorialPromptDialog.open
    ) return;
    if ($('.modal[open]')) {
      setTimeout(offerFirstRunTutorial, 800);
      return;
    }
    state.meta.tutorialPromptedVersion = TUTORIAL_VERSION;
    savePending = true;
    saveNow();
    ui.tutorialPromptDialog.showModal();
  }

  function grantEverythingCheat() {
    const resourceAmount = EVERYTHING_CHEAT_RESOURCE_AMOUNT;
    const towerAmount = 2000;
    const recordAmount = 1000;

    state.resources.buttons = resourceAmount;
    state.resources.crystals = resourceAmount;
    state.resources.cores = resourceAmount;
    Object.assign(state.totals, {
      buttons: resourceAmount,
      runButtons: resourceAmount,
      clicks: 1e9,
      crits: 1e9,
      golden: 1e6,
      glitches: 4040,
      towersPurchased: TOWERS.length * towerAmount,
      playSeconds: 31536000,
      arcadeWins: 1e6,
      achievementCrystals: resourceAmount,
      ascensions: 1000,
      converterJobs: 1e6,
      convertedCrystals: resourceAmount,
      bestBps: resourceAmount
    });
    Object.assign(state.lifetime, {
      buttonsEarned: resourceAmount,
      buttonsSpent: resourceAmount,
      crystalsEarned: resourceAmount,
      crystalsSpent: resourceAmount,
      coresEarned: resourceAmount,
      coresSpent: resourceAmount,
      manualPresses: 1e9,
      criticalPresses: 1e9,
      towerPurchases: TOWERS.length * towerAmount,
      upgradePurchases: UPGRADES.length,
      converterUpgradePurchases: CONVERTER_UPGRADES.length,
      goldenSignals: 1e6,
      glitchedSignals: 4040,
      auraScans: 1e6,
      arcadeWins: 1e6,
      converterCycles: 1e6,
      crystalsProcessed: resourceAmount,
      chargeConverted: resourceAmount,
      ascensions: 1000,
      newGamePlusCompletions: 1,
      playSeconds: 31536000,
      bestBps: resourceAmount
    });

    for (const tower of TOWERS) state.towers[tower.id] = towerAmount;
    state.upgrades = UPGRADES.map(item => item.id);
    state.achievements.claimed = ACHIEVEMENTS.map(item => item.id);
    state.achievements.progress = Object.fromEntries(ACHIEVEMENTS.map(item => [item.id, item.target]));
    state.challenges.trueNeverClick = {
      defaultEligible: false,
      defaultAchieved: true,
      ngPlusEligible: false,
      ngPlusAchieved: true
    };

    state.rng.charge = 100;
    state.rng.scans = 1e6;
    state.rng.pity = 49;
    state.rng.discovered = Object.fromEntries(AURAS.map(aura => [aura.id, 1]));
    state.rng.equipped = AURAS.at(-1)?.id || null;
    state.rng.recent = AURAS.slice(-12).map(aura => RARITY_RANK[aura.tier] || 0);

    state.minigames.reactionBest = 1;
    state.minigames.sequenceBest = recordAmount;
    state.minigames.pulseBest = 100;
    state.minigames.sequenceBestByDifficulty = {};
    state.minigames.pulseBestByDifficulty = {};
    state.minigames.vectorBest = {};
    state.minigames.cipherBest = {};
    state.minigames.stabilityBest = {};
    state.minigames.difficultyWins = {};
    for (const [game, table] of Object.entries(ARCADE_DIFFICULTY_TABLES)) {
      for (const difficulty of Object.keys(table)) {
        state.minigames.difficultyWins[`${game}:${difficulty}`] = recordAmount;
        if (game === 'sequence') state.minigames.sequenceBestByDifficulty[difficulty] = recordAmount;
        if (game === 'pulse') state.minigames.pulseBestByDifficulty[difficulty] = 100;
        if (game === 'vector') state.minigames.vectorBest[difficulty] = 1;
        if (game === 'cipher') state.minigames.cipherBest[difficulty] = 1;
        if (game === 'stability') state.minigames.stabilityBest[difficulty] = 100;
      }
    }
    state.minigames.streak = recordAmount;

    state.converter.target = 'buttons';
    state.converter.input = 1;
    state.converter.upgrades = CONVERTER_UPGRADES.filter(item => !item.repeatable).map(item => item.id);
    state.converter.levels = { facetedBit: 1000 };
    state.converter.active = null;
    state.unlocks.towerBuyMaxAll = true;
    state.jukebox.goldenSpawnSound = GOLDEN_SPAWN_SOUNDS.at(-1)?.id || 'default';
    state.jukebox.unlockedGoldenSpawnSounds = GOLDEN_SPAWN_SOUNDS.map(sound => sound.id);
    state.secrets.found = SECRETS.map(secret => secret.id);
    state.secrets.brandClicks = 7;
    state.secrets.clockClicks = 9;

    for (const node of CORE_NODES) state.ascension.nodes[node.id] = node.max;
    state.ascension.spentCores = resourceAmount;
    state.ascension.inLimbo = false;
    state.newGamePlus.unlocked = true;
    state.newGamePlus.pending = false;
    state.newGamePlus.active = false;
    state.newGamePlus.completed = true;
    state.newGamePlus.completions = Math.max(1, state.newGamePlus.completions);
    state.golden.activeUntil = 0;
    state.golden.nextAt = Date.now() + 1000;
    state.buffs = [];
    state.meta.glitchRewardSeen = true;
    state.meta.tutorialPromptedVersion = TUTORIAL_VERSION;
    state.meta.tutorialCompletedVersion = TUTORIAL_VERSION;

    combo = 0;
    for (const golden of goldenElements) golden.remove();
    goldenElements.clear();
    runtime.goldenRush.active = false;
    runtime.goldenRush.nextSpawnAt = 0;
    modsDirty = true;
    ensureModifiers();
    applyAuraScreenEffect();
    renderAll();
    savePending = true;
    saveNow();
    audio.ensure();
    audio.play('reward');
    showReward(
      'Absolute Reactor Override',
      '100% COMPLETION',
      'Every currency, tower, upgrade, Heavenly node, aura, achievement, secret, Arcade record, Converter system, Jukebox unlock, and New Game+ reward is now yours.'
    );
  }

  function tryEverythingCheat(query) {
    if (stringToBase64(query.trim()) !== EVERYTHING_CHEAT_CODE) return false;
    ui.commandSearch.value = '';
    if (ui.commandDialog.open) ui.commandDialog.close();
    grantEverythingCheat();
    return true;
  }

  function activateCommandResult(button) {
    if (!button) return;
    if (button.dataset.commandPage) showPage(button.dataset.commandPage);
    if (button.dataset.commandAction === 'tutorial') startTutorial();
    if (ui.commandDialog.open) ui.commandDialog.close();
  }

  function renderCommandResults(query = '') {
    const search = query.trim().toLowerCase();
    const pages = NAV_ITEMS.map(item => ({ ...item, kind: 'page' }));
    const actions = COMMAND_ACTIONS.map(item => ({ ...item, kind: 'action' }));
    const items = [...pages, ...actions].filter(item => !search || `${item.title} ${item.sub}`.toLowerCase().includes(search));
    ui.commandResults.innerHTML = items.map((item, index) => `
      <button class="command-result ${index === 0 ? 'selected' : ''}" type="button" ${item.kind === 'page' ? `data-command-page="${item.id}"` : `data-command-action="${item.id}"`}>
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
      refs.state.textContent = selected ? 'ACTIVE RECEIVER SOUND' : unlocked ? 'OWNED' : `${formatCrystalAmount(sound.cost)} CRYSTALS`;
      refs.action.disabled = selected || (!unlocked && !affordable);
      refs.action.textContent = selected ? 'SELECTED' : unlocked ? 'SELECT' : sound.cost ? `BUY ${formatCrystalAmount(sound.cost)} ◆` : 'UNLOCK';
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
        toast('Receiver sound locked', `${formatCrystalAmount(sound.cost - state.resources.crystals)} more crystals required.`);
        return;
      }
      state.resources.crystals -= sound.cost;
      addLifetimeStat('crystalsSpent', sound.cost);
      state.jukebox.unlockedGoldenSpawnSounds.push(id);
      logEvent('Receiver sound purchased', `${sound.name} added to the Heavenly Jukebox for ${formatCrystalAmount(sound.cost)} crystals.`, 'gold');
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
    ui.auraVisualsSetting.value = state.settings.auraVisuals;
    ui.numberFormat.value = state.settings.numberFormat;
    ui.fastNotesSetting.value = state.settings.fastNotes ? String(state.settings.fastNotesSeconds) : 'off';
    document.body.classList.toggle('motion-reduced', state.settings.motion === 'reduced');
    document.body.classList.toggle('motion-off', state.settings.motion === 'off');
    applyAuraScreenEffect();
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
    const modes = ['1', '10', '25', 'next', 'max'];
    buyMode = modes[(modes.indexOf(buyMode) + 1) % modes.length];
    $$('[data-buy-mode]').forEach(button => button.classList.toggle('active', button.dataset.buyMode === buyMode));
    savePending = true;
    updateTowerList();
    updateCritAndAchievementBadges();
  }

  function bindEvents() {
    initializeCustomSelects();
    $$('.modal').forEach(dialog => dialog.addEventListener('click', event => {
      if (event.target === dialog && dialog.open) dialog.close('cancel');
    }));
    ui.offlineDialog.addEventListener('close', () => setTimeout(offerFirstRunTutorial, 300));
    ui.mainButton.addEventListener('click', manualPress);
    ui.buyAllUpgradesButton.addEventListener('click', buyEveryAffordableUpgrade);
    ui.buyMaxAllTowersButton.addEventListener('click', handleBuyMaxAllTowers);
    ui.chartModes.addEventListener('click', event => {
      const button = event.target.closest('[data-chart-mode]');
      if (!button) return;
      state.ui.chartMode = button.dataset.chartMode;
      savePending = true;
      drawChart();
    });
    ui.towersList.addEventListener('pointermove', handleTowerPointerMove);
    ui.towersList.addEventListener('pointerleave', hideTowerTooltip);
    document.addEventListener('pointerdown', () => audio.ensure(), { once: true });

    document.addEventListener('click', event => {
      const pageButton = event.target.closest('[data-page-target]');
      if (pageButton) showPage(pageButton.dataset.pageTarget);
      const upgradeButton = event.target.closest('[data-buy-upgrade]');
      if (upgradeButton) buyUpgrade(upgradeButton.dataset.buyUpgrade);
      const towerButton = event.target.closest('[data-buy-tower]');
      if (towerButton) buyTower(towerButton.dataset.buyTower);
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
      if (converterPreset) setConverterInput(converterPreset.dataset.converterInput === 'max' ? Math.max(MIN_CONVERTER_INPUT, state.resources.crystals) : converterPreset.dataset.converterInput);
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
      const commandButton = event.target.closest('[data-command-page], [data-command-action]');
      if (commandButton) activateCommandResult(commandButton);
    });

    $$('[data-buy-mode]').forEach(button => button.addEventListener('click', () => {
      buyMode = button.dataset.buyMode;
      $$('[data-buy-mode]').forEach(item => item.classList.toggle('active', item === button));
      savePending = true;
      updateTowerList();
      updateCritAndAchievementBadges();
    }));

    $$('#upgradeCategories [data-upgrade-category]').forEach(button => button.addEventListener('click', () => {
      toggleCategoryFilter(upgradeCategories, button.dataset.upgradeCategory);
      renderUpgrades();
    }));
    ui.upgradeSearch.addEventListener('input', renderUpgrades);
    ui.upgradeStatus.addEventListener('change', renderUpgrades);

    ui.achievementViews.addEventListener('click', event => {
      const button = event.target.closest('[data-achievement-scope]');
      if (!button || button.classList.contains('hidden')) return;
      achievementScope = button.dataset.achievementScope;
      achievementCategories = new Set(['all']);
      renderAchievements();
    });
    ui.achievementCategories.addEventListener('click', event => {
      const button = event.target.closest('[data-achievement-category]');
      if (!button) return;
      toggleCategoryFilter(achievementCategories, button.dataset.achievementCategory);
      renderAchievements();
    });
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
    ui.auraRevealSkip.addEventListener('click', finishAuraRevealCutscene);
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
      state.converter.input = normalizeConverterInput(ui.converterInput.value, state.converter.input);
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
    ui.replayTutorialButton.addEventListener('click', startTutorial);
    ui.tutorialStartButton.addEventListener('click', startTutorial);
    ui.tutorialExitButton.addEventListener('click', () => endTutorial(false));
    ui.tutorialBackButton.addEventListener('click', previousTutorialStep);
    ui.tutorialNextButton.addEventListener('click', nextTutorialStep);
    ui.commandSearch.addEventListener('input', () => {
      if (!tryEverythingCheat(ui.commandSearch.value)) renderCommandResults(ui.commandSearch.value);
    });
    ui.commandSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (tryEverythingCheat(ui.commandSearch.value)) return;
        const selected = $('.command-result.selected', ui.commandResults) || $('.command-result', ui.commandResults);
        activateCommandResult(selected);
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
    const versionChip = ui.version.closest('.version-chip');
    const activateHeartbeat = () => {
      const now = Date.now();
      if (now - clockClickWindow > 5000) state.secrets.clockClicks = 0;
      clockClickWindow = now;
      state.secrets.clockClicks++;
      if (state.secrets.clockClicks >= 9) discoverSecret('heartbeat');
    };
    versionChip.addEventListener('click', activateHeartbeat);
    versionChip.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activateHeartbeat();
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
    ui.auraVisualsSetting.addEventListener('change', () => {
      state.settings.auraVisuals = ui.auraVisualsSetting.value;
      ui.auraScreenFx.dataset.signature = '';
      applyAuraScreenEffect();
      savePending = true;
      const modeCopy = {
        full: ['Aura visuals enabled', 'The equipped frequency uses its complete screen effect.'],
        reduced: ['Aura visuals reduced', 'Only the equipped aura sigil and its quiet orbital field remain visible.'],
        off: ['Aura visuals disabled', 'Aura bonuses remain active without the screen effect.']
      }[state.settings.auraVisuals];
      toast(
        modeCopy[0],
        modeCopy[1]
      );
    });
    ui.numberFormat.addEventListener('change', () => {
      state.settings.numberFormat = ui.numberFormat.value;
      renderAll();
      savePending = true;
    });
    ui.fastNotesSetting.addEventListener('change', () => {
      state.settings.fastNotes = ui.fastNotesSetting.value !== 'off';
      if (state.settings.fastNotes) state.settings.fastNotesSeconds = Number(ui.fastNotesSetting.value);
      savePending = true;
      toast(
        state.settings.fastNotes ? 'Fast notes enabled' : 'Standard notes restored',
        state.settings.fastNotes
          ? `Notifications now clear after ${state.settings.fastNotesSeconds} second${state.settings.fastNotesSeconds === 1 ? '' : 's'}.`
          : 'Notifications now remain visible for the standard duration.'
      );
    });

    $('#saveButton').addEventListener('click', () => { if (saveNow()) toast('Progress saved', 'The local save vault is current.'); });
    $('#exportButton').addEventListener('click', exportSave);
    $('#importButton').addEventListener('click', importSave);
    $('#resetButton').addEventListener('click', resetSave);
    ui.confirmWipeSaveButton.addEventListener('click', confirmResetSave);
    document.addEventListener('keydown', event => {
      if (runtime.rng.revealResolve) {
        if (event.key === 'Escape') {
          event.preventDefault();
          finishAuraRevealCutscene();
        }
        return;
      }
      if (runtime.tutorial.active) {
        if (event.key === 'Escape') {
          event.preventDefault();
          endTutorial(false);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          nextTutorialStep();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previousTutorialStep();
        }
        return;
      }
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
        const offlineReport = grantOfflineProgress();
        lastWallTime = Date.now();
        if (state.golden.nextAt < Date.now()) state.golden.nextAt = Date.now() + 3000;
        if (offlineReport) showOfflineReport(offlineReport);
      }
    });
    window.addEventListener('beforeunload', saveNow);
    window.addEventListener('resize', () => {
      drawChart();
      if (runtime.tree.initialized) applyTreeTransform();
      scheduleTutorialPosition();
    }, { passive: true });
    ui.workspace.addEventListener('scroll', scheduleTutorialPosition, { passive: true });
  }

  function renderAll() {
    autoClaimAchievements({ announce: false });
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
      const passiveCharge = passiveRngChargeRate();
      if (passiveCharge > 0 && state.rng.charge < 100) {
        state.rng.charge = clamp(state.rng.charge + passiveCharge * dt, 0, 100);
        savePending = true;
      }
      const activeSecond = Math.min(dt, 1);
      const effectiveBps = currentBps * activeBuffMultiplier();
      state.totals.playSeconds += activeSecond;
      state.totals.bestBps = Math.max(state.totals.bestBps, effectiveBps);
      addLifetimeStat('playSeconds', activeSecond);
      state.lifetime.bestBps = Math.max(state.lifetime.bestBps, effectiveBps);
    }
    state.buffs = state.buffs.filter(buff => buff.until > wallNow);
    updateGlitchStatus(wallNow);
    updateGoldenRush(wallNow);
    updateConverter(wallNow);
    updateConverterNav(wallNow);
    updateRngNav();
    if (mods.autoUpgrades && time - lastAutoUpgradeAt >= 200) {
      lastAutoUpgradeAt = time;
      buyEveryAffordableUpgrade({ automatic: true });
    }

    if (time - lastManualPress > 650 && combo > 0) combo = Math.max(0, combo - dt * 5);
    if (runtime.pulse.active) ui.pulseMarker.style.left = `${pulsePosition(time)}%`;
    updateTimedArcadeGames(time);

    if (!state.ascension.inLimbo && wallNow >= state.golden.nextAt) rollGoldenChance();
    for (const golden of goldenElements) {
      if (wallNow >= Number(golden.dataset.expiresAt)) expireGolden(golden);
    }

    updateResourceHud();

    if (time - lastUiUpdate >= 100) {
      lastUiUpdate = time;
      updateTopUi();
      if (state.ui.page === 'observatory') updateRngUi();
      if (state.ui.page === 'ascension' || state.ascension.inLimbo) updateAscensionUi();
      if (state.ui.page === 'arcade') renderArcade();
      if (state.ui.page === 'core') updateObjective();
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
      if (state.ui.page === 'system') {
        renderSystemStats();
        renderSecrets();
      }
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
    const offlineReport = grantOfflineProgress();
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
    setTimeout(() => offlineReport ? showOfflineReport(offlineReport) : offerFirstRunTutorial(), 650);
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
