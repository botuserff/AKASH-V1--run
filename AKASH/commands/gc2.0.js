const axios = require("axios");
const fs = require("fs");
const Canvas = require("canvas");

module.exports.config = {
  name: "gc2.0",
  version: "2.0.1",
  hasPermssion: 0,
  credits: "Akash Edit",
  description: "Generate stylish group members card (Admins + Members)",
  commandCategory: "group",
  usages: "/gc2.0",
  cooldowns: 10
};

module.exports.run = async ({ api, event }) => {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const threadName = threadInfo.threadName || "Group Chat";
    const admins = threadInfo.adminIDs.map(ad => ad.id);
    const members = threadInfo.participantIDs;

    // ক্যানভাস সেটআপ
    const width = 1200, height = 1200;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড
    ctx.fillStyle = "#021024";
    ctx.fillRect(0, 0, width, height);

    // শিরোনাম
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.fillText(`${threadName}`, 50, 70);
    ctx.font = "28px Arial";
    ctx.fillText(`Admins: ${admins.length}`, 50, 120);
    ctx.fillText(`Members: ${members.length}`, 300, 120);

    // মেম্বার প্রোফাইল সাজানো
    let x = 50, y = 200;
    const size = 100;
    let count = 0;

    for (let uid of members) {
      try {
        // 🔥 টোকেন ছাড়া সরাসরি DP ফেচ (proxy link ব্যবহার)
        const url = `https://api.allorigins.win/raw?url=https://graph.facebook.com/${uid}/picture?width=200&height=200`;
        const imgData = (await axios.get(url, { responseType: "arraybuffer" })).data;
        const avatar = await Canvas.loadImage(imgData);

        // প্রোফাইল পিকচার
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, size, size);
        ctx.restore();

        // বর্ডার
        ctx.strokeStyle = admins.includes(uid) ? "yellow" : "#00e5ff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
        ctx.stroke();

        // পজিশন শিফট
        x += size + 20;
        count++;
        if (count % 10 === 0) {
          x = 50;
          y += size + 40;
        }
      } catch (e) {
        console.log("Skip image for UID:", uid);
      }
    }

    const outPath = __dirname + "/cache/gc2.0.png";
    fs.writeFileSync(outPath, canvas.toBuffer());

    return api.sendMessage(
      { body: "✅ Group Card v2.0 Generated!", attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Error generating group card v2.0", event.threadID, event.messageID);
  }
};
