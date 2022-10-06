const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
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
	let query={"user":req.session.user}
	deviceModel.find(query,function(err,devices) {
		if(err) {
			console.log("Failed to find devices. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		return res.status(200).json(devices);
	})
});



router.post("/device",function(req,res) {
	if(!req.body) {
		return res.status(400).json({message:"Bad request"});
	}
	if(!req.body.deviceID) {
		return res.status(400).json({message:"Bad request"});
	}
	let device = new deviceModel({
		deviceID:req.body.deviceID,
		deviceName:req.body.devicename,
        user:req.session.user
	})
	device.save(function(err) {
		if(err) {
			console.log("Failed to add a device. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		return res.status(201).json({message:"New Device Created"});
	})
})

router.delete("/device/:id",function(req,res) {
	deviceModel.deleteOne({"_id":req.params.id,"user":req.session.user},
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
	if(!req.body.alarmID) {
		return res.status(400).json({message:"Bad request"});
	}
	let device = {
		deviceID:req.body.deviceID,
		devicenName:req.body.devicename,
        user:req.session.user
	}
	deviceModel.replaceOne({"_id":req.params.id,"user":req.session.user},device,function(err) {
		if(err) {
			console.log("Failed to update a device. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})


module.exports = router;