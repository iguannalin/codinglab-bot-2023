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

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
function getMentorsToday(daily = false, specificDay = 'monday') {
  const day = daily ? days[new Date().getDay()] : specificDay; //returns 0-6 for Sun-Sat
  const dayName = day.charAt(0).toUpperCase() + day.substring(1).toLowerCase();
  const embed = new Discord.MessageEmbed()
            .setColor('#39FF14')
            .setTitle((daily ? ("Who's in today") : (`Who's in on ${dayName}`)));
          
  const matches = mentorData.filter((mentor) => mentor.time.includes(dayName));
  matches.forEach((match) => {
    embed.addField(`${match.name} is in the lab ${match.time}!`, `Feel free to drop by or book them here at ${match.link}`);
  });
  if (matches.length > 0) bot.channels.cache.get(channelID).send(embed); // if daily cron job
  else if (!daily && (matches.length < 1)) // if someone pinged the discord bot
  {
    embed.addField(`No-one in today!`, `Boo :(`);
    bot.channels.cache.get(channelID).send(embed);
  }
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
              embed.addField(`${match.name} can help!`, `${match.name}'s office hours are ${match.time}.\n${match.link}`);
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
            bot.channels.cache.get(channelID).send(embed);
            break;
          default:
            // if someone entered a command that was not a day of the week, then do nothing
            if (!subCmd || !days.includes(subCmd.toLowerCase()) || !subCmd.toLowerCase() != "today") return;
            if (subCmd.toLowerCase() == "today") getMentorsToday(true);
            else getMentorsToday(false, subCmd.toLowerCase());
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
cron.schedule('0 7 * * *', function (err) {
    if (err) {
      console.log('Cron Job - There was an error ' + error);
    }
    getMentorsToday(true);
  },
{
  scheduled: true, timezone: "America/New_York"
});
