module.exports.config = {
  name: "antileave",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "Mohammad Akash",
  description: "Auto Re-Add Only If User Left By Themselves"
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const leaverID = logMessageData.leftParticipantFbId;
  const leaverName = await Users.getNameUser(leaverID);
  const mention = [{ id: leaverID, tag: leaverName }];

  // চেক: যদি অ্যাডমিন কিক করে → রি-অ্যাড হবে না
  if(!logMessageData.kickSenderFbId) {
    // মেম্বার নিজের ইচ্ছায় লিভ করেছে → রি-অ্যাড
    try {
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
    } catch(e) {
      console.log(e);
    }
  } else {
    // অ্যাডমিন কিক করলে কোনো রি-অ্যাড হবে না
    const kickNotice = 
`⚠️━━━━━━━━━━━━━━━━⚠️
👤 ${leaverName} was removed by an admin.
No auto re-add attempted.
⚠️━━━━━━━━━━━━━━━━⚠️`;
    await api.sendMessage(kickNotice, threadID);
  }
};
