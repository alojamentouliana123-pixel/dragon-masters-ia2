export function createDefaultCharacter(data = {}) {

const attrs =
  data.attributes ||
  data.atributos ||
  data.finalAttributes ||
  data.stats ||
  data.status ||
  data;

  const character = {
    characterName: data.characterName || data.nome || "Herói",
    className: data.className || data.classe || "Sem classe",

    level: data.level || data.nivel || 1,
    xp: data.xp || 0,
    gold: data.gold || data.ouro || 0,

    hp: data.hp ?? 100,
    mana: data.mana ?? 40,

   attributes: {
  fisico:
    attrs.fisico ??
    attrs.forca ??
    attrs.força ??
    attrs.strength ??
    data.fisico ??
    data.forca ??
    data.força ??
    data.strength ??
    10,

  defesa:
    attrs.defesa ??
    attrs.defense ??
    data.defesa ??
    data.defense ??
    5,

  agilidade:
    attrs.agilidade ??
    attrs.velocidade ??
    attrs.agility ??
    attrs.speed ??
    data.agilidade ??
    data.velocidade ??
    data.agility ??
    data.speed ??
    5,

  inteligencia:
    attrs.inteligencia ??
    attrs.intelligence ??
    data.inteligencia ??
    data.intelligence ??
    5,

  vitalidade:
    attrs.vitalidade ??
    attrs.vitality ??
    data.vitalidade ??
    data.vitality ??
    Math.floor((data.maxHp || data.hp || attrs.hp || 100) / 10)
},

    attributePoints: data.attributePoints || 0,
    skillPoints: data.skillPoints || 0,

   skills: data.skills || [],

skillBook: {
  learned:
    data.skillBook?.learned ||
    data.skills ||
    [],

  equipped:
    data.skillBook?.equipped ||
    []
},

    inventory: data.inventory || data.inventario || [],

    equipment: {
      weapon: data.equipment?.weapon || null,
      helmet: data.equipment?.helmet || null,
      armor: data.equipment?.armor || null,
      boots: data.equipment?.boots || null,
      cape: data.equipment?.cape || null,
      backpack: data.equipment?.backpack || null
    },

    survival: {
      deaths: data.survival?.deaths || 0,
      deathWithoutGold: data.survival?.deathWithoutGold || 0,
      hunger: data.survival?.hunger || 0,
      fatigue: data.survival?.fatigue || 0,
      campTurns: data.survival?.campTurns || 0
    },

    missions: data.missions || []
  };

  const stats = calculateDerivedStats(character);

  character.maxHp = data.maxHp || stats.maxHp;
  character.maxMana = data.maxMana || stats.maxMana;

  character.hp = Math.min(character.hp, character.maxHp);
  character.mana = Math.min(character.mana, character.maxMana);

  return character;
}

export function calculateDerivedStats(character) {
  const attr = character.attributes || {};
  const equip = character.equipment || {};

  const equipmentStats = getEquipmentStats(equip);

  const fisico = attr.fisico || 0;
  const defesa = attr.defesa || 0;
  const agilidade = attr.agilidade || 0;
  const inteligencia = attr.inteligencia || 0;
  const vitalidade = attr.vitalidade || 0;
  const level = character.level || 1;

  return {
    maxHp: 80 + vitalidade * 10 + level * 5 + equipmentStats.hp,
    maxMana: 25 + inteligencia * 8 + level * 3 + equipmentStats.mana,

    ataque:
      fisico * 2 +
      level * 2 +
      equipmentStats.ataque,

    defesaTotal:
      defesa * 2 +
      Math.floor(vitalidade * 0.5) +
      level +
      equipmentStats.defesa,

    velocidade:
      agilidade * 2 +
      Math.floor(level * 0.5) +
      equipmentStats.velocidade,

    pesoMax:
      30 +
      fisico * 2 +
      equipmentStats.pesoMax,

    pesoAtual:
      calculateInventoryWeight(character)
  };
}

export function getEquipmentStats(equipment = {}) {
  const items = Object.values(equipment).filter(Boolean);

  return items.reduce(
    (total, item) => {
      total.ataque += Number(item.ataque || 0);
      total.defesa += Number(item.defesa || 0);
      total.hp += Number(item.hp || item.maxHp || 0);
      total.mana += Number(item.mana || item.maxMana || 0);
      total.velocidade += Number(item.velocidade || item.agilidade || 0);
      total.pesoMax += Number(item.pesoMax || item.slotsBonus || 0);

      return total;
    },
    {
      ataque: 0,
      defesa: 0,
      hp: 0,
      mana: 0,
      velocidade: 0,
      pesoMax: 0
    }
  );
}

export function calculateInventoryWeight(character) {
  const inventory = character.inventory || [];

  return inventory.reduce((total, item) => {
    const amount = item.quantidade || item.amount || 1;
    return total + Number(item.peso || 0) * amount;
  }, 0);
}

export function getMaxHp(character) {
  return calculateDerivedStats(character).maxHp;
}

export function getMaxMana(character) {
  return calculateDerivedStats(character).maxMana;
}

export function getAttack(character) {
  return calculateDerivedStats(character).ataque;
}

export function getDefense(character) {
  return calculateDerivedStats(character).defesaTotal;
}

export function getSpeed(character) {
  return calculateDerivedStats(character).velocidade;
}

export function addAttributePoint(character, attribute) {
  if ((character.attributePoints || 0) <= 0) {
    return {
      ok: false,
      message: "Sem pontos de atributo."
    };
  }

  if (!character.attributes?.[attribute] && character.attributes?.[attribute] !== 0) {
    return {
      ok: false,
      message: "Atributo inválido."
    };
  }

  character.attributes[attribute] += 1;
  character.attributePoints -= 1;

  normalizeHpMana(character);

  return {
    ok: true,
    character
  };
}

export function addSkillPoint(character, skillId) {
  if ((character.skillPoints || 0) <= 0) {
    return {
      ok: false,
      message: "Sem pontos de skill."
    };
  }

  if (!character.skills[skillId]) {
    return {
      ok: false,
      message: "Skill inválida."
    };
  }

  character.skills[skillId].level = (character.skills[skillId].level || 1) + 1;
  character.skillPoints -= 1;

  return {
    ok: true,
    character
  };
}

export function equipItem(character, item) {
  const slot = getSlotFromItem(item);

  if (!slot) {
    return {
      ok: false,
      message: "Esse item não pode ser equipado."
    };
  }

  character.equipment = character.equipment || {};
  character.inventory = character.inventory || [];

  const oldItem = character.equipment[slot];

  character.equipment[slot] = item;

  character.inventory = character.inventory.filter(i => i.id !== item.id);

  if (oldItem) {
    character.inventory.push(oldItem);
  }

  normalizeHpMana(character);

  return {
    ok: true,
    slot,
    character
  };
}

export function unequipItem(character, slot) {
  if (!character.equipment?.[slot]) {
    return {
      ok: false,
      message: "Nada equipado nesse slot."
    };
  }

  character.inventory = character.inventory || [];

  character.inventory.push(character.equipment[slot]);
  character.equipment[slot] = null;

  normalizeHpMana(character);

  return {
    ok: true,
    character
  };
}

export function getSlotFromItem(item) {
  const tipo = String(item.tipo || "").toLowerCase();

  if (tipo.includes("arma")) return "weapon";
  if (tipo.includes("capacete") || tipo.includes("elmo")) return "helmet";
  if (tipo.includes("armadura") || tipo.includes("peitoral") || tipo.includes("couraça")) return "armor";
  if (tipo.includes("bota") || tipo.includes("greva")) return "boots";
  if (tipo.includes("capa") || tipo.includes("manto")) return "cape";
  if (tipo.includes("mochila") || tipo.includes("bolsa")) return "backpack";

  return null;
}

export function applyXp(character, amount = 0) {
  character.xp = (character.xp || 0) + amount;

  let leveled = false;

  while (character.xp >= getXpLimit(character.level)) {
    character.xp -= getXpLimit(character.level);
    character.level += 1;
    character.attributePoints = (character.attributePoints || 0) + 3;
    character.skillPoints = (character.skillPoints || 0) + 1;

    normalizeHpMana(character, true);

    leveled = true;
  }

  return {
    leveled,
    character
  };
}

export function getXpLimit(level = 1) {
  return Math.floor(100 + (level - 1) * 75 + Math.pow(level - 1, 2) * 25);
}

export function normalizeHpMana(character, fullRestore = false) {
  const stats = calculateDerivedStats(character);

  character.maxHp = stats.maxHp;
  character.maxMana = stats.maxMana;

  if (fullRestore) {
    character.hp = character.maxHp;
    character.mana = character.maxMana;
    return character;
  }

  character.hp = Math.min(character.hp || character.maxHp, character.maxHp);
  character.mana = Math.min(character.mana || character.maxMana, character.maxMana);

  return character;
}

export function handleDeath(character) {
  character.survival = character.survival || {};
  character.survival.deaths = (character.survival.deaths || 0) + 1;

  const reviveCost = getReviveCost(character);

  if ((character.gold || 0) >= reviveCost) {
    character.gold -= reviveCost;

    character.hp = Math.floor(getMaxHp(character) * 0.5);
    character.mana = Math.floor(getMaxMana(character) * 0.3);

    return {
      ok: true,
      deleted: false,
      paid: true,
      reviveCost,
      message: `Você pagou ${reviveCost} gold para reviver.`
    };
  }

  character.survival.deathWithoutGold =
    (character.survival.deathWithoutGold || 0) + 1;

  if (character.survival.deathWithoutGold >= 6) {
    return {
      ok: false,
      deleted: true,
      paid: false,
      reviveCost,
      message: "Sua alma foi consumida. O personagem deve ser excluído."
    };
  }

  character.hp = Math.floor(getMaxHp(character) * 0.5);
  character.mana = Math.floor(getMaxMana(character) * 0.2);

  return {
    ok: true,
    deleted: false,
    paid: false,
    reviveCost,
    message: `Você reviveu sem pagar. Aviso ${character.survival.deathWithoutGold}/5.`
  };
}

export function getReviveCost(character) {
  const level = character.level || 1;
  const deaths = character.survival?.deaths || 0;

  return Math.floor(50 + level * 20 + deaths * deaths * 35);
}