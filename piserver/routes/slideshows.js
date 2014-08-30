var express = require('express');
var router = express.Router();

router.get('/slideshows', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

module.exports = router;