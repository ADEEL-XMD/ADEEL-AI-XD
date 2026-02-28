/*
╔══════════════════════════════════════╗
║        ADEEL-XMD ULTRA PRO INDEX     ║
║        BASE: ADEEL-AI-XD REPO        ║
║        SPEED: GOD LEVEL ⚡           ║
╚══════════════════════════════════════╝
*/

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const path = require("path");
const qrcode = require("qrcode-terminal");
const config = require("./config");


// ⚡ FORCE ULTRA SPEED CONFIG
config.AUTO_STATUS_SEEN = "true";
config.AUTO_REPLY = "false";
config.AUTO_REACT = "false";
config.AUTO_STICKER = "false";
config.AUTO_TYPING = "false";
config.AUTO_RECORDING = "false";
config.AUTO_STATUS_REPLY = "false";
config.AUTO_STATUS_REACT = "false";
config.READ_MESSAGE = "false";

console.log("🚀 ULTRA SPEED MODE ENABLED");

// ==================== SESSION AUTH ====================
if (!fs.existsSync(CREDS_PATH)) {
    if (config.SESSION_ID && config.SESSION_ID.trim() !== "") {
        const sessdata = config.SESSION_ID.replace("ADEEL-XMD~", '');
        try {
            const decodedData = Buffer.from(sessdata, 'base64').toString('utf-8');
            fs.writeFileSync(CREDS_PATH, decodedData);
            log("✅ Session loaded from SESSION_ID", 'green');
        } catch (err) {
            log("❌ Error decoding session data: " + err, 'red', true);
        }
    }
}
// ================= CONNECT =================

async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Chrome"),
    auth: state,
    version,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    fireInitQueries: false,
    generateHighQualityLinkPreview: true,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000
  });


  // ================= CONNECTION EVENTS =================

  conn.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR");
    }

    if (connection === "open") {
      console.log("✅ ADEEL-XMD CONNECTED ⚡");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection closed");

      if (shouldReconnect) startBot();
    }
  });

  conn.ev.on("creds.update", saveCreds);


  // ================= FAST MESSAGE HANDLER =================

  conn.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];
      if (!msg.message) return;

      const from = msg.key.remoteJid;

      // ⚡ AUTO STATUS SEEN ONLY
      if (from === "status@broadcast") {
        if (config.AUTO_STATUS_SEEN === "true") {
          await conn.readMessages([msg.key]);
        }
        return;
      }

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

      const prefix = config.PREFIX || ".";
      if (!body.startsWith(prefix)) return;

      const command = body.slice(prefix.length).trim().split(" ")[0];

      // ================= MENU COMMAND =================

      if (command === "menu") {
        await conn.sendMessage(from, {
          text: `╭━━〔 ⚡ ADEEL-XMD ⚡ 〕━━╮
│ 🚀 Ultra Fast Menu
│ 🤖 Commands Loaded
│ 🧠 AI System Active
╰━━━━━━━━━━━━━━━━━━━━╯

> ⚡ POWERED BY ADEEL`
        });
      }

      // ================= PING TEST =================

      if (command === "ping") {
        await conn.sendMessage(from, { text: "⚡ SPEED: GOD LEVEL" });
      }

    } catch (e) {
      console.log("Error:", e);
    }
  });

}

startBot();
