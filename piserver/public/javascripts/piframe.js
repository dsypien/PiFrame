window.onload=function(){
	$('#sendfileform').on('submit', function(event){
		event.stopPropagation();
		event.preventDefault();

		var data = new FormData();
		$.each($('#file')[0].files, function(key, value){
			data.append(key, value);
		});

	 	$.ajax({
	        type: 'POST',
	        data: data,
	        cache: false,
	        dataType: 'json',
	        processData: false, // Don't process the files
	        contentType: false,
	        success: function(data, textStatus, jqXHR)
	        {
	        	if(typeof data.error === 'undefined'){
	        		submitForm(event, data);
	        	}
	        	else{
	        		console.log('ERRORS: ' + data.error);
	        	}
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	console.log('ERRORS: ' + textStatus);
	        }
    	});
	});

	$('.photo_container').bind('tap', onPhotoTap);

	function onPhotoTap(){
		$('.photo_container').removeClass('selected');
		$(this).addClass('selected');

		$('.photo_container a').removeClass('visible');
		$(this).find('a').addClass('visible');
	}

	$('.deletebtn').click(function(){
		var photoid= $(this).prev().attr('id');
		alert('delete photo with id ' + photoid);

		$.ajax({
	        type: 'DELETE',
	        cache: false,
	        dataType: 'json',
	        processData: false, // Don't process the files
	        contentType: false,
	        success: function(data, textStatus, jqXHR)
	        {
	        	if(typeof data.error === 'undefined'){
	        		submitForm(event, data);
	        	}
	        	else{
	        		console.log('ERRORS: ' + data.error);
	        	}
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	console.log('ERRORS: ' + textStatus);
	        }
    	});
	});


	// $('.ui-icon-delete').mouseenter(function(){
	// 	$('ui-icon-delete').removeClass('ui-btn-active');
	// 	$(this).addClass('ui-btn-active');
	// });

	// $('.ui-icon-delete').mouseleave(function(){
	// 	$(this).removeClass('ui-btn-active');
	// });
};