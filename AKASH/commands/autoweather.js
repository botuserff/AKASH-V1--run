const schedule = require('node-schedule');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
    name: 'autoweather_dhaka',
    version: '1.2.0',
    hasPermssion: 0,
    credits: 'Mohammad Akash',
    description: 'Sends Dhaka weather updates every 30 minutes in premium style',
    commandCategory: 'group messenger',
    usages: '[]',
    cooldowns: 3
};

// Random advice lines
const tips = [
    "☔ বাইরে গেলে ছাতা নাও!",
    "💧 পানি বেশি পান করো।",
    "🌸 আজ একটু হাসো তো!",
    "😎 কাজের মাঝে ছোট ব্রেক নাও।",
    "🧘‍♂️ হালকা stretch করো।",
    "💡 সময়মত খাবার খাও।",
    "🌞 সকালটা fresh শুরু করো!"
];

// Weather fetch function (wttr.in)
async function getWeather() {
    try {
        const res = await axios.get(`https://wttr.in/Dhaka?format=%C+%t`);
        return res.data; // যেমন: 🌤️ 31°C
    } catch {
        return "🌧️ তথ্য আনা যায়নি";
    }
}

module.exports.onLoad = ({ api }) => {
    console.log(chalk.bold.hex("#00bfff")("============ AUTOWEATHER DHAKA LOADED ============"));

    // প্রতি ৩০ মিনিটে auto run
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Asia/Dhaka';
    rule.minute = new schedule.Range(0, 59, 30); // 00, 30 মিনিটে

    schedule.scheduleJob(rule, async () => {
        if (!global.data?.allThreadID) return;

        const now = moment().tz('Asia/Dhaka');
        const dateStr = now.format('DD MMM YYYY');
        const timeStr = now.format('hh:mm A');

        const weather = await getWeather();
        const tip = tips[Math.floor(Math.random() * tips.length)];

        const message =
`╭─────────────────────────╮
🌤️ এই মুহূর্তে জানানো হচ্ছে ঢাকায়  
╰─────────────────────────╯
🌡️ ${weather}  

━━━━━━━━━━━━━━━━
📅 তারিখ: ${dateStr}
🕒 সময়: ${timeStr}
💡 পরামর্শ: ${tip}
━━━━━━━━━━━━━━━━`;

        // সব গ্রুপে পাঠানো
        global.data.allThreadID.forEach(threadID => {
            api.sendMessage(message, threadID, err => {
                if (err) console.error(`Weather send failed (${threadID}):`, err);
            });
        });

        console.log(chalk.hex("#00FFFF")(`[BDT] Dhaka weather sent: ${dateStr}, ${timeStr}`));
    });
};

module.exports.run = () => {
    // handled automatically in onLoad
};
