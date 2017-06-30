//Boiler plate
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var strava = require('strava-v3')

var app = express();
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

//Session cookies
app.use(session({
	secret: "WILD_KOALA_DREAMS",
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

app.post('/retrieve_activities', function(req,res){
	
	console.log("POST for receive_activities called");
	console.log("req.body = " + req.body);

	var from_date = req.body.from_date;
	var week_id = req.body.week_id;

	console.log("from_date = " + from_date);
	console.log("num_weeks = " + week_id);

	var responseData = {
		week_id: 0,
		total_mileage: 100,
		total_elevation: 15245,
		
		monday_activities:[
			{
				name: "afternoon run",
				mileage: 6,
				elevation: 55
			},
			{
				name:"night run",
				mileage: 10,
				elevation: 100
			}
		],

		wednesday_activities:[
			{
				name: "morning run",
				mileage: 25,
				elevation: 5
			}
		]
	};

	res.send(JSON.stringify(responseData));

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