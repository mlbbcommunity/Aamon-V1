const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function malvinid(num = 4) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var characters9 = characters.length;
  for (var i = 2; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  return result;
}

// Function to remove a file
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Router to handle pairing code generation
router.get('/', async (req, res) => {
    const id = malvinid(); 
    let num = req.query.number;

    async function PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                console.log(`Your Code: ${code}`);

                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const sessionSource = `./temp/${id}`;

                    if (!fs.existsSync(sessionSource)) {
                        console.error("Session directory not found:", sessionSource);
                        return;
                    }

                    // Copy credentials to auth directory for the bot
                    const authDir = './auth/auth_info_baileys';
                    if (!fs.existsSync(authDir)) {
                        fs.mkdirSync(authDir, { recursive: true });
                    }
                    
                    // Copy the entire session directory
                    const sessionFiles = fs.readdirSync(sessionSource);
                    
                    sessionFiles.forEach(file => {
                        fs.copyFileSync(`${sessionSource}/${file}`, `${authDir}/${file}`);
                    });

                    console.log('Session credentials copied to bot auth directory');

                    const SESSION_TEXT = `🎉 *Welcome to WhatsApp Bot!* 🚀  

✅ *Your session has been successfully linked!*  
🔒 Your credentials are now saved and the bot is ready to use.

💡 *What's Next?* 
1️⃣ Your bot is now connected and ready to receive commands
2️⃣ Try sending messages with the command prefix: !
3️⃣ Available commands: !ping, !help, !info

🚀 _Your WhatsApp bot is now active and ready!_ ✨`;

                    await sock.sendMessage(sock.user.id, { text: SESSION_TEXT });

                    await delay(100);
                    await sock.ws.close();
                    return removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await PAIR_CODE();
});

module.exports = router;