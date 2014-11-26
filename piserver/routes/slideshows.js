var express = require('express');
var router = express.Router();
// var ObjectID = require('mongodb').ObjectID;
var slidesLib = require("../libs/slides");

var slides = slidesLib();

//used
router.get('/json', function(req,res){
	slides.get(function(err, slides){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(slides);
		}
	});
});


//uSED
router.get('/edit/slide:id', function(req, res){
	// var db = req.db;
	// var photos = db.get('photo_collection');
	// var slides = db.get('slides_collection');

	console.log(req.params);

	slides.getbyID(req.body.id, function(err, slide){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(slide);
		}
	});



	// slides.find({_id: req.params.id}, function(err, slidedocs){
	// 	if(err){
	// 		console.log(err);
	// 	}

	// 	var photoIdAry = slidedocs[0].pictures;
	// 	console.log("Slides: " + photoIdAry);
		
	// 	// Convert id's in photoIdAry to Object id's
	// 	for(var i=0; i< photoIdAry.length; i++){
	// 		var curid = photoIdAry[i];
	// 		var curObjID = ObjectID.createFromHexString(curid);

	// 		photoIdAry[i]= curObjID;
	// 	}

	// 	// Retrieve all the photo information for the slide
	// 	photos.find( { _id: { $in : photoIdAry } }, function(e, photodocs){
	// 		if(e){
	// 			console.log(e);
	// 		}

	// 		console.log("Pictures: " + photodocs[0]);

	// 		slidedocs[0].pictures = photodocs;

	// 		res.render('slides_edit', {
	// 			title: 'Edit Slide',
	// 			photolist: photodocs[0]
	// 		});
	// 	});
	// });
});

//used
router.post("/new", function(req, res){	
	console.log	("Adding " + req.body.name);
	console.log(req.body.pictures);

	slides.create(req.body, function(err, data){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(data);
		}
	});

    //  Get Photo Collection
	// photosCollection.find({},{},function(e1, photos){
	// 	if(e1){
	// 		console.log(e1);
	// 	}

	// 	// Look for duplicate slide in slide collection
	// 	slideCollection.find({name: req.body.name}, {}, function(e, docs){
	// 		//Bail if Slide with same name exists
	// 		if(docs.length > 0){
	// 			console.log("found doc with same name ... bailing");
	// 			return;
	// 		}

	// 		// Create a directory for this slide in slides
	// 		createSlideDirAmdSymlinks(photos, req.body);

	// 		// Save Slide to DB
	// 		slideCollection.insert(req.body, function(err, doc){
	// 			if(err){
	// 				console.log(err);
	// 			}

	// 			console.log(doc);
	// 			res.send("OK");
	// 		});
	// 	});
	// });
});


//uSED
router.put("/edit", function(req,res){
	var db = req.db;
	var slides_collection = db.get('slides_collection');
	var photo_collection = db.get('photo_collection');


	var slide = {
		_id: req.body.id,
		name: req.body.name,
		pictures: req.body.pictures
	};

	//remove symlinks
	removeFilesInDir(req.body.name);

	photo_collection.find({},{}, function(getPhotosErr, photos){
		if(getPhotosErr){
			console.log(getPhotosErr);
			return;
		}

		console.log("Phtos: " + photos);
		console.log("Slide: " + slide);

		//create new symlinks
		createSymLinks(photos, slide);

		console.log(slide.pictures);
		slides_collection.update({_id: req.body.id}, slide, function(err,doc){
			if(err){
				console.log(err);
			}

			res.send("OK");
		});
	})
});


//USED
router.post("/delete", function(req,res){
	var db = req.db;
	var collection = db.get('slides_collection');

	collection.remove({_id: req.body.id}, function(err,doc){
		if(err){
			console.log(err);
		}

		if(doc){
			console.log(doc);
		}

		removeFilesInDir(req.body.name);
		removeDir(req.body.name);

		console.log(doc);
		res.send('OK');
	});
});

module.exports = router;