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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

Seu trabalho é continuar a história como se estivesse narrando uma cena de livro.

Estilo:
- Conte como uma história acontecendo agora.
- Descreva o ambiente, sensação e consequência da ação.
- Não seja seco.
- Não fale como sistema de jogo.
- Não use lista.
- Não diga "você escolheu".
- Não explique regras.
- Use 1 a 2 parágrafos curtos.
- Tom sombrio, misterioso e medieval.

Importante:
- Se o jogador andar, narre apenas o caminho.
- Se explorar, narre apenas o que ele percebe.
- Se acampar, narre a preparação e o clima.
- Se houver perigo, crie tensão sem revelar tudo de uma vez.
- NÃO repita nome de monstro.
- NÃO escreva "monstro apareceu".
- NÃO escreva mensagens de sistema.
- NÃO diga que algo está diante do jogador.
- O jogo já mostra o monstro separado na interface.
- Foque só na cena, no ambiente e na sensação.

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
