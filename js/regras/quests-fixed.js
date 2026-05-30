export const FIXED_QUESTS = [
  {
    id: "main_prologue_survive",
    title: "Sobreviver ao Despertar",
    type: "main",
    chapter: "prologue",
    mode: "solo",
    minLevel: 1,
    required: true,
    description:
      "O jogador desperta sozinho em Eldrakar e precisa sobreviver até o evento do Monstro Colossal.",
    objective: {
      type: "survive_turns",
      turns: 10
    },
    rewards: {
      xp: 100,
      gold: 50
    },
    unlocks: ["city_intro"]
  },

  {
    id: "main_city_intro",
    title: "Acordar na Cidade",
    type: "main",
    chapter: "city",
    mode: "solo",
    minLevel: 1,
    required: true,
    description:
      "Após ser derrotado pelo Monstro Colossal, o jogador acorda na cidade principal.",
    objective: {
      type: "visit_places",
      places: ["hospital", "taverna", "guilda", "mercado"]
    },
    rewards: {
      xp: 150,
      gold: 100
    },
    unlocks: ["guild_access", "ai_quests"]
  },

  {
    id: "main_guild_register",
    title: "Registro na Guilda",
    type: "main",
    chapter: "city",
    mode: "solo",
    minLevel: 2,
    required: true,
    description:
      "O jogador deve se registrar na Guilda dos Aventureiros para receber missões oficiais.",
    objective: {
      type: "talk_to_npc",
      npc: "Recepcionista da Guilda"
    },
    rewards: {
      xp: 120,
      gold: 80,
      reputation: {
        guild: 5
      }
    },
    unlocks: ["fixed_class_path", "party_system"]
  },

  {
    id: "class_subclass_unlock",
    title: "O Primeiro Caminho",
    type: "class",
    chapter: "class_evolution",
    mode: "solo",
    minLevel: 20,
    required: true,
    description:
      "Ao atingir o nível necessário, o jogador escolhe uma das três subclasses disponíveis da sua classe base.",
    objective: {
      type: "choose_subclass"
    },
    rewards: {
      xp: 500,
      gold: 300
    },
    unlocks: ["subclass"]
  },

  {
    id: "class_third_unlock",
    title: "O Caminho Lendário",
    type: "class",
    chapter: "third_class",
    mode: "solo_or_group",
    minLevel: 55,
    required: true,
    description:
      "O jogador precisa completar uma missão especial ligada à sua subclasse para liberar a terceira classe.",
    objective: {
      type: "complete_class_trial"
    },
    rewards: {
      xp: 2000,
      gold: 1500
    },
    unlocks: ["third_class"]
  },

  {
    id: "main_colossal_investigation",
    title: "Sombras do Colossal",
    type: "main",
    chapter: "colossal_arc",
    mode: "solo_or_party",
    minLevel: 10,
    required: false,
    description:
      "A Guilda começa a investigar a origem do Monstro Colossal visto no prólogo.",
    objective: {
      type: "collect_clues",
      amount: 3
    },
    rewards: {
      xp: 800,
      gold: 500,
      reputation: {
        guild: 8,
        city: 5
      }
    },
    unlocks: ["colossal_lore_1"]
  }
];

export function getFixedQuestById(id) {
  return FIXED_QUESTS.find(q => q.id === id) || null;
}

export function getFixedQuestsByChapter(chapter) {
  return FIXED_QUESTS.filter(q => q.chapter === chapter);
}

export function getAvailableFixedQuests(character) {
  const level = character?.level || 1;
  const unlocked = character?.unlockedQuests || [];

  return FIXED_QUESTS.filter(q => {
    if (level < q.minLevel) return false;
    if (character?.completedQuests?.includes(q.id)) return false;

    if (q.id === "main_prologue_survive") return true;

    return q.required || unlocked.includes(q.id);
  });
}

export function createFixedQuestProgress(questId) {
  return {
    questId,
    status: "active",
    progress: 0,
    startedAt: Date.now(),
    completedAt: null
  };
}

export function completeFixedQuest(character, quest) {
  const completedQuests = [
    ...(character.completedQuests || []),
    quest.id
  ];

  const unlockedQuests = [
    ...(character.unlockedQuests || []),
    ...(quest.unlocks || [])
  ];

  return {
    completedQuests,
    unlockedQuests,
    xp: (character.xp || 0) + (quest.rewards?.xp || 0),
    gold: (character.gold || 0) + (quest.rewards?.gold || 0)
  };
}