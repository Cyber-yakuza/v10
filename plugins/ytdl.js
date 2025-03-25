/*
Please Give Credit 🙂❤️
⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ©𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 𝚅1 💚
*/
const { cmd, commands } = require('../lib/command');
const { fetchJson } = require('../lib/functions');
//const domain = `https://manu-ofc-api-site-6bfcbe0e18f6.herokuapp.com/`
//const api_key = `your-api-key`
//===== Api-Key එක මට Message එකක් දාල ඉල්ලගන්න, +94 74 227 4855 සල්ලි ගන්න නෙවේ, කීයක් Use කරනවද දැනගන්න...❤️=====

cmd({
    pattern: "testj",
    react: "🌟",
    desc: "Check bot owner.",
    category: "main",
    use: ".testj",
    filename: __filename
},
async(conn, mek, m, {from, reply}) => {
    try {
        return await conn.sendMessage(from, {
            video: { url: "https://tikcdn.io/tiktokdownload/7263749907935284485" },
            mimetype: 'video/mp4',
            ptv: true
        }, {quoted: mek});
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});

//============================================
cmd({
    pattern: "hiru",
    react: "⭐",
    desc: "news",
    category: "news",
    use: ".hiru",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching JSON data from the API endpoint
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/api/hiru-news?apikey=Manul-Official-Key-3467`);
            // Extracting necessary fields from the JSON response
            const title = response.data.title;
            const date = response.data.date;
            const desc = response.data.desc;
            const link = response.data.link;
            const image = response.data.img;
            const createdBy = response.createdBy;
            
            // Craft the message to send to the user
            const message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗛𝗜𝗥𝗨 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Sending the message along with the image
            await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});
//============================================
cmd({
    pattern: "lankadeepa",
    react: "😎",
    desc: "news",
    category: "news",
    use: ".lankadeepa",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching JSON data from the API endpoint
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/lankadeepa-news?apikey=Manul-Official-Key-3467`);

        if (response.status) {
            // Extracting necessary fields from the response
            const title = response.data.title;
            const date = response.data.date;
            const desc = response.data.desc;
            const url = response.data.url;
            const image = response.data.image;
            const createdBy = response.createdBy;
            
            // Craft the message to send to the user
            const message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗟𝗔𝗞𝗔𝗗𝗘𝗘𝗣𝗔 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Sending the message along with the image
            await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
        } else {
            reply('Sorry, there was an issue fetching the news.');
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});

//============================================
cmd({
    pattern: "sirasa",
    react: "♦",
    desc: "news",
    category: "news",
    use: ".sirasa",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching the news JSON data from the API
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/sirasa-news?apikey=Manul-Official-Key-3467`);

        if (response.status) {
            // Extracting data from the response
            const title = response.result.title;
            const date = response.result.date;
            const desc = response.result.desc;
            const url = response.result.url;
            const image = response.result.image !== "Image not found" ? response.result.image : null;
            const creator = response.creator;

            // Crafting the message
            let message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗦𝗜𝗥𝗔𝗦𝗔 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Send the message, along with an image if available
            if (image) {
                await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: message }, { quoted: mek });
            }
        } else {
            reply('Sorry, there was an issue fetching the news.');
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});
//============================================
cmd({
    pattern: "ada",
    react: "🔊",
    desc: "news",
    category: "news",
    use: ".ada",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching the news JSON data from the API
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/ada-news?apikey=Manul-Official-Key-3467`);

        if (response.status) {
            // Extracting data from the response
            const title = response.data.result.title;
            const date = response.data.result.date;
            const time = response.data.result.time;
            const desc = response.data.result.desc;
            const url = response.data.result.url;
            const image = response.data.result.image !== "Image not found" ? response.data.result.image : null;
            const creator = response.data.creator;

            // Crafting the message
            let message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗔𝗗𝗔 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Send the message, along with an image if available
            if (image) {
                await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: message }, { quoted: mek });
            }
        } else {
            reply('Sorry, there was an issue fetching the news.');
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});
//============================================
cmd({
    pattern: "bbc",
    react: "🌌",
    desc: "news",
    category: "news",
    use: ".bbc",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching the news data from the API
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/bbc-news?apikey=Manul-Official-Key-3467`);

        if (response.status) {
            // Extracting data from the response
            const title = response.data.result.title;
            const desc = response.data.result.desc;
            const date = response.data.result.date || "Not provided";
            const image = response.data.result.image;
            const url = response.data.result.url;
            const creator = response.data.creator;

            // Crafting the message
            let message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗕𝗕𝗖 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Send the message, along with an image if available
            if (image) {
                await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: message }, { quoted: mek });
            }
        } else {
            reply('Sorry, there was an issue fetching the news.');
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});
//============================================
cmd({
    pattern: "gagana",
    react: "✈",
    desc: "news",
    category: "news",
    use: ".gagana",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Fetching the news data from the API
        const response = await fetchJson(`https://mr-manul-ofc-apis.vercel.app/gagana-news?apikey=Manul-Official-Key-3467`);

        if (response.status) {
            // Extracting data from the response
            const title = response.data.result.title;
            const desc = response.data.result.desc;
            const image = response.data.result.image;
            const url = response.data.result.url;
            const creator = response.data.creator;

            // Crafting the message
            let message = `
> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢 𝗚𝗔𝗚𝗔𝗡𝗔 𝗡𝗘𝗪𝗦📃

*𝗧𝗶𝘁𝗹𝗲:* ${title}
*𝗗𝗔𝗧𝗘:* ${date}
*𝗗𝗘𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡:* ${desc}
*𝗥𝗘𝗔𝗗 𝗠𝗢𝗥𝗘:* ${link}

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
            `;

            // Send the message, along with an image if available
            if (image) {
                await conn.sendMessage(from, { image: { url: image }, caption: message }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { text: message }, { quoted: mek });
            }
        } else {
            reply('Sorry, there was an issue fetching the news.');
        }
    } catch (e) {
        console.log(e);
        reply(`Error: ${e}`);
    }
});
