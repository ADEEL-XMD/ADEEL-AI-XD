const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "👑", 
    desc: "Get bot owner contact",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME || "ᗩᗪᗴᗴᒪ ᙭ᗰᗪ _³⁰³_";

        // vCard
        const vcard = 
`BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:FAIZAN-MD;
TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}
END:VCARD`;

        // Styled caption message
        const caption = `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ ᙭ᗰᗪ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│👑 𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐍𝐓𝐀𝐂𝐓*
*│*
*│📛 𝐍𝐚𝐦𝐞:* ${ownerName}
*│📞 𝐍𝐮𝐦𝐛𝐞𝐫:* ${ownerNumber}
*│*
*│💬 Tap contact to chat*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> ADEEL-MD _³⁰³_
`;

        // Send styled text
        await conn.sendMessage(from, {
            text: caption
        }, { quoted: mek });

        // Send contact card (ONLY contact, no extra data)
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("OWNER CMD ERROR:", error);
        await conn.sendMessage(from, {
            text: "❌ Owner command error, please try again later."
        }, { quoted: mek });
    }
});
