var fs =  require('fs');
var path = require('path');
var db = require('./db');

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
	var curslide = slide;
	var destSlideDir = path.join(__dirname, '../../slides/', curslide.name);


	console.log("Making the directory : " +  destSlideDir + " length: " + curslide.pictures.length);
	
		fs.mkdir(destSlideDir, 0777, function(err){
			if(err){
				console.log(err);
			}

			console.log("calling createsymlink " + curslide.length)
			createSymLinks(curslide);
		});
}

function createSymLinks(slide){
	console.log("Creating symlinks for slide :" + slide.name + " length: " + slide.pictures.length);
	var destSlideDir = path.join(__dirname, '../../slides/', slide.name);

	// Create Symlinks for each photo in the photo array
	for(curphoto in slide.pictures){
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

module.exports = function(){
	
	function create(slide, callback){
		db.Slides.get(slide.name, function(err, data){
			if(data && data.length > 0){
				callback("Found doc with the same name ... bailing");
				return;
			}

			db.Photos.find(slide.photos, function(err, photos){
				slide.pictures = photos;

				console.log("photos: " + slide.pictures + " length : " + slide.pictures.length);
				// Create a directory for this slide in slides
				createSlideDirAmdSymlinks(slide);

				// Save Slide to DB
				db.Slides.create(slide, function(err, items){
					callback(err, items);
				});
			});
		});
	}

	function edit(){

	}

	function remove(){

	}

	function get(callback){
		db.Slides.find(function(err, items){
			callback(err, items);
		});
	}

	function getByID(id, callback){
		var i=0;

		db.Slides.get(id, function(err, targetSlide){
			callback(err, targetSlide);
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