let POTIONS = [];
let MONSTERS_DATA = [];

async function carregarDados() {
  const potionsResponse = await fetch("../../assets/data/potion.json");
  POTIONS = await potionsResponse.json();

  const monstersResponse = await fetch("../../assets/data/monstros_com_loot.json");
  MONSTERS_DATA = await monstersResponse.json();
}

await carregarDados();

function roll(chance = 0) {
  return Math.random() * 100 < Number(chance || 0);
}

function randomItem(list = []) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return structuredClone(list[Math.floor(Math.random() * list.length)]);
}

function getTierNumber(tier = "T1") {
  const found = String(tier || "T1").match(/\d+/);
  return found ? Number(found[0]) : 1;
}

function getMonsterData(monster = {}) {
  const monsters = MONSTERS_DATA.monstros || MONSTERS_DATA;
  if (!Array.isArray(monsters)) return monster;

  return monsters.find(m => String(m.id) === String(monster.id)) || monster;
}

function getMonsterTier(monster = {}) {
  return monster.tier || "T1";
}

function getMonsterLevel(monster = {}) {
  return monster.nivel || monster.level || 1;
}

function isPotionDrop(item = {}) {
  const tipo = String(item.tipo || "").toLowerCase();

  return (
    tipo.includes("pocao") ||
    tipo.includes("poção") ||
    tipo.includes("pocao_hp") ||
    tipo.includes("pocao_mn")
  );
}

function isSurvivalPotion(item = {}) {
  const tipo = String(item.tipo || "").toLowerCase();

  return (
    tipo.includes("pocao_hp") ||
    tipo.includes("pocao_mn") ||
    tipo.includes("comida") ||
    tipo.includes("erva") ||
    tipo.includes("fruta") ||
    Number(item.cura || 0) > 0 ||
    Number(item.mana || 0) > 0
  );
}

function getPotionsByTier(monsterTier = "T1") {
  const tierNumber = getTierNumber(monsterTier);

  if (!Array.isArray(POTIONS)) return [];

  return POTIONS.filter(item =>
    isSurvivalPotion(item) &&
    getTierNumber(item.tier || "T1") <= tierNumber + 1
  );
}

function gerarConsumiveisDeSobrevivencia(monster = {}) {
  const tier = getMonsterTier(monster);
  const pool = getPotionsByTier(tier);

  const drops = [];
  const quantidade = Math.random() < 0.5 ? 1 : 2;

  for (let i = 0; i < quantidade; i++) {
    const item = randomItem(pool);
    if (item) drops.push(item);
  }

  return drops;
}

function gerarLootNormalDoMonstro(monster = {}) {
  const data = getMonsterData(monster);
  const lootTable = data.loot || [];
  const drops = [];

  if (!Array.isArray(lootTable)) return drops;

  for (const loot of lootTable) {
    if (isPotionDrop(loot)) continue;

    const chance = loot.chanceDrop ?? loot.chance ?? loot.dropChance ?? 0;

    if (roll(chance)) {
      drops.push(structuredClone(loot));
    }
  }

  return drops;
}

export function gerarGoldDoMonstro(monster = {}) {
  const data = getMonsterData(monster);

  const level = getMonsterLevel(data);
  const tier = getTierNumber(getMonsterTier(data));

  const min = data.goldMin ?? level * tier;
  const max = data.goldMax ?? level * tier * 3;

  return Math.floor(min + Math.random() * (max - min + 1));
}

export function gerarDropsDoMonstro(monster = {}) {
  const consumiveis = gerarConsumiveisDeSobrevivencia(monster);
  const lootNormal = gerarLootNormalDoMonstro(monster);

  return [
    ...consumiveis,
    ...lootNormal
  ];
}
