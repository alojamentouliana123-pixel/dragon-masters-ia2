import { askAI } from "./openai.js";
import { generatePlayerStory } from "./ai-master.js";

import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "./firebase.js";

import {
  getRandomNPC,
  getRandomGold,
  getRandomItemByTier
} from "./database.js";

const currentLocation = document.getElementById("currentLocation");
const targetLocation = document.getElementById("targetLocation");
const locationEnvironment = document.getElementById("locationEnvironment");
const storyLog = document.getElementById("storyLog");
const playerCard = document.getElementById("playerCard");
const inventoryBox = document.getElementById("inventoryBox");
const diceResult = document.getElementById("diceResult");
const masterInput = document.getElementById("masterInput");
const sendMasterBtn = document.getElementById("sendMasterBtn");

let currentUser = null;
let character = null;
let playerPosition = "H35";
let currentEnemy = null;

let playerMemory = {
  resumoHistoria: "",
  locaisVisitados: [],
  ultimaAcao: ""
};

const environments = [
  "Uma névoa cobre a estrada antiga.",
  "O vento sopra entre árvores gigantes.",
  "Você escuta passos distantes.",
  "O cheiro de fumaça domina o ambiente.",
  "A floresta parece silenciosa demais.",
  "Algo observa você nas sombras.",
  "O céu escurece lentamente."
];

function addStory(type, text) {
  const div = document.createElement("div");
  div.className = `story-message ${type}`;
  div.innerHTML = text;
  storyLog.appendChild(div);
  storyLog.scrollTop = storyLog.scrollHeight;
}

function rollDice() {
  const result = Math.floor(Math.random() * 20) + 1;
  diceResult.textContent = result;
  return result;
}

function updateLocation(newPosition) {
  currentLocation.textContent = playerPosition;
  targetLocation.textContent = newPosition;

  locationEnvironment.textContent =
    environments[Math.floor(Math.random() * environments.length)];

  playerPosition = newPosition;
}

async function saveCharacterPatch(data) {
  await setDoc(
    doc(db, "players", currentUser.uid, "characters", "main"),
    data,
    { merge: true }
  );
}

function renderCharacter() {
  const attrs = character.finalAttributes || {};
  const inventory = character.inventory || [];

  const maxHp = character.maxHp || 30;
  const hp = character.hp ?? maxHp;

  const maxMana = character.maxMana || 20;
  const mana = character.mana ?? maxMana;

  playerCard.innerHTML = `
    <div style="font-size:60px;text-align:center;">${character.classIcon}</div>
    <h2 style="text-align:center;">${character.characterName}</h2>

    <p><strong>Classe:</strong> ${character.className}</p>
    <p><strong>Nível:</strong> ${character.level || 1}</p>
    <p><strong>XP:</strong> ${character.xp || 0}</p>
    <p><strong>Gold:</strong> ${character.gold || 0}</p>
    <p><strong>❤️ Vida:</strong> ${hp}/${maxHp}</p>
    <p><strong>🔮 Mana:</strong> ${mana}/${maxMana}</p>

    <hr>

    <p>💪 Força: ${attrs.forca || 1}</p>
    <p>🛡️ Defesa: ${attrs.defesa || 1}</p>
    <p>⚡ Agilidade: ${attrs.agilidade || 1}</p>
    <p>🧠 Inteligência: ${attrs.inteligencia || 1}</p>
    <p>🔮 Mana: ${attrs.mana || 1}</p>
    <p>✨ Carisma: ${attrs.carisma || 1}</p>

    <hr>

    <p><strong>📖 Habilidades:</strong></p>
    ${
      (character.spells || []).length
        ? character.spells.map(spell => `
          <p>🪄 ${spell.name} | Mana: ${spell.manaCost} | Dano: ${spell.damage}</p>
        `).join("")
        : "<p>Nenhuma habilidade encontrada. Salve de novo no lobby.</p>"
    }

    <p><strong>🌟 Subclasse:</strong> ${character.subclass || "Nenhuma"}</p>
  `;

  inventoryBox.innerHTML = `
    <p><strong>Item inicial:</strong></p>
    <p>${character.itemIcon} ${character.itemName}</p>

    <hr>

    <p><strong>🎒 Mochila:</strong></p>
    ${
      inventory.length
        ? inventory.map(item => `
          <div class="inventory-item">
            <strong>${item.nome}</strong><br>
            Tipo: ${item.tipo}<br>
            Tier: ${item.tier}<br>
            Valor: ${item.valor || 0} gold
          </div>
        `).join("")
        : "<p>Nenhum item extra ainda.</p>"
    }
  `;
}

async function loadMemory() {
  const ref = doc(db, "players", currentUser.uid, "memory", "main");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    playerMemory = snap.data();
  } else {
    await setDoc(ref, playerMemory);
  }
}

async function saveMemory(action, text) {
  playerMemory.ultimaAcao = action;

  if (!playerMemory.locaisVisitados.includes(playerPosition)) {
    playerMemory.locaisVisitados.push(playerPosition);
  }

  playerMemory.resumoHistoria += `
Local: ${playerPosition}
Ação: ${action}
Resultado: ${text}
`;

  if (playerMemory.resumoHistoria.length > 2500) {
    playerMemory.resumoHistoria = playerMemory.resumoHistoria.slice(-2500);
  }

  await setDoc(
    doc(db, "players", currentUser.uid, "memory", "main"),
    {
      ...playerMemory,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

function calculatePhysicalDamage(dice) {
  const força = character.finalAttributes?.forca || 1;
  return força + Math.floor(dice / 2);
}

function calculateMagicDamage(spell, dice) {
  const inteligencia = character.finalAttributes?.inteligencia || 1;
  return (spell.damage || 0) + inteligencia + Math.floor(dice / 3);
}

async function giveStarterReward() {
  if (character.starterRewardGiven) return;

  const gold = 500;
  const item1 = await getRandomItemByTier(["T1"]);
  const item2 = await getRandomItemByTier(["T1"]);
  const item3 = await getRandomItemByTier(["T1", "T2"]);

  character.gold = (character.gold || 0) + gold;
  character.inventory = [...(character.inventory || []), item1, item2, item3];
  character.starterRewardGiven = true;

  await saveCharacterPatch({
    gold: character.gold,
    inventory: character.inventory,
    starterRewardGiven: true
  });

  addStory("master", `
🎁 Presente inicial recebido!

💰 Gold: ${gold}

🎒 Itens:
- ${item1.nome}
- ${item2.nome}
- ${item3.nome}
`);
}

async function levelUpIfNeeded() {
  const neededXp = (character.level || 1) * 100;

  if ((character.xp || 0) < neededXp) return;

  character.xp -= neededXp;
  character.level = (character.level || 1) + 1;
  character.maxHp = (character.maxHp || 30) + 5;
  character.hp = character.maxHp;
  character.maxMana = (character.maxMana || 20) + 3;
  character.mana = character.maxMana;

  await saveCharacterPatch({
    xp: character.xp,
    level: character.level,
    hp: character.hp,
    maxHp: character.maxHp,
    mana: character.mana,
    maxMana: character.maxMana
  });

  addStory(
    "master",
    `🌟 ${character.characterName} subiu para o nível ${character.level}!`
  );
}

async function handleAttack() {
  const dice = rollDice();
  const damage = calculatePhysicalDamage(dice);

  if (!currentEnemy) {
    addStory("master", "⚠️ Não há inimigos para atacar.");
    return;
  }

  currentEnemy.hp -= damage;

  let resultText = `
⚔️ Você causou ${damage} de dano.
👹 HP do inimigo: ${Math.max(0, currentEnemy.hp)}
`;

  if (currentEnemy.hp <= 0) {
    const gold = getRandomGold(
      currentEnemy.goldMin || 1,
      currentEnemy.goldMax || 10
    );

    const loot = await getRandomItemByTier(
      currentEnemy.lootTiers || ["T1"]
    );

    character.gold = (character.gold || 0) + gold;
    character.xp = (character.xp || 0) + (currentEnemy.xp || 0);
    character.inventory = [...(character.inventory || []), loot];

    resultText += `
✅ ${currentEnemy.nome} foi derrotado!

⭐ XP recebido: ${currentEnemy.xp}
💰 Gold: ${gold}
🎒 Loot: ${loot.nome}
`;

    currentEnemy = null;

    await saveCharacterPatch({
      gold: character.gold,
      xp: character.xp,
      inventory: character.inventory
    });

    await levelUpIfNeeded();
    renderCharacter();
  } else {
    const enemyDamage = Math.max(
      1,
      (currentEnemy.atk || 1) - (character.finalAttributes?.defesa || 1)
    );

    character.hp = Math.max(
      0,
      (character.hp || character.maxHp || 30) - enemyDamage
    );

    resultText += `
💥 ${currentEnemy.nome} contra-atacou!
❤️ Dano recebido: ${enemyDamage}
❤️ Sua vida: ${character.hp}/${character.maxHp}
`;

    await saveCharacterPatch({
      hp: character.hp
    });

    renderCharacter();
  }

  addStory("master", resultText);

  const aiText = await askAI(`
Jogador: ${character.characterName}
Classe: ${character.className}
Resultado da batalha:
${resultText}

Narre curto e cinematográfico.
`);

  addStory("master", aiText);

  await saveMemory("attack", resultText + "\n" + aiText);
}

async function handleMagic() {
  const spell = (character.spells || [])[0];

  if (!spell) {
    addStory("master", "Você ainda não possui magias.");
    return;
  }

  if ((character.mana || 0) < spell.manaCost) {
    addStory("master", "Mana insuficiente.");
    return;
  }

  const dice = rollDice();
  const damage = calculateMagicDamage(spell, dice);

  character.mana -= spell.manaCost;

  await saveCharacterPatch({
    mana: character.mana
  });

  renderCharacter();

  addStory(
    "player",
    `🪄 ${character.characterName} usou ${spell.name}.`
  );

  const aiText = await askAI(`
Jogador: ${character.characterName}
Classe: ${character.className}
Magia usada: ${spell.name}
Dano calculado: ${damage}
Dado: ${dice}
Mana restante: ${character.mana}

Narre curto e cinematográfico.
`);

  addStory("master", aiText);

  await saveMemory(`usou magia ${spell.name}`, aiText);
}

async function handleNormalAction(action) {
  const dice = rollDice();

  if (action === "move") {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const number = Math.floor(Math.random() * 99) + 1;
    updateLocation(`${letter}${number}`);
  }

  let extra = "";

  if (action === "observe" && dice >= 10) {
    const npc = await getRandomNPC();

    extra = `
NPC encontrado:
${npc.nome}
Tipo: ${npc.tipo}
Local: ${npc.local}
Nível: ${npc.nivel}
`;
  }

  addStory(
    "player",
    `🎮 ${character.characterName} escolheu: ${action}`
  );

  const aiText = await askAI(`
Jogador: ${character.characterName}
Classe: ${character.className}
Localização: ${playerPosition}
Ação: ${action}
Dado: ${dice}

Vida: ${character.hp}/${character.maxHp}
Mana: ${character.mana}/${character.maxMana}

Inimigo atual:
${currentEnemy ? `${currentEnemy.nome} HP ${currentEnemy.hp}` : "Nenhum"}

${extra}

Memória:
${playerMemory.resumoHistoria || "Sem memória ainda."}

Responda como mestre de RPG.
Se achar coerente com a cena, você pode narrar que um monstro apareceu.
Mas se um monstro aparecer, escreva claramente:
MONSTRO_APARECEU: nome do monstro
`);

  addStory("master", aiText);

  await saveMemory(action, aiText);
}

if (!user) {
  console.log("SEM LOGIN — MODO TESTE");
  
  currentUser = {
    uid: "modo-teste"
  };

  character = {
    characterName: "Herói Teste",
    className: "Guerreiro",
    classIcon: "⚔️",
    level: 1,
    xp: 0,
    gold: 100,
    hp: 30,
    maxHp: 30,
    mana: 20,
    maxMana: 20,

    finalAttributes: {
      forca: 5,
      defesa: 5,
      agilidade: 5,
      inteligencia: 5,
      mana: 5,
      carisma: 5
    },

    inventory: [],
    spells: []
  };

  renderCharacter();
  addStory("master", "Modo teste ativado.");
  
  return;
}

  currentUser = user;

  const snap = await getDoc(
    doc(db, "players", user.uid, "characters", "main")
  );

  if (!snap.exists()) {
    alert("Crie um personagem primeiro.");
    window.location.href = "./lobby.html";
    return;
  }

  character = snap.data();

  await giveStarterReward();
  renderCharacter();
  await loadMemory();

  addStory("master", generatePlayerStory(character));


document.querySelectorAll(".action-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!character || !currentUser) return;

    const action = btn.dataset.action;

    if (action === "attack") {
      addStory("player", `⚔️ ${character.characterName} tentou atacar.`);
      await handleAttack();
      return;
    }

    if (action === "magic") {
      await handleMagic();
      return;
    }

    await handleNormalAction(action);
  });
});

sendMasterBtn.addEventListener("click", async () => {
  if (!character || !currentUser) return;

  const text = masterInput.value.trim();
  if (!text) return;

  masterInput.value = "";

  addStory("player", `💬 ${character.characterName}: ${text}`);

  const aiText = await askAI(`
Jogador: ${character.characterName}
Classe: ${character.className}
Localização: ${playerPosition}

Vida: ${character.hp}/${character.maxHp}
Mana: ${character.mana}/${character.maxMana}

Inimigo atual:
${currentEnemy ? `${currentEnemy.nome} HP ${currentEnemy.hp}` : "Nenhum"}

Pergunta do jogador:
${text}

Memória:
${playerMemory.resumoHistoria || "Sem memória ainda."}

Responda como mestre de RPG.
`);

  addStory("master", aiText);

  await saveMemory(`falou com mestre: ${text}`, aiText);
});