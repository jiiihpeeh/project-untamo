const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    alarmID:String,
    deviceID:String,
    basetime:Date,
    user:{type:String,index:true}
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Alarm",Schema);