const NAME_KEY = "jeopardy-buzzer-name-v1";
const TEAM_KEY = "jeopardy-buzzer-team-v1";

let socket = null;
let clientId = "";
let registered = false;
let hostState = { title: "Buzzer", teams: [] };
let buzzerOpen = false;
let reconnectTimer = null;
let currentBuzzes = [];

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  $("#playerName").value = localStorage.getItem(NAME_KEY) || "";
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
      if ($("#playerName").value.trim() && $("#playerTeam").value) registerPlayer();
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
      renderBuzzState(currentBuzzes);
    }
    if (message.type === "buzz-rejected") {
      $("#buzzMessage").textContent = message.reason === "duplicate"
        ? "Ya entraste"
        : message.reason === "team-required"
          ? "Selecciona un equipo"
          : "Buzzer cerrado";
      navigator.vibrate?.(120);
      renderBuzzState(message.buzzes || []);
    }
    if (message.type === "registration-rejected") {
      registered = false;
      $("#buzzMessage").textContent = "Selecciona un equipo para entrar";
      $("#playerTeam").focus();
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
  event?.preventDefault();
  const name = $("#playerName").value.trim();
  const teamId = $("#playerTeam").value;
  if (!name || !teamId || !isKnownTeam(teamId) || socket?.readyState !== WebSocket.OPEN) {
    if (name && !teamId) {
      $("#buzzMessage").textContent = "Selecciona un equipo para entrar";
      $("#playerTeam").focus();
    }
    return;
  }
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(TEAM_KEY, teamId);
  socket.send(JSON.stringify({
    type: "register-player",
    name,
    teamId
  }));
}

function updatePlayer() {
  const name = $("#playerName").value.trim();
  const teamId = $("#playerTeam").value;
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(TEAM_KEY, teamId);
  if (!registered || socket?.readyState !== WebSocket.OPEN) {
    renderBuzzState(currentBuzzes);
    return;
  }
  if (!isKnownTeam(teamId)) {
    registered = false;
    renderBuzzState(currentBuzzes);
    return;
  }
  socket.send(JSON.stringify({
    type: "update-player",
    name,
    teamId
  }));
}

function buzz() {
  if (!registered || !isKnownTeam($("#playerTeam").value) || !buzzerOpen || socket?.readyState !== WebSocket.OPEN) return;
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
  const placeholder = new Option("Selecciona un equipo", "");
  placeholder.disabled = true;
  select.add(placeholder);
  for (const team of hostState.teams || []) {
    select.add(new Option(team.name, team.id));
  }
  select.value = isKnownTeam(current) ? current : "";
  if (registered && !select.value) registered = false;
}

function renderBuzzState(activeBuzzes) {
  currentBuzzes = activeBuzzes;
  const ownBuzz = activeBuzzes.find((buzz) => buzz.playerId === clientId);
  const hasName = Boolean($("#playerName").value.trim());
  const hasTeam = isKnownTeam($("#playerTeam").value);
  $("#buzzButton").disabled = !registered || !hasName || !hasTeam || !buzzerOpen || Boolean(ownBuzz);
  $("#buzzButton").className = `buzz-button${buzzerOpen && registered && hasTeam ? " ready" : ""}${ownBuzz ? " sent" : ""}`;

  if (!hasName) {
    $("#buzzMessage").textContent = "Ingresa tu nombre";
  } else if (!hasTeam) {
    $("#buzzMessage").textContent = "Selecciona un equipo";
  } else if (!registered) {
    $("#buzzMessage").textContent = "Pulsa Entrar";
  } else if (ownBuzz) {
    $("#buzzMessage").textContent = `Entraste #${ownBuzz.rank}`;
  } else if (activeBuzzes.length) {
    $("#buzzMessage").textContent = `${activeBuzzes[0].name} entro primero`;
  } else {
    $("#buzzMessage").textContent = buzzerOpen ? "Listo" : "Buzzer cerrado";
  }
}

function isKnownTeam(teamId) {
  return Boolean(teamId && (hostState.teams || []).some((team) => team.id === teamId));
}

function setStatus(kind, text) {
  const status = $("#mobileStatus");
  status.className = `status-pill status-${kind}`;
  status.textContent = text;
}
