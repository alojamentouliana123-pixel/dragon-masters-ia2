import {
  auth, db,
  onAuthStateChanged, signOut,
  doc, setDoc, getDoc, serverTimestamp
} from "./firebase.js";

import { GAME_SKILLS } from "./regras/skills.js";

const PRIMARY_CLASSES = [
  {
    id: "warrior_dragon",
    name: "Guerreiro Dracônico",
    icon: "⚔️",
    role: "Tanque / Dano físico",
    description: "Forte, resistente e feito para lutar na linha de frente.",
    stats: {
      hp: 140,
      mana: 40,
      strength: 14,
      defense: 12,
      agility: 6,
      intelligence: 4,
      weight: 8,
      luck: 2,
      speed: 4
    }
  },
  {
    id: "runic_mage",
    name: "Mago Rúnico",
    icon: "🔮",
    role: "Magia / Controle",
    description: "Usa runas, mana e magia ancestral.",
    stats: {
      hp: 70,
      mana: 180,
      strength: 2,
      defense: 4,
      agility: 6,
      intelligence: 18,
      weight: 3,
      luck: 5,
      speed: 5
    }
  },
  {
    id: "archer",
    name: "Arqueiro",
    icon: "🏹",
    role: "Distância / Crítico",
    description: "Rápido, preciso e mortal de longe.",
    stats: {
      hp: 95,
      mana: 70,
      strength: 8,
      defense: 5,
      agility: 16,
      intelligence: 6,
      weight: 5,
      luck: 8,
      speed: 8
    }
  },
  {
    id: "dragon_tamer",
    name: "Domador de Dragões",
    icon: "🐉",
    role: "Pet / Companheiro",
    description: "Cria vínculo com feras, dragões e criaturas.",
    stats: {
      hp: 110,
      mana: 100,
      strength: 7,
      defense: 7,
      agility: 7,
      intelligence: 10,
      weight: 5,
      luck: 7,
      speed: 6
    }
  },
  {
    id: "dark_warlock",
    name: "Bruxo Negro",
    icon: "💀",
    role: "Sombra / Dreno",
    description: "Usa maldições, sombras e magia proibida.",
    stats: {
      hp: 85,
      mana: 150,
      strength: 4,
      defense: 5,
      agility: 7,
      intelligence: 16,
      weight: 3,
      luck: 6,
      speed: 5
    }
  },
  {
    id: "paladin",
    name: "Paladino",
    icon: "🛡️",
    role: "Cura / Defesa",
    description: "Defensor sagrado com cura e proteção.",
    stats: {
      hp: 125,
      mana: 110,
      strength: 9,
      defense: 13,
      agility: 4,
      intelligence: 9,
      weight: 7,
      luck: 4,
      speed: 4
    }
  }
];

const ATTRIBUTE_LABELS = {
  strength: "Força",
  defense: "Defesa",
  agility: "Agilidade",
  intelligence: "Inteligência",
  weight: "Peso",
  luck: "Sorte",
  speed: "Velocidade"
};

const baseAttributes = {
  strength: 1,
  defense: 1,
  agility: 1,
  intelligence: 1,
  weight: 1,
  luck: 1,
  speed: 1
};

let attributes = { ...baseAttributes };
let pointsLeft = 20;
let selectedClass = PRIMARY_CLASSES[0];
let selectedSkill = null;
let currentUser = null;
let accountName = "Jogador";

const welcomeText = document.getElementById("welcomeText");
const classGrid = document.getElementById("classGrid");
const skillGrid = document.getElementById("skillGrid");
const attributesBox = document.getElementById("attributesBox");
const pointsLeftEl = document.getElementById("pointsLeft");
const previewBox = document.getElementById("previewBox");
const statusText = document.getElementById("statusText");
const characterNameInput = document.getElementById("characterName");

function status(msg) {
  statusText.textContent = msg;
}

function labelAttr(attr) {
  return ATTRIBUTE_LABELS[attr] || attr;
}

function getInitialSkillsForClass(classId) {
  return GAME_SKILLS.filter(skill =>
    skill.usableBy?.includes("hero") &&
    !skill.monsterOnly &&
    skill.classId === classId &&
    !skill.subclassId &&
    !skill.thirdClass &&
    (skill.minLevel || 1) <= 5
  );
}

function ensureSelectedSkill() {
  const skills = getInitialSkillsForClass(selectedClass.id);

  if (!skills.length) {
    selectedSkill = null;
    return;
  }

  if (!selectedSkill || selectedSkill.classId !== selectedClass.id) {
    selectedSkill = skills[0];
  }
}

function getFinalAttributes() {
  const classStats = selectedClass.stats;

  return {
    hp: classStats.hp + attributes.defense * 5 + attributes.strength * 2,
    mana: classStats.mana + attributes.intelligence * 5,

    strength: classStats.strength + attributes.strength,
    defense: classStats.defense + attributes.defense,
    agility: classStats.agility + attributes.agility,
    intelligence: classStats.intelligence + attributes.intelligence,

    weight: classStats.weight + attributes.weight,
    luck: classStats.luck + attributes.luck,
    speed: classStats.speed + attributes.speed,

    maxWeight: 30 + (classStats.weight + attributes.weight) * 5,
    criticalChance: 3 + (classStats.luck + attributes.luck),
    dodgeChance: 2 + Math.floor((classStats.speed + attributes.speed) / 2)
  };
}

function renderClasses() {
  classGrid.innerHTML = "";

  PRIMARY_CLASSES.forEach(cls => {
    const div = document.createElement("div");
    div.className = "option-card" + (selectedClass.id === cls.id ? " selected" : "");

    div.innerHTML = `
      <div class="icon">${cls.icon}</div>
      <strong>${cls.name}</strong>
      <small>${cls.role}</small>
      <small>${cls.description}</small>
    `;

    div.addEventListener("click", () => {
      selectedClass = cls;
      selectedSkill = null;
      ensureSelectedSkill();
      renderAll();
    });

    classGrid.appendChild(div);
  });
}

function renderSkills() {
  skillGrid.innerHTML = "";

  const skills = getInitialSkillsForClass(selectedClass.id);

  if (!skills.length) {
    skillGrid.innerHTML = "<p>Essa classe ainda não tem magia inicial.</p>";
    return;
  }

  skills.forEach(skill => {
    const div = document.createElement("div");
    div.className = "option-card" + (selectedSkill?.id === skill.id ? " selected" : "");

    div.innerHTML = `
      <div class="icon">${skill.icon || "✨"}</div>
      <strong>${skill.name}</strong>
      <small>Tipo: ${skill.type} | Mana: ${skill.manaCost || 0}</small>
      <small>${skill.description || ""}</small>
    `;

    div.addEventListener("click", () => {
      selectedSkill = skill;
      renderAll();
    });

    skillGrid.appendChild(div);
  });
}

function renderAttributes() {
  pointsLeftEl.textContent = pointsLeft;
  attributesBox.innerHTML = "";

  Object.keys(attributes).forEach(attr => {
    const row = document.createElement("div");
    row.className = "attribute-row";

    row.innerHTML = `
      <span>${labelAttr(attr)}</span>
      <button data-action="minus">-</button>
      <span>${attributes[attr]}</span>
      <button data-action="plus">+</button>
    `;

    row.querySelector('[data-action="minus"]').addEventListener("click", () => {
      if (attributes[attr] <= 1) return;
      attributes[attr]--;
      pointsLeft++;
      renderAll();
    });

    row.querySelector('[data-action="plus"]').addEventListener("click", () => {
      if (pointsLeft <= 0) return;
      attributes[attr]++;
      pointsLeft--;
      renderAll();
    });

    attributesBox.appendChild(row);
  });
}

function updatePreview() {
  const name = characterNameInput.value.trim() || "Sem nome";
  const stats = getFinalAttributes();

  previewBox.innerHTML = `
    <div class="preview-avatar">${selectedClass.icon}</div>
    <div class="preview-title">${name}</div>

    <p><strong>Classe:</strong> ${selectedClass.name}</p>
    <p><strong>Função:</strong> ${selectedClass.role}</p>
    <p><strong>Magia inicial:</strong> ${selectedSkill ? `${selectedSkill.icon} ${selectedSkill.name}` : "Nenhuma"}</p>

    <div class="divider"></div>

    <p><strong>HP:</strong> ${stats.hp}</p>
    <p><strong>Mana:</strong> ${stats.mana}</p>
    <p><strong>Força:</strong> ${stats.strength}</p>
    <p><strong>Defesa:</strong> ${stats.defense}</p>
    <p><strong>Agilidade:</strong> ${stats.agility}</p>
    <p><strong>Inteligência:</strong> ${stats.intelligence}</p>
    <p><strong>Peso:</strong> ${stats.weight}</p>
    <p><strong>Sorte:</strong> ${stats.luck}</p>
    <p><strong>Velocidade:</strong> ${stats.speed}</p>

    <div class="divider"></div>

    <p><strong>Peso máximo:</strong> ${stats.maxWeight}</p>
    <p><strong>Crítico:</strong> ${stats.criticalChance}%</p>
    <p><strong>Esquiva:</strong> ${stats.dodgeChance}%</p>
  `;
}

function renderAll() {
  ensureSelectedSkill();
  renderClasses();
  renderSkills();
  renderAttributes();
  updatePreview();
}

function createStarterLootFallback() {
  return [
    {
      id: "starter_small_bag",
      nome: "Bolsa Pequena",
      tipo: "mochila",
      tier: "T1",
      slotsBonus: 20,
      pesoMax: 50,
      peso: 1,
      valor: 50,
      stackavel: false,
      quantidade: 1,
      descricao: "Uma bolsa simples para novos aventureiros."
    },
    {
      id: "small_hp_potion",
      nome: "Poção Pequena de Vida",
      tipo: "pocao_hp",
      tier: "T1",
      cura: 50,
      peso: 0.2,
      valor: 25,
      stackavel: true,
      quantidade: 5,
      descricao: "Recupera uma pequena quantidade de vida."
    },
    {
      id: "small_mana_potion",
      nome: "Poção Pequena de Mana",
      tipo: "pocao_mn",
      tier: "T1",
      mana: 40,
      peso: 0.2,
      valor: 25,
      stackavel: true,
      quantidade: 5,
      descricao: "Recupera uma pequena quantidade de mana."
    }
  ];
}

function createNewCharacter() {
  const name = characterNameInput.value.trim();
  const stats = getFinalAttributes();
  const starterLoot = createStarterLootFallback();

  return {
    uid: currentUser.uid,
    accountName,

    characterName: name,
    name,

    classStage: 1,
    classId: selectedClass.id,
    className: selectedClass.name,
    classIcon: selectedClass.icon,
    classRole: selectedClass.role,

    subclassId: null,
    subclassName: null,
    thirdClass: null,

    baseAttributes: {
  strength: attributes.strength,
  defense: attributes.defense,
  agility: attributes.agility,
  intelligence: attributes.intelligence,
  weight: attributes.weight,
  luck: attributes.luck,
  speed: attributes.speed
},

finalAttributes: stats,

attributes: {
  fisico: stats.strength,
  defesa: stats.defense,
  agilidade: stats.agility,
  inteligencia: stats.intelligence,
  vitalidade: Math.floor(stats.hp / 10)
},

    level: 1,
    xp: 0,
    gold: 100,

    hp: stats.hp,
    maxHp: stats.hp,
    mana: stats.mana,
    maxMana: stats.mana,

    weight: stats.weight,
    maxWeight: stats.maxWeight,
    luck: stats.luck,
    speed: stats.speed,

    criticalChance: stats.criticalChance,
    dodgeChance: stats.dodgeChance,

    starterSkill: selectedSkill ? selectedSkill.id : null,
    skills: selectedSkill ? [selectedSkill.id] : [],

    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      cape: null,
      shield: null,
      ring: null,
      necklace: null
    },

    inventory: starterLoot,
    starterLootReceived: true,

    bankAccountOpened: false,
    bank: null,

    reputation: {},
    completedQuests: [],
    unlockedQuests: ["main_world_survive"],
    activeQuests: [],

    location: "Prólogo",
    currentMap: "world",

    globalTurn: 1,
    personalTurn: 0,
    status: "active",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  currentUser = user;

  const playerSnap = await getDoc(doc(db, "players", user.uid));

  if (playerSnap.exists()) {
    const data = playerSnap.data();
    accountName = data.accountName || data.name || "Jogador";
  }

  welcomeText.textContent = `Conta: ${accountName}`;
  characterNameInput.value = localStorage.getItem("characterName") || "";

  renderAll();
});

characterNameInput.addEventListener("input", () => {
  localStorage.setItem("characterName", characterNameInput.value);
  updatePreview();
});

document.getElementById("saveCharacterBtn").addEventListener("click", async () => {
  const name = characterNameInput.value.trim();

  if (!name) return status("Digite o nome do personagem.");
  if (pointsLeft > 0) return status(`Distribua todos os pontos. Restam ${pointsLeft}.`);
  if (!selectedClass) return status("Escolha uma classe.");
  if (!selectedSkill) return status("Escolha uma magia inicial.");
  if (!currentUser) return status("Usuário não carregado.");

  const character = createNewCharacter();

  try {
    await setDoc(
      doc(db, "players", currentUser.uid, "characters", "main"),
      character,
      { merge: true }
    );

    await setDoc(
      doc(db, "players", currentUser.uid),
      {
        currentCharacterName: name,
        currentClassName: character.className,
        currentClassId: character.classId,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    status("Personagem salvo!");
  } catch (error) {
    console.error(error);
    status("Erro ao salvar personagem.");
  }
});

document.getElementById("continueBtn").addEventListener("click", () => {
  window.location.href = "./world.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "./index.html";
});

document.getElementById("startCreationBtn").addEventListener("click", () => {
  document.getElementById("introScreen").style.display = "none";
});