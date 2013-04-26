var page = require('webpage').create();
var before = Date.now();
page.open('http://emberjs.com/', function () {
    var title = page.evaluate(function () {
        return document.title;
    });
    if (title === "Ember.js - About") {
        console.log('Title as expected. Rendering screenshot!');
        page.render('emberjs.png');
    } else {
        console.log("Title not as expected!")
    }
    
    console.log("Test took: " + (Date.now() - before) + " ms.");
    phantom.exit();
});