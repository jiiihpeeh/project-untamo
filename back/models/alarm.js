const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    occurence:String,
    time:String,
    wday:Array,
    date:String,
    label:String,
    devices:Array,
    device_ids:Array,
    snooze:Array,
    user:{type:String,index:true}
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Alarm",Schema);