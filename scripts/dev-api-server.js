// Local-only dev server for api/chat.js. Vercel treats every file under /api
// as its own serverless function, so this lives outside that folder — it's
// dev tooling, not something to deploy.
//
// Why this exists instead of `vercel dev`: that requires logging the Vercel
// CLI into your account. This needs nothing but Node + your .env.local, so
// you can test the bot end-to-end without touching your Vercel login.
//
// Run: node --env-file=.env.local scripts/dev-api-server.js
// Then set VITE_BOT_API_URL=http://localhost:8787 in .env.local so the
// widget (running via `npm run dev`) talks to this instead of production.
//
// Port note: if another dev server is already using 8787 (e.g. a different
// session/device sharing this folder), override with API_PORT=8788 (etc.)
// so you don't collide with it.

import http from "node:http";
import handler from "../api/chat.js";

const PORT = process.env.API_PORT || 8787;

function addResponseHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };
  return res;
}

function setCors(res) {
  // Local dev only: Vite (5173) and this server (8787) are different origins.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Session-Id");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

const server = http.createServer(async (req, res) => {
  setCors(res);
  addResponseHelpers(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url !== "/api/chat") {
    res.statusCode = 404;
    res.end("Not found — only /api/chat is served here.");
    return;
  }

  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    req.body = raw ? JSON.parse(raw) : {};
  } catch {
    req.body = {};
  }

  try {
    await handler(req, res);
  } catch (err) {
    console.error("Unhandled error in api/chat.js:", err);
    res.status(500).json({ error: "Internal error — check this terminal for the stack trace." });
  }
});

server.listen(PORT, () => {
  console.log(`Local chat API ready: http://localhost:${PORT}/api/chat`);
  console.log("Required env var (from .env.local): OPENAI_API_KEY");
});
