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
  this.name = this.socket.id;
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
  for(var i = 0; i< clients.length; i++)
  {
    if(clients[i] != client)
    {
      clients[i].socket.emit("user_connect", client.name);
    }
  }
}

function notifyDisconnect(client)
{
  for(var i = 0; i< clients.length; i++)
  {
    if(clients[i] != client)
    {
      clients[i].socket.emit("user_disconnect", client.name);
    }
  }
}

io.on('connection', function(socket)
{
  console.log('User connected: ' + socket.conn.remoteAddress);
  var client = new Client(socket);
  notifyConnect(client);

  socket.on('disconnect', function()
  {
    notifyDisconnect(client);
    client.remove();
  });
});
