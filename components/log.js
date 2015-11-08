(function()
{
  "use strict";
  var clc = require('cli-color');

  console.logNative = console.log;
  console.warnNative = console.warn;
  console.infoNative = console.info;
  console.errorNative = console.error;

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
    console.logNative(logTimestamp() + message);
  }

  console.warn = function(message)
  {
    console.warnNative(clc.yellowBright(logTimestamp() + message));
  }

  console.info = function(message)
  {
    console.infoNative(clc.cyanBright(logTimestamp() + message));
  }

  console.error = function(message)
  {
    console.errorNative(clc.redBright(logTimestamp() + message));
  }
})();
