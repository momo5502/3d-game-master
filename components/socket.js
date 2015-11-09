var io = require('socket.io');

(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  function Socket()
  {
    this.io = undefined;
    this.events = [];
  };

  Socket.prototype.bind = function(webserver)
  {
    this.io = io(webserver.http);

    for (var event in this.events)
    {
      this.io.on(event, this.events[event]);
    }

    webserver.socket = this;
    console.log("Socket bound to server on port " + webserver.port);
  }

  Socket.prototype.on = function(event, callback)
  {
    this.events[event] = callback;

    if (this.isBound())
    {
      this.io.on(event, callback);
    }
  }

  Socket.prototype.isBound = function()
  {
    return this.io !== undefined;
  }

  ENGINE.socket = Socket;
})();
