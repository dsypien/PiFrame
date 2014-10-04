var express = require('express');
var router = express.Router();
var exec = require('child_process').exec;
var path = require('path');
var script_path = path.join(__dirname, "../../test.sh");

/* GET settings page. */
router.get('/', function(req, res) {
  res.render('settings', { title: 'Settings' });
});

router.post('/play', function(req,res){
	var slide = req.body;
	var script_w_param;

	if(!slide){
		console.log("Error: slide not defined");
		return;
	}

	script_w_param = script_path + " " + slide.name;

	exec(script_w_param, function(error, stdout, stderr){
		console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }

	    console.log("Playing slide: " + slide.name);
		res.send("OK");
	});
});

module.exports = router;