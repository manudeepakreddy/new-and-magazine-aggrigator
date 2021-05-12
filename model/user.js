const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const UserSchema = new mongoose.Schema(
	{
		firstname:{ type: String, required: true},
		lastname:{ type: String, required: true},
		username: { type: String, required: true, unique: true },
		password: { type: String }
	},
	{ collection: 'users' }
);
UserSchema.plugin(passportLocalMongoose);
const user = mongoose.model('UserSchema', UserSchema)

module.exports = user
