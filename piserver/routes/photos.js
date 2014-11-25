var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var photoslib = require('../libs/photos');


var photos = photoslib();

router.get('/json', function(req,res){
	try{
		photos.get( function(err, data){
			res.json(data);
		});
	}
	catch(e){
		console.log(e);
	}
});

router.post('/', function(req, res) {
	console.log(req.body);

	if(req.body._method === 'delete'){
		photos.remove(req, function(err, docs){
			if(err){
				console.log(err);
				res.send(err);
			}
			else{
				res.json(docs);
			}
		});
	}
	else{
		photos.add(req, function(err, items){
			if(err){
				console.log(err);
				res.redirect(req.get('referer'));
			}
			else{
				res.redirect("/#photos");
			}
		});
	}
});

module.exports = router;