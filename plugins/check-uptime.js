const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "uptime",
    alias: ["runtime", "up"],
    desc: "Live uptime with FAIZAN-MD style",
    category: "main",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {

        // First message
        let sent = await conn.sendMessage(from, {
            text: "⏳ *FAIZAN-MD starting uptime…*"
        }, { quoted: mek });

        // Run for 60 seconds (1 minute)
        for (let i = 0; i < 60; i++) {

            const up = runtime(process.uptime());

            const text = `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│❀ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞:* ${up}
*│❀ 🤖 𝐁𝐨𝐭:* ${config.BOT_NAME}
*│❀ 👑 𝐎𝐰𝐧𝐞𝐫:* ${config.OWNER_NAME}
*│❀ ⚙️ 𝐌𝐨𝐝𝐞:* ${config.MODE}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³
`;

            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: sent.key,
                        type: 14,
                        editedMessage: { conversation: text }
                    }
                },
                {}
            );

            // wait 1 second
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (e) {
        console.error("UPTIME ERROR:", e);
        reply(`
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌*
*│❌ 𝐔𝐩𝐭𝐢𝐦𝐞 𝐄𝐫𝐫𝐨𝐫*
*│⏳ Please try again later*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
`);
    }
});
