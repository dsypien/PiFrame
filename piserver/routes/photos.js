var express = require('express'),
 	router = express.Router();

router.get('/', function(req, res){
	res.render('photos', {title: 'Photos'});
});

router.post('/', function(req, res, next){
	console.log(req.body);
	console.log(req.files);
});

module.exports = router;