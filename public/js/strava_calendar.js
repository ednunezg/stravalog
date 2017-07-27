"use strict";
jQuery(document).ready(function() {

	var default_properties = {

		cal_height: 3,									//number of rows (weeks) in the calendar

		today_date: new Date("2017-06-19T20:18:09.983Z"),	   	  					 //date for today

		cur_weekID: 0,	   		   	  					 //week # of the top most row in the view. 0 corresponds to week that contains today_date, 1 is last week, etc.

		cur_activity_type: "Run",     					//"Run" or "Ride"

		activities: [],	  		   						//array of strava activities, where each slot corresponds to week ID

		activities_othertype: [],						//contains activities for non-active activity type. gets swapped with 'activities' on type toggle

		weekID_max: 100									//max possible value of weekID. In other terms, this represents the number of weeks you can scroll back to

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

		units_distance: "mi",
		units_elevation: "ft",

		conversionfactor_distance: 0.000621371,
		conversionfactor_elevation: 3.28084,
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
		this.updateHeight();
		this.render();
	}

	StravaCalendar.prototype.updateHeight = function() {
		//Dynamically calculate the height for rendering based on window size. 
		var windowHeight = $(window).height();

		if(windowHeight >= 900){
			this.cal_height = 6;
		}
		else if(windowHeight >= 800){
			this.cal_height = 5;
		}
		else if (windowHeight >= 700){
			this.cal_height = 4;
		}
		else {
			this.cal_height = 3;
		}
	}


	StravaCalendar.prototype.render = function() {

		var calendar = this;
		var calendarDiv = this.context;
		var oldestWeekNeeded = this.cur_weekID + this.cal_height - 1;
		var nextMissingWeek = this.activities.length;

		fetchMissingActivities();

		//Fetch the missing weeks from API and render template when done
		function fetchMissingActivities(){
			if( nextMissingWeek > oldestWeekNeeded) renderTemplate();
			else{
				var error = "";
				if(nextMissingWeek<0) error = "Week ID can not be less than 0";
				if(nextMissingWeek>calendar.weekID_max) error = "Week ID can not greater than " + calendar.weekID_max;
				if(error){
					handleError(err);
					return;
				}

				var data = {todayDate: calendar.today_date.toString(), weekID: nextMissingWeek, activityType: calendar.cur_activity_type};

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
		                calendar.activities.push(data);
		                nextMissingWeek++;
		                console.log("parent this = " + JSON.stringify(calendar));
		                fetchMissingActivities();
		            }
		        });
			}
		}

		function renderTemplate(){
			//Render the calendar template
			//TODO: Save calendar templates into client side variable once so they are not requested repeatedly
			$.get('tmpls/caltemplate.ejs', function(str) {
			    var template = _.template(str);
			    var render = template({globals: globals, calendar: calendar});
			    calendarDiv.html(render);
			});
		}
	}



	StravaCalendar.prototype.scrollUp = function() {
		if(this.cur_weekID>0){
			this.cur_weekID--;
			this.render();
		}
	}

	StravaCalendar.prototype.scrollDown = function() {
		if(this.cur_weekID+6 < this.weekID_max){
			this.cur_weekID++;
			this.render();
		}
	}

	StravaCalendar.prototype.scrollToday = function() {
		this.cur_weekID = 0;
		this.render();
	}

	StravaCalendar.prototype.changeActivity = function(type) {
		
		if(type != this.cur_activity_type){
			var temp = this.activities;
			this.activities = this.activities_othertype;
			this.activities_othertype = temp;
			this.cur_activity_type = type;
		}

		this.render();

	}


	function handleError(err){
		$( ".container" ).html(err);
	}


	$.fn.calendar = function(params) {
		return new StravaCalendar(params, this);
	}

});