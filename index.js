/**
 * MAFIA ADEEL Bot - Ultra Fixed & Optimized
 */

const config = require('./config');
const axios = require('axios');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  makeCacheableSignalKeyStore,
  downloadContentFromMessage
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const util = require('util');
const { Boom } = require('@hapi/boom');
const { sms, getGroupAdmins } = require('./lib/functions'); // Adjust path if needed
const GroupEvents = require('./lib/groupevents');
const { saveMessage } = require('./data');

// ==================== PERFORMANCE OPTIMIZATION ====================
if (process.env.NODE_OPTIONS !== '--max-old-space-size=4096') {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
}
process.env.UV_THREADPOOL_SIZE = '128';

// ==================== TEMP DIRECTORY ====================
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const clearTempDir = () => {
  try {
    fs.readdir(tempDir, (err, files) => {
      if (err) return;
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(tempDir, file));
        } catch (e) {
          // Ignore
        }
      });
    });
  } catch (error) {
    // Ignore
  }
};
setInterval(clearTempDir, 5 * 60 * 1000);

// ==================== SESSION AUTH ====================
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

if (!fs.existsSync(credsPath)) {
  if (config.SESSION_ID && config.SESSION_ID.trim() !== "") {
    const sessdata = config.SESSION_ID.replace("ADEEL-XMD~", '');
    try {
      const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
      fs.writeFileSync(credsPath, decodedData);
      log("✅ Session loaded from SESSION_ID", 'green');
    } catch (err) {
      log("❌ Error decoding session data: " + err, 'red', true);
    }
  }
}
// ==================== FILE PATHS (SIRF EK BAAR) ====================
const MESSAGE_STORE_FILE = path.join(__dirname, 'message_backup.json');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
const ANTIDELETE_SETTINGS_FILE = path.join(__dirname, 'antidelete_settings.json');
const AUTOSTATUS_SETTINGS_FILE = path.join(__dirname, 'autostatus_settings.json');
const TEMP_MEDIA_DIR = path.join(__dirname, 'tmp_media');

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
  fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// ==================== CENTRALIZED LOGGING ====================
function log(message, color = 'white', isError = false) {
  const prefix = chalk.blue.bold('[ ADEEL-MD³⁰³ ]');
  const logFunc = isError ? console.error : console.log;
  const coloredMessage = chalk[color] ? chalk[color](message) : message;
  logFunc(`${prefix} ${coloredMessage}`);
}

// ==================== GLOBAL FLAGS & STORES ====================
global.isBotConnected = false;
global.messageCache = new Map();
const messageStore = new Map();

// Owner Settings
const ownerNumber = ['923174838990', '923348585489'];
const botInstallers = ['923174838990', '923348585489'];
const botCreators = ['923174838990', '923348585489'];

// ==================== SETTINGS LOADERS ====================
function loadAntiDeleteSettings() {
  try {
    if (fs.existsSync(ANTIDELETE_SETTINGS_FILE)) return JSON.parse(fs.readFileSync(ANTIDELETE_SETTINGS_FILE, 'utf-8'));
  } catch (e) { log(`Error loading settings: ${e.message}`, 'red'); }
  return { enabled: true };
}

global.antiDeleteSettings = loadAntiDeleteSettings();
global.autoStatusSettings = { 
  viewEnabled: config.AUTO_STATUS_SEEN === "true",
  reactEnabled: config.AUTO_STATUS_REACT === "true",
  customEmojis: ['❤️', '🔥', '✨', '🙌'],
  lastReactionTime: {},
  reactionInterval: 1
};

// ==================== CONNECTION LOGIC ====================
const sessionDir = path.join(__dirname, 'sessions');

async function connectToWA() {
  log('Connecting to WhatsApp...', 'cyan');
  
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();
  
  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    browser: Browsers.macOS("Firefox"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    version
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      log(`Connection closed: ${statusCode}`, 'yellow');
      if (statusCode !== DisconnectReason.loggedOut) {
        log('Retrying in 5 seconds...', 'green');
        setTimeout(() => connectToWA(), 5000);
      }
    } else if (connection === 'open') {
      log('Bot connected successfully! ✅', 'green');
      global.isBotConnected = true;
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ================== MESSAGE HANDLER ==================
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      if (!mek.messages || !mek.messages[0]) return;
      const m = sms(conn, mek.messages[0]);
      const msg = mek.messages[0];
      const from = msg.key.remoteJid;

      // Status Viewer
      if (from === 'status@broadcast' && global.autoStatusSettings.viewEnabled) {
        await conn.readMessages([msg.key]);
        log(`Status viewed from: ${msg.key.participant.split('@')[0]}`, 'green');
        return;
      }

      // Owner/Command Logic
      const body = (getContentType(msg.message) === 'conversation') ? msg.message.conversation : 
                   (getContentType(msg.message) === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';
      
      if (body.startsWith(config.PREFIX) && ownerNumber.includes(msg.key.participant?.split('@')[0])) {
         // Add your command handling here
      }

    } catch (e) {
      log("Message Error: " + e.message, 'red');
    }
  });

  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  return conn;
}

// EXPRESS SERVER
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("ADEEL-MD³⁰³ ACTIVE"));
app.listen(process.env.PORT || 9090);

// START
setTimeout(() => connectToWA(), 3000);
