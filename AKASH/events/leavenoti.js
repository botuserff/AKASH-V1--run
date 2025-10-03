module.exports.config = {
  name: "leavenoti",
  eventType: ["log:unsubscribe"],
  version: "1.1.0",
  credits: "Mohammad Akash",
  description: "Stylish Leave Notification Only (No Re-Add)"
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, author, logMessageData } = event;
  const leaverID = logMessageData.leftParticipantFbId || author;
  const leaverName = await Users.getNameUser(leaverID);
  const mention = [{ id: leaverID, tag: leaverName }];

  const leaveMsg = 
`💔━━━━━━━━━━━━━━━━💔
          ✨ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ✨
💔━━━━━━━━━━━━━━━━💔

👤 𝐌𝐞𝐦𝐛𝐞𝐫: ${leaverName}

😢 𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐛𝐞𝐢𝐧𝐠 𝐚 𝐩𝐚𝐫𝐭 𝐨𝐟 𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩.

💌 𝐖𝐞 𝐡𝐨𝐩𝐞 𝐭𝐨 𝐬𝐞𝐞 𝐲𝐨𝐮 𝐛𝐚𝐜𝐤 𝐬𝐨𝐨𝐧!

💠━━━━━━━━━━━━━━━━💠
       🤖 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 𝐁𝐲 𝐀𝐤𝐚𝐬𝐡
💠━━━━━━━━━━━━━━━━💠`;

  await api.sendMessage({ body: leaveMsg, mentions: mention }, threadID);
};
