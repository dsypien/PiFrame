var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var file_name;
var db;
var setupdb;

module.exports = function(filename){
    // SETUP
	(function(){
	    try{
	    	file_name  = filename;
	    	console.log("filename: " + file_name);
	    	var exists = fs.existsSync(file_name);
	    	console.log("INIT DB Provider");

	        if(!exists){
	            console.log("Creating db file");
	            fs.openSync(file_name, 'w');
	        }

	        setupdb = new sqlite3.Database(file_name);

	        setupdb.serialize(function(){
	            //DB SETUP
	            if(!exists){
	            	console.log("Creating Tables");
	                setupdb.run("CREATE TABLE PHOTOS (ID INT PRIMARY KEY NOT NULL, CHECKSUM TEXT NOT NULL, THUMB_NAME TEXT NOT NULL);");
	                setupdb.run("CREATE TABLE SLIDESHOWS ( ID INT PRIMARY KEY  NOT NULL, NAME  TEXT  NOT NULL );");
	                setupdb.run("CREATE TABLE PHOTOS_TO_SLIDE (ID INT PRIMARY KEY NOT NULL,PHOTOS_ID INT NOT NULL,SLIDES_ID INT NOT NULL);");
	            }
	        });

	        setupdb.close( function(err){
	        	if(err){
	        		console.log("ERROR CLOSING DB: " + err);
	        	}
	        	db = new sqlite3.Database(file_name);
	    	});
	    	
	    }catch(e){
	        console.log(e);
	    }
	})();

	function getPhotos(callback){
		db.all("SELECT ID, CHECKSUM, THUMB_NAME from PHOTOS;", function(err, rows){
			if(err){
				callback("ERROR getting photos: " + err);
				return;
			}

			console.log("SQL GET PHOTOS data: ");
			console.log(rows);

			callback({}, rows);
		});
	}

	function deletePhoto(id, callback){
		db.run("DELETE FROM PHOTOS WHERE id = ?;", [id], function(err){
				callback(err);
		});
	}

	function addPhoto(id, callback){
		
	}

	// INTERFACE
	return{
		getPhotos: getPhotos,
		addPhoto: addPhoto,
		deletePhoto: deletePhoto
	};
};


