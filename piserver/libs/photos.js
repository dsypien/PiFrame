var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');
var db = require('./db');

var photos;

module.exports = function(){

	function addPhoto(req, callback){
		var fstream;

		req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename) {
        	if(filename === undefined || filename === ''){
        		callback("Trying to upload empty file");
        		return;
        	}

        	//Upload File
        	var destFile = path.join(__dirname, '../../pics/', filename);
            fstream = fs.createWriteStream(destFile);
            
            fstream.on('error', function(e){
            	if(e){
            		console.log(e);
            	}
            });

            file.pipe(fstream);
            

            // On upload complete
            fstream.on('close', function () {  
            	//Create a checksum of the file
            	var checksumName, checkSumDestFile;

            	checksum.file(destFile, function(err, sum){
            		if(err){
            			console.log(err);
            			res.json({message: err});
            		}
            		else{
            			checksumName = sum + path.extname(filename);
            			checkSumDestFile = path.join(__dirname, '../../pics/', checksumName) ;

            			console.log("checksum: " + sum);

            			console.log("Checking for duplicates;");
            			//Ensure there are no duplicates
            			if(fs.existsSync(checkSumDestFile)){
		        			console.log("This file aleady exists on the server");

		        			//remove the file that was just uploaded
		        			fs.unlink(destFile, function(err){
		        				if(err){
		        					console.log("ERROR deleting duplicate uploaded file: " + err);
		        				}
		        			});
		        			callback("File already exists on server");
		        			return;
		        		}


		        		console.log("Renaming file to have checksum name");
						//Rename file to checksum name
						fs.rename(destFile, checkSumDestFile, function(err){
							if(err){
								console.log(err);
							}
						});

		            	//Path where image will be uploaded
			            var destPath = path.join(__dirname, '../../pics/');
			            var thumb_name = checksumName.replace('.', '_thumb.');

			            console.log("store photo data in db");

		            	// Create thumbnail;
		            	thumbnail({
		            		source: destPath,
		            		destination: path.join(__dirname, '../public/thumbnails/'),
		            		width: 250,
		            		overwrite: true
		            	}, function(err){
		            		// Save photo data in db
			            	db.Photos.create([{
			            		checksum: checksumName,
			            		thumb_name: thumb_name
			            	}], function(err, items){
			            		callback(err, items);
			            	});
		            	});
            		}
            	});
            });
        });
	}

	function getPhotos(callback){
		db.Photos.find(function(err, items){
			photos = items;
			callback(err, items);
		});
	}

	function deletePhoto(req, callback){
		console.log("Deleteing pic with id " + req.body.id);
		
		db.Photos.get(req.body.id, function(err, targetPhoto){
			if(err){
				callback(err);
			}
			else{
				console.log("Found pic to delete");
				targetPhoto.remove(function(err){
					//Remove file
					fs.unlink(path.join(__dirname, '../../pics/', targetPhoto.checksum), function(delErr){
						if(err){
							console.log(err);
						}
						else{
							console.log("succesfully deleted pic " + targetPhoto.checksum );
						}
					});
					//Remove thumbnail
					fs.unlink(path.join(__dirname, '../public/thumbnails/', targetPhoto.thumb_name), function(delErr){
						if(delErr){
							callback(delErr);
						}
						else{
							console.log("succesfully deleted thumb" +  targetPhoto.thumb_name );
							getPhotos(function(data){
								callback({}, data);
							});
						}
					});
				});
			}			
		});
	}

	function photo_cache(callback){
		if(!photos){
			photos = getPhotos( function(){
				callback(photos);
			});
		}
		else{
			callback(photos);
		}
	}

	//Interface
	return{
		add: addPhoto,
		get: getPhotos,
		remove: deletePhoto,
		photo_cache : photo_cache
	};
};

