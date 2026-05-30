export async function askAI(prompt) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mensagem: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro IA:", data);
      return "O silêncio pesa sobre Eldrakar, como se alguma força impedisse a voz do mestre.";
    }

    return data.texto || "O mestre permaneceu em silêncio.";

  } catch (error) {
    console.error("Erro crítico IA:", error);
    return "A névoa engole as palavras, e por um momento o destino se cala.";
  }
}