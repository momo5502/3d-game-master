(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  root.clients = new Array();

  function Client(socket)
  {
    this.socket = socket;
    this.id = this.socket.id;
    this.authenticated = false;
    this.matrix = null;
    this.session = null;

    root.clients.push(this);

    this.remove = function()
    {
      var i = clients.indexOf(this);
      clients.splice(i, 1);
    };

    this.hasSession = function()
    {
      return (this.session !== undefined);
    };

    this.toJSON = function()
    {
      return {
        name: this.name,
        //id: this.id,
        //matrix: this.matrix,
        privateKey: this.privateKey,
        publicKey: this.publicKey,
      };
    };

    this.fromJSON = function(object)
    {
      //this.matrix = object.matrix;
      this.privateKey = object.privateKey;
      this.publicKey = object.publicKey;
    };

    socket.clientObj = this;
  }

  clients.broadcast = function(event, data, exceptions)
  {
    if (exceptions === undefined)
    {
      exceptions = [];
    }
    else if (typeof exceptions === 'object')
    {
      exceptions = [exceptions];
    }

    for (var i = 0; i < clients.length; i++)
    {
      var _data = data;
      if (exceptions.indexOf(clients[i]) == -1)
      {
        if (typeof data === 'function')
        {
          _data = data(clients[i]);
        }

        clients[i].socket.emit(event, _data);
      }
    }
  }

  root.ENGINE.Client = Client;
})();
