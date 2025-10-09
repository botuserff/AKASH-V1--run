const fs = require('fs');
const path = require('path');
const axios = require('axios');
const folderPath = __dirname;

module.exports.config = {
 name: "give",
 version: "1.0.5",
 hasPermssion: 2,
 credits: "CYBER SUJON + Islamik Cyber",
 description: "ফাইল লিস্ট দেখায় এবং Raw/Delete অপশন দেয় (PasteBin API)",
 commandCategory: "Admin",
 usages: "give",
 cooldowns: 5
};

module.exports.run = async function({ event, api }) {
 fs.readdir(folderPath, (err, files) => {
 if (err) return api.sendMessage('❌ ফোল্ডার পড়তে সমস্যা হচ্ছে!', event.threadID);

 const jsFiles = files.filter(file => path.extname(file).toLowerCase() === '.js');
 if (!jsFiles.length) return api.sendMessage("❌ কোনো .js ফাইল পাওয়া যায়নি!", event.threadID);

 let msg = '╭•┄┅═════❁🌺❁═════┅┄•╮\n🌸 AKASH BOSS এর ফাইল লিস্ট 🌸\n╰•┄┅═════❁🌺❁═════┅┄•╯';
 jsFiles.forEach((file, index) => {
 msg += `\n${index + 1}. ${file}`;
 });
 msg += `\n\n✿ রিপ্লাই করুন:\n➤ [নম্বর] raw ➠ Raw লিংক পাবেন\n➤ [নম্বর] del ➠ ফাইল ডিলিট হবে`;

 api.sendMessage(msg, event.threadID, (err, info) => {
 global.client.handleReply.push({
 name: this.config.name,
 messageID: info.messageID,
 author: event.senderID,
 files: jsFiles
 });
 }, event.messageID);
 });
};

module.exports.handleReply = async function({ event, api, handleReply }) {
 const { author, files } = handleReply;
 if (event.senderID !== author) return api.sendMessage('⚠️ আপনি এই কমান্ড ব্যবহার করতে পারবেন না!', event.threadID);

 const input = event.body.trim().split(/\s+/);
 const index = parseInt(input[0]);
 const action = input[1]?.toLowerCase();

 if (!index || !action || !files[index - 1]) {
 return api.sendMessage('❌ সঠিকভাবে লিখুন: [নম্বর] raw/del', event.threadID, event.messageID);
 }

 const selectedFile = files[index - 1];
 const filePath = path.join(folderPath, selectedFile);

 if (action === "del") {
 try {
 fs.unlinkSync(filePath);
 return api.sendMessage(`🗑️ ডিলিট সফল!\n➤ ${selectedFile}`, event.threadID);
 } catch (err) {
 return api.sendMessage(`❌ ডিলিট করতে সমস্যা:\n${err.message}`, event.threadID);
 }
 }

 if (action === "raw") {
 try {
 const content = fs.readFileSync(filePath, "utf8");
 const loading = await api.sendMessage("📤 PasteBin-এ লিংক তৈরি হচ্ছে...", event.threadID);

 const res = await axios.post("https://pastebin-api.vercel.app/paste", { text: content });
 if (!res.data || !res.data.id) throw new Error("PasteBin API থেকে ID পাওয়া যায়নি!");

 const pasteUrl = `https://pastebin-api.vercel.app/raw/${res.data.id}`;
 await api.unsendMessage(loading.messageID);

 return api.sendMessage(`✅ র‍্য লিংক তৈরি হয়েছে!\n🔗 লিংক: ${pasteUrl}`, event.threadID);
 } catch (err) {
 return api.sendMessage(`❌ আপলোড করতে সমস্যা:\n${err.message}`, event.threadID, event.messageID);
 }
 }

 return api.sendMessage("❌ শুধুমাত্র raw/del লিখুন!", event.threadID, event.messageID);
};
