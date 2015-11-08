(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  ENGINE.session = function(client)
  {
    if (client.hasSession())
    {
      client.session.remove();
    }

    client.session = this;

    this.token = ENGINE.random.string64(0x40);
    this.client = client;
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
      // TODO: Delete from database
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
        client: this.id,
        issueDate: this.issueDate,
        expires: this.expires,
        activated: this.activated
      };
    };

    this.fromJSON = function(object)
    {
      this.token = object.token;
      this.client = object.id;
      this.issueDate = object.issueDate;
      this.expires = object.expires;
      this.activated = object.activated;
    };
  };
})();
