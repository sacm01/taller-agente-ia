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
      return res.status(respuesta.status).json({ error: `Error ${respuesta.status}` });
    }

    const data = await respuesta.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
