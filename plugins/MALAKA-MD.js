const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const config = require("../settings");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { DisconnectReason } = require("@whiskeysockets/baileys");

// Add connection status check
const checkConnection = (conn) => {
    return new Promise((resolve) => {
        if (conn?.user && conn?.ws?.readyState === 1) {
            resolve(true);
        } else {
            setTimeout(() => checkConnection(conn).then(resolve), 1000);
        }
    });
};

//auto_voice
cmd({
  on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../lib/data/autovoice.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_VOICE === 'true') {
                //if (isOwner) return;        
                await conn.sendPresenceUpdate('recording', from);
                await conn.sendMessage(from, { audio: { url: data[text] }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
            }
        }
    }                
});

//auto sticker 
cmd({
  on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../lib/data/autosticker.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_STICKER === 'true') {
                //if (isOwner) return;        
                await conn.sendMessage(from,{sticker: { url : data[text]},package: 'yourName'},{ quoted: mek })   
            
            }
        }
    }                
});

//ai reply section
cmd({
  on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    try {
        
        await checkConnection(conn);
        
        const aiConfig = require('../lib/data/prompts.js');
        const genAI = new GoogleGenerativeAI(aiConfig.GEMINI_API_KEY);
        
        const triggerWord = body.split(' ')[0].toLowerCase();
        
        if (aiConfig.AI_TRIGGERS[triggerWord]) {
            try {
                if (conn?.ws?.readyState !== 1) {
                    throw new Error('Connection lost');
                }

                await conn.sendPresenceUpdate('composing', from)
                    .catch(() => null);
                
                const query = body.split(' ').slice(1).join(' ');
                if (!query) return m.reply('කරුණාකර මට පණිවිඩයක් ලබා දෙන්න 🙏');
                
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-pro",
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                });
                
                const chat = model.startChat({
                    history: [{
                        role: "user", 
                        parts: aiConfig.SYSTEM_PROMPT
                    }]
                });
                
                const result = await chat.sendMessage(query);
                const response = result.response.text();
                
                if (conn?.ws?.readyState === 1) {
                    await m.reply(response)
                        .catch(e => console.error('Reply failed:', e));
                }
            } catch (error) {
                console.error('AI Error:', error);
                if (conn?.ws?.readyState === 1) {
                    await m.reply('පද්ධති දෝෂයක්! පසුව නැවත උත්සාහ කරන්න 🙏')
                        .catch(() => null);
                }
            }
        }
    } catch (error) {
        console.error('Fatal error:', error);
    }
});

const commandbody = {
  on: "body"
};

cmd(commandbody, async (
  bot, message, chat, {
    from,
    prefix,
    l,
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

  if (config.AUTO_REACT === "true") {
    const reactions = [
      '❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗',
      '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😌', '😉', '🤗', '😊',
      '🎊', '🎉', '🎁', '🎈', '👋'
    ];

    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

    const reactionMessage = {
      react: {
        text: randomReaction,
        key: message.key
      }
    };

    bot.sendMessage(from, reactionMessage);
  }
});

// Composing (Auto Typing)
cmd({
    on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AUTO_TYPING === 'true') {
        await conn.sendPresenceUpdate('composing', from); // send typing 
    }
});

cmd({
    on: "body"
  },    
  async (conn, mek, m, { from, body, isOwner }) => {
    if (body.toLowerCase() || text.toLowerCase()) {
              if (config.FAKE_RECORDING === 'true') {
                  //if (isOwner) return;        
                  await conn.sendPresenceUpdate('recording', from);
              }      
            }         
  });
