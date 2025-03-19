const { cmd } = require('../lib/command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

        
cmd({
  pattern: "sinhalasub",
  react: '🎬',
  category: "download",
  use: ".sinhalasub",
  desc: "Search movies on sinhalasub and get download links",
  filename: __filename
}, async (client, message, args, {
  from: sender,
  isMe: isBotNumber,
  isOwner: isOwner,
  q: query,
  reply: reply
}) => {
  try {
    // Check if the search query is provided
    if (!query || query.trim() === '') {
      return await reply("*Please provide a search query! (e.g., Deadpool)*");
    }

    // Check if the command is executed by the bot number or owner
    if (!isBotNumber && !isOwner) {
      return await reply("*Only Bot Number Can Movie Download !!!*");
    }

    // Fetch search results from the API
    const searchResults = await fetchJson(`https://mr-rashmika-apis.vercel.app/api/sl-sub-search?query=${query}&apikey=MR.RASHMIKA`);
    const results = searchResults.data.data;

    // Check if there are any results
    if (!Array.isArray(results) || results.length === 0) {
      return await reply("No results found for: " + query);
    }

    // Limit results to the first 10
    const topResults = results.slice(0, 10);
    let resultMessage = `🗨️ *sinhalasub* "${query}":\n\n`;

    // Format the results into a message
    topResults.forEach((movie, index) => {
      const title = movie.title || "No title available";
      const link = movie.link || "No link available";
      const thumbnail = movie.thumbnail || 'https://via.placeholder.com/150';
      resultMessage += `*${index + 1}.* ${title}\n🔗 Link: ${link}\n`;
      resultMessage += `📽️MOVIE Thumbnail: ${thumbnail}\n\n`;
    });

    // Send the search results as a message with an image
    const sentMessage = await client.sendMessage(message.chat, {
      image: {
        url: topResults[0].thumbnail
      },
      caption: resultMessage
    }, {
      quoted: message
    });

    const messageId = sentMessage.key.id;

    // Function to handle movie details and download links
    const handleMovieDetails = async (msg, selectedIndex) => {
      const selectedMovie = topResults[selectedIndex - 1];
      const movieInfo = await fetchJson(`https://mr-rashmika-apis.vercel.app/api/slsub-movie-info?url=${encodeURIComponent(selectedMovie.link)}&apikey=MR.RASHMIKA`);

      try {
        const movieData = movieInfo.data;
        const downloadLinks = movieData.downloadLinks || [];

        if (downloadLinks.length === 0) {
          return await reply("No download links found.");
        }

        let downloadMessage = `🎥 *${movieData.title}*\n\n*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*\n`;
        downloadLinks.forEach((link, index) => {
          downloadMessage += `*${index + 1}.* ${link.quality} - ${link.size}\n🔗 Link: ${link.link}\n\n`;
        });

        const movieMessage = await client.sendMessage(message.chat, {
          image: {
            url: selectedMovie.thumbnail
          },
          caption: downloadMessage
        }, {
          quoted: msg
        });

        const movieMessageId = movieMessage.key.id;

        // Function to handle direct download links
        const handleDirectDownload = async (msg, selectedLinkIndex) => {
          const selectedLink = downloadLinks[selectedLinkIndex - 1];
          const directLink = selectedLink.link;
          const directDownloadInfo = await fetchJson(`https://mr-rashmika-apis.vercel.app/api/slsub-direct-link?url=${encodeURIComponent(directLink)}&apikey=MR.RASHMIKA`);
          const downloadLink = directDownloadInfo.data.downloadLink;
          const fileName = downloadLink.split('/').pop();

          await client.sendMessage(sender, {
            react: {
              text: '⬇️',
              key: message.key
            }
          });

          const pixelDrainLink = `https://pixeldrain.com/api/file/${fileName}`;

          await client.sendMessage(sender, {
            react: {
              text: '⬆',
              key: message.key
            }
          });

          await client.sendMessage(sender, {
            document: {
              url: pixelDrainLink
            },
            mimetype: "video/mp4",
            fileName: `${movieData.title} - ${selectedLink.quality}.mp4`,
            caption: `${movieData.title}\nQuality: ${selectedLink.quality}\n\n*㋛ 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 〽️M*`
          }, {
            quoted: msg
          });

          await client.sendMessage(sender, {
            react: {
              text: '✅',
              key: message.key
            }
          });
        };

        // Listen for user selection of download links
        client.ev.on('messages.upsert', async (update) => {
          const msg = update.messages[0];
          if (!msg.message) {
            return;
          }

          const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
          const isReply = msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo.stanzaId === movieMessageId;

          if (isReply) {
            const selectedIndex = parseInt(text.trim());
            if (!isNaN(selectedIndex) && selectedIndex > 0 && selectedIndex <= downloadLinks.length) {
              handleDirectDownload(msg, selectedIndex);
            } else {
              await reply("Invalid selection. Please reply with a valid number.");
            }
          }
        });
      } catch (error) {
        console.error("Error fetching movie details:", error);
        await reply("Sorry, something went wrong while fetching the movie details.");
      }
    };

    // Listen for user selection of search results
    client.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0];
      if (!msg.message) {
        return;
      }

      const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReply) {
        const selectedIndex = parseInt(text.trim());
        if (!isNaN(selectedIndex) && selectedIndex > 0 && selectedIndex <= topResults.length) {
          handleMovieDetails(msg, selectedIndex);
        } else {
          await reply("Invalid selection. Please reply with a valid number.");
        }
      }
    });
  } catch (error) {
    console.error("Error in sinhala command:", error);
    await reply("Sorry, something went wrong. Please try again later.");
  }
});
