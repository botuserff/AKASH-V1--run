const fs = require('fs-extra');
const request = require('request');

module.exports.config = {
  name: "upt",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "Monitoring for your messenger robot 24 hour active",
  commandCategory: "monitor",
  usages: "[text/reply]",
  cooldowns: 5
};

module.exports.onLoad = () => {
  const lvb = __dirname + `/noprefix/`;
  if (!fs.existsSync(lvb + "noprefix")) fs.mkdirSync(lvb, { recursive: true });
  if (!fs.existsSync(lvb + "upt.png")) request("https://i.imgur.com/vn4rXA4.jpg").pipe(fs.createWriteStream(lvb + "upt.png"));
}

module.exports.run = async function({ api, event, args, client }) {
  let time = process.uptime();
  let hours = Math.floor(time / (60 * 60));
  let minutes = Math.floor((time % (60 * 60)) / 60);
  let seconds = Math.floor(time % 60);
  const name = Date.now();
  const url = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
  const lvbang = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

  const getDateNow = () => new Date().toLocaleDateString();
  const getTimeNow = () => new Date().toLocaleTimeString();

  // যদি URL না দেওয়া হয়
  if(!url || !url.match(lvbang)) {
    return api.sendMessage({
      body: `╭•┄┅══❁🌺❁══┅┄•╮
🕷️  𝙲𝚈𝙱𝙴𝚁 𝚂𝚃𝙰𝚃𝚄𝚂 𝚁𝙴𝙿𝙾𝚁𝚃
╰•┄┅══❁🌺❁══┅┄•╯

⚡ 𝚂𝚈𝚂𝚃𝙴𝙼 : ACTIVE
⏱ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${hours}h ${minutes}m ${seconds}s
🏷 𝙶𝚁𝙾𝚄𝙿 : ${event.threadName}
📅 𝙳𝙰𝚃𝙴 : ${getDateNow()}
⏰ 𝚃𝙸𝙼𝙴 : ${getTimeNow()}
🌐 𝙻𝙸𝙽𝙺 : ❌ URL NOT FOUND
🛰 𝙼𝙾𝙳𝙴 : 24H AUTO MONITOR

─────────────────────────────
💀 𝙱𝚘𝚝 𝙴𝚗𝚐𝚒𝚗𝚎 : Chat Bot by Akash ⚙️

🔹 Please enter or reply with the URL to post on Uptime Robot`,
      attachment: fs.createReadStream(__dirname + `/noprefix/upt.png`)
    }, event.threadID, event.messageID);
  }

  // API OPTIONS
  const options = { 
    method: 'POST',
    url: 'https://api.uptimerobot.com/v2/newMonitor',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      api_key: 'u2008156-9837ddae6b3c429bd0315101',
      format: 'json',
      type: '1',
      url: url,
      friendly_name: name
    }
  };

  request(options, function (error, response, body) {
    if (error) return api.sendMessage(`❌ Error: Something went wrong!`, event.threadID, event.messageID );

    const result = JSON.parse(body);

    if(result.stat == 'fail') {
      return api.sendMessage({
        body: `╭•┄┅══❁🌺❁══┅┄•╮
🕷️  𝙲𝚈𝙱𝙴𝚁 𝚂𝚃𝙰𝚃𝚄𝚂 𝚁𝙴𝙿𝙾𝚁𝚃
╰•┄┅══❁🌺❁══┅┄•╯

⚡ 𝚂𝚈𝚂𝚃𝙴𝙼 : ACTIVE
⏱ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${hours}h ${minutes}m ${seconds}s
🏷 𝙶𝚁𝙾𝚄𝙿 : ${event.threadName}
📅 𝙳𝙰𝚃𝙴 : ${getDateNow()}
⏰ 𝚃𝙸𝙼𝙴 : ${getTimeNow()}
🌐 𝙻𝙸𝙽𝙺 : ${url}
🛰 𝙼𝙾𝙳𝙴 : 24H AUTO MONITOR
❌ 𝚂𝚃𝙰𝚃𝚄𝚂 : ALREADY MONITORED

─────────────────────────────
💀 𝙱𝚘𝚝 𝙴𝚗𝚐𝚒𝚗𝚎 : Chat Bot by Akash ⚙️`,
        attachment: fs.createReadStream(__dirname + `/noprefix/upt.png`)
      }, event.threadID, event.messageID);
    }

    if(result.stat == 'success') {
      return api.sendMessage({
        body: `╭•┄┅══❁🌺❁══┅┄•╮
🕷️  𝙲𝚈𝙱𝙴𝚁 𝚂𝚃𝙰𝚃𝚄𝚂 𝚁𝙴𝙿𝙾𝚁𝚃
╰•┄┅══❁🌺❁══┅┄•╯

⚡ 𝚂𝚈𝚂𝚃𝙴𝙼 : ACTIVE
⏱ 𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${hours}h ${minutes}m ${seconds}s
🏷 𝙶𝚁𝙾𝚄𝙿 : ${event.threadName}
📅 𝙳𝙰𝚃𝙴 : ${getDateNow()}
⏰ 𝚃𝙸𝙼𝙴 : ${getTimeNow()}
🌐 𝙻𝙸𝙽𝙺 : ${url}
🛰 𝙼𝙾𝙳𝙴 : 24H AUTO MONITOR
✅ 𝚂𝚃𝙰𝚃𝚄𝚂 : MONITOR CREATED

─────────────────────────────
💀 𝙱𝚘𝚝 𝙴𝚗𝚐𝚒𝚗𝚎 : Chat Bot by Akash ⚙️`,
        attachment: fs.createReadStream(__dirname + `/noprefix/upt.png`)
      }, event.threadID, event.messageID);
    }
  });
}
