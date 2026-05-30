import { askAI } from "./openai.js";
import { GameBrain } from "./game-brain.js";
import GlobalUI from "./global-ui.js";

const storyText = document.getElementById("storyText");
const playerInput = document.getElementById("playerInput");
const sendBtn = document.getElementById("sendBtn");

let character = null;
let isTyping = false;

const prologueState = {
  location: "Pântano Sombrio",

  scene: `
Você desperta sozinho
em um pântano escuro.

A CHUVA cai lentamente.

O cheiro de lama
e podridão invade o ar.

Algo observa você
na escuridão.
`
};

async function typeText(text) {
  if (!storyText || isTyping) return;

  isTyping = true;
  storyText.innerHTML = "";

  const safeText = String(text || "");
  let currentText = "";
  let i = 0;

  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (i < safeText.length) {
        currentText += safeText[i];
        storyText.innerHTML = currentText.replace(/\n/g, "<br>");
        i++;
      } else {
        clearInterval(interval);
        isTyping = false;
        resolve();
      }
    }, 18);
  });
}

function detectEffects(text) {
  const upper = String(text || "").toUpperCase();
  const layer = document.getElementById("cinematicLayer");

  if (!layer) return;

  if (upper.includes("CHUVA")) {
    layer.className = "fx-prologue fx-rain";
  } else if (upper.includes("NÉVOA") || upper.includes("NEVOA")) {
    layer.className = "fx-prologue fx-fog";
  } else if (upper.includes("FOGO") || upper.includes("CHAMAS")) {
    layer.className = "fx-prologue fx-fire";
  } else if (upper.includes("ESCURIDÃO") || upper.includes("ESCURO")) {
    layer.className = "fx-prologue fx-darkness";
  } else {
    layer.className = "";
  }
}

function getCurrentMonster() {
  const encounter = GameBrain?.encontroAtivo;

  return (
    encounter?.monsters?.find(m => (m.hp || 0) > 0) || null
  );
}

function syncMonsterUI() {
  GlobalUI.setMonster(getCurrentMonster() || null);
}

function updateActionButtons() {
  if (GameBrain.estadoAtual === "MORTO") {
    GlobalUI.setActionButtons([
      {
        action: "reviver",
        icon: "🔥",
        label: "Reviver"
      }
    ]);
    return;
  }

  if (GameBrain.estadoAtual === "DESCANSANDO") {
    GlobalUI.setActionButtons([
      {
        action: "levantar",
        icon: "🧍",
        label: "Levantar"
      }
    ]);
    return;
  }

  const inCombat = !!getCurrentMonster();

  if (inCombat) {
    GlobalUI.setActionButtons([
      {
        action: "atacar",
        icon: "⚔️",
        label: "Atacar"
      },
      {
        action: "esquivar",
        icon: "🛡️",
        label: "Esquivar"
      },
      {
        action: "fugir",
        icon: "🏃",
        label: "Fugir"
      },
      {
        action: "quick-hp",
        icon: "❤️",
        label: "HP"
      },
      {
        action: "quick-mana",
        icon: "🔮",
        label: "Mana"
      }
    ]);
    return;
  }

  GlobalUI.setActionButtons([
    {
      action: "andar",
      icon: "🚶",
      label: "Andar"
    },
    {
      action: "explorar",
      icon: "🔎",
      label: "Explorar"
    },
    {
      action: "acampar",
      icon: "⛺",
      label: "Acampar"
    },
    {
      action: "quick-hp",
      icon: "❤️",
      label: "HP"
    },
    {
      action: "quick-mana",
      icon: "🔮",
      label: "Mana"
    }
  ]);
}

async function processGameAction(actionData) {
  if (!GameBrain?.processarAcaoMecanica) {
    console.warn("GameBrain não encontrado.");
    return;
  }

  await GameBrain.processarAcaoMecanica(actionData);

  character = GlobalUI.getCharacter();

  syncMonsterUI();
  updateActionButtons();
}

window.addEventListener("eldrakar:global-action", async event => {
  const detail = event.detail || {};
const { action, skill } = detail;

  try {
 if (action === "atacar" || action === "attack-normal") {
  await processGameAction({ type: "attack" });
}

if (action === "skill") {
  await processGameAction({
    type: "skill",
    skill
  });
}

    if (action === "esquivar") {
      await processGameAction({ type: "dodge" });
    }

    if (action === "fugir") {
      await processGameAction({ type: "flee" });
    }

    if (action === "andar") {
      await processGameAction({ type: "andar" });
    }

    if (action === "explorar") {
      await processGameAction({ type: "explorar" });
    }

    if (action === "acampar") {
      await processGameAction({ type: "acampar" });
    }

    if (action === "levantar") {
      await processGameAction({ type: "levantar" });
    }

    if (action === "reviver") {
      await processGameAction({ type: "reviver" });
    }
  } catch (error) {
    console.error(error);
    await typeText("⚠️ Algo falhou.");
  }
});

async function sendAction() {
  if (!playerInput || !sendBtn) return;

  const query = playerInput.value.trim();

  if (!query || isTyping) return;

  playerInput.value = "";
  sendBtn.disabled = true;
  playerInput.disabled = true;

  await typeText("Pensando...");

  const prompt = `
Você é o Mestre do RPG Eldrakar.

Local:
${prologueState.location}

Cena:
${prologueState.scene}

Pergunta:
"${query}"

Responda sem alterar estado mecânico.
`;

  try {
    const response = await askAI(prompt);

    detectEffects(response);

    await typeText(response);
  } catch (error) {
    console.error(error);

    await typeText("⚠️ Erro na IA.");
  }

  sendBtn.disabled = false;
  playerInput.disabled = false;
  playerInput.focus();
}

sendBtn?.addEventListener("click", sendAction);

playerInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendAction();
  }
});

async function startGame() {
  character = await GlobalUI.init();

  if (!character) return;

  await typeText(prologueState.scene);

  detectEffects(prologueState.scene);

  GameBrain.init(character, {
    onNarrativaGerada: async texto => {
      detectEffects(texto);

      await typeText(texto);

      syncMonsterUI();
      updateActionButtons();
    },

    onStatusUpdate: async charAtualizado => {
      character = charAtualizado;

      GlobalUI.setCharacter(character);

      syncMonsterUI();
      updateActionButtons();

      await GlobalUI.saveCharacter();
    }
  });

  GlobalUI.setCharacter(character);

  syncMonsterUI();
  updateActionButtons();
}

startGame();