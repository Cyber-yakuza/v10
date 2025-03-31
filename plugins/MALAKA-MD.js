const { cmd } = require("../lib/command");
const fs = require("fs");
const path = require("path");
const config = require("../settings");
const axios = require("axios");
const EventEmitter = require('events');

// Increase max listeners to prevent warnings
EventEmitter.defaultMaxListeners = 100;

// Add debug logging
const debugLog = (msg, error = null) => {
    console.log(`[DEBUG] ${msg}`);
    if (error) console.error('[ERROR]', error);
};

// Add retry utility with better error handling
const retryOperation = async (operation, maxRetries = 2) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            debugLog(`Retry ${i + 1}/${maxRetries} failed`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
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
        await conn.sendPresenceUpdate('composing', from); 
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

// AI reply section
cmd({
    on: "body"
},    
async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AI_REPLAY === 'true' && body) {
        try {
            // Check if message is from the bot itself
            if (m.key.fromMe) return;
            
            // Check if message is from another bot
            if (m.key.id && (m.key.id.startsWith('BAE5') || m.key.id.startsWith('3EB0'))) return;

            const prompt = body;
            const systemPromptPath = path.join(__dirname, '../lib/data/SYSTEM_PROMPT.json');
            
            if (!fs.existsSync(systemPromptPath)) {
                throw new Error('System prompt file not found');
            }

            const systemPrompts = JSON.parse(fs.readFileSync(systemPromptPath, 'utf8'));
            
            // Show typing status
            await conn.sendPresenceUpdate('composing', from);

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompts.default
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            }, {
                headers: {
                    'Authorization': 'Bearer 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',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data?.choices?.[0]?.message?.content) {
                throw new Error('Empty response from AI');
            }

            const aiResponse = response.data.choices[0].message.content;
            
            // Clear typing status and send response
            await conn.sendPresenceUpdate('paused', from);
            await m.reply(aiResponse);

        } catch (error) {
            console.error('AI Error:', error?.response?.data || error);
            
            if (error?.response?.status === 429) {
                await m.reply('🤖 API කෝටාව ඉක්මවා ඇත, කරුණාකර විනාඩි කිහිපයකින් නැවත උත්සාහ කරන්න.');
            } else if (error?.response?.status === 401) {
                await m.reply('⚠️ API යතුර වලංගු නැත, කරුණාකර පරිපාලක හා සම්බන්ධ වන්න.');
            } else if (error.message?.includes('Connection')) {
                await m.reply('🔌 සම්බන්ධතා දෝෂයකි, කරුණාකර මොහොතකින් නැවත උත්සාහ කරන්න.');
            } else {
                await m.reply('❌ AI පද්ධතියේ දෝෂයකි, කරුණාකර පසුව උත්සාහ කරන්න.');
            }
        }
    }
});

// Improved connection handler
cmd({
    on: "connection.update"
}, async (conn, update) => {
    const { connection, lastDisconnect } = update;
    debugLog(`Connection state: ${connection}`);

    if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 428;
        debugLog(`Disconnected, should reconnect: ${shouldReconnect}`);
        
        if (shouldReconnect) {
            try {
                await conn.connect();
                debugLog('Reconnected successfully');
            } catch (error) {
                debugLog('Reconnection failed', error);
                // Wait before next retry
                setTimeout(() => conn.connect(), 5000);
            }
        }
    } else if (connection === 'open') {
        debugLog('Connection established');
    }
});
