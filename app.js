//Boiler plate
var quotes = require('./data/quotes.json');
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var strava = require('strava-v3');
var date_helpers = require('./public/js/date_helpers');


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

	//TODO: Redirect to calendar if session already exists
	var login_url = strava.oauth.getRequestAccessURL({'scope':'read,activity:read,activity:read_all,activity:write'});
	if(login_url === undefined || login_url === ""){
		throw new Error("Unable to retrieve Strava login URL");
	}
	res.render('index', { strava_request_access_url: login_url});
});

app.get('/tokenexchange', function(req, res) {

  //Get the access token, save it in session variable, and redirect to training log
  var code = req.query.code;
  strava.oauth.getToken(code,function(err,payload,limits){
  	console.log("Token exchange payload = " + JSON.stringify(payload));
  	if(err){ throw new Error("Unable to request access token");}
	req.session.strava_token = payload.access_token;
	res.redirect('/traininglog');
  });
});

app.get('/traininglog', function(req,res){
  	res.render('traininglog', {});
});

app.get('/logout', function(req,res){ //TODO: CHANGE THIS TO POST
	req.session.destroy();
	res.redirect('/');
});

app.get('/retrieve_quote', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(quotes[Math.floor(Math.random()*quotes.length)]));
});

/*
	retrieve_activities endpoint serves requests for retrieving
	activities for a certain week.

	Request parameters:
		* today_date: today's date
		* week_id: week # with respect to today's date
*/

app.post('/retrieve_activities', function(req,res){
	
	res.setHeader('Content-Type', 'application/json');

	var todayDate = new Date(req.body.todayDate);
	var weekID = req.body.weekID;
	var activityType = req.body.activityType;

	var weekRange = date_helpers.getWeekRange(todayDate, weekID);
	var mondayUnixEpoch = weekRange.monday.getUnixTime();
	var sundayUnixEpoch = weekRange.sunday.getUnixTime();

	strava.athlete.listActivities( 

		{ 'after':mondayUnixEpoch.toString(), 'before':sundayUnixEpoch.toString(), 'access_token':req.session.strava_token },
		function(err,payload,limits){	

			if(err){ res.status(500).send(""); return;}
			if(payload.message){res.status(500).send(payload.message); return;}

			//Filter the payload only with the data we need

			var acts = {};
			acts.week_id = weekID;
			acts.week_range = date_helpers.getWeekRangeFormatted(todayDate, weekID);
			acts.total_week_distance = 0;
			acts.total_week_elevation = 0;
			acts.activities = [[],[],[],[],[],[],[],[]]; //Outer slot is day of the week, inner is list of activities for that day

			for (var i = 0; i < payload.length; i++) {

				if(payload[i].type == activityType){
					
					//Activities are sorted by the day of the week in new filtered payload
					dayOfTheWeek = new Date(payload[i].start_date_local).getDay() - 1;
					if(dayOfTheWeek == -1) {dayOfTheWeek = 6};

					//Filtered data
					var cur = {
						'id': payload[i].id,
						'name': payload[i].name,
						'date': payload[i].start_date_local,
						'distance': payload[i].distance,
						'total_elevation_gain': payload[i].total_elevation_gain,
						'moving_time': payload[i].moving_time,
						'avg_speed': payload[i].avg_speed
					};

					acts.activities[dayOfTheWeek].push(cur);
					acts.total_week_distance += payload[i].distance;
					acts.total_week_elevation += payload[i].total_elevation_gain;
				}
			}

			//Simplify floats to two trailing decimals
			acts.total_week_distance = acts.total_week_distance.toFixed(2);
			acts.total_week_elevation = acts.total_week_elevation.toFixed(2);

			res.send(JSON.stringify(acts));

		}
	);
	
});

app.post('/add_activity', function(req,res){
	res.setHeader('Content-Type', 'application/json');

	var args = JSON.parse(JSON.stringify(req.body));
	args.access_token = req.session.strava_token;


	strava.activities.create( args, function(err,payload,limits){	
			if(err){ res.status(500).send(""); return;}
			else if(payload.message){res.status(500).send(payload.message); return;}
			else(res.send({}));
		});
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
