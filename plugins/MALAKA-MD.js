const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const config = require("../settings");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { DisconnectReason } = require("@whiskeysockets/baileys");

// Improve connection check with status and timeout
const checkConnection = (conn, maxRetries = 3, retryDelay = 1000) => {
    return new Promise((resolve, reject) => {
        let retries = 0;
        
        const check = () => {
            if (conn?.user && conn?.ws?.readyState === 1) {
                resolve(true);
            } else if (retries >= maxRetries) {
                reject(new Error('Connection check failed after max retries'));
            } else {
                retries++;
                setTimeout(check, retryDelay);
            }
        };
        
        check();
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
        
        await checkConnection(conn).catch(error => {
            throw new Error(`Connection check failed: ${error.message}`);
        });
        
        const aiConfig = require('../lib/data/prompts.js');
        const genAI = new GoogleGenerativeAI(aiConfig.GEMINI_API_KEY);
        
        const triggerWord = body.split(' ')[0].toLowerCase();
        
        if (aiConfig.AI_TRIGGERS[triggerWord]) {
            try {
                
                if (conn?.ws?.readyState !== 1) {
                    throw new Error('Connection not ready');
                }

                await conn.sendPresenceUpdate('composing', from)
                    .catch(() => console.log('Failed to send presence update'));
                
                const query = body.split(' ').slice(1).join(' ');
                if (!query) return m.reply('කරුණාකර මට පණිවිඩයක් ලබා දෙන්න 🙏');
                
                
                await checkConnection(conn, 2, 500);
                
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
                } else {
                    throw new Error('Connection lost before sending response');
                }
            } catch (error) {
                console.error('AI Error:', error);
                if (conn?.ws?.readyState === 1) {
                    await m.reply('සම්බන්ධතා දෝෂයක්! කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න 🙏')
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
