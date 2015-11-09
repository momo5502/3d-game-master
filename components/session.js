(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  ENGINE.sessions = new Array();

  ENGINE.sessions.getByToken = function(token)
  {
    var session = undefined;

    this.forEach(function(object)
    {
      if (object.token == token)
      {
        session = object;
      }
    });

    return session;
  };

  ENGINE.sessions.store = function()
  {
    ENGINE.database.set("session", this);
  };

  ENGINE.sessions.load = function()
  {
    var sessions = ENGINE.database.get("session");

    if (sessions !== undefined)
    {
      sessions.forEach(function(session)
      {
        new ENGINE.session().fromJSON(session);
      });
    }
  };

  ENGINE.sessions.remove = function(session)
  {
    var pos = this.indexOf(session);
    if (pos != -1)
    {
      this.splice(pos, 1);
    }

    session.client.session = undefined;

    ENGINE.sessions.store();
  };

  ENGINE.session = function(client)
  {
    if (client !== undefined)
    {
      if (client.hasSession())
      {
        client.session.remove();
      }

      client.session = this;
      this.client = client.name; // TODO: Don't use the name here
    }

    this.token = ENGINE.random.string64(0x40);
    this.issueDate = Date.now();
    this.expires = (1000 * 60 * 60 * 24 * 30); // Session valid for a month
    this.activated = false;

    this.activate = function()
    {
      this.activated = true;

      ENGINE.sessions.store();
    };

    this.remove = function()
    {
      ENGINE.sessions.remove(this);
    };

    this.setDuration = function(duration)
    {
      this.expires = duration;
      ENGINE.sessions.store();
    };

    this.hasExpired = function()
    {
      return (Date.now() > (this.issueDate + this.expires));
    };

    this.isActivated = function()
    {
      return this.activated;
    };

    this.isValid = function()
    {
      return (this.isActivated() && !this.hasExpired());
    };

    this.toJSON = function()
    {
      return {
        token: this.token,
        client: this.client,
        issueDate: this.issueDate,
        expires: this.expires,
        activated: this.activated
      };
    };

    this.fromJSON = function(object)
    {
      this.token = object.token;
      this.client = object.client; // TODO: Don't use the name
      this.issueDate = object.issueDate;
      this.expires = object.expires;
      this.activated = object.activated;

      ENGINE.sessions.store();
    };

    ENGINE.sessions.push(this);
    ENGINE.sessions.store();
  };
})();
