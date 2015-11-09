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
    // TODO: Store in database
  };

  ENGINE.sessions.load = function()
  {
    // TODO: Load from database
  };

  ENGINE.sessions.remove = function(session)
  {
    // TODO: Delete form database
  };

  ENGINE.session = function(client)
  {
    if (client.hasSession())
    {
      client.session.remove();
    }

    client.session = this;

    this.token = ENGINE.random.string64(0x40);
    this.client = client.name; // TODO: Don't use the name here
    this.issueDate = Date.now();
    this.expires = (1000 * 60 * 60 * 24 * 30); // Session valid for a month
    this.activated = false;

    this.activate = function()
    {
      this.activated = true;

      // TODO: Set activation state in database
    };

    this.remove = function()
    {
      ENGINE.sessions.remove(this);
    };

    this.setDuration = function(duration)
    {
      this.expires = duration;
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
        client: this.client.name,
        issueDate: this.issueDate,
        expires: this.expires,
        activated: this.activated
      };
    };

    this.fromJSON = function(object)
    {
      this.token = object.token;
      this.client = object.client.name; // TODO: Don't use the name
      this.issueDate = object.issueDate;
      this.expires = object.expires;
      this.activated = object.activated;
    };

    ENGINE.sessions.push(this);
  };
})();
