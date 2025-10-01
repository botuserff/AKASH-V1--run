const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "edit",
    version: "5.0.0",
    permission: 0,
    credits: "Akash Edit",
    description: "Reply করা ছবি + প্রম্পট অনুযায়ী AI দিয়ে এডিট",
    commandCategory: "image",
    usages: "/edit <prompt> (reply to an image)",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args, message }) {
    try {
        // চেক রিপ্লাই
        if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
            return api.sendMessage("📸 | দয়া করে কোনো ছবি রিপ্লাই দিয়ে কমান্ড চালাও।", event.threadID, event.messageID);
        }

        // চেক প্রম্পট
        if (!args[0]) {
            return api.sendMessage("📝 | ছবি এডিট করার জন্য একটি প্রম্পট লিখো।", event.threadID, event.messageID);
        }

        const prompt = args.join(" ");
        const imgUrl = event.messageReply.attachments[0].url;

        // Processing message
        const processingMsg = await api.sendMessage("🔄 | তোমার ছবি AI দিয়ে এডিট হচ্ছে...", event.threadID);

        // ------------------ AI IMAGE GENERATION ------------------
        // **আমার বিল্ট-ইন ফাংশন ব্যবহার**
        // এখানে global.ai.generateImage() প্রয়োজন, যা তোমার বটের বিল্ট-ইন AI ফাংশন হতে হবে
        let editedImageBuffer;
        if (global.ai && typeof global.ai.generateImage === "function") {
            editedImageBuffer = await global.ai.generateImage({ image: imgUrl, prompt: prompt });
        } else {
            // fallback যদি AI ফাংশন না থাকে
            return api.sendMessage("❌ | AI ইমেজ জেনারেট করার ফাংশন পাওয়া যায়নি।", event.threadID, event.messageID);
        }

        // ফাইল লেখা
        const filePath = path.join(__dirname, "cache", `edit_${Date.now()}.png`);
        fs.writeFileSync(filePath, editedImageBuffer);

        // রিপ্লাই করা
        await api.sendMessage({
            body: `✅ | তোমার ছবি প্রম্পট অনুযায়ী এডিট হয়েছে: "${prompt}"`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, event.messageID);

        // ফাইল মুছে ফেলা
        fs.unlinkSync(filePath);

        // Processing মেসেজ আনসেন্ড
        api.unsendMessage(processingMsg.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ | ছবি এডিট করার সময় সমস্যা হয়েছে, আবার চেষ্টা করো।", event.threadID, event.messageID);
    }
};
