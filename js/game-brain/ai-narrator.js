import { askAI } from "../openai.js";
import { getEncounterPromptContext } from "../regras/Monster Encounter.js";
import { getMonsterBehaviorPrompt } from "../regras/monster-behaviors.js";

export async function narrateAction({
  character,
  action,
  report,
  encounter,
  state,
  turn
}) {
  const monster = encounter?.monsters?.find(m => (m.hp || 0) > 0) || null;

  const prompt = `
Você é o narrador cinematográfico do RPG Eldrakar.

REGRA ABSOLUTA:
A IA NÃO pode inventar dano, HP, XP, gold, drop, morte, vitória ou derrota.
A IA deve apenas narrar os dados do sistema.

ESTADO:
Turno: ${turn}
Estado atual: ${state}
Ação do jogador: ${action}

JOGADOR:
Nome: ${character.characterName || character.name || character.nome || "Jogador"}
Classe: ${character.className || character.classe || "Sem classe"}
HP: ${character.hp}/${character.maxHp || 100}
Mana: ${character.mana}/${character.maxMana || 100}

DADOS MECÂNICOS:
${report}

${encounter ? getEncounterPromptContext(encounter) : ""}

${monster ? getMonsterBehaviorPrompt(monster) : ""}

Narre em português do Brasil, com clima sombrio, medieval e cinematográfico.
Não use lista.
Não invente resultado mecânico.
`;

  try {
    return await askAI(prompt);
  } catch (error) {
    console.error("Erro na IA narradora:", error);
    return report;
  }
}