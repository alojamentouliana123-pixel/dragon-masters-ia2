// =====================================================
// bank-system.js
// BANCO PESSOAL DO JOGADOR — ELDRAKAR
// =====================================================

export const BANK_CONFIG = {
  startingSlots: 50,
  slotUpgradeAmount: 10,
  firstUpgradeCost: 1000,
  upgradeCostMultiplier: 2,
  openAccountCost: 100
};

// =====================================================
// CRIAR BANCO
// =====================================================

export function createPlayerBank() {
  return {
    gold: 0,
    items: [],
    maxSlots: BANK_CONFIG.startingSlots,
    upgradeLevel: 0,
    nextUpgradeCost: BANK_CONFIG.firstUpgradeCost,
    openedAt: Date.now(),
    lastMaintenanceTurn: 0
  };
}

export function hasBankAccount(player) {
  return !!player?.bankAccountOpened && !!player?.bank;
}

export function openBankAccount(player) {
  if (!player) return null;

  if (hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Você já possui uma conta no banco."
    };
  }

  if ((player.gold || 0) < BANK_CONFIG.openAccountCost) {
    return {
      success: false,
      player,
      message: `⚠️ Você precisa de ${BANK_CONFIG.openAccountCost} gold para abrir conta.`
    };
  }

  return {
    success: true,
    player: {
      ...player,
      gold: (player.gold || 0) - BANK_CONFIG.openAccountCost,
      bankAccountOpened: true,
      bank: createPlayerBank()
    },
    paid: BANK_CONFIG.openAccountCost,
    message: "🏦 Conta bancária aberta com sucesso."
  };
}

// =====================================================
// SLOTS
// =====================================================

export function getUsedBankSlots(player) {
  return player?.bank?.items?.length || 0;
}

export function getFreeBankSlots(player) {
  if (!hasBankAccount(player)) return 0;
  return Math.max(0, (player.bank.maxSlots || 0) - getUsedBankSlots(player));
}

export function isBankFull(player) {
  return getFreeBankSlots(player) <= 0;
}

export function upgradeBankSlots(player) {
  if (!hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  const cost = player.bank.nextUpgradeCost || BANK_CONFIG.firstUpgradeCost;

  if ((player.gold || 0) < cost) {
    return {
      success: false,
      player,
      message: `⚠️ Você precisa de ${cost} gold para expandir o banco.`
    };
  }

  return {
    success: true,
    paid: cost,
    player: {
      ...player,
      gold: (player.gold || 0) - cost,
      bank: {
        ...player.bank,
        maxSlots: (player.bank.maxSlots || BANK_CONFIG.startingSlots) + BANK_CONFIG.slotUpgradeAmount,
        upgradeLevel: (player.bank.upgradeLevel || 0) + 1,
        nextUpgradeCost: cost * BANK_CONFIG.upgradeCostMultiplier
      }
    },
    message: `🏦 Banco expandido em +${BANK_CONFIG.slotUpgradeAmount} slots.`
  };
}

// =====================================================
// GOLD
// =====================================================

export function depositGold(player, amount) {
  if (!hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  amount = Math.floor(Number(amount));

  if (!amount || amount <= 0) {
    return {
      success: false,
      player,
      message: "⚠️ Quantidade inválida."
    };
  }

  if ((player.gold || 0) < amount) {
    return {
      success: false,
      player,
      message: "⚠️ Você não possui gold suficiente."
    };
  }

  return {
    success: true,
    player: {
      ...player,
      gold: (player.gold || 0) - amount,
      bank: {
        ...player.bank,
        gold: (player.bank.gold || 0) + amount
      }
    },
    amount,
    message: `💰 Você depositou ${amount} gold.`
  };
}

export function withdrawGold(player, amount) {
  if (!hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  amount = Math.floor(Number(amount));

  if (!amount || amount <= 0) {
    return {
      success: false,
      player,
      message: "⚠️ Quantidade inválida."
    };
  }

  if ((player.bank.gold || 0) < amount) {
    return {
      success: false,
      player,
      message: "⚠️ O banco não possui essa quantidade de gold."
    };
  }

  return {
    success: true,
    player: {
      ...player,
      gold: (player.gold || 0) + amount,
      bank: {
        ...player.bank,
        gold: (player.bank.gold || 0) - amount
      }
    },
    amount,
    message: `💰 Você sacou ${amount} gold.`
  };
}

// =====================================================
// ITENS
// =====================================================

export function depositItem(player, itemId, quantity = 1) {
  if (!hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  if (isBankFull(player)) {
    return {
      success: false,
      player,
      message: "⚠️ O banco está cheio."
    };
  }

  const inventory = [...(player.inventory || [])];
  const bankItems = [...(player.bank.items || [])];
  const itemIndex = inventory.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return {
      success: false,
      player,
      message: "⚠️ Item não encontrado no inventário."
    };
  }

  const item = { ...inventory[itemIndex] };
  const amount = Math.max(1, Math.floor(quantity));

  if (item.stackavel && (item.quantidade || 1) > amount) {
    item.quantidade = (item.quantidade || 1) - amount;
    inventory[itemIndex] = item;

    bankItems.push({
      ...item,
      quantidade: amount
    });
  } else {
    inventory.splice(itemIndex, 1);
    bankItems.push(item);
  }

  return {
    success: true,
    player: {
      ...player,
      inventory,
      bank: {
        ...player.bank,
        items: bankItems
      }
    },
    item,
    message: `📦 Item depositado no banco: ${item.nome || item.id}.`
  };
}

export function withdrawItem(player, itemId, quantity = 1) {
  if (!hasBankAccount(player)) {
    return {
      success: false,
      player,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  const inventory = [...(player.inventory || [])];
  const bankItems = [...(player.bank.items || [])];
  const itemIndex = bankItems.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return {
      success: false,
      player,
      message: "⚠️ Item não encontrado no banco."
    };
  }

  const item = { ...bankItems[itemIndex] };
  const amount = Math.max(1, Math.floor(quantity));

  if (item.stackavel && (item.quantidade || 1) > amount) {
    item.quantidade = (item.quantidade || 1) - amount;
    bankItems[itemIndex] = item;

    inventory.push({
      ...item,
      quantidade: amount
    });
  } else {
    bankItems.splice(itemIndex, 1);
    inventory.push(item);
  }

  return {
    success: true,
    player: {
      ...player,
      inventory,
      bank: {
        ...player.bank,
        items: bankItems
      }
    },
    item,
    message: `📤 Item retirado do banco: ${item.nome || item.id}.`
  };
}

// =====================================================
// RESUMO
// =====================================================

export function getBankSummary(player) {
  if (!hasBankAccount(player)) {
    return {
      opened: false,
      message: "Jogador não possui conta no banco."
    };
  }

  return {
    opened: true,
    gold: player.bank.gold || 0,
    usedSlots: getUsedBankSlots(player),
    maxSlots: player.bank.maxSlots || BANK_CONFIG.startingSlots,
    freeSlots: getFreeBankSlots(player),
    upgradeLevel: player.bank.upgradeLevel || 0,
    nextUpgradeCost: player.bank.nextUpgradeCost || BANK_CONFIG.firstUpgradeCost,
    items: player.bank.items || []
  };
}

export function getBankPromptContext(player) {
  const bank = getBankSummary(player);

  if (!bank.opened) {
    return "O jogador ainda não possui conta no banco.";
  }

  return `
BANCO DO JOGADOR:

Gold guardado: ${bank.gold}
Slots usados: ${bank.usedSlots}/${bank.maxSlots}
Slots livres: ${bank.freeSlots}
Nível de expansão: ${bank.upgradeLevel}
Próxima expansão: ${bank.nextUpgradeCost} gold

REGRAS:
- O banco guarda gold e itens.
- O banco começa com 50 slots.
- Cada expansão adiciona +10 slots.
- O custo da expansão dobra a cada compra.
- Banco não conta peso, apenas slots.
`;
}
