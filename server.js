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


const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

mongoose.connect('mongodb://localhost:27017/newsdb', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})



const app = express()
var ejs=require('ejs')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
app.set('view engine','ejs')
app.get('/', (req, res) => {
	News.find({}, function(err, news){
		res.render('index', {
			newsList:news,user
		})
	})
})

app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json({
	limit: '50mb'
  }));
  
  app.use(bodyParser.urlencoded({
	limit: '50mb',
	parameterLimit: 100000,
	extended: true 
  }));
  app.get("/search", async(req, res) => {
	var Searchelement=req.query.searchelement.split(" ");
	regex = ""
	for(var i=0;i<Searchelement.length;i++){
		regex+="(?=.*"+Searchelement[i]+")"
	}
	News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, news){
		if(news.length<3){
			regex=""
			regex=Searchelement.join("|");
			News.find({$or:[{newtitle:{"$regex":regex, "$options":"i"}},{description:{"$regex":regex, "$options":"i"}}]}, function(err, exnews){
				res.render('index',{
					newsList:exnews
				})
			})
		}
		else{
			res.render('index', {
				newsList:news
			})
		}
	})
})

app.get('/magazine.ejs', async(req , res)=> {
	Mags.find({}, function(err, mags){
		res.render('magazine',{
			magsList:mags
		})
	})
})
app.get('/sports.ejs', async(req , res)=> {
	News.find({type_of_news: "Sports"}, function(err, news){
		res.render('sports',{
			newsList:news
		})
	})
})
app.get('/politics.ejs', async(req , res)=> {
	News.find({type_of_news: "Politics"}, function(err, news){
		res.render('politics',{
			newsList:news
		})
	})
})
app.get('/entertainment.ejs', async(req , res)=> {
	News.find({type_of_news: "Entertainment"}, function(err, news){
		res.render('entertainment',{
			newsList:news
		})
	})
})
app.get('/buisness.ejs', async(req , res)=> {
	News.find({type_of_news: "Buisness"}, function(err, news){
		res.render('buisness',{
			newsList:news
		})
	})
})
app.get('/health.ejs', async(req , res)=> {
	News.find({type_of_news: "Health"}, function(err, news){
		res.render('health',{
			newsList:news
		})
	})
})
app.get('/technology.ejs', (req , res)=> {
	News.find({type_of_news: "Technology"}, function(err, news){
		res.render('technology',{
			newsList:news
		})
	})
})

app.use(require("express-session")({
    secret:"askfj;dlkjsldkjfa;kjdsf;lkjsd;flkjsdlkfj;lkjsdf;ljlkjsdf",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
app.get("/profileindex",(req,res) =>{
	News.find({}, function(err, news){
		res.render("profileindex",{
			newsList:news
		})
	})
})
//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
	}),function (req, res){
	if(req){
		console.log(req)
	}
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,firstname:req.body.firstname,lastname: req.body.lastname}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
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
        next();
    }
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
		console.log('NEws inserted successfully: ', response)
	} catch (error) {
		throw error
	}

	res.json({ status: 'ok' })
})
app.post('/api/insertmags', async(req,res) => {
	const{ title, image, pdf} = req.body
	

	if (!title || typeof title !== 'string') {
		return res.json({ status: 'error', error: 'Invalid title' })
	}

	if (!image) {
		return res.json({ status: 'error', error: 'Invalid image' })
	}

	if (!pdf) {
		return res.json({ status: 'error', error: 'Invalid document' })
	}
	try {
		const response = await Mags.create({
			title,
			image,
			pdf
		})
		console.log('Magazine inserted successfully: ', response)
	} catch (error) {
		throw error
	}

	res.json({ status: 'ok' })
})
app.listen(9999, () => {
	console.log('Server up at 9999')
})
