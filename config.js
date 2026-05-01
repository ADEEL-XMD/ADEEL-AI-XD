const fs = require('fs');
const path = require('path');
const { getConfig } = require("./lib/configdb");

if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // ===== BOT CORE SETTINGS =====
    SESSION_ID: process.env.SESSION_ID || "",
    PREFIX: getConfig("PREFIX") || ".",
    CHATBOT: getConfig("CHATBOT") || "on",
    BOT_NAME: process.env.BOT_NAME || getConfig("BOT_NAME") || "\u{1D400}\u{1D403}\u{1D6B4}\u{1D6B4}\u{1D40B}-\u{1D40C}\u{1D403}",
    MODE: getConfig("MODE") || process.env.MODE || "public",
    REPO: process.env.REPO || "https://github.com/ADEEL-XMD/ADEEL-AI-XD",
    BAILEYS: process.env.BAILEYS || "@whiskeysockets/baileys",

    // ===== OWNER & DEVELOPER SETTINGS =====
    OWNER_NUMBER: process.env.OWNER_NUMBER || "923174838990",
    OWNER_NAME: process.env.OWNER_NAME || getConfig("OWNER_NAME") || "\u{1D400}\u{1D403}\u{1D6B4}\u{1D6B4}\u{1D40B}-\u{1D40C}\u{1D403}",
    DEV: process.env.DEV || "923174838990",
    DEVELOPER_NUMBER: '923174838990@s.whatsapp.net',

    // ===== AUTO-RESPONSE SETTINGS =====
    AUTO_REPLY: process.env.AUTO_REPLY || "false",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*ADEEL-MD VIEWED YOUR STATUS*",
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    REJECT_MSG: process.env.REJECT_MSG || "*THIS PERSON NOT ALLOWED CALL*",
    
    // ===== REACTION & STICKER SETTINGS =====
    AUTO_REACT: process.env.AUTO_REACT || "false",
    OWNER_REACT: process.env.OWNER_REACT || "false",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: getConfig("CUSTOM_REACT_EMOJIS") || process.env.CUSTOM_REACT_EMOJIS || "heart,fire,clap",
    STICKER_NAME: process.env.STICKER_NAME || "ADEEL-MD",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    
    // ===== MEDIA & AUTOMATION =====
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "false",
    MENTION_REPLY: process.env.MENTION_REPLY || "false",
    MENU_IMAGE_URL: getConfig("MENU_IMAGE_URL") || "https://files.catbox.moe/pf9a6s.jpg",

    // ===== SECURITY & ANTI-FEATURES =====
    ANTI_DELETE: process.env.ANTI_DELETE || "true",
    ANTI_CALL: process.env.ANTI_CALL || "false",
    ANTI_BAD_WORD: process.env.ANTI_BAD_WORD || "false",
    ANTI_LINK: process.env.ANTI_LINK || "true",
    ANTI_VV: process.env.ANTI_VV || "true",
    DELETE_LINKS: process.env.DELETE_LINKS || "false",
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "same",
    ANTI_BOT: process.env.ANTI_BOT || "true",
    PM_BLOCKER: process.env.PM_BLOCKER || "true",

    // ===== BOT BEHAVIOR & APPEARANCE =====
    DESCRIPTION: process.env.DESCRIPTION || "*POWER BY MAFIA ADEEL*",
    PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_BIO: process.env.AUTO_BIO || "false",
    WELCOME: process.env.WELCOME || "false",
    GOODBYE: process.env.GOODBYE || "false",
    ADMIN_ACTION: process.env.ADMIN_ACTION || "false",
};
