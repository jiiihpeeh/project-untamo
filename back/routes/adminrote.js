adminRouter.get("/admin",function(req,res) {
	console.log(tStamppi(),"GET /api/admin");
	var usercreds = new Array();
	
	userModel.find({},function(err,usersList) {
		if(err) {
			console.log(tStamppi(),"Failed to find users. Reason",err);
			return res.status(500).json({message:"Internal server error"})
		}
		console.log(tStamppi(),"   GET /api/admin/ SUCCESS")
		console.log(tStamppi(),"User list length: "+usersList.length)
		
		for (let i = 0; i < usersList.length; i++) {
			var tempusercreds1 = JSON.parse('{"screenname":"'+usersList[i].screenname+'"}');
			var tempusercreds2 = JSON.parse('{"email":"'+usersList[i].user+'"}');
			var tempusercreds3 = JSON.parse('{"id":"'+usersList[i].id+'"}');
			var tempusercreds = Object.assign(tempusercreds1, tempusercreds2, tempusercreds3);
			usercreds.push(tempusercreds)
		}
		return res.status(200).json(usercreds);
	})
});
