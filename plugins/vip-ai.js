const vipUsers = new Set([
"923XXXXXXXXX@s.whatsapp.net" // apna VIP number
])

export default async function vipAI(sock, m, { text, sender }) {

if (!vipUsers.has(sender)) return
if (!text) return

// ignore commands
if (text.startsWith(".")) return

// Simple AI Replies
const replies = [
"😎 VIP detected — nice message!",
"👑 Premium user spotted!",
"🔥 Adeel XMD VIP System Online",
"💎 You are using VIP AI",
"⚡ Boss message received"
]

let randomReply = replies[Math.floor(Math.random() * replies.length)]

await sock.sendMessage(m.key.remoteJid, { text: randomReply }, { quoted: m })

}
