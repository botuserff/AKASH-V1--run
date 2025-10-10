module.exports.config = {
  name: "adminProtect",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Mohammad Akash",
  description: "Auto protect admins from being removed"
};

module.exports.run = async function({ api, event, Threads }) {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const admins = threadInfo.adminIDs.map(id => id.id);
    const removedUser = event.logMessageData.leftParticipantFbId;
    const author = event.author;

    // যদি এডমিন একজন আরেক এডমিনকে রিমুভ করে
    if (admins.includes(removedUser) && admins.includes(author)) {

      // প্রথমে রিমুভ করা এডমিনকে (author) কিক করবে
      api.removeUserFromGroup(author, event.threadID, (err) => {
        if (err) {
          return api.sendMessage("❌ কিছু ভুল হয়েছে, কিন্তু বট ধরেছে পাকনামি!", event.threadID);
        } else {
          api.sendMessage(
            `»» NOTICE ««\n😏 ${event.senderName} বেশি চালাকি করতে গিয়ে ধরা খাইছে!\nতুই অন্য এডমিনকে রিমুভ করছিস, তাই তোকে গ্রুপ থেকে লাথি মেরে বের করে দেওয়া হলো 💥\n\n──────꯭─𝙲𝚑𝚊𝚝 𝙱𝚘𝚝 𝚋𝚢 Mohammad Akash─────`,
            event.threadID
          );

          // চাইলে রিমুভ হওয়া এডমিনকে আবার গ্রুপে অ্যাড করবে
          api.addUserToGroup(removedUser, event.threadID);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};
