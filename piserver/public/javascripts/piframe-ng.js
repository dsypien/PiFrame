var PIFRAME_APP = angular.module("piFrameApp", []);

PIFRAME_APP.controller('piController', function($scope, $http){
	$scope.slideNew = {picture_ids: {}};

	// GET PHOTOS
	$http.get('photos/json').
		success(function(data, status, headers, config){
			$scope.photos = data;
		});

	// GET SLIDES
	$http.get('slideshows/json').
		success(function(data, status, headers, config){
			$scope.slides = data;
		});

	
	$scope.deletePhoto = function(id){
		var data = {_method: 'delete', id : id};

		$http.post('/photos', data).success(function(data, status, headers, config){
			if(data.error !== undefined) {
        		console.log('ERRORS: ' + data.error);
        		return;
        	}
        	
        	$scope.photos = data;
		}).error(function(data, status, headers, config){
			console.log('ERRORS: ' + data);
		});
	};

	$scope.newSlide = function(slide){
		if(!slide.name){
			alert("please enter name");
			return;
		}

		$http.post('/slideshows/new', slide).success(function(data, status, headers, config){
			$scope.slides = data;

			slide.name = '';
			$scope.slideNew = {picture_ids: {}};
		});
	};

	$scope.getSlide = function(id){
		$http.get('/slideshows/edit/slide' + id).success(function(data, status, headers, config){
		});
	};

	$scope.deleteSlide = function(slide){
		if(slide){
			$http.post('/slideshows/delete', slide).success(function(data, status, headers, config){
				// Reload page, we need to reset controls
				location.reload();
			});
		}
	};

	$scope.saveSlide = function(slide){
		if(slide){
			$http.put('/slideshows/edit', slide).success(function(data, status, headers, config){
			});
		}
	}

	$scope.playSlide = function(slide){
		$http.post('/play', slide).success(function(data, status, headers, config){
		});
	};

	// Make toggle select work on both new slide & edit slide
	$scope.toggleSelect = function(photo, targetSlide){
		if(!targetSlide){
			console.log("Cannot toggle photo selection, no slide selected");
			return;
		}

		if(targetSlide.picture_ids[photo.id]){
			delete targetSlide.picture_ids[photo.id];
			//delete photo["selected"];
			console.log("deselecting");
		} else{
			targetSlide.picture_ids[photo.id] = true;
			//photo.selected = true;
			console.log("selecting");
		}
	};
});