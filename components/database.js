var fs = require("fs");
var zlib = require("zlib");

(function()
{
  "use strict";
  root.ENGINE = root.ENGINE ||
  {};

  var dbObj = {}; // initialize as object to be able to access/store JSON as associative array

  ENGINE.Database = {
    path: "data/",
    file: "db.bin"
  };

  var worker = undefined;
  var initialized = false;
  ENGINE.Database._dirty = true;

  ENGINE.Database.init = function()
  {
    if (initialized) return;
    initialized = true;

    ENGINE.OnExit(ENGINE.Database.shutdown);
    ENGINE.Database.load();

    worker = setInterval(storageWorker, 10000);

    console.log("Database initialized");
  };

  ENGINE.Database.store = function()
  {
    var string = JSON.stringify(dbObj);
    var data = zlib.deflateSync(string);

    if (!fs.existsSync(ENGINE.Database.path))
    {
      fs.mkdirSync(ENGINE.Database.path);
    }

    fs.writeFileSync(ENGINE.Database.path + ENGINE.Database.file, data);
    ENGINE.Database._dirty = false;
  };

  ENGINE.Database.markDirty = function()
  {
    ENGINE.Database._dirty = true;
  }

  ENGINE.Database.load = function()
  {
    if (fs.existsSync(ENGINE.Database.path + ENGINE.Database.file))
    {
      var data = fs.readFileSync(ENGINE.Database.path + ENGINE.Database.file);
      var string = zlib.inflateSync(data);
      dbObj = JSON.parse(string);
    }
    else
    {
      ENGINE.Database.store();
    }
  };

  ENGINE.Database.shutdown = function()
  {
    if (initialized)
    {
      if (worker !== undefined) clearInterval(worker);
      ENGINE.Database.store();
    }
  };

  // Data manipulation
  ENGINE.Database.set = function(db, table, value)
  {
    if (dbObj[db] === undefined)
    {
      dbObj[db] = {};
    }

    dbObj[db][table] = value;
    ENGINE.Database.markDirty();
  };

  ENGINE.Database.get = function(key)
  {
    return dbObj[key];
  };

  function storageWorker()
  {
    if (ENGINE.Database._dirty)
    {
      ENGINE.Database.store();
    }
  }
})();
