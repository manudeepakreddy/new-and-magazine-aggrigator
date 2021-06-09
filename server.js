const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passportLocalMongoose =  require("passport-local-mongoose")
const User = require('./model/user')
const News = require('./model/newsschema')
const Mags = require('./model/magsschema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require("passport")
const LocalStrategy =  require("passport-local")
const session =  require("express-session")
var flash = require('connect-flash');
var fs = require('fs');
var json2csv = require('json2csv').parse;
// const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

mongoose.connect('mongodb://localhost:27017/newsdb', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})



const app = express()
var ejs=require('ejs')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
const { ObjectID } = require('bson')
app.set('view engine','ejs')

app.set('views',__dirname+'/views')
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json({
	limit: '50mb'
  }));
  
  app.use(bodyParser.urlencoded({
	limit: '50mb',
	parameterLimit: 100000,
	extended: true 
  }));
  
  
app.use(require("express-session")({
    secret:"askfj;dlkjsldkjfa;kjdsf;lkjsd;flkjsdlkfj;lkjsdf;ljlkjsdf",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));
app.use(flash());
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
	if(req.user){
		res.redirect("/profileindex")
	}
	else{
		News.find({}, function(err, news){
			res.render('index', {
				newsList:news
			})
		})
	}
	
})
  app.get("/search", async(req, res) => {
	var Searchelement=req.query.searchelement.split(" ");
	regex = ""
	for(var i=0;i<Searchelement.length;i++){
		regex+="(?=.*"+" "+Searchelement[i]+" "+")"
	}
	News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, news){
		if(news.length<1){
			regex=""
			regex=Searchelement.join("|");
			News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, exnews){
				res.render('searchresult',{
					newsList:exnews
				})
			})
		}
		else{
			res.render('searchresult', {
				newsList:news
			})
		}
	})
})

app.get('/magazine', async(req , res)=> {
	if(req.user){
		res.redirect("pmagazine")
	}
	else{
		Mags.find({}, function(err, mags){
			res.render('magazine',{
				magsList:mags
			})
		})
	}
})
app.get('/sports', async(req , res)=> {
	if(req.user){
		res.redirect("psports")
	}
	else{
		News.find({type_of_news: "Sports"}, function(err, news){
			res.render('sports',{
				newsList:news
			})
		})
	}
})
app.get('/politics', async(req , res)=> {
	if(req.user){
		res.redirect("ppolitics")
	}
	else{
		News.find({type_of_news: "Politics"}, function(err, news){
			res.render('politics',{
				newsList:news
			})
		})
	}
})
app.get('/entertainment',async(req , res)=> {
	if(req.user){
		res.redirect("pentertainment")
	}
	else{
		News.find({type_of_news: "Entertainment"}, function(err, news){
			res.render('entertainment',{
				newsList:news
			})
		})
	}
})
app.get('/buisness', async(req , res)=> {
	if(req.user){
		res.redirect("pbuisness")
	}
	else{
		News.find({type_of_news: "Buisness"}, function(err, news){
			res.render('buisness',{
				newsList:news
			})
		})
	}
})
app.get('/health', async(req , res)=> {
	if(req.user){
		res.redirect("phealth")
	}
	else{
		News.find({type_of_news: "Health"}, function(err, news){
			res.render('health',{
				newsList:news
			})
		})
	}
})
app.get('/technology', (req , res)=> {
	if(req.user){
		res.redirect("ptechnology")
	}
	else{
		News.find({type_of_news: "Technology"}, function(err, news){
			res.render('technology',{
				newsList:news
			})
		})
	}
})

app.get('/article/:id',async(req,res)=>{
	const currentid = req.params.id;
	// console.log(req.params)



// const json2csv = require('json2csv').parse;

// let csv; 

// const data = await News.find({});
// const fields = ['_id','description'];
//  try {
//         csv = json2csv(data, {fields});
		
//     } catch (err) {
//         return res.status(500).json({err});
//     }

// 	var fs = require('fs');

// fs.writeFile('C:/Users/Sree Vignesh/OneDrive/Desktop/newsandmagazines/ml/data.csv', csv, 'utf8', function (err) {
//   if (err) {
//     console.log('Some error occured - file either not saved or corrupted file saved.');
//   } else{
//     console.log('It\'s saved!');
//   }
// });

	News.find({_id: currentid}, function(err, news){
		if(err){
			console.log(err)
		}
		else{

			const axios = require('axios')

			axios
			.post('http://127.0.0.1:5000//similarity', {description: news[0].description})
			.then(mlresult => {
				// console.log(`statusCode: ${res.statusCode}`)
				var indices = mlresult.data["indices"]
				var obj_indices = indices.map(function(id){
					return ObjectID(id);
				});
				News.find({_id:{$in:obj_indices}},function(err,resultnews){
					if(err){
						console.log(err);
					}else{
						res.render('openpage',{
							newsList:resultnews,
							news
						})
					}
				})
			})
			.catch(error => {
				console.error(error)
			})
			// ctype=news[0].type_of_news;
			// News.find({$and:[{_id:{$ne:currentid}},{type_of_news:ctype}]},function(err, resultnews){
			// 	if(err){
			// 		console.log(err)
			// 	}else{
			// 		res.render('openpage',{
			// 			newsList:resultnews,
			// 			news
			// 		})
			// 	}
			// })
		}
	})
	
})
app.get('/magazineview/:id',(req,res) => {
	const currentid = req.params.id;
	Mags.find({_id: currentid},function(err, mags){
		if(err){
			console.log(err)
		}else{
			const axios = require('axios')

			axios
			.post('http://127.0.0.1:5000//magsimilarity', {description: mags[0].description})
			.then(mlresult => {
				// console.log(`statusCode: ${res.statusCode}`)
				var indices = mlresult.data["indices"]
				var obj_indices = indices.map(function(id){
					return ObjectID(id);
				});
				Mags.find({_id:{$in:obj_indices}},function(err,resultmags){
					if(err){
						console.log(err);
					}else{
						// console.log(resultmags)
						res.render('magazineview',{
							magsList:mags,
							rec_mags:resultmags
						})
					}
				})
			})
			.catch(error => {
				console.error(error)
			})
		}
		// res.render('magazineview',{
		// 	magsList:mags
		// })
	})
})
app.get("/psearch", isLoggedIn,async(req, res) => {
	var Searchelement=req.query.searchelement.split(" ");
	regex = ""
	for(var i=0;i<Searchelement.length;i++){
		regex+="(?=.*"+" "+Searchelement[i]+" "+")"
	}
	News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, news){
		if(news.length<1){
			regex=""
			regex=Searchelement.join("|");
			News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, exnews){
				res.render('psearchresult',{
					newsList:exnews,
					user:req.user
				})
			})
		}
		else{
			res.render('psearchresult', {
				newsList:news,
				user:req.user
			})
		}
	})
})
app.get("/profileindex",isLoggedIn,(req,res) =>{
	user=req.user
	News.find({}, function(err, news){
		res.render("profileindex",{
			newsList:news,
			user
		})
	})
})
app.get('/pbuisness',isLoggedIn, async(req , res)=> {
	user=req.user;
	News.find({type_of_news: "Buisness"}, function(err, news){
		res.render('pbuisness',{
			newsList:news,
			user
		})
	})
})
app.get('/ppolitics',isLoggedIn, async(req , res)=> {
	user=req.user;
	News.find({type_of_news: "Politics"}, function(err, news){
		res.render('ppolitics',{
			newsList:news,
			user
		})
	})
})
app.get('/phealth',isLoggedIn, async(req , res)=> {
	user=req.user;
	News.find({type_of_news: "Health"}, function(err, news){
		res.render('phealth',{
			newsList:news,
			user
		})
	})
})
app.get('/ptechnology',isLoggedIn, (req , res)=> {
	user=req.user;
	News.find({type_of_news: "Technology"}, function(err, news){
		res.render('ptechnology',{
			newsList:news,
			user
		})
	})
})
app.get('/pmagazine',isLoggedIn, async(req , res)=> {
	user=req.user
	Mags.find({}, function(err, mags){
		res.render('pmagazine',{
			magsList:mags,
			user
		})
	})
})
app.get('/psports',isLoggedIn, async(req , res)=> {
	user=req.user
	News.find({type_of_news: "Sports"}, function(err, news){
		res.render('psports',{
			newsList:news,
			user
		})
	})
})
app.get('/pentertainment',isLoggedIn, async(req , res)=> {
	user=req.user;
	News.find({type_of_news: "Entertainment"}, function(err, news){
		res.render('pentertainment',{
			newsList:news,
			user
		})
	})
})

app.put("/like", isLoggedIn,async(req,res)=>{
	const cid= req.body.postid;
	News.findByIdAndUpdate(cid,{
		$push:{likes:req.user.id}
	},{
		new:true
	}).exec((err,result)=>{
		// console.log(result)
		res.json(result);
	})
	})
app.put("/unlike", isLoggedIn,async(req,res)=>{
		const cid= req.body.postid;
		News.findByIdAndUpdate(cid,{
			$pull:{likes:req.user.id}
		},{
			new:true
		}).exec((err,result)=>{
			// console.log(result)
			res.json(result);
		})
		})
app.get('/particle/:id',isLoggedIn,(req,res)=>{
	user=req.user
	const currentid = req.params.id;
	// console.log(req.params)
	News.find({_id: currentid}, function(err, news){
		if(err){
			console.log(err)
		}
		else{
			const axios = require('axios')

			axios
			.post('http://127.0.0.1:5000//similarity', {description: news[0].description})
			.then(mlresult => {
				// console.log(`statusCode: ${res.statusCode}`)
				var indices = mlresult.data["indices"]
				var obj_indices = indices.map(function(id){
					return ObjectID(id);
				});
				News.find({_id:{$in:obj_indices}},function(err,resultnews){
					if(err){
						console.log(err);
					}else{
						res.render('popenpage',{
							newsList:resultnews,
							news,
							user
						})
					}
				})
			})
			.catch(error => {
				console.error(error)
			})



			// ctype=news[0].type_of_news;
			// News.find({$and:[{_id:{$ne:currentid}},{type_of_news:ctype}]},function(err, resultnews){
			// 	if(err){
			// 		console.log(err)
			// 	}else{
			// 		res.render('popenpage',{
			// 			newsList:resultnews,
			// 			news,
			// 			user
			// 		})
			// 	}
			// })
		}
	})
	
})
app.get('/pmagazineview/:id',isLoggedIn,(req,res) => {
	const currentid = req.params.id;
	user=req.user
	Mags.find({_id: currentid},function(err, mags){
		if(err){
			console.log(err)
		}
		else{
			const axios = require('axios')

			axios
			.post('http://127.0.0.1:5000//magsimilarity', {description: mags[0].description})
			.then(mlresult => {
				// console.log(`statusCode: ${res.statusCode}`)
				var indices = mlresult.data["indices"]
				var obj_indices = indices.map(function(id){
					return ObjectID(id);
				});
				Mags.find({_id:{$in:obj_indices}},function(err,resultmags){
					if(err){
						console.log(err);
					}else{
						res.render('pmagazineview',{
							magsList:mags,
							rec_mags:resultmags
						})
					}
				})
			})
			.catch(error => {
				console.error(error)
			})



			// ctype=news[0].type_of_news;
			// News.find({$and:[{_id:{$ne:currentid}},{type_of_news:ctype}]},function(err, resultnews){
			// 	if(err){
			// 		console.log(err)
			// 	}else{
			// 		res.render('popenpage',{
			// 			newsList:resultnews,
			// 			news,
			// 			user
			// 		})
			// 	}
			// })
		}

	})
})
app.get('/insertnews', isLoggedIn, (req,res) => {
	if(req.user.isadmin){
		res.render("insertnews",{
			user:req.user
		})
	}else{
		// res.render("profileindex")
		// res.send("restricted")
		res.redirect("/profileindex")
	}
})
app.get('/insertmagazines', isLoggedIn, (req,res) => {
	if(req.user.isadmin){
		res.render("insertmagazines",{
			user:req.user
		})
	}else{
		// res.render("profileindex")
		// res.send("restricted")
		res.redirect("/profileindex")
	}
})
app.get('/admindashboard', isLoggedIn, (req,res) => {
	if(req.user.isadmin){
		res.render("admindashboard",{
			user:req.user
		})
	}else{
		// res.render("profileindex")
		// res.send("restricted")
		res.redirect("/profileindex")
	}
})
//Auth Routes
app.get("/login",(req,res)=>{
	if(req.user){
		// console.log("hi")
		res.redirect("/profileindex")
	}else{
		
	var message=req.flash('error')
	// console.log(message)
    res.render("login",{message});
	}
});
app.post("/login",passport.authenticate("local",{failureRedirect:"/login",failureFlash : true}),function (req, res){
	var redirectTo='/profileindex'
	if(req.session.reqUrl){
		redirectTo = req.session.reqUrl;
		req.session.reqUrl = null;
	};
	res.redirect(redirectTo);
});
app.get("/register",(req,res)=>{
	var message="";
    res.render("register",{message});
});
app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,firstname:req.body.firstname,lastname: req.body.lastname}),req.body.password,function(err,user){
		if(err){
			console.log(err);
            var message = "User Name Already Exists"
            res.render("register",{message});
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
	req.session.reqUrl=req.originalUrl;
	// console.log(req.session.reqUrl)
	res.redirect("/login");
    
}

// app.post('/api/change-password', async (req, res) => {
// 	const { token, newpassword: plainTextPassword } = req.body

// 	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid password' })
// 	}

// 	if (plainTextPassword.length < 5) {
// 		return res.json({
// 			status: 'error',
// 			error: 'Password too small. Should be atleast 6 characters'
// 		})
// 	}

// 	try {
// 		const user = jwt.verify(token, JWT_SECRET)

// 		const _id = user.id

// 		const password = await bcrypt.hash(plainTextPassword, 10)

// 		await User.updateOne(
// 			{ _id },
// 			{
// 				$set: { password }
// 			}
// 		)
// 		res.json({ status: 'ok' })
// 	} catch (error) {
// 		console.log(error)
// 		res.json({ status: 'error', error: ';))' })
// 	}
// })

// app.post('/api/login', async (req, res) => {
// 	const { username, password } = req.body
// 	const user = await User.findOne({ username }).lean()

// 	if (!user) {
// 		return res.json({ status: 'error', error: 'Invalid username/password' })
// 	}

// 	if (await bcrypt.compare(password, user.password)) {
// 		// the username, password combination is successful

// 		const token = jwt.sign(
// 			{
// 				id: user._id,
// 				username: user.username
// 			},
// 			JWT_SECRET
// 		)

// 		return res.json({ status: 'ok', data: token })
// 	}

// 	res.json({ status: 'error', error: 'Invalid username/password' })
// })

// app.post('/api/signup', async (req, res) => {
// 	const { firstname, lastname, username, password: plainTextPassword } = req.body
	
// 	if (!firstname || typeof firstname !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid firstname' })
// 	}

// 	if (!lastname || typeof lastname !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid lastname' })
// 	}

// 	if (!username || typeof username !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid username' })
// 	}

// 	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
// 		return res.json({ status: 'error', error: 'Invalid password' })
// 	}

// 	if (plainTextPassword.length < 5) {
// 		return res.json({
// 			status: 'error',
// 			error: 'Password too small. Should be atleast 6 characters'
// 		})
// 	}

// 	const password = await bcrypt.hash(plainTextPassword, 10)

// 	try {
// 		const response = await User.create({
// 			firstname,
// 			lastname,
// 			username,
// 			password
// 		})
// 		console.log('User created successfully: ', response)
// 	} catch (error) {
// 		if (error.code === 11000) {
// 			// duplicate key
// 			return res.json({ status: 'error', error: 'Username already in use' })
// 		}
// 		throw error
// 	}

// 	res.json({ status: 'ok' })
// })

app.post('/api/insertnews', async(req,res) => {
	const{ title, description, image, type_of_news} = req.body
	

	if (!title || typeof title !== 'string') {
		return res.json({ status: 'error', error: 'Invalid firstname' })
	}

	if (!description || typeof description !== 'string') {
		return res.json({ status: 'error', error: 'Invalid lastname' })
	}

	if (!image) {
		return res.json({ status: 'error', error: 'Invalid image' })
	}
	if (!type_of_news) {
		return res.json({ status: 'error', error: 'Invalid type' })
	}
	const newtitle= type_of_news.concat(": ",title)
	try {
		const response = await News.create({
			newtitle,
			description,
			type_of_news,
			image
		})
		var newLine = '\r\n';
		
		var fields = ['_id', 'description'];
		
		var appendThis = [
		  {
			_id : response._id,
			description : response.description
		  }
		];
		
		fs.stat('./ml/data.csv', function (err, stat) {
		  if (err == null) {
			// console.log('File exists');
		
			//write the actual data and end with newline
			var csv = json2csv(appendThis,{header:false}) + newLine;
		
			fs.appendFile('./ml/data.csv', csv, function (err) {
			  if (err) throw err;
			//   console.log('The "data to append" was appended to file!');
			});
		  } else {
			//write the headers and newline
			// console.log('New file, just writing headers');
			fields = fields + newLine;
		
			fs.writeFile('./ml/data.csv', fields, function (err) {
			  if (err) throw err;
			//   console.log('file saved');
			});
			var csv = json2csv(appendThis,{header:false}) + newLine;
		
			fs.appendFile('./ml/data.csv', csv, function (err) {
			  if (err) throw err;
			//   console.log('The "data to append" was appended to file!');
			});
		  }
		});
		// console.log('News inserted successfully: ', response)
	} catch (error) {
		throw error
	}

	res.json({ status: 'ok' })
})
app.post('/api/insertmags', async(req,res) => {
	const{ title, image, description,issued, pdf} = req.body
	

	if (!title || typeof title !== 'string') {
		return res.json({ status: 'error', error: 'Invalid title' })
	}

	if (!image) {
		return res.json({ status: 'error', error: 'Invalid image' })
	}

	if (!pdf) {
		return res.json({ status: 'error', error: 'Invalid document' })
	}
	if(!description){
		return res.json({ status: 'error', error: 'Invalid description' })
	}
	if(!issued){
		return res.json({ status: 'error', error: 'Invalid date' })
	}
	try {
		const response = await Mags.create({
			title,
			image,
			description,
			issued,
			pdf
		})


		
		var newLine = '\r\n';
		
		var fields = ['_id', 'description'];
		
		var appendThis = [
		  {
			_id : response._id,
			description : response.description
		  }
		];
		
		fs.stat('./ml/magdata.csv', function (err, stat) {
		  if (err == null) {
			// console.log('File exists');
		
			//write the actual data and end with newline
			var csv = json2csv(appendThis,{header:false}) + newLine;
		
			fs.appendFile('./ml/magdata.csv', csv, function (err) {
			  if (err) throw err;
			//   console.log('The "data to append" was appended to file!');
			});
		  } else {
			//write the headers and newline
			// console.log('New file, just writing headers');
			fields = fields + newLine;
		
			fs.writeFile('./ml/magdata.csv', fields, function (err) {
			  if (err) throw err;
			//   console.log('file saved');
			});
			var csv = json2csv(appendThis,{header:false}) + newLine;
		
			fs.appendFile('./ml/magdata.csv', csv, function (err) {
			  if (err) throw err;
			//   console.log('The "data to append" was appended to file!');
			});
		  }
		});


		// console.log('Magazine inserted successfully: ', response)
	} catch (error) {
		throw error
	}

	res.json({ status: 'ok' })
})
app.listen(9999, () => {
	console.log('Server up at 9999')
})
