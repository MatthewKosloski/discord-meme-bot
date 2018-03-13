const fetch = require('node-fetch');

const subreddits = require('../subreddits');
const utils = require('../utils');

/**
 * A MemeFetcher class that fetches a meme
 * from a predefined array of subreddits
 * and returns an object containing a URL
 * to the meme and the subreddit from which
 * it came.
 *
 * Example output:
 * {subreddit: 'me_irl', image: https://i.redd.it/yi7lydatc5k01.jpg}
 */
class MemeFetcher {
	/**
	 * Calls this.getImage and returns an object
	 * literal with two keys: image and subreddit.
	 * If no subreddit is provided, a random one
	 * will be chosen.
	 * @param {String} subreddit; The subreddit to
	 * fetch a meme from.
	 */
	constructor(subreddit) {
		if (subreddit !== undefined && typeof subreddit !== 'string') {
			throw new Error(
				'Argument "subreddit" to MemeFetcher must be a string.'
			);
		}
		this.subreddit = subreddit || utils.getRandomArrayItem(subreddits);
		this.url = `https://www.reddit.com/r/${this.subreddit}/.json`;
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
	 * Simply returns an array of images from
	 * this.subreddit.
	 *
	 * @return {Promise}
	 */
	getImages() {
		return this.fetchSubredditJSON().then(subredditJSON =>
			this.extractImagesFromSubredditJSON(subredditJSON)
		);
	}

	/**
	 * Returns an Object that contains a key for the
	 * fetched images (array) and one for the subreddit
	 * from which they came (string).
	 *
	 * Example: {subreddit: "", images: []}
	 *
	 * @return {Promise => Object}
	 */
	getImagesAndSubreddit() {
		return this.getImages().then(images => ({
			subreddit: this.subreddit,
			images: images
		}));
	}

	/**
	 * Returns a random image from the fetched images.
	 * @return {Promise => String}
	 */
	getImage() {
		return this.getImages().then(images =>
			utils.getRandomArrayItem(images)
		);
	}

	/**
	 * Performs a GET request to the subreddit.
	 * @return {Promise}
	 */
	fetchSubredditJSON() {
		return fetch(this.url).then(res => res.json());
	}

	/**
	 * Takes the subreddit data and reduces it
	 * to a single value, an array of image URLs.
	 * @param {Array}
	 * @return {Array}
	 */
	extractImagesFromSubredditJSON(subredditJSON) {
		const reducer = (acc, { data: { url } }) => {
			if (this.isUrlAnImage(url)) acc.push(url);
			return acc;
		};

		return subredditJSON.data.children.reduce(reducer, []);
	}
}

module.exports = MemeFetcher;
