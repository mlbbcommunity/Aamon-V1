const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Endpoint to receive session data from your pairing website
app.post('/receive-session', (req, res) => {
    try {
        const { sessionData, sessionId } = req.body;
        
        if (!sessionData || !sessionId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Session data and ID are required' 
            });
        }

        // Create auth directory if it doesn't exist
        const authDir = './auth/auth_info_baileys';
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Save each session file
        Object.keys(sessionData).forEach(filename => {
            const filePath = `${authDir}/${filename}`;
            const fileContent = sessionData[filename];
            
            if (typeof fileContent === 'object') {
                fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
            } else {
                fs.writeFileSync(filePath, fileContent);
            }
        });

        console.log(`✅ Session ${sessionId} received and saved to bot`);
        res.json({ 
            success: true, 
            message: 'Session transferred to bot successfully',
            sessionId 
        });

    } catch (error) {
        console.error('Error receiving session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process session data' 
        });
    }
});

// Serve upload page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/upload-session.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'active',
        botReady: fs.existsSync('./auth/auth_info_baileys') && 
                  fs.readdirSync('./auth/auth_info_baileys').length > 0,
        timestamp: new Date().toISOString()
    });
});

// Clear session endpoint
app.post('/clear-session', (req, res) => {
    try {
        const authDir = './auth/auth_info_baileys';
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
            fs.mkdirSync(authDir, { recursive: true });
        }
        
        res.json({ success: true, message: 'Session cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔗 API Bridge running on port ${PORT}`);
    console.log(`📡 Ready to receive sessions from your pairing website`);
});

module.exports = app;