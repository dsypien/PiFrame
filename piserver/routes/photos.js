var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');

router.get('/', function(req, res){
	var db = req.db;
	
	db.each("SELECT rowid AS id, checksum, thumb_name from PHOTOS", function(err, row){
		console.log("data: ");
		console.log(row.ID + " " + row.CHECKSUM + " " + row.THUMB_NAME);

		res.render('photos', {
			title: 'Photos',
		    photolist: row
		});
	});
	// var db = req.db;
	// var collection = db.get('photo_collection');

	// collection.find({},{}, function(e, docs){
		// res.render('photos', {
		// 	title: 'Photos'//,
		//     photolist: row
		// });

	// 	console.log(docs);
	// });
});

router.get('/json', function(req,res){
	var provider = req.dbprovider;
	
	try{
		provider.getPhotos(function(data){
			res.json(data);			
		});
	}
	catch(e){
		console.log(e);
	}
	// var db = req.db;
	// var collection = db.get('photo_collection');

	// collection.find({}, {}, function(e, docs){
	// 	res.json(docs);
	// });
	//res.json("{'status': 'OK'}");
});

router.post('/', function(req, res) {
	console.log(req.headers);
	var fstream,
		db = req.db,
		photos,
		insert_statement;


	// if(req.body._method === 'delete'){
	// 	console.log("Deleteing pic with id " + req.body.id);
		
	// 	//extract file data
	// 	collection.find({_id: req.body.id}, function(err, doc){
	// 		if(err){
	// 			res.json(500, error);
	// 		}
	// 		else{
	// 			console.log(doc);
	// 			//Remove from db
	// 			collection.remove({_id: req.body.id}, function(err){
	// 				if(err){
	// 					res.json(500, error);
	// 				}
	// 				else{
	// 					//Remove file
	// 					fs.unlink(path.join(__dirname, '../../pics/', doc[0].name), function(delErr){
	// 						if(delErr){
	// 							console.log(delErr);
	// 						}
	// 						else{
	// 							console.log("succesfully deleted " + doc[0].name );
	// 						}
	// 					});
	// 					//Remove thumbnail
	// 					fs.unlink(path.join(__dirname, '../public/thumbnails/', doc[0].thumb_name), function(delErr){
	// 						if(delErr){
	// 							console.log(delErr);
	// 							res.send(delErr);
	// 						}
	// 						else{
	// 							console.log("succesfully deleted" +  doc[0].thumb_name );
	// 							//res.redirect("/#photos");
	// 							collection.find({}, {}, function(e, docs){
	// 								res.json(docs);
	// 							});
	// 						}
	// 					});
	// 				}
	// 			});
	// 		}
	// 	});
	// }
	// else{
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
        	if(filename === undefined || filename === ''){
        		console.log("Trying to upload empty file");
        		res.redirect(req.get('referer'));
        		return;
        	}

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
		        				res.redirect(req.get('referer'));
		        			});
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

		            	// // Store data in db
		            	// collection.insert({name: checksumName, thumb_name: thumb_name}, function(err, doc){
		            	// 	if(err){
		            	// 		console.log(err);
		            	// 	}
		            	// 	else{
		            	// 		// Added a little time so that thumbnail is accessible
		            	// 		res.redirect("/#photos");
		            	// 	}
		            	// });
            		}
            	});
            });
        });
	// }
});

module.exports = router;