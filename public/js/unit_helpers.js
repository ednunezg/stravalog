(function(exports){



	/*
		PURPOSE:

		This file contains helper functions to aid in converting
		distance and speed units
	*/



	exports.metersToMiles = function(distance) {
		return (distance * 0.000621371);
	}

	exports.metersPerSecondToMinuteMiles = function(speed) {
		return (26.8224 / speed);
	}


})(typeof exports === 'undefined'? this['unit_helpers']={}: exports);
