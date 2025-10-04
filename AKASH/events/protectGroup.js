module.exports.config = {
  name: "protectGroup",
  eventType: ["log:thread-name", "log:thread-nickname", "log:thread-icon"],
  version: "3.1.0",
  credits: "Akash Edit",
  description: "Protects group name, photo, nickname from non-admins, stylish alerts & auto-kick repeated offenders"
};

const warnedUsers = {}; // Track offenders

module.exports.run = async ({ event, api, Users, Threads }) => {
  try {
    const { type, author, threadID, logMessageData } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const admins = threadInfo.adminIDs.map(ad => ad.id);

    // Admin হলে কিছু না করা
    if (admins.includes(author)) return;

    let restoreMsg = "";
    let shouldKick = false;

    const userName = (await Users.getInfo(author))[author].name;

    switch(type) {
      case "log:thread-name":
        const oldName = logMessageData.oldName || threadInfo.threadName;
        await api.setTitle(oldName, threadID);
        restoreMsg = `⚠️ ${userName} tried to change the group NAME!\n✅ Restored to: "${oldName}"`;
        break;

      case "log:thread-icon":
        const oldImage = logMessageData.oldImage || threadInfo.imageSrc;
        if(oldImage) await api.setImage(oldImage, threadID);
        restoreMsg = `⚠️ ${userName} tried to change the group PHOTO!\n✅ Photo restored!`;
        break;

      case "log:thread-nickname":
        const { participant_id, previous_nickname } = logMessageData;
        await api.setNickname(previous_nickname || "", participant_id, threadID);
        const nickNameUser = (await Users.getInfo(participant_id))[participant_id].name;
        restoreMsg = `⚠️ ${nickNameUser} tried to change their NICKNAME!\n✅ Restored to: "${previous_nickname || "None"}"`;
        break;

      default: break;
    }

    // Warning + Kick
    warnedUsers[author] = (warnedUsers[author] || 0) + 1;
    if (warnedUsers[author] >= 2) shouldKick = true;

    if(restoreMsg) {
      const message = `
━━━━━━━━━━━━━━━━━━
${restoreMsg}
━━━━━━━━━━━━━━━━━━
💡 Reminder: Only Admins can change group settings!
`;
      await api.sendMessage(message, threadID);
    }

    if(shouldKick) {
      try {
        await api.removeUserFromGroup(author, threadID);
        await api.sendMessage(`🚫 ${userName} was kicked for repeated non-admin changes!`, threadID);
        warnedUsers[author] = 0;
      } catch (err) {
        console.error("Kick failed (check bot admin permission):", err);
      }
    }

  } catch (err) {
    console.error("ProtectGroup Event Error:", err);
  }
};
