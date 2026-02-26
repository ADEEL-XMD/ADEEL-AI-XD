const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "FAIZAN-MD~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiU0JXaHN4TmVGRTNrb1dIUUZiWDhZbHllWTlkandRd0ZENWhRbFRrbEozND0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNUpROEhidXE2b3ZXV1pWTEpxekJOai8xM042L1FKZWF2QTh0KzVXdllUVT0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJpRW5DSjhzMGdqZDdpRGE4KzJoTjJXUHFndGlmUG9ncGQ2Y1FJTzJTQlU4PSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ3aUZ0VVpPSGZNUEUwRUdOSFlZSkRmd3ZXN3Y5RHJJb0hybGRnc3hLRVZVPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjRBRkVTQklRRzBMbFpuNkNwSzJadGZ3SkRsWmRaT1Fjcndib2x5TmRJbWM9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImJwZS9paVhqaWYrSE1HSS8ycmtWMzVmc05JVDNIQytDQnREeUpBWmZLMWc9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiTU5nYWJwTHNJYlZoZFhxQVN2SU41TkJLMTZobUhZcUhjSDMwTE53eFRVYz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVThFNUNSZFV2bHpJTU5UeEp2VGo5QVRxTGN0YnUrank2U1BXcnRpeDhSOD0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjJYVXYvZHhxeC9NRi9DNm5wTHlrMXg3a241dzJrUjdHTGM0UVJKTWZKVy9oMjZDVWtYdHIrV09iemlDNnRzR0I3eEFSR0d1aDh2bzYzZzN0WUltL0NnPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6NDgsImFkdlNlY3JldEtleSI6IndvUzNjUXJYUE9nQUcwdnZSeUpRRGlqUDAzT2szU3dHbmphdmFWRzAwOTg9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjo4MTksImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjo4MTksImFjY291bnRTeW5jQ291bnRlciI6MCwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sInJlZ2lzdGVyZWQiOnRydWUsInBhaXJpbmdDb2RlIjoiOEJRRDlOWjciLCJtZSI6eyJpZCI6IjkyMzAwODA3NDk1MDoxNUBzLndoYXRzYXBwLm5ldCIsIm5hbWUiOiJmYXoiLCJsaWQiOiIyNzE2MjA5NDYxNjU5OToxNUBsaWQifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ09HOTdkUUVFSS9EL2NzR0dBRWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6IjVEWDFSaEtYR0RQVnZnYVk3Wm1mSnJQS3MzUUtWUjdtUEl4R0VDMmpZaUE9IiwiYWNjb3VudFNpZ25hdHVyZSI6ImRMd1Q1clRwOFBoTmNhakZneDB4NW8vanVSd2dPM0t6V1VWeG5pOGpFVFF4aUxKWGlUSWswMFYwN1ZNekhIRFhVU2VEa1dMY1h2b2E1Z09KOG5rekFRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJpUU43cFY0UlNyd2d3L1JGN0lMbmt0dU1rUVd3eGRqZGsvQ1pwb2UzaFFyUk0vdm9icUcvY2hRUkVEWDU3RDJ2d3h6NDhYRzdTYlQvN3hxSnFmNjVCQT09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjI3MTYyMDk0NjE2NTk5OjE1QGxpZCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJlUTE5VVlTbHhnejFiNEdtTzJabnlhenlyTjBDbFVlNWp5TVJoQXRvMklnIn19XSwicGxhdGZvcm0iOiJzbWJhIiwicm91dGluZ0luZm8iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJDQWdJRFFnRiJ9LCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3Njk5NTU3MzIsImxhc3RQcm9wSGFzaCI6IlBXazVCIn0=",
// add your Session Id 
AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
// make true or false status auto seen
AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
// make true if you want auto reply on status 
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// make true if you want auto reply on status 
AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY ADEEL XMD*",
// set the auto reply massage on status reply  
ANTI_DELETE: process.env.ANTI_DELETE || "true",
// set true false for anti delete     
ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox", 
// change it to 'same' if you want to resend deleted message in same chat     
WELCOME: process.env.WELCOME || "false",
// true if want welcome and goodbye msg in groups    
ADMIN_EVENTS: process.env.ADMIN_EVENTS || "false",
// make true to know who dismiss or promoted a member in group
ANTI_LINK: process.env.ANTI_LINK || "true",
// make anti link true,false for groups 
MENTION_REPLY: process.env.MENTION_REPLY || "false",
// make true if want auto voice reply if someone menetion you 
MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/qj4dc0.jpg",
// add custom menu and mention reply image url
PREFIX: process.env.PREFIX || ".",
// add your prifix for bot   
BOT_NAME: process.env.BOT_NAME || "ᗩᗪᗴᗴᒪ-᙭ᗰᗪ",
// add bot namw here for menu
AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
// true to get auto status react
STICKER_NAME: process.env.STICKER_NAME || "ᗰᗩᖴIᗩ-ᗩᗪᗴᗴᒪ",
// type sticker pack name 
CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
// make this true for custum emoji react    
CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
// chose custom react emojis by yourself 
DELETE_LINKS: process.env.DELETE_LINKS || "true",
// automatic delete links witho remove member 
OWNER_NUMBER: process.env.OWNER_NUMBER || "923174838990",
// add your bot owner number
OWNER_NAME: process.env.OWNER_NAME || "ᗩᗪᗴᗴᒪ ᙭ᗰᗪ",
// add bot owner name
DESCRIPTION: process.env.DESCRIPTION || "*📌 ᴘᴏᴡᴇʀ ʙʏ ᴍᴀғɪᴀ ᴀᴅᴇᴇʟ*",
// add bot owner name    
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/qj4dc0.jpg",
// add img for alive msg
LIVE_MSG: process.env.LIVE_MSG || "> I'ᗩᗰ *ᗰᗩᖴIᗩ-ᗩᗪᗴᗴᒪ*❤️‍🔥",
// add alive msg here 
READ_MESSAGE: process.env.READ_MESSAGE || "false",
// Turn true or false for automatic read msgs
AUTO_REACT: process.env.AUTO_REACT || "false",
// make this true or false for auto react on all msgs
ANTI_BAD: process.env.ANTI_BAD || "false",
// false or true for anti bad words  
MODE: process.env.MODE || "public",
// make bot public-private-inbox-group 
ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "true",
// make anti link true,false for groups 
AUTO_STICKER: process.env.AUTO_STICKER || "false",
// make true for automatic stickers 
AUTO_REPLY: process.env.AUTO_REPLY || "false",
// make true or false automatic text reply 
ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
// maks true for always online 
PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
// make false if want private mod
AUTO_TYPING: process.env.AUTO_TYPING || "false",
// true for automatic show typing   
READ_CMD: process.env.READ_CMD || "true",
// true if want mark commands as read 
DEV: process.env.DEV || "923174838990",
//replace with your whatsapp number        
ANTI_VV: process.env.ANTI_VV || "true",
// true for anti once view 
AUTO_RECORDING: process.env.AUTO_RECORDING || "false"
// make it true for auto recoding 
};
