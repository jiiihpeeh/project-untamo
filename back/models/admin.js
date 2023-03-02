const mongoose = require("mongoose");

let Schema = mongoose.Schema({
    userID:String,
    token:String,
    time:Number,
    createdAt: { type: Date, expires: '12m', default: Date.now }
})
Schema.virtual("id").get(function() {
    return this._id;
});
module.exports = mongoose.model("AdminSession",Schema);