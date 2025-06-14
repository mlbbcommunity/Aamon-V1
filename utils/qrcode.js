const qrcode = require('qrcode-terminal');
const logger = require('./logger');

/**
 * Generate pairing code display (this is now handled by Baileys directly)
 * @param {string} code - Actual pairing code from Baileys
 * @returns {string} - Formatted pairing code
 */
function formatPairingCode(code) {
    // Just format the code nicely if needed
    return code.replace(/(\d{4})(\d{4})/, '$1-$2');
}

/**
 * Show that we're using pairing code method instead of QR
 * @param {string} qr - QR code string from Baileys (not used)
 */
async function generateQR(qr) {
    console.log('\n' + '='.repeat(50));
    console.log('🔄 Switching to pairing code method...');
    console.log('📱 Your phone number is configured in the bot');
    console.log('⏳ Generating pairing code...');
    console.log('='.repeat(50));
    
    logger.info('QR code bypassed - using pairing code method instead');
}

/**
 * Clear terminal screen
 */
function clearScreen() {
    console.clear();
}

/**
 * Display connection status
 * @param {string} status - Connection status
 */
function displayStatus(status) {
    const statusMessages = {
        'connecting': '🔄 Connecting to WhatsApp...',
        'connected': '✅ Connected to WhatsApp successfully!',
        'disconnected': '❌ Disconnected from WhatsApp',
        'reconnecting': '🔄 Reconnecting to WhatsApp...',
        'qr_ready': '📱 QR Code is ready for scanning',
        'authenticated': '🔐 Authentication successful'
    };
    
    const message = statusMessages[status] || `ℹ️ Status: ${status}`;
    console.log('\n' + message);
    logger.info(message);
}

module.exports = {
    generateQR,
    formatPairingCode,
    clearScreen,
    displayStatus
};
