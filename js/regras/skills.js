// =====================================================
// skills.js
// SISTEMA DE HABILIDADES — ELDRAKAR
// Heróis e monstros usam o mesmo padrão.
// =====================================================

export const SKILL_TIERS = {
  T1: { name: "Comum", minLevel: 1 },
  T2: { name: "Incomum", minLevel: 10 },
  T3: { name: "Raro", minLevel: 20 },
  T4: { name: "Épico", minLevel: 35 },
  T5: { name: "Lendário", minLevel: 55 },
  T6: { name: "Mítico", minLevel: 75 }
};

// =====================================================
// REGRAS GLOBAIS DE HABILIDADES
// =====================================================

export const SKILL_RULES = {
  maxSkillsPerTurn: 1,
  offensiveSkillsBlockedInCity: true,
  requireMana: true,
  requireEnemyForAttack: true,
  monsterCanUseSkills: true,

  forbiddenTypesInCity: [
    "attack",
    "curse",
    "necromancy",
    "summon_hostile"
  ]
};

// =====================================================
// TIPOS DE HABILIDADE
// attack = dano direto
// heal = cura
// buff = melhora status
// debuff = reduz status inimigo
// curse = maldição
// summon = invocação aliada
// control = controle
// defense = defesa
// =====================================================

export const GAME_SKILLS = [

  // =====================================================
  // ⚔️ GUERREIRO DRACÔNICO — BASE
  // =====================================================

  {
    id: "power_slash",
    name: "Golpe Poderoso",
    icon: "⚔️",
    tier: "T1",
    type: "attack",
    element: "physical",
    classId: "warrior_dragon",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 0,
    cooldown: 1,
    power: 10,
    scaling: { strength: 1.2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um golpe físico forte com a arma equipada."
  },

  {
    id: "iron_guard",
    name: "Guarda de Ferro",
    icon: "🛡️",
    tier: "T1",
    type: "defense",
    element: "physical",
    classId: "warrior_dragon",
    subclassId: null,
    thirdClass: null,
    minLevel: 3,
    manaCost: 0,
    cooldown: 2,
    power: 0,
    buff: { defense: 4, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Assume postura defensiva e aumenta a defesa por 2 turnos."
  },

  {
    id: "dragon_roar",
    name: "Rugido Dracônico",
    icon: "🐉",
    tier: "T2",
    type: "debuff",
    element: "fear",
    classId: "warrior_dragon",
    subclassId: null,
    thirdClass: null,
    minLevel: 12,
    manaCost: 8,
    cooldown: 3,
    power: 0,
    debuff: { attack: -4, duration: 2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um rugido que intimida o inimigo e reduz seu ataque."
  },

  // Cavaleiro de Ferro
  {
    id: "shield_wall",
    name: "Muralha de Escudo",
    icon: "🛡️",
    tier: "T3",
    type: "defense",
    element: "physical",
    classId: "warrior_dragon",
    subclassId: "iron_knight",
    thirdClass: null,
    minLevel: 20,
    manaCost: 5,
    cooldown: 3,
    power: 0,
    buff: { defense: 10, partyDefense: 3, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Cria uma defesa pesada para si e aliados próximos."
  },

  {
    id: "dragon_lord_aegis",
    name: "Égide do Lorde Dragônico",
    icon: "👑",
    tier: "T5",
    type: "defense",
    element: "dragon",
    classId: "warrior_dragon",
    subclassId: "iron_knight",
    thirdClass: "Lorde Dragônico",
    minLevel: 55,
    manaCost: 25,
    cooldown: 5,
    power: 0,
    buff: { defense: 25, resistance: 15, duration: 3 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Uma defesa lendária banhada por energia dracônica."
  },

  // Berserker
  {
    id: "blood_frenzy",
    name: "Frenesi de Sangue",
    icon: "🔥",
    tier: "T3",
    type: "buff",
    element: "rage",
    classId: "warrior_dragon",
    subclassId: "berserker",
    thirdClass: null,
    minLevel: 20,
    manaCost: 0,
    cooldown: 4,
    power: 0,
    buff: { strength: 12, defense: -4, duration: 3 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Aumenta muito o ataque, mas reduz defesa."
  },

  {
    id: "war_titan_smash",
    name: "Esmagamento do Titã",
    icon: "💀",
    tier: "T5",
    type: "attack",
    element: "physical",
    classId: "warrior_dragon",
    subclassId: "berserker",
    thirdClass: "Titã de Guerra",
    minLevel: 55,
    manaCost: 15,
    cooldown: 4,
    power: 55,
    scaling: { strength: 2.1 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um ataque devastador capaz de quebrar armaduras."
  },

  // Guardião de Escudo
  {
    id: "protect_ally",
    name: "Proteger Aliado",
    icon: "🏰",
    tier: "T3",
    type: "defense",
    element: "physical",
    classId: "warrior_dragon",
    subclassId: "shield_guardian",
    thirdClass: null,
    minLevel: 20,
    manaCost: 8,
    cooldown: 2,
    power: 0,
    buff: { partyDefense: 8, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Protege aliados próximos durante o combate."
  },

  {
    id: "crimson_command",
    name: "Comando Carmesim",
    icon: "⚔️",
    tier: "T5",
    type: "buff",
    element: "war",
    classId: "warrior_dragon",
    subclassId: "shield_guardian",
    thirdClass: "General Carmesim",
    minLevel: 55,
    manaCost: 30,
    cooldown: 5,
    power: 0,
    buff: { partyDefense: 15, partyAttack: 8, duration: 3 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Comanda o grupo, aumentando ataque e defesa dos aliados."
  },

  // =====================================================
  // 🔮 MAGO RÚNICO — BASE
  // =====================================================

  {
    id: "arcane_spark",
    name: "Faísca Arcana",
    icon: "✨",
    tier: "T1",
    type: "attack",
    element: "arcane",
    classId: "runic_mage",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 5,
    cooldown: 1,
    power: 12,
    scaling: { intelligence: 1.3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um disparo simples de energia arcana."
  },

  {
    id: "mana_shield",
    name: "Escudo de Mana",
    icon: "🔮",
    tier: "T1",
    type: "defense",
    element: "arcane",
    classId: "runic_mage",
    subclassId: null,
    thirdClass: null,
    minLevel: 5,
    manaCost: 10,
    cooldown: 3,
    power: 0,
    buff: { defense: 5, magicResistance: 5, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero", "monster"],
    description: "Cria uma barreira mágica ao redor do usuário."
  },

  {
    id: "rune_bind",
    name: "Prisão Rúnica",
    icon: "🪬",
    tier: "T2",
    type: "control",
    element: "arcane",
    classId: "runic_mage",
    subclassId: null,
    thirdClass: null,
    minLevel: 14,
    manaCost: 18,
    cooldown: 4,
    power: 0,
    debuff: { agility: -8, duration: 2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Runas prendem o inimigo e reduzem sua mobilidade."
  },

  // Elementalista
  {
    id: "fire_lance",
    name: "Lança de Fogo",
    icon: "🔥",
    tier: "T3",
    type: "attack",
    element: "fire",
    classId: "runic_mage",
    subclassId: "elementalist",
    thirdClass: null,
    minLevel: 25,
    manaCost: 22,
    cooldown: 2,
    power: 34,
    scaling: { intelligence: 1.7 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Uma lança flamejante atravessa o alvo."
  },

  {
    id: "arcane_sage_storm",
    name: "Tempestade Arcana",
    icon: "🌌",
    tier: "T5",
    type: "attack",
    element: "arcane",
    classId: "runic_mage",
    subclassId: "elementalist",
    thirdClass: "Sábio Arcano",
    minLevel: 70,
    manaCost: 55,
    cooldown: 6,
    power: 90,
    scaling: { intelligence: 2.4 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Uma tempestade de energia arcana destrói a área."
  },

  // Arquimago
  {
    id: "pure_magic_burst",
    name: "Explosão de Magia Pura",
    icon: "📚",
    tier: "T3",
    type: "attack",
    element: "pure_magic",
    classId: "runic_mage",
    subclassId: "archmage",
    thirdClass: null,
    minLevel: 25,
    manaCost: 28,
    cooldown: 3,
    power: 40,
    scaling: { intelligence: 1.9 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Dispara magia pura instável contra o alvo."
  },

  {
    id: "lord_of_runes_seal",
    name: "Selo do Senhor das Runas",
    icon: "👁️",
    tier: "T5",
    type: "control",
    element: "rune",
    classId: "runic_mage",
    subclassId: "archmage",
    thirdClass: "Senhor das Runas",
    minLevel: 70,
    manaCost: 60,
    cooldown: 7,
    power: 0,
    debuff: { attack: -20, defense: -20, duration: 3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Marca o inimigo com runas que enfraquecem corpo e alma."
  },

  // Invocador Rúnico
  {
    id: "summon_rune_beast",
    name: "Invocar Fera Rúnica",
    icon: "🐉",
    tier: "T3",
    type: "summon",
    element: "rune",
    classId: "runic_mage",
    subclassId: "runic_summoner",
    thirdClass: null,
    minLevel: 25,
    manaCost: 35,
    cooldown: 5,
    power: 0,
    summon: { creature: "Fera Rúnica", duration: 3, bonusAttack: 18 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Invoca uma criatura feita de runas vivas."
  },

  {
    id: "astral_gate",
    name: "Portal Astral",
    icon: "🌠",
    tier: "T5",
    type: "summon",
    element: "astral",
    classId: "runic_mage",
    subclassId: "runic_summoner",
    thirdClass: "Mago Astral",
    minLevel: 70,
    manaCost: 80,
    cooldown: 8,
    power: 0,
    summon: { creature: "Guardião Astral", duration: 4, bonusAttack: 45 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Abre uma fenda e chama uma entidade astral."
  },

  // =====================================================
  // 🏹 ARQUEIRO — BASE
  // =====================================================

  {
    id: "quick_shot",
    name: "Disparo Rápido",
    icon: "🏹",
    tier: "T1",
    type: "attack",
    element: "physical",
    classId: "archer",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 0,
    cooldown: 1,
    power: 9,
    scaling: { agility: 1.3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um tiro rápido e preciso."
  },

  {
    id: "eagle_focus",
    name: "Foco da Águia",
    icon: "🦅",
    tier: "T1",
    type: "buff",
    element: "focus",
    classId: "archer",
    subclassId: null,
    thirdClass: null,
    minLevel: 6,
    manaCost: 5,
    cooldown: 3,
    power: 0,
    buff: { criticalChance: 8, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Aumenta chance crítica por alguns turnos."
  },

  // Caçador
  {
    id: "monster_mark",
    name: "Marca do Caçador",
    icon: "🐺",
    tier: "T3",
    type: "debuff",
    element: "hunt",
    classId: "archer",
    subclassId: "hunter",
    thirdClass: null,
    minLevel: 18,
    manaCost: 12,
    cooldown: 3,
    power: 0,
    debuff: { defense: -8, duration: 3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Marca o monstro, deixando-o mais vulnerável."
  },

  {
    id: "dragon_eye_arrow",
    name: "Flecha Olho do Dragão",
    icon: "🐉",
    tier: "T5",
    type: "attack",
    element: "dragon",
    classId: "archer",
    subclassId: "hunter",
    thirdClass: "Olho do Dragão",
    minLevel: 50,
    manaCost: 35,
    cooldown: 5,
    power: 75,
    scaling: { agility: 2.2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Uma flecha lendária que busca o ponto vital do inimigo."
  },

  // Atirador Sombrio
  {
    id: "shadow_arrow",
    name: "Flecha Sombria",
    icon: "🌑",
    tier: "T3",
    type: "attack",
    element: "shadow",
    classId: "archer",
    subclassId: "shadow_shooter",
    thirdClass: null,
    minLevel: 18,
    manaCost: 16,
    cooldown: 2,
    power: 36,
    scaling: { agility: 1.7 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Uma flecha envolta em sombra."
  },

  {
    id: "royal_sentinel_shot",
    name: "Disparo da Sentinela Real",
    icon: "👑",
    tier: "T5",
    type: "attack",
    element: "physical",
    classId: "archer",
    subclassId: "shadow_shooter",
    thirdClass: "Sentinela Real",
    minLevel: 50,
    manaCost: 30,
    cooldown: 4,
    power: 70,
    scaling: { agility: 2.1 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Um disparo preciso usado por guardiões de elite."
  },

  // Patrulheiro
  {
    id: "forest_trap",
    name: "Armadilha da Floresta",
    icon: "🌲",
    tier: "T3",
    type: "control",
    element: "nature",
    classId: "archer",
    subclassId: "ranger",
    thirdClass: null,
    minLevel: 18,
    manaCost: 14,
    cooldown: 4,
    power: 0,
    debuff: { agility: -10, duration: 2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Prende o inimigo com armadilhas naturais."
  },

  {
    id: "celestial_hunt",
    name: "Caçada Celestial",
    icon: "☄️",
    tier: "T5",
    type: "buff",
    element: "celestial",
    classId: "archer",
    subclassId: "ranger",
    thirdClass: "Caçador Celestial",
    minLevel: 50,
    manaCost: 35,
    cooldown: 6,
    power: 0,
    buff: { agility: 20, criticalChance: 15, duration: 3 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Aumenta drasticamente precisão e velocidade."
  },

  // =====================================================
  // 🐉 DOMADOR DE DRAGÕES — BASE
  // =====================================================

  {
    id: "beast_call",
    name: "Chamado da Fera",
    icon: "🐺",
    tier: "T1",
    type: "summon",
    element: "beast",
    classId: "dragon_tamer",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 12,
    cooldown: 4,
    power: 0,
    summon: { creature: "Fera Jovem", duration: 2, bonusAttack: 8 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Chama uma pequena criatura aliada."
  },

  {
    id: "tamer_whip",
    name: "Comando de Domador",
    icon: "🐉",
    tier: "T2",
    type: "buff",
    element: "beast",
    classId: "dragon_tamer",
    subclassId: null,
    thirdClass: null,
    minLevel: 12,
    manaCost: 10,
    cooldown: 3,
    power: 0,
    buff: { petAttack: 10, duration: 2 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Aumenta o poder do companheiro invocado."
  },

  {
    id: "beast_pack",
    name: "Matilha Selvagem",
    icon: "🐺",
    tier: "T3",
    type: "summon",
    element: "beast",
    classId: "dragon_tamer",
    subclassId: "beast_master",
    thirdClass: null,
    minLevel: 30,
    manaCost: 35,
    cooldown: 5,
    power: 0,
    summon: { creature: "Matilha Selvagem", duration: 3, bonusAttack: 25 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Invoca uma matilha para atacar junto."
  },

  {
    id: "dragon_mount_charge",
    name: "Investida do Dragão",
    icon: "🐲",
    tier: "T3",
    type: "attack",
    element: "dragon",
    classId: "dragon_tamer",
    subclassId: "dragon_knight",
    thirdClass: null,
    minLevel: 30,
    manaCost: 30,
    cooldown: 4,
    power: 50,
    scaling: { strength: 1.4, intelligence: 1.1 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Avança com energia dracônica contra o inimigo."
  },

  {
    id: "ancient_bond",
    name: "Vínculo Ancestral",
    icon: "✨",
    tier: "T3",
    type: "buff",
    element: "spirit",
    classId: "dragon_tamer",
    subclassId: "bond_master",
    thirdClass: null,
    minLevel: 30,
    manaCost: 28,
    cooldown: 5,
    power: 0,
    buff: { petAttack: 15, petDefense: 15, duration: 3 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Fortalece o vínculo com criaturas aliadas."
  },

  // =====================================================
  // 💀 BRUXO NEGRO — BASE
  // =====================================================

  {
    id: "shadow_bolt",
    name: "Seta Sombria",
    icon: "💀",
    tier: "T1",
    type: "attack",
    element: "shadow",
    classId: "dark_warlock",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 6,
    cooldown: 1,
    power: 14,
    scaling: { intelligence: 1.2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Dispara energia sombria no alvo."
  },

  {
    id: "life_drain",
    name: "Drenar Vida",
    icon: "🩸",
    tier: "T2",
    type: "attack",
    element: "shadow",
    classId: "dark_warlock",
    subclassId: null,
    thirdClass: null,
    minLevel: 12,
    manaCost: 16,
    cooldown: 3,
    power: 24,
    scaling: { intelligence: 1.4 },
    drain: { healPercent: 30 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Causa dano e cura parte do dano causado."
  },

  {
    id: "raise_skeleton",
    name: "Erguer Esqueleto",
    icon: "☠️",
    tier: "T3",
    type: "necromancy",
    element: "death",
    classId: "dark_warlock",
    subclassId: "necromancer",
    thirdClass: null,
    minLevel: 28,
    manaCost: 32,
    cooldown: 5,
    power: 0,
    summon: { creature: "Esqueleto Servo", duration: 3, bonusAttack: 22 },
    requiresEnemy: false,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Invoca um esqueleto para lutar. Proibido em cidades."
  },

  {
    id: "abyss_whisper",
    name: "Sussurro do Abismo",
    icon: "👁️",
    tier: "T3",
    type: "curse",
    element: "abyss",
    classId: "dark_warlock",
    subclassId: "dark_cultist",
    thirdClass: null,
    minLevel: 28,
    manaCost: 30,
    cooldown: 4,
    power: 0,
    debuff: { attack: -12, defense: -8, duration: 3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Sussurros enlouquecem e enfraquecem o inimigo."
  },

  {
    id: "reaper_cut",
    name: "Corte do Ceifador",
    icon: "🗡️",
    tier: "T3",
    type: "attack",
    element: "death",
    classId: "dark_warlock",
    subclassId: "reaper",
    thirdClass: null,
    minLevel: 28,
    manaCost: 25,
    cooldown: 3,
    power: 42,
    scaling: { intelligence: 1.5, agility: 0.8 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um corte sombrio que atravessa energia vital."
  },

  // =====================================================
  // 🛡️ PALADINO — BASE
  // =====================================================

  {
    id: "holy_strike",
    name: "Golpe Sagrado",
    icon: "🛡️",
    tier: "T1",
    type: "attack",
    element: "holy",
    classId: "paladin",
    subclassId: null,
    thirdClass: null,
    minLevel: 1,
    manaCost: 5,
    cooldown: 1,
    power: 12,
    scaling: { strength: 0.9, intelligence: 0.7 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero", "monster"],
    description: "Um ataque físico abençoado pela luz."
  },

  {
    id: "minor_heal",
    name: "Cura Menor",
    icon: "✨",
    tier: "T1",
    type: "heal",
    element: "holy",
    classId: "paladin",
    subclassId: null,
    thirdClass: null,
    minLevel: 5,
    manaCost: 10,
    cooldown: 3,
    power: 20,
    scaling: { intelligence: 1.1 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero", "monster"],
    description: "Recupera uma pequena quantidade de vida."
  },

  {
    id: "divine_barrier",
    name: "Barreira Divina",
    icon: "🌟",
    tier: "T2",
    type: "defense",
    element: "holy",
    classId: "paladin",
    subclassId: null,
    thirdClass: null,
    minLevel: 14,
    manaCost: 18,
    cooldown: 4,
    power: 0,
    buff: { defense: 8, holyResistance: 10, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero", "monster"],
    description: "Cria uma barreira de luz protetora."
  },

  {
    id: "sacred_heal",
    name: "Cura Sagrada",
    icon: "💛",
    tier: "T3",
    type: "heal",
    element: "holy",
    classId: "paladin",
    subclassId: "holy_healer",
    thirdClass: null,
    minLevel: 25,
    manaCost: 30,
    cooldown: 4,
    power: 55,
    scaling: { intelligence: 1.8 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Uma cura poderosa para si ou aliados."
  },

  {
    id: "templar_judgment",
    name: "Julgamento Templário",
    icon: "⚖️",
    tier: "T3",
    type: "attack",
    element: "holy",
    classId: "paladin",
    subclassId: "templar",
    thirdClass: null,
    minLevel: 25,
    manaCost: 28,
    cooldown: 3,
    power: 45,
    scaling: { strength: 1.2, intelligence: 1.2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["hero"],
    description: "Um golpe sagrado que pune criaturas corrompidas."
  },

  {
    id: "divine_guard",
    name: "Guarda Divina",
    icon: "🛡️",
    tier: "T3",
    type: "defense",
    element: "holy",
    classId: "paladin",
    subclassId: "divine_squire",
    thirdClass: null,
    minLevel: 25,
    manaCost: 22,
    cooldown: 3,
    power: 0,
    buff: { defense: 14, partyDefense: 5, duration: 2 },
    requiresEnemy: false,
    allowedInCity: true,
    usableBy: ["hero"],
    description: "Protege o paladino e aliados próximos."
  },

  // =====================================================
  // 👹 HABILIDADES GERAIS DE MONSTROS
  // =====================================================

  {
    id: "monster_bite",
    name: "Mordida Selvagem",
    icon: "🦷",
    tier: "T1",
    type: "attack",
    element: "physical",
    monsterOnly: true,
    minLevel: 1,
    manaCost: 0,
    cooldown: 1,
    power: 8,
    scaling: { attack: 1.0 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["monster"],
    description: "Ataque básico de criaturas selvagens."
  },

  {
    id: "poison_spit",
    name: "Cuspe Venenoso",
    icon: "☠️",
    tier: "T2",
    type: "debuff",
    element: "poison",
    monsterOnly: true,
    minLevel: 10,
    manaCost: 0,
    cooldown: 3,
    power: 10,
    debuff: { defense: -4, duration: 2 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["monster"],
    description: "Veneno que enfraquece o alvo."
  },

  {
    id: "shadow_claw",
    name: "Garra Sombria",
    icon: "🌑",
    tier: "T3",
    type: "attack",
    element: "shadow",
    monsterOnly: true,
    minLevel: 25,
    manaCost: 0,
    cooldown: 2,
    power: 32,
    scaling: { attack: 1.4 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["monster"],
    description: "Garras cobertas de sombra rasgam o alvo."
  },

  {
    id: "infernal_breath",
    name: "Sopro Infernal",
    icon: "🔥",
    tier: "T4",
    type: "attack",
    element: "fire",
    monsterOnly: true,
    minLevel: 40,
    manaCost: 0,
    cooldown: 4,
    power: 55,
    scaling: { attack: 1.8 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["monster"],
    description: "Um sopro flamejante de criatura superior."
  },

  {
    id: "colossal_presence",
    name: "Presença Colossal",
    icon: "🌑",
    tier: "T6",
    type: "debuff",
    element: "fear",
    monsterOnly: true,
    bossOnly: true,
    minLevel: 90,
    manaCost: 0,
    cooldown: 5,
    power: 0,
    debuff: { attack: -30, defense: -30, agility: -30, duration: 3 },
    requiresEnemy: true,
    allowedInCity: false,
    usableBy: ["monster"],
    description: "A simples presença do boss enfraquece todos ao redor."
  }
];

// =====================================================
// FUNÇÕES DE BUSCA
// =====================================================

export function getSkillById(skillId) {
  return GAME_SKILLS.find(skill => skill.id === skillId) || null;
}

export function getSkillsByTier(tier) {
  return GAME_SKILLS.filter(skill => skill.tier === tier);
}

export function getMonsterSkills(monsterLevel = 1, monsterTier = "T1") {
  return GAME_SKILLS.filter(skill => {
    if (!skill.usableBy?.includes("monster")) return false;
    if ((skill.minLevel || 1) > monsterLevel) return false;

    const skillTierLevel = SKILL_TIERS[skill.tier]?.minLevel || 1;
    const monsterTierLevel = SKILL_TIERS[monsterTier]?.minLevel || 1;

    return skillTierLevel <= monsterTierLevel || skill.monsterOnly;
  });
}

export function getHeroAvailableSkills(character) {
  return GAME_SKILLS.filter(skill => {
    if (!skill.usableBy?.includes("hero")) return false;
    if (skill.monsterOnly) return false;
    if ((skill.minLevel || 1) > (character.level || 1)) return false;

    if (skill.classId && skill.classId !== character.classId) return false;

    if (skill.subclassId && skill.subclassId !== character.subclassId) {
      return false;
    }

    if (skill.thirdClass && skill.thirdClass !== character.thirdClass) {
      return false;
    }

    return true;
  });
}

// =====================================================
// VALIDAÇÃO DE USO DE HABILIDADE
// =====================================================

export function canUseSkill({
  skill,
  character,
  currentEnemy,
  currentPlace = "world",
  usedSkillThisTurn = false
}) {
  if (!skill) {
    return {
      allowed: false,
      message: "Habilidade não encontrada."
    };
  }

  if (!character) {
    return {
      allowed: false,
      message: "Personagem não carregado."
    };
  }

  if ((character.hp || 0) <= 0) {
    return {
      allowed: false,
      message: "💀 Você está sem vida e não pode usar habilidades."
    };
  }

  if (usedSkillThisTurn && SKILL_RULES.maxSkillsPerTurn === 1) {
    return {
      allowed: false,
      message: "⚠️ Você só pode usar uma habilidade por turno."
    };
  }

  if ((character.level || 1) < (skill.minLevel || 1)) {
    return {
      allowed: false,
      message: `⚠️ Essa habilidade exige nível ${skill.minLevel}.`
    };
  }

  if (
    currentPlace === "cidade" &&
    SKILL_RULES.offensiveSkillsBlockedInCity &&
    SKILL_RULES.forbiddenTypesInCity.includes(skill.type)
  ) {
    return {
      allowed: false,
      message: "⚠️ Essa habilidade é proibida dentro da cidade."
    };
  }

  if (skill.requiresEnemy && !currentEnemy) {
    return {
      allowed: false,
      message: "⚠️ Não há alvo para essa habilidade."
    };
  }

  if (SKILL_RULES.requireMana && (character.mana || 0) < (skill.manaCost || 0)) {
    return {
      allowed: false,
      message: "🔮 Mana insuficiente."
    };
  }

  return {
    allowed: true,
    message: ""
  };
}

// =====================================================
// CÁLCULO DE DANO / CURA
// =====================================================

export function calculateSkillPower(skill, userStats = {}) {
  let total = skill.power || 0;

  Object.entries(skill.scaling || {}).forEach(([stat, multiplier]) => {
    total += Math.floor((userStats[stat] || 0) * multiplier);
  });

  return Math.max(0, total);
}

export function getSkillPromptContext(character) {
  const skills = getHeroAvailableSkills(character);

  if (!skills.length) {
    return "O personagem ainda não possui habilidades disponíveis.";
  }

  return skills.map(skill => {
    return `- ${skill.icon} ${skill.name} (${skill.tier}) | Tipo: ${skill.type} | Mana: ${skill.manaCost} | ${skill.description}`;
  }).join("\n");
}
