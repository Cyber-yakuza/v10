const axios = require("axios");
const { fetchJson, getBuffer, getimage } = require("../lib/functions");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const cheerio = require("cheerio");
const { igdl, fbdl } = require("ruhend-scraper");
const { cmd, commands } = require("../lib/command");
const { File } = require("megajs");
var { subsearch, subdl } = require("@sl-code-lords/si-subdl");
const { facebook } = require("@mrnima/facebook-downloader");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { parseStringPromise } = require("xml2js");

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

ffmpeg.setFfmpegPath(ffmpegPath);

async function videoToWebp(videoBuffer) {
  const webpFilePath = path.join(tmpdir(), Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp");
  const mp4FilePath = path.join(tmpdir(), Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".mp4");
  
  fs.writeFileSync(mp4FilePath, videoBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(mp4FilePath)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", "libwebp", 
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse", 
        "-loop", "0", 
        "-ss", "00:00:00", 
        "-t", "00:00:05", 
        "-preset", "default", 
        "-an", 
        "-vsync", "0"
      ])
      .toFormat("webp")
      .save(webpFilePath);
  });

  const webpBuffer = fs.readFileSync(webpFilePath);
  fs.unlinkSync(webpFilePath);
  fs.unlinkSync(mp4FilePath);
  
  return webpBuffer;
}

let baseUrl;

(async () => {
  try {
    let data = await fetchJson("https://gitlab.com/anukunu2000/asitha-md-db/-/raw/master/pire.json");
    baseUrl = data.api;
  } catch (error) {
    console.error("Error fetching base URL:", error);
  }
})();

async function getPremiumUsers() {
  const data = await fetchJson("https://gitlab.com/anukunu2000/asitha-md-db/-/raw/master/Premium/premium.json");
  const users = data.split(",");
  return users.map(user => user.replace(/[^0-9]/g, '') + "@s.whatsapp.net");
}

if (require("../package.json").version == "2.0.0") {
  console.log("decrypt karanna EPA pko");
}

//=====================================
const tiktokCommand = {
  pattern: "tiktok",
  alias: ["ttdl", "tt"],
  react: "🏷️",
  desc: "Download TikTok videos",
  category: "download",
  use: ".tiktok <Tiktok link>",
  filename: __filename
};

cmd(tiktokCommand, async (client, message, args, { from: chatId,l: logger,prefix: commandPrefix,quoted: quotedMessage,body: messageBody,isCmd: isCommand,command: commandName,args: commandArgs,q: query,isGroup: isGroupChat,sender: senderInfo,senderNumber: senderPhoneNumber,botNumber2: botSecondaryNumber,botNumber: botPrimaryNumber,pushname: senderName,isMe: isBot,isOwner: isOwner,groupMetadata: groupInfo,groupName: groupName,participants: groupParticipants,groupAdmins: groupAdmins,isBotAdmins: isBotAdmin,isAdmins: isAdmin,
  reply: replyFunction
}) => {
  try {
    // Check if the query includes a TikTok link
    if (!query.includes("tiktok.com")) {
      return await replyFunction("Please provide a valid TikTok link.");
    }

    // Fetch TikTok video details from an external API
    const tiktokData = await fetchJson(`https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=${query}`);
    let responseMessage = `*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*\n\n*TIKTOK DOWNLOADER*\n\n*📃 Title:* ${tiktokData.result.title}\n*✍🏼 Link:* ${query}`;

    // Non-button mode: Provide download options as a list
    const withoutWatermarkSection = {
      title: "*[1] Tiktok Video*",
      rows: [
        {
          title: " 1",
          rowId: `${commandPrefix}tnd ${query}`,
          description: "🎟️ No-Watermark"
        },
        {
          title: " 2",
          rowId: `${commandPrefix}ttw ${query}`,
          description: "🎫 No-Watermark-HD"
        }
      ]
    };

    const withWatermarkSection = {
      title: "*[2] Tiktok video note*",
      rows: [
        {
          title: " 3",
          rowId: `${commandPrefix}tnds ${query}`,
          description: "🎟️ No-Watermark"
        },
        {
          title: " 4",
          rowId: `${commandPrefix}ttws ${query}`,
          description: "🎫 No-Watermark-HD"
        }
      ]
    };

    const audioSection = {
      title: "*[3] Tiktok Audio*",
      rows: [
        {
          title: "  5",
          rowId: `${commandPrefix}ta ${query}`,
          description: "🎶 Audio file"
        },
        {
          title: "  6",
          rowId: `${commandPrefix}td ${query}`,
          description: "📁 document file"
        }
      ]
    };

    const sections = [withoutWatermarkSection, withWatermarkSection, audioSection];
    const thumbnail = { url: tiktokData.result.thumbnail };
    const listMessage = {
      image: thumbnail,
      caption: responseMessage,
      title: '',
      buttonText: "*🔢 Reply below number*",
      footer: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*",
      sections: sections
    };

    return await client.replyList(chatId, listMessage);
  } catch (error) {
    await replyFunction("*ERROR !!*");
    logger(error);
  }
});
  
const Commandttw = {
  pattern: "ttw",
  react: '⬇',
  filename: __filename
};

cmd(Commandttw, async (bot, message, context, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber,
  pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    const tiktokResponse = await fetchJson("https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=" + q);
    
    const reactDown = { text: '⬆', key: message.key };
    const reactionDown = { react: reactDown };
    await bot.sendMessage(from, reactionDown);
    
    const videoUrl = { url: tiktokResponse.result.nowm };
    const videoMessage = {
      video: videoUrl,
      mimetype: "video/mp4",
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    };
    
    const quotedMessage = { quoted: message };
    await bot.sendMessage(from, videoMessage, quotedMessage);
    
    const reactSuccess = { text: '✔', key: message.key };
    const reactionSuccess = { react: reactSuccess };
    await bot.sendMessage(from, reactionSuccess);
    
  } catch (error) {
    const reactError = { text: '❌', key: message.key };
    const reactionError = { react: reactError };
    await bot.sendMessage(from, reactionError);
    
    console.log(error);
    reply("Error !!\n\n*" + error + '*');
  }
});

const Commandttws = {
  pattern: "ttws",
  react: '⬇',
  filename: __filename
};

cmd(Commandttws, async (bot, message, context, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber,
  pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    const tiktokResponse = await fetchJson("https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=" + q);
    
    const reactDown = { text: '⬆', key: message.key };
    const reactionDown = { react: reactDown };
    await bot.sendMessage(from, reactionDown);
    
    const videoUrl = { url: tiktokResponse.result.nowm };
    const videoMessage = {
      video: videoUrl,
      mimetype: "video/mp4",
      ptv:true,
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    };
    
    const quotedMessage = { quoted: message };
    await bot.sendMessage(from, videoMessage, quotedMessage);
    
    const reactSuccess = { text: '✔', key: message.key };
    const reactionSuccess = { react: reactSuccess };
    await bot.sendMessage(from, reactionSuccess);
    
  } catch (error) {
    const reactError = { text: '❌', key: message.key };
    const reactionError = { react: reactError };
    await bot.sendMessage(from, reactionError);
    
    console.log(error);
    reply("Error !!\n\n*" + error + '*');
  }
});

const commandtnd = {
  pattern: "tnd",
  react: '⬇',
  filename: __filename
};

cmd(commandtnd, async (client, message, metadata, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender,
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata,
  groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    // Fetching video details using the URL from the message
    const videoData = await fetchJson("https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=" + q);
    
    // Sending reaction to indicate processing
    const reaction = {
      text: '⬆',
      key: message.key
    };
    await client.sendMessage(from, { react: reaction });

    // Prepare the video message to send
    const videoMessage = {
      url: videoData.result.watermark
    };
    const videoOptions = {
      video: videoMessage,
      mimetype: "video/mp4",
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    };
    const quotedMessage = {
      quoted: message
    };
    
    // Send the video
    await client.sendMessage(from, videoOptions, quotedMessage);

    // Sending success reaction
    const successReaction = {
      text: '✔',
      key: message.key
    };
    await client.sendMessage(from, { react: successReaction });

  } catch (error) {
    // If there's an error, send a failure reaction
    const errorReaction = {
      text: '❌',
      key: message.key
    };
    await client.sendMessage(from, { react: errorReaction });

    // Log the error and notify user
    console.log(error);
    reply("Error !!\n\n*" + error + '*');
  }
});

const commandtnds = {
  pattern: "tnds",
  react: '⬇',
  filename: __filename
};

cmd(commandtnds, async (client, message, metadata, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender,
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata,
  groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    // Fetching video details using the URL from the message
    const videoData = await fetchJson("https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=" + q);
    
    // Sending reaction to indicate processing
    const reaction = {
      text: '⬆',
      key: message.key
    };
    await client.sendMessage(from, { react: reaction });

    // Prepare the video message to send
    const videoMessage = {
      url: videoData.result.watermark
    };
    const videoOptions = {
      video: videoMessage,
      mimetype: "video/mp4",
      ptv:true,
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    };
    const quotedMessage = {
      quoted: message
    };
    
    // Send the video
    await client.sendMessage(from, videoOptions, quotedMessage);

    // Sending success reaction
    const successReaction = {
      text: '✔',
      key: message.key
    };
    await client.sendMessage(from, { react: successReaction });

  } catch (error) {
    // If there's an error, send a failure reaction
    const errorReaction = {
      text: '❌',
      key: message.key
    };
    await client.sendMessage(from, { react: errorReaction });

    // Log the error and notify user
    console.log(error);
    reply("Error !!\n\n*" + error + '*');
  }
});

const commandta = {
  pattern: 'ta',
  react: '⬇',
  filename: __filename
};

cmd(commandta, async (bot, message, extra, { from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    // Fetch TikTok audio using API
    const response = await fetchJson(`https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=${q}`);
    // React with '⬆' to indicate download started
    const reactDownload = {
      text: '⬆',
      key: message.key
    };
    await bot.sendMessage(from, { react: reactDownload });

    // Send the audio file
    const audioMessage = {
      audio: { url: response.result.audio },
      mimetype: "audio/mpeg"
    };
    await bot.sendMessage(from, audioMessage, { quoted: message });

    // React with '✔' to indicate success
    const reactSuccess = {
      text: '✔',
      key: message.key
    };
    await bot.sendMessage(from, { react: reactSuccess });

  } catch (error) {
    // React with '❌' on error
    const reactError = {
      text: '❌',
      key: message.key
    };
    await bot.sendMessage(from, { react: reactError });

    console.log(error);
    reply(`Error !!\n\n*${error}*`);
  }
});

const commandtd = {
  pattern: 'td',
  react: '⬇',
  filename: __filename
};

cmd(commandtd, async (client, message, metadata, { from: senderId,quoted: quotedMessage,body: messageBody,isCmd: isCommand,command: commandName,args: arguments,q: url,isGroup: isGroupChat,sender: senderName,senderNumber: senderPhoneNumber,botNumber2: botNumberAlt,botNumber: botPhoneNumber,pushname: senderNickname,isMe: isSenderMe,isOwner: isOwner,groupMetadata: groupData,groupName: groupName,participants: groupParticipants,groupAdmins: groupAdmins,isBotAdmins: isBotAdmin,isAdmins: isAdmin,
  reply: replyFunction
}) => {
  try {
    // Fetching data from a URL based on the message
    const response = await fetchJson("https://malaka-md-api-bot.vercel.app/download/tiktokdl?url=" + url);

    const reaction = {
      text: '⬆',
      key: message.key
    };

    const reactionData = {
      react: reaction
    };

    // Sending a reaction (⬆) to the sender
    await client.sendMessage(senderId, reactionData);

    const audioData = {
      url: response.result.audio
    };

    const audioFile = {
      document: audioData,
      mimetype: "audio/mpeg",
      fileName: response.result.title + ".mp3",
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    };

    // Sending the audio file as a response
    const quotedData = {
      quoted: message
    };

    await client.sendMessage(senderId, audioFile, quotedData);

    const successReaction = {
      text: '✔',
      key: message.key
    };

    const successReactionData = {
      react: successReaction
    };

    // Sending a success reaction (✔) to the sender
    await client.sendMessage(senderId, successReactionData);

  } catch (error) {
    const errorReaction = {
      text: '❌',
      key: message.key
    };

    const errorReactionData = {
      react: errorReaction
    };

    // Sending an error reaction (❌) to the sender
    await client.sendMessage(senderId, errorReactionData);

    console.log(error);

    // Sending error message to the sender
    replyFunction("Error !!\n\n*" + error + '*');
  }
});


const fbDownloaderCommand = {
  pattern: "fb",
  alias: ["facebook"],
  desc: "Download Facebook videos",
  use: ".fb <Link>",
  category: "download",
  filename: __filename
};

cmd(fbDownloaderCommand, async (client, message, args, { from,l,prefix,quoted,body,isCmd,command,args: commandArgs,q: query,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    if (!query || !query.startsWith("https://")) {
      return client.sendMessage(from, { text: "*❌ Please provide a valid URL.*" }, { quoted: message });
    }

    let fbData = await fbdl(query);
    let videoData = fbData.data;

    let hdVideo = videoData.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoData.find(video => video.resolution === "360p (SD)");
    let thumbnailImage = videoData.find(video => video.resolution === "360p (SD)");

    await client.sendMessage(from, { react: { text: "🎥", key: message.key } });

    const details = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let footerText = details.footer;

    const sections = [{
      title: '*[1] facebook Video*',
      rows: [
        { title: "1", rowId: prefix + "fbhd " + query, description: "🔋 `HD` QUALITY" },
        { title: "2", rowId: prefix + "fbsd " + query, description: "🪫 `SD` QUALITY" }
      ]
      },
      {
      title: "*[2] facebook video note*",
        rows: [
          { title: "3", rowId: prefix + "fbhds " + query, description: "🔋 `HD` QUALITY" },
          { title: "4", rowId: prefix + "fbsds " + query, description: "🪫 `SD` QUALITY" }
      ]
      },
      {
      title: "*[3] facebook Audio*",
        rows: [
          { title: "5", rowId: prefix + "fba " + query, description: "🎶 Audio file" },
          { title: "6", rowId: prefix + "fbas " + query, description: "📁 document file" }
      ]
      }];
    
    const caption = `
\`◈ FB DOWNLOADER\`

⦁⦂⦁═════════════════●●►
╭──────────────❖
│⦁⦂⦁ ⏱️ \`TITLE\` : 
│
│⦁⦂⦁ 🔗 \`URL\` : ${query}
╰──────────────❖

⦁⦂⦁═════════════════●●►
`;

    const listMessage = {
      caption: caption,
      image: { url: thumbnailImage.thumbnail },
      footer: footerText,
      title: '',
      buttonText: "*🔢 Reply below number*",
      sections: sections
    };
    
    return await client.replyList(from, listMessage, { quoted: message });

  } catch (error) {
    reply("*ERROR !!*");
    l(error);
  }
});
    
const commandfbsd = {
  pattern: "fbsd",
  react: "⬇",
  filename: __filename
};

cmd(commandfbsd, async (
  bot, message, extra, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2,
    botNumber, pushname, isMe, isOwner, groupMetadata,
    groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply
  }
) => {
  try {
    // Fetching JSON data from GitLab
    const fetchResponse = await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json");
    const replyMsg = fetchResponse.replyMsg;

    // Check if the message has a URL
    if (!q) {
      return reply(replyMsg.url);
    }
    if (!q.includes("https://")) {
      return await reply(replyMsg.not_fo);
    }

    // Download video using the fbdl function
    let videoData = await fbdl(q);
    let videoList = videoData.data;

    // Select 720p or 360p version
    let hdVideo = videoList.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoList.find(video => video.resolution === "360p (SD)");

    // React with "⬆"
    await bot.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send the 360p video
    await bot.sendMessage(from, {
      video: { url: sdVideo.url },
      mimetype: "video/mp4",
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    }, { quoted: message });

    // React with "✔"
    await bot.sendMessage(from, { react: { text: "✔", key: message.key } });
  } catch (error) {
    // React with "❌" and log the error
    await bot.sendMessage(from, { react: { text: "❌", key: message.key } });
    console.log(error);
    reply("Error !!\n\n*" + error + "*");
  }
});

const commandfbhd = {
  pattern: "fbhd",
  react: "⬇",
  filename: __filename
};

cmd(commandfbhd, async (client, message, chat, { from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    // Fetch the reply message JSON file from GitLab
    const response = await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json");
    const replyMsg = response.replyMsg;

    // Check if the user provided a URL
    if (!q) {
      return reply(replyMsg.url);
    }

    // Check if the URL contains "https://"
    if (!q.includes("https://")) {
      return await reply(replyMsg.not_fo);
    }

    // Fetch the Facebook video download data
    let videoData = await fbdl(q);
    let videoList = videoData.data;

    // Find video resolutions
    let hdVideo = videoList.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoList.find(video => video.resolution === "360p (SD)");

    // Sending reaction "⬆" to indicate processing
    await client.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send the HD video if available, otherwise fallback to SD
    const videoToSend = hdVideo || sdVideo;
    if (videoToSend) {
      await client.sendMessage(from, {
        video: { url: videoToSend.url },
        mimetype: "video/mp4",
        caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
      }, { quoted: message });
      
      // Send reaction "✔" for success
      await client.sendMessage(from, { react: { text: "✔", key: message.key } });
    } else {
      throw new Error("No downloadable video found.");
    }
  } catch (error) {
    // Send reaction "❌" in case of an error
    await client.sendMessage(from, { react: { text: "❌", key: message.key } });
    console.log(error);
    reply(`Error !!\n\n*${error}*`);
  }
});

const commandfba = {
  pattern: "fba",
  react: "⬇",
  filename: __filename
};

cmd(commandfba, async (bot, message, options, { from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    // Fetch reply messages from an external JSON file
    const replyMessages = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    
    // Check if user provided a query
    if (!q) {
      return reply(replyMessages.url);
    }

    // Validate URL format
    if (!q.includes("https://")) {
      return await reply(replyMessages.not_fo);
    }

    // Fetch Facebook video download links
    let fbDownloadData = await fbdl(q);
    let videoData = fbDownloadData.data;

    // Find available resolutions
    let hdVideo = videoData.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoData.find(video => video.resolution === "360p (SD)");

    // Send "⬆" (uploading) reaction
    await bot.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send audio extracted from the SD video
    await bot.sendMessage(from, { 
      audio: { url: sdVideo.url }, 
      mimetype: "audio/mpeg" 
    }, { quoted: message });

    // Send "✔" (success) reaction
    await bot.sendMessage(from, { react: { text: "✔", key: message.key } });

  } catch (error) {
    // Send "❌" (error) reaction
    await bot.sendMessage(from, { react: { text: "❌", key: message.key } });
    
    // Log the error and notify the user
    console.log(error);
    reply("Error !!\n\n*" + error + "*");
  }
});

const commandfbas = {
  pattern: "fbas",
  react: "⬇",
  filename: __filename
};

cmd(commandfbas, async (bot, message, options, { from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    // Fetch reply messages from an external JSON file
    const replyMessages = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    
    // Check if user provided a query
    if (!q) {
      return reply(replyMessages.url);
    }

    // Validate URL format
    if (!q.includes("https://")) {
      return await reply(replyMessages.not_fo);
    }

    // Fetch Facebook video download links
    let fbDownloadData = await fbdl(q);
    let videoData = fbDownloadData.data;

    // Find available resolutions
    let hdVideo = videoData.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoData.find(video => video.resolution === "360p (SD)");

    // Send "⬆" (uploading) reaction
    await bot.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send audio extracted from the SD video
    await bot.sendMessage(from, { 
      document: { url: sdVideo.url },
      audio: { url: sdVideo.url }, 
      fileName: "TikTok_Audio.mp3",
      mimetype: "audio/mpeg" 
    }, { quoted: message });

    // Send "✔" (success) reaction
    await bot.sendMessage(from, { react: { text: "✔", key: message.key } });

  } catch (error) {
    // Send "❌" (error) reaction
    await bot.sendMessage(from, { react: { text: "❌", key: message.key } });
    
    // Log the error and notify the user
    console.log(error);
    reply("Error !!\n\n*" + error + "*");
  }
});

const megadl = {
  pattern: "mega",
  category: "download",
  react: '⬇️',
  use: ".mega <Link>",
  desc: "Download Mega file and send it."
};

cmd(megadl, async (bot, message, chatData, { from, q, reply }) => {
  try {
    if (!q || !q.includes("mega.nz")) return reply("Please provide a valid Mega.nz URL.");

    const [fileUrl, key] = q.split('#');
    if (!key) return reply("Error: Missing decryption key.");

    const megaFile = File.fromURL(`${fileUrl}#${key}`);
    
    megaFile.on("progress", (downloaded, total) => {
      reply(`Downloading: ${((downloaded / total) * 100).toFixed(2)}% 
      (${(downloaded / 1048576).toFixed(2)}MB / ${(total / 1048576).toFixed(2)}MB)`);
    });

    const fileBuffer = await megaFile.downloadBuffer();
    await bot.sendMessage(from, { document: fileBuffer, mimetype: "application/octet-stream", caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*", fileName: "mega_file" }, { quoted: message });
  } catch (error) {
    console.error(error);
    reply("*ERROR..!*");
  }
});

const commandfbsds = {
  pattern: "fbsds",
  react: "⬇",
  filename: __filename
};

cmd(commandfbsds, async (
  bot, message, extra, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2,
    botNumber, pushname, isMe, isOwner, groupMetadata,
    groupName, participants, groupAdmins, isBotAdmins,
    isAdmins, reply
  }
) => {
  try {
    // Fetching JSON data from GitLab
    const fetchResponse = await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json");
    const replyMsg = fetchResponse.replyMsg;

    // Check if the message has a URL
    if (!q) {
      return reply(replyMsg.url);
    }
    if (!q.includes("https://")) {
      return await reply(replyMsg.not_fo);
    }

    // Download video using the fbdl function
    let videoData = await fbdl(q);
    let videoList = videoData.data;

    // Select 720p or 360p version
    let hdVideo = videoList.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoList.find(video => video.resolution === "360p (SD)");

    // React with "⬆"
    await bot.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send the 360p video
    await bot.sendMessage(from, {
      video: { url: sdVideo.url },
      mimetype: "video/mp4",
      ptv: true,
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
    }, { quoted: message });

    // React with "✔"
    await bot.sendMessage(from, { react: { text: "✔", key: message.key } });
  } catch (error) {
    // React with "❌" and log the error
    await bot.sendMessage(from, { react: { text: "❌", key: message.key } });
    console.log(error);
    reply("Error !!\n\n*" + error + "*");
  }
});

const commandfbhds = {
  pattern: "fbhds",
  react: "⬇",
  filename: __filename
};

cmd(commandfbhds, async (client, message, chat, { from,quoted,body,isCmd,command,args,q,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    // Fetch the reply message JSON file from GitLab
    const response = await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json");
    const replyMsg = response.replyMsg;

    // Check if the user provided a URL
    if (!q) {
      return reply(replyMsg.url);
    }

    // Check if the URL contains "https://"
    if (!q.includes("https://")) {
      return await reply(replyMsg.not_fo);
    }

    // Fetch the Facebook video download data
    let videoData = await fbdl(q);
    let videoList = videoData.data;

    // Find video resolutions
    let hdVideo = videoList.find(video => video.resolution === "720p (HD)");
    let sdVideo = videoList.find(video => video.resolution === "360p (SD)");

    // Sending reaction "⬆" to indicate processing
    await client.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send the HD video if available, otherwise fallback to SD
    const videoToSend = hdVideo || sdVideo;
    if (videoToSend) {
      await client.sendMessage(from, {
        video: { url: videoToSend.url },
        mimetype: "video/mp4",
        ptv: true,
        caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*"
      }, { quoted: message });
      
      // Send reaction "✔" for success
      await client.sendMessage(from, { react: { text: "✔", key: message.key } });
    } else {
      throw new Error("No downloadable video found.");
    }
  } catch (error) {
    // Send reaction "❌" in case of an error
    await client.sendMessage(from, { react: { text: "❌", key: message.key } });
    console.log(error);
    reply(`Error !!\n\n*${error}*`);
  }
});

//=====================================


async function xnxxs(_0x2087d9) {
  return new Promise((_0x5cad53, _0x161a92) => {
    fetch("https://www.xnxx.com/search/" + _0x2087d9 + '/' + (Math.floor(Math.random() * 3) + 1), {
      'method': "get"
    }).then(_0x16947a => _0x16947a.text()).then(_0x194235 => {
      const _0x3aaa62 = {
        xmlMode: false
      };
      const _0x309768 = cheerio.load(_0x194235, _0x3aaa62);
      const _0xdc5570 = [];
      const _0x322e33 = [];
      const _0x57cace = [];
      const _0x21559e = [];
      _0x309768("div.mozaique").each(function (_0x328c6d, _0x147ea0) {
        _0x309768(_0x147ea0).find("div.thumb").each(function (_0x9afcc, _0x549a25) {
          _0x322e33.push("https://www.xnxx.com" + _0x309768(_0x549a25).find('a').attr("href").replace("/THUMBNUM/", '/'));
        });
      });
      _0x309768("div.mozaique").each(function (_0x1f94c6, _0x352af4) {
        _0x309768(_0x352af4).find("div.thumb-under").each(function (_0x1e266d, _0x528344) {
          _0x57cace.push(_0x309768(_0x528344).find("p.metadata").text());
          _0x309768(_0x528344).find('a').each(function (_0x21da84, _0xe3ca28) {
            _0xdc5570.push(_0x309768(_0xe3ca28).attr("title"));
          });
        });
      });
      for (let _0x3bc4d4 = 0; _0x3bc4d4 < _0xdc5570.length; _0x3bc4d4++) {
        const _0x3a463c = {
          title: _0xdc5570[_0x3bc4d4],
          info: _0x57cace[_0x3bc4d4],
          link: _0x322e33[_0x3bc4d4]
        };
        _0x21559e.push(_0x3a463c);
      }
      const _0x26565c = {
        status: true,
        result: _0x21559e
      };
      _0x5cad53(_0x26565c);
    })["catch"](_0x34c7a6 => _0x161a92({
      'status': false,
      'result': _0x34c7a6
    }));
  });
}

async function xdl(_0x3b4ec2) {
  return new Promise((_0x2fd3c5, _0x4a7c34) => {
    fetch('' + _0x3b4ec2, {
      'method': "get"
    }).then(_0x2842c4 => _0x2842c4.text()).then(_0x282c21 => {
      const _0x132741 = {
        xmlMode: false
      };
      const _0x38698b = cheerio.load(_0x282c21, _0x132741);
      const _0x336fb1 = _0x38698b("meta[property=\"og:title\"]").attr("content");
      const _0x5ebebc = _0x38698b("meta[property=\"og:duration\"]").attr("content");
      const _0x496e92 = _0x38698b("meta[property=\"og:image\"]").attr("content");
      const _0xf9ce68 = _0x38698b("meta[property=\"og:video:type\"]").attr("content");
      const _0xa1dcb8 = _0x38698b("meta[property=\"og:video:width\"]").attr("content");
      const _0x3ffa71 = _0x38698b("meta[property=\"og:video:height\"]").attr("content");
      const _0x1d36f1 = _0x38698b("span.metadata").text();
      const _0x43f894 = _0x38698b("#video-player-bg > script:nth-child(6)").html();
      const _0x5acef2 = {
        'low': (_0x43f894.match("html5player.setVideoUrlLow\\('(.*?)'\\);") || [])[1],
        'high': _0x43f894.match("html5player.setVideoUrlHigh\\('(.*?)'\\);" || [])[1],
        'HLS': _0x43f894.match("html5player.setVideoHLS\\('(.*?)'\\);" || [])[1],
        'thumb': _0x43f894.match("html5player.setThumbUrl\\('(.*?)'\\);" || [])[1],
        'thumb69': _0x43f894.match("html5player.setThumbUrl169\\('(.*?)'\\);" || [])[1],
        'thumbSlide': _0x43f894.match("html5player.setThumbSlide\\('(.*?)'\\);" || [])[1],
        'thumbSlideBig': _0x43f894.match("html5player.setThumbSlideBig\\('(.*?)'\\);" || [])[1]
      };
      const _0x1e65cf = {
        title: _0x336fb1,
        URL: _0x3b4ec2,
        duration: _0x5ebebc,
        image: _0x496e92,
        videoType: _0xf9ce68,
        videoWidth: _0xa1dcb8,
        videoHeight: _0x3ffa71,
        info: _0x1d36f1,
        files: _0x5acef2
      };
      const _0x56095f = {
        status: true,
        result: _0x1e65cf
      };
      _0x2fd3c5(_0x56095f);
    })["catch"](_0x137e70 => _0x4a7c34({
      'status': false,
      'result': _0x137e70
    }));
  });
}

const xnxxCommand = {
  pattern: "xnxxdown",
  react: '🔞',
  alias: ["xnxxsearch"],
  desc: "Search and get details from xnxx.",
  category: "download",
  use: ".xnxxdown <query>",
  filename: __filename
};

cmd(xnxxCommand, async (bot, message, args, { from, q, prefix, sender, reply }) => {
  try {
    if (!q) {
      return reply("Please provide a search term!");
    }

    const searchResults = await xnxxs(q);
    const topResults = searchResults.result.slice(0, 5);

    if (!topResults.length) {
      return reply("No results found.");
    }

    let resultList = [];
    for (let i = 0; i < searchResults.result.length; i++) {
      resultList.push({
        'title': i + 1,
        'description': searchResults.result[i].title + " \n",
        'rowId': prefix + "xnxxdl " + searchResults.result[i].link
      });
    }

    const sections = [{
      //'title': "*[Result from xnxx.com]*\n",
      'rows': resultList
    }];

    const responseMessage = {
      caption: `*🔞 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️ XNXX DOWNLOADER 🔞*`,
      image: { url: 'https://i.ibb.co/Y71b1hGn/image-1741571429452.jpg' }, 
      footer: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*",
      title: '',
      buttonText: "*🔢 Reply below number*\n",
      sections: sections
    };

    const options = {
      quoted: message
    };

    return await bot.replyList(from, responseMessage, options);
  } catch (error) {
    console.log(error);
    reply("*ERROR !!*");
  }
});

const xnxxdlcommand = {
  pattern: "xnxxdl",
  alias: ["dlxnxx"],
  react: '🔞',
  desc: "Download xnxx videos",
  use: ".xnxxdown <xnxx link>",
  filename: __filename
};

cmd(xnxxdlcommand, async (bot, message, args, { from, quoted, q: query, reply }) => {
  try {
    if (!query) {
      return reply("*Please give me a URL !!*");
    }

    let videoData = await xdl(query);
    let videoTitle = videoData.result.title;

    const videoUrl = { url: videoData.result.files.high };
    const messageContent = {
      video: videoUrl,
      caption: `${videoTitle}\n\n*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*`
    };

    await bot.sendMessage(from, messageContent, { quoted: message });

  } catch (error) {
    reply("*Error..!*");
    console.log(error);
  }
});
