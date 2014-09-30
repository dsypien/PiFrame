var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var fs =  require('fs');
var path = require('path');

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
	var photosCollection = db.get('photo_collection');
	var slideCollection = db.get('slides_collection');
	var destSlideDir;
	
	console.log	("Adding " + req.body.name);
	console.log(req.body.pictures);

	photosCollection.find({},{},function(e1, photos){
		if(e1){
			console.log(e1);
		}

		slideCollection.find({name: req.body.name}, {}, function(e, docs){
			//Bail if Slide with same name exists
			if(docs.length > 0){
				console.log("found doc with same name ... bailing");
				return;
			}

			destSlideDir = path.join(__dirname, '../../slides/', req.body.name);
			console.log("Making the directory : " +  destSlideDir);
			fs.mkdir(destSlideDir, 0777, function(err){
				if(err){
					console.log(err);
				}

				for(var i = 0; i < req.body.pictures.length; i ++){
					var curId = req.body.pictures[i];
					var curphoto;
					var photoSearch = photos.filter(function(element){
						return element._id == curId;
					});

					if(photoSearch.length > 0){
						curphoto = photoSearch[0];
					}
					else{
						console.log("could not find this photo in db " + curId )
						continue;
					}

					console.log(curphoto);

					var photoPath = path.join(__dirname, '../../pics/', curphoto.name);
					var symPath = path.join(destSlideDir, curphoto.name);
					fs.symlink(photoPath, symPath, 'file', function(symerr){
						if(symerr){
							console.log(symerr);
						}
					})
				}

				// Save Slide to DB
				slideCollection.insert(req.body, function(err, doc){
					if(err){
						console.log(err);
					}

					console.log(doc);

					res.send("OK");
				});
			})
		});
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