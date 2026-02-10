/**
 * MAFIA ADEEL Bot - Original Fixed
 * © 2026 Adeel Botz
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
  generateWAMessageContent,
  generateWAMessage,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { saveMessage } = require('./data');
const fs = require('fs');
const P = require('pino');
const GroupEvents = require('./lib/groupevents');
const path = require('path');
const chalk = require('chalk');
const os = require('os');
const util = require('util');
const { sms } = require('./lib');
const FileType = require('file-type');
const { Boom } = require('@hapi/boom');

// ==================== GLOBAL CONFIG & PATHS ====================
// (Inhe sirf ek baar declare kiya gaya hai taaki crash na ho)
const MESSAGE_STORE_FILE = path.join(__dirname, 'message_backup.json');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
const ANTIDELETE_SETTINGS_FILE = path.join(__dirname, 'antidelete_settings.json');
const AUTOSTATUS_SETTINGS_FILE = path.join(__dirname, 'autostatus_settings.json');
const TEMP_MEDIA_DIR = path.join(__dirname, 'tmp_media');

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
  fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

global.isBotConnected = false;
global.messageCache = new Map();
const messageStore = new Map();

// ==================== LOGGING FUNCTION ====================
function log(message, color = 'white', isError = false) {
  const prefix = chalk.blue.bold('[ ADEEL-MD³⁰³ ]');
  const logFunc = isError ? console.error : console.log;
  const coloredMessage = chalk[color] ? chalk[color](message) : message;
  logFunc(`${prefix} ${coloredMessage}`);
}

// ==================== SETTINGS LOADERS ====================
function loadSettings(file, defaultVal) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) { log(`Error loading ${file}: ${e.message}`, 'red'); }
  return defaultVal;
}

global.antiDeleteSettings = loadSettings(ANTIDELETE_SETTINGS_FILE, { enabled: true });
global.autoStatusSettings = loadSettings(AUTOSTATUS_SETTINGS_FILE, { 
  viewEnabled: config.AUTO_STATUS_SEEN === "true",
  reactEnabled: config.AUTO_STATUS_REACT === "true",
  replyEnabled: config.AUTO_STATUS_REPLY === "true",
  customEmojis: ['❤️', '🔥', '✨', '🙌', '💯']
});

// ==================== TEMP DIR CLEANUP ====================
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

setInterval(() => {
  fs.readdir(tempDir, (err, files) => {
    if (!err) files.forEach(file => {
      try { fs.unlinkSync(path.join(tempDir, file)); } catch (e) {}
    });
  });
}, 5 * 60 * 1000);

// ==================== SESSION AUTH ====================
const sessionDir = path.join(__dirname, 'sessions');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

if (!fs.existsSync(credsPath) && config.SESSION_ID) {
    const sessdata = config.SESSION_ID.replace("ADEEL-XMD~", '');
    try {
      const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
      fs.writeFileSync(credsPath, decodedData);
      log("✅ Session loaded from SESSION_ID", 'green');
    } catch (err) {
      log("❌ Error decoding session data: " + err, 'red', true);
    }
}

// ==================== MAIN CONNECTION ====================
async function connectToWA() {
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
      if (statusCode !== DisconnectReason.loggedOut) {
        log('Reconnecting...', 'yellow');
        setTimeout(connectToWA, 5000);
      }
    } else if (connection === 'open') {
      log('Bot connected successfully! ✅', 'green');
      global.isBotConnected = true;
      
      // Plugins Loading
      const pluginPath = path.join(__dirname, 'plugins');
      if (fs.existsSync(pluginPath)) {
        fs.readdirSync(pluginPath).forEach(file => {
          if (file.endsWith(".js")) require(path.join(pluginPath, file));
        });
      }
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // ==================== MESSAGE HANDLER ====================
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      if (!mek.messages[0].message) return;
      const m = sms(conn, mek.messages[0]);
      const from = m.key.remoteJid;

      // 1. AUTO STATUS VIEW & REACT
      if (from === 'status@broadcast') {
        if (global.autoStatusSettings.viewEnabled) {
          await conn.readMessages([m.key]);
        }
        if (global.autoStatusSettings.reactEnabled) {
          const emoji = global.autoStatusSettings.customEmojis[Math.floor(Math.random() * global.autoStatusSettings.customEmojis.length)];
          await conn.sendMessage('status@broadcast', { react: { text: emoji, key: m.key } }, { statusJidList: [m.key.participant] });
        }
        return;
      }

      // 2. NEWSLETTER REACT
      const newsletterJids = ["120363423571792427@newsletter"];
      if (newsletterJids.includes(from) && m.newsletterServerId) {
          const emojis = ["❤️", "🔥", "✨"];
          await conn.newsletterReactMessage(from, m.newsletterServerId.toString(), emojis[Math.floor(Math.random() * emojis.length)]);
      }

      // 3. COMMAND HANDLER (Simplified)
      const body = m.body || '';
      const isCmd = body.startsWith(config.PREFIX);
      if (isCmd) {
        const command = body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase();
        const events = require('./command');
        const cmd = events.commands.find(c => c.pattern === command || (c.alias && c.alias.includes(command)));
        if (cmd) {
          cmd.function(conn, mek.messages[0], m, { from, body, isCmd, reply: (t) => conn.sendMessage(from, { text: t }, { quoted: m }) });
        }
      }

    } catch (e) { log("Error: " + e.message, 'red'); }
  });
}

// Express for Uptime
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("ADEEL-MD³⁰³ IS ALIVE"));
app.listen(process.env.PORT || 9090);

connectToWA();
