const input = document.getElementById("input");
const enviarBtn = document.getElementById("enviarBtn");
const chatBox = document.getElementById("chat-box");

let intentos = 0;

input.addEventListener("input", () => {
  enviarBtn.disabled = input.value.trim() === "";
});

enviarBtn.addEventListener("click", enviarMensaje);

function agregarMensaje(texto, tipo) {
  const mensaje = document.createElement("div");
  mensaje.className = `mensaje ${tipo}`;
  mensaje.innerText = texto;
  chatBox.appendChild(mensaje);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function enviarMensaje() {
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, "usuario");

  input.value = "";
  enviarBtn.disabled = true;

  await fetch("/api/mensajes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: "Sergio", mensaje: pregunta, tipo: "usuario" })
  });

  intentos++;
  agregarMensaje(`pensando... (intento ${intentos})`, "ia");

  try {
    const respuesta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta })
    });

    const data = await respuesta.json();

    if (data.error) {
      agregarMensaje(`Error: ${data.error}`, "ia");
      return;
    }

    if (data.candidates && data.candidates.length > 0) {
      const textoIA = data.candidates[0].content.parts[0].text;
      agregarMensaje(textoIA, "ia");

      await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: "IA", mensaje: textoIA, tipo: "ia" })
      });

      intentos = 0;
    } else {
      agregarMensaje("No se recibió respuesta del modelo.", "ia");
    }
  } catch (error) {
    agregarMensaje(`Error de conexión: ${error.message}`, "ia");
    setTimeout(enviarMensaje, 5000);
  }
}

async function cargarHistorial() {
  const respuesta = await fetch("/api/mensajes");
  const { data } = await respuesta.json();

  if (data && data.length > 0) {
    data.forEach(msg => {
      agregarMensaje(msg.mensaje, msg.tipo);
    });
  }
}

cargarHistorial();
