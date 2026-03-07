const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
    pattern: "drama",
    alias: ["ytdrama", "ytfind"],
    react: "🎭",
    desc: "Search YouTube & download drama/video",
    category: "download",
    use: ".drama <name>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("❌ Please provide a drama name or search text.");
        }

        // ⏳ React loading
        await conn.sendMessage(from, {
            react: { text: "⏳", key: m.key }
        });

        // 🔍 YouTube search
        const search = await yts(query);
        if (!search.videos || search.videos.length === 0) {
            return reply("❌ No video found for your search.");
        }

        const video = search.videos[0];

        // 📋 Info message
        const infoText = `
🎭 *DRAMA FOUND*

🎬 *Title:* ${video.title}
👤 *Channel:* ${video.author?.name || "Unknown"}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views.toLocaleString()}
📅 *Uploaded:* ${video.ago}

⏳ *Downloading video, please wait...*

> 📌 ᴘᴏᴡᴇʀ ʙʏ *ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ*
        `;

        await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: mek });

        // 📥 Download API (Arslan)
        const apiUrl = `https://arslan-apis.vercel.app/download/ytmp4?url=${encodeURIComponent(video.url)}`;
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data || res.data.status !== true || !res.data.result) {
            return reply("❌ Drama download error. Please try again after a short while.");
        }

        const result = res.data.result;

        // 📤 Send video
        await conn.sendMessage(from, {
            video: { url: result.url },
            mimetype: "video/mp4",
            caption: `
🎬 *${result.title || video.title}*
📦 *Quality:* ${result.quality || "MP4"}
⏱️ *Duration:* ${result.duration || video.timestamp}

✅ *Download complete*

> 📌 ᴘᴏᴡᴇʀ ʙʏ *ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ*
            `
        }, { quoted: mek });

        // ✅ Success react
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (error) {
        console.error("DRAMA ERROR:", error);
        reply("❌ Drama download error. Please try again after a short while.");
        await conn.sendMessage(from, {
            react: { text: "❌", key: m.key }
        });
    }
});
