var fs =  require('fs');
var path = require('path');
var db = require('./db');
var photos = require('./photos')();

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

function createSlideDirAmdSymlinks(slide){
	var destSlideDir = path.join(__dirname, '../../slides/', slide.name);

	console.log("Making the directory : " +  destSlideDir );
	
	fs.mkdirSync(destSlideDir, 0777);
	createSymLinks(slide);
}

function createSymLinks(slide){
	var destSlideDir = path.join(__dirname, '../../slides/', slide.name);
	var i = 0;
	var pictures_length = slide.pictures.length;
	var curphoto;

	console.log("Creating symlinks for slide :" + slide.name);	

	// Create Symlinks for each photo in the photo array
	for(; i <  pictures_length; i++){
		curphoto = slide.pictures[i];
		console.log(curphoto.thumb_name);

		var photoPath = path.join(__dirname, '../../pics/', curphoto.checksum);
		var symPath = path.join(destSlideDir, curphoto.checksum);
		fs.symlink(photoPath, symPath, 'file', function(symerr){
			if(symerr){
				console.log(symerr);
			}
		});
	}
}

function getPhotosByPhotoIds(photoIdsObj, aryPhotos){
	var filteredAry = [];
	if(aryPhotos.length < 1){
		return;
	}

	for(var id in photoIdsObj){
		//retrieve phto from aryPhotos
		var photo = aryPhotos.filter(function(obj){
			return obj.id == id;
		});

		// if photo retrieved, push it onto filteredary
		if(photo){
			console.log("adding photo to filter [checksum] : " 
				+ photo[0]);

			filteredAry.push(photo[0]);
		}
	}

	return filteredAry;
}

function Slide(data){
	this.id = data.id;
	this.name = data.name;
	this.picture_ids = data.picture_ids;
	this.pictures = data.picture_ids;
}

module.exports = function(){
	
	function create(slide, callback){
		db.Slides.get(slide.name, function(err, data){
			if(data && data.length > 0){
				callback("Found doc with the same name ... bailing");
				return;
			}

			saveSlide(slide, callback);
		});

		function saveSlide(data, callback){
			var slide = new Slide(data);

			photos.photo_cache(function(items){
				slide.pictures = getPhotosByPhotoIds(slide.picture_ids, items);

				console.log("photos: " + slide.pictures + " length : " + slide.pictures.length);
				// Create a directory for this slide in slides
				createSlideDirAmdSymlinks(slide);

				// Save Slide to DB
				db.Slides.create([slide], function(err){
					if(err){
						callback(err);
					}else{
						get(function(getErr, slides){
							callback(getErr, slides);
						});
					}
				});
			});
		}
	}

	function edit(slide, callback){
		var pictures;

		//remove symlinks
		removeFilesInDir(slide.name);

		db.Slides.get(slide.id, function(err, item){
			if(err){
				callback(err);
			}
			else{
				console.log("Phtos: " + slide.pictures);
				console.log("Slide: " + slide.name);

				photos.photo_cache(function(items){
					slide.pictures = getPhotosByPhotoIds(slide.picture_ids, items);

					//create new symlinks
					createSymLinks(slide);

					//update picture association
					item.picture_ids = slide.picture_ids;
					item.save(function(err){
						callback(err);
					});
				});
			}
		});	
	}

	function remove(req, callback){
		db.Slides.get(req.body.id, getSlidesCallback);

		function getSlidesCallback(err, targetSlide){
			if(err){
				callback(err);
			}
			else{
				targetSlide.remove(deleteSlideCallback);
			}
		};

		function deleteSlideCallback(err){
			removeFilesInDir(req.body.name);
			removeDir(req.body.name);

			if(err){
				callback(err);
			}
			else{
				get(function(getErr, slides){
					callback(getErr, slides);
				});
			}
		}
	}

	function removePicFromSlides(id, callback){
		var slidesToUpdate = [];
		var numUpdated = 0;

		get(function(err, slides){
			for(i=0; i < slides.length; i++){
				var curslidePicIds = slides[i].picture_ids;

				//If you find picture in slide, remove from slide and push slide onto slidesToUpdate array
				if(curslidePicIds[id]){
					console.log("Removing pic from slide: " + slides[i].name)

					// Remove id from picture_ids array of current slide
					delete curslidePicIds[id];
					slidesToUpdate.push(slides[i]);
				}
			}

			// If nothing to update call callback and return ;)
			if(slidesToUpdate.length == 0){
				callback();
				return;
			}

			// Update each slide in the slidesToUpdate Array
			for(j=0; j < slidesToUpdate.length; j++){
				var curslide = slidesToUpdate[j];
				edit(curslide, function(){
					if(numUpdated = slidesToUpdate.length){
						callback();
						return;
					}
				});
			}
		});
	}		

	function get(callback){
		db.Slides.find(function(err, items){
			callback(err, items);
		});
	}

	function getByID(id, callback){
		var i=0;

		db.Slides.get(id, function(err, Slide){
			if(err){
				callback(err);
			}
			else{
				Slide.getPhotos(function(err, photos){
					Slide.pictures = photos;
					callback(err, Slide);
				});
			}
		});
	}

	//INTERFACE
	return{
		create: create,
		edit: edit,
		remove: remove,
		removePicFromSlides: removePicFromSlides,
		get: get,
		getByID : getByID
	}
};