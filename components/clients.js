(function()
{
  "use strict";

  root.clients = new Array();

  root.Client = function(socket)
  {
    this.socket = socket;
    this.id = this.socket.id;
    this.authenticated = false;
    this.matrix = null;

    root.clients.push(this);

    this.remove = function()
    {
      var i = clients.indexOf(this);
      clients.splice(i, 1);
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
})();
