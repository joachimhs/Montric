var g = require('./garcon/lib/garçon'),
    server, myApp;
    
// create a server which will listen on port 8000 by default
//server = new g.Server();

server = new g.Server({ port: 8000, proxyHost: 'localhost', proxyPort: 8081});


// adding an application named 'myapp' tells the server to respond to
// the /myapp url and to create a myapp.html file when saving
myApp = server.addApp({
  name: 'EurekaJView',
  theme: 'sc-theme',
  buildLanguage: 'english',
  combineScripts: false,
  combineStylesheets: false,
  minifyScripts: false,
  minifyStylesheets: false,
  buildVersion: 'eurekaJView'
});

// myApp needs SproutCore to run
myApp.addSproutcore();

// add other dependencies
myApp.addFrameworks(
  
  // a third party framework
  // { path: 'frameworks/calendar' },
  
  // the theme you're using
  //{ path:'frameworks/sproutcore/themes/standard_theme', combineScripts: true },
  
   //if you're on Quilmes and use Ace, uncomment the next 2 lines instead
   	{ path:'frameworks/sproutcore/themes/standard_theme', combineScripts: true },
	{ path:'frameworks/sproutcore/themes/empty_theme', combineScripts: true },
	 //{ path:'frameworks/sproutcore/themes/ace', combineScripts: true },
	
	{ path: 'frameworks/sproutcore/frameworks/statechart', combineScripts: true },
	{ path: 'frameworks/sproutcore/frameworks/desktop', combineScripts: true },
	{ path: 'frameworks/flot', combineScripts: true },
	{ path: 'frameworks/scui/frameworks/foundation', combineScripts: true },
  	{ path: 'frameworks/scui/frameworks/calendar', combineScripts: true },
  	


  // finally, the sources for myApp must be added as well
  { path: 'apps/' + myApp.name }
);

// add some html for inside the <head> tag
myApp.htmlHead = '<title>EurekaJ View</title>';

// add some html for inside the <body> tag
myApp.htmlBody = [
  '<p id="loading">',
    'Loading…',
  '</p>'
].join('\n');

// build the app and, when done, save it to the disk
myApp.build(function() {
  server.run();
});