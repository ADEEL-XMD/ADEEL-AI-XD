const axios = require("axios");
const { cmd } = require("../command");

cmd(
{
pattern: "movie",
alias: ["moviedl","film"],
react: "🎬",
desc: "Download movie from Arslan API",
category: "downloader",
use: ".movie avatar",
filename: __filename
},
async (conn, mek, m, { args, reply }) => {

const query = args.join(" ");
if (!query) {
return reply(`
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ ❌ ᴇɴᴛᴇʀ ᴍᴏᴠᴇ ɴᴀᴍᴇ!
╰━━━━━━━━━━━━━━━━━━━━⬣

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`);
}

try {

await reply(`
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ 🎬 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐌𝐨𝐯𝐢𝐞...
│ ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...
╰━━━━━━━━━━━━━━━━━━━━⬣

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`);

const api = `https://arslan-apis.vercel.app/movie/moviesdl?q=${encodeURIComponent(query)}`;
const { data } = await axios.get(api);

if (!data.status) {
return reply(`
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ ❌ 𝐌𝐨𝐯𝐢𝐞 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!
╰━━━━━━━━━━━━━━━━━━━━⬣

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`);
}

const movie = data.result;

// If download link NOT available
if (!movie.download) {

await conn.sendMessage(m.chat,{
image: { url: movie.image },
caption: `
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ 🎬 𝐌𝐎𝐕𝐈𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
│
│ 🎞 Title: ${movie.title}
│ ⭐ IMDB: ${movie.imdb}
│ ⏱ Runtime: ${movie.runtime}
│ 📅 Release: ${movie.date}
│ 🎥 Quality: ${movie.quality}
╰━━━━━━━━━━━━━━━━━━━━⬣

⚠️ 𝐃𝐢𝐫𝐞𝐜𝐭 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤 𝐍𝐨𝐭 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`
},{quoted:m});

return;
}

// If download link exists
await conn.sendMessage(m.chat,{
document: { url: movie.download },
mimetype: "video/mp4",
fileName: `${movie.title}.mkv`,
caption: `
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ 🎬 𝐌𝐎𝐕𝐈𝐄 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃
│
│ 🎞 ${movie.title}
│ ⭐ IMDB: ${movie.imdb}
│ ⏱ ${movie.runtime}
│ 📅 ${movie.date}
╰━━━━━━━━━━━━━━━━━━━━⬣

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`
},{quoted:m});

} catch (e) {

console.log(e);

reply(`
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
│ ❌ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐄𝐫𝐫𝐨𝐫!
╰━━━━━━━━━━━━━━━━━━━━⬣

> 📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ`);
}
});
