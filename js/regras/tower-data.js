// =====================================================
// tower-data.js
// TORRE DO ABISMO — DUNGEON FIXA DE 50 ANDARES
// =====================================================

export const ABYSS_TOWER = {
  id: "abyss_tower",
  name: "Torre do Abismo",
  type: "tower",
  maxFloors: 50,
  maxTier: "T3",
  minPlayers: 1,
  maxPlayers: 4,
  monstersPerNormalFloor: 3,

  description:
    "Uma torre antiga que surgiu após a Grande Ruptura. Seus andares mudam de forma, mas seus guardiões seguem presos ao Abismo.",

  rules: {
    aiOnlyNarrates: true,
    systemControlsMonsters: true,
    systemControlsLoot: true,
    systemControlsBosses: true,
    normalMonsterDropChance: 15,
    miniBossDropChance: 45,
    bossVariableDropChance: 80,
    bossUniqueDropPerPlayer: 1,
    miniBossExtraDrop: true,
    maxMonsterTier: "T3"
  },

  tierRanges: [
    {
      from: 1,
      to: 15,
      tier: "T1",
      theme: "Pedra Rachada",
      description:
        "Os primeiros andares têm corredores úmidos, pedras quebradas e ecos de criaturas fracas."
    },
    {
      from: 16,
      to: 35,
      tier: "T2",
      theme: "Salões Corrompidos",
      description:
        "A energia do Abismo começa a aparecer nas paredes. Os monstros ficam mais agressivos."
    },
    {
      from: 36,
      to: 50,
      tier: "T3",
      theme: "Coração do Abismo",
      description:
        "O ar é pesado, a mana pulsa no chão e cada sala parece observar os invasores."
    }
  ],

  floorRules: {
    normalFloors: {
      monsterCount: 3,
      rewardType: "normal_drop",
      allowRandomEvent: true
    },

    miniBossFloors: [5, 15, 25, 35, 45],
    bossFloors: [10, 20, 30, 40, 50]
  },

  monsterPools: {
    T1: [
      "wolf",
      "spider",
      "undead",
      "beast",
      "humanoid"
    ],

    T2: [
      "undead",
      "spider",
      "mutant",
      "golem",
      "humanoid",
      "beast"
    ],

    T3: [
      "golem",
      "mutant",
      "demon",
      "elemental",
      "undead",
      "dragon"
    ]
  },

  miniBosses: [
    {
      floor: 5,
      id: "mini_shadow_wolf_alpha",
      name: "Alfa das Sombras",
      tier: "T1",
      race: "wolf",
      type: "mini_boss",
      level: 8,
      hpMultiplier: 1.8,
      atkMultiplier: 1.4,
      defMultiplier: 1.2,
      uniqueReputation: "Rastreador das Sombras",
      uniqueDrops: [
        {
          id: "shadow_alpha_fang",
          name: "Presa do Alfa Sombrio",
          type: "material",
          tier: "T1",
          description: "Material usado futuramente para upgrades iniciais de armas."
        },
        {
          id: "alpha_hide_cloak",
          name: "Manto de Couro do Alfa",
          type: "armor",
          tier: "T1",
          description: "Um manto leve marcado por energia sombria."
        }
      ]
    },

    {
      floor: 15,
      id: "mini_web_mother",
      name: "Mãe das Teias",
      tier: "T1",
      race: "spider",
      type: "mini_boss",
      level: 15,
      hpMultiplier: 2.0,
      atkMultiplier: 1.3,
      defMultiplier: 1.3,
      uniqueReputation: "Quebrador de Ninhos",
      uniqueDrops: [
        {
          id: "web_mother_silk",
          name: "Seda da Mãe das Teias",
          type: "material",
          tier: "T1",
          description: "Seda rara usada em armaduras leves."
        },
        {
          id: "venom_thread_ring",
          name: "Anel do Fio Venenoso",
          type: "accessory",
          tier: "T1",
          description: "Um anel simples com traços de veneno seco."
        }
      ]
    },

    {
      floor: 25,
      id: "mini_broken_golem",
      name: "Golem Quebrado",
      tier: "T2",
      race: "golem",
      type: "mini_boss",
      level: 25,
      hpMultiplier: 2.2,
      atkMultiplier: 1.4,
      defMultiplier: 1.6,
      uniqueReputation: "Marcado pela Pedra",
      uniqueDrops: [
        {
          id: "broken_core",
          name: "Núcleo Trincado",
          type: "material",
          tier: "T2",
          description: "Núcleo instável usado em melhorias de equipamento."
        },
        {
          id: "stone_guard_plate",
          name: "Placa do Guardião de Pedra",
          type: "armor",
          tier: "T2",
          description: "Fragmento defensivo pesado."
        }
      ]
    },

    {
      floor: 35,
      id: "mini_abyss_cultist",
      name: "Cultista do Abismo",
      tier: "T2",
      race: "humanoid",
      type: "mini_boss",
      level: 35,
      hpMultiplier: 2.0,
      atkMultiplier: 1.7,
      defMultiplier: 1.2,
      uniqueReputation: "Inimigo dos Cultos",
      uniqueDrops: [
        {
          id: "cultist_mark",
          name: "Marca do Cultista",
          type: "material",
          tier: "T2",
          description: "Um símbolo usado por seguidores do Abismo."
        },
        {
          id: "abyss_prayer_book",
          name: "Livro de Preces Abissais",
          type: "material",
          tier: "T2",
          description: "Pode ser estudado por magos ou bruxos no futuro."
        }
      ]
    },

    {
      floor: 45,
      id: "mini_rune_watcher",
      name: "Vigia Rúnico",
      tier: "T3",
      race: "elemental",
      type: "mini_boss",
      level: 45,
      hpMultiplier: 2.3,
      atkMultiplier: 1.8,
      defMultiplier: 1.5,
      uniqueReputation: "Observado pelas Runas",
      uniqueDrops: [
        {
          id: "watcher_rune_eye",
          name: "Olho Rúnico do Vigia",
          type: "material",
          tier: "T3",
          description: "Um olho cristalizado carregado de mana."
        },
        {
          id: "rune_watcher_charm",
          name: "Amuleto do Vigia Rúnico",
          type: "accessory",
          tier: "T3",
          description: "Amuleto usado para detectar energia abissal."
        }
      ]
    }
  ],

  bosses: [
    {
      floor: 10,
      id: "boss_goblin_king",
      name: "Rei Goblin das Escadas",
      tier: "T1",
      race: "humanoid",
      type: "boss",
      level: 12,
      hpMultiplier: 2.8,
      atkMultiplier: 1.8,
      defMultiplier: 1.5,
      uniqueReputation: "Quebrador da Coroa Goblin",
      mechanics: [
        "chama_reforcos",
        "foge_quando_fraco",
        "ataca_o_mais_fraco"
      ],
      uniqueDrops: [
        {
          id: "goblin_crown_fragment",
          name: "Fragmento da Coroa Goblin",
          type: "material",
          tier: "T1",
          description: "Símbolo da queda do primeiro rei da torre."
        },
        {
          id: "goblin_king_blade",
          name: "Lâmina do Rei Goblin",
          type: "weapon",
          tier: "T1",
          description: "Uma lâmina curta usada pelo Rei Goblin."
        }
      ]
    },

    {
      floor: 20,
      id: "boss_bone_priest",
      name: "Sacerdote dos Ossos",
      tier: "T2",
      race: "undead",
      type: "boss",
      level: 22,
      hpMultiplier: 3.0,
      atkMultiplier: 1.9,
      defMultiplier: 1.6,
      uniqueReputation: "Purificador dos Ossos",
      mechanics: [
        "invoca_mortos",
        "drena_vida",
        "resiste_medo"
      ],
      uniqueDrops: [
        {
          id: "bone_priest_relic",
          name: "Relíquia do Sacerdote dos Ossos",
          type: "material",
          tier: "T2",
          description: "Relíquia fria usada em rituais proibidos."
        },
        {
          id: "bone_priest_staff",
          name: "Cajado de Ossos",
          type: "weapon",
          tier: "T2",
          description: "Cajado macabro que carrega mana morta."
        }
      ]
    },

    {
      floor: 30,
      id: "boss_rune_guardian",
      name: "Guardião Rúnico",
      tier: "T2",
      race: "golem",
      type: "boss",
      level: 32,
      hpMultiplier: 3.4,
      atkMultiplier: 1.7,
      defMultiplier: 2.0,
      uniqueReputation: "Rachador de Runas",
      mechanics: [
        "defesa_alta",
        "reduz_dano_a_cada_3_turnos",
        "protege_o_nucleo"
      ],
      uniqueDrops: [
        {
          id: "rune_guardian_core",
          name: "Núcleo do Guardião Rúnico",
          type: "material",
          tier: "T2",
          description: "Núcleo usado para futuras melhorias mágicas."
        },
        {
          id: "rune_guardian_plate",
          name: "Placa Rúnica do Guardião",
          type: "armor",
          tier: "T2",
          description: "Parte da armadura rúnica do guardião."
        }
      ]
    },

    {
      floor: 40,
      id: "boss_crimson_reaper",
      name: "Ceifador Carmesim",
      tier: "T3",
      race: "demon",
      type: "boss",
      level: 42,
      hpMultiplier: 3.6,
      atkMultiplier: 2.1,
      defMultiplier: 1.6,
      uniqueReputation: "Sobrevivente Carmesim",
      mechanics: [
        "sangramento",
        "marca_o_jogador_ferido",
        "fica_mais_forte_com_alvo_baixo_hp"
      ],
      uniqueDrops: [
        {
          id: "crimson_reaper_chain",
          name: "Corrente do Ceifador Carmesim",
          type: "material",
          tier: "T3",
          description: "Corrente usada em upgrades de armas sombrias."
        },
        {
          id: "crimson_reaper_scythe_shard",
          name: "Fragmento da Foice Carmesim",
          type: "weapon_material",
          tier: "T3",
          description: "Fragmento de uma arma amaldiçoada."
        }
      ]
    },

    {
      floor: 50,
      id: "boss_abyss_guardian",
      name: "Guardião do Abismo",
      tier: "T3",
      race: "elemental",
      type: "final_boss",
      level: 50,
      hpMultiplier: 4.5,
      atkMultiplier: 2.2,
      defMultiplier: 1.8,
      uniqueReputation: "Vencedor da Torre do Abismo",
      titleReward: "Conquistador do Abismo Inicial",
      mechanics: [
        "dano_em_area",
        "cura_propria",
        "slow_em_grupo",
        "cristais_de_cura",
        "explosao_a_cada_3_turnos"
      ],
      phases: [
        {
          phase: 1,
          hpBelowPercent: 100,
          description: "O Guardião usa ataques em área leves e aplica lentidão.",
          effects: ["slow", "area_damage_small"]
        },
        {
          phase: 2,
          hpBelowPercent: 65,
          description: "Cristais abissais aparecem e curam o Guardião se não forem destruídos.",
          effects: ["summon_heal_crystals", "self_heal"]
        },
        {
          phase: 3,
          hpBelowPercent: 30,
          description: "O Guardião entra em colapso e lança explosões em área a cada 3 turnos.",
          effects: ["area_damage_large", "slow_all", "rage"]
        }
      ],
      strategyRules: [
        "Jogadores devem destruir cristais para impedir a cura.",
        "Jogadores lentos têm mais chance de sofrer dano em área.",
        "Tanques devem proteger aliados frágeis.",
        "Curas e defesa devem ser usadas com cuidado.",
        "Bater sem estratégia deve ser perigoso."
      ],
      uniqueDrops: [
        {
          id: "abyss_guardian_core",
          name: "Núcleo do Guardião do Abismo",
          type: "material",
          tier: "T3",
          description: "Núcleo especial usado futuramente para upgrades de arma."
        },
        {
          id: "abyss_guardian_mark",
          name: "Marca do Guardião do Abismo",
          type: "reputation_item",
          tier: "T3",
          description: "Prova de que o jogador venceu o primeiro grande desafio da torre."
        }
      ]
    }
  ]
};

// =====================================================
// FUNÇÕES DA TORRE
// =====================================================

export function getTowerTierByFloor(floor) {
  const range = ABYSS_TOWER.tierRanges.find(r => floor >= r.from && floor <= r.to);
  return range?.tier || "T1";
}

export function getTowerThemeByFloor(floor) {
  const range = ABYSS_TOWER.tierRanges.find(r => floor >= r.from && floor <= r.to);
  return range || ABYSS_TOWER.tierRanges[0];
}

export function isMiniBossFloor(floor) {
  return ABYSS_TOWER.floorRules.miniBossFloors.includes(floor);
}

export function isBossFloor(floor) {
  return ABYSS_TOWER.floorRules.bossFloors.includes(floor);
}

export function getMiniBossByFloor(floor) {
  return ABYSS_TOWER.miniBosses.find(boss => boss.floor === floor) || null;
}

export function getBossByFloor(floor) {
  return ABYSS_TOWER.bosses.find(boss => boss.floor === floor) || null;
}

export function getFloorType(floor) {
  if (isBossFloor(floor)) return "boss";
  if (isMiniBossFloor(floor)) return "mini_boss";
  return "normal";
}

export function getMonsterPoolByFloor(floor) {
  const tier = getTowerTierByFloor(floor);
  return ABYSS_TOWER.monsterPools[tier] || ABYSS_TOWER.monsterPools.T1;
}

export function createTowerFloor(floor) {
  const tier = getTowerTierByFloor(floor);
  const theme = getTowerThemeByFloor(floor);
  const type = getFloorType(floor);

  if (type === "boss") {
    return {
      floor,
      type,
      tier,
      theme,
      boss: getBossByFloor(floor),
      monsterCount: 1
    };
  }

  if (type === "mini_boss") {
    return {
      floor,
      type,
      tier,
      theme,
      miniBoss: getMiniBossByFloor(floor),
      monsterCount: 1
    };
  }

  return {
    floor,
    type,
    tier,
    theme,
    monsterPool: getMonsterPoolByFloor(floor),
    monsterCount: ABYSS_TOWER.monstersPerNormalFloor
  };
}

export function getTowerDropChanceByFloor(floor) {
  const type = getFloorType(floor);

  if (type === "boss") return ABYSS_TOWER.rules.bossVariableDropChance;
  if (type === "mini_boss") return ABYSS_TOWER.rules.miniBossDropChance;
  return ABYSS_TOWER.rules.normalMonsterDropChance;
}

export function getTowerPromptContext(floor) {
  const floorData = createTowerFloor(floor);

  return `
TORRE DO ABISMO:

Andar atual: ${floorData.floor}
Tipo do andar: ${floorData.type}
Tier máximo do andar: ${floorData.tier}
Tema: ${floorData.theme.theme}
Descrição do tema: ${floorData.theme.description}

REGRAS DA TORRE:
- A IA apenas narra.
- O sistema controla monstros, loot, bosses e progressão.
- Andares normais têm 3 monstros.
- Mini bosses e bosses têm loot melhor.
- Bosses dropam item único por jogador.
- O máximo da torre é T3.
- O boss final exige estratégia.
`;
}
