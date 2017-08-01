jQuery(document).ready(function() {

	//Options to be passed in the calendar 
	var options = {};

	//Generate calendar;
	var calendar =  $('#calendar').calendar(options);

	//Set footer to hidden initially
	$('.footer').hide();

	//Enable settings modal
	$('#settings-modal').modal({
	  keyboard: false,
	  show: false
	})

	//Get the quote of the day
	


	//Listen to changes in settings modal
	$("#settings-units :input").change(function() {
    	calendar.changeUnits(this.value);
    	calendar.render();
	});

	//Listen to changes in activity type
	$("#activity-selector :input").change(function() {
    	calendar.changeActivity(this.value);
	});


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


	//Re-render on window resizing, with a 1000 ms debounce

	$(window).resize( $.debounce( 1000, function(event) {
		//Re-render calendar
		calendar.updateHeight();
		calendar.render();

		//Show/hide footer if there is space
	  	if( $(window).height() - $('.container').outerHeight() > 50)
    	{	
    		$('.footer').show();
    	}
    	else{
        	$('.footer').hide();
    	}
	}) );


	//Detect mouse scroll up or down with a 50 ms debounce

	$("#calendar").bind('mousewheel', $.debounce( 50, function(event) {
		var delta = event.originalEvent.deltaY

	    if (delta < 0) {
	        calendar.scrollUp();
	    }
	    if (delta > 0) {
	        calendar.scrollDown();
	    }
	}) );



});
