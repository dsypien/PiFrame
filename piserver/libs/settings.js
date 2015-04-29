var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var path = require('path');
var script_path = path.join(__dirname, "../../startslides.sh");

module.exports = function(){
	function play(slide, callback){
		var script_w_param;
		var errMsg = "Error: slide not defined";

		if(!slide){
			console.log(errMsg);
			callback(errMsg);
		}

		var qiv = spawn('script_path', [slide.name]);

		qiv.stdout.on('data', function (data) {
		  console.log('stdout: ' + data);
		});

		qiv.stderr.on('data', function (data) {
		  console.log('stderr: ' + data);
		});

		qiv.on('close', function (code) {
		  console.log('child process exited with code ' + code);
		});

		// script_w_param = script_path + " " + slide.name;
		//
		// exec(script_w_param, function(error, stdout, stderr){
		// 	console.log('stdout: ' + stdout);
		//     console.log('stderr: ' + stderr);
		//     if (error !== null) {
		//     	errMsg = 'exec error: ' + error;
		// 	    console.log(errMsg);
		// 	    callback(errMsg);
		// 	    return;
		//     }

		//     console.log("Playing slide: " + slide.name);
		// 	callback();
		// });
	}

	return{
		play: play
	};
};