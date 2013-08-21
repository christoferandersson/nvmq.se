/*jslint node: true */
'use strict';

var fs = require('fs');

var stats = {
  since: (new Date()).toISOString().slice(0,19).replace('T', ' ')
};

if (fs.existsSync('./stats.json')) {
  stats = require('./stats.json');
}

process.on('exit', function() {
  // No async code in here.
  fs.writeFileSync('./stats.json', JSON.stringify(stats));
});

function increaseCounter(type, key) {
  if (!key) {
    stats[type] ? stats[type]++ : stats[type] = 1;
  } else {
    if (!stats[type]) {
      stats[type] = {};
    }
    stats[type][key] ? stats[type][key]++ : stats[type][key] = 1;
  }
}

module.exports = {
  collectStats: function(req) {
    process.nextTick(function() {
        if (req.method === 'GET') {
          increaseCounter('getRequestsTotal');
          increaseCounter('getRequestsPerUrn', req.params.urn);
          if (req.get('referrer')) {
            increaseCounter('referrers', req.get('referrer'));
          }
        }
        else if (req.method === 'PUT') {
          increaseCounter('putRequestsTotal');
          increaseCounter('putRequestsPerUrn', req.params.urn);
        }
      });
  },
  getStats: function(req, res) {
    res.json(stats);
  }
};
