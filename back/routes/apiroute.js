const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
const deviceModel = require("../models/device");
const qrModel = require("../models/qrpair");
const adminModel = require("../models/admin")
const sessionModel = require("../models/session");
const router = express.Router();
const crypto = require("crypto");
const tStamppi = require("../modules/tstamppi");
const bcrypt = require('bcrypt')
const zxcvbn = require("zxcvbn");
const e = require("express");
const asyncHandler = require('express-async-handler');
const guessCount =  1000000000;
const time_to_live_diff = 365*24*60*60*1000//3600000;


router.get("/alarms",function(req,res) {
	console.log(tStamppi(),"GET /api/alarms");
	console.log("USER request alarm",req.session.userID)
	let query={"user":req.session.userID}
	alarmModel.find(query,function(err,alarms) {
		if(err) {
			console.log(tStamppi(),"Failed to find alarms. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   GET /api/alarm/ SUCCESS")
		//console.log(alarms)
		return res.status(200).json(alarms);
	})
});


router.post("/alarm/",function(req,res) {
	console.log(tStamppi(),"POST /api/alarm")
	console.log(tStamppi(),"POST "+req.params)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.occurence) {
		return res.status(400).json({message:"Bad request"});
	}
	let alarm = new alarmModel({
		user:req.session.userID,
		occurence:req.body.occurence,
		time:req.body.time,
		weekdays:[...new Set(req.body.weekdays)],
        date:req.body.date,
		label:req.body.label,
		devices:[...new Set(req.body.devices)],
		active:req.body.active,
		tone:req.body.tone,
		fingerprint: req.body.fingerprint,
		modified: req.body.modified,
		closeTask: req.body.closeTask
	})
	console.log("ALARMID:"+alarm.id)
	alarm.save(function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to create alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   POST /api/alarm SUCCESS")
		return res.status(201).json({message:"Alarm creation success",alarm:alarm});
	})
})

router.delete("/alarm/:id",function(req,res) {
	console.log(tStamppi(),"DELETE /api/alarm: ID:"+req.params.id)
	alarmModel.deleteOne({"_id":req.params.id},
	function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to remove alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   DELETE /api/alarm SUCCESS")
		return res.status(200).json({message:"Success"});
	})
})

router.put("/alarm/:id",function(req,res) {
	console.log(req.body)
	console.log(tStamppi(),"PUT /api/alarm:"+req.params.id)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.id) {
		return res.status(400).json({message:"Bad request"});
	}
	let alarm = {
		_id:req.body.id,
		id:req.body.id,
		date:req.body.date,
		devices:[...new Set(req.body.devices)],
		label:req.body.label,
		occurence:req.body.occurence,
		time:req.body.time,
		weekdays:[...new Set(req.body.weekdays)],
        user:req.session.userID,
		active:req.body.active,
		tone:req.body.tone,
		fingerprint: req.body.fingerprint,
		modified: req.body.modified,
		closeTask: req.body.closeTask
	}
	if(req.body.snooze && Array.isArray(req.body.snooze)) {
		alarm.snooze = req.body.snooze
	}
	alarmModel.replaceOne({"_id":req.params.id,"user":req.session.userID},alarm,function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to update alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		console.log(tStamppi(),"   PUT /api/alarms SUCCESS");
		return res.status(200).json({message:"Success"});
	})
})

//devices No idea if it works


router.get("/devices",function(req,res) {
	let query={"userID":req.session.userID};
	deviceModel.find(query,function(err,devices) {
		if(err) {
			console.log(tStamppi(),"Failed to find devices. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		let deviceMap = [];
		console.log(devices);
		for (let i =0; i<devices.length;i++){
			let deviceObj = {deviceName: devices[i].deviceName, id: devices[i].id};
			if(devices[i].type !== undefined){
				deviceObj.type = devices[i].type;
			}
			deviceMap.push(deviceObj);
		}
		return res.status(200).json(deviceMap);
	})
});

router.post("/device",function(req,res) {
	console.log('checking out new device');
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	console.log(req.body);
	if(!req.body.deviceName) {
		return res.status(400).json({message:"Bad request"});
	}
	let deviceType = "Other";
	if(req.body.type){
		deviceType = req.body.type;
	}
	let device = new deviceModel({
		userDevice: `${req.session.userID}@${req.body.deviceName}`,
		deviceName:req.body.deviceName,
		userID: req.session.userID,
		type: deviceType
	});
	device.save(function(err, saved) {
		if(err) {
			console.log(tStamppi(),"Failed to add a device. Reason",err);
			return res.status(500).json({message:`Internal server error.`, code: err.code});
		}
		//return res.status(201).json({message:"New Device Created"});
		//onsole.log(saved)
		return res.status(201).json({message: "Success. Device Created", device: saved.deviceName, id: saved._id, type: saved.type});
	})
})

router.delete("/device/:id",function(req,res) {
	console.log(tStamppi(),"deleting")
	deviceModel.deleteOne({"_id":req.params.id},
	function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to remove device. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})

router.put("/device/:id",function(req,res) {
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.id || !req.body.deviceName) {
		return res.status(400).json({message:"Bad request"});
	}
	let device = {
		userDevice: `${req.session.userID}@${req.body.deviceName}`,
		deviceName:req.body.deviceName,
        userID:req.session.userID,
		id:req.body.id,
		type: req.body.type
	};
	deviceModel.replaceOne({"_id":req.params.id},device,function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to update a device. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})

//session data
router.get("/is-session-valid", function(req,res) {
	console.log("token validated");
	return res.status(200).json({status: true});
});

router.post("/refreshToken", function(req,res) {
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.token) {
		return res.status(400).json({message:"Bad request"});
	}
	console.log("refreshing token ", req.body.token);
	const randLength = Math.floor(Math.random()*10)
	let token = crypto.randomBytes(64 + randLength).toString("hex");
	let time = Date.now() + time_to_live_diff

	//console.log(token, session, req.session.sessionID)

	sessionModel.deleteOne({"token":req.headers.token},function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to update a token. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		let session= new sessionModel({
			time:time,
			token:token,
			userID: req.session.userID
		})
		session.save(function(err) {
			if(err) {
				console.log(tStamppi(),"Saving session failed. Reason",err);
				return res.status(500).json({message:"Internal server error"})
			}
			return res.status(200).json(
										{
											token:token, 
											time: time
										});
		})
	})
});



// EDIT USER
router.put("/editUser/:email",function(req,res) {
	console.log(tStamppi(),"PUT /api/editUser:"+req.params.email)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}

	if(!req.body.email) {	
		return res.status(400).json({message:"No username/email"});	
	}
	if(!req.body.screenName) {	
		return res.status(400).json({message:"You should have profile name"});	
	}
	if(!req.body.password) {	
		return res.status(400).json({message:"No password was given"});	
	}
	if ('change_password' in req.body){
		if(zxcvbn(req.body.change_password).guesses < guessCount){
			console.log(tStamppi(),"Password too weak");
			return res.status(400).json({message:"Password is too obvious"}); 
		}
	}
	let query={"id":req.session.userID}
	userModel.findOne(query,function(err,user) {
		if(err) {
			console.log(tStamppi(),"Failed to find user. Reason",err);
			return res.status(500).json({message:"Couldn't find the user!!! This might be critical. Please log out and log in."});
		}

		bcrypt.compare(req.body.password,user.password,function(err,success) {
			if(err) {
				console.log(tStamppi(),"Comparing passwords failed. Reason",err);
				console.log(err)
				return res.status(500).json({message:"Original password did not match"});
			}
			if(!success) {
				return res.status(401).json({message:"Original password did not match"});
			}
			let input_password = req.body.password;
			let tempUser = {
				email:req.body.email,
				password:user.password,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				screenName: req.body.screenName,
				admin:user.admin,
				owner: user.owner
			}
			if ('change_password' in req.body){
				input_password = req.body.change_password;
				bcrypt.hash(input_password,14,function(err,hash) {
					if(err) {
						return res.status(400).json({message:"Failed to hash password"}); 
					}
					tempUser.password = hash;
					userModel.replaceOne({"id":req.session.userID},tempUser,function(err) {
						if(err) {
							console.log(tStamppi(),"Failed to update user. Reason",err);
							return res.status(500).json({message:"Failed to update user"});
						}
						return res.status(200).json({message:"Success"});
					})
				})
			}else {
				userModel.replaceOne({"id":req.session.userID},tempUser,function(err) {
					if(err) {
						console.log(tStamppi(),"Failed to update user. Reason",err);
						return res.status(500).json({message:"Failed to update user"});
					}
					return res.status(200).json({message:"Success"});
				})
			}


		})

	})

})


//qrpairing

router.post("/qrToken",function(req,res) {
	console.log('checking out new qrpost');
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	let qrToken = crypto.randomBytes(96).toString("hex");

	let now=Date.now();
	let qrKey = new qrModel({
		qrToken: qrToken,
		userID: req.session.userID,
		qrOriginator: req.headers.token,
		ttl: now + 17000
	});
	qrKey.save(function(err, saved) {
		if(err) {
			console.log("Failed to generate QRToken. Reason",err);
			return res.status(500).json({message:`Internal server error.`, code: err.code});
		}
		//return res.status(201).json({message:"New Device Created"});
		console.log(saved)
		return res.status(201).json({message: "Success. QRToken Created", key: saved.qrToken});
	})
})

router.get('/user', asyncHandler(async(req, res) => {
	let query={"_id":req.session.userID}
	try {
		let user = await  userModel.findOne(query);

		return res.status(201).json({
			email:user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			screenName: user.screenName,
			admin: user.admin
		});
	}catch(err){
		return res.status(500).json({message:`Internal server error.`, code: err.code});
	}

}))


router.post('/admin', asyncHandler(async(req, res) => {
	console.log("admin ", req.session.userID)
	let user = {};
	let query={"_id":req.session.userID};
	try{
		user = await  userModel.findOne(query);
		console.log("user ", user, req.body.password)
		if(!user || (user.admin === false)){
			return res.status(401).json({message:"Can not give admin rights"});
		}
		let success = await bcrypt.compare(req.body.password,user.password);
		console.log(success)
		if(!success){
			return res.status(401).json({message:"Can not give admin rights. Wrong password!"});
		}
	}catch(err){
		return res.status(500).json({message:`Internal server error.`, code: err.code});
	}
	
	let adminToken = crypto.randomBytes(128).toString("hex");
	let ttl = Date.now() + (10*60*1000);
	let admin = new adminModel( {
		userID: req.session.userID,
		adminToken: adminToken,
		time: ttl
	});
	//let adminObject = {};
	try{
		adminObject = await admin.save();
	}catch(err){
		return res.status(500).json({message:`Internal server error.`, code: err.code});
	}
	return res.status(201).json({adminToken:adminToken, time:ttl});
}))

module.exports = router;
