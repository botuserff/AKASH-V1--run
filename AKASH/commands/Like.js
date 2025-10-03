// File: modules/commands/like.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "like",
  version: "1.0.0",
  permission: 0,
  credits: "Akash Edit",
  description: "লাইক সেন্ড (BD/IND) — /like bd 2099807760",
  commandCategory: "utility",
  usages: "/like bd 2099807760",
  cooldowns: 2
};

// ==== CONFIG (তুমি এখানে চাইলে বদলাতে পারো) ====
const ALLOWED_GROUP_ID = -1003076524976; // যদি তোমার প্ল্যাটফর্ম threadID আলাদা হয় সেটাও বসাও
const VIP_USER_ID = 7981526462; // Telegram style id; তোমার সিস্টেম অনুযায়ী senderID বসাও
const DAILY_REGION_LIMIT = 30; // প্রতিদিন প্রতি রিজিয়নের ম্যাক্স
const API_BASE = "https://anish-likes.vercel.app/like";
const API_KEY = "jex4rrr"; // (তুমি চাইলে .env নিয়ে পাঠ করাতে পারো)
// ================================================

const DATA_FILE = path.join(__dirname, "like_state.json");

// ensure data file
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const init = {
      user_usage: {}, // { "<userId>": { like: 0, lastUsed: "YYYY-MM-DD" } }
      like_usage: { BD: 0, IND: 0 },
      lastReset: (new Date()).toISOString().slice(0,10) // YYYY-MM-DD
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
  }
}
function readData() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    return { user_usage: {}, like_usage: { BD:0, IND:0 }, lastReset: (new Date()).toISOString().slice(0,10) };
  }
}
function writeData(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

// reset daily limits at midnight server time
function scheduleDailyReset() {
  try {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5); // next midnight +5s
    const ms = next - now;
    setTimeout(() => {
      const d = readData();
      d.user_usage = {};
      d.like_usage = { BD: 0, IND: 0 };
      d.lastReset = (new Date()).toISOString().slice(0,10);
      writeData(d);
      console.log("✅ Daily like limits reset.");
      // reschedule
      scheduleDailyReset();
    }, ms);
  } catch (e) {
    console.error("scheduleDailyReset error:", e);
  }
}

// start schedule immediately on module load
ensureDataFile();
scheduleDailyReset();

async function fetchJson(url) {
  try {
    const r = await axios.get(url, { timeout: 20000 });
    return r.data;
  } catch (e) {
    return null;
  }
}

module.exports.run = async function({ api, event, args }) {
  try {
    // NOTE: adapt these keys if your platform uses different field names
    const threadID = event.threadID || event.message && event.message.threadID || null;
    const senderID = event.senderID || event.message && event.message.senderID || (event.author || event.from) || null;

    // Group-only check (if you want to enforce)
    if (ALLOWED_GROUP_ID && threadID != ALLOWED_GROUP_ID) {
      return api.sendMessage("❌ এই কমান্ডটি শুধুমাত্র অনুমোদিত গ্রুপে ব্যবহার করা যাবে।", threadID, event.messageID);
    }

    // args handling: if args not provided, try parse from event.message text
    let parts = args && args.length ? args : (event.message && event.message.body ? event.message.body.trim().split(/\s+/) : []);
    // if the framework already strips command, parts[0] might be 'bd' — handle both ways:
    if (parts.length > 0 && parts[0].toLowerCase() === "/like") parts = parts.slice(1);

    if (!parts || parts.length === 0) {
      return api.sendMessage("❗ ব্যবহার: /like bd <uid>\nউদাহরণ: /like bd 2099807760", threadID, event.messageID);
    }

    const sub = parts[0].toLowerCase();

    // help
    if (sub === "help") {
      const help = `🧾 Like Bot নির্দেশনা:
✅ লাইক দেওয়ার: /like <country> <uid>   (country: bd বা ind)
🔁 লাইক রিমুভ: /like remove <country> <uid>
ℹ️ ইনফো: /like info <country> <uid>
🔥 টপ: /like top`;
      return api.sendMessage(help, threadID, event.messageID);
    }

    // top
    if (sub === "top") {
      const data = readData();
      const entries = Object.entries(data.like_usage || {});
      const text = `🔥 Today likes:\nBD: ${data.like_usage.BD || 0}\nIND: ${data.like_usage.IND || 0}`;
      return api.sendMessage(text, threadID, event.messageID);
    }

    // info
    if (sub === "info") {
      if (parts.length < 3) return api.sendMessage("📝 ব্যবহার: /like info <country> <uid>", threadID, event.messageID);
      const country = parts[1].toUpperCase();
      const uid = parts[2];
      const key = `${country}:${uid}`;
      const data = readData();
      // We don't store per-target details (external API returns), so just show counts if any
      const count = (data.targets && data.targets[key] && data.targets[key].count) || "N/A";
      return api.sendMessage(`📌 Info for [${country}] ${uid}\n👍 Likes: ${count}`, threadID, event.messageID);
    }

    // remove / unlike (local only)
    if (sub === "remove" || sub === "unlike") {
      if (parts.length < 3) return api.sendMessage("📝 ব্যবহার: /like remove <country> <uid>", threadID, event.messageID);
      const country = parts[1].toUpperCase();
      const uid = parts[2];
      const data = readData();
      const userRec = data.user_usage[senderID] || { like: 0, lastUsed: null };
      const key = `${country}:${uid}`;

      // Allow remove only if the user had liked this specific uid today (we keep a simple per-user likedTargets list)
      if (!data.user_targets) data.user_targets = {};
      const userTargets = data.user_targets[senderID] || [];
      if (!userTargets.includes(key)) {
        return api.sendMessage("⚠️ তুমি এই আইডিতে এই দিনে লাইক দেয়নি (বা রেকর্ড নেই)।", threadID, event.messageID);
      }

      // remove
      data.user_targets[senderID] = userTargets.filter(k => k !== key);
      if (!data.targets) data.targets = {};
      if (data.targets[key]) {
        data.targets[key].count = Math.max(0, (data.targets[key].count || 1) - 1);
      }
      // decrement daily region usage
      if (data.like_usage && data.like_usage[country]) data.like_usage[country] = Math.max(0, data.like_usage[country] - 1);
      // clear user_usage flag so can like again today
      if (data.user_usage[senderID]) data.user_usage[senderID].like = Math.max(0, (data.user_usage[senderID].like || 1) - 1);

      writeData(data);
      return api.sendMessage(`✅ তুমি [${country}] ${uid} থেকে লাইক তুলে নিয়েছো।`, threadID, event.messageID);
    }

    // default: /like <country> <uid>
    if (parts.length < 2) {
      return api.sendMessage("📝 ব্যবহার: /like <country> <uid>\nউদাহরণ: /like bd 2099807760", threadID, event.messageID);
    }

    const country = parts[0].toUpperCase();
    const uid = parts[1];

    if (!["BD","IND"].includes(country)) {
      return api.sendMessage("❗ Unsupported region. Only BD or IND supported.", threadID, event.messageID);
    }

    // validation uid basic
    if (!/^\d{3,20}$/.test(uid)) {
      return api.sendMessage("⚠️ UID সঠিক নয় — সাধারণত সংখ্যা হতে হয় (৩-২০ ডিজিট)।", threadID, event.messageID);
    }

    const data = readData();

    // check daily limit for region
    if (!data.like_usage) data.like_usage = { BD: 0, IND: 0 };
    if (!data.user_usage) data.user_usage = {};

    const isVIP = Number(senderID) === Number(VIP_USER_ID);
    const userRecord = data.user_usage[senderID] || { like: 0, lastUsed: null };

    // if user's lastUsed not today, reset their like count
    const today = (new Date()).toISOString().slice(0,10);
    if (userRecord.lastUsed !== today) {
      userRecord.like = 0;
      userRecord.lastUsed = today;
    }

    if (!isVIP && userRecord.like >= 1) {
      return api.sendMessage("🚫 তুমি আজকে ইতিমধ্যে লাইক ব্যবহার করে ফেলেছো!", threadID, event.messageID);
    }

    if (!isVIP && (data.like_usage[country] || 0) >= DAILY_REGION_LIMIT) {
      return api.sendMessage(`⚠️ আজের জন্য ${country} অঞ্চলের লিমিট শেষ হয়ে গেছে। কাল চেষ্টা করো।`, threadID, event.messageID);
    }

    // call external like API
    const waitMsg = await api.sendMessage("⏳ Sending Likes, Please wait...", threadID);

    const url = `${API_BASE}?server_name=${country.toLowerCase()}&uid=${uid}&key=${API_KEY}`;
    const apiResp = await fetchJson(url);

    if (!apiResp) {
      try { await api.unsendMessage(waitMsg.messageID); } catch(e){/*ignore*/ }
      return api.sendMessage("❌ Failed to send request. Check UID or try later.", threadID, event.messageID);
    }

    // handle response codes similar to Python script
    if (apiResp.status === 2) {
      try { await api.unsendMessage(waitMsg.messageID); } catch(e){}
      const text = `🚫 Max Likes Reached for Today\n\n👤 Name: ${apiResp.PlayerNickname || 'N/A'}\n🆔 UID: ${uid}\n🌍 Region: ${country}\n❤️ Current Likes: ${apiResp.LikesNow || 'N/A'}`;
      return api.sendMessage(text, threadID, event.messageID);
    }

    // success
    // update local counters and records
    if (!data.user_targets) data.user_targets = {};
    data.user_targets[senderID] = data.user_targets[senderID] || [];
    const targetKey = `${country}:${uid}`;
    if (!data.targets) data.targets = {};
    if (!data.targets[targetKey]) data.targets[targetKey] = { count: 0 };
    data.targets[targetKey].count = (data.targets[targetKey].count || 0) + (apiResp.LikesGivenByAPI || 1);

    // mark user used like today (unless VIP)
    if (!isVIP) {
      userRecord.like = (userRecord.like || 0) + 1;
      userRecord.lastUsed = today;
      data.user_usage[senderID] = userRecord;
      data.like_usage[country] = (data.like_usage[country] || 0) + 1;
      data.user_targets[senderID].push(targetKey);
    }

    writeData(data);

    try { await api.unsendMessage(waitMsg.messageID); } catch(e){}

    const successText = `✅ Likes Sent Successfully!\n\n👤 Name: ${apiResp.PlayerNickname || 'N/A'}\n🆔 UID: ${uid}\n❤️ Before Likes: ${apiResp.LikesbeforeCommand || 'N/A'}\n👍 Current Likes: ${apiResp.LikesafterCommand || 'N/A'}\n🎯 Likes Sent By API: ${apiResp.LikesGivenByAPI || 'N/A'}`;
    return api.sendMessage(successText, threadID, event.messageID);

  } catch (err) {
    console.error("like command error:", err);
    return api.sendMessage("❌ | লাইক প্রক্রিয়াতে সমস্যা হয়েছে, পরে আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};
