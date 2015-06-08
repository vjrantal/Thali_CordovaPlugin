(function () {

/*
Helper functions and variables
*/

  // Logs in Cordova.
  function logInCordova(text) {
    cordova('logInCordova').call(text);
  };

  // Gets the device name.
  function getDeviceName() {
    var deviceNameResult;
    cordova('GetDeviceName').callNative(function (deviceName) {
      logInCordova('GetDeviceName return was ' + deviceName);
      deviceNameResult = deviceName;
    });
    return deviceNameResult;
  };

  // Gets the peer identifier.
  function getPeerIdentifier() {
    var _peerIdentifierKey = 'PeerIdentifier';

    var peerIdentifier;
    cordova('GetKeyValue').callNative(_peerIdentifierKey, function (value) {
      peerIdentifier = value;
      if (peerIdentifier == undefined) {
        cordova('MakeGUID').callNative(function (guid) {
          peerIdentifier = guid;
          cordova('SetKeyValue').callNative(_peerIdentifierKey, guid, function (response) {
            if (!response.result) {
              alert('Failed to save the peer identifier');
            }
          });
        });
      }
    });
    return peerIdentifier;
  };

 function getFreePort() {
    var freePortNumber;
    cordova('getFreePort').callNative(function (portno) {
      logInCordova('getFreePort return was ' + portno);
      freePortNumber = portno;
    });
    return freePortNumber;
  };

  var peerIdentifier = getPeerIdentifier();
  var peerName = getDeviceName();


function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}


/*
Helper functions to map native calls to example app's function calls
*/
// this is our HTTP server that gets all incoming requests
var http = require("http");
var server = http.createServer(function(request, response) {

    console.log('HTTP request called : ' + request.method);
    console.log(request.headers);

    if(request.method.localeCompare("GET")  == 0){

    }else{
        gotMessage(request.body);
    }

    response.writeHead(200, {"Content-Type": "text/html"});
          response.write("<!DOCTYPE \"html\">");
          response.write("<html>");
          response.write("<head>");
          response.write("<title>Hello World Page</title>");
          response.write("</head>");
          response.write("<body>");
          response.write("Hello from " + peerName + ", my id is: " + peerIdentifier);
          response.write("</body>");
          response.write("</html>");
          response.end();

  console.log("response sent");
});
var closeServerHandle = 0;
server.on("listening", function () {closeServerHandle = server});


// Starts peer communications.
function startPeerCommunications(peerIdentifier, peerName) {
    var result;
    var serverport = getFreePort();

    cordova('StartPeerCommunications').callNative(peerIdentifier, peerName,serverport, function (value) {
      result = Boolean(value);
      console.log("StartPeerCommunications returned : " + result);
      if(result){
         console.log(" server listens port :" + serverport);
        //start HTTP server for incoming queries
         closeServerHandle = 0;
         server.listen(serverport);
      }
    });
    return result;
  };

// Connect to the device.
function ConnectToDevice(address) {
    cordova('ConnectToDevice').callNative(address,function(){
          console.log("ConnectToDevice called");
    });
};

// Connect to the device.
function DisconnectPeer(address) {
    cordova('DisconnectPeer').callNative(address,function(){
        console.log("DisconnectPeer callback with " + arguments.length + " arguments");
    });
};

// Stops peer communications.
 function stopPeerCommunications(peerIdentifier, peerName) {
    cordova('StopPeerCommunications').callNative(function () {});

    if(closeServerHandle != 0){
        closeServerHandle.close();
        closeServerHandle = 0;
    }
  };


// inform connection status.
function peerConnectionStateChanged(peerIdentifier, state) {

    console.log("peerConnectionStateChanged " + peerIdentifier + " to  state "   + state);
    if(isFunction(peerConnectionStatusCallback)){
        peerConnectionStatusCallback(peerIdentifier, state);
    }else{
        console.log("peerConnectionStatusCallback not set !!!!");
    }
  };




/*
Registred native functions for conenctivity & peers change events
*/

// Register peerGotConnection callback.
cordova('peerGotConnection').registerToNative(function (peerId,port) {
    logInCordova('peerAvailabilityChanged called with port : ' + port);

    //inform the UI of the connectivity change
    peerConnectionStateChanged(peerId,"peerGotConnection");

});


// Register peerConnected callback.
  cordova('peerConnected').registerToNative(function (peerId,port) {
        logInCordova('peerAvailabilityChanged called with port:' + port);
        httpRequestport = port;
        peerConnectionStateChanged(peerId,"Connected");

  });

  // Register peerNotConnected callback.
  cordova('peerNotConnected').registerToNative(function (peerId) {
        logInCordova('peerAvailabilityChanged called');

        peerConnectionStateChanged(peerId,"Disconnected");
  });

  // Register peerConnecting callback.
  cordova('peerConnecting').registerToNative(function (peerId) {
        logInCordova('peerAvailabilityChanged called');

        peerConnectionStateChanged(peerId,"Connecting");
  });

  // Register peerAvailabilityChanged callback.
  cordova('peerAvailabilityChanged').registerToNative(function (args) {
    logInCordova('peerAvailabilityChanged called');
    var peers = args[0];

    console.log("peerChanged " + peers);
    if(isFunction(peerChangedCallback)){
        peerChangedCallback(args);
    }else{
        console.log("peerChangedCallback not set !!!!");
    }
  });


/*
other Registred native functions
*/

cordova('networkChanged').registerToNative(function (args) {
    logInCordova('networkChanged called');
    var network = args[0];
    logInCordova(JSON.stringify(network));

    if (network.isReachable) {
      logInCordova('****** NETWORK REACHABLE!!!');
    }

  });

var isInForeground = false;

cordova('onLifeCycleEvent').registerToNative(function(message){
        console.log("LifeCycleEvent :" + message.lifecycleevent);

        if (message.lifecycleevent.localeCompare("onActivityCreated") == 0) {
            console.log("Activity was created");
            isInForeground = true;
        } else if (message.lifecycleevent.localeCompare("onActivityStarted") == 0) {
            console.log("Activity was started");
            isInForeground = true;
        } else if (message.lifecycleevent.localeCompare("onActivityResumed") == 0) {
            console.log("Activity was resumed");
            isInForeground = true;
        } else if (message.lifecycleevent.localeCompare("onActivityPaused") == 0) {
            console.log("Activity was paused");
            isInForeground = false;
        } else if (message.lifecycleevent.localeCompare("onActivityStopped") == 0) {
            console.log("Activity was stopped");
            isInForeground = false;
        } else if (message.lifecycleevent.localeCompare("onActivitySaveInstanceState") == 0) {
            console.log("Activity was save on instance event");
        } else if (message.lifecycleevent.localeCompare("onActivityDestroyed") == 0) {
            console.log("Activity was destroyed");
            isInForeground = false;
        } else {
            console.log("unknown LifeCycleEvent received !!!");
        }

        console.log("App is in foregound " + isInForeground);
});


  // Log that the app.js file was loaded.
  logInCordova('ThaliMobile app.js loaded');


})();