const { cmd } = require("../command");
const os = require("os");

cmd({
    pattern: "faizan",
    alias: ["fazi"],
    desc: "Faizan full introduction",
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
╭━〔 🌐 ᗩᗪᗴᗴᒪ IᑎᖴO 〕━⬣
│♲︎︎︎ 👤 *Name:* ᴀᴅᴇᴇʟ
│♲︎︎︎ 🧑‍💼 *Nick:* ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
│♲︎︎︎ 🎂 *Age:* 19
│♲︎︎︎ 🧬 *Caste:* sᴀʙǫɪ
│♲︎︎︎ 🌍 *Country:* ᴘᴀᴋɪsᴛᴀɴ
│♲︎︎︎ 🏙️ *City:* ᴊᴀᴍᴜʀ
│
│♲︎︎︎ 🤖 *Bot Name:* ᴀᴅᴇᴇʟ xᴍᴅ
│♲︎︎︎ 👑 *Owner:* ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
│♲︎︎︎ 📞 *Owner No:* +𝟿23174838990
│♲︎︎︎ 🔣 *Prefix:* .
│♲︎︎︎ ⚙️ *Mode:* ᴘᴜʙʟɪᴄ
│♲︎︎︎ 🔌 *Baileys:* ᴍᴜʟᴛɪ ᴅᴀᴠɪᴄᴇ
│
│♲︎︎︎ ⏳ *Uptime:* ${h}h ${min}m ${sec}s
│♲︎︎︎ 💻 *Platform:* ${os.platform()}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

>  ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ*
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
