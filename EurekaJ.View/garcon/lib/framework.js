var self = this,
    l = {},
    File, Framework, sharedHandlers;

File = require('./file').File;
sharedHandlers = require('./handlers').sharedHandlers;
l.fs = require('fs');
l.path = require('path');
l.sys = require('sys');
l.qfs = require('./qfs');

self.Framework = function(options) {
  var key;
  
  this.path = null;
  
  this.buildVersion = null;
  this.combineScripts = false;
  this.combineStylesheets = true;
  this.minifyScripts = false;
  this.minifyStylesheets = false;
  this.defaultLanguage = 'english';
  this.buildLanguage = 'english';
  
  for (key in options) {
    this[key] = options[key];
  }
  
  this.pathsToExclude = [/(^\.|\/\.|tmp\/|debug\/|test_suites\/|setup_body_class_names)/];
  if (options.pathsToExclude instanceof Array) {
    this.pathsToExclude = this.pathsToExclude.concat(options.pathsToExclude);
  } else if (options.pathsToExclude instanceof RegExp) {
    options.pathsToExclude.push(options.pathsToExclude);
  }
};

Framework = self.Framework;

Framework.prototype.nameFor = function(path) {
  return path.replace(/(^apps|frameworks|^themes|([a-z]+)\.lproj|resources)\//g, '');
};

Framework.prototype.urlFor = function(path) {
  return l.path.join(this.buildVersion, this.nameFor(path));
};

Framework.prototype.name = function() {
  if (this._name === undefined) {
    this._name = this.nameFor(this.path);
  }
  
  return this._name;
};

Framework.prototype.url = function() {
  if (this._url === undefined) {
    this._url = this.urlFor(this.name());
  }
  
  return this._url;
};

Framework.prototype.shouldExcludeFile = function(path) {
  return this.pathsToExclude.reduce(function(bool, re) {
    return bool || re.test(path);
  }, false);
};

Framework.prototype.virtualFileWithPathAndContent = function(path, content) {
  var that = this;
  
  return new File({
    path: l.path.join(that.path, path),
    framework: that,
    isVirtual: true,
    content: function(callback) {
      callback(null, content);
    }
  });
};

Framework.prototype.beforeFile = function() {
  return null;
};

Framework.prototype.afterFile = function() {  
  if (this._afterFile === undefined) {
    this._afterFile = this.virtualFileWithPathAndContent(
      'after.js',
      '; if ((typeof SC !== "undefined") && SC && SC.bundleDidLoad) SC.bundleDidLoad("' + this.name() + '");\n'
    );
  }
  
  return this._afterFile;
};

Framework.prototype.scanFiles = function(callback) {
  var Scanner = function(framework, callback) {
    var that = this;
    
    that.count = 0;
    
    that.files = [];
        
    that.callbackIfDone = function() {
      if (that.count <= 0) callback(that.files);
    };

    that.scan = function(path) {      
      that.count += 1;
      
      l.fs.stat(path, function(err, stats) {
        that.count -= 1;
        
        if (err) throw err;
        
        if (stats.isDirectory()) {
          that.count += 1;
          l.fs.readdir(path, function(err, subpaths) {
            that.count -= 1;
            
            if (err) throw err;
            
            subpaths.forEach(function(subpath) {
              if (subpath[0] !== '.') {
                that.scan(l.path.join(path, subpath));
              }
            });
            
            that.callbackIfDone();
          });
          
        } else {
          if (!framework.shouldExcludeFile(path)) {
            that.files.push(new File({ path: path, framework: framework }));
          }
        }

        that.callbackIfDone();
      });
    };
  };
  
  return new Scanner(this, callback).scan(this.path);
};

Framework.prototype.computeDependencies = function(files, callback) {
  var DependencyComputer = function(files, framework, callback) {
    var that = this;

    that.count = 0;

    that.callbackIfDone = function(callback) {
      if (that.count <= 0) callback(files);
    };

    that.compute = function() {
      files.forEach(function(file) {
        that.count += 1;
        l.qfs.readFile(file.path, function(err, data) {
          var re, match, path;
          that.count -= 1;
          if (err) throw err;
          file.deps = [];
          re = new RegExp("require\\([\"'](.*?)[\"']\\)", "g");
          while (match = re.exec(data)) {
            path = match[1];
            if (!/\.js$/.test(path)) path += '.js';
            file.deps.push(framework.urlFor(l.path.join(framework.path, path)));            
          }
          that.callbackIfDone(callback, files);
        });
      });
    };
    
  };
  
  return new DependencyComputer(files, this, callback).compute();
};

Framework.prototype.sortDependencies = function(file, orderedFiles, files, recursionHistory) {
  var that = this;
  
  if (recursionHistory === undefined) recursionHistory = [];
  
  if (recursionHistory.indexOf(file) !== -1) { // infinite loop
    return;
  } else {
    recursionHistory.push(file);
  }
  
  if (orderedFiles.indexOf(file) === -1) {
    
    if (file.deps) {
      file.deps.forEach(function(url) {
        var len = files.length,
            found = false,
            i;
        
        for (i = 0; i < len; ++i) {
          if (files[i].url() === url) {
            found = true;
            that.sortDependencies(files[i], orderedFiles, files, recursionHistory);
            break;
          }
        }
        
        if (!found) {
          l.sys.puts('WARNING: ' + url + ' is required in ' + file.url() + ' but does not exists.');
        }
      });
    }
    
    orderedFiles.push(file);
  }
};

Framework.prototype.orderScripts = function(scripts, callback) {
  var that = this;
    
  that.computeDependencies(scripts, function(scripts) {    
    var orderScripts = [],
        coreJsPath = l.path.join(that.path, 'core.js'),
        coreJs, i, sortedScripts;
    
    // order script alphabetically by path
    sortedScripts = scripts.sort(function(a, b) {
      return a.path.localeCompare(b.path);
    });
    
    // strings.js first
    sortedScripts.forEach(function(script) {
      if (/strings\.js$/.test(script.path)) {
        that.sortDependencies(script, orderScripts, sortedScripts);
      }
      if (script.path === coreJsPath) {
        coreJs = script;
      }
    });

    // then core.js and its dependencies
    if (coreJs) {
      that.sortDependencies(coreJs, orderScripts, sortedScripts);
      sortedScripts.forEach(function(script) {
        if (script.deps && script.deps.indexOf(coreJs.path) !== -1) {
          that.sortDependencies(script, orderScripts, sortedScripts);
        }
      });
    }

    // then the rest
    sortedScripts.forEach(function(script) {
      that.sortDependencies(script, orderScripts, sortedScripts);
    });

    while (scripts.shift()) {}
    while (i = orderScripts.shift()) { scripts.push(i); }
    
    callback();
  });
};


Framework.prototype.build = function(callback) {
  var that = this;
  
  var selectLanguageFiles = function(files) {
    var tmpFiles = {},
        file;
    
    files.forEach(function(file1) {
      var file2 = tmpFiles[file1.url()],
          file1Language = file1.language();
      
      if (file1Language === null || file1Language === that.buildLanguage || file1Language === that.defaultLanguage) {
        if (file2 === undefined) {
          tmpFiles[file1.url()] = file1;
        } else if (file1Language === that.buildLanguage) {
          tmpFiles[file1.url()] = file1;
        }
      }
    });
    
    files = [];
    for (file in tmpFiles) {
      files.push(tmpFiles[file]);
    }
    
    return files;
  };
  
  var buildStylesheets = function(files) {
    var tmpFiles = [],
        handlers = [],
        handler, file;
    
    handlers.push('ifModifiedSince', 'contentType');
    if (that.minifyScripts === true) {
      handlers.push('minify');
    }
    handlers.push(['rewriteStatic', "url('%@')"], 'join', 'file');
    
    handler = sharedHandlers.build(handlers);
    
    if (that.combineStylesheets === true) {
      files.forEach(function(file) {
        if (file.isStylesheet()) {
          tmpFiles.push(file);
        }
      });
      file = new File({
        path: that.path + '.css',
        framework: that,
        handler: handler,
        children: tmpFiles
      });
      that.server.files[file.url()] = file;
      that.orderedStylesheets = [file];
      
    } else {
      files.forEach(function(file) {
        if (file.isStylesheet()) {
          file.handler = handler;
          that.server.files[file.url()] = file;
          tmpFiles.push(file);
        }
      });
      that.orderedStylesheets = tmpFiles.sort(function(a, b) {
        return a.path.localeCompare(b.path);
      });
    }
    
  };
  
  var buildScripts = function(files, callback) {
    var tmpFiles = [],
        handlers = [],
        beforeFile = that.beforeFile(),
        afterFile = that.afterFile(),
        handler, file;
    
    that.orderedScripts = [];
    
    handlers.push('ifModifiedSince', 'contentType');
    if (that.minifyScripts === true) {
      handlers.push('minify');
    }
    handlers.push('rewriteSuper', 'rewriteStatic', 'join', 'file');
    
    handler = sharedHandlers.build(handlers);
    
    files.forEach(function(file) {
      if (file.isScript()) {
        if (that.combineScripts !== true) {
          file.handler = handler;
          that.server.files[file.url()] = file;
        }
        tmpFiles.push(file);
      }
    });
    
    that.orderScripts(tmpFiles, function() {      
      if (beforeFile) tmpFiles.unshift(beforeFile);
      if (afterFile) tmpFiles.push(afterFile);

      if (that.combineScripts === true) {
        file = new File({
          path: that.path + '.js',
          framework: that,
          handler: handler,
          children: tmpFiles
        });
        that.server.files[file.url()] = file;
        that.orderedScripts = [file];
      } else {
        handler = sharedHandlers.build(['contentType', 'file']);
        
        if (beforeFile) {
          beforeFile.handler = handler;
          that.server.files[beforeFile.url()] = beforeFile;
        }
        
        if (afterFile) {
          afterFile.handler = handler;
          that.server.files[afterFile.url()] = afterFile;
        }
        
        that.orderedScripts = tmpFiles;
      }
      
      callback();
    });
    
  };
  
  var buildResources = function(files) {
    var handler = sharedHandlers.build(['ifModifiedSince', 'contentType', 'file']);
    
    files.forEach(function(file) {
      if (file.isResource()) {
        file.handler = handler;
        that.server.files[file.url()] = file;
      }
    });
  };
  
  var buildTests = function(files) {
    var handler = sharedHandlers.build(['contentType', 'rewriteFile', 'wrapTest', 'file']);
    
    files.forEach(function(file) {
      if (file.isTest()) {
        file.handler = handler;
        that.server.files[file.url()] = file;
      }
    });
  };
  
  that.scanFiles(function(files) {
    files = selectLanguageFiles(files);
    that.files = files;
    
    buildStylesheets(files);
    buildResources(files);
    buildTests(files);
    buildScripts(files, function() {
      if (callback) callback();
    });
    
  });
};

Framework.sproutcoreBootstrap = function(options) {
  var that = this,
      bootstrap;
  
  options.path = 'frameworks/sproutcore/frameworks/bootstrap';
  bootstrap = new Framework(options);
  
  bootstrap.beforeFile = function() {  
    if (this._beforeFile === undefined) {
      this._beforeFile = this.virtualFileWithPathAndContent(
        'before.js',
        [
          'var SC = SC || { BUNDLE_INFO: {}, LAZY_INSTANTIATION: {} };',
          'var require = require || function require() {};'
        ].join('\n')
      );
    }

    return this._beforeFile;
  };
  
  bootstrap.afterFile = function() {  
    if (this._afterFile === undefined) {
      this._afterFile = this.virtualFileWithPathAndContent(
        'after.js',
        '; if (SC.setupBodyClassNames) SC.setupBodyClassNames();'
      );
    }

    return this._afterFile;
  };
  
  return bootstrap;
};

Framework.sproutcoreFrameworks = function(options) {
  var opts, key, list;
  
  if (this._sproutcoreFrameworks === undefined) {    
    
    opts = { combineScripts: true, pathsToExclude: [/fixtures\//] };
    for (key in options) {
      if (key === 'pathsToExclude') {
        if (options[key] === undefined) options[key] = [];
        if (options[key] instanceof RegExp) options[key] = [options[key]];
        opts[key] = opts[key].concat(options[key]);
      } else {
        opts[key] = options[key];
      }
    }
    
    list = ['jquery','runtime','amber','foundation', 'datastore', 'desktop', 'animation'];
    
    this._sproutcoreFrameworks = [this.sproutcoreBootstrap(opts)].concat(list.map(function(framework) {
      opts.path = 'frameworks/sproutcore/frameworks/' + framework;
      return new Framework(opts);
    }, this));
  }
  
  return this._sproutcoreFrameworks;
};
