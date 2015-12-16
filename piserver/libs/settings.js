/* global __dirname */

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var path = require('path');
var script_path = path.join(__dirname, "../../startslides.sh");
var slides_path = path.join(__dirname, "../../slides/");

module.exports = function(){
	function play(slide, callback){
		var script_w_param;
		var errMsg = "Error: slide not defined";

		if(!slide){
			console.log(errMsg);
			callback(errMsg);
		}

		//Default slide delay to 20 if one is not entered
		if(!slide.delay){
			slide.delay = "20";
		}

		slide.name = slide.name.replace(/\s/g, '\\ ');

		script_w_param = script_path + " " + slides_path + slide.name + " " + slide.delay;

		console.log("Running script: "  + script_w_param );
		
		exec(script_w_param, function(error, stdout, stderr){
			console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		    	errMsg = 'exec error: ' + error;
			    console.log(errMsg);
			    callback(errMsg);
			    return;
		    }

		    console.log("Playing slide: " + slide.name);
			callback();
		});
	}

	return{
		play: play
	};
};