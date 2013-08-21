/*jslint node: true */
'use strict';

var FacebookStrategy = require('passport-facebook').Strategy;
var conf = require('./config');


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(new FacebookStrategy({
        clientID:     conf.facebookClientID,
        clientSecret: conf.facebookClientSecret,
        callbackURL:  conf.facebookCallbackURL
    }, function(accessToken, refreshToken, profile, done) {
        return done(null, { name: profile.displayName, displayName: profile.displayName, id: profile.id });
    }));

};
