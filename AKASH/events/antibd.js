module.exports.config = {
  name: "antibd",
  eventType: ["log:user-nickname"],
  version: "1.0.0",
  credits: "Mohammad Akash",
  description: "Against changing Bot's nickname"
};

module.exports.run = async function({ api, event, Users, Threads }) {
  var { logMessageData, threadID, author } = event;
  var botID = api.getCurrentUserID();
  var { BOTNAME, ADMINBOT } = global.config;

  // বটের আসল নাম বের করা
  var { nickname } = await Threads.getData(threadID, botID);
  var nickname = nickname ? nickname : BOTNAME;

  // যদি কেউ বটের নিকনেম চেঞ্জ করে
  if (logMessageData.participant_id == botID && author != botID && !ADMINBOT.includes(author) && logMessageData.nickname != nickname) {
    
    // বটের আসল নিকনেম ফিরিয়ে দেওয়া
    api.changeNickname(nickname, threadID, botID);

    // ইউজারের ইনফো আনা
    var info = await Users.getData(author);

    // Premium Banner Style আউটপুট
    return api.sendMessage({
      body: `╔════════════════════════════╗
         ✨ 𝐀𝐍𝐓𝐈 - 𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 𝐒𝐘𝐒𝐓𝐄𝐌 ✨
╚════════════════════════════╝

👤 ইউজার: ${info.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ সতর্কবার্তা: নিকনেম পরিবর্তন ব্যর্থ ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 নিয়মাবলী:
   ▪ শুধুমাত্র আমার বস 👑 আকাশ  
     নিকনেম পরিবর্তন করার অধিকার রাখে 🖐

━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 টিপস: চেষ্টা কইরা লাভ নাই ভাই 😹  
━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 সিকিউরিটি লক অন করা আছে 🔒
`
    }, threadID);
  }
};
