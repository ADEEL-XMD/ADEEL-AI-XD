const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");


// ================= 🔐 SESSION LIGHT HANDLER =================
async function loadSession() {

    const sessionDir = path.join(__dirname, "session");
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    const credsPath = path.join(sessionDir, "creds.json");
    const SESSION_ID = process.env.SESSION_ID || "";

    if (SESSION_ID && !fs.existsSync(credsPath)) {
        try {
            console.log("📦 Loading SESSION_ID...");

            let sessdata = SESSION_ID.trim();

            const prefixes = ['ADEEL-XMD~','BOSS-MD~','EMYOU~','BOT~'];
            for (const p of prefixes) {
                if (sessdata.includes(p)) {
                    sessdata = sessdata.split(p)[1];
                    break;
                }
            }

            while (sessdata.length % 4 !== 0) {
                sessdata += "=";
            }

            const decoded = Buffer.from(sessdata, "base64").toString("utf-8");

            try {
                const json = JSON.parse(decoded);
                fs.writeFileSync(credsPath, JSON.stringify(json, null, 2));
            } catch {
                fs.writeFileSync(credsPath, decoded);
            }

            console.log("✅ SESSION SAVED");
        } catch (e) {
            console.log("❌ SESSION ERROR:", e.message);
        }
    }
}


// ================= 🚀 START BOT =================
async function startBot() {

    await loadSession(); // SESSION LOAD FIRST

    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {

        if (connection === "open") {
            console.log("✅ BOT CONNECTED ⚡ ULTRA FAST");
        }

        if (connection === "close") {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("❌ Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) {
                startBot();
            }
        }
    });
}

startBot();
