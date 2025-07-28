const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startSock() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("connection closed due to", lastDisconnect.error, ", reconnecting...", shouldReconnect);
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === "open") {
            console.log("✅ Connected to WhatsApp");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const msg = m.message.conversation || m.message.extendedTextMessage?.text;

        if (msg?.toLowerCase() === ".alive") {
            await sock.sendMessage(m.key.remoteJid, { text: "*🤖 TAPRUSH X BOT ONLINE!*" });
        }

        if (msg?.toLowerCase() === ".ping") {
            await sock.sendMessage(m.key.remoteJid, { text: "*🏓 Pong!*" });
        }
    });
}

startSock();
