(function(exports){



	/*
		PURPOSE:

		This file contains helper functions to aid in converting
		back and forth between the integer 'Week Id' and date ranges.

		Used on both server-side and client-side

		A 'Week Id' is computed by calculating the number of weeks
		between today's date and another date.

		Today's date will belong to a week with id of 0,
		last week will have an id of 1, and so on...
	*/



	/*
		Get date based on weekID and dayOfTheWeek
	*/


	exports.getDateFromWeekId = function(todayDate, weekID, dayOfTheWeek) {

		var monday = new Date(todayDate.getPriorMonday());
		monday.setDate(todayDate.getPriorMonday().getDate() - 7*weekID);
		monday.setHours(0,0,0,0);
		
		console.log("MONDAY OF THE WEEK TO ADD TO = " + monday);

		var date = new Date(monday.valueOf());
		date.setDate(date.getDate() + dayOfTheWeek);

		console.log("DAY OF THE WEEK TO ADD TO = " + date);

		return date;
	}


	/*
		Get the first and last date of a week given weekID
		Monday will start at 00:00:00
		Sunday will end at 23:59:59
	*/

	exports.getWeekRange = function(todayDate, weekID) {
		
		var monday = new Date(todayDate.getPriorMonday());
		monday.setDate(todayDate.getPriorMonday().getDate() - 7*weekID);
		monday.setHours(0,0,0,0);
		

		var sunday = new Date(monday.valueOf());
		sunday.setDate(monday.getDate() + 7);
		sunday.setSeconds(sunday.getSeconds() - 1);

		return {
			monday: monday,
			sunday: sunday
		}
	}


	/*
		Given a week ID, return the range of days for the week
		it is in.

		e.g.

		* June 6 2017 -> "Jun 5-11"
		* May 30 2017 -> "May 29-Jun 4"
	*/


	exports.getWeekRangeFormatted = function(todayDate, weekID){

		var abbreviatedMonths = [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
		]

		var range = exports.getWeekRange(todayDate, weekID);

		if(range.monday.getMonth() == range.sunday.getMonth()){
			return abbreviatedMonths[range.monday.getMonth()] + " " + range.monday.getDate() + "-" + range.sunday.getDate();
		}
		else{
			return abbreviatedMonths[range.monday.getMonth()] + " " + range.monday.getDate() + "-" 
			    	+ abbreviatedMonths[range.sunday.getMonth()] + " " + range.sunday.getDate();
		}
	}




	/*
		Obtain the week number that a date belongs in
	*/


	Date.prototype.getWeekId = function(todayDate){

		//Get the date for monday in todayDate's week
		var monday = new Date();
		monday.setDate(todayDate.getPriorMonday());


		//Get the number of days between monday of todayDate's week and this
		var totalDays = ((monday-1) - this) / (1000 * 60 * 60 * 24);


		//Use total days to get number of weeks elapsed (round down)
		return Math.floor(totalDays/7) + 1;
	}


	/*
		Get the first monday occuring prior to a date
		Time is set to 00:00:00 
	*/

	Date.prototype.getPriorMonday = function() {

		//Get the # of days between the current date and monday
		var daysPastMonday = (this.getDay()-1)%7;

		//Get the monday date
		var monday = new Date(this.valueOf());
		monday.setDate(this.getDate() - daysPastMonday);
		monday.setHours(0,0,0,0);

		return monday;
	};

	/*
		Get the month number ('1','2'... '12')
	*/
	Date.prototype.getMonthFormatted = function() {
		var month = this.getMonth() + 1;
		return month < 10 ? '0' + month : month;
	};

	/*
		Get the day # of the month ('01','02','03'..)
	*/


	Date.prototype.getDateFormatted = function() {
		var date = this.getDate();
		return date < 10 ? '0' + date : date;
	};

	/*
		get UTC Unix epoch
	*/

	Date.prototype.getUnixTime = function() {
		// var utc = this.getTime() + (this.getTimezoneOffset() * 60000)
		// return this.getTime()/1000|0;

		return this.getTime()/1000|0;
	};


})(typeof exports === 'undefined'? this['date_helpers']={}: exports);
