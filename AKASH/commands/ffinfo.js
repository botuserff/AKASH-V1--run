const axios = require('axios');

module.exports.config = {
  name: "ffinfo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Akash",
  description: "Fetch Free Fire player info by UID",
  commandCategory: "game",
  usages: "[uid] [region]",
  cooldowns: 5
};

module.exports.run = async({ api, event, args }) => {
  // Check if UID and Region are provided
  if(!args[0] || !args[1]) 
    return api.sendMessage("Use: /ffinfo [UID] [Region] (e.g., /ffinfo 2099807760 BD)", event.threadID, event.messageID);

  const uid = args[0];
  const region = args[1].toUpperCase();

  try {
    const response = await axios.get(`https://ff-info.cyberbot.top/player-info?uid=${uid}&region=${region}`);
    const data = response.data;

    if(!data || !data.nickname) 
      return api.sendMessage("Player not found or UID/Region is incorrect.", event.threadID, event.messageID);

    // Prepare message
    let msg = `🎮 Free Fire Player Info\n\n`;
    msg += `📝 Nickname: ${data.nickname}\n`;
    msg += `📊 Level: ${data.level}\n`;
    msg += `🏆 Rank: ${data.rank}\n`;
    msg += `👥 Guild: ${data.guild_name || "None"}\n`;
    msg += `⚔️ Kills: ${data.total_kills}\n`;
    msg += `🎮 Matches Played: ${data.matches_played}\n`;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Error fetching player info. Please check UID & Region again.", event.threadID, event.messageID);
  }
};
