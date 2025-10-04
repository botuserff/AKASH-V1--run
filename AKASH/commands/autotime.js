module.exports.config = {
  name: "autotime",
  version: "4.1.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "Sends Assalamu Alaikum + stylish time info every hour in all groups",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  return api.sendMessage("🤖 Stylish Autotime is running in all groups!", event.threadID, event.messageID);
};

module.exports.onLoad = async () => {
  const api = global.botAPI;

  setInterval(async () => {
    try {
      const threads = await api.getThreadList(100, null, ["inbox"]);

      for (let thread of threads) {
        if (thread.isGroup) {
          // Current Bangladesh Time (UTC+6)
          const now = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);

          // Time (12-hour format)
          let hours = now.getHours();
          const minutes = now.getMinutes().toString().padStart(2, "0");
          const seconds = now.getSeconds().toString().padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12;
          const currentTime = `${hours}:${minutes}:${seconds} ${ampm}`;

          // Day & Date
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const dayName = days[now.getDay()];
          const date = now.getDate().toString().padStart(2, "0");
          const month = (now.getMonth() + 1).toString().padStart(2, "0");
          const year = now.getFullYear();
          const currentDate = `${date}/${month}/${year}`;

          // Week number
          const start = new Date(now.getFullYear(), 0, 1);
          const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset())*60*1000;
          const weekNumber = Math.floor(diff / (7*24*60*60*1000)) + 1;

          // Day of Year
          const dayOfYear = Math.floor(diff / (24*60*60*1000)) + 1;

          // Remaining time today
          const remainingMs = (24*60*60*1000) - (now.getHours()*3600000 + now.getMinutes()*60000 + now.getSeconds()*1000);
          const remHours = Math.floor(remainingMs / (1000*60*60));
          const remMinutes = Math.floor((remainingMs % (1000*60*60)) / (1000*60));
          const remSeconds = Math.floor((remainingMs % (1000*60)) / 1000);

          // Greeting
          let greeting = "";
          const hour24 = now.getHours();
          if (hour24 >= 5 && hour24 < 12) greeting = "🌅 Good Morning!";
          else if (hour24 >= 12 && hour24 < 17) greeting = "🌞 Good Afternoon!";
          else if (hour24 >= 17 && hour24 < 21) greeting = "🌇 Good Evening!";
          else greeting = "🌙 Good Night!";

          // Full message with salam on top
          const message = `
🌟 আসসালামু আলাইকুম 🌟
━━━━━━━━━━━━━━━━━━
⏰ Current Time: ${currentTime}
📅 Day       : ${dayName}
🗓 Date      : ${currentDate}
📊 Week No.  : ${weekNumber}
📈 Day of Yr.: ${dayOfYear}
⏳ Remaining : ${remHours}h ${remMinutes}m ${remSeconds}s
━━━━━━━━━━━━━━━━━━
✨ ${greeting}
━━━━━━━━━━━━━━━━━━
          `;

          await api.sendMessage(message, thread.threadID);
        }
      }

    } catch (err) {
      console.error("Autotime error:", err);
    }
  }, 1000 * 60 * 60); // প্রতি 1 ঘন্টা
};
