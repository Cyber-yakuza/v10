const config = require("../settings");
const {
  default: makeWASocket,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} = require("@whiskeysockets/baileys");
const { cmd, commands } = require("../lib/command");
const { ytmp33, ytmp3y, ytmp44, ytmp444, ytmp32, scrapeSite, ddownr } = require("../lib/scrap");
const { ytmp3 } = require("../lib/ytdl");
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const yts = require("yt-search");
const fg = require("api-dylux");
const request = require("request");
const cheerio = require("cheerio");
const axios = require("axios");

// Function for downloading SoundCloud audio
let soundcloud = async (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://www.klickaud.co/download.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      formData: {
        value: url,
        "2311a6d881b099dc3820600739d52e64a1e6dcfe55097b5c7c649088c4e50c37": "710c08f2ba36bd969d1cbc68f59797421fcf90ca7cd398f78d67dfd8c3e554e3"
      }
    };

    request(options, (error, response, body) => {
      if (error) {
        return reject(new Error(error));
      }
      const $ = cheerio.load(body);
      resolve({
        title: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(2)").text(),
        download_count: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(3)").text(),
        thumb: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(1) > img").attr("src"),
        link: $("#dlMP3").attr("onclick").split("downloadFile('")[1].split("',")[0]
      });
    });
  });
};

// Function to search SoundCloud for tracks
async function ssearch(query) {
  let response = await axios.get(`https://m.soundcloud.com/search?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const $ = cheerio.load(response.data);
  let tracks = [];
  $("div > ul > li > div").each(function () {
    let title = $(this).find('a').attr("aria-label");
    let url = "https://m.soundcloud.com" + $(this).find('a').attr("href");
    let thumb = $(this).find("a > div > div > div > picture > img").attr("src");
    let artist = $(this).find("a > div > div > div").eq(1).text();
    let release = $(this).find("a > div > div > div > div > div").eq(2).text();
    let timestamp = $(this).find("a > div > div > div > div > div").eq(1).text();
    tracks.push({ title, url, thumb, artist, release, timestamp });
  });
  return { status: response.status, creator: "Caliph", result: tracks };
}

// Function to check if the URL is a YouTube link
function ytreg(url) {
  const youtubeRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
  return youtubeRegex.test(url);
}

// Function to extract YouTube video ID from a URL
function extractYouTubeId(url) {
  const youtubeIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeIdRegex);
  return match ? match[1] : null;
}

// Function to convert YouTube link
function convertYouTubeLink(url) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
}

// Command for YouTube to MP3
const { getBuffer, getGroupAdmins, getRandom, getimage, h2k, isUrl, Json, runtime, sleep, fetchJson } = require("../lib/functions");
//const fetchJson = require("node-fetch");
const util = require("util");

function formatNumber(number) {
  return String(number).padStart(2, "0");
}

if (require("../package.json").version == "2.0.0") {
  console.log("decrypt karanna EPA pko");
}

const commandevl = {
  pattern: "evl",
  react: "🌠",
  category: "owner",
  use: ".ev",
  filename: __filename
};

cmd(commandevl, async (message, _from, _quoted, { 
  from, quoted, body, isCmd, command, args, q, 
  isGroup, sender, senderNumber, botNumber2, botNumber, 
  pushname, isMe, isOwner, groupMetadata, groupName, 
  participants, groupAdmins, isBotAdmins, isAdmins, 
  reply }) => {
  try {
    if (!isOwner) {
      return await reply("🚩 *You must be a bot's owner first*");
    }

    let evaluatedExpression = q.replace("°", ".toString()");
    let result = await eval(evaluatedExpression);

    if (typeof result === "object") {
      reply(util.format(result));
    } else {
      reply(util.format(result));
    }
  } catch (error) {
    reply(util.format(error));
  }
});

function extractYouTubeId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function convertYouTubeLink(url) {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return "https://www.youtube.com/watch?v=" + videoId;
  }
  return url;
}

const songCommand = {
  pattern: "song",
  desc: "To download songs.",
  react: "🎵",
  use: ".song < Text or Link >",
  category: "download",
  filename: __filename
};

cmd(songCommand, async (botInstance, message, metadata, context) => {
  try {
    const replyMessages = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    
    if (!context.q) {
      return context.reply(replyMessages.giveme);
    }

    context.q = convertYouTubeLink(context.q);
    const searchResults = await yts(context.q);
    const video = searchResults.videos[0];
    const videoUrl = video.url;

    const details = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    const footerMessage = details.footer;
    
    const options = [
      {
        title: '',
        rows: [
          { title: "1", rowId: context.prefix + "ytmp3 " + videoUrl, description: "Audio File 🎶" },
          { title: "2", rowId: context.prefix + "ytaa " + videoUrl, description: "Audio File 🎶" },
          { title: "3", rowId: context.prefix + "ytmp30 " + videoUrl, description: "Audio File 🎶" },
          { title: "4", rowId: context.prefix + "play8 " + videoUrl, description: "Audio File 🎶" },
          { title: "5", rowId: context.prefix + "mp3 " + videoUrl, description: "Audio File 🎶" },
          { title: "6", rowId: context.prefix + "ytdoc " + videoUrl, description: "Document File 📂" }
        ]
      }
    ];

    const messageContent = `
  > *🥷𝗔𝗨𝗗𝗜𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥📥*

  ⦁⦂⦁═════════════════⦁⦂⦁
  ╭═════════════════⦁⦂⦁
  │ 📝 𝗧𝗜𝗧𝗟𝗘 : ${video.title}
  │
  │ 📃 𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡 : ${video.timestamp}
  │
  │ 📉 𝗥𝗘𝗟𝗘𝗔𝗦𝗘 : ${video.ago}
  │
  │ 📊 𝗩𝗜𝗘𝗪𝗦 : ${video.views}
  │
  │ 🔗 𝗟𝗜𝗡𝗞 : ${video.url}
  │
  ╰═════════════════⦁⦂⦁
      
  ⦁⦂⦁═════════════════⦁⦂⦁

> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
    `;

    const imageData = { url: video.image };
    const buttons = {
      caption: messageContent,
      image: imageData,
      footer: footerMessage,
      title: '',
      buttonText: "*🔢 Reply below number*",
      sections: options
    };

    const quotedMessage = { quoted: message };
    return await botInstance.replyList(context.from, buttons, quotedMessage);
  } catch (error) {
    context.reply("*ERROR !!*");
    console.error(error);
  }
});

const Commandvideo = {
  pattern: "video",
  description: "To download videos.",
  react: "🎥",
  usage: ".video < Text or Link >",
  category: "download",
  use: ".video < Text or Link >",
  filename: __filename
};

cmd(Commandvideo, async (client, message, fromUser, {
  prefix, from, quoted, body, isCommand, command, args, q, isGroup, sender,
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata,
  groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    const replyMessage = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    if (!q) {
      return reply(replyMessage.giveme);
    }
    q = convertYouTubeLink(q);
    const searchResults = await yts(q);
    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;
    const videoDetails = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let footerMessage = videoDetails.footer;

    const sections = [{
      title: "*`[1] Video File`* ",
      rows: [{
        title: "   1.1",
        rowId: prefix + "ytmp4 " + videoUrl + " & 360",
        description: "`360` File "
      }, {
        title: "   1.2",
        rowId: prefix + "ytmp4 " + videoUrl + " & 480",
        description: "`480` File "
      }, {
        title: "   1.3",
        rowId: prefix + "ytmp4 " + videoUrl + " & 720",
        description: "`720` File "
      }, {
        title: "   1.4",
        rowId: prefix + "ytmp4 " + videoUrl + " & 1080",
        description: "`1080` File "
      }]
    }, {
      title: "*`[2] Document File`* ",
      rows: [{
        title: "   2.1",
        rowId: prefix + "ytvdoc " + videoUrl + " & 360",
        description: "`360` File "
      }, {
        title: "   2.2",
        rowId: prefix + "ytvdoc " + videoUrl + " & 480",
        description: "`480` File "
      }, {
        title: "   2.3",
        rowId: prefix + "ytvdoc " + videoUrl + " & 720",
        description: "`720` File "
      }, {
        title: "   2.4",
        rowId: prefix + "ytvdoc " + videoUrl + " & 1080",
        description: "`1080` File "
      }]
    }];
    
    let messageText = `
╭──────────────⦁⦂⦁
 │🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀
 ╰──────────────⦁⦂⦁
`;
    const image = {
      url: firstVideo.thumbnail
    };

    const replyContent = {
      caption: messageText,
      image,
      footer: footerMessage,
      title: '',
      buttonText: "*🔢 Reply below number*",
      sections
    };

    const quotedMessage = {
      quoted: message
    };

    return await client.replyList(from, replyContent, quotedMessage);
  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

async function getDownloadUrl(url, quality) {
  let attempt = 0;
  while (attempt < 5) {
    attempt++;
    console.log("Retrying... Attempt " + attempt);
    try {
      const download = await ddownr.download(url, quality);
      const downloadUrl = download.downloadUrl;
      if (downloadUrl) {
        return downloadUrl;
      }
    } catch (error) {
      console.error("Attempt " + attempt + " failed: " + error.message);
    }
  }
  throw new Error("Failed to get download URL after 5 attempts.");
}

function obfuscateValue(index, offset) {
  const values = getObfuscatedValues();
  obfuscateValue = function (index, offset) {
    index = index - 392;
    return values[index];
  };
  return obfuscateValue(index, offset);
}

async function getGiftDownloadUrl(url) {
  try {
    let response = await fetchJson("https://api.giftedtech.my.id/api/download/dlmp3?apikey=gifted&quality=128&url=" + url + "?feature=shared");
    const result = {
      status: true,
      createdBy: "asitha",
      downloadLink: response.result.download_url
    };
    return result;
  } catch (error) {
    return;
  }
}
    
const Commandytmp3 = {
  pattern: "ytmp3",
  react: "⬇",
  dontAddCommandList: false,
  filename: __filename
};

cmd(Commandytmp3, async (bot, message, user, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    const replyMsg = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    
    if (!q) {
      return reply(replyMsg.url);
    }

    if (!q.includes("https://youtube.com/watch?v=")) {
      return await reply(replyMsg.not_fo);
    }

    let downloadUrl = await getDownloadUrl(q, "mp3");
    const reactUp = {
      text: "⬆",
      key: message.key
    };
    const react = { react: reactUp };
    await bot.sendMessage(from, react);

    const audio = { url: downloadUrl };
    const audioMessage = {
      audio: audio,
      mimetype: "audio/mpeg"
    };
    const quotedMessage = { quoted: message };

    await bot.sendMessage(from, audioMessage, quotedMessage);

    const reactSuccess = {
      text: "✔",
      key: message.key
    };
    const successReact = { react: reactSuccess };
    await bot.sendMessage(from, successReact);
  } catch (error) {
    console.log(error);

    try {
      const replyMsg = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;

      if (!q) {
        return reply(replyMsg.url);
      }

      if (!q.includes("https://youtube.com/watch?v=")) {
        return await reply(replyMsg.not_fo);
      }

      let downloadInfo = await giftm(q);
      const reactUp = {
        text: "⬆",
        key: message.key
      };
      const react = { react: reactUp };
      await bot.sendMessage(from, react);

      const audio = { url: downloadInfo.dl_link };
      const audioMessage = {
        audio: audio,
        mimetype: "audio/mpeg"
      };
      const quotedMessage = { quoted: message };

      await bot.sendMessage(from, audioMessage, quotedMessage);

      const reactSuccess = {
        text: "✔",
        key: message.key
      };
      const successReact = { react: reactSuccess };
      await bot.sendMessage(from, successReact);
    } catch (error2) {
      try {
        if (!q) {
          return reply(msr.url);
        }

        if (!q.includes("https://youtube.com/watch?v=")) {
          return await reply(msr.not_fo);
        }

        let downloadInfo = await ytmp3(q);
        const reactUp = {
          text: "⬆",
          key: message.key
        };
        const react = { react: reactUp };
        await bot.sendMessage(from, react);

        const audio = { url: downloadInfo.dl_link };
        const audioMessage = {
          audio: audio,
          mimetype: "audio/mpeg"
        };
        const quotedMessage = { quoted: message };

        await bot.sendMessage(from, audioMessage, quotedMessage);

        const reactSuccess = {
          text: "✔",
          key: message.key
        };
        const successReact = { react: reactSuccess };
        await bot.sendMessage(from, successReact);
      } catch (error3) {
        console.log(error3);
      }
    }
  }
});
        
const commandytmp4 = {
  pattern: "ytmp4",
  desc: "Download YouTube videos as MP4.",
  react: "🎥",
  filename: __filename
};

cmd(commandytmp4, async (client, message, args, { from, body, isCmd, command, q, reply }) => {
  try {
    // Fetch details and response messages from external sources
    const details = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    const footerText = details.footer;
    const responseMessages = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;

    // Extract YouTube URL and video quality
    const [youtubeUrl, quality] = q.split(" & ");

    if (!youtubeUrl) {
      return reply(responseMessages.url);
    }

    if (!youtubeUrl.includes("https://youtube.com/watch?v=")) {
      return reply(responseMessages.not_fo);
    }

    // Get the download URL
    let videoUrl = await getDownloadUrl(youtubeUrl, quality);

    // Send reaction to indicate processing
    await client.sendMessage(from, { react: { text: "⬆", key: message.key } });

    // Send the downloaded video
    await client.sendMessage(from, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      caption: footerText
    }, { quoted: message });

    // Send a checkmark reaction to indicate success
    await client.sendMessage(from, { react: { text: "✔", key: message.key } });

  } catch (error) {
    try {
      // Fallback attempt if the first download method fails
      const details = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
      const footerText = details.footer;
      const responseMessages = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;

      const [youtubeUrl, quality] = q.split(" & ");

      if (!youtubeUrl) {
        return reply(responseMessages.url);
      }

      if (!youtubeUrl.includes("https://youtube.com/watch?v=")) {
        return reply(responseMessages.not_fo);
      }

      // Attempt another method to fetch the video download URL
      let videoData = await ytmp444(youtubeUrl, quality);
      let videoUrl = videoData.dl_link;

      // Send reaction and the downloaded video
      await client.sendMessage(from, { react: { text: "⬆", key: message.key } });
      await client.sendMessage(from, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: footerText
      }, { quoted: message });

      // Success reaction
      await client.sendMessage(from, { react: { text: "✔", key: message.key } });

    } catch (fallbackError) {
      console.error("Download failed:", fallbackError);
    }
  }
});

  
const Commandytvdoc = {
  pattern: "ytvdoc",
  react: "⬇",
  filename: __filename
};

cmd(Commandytvdoc, async (message, context, sender, {
  from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    // Fetch response message
    const response = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
    const videoUrl = q.split(" & ")[0];
    const additionalParam = q.split(" & ")[1];

    if (!videoUrl) {
      return reply(response.url);
    }

    if (!videoUrl.includes("https://youtube.com/watch?v=")) {
      return await reply(response.not_fo);
    }

    // Fetch video details and process
    const videoDetails = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let footerText = videoDetails.footer;
    let downloadUrl = await getDownloadUrl(videoUrl, additionalParam);
    const videoInfo = await yts(videoUrl);
    const videoData = videoInfo.videos[0];

    // Send thumbnail and video download link
    const thumbnail = await getimage(videoData.image);
    await message.sendMessage(from, {
      react: { text: "⬆", key: context.key }
    });
    await message.sendMessage(from, {
      document: { url: downloadUrl },
      jpegThumbnail: thumbnail,
      mimetype: "video/mp4",
      fileName: videoData.title + ".mp4",
      caption: footerText
    }, { quoted: context });

    // React with success
    await message.sendMessage(from, {
      react: { text: "✔", key: context.key }
    });

  } catch (error) {
    // Handle errors and retry
    try {
      const fallbackResponse = (await fetchJson("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/Mreply.json")).replyMsg;
      const fallbackUrl = q.split(" & ")[0];
      const fallbackParam = q.split(" & ")[1];

      if (!fallbackUrl) {
        return reply(fallbackResponse.url);
      }

      if (!fallbackUrl.includes("https://youtube.com/watch?v=")) {
        return await reply(fallbackResponse.not_fo);
      }

      const fallbackDetails = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
      let footerTextFallback = fallbackDetails.footer;
      let downloadUrlFallback = await ytmp444(fallbackUrl.trim(), fallbackParam.trim());
      let videoDetailsFallback = await yts(fallbackUrl);

      const videoDataFallback = videoDetailsFallback.videos[0];
      const thumbnailFallback = await getimage(videoDataFallback.image);

      await message.sendMessage(from, {
        react: { text: "⬆", key: context.key }
      });
      await message.sendMessage(from, {
        document: { url: downloadUrlFallback.dl_link },
        jpegThumbnail: thumbnailFallback,
        mimetype: "video/mp4",
        fileName: videoDataFallback.title + ".mp4",
        caption: footerTextFallback
      }, { quoted: context });

      // React with success
      await message.sendMessage(from, {
        react: { text: "✔", key: context.key }
      });
    } catch (error) {
      // Handle final error
    }
  }
});


const Commandyts = {
  pattern: "yts",
  react: "🔎",
  alias: ["ytsearch", "ytfind"],
  desc: "Search YouTube and provide download options.",
  category: "search",
  use: ".yts <query>",
  filename: __filename
};

cmd(Commandyts, async (bot, message, fromData, {
  from, prefix, quoted, body, isCmd, command, args, q, sender, reply
}) => {
  try {
    if (!q) {
      return reply("Please provide a search term!");
    }

    // Fetch data from external JSON resource
    const response = await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json");
    const footer = response.data.footer;

    // Perform YouTube search
    const searchResults = await yts(q);
    const videos = searchResults.videos;

    // Check if there are any search results
    if (!videos.length) {
      return reply("No results found.");
    }

    // Prepare the list of search results
    let videoList = [];
    for (let i = 0; i < videos.length; i++) {
      videoList.push({
        "title": i + 1,
        "description": `${videos[i].title}\n`,
        "rowId": `${prefix}ytselect ${videos[i].url}`
      });
    }

    // Structure the message to be sent back
    const messageBody = [{
      "title": "*[Results from YouTube.com]*\n",
      "rows": videoList
    }];

    const replyData = {
      text: `> 🥷𝗗𝗔𝗥𝗞 𝗡𝗘𝗥𝗢  𝗬𝗧𝗦 𝗦𝗘𝗔𝗥𝗖𝗛🔍\n\n🔎 *Search for:* *${q}*`,
      footer: footer,
      title: "Select a video from the results below:",
      buttonText: "🔢 Reply with a number",
      sections: messageBody
    };

    // Send the reply with options
    const quotedMessage = {
      quoted: message
    };

    return await bot.replyList(from, replyData, quotedMessage);

  } catch (error) {
    console.error(error);
    reply('Error: ' + error);
  }
});
    
const commandytselect = {
  pattern: "ytselect",
  react: "🎥",
  use: ".ytselect",
  filename: __filename
};

cmd(commandytselect, async (bot, message, options, { from, prefix, quoted, body, args, q, reply }) => {
  try {
    // Convert the provided YouTube link
    q = convertYouTubeLink(q);

    // Search for the video on YouTube
    const searchResults = await yts(q);
    const video = searchResults.videos[0];
    const videoUrl = video.url;

    // Fetch footer details from a remote JSON file
    const remoteData = (await axios.get("https://gitlab.com/malakamd2002/malaka-md-db/-/raw/main/ditels/ditels.json")).data;
    let footerText = remoteData.footer;

    // Create the button options for song and video
    const sections = [{
      "title": '',
      "rows": [
        {
          "title": "1",
          "rowId": prefix + "song " + videoUrl,
          "description": "Audio File 🎶"
        },
        {
          "title": "2",
          "rowId": prefix + "video " + videoUrl,
          "description": "Video File 📂"
        }
      ]
    }];

    // Build the list message
    const listMessage = {
      caption: "📽️",
      image: { url: video.thumbnail },
      footer: footerText,
      title: '',
      buttonText: "*🔢 Reply below number*",
      sections: sections
    };

    // Send the message with list options
    const messageOptions = {
      quoted: message
    };

    return await bot.replyList(from, listMessage, messageOptions);
  } catch (error) {
    // Handle errors
    reply("*ERROR !!*");
    console.error(error);
  }
});

const commandConfig = {
  pattern: "ytmp30",
  dontAddCommandList: true,
  filename: __filename
};

cmd(commandConfig, async (client, message, context, { from, q, reply }) => {
  try {
    const messageData = { text: '⬇', key: context.key };
    const messageReact = { react: messageData };
    await client.sendMessage(from, messageReact);

    if (!q) {
      return await client.sendMessage(from, { text: "*Need link...*" }, { quoted: context });
    }

    const url = q.split('|')[0];
    const title = q.split('|')[1] || "VAJIRA-MD";

    const downloadInfo = await fetchJson(`https://vajira-api-0aaeb51465b5.herokuapp.com/download/ytmp3?url=${url}`);
    const audioData = {
      audio: await getBuffer(downloadInfo.result.dl_link),
      caption: `${title}\n\n${config.FOOTER}`,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    };
    await client.sendMessage(from, audioData);

    const successData = { text: '✔', key: context.key };
    const successReact = { react: successData };
    await client.sendMessage(from, successReact);
  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

const songInfo = {
  pattern: "play",
  alias: ["play"],
  category: "download",
  use: ".play lelena",
  react: '🎧',
  desc: "song download",
};

songInfo.category = "download";
songInfo.filename = __filename;

cmd(songInfo, async (client, message, from, { 
  from: user, 
  prefix, 
  body, 
  isCmd, 
  command, 
  args, 
  q, 
  isGroup, 
  sender, 
  senderNumber, 
  botNumber, 
  reply 
}) => {
  try {
    if (!q) {
      return await reply(imgmsg);
    }
    
    if (isUrl(q) && !ytreg(q)) {
      return await reply(imgmsg);
    }

    q = convertYouTubeLink(q);
    const result = await yts(q);
    const video = result.videos[0];

    if (isUrl(q) && q.includes("/shorts")) {
      const options = [{
        'title': '',
        'rows': [{
          'title': '1',
          'rowId': prefix + ("ytmp30 " + q + '|' + video.title),
          'description': "Normal type song 🎶"
        }, {
          'title': '2',
          'rowId': prefix + ("ytdocs " + q + '|' + video.title),
          'description': "Document type song 📂"
        }]
      }];
      const messageContent = {
        text: "> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀\n\n   *song download*",
        footer: "> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀",
        buttonText: "```🔢 Reply below number you need song type,```",
        sections: options
      };
      return await client.replyList(user, messageContent);
    }

    if (ytreg(q)) {
      const options = [{
        'title': '',
        'rows': [{
          'title': '1',
          'rowId': prefix + ("ytmp30 " + q + '|' + video.title),
          'description': "Normal type song 🎶"
        }, {
          'title': '2',
          'rowId': prefix + ("ytdocs " + q + '|' + video.title),
          'description': "Document type song 📂"
        }]
      }];
      const messageContent = {
        text: "> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀\n\n*song download*",
        footer: "> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀",
        buttonText: "```🔢 Reply below number you need song type,```",
        sections: options
      };
      return await client.replyList(user, messageContent);
    }

    const songDetails = `📽️ *Alexa md SONG-DOWNLOADER*📽️\n\n┌──────────────────\n\n*ℹ️ Title:* ${video.title}\n*👁️‍🗨️ Views:* ${video.views}\n*🕘 Duration:* ${video.timestamp}\n*📌 Ago :* ${video.ago}\n*🔗 Url:* ${video.url} \n\n└──────────────────`;
    const downloadOptions = [{
      'title': '',
      'rows': [{
        'title': '1',
        'rowId': prefix + ("ytmp30 " + video.url + '|' + video.title),
        'description': "Normal type song 🎶"
      }, {
        'title': '2',
        'rowId': prefix + ("ytdocs " + video.url + '|' + video.title),
        'description': "Document type song 📂"
      }]
    }];
    const thumbnail = { url: video.thumbnail };
    const finalMessage = {
      image: thumbnail,
      caption: songDetails,
      footer: config.FOOTER,
      title: '',
      buttonText: "*🔢 Reply below number*",
      sections: downloadOptions
    };
    return await client.replyList(user, finalMessage);
  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

const commandytdocs = {
  pattern: "ytdocs",
  dontAddCommandList: true,
  filename: __filename
};

cmd(commandytdocs, async (client, message, chat, { from, q, reply }) => {
  try {
    const react = {
      text: '⬇',
      key: message.key
    };
    const reactMessage = {
      react: react
    };
    await client.sendMessage(from, reactMessage);

    const needLinkMessage = {
      text: "*Need link...*"
    };
    const quotedMessage = {
      quoted: message
    };

    if (!q) {
      return await client.sendMessage(from, needLinkMessage, quotedMessage);
    }

    const videoUrl = q.split('|')[0];
    const customName = q.split('|')[1] || "DarkNero-MD";

    const downloadInfo = await fetchJson(`https://vajira-api-0aaeb51465b5.herokuapp.com/download/ytmp3?url=${videoUrl}`);

    const audioFile = {
      document: await getBuffer(downloadInfo.result.dl_link),
      caption: `${customName}\n\n${config.FOOTER}`,
      mimetype: "audio/mpeg",
      fileName: `${customName}.mp3`
    };

    await client.sendMessage(from, audioFile);

    const successReact = {
      text: '✔',
      key: message.key
    };
    const successReactMessage = {
      react: successReact
    };

    await client.sendMessage(from, successReactMessage);

  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

//function someUtilityFunction(param1, param2, param3, param4, param5) {
  //return someOtherFunction(param4 - 0xa5, param5);
//}

cmd({
  pattern: "play8",
  desc: "Search and play a song from YouTube.",
  react: '⬇️',
  filename: __filename
}, async (client, message, chat, { args }) => {
  if (!args[0]) {
    return client.sendMessage(chat.chat, { text: "Please provide a song name or keyword." });
  }

  try {
    const query = args.join(" ");
    const searchResults = await yts(query);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      return client.sendMessage(chat.chat, { text: "No songs found for the given name." });
    }

    const song = videos[0];
    const apiURL = `https://api.diioffc.web.id/api/search/ytplay?query=${encodeURIComponent(song.title)}`;
    
    const apiResponse = await axios.get(apiURL);

    if (!apiResponse.data || !apiResponse.data.result || !apiResponse.data.result.download) {
      return client.sendMessage(chat.chat, { text: "Unable to fetch download URL." });
    }

    await client.sendMessage(chat.chat, { react: { text: '⬆️', key: message.key } });

    const downloadUrl = apiResponse.data.result.download.url;

    await client.sendMessage(chat.chat, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: song.title
    });

    await client.sendMessage(chat.chat, { react: { text: '✅', key: message.key } });

  } catch (error) {
    console.error("Error:", error);
    client.sendMessage(chat.chat, { text: "An error occurred while searching or downloading the song." });
  }
});

cmd({
  pattern: "ytaa",
  react: '⬇️',
  dontAddCommandList: true,
  filename: __filename
}, async (bot, message, args, { from, q, reply }) => {
  try {
    if (!q) {
      return await reply("*Please give me a YouTube URL!*");
    }

    const response = await fetchJson(`https://api.genux.me/api/download/ytmp3?query=${q}&apikey=GENUX-MALAKA-MD`);

    await bot.sendMessage(from, {
      audio: {
        url: response.result.dl_links
      },
      mimetype: 'audio/mpeg'
    }, {
      quoted: message
    });

    await bot.sendMessage(from, {
      react: {
        text: '⬆️',
        key: message.key
      }
    });

    await bot.sendMessage(from, {
      react: {
        text: '✔️',
        key: message.key
      }
    });

  } catch (error) {
    console.log(error);
  }
});

cmd({ 
    pattern: "video2", 
    alias: ["video2", "mp4"], 
    react: "⬇️", 
    desc: "Download Youtube song", 
    category: "download", 
    use: '.video2 < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        let response = await fetch(apiUrl);
        let data = await response.json();
        if (data.status !== 200 || !data.success || !data.result.download_url) {
            return reply("Failed to fetch the video. Please try again later.");
        }
        await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });
        await conn.sendMessage(from, { 
            document: { url: data.result.download_url }, 
            mimetype: "video/mp4", 
            fileName: `${data.result.title}.mp4`, 
            caption: `> *${yts.title}*\n > 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀`
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});  

cmd({ 
     pattern: "mp3", 
     alias: ["ytdl3", "play2"], 
     react: "⬇️", 
     desc: "Download Youtube song",
     filename: __filename }, 
     async (conn, mek, m, { from, prefix, quoted, q, reply }) => 
     { try { if (!q) return await reply("Please provide a YouTube URL or song name.");
    const yt = await ytsearch(q);
    if (yt.results.length < 1) return reply("No results found!");
    let yts = yt.results[0];  
    let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
        return reply("Failed to fetch the audio. Please try again later.");
    }
    await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
    await conn.sendMessage(from, { 
        document: { url: data.result.downloadUrl }, 
        mimetype: "audio/mpeg", 
        fileName: `${data.result.title}.mp3`, 
        caption: `> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀`
    }, { quoted: mek });
} catch (e) {
    console.log(e);
    reply("An error occurred. Please try again later.");
}

});
