export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: "Mensagem vazia" });
    }

    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                 text: `
Você é um mestre narrador de RPG de fantasia sombria.

Mundo:
Eldrakar.

Sua função:
Narrar SOMENTE a cena atual do jogador.

Regras obrigatórias:
- Responda com no máximo 2 frases.
- Não use mais de 1 parágrafo.
- Não continue texto anterior.
- Não escreva histórico.
- Não explique regras.
- Não cite turno.
- Não cite HP, mana, XP, ouro ou loot.
- Não repita nome do monstro várias vezes.
- Se houver monstro, apenas crie tensão na cena.
- Se não houver monstro, narre ambiente e sensação.

Estilo:
Sombrio, medieval, misterioso e direto.

Ação do jogador:
${mensagem}
`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro Gemini:", data);
      return res.status(resposta.status).json({
        error: "Erro Gemini",
        detalhe: data
      });
    }

    return res.status(200).json({
      texto:
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "O mestre permaneceu em silêncio."
    });

  } catch (erro) {
    console.error("Erro interno IA:", erro);

    return res.status(500).json({
      error: "Erro interno na IA",
      detalhe: erro.message
    });
  }
}
