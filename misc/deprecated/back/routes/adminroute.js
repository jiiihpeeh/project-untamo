const express = require("express");
const alarmModel = require("../models/alarm");
const userModel = require("../models/user");
const deviceModel = require("../models/device");
const sessionModel = require("../models/session");

const router = express.Router();
const crypto = require("crypto");
const tStamppi = require("../modules/tstamppi");
const e = require("express");
const asyncHandler = require('express-async-handler');


//We are extra careful here... extra work and database calls are needed. 
//Only things that should change are active and admin statuses or user deletion (incl related devices + alarms).
//owner should always remain as active and as an admin... as well as remaining the owner. 
//Calls will not modify the owner.

const formUserData = (data) => {
	let usersData = []
	for(const user of data){
		let userData = {
			userID: `${user.id}`,
			email: user.email,
			active: user.active,
			admin: user.admin,
			owner: user.owner
		}
		usersData.push(userData);
	}
	return usersData;
}

router.get("/users",asyncHandler(async(req,res) => {
	let users = [];
	try{
		users = await userModel.find();
	}catch(err){
		return res.status(500).json({message:"Internal server error"});
	}
	let usersData = formUserData(users);

	return res.status(200).json(usersData);

}));



router.put("/user/:id",asyncHandler(async(req,res) => {
	let user = {};
	let query = {'_id': req.params.id}
	console.log('BODY ', req.body)
	try{
		user = await userModel.findOne(query);
	}catch(err){
		return res.status(500).json({message:"Internal server error. Database Error."});
	}
	if(!user){
		return res.status(500).json({message:"Internal server error. Can not find user"});
	}
	if(req.session.userID === req.params.id){
		return res.status(403).json({message:"Can not modify itself"});
	}
	if(user.hasOwnProperty('owner')){
		if(user.owner){
			return res.status(403).json({message:"Can not modify the owner"});
		}
	}
	if( (typeof(req.body.active) === 'boolean') && (typeof(req.body.admin) === 'boolean') ){
		user.admin = req.body.admin;
		user.active = req.body.active;
		if(!user.active){
			try{
				await sessionModel.deleteMany({userID: req.params.id});
			}catch(err){
				return res.status(500).json({message:"Internal server error. Failed to remove sessions.", error: err});
			}
		}
		console.log("Trying to update ", user)
		try{
			await userModel.replaceOne({'_id': req.params.id}, user);
		}catch(err){
			return res.status(500).json({message:"Internal server error. Failed to update", error: err});
		}
		let users = [];
		try{
			users = await userModel.find();
		}catch(err){
			return res.status(500).json({message:"Internal server error"});
		}
		let usersData = formUserData(users);
		return res.status(200).json(usersData);
	}else{
		return res.status(403).json({message:"Bad request"});
	};
}));



router.delete("/user/:id",asyncHandler(async(req,res) => {
	let user = {};
	let query = {'_id': req.params.id}
	try{
		user = await userModel.findOne(query);
	}catch(err){
		return res.status(500).json({message:"Internal server error"});
	}
	if(!user){
		return res.status(500).json({message:"Internal server error"});
	}
	if( req.session.userID === req.params.id){
		return res.status(403).json({message:"Can not delete itself"});
	}
	if(user.hasOwnProperty('owner')){
		if(user.owner){
			return res.status(403).json({message:"Can not delete the owner"});
		};
	};
	if(user.hasOwnProperty('admin')){
		if(user.admin){
			return res.status(403).json({message:"Can not delete an admin"});
		};
	};

	try{
		await sessionModel.deleteMany({userID: req.params.id});
		await deviceModel.deleteMany({userID: req.params.id});
		await alarmModel.deleteMany({user: req.params.id});
		await userModel.deleteOne({_id: req.params.id});
	}catch(err){
		return res.status(500).json({message:"Internal server error", error: err});
	}
	
	let users = [];
	try{
		users = await userModel.find();
	}catch(err){
		return res.status(500).json({message:"Internal server error"});
	}
	let usersData = formUserData(users);
	return res.status(200).json(usersData);
}));


module.exports = router;
