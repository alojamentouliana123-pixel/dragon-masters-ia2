// =====================================================
// chat-global.js
// CHAT GLOBAL + LISTA DE JOGADORES ONLINE — ELDRAKAR
// =====================================================

export const GLOBAL_CHAT_CONFIG = {
  maxMessages: 100,
  maxMessageLength: 240,
  floodCooldownMs: 2500,
  onlineTimeoutMs: 60000,

  channels: {
    global: "Global",
    system: "Sistema",
    trade: "Comércio",
    party: "Grupo",
    raid: "Raid"
  }
};

// =====================================================
// ESTADO INICIAL DO CHAT
// =====================================================

export function createGlobalChatState() {
  return {
    messages: [],
    onlinePlayers: {},
    mutedPlayers: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// =====================================================
// UTIL
// =====================================================

export function sanitizeMessage(text = "") {
  return String(text)
    .replace(/<[^>]*>?/gm, "")
    .trim()
    .slice(0, GLOBAL_CHAT_CONFIG.maxMessageLength);
}

export function createMessageId() {
  return `msg_${Date.now()}_${Math.floor(Math.random() * 999999)}`;
}

export function isPlayerMuted(chatState, playerId) {
  const mutedUntil = chatState?.mutedPlayers?.[playerId];
  return mutedUntil && mutedUntil > Date.now();
}

export function canSendMessage(chatState, playerId) {
  if (!chatState || !playerId) {
    return {
      allowed: false,
      message: "Chat não carregado."
    };
  }

  if (isPlayerMuted(chatState, playerId)) {
    return {
      allowed: false,
      message: "Você está silenciado temporariamente."
    };
  }

  const lastMessage = [...(chatState.messages || [])]
    .reverse()
    .find(msg => msg.playerId === playerId);

  if (
    lastMessage &&
    Date.now() - lastMessage.createdAt < GLOBAL_CHAT_CONFIG.floodCooldownMs
  ) {
    return {
      allowed: false,
      message: "Aguarde um pouco antes de enviar outra mensagem."
    };
  }

  return {
    allowed: true,
    message: ""
  };
}

// =====================================================
// ONLINE PLAYERS
// =====================================================

export function setPlayerOnline(chatState, player) {
  if (!chatState || !player?.id) return chatState;

  return {
    ...chatState,
    onlinePlayers: {
      ...(chatState.onlinePlayers || {}),
      [player.id]: {
        id: player.id,
        name: player.name || player.nome || "Jogador",
        level: player.level || player.nivel || 1,
        className: player.className || player.classe || "Sem classe",
        location: player.location || player.local || "Desconhecido",
        status: "online",
        lastSeen: Date.now()
      }
    },
    updatedAt: Date.now()
  };
}

export function setPlayerOffline(chatState, playerId) {
  if (!chatState || !playerId) return chatState;

  const onlinePlayers = { ...(chatState.onlinePlayers || {}) };

  if (onlinePlayers[playerId]) {
    onlinePlayers[playerId] = {
      ...onlinePlayers[playerId],
      status: "offline",
      lastSeen: Date.now()
    };
  }

  return {
    ...chatState,
    onlinePlayers,
    updatedAt: Date.now()
  };
}

export function removeExpiredOnlinePlayers(chatState) {
  if (!chatState) return chatState;

  const now = Date.now();
  const onlinePlayers = { ...(chatState.onlinePlayers || {}) };

  Object.keys(onlinePlayers).forEach(playerId => {
    const player = onlinePlayers[playerId];

    if (
      player.status === "online" &&
      now - player.lastSeen > GLOBAL_CHAT_CONFIG.onlineTimeoutMs
    ) {
      onlinePlayers[playerId] = {
        ...player,
        status: "offline"
      };
    }
  });

  return {
    ...chatState,
    onlinePlayers,
    updatedAt: Date.now()
  };
}

export function getOnlinePlayers(chatState) {
  const cleaned = removeExpiredOnlinePlayers(chatState);

  return Object.values(cleaned?.onlinePlayers || {})
    .filter(player => player.status === "online")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getOnlineCount(chatState) {
  return getOnlinePlayers(chatState).length;
}

// =====================================================
// ENVIAR MENSAGEM
// =====================================================

export function sendGlobalMessage({
  chatState,
  player,
  text,
  channel = "global"
}) {
  if (!chatState || !player?.id) {
    return {
      success: false,
      chatState,
      message: "Chat ou jogador inválido."
    };
  }

  const permission = canSendMessage(chatState, player.id);

  if (!permission.allowed) {
    return {
      success: false,
      chatState,
      message: permission.message
    };
  }

  const cleanText = sanitizeMessage(text);

  if (!cleanText) {
    return {
      success: false,
      chatState,
      message: "Mensagem vazia."
    };
  }

  const newMessage = {
    id: createMessageId(),
    channel,
    playerId: player.id,
    playerName: player.name || player.nome || "Jogador",
    level: player.level || player.nivel || 1,
    className: player.className || player.classe || "Sem classe",
    text: cleanText,
    createdAt: Date.now()
  };

  const messages = [
    ...(chatState.messages || []),
    newMessage
  ].slice(-GLOBAL_CHAT_CONFIG.maxMessages);

  const updatedChat = setPlayerOnline(
    {
      ...chatState,
      messages,
      updatedAt: Date.now()
    },
    player
  );

  return {
    success: true,
    chatState: updatedChat,
    messageData: newMessage,
    message: "Mensagem enviada."
  };
}

// =====================================================
// MENSAGENS DO SISTEMA
// =====================================================

export function sendSystemMessage(chatState, text, channel = "system") {
  if (!chatState) return chatState;

  const cleanText = sanitizeMessage(text);

  if (!cleanText) return chatState;

  const systemMessage = {
    id: createMessageId(),
    channel,
    playerId: "system",
    playerName: "Sistema",
    level: 0,
    className: "Sistema",
    text: cleanText,
    createdAt: Date.now()
  };

  return {
    ...chatState,
    messages: [
      ...(chatState.messages || []),
      systemMessage
    ].slice(-GLOBAL_CHAT_CONFIG.maxMessages),
    updatedAt: Date.now()
  };
}

export function announcePlayerOnline(chatState, player) {
  const updated = setPlayerOnline(chatState, player);
  return sendSystemMessage(
    updated,
    `${player.name || player.nome || "Um jogador"} entrou no mundo de Eldrakar.`,
    "system"
  );
}

export function announcePlayerOffline(chatState, player) {
  const updated = setPlayerOffline(chatState, player.id);
  return sendSystemMessage(
    updated,
    `${player.name || player.nome || "Um jogador"} saiu do mundo de Eldrakar.`,
    "system"
  );
}

export function announceWorldEvent(chatState, text) {
  return sendSystemMessage(chatState, `🌍 ${text}`, "system");
}

export function announceRaid(chatState, text) {
  return sendSystemMessage(chatState, `⚔️ ${text}`, "raid");
}

export function announceTrade(chatState, text) {
  return sendSystemMessage(chatState, `💰 ${text}`, "trade");
}

// =====================================================
// MODERAÇÃO SIMPLES
// =====================================================

export function mutePlayer(chatState, playerId, minutes = 5) {
  if (!chatState || !playerId) return chatState;

  return {
    ...chatState,
    mutedPlayers: {
      ...(chatState.mutedPlayers || {}),
      [playerId]: Date.now() + minutes * 60 * 1000
    },
    updatedAt: Date.now()
  };
}

export function unmutePlayer(chatState, playerId) {
  if (!chatState || !playerId) return chatState;

  const mutedPlayers = { ...(chatState.mutedPlayers || {}) };
  delete mutedPlayers[playerId];

  return {
    ...chatState,
    mutedPlayers,
    updatedAt: Date.now()
  };
}

// =====================================================
// BUSCAR MENSAGENS
// =====================================================

export function getMessagesByChannel(chatState, channel = "global") {
  return (chatState?.messages || [])
    .filter(msg => msg.channel === channel)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getRecentMessages(chatState, limit = 30) {
  return [...(chatState?.messages || [])]
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-limit);
}

// =====================================================
// CONTEXTO PARA IA
// =====================================================

export function getGlobalChatPromptContext(chatState) {
  const online = getOnlinePlayers(chatState);
  const recent = getRecentMessages(chatState, 10);

  return `
CHAT GLOBAL:

Jogadores online: ${online.length}
Online:
${online.map(p => `- ${p.name} Nv.${p.level} ${p.className} em ${p.location}`).join("\n") || "Nenhum jogador online."}

Últimas mensagens:
${recent.map(m => `[${m.channel}] ${m.playerName}: ${m.text}`).join("\n") || "Nenhuma mensagem recente."}

REGRAS:
- Chat global é visto por todos.
- Sistema pode anunciar eventos mundiais, raids e mortes importantes.
- Jogadores online devem atualizar presença com heartbeat.
- A IA pode ler o contexto do chat, mas não deve alterar gold, loot ou inventário pelo chat.
`;
}
