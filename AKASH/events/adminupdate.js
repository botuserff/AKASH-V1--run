module.exports.config = {
  name: "adminUpdate",
  eventType: ["log:thread-admins","log:thread-name","log:user-nickname","log:thread-icon","log:thread-call","log:thread-color"],
  version: "2.0.0",
  credits: "Islamick Chat Bot (Edited by Akash)",
  description: "Stylish group update notifications",
  envConfig: {
    sendNoti: true,
  }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const fs = require("fs");
  var iconPath = __dirname + "/emoji.json";
  if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));
  const { threadID, logMessageType, logMessageData } = event;
  const { setData, getData } = Threads;

  const thread = global.data.threadData.get(threadID) || {};  
  if (typeof thread["adminUpdate"] != "undefined" && thread["adminUpdate"] == false) return;  

  try {  
    let dataThread = (await getData(threadID)).threadInfo;  

    switch (logMessageType) {  

      // ─────────────── ADMIN ADD/REMOVE ───────────────
      case "log:thread-admins": {  
        const name = await Users.getNameUser(logMessageData.TARGET_ID);
        if (logMessageData.ADMIN_EVENT == "add_admin") {  
          dataThread.adminIDs.push({ id: logMessageData.TARGET_ID })  
          if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`╔═══✦•❖•✦═══╗
👑 ADMIN UPDATE
━━━━━━━━━━━━━━
✅ User: ${name}
⚡ Status: Promoted to Admin

🎉 Congratulations! You're now VIP 👑
╚═══✦•❖•✦═══╝`, 
threadID);
        } else if (logMessageData.ADMIN_EVENT == "remove_admin") {  
          dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);  
          if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`╔═══✦•❖•✦═══╗
👑 ADMIN UPDATE
━━━━━━━━━━━━━━
❌ User: ${name}
⚡ Status: Removed from Admin

😅 Better luck next time, buddy!
╚═══✦•❖•✦═══╝`, 
threadID);
        }  
        break;  
      }  

      // ─────────────── ICON UPDATE ───────────────
      case "log:thread-icon": {  
        let preIcon = JSON.parse(fs.readFileSync(iconPath));  
        dataThread.threadIcon = event.logMessageData.thread_icon || "👍";  
        if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`🎨 GROUP ICON UPDATE
━━━━━━━━━━━━━━
🔄 New Icon: ${dataThread.threadIcon}  
🕘 Old Icon: ${preIcon[threadID] || "unknown"}
━━━━━━━━━━━━━━`, 
threadID);
        preIcon[threadID] = dataThread.threadIcon;  
        fs.writeFileSync(iconPath, JSON.stringify(preIcon));  
        break;  
      }  

      // ─────────────── CALL UPDATE ───────────────
      case "log:thread-call": {  
        if (logMessageData.event === "group_call_started") {  
          const name = await Users.getNameUser(logMessageData.caller_id);  
          api.sendMessage(
`📞 GROUP CALL
━━━━━━━━━━━━━━
👤 Host: ${name}  
▶️ Started a ${(logMessageData.video) ? 'Video' : 'Voice'} Call
━━━━━━━━━━━━━━`, threadID);  

        } else if (logMessageData.event === "group_call_ended") {  
          const callDuration = logMessageData.call_duration;  
          const hours = Math.floor(callDuration / 3600);  
          const minutes = Math.floor((callDuration - (hours * 3600)) / 60);  
          const seconds = callDuration - (hours * 3600) - (minutes * 60);  
          const timeFormat = `${hours}h ${minutes}m ${seconds}s`;  
          api.sendMessage(
`📞 GROUP CALL ENDED
━━━━━━━━━━━━━━
🕒 Duration: ${timeFormat}
━━━━━━━━━━━━━━`, threadID);  

        } else if (logMessageData.joining_user) {  
          const name = await Users.getNameUser(logMessageData.joining_user);  
          api.sendMessage(
`📞 CALL JOIN
━━━━━━━━━━━━━━
👤 ${name} joined the ${(logMessageData.group_call_type == '1') ? 'Video' : 'Voice'} Call
━━━━━━━━━━━━━━`, threadID);  
        }  
        break;  
      }  

      // ─────────────── COLOR UPDATE ───────────────
      case "log:thread-color": {  
        dataThread.threadColor = event.logMessageData.thread_color || "🌈";  
        if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`🎨 THEME UPDATE
━━━━━━━━━━━━━━
🔄 A new theme color has been applied!
━━━━━━━━━━━━━━`, threadID);  
        break;  
      }  

      // ─────────────── NICKNAME UPDATE ───────────────
      case "log:user-nickname": {  
        const name = await Users.getNameUser(logMessageData.participant_id);
        dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;  
        if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`🏷️ NICKNAME UPDATE
━━━━━━━━━━━━━━
👤 User: ${name}
✏️ New Nickname: ${(logMessageData.nickname.length == 0) ? "Original Name" : logMessageData.nickname}
━━━━━━━━━━━━━━`, threadID);  
        break;  
      }  

      // ─────────────── GROUP NAME UPDATE ───────────────
      case "log:thread-name": {  
        dataThread.threadName = event.logMessageData.name || "No name";  
        if (global.configModule[this.config.name].sendNoti) api.sendMessage(
`📢 GROUP NAME UPDATE
━━━━━━━━━━━━━━
🆕 New Name: ${dataThread.threadName}
━━━━━━━━━━━━━━`, threadID);  
        break;  
      }  
    }  

    await setData(threadID, { threadInfo: dataThread });  
  } catch (e) { console.log(e) };
}
