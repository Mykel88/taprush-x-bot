const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const { state, saveState } = useSingleFileAuthState("./session.json");

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("connection closed due to", lastDisconnect?.error, "reconnecting", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("TAPRUSH X is now online ✅");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;

    if (text === ".ping") {
      await sock.sendMessage(sender, { text: "🏓 TAPRUSH X is active!" });
    }

    if (text === ".alive") {
      await sock.sendMessage(sender, { text: "🔥 TAPRUSH X Bot is online and ready to hustle!" });
    }

    if (text === ".join") {
      await sock.sendMessage(sender, { text: "Click this link to join Linebet now:\n👉 https://vipersensi.lineorgs.com/\nPromo Code: vipersensi" });
    }
  });
}

startBot();
