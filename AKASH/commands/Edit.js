const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Akash Edit",
  description: "Reply করা ছবি বা URL দিয়ে AI দিয়ে ছবি এডিট করে",
  commandCategory: "image",
  usages: "edit [prompt] | [reply image or link]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  let linkanh = event.messageReply?.attachments?.[0]?.url || null;
  const prompt = args.join(" ").split("|")[0]?.trim();

  if (!linkanh && args.length > 1) {
    linkanh = args.join(" ").split("|")[1]?.trim();
  }

  if (!linkanh || !prompt) {
    return api.sendMessage(
      "📸 Usage:\n✨ Example:\nedit add cute girlfriend | <reply photo or link>",
      event.threadID,
      event.messageID
    );
  }

  linkanh = linkanh.replace(/\s/g, "");
  if (!/^https?:\/\//.test(linkanh)) {
    return api.sendMessage(
      "⚠️ সঠিক ইমেজ লিঙ্ক দিন (http:// বা https:// হতে হবে)",
      event.threadID,
      event.messageID
    );
  }

  // Fixed: Direct API URL
  const apiUrl = `https://imranapi.vercel.app/api/editimg?prompt=${encodeURIComponent(
    prompt
  )}&image=${encodeURIComponent(linkanh)}`;

  const waitMsg = await api.sendMessage("⏳ অনুগ্রহ করে অপেক্ষা করুন, ছবি এডিট হচ্ছে ...", event.threadID);

  try {
    const filePath = path.join(__dirname, "cache", `edited_${event.senderID}.jpg`);
    const response = await axios({ method: "GET", url: apiUrl, responseType: "stream" });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `🔍 Prompt: “${prompt}”\n✨ এডিটেড ছবি রেডি!`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          fs.unlinkSync(filePath);
          api.unsendMessage(waitMsg.messageID);
        },
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID, event.messageID);
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ API তে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
