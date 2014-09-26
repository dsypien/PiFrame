var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res){
	res.render('slideshows', {title: 'Slideshows'});
});

router.get('/json', function(req,res){
	var db = req.db;
	var slides = db.get('slides_collection');

	slides.find({}, function(e, docs){
		if(e){
			console.log(e);
			res.end();
		}
		else{
			res.json(docs);
		}
	});
});

router.get('/edit/slide:id', function(req, res){
	var db = req.db;
	var photos = db.get('photo_collection');
	var slides = db.get('slides_collection');

	console.log(req.params);

	slides.find({_id: req.params.id}, function(err, slidedocs){
		if(err){
			console.log(err);
		}

		var photoIdAry = slidedocs[0].pictures;
		console.log("Slides: " + photoIdAry);
		
		// Convert id's in photoIdAry to Object id's
		for(var i=0; i< photoIdAry.length; i++){
			var curid = photoIdAry[i];
			var curObjID = ObjectID.createFromHexString(curid);

			photoIdAry[i]= curObjID;
		}

		// Retrieve all the photo information for the slide
		photos.find( { _id: { $in : photoIdAry } }, function(e, photodocs){
			if(e){
				console.log(e);
			}

			console.log("Pictures: " + photodocs[0]);

			slidedocs[0].pictures = photodocs;

			res.render('slides_edit', {
				title: 'Edit Slide',
				photolist: photodocs[0]
			});
		});
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

	collection.insert(req.body, function(err, doc){
		if(err){
			console.log(err);
		}

		collection.find({}, {}, function(e, docs){
			console.log(docs);
		});

		res.send("OK");
	});
});

router.put("/edit", function(req,res){
	var db = req.db;
	var collection = db.get('slides_collection');

	var slide = {
		_id: req.body.id,
		name: req.body.name,
		pictures: req.body.pictures
	};

	console.log(slide.pictures);
	collection.update({_id: req.body.id}, slide, function(err,doc){
		if(err){
			console.log(err);
		}

		res.send("OK");
	});
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

router.post("/delete", function(req,res){
	var db = req.db;
	var collection = db.get('slides_collection');

	collection.remove({_id: req.body.id}, function(err,doc){
		if(err){
			console.log(err);
		}
		res.redirect('/#slidedelete');
	});
});

module.exports = router;