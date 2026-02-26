const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "tiktokstalk",
    alias: ["tstalk", "ttstalk"],
    react: "❤️‍🔥",
    desc: "Get TikTok user profile details",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(
`❌ Please provide a TikTok username.

Example:
.tiktokstalk khaby.lame`
            );
        }

        const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl, { timeout: 60000 });

        if (!data.status) {
            return reply("❌ User not found. Please check the username and try again.");
        }

        const user = data.data.user;
        const stats = data.data.stats;

        const caption = `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─᛭*
*│ ╌─̇─̣⊰ _ᗩᗪᗴᗴᒪ-᙭ᗰᗪ_ ⊱┈─̇─̣╌*
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│❀ 👤 Username:* @${user.uniqueId}
*│❀ 📛 Nickname:* ${user.nickname}
*│❀ ✅ Verified:* ${user.verified ? "Yes" : "No"}
*│❀ 🌍 Region:* ${user.region || "Unknown"}
*│❀ 🔒 Private:* ${user.privateAccount ? "Yes" : "No"}
*│❀ 📝 Bio:* ${user.signature || "No bio available"}
*│❀ 🔗 Bio Link:* ${user.bioLink?.link || "No link"}
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│❀ 👥 Followers:* ${stats.followerCount.toLocaleString()}
*│❀ 👤 Following:* ${stats.followingCount.toLocaleString()}
*│❀ ❤️ Likes:* ${stats.heartCount.toLocaleString()}
*│❀ 🎥 Videos:* ${stats.videoCount.toLocaleString()}
*│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣*
*│❀ 📅 Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
*│❀ 🔗 Profile:* https://www.tiktok.com/@${user.uniqueId}
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─᛭*

> ᗩᗪᗴᗴᒪ-᙭ᗰᗪ
`;

        await conn.sendMessage(
            from,
            {
                image: { url: user.avatarLarger },
                caption
            },
            { quoted: mek }
        );

    } catch (err) {
        console.error("TIKTOK STALK ERROR:", err);
        reply("❌ Failed to fetch TikTok profile details. Please try again later.");
    }
});
