const express = require("express");
const apiroute = require("./routes/apiroute");
const adminroute = require("./routes/adminroute");
const cors = require('cors')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const userModel = require("./models/user");
const sessionModel = require("./models/session");
const adminModel = require("./models/admin")
const user = require("./models/user");
const formScreenName = require('./modules/form_screenname')
const zxcvbn = require('zxcvbn');
const formChecker  = require('./modules/formcheck');
const session = require("./models/session");
const tStamppi = require("./modules/tstamppi");
const asyncHandler = require('express-async-handler')
const qrModel = require("./models/qrpair");

let app = express();



const expressWs = require('express-ws')(app);


app.use(express.json());
app.use(cors())
let port = process.env.PORT || 3001;


const WebSocket = require('ws');
//Internal Websocket
let serverSocket = new WebSocket("ws://localhost:3001/action");

serverSocket.onopen = function(e) {
	//console.log(e)
	//console.log(e.upgradeReq)
	//console.log("[open] Connection established");
	//console.log("Sending to server");
	serverSocket.send(JSON.stringify("Message to websocket"));
  };
  
  serverSocket.onmessage = function(event) {
	console.log(`[message] Data received from server: ${event.data}`);
  };
  
  serverSocket.onclose = function(event) {
	if (event.wasClean) {
		console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
	} else {
	  // e.g. server process killed or network down
	  // event.code is usually 1006 in this case
	  console.log('[close] Connection died');
	}
  };
  
  serverSocket.onerror = function(error) {
	console.log(`[error]`);
  };





//MONGOOSE CONNECTION
const mongo_user=process.env.MONGODB_USERNAME;
const mongo_password=process.env.MONGODB_PASSWORD;
const mongo_url=process.env.MONGODB_URL;

//const mongoAddress="mongodb://127.0.0.1:27017/untamo?retryWrites=true&w=majority"
//console.log(mongoAddress)
//mongoose.connect (mongoAddress).then( () => console.log(tStamppi(),"Connected to mongodb"),(err) => console.log(tStamppi(),"Failed to connect. Reason",err));


mongoose.connect ("mongodb+srv://"+mongo_user+":"+mongo_password+"@"+mongo_url+"/untamodatabase?retryWrites=true&w=majority").then( () => console.log(tStamppi(),"Connected to mongodb"),(err) => console.log(tStamppi(),"Failed to connect. Reason",err));

mongoose.set("toJSON",{virtuals:true});

let registeredUsers = [];
let loggedSessions = [];
const time_to_live_diff = 365*24*60*60*1000//3600000;
const time_to_live_diff_admin = 10*60*1000

const guessCount =  1000000000

//MIDDLEWARE

createToken = () => {
	const randLength = Math.floor(Math.random()*10)
	let token = crypto.randomBytes(64 + randLength);
	return token.toString("hex");
}

isUserLogged = (req,res,next) => {
	if(!req.headers.token) {
		return res.status(403).json({message:"Forbidden!"});
	}
	//console.log(req.headers)
	sessionModel.findOne({"token":req.headers.token},function(err,session) {
		if(err) {
			console.log(tStamppi(),"Failed to find session. Reason",err);
			return res.status(403).json({message:"Forbidden"})
		}
		if(!session) {
			return res.status(403).json({message:"Forbidden"})
		}
		serverSocket.send(JSON.stringify({mode: 'api', url: req.originalUrl, token: req.headers.token, userID: session.userID }));
		let now=Date.now();
		if(now>session.time) {
			sessionModel.deleteOne({"_id":session._id},function(err) {
				if(err) {
					console.log(tStamppi(),"Failed to remove session. Reason",err)
				}
				return res.status(403).json({message:"Forbidden"})
			})
		} else {
			req.session = {};
			req.session.sessionID = session._id;
			req.session.userID = session.userID;
			session.time = now+time_to_live_diff;
			session.save(function(err) {
				if(err) {
					console.log(tStamppi(),"Failed to resave session. Reason",err);
				}
				return next()
			})
		}
	})
}

isUserAdmin = (req,res,next) => {
	
	if(!req.headers.token) {
		return res.status(403).json({message:"Forbidden!"});
	}
	adminModel.findOne({"adminToken":req.headers.adminToken},function(err,adminSession) {
		if(err) {
			console.log(tStamppi(),"Failed to find session. Reason",err);
			return res.status(403).json({message:"Forbidden"})
		}
		//console.log("SURVIVED", adminSession);
		if(!adminSession) {
			return res.status(403).json({message:"Forbidden"})
		}
		
		let now=Date.now();
		if(now>adminSession.time) {
			adminModel.deleteOne({"_id":adminSession.id},function(err) {
				if(err) {
					console.log(tStamppi(),"Failed to remove session. Reason",err)
				}
				return res.status(403).json({message:"Forbidden"})
			})
		} else {
			return next()
		}
	})
}


// LOGIN API:

app.post("/register", asyncHandler( async(req,res) => {
	console.log(tStamppi(),"/register");
	console.log(req.body)
	if(!req.body) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(!req.body.email || !req.body.password) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(req.body.email.length < 4 || req.body.password.length < 6) {
		return res.status(400).json({message:"Bad Request"}); 
	}
	if (!formChecker(req.body)){
		return res.status(400).json({message:"Bad Request. Password carries too much user information"}); 
	}
	if(zxcvbn(req.body.password).guesses < guessCount){
		return res.status(400).json({message:"Bad Request. Password is too obvious"}); 
	}
	let hash = ''
	try {
		hash = await bcrypt.hash(req.body.password,14)
	}catch(err){
		return res.status(400).json({message:"Bad Request"}); 
	}
	let userCount = 0;
	try{
		userCount = await userModel.count()
	}catch(err){
		return res.status(500).json({message:"Internal server error"})
	}
	let admin = userCount === 0
	let user = new userModel({
		    email:req.body.email,
			password:hash,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			screenName: formScreenName(req.body),
			admin: admin,
			owner: admin
		})
	
	try{
		console.log("User: ",user)
		user.id= user._id
	    user = await user.save(user);
		console.log("User: ",user)
	}
	catch(err){
		console.log(tStamppi(),"Failed to create user. Reason",err);
		if(err.code === 11000) {
			return res.status(409).json({message:"Username already in use"})
		}
		return res.status(500).json({message:"Internal server error"})
	}

	if(!user) {
		return res.status(500).json({message:"Internal server error"})
	}
			
	return res.status(201).json({message:"User registered!"});
}))

app.post("/login",function(req,res) {
	console.log(tStamppi(),"/login");
	console.log(req.body)
	if(!req.body) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(!req.body.email || !req.body.password) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(req.body.email.length < 4 || req.body.password.length < 6) {
		return res.status(400).json({message:"Bad Request"}); 
	}
	userModel.findOne({"email":req.body.email},function(err,user) {
		if(err) {
			console.log(tStamppi(),"Failed to login. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		if(!user) {
			return res.status(401).json({message:"Unathorized"})
		}
		if(user && user.hasOwnProperty('active') && (user.active === false)){
			return res.status(401).json({message:"User freezed!"});
		}
		console.log(user)
		bcrypt.compare(req.body.password,user.password,function(err,success) {
			if(err) {
				console.log(tStamppi(),"Comparing passwords failed. Reason",err);
				return res.status(500).json({message:"Internal server error"})
			}
			if(!success) {
				return res.status(401).json({message:"Unauthorized"})
			}

			let token=createToken();
			let now=Date.now();
			let time = now + time_to_live_diff
			let session= new sessionModel({
				email:req.body.email,
				time:time,
				token:token,
				userID: user._id
			})
			session.save(function(err) {
				if(err) {
					console.log(tStamppi(),"Saving session failed. Reason",err);
					return res.status(500).json({message:"Internal server error"})
				}
				return res.status(200).json({token:token, 
											email: user.email, 
											screenName:user.screenName, 
											firstName: user.firstName, 
											lastName:user.lastName, 
											admin: user.admin,
											owner: user.owner,
											time: time
										});
			})
		})
	})
});


app.post("/qr-login",function(req,res) {
	console.log(tStamppi(),"/login");
	if(!req.body) {
		return res.status(400).json({message:"Bad Request"});
	}
	if(!req.body.token ) {
		return res.status(400).json({message:"Bad Request"});
	}
	let query = {"qrToken":req.body.token};

	qrModel.findOne( query , function(err,qrpair) {
		if(err) {
			console.log(tStamppi(),"Failed to login. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		if(!qrpair) {
			console.log(" PAIR not FOUND");
			return res.status(401).json({message:"Unauthorized"});
		}
		let now = Date.now();
		if(now > qrpair.time){
			return res.status(401).json({message:"Unauthorized"});
		}
		userModel.findOne({"_id":qrpair.userID},function(err,user) {
			if(err) {
				console.log(tStamppi(),"Comparing passwords failed. Reason",err);
				return res.status(500).json({message:"Internal server error"});
			}
			if(!user) {
				return res.status(401).json({message:"Unauthorized"});
			}

			let sessionToken=createToken();
			let time = Date.now() + time_to_live_diff
			let session= new sessionModel({
				time: time,
				token:sessionToken,
				userID: user._id
			})
			session.save(function(err) {
				if(err) {
					console.log(tStamppi(),"Saving session failed. Reason",err);
					return res.status(500).json({message:"Internal server error"});
				}
				//serverSocket.send(JSON.stringify({mode: 'api', url: `/qrlogin/${}`, token: sessionToken, userID: session.userID }));
				return res.status(200).json(
												{
													token:sessionToken, 
													email: user.email, 
													screenName:user.screenName, 
													firstName: user.firstName, 
													lastName:user.lastName, 
													admin: user.admin,
													time: time
												}
											);
			})
		})
	})
});




app.post("/logout",function(req,res) {
	console.log(tStamppi(),"/logout");
	//console.log(req.headers)
	if(!req.headers.token) {
		return res.status(404).json({message:"Not found"});
	}
	sessionModel.deleteOne({"token":req.headers.token}, function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to logout user. Reason",err)
		}
		return res.status(200).json({message:"Logged out"});
	})
})



app.ws('/register-check', function(ws, req) {

    ws.on('message', function(msgs) {
        let msg = JSON.parse(msgs)
        //console.log(msg)
        let report = {type:null, content:null, original: msg}
        switch (msg.query) {
            case "zxcvbn":
                report.type = "zxcvbn"
                let passwordMsg = msg.password.slice(0, 35)
				let zxcvbnReport = zxcvbn(passwordMsg)
                report.content = {guesses: zxcvbnReport.guesses, server_minimum : guessCount, score: zxcvbnReport.score}
				console.log(report.content)
                break
            case "form":
				let pass = formChecker(msg)
                report.type = "form"
                report.content = pass

                break
            default:
                break
        }
        console.log(tStamppi(),report)
        delete report.original.query
        ws.send(JSON.stringify(report))
    });
    console.log(tStamppi(),'socket', req.testing)
});

var headersSocketMap = new Map()
var userHeadersMap = new Map()
var headersUserMap = new Map()
var tokenHeadersMap = new Map()
var tokenUserMap = new Map()

app.ws('/action/:token', asyncHandler(async(ws, req) => {
    //console.log(req.headers);
	let token = req.params.token
    let headers = req.headers['sec-websocket-key']
	//console.log(headers)
    ws.on('message',asyncHandler(async (msgs) => {
		let msg = {}
		try{
          msg = JSON.parse(msgs)
		  //console.log(msg)
		}catch(err){
			console.log(err)
		};
		if(msg && msg.hasOwnProperty('mode') && msg.mode === 'client' && msg.hasOwnProperty('token')){
			const getSession = async (token) => {
				try{
					const foundSession = await sessionModel.findOne({"token":token});
					console.log(foundSession)
					return foundSession;
				}catch(err){
					return null;
				}
			}

			let session = await getSession(msg.token);
			//console.log(session)

		    if(!session) {
					console.log('session invalid');
			}else{
				if(!userHeadersMap || !userHeadersMap.has(session.userID)){
					userHeadersMap.set(session.userID, new Set([ headers ]));
					//console.log('created headers map', userHeadersMap);
				}else{
					let existingHeaderSet = userHeadersMap.get(session.userID)//.add(headers))
					userHeadersMap.set(session.userID, existingHeaderSet.add(headers));
					//console.log(userHeadersMap);
				}
				headersUserMap.set(headers,session.userID);
				tokenHeadersMap.set(msg.token, headers);					
				tokenUserMap.set(msg.token, session.userID);
				headersSocketMap.set(headers, ws);
				//console.log(userHeadersMap)
			}

		}
		if (msg && msg.hasOwnProperty('mode') && msg.mode === 'api' && msg.hasOwnProperty('token') && msg.hasOwnProperty('url')){
			console.log(userHeadersMap);
			let calledUser = tokenUserMap.get(msg.token);
			console.log(calledUser)
			let callingHeader = tokenHeadersMap.get(msg.token);
			let availHeaders = null;
			if(calledUser && userHeadersMap && callingHeader){
				availHeaders = Array.from(userHeadersMap.get(calledUser));
				availHeaders = availHeaders.filter(head => head !== callingHeader);
			}
			//console.log('avail ', availHeaders);

			//availHeaders.delete(callingHeader);
			if(availHeaders && headersSocketMap){
				console.log("CALLER", callingHeader);
				for(const client of availHeaders){
					console.log("CALLING", client);
					try{
						headersSocketMap.get(client).send(JSON.stringify({ url:msg.url}));
					}catch(err){
						console.log(err);
					}
				}
			}

		}
		if(msg && msg.hasOwnProperty('mode') && msg.mode === 'ping'){
			ws.send(JSON.stringify({mode:'pong'}));
		}
    }));
	ws.on('close', asyncHandler(async(msgs) => {
		console.log('closing...')
		let closingUser = (headersUserMap.has(headers)) ? headersUserMap.get(headers) : null;
		if(closingUser){
			let userHeaders = (userHeadersMap.has(closingUser))? userHeadersMap.get(closingUser): null;
			if(userHeaders){
				userHeaders.delete(headers)
				userHeadersMap.set(closingUser, userHeaders);
			}
			headersUserMap.delete(headers);
			headersSocketMap.delete(headers);

		}
	}))
}));



//app.use('/resources', isUserLogged, express.static('resources'))
app.use('/audio-resources', isUserLogged, express.static('audio-resources'))

app.use("/api",isUserLogged,apiroute);
app.use("/admin",isUserLogged, isUserAdmin, adminroute);


app.listen(port);

console.log("***************************");
console.log("* PROJECT UNTAMO: BACKEND *");
console.log("***************************");
console.log("");
console.log(tStamppi(),"Running in port",port);
console.log("");
