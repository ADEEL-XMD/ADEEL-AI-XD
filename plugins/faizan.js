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
╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³_ ⊱┈─̇─̣╌
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│❀ 👤 *Name:* 𝙵𝚊𝚒𝚣𝚊𝚗🪽
│❀ 🧑‍💼 *Nick:* 𝙵𝚊𝚣𝚒🪽
│❀ 🎂 *Age:* 20+🪽
│❀ 🧬 *Caste:* 𝙹𝚞𝚝𝚝🪽
│❀ 🌍 *Country:* 𝙿𝚊𝚔𝚒𝚜𝚝𝚊𝚗🪽
│❀ 🏙️ *City:* (𝙰𝚉𝙰𝙳 𝙺𝙰𝚂𝙷𝙼𝙸𝚁🪽)
│
│❀ 🤖 *Bot Name:* 𝙵𝙰𝙸𝚉𝙰𝙽-𝙼𝙳🎀
│❀ 👑 *Owner:* 𝙵𝚊𝚒𝚣𝚊𝚗🫀
│❀ 📞 *Owner No:* +𝟿𝟸𝟹𝟸𝟼𝟼𝟷𝟶𝟻𝟾𝟽𝟹🫰
│❀ 🔣 *Prefix:* .
│❀ ⚙️ *Mode:* 𝙿𝚞𝚋𝚕𝚒𝚌🪄
│❀ 🔌 *Baileys:* 𝙼𝚞𝚕𝚝𝚒 𝙳𝚎𝚟𝚒𝚌𝚎🌙
│
│❀ ⏳ *Uptime:* ${h}h ${min}m ${sec}s
│❀ 💻 *Platform:* ${os.platform()}
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ *𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 🤍*
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
