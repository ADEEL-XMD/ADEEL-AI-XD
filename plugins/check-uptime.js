const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: "uptime",
    alias: ["runtime", "up"],
    desc: "Live uptime with ADEEL-XMD style",
    category: "main",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {

        // First message
        let sent = await conn.sendMessage(from, {
            text: "⏳ *ADEEL-XMD starting uptime…*"
        }, { quoted: mek });

        // Run for 60 seconds (1 minute)
        for (let i = 0; i < 60; i++) {

            const up = runtime(process.uptime());

            const text = `
╔═══════════════════════╗
║ 💻 ADEEL XMD TERMINAL ║
╚═══════════════════════╝

┏━━━〔 ⚡ SYSTEM CORE 〕━━━┓
┃ ⏱️ UPTIME : ${up}
┃ 🤖 BOT    : ${config.BOT_NAME}
┃ 👑 OWNER  : ${config.OWNER_NAME}
┃ ⚙️ MODE   : ${config.MODE}
┗━━━━━━━━━━━━━━━━━━━━━━━┛

> 🟢 STATUS : ONLINE
> 🔐 SECURITY : ENABLED
> 🧠 AI CORE : ACTIVE

╔═══════════════════════╗
║ 👑 POWERED BY ADEEL 👑 ║
╚═══════════════════════╝
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
*│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ ᙭ᗰᗪ ⊱┈─̇─̣╌*
*│❌ 𝐔𝐩𝐭𝐢𝐦𝐞 𝐄𝐫𝐫𝐨𝐫*
*│⏳ Please try again later*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
`);
    }
});
