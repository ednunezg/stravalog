"use strict";
jQuery(document).ready(function() {

	var default_properties = {

		today_date: new Date(),	   	   //date for today

		cur_weekID: 0,	   		   	   //week # of the top most row in the view. 0 corresponds to week that contains today_date, 1 is last week, etc.

		strava_activities: [],	  	   //array of strava activities, where each slot corresponds to week ID

		oldest_loaded_weekID: null     //oldest weekID present in strava_activities

	};

	var globals = {

		day_names: { 
					d0: "Mon",
					d1: "Tue",
					d2: "Wed",
					d3: "Thu",
					d4: "Fri",
					d5: "Sat",
					d6: "Sun"
				},

		error_noview: 'Calendar: View {0} not found',
		error_dateformat: 'Calendar: Wrong date format {0}. Should be either "now" or "yyyy-mm-dd"',
		error_loadurl: 'Calendar: Event URL is not set',
		error_where: 'Calendar: Wrong navigation direction {0}. Can be only "next" or "prev" or "today"',
		error_timedevide: 'Calendar: Time split parameter should divide 60 without decimals. Something like 10, 15, 30',


		weekIDmax: 100
	};


	function StravaCalendar(properties, context) {
		
		//Load default properties
		for (var key in default_properties) {
	  	if (default_properties.hasOwnProperty(key)) {
		    this[key] = default_properties[key];
		  }
		}

		//Overwrite default properties for those passed in
		for (var key in properties) {
	  	if (properties.hasOwnProperty(key)) {
		    this[key] = properties[key];
		  }
		}

		this.context = context;

		this.view();
		return this;
	}


	StravaCalendar.prototype.view = function(view) {
		this.render();
	}


	StravaCalendar.prototype.render = function() {

		var calendarDiv = this.context;

		//Dynamically calculate the height for rendering based on window size
		var windowHeight = $(window).height();
		var calHeight;

		if(windowHeight >= 900){
			calHeight = 6;
		}
		else if(windowHeight >= 800){
			calHeight = 5;
		}
		else if (windowHeight >= 700){
			calHeight = 4;
		}
		else {
			calHeight = 3;
		}

		/*

		// Fetch all the activities that are not present in strava_activities
		var topLeftDate = new Date(this.today_date.getPriorMonday());
		topLeftDate.setDate(topLeftDate.getDate() - view_week_number*7);

		var bottomRightDate = new Date();
		bottomRightDate.setDate(topLeftDate - height*7);

		if(this.oldest_loaded_date === null){
			this.fetchStravaActivities(bottomRightDate, topLeftDate);
			this.oldest_loaded_date = bottomRightDate;
		}
		else if(bottomRightDate < this.oldest_loaded_date) {
			this.fetchStravaActivities(bottomRightDate, this.oldest_loaded_date);
			this.oldest_loaded_date = bottomRightDate;
		}
		*/


		//Data to be passed in to the calendar template
		var templateData = {
			"top_date": this.top_date, //First monday of the top week
			"height": calHeight
		};

		//Render the calendar template
		//TODO: Save calendar templates into client side variable once so they are not requested repeatedly
		$.get('tmpls/caltemplate.ejs', function(str) {
		    var template = _.template(str);
		    var render = template({globals: globals, templateData: templateData});
		    calendarDiv.html(render);
		});

	}



	StravaCalendar.prototype.fetchStravaActivities = function(weekID){
		
		var error = "";
		if(weekID<0) error = "Week ID can not be less than 0";
		if(weekID>globals.weekIDmax) error = "Week ID can not greater than " + weekIDmax;

		if(error){
			handleError(err);
			return;
		}

		console.log("from date = " + this.today_date);

		var data = {from_date: this.today_date.toString(), week_ID: weekID};

		$.ajax({
            url: "/retrieve_activities",
            data: data,
            method: "POST",
            error: function(data) {
                var error = "An error occured trying to fetch strava activities from server API. ";
                if (data.responseText) error += "\n\n" + data.responseText;
                console.log(error);
                handleError(error);
            },
            success: function(data) {
                console.log("DATA FROM API = " + data);
            }
        });
	}

	function handleError(err){
		$( ".container" ).html(err);
	}


	$.fn.calendar = function(params) {
		return new StravaCalendar(params, this);
	}

});