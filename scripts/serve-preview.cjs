const { createServer } = require("node:http");
const { createReadStream, existsSync, statSync } = require("node:fs");
const { extname, join, normalize, resolve } = require("node:path");
const { randomUUID } = require("node:crypto");
const QRCode = require("qrcode");

const root = resolve(process.argv[2] ?? "apps/mobile/preview");
const port = Number(process.env.PORT ?? process.argv[3] ?? 5173);
const host = process.env.HOST ?? "0.0.0.0";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const mostLikelySession = {
  roomName: "Es Tu",
  players: [],
};
const mostLikelyMaxPlayers = 8;

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname.startsWith("/api/most-likely/")) {
    await handleMostLikelyApi(request, response, url);
    return;
  }

  const requestPath = decodeURIComponent(url.pathname);
  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = resolve(join(root, safePath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
});

async function handleMostLikelyApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/most-likely/players") {
    writeJson(response, {
      players: mostLikelySession.players,
      totalPlayers: mostLikelySession.players.length,
      roomName: mostLikelySession.roomName,
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/most-likely/room") {
    try {
      const body = await readJsonBody(request);
      mostLikelySession.roomName = normalizeRoomName(body.roomName);
      writeJson(response, { roomName: mostLikelySession.roomName });
    } catch (error) {
      writeJson(response, { error: "invalid_room_payload" }, 400);
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/most-likely/join") {
    try {
      const body = await readJsonBody(request);
      const nickname = normalizeNickname(body.nickname);
      const photoUrl = normalizePhoto(body.photoUrl);
      const clientId =
        typeof body.clientId === "string" && body.clientId.length > 0
          ? body.clientId.slice(0, 80)
          : randomUUID();
      const existingPlayer = mostLikelySession.players.find(
        (player) => player.clientId === clientId,
      );

      if (existingPlayer) {
        existingPlayer.nickname = nickname;
        existingPlayer.photoUrl = photoUrl;
        writeJson(response, { player: existingPlayer });
        return;
      }

      if (mostLikelySession.players.length >= mostLikelyMaxPlayers) {
        writeJson(response, { error: "room_full" }, 409);
        return;
      }

      const player = {
        playerId: `preview_${randomUUID()}`,
        clientId,
        nickname,
        ...(photoUrl ? { photoUrl } : {}),
        joinedAt: new Date().toISOString(),
      };

      mostLikelySession.players.push(player);
      writeJson(response, { player });
    } catch (error) {
      writeJson(response, { error: "invalid_join_payload" }, 400);
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/most-likely/reset") {
    mostLikelySession.players = [];
    writeJson(response, { players: [] });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/most-likely/qr.svg") {
    const value = url.searchParams.get("url");

    if (!value) {
      response.writeHead(400);
      response.end("Missing url");
      return;
    }

    const svg = await QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: 240,
      color: {
        dark: "#050403",
        light: "#fff3d5",
      },
    });

    response.writeHead(200, {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(svg);
    return;
  }

  writeJson(response, { error: "not_found" }, 404);
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 2_500_000) {
        rejectBody(new Error("Body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolveBody(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        rejectBody(error);
      }
    });

    request.on("error", rejectBody);
  });
}

function normalizeNickname(value) {
  if (typeof value !== "string") {
    return "Jogador";
  }

  return value.trim().slice(0, 14) || "Jogador";
}

function normalizeRoomName(value) {
  if (typeof value !== "string") {
    return "Es Tu";
  }

  return value.trim().slice(0, 18) || "Es Tu";
}

function normalizePhoto(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  if (!value.startsWith("data:image/") || value.length > 2_000_000) {
    return undefined;
  }

  return value;
}

function writeJson(response, payload, statusCode = 200) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

server.listen(port, host, () => {
  console.log(`Preview server running at http://${host}:${port}/`);
  console.log(`Serving ${root}`);
});
