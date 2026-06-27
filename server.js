const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || process.argv[2] || 3000);
const HOST = "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const ROOM_CODE = crypto.randomBytes(2).toString("hex").toUpperCase();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const clients = new Map();
const players = new Map();
let buzzes = [];
let buzzerOpen = true;
let hostState = { title: "Jeopardy Matematico", teams: [] };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/info") {
    sendJson(res, {
      roomCode: ROOM_CODE,
      port: PORT,
      lanUrls: getLanUrls(),
      buzzerPath: "/buzzer"
    });
    return;
  }

  const filePath = resolvePublicPath(url.pathname);
  if (!filePath) {
    sendText(res, 403, "Ruta no permitida");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, "No encontrado");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
});

server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "",
    ""
  ].join("\r\n"));

  const client = {
    id: crypto.randomUUID(),
    role: "guest",
    name: "",
    teamId: "",
    socket,
    buffer: Buffer.alloc(0)
  };

  clients.set(client.id, client);
  send(client, {
    type: "welcome",
    clientId: client.id,
    roomCode: ROOM_CODE,
    buzzerOpen,
    buzzes,
    hostState,
    players: getPlayers()
  });

  socket.on("data", (chunk) => handleFrameData(client, chunk));
  socket.on("close", () => removeClient(client.id));
  socket.on("error", () => removeClient(client.id));
});

server.listen(PORT, HOST, () => {
  console.log(`Jeopardy Matematico listo en http://localhost:${PORT}`);
  for (const url of getLanUrls()) {
    console.log(`Buzzer movil: ${url}/buzzer`);
  }
});

function resolvePublicPath(routePath) {
  let requested = routePath;
  if (requested === "/") requested = "/index.html";
  if (requested === "/buzzer") requested = "/buzzer.html";

  let decoded;
  try {
    decoded = decodeURIComponent(requested);
  } catch {
    return null;
  }

  const normalized = path.normalize(decoded).replace(/^[/\\]+/, "");
  const target = path.resolve(PUBLIC_DIR, normalized);
  if (!target.startsWith(PUBLIC_DIR)) return null;
  return target;
}

function sendJson(res, payload) {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function getLanUrls() {
  const urls = [`http://localhost:${PORT}`];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        urls.push(`http://${entry.address}:${PORT}`);
      }
    }
  }
  return [...new Set(urls)];
}

function getPlayers() {
  return [...players.values()];
}

function removeClient(id) {
  const client = clients.get(id);
  if (!client) return;

  clients.delete(id);
  if (players.delete(id)) {
    buzzes = buzzes.filter((buzz) => buzz.playerId !== id);
    broadcast({ type: "players", players: getPlayers() });
    broadcast({ type: "buzzes", buzzes, buzzerOpen });
  }
}

function handleFrameData(client, chunk) {
  client.buffer = Buffer.concat([client.buffer, chunk]);

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
    const opcode = firstByte & 0x0f;
    const masked = Boolean(secondByte & 0x80);
    let length = secondByte & 0x7f;
    let offset = 2;

    if (length === 126) {
      if (client.buffer.length < 4) return;
      length = client.buffer.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (client.buffer.length < 10) return;
      const bigLength = client.buffer.readBigUInt64BE(2);
      if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) {
        client.socket.destroy();
        return;
      }
      length = Number(bigLength);
      offset = 10;
    }

    const maskOffset = offset;
    if (masked) offset += 4;
    if (client.buffer.length < offset + length) return;

    let payload = client.buffer.subarray(offset, offset + length);
    if (masked) {
      const mask = client.buffer.subarray(maskOffset, maskOffset + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    client.buffer = client.buffer.subarray(offset + length);

    if (opcode === 0x8) {
      client.socket.end();
      removeClient(client.id);
      return;
    }
    if (opcode === 0x9) {
      writeFrame(client.socket, payload, 0xA);
      continue;
    }
    if (opcode === 0x1) {
      handleMessage(client, payload.toString("utf8"));
    }
  }
}

function handleMessage(client, raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch {
    send(client, { type: "error", message: "JSON invalido" });
    return;
  }

  if (message.type === "register-host") {
    client.role = "host";
    send(client, {
      type: "sync",
      roomCode: ROOM_CODE,
      buzzerOpen,
      buzzes,
      players: getPlayers(),
      hostState
    });
    return;
  }

  if (message.type === "host-state" && client.role === "host") {
    hostState = {
      title: cleanText(message.title || "Jeopardy Matematico", 80),
      teams: Array.isArray(message.teams)
        ? message.teams.map((team) => ({
            id: cleanText(team.id || "", 64),
            name: cleanText(team.name || "Equipo", 40),
            color: cleanText(team.color || "#ffe65a", 20)
          }))
        : []
    };
    broadcast({ type: "host-state", hostState });
    return;
  }

  if (message.type === "register-player") {
    const teamId = getKnownTeamId(message.teamId);
    if (!teamId) {
      send(client, { type: "registration-rejected", reason: "team-required", buzzes, buzzerOpen });
      return;
    }
    client.role = "player";
    client.name = cleanText(message.name || "Jugador", 40);
    client.teamId = teamId;
    players.set(client.id, {
      id: client.id,
      name: client.name,
      teamId: client.teamId,
      connectedAt: Date.now()
    });
    send(client, {
      type: "registered",
      clientId: client.id,
      buzzerOpen,
      buzzes,
      hostState
    });
    broadcast({ type: "players", players: getPlayers() });
    return;
  }

  if (message.type === "update-player" && client.role === "player") {
    const teamId = getKnownTeamId(message.teamId);
    if (!teamId) {
      send(client, { type: "registration-rejected", reason: "team-required", buzzes, buzzerOpen });
      return;
    }
    client.name = cleanText(message.name || client.name || "Jugador", 40);
    client.teamId = teamId;
    players.set(client.id, {
      id: client.id,
      name: client.name,
      teamId: client.teamId,
      connectedAt: players.get(client.id)?.connectedAt || Date.now()
    });
    broadcast({ type: "players", players: getPlayers() });
    return;
  }

  if (message.type === "buzz" && client.role === "player") {
    if (!getKnownTeamId(client.teamId)) {
      send(client, { type: "buzz-rejected", reason: "team-required", buzzes, buzzerOpen });
      return;
    }
    if (!buzzerOpen) {
      send(client, { type: "buzz-rejected", reason: "closed", buzzes, buzzerOpen });
      return;
    }
    if (buzzes.some((buzz) => buzz.playerId === client.id)) {
      send(client, { type: "buzz-rejected", reason: "duplicate", buzzes, buzzerOpen });
      return;
    }

    const buzz = {
      playerId: client.id,
      name: client.name || "Jugador",
      teamId: client.teamId || "",
      at: Date.now(),
      rank: buzzes.length + 1
    };
    buzzes.push(buzz);
    buzzerOpen = false;
    broadcast({ type: "buzz", buzz });
    broadcast({ type: "buzzes", buzzes, buzzerOpen });
    return;
  }

  if (client.role === "host" && message.type === "clear-buzzes") {
    buzzes = [];
    buzzerOpen = true;
    broadcast({ type: "buzzes", buzzes, buzzerOpen });
    return;
  }

  if (client.role === "host" && message.type === "open-buzzers") {
    buzzerOpen = true;
    broadcast({ type: "buzzer-status", buzzerOpen });
    return;
  }

  if (client.role === "host" && message.type === "lock-buzzers") {
    buzzerOpen = false;
    broadcast({ type: "buzzer-status", buzzerOpen });
  }
}

function send(client, payload) {
  if (client.socket.destroyed) return;
  writeFrame(client.socket, Buffer.from(JSON.stringify(payload), "utf8"));
}

function broadcast(payload) {
  for (const client of clients.values()) {
    send(client, payload);
  }
}

function writeFrame(socket, payload, opcode = 0x1) {
  if (!Buffer.isBuffer(payload)) payload = Buffer.from(payload);
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  header[0] = 0x80 | opcode;
  socket.write(Buffer.concat([header, payload]));
}

function cleanText(value, maxLength) {
  return String(value).replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
}

function getKnownTeamId(value) {
  const teamId = cleanText(value || "", 64);
  return hostState.teams.some((team) => team.id === teamId) ? teamId : "";
}
