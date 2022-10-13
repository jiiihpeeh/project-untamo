const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
const deviceModel = require("../models/device");
const qrModel = require("../models/qrpair");
const router = express.Router();
const crypto = require("crypto");
const tStamppi = require("../modules/tstamppi");


router.get("/alarm",function(req,res) {
	console.log(tStamppi(),"GET /api/alarm");
	let query={"user":req.session.user}
	alarmModel.find(query,function(err,alarms) {
		if(err) {
			console.log(tStamppi(),"Failed to find alarms. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   GET /api/alarm/ SUCCESS")
		return res.status(200).json(alarms);
	})
});

router.get("/admin",function(req,res) {
	console.log(tStamppi(),"GET /api/admin");
	var usercreds = new Array();
	
	userModel.find({},function(err,usersList) {
		if(err) {
			console.log(tStamppi(),"Failed to find users. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   GET /api/admin/ SUCCESS")
		console.log(tStamppi(),"User list length: "+usersList.length)
		
		for (let i = 0; i < usersList.length; i++) {
			var tempusercreds1 = JSON.parse('{"screenname":"'+usersList[i].screenname+'"}');
			var tempusercreds2 = JSON.parse('{"email":"'+usersList[i].user+'"}');
			var tempusercreds3 = JSON.parse('{"id":"'+usersList[i].id+'"}');
			var tempusercreds = Object.assign(tempusercreds1, tempusercreds2, tempusercreds3);
			usercreds.push(tempusercreds)
		}
		return res.status(200).json(usercreds);
	})
});


router.post("/alarm",function(req,res) {
	console.log(tStamppi(),"POST /api/alarm")
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.alarmID) {
		return res.status(400).json({message:"Bad request"});
	}
	let alarm = new alarmModel({
		alarmID:req.body.alarmID,
		deviceID:req.body.deviceID,
		basetime:req.body.basetime,
        user:req.session.user
	})
	alarm.save(function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to create alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   POST /api/alarm SUCCESS")
		return res.status(201).json({message:"New Alarm Created"});
	})
})

router.delete("/alarm/:id",function(req,res) {
	console.log(tStamppi(),"DELETE /api/alarm:"+req.params.id)
	alarmModel.deleteOne({"_id":req.params.id,"user":req.session.user},
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
	if(!req.body.alarmID) {
		return res.status(400).json({message:"Bad request"});
	}
	let alarm = {
		alarmID:req.body.alarmID,
		deviceID:req.body.deviceID,
		basetime:req.body.basetime,
        user:req.session.user
	}
	alarmModel.replaceOne({"_id":req.params.id,"user":req.session.user},alarm,function(err) {
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
	deviceModel.deleteOne({"deviceName":req.params.id,"userID:":req.session.userID},
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
        user:req.session.userID,
		id:req.body.id
	};
	deviceModel.replaceOne({"_id":req.params.id,"userID":req.session.userID},device,function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to update a device. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})

//session data
router.get("/issessionvalid", function(req,res) {
	return res.status(200).json({status: true});
});


// EDIT USER
router.put("/editUser/:user",function(req,res) {
	console.log(tStamppi(),"PUT /api/editUser:"+req.params.user)
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.firstname) {	
		return res.status(400).json({message:"Bad request"});	
	}
	if(!req.body.lastname) {	
		return res.status(400).json({message:"Bad request"});	
	}
	if(!req.body.user) {	
		return res.status(400).json({message:"Bad request"});	
	}
	let tempScrnName = req.body.firstname+" "+req.body.lastname
	let tempUser = {
		firstname:req.body.firstname,
		lastname:req.body.lastname,
		user:req.params.user,
		screenname:tempScrnName
		}
	userModel.replaceOne({"user":req.body.user},tempUser,function(err) {
		if(err) {
			console.log(tStamppi(),"Failed to update user. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})


//qrpairing

router.post("/qrToken",function(req,res) {
	console.log('checking out new qrpost');
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	let qrToken = crypto.randomBytes(64).toString("hex");

	let now=Date.now();
	let qrKey = new qrModel({
		qrToken: qrToken,
		userID: req.session.userID,
		ttl: now + 60000
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
module.exports = router;