const { cmd } = require('../command')
const axios = require('axios')
const yts = require('yt-search')
const fs = require('fs')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path

ffmpeg.setFfmpegPath(ffmpegPath)

cmd({
    pattern: "video",
    alias: ["vid", "playvideo"],
    desc: "YouTube video downloader",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) {
            return reply("❌ Video ka naam ya link likho\nExample:\n.video la la la song")
        }

        // 🔍 YouTube search
        const search = await yts(text)
        if (!search.videos.length) {
            return reply("❌ Video nahi mila")
        }

        const vid = search.videos[0]

        // 🎨 MAFIA-MD STYLE INFO
        const caption = `
╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│ ╌─̇─̣⊰ ᗩᗪᗴᗴᒪ-᙭ᗰᗪ ⊱┈─̇─̣╌
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│❀ 🎬 𝐓𝐢𝐭𝐥𝐞: ${vid.title}
│❀ ⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${vid.timestamp}
│❀ ⏳ 𝐒𝐭𝐚𝐭𝐮𝐬: Processing video...
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`

        await conn.sendMessage(from, {
            image: { url: vid.thumbnail },
            caption
        }, { quoted: mek })

        // 📥 MAFIA API
        const api = `https://arslan-apis.vercel.app/download/ytmp4?url=${encodeURIComponent(vid.url)}`
        const res = await axios.get(api, { timeout: 60000 })

        if (!res.data?.status || !res.data?.result?.download?.url) {
            return reply("❌ Video download error, thori dair baad try karo")
        }

        const meta = res.data.result.metadata
        const dl = res.data.result.download

        // 📂 temp folder
        const tempDir = path.join(__dirname, '../temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

        const rawPath = path.join(tempDir, `raw_${Date.now()}.mp4`)
        const finalPath = path.join(tempDir, `final_${Date.now()}.mp4`)

        // ⬇ Download raw video
        const stream = await axios({
            url: dl.url,
            method: "GET",
            responseType: "stream",
            timeout: 120000
        })

        await new Promise((resolve, reject) => {
            const w = fs.createWriteStream(rawPath)
            stream.data.pipe(w)
            w.on("finish", resolve)
            w.on("error", reject)
        })

        // 🛠️ FFMPEG (VIDEO PLAY FIX)
        await new Promise((resolve, reject) => {
            ffmpeg(rawPath)
                .outputOptions([
                    "-map 0:v:0",
                    "-map 0:a:0?",
                    "-movflags +faststart",
                    "-pix_fmt yuv420p",
                    "-vf scale=trunc(iw/2)*2:trunc(ih/2)*2",
                    "-profile:v baseline",
                    "-level 3.0"
                ])
                .videoCodec("libx264")
                .audioCodec("aac")
                .audioBitrate("128k")
                .format("mp4")
                .on("end", resolve)
                .on("error", reject)
                .save(finalPath)
        })

        // 📤 Send final video
        await conn.sendMessage(from, {
            video: fs.readFileSync(finalPath),
            mimetype: "video/mp4",
            caption: `
╭ׂ┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭
│❀ 🎬 𝐓𝐢𝐭𝐥𝐞: ${meta.title}
│❀ 📀 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: ${dl.quality}
│❀ 📁 𝐅𝐨𝐫𝐦𝐚𝐭: MP4
╰┄─̣┄─̇─̣┄─̇─̣┄─̇─̣┄─̇─̣─̇─̣─᛭

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ
`
        }, { quoted: mek })

        // 🧹 cleanup
        fs.unlinkSync(rawPath)
        fs.unlinkSync(finalPath)

    } catch (err) {
        console.error("VIDEO ERROR:", err)
        reply("❌ Video processing error, thori dair baad try karo")
    }
})
