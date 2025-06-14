const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const { generateQR } = require('../utils/qrcode');
const { handleMessage } = require('../commands/messageHandler');
const logger = require('../utils/logger');

// Create auth directory if it doesn't exist
const authDir = './auth/auth_info_baileys';
if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
}

let sock;
let qrGenerated = false;

async function connectToWhatsApp() {
    // Check if we have existing credentials
    if (!fs.existsSync(authDir) || fs.readdirSync(authDir).length === 0) {
        logger.info('⏳ No session found. Waiting for session from your pairing website...');
        logger.info('💡 Use your existing pairing website to generate session credentials');
        setTimeout(() => connectToWhatsApp(), 5000); // Check again in 5 seconds
        return;
    }

    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['WhatsApp Bot', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        connectTimeoutMs: 20000
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            logger.info('Connection closed due to:', lastDisconnect?.error);

            if (shouldReconnect) {
                logger.info('Reconnecting...');
                qrGenerated = false;
                await delay(3000);
                connectToWhatsApp();
            } else {
                logger.info('Logged out - clearing session');
                // Clear session if logged out
                if (fs.existsSync(authDir)) {
                    fs.rmSync(authDir, { recursive: true, force: true });
                }
                setTimeout(connectToWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            logger.info('✅ Connected to WhatsApp successfully!');
            logger.info('🤖 Bot is ready to receive messages');
            
            // Send startup message to yourself (optional)
            try {
                const userJid = sock.user.id;
                await sock.sendMessage(userJid, { 
                    text: '🤖 WhatsApp Bot is now online and ready to receive commands!\n\nAvailable commands:\n• !ping - Check bot status\n• !help - Show help menu\n• !info - Bot information' 
                });
            } catch (error) {
                logger.error('Error sending startup message:', error);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (m.type === 'notify') {
            // Allow bot to respond to your own messages when testing commands
            const messageText = message.message?.conversation || 
                               message.message?.extendedTextMessage?.text || '';
            
            // Process command messages even if from yourself
            if (messageText.startsWith('!')) {
                await handleMessage(sock, message);
            } else if (!message.key.fromMe) {
                // Process non-command messages only from others
                await handleMessage(sock, message);
            }
        }
    });

    // Handle message status updates
    sock.ev.on('message-receipt.update', (update) => {
        logger.debug('Message receipt update:', update);
    });

    // Handle presence updates
    sock.ev.on('presence.update', (update) => {
        logger.debug('Presence update:', update);
    });

    return sock;
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    if (sock) {
        try {
            await sock.logout();
        } catch (error) {
            logger.error('Error during logout:', error);
        }
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the bot
async function startBot() {
    try {
        logger.info('🚀 Starting WhatsApp Bot...');
        logger.info('💡 Bot will automatically connect when session is available from your pairing website');
        await connectToWhatsApp();
    } catch (error) {
        logger.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Export socket for use in other modules
module.exports = { sock: () => sock };

// Start the application
startBot();
