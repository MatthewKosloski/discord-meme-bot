import MemeFetcher from './';

const IMG_REGEX = /[.](jpe?g)|(png)|(gif)$/;

test('Argument "subreddit" should be a string', () => {
	expect(() => {
		new MemeFetcher('iamverysmart');
	}).not.toThrow('Argument "subreddit" to MemeFetcher must be a string.');
});

describe('prototype.getImagesAndSubreddit', () => {
	let actual;
	const subreddit = 'iamverysmart';

	beforeAll(() => {
		return Promise.resolve(
			new MemeFetcher(subreddit).getImagesAndSubreddit()
		).then(res => {
			actual = res;
		});
	});

	test('Gets memes from the subreddit that was passed in', () => {
		expect(actual.subreddit).toBe(subreddit);
	});
});

describe('prototype.getImages', () => {
	let actual;

	beforeAll(() => {
		return Promise.resolve(new MemeFetcher().getImages()).then(res => {
			actual = res;
		});
	});

	test('Should return an array of images', () => {
		expect(actual).toEqual(
			expect.arrayContaining([expect.stringMatching(IMG_REGEX)])
		);
	});
});

describe('prototype.getImagesAndSubreddit', () => {
	let actual;

	beforeAll(() => {
		return Promise.resolve(new MemeFetcher().getImagesAndSubreddit()).then(
			res => {
				actual = res;
			}
		);
	});

	test('Should return an object like: {subreddit: "", images: ["photo.jpg|png|jpeg"]}', () => {
		const expected = {
			subreddit: expect.any(String),
			images: expect.arrayContaining([expect.stringMatching(IMG_REGEX)])
		};

		expect(actual).toEqual(expect.objectContaining(expected));
	});
});

describe('prototype.getImage', () => {
	let actual;

	beforeAll(() => {
		return Promise.resolve(new MemeFetcher().getImage()).then(res => {
			actual = res;
		});
	});

	test('Should return just one image', () => {
		expect(actual).toEqual(expect.stringMatching(IMG_REGEX));
	});
});

describe('prototype.isUrlAnImage', () => {
	test('Should only return true for URLs that end in .jpg, .jpeg, or .png', () => {
		const instance = new MemeFetcher();
		expect(instance.isUrlAnImage('alpha.html')).toBeFalsy();
		expect(instance.isUrlAnImage('bravo.jpg')).toBeTruthy();
		expect(instance.isUrlAnImage('charlie.jpeg')).toBeTruthy();
		expect(instance.isUrlAnImage('delta.png')).toBeTruthy();
	});
});

describe('prototype.extractImagesFromSubredditJSON', () => {
	test('Should only return strings that are image URLs', () => {
		let subredditJSON = {
			data: {
				children: [
					{ data: { url: 'alpha.html' } },
					{ data: { url: 'bravo.jpg' } },
					{ data: { url: 'charlie.jpeg' } },
					{ data: { url: 'delta.png' } }
				]
			}
		};

		const actual = new MemeFetcher().extractImagesFromSubredditJSON(
			subredditJSON
		);
		expect(actual).toEqual(['bravo.jpg', 'charlie.jpeg', 'delta.png']);
	});
});
