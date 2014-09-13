var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;

router.get('/', function(req, res){
	var db = req.db;
	var collection = db.get('photo_collection');

	collection.find({},{}, function(e, docs){
		res.render('photos', {
			title: 'Photos',
			photolist: docs
		});
	});
});

router.post('/', function(req, res) {
	console.log(req.headers);
	var fstream,
		db = req.db,
		collection = db.get('photo_collection');

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
								res.json({message: "Delete Successful"});
							}
						});
					}
				});
			}
		});
	}
	else{
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            var destPath = path.join(__dirname, '../../pics/');
            var destFile = path.join(__dirname, '../../pics/', filename);
            var thumb_name = filename.replace('.', '_thumb.');

            fstream = fs.createWriteStream(destFile);
            file.pipe(fstream);
            fstream.on('close', function () {    
            	// Create thumbnail;
            	thumbnail({
            		source: destPath,
            		destination: path.join(__dirname, '../public/thumbnails/'),
            		width: 250,
            		overwrite: true
            	});

            	// Store data in db
            	collection.insert({name: filename, thumb_name: thumb_name}, function(err, doc){
            		if(err){
            			console.log(err);
            		}
            		else{
            			// Added a little time so that thumbnail is accessible
            			setTimeout(function(){
            				res.json({message: "Photo Sucessfuly Added"});
            			}, 500);
            		}
            	});
            });
        });
	}
});

module.exports = router;