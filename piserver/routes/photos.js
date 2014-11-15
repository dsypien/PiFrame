var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var photoslib = require('./libs/photos');
var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');

var photos = photoslib();

router.get('/json', function(req,res){
	try{
		photos.get( req.dbprovider, function(data){
			res.json(data);
		});
	}
	catch(e){
		console.log(e);
	}
});

router.post('/', function(req, res) {
	console.log(req.headers);
	var fstream,
		db = req.db,
		photos,
		insert_statement;


	if(req.body._method === 'delete'){
		console.log("Deleteing pic with id " + req.body.id);
		
		//extract file data
		collection.find({_id: req.body.id}, function(err, doc){
			if(err){
				res.json(500, error);
			}
			else{
				console.log(doc);
				//Remove from db
				collection.remove({_id: req.body.id}, function(err){
					if(err){
						res.json(500, error);
					}
					else{
						//Remove file
						fs.unlink(path.join(__dirname, '../../pics/', doc[0].name), function(delErr){
							if(delErr){
								console.log(delErr);
							}
							else{
								console.log("succesfully deleted " + doc[0].name );
							}
						});
						//Remove thumbnail
						fs.unlink(path.join(__dirname, '../public/thumbnails/', doc[0].thumb_name), function(delErr){
							if(delErr){
								console.log(delErr);
								res.send(delErr);
							}
							else{
								console.log("succesfully deleted" +  doc[0].thumb_name );
								//res.redirect("/#photos");
								collection.find({}, {}, function(e, docs){
									res.json(docs);
								});
							}
						});
					}
				});
			}
		});
	}
	else{
		photos.addPhoto(req, function(err){
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