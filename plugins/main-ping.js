const config = require('../config');
const { cmd, commands } = require('../command');

// Array of different fancy text styles for 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃
const botNameStyles = [
    "𝐅𝐚𝐢𝐳𝐚𝐧-𝗠𝗱",
    "𝙵𝙰𝙸𝚉𝙰𝙽- 𝙼𝙳",
    "𝓕𝓪𝓲𝔃𝓪𝓷-ℳ𝒟",
    "𝔉𝔞𝔦𝔷𝔞𝔫-𝔐𝔡",
    "𝕱𝖆𝖎𝖟𝕬𝕹-𝕸𝕯",
    "ⒻⒶⒾⓏⒶⓃ-ⓂⒹ",
    "ℱ𝔸𝕀ℤ𝔸ℕ-𝕄𝔻",
    "𝔉",
    "𝓕𝓪𝓲𝔃𝓪𝓷-𝓜𝓓",
    "𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃"
];

// Track current style index
let currentStyleIndex = 0;

cmd({
    pattern: "ping3",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "🫀",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        // Get current fancy bot name and rotate for next time
        const fancyBotName = botNameStyles[currentStyleIndex];
        currentStyleIndex = (currentStyleIndex + 1) % botNameStyles.length;

        const text = `> *${fancyBotName} SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404256215058@newsletter',
                    newsletterName: "𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ping2 remains unchanged
cmd({
    pattern: "ping4",
    desc: "Check bot's response time.",
    category: "main",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now()
        const message = await conn.sendMessage(from, { text: '*PINGING...*' })
        const endTime = Date.now()
        const ping = endTime - startTime
        await conn.sendMessage(from, { text: `*🔥 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 SPEED : ${ping}ms*` }, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
})
