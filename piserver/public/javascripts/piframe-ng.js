var PIFRAME_APP = angular.module("piFrameApp", []);

PIFRAME_APP.controller('piController', function($scope, $http){
	var slides,
		photos;

	var getPiData = function(){
		 $http.get('/photos/json').success(function(data, status, headers, config){
		 	photos = data;
		 	$scope.photos = photos;
		 	console.log(photos);
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
	}

	$(window).resize(function(){
		$('.photoset-row').css('height', '');
	});

	function updatePhotosInSlidesAry(){
		for(var i = 0; i < slides.length; i++){
	 		var curSlide = slides[i];
	 		var photos = [];

	 		if(curSlide.pictures){
		 		for(var j=0; j < curSlide.pictures.length; j++ ){
		 			var picId = curSlide.pictures[j];
		 			var curphoto = getPhotoById(picId)[0];

		 			photos.push(curphoto);
		 		}
		 		curSlide.pictures = photos;
		 	}
	 	}
	 	console.log("Populated slides with pictures");
	 	console.log(slides); 
	}

	function getPhotoById(id){
		return $.grep(photos, function(e){ return e._id === id;});
	}

	function initPhotos(){
		
		$('#photos').on("pageshow", function(event){
			$('#photos_list_container').photosetGrid({gutter: '5px'});
		});

		$('#slidenew').on("pageshow", function(event){
			$('#photos_list_container_newslide').photosetGrid({gutter: '5px'});
		});

		$('#slideedit').on("pageshow", function(event){
			$('#slides_edit_list_container').photosetGrid({gutter: '5px'});
		});

		$('#slidedelete').on("pageshow", function(event){
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

		$('#deletebtn').click(deletePhoto);//jquery binding

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

	        	photos = data;
	         	//$('#' + photoid).remove();
			}).error(function(data, status, headers, config){
				console.log('ERRORS: ' + data);
			});
		}
	}

	function initSlideDelete(){
		$('#select-slide-delete').change(function(){
			$('#slides_delete_list_container').photosetGrid({gutter: '5px'});
		});

		$('#slide-delete-btn').on('click touchstart', deleteSlide);

		function deleteSlide(){
			var index = $('#selectDelete').val();
			var dataObj;
			var slideId;

			if(!index){
				console.log('No slide selected');
				return;
			}
			slideId = slides[index]._id;


			dataObj = {id: slideId};

			$http.post('/slideshows/delete', dataObj).success(function(data, status, headers, config){
				location.reload();
			});
		}
	}

	function initSlideEdit(){
		function init(){
			//getSlide();
		}

		$('#slide-edit-btn').on('click touchstart', saveSlideEdit);
		$('.photo_edit_img').on('click touchstart', handlePhotoSelect);

		function getSlide(){
			var id = $('#select-slide-edit').val();

			$http.get('/slideshows/edit/slide' + id).success(function(data, status, headers, config){
			});
		}

		function saveSlideEdit(){
			var name = $('#select-slide-edit option:selected').text();
			var index = $('#select-slide-edit').val();
			var pictures = getPhotosSelected('slideedit');
			var objData ={
				id: slides[index]._id,
				name: name,
				pictures: pictures
			};

			$http.put('/slideshows/edit', objData).success(function(data, status, headers, config){
				getPiData();
			});
		}

		$('#select-slide-edit').change(function(){			
			if( $('#select-slide-delete').val() !== "?" ){
				$('#slides_edit_list_container').removeClass('invisible');
				$('#slide-edit-btn').closest('.ui-controlgroup').removeClass('invisible');
			}
			var curSlide = $scope.slideToEdit;
			$('.selected_check_img').remove();

			for(var i=0; i < curSlide.pictures.length; i++){
				var curPic = curSlide.pictures[i];

				var check_img = document.createElement('img');
				check_img.src = "/images/Check-icon.png";
				check_img.className = "selected_check_img";

				$('#' + curPic._id + "edit").parent().append(check_img);
			}
		});

		init();
	}

	var handlePhotoSelect = function(elem){
		var $elemParent = $(this).parent();

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

	function initSlideNew(){
		$('.new_slide_pg_img').on('click touchstart', function(){
			var $elem = $(this);

			if($elem.hasClass('selected_photo')){
				$elem.removeClass('selected_photo');
			}
			else{
				$elem.addClass('selected_photo');
			}
		});

		$('.new_slide_pg_img').on('click touchstart', handlePhotoSelect);

		$('#new-slide-save').on('click touchstart', function(){
			var photosAry = [];
			var slideName = $('#slide-name').val();
			var slideObj = {};

			//validate
			if( !slideName ){//|| !(/^\w+$/).test(slideName) 
				alert("Please enter a name");
			}

			photosAry = getPhotosSelected('slidenew');

			slideObj.name = slideName;
			slideObj.pictures = photosAry;

			saveNewSlide(slideObj);
			console.log(slideObj);
		});

		function saveNewSlide(slide){
			$http.post('/slideshows/new', slide).success(function(data, status, headers, config){
				getPiData();
			});
		}
	}
});

// $.mobile.ajaxFormsEnabled = false;
// 		$('#sendfileform').on('submit', function(event){
// 			event.stopPropagation();
// 			event.preventDefault();

// 			var data = new FormData();
// 			$.each($('#file')[0].files, function(key, value){
// 				data.append(key, value);
// 			});

// 		 	jQuery.ajax({
// 		        type: 'POST',
// 		        data: data,
// 		        cache: false,
// 		        processData: false, // Don't process the files
// 		        contentType: false,
// 		        success: function(data, textStatus, jqXHR)
// 		        {
// 		        	if(typeof data.error === 'undefined'){
// 		        		// submitForm(event, data);
// 		        		location.reload(true);
// 		        	}
// 		        	else{
// 		        		console.log('ERRORS: ' + data.error);
// 		        	}
// 		        },
// 		        error: function(jqXHR, textStatus, errorThrown){
// 		        	console.log('ERRORS: ' + textStatus);
// 		        }
// 		   	});
// 		});