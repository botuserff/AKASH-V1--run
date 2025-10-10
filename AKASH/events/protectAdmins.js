module.exports.config = {
  name: "protectAdmins",
  eventType: ["log:thread-admins"],
  version: "1.3.0",
  credits: "Mohammad Akash",
  description: "If an admin is demoted, bot re-promotes and kicks the remover with stylish messages"
};

module.exports.run = async ({ event, api, Users }) => {
  try {
    const botID = api.getCurrentUserID();
    const actorId = event.author; // যে ব্যক্তি ডিমোট করেছে
    if (!actorId || String(actorId) === String(botID)) return;

    const data = event.logMessageData || {};
    let removedAdmins = [];

    // সম্ভাব্য ফিল্ড চেক
    if (Array.isArray(data.removedAdminIDs)) removedAdmins = removedAdmins.concat(data.removedAdminIDs);
    if (Array.isArray(data.adminsRemoved)) removedAdmins = removedAdmins.concat(data.adminsRemoved);
    if (data.ADMIN_EVENT && Array.isArray(data.ADMIN_EVENT.targetIDs)) removedAdmins = removedAdmins.concat(data.ADMIN_EVENT.targetIDs);

    removedAdmins = Array.from(new Set(removedAdmins.map(id => String(id))));
    if (removedAdmins.length === 0) return;
    if (removedAdmins.includes(String(actorId))) return; // self-demote হলে কিছু না করা

    // ডিমোট হওয়া অ্যাডমিনকে পুনঃঅ্যাডমিন বানানোর চেষ্টা
    for (const adminId of removedAdmins) {
      api.changeAdminStatus(adminId, event.threadID, true, (err) => {
        if (err) console.log(`Failed to re-promote ${adminId} as admin:`, err);
        else console.log(`${adminId} re-promoted as admin successfully`);
      });
    }

    // কিক করার জন্য নাম নেওয়া
    const actorName = global.data?.userName?.get(actorId) || await Users.getNameUser(actorId);
    const removedNames = await Promise.all(removedAdmins.map(async id => {
      return global.data?.userName?.get(id) || await Users.getNameUser(id).catch(() => id);
    }));
    const targetsText = removedNames.join(", ");

    // স্টাইলিশ মেসেজ
    const messages = [
      `🔥 ওহ না! ${actorName} 😱\nতুই ${targetsText} কে অ্যাডমিন থেকে সরাইছিস!\nআমার কাছে ধরা পড়েছিস… তাই তোকে গ্রুপ থেকে কিক করলাম! 🚫💥`,
      `⚡️ Alert! ⚡️\nHey ${actorName} 😎, তুমি ${targetsText} কে অ্যাডমিন থেকে সরালে?\n😏 মজা হয়ে গেল! এখন তোকে 👊 গ্রুপ থেকে কিক করলাম!\n💀 বট অ্যাডমিন প্রোটেকশন সক্রিয়!`,
      `🕵️‍♂️ হে ${actorName}, তুমি কি ${targetsText} কে অ্যাডমিন থেকে সরানোর সাহস করলি?\n🎯 চুপচাপ বসে থাক, আমি তোকে আবার গ্রুপ থেকে বের করে দিলাম!\n💼 বটের নিয়ম: অ্যাডমিনদের সাথে ছিনিমিনি নেই!`
    ];

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    api.removeUserFromGroup(actorId, event.threadID, (err) => {
      if (err) {
        api.sendMessage(
          `⚠️ সতর্কতা: ${actorName} (যিনি ${targetsText} কে অ্যাডমিন থেকে সরিয়েছেন) — আমাকে কিক করতে পারলাম না। হয়তো বট পারমিশন নেই।`,
          event.threadID
        );
      } else {
        api.sendMessage(randomMsg, event.threadID);
      }
    });

  } catch (error) {
    console.error("protectAdmins error:", error);
  }
};
