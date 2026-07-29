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
  const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
  const GOLDEN_MIN_SECONDS = 55;
  const GOLDEN_MAX_SECONDS = 115;

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
    { id: 'you', name: 'The Operator', icon: 'YOU', baseCost: 1.8e12, baseProd: 4.8e9, growth: 1.165, desc: 'A future version of you with perfect technique.' }
  ];

  const upgrade = (id, name, category, cost, icon, desc, effectText, effect, unlock = {}) => ({
    id, name, category, cost, icon, desc, effectText, effect, unlock
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
    upgrade('calibration5', 'Calibration V', 'critical', 1e25, 'Ⅴ', 'Complete the purchased half of perfect probability.', 'Critical chance +1.50%', { kind: 'calibration', value: 0.015 }, { requires: 'calibration4', type: 'buttons', value: 5e24 })
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
    { id: 'paradox', name: 'Paradox', symbol: '∞', tier: 'Transcendent', weight: 0.025, color: '#d2ff53', effect: { kind: 'global', value: 2.25 }, text: 'All output ×2.25 • Critical method found' }
  ];

  const CORE_NODES = [
    { id: 'starter', name: 'Seed Voltage', max: 5, baseCost: 1, desc: 'Begin each cycle with 100K more buttons per level.' },
    { id: 'force', name: 'Operator Force', max: 10, baseCost: 1, desc: 'Permanent press power +15% per level.' },
    { id: 'network', name: 'Network Memory', max: 10, baseCost: 1, desc: 'Permanent tower output +12% per level.' },
    { id: 'probability', name: 'Probability Weave', max: 5, baseCost: 3, desc: 'Critical chance +2.5% per level.' },
    { id: 'fortune', name: 'Signal Fortune', max: 5, baseCost: 2, desc: 'Scanner charge and golden frequency +15% per level.' },
    { id: 'endurance', name: 'Temporal Battery', max: 5, baseCost: 2, desc: 'Offline output +8% per level.' }
  ];

  const achievement = (id, name, category, icon, desc, metric, target, reward) => ({
    id, name, category, icon, desc, metric, target, reward
  });

  const ACHIEVEMENTS = [
    achievement('press25', 'Contact', 'press', 'I', 'Press the reactor 25 times.', 'clicks', 25, { kind: 'crystals', value: 2 }),
    achievement('press500', 'Muscle Memory', 'press', 'II', 'Press the reactor 500 times.', 'clicks', 500, { kind: 'crystals', value: 5 }),
    achievement('press10k', 'Operator', 'press', 'III', 'Press the reactor 10,000 times.', 'clicks', 10000, { kind: 'global', value: 1.03 }),
    achievement('press1m', 'One in a Million', 'press', 'IV', 'Press the reactor 1,000,000 times.', 'clicks', 1e6, { kind: 'crit', value: 0.01 }),
    achievement('crit100', 'Sharp Contact', 'press', '✦', 'Land 100 critical presses.', 'crits', 100, { kind: 'crystals', value: 8 }),
    achievement('crit10k', 'Golden Reflex', 'press', '✦', 'Land 10,000 critical presses.', 'crits', 10000, { kind: 'global', value: 1.05 }),

    achievement('earn1k', 'Four Figures', 'production', 'B', 'Produce 1,000 lifetime buttons.', 'buttons', 1000, { kind: 'crystals', value: 2 }),
    achievement('earn1m', 'Signal Millionaire', 'production', 'M', 'Produce 1 million lifetime buttons.', 'buttons', 1e6, { kind: 'seconds', value: 120 }),
    achievement('earn1b', 'Industrial Scale', 'production', 'B', 'Produce 1 billion lifetime buttons.', 'buttons', 1e9, { kind: 'crystals', value: 12 }),
    achievement('earn1t', 'Twelve Zeroes', 'production', 'T', 'Produce 1 trillion lifetime buttons.', 'buttons', 1e12, { kind: 'global', value: 1.08 }),
    achievement('earn1e18', 'Impossible Economy', 'production', 'Ω', 'Produce 1 quintillion lifetime buttons.', 'buttons', 1e18, { kind: 'crit', value: 0.01 }),
    achievement('bps100', 'Motion Begins', 'production', '/s', 'Reach 100 buttons per second.', 'bps', 100, { kind: 'crystals', value: 4 }),
    achievement('bps1m', 'Unbroken Stream', 'production', '/s', 'Reach 1 million buttons per second.', 'bps', 1e6, { kind: 'seconds', value: 300 }),

    achievement('tower1', 'Delegation', 'collection', '▥', 'Purchase your first tower.', 'towers', 1, { kind: 'crystals', value: 2 }),
    achievement('tower100', 'Automation Floor', 'collection', '▥', 'Own 100 towers in total.', 'towers', 100, { kind: 'global', value: 1.03 }),
    achievement('tower100each', 'Balanced Skyline', 'collection', '▥', 'Own at least 100 of every tower.', 'towerMin', 100, { kind: 'crit', value: 0.01 }),
    achievement('upgrade5', 'Modified', 'collection', '⌁', 'Install 5 upgrades.', 'upgrades', 5, { kind: 'crystals', value: 4 }),
    achievement('upgrade25', 'Systems Engineer', 'collection', '⌁', 'Install 25 upgrades.', 'upgrades', 25, { kind: 'global', value: 1.05 }),
    achievement('golden1', 'A Golden Signal', 'collection', 'G', 'Catch one golden signal.', 'golden', 1, { kind: 'crystals', value: 5 }),
    achievement('golden25', 'Radiant Receiver', 'collection', 'G', 'Catch 25 golden signals.', 'golden', 25, { kind: 'crystals', value: 20 }),
    achievement('arcade1', 'Lab Rat', 'collection', 'A', 'Win one arcade trial.', 'arcade', 1, { kind: 'crystals', value: 3 }),
    achievement('arcade50', 'Perfect Timing', 'collection', 'A', 'Win 50 arcade trials.', 'arcade', 50, { kind: 'crit', value: 0.01 }),
    achievement('aura1', 'First Frequency', 'collection', '◉', 'Discover one aura.', 'auras', 1, { kind: 'crystals', value: 3 }),
    achievement('aura12', 'Spectrum Half', 'collection', '◉', 'Discover 12 auras.', 'auras', 12, { kind: 'global', value: 1.06 }),
    achievement('aura24', 'Full Spectrum', 'collection', '∞', 'Discover every aura.', 'auras', 24, { kind: 'crit', value: 0.01 }),

    achievement('secret1', 'Behind the Panel', 'secret', '?', 'Recover one restricted signal.', 'secrets', 1, { kind: 'crystals', value: 10 }),
    achievement('secret4', 'The Reactor Knows', 'secret', '!', 'Recover all restricted signals.', 'secrets', 4, { kind: 'global', value: 1.1 }),
    achievement('ascend1', 'Again, Differently', 'secret', '△', 'Complete one ascension cycle.', 'ascensions', 1, { kind: 'crystals', value: 20 })
  ];

  const SECRETS = [
    { id: 'sevenfold', name: 'Sevenfold Contact', clue: 'The name above is more responsive than it looks.' },
    { id: 'upup', name: 'Old Direction', clue: 'An ancient sequence still opens modern systems.' },
    { id: 'echo', name: 'The Memory Phrase', clue: 'The archive insists: THE BUTTON REMEMBERS.' },
    { id: 'heartbeat', name: 'System Heartbeat', clue: 'Even a nominal clock can be pressed nine times.' }
  ];

  const CRIT_ACHIEVEMENTS = ['press1m', 'earn1e18', 'tower100each', 'arcade50', 'aura24'];
  const TOWER_CRIT_THRESHOLDS = [100, 500, 1500, 5000, 15000, 50000];
  const RARITY_RANK = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4, Mythic: 5, Transcendent: 6 };
  const NAV_ITEMS = [
    { id: 'core', icon: '⬡', title: 'Reactor', sub: 'Manual input and telemetry', key: '1' },
    { id: 'upgrades', icon: '⌁', title: 'Upgrades', sub: 'System modifications', key: '2' },
    { id: 'towers', icon: '▥', title: 'Towers', sub: 'Automation network', key: '3' },
    { id: 'arcade', icon: '⌁', title: 'Arcade', sub: 'Skill trials', key: '4' },
    { id: 'achievements', icon: '✦', title: 'Achievements', sub: 'Progress and rewards', key: '5' },
    { id: 'observatory', icon: '◉', title: 'RNG Observatory', sub: 'Aura scanner', key: '6' },
    { id: 'ascension', icon: '△', title: 'Ascension', sub: 'Permanent cycles', key: '7' },
    { id: 'system', icon: '⚙', title: 'System', sub: 'Settings and data', key: '8' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeInt = (value, fallback = 0) => Math.max(0, Math.floor(finite(value, fallback)));
  const has = (array, value) => Array.isArray(array) && array.includes(value);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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
        towersPurchased: 0,
        playSeconds: 0,
        arcadeWins: 0,
        achievementCrystals: 0,
        ascensions: 0,
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
        streak: 0
      },
      golden: {
        nextAt: Date.now() + randomBetween(12000, 20000),
        activeUntil: 0
      },
      buffs: [],
      secrets: { found: [], brandClicks: 0, clockClicks: 0 },
      ascension: { nodes, spentCores: 0 },
      settings: { sound: 0.55, music: 0.35, motion: 'full', numberFormat: 'suffix' },
      meta: { createdAt: Date.now(), lastSave: Date.now(), migratedFrom: null },
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
    merged.resources.crystals = safeInt(merged.resources.crystals);
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
    for (const node of CORE_NODES) merged.ascension.nodes[node.id] = clamp(safeInt(merged.ascension.nodes[node.id]), 0, node.max);
    merged.golden.nextAt = clamp(finite(merged.golden.nextAt, Date.now() + 15000), Date.now() + 3000, Date.now() + GOLDEN_MAX_SECONDS * 1000);
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
  let towerRefs = {};
  let chartSamples = Array(60).fill(0);
  let goldenElement = null;
  let savePending = false;
  let brandClickWindow = 0;
  let clockClickWindow = 0;
  let konamiBuffer = [];

  const runtime = {
    reaction: { mode: 'idle', timer: null, goAt: 0 },
    sequence: { pattern: [], input: [], accepting: false, token: 0 },
    pulse: { active: false, startedAt: 0, target: 65, width: 14, attempts: 0, locks: 0, bestError: 1 }
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
    pulseButton: $('#pulseButton'),
    pulseMarker: $('#pulseMarker'),
    pulseTarget: $('#pulseTarget'),
    pulseStatus: $('#pulseStatus'),
    pulseLocks: $('#pulseLocks'),
    pulseBest: $('#pulseBest'),
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
    ascensionCount: $('#ascensionCount'),
    ascensionGain: $('#ascensionGain'),
    ascensionRequirement: $('#ascensionRequirement'),
    ascendButton: $('#ascendButton'),
    availableCores: $('#availableCores'),
    coreTree: $('#coreTree'),
    eventLog: $('#eventLog'),
    systemClock: $('#systemClock'),
    goldenLayer: $('#goldenLayer'),
    toastStack: $('#toastStack'),
    soundButton: $('#soundButton'),
    soundIcon: $('#soundIcon'),
    soundVolume: $('#soundVolume'),
    soundVolumeOutput: $('#soundVolumeOutput'),
    musicVolume: $('#musicVolume'),
    musicVolumeOutput: $('#musicVolumeOutput'),
    motionSetting: $('#motionSetting'),
    numberFormat: $('#numberFormat'),
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
    commandResults: $('#commandResults')
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
      case 'arcade': return state.totals.arcadeWins;
      case 'auras': return discoveredAuraCount();
      case 'secrets': return state.secrets.found.length;
      case 'ascensions': return state.totals.ascensions;
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
      startButtons: 0
    };

    for (const id of state.upgrades) {
      const effect = UPGRADES.find(item => item.id === id)?.effect;
      if (!effect) continue;
      if (effect.kind === 'clickFlat') next.clickBase += effect.value;
      if (effect.kind === 'clickMult') next.clickMult *= effect.value;
      if (effect.kind === 'global') next.global *= effect.value;
      if (effect.kind === 'tower') next.towerMult[effect.tower] *= effect.value;
      if (effect.kind === 'discount') next.discount += effect.value;
      if (effect.kind === 'offline') next.offline += effect.value;
      if (effect.kind === 'goldenFrequency') next.goldenFrequency += effect.value;
      if (effect.kind === 'goldenReward') next.goldenReward *= effect.value;
      if (effect.kind === 'charge') next.charge *= effect.value;
    }

    for (const item of ACHIEVEMENTS) {
      if (!has(state.achievements.claimed, item.id) || item.reward.kind !== 'global') continue;
      next.global *= item.reward.value;
    }

    const nodes = state.ascension.nodes;
    next.startButtons = nodes.starter * 100000;
    next.clickMult *= Math.pow(1.15, nodes.force);
    next.towerGlobal *= Math.pow(1.12, nodes.network);
    next.goldenFrequency += nodes.fortune * 0.15;
    next.charge *= 1 + nodes.fortune * 0.15;
    next.offline += nodes.endurance * 0.08;

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
        { icon: 'B', name: 'Base reactor contact', detail: 'Built into every new cycle', done: 1, total: 1, value: 0.02, max: 0.02 },
        { icon: 'U', name: 'Critical upgrades', detail: `${purchasedCrit.length} of ${critUpgrades.length} installed`, done: purchasedCrit.length, total: critUpgrades.length, value: purchasedCrit.reduce((sum, item) => sum + item.effect.value, 0), max: 0.18 },
        { icon: 'V', name: 'Final calibrations', detail: `${purchasedCalibration.length} of ${calibrationUpgrades.length} installed`, done: purchasedCalibration.length, total: calibrationUpgrades.length, value: purchasedCalibration.reduce((sum, item) => sum + item.effect.value, 0), max: 0.075 },
        { icon: 'T', name: 'Tower network mastery', detail: `Next at ${TOWER_CRIT_THRESHOLDS[towerMethods]?.toLocaleString() || 'complete'} total towers`, done: towerMethods, total: 6, value: towerMethods * 0.02, max: 0.12 },
        { icon: 'A', name: 'Achievement rewards', detail: `${achievementMethods} of 5 critical rewards claimed`, done: achievementMethods, total: 5, value: achievementMethods * 0.01, max: 0.05 },
        { icon: '?', name: 'Restricted signals', detail: `${secretMethods} of 4 secrets recovered`, done: secretMethods, total: 4, value: secretMethods * 0.025, max: 0.10 },
        { icon: '△', name: 'Probability Weave', detail: `${coreMethods} of 5 permanent levels`, done: coreMethods, total: 5, value: coreMethods * 0.025, max: 0.125 },
        { icon: '∞', name: 'Paradox frequency', detail: auraMethod ? 'Transcendent aura discovered' : 'Undiscovered in the Observatory', done: auraMethod, total: 1, value: auraMethod * 0.03, max: 0.03 },
        { icon: 'G', name: 'Golden mastery', detail: `${Math.min(100, state.totals.golden)} of 100 signals caught`, done: goldenMethod, total: 1, value: goldenMethod * 0.03, max: 0.03 },
        { icon: '✦', name: 'Perfect calibration', detail: perfect ? 'Every other method completed' : 'Complete all 37 methods above', done: perfect, total: 1, value: perfect * 0.02, max: 0.02 }
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

  function markDirty(structural = false) {
    modsDirty = true;
    savePending = true;
    if (structural) {
      renderUpgrades();
      renderAchievements();
      renderCoreTree();
      renderAuraCollection();
    }
  }

  class SoundEngine {
    constructor() {
      this.context = null;
      this.music = null;
      this.trackIndex = 0;
      this.started = false;
      this.tracks = [
        './music/music_main1.mp3',
        './music/music_main2.mp3',
        './music/music_main3.mp3',
        './music/music_main4.mp3'
      ];
    }

    ensure() {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.context = new AudioContext();
      }
      if (this.context?.state === 'suspended') this.context.resume().catch(() => {});
      if (!this.started && state.settings.music > 0) this.startMusic();
    }

    tone(frequency, duration, type = 'sine', volume = 0.1, slide = 0) {
      if (!state.settings.sound || !this.context) return;
      const time = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), time + duration);
      gain.gain.setValueAtTime(Math.max(0.0001, volume * state.settings.sound), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(time);
      oscillator.stop(time + duration);
    }

    play(name) {
      if (!this.context) return;
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
    }

    startMusic() {
      if (this.started || state.settings.music <= 0) return;
      this.started = true;
      this.music = new Audio(this.tracks[this.trackIndex]);
      this.music.preload = 'auto';
      this.music.volume = state.settings.music;
      this.music.addEventListener('ended', () => {
        this.trackIndex = (this.trackIndex + 1) % this.tracks.length;
        this.music.src = this.tracks[this.trackIndex];
        this.music.play().catch(() => {});
      });
      this.music.play().catch(() => { this.started = false; });
    }

    setMusicVolume() {
      if (this.music) this.music.volume = state.settings.music;
      if (state.settings.music === 0 && this.music) {
        this.music.pause();
        this.started = false;
      } else if (state.settings.music > 0 && this.music?.paused) {
        this.music.play().then(() => { this.started = true; }).catch(() => { this.started = false; });
      } else if (state.settings.music > 0 && !this.started) {
        this.startMusic();
      }
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
    markDirty(true);
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
    markDirty(true);
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

  function addArcadeWin(crystals, label) {
    state.resources.crystals += crystals;
    state.totals.arcadeWins++;
    state.minigames.streak++;
    markDirty(true);
    audio.play('reward');
    toast(`${label} complete`, `+${crystals} crystals`, 'gold');
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
    game.pattern = [Math.floor(Math.random() * 4)];
    game.input = [];
    game.accepting = false;
    ui.sequenceStart.disabled = true;
    ui.sequenceStatus.textContent = 'Reading signal…';
    await playSequence(token);
  }

  async function playSequence(token) {
    const game = runtime.sequence;
    if (token !== game.token) return;
    game.accepting = false;
    ui.sequenceStatus.textContent = `Watch wave ${game.pattern.length}`;
    await delay(450);
    for (const index of game.pattern) {
      if (token !== game.token) return;
      const button = ui.sequenceBoard.querySelector(`[data-sequence="${index}"]`);
      button.classList.add('active');
      audio.tone(320 + index * 110, 0.12, 'sine', 0.045, 40);
      await delay(290);
      button.classList.remove('active');
      await delay(105);
    }
    if (token !== game.token) return;
    game.input = [];
    game.accepting = true;
    ui.sequenceStatus.textContent = 'Repeat the pattern';
  }

  async function sequenceInput(index) {
    const game = runtime.sequence;
    if (!game.accepting) return;
    const button = ui.sequenceBoard.querySelector(`[data-sequence="${index}"]`);
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 130);
    audio.tone(320 + index * 110, 0.1, 'sine', 0.04, 35);
    const position = game.input.length;
    if (game.pattern[position] !== index) {
      game.accepting = false;
      game.token++;
      ui.sequenceStatus.textContent = `Signal lost at wave ${game.pattern.length}`;
      ui.sequenceStart.disabled = false;
      ui.sequenceStart.textContent = 'RESTART ARRAY';
      state.minigames.streak = 0;
      audio.play('fail');
      return;
    }
    game.input.push(index);
    if (game.input.length !== game.pattern.length) return;
    game.accepting = false;
    state.minigames.sequenceBest = Math.max(state.minigames.sequenceBest, game.pattern.length);
    addArcadeWin(Math.min(8, game.pattern.length), 'Echo Array');
    ui.sequenceStatus.textContent = 'Wave confirmed';
    game.pattern.push(Math.floor(Math.random() * 4));
    await delay(600);
    playSequence(game.token);
  }

  function pulseAction() {
    audio.ensure();
    const game = runtime.pulse;
    if (!game.active) {
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
        addArcadeWin(game.locks * 3, 'Pulse Lock');
      } else {
        state.minigames.streak = 0;
      }
    } else {
      randomizePulseTarget();
    }
  }

  function randomizePulseTarget() {
    runtime.pulse.width = randomBetween(11, 17);
    runtime.pulse.target = randomBetween(12, 88 - runtime.pulse.width);
    ui.pulseTarget.style.left = `${runtime.pulse.target}%`;
    ui.pulseTarget.style.width = `${runtime.pulse.width}%`;
  }

  function pulsePosition(time) {
    if (!runtime.pulse.active) return 0;
    const phase = ((time - runtime.pulse.startedAt) % 2100) / 2100;
    return phase < 0.5 ? phase * 200 : 200 - phase * 200;
  }

  function rollAura() {
    audio.ensure();
    ensureModifiers();
    if (state.rng.charge < 10) {
      toast('Scanner undercharged', 'Manual presses refill the capacitor.');
      return;
    }
    state.rng.charge -= 10;
    state.rng.scans++;
    state.rng.pity++;
    ui.rollAuraButton.disabled = true;
    ui.scannerAura.classList.add('scanning');
    ui.scannerAura.innerHTML = '<span>⋯</span><strong>SCANNING</strong><small>READING ENTROPY</small>';
    audio.tone(180, 0.65, 'sine', 0.04, 900);
    setTimeout(() => {
      let pool = AURAS;
      if (state.rng.pity >= 50) pool = AURAS.filter(aura => RARITY_RANK[aura.tier] >= RARITY_RANK.Rare);
      let aura;
      if (state.rng.scans % 250 === 0 && !state.rng.discovered.paradox) {
        aura = AURAS.find(item => item.id === 'paradox');
      } else {
        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;
        aura = pool.find(item => (roll -= item.weight) <= 0) || pool[0];
      }
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
      ui.scannerAura.style.setProperty('--aura-color', aura.color);
      ui.scannerAura.innerHTML = `<span style="color:${aura.color};border-color:${aura.color};box-shadow:0 0 32px ${aura.color}33">${aura.symbol}</span><strong>${aura.name.toUpperCase()}</strong><small style="color:${aura.color}">${aura.tier.toUpperCase()}</small>`;
      ui.rollAuraButton.disabled = false;
      markDirty(true);
      audio.play(RARITY_RANK[aura.tier] >= 3 ? 'reward' : 'buy');
    }, state.settings.motion === 'off' ? 10 : 850);
  }

  function equipAura(id) {
    if (!state.rng.discovered[id]) return;
    state.rng.equipped = state.rng.equipped === id ? null : id;
    markDirty(true);
    audio.play('buy');
  }

  function scheduleGolden() {
    ensureModifiers();
    const seconds = randomBetween(GOLDEN_MIN_SECONDS, GOLDEN_MAX_SECONDS) / mods.goldenFrequency;
    state.golden.nextAt = Date.now() + seconds * 1000;
    state.golden.activeUntil = 0;
    savePending = true;
  }

  function spawnGolden() {
    if (goldenElement || document.hidden) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'golden-button';
    button.setAttribute('aria-label', 'Catch golden signal');
    button.innerHTML = '<strong>✦</strong><small>15.0s</small>';
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = width < 620 ? 82 : 105;
    button.style.left = `${randomBetween(12, Math.max(13, width - margin))}px`;
    button.style.top = `${randomBetween(12, Math.max(13, height - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header')) - margin - 80))}px`;
    button.addEventListener('click', catchGolden, { once: true });
    ui.goldenLayer.appendChild(button);
    goldenElement = button;
    state.golden.activeUntil = Date.now() + 15000;
    logEvent('Golden signal detected', 'A radiant contact has entered the visible HUD layer.', 'gold');
    toast('Golden signal detected', 'Catch it before the frequency collapses.', 'gold');
  }

  function catchGolden() {
    if (!goldenElement) return;
    ensureModifiers();
    const caughtElement = goldenElement;
    state.totals.golden++;
    const baseReward = Math.max(250, currentBps * 180 + currentClickPower * 60);
    const reward = baseReward * mods.goldenReward;
    addButtons(reward);
    let surged = false;
    if (Math.random() < 0.45) {
      const buff = { id: `surge-${Date.now()}`, name: 'Radiant surge', mult: 2, until: Date.now() + 30000 };
      state.buffs.push(buff);
      surged = true;
    } else {
      state.resources.crystals += 3;
    }
    caughtElement.classList.add('leaving');
    setTimeout(() => caughtElement.remove(), 360);
    goldenElement = null;
    scheduleGolden();
    markDirty(true);
    audio.play('golden');
    logEvent('Golden signal captured', `Recovered ${formatNumber(reward)} buttons${surged ? ' and a radiant surge' : ' and 3 crystals'}.`, 'gold');
    toast('Golden signal captured', `+${formatNumber(reward)} buttons`, 'gold');
  }

  function expireGolden() {
    if (!goldenElement) return;
    const expiredElement = goldenElement;
    expiredElement.classList.add('leaving');
    setTimeout(() => expiredElement.remove(), 360);
    goldenElement = null;
    scheduleGolden();
    logEvent('Golden signal lost', 'The frequency collapsed before contact.', '');
  }

  function discoverSecret(id) {
    const secret = SECRETS.find(item => item.id === id);
    if (!secret || has(state.secrets.found, id)) return;
    state.secrets.found.push(id);
    state.resources.crystals += 5;
    markDirty(true);
    audio.play('golden');
    logEvent('Restricted signal recovered', `${secret.name} • Critical chance +2.5%`, 'rare');
    showReward(secret.name, '+2.5% CRITICAL', 'A secret route toward the 75% critical cap is now permanently active.');
  }

  function ascensionPotential() {
    return Math.floor(Math.sqrt(state.totals.runButtons / ASCENSION_THRESHOLD));
  }

  function ascend() {
    const gain = ascensionPotential();
    if (!gain) return;
    if (!window.confirm(`Collapse this cycle for ${gain} Reactor Core${gain === 1 ? '' : 's'}? Current buttons, towers, and normal upgrades will reset.`)) return;
    state.resources.cores += gain;
    state.totals.ascensions++;
    state.resources.buttons = state.ascension.nodes.starter * 100000;
    state.totals.runButtons = state.resources.buttons;
    for (const tower of TOWERS) state.towers[tower.id] = 0;
    state.upgrades = [];
    state.rng.charge = 0;
    state.buffs = [];
    combo = 0;
    scheduleGolden();
    markDirty(true);
    saveNow();
    audio.play('golden');
    logEvent('Cycle collapsed', `${gain} Reactor Core${gain === 1 ? '' : 's'} recovered. Permanent records remain.`, 'rare');
    showPage('core');
  }

  function buyCoreNode(id) {
    const node = CORE_NODES.find(item => item.id === id);
    if (!node) return;
    const level = state.ascension.nodes[id];
    const cost = node.baseCost + level * Math.max(1, Math.ceil(node.baseCost / 2));
    if (level >= node.max || state.resources.cores < cost) return;
    state.resources.cores -= cost;
    state.ascension.spentCores += cost;
    state.ascension.nodes[id]++;
    markDirty(true);
    audio.play('buy');
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
    if (id === 'achievements') renderAchievements();
    if (id === 'observatory') renderAuraCollection();
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
    item.innerHTML = `<span>${tone === 'gold' ? '✦' : '•'}</span><div><strong>${title}</strong><p>${text}</p></div>`;
    ui.toastStack.appendChild(item);
    setTimeout(() => {
      item.classList.add('out');
      setTimeout(() => item.remove(), 260);
    }, 3300);
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
    if (goldenElement) {
      const left = Math.max(0, (state.golden.activeUntil - Date.now()) / 1000);
      ui.goldenEta.textContent = `Signal live • ${left.toFixed(1)}s`;
      const timer = $('small', goldenElement);
      if (timer) timer.textContent = `${left.toFixed(1)}s`;
    } else {
      ui.goldenEta.textContent = `Next scan ~${formatDuration(Math.max(0, (state.golden.nextAt - Date.now()) / 1000))}`;
    }

    ui.chartRate.textContent = formatNumber(liveBps);
    ui.bestRate.textContent = `BEST ${formatNumber(state.totals.bestBps)}/s`;
    const previous = chartSamples.at(-2) || 0;
    const trend = previous > 0 ? (liveBps - previous) / previous : 0;
    ui.chartTrend.textContent = trend > 0.01 ? `▲ ${(trend * 100).toFixed(1)}%` : trend < -0.01 ? `▼ ${Math.abs(trend * 100).toFixed(1)}%` : 'STABLE';
    ui.chartTrend.style.color = trend < -0.01 ? 'var(--rose)' : 'var(--success)';

    ui.activeBuffs.innerHTML = state.buffs
      .filter(buff => buff.until > Date.now())
      .map(buff => `<span class="buff-chip"><b>×${buff.mult}</b> ${buff.name} • ${formatDuration((buff.until - Date.now()) / 1000)}</span>`)
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
    const status = ui.upgradeStatus?.value || 'available';
    let items = UPGRADES.filter(item => {
      if (upgradeCategory !== 'all' && item.category !== upgradeCategory) return false;
      if (search && !`${item.name} ${item.desc} ${item.effectText}`.toLowerCase().includes(search)) return false;
      const owned = has(state.upgrades, item.id);
      const unlocked = upgradeUnlocked(item);
      const affordable = state.resources.buttons >= item.cost;
      if (status === 'affordable') return !owned && unlocked && affordable;
      if (status === 'locked') return !owned && !unlocked;
      if (status === 'owned') return owned;
      if (status === 'all') return true;
      return !owned;
    });
    if (status === 'available') {
      items.sort((a, b) => {
        const rank = item => has(state.upgrades, item.id) ? 3 : !upgradeUnlocked(item) ? 2 : state.resources.buttons >= item.cost ? 0 : 1;
        return rank(a) - rank(b) || a.cost - b.cost;
      });
    }

    ui.upgradesGrid.innerHTML = items.map(item => {
      const owned = has(state.upgrades, item.id);
      const unlocked = upgradeUnlocked(item);
      const affordable = state.resources.buttons >= item.cost;
      const metric = upgradeUnlockMetric(item);
      const progress = clamp(metric.value / metric.target, 0, 1);
      const stateClass = owned ? 'owned' : !unlocked ? 'locked' : affordable ? 'affordable' : '';
      const buttonText = owned ? 'INSTALLED' : !unlocked ? 'LOCKED' : formatNumber(item.cost);
      return `
        <article class="upgrade-card ${stateClass}" data-upgrade="${item.id}" data-category="${item.category}">
          <div class="upgrade-icon">${item.icon}</div>
          <div class="upgrade-copy">
            <div class="upgrade-meta"><b>${item.category.toUpperCase()}</b><span>${unlocked ? 'AVAILABLE' : metric.label.toUpperCase()}</span></div>
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <span class="upgrade-effect">${item.effectText}</span>
          </div>
          <button class="upgrade-action" type="button" data-buy-upgrade="${item.id}" ${owned || !unlocked || !affordable ? 'disabled' : ''}>${buttonText}</button>
          ${!unlocked ? `<div class="lock-progress"><i style="width:${progress * 100}%"></i></div>` : ''}
        </article>`;
    }).join('');
    ui.upgradesEmpty.classList.toggle('hidden', items.length > 0);
    ui.upgradeSummary.textContent = `${items.length} modification${items.length === 1 ? '' : 's'} shown • ${UPGRADES.length - state.upgrades.length} remaining`;
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
        <div class="tower-icon">${tower.icon}</div>
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
      const value = achievementMetric(item);
      const complete = achievementComplete(item);
      const claimed = has(state.achievements.claimed, item.id);
      const progress = clamp(value / item.target, 0, 1);
      return `
        <article class="achievement-card ${complete ? 'complete' : ''} ${claimed ? 'claimed' : ''}" data-achievement="${item.id}">
          <div class="achievement-top"><span class="achievement-icon">${item.icon}</span><span class="achievement-state">${claimed ? 'CLAIMED' : complete ? 'READY TO CLAIM' : `${Math.floor(progress * 100)}%`}</span></div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="achievement-reward"><span>REWARD</span><b>${rewardLabel(item.reward)}</b></div>
          <div class="achievement-progress"><i style="width:${progress * 100}%"></i></div>
          ${complete && !claimed ? `<button class="achievement-claim" type="button" data-claim-achievement="${item.id}">CLAIM</button>` : ''}
        </article>`;
    }).join('');
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

  function renderAuraCollection() {
    const search = (ui.auraSearch?.value || '').trim().toLowerCase();
    const items = AURAS.filter(aura => !search || `${aura.name} ${aura.tier} ${aura.text}`.toLowerCase().includes(search));
    ui.auraCollection.innerHTML = items.map(aura => {
      const count = safeInt(state.rng.discovered[aura.id]);
      const equipped = state.rng.equipped === aura.id;
      return `
        <button class="aura-card ${count ? '' : 'locked'} ${equipped ? 'equipped' : ''}" type="button" data-aura="${aura.id}" style="--aura-color:${aura.color}" ${count ? '' : 'disabled'}>
          <span class="aura-orb">${count ? aura.symbol : '?'}</span>
          <strong>${count ? aura.name : 'Unknown'}</strong>
          <span>${count ? aura.tier : 'UNDISCOVERED'}${count > 1 ? ` ×${count}` : ''}</span>
          <small>${count ? aura.text : 'Continue scanning to reveal this frequency.'}</small>
        </button>`;
    }).join('');
    const count = discoveredAuraCount();
    ui.auraProgress.textContent = `${count} / ${AURAS.length}`;
    ui.auraProgressFill.style.width = `${count / AURAS.length * 100}%`;
  }

  function updateRngUi() {
    const count = discoveredAuraCount();
    ui.rngChargeText.textContent = `${Math.floor(state.rng.charge)} / 100`;
    ui.rngChargeFill.style.width = `${state.rng.charge}%`;
    ui.rollAuraButton.disabled = state.rng.charge < 10 || ui.scannerAura.classList.contains('scanning');
    ui.pityText.textContent = state.rng.pity >= 50 ? 'Rare guarantee armed' : `Rare guarantee in ${50 - state.rng.pity} scans`;
    const aura = AURAS.find(item => item.id === state.rng.equipped);
    if (aura) {
      ui.equippedAura.innerHTML = `<span style="color:${aura.color};border-color:${aura.color}">${aura.symbol}</span><div><strong>${aura.name}</strong><small>${aura.text}</small></div>`;
    } else {
      ui.equippedAura.innerHTML = '<span>∅</span><div><strong>None</strong><small>No passive modifier</small></div>';
    }
    const recent = state.rng.recent.length ? state.rng.recent : Array(12).fill(0);
    ui.luckBars.innerHTML = recent.map(rank => `<i style="height:${8 + rank * 14}%"></i>`).join('');
    const average = state.rng.recent.length ? state.rng.recent.reduce((sum, value) => sum + value, 0) / state.rng.recent.length : 0;
    ui.luckGrade.textContent = average >= 4 ? 'S' : average >= 3 ? 'A' : average >= 2 ? 'B' : 'C';
    ui.luckAnalysis.textContent = state.rng.scans
      ? `${formatNumber(state.rng.scans)} scans • ${count} unique • ${state.rng.pity} current pity`
      : 'Start scanning to build a probability profile.';
  }

  function renderCoreTree() {
    ui.coreTree.innerHTML = CORE_NODES.map(node => {
      const level = state.ascension.nodes[node.id];
      const cost = node.baseCost + level * Math.max(1, Math.ceil(node.baseCost / 2));
      const maxed = level >= node.max;
      return `
        <article class="core-node ${maxed ? 'maxed' : ''}">
          <h3>${node.name}</h3>
          <p>${node.desc}</p>
          <div class="core-node-footer"><span>LEVEL ${level} / ${node.max}</span><button type="button" data-core-node="${node.id}" ${maxed || state.resources.cores < cost ? 'disabled' : ''}>${maxed ? 'MAXED' : `${cost} CORE${cost === 1 ? '' : 'S'}`}</button></div>
        </article>`;
    }).join('');
  }

  function updateAscensionUi() {
    const gain = ascensionPotential();
    ui.ascensionCount.textContent = formatNumber(state.totals.ascensions, 0);
    ui.ascensionGain.textContent = formatNumber(gain, 0);
    ui.availableCores.textContent = formatNumber(state.resources.cores, 0);
    ui.ascendButton.disabled = gain < 1;
    ui.ascensionRequirement.textContent = gain
      ? `Collapse ${formatNumber(state.totals.runButtons)} run buttons into permanent power.`
      : `${formatNumber(Math.max(0, ASCENSION_THRESHOLD - state.totals.runButtons))} more run buttons for the first core.`;
  }

  function renderCritDialog() {
    const progress = criticalProgress();
    ui.critDialogValue.textContent = `${(progress.chance * 100).toFixed(2)}%`;
    ui.critDialogFill.style.width = `${progress.chance / CRIT_CAP * 100}%`;
    ui.critSources.innerHTML = progress.groups.map(group => `
      <div class="crit-source ${group.done === group.total ? 'done' : ''}">
        <span>${group.done === group.total ? '✓' : group.icon}</span>
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
      ['Aura scans', formatNumber(state.rng.scans)],
      ['Auras found', `${discoveredAuraCount()} / ${AURAS.length}`],
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
    ui.arcadeWins.textContent = `${formatNumber(state.totals.arcadeWins)} wins`;
    ui.arcadeStreak.textContent = state.minigames.streak ? `${state.minigames.streak} trial streak` : 'No active streak';
    const reaction = state.minigames.reactionBest;
    ui.reactionBest.textContent = reaction == null ? 'BEST —' : `BEST ${Math.round(reaction)}MS`;
    ui.reactionRecord.textContent = reaction == null ? 'NO RECORD' : `${Math.round(reaction)} MS`;
    ui.sequenceBest.textContent = `BEST ${state.minigames.sequenceBest}`;
    ui.sequenceWave.textContent = runtime.sequence.pattern.length || 0;
    ui.pulseBest.textContent = state.minigames.pulseBest == null ? 'BEST —' : `BEST ${state.minigames.pulseBest}%`;
    ui.pulseLocks.textContent = `${runtime.pulse.locks} / 3`;
  }

  function updateCritAndAchievementBadges() {
    const stats = getAchievementStats();
    ui.achievementNavBadge.textContent = stats.claimable.length;
    ui.achievementNavBadge.classList.toggle('hidden', !stats.claimable.length);
    const affordable = UPGRADES.filter(item => !has(state.upgrades, item.id) && upgradeUnlocked(item) && state.resources.buttons >= item.cost).length;
    ui.upgradeNavBadge.textContent = affordable;
    ui.upgradeNavBadge.classList.toggle('hidden', !affordable);
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
        <span>${item.icon}</span><div><strong>${item.title}</strong><small>${item.sub}</small></div><kbd>${item.key}</kbd>
      </button>`).join('');
  }

  function openCommand() {
    renderCommandResults();
    if (!ui.commandDialog.open) ui.commandDialog.showModal();
    setTimeout(() => ui.commandSearch.focus(), 20);
  }

  function applySettings() {
    ui.soundVolume.value = Math.round(state.settings.sound * 100);
    ui.soundVolumeOutput.textContent = `${Math.round(state.settings.sound * 100)}%`;
    ui.musicVolume.value = Math.round(state.settings.music * 100);
    ui.musicVolumeOutput.textContent = `${Math.round(state.settings.music * 100)}%`;
    ui.motionSetting.value = state.settings.motion;
    ui.numberFormat.value = state.settings.numberFormat;
    document.body.classList.toggle('motion-reduced', state.settings.motion === 'reduced');
    document.body.classList.toggle('motion-off', state.settings.motion === 'off');
    ui.soundIcon.textContent = state.settings.sound || state.settings.music ? '♪' : '×';
    ui.soundButton.setAttribute('aria-label', state.settings.sound || state.settings.music ? 'Mute sound' : 'Restore sound');
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
    ui.upgradeStatus.addEventListener('change', renderUpgrades);

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

    ui.rollAuraButton.addEventListener('click', rollAura);
    ui.auraSearch.addEventListener('input', renderAuraCollection);
    ui.ascendButton.addEventListener('click', ascend);

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
      ui.soundIcon.textContent = state.settings.sound || state.settings.music ? '♪' : '×';
      savePending = true;
      audio.ensure();
      audio.play('click');
    });
    ui.musicVolume.addEventListener('input', () => {
      state.settings.music = Number(ui.musicVolume.value) / 100;
      ui.musicVolumeOutput.textContent = `${ui.musicVolume.value}%`;
      audio.ensure();
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
        if (state.golden.nextAt < Date.now() && !goldenElement) state.golden.nextAt = Date.now() + 3000;
      }
    });
    window.addEventListener('beforeunload', saveNow);
    window.addEventListener('resize', drawChart, { passive: true });
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
      state.totals.playSeconds += Math.min(dt, 1);
      state.totals.bestBps = Math.max(state.totals.bestBps, currentBps * activeBuffMultiplier());
    }
    state.buffs = state.buffs.filter(buff => buff.until > wallNow);

    if (time - lastManualPress > 650 && combo > 0) combo = Math.max(0, combo - dt * 5);
    if (runtime.pulse.active) ui.pulseMarker.style.left = `${pulsePosition(time)}%`;

    if (!goldenElement && wallNow >= state.golden.nextAt) spawnGolden();
    if (goldenElement && wallNow >= state.golden.activeUntil) expireGolden();

    if (time - lastUiUpdate >= 100) {
      lastUiUpdate = time;
      updateTopUi();
      updateRngUi();
      updateAscensionUi();
      renderArcade();
    }

    if (time - lastHeavyUpdate >= 650) {
      lastHeavyUpdate = time;
      updateObjective();
      updateTowerList();
      updateCritAndAchievementBadges();
      if (state.ui.page === 'system') renderSystemStats();
      if (state.ui.page === 'achievements') renderAchievements();
      if (state.ui.page === 'upgrades') renderUpgrades();
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
    showPage(state.ui.page);
    $$('[data-buy-mode]').forEach(button => button.classList.toggle('active', button.dataset.buyMode === buyMode));

    logEvent('Reactor v2.0 online', 'Progression, controls, audio, and visible golden-signal receiver initialized.', 'good');
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
