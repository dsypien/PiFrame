var express = require('express'),
	router = express.Router();
var busboy = require('connect-busboy');
var fs = require('fs');
var path = require("path");

router.get('/', function(req, res){
	res.render('photos', {title: 'Photos'});
});

router.post('/', function(req, res) {
	try{
		var fstream;
		console.log(req);
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(path.join(__dirname, '../../pics/', filename));
            file.pipe(fstream);
            fstream.on('close', function () {    
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