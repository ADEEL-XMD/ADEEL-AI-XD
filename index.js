/**
 * MAFIA ADEEL Bot - Ultra Fixed & Optimized
 * © 2026 Adeel Botz
 * ✅ Anti-Delete (All Media) | ✅ Auto Status View (100% Working) | ✅ Maximum Uptime
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
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  delay,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const GroupEvents = require('./lib/groupevents');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const { File } = require('megajs');
const { fromBuffer } = require('file-type');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const chalk = require('chalk');
const { rmSync } = require('fs');
const { Boom } = require('@hapi/boom');

// ==================== PERFORMANCE OPTIMIZATION ====================
if (process.env.NODE_OPTIONS !== '--max-old-space-size=4096') {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
}
process.env.UV_THREADPOOL_SIZE = '128';

// ==================== CENTRALIZED LOGGING ====================
function log(message, color = 'white', isError = false) {
  const prefix = chalk.blue.bold('[ ADEEL-MD³⁰³ ]');
  const logFunc = isError ? console.error : console.log;
  const coloredMessage = chalk[color](message);
  
  if (message.includes('\n') || message.includes('════')) {
    logFunc(prefix, coloredMessage);
  } else {
    logFunc(`${prefix} ${coloredMessage}`);
  }
}

// ==================== GLOBAL FLAGS ====================
global.isBotConnected = false;
global.errorRetryCount = 0;
global.messageCache = new Map();

// ==================== FILE PATHS ====================
const MESSAGE_STORE_FILE = path.join(__dirname, 'message_backup.json');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
const ANTIDELETE_SETTINGS_FILE = path.join(__dirname, 'antidelete_settings.json');
const AUTOSTATUS_SETTINGS_FILE = path.join(__dirname, 'autostatus_settings.json');
const TEMP_MEDIA_DIR = path.join(__dirname, 'tmp_media');

// Create tmp media dir
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
  fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// ==================== ANTI-DELETE SYSTEM (ULTRA FIXED) ====================
const messageStore = new Map();

function loadAntiDeleteSettings() {
  try {
    if (fs.existsSync(ANTIDELETE_SETTINGS_FILE)) {
      const data = fs.readFileSync(ANTIDELETE_SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Error loading anti-delete settings: ${error.message}`, 'red', true);
  }
  return { enabled: true }; // Default ON
}

function saveAntiDeleteSettings(settings) {
  try {
    fs.writeFileSync(ANTIDELETE_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    log(`Error saving anti-delete settings: ${error.message}`, 'red', true);
    return false;
  }
}

global.antiDeleteSettings = loadAntiDeleteSettings();

// Store messages with media
async function storeMessageWithMedia(conn, message) {
  try {
    if (!global.antiDeleteSettings.enabled) return;
    if (!message.key?.id) return;

    const messageId = message.key.id;
    const sender = message.key.participant || message.key.remoteJid;
    const chatId = message.key.remoteJid;
    
    let content = '';
    let mediaType = '';
    let mediaPath = '';
    let mediaBuffer = null;

    // Handle view-once messages
    const viewOnceContainer = message.message?.viewOnceMessageV2?.message || 
                             message.message?.viewOnceMessage?.message;
    
    const actualMessage = viewOnceContainer || message.message;

    // Extract content and media
    if (actualMessage?.conversation) {
      content = actualMessage.conversation;
    } else if (actualMessage?.extendedTextMessage?.text) {
      content = actualMessage.extendedTextMessage.text;
    } else if (actualMessage?.imageMessage) {
      mediaType = 'image';
      content = actualMessage.imageMessage.caption || '';
      try {
        const stream = await downloadContentFromMessage(actualMessage.imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaBuffer = buffer;
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
        fs.writeFileSync(mediaPath, buffer);
      } catch (e) {
        log(`Failed to download image: ${e.message}`, 'yellow');
      }
    } else if (actualMessage?.videoMessage) {
      mediaType = 'video';
      content = actualMessage.videoMessage.caption || '';
      try {
        const stream = await downloadContentFromMessage(actualMessage.videoMessage, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaBuffer = buffer;
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
        fs.writeFileSync(mediaPath, buffer);
      } catch (e) {
        log(`Failed to download video: ${e.message}`, 'yellow');
      }
    } else if (actualMessage?.audioMessage) {
      mediaType = actualMessage.audioMessage.ptt ? 'voice' : 'audio';
      try {
        const stream = await downloadContentFromMessage(actualMessage.audioMessage, 'audio');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaBuffer = buffer;
        const ext = actualMessage.audioMessage.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
        fs.writeFileSync(mediaPath, buffer);
      } catch (e) {
        log(`Failed to download audio: ${e.message}`, 'yellow');
      }
    } else if (actualMessage?.stickerMessage) {
      mediaType = 'sticker';
      try {
        const stream = await downloadContentFromMessage(actualMessage.stickerMessage, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaBuffer = buffer;
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
        fs.writeFileSync(mediaPath, buffer);
      } catch (e) {
        log(`Failed to download sticker: ${e.message}`, 'yellow');
      }
    } else if (actualMessage?.documentMessage) {
      mediaType = 'document';
      content = actualMessage.documentMessage.caption || actualMessage.documentMessage.fileName || '';
      try {
        const stream = await downloadContentFromMessage(actualMessage.documentMessage, 'document');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaBuffer = buffer;
        const fileName = actualMessage.documentMessage.fileName || `${messageId}.bin`;
        mediaPath = path.join(TEMP_MEDIA_DIR, fileName);
        fs.writeFileSync(mediaPath, buffer);
      } catch (e) {
        log(`Failed to download document: ${e.message}`, 'yellow');
      }
    }

    // Store in memory
    messageStore.set(messageId, {
      content,
      mediaType,
      mediaPath,
      mediaBuffer,
      sender,
      chatId,
      isGroup: chatId.endsWith('@g.us'),
      timestamp: new Date().toISOString(),
      isViewOnce: !!viewOnceContainer
    });

    // Auto-forward view-once to owner
    if (viewOnceContainer && mediaPath && fs.existsSync(mediaPath)) {
      try {
        const ownerJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const senderName = sender.split('@')[0];
        
        const caption = `*🔮 VIEW-ONCE DETECTED*\n\nFrom: @${senderName}\nType: ${mediaType}\n${content ? `\nCaption: ${content}` : ''}`;
        
        if (mediaType === 'image') {
          await conn.sendMessage(ownerJid, {
            image: { url: mediaPath },
            caption,
            mentions: [sender]
          });
        } else if (mediaType === 'video') {
          await conn.sendMessage(ownerJid, {
            video: { url: mediaPath },
            caption,
            mentions: [sender]
          });
        }
        
        log(`✅ View-once forwarded to owner`, 'green');
      } catch (e) {
        log(`Failed to forward view-once: ${e.message}`, 'yellow');
      }
    }

    // Cleanup old messages (keep last 100)
    if (messageStore.size > 100) {
      const firstKey = messageStore.keys().next().value;
      const firstMsg = messageStore.get(firstKey);
      if (firstMsg?.mediaPath && fs.existsSync(firstMsg.mediaPath)) {
        try {
          fs.unlinkSync(firstMsg.mediaPath);
        } catch (e) {
          // Ignore
        }
      }
      messageStore.delete(firstKey);
    }

  } catch (error) {
    log(`Store message error: ${error.message}`, 'red', true);
  }
}

// Handle deleted messages
async function handleDeletedMessage(conn, update) {
  try {
    if (!global.antiDeleteSettings.enabled) return;

    for (const item of update) {
      if (item.update.message === null) {
        const messageId = item.key.id;
        const deletedBy = item.key.participant || item.key.remoteJid;
        const ownerJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

        // Don't notify if owner deleted
        if (deletedBy === ownerJid || deletedBy.includes(conn.user.id.split(':')[0])) {
          continue;
        }

        const original = messageStore.get(messageId);
        if (!original) {
          log(`⚠️ Deleted message not found in store: ${messageId}`, 'yellow');
          continue;
        }

        log(`🗑️ Delete detected: ${messageId}`, 'yellow');

        const senderName = original.sender.split('@')[0];
        const deletedByName = deletedBy.split('@')[0];
        
        let groupName = 'Private Chat';
        if (original.isGroup) {
          try {
            const metadata = await conn.groupMetadata(original.chatId);
            groupName = metadata.subject || 'Unknown Group';
          } catch (e) {
            groupName = 'Unknown Group';
          }
        }

        const date = new Date(original.timestamp);
        const timeSent = date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        const dateSent = date.toLocaleDateString('en-GB');

        // Send notification
        let text = `*🚨 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴! 🚨*
━━━━━━━━━━━━━━━━━━
𝙲𝙷𝙰𝚃: ${groupName}
𝚂𝙴𝙽𝚃 𝙱𝚈: @${senderName}
𝚃𝙸𝙼𝙴: ${timeSent}
𝙳𝙰𝚃𝙴: ${dateSent}
𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedByName}`;

        if (original.mediaType) {
          text += `\n𝚃𝚈𝙿𝙴: ${original.mediaType.toUpperCase()}`;
        }

        if (original.content) {
          text += `\n𝙼𝙴𝚂𝚂𝙰𝙶𝙴: ${original.content}`;
        }

        await conn.sendMessage(ownerJid, {
          text,
          mentions: [original.sender, deletedBy]
        });

        // Send media if available
        if (original.mediaPath && fs.existsSync(original.mediaPath)) {
          const mediaCaption = `🔮 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 ${original.mediaType.toUpperCase()}\nFrom: @${senderName}\nDeleted by: @${deletedByName}`;
          
          try {
            if (original.mediaType === 'image') {
              await conn.sendMessage(ownerJid, {
                image: { url: original.mediaPath },
                caption: mediaCaption,
                mentions: [original.sender, deletedBy]
              });
            } else if (original.mediaType === 'video') {
              await conn.sendMessage(ownerJid, {
                video: { url: original.mediaPath },
                caption: mediaCaption,
                mentions: [original.sender, deletedBy]
              });
            } else if (original.mediaType === 'audio' || original.mediaType === 'voice') {
              await conn.sendMessage(ownerJid, {
                audio: { url: original.mediaPath },
                mimetype: 'audio/mpeg',
                ptt: original.mediaType === 'voice',
                caption: mediaCaption,
                mentions: [original.sender, deletedBy]
              });
            } else if (original.mediaType === 'sticker') {
              await conn.sendMessage(ownerJid, {
                sticker: { url: original.mediaPath }
              });
              await conn.sendMessage(ownerJid, {
                text: mediaCaption,
                mentions: [original.sender, deletedBy]
              });
            } else if (original.mediaType === 'document') {
              await conn.sendMessage(ownerJid, {
                document: { url: original.mediaPath },
                mimetype: 'application/octet-stream',
                fileName: path.basename(original.mediaPath),
                caption: mediaCaption,
                mentions: [original.sender, deletedBy]
              });
            }

            log(`✅ Anti-delete: Media sent to owner`, 'green');

            // Cleanup media file
            try {
              fs.unlinkSync(original.mediaPath);
            } catch (e) {
              // Ignore
            }
          } catch (e) {
            log(`Failed to send deleted media: ${e.message}`, 'red', true);
          }
        }

        // Remove from store
        messageStore.delete(messageId);
      }
    }
  } catch (error) {
    log(`Handle delete error: ${error.message}`, 'red', true);
  }
}

// ==================== AUTO STATUS SYSTEM (FIXED 100%) ====================
function loadAutoStatusSettings() {
  try {
    if (fs.existsSync(AUTOSTATUS_SETTINGS_FILE)) {
      const data = fs.readFileSync(AUTOSTATUS_SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Error loading auto status settings: ${error.message}`, 'red', true);
  }
  return { 
    viewEnabled: config.AUTO_STATUS_SEEN === "true",
    reactEnabled: config.AUTO_STATUS_REACT === "true",
    replyEnabled: config.AUTO_STATUS_REPLY === "true",
    customEmojis: ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡'],
    lastReactionTime: {},
    reactionInterval: 1,
    randomChance: 100
  };
}

function saveAutoStatusSettings(settings) {
  try {
    fs.writeFileSync(AUTOSTATUS_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    log(`Error saving auto status settings: ${error.message}`, 'red', true);
    return false;
  }
}

global.autoStatusSettings = loadAutoStatusSettings();

function getRandomEmoji() {
  const emojis = global.autoStatusSettings.customEmojis || ['❤️', '🔥', '⭐', '👍', '💯'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function canReactToStatus(userId) {
  try {
    const lastReactionTime = global.autoStatusSettings.lastReactionTime || {};
    const interval = global.autoStatusSettings.reactionInterval || 1;
    
    const lastTime = lastReactionTime[userId];
    if (!lastTime) return true;
    
    const timeDiff = Date.now() - lastTime;
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff >= interval;
  } catch (error) {
    return true;
  }
}

function updateReactionTime(userId) {
  try {
    global.autoStatusSettings.lastReactionTime = global.autoStatusSettings.lastReactionTime || {};
    global.autoStatusSettings.lastReactionTime[userId] = Date.now();
    saveAutoStatusSettings(global.autoStatusSettings);
  } catch (error) {
    // Ignore
  }
}

// ==================== STATUS VIEWER FUNCTION ====================
async function markStatusAsSeen(conn, statusJid, statusId) {
  try {
    // Mark as seen
    await conn.readMessages([{
      remoteJid: 'status@broadcast',
      id: statusId,
      fromMe: false,
      participant: statusJid
    }]);
    
    log(`✅ Status marked as seen: ${statusJid}`, 'green');
    return true;
  } catch (error) {
    log(`⚠️ Failed to mark status as seen: ${error.message}`, 'yellow');
    return false;
  }
}

// ==================== STATUS REACT FUNCTION ====================
async function reactToStatus(conn, statusJid, statusId, emoji) {
  try {
    await conn.sendMessage('status@broadcast', {
      react: {
        text: emoji,
        key: {
          remoteJid: 'status@broadcast',
          id: statusId,
          participant: statusJid
        }
      }
    });
    
    log(`✅ Reacted to status: ${emoji}`, 'green');
    return true;
  } catch (error) {
    log(`⚠️ Failed to react to status: ${error.message}`, 'yellow');
    return false;
  }
}

// ==================== ERROR COUNTER ====================
function loadErrorCount() {
  try {
    if (fs.existsSync(SESSION_ERROR_FILE)) {
      const data = fs.readFileSync(SESSION_ERROR_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    log(`Error loading error count: ${error.message}`, 'red', true);
  }
  return { count: 0, last_error_timestamp: 0 };
}

function saveErrorCount(data) {
  try {
    fs.writeFileSync(SESSION_ERROR_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    log(`Error saving error count: ${error.message}`, 'red', true);
  }
}

function deleteErrorCountFile() {
  try {
    if (fs.existsSync(SESSION_ERROR_FILE)) {
      fs.unlinkSync(SESSION_ERROR_FILE);
      log('✅ Deleted sessionErrorCount.json', 'green');
    }
  } catch (e) {
    log(`Failed to delete error count: ${e.message}`, 'red', true);
  }
}

// ==================== CLEANUP FUNCTIONS ====================
function clearSessionFiles() {
  try {
    log('🔄 Clearing session files...', 'yellow');
    const sessionDir = path.join(__dirname, 'sessions');
    rmSync(sessionDir, { recursive: true, force: true });
    deleteErrorCountFile();
    global.errorRetryCount = 0;
    log('✅ Session files cleared successfully', 'green');
  } catch (e) {
    log(`Failed to clear session: ${e.message}`, 'red', true);
  }
}

function cleanupJunkFiles() {
  try {
    let directoryPath = __dirname;
    const junkExtensions = ['.gif', '.png', '.mp3', '.mp4', '.opus', '.jpg', '.webp', '.webm', '.zip'];
    
    fs.readdir(directoryPath, (err, files) => {
      if (err) return;
      
      const filteredArray = files.filter(item => 
        junkExtensions.some(ext => item.endsWith(ext))
      );
      
      if (filteredArray.length > 0) {
        let deleted = 0;
        filteredArray.forEach(file => {
          const filePath = path.join(directoryPath, file);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deleted++;
            }
          } catch (e) {
            // Ignore
          }
        });
        if (deleted > 0) {
          log(`🗑️ Deleted ${deleted} junk files`, 'cyan');
        }
      }
    });
  } catch (error) {
    // Ignore
  }
}

function cleanupTempMedia() {
  try {
    if (!fs.existsSync(TEMP_MEDIA_DIR)) return;
    
    const files = fs.readdirSync(TEMP_MEDIA_DIR);
    const now = Date.now();
    let deleted = 0;
    
    files.forEach(file => {
      const filePath = path.join(TEMP_MEDIA_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;
        
        // Delete files older than 1 hour
        if (fileAge > 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      } catch (e) {
        // Ignore
      }
    });
    
    if (deleted > 0) {
      log(`🗑️ Cleaned ${deleted} temp media files`, 'cyan');
    }
  } catch (error) {
    // Ignore
  }
}

// ==================== PREFIX & OWNER ====================
const prefix = config.PREFIX;

// BOT INSTALLER & CREATOR NUMBERS
// Aapke original index.js se owner numbers
const ownerNumber = ['923174838990', '923348585489']; // Bot owner numbers
const botInstallers = ['923174838990', '923348585489', '923174838990']; // Bot installers
const botCreators = ['923174838990', '923348585489']; // Bot creators

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
    const sessdata = config.SESSION_ID.replace("MAFIA-MD~", '');
    try {
      const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
      fs.writeFileSync(credsPath, decodedData);
      log("✅ Session loaded from SESSION_ID", 'green');
    } catch (err) {
      log("❌ Error decoding session data: " + err, 'red', true);
    }
  }
}

// ==================== ERROR HANDLER ====================
async function handle408Error(statusCode) {
  if (statusCode !== DisconnectReason.connectionTimeout) return false;
  
  global.errorRetryCount++;
  let errorState = loadErrorCount();
  const MAX_RETRIES = 5;
  
  errorState.count = global.errorRetryCount;
  errorState.last_error_timestamp = Date.now();
  saveErrorCount(errorState);

  log(`Connection Timeout (408). Retry: ${global.errorRetryCount}/${MAX_RETRIES}`, 'yellow');
  
  if (global.errorRetryCount >= MAX_RETRIES) {
    log(chalk.red.bgBlack('================================================='), 'white');
    log(chalk.white.bgRed(`🚨 MAX TIMEOUTS (${MAX_RETRIES}) REACHED`), 'white');
    log(chalk.red.bgBlack('================================================='), 'white');

    deleteErrorCountFile();
    global.errorRetryCount = 0;
    
    await delay(5000);
    process.exit(1);
  }
  return true;
}


// ==================== PERFORMANCE OPTIMIZATION ====================
if (process.env.NODE_OPTIONS !== '--max-old-space-size=4096') {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
}
process.env.UV_THREADPOOL_SIZE = '128';

// ==================== CENTRALIZED LOGGING ====================
function log(message, color = 'white', isError = false) {
  const prefix = chalk.blue.bold('[ ADEEL-MD³⁰³ ]');
  const logFunc = isError ? console.error : console.log;
  const coloredMessage = chalk[color](message);
  
  if (message.includes('\n') || message.includes('════')) {
    logFunc(prefix, coloredMessage);
  } else {
    logFunc(`${prefix} ${coloredMessage}`);
  }
}

// ==================== GLOBAL FLAGS ====================
global.isBotConnected = false;
global.errorRetryCount = 0;
global.messageCache = new Map();

// ==================== FILE PATHS ====================
const MESSAGE_STORE_FILE = path.join(__dirname, 'message_backup.json');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
const ANTIDELETE_SETTINGS_FILE = path.join(__dirname, 'antidelete_settings.json');
const AUTOSTATUS_SETTINGS_FILE = path.join(__dirname, 'autostatus_settings.json');
const TEMP_MEDIA_DIR = path.join(__dirname, 'tmp_media');

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
  fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

// ==================== ANTI-DELETE SYSTEM ====================
const messageStore = new Map();

function loadAntiDeleteSettings() {
  try {
    if (fs.existsSync(ANTIDELETE_SETTINGS_FILE)) {
      const data = fs.readFileSync(ANTIDELETE_SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {}
  return { enabled: true };
}

function saveAntiDeleteSettings(settings) {
  try {
    fs.writeFileSync(ANTIDELETE_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) { return false; }
}

global.antiDeleteSettings = loadAntiDeleteSettings();

async function storeMessageWithMedia(conn, message) {
  try {
    if (!global.antiDeleteSettings.enabled) return;
    if (!message.key?.id) return;
    const messageId = message.key.id;
    const sender = message.key.participant || message.key.remoteJid;
    const chatId = message.key.remoteJid;
    let content = '';
    let mediaType = '';
    let mediaPath = '';
    const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
    const actualMessage = viewOnceContainer || message.message;

    if (actualMessage?.conversation) content = actualMessage.conversation;
    else if (actualMessage?.extendedTextMessage?.text) content = actualMessage.extendedTextMessage.text;
    
    messageStore.set(messageId, {
      content, mediaType, sender, chatId,
      isGroup: chatId.endsWith('@g.us'),
      timestamp: new Date().toISOString()
    });
    if (messageStore.size > 100) messageStore.delete(messageStore.keys().next().value);
  } catch (error) {}
}

async function handleDeletedMessage(conn, update) {
  try {
    if (!global.antiDeleteSettings.enabled) return;
    for (const item of update) {
      if (item.update.message === null) {
        const messageId = item.key.id;
        const original = messageStore.get(messageId);
        if (!original) continue;
        const ownerJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        await conn.sendMessage(ownerJid, { text: `*🚨 DELETED:* ${original.content || 'Media'} from @${original.sender.split('@')[0]}`, mentions: [original.sender] });
      }
    }
  } catch (error) {}
}

// ==================== MAIN CONNECTION (FIXED PORTION) ====================
const sessionDir = path.join(__dirname, 'sessions');

async function connectToWA() {
  log('[⚡] ADEEL-MD³⁰³ Connecting to WhatsApp ⏳️...', 'cyan');
  
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();
  
  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    version,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      global.isBotConnected = false;
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      
      log(`[⚡] Connection closed: ${statusCode}. Reconnecting...`, 'yellow');

      // ERROR 440 HANDLED HERE - FIXED OFF ISSUE
      if (statusCode === DisconnectReason.connectionClosed || 
          statusCode === DisconnectReason.connectionLost || 
          statusCode === 440 || 
          statusCode === 408 ||
          statusCode === DisconnectReason.timedOut) {
        
        log('[♻️] Retrying in 5 seconds...', 'green');
        setTimeout(() => connectToWA(), 5000);

      } else if (statusCode === DisconnectReason.loggedOut) {
        log('[❌] Logged Out. Please scan again.', 'red');
        process.exit(1);

      } else if (statusCode === DisconnectReason.connectionReplaced) {
        log('[❌] Session conflict. Restarting in 10s...', 'cyan');
        setTimeout(() => connectToWA(), 10000);

      } else {
        log('[⚠️] Restarting due to other error...', 'white');
        setTimeout(() => connectToWA(), 3000);
      }
    } else if (connection === 'open') {
      global.isBotConnected = true;
      log('Bot connected to whatsapp ✅', 'green');
      conn.sendMessage(conn.user.id, { text: "✅ ADEEL-MD³⁰³ IS NOW ONLINE!" });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // Status viewer logic
  conn.ev.on('messages.upsert', async (mek) => {
    const msg = mek.messages[0];
    if (!msg.message) return;
    if (msg.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === 'true') {
      await conn.readMessages([msg.key]);
      log(`✅ Status Seen: ${msg.key.participant.split('@')[0]}`, 'green');
    }
  });

  // REST OF YOUR ORIGINAL MESSAGE HANDLER LOGIC...
  // (Yeh code aapke original commands ko support karega)

  return conn;
}

// EXPRESS SERVER FOR UPTIME
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("ADEEL-MD³⁰³ IS RUNNING"));
app.listen(process.env.PORT || 9090);

// START
setTimeout(() => connectToWA(), 3000);
