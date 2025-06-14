const fs = require('fs');
const path = require('path');

/**
 * Session Bridge - Connects your existing pairing website with the bot
 * This script copies session credentials from your website to the bot's auth directory
 */

// Function to copy session from temp directory to bot auth directory
function transferSession(tempSessionId) {
    const tempDir = `./temp/${tempSessionId}`;
    const authDir = './auth/auth_info_baileys';
    
    try {
        // Check if temp session exists
        if (!fs.existsSync(tempDir)) {
            console.log(`No session found in ${tempDir}`);
            return false;
        }

        // Create auth directory if it doesn't exist
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Copy all session files
        const sessionFiles = fs.readdirSync(tempDir);
        sessionFiles.forEach(file => {
            const sourcePath = path.join(tempDir, file);
            const destPath = path.join(authDir, file);
            fs.copyFileSync(sourcePath, destPath);
        });

        console.log(`✅ Session transferred successfully from ${tempDir} to ${authDir}`);
        
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        return true;
    } catch (error) {
        console.error('Error transferring session:', error);
        return false;
    }
}

// Function to check if bot has a valid session
function hasValidSession() {
    const authDir = './auth/auth_info_baileys';
    return fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0;
}

// Function to clear bot session
function clearSession() {
    const authDir = './auth/auth_info_baileys';
    if (fs.existsSync(authDir)) {
        fs.rmSync(authDir, { recursive: true, force: true });
        console.log('✅ Bot session cleared');
        return true;
    }
    return false;
}

module.exports = {
    transferSession,
    hasValidSession,
    clearSession
};

// If called directly from command line
if (require.main === module) {
    const command = process.argv[2];
    const sessionId = process.argv[3];
    
    switch (command) {
        case 'transfer':
            if (!sessionId) {
                console.log('Usage: node session-bridge.js transfer <session-id>');
                process.exit(1);
            }
            transferSession(sessionId);
            break;
            
        case 'check':
            console.log('Bot has valid session:', hasValidSession());
            break;
            
        case 'clear':
            clearSession();
            break;
            
        default:
            console.log('Available commands:');
            console.log('  transfer <session-id> - Transfer session from temp to bot');
            console.log('  check                 - Check if bot has valid session');
            console.log('  clear                 - Clear bot session');
    }
}