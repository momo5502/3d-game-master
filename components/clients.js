(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  ENGINE.clients = new Array();

  function Client(socket)
  {
    this.socket = socket;
    this.id = this.socket.id;
    this.authenticated = false;
    this.matrix = null;
    this.session = null;

    ENGINE.clients.push(this);

    this.remove = function()
    {
      var i = ENGINE.clients.indexOf(this);
      ENGINE.clients.splice(i, 1);
    };

    this.hasSession = function()
    {
      return (this.session !== undefined && this.session !== null);
    };

    this.hasValidSession = function()
    {
      return (this.hasSession() && this.session.isValid());
    }

    this.toJSON = function()
    {
      return {
        name: this.name,
        //id: this.id,
        //matrix: this.matrix,
        salt: this.salt,
        privateKey: this.privateKey,
        publicKey: this.publicKey,
      };
    };

    this.fromJSON = function(object)
    {
      //this.matrix = object.matrix;
      this.salt = object.salt;
      this.privateKey = object.privateKey;
      this.publicKey = object.publicKey;
    };

    socket.clientObj = this;
  }

  ENGINE.clients.broadcast = function(event, data, exceptions)
  {
    if (exceptions === undefined)
    {
      exceptions = [];
    }
    else if (typeof exceptions === 'object')
    {
      exceptions = [exceptions];
    }

    for (var i = 0; i < ENGINE.clients.length; i++)
    {
      var _data = data;
      if (exceptions.indexOf(ENGINE.clients[i]) == -1)
      {
        if (typeof data === 'function')
        {
          _data = data(ENGINE.clients[i]);
        }

        ENGINE.clients[i].socket.emit(event, _data);
      }
    }
  }

  ENGINE.client = Client;
})();
