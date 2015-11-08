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
  ENGINE.Database._dirty = [];

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
    if (!fs.existsSync(ENGINE.Database.path))
    {
      fs.mkdirSync(ENGINE.Database.path);
    }

    // Store databases
    ENGINE.Database._dirty.forEach(function(key)
    {
      storeDatabase(key, dbObj[key]);
    });

    ENGINE.Database._dirty = [];

    // Store index
    fs.writeFileSync(ENGINE.Database.path + ENGINE.Database.index, JSON.stringify(Object.keys(dbObj)));
  };

  ENGINE.Database.markDirty = function(db)
  {
    if (db == undefined)
    {
      ENGINE.Database._dirty = Object.keys(dbObj);
    }
    else
    {
      db = db.toLowerCase();

      if (ENGINE.Database._dirty.indexOf(db) == -1)
      {
        ENGINE.Database._dirty.push(db);
      }
    }
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
  ENGINE.Database.set = function(db, key, value)
  {
    db = db.toLowerCase();
    if (dbObj[db] === undefined)
    {
      dbObj[db] = {};
    }

    dbObj[db][key] = value;
    ENGINE.Database.markDirty(db);
  };

  ENGINE.Database.get = function(db, key)
  {
    db = db.toLowerCase();

    if(key === undefined) return dbObj[db];
    if (dbObj[db] === undefined) return undefined;
    return dbObj[db][key];
  };

  function loadDatabase(name)
  {
    name = name.toLowerCase();
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
    name = name.toLowerCase();
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
    ENGINE.Database.markDirty();
    ENGINE.Database.store();
  }
})();
