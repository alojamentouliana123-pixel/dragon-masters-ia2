export function renderGameButtons({
  state,
  encounter,
  onAction
}) {
  const container = document.getElementById("container-botoes");
  if (!container) return;

  container.innerHTML = "";

  if (state === "MORTO") {
    createButton(container, "Reviver 🔥", "reviver", onAction);
    return;
  }

  if (state === "COMBATE" && encounter) {
    createButton(container, "Atacar ⚔️", "atacar", onAction);
    createButton(container, "Fugir 🏃", "fugir", onAction);
    return;
  }

  if (state === "DESCANSANDO") {
    createButton(container, "Levantar e seguir viagem 🧍", "levantar", onAction);
    return;
  }

  createButton(container, "Avançar pela estrada 🚶", "avancar", onAction);
  createButton(container, "Montar acampamento ⛺", "acampar", onAction);
}

function createButton(parent, text, action, onAction) {
  const btn = document.createElement("button");
  btn.className = "btn-dinamico-rpg";
  btn.innerText = text;
  btn.onclick = () => onAction(action);
  parent.appendChild(btn);
}

export function blockGameControls(blocked) {
  document.querySelectorAll(".btn-dinamico-rpg").forEach(btn => {
    btn.disabled = blocked;
  });

  const sendBtn = document.getElementById("sendBtn");
  const playerInput = document.getElementById("playerInput");

  if (sendBtn) sendBtn.disabled = blocked;
  if (playerInput) playerInput.disabled = blocked;
}
