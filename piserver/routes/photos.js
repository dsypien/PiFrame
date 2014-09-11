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
		console.log(docs);
		res.render('photos', {
			title: 'Photos',
			photolist: docs
		});
	});
});

router.delete("/:id", function(req, res){
	//Remove from db
	console.log("Deleteing pic with id " + req.params.id);
	//Remove file

	//Remove thumbnail
});

router.post('/', function(req, res) {
	try{
		var fstream,
			db = req.db,
			collection = db.get('photo_collection');

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
            		}
            	});

                console.log("Upload Finished of " + filename);              
                res.redirect('back');           //where to go next
            });
        });
	}
	catch(err){
		console.log(err);
	}
});

module.exports = router;