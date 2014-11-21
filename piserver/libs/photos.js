var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');

module.exports = function(){

	function addPhoto(req, callback){
		var fstream,
			provider = req.dbprovider;

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

						//Rename file to checksum name
						fs.rename(destFile, checkSumDestFile, function(err){
							if(err){
								console.log(err);
							}
						});

		            	//Path where image will be uploaded
			            var destPath = path.join(__dirname, '../../pics/');
			            var thumb_name = checksumName.replace('.', 'thumb.');

		            	// Create thumbnail;
		            	thumbnail({
		            		source: destPath,
		            		destination: path.join(__dirname, '../public/thumbnails/'),
		            		width: 250,
		            		overwrite: true
		            	});

		            	getPhotos(provider, callback);
            		}
            	});
            });
        });
	}

	function getPhotos(provider, callback){
		provider.getPhotos(function(err, data){
			callback(err, data);
		});
	}

	function deletePhoto(req, callback){
		var provider = req.dbprovider;

		console.log("Deleteing pic with id " + req.body.id);
		
		//Remove from db
		provider.deletePhoto(req.body.id, function(err, rows){
			if(err){
				res.json(500, error);
			}
			else{
				//Remove file
				fs.unlink(path.join(__dirname, '../../pics/', doc[0].name), function(delErr){
					if(delErr){
						console.log(delErr);
					}
					else{
						console.log("succesfully deleted " + doc[0].name );
					}
				});
				//Remove thumbnail
				fs.unlink(path.join(__dirname, '../public/thumbnails/', doc[0].thumb_name), function(delErr){
					if(delErr){
						console.log(delErr);
						res.send(delErr);
					}
					else{
						console.log("succesfully deleted" +  doc[0].thumb_name );
						//res.redirect("/#photos");
						provider.getPhotos(function(data){
							callback({}, data);
						});
					}
				});
			}
		});

	}

	//Interface
	return{
		add: addPhoto,
		get: getPhotos,
		remove: deletePhoto
	};
};

