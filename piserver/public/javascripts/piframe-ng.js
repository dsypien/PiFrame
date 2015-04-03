var PIFRAME_APP = angular.module("piFrameApp", []);

PIFRAME_APP.controller('piController', function($scope, $http){
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
		$http.post('/slideshows/new', slide).success(function(data, status, headers, config){
			location.reload();
		});
	};

	$scope.getSlide = function(id){
		$http.get('/slideshows/edit/slide' + id).success(function(data, status, headers, config){
			location.reload();
		});
	};

	$scope.deleteSlide = function(slide){
		dataObj = {id: slide.slideId, name: slide.name};

		$http.post('/slideshows/delete', dataObj).success(function(data, status, headers, config){
		});
	};

	$scope.saveSlide = function(slide){
		var objData ={
			id: slide.id,
			name: slide.name,
			picture_ids: pictures
		};

		$http.put('/slideshows/edit', slide).success(function(data, status, headers, config){
		});
	}

	$scope.playSlide = function(slide){
		$http.post('/play', slide).success(function(data, status, headers, config){
		});
	};

	$scope.toggleSelect = function(photo){
		if(!$scope.slideToEdit){
			console.log("Cannot toggle photo selection, no slide selected");
			return;
		}

		if($scope.slideToEdit.picture_ids[photo.id]){
			delete $scope.slideToEdit.picture_ids[photo.id];
			//delete photo["selected"];
			console.log("deselecting");
		} else{
			$scope.slideToEdit.picture_ids[photo.id] = true;
			//photo.selected = true;
			console.log("selecting");
		}
	};
});