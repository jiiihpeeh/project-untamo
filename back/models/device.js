const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    deviceID:{type:String,index:true, unique:true},
    deviceName:String,
    user:String,
    userDevice:{type:String, unique:true},
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Device",Schema);