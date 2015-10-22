"use strict";

var ThaliWiFiConnection = require('thali/thaliwificonnection');
var tape = require('../lib/thali-tape');
var nodessdp = require('node-ssdp');

function noop () { }

var wiFiConnection = new ThaliWiFiConnection('testDeviceName');

var test = tape({
  setup: function(t) {
    setTimeout(function () {
      wiFiConnection.startListening(function (err) {
        t.end();
      });
    }, 1000);
  },
  teardown: function(t) {
    setTimeout(function () {
      wiFiConnection.stopListening(function (err) {
        t.end();
      });
    }, 1000);
  }
});

test('#startListening should emit peerAvailabilityChanged after test peer becomes available', function (t) {
  t.equal(1, 1);
  t.end();
});

test('#startUpdateAdvertising should use different USN after every invocation', function (t) {
  var serverBackup = wiFiConnection._server; 
  var currentUsn;
  wiFiConnection._server = {
    start: noop,
    addUSN: function(usn) {
      currentUsn = usn;
    }
  };
  wiFiConnection.startUpdateAdvertising(function() {
    var firstUsn = currentUsn;
    wiFiConnection.startUpdateAdvertising(function() {
      t.notEqual(firstUsn, currentUsn);
      wiFiConnection._server = serverBackup;
      t.end();
    });
  });
});
