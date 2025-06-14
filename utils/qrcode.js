const qrcode = require('qrcode-terminal');
const logger = require('./logger');

/**
 * Generate and display QR code in terminal
 * @param {string} qr - QR code string from Baileys
 */
async function generateQR(qr) {
    try {
        console.log('\n' + '='.repeat(50));
        console.log('📱 SCAN QR CODE WITH WHATSAPP');
        console.log('='.repeat(50));
        console.log('');
        
        // Generate QR code in terminal
        qrcode.generate(qr, { small: true }, (qrString) => {
            console.log(qrString);
            console.log('');
            console.log('='.repeat(50));
            console.log('📱 Open WhatsApp > Settings > Linked Devices');
            console.log('➕ Tap "Link a Device" and scan this QR code');
            console.log('='.repeat(50));
            console.log('⏳ Waiting for QR code scan...');
            console.log('');
        });
        
        logger.info('QR code generated and displayed in terminal');
        
    } catch (error) {
        logger.error('Error generating QR code:', error);
        console.log('❌ Failed to generate QR code. Please restart the application.');
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
    clearScreen,
    displayStatus
};
