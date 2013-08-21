/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var conf = require('./config');


// MODELS

var pageSchema = mongoose.Schema({
    urn       : { type: String, lowercase: true },
    parentUrn : { type: String, lowercase: true },
    title     : { type: String },
    body      : { type: String },
    format    : { type: String, lowercase: true, match: /^(html|md)$/, default: 'md' },
    authors   : { type: Array, default: [conf.adminID] },
    date      : { type: String }
    // Authors currently only contains ids.
    // TODO: Make this more flexible, store users in database.
});

var Page = mongoose.model('Pages', pageSchema);

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function createEmptyPage(urn, parentUrn) {
    var urnHuman = capitalize(urn).replace(/_/g, ' ');
    return new Page({
        urn: urn,
        parentUrn: parentUrn,
        title: urnHuman,
        body: 'This page, with urn `' + urn + '`, does not exist.\n\n' +
              'You can create it if you have the required permissions.'
    });
}




function getByPath(path, cb) {
  console.log("getByPath(" + path.join('/') + ')');
  recurse(path.shift(), null);
  function recurse(urn, parentUrn) {
    // console.log("urn: " + urn + " parentUrn: " + parentUrn);
    Page.findOne({urn: urn, parentUrn: parentUrn},
                 {},
                 {lean: true},
                 function(err, article) {
      if (path.length > 0) {
        recurse(path.shift(), urn);
      } else if (article) {
        cb(err, article);
      } else {
        cb(err, createEmptyPage(urn, parentUrn));
      }
    });
  }
}

function putByPath(path, rawUpdate, user, cb) {
  console.log("putByPath(" + path.join('/') + ')');

  getByPath(path, function(err, article) {
    if (err) return cb(err);
    var update = { // Fields which are to be updated.
      urn:       article.urn, // TODO: Allow urn to be changed.
      parentUrn: rawUpdate.parentUrn,
      title:     rawUpdate.title,
      body:      rawUpdate.body,
      format:    rawUpdate.format,
      authors:   rawUpdate.authors || [],
      date:      (new Date()).toISOString().slice(0,10)
    };
    // Admin's permissions cannot be revoked.
    if (update.authors.indexOf(conf.adminID) === -1)
      update.authors.push(conf.adminID);
    // Check for authorization.
    if (article.authors.indexOf(user.id) === -1)
      return cb('unauthorized');
    // PUT can be POST, via upsert.
    Page.findByIdAndUpdate(article._id, update, {upsert: true}, cb);
  });
}

function putById(newArticle, user, cb) {
  console.log("putById(" + newArticle._id + ')');
  Page.findById(newArticle._id, function(err, article) {
    console.log(article);
    if (err) return cb(err);
    article.urn       = newArticle.urn; // TODO: Allow urn to be changed.
    article.parentUrn = newArticle.parentUrn;
    article.title     = newArticle.title;
    article.body      = newArticle.body;
    article.format    = newArticle.format;
    article.authors   = newArticle.authors || [];
    article.date      = (new Date()).toISOString().slice(0,10);
    article.save(cb);
  });
}

function delById(id, cb) {
  console.log("DELETE", id);
  Page.findByIdAndRemove(id, cb);
}

// API


module.exports = {

    getByPath: getByPath,
    putByPath: putByPath,
    putById:   putById,
    delById:   delById,

    getAll: function(cb) {
      Page.find({}, {_id: 1, title: 1, date: 1, urn: 1, parentUrn: 1}, cb);
    },

    getUrnAndNav: function(urn, cb) {
        Page.find({$or: [{urn:urn}, {urn:'site-nav'}]},
                  {},
                  {lean: true},
                  function(err, data) {
                      var page = data[0];
                      var siteNav = data[1];
                      if (urn === 'site-nav')
                          return cb(err, page, page);
                      else if (!siteNav)
                          return cb(err, createEmptyPage(urn), page);
                      else
                          return cb(err, page, siteNav);
                  });
    },

    get: function(urn, cb) {
        Page.findOne({urn: urn},
                     {},
                     {lean: true},
                     function(err, page) {
                         if (!page)
                             return cb(err, createEmptyPage(urn));
                         else
                             return cb(err, page);
                     });
    },

    set: function(urn, updateRaw, user, cb) {
        var update = { // Fields which are to be updated.
            urn:     urn, // TODO: Allow urn to be changed.
            title:   updateRaw.title,
            body:    updateRaw.body,
            format:  updateRaw.format,
            authors: updateRaw.authors || [],
            date:    (new Date()).toISOString().slice(0,10)
        };
        // Admin's permissions cannot be revoked.
        if (update.authors.indexOf(conf.adminID) === -1)
            update.authors.push(conf.adminID);

        Page.findOne({urn: urn}, 'authors', {lean:true}, function(err, page) {
            // A new page is being created, only admin can do this.
            if (!page)
                page = { authors:[conf.adminID] };
            // Check for authorization.
            if (page.authors.indexOf(user.id) === -1)
                return cb('unauthorized');
            // PUT can be POST, via upsert.
            Page.update({urn: urn}, update, {upsert: true}, cb);
        });
    },

    getLastUpdates: function(cb) {
        Page.find({}, 'urn date -_id', {lean:true}).sort({'date':-1}).limit(10).execFind(cb);
    }

};
