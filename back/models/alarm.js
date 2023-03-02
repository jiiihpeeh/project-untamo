const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    occurence:String,
    time:String,
    weekdays:Array,
    date:String,
    label:String,
    devices:Array,
    snooze:Array,
    tone: {type:String,default:'rooster'},
    active:{type:Boolean,default:true},
    user:{type:String,index:true}
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Alarm",Schema);