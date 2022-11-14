const mongoose = require("mongoose");
let Schema = mongoose.Schema({
    qrToken: String,
    qrOriginator: String,
    userID: String,
    ttl:Number,
    createdAt: { type: Date, expires: '2m', default: Date.now }
});

Schema.virtual("id").get(function() {
    return this._id;
})

module.exports = mongoose.model("QRPairing",Schema);