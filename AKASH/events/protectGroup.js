module.exports.config = {
  name: "protectGroup",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-nickname"],
  version: "3.0.0",
  credits: "Akash Edit",
  description: "Protects group name, photo, nickname from non-admins, stylish alerts & auto-kick repeated offenders"
};

const warnedUsers = {}; // Track offenders

module.exports.run = async ({ event, api, Users, Threads }) => {
  try {
    const { logMessageData, author, type, threadID } = event;
    const threadInfo = await api.getThreadInfo(threadID);

    // Admin IDs
    const admins = threadInfo.adminIDs.map(ad => ad.id);

    if (!admins.includes(author)) {
      let restoreMsg = "";
      let shouldKick = false;
      const userName = (await Users.getInfo(author))[author].name;

      switch(type) {
        case "log:thread-name":
          await api.setTitle(threadInfo.threadName, threadID);
          restoreMsg = `⚠️ ${userName} tried to change the group NAME!\n✅ Restored to: "${threadInfo.threadName}"`;
          break;

        case "log:thread-icon":
          if(threadInfo.imageSrc) {
            await api.setImage(threadInfo.imageSrc, threadID);
            restoreMsg = `⚠️ ${userName} tried to change the group PHOTO!\n✅ Photo restored!`;
          }
          break;

        case "log:thread-nickname":
          const { participant_id, previous_nickname } = logMessageData;
          await api.setNickname(previous_nickname || "", participant_id, threadID);
          const nickNameUser = (await Users.getInfo(participant_id))[participant_id].name;
          restoreMsg = `⚠️ ${nickNameUser} tried to change their NICKNAME!\n✅ Restored to: "${previous_nickname || "None"}"`;
          break;

        default:
          break;
      }

      // Warning + Kick logic
      warnedUsers[author] = warnedUsers[author] ? warnedUsers[author] + 1 : 1;
      if (warnedUsers[author] >= 2) { // যদি একই user দুইবার চেষ্টা করে
        shouldKick = true;
      }

      // Send stylish message
      if(restoreMsg) {
        const message = `
━━━━━━━━━━━━━━━━━━
${restoreMsg}
━━━━━━━━━━━━━━━━━━
💡 Reminder: Only Admins can change group settings!
`;
        await api.sendMessage(message, threadID);
      }

      // Kick if repeated
      if (shouldKick) {
        try {
          await api.removeUserFromGroup(author, threadID);
          await api.sendMessage(`🚫 ${userName} was kicked for repeated non-admin changes!`, threadID);
          warnedUsers[author] = 0; // Reset after kick
        } catch (err) {
          console.error("Failed to kick user:", err);
        }
      }
    }

  } catch (err) {
    console.error("ProtectGroup Event Error:", err);
  }
};
