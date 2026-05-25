let database = null;

export async function loadDatabase() {
  if (database) return database;

  const response = await fetch("./assets/data/rpg_database_1000_plus.json");
  database = await response.json();

  return database;
}

export async function getRandomItem() {
  const db = await loadDatabase();
  const items = db.itens || [];

  return items[Math.floor(Math.random() * items.length)];
}

export async function getRandomNPC() {
  const db = await loadDatabase();
  const npcs = db.npcs || [];

  return npcs[Math.floor(Math.random() * npcs.length)];
}

export function getRandomGold(min = 1, max = 20) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}export async function getRandomItemByTier(tiers = ["T1"]) {

  const db = await loadDatabase();

  const items = (db.itens || []).filter(
    item => tiers.includes(item.tier)
  );

  return items[
    Math.floor(Math.random() * items.length)
  ];
}let monsterDatabase = null;

export async function loadMonsters() {
  if (monsterDatabase) return monsterDatabase;

  const response = await fetch("./assets/data/monstros_5000.json");
  monsterDatabase = await response.json();

  return monsterDatabase;
}

export async function getRandomMonster() {
  const db = await loadMonsters();
  const monsters = db.monstros || [];

  return monsters[Math.floor(Math.random() * monsters.length)];
}

export async function getRandomMonsterByTier(tiers = ["T1"]) {
  const db = await loadMonsters();

  const monsters = (db.monstros || []).filter(monster =>
    tiers.includes(monster.tier)
  );

  return monsters[Math.floor(Math.random() * monsters.length)];
}

export async function getRandomMonsterByLevel(playerLevel = 1) {
  const db = await loadMonsters();

  const monsters = (db.monstros || []).filter(monster =>
    monster.nivel <= playerLevel + 3
  );

  return monsters[Math.floor(Math.random() * monsters.length)];
}

export async function getRandomMonsterByBiome(bioma) {
  const db = await loadMonsters();

  const monsters = (db.monstros || []).filter(monster =>
    monster.bioma === bioma
  );

  return monsters[Math.floor(Math.random() * monsters.length)];
}