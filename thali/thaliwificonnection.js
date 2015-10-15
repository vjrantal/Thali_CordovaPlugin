'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var nodessdb = require('node-ssdp');

function ThaliWiFiConnection() {
  EventEmitter.call(this);
  this._init();
}

inherits(ThaliWiFiConnection, EventEmitter);

ThaliWiFiConnection.prototype._init = function () {
  this._client = new nodessdp.Client();
  this._client.on('response', function (headers, code, rinfo) {
    this.emit(ThaliEmitter.events.PEER_AVAILABILITY_CHANGED, [{
      peerIdentifier: rinfo.address + '',
      peerAvailable: true,
      peerName: 'name'
    }]);
/*
SSDPDiscovery.prototype.isThisMyIpAddress = function (address) {
    var networkInterfaces = os.networkInterfaces();
    
    var foundit = false;
    Object.keys(networkInterfaces).forEach(function (interfaceName) {
        networkInterfaces[interfaceName].forEach(function (iface) {        
            if (iface.address.toString().trim() == address.toString().trim()) {
                foundit = true;
            }
        });
    });
    
    return foundit;
};
*/
/*
    console.log(headers);
    console.log(code);
*/
    console.log(rinfo);

  }.bind(this));
  setInterval(function () {
    this._client.search('urn:schemas-upnp-org:service:Thali:1');
  }.bind(this), 1000);

  this._server = new nodessdp.Server();
  this._server.addUSN('urn:schemas-upnp-org:service:Thali:1');
};