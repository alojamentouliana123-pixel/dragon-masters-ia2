// =====================================================
// monster-behaviors.js
// COMPORTAMENTO GLOBAL DOS MONSTROS — ELDRAKAR
// =====================================================

// Esse arquivo NÃO guarda stats.
// Ele define:
// - personalidade
// - comportamento
// - caça
// - medo
// - território
// - inteligência
// - forma de agir
// - lógica da IA
//
// Os stats continuam no JSON principal.
//
// =====================================================

export const MONSTER_BEHAVIORS = {

  // ===================================================
  // 🐺 LOBOS
  // ===================================================

  wolf: {

    race: "Lobo",

    intelligence: "animal",

    social: true,

    territorial: true,

    huntInPack: true,

    coward: true,

    aggressive: true,

    activePeriods: [
      "night",
      "dawn"
    ],

    preferredBiomes: [
      "forest",
      "snow",
      "mountain"
    ],

    behaviors: [

      "group_hunt",

      "surround_target",

      "track_low_hp",

      "retreat_if_outnumbered"

    ],

    attackRules: {

      minPlayersToAttack: 2,

      attackSoloIfWeak: true,

      soloHpThreshold: 60,

      fleeIfPlayersGreaterThan: 3

    }

  },

  // ===================================================
  // 🕷️ ARANHAS
  // ===================================================

  spider: {

    race: "Aranha",

    intelligence: "instinct",

    social: false,

    territorial: true,

    aggressive: true,

    ambushPredator: true,

    preferredBiomes: [
      "cave",
      "forest",
      "ruins"
    ],

    behaviors: [

      "ambush",

      "poison_attack",

      "protect_nest",

      "hide_and_wait"

    ],

    attackRules: {

      attackIfClose: true,

      prefersIsolatedTarget: true

    }

  },

  // ===================================================
  // 🐉 DRAGÕES
  // ===================================================

  dragon: {

    race: "Dragão",

    intelligence: "ancient",

    social: false,

    territorial: true,

    aggressive: false,

    bossLike: true,

    canSpeak: true,

    protectsTreasure: true,

    preferredBiomes: [
      "volcano",
      "mountain",
      "ancient_ruins"
    ],

    behaviors: [

      "observe_before_attack",

      "intimidate",

      "protect_territory",

      "protect_treasure",

      "speak",

      "judge_intruders"

    ],

    attackRules: {

      onlyAttackIfProvoked: true,

      attackWeakIntruders: false,

      attackTreasureThieves: true,

      ignoresWeakPlayersSometimes: true

    }

  },

  // ===================================================
  // 💀 MORTOS-VIVOS
  // ===================================================

  undead: {

    race: "Morto-vivo",

    intelligence: "corrupted",

    social: false,

    territorial: false,

    aggressive: true,

    fearless: true,

    activePeriods: [
      "night"
    ],

    preferredBiomes: [
      "graveyard",
      "ruins",
      "dark_forest"
    ],

    behaviors: [

      "attack_living",

      "ignore_fear",

      "follow_mana",

      "swarm"

    ],

    attackRules: {

      alwaysAttackLiving: true,

      neverRetreat: true

    }

  },

  // ===================================================
  // 👹 DEMÔNIOS
  // ===================================================

  demon: {

    race: "Demônio",

    intelligence: "high",

    social: true,

    territorial: true,

    aggressive: true,

    canSpeak: true,

    manipulative: true,

    preferredBiomes: [
      "abyss",
      "volcano",
      "corrupted_land"
    ],

    behaviors: [

      "manipulate",

      "negotiate",

      "corrupt",

      "test_target"

    ],

    attackRules: {

      prefersWeakMind: true,

      mayNegotiateBeforeFight: true,

      attackHolyTargetsFirst: true

    }

  },

  // ===================================================
  // 🪨 GOLEMS
  // ===================================================

  golem: {

    race: "Golem",

    intelligence: "construct",

    social: false,

    territorial: true,

    aggressive: false,

    fearless: true,

    preferredBiomes: [
      "ruins",
      "temple",
      "mountain"
    ],

    behaviors: [

      "guard_area",

      "protect_core",

      "slow_attack"

    ],

    attackRules: {

      attackIntrudersOnly: true,

      neverChaseFar: true

    }

  },

  // ===================================================
  // 🌿 ELEMENTAIS
  // ===================================================

  elemental: {

    race: "Elemental",

    intelligence: "spirit",

    social: false,

    territorial: true,

    aggressive: false,

    preferredBiomes: [
      "mana_zone",
      "volcano",
      "storm_peak",
      "ancient_forest"
    ],

    behaviors: [

      "protect_nature",

      "react_to_magic",

      "unstable_power"

    ],

    attackRules: {

      attackManaDisturbance: true,

      peacefulUntilProvoked: true

    }

  },

  // ===================================================
  // 🐗 FERAS
  // ===================================================

  beast: {

    race: "Fera",

    intelligence: "animal",

    social: false,

    territorial: true,

    aggressive: true,

    preferredBiomes: [
      "forest",
      "swamp",
      "mountain"
    ],

    behaviors: [

      "hunt",

      "protect_territory",

      "attack_if_hungry"

    ],

    attackRules: {

      attackIfHungry: true,

      attackLowHpTargets: true

    }

  },

  // ===================================================
  // 🧬 MUTANTES
  // ===================================================

  mutant: {

    race: "Mutante",

    intelligence: "unstable",

    social: false,

    territorial: false,

    aggressive: true,

    unpredictable: true,

    preferredBiomes: [
      "corrupted_land",
      "laboratory",
      "abyss"
    ],

    behaviors: [

      "random_behavior",

      "rage_attack",

      "mutate"

    ],

    attackRules: {

      mayAttackAnything: true,

      unpredictableTarget: true

    }

  },

  // ===================================================
  // 👤 HUMANOIDES
  // ===================================================

  humanoid: {

    race: "Humanoide",

    intelligence: "human_like",

    social: true,

    territorial: true,

    aggressive: false,

    canSpeak: true,

    preferredBiomes: [
      "camp",
      "city_ruins",
      "roads"
    ],

    behaviors: [

      "organize_group",

      "retreat",

      "use_strategy",

      "negotiate"

    ],

    attackRules: {

      mayNegotiate: true,

      attackIfThreatened: true,

      fleeIfOutmatched: true

    }

  }

};

// =====================================================
// PEGAR COMPORTAMENTO
// =====================================================

export function getMonsterBehavior(race) {

  if (!race) {

    return null;

  }

  return MONSTER_BEHAVIORS[race] || null;

}

// =====================================================
// MONSTRO PODE FALAR?
// =====================================================

export function canMonsterSpeak(monster) {

  if (!monster) return false;

  const behavior =
    getMonsterBehavior(monster.race);

  return behavior?.canSpeak || false;

}

// =====================================================
// MONSTRO CAÇA EM GRUPO?
// =====================================================

export function huntsInPack(monster) {

  if (!monster) return false;

  const behavior =
    getMonsterBehavior(monster.race);

  return behavior?.huntInPack || false;

}

// =====================================================
// IA DECIDE SE ATACA
// =====================================================

export function shouldMonsterAttack({

  monster,

  player,

  partySize = 1,

  isNight = false

}) {

  if (!monster || !player) {

    return false;

  }

  const behavior =
    getMonsterBehavior(monster.race);

  if (!behavior) {

    return true;

  }

  const rules =
    behavior.attackRules || {};

  const hpPercent =
    (
      (player.hp || 1) /
      (player.maxHp || 1)
    ) * 100;

  // ===================================================
  // LOBOS
  // ===================================================

  if (behavior.race === "Lobo") {

    if (
      partySize >=
      (rules.fleeIfPlayersGreaterThan || 999)
    ) {

      return false;

    }

    if (
      partySize === 1 &&
      hpPercent >
      (rules.soloHpThreshold || 60)
    ) {

      return false;

    }

    return true;

  }

  // ===================================================
  // DRAGÕES
  // ===================================================

  if (behavior.race === "Dragão") {

    if (rules.onlyAttackIfProvoked) {

      return !!player.stoleTreasure;

    }

  }

  // ===================================================
  // MORTOS-VIVOS
  // ===================================================

  if (behavior.race === "Morto-vivo") {

    return true;

  }

  // ===================================================
  // DEMÔNIOS
  // ===================================================

  if (behavior.race === "Demônio") {

    if (player.classId === "paladin") {

      return true;

    }

    return Math.random() > 0.4;

  }

  // ===================================================
  // PADRÃO
  // ===================================================

  return behavior.aggressive || false;

}

// =====================================================
// CONTEXTO PARA IA
// =====================================================

export function getMonsterBehaviorPrompt(monster) {

  if (!monster) {

    return "";

  }

  const behavior =
    getMonsterBehavior(monster.race);

  if (!behavior) {

    return "";

  }

  return `

COMPORTAMENTO DA CRIATURA:

Raça: ${behavior.race}

Inteligência: ${behavior.intelligence}

Social: ${behavior.social ? "sim" : "não"}

Territorial: ${behavior.territorial ? "sim" : "não"}

Comportamentos:
${behavior.behaviors.map(
  b => `- ${b}`
).join("\n")}

A IA deve respeitar esses comportamentos.

`;

}