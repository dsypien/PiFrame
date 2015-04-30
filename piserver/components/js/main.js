(function(){
	'use strict';

	var PIFRAME_APP = angular.module("piFrameApp", []);
	$('#notifyMsg').popup();

	var piController = function($scope, $http, $timeout){
		$scope.slideNew = {picture_ids: {}};
		$scope.clickedPhotoId = null;

		function getPhotos(){
			$http.get('photos/json').
				success(function(data, status, headers, config){
					$scope.photos = data;
				});
		}

		function updateSlidesModel(data){
			var slideToEditID,
				slideToPlayID;
			
			// Store id's of selected values
			if($scope.slideToEdit){
				slideToEditID = $scope.slideToEdit.id;
			}
			if($scope.slideToPlay){
				slideToPlayID = $scope.slideToPlay.id;
			}
			
			// Update Slide Model
			$scope.slides = data;

			//Update selects
			updateSlideSelect($scope.slideToEdit, slideToEditID);
			updateSlideSelect($scope.slideToPlay, slideToPlayID);
		}

		// Called whenever the $scope.slides object is upddated
		function updateSlideSelect(targetSlide, slideId){
			// Make sure the target was selected
			if(targetSlide && slideId){
				// find the slide in $scope.slides
				for(var i = 0; i < $scope.slides.length; i++){
					if(slideId === $scope.slides[i].id){
						targetSlide = $scope.slides[i].name;
						return;
					}
				}

				// if not found set to 0
				targetSlide = 0;
			}
		}

		function getSlides(){
			$http.get('slideshows/json').
				success(function(data, status, headers, config){
					updateSlidesModel(data);
				});
		}

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
				showNotification("please enter name");
				return;
			}

			$http.post('/slideshows/new', slide).success(function(data, status, headers, config){
				updateSlidesModel(data);

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
					$scope.slideToEdit = null;
					showNotification("Slide deleted.");
				});
			}
		};

		$scope.saveSlide = function(slide){
			var thatSlide = slide;

			if(slide){
				if(slide.newName == ''){
					slide.newName = null;
				}

				$http.put('/slideshows/edit', slide).success(function(data, status, headers, config){
					showNotification("Slide saved.");
					updateSlidesModel(data);
					slide.newName = '';

					$scope.slideToEdit = thatSlide;
				});
			}
		};

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
				// Check for error message
				if(data.error){
					showNotification(data.error);
					return;
				}

				$scope.photos = data;
				showNotification("Photo saved.");
			}).error(function(data, status, headers){
				showNotification("Upload failed.");
				console.log("ERROR: Upload failed: " + data);
			});
		};

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
		};

		$scope.$watch(
			"slideToEdit",
			function(newValue, oldValue){
				if(newValue === oldValue){
					return;
				}

				console.log("Updating Slide to edit with " + newValue);
				$scope.slideToEdit = newValue;
			});

		// Update thumbnails on slideToPlay
		$scope.$watch(
			"slideToPlay",
			function(){
				var thumbnails = [];
				
				if(!$scope.slideToPlay){
					return;
				}

				for(var id in $scope.slideToPlay.picture_ids){
					for(var i=0 ;i < $scope.photos.length; i++){
						if (id == $scope.photos[i].id){
							console.log($scope.photos[i]);
							thumbnails.push($scope.photos[i]);
							continue;
						}
					}
				}

				$scope.slideToPlay.thumbnails = thumbnails;
			});

		var init = function(){
			getPhotos();
			getSlides();
		};

		init();
	};

	piController.$inject = ['$scope', '$http', '$timeout'];
	PIFRAME_APP.controller('piController', piController);

}());

