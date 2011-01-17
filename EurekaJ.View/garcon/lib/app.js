var self = this,
    l = {},
    App, File, Framework, sharedHandlers;

File = require('./file').File;
Framework = require('./framework').Framework;
sharedHandlers = require('./handlers').sharedHandlers;
l.fs = require('fs');
l.path = require('path');
l.sys = require('sys');

self.App = function(options) {
  var key;
    
  this.name = null;
  this.server = null;
  this.buildVersion = new Date().getTime();
  this.buildLanguage = 'english';
  this.combineStylesheets = false;
  this.combineScripts = false;
  this.minifyScripts = false;
  this.minifyStylesheets = false;
  this.htmlHead = null;
  this.htmlStylesheets = null;
  this.htmlBody = null;
  this.htmlScripts = null;
  this.urlPrefix = '';
  this.theme = 'sc-theme';
  this.savePath = 'build';
  
  for (key in options) {
    this[key] = options[key];
  }
};

App = self.App;

App.prototype.nameFor = Framework.prototype.nameFor;
App.prototype.urlFor = Framework.prototype.urlFor;

App.prototype.addFramework = function(framework) {
  if (this.frameworks === undefined) {
    this.frameworks = [];
  }
  
  if (!(framework instanceof Framework)) {
    framework = new Framework(framework);
  }
  
  framework.server = this.server;
  
  if (framework.buildVersion === null) {
    framework.buildVersion = this.buildVersion;
  }
  
  ['combineScripts', 'combineStylesheets', 'minifyScripts', 'minifyStylesheets'].forEach(function(key) {
    if (this[key] === true) {
      framework[key] = true;
    }
  }, this);
  
  this.frameworks.push(framework);
  
  return framework;
};

App.prototype.addFrameworks = function() {
  var args = Array.prototype.slice.call(arguments);
  
  if (args[0] instanceof Array) {
    args = args[0];
  }
  
  args.forEach(function(framework) {
    this.addFramework(framework);
  }, this);  
};

App.prototype.addSproutcore = function(options) {
  if (options === undefined) options = {};
  options.server = this.server;
  this.addFrameworks(Framework.sproutcoreFrameworks(options));
};

App.prototype.rootContent = function(htmlStylesheets, htmlScripts) {
  var that = this;
  
  return function(callback) {
    var html = [],
        file, lang;

    lang = that.buildLanguage.toShortLanguage();
    if (!lang) {
      l.sys.puts('WARNING: short language code for "' + that.buildLanguage + '" is undefined.');
      lang = '';
    } else {
      lang = ' lang="' + lang + '"';
    }    

    html.push(
      '<!DOCTYPE html>',
      '<html' + lang + '>',
      '<head>',
        '<meta charset="utf-8">',
        '<meta http-equiv="X-UA-Compatible" content="chrome=1">'
    );

    if (that.htmlHead !== null) html.push(that.htmlHead);
    if (that.htmlStylesheets !== null) html.push(that.htmlStylesheets);

    if (htmlStylesheets === undefined) {
      that.frameworks.forEach(function(framework) {
        framework.orderedStylesheets.forEach(function(stylesheet) {
          if (stylesheet.framework === framework) {
            html.push('<link href="' + that.urlPrefix + stylesheet.url() + '" rel="stylesheet" type="text/css">');
          }
        });
      });
    } else {
      html.push(htmlStylesheets);
    }

    html.push(
      '</head>',
      '<body class="' + that.theme + ' focus">'
    );

    if (that.htmlBody !== null) html.push(that.htmlBody);
    
    html.push('<script type="text/javascript">String.preferredLanguage = "' + that.buildLanguage + '";</script>');
    
    if (that.htmlScripts !== null) html.push(that.htmlScripts);
    
    if (htmlScripts === undefined) {
      that.frameworks.forEach(function(framework) {
        framework.orderedScripts.forEach(function(script) {
          html.push('<script type="text/javascript" src="' + that.urlPrefix + script.url() + '"></script>');
        });
      });
    } else {
      html.push(htmlScripts);
    }

    html.push(
    	  '</body>',
      '</html>'
    );

    html = html.join('\n');

    callback(null, html);
  };
};

App.prototype.buildRoot = function() {
  var handler, file, symlink;
  
  handler = sharedHandlers.build(['cache', 'contentType', 'file']);
  file = new File({ path: this.name, handler: handler, content: this.rootContent(), isHtml: true, framework: this });
  this.server.files[file.url()] = file;
  
  handler = sharedHandlers.build(['symlink']);
  symlink = new File({ handler: handler, isSymlink: true, symlink: file });
  this.server.files[this.name] = symlink;
};

App.prototype.build = function(callback) {
  var Builder = function(app, callback) {
    var that = this;
    
    that.count = app.frameworks.length - 1;
    
    that.callbackIfDone = function() {
      if (callback && that.count <= 0) callback();
    };
    
    that.build = function() {
      app.files = {};

      app.buildRoot();

      app.frameworks.forEach(function(framework) {
        framework.build(function() {
          that.count -= 1;
          that.callbackIfDone();
        });
      });
    };
  };
  
  return new Builder(this, callback).build();
};

App.prototype.save = function() {
  var that = this,
      stylesheets = [],
      scripts = [],
      stylesheet, script, html, savr;
  
  var Saver = function(app, file) {
    var that = this;
    
    that.save = function() {
      file.handler.handle(file, null, function(r) {
        var path;
        
        if (r.data.length > 0) {
          path = l.path.join(app.savePath, file.savePath());

          File.createDirectory(l.path.dirname(path));
          l.fs.writeFile(path, r.data, function(err) {
            if (err) throw err;
          });
        }
      });
    };
  };
  
  that.urlPrefix = '../';
  sharedHandlers.urlPrefix = that.urlPrefix;
  
  that.frameworks.forEach(function(framework) {
    var file, url;
    
    for (url in that.server.files) {
      file = that.server.files[url];
      if (file.framework === framework) {
        if (file.isStylesheet()) stylesheets.push(file);
        if (file.isScript()) scripts.push(file);
        if (file.isResource()) new Saver(that, file).save();
      }
      if (file.isHtml) html = file;
    }
  });
  
  stylesheet = new File({
    path: that.name + '.css',
    framework: that,
    handler: sharedHandlers.build(['join']),
    children: stylesheets
  });
  
  savr = new Saver(that, stylesheet);
  savr.save();
  
  script = new File({
    path: that.name + '.js',
    framework: that,
    handler: sharedHandlers.build(['join']),
    children: scripts
  });
  
  savr = new Saver(that, script);
  savr.save();
  
  html.content = this.rootContent(
    '<link href="' + that.urlPrefix + stylesheet.url() + '" rel="stylesheet" type="text/css">',
    '<script type="text/javascript" src="' + that.urlPrefix + script.url() + '"></script>'
  );
  
  savr = new Saver(that, html);
  savr.save();
};
