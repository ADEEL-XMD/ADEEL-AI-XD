export default async function voiceMenu(sock, m, { command, reply }) {

if (command !== "voicemenu") return

let menu = `
╔══════〔 🎵 VOICE MENU 〕══════╗
║ 🔊 .tts text      → Text to Voice
║ 🎤 .toaudio       → Video to MP3
║ 🎶 .bass          → Bass Boost
║ ⚡ .slow          → Slow Effect
║ 🚀 .fast          → Fast Effect
╚══════════════════════════════╝

> 💎 ADEEL XMD AUDIO SYSTEM
`

reply(menu)

}
