const mongoose = require("mongoose");

let Schema = mongoose.Schema({
    user:{type:String,unique:true},
    password:String,
    firstname: String,
    lastname: String,
    screenname: String
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