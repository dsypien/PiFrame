var sqlite3 = require('sqlite3');
var fs = require('fs');
var file_name;
var db;

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

	        db = new sqlite3.Database(file_name);

	        db.serialize(function(){
	            //DB SETUP
	            if(!exists){
	            	console.log("Creating Tables");
	                db.run("CREATE TABLE PHOTOS (ID INT PRIMARY KEY NOT NULL, CHECKSUM TEXT NOT NULL, THUMB_NAME TEXT NOT NULL)");
	                db.run("CREATE TABLE SLIDESHOWS ( ID INT PRIMARY KEY  NOT NULL, NAME  TEXT  NOT NULL )");
	                db.run("CREATE TABLE PHOTOS_TO_SLIDE (ID INT PRIMARY KEY NOT NULL,PHOTOS_ID INT NOT NULL,SLIDES_ID INT NOT NULL)");
	            }
	        });
	    }catch(e){
	        console.log(e);
	    }
	})();

	function getPhotos(callback){
		db.run("SELECT * from PHOTOS", function(err, rows){
			if(err){
				console.log("ERROR getting photos: " + err);
			}

			console.log("data: ");
			console.log(rows);

			callback(rows);
		});
	}

	// INTERFACE
	return{
		getPhotos: getPhotos
	};
};


