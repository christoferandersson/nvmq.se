/*jslint node: true */
'use strict';

var express = require('express');
var conf = require('./config');


module.exports = function(app, passport) {

    // app.use(express.logger());
    app.use('/static', express.static(conf.path.public));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.cookieSession({ secret: conf.cookieSecret }));
    app.use(passport.initialize());
    app.use(passport.session());

};
