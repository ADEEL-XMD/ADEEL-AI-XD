export default async function botStats(sock, m, { command, reply, uptime }) {

if (command !== "stats") return

const os = require("os")

let stats = `
╔══════〔 📊 BOT STATS 〕══════╗
║ ⏱️ Uptime   : ${uptime}
║ 💾 RAM      : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
║ 🧠 CPU      : ${os.cpus().length} Cores
║ ⚙️ Platform : ${process.platform}
╚══════════════════════════════╝

> 👑 ADEEL XMD SYSTEM
`

reply(stats)

}
