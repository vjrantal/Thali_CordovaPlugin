/*
 Thali unit test implementation of tape.
 Highly inspired by wrapping-tape, and usage is very similar to the wrapping tape:

 var tape = require('thali-tape');

 var test = tape({
 setup: function(t) {
 // will be called after each test has started to setup the test
 // after the next line, the actual test code will be executed
 t.end();
 },
 teardown: function(t) {
 // will be called after each device has ended the test
 // do any final tear down for the test in here
 t.end();
 }
 });
 */

'use strict';

var test = require('tape-catch')
var WrappingTape = require('wrapping-tape');
var CoordinatorConnector = require('./CoordinatorConnector');
var parsedJSON = require('../serveraddress.json');

process.on('uncaughtException', function(err) {
  console.log("We have an uncaught exception, good bye: " + JSON.stringify(err));
});

process.on('unhandledRejection', function(err) {
  console.log("We have an uncaught promise rejection, good bye: " + JSON.stringify(err));
});

function Thali_Tape(options) {
  var myName = "UT" + Math.round((Math.random() * (1000000)));
  if(options.deviceName){
    myName = options.deviceName;
  }

  var Coordinator = new CoordinatorConnector();
  Coordinator.init(parsedJSON[0].address, 3000);
  console.log('attempting to connect to test coordinator to ' + parsedJSON[0].address + ' type: ' + parsedJSON[0].name);

  // We're about to add a lot of event handlers so squash the emitter leak warning
  Coordinator.setMaxListeners(0);

  Coordinator.on('error', function (data) {
    var errData = JSON.parse(data);
    console.log('Error:' + data + ' : ' + errData.type +  ' : ' + errData.data);
  });

  // Add a disconnect listener
  Coordinator.on('disconnect', function () {
    console.log('The client has disconnected!');
    //we need to stop & close any tests we are running here
    if(setUp_t != null){
      setUp_t.fail("Coordinator server got disconnected");
      setUp_t = null;
    }

    if(teardDown_t != null){
      teardDown_t.fail("Coordinator server got disconnected");
      teardDown_t = null;
    }
  });

  var isConnected = false;
  Coordinator.on('connect', function () {
    if(!isConnected) {
      isConnected = true;
      Coordinator.initUnitTest(myName);
    }
  });

  var setUp_t = null;
  var teardDown_t = null;

  //test([name], [opts], cb)
  return function(name, opts, cb) {
    // if there is only two input values, then the second is the function, not opts
    if (!cb) {
      cb = opts;
      opts = null;
    }

    var setUpCallback = function(t) {
      if(setUp_t == null) {
        setUp_t = t;
        Coordinator.setUp(myName, name);
      }
    };

    if (options.setup) {
      tape('setup',setUpCallback);
    }

    Coordinator.on('setup_ready', function (data) {
      if (options.setup && (setUp_t != null)) {
        options.setup.call(setUp_t, setUp_t);
        setUp_t = null;
      }
    });

    //test([name], [opts], cb)
    tape(name, function(t) {
      if (opts != null) {
        t.plan(opts);
      }
      cb.call(t, t);
    });


    if (options.teardown) {
      tape('teardown', function(t) {
        teardDown_t = t;
        Coordinator.tearDown(myName,name);
      });
    }

    Coordinator.on('tear_down_ready', function (data) {
      if (options.teardown && (teardDown_t != null)) {
        options.teardown.call(teardDown_t, teardDown_t);
        teardDown_t = null;
      }
    });
  };
}

module.exports = jxcore.utils.OSInfo().isMobile ? Thali_Tape : WrappingTape;
