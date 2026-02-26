const vipUsers = new Set()

export default async function vipReact(sock, m, { sender }) {

if (!vipUsers.has(sender)) return

const reactions = ["🔥","😎","👑","⚡","💎","🖤","🚀"]

let random = reactions[Math.floor(Math.random() * reactions.length)]

await sock.sendMessage(m.key.remoteJid, {
react: {
text: random,
key: m.key
}
})

}
