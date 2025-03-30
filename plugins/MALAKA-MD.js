const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const config = require("../settings");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { DisconnectReason } = require("@whiskeysockets/baileys");

// Enhanced connection check with exponential backoff
const checkConnection = async (conn, maxRetries = 5) => {
    let retryCount = 0;
    const maxBackoff = 8000; // Maximum backoff time in ms
    
    const checkWithRetry = async () => {
        try {
            if (conn?.user && conn?.ws?.readyState === 1) {
                return true;
            }
            
            if (retryCount >= maxRetries) {
                throw new Error(`Max retries (${maxRetries}) exceeded`);
            }
            
            // Exponential backoff with jitter
            const backoff = Math.min(1000 * Math.pow(2, retryCount), maxBackoff);
            const jitter = Math.floor(Math.random() * 100);
            await new Promise(resolve => setTimeout(resolve, backoff + jitter));
            
            retryCount++;
            return await checkWithRetry();
        } catch (error) {
            console.error(`Connection check attempt ${retryCount} failed:`, error.message);
            throw error;
        }
    };
    
    return await checkWithRetry();
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

// AI reply section with improved handling
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const MAX_RESPONSE_LENGTH = 4000;

cmd({
    on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    try {
        const aiConfig = require('../lib/data/prompts.js');
        const genAI = new GoogleGenerativeAI(aiConfig.GEMINI_API_KEY);
        const triggerWord = body.split(' ')[0].toLowerCase();
        
        if (!aiConfig.AI_TRIGGERS[triggerWord]) return;

        let retries = 0;
        const sendWithRetry = async () => {
            try {
                if (!conn?.ws?.readyState === 1) {
                    throw new Error('Connection not ready');
                }

                await conn.sendPresenceUpdate('composing', from);
                
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
                    history: [{ role: "user", parts: aiConfig.SYSTEM_PROMPT }]
                });

                const result = await Promise.race([
                    chat.sendMessage(query),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('AI Timeout')), 30000)
                    )
                ]);

                const response = result.response.text();

                
                if (response.length > MAX_RESPONSE_LENGTH) {
                    const chunks = response.match(new RegExp(`.{1,${MAX_RESPONSE_LENGTH}}`, 'g'));
                    for (const chunk of chunks) {
                        await m.reply(chunk);
                        await new Promise(r => setTimeout(r, 500)); // Delay between chunks
                    }
                } else {
                    await m.reply(response);
                }

            } catch (error) {
                console.error(`Attempt ${retries + 1} failed:`, error);
                
                if (retries < MAX_RETRIES && 
                    (error.message.includes('Connection') || error.message.includes('Timeout'))) {
                    retries++;
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                    return sendWithRetry();
                }
                
                throw error;
            }
        };

        await sendWithRetry().catch(error => {
            console.error('ai eke error ekak bn', error);
            m.reply('පද්ධති දෝෂයක්! කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න 🙏');
        });

    } catch (error) {
        console.error('AI command eke error ekak:', error);
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
