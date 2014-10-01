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
	
	console.log	("Adding " + req.body.name);
	console.log(req.body.pictures);

    //  Get Photo Collection
	photosCollection.find({},{},function(e1, photos){
		if(e1){
			console.log(e1);
		}

		// Look for duplicate slide in slide collection
		slideCollection.find({name: req.body.name}, {}, function(e, docs){
			//Bail if Slide with same name exists
			if(docs.length > 0){
				console.log("found doc with same name ... bailing");
				return;
			}

			// Create a directory for this slide in slides
			createSlideDirAmdSymlinks(photos, req.body);

			// Save Slide to DB
			slideCollection.insert(req.body, function(err, doc){
				if(err){
					console.log(err);
				}

				console.log(doc);
				res.send("OK");
			});
		});
	});
});

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

function removeFilesInDir(dirName){
	var slidepath = path.join(__dirname, '../../slides/', dirName);
	var curPicturePath;
	var photoFiles;

	console.log("Removing files in " + slidepath);

	try{
		photoFiles = fs.readdirSync(slidepath);
	}
	catch(readdirErr){
		console.log("Could not find the directory: " + slidepath);
		console.log(readdirErr);
	}

	if(photoFiles){
		for(var i=0; i < photoFiles.length; i++){
			curPicturePath = path.join(slidepath, "/", photoFiles[i]);

			console.log("deleting file: " + curPicturePath);

			try{
				fs.unlinkSync(curPicturePath);
			}
			catch(err){
				console.log("Error deleting picture " + photoFiles[i] + " " + err);
			}
		}
	}
}

function removeDir(dir){
	var slidepath = path.join(__dirname, '../../slides/', dir);

	fs.rmdir(slidepath, function(remErr){
		if(remErr){
			console.log(remErr);
		}
		else{
			console.log("File successfully deleted");
		}
	});
}

function createSlideDirAmdSymlinks(photos, slide){
	var destSlideDir = path.join(__dirname, '../../slides/', slide.name);
	console.log("Making the directory : " +  destSlideDir);
	
	fs.mkdir(destSlideDir, 0777, function(err){
		if(err){
			console.log(err);
		}

		createSymLinks(photos, slide);
	})
}

function createSymLinks(photos, slide){
	console.log("Creating symlinks for slide :" + slide);
	var destSlideDir = path.join(__dirname, '../../slides/', slide.name);

	// Create Symlinks for each photo in the photo array
	for(var i = 0; i < slide.pictures.length; i ++){
		var curId = slide.pictures[i];
		var curphoto;
		// Get photo array that should be of size one and contain the photo
		var photoSearch = photos.filter(function(element){
			return element._id == curId;
		});

		if(photoSearch.length > 0){
			curphoto = photoSearch[0];
		}
		else{
			console.log("could not find this photo in db " + curId );
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
}

module.exports = router;