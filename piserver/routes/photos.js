var express = require('express'),
 	router = express.Router(),
 	fs = require('fs');

router.get('/', function(req, res){
	res.render('photos', {title: 'Photos'});
});

router.post('/', function(req, res, next){
	console.log(req.body);
	console.log(req.files);

	try{
    console.log(req);
	var tmp_path = req.files.fileImg.path;
	var target_path = './pics/' + req.files.fileImg.name;

	console.log('tmp:' + tmp_path);
	console.log('target:' + target_path);

	fs.rename(tmp_path, target_path, function(err){
		if(err){
			console.log(err);
			throw err;
		}

		//delete temp file
		fs.unlink(tmp_path, function(){
			if(err){
				console.log(err);
				throw err;
			}
			res.send('File uploaded to' + target_path + '/nFile Size: +' + req.files.fileImg.size + ' bytes' );
		});

	});
	}
	catch(err){
		console.log(err);
	}

});

module.exports = router;