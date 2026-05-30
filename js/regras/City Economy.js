// =====================================================
// city-economy.js
// ECONOMIA DA CIDADE — COFRE, PRODUÇÃO E TAXAS
// =====================================================

export const CITY_ECONOMY_CONFIG = {
  defaultCityId: "eldrakar_city",

  // Cofre inicial da cidade
  startingReserveGold: 50000,

  // Limite máximo do cofre
  maxReserveGold: 250000,

  // Produção base por turno global
  goldPerTurn: 250,

  // Taxas do banco do jogador
  bankAccountOpenCost: 100,
  bankMaintenancePercent: 2,
  bankMaintenanceTurnInterval: 50,
  bankMaintenanceMaxCost: 500,

  // Banco de itens do jogador
  startingBankSlots: 50,
  bankSlotUpgradeAmount: 10,
  firstBankSlotUpgradeCost: 1000,
  bankSlotUpgradeCostMultiplier: 2,

  // Mercado
  cityBuyItemPercent: 50,  // cidade compra do jogador por 50% do valor
  citySellItemPercent: 100 // cidade vende pelo valor cheio
};

// =====================================================
// CRIAR ECONOMIA DA CIDADE
// =====================================================

export function createCityEconomy(cityId = CITY_ECONOMY_CONFIG.defaultCityId) {
  return {
    cityId,
    reserveGold: CITY_ECONOMY_CONFIG.startingReserveGold,
    maxReserveGold: CITY_ECONOMY_CONFIG.maxReserveGold,
    goldPerTurn: CITY_ECONOMY_CONFIG.goldPerTurn,

    stockItems: [],

    totalGoldProduced: 0,
    totalGoldSpentBuyingFromPlayers: 0,
    totalGoldReceivedFromPlayers: 0,
    totalBankFeesCollected: 0,

    turn: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// =====================================================
// PRODUÇÃO DE GOLD POR TURNO
// =====================================================

export function produceCityGold(cityEconomy, turns = 1) {
  if (!cityEconomy) return null;

  const amount = cityEconomy.goldPerTurn * turns;
  const newReserve = Math.min(
    cityEconomy.maxReserveGold,
    (cityEconomy.reserveGold || 0) + amount
  );

  const produced = newReserve - (cityEconomy.reserveGold || 0);

  return {
    ...cityEconomy,
    reserveGold: newReserve,
    totalGoldProduced: (cityEconomy.totalGoldProduced || 0) + produced,
    turn: (cityEconomy.turn || 0) + turns,
    updatedAt: Date.now()
  };
}

// =====================================================
// COFRE DA CIDADE
// =====================================================

export function canCityPay(cityEconomy, amount) {
  return (cityEconomy?.reserveGold || 0) >= amount;
}

export function removeGoldFromCity(cityEconomy, amount, reason = "unknown") {
  if (!cityEconomy) return null;

  if (!canCityPay(cityEconomy, amount)) {
    return {
      success: false,
      economy: cityEconomy,
      message: "⚠️ A cidade não possui gold suficiente no cofre.",
      reason
    };
  }

  return {
    success: true,
    economy: {
      ...cityEconomy,
      reserveGold: (cityEconomy.reserveGold || 0) - amount,
      updatedAt: Date.now()
    },
    amount,
    reason
  };
}

export function addGoldToCity(cityEconomy, amount, reason = "unknown") {
  if (!cityEconomy) return null;

  const newReserve = Math.min(
    cityEconomy.maxReserveGold,
    (cityEconomy.reserveGold || 0) + amount
  );

  return {
    ...cityEconomy,
    reserveGold: newReserve,
    updatedAt: Date.now(),
    lastIncomeReason: reason
  };
}

// =====================================================
// TAXAS DO BANCO
// =====================================================

export function chargeBankAccountOpenFee(player, cityEconomy) {
  const cost = CITY_ECONOMY_CONFIG.bankAccountOpenCost;

  if (!player || !cityEconomy) return null;

  if ((player.gold || 0) < cost) {
    return {
      success: false,
      player,
      cityEconomy,
      message: `⚠️ Você precisa de ${cost} gold para abrir uma conta no banco.`
    };
  }

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) - cost,
    bankAccountOpened: true,
    bank: player.bank || {
      gold: 0,
      items: [],
      maxSlots: CITY_ECONOMY_CONFIG.startingBankSlots,
      upgradeLevel: 0,
      nextUpgradeCost: CITY_ECONOMY_CONFIG.firstBankSlotUpgradeCost,
      lastMaintenanceTurn: cityEconomy.turn || 0
    }
  };

  const updatedEconomy = addGoldToCity(cityEconomy, cost, "bank_open_fee");

  return {
    success: true,
    player: updatedPlayer,
    cityEconomy: {
      ...updatedEconomy,
      totalBankFeesCollected: (updatedEconomy.totalBankFeesCollected || 0) + cost
    },
    message: "🏦 Conta bancária aberta com sucesso."
  };
}

export function calculateBankMaintenanceFee(player) {
  const bankGold = player?.bank?.gold || 0;

  const rawFee = Math.floor(
    bankGold * (CITY_ECONOMY_CONFIG.bankMaintenancePercent / 100)
  );

  return Math.min(rawFee, CITY_ECONOMY_CONFIG.bankMaintenanceMaxCost);
}

export function shouldChargeBankMaintenance(player, cityEconomy) {
  const lastTurn = player?.bank?.lastMaintenanceTurn || 0;
  const currentTurn = cityEconomy?.turn || 0;

  return (
    currentTurn - lastTurn >=
    CITY_ECONOMY_CONFIG.bankMaintenanceTurnInterval
  );
}

export function chargeBankMaintenance(player, cityEconomy) {
  if (!player || !cityEconomy) return null;

  if (!player.bankAccountOpened || !player.bank) {
    return {
      success: false,
      player,
      cityEconomy,
      message: "⚠️ O jogador ainda não possui conta no banco."
    };
  }

  if (!shouldChargeBankMaintenance(player, cityEconomy)) {
    return {
      success: true,
      charged: false,
      player,
      cityEconomy,
      message: "Manutenção ainda não necessária."
    };
  }

  const fee = calculateBankMaintenanceFee(player);

  if (fee <= 0) {
    return {
      success: true,
      charged: false,
      player: {
        ...player,
        bank: {
          ...player.bank,
          lastMaintenanceTurn: cityEconomy.turn || 0
        }
      },
      cityEconomy,
      message: "Nenhuma taxa foi cobrada."
    };
  }

  const bankGold = player.bank.gold || 0;
  const chargedFee = Math.min(bankGold, fee);

  const updatedPlayer = {
    ...player,
    bank: {
      ...player.bank,
      gold: bankGold - chargedFee,
      lastMaintenanceTurn: cityEconomy.turn || 0
    }
  };

  const updatedEconomy = addGoldToCity(cityEconomy, chargedFee, "bank_maintenance_fee");

  return {
    success: true,
    charged: true,
    fee: chargedFee,
    player: updatedPlayer,
    cityEconomy: {
      ...updatedEconomy,
      totalBankFeesCollected: (updatedEconomy.totalBankFeesCollected || 0) + chargedFee
    },
    message: `🏦 Taxa de manutenção cobrada: ${chargedFee} gold.`
  };
}

// =====================================================
// EXPANSÃO DE SLOTS DO BANCO
// =====================================================

export function upgradePlayerBankSlots(player, cityEconomy) {
  if (!player || !cityEconomy) return null;

  if (!player.bankAccountOpened || !player.bank) {
    return {
      success: false,
      player,
      cityEconomy,
      message: "⚠️ Abra uma conta no banco primeiro."
    };
  }

  const cost = player.bank.nextUpgradeCost || CITY_ECONOMY_CONFIG.firstBankSlotUpgradeCost;

  if ((player.gold || 0) < cost) {
    return {
      success: false,
      player,
      cityEconomy,
      message: `⚠️ Você precisa de ${cost} gold para expandir o banco.`
    };
  }

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) - cost,
    bank: {
      ...player.bank,
      maxSlots: (player.bank.maxSlots || CITY_ECONOMY_CONFIG.startingBankSlots) + CITY_ECONOMY_CONFIG.bankSlotUpgradeAmount,
      upgradeLevel: (player.bank.upgradeLevel || 0) + 1,
      nextUpgradeCost: cost * CITY_ECONOMY_CONFIG.bankSlotUpgradeCostMultiplier
    }
  };

  const updatedEconomy = addGoldToCity(cityEconomy, cost, "bank_slot_upgrade");

  return {
    success: true,
    player: updatedPlayer,
    cityEconomy: {
      ...updatedEconomy,
      totalBankFeesCollected: (updatedEconomy.totalBankFeesCollected || 0) + cost
    },
    message: `🏦 Banco expandido em +${CITY_ECONOMY_CONFIG.bankSlotUpgradeAmount} slots.`
  };
}

// =====================================================
// MERCADO / NPC — ENTRADA E SAÍDA DO COFRE
// =====================================================

export function calculateCityBuyPrice(item) {
  return Math.max(
    1,
    Math.floor((item?.valor || 1) * (CITY_ECONOMY_CONFIG.cityBuyItemPercent / 100))
  );
}

export function calculateCitySellPrice(item) {
  return Math.max(
    1,
    Math.floor((item?.valor || 1) * (CITY_ECONOMY_CONFIG.citySellItemPercent / 100))
  );
}

export function cityBuysItemFromPlayer({ player, cityEconomy, itemId }) {
  if (!player || !cityEconomy) return null;

  const inventory = [...(player.inventory || [])];
  const itemIndex = inventory.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return {
      success: false,
      player,
      cityEconomy,
      message: "⚠️ Item não encontrado no inventário."
    };
  }

  const item = inventory[itemIndex];
  const price = calculateCityBuyPrice(item);

  if (!canCityPay(cityEconomy, price)) {
    return {
      success: false,
      player,
      cityEconomy,
      message: "⚠️ A cidade não tem gold suficiente para comprar esse item agora."
    };
  }

  inventory.splice(itemIndex, 1);

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) + price,
    inventory
  };

  const updatedEconomy = {
    ...cityEconomy,
    reserveGold: (cityEconomy.reserveGold || 0) - price,
    stockItems: [
      ...(cityEconomy.stockItems || []),
      item
    ],
    totalGoldSpentBuyingFromPlayers:
      (cityEconomy.totalGoldSpentBuyingFromPlayers || 0) + price,
    updatedAt: Date.now()
  };

  return {
    success: true,
    player: updatedPlayer,
    cityEconomy: updatedEconomy,
    price,
    item,
    message: `💰 Item vendido para a cidade por ${price} gold.`
  };
}

export function playerBuysItemFromCity({ player, cityEconomy, itemId }) {
  if (!player || !cityEconomy) return null;

  const stockItems = [...(cityEconomy.stockItems || [])];
  const itemIndex = stockItems.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return {
      success: false,
      player,
      cityEconomy,
      message: "⚠️ Esse item não está no estoque da cidade."
    };
  }

  const item = stockItems[itemIndex];
  const price = calculateCitySellPrice(item);

  if ((player.gold || 0) < price) {
    return {
      success: false,
      player,
      cityEconomy,
      message: `⚠️ Você precisa de ${price} gold para comprar esse item.`
    };
  }

  stockItems.splice(itemIndex, 1);

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) - price,
    inventory: [
      ...(player.inventory || []),
      item
    ]
  };

  const updatedEconomy = addGoldToCity(
    {
      ...cityEconomy,
      stockItems
    },
    price,
    "player_buy_item"
  );

  return {
    success: true,
    player: updatedPlayer,
    cityEconomy: {
      ...updatedEconomy,
      totalGoldReceivedFromPlayers:
        (updatedEconomy.totalGoldReceivedFromPlayers || 0) + price
    },
    price,
    item,
    message: `🛒 Item comprado da cidade por ${price} gold.`
  };
}

// =====================================================
// STATUS ECONÔMICO DA CIDADE
// =====================================================

export function getCityEconomyStatus(cityEconomy) {
  if (!cityEconomy) return "unknown";

  const ratio = (cityEconomy.reserveGold || 0) / (cityEconomy.maxReserveGold || 1);

  if (ratio >= 0.8) return "rica";
  if (ratio >= 0.5) return "estável";
  if (ratio >= 0.25) return "pressionada";
  return "pobre";
}

export function getCityEconomySummary(cityEconomy) {
  if (!cityEconomy) return null;

  return {
    cityId: cityEconomy.cityId,
    turn: cityEconomy.turn,
    reserveGold: cityEconomy.reserveGold,
    maxReserveGold: cityEconomy.maxReserveGold,
    goldPerTurn: cityEconomy.goldPerTurn,
    status: getCityEconomyStatus(cityEconomy),
    stockItemsCount: cityEconomy.stockItems?.length || 0,
    totalGoldProduced: cityEconomy.totalGoldProduced || 0,
    totalGoldSpentBuyingFromPlayers: cityEconomy.totalGoldSpentBuyingFromPlayers || 0,
    totalGoldReceivedFromPlayers: cityEconomy.totalGoldReceivedFromPlayers || 0,
    totalBankFeesCollected: cityEconomy.totalBankFeesCollected || 0
  };
}

export function getCityEconomyPromptContext(cityEconomy) {
  const summary = getCityEconomySummary(cityEconomy);

  if (!summary) return "Economia da cidade não carregada.";

  return `
ECONOMIA DA CIDADE:

Cidade: ${summary.cityId}
Turno econômico: ${summary.turn}
Cofre da cidade: ${summary.reserveGold}/${summary.maxReserveGold} gold
Produção por turno: ${summary.goldPerTurn} gold
Status econômico: ${summary.status}
Itens no estoque da cidade: ${summary.stockItemsCount}

REGRAS:
- Quando jogador vende item, gold sai do cofre da cidade.
- Quando jogador compra item, gold entra no cofre da cidade.
- A cidade cobra taxas bancárias.
- A cidade produz gold por turno global.
- Se o cofre estiver baixo, NPCs podem limitar compras de itens caros.
`;
}
