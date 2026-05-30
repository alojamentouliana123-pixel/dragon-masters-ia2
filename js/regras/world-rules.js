// =====================================================
// world-rules.js
// REGRAS GLOBAIS DO MUNDO — ELDRAKAR
// =====================================================

// =====================================================
// TIERS
// =====================================================

export const TIER_ORDER = {
  T1: 1,
  T2: 2,
  T3: 3,
  T4: 4,
  T5: 5,
  T6: 6
};

export const TIER_NAMES = {
  T1: "Comum",
  T2: "Incomum",
  T3: "Raro",
  T4: "Épico",
  T5: "Lendário",
  T6: "Mítico"
};

// =====================================================
// REGRAS GLOBAIS
// =====================================================

export const WORLD_RULES = {

  // ===================================================
  // TURNOS
  // ===================================================

  oneActionPerTurn: true,

  movementConsumesTurn: true,

  maxMovementsPerTurn: 1,

  globalTurnRequiresAllPlayers: true,

  // ===================================================
  // COMBATE
  // ===================================================

  combatOnlyWithMonster: true,

  // ===================================================
  // MONSTROS
  // ===================================================

  talkingMonsterMinTier: "T4",

  monsterCanUseSkillUpToOwnTier: true,

  // ===================================================
  // DROPS
  // ===================================================

  tierDropRulesEnabled: true,

  rareDropStartsAtTier: "T4",

  monsterDropsOwnTierOrLower: true,

  lowTierCanDropHigherTierRarely: true,

  // ===================================================
  // MORTE
  // ===================================================

  firstClassCannotDieInWorld: true,

  firstClassKnockoutTurns: 10,

  advancedClassDeathPenalty: true,

  advancedClassMinStageForDeath: 2,

  advancedDeathPenalty: {

    xpLossPercent: 10,

    levelLossChancePercent: 20,

    itemLossChancePercent: 15,

    maxItemsLost: 1,

    protectedItemTiers: ["T1"]

  },

  // ===================================================
  // CAÇADA POR VIDA BAIXA
  // ===================================================

  huntedWhenLowHp: true,

  huntedStartsBelowHpPercent: 70,

  huntedBaseChancePercent: 8,

  huntedMaxChancePercent: 65,

  huntedCriticalHpPercent: 25,

  // ===================================================
  // RECUPERAÇÃO
  // ===================================================

  hpRecoveryPercentPerTurn: {

    combat: 1,

    walking: 3,

    resting: 6,

    city: 10

  },

  manaRecoveryPercentPerTurn: {

    combat: 1,

    walking: 3,

    resting: 6,

    city: 10

  }

};

// =====================================================
// DROP CHANCES
// =====================================================

export const DROP_CHANCES_BY_TIER = {

  T1: 60,

  T2: 35,

  T3: 18,

  T4: 7,

  T5: 2,

  T6: 0.5

};

export const HIGHER_TIER_DROP_PENALTY = {

  1: 0.25,

  2: 0.08,

  3: 0.02,

  4: 0.005,

  5: 0.001

};

// =====================================================
// CLASSE
// =====================================================

export function getCharacterClassStage(character) {

  if (!character) return 1;

  if (character.thirdClass) return 3;

  if (character.subclassId || character.subclass) return 2;

  return 1;

}

export function isFirstClassCharacter(character) {

  return getCharacterClassStage(character) === 1;

}

export function isAdvancedClassCharacter(character) {

  return (
    getCharacterClassStage(character) >=
    WORLD_RULES.advancedClassMinStageForDeath
  );

}

// =====================================================
// TURNOS
// =====================================================

export function canActThisTurn(turnState = {}) {

  if (!WORLD_RULES.oneActionPerTurn) {

    return {
      allowed: true,
      message: ""
    };

  }

  if (turnState.actionUsed) {

    return {
      allowed: false,
      message:
        "⚠️ Você já realizou uma ação neste turno."
    };

  }

  return {
    allowed: true,
    message: ""
  };

}

export function canMoveThisTurn(turnState = {}) {

  const movements =
    turnState.movementsThisTurn || 0;

  if (
    movements >=
    WORLD_RULES.maxMovementsPerTurn
  ) {

    return {
      allowed: false,
      message:
        "⚠️ Você só pode se mover uma vez por turno."
    };

  }

  return {
    allowed: true,
    message: ""
  };

}

export function consumeTurn(
  actionType = "action",
  turnState = {}
) {

  const newState = {

    ...turnState,

    actionUsed: true,

    lastActionType: actionType

  };

  if (actionType === "move") {

    newState.movementsThisTurn =
      (turnState.movementsThisTurn || 0) + 1;

  }

  return newState;

}

export function startNewTurn(turnState = {}) {

  return {

    ...turnState,

    actionUsed: false,

    movementsThisTurn: 0,

    turnNumber:
      (turnState.turnNumber || 0) + 1,

    playersDone: []

  };

}

export function markPlayerDoneTurn(
  turnState = {},
  playerId
) {

  const playersDone =
    new Set(turnState.playersDone || []);

  if (playerId) {

    playersDone.add(playerId);

  }

  return {

    ...turnState,

    playersDone: [...playersDone]

  };

}

export function canAdvanceGlobalTurn(
  turnState = {},
  activePlayerIds = []
) {

  if (!activePlayerIds.length) {

    return true;

  }

  const playersDone =
    new Set(turnState.playersDone || []);

  return activePlayerIds.every(
    playerId => playersDone.has(playerId)
  );

}

// =====================================================
// AÇÕES
// =====================================================

export function canUseAction({

  action,

  character,

  currentEnemy,

  turnState = {}

}) {

  if (!character) {

    return {
      allowed: false,
      message: "Personagem não carregado."
    };

  }

  if ((character.hp || 0) <= 0) {

    return {
      allowed: false,
      message:
        "💀 Você está sem vida e não pode agir."
    };

  }

  if (action === "move") {

    return canMoveThisTurn(turnState);

  }

  const turnCheck =
    canActThisTurn(turnState);

  if (!turnCheck.allowed) {

    return turnCheck;

  }

  if (
    WORLD_RULES.combatOnlyWithMonster
  ) {

    if (
      (
        action === "attack" ||
        action === "defense"
      ) &&
      !currentEnemy
    ) {

      return {

        allowed: false,

        message:
          "⚠️ Essa ação só pode ser usada quando houver um monstro."

      };

    }

  }

  return {

    allowed: true,

    message: ""

  };

}

// =====================================================
// MONSTROS T4+ FALAM
// =====================================================

export function canMonsterTalk(monster) {

  if (!monster) return false;

  const monsterTier =
    TIER_ORDER[monster.tier] || 1;

  const requiredTier =
    TIER_ORDER[
      WORLD_RULES.talkingMonsterMinTier
    ] || 4;

  return monsterTier >= requiredTier;

}

// =====================================================
// SKILL TIER
// =====================================================

export function canMonsterUseSkill(
  monster,
  skill
) {

  if (!monster || !skill) {

    return {
      allowed: false,
      message:
        "Monstro ou habilidade não encontrado."
    };

  }

  const monsterTier =
    TIER_ORDER[monster.tier] || 1;

  const skillTier =
    TIER_ORDER[skill.tier] || 1;

  if (skillTier > monsterTier) {

    return {

      allowed: false,

      message:
        "⚠️ O monstro não possui tier suficiente."

    };

  }

  return {

    allowed: true,

    message: ""

  };

}

// =====================================================
// DROP
// =====================================================

export function getDropChance(
  monsterTier = "T1",
  itemTier = "T1"
) {

  const monsterTierValue =
    TIER_ORDER[monsterTier] || 1;

  const itemTierValue =
    TIER_ORDER[itemTier] || 1;

  let baseChance =
    DROP_CHANCES_BY_TIER[itemTier] || 1;

  if (
    itemTierValue <= monsterTierValue
  ) {

    return baseChance;

  }

  const difference =
    itemTierValue - monsterTierValue;

  const penalty =
    HIGHER_TIER_DROP_PENALTY[difference] ||
    0.001;

  return baseChance * penalty;

}

// =====================================================
// DERROTA
// =====================================================

export function resolveCharacterDefeat(
  character
) {

  const stage =
    getCharacterClassStage(character);

  // Classe base não morre

  if (
    stage === 1 &&
    WORLD_RULES.firstClassCannotDieInWorld
  ) {

    return {

      type: "knockout",

      patch: {

        hp: 1,

        status: "knockout",

        blockedTurns:
          WORLD_RULES.firstClassKnockoutTurns

      },

      message:
        `💀 Você foi derrotado e ficará ` +
        `${WORLD_RULES.firstClassKnockoutTurns} turnos desmaiado ou preso.`

    };

  }

  // Classe avançada sofre punição

  const xpLost = Math.floor(
    (character.xp || 0) *
    (
      WORLD_RULES
        .advancedDeathPenalty
        .xpLossPercent / 100
    )
  );

  const levelRoll =
    Math.random() * 100;

  const lostLevel =
    levelRoll <=
    WORLD_RULES
      .advancedDeathPenalty
      .levelLossChancePercent;

  return {

    type: "death_penalty",

    patch: {

      hp: 1,

      xp:
        Math.max(
          0,
          (character.xp || 0) - xpLost
        ),

      level:
        lostLevel
          ? Math.max(
              1,
              (character.level || 1) - 1
            )
          : character.level

    },

    message:
      `☠️ Você morreu. ` +
      `XP perdido: ${xpLost}. ` +
      (
        lostLevel
          ? "Você perdeu 1 nível."
          : ""
      )

  };

}

// =====================================================
// VIDA BAIXA / CAÇADA
// =====================================================

export function getHpPercent(character) {

  if (!character) return 100;

  return (
    (
      (character.hp || 1) /
      (character.maxHp || 1)
    ) * 100
  );

}

export function getHuntedChance(character) {

  const hpPercent =
    getHpPercent(character);

  if (
    hpPercent >=
    WORLD_RULES.huntedStartsBelowHpPercent
  ) {

    return 0;

  }

  const missing =
    WORLD_RULES.huntedStartsBelowHpPercent -
    hpPercent;

  const ratio =
    missing /
    WORLD_RULES.huntedStartsBelowHpPercent;

  let chance =
    WORLD_RULES.huntedBaseChancePercent +
    (
      (
        WORLD_RULES.huntedMaxChancePercent -
        WORLD_RULES.huntedBaseChancePercent
      ) * ratio
    );

  if (
    hpPercent <=
    WORLD_RULES.huntedCriticalHpPercent
  ) {

    chance += 10;

  }

  return Math.min(
    WORLD_RULES.huntedMaxChancePercent,
    chance
  );

}

// =====================================================
// RECUPERAÇÃO
// =====================================================

export function recoverPerTurn(

  character,

  state = "walking"

) {

  if (!character) {

    return null;

  }

  const hpPercent =
    WORLD_RULES
      .hpRecoveryPercentPerTurn[state] || 0;

  const manaPercent =
    WORLD_RULES
      .manaRecoveryPercentPerTurn[state] || 0;

  const hpRecovered =
    Math.floor(
      (character.maxHp || 0) *
      (hpPercent / 100)
    );

  const manaRecovered =
    Math.floor(
      (character.maxMana || 0) *
      (manaPercent / 100)
    );

  character.hp = Math.min(
    character.maxHp || 0,
    (character.hp || 0) + hpRecovered
  );

  character.mana = Math.min(
    character.maxMana || 0,
    (character.mana || 0) + manaRecovered
  );

  return {

    hpRecovered,

    manaRecovered,

    currentHp: character.hp,

    currentMana: character.mana

  };

}

// =====================================================
// CONTEXTO PARA IA
// =====================================================

export function getWorldRulesPromptContext() {

  return `

REGRAS GLOBAIS DE ELDRAKAR:

1. Ataque e defesa só existem quando há monstro.
2. Cada ação ou movimento consome 1 turno.
3. Não existe 2 movimentos no mesmo turno.
4. Turno global só avança quando todos terminam.
5. Monstros T4+ podem falar como personagens.
6. Monstros só usam skills do próprio tier ou menor.
7. Itens T4+ são muito raros.
8. Vida abaixo de 70% aumenta chance de caça.
9. Classe base não morre no mundo.
10. Classe 2+ sofre punição de morte.
11. HP e Mana regeneram por turno.

`;

}