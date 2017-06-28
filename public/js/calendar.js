"use strict";

(function($) {

	var defaults = {

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
	};


	function Calendar(parameters, context) {
		this.options = {};
		this.context = context;

		this.view();
		return this;
	}


	Calendar.prototype.view = function(view) {
		this.render();
	}


	Calendar.prototype.render = function() {

		var calendarDiv = this.context;

		//Dynamically calculate the height for rendering based on window size
		var windowHeight = $(window).height();
		var calHeight;

		if(windowHeight >= 820){
			calHeight = 5;
		}
		else if (windowHeight >= 720){
			calHeight = 4;
		}
		else {
			calHeight = 3;
		}

		//Data to be passed in to the calendar template
		var templateData = {
			"first_date": new Date(), //First monday of the top week
			"height": calHeight
		};

		//Render the calendar template
		$.get('tmpls/caltemplate.ejs', function(str) {
		    var template = _.template(str);
		    var render = template({globals: globals, templateData: templateData});
		    calendarDiv.html(render);
		});



	}


	$.fn.calendar = function(params) {
		return new Calendar(params, this);
	}
}(jQuery));