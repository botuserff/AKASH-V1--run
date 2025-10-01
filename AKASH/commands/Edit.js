const fs = require("fs");
const path = require("path");

// আমাদের বিল্ট-ইন AI ব্যবহার করে ইমেজ জেনারেট করবে
module.exports.config = {
  name: "edit",
  aliases: ["modify"],
  version: "1.0",
  author: "Akash + AI",
  role: 0,
  category: "image",
  shortDescription: {
    en: "AI দিয়ে রিপ্লাই ইমেজ এডিট"
  },
  longDescription: {
    en: "Reply করা ছবি + প্রম্পট অনুযায়ী এডিট করবে AI"
  },
  guide: {
    en: "{pn} add a Girlfriend with me (reply to an image)"
  }
};

module.exports.onStart = async function ({ api, event, args, message }) {
  try {
    // চেক করো রিপ্লাই আছে কি না
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("📸 | দয়া করে কোনো ছবি রিপ্লাই দিয়ে কমান্ড চালাও।");
    }

    // প্রম্পট চেক
    if (!args[0]) {
      return message.reply("📝 | ছবি এডিট করার জন্য একটি প্রম্পট লিখো।");
    }

    const prompt = args.join(" ");
    const imgUrl = event.messageReply.attachments[0].url;

    // ইমোজি রিয়্যাকশন
    api.setMessageReaction("🎨", event.messageID, () => {}, true);
    const processingMsg = await message.reply("🔄 | তোমার ছবি AI দিয়ে এডিট হচ্ছে...");

    // ----------- MAIN AI IMAGE GENERATION -----------
    // আমাদের বিল্ট-ইন AI ফাংশন ব্যবহার
    const editedImageBuffer = await global.ai.generateImage({
      image: imgUrl,
      prompt: prompt
    });

    // ফাইল তৈরি
    const filePath = path.join(__dirname, "cache", `edit_${Date.now()}.png`);
    fs.writeFileSync(filePath, editedImageBuffer);

    // রিপ্লাই পাঠাও
    await message.reply({
      body: `✅ | তোমার ছবি প্রম্পট অনুযায়ী এডিট হয়েছে: "${prompt}"`,
      attachment: fs.createReadStream(filePath)
    });

    // ফাইল মুছে দাও
    fs.unlinkSync(filePath);
    api.unsendMessage(processingMsg.messageID);
    api.setMessageReaction("✅", event.messageID, () => {}, true);

  } catch (error) {
    console.error(error);
    message.reply("❌ | ছবি এডিট করার সময় সমস্যা হয়েছে, আবার চেষ্টা করো।");
  }
};
