module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "1.0.7",
  credits: "Mohammad Akash",
  description: "Premium Auto Welcome Message with New Member & Adder Tag"
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const addedMembers = logMessageData.addedParticipants || [];
  const adderID = logMessageData.author || null; // যে অ্যাড করেছে

  const adderName = adderID ? await Users.getNameUser(adderID) : "Admin";
  const adderMention = adderID ? [{ id: adderID, tag: adderName }] : [];

  for (let member of addedMembers) {
    const userName = await Users.getNameUser(member.userFbId);
    const mention = [{ id: member.userFbId, tag: userName }, ...adderMention];

    const msg = 
`💠━━━━━━━━━━━━━━━━💠
          ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
💠━━━━━━━━━━━━━━━━💠

👤 𝐇𝐞𝐲 ${userName}! 𝐖𝐞 𝐚𝐫𝐞 𝐬𝐨 𝐡𝐚𝐩𝐩𝐲 𝐭𝐨 𝐡𝐚𝐯𝐞 𝐲𝐨𝐮 𝐡𝐞𝐫𝐞 🎉  

🌟 𝐏𝐥𝐞𝐚𝐬𝐞 𝐟𝐨𝐥𝐥𝐨𝐰 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐫𝐮𝐥𝐞𝐬  
🔥 𝐁𝐞 𝐚𝐜𝐭𝐢𝐯𝐞 & 𝐫𝐞𝐬𝐩𝐞𝐜𝐭 𝐨𝐭𝐡𝐞𝐫𝐬  

🙌 𝐓𝐡𝐚𝐧𝐤𝐬 𝐭𝐨 𝐀𝐝𝐝𝐞𝐫: ${adderName} 💖

⚡ 𝐄𝐧𝐣𝐨𝐲 & 𝐒𝐭𝐚𝐲 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 ⚡

💠━━━━━━━━━━━━━━━━💠
       🤖 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭 𝐁𝐲 𝐀𝐤𝐚𝐬𝐡
💠━━━━━━━━━━━━━━━━💠`;

    api.sendMessage({ body: msg, mentions: mention }, threadID);
  }
};
