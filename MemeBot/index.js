const Discord = require('discord.js');

const MemeFetcher = require('../MemeFetcher');
const utils = require('../utils');

class MemeBot {
	constructor({ name, token }) {
		/**
		 * We create a cache so we're not making API requests
		 * every time we want a meme.
		 */
		this.cache = null;

		this.name = name;

		this.client = new Discord.Client();

		this.client.on('ready', this.handleReady.bind(this));
		this.client.on('message', this.handleMessage.bind(this));

		this.messages = {
			handleReady: 'Memebot is ready!',
			about: 'Created by Matthew Kosloski.',
			invalidCacheArgument: 'Invalid cache argument.',
			unknownContext: 'Unknown context.',
			emptyCache: 'The cache is empty.',
			setCacheError: 'An error occurred while setting the cache!',
			onClearCache: 'The cache has been cleared.',
			onSetCache: 'Cache has been set!',
			onSendMeme: 'A meme has been sent!',
			help: `Available commands:\n\n\`${
				this.name
			} meme\` Get a random meme\n\n\`${
				this.name
			} meme <some_subreddit>\` Get a random photo from the r/<some_subreddit> subreddit.\n\n\`${
				this.name
			} cache clear\` Clear the cache. This forces Memebot to fetch a new list of memes from another subreddit.\n\n\`${
				this.name
			} cache info\` Information about the cache.\n\n\`${
				this.name
			} about\` About this bot.`
		};

		this.client.login(token);
	}

	handleReady() {
		console.log(this.messages.handleReady);
	}

	handleMessage(messageObj) {
		this.onReceiveNewMessage(
			messageObj.author.username,
			messageObj.content
		);
		if (messageObj.content.startsWith(this.name)) {
			this.processMessage(messageObj);
		}
	}

	/**
	 * !memebot meme (Give me a meme from a random subreddit)
	 * !memebot meme iamverysmart (Give me a photo from the iamverysmart subreddit)
	 * !memebot cache clear|info (Clear cache or show info)
	 * !memebot about (Info about the bot)
	 */
	processMessage(messageObj) {
		const [, context, argument] = messageObj.content.split(' ');

		switch (context) {
			case 'meme':
				this.processMemeContext(messageObj, argument);
				break;
			case 'cache':
				this.processCacheContext(messageObj, argument);
				break;
			case 'about':
				this.processAboutContext(messageObj);
				break;
			case 'help':
				this.processHelpContext(messageObj);
				break;
			default:
				this.processUnknownContext(messageObj);
		}
	}

	processMemeContext(messageObj, subreddit) {
		// Do API request if a subreddit is defined
		if (subreddit !== undefined) {
			this.setCacheAndSend(messageObj, subreddit);
		} else {
			/**
			 * If no subreddit defined, only do
			 * API request if cache is empty.
			 */
			this.checkCacheBeforeSend(messageObj);
		}
	}

	processCacheContext(messageObj, argument) {
		if (argument === 'clear') {
			this.clearCache(messageObj);
		} else if (argument === 'info') {
			this.sendCacheInfo(messageObj);
		} else {
			messageObj.channel.send(this.messages.invalidCacheArgument);
		}
	}

	processAboutContext(messageObj) {
		messageObj.channel.send(this.messages.about);
	}

	processHelpContext(messageObj) {
		messageObj.channel.send(this.messages.help);
	}

	processUnknownContext(messageObj) {
		messageObj.channel.send(this.messages.unknownContext);
	}

	clearCache(messageObj) {
		this.cache = null;
		this.onClearCache(messageObj);
	}

	getCachedMemesLength() {
		if (this.cache !== null && this.cache.hasOwnProperty('images')) {
			return this.cache.images.length;
		} else {
			return 0;
		}
	}

	getCacheSubreddit() {
		if (this.cache !== null && this.cache.hasOwnProperty('subreddit')) {
			return this.cache.subreddit;
		}
	}

	getCacheInfo() {
		if (this.getCachedMemesLength()) {
			return `There are ${this.getCachedMemesLength()} items in the cache.\nThese items are from the r/${this.getCacheSubreddit()} subreddit.`;
		} else {
			return this.messages.emptyCache;
		}
	}

	sendCacheInfo(messageObj) {
		messageObj.channel.send(this.getCacheInfo());
	}

	setCache(subreddit) {
		return Promise.resolve(
			new MemeFetcher(subreddit).getImagesAndSubreddit()
		)
			.then(res => {
				this.cache = res;
				this.onSetCache();
			})
			.catch(e => {
				console.log(this.messages.setCacheError);
			});
	}

	/**
	 * Cache?
	 * YES: Remove a random photo from the cache and send it.
	 * NO: Instantiate a new MemeFetcher to populate the cache, then remove a random photo from the cache and send it.
	 */
	checkCacheBeforeSend(messageObj, subreddit = undefined) {
		if (this.getCachedMemesLength() === 0) {
			this.setCacheAndSend(messageObj, subreddit);
		} else {
			this.sendMeme(messageObj, this.getMemeFromCache());
		}
	}

	setCacheAndSend(messageObj, subreddit) {
		this.setCache(subreddit).then(() => {
			this.sendMeme(messageObj, this.getMemeFromCache());
		});
	}

	sendMeme(messageObj, meme) {
		const payload = `Here's a meme from r/${
			this.cache.subreddit
		}!\n${meme}`;
		messageObj.channel.send(payload);
		this.onSendMeme(payload);
	}

	deleteMemeFromCache(meme) {
		const { images } = this.cache;
		const index = images.indexOf(meme);

		images.splice(index, 1);
		this.onDeleteMemeFromCache(meme);
	}

	getMemeFromCache() {
		const { images } = this.cache;

		const index = utils.getRandomIntInclusive(0, images.length - 1);
		const image = images[index];

		this.deleteMemeFromCache(image);
		this.onGetMemeFromCache(image);

		return image;
	}

	onGetMemeFromCache(meme) {
		// console.log(`Got meme ${meme} from cache.`);
	}

	onSendMeme(payload) {
		//console.log(this.messages.onSendMeme);
	}

	onReceiveNewMessage(author, content) {
		// console.log(`New message from ${author}: ${content}`);
	}

	onDeleteMemeFromCache(meme) {
		// console.log(
		// 	`${meme} has been deleted from the cache.\nMemes in cache now: ${this.getCachedMemesLength()}`
		// );
	}

	onSetCache() {
		//console.log(this.messages.onSetCache);
	}

	onClearCache(messageObj) {
		messageObj.channel.send(this.messages.onClearCache);
	}
}

module.exports = MemeBot;
