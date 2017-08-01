"use strict";
jQuery(document).ready(function() {

	var default_properties = {

		cal_height: 3,									//number of rows (weeks) in the calendar

		// today_date: new Date("2017-06-19T20:18:09.983Z"),	   	  					 //date for today

		today_date: new Date(),	   	  					 //date for today


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
		conversionfactor_elevation: 3.28084
	};

	var calendar_template_file;
	var popover_template_file;


	function StravaCalendar(properties, context) {

		var self_reference = this;
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


		//Create lock to prevent repeated scrolling events
		this.render_lock = false;
		this.scroll_lock = false;
		this.context = context;


		//Fetch the calendar template and popover file from the server and view cal when done
		$.when(

			$.get('tmpls/caltemplate.ejs', function(str) {
					    calendar_template_file = _.template(str);
					}),

			$.get('tmpls/popovertemplate.ejs', function(str) {
					    popover_template_file = _.template(str);
					})

		).then(function() {
		    self_reference.view();
		});



		return this;
	}


	StravaCalendar.prototype.view = function(view) {
		this.updateHeight();
		this.render();
	}

	StravaCalendar.prototype.updateHeight = function() {
		//Dynamically calculate the height for rendering based on window size.

		if(!this.render_lock){
		this.render_lock = true;

		var windowHeight = $(window).height();

		if(windowHeight >= 860){
			this.cal_height = 6;
		}
		else if(windowHeight >= 760){
			this.cal_height = 5;
		}
		else if (windowHeight >= 660){
			this.cal_height = 4;
		}
		else {
			this.cal_height = 3;
		}

		this.render_lock = false;

		}
	}


	StravaCalendar.prototype.render = function() {


		if(!this.render_lock){

		this.render_lock = true;

		var calendar = this;
		var calendarDiv = this.context;
		var oldestWeekNeeded = this.cur_weekID + this.cal_height - 1;
		var nextMissingWeek = this.activities.length;

		fetchMissingActivities();
		}

		//Fetch the missing weeks from API and render template when done
		function fetchMissingActivities(){

			if( nextMissingWeek > oldestWeekNeeded) renderCalendar();
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
		                fetchMissingActivities();
		            }
		        });
			}
		}

		function renderCalendar(){
			//Destroy all currently existing popovers
			$("[class='cal-cell-day']").popover("dispose");

			//Render the calendar template
			var render = calendar_template_file({globals: globals, calendar: calendar});
		    calendarDiv.html(render);
		    
			//Detect click on calendar day. Add popover element and display
			$(".cal-cell-day").click(function(){

				if(this.hasAttribute("popoverOn")){
					this.removeAttribute("popoverOn");
					$(this).popover("hide");
				}
				else{
					$("[class='cal-cell-day']").popover("hide");
					$(this).popover({ 
						html : true,
						content: renderPopover( parseInt($(this).attr("weekID")), parseInt($(this).attr("dayOfTheWeek"))),
						trigger: "manual",
						animation: false
					 });
					$(this).popover("show");
					this.setAttribute("popoverOn", "");
				}
			});


			//Release locks when done
			calendar.render_lock = false;
			calendar.scroll_lock = false;

		}

		function renderPopover(weekID, dayOfTheWeek){
			var day_activities = calendar.activities[weekID].activities[dayOfTheWeek];
			return popover_template_file({day_activities: day_activities, globals: globals});
		}
	}

	StravaCalendar.prototype.changeUnits = function(type) {
		if(type == "Metric"){
			globals.units_distance = "km";
			globals.units_elevation = "m";
			globals.conversionfactor_distance = 0.001;
			globals.conversionfactor_elevation = 1;
		}
		else{
			globals.units_distance = "mi";
			globals.units_elevation = "ft";
			globals.conversionfactor_distance = 0.000621371;
			globals.conversionfactor_elevation = 3.28084;
		}
	}


	StravaCalendar.prototype.scrollUp = function() {
		if(!this.scroll_lock){
			this.scroll_lock = true;
			if(this.cur_weekID>0){
				this.cur_weekID--;
				this.render(); //Scroll lock is released after render is done
			}
			else{
				this.scroll_lock = false;
			}
		}
	}

	StravaCalendar.prototype.scrollDown = function() {
		if(!this.scroll_lock){
			this.scroll_lock = true;
			if(this.cur_weekID+6 < this.weekID_max){
				this.cur_weekID++;
				this.render();//Scroll lock is released after render is done
			}
			else{
				this.scroll_lock = false;
			}
		}
	}

	StravaCalendar.prototype.scrollToday = function() {
		
		if(!this.scroll_lock){
			this.scroll_lock = true;
			this.cur_weekID = 0;
			this.render();
		}
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