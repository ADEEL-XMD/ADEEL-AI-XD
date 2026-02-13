const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "srepo",
  desc: "Get GitHub repository full details",
  category: "other",
  react: "🍃",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const repoName = args.join(" ");
    if (!repoName) {
      return reply(
        "❌ Please provide a GitHub repository.\n\n" +
        "*Example:* `.srepo whatsapp-bot/baileys`"
      );
    }

    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "ᗩᗪᗴᗴᒪ-᙭ᗰᗪ"
      }
    });

    const msg = `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ-᙭ᗰᗪ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│❀ 📁 𝐑𝐞𝐩𝐨:* ${data.name}
*│❀ 👤 𝐎𝐰𝐧𝐞𝐫:* ${data.owner.login}
*│❀ ⭐ 𝐒𝐭𝐚𝐫𝐬:* ${data.stargazers_count}
*│❀ 🍴 𝐅𝐨𝐫𝐤𝐬:* ${data.forks_count}
*│❀ 👀 𝐖𝐚𝐭𝐜𝐡𝐞𝐫𝐬:* ${data.watchers_count}
*│❀ 📝 𝐃𝐞𝐬𝐜:* ${data.description || "No description available"}
*│❀ 🌐 𝐋𝐢𝐧𝐤:* ${data.html_url}
*│❀ 📅 𝐂𝐫𝐞𝐚𝐭𝐞𝐝:* ${new Date(data.created_at).toDateString()}
*│❀ 🔄 𝐔𝐩𝐝𝐚𝐭𝐞𝐝:* ${new Date(data.updated_at).toDateString()}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ*
`;

    await conn.sendMessage(from, { text: msg }, { quoted: m });

  } catch (error) {
    console.error("SREPO ERROR:", error);
    reply(
      "❌ *Failed to fetch repository details.*\n" +
      "Please check the repository name and try again later."
    );
  }
});
