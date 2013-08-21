/*jslint node: true */
'use strict';

var page = require('./page');
// var md2html = new (require('pagedown')).Converter().makeHtml;
// var fs = require('fs');
// var stats = require('./stats')
var conf = require('./config');



function getArticleByPath(req, res) {
  var path = req.params[0].split('/');
  page.getByPath(path, function(err, article) {
    if (err) res.json(500, err);
    else     res.json(article);
  });
}

function putArticleById(req, res) {
  if (conf.env === 'development') // On development you are always admin.
    req.user = { id: conf.adminID };
  if (!req.user)
    return res.send(401, 'You are not logged in.');
  if (!req.body)
    return res.send(400, 'Empty request.');
  var path = req.params[0].split('/');
  page.putById(req.body, req.user, function(err, article) {
    if (err) res.json(500, err);
    else     res.json(article);
  });
}

function putArticleByPath(req, res) {
  if (conf.env === 'development') // On development you are always admin.
    req.user = { id: conf.adminID };
  if (!req.user)
    return res.send(401, 'You are not logged in.');
  if (!req.body)
    return res.send(400, 'Empty request.');
  var path = req.params[0].split('/');
  page.putByPath(path, req.body, req.user, function(err) {
    if (err) res.json(500, err);
    else     res.json({});
  });
}

function delArticleById(req, res) {
  page.delById(req.params.id, function(err) {
    err ? res.json(500, err) : res.json({});
  });
}

function getPage(req, res) {
  var urn = req.params[0];
  page.get(urn, function(err, page) {
    if (err) res.json(500, err);
    else     res.json(page);
  });
}

function putPage(req, res) {
  if (conf.env === 'development')
    req.user = { id: conf.adminID };
  if (!req.user)
    return res.send(401, 'You are not logged in.');
  if (!req.body)
    return res.send(400, 'Empty request.');
  page.set(req.params.urn, req.body, req.user, function(err) {
    if (err) {
      console.log("GOT ERROR:", err);
      if (err === 'unauthorized')
        res.json(401, err);
      else
        res.json(500, err);
    }
    else
      res.json({urn: req.params.urn});
  });
}

function lastUpdates(req, res) {
  page.getLastUpdates(function(err, data) {
    res.json(err || data);
  });
}

function getAllPages(req, res) {
  page.getAll(function(err, data) {
    if (err) {
      res.json(500, err);
    } else {
      res.json(data);
    }
  });
}

module.exports = function(app, passport) {

  // Enable CORS for all paths.
  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  // API
  app.get('/api/articleByPath/*', getArticleByPath);
  app.put('/api/articleByPath/*', putArticleByPath);
  app.put('/api/articleById/:id', putArticleById);
  app.del('/api/articleById/:id', delArticleById);

  app.get('/api/articles',    getAllPages);
  app.get('/api/lastUpdates', lastUpdates);

  app.put('/oldapi/article/:urn', putPage);
  app.get('/oldapi/article/*',    getPage);


  // Authentication via passport.

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/callback',
      passport.authenticate('facebook', { successRedirect: '/auth/success',
                        failureRedirect: '/auth/failure' }));

  app.get('/auth/logout', function(req, res) {
    req.logout();
    res.send('You have been successfully logged out.');
  });

  app.get('/auth/user', function(req, res) {
    res.json(req.user || {});
  });

  app.get('/auth/success', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.send("You've been successfully logged in as " + req.user.name + ".");
  });

  app.get('/auth/failure', function(req, res) {
    res.send('Failed to authenticat.');
  });


  app.get('/favicon.ico', function(req, res) { res.send(404); });
  app.get('/robots.txt', function(req, res)  { res.send(404); });

  // app.get('/private/*', function(req, res) {
  //   if (req.user)
  //     renderPage(req, res);
  //   else
  //     res.send(401);
  // });

  function sendIndex(req, res) { res.sendfile(conf.path.public + '/index.html'); }
  app.get('/',  sendIndex);
  app.get('/*', sendIndex);

};
