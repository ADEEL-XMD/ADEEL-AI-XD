const { cmd } = require("../command");
const { sleep } = require("../lib/functions");

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    desc: "Update and restart the bot system",
    category: "owner",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return reply("*📛 𝐓𝐡𝐢𝐬 𝐢𝐬 𝐚𝐧 𝐨𝐰𝐧𝐞𝐫-𝐨𝐧𝐥𝐲 𝐜𝐨𝐦𝐦𝐧𝐝!*");
        }

        // Initial message
        const updateMsg = await conn.sendMessage(from, {
            text: 'ιηιтιαтιηg sүsтεм υρ∂αтε...🚀'
        }, { quoted: mek });

        // Update steps with emojis
        const updateSteps = [
            "*🔍 cнєcкιηg sүsтєм sтαтυs...*",
            "*🛠️ ρяєραʀιηg υρ∂αтє cσмρσηєηтs...*",
            "*📦 ғιηαℓιzιηg ραcкαgєs...*",
            "*⚡ σρтιмιzιηg ρєʀғσʀмαηcε...*",
            "*🔃 ᗩᗪᗴᗴᒪ ᙭ᗪ ᖇᗴՏTᗩᖇT...*",
            "*♻️ ʀєѕτατιηg sεʀvιcεs...*"
        ];

        // Show each step with delay
        for (const step of updateSteps) {
            await sleep(1500);
            await conn.relayMessage(
                from,
                {
                    protocolMessage: {
                        key: updateMsg.key,
                        type: 14,
                        editedMessage: {
                            conversation: step,
                        },
                    },
                },
                {}
            );
        }

        // Final message before restart
        await conn.sendMessage(from, {
            text: '- *✅ 𝒻𝒶𝒾𝓏𝒶𝓃-𝓂𝒹 υρ∂αтє cσмρℓєтє∂ ʀєѕτατιηg*'
        }, { quoted: mek });

        // Execute restart after a short delay
        await sleep(1000);
        require('child_process').exec("pm2 restart all");

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: `*❌ Update Failed!*\n_Error:_ ${e.message}\n\n*Try manually:*\n\`\`\`pm2 restart all\`\`\``
        }, { quoted: mek });
    }
});
