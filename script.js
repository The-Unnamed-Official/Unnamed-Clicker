/* Button Clicker v3.0.0 — UI fixes for purchase button states and animations */
(() => {
  'use strict';

  const GAME_VERSION = '3.0.0';
  const SAVE_KEY = 'button_clicker_save_v3';
  const LEGACY_KEYS = ['button_clicker_save_v2'];

  const TOWERS = [
    { id: 'clickbot', name: 'Click Bot', emoji: '🤖', baseCost: 15, costMult: 1.15, baseProd: 0.1 },
    { id: 'workshop', name: 'Workshop', emoji: '🧰', baseCost: 100, costMult: 1.15, baseProd: 1 },
    { id: 'server', name: 'Server Farm', emoji: '🖥️', baseCost: 1100, costMult: 1.15, baseProd: 8 },
    { id: 'lab', name: 'Research Lab', emoji: '🧪', baseCost: 12000, costMult: 1.15, baseProd: 47 },
    { id: 'factory', name: 'Auto Factory', emoji: '🏭', baseCost: 130000, costMult: 1.15, baseProd: 260 },
    { id: 'temple', name: 'Button Temple', emoji: '⛩️', baseCost: 1400000, costMult: 1.15, baseProd: 1400 },
    { id: 'portal', name: 'Quantum Portal', emoji: '🌀', baseCost: 20000000, costMult: 1.15, baseProd: 7800 },
    { id: 'aicore', name: 'AI Core', emoji: '🧠', baseCost: 300000000, costMult: 1.15, baseProd: 44000 },
    { id: 'forge', name: 'Quantum Forge', emoji: '⚛️', baseCost: 5000000000, costMult: 1.15, baseProd: 260000 }
  ];

  function u(id,name,desc,cost,effect,cond,icon='⚙️'){ return { id, name, desc, cost, effect, cond, icon }; }
  function a(id,name,desc,cond,bonus){ return { id, name, desc, cond, bonus }; }

  const UPGRADES = [
    u('click1', 'Polished Button', 'Base click power +1', 50, s => { s.clickBase += 1; }, s => true, '🔘'),
    u('click2', 'Ergonomic Press', 'Base click power +4', 500, s => { s.clickBase += 4; }, s => s.upgradesPurchased.includes('click1'), '🫳'),
    u('click3', 'Quantum Tap', 'Double click power', 5000, s => { s.clickMult *= 2; }, s => s.upgradesPurchased.includes('click2'), '✨'),
    u('click4', 'Hyper Tap', 'Double click power', 25000, s => { s.clickMult *= 2; }, s => s.upgradesPurchased.includes('click3'), '⚡'),
    u('click5', 'Singularity Press', 'Double click power', 250000, s => { s.clickMult *= 2; }, s => s.upgradesPurchased.includes('click4'), '🕳️'),

    u('crit1', 'Lucky Groove', '+2% crit chance', 10000, s => { s.critChance += 0.02; }, s => s.totalClicks >= 500, '🍀'),
    u('crit2', 'Golden Rim', '+3% crit chance', 100000, s => { s.critChance += 0.03; }, s => s.upgradesPurchased.includes('crit1') && s.totalClicks >= 5000, '🥇'),

    u('global1', 'Efficient Logistics', 'All production +25%', 1000, s => { s.globalMult *= 1.25; }, s => s.totalManaEarned >= 500, '🚚'),
    u('global2', 'Temporal Sync', 'All production +35%', 10000, s => { s.globalMult *= 1.35; }, s => s.totalManaEarned >= 5000, '🌀'),
    u('global3', 'Overclock', 'All production +50%', 250000, s => { s.globalMult *= 1.5; }, s => totalTowers(s) >= 100, '🧭'),
    u('global4', 'Cold Fission', 'All production +100%', 5e7, s => { s.globalMult *= 2; }, s => s.towers.forge.count >= 1, '❄️'),

    u('clickbot1', 'Oil the Bots', 'Click Bots produce 2x', 200, s => { s.towerMult.clickbot *= 2; }, s => s.towers.clickbot.count >= 10, '🤖'),
    u('workshop1', 'Better Tools', 'Workshops produce 2x', 1100, s => { s.towerMult.workshop *= 2; }, s => s.towers.workshop.count >= 10, '🧰'),
    u('server1', 'Fiber Backbone', 'Servers produce 2x', 12000, s => { s.towerMult.server *= 2; }, s => s.towers.server.count >= 10, '🖥️'),
    u('lab1', 'Quantum Catalysts', 'Labs produce 2x', 130000, s => { s.towerMult.lab *= 2; }, s => s.towers.lab.count >= 10, '🧪'),
    u('factory1', 'Assembly Drones', 'Factories produce 2x', 1400000, s => { s.towerMult.factory *= 2; }, s => s.towers.factory.count >= 10, '🏭'),
    u('temple1', 'Faithful Fingers', 'Temples produce 2x', 2e7, s => { s.towerMult.temple *= 2; }, s => s.towers.temple.count >= 10, '⛩️'),
    u('portal1', 'Dimensional Harmony', 'Portals produce 2x', 3e8, s => { s.towerMult.portal *= 2; }, s => s.towers.portal.count >= 10, '🌀'),
    u('aicore1', 'Self-Optimizing Nets', 'AI Cores produce 2x', 5e9, s => { s.towerMult.aicore *= 2; }, s => s.towers.aicore.count >= 10, '🧠'),
    u('forge1', 'Coherent Lattices', 'Forges produce 2x', 7e10, s => { s.towerMult.forge *= 2; }, s => s.towers.forge.count >= 10, '⚛️'),

    u('clickbot2', 'Firmware Recompile', 'Click Bots produce 2x', 4e3, s => { s.towerMult.clickbot *= 2; }, s => s.upgradesPurchased.includes('clickbot1') && s.towers.clickbot.count >= 50, '📀'),
    u('workshop2', 'CNC Everywhere', 'Workshops produce 2x', 8e4, s => { s.towerMult.workshop *= 2; }, s => s.upgradesPurchased.includes('workshop1') && s.towers.workshop.count >= 50, '🛠️'),

    u('syn1', 'Workshop x Lab', 'Workshops +1% per Lab', 20000, s => { s.synergy.workshopPerLab += 0.01; }, s => s.towers.workshop.count >= 25 && s.towers.lab.count >= 1, '🔗'),
    u('syn2', 'Clickbot x Server', 'Click Bots +2% per Server', 25000, s => { s.synergy.clickbotPerServer += 0.02; }, s => s.towers.clickbot.count >= 25 && s.towers.server.count >= 1, '🔗'),

    u('secret1', 'Whispered Oath', 'All production +10% (unlock via Secret Shop)', 1e6, s => { s.globalMult *= 1.1; }, s => state.secrets.secretShopUnlocked, '🕯️'),
  ];

  const RESEARCH = [
    { id: 'automation', name: 'Automation', desc: '+3% global production per level', max: 12, baseCost: 2 },
    { id: 'focus', name: 'Focused Mind', desc: '+1 base click power per level', max: 20, baseCost: 1 },
    { id: 'frugality', name: 'Frugality', desc: '-1% tower cost per level', max: 20, baseCost: 3 }
  ];

  const SECRET_SHOP = [
    { id: 'dailyBless', name: 'Chrono Blessing', desc: 'Claim +5% global (24h) once per day', cost: 0, daily: true },
    { id: 'secret1', name: 'Whispered Oath', desc: 'Unlocks secret upgrade "Whispered Oath"', cost: 9 }
  ];

  const TREE = [
    { id:'starter', name:'Starter Kit', icon:'🎒', cost:5, desc:'Start each run with 1,000 buttons.', prereq:[] },
    { id:'engineer', name:'Engineer Kit', icon:'🧷', cost:4, desc:'Start with 1 Click Bot.', prereq:['starter'] },
    { id:'grant', name:'Research Grant', icon:'🎓', cost:6, desc:'Start with +3 Crystals.', prereq:['starter'] },

    { id:'overclocker', name:'Heavenly Overclocker', icon:'🛠️', cost:8, desc:'Global production +10%.', prereq:[] },
    { id:'clickMastery', name:'Click Mastery', icon:'🖱️', cost:10, desc:'Click power x2.', prereq:['overclocker'] },
    { id:'luckyAura', name:'Lucky Aura', icon:'🍀', cost:10, desc:'Crit chance +5%.', prereq:['overclocker'] },

    { id:'frugalMind', name:'Frugal Mind', icon:'🪙', cost:8, desc:'Buildings cost -2%.', prereq:[] },
    { id:'momentum', name:'Momentum', icon:'🏁', cost:7, desc:'+5% global per ascension (up to +50%).', prereq:['frugalMind'] },

    { id:'goldenGlare', name:'Golden Glare', icon:'🌟', cost:9, desc:'Golden Button spawns more often and lasts longer.', prereq:[] },
    { id:'minigameScholar', name:'Minigame Scholar', icon:'🎮', cost:7, desc:'Minigames give +1 extra Crystal.', prereq:[] },

    { id:'lorekeeper', name:'Lorekeeper', icon:'📜', cost:6, desc:'Unlocks extra lore fragments sooner.', prereq:[] },
    { id:'autopress', name:'Auto-Press', icon:'🤖', cost:12, desc:'Passive clicks per second equal to 50% of click power.', prereq:['clickMastery'] }
  ];

  const LORE = [
    { id:'intro', title:'The First Press', text:'You press the Button. Somewhere, a counter wakes. A whisper: "Again."', cond:s=>s.totalClicks>=1 },
    { id:'manyClicks', title:'Rhythm', text:'Your fingers drum a rhythm. The Button hums back, faintly pleased.', cond:s=>s.totalClicks>=250 },
    { id:'firstBot', title:'Automation', text:'A Click Bot whirs to life. "If you teach others to press, will you press less—or more?"', cond:s=>s.towers.clickbot.count>=1 },
    { id:'firstLab', title:'Curiosity', text:'In the Lab, you dissect the Button\'s glow. The glow returns the favor.', cond:s=>s.towers.lab.count>=1 },
    { id:'temple', title:'Devotion', text:'In the Temple, you press with reverence. The Button listens; the room holds its breath.', cond:s=>s.towers.temple.count>=1 },
    { id:'portal', title:'Beyond', text:'Through the Portal, you glimpse Buttons pressing themselves. Infinite mirrors. Infinite choices.', cond:s=>s.towers.portal.count>=1 },
    { id:'golden', title:'An Omen', text:'A Golden Button streaks by. You learn: even luck loves a rhythm.', cond:s=>s.secrets.cometClicked },
    { id:'ascend1', title:'A Soft Reset', text:'You let go. The world resets, yet your hands remember. The Button remembers you.', cond:s=>s.prestige.ascensions>=1 },
    { id:'scholar', title:'Play to Learn', text:'Minigames are not distractions; they are lessons wrapped in sparkle.', cond:s=>s.secrets.mgSequenceBest>=6 || s.secrets.mgReactionWin },
    { id:'lorekeeper', title:'The Archivist', text:'You start seeing notes in the margins, as if someone left breadcrumbs between presses.', cond:s=>s.prestige.tree.lorekeeper }
  ];

  const state = {
    version: GAME_VERSION,
    mana: 0,
    totalManaEarned: 0,
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
    settings: { autosaveSec: 15, animations: 'on' },
    secrets: {
      titleClicks: 0,
      konami: false,
      secretShopUnlocked: false,
      dailyBlessLast: 0,
      cometClicked: false,
      mgReactionWin: false,
      mgSequenceBest: 0,
      mgHoldPerfect: false,
      mgBashBest: 0,
      mgTypeBest: 0
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

  function qs(sel, root = document){ return root.querySelector(sel); }
  function eln(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML=html; return e; }

  const el = {
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
    ctabButtons: document.querySelectorAll('.ctab'),
    reactionStart: qs('#reactionStart'),
    reactionStatus: qs('#reactionStatus'),
    sequenceStart: qs('#sequenceStart'),
    sequenceStatus: qs('#sequenceStatus'),
    sequenceBoard: qs('#sequenceBoard'),
    mgReq: {
      reaction: qs('#mg-req-reaction'),
      sequence: qs('#mg-req-sequence'),
      hold: qs('#mg-req-hold'),
      bash: qs('#mg-req-bash'),
      typeo: qs('#mg-req-typeo')
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
    typeo: {
      start: qs('#typeStart'),
      prompt: qs('#typePrompt'),
      input: qs('#typeInput'),
      status: qs('#typeStatus')
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

  el.version.textContent = GAME_VERSION;

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

  const ACHIEVEMENTS = [
    a('click1', 'First Press', 'Click once.', s => s.totalClicks >= 1, 0.01),
    a('click10', 'Warming Up', 'Click 10 times.', s => s.totalClicks >= 10, 0.01),
    a('click100', 'Clicker', 'Click 100 times.', s => s.totalClicks >= 100, 0.015),
    a('click1k', 'Button Masher', 'Click 1,000 times.', s => s.totalClicks >= 1000, 0.02),
    a('click10k', 'Machine Hands', 'Click 10,000 times.', s => s.totalClicks >= 10000, 0.03),
    a('click100k', 'Metronome', 'Click 100,000 times.', s => s.totalClicks >= 100000, 0.04),
    a('lucky777', 'Lucky 777', 'Reach 777 clicks.', s => s.totalClicks >= 777, 0.02),

    a('mana1k', 'Button Trickle', 'Earn 1,000 total buttons.', s => s.totalManaEarned >= 1000, 0.015),
    a('mana10k', 'Button Stream', 'Earn 10,000 total buttons.', s => s.totalManaEarned >= 10000, 0.02),
    a('mana1m', 'Button River', 'Earn 1,000,000 total buttons.', s => s.totalManaEarned >= 1e6, 0.03),
    a('mana1b', 'Button Sea', 'Earn 1,000,000,000 total buttons.', s => s.totalManaEarned >= 1e9, 0.04),
    a('mana1t', 'Button Galaxy', 'Earn 1,000,000,000,000 total buttons.', s => s.totalManaEarned >= 1e12, 0.05),

    a('towers10', 'Getting Staffed', 'Own 10 total towers.', s => totalTowers(s) >= 10, 0.01),
    a('towers50', 'Tower Tycoon', 'Own 50 total towers.', s => totalTowers(s) >= 50, 0.02),
    a('towers200', 'Industrialist', 'Own 200 total towers.', s => totalTowers(s) >= 200, 0.03),
    a('towers500', 'Empire', 'Own 500 total towers.', s => totalTowers(s) >= 500, 0.04),

    a('cb25', 'Bot Brigade', 'Own 25 Click Bots.', s => s.towers.clickbot.count >= 25, 0.015),
    a('ws25', 'Tool Time', 'Own 25 Workshops.', s => s.towers.workshop.count >= 25, 0.015),
    a('srv25', 'Server Room', 'Own 25 Servers.', s => s.towers.server.count >= 25, 0.015),
    a('lab10', 'Accredited', 'Own 10 Labs.', s => s.towers.lab.count >= 10, 0.02),
    a('fact10', 'Conveyor Dreams', 'Own 10 Factories.', s => s.towers.factory.count >= 10, 0.02),
    a('temple5', 'Button Devotee', 'Own 5 Temples.', s => s.towers.temple.count >= 5, 0.02),

    a('upg5', 'Tinkerer', 'Purchase 5 upgrades.', s => s.upgradesPurchased.length >= 5, 0.015),
    a('upg12', 'Engineer', 'Purchase 12 upgrades.', s => s.upgradesPurchased.length >= 12, 0.02),
    a('upg20', 'Inventor', 'Purchase 20 upgrades.', s => s.upgradesPurchased.length >= 20, 0.03),
    a('mgReaction', 'Quick Draw', 'Win Reaction Rush at least once.', s => s.secrets.mgReactionWin, 0.02),
    a('mgSequence', 'Memory Lane', 'Reach sequence 6.', s => s.secrets.mgSequenceBest >= 6, 0.02),
    a('mgHold', 'Steady Hands', 'Hit perfect in Hold n\' Release.', s => s.secrets.mgHoldPerfect, 0.02),
    a('mgBash', 'Bash Master', 'Reach 120 clicks in Button Bash.', s => s.secrets.mgBashBest >= 120, 0.02),
    a('mgType', 'Type Racer', 'Finish a prompt under 3s.', s => s.secrets.mgTypeBest && s.secrets.mgTypeBest < 3000, 0.02),

    a('titleTapper', 'Title Enthusiast', 'Click the title 7 times.', s => s.secrets.titleClicks >= 7, 0.01),
    a('konami', 'Pattern Breaker', 'Enter the secret pattern.', s => s.secrets.konami, 0.02),
    a('comet', 'Golden Finder', 'Click a Golden Button.', s => s.secrets.cometClicked, 0.02),

    a('ascend', 'New Game+', 'Perform your first ascension.', s => s.prestige.ascensions >= 1, 0.03),
    a('ascend3', 'Seasoned', 'Ascend 3 times.', s => s.prestige.ascensions >= 3, 0.03)
  ];

  function achievementsMultiplier(){
    let m = 1;
    for (const ac of ACHIEVEMENTS) {
      const unlocked = state.secrets[`ach_${ac.id}`] === true;
      if (unlocked) m *= (1 + ac.bonus);
    }
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

    const tree = state.prestige.tree || {};
    if (tree.overclocker) state.globalMult *= 1.10;
    if (tree.clickMastery) state.clickMult *= 2;
    if (tree.luckyAura) state.critChance += 0.05;
    if (tree.momentum) {
      const bonus = Math.min(10, state.prestige.ascensions) * 0.05;
      state.globalMult *= (1 + bonus);
    }

    for (const id of state.upgradesPurchased) {
      const up = UPGRADES.find(u => u.id === id);
      if (up && typeof up.effect === 'function') up.effect(state);
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

  function prestigeDiscount(){ return (state.prestige.tree.frugalMind ? 0.02 : 0); }
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
    // For max, disable if you cannot afford at least 1
    return getSingleTowerCost(id);
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
    if (!state.prestige.tree.autopress) return 0;
    return clickPower() * 0.5;
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

  function addMana(n){ state.mana += n; state.totalManaEarned += n; }
  function spendMana(n){ if (!canAfford(n)) return false; state.mana -= n; return true; }

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
  }

  function buyResearch(id){
    const r = RESEARCH.find(x => x.id === id);
    if (!r) return;
    const cur = state.research[id] || 0;
    if (cur >= r.max) return;
    const cost = r.baseCost + cur;
    if (state.crystals < cost) return;
    state.crystals -= cost;
    state.research[id] = cur + 1;
    recomputeModifiers();
    log(`Research advanced: ${r.name} Lv.${state.research[id]}/${r.max}`);
  }

  function updateTop(){
    el.mana.textContent = format(state.mana);
    el.mps.textContent = `${format(computeMps())}`;
    el.clickPowerLabel.textContent = `+${format(Math.max(1, Math.floor(clickPower())))}`;
    el.totalClicks.textContent = format(state.totalClicks);
    el.totalMana.textContent = format(state.totalManaEarned);
    el.critChance.textContent = `${Math.round(state.critChance*100)}%`;

    el.buffsTop.innerHTML = '';
    const t = Date.now();
    for (const b of state.buffs) {
      const left = clamp((b.until - t) / b.duration, 0, 1);
      const chip = eln('div', 'chip');
      const name = eln('span', '', b.name);
      const bar = eln('div', 'bar'); const fill = eln('i');
      fill.style.width = `${left*100}%`;
      fill.style.background = `linear-gradient(90deg, ${b.color || '#00f5d4'}, var(--accent))`;
      bar.appendChild(fill);
      chip.appendChild(name);
      chip.appendChild(bar);
      el.buffsTop.appendChild(chip);
    }
  }

  function updateStoreUI(){
    for (const t of TOWERS) {
      const costEl = qs(`#cost-${t.id}`);
      const subEl = qs(`#sub-${t.id}`);
      if (!costEl || !subEl) continue;
      const singleCost = getSingleTowerCost(t.id);
      costEl.textContent = format(singleCost);
      const owned = state.towers[t.id].count;
      const prodEach = towerProdPer(t.id) * state.globalMult * getActiveBuffMult();
      subEl.textContent = `${owned} owned • ${format(prodEach*owned)}/s`;

      const row = el.towersList.querySelector(`[data-tower="${t.id}"]`);
      if (row){
        const btn = row.querySelector('.buy');
        const reqCost = requiredCostForMode(t.id, bulkBuy);
        const affordable = canAfford(reqCost);
        btn.disabled = !affordable;
        btn.textContent = `Buy ${bulkBuy.toUpperCase()}`;
        btn.classList.toggle('pulse', affordable);
      }
    }
  }

  function updateUpgradesUI(){
    for (const up of UPGRADES) {
      const card = el.upgradesList.querySelector(`[data-upgrade="${up.id}"]`);
      if (!card) continue;
      const btn = card.querySelector('.buy-upgrade');
      const owned = state.upgradesPurchased.includes(up.id);
      const available = up.cond(state);
      const affordable = canAfford(up.cost);
      btn.disabled = owned || !available || !affordable;
      btn.textContent = owned ? 'Owned' : 'Purchase';
      card.style.opacity = owned ? 0.6 : (available ? 1 : 0.4);
      btn.classList.toggle('pulse', !btn.disabled && !owned);
    }
  }

  function updateResearchUI(){
    el.crystals.textContent = format(state.crystals);
    for (const r of RESEARCH) {
      const row = el.researchList.querySelector(`[data-research="${r.id}"]`);
      if (!row) continue;
      const lvl = state.research[r.id] || 0;
      row.querySelector('.title .sub').textContent = `Lv.${lvl}/${r.max}`;
      const cost = r.baseCost + lvl;
      qs(`#rcost-${r.id}`).textContent = cost;
      const btn = row.querySelector('.buy-research');
      const affordable = state.crystals >= cost;
      btn.disabled = lvl >= r.max || !affordable;
      btn.classList.toggle('pulse', !btn.disabled);
    }
  }

  function updateAchievements(){
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

  function log(msg){
    const e = eln('div', 'entry', `[${new Date().toLocaleTimeString()}] ${msg}`);
    el.log.prepend(e);
    const children = [...el.log.children];
    if (children.length > 80) children.slice(80).forEach(n => n.remove());
  }

  function toast(msg){
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    setTimeout(() => el.toast.classList.remove('show'), 1800);
  }

  el.bigClick.addEventListener('click', (ev) => {
    let power = clickPower();
    state.totalClicks++;
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

  el.ctabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      el.ctabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tabpane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      qs(`#ctab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  let bulkBuy = 'max';
  function buildStoreUI(){
    el.towersList.innerHTML = '';
    const towers = [...TOWERS].reverse();
    for (const t of towers) {
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
  el.towersList.addEventListener('click', (ev) => {
    const target = ev.target.closest('button');
    if (!target) return;
    if (target.classList.contains('buy')){
      const id = target.closest('.row').dataset.tower;
      buyTower(id, bulkBuy);
      maybeUnlockLore();
    }
  });
  el.qtyButtons.forEach(qb => qb.addEventListener('click', () => {
    bulkBuy = qb.dataset.q;
    el.qtyButtons.forEach(x => x.classList.remove('active'));
    qb.classList.add('active');
    updateStoreUI();
  }));

  function buildUpgradesUI(){
    el.upgradesList.innerHTML = '';
    for (const up of UPGRADES) {
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
  el.upgradesList.addEventListener('click', (ev) => {
    const target = ev.target.closest('.buy-upgrade');
    if (!target) return;
    buyUpgrade(target.dataset.id);
  });

  function buildResearchUI(){
    el.researchList.innerHTML = '';
    for (const r of RESEARCH) {
      const row = eln('div', 'row');
      const lvl = state.research[r.id] || 0;
      row.dataset.research = r.id;
      row.innerHTML = `
        <div class="icon">🔬</div>
        <div>
          <div class="title">${r.name} <span class="sub">Lv.${lvl}/${r.max}</span></div>
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
  el.researchList.addEventListener('click', (ev) => {
    const target = ev.target.closest('.buy-research');
    if (!target) return;
    buyResearch(target.dataset.id);
  });

  function buildAchievementsUI(){
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

  function buildLoreUI(){ updateLoreUI(); }

  function buildSecretShopUI(){
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
  el.secretShop.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.secret-buy'); if (!btn) return;
    const id = btn.dataset.id;
    handleSecretBuy(id);
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
    }
    buildSecretShopUI();
  }

  function minigameRequirements(){
    return {
      reaction: { txt: 'Own 10 Click Bots', ok: state.towers.clickbot.count >= 10 },
      sequence: { txt: 'Own 1 Research Lab', ok: state.towers.lab.count >= 1 },
      hold:     { txt: 'Own 25 Workshops', ok: state.towers.workshop.count >= 25 },
      bash:     { txt: 'Own 50 Click Bots', ok: state.towers.clickbot.count >= 50 },
      typeo:    { txt: 'Own 10 Auto Factories', ok: state.towers.factory.count >= 10 }
    };
  }
  function updateMinigameLocks(){
    const req = minigameRequirements();
    for (const key of Object.keys(req)){
      const badge = el.mgReq[key];
      if (!badge) continue;
      badge.textContent = req[key].ok ? 'Unlocked' : `Locked: ${req[key].txt}`;
      badge.style.color = req[key].ok ? '#35d49a' : '';
      const card = document.querySelector(`.minigame-card[data-mg="${key}"]`);
      if (card){
        card.style.opacity = req[key].ok ? 1 : 0.5;
        Array.from(card.querySelectorAll('button,input')).forEach(b => b.disabled = !req[key].ok);
      }
    }
  }

  let reactionStage = 'idle';
  let reactionStartTs = 0;
  function startReaction(){
    if (reactionStage !== 'idle') return;
    reactionStage = 'waiting';
    el.reactionStatus.textContent = 'Wait for it...';
    const delay = 800 + Math.random()*1800;
    setTimeout(() => {
      reactionStage = 'now';
      el.reactionStatus.textContent = 'CLICK!';
      el.reactionStatus.style.color = '#ffd166';
      reactionStartTs = performance.now();
      const onClick = () => {
        if (reactionStage !== 'now') return;
        const rt = performance.now() - reactionStartTs;
        reactionStage = 'cooldown';
        window.removeEventListener('click', onClick, true);
        const { reward, label } = reactionReward(rt);
        state.crystals += reward + (state.prestige.tree.minigameScholar ? 1 : 0);
        el.reactionStatus.style.color = '';
        el.reactionStatus.textContent = `Reaction: ${Math.round(rt)}ms • +${reward} 🔷 (${label})`;
        log(`Reaction Rush: ${Math.round(rt)}ms (+${reward} Crystals)`);
        if (reward >= 3) state.secrets.mgReactionWin = true;
        updateAchievements(); maybeUnlockLore();
        setTimeout(() => { reactionStage = 'idle'; el.reactionStatus.textContent = ''; }, 45000);
      };
      window.addEventListener('click', onClick, true);
    }, delay);
  }
  function reactionReward(ms){
    if (ms < 120) return { reward: 7, label: 'Godlike' };
    if (ms < 160) return { reward: 5, label: 'Lightning' };
    if (ms < 220) return { reward: 3, label: 'Swift' };
    if (ms < 320) return { reward: 2, label: 'Decent' };
    return { reward: 1, label: 'Warm-up' };
  }

  let seqActive = false, seq = [], seqStep = 0, seqBest = 0;
  function startSequence(){
    if (seqActive) return;
    seqActive = true; seq = []; seqStep = 0;
    el.sequenceStatus.textContent = 'Memorize...';
    addToSequence();
  }
  function addToSequence(){
    seq.push(1 + Math.floor(Math.random()*4));
    playSequence(seq).then(() => {
      el.sequenceStatus.textContent = 'Your turn!';
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
      btn.classList.add('glow');
      setTimeout(() => {
        btn.classList.remove('glow');
        resolve();
      }, 350);
    });
  }
  function enableSequenceInput(on){
    for (const b of document.querySelectorAll('.seq')) b.disabled = !on;
  }
  function handleSeqPress(n){
    if (!seqActive) return;
    if (seq[seqStep] !== n){
      const reward = Math.max(1, Math.floor((seqStep + seqBest)/3)) + (state.prestige.tree.minigameScholar ? 1 : 0);
      state.crystals += reward;
      el.sequenceStatus.textContent = `Failed at ${seqStep+1}/${seq.length} • +${reward} 🔷`;
      log(`Button Sequence fail: streak ${seqStep} (best ${seqBest}) +${reward} crystals`);
      seqActive = false;
      enableSequenceInput(false);
      seqBest = Math.max(seqBest, seqStep);
      state.secrets.mgSequenceBest = Math.max(state.secrets.mgSequenceBest || 0, seqBest);
      updateAchievements(); maybeUnlockLore();
      setTimeout(() => { el.sequenceStatus.textContent = ''; }, 3000);
      return;
    }
    seqStep++;
    if (seqStep >= seq.length){
      seqBest = Math.max(seqBest, seq.length);
      state.secrets.mgSequenceBest = Math.max(state.secrets.mgSequenceBest || 0, seqBest);
      el.sequenceStatus.textContent = `Good! Streak ${seq.length}`;
      setTimeout(() => { addToSequence(); }, 500);
      updateAchievements(); maybeUnlockLore();
    }
  }

  let holdActive = false, holdFilling = false, holdStartT = 0, holdRAF = 0, targetStart = 0.6;
  function startHold(){
    if (holdActive) return;
    holdActive = true;
    el.hold.status.textContent = 'Hold mouse on the bar, release inside the target!';
    const width = 0.08 + Math.random()*0.08;
    const left = Math.random()*(0.85 - width) + 0.1;
    targetStart = left;
    el.hold.target.style.left = `${left*100}%`;
    el.hold.target.style.width = `${width*100}%`;
    el.hold.fill.style.width = '0%';

    const onDown = () => {
      if (!holdActive) return;
      holdFilling = true;
      holdStartT = performance.now();
      loop();
    };
    const onUp = () => {
      if (!holdActive || !holdFilling) return;
      holdFilling = false;
      cancelAnimationFrame(holdRAF);
      const w = parseFloat(el.hold.fill.style.width) / 100;
      const center = w;
      const tLeft = targetStart;
      const tRight = tLeft + parseFloat(el.hold.target.style.width)/100;
      let reward = 0;
      if (center >= tLeft && center <= tRight){
        const diff = Math.abs(center - (tLeft+tRight)/2) / ((tRight - tLeft)/2);
        reward = diff < 0.2 ? 7 : diff < 0.5 ? 4 : 2;
        if (diff < 0.2) state.secrets.mgHoldPerfect = true;
      } else reward = 1;
      reward += (state.prestige.tree.minigameScholar ? 1 : 0);
      state.crystals += reward;
      el.hold.status.textContent = `Released at ${(center*100).toFixed(0)}% • +${reward} 🔷`;
      log(`Hold 'n Release: +${reward} crystals`);
      updateAchievements(); maybeUnlockLore();
      holdActive = false;
      el.hold.bar.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      setTimeout(()=>{ el.hold.status.textContent = ''; }, 4000);
    };
    const loop = () => {
      if (!holdFilling) return;
      const t = performance.now();
      const p = clamp((t - holdStartT)/2000, 0, 1);
      el.hold.fill.style.width = `${p*100}%`;
      holdRAF = requestAnimationFrame(loop);
    };

    el.hold.bar.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp, { once: true });
  }

  let bashActive = false, bashCount = 0, bashTimer = 0, bashTO = 0;
  function startBash(){
    if (bashActive) return;
    bashActive = true; bashCount = 0; bashTimer = 10;
    el.bash.status.textContent = 'Go!';
    el.bash.btn.disabled = false;
    const tick = () => {
      bashTimer -= 1;
      if (bashTimer <= 0) endBash();
      else {
        el.bash.status.textContent = `${bashTimer}s left • ${bashCount} clicks`;
        bashTO = setTimeout(tick, 1000);
      }
    };
    tick();
  }
  function endBash(){
    bashActive = false;
    clearTimeout(bashTO);
    el.bash.btn.disabled = true;
    let reward = Math.max(1, Math.floor(bashCount/20));
    reward += (state.prestige.tree.minigameScholar ? 1 : 0);
    state.crystals += reward;
    el.bash.status.textContent = `Time! ${bashCount} clicks • +${reward} 🔷`;
    state.secrets.mgBashBest = Math.max(state.secrets.mgBashBest || 0, bashCount);
    updateAchievements(); maybeUnlockLore();
    setTimeout(()=>{ el.bash.status.textContent = ''; }, 4000);
  }

  const TYPE_WORDS = [
    'button', 'quantum', 'factory', 'sequence', 'ergonomic',
    'synchronize', 'automation', 'frugality', 'overclock', 'temporal',
    'synergy', 'catalyst', 'forging', 'assembly', 'dimension',
    'lattice', 'coherence', 'protocol', 'backbone', 'resonance'
  ];
  let typeStartTs = 0;
  function startType(){
    const word = TYPE_WORDS[Math.floor(Math.random()*TYPE_WORDS.length)];
    el.typeo.prompt.textContent = word;
    el.typeo.input.value = '';
    el.typeo.input.disabled = false;
    el.typeo.input.focus();
    el.typeo.status.textContent = 'Type the word and press Enter.';
    typeStartTs = performance.now();
  }
  el.typeo.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      const entry = el.typeo.input.value.trim();
      const target = el.typeo.prompt.textContent.trim();
      const elapsed = performance.now() - typeStartTs;
      if (!target) return;
      if (entry === target){
        let reward = 1;
        if (elapsed < 2000) reward = 7;
        else if (elapsed < 3000) reward = 5;
        else if (elapsed < 5000) reward = 3;
        else reward = 2;
        reward += (state.prestige.tree.minigameScholar ? 1 : 0);
        el.typeo.status.textContent = `Correct in ${Math.round(elapsed)}ms • +${reward} 🔷`;
        state.crystals += reward;
        if (!state.secrets.mgTypeBest || elapsed < state.secrets.mgTypeBest) state.secrets.mgTypeBest = elapsed;
        updateAchievements(); maybeUnlockLore();
      } else {
        const reward = 1 + (state.prestige.tree.minigameScholar ? 1 : 0);
        el.typeo.status.textContent = `Typo! +${reward} 🔷 for trying.`;
        state.crystals += reward;
      }
      el.typeo.input.disabled = true;
      setTimeout(()=>{ el.typeo.status.textContent = ''; }, 4000);
    }
  });

  el.reactionStart.addEventListener('click', startReaction);
  el.sequenceStart.addEventListener('click', startSequence);
  el.sequenceBoard.addEventListener('click', (e) => {
    const btn = e.target.closest('.seq'); if (!btn) return;
    handleSeqPress(parseInt(btn.dataset.s,10));
  });
  el.hold.start.addEventListener('click', startHold);
  el.bash.start.addEventListener('click', startBash);
  el.bash.btn.addEventListener('click', () => { if (bashActive) bashCount++; });
  el.typeo.start.addEventListener('click', startType);

  const konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let keyBuf = [];
  window.addEventListener('keydown', (e) => {
    keyBuf.push(e.key);
    if (keyBuf.length > konamiSeq.length) keyBuf.shift();
    if (konamiSeq.every((k,i) => keyBuf[i] === k)){
      if (!state.secrets.konami){
        state.secrets.konami = true;
        state.secrets.secretShopUnlocked = true;
        el.secretTab.classList.remove('hidden');
        toast('A secret shop reveals itself...');
        buildSecretShopUI();
        recomputeModifiers();
        updateAchievements();
        maybeUnlockLore();
      }
    }

    const idx = parseInt(e.key, 10);
    if (idx >= 1 && idx <= TOWERS.length){
      const tower = TOWERS[idx-1].id;
      if (e.altKey) buyTower(tower, 'max');
      else if (e.shiftKey) buyTower(tower, '10');
      else buyTower(tower, '1');
      maybeUnlockLore();
    }
  });

  function addBuff({ id, name, mult, duration, color }){
    const until = Date.now() + duration;
    state.buffs = state.buffs.filter(b => b.id !== id);
    state.buffs.push({ id, name, mult, duration, until, color });
  }

  let cometTimer = null;
  function scheduleComet(){
    if (cometTimer) clearTimeout(cometTimer);
    const faster = state.prestige.tree.goldenGlare ? 0.75 : 1;
    const min = 60 * faster, max = 180 * faster;
    const delay = (min + Math.random()*(max - min))*1000;
    cometTimer = setTimeout(spawnComet, delay);
  }
  function spawnComet(){
    const orb = eln('div', 'rare-orb');
    const pad = 80;
    const x = pad + Math.random()*(window.innerWidth - pad*2);
    const y = 120 + Math.random()*(window.innerHeight - 350);
    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;
    el.rareLayer.appendChild(orb);

    const extra = state.prestige.tree.goldenGlare ? 5000 : 0;
    const ttl = 10000 + extra;
    const timeout = setTimeout(() => { orb.remove(); scheduleComet(); }, ttl);

    orb.addEventListener('click', () => {
      clearTimeout(timeout);
      orb.remove();
      state.secrets.cometClicked = true;
      addBuff({ id: 'op', name: 'Golden Button', mult: 50, duration: 20000 + extra, color: '#ffd166' });
      log('You tapped a Golden Button! Massive boost!');
      toast('OP Boost: x50 active!');
      scheduleComet();
      updateAchievements(); maybeUnlockLore();
    }, { once: true });
  }

  function maybeUnlockLore(){
    const before = Object.keys(state.lore).length;
    for (const entry of LORE) {
      if (entry.cond(state)) state.lore[entry.id] = true;
    }
    if (Object.keys(state.lore).length > before) {
      updateLoreUI();
      const last = LORE.find(l => state.lore[l.id] && !l._announced);
      if (last){
        toast(`Lore unlocked: ${last.title}`);
        last._announced = true;
      }
    }
  }

  function heavenlyFromTotal(totalButtons){
    return Math.floor(Math.sqrt(totalButtons / 1e12));
  }
  function heavenlyBank(){ return (state.prestige.heavenly.total - state.prestige.heavenly.spent); }
  function heavenlyPotential(){ return Math.max(0, heavenlyFromTotal(state.totalManaEarned) - state.prestige.heavenly.total); }
  function canAscend(){ return heavenlyPotential() >= 1; }

  function buildAscensionUI(){
    updateAscensionUI();
    el.asc.treeGrid.innerHTML = '';
    for (const node of TREE){
      const owned = !!state.prestige.tree[node.id];
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
      btn.disabled = owned || locked || !canAfford;
      btn.classList.toggle('pulse', !btn.disabled && !owned);
      el.asc.treeGrid.appendChild(card);
    }
  }

  function updateAscensionUI(){
    el.asc.total.textContent = format(state.totalManaEarned);
    el.asc.banked.textContent = `${heavenlyBank()} ✨`;
    el.asc.totalh.textContent = `${state.prestige.heavenly.total} ✨`;
    el.asc.potential.textContent = `${heavenlyPotential()} ✨`;
    el.asc.btn.disabled = !canAscend();
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

    if (state.prestige.tree.starter) state.mana += 1000;
    if (state.prestige.tree.engineer) state.towers.clickbot.count += 1;
    if (state.prestige.tree.grant) state.crystals += 3;

    recomputeModifiers();
    buildStoreUI();
    buildUpgradesUI();
    buildResearchUI();
    buildAchievementsUI();
    buildSecretShopUI();
    buildAscensionUI();
    updateTop();
    updateStoreUI();
    updateResearchUI();
    updateAchievements();
    updateMinigameLocks();
    updateLoreUI();

    toast(`Ascended! Gained ${gain} Heavenly Clicks.`);
    log(`Ascension complete. +${gain} ✨ Heavenly Clicks.`);
  }

  function getSaveObj(){ return JSON.parse(JSON.stringify(state)); }
  function saveGame(){
    localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveObj()));
    el.autosave.textContent = 'Saved';
    setTimeout(() => el.autosave.textContent = 'Auto', 1000);
  }
  function loadGame(){
    let raw = localStorage.getItem(SAVE_KEY);
    if (!raw){
      for (const k of LEGACY_KEYS){
        const legacy = localStorage.getItem(k);
        if (legacy){ raw = legacy; break; }
      }
    }
    if (!raw) return;
    try{
      const obj = JSON.parse(raw);
      loadSaveObj(obj);
    }catch(e){ console.warn('Failed to load save', e); }
  }
  function loadSaveObj(obj){
    Object.assign(state, obj);
    for (const t of TOWERS){
      if (!state.towers[t.id]) state.towers[t.id] = { count: 0, baseCost: t.baseCost, costMult: t.costMult, baseProd: t.baseProd };
    }
    for (const t of TOWERS) if (typeof state.towerMult[t.id] !== 'number') state.towerMult[t.id] = 1;
    for (const r of RESEARCH) if (typeof state.research[r.id] !== 'number') state.research[r.id] = 0;
    if (!Array.isArray(state.buffs)) state.buffs = [];
    if (!Array.isArray(state.upgradesPurchased)) state.upgradesPurchased = [];
    if (!state.secrets) state.secrets = { titleClicks: 0, konami: false, secretShopUnlocked: false, dailyBlessLast: 0, cometClicked: false };
    if (!state.prestige) state.prestige = { ascensions:0, heavenly:{total:0,spent:0}, tree:{} };
    if (!state.lore) state.lore = {};
    recomputeModifiers();
    if (state.secrets.secretShopUnlocked) el.secretTab.classList.remove('hidden');
    buildSecretShopUI();
  }

  el.saveBtn.addEventListener('click', saveGame);
  el.exportBtn.addEventListener('click', () => {
    el.saveData.value = btoa(unescape(encodeURIComponent(JSON.stringify(getSaveObj()))));
    el.saveData.select(); el.saveData.setSelectionRange(0, el.saveData.value.length);
    document.execCommand('copy');
    toast('Save data copied to clipboard.');
  });
  el.importBtn.addEventListener('click', () => {
    const raw = el.saveData.value.trim();
    if (!raw) return;
    try{
      const json = JSON.parse(decodeURIComponent(escape(atob(raw))));
      loadSaveObj(json);
      toast('Save imported.');
      log('Save imported.');
      buildAscensionUI();
    }catch(e){
      alert('Import failed. Check your data.');
    }
  });
  el.resetBtn.addEventListener('click', () => {
    if (confirm('Hard reset? This will DELETE your progress (but not your exported backups).')){
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  });
  el.autosaveInterval.addEventListener('change', () => {
    state.settings.autosaveSec = clamp(parseInt(el.autosaveInterval.value,10)||15,5,120);
    el.autosaveInterval.value = state.settings.autosaveSec;
    toast(`Autosave: ${state.settings.autosaveSec}s`);
  });
  el.animationsToggle.addEventListener('change', () => {
    state.settings.animations = el.animationsToggle.value;
  });

  function tick(){
    const t = now();
    const dt = Math.min(0.25, (t - state.ui.lastTick)/1000);
    state.ui.lastTick = t;

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
      state.ui.lastUi = t;
    }
  }

  setInterval(() => {
    const since = (Date.now() - state.ui.lastSave)/1000;
    if (since >= state.settings.autosaveSec){
      saveGame();
      state.ui.lastSave = Date.now();
    }
  }, 1000);
  setInterval(() => saveGame(), 15000);

  buildStoreUI();
  buildUpgradesUI();
  buildResearchUI();
  buildAchievementsUI();
  buildLoreUI();
  buildSecretShopUI();
  buildAscensionUI();

  loadGame();
  recomputeModifiers();

  scheduleComet();

  (function loop(){
    tick();
    requestAnimationFrame(loop);
  })();

  el.autosaveInterval.value = state.settings.autosaveSec || 15;
  el.animationsToggle.value = state.settings.animations || 'on';
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches && state.settings.animations === 'on'){
    state.settings.animations = 'reduced';
    el.animationsToggle.value = 'reduced';
  }

  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

})();