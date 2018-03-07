require('dotenv').config();

const Discord = require('discord.js');

const Meme = require('./Meme');

const client = new Discord.Client();

client.on('ready', () => {
	console.log('I am ready!');
});

client.on('message', message => {
	if (message.content === '!meme') {
		Promise.resolve(new Meme())
			.then(memeObj => {
				const { image, subreddit } = memeObj;
				const payload = `Here's a meme from r/${subreddit}!\n${image}`;
				message.channel.send(payload);
			})
			.catch(e => {
				message.channel.send(
					`An error occurred while fetching the meme :(\nError: ${
						e.name
					}, Message: ${e.message}`
				);
			});
	}
});

client.login(process.env.TOKEN);
