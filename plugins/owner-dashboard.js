export default async function ownerDashboard(sock, m, { command, reply, isOwner }) {

if (command !== "ownermenu") return
if (!isOwner) return reply("❌ Owner Only Command 👑")

let menu = `
╔══════〔 👑 OWNER PANEL 〕══════╗
║ 🤖 AI Control     : .aion / .aioff
║ 👑 VIP Control    : .addvip / .delvip
║ 📜 VIP List       : .viplist
║ ⚡ Bot Update     : .update
║ 🛑 Shutdown Bot   : .shutdown
║ 🔄 Restart Bot    : .restart
╚═══════════════════════════════╝

> 💎 ADEEL XMD OWNER SYSTEM 👑
`

reply(menu)

}
