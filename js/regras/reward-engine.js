import ITEMS from "../../eldrakar_items_1200.json" assert { type: "json" };

function randomItem(list) {
  if (!list.length) return null;
  return structuredClone(list[Math.floor(Math.random() * list.length)]);
}

function rollGold(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function survivalItems() {
  return ITEMS.filter(item => {
    const tipo = String(item.tipo || "").toLowerCase();

    return (
      tipo.includes("comida") ||
      tipo.includes("erva") ||
      tipo.includes("fruta") ||
      tipo.includes("pocao_hp") ||
      tipo.includes("pocao_mn") ||
      Number(item.cura || 0) > 0 ||
      Number(item.mana || 0) > 0
    );
  });
}

export function criarRecompensaOnline() {
  return {
    gold: rollGold(15, 60),
    items: [randomItem(survivalItems())].filter(Boolean)
  };
}

export function criarBauDiario() {
  return {
    gold: rollGold(80, 250),
    items: [
      randomItem(survivalItems()),
      randomItem(ITEMS)
    ].filter(Boolean)
  };
}

export function aplicarRecompensa(character, reward) {
  character.gold = (character.gold || 0) + (reward.gold || 0);
  character.inventory = [
    ...(character.inventory || []),
    ...(reward.items || [])
  ];

  return character;
}