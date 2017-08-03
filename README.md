A simplified Strava training log
==============================================

![](http://i66.tinypic.com/mohn5.png)

This nameless project attempts to provide an easy and streamlined solution to viewing a training log of your Strava activities. It is intended to be primarily used as a 'new tab' page in your web browser, but can also be accessed as a regular site.

This project is built with node.js on the server side and jQuery/vanillaJS/Bootstrap on the client side.

Hosted here: http://stravalog.herokuapp.com/

If you don't have a Strava account, you can access a demo version of the site: http://stravalogdemo.herokuapp.com/

Running the project
--------------------

1. Install node.js and npm
2. ```$ git clone https://github.com/ednunezg/StravaLog```
3. Install dependencies ```$ npm install```
4. Edit the data/strava_config file with your Strava API token, ID and secret
5. Start app ```$ nodemon start```
6. Go to http://localhost:3000

Project issues / Future features
--------------------------------

1. Right now, the client requests a list of activities from the server on a week to week basis. If instead, the server can respond with a list of activities that span across multiple weeks, the page could load significantly faster.
2. Accessing the home page should redirect you to the /traininglog page if the server still has your access token cached.
3. UI could be cleaned up a bit. Background color of each workout bubble can be toned to represent the length of the workout (Dark blue for long runs, light blue for shorter runs).