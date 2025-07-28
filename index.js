const { default: makeWASocket, DisconnectReason, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ['TAPRUSH X', 'Safari', '1.0.0'],
    });

    // Save auth state on changes
    sock.ev.on('creds.update', saveState);

    // Connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ BOT CONNECTED — TAPRUSH X');
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message  msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation  msg.message.extendedTextMessage?.text || '';

        if (body === '.ping') {
            await sock.sendMessage(from, { text: '🏓 TAPRUSH X is alive!' });
        }

        if (body === '.alive') {
            await sock.sendMessage(from, { text: '✅ TAPRUSH X BOT is working perfectly.' });
        }

        if (body === '.join') {
            const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
            const match = body.match(linkRegex);
            if (match) {
                const groupInviteCode = match[1];
                await sock.groupAcceptInvite(groupInviteCode);
                await sock.sendMessage(from, { text: '✅ I joined the group successfully!' });
            } else {
                await sock.sendMessage(from, { text: '❌ Invalid group link. Use a full WhatsApp group invite link.' });
            }
        }
    });
}

startBot();
