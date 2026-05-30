import GlobalUI from "./global-ui.js";
import { GameBrain } from "./game-brain.js";
import { createWorldEncounter } from "./game-brain/encounter-engine.js";
import { normalizeHpMana } from "./game-brain/character-engine.js";

function getChar() {

  let character =
    GameBrain?.character ||
    GlobalUI?.character ||
    GlobalUI?.getCharacter?.();

  if (!character) {
    console.warn("Nenhum personagem carregado.");
    return null;
  }

  return character;
}


function sync() {
  const character = getChar();

  normalizeHpMana(character);

  GameBrain.character = character;
  GlobalUI.setCharacter(character);
  GlobalUI.saveCharacter();

  console.log("ADM sync:", character);
}

window.ADM = {
  gold(amount = 1000) {
    const c = getChar();
    c.gold = (c.gold || 0) + Number(amount);
    sync();
    return c;
  },

  heal() {
    const c = getChar();
    c.hp = c.maxHp;
    c.mana = c.maxMana;
    sync();
    return c;
  },

  level(level = 10) {
    const c = getChar();
    c.level = Number(level);
    normalizeHpMana(c, true);
    sync();
    return c;
  },
stats() {

  const c = getChar();

  if (!c) {
    console.warn("Personagem não encontrado.");
    return null;
  }

  console.log("Personagem:", c);
  console.log("Attributes:", c.attributes);
  console.log("Equipment:", c.equipment);

  return c;
},
  
  attr(nome, valor) {
    const c = getChar();
    c.attributes = c.attributes || {};
    c.attributes[nome] = Number(valor);
    sync();
    return c;
  },

  spawn(maxTier = "T1") {
    const c = getChar();

    const encounter = createWorldEncounter({
      character: c,
      place: "admin_test",
      bioma: "swamp",
      maxTier
    });

    GameBrain.encontroAtivo = encounter;
    GameBrain.estadoAtual = "COMBATE";

    const monster =
      encounter.monsters?.find(m => (m.hp || 0) > 0) ||
      encounter.monsters?.[0];

    GlobalUI.setMonster(monster);
    console.log("Monstro criado:", monster);

    return encounter;
  }
};

console.log("✅ ADM carregado. Use ADM.stats(), ADM.gold(1000), ADM.heal(), ADM.attr('defesa', 20), ADM.spawn('T1')");