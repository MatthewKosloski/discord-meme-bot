/**
 * Returns a random integer between min and max (inclusive).
 * @param min {Number}
 * @param max {Number}
 * @return {Number}
 */
const getRandomIntInclusive = (min = 1, max = 10) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random array item.
 * @param arr {Array}
 * @return {Any}
 */
const getRandomArrayItem = arr => arr[getRandomIntInclusive(0, arr.length - 1)];

module.exports = {
	getRandomIntInclusive,
	getRandomArrayItem
};
