
/*

	Given a date, return the range of days for the week
	it is in.

	e.g.

	* June 6 2017 -> "Jun 5-11"
	* May 30 2017 -> "May 29-Jun 4"

*/


Date.prototype.getRangeOfWeek = function(){


	var abbreviatedMonths = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
    
	//Get the # of days between the current date and monday
	var daysPastMonday = (this.getDay()-1)%7;

	//Get the monday date
	var monday = new Date();
	monday.setDate(this.getDay() - daysPastMonday);

	//Get the sunday date
	var sunday = new Date();
	sunday.setDate(monday + 6);

	//Result is string with the date range

	if(monday.getMonth() == sunday.getMonth()){
		return abbreviatedMonths[monday.getMonth()] + " " + monday.getDate() + "-" + sunday.getDate();
	}
	else{
		return abbreviatedMonths[monday.getMonth()] + " " + monday.getDate() + "-" + abbreviatedMonths[sunday.getMonth()] + " " + sunday.getDate();
	}

};



/*
	Get the week # of the year
*/

Date.prototype.getWeek = function(iso8601) {
	if (iso8601) {
		var target = new Date(this.valueOf());
		var dayNr  = (this.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		var firstThursday = target.valueOf();
		target.setMonth(0, 1);
		if (target.getDay() != 4) {
			target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
		}
		return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
	} else {
		var onejan = new Date(this.getFullYear(), 0, 1);
		return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
	}
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
