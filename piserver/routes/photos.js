var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;

router.get('/', function(req, res){
	res.render('photos', {title: 'Photos'});
});

router.post('/', function(req, res) {
	try{
		var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            var destPath = path.join(__dirname, '../../pics/');
            var destThumbnails = path.join(__dirname, '../../thumbnails/');
            var destFile = path.join(__dirname, '../../pics/', filename);

            console.log(destFile);
            fstream = fs.createWriteStream(destFile);
            file.pipe(fstream);
            fstream.on('close', function () {    
            	// Create thumbnail;
            	thumbnail({
            		source: destPath,
            		destination: destThumbnails,
            		width: 200
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