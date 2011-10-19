/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SCUI - Sproutcore UI Library
// Copyright: ©2009 Evin Grano and contributors.
//            Portions ©2009 Eloqua Inc All rights reserved.
//            Portions ©2009 Evin Grano and contributors
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// Importent for Dashboard drag and drop
SCUI.WIDGET_TYPE = 'widget';

// States for a dashboard widget
SCUI.WIDGET_EDIT = 'editing';


/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/mixins/dashboard_delegate.js */
/*globals SCUI */

/** @mixin

  Mixin for delegates of SCUI.DashboardView so that it can request unique
  widget views on a per widget basis.

  @author Jonathan Lewis
  @author Evin Grano
*/

SCUI.DashboardDelegate = {

  // PUBLIC PROPERTIES

  isDashboardDelegate: YES,

  // PUBLIC METHODS

  /**
    Called by the SCUI.DashboardView when it needs a widget view class
    for a particular widget item.  Returning null causes SCUI.DashboardView
    to use the default SCUI.WidgetMissingView for that widget.
    
    dashboardView: the calling dashboard view.
    content: the dashboard view's content.
    contentIndex: the index of 'content' in the widget array.
    item: for convenience, the item itself

    Return null, a view class, or a string containing the fully qualified name of a view class.
  */
  dashboardWidgetViewFor: function(dashboardView, content, contentIndex, item) {
    //console.log('%@.dashboardWidgetViewFor()'.fmt(this));
    return null;
  },
  
  dashboardWidgetEditViewFor: function(dashboardView, content, contentIndex, item) {
    //console.log('%@.dashboardWidgetEditViewFor()'.fmt(this));
    return null;
  },
  
  dashboardWidgetDidMove: function(dashboardView, widget) {
    return null;
  },

  /**
    Called by the SCUI.DashboardView when a widget deletion is proposed.
    Return YES if you handle it here, or NO to let the dashboard view will handle
    it itself and delete the widget.
  */
  dashboardDeleteWidget: function(dashboardView, widget) {
    return NO; // Don't handle by default
  },

  /**
    Called by the SCUI.DashboardView when a widget switches from edit view
    to front view.  Override if you want the notification.
  */
  dashboardWidgetDidCommitEditing: function(dashboardView, widget) {
    return null;
  },

  /**
   * Called by the SCUI.DashboardView when the view is initialized.
   */
  dashboardViewDidInitialize: function(dashboardView) {
    return null;
  },

  /**
   * Called by the SCUI.DashboardView when the size of the clipping frame changes.
   *
   * This is potentially useful, for example, if the dashboard widgets should be rearranged based
   * on the currently available viewing space.
   */
  dashboardFrameDidChange: function(dashboardView, clippingFrame) {
    return null;
  }

};


/* >>>>>>>>>> BEGIN source/mixins/widget.js */
/*globals SCUI */

/** @class

  A convenience mixin for widget content.  This defines the API that
  SCUI.DashboardView will use when attempting to communicate with the content
  model of each widget.

  @author Jonathan Lewis
  @author Evin Grano

*/
SCUI.Widget = {
/* Widget Mixin */

  // PUBLIC PROPERTIES

  isWidget: YES,
  
  /** @optional
    Defines the property containing the view class that should be shown as the face of the widget.
    May be a view class, i.e.
      
      widgetViewClass: SC.View.extend({ ... })

    or a fully qualified class name string, i.e.
    
      widgetViewClass: 'MyApp.MyWidgetView'

    If this is not defined, the dashboard will ask its delegate for the appropriate view class.
  */
  widgetViewClassKey: 'widgetViewClass',

  /** @optional
    Same as 'widgetViewClass', except this defines the view shown when 'isEditing' is true.
    If this is not defined, the dashboard will ask its delegate for the appropriate view class.
  */
  widgetEditViewClassKey: 'widgetEditViewClass',
  
  /**
    The property that stores this widget's position.  Position is expressed
    as a hash like this: { x: 100, y: 200 }.
  */
  positionKey: 'position',

  /**
    The property that stores this widget's size.  Size is expressed
    as a hash like this: { width: 300, height: 100 }.
  */
  sizeKey: 'size',

  /**
    @optional

    The property expected to hold the name of the widget.
  */
  nameKey: 'name',

  /**
    Controls whether or not the widget is allowed to move.
  */
  isLocked: NO,
  
  /**
    If YES, shows edit button on the widget and allows switching to widget edit view.
  */
  canEdit: YES,

  isEditing: NO,

  /**
    If YES, overlays a "Done" button on the widget's edit view.
  */
  showDoneButton: YES,
  
  // PUBLIC METHODS

  /**
    Called by the dashboard view after someone finishes dragging this widget.
  */
  widgetDidMove: function() {},

  /**
    Called on the widget when we're done editing.
  */
  widgetDidCommitEditing: function() {}
  
};


/* >>>>>>>>>> BEGIN source/models/clock_widget.js */
// ==========================================================================
// SCUI.ClockWidget
// ==========================================================================

sc_require('mixins/widget');

/** @class

  Defines a basic sample widget based on the Sproutcore sample "clock" app.
  This is the widget object that mixes in the SCUI.Widget API

  @author Jonathan Lewis
*/

SCUI.ClockWidget = SC.Object.extend( SCUI.Widget, {

  // PUBLIC PROPERTIES

  /**
    SCUI.Widget API: the face view for the widget (see clock_widget.js)
  */
  widgetViewClass: 'SCUI.ClockWidgetView',

  /**
    SCUI.Widget API: the edit view for the widget (see clock_widget.js)
  */
  widgetEditViewClass: 'SCUI.ClockWidgetEditView',

  /**
    SCUI.Widget API: the position of the widget
  */
  position: { x: 40, y: 40 },

  size: { width: 320, height: 150 },

  showGreeting: NO,
  
  greeting: "Hello World".loc(),
  
  now: '--',
  
  value: function() {
    return this.get(this.get('showGreeting') ? 'greeting' : 'now') ;
  }.property('showGreeting', 'greeting', 'now').cacheable(),

  // PUBLIC METHODS
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.tick();
  },
  
  tick: function() {
    this.set('now', new Date().format('hh:mm:ss'));
    this.invokeLater(this.tick, 1000);
  }
  
});


/* >>>>>>>>>> BEGIN source/views/clock_widget.js */
// ==========================================================================
// SCUI.ClockWidget
// ==========================================================================

sc_require('models/clock_widget');

/** @class

  This file defines the two views required for a basic clock sample widget.

  ClockWidgetView is the normal clock face for the widget.
  ClockWidgetEditView is the configuration view for the widget.

  @author Jonathan Lewis
*/

SCUI.ClockWidgetView = SC.View.extend({

  // PUBLIC PROPERTIES
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  content: null, // SCUI.ClockWidget object

  childViews: ['clockView'],

  clockView: SC.View.design({
    classNames: ['scui-clock-widget-view'],
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    childViews: ['labelView'],

    labelView: SC.LabelView.design({
      layout: { left: 10, right: 10, centerY: 0, height: 48 },
      tagName: 'h1',
      valueBinding: '.parentView.parentView*content.value'
    })
  })
  
});

SCUI.ClockWidgetEditView = SC.View.extend({
  
  // PUBLIC PROPERTIES
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },

  content: null, // SCUI.ClockWidget object

  childViews: ['optionView'],

  optionView: SC.View.design({
    classNames: ['scui-clock-widget-view'],
    layout: { left: 0, right: 0, top: 0, bottom: 0 },
    childViews: ['checkboxView'],

    checkboxView: SC.CheckboxView.design({
      layout: { centerX: 0, centerY: 0, width: 130, height: 18 },
      title: "Show Greeting".loc(),
      valueBinding: '.parentView.parentView*content.showGreeting'
    })
  })
  
});


/* >>>>>>>>>> BEGIN source/views/missing_widget.js */

/** @class

  Provides a substitute view for a missing widget view.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.MissingWidgetView = SC.View.extend( SC.Border, {
  
  // PUBLIC PROPERTIES

  layout: { left: 0, right: 0, top: 0, bottom: 0 },
  
  message: "Widget is missing or broken. Please remove and replace this widget using the plus button in the bottom left.".loc(),
  
  classNames: 'missing-widget'.w(),

  createChildViews: function() {
    var childViews = [];

    childViews.push( this.createChildView(
      SC.LabelView.design({
        layout: { left: 10, right: 10, centerY: 0, height: 40 },
        textAlign: SC.ALIGN_CENTER,
        value: this.get('message')
      })
    ));

    this.set('childViews', childViews);
  }

});


/* >>>>>>>>>> BEGIN source/views/widget_container.js */
/*globals SCUI */

sc_require('views/missing_widget');

/** @class

  Provides a widget container view used by the SCUI.DashboardView.  It holds
  one widget, overlays widget button views, and swaps between widget face and
  widget edit views.

  This widget container adjust its layout to fit the widget views it contains.

  @extends SC.View
  @author Jonathan Lewis
*/

SCUI.WidgetContainerView = SC.View.extend( SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: ['scui-widget-container-view'],

  /**
    Controls whether or not we are showing the delete handle over this widget.
  */
  canDeleteWidget: NO,

  /**
    Default layout, only needed as a last resort
  */
  layout: { left: 0, top: 0, width: 400, height: 200 },
  
  /**
    The view class to be used as the widget face (set automatically by the dashboard)
  */
  widgetViewClass: null,

  /**
    The view class to be used as the widget's edit view (set automatically by the dashboard)
  */
  widgetEditViewClass: null,

  /**
    View class to use for each widget's delete button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  deleteHandleViewClass: SC.View.extend( SCUI.SimpleButton, {
    classNames: ['remove-button'],
    layout: { left: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional edit button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  editHandleViewClass: SC.View.extend( SCUI.SimpleButton, {
    classNames: ['settings-button'],
    layout: { right: 0, top: 0, width: 28, height: 28 }
  }),

  /**
    View class to use for each widget's optional "done editing" button.  Whatever view class is used here
    should be capable of acting like a button, and should have 'target' and 'action' properties
    that get fired when it is clicked.  These will be assigned values automatically for you when
    the view is instantiated.
  */
  doneButtonViewClass: SC.ButtonView.extend({
    classNames: ['done-button'],
    layout: { right: 10, bottom: 10, width: 80, height: 24 },
    title: "Done".loc()
  }),

  displayProperties: ['canDeleteWidget', 'isEditing'],
  
  // PUBLIC METHODS

  /**
    Note this method creates all the child views we will need, but does not add them
    all to the childViews array immediately.  We use didCreateLayer() to trigger adding the
    correct set of child views at run-time.
  */
  createChildViews: function() {
    var childViews = [];
    var viewClass;
    var content = this.get('content');
    var isEditing = content ? content.get('isEditing') : NO;
    var showDoneButton = content ? content.get('showDoneButton') : NO;
    var canEdit = content ? content.get('canEdit') : NO;

    // create the edit view
    viewClass = this._getViewClass('widgetEditViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView.extend({
        message: "Widget's edit view is missing.".loc()
      });
    }
    this._editView = this.createChildView(viewClass, {
      content: content,
      isVisible: (canEdit && isEditing)
    });
    childViews.push(this._editView);

    // create the done button
    viewClass = this._getViewClass('doneButtonViewClass');
    if (viewClass) {
      this._doneButtonView = this.createChildView(viewClass, {
        target: this,
        action: 'commitEditing',
        isVisible: (canEdit && isEditing && showDoneButton)
      });
      childViews.push(this._doneButtonView);
    }

    // create the widget view
    viewClass = this._getViewClass('widgetViewClass');
    if (!viewClass) {
      viewClass = SCUI.MissingWidgetView;
    }
    this._widgetView = this.createChildView(viewClass, {
      content: content,
      isVisible: (!isEditing || !canEdit)
    });
    childViews.push(this._widgetView);

    // create the edit handle view
    viewClass = this._getViewClass('editHandleViewClass');
    if (viewClass) {
      this._editHandleView = this.createChildView(viewClass, {
        target: this,
        action: 'beginEditing',
        isVisible: (canEdit && !isEditing)
      });
      childViews.push(this._editHandleView);
    }
    
    // create the delete handle view
    viewClass = this._getViewClass('deleteHandleViewClass');
    if (viewClass) {
      this._deleteHandleView = this.createChildView(viewClass, {
        target: this,
        action: 'deleteWidget',
        isVisible: this.get('canDeleteWidget')
      });
      childViews.push(this._deleteHandleView);
    }
    
    this.set('childViews', childViews);
  },

  beginEditing: function() {
    if (this.getPath('content.canEdit')) {
      this.setPathIfChanged('content.isEditing', YES);
    }
  },

  commitEditing: function() {
    var c = this.get('content');
    var del = this.get('dashboardDelegate');
    
    this.setPathIfChanged('content.isEditing', NO);

    if (del && del.dashboardWidgetDidCommitEditing) {
      del.dashboardWidgetDidCommitEditing(this.get('owner'), c);
    }

    if (c && c.widgetDidCommitEditing) {
      c.widgetDidCommitEditing();
    }
  },
  
  deleteWidget: function() {
    var owner = this.get('owner');
    if (owner && owner.deleteWidget) {
      owner.deleteWidget(this.get('content'));
    }
  },

  /**
    Overridden from SC.Control to observe a few properties on the widget model
    and adjust the view accordingly.
  */
  contentPropertyDidChange: function(target, key) {
    if (key === this.getPath('content.sizeKey')) {
      this._sizeDidChange();
    }
    else if (key === this.getPath('content.positionKey')) {
      this._positionDidChange();
    }
    else if (key === 'isEditing') {
      this._isEditingDidChange();
    }
  },
  
  // PRIVATE METHODS

  _sizeDidChange: function() {
    var sizeKey = this.getPath('content.sizeKey');
    var size = sizeKey ? this.getPath('content.%@'.fmt(sizeKey)) : null;

    //console.log('%@._sizeDidChange()'.fmt(this));

    if (size) {
      this.adjust({ width: (parseFloat(size.width) || 0), height: (parseFloat(size.height) || 0) });
    }
  },

  _positionDidChange: function() {
    var posKey = this.getPath('content.positionKey');
    var pos = posKey ? this.getPath('content.%@'.fmt(posKey)) : null;

    //console.log('%@._positionDidChange()'.fmt(this));

    if (pos) {
      this.adjust({ left: (parseFloat(pos.x) || 0), top: (parseFloat(pos.y) || 0) });
    }
  },

  _isEditingDidChange: function() {
    var content = this.get('content');
    var isEditing = content ? content.get('isEditing') : NO;
    var canEdit = content ? content.get('canEdit') : NO;
    var showDoneButton = content ? content.get('showDoneButton') : NO;

    if (this._editView) {
      this._editView.set('isVisible', (canEdit && isEditing));
    }

    if (this._doneButtonView) {
      this._doneButtonView.set('isVisible', (canEdit && isEditing && showDoneButton));
    }

    if (this._widgetView) {
      this._widgetView.set('isVisible', (!isEditing || !canEdit));
    }
    
    if (this._editHandleView) {
      this._editHandleView.set('isVisible', (canEdit && !isEditing));
    }
  },

  _canDeleteWidgetDidChange: function() {
    if (this._deleteHandleView) {
      this._deleteHandleView.set('isVisible', this.get('canDeleteWidget'));
    }
  }.observes('canDeleteWidget'),

  _contentDidChange: function() {
    var content = this.get('content');

    if (this._widgetView) {
      this._widgetView.set('content', content);
    }

    if (this._editView) {
      this._editView.set('content', content);
    }
  }.observes('content'),

  _getViewClass: function(viewKey) {
    var c = this.get(viewKey); // hopefully the view class
    var t, root, key;

    // if it's a string class name, try to materialize it
    if (SC.typeOf(c) === SC.T_STRING) {
      t = SC.tupleForPropertyPath(c);
      if (t) {
        root = t[0];
        key = t[1];
        c = root.get ? root.get(key) : root[key];
      }
    }
    
    return (c && c.kindOf(SC.View)) ? c : null;
  },

  // PRIVATE PROPERTIES
  
  _widgetView: null,
  _editView: null,
  _activeView: null,

  _deleteHandleView: null,
  _editHandleView: null,
  _doneButtonView: null
  
});


/* >>>>>>>>>> BEGIN source/views/dashboard.js */
/*globals SCUI */

sc_require('views/widget_container');
sc_require('mixins/dashboard_delegate');

/** @class

  This is an overridden SC.CollectionView as a container for dashboard widgets.

  @extends SC.CollectionView
  @author Jonathan Lewis
*/

SCUI.DashboardView = SC.View.extend( SCUI.DashboardDelegate, {
  
  // PUBLIC PROPERTIES
  
  classNames: 'scui-dashboard-view',

  content: null,

  acceptsFirstResponder: YES,
  
  canDeleteContent: NO,
  
  widgetContainerView: SCUI.WidgetContainerView,
  
  delegate: null,
  
  dashboardDelegate: function() {
    var del = this.get('delegate');
    var content = this.get('content');
    return this.delegateFor('isDashboardDelegate', del, content);
  }.property('delegate', 'content').cacheable(),

  // PUBLIC METHODS

  didCreateLayer: function() {
    arguments.callee.base.apply(this,arguments);

    // Force an init.
    this._contentDidChange();

    var del = this.get('dashboardDelegate');
    if (del && del.dashboardViewDidInitialize) del.dashboardViewDidInitialize(this);
  },

  beginManaging: function() {
    this.setIfChanged('canDeleteContent', YES);
  },
  
  endManaging: function() {
    this.setIfChanged('canDeleteContent', NO);
  },
  
  deleteWidget: function(widget) {
    var content = this.get('content');
    var del = this.get('dashboardDelegate');
    
    // let the delegate handle deletion first. If it doesn't we'll handle it here
    if ((del && !del.dashboardDeleteWidget(this, widget)) || !del) {
      if (content && content.removeObject) {
        content.removeObject(widget);
      }
    }
  },

  mouseDown: function(evt) {
    var itemView, content, item, dd;

    // Since a mouse down could be the start of a drag, save all
    // the data we'll need for it
    this._dragData = null;
    if (evt && evt.which === 1) { // left mouse button
      itemView = this._itemViewForEvent(evt);

      if (itemView && !itemView.getPath('content.isLocked')) { // only start dragging if widget isn't locked
        dd = SC.clone(itemView.get('layout'));
        dd.startPageX = evt.pageX;
        dd.startPageY = evt.pageY;
        dd.view = itemView;
        dd.didMove = NO; // haven't moved yet
        this._dragData = dd;
      }
    }
    
    return YES;
  },
  
  mouseDragged: function(evt) {
    var dX, dY, dd = this._dragData;

    // We're in the middle of a drag, so adjust the view using the current drag delta
    if (dd) {
      dd.didMove = YES; // so that mouseUp knows whether to report the new position.
      dX = evt.pageX - dd.startPageX;
      dY = evt.pageY - dd.startPageY;
      dd.view.adjust({ left: dd.left + dX, top: dd.top + dY });
    }

    return YES;
  },
  
  mouseUp: function(evt) {
    var content, frame, finalPos, del, wx, wy, layout;

    // If this mouse up comes at the end of a drag of a widget
    // view, try to update the widget's model with new position
    if (this._dragData && this._dragData.didMove) {
      content = this._dragData.view.get('content');
      layout = this._dragData.view.get('layout');
      // try to update the widget data model with the new position
      if (content && layout) {
        wx = layout.left || 0;
        wy = layout.top || 0;
        finalPos = { x: wx, y: wy };
        this._setItemPosition(content, finalPos);
        
        if (content.widgetDidMove) {
          content.widgetDidMove();
          
          del = this.get('dashboardDelegate');
          if (del && del.dashboardWidgetDidMove) {
            del.dashboardWidgetDidMove(this, content);
          }
        }
      }
    }

    this._dragData = null; // clean up
    return YES;
  },

  /**
   * Overridden here so that we can invoke the delegate if the size of the clipping frame changes.
   *
   * The dashboard may want to perform certain actions in this case, like rerrange the widgets
   * beased on the currently available viewing space.
   */
  viewDidResize: function() {
    arguments.callee.base.apply(this,arguments);

    var clippingFrame = this.get('clippingFrame'), del = this.get('dashboardDelegate');
    if (this._isClippingFrameSizeDifferent(clippingFrame) && del && del.dashboardFrameDidChange) {
      del.dashboardFrameDidChange(this, clippingFrame);
    }
  },

  // PRIVATE METHODS
  
  _contentDidChange: function() {
    this.invokeOnce('_updateItemViews');
  }.observes('*content.[]'),
  
  _canDeleteContentDidChange: function() {
    var canDelete = this.get('canDeleteContent');
    var itemViews = this._itemViews || [];
    itemViews.forEach(function(v) {
      v.setIfChanged('canDeleteWidget', canDelete);
    });
  }.observes('canDeleteContent'),

  /*
   * Returns YES if the size of the clipping frame is different than it was the last time this
   * function was invoked (from viewDidResize()).
   */
  _isClippingFrameSizeDifferent: function(cf) {
    if (!this._previousCFHeight) {
      // We don't care about differences if the CF is only just now defined.
      this._previousCFHeight = cf.height;
      this._previousCFWidth = cf.width;
      return YES;
    } else {
      if (this._previousCFHeight === cf.height && this._previousCFWidth === cf.width) {
        return NO;
      } else {
        this._previousCFHeight = cf.height;
        this._previousCFWidth = cf.width;
        return YES;
      }
    }
  },

  _updateItemViews: function() {
    var content = this.get('content');
    var cache = this._itemViewCache || {};
    var itemViews = this._itemViews || [];
    var finalItemViews = [];
    var finalItemViewCache = {};
    var del = this.get('dashboardDelegate');
    var canDeleteContent = this.get('canDeleteContent');
    var widgetContainerViewClass = this.get('widgetContainerView');
    var itemViewsToAdd = [], itemViewsToRemove = [];
    var that = this;
    var widgetView, editView, key, viewKey, widgetContainerView, attrs, i;

    if (content && content.isEnumerable) {
      content.forEach(function(item, idx) {
        key = SC.guidFor(item);
        widgetContainerView = cache[key]; // see if we already have a widget view for this item

        // if not, create a new one
        if (!widgetContainerView) {
          attrs = {
            widgetViewClass: del.dashboardWidgetViewFor(that, content, idx, item) || item.get(item.get('widgetViewClassKey')),
            widgetEditViewClass: del.dashboardWidgetEditViewFor(that, content, idx, item) || item.get(item.get('widgetEditViewClassKey')),
            canDeleteWidget: canDeleteContent,
            content: item,
            owner: that,
            displayDelegate: that,
            dashboardDelegate: del,
            layout: that._layoutForItemView(item),
            layerId: '%@-%@'.fmt(SC.guidFor(that), key)
          };

          widgetContainerView = that.createChildView(widgetContainerViewClass, attrs);
        }

        finalItemViews.push(widgetContainerView);
        finalItemViewCache[key] = widgetContainerView;
      });
    }

    if (!finalItemViews.isEqual(itemViews)) {
      this.beginPropertyChanges();
    
      this.removeAllChildren();
    
      finalItemViews.forEach(function(itemView) {
        that.appendChild(itemView);
      });

      // clean up old views
      itemViews.forEach(function(itemView) {
        if (finalItemViews.indexOf(itemView) < 0) {
          itemView.set('content', null);
        }
      });

      this.endPropertyChanges();
    }

    this._itemViews = finalItemViews;
    this._itemViewCache = finalItemViewCache;
  },

  _layoutForItemView: function(item) {
    var layout = null, pos, size;

    if (item) {
      pos = this._getItemPosition(item) || { x: 20, y: 20 };
      size = this._getItemSize(item) || { width: 300, height: 100 };
      layout = { left: pos.x, top: pos.y, width: size.width, height: size.height };
    }
    return layout;
  },

  /** 
    Find the first content item view for the passed event.
    
    This method will go up the view chain, starting with the view that was the 
    target of the passed event, looking for a child item.  This will become 
    the view that is selected by the mouse event.
    
    This method only works for mouseDown & mouseUp events.  mouseMoved events 
    do not have a target.
    
    @param {SC.Event} evt An event
    @returns {SC.View} the item view or null
  */
  _itemViewForEvent: function(evt) {
    var responder = this.getPath('pane.rootResponder') ;

    if (!responder || !this._itemViewCache) return null ; // fast path
    
    var base    = SC.guidFor(this) + '-',
        baseLen = base.length,
        element = evt.target,
        layer   = this.get('layer'),
        id, key, itemView = null;

    // walk up the element hierarchy until we find this or an element with an
    // id matching the base guid (i.e. a collection item)
    while (element && element !== document && element !== layer) {
      id = element ? SC.$(element).attr('id') : null;
      
      if ((id.length > base.length) && (id.indexOf(base) === 0)) {
        key = id.slice(id.lastIndexOf('-') + 1);

        if (itemView = this._itemViewCache[key]) {
          break;
        }
      }

      element = element.parentNode; 
    }

    return itemView;
  },

  /**
    Encapsulates the standard way the dashboard attempts to extract the last
    position from the dashboard element.
    Returns null if unsuccessful.
  */
  _getItemPosition: function(item) {
    var posKey, pos;

    if (item) {
      posKey = item.get('positionKey') || 'position';
      pos = item.get(posKey);
      if (pos) {
        var x = parseFloat(pos.x) > 0 ? parseFloat(pos.x) : 0;
        var y = parseFloat(pos.y) > 0 ? parseFloat(pos.y) : 0;
        return { x: x, y: y };
      }
    }

    return null;
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to store the last
    position on a dashboard element.
  */
  _setItemPosition: function(item, pos) {
    var posKey;

    if (item) {
      posKey = item.get('positionKey') || 'position';
      item.set(posKey, pos);
    }
  },

  _getItemSize: function(item) {
    var sizeKey, size;

    if (item) {
      sizeKey = item.get('sizeKey');
      size = sizeKey ? item.get(sizeKey) : null;
      if (size) {
        return { width: (parseFloat(size.width) || 10), height: (parseFloat(size.height) || 10) };
      }
    }
    
    return null;
  },
  
  _setItemSize: function(item, size) {
    var sizeKey;
    
    if (item) {
      sizeKey = item.get('sizeKey');
      if (sizeKey) {
        item.set(sizeKey, size);
      }
    }
  },

  // PRIVATE PROPERTIES
  
  _itemViewCache: null,
  _itemViews: null

});


