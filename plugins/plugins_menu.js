const os = require("os");
const { cmd, commands } = require("../lib/command");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, Func, fetchJson, } = require("../lib/functions");
const axios = require("axios");
const config = require("../settings");


const menuCommand = {
  pattern: "menu",
  react: "📜",
  category: "main",
  use: ".menu",
  alias: ["panel", "list", "commands", "cmd"],
};
menuCommand.desc = "Get bot's command list.";
menuCommand.dontAddCommandList = true;
menuCommand.use = ".menu";
menuCommand.filename = __filename;

cmd(menuCommand, async (client, message, args, { from, prefix, pushname, reply }) => {
  try {
    // Fetch data from external API
    const data = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let imageUrl = data.imageurl;
    let footerText = data.footer;

    // Organize commands by category
    const categories = [];
    const categoryMap = new Map();
    for (let command of commands) {
      if (!command.dontAddCommandList && command.pattern && command.category.toLowerCase() !== "misc") {
        const category = command.category.toUpperCase();
        if (!categoryMap.has(category)) {
          categories.push(category);
          categoryMap.set(category, []);
        }
        categoryMap.get(category).push(command.pattern);
      }
    }

    // Prepare menu items
    const menuItems = [];
    for (let i = 0; i < categories.length; i++) {
      menuItems.push({
        title: i + 1,
        description: categories[i] + " MENU",
        rowId: prefix + "category " + categories[i],
      });
    }

    // Create menu structure
    const menuSection = {
      title: '',
      rows: menuItems,
    };
    const menuSections = [menuSection];

    // Prepare image and caption
    const image = { url: imageUrl };
    const caption = `*🫣💗👋𝗛𝗘𝗟𝗟𝗢𝗪* ${pushname}

> 🥷𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗗𝗔𝗥𝗞 𝗡𝗘𝗘𝗢 𝗪𝗛𝗔𝗧𝗛𝗔𝗣𝗣 𝗕𝗢𝗧💀

╭═════════════════●●►
│◦ 🥷 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 : *𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢*
│◦ 🥷 𝗢𝗪𝗡𝗘𝗥 𝗡𝗨𝗠𝗕𝗘𝗥 :  07740805/0766934612
│◦ 🥷 *0701469704*
│◦ 🥷 𝗨𝗣𝗧𝗜𝗠𝗘 : ${runtime(process.uptime())}
│◦ 🥷 𝗥𝗔𝗠 : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB
│◦ 🥷 𝗣𝗥𝗘𝗙𝗜𝗫 : ${prefix}
╰═════════════════●●►


> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
`;

    const menuMessage = {
      caption: caption,
      image: image,
      footer: footerText,
      title: '',
      buttonText: "*🔢 Reply the Number you want to select*",
      sections: menuSections,
    };

    const options = { quoted: message };
    return await client.replyList(from, menuMessage, options);
  } catch (error) {
    reply("*Error !!*");
    console.error(error);
  }
});

// Function to determine hosting environment
function determineHostname() {
  const hostnameLength = os.hostname().length;
  if (hostnameLength === 12) return "replit";
  if (hostnameLength === 36) return "heroku";
  if (hostnameLength === 8) return "koyeb";
  return os.hostname();
}

// Command: Category
const categoryCommand = {
  pattern: "category",
  dontAddCommandList: true,
};

cmd(categoryCommand, async (client, message, args, { from, q: query, pushname, reply }) => {
  try {
    const data = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let footerText = data.footer;

    const category = query.trim().toUpperCase();
    if (category === "MISC") return;

    let commandList = `
    *HELLO* ${pushname}
*╭─⊷〔COMMANDS PANEL〕━┈⊷
*│◈ RAM USAGE -* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB
*│◈ RUNTIME -* ${runtime(process.uptime())}
*╰═════════════════⚆*

*╭═══════════════⚆*
*│🫟 ${category} Command List:*
*╰═══════════════⚆*

`;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.category.toUpperCase() === category) {
        commandList += `
*╭═══════════════⚆*
*│Command:* ${command.pattern}
*│Use:* ${command.use}
*╰═══════════════⚆*

`;
      }
    }

    const totalCommands = commands.filter(cmd => cmd.category.toUpperCase() === category).length;
    commandList += `\n➠ *Total Commands in ${category}:* ${totalCommands}\n\n${footerText}`;

    const encodedCategory = encodeURIComponent(category);

    const image = { url: 'https://i.ibb.co/yBYYzRkR/4279.jpg' };
    const messageContent = {
      image: image,
      caption: commandList,
    };
    const options = { quoted: message };
    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    reply("*Error !!*");
    console.error(error);
  }
});

// Command details
const commandDetails = {
  pattern: "alive",
  react: "👋",
  alias: ["online", "test", "bot"],
  desc: "Check bot online or no.",
  category: "main",
  use: ".alive",
  filename: __filename
};

// Function to get hosting platform name
function getHostPlatform() {
  const hostname = os.hostname();
  if (hostname.length === 12) return "replit";
  if (hostname.length === 36) return "heroku";
  if (hostname.length === 8) return "koyeb";
  return hostname;
}

// Alive command execution
cmd(commandDetails, async (client, message, args, context) => {
  try {
    const { from, prefix, reply, pushname } = context;

    // Fetch data
    const aliveData = await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/textdata.js");
    const details = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/textdata.js")).data;

    // Message content
    const messageContent = {
      caption: `💖 Hi ${pushname}, I'm alive now\n\n` +
        `*📟Version:* ${aliveData.VERSION}\n` +
        `*⚙️Runtime:* ${runtime(process.uptime())}\n` +
        `*☘️RAM:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB\n` +
        `*🔖Platform:* ${getHostPlatform()}\n\n${aliveData.ALIVE_NEWS}`,
      image: { url: details.mainimg },
      footer: details.footer,
      buttonText: "🔢 Reply below number",
      sections: [
        {
          title: '',
          rows: [
            { title: "1", rowId: prefix + "menu", description: "COMMANDS MENU" },
            { title: "2", rowId: prefix + "ping", description: "MALAKA-MD SPEED" }
          ]
        }
      ]
    };

    // Send audio response
    await client.sendMessage(from, {
      audio: { url: "https://github.com/MALAKA-MD-VPI/MALAKA-MD-db/blob/main/autovoice/malaka-md.mp3" },
      mimetype: "audio/mp4",
      ptt: true
    }, { quoted: message });

    // Send alive response
    await client.replyList(from, messageContent, { quoted: message });

  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

const commandrepo = {
  pattern: "repo",
  alias: ["sc"],
  desc: "bot repo sc",
  react: "🤖",
  category: "main",
  use: ".repo",
  filename: __filename
};

cmd(commandrepo, async ( botInstance,message,chat,{from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
    reply
  }
) => {
  try {
    const response = await axios.get(
      "https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json"
    );
    const repoDetails = response.data;
    let imageUrl = repoDetails.imageurl;
    let repoUrl = repoDetails.repoo;
    let repoMessage = `
*╭═══════════════⚆*
 │◈ OWNER NUMBER: 94704243771
 │◈  
 │◈ MALAKA-MD repo: ${repoUrl}
 │◈
 │◈ BOT UPDATE NEWS: https://chat.whatsapp.com/KOMw1bDPrbO4xp4X680MB9
 │◈ 
*╰═══════════════⚆*

*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*
`;

    const imageMessage = {
      url: imageUrl
    };
    const forwardedInfo = {
      newsletterJid: "120363382823666763@newsletter",
      newsletterName: "ᴍᴀʟᴀᴋᴀ-ᴍᴅ",
      serverMessageId: 999
    };
    const contextInfo = {
      mentionedJid: [chat.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: forwardedInfo
    };
    const messageContent = {
      image: imageMessage,
      caption: repoMessage,
      contextInfo: contextInfo
    };
    await botInstance.sendMessage(from, messageContent, { quoted: message });
  } catch (error) {
    const errorResponse = await fetchJson(
      "https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json"
    );
    const errorReaction = {
      text: "❌",
      key: message.key
    };
    const reactMessage = {
      react: errorReaction
    };
    await botInstance.sendMessage(from, reactMessage);
    console.log(error);
    reply(errorResponse.replyMsg.erro);
  }
});

const updateCommand = {
  pattern: "update",
  alias: ["restart"],
  desc: "Restart the bot",
  category: "owner",
  use: ".update",
  react: "🚀",
  filename: __filename
};
cmd(updateCommand, async (bot, message, args, extra) => {
  try {
    const { isOwner, reply } = extra;
    if (!isOwner) {
      return reply("Only the owner can use this command.");
    }
    const { exec } = require("child_process");
    await bot.sendMessage(extra.from, { text: "*Updating...*" }, { quoted: message });
    await bot.sendMessage(extra.from, { text: "*Update Done ✔*" }, { quoted: message });
    await sleep(1500);
    exec("pm2 restart all");
  } catch (error) {
    console.log(error);
    reply("" + error);
  }
});

const removebg = {
  pattern: "removebg",
  react: '🔥',
  alias: ['rb'],
  category: "convert",
  use: ".removebg <reply image>",
  filename: __filename
};

const fs = require("fs");
const FormData = require("form-data");
const fileType = require("file-type");
const REMOVE_BG_API_KEY = "3mcsqp5dYbYEGDPnxCK3wghc";



cmd(removebg, async (sock, message, m, { from, reply, quoted }) => {
  try {
    const isViewOnce = m.quoted ? m.quoted.type === "viewOnceMessage" : false;
    const isImage = m.quoted 
      ? m.quoted.type === "imageMessage" || (isViewOnce ? m.quoted.msg.type === "imageMessage" : false) 
      : false;

    if (m.type === "imageMessage" || isImage) {
      const randomFile = `temp_${Date.now()}`;
      const downloaded = isImage ? await m.quoted.download() : await m.download();
      const fileTypeData = await fileType.fromBuffer(downloaded);

      if (!fileTypeData || (fileTypeData.ext !== "jpg" && fileTypeData.ext !== "png")) {
        return reply("⚠️ Only JPG or PNG images are supported!");
      }

      const imagePath = `./${randomFile}.${fileTypeData.ext}`;
      await fs.promises.writeFile(imagePath, downloaded);

      const formData = new FormData();
      formData.append("image_file", fs.createReadStream(imagePath));
      formData.append("size", "auto");

      const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          ...formData.getHeaders()
        },
        responseType: "arraybuffer"
      });

      if (response.status !== 200) {
        return reply("❌ Failed to remove background.");
      }

      await sock.sendMessage(from, {
        image: response.data,
        caption: "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ GALAXY MD"
      }, { quoted: message });

     await fs.promises.unlink(imagePath);
    } else {
      reply("⚠️ Please reply to an image message.");
    }
  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing the image.");
  }
});
