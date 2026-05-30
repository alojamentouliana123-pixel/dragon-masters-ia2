import { askAI } from "./openai.js";
import { processCombatAction } from "./game-brain/combat-engine.js";
import { createWorldEncounter } from "./game-brain/encounter-engine.js";

import {
  createDefaultCharacter,
  normalizeHpMana
} from "./game-brain/character-engine.js";
function normalizarAcao(acao) {
  if (typeof acao === "string") return { type: acao, skill: null };
  return {
    type: acao?.type || "desconhecida",
    skill: acao?.skill || null
  };
}

function getAliveMonster(encounter) {
  return encounter?.monsters?.find(monster => (monster.hp || 0) > 0) || null;
}

function getMonsterName(monster) {
  return monster?.nome || monster?.name || "Criatura desconhecida";
}

function getMonsterMaxHp(monster) {
  return monster?.maxHp || monster?.vidaMax || monster?.vida || monster?.hp || 1;
}

function limparRelatorio(text = "") {
  return String(text)
    .replace(/\[SISTEMA:/g, "")
    .replace(/\]/g, "")
    .trim();
}

async function narrarComIA({ action, state, character, location, scene, turn, encounter }) {
  const monster = getAliveMonster(encounter);

  const contexto = {
    acao: action,
    estado: state,
    local: location,
    cenaAtual: scene,
    turno: turn,
    jogador: {
      nome: character.characterName || character.nome || "Herói",
      classe: character.className || character.classe || "Sem classe",
      level: character.level || 1,
      hp: character.hp,
      maxHp: character.maxHp,
      mana: character.mana,
      maxMana: character.maxMana
    },
    monstro: monster
      ? {
          nome: getMonsterName(monster),
          hp: monster.hp,
          maxHp: getMonsterMaxHp(monster),
          nivel: monster.nivel || monster.level || 1,
          tier: monster.tier || "T1",
          tipo: monster.tipo || monster.race || "criatura"
        }
      : null
  };

  const prompt = `
Você é o narrador do RPG Eldrakar.

Use este contexto:
${JSON.stringify(contexto, null, 2)}

Regras:
- Narre em português.
- Seja curto, sombrio e imersivo.
- Não calcule dano.
- Não dê XP.
- Não dê loot.
- Não altere HP, mana ou ouro.
- Se houver monstro, apenas apresente a ameaça.
- Se não houver monstro, narre ambiente, tensão, pista ou movimento.
`;

  return await askAI(prompt);
}

function criarNarrativaSistema({ action, report, state, encounter, character, turn }) {
  const monster = getAliveMonster(encounter);
  const cleanReport = limparRelatorio(report);

  if (state === "MORTO") {
    return `${cleanReport}

☠️ Você caiu em batalha.

Sua visão escurece, seus joelhos cedem e o som da chuva desaparece aos poucos.

Turno ${turn}.`;
  }

  if (action === "reviver") {
    return `🔥 Você desperta novamente.

HP atual: ${character.hp}/${character.maxHp || 100}
Mana atual: ${character.mana}/${character.maxMana || 50}

Turno ${turn}.`;
  }

  if (state === "COMBATE" && monster) {
    return `${cleanReport}

⚔️ ${getMonsterName(monster)} está diante de você.
HP do inimigo: ${monster.hp}/${getMonsterMaxHp(monster)}

Seu HP: ${character.hp}/${character.maxHp || 100}
Turno ${turn}.`;
  }

  if (action === "acampar") {
    return `Você monta acampamento em meio à escuridão.

A fogueira estala baixo enquanto o mundo observa em silêncio.

Turno ${turn}.`;
  }

  if (action === "levantar") {
    return `Você se levanta após descansar.

HP atual: ${character.hp}/${character.maxHp || 100}
Mana atual: ${character.mana}/${character.maxMana || 50}
Turno ${turn}.`;
  }

  return `${cleanReport || "A ação foi realizada."}

Turno ${turn}.`;
}

export const GameBrain = {
  estadoAtual: "EXPLORANDO",
  character: null,
  encontroAtivo: null,
  turnoAtual: 1,

  location: "Pântano Sombrio",
  scene: "Você está em um pântano escuro sob chuva lenta.",

  onNarrativaGerada: null,
  onStatusUpdate: null,

  init(characterData, callbacks = {}) {
    this.character = characterData || {};
    this.onNarrativaGerada = callbacks.onNarrativaGerada || null;
    this.onStatusUpdate = callbacks.onStatusUpdate || null;

 this.turnoAtual = 1;
this.estadoAtual = "EXPLORANDO";
this.encontroAtivo = null;

this.normalizarPersonagem();
},

normalizarPersonagem() {
  this.character = createDefaultCharacter(this.character || {});
  normalizeHpMana(this.character);
},

async processarAcaoMecanica(acaoRecebida) {
  const acaoObj = normalizarAcao(acaoRecebida);
  const tipoAcao = acaoObj.type;

  let relatorioMecanico = "";
  let narrativaFinal = "";

  try {
    this.normalizarPersonagem();

      if (this.estadoAtual === "MORTO") {
        if (tipoAcao === "reviver") {
          this.character.hp = Math.max(1, Math.floor((this.character.maxHp || 100) * 0.5));
          this.character.mana = Math.floor((this.character.maxMana || 50) * 0.5);
          this.encontroAtivo = null;
          this.estadoAtual = "EXPLORANDO";
          relatorioMecanico = "Você reviveu com metade da vida e da mana.";
        } else {
          relatorioMecanico = "Você está caído e precisa reviver antes de agir.";
        }
      }

     else if (this.estadoAtual === "COMBATE" && this.encontroAtivo) {
  const result = processCombatAction({
    action: tipoAcao,
    skill: acaoObj.skill,
    character: this.character,
    encounter: this.encontroAtivo
  });

  this.character = result.character;
  this.encontroAtivo = result.encounter;
  this.estadoAtual = result.nextState;
  relatorioMecanico = result.report;

  if ((this.character.hp || 0) <= 0) {
    this.character.hp = 0;

    if (this.character.inventory?.length) {
      const perder = Math.floor(this.character.inventory.length / 2);

      for (let i = 0; i < perder; i++) {
        if (!this.character.inventory.length) break;

        const idx = Math.floor(Math.random() * this.character.inventory.length);
        this.character.inventory.splice(idx, 1);
      }
    }

    if (this.character.equipment) {
      Object.keys(this.character.equipment).forEach(slot => {
        const item = this.character.equipment[slot];
        if (!item) return;

        if (Math.random() < 0.35) {
          this.character.equipment[slot] = null;
        }
      });
    }

    this.estadoAtual = "MORTO";
    this.encontroAtivo = null;
  }

     }

      else if (this.estadoAtual === "EXPLORANDO")  {
        if (tipoAcao === "andar" || tipoAcao === "avancar") {
          relatorioMecanico = "Você segue adiante.";

         const hpPct =
  (this.character.hp || 0) /
  (this.character.maxHp || 100);

let chanceMonstro = 0.25;

if (hpPct < 0.50) chanceMonstro += 0.10;
if (hpPct < 0.25) chanceMonstro += 0.15;

const roll = Math.random();

if (roll < chanceMonstro) {
            const encounter = createWorldEncounter({
              character: this.character,
              place: "pantano_sombrio",
              bioma: "swamp",
              maxTier: "T1"
            });

            this.encontroAtivo = encounter;
            this.estadoAtual = "COMBATE";

            const monster = getAliveMonster(encounter) || encounter.monsters?.[0];

            relatorioMecanico = `Um inimigo apareceu.
Monstro: ${getMonsterName(monster)}
HP: ${monster?.hp || 30}/${getMonsterMaxHp(monster)}`;
          }

          narrativaFinal = await narrarComIA({
            action: "andar",
            state: this.estadoAtual,
            character: this.character,
            location: this.location,
            scene: this.scene,
            turn: this.turnoAtual,
            encounter: this.encontroAtivo
          });
        }

        else if (tipoAcao === "explorar") {
          relatorioMecanico = "Você examina o ambiente com atenção.";

          if (Math.random() < 0.20) {

  this.character.inventory =
    this.character.inventory || [];

  const item = {
    id: "maca_silvestre",
    nome: "Maçã Silvestre",
    tipo: "comida",
    tier: "T1",
    cura: 10,
    valor: 5
  };

  this.character.inventory.push(item);

  relatorioMecanico +=
    "\nVocê encontrou uma Maçã Silvestre.";
}


          const roll = Math.random();

          if (roll < 0.40) {
            const encounter = createWorldEncounter({
              character: this.character,
              place: "pantano_sombrio",
              bioma: "swamp",
              maxTier: "T1"
            });

            this.encontroAtivo = encounter;
            this.estadoAtual = "COMBATE";

            const monster = getAliveMonster(encounter) || encounter.monsters?.[0];

            relatorioMecanico = `Durante a exploração, uma ameaça surgiu.
Monstro: ${getMonsterName(monster)}
HP: ${monster?.hp || 30}/${getMonsterMaxHp(monster)}`;
          }

          narrativaFinal = await narrarComIA({
            action: "explorar",
            state: this.estadoAtual,
            character: this.character,
            location: this.location,
            scene: this.scene,
            turn: this.turnoAtual,
            encounter: this.encontroAtivo
          });
        }

        else if (tipoAcao === "acampar") {

  if (Math.random() < 0.15) {

    const encounter =
      createWorldEncounter({
        character: this.character,
        place: "pantano_sombrio",
        bioma: "swamp",
        maxTier: "T1"
      });

    this.encontroAtivo = encounter;
    this.estadoAtual = "COMBATE";

    const monster =
      getAliveMonster(encounter);

    relatorioMecanico =
      `Seu acampamento foi atacado!

Monstro: ${getMonsterName(monster)}`;
  }

  else {

    this.estadoAtual = "DESCANSANDO";

    relatorioMecanico =
      "Você montou acampamento para descansar.";
  }
}

        else if (tipoAcao === "skill") {
          relatorioMecanico = "Não há inimigo para usar essa habilidade agora.";
        }
      }

      else if (this.estadoAtual === "DESCANSANDO") {
        if (tipoAcao === "levantar") {
          const maxHp = this.character.maxHp || 100;
          const maxMana = this.character.maxMana || 50;

          this.character.hp = Math.min(maxHp, (this.character.hp || 0) + 25);
          this.character.mana = Math.min(maxMana, (this.character.mana || 0) + 15);
          this.estadoAtual = "EXPLORANDO";

          relatorioMecanico = `Você descansou.
Recuperou +25 HP e +15 Mana.
Voltou para exploração.`;
        } else {
          relatorioMecanico = "Você ainda está descansando.";
        }
      }

      this.turnoAtual++;

      if (!narrativaFinal) {
        narrativaFinal = criarNarrativaSistema({
          action: tipoAcao,
          report: relatorioMecanico,
          state: this.estadoAtual,
          encounter: this.encontroAtivo,
          character: this.character,
          turn: this.turnoAtual
        });
      } else {
        narrativaFinal += `

${criarNarrativaSistema({
          action: tipoAcao,
          report: relatorioMecanico,
          state: this.estadoAtual,
          encounter: this.encontroAtivo,
          character: this.character,
          turn: this.turnoAtual
        })}`;
      }

      this.scene = narrativaFinal;

      if (this.onNarrativaGerada) {
        await this.onNarrativaGerada(narrativaFinal);
      }

      if (this.onStatusUpdate) {
        await this.onStatusUpdate(this.character);
      }

    } catch (error) {
      console.error("Erro no GameBrain:", error);

      if (this.onNarrativaGerada) {
        await this.onNarrativaGerada("Algo deu errado no sistema do jogo. Verifique o console.");
      }
    }
  }
};