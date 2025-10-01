const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// 👉 এখানে তোমার API key বসাও
const OPENAI_API_KEY = "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";

module.exports.config = {
  name: "editimg",
  version: "1.0.2",
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
          Authorization: `Bearer ${OPENAI_API_KEY}`, // এখানে key ব্যবহার হবে
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
