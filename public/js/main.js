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


	//Re-render on window resizing, with a 500 ms debounce

	var id;
	$(window).resize(function() {
	    clearTimeout(id);
	    id = setTimeout(doneResizing, 500);
	    
	});
	function doneResizing(){
	  calendar.render();  
	}

});
