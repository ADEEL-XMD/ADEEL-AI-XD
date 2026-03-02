const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "creator",
    alias: ["coder", "dev", "owner"],
    desc: "Show bot creator information",
    category: "info",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {

        const ownerInfo = {
            name: "ᴀᴅᴇᴇʟ xᴍᴅ",
            number: "+923174838990",
            photo: "https://files.catbox.moe/pf9a6s.jpg",
            bio: "Developer of MAFIA ADEEL"
        };

        const caption = `
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣*
*│♲︎︎︎ 👑 ᴄʀᴇᴀᴛᴇʀ:* ${ownerInfo.name}
*│♲︎︎︎ 📞 ɴᴜᴍʙᴇʀ:* ${ownerInfo.number}
*│♲︎︎︎ 📝 ʙɪᴏ:* ${ownerInfo.bio}
*│*
*│♲︎︎︎ 🤖 ʙᴏᴛ:* ${config.BOT_NAME}
*│♲︎︎︎ ⚡ ᴠᴇʀsɪᴏɴ:* ${config.VERSION || "5.0.0"}
*╰━━━━━━━━━━━━━━━━━━━━⬣*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`;

        await conn.sendMessage(from, {
            image: { url: ownerInfo.photo },
            caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404811118873@newsletter',
                    newsletterName: 'ᴀᴅᴇᴇʟ-xᴍᴅ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("CREATOR ERROR:", err);
        reply(
`*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣*
*│❌ ᴄʀᴇᴀᴛᴏʀ ᴄᴏᴍᴍᴀɴᴅ ᴇʀʀᴏʀ*
*│⏳ Please try again later*
*╰━━━━━━━━━━━━━━━━━━━━⬣*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`
        );
    }
});
