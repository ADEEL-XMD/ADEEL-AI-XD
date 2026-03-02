/**
 * ========================================================
 * ╚══════╝╚═╝╚═════╝     ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝
 * ========================================================
 * 
 * @description Central export for all lib modules
 * @author KING ADEEL
 * @version 5.0.0
 */

// ==================== FUNCTIONS ====================
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('./functions');

// ==================== FUNCTIONS2 ====================
const {
    getBuffer: getBuffer2,
    getGroupAdmins: getGroupAdmins2,
    getRandom: getRandom2,
    h2k: h2k2,
    isUrl: isUrl2,
    Json: Json2,
    runtime: runtime2,
    sleep: sleep2,
    fetchJson: fetchJson2,
    saveConfig,
    empiretourl
} = require('./functions2');

// ==================== MESSAGE HANDLER ====================
const {
    sms,
    downloadMediaMessage
} = require('./msg');

// ==================== GROUP EVENTS ====================
const GroupEvents = require('./groupevents');

// ==================== ANTI-DELETE ====================
const {
    DeletedText,
    DeletedMedia,
    AntiDelete
} = require('./antidel');

// ==================== DATABASE ====================
const {
    DATABASE
} = require('./database');

// ==================== GIF TOOLS ====================
const {
    fetchGif,
    gifToVideo
} = require('./fetchGif');

// ==================== STICKER TOOLS ====================
const {
    fetchImage,
    fetchGif: fetchGif2,
    gifToSticker
} = require('./sticker-utils');

// ==================== VIDEO TOOLS ====================
const {
    videoToWebp
} = require('./video-utils');

// ==================== BAN LIST ====================
let banList = [];
let sudoList = [];

// Load ban list
try {
    banList = require('./ban.json');
    console.log(`✅ Ban list loaded: ${banList.length} users`);
} catch (err) {
    console.log("⚠️ No ban.json found, using empty list");
}

// Load sudo list
try {
    sudoList = require('./sudo.json');
    console.log(`✅ Sudo list loaded: ${sudoList.length} users`);
} catch (err) {
    console.log("⚠️ No sudo.json found, using empty list");
}

// ==================== EXPORT EVERYTHING ====================
module.exports = {
    // Functions
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    
    // Functions2
    getBuffer2,
    getGroupAdmins2,
    getRandom2,
    h2k2,
    isUrl2,
    Json2,
    runtime2,
    sleep2,
    fetchJson2,
    saveConfig,
    empiretourl,
    
    // Message
    sms,
    downloadMediaMessage,
    
    // Group Events
    GroupEvents,
    
    // Anti-Delete
    DeletedText,
    DeletedMedia,
    AntiDelete,
    
    // Database
    DATABASE,
    
    // GIF Tools
    fetchGif,
    gifToVideo,
    
    // Sticker Tools
    fetchImage,
    fetchGif2,
    gifToSticker,
    
    // Video Tools
    videoToWebp,
    
    // Lists
    banList,
    sudoList
};
