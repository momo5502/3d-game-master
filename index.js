var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Load components
require('require-dir')("components");

console.info("3D-Game-Master starting...");

Webserver(app, http, 88);

// Pretty bad way to generate states, but
function generateStates(client)
{
  var states = [];
  for (var i = 0; i < clients.length; i++)
  {
    if (clients[i] != client && clients[i].authenticated)
    {
      var state = {};
      state.matrix = clients[i].matrix;
      state.id = clients[i].id;
      state.name = clients[i].name;
      states.push(state);
    }
  }

  return states;
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
      clients.broadcast("user_disconnect",
      {
        name: client.name,
        id: client.id
      }, client);
    }

    client.remove();
  });

  socket.on('chatmessage', function(data)
  {
    if (!client.authenticated) return;

    console.info(client.name + ': ' + data);

    clients.broadcast("chatmessage",
    {
      name: client.name,
      id: client.id,
      message: data
    }, client);
  });

  socket.on('playerstate', function(data)
  {
    if (!client.authenticated) return;
    client.matrix = data;
  });

  socket.on('authenticate', function(data)
  {
    if (client.authenticated) return;

    console.log('User authenticated: ' + client.id + " as " + data);
    client.name = data;
    client.authenticated = true;

    clients.broadcast("user_connect",
    {
      name: client.name,
      id: client.id
    }, client);
  });
});

setInterval(function()
{
  clients.broadcast("playerstates", generateStates);
}, 1000 / 60);
