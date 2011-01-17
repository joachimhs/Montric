/*globals process*/

var self = this,
    l = {},
    App, Framework, Server;

require('./date');
App = require('./app').App;
Framework = require('./framework').Framework;
l.http = require('http');
l.sys = require('sys');
l.url = require('url');

self.Server = function(options) {
  var key;
  
  this.port = 8000;
  this.hostname = null;
  this.proxyHost = null;
  this.proxyPort = null;
  this.proxyPrefix = '';
  
  this.apps = [];
  this.files = [];
  
  for (key in options) {
    this[key] = options[key];
  }
};

Server = self.Server;

Server.prototype.shouldProxy = function() {
  return this.proxyHost !== null && this.proxyPort !== null;
};

Server.prototype.addApp = function(app) {
  if (!(app instanceof App)) {
    app = new App(app);
  }
  
  app.server = this;
  
  this.apps.push(app);
  return app;
};

Server.prototype.setDirectory = function(path) {
  process.chdir(path);
};

Server.prototype.run = function() {
  
  var that = this;
  
  var serve = function(file, request, response) {
    file.handler.handle(file, request, function(r) {
      var headers = {},
          status = 200;

      if (r.contentType !== undefined) headers['Content-Type'] = r.contentType;
      if (r.lastModified !== undefined) headers['Last-Modified'] = r.lastModified.format('httpDateTime');
      if (r.status !== undefined) status = r.status;

      response.writeHead(status, headers);

      if (r.data !== undefined) response.write(r.data, 'utf8');

      response.end();
    });
  };
  
  var proxy = function(request, response) {
    var body = '';
    
    request.addListener('data', function(chunk) {
      body += chunk;
    });

    request.addListener('end', function() {
      var proxyClient, proxyRequest,
          url = request.url;

      if (that.proxyPrefix.length > 0 && url.indexOf(that.proxyPrefix) < 0) {
        url = that.proxyPrefix + url;
      }

      proxyClient = l.http.createClient(that.proxyPort, that.proxyHost);

      proxyClient.addListener('error', function(err) {
        l.sys.puts('ERROR: "' + err.message + '" for proxy request on ' + that.proxyHost + ':' + that.proxyPort);
        response.writeHead(404);
        response.end();
      });

      request.headers.host = that.proxyHost;
      request.headers['content-length'] = body.length;
      if (that.proxyPort != 80) request.headers.host += ':' + that.proxyPort;
      
      proxyRequest = proxyClient.request(request.method, url, request.headers);

      if (body.length > 0) {
        proxyRequest.write(body);
      }

      proxyRequest.addListener('response', function(proxyResponse) {
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.addListener('data', function(chunk) {
          response.write(chunk);
        });
        proxyResponse.addListener('end', function() {
          response.end();
        });
      });

      proxyRequest.end();
    });
  };
  
  l.http.createServer(function (request, response) {
    var path = l.url.parse(request.url).pathname.slice(1),
        file = that.files[path];
        
    if (file === undefined) {
      if (that.shouldProxy()) {
        l.sys.puts('Proxying ' + request.url);
        proxy(request, response);
      } else {
        response.writeHead(404);
        response.end();
      }
    } else {
      serve(file, request, response);
    }
  }).listen(that.port, that.hostname, function() {
    var url = l.url.format({
      protocol: 'http',
      hostname: that.hostname ? that.hostname : 'localhost',
      port: that.port
    });
    l.sys.puts('Server started on ' + url);
  });
  
};
