var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res)
{
  res.send('Nothing here. This is just a tiny backend :)');
});

http.listen(88, function()
{
  console.log('listening on *:88');
});

var clients = [];

var Client = function(socket)
{
  this.socket = socket;
  this.id = this.socket.id;
  this.authenticated = false;

  clients.push(this);

  this.remove = function()
  {
    var i = clients.indexOf(this);
    clients.splice(i, 1);
  };

  socket.clientObj = this;
}

function notifyConnect(client)
{
  for (var i = 0; i < clients.length; i++)
  {
    if (clients[i] != client)
    {
      clients[i].socket.emit("user_connect", client.name);
    }
  }
}

function notifyDisconnect(client)
{
  for (var i = 0; i < clients.length; i++)
  {
    if (clients[i] != client)
    {
      clients[i].socket.emit("user_disconnect", client.name);
    }
  }
}

io.on('connection', function(socket)
{
  var client = new Client(socket);

  console.log('User connected: ' + client.id);

  socket.on('disconnect', function()
  {
    console.log('User disconnected: ' + client.id + ' (' + client.name + ')');

    if (client.authenticated)
    {
      notifyDisconnect(client);
    }

    client.remove();
  });

  socket.on('authenticate', function(data)
  {
    console.log('User authenticated: ' + client.id + " as " + data);
    client.name = data;
    client.authenticated = true;

    notifyConnect(client);
  });
});
