'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var nodessdp = require('node-ssdp');
var ip = require('ip');
var crypto = require('crypto');

function ThaliWiFiConnection() {
  EventEmitter.call(this);
  this._init();
}

inherits(ThaliWiFiConnection, EventEmitter);

ThaliWiFiConnection.prototype._init = function (deviceName) {
  var serverOptions = {
    location: ip.address() + ':5000/NotificationBeacons',
    adInterval: 500,
    allowWildcards: true,
  };
  if (deviceName) {
    serverOptions.udn = deviceName;
  }
  this._server = new nodessdp.Server(serverOptions);

  this._server.on('advertise-alive', function (headers) {
    console.log('advertise-alive');
    console.log(headers);
    // Expire old devices from your cache.
    // Register advertising device somewhere (as designated in http headers heads)
  });

  this._server.on('advertise-bye', function (headers) {
    console.log('advertise-bye');
    console.log(headers);
    /*
    this.emit('peerAvailabilityChanged', [{
      peerAddress: headers.address + '',
      peerAvailable: false,
    }]);
    */
  });

  this._client = new nodessdp.Client({
    allowWildcards: true
  });

  this._client.on('response', function (headers, code, rinfo) {
    this.emit('peerAvailabilityChanged', [{
      peerAddress: rinfo.address + '',
      peerAvailable: true,
    }]);
  }.bind(this));
};

ThaliWiFiConnection.prototype.startListening = function (callback) {
  this._server.start('0.0.0.0');
  setImmediate(callback, null);
};

ThaliWiFiConnection.prototype.stopListening = function (callback) {
  this._server.stop();
  setImmediate(callback, null);
};

ThaliWiFiConnection.prototype.startUpdateAdvertising = function (callback) {
  // TODO: USN should be regenerated every time this method is called, because
  // according to the specification, that happens when the beacon string is changed.
  // Is below enough or should we use some uuid library or something else?
  var randomString = crypto.randomBytes(16).toString('base64');
  this._server.addUSN('urn:schemas-upnp-org:service:Thali:' + randomString);
  setImmediate(callback, null);
};

ThaliWiFiConnection.prototype.stopAdvertising = function (callback) {
  setImmediate(callback, null);
};

module.exports = ThaliWiFiConnection;
