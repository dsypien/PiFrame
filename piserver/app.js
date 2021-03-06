var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var http = require('http');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3');
var db;

var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
var slideshows = require('./routes/slideshows');
var play = require('./routes/play');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/piframe.ico') );
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser({uploadDir:'./pics'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(busboy());

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
