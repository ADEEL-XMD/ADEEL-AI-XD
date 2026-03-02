const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

// Safe fetch for all Node versions
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch information about bot GitHub repository",
    react: "🩷",
    category: "info",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    const githubRepoURL = 'https://github.com/ADEEL-XMD/ADEEL-AI-XD';

    try {
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return reply("❌ Invalid GitHub repository URL");

        const username = match[1];
        const repoName = match[2];

        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);

        const repoData = await response.json();

        const caption = `
*╔═══〔 🧠 ADEEL AI • VIP CORE 🧠 〕═══╗*
*║ 🔐 SYSTEM : REPOSITORY SCANNER*
*╚══════════════════════════════════╝*

🟢 🤖 BOT        : ${repoData.name}
🟢 👑 OWNER      : ${repoData.owner.login}
🟢 ⭐ STARS      : ${repoData.stargazers_count}
🟢 🍴 FORKS      : ${repoData.forks_count}
🟢 📝 DESC       : ${repoData.description || "No description"}

⚡ GITHUB ACCESS :
${repoData.html_url}

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
👑 VIP STATUS : ACTIVE
⚡ SECURITY   : ENABLED
🧠 AI CORE    : ONLINE
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

⭐ STAR & FORK REQUIRED ⭐

>  POWERED BY MAFIA ADEEL 💀
`;

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/ejufwa.jpg' },
            caption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404811118873@newsletter',
                    newsletterName: 'ᗩᗪᗴᗴᒪ-᙭ᗰᗪ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Optional voice
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: mek });
        }

    } catch (err) {
        console.error("REPO ERROR:", err);
        reply(`
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣*
*│❌ 𝐑𝐞𝐩𝐨 𝐅𝐞𝐭𝐜𝐡 𝐅𝐚𝐢𝐥𝐞𝐝*
*│⏳ Try again later*
*╰━━━━━━━━━━━━━━━━━━━━⬣*
`);
    }
});
