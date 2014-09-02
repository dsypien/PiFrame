var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

module.exports = router;