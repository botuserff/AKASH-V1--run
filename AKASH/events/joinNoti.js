module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "3.0.0",
  credits: "Mohammad Akash",
  description: "Stylish Premium welcome message with media & highlight",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.onLoad = function () {
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const paths = [
    join(__dirname, "cache", "joinGif"),
    join(__dirname, "cache", "randomgif")
  ];
  for (const path of paths) {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }
};

module.exports.run = async function({ api, event }) {
  const fs = require("fs");
  const path = require("path");
  const { threadID, logMessageData } = event;
  
  const botPrefix = global.config.PREFIX || "/";
  const botName = global.config.BOTNAME || "Mohammad Akash Chat Bot";

  // যদি বট নিজেই যোগ হয়
  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());
    return api.sendMessage(
      `🌟 আমি এখানে উপস্থিত! ${botName} আপনাদের সাথে আড্ডা দিতে প্রস্তুত! 🌟`,
      threadID
    );
  }

  try {
    const { createReadStream, readdirSync } = global.nodemodule["fs-extra"];
    const threadInfo = await api.getThreadInfo(threadID);
    const { threadName, participantIDs } = threadInfo;

    const addedUsers = logMessageData.addedParticipants.map(p => ({
      id: p.userFbId,
      name: `✨ ${p.fullName} ✨` // স্টাইলিশ হাইলাইট
    }));

    // Added By
    const addedBy = logMessageData.actorFbId
      ? (await api.getUserInfo(logMessageData.actorFbId))[logMessageData.actorFbId].name
      : "Unknown";

    const memLength = participantIDs.length;

    // Stylish Premium Welcome Message
    let msg = `
╔═════════════════════════╗
🌺💖 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐎𝐔𝐑 𝐆𝐑𝐎𝐔𝐏 💖🌺
╚═════════════════════════╝

👋 হ্যালো ${addedUsers.map(u => u.name).join(', ')}!
আপনি আমাদের প্রিমিয়াম গ্রুপে ${memLength} নম্বর মেম্বার হিসেবে যোগ হয়েছেন।  

🌟 Added By: ${addedBy} 🌟

📌 গ্রুপ: ${threadName}  
📌 এখানে হাসি-মজা, বন্ধুত্ব ও ভালোবাসা উপভোগ করুন।  

✨ নিয়মাবলী:
⚡ সদ্ভাব বজায় রাখুন।  
⚡ খারাপ ব্যবহার বা উস্কানি করবেন না।  
⚡ গ্রুপের রুলস মেনে চলুন।  

🌸 প্রিয় সদস্য, আশা করি আপনি এখানে আনন্দ উপভোগ করবেন। 🌸

💌 কোন সমস্যা বা সাহায্যের জন্য যোগাযোগ করুন:  
➤ Messenger: https://m.me/arakashiam
➤ WhatsApp: https://wa.me/01933165880

╔═════════════════════════╗
      🤖 ${botName} 🤖
╚═════════════════════════╝
`;

    // র‍্যান্ডম গিফ/ভিডিও/ছবি
    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0
      ? createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)]))
      : null;

    return api.sendMessage(
      randomFile ? { body: msg, attachment: randomFile } : { body: msg },
      threadID
    );

  } catch (e) {
    console.error(e);
  }
};
