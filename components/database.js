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
    subdir: "db/",
    extension: ".db",
    index: "db.json"
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
    console.logNative(dbObj);
  };

  ENGINE.Database.store = function()
  {
    if (!fs.existsSync(ENGINE.Database.path))
    {
      fs.mkdirSync(ENGINE.Database.path);
    }

    // Store databases
    var keys = Object.keys(dbObj);
    keys.forEach(function(key)
    {
      storeDatabase(key, dbObj[key]);
    });

    // Store index
    fs.writeFileSync(ENGINE.Database.path + ENGINE.Database.index, JSON.stringify(keys));

    ENGINE.Database._dirty = false;
  };

  ENGINE.Database.markDirty = function()
  {
    ENGINE.Database._dirty = true;
  }

  ENGINE.Database.load = function()
  {
    if (fs.existsSync(ENGINE.Database.path + ENGINE.Database.index))
    {
      var data = fs.readFileSync(ENGINE.Database.path + ENGINE.Database.index);
      data = JSON.parse(data);
      data.forEach(loadDatabase);
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

  function loadDatabase(name)
  {
    var file = ENGINE.Database.path + ENGINE.Database.subdir + name + ENGINE.Database.extension;
    if (fs.existsSync(file))
    {
      var data = fs.readFileSync(file);
      var string = zlib.inflateSync(data);
      dbObj[name] = JSON.parse(string);
    }
    else
    {
      dbObj[name] = {};
    }
  }

  function storeDatabase(name, data)
  {
    var file = ENGINE.Database.path + ENGINE.Database.subdir + name + ENGINE.Database.extension;

    // Create paths
    if (!fs.existsSync(ENGINE.Database.path)) fs.mkdirSync(ENGINE.Database.path);
    if (!fs.existsSync(ENGINE.Database.path + ENGINE.Database.subdir)) fs.mkdirSync(ENGINE.Database.path + ENGINE.Database.subdir);

    data = JSON.stringify(data);
    data = zlib.deflateSync(data);
    fs.writeFileSync(file, data);
  }

  function storageWorker()
  {
    if (ENGINE.Database._dirty)
    {
      ENGINE.Database.store();
    }
  }
})();
