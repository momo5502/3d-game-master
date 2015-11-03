(function()
{
  "use strict";
  var clc = require('cli-color');

  var _log = console.log;
  var _warn = console.warn;
  var _info = console.info;
  var _error = console.error;

  function formatTimeNum(number)
  {
    var string = "" + number;

    if (number < 10)
    {
      string = "0" + string;
    }

    return string;
  }

  function logTimestamp()
  {
    var date = new Date();
    var hours = formatTimeNum(date.getHours());
    var minutes = formatTimeNum(date.getMinutes());
    var seconds = formatTimeNum(date.getSeconds());

    return "[" + hours + ":" + minutes + ":" + seconds + "] ";
  }

  console.log = function(message)
  {
    _log(logTimestamp() + message);
  }

  console.warn = function(message)
  {
    _warn(clc.yellowBright(logTimestamp() + message));
  }

  console.info = function(message)
  {
    _info(clc.cyanBright(logTimestamp() + message));
  }

  console.error = function(message)
  {
    _error(clc.redBright(logTimestamp() + message));
  }
})();
