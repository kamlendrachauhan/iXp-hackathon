var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io    = require( "socket.io" );

var routes = require('./routes/index');
var users = require('./routes/users');
var message = require('./routes/message');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/ixp';
MongoClient.connect(url, function(err, db) {
    console.log("Connected correctly to server.");
    global.db = db;
});

var app = express();
// Socket.io
var io           = socket_io();
app.io           = io;

// socket.io events
io.on("connection", function(socket)
{
    console.log( "A user connected" );
    socket.on('message', function (data) {
        message.handleMessage(socket, data);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
//app.use('/message', message);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
