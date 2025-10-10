const schedule = require('node-schedule');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports.config = {
    name: 'autoweather',
    version: '2.0.0',
    hasPermssion: 0,
    credits: 'Mohammad Akash',
    description: 'Sends BD weather updates every 10 minutes with random advice',
    commandCategory: 'group messenger',
    usages: '[]',
    cooldowns: 3
};

// বাংলাদেশের প্রধান জেলা
const districts = [
    'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet',
    'Barisal', 'Rangpur', 'Mymensingh', 'Coxs Bazar', 'Comilla'
];

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
async function getWeather(city) {
    try {
        const res = await axios.get(`https://wttr.in/${city}?format=%C+%t`);
        return res.data;
    } catch {
        return "🌧️ তথ্য আনা যায়নি";
    }
}

module.exports.onLoad = ({ api }) => {
    console.log(chalk.bold.hex("#00bfff")("============ AUTOWEATHER SYSTEM LOADED (Every 10 Minutes) ============"));

    // প্রতি ১০ মিনিটে auto run
    const rule = new schedule.RecurrenceRule();
    rule.tz = 'Asia/Dhaka';
    rule.minute = new schedule.Range(0, 59, 10);

    schedule.scheduleJob(rule, async () => {
        if (!global.data?.allThreadID) return;

        const now = moment().tz('Asia/Dhaka');
        const dateStr = now.format('DD MMM YYYY');
        const timeStr = now.format('hh:mm A');

        let report = "🌦️ বাংলাদেশ আবহাওয়া আপডেট\n━━━━━━━━━━━━━━━\n";

        // সকল জেলার আবহাওয়া
        for (const district of districts) {
            const weather = await getWeather(district);
            report += `📍 ${district}: ${weather}\n`;
        }

        // Random advice
        const tip = tips[Math.floor(Math.random() * tips.length)];

        report += "━━━━━━━━━━━━━━━\n";
        report += `📅 তারিখ: ${dateStr}\n`;
        report += `🕒 সময়: ${timeStr}\n`;
        report += `💡 পরামর্শ: ${tip}\n`;

        // সব গ্রুপে পাঠানো
        global.data.allThreadID.forEach(threadID => {
            api.sendMessage(report, threadID, err => {
                if (err) console.error(`Weather send failed (${threadID}):`, err);
            });
        });

        console.log(chalk.hex("#00FFFF")(`[BDT] Weather report sent: ${dateStr}, ${timeStr}`));
    });
};

module.exports.run = () => {
    // handled automatically in onLoad
};
