const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    userDevice:{type:String, unique:true},
    deviceName:String,
    user:String,
    userID: String,
    type: String
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Device",Schema);