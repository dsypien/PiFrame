var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var formidable = require('formidable');
var http = require('http');
var mongo = require('mongodb');
var monk = require('monk');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3');
var db;
var db_file = ('./data/piframe.db');
// var db= monk('localhost:27017/piFrameDB');


var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
var slideshows = require('./routes/slideshows');
var play = require('./routes/play');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser({uploadDir:'./pics'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

// Create DB if one does not exist and 
// make db available to our router
app.use(function(req,res,next){
    var exists = fs.existsSync(db_file);

    try{
        if(!exists){
            console.log("Creating db file");
            fs.openSync(db_file, 'w');
        }

        db = new sqlite3.Database(db_file);

        db.serialize(function(){
            //DB SETUP
            if(!exists){
                db.run("CREATE TABLE PHOTOS (ID INT PRIMARY KEY NOT NULL, CHECKSUM TEXT NOT NULL, THUMB_NAME TEXT NOT NULL)");

                db.run("CREATE TABLE SLIDESHOWS ( ID INT PRIMARY KEY  NOT NULL, NAME  TEXT  NOT NULL )");

                db.run("CREATE TABLE PHOTOS_TO_SLIDE (ID INT PRIMARY KEY NOT NULL,PHOTOS_ID INT NOT NULL,SLIDES_ID INT NOT NULL)");
            }

        });
    }catch(e){
        console.log(e);
    }

    req.db = db;
    next();
});

app.use('/', routes);
app.use('/photos', photos);
app.use('/slideshows', slideshows);
app.use('/play', play);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
