import MONSTERS_DATA from "../../assets/data/monstros_com_loot.json" assert { type: "json" };
import { gerarRecompensaMissao, aplicarReward } from "./reward-engine.js";

const MONSTERS = MONSTERS_DATA.monstros || [];

function randomItem(list = []) {
  if (!list.length) return null;
  return structuredClone(list[Math.floor(Math.random() * list.length)]);
}

function getTierNumber(tier = "T1") {
  const found = String(tier).match(/\d+/);
  return found ? Number(found[0]) : 1;
}

function getMonstersByTier(maxTier) {
  return MONSTERS.filter(monster =>
    getTierNumber(monster.tier) <= maxTier
  );
}

function pickTargetMonster(maxTier) {
  return randomItem(getMonstersByTier(maxTier));
}

export function criarMissoesSolo() {
  const missions = [];

  for (let i = 1; i <= 50; i++) {
    const difficulty = Math.ceil(i / 5);
    const maxTier = Math.min(7, Math.ceil(i / 8));

    if (i % 3 === 1) {
      missions.push({
        id: `missao_matar_${i}`,
        nome: `Caçada ${i}`,
        tipo: "kill",
        descricao: `Mate ${3 + difficulty} monstros.`,
        alvo: null,
        necessario: 3 + difficulty,
        progresso: 0,
        dificuldade: difficulty,
        completa: false,
        coletada: false
      });
    }

    else if (i % 3 === 2) {
      missions.push({
        id: `missao_sobreviver_${i}`,
        nome: `Sobreviva à Noite ${i}`,
        tipo: "survive_turns",
        descricao: `Sobreviva ${8 + difficulty * 2} turnos sem morrer.`,
        necessario: 8 + difficulty * 2,
        progresso: 0,
        dificuldade: difficulty,
        completa: false,
        coletada: false
      });
    }

    else {
      const monster = pickTargetMonster(maxTier);

      missions.push({
        id: `missao_alvo_${i}`,
        nome: `Alvo Isolado ${i}`,
        tipo: "kill_specific",
        descricao: `Derrote ${monster?.nome || "um monstro isolado"}.`,
        monsterId: monster?.id || null,
        monsterName: monster?.nome || "Monstro isolado",
        necessario: 1,
        progresso: 0,
        dificuldade: difficulty + 1,
        completa: false,
        coletada: false
      });
    }
  }

  return missions;
}

export function garantirMissoes(character) {
  if (!character.missions || !Array.isArray(character.missions)) {
    character.missions = criarMissoesSolo();
  }

  return character.missions;
}

export function registrarTurnoSobrevivido(character) {
  const missions = garantirMissoes(character);

  for (const mission of missions) {
    if (mission.completa || mission.tipo !== "survive_turns") continue;

    mission.progresso++;

    if (mission.progresso >= mission.necessario) {
      mission.completa = true;
    }
  }
}

export function registrarMonstroMorto(character, monster) {
  const missions = garantirMissoes(character);

  for (const mission of missions) {
    if (mission.completa) continue;

    if (mission.tipo === "kill") {
      mission.progresso++;

      if (mission.progresso >= mission.necessario) {
        mission.completa = true;
      }
    }

    if (mission.tipo === "kill_specific") {
      if (String(mission.monsterId) === String(monster.id)) {
        mission.progresso++;

        if (mission.progresso >= mission.necessario) {
          mission.completa = true;
        }
      }
    }
  }
}

export function resetarMissoesDeSobrevivenciaAoMorrer(character) {
  const missions = garantirMissoes(character);

  for (const mission of missions) {
    if (mission.tipo === "survive_turns" && !mission.completa) {
      mission.progresso = 0;
    }
  }
}

export function coletarRecompensaMissao(character, missionId) {
  const missions = garantirMissoes(character);
  const mission = missions.find(m => m.id === missionId);

  if (!mission) {
    return {
      ok: false,
      message: "Missão não encontrada."
    };
  }

  if (!mission.completa) {
    return {
      ok: false,
      message: "Missão ainda não foi concluída."
    };
  }

  if (mission.coletada) {
    return {
      ok: false,
      message: "Recompensa já coletada."
    };
  }

  const reward = gerarRecompensaMissao(mission.dificuldade || 1);

  aplicarReward(character, reward);

  mission.coletada = true;

  return {
    ok: true,
    mission,
    reward
  };
}