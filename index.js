var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = [];

app.get('/', function(req, res)
{
  var playerList = "<br><br>Players:<br>";

  for (var i = 0; i < clients.length; i++)
  {
    playerList += "<br>" + clients[i].id + " " + clients[i].name;
  }

  res.send('Nothing here. This is just a tiny backend :)' + playerList);
});

http.listen(88, function()
{
  console.log('listening on *:88');
});

var Client = function(socket)
{
  this.socket = socket;
  this.id = this.socket.id;
  this.authenticated = false;
  this.origin = {
    x: 0,
    y: 0,
    z: 0
  };
  this.angles = {
    x: 0,
    y: 0,
    z: 0
  };

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
      clients[i].socket.emit("user_connect",
      {
        name: client.name,
        id: client.id
      });
    }
  }
}

function notifyDisconnect(client)
{
  for (var i = 0; i < clients.length; i++)
  {
    if (clients[i] != client)
    {
      clients[i].socket.emit("user_disconnect",
      {
        name: client.name,
        id: client.id
      });
    }
  }
}

function notifyChat(client, data)
{
  for (var i = 0; i < clients.length; i++)
  {
    if (clients[i] != client)
    {
      clients[i].socket.emit("chatmessage",
      {
        name: client.name,
        id: client.id,
        message: data
      });
    }
  }
}

// Pretty bad way to generate states, but
function generateStates(client)
{
  var states = [];
  for(var i = 0; i < clients.length; i++)
  {
    if(clients[i] != client)
    {
      var state = {};
      state.origin = clients[i].origin;
      state.angles = clients[i].angles;
      state.id = clients[i].id;
      states.push(state);
    }
  }

  return states;
}

function distributeStates()
{
  for(var i = 0; i < clients.length; i++)
  {
    var states = generateStates(clients[i]);
    clients[i].socket.emit("playerstates", states);
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

  socket.on('chatmessage', function(data)
  {
    if (!client.authenticated) return;

    console.log(client.name + ': ' + data);
    notifyChat(client, data);
  });

  socket.on('playerstate', function(data)
  {
    if (!client.authenticated) return;
    client.origin = data.origin;
    client.angles = data.angles;

    distributeStates();
  });

  socket.on('authenticate', function(data)
  {
    if (client.authenticated) return;

    console.log('User authenticated: ' + client.id + " as " + data);
    client.name = data;
    client.authenticated = true;

    notifyConnect(client);
  });
});
