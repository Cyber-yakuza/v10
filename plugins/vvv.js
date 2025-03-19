const {
  default: makeWASocket,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} = require("@whiskeysockets/baileys");

const config = require("../settings");
const { cmd, commands } = require("../lib/command");
const {
  getBuffer,
  getFile,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  jsonformat
} = require("../lib/functions");

const xnxx = require("xnxx-dl");
const gis = require("async-g-i-s");
const axios = require("axios");
const cheerio = require("cheerio");
const yts = require("yt-search");
const videoSearchResults = new Map();
var request = require("request");
let optionIndex = 1;
const fs = require('fs');
const { File } = require("megajs");

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function fbDownloader(url) {
  try {
    const data = { url };
    const response = await axios({
      method: "POST",
      url: "https://snapsave.app/action.php?lang=vn",
      headers: {
        accept: "*/*",
        "content-type": "multipart/form-data",
        Referer: "https://snapsave.app/vn"
      },
      data
    });

    let htmlContent;
    const parsedHtml = response.data.replace("return decodeURIComponent", "html = decodeURIComponent");
    eval(parsedHtml);
    htmlContent = htmlContent.split('innerHTML = "')[1].split("\";\n")[0].replace(/\\"/g, "\"");

    const $ = cheerio.load(htmlContent);
    const result = [];

    $("table tbody tr").each(function () {
      const quality = $(this).children().eq(0).text().trim();
      const downloadUrl = $(this).children().eq(2).find('a').attr("href");

      if (downloadUrl) {
        result.push({ quality, url: downloadUrl });
      }
    });

    return { success: true, download: result };
  } catch (error) {
    return { success: false };
  }
}

function fbreg(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(m\.facebook|facebook|fb)\.(com|me|watch)\/(?:[\w\-\.]*\/)*([\w\-\.]*)/;
  return regex.test(url);
}

async function Insta(url) {
  const result = [];
  const data = { url, submit: '' };

  const { data: pageContent } = await axios.post("https://downloadgram.org/", data);
  const $ = cheerio.load(pageContent);

  $("#downloadhere > a").each(function () {
    const downloadLink = $(this).attr("href");
    if (downloadLink) result.push(downloadLink);
  });

  return result;
}

async function sswebA(url = '', fullScreen = false, device = "desktop") {
  device = device.toLowerCase();
  if (!["desktop", "tablet", "phone"].includes(device)) {
    device = "desktop";
  }

  const params = new URLSearchParams();
  params.append("url", url);
  params.append("device", device);
  if (fullScreen) params.append("full", 'on');
  params.append("cacheLimit", 0);

  const captureResponse = await axios.post("https://www.screenshotmachine.com/capture.php", params);
  const cookie = captureResponse.headers["set-cookie"];

  const imageResponse = await axios({
    url: "https://www.screenshotmachine.com/" + captureResponse.data.link,
    headers: { cookie: cookie.join('') },
    responseType: "arraybuffer"
  });

  return Buffer.from(imageResponse.data);
}

function formatUploadDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

let soundcloud = async (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: "https://www.klickaud.co/download.php",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      formData: {
        value: url,
        "2311a6d881b099dc3820600739d52e64a1e6dcfe55097b5c7c649088c4e50c37": "710c08f2ba36bd969d1cbc68f59797421fcf90ca7cd398f78d67dfd8c3e554e3"
      }
    };

    request(options, async (err, res, body) => {
      if (err) {
        reject(err);
      }

      const $ = cheerio.load(body);
      const result = {
        title: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(2)").text(),
        download_count: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(3)").text(),
        thumb: $("#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(1) > img").attr("src"),
        link: $("#dlMP3").attr("onclick").split("downloadFile('")[1].split("',")[0]
      };
      resolve(result);
    });
  });
};

async function ssearch(query) {
  const response = await axios.get(`https://m.soundcloud.com/search?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
    }
  });

  const $ = cheerio.load(response.data);
  const result = [];

  $("div > ul > li > div").each(function () {
    const title = $(this).find('a').attr("aria-label");
    const url = "https://m.soundcloud.com" + $(this).find('a').attr("href");
    const thumb = $(this).find("a > div > div > div > picture > img").attr("src");
    const artist = $(this).find("a > div > div > div").eq(1).text();
    const views = $(this).find("a > div > div > div > div > div").eq(0).text();
    const release = $(this).find("a > div > div > div > div > div").eq(2).text();

    result.push({
      title,
      url,
      thumb,
      artist,
      views,
      release
    });
  });

  return {
    status: response.status,
    creator: "Caliph",
    result
  };
}

async function GDriveDl(url) {
  const errorResponse = { error: true };
  let fileId;
  let result = errorResponse;

  if (!url || !url.match(/drive\.google/i)) {
    return result;
  }

  try {
    fileId = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
    if (!fileId) throw "ID Not Found";

    const fileResponse = await fetch(`https://drive.google.com/uc?id=${fileId}&authuser=0&export=download`, {
      method: "post",
      headers: {
        "accept-encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        origin: "https://drive.google.com",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
      }
    });

    const { fileName, sizeBytes, downloadUrl } = JSON.parse((await fileResponse.text()).slice(4));
    if (!downloadUrl) throw "Link Download Limit!";

    const downloadResponse = await fetch(downloadUrl);
    if (downloadResponse.status !== 200) {
      return downloadResponse.statusText;
    }

    result = {
      downloadUrl,
      fileName,
      fileSize: sizeFormatter(sizeBytes),
      mimetype: downloadResponse.headers.get("content-type")
    };
  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
}
var needus = '';
if (config.LANG === 'SI') {
  needus = "*කරුණාකර මට threads url එකක් දෙන්න !!*";
} else {
  needus = "*Please give me threads url !!*";
}
var cantf = '';
if (config.LANG === 'SI') {
  cantf = "*මට මෙම වීඩියෝව සොයාගත නොහැක!*";
} else {
  cantf = "*I cant find this video!*";
}
var N_FOUND = '';
if (config.LANG === 'SI') {
  N_FOUND = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
} else {
  N_FOUND = "*I couldn't find anything :(*";
}
var urlneed = '';
if (config.LANG === 'SI') {
  urlneed = "එය Baiscopelk වෙතින් සිංහල උපසිරැසි බාගත කරයි.";
} else {
  urlneed = "It downloads sinhala subtitle from Baiscopelk.";
}
var imgmsg = '';
if (config.LANG === 'SI') {
  imgmsg = "```කරුණාකර වචන කිහිපයක් ලියන්න!```";
} else {
  imgmsg = "```Please write a few words!```";
}
var desc = '';
if (config.LANG === 'SI') {
  desc = "Tiktok වෙතින් වීඩියෝ බාගත කරයි.";
} else {
  desc = "Download videos from Facebook.";
}
var urlneed1 = '';
if (config.LANG === 'SI') {
  urlneed1 = "*කරුණාකර Tiktok video url එකක් ලබා දෙන්න*";
} else {
  urlneed1 = "*Please give me tiktok video url..*";
}
var desc1 = '';
if (config.LANG === 'SI') {
  desc1 = "Facebook වෙතින් වීඩියෝ බාගත කරයි.";
} else {
  desc1 = "Download videos from Facebook.";
}
var urlneed2 = '';
if (config.LANG === 'SI') {
  urlneed2 = "*කරුණාකර facebook video url එකක් ලබා දෙන්න*";
} else {
  urlneed2 = "*Please give me facebook video url..*";
}
var desc5 = '';
if (config.LANG === 'SI') {
  desc5 = "ගූගල් හි අදාළ පින්තූර සෙවීම.";
} else {
  desc5 = "Search for related pics on Google.";
}
var desc2 = '';
if (config.LANG === 'SI') {
  desc2 = "unsplash.com හි අදාළ පින්තූර සෙවීම.";
} else {
  desc2 = "Search for related pics on unsplash.com.";
}
var desc3 = '';
if (config.LANG === 'SI') {
  desc3 = "pixabay.com හි අදාළ පින්තූර සෙවීම.";
} else {
  desc3 = "Search for related pics on pixabay.com.";
}
var desc4 = '';
if (config.LANG === 'SI') {
  desc4 = "bing හි අදාළ පින්තූර සෙවීම.";
} else {
  desc4 = "Searche for related pics on bing.";
}
var errt = '';
if (config.LANG === 'SI') {
  errt = "*මට කිසිවක් සොයාගත නොහැකි විය :(*";
} else {
  errt = "*I couldn't find anything :(*";
}
var needus = '';
if (config.LANG === 'SI') {
  needus = "*කරුණාකර මට Instagram url එකක් දෙන්න !!*";
} else {
  needus = "*Please give me Instagram url !!*";
}
var imgmsg1 = '';
if (config.LANG === 'SI') {
  imgmsg1 = "*කරුණාකර මට url එකක් දෙන්න !*";
} else {
  imgmsg1 = "*Please give me a url !*";
}
var descg = '';
if (config.LANG === 'SI') {
  descg = "එය ලබා දී ඇති url හි desktop ප්‍රමාණයේ තිර රුවක් ලබා දෙයි.";
} else {
  descg = "It gives desktop size screenshot of given url.";
}
function _0x2e47c9(_0x1728e0, _0x3a905b, _0x2ac2b3, _0x2ecaa8, _0x3b74db) {
  return _0xf870(_0x2ac2b3 - 0x1dc, _0x3a905b);
}
var descp = '';
if (config.LANG === 'SI') {
  descp = "එය ලබා දී ඇති url හි දුරකථන ප්‍රමාණයේ තිර රුවක් ලබා දෙයි.";
} else {
  descp = "It gives phone size screenshot of given url.";
}
var desct = '';
if (config.LANG === 'SI') {
  desct = "එය ලබා දී ඇති url හි ටැබ්ලට් ප්‍රමාණයේ තිර රුවක් ලබා දෙයි.";
} else {
  desct = "It gives tablet size screenshot of given url.";
}
var cant = '';
if (config.LANG === 'SI') {
  cant = "*මට තිර රුවක් ලබා ගත නොහැක. පසුව නැවත උත්සාහ කරන්න.*";
} else {
  cant = "*I can't get a screenshot. Try again later.*";
}
var urlneed3 = '';
if (config.LANG === 'SI') {
  urlneed3 = "එය androidapksfree වෙතින් mod apps බාගත කරයි.";
} else {
  urlneed3 = "It downloads mod apps from androidapksfree.";
}
var urlneed4 = '';
if (config.LANG === 'SI') {
  urlneed4 = "එය playstore වෙතින් apps බාගත කරයි.";
} else {
  urlneed4 = "It downloads apps from playstore.";
}

const xnxxDownloader = {
  pattern: "xnxx",
  react: '📱',
  desc: "xxx video downloader",
  category: "download",
  use: ".xnxx mia kalifa",
  filename: __filename
};

cmd(xnxxDownloader, async (message, bot, reply, { 
  from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, 
  botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, 
  groupAdmins, isBotAdmins, isAdmins, replyMessage }) => {
  try {
    if (!q) {
      return bot.reply("Enter Query");
    }

    const api = require("api-dylux");
    let searchResults = await api.xnxxSearch(q);
    let errorMessage = "මොනාද හුත්තො කුනුහරප ඉල්ලන්නෙ🤣 \n බැන්ඩ් කරගනිම් ඔව ඉල්ලල උබෙ whatsapp එක🤣\nවලත්තයා";

    if (searchResults.status) {
      bot.reply(errorMessage);
    }

    const results = searchResults.result;
    const noResultsMessage = { text: "N_FOUND" };
    const quotedMessage = { quoted: bot };

    if (results.length < 1) {
      return await message.sendMessage(from, noResultsMessage, quotedMessage);
    }

    let resultButtons = results.map((result, index) => ({
      title: index + 1,
      description: result.title,
      rowId: `${prefix}xnxxdl ${result.link}+${result.title}`
    }));

    const buttons = {
      title: "_[Result from androidapksfree.]_",
      rows: resultButtons
    };

    const sections = [buttons];
    const response = {
      text: `*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*\n\n *XNXX VIDEO DOWNLOADER*\n\n*📱 Entered Name:* ${q}`,
      footer: config.FOOTER,
      title: "Result from androidapksfree. 📲",
      buttonText: "*🔢 Reply below number*",
      sections: sections
    };

    return await message.replyList(from, response, quotedMessage);
  } catch (error) {
    replyMessage("*ERROR !!*");
    l(error);
  }
});

const commandxnxxdl = {
  pattern: "xnxxdl",
  react: '👾',
  desc: "to take xnxx video",
  category: "download",
  use: ".xnxxdl",
  filename: __filename
};

cmd(commandxnxxdl, async (client, message, bot, { 
  from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, 
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, 
  groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply 
}) => {
  try {
    // Check if the provided link contains "xnxx.com"
    if (!q.includes("xnxx.com")) {
      return message.reply("Enter an xnxx link");
    }
    
    const api = require("api-dylux");
    
    // Fetch video details from the xnxx URL
    let videoDetails = await api.xnxxdl(q);
    
    const response = {
      caption: `*XNXX DL*\n\n✍ *Title:* ${videoDetails.title}\n⌛ *Duration:* ${videoDetails.duration}\n📽 *Visual Quality:* ${videoDetails.quality}`,
      video: {}
    };
    
    // Provide the download link for the video
    response.video.url = videoDetails.url_dl;
    
    // Send the message with video details and the download link
    client.sendMessage(message.chat, response, {
      quoted: message
    });
  } catch (error) {
    l(error);
  }
});



const commandmediafire = {
  pattern: "mediafire2",
  alias: ["mfire2"],
  desc: "Download MediaFire files",
  category: "download",
  react: '📩',
  use: ".mfire2",
  filename: __filename
};

cmd(commandmediafire, async (bot, message, args, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args: argumentsList,
  q: query,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    if (!query || !query.startsWith("https://")) {
      return reply("Please provide a valid MediaFire URL.");
    }

    // Fetch the webpage content
    const response = await require("undici").fetch(query);
    const html = await response.text();
    const $ = require("cheerio").load(html);

    // Extract file details
    let fileName = $(".dl-info > div > div.filename").text();
    let downloadLink = $("#downloadButton").attr("href");
    let fileType = $(".dl-info > div > div.filetype").text();
    let uploadDate = $("body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(1) > span").text();
    let fileSize = $("body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span").text();

    // Determine MIME type based on file extension
    let mimeType = '';
    if (fileName.includes(".zip")) mimeType = "application/zip";
    else if (fileName.includes(".pdf")) mimeType = "application/pdf";
    else if (fileName.includes(".mp4")) mimeType = "video/mp4";
    else if (fileName.includes(".mkv")) mimeType = "video/x-matroska";
    else if (fileName.includes(".mp3")) mimeType = "audio/mpeg";
    else if (fileName.includes(".7z")) mimeType = "application/x-7z-compressed";
    else if (fileName.includes(".jpg") || fileName.includes(".jpeg")) mimeType = "image/jpeg";
    else if (fileName.includes(".png")) mimeType = "image/png";
    else if (fileName.includes(".rar")) mimeType = "application/x-rar-compressed";
    else mimeType = "application/octet-stream";

    reply("*Downloading MediaFire file... 📥*");

    // Send the file
    const fileData = {
      document: { url: downloadLink },
      fileName: fileName,
      mimetype: mimeType,
      caption: `${fileName}\n\nType: ${fileType}\nUploaded: ${uploadDate}\nSize: ${fileSize}`
    };

    const messageOptions = { quoted: message };
    await bot.sendMessage(from, fileData, messageOptions);
    
  } catch (error) {
    console.error(error);
    reply("Error: " + error.message);
  }
});

const imageDownloader = {
  pattern: "img2",
  react: "🖼️",
  desc: "desc5",
  category: "convert",
  use: ".img2 car",
  filename: __filename
};

cmd(imageDownloader, async (client, message, user, {
  from, l, prefix, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
  try {
    if (!q) {
      return await reply("Please provide a search query.");
    }

    // Perform a Google Image Search (assumed function 'gis')
    const searchResults = await gis(q);

    let limitedResults = searchResults.slice(0, 100);
    const noResultsMessage = {
      text: "No results found."
    };
    const quotedMessage = {
      quoted: message
    };

    if (limitedResults.length < 1) {
      return await client.sendMessage(from, noResultsMessage, quotedMessage);
    }

    // Prepare results to be sent
    let resultList = [];
    let resultNumber = 1;
    for (let i = 0; i < limitedResults.length; i++) {
      resultList.push({
        'title': i + 1,
        'description': "Image number: " + resultNumber++,
        'rowId': prefix + "dimg " + limitedResults[i].url
      });
    }

    // Create a message with image selection options
    const messageOptions = {
      title: "Result from Google. 📲",
      rows: resultList
    };

    const sections = [messageOptions];
    const formattedMessage = {
      text: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*\n\n   *IMG DOWNLOADER 01*\n\n*🖼️ Image Name:* " + q,
      footer: config.FOOTER,
      title: "Result from Google. 📲",
      buttonText: "Select Image",
      sections: sections
    };

    await client.replyList(from, formattedMessage, quotedMessage);
  } catch (error) {
    reply("An error occurred.");
    l(error);
  }
});
    
const commanddimg = {
  pattern: "dimg",
  dontAddCommandList: true,
  filename: __filename
};

cmd(commanddimg, async (client, message, chatData, { 
  from, l, quoted, body, isCmd, command, args, q, 
  isGroup, sender, senderNumber, botNumber2, botNumber, 
  pushname, isMe, isOwner, groupMetadata, groupName, 
  participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  
  try {
    // React with 🔃 to the received message
    const reactResponse = {
      text: '🔃',
      key: message.key
    };
    const reactObj = {
      react: reactResponse
    };
    await client.sendMessage(from, reactObj);

    // Send an image with a caption
    const imageResponse = {
      url: q
    };
    const imageMessage = {
      image: imageResponse,
      caption: config.FOOTER
    };
    const quotedMessage = {
      quoted: message
    };
    await client.sendMessage(from, imageMessage, quotedMessage);

    // React with ✔ to acknowledge
    const successResponse = {
      text: '✔',
      key: message.key
    };
    const successObj = {
      react: successResponse
    };
    await client.sendMessage(from, successObj);

  } catch (err) {
    reply(err);
    l(err);
  }
});



const commandmodapk = {
  pattern: "modapk",
  react: "📑",
  category: "download",
  desc: "modapk downloader",
  use: ".modapk",
  filename: __filename
};

cmd(commandmodapk, async (bot, message, options, { 
  from, prefix, q: query, l, isDev, reply 
}) => {
  try {
    if (!query) {
      return await reply("*Please provide a search query..! 🖊️*");
    }

    const searchUrl = `https://an1.com/?story=${query}&do=search&subaction=search`;
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    const results = [];

    $("div.item").each((index, element) => {
      results.push({
        link: $(element).find("a").attr("href"),
        title: $(element).find("div.name > a > span").text()
      });
    });

    const messageOptions = { quoted: options };

    if (results.length < 1) {
      return await bot.sendMessage(from, { text: "*No results found :(*" }, messageOptions);
    }

    let listItems = [];
    for (let i = 0; i < results.length; i++) {
      listItems.push({
        title: i + 1,
        description: results[i].title,
        rowId: `${prefix}ma ${results[i].link}`
      });
    }

    const listSection = {
      title: "_[Results from an1]_",
      rows: listItems
    };

    const listMessage = {
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*",
      image: { url: "https://i.ibb.co/D5760gq/xwl2e6b5.png" },
      footer: config.FOOTER,
      title: "Results from an1 📲",
      buttonText: "*🔢 Reply below number*",
      sections: [listSection]
    };

    return await bot.replyList(from, listMessage, messageOptions);
  } catch (error) {
    reply("*ERROR !!*");
    l(error);
  }
});

const commandma = {
  pattern: "ma",
  react: "📦",
  desc: "APK Downloader",
  category: "",
  use: ".apk whatsapp",
  filename: __filename
};

cmd(commandma, async (bot, message, args, extra) => {
  try {
    const {
      from,
      reply,
      q: apkLink,
      prefix,
    } = extra;

    // React with ℹ️ emoji
    await bot.sendMessage(from, {
      react: { text: "ℹ️", key: message.key }
    });

    // If no APK link is provided, return an error message
    if (!apkLink) {
      return await bot.sendMessage(from, { text: "*Need APK link...*" }, { quoted: message });
    }

    // Fetch APK download page
    const response = await axios.get(apkLink);
    const $ = cheerio.load(response.data);

    // Extract APK details
    const downloadPage = $("a.btn.btn-lg.btn-green").attr("href");
    const appImage = $("figure.img > img").attr("src");
    const appName = $("h1.title.xxlgf").text();
    const appOS = $("div.app_view-first > div > ul > li:nth-child(1) > span").text();
    const appVersion = $("div.app_view-first > div > ul > li:nth-child(2) > span").text();
    const appSize = $("div.app_view-first > div > ul > li:nth-child(3) > span").text();

    // Fetch the actual download link
    const downloadResponse = await axios.get("https://an1.com/" + downloadPage);
    const download$ = cheerio.load(downloadResponse.data);
    const apkDownloadLink = download$("#pre_download").attr("href");

    // Construct the message response
    let messageText = `*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*\n\n*MOD APK-DOWNLOADER*\n\n`;
    messageText += `*📚 App Name: ${appName}*\n`;
    messageText += `*📈 App Size: ${appSize}*\n`;
    messageText += `*🧬 App Version: ${appVersion}*\n`;
    messageText += `*🌐 App OS: ${appOS}*\n`;
    messageText += `─────────────────────────────`;

    // Create a list button with the download link
    const sections = [
      {
        title: "",
        rows: [
          {
            title: "1",
            rowId: `${prefix}mdapk ${apkDownloadLink}|${appName}`,
            description: "Download the mod APK"
          }
        ]
      }
    ];

    // Send message with image and list
    await bot.replyList(from, {
      caption: messageText,
      image: { url: appImage },
      footer: config.FOOTER,
      title: "",
      buttonText: "*🔢 Reply below number*",
      sections
    }, { quoted: message });

  } catch (error) {
    reply("*ERROR !!*");
    console.error(error);
  }
});

const commandmdapk = {
  pattern: "mdapk",
  react: '📥',
  dontAddCommandList: true,
  filename: __filename
};

cmd(commandmdapk, async (client, message, args, { from, q, isDev, reply }) => {
  if (!q) {
    return await reply("*Please provide a direct URL!*");
  }

  try {
    const apkUrl = q.split('|')[0]; // Extract APK URL
    const apkFileName = q.split('|')[1] || "tc_movie_dl_system"; // Extract file name or set default
    
    const progressMessages = [
      "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
      "《 ████▒▒▒▒▒▒▒▒》30%",
      "《 ███████▒▒▒▒▒》50%",
      "《 ██████████▒▒》80%",
      "《 ████████████》100%",
      "𝙸𝙽𝙸𝚃𝙸𝙰𝙻𝙸𝚉𝙴𝙳 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙴𝙳 🦄..."
    ];

    // Sending initial upload message
    const uploadMessage = { text: "ᴜᴘʟᴏᴀᴅɪɴɢ ᴀᴘᴋ..." };
    let { key: progressKey } = await client.sendMessage(from, uploadMessage);

    // Simulating upload progress
    for (let progress of progressMessages) {
      const progressUpdate = { text: progress, edit: progressKey };
      await client.sendMessage(from, progressUpdate);
    }

    // Sending the APK file
    const apkDocument = {
      document: await getBuffer(apkUrl),
      caption: "*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*",
      mimetype: "application/mod.apk",
      fileName: apkFileName + ".apk"
    };

    await client.sendMessage(from, apkDocument);

    // Sending success reaction
    const successReaction = {
      react: {
        text: '✅',
        key: message.key
      }
    };
    await client.sendMessage(from, successReaction);

  } catch (error) {
    console.error("Error fetching or sending", error);
    const errorMessage = { quoted: message };
    await client.sendMessage(from, "*Error fetching or sending *", errorMessage);
  }
});

// XNXX video download command
cmd({
    pattern: "xvx",
    desc: "Downloads a video from XNXX",
    use: ".xnxx <search_term>",
    react: "🔞",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, q, reply }) => {
    const searchTerm = q.trim();
    if (!searchTerm) return reply(`𝖯𝗅𝖾𝖺𝗌𝖾 𝖯𝗋𝗈𝗏𝗂𝖽𝖾 𝖺 𝖲𝖾𝖺𝗋𝖼𝗁 𝖳𝖾𝗋𝗆`);

    reply(`*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*`);
    try {
        // Search for the video and download
        const videoInfo = await xnxx.download(searchTerm);
        if (!videoInfo || !videoInfo.link_dl) {
            return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        }

        reply(`𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 𝖵𝗂𝖽𝖾𝗈 xvx . . . 🔞`);
        const videoUrl = videoInfo.link_dl;
        await conn.sendMessage(
            from,
            { video: { url: videoUrl }, caption: '*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 Ｍ〽️*', mimetype: 'video/mp4' }, 
            { quoted: mek }
        )

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`Error: ${e.message}`);
    }
});
