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
  if (statusText) statusText.textContent = msg;
}

async function savePlayer(user, chosenName = "", options = {}) {
  const { forceLobby = false } = options;

  const name =
    chosenName ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "Jogador";

  try {
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

    if (forceLobby) {
      window.location.href = "./lobby.html";
      return;
    }

    const charRef = doc(db, "players", user.uid, "characters", "main");
    const charSnap = await getDoc(charRef);

    if (charSnap.exists()) {
      window.location.href = "./world.html";
    } else {
      window.location.href = "./lobby.html";
    }

  } catch (error) {
    console.error("Erro ao salvar dados do jogador:", error);
    status("Erro ao carregar o seu perfil.");
  }
}

getRedirectResult(auth)
  .then(async (result) => {
    if (result?.user) {
      status("Conectado com Google! Carregando...");
      await savePlayer(result.user);
    }
  })
  .catch((error) => {
    console.error("Erro no retorno do Google:", error);
    status("Erro ao autenticar com o Google.");
  });

const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    status("Redirecionando para o Google...");
    signInWithRedirect(auth, googleProvider);
  });
}

const emailRegisterBtn = document.getElementById("emailRegisterBtn");
if (emailRegisterBtn) {
  emailRegisterBtn.addEventListener("click", async () => {
    const name = playerNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
      return status("Preencha nome, email e senha para cadastrar.");
    }

    try {
      status("Criando conta...");
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await savePlayer(result.user, name, {
        forceLobby: true
      });

    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      if (error.code === "auth/email-already-in-use") {
        status("Esse email já está cadastrado. Tente entrar em vez de criar conta.");
      } else if (error.code === "auth/weak-password") {
        status("A senha precisa ter no mínimo 6 caracteres.");
      } else {
        status("Erro ao cadastrar. Confira os dados e tente novamente.");
      }
    }
  });
}

const emailLoginBtn = document.getElementById("emailLoginBtn");
if (emailLoginBtn) {
  emailLoginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      return status("Digite o seu email e senha para entrar.");
    }

    try {
      status("Entrando...");
      const result = await signInWithEmailAndPassword(auth, email, password);
      await savePlayer(result.user);

    } catch (error) {
      console.error("Erro ao entrar:", error);
      status("Erro ao entrar. Confira seu email e senha.");
    }
  });
}

const guestLoginBtn = document.getElementById("guestLoginBtn");
if (guestLoginBtn) {
  guestLoginBtn.addEventListener("click", async () => {
    const name = guestNameInput.value.trim();

    if (!name) {
      return status("Digite um nome para a Entrada Rápida.");
    }

    try {
      status("Entrando no modo rápido...");
      const result = await signInAnonymously(auth);

      await savePlayer(result.user, name, {
        forceLobby: true
      });

    } catch (error) {
      console.error("Erro na entrada rápida:", error);
      status("Erro ao realizar a entrada rápida.");
    }
  });
}