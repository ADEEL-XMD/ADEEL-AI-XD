const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check bot is alive or not",
    category: "main",
    react: "🌈",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        const aliveMsg = `
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣̣*
*│★ 🤖 ʙᴏᴛ sᴛᴀᴛᴜs:* Online ✅
*│★ 👑 ᴏᴡɴᴇʀ:* ${config.OWNER_NAME}
*│★ ⚙️ ᴍᴏᴅᴇ:* ${config.MODE}
*│★ 🔣 ᴘʀᴇғɪx:* ${config.PREFIX}
*│★ 💻 ʜᴏsᴛ:* ${os.hostname()}
*│★ 💾 ʀᴀᴍ:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
*│★ ⏱️ ᴜᴘᴛɪᴍᴇ:* ${runtime(process.uptime())}
*╰━━━━━━━━━━━━━━━━━━━━⬣*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: aliveMsg,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404811118873@newsletter',
                    newsletterName: 'ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("ALIVE ERROR:", err);

        const errorMsg = `
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣*
*│❌ 𝐀𝐥𝐢𝐯𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐄𝐫𝐫𝐨𝐫*
*│⏳ Please try again later*
*╰━━━━━━━━━━━━━━━━━━━━⬣*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`;

        await reply(errorMsg);
    }
});
