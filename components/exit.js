(function()
{
  "use strict";
  global.ENGINE = global.ENGINE ||
  {};

  var callbacks = [];

  ENGINE.OnExit = function(callback)
  {
    callbacks.push(callback);
  };

  function terminate(reason, err)
  {
    callbacks.forEach(function(callback)
    {
      callback(reason);
    });

    if (err)
    {
      console.logNative(err.stack);
    }

    process.exit();
  };

  // catches exits
  process.on('exit', terminate.bind(null, "exit"));

  //catches ctrl+c event
  process.on('SIGINT', terminate.bind(null, "sigint"));

  //catches uncaught exceptions
  process.on('uncaughtException', terminate.bind(null, "exception"));

})();
