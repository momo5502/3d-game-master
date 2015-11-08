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

    this.app.get('/chat', function(req, res)
    {
      var response = "";
      var chatlog = ENGINE.Database.get("chat");

      Object.keys(chatlog).forEach(function(ts)
      {
        var user = chatlog[ts].name;
        var data = chatlog[ts].message;
        response += user + ": " + data + "<br>\n";
      });

      res.send(response);
    });

    this.http.listen(this.port, function()
    {
      console.log('Webserver listening on port ' + self.port);
      if (callback !== undefined) callback.call(self);
    });
  };

  root.ENGINE.Webserver = Webserver;
})();
