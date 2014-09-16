var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

router.get("/new", function(req,res){
	var db = req.db;
	var collection = db.get('photo_collection');

	collection.find({}, {}, function(e, docs){
		res.render('slides_new', {title: 'Add Slide', photolist: docs});	
	});
});

router.get("/edit", function(req, res){
	res.render('slides_edit', {title: 'Edit Slide'});
});

router.get("/delete", function(req,res){
	res.render('slides_delete', {title: 'Delete Slide'});
});

module.exports = router;