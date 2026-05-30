import { getCurrentMonster, isEncounterFinished } from "./encounter-engine.js";
import { getMonsterSkills, calculateSkillPower } from "../regras/skills.js";

import {
  gerarDropsDoMonstro,
  gerarGoldDoMonstro
} from "./drop-engine.js";

import {
  getAttack,
  getDefense,
  getSpeed,
  handleDeath,
  applyXp,
  getMaxHp,
  getMaxMana
} from "./character-engine.js";

function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getMonsterName(monster) {
  return monster?.nome || monster?.name || "Criatura";
}

function getMonsterLevel(monster) {
  return monster?.nivel || monster?.level || 1;
}

function getMonsterMaxHp(monster) {
  return monster?.maxHp || monster?.vidaMax || monster?.vida || monster?.hp || 1;
}

function getTierNumber(tier = "T1") {
  const found = String(tier || "T1").match(/\d+/);
  return found ? Number(found[0]) : 1;
}

function getTierBonus(tier = "T1") {
  const n = getTierNumber(tier);
  return { 1: 2, 2: 5, 3: 9, 4: 14, 5: 20, 6: 28, 7: 38 }[n] || 2;
}

function getMonsterDefense(monster) {
  const level = getMonsterLevel(monster);
  const tier = monster.tier || "T1";

  return Math.floor(
    monster.def ||
    monster.defense ||
    monster.defesa ||
    level + getTierBonus(tier)
  );
}

function getMonsterSpeed(monster) {
  const level = getMonsterLevel(monster);
  const tier = monster.tier || "T1";

  return Math.floor(
    monster.speed ||
    monster.velocidade ||
    monster.agility ||
    monster.agilidade ||
    level * 2 + getTierBonus(tier)
  );
}

function getMonsterAccuracy(monster) {
  const level = getMonsterLevel(monster);
  const tier = monster.tier || "T1";

  return Math.floor(
    monster.precision ||
    monster.precisao ||
    monster.accuracy ||
    level * 2 + getTierBonus(tier)
  );
}

function getBuffAttack(character) {
  return (character.buffs || []).reduce((total, buff) => {
    if (buff.type === "attack_buff") return total + (buff.attackBonus || 0);
    return total;
  }, 0);
}

function getBuffDefense(character) {
  return (character.buffs || []).reduce((total, buff) => {
    if (buff.type === "defense_buff") return total + (buff.defenseBonus || 0);
    return total;
  }, 0);
}

function reduceBuffTurns(character) {
  character.buffs = (character.buffs || [])
    .map(buff => ({ ...buff, turns: (buff.turns || 1) - 1 }))
    .filter(buff => buff.turns > 0);
}

function normalizarAcao(action) {
  if (action === "attack") return "atacar";
  if (action === "flee") return "fugir";
  if (action === "dodge") return "esquivar";
  if (action === "skill") return "skill";
  return action;
}

function calculatePlayerAttack(character, monster) {
  const hitDice = rollD20();
  const damageDice = rollD20();

  const attack = getAttack(character) + getBuffAttack(character);
  const monsterDefense = getMonsterDefense(monster);

  const attackBonus = Math.floor(attack * 0.35);
  const defenseClass = 10 + Math.floor(monsterDefense * 0.5);

  const hitTotal = hitDice + attackBonus;
  const hit = hitDice === 20 || hitTotal >= defenseClass;
  const critical = hitDice === 20;

  if (!hit) {
    return {
      hitDice,
      damageDice: 0,
      hitTotal,
      defenseClass,
      hit: false,
      critical: false,
      rawDamage: 0,
      blocked: 0,
      damage: 0
    };
  }

  const rawDamage = damageDice + Math.floor(attack * 0.6);
  const blocked = Math.floor(monsterDefense * 0.35);

  let damage = Math.max(1, rawDamage - blocked);

  if (critical) {
    damage *= 2;
  }

  return {
    hitDice,
    damageDice,
    hitTotal,
    defenseClass,
    hit,
    critical,
    rawDamage,
    blocked,
    damage
  };
}

function calculateHeroSkillDamage(skill, character, monster) {
  const hitDice = rollD20();
  const damageDice = rollD20();

  const attack = getAttack(character) + getBuffAttack(character);
  const monsterDefense = getMonsterDefense(monster);
  const power = skill.power || skill.poder || 20;

  const attackBonus = Math.floor(attack * 0.4) + Math.floor(power * 0.2);
  const defenseClass = 10 + Math.floor(monsterDefense * 0.5);

  const hitTotal = hitDice + attackBonus;
  const hit = hitDice === 20 || hitTotal >= defenseClass;
  const critical = hitDice === 20;

  if (!hit) {
    return {
      hitDice,
      damageDice: 0,
      hitTotal,
      defenseClass,
      hit: false,
      critical: false,
      rawDamage: 0,
      blocked: 0,
      damage: 0
    };
  }

  const rawDamage =
    damageDice +
    power +
    Math.floor(attack * 0.75);

  const blocked = Math.floor(monsterDefense * 0.35);

  let damage = Math.max(1, rawDamage - blocked);

  if (critical) {
    damage *= 2;
  }

  return {
    hitDice,
    damageDice,
    hitTotal,
    defenseClass,
    hit,
    critical,
    rawDamage,
    blocked,
    damage
  };
}

function calculateMonsterAttack(monster, character) {
  const level = getMonsterLevel(monster);
  const tier = monster.tier || "T1";
  const skills = getMonsterSkills(level, tier);
  const skill = skills[Math.floor(Math.random() * skills.length)];

  let rawDamage = 0;
  let skillName = "Ataque básico";

  if (skill) {
    rawDamage = calculateSkillPower(skill, {
      attack: monster.attack || monster.ataque || monster.atk || level * 2,
      strength: monster.strength || monster.forca || monster.atk || level,
      intelligence: monster.intelligence || monster.inteligencia || level,
      agility: monster.agility || monster.agilidade || level
    });

    skillName = `${skill.icon || ""} ${skill.name || skill.nome || skill.id}`;
  } else {
    rawDamage = monster.attack || monster.ataque || monster.atk || level + 3;
  }

  const defense = getDefense(character) + getBuffDefense(character);
  const damage = Math.max(1, Math.floor(rawDamage - defense));

  return {
    skillName,
    rawDamage,
    defense,
    damage
  };
}

function rollDodgeChance(character, monster) {
  const playerSpeed = getSpeed(character);
  const monsterAccuracy = getMonsterAccuracy(monster);
  const dice = rollD20();

  const chance = clamp(35 + playerSpeed - monsterAccuracy, 10, 75);
  const success = dice * 5 <= chance;

  return {
    dice,
    chance,
    success,
    playerSpeed,
    monsterAccuracy
  };
}

function rollEscapeChance(character, monster) {
  const playerSpeed = getSpeed(character);
  const monsterSpeed = getMonsterSpeed(monster);
  const dice = rollD20();

  const chance = clamp(45 + playerSpeed - monsterSpeed, 10, 85);
  const success = dice * 5 <= chance;

  return {
    dice,
    chance,
    success,
    playerSpeed,
    monsterSpeed
  };
}

function aplicarRecompensas(character, encounter) {
  const monsters = encounter?.monsters || [];

  const xp =
    encounter?.rewards?.xp ??
    monsters.reduce(
      (total, monster) =>
        total + (monster.xp || monster.experiencia || getMonsterLevel(monster) * 10),
      0
    );

  const gold = monsters.reduce(
    (total, monster) => total + gerarGoldDoMonstro(monster),
    0
  );

  const drops = monsters.flatMap(monster =>
    gerarDropsDoMonstro(monster)
  );

  const xpResult = applyXp(character, xp);

  character.gold = (character.gold || 0) + gold;
  character.inventory = [...(character.inventory || []), ...drops];

  const dropsText = drops.length
    ? drops.map(item => item.nome || item.name || item.id || "item").join(", ")
    : "nenhum item";

  return {
    xp,
    gold,
    drops,
    dropsText,
    leveled: xpResult.leveled
  };
}

function applyCharacterDeath(character) {
  const death = handleDeath(character);

  return {
    nextState: death.deleted ? "DELETADO" : "MORTO",
    report: `
☠️ Você caiu em combate.
${death.message}`
  };
}

function monsterCounterAttack({ character, monster }) {
  const monsterName = getMonsterName(monster);
  const dodge = rollDodgeChance(character, monster);

  if (dodge.success) {
    return {
      report: `${monsterName} tentou atacar, mas você esquivou.
Chance de esquiva: ${dodge.chance}%
D20: ${dodge.dice}`,
      nextState: "COMBATE"
    };
  }

  const monsterAttack = calculateMonsterAttack(monster, character);

  character.hp = Math.max(0, (character.hp || 0) - monsterAttack.damage);

  let report = `${monsterName} contra-atacou.
Ataque usado: ${monsterAttack.skillName}
Dano bruto: ${monsterAttack.rawDamage}
Sua defesa: ${monsterAttack.defense}
Dano recebido: ${monsterAttack.damage}
Seu HP: ${character.hp}/${getMaxHp(character)}`;

  let nextState = "COMBATE";

  if (character.hp <= 0) {
    const death = applyCharacterDeath(character);
    nextState = death.nextState;
    report += death.report;
  }

  return {
    report,
    nextState
  };
}

function aplicarSkillBuff(character, skill, skillName) {
  character.buffs = character.buffs || [];

  const skillType = String(skill.type || skill.tipo || "").toLowerCase();

  if (skillType.includes("defesa") || skillType.includes("defense")) {
    const bonus = skill.defenseBonus || skill.defesaBonus || skill.bonus || 10;

    character.buffs.push({
      id: skill.id || skillName,
      name: skillName,
      type: "defense_buff",
      turns: skill.turns || skill.turnos || 3,
      defenseBonus: bonus
    });

    return `Defesa aumentada por 3 turnos.
Bônus de defesa: +${bonus}`;
  }

  const bonus = skill.attackBonus || skill.ataqueBonus || skill.bonus || 10;

  character.buffs.push({
    id: skill.id || skillName,
    name: skillName,
    type: "attack_buff",
    turns: skill.turns || skill.turnos || 3,
    attackBonus: bonus
  });

  return `Ataque aumentado por 3 turnos.
Bônus de ataque: +${bonus}`;
}

export function processCombatAction({ action, skill = null, character, encounter }) {
  let report = "";
  let nextState = "COMBATE";

  const tipoAcao = normalizarAcao(action);
  const monster = getCurrentMonster(encounter);

  if (!monster) {
    return {
      character,
      encounter,
      nextState: "EXPLORANDO",
      report: "Não há monstro ativo."
    };
  }

  const monsterName = getMonsterName(monster);

  if (tipoAcao === "atacar") {
    const playerAttack = calculatePlayerAttack(character, monster);

    if (!playerAttack.hit) {
      report += `Você atacou ${monsterName}, mas errou.
D20 acerto: ${playerAttack.hitDice}
Total de acerto: ${playerAttack.hitTotal}
Defesa alvo: ${playerAttack.defenseClass}
HP do inimigo: ${monster.hp}/${getMonsterMaxHp(monster)}`;
    } else {
      monster.hp = Math.max(0, (monster.hp || 0) - playerAttack.damage);

      report += `Você atacou ${monsterName}.
D20 acerto: ${playerAttack.hitDice}
Total de acerto: ${playerAttack.hitTotal}
Defesa alvo: ${playerAttack.defenseClass}
D20 dano: ${playerAttack.damageDice}
Crítico: ${playerAttack.critical ? "sim" : "não"}
Dano bruto: ${playerAttack.rawDamage}
Defesa do inimigo bloqueou: ${playerAttack.blocked}
Dano causado: ${playerAttack.damage}
HP do inimigo: ${monster.hp}/${getMonsterMaxHp(monster)}`;
    }

    if (monster.hp <= 0) {
      const rewards = aplicarRecompensas(character, encounter);

      report += `

${monsterName} foi derrotado.

Recompensas:
XP ganho: ${rewards.xp}
Gold ganho: ${rewards.gold}
Itens encontrados: ${rewards.dropsText}`;

      if (rewards.leveled) {
        report += `

⬆️ Você subiu de nível!
Ganhou pontos de atributo e skill.`;
      }

      encounter = null;
      nextState = "EXPLORANDO";
    } else {
      const counter = monsterCounterAttack({ character, monster });
      report += `

${counter.report}`;
      nextState = counter.nextState;
    }

    reduceBuffTurns(character);
  }

  else if (tipoAcao === "skill") {
    if (!skill) {
      return {
        character,
        encounter,
        nextState,
        report: "Habilidade inválida."
      };
    }

    const skillName = skill.name || skill.nome || skill.id || "Habilidade";
    const skillType = String(skill.type || skill.tipo || "").toLowerCase();
    const cost = skill.manaCost || skill.custoMana || 0;

    if ((character.mana || 0) < cost) {
      return {
        character,
        encounter,
        nextState,
        report: `Mana insuficiente para usar ${skillName}.`
      };
    }

    character.mana = Math.max(0, (character.mana || 0) - cost);

    if (skillType.includes("heal") || skillType.includes("cura")) {
      const power = skill.power || skill.poder || 20;

      character.hp = Math.min(
        getMaxHp(character),
        (character.hp || 0) + power
      );

      report += `Você usou ${skill.icon || "✨"} ${skillName}.
Recuperou ${power} de HP.
Seu HP: ${character.hp}/${getMaxHp(character)}
Mana restante: ${character.mana}/${getMaxMana(character)}`;

      const counter = monsterCounterAttack({ character, monster });
      report += `

${counter.report}`;
      nextState = counter.nextState;
    }

    else if (
      skillType.includes("buff") ||
      skillType.includes("defense") ||
      skillType.includes("defesa")
    ) {
      const buffText = aplicarSkillBuff(character, skill, skillName);

      report += `Você usou ${skill.icon || "✨"} ${skillName}.
${buffText}
Mana restante: ${character.mana}/${getMaxMana(character)}`;
    }

    else {
      const skillAttack = calculateHeroSkillDamage(skill, character, monster);

      if (!skillAttack.hit) {
        report += `Você usou ${skill.icon || "✨"} ${skillName}, mas errou.
D20 acerto: ${skillAttack.hitDice}
Total de acerto: ${skillAttack.hitTotal}
Defesa alvo: ${skillAttack.defenseClass}
Mana restante: ${character.mana}/${getMaxMana(character)}
HP do inimigo: ${monster.hp}/${getMonsterMaxHp(monster)}`;
      } else {
        monster.hp = Math.max(0, (monster.hp || 0) - skillAttack.damage);

        report += `Você usou ${skill.icon || "✨"} ${skillName} contra ${monsterName}.
D20 acerto: ${skillAttack.hitDice}
Total de acerto: ${skillAttack.hitTotal}
Defesa alvo: ${skillAttack.defenseClass}
D20 dano: ${skillAttack.damageDice}
Crítico: ${skillAttack.critical ? "sim" : "não"}
Dano bruto: ${skillAttack.rawDamage}
Defesa do inimigo bloqueou: ${skillAttack.blocked}
Dano causado: ${skillAttack.damage}
HP do inimigo: ${monster.hp}/${getMonsterMaxHp(monster)}
Mana restante: ${character.mana}/${getMaxMana(character)}`;
      }

      if (monster.hp <= 0) {
        const rewards = aplicarRecompensas(character, encounter);

        report += `

${monsterName} foi derrotado.

Recompensas:
XP ganho: ${rewards.xp}
Gold ganho: ${rewards.gold}
Itens encontrados: ${rewards.dropsText}`;

        if (rewards.leveled) {
          report += `

⬆️ Você subiu de nível!
Ganhou pontos de atributo e skill.`;
        }

        encounter = null;
        nextState = "EXPLORANDO";
      } else {
        const counter = monsterCounterAttack({ character, monster });
        report += `

${counter.report}`;
        nextState = counter.nextState;
      }
    }

    reduceBuffTurns(character);
  }

  else if (tipoAcao === "esquivar") {
    const dodge = rollDodgeChance(character, monster);

    if (dodge.success) {
      report = `Você se move rápido e evita o ataque de ${monsterName}.
Chance de esquiva: ${dodge.chance}%
D20: ${dodge.dice}

Você ganhou espaço para respirar.`;

      nextState = "COMBATE";
    } else {
      const counter = monsterCounterAttack({ character, monster });

      report = `Você tentou esquivar, mas ${monsterName} leu seu movimento.
Chance de esquiva: ${dodge.chance}%
D20: ${dodge.dice}

${counter.report}`;

      nextState = counter.nextState;
    }

    reduceBuffTurns(character);
  }

  else if (tipoAcao === "fugir") {
    const escape = rollEscapeChance(character, monster);

    if (escape.success) {
      report = `Você tentou fugir.
Chance de fuga: ${escape.chance}%
D20: ${escape.dice}
Resultado: sucesso.

Você escapou do combate.`;

      encounter = null;
      nextState = "EXPLORANDO";
    } else {
      const counter = monsterCounterAttack({ character, monster });

      report = `Você tentou fugir.
Chance de fuga: ${escape.chance}%
D20: ${escape.dice}
Resultado: falha.

${counter.report}`;

      nextState = counter.nextState;
    }

    reduceBuffTurns(character);
  }

  else {
    report = `Ação de combate desconhecida: ${tipoAcao}.`;
  }

  if (encounter && isEncounterFinished(encounter)) {
    const rewards = aplicarRecompensas(character, encounter);

    report += `

Todos os inimigos foram derrotados.

Recompensas:
XP ganho: ${rewards.xp}
Gold ganho: ${rewards.gold}
Itens encontrados: ${rewards.dropsText}`;

    if (rewards.leveled) {
      report += `

⬆️ Você subiu de nível!
Ganhou pontos de atributo e skill.`;
    }

    encounter = null;
    nextState = "EXPLORANDO";
  }

  return {
    character,
    encounter,
    nextState,
    report
  };
}