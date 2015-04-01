var PIFRAME_APP = angular.module("piFrameApp", []);

PIFRAME_APP.controller('piController', function($scope, $http){
	var slides;

	var getPiData = function(){
		 $http.get('/photos/json').success(function(data, status, headers, config){
		 	$scope.photos = data;
		 	$scope.slideToEdit = $scope.photos[0];
		 	
		 	$http.get('/slideshows/json').success(function(data, status, headers, config){
			 	slides = data;
			 	$scope.slides = slides;
			 	setTimeout(init, 100);
			 	console.log(slides);

			 	updatePhotosInSlidesAry();
			});
		 });
	}();

	 function init(){
		initPhotos();
		initSlideNew();
		initSlideEdit();
		initSlideDelete();
		initSettings();
		$('body').fadeIn(1000);
	}

	$(window).resize(function(){
		$('.photoset-row').css('height', '');
	});

	function updatePhotosInSlidesAry(){
		for(var i = 0; i < slides.length; i++){
	 		var curSlide = slides[i];

	 		if(curSlide.picture_ids){
		 		for(var j=0; j < curSlide.picture_ids.length; j++ ){
		 			var picId = curSlide.picture_ids[j];
		 			var curphoto = getPhotoById(picId)[0];

		 			$scope.photos.push(curphoto);
		 		}
		 		curSlide.picture_ids = $scope.photos;
		 	}
	 	}
	 	console.log("Populated slides with pictures");
	 	console.log(slides); 
	}

	function getPhotoById(id){
		return $.grep($scope.photos, function(e){ return e.id == id;});
	}

	function fadeIn(elem){
		this.animate({
				"opacity": 100,
				"filter": "alpha(opacity=100)"
			}, 4000);
	}

	function initPhotos(){
		
		$('#photos').on("pageshow", function(event){
			$('#photos_list_container').photosetGrid({gutter: '5px'});
			fadeIn.call($('#photos_list_container'));
		});

		$('#slidenew').on("pageshow", function(event){
			$('#photos_list_container_newslide').photosetGrid({gutter: '5px'});
			fadeIn.call($('#photos_list_container_newslide'));
		});

		$('#slideedit').on("pageshow", function(event){
			$('#slides_edit_list_container').photosetGrid({gutter: '5px'});
			fadeIn.call($('#slides_edit_list_container'));
		});

		$('#slidedelete').on("pageshow", function(event){
			fadeIn.call($('#slides_delete_list_container'));
			//$('#slides_delete_list_container').photosetGrid({gutter: '5px'});
		});


		$('.photo_pg_img').on('click touchstart',function(){
			var parentElem = $(this).parent();

			if(parentElem.hasClass('visible')){
				deletePhoto.call(parentElem);
				return;
			}

			// Add button to parent
			$('#deletebtn').appendTo(parentElem);
			$('#deletebtn').addClass('visible');
			$('deletebtn').css('width', parentElem.width() + "px");

			$('.photo_pg_img').removeClass('selected');
			$(this).addClass('selected');

			$('.photo_container a').removeClass('visible');
			$(this).find('a').addClass('visible');
			return false;
		});		

		$('#deletebtn').click(deletePhoto);

		function deletePhoto(event){
			event.stopPropagation();
			var photoid= $(this).prev().attr('id');
			var data = {_method: 'delete', id : photoid};

			$http.post('/photos', data).success(function(data, status, headers, config){
				if(data.error !== undefined) {
	        		console.log('ERRORS: ' + data.error);
	        		return;
	        	}
	        	
	        	location.reload();

	        	$scope.photos = data;
	         	//$('#' + photoid).remove();
			}).error(function(data, status, headers, config){
				console.log('ERRORS: ' + data);
			});
		}
	}

	function initSlideDelete(){
		$('#select-slide-delete').change(function(){
			$('#slides_delete_list_container').photosetGrid({gutter: '5px'});
			fadeIn.call($('#slides_delete_list_container'));
		});

		$('#slide-delete-btn').on('click touchstart', deleteSlide);

		function deleteSlide(){
			var index = $('#selectDelete').val();
			var dataObj;
			var slideId;
			var name;

			if(!index){
				console.log('No slide selected');
				return;
			}
			slideId = slides[index].id;
			name = slides[index].name;


			dataObj = {id: slideId, name: name};

			$http.post('/slideshows/delete', dataObj).success(function(data, status, headers, config){
				location.reload();
			});
		}
	}

	function initSlideNew(){
		$('.new_slide_pg_img').click(handlePhotoSelect);

		$('#new-slide-save').on('click touchstart', function(){
			var photosAry = [];
			var slideName = $('#slide-name').val();
			var slideObj = {};

			//validate
			if( !slideName ){
				alert("Please enter a name");
			}

			photosAry = getPhotosSelected('slidenew');

			slideObj.name = slideName;
			slideObj.picture_ids = photosAry;

			saveNewSlide(slideObj);
			console.log(slideObj);
		});

		function saveNewSlide(slide){
			$http.post('/slideshows/new', slide).success(function(data, status, headers, config){
				location.reload();
			});
		}
	}

	function initSlideEdit(){
		$('#slide-edit-btn').on('click touchstart', saveSlideEdit);
		$('.photo_edit_img').click(handlePhotoSelect);

		function getSlide(){
			var id = $('#select-slide-edit').val();

			$http.get('/slideshows/edit/slide' + id).success(function(data, status, headers, config){
				location.reload();
			});
		}

		function saveSlideEdit(){
			var name = $('#select-slide-edit option:selected').text();
			var index = $('#select-slide-edit').val();
			var pictures = getPhotosSelected('slideedit');
			var objData ={
				id: slides[index].id,
				name: name,
				picture_ids: pictures
			};

			$http.put('/slideshows/edit', objData).success(function(data, status, headers, config){
				//getPiData();
				location.reload();
			});
		}

		$('#select-slide-edit').change(function(){			
			if( $('#select-slide-delete').val() !== "?" ){
				$('#slides_edit_list_container').removeClass('invisible');
				$('#slide-edit-btn').closest('.ui-controlgroup').removeClass('invisible');
			}
			$('#slideedit .selected_check_img').remove();

			var curSlide = $scope.slideToEdit;
			for(var i=0; i < curSlide.picture_ids.length; i++){
				var curPic = curSlide.picture_ids[i];

				var check_img = document.createElement('img');
				check_img.src = "/images/Check-icon.png";
				check_img.className = "selected_check_img";

				$('#' + curPic.id + "edit").addClass('selected_photo');
				$('#' + curPic.id + "edit").parent().append(check_img);
			}
		});
	}

	function initSettings(){
		$('#slide-play-btn').on('click touchstart', playSlide);

		function playSlide(){
			var index = $('#selectSlideToPlay').val();
			var slide = slides[index];
			
			// Play Slide!
			$http.post('/play', slide).success(function(data, status, headers, config){
			});
		}

		$('#selectSlideToPlay').change(function(){
			$('#slide-play-btn').removeClass('invisible');
		});
	}

	var handlePhotoSelect = function(elem){
		event.stopPropagation();
		var $elemParent = $(this).parent();
		var $elem = $(this);

 		// remove green check mark if it is set for the element otherwise add a check mark
		if($elem.hasClass('selected_photo')){
			$elem.removeClass('selected_photo');
		}
		else{
			$elem.addClass('selected_photo');
		}

		if( $elemParent.children('.selected_check_img').length !== 0 ){
			$elemParent.children('.selected_check_img')[0].remove();
		}
		else{
			var check_img = document.createElement('img');
			check_img.src = "/images/Check-icon.png";
			check_img.className = "selected_check_img";
			$elemParent.append(check_img);
		}
	};

	var getPhotosSelected = function(pageid){
		var photosAry =[];
		var selectedElements = $('#' + pageid + ' .selected_check_img');
		for(var i = 0; i < selectedElements.length; i++){
			var imgElement = $(selectedElements[i]).prev();
			var id = $(imgElement).attr('id');
			if(pageid === 'slideedit'){
				id = id.replace('edit', '');
			}
			photosAry.push(id);
		}
		return photosAry;
	};
});