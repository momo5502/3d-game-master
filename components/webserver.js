(function()
{
  "use strict";

  root.Webserver = function(app, http, port)
  {
    app.get('/', function(req, res)
    {
      res.send('Nothing here!');
    });

    http.listen(port, function()
    {
      console.log('Listening on port ' + port);
    });
  };
})();
