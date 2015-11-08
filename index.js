// Load components
require('require-dir')("components");

console.info("3D-Game-Master starting...");

// Prepare and load database
ENGINE.Database.init();

// Initialize webserver and socket
var socket = new ENGINE.Socket();
var webserver = new ENGINE.Webserver(88);
webserver.init(function()
{
  socket.bind(this);
});

// Pretty bad way to generate states, but whatever
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

socket.on('connection', function(socket)
{
  var client = new ENGINE.Client(socket);

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

    ENGINE.Database.set("user", client.name, client.toJSON());
  });

  socket.on('authenticate', function(data)
  {
    if (client.authenticated) return;

    console.log('User authenticated: ' + client.id + " as " + data);
    client.name = data;
    client.authenticated = true;

    ENGINE.Database.set("user", client.name, client.toJSON());

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
