const NAME_KEY = "jeopardy-buzzer-name-v1";
const TEAM_KEY = "jeopardy-buzzer-team-v1";

let socket = null;
let clientId = "";
let registered = false;
let hostState = { title: "Buzzer", teams: [] };
let buzzerOpen = false;
let reconnectTimer = null;

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  $("#playerName").value = localStorage.getItem(NAME_KEY) || "";
  $("#playerTeam").value = localStorage.getItem(TEAM_KEY) || "";
  $("#playerForm").addEventListener("submit", registerPlayer);
  $("#playerName").addEventListener("input", updatePlayer);
  $("#playerTeam").addEventListener("change", updatePlayer);
  $("#buzzButton").addEventListener("click", buzz);
  connect();
});

function connect() {
  clearTimeout(reconnectTimer);
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocol}://${location.host}/ws`);

  socket.addEventListener("open", () => {
    setStatus("ok", "Conectado");
    if ($("#playerName").value.trim()) registerPlayer(new Event("submit"));
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "welcome") {
      clientId = message.clientId;
      $("#mobileRoom").textContent = message.roomCode || "----";
      hostState = message.hostState || hostState;
      buzzerOpen = Boolean(message.buzzerOpen);
      renderHostState();
      renderBuzzState(message.buzzes || []);
    }
    if (message.type === "registered") {
      registered = true;
      clientId = message.clientId || clientId;
      hostState = message.hostState || hostState;
      buzzerOpen = Boolean(message.buzzerOpen);
      renderHostState();
      renderBuzzState(message.buzzes || []);
    }
    if (message.type === "host-state") {
      hostState = message.hostState || hostState;
      renderHostState();
    }
    if (message.type === "buzz") {
      if (message.buzz?.playerId === clientId) {
        $("#buzzMessage").textContent = `Entraste #${message.buzz.rank}`;
        $("#buzzButton").className = "buzz-button sent";
        navigator.vibrate?.([80, 40, 80]);
      } else {
        $("#buzzMessage").textContent = `${message.buzz?.name || "Otro jugador"} entro primero`;
      }
    }
    if (message.type === "buzzes") {
      buzzerOpen = Boolean(message.buzzerOpen);
      renderBuzzState(message.buzzes || []);
    }
    if (message.type === "buzzer-status") {
      buzzerOpen = Boolean(message.buzzerOpen);
      renderBuzzState([]);
    }
    if (message.type === "buzz-rejected") {
      $("#buzzMessage").textContent = message.reason === "duplicate" ? "Ya entraste" : "Buzzer cerrado";
      navigator.vibrate?.(120);
      renderBuzzState(message.buzzes || []);
    }
  });

  socket.addEventListener("close", () => {
    setStatus("off", "Sin conexion");
    $("#buzzButton").disabled = true;
    reconnectTimer = setTimeout(connect, 1200);
  });

  socket.addEventListener("error", () => setStatus("off", "Sin conexion"));
}

function registerPlayer(event) {
  event.preventDefault();
  const name = $("#playerName").value.trim();
  if (!name || socket?.readyState !== WebSocket.OPEN) return;
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(TEAM_KEY, $("#playerTeam").value);
  socket.send(JSON.stringify({
    type: "register-player",
    name,
    teamId: $("#playerTeam").value
  }));
}

function updatePlayer() {
  if (!registered || socket?.readyState !== WebSocket.OPEN) return;
  localStorage.setItem(NAME_KEY, $("#playerName").value.trim());
  localStorage.setItem(TEAM_KEY, $("#playerTeam").value);
  socket.send(JSON.stringify({
    type: "update-player",
    name: $("#playerName").value.trim(),
    teamId: $("#playerTeam").value
  }));
}

function buzz() {
  if (!registered || !buzzerOpen || socket?.readyState !== WebSocket.OPEN) return;
  $("#buzzButton").disabled = true;
  $("#buzzButton").className = "buzz-button sent";
  $("#buzzMessage").textContent = "Enviado";
  socket.send(JSON.stringify({ type: "buzz" }));
}

function renderHostState() {
  $("#mobileTitle").textContent = hostState.title || "Buzzer";
  const select = $("#playerTeam");
  const current = select.value || localStorage.getItem(TEAM_KEY) || "";
  select.innerHTML = "";
  select.add(new Option("Sin equipo", ""));
  for (const team of hostState.teams || []) {
    select.add(new Option(team.name, team.id));
  }
  select.value = [...select.options].some((option) => option.value === current) ? current : "";
}

function renderBuzzState(activeBuzzes) {
  const ownBuzz = activeBuzzes.find((buzz) => buzz.playerId === clientId);
  const hasName = Boolean($("#playerName").value.trim());
  $("#buzzButton").disabled = !registered || !hasName || !buzzerOpen || Boolean(ownBuzz);
  $("#buzzButton").className = `buzz-button${buzzerOpen && registered ? " ready" : ""}${ownBuzz ? " sent" : ""}`;

  if (!registered) {
    $("#buzzMessage").textContent = "Ingresa tu nombre";
  } else if (ownBuzz) {
    $("#buzzMessage").textContent = `Entraste #${ownBuzz.rank}`;
  } else if (activeBuzzes.length) {
    $("#buzzMessage").textContent = `${activeBuzzes[0].name} entro primero`;
  } else {
    $("#buzzMessage").textContent = buzzerOpen ? "Listo" : "Buzzer cerrado";
  }
}

function setStatus(kind, text) {
  const status = $("#mobileStatus");
  status.className = `status-pill status-${kind}`;
  status.textContent = text;
}
