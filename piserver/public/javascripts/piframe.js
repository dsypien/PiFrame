(function(){
	"use strict";

	function init(){
		initPhotos();
		initSlideNew();
		initSlideEdit();
	}

	function initPhotos(){
		$('.photo_container').on('click touchstart',function(){
			var $anchorElem = $(this).find('a');

			if($anchorElem.hasClass('visible')){
				deletePhoto.call($anchorElem);
				return;
			}

			$('.photo_container').removeClass('selected');
			$(this).addClass('selected');

			$('.photo_container a').removeClass('visible');
			$(this).find('a').addClass('visible');
			return false;
		});		

		$('.deletebtn').click(deletePhoto);

		function deletePhoto(event){
			event.stopPropagation();
			var photoid= $(this).prev().attr('id');
			var url = "/photos:" +photoid;

			$.ajax({
		        type: 'post',
		        dataType: 'json',
		        data: {_method: 'delete', id : photoid},
		        success: function(data, textStatus, jqXHR)
		        {
		        	if(data.error !== undefined) {
		        		console.log('ERRORS: ' + data.error);
		        	}
		        	else{
		        		location.reload(true);
		        	}
		        },
		        error: function(jqXHR, textStatus, errorThrown){
		        	console.log('ERRORS: ' + textStatus);
		        }
	    	});
		}
	}

	function initSlideEdit(){
		function init(){
			getSlide();
		}

		$('#slide-edit-btn').on('click touchstart', getSlide);

		function getSlide(){
			var id = $('#select-slide-edit').val();

			$.ajax({
				url: '/slideshows/edit/slide' + id,
				type: 'get',
				dataType: 'json'
			});
		}

		init();
	}

	function initSlideNew(){
		$('.photo_container_newslide').on('click touchstart', function(){
			var $elem = $(this);

			if($elem.hasClass('selected_photo')){
				$elem.removeClass('selected_photo');
			}
			else{
				$elem.addClass('selected_photo');
			}
		});

		$('#new-slide-save').on('click touchstart', function(){
			var selectedElements = $('#photos_list_container_newslide .selected_photo');
			var photosAry = [];
			var slideName = $('#slide-name').val();
			var slideObj = {};

			//validate
			if( !slideName ){//|| !(/^\w+$/).test(slideName) 
				alert("Please enter a name");
			}

			for(var i = 0; i < selectedElements.length; i++){
				var imgElement = $(selectedElements[i]).children()[0];
				var id = $(imgElement).attr('id');
				photosAry.push(id);
			}

			slideObj.name = slideName;
			slideObj.pictures = photosAry;

			saveNewSlide(slideObj);
			console.log(slideObj);
		});

		function saveNewSlide(slide){
			$.ajax({
				type: 'post',
				data: slide,
				dataType: 'json'
			}).success(function(data, textStatus, jqXHR){

			}).error(function(jqXHR, textStatus, errorThrwon){
				console.log("Error uploading new slide");
			});
		}
	}

	return init();
})();








	//$.mobile.ajaxFormsEnabled = false;
	// $('#sendfileform').on('submit', function(event){
	// 	event.stopPropagation();
	// 	event.preventDefault();

	// 	var data = new FormData();
	// 	$.each($('#file')[0].files, function(key, value){
	// 		data.append(key, value);
	// 	});

	//  	$.ajax({
	//         type: 'POST',
	//         data: data,
	//         cache: false,
	//         processData: false, // Don't process the files
	//         contentType: false,
	//         success: function(data, textStatus, jqXHR)
	//         {
	//         	if(typeof data.error === 'undefined'){
	//         		// submitForm(event, data);
	//         		location.reload(true);
	//         	}
	//         	else{
	//         		console.log('ERRORS: ' + data.error);
	//         	}
	//         },
	//         error: function(jqXHR, textStatus, errorThrown){
	//         	console.log('ERRORS: ' + textStatus);
	//         }
 //    	});
	// });