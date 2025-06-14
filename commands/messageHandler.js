const logger = require('../utils/logger');
const customCommands = require('./customCommands');

// Command prefix
const PREFIX = '!';

// Available commands
const commands = {
    ping: {
        description: 'Test bot responsiveness',
        usage: `${PREFIX}ping`,
        execute: async (sock, message) => {
            const start = Date.now();
            await sock.sendMessage(message.key.remoteJid, { 
                text: '🏓 Pong!' 
            });
            const end = Date.now();
            await sock.sendMessage(message.key.remoteJid, { 
                text: `⚡ Response time: ${end - start}ms` 
            });
        }
    },
    
    help: {
        description: 'Show available commands',
        usage: `${PREFIX}help`,
        execute: async (sock, message) => {
            let helpText = '🤖 *WhatsApp Bot Commands*\n\n';
            
            Object.entries(commands).forEach(([cmd, info]) => {
                helpText += `*${info.usage}*\n`;
                helpText += `${info.description}\n\n`;
            });
            
            helpText += '💡 _Type any command to get started!_';
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: helpText 
            });
        }
    },
    
    info: {
        description: 'Get bot information',
        usage: `${PREFIX}info`,
        execute: async (sock, message) => {
            const botInfo = `🤖 *WhatsApp Bot Information*

*Status:* ✅ Online
*Version:* 1.0.0
*Library:* Baileys
*Runtime:* Node.js
*Uptime:* ${Math.floor(process.uptime())} seconds

*Features:*
• Message handling
• Command processing
• Session persistence
• Auto-reconnection

*Developer:* WhatsApp Bot Team`;

            await sock.sendMessage(message.key.remoteJid, { 
                text: botInfo 
            });
        }
    },
    
    echo: {
        description: 'Echo back your message',
        usage: `${PREFIX}echo <message>`,
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide a message to echo!\n\nUsage: !echo <your message>' 
                });
                return;
            }
            
            const echoMessage = args.join(' ');
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🔄 *Echo:* ${echoMessage}` 
            });
        }
    },
    
    time: {
        description: 'Get current server time',
        usage: `${PREFIX}time`,
        execute: async (sock, message) => {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🕐 *Current Time:*\n${timeString}` 
            });
        }
    },
    
    quote: {
        description: 'Get a random inspirational quote',
        usage: `${PREFIX}quote`,
        execute: async (sock, message) => {
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "Life is what happens to you while you're busy making other plans. - John Lennon",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "It is during our darkest moments that we must focus to see the light. - Aristotle",
                "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await sock.sendMessage(message.key.remoteJid, { 
                text: `💭 *Quote of the moment:*\n\n"${randomQuote}"` 
            });
        }
    },
    
    joke: {
        description: 'Get a random joke',
        usage: `${PREFIX}joke`,
        execute: async (sock, message) => {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the math book look so sad? Because it was full of problems!"
            ];
            
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(message.key.remoteJid, { 
                text: `😄 *Here's a joke for you:*\n\n${randomJoke}` 
            });
        }
    },
    
    weather: {
        description: 'Get weather information (demo command)',
        usage: `${PREFIX}weather <city>`,
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide a city name!\n\nUsage: !weather <city>' 
                });
                return;
            }
            
            const city = args.join(' ');
            // This is a demo response - you can integrate with a real weather API
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🌤️ *Weather in ${city}:*\n\n*Temperature:* 22°C\n*Condition:* Partly Cloudy\n*Humidity:* 65%\n\n_Note: This is a demo command. Connect a real weather API for live data._` 
            });
        }
    },
    
    calculate: {
        description: 'Simple calculator',
        usage: `${PREFIX}calc <expression>`,
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide a math expression!\n\nUsage: !calc 2 + 2\nExamples: !calc 10 * 5, !calc 100 / 4' 
                });
                return;
            }
            
            try {
                const expression = args.join(' ');
                // Simple evaluation (only allow basic math operations)
                const safeExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
                const result = eval(safeExpression);
                
                await sock.sendMessage(message.key.remoteJid, { 
                    text: `🧮 *Calculator:*\n\n${expression} = ${result}` 
                });
            } catch (error) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Invalid math expression! Please use basic operations (+, -, *, /)' 
                });
            }
        }
    },
    
    // Merge custom commands
    ...customCommands
};

// Auto-responses for common messages
const autoResponses = {
    'hello': '👋 Hello! How can I help you today? Type !help to see available commands.',
    'hi': '👋 Hi there! Type !help to see what I can do.',
    'hey': '👋 Hey! I\'m here to help. Use !help to see available commands.',
    'good morning': '🌅 Good morning! Hope you have a great day ahead!',
    'good afternoon': '☀️ Good afternoon! How\'s your day going?',
    'good evening': '🌆 Good evening! How can I assist you?',
    'good night': '🌙 Good night! Sweet dreams!',
    'thank you': '😊 You\'re welcome! Happy to help!',
    'thanks': '😊 You\'re welcome!',
    'bye': '👋 Goodbye! Have a great day!',
    'goodbye': '👋 Goodbye! Take care!'
};

async function handleMessage(sock, message) {
    try {
        // Extract message info
        const messageText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || '';
        const senderJid = message.key.remoteJid;
        const senderName = message.pushName || 'Unknown';
        const isGroup = senderJid.endsWith('@g.us');
        
        // Log incoming message
        logger.info(`📨 Message from ${senderName} (${isGroup ? 'Group' : 'Private'}): ${messageText}`);
        
        // Ignore empty messages
        if (!messageText.trim()) {
            return;
        }
        
        const messageTextLower = messageText.toLowerCase().trim();
        
        // Handle commands
        if (messageText.startsWith(PREFIX)) {
            const args = messageText.slice(PREFIX.length).trim().split(/\s+/);
            const commandName = args.shift().toLowerCase();
            
            if (commands[commandName]) {
                logger.info(`🔧 Executing command: ${commandName}`);
                try {
                    await commands[commandName].execute(sock, message, args);
                } catch (error) {
                    logger.error(`Error executing command ${commandName}:`, error);
                    await sock.sendMessage(senderJid, { 
                        text: `❌ Error executing command: ${error.message}` 
                    });
                }
            } else {
                await sock.sendMessage(senderJid, { 
                    text: `❌ Unknown command: ${commandName}\n\nType ${PREFIX}help to see available commands.` 
                });
            }
            return;
        }
        
        // Handle auto-responses
        for (const [trigger, response] of Object.entries(autoResponses)) {
            if (messageTextLower.includes(trigger)) {
                logger.info(`🤖 Auto-responding to: ${trigger}`);
                await sock.sendMessage(senderJid, { text: response });
                return;
            }
        }
        
        // Default response for unrecognized messages
        if (!isGroup && messageText.length > 0) {
            const defaultResponse = `🤖 I received your message: "${messageText}"\n\nType ${PREFIX}help to see what I can do!`;
            await sock.sendMessage(senderJid, { text: defaultResponse });
        }
        
    } catch (error) {
        logger.error('Error handling message:', error);
    }
}

module.exports = {
    handleMessage,
    commands,
    PREFIX
};
