const worldLore = `
Eldrakar é um continente antigo dominado por dragões,
ruínas esquecidas e reinos em guerra.

Portais entre mundos começaram a abrir.
Pessoas da Terra estão despertando neste mundo.

Algo sombrio está retornando.
`;

const intros = [

  "A chuva cai lentamente enquanto você desperta em uma estrada antiga.",

  "O vento sopra entre árvores gigantes. Você sente que algo observa você.",

  "Uma névoa cobre o horizonte. O silêncio parece errado.",

  "Você escuta sinos distantes vindos de uma cidade desconhecida.",

  "O céu de Eldrakar parece diferente de tudo que você já viu."

];

const randomEvents = [

  "Um rugido ecoa nas montanhas ao norte.",

  "Moradores comentam sobre desaparecimentos recentes.",

  "Uma tempestade estranha começa a surgir.",

  "Pegadas gigantes foram encontradas perto da estrada.",

  "Um viajante encapuzado observa você de longe."

];

export function generatePlayerStory(character){

  const intro =
    intros[Math.floor(Math.random() * intros.length)];

  const event =
    randomEvents[Math.floor(Math.random() * randomEvents.length)];

  return `
🌌 ${character.characterName}, o ${character.className},
desperta em Eldrakar.

${intro}

${event}

Seu destino neste mundo ainda é desconhecido.
`;
}

export function aiReact(action, character){

  const dice = Math.floor(Math.random() * 20) + 1;

  let result = "";

  if(action === "move"){

    if(dice >= 15){

      result = `
✅ Você avança com segurança.
Algo importante parece existir adiante.
`;

    }else if(dice <= 5){

      result = `
❌ Você sente uma presença perigosa observando você.
`;

    }else{

      result = `
⚠️ Você continua avançando pela região.
`;

    }

  }

  if(action === "observe"){

    result = `
👁️ Você tenta observar o ambiente.

🎲 Resultado: ${dice}

Sombras se movem entre as árvores.
`;

  }

  if(action === "attack"){

    result = `
⚔️ Você prepara um ataque.

🎲 Resultado: ${dice}

O impacto ecoa pelo ambiente.
`;

  }

  return result;
}