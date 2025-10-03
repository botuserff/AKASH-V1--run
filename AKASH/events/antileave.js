module.exports.config = {
  name: "antileave",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "Mohammad Akash",
  description: "Auto Re-Add Only If Self-Leave (Admin Kick Safe)"
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const leaverID = logMessageData.leftParticipantFbId;
  const leaverName = await Users.getNameUser(leaverID);
  const mention = [{ id: leaverID, tag: leaverName }];

  // 10 সেকেন্ড অপেক্ষা করে নিশ্চিত চেক
  setTimeout(async () => {
    try {
      // Thread info check
      const threadInfo = await api.getThreadInfo(threadID);
      const members = threadInfo.participantIDs;

      if(members.includes(leaverID)) {
        // Already in group → কিক বা রি-অ্যাডের সমস্যা নেই
        return;
      }

      // যদি মেম্বার নেই এবং নিজে লিভ করেছে
      if(!logMessageData.kickSenderFbId) {
        api.addUserToGroup(leaverID, threadID, async (err) => {
          if(err) {
            const failMsg = 
`⚠️━━━━━━━━━━━━━━━━⚠️
👤 ${leaverName} could not be re-added 🚫
⚠️━━━━━━━━━━━━━━━━⚠️`;
            await api.sendMessage({ body: failMsg, mentions: mention }, threadID);
          } else {
            const welcomeBackMsg = 
`🎉━━━━━━━━━━━━━━━━🎉
👤 ${leaverName} has been re-added ✅
🎉━━━━━━━━━━━━━━━━🎉`;
            await api.sendMessage({ body: welcomeBackMsg, mentions: mention }, threadID);
          }
        });
      } else {
        // অ্যাডমিন কিক হলে রি-অ্যাড হবে না
        const kickNotice = 
`⚠️━━━━━━━━━━━━━━━━⚠️
👤 ${leaverName} was removed by an admin.
No auto re-add attempted.
⚠️━━━━━━━━━━━━━━━━⚠️`;
        await api.sendMessage(kickNotice, threadID);
      }

    } catch(e) {
      console.log(e);
    }
  }, 10000); // 10 সেকেন্ড ডিলে
};
