// =====================================================
// monster-encounter.js
// SISTEMA DE SPAWN + DROP + LOOT INICIAL — ELDRAKAR
// =====================================================

// Ajuste os caminhos se sua pasta for diferente.
// Sugestão de estrutura:
// /js/monster-encounter.js
// /data/monstros_5000.json
// /data/eldrakar_items_1200.json

import monstersData from "../../assets/data/monstros_5000.json" assert { type: "json" };

import itemsData from "../../assets/data/eldrakar_items_1200.json" assert { type: "json" };

// =====================================================
// CONFIGURAÇÃO GERAL
// =====================================================

export const ENCOUNTER_CONFIG = {
  tierOrder: {
    T1: 1,
    T2: 2,
    T3: 3,
    T4: 4,
    T5: 5,
    T6: 6,
    T7: 7
  },

  dropChanceByEnemyType: {
    normal: 15,
    elite: 30,
    mini_boss: 55,
    boss: 90,
    final_boss: 100
  },

  starterLoot: {
    randomItemsAmount: 3,
    maxRandomItemValue: 200,
    maxRandomItemTier: "T1",
    hpPotionAmount: 5,
    manaPotionAmount: 5
  }
};

// =====================================================
// HELPERS
// =====================================================

export function getAllMonsters() {
  return monstersData?.monstros || [];
}

export function getAllItems() {
  return Array.isArray(itemsData) ? itemsData : itemsData?.itens || [];
}

export function randomFrom(list) {
  if (!list?.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function shuffleList(list = []) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function getTierValue(tier = "T1") {
  return ENCOUNTER_CONFIG.tierOrder[tier] || 1;
}

export function isTierAllowed(itemTier, allowedTiers = []) {
  if (!allowedTiers?.length) return true;
  return allowedTiers.includes(itemTier);
}

export function isTierAtMost(tier, maxTier = "T1") {
  return getTierValue(tier) <= getTierValue(maxTier);
}

export function rollChance(percent = 0) {
  return Math.random() * 100 <= percent;
}

export function cloneItem(item, amount = 1) {
  if (!item) return null;

  return {
    ...structuredClone(item),
    quantidade: amount
  };
}

// =====================================================
// FILTRO DE MONSTROS
// =====================================================

export function filterMonsters({
  tier = null,
  maxTier = null,
  minLevel = null,
  maxLevel = null,
  bioma = null,
  tipo = null,
  agressivo = null
} = {}) {
  return getAllMonsters().filter(monster => {
    if (tier && monster.tier !== tier) return false;
    if (maxTier && !isTierAtMost(monster.tier, maxTier)) return false;
    if (minLevel !== null && monster.nivel < minLevel) return false;
    if (maxLevel !== null && monster.nivel > maxLevel) return false;
    if (bioma && monster.bioma !== bioma) return false;
    if (tipo && monster.tipo !== tipo) return false;
    if (agressivo !== null && monster.agressivo !== agressivo) return false;

    return true;
  });
}

export function spawnMonsters({
  amount = 1,
  tier = null,
  maxTier = null,
  minLevel = null,
  maxLevel = null,
  bioma = null,
  tipo = null,
  agressivo = null
} = {}) {
  const pool = filterMonsters({
    tier,
    maxTier,
    minLevel,
    maxLevel,
    bioma,
    tipo,
    agressivo
  });

  const fallbackPool = getAllMonsters().filter(monster => {
    if (maxTier && !isTierAtMost(monster.tier, maxTier)) return false;
    return true;
  });

  const finalPool = pool.length ? pool : fallbackPool;
  const monsters = [];

  for (let i = 0; i < amount; i++) {
    const monster = randomFrom(finalPool);
    if (monster) monsters.push(structuredClone(monster));
  }

  return monsters;
}

// =====================================================
// FILTRO DE ITENS / LOOT
// =====================================================

export function filterItems({
  tiers = [],
  maxTier = null,
  tipo = null,
  maxValue = null,
  onlyStackable = null,
  excludeTypes = []
} = {}) {
  return getAllItems().filter(item => {
    if (tiers.length && !tiers.includes(item.tier)) return false;
    if (maxTier && !isTierAtMost(item.tier, maxTier)) return false;
    if (tipo && item.tipo !== tipo) return false;
    if (maxValue !== null && item.valor > maxValue) return false;
    if (onlyStackable !== null && item.stackavel !== onlyStackable) return false;
    if (excludeTypes.includes(item.tipo)) return false;

    return true;
  });
}

export function getLootTiersFromMonster(monster) {
  if (!monster) return ["T1"];
  if (monster.lootTiers?.length) return monster.lootTiers;
  return [monster.tier || "T1"];
}

export function pickRandomLootItem({
  tiers = ["T1"],
  maxTier = null,
  maxValue = null,
  preferredTypes = [],
  excludeTypes = []
} = {}) {
  let pool = filterItems({
    tiers,
    maxTier,
    maxValue,
    excludeTypes
  });

  if (preferredTypes.length) {
    const preferredPool = pool.filter(item => preferredTypes.includes(item.tipo));
    if (preferredPool.length) pool = preferredPool;
  }

  return cloneItem(randomFrom(pool));
}

export function rollMonsterDrop(monster, enemyType = "normal") {
  const chance = ENCOUNTER_CONFIG.dropChanceByEnemyType[enemyType] ?? 15;

  if (!rollChance(chance)) {
    return {
      dropped: false,
      chance,
      item: null
    };
  }

  const tiers = getLootTiersFromMonster(monster);

  const item = pickRandomLootItem({
    tiers,
    preferredTypes: getPreferredLootTypes(enemyType)
  });

  return {
    dropped: !!item,
    chance,
    item
  };
}

export function getPreferredLootTypes(enemyType = "normal") {
  if (enemyType === "normal") {
    return ["lixo", "material", "pocao_hp", "pocao_mn", "consumivel"];
  }

  if (enemyType === "elite") {
    return ["material", "upgrade", "pocao_hp", "pocao_mn", "arma", "armadura"];
  }

  if (enemyType === "mini_boss") {
    return ["upgrade", "imbuement", "material", "arma", "armadura", "capacete", "bota"];
  }

  if (enemyType === "boss" || enemyType === "final_boss") {
    return ["upgrade", "imbuement", "arma", "armadura", "capacete", "bota", "mochila"];
  }

  return [];
}

// =====================================================
// CRIAR ENCONTRO COMPLETO
// =====================================================

export function createEncounter({
  place = "world",
  amount = 1,
  tier = null,
  maxTier = null,
  minLevel = null,
  maxLevel = null,
  bioma = null,
  tipo = null,
  enemyType = "normal"
} = {}) {
  const monsters = spawnMonsters({
    amount,
    tier,
    maxTier,
    minLevel,
    maxLevel,
    bioma,
    tipo
  });

  const drops = monsters
    .map(monster => ({
      monsterId: monster.id,
      monsterName: monster.nome,
      ...rollMonsterDrop(monster, enemyType)
    }))
    .filter(result => result.dropped && result.item);

  const gold = monsters.reduce((total, monster) => {
    const min = monster.goldMin || 0;
    const max = monster.goldMax || min;
    return total + Math.floor(min + Math.random() * (max - min + 1));
  }, 0);

  const xp = monsters.reduce((total, monster) => total + (monster.xp || 0), 0);

  return {
    place,
    enemyType,
    monsters,
    rewards: {
      xp,
      gold,
      drops: drops.map(drop => drop.item)
    },
    dropResults: drops
  };
}

// =====================================================
// LOOT INICIAL DO JOGADOR
// =====================================================

export function findStarterBag() {
  const bags = filterItems({
    tipo: "mochila",
    maxTier: "T1",
    maxValue: 200
  });

  const bestBag = bags.sort((a, b) => {
    const aScore = (a.slotsBonus || 0) + ((a.pesoMax || 0) / 10);
    const bScore = (b.slotsBonus || 0) + ((b.pesoMax || 0) / 10);
    return bScore - aScore;
  })[0];

  return cloneItem(bestBag);
}

export function findStarterPotion(type = "pocao_hp") {
  const potions = filterItems({
    tipo: type,
    maxTier: "T1",
    maxValue: 200
  });

  const bestPotion = potions.sort((a, b) => {
    const aPower = type === "pocao_hp" ? (a.cura || 0) : (a.mana || 0);
    const bPower = type === "pocao_hp" ? (b.cura || 0) : (b.mana || 0);
    return bPower - aPower;
  })[0];

  return bestPotion || null;
}

export function pickStarterRandomItems(amount = 3) {
  const pool = filterItems({
    maxTier: ENCOUNTER_CONFIG.starterLoot.maxRandomItemTier,
    maxValue: ENCOUNTER_CONFIG.starterLoot.maxRandomItemValue,
    excludeTypes: ["mochila", "pocao_hp", "pocao_mn"]
  });

  return shuffleList(pool)
    .slice(0, amount)
    .map(item => cloneItem(item));
}

export function createStarterLoot() {
  const starterBag = findStarterBag();
  const hpPotion = findStarterPotion("pocao_hp");
  const manaPotion = findStarterPotion("pocao_mn");
  const randomItems = pickStarterRandomItems(
    ENCOUNTER_CONFIG.starterLoot.randomItemsAmount
  );

  const loot = [];

  if (starterBag) loot.push(starterBag);

  if (hpPotion) {
    loot.push(cloneItem(hpPotion, ENCOUNTER_CONFIG.starterLoot.hpPotionAmount));
  }

  if (manaPotion) {
    loot.push(cloneItem(manaPotion, ENCOUNTER_CONFIG.starterLoot.manaPotionAmount));
  }

  loot.push(...randomItems);

  return {
    type: "starter_loot",
    message: "🎁 Você recebeu seus itens iniciais de aventureiro.",
    loot,
    rules: {
      bag: "1 mochila pequena T1 de até 200 gold",
      hpPotion: "5 poções HP T1 de até 200 gold",
      manaPotion: "5 poções MN T1 de até 200 gold",
      randomItems: "3 itens aleatórios T1 de até 200 gold"
    }
  };
}

export function applyStarterLootToCharacter(character) {
  if (!character) return null;

  const starter = createStarterLoot();

  return {
    ...character,
    inventory: [
      ...(character.inventory || []),
      ...starter.loot
    ],
    starterLootReceived: true,
    starterLootDate: Date.now()
  };
}

export function canReceiveStarterLoot(character) {
  return !character?.starterLootReceived;
}

// =====================================================
// CONTEXTO PARA IA
// =====================================================

export function getEncounterPromptContext(encounter) {
  if (!encounter) return "Nenhum encontro ativo.";

  return `
ENCONTRO ATIVO:

Local: ${encounter.place}
Tipo de inimigo: ${encounter.enemyType}
Quantidade de monstros: ${encounter.monsters?.length || 0}
XP total: ${encounter.rewards?.xp || 0}
Gold total: ${encounter.rewards?.gold || 0}
Drops gerados: ${encounter.rewards?.drops?.length || 0}

A IA deve apenas narrar o encontro.
O sistema controla spawn, loot, gold e XP.
`;
}
