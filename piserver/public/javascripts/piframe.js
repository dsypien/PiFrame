window.onload=function(){
	$('#sendfileform').on('submit', function(event){
		event.stopPropagation();
		event.preventDefault();

		var data = new FormData();
		$.each($('#file')[0].files, function(key, value){
			data.append(key, value);
		});

	 	$.ajax({
	        // url: 'http://localhost:3000/photos',
	        type: 'POST',
	        data: data,
	        cache: false,
	        dataType: 'json',
	        processData: false, // Don't process the files
	        contentType: 'multipart/form-data; boundary=leboundary',
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
};