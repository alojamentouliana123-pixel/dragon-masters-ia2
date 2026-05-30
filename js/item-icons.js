// ===============================
// CORES DOS TIERS
// ===============================

export const TIER_STYLES = {
  T1: { borderColor: "#9ca3af", background: "rgba(156,163,175,.12)" },
  T2: { borderColor: "#10b981", background: "rgba(16,185,129,.12)" },
  T3: { borderColor: "#3b82f6", background: "rgba(59,130,246,.12)" },
  T4: { borderColor: "#8b5cf6", background: "rgba(139,92,246,.12)" },
  T5: { borderColor: "#f97316", background: "rgba(249,115,22,.12)" },
  T6: { borderColor: "#ef4444", background: "rgba(239,68,68,.12)" },
  T7: { borderColor: "#eab308", background: "rgba(234,179,8,.12)" }
};

// ===============================
// ÍCONES EXATOS DOS CONSUMÍVEIS
// ===============================

export const CONSUMABLE_ICONS = {

  // HP
  pocao_hp_t1: "./assets/items/consumiveis-h/Great_Health_Potion.gif",
  pocao_hp_t2: "./assets/items/consumiveis-h/Ultimate_Health_Potion.gif",
  pocao_hp_t3: "./assets/items/consumiveis-h/Supreme_Health_Potion.gif",

  // MANA
  pocao_mn_t1: "./assets/items/consumiveis-h/Great_Mana_Potion.gif",
  pocao_mn_t2: "./assets/items/consumiveis-h/Ultimate_Mana_Potion.gif",
  pocao_mn_t3: "./assets/items/consumiveis-h/Distilled_Superior_Mana_Potion.gif",

  // Mercado
  pocao_hp_basica: "./assets/items/consumiveis-h/Great_Health_Potion.gif",
  pocao_mana_basica: "./assets/items/consumiveis-h/Great_Mana_Potion.gif",

  // Compatibilidade antiga
  small_hp_potion: "./assets/items/consumiveis-h/Great_Health_Potion.gif",
  small_hp_potion_t1: "./assets/items/consumiveis-h/Great_Health_Potion.gif",
  small_hp_potion_t2: "./assets/items/consumiveis-h/Ultimate_Health_Potion.gif",
  small_hp_potion_t3: "./assets/items/consumiveis-h/Supreme_Health_Potion.gif",

  small_mana_potion: "./assets/items/consumiveis-h/Great_Mana_Potion.gif",
  small_mana_potion_t1: "./assets/items/consumiveis-h/Great_Mana_Potion.gif",
  small_mana_potion_t2: "./assets/items/consumiveis-h/Ultimate_Mana_Potion.gif",
  small_mana_potion_t3: "./assets/items/consumiveis-h/Distilled_Superior_Mana_Potion.gif",

  // Outras poções
  pocao_xp_t1: "./assets/items/consumiveis-h/verde1.gif",
  pocao_xp_t2: "./assets/items/consumiveis-h/verde2.gif",
  pocao_xp_t3: "./assets/items/consumiveis-h/verde3.gif",

  pocao_vel_t1: "./assets/items/consumiveis-h/azule1.gif",
  pocao_vel_t2: "./assets/items/consumiveis-h/azule2.gif",
  pocao_vel_t3: "./assets/items/consumiveis-h/azule3.gif",

  pocao_forca_t1: "./assets/items/consumiveis-h/maron1.gif",
  pocao_forca_t2: "./assets/items/consumiveis-h/maron2.gif",
  pocao_forca_t3: "./assets/items/consumiveis-h/maron3.gif",

  pocao_def_t1: "./assets/items/consumiveis-h/amarelo1.gif",
  pocao_def_t2: "./assets/items/consumiveis-h/amarelo2.gif",
  pocao_def_t3: "./assets/items/consumiveis-h/amarelo3.gif",

  pocao_int_t1: "./assets/items/consumiveis-h/roxa1.gif",
  pocao_int_t2: "./assets/items/consumiveis-h/roxa2.gif",
  pocao_int_t3: "./assets/items/consumiveis-h/roxa3.gif"
};
export const ITEM_NAME_ICONS = {
  espada: "./assets/items/arma-a/espada/s (1).gif",
  machado: "./assets/items/arma-a/machado/m (1).gif",
  arco: "./assets/items/arma-a/arco/a (1).gif",
  adaga: "./assets/items/arma-a/adaga/a.gif",
  lança: "./assets/items/arma-a/lança/l (1).gif",
  lanca: "./assets/items/arma-a/lança/l (1).gif",

  armadura: "./assets/items/armadura-c/c (1).gif",
  couraça: "./assets/items/armadura-c/c (2).gif",
  couraca: "./assets/items/armadura-c/c (2).gif",
  peitoral: "./assets/items/armadura-c/c (3).gif",

  capacete: "./assets/items/capacete-f/f (1).gif",
  elmo: "./assets/items/capacete-f/f (2).gif",

  bota: "./assets/items/bota-d/d (1).gif",
  botas: "./assets/items/bota-d/d (1).gif",
  grevas: "./assets/items/bota-d/d (2).gif",

  capa: "./assets/items/capa-e/e (1).gif",
  manto: "./assets/items/capa-e/e (2).gif",

  anel: "./assets/items/anel-b/b1 (1).gif",
  colar: "./assets/items/colar-g/g (1).gif",
  escudo: "./assets/items/escudo-i/i (1).gif",

  mochila: "./assets/items/mochila-l/l1 (1).gif",
  bolsa: "./assets/items/mochila-l/l1 (2).gif",

  cristal: "./assets/items/material-k/k (1).gif",
  osso: "./assets/items/material-k/k (2).gif",
  couro: "./assets/items/material-k/k (3).gif",
  minério: "./assets/items/material-k/k (4).gif",
  minerio: "./assets/items/material-k/k (4).gif",

  pedra: "./assets/items/up-m/m (1).gif",

  sucata: "./assets/items/lixo-j/j (1).gif",
  pedaço: "./assets/items/lixo-j/j (2).gif",
  pedaco: "./assets/items/lixo-j/j (2).gif",

  comida: "./assets/items/consumiveis-h/h (9).gif",
  fruta: "./assets/items/consumiveis-h/h (10).gif",
  erva: "./assets/items/consumiveis-h/h (14).gif"
};
// ===============================
// FUNÇÃO PRINCIPAL
// ===============================
export function getItemVisual(item = {}) {
  
  const id = String(item.id || "").toLowerCase();
  const nome = String(item.nome || item.name || "").toLowerCase();
  const tier = String(item.tier || "T1").toUpperCase();

  const estilo = TIER_STYLES[tier] || TIER_STYLES.T1;

  let image = CONSUMABLE_ICONS[id];
  const tipo = String(item.tipo || item.type || "").toLowerCase();

if (!image && tipo === "comida") {
  image = "./assets/items/consumiveis-h/h (9).gif";
}

if (!image && tipo === "fruta") {
  image = "./assets/items/consumiveis-h/h (10).gif";
}

if (!image && tipo === "erva") {
  image = "./assets/items/consumiveis-h/h (14).gif";
}

if (!image && tipo === "consumivel") {
  image = "./assets/items/consumiveis-h/h (9).gif";
}

  if (!image) {
    for (const key in ITEM_NAME_ICONS) {
      if (nome.includes(key)) {
        image = ITEM_NAME_ICONS[key];
        break;
      }
    }
  }

  if (!image) {
    image = "./assets/items/default.gif";
  }

  return {
    image,
    borderColor: estilo.borderColor,
    background: estilo.background,
    tier
  };
}