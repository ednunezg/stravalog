jQuery(document).ready(function() {

	//Options to be passed in the calendar 
	var options = {};


	//Generate calendar;
	var calendar =  $('#calendar').calendar(options);


	//Listen for these button events:

	$( "#scrollup-btn" ).click(function() {
	  alert( "Handler for scrollup called." );
	});

	$( "#scrolldown-btn" ).click(function() {
	  alert( "Handler for scrolldown called." );
	});


	$( "#settings-btn" ).click(function() {
	  alert( "Handler for settings called." );
	});


	//Re-render on window resizing, with a 1000 ms debounce

	var id;
	$(window).resize(function() {
	    clearTimeout(id);
	    id = setTimeout(doneResizing, 1000);
	    
	});
	function doneResizing(){
		//Re-render calendar
		calendar.render();

		//Show/hide footer if there is space
	  	if( $(window).height() - $('.container').outerHeight() > 16)
    	{	
    		$('.footer').show();
    	}
    	else{
        	$('.footer').hide();
    	}
	}

});
