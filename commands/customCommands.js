const logger = require('../utils/logger');

// Add your custom commands here
// Each command should follow this structure:
/*
commandName: {
    description: 'What this command does',
    usage: '!commandName <optional arguments>',
    execute: async (sock, message, args) => {
        // Your command logic here
        await sock.sendMessage(message.key.remoteJid, { 
            text: 'Your response message' 
        });
    }
}
*/

const customCommands = {
    // Example: Random number generator
    random: {
        description: 'Generate a random number',
        usage: '!random <min> <max>',
        execute: async (sock, message, args) => {
            let min = 1;
            let max = 100;
            
            if (args.length >= 2) {
                min = parseInt(args[0]) || 1;
                max = parseInt(args[1]) || 100;
            } else if (args.length === 1) {
                max = parseInt(args[0]) || 100;
            }
            
            if (min > max) [min, max] = [max, min]; // Swap if needed
            
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🎲 *Random Number:* ${randomNum}\n*Range:* ${min} - ${max}` 
            });
        }
    },

    // Example: Coin flip
    flip: {
        description: 'Flip a coin',
        usage: '!flip',
        execute: async (sock, message) => {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const emoji = result === 'Heads' ? '🪙' : '🔄';
            await sock.sendMessage(message.key.remoteJid, { 
                text: `${emoji} *Coin Flip Result:* ${result}!` 
            });
        }
    },

    // Example: Word count
    count: {
        description: 'Count words in a message',
        usage: '!count <your message>',
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide text to count!\n\nUsage: !count your message here' 
                });
                return;
            }
            
            const text = args.join(' ');
            const wordCount = text.trim().split(/\s+/).length;
            const charCount = text.length;
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: `📊 *Text Statistics:*\n\n*Words:* ${wordCount}\n*Characters:* ${charCount}\n*Text:* "${text}"` 
            });
        }
    },

    // Example: Reminder (simple version)
    remind: {
        description: 'Set a simple reminder',
        usage: '!remind <seconds> <message>',
        execute: async (sock, message, args) => {
            if (args.length < 2) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide time and message!\n\nUsage: !remind 60 Take a break\n(Time in seconds)' 
                });
                return;
            }
            
            const seconds = parseInt(args[0]);
            if (isNaN(seconds) || seconds <= 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide a valid number of seconds!' 
                });
                return;
            }
            
            const reminderText = args.slice(1).join(' ');
            const senderJid = message.key.remoteJid;
            
            await sock.sendMessage(senderJid, { 
                text: `⏰ *Reminder set!*\nI'll remind you in ${seconds} seconds: "${reminderText}"` 
            });
            
            // Set the reminder
            setTimeout(async () => {
                try {
                    await sock.sendMessage(senderJid, { 
                        text: `🔔 *Reminder:* ${reminderText}` 
                    });
                } catch (error) {
                    logger.error('Error sending reminder:', error);
                }
            }, seconds * 1000);
        }
    },

    // Example: Uppercase text
    upper: {
        description: 'Convert text to uppercase',
        usage: '!upper <text>',
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide text to convert!\n\nUsage: !upper hello world' 
                });
                return;
            }
            
            const text = args.join(' ');
            const upperText = text.toUpperCase();
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🔤 *Uppercase:* ${upperText}` 
            });
        }
    },

    // Example: Reverse text
    reverse: {
        description: 'Reverse text',
        usage: '!reverse <text>',
        execute: async (sock, message, args) => {
            if (args.length === 0) {
                await sock.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide text to reverse!\n\nUsage: !reverse hello world' 
                });
                return;
            }
            
            const text = args.join(' ');
            const reversedText = text.split('').reverse().join('');
            
            await sock.sendMessage(message.key.remoteJid, { 
                text: `🔄 *Reversed:* ${reversedText}` 
            });
        }
    }
};

module.exports = customCommands;