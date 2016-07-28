var fs = require("fs");
var zlib = require("zlib");
var mkdirp = require('mkdirp');

(function()
{
  "use strict";
  global.ENGINE = global.ENGINE ||
  {};

  var dbObj = {}; // initialize as object to be able to access/store JSON as associative array

  ENGINE.database = {
    path: "data/",
    subdir: "db/",
    extension: ".db",
    index: "db.json"
  };

  var worker = undefined;
  var initialized = false;
  ENGINE.database._dirty = [];

  ENGINE.database.init = function()
  {
    if (initialized) return;
    initialized = true;

    ENGINE.OnExit(ENGINE.database.shutdown);
    ENGINE.database.load();

    worker = setInterval(storageWorker, 10000);

    console.log("Database initialized");
  };

  ENGINE.database.store = function()
  {
    if (!fs.existsSync(ENGINE.database.path))
    {
      mkdirp.sync(ENGINE.database.path);
    }

    // Store databases
    ENGINE.database._dirty.forEach(function(key)
    {
      storeDatabase(key, dbObj[key]);
    });

    ENGINE.database._dirty = [];

    // Store index
    fs.writeFileSync(ENGINE.database.path + ENGINE.database.index, JSON.stringify(Object.keys(dbObj)));
  };

  ENGINE.database.markDirty = function(db)
  {
    if (db == undefined)
    {
      ENGINE.database._dirty = Object.keys(dbObj);
    }
    else
    {
      db = db.toLowerCase();

      if (ENGINE.database._dirty.indexOf(db) == -1)
      {
        ENGINE.database._dirty.push(db);
      }
    }
  }

  ENGINE.database.load = function()
  {
    if (fs.existsSync(ENGINE.database.path + ENGINE.database.index))
    {
      var data = fs.readFileSync(ENGINE.database.path + ENGINE.database.index);
      data = JSON.parse(data);
      data.forEach(loadDatabase);
    }
    else
    {
      ENGINE.database.store();
    }
  };

  ENGINE.database.shutdown = function()
  {
    if (initialized)
    {
      if (worker !== undefined) clearInterval(worker);
      ENGINE.database.store();
    }
  };

  // Data manipulation
  ENGINE.database.set = function(db, key, value)
  {
    db = db.toLowerCase();

    if (value === undefined)
    {
      dbObj[db] = key;
    }
    else
    {
      if (dbObj[db] === undefined)
      {
        dbObj[db] = {};
      }

      dbObj[db][key] = value;
    }
    ENGINE.database.markDirty(db);
  };

  ENGINE.database.get = function(db, key)
  {
    db = db.toLowerCase();

    if (key === undefined) return dbObj[db];
    if (dbObj[db] === undefined) return undefined;
    return dbObj[db][key];
  };

  function loadDatabase(name)
  {
    name = name.toLowerCase();
    var file = ENGINE.database.path + ENGINE.database.subdir + name + ENGINE.database.extension;
    if (fs.existsSync(file))
    {
      var data = fs.readFileSync(file);
      var string = zlib.inflateSync(data);
      dbObj[name] = JSON.parse(string);
    }
  }

  function storeDatabase(name, data)
  {
    name = name.toLowerCase();
    var file = ENGINE.database.path + ENGINE.database.subdir + name + ENGINE.database.extension;

    // Create paths
    if (!fs.existsSync(ENGINE.database.path + ENGINE.database.subdir)) mkdirp.sync(ENGINE.database.path + ENGINE.database.subdir);

    data = JSON.stringify(data);
    data = zlib.deflateSync(data);
    fs.writeFileSync(file, data);
  }

  function storageWorker()
  {
    ENGINE.database.markDirty();
    ENGINE.database.store();
  }
})();
