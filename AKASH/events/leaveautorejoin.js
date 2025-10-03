module.exports.config = {
  name: "leaveautorejoin",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "Mohammad Akash",
  description: "Leave Noti + Auto Re-Add + Failed Add Notice"
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, author, logMessageData } = event;
  const leaverID = logMessageData.leftParticipantFbId || author;
  const leaverName = await Users.getNameUser(leaverID);
  const mention = [{ id: leaverID, tag: leaverName }];

  // 1️⃣ Leave Noti
  const leaveMsg = 
`💔━━━━━━━━━━━━━━━━💔
          ✨ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ✨
💔━━━━━━━━━━━━━━━━💔

👤 ${leaverName} 𝐡𝐚𝐬 𝐥𝐞𝐟𝐭 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 😢

⚡ 𝐃𝐨𝐧'𝐭 𝐰𝐨𝐫𝐫𝐲! 𝐈 𝐰𝐢𝐥𝐥 𝐭𝐫𝐲 𝐭𝐨 𝐫𝐞-𝐚𝐝𝐝 𝐲𝐨𝐮 ⚡

💠━━━━━━━━━━━━━━━━💠
       🤖 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 𝐁𝐲 𝐀𝐤𝐚𝐬𝐡
💠━━━━━━━━━━━━━━━━💠`;

  await api.sendMessage({ body: leaveMsg, mentions: mention }, threadID);

  // 2️⃣ Auto Re-Add
  try {
    api.addUserToGroup(leaverID, threadID, async (err) => {
      if(err) {
        // 3️⃣ Failed Add Notice
        const failMsg = 
`⚠️━━━━━━━━━━━━━━━━⚠️
          ✨ 𝐀𝐃𝐃 𝐅𝐀𝐈𝐋𝐄𝐃 ✨
⚠️━━━━━━━━━━━━━━━━⚠️

👤 ${leaverName} 𝐜𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐛𝐞 𝐫𝐞-𝐚𝐝𝐝𝐞𝐝 🚫

💡 𝐏𝐨𝐬𝐬𝐢𝐛𝐥𝐞 𝐫𝐞𝐚𝐬𝐨𝐧𝐬:
- 𝐏𝐫𝐢𝐯𝐚𝐜𝐲 𝐬𝐞𝐭𝐭𝐢𝐧𝐠𝐬
- 𝐁𝐥𝐨𝐜𝐤 𝐟𝐫𝐨𝐦 𝐆𝐫𝐨𝐮𝐩

📌 𝐏𝐥𝐞𝐚𝐬𝐞 𝐜𝐨𝐧𝐭𝐚𝐜𝐭 𝐭𝐡𝐞 𝐚𝐝𝐦𝐢𝐧 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐚𝐧𝐮𝐚𝐥𝐥𝐲

⚠️━━━━━━━━━━━━━━━━⚠️`;

        await api.sendMessage({ body: failMsg, mentions: mention }, threadID);
      } else {
        // Optional: Welcome back Noti
        const welcomeBackMsg = 
`🎉━━━━━━━━━━━━━━━━🎉
          ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐁𝐀𝐂𝐊 ✨
🎉━━━━━━━━━━━━━━━━🎉

👤 ${leaverName}, 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 𝐛𝐞𝐞𝐧 𝐫𝐞-𝐚𝐝𝐝𝐞𝐝 ✅

🔥 𝐄𝐧𝐣𝐨𝐲 & 𝐒𝐭𝐚𝐲 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ⚡

🎉━━━━━━━━━━━━━━━━🎉
       🤖 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 𝐁𝐲 𝐀𝐤𝐚𝐬𝐡
🎉━━━━━━━━━━━━━━━━🎉`;
        await api.sendMessage({ body: welcomeBackMsg, mentions: mention }, threadID);
      }
    });
  } catch(e) {
    console.log(e);
  }
};
