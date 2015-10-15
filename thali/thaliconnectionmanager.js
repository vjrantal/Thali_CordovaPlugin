'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

function ThaliConnectionManager() {
  EventEmitter.call(this);
  this._init();
}

inherits(ThaliConnectionManager, EventEmitter);

ThaliConnectionManager.events = {
  PEER_AVAILABILITY_CHANGED: 'peerAvailabilityChanged'
};

ThaliConnectionManager.prototype.announceAndDiscover = function (identityString) {
  // TODO: Setup express endpoint
  // TODO: Check which transports available
};

module.exports = ThaliConnectionManager;
