/* >>>>>>>>>> BEGIN bundle_info.js */
        ;(function() {
          var target_name = 'sproutcore/standard_theme' ;
          if (!SC.BUNDLE_INFO) throw "SC.BUNDLE_INFO is not defined!" ;
          if (SC.BUNDLE_INFO[target_name]) return ; 

          SC.BUNDLE_INFO[target_name] = {
            requires: ['sproutcore/empty_theme','sproutcore/debug','sproutcore/testing'],
            styles:   ['/static/sproutcore/standard_theme/en/current/stylesheet.css?1291500744'],
            scripts:  []
          }
        })();

/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ==========================================================================
// Project:   Welcome Strings
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals Welcome */

// Place strings you want to localize here.  In your app, use the key and
// localize it using "key string".loc().  HINT: For your key names, use the
// english string with an underscore in front.  This way you can still see
// how your UI will look and you'll notice right away when something needs a
// localized string added to this file!
//
SC.stringsFor('English', {
  // "_String Key": "Localized String"
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Welcome */

/** @namespace
  
  The Welcome app is displayed when you load the root URL and the dev server
  is visible.  It will fetch the list of targets from the server and list 
  them.
  
  @extends SC.Object
*/
Welcome = SC.Object.create(
  /** @scope Welcome.prototype */ {

  NAMESPACE: 'Welcome',
  VERSION: '1.0.0',
  
  store: SC.Store.create().from('CoreTools.DataSource'),
  
  displayTitle: function() {
    var hostname = (window.location.hostname || 'localhost').toString();
    return hostname.match(/sproutcore\.com/) ? "SproutCore Demos".loc() : "SproutCore Developer Tools";
  }.property().cacheable()

}) ;

/* >>>>>>>>>> BEGIN source/controllers/targets.js */
// ==========================================================================
// Project:   Welcome.targetsController
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals CoreTools Welcome */

/** @class
  
  Manages the list of targets

  @extends SC.ArrayController
*/
Welcome.targetsController = SC.ArrayController.create(
/** @scope Welcome.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = Welcome.store.find(CoreTools.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  appsOnly: function() {
    return this.filter(function(t) { 
      return (t.get('kind') === 'app') && 
             (t.get('name') !== '/sproutcore/welcome'); 
    });
  }.property('[]').cacheable(),
  
  loadApplication: function() {
    var app = this.get('selection').firstObject(),
        url = app ? app.get('appUrl') : null;
        
    if (url) {
      this.set('canLoadApp', NO);
      this.invokeLater(function() { 
        window.location.href = url; // load new app
      });
    }
  },

  // used to disable all controls
  canLoadApp: YES,
  
  allowsEmptySelection: NO,
  allowsMultipleSelection: NO

}) ;

/* >>>>>>>>>> BEGIN source/lproj/main_page.js */
// ==========================================================================
// Project:   Welcome - mainPage
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals Welcome */

// This page describes the main user interface for your application.  
Welcome.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.PanelPane.design({
    layout: { width: 360, height: 300, centerX: 0, centerY: 0 },

    contentView: SC.View.design({
      childViews: 'heading prompt icon scrollView button'.w(),
      
      icon: SC.View.design({
        layout: { width: 32, left: 20, top: 18, height: 32 },
        tagName: 'img',
        render: function(context, firstTime) {
          context.attr('src', '/static/sproutcore/foundation/en/current/images/sproutcore-logo.png?1291500743');
        }
      }),
      
      heading: SC.LabelView.design({
        layout: { left: 56, top: 20, right: 20, height: 32 },
        tagName: "h1",
        classNames: "heading",
        valueBinding: 'Welcome.displayTitle' 
      }),
      
      prompt: SC.LabelView.design({
        layout: { left: 20, top: 60, right: 20, height: 20 },
        escapeHTML: NO,
        value: "Choose an application:"
      }),
      
      button: SC.ButtonView.design({
        layout: { bottom: 18, height: 24, width: 140, centerX: 0 },
        isEnabledBinding: "Welcome.targetsController.canLoadApp",

        title: "Load Application",
        theme: "capsule",
        isDefault: YES,
        
        target: "Welcome.targetsController",
        action: "loadApplication"
        
      }),
      
      scrollView: SC.ScrollView.design({
        layout: { left: 20, top: 80, right: 20, bottom: 63 },
        hasHorizontalScroller: NO,
        
        contentView: SC.ListView.design({  
          rowHeight: 32,

          contentBinding: "Welcome.targetsController.appsOnly",
          selectionBinding: "Welcome.targetsController.selection",
          isEnabledBinding: "Welcome.targetsController.canLoadApp",
          
          contentValueKey: "displayName",
          contentIconKey: "targetIcon",
          hasContentIcon: YES,
          
          target: "Welcome.targetsController",
          action: "loadApplication"
        })
        
      })
      
    }) 
  })

});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   Welcome
// Copyright: ©2010 Apple Inc.
// ==========================================================================
/*globals Welcome */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Welcome.main = function main() {
  Welcome.getPath('mainPage.mainPane').append() ;
  Welcome.targetsController.reload();
} ;

function main() { Welcome.main(); }

