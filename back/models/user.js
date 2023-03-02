const mongoose = require("mongoose");

let Schema = mongoose.Schema({
    email:{type:String,unique:true},
    password:String,
    firstName: String,
    lastName: String,
    screenName: String,
    active: {type: Boolean,default: true},
    admin: {type: Boolean,default: false},
    owner: {type: Boolean,default: false}
});

Schema.virtual("id").get(function() {
    return this._id;
});

module.exports=mongoose.model("User",Schema);

/*
Multiple login sources user object

let Schema = mongoose.Schema({
    local:{
        username:{type:String,unique:true},
        password:String
    },
    facebook:{
        <Facebook stuff>
    },
    google:{
        <Google stuff>
    },
    ...
})
*/