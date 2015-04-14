var PIFRAME_APP = angular.module("piFrameApp", []);
$('#notifyMsg').popup();

var piController = function($scope, $http, $timeout, $filter){
	$scope.slideNew = {picture_ids: {}};
	$scope.clickedPhotoId = null;

	function getPhotos(){
		$http.get('photos/json').
			success(function(data, status, headers, config){
				$scope.photos = data;
			});
	}

	function getSlides(){
		$http.get('slideshows/json').
			success(function(data, status, headers, config){
				$scope.slides = data;
			});
	};

	function showNotification(msg){
		$scope.notificationText = msg;
    	$('#notifyMsg').popup("open");

    	setTimeout(function(){
    		$('#notifyMsg').popup("close");
    	}, 3000);
	}
	
	$scope.deletePhoto = function(id){
		var data = {_method: 'delete', id : id};

		$http.post('/photos', data).success(function(data, status, headers, config){
			if(data.error !== undefined) {
        		console.log('ERRORS: ' + data.error);
        		return;
        	}

        	showNotification("Photo deleted.");

        	$scope.photos = data;
			getSlides();	
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

			showNotification("Slide created.");

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
				getSlides();
				$scope.slideToEdit = 0;
				showNotification("Slide deleted.");
			});
		}
	};

	$scope.saveSlide = function(slide){
		if(slide){
			$http.put('/slideshows/edit', slide).success(function(data, status, headers, config){
				showNotification("Slide saved.")
			});
		}
	}

	$scope.playSlide = function(slide){
		if(!slide){
			showNotification("Please select slide.");
			return;
		}
		
		$http.post('/play', slide).success(function(data, status, headers, config){
		});
	};

	$scope.uploadFile = function(files){
		var fData = new FormData();
		fData.append("file", files[0]);

		$scope.notificationText = 'Uploading photo';
    	$('#notifyMsg').popup("open");

		$http.post('/photos/', fData, {
			withCredentials: true,
			headers: {'Content-Type': undefined},
			transformRequest: angular.identity
		}).success(function(data, status, headers){
			$scope.photos = data;
			showNotification("Photo saved.");
		}).error(function(data, status, headers){
			showNotification("Upload failed.");
			console.log("ERROR: Upload failed: " + data);
		});
	}

	$scope.toggleSelect = function(photo, targetSlide){
		if(!targetSlide){
			console.log("Cannot toggle photo selection, no slide selected");
			return;
		}

		if(targetSlide.picture_ids[photo.id]){
			delete targetSlide.picture_ids[photo.id];
		} else{
			targetSlide.picture_ids[photo.id] = true;
		}
	};

	$scope.photoClick = function(id){
		if($scope.clickedPhotoId == id){
			$scope.clickedPhotoId = null;
		}else{
			$scope.clickedPhotoId = id;
		}
	}

	$scope.$watch(
		"slideToEdit",
		function(newValue, oldValue){
			if(newValue === oldValue){
				return;
			}

			console.log("Updating Slide to edit with " + newValue);
			$scope.slideToEdit = newValue;
		});

	$scope.$watch(
		"slideToPlay",
		function(){
			var thumbnails = [];
			
			if(!$scope.slideToPlay){
				return;
			}

			for(id in $scope.slideToPlay.picture_ids){
				var photo = $filter('filter')($scope.photos, function(p){ 
					return p.id === id;
				})[0];

   				console.log(photo);
				thumbnails.push(photo);
			}
			$scope.slideToPlay.thumbnails = thumbnails;
		});

	var init = function(){
		getPhotos();
		getSlides();
	};

	init();
};

piController.$inject = ['$scope', '$http', '$timeout', '$filter'];
PIFRAME_APP.controller('piController', piController);