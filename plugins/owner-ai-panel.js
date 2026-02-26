let aiEnabled = true

export default async function ownerAIPanel(sock, m, { text, command, reply, isOwner }) {

switch(command) {

// 🔛 ENABLE AI
case 'aion': {
if (!isOwner) return reply("❌ Owner Only Command")

aiEnabled = true
reply("🤖 AI System Enabled ✅")
}
break

// 🔴 DISABLE AI
case 'aioff': {
if (!isOwner) return reply("❌ Owner Only Command")

aiEnabled = false
reply("🛑 AI System Disabled ❌")
}
break

// 📊 AI STATUS
case 'aistatus': {
if (!isOwner) return reply("❌ Owner Only Command")

reply(`🤖 AI Status : ${aiEnabled ? "ON ✅" : "OFF ❌"}`)
}
break

}
}
