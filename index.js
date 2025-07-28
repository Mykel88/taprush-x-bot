// Powered by TAPRUSH Empire 💥
const { default: makeWASocket, fetchLatestBaileysVersion, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");

// Auth session file
const sessionFile = "./session.json";
const { state, saveState } = useSingleFileAuthState(sessionFile);

// Load commands from /commands folder
const commands = {};
for (const file of fs.readdirSync("./commands")) {
  const cmd = require(path.join(__dirname, "commands", file));
  commands[cmd.name] = cmd;
}

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveState);
  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("✅ TAPRUSH X is live!");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message?.conversation) return;

    const text = msg.message.conversation.trim();
    const command = text.split(" ")[0].slice(1).toLowerCase();
    const run = commands[command];
    if (run) await run.execute(sock, msg);
  });
}

startBot();
