const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

/**
 * Format timestamp
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 * @returns {string} Formatted log message
 */
function formatMessage(level, message, data) {
    const timestamp = getTimestamp();
    const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

/**
 * Write log to file
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
function writeToFile(level, message, data) {
    try {
        const logMessage = formatMessage(level, message, data) + '\n';
        const logFile = path.join(logsDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logMessage);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

/**
 * Log to console with colors
 * @param {string} level - Log level
 * @param {string} color - Color code
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
function logToConsole(level, color, message, data) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `${color}[${timestamp}] [${level}]${colors.reset}`;
    
    if (data) {
        console.log(`${prefix} ${message}`);
        console.log(`${colors.cyan}Data:${colors.reset}`, data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

/**
 * Generic log function
 * @param {number} level - Log level number
 * @param {string} levelName - Log level name
 * @param {string} color - Console color
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
function log(level, levelName, color, message, data) {
    if (level <= CURRENT_LOG_LEVEL) {
        logToConsole(levelName, color, message, data);
        writeToFile(levelName, message, data);
    }
}

/**
 * Logger object with different log levels
 */
const logger = {
    error: (message, data) => {
        log(LOG_LEVELS.ERROR, 'ERROR', colors.red, message, data);
    },
    
    warn: (message, data) => {
        log(LOG_LEVELS.WARN, 'WARN', colors.yellow, message, data);
    },
    
    info: (message, data) => {
        log(LOG_LEVELS.INFO, 'INFO', colors.green, message, data);
    },
    
    debug: (message, data) => {
        log(LOG_LEVELS.DEBUG, 'DEBUG', colors.blue, message, data);
    },
    
    /**
     * Log raw message without formatting
     * @param {string} message - Raw message
     */
    raw: (message) => {
        console.log(message);
    },
    
    /**
     * Log with custom color
     * @param {string} message - Log message
     * @param {string} color - Color name
     */
    colored: (message, color = 'white') => {
        const colorCode = colors[color] || colors.white;
        console.log(`${colorCode}${message}${colors.reset}`);
    },
    
    /**
     * Clear log files older than specified days
     * @param {number} days - Number of days to keep logs
     */
    cleanOldLogs: (days = 7) => {
        try {
            const files = fs.readdirSync(logsDir);
            const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
            
            files.forEach(file => {
                const filePath = path.join(logsDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() < cutoffTime) {
                    fs.unlinkSync(filePath);
                    logger.info(`Deleted old log file: ${file}`);
                }
            });
        } catch (error) {
            logger.error('Error cleaning old logs:', error);
        }
    }
};

// Clean old logs on startup
logger.cleanOldLogs();

module.exports = logger;
