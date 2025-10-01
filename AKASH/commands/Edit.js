const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "edit",
    version: "5.0.0",
    permission: 0,
    credits: "Akash Edit",
    description: "Reply করা ছবি + প্রম্পট অনুযায়ী AI দিয়ে এডিট (Gemini/OpenAI API)",
    commandCategory: "image",
    usages: "/edit <prompt> (reply to an image)",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
    try {
        if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0])
            return api.sendMessage("📸 | দয়া করে কোনো ছবি রিপ্লাই দিয়ে কমান্ড চালাও।", event.threadID, event.messageID);

        if (!args[0])
            return api.sendMessage("📝 | ছবি এডিট করার জন্য একটি প্রম্পট লিখো।", event.threadID, event.messageID);

        const prompt = args.join(" ");
        const imgUrl = event.messageReply.attachments[0].url;

        // Processing message
        const processingMsg = await api.sendMessage("🔄 | তোমার ছবি AI দিয়ে এডিট হচ্ছে...", event.threadID);

        // ------------------ API Call ------------------
        const response = await axios.post(
            "https://api.openai.com/v1/images/edits", // Gemini API থাকলে endpoint পরিবর্তন করো
            {
                model: "gpt-image-1",
                prompt: prompt,
                image: imgUrl
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GEMINI_API_KEY}` // তোমার API Key
                }
            }
        );

        const base64Image = response.data.data[0].b64_json;
        const buffer = Buffer.from(base64Image, "base64");

        // ------------------ ফাইল লেখা ------------------
        if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
        const filePath = path.join(__dirname, "cache", `edit_${Date.now()}.png`);
        fs.writeFileSync(filePath, buffer);

        // ------------------ Image পাঠানো ------------------
        await api.sendMessage({
            body: `✅ | তোমার ছবি প্রম্পট অনুযায়ী এডিট হয়েছে: "${prompt}"`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, event.messageID);

        // Cleanup
        fs.unlinkSync(filePath);
        api.unsendMessage(processingMsg.messageID);

    } catch (error) {
        console.error(error.response?.data || error.message);
        api.sendMessage("❌ | ছবি এডিট করার সময় সমস্যা হয়েছে, API Key ও ইন্টারনেট চেক করো।", event.threadID, event.messageID);
    }
};
