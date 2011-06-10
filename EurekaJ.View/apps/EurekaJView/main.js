// ==========================================================================
// Project:   EurekaJView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//

EurekaJView.main = function main() {
	//Set up the main pane of the application and initialize the statechart. 
    EurekaJView.getPath('mainPage.mainPane').append();
    EurekaJView.statechart.initStatechart();
};

function main() {
    EurekaJView.main();
}
