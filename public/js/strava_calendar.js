"use strict";
jQuery(document).ready(function() {

	var default_properties = {

		today_date: new Date(),	   	  					 //date for today

		cur_weekID: 0,	   		   	  					 //week # of the top most row in the view. 0 corresponds to week that contains today_date, 1 is last week, etc.

		cur_activity_type: "Run",     					//"Run" or "Ride"

		run_activities: [],	  	   						//array of strava activities, where each slot corresponds to week ID

		ride_activities: [],

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

		//Dynamically calculate the height for rendering based on window size. 
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


		//Obtain strava activities for the unfetched weeks
		if(this.cur_activity_type == 'Run'){
			var oldest_loaded_weekID = this.run_activities.length - 1;
			var oldest_week_needed = this.cur_weekID + calHeight - 1;

			if(oldest_week_needed > oldest_loaded_weekID){
				for (var i = oldest_loaded_weekID + 1; i<= oldest_week_needed; i++) {
					this.run_activities.push(this.fetchStravaActivities(i));
				}
			}
		}

		//Pass in strava activities to calendar template file
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
		if(weekID>globals.weekIDmax) error = "Week ID can not greater than " + globals.weekIDmax;

		if(error){
			handleError(err);
			return;
		}

		console.log("from date = " + this.today_date);

		var data = {todayDate: this.today_date.toString(), weekID: weekID, activityType: this.cur_activity_type};

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
                console.log("DATA FROM API = " + JSON.stringify(data));
                return data;
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