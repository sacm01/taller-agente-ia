import { useEffect, useState } from "react";

export default function Home() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function cargarHistorial() {
      const respuesta = await fetch("/api/mensajes");
      const { data } = await respuesta.json();
      if (data) setChat(data);
    }
    cargarHistorial();
  }, []);

  async function enviarMensaje() {
    if (!input.trim()) return;

    const nuevoMensaje = { usuario: "Sergio", mensaje: input, tipo: "usuario" };
    setChat([...chat, nuevoMensaje]);
    setInput("");
    setLoading(true);

    await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoMensaje),
    });

    const respuesta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta: nuevoMensaje.mensaje }),
    });

    const data = await respuesta.json();
    if (data.candidates && data.candidates.length > 0) {
      const textoIA = data.candidates[0].content.parts[0].text;
      const mensajeIA = { usuario: "IA", mensaje: textoIA, tipo: "ia" };
      setChat((prev) => [...prev, mensajeIA]);

      await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensajeIA),
      });
    } else {
      setChat((prev) => [...prev, { usuario: "IA", mensaje: "Error en la respuesta", tipo: "ia" }]);
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>Agente Inteligente</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "300px" }}>
        {chat.map((msg, i) => (
          <div key={i} style={{
            background: msg.tipo === "usuario" ? "#3498db" : "#bdc3c7",
            color: msg.tipo === "usuario" ? "white" : "#2c3e50",
            padding: "8px",
            borderRadius: "10px",
            margin: "5px 0",
            textAlign: msg.tipo === "usuario" ? "right" : "left"
          }}>
            {msg.mensaje}
          </div>
        ))}
        {loading && <div>Pensando...</div>}
      </div>
      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          placeholder="Escribe tu mensaje..."
        />
        <button onClick={enviarMensaje} style={{ marginLeft: "5px", padding: "8px" }}>
          Enviar
        </button>
      </div>
    </div>
  );
}
