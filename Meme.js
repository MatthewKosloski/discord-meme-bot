const fetch = require('node-fetch');

const subreddits = require('./subreddits');
const utils = require('./utils');

/**
 * A Meme class that fetches a meme
 * from a predefined array of subreddits
 * and returns an object containing a URL
 * to the meme and the subreddit from which
 * it came.
 *
 * Example output:
 * {subreddit: 'me_irl', image: https://i.redd.it/yi7lydatc5k01.jpg}
 */
class Meme {
	/**
	 * Calls this.getImage and returns an object
	 * literal with two keys: image and subreddit.
	 */
	constructor(subs = subreddits) {
		this.subreddit = utils.getRandomArrayItem(subs);
		this.url = `https://www.reddit.com/r/${this.subreddit}/.json`;

		return this.getImage().then(image => ({
			image,
			subreddit: this.subreddit
		}));
	}

	/**
	 * Determines if the url is an image.
	 * @param url {String}
	 * @return {Boolean}
	 */
	isUrlAnImage(url) {
		return /[.](jpe?g)|(png)|(gif)$/.test(url);
	}

	/**
	 * Returns one photo from the photos array
	 * returned by this.extractImages.
	 * @return {Promise}
	 */
	getImage() {
		return this.fetchSubRedditJSON()
			.then(subredditJSON =>
				this.extractImages(subredditJSON.data.children)
			)
			.then(images => utils.getRandomArrayItem(images));
	}

	/**
	 * Performs a GET request to the subreddit.
	 * @return {Promise}
	 */
	fetchSubRedditJSON() {
		return fetch(this.url).then(res => res.json());
	}

	/**
	 * Takes the subreddit data and reduces it
	 * to a single value, an array of URL strings.
	 * @param subredditData {Array}
	 * @return {Array}
	 */
	extractImages(subredditData) {
		const reducer = (acc, { data: { url } }) => {
			if (this.isUrlAnImage(url)) acc.push(url);
			return acc;
		};

		return subredditData.reduce(reducer, []);
	}
}

module.exports = Meme;
