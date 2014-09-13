var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

router.get("/new", function(req,res){

});

router.get("/edit", function(req, res){

});

router.get("/delete", function(req,res){

});

module.exports = router;