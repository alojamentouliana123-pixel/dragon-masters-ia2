const GEMINI_API_KEY =
  "AIzaSyDIFOKgBxxF8TtCr6DpevrJND7yLxsNK4U";

export async function askAI(prompt) {

  try {

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {

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
Você é um mestre de RPG sombrio e imersivo.

Mundo:
Eldrakar.

Seu trabalho:
Narrar ações dos jogadores.

Responda:
- curto
- cinematográfico
- misterioso
- imersivo

Jogador:
${prompt}
`
              }
            ]
          }
        ]

      })

    });

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Erro Gemini:",
        errorText
      );

      return `⚠️ Erro no servidor IA (${response.status})`;
    }

    const data =
      await response.json();

    console.log(
      "Gemini respondeu:",
      data
    );

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {

      return data
        .candidates[0]
        .content.parts[0]
        .text;
    }

    return "⚠️ O mestre permaneceu em silêncio.";

  } catch (error) {

    console.error(
      "Erro crítico:",
      error
    );

    return "⚠️ A IA falhou.";
  }

}