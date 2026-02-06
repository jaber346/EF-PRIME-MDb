async function ping(DevMessyBot, m, msg, args, extra) {
    const start = Date.now();
    
    await DevMessyBot.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
    
    const timestamp = Date.now();
    const latency = timestamp - start;
    
    const pingMsg = `
╭──♕.𝗧𝗢𝗝𝗜 𝗭𝗘𝗡𝗜𝗡.♕──⊷
│⚡𝗟𝗮𝘁𝗲𝗻𝗰𝗲: ${latency}𝗠𝘀
╰───────────────────⊷`;
    
    await DevMessyBot.sendMessage(m.chat, {
        text: pingMsg,  
    }, { quoted: m });
}

export default 
    { 
        name: "ping", 
        run: ping 
    }