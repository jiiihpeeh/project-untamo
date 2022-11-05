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





router.get("/users",asyncHandler(async(req,res) => {
	let users = [];
	try{
		users = await userModel.find();
	}catch(err){
		return res.status(500).json({message:"Internal server error"});
	}
	//console.log(users);
	let usersData = []
	for(const user of users){
		let userData = {
			userID: `${user._id}`,
			user: user.user,
			active: user.active,
			admin: user.admin,
			owner: user.owner
		}
		usersData.push(userData)
	}
	return res.status(200).json(usersData);

}));

module.exports = router;