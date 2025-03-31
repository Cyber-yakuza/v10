const { cmd } = require('../lib/command');
const { runtime } = require('../lib/functions');
const axios = require('axios');
const yts = require("yt-search");
const config = require("../settings");
const commandPrefix = require("../settings");

cmd({
    pattern: "menu8",
    react: "🎶",
    desc: "Check bot owner.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, prefix, q, reply }) => {
    try {

        let teksnya = `kaveesha`;

    const buttonMenu = {
      title: "🔑 Select menu type",
      rows: [
        { title: "DOWNLOAD MENU", description: "Download commands", id: `.downmenu` },
        { title: "SEARCH MENU", description: "Search commands", id: `${commandPrefix}searchmenu` },
        { title: "CONVERT MENU", description: "Convert commands", id: `${commandPrefix}convertmenu` },
        { title: "MAIN MENU", description: "Convert commands", id: `${commandPrefix}mainmenu` },
        { title: "GROUP MENU", description: "Group commands", id: `${commandPrefix}groupmenu` },
        { title: "LOGO MENU", description: "Logo commands", id: `${commandPrefix}logomenu` },
        { title: "BUG MENU", description: "Bug commands", id: `${commandPrefix}bugmenu` },
        { title: "MOVIE MENU", description: "Movie commands", id: `${commandPrefix}moviemenu` },
        { title: "OTHER MENU", description: "Other commands", id: `${commandPrefix}othermenu` }
      ]
    };

    const buttonOptions = {
      title: "Click Here⎙",
      sections: [buttonMenu]
    };

    const buttonImage = { url:"https://i.ibb.co/Mkmvj2qP/5299.jpg" };
    const aliveButton = { displayText: "ALIVE" };
    const pingButton = { displayText: "PING" };

    const buttons = [
      { buttonId: `.alive`, buttonText: aliveButton },
      { buttonId: `.ping`, buttonText: pingButton },
      {
        buttonId: "action",
        buttonText: { displayText: "ini pesan interactiveMeta" },
        type: 4,
        nativeFlowInfo: {
          name: "single_select",
          paramsJson: JSON.stringify(buttonOptions)
        }
      }
    ];

      const messageOptions = {
        text: teksnya,
        footer: config.FOOTER,
        buttons: buttons,
        headerType: 1,
        viewOnce: true
      };
      await conn.sendMessage(from, messageOptions, { quoted: mek });


    } catch (e) {
        console.error(e);
        await reply("An error occurred. Please try again.");
    }
});
