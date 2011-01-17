/*globals process*/

var self = this,
    l = {},
    File;

l.fs = require('fs');
l.path = require('path');
l.sys = require('sys');
l.qfs = require('./qfs');

self.File = function(options) {
  var key;
  
  this.path = null;
  this.framework = null;
  this.handler = null;
  this.children = null;
  this.isHtml = false;
  this.isVirtual = false;
  
  for (key in options) {
    this[key] = options[key];
  }
};

File = self.File;

File.prototype.extname = function() {
  if (this._extname === undefined) {
    this._extname = l.path.extname(this.path);
  }
  
  return this._extname;
};

File.prototype.url = function() {
  if (this._url === undefined) {
    this._url = this.framework.urlFor(this.path);
  }
  
  return this._url;
};

File.prototype.language = function() {
  var match;
  
  if (this._language === undefined) {
    match = /([a-z]+)\.lproj\//.exec(this.path);
    this._language = match === null ? null : match[1];
  }
  
  return this._language;
};

File.prototype.isStylesheet = function() {
  return this.extname() === '.css';
};

File.prototype.isScript = function() {
  return this.extname() === '.js' && !/tests\//.test(this.path);
};

File.prototype.isTest = function() {
  return this.extname() === '.js' && /tests\//.test(this.path);
};

File.resourceExtensions = ['.png', '.jpg', '.gif', '.svg'];

File.prototype.isResource = function() {
  return File.resourceExtensions.some(function(extname) {
    return extname === this.extname();
  }, this);
};

File.prototype.isDirectory = function() {
  return this.children !== null;
};

File.prototype.savePath = function() {
  if (this.isHtml === true) {
    return this.url() + '.html';
  } else {
    return this.url();
  }
};

File.prototype.content = function(callback) {
  l.qfs.readFile(this.path, callback);
};

File.createDirectory = function(path) {
  var prefix = l.path.dirname(path),
      suffix;
  
  if (prefix !== '.' && prefix !== '/') {
    File.createDirectory(prefix);
  }
  
  try {
    l.fs.mkdirSync(path, parseInt('0755', 8));
  } catch (e) {
    if (e.errno !== process.EEXIST) throw e;
  }
};
