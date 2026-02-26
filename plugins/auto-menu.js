const vipUsers = new Set([
"923XXXXXXXXX@s.whatsapp.net" // VIP number
])

export default async function autoMenu(sock, m, { command, sender, isOwner, reply }) {

if (command !== "menu") return

// 👑 OWNER MENU
if (isOwner) {
let ownerMenu = `
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
return reply(ownerMenu)
}

// 💎 VIP MENU
if (vipUsers.has(sender)) {
let vipMenu = `
╔══════〔 💎 VIP PANEL 〕══════╗
║ ⚡ Unlimited Access : ENABLED
║ 🤖 VIP AI           : ACTIVE
║ 🔥 Premium Commands : ON
╚══════════════════════════════╝

> 👑 ADEEL XMD VIP SYSTEM
`
return reply(vipMenu)
}

// 🙂 NORMAL USER MENU
let userMenu = `
╔══════〔 📱 USER MENU 〕══════╗
║ 🤖 Bot Status : Online
║ ⚡ Mode       : Public
║ 👑 Buy VIP for more features
╚══════════════════════════════╝

> 💚 ADEEL XMD BOT
`

reply(userMenu)

}
