const upstreamRobloxApi = "https://roblox-api-ready.vercel.app/api/roblox/user";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return sendJson(405, { error: "Method not allowed." });
  }

  let parsed;
  try {
    parsed = event.body ? JSON.parse(event.body) : {};
  } catch {
    return sendJson(400, { error: "Invalid JSON body." });
  }

  const username = String(parsed.username || "").trim();
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return sendJson(400, { error: "Use 3-20 letters, numbers, or underscores." });
  }

  try {
    const upstream = await fetch(upstreamRobloxApi, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || !data.user) {
      return sendJson(200, { user: fallbackUser(username), localFallback: true });
    }

    return sendJson(200, data);
  } catch {
    return sendJson(200, { user: fallbackUser(username), localFallback: true });
  }
};

function fallbackUser(username) {
  return {
    username,
    displayName: username,
    hasVerifiedBadge: false,
    avatarUrl: "",
  };
}

function sendJson(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}
