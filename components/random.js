(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  ENGINE.random = {};

  // Basic random integer. Can be deterministic
  ENGINE.random.int = function(mod)
  {
    return (parseInt(Math.random() * (mod * Date.now())) % mod);
  };

  ENGINE.random.string = function(length)
  {
    var string = "";

    for(var i = 0; i < length;i++)
    {
      string += String.fromCharCode(ENGINE.random.int(256));
    }

    return string;
  };

  ENGINE.random.string64 = function(length)
  {
    return (new Buffer(ENGINE.random.string(length))).toString('base64');
  };
})();
