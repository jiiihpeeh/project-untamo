const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    occurrence:String,
    time:String,
    weekdays:Array,
    date:String,
    label:String,
    devices:Array,
    snooze:Array,
    tone: {type:String,default:'rooster'},
    active:{type:Boolean,default:true},
    user:{type:String,index:true},
    modified:{type: Number, default: Date.now()},
    fingerprint:{type: String, default: ""},
    closeTask:{type: Boolean, default: false}
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("Alarm",Schema);
