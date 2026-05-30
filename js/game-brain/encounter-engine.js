import { createEncounter } from "../regras/Monster Encounter.js";

export function createWorldEncounter({
  character,
  place = "world",
  bioma = null,
  maxTier = "T1",
  enemyType = "normal"
} = {}) {
  const level = character?.level || character?.nivel || 1;

  const encounter = createEncounter({
    place,
    amount: 1,
    maxTier,
    minLevel: Math.max(1, level - 3),
    maxLevel: level + 5,
    bioma,
    enemyType
  });

  encounter.monsters = (encounter.monsters || []).map(monster => {
    const hp =
      monster.hp ||
      monster.vida ||
      monster.maxHp ||
      30 + ((monster.nivel || monster.level || 1) * 5);

    return {
      ...monster,
      hp,
      maxHp: hp
    };
  });

  return encounter;
}

export function getCurrentMonster(encounter) {
  if (!encounter?.monsters?.length) return null;
  return encounter.monsters.find(monster => (monster.hp || 0) > 0) || null;
}

export function isEncounterFinished(encounter) {
  return !getCurrentMonster(encounter);
}
