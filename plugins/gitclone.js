const { cmd } = require("../command");
const fetch = require("node-fetch");

cmd({
  pattern: "gitclone",
  alias: ["git"],
  desc: "Download GitHub repository as zip",
  react: "📦",
  category: "downloader",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    if (!args[0]) {
      return reply(`
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣*
*│❌ GitHub link missing*
*│ Example:*
*│ .gitclone https://github.com/user/repo*
*╰━━━━━━━━━━━━━━━━━━━━⬣*
`);
    }

    if (!/github\.com\/.+\/.+/.test(args[0])) {
      return reply("❌ Invalid GitHub repository link");
    }

    const match = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i);
    if (!match) return reply("❌ Unable to parse repository link");

    const username = match[1];
    const repo = match[2].replace(".git", "");
    const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

    // Check repo exists
    const head = await fetch(zipUrl, { method: "HEAD" });
    if (!head.ok) return reply("❌ Repository not found");

    const fileName = `${repo}.zip`;

    await reply(`
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣̣*
*│📦 Repository:* ${username}/${repo}
*│⬇️ Downloading ZIP...*
*╰━━━━━━━━━━━━━━━━━━━━⬣*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`);

    await conn.sendMessage(from, {
      document: { url: zipUrl },
      fileName: fileName,
      mimetype: "application/zip",
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363404811118873@newsletter",
          newsletterName: "ᗩᗪᗴᗴᒪ-᙭ᗰᗪ",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error("GITCLONE ERROR:", err);
    reply(`
*╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣̣*
*│❌ GitClone Error*
*│⏳ Try again later*
*╰━━━━━━━━━━━━━━━━━━━━⬣*
`);
  }
});
