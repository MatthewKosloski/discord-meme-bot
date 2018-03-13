require('dotenv').config();

const MemeBot = require('./MemeBot');

new MemeBot({
	name: '!memebot',
	token: process.env.TOKEN
});
