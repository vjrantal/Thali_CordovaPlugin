"use strict";

var ThaliEmitter = require('thali/thaliwificonnection');
var tape = require('../lib/thali-tape');

var test = tape({
  setup: function(t) {
    t.end();
  },
  teardown: function(t) {
    t.end();
  }
});

test('#init should TODO', function (t) {
  var wiFiConnection = new ThaliWiFiConnection();

  t.equal(1, 1);
  t.end();
});
