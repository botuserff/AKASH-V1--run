module.exports.config = {
  name: "god",
  eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
  version: "1.0.1",
  credits: "𝐀𝐤𝐚𝐬𝐡 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭",
  description: "Record bot activity notifications with thread name!",
  envConfig: {
    enable: true
  }
};

module.exports.run = async function({ api, event, Threads }) {
  const logger = require("../../utils/log");
  if (!global.configModule[this.config.name].enable) return;

  const threadID = event.threadID;
  const authorID = event.author;
  const threadData = await Threads.getData(threadID);
  const threadName = threadData.name || "Unknown Thread Name";

  let task = "";

  switch (event.logMessageType) {
    case "log:thread-name": {
      const oldName = threadData.name || "Unknown Name";
      const newName = event.logMessageData.name || "Unknown Name";
      task = `User changed group name from: '${oldName}' to: '${newName}'`;
      await Threads.setData(threadID, { name: newName });
      break;
    }
    case "log:subscribe": {
      if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        task = "The user added the bot to a new group!";
      }
      break;
    }
    case "log:unsubscribe": {
      if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
        task = "The user kicked the bot out of the group!";
      }
      break;
    }
    default:
      return;
  }

  if (!task) return;

  // Timestamp
  const timestamp = new Date().toLocaleString("en-GB", { hour12: false });

  // Formatted message
  const formReport = `
╔══════════════════════════════╗
║      🛡️ 𝐀𝐤𝐚𝐬𝐡 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 🛡️       ║
╠══════════════════════════════╣
║ 🔹 Thread ID: ${threadID}      ║
║ 🔹 Thread Name: '${threadName}' ║
║ 🔹 Action: ${task}             ║
║ 🔹 Action created by userID: ${authorID} ║
║ 🔹 Timestamp: ${timestamp}      ║
╚══════════════════════════════╝
`;

  const godID = "100001039692046"; // আপনার user ID বা admin ID

  try {
    await api.sendMessage(formReport, godID);
  } catch (error) {
    logger(formReport, "[ Logging Event ]");
  }
};
