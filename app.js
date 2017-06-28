//Boiler plate
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var strava = require('strava-v3')

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


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
})

app.get('/demo', function(req,res){
	res.send("Respond with demo");
})

app.get('/logout', function(req,res){ //CHANGE THIS TO POST
	req.session.destroy();
	res.redirect('/');
})


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