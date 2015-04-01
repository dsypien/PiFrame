var express = require('express');
var router = express.Router();
var settings = require('../libs/settings')();

router.post('/', function(req,res){
	settings.play(req.body, function(err){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.status(200);
			res.send("OK");
		}
	});
});

module.exports = router;