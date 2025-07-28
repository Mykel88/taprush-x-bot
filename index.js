const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require("fs");
const path = require("path");

// Pairing code auth
const { usePairingCode } = require("@whiskeysockets/baileys/pairing-code");

// Setup auth session
const sessionPath = "./session.json";
const { state, saveState } = useSingleFileAuthState(sessionPath);

// Setup in-memory store for logging chats (optional)
const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) });

/
