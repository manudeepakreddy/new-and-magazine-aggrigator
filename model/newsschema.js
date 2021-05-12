const mongoose = require('mongoose')

const NewsSchema = new mongoose.Schema(
	{
		newtitle:{ type: String, required: true},
		description:{ type: String, required: true},
		type_of_news:{type:String, required:true},
		image: { type: Buffer,contentType:String, required: true},
		date:{type: Date, default: Date.now}
	},
	{ collection: 'news' }
)

const news = mongoose.model('NewsSchema', NewsSchema)


module.exports = news
