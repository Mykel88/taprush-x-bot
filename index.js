const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const pino = require("pino");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(Using WA version v${version.join(".")}, latest: ${isLatest});

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false, // Disable QR, we’ll use pairing code
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    browser: ["TAPRUSH-X", "Chrome", "10.0"]
