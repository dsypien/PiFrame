var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');

module.exports = function(){

	//INIT
	(function(){

	})();

	function addPhoto(req, callback){
		var fstream,
			db = req.db,
			insert_statement;

		req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename) {
        	if(filename === undefined || filename === ''){
        		callback("Trying to upload empty file")
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

            			console.log(sum);

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

		            	insert_statement = db.prepare("INSERT INTO PHOTOS(CHECKSUM, THUMB_NAME) VALUES ('"+ checksumName +"','" + thumb_name +"')");

		            	insert_statement.finalize();

		            	console.log("selecting");
		            	db.each("SELECT rowid AS id, checksum, thumb_name from PHOTOS", function(err, row){
		            		console.log("data: ");
		            		console.log(row.ID + " " + row.CHECKSUM + " " + row.THUMB_NAME);
		            	});

		            	callback();
            		}
            	});
            });
        });
	}

	function getPhotos(provider, callback){
		provider.getPhotos(function(data){
			callback(data);
		});
	}

	function deletePhoto(provider, id){

	}

	//Interface
	return{
		add: addPhoto,
		get: getPhotos,
		remove: deletePhoto
	};
};

