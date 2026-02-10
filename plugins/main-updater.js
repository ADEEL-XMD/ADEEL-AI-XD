const { cmd } = require("../command");
const { sleep } = require("../lib/functions");
const config = require("../config");

cmd({
    pattern: "update",
    alias: ["upgrade", "sync", "restart"],
    desc: "Update and restart the bot system",
    category: "owner",
    react: "🚀",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        // ✅ OWNER CHECK (HEROKU SAFE)
        const ownerJid = config.OWNER_NUMBER.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        const senderJid = m.sender || m.key.participant;

        if (senderJid !== ownerJid) {
            return reply(`
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│📛 𝐎𝐖𝐍𝐄𝐑 𝐎𝐍𝐋𝐘 𝐂𝐎𝐌𝐌𝐀𝐍𝐃*
*│❌ Access Denied*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³
`);
        }

        // ⏳ START MESSAGE
        const msg = await conn.sendMessage(from, {
            text: `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│🚀 𝐈𝐧𝐢𝐭𝐢𝐚𝐭𝐢𝐧𝐠 𝐔𝐩𝐝𝐚𝐭𝐞*
*│⏳ Please wait...*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
`
        }, { quoted: mek });

        const steps = [
            "🔍 Checking system files...",
            "🛠️ Applying updates...",
            "📦 Optimizing modules...",
            "⚡ Finalizing changes...",
            "♻️ Restarting services..."
        ];

        for (const step of steps) {
            await sleep(1500);
            await conn.relayMessage(from, {
                protocolMessage: {
                    key: msg.key,
                    type: 14,
                    editedMessage: {
                        conversation: `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│${step}*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
`
                    }
                }
            }, {});
        }

        // ✅ FINISH MESSAGE
        await conn.sendMessage(from, {
            text: `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│✅ 𝐔𝐩𝐝𝐚𝐭𝐞 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞*
*│🔁 Restarting bot...*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³
`
        }, { quoted: mek });

        await sleep(1000);

        // 🔁 HEROKU SAFE RESTART
        process.exit(0);

    } catch (e) {
        console.error("UPDATE ERROR:", e);
        reply("❌ Update failed, check logs.");
    }
});
