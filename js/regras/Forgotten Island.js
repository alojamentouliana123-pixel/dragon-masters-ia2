// =====================================================
// forgotten-island.js
// ILHA ESQUECIDA — RAID COOPERATIVA T3+
// =====================================================

export const FORGOTTEN_ISLAND = {
  id: "forgotten_island",
  name: "Ilha Esquecida",
  type: "raid_dungeon",

  minPlayers: 3,
  maxPlayers: 8,
  minLevel: 50,
  minMonsterLevel: 30,
  minTier: "T3",
  maxRooms: 20,

  description:
    "Uma ilha cercada por mar escuro e névoa permanente. Debaixo dela existe um subsolo antigo tomado por monstros, ruínas afogadas e ecos da Grande Ruptura.",

  rules: {
    aiOnlyNarrates: true,
    systemControlsRooms: true,
    systemControlsMonsters: true,
    systemControlsLoot: true,
    systemControlsBosses: true,

    // Regra do usuário:
    // Torre normal = 3 monstros.
    // Ilha = 10x quantidade normal = 30 monstros por sala normal.
    normalRoomTotalMonsters: 30,
    normalRoomWaves: 3,
    monstersPerWave: 10,

    miniBossAdds: 10,
    bossAdds: 20,
    finalBossInfiniteWaves: true,
    finalBossWaveSize: 8,

    normalMonsterDropChance: 20,
    miniBossDropChance: 55,
    bossVariableDropChance: 90,
    bossUniqueDropPerPlayer: 1,

    reputationPerRoom: 1,
    reputationPerMiniBoss: 5,
    reputationPerBoss: 10,
    reputationFinalBoss: 25
  },

  reputation: {
    island: "Explorador da Ilha Esquecida",
    sea: "Sobrevivente das Marés Mortas",
    final: "Conquistador do Coração Afogado"
  },

  globalMechanics: [
    "nevoa_densa",
    "salas_inundadas",
    "corrupcao_abissal",
    "monstros_em_onda",
    "visao_reduzida",
    "pressao_do_mar"
  ],

  roomRanges: [
    {
      from: 1,
      to: 5,
      tier: "T3",
      zone: "Praia Morta",
      description:
        "A entrada da ilha é tomada por restos de navios, areia negra e criaturas que saem da névoa."
    },
    {
      from: 6,
      to: 10,
      tier: "T3",
      zone: "Ruínas Afogadas",
      description:
        "Salas antigas estão parcialmente submersas. Símbolos desconhecidos brilham nas paredes úmidas."
    },
    {
      from: 11,
      to: 15,
      tier: "T3",
      zone: "Cavernas de Sal",
      description:
        "Cristais de sal e ossos antigos cobrem as cavernas. O ar tem gosto de ferrugem e mar morto."
    },
    {
      from: 16,
      to: 20,
      tier: "T3",
      zone: "Coração Afogado",
      description:
        "O subsolo pulsa como se a própria ilha estivesse viva. Cada passo ecoa como batida de coração."
    }
  ],

  monsterPools: {
    T3: [
      "undead",
      "mutant",
      "demon",
      "elemental",
      "beast",
      "spider",
      "golem",
      "dragon"
    ]
  },

  roomTypes: {
    normalRooms: [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19],
    miniBossRooms: [5, 15],
    bossRooms: [10, 20]
  },

  miniBosses: [
    {
      room: 5,
      id: "mini_drowned_captain",
      name: "Capitão Afogado",
      tier: "T3",
      race: "undead",
      type: "mini_boss",
      level: 52,
      hpMultiplier: 3.0,
      atkMultiplier: 2.0,
      defMultiplier: 1.6,
      adds: 10,
      uniqueReputation: "Carrasco dos Náufragos",
      mechanics: [
        "chama_tripulacao_morta",
        "marca_jogador_ferido",
        "ataque_em_cone"
      ],
      uniqueDrops: [
        {
          id: "drowned_captain_compass",
          name: "Bússola do Capitão Afogado",
          type: "material",
          tier: "T3",
          description: "Uma bússola que aponta para lugares que já morreram."
        },
        {
          id: "captain_salt_blade",
          name: "Lâmina de Sal do Capitão",
          type: "weapon_material",
          tier: "T3",
          description: "Material usado futuramente em upgrades de armas marítimas."
        }
      ]
    },

    {
      room: 15,
      id: "mini_salt_golem",
      name: "Golem de Sal Ancestral",
      tier: "T3",
      race: "golem",
      type: "mini_boss",
      level: 58,
      hpMultiplier: 3.4,
      atkMultiplier: 1.8,
      defMultiplier: 2.3,
      adds: 10,
      uniqueReputation: "Quebrador de Sal",
      mechanics: [
        "defesa_alta",
        "cria_paredes_de_sal",
        "reduz_movimento"
      ],
      uniqueDrops: [
        {
          id: "ancient_salt_core",
          name: "Núcleo de Sal Ancestral",
          type: "material",
          tier: "T3",
          description: "Núcleo usado para fortalecer armaduras e escudos."
        },
        {
          id: "salt_guardian_plate",
          name: "Placa do Guardião de Sal",
          type: "armor_material",
          tier: "T3",
          description: "Placa rígida retirada do corpo do golem."
        }
      ]
    }
  ],

  bosses: [
    {
      room: 10,
      id: "boss_tide_witch",
      name: "Bruxa das Marés Mortas",
      tier: "T3",
      race: "demon",
      type: "boss",
      level: 55,
      hpMultiplier: 4.0,
      atkMultiplier: 2.3,
      defMultiplier: 1.7,
      adds: 20,
      uniqueReputation: "Silenciador das Marés",
      mechanics: [
        "maldição_em_area",
        "cura_com_agua_corrompida",
        "invoca_afogados",
        "reduz_mana_do_grupo"
      ],
      phases: [
        {
          phase: 1,
          hpBelowPercent: 100,
          description: "A Bruxa usa maldições leves e invoca afogados menores.",
          effects: ["curse_small", "summon_drowned"]
        },
        {
          phase: 2,
          hpBelowPercent: 50,
          description: "A água corrompida começa a curá-la se os jogadores não interromperem o ritual.",
          effects: ["self_heal", "mana_drain"]
        }
      ],
      uniqueDrops: [
        {
          id: "dead_tide_orb",
          name: "Orbe da Maré Morta",
          type: "magic_material",
          tier: "T3",
          description: "Material raro para cajados, grimórios e itens mágicos."
        },
        {
          id: "witch_curse_thread",
          name: "Fio de Maldição da Bruxa",
          type: "material",
          tier: "T3",
          description: "Usado em equipamentos sombrios e maldições controladas."
        }
      ]
    },

    {
      room: 20,
      id: "boss_drowned_heart",
      name: "Coração Afogado",
      tier: "T3",
      race: "elemental",
      type: "final_boss",
      level: 65,
      hpMultiplier: 5.0,
      atkMultiplier: 2.6,
      defMultiplier: 2.0,
      adds: "infinite_waves",
      uniqueReputation: "Conquistador do Coração Afogado",
      titleReward: "Sobrevivente da Ilha Esquecida",
      mechanics: [
        "ondas_continuas",
        "agua_subindo",
        "slow_em_grupo",
        "dano_em_area",
        "cura_por_nucleos",
        "corrupcao_mental"
      ],
      phases: [
        {
          phase: 1,
          hpBelowPercent: 100,
          description: "O Coração pulsa lentamente, invocando ondas de criaturas afogadas.",
          effects: ["wave_spawn", "slow_small"]
        },
        {
          phase: 2,
          hpBelowPercent: 70,
          description: "A água começa a subir. Jogadores lentos sofrem mais dano e perdem mobilidade.",
          effects: ["rising_water", "slow_group", "area_damage"]
        },
        {
          phase: 3,
          hpBelowPercent: 40,
          description: "Núcleos afogados surgem e curam o boss enquanto estiverem vivos.",
          effects: ["summon_heal_cores", "self_heal"]
        },
        {
          phase: 4,
          hpBelowPercent: 15,
          description: "O Coração entra em colapso e tenta levar todos para o fundo da ilha.",
          effects: ["large_area_damage", "mental_corruption", "final_rage"]
        }
      ],
      strategyRules: [
        "O grupo deve controlar ondas de monstros.",
        "Jogadores precisam destruir núcleos para impedir a cura.",
        "Tanques devem segurar as ondas.",
        "Magos e arqueiros devem limpar grupos de inimigos.",
        "Paladinos e curandeiros devem proteger jogadores lentos.",
        "Ignorar as mecânicas deve causar derrota."
      ],
      uniqueDrops: [
        {
          id: "drowned_heart_core",
          name: "Núcleo do Coração Afogado",
          type: "upgrade_material",
          tier: "T3",
          description: "Material poderoso para upgrade de armas e equipamentos T3."
        },
        {
          id: "forgotten_island_mark",
          name: "Marca da Ilha Esquecida",
          type: "reputation_item",
          tier: "T3",
          description: "Prova de que o jogador sobreviveu ao coração da ilha."
        }
      ]
    }
  ]
};

// =====================================================
// FUNÇÕES DA ILHA ESQUECIDA
// =====================================================

export function canEnterForgottenIsland({ party = [], partySize = 1 } = {}) {
  if (partySize < FORGOTTEN_ISLAND.minPlayers) {
    return {
      allowed: false,
      message: `⚠️ A Ilha Esquecida exige pelo menos ${FORGOTTEN_ISLAND.minPlayers} jogadores.`
    };
  }

  if (partySize > FORGOTTEN_ISLAND.maxPlayers) {
    return {
      allowed: false,
      message: `⚠️ A Ilha Esquecida permite no máximo ${FORGOTTEN_ISLAND.maxPlayers} jogadores.`
    };
  }

  const underLevel = party.filter(player => (player.level || 1) < FORGOTTEN_ISLAND.minLevel);

  if (underLevel.length) {
    return {
      allowed: false,
      message: `⚠️ Todos os jogadores precisam estar no mínimo nível ${FORGOTTEN_ISLAND.minLevel}.`
    };
  }

  return {
    allowed: true,
    message: "✅ O grupo pode entrar na Ilha Esquecida."
  };
}

export function getIslandRoomZone(room) {
  const range = FORGOTTEN_ISLAND.roomRanges.find(r => room >= r.from && room <= r.to);
  return range || FORGOTTEN_ISLAND.roomRanges[0];
}

export function getIslandRoomType(room) {
  if (FORGOTTEN_ISLAND.roomTypes.bossRooms.includes(room)) return "boss";
  if (FORGOTTEN_ISLAND.roomTypes.miniBossRooms.includes(room)) return "mini_boss";
  return "normal";
}

export function getIslandMiniBossByRoom(room) {
  return FORGOTTEN_ISLAND.miniBosses.find(boss => boss.room === room) || null;
}

export function getIslandBossByRoom(room) {
  return FORGOTTEN_ISLAND.bosses.find(boss => boss.room === room) || null;
}

export function getIslandMonsterPool(room) {
  const zone = getIslandRoomZone(room);
  return FORGOTTEN_ISLAND.monsterPools[zone.tier] || FORGOTTEN_ISLAND.monsterPools.T3;
}

export function createIslandRoom(room) {
  const zone = getIslandRoomZone(room);
  const type = getIslandRoomType(room);

  if (type === "boss") {
    const boss = getIslandBossByRoom(room);

    return {
      room,
      type,
      tier: zone.tier,
      zone,
      boss,
      adds: boss?.adds || FORGOTTEN_ISLAND.rules.bossAdds
    };
  }

  if (type === "mini_boss") {
    const miniBoss = getIslandMiniBossByRoom(room);

    return {
      room,
      type,
      tier: zone.tier,
      zone,
      miniBoss,
      adds: miniBoss?.adds || FORGOTTEN_ISLAND.rules.miniBossAdds
    };
  }

  return {
    room,
    type,
    tier: zone.tier,
    zone,
    monsterPool: getIslandMonsterPool(room),
    totalMonsters: FORGOTTEN_ISLAND.rules.normalRoomTotalMonsters,
    waves: FORGOTTEN_ISLAND.rules.normalRoomWaves,
    monstersPerWave: FORGOTTEN_ISLAND.rules.monstersPerWave
  };
}

export function getIslandDropChanceByRoom(room) {
  const type = getIslandRoomType(room);

  if (type === "boss") return FORGOTTEN_ISLAND.rules.bossVariableDropChance;
  if (type === "mini_boss") return FORGOTTEN_ISLAND.rules.miniBossDropChance;
  return FORGOTTEN_ISLAND.rules.normalMonsterDropChance;
}

export function getIslandReputationReward(room) {
  const type = getIslandRoomType(room);

  if (room === 20) return FORGOTTEN_ISLAND.rules.reputationFinalBoss;
  if (type === "boss") return FORGOTTEN_ISLAND.rules.reputationPerBoss;
  if (type === "mini_boss") return FORGOTTEN_ISLAND.rules.reputationPerMiniBoss;
  return FORGOTTEN_ISLAND.rules.reputationPerRoom;
}

export function createIslandRaidProgress(partyId) {
  return {
    islandId: FORGOTTEN_ISLAND.id,
    partyId,
    currentRoom: 1,
    clearedRooms: [],
    status: "active",
    startedAt: Date.now(),
    completedAt: null
  };
}

export function advanceIslandRoom(progress) {
  if (!progress) return null;

  const nextRoom = Math.min(FORGOTTEN_ISLAND.maxRooms, (progress.currentRoom || 1) + 1);
  const clearedRooms = new Set(progress.clearedRooms || []);
  clearedRooms.add(progress.currentRoom || 1);

  const completed = nextRoom >= FORGOTTEN_ISLAND.maxRooms && clearedRooms.has(FORGOTTEN_ISLAND.maxRooms);

  return {
    ...progress,
    currentRoom: completed ? FORGOTTEN_ISLAND.maxRooms : nextRoom,
    clearedRooms: [...clearedRooms],
    status: completed ? "completed" : "active",
    completedAt: completed ? Date.now() : null
  };
}

export function getForgottenIslandPromptContext(room) {
  const roomData = createIslandRoom(room);

  return `
ILHA ESQUECIDA:

Sala atual: ${roomData.room}
Tipo da sala: ${roomData.type}
Tier mínimo: ${FORGOTTEN_ISLAND.minTier}
Zona: ${roomData.zone.zone}
Descrição da zona: ${roomData.zone.description}

REGRAS DA RAID:
- A IA apenas narra.
- O sistema controla monstros, ondas, loot, bosses e progresso.
- Requer ${FORGOTTEN_ISLAND.minPlayers} a ${FORGOTTEN_ISLAND.maxPlayers} jogadores.
- Todos precisam ser nível ${FORGOTTEN_ISLAND.minLevel}+.
- Monstros devem ser nível ${FORGOTTEN_ISLAND.minMonsterLevel}+ e tier T3+.
- Salas normais têm 30 monstros divididos em 3 ondas de 10.
- Mini bosses têm 1 mini boss + 10 ajudantes.
- Bosses têm 1 boss + 20 ajudantes.
- Boss final possui ondas contínuas, água subindo, slow, dano em área e núcleos de cura.
- Bosses dão item único por jogador e drops variados do banco geral.
`;
}
