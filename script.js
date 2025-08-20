/* Button Clicker v3.0.2 — Robust loader (no infinite load), safe init, improved saves, timing minigame, anti-hold-Enter */
(() => {
  'use strict';

  const GAME_VERSION = '0.8.7';
  const SAVE_KEY = 'button_clicker_save_v0.8.7';
  const LEGACY_KEYS = ['button_clicker_save_v0.8.6'];

  
  const WIPE_BASELINE = 6; // bump this when you need to run another one-time wipe in the future
  const WIPE_PENDING_KEY = SAVE_KEY + '.wipeOnce.' + WIPE_BASELINE + '.pending';
  const WIPE_DONE_KEY    = SAVE_KEY + '.wipeOnce.' + WIPE_BASELINE + '.done';

  // Funny loading tips (your updated list)
  const LOADING_TIPS = [
    'Tip: Buttons love to be pressed twice.',
    'Tip: Golden Buttons prefer the corner of your eye.',
    'Hint: Minigames unlock as your empire grows.',
    'Pro tip: Research stacks with upgrades. Synergy!',
    'Lore: The Button hums when you press in rhythm.',
    'Rumor: 7 is a lucky number.',
    'Tip: Ascension resets the run, but not your wisdom.',
    'Hint: Enter a certain pattern to unveil a secret shop.',
    'Tip: Timing bar likes steady hands.',
    'Tip: Type-O-Tron judges typos gently. Mostly.',
    'Hint: Button Bash benefits from finger stretches.',
    'Lore: The Button remembers you after ascension.',
    'Tip: Bulk buy can be toggled to +1, +10, or Max.',
    'Hint: Heavenly upgrades are forever.',
    'Tip: Workshops admire Labs. Labs are flattered.',
    'Tip: Press 1–9 to quick-buy towers; add Shift for +10, Alt for Max.',
    'Hint: Achievements grant permanent global bonuses.',
    'Pro tip: Save and export often; backups love you back.',
    'Tip: Autosave interval can be changed in Options.',
    'Lore: Somewhere, a Bot dreams of being clicked.',
    'Tip: Crits happen. More chance means more sparkle.',
    'Hint: Daily Blessing returns every 24 hours.',
    'Tip: Golden Glare makes rare buttons appear longer.',
    'Pro tip: Momentum grows with each ascension—stack it.',
    'Hint: Auto-Press turns click power into passive income.',
    'Tip: Sequence starts easy; watch, then mimic.',
    'Tip: Reaction Rush punishes early clicks. Wait for the cue.',
    'Rumor: The title likes attention. Seven taps worth.',
    'Lore: Labs ask questions; Temples wait for answers.',
    'Tip: Synergies boost Click Bots with Servers and Workshops with Labs.',
    'Pro tip: Frugality research lowers building costs.',
    'Hint: Focus research raises base click power.',
    'Tip: Overclock and friends multiply everything.',
    'Tip: You can import saves from the clipboard.',
    'Hint: Golden Buttons can appear anywhere on the screen.',
    'Lore: The Button counts even when you don\'t look.',
    'Tip: Buffs stack multiplicatively. Short and sweet.',
    'Pro tip: Build many cheap towers to unlock early upgrades.',
    'Hint: Some upgrades require tower counts; check their cards.',
    'Tip: Achievements unlock automatically—no need to claim.',
    'Hint: Research costs scale with level—plan your crystals.',
    'Hint: The lore grows as your empire evolves.',
    'Tip: Reduce motion in settings if your eyes prefer calm.',
    'Pro tip: Heavenly Clicks scale with lifetime buttons—push farther before ascending.',
    'Tip: Secret Shop whispers louder after certain discoveries.',
    'Lore: Beyond the Portal, buttons press back.',
  ];

  // Core definitions
  const TOWERS = [
    { id: 'clickbot', name: 'Click Bot', emoji: '🤖', baseCost: 15, costMult: 1.15, baseProd: 0.1 },
    { id: 'workshop', name: 'Workshop', emoji: '🧰', baseCost: 100, costMult: 1.15, baseProd: 1 },
    { id: 'server', name: 'Server Farm', emoji: '🖥️', baseCost: 1100, costMult: 1.15, baseProd: 8 },
    { id: 'lab', name: 'Research Lab', emoji: '🧪', baseCost: 12000, costMult: 1.15, baseProd: 47 },
    { id: 'factory', name: 'Auto Factory', emoji: '🏭', baseCost: 130000, costMult: 1.15, baseProd: 260 },
    { id: 'temple', name: 'Button Temple', emoji: '⛩️', baseCost: 1400000, costMult: 1.15, baseProd: 1400 },
    { id: 'shrine', name: 'Button Shrine', emoji: '🕉️', baseCost: 5000000, costMult: 1.15, baseProd: 4400 },
    { id: 'portal', name: 'Quantum Portal', emoji: '🌀', baseCost: 20000000, costMult: 1.15, baseProd: 7800 },
    { id: 'dimension', name: 'Dimensional Gateway', emoji: '🌌', baseCost: 100000000, costMult: 1.15, baseProd: 15000 },
    { id: 'aicore', name: 'AI Core', emoji: '🧠', baseCost: 500000000, costMult: 1.15, baseProd: 44000 },
    { id: 'neuralnet', name: 'Neural Network', emoji: '🕸️', baseCost: 1200000000, costMult: 1.15, baseProd: 108800 },
    { id: 'forge', name: 'Quantum Forge', emoji: '⚛️', baseCost: 5000000000, costMult: 1.15, baseProd: 260000 },
    { id: 'singularity', name: 'Singularity Core', emoji: '🕳️', baseCost: 20000000000, costMult: 1.15, baseProd: 780000 },
    { id: 'you', name: 'You', emoji: '👤', baseCost: 77357129368, costMult: 1.83, baseProd: 12989471 }
  ];

  function u(id,name,desc,cost,effect,cond,icon='⚙️'){ return { id, name, desc, cost, effect, cond, icon }; }
  function a(id,name,desc,cond,bonus){ return { id, name, desc, cond, bonus }; }

  const UPGRADES = [
    u('click1', 'Polished Button',        'Base click power +1',          50,      s => { s.clickBase += 1; },  s => true, '🔘'),
    u('click2', 'Ergonomic Press',        'Base click power +4',          500,     s => { s.clickBase += 4; },  s => s.upgradesPurchased.includes('click1'), '🫳'),
    u('click3', 'Quantum Tap',            'Double click power',           5000,    s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click2'), '✨'),
    u('click4', 'Hyper Tap',              'Double click power',           25000,   s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click3'), '⚡'),
    u('click5', 'Singularity Press',      'Double click power',           250000,  s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click4'), '🕳️'),
    u('click6',  'Quantum Rhythm',        'Double click power',           1e6,     s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click5')  && s.totalManaEarned >= 1e6,      '🎵'),
    u('click7',  'Precision Grip',        'Base click power +25',         5e6,     s => { s.clickBase += 25; }, s => s.upgradesPurchased.includes('click6')  && s.totalClicks      >= 500,    '🫳'),
    u('click8',  'Resonant Tap',          'Double click power',           2e7,     s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click7')  && s.totalManaEarned >= 5e6,      '✨'),
    u('click9',  'Transdimensional Press','Double click power',           1e8,     s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click8')  && s.totalClicks      >= 5000,   '🌀'),
    u('click10', 'Cosmic Push',           'Base click power +250',        4e8,     s => { s.clickBase += 250; },s => s.upgradesPurchased.includes('click9')  && s.totalManaEarned >= 1e8,      '🌌'),
    u('click11', 'Singular Pulse',        'Double click power',           2e9,     s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click10') && s.totalClicks      >= 10000,  '⚡'),
    u('click12', 'Harmonic Cascade',      'Double click power',           1e10,    s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click11') && s.totalManaEarned >= 1e10,     '🔊'),
    u('click13', 'Apex Strike',           'Base click power +1000',       6e10,    s => { s.clickBase += 1000; },s => s.upgradesPurchased.includes('click12') && s.totalClicks      >= 100000, '💥'),
    u('click14', 'Omega Tap',             'Double click power',           3e11,    s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click13') && s.totalManaEarned >= 1e12,     '🪐'),
    u('click15', 'Final Press',           'Double click power',           1.5e12,  s => { s.clickMult *= 2; },  s => s.upgradesPurchased.includes('click14') && s.totalClicks      >= 1000000,'🏁'),
    u('click16', 'Stellar Press',            'Click power x3',    5e13,   s => { s.clickMult *= 3; },  s => s.upgradesPurchased.includes('click15') && s.totalManaEarned >= 1e13, '🌌'),
    u('click17', 'Nova Touch',               'Click power x5',    2e14,   s => { s.clickMult *= 5; },  s => s.upgradesPurchased.includes('click16') && s.totalClicks >= 1000000,        '💥'),
    u('click18', 'Event Horizon',            'Click power x10',   1e15,   s => { s.clickMult *= 10; }, s => s.upgradesPurchased.includes('click17') && s.totalManaEarned >= 1e15, '🕳️'),
    u('click19', 'Omega Pulse',              'Click power x10',   5e15,   s => { s.clickMult *= 10; }, s => s.upgradesPurchased.includes('click18') && s.totalClicks >= 1e3,        '🪐'),
    u('click20', 'Apotheosis Tap',           'Click power x20',   2e16,   s => { s.clickMult *= 20; }, s => s.upgradesPurchased.includes('click19') && s.totalManaEarned >= 1e16, '🔱'),
    u('click21', 'Mythic Resonance',         'Click power x25',   1e17,   s => { s.clickMult *= 25; }, s => s.upgradesPurchased.includes('click20') && s.totalClicks >= 2e4,        '🌠'),
    u('click22', 'Transcendent Impact',      'Click power x50',   4e17,   s => { s.clickMult *= 50; }, s => s.upgradesPurchased.includes('click21') && s.totalManaEarned >= 5e17, '🧬'),
    u('click23', 'Cosmic Compression',       'Click power x100',  1e18,   s => { s.clickMult *= 100; },s => s.upgradesPurchased.includes('click22') && s.totalManaEarned >= 1e18, '🌀'),
    u('click24', 'Singularity Lattice',      'Click power x250',  4e18,   s => { s.clickMult *= 250; },s => s.upgradesPurchased.includes('click23') && s.totalClicks >= 1e5,        '🧊'),
    u('click25', 'Finale: True Press',       'Click power x500',  1e19,   s => { s.clickMult *= 500; },s => s.upgradesPurchased.includes('click24') && s.totalManaEarned >= 1e19, '🏆'),

    // Critical upgrades
    u('crit1', 'Lucky Groove', '+2% crit chance', 10000, s => { s.critChance += 0.02; }, s => s.totalClicks >= 100, '🍀'),
    u('crit2', 'Golden Rim', '+3% crit chance', 100000, s => { s.critChance += 0.03; }, s => s.upgradesPurchased.includes('crit1') && s.totalClicks >= 1000, '🥇'),
    u('crit3', 'Starstruck',      '+3% crit chance',  1e6,   s => { s.critChance += 0.03; }, s => s.upgradesPurchased.includes('crit2') && s.totalClicks >= 5000,  '🌠'),
    u('crit4', 'Fortunate Fate',  '+4% crit chance',  1e8,   s => { s.critChance += 0.04; }, s => s.upgradesPurchased.includes('crit3') && s.totalClicks >= 50000, '✨'),
    u('crit5', 'Destiny’s Edge',  '+5% crit chance',  1e10,  s => { s.critChance += 0.05; }, s => s.upgradesPurchased.includes('crit4') && s.totalClicks >= 250000, '💫'),

    // Global upgrades
    u('global1', 'Efficient Logistics', 'All production +25%', 1000, s => { s.globalMult *= 1.25; }, s => s.totalManaEarned >= 500, '🚚'),
    u('global2', 'Temporal Sync', 'All production +35%', 10000, s => { s.globalMult *= 1.35; }, s => s.totalManaEarned >= 5000, '🌀'),
    u('global3', 'Overclock', 'All production +50%', 250000, s => { s.globalMult *= 1.5; }, s => totalTowers(s) >= 100, '🧭'),
    u('global4', 'Cold Fission', 'All production +100%', 5e7, s => { s.globalMult *= 2; }, s => s.towers.forge.count >= 1, '❄️'),

    // Synergy upgrades
    u('syn1', 'Workshop x Lab', 'Workshops +1% per Lab', 20000, s => { s.synergy.workshopPerLab += 0.01; }, s => s.towers.workshop.count >= 25 && s.towers.lab.count >= 1, '🔗'),
    u('syn2', 'Clickbot x Server', 'Click Bots +2% per Server', 25000, s => { s.synergy.clickbotPerServer += 0.02; }, s => s.towers.clickbot.count >= 25 && s.towers.server.count >= 1, '🔗'),

    // Secret upgrades
    u('secret1', 'Whispered Oath', 'All production +10% (unlock via Secret Shop)', 1e6, s => { s.globalMult *= 1.1; }, s => state.secrets.secretShopUnlocked, '🕯️'),

    // Click Bot tiers
    u('clickbot1', 'Oil the Bots', 'Click Bots produce 2x', 200, s => { s.towerMult.clickbot *= 2; }, s => s.towers.clickbot.count >= 10, '🤖'),
    u('clickbot2', 'Firmware Recompile', 'Click Bots produce 2x', 4e3, s => { s.towerMult.clickbot *= 2; }, s => s.upgradesPurchased.includes('clickbot1') && s.towers.clickbot.count >= 50, '📀'),
    u('clickbot3', 'Servo Swarm',        'Click Bots produce 2x',  8e5,    s => { s.towerMult.clickbot *= 2; }, s => s.upgradesPurchased.includes('clickbot2') && s.towers.clickbot.count >= 200, '🤖'),
    u('clickbot4', 'Nanobot Cloud',      'Click Bots produce 2x',  2e7,    s => { s.towerMult.clickbot *= 2; }, s => s.upgradesPurchased.includes('clickbot3') && s.towers.clickbot.count >= 800,  '☁️'),

    // Workshop tiers
    u('workshop1', 'Better Tools', 'Workshops produce 2x', 1100, s => { s.towerMult.workshop *= 2; }, s => s.towers.workshop.count >= 10, '🧰'),
    u('workshop2', 'CNC Everywhere', 'Workshops produce 2x', 8e4, s => { s.towerMult.workshop *= 2; }, s => s.upgradesPurchased.includes('workshop1') && s.towers.workshop.count >= 50, '🛠️'),
    u('workshop3', 'Quantum Fixtures',   'Workshops produce 2x',   1.6e6,  s => { s.towerMult.workshop *= 2; }, s => s.upgradesPurchased.includes('workshop2') && s.towers.workshop.count >= 200, '🛠️'),
    u('workshop4', 'Auto-Fab Lines',     'Workshops produce 2x',   4e7,    s => { s.towerMult.workshop *= 2; }, s => s.upgradesPurchased.includes('workshop3') && s.towers.workshop.count >= 800, '🏭'),

    // Server Farm tiers
    u('server1', 'Fiber Backbone', 'Servers produce 2x', 12000, s => { s.towerMult.server *= 2; }, s => s.towers.server.count >= 10, '🖥️'),
    u('server2',   'Liquid Cooling',     'Servers produce 2x',     2.5e6,  s => { s.towerMult.server *= 2; },   s => s.towers.server.count >= 50,  '💧'),
    u('server3',   'Edge Mesh',          'Servers produce 2x',     6e7,    s => { s.towerMult.server *= 2; },   s => s.upgradesPurchased.includes('server2') && s.towers.server.count >= 200, '🛰️'),

    // Research Lab tiers
    u('lab1', 'Quantum Catalysts', 'Labs produce 2x', 130000, s => { s.towerMult.lab *= 2; }, s => s.towers.lab.count >= 10, '🧪'),
    u('lab2',      'Parallel Trials',    'Labs produce 2x',        3.5e7,  s => { s.towerMult.lab *= 2; },      s => s.towers.lab.count >= 25,    '🧪'),
    u('lab3',      'Quantum Pipelines',  'Labs produce 2x',        9e8,    s => { s.towerMult.lab *= 2; },      s => s.upgradesPurchased.includes('lab2') && s.towers.lab.count >= 100, '🧬'),

    // Auto Factory tiers
    u('factory1', 'Assembly Drones', 'Factories produce 2x', 1400000, s => { s.towerMult.factory *= 2; }, s => s.towers.factory.count >= 10, '🏭'),
    u('factory2',  'Robotic Arms',       'Factories produce 2x',   4e8,    s => { s.towerMult.factory *= 2; },  s => s.towers.factory.count >= 20, '🦾'),
    u('factory3',  'Self-Healing Lines', 'Factories produce 2x',   1.2e10, s => { s.towerMult.factory *= 2; },  s => s.upgradesPurchased.includes('factory2') && s.towers.factory.count >= 80, '🧱'),

    // Temple tiers
    u('temple1', 'Faithful Fingers', 'Temples produce 2x', 2e7, s => { s.towerMult.temple *= 2; }, s => s.towers.temple.count >= 10, '⛩️'),
    u('temple2',   'Chorus of Clicks',   'Temples produce 2x',     8e8,    s => { s.towerMult.temple *= 2; },   s => s.upgradesPurchased.includes('temple1') && s.towers.temple.count >= 5, '🎶'),
    u('temple3',   'Sacred Rhythm',      'Temples produce 2x',     2.2e10, s => { s.towerMult.temple *= 2; },   s => s.upgradesPurchased.includes('temple2') && s.towers.temple.count >= 20, '🔱'),

    // Portal tiers
    u('portal1', 'Dimensional Harmony', 'Portals produce 2x', 3e8, s => { s.towerMult.portal *= 2; }, s => s.towers.portal.count >= 10, '🌀'),
    u('portal2',   'Event Horizon',      'Portals produce 2x',     9e9,    s => { s.towerMult.portal *= 2; },   s => s.upgradesPurchased.includes('portal1') && s.towers.portal.count >= 10, '🌀'),
    u('portal3',   'Multi-Reality Mesh', 'Portals produce 2x',     2.5e11, s => { s.towerMult.portal *= 2; },   s => s.upgradesPurchased.includes('portal2') && s.towers.portal.count >= 25, '🌌'),

    // AI Core tiers
    u('aicore1', 'Self-Optimizing Nets', 'AI Cores produce 2x', 5e9, s => { s.towerMult.aicore *= 2; }, s => s.towers.aicore.count >= 10, '🧠'),
    u('aicore2',   'Meta-Learning',      'AI Cores produce 2x',    1.5e10, s => { s.towerMult.aicore *= 2; },   s => s.upgradesPurchased.includes('aicore1') && s.towers.aicore.count >= 10, '🧠'),
    u('aicore3',   'Emergent Design',    'AI Cores produce 2x',    4e11,   s => { s.towerMult.aicore *= 2; },   s => s.upgradesPurchased.includes('aicore2') && s.towers.aicore.count >= 25, '🤖'),

    // Forge tiers
    u('forge1', 'Coherent Lattices', 'Forges produce 2x', 7e10, s => { s.towerMult.forge *= 2; }, s => s.towers.forge.count >= 10, '⚛️'),
    u('forge2',    'Muon Hammers',       'Forges produce 2x',      2.4e11, s => { s.towerMult.forge *= 2; },    s => s.upgradesPurchased.includes('forge1') && s.towers.forge.count >= 10, '🔨'),
    u('forge3',    'Stellar Lattices',   'Forges produce 4x',      7e12,   s => { s.towerMult.forge *= 4; },    s => s.upgradesPurchased.includes('forge2') && s.towers.forge.count >= 25, '✨'),

    // Singularity tiers
    u('singularity1', 'Event Horizon', 'Singularities produce 2x', 1e11, s => { s.towerMult.singularity *= 2; }, s => s.towers.singularity.count >= 10, '🕳️'),
    u('singularity2', 'Black Hole', 'Singularities produce 2x', 3e12, s => { s.towerMult.singularity *= 2; }, s => s.upgradesPurchased.includes('singularity1') && s.towers.singularity.count >= 20, '🕳️'),
    u('singularity3', 'Gravitational Collapse', 'Singularities produce 2x', 1e13, s => { s.towerMult.singularity *= 2; }, s => s.upgradesPurchased.includes('singularity2') && s.towers.singularity.count >= 30, '🕳️'),
    u('singularity4', 'Cosmic Singularity', 'Singularities produce 5x', 5e14, s => { s.towerMult.singularity *= 5; }, s => s.upgradesPurchased.includes('singularity3') && s.towers.singularity.count >= 50, '🌌'),

    // You tiers
    u('you1', 'Self-Actualization', 'You produce 2x', 1e12, s => { s.towerMult.you *= 2; }, s => s.towers.you.count >= 10, '👤'),
    u('you2', 'Transcendence', 'You produce 2x', 3e13, s => { s.towerMult.you *= 2; }, s => s.upgradesPurchased.includes('you1') && s.towers.you.count >= 20, '👤'),
    u('you3', 'Cosmic Awareness', 'You produce 2x', 1e14, s => { s.towerMult.you *= 2; }, s => s.upgradesPurchased.includes('you2') && s.towers.you.count >= 30, '👤'),
    u('you4', 'Universal Harmony', 'You produce 3x', 5e14, s => { s.towerMult.you *= 3; }, s => s.upgradesPurchased.includes('you3') && s.towers.you.count >= 50, '👤'),
    u('you5', 'Transcendent Being', 'You produce 5x', 1e15, s => { s.towerMult.you *= 5; }, s => s.upgradesPurchased.includes('you4') && s.towers.you.count >= 100, '👤'),
    u('you6', 'Omnipotent Presence', 'You produce 100x', 5e15, s => { s.towerMult.you *= 100; }, s => s.upgradesPurchased.includes('you5') && s.towers.you.count >= 200, '👤')
  ];

  const RESEARCH = [
    { id: 'automation', name: 'Automation', desc: '+3% global production per level', max: 12, baseCost: 2 },
    { id: 'focus', name: 'Focused Mind', desc: '+1 base click power per level', max: 20, baseCost: 1 },
    { id: 'frugality', name: 'Frugality', desc: '-1% tower cost per level', max: 20, baseCost: 3 },
    { id: 'hyperfocus',     name: 'Hyperfocus',       desc: '+2 base click power per level',            max: 25, baseCost: 6 },
    { id: 'critStudy',      name: 'Critical Study',   desc: '+0.2% crit chance per level',              max: 20, baseCost: 8 },
    { id: 'critPower',      name: 'Kinetic Analysis', desc: '+0.5 crit multiplier per level',           max: 30, baseCost: 10 },
    { id: 'globalTuning',   name: 'Global Tuning',    desc: '+2% global production per level',          max: 25, baseCost: 9 },
    { id: 'synergyTuning',  name: 'Synergy Tuning',   desc: '+0.005 to both tower synergies per level', max: 15, baseCost: 12 },
  ];

  function researchMax(id) {
    const base = (RESEARCH.find(x => x.id === id)?.max) || 0;
    const t = state.prestige.tree || {};
    let extra = 0;
  
    // Caps for original research
    if (id === 'automation') {
      if (t.capAuto1) extra += 5;
      if (t.capAuto2) extra += 10;
    }
    if (id === 'focus') {
      if (t.capFocus1) extra += 5;
      if (t.capFocus2) extra += 10;
    }
    if (id === 'frugality') {
      if (t.capFrugal1) extra += 5;
      if (t.capFrugal2) extra += 10;
    }
  
    // Caps for new research
    if (id === 'hyperfocus'    && t.capHyperfocus)     extra += 10;
    if (id === 'critStudy'     && t.capCritStudy)      extra += 10;
    if (id === 'critPower'     && t.capCritPower)      extra += 10;
    if (id === 'globalTuning'  && t.capGlobalTuning)   extra += 10;
    if (id === 'synergyTuning' && t.capSynergyTuning)  extra += 5;
  
    return base + extra;
  }

  const SECRET_SHOP = [
    { id: 'dailyBless', name: 'Chrono Blessing', desc: 'Claim +5% global (24h) once per day', cost: 0, daily: true },
    { id: 'secret1', name: 'Whispered Oath', desc: 'Unlocks secret upgrade "Whispered Oath"', cost: 9 },
    { id: 'secretClick',     name: 'Gilded Finger',     desc: 'Click power x2 (permanent)',                 cost: 25 },
    { id: 'secretGlobal2',   name: 'Hidden Engine',     desc: 'Global production +20% (permanent)',        cost: 20 },
    { id: 'secretCritChance',name: 'Four-Leaf Circuit', desc: 'Crit chance +5% (permanent)',               cost: 18 },
    { id: 'secretCritMult',  name: 'Kinetic Lattice',   desc: 'Crit multiplier +2x (permanent)',           cost: 22 },
    { id: 'secretSynergy',   name: 'Resonance Pact',    desc: 'Both synergies +0.02 (permanent)',          cost: 24 },
    { id: 'secretGolden',    name: 'Golden Zeal',       desc: 'Golden Button boost 25% stronger',          cost: 28 },
    { id: 'secretAutopress', name: 'Spirit Auto-Press', desc: 'Passive clicks +0.25x click power',         cost: 26 },
    { id: 'secretOffline',   name: 'Temporal Echoes',   desc: 'Offline earnings improved to 30% rate',      cost: 30 }
  ];

  const TREE = [
    { id:'starter',        name:'Starter Kit',         icon:'🎒', cost:3,  desc:'Start each run with 1,000 buttons.', prereq:[] },
    { id:'engineer',       name:'Engineer Kit',        icon:'🧷', cost:3,  desc:'Start with 1 Click Bot.',            prereq:['starter'] },
    { id:'grant',          name:'Research Grant',      icon:'🎓', cost:4,  desc:'Start with +3 Crystals.',            prereq:['starter'] },
  
    { id:'overclocker',    name:'Heavenly Overclocker',icon:'🛠️', cost:6,  desc:'Global production +10%.',            prereq:[] },
    { id:'clickMastery',   name:'Click Mastery',       icon:'🖱️', cost:7,  desc:'Click power x2.',                    prereq:['overclocker'] },
    { id:'luckyAura',      name:'Lucky Aura',          icon:'🍀', cost:7,  desc:'Crit chance +5%.',                   prereq:['overclocker'] }, // effect unchanged (existing)
  
    { id:'frugalMind',     name:'Frugal Mind',         icon:'🪙', cost:5,  desc:'Buildings cost -2%.',                prereq:[] },
    { id:'momentum',       name:'Momentum',            icon:'🏁', cost:5,  desc:'+5% global per ascension (cap 50%).',prereq:['frugalMind'] },
  
    { id:'goldenGlare',    name:'Golden Glare',        icon:'🌟', cost:2,  desc:'Golden Button lasts longer.',        prereq:[] },
    { id:'minigameScholar',name:'Minigame Scholar',    icon:'🎮', cost:5,  desc:'Minigames give +1 extra Crystal.',   prereq:[] },
  
    { id:'lorekeeper',     name:'Lorekeeper',          icon:'📜', cost:4,  desc:'Unlocks extra lore fragments sooner.',prereq:[] },
    { id:'autopress',      name:'Auto-Press',          icon:'🤖', cost:9,  desc:'Passive clicks = 50% of click power.',prereq:['clickMastery'] },
  
    // Early start boosters
    { id:'starter2',       name:'Starter Kit II',      icon:'🎒', cost:6,  desc:'Start with +50,000 buttons.',        prereq:['starter'] },
    { id:'seedCapital',    name:'Seed Capital',        icon:'💼', cost:8,  desc:'Start with +250,000 buttons.',       prereq:['starter2'] },
    { id:'quantumBackers', name:'Quantum Backers',     icon:'💠', cost:12, desc:'Start with +1,000,000 buttons.',     prereq:['seedCapital'] },
    { id:'engineer2',      name:'Engineer Kit II',     icon:'🧷', cost:6,  desc:'Start with +4 more Click Bots.',     prereq:['engineer'] },
    { id:'architect',      name:'Architects\' Guild',  icon:'🏗️', cost:6,  desc:'Start with +3 Workshops.',          prereq:['engineer'] },
    { id:'labSponsor',     name:'Lab Sponsor',         icon:'🔬', cost:10, desc:'Start with +1 Research Lab.',        prereq:['grant'] },
  
    // New wave — global production and click power
    { id:'overclocker2',   name:'Heavenly Overclocker II', icon:'🛠️', cost:10, desc:'Global production +15%.',        prereq:['overclocker'] },
    { id:'overclocker3',   name:'Heavenly Overclocker III',icon:'🛠️', cost:16, desc:'Global production +20%.',        prereq:['overclocker2'] },
    { id:'prodAmp',        name:'Production Amplifier',    icon:'⚙️', cost:24, desc:'Global production +30%.',        prereq:['overclocker3'] },
  
    { id:'clickMastery2',  name:'Click Mastery II',    icon:'🖱️', cost:12, desc:'Click power x2.',                    prereq:['clickMastery'] },
    { id:'clickMastery3',  name:'Click Mastery III',   icon:'🖱️', cost:18, desc:'Click power x3.',                    prereq:['clickMastery2'] },
    { id:'tactileTrans',   name:'Tactile Transcendence',icon:'🧬', cost:26, desc:'Click power x2.',                    prereq:['clickMastery3'] },
  
    // New wave — discounts and momentum
    { id:'frugalMind2',    name:'Frugal Mind II',      icon:'🪙', cost:7,  desc:'Buildings cost -2% (stacks).',       prereq:['frugalMind'] },
    { id:'frugalMind3',    name:'Frugal Mind III',     icon:'🪙', cost:10, desc:'Buildings cost -2% (stacks).',       prereq:['frugalMind2'] },
    { id:'momentumPlus',   name:'Momentum Plus',       icon:'🏁', cost:9,  desc:'+6% global per ascension (cap applies).', prereq:['momentum'] },
    { id:'momentumCap',    name:'Momentum Capstone',   icon:'🎯', cost:11, desc:'Momentum cap raised to 100%.',       prereq:['momentumPlus'] },
  
    // New wave — Golden Button
    { id:'goldenGlare2',   name:'Golden Glare II',     icon:'🌟', cost:6,  desc:'Golden Button lasts even longer.',   prereq:['goldenGlare'] },
    { id:'goldenFervor',   name:'Golden Fervor',       icon:'✨', cost:14, desc:'Golden Button boost is 50% stronger.',prereq:['goldenGlare2'] },
  
    // New wave — Auto-Press tiers
    { id:'autopress2',     name:'Auto-Press II',       icon:'🤖', cost:14, desc:'Passive clicks = 75% of click power.',prereq:['autopress'] },
    { id:'autopress3',     name:'Auto-Press III',      icon:'🤖', cost:22, desc:'Passive clicks = 100% of click power.',prereq:['autopress2'] },
  
    // New wave — tower specializations (each doubles a tower; last one triples You)
    { id:'clickbotBless',  name:'Click Bot Blessing',  icon:'🤖', cost:8,  desc:'Click Bots produce 2x.',             prereq:['engineer'] },
    { id:'workshopGuild',  name:'Workshop Guild',      icon:'🧰', cost:8,  desc:'Workshops produce 2x.',              prereq:['architect'] },
    { id:'serverDrive',    name:'Server Overdrive',    icon:'🖥️', cost:10, desc:'Servers produce 2x.',                prereq:['overclocker'] },
    { id:'factoryAuto',    name:'Factory Automation',  icon:'🏭', cost:12, desc:'Auto Factories produce 2x.',         prereq:['serverDrive'] },
    { id:'labPioneers',    name:'Lab Pioneers',        icon:'🧪', cost:14, desc:'Research Labs produce 2x.',          prereq:['labSponsor'] },
    { id:'templeChant',    name:'Temple Chant',        icon:'⛪', cost:16, desc:'Temples produce 2x.',                prereq:['lorekeeper'] },
    { id:'portalTune',     name:'Portal Attunement',   icon:'🌀', cost:18, desc:'Portals produce 2x.',                prereq:['templeChant'] },
    { id:'aicoreAwake',    name:'AI Core Awakening',   icon:'🧠', cost:20, desc:'AI Cores produce 2x.',               prereq:['portalTune'] },
    { id:'forgeHeat',      name:'Forge Heat',          icon:'🔥', cost:22, desc:'Forges produce 2x.',                 prereq:['aicoreAwake'] },
    { id:'singWhisper',    name:'Singularity Whisper', icon:'🕳️', cost:24, desc:'Singularity Cores produce 2x.',     prereq:['forgeHeat'] },
    { id:'youTranscend',   name:'You, Transcendent',   icon:'👤', cost:30, desc:'You produce 3x.',                    prereq:['singWhisper'] },

    { id:'capAuto1',        name:'Automation Manuscript',  icon:'📘', cost:5,  desc:'Automation max +5.',            prereq:['overclocker'] },
    { id:'capAuto2',        name:'Automation Compendium',  icon:'📗', cost:9,  desc:'Automation max +10.',           prereq:['capAuto1'] },
   
    { id:'capFocus1',       name:'Focus Codex',            icon:'📕', cost:5,  desc:'Focused Mind max +5.',          prereq:['lorekeeper'] },
    { id:'capFocus2',       name:'Focus Grimoire',         icon:'📙', cost:9,  desc:'Focused Mind max +10.',         prereq:['capFocus1'] },
   
    { id:'capFrugal1',      name:'Frugality Ledger',       icon:'🧾', cost:6,  desc:'Frugality max +5.',             prereq:['frugalMind'] },
    { id:'capFrugal2',      name:'Frugality Archive',      icon:'📰', cost:10, desc:'Frugality max +10.',            prereq:['capFrugal1'] },
   
    { id:'capHyperfocus',   name:'Hyperfocus Treatise',    icon:'📜', cost:8,  desc:'Hyperfocus max +10.',           prereq:['capFocus2'] },
    { id:'capCritStudy',    name:'Critical Symposium',     icon:'🧠', cost:8,  desc:'Critical Study max +10.',       prereq:['luckyAura'] },
    { id:'capCritPower',    name:'Kinetic Colloquium',     icon:'🛰️', cost:10, desc:'Kinetic Analysis max +10.',     prereq:['capCritStudy'] },
    { id:'capGlobalTuning', name:'Systems Doctrine',       icon:'⚙️', cost:10, desc:'Global Tuning max +10.',        prereq:['overclocker'] },
    { id:'capSynergyTuning',name:'Synergy Thesis',         icon:'🔧', cost:7,  desc:'Synergy Tuning max +5.',        prereq:['lab'] },
  
    // New wave — synergy enhancers
    { id:'synWorkshop',    name:'Harmonic Workshops',  icon:'🔧', cost:12, desc:'Workshop ↔ Lab synergy +0.02.',      prereq:['labPioneers'] },
    { id:'synServers',     name:'Server Symbiosis',    icon:'🛰️', cost:9,  desc:'Click Bot ↔ Server synergy +0.015.', prereq:['serverDrive'] },
  ];

  const LORE = [
    // Opening — the Button notices you
    { id:'intro',        title:'Chapter 01 — Wake',            text:'You press the Button. A counter blinks awake. Something blinks back.',                                    cond:s=>s.totalClicks>=1 },
    { id:'manyClicks',   title:'Chapter 02 — Rhythm',          text:'Your fingers find a rhythm. The Button answers, softly at first, then steady.',                         cond:s=>s.totalClicks>=250 },
    { id:'pulse500',     title:'Chapter 03 — Pulse',           text:'The pulse between presses grows familiar, like breathing in duet.',                                    cond:s=>s.totalClicks>=500 },

    // First machines — curiosity turns to momentum
    { id:'firstBot',     title:'Chapter 04 — The First Helper',text:'A Click Bot stirs. You teach it to press. It learns faster than you expect.',                          cond:s=>s.towers.clickbot.count>=1 },
    { id:'bot25',        title:'Chapter 05 — Delegation',      text:'Twenty-five Bots chirp in relay. You press less… but somehow more.',                                   cond:s=>s.towers.clickbot.count>=25 },
    { id:'workshop',     title:'Chapter 06 — Workshop Sparks', text:'Benches hum. Tools line up. Ideas turn to fixtures, fixtures to force.',                               cond:s=>s.towers.workshop.count>=1 },
    { id:'lab',          title:'Chapter 07 — Hypothesis',      text:'In the Lab, you chart curves of clicking. The Button charts you back.',                               cond:s=>s.towers.lab.count>=1 },
    { id:'server',       title:'Chapter 08 — Many Eyes',       text:'Server racks blink in chorus. The Button\'s reflection repeats down the aisle.',                        cond:s=>s.towers.server.count>=1 },
    { id:'syn1',         title:'Chapter 09 — Synergy',         text:'Workshops admire Labs; Labs pretend not to notice. Output surges anyway.',                              cond:s=>s.towers.workshop.count>=10 && s.towers.lab.count>=1 },

    // The rare sign — luck has a say
    { id:'golden',       title:'Chapter 10 — A Glimpse of Gold',text:'A Golden Button streaks by. Luck, it seems, prefers to be chased.',                                   cond:s=>s.secrets.cometClicked },

    // Study and play — minigames as lessons
    { id:'scholar',      title:'Chapter 11 — Lessons in Play', text:'Patterns in games rhyme with patterns in growth. The Button smiles (you think).',                       cond:s=>s.secrets.mgSequenceBest>=6 || s.secrets.mgReactionWin },
    { id:'mgReact',      title:'Chapter 12 — Reflex',          text:'You react before you know. The Button had rung the bell long ago.',                                   cond:s=>s.secrets.mgReactionWin },
    { id:'mgSeq',        title:'Chapter 13 — Memory',          text:'Sequences repeat until they don\'t. You prepare for the missing beat.',                               cond:s=>s.secrets.mgSequenceBest>=6 },
    { id:'mgHold',       title:'Chapter 14 — Patience',        text:'You hold, then release, not too soon. Perfection hums for a heartbeat.',                               cond:s=>s.secrets.mgHoldPerfect },
    { id:'mgBash',       title:'Chapter 15 — Frenzy',          text:'You bash until time thins. The Button forgives, and yet demands.',                                   cond:s=>s.secrets.mgBashBest>=120 },
    { id:'mgType',       title:'Chapter 16 — Tongue of Keys',  text:'Words sprint. Fingers follow. The Button learns your dialect.',                                       cond:s=>s.secrets.mgTypeBest && s.secrets.mgTypeBest<3000 },

    // Devotion and scale
    { id:'temple',       title:'Chapter 17 — Devotion',        text:'A Temple rises to the rhythm. Reverence refines repetition.',                                         cond:s=>s.towers.temple.count>=1 },
    { id:'factory',      title:'Chapter 18 — Conveyor Hymn',   text:'Factories breathe in crates and breathe out Buttons.',                                               cond:s=>s.towers.factory.count>=1 },
    { id:'towers50',     title:'Chapter 19 — Chorus',          text:'Fifty structures sing the same song. The refrain shakes the floor.',                                  cond:s=> (s.towers.clickbot.count+s.towers.workshop.count+s.towers.server.count+s.towers.lab.count+s.towers.factory.count+s.towers.temple.count+(s.towers.portal?.count||0)+(s.towers.aicore?.count||0)+(s.towers.forge?.count||0)) >= 50 },

    // Boundaries bend
    { id:'portal',       title:'Chapter 20 — Edge of Elsewhere',text:'A Portal yawns. For a moment, you see Buttons pressing you.',                                        cond:s=>s.towers.portal?.count>=1 },
    { id:'aicore',       title:'Chapter 21 — The Dreaming Net',text:'An AI Core sketches a Button in sleep. You recognize the outline.',                                   cond:s=>s.towers.aicore?.count>=1 },
    { id:'forge',        title:'Chapter 22 — Latticework',     text:'In the Forge, lattices catch light—and the rhythm within it.',                                        cond:s=>s.towers.forge?.count>=1 },

    // Wealth of buttons
    { id:'mana1m',       title:'Chapter 23 — Current',         text:'A million Buttons course through your grid. Your shadow brightens.',                                  cond:s=>s.totalManaEarned>=1e6 },
    { id:'mana1b',       title:'Chapter 24 — Sea Change',      text:'A billion Buttons and still the sea wants more.',                                                     cond:s=>s.totalManaEarned>=1e9 },
    { id:'mana1t',       title:'Chapter 25 — Galaxy Turn',     text:'A trillion Buttons bend the arc of progress. You lean with it.',                                      cond:s=>s.totalManaEarned>=1e12 },

    // The first letting go
    { id:'ascend1',      title:'Chapter 26 — Soft Reset',      text:'You let go. The world resets; your hands remember. The Button remembers you.',                         cond:s=>s.prestige.ascensions>=1 },
    { id:'ascend2',      title:'Chapter 27 — Echoes',          text:'In the second return, the opening note is louder. Or maybe you are.',                                 cond:s=>s.prestige.ascensions>=2 },
    { id:'ascend5',      title:'Chapter 28 — Habit of Stars',  text:'Fifth ascent: you recognize the constellations, but not their names.',                                cond:s=>s.prestige.ascensions>=5 },

    // Secret paths
    { id:'secretShop',   title:'Chapter 29 — Alley of Whispers',text:'Behind the tabs, a stall of gleaming promises. Prices hum in crystal.',                               cond:s=>s.secrets.secretShopUnlocked },

    // Golden path — sustained luck
    { id:'gold7',        title:'Chapter 30 — Sevenfold Sign',  text:'Seven Golden Buttons bowed to your chase. Luck learns your route.',                                   cond:s=> (s.secrets.cometCount||0) >= 7 },
    { id:'gold33',       title:'Chapter 31 — Hoard of Gleam',  text:'Thirty-three flashes, none identical. Every omen, earned.',                                           cond:s=> (s.secrets.cometCount||0) >= 33 },
    { id:'gold77',       title:'Chapter 32 — Auric Legend',    text:'Seventy-seven times you found gold in motion. The myth starts using your name.',                      cond:s=> (s.secrets.cometCount||0) >= 77 },

    // Mastery — late story
    { id:'clickMaster',  title:'Chapter 33 — Thumbprint',      text:'Your press has a signature now. The Button signs back.',                                              cond:s=>s.totalClicks>=100000 },
    { id:'mesh',         title:'Chapter 34 — Interleave',      text:'Machines interleave their songs. You conduct by not conducting.',                                     cond:s=>s.towers.server.count>=50 && s.towers.clickbot.count>=200 },
    { id:'canon',        title:'Chapter 35 — Canon',           text:'Repetition becomes canon. Canon becomes law. Law, a ladder.',                                        cond:s=>s.towers.temple.count>=10 },

    // Final stanzas — horizon hints
    { id:'beyond',       title:'Chapter 36 — The Far Press',   text:'Beyond the Portal, a room without walls. In the center: a Button, already warm.',                     cond:s=>s.towers.portal?.count>=10 },
    { id:'mirror',       title:'Chapter 37 — Mirrorwork',      text:'The AI Core dreams you pressing in time you haven\'t lived yet.',                                     cond:s=>s.towers.aicore?.count>=10 },
    { id:'filigree',     title:'Chapter 38 — Filigree',        text:'In the Forge, you trace gilded borders around an idea: the Button is a door.',                         cond:s=>s.towers.forge?.count>=10 },

    // Coda
    { id:'coda',         title:'Chapter 39 — Return, Again',   text:'One last press—for now. Somewhere, another counter wakes and smiles.',                                cond:s=>s.prestige.ascensions>=10 || s.totalManaEarned>=1e14 }
  ];

  // State
  const state = {
    version: GAME_VERSION,
    mana: 0,
    totalManaEarned: 0,
    lifetimeManaEarned: 0,
    lifetimeClicks: 0,
    runStartTs: Date.now(),
    towerProduced: {},
    totalClicks: 0,
    clickBase: 1,
    clickMult: 1,
    globalMult: 1,
    critChance: 0.02,
    critMult: 10,
    towers: {},
    towerMult: {},
    synergy: { workshopPerLab: 0, clickbotPerServer: 0 },
    upgradesPurchased: [],
    crystals: 0,
    research: {},
    buffs: [],
  settings: { autosaveSec: 15, animations: 'on', musicVol: 0.6, musicEnabled: true },
    secrets: {
      titleClicks: 0,
      konami: false,
      secretShopUnlocked: false,
      dailyBlessLast: 0,
      cometClicked: false,
      cometCount: 0,
      mgReactionWin: false,
      mgSequenceBest: 0,
      mgHoldPerfect: false,
      mgBashBest: 0,
      mgTypeBest: 0,
      ultraKonami: false,
      mgHoldLockUntil: 0
    },
    lore: {},
    prestige: {
      ascensions: 0,
      heavenly: { total: 0, spent: 0 },
      tree: {}
    },
    ui: {
      lastSave: 0,
      lastTick: performance.now(),
      lastUi: performance.now(),
    }
  };

  for (const t of TOWERS) state.towers[t.id] = { count: 0, baseCost: t.baseCost, costMult: t.costMult, baseProd: t.baseProd };
  for (const t of TOWERS) state.towerMult[t.id] = 1;
  for (const r of RESEARCH) state.research[r.id] = 0;

  // DOM helpers
  function qs(sel, root = document){ return root.querySelector(sel); }
  function eln(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML=html; return e; }
  function format(n){
    if (!isFinite(n)) return '∞';
    if (Math.abs(n) < 1000) return Math.floor(n) === n ? n.toString() : n.toFixed(2);
    const units = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    let i = -1;
    while (Math.abs(n) >= 1000 && i < units.length - 1) { n /= 1000; i++; }
    return `${n.toFixed(2)}${units[i]}`;
  }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function now(){ return performance.now(); }
  function totalTowers(s){ return TOWERS.reduce((sum, t) => sum + s.towers[t.id].count, 0); }

  // DOM cache
  const el = {
    app: qs('#app'),
    loader: qs('#loader'),
    loaderTip: qs('#loaderTip'),
    loaderFill: qs('#lpFill'),

    mana: qs('#mana'),
    mps: qs('#mps'),
    clickPowerLabel: qs('#clickPowerLabel'),
    totalClicks: qs('#totalClicks'),
    totalMana: qs('#totalMana'),
    critChance: qs('#critChance'),
    autosave: qs('#autosave'),
    log: qs('#log'),
    bigClick: qs('#bigClick'),
    towersList: qs('#towersList'),
    upgradesList: qs('#upgradesList'),
    researchList: qs('#researchList'),
    crystals: qs('#crystals'),
    achievementsGrid: qs('#achievementsGrid'),
    loreList: qs('#loreList'),
    buffsTop: qs('#buffBar'),
    version: qs('#version'),
    saveBtn: qs('#saveBtn'),
    exportBtn: qs('#exportBtn'),
    importBtn: qs('#importBtn'),
    resetBtn: qs('#resetBtn'),
    saveData: qs('#saveData'),
    autosaveInterval: qs('#autosaveInterval'),
    animationsToggle: qs('#animationsToggle'),
    secretTab: qs('#secretTab'),
    secretShop: qs('#secretShop'),
    gameTitle: qs('#gameTitle'),
    tip: qs('#tip'),
    rareLayer: qs('#rareLayer'),
    toast: qs('#toast'),
  musicVolume: qs('#musicVolume'),
  musicVolumeLabel: qs('#musicVolumeLabel'),
    ctabButtons: document.querySelectorAll('.ctab'),
    reactionStart: qs('#reactionStart'),
    reactionStatus: qs('#reactionStatus'),
    sequenceStart: qs('#sequenceStart'),
    sequenceStatus: qs('#sequenceStatus'),
    sequenceBoard: qs('#sequenceBoard'),
    statsGrid: qs('#statsGrid'),
    mgReq: {
      reaction: qs('#mg-req-reaction'),
      sequence: qs('#mg-req-sequence'),
      hold: qs('#mg-req-hold'),
  bash: qs('#mg-req-bash'),
  target: qs('#mg-req-target')
    },
    hold: {
      start: qs('#holdStart'),
      bar: qs('#holdBar'),
      fill: qs('#holdFill'),
      target: qs('#holdTarget'),
      status: qs('#holdStatus')
    },
    bash: {
      start: qs('#bashStart'),
      btn: qs('#bashBtn'),
      status: qs('#bashStatus')
    },
    target: {
      start: qs('#targetStart'),
      area: qs('#targetArea'),
      status: qs('#targetStatus')
    },
    qtyButtons: document.querySelectorAll('.store-controls .qty'),
    asc: {
      total: qs('#asc-total'),
      banked: qs('#asc-banked'),
      totalh: qs('#asc-totalh'),
      potential: qs('#asc-potential'),
      btn: qs('#ascendBtn'),
      treeGrid: qs('#treeGrid')
    }
  };
  if (el.version) el.version.textContent = GAME_VERSION;

  el.gameTitle?.addEventListener('click', () => {
    state.secrets.titleClicks = (state.secrets.titleClicks || 0) + 1;
    updateAchievements();
    maybeUnlockLore();
    Save.schedule();
  });

  // Loader controls
  let tipTimer = 0;
  let loaderWatchdog = 0;
  function startLoader(){
    if (!el.loader) return;
    let idx = Math.floor(Math.random()*LOADING_TIPS.length);
    if (el.loaderTip) el.loaderTip.textContent = LOADING_TIPS[idx];
    tipTimer = setInterval(() => {
      idx = (idx + 1) % LOADING_TIPS.length;
      if (el.loaderTip) el.loaderTip.textContent = LOADING_TIPS[idx];
    }, 5200); // 5.2s so tips are readable
    setProgress(8);

    // Watchdog: force-finish loader after 6s to prevent infinite loading
    loaderWatchdog = window.setTimeout(() => {
      finishLoader(true);
      toast('Loaded with fallback. If something looks off, try refreshing.');
    }, 6000);
  }
  function setProgress(pct){
    if (el.loaderFill) el.loaderFill.style.width = `${clamp(pct,0,100)}%`;
  }
  function finishLoader(fromWatchdog = false){
    clearInterval(tipTimer);
    if (loaderWatchdog) { clearTimeout(loaderWatchdog); loaderWatchdog = 0; }
    setProgress(100);
    // Fade out loader, fade in app
    setTimeout(() => {
      if (el.loader) el.loader.classList.add('hide');
      if (el.app) el.app.classList.add('ready');
      if (!fromWatchdog) toast('Ready!');
    }, 100);
  }

  // Achievements
  const ACHIEVEMENTS = [
    // Click milestones
    a('click100',  'Clicker',          'Click 100 times.',                         s => s.totalClicks >= 100,                                 0.01),
    a('lucky777',  'Lucky 777',        'Reach 777 clicks.',                        s => s.totalClicks >= 777,                                 0.07),
    a('click1k',   'Button Masher',    'Click 1,000 times.',                       s => s.totalClicks >= 1_000,                               0.1),
    a('click10k',  'Machine Hands',    'Click 10,000 times.',                      s => s.totalClicks >= 10_000,                              1),
    a('click100k', 'Metronome',        'Click 100,000 times.',                     s => s.totalClicks >= 100_000,                             10),
    a('click1m',   'One in a Million', 'Click 1,000,000 times.',                   s => s.totalClicks >= 1_000_000,                           100),
               
    // Total buttons earned (lifetime)               
    a('mana1k',  'Button Trickle', 'Earn 1,000 total buttons.',                    s => s.totalManaEarned >= 1_000,                           0.1),
    a('mana10k', 'Button Stream',  'Earn 10,000 total buttons.',                   s => s.totalManaEarned >= 10_000,                          0.2),
    a('mana1m',  'Button River',   'Earn 1,000,000 total buttons.',                s => s.totalManaEarned >= 1e6,                             0.5),
    a('mana1b',  'Button Sea',     'Earn 1,000,000,000 total buttons.',            s => s.totalManaEarned >= 1e9,                             1),
    a('mana1t',  'Button Galaxy',  'Earn 1,000,000,000,000 total buttons.',        s => s.totalManaEarned >= 1e12,                            10),
               
    // Total towers owned               
    a('towers10',   'Getting Staffed',  'Own 10 total towers.',                     s => totalTowers(s) >= 10,                                 0.05),
    a('towers50',   'Tower Tycoon',     'Own 50 total towers.',                     s => totalTowers(s) >= 50,                                 0.25),
    a('towers200',  'Industrialist',    'Own 200 total towers.',                    s => totalTowers(s) >= 200,                                0.50),
    a('towers500',  'Empire',           'Own 500 total towers.',                    s => totalTowers(s) >= 500,                                0.75),
    a('towers1000', 'Tower of Babel',   'Own 1000 total towers.',                   s => totalTowers(s) >= 1000,                               1),

    // Total specialized towers owned
    a('cb25',    'Bot Brigade',     'Own 25 Click Bots.',                          s => s.towers.clickbot.count >= 25,                        0.01),
    a('cb50',    'Bot Battalion',   'Own 50 Click Bots.',                          s => s.towers.clickbot.count >= 50,                        0.05),
    a('cb100',   'Bot Division',    'Own 100 Click Bots.',                         s => s.towers.clickbot.count >= 100,                       0.1),
    a('ws25',    'Tool Time',       'Own 25 Workshops.',                           s => s.towers.workshop.count >= 25,                        0.015),
    a('ws50',    'Tool Store',      'Own 50 Workshops.',                           s => s.towers.workshop.count >= 50,                        0.055),
    a('ws100',   'Tool Factory',    'Own 100 Workshops.',                          s => s.towers.workshop.count >= 100,                       0.15),
    a('srv25',   'Server Room',     'Own 25 Servers.',                             s => s.towers.server.count >= 25,                          0.02),
    a('srv50',   'Server Farm',     'Own 50 Servers.',                             s => s.towers.server.count >= 50,                          0.06),
    a('srv100',  'Server Cluster',  'Own 100 Servers.',                            s => s.towers.server.count >= 100,                         0.2),
    a('lab10',   'Accredited',      'Own 10 Labs.',                                s => s.towers.lab.count >= 10,                             0.03),
    a('lab25',   'Lab Technician',  'Own 25 Labs.',                                s => s.towers.lab.count >= 25,                             0.07),
    a('lab50',   'Lab Master',      'Own 50 Labs.',                                s => s.towers.lab.count >= 50,                             0.3),
    a('fact10',  'Conveyor Dreams', 'Own 10 Factories.',                           s => s.towers.factory.count >= 10,                         0.04),
    a('temple5', 'Button Devotee',  'Own 5 Temples.',                              s => s.towers.temple.count >= 5,                           0.05),

    // Upgrades purchased
    a('upg5',       'Tinkerer',          'Purchase 5 upgrades.',                   s => s.upgradesPurchased.length >= 5,                      0.015),
    a('upg12',      'Engineer',          'Purchase 12 upgrades.',                  s => s.upgradesPurchased.length >= 12,                     0.035),
    a('upg20',      'Inventor',          'Purchase 20 upgrades.',                  s => s.upgradesPurchased.length >= 20,                     0.04),
    a('mgReaction', 'Quick Draw',        'Win Reaction Rush at least once.',       s => s.secrets.mgReactionWin,                              0.02),
    a('mgSequence', 'Memory Lane',       'Reach sequence 6.',                      s => s.secrets.mgSequenceBest >= 6,                        0.02),
    a('mgHold',     'Steady Hands',      'Hit perfect in Timing Bar.',             s => s.secrets.mgHoldPerfect,                              0.02),
    a('mgBash',     'Bash Master',       'Reach 120 clicks in Button Bash.',       s => s.secrets.mgBashBest >= 120,                          0.03),
    a('mgType',     'Type Racer',        'Finish a prompt under 3s.',              s => s.secrets.mgTypeBest && s.secrets.mgTypeBest < 3000,  0.02),
    a('mgType',     'Keyboard Master',   'Finish a prompt under 1s.',              s => s.secrets.mgTypeBest && s.secrets.mgTypeBest < 1000,  0.03),

    // Secret achievements
    a('titleTapper', 'Title Enthusiast',  'Click the title 7 times.',              s => s.secrets.titleClicks >= 7,                           0.07),
    a('konami',      'Pattern Breaker',   'Enter the secret pattern.',             s => s.secrets.konami,                                     0.3),
    a('comet',       'Golden Finder',     'Click a Golden Button.',                s => s.secrets.cometClicked,                               0.02),
    a('gold7',       'Sevenfold Shine',   'Click 7 Golden Buttons.',               s => (s.secrets.cometCount || 0) >= 7,                     0.07),
    a('gold33',      'Gleaming Hoard',    'Click 33 Golden Buttons.',              s => (s.secrets.cometCount || 0) >= 33,                    0.33),
    a('gold77',      'Auric Legend',      'Click 77 Golden Buttons.',              s => (s.secrets.cometCount || 0) >= 77,                    0.77),
    a('gold333',     'Absolute Radiance', 'Click 333 Golden Buttons.',             s => (s.secrets.cometCount || 0) >= 333,                   3.33),
    a('gold777',     'Radiant Gold',      'Click 777 Golden Buttons.',             s => (s.secrets.cometCount || 0) >= 777,                   7.77),

    // Ascensions
    a('ascend',      'New Game+',   'Perform your first ascension.',               s => s.prestige.ascensions >= 1,                           1),
    a('ascend3',     'Seasoned',    'Ascend 3 times.',                             s => s.prestige.ascensions >= 3,                           3),
    a('ascend10',    'Experienced', 'Ascend 10 times.',                            s => s.prestige.ascensions >= 10,                          10),
    a('ascend30',    'Veteran',     'Ascend 30 times.',                            s => s.prestige.ascensions >= 30,                          30)
  ];

  // Save Manager (debounced, idle-time, compact payload, safe load)
  const Save = {
    suppress: false,
    pending: false,
    timer: null,
    last: 0,
    debounceMs: 1500,
    minGapMs: 5000,
    schedule(){
      if (this.suppress) return;
      const nowTs = Date.now();
      if (this.pending) return;
      this.pending = true;
      const wait = Math.max(this.debounceMs, this.minGapMs - (nowTs - this.last));
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), wait);
    },
    flush(){
      if (this.suppress) return;
      this.pending = false;
      this.last = Date.now();
      const payload = buildSave();
      const write = () => {
        try{
          localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
          if (el.autosave){ el.autosave.textContent = 'Saved'; setTimeout(()=> el.autosave.textContent='Auto', 800); }
        }catch(e){ console.warn('Save failed:', e); }
      };
      if ('requestIdleCallback' in window){ requestIdleCallback(write, { timeout: 1000 }); } else { setTimeout(write, 0); }
    },
    forceNow(){
      if (this.suppress) return;
      clearTimeout(this.timer);
      this.pending = false;
      this.last = Date.now();
      try{
        localStorage.setItem(SAVE_KEY, JSON.stringify(buildSave()));
        if (el.autosave){ el.autosave.textContent = 'Saved'; setTimeout(()=> el.autosave.textContent='Auto', 800); }
      }catch(e){ console.warn('Immediate save failed:', e); }
    }
  };

  function performOneTimeWipeIfNeeded(){
    try{
      const pending = localStorage.getItem(WIPE_PENDING_KEY);
      const done = localStorage.getItem(WIPE_DONE_KEY);
      if (pending && !done){
        localStorage.setItem(WIPE_DONE_KEY, '1');
        localStorage.removeItem(WIPE_PENDING_KEY);
        // Use existing hardReset to clear all saves and reload; it does not touch our wipe flags
        hardReset();
        return true; // will navigate away
      }
    }catch(e){ console.warn('wipe check error', e); }
    return false;
  }

  function buildSave(){
    return {
      version: state.version,
      schema: { wipeBaseline: WIPE_BASELINE },
  
      mana: state.mana,
      totalManaEarned: state.totalManaEarned,
      totalClicks: state.totalClicks,
      towers: Object.fromEntries(Object.keys(state.towers).map(id => [id, { count: state.towers[id].count } ])),
      upgradesPurchased: [...state.upgradesPurchased],
      crystals: state.crystals,
      research: { ...state.research },
      settings: { ...state.settings },
      secrets: { ...state.secrets },
      lore: { ...state.lore },
      prestige: JSON.parse(JSON.stringify(state.prestige)),
      lifetimeManaEarned: state.lifetimeManaEarned || 0,
      lifetimeClicks: state.lifetimeClicks || 0,
      runStartTs: state.runStartTs || Date.now(),
      towerProduced: { ...state.towerProduced },
  
      // NEW: persist active buffs with remaining time
      buffs: (Array.isArray(state.buffs) ? state.buffs : [])
        .filter(b => (b && typeof b === 'object' && (+b.until || 0) > Date.now()))
        .map(b => ({
            id: String(b.id || ''),
            name: String(b.name || 'Buff'),
            mult: +b.mult || 1,
            duration: Math.max(1, +b.duration || 0),
            until: +b.until || 0,
            color: b.color || '#00f5d4'
        }))
    };
  }

  function validateSave(obj){
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.version !== 'string') return false;
    if (typeof obj.mana !== 'number') return false;
    if (!obj.towers || typeof obj.towers !== 'object') return false;
    return true;
  }

  // Modifiers
  function achievementsMultiplier(){
    let m = 1;
    for (const ac of ACHIEVEMENTS) if (state.secrets[`ach_${ac.id}`]) m *= (1 + ac.bonus);
    return m;
  }
  function recomputeModifiers() {
    state.clickBase = 1;
    state.clickMult = 1;
    state.globalMult = 1;
    state.synergy.workshopPerLab = 0;
    state.synergy.clickbotPerServer = 0;
    for (const t of TOWERS) state.towerMult[t.id] = 1;
  
    const r = state.research;
    state.globalMult *= (1 + 0.03 * (r.automation || 0));
    state.clickBase += (r.focus || 0);
    state.clickBase += 2 * (r.hyperfocus || 0);
    state.critChance += 0.002 * (r.critStudy || 0);  // +0.2% each
    state.critMult   += 0.5   * (r.critPower || 0);  // +0.5x each
    state.globalMult *= (1 + 0.02 * (r.globalTuning || 0));
    state.synergy.workshopPerLab   += 0.005 * (r.synergyTuning || 0);
    state.synergy.clickbotPerServer+= 0.005 * (r.synergyTuning || 0);
  
    const tree = state.prestige.tree || {};
  
    // Global multipliers
    if (tree.overclocker)  state.globalMult *= 1.10;
    if (tree.overclocker2) state.globalMult *= 1.15;
    if (tree.overclocker3) state.globalMult *= 1.20;
    if (tree.prodAmp)      state.globalMult *= 1.30;
  
    // Click power
    if (tree.clickMastery)  state.clickMult *= 2;
    if (tree.clickMastery2) state.clickMult *= 2;
    if (tree.clickMastery3) state.clickMult *= 3;
    if (tree.tactileTrans)  state.clickMult *= 2;
  
    // Crit chance from existing node (unchanged)
    if (tree.luckyAura) state.critChance += 0.05;
  
    // Momentum: per-ascension rate and cap
    if (tree.momentum) {
      const perAsc = tree.momentumPlus ? 0.06 : 0.05;
      const capAsc = tree.momentumCap ? 20 : 10; // 100% vs 50%
      const bonus = Math.min(capAsc, state.prestige.ascensions) * perAsc;
      state.globalMult *= (1 + bonus);
    }
  
    // Tower specializations
    if (tree.clickbotBless) state.towerMult.clickbot   *= 2;
    if (tree.workshopGuild) state.towerMult.workshop   *= 2;
    if (tree.serverDrive)   state.towerMult.server     *= 2;
    if (tree.factoryAuto)   state.towerMult.factory    *= 2;
    if (tree.labPioneers)   state.towerMult.lab        *= 2;
    if (tree.templeChant)   state.towerMult.temple     *= 2;
    if (tree.portalTune)    state.towerMult.portal     *= 2;
    if (tree.aicoreAwake)   state.towerMult.aicore     *= 2;
    if (tree.forgeHeat)     state.towerMult.forge      *= 2;
    if (tree.singWhisper)   state.towerMult.singularity*= 2;
    if (tree.youTranscend)  state.towerMult.you        *= 3;
  
    // Synergy enhancers
    if (tree.synWorkshop) state.synergy.workshopPerLab += 0.02;
    if (tree.synServers)  state.synergy.clickbotPerServer += 0.015;

    const sec = state.secrets || {};
    if (sec.secretClick)      state.clickMult *= 2;
    if (sec.secretGlobal2)    state.globalMult *= 1.20;
    if (sec.secretCritChance) state.critChance += 0.05;
    if (sec.secretCritMult)   state.critMult   += 2;
    if (sec.secretSynergy) {
    state.synergy.workshopPerLab    += 0.02;
    state.synergy.clickbotPerServer += 0.02;
    }
  
    // Apply purchased upgrades
    for (const id of state.upgradesPurchased) {
      const up = UPGRADES.find(u => u.id === id);
      if (up && typeof up.effect === 'function') up.effect(state);
    }
  
    if (state.secrets.ultraKonami) {
      state.clickMult *= 100;
    }
    state.globalMult *= achievementsMultiplier();
  }

  function getActiveBuffMult() {
    const t = Date.now();
    let mult = 1;
    state.buffs = state.buffs.filter(b => b.until > t);
    for (const b of state.buffs) mult *= b.mult;
    return mult;
  }

  function prestigeDiscount(){
    const t = state.prestige.tree || {};
    let d = 0;
    if (t.frugalMind)  d += 0.02;
    if (t.frugalMind2) d += 0.02;
    if (t.frugalMind3) d += 0.02;
    return Math.min(0.50, d);
  }
  function getTowerCost(towerId, amount = 1) {
    const t = state.towers[towerId];
    const r = state.research;
    const disc = (1 - 0.01 * (r.frugality || 0)) * (1 - prestigeDiscount());
    const start = Math.pow(t.costMult, t.count);
    const total = t.baseCost * start * (Math.pow(t.costMult, amount) - 1) / (t.costMult - 1);
    return total * disc;
  }
  function getSingleTowerCost(towerId) {
    const t = state.towers[towerId];
    const r = state.research;
    const disc = (1 - 0.01 * (r.frugality || 0)) * (1 - prestigeDiscount());
    return t.baseCost * Math.pow(t.costMult, t.count) * disc;
  }
  function requiredCostForMode(id, mode){
    if (mode === '10') return getTowerCost(id, 10);
    return getSingleTowerCost(id); // for max, require at least 1 affordable
  }
  function canAfford(n){ return state.mana >= n; }

  function towerProdPer(towerId){
    const def = TOWERS.find(x => x.id === towerId);
    let per = def.baseProd * state.towerMult[towerId];
    if (towerId === 'workshop') per *= (1 + state.synergy.workshopPerLab * state.towers.lab.count);
    if (towerId === 'clickbot') per *= (1 + state.synergy.clickbotPerServer * state.towers.server.count);
    return per;
  }

  function passiveClickPerSec(){
    const t = state.prestige.tree || {};
    let factor = 0;
    if (t.autopress3) factor = 1.00;
    else if (t.autopress2) factor = 0.75;
    else if (t.autopress)  factor = 0.50;
    if (state.secrets?.secretAutopress) factor += 0.25;
    return Math.max(0, factor) * clickPower();
  }

  function computeMps(){
    const buff = getActiveBuffMult();
    let total = 0;
    for (const t of TOWERS) total += towerProdPer(t.id) * state.towers[t.id].count;
    total *= state.globalMult * buff;
    total += passiveClickPerSec();
    return total;
  }
  function clickPower(){
    const buff = getActiveBuffMult();
    return state.clickBase * state.clickMult * buff;
  }

  function addMana(n){
    state.mana += n;
    state.totalManaEarned += n;
    state.lifetimeManaEarned = (state.lifetimeManaEarned || 0) + n;
  }
  function spendMana(n){ if (!canAfford(n)) return false; state.mana -= n; return true; }

  // UI updates (guard element access)
  function updateTop(){
    if (el.mana) el.mana.textContent = format(state.mana);
    if (el.mps) el.mps.textContent = `${format(computeMps())}`;
    if (el.clickPowerLabel) el.clickPowerLabel.textContent = `+${format(Math.max(1, Math.floor(clickPower())))}`;
    if (el.totalClicks) el.totalClicks.textContent = format(state.totalClicks);
    if (el.totalMana) el.totalMana.textContent = format(state.totalManaEarned);
    if (el.critChance) el.critChance.textContent = `${Math.round(state.critChance*100)}%`;
  
    if (el.buffsTop){
      el.buffsTop.innerHTML = '';
      const t = Date.now();
      for (const b of state.buffs) {
          const dur = Math.max(1, +b.duration || 0);
          const remaining = Math.max(0, (+b.until || 0) - t);
          const left = clamp(remaining / dur, 0, 1);
  
          const chip = eln('div', 'chip');
          const name = eln('span', '', b.name || 'Buff');

          
          chip.dataset.buffId = b.id || '';
          chip.dataset.buffName = b.name || 'Buff';
          chip.dataset.buffMult = String(+b.mult || 1);
          chip.dataset.buffDuration = String(dur);
          chip.dataset.buffUntil = String(+b.until || 0);
          chip.dataset.buffColor = b.color || '#00f5d4';
  
          // NEW: helpful hover text (effect + remaining time)
          const leftMs = Math.max(0, b.until - t);
          const hh = Math.floor(leftMs / 3600000);
          const mm = Math.floor((leftMs % 3600000) / 60000);
          const ss = Math.floor((leftMs % 60000) / 1000);
          const timeTxt = hh > 0 ? `${hh}h ${String(mm).padStart(2,'0')}m ${String(ss).padStart(2,'0')}s`
                                 : `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
          const multTxt = (b.mult >= 1 ? `x${(+b.mult).toFixed(b.mult >= 10 ? 0 : 2)}` : `${Math.round((b.mult-1)*100)}%`);
          const tooltip = '';
          chip.title = tooltip;
          chip.setAttribute('aria-label', tooltip);
    
          const bar = eln('div', 'bar');
          const fill = eln('i');
          fill.style.width = `${left*100}%`;
          fill.style.background = `linear-gradient(90deg, ${b.color || '#00f5d4'}, var(--accent))`;
          bar.appendChild(fill);
          
          chip.appendChild(name);
          chip.appendChild(bar);
          el.buffsTop.appendChild(chip);
      }
    }
  }

  function updateStoreUI(){
    if (!el.towersList) return;
    for (const t of TOWERS) {
      const costEl = qs(`#cost-${t.id}`);
      const subEl = qs(`#sub-${t.id}`);
      const singleCost = getSingleTowerCost(t.id);
      if (costEl) costEl.textContent = format(singleCost);
      if (subEl){
        const owned = state.towers[t.id].count;
        const prodEach = towerProdPer(t.id) * state.globalMult * getActiveBuffMult();
        subEl.textContent = `${owned} owned • ${format(prodEach*owned)}/s`;
      }
      const row = el.towersList.querySelector(`[data-tower="${t.id}"]`);
      if (row){
        const btn = row.querySelector('.buy');
        if (btn){
          const reqCost = requiredCostForMode(t.id, bulkBuy);
          const affordable = canAfford(reqCost);
          btn.disabled = !affordable;
          btn.textContent = `Buy ${bulkBuy.toUpperCase()}`;
          btn.classList.toggle('pulse', affordable);
        }
      }
    }
  }

  function updateUpgradesUI(){
    if (!el.upgradesList) return;
    for (const up of UPGRADES) {
      if (state.upgradesPurchased.includes(up.id)) {
        const card = el.upgradesList.querySelector(`[data-upgrade="${up.id}"]`);
        if (card) card.remove();
        continue;
      }
      const card = el.upgradesList.querySelector(`[data-upgrade="${up.id}"]`);
      if (!card) continue;
      const btn = card.querySelector('.buy-upgrade');
      const owned = state.upgradesPurchased.includes(up.id);
      const available = up.cond(state);
      const affordable = canAfford(up.cost);
      if (btn) {
        btn.disabled = owned || !available || !affordable;
        btn.textContent = owned ? 'Owned' : 'Purchase';
        btn.classList.toggle('pulse', !btn.disabled && !owned);
      }
      card.style.opacity = available ? 1 : 0.4;
    }
  }

  function updateResearchUI(){
    if (el.crystals) el.crystals.textContent = format(state.crystals);
    if (!el.researchList) return;
    for (const r of RESEARCH) {
      const row = el.researchList.querySelector(`[data-research="${r.id}"]`);
      if (!row) continue;
      const lvl = state.research[r.id] || 0;
      const max = researchMax(r.id);
      if (lvl >= max) { if (row) row.remove(); continue; }
      const titleSub = row.querySelector('.title .sub');
      if (titleSub) titleSub.textContent = `Lv.${lvl}/${max}`;
      const cost = r.baseCost + lvl;
      const costEl = qs(`#rcost-${r.id}`);
      if (costEl) costEl.textContent = cost;
      const btn = row.querySelector('.buy-research');
      const affordable = state.crystals >= cost;
      if (btn) {
        btn.disabled = lvl >= max || !affordable;
        btn.classList.toggle('pulse', !btn.disabled);
      }
    }
  }

  function updateAchievements(){
    if (!el.achievementsGrid) return;
    for (const ac of ACHIEVEMENTS) {
      const unlocked = ac.cond(state);
      const card = qs(`#ach-${ac.id}`);
      if (!card) continue;
      if (unlocked){
        card.classList.remove('locked');
        if (!state.secrets[`ach_${ac.id}`]) {
          state.secrets[`ach_${ac.id}`] = true;
          toast(`Achievement unlocked: ${ac.name}`);
          recomputeModifiers();
        }
      }
    }
  }

  function updateLoreUI(){
    if (!el.loreList) return;
    el.loreList.innerHTML = '';
    for (const entry of LORE) {
      const unlocked = entry.cond(state) || state.lore[entry.id] || (state.prestige.tree.lorekeeper && ['intro','manyClicks','firstBot'].includes(entry.id));
      if (unlocked) state.lore[entry.id] = true;
      const card = eln('div', 'lore-entry');
      card.innerHTML = `
        <div class="title">${unlocked ? entry.title : '???'}</div>
        <div class="text">${unlocked ? entry.text : 'A fragment waits to be revealed.'}</div>
      `;
      el.loreList.appendChild(card);
    }
  }

  function updateMinigameLocks(){
    const now = Date.now();
  
    // Helper to format mm:ss
    const mmss = (ms) => {
      const m = String(Math.floor(ms/60000)).padStart(2,'0');
      const s = String(Math.floor((ms%60000)/1000)).padStart(2,'0');
      return `${m}:${s}`;
    };
  
    const holdCooldownMs = Math.max(0, (state.secrets.mgHoldLockUntil || 0) - now);
    const holdCdTxt = holdCooldownMs > 0 ? `Cooldown: ${mmss(holdCooldownMs)}` : 'Own 25 Workshops';
  
    // NEW: compute other cooldowns
  const seqCooldownMs = Math.max(0, (state.secrets.mgSequenceLockUntil || 0) - now);
  const bashCooldownMs = Math.max(0, (state.secrets.mgBashLockUntil || 0) - now);
  const targetCooldownMs = Math.max(0, (state.secrets.mgTargetLockUntil || 0) - now);
    const reactCooldownMs = Math.max(0, (state.secrets.mgReactionLockUntil || 0) - now);
  
    const req = {
      reaction: { txt: reactCooldownMs > 0 ? `Cooldown: ${mmss(reactCooldownMs)}` : 'Own 10 Click Bots', ok: state.towers.clickbot.count >= 10 && reactCooldownMs === 0 },
      sequence: { txt: seqCooldownMs > 0 ? `Cooldown: ${mmss(seqCooldownMs)}` : 'Own 1 Research Lab', ok: state.towers.lab.count >= 1 && seqCooldownMs === 0 },
      hold:     { txt: holdCdTxt, ok: state.towers.workshop.count >= 25 && holdCooldownMs === 0 },
  bash:     { txt: bashCooldownMs > 0 ? `Cooldown: ${mmss(bashCooldownMs)}` : 'Own 50 Click Bots', ok: state.towers.clickbot.count >= 50 && bashCooldownMs === 0 },
  target:   { txt: targetCooldownMs > 0 ? `Cooldown: ${mmss(targetCooldownMs)}` : 'Own 10 Auto Factories', ok: state.towers.factory.count >= 10 && targetCooldownMs === 0 }
    };
  
    for (const key of Object.keys(req)){
      const badge = el.mgReq[key];
      if (!badge) continue;
      badge.textContent = req[key].ok ? 'Unlocked' : `Locked: ${req[key].txt}`;
      badge.style.color = req[key].ok ? '#35d49a' : '';

      // Dim and disable controls when locked (also covers cooldown)
      const card = document.querySelector(`.minigame-card[data-mg="${key}"]`);
      if (card){
        card.style.opacity = req[key].ok ? 1 : 0.5;
        Array.from(card.querySelectorAll('button,input')).forEach(b => b.disabled = !req[key].ok);
      }
    }
  }

  // Logs & notifications
  function log(msg){
    if (!el.log) return;
    const div = document.createElement('div');
    div.className = 'entry';
    const ts = new Date().toLocaleTimeString();
    div.textContent = `[${ts}] ${msg}`;
    el.log.appendChild(div);
    el.log.scrollTop = el.log.scrollHeight;
  }

  function toast(msg){
    try { log(msg); } catch(_) {}

    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => el.toast.classList.remove('show'), 1800);
  }

  // Interactions
  el.bigClick?.addEventListener('click', (ev) => {
    let power = clickPower();
    state.totalClicks++;
    state.lifetimeClicks = (state.lifetimeClicks || 0) + 1;
    if (Math.random() < state.critChance){
      power *= state.critMult;
      floating(ev.clientX, ev.clientY, `CRIT +${format(power)}`, '#ffd166');
    } else {
      floating(ev.clientX, ev.clientY, `+${format(power)}`);
    }
    addMana(power);

    if (state.totalClicks === 1) maybeUnlockLore();
    if (state.totalClicks === 777){
      addBuff({ id: 'lucky777', name: 'Lucky 7s', mult: 7, duration: 7000, color: '#ffd166' });
      toast('Lucky 7s! x7 for 7s!');
    }
  });

  function floating(x, y, text, color = '#fff'){
    if (state.settings.animations === 'off') return;
    const div = eln('div', 'floating', text);
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.color = color;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 900);
  }

  // Store events
  let bulkBuy = 'max';
  function buildStoreUI(){
    if (!el.towersList) return;
    el.towersList.innerHTML = '';
    const towers = [...TOWERS].reverse();
    for (const t of TOWERS) {
      const row = eln('div', 'row');
      row.dataset.tower = t.id;
      row.innerHTML = `
        <div class="icon">${t.emoji}</div>
        <div>
          <div class="title">${t.name}</div>
          <div class="sub" id="sub-${t.id}">0 owned • 0/s</div>
        </div>
        <div>
          <div class="sub">Cost</div>
          <div class="title" id="cost-${t.id}">-</div>
        </div>
        <div class="controls">
          <button class="btn buy" data-id="${t.id}">Buy ${bulkBuy.toUpperCase()}</button>
        </div>
      `;
      el.towersList.appendChild(row);
    }
  }
  el.towersList?.addEventListener('click', (ev) => {
    const target = ev.target.closest('button');
    if (!target) return;
    if (target.classList.contains('buy')){
      const id = target.closest('.row').dataset.tower;
      buyTower(id, bulkBuy);
      maybeUnlockLore();
      Save.schedule();
    }
  });
  el.qtyButtons.forEach(qb => qb.addEventListener('click', () => {
    bulkBuy = qb.dataset.q;
    el.qtyButtons.forEach(x => x.classList.remove('active'));
    qb.classList.add('active');
    updateStoreUI();
  }));

  // Upgrades
  function buildUpgradesUI(){
    if (!el.upgradesList) return;
    el.upgradesList.innerHTML = '';
    for (const up of UPGRADES) {
      if (state.upgradesPurchased.includes(up.id)) continue; // NEW: hide owned
      const card = eln('div', 'upg-card');
      card.dataset.upgrade = up.id;
      card.innerHTML = `
        <div class="icon">${up.icon || '⚙️'}</div>
        <div>
          <div class="title">${up.name}</div>
          <div class="sub">${up.desc}</div>
        </div>
        <div class="controls">
          <div class="sub" style="text-align:right; margin-bottom:6px">${format(up.cost)}</div>
          <button class="btn buy-upgrade" data-id="${up.id}">Purchase</button>
        </div>
      `;
      el.upgradesList.appendChild(card);
    }
  }
  el.upgradesList?.addEventListener('click', (ev) => {
    const target = ev.target.closest('.buy-upgrade');
    if (!target) return;
    buyUpgrade(target.dataset.id);
    Save.schedule();
  });

  // Research
  function buildResearchUI(){
    if (!el.researchList) return;
    el.researchList.innerHTML = '';
    for (const r of RESEARCH) {
      const row = eln('div', 'row');
      const lvl = state.research[r.id] || 0;
      const max = researchMax(r.id);
    if (lvl >= max) continue;
      row.dataset.research = r.id;
      row.innerHTML = `
        <div class="icon">🔬</div>
        <div>
          <div class="title">${r.name} <span class="sub">Lv.${lvl}/${max}</span></div>
          <div class="sub">${r.desc}</div>
        </div>
        <div>
          <div class="sub">Cost</div>
          <div class="title" id="rcost-${r.id}">${r.baseCost + lvl}</div>
        </div>
        <div class="controls">
          <button class="btn buy-research" data-id="${r.id}">Research</button>
        </div>
      `;
      el.researchList.appendChild(row);
    }
  }
  el.researchList?.addEventListener('click', (ev) => {
    const target = ev.target.closest('.buy-research');
    if (!target) return;
    buyResearch(target.dataset.id);
    Save.schedule();
  });

  // Achievements
  function buildAchievementsUI(){
    if (!el.achievementsGrid) return;
    el.achievementsGrid.innerHTML = '';
    for (const ac of ACHIEVEMENTS) {
      const card = eln('div', 'ach locked');
      card.id = `ach-${ac.id}`;
      card.innerHTML = `
        <div class="badge">+${Math.round(ac.bonus*100)}%</div>
        <div class="name">${ac.name}</div>
        <div class="desc">${ac.desc}</div>
      `;
      el.achievementsGrid.appendChild(card);
    }
  }

  // Lore UI
  function buildLoreUI(){ updateLoreUI(); }

  // Secret Shop
  function buildSecretShopUI(){
    if (!el.secretShop) return;
    el.secretShop.innerHTML = '';
    for (const item of SECRET_SHOP) {
      const owned = item.id === 'secret1' && state.upgradesPurchased.includes('secret1');
      const dailyAvailable = item.daily ? (Date.now() - (state.secrets.dailyBlessLast || 0) > 24*3600*1000) : true;
      const row = eln('div', 'row');
      row.innerHTML = `
        <div class="icon">🕯️</div>
        <div>
          <div class="title">${item.name}</div>
          <div class="sub">${item.desc}</div>
        </div>
        <div>
          <div class="sub">Cost</div>
          <div class="title">${item.cost} 🔷</div>
        </div>
        <div class="controls">
          <button class="btn secret-buy" data-id="${item.id}" ${owned ? 'disabled' : ''}>
            ${item.daily ? (dailyAvailable ? 'Claim' : '24h CD') : (owned ? 'Owned' : 'Buy')}
          </button>
        </div>
      `;
      el.secretShop.appendChild(row);
    }
  }
  el.secretShop?.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.secret-buy'); if (!btn) return;
    const id = btn.dataset.id;
    handleSecretBuy(id);
    Save.schedule();
  });

  function handleSecretBuy(id){
    const item = SECRET_SHOP.find(x => x.id === id);
    if (!item) return;
  
    if (item.daily) {
      const can = Date.now() - (state.secrets.dailyBlessLast || 0) > 24*3600*1000;
      if (!can) { toast('This blessing needs time.'); return; }
      addBuff({ id: 'daily', name: 'Chrono Blessing', mult: 1.05, duration: 24*3600*1000, color: '#7c5cff' });
      state.secrets.dailyBlessLast = Date.now();
      toast('Chrono Blessing bestowed for 24h!');
    } else if (id === 'secret1') {
      if (state.upgradesPurchased.includes('secret1')) return;
      if (state.crystals < item.cost) { toast('Not enough Crystals.'); return; }
      state.crystals -= item.cost;
      state.upgradesPurchased.push('secret1');
      recomputeModifiers();
      toast('A whisper threads through your circuits.');
    } else {
      // New permanent secrets use flags
      if (isSecretOwned(id)) return;
      if (state.crystals < item.cost) { toast('Not enough Crystals.'); return; }
      state.crystals -= item.cost;
      state.secrets[id] = true;
      recomputeModifiers();
      toast(`Secret learned: ${item.name}`);
    }
    buildSecretShopUI();
    Save.schedule();
  }

  // Minigame: Reaction Rush
  let reactionStage = 'idle';
  let reactionStartTs = 0;
  function startReaction(){
    if (reactionStage !== 'idle') return;

    // Respect cooldown if set
    if ((state.secrets.mgReactionLockUntil || 0) > Date.now()) {
      if (el.reactionStatus) el.reactionStatus.textContent = 'On cooldown. Please wait.';
      return;
    }

    reactionStage = 'waiting';
    if (el.reactionStatus) { el.reactionStatus.textContent = 'Wait for it...'; el.reactionStatus.style.color = ''; }
    if (el.reactionStart) { el.reactionStart.textContent = 'Wait…'; }
    const delay = 800 + Math.random()*1800;
    setTimeout(() => {
      reactionStage = 'now';
      if (el.reactionStatus) { el.reactionStatus.textContent = 'CLICK!'; el.reactionStatus.style.color = '#ffd166'; }
      reactionStartTs = performance.now();
      if (el.reactionStart) { el.reactionStart.textContent = 'CLICK!'; }
    }, delay);
  }
  function finishReactionClick(){
    if (reactionStage !== 'now') return;
    const rt = performance.now() - reactionStartTs;
    reactionStage = 'cooldown';
    const { reward, label } = reactionReward(rt);
    state.crystals += reward + (state.prestige.tree.minigameScholar ? 1 : 0);
    if (el.reactionStatus){ el.reactionStatus.style.color = ''; el.reactionStatus.textContent = `Reaction: ${Math.round(rt)}ms • +${reward} 🔷 (${label})`; }
    if (el.reactionStart) { el.reactionStart.textContent = '…'; }
    log(`Reaction Rush: ${Math.round(rt)}ms (+${reward} Crystals)`);
    if (reward >= 3) state.secrets.mgReactionWin = true;
    updateAchievements(); maybeUnlockLore();
    setTimeout(() => {
      reactionStage = 'idle';
      if (el.reactionStatus) el.reactionStatus.textContent = '';
      if (el.reactionStart) { el.reactionStart.textContent = 'Start'; }
    }, 45000);
  }
  function earlyReactionFail(){
    if (reactionStage !== 'waiting') return;
    reactionStage = 'idle';
    const reward = 0;
    if (el.reactionStatus) { el.reactionStatus.style.color = ''; el.reactionStatus.textContent = `Too early • +${reward} 🔷`; }
    log('Reaction Rush fail: early click');
    // 10-minute cooldown like others
    state.secrets.mgReactionLockUntil = Date.now() + 10 * 60 * 1000;
    if (el.reactionStart) el.reactionStart.textContent = 'Start';
    updateMinigameLocks();
    Save.schedule();
    setTimeout(() => { if (el.reactionStatus) el.reactionStatus.textContent = ''; }, 4000);
  }
  function reactionReward(ms){
    if (ms < 120) return { reward: 7, label: 'Godlike' };
    if (ms < 160) return { reward: 5, label: 'Lightning' };
    if (ms < 220) return { reward: 3, label: 'Swift' };
    if (ms < 320) return { reward: 2, label: 'Decent' };
    return { reward: 1, label: 'Warm-up' };
  }

  // Minigame: Button Sequence
  let seqActive = false, seq = [], seqStep = 0, seqBest = 0;
  function startSequence(){
    if (seqActive) return;
  
    // NEW: cooldown gate
    if ((state.secrets.mgSequenceLockUntil || 0) > Date.now()) {
      if (el.sequenceStatus) el.sequenceStatus.textContent = 'On cooldown. Please wait.';
      return;
    }
  
    seqActive = true; seq = []; seqStep = 0;
    if (el.sequenceStatus) el.sequenceStatus.textContent = 'Memorize...';
    addToSequence();
  }
  function addToSequence(){
    seq.push(1 + Math.floor(Math.random()*4));
    playSequence(seq).then(() => {
      if (el.sequenceStatus) el.sequenceStatus.textContent = 'Your turn!';
      seqStep = 0;
      enableSequenceInput(true);
    });
  }
  function playSequence(arr){
    enableSequenceInput(false);
    return new Promise(async (resolve) => {
      for (let i=0;i<arr.length;i++){
        await flashSeq(arr[i]);
        await sleep(250);
      }
      resolve();
    });
  }
  function flashSeq(n){
    return new Promise((resolve) => {
      const btn = qs(`.seq.s${n}`);
      if (btn){
        btn.classList.add('glow');
        setTimeout(() => { btn.classList.remove('glow'); resolve(); }, 350);
      } else resolve();
    });
  }
  function enableSequenceInput(on){ document.querySelectorAll('.seq').forEach(b => b.disabled = !on); }
  function handleSeqPress(n){
   if (!seqActive) return;
   if (seq[seqStep] !== n){
     // NEW: fail gives 0 crystals and sets 10m cooldown
     const reward = 0;
     // state.crystals unchanged (no add)
     if (el.sequenceStatus) el.sequenceStatus.textContent = `Fail: streak ${seqStep} (best ${seqBest}) • +${reward} 🔷`;
     log(`Button Sequence fail: streak ${seqStep} (best ${seqBest}) +${reward} crystals`);

     seqActive = false;
     enableSequenceInput(false);
     seqBest = Math.max(seqBest, seqStep);
     state.secrets.mgSequenceBest = Math.max(state.secrets.mgSequenceBest || 0, seqBest);

     // Cooldown: 10 minutes
     state.secrets.mgSequenceLockUntil = Date.now() + 10 * 60 * 1000;

     updateAchievements(); maybeUnlockLore();
     Save.schedule();
     setTimeout(() => {
       if (el.sequenceStatus) el.sequenceStatus.textContent = 'Press Start to try again.';
     }, 3000);
     return;
   }
  }

  // Minigame: Timing Bar (replaces - Hold 'n Release)
  const timing = { active:false, raf:0, pos:0, dir:1, speed:0.8, lastT:0, tLeft:0.6, tWidth:0.12 };
  function startHold(){
    if (!el.hold?.start || !el.hold.fill || !el.hold.target || !el.hold.status) return;

    // If on cooldown, ignore
    if ((state.secrets.mgHoldLockUntil || 0) > Date.now()) {
      el.hold.status.textContent = 'On cooldown. Please wait.';
      return;
    }

    if (!timing.active){
      timing.active = true;
      timing.pos = 0; timing.dir = 1;
      timing.speed = 0.7 + Math.random()*0.6;
      timing.lastT = performance.now();
      const width = 0.10 + Math.random()*0.10;
      const left = Math.random() * (0.9 - width) + 0.05;
      timing.tLeft = left; timing.tWidth = width;
      el.hold.target.style.left = `${left*100}%`;
      el.hold.target.style.width = `${width*100}%`;
      el.hold.fill.style.width = `0%`;
      el.hold.status.textContent = 'Press Stop inside the glowing zone!';
      el.hold.start.textContent = 'Stop';
      loopTiming();
    } else {
        timing.active = false;
        cancelAnimationFrame(timing.raf);
        const center = timing.pos;
        
        // Determine success/fail against the target zone
        const tLeft = timing.tLeft;
        const tRight = timing.tLeft + timing.tWidth;
        const inZone = center >= tLeft && center <= tRight;
        
        if (inZone){
        // Success: up to 3 crystals max, regardless of bonuses
        // Track perfect for the achievement if very centered
        const tCenter = timing.tLeft + timing.tWidth/2;
        const normDiff = Math.abs(center - tCenter) / (timing.tWidth/2);
        if (normDiff <= 0.2) state.secrets.mgHoldPerfect = true;

        let reward = 3;
        // Apply minigameScholar but clamp to max 3 total
        if (state.prestige?.tree?.minigameScholar) reward = Math.min(3, reward);
        state.crystals += reward;

        el.hold.status.textContent = `Success at ${(center*100).toFixed(0)}% • +${reward} 🔷`;
        log(`Timing Bar: success +${reward} crystals`);
        updateAchievements(); maybeUnlockLore();
      } else {
        // NEW: fail gives 0 crystals and sets 10m cooldown
        const reward = 0;
        if (el.hold.status) el.hold.status.textContent = `Missed the zone • +${reward} 🔷`;
        log(`Timing Bar fail: +${reward} crystals`);

        // Cooldown: 10 minutes
        state.secrets.mgHoldLockUntil = Date.now() + 10 * 60 * 1000;
      }
    
      el.hold.start.textContent = 'Start';
      Save.schedule();
      updateMinigameLocks();
      setTimeout(()=>{
        if (el.hold.status) el.hold.status.textContent = 'Press Start when ready.';
      }, 4000);
    }
  }
  function loopTiming(){
    if (!timing.active) return;
    const t = performance.now();
    const dt = Math.min(0.05, (t - timing.lastT)/1000);
    timing.lastT = t;
    timing.pos += timing.dir * timing.speed * dt;
    if (timing.pos >= 1){ timing.pos = 1; timing.dir = -1; }
    if (timing.pos <= 0){ timing.pos = 0; timing.dir = 1; }
    el.hold.fill.style.width = `${timing.pos*100}%`;
    timing.raf = requestAnimationFrame(loopTiming);
  }

  // Minigame: Button Bash
  let bashActive = false, bashCount = 0, bashTimer = 0, bashTO = 0;
  function startBash(){
    if (bashActive) return;
  
    // Optional: respect cooldown if set
    if ((state.secrets.mgBashLockUntil || 0) > Date.now()) {
      if (el.bash.status) el.bash.status.textContent = 'On cooldown. Please wait.';
      return;
    }
  
    bashActive = true; bashCount = 0; bashTimer = 10;
    if (el.bash.status) el.bash.status.textContent = 'Go!';
    if (el.bash.btn) el.bash.btn.disabled = false;
    const tick = () => {
      bashTimer -= 1;
      if (bashTimer <= 0) endBash();
      else {
        if (el.bash.status) el.bash.status.textContent = `${bashTimer}s left • ${bashCount} clicks`;
        bashTO = setTimeout(tick, 1000);
      }
    };
    tick();
  }
  function endBash(){
    bashActive = false;
    clearTimeout(bashTO);
    if (el.bash.btn) el.bash.btn.disabled = true;
    let reward = Math.max(1, Math.floor(bashCount/20));
    reward += (state.prestige.tree.minigameScholar ? 1 : 0);
    state.crystals += reward;
    if (el.bash.status) el.bash.status.textContent = `Time! ${bashCount} clicks • +${reward} 🔷`;
    state.secrets.mgBashBest = Math.max(state.secrets.mgBashBest || 0, bashCount);
  // Cooldown: 1 minute after usage
  state.secrets.mgBashLockUntil = Date.now() + 60 * 1000;
  updateMinigameLocks();
    updateAchievements(); maybeUnlockLore();
    Save.schedule();
    setTimeout(()=>{ if (el.bash.status) el.bash.status.textContent = ''; }, 4000);
  }

  // Minigame: Target Tap (replaces Type-O-Tron)
  let targetActive = false, targetCount = 0, targetTimer = 0, targetTO = 0, targetDot = null;
  function startTarget(){
    if (!el.target?.area || !el.target.start || !el.target.status) return;
    if (targetActive) return;

    // cooldown gate
    if ((state.secrets.mgTargetLockUntil || 0) > Date.now()) {
      el.target.status.textContent = 'On cooldown. Please wait.';
        if (inZone){
    }

    targetActive = true; targetCount = 0; targetTimer = 10;
    el.target.status.textContent = 'Tap the target!';
    el.target.start.disabled = true;
    ensureTargetDot();
    positionTargetRandom();
    const tick = () => {
      targetTimer -= 1;
      if (targetTimer <= 0) endTarget();
      else {
        el.target.status.textContent = `${targetTimer}s left • ${targetCount} hits`;
        positionTargetRandom();
        targetTO = setTimeout(tick, 1000);
      }
        // Fail gives 0 crystals
    tick();
  }
  function ensureTargetDot(){
      targetDot.addEventListener('click', () => { if (targetActive) { targetCount++; positionTargetRandom(); } });
      // Cooldown: 1 minute after usage (success or fail)
      state.secrets.mgHoldLockUntil = Date.now() + 60 * 1000;
    }
    if (!el.target.area.contains(targetDot)) el.target.area.appendChild(targetDot);
  }
      updateMinigameLocks();
    if (!el.target?.area || !targetDot) return;
    const areaRect = el.target.area.getBoundingClientRect();
    const size = 34; // match CSS
    const pad = 4;
    const maxX = Math.max(0, areaRect.width - size - pad*2);
    const maxY = Math.max(0, areaRect.height - size - pad*2);
    const x = Math.floor(Math.random() * (maxX + 1)) + pad;
    const y = Math.floor(Math.random() * (maxY + 1)) + pad;
    targetDot.style.left = x + 'px';
    targetDot.style.top = y + 'px';
  }
  function endTarget(){
    targetActive = false;
    clearTimeout(targetTO);
    if (targetDot) targetDot.remove();
    let reward = Math.max(1, Math.floor(targetCount/5));
    reward += (state.prestige.tree.minigameScholar ? 1 : 0);
    state.crystals += reward;
    el.target.status.textContent = `Time! ${targetCount} hits • +${reward} 🔷`;
  // Cooldown: 1 minute after usage
  state.secrets.mgTargetLockUntil = Date.now() + 60 * 1000;
  updateMinigameLocks();
    Save.schedule();
    setTimeout(()=>{ if (el.target.status) el.target.status.textContent = ''; el.target.start.disabled = false; }, 4000);
  }

  // Bind minigame buttons
  el.reactionStart?.addEventListener('click', () => {
    if (reactionStage === 'idle') startReaction();
    else if (reactionStage === 'waiting') earlyReactionFail();
    else if (reactionStage === 'now') finishReactionClick();
  });
  el.sequenceStart?.addEventListener('click', startSequence);
  el.sequenceBoard?.addEventListener('click', (e) => {
    const btn = e.target.closest('.seq'); if (!btn) return;
    handleSeqPress(parseInt(btn.dataset.s,10));
  });
  el.hold.start?.addEventListener('click', startHold);
  el.bash.start?.addEventListener('click', startBash);
  el.bash.btn?.addEventListener('click', () => { if (bashActive) bashCount++; });
  el.target.start?.addEventListener('click', startTarget);

  // Keyboard (konami + quick buy) and anti-hold-Enter exploit
  const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  // Make the version separator dot turn green when ultra hack is active
  const VERSION_DOT_COLOR = '#35d49a';
  
  let __versionDotCached = null;
  function getVersionDot(){
      if (__versionDotCached && document.contains(__versionDotCached)) return __versionDotCached;
  
      // Prefer explicit hooks if present
      let dot = document.getElementById('versionDot') || document.querySelector('.version-dot, .dot-separator');
      if (dot) { __versionDotCached = dot; return dot; }
  
      // Try to find or wrap the bullet near the version label
      if (el.version && el.version.parentElement){
          const parent = el.version.parentElement;
  
          // Look for an existing element that is just the bullet
          for (const n of Array.from(parent.childNodes)){
              if (n.nodeType === 1 && n.textContent.trim() === '•'){ __versionDotCached = n; return n; }
          }
  
          // Wrap a bullet character inside a text node so it can be styled
          for (const n of Array.from(parent.childNodes)){
              if (n.nodeType === 3){
                  const idx = n.nodeValue.indexOf('•');
                  if (idx !== -1){
                      const range = document.createRange();
                      range.setStart(n, idx);
                      range.setEnd(n, idx + 1);
                      const span = document.createElement('span');
                      span.id = 'versionDot';
                      range.surroundContents(span);
                      __versionDotCached = span;
                      return span;
                  }
              }
          }
      }
      return null;
  }
  
  function applyUltraDot(){
      const dot = getVersionDot();
      if (!dot) return;
      dot.style.color = (state.secrets && state.secrets.ultraKonami) ? VERSION_DOT_COLOR : '';
  }
  
  // Hook recomputeModifiers so color updates on load/activation
  const __recomputeModifiers = recomputeModifiers;
  recomputeModifiers = function(){
      const res = __recomputeModifiers.apply(this, arguments);
      try { applyUltraDot(); } catch(_) {}
      return res;
  };
  
  // Try immediately and after first paint
  applyUltraDot();
  requestAnimationFrame(applyUltraDot);

  const ultraSeq = [
      'ArrowLeft','ArrowUp','ArrowDown','ArrowRight',
      'ArrowLeft','ArrowDown','ArrowUp','ArrowLeft',
      'ArrowRight','ArrowUp','ArrowRight','ArrowDown', 'o', 'p'
  ];

  const ULTRA_ALLOWED_KEY_GAP_MS = 2000;

  const normKey = (k) => (k && k.length === 1 ? k.toLowerCase() : k);

  const endsWithSeq = (buf, seq) => {
    if (buf.length < seq.length) return false;
    const slice = buf.slice(-seq.length);
    for (let i = 0; i < seq.length; i++) {
      if (normKey(slice[i]) !== seq[i]) return false;
    }
    return true;
  };

  const maxSeqLen = Math.max(konamiSeq.length, ultraSeq.length);

  let keyBuf = [];
  let lastKeyTs = 0;
  
  window.addEventListener('keydown', (e) => {
    // Prevent repeated Enter/Space from auto-clicking focused buttons (but allow inputs)
    if ((e.key === 'Enter' || e.key === ' ') && e.repeat){
      const ae = document.activeElement;
      const tag = ae && ae.tagName;
      const isFormInput = tag === 'INPUT' || tag === 'TEXTAREA';
      if (!isFormInput){
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    function isSecretOwned(id){
      if (id === 'secret1') return state.upgradesPurchased.includes('secret1');
      // Flags for new secrets
      const flags = state.secrets || {};
      return !!flags[id];
    }

    // Reset buffer if you paused too long between keys (gives you a clear session)
    const nowTs = performance.now();
    if (nowTs - lastKeyTs > ULTRA_ALLOWED_KEY_GAP_MS) {
      keyBuf = [];
    }
    lastKeyTs = nowTs;

    keyBuf.push(e.key);
    if (keyBuf.length > maxSeqLen) keyBuf.shift();

    // Konami (unchanged, but via safe full-length check)
    if (endsWithSeq(keyBuf, konamiSeq)){
      if (!state.secrets.konami){
        state.secrets.konami = true;
        state.secrets.secretShopUnlocked = true;
        el.secretTab?.classList.remove('hidden');
        toast('A secret shop reveals itself...');
        buildSecretShopUI();
        recomputeModifiers();
        updateAchievements();
        maybeUnlockLore();
        Save.schedule();
      }
    }

    // Ultra-cheat: Click Power x100 (only once, persistent)
    if (endsWithSeq(keyBuf, ultraSeq)) {
      if (!state.secrets.ultraKonami) {
        state.secrets.ultraKonami = true;
        toast('Ultra Cheat Activated: Click Power x100!');
        recomputeModifiers();
        updateTop();
        Save.schedule();
      }
    }

    const idx = parseInt(e.key, 10);
    if (idx >= 1 && idx <= TOWERS.length){
      const tower = TOWERS[idx-1].id;
      if (e.altKey) buyTower(tower, 'max');
      else if (e.shiftKey) buyTower(tower, '10');
      else buyTower(tower, '1');
      maybeUnlockLore();
      Save.schedule();
    }
  });

  // Buffs & rare button
  function addBuff({ id, name, mult, duration, color }){
    const until = Date.now() + duration;
    state.buffs = state.buffs.filter(b => b.id !== id);
    state.buffs.push({ id, name, mult, duration, until, color });
  }

  let suzyTimer = null;
  const SUZY_INTERVAL_MS = 15 * 60 * 1000;
  function startSuzyTicker(){
    try { log('Removed Suzy'); } catch(_) {}
  
    if (suzyTimer) clearInterval(suzyTimer);
    suzyTimer = setInterval(() => {
      try { log('Removed Suzy'); } catch(_) {}
    }, SUZY_INTERVAL_MS);
  }

  let cometTimer = null;
  function scheduleComet(){
    if (cometTimer) clearTimeout(cometTimer);
    const delay = 7200000; // 2 hours in ms
    cometTimer = setTimeout(spawnComet, delay);
  }
  function spawnComet(){
    const orb = eln('div', 'rare-orb'); // styled like a mini golden button
    const vw = Math.max(80, (el.root?.clientWidth || window.innerWidth) - 100);
    const vh = Math.max(80, (el.root?.clientHeight || window.innerHeight) - 160);
    const x = Math.floor(Math.random() * vw) + 50;
    const y = Math.floor(Math.random() * vh) + 80;
    const scale = (0.75 + Math.random() * 0.60).toFixed(2);

    orb.style.setProperty('--target-scale', scale);

    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    orb.setAttribute('aria-label', 'Golden Button');
    el.rareLayer?.appendChild(orb);

    // Lifetime can still be influenced by upgrades if you want
    const tree = state.prestige.tree || {};
    const extra = (tree.goldenGlare ? 5000 : 0) + (tree.goldenGlare2 ? 5000 : 0);
    const ttl = 20000 + extra;
  
    const timeout = setTimeout(() => {
      orb.classList.add('despawn');
      setTimeout(() => { orb.remove(); scheduleComet(); }, 460);
    }, ttl);
  
    orb.addEventListener('click', () => {
      clearTimeout(timeout);
      state.secrets.cometClicked = true;
      state.secrets.cometCount = (state.secrets.cometCount || 0) + 1;
      orb.classList.add('despawn');
      setTimeout(() => {
        orb.remove();
        const strengthBase = 50 * (tree.goldenFervor ? 1.5 : 1);
        const strength = strengthBase * (state.secrets.secretGolden ? 1.25 : 1);
        addBuff({ id: 'op', name: 'Golden Button', mult: strength, duration: ttl, color: '#ffd166' });
        log('You tapped a Golden Button! Massive boost!');
        Save.schedule();
        scheduleComet();
      }, 200);
    });
  }
  function theY(){} // harmless

  function maybeUnlockLore(){
    const before = Object.keys(state.lore).length;
    for (const entry of LORE) if (entry.cond(state)) state.lore[entry.id] = true;
    if (Object.keys(state.lore).length > before) {
      updateLoreUI();
      const last = LORE.find(l => state.lore[l.id] && !l._announced);
      if (last){
        toast(`Lore unlocked: ${last.title}`);
        last._announced = true;
      }
      Save.schedule();
    }
  }

  // Ascension math
  function heavenlyFromTotal(totalButtons){
    return Math.floor(Math.sqrt(totalButtons / 1e12));
  }
  function heavenlyBank(){ return (state.prestige.heavenly.total - state.prestige.heavenly.spent); }
  function heavenlyPotential(){ return Math.max(0, heavenlyFromTotal(state.totalManaEarned) - state.prestige.heavenly.total); }
  function canAscend(){ return heavenlyPotential() >= 1; }
  function updateAscensionUI(){
    if (el.asc.total) el.asc.total.textContent = format(state.totalManaEarned);
    if (el.asc.banked) el.asc.banked.textContent = `${heavenlyBank()} ✨`;
    if (el.asc.totalh) el.asc.totalh.textContent = `${state.prestige.heavenly.total} ✨`;
    if (el.asc.potential) el.asc.potential.textContent = `${heavenlyPotential()} ✨`;
    if (el.asc.btn) el.asc.btn.disabled = !canAscend();
  }
  function buyNode(id){
    const node = TREE.find(n => n.id === id); if (!node) return;
    if (state.prestige.tree[id]) return;
    const locked = !node.prereq.every(p => state.prestige.tree[p]);
    if (locked) return;
    if (heavenlyBank() < node.cost) return;
    state.prestige.heavenly.spent += node.cost;
    state.prestige.tree[id] = true;
    toast(`Heavenly upgrade: ${node.name}`);
    recomputeModifiers();
    buildAscensionUI();
    Save.schedule();
  }
  function doAscend(gain){
    state.prestige.heavenly.total += gain;
    state.prestige.ascensions += 1;
  
    const keep = {
      version: state.version,
      settings: state.settings,
      secrets: state.secrets,
      lore: state.lore,
      prestige: state.prestige
    };
  
    const fresh = {
      mana: 0, totalManaEarned: 0, totalClicks: 0,
      clickBase: 1, clickMult: 1, globalMult: 1, critChance: 0.02, critMult: 10,
      towers: {}, towerMult: {}, synergy: { workshopPerLab: 0, clickbotPerServer: 0 },
      upgradesPurchased: [],
      crystals: 0,
      research: {},
      buffs: [],
      ui: { lastSave: 0, lastTick: performance.now(), lastUi: performance.now() }
    };
    for (const t of TOWERS) fresh.towers[t.id] = { count: 0, baseCost: t.baseCost, costMult: t.costMult, baseProd: t.baseProd };
    for (const t of TOWERS) fresh.towerMult[t.id] = 1;
    for (const r of RESEARCH) fresh.research[r.id] = 0;
  
    Object.assign(state, fresh, keep);

    state.runStartTs = Date.now();
  
    const tree = state.prestige.tree || {};
    if (tree.starter)    state.mana += 1000;
    if (tree.engineer)   state.towers.clickbot.count += 1;
    if (tree.grant)      state.crystals += 3;
  
    // New start boosts
    if (tree.starter2)       state.mana += 50000;
    if (tree.seedCapital)    state.mana += 250000;
    if (tree.quantumBackers) state.mana += 1000000;
  
    if (tree.engineer2)      state.towers.clickbot.count += 4;
    if (tree.architect)      state.towers.workshop.count += 3;
    if (tree.labSponsor)     state.towers.lab.count += 1;
  
    recomputeModifiers();
    buildAllUI();
    Save.forceNow();
    toast(`Ascended! Gained ${gain} Heavenly Clicks.`);
    log(`Ascension complete. +${gain} ✨ Heavenly Clicks.`);
  }

  // Build ascension UI
  function buildAscensionUI(){
    updateAscensionUI();
    if (!el.asc.treeGrid) return;
    el.asc.treeGrid.innerHTML = '';
    for (const node of TREE){
      const owned = !!state.prestige.tree[node.id];
      if (owned) continue;
      const canAfford = heavenlyBank() >= node.cost;
      const locked = !node.prereq.every(p => state.prestige.tree[p]);
      const card = eln('div', `node ${locked && !owned ? 'locked':''}`);
      card.dataset.node = node.id;
      card.innerHTML = `
        <div class="icon">${node.icon}</div>
        <div>
          <div class="name">${node.name}</div>
          <div class="desc">${node.desc}</div>
        </div>
        <div class="controls">
          <div class="cost">${node.cost} ✨</div>
          <button class="btn buy-node" ${owned ? 'disabled' : ''}>${owned ? 'Owned' : 'Buy'}</button>
        </div>
      `;
      const btn = card.querySelector('.buy-node');
      if (btn){
        btn.disabled = owned || locked || !canAfford;
        btn.classList.toggle('pulse', !btn.disabled && !owned);
      }
      el.asc.treeGrid.appendChild(card);
    }
  }
  el.asc.treeGrid?.addEventListener('click', (e) => {
    const nodeEl = e.target.closest('.node'); if (!nodeEl) return;
    const btn = e.target.closest('.buy-node'); if (!btn) return;
    const id = nodeEl.dataset.node;
    buyNode(id);
  });
  el.asc.btn?.addEventListener('click', () => {
    const pot = heavenlyPotential();
    if (pot < 1) { toast('Ascend when you can gain Heavenly Clicks.'); return; }
    if (!confirm(`Ascend and gain ${pot} Heavenly Clicks? This will reset your run.`)) return;
    doAscend(pot);
  });

  // Buy actions
  function buyTower(id, mode){
    const t = state.towers[id];
    if (!t) return;
    if (mode === 'max'){
      let bought = 0;
      while (true){
        const cost = getSingleTowerCost(id);
        if (state.mana < cost) break;
        state.mana -= cost;
        t.count++;
        bought++;
        if (bought > 10000) break;
      }
      if (bought > 0) log(`Bought ${bought} ${TOWERS.find(tt=>tt.id===id).name}(s).`);
      return;
    }
    const qty = parseInt(mode, 10);
    const cost = getTowerCost(id, qty);
    if (spendMana(cost)){
      t.count += qty;
      log(`Bought ${qty} ${TOWERS.find(tt=>tt.id===id).name}(s).`);
    }
  }
  function buyUpgrade(id){
    const up = UPGRADES.find(u => u.id === id);
    if (!up) return;
    if (state.upgradesPurchased.includes(id)) return;
    if (!up.cond(state)) return;
    if (!spendMana(up.cost)) return;
    state.upgradesPurchased.push(id);
    recomputeModifiers();
    log(`Upgrade purchased: ${up.name}`);
    buildUpgradesUI(); // NEW: rebuild to hide it
  }
  function buyResearch(id){
    const r = RESEARCH.find(x => x.id === id);
    if (!r) return;
    const cur = state.research[id] || 0;
    const max = researchMax(id);
    if (cur >= max) return;
    const cost = r.baseCost + cur;
    if (state.crystals < cost) return;
    state.crystals -= cost;
    state.research[id] = cur + 1;
    recomputeModifiers();
    log(`Research advanced: ${r.name} Lv.${state.research[id]}/${max}`);
    buildResearchUI();
  }

  // Save/Load
  function saveGame(){ Save.forceNow(); }
  function loadGame(){
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw){
      for (const k of LEGACY_KEYS){
        const legacy = localStorage.getItem(k);
        if (legacy){ raw = legacy; break; }
      }
    }
    if (!raw) return { loaded:false };

    try{
      const obj = JSON.parse(raw);
      if (!validateSave(obj)) throw new Error('Invalid save shape');
      loadSaveObj(obj);
      return { loaded:true, schema: obj.schema || null };
    }catch(e){
      console.warn('Failed to load save (corrupt or invalid). Backing up and starting fresh.', e);
      try { localStorage.setItem(SAVE_KEY + '.bad', raw); } catch(_){}
      return { loaded:false };
    }
  }
  function loadSaveObj(obj){
    state.mana = +obj.mana || 0;
    state.totalManaEarned = +obj.totalManaEarned || 0;
    state.totalClicks = +obj.totalClicks || 0;
    state.lifetimeManaEarned = +obj.lifetimeManaEarned || state.lifetimeManaEarned || 0;
    state.lifetimeClicks = +obj.lifetimeClicks || state.lifetimeClicks || 0;
    state.runStartTs = +obj.runStartTs || state.runStartTs || Date.now();
    if (obj.towerProduced && typeof obj.towerProduced === 'object') {
    for (const t of TOWERS) {
        const v = +obj.towerProduced[t.id];
        if (Number.isFinite(v) && v >= 0) state.towerProduced[t.id] = v;
    }
    }
  
    if (obj.towers) {
      for (const id of Object.keys(state.towers)) {
        const saved = obj.towers[id];
        if (saved && typeof saved.count === 'number') state.towers[id].count = saved.count;
      }
    }
    state.upgradesPurchased = Array.isArray(obj.upgradesPurchased) ? [...new Set(obj.upgradesPurchased)] : [];
    state.crystals = +obj.crystals || 0;
    if (obj.research) for (const k of Object.keys(state.research)) state.research[k] = +obj.research[k] || 0;
  
    if (obj.settings) state.settings = { ...state.settings, ...obj.settings };
    if (obj.secrets)  state.secrets  = { ...state.secrets,  ...obj.secrets };
    if (obj.lore)     state.lore     = { ...obj.lore };
    if (obj.prestige) state.prestige = { ...state.prestige, ...obj.prestige };
  
    // NEW: restore buffs (sanitize and drop expired)
    if (Array.isArray(obj.buffs)) {
        const now = Date.now();
        state.buffs = obj.buffs
            .map(b => ({
            id: String(b?.id || ''),
            name: String(b?.name || 'Buff'),
            mult: +b?.mult || 1,
            duration: Math.max(1, +b?.duration || 0),
            until: +b?.until || 0,
            color: b?.color || '#00f5d4'
            }))
            .filter(b => b.until > now);
        } else {
        state.buffs = state.buffs || [];
        }
  
    for (const t of TOWERS) if (!state.towerMult[t.id]) state.towerMult[t.id] = 1;
    if (!state.prestige.heavenly) state.prestige.heavenly = { total: 0, spent: 0 };
    if (!state.prestige.tree) state.prestige.tree = {};
    el.secretTab && state.secrets.secretShopUnlocked && el.secretTab.classList.remove('hidden');
  }

  // Autosave & options
  el.saveBtn?.addEventListener('click', saveGame);
  el.exportBtn?.addEventListener('click', () => {
    if (!el.saveData) return;
    el.saveData.value = btoa(unescape(encodeURIComponent(JSON.stringify(buildSave()))));
    el.saveData.select(); el.saveData.setSelectionRange(0, el.saveData.value.length);
    document.execCommand('copy');
    toast('Save data copied to clipboard.');
  });
  el.importBtn?.addEventListener('click', () => {
    if (!el.saveData) return;
    const raw = el.saveData.value.trim();
    if (!raw) return;
    try{
      const json = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (!validateSave(json)) throw new Error('Invalid save content');
      loadSaveObj(json);
      recomputeModifiers();
      buildAllUI();
      Save.forceNow();
      toast('Save imported.');
      log('Save imported.');
    }catch(e){
      alert('Import failed. Check your data.');
    }
  });
  el.resetBtn?.addEventListener('click', () => {
    if (confirm('Hard reset? This will DELETE your progress (but not your exported backups).')) {
      hardReset();
    }
  });
  el.autosaveInterval?.addEventListener('change', () => {
    const sel = parseInt(el.autosaveInterval.value,10) || 15;
    state.settings.autosaveSec = clamp(sel,5,120);
    // reflect possibly clamped value back into select if not present
    const match = Array.from(el.autosaveInterval.options).some(o => parseInt(o.value,10) === state.settings.autosaveSec);
    if (!match) el.autosaveInterval.value = String(state.settings.autosaveSec);
    toast(`Autosave: ${state.settings.autosaveSec}s`);
    Save.schedule();
  });
  el.animationsToggle?.addEventListener('change', () => {
    state.settings.animations = el.animationsToggle.value;
    Save.schedule();
  });
  // Music volume control
  function setMusicVolumeFromSlider() {
    if (!el.musicVolume) return;
    const v = clamp(parseInt(el.musicVolume.value, 10) || 0, 0, 100);
    state.settings.musicVol = v / 100;
    if (el.musicVolumeLabel) el.musicVolumeLabel.textContent = `${v}%`;
    if (__music) __music.volume = state.settings.musicVol;
    Save.schedule();
  }
  el.musicVolume?.addEventListener('input', setMusicVolumeFromSlider);

  // Background music player
  const MUSIC_TRACKS = [
    'music/music_main1.mp3',
    'music/music_main2.mp3',
    'music/music_main3.mp3',
    'music/music_main4.mp3'
  ];
  function shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  let __music = null;
  let __musicQueue = [];
  function ensureMusic(){
    try{
      if (!state.settings.musicEnabled) return; // soft disable if ever needed
      if (!__music) {
        __music = new Audio();
        __music.loop = false;
        __music.preload = 'auto';
        __music.volume = clamp(state.settings.musicVol ?? 0.6, 0, 1);
        __music.addEventListener('ended', playNextTrack);
        // Try to play only after user interaction due to autoplay policies
        const kick = () => { if (__music && __music.paused) { try { __music.play().catch(()=>{}); } catch(_){} }
                             window.removeEventListener('pointerdown', kick);
                           };
        window.addEventListener('pointerdown', kick, { once: true });
      }
      if (__musicQueue.length === 0) __musicQueue = shuffle(MUSIC_TRACKS.slice());
      if (__music.paused && !__music.src) playNextTrack();
    }catch(_){ /* ignore */ }
  }
  function playNextTrack(){
    if (!__music) return;
    if (__musicQueue.length === 0) __musicQueue = shuffle(MUSIC_TRACKS.slice());
    const next = __musicQueue.shift();
    __music.src = next;
    __music.currentTime = 0;
    __music.volume = clamp(state.settings.musicVol ?? 0.6, 0, 1);
    // Attempt play; if blocked, it will start after first pointerdown
    __music.play().catch(()=>{});
  }

  function grantOfflineEarnings(){
    const last = state.secrets?.lastOnlineTs || 0;
    const now = Date.now();
    const elapsedSec = Math.max(0, Math.floor((now - last) / 1000));
    if (!last || elapsedSec < 10) { // ignore trivial gaps
      state.secrets.lastOnlineTs = now;
      return;
    }
    // Base offline rate is 20%; Temporal Echoes secret improves to 30%
    const rate = state.secrets?.secretOffline ? 0.30 : 0.20;
    // Use current MPS without temporary buffs (getActiveBuffMult() already filters expired)
    const mps = computeMps();
    const gain = mps * elapsedSec * rate;
    if (gain > 0) {
      addMana(gain);
      const hh = Math.floor(elapsedSec / 3600);
      const mm = Math.floor((elapsedSec % 3600) / 60);
      const ss = elapsedSec % 60;
      toast(`While you were away ${hh}h ${mm}m ${ss}s: +${format(gain)} buttons at ${Math.round(rate*100)}% rate.`);
      log(`Offline earnings: +${format(gain)} (${elapsedSec}s at ${Math.round(rate*100)}%).`);
    }
    state.secrets.lastOnlineTs = now;
    Save.schedule();
  }

  // Save on page hide/close
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      try { state.secrets.lastOnlineTs = Date.now(); } catch(_) {}
      Save.forceNow();
    }
  });
  window.addEventListener('beforeunload', () => {
    try { state.secrets.lastOnlineTs = Date.now(); } catch(_) {}
    Save.forceNow();
  });
  const ALL_SAVE_KEYS = [SAVE_KEY, ...LEGACY_KEYS, SAVE_KEY + '.bad']; // include legacy and backup keys

  function hardReset() {
    Save.suppress = true; // block any pending or beforeunload saves
    try {
      for (const k of ALL_SAVE_KEYS) localStorage.removeItem(k);
    } catch (e) {
      console.warn('Error clearing storage during reset:', e);
    }
    // Optional: Visual feedback
    try { toast('Resetting...'); } catch (_) {}
    // Reload without triggering save
    setTimeout(() => {
      // Use replace so history back won’t return to pre-reset state
      location.replace(location.href);
    }, 50);
  }

  // Loop
  function tick(){
    const t = now();
    const dt = Math.min(0.25, (t - state.ui.lastTick)/1000);
    state.ui.lastTick = t;
  
    // NEW: accumulate per-tower produced
    const buff = getActiveBuffMult();
    for (const tw of TOWERS) {
      const perEach = towerProdPer(tw.id) * state.globalMult * buff;
      const perAll = perEach * (state.towers[tw.id].count || 0);
      state.towerProduced[tw.id] = (state.towerProduced[tw.id] || 0) + perAll * dt;
    }
  
    const mps = computeMps();
    addMana(mps * dt);
  
    if (t - state.ui.lastUi > 100){
      updateTop();
      updateStoreUI();
      updateUpgradesUI();
      updateResearchUI();
      updateAchievements();
      updateMinigameLocks();
      updateLoreUI();
      updateAscensionUI();
      updateStatsUI(); // NEW
      state.ui.lastUi = t;
    }
  }

  // Build all UI chunks
  function buildAllUI(){
    buildStoreUI();
    buildUpgradesUI();
    buildResearchUI();
    buildAchievementsUI();
    buildLoreUI();
    buildSecretShopUI();
    buildAscensionUI();
    updateTop();
    updateStoreUI();
    updateUpgradesUI();
    updateResearchUI();
    updateAchievements();
    updateMinigameLocks();
    updateLoreUI();
    updateAscensionUI();
    buildStatsUI();
    bindBuffTooltipHandlers();
    bindTowerTooltipHandlers();
    bindBuffTooltipHandlers();
  }

  // INIT with loader (no infinite load)
  (async function init(){
    startLoader();
    try{
      await sleep(150);
      setProgress(18);

      try{
        const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
        await Promise.race([fontsReady, sleep(1200)]);
      }catch(_){} 
      setProgress(38);
      
      if (performOneTimeWipeIfNeeded()) return;
      
      const info = loadGame();
      const isPreUpdateSave = info.loaded && (!info.schema || (+info.schema.wipeBaseline || 0) < WIPE_BASELINE);

      try{
        if (isPreUpdateSave && !localStorage.getItem(WIPE_DONE_KEY) && !localStorage.getItem(WIPE_PENDING_KEY)){
          localStorage.setItem(WIPE_PENDING_KEY, '1');

          try { toast('An update requires a one-time reset. Refreshing in 5 seconds...'); } catch(_) {}
          try { Save.suppress = true; } catch(_) {}
          setTimeout(() => {
            try { location.replace(location.href); } catch { location.reload(); }
          }, 5000);
        }
      }catch(_){}

      loadGame();
      recomputeModifiers();
      grantOfflineEarnings();
      setProgress(58);

      buildAllUI();
      bindTabs();
      scheduleComet();
      startSuzyTicker();
      setProgress(78);

  if (el.autosaveInterval) el.autosaveInterval.value = String(state.settings.autosaveSec || 15);
      if (el.animationsToggle) el.animationsToggle.value = state.settings.animations || 'on';
      if (el.musicVolume) {
        const v = Math.round(clamp(state.settings.musicVol ?? 0.6, 0, 1) * 100);
        el.musicVolume.value = String(v);
        if (el.musicVolumeLabel) el.musicVolumeLabel.textContent = `${v}%`;
      }
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.matches && state.settings.animations === 'on'){
        state.settings.animations = 'reduced';
        if (el.animationsToggle) el.animationsToggle.value = 'reduced';
      }
      setProgress(92);

      (function loop(){ tick(); requestAnimationFrame(loop); })();
      // Start background music after init
      ensureMusic();
    } catch (err){
      console.error('Init error:', err);
      toast('Init error — continuing with safe defaults.');
    } finally {
      finishLoader(false);
    }
  })();

  // Global safety: if anything throws later, don't leave loader up
  window.addEventListener('error', () => { if (el.loader && !el.loader.classList.contains('hide')) finishLoader(true); });
  window.addEventListener('unhandledrejection', () => { if (el.loader && !el.loader.classList.contains('hide')) finishLoader(true); });

  // Utils
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

  // Tabs — event delegation fix (prevents getting stuck on Upgrades)
  function activateTab(tabId) {
  // Toggle tab button active state
  document.querySelectorAll('.ctab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
  });
  // Toggle panes
  document.querySelectorAll('.tabpane').forEach(p => p.classList.remove('active'));
  const pane = document.getElementById(`ctab-${tabId}`);
  if (pane) pane.classList.add('active');
  }
  
  function bindTabs() {
  const nav = document.querySelector('.center-tabs');
  if (!nav) return;
  if (nav.__tabsBound) return; // avoid double-binding
  nav.__tabsBound = true;
  
  nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.ctab');
      if (!btn || btn.classList.contains('hidden')) return;
      const tabId = btn.dataset.tab;
      if (!tabId) return;
      activateTab(tabId);
  });
  
  // Ensure initial state is consistent (use the one marked active, or fall back to upgrades)
  const initial = document.querySelector('.ctab.active')?.dataset.tab || 'upgrades';
  activateTab(initial);
  }

  // --- Buff tooltip (singleton) ---
  let __buffTipEl = null;
  let __buffTipTimer = 0;
  let __buffTipChip = null;
  let __buffTipData = null; // { id,name,mult,duration,until,color }
  
  function ensureBuffTipEl(){
    if (__buffTipEl && document.body.contains(__buffTipEl)) return __buffTipEl;
    const el = document.createElement('div');
    el.className = 'buff-tooltip';
    el.style.left = '0px';
    el.style.top = '0px';
    document.body.appendChild(el);
    __buffTipEl = el;
    return el;
  }
  function fmtTimeLeft(ms){
    const hh = Math.floor(ms / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    return hh > 0 ? `${hh}h ${String(mm).padStart(2,'0')}m ${String(ss).padStart(2,'0')}s`
                  : `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  function setBuffTooltipContent(buff){
    const tip = ensureBuffTipEl();
    const now = Date.now();
    const remaining = Math.max(0, (+buff.until||0) - now);
    const mult = +buff.mult || 1;
    const multTxt = mult >= 1 ? `x${mult.toFixed(mult >= 10 ? 0 : 2)}` : `${Math.round((mult-1)*100)}%`;
  
    tip.innerHTML = `
      <div class="tt-title">${buff.name || 'Buff'}</div>
      <div class="tt-row">
        <span class="tt-badge" style="--accent:${buff.color || '#00f5d4'}">${multTxt}</span>
        <span>All production</span>
      </div>
      <div class="tt-row">
        <span>Time left:</span>
        <strong>${fmtTimeLeft(remaining)}</strong>
      </div>
    `;
  }
  function intersects(a, b){
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  function positionBuffTooltip(ev, chip){
    const tip = ensureBuffTipEl();
    tip.style.visibility = 'hidden';
    tip.classList.add('show'); // ensure measurable
    const tipRect0 = tip.getBoundingClientRect();
  
    const margin = 8;
    let x = ev.clientX + 16;
    let y = ev.clientY + 16;
  
    // Base clamp to viewport
    x = Math.min(window.innerWidth - tipRect0.width - margin, Math.max(margin, x));
    y = Math.min(window.innerHeight - tipRect0.height - margin, Math.max(margin, y));
  
    // Keep tooltip outside the buff bar horizontally (slide to the side)
    const bar = el.buffsTop;
    if (bar){
      const barRect = bar.getBoundingClientRect();
      // Recompute tip rect at current (x,y) for precise overlap test
      const tipRect = {
        left: x, top: y,
        right: x + tipRect0.width,
        bottom: y + tipRect0.height
      };
      if (intersects(tipRect, barRect)) {
        const chipRect = chip?.getBoundingClientRect?.() || barRect;
        // Prefer placing to the right of the bar; if not, place to the left
        const rightX = barRect.right + margin;
        const leftX  = barRect.left - tipRect0.width - margin;
  
        // Choose side based on cursor/chip position and room
        if (rightX + tipRect0.width <= window.innerWidth) {
          x = rightX;
          // vertically align around chip if available
          if (chipRect) y = Math.min(window.innerHeight - tipRect0.height - margin,
                                     Math.max(margin, chipRect.top));
        } else if (leftX >= margin) {
          x = leftX;
          if (chipRect) y = Math.min(window.innerHeight - tipRect0.height - margin,
                                     Math.max(margin, chipRect.top));
        } // else fallback to clamped position already set
      }
    }
  
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.style.visibility = '';
    tip.classList.add('show');
  }
  function showBuffTooltip(ev, chip, buff){
    __buffTipChip = chip;
    __buffTipData = { ...buff };
    setBuffTooltipContent(__buffTipData);
    positionBuffTooltip(ev, chip);
    // live update remaining time while visible
    clearInterval(__buffTipTimer);
    __buffTipTimer = setInterval(() => {
      if (!__buffTipData || !__buffTipEl?.classList.contains('show')) return;
      setBuffTooltipContent(__buffTipData);
      // keep position near latest mouse position via last event stored on chip
    }, 250);
  }
  function moveBuffTooltip(ev, chip){
    if (!__buffTipEl?.classList.contains('show')) return;
    if (!__buffTipChip || __buffTipChip !== chip) return;
    // update position relative to cursor but keep outside buff bar
    positionBuffTooltip(ev, chip);
  }
  function hideBuffTooltip(){
    clearInterval(__buffTipTimer);
    __buffTipTimer = 0;
    __buffTipChip = null;
    __buffTipData = null;
    if (__buffTipEl) __buffTipEl.classList.remove('show');
  }
  function bindBuffTooltipHandlers(){
    if (!el.buffsTop || el.buffsTop.__buffTipBound) return;
    el.buffsTop.__buffTipBound = true;
  
    el.buffsTop.addEventListener('pointerover', (e) => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      // build buff object from dataset
      const d = chip.dataset;
      const buff = {
        id: d.buffId || '',
        name: d.buffName || 'Buff',
        mult: +(d.buffMult || 1),
        duration: Math.max(1, +(d.buffDuration || 0)),
        until: +(d.buffUntil || 0),
        color: d.buffColor || '#00f5d4'
      };
      showBuffTooltip(e, chip, buff);
    });
    el.buffsTop.addEventListener('pointermove', (e) => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      // keep following cursor
      moveBuffTooltip(e, chip);
    });
    el.buffsTop.addEventListener('pointerout', (e) => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      const to = e.relatedTarget;
      if (to && chip.contains(to)) return; // moving within the same chip
      hideBuffTooltip();
    });
    // Hide on scroll or window blur
    window.addEventListener('scroll', hideBuffTooltip, { passive: true });
    window.addEventListener('blur', hideBuffTooltip);
  }

  function pct(n){ return `${Math.round(n*100)}%`; }
  function sumTowers(){ return TOWERS.reduce((a,t)=>a+(state.towers[t.id]?.count||0),0); }
  function unlockedAchievements(){
    let u=0; for (const ac of ACHIEVEMENTS) if (state.secrets[`ach_${ac.id}`]) u++;
    return u;
  }
  function researchProgress(){
    let cur=0,max=0;
    for (const r of RESEARCH) { const lvl = state.research[r.id]||0; const m = researchMax(r.id); cur += lvl; max += m; }
    return { cur, max, pct: max ? cur/max : 0 };
  }
  function heavenlyProgress(){
    const owned = Object.keys(state.prestige.tree||{}).length;
    return { cur: owned, max: TREE.length, pct: TREE.length ? owned/TREE.length : 0 };
  }
  function timeSince(ts){
    const s = Math.max(0, Math.floor((Date.now()-ts)/1000));
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return `${h}h ${String(m).padStart(2,'0')}m ${String(sec).padStart(2,'0')}s`;
  }
  function buildStatsUI(){
    updateStatsUI();
  }
  function updateStatsUI(){
    if (!el.statsGrid) return;
    const upgradesOwned = state.upgradesPurchased.length;
    const upgradesTotal = UPGRADES.length;
    const achUnlocked = unlockedAchievements();
    const achTotal = ACHIEVEMENTS.length;
    const rp = researchProgress();
    const hp = heavenlyProgress();
  
    const rows = [
      ['Buttons in bank', `${format(state.mana)}`],
      ['Buttons (this ascension)', `${format(state.totalManaEarned)} (${format(state.lifetimeManaEarned)} all-time)`],
      ['Buttons per second', `${format(computeMps())}`],
      ['Buttons per click', `+${format(Math.max(1, Math.floor(clickPower())))}`],
      ['Button clicks', `${format(state.totalClicks)} (${format(state.lifetimeClicks)} all-time)`],
      ['Golden Buttons clicked', `${format(state.secrets.cometCount || 0)}`],
      ['Towers owned', `${format(sumTowers())}`],
      ['Run started', new Date(state.runStartTs).toLocaleString() + ` • ${timeSince(state.runStartTs)} ago`],
      ['Running version', GAME_VERSION],
      ['Upgrades', `${upgradesOwned}/${upgradesTotal} • ${pct(upgradesTotal? upgradesOwned/upgradesTotal:0)}`],
      ['Research', `${rp.cur}/${rp.max} • ${pct(rp.pct)}`],
      ['Heavenly', `${hp.cur}/${hp.max} • ${pct(hp.pct)}`],
      ['Achievements', `${achUnlocked}/${achTotal} • ${pct(achTotal? achUnlocked/achTotal:0)}`]
    ];
  
    el.statsGrid.innerHTML = rows.map(([k,v]) =>
      `<div class="stats-row"><span class="k">${k}</span><span class="v">${v}</span></div>`
    ).join('');
  }

  function setTowerTooltipContent(towerId){
    const tip = ensureBuffTipEl();
    const def = TOWERS.find(t => t.id === towerId);
    if (!def) return;
    const buff = getActiveBuffMult();
    const each = towerProdPer(towerId) * state.globalMult * buff;
    const count = state.towers[towerId]?.count || 0;
    const all = each * count;
    const total = computeMps();
    const share = total > 0 ? (all / total) : 0;
    const produced = state.towerProduced[towerId] || 0;
    tip.innerHTML = `
      <div class="tt-title">${def.emoji} ${def.name}</div>
      <div class="tt-row"><span class="tt-badge">+${format(each)}/s</span><span>Each</span></div>
      <div class="tt-row"><span class="tt-badge">+${format(all)}/s</span><span>All (${Math.round(share*100)}% of BpS)</span></div>
      <div class="tt-row"><span class="tt-badge">${format(produced)}</span><span>Produced (lifetime)</span></div>
    `;
  }
  function bindTowerTooltipHandlers(){
    if (!el.towersList || el.towersList.__ttBound) return;
    el.towersList.__ttBound = true;
    el.towersList.addEventListener('pointerover', (e) => {
      const row = e.target.closest('.row'); if (!row) return;
      const id = row.dataset.tower; if (!id) return;
      setTowerTooltipContent(id);
      positionBuffTooltip(e, row); // reuse follower/clamp
    });
    el.towersList.addEventListener('pointermove', (e) => {
      const row = e.target.closest('.row'); if (!row) return;
      positionBuffTooltip(e, row);
    });
    el.towersList.addEventListener('pointerout', (e) => {
      const row = e.target.closest('.row'); if (!row) return;
      const to = e.relatedTarget;
      if (to && row.contains(to)) return;
      hideBuffTooltip();
    });
  }
})();