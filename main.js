/*jslint node: true */
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var conf = require('./config');

// Mongoose
mongoose.connect(conf.MONGOHQ_URL);

// Passport
require('./passport')(passport);

// Express
var app = express();
require('./express')(app, passport);

// Routes
require('./routes')(app, passport);

// Start server
app.listen(conf.port);
console.log("Listening on port: " + conf.port +
            ", in env: " + app.settings.env);
