
(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class 

  Defines the SproutCore UI namespace. All component views, structural views,
  and utilities are namespaced within the UI namespace.
 */
UI = {};

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** 
  @class
  
  @extends SC.View
*/
UI.Button = SC.View.extend(
/** @scope UI.Button.prototype */{
  
  toString: function() {
    return 'UI.Button';
  }
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


var get = SC.get;
var set = SC.set;

/** 
  @class

  Defines the protocol that all subclasses must implement
  
  @extends SC.Object
*/
UI.ViewController = SC.Object.extend(
/** @scope UI.ViewController.prototype */{

  rootNode: null,

  view: null,

  init:function() {
    set(this, 'view', SC.View.create({
      elementId: 'foobar'
    })); 
  },

  appendViews: function(node ) {
    var root = get(this, 'rootNode');
    if (!root) throw new SC.Error("Can't append views without a rootNode specified.");
    
    root.appendChild(get(this,'view'));
  }
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var get = SC.get;
var set = SC.set;

/** 
  @class
  
  @extends UI.ViewController
*/
UI.NavigationController = UI.ViewController.extend(
/** @scope UI.NavigationController.prototype */{

  navigationView: null,

  _stack: null,

  init: function() {
    this._stack = [];
  },

  initWithRootView: function(rootView) {
    this._stack = [rootView];
  },

  pushView: function(newView,animated) {
    //console.log('UI.NavigationController#pushView'); 

    if (SC.View.detect(newView) === false) {
      throw new Error("UI.NavigationController#pushView only takes SC.View objects");
    }

    var navView = get(this,'navigationView');
    
    // Create instance and append it to DOM
    newView = navView.pushView(newView, animated);

    this._stack.push(newView);
  },

  popView: function(animated) {
    //console.log('UI.NavigationController#popView'); 
    var poppedView = this._stack.pop();
    
    var navView = get(this,'navigationView');
    navView.popView(poppedView,animated);

    return poppedView;
  },

  views: function(key, value) {
    if (value !== undefined) { return; }
    return this._stack.slice(0);
  }.property(),

  destroy: function() {
    var navView = get(this,'navigationView'),
        stack = this._stack,
        len = stack.length;

    for (var i=len-1; i>=0; i--) {
      navView.popView(stack[i],false);
    }

    return this._super();
  }
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var set = SC.set;

/**
  Handlebars helper for all structural views in SproutCore UI.

  The helper expects the path to be either a path to an instance of a 
  view controller, or the view controller class. For example, a navigation
  view controller could be implemented either as:

    {{ui NavigationViewController contentBinding="MyApp.storiesController.topStories"}}

  Where MyNewsApp.topStories is an instance of UI.NavigationViewController.
  This will create an anonymous view controller and bind its content property
  to the specified content array.

  Alternatively, the same view controller could be implemented as:

    {{ui MyNewsApp.navigationViewController}} 

  Note that the type of view is inferred automatically. 

  The convention is to use the former style when the name of the class makes 
  it hard to guess what type of view it is, where as the latter style is 
  preffered when it eliminates duplication in the naming.
 */
Handlebars.registerHelper('ui',function(path, options){

  console.log('HELPER: path = ',path);
  
  // Normalize path
  var viewClass = (path.indexOf('.') >= 0)? SC.getPath(path) : UI[path],
      itemHash = {},
      fn = options.fn;

  if (fn) {
    itemHash.handlebarsBlock = fn;
    delete options.fn;
  }

  viewClass = SC.Handlebars.ViewHelper.viewClassFromHTMLOptions(viewClass, itemHash);
  return Handlebars.helpers.view.call(this, viewClass, options);
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



var get = SC.get;
var set = SC.set;

UI.THEMES = {};

UI._Templates = SC.Object.extend({

  themeTemplates: null,

  unknownProperty: function(key) {
    var themeTemplates = get(this,'themeTemplates');
    var templates = themeTemplates? themeTemplates[key] : null;

    return templates || SC.TEMPLATES[key];
  }
});

/** 
  @class
  
  @extends
*/
SC.View.reopen(
/** @scope SC.View.prototype */{
  
  /**
  
    @type String
  */
  themeName: null,

  /**
    Returns a hash to find the templateName in

    First, try to see if the theme overrides the template. If it does, use that
    one. Otherwise, return SC.TEMPLATES
  */
  templates: function(key, value) {
    var theme = get(this, 'themeName');

    return UI._Templates.create({themeTemplates: UI.THEMES[theme]});
  }.property('themeName')
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


var set = SC.set;
var get = SC.get;

/** 
  @class

  Overview
  ========

  UI.LayoutManager is an internal class used by UI.LayoutSupport to manage and
  update the layout of a view. The main API entry-points are: 
  layoutForManagedView(), and destroy(). The former returns a layout hash of
  properties to set on the view, and the latter cleans up the internal state
  of the layout manager.
  
  @private
  @extends SC.Object
 */
UI.LayoutManager = SC.Object.extend(
/** @scope UI.LayoutManager.prototype */{

  _direction: null,

  _anchors: null,
  _remainingSpace: null,

  _propertyMetadata: {
    remainingSpace: {
      neighbors: ['top','right','bottom','left']
    },
    top: {
      constraint: 'height',
      direction: 'vertical',
      neighbors: ['left','right']
    },
    right: {
      constraint: 'width',
      direction: 'horizontal',
      neighbors: ['top','bottom']
    },
    bottom: {
      constraint: 'height',
      direction: 'vertical',
      neighbors: ['left','right']
    },
    left: {
      constraint: 'width',
      direction: 'horizontal',
      neighbors: ['top','bottom']
    }
  },
  

  init: function() {
    this._anchors = {};
    return this._super();
  },

  layoutForManagedView: function(view, anchor, options) {
    if (anchor === 'remainingSpace') {
      return this._layoutForContentView(view, anchor, options);
    }

    return this._layoutForAnchoredView(view, anchor, options);
  },

  destroy: function() {
    this._direction = null;
    this._anchors = {};
    this._remainingSpace = null;
  },

  _layoutForAnchoredView: function(view, anchor, options) {
    var direction = this._direction,
        meta = this._propertyMetadata[anchor],
        neighbors = meta.neighbors,
        size = options.size,
        anchors = this._anchors,
        layout = {};

    if (direction !== null && direction !== meta.direction) { throw new SC.Error("You can't setup a horizontal anchor in a vertical view and vice versa."); }
    if (size === undefined || size === null) { throw new SC.Error("Anchors require a size property"); }

    layout[anchor] = 0;
    layout[meta.constraint] = size;

    for (var i=0,l=neighbors.length; i<l; i++) {
      var neighbor = neighbors[i];
      layout[neighbor] = 0;
    }

    this._direction = meta.direction;
    this._anchors[anchor] = {
      view: view,
      constraint: size
    };

    this._reflowContentView();

    return layout;
  },

  _layoutForContentView: function(view, anchor) {
    var direction = this._direction, anchors = this._anchors;
    var beforeAnchorName, afterAnchorName, beforeAnchor, afterAnchor;
    var remainingSpace = {
      view: view,
      before: null,
      after: null
    };

    if (direction === 'horizontal') {
      beforeAnchorName = 'left';
      afterAnchorName = 'right';
    }
    else if (direction === 'vertical') {
      beforeAnchorName = 'top';
      afterAnchorName = 'bottom';
    }

    beforeAnchor = anchors[beforeAnchorName];
    remainingSpace.before = beforeAnchor? beforeAnchor.constraint : 0;

    afterAnchor = anchors[afterAnchorName];
    remainingSpace.after = afterAnchor? afterAnchor.constraint : 0;

    this._remainingSpace = remainingSpace;

    var layout = {};
    var neighbors = this._propertyMetadata[anchor].neighbors;

    for (var i=0,l=neighbors.length; i<l; i++) {
      var neighbor = neighbors[i];
      layout[neighbor] = 0;
    }

    layout[beforeAnchorName] = remainingSpace.before;
    layout[afterAnchorName] = remainingSpace.after;

    return layout;
  },

  _reflowContentView: function() {
    var remainingSpace = this._remainingSpace;

    if (!remainingSpace) { return; }
    else if (!remainingSpace.view) { return; }


    var layout = this._layoutForContentView(remainingSpace ,'remainingSpace');
    var element = get(remainingSpace.view,'element');

    if (element) {
      for (var prop in layout) {
        $(element).css(prop,layout[prop]); 
      }
    }
  }
});

UI.rootLayoutManager = UI.LayoutManager.create({});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


var set = SC.set;
var get = SC.get;

/** 
  @class

  Overview
  =======

  UI.LayoutSupport provides anchoring support for the childviews of any 
  SC.View it is mixed to.

  Anchoring allows a view to get anchored to a side of its parent view. It's
  primarily used when building out the structure of an application. An example
  usage is a toolbar across the top of the page, with a sidebar for the 
  content space under it. In this scenario, the toolbar would be anchored to
  the top of the container view, and the sidebar would be anchored to the
  left of the view under it. 

  You will not generally interact with UI.LayoutSupport directly. Rather, 
  you simply specify the anchorTo property, and the size property, and it'll
  take care of the rest.

  Usage
  =======

  A typical usage scenario is for building a top toolbar and a bottom toolbar
  with a third view filling out the remaining space for content. In that case,
  your handlebars template will look like this:

    {{#view MyApp.ContainerView}}
      {{#view MyApp.TopToolbarView anchorTo="top" size="50"}}

      {{/view}}
      {{#view MyApp.ContentAreaView anchorTo="remainingSpace"}}

      {{/view}}
      {{#view MyApp.BottomToolbarView anchorTo="bottom" size="50"}}

      {{/view}}
    {{/view}}

  And your application's javascript file will be look like so: 

    MyApp.ContainerView = SC.View.extend(UI.LayoutSupport,{...});
    MyApp.TopToolbarView = SC.View.extend(UI.LayoutSupport,{...});
    MyApp.ContentAreaView = SC.View.extend(UI.LayoutSupport,{...});
    MyApp.BottomToolbarView = SC.View.extend(UI.LayoutSupport,{...});

  Notes: 
  --------

  - Each view which mixes-in UI.LayoutSupport becomes the layout manager
    for its children. That means, you can create complex layouts by combining
    the view hierarchy with UI.LayoutSupport.

  - Each UI.LayoutSupported-view supports anchors in a single direction (either
    horizontal or vertical). In other words, you can't have one view with both 
    top and left anchors, but you can create a view with top and bottom anchors.
  
  @extends SC.Object
*/
UI.LayoutSupport = SC.Mixin.create(
/** @scope UI.LayoutManager.prototype */{

  hasLayoutSupport: true,

  anchorTo: null,
  size: null,

  _layout: null,

  layoutManager: null,

  init: function() {

    set(this,'layoutManager', UI.LayoutManager.create({}));

    return this._super();
  },

  _getLayoutManager: function() {
    if (this._managerCache) return this._managerCache;
    var manager = null,
        view = get(this, 'parentView');

    while (view) {
      manager = get(view, 'layoutManager');
      if (manager) { break; }

      view = get(view, 'parentView');
    }

    manager = this._managerCache = manager || UI.rootLayoutManager;
    return manager;
  },

  applyLayout: function(buffer,layout) {
    buffer.style('position','absolute');

    for (var prop in layout) {
      buffer.style(prop,layout[prop]); 
    }
  },

  render: function(buffer) {
    var layoutManager = this._getLayoutManager();

    var layout = this._layout = layoutManager.layoutForManagedView(this, get(this,'anchorTo'), {
      size: get(this,'size')
    });

    this.applyLayout(buffer,layout);

    return this._super(buffer);
  },

  destroy: function() {

    var manager = this._getLayoutManager();
    manager.destroy();

    this._managerCache = undefined;

    return this._super();
  }

});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================




})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var get = SC.get;
var set = SC.set;


/** 
  @class

  Usage
  =======

  {{#ui NavigationView controller="path.to.controller"}}
    {{#collection MyApp.collectionController}}
      <h2>{{content.title}}</h2>
    {{/collleciton}}
  {{/ui}}

  The block provided in a {{#ui NavigationView}} helper defined the root view.
  It will be displayed on launch. To push new views to the NavigationView, call
  push(viewInstance) and pop() on the associated controller.
  
  @extends SC.View
*/
UI.NavigationView = SC.View.extend(
/** @scope UI.NavigationView.prototype */{

  controller: null,

  init: function() {
    this._super();

    var controller = get(this, 'controller');

    if (SC.typeOf(controller) === "string") {
      controller = SC.getPath(controller);
      set(this, 'controller', controller); 
    }

    set(controller, 'navigationView', this);
  },

  didInsertElement: function() {

    var controller = get(this, 'controller');
    var block = get(this, 'handlebarsBlock');

    if (block) {
      var view = SC.View.extend({
        template: block
      });

      controller.pushView(view);
    }
  },

  pushView: function(view,animated) {
    //console.log('UI.NavigationView#pushView'); 
    
    var childViews = get(this, 'childViews'),
        controller = get(this, 'controller'),
        buffer = "",
        view, fragment;

    view = this.createChildView(view, {
      controller: controller
    });

    buffer = buffer + view.renderToBuffer().string();
    fragment = SC.$(buffer);

    view._notifyWillInsertElement();

      this.$().append(fragment);
      childViews.push(view);

    view._notifyDidInsertElement();

    return view;
  },

  popView: function(view,animated) {
    //console.log('UI.NavigationView#popView'); 
    
    view.destroy();
  },

  toString: function() { return 'UI.NavigationView'; }
});

})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



})({});


(function(exports) {
// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



})({});
