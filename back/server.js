const express = require("express");
const apiroute = require("./routes/apiroute");
const cors = require('cors')
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const mongoose = require("mongoose");
const userModel = require("./models/user");
const sessionModel = require("./models/session");
const user = require("./models/user");

const formScreenName = require('./modules/form_screenname')

const zxcvbn = require('zxcvbn');

const formChecker  = require('./modules/formcheck')


let app = express();

const expressWs = require('express-ws')(app);


app.use(express.json());
app.use(cors())
let port = process.env.PORT || 3001;

//MONGOOSE CONNECTION
const mongo_user=process.env.MONGODB_USERNAME;
const mongo_password=process.env.MONGODB_PASSWORD;
const mongo_url=process.env.MONGODB_URL;

mongoose.connect ("mongodb+srv://"+mongo_user+":"+mongo_password+"@"+mongo_url+"/untamodatabase?retryWrites=true&w=majority").then( () => console.log("Connected to mongodb"),(err) => console.log("Failed to connect. Reason",err));

mongoose.set("toJSON",{virtuals:true});

let registeredUsers = [];
let loggedSessions = [];
const time_to_live_diff = 365*24*60*60*1000//3600000;
const time_to_live_diff_admin = 10*60*1000

const guessCount =  1000000000
//MIDDLEWARE

createToken = () => {
	let token = crypto.randomBytes(64);
	return token.toString("hex");
}

isUserLogged = (req,res,next) => {
	if(!req.headers.token) {
		return res.status(403).json({message:"Forbidden!"});
	}
	sessionModel.findOne({"token":req.headers.token},function(err,session) {
		if(err) {
			console.log("Failed to find session. Reason",err);
			return res.status(403).json({message:"Forbidden"})
		}
		if(!session) {
			return res.status(403).json({message:"Forbidden"})
		}
		let now=Date.now();
		if(now>session.ttl) {
			sessionModel.deleteOne({"_id":session._id},function(err) {
				if(err) {
					console.log("Failed to remove session. Reason",err)
				}
				return res.status(403).json({message:"Forbidden"})
			})
		} else {
			req.session = {};
			req.session.user = session.user;
			session.ttl = now+time_to_live_diff;
			session.save(function(err) {
				if(err) {
					console.log("Failed to resave session. Reason",err);
				}
				return next()
			})
		}
	})
}




// LOGIN API:

app.post("/register",function(req,res) {
	if(!req.body) {														// jos POSTissa ei bodyä:
		return res.status(400).json({message:"Bad Request"});
	}
	if(!req.body.email || !req.body.password) {						// jos POSTissa ei 'username'a tai 'password'ia:
		return res.status(400).json({message:"Bad Request"});
	}
	if(req.body.email.length < 4 || req.body.password.length < 6) {	// jos username alle 4 tai password alle 6 merkkiä:
		return res.status(400).json({message:"Bad Request"}); 
	}
	if (!formChecker(req.body)){
		return res.status(400).json({message:"Bad Request. Password carries too much user information"}); 
	}
	if(zxcvbn(req.body.password).guesses < guessCount){
		return res.status(400).json({message:"Bad Request. Password is too obvious"}); 
	}
	
	bcrypt.hash(req.body.password,14,function(err,hash) { 				// hashaa salasana
		if(err) {
			return res.status(400).json({message:"Bad Request"}); 
		}
		
		let user = new userModel({
			user:req.body.email,
			password:hash,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			screenname: formScreenName(req.body)
		})
		user.save(function(err,user) {
			if(err) {
				console.log("Failed to create user. Reason",err);
				if(err.code === 11000) {
					return res.status(409).json({message:"Username already in use"})
				}
				return res.status(500).json({message:"Internal server error"})
			}
			if(!user) {
				return res.status(500).json({message:"Internal server error"})
			}
			return res.status(201).json({message:"User registered!"});
		})
	})
})

app.post("/login",function(req,res) {
	if(!req.body) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(!req.body.user || !req.body.password) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(req.body.user.length < 4 || req.body.password.length < 6) {
		return res.status(400).json({message:"Bad Request"}); 
	}
	userModel.findOne({"user":req.body.user},function(err,user) {
		if(err) {
			console.log("Failed to login. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		if(!user) {
			return res.status(401).json({message:"Unathorized"})
		}
		bcrypt.compare(req.body.password,user.password,function(err,success) {
			if(err) {
				console.log("Comparing passwords failed. Reason",err);
				return res.status(500).json({message:"Internal server error"})
			}
			if(!success) {
				return res.status(401).json({message:"Unauthorized"})
			}
			let token=createToken();
			let now=Date.now();
			let session= new sessionModel({
				user:req.body.user,
				ttl:now + time_to_live_diff,
				token:token
			})
			session.save(function(err) {
				if(err) {
					console.log("Saving session failed. Reason",err);
					return res.status(500).json({message:"Internal server error"})
				}
				return res.status(200).json({token:token, user: user.user, 
					screenname:user.screenname, firstname: user.firstname, lastname:user.lastname});
			})
		})
	})
});

app.post("/logout",function(req,res) {
	if(!req.headers.token) {
		return res.status(404).json({message:"Not found"});
	}
	sessionModel.deleteOne({"token":req.headers.token}, function(err) {
		if(err) {
			console.log("Failed to logout user. Reason",err)
		}
		return res.status(200).json({message:"Logged out"});
	})
})


app.ws('/registercheck', function(ws, req) {

    ws.on('message', function(msgs) {
        let msg = JSON.parse(msgs)
        //console.log(msg)
        let report = {type:null, content:null, original: msg}
        switch (msg.query) {
            case "zxcvbn":
                report.type = "zxcvbn"
                let pwmsg = msg.password.slice(0, 35)
                report.content = zxcvbn(pwmsg)
				report.content.server_minimum = guessCount
                break
            case "form":
              	let pass = formChecker(msg)
                report.type = "form"
                report.content = pass

                break
            default:
                break
        }
        console.log(report)
        delete report.original.query
        ws.send(JSON.stringify(report))
    });
    console.log('socket', req.testing)
});


//app.use('/resources', isUserLogged, express.static('resources'))
app.use('/resources', express.static('resources'))



app.use("/api",isUserLogged,apiroute);

app.listen(port);

console.log("***************************");
console.log("* PROJECT UNTAMO: BACKEND *");
console.log("***************************");
console.log("");
console.log("Running in port",port);
console.log("");
