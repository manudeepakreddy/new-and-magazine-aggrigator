const mongoose = require('mongoose')

const magSchema = new mongoose.Schema(
	{
		title:{ type: String, required: true},
		image: { type: Buffer,contentType:String, required: true},
		description:{ type: String, required: true},
        pdf : { type: Buffer,contentType:String, required: true},
		issued:{type:String, required: true},
        date:{type: Date, default: Date.now}
	},
	{ collection: 'mags' }
)

const mags = mongoose.model('magSchema', magSchema)


module.exports = mags
