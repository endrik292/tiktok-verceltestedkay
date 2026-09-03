const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const basePath = "/roblox1";
const upstreamRobloxApi = "https://roblox-api-ready.vercel.app/api/roblox/user";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body)
  });
  res.end(body);
}

function fallbackUser(username) {
  return {
    username,
    displayName: username,
    hasVerifiedBadge: false,
    avatarUrl: ""
  };
}

async function handleRobloxLookup(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 100_000) req.destroy();
  });

  req.on("end", async () => {
    let parsed;
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch (error) {
      sendJson(res, 400, { error: "Invalid JSON body." });
      return;
    }

    const username = String(parsed.username || "").trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      sendJson(res, 400, { error: "Nutze 3-20 Buchstaben, Zahlen oder Unterstriche." });
      return;
    }

    try {
      const upstream = await fetch(upstreamRobloxApi, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await upstream.json().catch(() => ({}));

      if (!upstream.ok || !data.user) {
        sendJson(res, 200, { user: fallbackUser(username), localFallback: true });
        return;
      }

      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 200, { user: fallbackUser(username), localFallback: true });
    }
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  const isRobloxRoute = url.pathname === basePath || url.pathname.startsWith(basePath + "/");
  let pathname = url.pathname;
  if (pathname === basePath) pathname = "/";
  if (pathname.startsWith(basePath + "/")) pathname = pathname.slice(basePath.length) || "/";

  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, requested));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (isRobloxRoute && !path.extname(filePath)) {
        fs.readFile(path.join(root, "index.html"), (indexError, indexData) => {
          if (indexError) {
            res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
          }

          res.writeHead(200, {
            "content-type": mimeTypes[".html"],
            "cache-control": "no-store"
          });
          res.end(indexData);
        });
        return;
      }

      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "content-type": mimeTypes[ext] || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && (req.url.startsWith("/api/roblox/user") || req.url.startsWith("/.netlify/functions/roblox-user"))) {
    handleRobloxLookup(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
  res.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`PlayRWDZ local clone running at http://localhost:${port}`);
});
