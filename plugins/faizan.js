const { cmd } = require("../command");
const os = require("os");

cmd({
    pattern: "adeel",
    alias: ["mafia"],
    desc: "Adeel full introduction",
    category: "info",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {

        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600);
        const min = Math.floor((uptime % 3600) / 60);
        const sec = Math.floor(uptime % 60);

        const text = `
╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ ᙭ᗰᗪ _³⁰³_ ⊱┈─̇─̣╌
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│❀ 👤 *Name:* ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
│❀ 🧑‍💼 *Nick:* ᴀᴅᴇᴇʟ ᴋʜᴀɴ
│❀ 🎂 *Age:* 19
│❀ 🧬 *Caste:* sᴀʙǫɪ
│❀ 🌍 *Country:* ᴘᴀᴋɪsᴛᴀɴ
│❀ 🏙️ *City:* (ᴊᴀᴍᴘᴜʀ ʀᴀᴊᴀɴᴘᴜʀ)
│
│❀ 🤖 *Bot Name:* ᴀᴅᴇᴇʟ-xᴍᴅ
│❀ 👑 *Owner:* ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
│❀ 📞 *Owner No:* +923174838999
│❀ 🔣 *Prefix:* .
│❀ ⚙️ *Mode:* ᴘᴜʙʟɪᴄ
│❀ 🔌 *Baileys:* ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ
│
│❀ ⏳ *Uptime:* ${h}h ${min}m ${sec}s
│❀ 💻 *Platform:* ${os.platform()}
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭

> 📌 ᴘᴏᴡᴇʀ ʙʏ *ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ**
`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
    }
});
