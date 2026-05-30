import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc
} from "./firebase.js";
import {
  createDefaultCharacter,
  normalizeHpMana
} from "./game-brain/character-engine.js";

import {
  getSkillById
} from "./regras/skills.js";

import { getItemVisual }
from "./item-icons.js";

export const GlobalUI = {
  currentUser: null,
  character: null,
  monster: null,
  actionButtons: [],

  rewardSeconds: 300,

rewardStages: [
  {
    tempo: 300,
    nome: "25 Gold",
    recompensa: "gold",
    valor: 25
  },
  {
    tempo: 600,
    nome: "Poção HP T1",
    recompensa: "hp1"
  },
  {
    tempo: 1200,
    nome: "Poção Mana T1",
    recompensa: "mana1"
  },
  {
    tempo: 2400,
    nome: "50 Gold",
    recompensa: "gold",
    valor: 50
  },
  {
    tempo: 3600,
    nome: "Poção HP T2",
    recompensa: "hp2"
  },
  {
    tempo: 7200,
    nome: "Poção Mana T2",
    recompensa: "mana2"
  }
],
  rewardInterval: null,
  initialized: false,

  defaultCharacter: {
    characterName: "Jogador",
    className: "Sem classe",
    level: 1,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    gold: 0,
    xp: 0,
    inventory: [],
    skills: []
  },

  async init(options = {}) {
    if (this.initialized) return this.character;

    this.injectHTML();
    this.bindEvents();
    this.startRewardTimer();

    this.initialized = true;

    if (options.autoLoad !== false) {
      await this.waitAuthAndLoadCharacter();
    } else {
      this.setCharacter(this.defaultCharacter);
    }

    return this.character;
  },

  injectHTML() {
    if (document.getElementById("eld-global-ui")) return;

    const root = document.createElement("div");
    root.id = "eld-global-ui";

    root.innerHTML = `
      <header class="eld-top-hud">
        <div class="eld-player-card">
          <strong id="eldPlayerName">Jogador</strong>
          <span id="eldPlayerClass">Sem classe • Nível 1</span>
        </div>

        <div class="eld-bars">
          <div class="eld-bar-line">
            <small>HP</small>
            <div class="eld-bar-bg">
              <div id="eldHpFill" class="eld-hp-fill"></div>
            </div>
            <b id="eldHpText">100/100</b>
          </div>

          <div class="eld-bar-line">
            <small>Mana</small>
            <div class="eld-bar-bg">
              <div id="eldManaFill" class="eld-mana-fill"></div>
            </div>
            <b id="eldManaText">50/50</b>
          </div>

          <div class="eld-bar-line eld-xp-line">
            <small>XP</small>
            <div class="eld-bar-bg">
              <div id="eldXpFill" class="eld-xp-fill"></div>
            </div>
            <b id="eldXpText">0/100</b>
          </div>
        </div>
        <div class="eld-stats-mini">
  <span>💰 <b id="eldGoldText">0</b></span>
  <span>💪 Físico: <b id="eldFisicoText">0</b></span>
  <span>🛡️ Defesa: <b id="eldDefesaText">0</b></span>
  <span>🏃 Agilidade: <b id="eldAgilidadeText">0</b></span>
  <span>🧠 Int: <b id="eldInteligenciaText">0</b></span>
  <span>❤️ Vit: <b id="eldVitalidadeText">0</b></span>
</div>

       <div class="eld-hud-actions">
  <button id="eldMarketBtn" class="eld-market-btn">🛒</button>
  <button id="eldMenuBtn" class="eld-menu-btn">☰</button>
</div>
      </header>

      <aside id="eldQuickPanel" class="eld-quick-panel">
        <button data-panel="attributes">📊 Atributos</button>
        <button data-panel="bag">🎒 Bolsa</button>
        <button data-panel="skills">⚔️ Skills</button>
        <button data-panel="monster">👹 Monstro</button>
        <button data-panel="reward">🎁 Brindes</button>
        <button data-panel="events">📢 Eventos</button>
        <button data-panel="chat">🌐 Chat</button>
      </aside>

      <section id="eldDrawer" class="eld-drawer hidden">
        <div class="eld-drawer-head">
          <strong id="eldDrawerTitle">Painel</strong>
          <button id="eldCloseDrawer">✕</button>
        </div>
        <div id="eldDrawerContent" class="eld-drawer-content"></div>
      </section>

      <section id="eldMonsterBox" class="eld-monster-box hidden">
        <strong id="eldMonsterBoxName">Monstro</strong>
        <small id="eldMonsterBoxInfo">Lv 1 • T1</small>

        <div class="eld-bar-bg">
          <div id="eldMonsterBoxHpFill" class="eld-hp-fill"></div>
        </div>

        <span id="eldMonsterBoxHpText">0/0</span>
      </section>

      <footer id="eldActionBar" class="eld-action-bar"></footer>

      <div id="eldToastBox" class="eld-toast-box"></div>
    `;

    document.body.appendChild(root);
  },

  bindEvents() {
    document.querySelectorAll("#eldQuickPanel button").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openPanel(btn.dataset.panel);
      });
    });

    document.getElementById("eldCloseDrawer")?.addEventListener("click", () => {
      this.closePanel();
    });

document.getElementById("eldMenuBtn")?.addEventListener("click", () => {

  const panel =
    document.getElementById("eldQuickPanel");

  if (!panel) return;

  panel.classList.toggle("eld-quick-hidden");

});


document.getElementById("eldMarketBtn")?.addEventListener("click", () => {
  this.openPanel("market");
});
  },

  

  emitAction(action, payload = {}) {
  window.dispatchEvent(
    new CustomEvent("eldrakar:global-action", {
      detail: {
        action,
        type: action,
        ...payload
      }
    })
  );
},
  getEquippedSkills() {
  const equipped = this.character?.skillBook?.equipped || [];

  return equipped
    .map(id => getSkillById(id))
    .filter(Boolean);
},

 setActionButtons(buttons = []) {
  this.actionButtons = buttons;
  this.renderActionBar();
},

renderActionBar() {
  const bar = document.getElementById("eldActionBar");
  if (!bar) return;

  const buttons = this.actionButtons || [];

  bar.innerHTML = buttons.map(btn => `
    <button data-action="${this.escapeHTML(btn.action)}">
      <span>${btn.icon || "✨"}</span>
      <small>${this.escapeHTML(btn.label || btn.action)}</small>
    </button>
  `).join("");

  bar.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;

      if (action === "quick-hp") {
        await this.useQuickPotion("hp");
        return;
      }

      if (action === "quick-mana") {
        await this.useQuickPotion("mana");
        return;
      }

      if (action === "atacar") {
        this.openAttackMenu();
        return;
      }

      this.emitAction(action);
    });
  });
},

openAttackMenu() {
  const old = document.getElementById("eldAttackMenu");
  if (old) old.remove();

  const equippedSkills = this.getEquippedSkills();

  const menu = document.createElement("div");
  menu.id = "eldAttackMenu";

  menu.style.position = "fixed";
  menu.style.left = "50%";
  menu.style.bottom = "90px";
  menu.style.transform = "translateX(-50%)";
  menu.style.zIndex = "99999";
  menu.style.background = "#111";
  menu.style.border = "2px solid #c89b3c";
  menu.style.borderRadius = "12px";
  menu.style.padding = "12px";
  menu.style.minWidth = "260px";
  menu.style.boxShadow = "0 0 20px #000";

  menu.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <strong>⚔️ Escolha o ataque</strong>
      <button id="eldCloseAttackMenu">✕</button>
    </div>

    <button data-normal-attack="1" style="width:100%;margin-bottom:8px;">
      ⚔️ Ataque Normal
    </button>

    ${
      equippedSkills.length
        ? equippedSkills.map(skill => `
          <button data-attack-skill="${this.escapeHTML(skill.id)}" style="width:100%;margin-bottom:8px;">
            ${skill.icon || "✨"} ${this.escapeHTML(skill.name || skill.id)}
          </button>
        `).join("")
        : `<p style="font-size:12px;opacity:.8;">Nenhuma skill equipada.</p>`
    }
  `;

  document.body.appendChild(menu);

  document.getElementById("eldCloseAttackMenu")?.addEventListener("click", () => {
    menu.remove();
  });

  menu.querySelector("[data-normal-attack]")?.addEventListener("click", () => {
    menu.remove();
    this.emitAction("attack-normal");
  });

  menu.querySelectorAll("[data-attack-skill]").forEach(btn => {
    btn.addEventListener("click", () => {
      const skill = getSkillById(btn.dataset.attackSkill);

      if (!skill) {
        this.toast("Skill não encontrada.");
        return;
      }

      menu.remove();
      this.emitAction("skill", { skill });
    });
  });
},

  async useQuickPotion(type) {
  if (!this.character) return;

  const inv = this.character.inventory || [];

  const quickId = this.character.quickItems?.[type];

  let index = inv.findIndex(item => item.id === quickId);

  if (index === -1) {
    index = inv.findIndex(item => {
      const nome = String(item.nome || item.name || "").toLowerCase();
      const tipo = String(item.tipo || item.type || "").toLowerCase();

      if (type === "hp") {
        return (
          tipo.includes("pocao_hp") ||
          tipo.includes("hp") ||
          tipo.includes("vida") ||
          tipo.includes("comida") ||
          tipo.includes("fruta") ||
          nome.includes("vida") ||
          nome.includes("hp")
        );
      }

      if (type === "mana") {
        return (
          tipo.includes("pocao_mn") ||
          tipo.includes("pocao_mana") ||
          tipo.includes("mana") ||
          tipo.includes("mn") ||
          tipo.includes("erva") ||
          nome.includes("mana")
        );
      }

      return false;
    });
  }

  if (index === -1) {
    this.toast(type === "hp" ? "Sem atalho/poção de HP." : "Sem atalho/poção de Mana.");
    return;
  }

  await this.useItem(index);
},

  async waitAuthAndLoadCharacter() {
    return new Promise(resolve => {
      onAuthStateChanged(auth, async user => {
        if (!user) {
          window.location.href = "./index.html";
          resolve(null);
          return;
        }

        this.currentUser = user;
        await this.loadCharacter();
        resolve(this.character);
      });
    });
  },

  async loadCharacter() {
    if (!this.currentUser) return null;

    const ref = doc(db, "players", this.currentUser.uid, "characters", "main");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      window.location.href = "./lobby.html";
      return null;
    }

    this.setCharacter(this.normalizeCharacter(snap.data()));
    return this.character;
  },

  async saveCharacter() {
    if (!this.currentUser || !this.character) return;

    const ref = doc(db, "players", this.currentUser.uid, "characters", "main");
    await setDoc(ref, this.character, { merge: true });
  },
normalizeCharacter(data = {}) {
  const character = createDefaultCharacter(data);
  normalizeHpMana(character);

  character.quickItems = character.quickItems || {
    hp: null,
    mana: null
  };

  character.skillBook = character.skillBook || {};
  character.skillBook.learned = character.skillBook.learned || [];
  character.skillBook.equipped = character.skillBook.equipped || [];

  if (Array.isArray(character.skills)) {
    character.skills.forEach(skill => {
      const id = typeof skill === "string" ? skill : skill?.id;

      if (id && !character.skillBook.learned.includes(id)) {
        character.skillBook.learned.push(id);
      }
    });
  }

  return character;
},

  setCharacter(character) {
    this.character = this.normalizeCharacter(character);
    this.updateAll();
    return this.character;
  },

  getCharacter() {
    return this.character;
  },

  updateAll() {
    this.updateHUD();
    this.refreshOpenPanel();
  },

  getXpLimit(level = this.character?.level || 1) {
    return Math.floor(
      100 +
      (level - 1) * 75 +
      Math.pow(level - 1, 2) * 25
    );
  },

  applyXp(amount = 0) {
    if (!this.character) return false;

    this.character.level = this.character.level || 1;
    this.character.xp = (this.character.xp || 0) + amount;

    let leveledUp = false;

    while (this.character.xp >= this.getXpLimit(this.character.level)) {
      this.character.xp -= this.getXpLimit(this.character.level);
      this.character.level += 1;
      this.character.maxHp += 10;
      this.character.maxMana += 5;

      this.character.attributePoints =
  (this.character.attributePoints || 0) + 1;

      this.character.hp = this.character.maxHp;
      this.character.mana = this.character.maxMana;
      leveledUp = true;
    }

    this.updateAll();
    return leveledUp;
  },

  updateHUD() {
    if (!this.character) return;

    const c = this.character;
    const xpLimit = this.getXpLimit(c.level);

    this.setText("eldPlayerName", c.characterName || "Jogador");
    this.setText("eldPlayerClass", `${c.className || "Sem classe"} • Nível ${c.level || 1}`);
    this.setText("eldHpText", `${c.hp || 0}/${c.maxHp || 1}`);
    this.setText("eldManaText", `${c.mana || 0}/${c.maxMana || 1}`);
    this.setText("eldXpText", `${c.xp || 0}/${xpLimit}`);

    this.setWidth("eldHpFill", this.percent(c.hp, c.maxHp));
    this.setWidth("eldManaFill", this.percent(c.mana, c.maxMana));
    this.setWidth("eldXpFill", this.percent(c.xp, xpLimit));

    const a = c.attributes || {};

this.setText("eldGoldText", c.gold || 0);
this.setText("eldFisicoText", a.fisico || 0);
this.setText("eldDefesaText", a.defesa || 0);
this.setText("eldAgilidadeText", a.agilidade || 0);
this.setText("eldInteligenciaText", a.inteligencia || 0);
this.setText("eldVitalidadeText", a.vitalidade || 0);
  },

  setMonster(monster = null) {
    this.monster = monster;

    const box = document.getElementById("eldMonsterBox");

    if (!monster) {
      box?.classList.add("hidden");
      this.refreshOpenPanel();
      return;
    }

    const hp = monster.hp || 0;
    const maxHp = monster.maxHp || monster.vidaMax || monster.vida || hp || 1;
    const pct = this.percent(hp, maxHp);

    const name = monster.nome || monster.name || "Criatura";
    const level = monster.nivel || monster.level || 1;
    const tier = monster.tier || "T1";
    const race = monster.race || monster.tipo || "criatura";

    box?.classList.remove("hidden");

    this.setText("eldMonsterBoxName", name);
    this.setText("eldMonsterBoxInfo", `Lv ${level} • ${tier} • ${race}`);
    this.setText("eldMonsterBoxHpText", `${hp}/${maxHp}`);
    this.setWidth("eldMonsterBoxHpFill", pct);

    this.refreshOpenPanel();
  },

  openPanel(type) {
  const drawer = document.getElementById("eldDrawer");
  const title = document.getElementById("eldDrawerTitle");
  const content = document.getElementById("eldDrawerContent");

  if (!drawer || !title || !content) return;

  drawer.dataset.panel = type;
  drawer.classList.remove("hidden");

  if (type === "market") {
  title.textContent = "🛒 Mercado";
  content.innerHTML = this.renderMarketHTML();

  this.bindMarketButtons();

  return;

  }

   if (type === "attributes") {

  title.textContent = "📊 Atributos";

  content.innerHTML =
    this.renderAttributesHTML();

  this.bindAttributeButtons();

}

    if (type === "bag") {
      title.textContent = "🎒 Bolsa";
      content.innerHTML = this.renderInventoryHTML();
      this.bindInventoryButtons();
    }

    if (type === "skills") {
      title.textContent = "⚔️ Skills";
      content.innerHTML = this.renderSkillsHTML();
      this.bindSkillButtons();
    }

    if (type === "monster") {
      title.textContent = "👹 Monstro";
      content.innerHTML = this.renderMonsterHTML();
    }

    if (type === "reward") {
      title.textContent = "🎁 Brindes";
      content.innerHTML = this.renderRewardHTML();
      this.bindRewardButtons();
    }

    if (type === "events") {
      title.textContent = "📢 Eventos";
      content.innerHTML = this.renderEventsHTML();
    }

    if (type === "chat") {
      title.textContent = "🌐 Chat Global";
      content.innerHTML = this.renderChatHTML();
      this.bindChatButtons();
    }
  },

  refreshOpenPanel() {
    const drawer = document.getElementById("eldDrawer");

    if (!drawer || drawer.classList.contains("hidden")) return;

    const type = drawer.dataset.panel;

    if (type) this.openPanel(type);
  },

  closePanel() {
    document.getElementById("eldDrawer")?.classList.add("hidden");
  },

renderAttributesHTML() {
  const c = this.character || {};
  const a = c.attributes || {};

  this.recalculateEquipmentStats();

  const eq = c.equipmentStats || {};

  const atkBase = (a.fisico || 0) * 2;
  const defBase = (a.defesa || 0) * 2;
  const velBase = (a.agilidade || 0) * 2;

  const atk = atkBase + (eq.ataque || 0);
  const def = defBase + (eq.defesa || 0);
  const vel = velBase + (eq.agilidade || 0);

  const crit = Math.floor((a.agilidade || 0) / 2);
  const esquiva = Math.floor((a.agilidade || 0) * 1.5);

  return `
    <div class="eld-card">
      <h3>📊 Atributos</h3>

      <p><strong>Pontos disponíveis:</strong> ${c.attributePoints || 0}</p>

      <hr>

      <div class="eld-attr-row">
        <span><strong>Físico:</strong> ${a.fisico || 0}</span>
        <div><button data-add-attr="fisico">+</button></div>
      </div>

      <div class="eld-attr-row">
        <span><strong>Defesa:</strong> ${a.defesa || 0}</span>
        <div><button data-add-attr="defesa">+</button></div>
      </div>

      <div class="eld-attr-row">
        <span><strong>Agilidade:</strong> ${a.agilidade || 0}</span>
        <div><button data-add-attr="agilidade">+</button></div>
      </div>

      <div class="eld-attr-row">
        <span><strong>Inteligência:</strong> ${a.inteligencia || 0}</span>
        <div><button data-add-attr="inteligencia">+</button></div>
      </div>

      <div class="eld-attr-row">
        <span><strong>Vitalidade:</strong> ${a.vitalidade || 0}</span>
        <div><button data-add-attr="vitalidade">+</button></div>
      </div>

      <hr>

      <p><strong>HP:</strong> ${c.hp || 0}/${c.maxHp || 0}</p>
      <p><strong>Mana:</strong> ${c.mana || 0}/${c.maxMana || 0}</p>
      <p><strong>Gold:</strong> ${c.gold || 0}</p>
      <p><strong>Nível:</strong> ${c.level || 1}</p>
      <p><strong>XP:</strong> ${c.xp || 0}</p>

      <hr>

      <h3>⚔️ Status do Personagem</h3>

      <p><strong>Ataque:</strong> ${atk} <small>(base ${atkBase} + equip ${eq.ataque || 0})</small></p>
      <p><strong>Defesa:</strong> ${def} <small>(base ${defBase} + equip ${eq.defesa || 0})</small></p>
      <p><strong>Velocidade:</strong> ${vel} <small>(base ${velBase} + equip ${eq.agilidade || 0})</small></p>
      <p><strong>Crítico:</strong> ${crit}%</p>
      <p><strong>Esquiva:</strong> ${esquiva}%</p>
    </div>
  `;
},

renderMarketHTML() {
  const inv = this.character?.inventory || [];

  const marketItems = [
    {
      id: "pocao_hp_basica",
      nome: "Poção HP Básica",
      tipo: "pocao_hp",
      tier: "T1",
      cura: 25,
      valor: 50,
      icon: "❤️",
      stackavel: false
    },
    {
      id: "pocao_mana_basica",
      nome: "Poção Mana Básica",
      tipo: "pocao_mn",
      tier: "T1",
      mana: 20,
      valor: 50,
      icon: "🔮",
      stackavel: false
    }
  ];

  const comprar = marketItems.map((item, index) => `
    <div class="eld-item-row">
      <div>
        <strong>${item.icon || "📦"} ${item.nome}</strong>
        <small>${item.tipo} • ${item.tier}</small>
        <small>Preço: ${Math.floor(item.valor * 1.5)} gold • entrega em 2 turnos</small>
      </div>
      <button data-buy-market="${index}">Comprar</button>
    </div>
  `).join("");

  const vender = inv.length
    ? inv.map((item, index) => `
      <div class="eld-item-row">
        <div>
          <strong>${item.icon || this.getItemIcon(item)} ${item.nome || item.name}</strong>
          <small>${item.tipo || item.type} • ${item.tier || "T1"}</small>
          <small>Venda: ${Math.floor((item.valor || 1) / 2)} gold</small>
        </div>
        <button data-sell-market="${index}">Vender</button>
      </div>
    `).join("")
    : `<p>Você não tem itens para vender.</p>`;

  return `
    <div class="eld-card">
      <h3>💰 Mercado</h3>
      <p><strong>Seu gold:</strong> ${this.character?.gold || 0}</p>
    </div>

    <div class="eld-card">
      <h3>Comprar</h3>
      ${comprar}
    </div>

    <div class="eld-card">
      <h3>Vender</h3>
      ${vender}
    </div>
  `;
},


       
bindMarketButtons() {
  const marketItems = [
    {
      id: "pocao_hp_basica",
      nome: "Poção HP Básica",
      tipo: "pocao_hp",
      tier: "T1",
      cura: 25,
      valor: 50,
      icon: "❤️"
    },
    {
      id: "pocao_mana_basica",
      nome: "Poção Mana Básica",
      tipo: "pocao_mn",
      tier: "T1",
      mana: 20,
      valor: 50,
      icon: "🔮"
    }
  ];

  document.querySelectorAll("[data-buy-market]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const item = marketItems[Number(btn.dataset.buyMarket)];
      if (!item) return;

      const price = Math.floor((item.valor || 1) * 1.5);

      if ((this.character.gold || 0) < price) {
        this.toast(`Gold insuficiente. Precisa de ${price}.`);
        return;
      }

      this.character.gold -= price;

      this.character.marketOrders = this.character.marketOrders || [];

      this.character.marketOrders.push({
        id: `order_${Date.now()}`,
        item: { ...item },
        paid: price,
        turnsLeft: 2,
        status: "traveling",
        createdAt: Date.now()
      });

      await this.saveCharacter();

      this.toast(`🕊️ Pedido feito. A cegonha chega em 2 turnos.`);

      this.openPanel("market");
    });
  });

  document.querySelectorAll("[data-sell-market]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const index = Number(btn.dataset.sellMarket);
      const item = this.character.inventory?.[index];

      if (!item) return;

      const price = Math.floor((item.valor || 1) / 2);

      this.character.gold = (this.character.gold || 0) + price;
      this.character.inventory.splice(index, 1);

      await this.saveCharacter();

      this.toast(`${item.nome || item.name} vendido por ${price} gold.`);

      this.openPanel("market");
    });
  });
},

fixEquipmentSlots() {
  const c = this.character;
  if (!c) return;

  c.equipment = c.equipment || {};
  c.inventory = c.inventory || [];

  const novo = {
    helmet: null,
    shield: null,
    armor: null,
    weapon: null,
    legs: null,
    boots: null,
    ring: null,
    amulet: null,
    backpack: null
  };

  Object.values(c.equipment).filter(Boolean).forEach(item => {
    const slotCerto = this.getEquipmentSlot(item);

    if (slotCerto && novo[slotCerto] === null) {
      novo[slotCerto] = item;
    } else {
      c.inventory.push(item);
    }
  });

  c.equipment = novo;
},



 renderInventoryHTML() {
  const c = this.character || {};
  const inv = (c.inventory || []).filter(Boolean);
  this.fixEquipmentSlots();

 c.equipment = c.equipment || {
  helmet: null,
  shield: null,
  armor: null,
  weapon: null,
  legs: null,
  boots: null,
  ring: null,
  amulet: null,
  backpack: null
};

  const slotName = {
    helmet: "Elmo",
    amulet: "Amuleto",
    weapon: "Arma",
    shield: "Escudo",
    armor: "Armadura",
    legs: "Calça",
    boots: "Bota",
    ring: "Anel",
    backpack: "Mochila"
  };

  
const renderEquipSlot = slot => {
  const item = c.equipment[slot];

  if (!item) {
    return `
      <button class="eld-equip-slot" data-equip-slot="${slot}"></button>
    `;
  }

  const visual = getItemVisual(item);

  return `
    <button
      class="eld-equip-slot"
      data-equip-slot="${slot}"
      style="
        border:2px solid ${visual.borderColor};
        background:${visual.background};
      "
    >
      <img
        src="${visual.image}"
        class="eld-equip-img"
        alt="${item.nome || item.name || 'item'}"
      >
    </button>
  `;
};

  const slots = Array.from({ length: 24 }, (_, index) => {
    const item = inv[index];

    if (!item) {
      return `<button class="eld-bag-slot empty"></button>`;
    }

    const icon = item.icon || item.emoji || this.getItemIcon(item);
    const qtd = item.quantidade || item.amount || 1;
    const rarity = item.rarity || item.raridade || "common";
    const visual = getItemVisual(item);

    return `

    

      <button
  class="eld-bag-slot"
  draggable="true"
  data-item-index="${index}"
  style="
    border:2px solid ${visual.borderColor};
    background:${visual.background};
  "
>
  <img
    src="${visual.image}"
    class="eld-item-img"
    alt="${item.nome || item.name || 'item'}"
  >

  ${qtd > 1 ? `<small>${qtd}</small>` : ""}
</button>
    `;
  }).join("");

return `
  <div class="eld-inventory-layout">

    <div class="eld-card eld-equipment-card">
      <h3>🛡️ Equipamento</h3>

      
        <div class="eld-equipment-grid">

  <!-- Capacete -->
  <div></div>
  ${renderEquipSlot("helmet")}
  <div></div>

  <!-- Escudo Armadura Arma -->
  ${renderEquipSlot("shield")}
  ${renderEquipSlot("armor")}
  ${renderEquipSlot("weapon")}

  <!-- Calça Mochila -->
  <div></div>
  ${renderEquipSlot("legs")}
  ${renderEquipSlot("backpack")}

  <!-- Bota -->
  <div></div>
  ${renderEquipSlot("boots")}
  <div></div>

  <!-- Anel Cordão -->
  <div></div>
  ${renderEquipSlot("ring")}
  ${renderEquipSlot("amulet")}

</div>
    </div>

    <div class="eld-card eld-bag-card">
      <h3>🎒 Bolsa</h3>

      <div class="eld-bag-grid">
        ${slots}
      </div>

      <div id="eldTrashZone" class="eld-trash-zone">
        🗑️ Arraste aqui para descartar
      </div>
    </div>

  </div>
`;
},

bindInventoryButtons() {
  document.querySelectorAll("[data-item-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.itemIndex);
      const item = this.character.inventory?.[index];
      if (item) this.openItemDetails(item, index);
    });

    btn.addEventListener("dragstart", e => {
      e.dataTransfer.setData("itemIndex", btn.dataset.itemIndex);
    });
  });

  document.querySelectorAll("[data-equip-slot]").forEach(slotBtn => {
    slotBtn.addEventListener("dragover", e => {
      e.preventDefault();
      slotBtn.classList.add("drag-over");
    });

    slotBtn.addEventListener("dragleave", () => {
      slotBtn.classList.remove("drag-over");
    });

    slotBtn.addEventListener("drop", async e => {
      e.preventDefault();
      slotBtn.classList.remove("drag-over");

      const index = Number(e.dataTransfer.getData("itemIndex"));
      const item = this.character.inventory?.[index];
      const targetSlot = slotBtn.dataset.equipSlot;

      if (!item) return;

      const correctSlot = this.getEquipmentSlot(item);

      if (correctSlot !== targetSlot) {
        this.toast(`Esse item não equipa nesse slot.`);
        return;
      }

      await this.equipItem(index, targetSlot);
    });

    slotBtn.addEventListener("click", async () => {
      const slot = slotBtn.dataset.equipSlot;
      const item = this.character.equipment?.[slot];

      if (!item) return;

      this.character.inventory = this.character.inventory || [];
      this.character.inventory.push(item);
      this.character.equipment[slot] = null;

      this.recalculateEquipmentStats?.();

      await this.saveCharacter();

      this.toast(`${item.nome || item.name || "Item"} desequipado.`);
      this.openPanel("bag");
    });
  });

  const trash = document.getElementById("eldTrashZone");

  if (trash) {
    trash.addEventListener("dragover", e => {
      e.preventDefault();
      trash.classList.add("drag-over");
    });

    trash.addEventListener("dragleave", () => {
      trash.classList.remove("drag-over");
    });

    trash.addEventListener("drop", async e => {
      e.preventDefault();
      trash.classList.remove("drag-over");

      const index = Number(e.dataTransfer.getData("itemIndex"));
      const item = this.character.inventory?.[index];

      if (!item) return;

      const ok = confirm(`Descartar ${item.nome || item.name || "item"}?`);
      if (!ok) return;

      this.character.inventory.splice(index, 1);

      await this.saveCharacter();

      this.toast(`${item.nome || item.name || "Item"} descartado.`);
      this.openPanel("bag");
    });
  }
},
  isUsableItem(item) {
     const tipo =
    String(item.tipo || item.type || "")
      .toLowerCase();

  return (
    tipo.includes("pocao") ||
    tipo.includes("poção") ||
    tipo.includes("hp") ||
    tipo.includes("mana") ||
    tipo.includes("mn") ||
    tipo.includes("comida") ||
    tipo.includes("erva") ||
    tipo.includes("fruta")
    );
  },


getItemIcon(item) {
  const tipo = String(item.tipo || item.type || "").toLowerCase();
  const name = String(item.nome || item.name || "").toLowerCase();

  if (item.image || item.img) return "";

  if (tipo.includes("arma") || tipo.includes("weapon")) return "⚔️";
  if (tipo.includes("shield") || tipo.includes("escudo")) return "🛡️";
  if (tipo.includes("helmet") || tipo.includes("elmo")) return "⛑️";
  if (tipo.includes("armor") || tipo.includes("armadura")) return "🥋";
  if (tipo.includes("boots") || tipo.includes("bota")) return "🥾";
  if (tipo.includes("ring") || tipo.includes("anel")) return "💍";
  if (tipo.includes("amulet")) return "📿";
  
  if (
  tipo.includes("pocao_hp") ||
  tipo.includes("hp") ||
  tipo.includes("vida") ||
  name.includes("vida") ||
  name.includes("hp")
) return "❤️";

if (
  tipo.includes("pocao_mn") ||
  tipo.includes("pocao_mana") ||
  tipo.includes("mana") ||
  tipo.includes("mn") ||
  name.includes("mana") ||
  name.includes("mn")
) return "🔮";
  return "📦";
},



getEquipmentSlot(item) {
  const tipo = String(item.tipo || item.type || "").toLowerCase();
  const nome = String(item.nome || item.name || "").toLowerCase();

  // primeiro armadura, antes de arma
  if (
    tipo === "armadura" ||
    tipo.includes("armor") ||
    tipo.includes("peitoral") ||
    nome.includes("armadura")
  ) return "armor";

  if (
    tipo === "arma" ||
    tipo === "weapon" ||
    tipo.includes("espada") ||
    tipo.includes("sword") ||
    nome.includes("espada")
  ) return "weapon";

  if (tipo.includes("escudo") || tipo.includes("shield")) return "shield";
  if (tipo.includes("capacete") || tipo.includes("helmet") || tipo.includes("elmo")) return "helmet";
  if (tipo.includes("calça") || tipo.includes("calca") || tipo.includes("legs")) return "legs";
  if (tipo.includes("bota") || tipo.includes("boots")) return "boots";
  if (tipo.includes("anel") || tipo.includes("ring")) return "ring";
  if (tipo.includes("colar") || tipo.includes("cordao") || tipo.includes("cordão") || tipo.includes("amuleto") || tipo.includes("amulet")) return "amulet";
  if (tipo.includes("mochila") || tipo.includes("backpack") || tipo.includes("bolsa")) return "backpack";

  return null;

},


async equipItem(index, forcedSlot = null) {
  const item = this.character.inventory?.[index];
  if (!item) return;

  const slot = forcedSlot || this.getEquipmentSlot(item);
  const correctSlot = this.getEquipmentSlot(item);

  if (!slot || slot !== correctSlot) {
    this.toast("Esse item não equipa nesse slot.");
    return;
  }

  this.character.equipment = this.character.equipment || {};

  const oldItem = this.character.equipment[slot];

  this.character.equipment[slot] = item;
  this.character.inventory.splice(index, 1);

  if (oldItem) {
    this.character.inventory.push(oldItem);
  }

  this.fixEquipmentSlots?.();
  this.recalculateEquipmentStats?.();

  await this.saveCharacter();

  this.toast(`${item.nome || item.name || "Item"} equipado.`);
  this.openPanel("bag");
},


recalculateEquipmentStats() {
  const c = this.character;
  if (!c) return;

  const items = Object.values(c.equipment || {}).filter(Boolean);

  c.equipmentStats = {
    ataque: 0,
    defesa: 0,
    agilidade: 0,
    mana: 0,
    hp: 0,
    slotsBonus: 0,
    pesoMax: 0
  };

  items.forEach(item => {
    c.equipmentStats.ataque += Number(item.ataque || item.attack || 0);
    c.equipmentStats.defesa += Number(item.defesa || item.defense || 0);
    c.equipmentStats.agilidade += Number(item.agilidade || item.speed || 0);
    c.equipmentStats.mana += Number(item.mana || 0);
    c.equipmentStats.hp += Number(item.hp || item.vida || 0);
    c.equipmentStats.slotsBonus += Number(item.slotsBonus || 0);
    c.equipmentStats.pesoMax += Number(item.pesoMax || 0);
  });
},


openItemDetails(item, index) {
  const old = document.getElementById("eldItemMenu");
  if (old) old.remove();

  const name = item.nome || item.name || item.id || "Item";
  const usable = this.isUsableItem(item);
  const equipavel = this.getEquipmentSlot(item);

  const menu = document.createElement("div");
  menu.id = "eldItemMenu";

  menu.innerHTML = `
    <div class="eld-item-menu-box">
      <div class="eld-item-menu-head">
        <strong>${this.escapeHTML(name)}</strong>
        <button id="eldCloseItemMenu">✕</button>
      </div>

      <small>Tipo: ${this.escapeHTML(item.tipo || item.type || "item")} • ${this.escapeHTML(item.tier || "T1")}</small>

      ${item.cura ? `<p>❤️ Cura: +${item.cura}</p>` : ""}
      ${item.mana ? `<p>🔮 Mana: +${item.mana}</p>` : ""}
      ${item.ataque ? `<p>⚔️ Ataque: +${item.ataque}</p>` : ""}
      ${item.defesa ? `<p>🛡️ Defesa: +${item.defesa}</p>` : ""}

      <div class="eld-item-menu-actions">
        ${usable ? `<button id="eldUseItemBtn">Usar agora</button>` : ""}
        ${usable ? `<button id="eldSetHpBtn">Atalho HP</button>` : ""}
        ${usable ? `<button id="eldSetManaBtn">Atalho Mana</button>` : ""}
        ${equipavel ? `<button disabled>Arraste para equipar</button>` : ""}
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  document.getElementById("eldCloseItemMenu")?.addEventListener("click", () => {
    menu.remove();
  });

  document.getElementById("eldUseItemBtn")?.addEventListener("click", async () => {
    menu.remove();
    await this.useItem(index);
    this.openPanel("bag");
  });

  document.getElementById("eldSetHpBtn")?.addEventListener("click", async () => {
    this.character.quickItems = this.character.quickItems || {};
    this.character.quickItems.hp = item.id;
    await this.saveCharacter();
    this.toast(`${name} virou atalho HP.`);
    menu.remove();
  });

  document.getElementById("eldSetManaBtn")?.addEventListener("click", async () => {
    this.character.quickItems = this.character.quickItems || {};
    this.character.quickItems.mana = item.id;
    await this.saveCharacter();
    this.toast(`${name} virou atalho Mana.`);
    menu.remove();
  });
},


async useItem(index) {
  if (!this.character) return;

  const item = this.character.inventory?.[index];
  if (!item) return;

  const name = item.nome || item.name || item.id || "item";

  const cura = Number(item.cura || item.heal || item.hp || item.vida || 0);
  const mana = Number(item.mana || item.restoreMana || item.valorMana || 0);

  let used = false;
  let message = "";

  if (cura > 0) {
    const maxHp = Number(this.character.maxHp || 100);
    const hpAtual = Number(this.character.hp || 0);

    this.character.hp = Math.min(maxHp, hpAtual + cura);

    used = true;
    message = `Você usou ${name} e recuperou ${cura} de HP.`;
  }

  if (mana > 0) {
    const maxMana = Number(this.character.maxMana || 50);
    const manaAtual = Number(this.character.mana || 0);

    this.character.mana = Math.min(maxMana, manaAtual + mana);

    used = true;
    message = `Você usou ${name} e recuperou ${mana} de Mana.`;
  }

  if (!used) {
    this.toast(`${name} não tem efeito de HP/Mana.`);
    return;
  }

  this.consumeInventoryItem(index);

  normalizeHpMana(this.character);

  this.updateAll();
  await this.saveCharacter();

  this.toast(message);
  this.emitAction("item-usado", { item });
},

  consumeInventoryItem(index) {
    const item = this.character?.inventory?.[index];

    if (!item) return;

    if ((item.quantidade || item.amount || 1) > 1) {
      if (item.quantidade) item.quantidade -= 1;
      else item.amount -= 1;
    } else {
      this.character.inventory.splice(index, 1);
    }
  },

  getAvailableSkills() {
  if (!this.character) return [];

  const learned = this.character.skillBook?.learned || [];

  return learned
    .map(id => getSkillById(id))
    .filter(Boolean);
},
getSkillSlotLimit() {
  const level = this.character?.level || 1;
  return 3 + Math.floor(level / 20);
},
 renderSkillsHTML() {
  const skills = this.getAvailableSkills();
  const equipped = this.character.skillBook?.equipped || [];
  const slotLimit = this.getSkillSlotLimit();

  if (!skills.length) {
    return `<div class="eld-card"><p>Nenhuma skill aprendida.</p></div>`;
  }

  return `
    <div class="eld-card">
      <h3>⚔️ Slots de Skills</h3>
      <p>${equipped.length}/${slotLimit} equipadas</p>
      <small>${equipped.map(id => getSkillById(id)?.name || id).join(" • ") || "Nenhuma equipada"}</small>
    </div>
  ` + skills.map((skill, index) => {
    const equippedNow = equipped.includes(skill.id);

    return `
      <div class="eld-item-row">
        <div>
          <strong>${skill.icon || "✨"} ${this.escapeHTML(skill.name)}</strong>
          <small>Tipo: ${skill.type || "skill"} • Mana: ${skill.manaCost || 0}</small>
          <small>Poder: ${skill.power || 0} • Lv: ${skill.minLevel || 1}</small>
          <small>${this.escapeHTML(skill.description || "")}</small>
        </div>

        <div class="eld-skill-buttons">
          <button data-preview-skill="${index}">Detalhes</button>
          ${
  this.monster && (this.monster.hp || 0) > 0
    ? (
        equippedNow
          ? `<button data-use-panel-skill="${index}">Usar</button>`
          : `<button disabled>Bloqueada</button>`
      )
    : (
        equippedNow
          ? `<button data-unequip-skill="${index}">Remover</button>`
          : `<button data-equip-skill="${index}">Equipar</button>`
      )
}
        </div>
      </div>
    `;
  }).join("");
},

bindAttributeButtons() {
  document.querySelectorAll("[data-add-attr]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if ((this.character.attributePoints || 0) <= 0) {
        this.toast("Sem pontos.");
        return;
      }

      const attr = btn.dataset.addAttr;

      this.character.attributes = this.character.attributes || {};
      this.character.attributes[attr] =
        (this.character.attributes[attr] || 0) + 1;

      this.character.attributePoints -= 1;
      if (attr === "vitalidade") {
  this.character.maxHp =
    (this.character.maxHp || 100) + 10;

  this.character.hp =
    (this.character.hp || 0) + 10;
}

if (attr === "inteligencia") {
  this.character.maxMana =
    (this.character.maxMana || 50) + 5;

  this.character.mana =
    (this.character.mana || 0) + 5;
}

this.updateAll();

      await this.saveCharacter();
      this.openPanel("attributes");
    });
  });

  document.querySelectorAll("[data-remove-attr]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const attr = btn.dataset.removeAttr;

      this.character.attributes = this.character.attributes || {};

      if ((this.character.attributes[attr] || 0) <= 0) return;

      this.character.attributes[attr] -= 1;
      this.character.attributePoints =
        (this.character.attributePoints || 0) + 1;

      await this.saveCharacter();
      this.openPanel("attributes");
    });
  });
},

bindSkillButtons() {

  
  const skills = this.getAvailableSkills();

  document.querySelectorAll("[data-equip-skill]").forEach(btn => {

    btn.addEventListener("click", async () => {

      const emCombate =
        this.monster &&
        (this.monster.hp || 0) > 0;

      if (emCombate) {
        this.toast(
          "Você não pode alterar skills durante combate."
        );
        return;
      }

      const skill =
        skills[Number(btn.dataset.equipSkill)];

      if (!skill) return;

      this.character.skillBook =
        this.character.skillBook || {};

      this.character.skillBook.equipped =
        this.character.skillBook.equipped || [];

      const slotLimit =
        this.getSkillSlotLimit();

      if (
        this.character.skillBook.equipped.length >= slotLimit
      ) {
        this.toast(
          `Limite de ${slotLimit} skills equipadas.`
        );
        return;
      }

      if (
        !this.character.skillBook.equipped.includes(skill.id)
      ) {
        this.character.skillBook.equipped.push(skill.id);
      }

      await this.saveCharacter();
this.renderActionBar();

this.toast(`${skill.name} equipada.`);

      this.refreshOpenPanel();

    });

  });

  document.querySelectorAll("[data-unequip-skill]").forEach(btn => {

    btn.addEventListener("click", async () => {

      const emCombate =
        this.monster &&
        (this.monster.hp || 0) > 0;

      if (emCombate) {
        this.toast(
          "Você não pode alterar skills durante combate."
        );
        return;
      }

      const skill =
        skills[Number(btn.dataset.unequipSkill)];

      if (!skill) return;

      this.character.skillBook.equipped =
        (this.character.skillBook.equipped || [])
          .filter(id => id !== skill.id);

      await this.saveCharacter();
      this.renderActionBar();

      this.toast(
        `${skill.name} removida.`
      );

      this.refreshOpenPanel();

    });

  });
  document.querySelectorAll("[data-use-panel-skill]").forEach(btn => {
  btn.addEventListener("click", () => {
    const skill =
      skills[Number(btn.dataset.usePanelSkill)];

    if (!skill) return;

    this.emitAction("skill", { skill });

    this.toast(
      `Usando ${skill.name}.`
    );

    this.closePanel();
  });
});

  document.querySelectorAll("[data-preview-skill]").forEach(btn => {

    btn.addEventListener("click", () => {

      const skill =
        skills[Number(btn.dataset.previewSkill)];

      if (!skill) return;

      alert(
`${skill.icon || "✨"} ${skill.name}

Tipo: ${skill.type || "skill"}

Mana: ${skill.manaCost || 0}

Poder: ${skill.power || 0}

Nível necessário: ${skill.minLevel || 1}

${skill.description || "Sem descrição"}`
      );

    });

  });
},
  renderMonsterHTML() {
    const m = this.monster;

    if (!m) {
      return `<div class="eld-card"><p>Nenhum monstro ativo.</p></div>`;
    }

    const hp = m.hp || 0;
    const maxHp = m.maxHp || m.vidaMax || m.vida || hp || 1;
    const pct = this.percent(hp, maxHp);

    const name = m.nome || m.name || "Criatura";
    const level = m.nivel || m.level || 1;
    const tier = m.tier || "T1";
    const race = m.race || m.tipo || "criatura";

    return `
      <div class="eld-card eld-monster-card">
        <h3>👹 ${this.escapeHTML(name)}</h3>
        <p><strong>Nível:</strong> ${level}</p>
        <p><strong>Tier:</strong> ${this.escapeHTML(tier)}</p>
        <p><strong>Tipo:</strong> ${this.escapeHTML(race)}</p>
        <p><strong>HP:</strong> ${hp}/${maxHp}</p>

        <div class="eld-mini-bar">
          <div class="eld-bar-bg">
            <div class="eld-hp-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  },

renderRewardHTML() {
  const c = this.character || {};

  const hoje = new Date().toDateString();

  const jaPegouDiario =
    c.lastDailyReward === hoje;

  const dia =
    c.dailyRewardDay || 1;

  const stageIndex =
    c.onlineRewardStage || 0;

  const stage =
    this.rewardStages[stageIndex];

  const recompensasDiarias = {
    1: "100 gold + HP T1 + Mana T1",
    2: "150 gold + 2 HP T1",
    3: "150 gold + 2 Mana T1",
    4: "200 gold + Material T1",
    5: "250 gold + Upgrade T1",
    6: "300 gold + HP T2",
    7: "500 gold + Mana T2 + Baú T2"
  };

  const onlineHTML = stage
    ? `
      <div class="eld-card">
        <h3>⏳ Brinde Online</h3>

        <p>
          Próximo:
          <strong>${stage.nome}</strong>
        </p>

        <p>
          Tempo:
          <strong id="eldRewardTimer">
            ${this.formatTime(this.rewardSeconds)}
          </strong>
        </p>

        <button
          id="eldClaimReward"
          ${this.rewardSeconds > 0 ? "disabled" : ""}
        >
          ${this.rewardSeconds > 0 ? "Aguardando..." : "🎁 Coletar online"}
        </button>
      </div>
    `
    : `
      <div class="eld-card">
        <h3>⏳ Brinde Online</h3>
        <p>Todos os brindes online coletados.</p>
      </div>
    `;

  return `
    ${onlineHTML}

    <div class="eld-card">
      <h3>📅 Brinde Diário</h3>

      <p>
        <strong>Dia:</strong>
        ${dia}/7
      </p>

      <p>
        <strong>Recompensa:</strong>
        ${recompensasDiarias[dia]}
      </p>

      <p>
        Status:
        <strong>
          ${jaPegouDiario ? "Já coletado hoje" : "Disponível"}
        </strong>
      </p>

      <button
        id="eldDailyReward"
        ${jaPegouDiario ? "disabled" : ""}
      >
        ${jaPegouDiario ? "✅ Coletado" : "🎁 Coletar diário"}
      </button>
    </div>

<div class="eld-card">
  <h3>🎰 Roleta Diária</h3>
  <p>Gire uma vez por dia para ganhar gold, poções ou item T1/T2.</p>

  <div
    id="eldWheelDisplay"
    style="
      font-size:18px;
      padding:10px;
      margin:8px 0;
      border:1px solid #555;
      border-radius:8px;
      text-align:center;
    "
  >
    🎁 Pronto para girar
  </div>
<p>
  💰 Custo: <strong>100 Gold</strong>
</p>
  <button id="eldSpinWheel">
    🎰 Girar roleta
  </button>

  <div id="eldWheelResult"></div>
</div>
  `;
},

bindRewardButtons() {
  const criarHpT1 = () => ({
    id: "pocao_hp_t1",
    nome: "Poção HP T1",
    tipo: "pocao_hp",
    tier: "T1",
    cura: 25,
    valor: 50,
    stackavel: false
  });

  const criarManaT1 = () => ({
    id: "pocao_mn_t1",
    nome: "Poção Mana T1",
    tipo: "pocao_mn",
    tier: "T1",
    mana: 20,
    valor: 50,
    stackavel: false
  });

  const criarHpT2 = () => ({
    id: "pocao_hp_t2",
    nome: "Poção HP T2",
    tipo: "pocao_hp",
    tier: "T2",
    cura: 60,
    valor: 150,
    stackavel: false
  });

  const criarManaT2 = () => ({
    id: "pocao_mn_t2",
    nome: "Poção Mana T2",
    tipo: "pocao_mn",
    tier: "T2",
    mana: 45,
    valor: 150,
    stackavel: false
  });

  document.getElementById("eldClaimReward")?.addEventListener("click", async () => {
    if (this.rewardSeconds > 0) {
      this.toast("O brinde online ainda não está disponível.");
      return;
    }

    this.character.inventory =
      this.character.inventory || [];

    this.character.gold =
      this.character.gold || 0;

    const stageIndex =
      this.character.onlineRewardStage || 0;

    const stage =
      this.rewardStages[stageIndex];

    if (!stage) {
      this.toast("Todos os brindes online foram coletados.");
      return;
    }

    if (stage.recompensa === "gold") {
      this.character.gold += stage.valor || 0;
    }

    if (stage.recompensa === "hp1") {
      this.character.inventory.push(criarHpT1());
    }

    if (stage.recompensa === "mana1") {
      this.character.inventory.push(criarManaT1());
    }

    if (stage.recompensa === "hp2") {
      this.character.inventory.push(criarHpT2());
    }

    if (stage.recompensa === "mana2") {
      this.character.inventory.push(criarManaT2());
    }

    this.character.onlineRewardStage =
      stageIndex + 1;

    const nextStage =
      this.rewardStages[this.character.onlineRewardStage];

    if (nextStage) {
      this.rewardSeconds =
        nextStage.tempo;
    }

    await this.saveCharacter();

    this.toast(`⏳ Brinde online coletado: ${stage.nome}`);
    this.openPanel("reward");
  });

  document.getElementById("eldDailyReward")?.addEventListener("click", async () => {
    const hoje =
      new Date().toDateString();

    if (this.character.lastDailyReward === hoje) {
      this.toast("Você já coletou o brinde diário hoje.");
      return;
    }

    this.character.inventory =
      this.character.inventory || [];

    this.character.gold =
      this.character.gold || 0;

    const dia =
      this.character.dailyRewardDay || 1;

    if (dia === 1) {
      this.character.gold += 100;
      this.character.inventory.push(
        criarHpT1(),
        criarManaT1()
      );
    }

    if (dia === 2) {
      this.character.gold += 150;
      this.character.inventory.push(
        criarHpT1(),
        criarHpT1()
      );
    }

    if (dia === 3) {
      this.character.gold += 150;
      this.character.inventory.push(
        criarManaT1(),
        criarManaT1()
      );
    }

    if (dia === 4) {
      this.character.gold += 200;
      this.character.inventory.push({
        id: "daily_material_t1",
        nome: "Cristal Glacial",
        tipo: "material",
        tier: "T1",
        valor: 80,
        stackavel: true
      });
    }

    if (dia === 5) {
      this.character.gold += 250;
      this.character.inventory.push({
        id: "daily_upgrade_t1",
        nome: "Pedra de Upgrade Rúnico",
        tipo: "upgrade",
        tier: "T1",
        valor: 120,
        stackavel: true
      });
    }

    if (dia === 6) {
      this.character.gold += 300;
      this.character.inventory.push(
        criarHpT2()
      );
    }

    if (dia === 7) {
      this.character.gold += 500;
      this.character.inventory.push(
        criarManaT2(),
        {
          id: "daily_bau_t2",
          nome: "Baú Diário T2",
          tipo: "material",
          tier: "T2",
          valor: 500,
          stackavel: false
        }
      );
    }

    this.character.lastDailyReward =
      hoje;

    this.character.dailyRewardDay =
      dia >= 7 ? 1 : dia + 1;

    await this.saveCharacter();

    this.toast(`🎁 Brinde diário do dia ${dia} coletado.`);
    this.openPanel("reward");
  });
 document.getElementById("eldSpinWheel")?.addEventListener("click", async () => {
  const WHEEL_COST = 100;

if ((this.character.gold || 0) < WHEEL_COST) {
  this.toast(`Você precisa de ${WHEEL_COST} gold para girar.`);
  return;
}

this.character.gold -= WHEEL_COST;

  const hoje = new Date().toDateString();

  if (this.character.lastWheelSpin === hoje) {
    this.toast("Você já girou a roleta hoje.");
    return;
  }

  const btn = document.getElementById("eldSpinWheel");
  const display = document.getElementById("eldWheelDisplay");

  if (btn) btn.disabled = true;

  const premios = [
    "💰 100 Gold",
    "❤️ Poção HP T1",
    "🔮 Poção Mana T1",
    "💎 Cristal Glacial",
    "🪨 Pedra de Upgrade",
    "❤️ Poção HP T2"
  ];

  let voltas = 0;

  const animacao = setInterval(() => {
    const item = premios[Math.floor(Math.random() * premios.length)];

    if (display) {
      display.innerHTML = `🎰 ${item}`;
    }

    voltas++;

    if (voltas >= 25) {
      clearInterval(animacao);
      finalizarRoleta();
    }
  }, 80);

  const finalizarRoleta = async () => {
    this.character.inventory = this.character.inventory || [];
    this.character.gold = this.character.gold || 0;

    const roll = Math.random() * 100;

    let premioNome = "";

    if (roll < 45) {
      this.character.gold += 100;
      premioNome = "💰 100 Gold";
    } else if (roll < 65) {
      this.character.inventory.push({
        id: "pocao_hp_t1",
        nome: "Poção HP T1",
        tipo: "pocao_hp",
        tier: "T1",
        cura: 25,
        valor: 50,
        stackavel: false
      });
      premioNome = "❤️ Poção HP T1";
    } else if (roll < 80) {
      this.character.inventory.push({
        id: "pocao_mn_t1",
        nome: "Poção Mana T1",
        tipo: "pocao_mn",
        tier: "T1",
        mana: 20,
        valor: 50,
        stackavel: false
      });
      premioNome = "🔮 Poção Mana T1";
    } else if (roll < 92) {
      this.character.inventory.push({
        id: "wheel_material_t1",
        nome: "Cristal Glacial",
        tipo: "material",
        tier: "T1",
        valor: 80,
        stackavel: true
      });
      premioNome = "💎 Cristal Glacial";
    } else if (roll < 98) {
      this.character.inventory.push({
        id: "wheel_upgrade_t1",
        nome: "Pedra de Upgrade Rúnico",
        tipo: "upgrade",
        tier: "T1",
        valor: 120,
        stackavel: true
      });
      premioNome = "🪨 Pedra de Upgrade";
    } else {
      this.character.inventory.push({
        id: "wheel_hp_t2",
        nome: "Poção HP T2",
        tipo: "pocao_hp",
        tier: "T2",
        cura: 60,
        valor: 150,
        stackavel: false
      });
      premioNome = "❤️ Poção HP T2";
    }

    this.character.lastWheelSpin = hoje;

    await this.saveCharacter();

    if (display) {
      display.innerHTML = `🎉 ${premioNome}`;
    }

    const result = document.getElementById("eldWheelResult");
    if (result) {
      result.innerHTML = `<p><strong>Você ganhou:</strong> ${premioNome}</p>`;
    }

    this.toast(`🎰 Roleta: ${premioNome}`);
  };
});
},
  renderEventsHTML() {
    return `
      <div class="eld-card">
        <h3>Evento Global</h3>
        <p>O Rei Esqueleto surgirá em breve.</p>
      </div>

      <div class="eld-card">
        <h3>Anúncio</h3>
        <p>Bem-vindo a Eldrakar.</p>
      </div>
    `;
  },

  renderChatHTML() {
    return `
      <div id="eldChatMessages" class="eld-chat-messages">
        <p><strong>Sistema:</strong> Chat global iniciado.</p>
      </div>

      <div class="eld-chat-input">
        <input id="eldChatInput" placeholder="Mensagem global...">
        <button id="eldChatSend">Enviar</button>
      </div>
    `;
  },

  bindChatButtons() {
    document.getElementById("eldChatSend")?.addEventListener("click", () => {
      this.sendChatMessage();
    });

    document.getElementById("eldChatInput")?.addEventListener("keydown", e => {
      if (e.key === "Enter") this.sendChatMessage();
    });
  },

  sendChatMessage() {
    const input = document.getElementById("eldChatInput");
    const box = document.getElementById("eldChatMessages");

    if (!input || !box) return;

    const text = input.value.trim();

    if (!text) return;

    const msg = document.createElement("p");

    msg.innerHTML = `<strong>${this.escapeHTML(this.character?.characterName || "Jogador")}:</strong> ${this.escapeHTML(text)}`;

    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
    input.value = "";

    this.emitAction("chat-message", { text });
  },

  startRewardTimer() {
    if (this.rewardInterval) clearInterval(this.rewardInterval);

    this.rewardInterval = setInterval(() => {
      if (this.rewardSeconds > 0) this.rewardSeconds--;

      const timer = document.getElementById("eldRewardTimer");

      if (timer) timer.textContent = this.formatTime(this.rewardSeconds);
    }, 1000);
  },

  toast(message) {
    const box = document.getElementById("eldToastBox");

    if (!box) return;

    const toast = document.createElement("div");

    toast.className = "eld-toast";
    toast.textContent = message;

    box.appendChild(toast);

    setTimeout(() => toast.remove(), 2600);
  },

  percent(value, max) {
    if (!max || max <= 0) return 0;

    return Math.max(
      0,
      Math.min(
        100,
        (Number(value || 0) / Number(max)) * 100
      )
    );
  },

  setText(id, value) {
    const el = document.getElementById(id);

    if (el) el.textContent = value;
  },

  setWidth(id, pct) {
    const el = document.getElementById(id);

    if (el) el.style.width = `${pct}%`;
  },

  formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");

    return `${m}:${s}`;
  },

  escapeHTML(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};

window.EldrakarGlobalUI = GlobalUI;

export default GlobalUI;