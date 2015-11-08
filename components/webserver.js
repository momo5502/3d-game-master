var express = require('express');
var http = require('http');

(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  function Webserver(port)
  {
    this.port = port;

    this.app = express();
    this.http = http.Server(this.app);
  }

  Webserver.prototype.init = function(callback)
  {
    var self = this;

    this.app.get('/', function(req, res)
    {
      res.send('Nothing here!');
    });

    this.http.listen(this.port, function()
    {
      console.log('Webserver listening on port ' + self.port);
      if (callback !== undefined) callback.call(self);
    });
  };

  root.ENGINE.Webserver = Webserver;
})();
