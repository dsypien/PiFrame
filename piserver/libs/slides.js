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

	console.log("THUMB NAME: " + slide.pictures[0].thumb_name);
	console.log("THUMB NAME: " + slide.pictures[1].thumb_name);

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

module.exports = function(){
	
	function create(slide, callback){
		db.Slides.get(slide.name, function(err, data){
			if(data && data.length > 0){
				callback("Found doc with the same name ... bailing");
				return;
			}

			photos.photo_cache(function(items){
				slide.pictures = filterPhotosByIdAry(slide.pictures, items);

				console.log("photos: " + slide.pictures + " length : " + slide.pictures.length);
				// Create a directory for this slide in slides
				createSlideDirAmdSymlinks(slide);

				// Save Slide to DB
				db.Slides.create([slide], function(err, items){
					if(items.length !==1){
						callback("Items size: " + items.length);
						return;
					}

					console.log("Setting photos association " + items.length );

					items[0].photos = slide.pictures;
					items[0].save(function(err){
					 	callback(err, items);
					 });
				});
			});
		});

		function filterPhotosByIdAry(aryIds, aryPhotos){
			var filteredAry = [];
			var i = 0;

			if(aryPhotos.length < 1){
				return;
			}
			
			for(; i < aryIds.length; i++){
				var photo = aryPhotos.filter(function(obj){
					return obj.id == aryIds[i];
				});

				if(photo){
					console.log("adding photo to filter [checksum] : " 
						+ photo[0].checksum
						+ " id : "
						+ photo[0].id );

					filteredAry.push(photo[0]);
				}
			}

			return filteredAry;
		}
	}

	function edit(){

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
			callback(err);
		}
	}

	function get(callback){
		db.Slides.find(function(err, items){
			var i = 0;

			for(; i < items.length; i++){
				items[i].getPhotos(function(err, photos){
					if(err){
						consol.log(err);
					}
					items[i].photos = photos;
				});
			}

			callback(err, items);
		});
	}

	function getByID(id, callback){
		var i=0;

		db.Slides.get(id, function(err, Slide){
			Slide.getPhotos(function(err, photos){
				Slide.pictures = photos;
				callback(err, Slide);
			});
		});
	}

	//INTERFACE
	return{
		create: create,
		edit: edit,
		remove: remove,
		get: get,
		getByID : getByID
	}
};