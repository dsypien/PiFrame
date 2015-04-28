var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var path = require('path');
var script_path = path.join(__dirname, "../../startslides.sh");//path.join(__dirname, "../../test.sh");

module.exports = function(){
	function play(slide, callback){
		var script_w_param;
		var errMsg = "Error: slide not defined";

		if(!slide){
			console.log(errMsg);
			callback(errMsg);
		}

		script_w_param = script_path + " " + slide.name;

		var spwan(script_path, slide.name);

		, function(error, stdout, stderr){
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