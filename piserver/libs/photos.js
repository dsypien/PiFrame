var fs = require('fs');
var path = require("path");
var thumbnail = require('node-thumbnail').thumb;
var checksum = require('checksum');

module.exports = function(){

	//INIT
	(function(){

	})();

	function addPhoto(provider, photo){

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