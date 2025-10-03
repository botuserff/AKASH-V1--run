module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.2",
  credits: "𝐀𝐤𝐚𝐬𝐡 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭",
  description: "গ্রুপ থেকে কেউ চলে গেলে সুন্দর নোটিফিকেশন দেখানো",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function({ api, event, Users, Threads }) {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const { threadID, author } = event;

  // থ্রেড ডেটা ও ইউজারের নাম লোড
  const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
  const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  // টাইপ অনুযায়ী মেসেজ
  const type = (author == event.logMessageData.leftParticipantFbId)
    ? `⚡️ {name} সওয়ারি! তুমি নিজেই গ্রুপ ছাড়লে 😢\nআশা করি আবার দেখা হবে 🙏`
    : `🚨 {name}, তুমি গ্রুপে থাকার যোগ্য নও 😎\nতাই তোমাকে এডমিনের সিদ্ধান্তে গ্রুপ থেকে বের করা হলো ⚡️`;

  // ফাইল পাথ
  const pathDir = join(__dirname, "Akash", "leaveGif");
  const gifPath = join(pathDir, "leave1.gif");
  if (!existsSync(pathDir)) mkdirSync(pathDir, { recursive: true });

  // কাস্টম মেসেজ চেক
  let msg = (typeof data.customLeave == "undefined") 
    ? type 
    : data.customLeave.replace(/\{name}/g, name);

  // GIF সহ বা ছাড়া
  const formPush = existsSync(gifPath)
    ? { body: msg, attachment: createReadStream(gifPath) }
    : { body: msg };

  return api.sendMessage(formPush, threadID);
};
