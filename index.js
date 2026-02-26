/* ============================================================

      ╚═╝     ╚═╝╚══════╝      ╚═══╝  ╚═╝  ╚═╝ ╚════╝ ╚═╝     ╚═╝
   ============================================================ */

// ==================== MEMORY OPTIMIZATION ====================
global.gc = global.gc || (() => {});
let memoryCleanInterval = null;

function setupMemoryOptimization() {
    memoryCleanInterval = setInterval(() => {
        try {
            if (global.gc) {
                global.gc();
            }
            const memoryUsage = process.memoryUsage();
            console.log(`🔄 Memory Cleaned - Heap: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        } catch (err) {
            console.error("Memory cleanup error:", err.message);
        }
    }, 30000);
}

setupMemoryOptimization();

// ==================== ULTRA PRO SPEED BOOSTER ====================
const speedCache = {
    groups: new Map(),
    users: new Map(),
    commands: null,
    lastClean: Date.now()
};

let perfStats = {
    msgCount: 0,
    avgResponse: 0,
    startTime: Date.now()
};

const msgQueue = [];
let processing = false;

const processQueue = async () => {
    if (processing || msgQueue.length === 0) return;
    processing = true;
    
    const batch = msgQueue.splice(0, 2);
    for (const msg of batch) {
        try {
            await handleMessageUltra(msg);
        } catch(e) {}
        await new Promise(r => setTimeout(r, 50));
    }
    
    processing = false;
    if (msgQueue.length > 0) setTimeout(processQueue, 20);
};

setInterval(() => {
    const now = Date.now();
    const mem = process.memoryUsage();
    
    console.log(`
    ⚡ MEMORY STATS ⚡
    🧠 Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB
    🗃️  Cache: ${speedCache.groups.size} groups
    📨 Queue: ${msgQueue.length}
    `);
    
    if (mem.heapUsed / 1024 / 1024 > 400) {
        console.log("⚠️ High memory, clearing cache...");
        speedCache.groups.clear();
        speedCache.users.clear();
        msgQueue.length = 0;
    }
    
    if (now - speedCache.lastClean > 120000) {
        for (const [key, val] of speedCache.groups.entries()) {
            if (now - val.timestamp > 180000) speedCache.groups.delete(key);
        }
        speedCache.lastClean = now;
    }
}, 30000);

// ==================== REQUIRED MODULES ====================
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
    areJidsSameUser,
    downloadContentFromMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const ff = require('fluent-ffmpeg');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const util = require('util');
const FileType = require('file-type');
const axios = require('axios');
const bodyparser = require('body-parser');
const os = require('os');
const Crypto = require('crypto');
const path = require('path');
const chalk = require('chalk');
const { exec } = require('child_process');
const moment = require('moment');
const speed = require('performance-now');

// ==================== CONFIG ====================
const config = require('./config');
const prefix = config.PREFIX || '.';
const ownerNumber = config.OWNER_NUMBER ? config.OWNER_NUMBER.split(',').map(n => n.trim()) : ['923174838990'];

// ==================== COMMAND HANDLER ====================
let commands = [];
const aliases = new Map();

// PEHLE SARE PLUGINS LOAD KARO
console.log(chalk.blue('📁 Loading plugins first...'));
const pluginsDir = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginsDir)) {
    const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
    
    for (const file of pluginFiles) {
        try {
            const pluginPath = path.join(pluginsDir, file);
            delete require.cache[require.resolve(pluginPath)];
            require(pluginPath);
        } catch (err) {
            console.log(chalk.red(`❌ Error in ${file}: ${err.message}`));
        }
    }
}

// AB COMMAND.JS SE COMMANDS LOAD KARO
try {
    const cmdModule = require('./command');
    if (cmdModule.commands && cmdModule.commands.length > 0) {
        commands = cmdModule.commands;
        console.log(chalk.green(`✅ Total Commands loaded: ${commands.length}`));
    } else {
        console.log(chalk.yellow("⚠️ No commands found in command.js"));
    }
} catch (e) {
    console.log(chalk.yellow(`⚠️ Command module error: ${e.message}`));
}

// ALIASES SET KARO
commands.forEach(cmd => {
    if (cmd.alias && Array.isArray(cmd.alias)) {
        cmd.alias.forEach(alias => {
            aliases.set(alias, cmd.pattern);
        });
    }
});

// ==================== LIB IMPORTS ====================
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { getBuffer: getBuffer2, getGroupAdmins: getGroupAdmins2, getRandom: getRandom2, h2k: h2k2, isUrl: isUrl2, Json: Json2, runtime: runtime2, sleep: sleep2, fetchJson: fetchJson2, saveConfig, empiretourl } = require('./lib/functions2');
const { sms, downloadMediaMessage } = require('./lib/msg');
const GroupEvents = require('./lib/groupevents');
const { AntiDelete, DeletedText, DeletedMedia } = require('./lib/antidel');
const { DATABASE } = require('./lib/database');
const { fetchGif, gifToVideo } = require('./lib/fetchGif');
const { fetchImage, fetchGif: fetchGif2, gifToSticker } = require('./lib/sticker-utils');
const { videoToWebp } = require('./lib/video-utils');

// ==================== DATA IMPORTS ====================
const { 
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings 
} = require('./data/antidel');

const { 
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage 
} = require('./data/store');

const { setCommitHash, getCommitHash } = require('./data/updateDB');
const converter = require('./data/converter');
const stickerConverter = require('./data/sticker-converter');

// ==================== ASSETS ====================
let autoReply = {};
let autoSticker = {};
let autoVoice = {};

try {
    if (fs.existsSync('./assets/autoreply.json')) {
        autoReply = JSON.parse(fs.readFileSync('./assets/autoreply.json'));
        console.log(chalk.green("✅ Auto-reply loaded:"), Object.keys(autoReply).length, "triggers");
    }
} catch (e) {
    console.log(chalk.yellow("⚠️ Auto-reply load error:"), e.message);
}

try {
    if (fs.existsSync('./assets/autosticker.json')) {
        autoSticker = JSON.parse(fs.readFileSync('./assets/autosticker.json'));
        console.log(chalk.green("✅ Auto-sticker loaded:"), Object.keys(autoSticker).length, "triggers");
    }
} catch (e) {
    console.log(chalk.yellow("⚠️ Auto-sticker load error:"), e.message);
}

try {
    if (fs.existsSync('./assets/autovoice.json')) {
        autoVoice = JSON.parse(fs.readFileSync('./assets/autovoice.json'));
        console.log(chalk.green("✅ Auto-voice loaded:"), Object.keys(autoVoice).length, "triggers");
    }
} catch (e) {
    console.log(chalk.yellow("⚠️ Auto-voice load error:"), e.message);
}

// ==================== BAN/SUDO ====================
let banList = [];
let sudoList = [];

try {
    if (fs.existsSync('./lib/ban.json')) {
        banList = JSON.parse(fs.readFileSync('./lib/ban.json'));
        console.log(chalk.green("✅ Ban list loaded:"), banList.length, "users");
    }
} catch (e) {
    console.log(chalk.yellow("⚠️ Ban list load error:"), e.message);
}

try {
    if (fs.existsSync('./lib/sudo.json')) {
        sudoList = JSON.parse(fs.readFileSync('./lib/sudo.json'));
        console.log(chalk.green("✅ Sudo list loaded:"), sudoList.length, "users");
    }
} catch (e) {
    console.log(chalk.yellow("⚠️ Sudo list load error:"), e.message);
}

// ==================== TEMP DIR ====================
const tempDir = path.join(os.tmpdir(), 'cache-temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const clearTempDir = () => {
    try {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 10 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {}
        }
    } catch (err) {}
};

setInterval(clearTempDir, 5 * 60 * 1000);

// ==================== SESSION HANDLER ====================
async function initializeSession() {
    console.log("\n🔐 ==============================");
    console.log("🔐 SESSION INITIALIZATION");
    console.log("🔐 ==============================\n");
    
    const sessionDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    const credsPath = path.join(sessionDir, 'creds.json');
    
    if (config.SESSION_ID && config.SESSION_ID.trim() !== "" && !fs.existsSync(credsPath)) {
        try {
            console.log("📦 Loading session from SESSION_ID...");
            
            let sessdata = config.SESSION_ID;
            
            const prefixes = ['FAIZAN-MD~', 'BOSS-MD~', 'EMYOU~', 'BOT~'];
            for (const p of prefixes) {
                if (sessdata.includes(p)) {
                    sessdata = sessdata.split(p)[1];
                    break;
                }
            }
            
            sessdata = sessdata.trim();
            while (sessdata.length % 4 !== 0) {
                sessdata += '=';
            }
            
            const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
            
            try {
                const jsonData = JSON.parse(decodedData);
                fs.writeFileSync(credsPath, JSON.stringify(jsonData, null, 2));
                console.log("✅ Session loaded successfully!");
            } catch (jsonErr) {
                console.log("⚠️ Not JSON, saving as raw");
                fs.writeFileSync(credsPath, decodedData);
            }
        } catch (err) {
            console.error("❌ Session error:", err.message);
        }
    }
}

// ==================== MESSAGE STORE FOR ANTI-DELETE ====================
const messageStore = new Map();

async function storeMessageForAntiDelete(message) {
    try {
        if (!message || !message.key || !message.message) return;
        if (message.key.fromMe) return;
        
        const messageId = message.key.id;
        const now = Date.now();
        
        messageStore.set(messageId, {
            id: messageId,
            key: {
                remoteJid: message.key.remoteJid,
                fromMe: false,
                id: message.key.id,
                participant: message.key.participant
            },
            message: JSON.parse(JSON.stringify(message.message)),
            timestamp: message.messageTimestamp || Math.floor(now / 1000),
            receivedAt: now
        });
        
        // Keep only last 500 messages
        if (messageStore.size > 500) {
            const oldestKeys = [...messageStore.keys()].slice(0, 100);
            for (const key of oldestKeys) {
                messageStore.delete(key);
            }
        }
    } catch (err) {}
}

async function loadDeletedMessage(messageId) {
    try {
        if (messageStore.has(messageId)) {
            return messageStore.get(messageId);
        }
        return null;
    } catch (err) {
        return null;
    }
}

// ==================== ULTRA FAST MESSAGE HANDLER ====================
async function handleMessageUltra(message) {
    perfStats.msgCount++;
    const startTime = Date.now();
    
    try {
        if (!message || !message.message || message.key.fromMe) return;
        
        const type = Object.keys(message.message)[0];
        if (type === 'protocolMessage' || type === 'senderKeyDistributionMessage') return;
        
        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // Ultra Fast Group Cache
        let groupMetadata = null;
        if (isGroup && conn) {
            const cached = speedCache.groups.get(from);
            if (cached && (Date.now() - cached.timestamp < 120000)) {
                groupMetadata = cached.data;
            } else {
                try {
                    groupMetadata = await conn.groupMetadata(from).catch(() => null);
                    if (groupMetadata) {
                        speedCache.groups.set(from, {
                            data: groupMetadata,
                            timestamp: Date.now()
                        });
                    }
                } catch (e) {}
            }
        }
        
        // Update Performance Stats
        perfStats.avgResponse = Math.round(
            (perfStats.avgResponse * 0.8) + ((Date.now() - startTime) * 0.2)
        );
        
    } catch(error) {}
}

// ==================== MAIN CONNECTION FUNCTION ====================
let conn;

async function connectToWA() {
    console.log("\n📱 ==============================");
    console.log("📱 CONNECTING TO WHATSAPP");
    console.log("📱 ==============================\n");
    
    try {
        await initializeSession();
        
        const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
        const { version } = await fetchLatestBaileysVersion();
        
        conn = makeWASocket({
            logger: P({ level: 'silent' }),
            printQRInTerminal: false,
            browser: Browsers.macOS("Firefox"),
            syncFullHistory: false,
            auth: state,
            version,
            markOnlineOnConnect: config.ALWAYS_ONLINE === 'true',
            emitOwnEvents: false,
            fireInitQueries: false,
            retryRequestDelayMs: 100,
            generateHighQualityLinkPreview: true,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });
        
        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log("📱 QR Code received - Scan with WhatsApp");
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'connecting') {
                console.log('Connecting to WhatsApp...');
            }
            
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(`❌ Connection closed - Status: ${statusCode}`);
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        fs.rmSync('./sessions', { recursive: true, force: true });
                        console.log('⚠️ Session logged out. Please re-authenticate');
                    } catch (error) {
                        console.log(`❌ Error deleting session: ${error.message}`);
                    }
                }
                
                if (shouldReconnect) {
                    console.log('Reconnecting in 5 seconds...');
                    setTimeout(connectToWA, 5000);
                }
            }
            
            if (connection === 'open') {
                console.log('\n🧬 Installing Plugins');
                
                // Load plugins count
                let pluginCount = 0;
                try {
                    const pluginsDir = path.join(__dirname, 'plugins');
                    if (fs.existsSync(pluginsDir)) {
                        const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
                        pluginCount = pluginFiles.length;
                        console.log(`✅ Found ${pluginCount} plugin files`);
                    }
                } catch (err) {
                    console.error("❌ Plugin loading error:", err.message);
                }
                
                console.log('✅ Bot connected to whatsapp ✅');
                console.log(`👤 Bot Number: ${conn.user.id.split(':')[0]}`);
                console.log(`📝 Total Commands: ${commands.length}`);
                console.log(`📦 Plugins: ${pluginCount}`);
                console.log(`🛡️ Anti-Delete: ${config.ANTI_DELETE === 'true' ? 'ACTIVE' : 'INACTIVE'}`);
                
                // Welcome message
                setTimeout(() => {
                    let up = `*Hello there FAIZAN-MD⁸⁷³ User! 👋🏻*\n\n` +
                            `> Simple, Straight Forward But Loaded With Features 🎊\n\n` +
                            `- *YOUR PREFIX:* = ${prefix}\n` +
                            `- *Commands:* ${commands.length}\n` +
                            `- *Anti-Delete:* ${config.ANTI_DELETE === 'true' ? '✅' : '❌'}\n\n` +
                            `> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`;
                    
                    conn.sendMessage(conn.user.id, { 
                        image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/15z65y.jpg' }, 
                        caption: up 
                    }).catch(err => console.error("Welcome message error:", err.message));
                    
                    // Send to owner as well
                    conn.sendMessage(ownerNumber[0] + '@s.whatsapp.net', {
                        text: `✅ *ASEEL-XMD ACTIVATED*\n\nBot is now online!\nCommands: ${commands.length}\nPrefix: ${prefix}\nAnti-Delete: ${config.ANTI_DELETE === 'true' ? '✅ ACTIVE' : '❌ INACTIVE'}`
                    }).catch(() => {});
                }, 5000);
            }
        });
        
        conn.ev.on('creds.update', saveCreds);

        // ==================== FIXED ANTI-DELETE HANDLER ====================
        if (config.ANTI_DELETE === 'true') {
            console.log("🛡️ Anti-Delete: ACTIVE");
            
            conn.ev.on('messages.update', async updates => {
                for (const update of updates) {
                    // Jab message delete ho (message null ho jata hai)
                    if (update.update && update.update.message === null) {
                        try {
                            // Store se original message lao
                            const deletedMsg = messageStore.get(update.key.id);
                            if (!deletedMsg || !deletedMsg.message) continue;
                            
                            // Info prepare karo
                            const chatId = update.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const deleter = update.key.participant || chatId;
                            const deleterNumber = deleter.split('@')[0];
                            
                            // Message type detect karo
                            let msgType = "📝 TEXT";
                            let mediaInfo = "";
                            
                            if (deletedMsg.message.imageMessage) {
                                msgType = "🖼️ IMAGE";
                                mediaInfo = deletedMsg.message.imageMessage.caption ? `\n📝 Caption: ${deletedMsg.message.imageMessage.caption}` : '';
                            }
                            else if (deletedMsg.message.videoMessage) {
                                msgType = "🎥 VIDEO";
                                mediaInfo = deletedMsg.message.videoMessage.caption ? `\n📝 Caption: ${deletedMsg.message.videoMessage.caption}` : '';
                            }
                            else if (deletedMsg.message.audioMessage) {
                                msgType = "🔊 AUDIO";
                            }
                            else if (deletedMsg.message.documentMessage) {
                                msgType = "📄 DOCUMENT";
                                mediaInfo = `\n📄 File: ${deletedMsg.message.documentMessage.fileName || 'Unknown'}`;
                            }
                            else if (deletedMsg.message.stickerMessage) {
                                msgType = "🏷️ STICKER";
                            }
                            else if (deletedMsg.message.conversation) {
                                msgType = "📝 TEXT";
                                mediaInfo = `\n💬 Content: ${deletedMsg.message.conversation}`;
                            }
                            else if (deletedMsg.message.extendedTextMessage) {
                                msgType = "📝 TEXT";
                                mediaInfo = `\n💬 Content: ${deletedMsg.message.extendedTextMessage.text || ''}`;
                            }
                            
                            // Group info
                            let groupInfo = "";
                            if (isGroup) {
                                try {
                                    const groupMetadata = await conn.groupMetadata(chatId).catch(() => null);
                                    if (groupMetadata) {
                                        groupInfo = `\n👥 Group: ${groupMetadata.subject}`;
                                    }
                                } catch (e) {}
                            }
                            
                            // Owner ko bhejo
                            const targetJid = ownerNumber[0] + '@s.whatsapp.net';
                            
                            const alertText = `╭─❏ *🗑️ DELETED MESSAGE* ❏\n` +
                                             `│✇ *Type:* ${msgType}\n` +
                                             `│✇ *Deleted by:* @${deleterNumber}\n` +
                                             `│✇ *Location:* ${isGroup ? 'Group' : 'Private'}${groupInfo}\n` +
                                             `${mediaInfo}\n` +
                                             `╰───────────────────❏\n\n` +
                                             `> *ADEEL-XMD ANTI DELETE*`;
                            
                            await conn.sendMessage(targetJid, {
                                text: alertText,
                                mentions: [deleter]
                            });
                            
                            console.log(`✅ Deleted message reported: ${msgType} from ${deleterNumber}`);
                            
                        } catch (err) {
                            console.error("Anti-delete error:", err.message);
                        }
                    }
                }
            });
        }

        // ANTI CALL
        if (config.ANTI_CALL === 'true') {
            conn.ev.on("call", async (json) => {
                try {
                    const call = json.find(c => c.status === 'offer');
                    if (call) {
                        await conn.rejectCall(call.id, call.from);
                        console.log(`📵 Call rejected from ${call.from}`);
                    }
                } catch (err) {
                    console.error("Anti-call error:", err.message);
                }
            });
        }

        // GROUP EVENTS
        conn.ev.on("group-participants.update", async (update) => {
            try {
                await GroupEvents(conn, update);
            } catch (err) {
                console.error("Group event error:", err.message);
            }
        });

        // MESSAGE HANDLER
        conn.ev.on('messages.upsert', async (mekData) => {
            // Queue for ultra processing
            const message = mekData.messages[0];
            if (message) {
                msgQueue.push(message);
                if (msgQueue.length === 1) processQueue();
            }
            
            try {
                const message = mekData.messages[0];
                if (!message || !message.message) return;
                
                message.message = (getContentType(message.message) === 'ephemeralMessage') 
                    ? message.message.ephemeralMessage.message 
                    : message.message;
                
                // Auto read
                if (config.READ_MESSAGE === 'true') {
                    await conn.readMessages([message.key]).catch(() => {});
                }
                
                // Handle view once
                if (message.message.viewOnceMessageV2) {
                    message.message = message.message.viewOnceMessageV2.message;
                }
                
                // ========== STORE FOR ANTI-DELETE ==========
                if (config.ANTI_DELETE === 'true') {
                    await storeMessageForAntiDelete(message);
                }
                
                // Auto typing/recording
                const from = message.key.remoteJid;
                if (config.AUTO_TYPING === 'true') {
                    await conn.sendPresenceUpdate('composing', from).catch(() => {});
                }
                if (config.AUTO_RECORDING === 'true') {
                    await conn.sendPresenceUpdate('recording', from).catch(() => {});
                }
                
                // Handle status
                if (message.key && message.key.remoteJid === 'status@broadcast') {
                    if (config.AUTO_STATUS_SEEN === "true") {
                        await conn.readMessages([message.key]).catch(() => {});
                    }
                    
                    if (config.AUTO_STATUS_REACT === "true") {
                        const emojis = ['❤️', '🔥', '👍', '😊', '🎉', '💯'];
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await conn.sendMessage(message.key.remoteJid, {
                            react: { text: randomEmoji, key: message.key }
                        }).catch(() => {});
                    }
                    
                    if (config.AUTO_STATUS_REPLY === "true" && config.AUTO_STATUS_MSG) {
                        const user = message.key.participant;
                        await conn.sendMessage(user, { 
                            text: config.AUTO_STATUS_MSG
                        }, { quoted: message }).catch(() => {});
                    }
                    return;
                }
                
                // Serialize message
                const m = sms(conn, message);
                
                // Check if user is banned
                const sender = m.sender || message.key.participant || message.key.remoteJid;
                if (banList.includes(sender)) return;
                
                // Check if user is sudo/owner
                const senderNumber = sender.split('@')[0];
                const isOwner = ownerNumber.includes(senderNumber);
                const isSudo = sudoList.includes(sender);
                const isCreator = isOwner || isSudo;
                
                // Auto reply
                if (config.AUTO_REPLY === 'true' && m.text) {
                    const lowerText = m.text.toLowerCase();
                    for (const [key, value] of Object.entries(autoReply)) {
                        if (lowerText.includes(key.toLowerCase())) {
                            await conn.sendMessage(from, { text: value }, { quoted: message }).catch(() => {});
                            break;
                        }
                    }
                }
                
                // Auto sticker
                if (config.AUTO_STICKER === 'true' && m.text) {
                    const lowerText = m.text.toLowerCase();
                    for (const [key, value] of Object.entries(autoSticker)) {
                        if (lowerText.includes(key.toLowerCase())) {
                            const stickerPath = path.join(__dirname, 'assets', 'autosticker', value);
                            if (fs.existsSync(stickerPath)) {
                                await conn.sendMessage(from, {
                                    sticker: fs.readFileSync(stickerPath)
                                }, { quoted: message }).catch(() => {});
                            }
                            break;
                        }
                    }
                }
                
                // Auto react
                if (config.AUTO_REACT === 'true' && !message.message.reactionMessage) {
                    let reactions = ['❤️', '🔥', '👍', '😊', '🎉', '💯'];
                    if (config.CUSTOM_REACT === 'true' && config.CUSTOM_REACT_EMOJIS) {
                        reactions = config.CUSTOM_REACT_EMOJIS.split(',');
                    }
                    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                    await conn.sendMessage(from, { 
                        react: { text: randomReaction, key: message.key } 
                    }).catch(() => {});
                }
                
                // Check command
                let body = m.text || '';
                const isCmd = body.startsWith(prefix);
                
                if (isCmd && commands.length > 0) {
                    const cmdName = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();
                    
                    let cmd = commands.find(c => c.pattern === cmdName);
                    
                    if (!cmd) {
                        const aliasCmd = aliases.get(cmdName);
                        if (aliasCmd) {
                            cmd = commands.find(c => c.pattern === aliasCmd);
                        }
                    }
                    
                    if (cmd) {
                        // Command react
                        if (cmd.react) {
                            conn.sendMessage(from, { 
                                react: { text: cmd.react, key: message.key } 
                            }).catch(() => {});
                        }
                        
                        // Check if command requires owner
                        if (cmd.category === 'owner' && !isCreator) {
                            return conn.sendMessage(from, { 
                                text: '❌ This command is only for the bot owner!' 
                            }, { quoted: message });
                        }
                        
                        // Execute command
                        try {
                            const args = body.slice(prefix.length + cmdName.length).trim().split(' ');
                            const q = args.join(' ');
                            
                            await cmd.function(conn, message, m, {
                                from,
                                quoted: message,
                                body,
                                isCmd,
                                command: cmdName,
                                args,
                                q,
                                text: q,
                                isGroup: from.endsWith('@g.us'),
                                sender,
                                senderNumber,
                                botNumber2: conn.user.id,
                                botNumber: conn.user.id.split(':')[0],
                                pushname: m.pushName || 'User',
                                isMe: sender === conn.user.id,
                                isOwner,
                                isCreator,
                                groupMetadata: from.endsWith('@g.us') ? await conn.groupMetadata(from).catch(() => null) : null,
                                groupName: from.endsWith('@g.us') ? (await conn.groupMetadata(from).catch(() => null))?.subject : null,
                                participants: from.endsWith('@g.us') ? (await conn.groupMetadata(from).catch(() => null))?.participants : null,
                                groupAdmins: from.endsWith('@g.us') ? getGroupAdmins((await conn.groupMetadata(from).catch(() => null))?.participants || []) : [],
                                isBotAdmins: from.endsWith('@g.us') ? getGroupAdmins((await conn.groupMetadata(from).catch(() => null))?.participants || []).includes(conn.user.id) : false,
                                isAdmins: from.endsWith('@g.us') ? getGroupAdmins((await conn.groupMetadata(from).catch(() => null))?.participants || []).includes(sender) : false,
                                reply: (text) => {
                                    conn.sendMessage(from, { text }, { quoted: message });
                                }
                            });
                        } catch (e) {
                            console.error(`❌ Command error (${cmdName}):`, e.message);
                            conn.sendMessage(from, { 
                                text: `❌ Error: ${e.message}` 
                            }, { quoted: message });
                        }
                    }
                }
                
            } catch (err) {
                console.error("Message processing error:", err.message);
            }
        });

        // Helper functions
        conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
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
            let type = '', mimetype = mime, pathFile = filename;
            if (options.asDocument) type = 'document';
            if (options.asSticker || /webp/.test(mime)) {
                let { writeExif } = require('./exif.js');
                let media = { mimetype: mime, data };
                pathFile = await writeExif(media, { packname: config.STICKER_NAME || 'FAIZAN-MD', author: config.OWNER_NAME || 'FAIZAN', categories: options.categories ? options.categories : [] });
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

        conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
            let list = [];
            for (let i of kon) {
                list.push({
                    displayName: await conn.getName(i + '@s.whatsapp.net').catch(() => i),
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${i}\nTEL;type=CELL;type=VOICE;waid=${i}:+${i}\nEND:VCARD`,
                });
            }
            conn.sendMessage(jid, {
                contacts: {
                    displayName: `${list.length} Contact`,
                    contacts: list,
                },
                ...opts,
            }, { quoted });
        };

        conn.setStatus = status => {
            conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'status',
                },
                content: [{
                    tag: 'status',
                    attrs: {},
                    content: Buffer.from(status, 'utf-8'),
                }],
            });
            return status;
        };
        
        conn.serializeM = mek => sms(conn, mek);

        return conn;
        
    } catch (err) {
        console.error("❌ Connection error:", err.message);
        setTimeout(connectToWA, 5000);
    }
}

// ==================== EXPRESS SERVER ====================
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

app.get("/", (req, res) => {
    const mem = process.memoryUsage();
    res.send(`
        <html>
            <head>
                <title>ADEEL-XMD</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
                    .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    .status { color: green; font-weight: bold; }
                    .memory { color: ${mem.heapUsed / 1024 / 1024 > 400 ? 'red' : 'blue'}; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>🤖 ADEEL-XMD</h1>
                    <p>Status: <span class="status">✅ ONLINE</span></p>
                    <p>Commands: <strong>${commands.length}</strong></p>
                    <p>Anti-Delete: <strong>${config.ANTI_DELETE === 'true' ? '✅ ACTIVE' : '❌ INACTIVE'}</strong></p>
                    <p>Memory: <span class="memory">${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB</span></p>
                    <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
                    <p>Owner: ${config.OWNER_NAME} (${config.OWNER_NUMBER})</p>
                </div>
            </body>
        </html>
    `);
});

app.get("/status", (req, res) => {
    res.json({
        status: "online",
        botName: config.BOT_NAME,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        commands: commands.length,
        anti_delete: config.ANTI_DELETE === 'true',
        cache_size: messageStore.size
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`\n🌐 Server listening on port ${port}`);
});

// ==================== TEMP CLEANUP ====================
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => {});
                }
            });
        }
    });
}, 1 * 60 * 60 * 1000);

// ==================== START BOT ====================
setTimeout(() => {
    connectToWA();
}, 8000);

// ==================== PROCESS HANDLERS ====================
process.on('SIGINT', () => {
    console.log('Cleaning up before exit...');
    if (memoryCleanInterval) clearInterval(memoryCleanInterval);
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log("\n🚀 ==============================");
console.log("🚀 ADEEL-MD BOT STARTING...");
console.log("🚀 ==============================\n");

// ==================== EXPORTS FOR PLUGINS ====================
module.exports = {
    commands,
    aliases,
    prefix,
    ownerNumber,
    config,
    conn
};
