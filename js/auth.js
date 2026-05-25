import {
  auth, db, googleProvider,
  signInWithRedirect, getRedirectResult, signInAnonymously,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  doc, setDoc, getDoc, serverTimestamp
} from "./firebase.js";

const statusText = document.getElementById("statusText");
const playerNameInput = document.getElementById("playerName");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const guestNameInput = document.getElementById("guestName");

function status(msg) {
  statusText.textContent = msg;
}

async function savePlayer(user, chosenName = "") {
  const name = chosenName || user.displayName || user.email || "Jogador";

  await setDoc(doc(db, "players", user.uid), {
    uid: user.uid,
    accountName: name,
    email: user.email || "",
    photoURL: user.photoURL || "",
    provider: user.providerData[0]?.providerId || "anonymous",
    updatedAt: serverTimestamp()
  }, { merge: true });

  localStorage.setItem("playerUid", user.uid);
  localStorage.setItem("accountName", name);

  const charRef = doc(db, "players", user.uid, "characters", "main");
  const charSnap = await getDoc(charRef);

  if (charSnap.exists()) {
    window.location.href = "./world.html";
  } else {
    window.location.href = "./lobby.html";
  }
}

getRedirectResult(auth)
  .then(async (result) => {
    if (result?.user) {
      await savePlayer(result.user);
    }
  })
  .catch((error) => {
    console.error(error);
    status("Erro ao finalizar login Google.");
  });

document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    status("Entrando com Google...");
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error(error);
    status("Erro no Google.");
  }
});

document.getElementById("emailRegisterBtn").addEventListener("click", async () => {
  const name = playerNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    return status("Preencha nome, email e senha.");
  }

  try {
    status("Criando conta...");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await savePlayer(result.user, name);
  } catch (error) {
    console.error(error);
    status("Erro ao cadastrar. Senha precisa ter mínimo 6 caracteres.");
  }
});

document.getElementById("emailLoginBtn").addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = playerNameInput.value.trim();

  if (!email || !password) {
    return status("Digite email e senha.");
  }

  try {
    status("Entrando...");
    const result = await signInWithEmailAndPassword(auth, email, password);
    await savePlayer(result.user, name);
  } catch (error) {
    console.error(error);
    status("Erro ao entrar. Confira email e senha.");
  }
});

document.getElementById("guestLoginBtn").addEventListener("click", async () => {
  const name = guestNameInput.value.trim();

  if (!name) {
    return status("Digite um nome para entrar sem conta.");
  }

  try {
    status("Entrando sem conta...");
    const result = await signInAnonymously(auth);
    await savePlayer(result.user, name);
  } catch (error) {
    console.error(error);
    status("Erro. Confira se login Anônimo está ativado no Firebase.");
  }
});