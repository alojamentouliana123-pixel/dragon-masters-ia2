import {
  calculateDerivedStats,
  normalizeHpMana
} from "./character-engine.js";

export function ensureInventory(character) {
  character.inventory = character.inventory || [];
  return character.inventory;
}

export function addItem(character, item, quantidade = 1) {
  ensureInventory(character);

  const stackavel = item.stackavel === true;

  if (stackavel) {
    const existing = character.inventory.find(i => i.id === item.id);

    if (existing) {
      existing.quantidade =
        (existing.quantidade || 1) + quantidade;

      return existing;
    }
  }

  character.inventory.push({
    ...structuredClone(item),
    quantidade
  });

  return item;
}

export function removeItem(character, itemId, quantidade = 1) {
  ensureInventory(character);

  const item = character.inventory.find(i => i.id === itemId);

  if (!item) return false;

  item.quantidade = (item.quantidade || 1) - quantidade;

  if (item.quantidade <= 0) {
    character.inventory =
      character.inventory.filter(i => i.id !== itemId);
  }

  return true;
}

export function useConsumable(character, itemId) {
  ensureInventory(character);

  const item = character.inventory.find(i => i.id === itemId);

  if (!item) {
    return {
      ok: false,
      message: "Item não encontrado."
    };
  }

  const cura = Number(item.cura || 0);
  const mana = Number(item.mana || 0);

  if (cura > 0) {
    character.hp = Math.min(
      character.maxHp,
      character.hp + cura
    );
  }

  if (mana > 0) {
    character.mana = Math.min(
      character.maxMana,
      character.mana + mana
    );
  }

  removeItem(character, item.id, 1);

  return {
    ok: true,
    item,
    cura,
    mana
  };
}

export function getInventoryWeight(character) {
  ensureInventory(character);

  return character.inventory.reduce((total, item) => {
    return total + (
      Number(item.peso || 0) *
      Number(item.quantidade || 1)
    );
  }, 0);
}

export function getInventoryLimit(character) {
  return calculateDerivedStats(character).pesoMax;
}

export function hasInventorySpace(character, item) {
  const current = getInventoryWeight(character);

  const future =
    current + Number(item.peso || 0);

  return future <= getInventoryLimit(character);
}

export function sortInventory(character) {
  ensureInventory(character);

  character.inventory.sort((a, b) => {
    return String(a.tipo || "")
      .localeCompare(String(b.tipo || ""));
  });

  return character.inventory;
}

export function dropItem(character, itemId, quantidade = 1) {
  return removeItem(character, itemId, quantidade);
}