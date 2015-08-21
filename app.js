'use strict';

var util = require('util');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var Image = require('./models/image.js');
var awsUpload = require('./lib/aws-upload.js');

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/images', function (req, res, next) {
  Image.find({}, {__v: 0}, function (err, images) {
    if (err) {
      next(err);
      return;
    }
    res.json(images);
  });
});


app.post('/images', upload.single('file'), function (req, res, next) {
  awsUpload(req.file.buffer, req.body.caption, function (err, data) {
    if (err) {
      next(err);
      return;
    }
    res.json({
      body: req.body,
      file: req.file.buffer
    });
  });
});


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
    res.status(err.status || 500).json({
      'error': {
        message: err.message,
        error: err
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      'error': {
        message: err.message,
        error: {}
      }
  });
});


module.exports = app;
