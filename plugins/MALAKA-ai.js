const { cmd, commands } = require("../lib/command");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  jsonformat,
} = require("../lib/functions");
const config = require("../settings");
const fs = require("fs");
const got = require("got");
const translate = require("translate-google-api");
const { promisify } = require("util");
const FormData = require("form-data");
const stream = require("stream");
const pipeline = promisify(stream.pipeline);
const fileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const path = require("path");
const { tmpdir } = require("os");
const Crypto = require("crypto");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// Function to convert video to WebP
async function videoToWebp(videoBuffer) {
  const outputFilePath = path.join(
    tmpdir(),
    Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".webp"
  );
  const tempVideoPath = path.join(
    tmpdir(),
    Crypto.randomBytes(6).readUIntLE(0, 6).toString(36) + ".mp4"
  );

  fs.writeFileSync(tempVideoPath, videoBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(tempVideoPath)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
        "-loop", "0",
        "-ss", "00:00:00",
        "-t", "00:00:05",
        "-preset", "default",
        "-an",
        "-vsync", "0",
      ])
      .toFormat("webp")
      .save(outputFilePath);
  });

  const outputBuffer = fs.readFileSync(outputFilePath);
  fs.unlinkSync(outputFilePath);
  fs.unlinkSync(tempVideoPath);

  return outputBuffer;
}

// Other Media Conversion Functions
function toAudio(input, output) {
  return ffmpeg(input, ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"], output, "mp3");
}

function toPTT(input, output) {
  return ffmpeg(input, ["-vn", "-c:a", "libopus", "-b:a", "128k", "-vbr", "on", "-compression_level", "10"], output, "opus");
}

function toVideo(input, output) {
  return ffmpeg(input, ["-c:v", "libx264", "-c:a", "aac", "-ab", "128k", "-ar", "44100", "-crf", "32", "-preset", "slow"], output, "mp4");
}
var desct = '';
if (config.LANG === 'SI') {
  desct = "එය ලබා දී ඇති රූපය url එකක් බවට පරිවර්තනය කරයි.";
} else {
  desct = "It convert given image to url.";
}
var imgmsg = '';
if (config.LANG === 'SI') {
  imgmsg = "*ඡායාරූපයකට mention දෙන්න !*";
} else {
  imgmsg = "*Reply to a photo !*";
}
var cantf = '';
if (config.LANG === 'SI') {
  cantf = "*Server එක කාර්යබහුලයි. පසුව නැවත උත්සාහ කරන්න. !*";
} else {
  cantf = "*Server is busy. Try again later.!*";
}
var imgmsgs = '';
if (config.LANG === 'SI') {
  imgmsgs = "*මට anime නමක් දෙන්න !*";
} else {
  imgmsgs = "*Give me a anime name !*";
}
var descgs = '';
if (config.LANG === 'SI') {
  descgs = "එය ලබා දී ඇති anime නම පිළිබඳ විස්තර සපයයි.";
} else {
  descgs = "It gives details of given anime name.";
}
var cants = '';
if (config.LANG === 'SI') {
  cants = "I cant find this anime.";
} else {
  cants = "I cant find this anime.";
}
var descg = '';
if (config.LANG === 'SI') {
  descg = "එය ඔබගේ mention දුන් ඡායාරූපය ස්ටිකර් බවට පරිවර්තනය කරයි.";
} else {
  descg = "It converts your replied photo to sticker.";
}
var imgmsg2 = '';
if (config.LANG === 'SI') {
  imgmsg2 = "*ස්ටිකරයකට mention දෙන්න !*";
} else {
  imgmsg2 = "*Reply to a sticker !*";
}
var descg2 = '';
if (config.LANG === 'SI') {
  descg2 = "එය ඔබගේ mention දුන් sticker img බවට පරිවර්තනය කරයි.";
} else {
  descg2 = "It converts your replied sticker to img.";
}
var desct1 = '';
if (config.LANG === 'SI') {
  desct1 = "එය ලබා දී ඇති රූපය anime image එකක් බවට පරිවර්තනය කරයි.";
} else {
  desct1 = "It convert given image to anime image.";
}
var desct2 = '';
if (config.LANG === 'SI') {
  desct2 = "එය ලබා දී ඇති text එකක් ai image එකක් බවට පරිවර්තනය කරයි.";
} else {
  desct2 = "It convert given text to ai image.";
}
var imgmsg3 = '';
if (config.LANG === 'SI') {
  imgmsg3 = "*උදාහරණයක්: .imagine woman,hair cut collor red,full body,bokeh*";
} else {
  imgmsg3 = "*Example: .imagine woman,hair cut collor red,full body,bokeh*";
}
var imgmsg1 = '';
if (config.LANG === 'SI') {
  imgmsg1 = "*වීඩියෝවක් mention දෙන්න !*";
} else {
  imgmsg1 = "*Reply to a video !*";
}
var descg3 = '';
if (config.LANG === 'SI') {
  descg3 = "එය ඔබගේ mention දුන් වීඩියෝව audio බවට පරිවර්තනය කරයි.";
} else {
  descg3 = "It converts your replied video to audio [mp3].";
}
var N_FOUND = '';
if (config.LANG === 'SI') {
  N_FOUND = "*මට මෙම වීඩියෝව audio බවට පරිවර්තනය කළ නොහැකි විය :(*";
} else {
  N_FOUND = "*I cant convert this video to audio :(*";
}
var imgmsg4 = '';
if (config.LANG === 'SI') {
  imgmsg4 = "*කරුණාකර මට text එකක් දෙන්න !*";
} else {
  imgmsg4 = "*Please give me a text !*";
}
var descg1 = '';
if (config.LANG === 'SI') {
  descg1 = "එය text එකක් gif ස්ටිකරයක් බවට පරිවර්තනය කරයි";
} else {
  descg = "it converts a text to gif sticker.";
}
if (config.LANG === 'SI') {
  descdg = "එය text එකක් ස්ටිකරයක් බවට පරිවර්තනය කරයි";
} else {
  descdg = "it converts a text to sticker.";
}
if (config.LANG === 'SI') {
  cant = "මට මෙම රූපයේ පසුබිම ඉවත් කළ නොහැක.";
} else {
  cant = "I can't remove background on this image.";
}

const commandtoimg = {
  pattern: "toimg",
  react: '🔮',
  alias: ['photo', "stic"],
  desc: "Convert sticker to image",
  category: "convert",
  use: ".sticker <Reply to sticker>",
  filename: __filename
};

cmd(commandtoimg, async (client, message, chat, {
  from,
  quoted,
  reply
}) => {
  try {
    const isStickerMessage = quoted ? quoted.type === "stickerMessage" : false;

    if (isStickerMessage) {
      const randomFileName = getRandom('');
      const downloadedFile = await quoted.download(randomFileName);
      const fileInfo = await fileType.fromBuffer(downloadedFile);

      await fs.promises.writeFile('./' + fileInfo.ext, downloadedFile);

      const options = {
        quoted: message
      };

      await client.sendMessage(from, {
        image: fs.readFileSync('./' + fileInfo.ext),
        caption: "> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴀᴋᴀ-ᴍᴅ 👩‍💻"
      }, options);
      
      fs.unlinkSync('./' + fileInfo.ext);
    } else {
      return await reply("Please reply to a sticker to convert it into an image.");
    }
  } catch (error) {
    reply("*Error !!*");
    console.error(error);
  }
});
      
cmd({
  'pattern': "attp",
  'react': '✨',
  'alias': ['texttogif'],
  'desc': "Text to convert sticker",
  'category': "convert",
  'use': ".attp HI",
  'filename': __filename
}, async (client, message, from, {
  from: sender, 
  body: userInput, 
  isCmd, 
  command, 
  args, 
  q, 
  isGroup, 
  senderName, 
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
    if (!userInput) {
      return await reply("Please provide text to convert to a sticker.");
    }

    let responseBuffer = await getBuffer("https://api-fix.onrender.com/api/maker/attp?text=" + userInput);

    await client.sendMessage(sender, {
      'sticker': await videoToWebp(responseBuffer)
    }, {
      'quoted': message
    });
  } catch (error) {
    console.log(error);
  }
});

cmd({
  pattern: "toptt",
  react: '🔊',
  alias: ["toaudio", "tomp3"],
  desc: "convert to audio",
  category: "convert",
  use: ".toptt <Reply to video>",
  filename: __filename
}, async (bot, message, options, context) => {
  const {
    from,
    quoted,
    body,
    command,
    reply,
    sender,
  } = context;

  try {
    // Check if the quoted message is a video
    const isVideoMessage = quoted 
      ? quoted.type === "videoMessage" 
      : message.type === "videoMessage";

    if (!isVideoMessage) {
      await reply("Please reply to a video.");
      return;
    }

    // Download the video
    const videoData = quoted 
      ? await quoted.download() 
      : await message.download();

    // Convert video to audio using ffmpeg
    const audioData = await ffmpeg(videoData, [
      "-vn", // No video
      "-c:a", "libopus", 
      "-b:a", "128k", 
      "-vbr", "on", 
      "-compression_level", "10"
    ], "mp4", "opus");

    // Send the audio file
    const sentAudio = await bot.sendMessage(message.chat, {
      audio: audioData.options,
      mimetype: "audio/mpeg"
    }, { quoted: message });

    // Send a reaction to the conversion
    await bot.sendMessage(from, {
      react: {
        text: '🎼',
        key: sentAudio.key
      }
    });
  } catch (error) {
    await reply("*Error!!*");
    console.error(error);
  }
});

cmd({
  pattern: 'owner',
  desc: "I'm the owner",
  react: "👩‍💻",
  use: '.owner',
  category: "owner",
  filename: __filename
}, async (message, match, userData, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
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
    await message.sendMessage(from, {
      contacts: {
        displayName: "🧚‍♂️⃝𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳💕⃟*",
        contacts: [{
          vcard: "BEGIN:VCARD\nVERSION:3.0\nFN: 🧚‍♂️⃝𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳💕⃟*\nORG: Web Developer;\nTEL;type=CELL;type=VOICE;waid=94704243771:+94704243771\nEND:VCARD"
        }]
      },
      quoted
    });
  } catch (error) {
    console.error(error);
    reply(`${error}`);
  }
});
