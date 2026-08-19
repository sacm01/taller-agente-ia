const input = document.getElementById("input");
const enviarBtn = document.getElementById("enviarBtn");
const chatBox = document.getElementById("chat-box");

let intentos = 0;

// Habilitar botón solo si hay texto
input.addEventListener("input", () => {
  enviarBtn.disabled = input.value.trim() === "";
});

enviarBtn.addEventListener("click", enviarMensaje);

function agregarMensaje(texto, tipo) {
  const mensaje = document.createElement("div");
  mensaje.className = `mensaje ${tipo}`;
  mensaje.innerText = texto;
  chatBox.appendChild(mensaje);
  chatBox.scrollTop = chatBox.scrollHeight; // auto-scroll
}

// Enviar mensaje del usuario y consultar IA
async function enviarMensaje() {
  const pregunta = input.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, "usuario");

  input.value = "";
  enviarBtn.disabled = true;

  // Guardar mensaje en Supabase vía backend
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

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const data = await respuesta.json();

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
    agregarMensaje(`pensando... (error temporal, intento ${intentos})`, "ia");
    setTimeout(enviarMensaje, 5000);
  }
}

// Al cargar la página, recuperar historial desde Supabase
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
