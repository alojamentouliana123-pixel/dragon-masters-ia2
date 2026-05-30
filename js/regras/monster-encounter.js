// =====================================================
// monster-encounter.js
// HELPERS DE LOOT INICIAL — ELDRAKAR
// =====================================================

export const STARTER_LOOT_CONFIG = {
  randomItemsAmount: 3,
  maxRandomItemValue: 200,
  maxRandomItemTier: "T1",
  hpPotionAmount: 5,
  manaPotionAmount: 5
};

export const TIER_ORDER = {
  T1: 1,
  T2: 2,
  T3: 3,
  T4: 4,
  T5: 5,
  T6: 6,
  T7: 7
};

export function getTierValue(tier = "T1") {
  return TIER_ORDER[tier] || 1;
}

export function isTierAtMost(tier, maxTier = "T1") {
  return getTierValue(tier) <= getTierValue(maxTier);
}

export function shuffleList(list = []) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function cloneItem(item, quantidade = 1) {
  if (!item) return null;

  return {
    ...structuredClone(item),
    quantidade
  };
}

export function filterItems(items = [], {
  tipo = null,
  maxTier = null,
  maxValue = null,
  excludeTypes = []
} = {}) {
  return items.filter(item => {
    if (tipo && item.tipo !== tipo) return false;
    if (maxTier && !isTierAtMost(item.tier, maxTier)) return false;
    if (maxValue !== null && (item.valor || 0) > maxValue) return false;
    if (excludeTypes.includes(item.tipo)) return false;
    return true;
  });
}

export function findStarterBag(items = []) {
  const bags = filterItems(items, {
    tipo: "mochila",
    maxTier: "T1",
    maxValue: STARTER_LOOT_CONFIG.maxRandomItemValue
  });

  const bestBag = bags.sort((a, b) => {
    const aScore = (a.slotsBonus || 0) + ((a.pesoMax || 0) / 10);
    const bScore = (b.slotsBonus || 0) + ((b.pesoMax || 0) / 10);
    return bScore - aScore;
  })[0];

  if (bestBag) return cloneItem(bestBag, 1);

  // Fallback caso o JSON não tenha mochila pequena barata.
  return {
    id: "starter_small_bag",
    nome: "Bolsa Pequena de Aventureiro",
    tipo: "mochila",
    tier: "T1",
    ataque: 0,
    defesa: 0,
    mana: 0,
    cura: 0,
    slotsBonus: 20,
    pesoMax: 60,
    peso: 1.2,
    valor: 100,
    stackavel: false,
    quantidade: 1,
    descricao: "Uma bolsa simples entregue para aventureiros iniciantes."
  };
}

export function findStarterPotion(items = [], type = "pocao_hp") {
  const potions = filterItems(items, {
    tipo: type,
    maxTier: "T1",
    maxValue: STARTER_LOOT_CONFIG.maxRandomItemValue
  });

  const bestPotion = potions.sort((a, b) => {
    const aPower = type === "pocao_hp" ? (a.cura || 0) : (a.mana || 0);
    const bPower = type === "pocao_hp" ? (b.cura || 0) : (b.mana || 0);
    return bPower - aPower;
  })[0];

  if (bestPotion) {
    return cloneItem(
      bestPotion,
      type === "pocao_hp"
        ? STARTER_LOOT_CONFIG.hpPotionAmount
        : STARTER_LOOT_CONFIG.manaPotionAmount
    );
  }

  if (type === "pocao_hp") {
    return {
      id: "starter_hp_potion",
      nome: "Poção Pequena de Vida",
      tipo: "pocao_hp",
      tier: "T1",
      cura: 25,
      mana: 0,
      peso: 0.3,
      valor: 25,
      stackavel: true,
      quantidade: STARTER_LOOT_CONFIG.hpPotionAmount,
      descricao: "Poção simples de vida para novos aventureiros."
    };
  }

  return {
    id: "starter_mn_potion",
    nome: "Poção Pequena de Mana",
    tipo: "pocao_mn",
    tier: "T1",
    cura: 0,
    mana: 20,
    peso: 0.3,
    valor: 30,
    stackavel: true,
    quantidade: STARTER_LOOT_CONFIG.manaPotionAmount,
    descricao: "Poção simples de mana para novos aventureiros."
  };
}

export function pickStarterRandomItems(items = []) {
  const pool = filterItems(items, {
    maxTier: STARTER_LOOT_CONFIG.maxRandomItemTier,
    maxValue: STARTER_LOOT_CONFIG.maxRandomItemValue,
    excludeTypes: ["mochila", "pocao_hp", "pocao_mn"]
  });

  return shuffleList(pool)
    .slice(0, STARTER_LOOT_CONFIG.randomItemsAmount)
    .map(item => cloneItem(item, 1))
    .filter(Boolean);
}

export function createStarterLootFromItems(items = []) {
  const loot = [
    findStarterBag(items),
    findStarterPotion(items, "pocao_hp"),
    findStarterPotion(items, "pocao_mn"),
    ...pickStarterRandomItems(items)
  ].filter(Boolean);

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
