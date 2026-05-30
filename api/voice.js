export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: "Texto vazio" });
    }

    const voiceId = "21m00Tcm4TlvDq8ikWAM";

    const resposta = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: texto,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.45,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.text();
      return res.status(resposta.status).json({ error: erro });
    }

    const audioBuffer = await resposta.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (erro) {
    return res.status(500).json({
      error: "Erro ao gerar voz",
      detalhe: erro.message
    });
  }
}