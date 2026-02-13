// index.js (TOP)

process.on('unhandledRejection', (reason) => {
  if (String(reason).includes('rate-overlimit')) {
    console.log('[ RATE LIMIT ] WhatsApp throttled requests');
    return;
  }
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  if (String(err).includes('rate-overlimit')) {
    console.log('[ RATE LIMIT ] WhatsApp throttled requests');
    return;
  }
  console.error('Uncaught Exception:', err);
});
/**
 * FAIZAN-MD⁸⁷³ Bot - Ultimate Fixed & Optimized Version
 * ✅ Anti-Delete (All Media) | ✅ Auto Status View | ✅ No Crashes | ✅ Maximum Uptime
 * © 2026 Faizan Botz
 */

// ==================== CORE IMPORTS ====================
const config = require('./config');
const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');
const P = require('pino');
const chalk = require('chalk');
const axios = require('axios');
const { rmSync } = require('fs');

// ==================== BAILEYS IMPORTS ====================
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

// ==================== CUSTOM IMPORTS ====================
const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const GroupEvents = require('./lib/groupevents');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');

// ==================== PERFORMANCE OPTIMIZATION ====================
if (process.env.NODE_OPTIONS !== '--max-old-space-size=4096') {
    process.env.NODE_OPTIONS = '--max-old-space-size=4096';
}
process.env.UV_THREADPOOL_SIZE = '128';

// ==================== GLOBAL VARIABLES ====================
global.isBotConnected = false;
global.errorRetryCount = 0;
global.messageCache = new Map();
global.isRestarting = false;

// ==================== LOGGING SYSTEM ====================
function log(message, color = 'white', isError = false) {
    const prefix = chalk.blue.bold('[ FAIZAN-MD⁸⁷³ ]');
    const logFunc = isError ? console.error : console.log;
    const coloredMessage = chalk[color](message);
    
    if (message.includes('\n') || message.includes('════')) {
        logFunc(prefix, coloredMessage);
    } else {
        logFunc(`${prefix} ${coloredMessage}`);
    }
}

// ==================== FILE PATHS ====================
const SESSION_DIR = path.join(__dirname, 'sessions');
const CREDS_PATH = path.join(SESSION_DIR, 'creds.json');
const TEMP_MEDIA_DIR = path.join(__dirname, 'tmp_media');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
const ANTIDELETE_SETTINGS_FILE = path.join(__dirname, 'antidelete_settings.json');
const AUTOSTATUS_SETTINGS_FILE = path.join(__dirname, 'autostatus_settings.json');
const tempDir = path.join(os.tmpdir(), 'cache-temp');

// ==================== INITIAL SETUP ====================
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// ==================== CLEANUP FUNCTIONS ====================
const clearTempDir = () => {
    try {
        fs.readdir(tempDir, (err, files) => {
            if (err) return;
            for (const file of files) {
                try {
                    fs.unlinkSync(path.join(tempDir, file));
                } catch (e) {}
            }
        });
    } catch (error) {}
};

function cleanupJunkFiles() {
    try {
        const junkExtensions = ['.gif', '.png', '.mp3', '.mp4', '.opus', '.jpg', '.webp', '.webm', '.zip'];
        fs.readdir(__dirname, (err, files) => {
            if (err) return;
            const filteredArray = files.filter(item => 
                junkExtensions.some(ext => item.endsWith(ext))
            );
            if (filteredArray.length > 0) {
                let deleted = 0;
                filteredArray.forEach(file => {
                    const filePath = path.join(__dirname, file);
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            deleted++;
                        }
                    } catch (e) {}
                });
                if (deleted > 0) {
                    log(`🗑️ Deleted ${deleted} junk files`, 'cyan');
                }
            }
        });
    } catch (error) {}
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
                if (fileAge > 60 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                    deleted++;
                }
            } catch (e) {}
        });
        if (deleted > 0) {
            log(`🧹 Cleaned ${deleted} temp media files`, 'cyan');
        }
    } catch (error) {}
}

// ==================== SESSION AUTH ====================
if (!fs.existsSync(CREDS_PATH)) {
    if (config.SESSION_ID && config.SESSION_ID.trim() !== "") {
        const sessdata = config.SESSION_ID.replace("MAFIA-MD~", '');
        try {
            const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
            fs.writeFileSync(CREDS_PATH, decodedData);
            log("✅ Session loaded from SESSION_ID", 'green');
        } catch (err) {
            log("❌ Error decoding session data: " + err, 'red', true);
        }
    }
}

// ==================== ANTI-DELETE SYSTEM ====================
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
    return { enabled: true };
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

// ==================== AUTO STATUS SYSTEM ====================
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

// ==================== ERROR HANDLING ====================
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
        }
    } catch (e) {}
}

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
        log('🚨 MAX TIMEOUTS REACHED - Cleaning session', 'red');
        deleteErrorCountFile();
        global.errorRetryCount = 0;
        await delay(5000);
        process.exit(1);
    }
    return true;
}

// ==================== OWNER NUMBERS ====================
const prefix = config.PREFIX;
const ownerNumber = ['923089497853', '923266105873'];
const botInstallers = ['923089497853', '923266105873', '923321766681'];
const botCreators = ['923089497853', '923266105873'];

// ==================== STORE MESSAGE WITH MEDIA ====================
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

        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || 
                                 message.message?.viewOnceMessage?.message;
        
        const actualMessage = viewOnceContainer || message.message;

        // Extract content
        if (actualMessage?.conversation) {
            content = actualMessage.conversation;
        } else if (actualMessage?.extendedTextMessage?.text) {
            content = actualMessage.extendedTextMessage.text;
        } else if (actualMessage?.imageMessage) {
            mediaType = 'image';
            content = actualMessage.imageMessage.caption || '';
        } else if (actualMessage?.videoMessage) {
            mediaType = 'video';
            content = actualMessage.videoMessage.caption || '';
        } else if (actualMessage?.audioMessage) {
            mediaType = actualMessage.audioMessage.ptt ? 'voice' : 'audio';
        } else if (actualMessage?.stickerMessage) {
            mediaType = 'sticker';
        } else if (actualMessage?.documentMessage) {
            mediaType = 'document';
            content = actualMessage.documentMessage.caption || actualMessage.documentMessage.fileName || '';
        }

        // Store in memory
        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            chatId,
            isGroup: chatId.endsWith('@g.us'),
            timestamp: new Date().toISOString(),
            isViewOnce: !!viewOnceContainer,
            messageData: message
        });

        // Cleanup old messages
        if (messageStore.size > 100) {
            const firstKey = messageStore.keys().next().value;
            messageStore.delete(firstKey);
        }

    } catch (error) {
        log(`Store message error: ${error.message}`, 'red', true);
    }
}

// ==================== HANDLE DELETED MESSAGE ====================
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

                // Remove from store
                messageStore.delete(messageId);
            }
        }
    } catch (error) {
        log(`Handle delete error: ${error.message}`, 'red', true);
    }
}

// ==================== STATUS HANDLING ====================
async function markStatusAsSeen(conn, statusJid, statusId) {
    try {
        await conn.readMessages([{
            remoteJid: 'status@broadcast',
            id: statusId,
            fromMe: false,
            participant: statusJid
        }]);
        return true;
    } catch (error) {
        return false;
    }
}

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
        return true;
    } catch (error) {
        return false;
    }
}

function getRandomEmoji() {
    const emojis = global.autoStatusSettings.customEmojis || ['❤️', '🔥', '⭐', '👍', '💯'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ==================== MAIN CONNECTION FUNCTION ====================
async function connectToWA() {
    if (global.isRestarting) return;
    
    log('[🔰] Connecting to WhatsApp...', 'cyan');
    global.isBotConnected = false;
    
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();
    
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        },
        syncFullHistory: true,
        version,
        getMessage: async (key) => {
            if (global.messageCache.has(key.id)) {
                return global.messageCache.get(key.id);
            }
            return proto.Message.fromObject({});
        },
        connectTimeoutMs: 30000,
        keepAliveIntervalMs: 20000,
        emitOwnEvents: false,
        fireInitQueries: true,
        qrTimeout: 45000,
        shouldIgnoreJid: jid => isJidBroadcast(jid)
    });

    // ==================== CONNECTION UPDATE ====================
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            global.isBotConnected = false;
            
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            
            log(`Connection closed: ${statusCode}`, 'yellow');
            
            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                log('🚨 LOGGED OUT! Cleaning session...', 'red');
                try {
                    rmSync(SESSION_DIR, { recursive: true, force: true });
                } catch (e) {}
                await delay(5000);
                connectToWA();
            } else if (statusCode === DisconnectReason.timedOut) {
                const is408Handled = await handle408Error(statusCode);
                if (!is408Handled) {
                    setTimeout(connectToWA, 2000);
                }
            } else {
                setTimeout(connectToWA, 3000);
            }
        } else if (connection === 'open') {
            global.isBotConnected = true;
            global.errorRetryCount = 0;
            deleteErrorCountFile();
            
            log('🧬 Installing Plugins', 'cyan');
            const pluginPath = path.join(__dirname, 'plugins');
            if (fs.existsSync(pluginPath)) {
                fs.readdirSync(pluginPath).forEach((plugin) => {
                    if (path.extname(plugin).toLowerCase() === ".js") {
                        try {
                            require(path.join(pluginPath, plugin));
                        } catch (e) {
                            log(`Error loading plugin ${plugin}: ${e}`, 'red', true);
                        }
                    }
                });
            }
            log('✅ Plugins installed successfully', 'green');
            log('✅ Bot connected to WhatsApp', 'green');
            
            // Send welcome message
            let up = `*Hello there FAIZAN-MD⁸⁷³ User! 👋🏻* \n\n> Simple , Straight Forward But Loaded With Features 🎊, Meet FAIZAN-MD⁸⁷³ WhatsApp Bot.\n\n *Thanks for using FAIZAN-MD⁸⁷³ 🚩* \n\n> Join WhatsApp Channel :- ⤵️\n \nhttps://whatsapp.com/channel/0029VbBmz4V5vKAIaWfYPT0C \n\n- *YOUR PREFIX:* = ${prefix}\n\nDont forget to give star to repo ⬇️\n\nhttps://github.com/Faizan-MD-BOTZ/Faizan-Ai\n\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ FAIZAN-MD⁸⁷³ ❣️ 🖤`;
            conn.sendMessage(conn.user.id, { image: { url: `https://files.catbox.moe/ejufwa.jpg` }, caption: up });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    // ==================== MESSAGE STORING ====================
    conn.ev.on('messages.upsert', async chatUpdate => {
        try {
            for (const msg of chatUpdate.messages) {
                if (!msg.message) continue;
                await storeMessageWithMedia(conn, msg);
                let messageId = msg.key.id;
                global.messageCache.set(messageId, msg.message);
                
                if (global.messageCache.size > 500) {
                    const firstKey = global.messageCache.keys().next().value;
                    global.messageCache.delete(firstKey);
                }
            }
        } catch (error) {}
    });

    // ==================== ANTI-DELETE HANDLER ====================
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                await handleDeletedMessage(conn, updates);
            }
        }
    });

    // ==================== ANTI-CALL ====================
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
            }
        } catch (err) {}
    });

    // ==================== GROUP EVENTS ====================
    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update));

    // ==================== MESSAGE HANDLER ====================
    conn.ev.on('messages.upsert', async (mek) => {
        try {
            if (!mek.messages || !mek.messages[0]) return;
            mek = mek.messages[0];
            if (!mek.message) return;
            
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                ? mek.message.ephemeralMessage.message 
                : mek.message;

            // ==================== STATUS HANDLING ====================
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                try {
                    const statusId = mek.key.id;
                    const statusJid = mek.key.participant || mek.participant;
                    
                    if (!statusJid || statusJid === 'status@broadcast') return;
                    
                    // AUTO STATUS VIEW
                    if (global.autoStatusSettings.viewEnabled) {
                        setTimeout(async () => {
                            await markStatusAsSeen(conn, statusJid, statusId);
                        }, 1000);
                    }
                    
                    // AUTO STATUS REACT
                    if (global.autoStatusSettings.reactEnabled) {
                        setTimeout(async () => {
                            const randomChance = global.autoStatusSettings.randomChance || 100;
                            const shouldReact = Math.random() * 100 <= randomChance;
                            
                            if (shouldReact) {
                                const emoji = getRandomEmoji();
                                await delay(2000);
                                await reactToStatus(conn, statusJid, statusId, emoji);
                            }
                        }, 1500);
                    }
                    
                    // AUTO STATUS REPLY
                    if (global.autoStatusSettings.replyEnabled) {
                        setTimeout(async () => {
                            const replyText = config.AUTO_STATUS_MSG || 'Nice status! 💜';
                            await conn.sendMessage(statusJid, { text: replyText });
                        }, 3000);
                    }
                    
                } catch (error) {}
                return;
            }

            // READ MESSAGE
            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key]);
            }

            // VIEW ONCE
            if (mek.message.viewOnceMessageV2) {
                mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
            }

            await Promise.all([saveMessage(mek)]);

            const m = sms(conn, mek);
            const type = getContentType(mek.message);
            const from = mek.key.remoteJid;
            const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
            const body = (type === 'conversation') ? mek.message.conversation : 
                        (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : 
                        (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : 
                        (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';
            const isCmd = body.startsWith(prefix);
            const budy = typeof mek.text == 'string' ? mek.text : false;
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = body.trim().split(/ +/).slice(1);
            const q = args.join(' ');
            const text = args.join(' ');
            const isGroup = from.endsWith('@g.us');
            const sender = mek.key.fromMe ? conn.user.id : (mek.key.participant || mek.key.remoteJid);
            const senderNumber = sender.split('@')[0];
            const botNumber = conn.user.id.split(':')[0];
            const pushname = mek.pushName || 'Sin Nombre';
            const isMe = botNumber.includes(senderNumber);
            const isOwner = ownerNumber.includes(senderNumber) || isMe;
            const isBotInstaller = botInstallers.includes(senderNumber);
            const isBotCreator = botCreators.includes(senderNumber);
            const isSpecialUser = isOwner || isBotInstaller || isBotCreator;
            
            const botNumber2 = await jidNormalizedUser(conn.user.id);
            const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(() => null) : null;
            const groupName = isGroup ? groupMetadata?.subject : '';
            const participants = isGroup && groupMetadata?.participants ? groupMetadata.participants : [];
            const groupAdmins = isGroup ? await getGroupAdmins(participants) : [];
            const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
            const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
            const isReact = m.message.reactionMessage ? true : false;

            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek });
            };

            // ==================== ANTI-DELETE COMMAND ====================
            if (isSpecialUser && command === 'antidelete') {
                const arg = args[0]?.toLowerCase();
                if (arg === 'on') {
                    global.antiDeleteSettings.enabled = true;
                    saveAntiDeleteSettings(global.antiDeleteSettings);
                    reply('✅ *Anti-Delete ENABLED*');
                } else if (arg === 'off') {
                    global.antiDeleteSettings.enabled = false;
                    saveAntiDeleteSettings(global.antiDeleteSettings);
                    reply('❌ *Anti-Delete DISABLED*');
                } else {
                    reply(`*🗑️ ANTI-DELETE STATUS*\n\nCurrent: ${global.antiDeleteSettings.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n\nUsage: ${prefix}antidelete on/off`);
                }
                return;
            }

            // ==================== AUTO STATUS COMMAND ====================
            if (isSpecialUser && command === 'autostatus') {
                const subCmd = args[0]?.toLowerCase();
                if (!subCmd) {
                    const viewStatus = global.autoStatusSettings.viewEnabled ? '✅ ON' : '❌ OFF';
                    const reactStatus = global.autoStatusSettings.reactEnabled ? '✅ ON' : '❌ OFF';
                    const replyStatus = global.autoStatusSettings.replyEnabled ? '✅ ON' : '❌ OFF';
                    reply(`*⚙️ AUTO STATUS SETTINGS*\n\n📱 View: ${viewStatus}\n💫 React: ${reactStatus}\n📩 Reply: ${replyStatus}\n\nCommands:\n${prefix}autostatus view on/off\n${prefix}autostatus react on/off\n${prefix}autostatus reply on/off`);
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

            // ==================== EVAL COMMANDS ====================
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
                    let resultTest = await eval('const a = async()=>{\n' + code + '\n}\na()');
                    let h = util.format(resultTest);
                    if (h === undefined) return;
                    else reply(h);
                } catch (err) {
                    reply(util.format(err));
                }
                return;
            }

            // ==================== REACTIONS ====================
            if (isSpecialUser && !isReact) {
                const reactions = ["👑", "💀", "📊", "⚙️", "🧠", "🎯", "📈", "📝", "🏆", "🌍", "🇵🇰", "💗", "❤️", "💥", "🌼", "🏵️", "💐", "🔥", "❄️", "🌝", "🌚", "🐥", "🧊"];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }

            if (!isReact && config.AUTO_REACT === 'true') {
                const reactions = ['❤️', '🔥', '⭐', '👍', '💯', '😂', '😍', '😮', '😢', '👏'];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }

            if (!isReact && config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                m.react(randomReaction);
            }

            // ==================== MODE CHECK ====================
            if(!isSpecialUser && config.MODE === "private") return;
            if(!isSpecialUser && isGroup && config.MODE === "inbox") return;
            if(!isSpecialUser && !isGroup && config.MODE === "groups") return;

            // ==================== COMMAND HANDLER ====================
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
                            isMe, isOwner: isSpecialUser,
                            isCreator: isSpecialUser,
                            isBotInstaller,
                            isBotCreator,
                            isSpecialUser,
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
                        isCreator: isSpecialUser,
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
                        isCreator: isSpecialUser,
                        isBotInstaller,
                        isBotCreator,
                        isSpecialUser,
                        groupMetadata, groupName, participants, groupAdmins, 
                        isBotAdmins, isAdmins, reply
                    });
                } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                    command.function(conn, mek, m,{
                        from, l, quoted, body, isCmd, command, args, q, text, isGroup, 
                        sender, senderNumber, botNumber2, botNumber, pushname, 
                        isMe, isOwner: isSpecialUser,
                        isCreator: isSpecialUser,
                        isBotInstaller,
                        isBotCreator,
                        isSpecialUser,
                        groupMetadata, groupName, participants, groupAdmins, 
                        isBotAdmins, isAdmins, reply
                    });
                } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                    command.function(conn, mek, m,{
                        from, l, quoted, body, isCmd, command, args, q, text, isGroup, 
                        sender, senderNumber, botNumber2, botNumber, pushname, 
                        isMe, isOwner: isSpecialUser,
                        isCreator: isSpecialUser,
                        isBotInstaller,
                        isBotCreator,
                        isSpecialUser,
                        groupMetadata, groupName, participants, groupAdmins, 
                        isBotAdmins, isAdmins, reply
                    });
                }
            });

        } catch (e) {
            log('Message handler error: ' + e, 'red', true);
        }
    });

    // ==================== HELPER FUNCTIONS ====================
    conn.decodeJid = jid => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (
                (decode.user &&
                decode.server &&
                decode.user + '@' + decode.server) ||
                jid
            );
        } else return jid;
    };

    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype;
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined);
            vtype = Object.keys(message.message.viewOnceMessage.message)[0];
            delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined));
            delete message.message.viewOnceMessage.message[vtype].viewOnce;
            message.message = {
                ...message.message.viewOnceMessage.message
            };
        }
    
        let mtype = Object.keys(message.message)[0];
        let content = await generateForwardMessageContent(message, forceForward);
        let ctype = Object.keys(content)[0];
        let context = {};
        if (mtype != "conversation") context = message.message[mtype].contextInfo;
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        };
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {});
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
        return waMessage;
    };

    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fromBuffer(buffer);
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url);
        mime = res.headers['content-type'];
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options });
        }
        let type = mime.split("/")[0] + "Message";
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options });
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options });
        }
    };

    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === 'ephemeralMessage';
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
        let content = msg[mtype];
        if (typeof content === 'string') msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text;
        if (typeof content !== 'string') msg[mtype] = {
            ...content,
            ...options
        };
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === conn.user.id;
    
        return proto.WebMessageInfo.fromObject(copy);
    };

    conn.getFile = async(PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split `,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        let filename = path.join(__filename, __dirname + new Date * 1 + '.' + type.ext);
        if (data && save) fs.promises.writeFile(filename, data);
        return {
            res,
            filename,
            size: await getSizeMedia(data),
            ...type,
            data
        };
    };

    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await conn.getFile(PATH, true);
        let { filename, size, ext, mime, data } = types;
        let type = '',
            mimetype = mime,
            pathFile = filename;
        if (options.asDocument) type = 'document';
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./exif.js');
            let media = { mimetype: mime, data };
            pathFile = await writeExif(media, { packname: config.packname, author: config.packname, categories: options.categories ? options.categories : [] });
            await fs.promises.unlink(filename);
            type = 'sticker';
            mimetype = 'image/webp';
        } else if (/image/.test(mime)) type = 'image';
        else if (/video/.test(mime)) type = 'video';
        else if (/audio/.test(mime)) type = 'audio';
        else type = 'document';
        await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            mimetype,
            fileName,
            ...options
        }, { quoted, ...options });
        return fs.promises.unlink(pathFile);
    };

    conn.parseMention = async(text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    };

    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await conn.getFile(path, true);
        let { mime, ext, res, data, filename } = types;
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } } catch (e) { if (e.json) throw e.json }
        }
        let type = '',
            mimetype = mime,
            pathFile = filename;
        if (options.asDocument) type = 'document';
        if (options.asSticker || /webp/.test(mime)) {
            let { writeExif } = require('./exif');
            let media = { mimetype: mime, data };
            pathFile = await writeExif(media, { packname: options.packname ? options.packname : config.packname, author: options.author ? options.author : config.author, categories: options.categories ? options.categories : [] });
            await fs.promises.unlink(filename);
            type = 'sticker';
            mimetype = 'image/webp';
        } else if (/image/.test(mime)) type = 'image';
        else if (/video/.test(mime)) type = 'video';
        else if (/audio/.test(mime)) type = 'audio';
        else type = 'document';
        await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            caption,
            mimetype,
            fileName,
            ...options
        }, { quoted, ...options });
        return fs.promises.unlink(pathFile);
    };

    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
        await conn.sendMessage(
            jid,
            { sticker: { url: buffer }, ...options },
            options
        );
    };

    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        await conn.sendMessage(
            jid,
            { sticker: { url: buffer }, ...options },
            options
        );
    };

    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted });

    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split `,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
    };

    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted });

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        };
        conn.sendMessage(jid, buttonMessage, { quoted, ...options });
    };

    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
        let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options);
        conn.relayMessage(jid, template.message, { messageId: template.key.id });
    };

    conn.getName = (jid, withoutContact = false) => {
        id = conn.decodeJid(jid);
        withoutContact = conn.withoutContact || withoutContact;
        let v;
        if (id.endsWith('@g.us'))
            return new Promise(async resolve => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject))
                    v = conn.groupMetadata(id) || {};
                resolve(
                    v.name ||
                    v.subject ||
                    PhoneNumber(
                        '+' + id.replace('@s.whatsapp.net', ''),
                    ).getNumber('international'),
                );
            });
        else
            v =
                id === '0@s.whatsapp.net'
                ? {
                    id,
                    name: 'WhatsApp',
                }
                : id === conn.decodeJid(conn.user.id)
                ? conn.user
                : store.contacts[id] || {};
        return (
            (withoutContact ? '' : v.name) ||
            v.subject ||
            v.verifiedName ||
            PhoneNumber(
                '+' + jid.replace('@s.whatsapp.net', ''),
            ).getNumber('international')
        );
    };

    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: await conn.getName(i + '@s.whatsapp.net'),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(
                    i + '@s.whatsapp.net',
                )}\nFN:${
                    global.OwnerName
                }\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${
                    global.email
                }\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/${
                    global.github
                }/FAIZAN-MD\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${
                    global.location
                };;;;\item4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        conn.sendMessage(
            jid,
            {
                contacts: {
                    displayName: `${list.length} Contact`,
                    contacts: list,
                },
                ...opts,
            },
            { quoted },
        );
    };

    conn.setStatus = status => {
        conn.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [
                {
                    tag: 'status',
                    attrs: {},
                    content: Buffer.from(status, 'utf-8'),
                },
            ],
        });
        return status;
    };

    conn.serializeM = mek => sms(conn, mek, store);

    // ==================== CLEANUP INTERVALS ====================
    setInterval(clearTempDir, 5 * 60 * 1000);
    setInterval(cleanupJunkFiles, 60000);
    setInterval(cleanupTempMedia, 30 * 60 * 1000);
    setInterval(() => {
        if (global.messageCache.size > 300) {
            const keysToDelete = Array.from(global.messageCache.keys()).slice(0, 100);
            keysToDelete.forEach(key => global.messageCache.delete(key));
        }
    }, 10 * 60 * 1000);

    return conn;
}

// ==================== EXPRESS SERVER ====================
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

app.get("/", (req, res) => {
    res.send("FAIZAN-MD⁸⁷³ STARTED ✅");
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        uptime: process.uptime(),
        connected: global.isBotConnected,
        timestamp: new Date().toISOString()
    });
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.listen(port, () => log(`Server listening on http://localhost:${port}`, 'green'));

// ==================== KEEP-ALIVE ====================
if (process.env.RENDER_EXTERNAL_URL || process.env.DYNO || process.env.KOYEB_PUBLIC_DOMAIN) {
    setInterval(() => {
        try {
            const baseUrl = process.env.RENDER_EXTERNAL_URL || 
                           `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` ||
                           `https://${process.env.KOYEB_PUBLIC_DOMAIN}`;
            
            if (baseUrl && baseUrl !== 'undefined') {
                axios.get(`${baseUrl}/ping`).catch(() => {});
            }
        } catch (error) {}
    }, 5 * 60 * 1000);
}

// ==================== START BOT ====================
setTimeout(() => {
    connectToWA();
}, 4000);

// ==================== ERROR HANDLERS ====================
process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`, 'red', true);
});

process.on('unhandledRejection', (err) => {
    log(`Unhandled Rejection: ${err.message}`, 'red', true);
});

process.on('SIGTERM', () => {
    log('SIGTERM received, cleaning up...', 'yellow');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('SIGINT received, cleaning up...', 'yellow');
    process.exit(0);
});

setInterval(() => {
    const used = process.memoryUsage();
    const mb = (bytes) => Math.round(bytes / 1024 / 1024);
    
    if (mb(used.heapUsed) > 400) {
        log(`⚠️ High memory: ${mb(used.heapUsed)}MB`, 'yellow');
        if (global.gc) {
            global.gc();
        }
    }
}, 15 * 60 * 1000);

log('✅ FAIZAN-MD⁸⁷³ Bot initialized!', 'green');
