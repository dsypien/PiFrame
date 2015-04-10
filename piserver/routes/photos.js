var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var photoslib = require('../libs/photos');
var slidesLib = require("../libs/slides");

var photos = photoslib();
var slides = slidesLib();

// GET JSON PHOTOS ARRAY
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

// ADD/REMOVE PHOTOS
router.post('/', function(req, res) {
	console.log(req.body);

	if(req.body._method === 'delete'){
		photos.remove(req, function(err, docs){
			if(err){
				console.log(err);
				res.send(err);
			}
			else{
				// Remove the pic from any slides that have it
				slides.removePicFromSlides(req.body.id, function(err){
					res.send(docs);	
				});
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
				photos.get( function(err, data){
					res.json(data);
				});
			}
		});
	}
});

module.exports = router;