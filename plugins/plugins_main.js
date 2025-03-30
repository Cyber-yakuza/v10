const config = require("../settings");
const { cmd, commands } = require("../lib/command");
const os = require("os");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, Func, fetchJson } = require("../lib/functions");
const axios = require("axios");
const DYXT_NEWS = require("@dark-yasiya/news-scrap");
const newsScraper = new DYXT_NEWS();

const newsCache = {
  hiru: {},
  sirasa: {},
  derana: {},
  lankadeepa: {}
};

async function getHiruNews() {
  try {
    const hiruNews = await newsScraper.bbc();
    if (hiruNews.status) {
      const newsItem = hiruNews.result;
      return {
        title: newsItem.title,
        content: newsItem.desc,
        date: newsItem.date,
        url: newsItem.url,
        image: newsItem.image
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Hiru News:", error.message);
    return null;
  }
}

async function getSirasaNews() {
  try {
    const sirasaNews = await newsScraper.sirasa();
    if (sirasaNews.status) {
      const newsItem = sirasaNews.result;
      return {
        title: newsItem.title,
        content: newsItem.desc,
        date: newsItem.date,
        url: newsItem.url,
        image: newsItem.image
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Sirasa News:", error.message);
    return null;
  }
}

async function getDeranaNews() {
  try {
    const deranaNews = await newsScraper.ada();
    if (deranaNews.status) {
      const newsItem = deranaNews.result;
      return {
        title: newsItem.title,
        content: newsItem.desc,
        date: newsItem.date,
        url: newsItem.url,
        image: newsItem.image
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Derana News:", error.message);
    return null;
  }
}

async function getLankadeepaNews() {
  try {
    const lankadeepaNews = await newsScraper.lankadeepa();
    if (lankadeepaNews.status) {
      const newsItem = lankadeepaNews.result;
      return {
        title: newsItem.title,
        content: newsItem.desc,
        date: newsItem.date,
        url: newsItem.url,
        image: newsItem.image
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Lankadeepa News:", error.message);
    return null;
  }
}

async function sendNews(client, groupId, newsItem, newsSource) {
  if (!groupId) {
    console.error("Error: groupId is undefined in sendNews function.");
    return;
  }

  if (!newsCache[newsSource]) {
    newsCache[newsSource] = {};
  }

  if (!newsCache[newsSource][groupId]) {
    newsCache[newsSource][groupId] = '';
  }

  if (newsItem && newsCache[newsSource][groupId] !== newsItem.title) {
    newsCache[newsSource][groupId] = newsItem.title;

    let message = `📰 *${newsSource} News*\n\n*Title:* ${newsItem.title}\n\n*Description:* ${newsItem.content}\n\n*Published On:* ${newsItem.date}`;
    if (newsItem.url) {
      message += `\n\n*Read more:* ${newsItem.url}`;
    }
    message += "\n\n> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀*";

    try {
      if (newsItem.image) {
        await client.sendMessage(groupId, {
          image: { url: newsItem.image },
          caption: message
        });
      } else {
        await client.sendMessage(groupId, { text: message });
      }
    } catch (error) {
      console.error("Failed to send message to group " + groupId + ":", error.message);
    }
  }
}

async function checkAndPostNews(client, groupId) {
  if (!groupId) {
    console.error("Error: groupId is undefined in checkAndPostNews function.");
    return;
  }

  const hiruNews = await getHiruNews();
  const sirasaNews = await getSirasaNews();
  const deranaNews = await getDeranaNews();
  const lankadeepaNews = await getLankadeepaNews();

  await sendNews(client, groupId, hiruNews, "hiru");
  await sendNews(client, groupId, sirasaNews, "sirasa");
  await sendNews(client, groupId, deranaNews, "derana");
  await sendNews(client, groupId, lankadeepaNews, "lankadeepa");
}

function startNewsService(client, groupId) {
  if (!groupId) {
    console.error("Error: groupId is undefined.");
    return;
  }

  if (startNewsService.interval) {
    clearInterval(startNewsService.interval);
  }

  startNewsService.interval = setInterval(async () => {
    try {
      await checkAndPostNews(client, groupId);
    } catch (error) {
      console.error("Error in startNewsService:", error.message);
    }
  }, 60000);
}

async function getTikTokVideos() {
  try {
    const searchTerms = ["Boot status sinhala","joint eka wadan", "Black lyrics  sinhala","sri lanka trending video", "hint wadan srilanka", "romantick vido srilanka","sinhala status wadan", "sinhala joke videos", "Motivation video sinhala"];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const response = await fetchJson(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(randomTerm)}`);

    if (response && response.status && Array.isArray(response.data) && response.data.length > 0) {
      const randomIndex = Math.floor(Math.random() * response.data.length);
      const video = response.data[randomIndex];
      return {
        title: video.title || "Asitha",
        url: video.nowm || null
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching TikTok Videos:", error.message);
    return null;
  } 
}

async function sendTikTokVideo(client, groupId, video) {
  if (video) {
    const caption = `> 🥷ᴘᴏᴡᴇʀᴅ ʙʏ ᴄʏʙᴇʀ ʏᴀᴋᴜᴢᴀ ᴛᴇᴀᴍ💀*`;
    await client.sendMessage(groupId, {
      video: { url: video.url },
    
      caption: caption
    });
  }
}

async function checkAndPostTikTok(client, groupId) {
  const video = await getTikTokVideos();
  if (video) {
    await sendTikTokVideo(client, groupId, video);
  }
}

function startTikTokService(client, groupId) {
  if (startTikTokService.interval) {
    clearInterval(startTikTokService.interval);
  }

  const randomInterval = Math.floor(Math.random() * 599001) + 1000;
  startTikTokService.interval = setInterval(async () => {
    try {
      if (groupId) {
        await checkAndPostTikTok(client, groupId);
      }
    } catch (error) {
      console.error("Error in startTikTokService:", error.message);
    }
  }, randomInterval);
}

module.exports = {
  startTikTokService,
  startNewsService
};
