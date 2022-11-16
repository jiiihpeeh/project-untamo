const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
const deviceModel = require("../models/device");
const qrModel = require("../models/qrpair");
const adminModel = require("../models/admin")
const router = express.Router();
const crypto = require("crypto");
const tStamppi = require("../modules/tstamppi");
const bcrypt = require('bcrypt')
const zxcvbn = require("zxcvbn");
const e = require("express");
const asyncHandler = require('express-async-handler');
const guessCount =  1000000000;





router.get("/alarms",function(req,res) {
	console.log(tStamppi(),"GET /api/alarms");
	let query={"user":req.session.userID}
	alarmModel.find(query,function(err,alarms) {
		if(err) {
			console.log(tStamppi(),"Failed to find alarms. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   GET /api/alarm/ SUCCESS")
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
		wday:req.body.wday,
        date:req.body.date,
		label:req.body.label,
		device_ids:req.body.device_ids,
		active:req.body.active
	})
	console.log("ALARMID:"+alarm._id)
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
	console.log(tStamppi(),"PUT /api/alarm:"+req.params.id)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body._id) {
		return res.status(400).json({message:"Bad request"});
	}
	let alarm = {
		_id:req.body._id,
		date:req.body.date,
		device_ids:req.body.device_ids,
		label:req.body.label,
		occurence:req.body.occurence,
		time:req.body.time,
		wday:req.body.wday,
        user:req.session.userID,
		active:req.body.active
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
		let devmap = [];
		console.log(devices);
		for (let i =0; i<devices.length;i++){
			let dobj = {deviceName: devices[i].deviceName, id: devices[i].id};
			if(devices[i].type !== undefined){
				dobj.type = devices[i].type;
			}
			devmap.push(dobj);
		}
		return res.status(200).json(devmap);
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
router.get("/issessionvalid", function(req,res) {
	console.log("token validated");
	return res.status(200).json({status: true});
});


// EDIT USER
router.put("/editUser/:user",function(req,res) {
	console.log(tStamppi(),"PUT /api/editUser:"+req.params.user)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}

	if(!req.body.user) {	
		return res.status(400).json({message:"No username/email"});	
	}
	if(!req.body.screenname) {	
		return res.status(400).json({message:"You should have profile name"});	
	}
	if(!req.body.current_password) {	
		return res.status(400).json({message:"No password was given"});	
	}
	if ('change_password' in req.body){
		if(zxcvbn(req.body.change_password).guesses < guessCount){
			console.log(tStamppi(),"Password too weak");
			return res.status(400).json({message:"Password is too obvious"}); 
		}
	}
	let query={"_id":req.session.userID}
	userModel.findOne(query,function(err,user) {
		if(err) {
			console.log(tStamppi(),"Failed to find user. Reason",err);
			return res.status(500).json({message:"Couldn't find the user!!! This might be critical. Please log out and log in."});
		}

		bcrypt.compare(req.body.current_password,user.password,function(err,success) {
			if(err) {
				console.log(tStamppi(),"Comparing passwords failed. Reason",err);
				console.log(err)
				return res.status(500).json({message:"Original password did not match"});
			}
			if(!success) {
				return res.status(401).json({message:"Original password did not match"});
			}
			let input_password = req.body.current_password;
			let tempUser = {
				user:req.body.user,
				password:user.password,
				firstname: req.body.firstname,
				lastname: req.body.lastname,
				screenname: req.body.screenname,
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
					userModel.replaceOne({"_id":req.session.userID},tempUser,function(err) {
						if(err) {
							console.log(tStamppi(),"Failed to update user. Reason",err);
							return res.status(500).json({message:"Failed to update user"});
						}
						return res.status(200).json({message:"Success"});
					})
				})
			}else {
				userModel.replaceOne({"_id":req.session.userID},tempUser,function(err) {
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
			user:user.user,
			firstname: user.firstname,
			lastname: user.lastname,
			screenname: user.screenname,
		});
	}catch(err){
		return res.status(500).json({message:`Internal server error.`, code: err.code});
	}

}))


router.post('/admin', asyncHandler(async(req, res) => {
	let user = {};
	let query={"_id":req.session.userID};
	try{
		user = await  userModel.findOne(query);
		if(!user || (user.admin === false)){
			return res.status(401).json({message:"Can not give admin rights"});
		}
		let success = await bcrypt.compare(req.body.password,user.password);
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
		ttl: ttl
	});
	//let adminObject = {};
	try{
		adminObject = await admin.save();
	}catch(err){
		return res.status(500).json({message:`Internal server error.`, code: err.code});
	}
	return res.status(201).json({adminToken:adminToken, ttl:ttl});
}))

module.exports = router;
