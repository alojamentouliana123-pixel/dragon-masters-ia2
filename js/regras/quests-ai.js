// =====================================================
// quests-ai.js
// MISSÕES PROCEDURAIS DA IA — ELDRAKAR
// =====================================================

export const AI_QUEST_TYPES = {
  hunt: "Caçada",
  gathering: "Coleta",
  escort: "Escolta",
  investigation: "Investigação",
  dungeon: "Masmorra",
  rescue: "Resgate",
  delivery: "Entrega"
};

export const AI_QUEST_SOURCES = {
  tavern: "Taverna",
  guild: "Guilda dos Aventureiros",
  market: "Mercado",
  cityBoard: "Mural de Missões",
  healer: "Hospital",
  blacksmith: "Ferreiro"
};

export const AI_QUEST_REGIONS = [
  "Floresta Norte",
  "Estrada Velha",
  "Bosque Cinzento",
  "Pântano Negro",
  "Ruínas Baixas",
  "Caverna Úmida",
  "Campos Externos",
  "Cemitério Antigo",
  "Colinas de Pedra",
  "Rio Partido"
];

export const AI_QUEST_TEMPLATES = [
  {
    id: "ai_hunt",
    type: "hunt",
    titlePrefix: "Caçada",
    objectiveType: "kill",
    minPlayers: 1,
    maxPlayers: 4
  },
  {
    id: "ai_gathering",
    type: "gathering",
    titlePrefix: "Coleta",
    objectiveType: "collect",
    minPlayers: 1,
    maxPlayers: 2
  },
  {
    id: "ai_escort",
    type: "escort",
    titlePrefix: "Escolta",
    objectiveType: "escort",
    minPlayers: 1,
    maxPlayers: 3
  },
  {
    id: "ai_investigation",
    type: "investigation",
    titlePrefix: "Investigação",
    objectiveType: "investigate",
    minPlayers: 1,
    maxPlayers: 3
  },
  {
    id: "ai_dungeon",
    type: "dungeon",
    titlePrefix: "Masmorra",
    objectiveType: "clear_dungeon",
    minPlayers: 2,
    maxPlayers: 5
  },
  {
    id: "ai_rescue",
    type: "rescue",
    titlePrefix: "Resgate",
    objectiveType: "rescue",
    minPlayers: 1,
    maxPlayers: 4
  }
];

// =====================================================
// UTIL
// =====================================================

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getTierByLevel(level = 1) {
  if (level >= 75) return "T6";
  if (level >= 55) return "T5";
  if (level >= 35) return "T4";
  if (level >= 20) return "T3";
  if (level >= 10) return "T2";
  return "T1";
}

export function getRewardByTier(tier = "T1", level = 1) {
  const table = {
    T1: { xp: 90, gold: 120 },
    T2: { xp: 260, gold: 280 },
    T3: { xp: 650, gold: 600 },
    T4: { xp: 1400, gold: 1300 },
    T5: { xp: 3000, gold: 2600 },
    T6: { xp: 6000, gold: 5000 }
  };

  const base = table[tier] || table.T1;

  return {
    xp: base.xp + level * 10,
    gold: base.gold + level * 8,
    itemTier: tier
  };
}

// =====================================================
// GERADOR DE QUEST IA
// =====================================================

export function generateAIQuest({
  character,
  source = "guild",
  partySize = 1,
  region = null,
  monster = null,
  preferredType = null
} = {}) {
  const level = character?.level || 1;
  const tier = getTierByLevel(level);

  let possibleTemplates = AI_QUEST_TEMPLATES.filter(template => {
    if (preferredType && template.type !== preferredType) return false;
    if (partySize < template.minPlayers) return false;
    if (partySize > template.maxPlayers) return false;
    return true;
  });

  if (!possibleTemplates.length) {
    possibleTemplates = AI_QUEST_TEMPLATES.filter(template => template.type === "hunt");
  }

  const template = randomFrom(possibleTemplates);
  const questRegion = region || randomFrom(AI_QUEST_REGIONS);

  const monsterName =
    monster?.nome ||
    monster?.name ||
    "criatura desconhecida";

  const monsterRace =
    monster?.race ||
    monster?.tipo ||
    "criatura";

  const amount = clamp(
    Math.floor(level / 5) + partySize,
    1,
    8
  );

  const quest = {
    id: `ai_${template.type}_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    procedural: true,

    title: createQuestTitle(template, questRegion, monsterName),
    source,
    sourceName: AI_QUEST_SOURCES[source] || source,

    type: template.type,
    typeName: AI_QUEST_TYPES[template.type] || template.type,

    mode: getModeByPartySize(partySize),
    tier,
    minLevel: Math.max(1, level - 3),
    recommendedLevel: level,

    minPlayers: template.minPlayers,
    maxPlayers: template.maxPlayers,
    partySize,

    location: questRegion,

    targetRace: monsterRace,
    targetMonster: monsterName,

    description: createQuestDescription({
      template,
      source,
      questRegion,
      monsterName,
      monsterRace
    }),

    objective: createObjective({
      template,
      monsterName,
      monsterRace,
      amount,
      questRegion
    }),

    rewards: getRewardByTier(tier, level),

    aiRules: createAIRules({
      template,
      tier,
      partySize,
      monster,
      questRegion
    }),

    createdAt: Date.now()
  };

  return quest;
}

function createQuestTitle(template, region, monsterName) {
  const titles = {
    hunt: [
      `${template.titlePrefix}: ${monsterName}`,
      `Ameaça em ${region}`,
      `Rastros de ${monsterName}`
    ],
    gathering: [
      `Coleta em ${region}`,
      `Ervas Raras de ${region}`,
      `Suprimentos Perdidos`
    ],
    escort: [
      `Escolta até ${region}`,
      `Viagem Perigosa`,
      `Proteção na Estrada`
    ],
    investigation: [
      `Mistério em ${region}`,
      `Sinais Estranhos`,
      `Rumores de ${region}`
    ],
    dungeon: [
      `Masmorra em ${region}`,
      `Porta Esquecida`,
      `Ruínas Abaixo de ${region}`
    ],
    rescue: [
      `Resgate em ${region}`,
      `Alguém Não Voltou`,
      `Gritos na Escuridão`
    ]
  };

  return randomFrom(titles[template.type] || [`Missão em ${region}`]);
}

function createQuestDescription({
  template,
  source,
  questRegion,
  monsterName,
  monsterRace
}) {
  const sourceName = AI_QUEST_SOURCES[source] || source;

  const descriptions = {
    hunt:
      `${sourceName} recebeu relatos de ${monsterName} rondando ${questRegion}. A ameaça precisa ser investigada antes que alcance a cidade.`,

    gathering:
      `${sourceName} precisa de materiais encontrados em ${questRegion}, mas a região está perigosa demais para moradores comuns.`,

    escort:
      `Um viajante precisa atravessar ${questRegion}. A estrada está instável e criaturas foram vistas nas proximidades.`,

    investigation:
      `Algo estranho aconteceu em ${questRegion}. Marcas, ruídos e rastros indicam presença de ${monsterRace}.`,

    dungeon:
      `Uma entrada antiga foi encontrada em ${questRegion}. A guilda acredita que há monstros e tesouros esquecidos lá dentro.`,

    rescue:
      `Uma pessoa desapareceu perto de ${questRegion}. Os rastros indicam perigo e pouco tempo para resgate.`
  };

  return descriptions[template.type] || `Uma missão surgiu em ${questRegion}.`;
}

function createObjective({
  template,
  monsterName,
  monsterRace,
  amount,
  questRegion
}) {
  if (template.objectiveType === "kill") {
    return {
      type: "kill",
      target: monsterName,
      race: monsterRace,
      amount
    };
  }

  if (template.objectiveType === "collect") {
    return {
      type: "collect",
      item: "recurso raro",
      amount: clamp(amount + 2, 3, 10)
    };
  }

  if (template.objectiveType === "escort") {
    return {
      type: "escort",
      npc: "viajante",
      destination: questRegion
    };
  }

  if (template.objectiveType === "investigate") {
    return {
      type: "investigate",
      clues: clamp(amount, 2, 5)
    };
  }

  if (template.objectiveType === "clear_dungeon") {
    return {
      type: "clear_dungeon",
      rooms: clamp(amount, 3, 7),
      finalThreat: monsterName
    };
  }

  if (template.objectiveType === "rescue") {
    return {
      type: "rescue",
      npc: "morador desaparecido",
      location: questRegion
    };
  }

  return {
    type: template.objectiveType
  };
}

function createAIRules({
  template,
  tier,
  partySize,
  monster,
  questRegion
}) {
  const rules = [
    "A missão deve respeitar as regras globais de Eldrakar.",
    "A IA não deve entregar recompensas raras facilmente.",
    "O mundo deve parecer vivo e perigoso.",
    "O jogador pode falhar, recuar ou negociar quando fizer sentido."
  ];

  if (partySize === 1) {
    rules.push("A missão deve ser possível solo, mas ainda perigosa.");
  }

  if (partySize >= 2) {
    rules.push("A IA deve dividir a cena entre os jogadores do grupo.");
  }

  if (tier === "T4" || tier === "T5" || tier === "T6") {
    rules.push("Criaturas deste tier podem ser inteligentes e causar consequências maiores.");
  }

  if (monster?.agressivo) {
    rules.push("O monstro é agressivo e pode atacar primeiro se notar fraqueza.");
  }

  if (template.type === "dungeon") {
    rules.push("A masmorra deve ter salas, tensão crescente e ameaça final.");
  }

  if (template.type === "investigation") {
    rules.push("A investigação deve revelar pistas aos poucos.");
  }

  rules.push(`A missão acontece em ${questRegion}.`);

  return rules;
}

function getModeByPartySize(partySize) {
  if (partySize <= 1) return "solo";
  if (partySize === 2) return "duo";
  if (partySize <= 5) return "group";
  return "expedition";
}

// =====================================================
// PROGRESSO
// =====================================================

export function createAIQuestProgress(quest) {
  return {
    questId: quest.id,
    procedural: true,
    status: "active",
    progress: 0,
    required:
      quest.objective?.amount ||
      quest.objective?.rooms ||
      quest.objective?.clues ||
      1,
    startedAt: Date.now(),
    completedAt: null
  };
}

export function updateAIQuestProgress(progress, amount = 1) {
  if (!progress) return null;

  const updated = {
    ...progress,
    progress: Math.min(progress.required, (progress.progress || 0) + amount)
  };

  if (updated.progress >= updated.required) {
    updated.status = "completed";
    updated.completedAt = Date.now();
  }

  return updated;
}

export function isAIQuestCompleted(progress) {
  return progress?.status === "completed";
}

// =====================================================
// CONTEXTO PARA IA
// =====================================================

export function getAIQuestPromptContext(quest) {
  if (!quest) {
    return "Nenhuma missão procedural ativa.";
  }

  return `
MISSÃO PROCEDURAL DA IA:

Título: ${quest.title}
Origem: ${quest.sourceName}
Tipo: ${quest.typeName}
Modo: ${quest.mode}
Tier: ${quest.tier}
Local: ${quest.location}

Descrição:
${quest.description}

Objetivo:
${JSON.stringify(quest.objective, null, 2)}

Recompensa:
XP: ${quest.rewards?.xp || 0}
Gold: ${quest.rewards?.gold || 0}
Item Tier: ${quest.rewards?.itemTier || "Nenhum"}

Regras narrativas:
${(quest.aiRules || []).map(rule => `- ${rule}`).join("\n")}
`;
}