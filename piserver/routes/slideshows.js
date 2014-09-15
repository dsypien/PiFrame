var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

router.get("/new", function(req,res){
	res.render('slides_new', {title: 'Add Slideshow'});
});

router.get("/edit", function(req, res){
	res.render('slides_edit', {title: 'Edit Slideshow'});
});

router.get("/delete", function(req,res){
	res.render('slides_delete', {title: 'Delete Slideshow'});
});

module.exports = router;