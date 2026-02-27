const { cmd } = require("../command");
const axios = require("axios");

/* ================= SEND IMAGE ================= */

cmd({
  pattern: "sendimage",
  alias: ["sendimg", "imgdl"],
  react: "🖼️",
  desc: "Send image from URL",
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Image URL do");

    const res = await axios.get(q, { responseType: "arraybuffer" });

    await conn.sendMessage(from, {
      image: Buffer.from(res.data),
      caption: `
*╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*
*│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ-᙭ᗰᗪ ⊱┈─̇─̣╌*
*│🖼️ Image Downloaded*
*╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭*

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Image download failed");
  }
});


/* ================= SEND AUDIO ================= */

cmd({
  pattern: "sendaudio",
  alias: ["sendmp3"],
  react: "🎶",
  desc: "Send audio from URL",
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Audio URL do");

    const res = await axios.get(q, { responseType: "arraybuffer" });

    await conn.sendMessage(from, {
      audio: Buffer.from(res.data),
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Audio download failed");
  }
});


/* ================= SEND VIDEO ================= */

cmd({
  pattern: "sendvideo",
  alias: ["sendmp4"],
  react: "🎥",
  desc: "Send video from URL",
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Video URL do");

    await conn.sendMessage(from, {
      video: { url: q },
      mimetype: "video/mp4"
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Video send failed");
  }
});
