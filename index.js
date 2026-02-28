/* ============================================================
   ██
      ╚═╝   ╚═╝  ╚═╝╚══════╝      ╚═══╝  ╚═╝  ╚═╝ ╚════╝ ╚═╝     ╚═╝
   ============================================================ */

// ==================== bailey ====================                                 
      require("dotenv").config();
const fs = require("fs");
const path = require("path");
const P = require("pino");
const NodeCache = require("node-cache");

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const config = require("./config");

const msgRetryCounterCache = new NodeCache();

// ================= SESSION LOADER =================

async function initializeSession() {
const sessionDir = path.join(__dirname, "sessions");
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

const credsPath = path.join(sessionDir, "creds.json");

if (config.SESSION_ID && !fs.existsSync(credsPath)) {
let sessdata = config.SESSION_ID;

const prefixes = ["ADEEL-XMD~","BOSS-MD~","EMYOU~","BOT~"];
for (const p of prefixes) {
if (sessdata.includes(p)) {
sessdata = sessdata.split(p)[1];
break;
}
}

const decoded = Buffer.from(sessdata, "base64").toString("utf-8");
fs.writeFileSync(credsPath, decoded);
console.log("✅ SESSION LOADED");
}
}

// ================= MAIN START =================

async function startBot() {

await initializeSession();

const { state, saveCreds } =
await useMultiFileAuthState("sessions");

const { version } =
await fetchLatestBaileysVersion();

const conn = makeWASocket({
version,
printQRInTerminal: true,
logger: P({ level: "silent" }),
auth: state,
msgRetryCounterCache
});

conn.ev.on("creds.update", saveCreds);

// ===== ULTRA FAST MESSAGE HANDLER =====

conn.ev.on("messages.upsert", async ({ messages }) => {
const m = messages[0];
if (!m.message) return;

const msg =
m.message.conversation ||
m.message.extendedTextMessage?.text ||
"";

if (msg === ".menu") {
await conn.sendMessage(m.key.remoteJid, {
text: `
╭━━〔 ⚡ ADEEL-AI ULTRA ⚡ 〕━━╮
│ 🚀 BOT SPEED : MAXIMUM
│ 🧠 SYSTEM : ONLINE
│ 👑 OWNER : MAFIA ADEEL
╰━━━━━━━━━━━━━━━━━━━━╯
`
});
}
});

// ===== AUTO STATUS ONLY =====

conn.ev.on("messages.upsert", async ({ messages }) => {
const m = messages[0];
if (m.key.remoteJid === "status@broadcast"
&& config.AUTO_STATUS_VIEW) {
await conn.readMessages([m.key]);
}
});

// ===== CONNECTION =====

conn.ev.on("connection.update", ({ connection }) => {
if (connection === "open")
console.log("🔥 BOT CONNECTED — ULTRA SPEED");
});

}

startBot();              
