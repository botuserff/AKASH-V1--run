const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "gc2.0",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "Akash Edit",
  description: "Generate stylish group members card (Admins + Members) with circle avatars",
  commandCategory: "group",
  usages: "/gc2.0",
  cooldowns: 10,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  }
};

module.exports.onLoad = async () => {
  const dirCache = path.resolve(__dirname, "cache");
  if (!fs.existsSync(dirCache)) fs.mkdirSync(dirCache, { recursive: true });

  // fallback avatar
  const fallbackPath = path.resolve(dirCache, "fallback.png");
  if (!fs.existsSync(fallbackPath)) {
    const url = "https://i.postimg.cc/3J0y9hQF/fallback.png"; // কোনো default avatar image
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(fallbackPath, Buffer.from(res.data));
  }
};

async function fetchAvatar(uid) {
  const dirCache = path.resolve(__dirname, "cache");
  const avatarPath = path.resolve(dirCache, `avt_${uid}.png`);
  try {
    const res = await axios.get(`https://graph.facebook.com/${uid}/picture?width=200&height=200`, { responseType: "arraybuffer" });
    fs.writeFileSync(avatarPath, Buffer.from(res.data));
    return avatarPath;
  } catch {
    // fallback if DP fetch fails
    return path.resolve(dirCache, "fallback.png");
  }
}

async function circleImage(imagePath) {
  const img = await Canvas.loadImage(imagePath);
  const canvas = Canvas.createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(img.width / 2, img.height / 2, img.width / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0, img.width, img.height);
  return canvas;
}

module.exports.run = async ({ api, event }) => {
  try {
    const threadInfo = await api.getThreadInfo(event.threadID);
    const threadName = threadInfo.threadName || "Group Chat";
    const admins = threadInfo.adminIDs.map(ad => ad.id);
    const members = threadInfo.participantIDs;

    const width = 1200, height = 1200;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // background
    ctx.fillStyle = "#021024";
    ctx.fillRect(0, 0, width, height);

    // header
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.fillText(threadName, 50, 70);
    ctx.font = "28px Arial";
    ctx.fillText(`Admins: ${admins.length}`, 50, 120);
    ctx.fillText(`Members: ${members.length}`, 300, 120);

    // draw members
    let x = 50, y = 200;
    const size = 100;
    let count = 0;

    for (let uid of members) {
      try {
        const avatarPath = await fetchAvatar(uid);
        const circleCanvas = await circleImage(avatarPath);
        ctx.drawImage(circleCanvas, x, y, size, size);

        // border
        ctx.strokeStyle = admins.includes(uid) ? "yellow" : "#00e5ff";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.stroke();

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

    const outPath = path.resolve(__dirname, "cache/gc2.0.png");
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
