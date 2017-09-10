jQuery(document).ready(function() {

	//Disable for mobile
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		handleError("This site is not supported for mobile screens.")
	}

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

	//Get inspirational quote
	$.getJSON( "/retrieve_quote", function( data ) {
	  $('.quote-content').html(data.quote);
	  $('.quote-author').html("	―" + data.author);
	});

	//Listen to changes in settings modal
	$("#settings-units :input").change(function() {
    	calendar.changeUnits(this.value);
    	calendar.render();
	});

	//Listen to changes in activity type
	$("#activity-selector :input").change(function() {
    	calendar.changeActivity(this.value);
	});


	//Listen for navigation button events:

	$( "#scrollup-btn" ).click(function() {
	  	calendar.scrollUp();
	});

	$( "#scrolldown-btn" ).click(function() {
	  	calendar.scrollDown();
	});

	$( "#scrolltoday-btn" ).click(function() {
	  	calendar.scrollToday();
	});

	//Listen to 'Add activity' buttons inside popover (not loaded with document initially)

	var modalDayOfTheWeek;
	var modalWeekId;

	$(document).on("click", "#activityadd-btn", function() {
    	//Get the day of the week and week ID of the calendar cell that originated this
		
		modalDayOfTheWeek = parseInt($(".activated-popover").attr("dayoftheweek"));
		modalWeekId = parseInt($(".activated-popover").attr("weekID"));

		//Hide popovers and get rid of activated-popover class

		$("[class*='cal-cell-day']").popover("hide");
		$(".activated-popover").removeClass("activated-popover");
		
		//Open modal

		$("#activityadd-modal").modal('show');
		var form = $("#activityadd-form");
		console.log("form pre filling = " + JSON.stringify(form.serializeArray()) );

	});

	//Listen to modal submit button
	$("#activityadd-form").on('submit', function(e) {
		e.preventDefault();

		var formData = {}; $.each($("#activityadd-form").serializeArray(), function (i, field) { formData[field.name] = field.value || ""; });

		var name = formData.name;

		var type = calendar.cur_activity_type;

		var d = date_helpers.getDateFromWeekId(calendar.today_date, modalWeekId, modalDayOfTheWeek);
		d.setHours(parseInt(formData.time));
		var start_date_local= new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString(); //To ISO, accounting for non UTC timezone

		var elapsed_time = parseInt(formData.duration_hr)*60*60 +
		               parseInt(formData.duration_min)*60       +
		               parseInt(formData.duration_sec);

		var description = formData.description;

		var distance = formData.distance;
		if(formData.distance_units == "Miles"){
			distance = (distance/0.000621371).toFixed(2);
		}
		else{
			distance = (distance*1000).toFixed(2);
		}

		console.log("start_date_local = " + start_date_local);

		var post_data = {name,type,start_date_local,elapsed_time, description, distance};

		$.ajax({
	            url: "/add_activity",
	            data: post_data,
	            method: "POST",
	            error: function(data) {
	                var error = "An error occured when requesting activity creation through the Strava API ";
	                if (data.responseText) error += "<br><br>" + data.responseText;
	                console.log("Error data = " + JSON.stringify(data));
	                console.log(error);
	                handleError(error);
	            },
	            success: function(data) {
					calendar.activities = [];
					calendar.render();
					$("#activityadd-modal").modal('hide');
					$("#activityadd-modal").find('form').trigger('reset');
	            }
	        });

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


	function handleError(err){
		$( ".container" ).html("<br><center><h3>" + err + "</h3><br><h4><a href='/'>Home </a></h4></center>");
	}


});
