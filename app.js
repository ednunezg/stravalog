//Boiler plate
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var strava = require('strava-v3')
var date_helpers = require('./public/js/date_helpers')
var unit_helpers = require('./public/js/unit_helpers')


var app = express();
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));



//Session cookies
app.use(session({
	secret: "MajesticSeaFlapFlap",
	resave: false,
	saveUninitialized: true,
	cookie: { 
	    secure: false,
	    maxAge: 432000000 //5 days in milliseconds
	},
	//store: new FileStore()
}));


// Setup EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Routing


app.get('/', function(req, res) {
	console.log("INDEX PAGE ACCESS TOKEN = " + req.session.strava_token);

	//If access token exists in session, redirect to training log page
	if (req.session.strava_token !== 'undefined' && typeof req.session.strava_token === 'string') {
		res.redirect('/traininglog');
		return;
	}

	//Else, we render a page with login URL
	else{
		var login_url = strava.oauth.getRequestAccessURL({});
	  	if(login_url === undefined || login_url === ""){
	  		throw new Error("Unable to retrieve Strava login URL");
	  	}
	  	res.render('index', { strava_request_access_url: login_url});
	}
});

app.get('/tokenexchange', function(req, res) {

  //Get the access token, save it in session variable, and redirect to training log
  var code = req.query.code;
  strava.oauth.getToken(code,function(err,payload,limits){
  	if(err){ throw new Error("Unable to request access token");}
	req.session.strava_token = payload.access_token;
	console.log("ACCESS TOKEN PRIOR TO REDIRECTING =" , req.session.strava_token);
	res.redirect('/traininglog');
  });
});

app.get('/traininglog', function(req,res){
	console.log("ACCESS TOKEN AFTER REDIRECTING =" , req.session.strava_token);
	//strava.athletes.get({id:1595767},function(err,payload,limits) {
	//	console.log(payload);
	//});
  	res.render('log', {});
});

app.get('/demo', function(req,res){
	res.send("Respond with demo");
});

app.get('/logout', function(req,res){ //TODO: CHANGE THIS TO POST
	req.session.destroy();
	res.redirect('/');
});


/*
	retrieve_activities endpoint serves requests for retrieving
	activities for a certain week.

	Request parameters:
		* today_date: today's date
		* week_id: week # with respect to today's date
*/

app.post('/retrieve_activities', function(req,res){
	
	var todayDate = new Date(req.body.todayDate);
	var weekID = req.body.weekID;
	var activityType = req.body.activityType;

	console.log("today_date = " + todayDate);
	console.log("num_weeks = " + weekID);

	var weekRange = date_helpers.getWeekRange(todayDate, weekID);
	var mondayUnixEpoch = weekRange.monday.getUnixTime();
	var sundayUnixEpoch = weekRange.sunday.getUnixTime();

	console.log("Monday epoch = " + mondayUnixEpoch);
	console.log("Sunday epoch = " + sundayUnixEpoch);

	strava.athlete.listActivities( 

		{ 'after':mondayUnixEpoch.toString(), 'before':sundayUnixEpoch.toString() },
		function(err,payload,limits){	
			if(err){ throw new Error("Unable to request athlete activities");}
		
			//Filter the payload only with the data we need

			var acts = {};
			acts.week_id = weekID;
			acts.week_range = date_helpers.getWeekRangeFormatted(todayDate, weekID);
			acts.total_week_distance = 0;
			acts.total_week_elevation = 0;
			acts.activities = [[],[],[],[],[],[],[],[]]; //Outer slot is day of the week, inner is list of activities for that day

			console.log("payload length = " + payload.length);
			console.log("payload[0] = " + JSON.stringify(payload[0]));

			for (var i = 0; i < payload.length; i++) {

				console.log("payload[" + i + "] type = " + payload[i].type);
				if(payload[i].type == activityType){
					
					//Activities are sorted by the day of the week in new filtered payload
					dayOfTheWeek = new Date(payload[i].start_date_local).getDay();
					
					//Filtered data
					var cur = {
						'id': payload[i].id,
						'name': payload[i].name,
						'date': payload[i].start_date_local,
						'distance': payload[i].distance,
						'total_elevation_gain': payload[i].total_elevation_gain,
						'moving_time': payload[i].moving_time,
						'avg_speed': payload[i].avg_speed
					}

					acts.activities[dayOfTheWeek].push(cur);
					acts.total_week_distance += payload[i].distance;
					acts.total_week_elevation += payload[i].total_elevation_gain;
				}
			}

			//Simplify floats to two trailing decimals
			acts.total_week_distance = acts.total_week_distance.toFixed(2);
			acts.total_week_elevation = acts.total_week_elevation.toFixed(2);

		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(acts));

		}
	);
	
});


// Catch 404s and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;