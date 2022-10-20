const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    occurence:String,
    time:String,
    wday:String,
    date:String,
    label:String,
    devices:Array,
    device_ids:Array,
    user:{type:String,index:true}
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Alarm",Schema);