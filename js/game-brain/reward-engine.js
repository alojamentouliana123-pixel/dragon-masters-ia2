import POTIONS from "../../assets/data/potion.json" assert { type: "json" };

function randomItem(list = []) {
  if (!list.length) return null;

  return structuredClone(
    list[Math.floor(Math.random() * list.length)]
  );
}

function random(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function getRewardItems() {
  return POTIONS.filter(item => {
    const tipo = String(item.tipo || "").toLowerCase();

    return (
      tipo.includes("pocao") ||
      tipo.includes("comida") ||
      tipo.includes("erva") ||
      tipo.includes("fruta") ||
      Number(item.cura || 0) > 0 ||
      Number(item.mana || 0) > 0
    );
  });
}

export function gerarRecompensaVideo() {
  const pool = getRewardItems();

  return {
    gold: random(30, 120),
    xp: random(20, 60),
    gems: random(0, 2),
    items: [
      randomItem(pool),
      Math.random() < 0.35 ? randomItem(pool) : null
    ].filter(Boolean)
  };
}

export function gerarRecompensaLogin(days = 1) {
  const pool = getRewardItems();

  return {
    gold: random(50, 200) * days,
    xp: random(30, 90) * days,
    gems: days >= 7 ? 5 : 1,
    items: [
      randomItem(pool),
      randomItem(pool)
    ].filter(Boolean)
  };
}

export function gerarRecompensaMissao(difficulty = 1) {
  const pool = getRewardItems();

  return {
    gold: random(40, 120) * difficulty,
    xp: random(25, 80) * difficulty,
    gems: difficulty >= 8 ? 1 : 0,

    items: [
      randomItem(pool),
      Math.random() < 0.35 ? randomItem(pool) : null
    ].filter(Boolean)
  };
}