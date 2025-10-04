const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "fm",
    version: "2.0",
    author: "Helal",
    countDown: 10,
    role: 0,
    description: "Fullscreen collage of all group members' profile pictures in round shape",
    category: "Group",
    guide: { en: ".fm" }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const info = await api.getThreadInfo(event.threadID);
      if (!info || !info.participantIDs) {
        return message.reply("⚠️ Couldn’t get group members.");
      }

      const members = info.participantIDs;
      if (members.length === 0) return message.reply("⚠️ No members found.");

      message.reply(`🎥 Making fullscreen collage of ${members.length} members...`);

      // Canvas size = YouTube fullscreen ratio (1920x1080)
      const width = 1920, height = 1080;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1e3c72");
      gradient.addColorStop(1, "#2a5298");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Circle size & placement
      const radius = 80;
      const perRow = Math.floor(width / (radius * 2 + 20));
      let x = radius + 20, y = radius + 20;

      for (let i = 0; i < members.length; i++) {
        try {
          const id = members[i];
          const url = `https://graph.facebook.com/${id}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

          const res = await axios.get(url, { responseType: "arraybuffer" });
          const img = await loadImage(Buffer.from(res.data, "binary"));

          // Draw round profile pic
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
          ctx.restore();

          // Border around pic
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2, true);
          ctx.lineWidth = 5;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          // Next position
          x += radius * 2 + 20;
          if (x + radius > width) {
            x = radius + 20;
            y += radius * 2 + 20;
          }
        } catch (err) {
          console.log("⚠️ Error fetching profile:", err.message);
        }
      }

      const out = path.join(__dirname, "fm_fullscreen.jpg");
      fs.writeFileSync(out, canvas.toBuffer("image/jpeg"));
      await api.sendMessage({ attachment: fs.createReadStream(out) }, event.threadID);
      fs.unlinkSync(out);
    } catch (e) {
      console.error(e);
      message.reply("❌ Error creating fullscreen collage.");
    }
  }
};
