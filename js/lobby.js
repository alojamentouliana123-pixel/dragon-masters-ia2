import {
  auth, db,
  onAuthStateChanged, signOut,
  doc, setDoc, getDoc, serverTimestamp
} from "./firebase.js";

const classes = [
  {
    id: "warrior",
    name: "Guerreiro Dracônico",
    icon: "⚔️",
    desc: "Forte, resistente e bom na linha de frente.",
    bonus: { forca: 2, defesa: 1 }
  },
  {
    id: "mage",
    name: "Mago Rúnico",
    icon: "🔮",
    desc: "Usa magia, runas antigas e poder elemental.",
    bonus: { inteligencia: 2, mana: 1 }
  },
  {
    id: "ranger",
    name: "Arqueiro",
    icon: "🏹",
    desc: "Ataca de longe, tem agilidade e precisão.",
    bonus: { agilidade: 2, forca: 1 }
  },
  {
    id: "tamer",
    name: "Domador de Dragões",
    icon: "🐉",
    desc: "Cria ligação forte com dragões e criaturas.",
    bonus: { carisma: 2, inteligencia: 1 }
  },
  {
    id: "bruxo negro",
    name: "bruxo negro ",
    icon: "💀",
    desc: "Controla sombras, magia proibida.",
    bonus: { inteligencia: 2, mana: 1 }
  },
  {
    id: "paladin",
    name: "Paladino",
    icon: "🛡️",
    desc: "Defensor sagrado com cura e proteção.",
    bonus: { defesa: 2, carisma: 1 }
  }
];
const classSpells = {

  warrior: [
    {
      id: "power_slash",
      name: "Golpe Poderoso",
      manaCost: 0,
      damage: 8
    },
    {
      id: "iron_guard",
      name: "Guarda de Ferro",
      manaCost: 0,
      damage: 0
    }
  ],

  mage: [
    {
      id: "arcane_bolt",
      name: "Raio Arcano",
      manaCost: 5,
      damage: 10
    },
    {
      id: "magic_barrier",
      name: "Barreira Mágica",
      manaCost: 4,
      damage: 0
    }
  ],

  ranger: [
    {
      id: "precise_shot",
      name: "Tiro Preciso",
      manaCost: 0,
      damage: 9
    },
    {
      id: "hunter_mark",
      name: "Marca do Caçador",
      manaCost: 2,
      damage: 0
    }
  ],

  tamer: [
    {
      id: "beast_call",
      name: "Chamado da Fera",
      manaCost: 5,
      damage: 6
    },
    {
      id: "dragon_bond",
      name: "Vínculo Dracônico",
      manaCost: 4,
      damage: 0
    }
  ],

  "bruxo negro": [
    {
      id: "shadow_bolt",
      name: "Rajada Sombria",
      manaCost: 5,
      damage: 10
    },
    {
      id: "fear_mark",
      name: "Marca do Medo",
      manaCost: 4,
      damage: 3
    }
  ],

  paladin: [
    {
      id: "holy_strike",
      name: "Golpe Sagrado",
      manaCost: 4,
      damage: 9
    },
    {
      id: "minor_heal",
      name: "Cura Menor",
      manaCost: 5,
      damage: 0
    }
  ]
};
const items = [
  { id: "sword", name: "Espada de Ferro", icon: "🗡️", desc: "+2 Força no início" },
  { id: "staff", name: "Cajado Rúnico", icon: "🪄", desc: "+2 Mana no início" },
  { id: "bow", name: "Arco de Caçador", icon: "🏹", desc: "+2 Agilidade no início" },
  { id: "egg", name: "Ovo Misterioso", icon: "🥚", desc: "Pode chocar um dragão raro" },
  { id: "potion", name: "Poção Grande", icon: "🧪", desc: "Cura emergencial" },
  { id: "shield", name: "Escudo Antigo", icon: "🛡️", desc: "+2 Defesa no início" }
];

const attributes = {
  forca: 1,
  defesa: 1,
  agilidade: 1,
  inteligencia: 1,
  mana: 1,
  carisma: 1
};

let pointsLeft = 10;
let selectedClass = classes[0];
let selectedItem = items[0];
let currentUser = null;
let accountName = "Jogador";

const welcomeText = document.getElementById("welcomeText");
const classGrid = document.getElementById("classGrid");
const itemGrid = document.getElementById("itemGrid");
const attributesBox = document.getElementById("attributesBox");
const pointsLeftEl = document.getElementById("pointsLeft");
const previewBox = document.getElementById("previewBox");
const statusText = document.getElementById("statusText");
const characterNameInput = document.getElementById("characterName");

function status(msg){ statusText.textContent = msg; }

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  currentUser = user;
  const snap = await getDoc(doc(db, "players", user.uid));
  if (snap.exists()) accountName = snap.data().accountName || snap.data().name || "Jogador";

  welcomeText.textContent = `Conta: ${accountName}`;
  characterNameInput.value = localStorage.getItem("characterName") || "";
  renderAll();
});

function renderAll() {
  renderClasses();
  renderItems();
  renderAttributes();
  updatePreview();
}

function renderClasses() {
  classGrid.innerHTML = "";
  classes.forEach(cls => {
    const div = document.createElement("div");
    div.className = "option-card" + (selectedClass.id === cls.id ? " selected" : "");
    div.innerHTML = `
      <div class="icon">${cls.icon}</div>
      <strong>${cls.name}</strong>
      <small>${cls.desc}</small>
    `;
    div.addEventListener("click", () => {
      selectedClass = cls;
      renderAll();
    });
    classGrid.appendChild(div);
  });
}

function renderItems() {
  itemGrid.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "option-card" + (selectedItem.id === item.id ? " selected" : "");
    div.innerHTML = `
      <div class="icon">${item.icon}</div>
      <strong>${item.name}</strong>
      <small>${item.desc}</small>
    `;
    div.addEventListener("click", () => {
      selectedItem = item;
      renderAll();
    });
    itemGrid.appendChild(div);
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

function labelAttr(attr) {
  const labels = {
    forca: "Força",
    defesa: "Defesa",
    agilidade: "Agilidade",
    inteligencia: "Inteligência",
    mana: "Mana",
    carisma: "Carisma"
  };
  return labels[attr] || attr;
}

function getFinalAttributes() {
  const finalAttrs = { ...attributes };
  Object.entries(selectedClass.bonus).forEach(([key, value]) => {
    finalAttrs[key] = (finalAttrs[key] || 0) + value;
  });
  return finalAttrs;
}

function updatePreview() {
  const name = characterNameInput.value.trim() || "Sem nome";
  const finalAttrs = getFinalAttributes();

  previewBox.innerHTML = `
    <div class="preview-avatar">${selectedClass.icon}</div>
    <div class="preview-title">${name}</div>
    <p><strong>Classe:</strong> ${selectedClass.name}</p>
    <p><strong>Item inicial:</strong> ${selectedItem.icon} ${selectedItem.name}</p>
    <p><strong>Conta:</strong> ${accountName}</p>
    <div class="divider"></div>
    <p><strong>Força:</strong> ${finalAttrs.forca}</p>
    <p><strong>Defesa:</strong> ${finalAttrs.defesa}</p>
    <p><strong>Agilidade:</strong> ${finalAttrs.agilidade}</p>
    <p><strong>Inteligência:</strong> ${finalAttrs.inteligencia}</p>
    <p><strong>Mana:</strong> ${finalAttrs.mana}</p>
    <p><strong>Carisma:</strong> ${finalAttrs.carisma}</p>
  `;
}

characterNameInput.addEventListener("input", () => {
  localStorage.setItem("characterName", characterNameInput.value);
  updatePreview();
});

document.getElementById("saveCharacterBtn").addEventListener("click", async () => {
  const name = characterNameInput.value.trim();
  if (!name) return status("Digite o nome do personagem.");
  if (pointsLeft > 0) return status(`Distribua todos os pontos. Restam ${pointsLeft}.`);
  if (!currentUser) return status("Usuário não carregado.");

  const character = {
    
    uid: currentUser.uid,
    accountName,
    characterName: name,
    classId: selectedClass.id,
    className: selectedClass.name,
    classIcon: selectedClass.icon,
    itemId: selectedItem.id,
    itemName: selectedItem.name,
    itemIcon: selectedItem.icon,
    baseAttributes: attributes,
    finalAttributes: getFinalAttributes(),
    level: 1,
    xp: 0,
    gold: 100,
  hp: 20 + finalAttrs.defesa * 5,
maxHp: 20 + finalAttrs.defesa * 5,

mana: 10 + finalAttrs.mana * 5,
maxMana: 10 + finalAttrs.mana * 5,

spells: classSpells[selectedClass.id] || [],

subclass: null,
subclassSpells: [],
  };

  await setDoc(doc(db, "players", currentUser.uid, "characters", "main"), character, { merge: true });
  await setDoc(doc(db, "players", currentUser.uid), {
    currentCharacterName: name,
    currentClassName: selectedClass.name,
    updatedAt: serverTimestamp()
  }, { merge: true });

  status("Personagem salvo no Firebase!");
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