require("dotenv").config()
let channelID = process.env.CHANNEL_ID;
console.log(`Working with the Channel ID: ${channelID}`);

var Discord = require("discord.js");
var logger = require("winston");
var auth = require("./secret/discord.json");
const cron = require("node-cron");

var fs = require('fs');
var mentorData = Array.from(JSON.parse(fs.readFileSync('mentors.json', 'utf8')));
const codingLabSite = "https://itp.nyu.edu/help/in-person-help/coding-lab";

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true
});
logger.level = "debug";

// Initialize Discord Bot
var bot = new Discord.Client();

bot.login(auth.token);

bot.on("ready", () => {
  logger.info("Logged in as: " + bot.user.tag);
});

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getMentorsToday() {
  const day = new Date().getDay(); //returns 0-6 for Sun-Sat
  const dayName = days[day];

  const embed = new Discord.MessageEmbed()
            .setColor('#39FF14')
            .setTitle("Who's in today");
          
  const matches = mentorData.filter((mentor) => mentor.time.includes(dayName));
  matches.forEach((match) => {
    embed.addField(`${match.name} is in the lab ${match.time}!`, `Feel free to drop by or book them here at ${match.link}`);
  });
  embed.addField('\u200b', `If you missed us, you can always make an appointment at ${codingLabSite}`);
  bot.channels.cache.get(channelID).send(embed);
}

bot.on("message", (message) => {
  // ignore if message was sent by a bot
  if (message.author.bot) return;
  // console.log(message)
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.channel.id == channelID && message.content.substring(0, 1) == "!") {
    var args = message.content.substring(1).split(" ");
    var cmd = args[0];
    args = args.splice(1);
    switch (cmd) {
      // !ping
      case "codinglab":
        const subCmd = args[0];
        const embed = new Discord.MessageEmbed()
          .setColor('#39FF14');
        switch (subCmd) {
          case "help":
            embed.setTitle(`Help!`);
            embed.addField('\u200b', "To find a lab tech with a particular skill, use: \n`i.e. !codinglab skill <javascript>` \nfind who is in the lab today with `!codinglab`\nor you can list all lab techs with: \n`!codinglab all`");
            bot.channels.cache.get(channelID).send(embed);
            break;
          case "skill":
            if (!args[1]) return;
            const skill = args[1].toLowerCase().trim();
            embed.setTitle(`Help with ${skill}`);

            const matches = mentorData.filter((mentor) => mentor.skills.includes(skill));
            matches.forEach((match) => {
              embed.addField(`${match.name} can help!`, `${match.name}'s office hours are ${match.time}.\nBook them here at `, `${match.link}.`);
            });
            if (matches.length < 1) {
              embed.addField('\u200b', `No particular experts here :(`);
            }
            embed.addField('\u200b', `Book a mentor or find a mentor on the coding lab site (${codingLabSite})`);
            bot.channels.cache.get(channelID).send(embed);
            break;
          case "all":
            embed.setTitle(`All Coding Lab mentors`);
            mentorData.forEach((m) => {
              embed.addField(`${m.name}`, `${m.name}'s office hours are ${m.time}!`);
            });
            embed.addField('\u200b', `Book a mentor or find a mentor on the coding lab site (${codingLabSite})`);
            bot.channels.cache.get(channelID).send(embed);
            break;
          default:
            getMentorsToday();
            break;
        }
        break;
      // Just add any case commands if you want to..
    }
  }
});

// Cron does time like so:
// ('<minutes(of 60)> <hours(of 24)> <days(of month)> <months> <year>')
// * means "every"
cron.schedule('0 8 * * *', function (err) {
    if (err) {
      console.log('Cron Job - There was an error ' + error);
    }
    getMentorsToday();
  },
{
  scheduled: true, timezone: "America/New_York"
});
