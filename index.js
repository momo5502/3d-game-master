// Load components
require('require-dir')("components");

console.info("3D-Game-Master starting...");

// Prepare and load database
ENGINE.database.init();

ENGINE.sessions.load();

// Initialize webserver and socket
var socket = new ENGINE.socket();
var webserver = new ENGINE.webserver(88);
webserver.init(function()
{
  socket.bind(this);
});

// Pretty bad way to generate states, but whatever
function generateStates(client)
{
  var states = [];
  for (var i = 0; i < ENGINE.clients.length && client.authenticated; i++)
  {
    if (ENGINE.clients[i] != client && ENGINE.clients[i].authenticated)
    {
      var state = {};
      state.matrix = ENGINE.clients[i].matrix;
      state.id = ENGINE.clients[i].id;
      state.name = ENGINE.clients[i].name;
      states.push(state);
    }
  }

  return states;
}

socket.on('connection', function(socket)
{
  var client = new ENGINE.client(socket);

  console.log('User connected: ' + client.id);

  socket.on('disconnect', function()
  {
    console.log('User disconnected: ' + client.id + ' (' + client.name + ')');

    if (client.authenticated)
    {
      ENGINE.clients.broadcast("user_disconnect",
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

    ENGINE.database.set("chat", Date.now(),
    {
      name: client.name,
      message: data
    });

    ENGINE.clients.broadcast("chatmessage",
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

    //ENGINE.database.set("user", client.name, client.toJSON());
  });

  socket.on('authenticate', function(_data)
  {
    if (client.authenticated) return;

    console.log('User requests authentication: ' + client.id + " as " + _data.user);
    client.name = _data.user;
    //client.authenticated = true;

    var data = ENGINE.database.get("user", client.name);

    if (parseSession(client, data, _data))
    {
      return;
    }

    console.info("Performing new authentication for user: " + client.name + "!");

    // Generate authentication/registration token
    client.token = ENGINE.random.string64(0x40);

    if (data == undefined)
    {
      client.salt = ENGINE.random.string64(0x20);

      socket.emit('authenticate_response',
      {
        success: false,
        token: client.token,
        salt: client.salt,
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
        key: data.privateKey,
        salt: data.salt,
      });
    }
  });

  socket.on('authentication', function(data)
  {
    if (client.authenticated) return;

    var c_data = ENGINE.database.get("user", client.name);

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

      // Create session
      var session = new ENGINE.session(client);
      session.activate();

      socket.emit('authenticate_session',
      {
        success: true,
        session: session.token
      });

      ENGINE.clients.broadcast("user_connect",
      {
        name: client.name,
        id: client.id
      }, client);
    }
  });

  socket.on('registration', function(data)
  {
    if (client.authenticated) return;

    if (ENGINE.database.get("user", client.name) !== undefined)
    {
      console.warn("Registration for user " + client.name + " failed, user already exists!");
      return;
    }

    console.info("Registering user: " + client.name + "!");

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

    // Create session
    var session = new ENGINE.session(client);
    session.activate();

    socket.emit('authenticate_session',
    {
      success: true,
      session: session.token
    });

    ENGINE.clients.broadcast("user_connect",
    {
      name: client.name,
      id: client.id
    }, client);

    ENGINE.database.set("user", client.name, client.toJSON());
  });
});

function parseSession(client, data, _data)
{
  if (_data.session === undefined)
  {
    console.warn("No session token provided, reauthenticating...");
    return false;
  }

  var session = ENGINE.sessions.getByToken(_data.session);

  if (session === undefined)
  {
    console.warn("No session found for given token (" + client.name + ")!");
    return false;
  }

  if (!session.isValid())
  {
    console.warn("Session for given token was invalid (" + client.name + ")!");
  }

  if (session.client != client.name) // TODO: Check for valid ip as well
  {
    console.warn("Session is not valid for this client (" + client.name + ")!");
  }

  console.success("Authenticated with session (" + client.name + ")!");

  client.authenticated = true;

  client.socket.emit('authenticate_session',
  {
    success: true,
    session: session.token
  });

  ENGINE.clients.broadcast("user_connect",
  {
    name: client.name,
    id: client.id
  }, client);

  return true;
}

setInterval(function()
{
  ENGINE.clients.broadcast("playerstates", generateStates);
}, 1000 / 60);
