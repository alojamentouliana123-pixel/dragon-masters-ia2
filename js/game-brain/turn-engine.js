import {
  canActThisTurn,
  consumeTurn,
  startNewTurn
} from "../regras/world-rules.js";

export function createTurnState() {
  return {
    turnNumber: 1,
    actionUsed: false,
    movementsThisTurn: 0,
    playersDone: []
  };
}

export function validateAction(turnState) {
  return canActThisTurn(turnState);
}

export function useTurn(actionType, turnState) {
  return consumeTurn(actionType, turnState);
}

export function nextTurn(turnState) {
  return startNewTurn(turnState);
}