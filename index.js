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
  for (var i = 0; i < clients.length && client.authenticated; i++)
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

    ENGINE.Database.set("chat", Date.now(),
    {
      name: client.name,
      message: data
    });

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

    //ENGINE.Database.set("user", client.name, client.toJSON());
  });

  socket.on('authenticate', function(data)
  {
    if (client.authenticated) return;

    console.log('User requests authentication: ' + client.id + " as " + data);
    client.name = data;
    //client.authenticated = true;

    var data = ENGINE.Database.get("user", client.name);

    // Generate authentication/registration token
    client.token = ENGINE.random.string64(0x40);

    if (data == undefined)
    {
      socket.emit('authenticate_response',
      {
        success: false,
        token: client.token,
      });
    }
    else
    {
      if (data.privateKey === undefined)
      {
        console.error("User " + client.name + " authentication failed, no private key stored!");
      }

      socket.emit('authenticate_response',
      {
        success: true,
        token: client.token,
        key: data.privateKey
      });
    }
  });


  socket.on('authentication', function(data)
  {
    if (client.authenticated) return;

    var c_data = ENGINE.Database.get("user", client.name);

    if (c_data !== undefined)
    {
      var key = new ENGINE.crypto.rsa.key();
      key.setPublicPEM(c_data.publicKey);

      if (!ENGINE.crypto.rsa.verify(key, client.token, data.signature))
      {
        console.warn("Authentication failed, signature invalid (" + client.name + ")!");
        return;
      }

      console.success("Signature valid, finalizing authentication (" + client.name + ")!");
      client.fromJSON(data);
      client.authenticated = true;

      clients.broadcast("user_connect",
      {
        name: client.name,
        id: client.id
      }, client);
    }
  });

  socket.on('registration', function(data)
  {
    if (client.authenticated) return;

    if (ENGINE.Database.get("user", client.name) !== undefined)
    {
      console.warn("Registration for user " + client.name + " failed, user already exists!");
      return;
    }

    var key = new ENGINE.crypto.rsa.key();
    key.setPublicPEM(data.key);

    if (!ENGINE.crypto.rsa.verify(key, client.token, data.signature))
    {
      console.warn("Registration failed, signature invalid (" + client.name + ")!");
      return;
    }

    console.success("Signature valid, finalizing registration (" + client.name + ")!");

    client.privateKey = data.userKey;
    client.publicKey = data.key;
    client.authenticated = true;

    clients.broadcast("user_connect",
    {
      name: client.name,
      id: client.id
    }, client);

    ENGINE.Database.set("user", client.name, client.toJSON());
  });
});

setInterval(function()
{
  clients.broadcast("playerstates", generateStates);
}, 1000 / 60);
