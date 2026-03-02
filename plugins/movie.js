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
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│ ❌ 𝐌𝐨𝐯𝐢𝐞 𝐍𝐚𝐦𝐞 𝐃𝐨!
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`);
}

try {

await reply(`
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ ╌─̇─̣⊰ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³ ⊱┈─̇─̣╌
│─̇─̣┄┄┄┄┄┄┄┄┄┄┄┄┄─̇─̣
│ 🎬 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐌𝐨𝐯𝐢𝐞...
│ ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`);

const api = `https://arslan-apis.vercel.app/movie/moviesdl?q=${encodeURIComponent(query)}`;
const { data } = await axios.get(api);

if (!data.status) {
return reply(`
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ ❌ 𝐌𝐨𝐯𝐢𝐞 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝!
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`);
}

const movie = data.result;

// If download link NOT available
if (!movie.download) {

await conn.sendMessage(m.chat,{
image: { url: movie.image },
caption: `
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ 🎬 𝐌𝐎𝐕𝐈𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
│
│ 🎞 Title: ${movie.title}
│ ⭐ IMDB: ${movie.imdb}
│ ⏱ Runtime: ${movie.runtime}
│ 📅 Release: ${movie.date}
│ 🎥 Quality: ${movie.quality}
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

⚠️ 𝐃𝐢𝐫𝐞𝐜𝐭 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤 𝐍𝐨𝐭 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`
},{quoted:m});

return;
}

// If download link exists
await conn.sendMessage(m.chat,{
document: { url: movie.download },
mimetype: "video/mp4",
fileName: `${movie.title}.mkv`,
caption: `
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ 🎬 𝐌𝐎𝐕𝐈𝐄 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃
│
│ 🎞 ${movie.title}
│ ⭐ IMDB: ${movie.imdb}
│ ⏱ ${movie.runtime}
│ 📅 ${movie.date}
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`
},{quoted:m});

} catch (e) {

console.log(e);

reply(`
╭ׂ┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╮
│ ❌ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐄𝐫𝐫𝐨𝐫!
╰┄•─̇─̣┄•─̇─̣┄•─̇─̣┄•─̇─̣╯

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝐅𝐀𝐈𝐙𝐀𝐍-𝐌𝐃 _⁸⁷³`);
}
});
