require('dotenv').config();
const tmi = require('tmi.js');
const Discord = require('discord.js');
const channels = require('./channels.js');

var options = {
    options: {
        debug: false
    },
    connection: {
        cluster: "aws",
        reconnect: true
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: channels
};

const twitch = new tmi.client(options);
const discord = new Discord.Client();

const channel = process.env.TWITCH_CHANNEL;

twitch.connect();

try {
    twitch.on('connected', function(address, port) {
        console.log(`[Connected to Twitch Chat] ${address}:${port}`);
        twitch.color('#00acee');

        try {
            discord.on('ready', () => {
                console.log(`Connected to Discord, ready and logged in as ${discord.user.tag}`);
                const reporter = discord.channels.cache.get('733662489589317713')

                twitch.on('chat', function(channel, user, message, self) {
                    // Ignore messages from self
                    if(self) return;

                    const username = user['display-name'];
                    const userUrl = `https://www.twitch.tv/${username}`;
                    const channelUrl = `https://www.twitch.tv/${channel}`;

                    // Ignore messages from possible alter egos
                    if(username == 'dialogik' || username == 'dialogikTV' || username == 'geierfogel') return;

                    // Only check for 'dialogik' occurences
                    if(!message.includes('dialogik')) return;

                    const embed = new Discord.MessageEmbed()
                        .setColor('#00acee')
                        .setTitle(`\`dialogik\`-Erwähnung in ${channel}`)
                        .setDescription(`> \`@${username}\`: ${message}`)
                        .setURL(channelUrl.replace("#", ""))
                        .setTimestamp()
                        .setFooter(`Erwähnt in \`${channel}\``)

                    if(user.mod) {
                        embed.setAuthor(username, 'https://cdn.discordapp.com/attachments/673094090706911262/734155246624047164/ezgif-7-bab0479fb541.png', userUrl)
                        // embed.addField(':crossed_swords:', 'Mod')
                    } else {
                        embed.setAuthor(username, null, userUrl)
                    }

                    // Send to dialogikTV Discord #twitch-chat-listener
                    reporter.send(embed);
                });
            });

            discord.login(process.env.DISCORD_TOKEN);
        } catch (e) {
            console.log('APPLICATION CRASHED WITHIN DISCORD TRY BLOCK', e);
        }
    });
} catch (e) {
    console.log('APPLICATION CRASHED WITHIN TWITCH TRY BLOCK', e);
}
