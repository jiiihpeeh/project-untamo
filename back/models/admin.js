const mongoose = require("mongoose");

let Schema = mongoose.Schema({
    userID:String,
    adminToken:String,
    ttl:Number,
    createdAt: { type: Date, expires: '12m', default: Date.now }
})

module.exports = mongoose.model("AdminSession",Schema);