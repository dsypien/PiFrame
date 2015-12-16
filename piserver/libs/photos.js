var fs = require('fs');
var path = require("path");
//var thumbnail = require('node-thumbnail').thumb;
var imagemagick = require('node-imagemagick');
var checksum = require('checksum');
var db = require('./db');

var photos;

module.exports = function(){

	function add(req, callback){
		var fstream
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
			            var image_path = path.join(__dirname, '../../pics/' + sum + ".JPG");
			            var thumb_name = checksumName.replace('.', '_thumb.');
			            var thumb_path = path.join(__dirname, '../public/thumbnails/' + sum + '_thumb.JPG');

			            console.log("create thumbnail image_path: " + image_path);
			            console.log("thumb_path: " + thumb_path);

			            try{
			            	imagemagick
			            		.resize({
			            			srcPath: image_path,
								  	dstPath: thumb_path,
								  	width:   250
								}, function(err, stdout, stderr){
								  	if (err) throw err;
									
									// Store photo data in db
									db.Photos.create([{
					            		checksum: checksumName,
					            		thumb_name: thumb_name
					            	}], function(err, items){
					            		callback(err, items);
					            		console.log("file " + image_path + " finished uploading");
					            	});  	
								});

			            }catch(er){
			            	console.log("Error creating thumbnail: " + er);
			            }
            		}
            	});
            });
        });

		// busboy.on('finish', function() {
	 //      get(function(err, items){
	 //      	console.log("Files finished uploading");
	 //      	callback(err, items);
	 //      });
  //   	});
	}

	function get(callback){
		db.Photos.find(function(err, items){
			photos = items;
			callback(err, items);
		});
	}

	function remove(req, callback){
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
							get(function(err, data){
								callback(null, data);
							});
						}
					});
				});
			}			
		});
	}

	function photo_cache(callback){
		if(!photos){
			photos = get( function(){
				callback(photos);
			});
		}
		else{
			callback(photos);
		}
	}

	//Interface
	return{
		add: add,
		get: get,
		remove: remove,
		photo_cache : photo_cache
	};
};

