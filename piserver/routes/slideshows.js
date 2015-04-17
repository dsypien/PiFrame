var express = require('express');
var router = express.Router();
var slidesLib = require("../libs/slides");

var slides = slidesLib();

//used
router.get('/json', function(req,res){
	slides.get(function(err, slides){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(slides);
		}
	});
});


//uSED
router.get('/edit/slide:id', function(req, res){
	console.log(req.params.id);

	slides.getByID(req.params.id, function(err, slide){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(slide);
		}
	});
});

//used
router.post("/new", function(req, res){	
	slides.create(req.body, function(err, data){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(data);
		}
	});
});


//uSED
router.put("/edit", function(req,res){
	slides.edit(req.body, function(err, slides){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(slides);
		}
	});
});


router.post("/delete", function(req,res){
	slides.remove(req, function(err, items){
		if(err){
			console.log(err);
			res.status(500);
			res.send(err);
		}
		else{
			res.json(items);
		}
	});
});

module.exports = router;