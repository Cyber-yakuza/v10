const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const config = require("../settings");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Add retry utility
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
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

//auto reply 
cmd({
  on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../lib/data/autoreply.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_REPLY === 'true') {
                //if (isOwner) return;        
                await m.reply(data[text])
            
            }
        }
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

// AI reply section with retry logic
cmd({
    on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AI_REPLAY === 'true' && body) {
        try {
            await retryOperation(async () => {
                const prompt = body;
                const systemPromptPath = path.join(__dirname, '../lib/data/SYSTEM_PROMPT.json');
                const systemPrompts = JSON.parse(fs.readFileSync(systemPromptPath, 'utf8'));
                
                const genAI = new GoogleGenerativeAI("AIzaSyDS65VY1zHbu2VPm0cnSAAK_eq4MAuER5E");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: systemPrompts.default }, { text: prompt }]}]
                });

                if (!conn.connected) {
                    throw new Error('Connection lost');
                }

                const response = result.response.text();
                await m.reply(response);
            });
        } catch (error) {
            console.error('AI Error:', error);
            if (error.message.includes('Connection')) {
                await m.reply('Connection lost. Please try again in a moment.');
            } else {
                await m.reply('sorry mata den mg karanna be');
            }
        }
    }
});

// Add connection status check
cmd({
    on: "connection.update"
}, async (conn, update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 428;
        if (shouldReconnect) {
            await conn.connect();
        }
    }
});
