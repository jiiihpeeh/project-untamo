const mongoose = require("mongoose");

let Schema = mongoose.Schema({
    // user:{type:String,index:true},
    userID:String,
    token:{type:String,index:true},
    time:Number
})
Schema.virtual("id").get(function() {
    return this._id;
});
module.exports = mongoose.model("Session",Schema);