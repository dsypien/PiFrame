window.onload=function(){
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
};