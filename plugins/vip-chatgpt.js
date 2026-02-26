import axios from "axios"

const vipUsers = new Set([
"923174838990@s.whatsapp.net" // apna VIP number
])

const API_KEY = "YOUR_OPENAI_API_KEY"

export default async function vipGPT(sock, m, { text, sender }) {

if (!vipUsers.has(sender)) return
if (!text) return
if (text.startsWith(".")) return

try {

let res = await axios.post(
"https://api.openai.com/v1/chat/completions",
{
model: "gpt-3.5-turbo",
messages: [{ role: "user", content: text }]
},
{
headers: {
"Authorization": `Bearer ${API_KEY}`,
"Content-Type": "application/json"
}
}
)

let reply = res.data.choices[0].message.content

await sock.sendMessage(m.key.remoteJid, { text: reply }, { quoted: m })

} catch (e) {
await sock.sendMessage(m.key.remoteJid, { text: "❌ AI Error" }, { quoted: m })
}

}
