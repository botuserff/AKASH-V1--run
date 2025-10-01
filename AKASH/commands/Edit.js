const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
require("dotenv").config(); // 🔑 .env থেকে API Key লোড করবে

module.exports.config = {
  name: "editimg",
  version: "1.0.1",
  permission: 0,
  credits: "Akash",
  description: "AI দিয়ে ছবি এডিট (reply করা ইমেজ + prompt)",
  prefix: true,
  category: "image",
  usages: "editimg <prompt>",
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ প্রম্পট লিখো।", event.threadID, event.messageID);
    }

    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      event.messageReply.attachments.length === 0
    ) {
      return api.sendMessage("❌ কোনো ছবি reply করো।", event.threadID, event.messageID);
    }

    const imgUrl = event.messageReply.attachments[0].url;
    const imgPath = path.join(__dirname, "cache", `edit_${Date.now()}.png`);

    // ছবি ডাউনলোড
    const download = await axios.get(imgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, Buffer.from(download.data, "binary"));

    // OpenAI API তে পাঠানো
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imgPath));
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://api.openai.com/v1/images/edits",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.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}`, // ✅ Key env থেকে নেবে
          ...formData.getHeaders(),
        },
      }
    );

    const editedUrl = response.data.data[0].url;
    const editedImg = await axios.get(editedUrl, { responseType: "arraybuffer" });
    const outPath = path.join(__dirname, "cache", `out_${Date.now()}.png`);
    fs.writeFileSync(outPath, Buffer.from(editedImg.data, "binary"));

    api.sendMessage(
      { body: `✨ এডিটেড ছবি (${prompt})`, attachment: fs.createReadStream(outPath) },
      event.threadID,
      () => {
        fs.unlinkSync(imgPath);
        fs.unlinkSync(outPath);
      },
      event.messageID
    );
  } catch (e) {
    console.error(e.response?.data || e);
    return api.sendMessage("❌ API তে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
