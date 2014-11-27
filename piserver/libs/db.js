var orm = require("orm");

module.exports.Photos = null;
module.exports.Slides = null;

module.exports.init = function(callback){
	orm.connect("sqlite://piserver.db", function(err, db){
		if(err){
			throw err;
		}

		var Photos = db.define("photos", {
			checksum: String,
			thumb_name: String
		});
		Photos.sync(function(err){});

		var Slides = db.define("slides", {
			name: String
		});

		Slides.hasMany('photos', Photos, {}, { reverse: 'slides', key: true});

		Slides.sync(function(err){});

		if(err){
			callback(err);
		}
		else{
			module.exports.Photos = Photos;
			module.exports.Slides = Slides;
			callback(null);
		}
	});
};