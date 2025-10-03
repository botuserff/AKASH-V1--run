module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "Chat Bot By Akash",
  description: "Prevent members from leaving without admin permission"
};

module.exports.run = async ({ event, api, Threads, Users }) => {
  const threadID = event.threadID;
  const data = (await Threads.getData(threadID)).data || {};

  // Anti-out check
  if (data.antiout === false) return;
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const leftID = event.logMessageData.leftParticipantFbId;
  const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

  const type = (event.author == leftID) ? "self-separation" : "kicked";

  if (type === "self-separation") {
    api.addUserToGroup(leftID, threadID, (error, info) => {
      if (error) {
        api.sendMessage(
          `╔══════════════════════════════════╗
║       🌟 Chat Bot By Akash 🌟        ║
╠══════════════════════════════════╣
║ ❌ নাম: ${name}                       ║
║ ⚠️ ব্যর্থ! Privacy/Block সমস্যা 😔      ║
║ 🔒 তোকে আবার এড করা সম্ভব হয়নি।          ║
║ 💡 পরবর্তী চেষ্টা করুন অথবা এডমিনের সাথে যোগাযোগ করুন।║
╚══════════════════════════════════╝`,
          threadID
        );
      } else {
        api.sendMessage(
          `╔══════════════════════════════════╗
║       🌟 Chat Bot By Akash 🌟        ║
╠══════════════════════════════════╣
║ 👤 নাম: ${name}                     ║
║ 💥 তুমি নিজেই চলে গেলি 😎            ║
║ 🔒 অনুমতি ছাড়া গ্রুপ ত্যাগ করা যাবে না।║
║ ⚡ Boss Mode Activated! তোকে আবার ফিরিয়ে আনা হলো 💪 ║
╚══════════════════════════════════╝`,
          threadID
        );
      }
    });
  } else if (type === "kicked") {
    api.sendMessage(
      `╔══════════════════════════════════╗
║       🌟 Chat Bot By Akash 🌟        ║
╠══════════════════════════════════╣
║ 👤 নাম: ${name}                     ║
║ ⚠️ এডমিন Exit Button চাপল! 🚪       ║
║ 🚫 অনুমতি ছাড়া গ্রুপ ছাড়ার চেষ্টা নিষিদ্ধ।║
║ 🔥 সাবধান! Boss এর নজরে আছে 👁️        ║
╚══════════════════════════════════╝`,
      threadID
    );
  }
};
