const vipUsers = new Set()

export default async function vipSystem(sock, m, { text, command, reply, sender, isOwner }) {

switch(command) {

// 👑 VIP MENU
case 'vipmenu': {
if (!vipUsers.has(sender)) 
return reply("❌ This is VIP Only Command 👑")

let menu = `
╔═══〔 👑 VIP PANEL 〕═══╗
║ ✦ Premium Access : ACTIVE
║ ✦ Unlimited AI   : ENABLED
║ ✦ No Cooldown    : ON
║ ✦ Owner Support  : PRIORITY
╚═══════════════════╝

> 💎 ADEEL XMD VIP SYSTEM 👑
`
reply(menu)
}
break

// ➕ ADD VIP (Owner Only)
case 'addvip': {
if (!isOwner) return reply("❌ Owner Only Command")

if (!text) return reply("Use: .addvip 923XXXXXXXXX")

let number = text.replace(/[^0-9]/g, '') + "@s.whatsapp.net"
vipUsers.add(number)

reply("✅ User Added to VIP 👑")
}
break

// ➖ REMOVE VIP (Owner Only)
case 'delvip': {
if (!isOwner) return reply("❌ Owner Only Command")

if (!text) return reply("Use: .delvip 923XXXXXXXXX")

let number = text.replace(/[^0-9]/g, '') + "@s.whatsapp.net"
vipUsers.delete(number)

reply("❌ User Removed from VIP")
}
break

// 📜 VIP LIST
case 'viplist': {
if (!isOwner) return reply("❌ Owner Only Command")

let list = [...vipUsers].map(v => "👑 " + v.split('@')[0]).join("\n")

reply("👑 VIP USERS:\n\n" + (list || "No VIP Users"))
}
break

}
}
