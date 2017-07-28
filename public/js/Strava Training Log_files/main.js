jQuery(document).ready(function() {

	//Options to be passed in the calendar 
	var options = {};


	//Generate calendar;
	var calendar =  $('#calendar').calendar(options);


	//Listen for these button events:

	$( "#scrollup-btn" ).click(function() {
	  	calendar.scrollUp();
	});

	$( "#scrolldown-btn" ).click(function() {
	  	calendar.scrollDown();
	});

	$( "#scrolltoday-btn" ).click(function() {
	  	calendar.scrollToday();
	});


	$( "#settings-btn" ).click(function() {
	  alert( "Handler for settings called." );
	});



	//Re-render on window resizing, with a 1000 ms debounce

	$(window).resize( $.debounce( 1000, function(event) {
		//Re-render calendar
		calendar.updateHeight();
		calendar.render();

		//Show/hide footer if there is space
	  	if( $(window).height() - $('.container').outerHeight() > 16)
    	{	
    		$('.footer').show();
    	}
    	else{
        	$('.footer').hide();
    	}
	}) );


	//Detect mouse scroll up or down with a 300 ms debounce

	$(window).bind('mousewheel', $.debounce( 300, function(event) {
		var delta = event.originalEvent.deltaY

		console.log("SCROLL Detect");
		console.log("DELTA = " + delta);
	    if (delta < 0) {
	    	console.log("SCROLL UP DETECTED");
	        calendar.scrollUp();
	    }
	    if (delta > 0) {
	    	console.log("SCROLL DOWN DETECTED");
	        calendar.scrollDown();
	    }
	}) );


	//Detect change in activity type
	$("#activity-selector :input").change(function() {
    	calendar.changeActivity(this.value);
	});


});
