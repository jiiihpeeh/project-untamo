const express = require("express");
const alarm = require("../models/alarm");
const alarmModel = require("../models/alarm");

const router = express.Router();


router.get("/alarm",function(req,res) {
	let query={"user":req.session.user}
	alarmModel.find(query,function(err,alarms) {
		if(err) {
			console.log("Failed to find alarms. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		return res.status(200).json(alarms);
	})
});

router.post("/alarm",function(req,res) {
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
		return res.status(201).json({message:"Created"});
	})
})

router.delete("/alarm/:id",function(req,res) {
	alarmModel.deleteOne({"_id":req.params.id,"user":req.session.user},
	function(err) {
		if(err) {
			console.log("Failed to remove alarm. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		return res.status(200).json({message:"Success"});
	})
})

router.put("/alarm/:id",function(req,res) {
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
			console.log("Failed to update ite. Reason",err);
			return res.status(500).json({message:"Internal server error"});
		}
		return res.status(200).json({message:"Success"});
	})
})

module.exports = router;