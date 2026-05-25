import { askAI } from "./openai.js";

// Função exemplo que roda quando o jogador envia uma mensagem ou faz uma ação
async function enviarMensagemAoMestre(mensagemDoJogador) {
  try {
    // 1. Envia a pergunta para a IA e aguarda a resposta
    const respostaMestre = await askAI(mensagemDoJogador);
    console.log("O mestre do RPG respondeu com sucesso!");

    // 2. Procura o container correto do teu HTML pelo ID 'storyLog'
    const storyLog = document.getElementById("storyLog");

    if (storyLog) {
      // 3. Cria a nova div para a mensagem do Mestre
      const novaMensagem = document.createElement("div");
      
      // Adiciona as classes CSS para ficar com o estilo do mestre
      novaMensagem.classList.add("story-message", "master"); 
      
      // Insere o texto gerado pela IA
      novaMensagem.innerText = respostaMestre;
      
      // 4. Coloca a nova div dentro do storyLog no HTML
      storyLog.appendChild(novaMensagem);
      
      // Faz o scroll rolar para baixo automaticamente para mostrar o texto novo
      storyLog.scrollTop = storyLog.scrollHeight;
      
    } else {
      console.error("Erro: O elemento id='storyLog' não foi encontrado no teu HTML!");
    }

  } catch (error) {
    console.error("Erro ao processar a ação no chat:", error);
  }
}