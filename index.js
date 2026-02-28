// ================== ULTRA PRO FAST INDEX ==================

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const P = require("pino");
const fs = require("fs");
const path = require("path");

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
            
            const prefixes = ['ADEEL-XMD~', 'BOSS-MD~', 'EMYOU~', 'BOT~'];
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

// ================== CONFIG ==================
const OWNER_NUMBER = "923174838990";
const PREFIX = ".";

// SPEED CONFIG (ONLY STATUS SEEN ON)
const CONFIG = {
AUTO_STATUS_SEEN: true,
AUTO_STATUS_REPLY: false,
AUTO_STATUS_REACT: false,
AUTO_REPLY: false,
AUTO_REACT: false,
AUTO_STICKER: false,
AUTO_TYPING: false,
AUTO_RECORDING: false
};

// ================== CONNECT ==================

async function startBot() {

const { state, saveCreds } = await useMultiFileAuthState("./session");
const { version } = await fetchLatestBaileysVersion();

const conn = makeWASocket({
logger: P({ level: "silent" }),
printQRInTerminal: true,
browser: ["ADEEL-XMD","Chrome","1.0.0"],
auth: state,
version
});

// ================== CONNECTION ==================

conn.ev.on("connection.update", (update) => {

const { connection, lastDisconnect } = update;

if (connection === "close") {

const shouldReconnect =
lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

if (shouldReconnect) startBot();
}

if (connection === "open") {

console.log("👑 BOT CONNECTED — ULTRA SPEED MODE");
}

});

conn.ev.on("creds.update", saveCreds);

// ================== MESSAGE HANDLER ==================

conn.ev.on("messages.upsert", async ({ messages }) => {

const m = messages[0];
if (!m.message) return;

const from = m.key.remoteJid;

// ================= STATUS HANDLER =================

if (from === "status@broadcast") {

if (CONFIG.AUTO_STATUS_SEEN) {
await conn.readMessages([m.key]);
}

return;
}

// ================= COMMAND HANDLER =================

const body =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
"";

if (!body.startsWith(PREFIX)) return;

const command = body.slice(1).trim().split(" ")[0].toLowerCase();

// ===== MENU =====

if (command === "menu") {

await conn.sendMessage(from, {

text: `
╭━━〔 👑 ADEEL-XMD MENU 👑 〕━━╮
│ ⚡ Ultra Speed Mode Active
│ 🚀 Commands Ready
│ 🧠 AI System Online
╰━━━━━━━━━━━━━━━━━━━━╯

• .menu
• .ping
• .alive
`

}, { quoted: m });

}

// ===== PING =====

if (command === "ping") {

await conn.sendMessage(from, {
text: "🏓 PONG — Ultra Fast ⚡"
}, { quoted: m });

}

// ===== ALIVE =====

if (command === "alive") {

await conn.sendMessage(from, {
text: "👑 ADEEL-XMD IS RUNNING ⚡"
}, { quoted: m });

}

});

}

startBot();

// ================= END ==================
