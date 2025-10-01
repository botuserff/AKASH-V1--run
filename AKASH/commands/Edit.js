const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "edit", // কমান্ড হবে /edit
    version: "1.0.0",
    author: "Akash Edit",
    countDown: 5,
    role: 0,
    shortDescription: "AI দিয়ে ছবি এডিট",
    longDescription: "Reply করা ছবি অথবা লিঙ্ক দিয়ে Prompt লিখে AI দিয়ে ইমেজ এডিট",
    category: "image",
    guide: "{pn} add girlfriend | <image link or reply>"
  },

  onStart: async function({ api, event, args }) {
    let linkanh = event.messageReply?.attachments?.[0]?.url || null;
    const prompt = args.join(" ").split("|")[0]?.trim();

    if (!linkanh && args.length > 1) {
      linkanh = args.join(" ").split("|")[1]?.trim();
    }

    if (!linkanh || !prompt) {
      return api.sendMessage(
        "📸 Usage:\n──────────────────\n✨ Example:\n▶ edit add cute girlfriend | <reply photo বা link>",
        event.threadID,
        event.messageID
      );
    }

    linkanh = linkanh.replace(/\s/g, "");
    if (!/^https?:\/\//.test(linkanh)) {
      return api.sendMessage(
        "⚠️ সঠিক ইমেজ লিঙ্ক দাও (http:// বা https:// হতে হবে)",
        event.threadID,
        event.messageID
      );
    }

    const apiUrl = `${global.imranapi.imran}/api/editimg?prompt=${encodeURIComponent(
      prompt
    )}&image=${encodeURIComponent(linkanh)}`;

    const waitMsg = await api.sendMessage(
      "⏳ অনুগ্রহ করে অপেক্ষা করুন, ছবি এডিট হচ্ছে ...",
      event.threadID
    );

    try {
      const tempPath = path.join(__dirname, "cache", `edited_${event.senderID}.jpg`);
      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: `🔍 Prompt: “${prompt}”\n✨ আপনার এডিটেড ছবি রেডি!`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(tempPath);
            api.unsendMessage(waitMsg.messageID);
          },
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error(err);
        api.sendMessage("❌ কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID, event.messageID);
      });
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ API তে কোনো সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }
  }
};
