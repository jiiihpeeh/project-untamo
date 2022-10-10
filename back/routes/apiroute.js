const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
const deviceModel = require("../models/device");
const router = express.Router();


router.get("/alarm",function(req,res) {
	console.log("GET /api/alarm");
	let query={"user":req.session.user}
	alarmModel.find(query,function(err,alarms) {
		if(err) {
			console.log("Failed to find alarms. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log("   GET /api/alarm/ SUCCESS")
		return res.status(200).json(alarms);
	})
});

router.get("/admin",function(req,res) {
	console.log("GET /api/admin");
	var usercreds = new Array();
	
	userModel.find({},function(err,usersList) {
		if(err) {
			console.log("Failed to find users. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log("   GET /api/admin/ SUCCESS")
		console.log("User list length: "+usersList.length)
		
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
	console.log("POST /api/alarm")
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
			console.log("Failed to create alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log("   POST /api/alarm SUCCESS")
		return res.status(201).json({message:"New Alarm Created"});
	})
})

router.delete("/alarm/:id",function(req,res) {
	console.log("DELETE /api/alarm:"+req.params.id)
	alarmModel.deleteOne({"_id":req.params.id,"user":req.session.user},
	function(err) {
		if(err) {
			console.log("Failed to remove alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log("   DELETE /api/alarm SUCCESS")
		return res.status(200).json({message:"Success"});
	})
})

router.put("/alarm/:id",function(req,res) {
	console.log("PUT /api/alarm:"+req.params.id)
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
			console.log("Failed to update alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		console.log("   PUT /api/alarms SUCCESS")
		return res.status(200).json({message:"Success"});
	})
})

//devices No idea if it works


router.get("/devices",function(req,res) {
	let query={"userID":req.session.userID}
	deviceModel.find(query,function(err,devices) {
		if(err) {
			console.log("Failed to find devices. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		let devmap = []
		console.log(devices)
		for (let i =0; i<devices.length;i++){
			let dobj = {deviceName: devices[i].deviceName, id: devices[i].id}
			if(devices[i].type !== undefined){
				dobj.type = devices[i].type
			}
			devmap.push(dobj)
		}
		return res.status(200).json(devmap);
	})
});



router.post("/device",function(req,res) {
	console.log('checking out new device')
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	console.log(req.body)
	if(!req.body.deviceName) {
		return res.status(400).json({message:"Bad request"});
	}
	let deviceType = "Other";
	if(req.body.type){
		deviceType = req.body.type
	}
	let device = new deviceModel({
		deviceName:req.body.deviceName,
		userID: req.session.userID,
		type: deviceType,
		userDevice: `${req.session.userID}@${req.body.deviceName}`
	})
	device.save(function(err, saved) {
		if(err) {
			console.log("Failed to add a device. Reason",err);
			return res.status(500).json({message:`Internal server error.`, code: err.code})
		}
		//return res.status(201).json({message:"New Device Created"});
		console.log(saved)
		return res.status(201).json({message: "Success. Device Created", device: saved.deviceName, id: saved._id, type: saved.type});
	})
})

router.delete("/device/:id",function(req,res) {
	console.log("deleting")
	deviceModel.deleteOne({"deviceName":req.params.id,"userID:":req.session.userID},
	function(err) {
		if(err) {
			console.log("Failed to remove device. Reason",err);
			return res.status(500).json({message:"Internal server error"})
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
		devicenName:req.body.deviceName,
        user:req.session.userID,
		id:req.body.id,
		userDevice: `${req.session.userID}@${req.body.deviceName}`
	}
	deviceModel.replaceOne({"_id":req.params.id,"userID":req.session.userID},device,function(err) {
		if(err) {
			console.log("Failed to update a device. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})

//session data
router.get("/issessionvalid", function(req,res) {
	return res.status(200).json({status: true})
});

module.exports = router;