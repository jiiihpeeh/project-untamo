const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    deviceName:String,
    user:String,
    userID: String,
    type: String,
    userDevice:{type:String, unique:true},
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Device",Schema);