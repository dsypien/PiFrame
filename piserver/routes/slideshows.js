var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

router.get('/json', function(req, res){
	var db = req.db;
	var photos_col = db.get('photo_collection');
	var slides_col = db.get('slides_collection');

	slides_col.find({_id: req.body.id}, function(err, docs){
		if(err){
			console.log(err);
		}
		res.json(docs);
		console.log(docs);
	});
});

router.get("/new", function(req,res){
	var db = req.db;
	var collection = db.get('photo_collection');

	collection.find({}, {}, function(e, docs){
		res.render('slides_new', {title: 'Add Slide', photolist: docs});	
	});
});

router.get("/edit", function(req, res){
	var db = req.db;
	var slides_collection = db.get('slides_collection');

	slides_collection.find({},{}, function(e, docs){
		console.log(docs);
		
		res.render('slides_edit', {
			title: 'Edit Slide',
			slides: docs
		});
	});
});

router.post("/new", function(req, res){
	var db = req.db;
	var collection = db.get('slides_collection');
	
	console.log	("Adding " + req.body.name);
	console.log(req.body.pictures);

	collection.insert(req.body);

	collection.find({}, {}, function(e, docs){
		console.log(docs);
	});

	//refresh page
	res.redirect(req.get('referer'));
});


router.get("/delete", function(req,res){
	var db = req.db;
	var slides_collection = db.get('slides_collection');

	slides_collection.find({},{}, function(e, docs){
		console.log(docs);
		
		res.render('slides_delete', {
			title: 'Delete Slide',
			slides: docs
		});
	});
});

module.exports = router;