export default async function handler(req, res) {
  const { pregunta } = req.body;

  try {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: pregunta }]}]
        })
      }
    );

    if (!respuesta.ok) {
      // Manejo de errores comunes
      if (respuesta.status === 404) {
        return res.status(404).json({ error: "Modelo no encontrado. Usa gemini-1.5-flash o gemini-1.5-pro." });
      }
      if (respuesta.status === 429) {
        return res.status(429).json({ error: "Límite de peticiones alcanzado. Intenta de nuevo en unos segundos." });
      }
      if (respuesta.status === 503) {
        return res.status(503).json({ error: "Servicio temporalmente no disponible. Reintenta más tarde." });
      }
      return res.status(respuesta.status).json({ error: "Error en la API de Gemini." });
    }

    const data = await respuesta.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
