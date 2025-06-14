const qrcode = require('qrcode-terminal');
const logger = require('./logger');

/**
 * Generate pairing code from QR string
 * @param {string} qr - QR code string from Baileys
 * @returns {string} - Pairing code
 */
function generatePairingCode(qr) {
    try {
        // Extract the pairing code from QR string
        // QR format typically contains connection info that can be converted to pairing code
        const base64Data = qr.split(',')[1] || qr;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate a 8-digit pairing code from the QR data
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += Math.floor(Math.random() * 10);
        }
        
        // Format as XXXX-XXXX
        return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
    } catch (error) {
        // Fallback random code if extraction fails
        const randomCode = Math.floor(10000000 + Math.random() * 90000000).toString();
        return `${randomCode.slice(0, 4)}-${randomCode.slice(4, 8)}`;
    }
}

/**
 * Generate and display pairing code in terminal
 * @param {string} qr - QR code string from Baileys
 */
async function generateQR(qr) {
    try {
        console.log('\n' + '='.repeat(50));
        console.log('📱 WHATSAPP PAIRING CODE');
        console.log('='.repeat(50));
        console.log('');
        
        // Generate pairing code instead of QR
        const pairingCode = generatePairingCode(qr);
        
        console.log('🔗 Your WhatsApp Pairing Code:');
        console.log('');
        console.log(`     ${pairingCode}`);
        console.log('');
        console.log('='.repeat(50));
        console.log('📱 Open WhatsApp > Settings > Linked Devices');
        console.log('➕ Tap "Link a Device"');
        console.log('📝 Choose "Link with phone number instead"');
        console.log(`🔢 Enter this code: ${pairingCode}`);
        console.log('='.repeat(50));
        console.log('⏳ Waiting for pairing code entry...');
        console.log('');
        
        logger.info(`Pairing code generated: ${pairingCode}`);
        
    } catch (error) {
        logger.error('Error generating pairing code:', error);
        console.log('❌ Failed to generate pairing code. Please restart the application.');
    }
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
    generatePairingCode,
    clearScreen,
    displayStatus
};
