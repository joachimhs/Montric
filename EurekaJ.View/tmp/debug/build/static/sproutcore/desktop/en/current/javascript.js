/* >>>>>>>>>> BEGIN source/lproj/strings.js */
// ========================================================================
// Sprout Core
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

// English Strings.
SC.stringsFor('English', {
  "Invalid.CreditCard(%@)": "%@ is not a valid credit card number",
  "Invalid.Email(%@)": "%@ is not a valid email address",
  "Invalid.NotEmpty(%@)": "%@ must not be empty",
  "Invalid.Password": "Your passwords do not match.  Please try typing them again.",
  "Invalid.General(%@)": "%@ is invalid.  Please try again.",
  "Invalid.Number(%@)": "%@ is not a number."
}) ;

/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  If set to NO, then pressing backspace will NOT navigate to the previous 
  page in the browser history, which is the default behavior in most browsers.
  
  Usually it is best to leave this property set to NO in order to prever the
  user from inadvertantly losing data by pressing the backspace key.
  
  @property {Boolean}
*/
SC.allowsBackspaceToPreviousPage = NO;

/* >>>>>>>>>> BEGIN source/system/drag.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

SC.DRAG_LINK = 0x0004; SC.DRAG_COPY = 0x0001; SC.DRAG_MOVE = 0x0002;
SC.DRAG_NONE = 0x0000; SC.DRAG_ANY = 0x0007; // includes SC.DRAG_REORDER
SC.DRAG_AUTOSCROLL_ZONE_THICKNESS = 20;

/**
  @class
  
  An instance of this object is created whenever a drag occurs.  The instance
  manages the mouse events and coordinating with droppable targets until the
  user releases the mouse button. 
  
  To initiate a drag, you should call SC.Drag.start() with the options below
  specified in a hash. Pass the ones you need to get the drag you want:  
  
  - *event: (req)* The mouse event that triggered the drag.  This will be used
    to position the element.
  
  - *source: (req)* The drag source object that should be consulted during 
    the drag operations. This is usually the container view that initiated 
    the drag.
  
  - *dragView: *  Optional view that will be used as the source image for the
    drag. The drag operation will clone the DOM elements for this view and
    parent them under the drag pane, which has the class name 'sc-ghost-view'.
    The drag view is not moved from its original location during a drag.
    If the dragView is not provided, the source is used as dragView.
  
  - *ghost:  YES | NO*  If NO, the drag view image will show, but the source 
    dragView will not be hidden.  Set to YES to make it appear that the 
    dragView itself is being dragged around.
  
  - *slideBack: YES | NO*  If YES and the drag operation is cancelled, the 
    dragView will slide back to its source origin.
  
  - *origin:*  If passed, this will be used as the origin point for the 
    ghostView when it slides back.  You normally do not need to pass this 
    unless the ghost view does not appear in the main UI.
  
  - *data:* Optional hash of data types and values.  You can use this to pass 
    a static set of data instead of providing a dataSource.  If you provide
    a dataSource, it will be used instead.
  
  - *dataSource:*  Optional object that will provide the data for the drag to 
    be consumed by the drop target.  If you do not pass this parameter or the 
    data hash, then the source object will be used if it implements the 
    SC.DragDataSource protocol.
  
  - *anchorView:* if you pass this optional view, then the drag will only be 
    allowed to happen within this view.  The ghostView will actually be added 
    as a child of this view during the drag.  Normally the anchorView is the 
    window.
  
  @extends SC.Object
*/
SC.Drag = SC.Object.extend(
/** @scope SC.Drag.prototype */ {
  
  /**
    The source object used to coordinate this drag.
    
    @readOnly
    @type SC.DragSource
  */
  source: null,
  
  /**
    The view actually dragged around the screen. This is created automatically
    from the dragView.
    
    @readOnly
    @type SC.View
  */
  ghostView: null,
  
  /**
    If YES, then the ghostView will acts like a cursor and attach directly
    to the mouse location.
    
    @readOnly
    @type Boolean
  */
  ghostActsLikeCursor: NO,
  
  /**  
    The view that was used as the source of the ghostView.  
    
    The drag view is not moved from its original location during a drag.
    Instead, the DOM content of the view is cloned and managed by the 
    ghostView.  If you want to visually indicate that the view is being 
    moved, you should set ghost to YES.
    If dragView is not provided the source is used instead.
    
    @readOnly
    @type SC.View
  */
  dragView: null,
  
  /**
    If YES, the dragView is automatically hidden while dragging around the 
    ghost.
    
    @readOnly
    @type Boolean
  */
  ghost: YES,
  
  /**
    If YES, then the ghostView will slide back to its original location if 
    drag is cancelled.
    
    @type Boolean
  */
  slideBack: YES,
  
  /**
    The original mouse down event.
    
    @readOnly
    @type SC.Event
  */
  mouseDownEvent: null,
  
  /**
    The origin to slide back to in the coordinate of the dragView's 
    containerView.
    
    @type Point
  */
  ghostOffset: { x: 0, y: 0 },
  
  /**
    The current location of the mouse pointer in window coordinates. This is 
    updated as long as the mouse button is pressed. Drop targets are 
    encouraged to update this property in their dragUpdated() method 
    implementations.
    
    The ghostView will be positioned at this location.
    
    @type Point
  */
  location: {},
  
  // ..........................................
  // DRAG DATA
  //
  
  /**
    Data types supported by this drag operation.
    
    Returns an array of data types supported by the drag source.  This may be 
    generated dynamically depending on the data source.
    
    If you are implementing a drag source, you will need to provide these data
    types so that drop targets can detect if they can accept your drag data.
    
    If you are implementing a drop target, you should inspect this property
    on your dragEntered() and prepareForDragOperation() methods to determine 
    if you can handle any of the data types offered up by the drag source.
    
    @property {Array} available data types
  */
  dataTypes: function() {
    // first try to use the data source.
    if (this.dataSource) return this.dataSource.get('dragDataTypes') || [] ;
    
    // if that fails, get the keys from the data hash.
    var hash = this.data ;
    if (hash) {
      var ret = [];
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) ret.push(key) ;
      }
      return ret ;
    }    
    
    // if that fails, then check to see if the source object is a dataSource.
    var source = this.get('source') ;
    if (source && source.dragDataTypes) return source.get('dragDataTypes') || [] ;
    
    // no data types found. :(
    return [] ; 
  }.property().cacheable(),
  
  /**
    Checks for a named data type in the drag.
    
    @param dataType {String} the data type
    @returns {Boolean} YES if data type is present in dataTypes array.
  */
  hasDataType: function(dataType) {
    return (this.get('dataTypes').indexOf(dataType) >= 0) ;
  },
  
  /**
    Retrieve the data for the specified dataType from the drag source.
    
    Drop targets can use this method during their performDragOperation() 
    method to retrieve the actual data provided by the drag data source.  This
    data may be generated dynamically depending on the data source.
    
    @param {Object} dataType data type you want to retrieve.  Should be one of
      the values returned in the dataTypes property
    @returns {Object} The generated data.
  */
  dataForType: function(dataType) {
    // first try to use the data Source.
    if (this.dataSource) {
      return this.dataSource.dragDataForType(this, dataType) ;
      
    // then try to use the data hash.
    } else if (this.data) {
      return this.data[dataType];
      
    // if all else fails, check to see if the source object is a data source.
    } else {
      var source = this.get('source') ;
      if (source && SC.typeOf(source.dragDataForType) == SC.T_FUNCTION) {
        return source.dragDataForType(this, dataType) ;
        
      // no data source found. :(
      } else return null ;
    }
  },
  
  /**
    Optional object used to provide the data for the drag.
    
    Drag source can designate a dataSource object to generate the data for 
    a drag dynamically.  The data source can and often is the drag source 
    object itself.  
    
    Data Source objects must comply with the SC.DragDataSource interface.  If
    you do not want to implement this interface, you can provide the data 
    directly with the data property.
    
    If you are implementing a drop target, use the dataTypes property and 
    dataForTypes() method to access data instead of working directly with 
    these properties.
    
    @readOnly
    @type SC.DragDataSource
  */
  dataSource: null,
  
  /**
    Optional hash of data.  Used if no dataSource was provided.
    
    Drag sources can provide a hash of data when the drag begins instead of 
    specifying an actual dataSource.  The data is stored in this property.
    If you are implementing a drop target, use the dataTypes property and 
    dataForTypes() method to access data instead of working directly with 
    these properties.
    
    @readOnly
    @type Hash
  */
  data: null,
  
  /**
    Returns the currently allowed dragOperations for the drag.  This will be 
    set just before any callbacks are invoked on a drop target.  The drag 
    source is given an opportunity to set these operations.
    
    @readOnly
    @type Number
  */
  allowedDragOperations: SC.DRAG_ANY,
  
  /** @private required by autoscroll */
  _dragInProgress: YES,

  /** @private
    Stores the initial visibililty state of the dragView so it can be restored
    after the drag
  */
  _dragViewWasVisible: null,

  /** @private
    This will actually start the drag process. Called by SC.Drag.start().
  */
  startDrag: function() {
    // create the ghost view
    this._createGhostView() ;
    
    var evt = this.event ;
    
    // compute the ghost offset from the original mouse location
    
    var loc = { x: evt.pageX, y: evt.pageY } ;
    this.set('location', loc) ;
    
    var dv = this._getDragView() ;
    var pv = dv.get('parentView') ;

    // convert to global cooridinates
    var origin = pv ? pv.convertFrameToView(dv.get('frame'), null) : dv.get('frame') ;

    if (this.get('ghost')) {
      // Hide the dragView
      this._dragViewWasVisible = dv.get('isVisible') ;
      dv.set('isVisible', NO) ;
    }

    if (this.ghostActsLikeCursor) this.ghostOffset = { x: 14, y: 14 };
    else this.ghostOffset = { x: (loc.x-origin.x), y: (loc.y-origin.y) } ;
    
    // position the ghost view
    if(!this._ghostViewHidden) this._positionGhostView(evt) ;
    
    // notify root responder that a drag is in process
    this.ghostView.rootResponder.dragDidStart(this) ;
    
    var source = this.source ;
    if (source && source.dragDidBegin) source.dragDidBegin(this, loc) ;
    
    // let all drop targets know that a drag has started
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      ary[idx].tryToPerform('dragStarted', this, evt) ;
    }
  },

  /** @private
    Cancel the drag operation.

    This notifies the data source that the drag ended and removes the
    ghost view, but does not notify the drop target of a drop.

    This is called by RootResponder's keyup method when the user presses
    escape and a drag is in progress.
  */
  cancelDrag: function() {
    var target = this._lastTarget,
        loc = this.get('location');

    if (target && target.dragExited) target.dragExited(this, this._lastMouseDraggedEvent);

    this._destroyGhostView();

    if (this.get('ghost')) {
      if (this._dragViewWasVisible) this._getDragView().set('isVisible', YES);
      this._dragViewWasVisible = null;
    }

    var source = this.source;
    if (source && source.dragDidEnd) source.dragDidEnd(this, loc, SC.DRAG_NONE);

    this._lastTarget = null;
    this._dragInProgress = NO;
  },
  
  // ..........................................
  // PRIVATE PROPERTIES AND METHODS
  //
  
  /** @private
    This method is called repeatedly during a mouse drag.  It updates the
    position of the ghost image, then it looks for a current drop target and
    notifies it.
  */
  mouseDragged: function(evt) {
    var scrolled = this._autoscroll(evt) ;
    var loc = this.get('location') ;
    if (!scrolled && (evt.pageX === loc.x) && (evt.pageY === loc.y)) {
      return ; // quickly ignore duplicate calls
    } 

    // save the new location to avoid duplicate mouseDragged event processing
    loc = { x: evt.pageX, y: evt.pageY };
    this.set('location', loc) ;
    this._lastMouseDraggedEvent = evt;
    
    // STEP 1: Determine the deepest drop target that allows an operation.
    // if the drop target selected the last time this method was called 
    // differs from the deepest target found, then go up the chain until we 
    // either hit the last one or find one that will allow a drag operation
    var source = this.source ;
    var last = this._lastTarget ;
    var target = this._findDropTarget(evt) ; // deepest drop target
    var op = SC.DRAG_NONE ;
    
    while (target && (target !== last) && (op === SC.DRAG_NONE)) {
      // make sure the drag source will permit a drop operation on the named 
      // target
      if (target && source && source.dragSourceOperationMaskFor) {
        op = source.dragSourceOperationMaskFor(this, target) ;
      } else op = SC.DRAG_ANY ; // assume drops are allowed
      
      // now, let's see if the target will accept the drag
      if ((op !== SC.DRAG_NONE) && target && target.computeDragOperations) {
        op = op & target.computeDragOperations(this, evt, op) ;
      } else op = SC.DRAG_NONE ; // assume drops AREN'T allowed
      
      this.allowedDragOperations = op ;
      
      // if DRAG_NONE, then look for the next parent that is a drop zone
      if (op === SC.DRAG_NONE) target = this._findNextDropTarget(target) ;
    }
    
    // STEP 2: Refocus the drop target if needed
    if (target !== last) {
      if (last && last.dragExited) last.dragExited(this, evt) ;
      
      if (target) {
        if (target.dragEntered) target.dragEntered(this, evt) ;
        if (target.dragUpdated) target.dragUpdated(this, evt) ;
      }
      
      this._lastTarget = target ;
    } else {
      if (target && target.dragUpdated) target.dragUpdated(this, evt) ;
    }
     
    // notify source that the drag moved
    if (source && source.dragDidMove) source.dragDidMove(this, loc) ;
    
    // reposition the ghostView
    if(!this._ghostViewHidden) this._positionGhostView(evt) ;
  },
  
  /**
    @private
    
    Called when the mouse is released.  Performs any necessary cleanup and
    executes the drop target protocol to try to complete the drag operation.
  */
  mouseUp: function(evt) {
    var loc    = { x: evt.pageX, y: evt.pageY },
        target = this._lastTarget, 
        op     = this.allowedDragOperations;
    
    this.set('location', loc);
    
    // try to have the drop target perform the drop...
    try {
      if (target && target.acceptDragOperation && target.acceptDragOperation(this, op)) {
        op = target.performDragOperation ? target.performDragOperation(this, op) : SC.DRAG_NONE ;  
      } else {
        op = SC.DRAG_NONE;
      }
    } catch (e) {
      console.error('Exception in SC.Drag.mouseUp(acceptDragOperation|performDragOperation): %@'.fmt(e)) ;
    }
    
    try {
      // notify last drop target that the drag exited, to allow it to cleanup
      if (target && target.dragExited) target.dragExited(this, evt) ;
    } catch (ex) {
      console.error('Exception in SC.Drag.mouseUp(target.dragExited): %@'.fmt(ex)) ;
    }
    
    // notify all drop targets that the drag ended
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      try {
        ary[idx].tryToPerform('dragEnded', this, evt) ;
      } catch (ex2) {
        console.error('Exception in SC.Drag.mouseUp(dragEnded on %@): %@'.fmt(ary[idx], ex2)) ;
      }
    }

    // destroy the ghost view
    this._destroyGhostView() ;

    if (this.get('ghost')) {
      // Show the dragView if it was visible
      if (this._dragViewWasVisible) this._getDragView().set('isVisible', YES) ;
      this._dragViewWasVisible = null;
    }

    // notify the source that everything has completed
    var source = this.source ;
    if (source && source.dragDidEnd) source.dragDidEnd(this, loc, op) ;
    
    this._lastTarget = null ;
    this._dragInProgress = NO ; // required by autoscroll (invoked by a timer)
  },

  /** @private
    Returns the dragView. If it is not set, the source is returned.
  */
  _getDragView: function() {
    if (!this.dragView) {
      if (!this.source || !this.source.isView) throw "Source can't be used as dragView, because it's not a view.";
      this.dragView = this.source;
    }
    return this.dragView;
  },

  /** @private
    This will create the ghostView and add it to the document.
  */
  _createGhostView: function() {
    var that  = this,
        dragView = this._getDragView(),
        frame = dragView.get('frame'),
        view;
        
    view = this.ghostView = SC.Pane.create({
      classNames:['sc-ghost-view'],
      layout: { top: frame.y, left: frame.x, width: frame.width, height: frame.height },
      owner: this,
      didCreateLayer: function() {
        if (dragView) {
          var layer = dragView.get('layer') ;
          if (layer) {
            layer = layer.cloneNode(true) ;
            // Make sure the layer we put in the ghostView wrapper is not displaced.
            layer.style.top = "0px" ;
            layer.style.left = "0px" ;
            this.get('layer').appendChild(layer) ;
          }
        }
      }
    });
    
    view.append() ;  // add to window
  },
  
  /** @private
    Positions the ghost view underneath the mouse with the initial offset
    recorded by when the drag started.
  */
  _positionGhostView: function(evt) {
    var loc = this.get('location') ;
    loc.x -= this.ghostOffset.x ;
    loc.y -= this.ghostOffset.y ;
    var gV = this.ghostView;
    if(gV) {
      gV.adjust({ top: loc.y, left: loc.x }) ;   
      gV.invokeOnce('updateLayout') ;
    }
  },
  
  /**
    YES if the ghostView has been manually hidden.
    
    @private 
    @type {Boolean}
    @default NO
  */
  _ghostViewHidden: NO,
  
  /**
    Hide the ghostView.
  */
  hideGhostView: function() {
    if(this.ghostView && !this._ghostViewHidden) {
      this.ghostView.remove();
      this._ghostViewHidden = YES;
    }
  },

  /**
    Unhide the ghostView.
  */
  unhideGhostView: function() {
    if(this._ghostViewHidden) {
      this._ghostViewHidden = NO;
      this._createGhostView();
    }
  },
  
  /** @private */
  _destroyGhostView: function() {
    if (this.ghostView) {
      this.ghostView.remove() ;
      this.ghostView = null ; // this will allow the GC to collect it.
      this._ghostViewHidden = NO;
    }
  },
  
  /** @private
    Return an array of drop targets, sorted with any nested drop targets
    at the top of the array.  The first time this method is called during
    a drag, it will reconstruct this array using the current set of 
    drop targets.  Afterwards it uses the cached set until the drop
    completes.
    
    This means that if you change the view hierarchy of your drop targets
    during a drag, it will probably be wrong.
  */
  _dropTargets: function() {
    if (this._cachedDropTargets) return this._cachedDropTargets ;
    
    // build array of drop targets
    var ret = [] ;
    var hash = SC.Drag._dropTargets ;
    for (var key in hash) {
      if (hash.hasOwnProperty(key)) ret.push(hash[key]) ;
    }
    
    // views must be sorted so that drop targets with the deepest nesting 
    // levels appear first in the array.  The getDepthFor().
    var depth = {} ;
    var dropTargets = SC.Drag._dropTargets ;
    var getDepthFor = function(x) {
      if (!x) return 0 ;
      var guid = SC.guidFor(x);
      var ret = depth[guid];
      if (!ret) {
        ret = 1 ;
        while (x = x.get('parentView')) {
          if (dropTargets[SC.guidFor(x)] !== undefined) ret++ ;
        }
        depth[guid] = ret ;
      }
      return ret ;
    } ;
    
    // sort array of drop targets
    ret.sort(function(a,b) {
      if (a===b) return 0;
      a = getDepthFor(a) ;
      b = getDepthFor(b) ;
      return (a > b) ? -1 : 1 ;
    }) ;
    
    this._cachedDropTargets = ret ;
    return ret ;
  },
  
  /** @private
    This will search through the drop targets, looking for one in the target 
    area.
  */
  _findDropTarget: function(evt) {
    var loc = { x: evt.pageX, y: evt.pageY } ;
    
    var target, frame ;
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      target = ary[idx] ;
      
      // If the target is not visible, it is not valid.
      if (!target.get('isVisibleInWindow')) continue ;
      
      // get clippingFrame, converted to the pane.
      frame = target.convertFrameToView(target.get('clippingFrame'), null) ;
      
      // check to see if loc is inside.  If so, then make this the drop target
      // unless there is a drop target and the current one is not deeper.
      if (SC.pointInRect(loc, frame)) return target;
    } 
    return null ;
  },
  
  /** @private
    Search the parent nodes of the target to find another view matching the 
    drop target.  Returns null if no matching target is found.
  */
  _findNextDropTarget: function(target) {
    var dropTargets = SC.Drag._dropTargets ;
    while (target = target.get('parentView')) {
      if (dropTargets[SC.guidFor(target)]) return target ;
    }
    return null ;
  },
  
  // ............................................
  // AUTOSCROLLING
  //
  
  /** @private
    Performs auto-scrolling for the drag.  This will only do anything if
    the user keeps the mouse within a few pixels of one location for a little
    while.
    
    Returns YES if a scroll was performed.
  */
  _autoscroll: function(evt) {
    if (!evt) evt = this._lastAutoscrollEvent ;
    
    // If drag has ended, exit
    if (!this._dragInProgress) return NO;
    
    // STEP 1: Find the first view that we can actually scroll.  This view 
    // must be:
    // - scrollable
    // - the mouse pointer must be within a scrolling hot zone
    // - there must be room left to scroll in that direction. 
    
    // NOTE: an event is passed only when called from mouseDragged
    var loc  = evt ? { x: evt.pageX, y: evt.pageY } : this.get('location'),
        view = this._findScrollableView(loc),
        scrollableView = null, // become final view when found
        vscroll, hscroll, min, max, edge, container, f;
    
    // hscroll and vscroll will become either 1 or -1 to indicate scroll 
    // direction or 0 for no scroll.
    
    while (view && !scrollableView) {
      
      // quick check...can we scroll this view right now?
      vscroll = view.get('canScrollVertical') ? 1 : 0;
      hscroll = view.get('canScrollHorizontal') ? 1 : 0;

      // at least one direction might be scrollable.  Collect frame info
      if (vscroll || hscroll) {
        container = view.get('containerView');
        if (container) {
          f = view.convertFrameToView(container.get('frame'),null);
        } else {
          vscroll = hscroll = 0 ; // can't autoscroll this mother
        }
      }

      // handle vertical direction
      if (vscroll) {
        
        // bottom hotzone?
        max = SC.maxY(f); 
        min = max - SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ; 
        if (loc.y >= min && loc.y <= max) vscroll = 1 ;
        else {
          // how about top
          min = SC.minY(f); 
          max = min + SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ;
          if (loc.y >= min && loc.y <= max) vscroll = -1 ;
          else vscroll = 0 ; // can't scroll vertical
        }
      }

      // handle horizontal direction
      if (hscroll) {
        
        // bottom hotzone?
        max = SC.maxX(f); 
        min = max - SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ; 
        if (loc.x >= min && loc.x <= max) hscroll = 1 ;
        else {
          // how about top
          min = SC.minX(f); 
          max = min + SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ;
          if (loc.x >= min && loc.x <= max) hscroll = -1 ;
          else hscroll = 0 ; // can't scroll vertical
        }
      }
      
      // if we can scroll, then set this.
      if (vscroll || hscroll) scrollableView = view ;
      else view = this._findNextScrollableView(view) ;
    }
    
    // STEP 2: Only scroll if the user remains within the hot-zone for a 
    // period of time
    if (scrollableView && (this._lastScrollableView === scrollableView)) {
      if ((Date.now() - this._hotzoneStartTime) > 100) {
        this._horizontalScrollAmount *= 1.05 ;
        this._verticalScrollAmount *= 1.05 ; // accelerate scroll
      }
      
    // otherwise, reset everything and disallow scroll
    } else {
      this._lastScrollableView = scrollableView ;
      this._horizontalScrollAmount = 15 ;
      this._verticalScrollAmount = 15 ;
      this._hotzoneStartTime = (scrollableView) ? Date.now() : null ;
      hscroll = vscroll = 0 ;
    }
    
    // STEP 3: Scroll!
    if (scrollableView && (hscroll || vscroll)) {
      var scroll = { 
        x: hscroll * this._horizontalScrollAmount,
        y: vscroll * this._verticalScrollAmount 
      } ;
      scrollableView.scrollBy(scroll) ;
    }
    
    // If a scrollable view was found, then check later
    if (scrollableView) {
      if (evt) {
        this._lastAutoscrollEvent = { pageX: evt.pageX, pageY: evt.pageY };
      }
      this.invokeLater(this._autoscroll, 100, null);
      return YES ;
    } else {
      this._lastAutoscrollEvent = null;
      return NO ;
    }
  },
  
  /** @private
    Returns an array of scrollable views, sorted with nested scrollable views 
    at the top of the array.  The first time this method is called during a 
    drag, it will reconstrut this array using the current state of scrollable 
    views.  Afterwards it uses the cached set until the drop completes.
  */
  _scrollableViews: function() {
    if (this._cachedScrollableView) return this._cachedScrollableView ;
    
    // build array of scrollable views
    var ret = [] ;
    var hash = SC.Drag._scrollableViews ;
    for (var key in hash) {
      if (hash.hasOwnProperty(key)) ret.push(hash[key]) ;
    }
    
    // now resort.  This custom function will sort nested scrollable views
    // at the start of the list.
    ret = ret.sort(function(a,b) {
      var view = a;
      while (view = view.get('parentView')) {
        if (b == view) return -1 ;
      }
      return 1; 
    }) ;
    
    this._cachedScrollableView = ret ;
    return ret ;
  },
  
  /** @private
    This will search through the scrollable views, looking for one in the 
    target area.
  */
  _findScrollableView: function(loc) {
    var ary = this._scrollableViews(),
        len = ary ? ary.length : 0,
        target, frame, idx;
        
    for (idx=0; idx<len; idx++) {
      target = ary[idx] ;
      
      if (!target.get('isVisibleInWindow')) continue ;
      
      // get clippingFrame, converted to the pane
      frame = target.convertFrameToView(target.get('clippingFrame'), null) ;
      
      // check to see if loc is inside
      if (SC.pointInRect(loc, frame)) return target;
    } 
    return null ;
  },
  
  /** @private
    Search the parent nodes of the target to find another scrollable view.
    return null if none is found.
  */
  _findNextScrollableView: function(view) {
    var scrollableViews = SC.Drag._scrollableViews ;
    while (view = view.get('parentView')) {
      if (scrollableViews[SC.guidFor(view)]) return view ;
    }
    return null ;
  }  
  
});

SC.Drag.mixin(
/** @scope SC.Drag */ {
   
  /**  
   This is the method you use to initiate a new drag.  See class documentation
   for more info on the options taken by this method.
   
   @params {Hash} ops a hash of options.  See documentation above.
  */
  start: function(ops) {
    var ret = this.create(ops) ;
    ret.startDrag() ;
    return ret ;
  },
  
  /** @private */
  _dropTargets: {},
  
  /** @private */
  _scrollableViews: {},
  
  /**
    Register the view object as a drop target.
    
    This method is called automatically whenever a view is created with the
    isDropTarget property set to YES.  You generally will not need to call it
    yourself.
    
    @param {SC.View} target a view implementing the SC.DropTarget protocol
  */
  addDropTarget: function(target) {
    this._dropTargets[SC.guidFor(target)] = target ;
  },
  
  /**
    Unregister the view object as a drop target.
    
    This method is called automatically whenever a view is removed from the 
    hierarchy.  You generally will not need to call it yourself.
    
    @param {SC.View} target A previously registered drop target
  */
  removeDropTarget: function(target) {
    delete this._dropTargets[SC.guidFor(target)] ;
  },
  
  /**
    Register the view object as a scrollable view.  These views will 
    auto-scroll during a drag.
    
    @param {SC.View} target The view that should be auto-scrolled
  */
  addScrollableView: function(target) {
    this._scrollableViews[SC.guidFor(target)] = target ;  
  },
  
  /**
    Remove the view object as a scrollable view.  These views will auto-scroll
    during a drag.
    
    @param {SC.View} target A previously registered scrollable view
  */
  removeScrollableView: function(target) {
    delete this._scrollableViews[SC.guidFor(target)] ;  
  }
  
});
/* >>>>>>>>>> BEGIN source/debug/drag.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('system/drag') ;

SC.Drag.mixin(
/** @scope SC.Drag */ {
   
  /**
    Convenience method to turn an operation mask into a descriptive string.
  */
  inspectOperation: function(op) {
    var ret = [] ;
    if (op === SC.DRAG_NONE) {
      ret = ['DRAG_NONE'];
    } else if (op === SC.DRAG_ANY) {
      ret = ['DRAG_ANY'] ;
    } else {
      if (op & SC.DRAG_LINK) {
        ret.push('DRAG_LINK') ;
      }
      
      if (op & SC.DRAG_COPY) {
        ret.push('DRAG_COPY') ;
      }
      
      if (op & SC.DRAG_MOVE) {
        ret.push('DRAG_MOVE') ;
      }
      
      if (op & SC.DRAG_REORDER) {
        ret.push('DRAG_REORDER') ;
      }
    }
    return ret.join('|') ;
  }

});
/* >>>>>>>>>> BEGIN source/mixins/border.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

SC.BORDER_BEZEL  = 'sc-bezel-border';
SC.BORDER_BLACK  = 'sc-black-border';
SC.BORDER_GRAY   = 'sc-gray-border';
SC.BORDER_TOP    = 'sc-top-border';
SC.BORDER_BOTTOM = 'sc-bottom-border';
SC.BORDER_NONE   = null ;

/**
  @namespace

  The Border mixin can be applied to any view to give it a visual border.
  In addition to specifying the mixin itself, you should specify the border
  style with the borderStyle property on your view.

  Border style can be any predefined CSS class name or a border color.

  If you specify a CSS class name, it must end in "-border". Additionally,
  you should set the borderTop, borderRight, borderBottom, and borderLeft
  properties so SproutCore can accurately account for the size of your view.

  SproutCore pre-defines several useful border styles including:

- SC.BORDER_BEZEL  - displays an inlaid bezel
- SC.BORDER_BLACK  - displays a black border
- SC.BORDER_GRAY   - displays a gray border
- SC.BORDER_TOP    - displays a border on the top only
- SC.BORDER_BOTTOM - displays a border on the bottom only
- SC.BORDER_NONE   - disables the border

  @since SproutCore 1.0
*/
SC.Border = {
  /**
    The thickness of the top border.

    @property {Number}
    @commonTask Border Dimensions
  */
  borderTop: 0,

  /**
    The thickness of the right border.

    @property {Number}
    @commonTask Border Dimensions
  */
  borderRight: 0,

  /**
    The thickness of the bottom border.

    @property {Number}
    @commonTask Border Dimensions
  */
  borderBottom: 0,

  /**
    The thickness of the left border.

    @property {Number}
    @commonTask Border Dimensions
  */
  borderLeft: 0,

  /**
    The style of the border. You may specify a color string (like 'red' or
    '#fff'), a CSS class name, or one of:
- SC.BORDER_BEZEL
- SC.BORDER_BLACK
- SC.BORDER_GRAY
- SC.BORDER_TOP
- SC.BORDER_BOTTOM
- SC.BORDER_NONE

    If you specify a CSS class name, it must end in "-border".
  */
  borderStyle: SC.BORDER_GRAY,

  /**
    Walk like a duck

    @private
  */
  hasBorder: YES,

  /**
    Make sure we re-render if the borderStyle property changes.
    @private
  */
  displayProperties: ['borderStyle'],

  /** @private */
  _BORDER_REGEXP: (/-border$/),

  /** @private */
  initMixin: function() {
    this._sc_border_borderStyleDidChange();
  },

  /** @private */
  renderMixin: function(context, firstTime) {
    var style = this.get('borderStyle');
    if (style) {
      if (this._BORDER_REGEXP.exec(style)) {
        context.addClass(style);
      } else context.addStyle('border', '1px '+style+' solid');
    }
  },

  /** @private */
  _sc_border_borderStyleDidChange: function() {
    var borderStyle = this.get('borderStyle'),
        borderSize = SC.Border.dimensions[borderStyle];

    if (borderSize) {
      this.borderTop    = borderSize;
      this.borderRight  = borderSize;
      this.borderBottom = borderSize;
      this.borderLeft   = borderSize;
    }
  }
};

SC.mixin(SC.Border, {
  dimensions: {
    'sc-bezel-border': 1,
    'sc-black-border': 1,
    'sc-gray-border': 1,
    'sc-top-border': 1,
    'sc-bottom-border': 1
  }
});
/* >>>>>>>>>> BEGIN source/mixins/collection_fast_path.js */
/** 
  An experimental CollectionView mixin that makes it extremely fast under
  certain circumstances, including for mobile devices.
*/
SC.CollectionFastPath = {
  //
  // ITEM VIEW CLASS/INSTANCE MANAGEMENT
  //
  initMixin: function() {
    this._indexMap = {};
  },
  
  /**
    Returns the pool for a given example view.
    
    The pool is calculated based on the guid for the example view class.
  */
  poolForExampleView: function(exampleView) {
    var poolKey = "_pool_" + SC.guidFor(exampleView);
    if (!this[poolKey]) this[poolKey] = [];
    return this[poolKey];
  },
  
  /**
    Creates an item view from a given example view, configuring it with basic settings
    and the supplied attributes.
  */
  createItemViewFromExampleView: function(exampleView, attrs) {
    // create the example view
    var ret = exampleView.create(attrs);
    
    // for our pooling, if it is poolable, mark the view as poolable and
    // give it a reference to its pool.
    if (ret.isPoolable) {
      ret.owningPool = this.poolForExampleView(exampleView);
    }
    
    // we will sometimes need to know what example view created the item view
    ret.createdFromExampleView = exampleView;

    // and now, return (duh)
    return ret;
  },
  
  configureItemView: function(itemView, attrs) {
    // set settings. Self explanatory.
    itemView.beginPropertyChanges();
    itemView.setIfChanged('content', attrs.content);
    itemView.setIfChanged('contentIndex', attrs.contentIndex);
    itemView.setIfChanged('parentView', attrs.parentView);
    itemView.setIfChanged('layerId', attrs.layerId);
    itemView.setIfChanged('isEnabled', attrs.isEnabled);
    itemView.setIfChanged('isSelected', attrs.isSelected);
    itemView.setIfChanged('outlineLevel', attrs.outlineLevel);
    itemView.setIfChanged('layout', attrs.layout);
    itemView.setIfChanged('disclosureState', attrs.disclosureState);
    itemView.setIfChanged('isVisibleInWindow', attrs.isVisibleInWindow);
    itemView.setIfChanged('isGroupView', attrs.isGroupView);
    itemView.setIfChanged('page', this.page);
    itemView.endPropertyChanges();
  },
  
  /**
    Configures a pooled view, calling .awakeFromPool if it is defined.
  */
  wakePooledView: function(itemView, attrs) {
    // configure
    this.configureItemView(itemView, attrs);
    
    // awake from the pool, etc.
    if (itemView.awakeFromPool) itemView.awakeFromPool(itemView.owningPool, this);
  },
  
  /**
    Gets an item view from an example view, from a pool if possible, and otherwise
    by generating it.
  */
  allocateItemView: function(exampleView, attrs) {
    // we will try to get it from a pool. This will fill ret. If ret is not
    // filled, then we'll know to generate one.
    var ret;
    
    // if it is poolable, we just grab from the pool.
    if (exampleView.prototype.isPoolable) {
      var pool = this.poolForExampleView(exampleView);
      if (pool.length > 0) {
        ret = pool.pop();
        this.wakePooledView(ret, attrs);
      }
    }
    
    if (!ret) {
      ret = this.createItemViewFromExampleView(exampleView, attrs);
    }
    
    return ret;
  },
  
  /**
    Releases an item view. If the item view is pooled, it puts it into the pool;
    otherwise, this calls .destroy().
    
    This is called for one of two purposes: to release a view that is no longer displaying,
    or to release an older cached version of a view that needed to be replaced because the
    example view changed.
  */
  releaseItemView: function(itemView) {
    // if it is not poolable, there is not much we can do.
    if (!itemView.isPoolable) {
      itemView.destroy();
      return;
    }
    
    // otherwise, we need to return to view
    var pool = itemView.owningPool;
    pool.push(itemView);
    if (itemView.hibernateInPool) itemView.hibernateInPool(pool, this);
  },
  
  /**
    Returns YES if the item at the index is a group.
    
    @private
  */
  contentIndexIsGroup: function(index, contentObject) {
    var contentDelegate = this.get("contentDelegate");
    
    // setup our properties
    var groupIndexes = this.get('_contentGroupIndexes'), isGroupView = NO;
    
    // and do our checking
    isGroupView = groupIndexes && groupIndexes.contains(index);
    if (isGroupView) isGroupView = contentDelegate.contentIndexIsGroup(this, this.get("content"), index);
    
    // and return
    return isGroupView;
  },
  
  /**
    @private
    Determines the example view for a content index. There are two optional parameters that will
    speed things up: contentObject and isGroupView. If you don't supply them, they must be computed.
  */
  exampleViewForItem: function(item, index) {
    var del = this.get('contentDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        key, ExampleView,
        isGroupView = this.contentIndexIsGroup(index, item);

    if (isGroupView) {
      // so, if it is indeed a group view, we go that route to get the example view
      key = this.get('contentGroupExampleViewKey');
      if (key && item) ExampleView = item.get(key);
      if (!ExampleView) ExampleView = this.get('groupExampleView') || this.get('exampleView');
    } else {
      // otherwise, we go through the normal example view
      key = this.get('contentExampleViewKey');
      if (key && item) ExampleView = item.get(key);
      if (!ExampleView) ExampleView = this.get('exampleView');
    }
    
    return ExampleView;
  },
  
  /**
    This may seem somewhat awkward, but it is for memory performance: this fills in a hash
    YOU provide with the properties for the given content index.
    
    Properties include both the attributes given to the view and some CollectionView tracking
    properties, most importantly the exampleView.
    
    
    @private
  */
  setAttributesForItem: function(item, index, attrs) {
    var del = this.get('contentDelegate'), 
        isGroupView = this.contentIndexIsGroup(index),
        ExampleView = this.exampleViewForItem(item, index),
        content = this.get("content");
    
    // 
    // FIGURE OUT "NORMAL" ATTRIBUTES
    //
    attrs.createdFromExampleView = ExampleView;
    attrs.parentView = this.get('containerView') || this;
    attrs.contentIndex = index;
    attrs.owner = attrs.displayDelegate = this;
    attrs.content = item;
    attrs.page = this.page;
    attrs.layerId = this.layerIdFor(index);
    attrs.isEnabled = del.contentIndexIsEnabled(this, content, index);
    attrs.isSelected = del.contentIndexIsSelected(this, content, index);
    attrs.outlineLevel = del.contentIndexOutlineLevel(this, content, index);
    attrs.disclosureState = del.contentIndexDisclosureState(this, content, index);
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    attrs.isGroupView = isGroupView;
    attrs.layout = this.layoutForContentIndex(index);
    if (!attrs.layout) attrs.layout = ExampleView.prototype.layout;
  },
  
  
  
  
  //
  // ITEM LOADING/DOM MANAGEMENT
  //
  
  /**
    @private
    Returns mapped item views for the supplied item.
  */
  mappedViewsForItem: function(item, map) {
    if (!map) map = this._viewMap;
    return map[SC.guidFor(item)];
  },
  
  /**
    @private
    Returns the mapped view for an item at the specified index. 
  */
  mappedViewForItem: function(item, idx, map) {
    if (!map) map = this._viewMap;
    var m = map[SC.guidFor(item)];
    if (!m) return undefined;
    return m[idx];
  },
  
  /**
    @private
    Maps a view to an item/index combination.
  */
  mapView: function(item, index, view, map) {
    // get the default view map if a map was not supplied
    if (!map) map = this._viewMap;
    
    // get the item map
    var g = SC.guidFor(item),
        imap = map[g];
    if (!imap) imap = map[g] = {_length: 0};
    
    // fill in the index
    imap[index] = view;
    imap._length++;
  },
  
  /**
    Unmaps a view from an item/index combination.
  */
  unmapView: function(item, index, map) {
    if (!map) map = this._viewMap;
    var g = SC.guidFor(item),
        imap = map[g];
    
    // return if there is nothing to do
    if (!imap) return;
    
    // remove
    if (imap[index]) {
      var v = imap[index];
      delete imap[index];
      
      imap._length--;
      if (imap._length <= 0) delete map[g];
    }
  },
  
  /**
    Returns the item view for the given content index.
    NOTE: THIS WILL ADD THE VIEW TO DOM TEMPORARILY (it will be cleaned if
          it is not used). As such, use sparingly.
  */
  itemViewForContentIndex: function(index) {
    var content = this.get("content");
    if (!content) return;
    
    var item = content.objectAt(index);
    if (!item) return null;
    
    var exampleView = this.exampleViewForItem(item, index),
        view = this._indexMap[index];
    
    if (view && view.createdFromExampleView !== exampleView) {
      this.removeItemView(view);
      this.unmapView(item, index);
      view = null;
    }
    
    if (!view) {
      view = this.addItemView(exampleView, item, index);
    }
    
    return view;
  },
  
  /**
    @private
    Returns the nearest item view index to the supplied index mapped to the item.
  */
  nearestMappedViewIndexForItem: function(item, index, map) {
    var m = this.mappedViewsForItem(item, map);
    if (!m) return null;
    
    // keep track of nearest and the nearest distance
    var nearest = null, ndist = -1, dist = 0;
    
    // loop through
    for (var idx in m) {
      idx = parseInt(idx, 10);
      if (isNaN(idx)) continue;
      // get distance
      dist = Math.abs(index - idx);
      
      // compare to nearest distance
      if (ndist < 0 || dist < ndist) {
        ndist = dist;
        nearest = idx;
      }
    }
    
    return nearest;
  },
  
  /**
    @private
    Remaps the now showing views to their new indexes (if they have moved).
  */
  remapItemViews: function(nowShowing) {
    // reset the view map, but keep the old for removing
    var oldMap = this._viewMap || {},
        newMap = (this._viewMap = {}),
        indexMap = (this._indexMap = {}),
        mayExist = [],
        content = this.get("content"), item;

    if (!content) return;
    var itemsToAdd = this._itemsToAdd;

    // first, find items which we can (that already exist, etc.)
    nowShowing.forEach(function(idx) {
      item = content.objectAt(idx);
      
      // determine if we have view(s) in the old map for the item
      var possibleExistingViews = this.mappedViewsForItem(item, oldMap);
      if (possibleExistingViews) {
        
        // if it is the same index, we just take it. End of story.
        if (possibleExistingViews[idx]) {
          var v = possibleExistingViews[idx];
          this.unmapView(item, idx, oldMap);
          this.mapView(item, idx, v, newMap);
          indexMap[idx] = v;
        } else {
          // otherwise, we must investigate later
          mayExist.push(idx);
        }
      } else {
        // if it is in now showing but we didn't find a view, it needs to be created.
        itemsToAdd.push(idx);
      }
    }, this);
    
    // now there are also some items which _could_ exist (but might not!)
    for (var idx = 0, len = mayExist.length; idx < len; idx++) {
      var newIdx = mayExist[idx];
      item = content.objectAt(newIdx);
      var nearestOldIndex = this.nearestMappedViewIndexForItem(item, newIdx, oldMap),
          nearestView;
      
      if (!SC.none(nearestOldIndex)) {
        nearestView = this.mappedViewForItem(item, nearestOldIndex, oldMap);
        var newExampleView = this.exampleViewForItem(item, newIdx);
        if (newExampleView === nearestView.createdFromExampleView) {
          // if there is a near one, use it, and remove it from the map
          this.unmapView(item, nearestOldIndex, oldMap);
          this.mapView(item, newIdx, nearestView, newMap);
          indexMap[newIdx] = nearestView;
        } else {
          itemsToAdd.push(newIdx);
        }
      } else {
        // otherwise, we need to create it.
        itemsToAdd.push(newIdx);
      }
    }
    
    return oldMap;
  },
  
  /**
    Reloads.
  */
  reloadIfNeeded: function(nowShowing, scrollOnly) {
    var content = this.get("content"), invalid;
    
    // we use the nowShowing to determine what should and should not be showing.
    if (!nowShowing || !nowShowing.isIndexSet) nowShowing = this.get('nowShowing');
    
    // we only update if this is a non-scrolling update.
    // don't worry: we'll actually update after the fact, and the invalid indexes should
    // be queued up nicely.
    if (!scrollOnly) {
      invalid = this._invalidIndexes;
      if (!invalid || !this.get('isVisibleInWindow')) return this;
      this._invalidIndexes = NO; 
      
      // tell others we will be reloading
      if (invalid.isIndexSet && invalid.contains(nowShowing)) invalid = YES ;
      if (this.willReload) this.willReload(invalid === YES ? null : invalid);
    }
    
    // get arrays of items to add/remove
    var itemsToAdd = this._itemsToAdd || (this._itemsToAdd = []);
    
    // remap
    var oldMap = this.remapItemViews(nowShowing);
    
    // The oldMap has the items to remove, so supply it to processRemovals
    this.processRemovals(oldMap);
    
    // handle the invalid set (if it is present)
    if (invalid) {
      this.processUpdates(invalid === YES ? nowShowing : invalid);
    }
    
    // process items to add
    this.processAdds();
    
    // only clear the DOM pools if this is not during scrolling. Adding/removing is a
    // bad idea while scrolling :)
    if (!scrollOnly) this.clearDOMPools();
    
    // clear the lists
    itemsToAdd.length = 0;
    
    // and if this is a full reload, we need to adjust layout
    if (!scrollOnly) {
      var layout = this.computeLayout();
      if (layout) this.adjust(layout);
      if (this.didReload) this.didReload(invalid === YES ? null : invalid);
    }
    
    return this;
  },
  
  /**
    Loops through remove queue and removes.
  */
  processRemovals: function(oldMap) {
    var content = this.get("content");
    for (var guid in oldMap) {
      var imap = oldMap[guid];
      for (var itemIdx in imap) {
        itemIdx = parseInt(itemIdx, 10);
        if (isNaN(itemIdx)) continue;
        
        var view = imap[itemIdx];
        
        if (this._indexMap[itemIdx] === view) delete this._indexMap[itemIdx];
        
        view._isInCollection = NO;
        this.removeItemView(view);
      }
    }
  },
  
  /**
    @private
    Loops through update queue and... updates.
  */
  processUpdates: function(invalid) {
    var u = this._itemsToUpdate, content = this.get("content"), item, view;
    invalid.forEach(function(idx) {
      item = content.objectAt(idx);
      if (view = this.mappedViewForItem(item, idx)) {
        if (!view._isInCollection) return;
        var ex = this.exampleViewForItem(item, idx);
        this.updateItemView(view, ex, item, idx);
      }
    }, this);
  },
  
  /**
    @private
    Loops through add queue and, well, adds.
  */
  processAdds: function() {
    var content = this.get("content");
    
    var add = this._itemsToAdd, idx, len = add.length, itemIdx, item;
    for (idx = 0; idx < len; idx++) {
      itemIdx = add[idx]; item = content.objectAt(itemIdx);
      
      // get example view and create item view
      var exampleView = this.exampleViewForItem(item, itemIdx);
      var view = this.addItemView(exampleView, item, itemIdx);
    }
  },
  
  /**
  @private
    Clear all DOM pools.
  */
  clearDOMPools: function() {
    var pools = this._domPools || (this._domPools = {});
    for (var p in pools) {
      this.clearDOMPool(pools[p]);
    }
  },
  
  domPoolSize: 10,
  
  /**
  @private
    Clears a specific DOM pool.
  */
  clearDOMPool: function(pool) {
    var idx, len = pool.length, item;
    
    // we skip one because there is a buffer area of one while scrolling
    for (idx = this.domPoolSize; idx < len; idx++) {
      item = pool[idx];

      // remove from DOM
      this.removeChild(item);
      
      // release the item
      this.releaseItemView(item);
    }
    
    // pool is cleared.
    pool.length = Math.min(pool.length, this.domPoolSize);
  },
  
  /**
  @private
    Returns the DOM pool for the given exampleView.
  */
  domPoolForExampleView: function(exampleView) {
    var pools = this._domPools || (this._domPools = {}), guid = SC.guidFor(exampleView);
    var pool = pools[guid];
    if (!pool) pool = pools[guid] = [];
    return pool;
  },
  
  /**
  @private
    Tries to find an item for the given example view in a dom pool.
    If one could not be found, returns null.
  */
  itemFromDOMPool: function(exampleView) {
    var pool = this.domPoolForExampleView(exampleView);
    if (pool.length < 1) return null;
    var view = pool.shift();
    if (view.wakeFromDOMPool) view.wakeFromDOMPool();
    return view;
  },
  
  /**
    @private
    Sends a view to a DOM pool.
  */
  sendToDOMPool: function(view) {
    var pool = this.domPoolForExampleView(view.createdFromExampleView);
    pool.push(view);
    var f = view.get("frame");
    view.adjust({ top: -f.height });
    view.set("layerId", SC.guidFor(view));
    if (view.sleepInDOMPool) view.sleepInDOMPool();
  },
  
  /**
  @private
    Adds an item view (grabbing the actual item from one of the pools if possible).
  */
  addItemView: function(exampleView, object, index) {
    var view, attrs = this._TMP_ATTRS || (this._TMP_ATTRS = {});
    
    // in any case, we need attributes
    this.setAttributesForItem(object, index, attrs);
    
    // try to get from DOM pool first
    if (view = this.itemFromDOMPool(exampleView)) {
      // set attributes
      this.configureItemView(view, attrs);
      
      // set that it is in the collection
      view._isInCollection = YES;
      
      // add to view map (if not used, it will be removed)
      this.mapView(object, index, view);
      this._indexMap[index] = view;
      
      // and that should have repositioned too
      return view;
    }
    
    // otherwise, just allocate a view
    view = this.allocateItemView(exampleView, attrs);
    
    // and then, add it
    this.appendChild(view);
    
    // set that it is in the collection.
    view._isInCollection = YES;
    
    // add to view map (if not used, it will be removed)
    this.mapView(object, index, view);
    this._indexMap[index] = view;
    
    return view;
  },
  
  /**
  @private
    Removes an item view.
  */
  removeItemView: function(current) {
    if (current.get("layerIsCacheable")) {
      this.sendToDOMPool(current);
    } else {
      this.removeChild(current);
    }
    current._isInCollection = NO;
  },
  
  /**
    Updates the specified item view. If the view is not "layer cacheable" or the
    example view has changed, it will be redrawn.
    
    Otherwise, nothing will happen.
  */
  updateItemView: function(current, exampleView, object, index) {
    if (!current.get("layerIsCacheable") || current.createdFromExampleView !== exampleView) {
      // unmap old and remove
      this.unmapView(current, index);
      delete this._indexMap[index];
      this.removeItemView(current, object, index);
      
      // add new and map
      var newView = this.addItemView(exampleView, object, index);
    } else {
      var attrs = this._TMP_ATTRS || (this._TMP_ATTRS = {});

      this.setAttributesForItem(object, index, attrs);
      this.configureItemView(current, attrs);
    }
  },
  
  
  /**
    Tells ScrollView that this should receive live updates during touch scrolling.
    We are so fast, aren't we?
  */
  _lastTopUpdate: 0,
  _lastLeftUpdate: 0,
  _tolerance: 100,
  
  /**
    The fast-path that computes a special 
  */
  touchScrollDidChange: function(left, top) {
    // prevent getting too many in close succession.
    if (Date.now() - this._lastTouchScrollTime < 25) return;
    
    var clippingFrame = this.get('clippingFrame');
    
    var cf = this._inScrollClippingFrame || (this._inScrollClippingFrame = {x: 0, y: 0, width: 0, height: 0});
    cf.x = clippingFrame.x; cf.y = clippingFrame.y; cf.width = clippingFrame.width; cf.height = clippingFrame.height;
    
    // update
    cf.x = left;
    cf.y = top;
    
    var r = this.contentIndexesInRect(cf);
    if (!r) return; // no rect, do nothing.
    
    var len = this.get('length'), 
        max = r.get('max'), min = r.get('min');

    if (max > len || min < 0) {
      r = r.copy();
      r.remove(len, max-len).remove(min, 0-min).freeze();
    }
    
    if (this._lastNowShowing) {
      if (r.contains(this._lastNowShowing) && this._lastNowShowing.contains(r)) return;
    }
    this._lastNowShowing = r;
    this.reloadIfNeeded(r, YES);
    
    this._lastTouchScrollTime = Date.now();
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/collection_group.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  TODO: Add full description of SC.CollectionGroup
  
  Any view you want to use as a group view in a collection must include this
  mixin.
  
  @since SproutCore 1.0
*/
SC.CollectionGroup = {
  
  classNames: ['sc-collection-group']
  
};

/* >>>>>>>>>> BEGIN source/mixins/collection_row_delegate.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



/** 
  @namespace
  
  CollectionRowDelegates are consulted by SC.ListView and SC.TableView to 
  control the height of rows, including specifying custom heights for 
  specific rows.  
  
  You can implement a custom row height in one of two ways.  
  
*/
SC.CollectionRowDelegate = {

  /** walk like a duck */
  isCollectionRowDelegate: YES,
  
  /**
    Default row height.  Unless you implement some custom row height 
    support, this row height will be used for all items.
    
    @property
    @type Number
  */
  rowHeight: 18,

  /**
    Index set of rows that should have a custom row height.  If you need 
    certains rows to have a custom row height, then set this property to a 
    non-null value.  Otherwise leave it blank to disable custom row heights.
    
    @property
    @type SC.IndexSet
  */
  customRowHeightIndexes: null,
  
  /**
    Called for each index in the customRowHeightIndexes set to get the 
    actual row height for the index.  This method should return the default
    rowHeight if you don't want the row to have a custom height.
    
    The default implementation just returns the default rowHeight.
    
    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index 
    @returns {Number} row height
  */
  contentIndexRowHeight: function(view, content, contentIndex) {
    return this.get('rowHeight');    
  }
  
  
};

/* >>>>>>>>>> BEGIN source/mixins/collection_view_delegate.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  A Collection View Delegate is consulted by a SC.CollectionView's to make
  policy decisions about certain behaviors such as selection control and
  drag and drop.  If you need to control other aspects of your data, you may
  also want to add the SC.CollectionContent mixin.
  
  To act as a Collection Delegate, just apply this mixin to your class.  You
  must then set the "delegate" property on the CollectionView to your object.
  
  Alternatively, if no delegate is set on a CollectionView, but the content 
  implements this mixin, the content object will be used as the delegate 
  instead.
  
  If you set an ArrayController or its arrangedObjects property as the content
  of a CollectionView, the ArrayController will automatically act as the 
  delegate for the view.
  
  @since SproutCore 1.0
*/
SC.CollectionViewDelegate = {

  /**
    Used to detect the mixin by SC.CollectionView
  */
  isCollectionViewDelegate: YES,
  
  // ..........................................................
  // SELECTION
  // 
  
  /**
    This method will be called anytime the collection view is about to
    change the selection in response to user mouse clicks or keyboard events.
    
    You can use this method to adjust the proposed selection, eliminating any
    selected objects that cannot be selected.  The default implementation of
    this method simply returns the proposed selection.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.IndexSet} sel Proposed array of selected objects.
    @returns {SC.IndexSet} Actual allow selection index set
  */
  collectionViewSelectionForProposedSelection: function(view, sel) {
    return sel ;
  },

  /**
    Called by the collection when attempting to select an item.  Return the 
    actual indexes you want to allow to be selected.  Return null to disallow
    the change.  The default allows all selection.
    
    @param {SC.CollectionView} view the view collection view
    @param {SC.IndexSet} indexes the indexes to be selected
    @param {Boolean} extend YES if the indexes will extend existing sel
    @returns {SC.IndexSet} allowed index set
  */
  collectionViewShouldSelectIndexes: function (view, indexes, extend) { 
    return indexes; 
  },
  
  /**
    Called by the collection when attempting to deselect an item.  Return the 
    actual indexes you want to allow to be deselected.  Return null to 
    disallow the change.  The default allows all selection.
    
    Note that you should not modify the passed in IndexSet.  clone it instead.
    
    @param {SC.CollectionView} view the view collection view
    @param {SC.IndexSet} indexes the indexes to be selected
    @returns {SC.IndexSet} allowed index set
  */
  collectionViewShouldDeselectIndexes: function (view, indexes) { 
    return indexes; 
  },

  // ..........................................................
  // EDIT OPERATIONS
  // 
  
  /**
    Called by the collection view whenever the deleteSelection() method is
    called.  You can implement this method to get fine-grained control over
    which items can be deleted.  To prevent deletion, return null.
    
    This method is only called if canDeleteContent is YES on the collection
    view.
    
    @param {SC.CollectionView} view the collection view
    @param {SC.IndexSet} indexes proposed index set of items to delete.
    @returns {SC.IndexSet} index set allowed to delete or null.
  */
  collectionViewShouldDeleteIndexes: function(view, indexes) { 
    return indexes; 
  },
  
  /**
    Called by the collection view to actually delete the selected items.
    
    The default behavior will use standard array operators to delete the 
    indexes from the array.  You can implement this method to provide your own 
    deletion method.
    
    If you simply want to control the items to be deleted, you should instead
    implement collectionViewShouldDeleteItems().  This method will only be 
    called if canDeleteContent is YES and collectionViewShouldDeleteIndexes()
    returns a non-empty index set
    
    @param {SC.CollectionView} view collection view
    @param {SC.IndexSet} indexes the items to delete
    @returns {Boolean} YES if the deletion was a success.
  */
  collectionViewDeleteContent: function(view, content, indexes) {
    if (!content) return NO ;

    if (SC.typeOf(content.destroyAt) === SC.T_FUNCTION) {
      content.destroyAt(indexes);
      view.selectPreviousItem(NO, 1) ;
      return YES ;
      
    } else if (SC.typeOf(content.removeAt) === SC.T_FUNCTION) {
      content.removeAt(indexes);
      view.selectPreviousItem(NO, 1) ;
      return YES;
      
    } else return NO ;
  },
  
  // ..........................................................
  // DRAGGING
  // 
  
  /**
    Called by the collection view just before it starts a drag to give you
    an opportunity to decide if the drag should be allowed. 
    
    You can use this method to implement fine-grained control over when a 
    drag will be allowed and when it will not be allowed.  For example, you
    may enable content reordering but then implement this method to prevent
    reordering of certain items in the view.
    
    The default implementation always returns YES.
    
    @param view {SC.CollectionView} the collection view
    @returns {Boolean} YES to alow, NO to prevent it
  */
  collectionViewShouldBeginDrag: function(view) { return YES; },
  
  /**
    Called by the collection view just before it starts a drag so that 
    you can provide the data types you would like to support in the data.
    
    You can implement this method to return an array of the data types you
    will provide for the drag data.
    
    If you return null or an empty array, can you have set canReorderContent
    to YES on the CollectionView, then the drag will go ahead but only 
    reordering will be allowed.  If canReorderContent is NO, then the drag
    will not be allowed to start.
    
    If you simply want to control whether a drag is allowed or not, you
    should instead implement collectionViewShouldBeginDrag().
    
    The default returns an empty array.
    
    @param view {SC.CollectionView} the collection view to begin dragging.
    @returns {Array} array of supported data types.
  */
  collectionViewDragDataTypes: function(view) { return []; },
  
  /**
    Called by a collection view when a drag concludes to give you the option
    to provide the drag data for the drop.
    
    This method should be implemented essentially as you would implement the
    dragDataForType() if you were a drag data source.  You will never be asked
    to provide drag data for a reorder event, only for other types of data.
    
    The default implementation returns null.
    
    @param view {SC.CollectionView} 
      the collection view that initiated the drag

    @param dataType {String} the data type to provide
    @param drag {SC.Drag} the drag object
    @returns {Object} the data object or null if the data could not be provided.
  */
  collectionViewDragDataForType: function(view, drag, dataType) {  
    return null ;
  },
  
  /**
    Called once during a drag the first time view is entered. Return all 
    possible drag operations OR'd together.
    
    @param {SC.CollectionView} view
      the collection view that initiated the drag

    @param {SC.Drag} drag
      the drag object
    
    @param {Number} proposedDragOperations
      proposed logical OR of allowed drag operations.

    @returns {Number} the allowed drag operations. Defaults to op
  */
  collectionViewComputeDragOperations: function(view, drag, proposedDragOperations) {
    return proposedDragOperations ;
  },
  
  /**
    Called by the collection view during a drag to let you determine the
    kind and location of a drop you might want to accept.
    
    You can override this method to implement fine-grained control over how
    and when a dragged item is allowed to be dropped into a collection view.

    This method will be called by the collection view both to determine in 
    general which operations you might support and specifically the operations
    you would support if the user dropped an item over a specific location.
    
    If the proposedDropOperation parameter is SC.DROP_ON or SC.DROP_BEFORE, 
    then the proposedInsertionPoint will be a non-negative value and you 
    should determine the specific operations you will support if the user 
    dropped the drag item at that point.
    
    If you do not like the proposed drop operation or insertion point, you 
    can override these properties as well by setting the proposedDropOperation
    and proposedInsertionIndex properties on the collection view during this
    method.  These properties are ignored all other times.
    
    @param view {SC.CollectionView} the collection view
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array 
      representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to op
  */
  collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    // don't allow dropping on by default
    return (proposedDropOperation & SC.DROP_ON) ? SC.DRAG_NONE : op ;
  },
  
  /**
    Called by the collection view to actually accept a drop.  This method will
    only be invoked AFTER your validateDrop method has been called to
    determine if you want to even allow the drag operation to go through.
    
    You should actually make changes to the data model if needed here and
    then return the actual drag operation that was performed.  If you return
    SC.DRAG_NONE and the dragOperation was SC.DRAG_REORDER, then the default
    reorder behavior will be provided by the collection view.
    
    @param view {SC.CollectionView}
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to proposedDragOperation
  */
  collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    return SC.DRAG_NONE ;
  },
  
  /**
    Renders a drag view for the passed content indexes. If you return null
    from this, then a default drag view will be generated for you.
    
    @param {SC.CollectionView} view
    @param {SC.IndexSet} dragContent
    @returns {SC.View} view or null
  */
  collectionViewDragViewFor: function(view, dragContent) {
    return null;
  },

  /**
    Allows the ghost view created in collectionViewDragViewFor to be displayed
    like a cursor instead of the default implementation. This sets the view 
    origin to be the location of the mouse cursor.
    
    @property {Boolean} ghost view acts like a cursor
  */
  ghostActsLikeCursor: NO
  
};

/* >>>>>>>>>> BEGIN source/mixins/scrollable.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  @namespace

  Any views you implement that are scrollable should include this mixin to
  provide basic support for scrolling actions.  You can also override any 
  of these methods as needed for your own specific behaviors.
  
  Often times instead of adding SC.Scrollable to your view, you should
  place your view inside of an SC.ScrollView.  See that class for more 
  info.
  
  Note that isScrollable must always be true.

*/
SC.Scrollable = {
  
//@if(debug)
  initMixin: function() {
    console.warn("SC.Scrollable is deprecated and will be removed in a future version of SproutCore.  Consider pulling the mixin into your own app if you want to keep using it.");
  },
//@endif 

  /** Informs the view system that the receiver is scrollable.
  
    Must always be true.
  */
  isScrollable: true,
  
  /** 
    Amount to scroll one vertical line.
  
    Used by the default implementation of scrollDownLine() and scrollUpLine().  Defaults
    to 20px.
  */
  verticalLineScroll: 20,
  
  /**
    Amount to scroll one horizontal line.
  
    Used by the default implementation of scrollLeftLine() and scrollRightLine(). Defaults
    to 20px.
  */
  horizontalLineScroll: 20,
  
  /**
    Amount to scroll one vertical page.
    
    Used by the default implementation of scrollUpPage() and scrollDownPage(). Defaults to
    current innerFrame height.
  */
  verticalPageScroll: function() {
    return this.get('innerFrame').height ;
  }.property('innerFrame'),
  
  /**
    Amount to scroll one horizontal page.
    
    Used by the default implementation of scrollLeftPage() and scrollRightPage().  Defaults
    to current innerFrame width.
  */
  horizontalPageScroll: function() {
    return this.get('innerFrame').width ;  
  }.property('innerFrame'),
  
  /**
    Returns true if the receiver has enough vertical content to require 
    scrolling.
    
    If you do not want to allow vertical scrolling, override this to be false 
    and set the appropriate CSS.
    
  */
  hasVerticalScroller: function() {
    return this.get('scrollFrame').height > this.get('innerFrame').height ;
  }.property('scrollFrame'),
  
  /**
    Returns true if the receiver has enough horizontal content to require 
    scrolling.
    
    If you do not want to allow horizontal scrolling, override this to be 
    false and set the appropriate CSS.
    
  */
  hasHorizontalScroller: function() {
    return this.get('scrollFrame').width > this.get('innerFrame').width ;
  }.property('scrollFrame'),

  /**
    Scrolls the receiver in the horizontal and vertical directions by the 
    amount specified, if allowed.
    
    @param {Point} amount the amount to scroll.  Must include x, y or both
    @returns {Point} the actual amount scrolled.
  */
  scrollBy: function(amount) {
    var sf = this.get('scrollFrame') ;
    var f = this.get('innerFrame') ;

    if (!this.get('hasVerticalScroller')) amount.y = 0 ;
    if (sf.height <= f.height) amount.y = 0 ;
    
    if (!this.get('hasHorizontalScroller')) amount.x = 0 ; 
    if (sf.width <= f.width) amount.x = 0 ;

    // compute new sf
    var newSf = { x: sf.x - (amount.x || 0), y: sf.y - (amount.y || 0) } ;
    this.set('scrollFrame', newSf) ;
    newSf = this.get('scrollFrame') ;
    
    return { x: newSf.x - sf.x, y: newSf.y - sf.y }; 
  },

  /**
    Scrolls the receiver to the specified x,y coordinate
  */
  scrollTo: function(x,y) {
    this.set('scrollFrame', { x: 0-x, y: 0-y }) ;  
  },
  
  /**
    Scroll the view to make the passed frame visible.
    
    Frame must be relative to the receiver's offsetParent.
    
    @param {SC.ClassicView} view the view you want to make visible
  */
  scrollToVisible: function(view) {

    // get frames and convert them to proper offsets
    var f = this.get('innerFrame') ;
    var sf = this.get('scrollFrame') ;
    
    // frame of the view, relative to the top of the scroll frame
    var vf = this.convertFrameFromView(view.get('frame'), view) ;
    vf.x -= (f.x + sf.x); vf.y -= (f.y + sf.y);
    
    // first visible origin
    var vo = { 
      x: 0-sf.x, 
      y: 0-sf.y, 
      width: f.width, 
      height: f.height 
    };

    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(vf)) ;
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(vf)) ;

    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(vf) - SC.maxY(vo)) ;
    vo.x += Math.max(0, SC.maxX(vf) - SC.maxX(vo)) ;

    // scroll to that origin.
    this.scrollTo(vo.x, vo.y) ;
  },
  
  /**
    Scrolls the receiver down one line if allowed.
    
    @param {Number} lines number of lines to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollDownLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy({ y: this.get('verticalLineScroll')*lines }).y ;
  },

  /**
    Scrolls the receiver down up line if allowed.
    
    @param {Number} lines number of lines to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollUpLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return 0-this.scrollBy({ y: 0-this.get('verticalLineScroll')*lines }).y ;
  },

  /**
    Scrolls the receiver right one line if allowed.
    
    @param {Number} lines number of lines to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollRightLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo({ y: this.get('horizontalLineScroll')*lines }).x ;
  },

  /**
    Scrolls the receiver left one line if allowed.
    
    @param {Number} lines number of lines to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollLeftLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return 0-this.scrollTo({ y: 0-this.get('horizontalLineScroll')*lines }).x ;
  },

  /**
    Scrolls the receiver down one page if allowed.
    
    @param {Number} pages number of pages to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollDownPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy({ y: this.get('verticalPageScroll')*pages }).y ;
  },

  /**
    Scrolls the receiver down up page if allowed.
    
    @param {Number} pages number of pages to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollUpPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return 0-this.scrollBy({ y: 0-this.get('verticalPageScroll')*pages }).y ;
  },

  /**
    Scrolls the receiver right one page if allowed.
    
    @param {Number} pages number of pages to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollRightPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollTo({ y: this.get('horizontalPageScroll')*pages }).x ;
  },

  /**
    Scrolls the receiver left one page if allowed.
    
    @param {Number} pages number of pages to scroll
    @returns {Number} the amount actually scrolled.
  */
  scrollLeftPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return 0-this.scrollTo({ y: 0-this.get('horizontalPageScroll')*pages }).x ;
  }
  
} ;


/* >>>>>>>>>> BEGIN source/panes/modal.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/** @class

  A modal pane is used to capture mouse events inside a pane that is modal.
  You normally will not work with modal panes directly, though you may set 
  the modalPane property to a subclass of this pane when designing custom 
  panes.
  
  A modal pane is automatically appended when a pane with isModal set to
  YES is made visible and removed when the same pane is hidden.  The only 
  purpose of the ModalPane is to absorb mouse events so that they cannot 
  filter through to the underlying content. 
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.ModalPane = SC.Pane.extend({
  
  classNames: 'sc-modal',
  
  /** @private cover the entire screen */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  _openPaneCount: 0,
  
  /** 
    Called by a pane just before it appends itself.   The modal pane can
    make itself visible first if needed.

    @param {SC.Pane} pane the pane
    @returns {SC.ModalPane} receiver
  */
  paneWillAppend: function(pane) {
    this._openPaneCount++;
    if (!this.get('isVisibleInWindow')) this.append();
    return this ;    
  },
  
  /**
    Called by a pane just after it removes itself.  The modal pane can remove
    itself if needed.   Modal panes only remove themselves when an equal 
    number of paneWillAppend() and paneDidRemove() calls are received.
  
    @param {SC.Pane} pane the pane
    @returns {SC.ModalPane} receiver
  */
  paneDidRemove: function(pane) { 
    this._openPaneCount--;
    if (this._openPaneCount <= 0) {
      this._openPaneCount = 0 ;
      if (this.get('isVisibleInWindow')) this.remove();
    }
  },
  
  /** 
    If owner pane implements modalPaneDidClick(), call it on mouse down.
  */
  mouseDown: function(evt) {
    var owner = this.get('owner');
    if (owner && owner.modalPaneDidClick) owner.modalPaneDidClick(evt);
  },
  
  touchStart: function(evt) {
    this.mouseDown(evt);
  }
});

/* >>>>>>>>>> BEGIN source/panes/panel.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('panes/modal');

/** 
  Shadow views from top-left corner clockwise
*/

/** @class

  Most SproutCore applications need modal panels. The default way to use the 
  panel pane is to simply add it to your page like this:
  
  {{{
    SC.PanelPane.create({
      layout: { width: 400, height: 200, centerX: 0, centerY: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}
  
  This will cause your panel to display.  The default layout for a Panel 
  is to cover the entire document window with a semi-opaque background, and to 
  resize with the window.
  
  @extends SC.Pane
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.PanelPane = SC.Pane.extend({

  layout: { left:0, right:0, top:0, bottom:0 },
  classNames: ['sc-panel'],
  acceptsKeyPane: YES,
  
  /**
    Indicates that a pane is modal and should not allow clicks to pass
    though to panes underneath it.  This will usually cause the pane to show
    the modalPane underneath it.
    
    @property {Boolean}
  */
  isModal: YES,

  /**
    The modal pane to place behind this pane if this pane is modal.  This 
    must be a subclass or an instance of SC.ModalPane.
  */
  modalPane: SC.ModalPane.extend({
    classNames: 'for-sc-panel'
  }),
  
  // ..........................................................
  // CONTENT VIEW
  // 
  
  /**
    Set this to the view you want to act as the content within the panel.
    
    @property {SC.View}
  */
  contentView: null,
  contentViewBindingDefault: SC.Binding.single(),

  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your contentView property 
    changes.  You can override it if you want to provide some behavior other
    than the default.
    
    @param {SC.View} newContent the new panel view or null.
    @returns {void}
  */
  
  render: function(context, firstTime) {
    if (context.needsContent) {
      this.renderChildViews(context, firstTime) ;
      context.push("<div class='top-left-edge'></div>",
       "<div class='top-edge'></div>",
       "<div class='top-right-edge'></div>",
       "<div class='right-edge'></div>",
       "<div class='bottom-right-edge'></div>",
       "<div class='bottom-edge'></div>",
       "<div class='bottom-left-edge'></div>",
       "<div class='left-edge'></div>");
    }
  },
  
  replaceContent: function(newContent) {
    this.removeAllChildren() ;
    if (newContent) this.appendChild(newContent) ;
  },

  /** @private */
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.contentView ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      this.childViews = [view] ;
    }
  },

  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function() {
    this.replaceContent(this.get('contentView'));
  }.observes('contentView'),

  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  // get the modal pane. 
  _modalPane: function() {
    var pane = this.get('modalPane');
    
    // instantiate if needed
    if (pane && pane.isClass) {
      pane = pane.create({ owner: this });
      this.set('modalPane', pane); 
    }
    
    return pane ;
  },
  
  /** @private - whenever showing on screen, deal with modal pane as well */
  appendTo: function(elem) {
    var pane ;
    if (!this.get('isVisibleInWindow') && this.get('isModal') && (pane = this._modalPane())) {
      this._isShowingModal = YES;
      pane.paneWillAppend(this);
    }
    return arguments.callee.base.apply(this,arguments);
  },
  
  /** @private - when removing from screen, deal with modal pane as well. */
  remove: function() {
    var pane, ret = arguments.callee.base.apply(this,arguments);
    
    if (this._isShowingModal) {
      this._isShowingModal = NO ;
      if (pane = this._modalPane()) pane.paneDidRemove(this);
    }
    return ret ;
  },
  
  /** @private - if isModal state changes, update pane state if needed. */
  _isModalDidChange: function() {
    var pane, isModal = this.get('isModal');
    if (isModal) {
       if (!this._isShowingModal && this.get('isVisibleInWindow') && (pane = this._modalPane())) {
         this._isShowingModal = YES;
         pane.paneWillAppend(this);
       }
       
    } else {
      if (this._isShowingModal && (pane = this._modalPane())) {
        this._isShowingModal = NO ;
        pane.paneDidRemove(this); 
      }
    }
  }.observes('isModal'),
  
  /** @private - extends SC.Pane's method - make panel keyPane when shown */
  paneDidAttach: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    this.becomeKeyPane();
    return ret ;
  }
});
/* >>>>>>>>>> BEGIN source/views/button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*jslint evil:true */

/** @class

  Implements a push-button-style button.  This class is used to implement 
  both standard push buttons and tab-style controls.  See also SC.CheckboxView
  and SC.RadioView which are implemented as field views, but can also be 
  treated as buttons.
  
  By default, a button uses the SC.Control mixin which will apply CSS 
  classnames when the state of the button changes:
    - active     when button is active
    - sel        when button is toggled to a selected state
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Button
  @since SproutCore 1.0  
*/
SC.ButtonView = SC.View.extend(SC.Control, SC.Button, SC.StaticLayout,
/** @scope SC.ButtonView.prototype */ {
  
  /**
    What type of element this view is represented as
    
    @property {String}
  */
  tagName: 'div',

  /**
    Class names that will be applied to this view
    
    @property {Array}
  */
  classNames: ['sc-button-view'],
  
  /**
    optionally set this to the theme you want this button to have.  
    
    This is used to determine the type of button this is.  You generally 
    should set a class name on the HTML with the same value to allow CSS 
    styling.
    
    The default SproutCore theme supports "regular", "capsule", "checkbox", 
    and "radio"
    
    @property {String}
  */
  theme: 'square',
  
  /**
    Optionally set the behavioral mode of this button.  
  
    Possible values are:
    - *SC.PUSH_BEHAVIOR* Pressing the button will trigger an action tied to the 
      button. Does not change the value of the button.
    - *SC.TOGGLE_BEHAVIOR* Pressing the button will invert the current value of 
      the button. If the button has a mixed value, it will be set to true.
    - *SC.TOGGLE_ON_BEHAVIOR* Pressing the button will set the current state to 
      true no matter the previous value.
    - *SC.TOGGLE_OFF_BEHAVIOR* Pressing the button will set the current state to 
      false no matter the previous value.
      
    @property {String}
  */
  buttonBehavior: SC.PUSH_BEHAVIOR,

  /*
    If buttonBehavior is SC.HOLD_BEHAVIOR, this specifies, in miliseconds, how 
    often to trigger the action. Ignored for other behaviors.
    
    @property {Number}
  */
  holdInterval: 100,

  /**
    If YES, then this button will be triggered when you hit return.
    
    This is the same as setting the keyEquivalent to 'return'.  This will also
    apply the "def" classname to the button.
    
    @property {Boolean}
  */
  isDefault: NO,
  isDefaultBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    If YES, then this button will be triggered when you hit escape.
    This is the same as setting the keyEquivalent to 'escape'.
    
    @property {Boolean}
  */  
  isCancel: NO,
  isCancelBindingDefault: SC.Binding.oneWay().bool(),

  /**
    The button href value.  This can be used to create localized button href 
    values.  Setting an empty or null href will set it to javascript:;
    
    @property {String}
  */
  href: '',

  /**
    The name of the action you want triggered when the button is pressed.  
    
    This property is used in conjunction with the target property to execute
    a method when a regular button is pressed.  These properties are not 
    relevant when the button is used in toggle mode.
    
    If you do not set a target, then pressing a button will cause the
    responder chain to search for a view that implements the action you name
    here.  If you set a target, then the button will try to call the method
    on the target itself.
    
    For legacy support, you can also set the action property to a function.  
    Doing so will cause the function itself to be called when the button is
    clicked.  It is generally better to use the target/action approach and 
    to implement your code in a controller of some type.
    
    @property {String}
  */
  action: null,
  
  /**
    The target object to invoke the action on when the button is pressed.
    
    If you set this target, the action will be called on the target object
    directly when the button is clicked.  If you leave this property set to
    null, then the button will search the responder chain for a view that 
    implements the action when the button is pressed instead.
    
    @property {Object}
  */
  target: null,
  
  /** 
    If YES, use a focus ring.
    
    @property {Boolean}
  */
  supportFocusRing: NO,
  
  _labelMinWidthIE7: 0,

  /**
    Called when the user presses a shortcut key, such as return or cancel,
    associated with this button.

    Highlights the button to show that it is being triggered, then, after a
    delay, performs the button's action.

    Does nothing if the button is disabled.

    @param {Event} evt
    @returns {Boolean} success/failure of the request
  */
  triggerAction: function(evt) {
    // If this button is disabled, we have nothing to do
    if (!this.get('isEnabled')) return NO;

    // Set active state of the button so it appears highlighted
    this.set('isActive', YES);

    // Invoke the actual action method after a small delay to give the user a
    // chance to see the highlight. This is especially important if the button
    // closes a pane, for example.
    this.invokeLater('_triggerActionAfterDelay', 200, evt);
    return YES;
  },

  /** @private
    Called by triggerAction after a delay; this method actually
    performs the action and restores the button's state.

    @param {Event} evt
  */
  _triggerActionAfterDelay: function(evt) {
    this._action(evt, YES);
    this.didTriggerAction();
    this.set('isActive', NO);
  },

  /**
    This method is called anytime the button's action is triggered.  You can 
    implement this method in your own subclass to perform any cleanup needed 
    after an action is performed.
    
    @property {function}
  */
  didTriggerAction: function() {},

  /**
    The minimum width the button title should consume.  This property is used
    when generating the HTML styling for the title itself.  The default 
    width of 80 usually provides a nice looking style, but you can set it to 0
    if you want to disable minimum title width.
    
    Note that the title width does not exactly match the width of the button
    itself.  Extra padding added by the theme can impact the final total
    size.
    
    @property {Number}
  */
  titleMinWidth: 80,
  
  // ................................................................
  // INTERNAL SUPPORT

  /** @private - save keyEquivalent for later use */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    //cache the key equivalent
    if(this.get("keyEquivalent")) this._defaultKeyEquivalent = this.get("keyEquivalent"); 
  },

  _TEMPORARY_CLASS_HASH: {},
  
  // display properties that should automatically cause a refresh.
  // isCancel and isDefault also cause a refresh but this is implemented as 
  // a separate observer (see below)
  displayProperties: ['href', 'icon', 'title', 'value', 'toolTip'],
  
  
  /**
    This property is used to call the right render style for the button.
    * This might be a future way to start implementing the render method
    as part of the theme
  */ 
  
  renderStyle: 'renderDefault', //SUPPORTED DEFAULT, IMAGE

  render: function(context, firstTime) {
    // add href attr if tagName is anchor...
    var href, toolTip, classes, theme;
    if (this.get('tagName') === 'a') {
      href = this.get('href');
      if (!href || (href.length === 0)) href = "javascript:;";
      context.attr('href', href);
    }

    // If there is a toolTip set, grab it and localize if necessary.
    toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc() ;
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
    
    // add some standard attributes & classes.
    classes = this._TEMPORARY_CLASS_HASH;
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
    classes.icon = !!this.get('icon');
    context.attr('role', 'button').setClass(classes);
    theme = this.get('theme');
    if (theme && !context.hasClass(theme)) context.addClass(theme);
    
    // render inner html 
    this[this.get('renderStyle')](context, firstTime);
  },
   
   
  /**
    Render the button with the default render style.
  */
  renderDefault: function(context, firstTime){
    if(firstTime) {
      context = context.push("<span class='sc-button-inner' style = 'min-width:"
        ,this.get('titleMinWidth'),
        "px'>");
    
      this.renderTitle(context, firstTime) ; // from button mixin
      context.push("</span>") ;
    
      if(this.get('supportFocusRing')) {
        context.push('<div class="focus-ring">',
                      '<div class="focus-left"></div>',
                      '<div class="focus-middle"></div>',
                      '<div class="focus-right"></div></div>');
      }
    }
    else {
      this.renderTitle(context, firstTime) ;
    }
  },
  
  /**
    Render the button with the image render style. To set image 
    set the icon property with the classname that has the style with the image
  */
  renderImage: function(context, firstTime){
    var icon = this.get('icon');
    context.addClass('no-min-width');
    if(icon) context.push("<div class='img "+icon+"'></div>");
    else context.push("<div class='img'></div>");
  },
  
  /** @private {String} used to store a previously defined key equiv */
  _defaultKeyEquivalent: null,
  
  /** @private
    Whenever the isDefault or isCancel property changes, update the display and change the keyEquivalent.
  */  
  _isDefaultOrCancelDidChange: function() {
    var isDef = !!this.get('isDefault'),
        isCancel = !isDef && this.get('isCancel') ;
    
    if(this.didChangeFor('defaultCancelChanged','isDefault','isCancel')) {
      this.displayDidChange() ; // make sure to update the UI
      if (isDef) {
        this.set('keyEquivalent', 'return'); // change the key equivalent
      } else if (isCancel) {
        this.setIfChanged('keyEquivalent', 'escape') ;
      } else {
        //restore the default key equivalent
        this.set("keyEquivalent",this._defaultKeyEquivalent);
      }
    }
      
  }.observes('isDefault', 'isCancel'),
    
  isMouseDown: false, 

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;

    if (buttonBehavior === SC.HOLD_BEHAVIOR) {
      this._action(evt);
    } else if (!this._isFocused && (buttonBehavior!==SC.PUSH_BEHAVIOR)) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }

    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', NO);
    }
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', YES);
    }
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;

    if (this.get('buttonBehavior') !== SC.HOLD_BEHAVIOR) {
      var inside = this.$().within(evt.target) ;
      if (inside && this.get('isEnabled')) this._action(evt) ;
    }

    return YES ;
  },
  
  touchStart: function(touch){
    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);

    if (buttonBehavior === SC.HOLD_BEHAVIOR) {
      this._action(touch);
    } else if (!this._isFocused && (buttonBehavior!==SC.PUSH_BEHAVIOR)) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }

    // don't want to do whatever default is...
    touch.preventDefault();

    return YES;
  },
  
  touchesDragged: function(evt, touches) {
    if (!this.touchIsInBoundary(evt)) {
      if (!this._touch_exited) this.set('isActive', NO);
      this._touch_exited = YES;
    } else {
      if (this._touch_exited) this.set('isActive', YES);
      this._touch_exited = NO;
    }
    
    evt.preventDefault();
    return YES;
  },
  
  touchEnd: function(touch){
    this._touch_exited = NO;
    this.set('isActive', NO); // track independently in case isEnabled has changed

    if (this.get('buttonBehavior') !== SC.HOLD_BEHAVIOR) {
      if (this.touchIsInBoundary(touch)) this._action();
    }
    
    touch.preventDefault();
    return YES ;
  },
  
  
  /** @private */
  keyDown: function(evt) {
    // handle tab key
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (evt.which === 13) {
      this.triggerAction(evt);
      return YES ; // handled
    }
    return NO; 
  },

  /** @private  Perform an action based on the behavior of the button.
  
   - toggle behavior: switch to on/off state
   - on behavior: turn on.
   - off behavior: turn off.
   - otherwise: invoke target/action
  */
  _action: function(evt, skipHoldRepeat) {
    switch(this.get('buttonBehavior')) {
      
    // When toggling, try to invert like values. i.e. 1 => 0, etc.
    case SC.TOGGLE_BEHAVIOR:
      var sel = this.get('isSelected') ;
      if (sel) {
        this.set('value', this.get('toggleOffValue')) ;
      } else {
        this.set('value', this.get('toggleOnValue')) ;
      }
      break ;
      
    // set value to on.  change 0 => 1.
    case SC.TOGGLE_ON_BEHAVIOR:
      this.set('value', this.get('toggleOnValue')) ;
      break ;
      
    // set the value to false. change 1 => 0
    case SC.TOGGLE_OFF_BEHAVIOR:
      this.set('value', this.get('toggleOffValue')) ;
      break ;

    case SC.HOLD_BEHAVIOR:
      this._runHoldAction(evt, skipHoldRepeat);
      break ;

    // otherwise, just trigger an action if there is one.
    default:
      //if (this.action) this.action(evt);
      this._runAction(evt);
    }
  },

  /** @private */
  _runAction: function(evt) {
    var action = this.get('action'),
        target = this.get('target') || null,
        rootResponder = this.getPath('pane.rootResponder');

    if (action) {
      if (this._hasLegacyActionHandler()) {
        // old school... V
        this._triggerLegacyActionHandler(evt);
      } else {
        if (rootResponder) {
          // newer action method + optional target syntax...
          rootResponder.sendAction(action, target, this, this.get('pane'));
        }
      }
    }
  },

  /** @private */
  _runHoldAction: function(evt, skipRepeat) {
    if (this.get('isActive')) {
      this._runAction();

      if (!skipRepeat) {
        // This run loop appears to only be necessary for testing
        SC.RunLoop.begin();
        this.invokeLater('_runHoldAction', this.get('holdInterval'), evt);
        SC.RunLoop.end();
      }
    }
  },
  
  /** @private */
  _hasLegacyActionHandler: function()
  {
    var action = this.get('action');
    if (action && (SC.typeOf(action) === SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) === SC.T_STRING) && (action.indexOf('.') != -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function( evt )
  {
    if (!this._hasLegacyActionHandler()) return false;
    
    var action = this.get('action');
    if (SC.typeOf(action) === SC.T_FUNCTION) this.action(evt);
    if (SC.typeOf(action) === SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        var elem=this.$()[0];
        if (elem) elem.focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  },
  
  didAppendToDocument: function() {
    if(parseInt(SC.browser.msie, 0)===7 && this.get('useStaticLayout')){
      var layout = this.get('layout'),
          elem = this.$(), w=0;
      if(elem && elem[0] && (w=elem[0].clientWidth) && w!==0 && this._labelMinWidthIE7===0){
        var label = this.$('.sc-button-label'),
            paddingRight = parseInt(label.css('paddingRight'),0),
            paddingLeft = parseInt(label.css('paddingLeft'),0),
            marginRight = parseInt(label.css('marginRight'),0),
            marginLeft = parseInt(label.css('marginLeft'),0);
        if(marginRight=='auto') console.log(marginRight+","+marginLeft+","+paddingRight+","+paddingLeft);
        if(!paddingRight && isNaN(paddingRight)) paddingRight = 0;
        if(!paddingLeft && isNaN(paddingLeft)) paddingLeft = 0;
        if(!marginRight && isNaN(marginRight)) marginRight = 0;
        if(!marginLeft && isNaN(marginLeft)) marginLeft = 0;
        
        this._labelMinWidthIE7 = w-(paddingRight + paddingLeft)-(marginRight + marginLeft);
        label.css('minWidth', this._labelMinWidthIE7+'px');
      }else{
        this.invokeLater(this.didAppendToDocument, 1);
      }
    }
  }
  
}) ;

// ..........................................................
// CONSTANTS
//
SC.TOGGLE_BEHAVIOR = 'toggle';
SC.PUSH_BEHAVIOR =   'push';
SC.TOGGLE_ON_BEHAVIOR = 'on';
SC.TOGGLE_OFF_BEHAVIOR = 'off';
SC.HOLD_BEHAVIOR = 'hold';

/**
  The delay after which "click" behavior should transition to "click and hold"
  behavior. This is used by subclasses such as PopupButtonView and
  SelectButtonView.

  @constant
  @type Number
*/
SC.ButtonView.CLICK_AND_HOLD_DELAY = SC.browser.msie ? 600 : 300;

SC.REGULAR_BUTTON_HEIGHT=24;


/* >>>>>>>>>> BEGIN source/panes/alert.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');
sc_require('views/button');
/** 
  button1 : 1st button from the right. default:OK
  button2 : 2nd button from the right. Optional. Could be Cancel or 2nd action.
  button3 : 1st button from the left. Optional. Could be Cancel or alternative option.
*/
/** 
  Passed to delegate when alert pane is dismissed by pressing button 1
*/
SC.BUTTON1_STATUS = 'button1';

/** 
  Passed to delegate when alert pane is dismissed by pressing button 2
*/
SC.BUTTON2_STATUS = 'button2';

/** 
  Passed to delegate when alert pane is dismissed by pressing button 3
*/
SC.BUTTON3_STATUS = 'button3';

/** @class
  Displays a preformatted modal alert pane.
  
  Alert panes are a simple way to provide modal messaging that otherwise 
  blocks the user's interaction with your application.  Alert panes are 
  useful for showing important error messages and confirmation dialogs.  They
  provide a better user experience than using the OS-level alert dialogs.
  
  h1. Displaying an Alert Pane
  
  The easiest way to display an alert pane is to use one of the various 
  class methods defined on SC.AlertPane, passing the message and an optional
  detailed description and caption.  
  
  There are four variations of this method can you can invoke:  
  
  - *warn()* - displays an alert pane with a warning icon to the left.
  - *error()* - displays an alert with an error icon to the left
  - *info()* - displays an alert with an info icon to the left
  - *plain()* - displays an alert w/o any icon
  - *show()* - displays an alert with a customizable icon to the left
  
  In addition to passing a message, description and caption, you can also customize
  the title of the button 1 (OK) and add an optional button 2 and 3 (Cancel or Extra).  Just
  pass these titles of these buttons to enable them or null to disable then.
  
  Additionally, you can pass a delegate object as the last parameter.  This
  delegate's 'alertPaneDidDismiss()' method will be called when the pane
  is dismissed, passing the pane instance and a key indicating which 
  button was pressed.
  
  h1. Examples
  
  Show a simple AlertPane with an OK button:
  
  {{{
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.");
  }}}
  
  Show an AlertPane with a customized OK title (title will be 'Try Again'):
  
  {{{
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again");
  }}}
  
  Show an AlertPane with a custom OK, a Cancel button and an Extra button, 
  each with custom titles.  Also, pass a delegate that will be invoked when
  the user's dismisses the dialog.
  
  {{{

    MyApp.calendarController = SC.Object.create({
      alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            this.tryAgain();
            break;
            
          case SC.BUTTON2_STATUS:
            // do nothing
            break;
            
          case SC.BUTTON3_STATUS:
            this.showMoreInfo();
            break;
        }
      },
      
      ...
    });
    
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again", "Cancel", "More Info...", MyApp.calendarController);
  }}}
  
  @extends SC.PanelPane
  @since SproutCore 1.0
*/
SC.AlertPane = SC.PanelPane.extend({
  
  classNames: 'sc-alert',
  
  /**
    The delegate to notify when the pane is dismissed.  If you set a 
    delegate, it should respond to the method:
    
    {{{
      alertPaneDidDismiss: function(pane, status)
    }}}
    
    The status will be on of SC.BUTTON1_STATUS, SC.BUTTON2_STATUS or SC.BUTTON3_STATUS
    depending on which button was clicked.
    
    @property {Object}
  */
  delegate: null,

  /**
    The icon URL or class name.  If you do not set this, an alert icon will
    be shown instead.
    
    @property {String}
  */
  icon: 'sc-icon-alert-48',

  /**
    The primary message to display.  This message will appear in large bold
    type at the top of the alert.
    
    @property {String}
  */
  message: "",

  /**
    An optional detailed decription.  Use this string to provide further 
    explanation of the condition and, optionally, ways the user can resolve
    the problem.
    
    @property {String}
  */
  description: "",
  
  displayDescription: function() {
    var desc = this.get('description');
    if (!desc || desc.length === 0) return desc ;
    
    desc = SC.RenderContext.escapeHTML(desc); // remove HTML
    return '<p class="description">' + desc.split('\n').join('</p><p class="description">') + '</p>';
  }.property('description').cacheable(),

  /**
    An optional detailed caption.  Use this string to provide further 
    fine print explanation of the condition and, optionally, ways the user can resolve
    the problem.
    
    @property {String}
  */
  caption: "",
  
  displayCaption: function() {
    var caption = this.get('caption');
    if (!caption || caption.length === 0) return caption ;
    
    caption = SC.RenderContext.escapeHTML(caption); // remove HTML
    return '<p class="caption">' + caption.split('\n').join('</p><p class="caption">') + '</p>';
  }.property('caption').cacheable(),
  
  /**
    The button view for the button 1 (OK).
    
    @property {SC.ButtonView}
  */
  buttonOne: SC.outlet('contentView.childViews.1.childViews.1'),

  /**
    The button view for the button 2 (Cancel).
    
    @property {SC.ButtonView}
  */
  buttonTwo: SC.outlet('contentView.childViews.1.childViews.0'),

  /**
    The button view for the button 3 (Extra).
    
    @property {SC.ButtonView}
  */
  buttonThree: SC.outlet('contentView.childViews.2.childViews.0'),

  /**
    The view for the button 3 (Extra) wrapper.
    
    @property {SC.View}
  */
  buttonThreeWrapper: SC.outlet('contentView.childViews.2'),
  
  layout: { top : 0.3, centerX: 0, width: 500 },

  /** @private - internal view that is actually displayed */
  contentView: SC.View.extend({
    
    useStaticLayout: YES,
    
    layout: { left: 0, right: 0, top: 0, height: "auto" },
		
    childViews: [
      SC.View.extend(SC.StaticLayout, {
        classNames: ['info'],

        render: function(context, firstTime) {
          var pane = this.get('pane');
          var blank = SC.BLANK_IMAGE_URL ;
          if(pane.get('icon') == 'blank') context.addClass('plain');
          context.push('<img src="'+blank+'" class="icon '+pane.get('icon')+'" />');
          context.begin('h1').attr('class', 'header').text(pane.get('message') || '').end();
          context.push(pane.get('displayDescription') || '');
          context.push(pane.get('displayCaption') || '');
          context.push('<div class="separator"></div>');
        }
      }),

      SC.View.extend({
        layout: { bottom: 13, height: 24, right: 18, width: 466 },
        childViews: ['cancelButton', 'okButton'],
        classNames: ['text-align-right'],
        cancelButton : SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON2_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { right: 5, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "Cancel", 
            isCancel: YES,
            action: "dismiss",
            isVisible: NO
          }),

        okButton : SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON1_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "OK", 
            isDefault: YES,
            action: "dismiss"
          })
      }),
      
      SC.View.extend({
        layout: { bottom: 13, height: 24, left: 18, width: 150 },
        isVisible: NO,
        childViews: [
          SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON3_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "Extra", 
            action: "dismiss",
            isVisible: NO
          })]
      })]
  }),

  /**
    Action triggered whenever any button is pressed.  Notifies any delegate
    and then hides the alert pane.
  */
  dismiss: function(sender) {
    var del = this.delegate;
    if (del && del.alertPaneDidDismiss) {
      del.alertPaneDidDismiss(this, sender.get('actionKey'));
    }
    this.remove(); // hide alert
  },
  
  /** @private 
    Executes whenever one of the icon, message, description or caption is changed.
    This simply causes the UI to refresh.
  */
  alertInfoDidChange: function() {
    var v = this.getPath('contentView.childViews.0');
    if (v) v.displayDidChange(); // re-render message
  }.observes('icon', 'message', 'displayDescription', 'displayCaption')
});

/** @private
  internal method normalizes arguments for processing by helper methods.
*/
SC.AlertPane._normalizeArguments = function(args) {
  args = SC.A(args); // convert to real array
  var len = args.length, delegate = args[len-1];
  if (SC.typeOf(delegate) !== SC.T_STRING) {
    args[len-1] = null;
  } else delegate = null ;
  args[7] = delegate ;
  return args ;
};

/**
  Displays a new alert pane according to the passed parameters.  Every 
  parameter except for the message is optional.  You can always pass the 
  delegate as the last parameter and it will be used, even if you omit items
  in between.
  
  If you need to pass other parameters but you want to omit some others 
  in between, pass null and the related UI item will be hidden
  
  Note that if you pass an icon, it should be 48 x 48 in size.
  
  @param {String} message the primary message
  @param {String} description an optional detailed description
  @param {String} caption an optional detailed fine print caption
  @param {String} button1Title optional unlocalized title for button 1 (OK)
  @param {String} button2Title optional unlocalized title for button 2 (Cancel)
  @param {String} button3Title optional unlocalized title for button 3 (extra)
  @param {String} iconUrl optional URL or class name for icon.
  @param {Object} delegate optional delegate to notify when pane is dismissed
  @returns {SC.AlertPane} new alert pane
*/
SC.AlertPane.show = function(message, description, caption, button1Title, button2Title, button3Title, iconUrl, delegate) {
  
  // get the delegate and normalize the rest of the params
  var args = this._normalizeArguments(arguments);
  
  // create basic AlertPane
  var ret = this.create({
    message: args[0] || '',
    description: args[1] || null,
    caption: args[2] || null,
    icon: args[6] || 'sc-icon-alert-48',
    delegate: args[7]
  });
  
  // customize buttons as needed
  var buttonKeys = 'buttonOne buttonTwo buttonThree'.w(), button, title;
  for(var idx=0;idx<3;idx++) {
    button = ret.get(buttonKeys[idx]);
    title = args[idx + 3];
    if (title) {
      button.set('title', title).set('isVisible', YES);
      if(title=='?') button.set('titleMinWidth', 0);
      if (idx==2) {
        var button_wrapper = ret.get('buttonThreeWrapper');
        button_wrapper.set('isVisible', YES);
      }
    }
  }
  var show = ret.append() ; // make visible.
  ret.adjust('height', ret.childViews[0].$().height()) ;
  ret.updateLayout() ;
  return show ;
};

/**
  Displays a warning alert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.warn = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-alert-48';
  return this.show.apply(this, args);
};


/**
  Displays a info alert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.info = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-info-48';
  return this.show.apply(this, args);
};

/**
  Displays a error allert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.error = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-error-48';
  return this.show.apply(this, args);
};

/**
  Displays a plain all-text allert pane w/o icon.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.plain = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'blank';
  return this.show.apply(this, args);
};

/* >>>>>>>>>> BEGIN source/panes/palette.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
  Displays a non-modal, default positioned, drag&drop-able palette pane.

  The default way to use the palette pane is to simply add it to your page like this:
  
  {{{
    SC.PalettePane.create({
      layout: { width: 400, height: 200, right: 0, top: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}
  
  This will cause your palette pane to display.
  
  Palette pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Palette panes are 
  useful for showing important detail informations with flexsible position.
  They provide a better user experience than modal panel.
  
  @extends SC.PanelPane
  @since SproutCore 1.0
*/
SC.PalettePane = SC.PanelPane.extend({
  
  classNames: 'sc-palette',
  
  /** Palettes are not modal by default */
  isModal: NO,
  
  /** Do not show smoke behind palettes */
  modalPane: SC.ModalPane,
  
  isAnchored: NO,
  
  _mouseOffsetX: null,
  _mouseOffsetY: null,

  /** @private - drag&drop palette to new position. */
  mouseDown: function(evt) {
    
    var f=this.get('frame');
    this._mouseOffsetX = f ? (f.x - evt.pageX) : 0;
    this._mouseOffsetY = f ? (f.y - evt.pageY) : 0;
    return YES;
  },

  mouseDragged: function(evt) {
    if(!this.isAnchored) {
      this.set('layout', { width: this.layout.width, height: this.layout.height, left: this._mouseOffsetX + evt.pageX, top: this._mouseOffsetY + evt.pageY });
      this.updateLayout();
    }
    return YES;
  },
  
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchesDragged: function(evt){
    return this.mouseDragged(evt);
  }
  
 
});

/* >>>>>>>>>> BEGIN source/panes/picker.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('panes/palette');

/** 
  Popular customized picker position rules:
  default: initiated just below the anchor. 
           shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  menu :   same as default rule +
           default(1,4,3) or custom offset below the anchor for default location to fine tunned visual alignment +
           enforce min left(7px)/right(8px) padding to the window
  fixed :  default(1,4,3) or custom offset below the anchor for default location to cope with specific anchor and skip fitPositionToScreen
  pointer :take default [0,1,2,3,2] or custom matrix to choose one of four perfect pointer positions.Ex:
           perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
           fallback to perfect top (2)
  menu-pointer :take default [3,0,1,2,3] or custom matrix to choose one of four perfect pointer positions.Ex:
          perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
          fallback to perfect bottom (3)
*/
SC.PICKER_MENU = 'menu';
SC.PICKER_FIXED = 'fixed';
SC.PICKER_POINTER = 'pointer';
SC.PICKER_MENU_POINTER = 'menu-pointer';
/** 
  Pointer layout for perfect right/left/top/bottom
*/
SC.POINTER_LAYOUT = ["perfectRight", "perfectLeft", "perfectTop", "perfectBottom"];

/**
  @class

  Displays a non-modal, self anchor positioned picker pane.

  The default way to use the picker pane is to simply add it to your page like this:
  
  {{{
    SC.PickerPane.create({
      layout: { width: 400, height: 200 },
      contentView: SC.View.extend({
      })
    }).popup(anchor);
  }}}
  
  This will cause your picker pane to display.
  
  Picker pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Picker panes are 
  useful for showing important detail informations with optimized position around anchor.
  They provide a better user experience than modal panel.

  Examples for applying popular customized picker position rules:
  
  1. default:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor);
  }}}

  2. menu below the anchor with default offset matrix [1,4,3]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU);
  }}}

  3. menu on the right side of anchor with custom offset matrix [2,6,0]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU, [2,6,0]);
  }}}

  4. fixed below the anchor with default offset matrix [1,4,3]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_FIXED);
  }}}

  5. fixed on the right side of anchor with custom offset matrix [-22,-17,0]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_FIXED, [-22,-17,0]);
  }}}

  6. pointer with default position pref matrix [0,1,2,3,2]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_POINTER);
  }}}
  perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
  fallback to perfect top (2)

  7. pointer with custom position pref matrix [3,0,1,2,2]:   
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_POINTER, [3,0,1,2,2]);
  }}}

  perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
  fallback to perfect top (2)

  8. menu-pointer with default position pref matrix [3,0,1,2,3]:
  {{{
    SC.PickerPane.create({layout: { width: 400, height: 200 },contentView: SC.View.extend({})
    }).popup(anchor, SC.PICKER_MENU_POINTER);
  }}}
  perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
  fallback to perfect bottom (3)
  
  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend({
  
  classNames: 'sc-picker',
  isAnchored: YES,
  
  isModal: YES,
  
  pointerPos: 'perfectRight',
  pointerPosX: 0,
  pointerPosY: 0,
  
  /**
    This property will be set to the element (or view.get('layer')) that 
    triggered your picker to show.  You can use this to properly position your 
    picker.
    
    @property {Object}
  */
  anchorElement: null,

  /**
    anchor rect calculated by computeAnchorRect from init popup

    @property {Hash}
  */
  anchorCached: null,
  
  /**
    popular customized picker position rule
    
    @property {String}
  */
  preferType: null,
  
  /**
    default/custom offset or position pref matrix for specific preferType
    
    @property {String}
  */
  preferMatrix: null,

  /**
    default/custom offset of pointer for picker-pointer or pointer-menu

    @property {Array}
  */
  pointerOffset: null,

  /**
    default offset of extra-right pointer for picker-pointer or pointer-menu

    @property Number
  */
  extraRightOffset: 0,

  /**
    Displays a new picker pane according to the passed parameters.
    Every parameter except for the anchorViewOrElement is optional.
  
    @param {Object} anchorViewOrElement view or element to anchor to
    @param {String} preferType optional apply picker position rule
    @param {Array} preferMatrix optional apply custom offset or position pref matrix for specific preferType
    @returns {SC.PickerPane} receiver
  */
  popup: function(anchorViewOrElement, preferType, preferMatrix, pointerOffset) {
    var anchor;
    if(anchorViewOrElement){
      anchor = anchorViewOrElement.isView ? anchorViewOrElement.get('layer') : anchorViewOrElement;
    }
    this.beginPropertyChanges();
    this.set('anchorElement',anchor) ;
    if (preferType) this.set('preferType',preferType) ;
    if (preferMatrix) this.set('preferMatrix',preferMatrix) ;
    if (pointerOffset) this.set('pointerOffset',pointerOffset) ;
    this.endPropertyChanges();
    this.positionPane();
    this.append();
  },

  /** @private
    The ideal position for a picker pane is just below the anchor that 
    triggered it + offset of specific preferType. Find that ideal position, 
    then call fitPositionToScreen to get final position. If anchor is missing, 
    fallback to center.
  */  
  positionPane: function(useAnchorCached) {
    var useAnchorCached = useAnchorCached && this.get('anchorCached'),
        anchor       = useAnchorCached ? this.get('anchorCached') : this.get('anchorElement'),
        preferType   = this.get('preferType'),
        preferMatrix = this.get('preferMatrix'),
        layout       = this.get('layout'),
        origin;
    
    // usually an anchorElement will be passed.  The ideal position is just 
    // below the anchor + default or custom offset according to preferType.
    // If that is not possible, fitPositionToScreen will take care of that for 
    // other alternative and fallback position.
    if (anchor) {
      if(!useAnchorCached) {
        anchor = this.computeAnchorRect(anchor);
        this.set('anchorCached', anchor) ;
      }
      if(anchor.x ===0 && anchor.y ===0) return ;
      origin = SC.cloneRect(anchor);

      if (preferType) {
        switch (preferType) {
          case SC.PICKER_MENU:
          case SC.PICKER_FIXED:
            if(!preferMatrix || preferMatrix.length !== 3) {
              // default below the anchor with fine tunned visual alignment 
              // for Menu to appear just below the anchorElement.
              this.set('preferMatrix', [1, 4, 3]) ;
            }

            // fine tunned visual alignment from preferMatrix
            origin.x += ((this.preferMatrix[2]===0) ? origin.width : 0) + this.preferMatrix[0] ;
            origin.y += ((this.preferMatrix[2]===3) ? origin.height : 0) + this.preferMatrix[1];    
            break;
          default:
            origin.y += origin.height ;
            break;
        }   
      } else {
        origin.y += origin.height ;
      }
      origin = this.fitPositionToScreen(origin, this.get('frame'), anchor) ;

      this.adjust({ width: origin.width, height: origin.height, left: origin.x, top: origin.y });
    // if no anchor view has been set for some reason, just center.
    } else {
      this.adjust({ width: layout.width, height: layout.height, centerX: 0, centerY: 0 });
    }
    this.updateLayout();
    return this ;
  },

  /** @private
    This method will return ret (x, y, width, height) from a rectangular element
    Notice: temp hack for calculating visiable anchor height by counting height 
    up to window bottom only. We do have 'clippingFrame' supported from view.
    But since our anchor can be element, we use this solution for now.
  */  
  computeAnchorRect: function(anchor) {
    var bounding, ret, cq,
        wsize = SC.RootResponder.responder.computeWindowSize();
    // Some browsers natively implement getBoundingClientRect, so if it's
    // available we'll use it for speed.
    if (anchor.getBoundingClientRect) {
      // Webkit and Firefox 3.5 will get everything they need by
      // calling getBoundingClientRect()
      bounding = anchor.getBoundingClientRect();
      ret = {
        x:      bounding.left,
        y:      bounding.top,
        width:  bounding.width,
        height: bounding.height
      };
      // If width and height are undefined this means we are in IE or FF<3.5
      // if we didnt get the frame dimensions the do the calculations
      // based on an element
      if(ret.width===undefined || ret.height===undefined){
        cq = SC.$(anchor);
        ret.width = cq.outerWidth();
        ret.height = cq.outerHeight();
      }
    }
    else {
      // Only really old versions will have to go through this code path.
      ret   = SC.viewportOffset(anchor); // get x & y
      cq    = SC.$(anchor);
      ret.width = cq.outerWidth();
      ret.height = cq.outerHeight();
    }
    ret.height = (wsize.height-ret.y) < ret.height ? (wsize.height-ret.y) : ret.height;
    if(!SC.browser.msie && window.scrollX>0 || window.scrollY>0){
      ret.x+=window.scrollX;
      ret.y+=window.scrollY;
    }else if(SC.browser.msie && (document.documentElement.scrollTop>0 || document.documentElement.scrollLeft>0)){
      ret.x+=document.documentElement.scrollLeft;
      ret.y+=document.documentElement.scrollTop;
    }
    return ret ;
  },

  /** @private
    This method will dispatch to the right re-position rule according to preferType
  */  
  fitPositionToScreen: function(preferredPosition, picker, anchor) {
    // get window rect.
    //if(this._prefPosX && this._prefPosY)
    
    var wsize = SC.RootResponder.responder.computeWindowSize(),
        wret = { x: 0, y: 0, width: wsize.width, height: wsize.height } ;
        
    picker.x = preferredPosition.x ; picker.y = preferredPosition.y ;

    if(this.preferType) {
      switch(this.preferType) {
        case SC.PICKER_MENU:
          // apply menu re-position rule
          picker = this.fitPositionToScreenMenu(wret, picker, this.get('isSubMenu')) ;
          break;
        case SC.PICKER_MENU_POINTER:
          this.setupPointer(anchor);
          picker = this.fitPositionToScreenMenuPointer(wret, picker, anchor);
          break;
        case SC.PICKER_POINTER:
          // apply pointer re-position rule
          this.setupPointer(anchor);
          picker = this.fitPositionToScreenPointer(wret, picker, anchor) ;
          break;
          
        case SC.PICKER_FIXED:
          // skip fitPositionToScreen
          break;
        default:
          break;
      }     
    } else {
      // apply default re-position rule
      picker = this.fitPositionToScreenDefault(wret, picker, anchor) ;
    }
    this.displayDidChange();
    this._hideOverflow();
    return picker ;
  },

  /** @private
    re-position rule migrated from old SC.OverlayPaneView. 
    shift x, y to optimized picker visibility and make sure top-left corner is always visible.
  */
  fitPositionToScreenDefault: function(w, f, a) {
    // make sure the right edge fits on the screen.  If not, anchor to 
    // right edge of anchor or right edge of window, whichever is closer.
    if (SC.maxX(f) > w.width) {
      var mx = Math.max(SC.maxX(a), f.width) ;
      f.x = Math.min(mx, w.width) - f.width ;
    }

    // if the left edge is off of the screen, try to position at left edge
    // of anchor.  If that pushes right edge off screen, shift back until 
    // right is on screen or left = 0
    if (SC.minX(f) < 0) {
      f.x = SC.minX(Math.max(a,0)) ;
      if (SC.maxX(f) > w.width) {
        f.x = Math.max(0, w.width - f.width);
      }
    }

    // make sure bottom edge fits on screen.  If not, try to anchor to top
    // of anchor or bottom edge of screen.
    if (SC.maxY(f) > w.height) {
      mx = Math.max((a.y - f.height), 0) ;
      if (mx > w.height) {
        f.y = Math.max(0, w.height - f.height) ;
      } else f.y = mx ;
    }

    // if Top edge is off screen, try to anchor to bottom of anchor. If that
    // pushes off bottom edge, shift up until it is back on screen or top =0
    if (SC.minY(f) < 0) {
      mx = Math.min(SC.maxY(a), (w.height - a.height)) ;
      f.y = Math.max(mx, 0) ;
    }
    return f ;    
  },

  /** @private
    Reposition the pane in a way that is optimized for menus.

    Specifically, we want to ensure that the pane is at least 7 pixels from
    the left side of the screen, and 20 pixels from the right side.

    If the menu is a submenu, we also want to reposition the pane to the left
    of the parent menu if it would otherwise exceed the width of the viewport.
  */
  fitPositionToScreenMenu: function(windowFrame, paneFrame, subMenu) {

    // Set up init location for submenu
    if (subMenu) {
      paneFrame.x -= this.get('submenuOffsetX');
      paneFrame.y -= Math.floor(this.get('menuHeightPadding')/2);
    }

    // If the right edge of the pane is within 20 pixels of the right edge
    // of the window, we need to reposition it.
    if( (paneFrame.x + paneFrame.width) > (windowFrame.width-20) ) {
      if (subMenu) {
        // Submenus should be re-anchored to the left of the parent menu
        paneFrame.x = paneFrame.x - (paneFrame.width*2);
      } else {
        // Otherwise, just position the pane 20 pixels from the right edge
        paneFrame.x = windowFrame.width - paneFrame.width - 20;
      }
    }

    // Make sure we are at least 7 pixels from the left edge of the screen.
    if( paneFrame.x < 7 ) paneFrame.x = 7;
    
    if (paneFrame.y < 7) {
      paneFrame.height += paneFrame.y;
      paneFrame.y = 7;
    }

    // If the height of the menu is bigger than the window height, resize it.
    if( paneFrame.height+paneFrame.y+35 >= windowFrame.height){
      if (paneFrame.height+50 >= windowFrame.height) {
        paneFrame.y = SC.MenuPane.VERTICAL_OFFSET;
        paneFrame.height = windowFrame.height - (SC.MenuPane.VERTICAL_OFFSET*2);
      } else {
        paneFrame.y += (windowFrame.height - (paneFrame.height+paneFrame.y+35));
      }
    }

    return paneFrame ;
  },

  /** @private
    Reposition the pane in a way that is optimized for menus that have a
    point element.

    This simply calls fitPositionToScreenPointer, then ensures that the menu
    does not exceed the height of the viewport.

    @returns {Rect}
  */
  fitPositionToScreenMenuPointer: function(w, f, a) {
    f = this.fitPositionToScreenPointer(w,f,a);

    // If the height of the menu is bigger than the window height, resize it.
    if( f.height+f.y+35 >= w.height){
        f.height = w.height - f.y - (SC.MenuPane.VERTICAL_OFFSET*2) ;
    }

    return f;
  },

  /** @private
    re-position rule for triangle pointer picker.
  */
  fitPositionToScreenPointer: function(w, f, a) {
    var offset = [this.pointerOffset[0], this.pointerOffset[1],
                  this.pointerOffset[2], this.pointerOffset[3]];
                  
    // initiate perfect positions matrix
    // 4 perfect positions: right > left > top > bottom
    // 2 coordinates: x, y
    // top-left corner of 4 perfect positioned f  (4x2)
    var prefP1    =[[a.x+a.width+offset[0],                   a.y+parseInt(a.height/2,0)-40],
                    [a.x-f.width+offset[1],                   a.y+parseInt(a.height/2,0)-40],
                    [a.x+parseInt((a.width/2)-(f.width/2),0), a.y-f.height+offset[2]],
                    [a.x+parseInt((a.width/2)-(f.width/2),0), a.y+a.height+offset[3]]];
    // bottom-right corner of 4 perfect positioned f  (4x2)
    var prefP2    =[[a.x+a.width+f.width+offset[0],                   a.y+parseInt(a.height/2,0)+f.height-24],
                    [a.x+offset[1],                                   a.y+parseInt(a.height/2,0)+f.height-24],
                    [a.x+parseInt((a.width/2)-(f.width/2),0)+f.width, a.y+offset[2]],
                    [a.x+parseInt((a.width/2)-(f.width/2),0)+f.width, a.y+a.height+f.height+offset[3]]];
    // cutoff of 4 perfect positioned f: top, right, bottom, left  (4x4)
    var cutoffPrefP =[[prefP1[0][1]>0 ? 0 : 0-prefP1[0][1], prefP2[0][0]<w.width ? 0 : prefP2[0][0]-w.width, prefP2[0][1]<w.height ? 0 : prefP2[0][1]-w.height, prefP1[0][0]>0 ? 0 : 0-prefP1[0][0]], 
                      [prefP1[1][1]>0 ? 0 : 0-prefP1[1][1], prefP2[1][0]<w.width ? 0 : prefP2[1][0]-w.width, prefP2[1][1]<w.height ? 0 : prefP2[1][1]-w.height, prefP1[1][0]>0 ? 0 : 0-prefP1[1][0]],
                      [prefP1[2][1]>0 ? 0 : 0-prefP1[2][1], prefP2[2][0]<w.width ? 0 : prefP2[2][0]-w.width, prefP2[2][1]<w.height ? 0 : prefP2[2][1]-w.height, prefP1[2][0]>0 ? 0 : 0-prefP1[2][0]],
                      [prefP1[3][1]>0 ? 0 : 0-prefP1[3][1], prefP2[3][0]<w.width ? 0 : prefP2[3][0]-w.width, prefP2[3][1]<w.height ? 0 : prefP2[3][1]-w.height, prefP1[3][0]>0 ? 0 : 0-prefP1[3][0]]];

    var m = this.preferMatrix;

    // initiated with fallback position
    // Will be used only if the following preferred alternative can not be found
    if(m[4] === -1) {
      //f.x = a.x>0 ? a.x+23 : 0; // another alternative align to left
      f.x = a.x+parseInt(a.width/2,0);
      f.y = a.y+parseInt(a.height/2,0)-parseInt(f.height/2,0);
      this.set('pointerPos', SC.POINTER_LAYOUT[0]+' fallback');
      this.set('pointerPosY', parseInt(f.height/2,0)-40);      
    } else {
      f.x = prefP1[m[4]][0];
      f.y = prefP1[m[4]][1];
      this.set('pointerPos', SC.POINTER_LAYOUT[m[4]]);
      this.set('pointerPosY', 0);      
    }
    this.set('pointerPosX', 0);

    for(var i=0, cM, pointerLen=SC.POINTER_LAYOUT.length; i<pointerLen; i++) {
      cM = m[i];
      if (cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2]===0 && cutoffPrefP[cM][3]===0) {
        // alternative i in preferMatrix by priority
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
          f.y = prefP1[cM][1] ;
          this.set('pointerPosY', 0);
          this.set('pointerPos', SC.POINTER_LAYOUT[cM]);
        }
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 0 || cM === 1) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] < f.height-91 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
          this.set('pointerPos', SC.POINTER_LAYOUT[cM]);
        }
        f.y = prefP1[cM][1] - cutoffPrefP[cM][2];
        this.set('pointerPosY', cutoffPrefP[cM][2]);
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 0 || cM === 1) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] <= f.height-51 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.x = prefP1[cM][0] ;
        }
        f.y = prefP1[cM][1] - (f.height-51) ;
        this.set('pointerPosY', (f.height-53));
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-low');
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 2 || cM === 3) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]<= parseInt(f.width/2,0)-this.get('extraRightOffset') && cutoffPrefP[cM][2] ===0 && cutoffPrefP[cM][3]===0) {
        if (m[4] !== cM) {
          f.y = prefP1[cM][1] ;
        }
        f.x = prefP1[cM][0] - (parseInt(f.width/2,0)-this.get('extraRightOffset')) ;
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-right');
        i = SC.POINTER_LAYOUT.length;
      } else if ((cM === 2 || cM === 3) && cutoffPrefP[cM][0]===0 && cutoffPrefP[cM][1]===0 && cutoffPrefP[cM][2] ===0 && cutoffPrefP[cM][3]<= parseInt(f.width/2,0)-this.get('extraRightOffset')) {
        if (m[4] !== cM) {
          f.y = prefP1[cM][1] ;
        }
        f.x = prefP1[cM][0] + (parseInt(f.width/2,0)-this.get('extraRightOffset')) ;
        this.set('pointerPos', SC.POINTER_LAYOUT[cM]+' extra-left');
        i = SC.POINTER_LAYOUT.length;
      }
    }
    return f ;    
  },
  
  /** @private
    This method will set up pointerOffset and preferMatrix according to type
    and size if not provided explicitly.
  */
  setupPointer: function(a) {
    var pointerOffset = this.pointerOffset,
        K             = SC.PickerPane;
    
    // set up pointerOffset according to type and size if not provided explicitly
    if (!pointerOffset || pointerOffset.length !== 4) {
      if (this.get('preferType') == SC.PICKER_MENU_POINTER) {
        switch (this.get('controlSize')) {
          case SC.TINY_CONTROL_SIZE:
            this.set('pointerOffset',    K.TINY_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.SMALL_CONTROL_SIZE:
            this.set('pointerOffset',    K.SMALL_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.REGULAR_CONTROL_SIZE:
            this.set('pointerOffset',    K.REGULAR_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.LARGE_CONTROL_SIZE:
            this.set('pointerOffset',    K.LARGE_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
          case SC.HUGE_CONTROL_SIZE:
            this.set('pointerOffset',    K.HUGE_PICKER_MENU_POINTER_OFFSET) ;
            this.set('extraRightOffset', K.HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET) ;
            break;
        }
      }
      else {
        var overlapTuningX = (a.width < 16)  ? ((a.width < 4)  ? 9 : 6) : 0,
            overlapTuningY = (a.height < 16) ? ((a.height < 4) ? 9 : 6) : 0,
            offsetKey      = K.PICKER_POINTER_OFFSET;

        var offset = [offsetKey[0]+overlapTuningX,
                      offsetKey[1]-overlapTuningX,
                      offsetKey[2]-overlapTuningY,
                      offsetKey[3]+overlapTuningY];
        this.set('pointerOffset', offset) ;
        this.set('extraRightOffset', K.PICKER_EXTRA_RIGHT_OFFSET) ;
      }
    }

    // set up preferMatrix according to type if not provided excplicitly:
    // take default [0,1,2,3,2] for picker, [3,0,1,2,3] for menu picker if
    // custom matrix not provided excplicitly
    if(!this.preferMatrix || this.preferMatrix.length !== 5) {
      // menu-picker default re-position rule :
      // perfect bottom (3) > perfect right (0) > perfect left (1) > perfect top (2)
      // fallback to perfect bottom (3)
      // picker default re-position rule :
      // perfect right (0) > perfect left (1) > perfect top (2) > perfect bottom (3)
      // fallback to perfect top (2)
      this.set('preferMatrix', this.get('preferType') == SC.PICKER_MENU_POINTER ? [3,0,1,2,3] : [0,1,2,3,2]) ;
    }
  },
  
  displayProperties: ["pointerPosY"],

  render: function(context, firstTime) {
    var ret = arguments.callee.base.apply(this,arguments);
    if (context.needsContent) {
      if (this.get('preferType') == SC.PICKER_POINTER || this.get('preferType') == SC.PICKER_MENU_POINTER) {
        context.push('<div class="sc-pointer '+this.get('pointerPos')+'" style="margin-top: '+this.get('pointerPosY')+'px"></div>');
        context.addClass(this.get('pointerPos'));
      }
    } else {
      if (this.get('preferType') == SC.PICKER_POINTER || this.get('preferType') == SC.PICKER_MENU_POINTER) {
        var el = this.$('.sc-pointer');
        el.attr('class', "sc-pointer "+this.get('pointerPos'));
        el.attr('style', "margin-top: "+this.get('pointerPosY')+"px");
        context.addClass(this.get('pointerPos'));
      }
    }
    return ret ;
  },
  
  /** @private - click away picker. */
  modalPaneDidClick: function(evt) {
    var f = this.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return YES ; 
  },

  mouseDown: function(evt) {
    return this.modalPaneDidClick(evt);
  },
  
  /** @private
    internal method to define the range for clicking inside so the picker 
    won't be clicked away default is the range of contentView frame. 
    Over-write for adjustments. ex: shadow
  */
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
  },

  /** 
    Invoked by the root responder. Re-position picker whenever the window resizes. 
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.positionPane();
  },
  
  
  remove: function(){
    this._showOverflow();
    return arguments.callee.base.apply(this,arguments);
  },
  
  _hideOverflow: function(){
    var body = SC.$(document.body),
        main = SC.$('.sc-main'),
        minWidth = parseInt(main.css('minWidth'),0),
        minHeight = parseInt(main.css('minHeight'),0),
        windowSize = SC.RootResponder.responder.get('currentWindowSize');
    if(windowSize.width>=minWidth && windowSize.height>=minHeight){
      body.css('overflow', 'hidden');           
    }
  },

  _showOverflow: function(){
    var body = SC.$(document.body);
    body.css('overflow', 'visible');     
  }
});

/**
  Default metrics for the different control sizes.
*/
SC.PickerPane.PICKER_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.PICKER_EXTRA_RIGHT_OFFSET = 20;

SC.PickerPane.TINY_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.TINY_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

SC.PickerPane.SMALL_PICKER_MENU_POINTER_OFFSET = [9, -9, -8, 8];
SC.PickerPane.SMALL_PICKER_MENU_EXTRA_RIGHT_OFFSET = 11;

SC.PickerPane.REGULAR_PICKER_MENU_POINTER_OFFSET = [9, -9, -12, 12];
SC.PickerPane.REGULAR_PICKER_MENU_EXTRA_RIGHT_OFFSET = 13;

SC.PickerPane.LARGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -16, 16];
SC.PickerPane.LARGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 17;

SC.PickerPane.HUGE_PICKER_MENU_POINTER_OFFSET = [9, -9, -18, 18];
SC.PickerPane.HUGE_PICKER_MENU_EXTRA_RIGHT_OFFSET = 12;

/* >>>>>>>>>> BEGIN source/views/separator.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  @class

  Displays a horizontal or vertical separator line.  Simply create one of 
  these views and configure the layout direction and layout frame.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.SeparatorView = SC.View.extend(
/** @scope SC.SeparatorView.prototype */ {

  classNames: ['sc-separator-view'],
  tagName: 'span',

  /** 
    Select the direction of the separator line.  Must be one of SC.LAYOUT_VERTICAL or SC.LAYOUT_HORIZONTAL.
    
    @property {String}
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,

  render: function(context, firstTime) {
    if(firstTime) context.push('<span></span>');
	  context.addClass(this.get('layoutDirection'));
  }



});

/* >>>>>>>>>> BEGIN source/views/menu_item.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/button') ;
sc_require('views/separator') ;

/**
  @class

  An SC.MenuItemView is created for every item in a menu.

  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.View.extend(SC.ContentDisplay,
/** @scope SC.MenuItemView.prototype */{

  displayProperties: ['title', 'isEnabled', 'isSeparator'],

  classNames: ['sc-menu-item'],

  escapeHTML: YES,

  /**
    @private
    @property
    @type {Boolean}
  */
  acceptsFirstResponder: YES,
  
  /**
    IE only attribute to block bluring of other controls

    @type Boolean
  */
  blocksIEDeactivate: YES,

  /**
    Disable context menu.
  */
  isContextMenuEnabled: NO,

  // ..........................................................
  // KEY PROPERTIES
  //

  /**
    The content object the menu view will display.

    @type Object
  */
  content: null,

  /**
    YES if this menu item represents a separator.

    @property {Boolean}
  */
  isSeparator: function() {
    return this.getContentProperty('itemSeparatorKey') === YES;
  }.property('content').cacheable(),

  /**
    Whether the menu item is enabled.

    @property {Boolean}
  */
  isEnabled: function() {
    return this.getContentProperty('itemIsEnabledKey') !== NO &&
           this.getContentProperty('itemSeparatorKey') !== YES;
  }.property('content.isEnabled').cacheable(),

  /**
    This menu item's submenu, if it exists.

    @property {SC.MenuView}
  */
  subMenu: function() {
    var content = this.get('content'), menuItems, parentMenu;

    if (!content) return null;

    parentMenu = this.get('parentMenu');
    menuItems = content.get(parentMenu.itemSubMenuKey );
    if (menuItems) {
      if (SC.kindOf(menuItems, SC.MenuPane)) {
        menuItems.set('isModal', NO);
        menuItems.set('isSubMenu', YES);
        menuItems.set('parentMenu', parentMenu);
        return menuItems;
      } else {
        return SC.MenuPane.create({
          layout: { width: 200 },
          items: menuItems,
          isModal: NO,
          isSubMenu: YES,
          parentMenu: parentMenu,
          controlSize: parentMenu.get('controlSize')
        });
      }
    }

    return null;
  }.property('content').cacheable(),

  /**
    Whether or not this menu item has a submenu.

    @property {Boolean}
  */
  hasSubMenu: function() {
    return !!this.get('subMenu');
  }.property('subMenu').cacheable(),

  /**
    @private
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.contentDidChange();
  },

  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.

    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var content = this.get('content'),
        key, val,
        menu = this.get('parentMenu'),
        itemWidth = this.get('itemWidth') || menu.layout.width,
        itemHeight = this.get('itemHeight') || SC.DEFAULT_MENU_ITEM_HEIGHT ;
    this.set('itemWidth',itemWidth);
    this.set('itemHeight',itemHeight);

    context = context.begin('a').addClass('menu-item');

    if (content.get(menu.itemSeparatorKey)) {
      context.push('<span class="separator"></span>');
      context.addClass('disabled');
    } else {
      val = content.get(menu.itemIconKey);
      if (val) {
        this.renderImage(context, val);
        context.addClass('has-icon');
      }

      val = this.get('title');
      if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
      this.renderLabel(context, val);

      if (this.getContentProperty('itemCheckboxKey')) {
        context.push('<div class="checkbox"></div>');
      }

      if (this.get('hasSubMenu')) {
        this.renderBranch(context);
      }

      val = this.getContentProperty('itemShortCutKey');
      if (val) {
        this.renderShortcut(context, val);
      }
    }

    context = context.end();
  },

  /**
   Generates the image used to represent the image icon. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the source path of the image
   @returns {void}
  */
  renderImage: function(context, image) {
    // get a class name and url to include if relevant

    var url, className ;
    if (image && SC.ImageView.valueIsUrl(image)) {
      url = image ;
      className = '' ;
    } else {
      className = image ;
      url = SC.BLANK_IMAGE_URL;
    }
    // generate the img element...
    context.begin('img').addClass('image').addClass(className).attr('src', url).end() ;
  },

  /**
   Generates the label used to represent the menu item. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} menu item name
   @returns {void}
  */

  renderLabel: function(context, label) {
    if (this.get('escapeHTML')) {
      label = SC.RenderContext.escapeHTML(label) ;
    }
    context.push("<span class='value ellipsis'>"+label+"</span>") ;
  },

  /**
   Generates the string used to represent the branch arrow. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @returns {void}
  */

  renderBranch: function(context) {
    context.push('<span class="has-branch"></span>') ;
  },

  /**
   Generates the string used to represent the short cut keys. override this to
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the shortcut key string to be displayed with menu item name
   @returns {void}
  */
  renderShortcut: function(context, shortcut) {
    context.push('<span class = "shortcut">' + shortcut + '</span>') ;
  },

  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordignly.

    @param {}
    @returns void
  */
  showSubMenu: function() {
    var subMenu = this.get('subMenu') ;
    if(subMenu) {
      subMenu.set('mouseHasEntered', NO);
      subMenu.popup(this,[0,0,0]) ;
    }

    this._subMenuTimer = null;
  },

  title: function() {
    var ret = this.getContentProperty('itemTitleKey'),
        localize = this.getPath('parentMenu.localize');

    if (localize && ret) ret = ret.loc();

    return ret||'';
  }.property('content.title').cacheable(),

  getContentProperty: function(property) {
    var content = this.get('content'),
        menu = this.get('parentMenu');

    if (content) {
      return content.get(menu.get(property));
    }
  },

  //..........................................
  // Mouse Events Handling
  //

  mouseUp: function(evt) {
    // SproutCore's event system will deliver the mouseUp event to the view
    // that got the mouseDown event, but for menus we want to track the mouse,
    // so we'll do our own dispatching.
    var targetMenuItem;

    targetMenuItem = this.getPath('parentMenu.rootMenu.targetMenuItem');

    if (targetMenuItem) targetMenuItem.performAction();
    return YES ;
  },

  /** @private
    Called on mouse down to send the action to the target.

    This method will start flashing the menu item to indicate to the user that
    their selection has been received, unless disableMenuFlash has been set to
    YES on the menu item.

    @returns {Boolean}
  */
  performAction: function() {
    // Disabled menu items and menu items with submenus should not have
    // actions.
    if (!this.get('isEnabled')||this.get('hasSubMenu')) return NO;

    var disableFlash = this.getContentProperty('itemDisableMenuFlashKey'),
        menu;

    if (disableFlash) {
      // Menu flashing has been disabled for this menu item, so perform
      // the action immediately.
      this.sendAction();
    } else {
      // Flash the highlight of the menu item to indicate selection,
      // then actually send the action once its done.
      this._flashCounter = 0;

      // Set a flag on the root menu to indicate that we are in a
      // flashing state. In the flashing state, no other menu items
      // should become selected.
      menu = this.getPath('parentMenu.rootMenu');
      menu._isFlashing = YES;
      this.invokeLater(this.flashHighlight, 25);
      this.invokeLater(this.sendAction, 150);
    }

    return YES;
  },

  /**
    Actually sends the action of the menu item to the target.
    @private
  */
  sendAction: function() {
    var action = this.getContentProperty('itemActionKey'),
        target = this.getContentProperty('itemTargetKey'),
        rootMenu = this.getPath('parentMenu.rootMenu'),
        responder;

    // Close the menu
    this.getPath('parentMenu.rootMenu').remove();
    // We're no longer flashing
    rootMenu._isFlashing = NO;

    action = (action === undefined) ? rootMenu.get('action') : action;
    target = (target === undefined) ? rootMenu.get('target') : target;

    // Notify the root menu pane that the selection has changed
    rootMenu.set('selectedItem', this.get('content'));

    // Legacy support for actions that are functions
    if (SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [rootMenu]);
      //@if(debug)
      SC.Logger.warn('Support for menu item action functions has been deprecated. Please use target and action.');
      //@endif
    } else {
      responder = this.getPath('pane.rootResponder') || SC.RootResponder.responder;

      if (responder) {
        // Send the action down the responder chain
        responder.sendAction(action, target, this);
      }
    }

  },

  /**
    Toggles the focus class name on the menu item layer to quickly flash the
    highlight. This indicates to the user that a selection has been made.

    This is initially called by performAction(). flashHighlight then keeps
    track of how many flashes have occurred, and calls itself until a maximum
    has been reached.

    @private
  */
  flashHighlight: function() {
    var flashCounter = this._flashCounter, layer = this.$();
    if (flashCounter % 2 === 0) {
      layer.addClass('focus');
    } else {
      layer.removeClass('focus');
    }

    if (flashCounter <= 2) {
      this.invokeLater(this.flashHighlight, 50);
      this._flashCounter++;
    }
  },

  /** @private*/
  mouseDown: function(evt) {
    return YES ;
  },

  /** @private */
  mouseEntered: function(evt) {
    var menu = this.get('parentMenu'),
        rootMenu = menu.get('rootMenu');

    // Ignore mouse entering if we're in the middle of
    // a menu flash.
    if (rootMenu._isFlashing) return;

    menu.set('mouseHasEntered', YES);
    this.set('mouseHasEntered', YES);
    menu.set('currentMenuItem', this);

    // Become first responder to show highlight
    if (this.get('isEnabled')) {
      this.becomeFirstResponder();
    }

    if(this.get('hasSubMenu')) {
      this._subMenuTimer = this.invokeLater(this.showSubMenu,100) ;
    }
	  return YES ;
  },

  /** @private
    Set the focus based on whether the current menu item is selected or not.

    @returns Boolean
  */
  mouseExited: function(evt) {
    var parentMenu, timer;

    // If we have a submenu, we need to give the user's mouse time to get
    // to the new menu before we remove highlight.
    if (this.get('hasSubMenu')) {
      // If they are exiting the view before we opened the submenu,
      // make sure we don't open it once they've left.
      timer = this._subMenuTimer;
      if (timer) {
        timer.invalidate();
      } else {
        this.invokeLater(this.checkMouseLocation, 100);
      }
    } else {
      parentMenu = this.get('parentMenu');

      if (parentMenu.get('currentMenuItem') === this) {
        parentMenu.set('currentMenuItem', null);
      }
    }

    return YES ;
  },

  touchStart: function(evt){
    this.mouseEntered(evt);
    return YES;
  },

  touchEnd: function(evt){
    return this.mouseUp(evt);
  },

  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },

  touchExited: function(evt){
    return this.mouseExited(evt);
  },

  checkMouseLocation: function() {
    var subMenu = this.get('subMenu'), parentMenu = this.get('parentMenu'),
        currentMenuItem, previousMenuItem;

    if (!subMenu.get('mouseHasEntered')) {
      currentMenuItem = parentMenu.get('currentMenuItem');
      if (currentMenuItem === this || currentMenuItem === null) {
        previousMenuItem = parentMenu.get('previousMenuItem');

        if (previousMenuItem) {
          previousMenuItem.resignFirstResponder();
        }
        this.resignFirstResponder();
        subMenu.remove();
      }
    }
  },

  /** @private
    Call the moveUp function on the parent Menu

    @returns Boolean
  */
  moveUp: function(sender,evt) {
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.moveUp(this) ;
    }
    return YES ;
  },

  /** @private
    Call the moveDown function on the parent Menu

    @returns Boolean
  */
  moveDown: function(sender,evt) {
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.moveDown(this) ;
    }
    return YES ;
  },

  /** @private
    Call the function to create a branch

    @returns Boolean
  */
  moveRight: function(sender,evt) {
    this.showSubMenu() ;
    return YES;
  },

  /** @private
    Proxies insertText events to the parent menu so items can be selected
    by typing their titles.
  */
  insertText: function(chr, evt) {
    var menu = this.get('parentMenu');
    if (menu) {
      menu.insertText(chr, evt);
    }
  },

  /** @private*/
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ;
  },

  /** @private*/
  keyUp: function(evt) {
    return YES ;
  },

  /** @private*/
  cancel: function(evt) {
    this.getPath('parentMenu.rootMenu').remove();
    return YES ;
  },

  /** @private*/
  didBecomeFirstResponder: function(responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu') ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', this) ;
    }
  },

  /** @private*/
  willLoseFirstResponder: function(responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu') ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', null) ;
      parentMenu.set('previousSelectedMenuItem', this) ;
    }
  },

  /** @private*/
  insertNewline: function(sender, evt) {
    this.mouseUp(evt) ;
  },

  /**
    Close the parent Menu and remove the focus of the current Selected
    Menu Item

    @returns void
  */
  closeParent: function() {
    this.$().removeClass('focus') ;
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.remove() ;
    }
  },

  /** @private*/
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame) ;
  },


  // ..........................................................
  // CONTENT OBSERVING
  //

  /**
    @private

    Add an observer to ensure that we invalidate our cached properties
    whenever the content object’s associated property changes.
  */
  contentDidChange: function() {
    var content    = this.get('content'),
        oldContent = this._content;

    if (content === oldContent) return ;

    var f = this.contentPropertyDidChange;
    // remove an observer from the old content if necessary
    if (oldContent  &&  oldContent.removeObserver) oldContent.removeObserver('*', this, f) ;

    // add observer to new content if necessary.
    this._content = content ;
    if (content  &&  content.addObserver) content.addObserver('*', this, f) ;

    // notify that value did change.
    this.contentPropertyDidChange(content, '*') ;
  }.observes('content'),


  /**
    @private

    Invalidate our cached property whenever the content object’s associated
    property changes.
  */
  contentPropertyDidChange: function(target, key) {
    // If the key that changed in the content is one of the fields for which
    // we (potentially) cache a value, update our cache.
    var menu = this.get('parentMenu') ;
    if (!menu) return ;

    var mapping           = SC.MenuItemView._contentPropertyToMenuItemPropertyMapping,
        contentProperties = SC.keys(mapping),
        i, len, contentProperty, menuItemProperty ;


    // Are we invalidating all keys?
    if (key === '*') {
      for (i = 0, len = contentProperties.length;  i < len;  ++i) {
        contentProperty  = contentProperties[i] ;
        menuItemProperty = mapping[contentProperty] ;
        this.notifyPropertyChange(menuItemProperty) ;
      }
    }
    else {
      for (i = 0, len = contentProperties.length;  i < len;  ++i) {
        contentProperty  = contentProperties[i] ;
        if (menu.get(contentProperty) === key) {
          menuItemProperty = mapping[contentProperty] ;
          this.notifyPropertyChange(menuItemProperty) ;

          // Note:  We won't break here in case the menu is set up to map
          //        multiple properties to the same content key.
        }
      }
    }
  }

}) ;


// ..........................................................
// CLASS PROPERTIES
//

/** @private
  A mapping of the "content property key" keys to the properties we use to
  wrap them.  This hash is used in 'contentPropertyDidChange' to ensure that
  when the content changes a property that is locally cached inside the menu
  item, the cache is properly invalidated.

  Implementor note:  If you add such a cached property, you must add it to
                     this mapping.
*/
SC.MenuItemView._contentPropertyToMenuItemPropertyMapping = {
  itemTitleKey:     'title',
  itemIsEnabledKey: 'isEnabled',
  itemSeparatorKey: 'isSeparator',
  itemSubMenuKey:   'subMenu'
};

/* >>>>>>>>>> BEGIN source/panes/menu.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
require('panes/picker');
require('views/menu_item');

/**
  @class

  SC.MenuPane allows you to display a standard menu. Menus appear over other
  panes, and block input to other views until a selection is made or the pane
  is dismissed by clicking outside of its bounds.

  You can create a menu pane and manage it yourself, or you can use the
  SC.SelectButtonView and SC.PopupButtonView controls to manage the menu for
  you.

  h2. Specifying Menu Items

  The menu pane examines the @items@ property to determine what menu items
  should be presented to the user.

  In its most simple form, you can provide an array of strings. Every item
  will be converted into a menu item whose title is the string.

  If you need more control over the menu items, such as specifying a keyboard
  shortcut, enabled state, custom height, or submenu, you can provide an array
  of content objects.

  Out of the box, the menu pane has some default keys it uses to get
  information from the objects. For example, to find out the title of the menu
  item, the menu pane will ask your object for its @title@ property. If you
  need to change this key, you can set the @itemTitleKey@ property on the pane
  itself.

  {{{
    var menuItems = [
      { title: 'Menu Item', keyEquivalent: 'ctrl_shift_n' },
      { title: 'Checked Menu Item', isChecked: YES, keyEquivalent: 'ctrl_a' },
      { title: 'Selected Menu Item', keyEquivalent: 'backspace' },
      { isSeparator: YES },
      { title: 'Menu Item with Icon', icon: 'inbox', keyEquivalent: 'ctrl_m' },
      { title: 'Menu Item with Icon', icon: 'folder', keyEquivalent: 'ctrl_p' }
    ];

    var menu = SC.MenuPane.create({
      items: menuItems
    });
  }}}

  h2. Observing User Selections

  To determine when a user clicks on a menu item, you can observe the
  @selectedItem@ property for changes.

  @extends SC.PickerPane
  @since SproutCore 1.0
*/

SC.MenuPane = SC.PickerPane.extend(
/** @scope SC.MenuPane.prototype */ {

  classNames: ['sc-menu'],

  // ..........................................................
  // PROPERTIES
  //

  /**
    The array of items to display. This can be a simple array of strings,
    objects or hashes. If you pass objects or hashes, you can also set the
    various itemKey properties to tell the menu how to extract the information
    it needs.

    @type String
  */
  items: [],

  /**
    The size of the menu. This will set a CSS style on the menu that can be
    used by the current theme to style the appearance of the control. This
    value will also determine the default itemHeight, itemSeparatorHeight,
    menuHeightPadding, and submenuOffsetX if you don't explicitly set these
    properties.

    Your theme can override the default values for each control size. For
    example, to set the height of menu items for small menus, you could set
    {{{
      SC.MenuPane.SMALL_MENU_ITEM_HEIGHT = 10;
    }}}

    Changing the controlSize once the menu is instantiated has no effect.

    @type String
    @default SC.REGULAR_CONTROL_SIZE
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,

  /**
    The height of each menu item, in pixels.

    You can override this on a per-item basis by setting the (by default)
    @height@ property on your object.

    If you don't specify a value, the item height will be inferred from
    controlSize.

    @type Number
    @default null
  */
  itemHeight: null,

  /**
    The height of separator menu items.

    You can override this on a per-item basis by setting the (by default)
    @height@ property on your object.

    If you don't specify a value, the height of the separator menu items will
    be inferred from controlSize.

    @type Number
    @default null
  */
  itemSeparatorHeight: null,

  /**
    The height of the menu pane.  This is updated every time menuItemViews
    is recalculated.

    @type Number
    @isReadOnly
  */
  menuHeight: 0,

  /**
    The amount of padding to add to the height of the pane.

    The first menu item is offset by half this amount, and the other half is
    added to the height of the menu, such that a space between the top and the
    bottom is created.

    If you don't specify a value, the padding will be inferred from the
    controlSize.

    @type Number
    @default null
  */
  menuHeightPadding: null,

  /**
    The amount of offset x while positioning submenu.

    If you don't specify a value, the padding will be inferred from the
    controlSize.

    @type Number
    @default null
  */
  submenuOffsetX: null,

  /**
    The last menu item to be selected by the user.

    You can place an observer on this property to be notified when the user
    makes a selection.

    @type SC.Object
    @default null
    @isReadOnly
  */
  selectedItem: null,

  /**
    The view class to use when creating new menu item views.

    The menu pane will automatically create an instance of the view class you
    set here for each item in the @items@ array. You may provide your own
    subclass for this property to display the customized content.

    @default SC.MenuItemView
    @type SC.View
  */
  exampleView: SC.MenuItemView,

  /**
    The view or element to which the menu will anchor itself.

    When the menu pane is shown, it will remain anchored to the view you
    specify, even if the window is resized. You should specify the anchor as a
    parameter when calling @popup()@, rather than setting it directly.

    @type SC.View
    @isReadOnly
  */
  anchor: null,

  /**
    YES if this menu pane was generated by a parent SC.MenuPane.

    @type Boolean
    @isReadOnly
  */
  isSubMenu: NO,

  /**
    Whether the title of menu items should be localized before display.

    @type Boolean
    @default YES
  */
  localize: YES,
  
  /**
    Whether or not this menu pane should accept the “current menu pane”
    designation when visible, which is the highest-priority pane when routing
    events.  Generally you want this set to YES so that your menu pane can
    intercept keyboard events.

    @type Boolean
    @default YES
  */
  acceptsMenuPane: YES,
  
  /**
    Disable context menu.
  */
  isContextMenuEnabled: NO,

  // ..........................................................
  // METHODS
  //

  /**
    Makes the menu visible and adds it to the HTML document.

    If you provide a view or element as the first parameter, the menu will
    anchor itself to the view, and intelligently reposition itself if the
    contents of the menu exceed the available space.

    @param SC.View anchorViewOrElement the view or element to which the menu
    should anchor.
    @param preferMatrix The prefer matrix used to position the pane.
    (optional)
  */
  popup: function(anchorViewOrElement, preferMatrix) {
    var anchor;
    this.beginPropertyChanges();
    if (anchorViewOrElement) {
      anchor = anchorViewOrElement.isView ? anchorViewOrElement.get('layer') : anchorViewOrElement;
    }
    this.set('anchorElement',anchor) ;
    this.set('anchor',anchorViewOrElement);
    if (preferMatrix) this.set('preferMatrix',preferMatrix) ;

    this.adjust('height', this.get('menuHeight'));
    this.positionPane();

    // Because panes themselves do not receive key events, we need to set the
    // pane's defaultResponder to itself. This way key events can be
    // interpreted in keyUp.
    this.set('defaultResponder', this);
    this.endPropertyChanges();

    this.append();
  },

  /**
    Removes the menu from the screen.

    @returns {SC.MenuPane} receiver
  */
  remove: function() {
    var parentMenu = this.get('parentMenu');

    this.set('currentMenuItem', null);
    this.closeOpenMenus();
    this.resignMenuPane();

    if (parentMenu) {
      parentMenu.becomeMenuPane();
    }

    return arguments.callee.base.apply(this,arguments);
  },

  // ..........................................................
  // ITEM KEYS
  //

  /**
    The name of the property that contains the title for each item.

    @type String
    @default "title"
    @commonTask Menu Item Properties
  */
  itemTitleKey: 'title',

  /**
    The name of the property that determines whether the item is enabled.

    @type String
    @default "isEnabled"
    @commonTask Menu Item Properties
  */
  itemIsEnabledKey: 'isEnabled',

  /**
    The name of the property that contains the value for each item.

    @type String
    @default "value"
    @commonTask Menu Item Properties
  */
  itemValueKey: 'value',

  /**
    The name of the property that contains the icon for each item.

    @type String
    @default "icon"
    @commonTask Menu Item Properties
  */
  itemIconKey: 'icon',

  /**
    The name of the property that contains the height for each item.

    @readOnly
    @type String
    @default "height"
    @commonTask Menu Item Properties
  */
  itemHeightKey: 'height',

  /**
    The name of the property that contains an optional submenu for each item.

    @type String
    @default "subMenu"
    @commonTask Menu Item Properties
  */
  itemSubMenuKey: 'subMenu',

  /**
    The name of the property that determines whether the item is a menu
    separator.

    @type String
    @default "separator"
    @commonTask Menu Item Properties
  */
  itemSeparatorKey: 'separator',

  /**
    The name of the property that contains the target for the action that is triggered when the user clicks the menu item.

    Note that this property is ignored if the menu item has a submenu.

    @type String
    @default "target"
    @commonTask Menu Item Properties
  */
  itemTargetKey: 'target',

  /**
    The name of the property that contains the action that is triggered when
    the user clicks the menu item.

    Note that this property is ignored if the menu item has a submenu.

    @type String
    @default "action"
    @commonTask Menu Item Properties
  */
  itemActionKey: 'action',

  /**
    The name of the property that determines whether the menu item should
    display a checkbox.

    @type String
    @default "checkbox"
    @commonTask Menu Item Properties
  */
  itemCheckboxKey: 'checkbox',

  /**
    The name of the property that contains the shortcut to be displayed.

    The shortcut should communicate the keyboard equivalent to the user.

    @type String
    @default "shortcut"
    @commonTask Menu Item Properties
  */
  itemShortCutKey: 'shortcut',

  /**
    The name of the property that contains the key equivalent of the menu
    item.

    The action of the menu item will be fired, and the menu pane's
    @selectedItem@ property set to the menu item, if the user presses this
    key combination on the keyboard.

    @type String
    @default "keyEquivalent"
    @commonTask Menu Item Properties
  */
  itemKeyEquivalentKey: 'keyEquivalent',

  /**
    The name of the property that determines whether menu flash should be
    disabled.

    When you click on a menu item, it will flash several times to indicate
    selection to the user. Some browsers block windows from opening outside of
    a mouse event, so you may wish to disable menu flashing if the action of
    the menu item should open a new window.

    @type String
    @default "disableMenuFlash"
    @commonTask Menu Item Properties
  */
  itemDisableMenuFlashKey: 'disableMenuFlash',

  /**
    The array of keys used by SC.MenuItemView when inspecting your menu items
    for display properties.

    @private
    @isReadOnly
    @property Array
  */
  menuItemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemSeparatorKey itemActionKey itemCheckboxKey itemShortCutKey itemHeightKey itemSubMenuKey itemKeyEquivalentKey itemTargetKey'.w(),

  // ..........................................................
  // INTERNAL PROPERTIES
  //

  /** @private */
  preferType: SC.PICKER_MENU,

  /**
    Create a modal pane beneath the menu that will prevent any mouse clicks
    that fall outside the menu pane from triggering an inadvertent action.

    @type Boolean
    @private
  */
  isModal: YES,

  /**
    The view that contains the MenuItemViews that are visible on screen.

    This is created and set in createChildViews.

    @property SC.View
    @private
  */
  _menuView: null,

  // ..........................................................
  // INTERNAL METHODS
  //

  /**
    If an itemHeight, itemSeparatorHeight, or menuHeightPadding have not been
    explicitly set, we set them here based on the controlSize.

    @returns {SC.MenuPane} the newly instantiated menu pane
    @private
  */
  init: function() {
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        this.setIfNull('itemHeight', SC.MenuPane.TINY_MENU_ITEM_HEIGHT);
        this.setIfNull('itemSeparatorHeight', SC.MenuPane.TINY_MENU_ITEM_SEPARATOR_HEIGHT);
        this.setIfNull('menuHeightPadding', SC.MenuPane.TINY_MENU_HEIGHT_PADDING);
        this.setIfNull('submenuOffsetX', SC.MenuPane.TINY_SUBMENU_OFFSET_X);
        break;
      case SC.SMALL_CONTROL_SIZE:
        this.setIfNull('itemHeight', SC.MenuPane.SMALL_MENU_ITEM_HEIGHT);
        this.setIfNull('itemSeparatorHeight', SC.MenuPane.SMALL_MENU_ITEM_SEPARATOR_HEIGHT);
        this.setIfNull('menuHeightPadding', SC.MenuPane.SMALL_MENU_HEIGHT_PADDING);
        this.setIfNull('submenuOffsetX', SC.MenuPane.SMALL_SUBMENU_OFFSET_X);
        break;
      case SC.REGULAR_CONTROL_SIZE:
        this.setIfNull('itemHeight', SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT);
        this.setIfNull('itemSeparatorHeight', SC.MenuPane.REGULAR_MENU_ITEM_SEPARATOR_HEIGHT);
        this.setIfNull('menuHeightPadding', SC.MenuPane.REGULAR_MENU_HEIGHT_PADDING);
        this.setIfNull('submenuOffsetX', SC.MenuPane.REGULAR_SUBMENU_OFFSET_X);
        break;
      case SC.LARGE_CONTROL_SIZE:
        this.setIfNull('itemHeight', SC.MenuPane.LARGE_MENU_ITEM_HEIGHT);
        this.setIfNull('itemSeparatorHeight', SC.MenuPane.LARGE_MENU_ITEM_SEPARATOR_HEIGHT);
        this.setIfNull('menuHeightPadding', SC.MenuPane.LARGE_MENU_HEIGHT_PADDING);
        this.setIfNull('submenuOffsetX', SC.MenuPane.LARGE_SUBMENU_OFFSET_X);
        break;
      case SC.HUGE_CONTROL_SIZE:
        this.setIfNull('itemHeight', SC.MenuPane.HUGE_MENU_ITEM_HEIGHT);
        this.setIfNull('itemSeparatorHeight', SC.MenuPane.HUGE_MENU_ITEM_SEPARATOR_HEIGHT);
        this.setIfNull('menuHeightPadding', SC.MenuPane.HUGE_MENU_HEIGHT_PADDING);
        this.setIfNull('submenuOffsetX', SC.MenuPane.HUGE_SUBMENU_OFFSET_X);
        break;
    }

    return arguments.callee.base.apply(this,arguments);
  },

  /**
    Helper method that only sets a property if it is null.

    @param {String} key the property to set
    @param {Object} value
    @private
  */
  setIfNull: function(key, value) {
    if (this.get(key) === null) {
      this.set(key, value);
    }
  },

  /** @private
    The render method is responsible for adding the control size class
    name to the menu pane.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
  */
  render: function(context, firstTime) {
    context.addClass(this.get('controlSize'));

    return arguments.callee.base.apply(this,arguments);
  },

  /**
    Creates the child scroll view, and sets its contentView to a new
    view.  This new view is saved and managed by the SC.MenuPane,
    and contains the visible menu items.

    @private
    @returns {SC.View} receiver
  */
  createChildViews: function() {
    var scroll, menuView, menuItemViews;

    scroll = this.createChildView(SC.MenuScrollView, {
      borderStyle: SC.BORDER_NONE,
      controlSize: this.get('controlSize')
    });

    menuView = this._menuView = SC.View.create();
    menuItemViews = this.get('menuItemViews');
    menuView.set('layout', { top: 0, left: 0, height : this.get('menuHeight')});
    menuView.replaceAllChildren(menuItemViews);
    scroll.set('contentView', menuView);

    this.childViews = [scroll];

    return this;
  },

  /**
    When the pane is attached to a DOM element in the window, set up the
    view to be visible in the window and register with the RootResponder.

    We don't call arguments.callee.base.apply(this,arguments) here because PanelPane sets the current pane to
    be the key pane when attached.

    @returns {SC.MenuPane} receiver
  */
  paneDidAttach: function() {
    // hook into root responder
    var responder = (this.rootResponder = SC.RootResponder.responder);
    responder.panes.add(this);

    // set currentWindowSize
    this.set('currentWindowSize', responder.computeWindowSize()) ;

    // update my own location
    this.set('isPaneAttached', YES) ;
    this.parentViewDidChange() ;

    //notify that the layers have been appended to the document
    this._notifyDidAppendToDocument();

    this.becomeMenuPane();

    return this ;
  },

  /**
    Make the pane the menu pane. When you call this, all key events will
    temporarily be routed to this pane. Make sure that you call
    resignMenuPane; otherwise all key events will be blocked to other panes.

    @returns {SC.Pane} receiver
  */
  becomeMenuPane: function() {
    if (this.rootResponder) this.rootResponder.makeMenuPane(this) ;
    return this ;
  },

  /**
    Remove the menu pane status from the pane.  This will simply set the 
    menuPane on the rootResponder to null.

    @returns {SC.Pane} receiver
  */
  resignMenuPane: function() {
    if (this.rootResponder) this.rootResponder.makeMenuPane(null);
    return this ;
  },

  /**
    The array of child menu item views that compose the menu.

    This computed property parses @displayItems@ and constructs an SC.MenuItemView (or whatever class you have set as the @exampleView@) for every item.

    @property
    @type Array
    @readOnly
  */
  menuItemViews: function() {
    var views = [], items = this.get('displayItems'),
        exampleView = this.get('exampleView'), item, view,
        height, heightKey, separatorKey, defaultHeight, separatorHeight,
        menuHeight, menuHeightPadding, keyEquivalentKey, keyEquivalent,
        keyArray, idx,
        len;

    if (!items) return views; // return an empty array

    heightKey = this.get('itemHeightKey');
    separatorKey = this.get('itemSeparatorKey');
    defaultHeight = this.get('itemHeight');
    keyEquivalentKey = this.get('itemKeyEquivalentKey');
    separatorHeight = this.get('itemSeparatorHeight');

    menuHeightPadding = Math.floor(this.get('menuHeightPadding')/2);
    menuHeight = menuHeightPadding;

    keyArray = this.menuItemKeys.map(SC._menu_fetchKeys, this);

    len = items.get('length');
    for (idx = 0; idx < len; idx++) {
      item = items[idx];
      height = item.get(heightKey);
      if (!height) {
        height = item.get(separatorKey) ? separatorHeight : defaultHeight;
      }
      view = this._menuView.createChildView(exampleView, {
        layout: { height: height, top: menuHeight },
        contentDisplayProperties: keyArray,
        content: item,
        parentMenu: this
      });
      views[idx] = view;
      menuHeight += height;

      keyEquivalent = item.get(keyEquivalentKey);
      if (keyEquivalent) {
        this._keyEquivalents[keyEquivalent] = view;
      }
    }

    this.set('menuHeight', menuHeight+menuHeightPadding);
    return views;
  }.property('displayItems').cacheable(),

  /**
    Returns the menu item view for the content object at the specified index.

    @param {Number} idx the item index
    @returns {SC.MenuItemView} instantiated view
  */
  menuItemViewForContentIndex: function(idx) {
    var menuItemViews = this.get('menuItemViews');

    if (!menuItemViews) return undefined;
    return menuItemViews.objectAt(idx);
  },

  /**
    An associative array of the shortcut keys. The key is the shortcut in the
    form 'ctrl_z', and the value is the menu item of the action to trigger.

    @private
  */
  _keyEquivalents: { },

  /**
    If this is a submenu, this property corresponds to the
    top-most parent menu. If this is the root menu, it returns
    itself.

    @type SC.MenuPane
    @isReadOnly
    @property
  */
  rootMenu: function() {
    if (this.get('isSubMenu')) return this.getPath('parentMenu.rootMenu');
    return this;
  }.property('isSubMenu').cacheable(),

  /**
    Close the menu if the user resizes the window.

    @private
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.remove();
    return arguments.callee.base.apply(this,arguments);
  },

  /**
    Returns an array of normalized display items.

    Because the items property can be provided as either an array of strings,
    or an object with key-value pairs, or an exotic mish-mash of both, we need
    to normalize it for our display logic.

    If an @items@ member is an object, we can assume it is formatted properly
    and leave it as-is.

    If an @items@ member is a string, we create a hash with the title value
    set to that string, and some sensible defaults for the other properties.

    As a last resort, if an @items@ member is an array, we have a legacy
    handler that converts the array into a hash. This behavior is deprecated
    and is not guaranteed to be supported in the future.

    A side effect of running this computed property is that the menuHeight
    property is updated.

    @displayItems@ should never be set directly; instead, set @items@ and
    @displayItems@ will update automatically.

    @property
    @type Array
    @isReadOnly
  */
  displayItems: function() {
    var items = this.get('items'), localize = this.get('localize'),
        itemHeight = this.get('itemHeight'), len,
        ret = [], idx, item, itemType;

    if (!items) return null;

    len = items.get('length');

    // Loop through the items property and transmute as needed, then
    // copy the new objects into the ret array.
    for (idx = 0; idx < len; idx++) {
      item = items.objectAt(idx) ;

      // fast track out if we can't do anything with this item
      if (!item) continue;

      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        item = SC.Object.create({ title: item,
                                  value: item,
                                  isEnabled: YES
                               });
      } else if (itemType === SC.T_HASH) {
        item = SC.Object.create(item);
      } else if (itemType === SC.T_ARRAY) {
        item = this.convertArrayMenuItemToObject(item);
      }
      item.contentIndex = idx;

      ret.push(item);
    }

    return ret;
  }.property('items').cacheable(),

  _sc_menu_itemsDidChange: function() {
    var views = this.get('menuItemViews');
    this._menuView.replaceAllChildren(views);
    this._menuView.adjust('height', this.get('menuHeight'));
  }.observes('items'),

  /**
    Takes an array of values and places them in a hash that can be used
    to render a menu item.

    The mapping goes a little something like this:
    0: title
    1: value
    2: isEnabled
    3: icon
    4: isSeparator
    5: action
    6: isCheckbox
    7: isShortCut
    8: isBranch
    9: itemHeight
    10: subMenu
    11: keyEquivalent
    12: target

    @private
  */
  convertArrayMenuItemToObject: function(item) {
    SC.Logger.warn('Support for Array-based menu items has been deprecated.  Please update your menus to use a hash.');

    var keys, fetchKeys = SC._menu_fetchKeys,
        fetchItem = SC._menu_fetchItem, cur, ret = SC.Object.create(), idx, loc;

    // Gets an array of all of the value keys
    keys = this.menuItemKeys.map(fetchKeys, this);

    // title
    ret[keys[0]] = item[0];
    ret[keys[1]] = item[1];
    ret[keys[2]] = item[2];
    ret[keys[3]] = item[3];
    ret[keys[4]] = item[4];
    ret[keys[5]] = item[5];
    ret[keys[6]] = item[6];
    ret[keys[7]] = item[7];
    ret[keys[8]] = item[8];
    ret[keys[9]] = item[9];
    ret[keys[10]] = item[10];
    ret[keys[11]] = item[11];
    ret[keys[12]] = item[12];

    return ret;
  },

  currentMenuItem: function(key, value) {
    if (value !== undefined) {
      if (this._currentMenuItem !== null) {
        this.set('previousMenuItem', this._currentMenuItem);
      }
      this._currentMenuItem = value;
      this.setPath('rootMenu.targetMenuItem', value);

      return value;
    }

    return this._currentMenuItem;
  }.property().cacheable(),

  _sc_menu_currentMenuItemDidChange: function() {
    var currentMenuItem = this.get('currentMenuItem'),
        previousMenuItem = this.get('previousMenuItem');

    if (previousMenuItem) {
      if (previousMenuItem.get('hasSubMenu') && currentMenuItem === null) {

      } else {
        previousMenuItem.resignFirstResponder();
        this.closeOpenMenusFor(previousMenuItem);
      }
    }

    // Scroll to the selected menu item if it's not visible on screen.
    // This is useful for keyboard navigation and programmaticaly selecting
    // the selected menu item, as in SelectButtonView.
    if (currentMenuItem && currentMenuItem.get('isEnabled')) {
      currentMenuItem.scrollToVisible();
    }
  }.observes('currentMenuItem'),

  closeOpenMenusFor: function(menuItem) {
    if (!menuItem) return;

    var menu = menuItem.get('parentMenu');

    // Close any open menus if a root menu changes
    while (menu && menuItem) {
      menu = menuItem.get('subMenu');
      if (menu) {
        menu.remove();
        menuItem.resignFirstResponder();
        menuItem = menu.get('previousMenuItem');
      }
    }
  },

  closeOpenMenus: function() {
    this.closeOpenMenusFor(this.get('previousMenuItem'));
  },

  //Mouse and Key Events

  /** @private */
  mouseDown: function(evt) {
    this.modalPaneDidClick();
    return YES ;
  },

  /** @private
    Note when the mouse has entered, so that if this is a submenu,
    the menu item to which it belongs knows whether to maintain its highlight
    or not.

    @param {Event} evt
  */
  mouseEntered: function(evt) {
    this.set('mouseHasEntered', YES);
  },

  keyUp: function(evt) {
    var ret = this.interpretKeyEvents(evt) ;
    return !ret ? NO : ret ;
  },

  /**
    Selects the next enabled menu item above the currently
    selected menu item when the up-arrow key is pressed.

    @private
  */
  moveUp: function() {
    var currentMenuItem = this.get('currentMenuItem'),
        items = this.get('menuItemViews'),
        currentIndex, parentMenu, idx;

    if (!currentMenuItem) {
      idx = items.get('length')-1;
    } else {
      currentIndex = currentMenuItem.getPath('content.contentIndex');
      if (currentIndex === 0) return YES;
      idx = currentIndex-1;
    }

    while (idx >= 0) {
      if (items[idx].get('isEnabled')) {
        this.set('currentMenuItem', items[idx]);
        items[idx].becomeFirstResponder();
        break;
      }
      idx--;
    }

    return YES;
  },

  /**
    Selects the next enabled menu item below the currently
    selected menu item when the down-arrow key is pressed.

    @private
  */
  moveDown: function() {
    var currentMenuItem = this.get('currentMenuItem'),
        items = this.get('menuItemViews'),
        len = items.get('length'),
        currentIndex, parentMenu, idx;

    if (!currentMenuItem) {
      idx = 0;
    } else {
      currentIndex = currentMenuItem.getPath('content.contentIndex');
      if (currentIndex === len) return YES;
      idx = currentIndex+1;
    }

    while (idx < len) {
      if (items[idx].get('isEnabled')) {
        this.set('currentMenuItem', items[idx]);
        items[idx].becomeFirstResponder();
        break;
      }
      idx++;
    }

    return YES;
  },

  insertText: function(chr, evt) {
    var timer = this._timer, keyBuffer = this._keyBuffer;

    if (timer) {
      timer.invalidate();
    }
    timer = this._timer = SC.Timer.schedule({
      target: this,
      action: 'clearKeyBuffer',
      interval: 500,
      isPooled: NO
    });

    keyBuffer = keyBuffer || '';
    keyBuffer += chr.toUpperCase();

    this.selectMenuItemForString(keyBuffer);
    this._keyBuffer = keyBuffer;

    return YES;
  },

  performKeyEquivalent: function(keyEquivalent) {
    //If menu is not visible
    if (!this.get('isVisibleInWindow')) return NO;
    
    // Look for menu item that has this key equivalent
    var menuItem = this._keyEquivalents[keyEquivalent];

    // If found, have it perform its action
    if (menuItem) {
      menuItem.performAction(YES);
      return YES;
    }

    // If escape key or the enter key was pressed and no menu item handled it,
    // close the menu pane and return YES that the event was handled
    if (keyEquivalent === 'escape'|| keyEquivalent === 'return') {
      this.remove();
      return YES;
    }

    return NO;

  },

  selectMenuItemForString: function(buffer) {
    var items = this.get('menuItemViews'), item, title, idx, len, bufferLength;
    if (!items) return;

    bufferLength = buffer.length;
    len = items.get('length');
    for (idx = 0; idx < len; idx++) {
      item = items.objectAt(idx);
      title = item.get('title');

      if (!title) continue;

      title = title.replace(/ /g,'').substr(0,bufferLength).toUpperCase();
      if (title === buffer) {
        this.set('currentMenuItem', item);
        item.becomeFirstResponder();
        break;
      }
    }
  },

  /**
    Clear the key buffer if the user does not enter any text after a certain
    amount of time.

    This is called by the timer created in the insertText method.

    @private
  */
  clearKeyBuffer: function() {
    this._keyBuffer = '';
  },

  /**
    Close the menu and any open submenus if the user clicks outside the menu.

    Because only the root-most menu has a modal pane, this will only ever get
    called once.

    @returns Boolean
    @private
  */
  modalPaneDidClick: function(evt) {
    this.remove();

    return YES;
  }
});

SC._menu_fetchKeys = function(k) {
  return this.get(k) ;
};
SC._menu_fetchItem = function(k) {
  if (!k) return null ;
  return this.get ? this.get(k) : this[k] ;
};

/**
  Default metrics for the different control sizes.
*/
SC.MenuPane.TINY_MENU_ITEM_HEIGHT = 10;
SC.MenuPane.TINY_MENU_ITEM_SEPARATOR_HEIGHT = 2;
SC.MenuPane.TINY_MENU_HEIGHT_PADDING = 2;
SC.MenuPane.TINY_SUBMENU_OFFSET_X = 0;

SC.MenuPane.SMALL_MENU_ITEM_HEIGHT = 16;
SC.MenuPane.SMALL_MENU_ITEM_SEPARATOR_HEIGHT = 7;
SC.MenuPane.SMALL_MENU_HEIGHT_PADDING = 4;
SC.MenuPane.SMALL_SUBMENU_OFFSET_X = 2;

SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT = 20;
SC.MenuPane.REGULAR_MENU_ITEM_SEPARATOR_HEIGHT = 9;
SC.MenuPane.REGULAR_MENU_HEIGHT_PADDING = 6;
SC.MenuPane.REGULAR_SUBMENU_OFFSET_X = 2;

SC.MenuPane.LARGE_MENU_ITEM_HEIGHT = 60;
SC.MenuPane.LARGE_MENU_ITEM_SEPARATOR_HEIGHT = 20;
SC.MenuPane.LARGE_MENU_HEIGHT_PADDING = 0;
SC.MenuPane.LARGE_SUBMENU_OFFSET_X = 4;

SC.MenuPane.HUGE_MENU_ITEM_HEIGHT = 20;
SC.MenuPane.HUGE_MENU_ITEM_SEPARATOR_HEIGHT = 9;
SC.MenuPane.HUGE_MENU_HEIGHT_PADDING = 0;
SC.MenuPane.HUGE_SUBMENU_OFFSET_X = 0;

// If a menu pane exceeds the height of the viewport, it will
// be truncated to fit. This value determines the amount by which
// the menu will be offset from the top and bottom of the viewport.
SC.MenuPane.VERTICAL_OFFSET = 23;

/* >>>>>>>>>> BEGIN source/panes/select_button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  SelectButtonView has a functionality similar to that of SelectField

  Clicking the SelectButtonView button displays a menu pane with a
  list of items. The selected item will be displayed on the button.
  User has the option of enabling checkbox for the selected menu item.

  @extends SC.ButtonView
  @version 1.0
  @author Mohammed Ashik
*/
sc_require('views/button');

SC.SelectButtonView = SC.ButtonView.extend(
/** @scope SC.SelectButtonView.prototype */ {

  escapeHTML: YES,

  /**
    An array of items that will be form the menu you want to show.

    @property
    @type {Array}
  */
  objects: [],

  /**
    Binding default for an array of objects

    @property
    @default SC.Binding.multiple()
  */
  objectsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.

    @property
    @type {String}
    @default: null
  */
  nameKey: null,

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the objects.  If this is not set, then nameKey will
    be used.

    @property
    @type: {String}
    @default: null
  */
  sortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.

     @property
     @type {String}
     @default null
  */
  valueKey: null,

  /**
     Key used to extract icons from the objects array
  */
  iconKey: null,

  /**
    Key used to indicate if the item is to be enabled
   */
  isEnabledKey: "isEnabled",

  /**
    If true, the empty name will be localized.

    @property
    @type {Boolean}
    @default YES
  */
  localize: YES,

  /**
    if true, it means that no sorting will occur, objects will appear
    in the same order as in the array

    @property
    @type {Boolean}
    @default YES
  */
  disableSort: YES,

  /**

    @property
    @default ['select-button']
  */
  classNames: ['select-button'],

  /**
    Menu attached to the selectButton
    @default SC.MenuView
  */
  menu : null,

  /**
    Menu item list

    @property
    @type:{Array}
  */
  itemList: [],

  /**
    Property to set the index of the selected menu item. This in turn
    is used to calculate the preferMatrix.

    @property
    @type {Number}
    @default null
  */
  itemIdx: null,

  /**
     Current Value of the selectButton

     @property
     @default null
  */
  value: null ,

  /**
    if this property is set to 'YES', a checbox is shown next to the
    selected menu item.

    @private
    @default YES
  */
  checkboxEnabled: YES,

  /**
    Set this property to required display positon of separtor from bottom

    @private
    @default null
  */
  separatorPostion: null,

  /**
    Default value of the select button.
     This will be the first item from the menu item list.

    @private
  */
  _defaultVal: null,

  /**
    Default title of the select button.
     This will be the title corresponding to the _defaultVal.

    @private
  */
  _defaultTitle: null,

  /**
    Default icon of the select button.
     This will be the icon corresponding to the _defaultVal.

    @private
  */
  _defaultIcon: null,

  /**
    @private

    The button theme will be popup
  */
  theme: 'popup',

  /**
    Render method gets triggered when these properties change

    @property
    @type{SC.Array}
  */
  displayProperties: ['icon', 'value','controlSize','objects'],

  /**
    Prefer matrix to position the select button menu such that the
    selected item for the menu item will appear aligned to the
    the button. The value at the second index(0) changes based on the
    postion(index) of the menu item in the menu pane.

    @property
    @type {Array}
    @default null

  */
  preferMatrix: null,

  /**
    Width of the sprite image that gets applied due to the theme.
     This has to be accounted for while calculating the actual
     width of the button

    @property
    @type {Number}
    @default 28
  */
  SELECT_BUTTON_SPRITE_WIDTH: 28,

  /**
    Binds the select button's active state to the visibility of its menu.
  */
  isActiveBinding: '*menu.isVisibleInWindow',

  /**
    If this property is set to 'YES', the menu pane will be positioned
    below the anchor.

    @private
    @default NO
  */
  isDefaultPosition: NO,

  /**
    lastMenuWidth is the width of the last menu which was created from
    the objects of this select button.

    @private
  */
  lastMenuWidth: null,

  /**
    customView used to draw the menu
  */
  customView: null,

  /**
    css classes applied to customView
  */
  customViewClassName: null,

  /**
    customView menu offset width
  */
  customViewMenuOffsetWidth: 0,

  /**
    This is a property for enabling/disabling ellipsis

    @private
    @default YES
  */
  needsEllipsis: YES,

  /**
    This property allows you at add extra padding to the height
    of the menu pane.

    @default 0
    @property {Number} heightPadding for menu pane.
  */
  menuPaneHeightPadding: 0,

  /**
    This is a property to enable/disable focus rings in buttons.
    For select_button we are making it a default.

    @default YES
  */
  supportFocusRing: YES,
  
  /**
    Disable context menu.
  */
  isContextMenuEnabled: NO,
  

  /**
    Left Alignment based on the size of the button

    @private
  */
  leftAlign: function() {
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        return SC.SelectButtonView.TINY_OFFSET_X;
      case SC.SMALL_CONTROL_SIZE:
        return SC.SelectButtonView.SMALL_OFFSET_X;
      case SC.REGULAR_CONTROL_SIZE:
        return SC.SelectButtonView.REGULAR_OFFSET_X;
      case SC.LARGE_CONTROL_SIZE:
        return SC.SelectButtonView.LARGE_OFFSET_X;
      case SC.HUGE_CONTROL_SIZE:
        return SC.SelectButtonView.HUGE_OFFSET_X;
    }
    return 0;
  }.property('controlSize'),

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param{SC.Array} objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    if(!this.get('disableSort')){
      var nameKey = this.get('sortKey') || this.get('nameKey') ;
      objects = objects.sort(function(a,b) {
        if (nameKey) {
          a = a.get ? a.get(nameKey) : a[nameKey] ;
          b = b.get ? b.get(nameKey) : b[nameKey] ;
        }
        return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
      }) ;
    }
    return objects ;
  },

  /**
    render method

    @private
  */
  render: function(context,firstTime) {
    arguments.callee.base.apply(this,arguments);
    var layoutWidth, objects, len, nameKey, iconKey, valueKey, checkboxEnabled,
      currentSelectedVal, shouldLocalize, separatorPostion, itemList, isChecked,
      idx, name, icon, value, item, itemEnabled, isEnabledKey ;
    layoutWidth = this.layout.width ;
    if(firstTime && layoutWidth) {
      this.adjust({ width: layoutWidth - this.SELECT_BUTTON_SPRITE_WIDTH }) ;
    }

    objects = this.get('objects') ;
    objects = this.sortObjects(objects) ;
    len = objects.length ;

    //Get the namekey, iconKey and valueKey set by the user
    nameKey = this.get('nameKey') ;
    iconKey = this.get('iconKey') ;
    valueKey = this.get('valueKey') ;
    isEnabledKey = this.get('isEnabledKey') ;
    checkboxEnabled = this.get('checkboxEnabled') ;

    //get the current selected value
    currentSelectedVal = this.get('value') ;

    // get the localization flag.
    shouldLocalize = this.get('localize') ;

    //get the separatorPostion
    separatorPostion = this.get('separatorPostion') ;

    //itemList array to set the menu items
    itemList = [] ;

    //to set the 'checkbox' property of menu items
    isChecked = YES ;

    //index for finding the first item in the list
    idx = 0 ;

    objects.forEach(function(object) {
    if (object) {

      //Get the name value. If value key is not specified convert obj
      //to string
      name = nameKey ? (object.get ?
        object.get(nameKey) : object[nameKey]) : object.toString() ;

      // localize name if specified.
      name = shouldLocalize? name.loc() : name ;

      //Get the icon value
      icon = iconKey ? (object.get ?
        object.get(iconKey) : object[iconKey]) : null ;
      if (SC.none(object[iconKey])) icon = null ;

      // get the value using the valueKey or the object
        value = (valueKey) ? (object.get ?
        object.get(valueKey) : object[valueKey]) : object ;

      if (!SC.none(currentSelectedVal) && !SC.none(value)){
        if( currentSelectedVal === value ) {
          this.set('title', name) ;
          this.set('icon', icon) ;
        }
      }

      //Check if the item is currentSelectedItem or not
      if(value === this.get('value')) {

        //set the itemIdx - To change the prefMatrix accordingly.
        this.set('itemIdx', idx) ;
        isChecked = !checkboxEnabled ? NO : YES ;
      }
      else {
        isChecked = NO ;
      }

      //Check if item is enabled
      itemEnabled = (isEnabledKey) ? (object.get ?
      object.get(isEnabledKey) : object[isEnabledKey]) : object ;
      
      if(NO !== itemEnabled) itemEnabled = YES ;

      //Set the first item from the list as default selected item
      if (idx === 0) {
        this._defaultVal = value ;
        this._defaultTitle = name ;
        this._defaultIcon = icon ;
      }

      var item = SC.Object.create({
        title: name,
        icon: icon,
        value: value,
        isEnabled: itemEnabled,
        checkbox: isChecked,
        target: this,
        action: 'displaySelectedItem'
      }) ;

      //Set the items in the itemList array
      itemList.push(item);
    }

    idx += 1 ;

    // display the separator if specified by the user
    if (separatorPostion && idx === (len-separatorPostion)) {
      var separator = SC.Object.create({
        separator: YES
      }) ;
      itemList.push(separator);
    }

    this.set('itemList', itemList) ;
    }, this ) ;

    if(firstTime) {
      this.invokeLast(function() {
        var value = this.get('value') ;
        if(SC.none(value)) {
          this.set('value', this._defaultVal) ;
          this.set('title', this._defaultTitle) ;
          this.set('icon', this._defaultIcon) ;
        }
      });
    }

    //Set the preference matrix for the menu pane
    this.changeSelectButtonPreferMatrix(this.itemIdx) ;

  },

  /**
    Button action handler

    @private
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  _action: function( evt )
  {
    var buttonLabel, menuWidth, scrollWidth, lastMenuWidth, offsetWidth,
      items, elementOffsetWidth, largestMenuWidth, item, element, idx,
      value, itemList, menuControlSize, menuHeightPadding, customView,
      customMenuView, menu, itemsLength, dummyMenuItemView, 
      menuItemViewEscapeHTML, menuWidthOffset, body;

    buttonLabel = this.$('.sc-button-label')[0] ;

    menuWidthOffset = SC.SelectButtonView.MENU_WIDTH_OFFSET ;
    if(!this.get('isDefaultPosition')) {
      switch (this.get('controlSize')) {
        case SC.TINY_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.TINY_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.SMALL_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.SMALL_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.REGULAR_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.REGULAR_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.LARGE_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.LARGE_POPUP_MENU_WIDTH_OFFSET;
          break;
        case SC.HUGE_CONTROL_SIZE:
          menuWidthOffset += SC.SelectButtonView.HUGE_POPUP_MENU_WIDTH_OFFSET;
          break;
      }
    }
    // Get the length of the text on the button in pixels
    menuWidth = this.get('layer').offsetWidth + menuWidthOffset ;
    scrollWidth = buttonLabel.scrollWidth ;
    lastMenuWidth = this.get('lastMenuWidth') ;
    if(scrollWidth) {
       // Get the original width of the label in the button
       offsetWidth = buttonLabel.offsetWidth ;
       if(scrollWidth && offsetWidth) {
          menuWidth = menuWidth + scrollWidth - offsetWidth ;
       }
    }
    if (!lastMenuWidth || (menuWidth > lastMenuWidth)) {
      lastMenuWidth = menuWidth ;
    }

    items = this.get('itemList') ;

    var customViewClassName = this.get('customViewClassName'),
        customViewMenuOffsetWidth = this.get('customViewMenuOffsetWidth'),
        className = 'sc-view sc-pane sc-panel sc-palette sc-picker sc-menu select-button sc-scroll-view sc-menu-scroll-view sc-container-view menuContainer sc-button-view sc-menu-item sc-regular-size' ;
    className = customViewClassName ? (className + ' ' + customViewClassName) : className ;

    dummyMenuItemView = (this.get('customView') || SC.MenuItemView).create(); 
    menuItemViewEscapeHTML = dummyMenuItemView.get('escapeHTML') ;
    var body = document.body;
    for (idx = 0, itemsLength = items.length; idx < itemsLength; ++idx) {
      //getting the width of largest menu item
      item = items.objectAt(idx) ;
      element = document.createElement('div') ;
      element.style.cssText = 'top:-10000px; left: -10000px;  position: absolute;' ;
      element.className = className ;
      element.innerHTML = menuItemViewEscapeHTML ? SC.RenderContext.escapeHTML(item.title) : item.title ;
      body.appendChild(element) ;
      elementOffsetWidth = element.offsetWidth + customViewMenuOffsetWidth;

      if (!largestMenuWidth || (elementOffsetWidth > largestMenuWidth)) {
        largestMenuWidth = elementOffsetWidth ;
      }
      body.removeChild(element) ;
    }
    largestMenuWidth = (largestMenuWidth > lastMenuWidth) ?
                      largestMenuWidth: lastMenuWidth ;

    // Get the window size width and compare with the lastMenuWidth.
    // If it is greater than windows width then reduce the maxwidth by 25px
    // so that the ellipsis property is enabled by default
    var maxWidth = SC.RootResponder.responder.get('currentWindowSize').width;
    if(largestMenuWidth > maxWidth) {
      largestMenuWidth = (maxWidth - 25) ;
    }

    this.set('lastMenuWidth',lastMenuWidth) ;
    value = this.get('value') ;
    itemList = this.get('itemList') ;
    menuControlSize = this.get('controlSize') ;

    // get the user defined custom view
    customView = this.get('customView') ;
    customMenuView = customView ? customView : SC.MenuItemView ;

    menu  = SC.MenuPane.create({

      classNames: ['select-button'],

      items: itemList,

      exampleView: customMenuView,

      isEnabled: YES,
      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: largestMenuWidth },
      controlSize: menuControlSize,
      itemWidth: lastMenuWidth,

      /**
        PerformKeyEquivalent, for handling tab and shift + tab
        Prevents the focus going to next fields when menu is open and you tab

        @param {String} keystring
        @param {SC.Event} evt
        @returns {Boolean}  YES if handled
      */

      performKeyEquivalent: function( keystring, evt ) {
        switch (keystring) {
          case 'tab':
          case 'shift_tab':
            return YES ;
          default:
            return arguments.callee.base.apply(this,arguments) ;
        }
      }
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    this.set('menu', menu);

    customView = menu.menuItemViewForContentIndex(this.get('itemIdx'));
    menu.set('currentMenuItem', customView) ;
    if (customView) customView.becomeFirstResponder();

    this.set('isActive', YES);
    return YES ;
  },

  /**
     Action method for the select button menu items

  */
  displaySelectedItem: function(menuView) {
    var currentItem = this.getPath('menu.selectedItem');
    if (!currentItem) return NO;

    this.set('value', currentItem.get('value')) ;
    this.set('title', currentItem.get('title')) ;
    this.set('itemIdx', currentItem.get('contentIndex')) ;

    return YES;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeSelectButtonPreferMatrix: function() {
    var controlSizeTuning = 0, customMenuItemHeight = 0 ;
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.TINY_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.TINY_MENU_ITEM_HEIGHT;
        break;
      case SC.SMALL_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.SMALL_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.SMALL_MENU_ITEM_HEIGHT;
        break;
      case SC.REGULAR_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.REGULAR_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.REGULAR_MENU_ITEM_HEIGHT;
        break;
      case SC.LARGE_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.LARGE_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.LARGE_MENU_ITEM_HEIGHT;
        break;
      case SC.HUGE_CONTROL_SIZE:
        controlSizeTuning = SC.SelectButtonView.HUGE_OFFSET_Y;
        customMenuItemHeight = SC.MenuPane.HUGE_MENU_ITEM_HEIGHT;
        break;
    }

    var preferMatrixAttributeTop = controlSizeTuning ,
        itemIdx = this.get('itemIdx') ,
        leftAlign = this.get('leftAlign'), defPreferMatrix, tempPreferMatrix ;

    if(this.get('isDefaultPosition')) {
      defPreferMatrix = [1, 0, 3] ;
      this.set('preferMatrix', defPreferMatrix) ;
    }
    else {
      if(itemIdx) {
        preferMatrixAttributeTop = itemIdx * customMenuItemHeight +
          controlSizeTuning ;
      }
      tempPreferMatrix = [leftAlign, -preferMatrixAttributeTop, 2] ;
      this.set('preferMatrix', tempPreferMatrix) ;
    }
  },

  /**
    @private

    Holding down the button should display the menu pane.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    this.becomeFirstResponder() ;
    this._action() ;

    // Store the current timestamp. We register the timestamp at the end of
    // the runloop so that the menu has been rendered, in case that operation
    // takes more than a few hundred milliseconds.

    // One mouseUp, we'll use this value to determine how long the mouse was
    // pressed.
    this.invokeLast(this._recordMouseDownTimestamp);
    return YES ;
  },

  /** @private
    Records the current timestamp. This is invoked at the end of the runloop
    by mouseDown. We use this value to determine the delay between mouseDown
    and mouseUp.
  */
  _recordMouseDownTimestamp: function() {
    this._menuRenderedTimestamp = new Date().getTime();
  },

  /** @private
    Because we responded YES to the mouseDown event, we have responsibility
    for handling the corresponding mouseUp event.

    However, the user may click on this button, then drag the mouse down to a
    menu item, and release the mouse over the menu item. We therefore need to
    delegate any mouseUp events to the menu's menu item, if one is selected.

    We also need to differentiate between a single click and a click and hold.
    If the user clicks and holds, we want to close the menu when they release.
    Otherwise, we should wait until they click on the menu's modal pane before
    removing our active state.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseUp: function(evt) {
    var timestamp = new Date().getTime(),
        previousTimestamp = this._menuRenderedTimestamp,
        menu = this.get('menu'),
        touch = SC.platform.touch,
        targetMenuItem;

    if (menu) {
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem && targetMenuItem.get('mouseHasEntered')) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) menu.remove();
      } else if (!touch && (timestamp - previousTimestamp > SC.ButtonView.CLICK_AND_HOLD_DELAY)) {
        // If the user waits more than a certain length of time between
        // mouseDown and mouseUp, we can assume that they are clicking and
        // dragging to the menu item, and we should close the menu if they
        // mouseup anywhere not inside the menu.

        // As a special case, we should trigger an action on the currently
        // selected menu item if the menu item is under the mouse and the user
        // never moved their mouse before mouseup.
        if (!menu.get('mouseHasEntered') && !this.get('isDefaultPosition')) {
          targetMenuItem = menu.get('currentMenuItem');
          if (targetMenuItem && !targetMenuItem.performAction()) {
            menu.remove();
          }
        } else {
          // Otherwise, just remove the menu because no selection
          // has been made.
          menu.remove();
        }
      }
    }


    // Reset state.
    this._isMouseDown = NO;
    return YES;
  },

  /**
    Override mouseExited to not remove the active state on mouseexit.
  */
  mouseExited: function() {
    return YES;
  },

  /**
    @private

    Handle Key event - Down arrow key
  */
  keyDown: function(event) {
    if ( this.interpretKeyEvents(event) ) {
      return YES;
    }
    else {
      return arguments.callee.base.apply(this,arguments);
    }
  },

  /**
    @private

    Pressing the Up or Down arrow key should display the menu pane
  */
  interpretKeyEvents: function(event) {
    if (event) {
      if ((event.keyCode === 38 || event.keyCode === 40)) {
        this._action() ;
      }
      else if (event.keyCode === 27) {
        this.resignFirstResponder() ;
      }
    }
    return arguments.callee.base.apply(this,arguments);
  },

  /** Function overridden - tied to the isEnabled state */
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),

  /** @private
    Override the button isSelectedDidChange function in order to not perform any action
    on selecting the select_button
  */
  _button_isSelectedDidChange: function() {

  }.observes('isSelected'),
  
  didAppendToDocument: function() {
  }

}) ;

/**
  Default metrics for the different control sizes.
*/
SC.SelectButtonView.TINY_OFFSET_X = 0;
SC.SelectButtonView.TINY_OFFSET_Y = 0;
SC.SelectButtonView.TINY_POPUP_MENU_WIDTH_OFFSET = 0;

SC.SelectButtonView.SMALL_OFFSET_X = -18;
SC.SelectButtonView.SMALL_OFFSET_Y = 3;
SC.SelectButtonView.SMALL_POPUP_MENU_WIDTH_OFFSET = 7;

SC.SelectButtonView.REGULAR_OFFSET_X = -17;
SC.SelectButtonView.REGULAR_OFFSET_Y = 3;
SC.SelectButtonView.REGULAR_POPUP_MENU_WIDTH_OFFSET = 4;

SC.SelectButtonView.LARGE_OFFSET_X = -17;
SC.SelectButtonView.LARGE_OFFSET_Y = 6;
SC.SelectButtonView.LARGE_POPUP_MENU_WIDTH_OFFSET = 3;

SC.SelectButtonView.HUGE_OFFSET_X = 0;
SC.SelectButtonView.HUGE_OFFSET_Y = 0;
SC.SelectButtonView.HUGE_POPUP_MENU_WIDTH_OFFSET = 0;

SC.SelectButtonView.MENU_WIDTH_OFFSET = -2;

/* >>>>>>>>>> BEGIN source/panes/sheet.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
  Displays a modal sheet pane that animates from the top of the viewport.

  The default way to use the sheet pane is to simply add it to your page like this:

  {{{
    SC.SheetPane.create({
      layout: { width: 400, height: 200, centerX: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}

  This will cause your sheet panel to display.  The default layout for a Sheet
  is to cover the entire document window with a semi-opaque background, and to
  resize with the window.

  @extends SC.PanelPane
  @since SproutCore 1.0
  @author Evin Grano
  @author Tom Dale
*/
SC.SheetPane = SC.PanelPane.extend({
  classNames: 'sc-sheet',

  /** Do not show smoke behind palettes */
  modalPane: SC.ModalPane,

  /**
    Speed of transition.  Should be expressed in msec.

    @property {Number}
  */
  transitionDuration: 200,
  
  _state: 'NO_VIEW', // no view
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    if (SC.Animatable) {
      SC.SheetPane.ANIMATABLE_AVAILABLE = YES;
      this.mixin(SC.Animatable);
      
      if (!this.transitions) this.transitions = {};
      if (!this.transitions.top) {
        // transitionDuration = 200 seems to be too fast when using Animatable
        this.transitions.top = {
          duration: this.transitionDuration === 200 ? 0.3 : this.transitionDuration/1000,
          action: "_complete",
          target: this
        };
      }
    }
  },

  /**
    Displays the pane.  SheetPane will calculate the height of your pane, draw it offscreen, then
    animate it down so that it is attached to the top of the viewport.

    @returns {SC.SheetPane} receiver
  */
  append: function() {
    var layout = this.get('layout');
    if (!layout.height || !layout.top) {
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
    }

    // Gently rest the pane atop the viewport
    layout.top = -1*layout.height;

    if (this.disableAnimation) this.disableAnimation();
    this.adjust(layout);
    this.updateLayout();
    if (this.enableAnimation) this.enableAnimation();
    
    return arguments.callee.base.apply(this,arguments);
  },

  /**
    Animates the sheet up, then removes it from the DOM once it is hidden from view.

    @returns {SC.SheetPane} receiver
  */
  remove: function() {
    // We want the functionality of SC.PanelPane.remove(), but we only want it once the animation is complete.
    // Store the reference to the superclass function, and it call it after the transition is complete.
    var that = this, args = arguments;
    this.invokeLater(function() { args.callee.base.apply(that, args) ;}, this.transitionDuration);
    this.slideUp();

    return this;
  },

  /**
    Once the pane has been rendered out to the DOM, begin the animation.
  */
  paneDidAttach: function() {
    var ret = arguments.callee.base.apply(this,arguments);
    // this.invokeLast(this.slideDown, this);
    this.slideDown();

    return ret;
  },

  slideDown: function(){
    // setup other general state
    this._state   = SC.SheetPane.ANIMATING;
    this._direction = SC.SheetPane.SLIDE_DOWN;
    if (SC.SheetPane.ANIMATABLE_AVAILABLE) {
      this.transitions.top.timing = SC.Animatable.TRANSITION_EASE_OUT;
      this.adjust('top', 0);
    } else {
      this._start   = Date.now();
      this._end     = this._start + this.get('transitionDuration');
      this.tick();
    }
  },

  slideUp: function(){
    // setup other general state
    this._state   = SC.SheetPane.ANIMATING;
    this._direction = SC.SheetPane.SLIDE_UP;
    if (SC.SheetPane.ANIMATABLE_AVAILABLE) {
      var layout = this.get('layout');
      this.transitions.top.timing = SC.Animatable.TRANSITION_EASE_IN;
      this.adjust('top', -1 * layout.height);
    } else {
      this._start   = Date.now();
      this._end     = this._start + this.get('transitionDuration');
      this.tick();
    }
  },

  _complete: function() {
    var dir = this._direction;

    if (dir === SC.SheetPane.SLIDE_DOWN) {
      if (!SC.SheetPane.ANIMATABLE_AVAILABLE) this.adjust('top', 0);

      // Make sure we recenter the panel after the animation
      // is complete.
      this.adjust({
        centerX: 0,
        left: null
      });
      if(SC.browser.mozilla) this.parentViewDidChange();
    } else {
      var layout = this.get('layout');
      if (!SC.SheetPane.ANIMATABLE_AVAILABLE) this.adjust('top', -1*layout.height);
    }
    
    this._state = SC.SheetPane.READY;
    this.updateLayout();
  },
  
  // Needed because of the runLoop and that it is animated...must lose focus because will break if selection is change on text fields that don't move.
  blurTo: function(pane) { this.setFirstResponder(''); },

  /** @private - called while the animation runs.  Will move the content view down until it is in position and then set the layout to the content layout
   */
  tick: function() {
    this._timer = null ; // clear out

    var now = Date.now();
    var pct = (now-this._start)/(this._end-this._start),
        target = this, dir = this._direction, layout = this.get('layout'), 
        newLayout, adjust;
    if (pct<0) pct = 0;
    
    // If we are done...
    if (pct>=1) {
      this._complete();
      return this;
    }

    // ok, now let's compute the new layouts for the two views and set them
    adjust = Math.floor(layout.height * pct);

    // set the layout for the views, depending on the direction
    if (dir == SC.SheetPane.SLIDE_DOWN) {
      target.adjust('top', 0-(layout.height-adjust));
    } else if (dir == SC.SheetPane.SLIDE_UP) {
      target.adjust('top', 0-adjust);
    }

    this._timer = this.invokeLater(this.tick, 20);
    target.updateLayout();
    return this;
  }
});

SC.SheetPane.mixin( /** @scope SC.SheetPane */ {
  
  ANIMATABLE_AVAILABLE: NO,
  
  // states for view animation
  NO_VIEW: 'NO_VIEW',
  ANIMATING: 'ANIMATING',
  READY: 'READY',

  SLIDE_DOWN: 'SLIDEDOWN',
  SLIDE_UP: 'SLIDEUP'
  
});

/* >>>>>>>>>> BEGIN source/protocols/drag_data_source.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('system/drag') ;


/**
  @namespace

  This mixin can be used to implement a dynamic data source for a drag 
  operation.  You can return a set of allowed data types and then the 
  method will be used to actually get data in that format when requested.
*/
SC.DragDataSource = {

  /** @property
    Implement this property as an array of data types you want to support
    for drag operations.
  */
  dragDataTypes: [],

  /**
    Implement this method to return the data in the format passed.  Return
    null if the requested data type cannot be generated.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
    @param {Object} dataType The proposed dataType to return.  This will 
      always be one of the data types declared in dragDataTypes.
    
    @returns The data object for the specified type
  */
  dragDataForType: function(drag, dataType) { return null; }
  
};



/* >>>>>>>>>> BEGIN source/protocols/drag_source.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('system/drag') ;

/**
  @mixin

  The DragSource protocol is used to dynamically generate multiple types of
  data from a single object.  You must implement this protocol if you want to
  provide the data for a drag event.

*/
SC.DragSource = {

  /**
    This method must be overridden for drag operations to be allowed. 
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value.
  
    @param {SC.View} dropTarget The proposed target of the drop.
    @param {SC.Drag} drag The SC.Drag instance managing this drag.
  
  */
  dragSourceOperationMaskFor: function(drag, dropTarget) { return SC.DRAG_NONE ; },
  
  /**
    If this property is set to NO or is not implemented, then the user may
    modify the drag operation by changing the modifier keys they have 
    pressed.
    
    @returns {Boolean}
  */
  ignoreModifierKeysWhileDragging: NO,
    
  /**  
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receiver is the source of the 
    drag.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
  
    @param {Point} loc The point in *window* coordinates where the drag 
      began.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidBegin: function(drag, loc) {},
  
  /**
    This method is called whenever the drag image is moved.  This is
    similar to the dragUpdated() method called on drop targets.

    @param {SC.Drag} drag The Drag instance managing this drag.

    @param {Point} loc  The point in *window* coordinates where the drag 
      mouse is.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidMove: function(drag, loc) {},
  
  /**  
    This method is called when the drag ended. You can use this to do any
    cleanup.  The operation is the actual operation performed on the drag.
  
    @param {SC.Drag} drag The drag instance managing the drag.
  
    @param {Point} loc The point in WINDOW coordinates where the drag 
      ended. 
  
    @param {DragOp} op The drag operation that was performed. One of 
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.
  
  */
  dragDidEnd: function(drag, loc, op) {}
  
} ;


/* >>>>>>>>>> BEGIN source/protocols/drop_target.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('system/drag');

/**
  @mixin
  
  Add the DropTarget mixin to your view to be able to accept drop events. You 
  should also override the methods below as needed to handle accepting of events.
  
  See the method descriptions for more information on what you need to implement.
  
  The general call sequence for all drop targets is (in pseudo-Ragel, regex
  format):
  
  dragStarted
  (
    computeDragOperations+
    (
      dragEntered
      dragUpdated
      ( computeDragOperations | dragUpdated )*
      ( acceptDragOperation performDragOperation? )? // mouseUp
      dragExited
    )*
  )*
  dragEnded
  
  Thus, every drop target will have its dragStarted and dragEnded methods called 
  once during every drag session. computeDragOperations, if called at all, may be 
  called more than once before the dragEntered method is called. Once dragEntered 
  is called, you are at guaranteed that both dragUpdated and dragExited will be 
  called at some point, followed by either dragEnded or additonal 
  computeDragOperation calls.
*/
SC.DropTarget = {
  
  /**
    Must be true when your view is instantiated.
    
    Drop targets must be specially registered in order to receive drop
    events.  SproutCore knows to register your view when this property
    is true on view creation.
  */  
  isDropTarget: true,
  
  /**
    Called when the drag is started, regardless of where or not your drop
    target is current. You can use this to highlight your drop target
    as "eligible".
    
    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object.
    @param {SC.Event}   evt  The most recent mouse move event.  Use to get location 
  */
  dragStarted: function(drag, evt) {},
  
  /**
    Called when the drag first enters the droppable area, if it returns a
    drag operations other than SC.DRAG_NONE.
    
    The default implementation does nothing.
    
    @param drag {SC.Drag} The current drag object.
    @param evt {SC.Event} The most recent mouse move event.  Use to get location
  */
  dragEntered: function(drag, evt) {},
  
  /**
    Called periodically when a drag is over your droppable area.
    
    Override this method this to update various elements of the drag state, 
    including the location of ghost view.  You should  use this method to 
    implement snapping.
    
    This method will be called periodically, even if the user is not moving
    the drag.  If you perform expensive operations, be sure to check the
    mouseLocation property of the drag to determine if you actually need to
    update anything before doing your expensive work.
    
    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object.
    @param {SC.Event} evt The most recent mouse move event. Use to get location
  */
  dragUpdated: function(drag, evt) {},
  
  /**
    Called when the user exits your droppable area or the drag ends
    and you were the last targeted droppable area.
    
    Override this method to perform any clean up on your UI such as hiding 
    a special highlight state or removing insertion points.
    
    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object
    @param {SC.Event}   evt  The most recent mouse move event. Use to get location.
  */
  dragExited: function(drag, evt) {},
  
  /**
    Called on all drop targets when the drag ends.  
    
    For example, the user might have dragged the view off the screen and let 
    go or they might have hit escape.  Override this method to perform any 
    final cleanup.  This will be called instead of dragExited.
    
    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object
    @param {SC.Event}   evt  The most recent mouse move event. Use to get location.
  */
  dragEnded: function(drag, evt) {},
  
  /**
    Called when the drag needs to determine which drag operations are
    valid in a given area.
    
    Override this method to return an OR'd mask of the allowed drag 
    operations.  If the user drags over a droppable area within another 
    droppable area, the drag will latch onto the deepest view that returns one 
    or more available operations.
    
    The default implementation returns SC.DRAG_NONE
    
    @param {SC.Drag} drag The current drag object
    @param {SC.Event} evt The most recent mouse move event.  Use to get 
      location 
    @returns {DragOps} A mask of all the drag operations allowed or 
      SC.DRAG_NONE
  */
  computeDragOperations: function(drag, evt) { return SC.DRAG_NONE; },
  
  /**
    Called when the user releases the mouse.
    
    This method gives your drop target one last opportunity to choose to 
    accept the proposed drop operation.  You might use this method to
    perform fine-grained checks on the drop location, for example.
    Return true to accept the drop operation.
    
    The default implementation returns YES.
    
    @param {SC.Drag} drag The drag instance managing this drag
    @param {DragOp} op The proposed drag operation. A drag constant
    
    @return {Boolean} YES if operation is OK, NO to cancel.
  */  
  acceptDragOperation: function(drag, op) { return YES; },
  
  /**
    Called to actually perform the drag operation.
    
    Overide this method to actually perform the drag operation.  This method
    is only called if you returned YES in acceptDragOperation(). 
    
    Return the operation that was actually performed or SC.DRAG_NONE if the 
    operation was aborted.
    
    The default implementation returns SC.DRAG_NONE
    
    @param {SC.Drag} drag The drag instance managing this drag
    @param {DragOp} op The proposed drag operation. A drag constant.
    
    @return {DragOp} Drag Operation actually performed
  */
  performDragOperation: function(drag, op) { return SC.DRAG_NONE; }
  
};

/* >>>>>>>>>> BEGIN source/protocols/responder.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/** @static

  This protocol defines the allowable responder methods. To implement a 
  specific responder method, and a method with the correct signature to your
  class.
  
  DO NOT INCLUDE THIS MIXIN.
  
  If you try and include this mixin, an error will be raised on startup.
  
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.ResponderProtocol = {
  
  // .......................................................................
  // Mouse Event Handlers
  //
  
  /**
    Called when the mouse is pressed. You must return YES to recieve 
    mouseDragged and mouseUp in the future.
    
    @param evt {SC.Event} the mousedown event
    @returns {Boolean} YES to receive additional mouse events, NO otherwise
  */
  mouseDown: function(evt) {},
  
  /**
    Called when the mouse is released.
    
    @param evt {SC.Event} the mouseup event
    @returns {Boolean} YES to handle the mouseUp, NO to allow click() and doubleClick() to be called
  */
  mouseUp: function(evt) {},
  
  /**
    Called when the mouse is dragged, after responding YES to a previous mouseDown:
    call.
    
    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseDragged: function(evt) {},
  
  /**
    Called when the mouse exits the view and the root responder is not in a
    drag session.
    
    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseOut: function(evt) {},
  
  /**
    Called when the mouse enters the view and the root responder is not in a
    drag session.
    
    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseOver: function(evt) {},
  
  /**
    Called when the mouse moves within the view and the root responder is not in a
    drag session.
    
    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseMoved: function(evt) {},
  
  
  /**
    Called when a selectstart event in IE is triggered. ONLY IE
    We use it to disable IE accelerators and text selection
    
    @param evt {SC.Event} the selectstart event
    @returns {void}
  */
  selectStart: function(evt) {},
  
  /**
     Called when a contextmenu event is triggered. Used to disable contextmenu
     per view.
     
     @param evt {SC.Event} the selectstart event
     @returns {void}
   */
  contextMenu: function(evt) {},
  
  // .......................................................................
  // Event Handlers
  //
  // These methods are called by the input manager in response to keyboard
  // events.  Most of these methods are defined here for you, but not actually
  // implemented in code.
  
  /**
    Insert the text or act on the key.
    
    @param {String} the text to insert or respond to
    @returns {Boolean} YES if you handled the method; NO otherwise
  */
  insertText: function(text) {},
  
  /**
    When the user presses a key-combination event, this will be called so you
    can run the command.
    
    @param charCode {String} the character code
    @param evt {SC.Event} the keydown event
    @returns {Boolean} YES if you handled th emethod; NO otherwise
  */
  performKeyEquivalent: function(charCode, evt) { return false; },
  
  /**
    This method is called if no other view in the current view hierarchy is
    bound to the escape or command-. key equivalent.  You can use this to 
    cancel whatever operation is running.
    
    @param sender {Object} the object that triggered; may be null
    @param evt {SC.Event} the event that triggered the method
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  cancel: function(sender, evt) {},
  
  /**
    Delete the current selection or delete one element backward from the
    current selection.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteBackward: function(sender, evt) {},
  
  /**
    Delete the current selection or delete one element forward from the
    current selection.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteForward: function(sender, evt) {},
  
  /**
    A field editor might respond by selecting the field before it.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertBacktab: function(sender, evt) {},
  
  /**
    Insert a newline character or end editing of the receiver.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertNewline: function(sender, evt) {},
  
  /**
    Insert a tab or move forward to the next field.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertTab: function(sender, evt) {},
  
  /**
    Move insertion point/selection backward one. (i.e. left arrow key)
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeft: function(sender, evt) {},
  
  /**
    Move the insertion point/selection forward one (i.e. right arrow key)
    in left-to-right text, this could be the left arrow key.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRight: function(sender, evt) {},
  
  /**
    Move the insertion point/selection up one (i.e. up arrow key)
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUp: function(sender, evt) {},
  
  /**
    Move the insertion point/selection down one (i.e. down arrow key)
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDown: function(sender, evt) {},
  
  /**
    Move left, extending the selection. - shift || alt
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeftAndModifySelection: function(sender, evt) {},
  
  /**
    Move right, extending the seleciton - shift || alt
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRightAndModifySelection: function(sender, evt) {},
  
  /**
    Move up, extending the selection - shift || alt
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUpAndModifySelection: function(sender, evt) {},
  
  /**
    Move down, extending selection - shift || alt
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDownAndModifySelection: function(sender, evt) {},
  
  /**
    Move insertion point/selection to beginning of document.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToBeginningOfDocument: function(sender, evt) {},
  
  /**
    Move insertion point/selection to end of document.
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToEndOfDocument: function(sender, evt) {},
  
  /**
    Page down
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageDown: function(sender, evt) {},
  
  /**
    Page up
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageUp: function(sender, evt) {},
  
  /**
    Select all
    
    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  selectAll: function(sender, evt) {}
  
};
/* >>>>>>>>>> BEGIN source/system/key_bindings.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

// Key Bindings are used to map a keyboard input to an action message on a
// responder.  These bindings are most useful when implementing sophisticated
// keyboard input mechanisms.  For keyboard shortcuts, instead use menus, etc.

SC.MODIFIED_KEY_BINDINGS = {
  'ctrl_.': 'cancel',
  'shift_tab': 'insertBacktab',
  'shift_left': 'moveLeftAndModifySelection',
  'shift_right': 'moveRightAndModifySelection',
  'shift_up': 'moveUpAndModifySelection',
  'shift_down': 'moveDownAndModifySelection',
  'alt_left': 'moveLeftAndModifySelection',
  'alt_right': 'moveRightAndModifySelection',
  'alt_up': 'moveUpAndModifySelection',
  'alt_down': 'moveDownAndModifySelection',
  'ctrl_a': 'selectAll'
} ;

SC.BASE_KEY_BINDINGS = {
  'escape': 'cancel',
  'backspace': 'deleteBackward',
  'delete': 'deleteForward',
  'return': 'insertNewline',
  'tab': 'insertTab',
  'left': 'moveLeft',
  'right': 'moveRight',
  'up': 'moveUp',
  'down': 'moveDown',
  'home': 'moveToBeginningOfDocument',
  'end': 'moveToEndOfDocument',
  'pagedown': 'pageDown',
  'pageup': 'pageUp'
} ;


/* >>>>>>>>>> BEGIN source/system/undo_manager.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('core');

/**
  @class
  
  This is a simple undo manager.  To use this UndoManager, all you need to
  do is to make sure that you register a function with this manager to undo
  every change you make.  You can then invoke the undo/redo methods to do it.
  
  h4. USING THE UNDOMANAGER
  
  Typically you create an undo manager inside on of your controllers.  Then,
  whenever you are about to perform an action on your model object, all you
  need to do is to register a function with the undo manager that can undo 
  whatever  you just did.
  
  Besure the undo function you register also saves undo functions.  This makes
  redo possible.
  
  More docs TBD.
  
  @extends SC.Object
*/
SC.UndoManager = SC.Object.extend(
/** @scope SC.UndoManager.prototype */
{

  /** 
    (Property) Name of the next undo action name.  
  
    Use this property to build your Undo menu name.
    
  */
  undoActionName: function() { 
    return this.undoStack ? this.undoStack.name : null ;
  }.property('undoStack'),
  
  /** 
    (Property) Name of the next return action name.  
  
    Use this property to build your Redo menu name.
    
  */
  redoActionName: function() { 
    return this.redoStack ? this.redoStack.name : null ;
  }.property('redoStack'),

  /** 
    True if there is an undo action on the stack.
    
    Use to validate your menu item.
  */
  canUndo: function() { 
    return this.undoStack != null; 
  }.property('undoStack'),
  
  /** 
    True if there is an redo action on the stack.
    
    Use to validate your menu item.
  */
  canRedo: function() { 
    return this.redoStack != null; 
  }.property('redoStack'),
  
  /**  
    Tries to undo the last action.  
  
    Returns true if succeeded.  Fails if an undo group is currently open.
  */
  undo: function() { this._undoOrRedo('undoStack','isUndoing'); },
  
  /**  
    Tries to redo the last action.  
  
    Returns true if succeeded.  Fails if an undo group is currently open.
  */
  redo: function() { this._undoOrRedo('redoStack','isRedoing'); },
  
  /**
    True if the manager is currently undoing events. 
  */
  isUndoing: false, 
  
  /**
    True if the manager is currently redoing events.
  */
  isRedoing: false, 
  
  /** @private */
  groupingLevel: 0,
  
  // --------------------------------
  // SIMPLE REGISTRATION
  //
  // These are the core method to register undo/redo events.
  
  /**
    This is how you save new undo events.
    
    @param {Function} func A prebound function to be invoked when the undo executes.
    @param {String} [name] An optional name for the undo.  If you are using 
      groups, this is not necessary.
  */
  registerUndo: function(func, name) {
    this.beginUndoGroup(name) ;
    this._activeGroup.actions.push(func) ;
    this.endUndoGroup(name) ;
  },

  /**
    Begins a new undo groups

    Whenver you start an action that you expect to need to bundle under a single
    undo action in the menu, you should begin an undo group.  This way any
    undo actions registered by other parts of the application will be
    automatically bundled into this one action.
    
    When you are finished performing the action, balance this with a call to
    endUndoGroup().
  */
  beginUndoGroup: function(name) {
    // is a group already active? Just increment the counter.
    if (this._activeGroup) {
      this.groupingLevel++ ;
      
    // otherwise, create a new active group.  
    } else {
      var stack = this.isUndoing ? 'redoStack' : 'undoStack' ;
      this._activeGroup = { name: name, actions: [], prev: this.get(stack) } ;
      this.set(stack, this._activeGroup) ;
      this.groupingLevel = 1 ;
    }
  },
 
  /** end the undo group.  see beginUndoGroup() */
  endUndoGroup: function(name) {
    // if more than one groups are active, just decrement the counter.
    if (!this._activeGroup) raise("endUndoGroup() called outside group.") ;
    if (this.groupingLevel > 1) {
      this.groupingLevel-- ;
      
    // otherwise, close out the current group.
    } else {
      this._activeGroup = null ; this.groupingLevel = 0 ;
    }
    this.propertyDidChange(this.isUndoing ? 'redoStack' : 'undoStack') ;
  },

  /**
    Change the name of the current undo group.  
  
    Normally you don't want to do this as it will effect the whole group.
  */
  setActionName: function(name) {
    if (!this._activeGroup) raise("setActionName() called outside group.") ;
    this._activeGroup.name = name ;
  },
  
  // --------------------------------
  // PRIVATE
  //
  _activeGroup: null, undoStack: null, redoStack: null, 
  _undoOrRedo: function(stack,state) {
    if (this._activeGroup) return false ;
    if (this.get(stack) == null) return true; // noting to do.

    this.set(state, true) ;
    var group = this.get(stack) ;
    this.set(stack, group.prev) ;
    var action ;

    var useGroup = group.actions.length > 1; 
    if (useGroup) this.beginUndoGroup(group.name) ;
    while(action = group.actions.pop()) { action(); }
    if (useGroup) this.endUndoGroup(group.name) ;
    
    this.set(state, false) ;
  }
  
}) ;

/* >>>>>>>>>> BEGIN source/views/checkbox.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Renders a checkbox button view specifically.
  
  This view is basically a button view preconfigured to generate the correct
  HTML and to set to use a TOGGLE_BEHAVIOR for its buttons.
  
  This view renders a simulated checkbox that can display a mixed state and 
  has other features not found in platform-native controls.  
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.ButtonView.extend(SC.StaticLayout, SC.Button,
  /** @scope SC.CheckboxView.prototype */ {

  classNames: ['sc-checkbox-view'],
  tagName: 'label',

  /* Ellipsis is disabled by default to allow multiline text */
  needsEllipsis: NO,

  render: function(context, firstTime) {
    var dt, elem,
        value = this.get('value'),
        ariaValue = value === SC.MIXED_MODE ? 
                'mixed' : (value === this.get('toggleOnValue') ? 
                    'true': 'false');
    
    // add checkbox -- set name to view guid to separate it from others
    if (firstTime) {
      var blank = SC.BLANK_IMAGE_URL,
          disabled = this.get('isEnabled') ? '' : 'disabled="disabled"',
          guid = SC.guidFor(this);
      
      context.attr('role', 'checkbox');
      dt = this._field_currentDisplayTitle = this.get('displayTitle');

      if(SC.browser.msie) context.attr('for', guid);
      context.push('<span class="button" ></span>');
      if(this.get('needsEllipsis')){
        context.push('<span class="label ellipsis">', dt, '</span>');
      }else{
        context.push('<span class="label">', dt, '</span>');  
      }
      context.attr('name', guid);

    // since we don't want to regenerate the contents each time 
    // actually search for and update the displayTitle.
    } else {
      
      dt = this.get('displayTitle');
      if (dt !== this._field_currentDisplayTitle) {
        this._field_currentDisplayTitle = dt;
        this.$('span.label').text(dt);
      }
    }
    context.attr('aria-checked', ariaValue);
  },
  
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  
  mouseDown: function(evt) {
    if(!this.get('isEnabled')) return YES;
    this.set('isActive', YES);
    this._isMouseDown = YES;
    // even if radiobuttons are not set to get firstResponder, allow default 
    // action, that way textfields loose focus as expected.
    if (evt) evt.allowDefault();
    return YES;
  },
  
  mouseUp: function(evt) {
    if(!this.get('isEnabled') || 
      (evt && evt.target && !this.$().within(evt.target))) {
      return YES;
    }
    var val = this.get('value');
    if (val === this.get('toggleOnValue')) {
      this.$().attr('aria-checked', 'false');
      this.set('value', this.get('toggleOffValue'));
    }
    else {
      this.$().attr('aria-checked', 'true');
      this.set('value', this.get('toggleOnValue'));
    }
    this.set('isActive', NO);
    this._isMouseDown = NO;
    return YES;
  },
  
  
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
    
}) ;

/* >>>>>>>>>> BEGIN source/views/list_item.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.LIST_ITEM_ACTION_CANCEL = 'sc-list-item-cancel-action';
SC.LIST_ITEM_ACTION_REFRESH = 'sc-list-item-cancel-refresh';
SC.LIST_ITEM_ACTION_EJECT = 'sc-list-item-cancel-eject';

/**
  @class
  
  Many times list items need to display a lot more than just a label of text.
  You often need to include checkboxes, icons, right icons, extra counts and 
  an action or warning icon to the far right. 
  
  A ListItemView can implement all of this for you in a more efficient way 
  than you might get if you simply put together a list item on your own using
  views.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Editable
  @extends SC.StaticLayout
  @since SproutCore 1.0
*/
SC.ListItemView = SC.View.extend(
    SC.Control,
/** @scope SC.ListItemView.prototype */ {
  
  classNames: ['sc-list-item-view'],
  
  // ..........................................................
  // KEY PROPERTIES
  // 
  
  /**
    The content object the list item will display.
    
    @type SC.Object
  */
  content: null,
  
  /**
    (displayDelegate) True if you want the item view to display an icon.
    
    If false, the icon on the list item view will be hidden.  Otherwise,
    space will be left for the icon next to the list item view.
  */
  hasContentIcon: NO,

  /**
    (displayDelegate) True if you want the item view to display a right icon.
    
    If false, the icon on the list item view will be hidden.  Otherwise,
    space will be left for the icon next to the list item view.
  */
  hasContentRightIcon: NO,
  
  /**
    (displayDelegate) True if you want space to be allocated for a branch 
    arrow.
    
    If false, the space for the branch arrow will be collapsed.
  */
  hasContentBranch: NO,
  
  /**
    (displayDelegate) The name of the property used for the checkbox value.
    
    The checkbox will only be visible if this key is not null.
    
    @type {String}
  */
  contentCheckboxKey: null,
  
  /**
    (displayDelegate) Property key to use for the icon url

    This property will be checked on the content object to determine the 
    icon to display.  It must return either a URL or a CSS class name.
  */
  contentIconKey: null,
 
  /**
    (displayDelegate) Property key to use for the right icon url

    This property will be checked on the content object to determine the 
    icon to display.  It must return either a URL or a CSS class name.
  */
  contentRightIconKey: null,
  
  /**
    (displayDelegate) The name of the property used for label itself
    
    If null, then the content object itself will be used..
  */
  contentValueKey: null,
  
  /**
    IF true, the label value will be escaped to avoid HTML injection attacks.
    You should only disable this option if you are sure you will only 
    display content that is already escaped and you need the added 
    performance gain.
  */
  escapeHTML: YES,
  
  /**
    (displayDelegate) The name of the property used to find the count of 
    unread items. 
    
    The count will only be visible if this property is not null and the 
    returned value is not 0.
  */
  contentUnreadCountKey: null,
  
  /**
    (displayDelegate) The name of the property used to determine if the item
    is a branch or leaf (i.e. if the branch icon should be displayed to the
    right edge.)
    
    If this is null, then the branch view will be completely hidden.
    Otherwise space will be allocated for it.
  */
  contentIsBranchKey: null,
  

  /**
    YES if the item view is currently editing.
  */
  isEditing: NO,
  
  /**
    Indent to use when rendering a list item with an outline level > 0.  The
    left edge of the list item will be indented by this amount for each 
    outline level.
  */
  outlineIndent: 16,
  
  /**
    Outline level for this list item.  Usually set by the collection view.
  */
  outlineLevel: 0,
  
  /**
    Disclosure state for this list item.  Usually set by the collection view
    when the list item is created.
  */
  disclosureState: SC.LEAF_NODE,

  /**
    The validator to use for the inline text field created when the list item
    is edited.
  */
  validator: null,

  contentPropertyDidChange: function() {
    //if (this.get('isEditing')) this.discardEditing() ;
    if (this.get('contentIsEditable') !== this.contentIsEditable()) {
      this.notifyPropertyChange('contentIsEditable');
    }
    
    this.displayDidChange();
  },
  
  /**
    Determines if content is editable or not.  Checkboxes and other related
    components will render disabled if an item is not editable.
  */
  contentIsEditable: function() {
    var content = this.get('content');
    return content && (content.get ? content.get('isEditable')!==NO : NO);
  }.property('content').cacheable(),
  
  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var content = this.get('content'),
        del     = this.displayDelegate,
        level   = this.get('outlineLevel'),
        indent  = this.get('outlineIndent'),
        key, value, working, classArray = [];
    
    // add alternating row classes
    classArray.push((this.get('contentIndex')%2 === 0) ? 'even' : 'odd');
    context.setClass('disabled', !this.get('isEnabled'));

    // outline level wrapper
    working = context.begin("div").addClass("sc-outline");
    if (level>=0 && indent>0) working.addStyle("left", indent*(level+1));

    // handle disclosure triangle
    value = this.get('disclosureState');
    if (value !== SC.LEAF_NODE) {
      this.renderDisclosure(working, value);
      classArray.push('has-disclosure');
    }
    
    
    // handle checkbox
    key = this.getDelegateProperty('contentCheckboxKey', del) ;
    if (key) {
      value = content ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderCheckbox(working, value);
      classArray.push('has-checkbox');
    }
    
    // handle icon
    if (this.getDelegateProperty('hasContentIcon', del)) {
      key = this.getDelegateProperty('contentIconKey', del) ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      
      this.renderIcon(working, value);
      classArray.push('has-icon');      
    }
    
    // handle label -- always invoke
    key = this.getDelegateProperty('contentValueKey', del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
    if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    this.renderLabel(working, value);

    // handle right icon
    if (this.getDelegateProperty('hasContentRightIcon', del)) {
      key = this.getDelegateProperty('contentRightIconKey', del) ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      
      this.renderRightIcon(working, value);
      classArray.push('has-right-icon');
    }
    
    // handle unread count
    key = this.getDelegateProperty('contentUnreadCountKey', del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (!SC.none(value) && (value !== 0)) {
      this.renderCount(working, value) ;
      var digits = ['zero', 'one', 'two', 'three', 'four', 'five'];
      var valueLength = value.toString().length;
      var digitsLength = digits.length;
      var digit = (valueLength < digitsLength) ? digits[valueLength] : digits[digitsLength-1];
      classArray.push('has-count '+digit+'-digit');
    }
    
    // handle action 
    key = this.getDelegateProperty('listItemActionProperty', del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (value) {
      this.renderAction(working, value);
      classArray.push('has-action');
    }
    
    // handle branch
    if (this.getDelegateProperty('hasContentBranch', del)) {
      key = this.getDelegateProperty('contentIsBranchKey', del);
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderBranch(working, value);
      classArray.push('has-branch');
    }
    context.addClass(classArray);
    context = working.end();
  },
  
  /**
    Adds a disclosure triangle with the appropriate display to the content.
    This method will only be called if the disclosure state of the view is
    something other than SC.LEAF_NODE.

    @param {SC.RenderContext} context the render context
    @param {Boolean} state YES, NO or SC.MIXED_STATE
    @returns {void}
  */
  renderDisclosure: function(context, state) {
    var key = (state === SC.BRANCH_OPEN) ? "open" : "closed",
        cache = this._scli_disclosureHtml,
        html, tmp;
        
    if (!cache) cache = this.constructor.prototype._scli_disclosureHtml = {};
    html = cache[key];

    if (!html) {
      html = cache[key] = '<img src="'+SC.BLANK_IMAGE_URL+'" class="disclosure button '+key+'" />';
    }
    
    context.push(html);
  },
  
  /**
    Adds a checkbox with the appropriate state to the content.  This method
    will only be called if the list item view is supposed to have a 
    checkbox.
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} state YES, NO or SC.MIXED_STATE
    @returns {void}
  */
  renderCheckbox: function(context, state) {
    
    var key = (state === SC.MIXED_STATE) ? "mixed" : state ? "sel" : "nosel",
        cache = this._scli_checkboxHtml,
        isEnabled = this.get('contentIsEditable') && this.get('isEnabled'),
        html, tmp, classArray=[];
        
    if (!isEnabled) key = SC.keyFor('disabled', key);
    if (!cache) cache = this.constructor.prototype._scli_checkboxHtml = {};
    html = cache[key];
    
    if (!html) {
      tmp = SC.RenderContext('div').attr('role', 'button')
        .classNames(SC.clone(SC.CheckboxView.prototype.classNames));

      // set state on html
      if (state === SC.MIXED_STATE) classArray.push('mixed');
      else if(state) classArray.push('sel');
      
      // disabled
      if(!isEnabled) classArray.push('disabled');
      
      tmp.addClass(classArray);

      // now add inner content.  note we do not add a real checkbox because
      // we don't want to have to setup a change observer on it.
      tmp.push('<span class="button"></span>');

      // apply edit
      html = cache[key] = tmp.join();
    }
    
    context.push(html);
  },
  
  /** 
    Generates an icon for the label based on the content.  This method will
    only be called if the list item view has icons enabled.  You can override
    this method to display your own type of icon if desired.
    
    @param {SC.RenderContext} context the render context
    @param {String} icon a URL or class name.
    @returns {void}
  */
  renderIcon: function(context, icon){
    // get a class name and url to include if relevant
    var url = null, className = null , classArray=[];
    if (icon && SC.ImageView.valueIsUrl(icon)) {
      url = icon; className = '' ;
    } else {
      className = icon; url = SC.BLANK_IMAGE_URL ;
    }
    
    // generate the img element...
    classArray.push(className,'icon');
    context.begin('img')
            .addClass(classArray)
            .attr('src', url)
            .end();
  },
  
  /** 
   Generates a label based on the content.  You can override this method to 
   render your own label if desired.

   @param {SC.RenderContext} context the render context
   @param {String} label the label to display, already HTML escaped.
   @returns {void}
  */
  renderLabel: function(context, label) {
    context.push('<label>', label || '', '</label>') ;
  },
  
  /**
    Finds and retrieves the element containing the label.  This is used
    for inline editing.  The default implementation returns a CoreQuery
    selecting any label elements.   If you override renderLabel() you 
    probably need to override this as well.
  
    @returns {SC.CoreQuery} CQ object selecting label elements
  */
  $label: function() {
    return this.$('label') ;
  },

  /** 
    Generates a right icon for the label based on the content. This method
    will only be called if the list item view has icons enabled. You can
    override this method to display your own type of icon if desired.
    
    @param {SC.RenderContext} context the render context
    @param {String} icon a URL or class name.
    @returns {void}
  */
  renderRightIcon: function(context, icon){
    // get a class name and url to include if relevant
    var url = null, className = null, classArray=[];
    if (icon && SC.ImageView.valueIsUrl(icon)) {
      url = icon; className = '' ;
    } else {
      className = icon; url = SC.BLANK_IMAGE_URL ;
    }
    
    // generate the img element...
    classArray.push('right-icon',className);
    context.begin('img')
      .addClass(classArray)
      .attr('src', url)
    .end();
  },
  
  /** 
   Generates an unread or other count for the list item.  This method will
   only be called if the list item view has counts enabled.  You can 
   override this method to display your own type of counts if desired.
   
   @param {SC.RenderContext} context the render context
   @param {Number} count the count
   @returns {void}
  */
  renderCount: function(context, count) {
    context.push('<span class="count"><span class="inner">',
                  count.toString(),'</span></span>') ;
  },
  
  /**
    Generates the html string used to represent the action item for your 
    list item.  override this to return your own custom HTML
    
    @param {SC.RenderContext} context the render context
    @param {String} actionClassName the name of the action item
    @returns {void}
  */
  renderAction: function(context, actionClassName){
    context.push('<img src="',SC.BLANK_IMAGE_URL,'" class="action" />');
  },
  
  /**
   Generates the string used to represent the branch arrow. override this to 
   return your own custom HTML
   
   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */
  renderBranch: function(context, hasBranch) {
    var classArray=[];
    classArray.push('branch',hasBranch ? 'branch-visible' : 'branch-hidden');
    context.begin('span')
          .addClass(classArray)
          .push('&nbsp;')
          .end();
  },
  
  /** 
    Determines if the event occured inside an element with the specified
    classname or not.
  */
  _isInsideElementWithClassName: function(className, evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do
    
    var el = SC.$(evt.target) ;
    var ret = NO, classNames ;
    while(!ret && el.length>0 && (el[0] !== layer)) {
      if (el.hasClass(className)) ret = YES ;
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },
  
  /** @private
    Returns YES if the list item has a checkbox and the event occurred 
    inside of it.
  */
  _isInsideCheckbox: function(evt) {
    var del = this.displayDelegate ;
    var checkboxKey = this.getDelegateProperty('contentCheckboxKey', del) ;
    return checkboxKey && this._isInsideElementWithClassName('sc-checkbox-view', evt);
  },
  
  /** @private 
    Returns YES if the list item has a disclosure triangle and the event 
    occurred inside of it.
  */
  _isInsideDisclosure: function(evt) {
    if (this.get('disclosureState')===SC.LEAF_NODE) return NO;
    return this._isInsideElementWithClassName('disclosure', evt);
  },
  
  /** @private 
    Returns YES if the list item has a right icon and the event 
    occurred inside of it.
  */
  _isInsideRightIcon: function(evt) {
    var del = this.displayDelegate ;
    var rightIconKey = this.getDelegateProperty('hasContentRightIcon', del) || !SC.none(this.rightIcon);
    return rightIconKey && this._isInsideElementWithClassName('right-icon', evt);
  },
  
  /** @private 
  mouseDown is handled only for clicks on the checkbox view or or action
  button.
  */
  mouseDown: function(evt) {
    
    // if content is not editable, then always let collection view handle the
    // event.
    if (!this.get('contentIsEditable')) return NO ; 
    
    // if occurred inside checkbox, item view should handle the event.
    if (this._isInsideCheckbox(evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseDownOnCheckbox = YES ;
      this._isMouseInsideCheckbox = YES ;
      return YES ; // listItem should handle this event

    } else if (this._isInsideDisclosure(evt)) {
      this._addDisclosureActiveState();
      this._isMouseDownOnDisclosure = YES;
      this._isMouseInsideDisclosure = YES ;
      return YES;
    } else if (this._isInsideRightIcon(evt)) {
      this._addRightIconActiveState();
      this._isMouseDownOnRightIcon = YES;
      this._isMouseInsideRightIcon = YES ;
      return YES;
    }
    
    return NO ; // let the collection view handle this event
  },
  
  mouseUp: function(evt) {
    var ret= NO, del, checkboxKey, content, state, idx, set;

    // if mouse was down in checkbox -- then handle mouse up, otherwise 
    // allow parent view to handle event.
    if (this._isMouseDownOnCheckbox) {
   
      // update only if mouse inside on mouse up...
      if (this._isInsideCheckbox(evt)) {
        del = this.displayDelegate ;
        checkboxKey = this.getDelegateProperty('contentCheckboxKey', del);
        content = this.get('content') ;
        if (content && content.get) {
          var value = content.get(checkboxKey) ;
          value = (value === SC.MIXED_STATE) ? YES : !value ;
          content.set(checkboxKey, value) ; // update content
          this.displayDidChange(); // repaint view...
        }
      }
 
      this._removeCheckboxActiveState() ;
      ret = YES ;
    
    // if mouse as down on disclosure -- handle mosue up.  otherwise pass on
    // to parent.
    } else if (this._isMouseDownOnDisclosure) {
      if (this._isInsideDisclosure(evt)) {
        state = this.get('disclosureState');
        idx   = this.get('contentIndex');
        set   = (!SC.none(idx)) ? SC.IndexSet.create(idx) : null;
        del = this.get('displayDelegate');
        
        if (state === SC.BRANCH_OPEN) {
          if (set && del && del.collapse) del.collapse(set);
          else this.set('disclosureState', SC.BRANCH_CLOSED);
          this.displayDidChange();
          
        } else if (state === SC.BRANCH_CLOSED) {
          if (set && del && del.expand) del.expand(set);
          else this.set('disclosureState', SC.BRANCH_OPEN);
          this.displayDidChange();
        }
      }
     
      this._removeDisclosureActiveState();
      ret = YES ;
    // if mouse was down in right icon -- then handle mouse up, otherwise 
    // allow parent view to handle event.
    } else if (this._isMouseDownOnRightIcon) {
      this._removeRightIconActiveState() ;
      ret = YES ;
    } 
   
    // clear cached info
    this._isMouseInsideCheckbox = this._isMouseDownOnCheckbox = NO ;
    this._isMouseDownOnDisclosure = this._isMouseInsideDisclosure = NO ;
    this._isMouseInsideRightIcon = this._isMouseDownOnRightIcon = NO ;
    return ret ;
  },
  
  mouseMoved: function(evt) {
    if (this._isMouseDownOnCheckbox && this._isInsideCheckbox(evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseInsideCheckbox = YES ;
    } else if (this._isMouseDownOnCheckbox) {
      this._removeCheckboxActiveState() ;
      this._isMouseInsideCheckbox = NO ;
    } else if (this._isMouseDownOnDisclosure && this._isInsideDisclosure(evt)) {
      this._addDisclosureActiveState();
      this._isMouseInsideDisclosure = YES;
    } else if (this._isMouseDownOnDisclosure) {
      this._removeDisclosureActiveState();
      this._isMouseInsideDisclosure = NO ;
    } else if (this._isMouseDownOnRightIcon && this._isInsideRightIcon(evt)) {
      this._addRightIconActiveState();
      this._isMouseInsideRightIcon = YES;
    } else if (this._isMouseDownOnRightIcon) {
      this._removeRightIconActiveState();
      this._isMouseInsideRightIcon = NO ;
    }
    return NO ;
  },
  
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },
  
  touchExited: function(evt){
    return this.mouseExited(evt);
  },
  
  
  _addCheckboxActiveState: function() {
    var enabled = this.get('isEnabled');
    this.$('.sc-checkbox-view').setClass('active', enabled);
  },
  
  _removeCheckboxActiveState: function() {
    this.$('.sc-checkbox-view').removeClass('active');
  },

  _addDisclosureActiveState: function() {
    var enabled = this.get('isEnabled');
    this.$('img.disclosure').setClass('active', enabled);
  },
  
  _removeDisclosureActiveState: function() {
    this.$('img.disclosure').removeClass('active');
  },

  _addRightIconActiveState: function() {
    this.$('img.right-icon').setClass('active', YES);
  },
  
  _removeRightIconActiveState: function() {
    this.$('img.right-icon').removeClass('active');
  },
  
  /**
    Returns true if a click is on the label text itself to enable editing.
  
    Note that if you override renderLabel(), you probably need to override 
    this as well, or just $label() if you only want to control the element
    returned.
  
    @param evt {Event} the mouseUp event.
    @returns {Boolean} YES if the mouse was on the content element itself.
  */
  contentHitTest: function(evt) {
    // if not content value is returned, not much to do.
    var del = this.displayDelegate ;
    var labelKey = this.getDelegateProperty('contentValueKey', del) ;
    if (!labelKey) return NO ;

    // get the element to check for.
    var el = this.$label()[0] ;
    if (!el) return NO ; // no label to check for.

    var cur = evt.target, layer = this.get('layer') ;
    while(cur && (cur !== layer) && (cur !== window)) {
      if (cur === el) return YES ;
      cur = cur.parentNode ;
    }

    return NO;
  },
  
  beginEditing: function() {
    if (this.get('isEditing')) return YES ;
    //if (!this.get('contentIsEditable')) return NO ;
    return this._beginEditing(YES);
  },
  
  _beginEditing: function(scrollIfNeeded) {
    var content   = this.get('content'),
        del       = this.get('displayDelegate'),
        labelKey  = this.getDelegateProperty('contentValueKey', del),
        parent    = this.get('parentView'),
        pf        = parent ? parent.get('frame') : null,
        el        = this.$label(),
        validator = this.get('validator'),
        f, v, offset, oldLineHeight, fontSize, top, lineHeight, escapeHTML,
        lineHeightShift, targetLineHeight, ret ;

    // if possible, find a nearby scroll view and scroll into view.
    // HACK: if we scrolled, then wait for a loop and get the item view again
    // and begin editing.  Right now collection view will regenerate the item
    // view too often.
    if (scrollIfNeeded && this.scrollToVisible()) {
      var collectionView = this.get('owner'), idx = this.get('contentIndex');
      this.invokeLast(function() {
        var item = collectionView.itemViewForContentIndex(idx);
        if (item && item._beginEditing) item._beginEditing(NO);
      });
      return YES; // let the scroll happen then begin editing...
    }
    
    // nothing to do...    
    if (!parent || !el || el.get('length')===0) return NO ;
    v = (labelKey && content && content.get) ? content.get(labelKey) : null ;
    
    f = this.computeFrameWithParentFrame(null);
    offset = SC.viewportOffset(el[0]);
    
    // if the label has a large line height, try to adjust it to something
    // more reasonable so that it looks right when we show the popup editor.
    oldLineHeight = el.css('lineHeight');
    fontSize = el.css('fontSize');
    top = this.$().css('top');

    if (top) top = parseInt(top.substring(0,top.length-2),0);
    else top =0;

    lineHeight = oldLineHeight;
    lineHeightShift = 0;

    if (fontSize && lineHeight) {
      targetLineHeight = fontSize * 1.5 ;
      if (targetLineHeight < lineHeight) {
        el.css({ lineHeight: '1.5' });
        lineHeightShift = (lineHeight - targetLineHeight) / 2; 
      } else oldLineHeight = null ;
    }

    f.x = offset.x;
    f.y = offset.y+top + lineHeightShift ;
    f.height = el[0].offsetHeight ;
    f.width = el[0].offsetWidth ;

    escapeHTML = this.get('escapeHTML');

    ret = SC.InlineTextFieldView.beginEditing({
      frame: f, 
      exampleElement: el, 
      delegate: this, 
      value: v,
      multiline: NO,
      isCollection: YES,
      validator: validator,
      escapeHTML: escapeHTML
    }) ;

    // restore old line height for original item if the old line height 
    // was saved.
    if (oldLineHeight) el.css({ lineHeight: oldLineHeight }) ;

    // Done!  If this failed, then set editing back to no.
    return ret ;
  },
  
  commitEditing: function() {
   if (!this.get('isEditing')) return YES ;
   return SC.InlineTextFieldView.commitEditing();
  },
  
  discardEditing: function() {
   if (!this.get('isEditing')) return YES ;
   return SC.InlineTextFieldView.discardEditing();
  },
  
  /** @private
   Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function(inlineEditor) {
   this.set('isEditing', YES);
  },
  
  /** @private 
   Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(inlineEditor) {
   var el = this.$label() ;
   this._oldOpacity = el.css('opacity');
   el.css('opacity', 0.0) ;
  },
  
  /** @private
   Could check with a validator someday...
  */
  inlineEditorShouldBeginEditing: function(inlineEditor) {
   return YES ;
  },

  /** @private
   Could check with a validator someday...
  */
  inlineEditorShouldBeginEditing: function(inlineEditor, finalValue) {
    return YES ;
  },

  inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
   return YES ;
  },
  
  /** @private
   Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
    this.set('isEditing', NO) ;
    
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    var labelKey = this.getDelegateProperty('contentValueKey', del) ;
    if (labelKey && content && content.set) {
     content.set(labelKey, finalValue) ;
    }
    this.displayDidChange();
  }
  
});

/* >>>>>>>>>> BEGIN source/views/collection.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/collection_view_delegate') ;
sc_require('views/list_item');

/**
  Special drag operation passed to delegate if the collection view proposes
  to perform a reorder event.
*/
SC.DRAG_REORDER = 0x0010 ;

/** Indicates that selection points should be selected using horizontal 
  orientation.
*/
SC.HORIZONTAL_ORIENTATION = 'horizontal';

/** Selection points should be selected using vertical orientation. */
SC.VERTICAL_ORIENTATION = 'vertical' ;

SC.BENCHMARK_RELOAD = NO ;

/**
  @class 

  TODO: Document SC.CollectionView
  
  Renders a collection of views from a source array of model objects.
   
  The CollectionView is the root view class for rendering collections of 
  views based on a source array of objects.  It can automatically create the
  and layout the views, including displaying them in groups.  It also 
  handles event input for the entire collection.
  
  To use CollectionView, just create the view and set the 'content' property
  to an array of objects.  (Note that if you setup a binding, it will 
  always transform content to an array.)  The view will create instances of
  exampleView to render the array.  You can also bind to the selection 
  property if you want to monitor selection. (be sure to set the isEnabled
  property to allow selection.)
  
  @extends SC.View
  @extends SC.CollectionViewDelegate
  @extends SC.CollectionContent
  @since SproutCore 0.9
*/
SC.CollectionView = SC.View.extend(
  SC.CollectionViewDelegate,
  SC.CollectionContent,
/** @scope SC.CollectionView.prototype */ {
  
  classNames: ['sc-collection-view'],
  
  ACTION_DELAY: 200,
  
  // ......................................
  // PROPERTIES
  //
  
  /**
    If YES, uses the VERY EXPERIMENTAL fast CollectionView path.
  */
  useFastPath: NO,
  
  /**
    An array of content objects
    
    This array should contain the content objects you want the collection view 
    to display.  An item view (based on the exampleView view class) will be 
    created for each content object, in the order the content objects appear 
    in this array.
    
    If you make the collection editable, the collection view will also modify 
    this array using the observable array methods of SC.Array.
    
    Usually you will want to bind this property to a controller property 
    that actually contains the array of objects you to display.
    
    @type {SC.Array}
  */
  content: null,
  
  /** @private */
  contentBindingDefault: SC.Binding.multiple(),
  
  /**
    The current length of the content.
    
    @property
    @type {Numer}
  */
  length: 0,
  
  /**
    The set of indexes that are currently tracked by the collection view.
    This property is used to determine the range of items the collection view
    should monitor for changes.
    
    The default implementation of this property returns an index set covering
    the entire range of the content.  It changes automatically whenever the
    length changes.
    
    Note that the returned index set for this property will always be frozen.
    To change the nowShowing index set, you must create a new index set and 
    apply it.
    
    @property
    @type {SC.IndexSet}
  */
  nowShowing: function() {
    return this.computeNowShowing();
  }.property('length', 'clippingFrame').cacheable(),
  
  /**
    Indexes of selected content objects.  This SC.SelectionSet is modified 
    automatically by the collection view when the user changes the selection 
    on the collection.
    
    Any item views representing content objects in this set will have their 
    isSelected property set to YES automatically.
    
    @type {SC.SelectionSet}
  */
  selection: null,
  
  /** 
    Allow user to select content using the mouse and keyboard.
    
    Set this property to NO to disallow the user from selecting items. If you 
    have items in your selectedIndexes property, they will still be reflected
    visually.
    
    @type {Boolean}
  */
  isSelectable: YES,
  
  /** @private */
  isSelectableBindingDefault: SC.Binding.bool(),
  
  /**
    Enable or disable the view.  
    
    The collection view will set the isEnabled property of its item views to
    reflect the same view of this property.  Whenever isEnabled is false,
    the collection view will also be not selectable or editable, regardless of 
    the settings for isEditable & isSelectable.
    
    @type {Boolean}
  */
  isEnabled: YES,
  
  /** @private */
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to edit content views.
    
    The collection view will set the isEditable property on its item views to
    reflect the same value of this property.  Whenever isEditable is false, 
    the user will not be able to reorder, add, or delete items regardless of 
    the canReorderContent and canDeleteContent and isDropTarget properties.
    
    @type {Boolean}
  */
  isEditable: YES,
  
  /** @private */
  isEditableBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to reorder items using drag and drop.
    
    If true, the user will can use drag and drop to reorder items in the list.
    If you also accept drops, this will allow the user to drop items into 
    specific points in the list.  Otherwise items will be added to the end.
    
    @type {Boolean}
  */
  canReorderContent: NO,
  
  /** @private */
  canReorderContentBindingDefault: SC.Binding.bool(),
  
  /**
    Allow the user to delete items using the delete key
    
    If true the user will be allowed to delete selected items using the delete
    key.  Otherwise deletes will not be permitted.
    
    @type {Boolean}
  */
  canDeleteContent: NO,
  
  /** @private */
  canDeleteContentBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to edit the content by double clicking on it or hitting return.
    This will only work if isEditable is YES and the item view implements 
    the beginEditing() method.
    
    @type {Boolean}
  */
  canEditContent: NO,
  
  /** @private */
  canEditContentBindingDefault: SC.Binding.bool(),
  
  /**
    Accept drops for data other than reordering.
    
    Setting this property to return true when the view is instantiated will 
    cause it to be registered as a drop target, activating the other drop 
    machinery.
    
    @type {Boolean}
  */
  isDropTarget: NO,
  
  /**
    Use toggle selection instead of normal click behavior.
    
    If set to true, then selection will use a toggle instead of the normal
    click behavior.  Command modifiers will be ignored and instead clicking
    once will select an item and clicking on it again will deselect it.
    
    @type {Boolean}
  */
  useToggleSelection: NO,
  
  /**
    Trigger the action method on a single click.
    
    Normally, clicking on an item view in a collection will select the content 
    object and double clicking will trigger the action method on the 
    collection view.
    
    If you set this property to YES, then clicking on a view will both select 
    it (if isSelected is true) and trigger the action method.  
    
    Use this if you are using the collection view as a menu of items.
    
    @property {Boolean}
  */  
  actOnSelect: NO,
  
  
  /**
    Select an item immediately on mouse down
    
    Normally as soon as you begin a click the item will be selected.
    
    In some UI scenarios, you might want to prevent selection until
    the mouse is released, so you can perform, for instance, a drag operation
    without actually selecting the target item.  
    
    @property {Boolean}
  */  
  selectOnMouseDown: YES,
  
  /**
    The view class to use when creating new item views.
    
    The collection view will automatically create an instance of the view 
    class you set here for each item in its content array.  You should provide 
    your own subclass for this property to display the type of content you 
    want.
    
    For best results, the view you set here should understand the following 
    properties:
    
    - *content* The content object from the content array your view should display
    - *isEnabled* True if the view should appear enabled
    - *isSelected* True if the view should appear selected
    
    In general you do not want your child views to actually respond to mouse 
    and keyboard events themselves.  It is better to let the collection view 
    do that.
    
    If you do implement your own event handlers such as mouseDown or mouseUp, 
    you should be sure to actually call the same method on the collection view 
    to give it the chance to perform its own selection housekeeping.
    
    @property {SC.View}
  */
  exampleView: SC.ListItemView,
  
  /**
    If set, this key will be used to get the example view for a given
    content object.  The exampleView property will be ignored.
    
    @property {String}
  */
  contentExampleViewKey: null,

  /**
    The view class to use when creating new group item views.
    
    The collection view will automatically create an instance of the view 
    class you set here for each item in its content array.  You should provide 
    your own subclass for this property to display the type of content you 
    want.
    
    If you leave this set to null then the regular example view will be used
    with the isGroupView property set to YES on the item view.
    
    @property {SC.View}
  */
  groupExampleView: null,
  
  /**
    If set, this key will be used to get the example view for a given
    content object.  The groupExampleView property will be ignored.
    
    @property {String}
  */
  contentGroupExampleViewKey: null,
  
  /**
    Invoked when the user double clicks on an item (or single clicks of 
    actOnSelect is true)
    
    Set this to the name of the action you want to send down the
    responder chain when the user double clicks on an item (or single clicks 
    if actOnSelect is true).  You can optionally specify a specific target as 
    well using the target property.
    
    If you do not specify an action, then the collection view will also try to 
    invoke the action named on the target item view.
    
    Older versions of SproutCore expected the action property to contain an 
    actual function that would be run.  This format is still supported but is 
    deprecated for future use.  You should generally use the responder chain 
    to handle your action for you.
    
    @property {String}
  */  
  action: null,
  
  /**
    Optional target to send the action to when the user double clicks.
    
    If you set the action property to the name of an action, you can 
    optionally specify the target object you want the action to be sent to.  
    This can be either an actual object or a property path that will resolve 
    to an object at the time that the action is invoked.  
    
    This property is ignored if you use the deprecated approach of making the
    action property a function.
    
    @property {String|Object}
  */
  target: null,
  
  /** 
    Property on content items to use for display.
    
    Built-in item views such as the LabelViews and ImageViews will use the
    value of this property as a key on the content object to determine the
    value they should display.
    
    For example, if you set contentValueKey to 'name' and set the 
    exampleView to an SC.LabelView, then the label views created by the 
    colleciton view will display the value of the content.name.
    
    If you are writing your own custom item view for a collection, you can
    get this behavior automatically by including the SC.Control mixin on your
    view.  You can also ignore this property if you like.  The collection view
    itself does not use this property to impact rendering.
    
    @property {String}
  */
  contentValueKey: null,
  
  /**
    Enables keyboard-based navigate, deletion, etc. if set to true.
  */
  acceptsFirstResponder: NO,
  
  /**
    Changing this property value by default will cause the CollectionView to
    add/remove an 'active' class name to the root element.
    
    @type Boolean
  */
  isActive: NO,
  
  
  /** 
    This property is used to store the calculated height to have 
    a consistent scrolling behavior due to the issues generated by using top
    instead of scrollTop. We could look at the min-height set in the view, but
    to avoid perf hits we simply store it and the scrollView will use it if 
    different than 0.
    
    @type Number
  */  
  calculatedHeight: 0,
  
  /** 
    This property is used to store the calculated width to have 
    a consistent scrolling behavior due to the issues generated by using left
    instead of scrollLeft. We could look at the min-width set in the view, but
    to avoid perf hits we simply store it and the scrollView will use it if 
    different than 0.
    
    @type Number
  */
  calculatedWidth: 0,
  
  
  // ..........................................................
  // SUBCLASS METHODS
  // 
  
  /**
    Override to return the computed layout dimensions of the collection view.
    You can omit any dimensions you don't care about setting in your 
    computed value.
    
    This layout is automatically applied whenever the content changes.
    
    If you don't care about computing the layout at all, you can return null.
    
    @returns {Hash} layout properties
  */
  computeLayout: function() { return null; },
  
  /**
    Override to compute the layout of the itemView for the content at the 
    specified index.  This layout will be applied to the view just before it
    is rendered.
    
    @param {Number} contentIndex the index of content being rendered by
      itemView
    @returns {Hash} a view layout
  */
  layoutForContentIndex: function(contentIndex) {
    return null ;
  },
  
  /**
    This computed property returns an index set selecting all content indexes.
    It will recompute anytime the length of the collection view changes.
    
    This is used by the default contentIndexesInRect() implementation.
    
    @property {SC.Range}
  */
  allContentIndexes: function() {
    return SC.IndexSet.create(0, this.get('length')).freeze();
  }.property('length').cacheable(),
  
  /**
    Override to return an IndexSet with the indexes that are at least 
    partially visible in the passed rectangle.  This method is used by the 
    default implementation of computeNowShowing() to determine the new 
    nowShowing range after a scroll.
    
    Override this method to implement incremental rendering.
    
    The default simply returns the current content length.
    
    @param {Rect} rect the visible rect
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function(rect) {
    return null; // select all
  },
  
  /**
    Compute the nowShowing index set.  The default implementation simply 
    returns the full range.  Override to implement incremental rendering.
    
    You should not normally call this method yourself.  Instead get the 
    nowShowing property.
    
    @returns {SC.IndexSet} new now showing range
  */
  computeNowShowing: function() {
    var r = this.contentIndexesInRect(this.get('clippingFrame'));
    if (!r) r = this.get('allContentIndexes'); // default show all

    // make sure the index set doesn't contain any indexes greater than the
    // actual content.
    else {
      var len = this.get('length'), 
          max = r.get('max');
      if (max > len) r = r.copy().remove(len, max-len).freeze();
    }
    
    return r ;
  },
  
  /** 
    Override to show the insertion point during a drag.
    
    Called during a drag to show the insertion point.  Passed value is the
    item view that you should display the insertion point before.  If the
    passed value is null, then you should show the insertion point AFTER that
    last item view returned by the itemViews property.
    
    Once this method is called, you are guaranteed to also recieve a call to
    hideInsertionPoint() at some point in the future.
    
    The default implementation of this method does nothing.
    
    @param itemView {SC.ClassicView} view the insertion point should appear directly before. If null, show insertion point at end.
    @param dropOperation {Number} the drop operation.  will be SC.DROP_BEFORE, SC.DROP_AFTER, or SC.DROP_ON
    
    @returns {void}
  */
  showInsertionPoint: function(itemView, dropOperation) {
  },
  
  /**
    Override to hide the insertion point when a drag ends.
    
    Called during a drag to hide the insertion point.  This will be called 
    when the user exits the view, cancels the drag or completes the drag.  It 
    will not be called when the insertion point changes during a drag.
    
    You should expect to receive one or more calls to 
    showInsertionPointBefore() during a drag followed by at least one call to 
    this method at the end.  Your method should not raise an error if it is 
    called more than once.
    
    @returns {void}
  */
  hideInsertionPoint: function() {
  },
  
  // ..........................................................
  // DELEGATE SUPPORT
  // 
  
  
  /**
    Delegate used to implement fine-grained control over collection view 
    behaviors.
    
    You can assign a delegate object to this property that will be consulted
    for various decisions regarding drag and drop, selection behavior, and
    even rendering.  The object you place here must implement some or all of
    the SC.CollectionViewDelegate mixin.
    
    If you do not supply a delegate but the content object you set implements 
    the SC.CollectionViewDelegate mixin, then the content will be 
    automatically set as the delegate.  Usually you will work with a 
    CollectionView in this way rather than setting a delegate explicitly.
    
    @type {SC.CollectionViewDelegate}
  */
  delegate: null,
  
  /**
    The delegate responsible for handling selection changes.  This property
    will be either the delegate, content, or the collection view itself, 
    whichever implements the SC.CollectionViewDelegate mixin.
    
    @property
    @type {Object}
  */
  selectionDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isCollectionViewDelegate', del, content);  
  }.property('delegate', 'content').cacheable(),
  
  /**
    The delegate responsible for providing additional display information 
    about the content.  If you bind a collection view to a controller, this
    the content will usually also be the content delegate, though you 
    could implement your own delegate if you prefer.
    
    @property
    @type {Object}
  */
  contentDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isCollectionContent', del, content);
  }.property('delegate', 'content').cacheable(),
  
  
  /** @private
    A cache of the contentGroupIndexes value returned by the delegate.  This
    is frequently accessed and usually involves creating an SC.IndexSet
    object, so it's worthwhile to cache.
  */
  _contentGroupIndexes: function() {
    return this.get('contentDelegate').contentGroupIndexes(this, this.get('content'));
  }.property('contentDelegate', 'content').cacheable(),
  
  // ..........................................................
  // CONTENT CHANGES
  // 
  
  /**
    Called whenever the content array or an item in the content array or a
    property on an item in the content array changes.  Reloads the appropriate
    item view when the content array itself changes or calls 
    contentPropertyDidChange() if a property changes.
    
    Normally you will not call this method directly though you may override
    it if you need to change the way changes to observed ranges are handled.
    
    @param {SC.Array} content the content array generating the change
    @param {Object} object the changed object
    @param {String} key the changed property or '[]' or an array change
    @param {SC.IndexSet} indexes affected indexes or null for all items
    @returns {void}
  */
  contentRangeDidChange: function(content, object, key, indexes) {
    if (!object && (key === '[]')) {
      this.notifyPropertyChange('_contentGroupIndexes');
      this.reload(indexes); // note: if indexes == null, reloads all
    } else {
      this.contentPropertyDidChange(object, key, indexes);
    }
  },

  /**
    Called whenever a property on an item in the content array changes.  This
    is only called if you have set observesContentProperties to YES.
    
    Override this property if you want to do some custom work whenever a 
    property on a content object changes.

    The default implementation does nothing.
    
    @param {Object} target the object that changed
    @param {String} key the property that changed value
    @param {SC.IndexSet} indexes the indexes in the content array affected
    @returns {void}
  */
  contentPropertyDidChange: function(target, key, indexes) {
    // Default Does Nothing
  },
  
  /**
    Called whenever the view needs to updates it's contentRangeObserver to 
    reflect the current nowShowing index set.  You will not usually call this
    method yourself but you may override it if you need to provide some 
    custom range observer behavior.

    Note that if you do implement this method, you are expected to maintain
    the range observer object yourself.  If a range observer has not been
    created yet, this method should create it.  If an observer already exists
    this method should udpate it.
    
    When you create a new range observer, the oberver must eventually call
    contentRangeDidChange() for the collection view to function properly.
    
    If you override this method you probably also need to override 
    destroyRangeObserver() to cleanup any existing range observer.
    
    @returns {void}
  */
  updateContentRangeObserver: function() {
    var nowShowing = this.get('nowShowing'),
        observer   = this._cv_contentRangeObserver,
        content    = this.get('content');
    
    if (!content) return ; // nothing to do
    
    if (observer) {
      content.updateRangeObserver(observer, nowShowing);
    } else {
      var func = this.contentRangeDidChange;
      observer = content.addRangeObserver(nowShowing, this, func, null);      
      this._cv_contentRangeObserver = observer ;
    }
    
  },
  
  /**
    Called whever the view needs to invalidate the current content range 
    observer.  This is called whenever the content array changes.  You will 
    not usually call this method yourself but you may override it if you 
    provide your own range observer behavior.

    Note that if you override this method you should probably also override
    updateRangeObserver() to create or update a range oberver as needed.
    
    @returns {void}
  */
  removeContentRangeObserver: function() {
    var content  = this.get('content'),
        observer = this._cv_contentRangeObserver ;
        
    if (observer) {
      if (content) content.removeRangeObserver(observer);
      this._cv_contentRangeObserver = null ;
    }
  },
    
  /**
    Called whenever the content length changes.  This will invalidate the 
    length property of the view itself causing the nowShowing to recompute
    which will in turn update the UI accordingly.
    
    @returns {void}
  */
  contentLengthDidChange: function() {
    var content = this.get('content');
    this.set('length', content ? content.get('length') : 0);
  },
  
  /** @private
    Whenever content property changes to a new value:
    
     - remove any old observers 
     - setup new observers (maybe wait until end of runloop to do this?)
     - recalc height/reload content
     - set content as delegate if delegate was old content
     - reset selection
     
    Whenever content array mutates:
    
     - possibly stop observing property changes on objects, observe new objs
     - reload effected item views
     - update layout for receiver
  */
  _cv_contentDidChange: function() {
    var content = this.get('content'),
        lfunc   = this.contentLengthDidChange ;

    if (content === this._content) return; // nothing to do

    // cleanup old content
    this.removeContentRangeObserver();
    if (this._content) {
      this._content.removeObserver('length', this, lfunc);
    }
    
    // cache
    this._content = content;
    
    // add new observers - range observer will be added lazily
    if (content) {
      content.addObserver('length', this, lfunc);
    }
    
    // notify all items changed
    this.contentLengthDidChange();
    this.contentRangeDidChange(content, null, '[]', null);
    
  }.observes('content'),
  
  // ..........................................................
  // ITEM VIEWS
  // 
  
  /** @private
  
    The indexes that need to be reloaded.  Must be one of YES, NO, or an
    SC.IndexSet.
  
  */
  _invalidIndexes: NO,
  
  /** 
    Regenerates the item views for the content items at the specified indexes.
    If you pass null instead of an index set, regenerates all item views.
    
    This method is called automatically whenever the content array changes in
    an observable way, but you can call its yourself also if you need to 
    refresh the collection view for some reason.
    
    Note that if the length of the content is shorter than the child views
    and you call this method, then the child views will be removed no matter
    what the index.
    
    @param {SC.IndexSet} indexes
    @returns {SC.CollectionView} receiver
  */
  reload: function(indexes) {
    var invalid = this._invalidIndexes ;
    if (indexes && invalid !== YES) {
      if (invalid) invalid.add(indexes);
      else invalid = this._invalidIndexes = indexes.clone();

    }
    else {
      this._invalidIndexes = YES ; // force a total reload
    }
    
    if (this.get('isVisibleInWindow')) this.invokeOnce(this.reloadIfNeeded);
    
    return this ;
  },

  /** 
    Invoked once per runloop to actually reload any needed item views.
    You can call this method at any time to actually force the reload to
    happen immediately if any item views need to be reloaded.
    
    Note that this method will also invoke two other callback methods if you
    define them on your subclass:
    
    - *willReload()* is called just before the items are reloaded
    - *didReload()* is called jsut after items are reloaded
    
    You can use these two methods to setup and teardown caching, which may
    reduce overall cost of a reload.  Each method will be passed an index set
    of items that are reloaded or null if all items are reloaded.
    
    @returns {SC.CollectionView} receiver
  */
  reloadIfNeeded: function() {
    var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
    this._invalidIndexes = NO ;
    
    var content = this.get('content'),
        i, len, existing,
        layout  = this.computeLayout(),
        bench   = SC.BENCHMARK_RELOAD,
        nowShowing = this.get('nowShowing'),
        itemViews  = this._sc_itemViews,
        containerView = this.get('containerView') || this,
        exampleView, groupExampleView,
        shouldReuseViews, shouldReuseGroupViews, shouldReuse,
        viewsToRemove, viewsToRedraw, viewsToCreate,
        views, idx, view, layer, parentNode, viewPool,
        del, groupIndexes, isGroupView;

    // if the set is defined but it contains the entire nowShowing range, just
    // replace
    if (invalid.isIndexSet && invalid.contains(nowShowing)) invalid = YES ;
    if (this.willReload) this.willReload(invalid === YES ? null : invalid);

    
    // Up-front, figure out whether the view class (and, if applicable,
    // group view class) is re-usable.  If so, it's beneficial for us to
    // first return all no-longer-needed views to the pool before allocating
    // new ones, because that will maximize the potential for re-use.
    exampleView = this.get('exampleView');
    shouldReuseViews = exampleView ? exampleView.isReusableInCollections : NO;
    groupExampleView = this.get('groupExampleView');
    shouldReuseGroupViews = groupExampleView ? groupExampleView.isReusableInCollections : NO;

    // if an index set, just update indexes
    if (invalid.isIndexSet) {
      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Partial)".fmt(this),YES);
      }
            
      // Each of these arrays holds indexes.
      viewsToRemove = [];
      viewsToRedraw = [];
      viewsToCreate = [];
      
      invalid.forEach(function(idx) {
        // get the existing item view, if there is one
        existing = itemViews ? itemViews[idx] : null;
        
        // if nowShowing, then reload the item view.
        if (nowShowing.contains(idx)) {
          if (existing && existing.parentView === containerView) {
            viewsToRedraw.push(idx);

          } else {
            viewsToCreate.push(idx);
          }
          
        // if not nowShowing, then remove the item view if needed
        } else if (existing && existing.parentView === containerView) {
          viewsToRemove.push(idx);
        }
      },this);
      
      
      // Now that we know what operations we need to perform, let's perform
      // all the removals first…
      for (i = 0, len = viewsToRemove.length;  i < len;  ++i) {
        idx = viewsToRemove[i];
        existing = itemViews ? itemViews[idx] : null;        
        delete itemViews[idx];
        
        // If this view class is reusable, then add it back to the pool.
        del = this.get('contentDelegate');
        groupIndexes = this.get('_contentGroupIndexes');
        isGroupView = groupIndexes && groupIndexes.contains(idx);
        if (isGroupView) isGroupView = del.contentIndexIsGroup(this, content, idx);
        shouldReuse = isGroupView ? shouldReuseGroupViews : shouldReuseViews;
        if (shouldReuse) {
          viewPool = isGroupView ? this._GROUP_VIEW_POOL : this._VIEW_POOL;
          
          viewPool.push(existing);
          
          // Because it's possible that we'll return this view to the pool
          // and then immediately re-use it, there's the potential that the
          // layer will not be correctly destroyed, because that support
          // (built into removeChild) is coalesced at the runloop, and we
          // will likely change the layerId when re-using the view.  So
          // we'll destroy the layer now.
          existing.destroyLayer();
        }

        // We don't want the old layer hanging around, even if we are going
        // to reuse it.
        // (Charles Jolley personally guarantees this code)
        layer = existing.get('layer');
        if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
        
        containerView.removeChild(existing);
      }
      
      // …then the redraws…
      for (i = 0, len = viewsToRedraw.length;  i < len;  ++i) {
        idx = viewsToRedraw[i];
        existing = itemViews ? itemViews[idx] : null;
        view = this.itemViewForContentIndex(idx, YES);

        // if the existing view has a layer, remove it immediately from
        // the parent.  This is necessary because the old and new views 
        // will use the same layerId
        existing.destroyLayer();            
        containerView.replaceChild(view, existing);
      }
      
      // …and finally the creations.
      for (i = 0, len = viewsToCreate.length;  i < len;  ++i) {
        idx = viewsToCreate[i];
        view = this.itemViewForContentIndex(idx, YES);
        containerView.insertBefore(view, null);   // Equivalent to 'append()', but avoids one more function call
      }
      

      if (bench) SC.Benchmark.end(bench);
      
    // if set is NOT defined, replace entire content with nowShowing
    } else {
      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Full)".fmt(this),YES);
      }

      // truncate cached item views since they will all be removed from the
      // container anyway.
      if (itemViews) itemViews.length = 0 ; 

      views = containerView.get('childViews');
      if (views) views = views.copy();

      // below is an optimized version of:
      //this.replaceAllChildren(views);
      containerView.beginPropertyChanges();
      // views = containerView.get('views');
      if (this.willRemoveAllChildren) this.willRemoveAllChildren() ;
      containerView.destroyLayer().removeAllChildren();
      
      // For all previous views that can be re-used, return them to the pool.
      if (views) {
        for (i = 0, len = views.length;  i < len;  ++i) {
          view = views[i];
          isGroupView = view.get('isGroupView');
          shouldReuse = isGroupView ? shouldReuseGroupViews : shouldReuseViews;
          if (shouldReuse) {
            viewPool = isGroupView ? this._GROUP_VIEW_POOL : this._VIEW_POOL;
          
            viewPool.push(view);
          
            // Because it's possible that we'll return this view to the pool
            // and then immediately re-use it, there's the potential that the
            // layer will not be correctly destroyed, because that support
            // (built into removeChild) is coalesced at the runloop, and we
            // will likely change the layerId when re-using the view.  So
            // we'll destroy the layer now.
            view.destroyLayer();
          }
        }
      }
      

      // Only after the children are removed should we create the new views.
      // We do this in order to maximize the change of re-use should the view
      // be marked as such.
      views = [];
      nowShowing.forEach(function(idx) {
        views.push(this.itemViewForContentIndex(idx, YES));
      }, this);

      
      containerView.set('childViews', views); // quick swap
      containerView.replaceLayer();
      containerView.endPropertyChanges();
      
      if (bench) SC.Benchmark.end(bench);
      
    }
    
    // adjust my own layout if computed
    if (layout) this.adjust(layout);
    if (this.didReload) this.didReload(invalid === YES ? null : invalid);
    
    return this ;
  },
  
  displayProperties: 'isFirstResponder isEnabled isActive'.w(),
  
  /** @private
    If we're asked to render the receiver view for the first time but the 
    child views still need to be added, go ahead and add them.
  */
  render: function(context, firstTime) {
    // add classes for other state.
    context.setClass('focus', this.get('isFirstResponder'));
    context.setClass('disabled', !this.get('isEnabled'));
    context.setClass('active', this.get('isActive'));

    return arguments.callee.base.apply(this,arguments);
  },
    

  _TMP_ATTRS: {},
  _COLLECTION_CLASS_NAMES: 'sc-collection-item'.w(),
  _GROUP_COLLECTION_CLASS_NAMES: 'sc-collection-item sc-group-item'.w(),
  _VIEW_POOL: null,
  _GROUP_VIEW_POOL: null,
  
  /**
    Returns the item view for the content object at the specified index. Call
    this method instead of accessing child views directly whenever you need 
    to get the view associated with a content index.

    Although this method take two parameters, you should almost always call
    it with just the content index.  The other two parameters are used 
    internally by the CollectionView.
    
    If you need to change the way the collection view manages item views
    you can override this method as well.  If you just want to change the
    default options used when creating item views, override createItemView()
    instead.
  
    Note that if you override this method, then be sure to implement this 
    method so that it uses a cache to return the same item view for a given
    index unless "force" is YES.  In that case, generate a new item view and
    replace the old item view in your cache with the new item view.

    @param {Number} idx the content index
    @param {Boolean} rebuild internal use only
    @returns {SC.View} instantiated view
  */
  itemViewForContentIndex: function(idx, rebuild) {
    var ret;

    // Use the cached view for this index, if we have it.  We'll do this up-
    // front to avoid 
    var itemViews = this._sc_itemViews;
    if (!itemViews) {
      itemViews = this._sc_itemViews = [] ;
    }
    else if (!rebuild && (ret = itemViews[idx])) {
      return ret ; 
    }

    // return from cache if possible
    var content   = this.get('content'),
        item = content.objectAt(idx),
        del  = this.get('contentDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        isGroupView = NO,
        key, E, layout, layerId,
        viewPoolKey, viewPool, reuseFunc, parentView, isEnabled, isSelected,
        outlineLevel, disclosureState, isVisibleInWindow;

    // otherwise generate...
    
    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);
    if (isGroupView) isGroupView = del.contentIndexIsGroup(this, content,idx);
    if (isGroupView) {
      key  = this.get('contentGroupExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('groupExampleView') || this.get('exampleView');
      viewPoolKey = '_GROUP_VIEW_POOL';
    } else {
      key  = this.get('contentExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('exampleView');
      viewPoolKey = '_VIEW_POOL';
    }
    
    
    // Collect other state that we'll need whether we're re-using a previous
    // view or creating a new view.
    parentView        = this.get('containerView') || this;
    layerId           = this.layerIdFor(idx);
    isEnabled         = del.contentIndexIsEnabled(this, content, idx);
    isSelected        = del.contentIndexIsSelected(this, content, idx);
    outlineLevel      = del.contentIndexOutlineLevel(this, content, idx);
    disclosureState   = del.contentIndexDisclosureState(this, content, idx);
    isVisibleInWindow = this.isVisibleInWindow;
    layout            = this.layoutForContentIndex(idx);    
    
    
    // If the view is reusable and there is an appropriate view inside the
    // pool, simply reuse it to avoid having to create a new view.
    if (E  &&  E.isReusableInCollections) {
      // Lazily create the view pool.
      viewPool = this[viewPoolKey];
      if (!viewPool) viewPool = this[viewPoolKey] = [];
      
      // Is there a view we can re-use?
      if (viewPool.length > 0) {
        ret = viewPool.pop();

        // Tell the view it's about to be re-used.
        reuseFunc = ret.prepareForReuse;
        if (reuseFunc) reuseFunc.call(ret);
        
        // Set the new state.  We'll set content last, because it's the most
        // likely to have observers.
        ret.beginPropertyChanges();
        ret.set('contentIndex', idx);
        ret.set('layerId', layerId);
        ret.set('isEnabled', isEnabled);
        ret.set('isSelected', isSelected);
        ret.set('outlineLevel', outlineLevel);
        ret.set('disclosureState', disclosureState);
        ret.set('isVisibleInWindow', isVisibleInWindow);
        
        // TODO:  In theory this shouldn't be needed, but without it, we
        //        sometimes get errors when doing a full reload, because
        //        'childViews' contains the view but the parent is not set.
        //        This implies a timing issue with the general flow of
        //        collection view.
        ret.set('parentView', parentView);
        
        // Since we re-use layerIds, we need to reset SproutCore's internal
        // mapping table.
        SC.View.views[layerId] = ret;
        
        if (layout) {
          ret.set('layout', layout);
        }
        else {
          ret.set('layout', E.prototype.layout);
        }
        ret.set('content', item);
        ret.endPropertyChanges();
      }
    }
    
    // If we weren't able to re-use a view, then create a new one.
    if (!ret) {
      // collect some other state
      var attrs = this._TMP_ATTRS;
      attrs.contentIndex      = idx;
      attrs.content           = item;
      attrs.owner             = attrs.displayDelegate = this;
      attrs.parentView        = parentView;   // Same here; shouldn't be needed
      attrs.page              = this.page;
      attrs.layerId           = layerId;
      attrs.isEnabled         = isEnabled;
      attrs.isSelected        = isSelected;
      attrs.outlineLevel      = outlineLevel;
      attrs.disclosureState   = disclosureState;
      attrs.isGroupView       = isGroupView;
      attrs.isVisibleInWindow = isVisibleInWindow;
      if (isGroupView) attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES;
      else attrs.classNames = this._COLLECTION_CLASS_NAMES;
    
      if (layout) {
        attrs.layout = layout;
      } else {
        delete attrs.layout ;
      }
    
      ret = this.createItemView(E, idx, attrs);
    }
    
    itemViews[idx] = ret ;
    return ret ;
  },
  
  /**
    Helper method for getting the item view of a specific content object
    
    @param {Object} object
  */
  itemViewForContentObject: function(object) {
    return this.itemViewForContentIndex(this.get('content').indexOf(object));
  },
  
  _TMP_LAYERID: [],
  
  /**
    Primitive to instantiate an item view.  You will be passed the class 
    and a content index.  You can override this method to perform any other
    one time setup.

    Note that item views may be created somewhat frequently so keep this fast.

    *IMPORTANT:* The attrs hash passed is reused each time this method is 
    called.   If you add properties to this hash be sure to delete them before
    returning from this method.
    
    @param {Class} exampleClass example view class
    @param {Number} idx the content index
    @param {Hash} attrs expected attributes
    @returns {SC.View} item view instance
  */ 
  createItemView: function(exampleClass, idx, attrs) {
    return exampleClass.create(attrs);
  },

  /**
    Generates a layerId for the passed index and item.  Usually the default
    implementation is suitable.
    
    @param {Number} idx the content index
    @returns {String} layer id, must be suitable for use in HTML id attribute
  */
  layerIdFor: function(idx) {  
    var ret = this._TMP_LAYERID;
    ret[0] = SC.guidFor(this);
    ret[1] = idx;
    return ret.join('-');
  },
  
  /**
    Extracts the content index from the passed layerID.  If the layer id does
    not belong to the receiver or if no value could be extracted, returns NO.
    
    @param {String} id the layer id
  */
  contentIndexForLayerId: function(id) {
    if (!id || !(id = id.toString())) return null ; // nothing to do
    
    var base = this._baseLayerId;
    if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";
    
    // no match
    if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 
    var ret = Number(id.slice(id.lastIndexOf('-')+1));
    return isNaN(ret) ? null : ret ;
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
  itemViewForEvent: function(evt) {
    var responder = this.getPath('pane.rootResponder') ;
    if (!responder) return null ; // fast path
    
    var base    = SC.guidFor(this) + '-',
        baseLen = base.length,
        element = evt.target,
        layer   = this.get('layer'),
        contentIndex = null,
        id, itemView, ret ;
        
    // walk up the element hierarchy until we find this or an element with an
    // id matching the base guid (i.e. a collection item)
    while (element && element !== document && element !== layer) {
      id = element ? SC.$(element).attr('id') : null ;
      if (id && (contentIndex = this.contentIndexForLayerId(id)) !== null) {
          break;
      }
      element = element.parentNode ; 
    }
    
    // no matching element found? 
    if (contentIndex===null || (element === layer)) {
      element = layer = null; // avoid memory leaks 
      return null;    
    }
    
    // okay, found the DOM node for the view, go ahead and create it
    // first, find the contentIndex
    if (contentIndex >= this.get('length')) {
      throw "layout for item view %@ was found when item view does not exist (%@)".fmt(id, this);
    }
    
    return this.itemViewForContentIndex(contentIndex);
  },
  
  // ..........................................................
  // DISCLOSURE SUPPORT
  // 
  
  /**
    Expands any items in the passed selection array that have a disclosure
    state.
    
    @param {SC.IndexSet} indexes the indexes to expand
    @returns {SC.CollectionView} receiver
  */
  expand: function(indexes) {
    if (!indexes) return this; // nothing to do
    var del     = this.get('contentDelegate'),
        content = this.get('content');
        
    indexes.forEach(function(i) { 
      var state = del.contentIndexDisclosureState(this, content, i);
      if (state === SC.BRANCH_CLOSED) del.contentIndexExpand(this,content,i);
    }, this);
    return this;
  },

  /**
    Collapses any items in the passed selection array that have a disclosure
    state.
    
    @param {SC.IndexSet} indexes the indexes to expand
    @returns {SC.CollectionView} receiver
  */
  collapse: function(indexes) {
    if (!indexes) return this; // nothing to do
    var del     = this.get('contentDelegate'),
        content = this.get('content');
        
    indexes.forEach(function(i) { 
      var state = del.contentIndexDisclosureState(this, content, i);
      if (state === SC.BRANCH_OPEN) del.contentIndexCollapse(this,content,i);
    }, this);
    return this;
  },
  
  // ..........................................................
  // SELECTION SUPPORT
  // 
  
  /** @private 

    Called whenever the selection object is changed to a new value.  Begins
    observing the selection for changes.
    
  */
  _cv_selectionDidChange: function() {  
    var sel  = this.get('selection'),
        last = this._cv_selection,
        func = this._cv_selectionContentDidChange;
        
    if (sel === last) return; // nothing to do
    if (last) last.removeObserver('[]', this, func);
    if (sel) sel.addObserver('[]', this, func);
    
    this._cv_selection = sel ;
    this._cv_selectionContentDidChange();
  }.observes('selection'),

  /** @private
  
    Called whenever the selection object or its content changes.  This will
    repaint any items that changed their selection state.
  
  */
  _cv_selectionContentDidChange: function() {
    var sel  = this.get('selection'),
        last = this._cv_selindexes, // clone of last known indexes
        content = this.get('content'),
        diff ;

    // save new last
    this._cv_selindexes = sel ? sel.frozenCopy() : null;

    // determine which indexes are now invalid
    if (last) last = last.indexSetForSource(content);
    if (sel) sel = sel.indexSetForSource(content);
    
    if (sel && last) diff = sel.without(last).add(last.without(sel));
    else diff = sel || last;

    if (diff && diff.get('length')>0) this.reloadSelectionIndexes(diff);
  },
  
  /** @private
    Contains the current item views that need their selection to be repainted.
    This may be either NO, YES, or an IndexSet.
  */
  _invalidSelection: NO,
  
  /**
    Called whenever the selection changes.  The passed index set will contain
    any affected indexes including those indexes that were previously 
    selected and now should be deselected.
    
    Pass null to reload the selection state for all items.
    
    @param {SC.IndexSet} indexes affected indexes
    @returns {SC.CollectionView} reciever
  */
  reloadSelectionIndexes: function(indexes) {
    var invalid = this._invalidSelection ;
    if (indexes && (invalid !== YES)) {
      if (invalid) { invalid.add(indexes) ; }
      else { invalid = this._invalidSelection = indexes.copy(); }

    } else this._invalidSelection = YES ; // force a total reload
    
    if (this.get('isVisibleInWindow')) {
      this.invokeOnce(this.reloadSelectionIndexesIfNeeded);
    } 
    
    return this ;
  },

  /**
    Reloads the selection state if needed on any dirty indexes.  Normally this
    will run once at the end of the runloop, but you can force the item views
    to reload their selection immediately by calling this method.
    
    You can also override this method if needed to change the way the 
    selection is reloaded on item views.  The default behavior will simply
    find any item views in the nowShowing range that are affected and 
    modify them.
    
    @returns {SC.CollectionView} receiver
  */
  reloadSelectionIndexesIfNeeded: function() {
    var invalid = this._invalidSelection;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; 

    var nowShowing = this.get('nowShowing'),
        reload     = this._invalidIndexes,
        content    = this.get('content'),
        sel        = this.get('selection');
    
    this._invalidSelection = NO; // reset invalid
    
    // fast path.  if we are going to reload everything anyway, just forget
    // about it.  Also if we don't have a nowShowing, nothing to do.
    if (reload === YES || !nowShowing) return this ;
    
    // if invalid is YES instead of index set, just reload everything 
    if (invalid === YES) invalid = nowShowing;

    // if we will reload some items anyway, don't bother
    if (reload && reload.isIndexSet) invalid = invalid.without(reload);

    // iterate through each item and set the isSelected state.
    invalid.forEach(function(idx) {
      if (!nowShowing.contains(idx)) return; // not showing
      var view = this.itemViewForContentIndex(idx, NO);
      if (view) view.set('isSelected', sel ? sel.contains(content, idx) : NO);
    },this);
    
    return this ;
  },
  
  /** 
    Selection primitive.  Selects the passed IndexSet of items, optionally 
    extending the current selection.  If extend is NO or not passed then this
    will replace the selection with the passed value.  Otherwise the indexes
    will be added to the current selection.
    
    @param {Number|SC.IndexSet} indexes index or indexes to select
    @param extend {Boolean} optionally extend the selection
    @returns {SC.CollectionView} receiver
  */
  select: function(indexes, extend) {

    var content = this.get('content'),
        del     = this.get('selectionDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        sel;
        
    if(!this.get('isSelectable')) return this;

    // normalize
    if (SC.typeOf(indexes) === SC.T_NUMBER) {
      indexes = SC.IndexSet.create(indexes, 1);
    }

    // if we are passed an empty index set or null, clear the selection.
    if (indexes && indexes.get('length')>0) {

      // first remove any group indexes - these can never be selected
      if (groupIndexes && groupIndexes.get('length')>0) {
        indexes = indexes.copy().remove(groupIndexes);
      }
      
      // give the delegate a chance to alter the items
      indexes = del.collectionViewShouldSelectIndexes(this, indexes, extend);
      if (!indexes || indexes.get('length')===0) return this; // nothing to do
    
    } else indexes = null;

    // build the selection object, merging if needed
    if (extend && (sel = this.get('selection'))) sel = sel.copy();
    else sel = SC.SelectionSet.create();
    
    if (indexes && indexes.get('length')>0) {

      // when selecting only one item, always select by content
      if (indexes.get('length')===1) {
        sel.addObject(content.objectAt(indexes.get('firstObject')));
        
      // otherwise select an index range
      } else sel.add(content, indexes);
      
    }

    // give delegate one last chance
    sel = del.collectionViewSelectionForProposedSelection(this, sel);
    if (!sel) sel = SC.SelectionSet.create(); // empty
    
    // if we're not extending the selection, clear the selection anchor
    this._selectionAnchor = null ;
    this.set('selection', sel.freeze()) ;  
    return this;
  },
  
  /** 
    Primtive to remove the indexes from the selection.  
    
    @param {Number|SC.IndexSet} indexes index or indexes to select
    @returns {SC.CollectionView} receiver
  */
  deselect: function(indexes) {

    var sel     = this.get('selection'),
        content = this.get('content'),
        del     = this.get('selectionDelegate');
        
    if(!this.get('isSelectable')) return this;
    if (!sel || sel.get('length')===0) return this; // nothing to do
        
    // normalize
    if (SC.typeOf(indexes) === SC.T_NUMBER) {
      indexes = SC.IndexSet.create(indexes, 1);
    }

    // give the delegate a chance to alter the items
    indexes = del.collectionViewShouldDeselectIndexes(this, indexes) ;
    if (!indexes || indexes.get('length')===0) return this; // nothing to do

    // now merge change - note we expect sel && indexes to not be null
    sel = sel.copy().remove(content, indexes);
    sel = del.collectionViewSelectionForProposedSelection(this, sel);
    if (!sel) sel = SC.SelectionSet.create(); // empty

    this.set('selection', sel.freeze()) ;
    return this ;
  },
  
  /** @private
   Finds the next selectable item, up to content length, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.

   Return value will always be in the range of the bottom of the current 
   selection index and the proposed index.   
   
   @param {Number} proposedIndex the desired index to select
   @param {Number} bottom optional bottom of selection use as fallback
   @returns {Number} next selectable index. 
  */
  _findNextSelectableItemFromIndex: function(proposedIndex, bottom) {
    
    var lim     = this.get('length'),
        range   = SC.IndexSet.create(), 
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        ret, sel ;

    // fast path
    if (!groupIndexes && (del.collectionViewShouldSelectIndexes === this.collectionViewShouldSelectIndexes)) {
      return proposedIndex;
    }

    // loop forwards looking for an index that is allowed by delegate
    // we could alternatively just pass the whole range but this might be 
    // slow for the delegate
    while (proposedIndex < lim) {
      if (!groupIndexes || !groupIndexes.contains(proposedIndex)) {
        range.add(proposedIndex);
        ret = del.collectionViewShouldSelectIndexes(this, range);
        if (ret && ret.get('length') >= 1) return proposedIndex ;
        range.remove(proposedIndex);
      }
      proposedIndex++;      
    }

    // if nothing was found, return top of selection
    if (bottom === undefined) {
      sel = this.get('selection');
      bottom = sel ? sel.get('max') : -1 ;
    }
    return bottom ;
  },
  
  /** @private
   Finds the previous selectable item, up to the first item, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.
   
   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the previous selectable index. This will always be in the range of the top of the current selection index and the proposed index.
   @private
  */
  _findPreviousSelectableItemFromIndex: function(proposedIndex, top) {
    var range   = SC.IndexSet.create(), 
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        ret ;

    if (SC.none(proposedIndex)) proposedIndex = -1;
    
    // fast path
    if (!groupIndexes && (del.collectionViewShouldSelectIndexes === this.collectionViewShouldSelectIndexes)) {
      return proposedIndex;
    }

    // loop backwards looking for an index that is allowed by delegate
    // we could alternatively just pass the whole range but this might be 
    // slow for the delegate
    while (proposedIndex >= 0) {
      if (!groupIndexes || !groupIndexes.contains(proposedIndex)) {
        range.add(proposedIndex);
        ret = del.collectionViewShouldSelectIndexes(this, range);
        if (ret && ret.get('length') >= 1) return proposedIndex ;
        range.remove(proposedIndex);
      }
      proposedIndex--;      
    }

    // if nothing was found, return top of selection
    if (top === undefined) {
      var sel = this.get('selection');
      top = sel ? sel.get('min') : -1 ;
    }
    if (SC.none(top)) top = -1;
    return top ;
  },
  
  /**
    Select one or more items before the current selection, optionally
    extending the current selection.  Also scrolls the selected item into 
    view.
    
    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended 
      instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of previous to be 
      selected.  Defaults to 1
      @returns {SC.CollectionView} receiver
  */
  selectPreviousItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;
    
    var sel     = this.get('selection'),
        content = this.get('content');
    if (sel) sel = sel.indexSetForSource(content);
    
    var selTop    = sel ? sel.get('min') : -1,
        selBottom     = sel ? sel.get('max')-1 : -1,
        anchor        = this._selectionAnchor;
    if (SC.none(anchor)) anchor = selTop;

    // if extending, then we need to do some fun stuff to build the array
    if (extend) {

      // If the selBottom is after the anchor, then reduce the selection
      if (selBottom > anchor) {
        selBottom = selBottom - numberOfItems ;
        
      // otherwise, select the previous item from the top 
      } else {
        selTop = this._findPreviousSelectableItemFromIndex(selTop - numberOfItems);
      }
      
      // Ensure we are not out of bounds
      if (SC.none(selTop) || (selTop < 0)) selTop = 0 ;
      if (!content.objectAt(selTop)) selTop = sel ? sel.get('min') : -1;
      if (selBottom < selTop) selBottom = selTop ;
      
    // if not extending, just select the item previous to the selTop
    } else {
      selTop = this._findPreviousSelectableItemFromIndex(selTop - numberOfItems);
      if (SC.none(selTop) || (selTop < 0)) selTop = 0 ;
      if (!content.objectAt(selTop)) selTop = sel ? sel.get('min') : -1;
      selBottom = selTop ;
      anchor = null ;
    }
    
    var scrollToIndex = selTop ;
    
    // now build new selection
    sel = SC.IndexSet.create(selTop, selBottom+1-selTop);
    
    // ensure that the item is visible and set the selection
    this.scrollToContentIndex(scrollToIndex) ;
    this.select(sel) ;
    this._selectionAnchor = anchor ;
    return this ;
  },
  
  /**
    Select one or more items following the current selection, optionally
    extending the current selection.  Also scrolls to selected item.
    
    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended 
      instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of items to be 
      selected.  Defaults to 1.
    @returns {SC.CollectionView} receiver
  */
  selectNextItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;

    var sel     = this.get('selection'),
        content = this.get('content');
    if (sel) sel = sel.indexSetForSource(content);
    
    var selTop    = sel ? sel.get('min') : -1,
        selBottom = sel ? sel.get('max')-1 : -1,
        anchor    = this._selectionAnchor,
        lim       = this.get('length');
        
    if (SC.none(anchor)) anchor = selTop;

    // if extending, then we need to do some fun stuff to build the array
    if (extend) {
      
      // If the selTop is before the anchor, then reduce the selection
      if (selTop < anchor) {
        selTop = selTop + numberOfItems ;
        
      // otherwise, select the next item after the bottom 
      } else {
        selBottom = this._findNextSelectableItemFromIndex(selBottom + numberOfItems, selBottom);
      }
      
      // Ensure we are not out of bounds
      if (selBottom >= lim) selBottom = lim-1;
      
      // we also need to check that the item exists
      if (!content.objectAt(selBottom)) selBottom = sel ? sel.get('max') - 1 : -1;
      
      // and if top has eclipsed bottom, handle that too.
      if (selTop > selBottom) selTop = selBottom ;
      
    // if not extending, just select the item next to the selBottom
    } else {
      selBottom = this._findNextSelectableItemFromIndex(selBottom + numberOfItems, selBottom);
      
      if (selBottom >= lim) selBottom = lim-1;
      if (!content.objectAt(selBottom)) selBottom = sel ? sel.get('max') - 1 : -1;
      selTop = selBottom ;
      anchor = null ;
    }
    
    var scrollToIndex = selBottom ;
    
    // now build new selection
    sel = SC.IndexSet.create(selTop, selBottom-selTop+1);
    
    // ensure that the item is visible and set the selection
    this.scrollToContentIndex(scrollToIndex) ;
    this.select(sel) ;
    this._selectionAnchor = anchor ;
    return this ;
  },
    
  /**
    Deletes the selected content if canDeleteContent is YES.  This will invoke 
    delegate methods to provide fine-grained control.  Returns YES if the 
    deletion was possible, even if none actually occurred.
    
    @returns {Boolean} YES if deletion is possible.
  */
  deleteSelection: function() {
    // perform some basic checks...
    if (!this.get('canDeleteContent')) return NO;  

    var sel     = this.get('selection'),
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        indexes = sel&&content ? sel.indexSetForSource(content) : null;
        
    if (!content || !indexes || indexes.get('length') === 0) return NO ;
    
    // let the delegate decide what to actually delete.  If this returns an
    // empty index set or null, just do nothing.
    indexes = del.collectionViewShouldDeleteIndexes(this, indexes);
    if (!indexes || indexes.get('length') === 0) return NO ;
    
    // now have the delegate (or us) perform the deletion. The default 
    // delegate implementation just uses standard SC.Array methods to do the
    // right thing.
    del.collectionViewDeleteContent(this, this.get('content'), indexes);

    return YES ;
  },
  
  // ..........................................................
  // SCROLLING
  // 
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    
    @param {Number} contentIndex The index of the item to scroll to
    @returns {SC.CollectionView} receiver
  */
  scrollToContentIndex: function(contentIndex) {
    var itemView = this.itemViewForContentIndex(contentIndex) ;
    if (itemView) this.scrollToItemView(itemView) ;
    return this; 
  },
  
  /**
    Scroll to the passed item view.  If the item view is not visible on screen
    this method will not work.

    @param {SC.View} view The item view to scroll to
    @returns {SC.CollectionView} receiver
  */
  scrollToItemView: function(view) {
    if (view) view.scrollToVisible();
    return this ;
  },

  // ..........................................................
  // KEYBOARD EVENTS
  // 
  
  /** @private */
  keyDown: function(evt) {
    var ret = this.interpretKeyEvents(evt) ;
    return !ret ? NO : ret ;
  },
  
  /** @private */
  keyUp: function() { return true; },
  
  /** @private
    Handle space key event.  Do action
  */
  insertText: function(chr, evt) {
    if (chr === ' ') {
      var sel = this.get('selection');
      if (sel && sel.get('length')>0) {
        this.invokeLater(this._cv_action, 0, null, evt);
      } 
      return YES ;
    } else return NO ;
  },
  
  /** @private
    Handle select all keyboard event.
  */
  selectAll: function(evt) {
    var content = this.get('content'),
        sel = content ? SC.IndexSet.create(0, content.get('length')) : null;
    this.select(sel, NO) ;
    return YES ;
  },
  
  /** @private
    Handle delete keyboard event.
  */
  deleteBackward: function(evt) {
    return this.deleteSelection() ;
  },
  
  /** @private
    Handle delete keyboard event.
  */
  deleteForward: function(evt) {
    return this.deleteSelection() ;
  },
  
  /** @private
    Selects the same item on the next row or moves down one if itemsPerRow = 1
  */
  moveDown: function(sender, evt) {
    this.selectNextItem(false, this.get('itemsPerRow') || 1) ;
    this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    return true ;
  },
  
  /** @private
    Selects the same item on the next row or moves up one if itemsPerRow = 1
  */
  moveUp: function(sender, evt) {
    this.selectPreviousItem(false, this.get('itemsPerRow') || 1) ;
    this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    return true ;
  },

  /** @private
    Selects the previous item if itemsPerRow > 1.  Otherwise does nothing.
    If item is expandable, will collapse.
  */
  moveLeft: function(evt) {
    // If the control key is down, this may be a browser shortcut and
    // we should not handle the arrow key.
    if (evt.ctrlKey || evt.metaKey) return NO;

    if ((this.get('itemsPerRow') || 1) > 1) {
      this.selectPreviousItem(false, 1);
      this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    
    } else {
      var sel     = this.get('selection'),
          content = this.get('content'),
          indexes = sel ? sel.indexSetForSource(content) : null;
    
      // Collapse the element if it is expanded.  However, if there is exactly
      // one item selected and the item is already collapsed or is a leaf
      // node, then select the (expanded) parent element instead as a
      // convenience to the user.
      if ( indexes ) {
        var del          = undefined,     // We'll load it lazily
            selectParent = false,
            index        = undefined;

        if ( indexes.get('length') === 1 ) {
          index = indexes.get('firstObject');
          del = this.get('contentDelegate');
          var state = del.contentIndexDisclosureState(this, content, index);
          if (state !== SC.BRANCH_OPEN) selectParent = true;
        }
    
        if ( selectParent ) {
          // TODO:  PERFORMANCE:  It would be great to have a function like
          //        SC.CollectionView.selectParentItem() or something similar
          //        for performance reasons.  But since we don't currently
          //        have such a function, let's just iterate through the
          //        previous items until we find the first one with a outline
          //        level of one less than the selected item.
          var desiredOutlineLevel = del.contentIndexOutlineLevel(this, content, index) - 1;
          if ( desiredOutlineLevel >= 0 ) {
            var parentIndex = -1;
            while ( parentIndex < 0 ) {
              var previousItemIndex = this._findPreviousSelectableItemFromIndex(index - 1);
              if (previousItemIndex < 0 ) return false;    // Sanity-check.
              index = previousItemIndex;
              var outlineLevel = del.contentIndexOutlineLevel(this, content, index);
              if ( outlineLevel === desiredOutlineLevel ) {
                parentIndex = previousItemIndex;
              }
            }
          
            // If we found the parent, select it now.
            if ( parentIndex !== -1 ) {
              this.select(index);
            }
          }
        }
        else {
          this.collapse(indexes);
        }
      }
    }
  
    return true ;
  },
  
  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRight: function(evt) {
    // If the control key is down, this may be a browser shortcut and
    // we should not handle the arrow key.
    if (evt.ctrlKey || evt.metaKey) return NO;

    if ((this.get('itemsPerRow') || 1) > 1) {
      this.selectNextItem(false, 1) ;
      this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    } else {
      var sel     = this.get('selection'),
          content = this.get('content'),
          indexes = sel ? sel.indexSetForSource(content) : null;
      if (indexes) this.expand(indexes);
    }
    
    return true ;
  },
  
  /** @private */
  moveDownAndModifySelection: function(sender, evt) {
    this.selectNextItem(true, this.get('itemsPerRow') || 1) ;
    this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    return true ;
  },
  
  /** @private */
  moveUpAndModifySelection: function(sender, evt) {
    this.selectPreviousItem(true, this.get('itemsPerRow') || 1) ;
    this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    return true ;
  },
  
  /** @private
    Selects the previous item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveLeftAndModifySelection: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) {
      this.selectPreviousItem(true, 1) ;
      this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    }
    return true ;
  },

  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRightAndModifySelection: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) {
      this.selectNextItem(true, 1) ;
      this._cv_performSelectAction(null, evt, this.ACTION_DELAY);
    }
    return true ;
  },

  
  
  /** @private
    if content value is editable and we have one item selected, then edit.
    otherwise, invoke action.
  */
  insertNewline: function(sender, evt) {
    var canEdit = this.get('isEditable') && this.get('canEditContent'),
        sel, content, set, idx, itemView;
    
    // first make sure we have a single item selected; get idx 
    if (canEdit) {
      sel     = this.get('selection') ;
      content = this.get('content');
      if (sel && sel.get('length') === 1) {
        set = sel.indexSetForSource(content);
        idx = set ? set.get('min') : -1;
        canEdit = idx>=0;
      }
    }
    
    // next find itemView and ensure it supports editing
    if (canEdit) {
      itemView = this.itemViewForContentIndex(idx);
      canEdit = itemView && SC.typeOf(itemView.beginEditing)===SC.T_FUNCTION;
    }
      
    // ok, we can edit..
    if (canEdit) {
      this.scrollToContentIndex(idx);
      itemView = this.itemViewForContentIndex(idx); // just in case
      itemView.beginEditing();
      
    // invoke action 
    } else {
      this.invokeLater(this._cv_action, 0, itemView, null) ;
    }
    
    return YES ; // always handle
  },

  // ..........................................................
  // MOUSE EVENTS
  // 
  
  /** @private
    Handles mouse down events on the collection view or on any of its 
    children.
    
    The default implementation of this method can handle a wide variety
    of user behaviors depending on how you have configured the various
    options for the collection view.
    
    @param ev {Event} the mouse down event
    @returns {Boolean} Usually YES.
  */
  mouseDown: function(ev) {
    
    // When the user presses the mouse down, we don't do much just yet.
    // Instead, we just need to save a bunch of state about the mouse down
    // so we can choose the right thing to do later.
    
    
    // find the actual view the mouse was pressed down on.  This will call
    // hitTest() on item views so they can implement non-square detection
    // modes. -- once we have an item view, get its content object as well.
    var itemView      = this.itemViewForEvent(ev),
        content       = this.get('content'),
        contentIndex  = itemView ? itemView.get('contentIndex') : -1, 
        info, anchor, sel, isSelected, modifierKeyPressed,
        allowsMultipleSel = content.get('allowsMultipleSelection');
        
    info = this.mouseDownInfo = {
      event:        ev,  
      itemView:     itemView,
      contentIndex: contentIndex,
      at:           Date.now()
    };
    
    // become first responder if possible.
    this.becomeFirstResponder() ;
    
    // Toggle the selection if selectOnMouseDown is true
    if (this.get('useToggleSelection')) {
      if (this.get('selectOnMouseDown')) {
        if (!itemView) return ; // do nothing when clicked outside of elements

        // determine if item is selected. If so, then go on.
        sel = this.get('selection') ;
        isSelected = sel && sel.containsObject(itemView.get('content')) ;

        if (isSelected) {
          this.deselect(contentIndex) ;
        } else if (!allowsMultipleSel) {
          this.select(contentIndex, NO) ;
        } else {
          this.select(contentIndex, YES) ;
        }
      }
      
      return YES;
    }
        
    // recieved a mouseDown on the collection element, but not on one of the 
    // childItems... unless we do not allow empty selections, set it to empty.
    if (!itemView) {
      if (this.get('allowDeselectAll')) this.select(null, false);
      return YES ;
    }
    
    // collection some basic setup info
    sel = this.get('selection');
    if (sel) sel = sel.indexSetForSource(content);
    
    isSelected = sel ? sel.contains(contentIndex) : NO;
    info.modifierKeyPressed = modifierKeyPressed = ev.ctrlKey || ev.metaKey ;
    
    
    // holding down a modifier key while clicking a selected item should 
    // deselect that item...deselect and bail.
    if (modifierKeyPressed && isSelected) {
      info.shouldDeselect = contentIndex >= 0;

    // if the shiftKey was pressed, then we want to extend the selection
    // from the last selected item
    } else if (ev.shiftKey && sel && sel.get('length') > 0 && allowsMultipleSel) {
      sel = this._findSelectionExtendedByShift(sel, contentIndex);
      anchor = this._selectionAnchor ; 
      this.select(sel) ;
      this._selectionAnchor = anchor; //save the anchor
      
    // If no modifier key was pressed, then clicking on the selected item 
    // should clear the selection and reselect only the clicked on item.
    } else if (!modifierKeyPressed && isSelected) {
      info.shouldReselect = contentIndex >= 0;
      
    // Otherwise, if selecting on mouse down,  simply select the clicked on 
    // item, adding it to the current selection if a modifier key was pressed.
    } else {
    
      if((ev.shiftKey || modifierKeyPressed) && !allowsMultipleSel){
        this.select(null, false);
      }
    
      if (this.get("selectOnMouseDown")) {
        this.select(contentIndex, modifierKeyPressed);
      } else {
        info.shouldSelect = contentIndex >= 0 ;
      }
    }
    
    // saved for extend by shift ops.
    info.previousContentIndex = contentIndex;
    
    return YES;
  },
  
  /** @private */
  mouseUp: function(ev) {
    
    var view   = this.itemViewForEvent(ev),
        info   = this.mouseDownInfo,
        content       = this.get('content'),
        contentIndex, sel, isSelected, canEdit, itemView, idx,
        allowsMultipleSel = content.get('allowsMultipleSelection');
        
    if (this.get('useToggleSelection')) {
      // Return if clicked outside of elements or if toggle was handled by mouseDown
      if (!view || this.get('selectOnMouseDown')) return NO;
      
      // determine if item is selected. If so, then go on.
      sel = this.get('selection') ;
      contentIndex = (view) ? view.get('contentIndex') : -1 ;
      isSelected = sel && sel.containsObject(view.get('content')) ;
      
      if (isSelected) {
        this.deselect(contentIndex) ;
      } else if (!allowsMultipleSel) {
        this.select(contentIndex, NO) ;
      } else {
        this.select(contentIndex, YES) ;
      }
      
    } else if(info) {
      idx = info.contentIndex;
      contentIndex = (view) ? view.get('contentIndex') : -1 ;
      
      // this will be set if the user simply clicked on an unselected item and 
      // selectOnMouseDown was NO.
      if (info.shouldSelect) this.select(idx, info.modifierKeyPressed);
      
      // This is true if the user clicked on a selected item with a modifier
      // key pressed.
      if (info.shouldDeselect) this.deselect(idx);
      
      // This is true if the user clicked on a selected item without a 
      // modifier-key pressed.  When this happens we try to begin editing 
      // on the content.  If that is not allowed, then simply clear the 
      // selection and reselect the clicked on item.
      if (info.shouldReselect) {
        
        // - contentValueIsEditable is true
        canEdit = this.get('isEditable') && this.get('canEditContent') ;
        
        // - the user clicked on an item that was already selected
        //   ^ this is the only way shouldReset is set to YES
        
        // - is the only item selected
        if (canEdit) {
          sel = this.get('selection') ;
          canEdit = sel && (sel.get('length') === 1);
        }
        
        // - the item view responds to contentHitTest() and returns YES.
        // - the item view responds to beginEditing and returns YES.
        if (canEdit) {
          itemView = this.itemViewForContentIndex(idx) ;
          canEdit = itemView && (!itemView.contentHitTest || itemView.contentHitTest(ev)) ;
          canEdit = (canEdit && itemView.beginEditing) ? itemView.beginEditing() : NO ;
        }
        
        // if cannot edit, schedule a reselect (but give doubleClick a chance)
        if (!canEdit) {
          if (this._cv_reselectTimer) this._cv_reselectTimer.invalidate() ;
          this._cv_reselectTimer = this.invokeLater(this.select, 300, idx, false) ;
        }
      }
      
      this._cleanupMouseDown() ;
    }

    // handle actions on editing
    this._cv_performSelectAction(view, ev, 0, ev.clickCount);
    
    return NO;  // bubble event to allow didDoubleClick to be called...
  },
  
  /** @private */
  _cleanupMouseDown: function() {
    
    // delete items explicitly to avoid leaks on IE
    var info = this.mouseDownInfo, key;
    if (info) {
      for(key in info) {
        if (!info.hasOwnProperty(key)) continue;
        delete info[key];
      }
    }
    this.mouseDownInfo = null;
  },
  
  /** @private */
  mouseMoved: function(ev) {
    var view = this.itemViewForEvent(ev), 
        last = this._lastHoveredItem ;

    // handle hover events.
    if (view !== last) {
      if (last && last.mouseOut) last.mouseOut(ev);
      if (view && view.mouseOver) view.mouseOver(ev);
    }
    this._lastHoveredItem = view ;

    if (view && view.mouseMoved) view.mouseMoved(ev);
    return YES;
  },
  
  /** @private */
  mouseOut: function(ev) {
    var view = this._lastHoveredItem ;
    this._lastHoveredItem = null ;
    if (view && view.mouseOut) view.mouseOut(ev) ;
    return YES ;
  },
  
  // ..........................................................
  // TOUCH EVENTS
  //
  
  touchStart: function(ev) {

    // When the user presses the mouse down, we don't do much just yet.
    // Instead, we just need to save a bunch of state about the mouse down
    // so we can choose the right thing to do later.

    // Toggle selection only triggers on mouse up.  Do nothing.
    if (this.get('useToggleSelection')) return true;

    // find the actual view the mouse was pressed down on.  This will call
    // hitTest() on item views so they can implement non-square detection
    // modes. -- once we have an item view, get its content object as well.
    var itemView      = this.itemViewForEvent(ev),
        content       = this.get('content'),
        contentIndex  = itemView ? itemView.get('contentIndex') : -1,
        info, anchor ;

    // become first responder if possible.
    this.becomeFirstResponder() ;
    this.select(contentIndex, NO);
    
    this._cv_performSelectAction(this, ev);
    
    return YES;
  },

  touchesDragged: function(evt, touches) {
    touches.forEach(function(touch){
      if (
        Math.abs(touch.pageX - touch.startX) > 5 ||
        Math.abs(touch.pageY - touch.startY) > 5
      ) {
        this.select(null, NO);
        touch.makeTouchResponder(touch.nextTouchResponder);
      }
    }, this);

  },

  touchCancelled: function(evt) {
    this.select(null, NO);
  },

  /** @private */
  _findSelectionExtendedByShift: function(sel, contentIndex) {
    
    // fast path.  if we don't have a selection, just select index
    if (!sel || sel.get('length')===0) {
      return SC.IndexSet.create(contentIndex);
    }
    
    // if we do have a selection, then figure out how to extend it.
    var content = this.get('content'),
        lim     = content.get('length')-1,
        min     = sel.get('min'),
        max     = sel.get('max')-1,
        info    = this.mouseDownInfo,
        anchor  = this._selectionAnchor ;
    if (SC.none(anchor)) anchor = -1;

    // clicked before the current selection set... extend it's beginning...
    if (contentIndex < min) {
      min = contentIndex;
      if (anchor<0) this._selectionAnchor = anchor = max; //anchor at end
    
    // clicked after the current selection set... extend it's ending...
    } else if (contentIndex > max) {
      max = contentIndex;
      if (anchor<0) this._selectionAnchor = anchor = min; // anchor at start
    
    // clicked inside the selection set... need to determine where the last
    // selection was and use that as an anchor.
    } else if (contentIndex >= min && contentIndex <= max) {
      if (anchor<0) this._selectionAnchor = anchor = min; //anchor at start
      
      if (contentIndex === anchor) min = max = contentIndex ;
      else if (contentIndex > anchor) {
        min = anchor;
        max = contentIndex ;
      } else if (contentIndex < anchor) {
        min = contentIndex;
        max = anchor ;
      }
    }

    return SC.IndexSet.create(min, max - min + 1);
  },
  
  // ......................................
  // DRAG AND DROP SUPPORT
  //

  /**
    When reordering its content, the collection view will store its reorder
    data using this special data type.  The data type is unique to each 
    collection view instance.  You can use this data type to detect reorders
    if necessary.
    
    @property
    @type String
  */
  reorderDataType: function() {
    return 'SC.CollectionView.Reorder.'+SC.guidFor(this) ;
  }.property().cacheable(),
  
  /**
    This property is set to the IndexSet of content objects that are the 
    subject of a drag whenever a drag is initiated on the collection view.  
    You can consult this property when implementing your collection view 
    delegate  methods, but otherwise you should not use this property in your 
    code.

    @type SC.IndexSet
  */
  dragContent: null,
  
  /**
    This property is set to the proposed insertion index during a call to
    collectionViewValidateDragOperation().  Your delegate implementations can 
    change the value of this property to enforce a drop some in some other 
    location.
    
    @type Number
  */
  proposedInsertionIndex: null,
  
  /**
    This property is set to the proposed drop operation during a call to
    collectionViewValidateDragOperation().  Your delegate implementations can 
    change the value of this property to enforce a different type of drop 
    operation.
    
    @type Number
    @property
  */
  proposedDropOperation: null,
  
  /** @private
    mouseDragged event handler.  Initiates a drag if the following conditions
    are met:
    
    - collectionViewShouldBeginDrag() returns YES *OR*
    - the above method is not implemented and canReorderContent is true.
    - the dragDataTypes property returns a non-empty array
    - a mouse down event was saved by the mouseDown method.
  */
  mouseDragged: function(ev) {
    
    var del     = this.get('selectionDelegate'),
        content = this.get('content'),
        sel     = this.get('selection'),
        info    = this.mouseDownInfo,
        groupIndexes = this.get('_contentGroupIndexes'),
        dragContent, dragDataTypes, dragView;
    
    // if the mouse down event was cleared, there is nothing to do; return.
    if (!info || info.contentIndex<0) return YES ;
    
    // Don't do anything unless the user has been dragging for 123msec
    if ((Date.now() - info.at) < 123) return YES ;
    
    // OK, they must be serious, decide if a drag will be allowed.
    if (del.collectionViewShouldBeginDrag(this)) {
      
      // First, get the selection to drag.  Drag an array of selected
      // items appearing in this collection, in the order of the 
      // collection.
      //
      // Compute the dragContent - the indexes we will be dragging.      
      // if we don't select on mouse down, then the selection has not been 
      // updated to whatever the user clicked.  Instead use
      // mouse down content.
      if (!this.get("selectOnMouseDown")) {
        dragContent = SC.IndexSet.create(info.contentIndex);
      } else dragContent = sel ? sel.indexSetForSource(content) : null;
      
      // remove any group indexes.  groups cannot be dragged.
      if (dragContent && groupIndexes && groupIndexes.get('length')>0) {
        dragContent = dragContent.copy().remove(groupIndexes);
        if (dragContent.get('length')===0) dragContent = null;
        else dragContent.freeze();
      }
      
      if (!dragContent) return YES; // nothing to drag
      else dragContent = dragContent.frozenCopy(); // so it doesn't change
      
      dragContent = { content: content, indexes: dragContent };
      this.set('dragContent', dragContent) ;
      
      // Get the set of data types supported by the delegate.  If this returns
      // a null or empty array and reordering content is not also supported
      // then do not start the drag.
      dragDataTypes = this.get('dragDataTypes');
      if (dragDataTypes && dragDataTypes.get('length') > 0) {
        
        // Build the drag view to use for the ghost drag.  This 
        // should essentially contain any visible drag items.
        dragView = del.collectionViewDragViewFor(this, dragContent.indexes);
        if (!dragView) dragView = this._cv_dragViewFor(dragContent.indexes);
        
        // Make sure the dragView has created its layer.
        dragView.createLayer();
        
        // Initiate the drag
        SC.Drag.start({
          event: info.event,
          source: this,
          dragView: dragView,
          ghost: NO,
          ghostActsLikeCursor: del.ghostActsLikeCursor,
          slideBack: YES,
          dataSource: this
        }); 

        // Also use this opportunity to clean up since mouseUp won't 
        // get called.
        this._cleanupMouseDown() ;
        this._lastInsertionIndex = null ;
        
      // Drag was not allowed by the delegate, so bail.
      } else this.set('dragContent', null) ;
      
      return YES ;
    }
  },

  /** @private
    Compute a default drag view by grabbing the raw layers and inserting them
    into a drag view.
  */
  _cv_dragViewFor: function(dragContent) {
    // find only the indexes that are in both dragContent and nowShowing.
    var indexes = this.get('nowShowing').without(dragContent);
    indexes = this.get('nowShowing').without(indexes);
    
    var dragLayer = this.get('layer').cloneNode(false); 
    var view = SC.View.create({ layer: dragLayer, parentView: this });

    // cleanup weird stuff that might make the drag look out of place
    SC.$(dragLayer).css('backgroundColor', 'transparent')
      .css('border', 'none')
      .css('top', 0).css('left', 0);
    
    indexes.forEach(function(i) {
      var itemView = this.itemViewForContentIndex(i),
          isSelected, layer;
        
      // render item view without isSelected state.  
      if (itemView) {
        isSelected = itemView.get('isSelected');
        itemView.set('isSelected', NO);
        
        itemView.updateLayerIfNeeded();
        layer = itemView.get('layer');
        if (layer) layer = layer.cloneNode(true);
        
        itemView.set('isSelected', isSelected);
        itemView.updateLayerIfNeeded();
      }

      if (layer) dragLayer.appendChild(layer);
      layer = null;
      
    }, this);

    dragLayer = null;
    return view ;
  },

  
  /**
    Implements the drag data source protocol for the collection view.  This
    property will consult the collection view delegate if one is provided. It
    will also do the right thing if you have set canReorderContent to YES.
    
    @property 
    @type Array
  */
  dragDataTypes: function() {
    // consult delegate.
    var del = this.get('selectionDelegate'),
        ret = del.collectionViewDragDataTypes(this),
        key ;

    if (this.get('canReorderContent')) {
      ret = ret ? ret.copy() : [];
      key = this.get('reorderDataType');
      if (ret.indexOf(key) < 0) ret.push(key);          
    }
        
    return ret ? ret : [];
  }.property(),
  
  /**
    Implements the drag data source protocol method.  The implementation of
    this method will consult the collection view delegate if one has been
    provided.  It also respects the canReoderContent method.
  */
  dragDataForType: function(drag, dataType) {
    
    // if this is a reorder, then return drag content.
    if (this.get('canReorderContent')) {
      if (dataType === this.get('reorderDataType')) {
        return this.get('dragContent') ;
      }
    }
    
    // otherwise, just pass along to the delegate
    var del = this.get('selectionDelegate');
    return del.collectionViewDragDataForType(this, drag, dataType);
  },
  
  /**
    Implements the SC.DropTarget interface.  The default implementation will
    consult the collection view delegate, if you implement those methods.
    
    This method is called once when the drag enters the view area.  It's 
    return value will be stored on the drag object as allowedDragOperations,
    possibly further constrained by the drag source.
    
    @param {SC.Drag} drag the drag object
    @param {SC.Event} evt the event triggering this change, if available
    @returns {Number} logical OR'd mask of allowed drag operations.
  */
  computeDragOperations: function(drag, evt) {

    // the proposed drag operation is DRAG_REORDER only if we can reorder
    // content and the drag contains reorder content.
    var op  = SC.DRAG_NONE,
        del = this.get('selectionDelegate');

    if (this.get('canReorderContent')) {
      if (drag.get('dataTypes').indexOf(this.get('reorderDataType')) >= 0) {
        op = SC.DRAG_REORDER ;
      }
    }
    
    // Now pass this onto the delegate.
    op = del.collectionViewComputeDragOperations(this, drag, op);
    if (op & SC.DRAG_REORDER) op = SC.DRAG_MOVE ;
    
    return op ;
  },
  
  /** @private
    Determines the allowed drop operation insertion point, operation type,
    and the drag operation to be performed.  Used by dragUpdated() and 
    performDragOperation().

    @param {SC.Drag} drag the drag object
    @param {SC.Event} evt source of this request, if available
    @param {Number} dragOp allowed drag operation mask
    Returns three params: [drop index, drop operation, allowed drag ops]
  */
  _computeDropOperationState: function(drag, evt, dragOp) {
    
    // get the insertion index for this location.  This can be computed
    // by a subclass using whatever method.  This method is not expected to
    // do any data valdidation, just to map the location to an insertion 
    // index.
    var loc    = this.convertFrameFromView(drag.get('location'), null),
        dropOp = SC.DROP_BEFORE,
        del    = this.get('selectionDelegate'),
        canReorder = this.get('canReorderContent'),
        objects, content, isPreviousInDrag, isNextInDrag, len, tmp;
    
    // STEP 1: Try with a DROP_ON option -- send straight to delegate if 
    // supported by view.
    
    // get the computed insertion index and possibly drop operation.
    // prefer to drop ON.
    var idx = this.insertionIndexForLocation(loc, SC.DROP_ON) ;
    if (SC.typeOf(idx) === SC.T_ARRAY) {
      dropOp = idx[1] ; // order matters here
      idx = idx[0] ;
    }
    
    // if the return drop operation is DROP_ON, then just check it with the
    // delegate method.  If the delegate method does not support dropping on,
    // then it will return DRAG_NONE, in which case we will try again with
    // drop before.
    if (dropOp === SC.DROP_ON) {
      
      // Now save the insertion index and the dropOp.  This may be changed by
      // the collection delegate.
      this.set('proposedInsertionIndex', idx) ;
      this.set('proposedDropOperation', dropOp) ;
      tmp = del.collectionViewValidateDragOperation(this, drag, dragOp, idx, dropOp) ;
      idx = this.get('proposedInsertionIndex') ;
      dropOp = this.get('proposedDropOperation') ;
      this._dropInsertionIndex = this._dropOperation = null ;

      // The delegate is OK with a drop on also, so just return.
      if (tmp !== SC.DRAG_NONE) return [idx, dropOp, tmp] ;
        
      // The delegate is NOT OK with a drop on, try to get the insertion
      // index again, but this time prefer SC.DROP_BEFORE, then let the 
      // rest of the method run...
      else {
        dropOp = SC.DROP_BEFORE ;
        idx = this.insertionIndexForLocation(loc, SC.DROP_BEFORE) ;
        if (SC.typeOf(idx) === SC.T_ARRAY) {
          dropOp = idx[1] ; // order matters here
          idx = idx[0] ;
        }
      }
    }
    
    // if this is a reorder drag, set the proposed op to SC.DRAG_REORDER and
    // validate the insertion point.  This only works if the insertion point
    // is DROP_BEFORE or DROP_AFTER.  DROP_ON is not handled by reordering 
    // content.
    if ((idx >= 0) && canReorder && (dropOp !== SC.DROP_ON)) {
      
      objects = drag.dataForType(this.get('reorderDataType')) ;
      if (objects) {
        content = this.get('content') ;
        
        // if the insertion index is in between two items in the drag itself, 
        // then this is not allowed.  Either use the last insertion index or 
        // find the first index that is not in between selections.  Stop when
        // we get to the beginning.
        if (dropOp === SC.DROP_BEFORE) {
          isPreviousInDrag = objects.indexes.contains(idx-1);
          isNextInDrag     = objects.indexes.contains(idx);
        } else {
          isPreviousInDrag = objects.indexes.contains(idx);
          isNextInDrag     = objects.indexes.contains(idx-1);
        }
        
        if (isPreviousInDrag && isNextInDrag) {
          if (SC.none(this._lastInsertionIndex)) {
            if (dropOp === SC.DROP_BEFORE) {
              while ((idx >= 0) && objects.indexes.contains(idx)) idx--;
            } else {
              len = content ? content.get('length') : 0;
              while ((idx < len) && objects.indexes.contains(idx)) idx++;
            }
          } else idx = this._lastInsertionIndex ;
        }
        
        // If we found a valid insertion point to reorder at, then set the op
        // to custom DRAG_REORDER.
        if (idx >= 0) dragOp = SC.DRAG_REORDER ;
      }
    }

    // Now save the insertion index and the dropOp.  This may be changed by
    // the collection delegate.
    this.set('proposedInsertionIndex', idx) ;
    this.set('proposedDropOperation', dropOp) ;
    dragOp = del.collectionViewValidateDragOperation(this, drag, dragOp, idx, dropOp) ;
    idx = this.get('proposedInsertionIndex') ;
    dropOp = this.get('proposedDropOperation') ;
    this._dropInsertionIndex = this._dropOperation = null ;
    
    // return generated state
    return [idx, dropOp, dragOp] ;
  },
  
  /** 
    Implements the SC.DropTarget interface.  The default implementation will
    determine the drop location and then consult the collection view delegate
    if you implement those methods.  Otherwise it will handle reordering
    content on its own.
  */
  dragUpdated: function(drag, evt) {
    
    var op     = drag.get('allowedDragOperations'),
        state  = this._computeDropOperationState(drag, evt, op),
        idx    = state[0], dropOp = state[1], dragOp = state[2];
    
    // if the insertion index or dropOp have changed, update the insertion 
    // point
    if (dragOp !== SC.DRAG_NONE) {
      if ((this._lastInsertionIndex !== idx) || (this._lastDropOperation !== dropOp)) {
        var itemView = this.itemViewForContentIndex(idx) ;
        this.showInsertionPoint(itemView, dropOp) ;
      }
      
      this._lastInsertionIndex = idx ;
      this._lastDropOperation = dropOp ;
    } else {
      this.hideInsertionPoint() ;
      this._lastInsertionIndex = this._lastDropOperation = null ;
    }
    
    // Normalize drag operation to the standard kinds accepted by the drag 
    // system.
    return (dragOp & SC.DRAG_REORDER) ? SC.DRAG_MOVE : dragOp;  
  },
  
  /**
    Implements the SC.DropTarget protocol.  Hides any visible insertion 
    point and clears some cached values.
  */
  dragExited: function() {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = this._lastDropOperation = null ;
  },
  
  /**
    Implements the SC.DropTarget protocol.
  */
  acceptDragOperation: function(drag, op) { return YES; },
  
  /**
    Implements the SC.DropTarget protocol.  Consults the collection view
    delegate to actually perform the operation unless the operation is 
    reordering content.
  */
  performDragOperation: function(drag, op) { 
        
    // Get the correct insertion point, drop operation, etc.
    var state = this._computeDropOperationState(drag, null, op),
        idx   = state[0], dropOp = state[1], dragOp = state[2],
        del   = this.get('selectionDelegate'),
        performed, objects, data, content, shift, indexes;
        
    // The dragOp is the kinds of ops allowed.  The drag operation must 
    // be included in that set.
    if (dragOp & SC.DRAG_REORDER) {
      op = (op & SC.DRAG_MOVE) ? SC.DRAG_REORDER : SC.DRAG_NONE ;
    } else op = op & dragOp ;
    
    // If no allowed drag operation could be found, just return.
    if (op === SC.DRAG_NONE) return op;
    
    // Some operation is allowed through, give the delegate a chance to
    // handle it.
    performed = del.collectionViewPerformDragOperation(this, drag, op, idx, dropOp) ;
    
    // If the delegate did not handle the drag (i.e. returned SC.DRAG_NONE),
    // and the op type is REORDER, then do the reorder here.
    if ((performed === SC.DRAG_NONE) && (op & SC.DRAG_REORDER)) {
      
      data = drag.dataForType(this.get('reorderDataType')) ;
      if (!data) return SC.DRAG_NONE ;
      
      content = this.get('content') ;
      
      // check for special case - inserting BEFORE ourself...
      // in this case just pretend the move happened since it's a no-op 
      // anyway
      indexes = data.indexes;
      if (indexes.get('length')===1) {
        if (((dropOp === SC.DROP_BEFORE) || (dropOp === SC.DROP_AFTER)) &&
            (indexes.get('min')===idx)) return SC.DRAG_MOVE;
      }
      
      content.beginPropertyChanges(); // suspend notifications

      // get each object, then remove it from the content. they will be 
      // added again later.
      objects = [];
      shift = 0;
      data.indexes.forEach(function(i) {  
        objects.push(content.objectAt(i-shift));
        content.removeAt(i-shift);
        shift++;
        if (i < idx) idx--;
      }, this);
      
      // now insert objects into new insertion locaiton
      if (dropOp === SC.DROP_AFTER) idx++;
      content.replace(idx, 0, objects, dropOp);
      this.select(SC.IndexSet.create(idx, objects.length));
      content.endPropertyChanges(); // restart notifications

      // make the op into its actual value
      op = SC.DRAG_MOVE ;
    }
    
    return op; 
  },
  
  /**
    Default delegate method implementation, returns YES if canReorderContent
    is also true.
  */
  collectionViewShouldBeginDrag: function(view) {
    return this.get('canReorderContent') ;
  },

  
  // ..........................................................
  // INSERTION POINT
  // 
  
  
  /**
    Get the preferred insertion point for the given location, including 
    an insertion preference of before, after or on the named index.
    
    You can implement this method in a subclass if you like to perform a 
    more efficient check.  The default implementation will loop through the 
    item views looking for the first view to "switch sides" in the orientation 
    you specify.
    
    This method should return an array with two values.  The first value is
    the insertion point index and the second value is the drop operation,
    which should be one of SC.DROP_BEFORE, SC.DROP_AFTER, or SC.DROP_ON. 
    
    The preferred drop operation passed in should be used as a hint as to 
    the type of operation the view would prefer to receive. If the 
    dropOperation is SC.DROP_ON, then you should return a DROP_ON mode if 
    possible.  Otherwise, you should never return DROP_ON.
    
    For compatibility, you can also return just the insertion index.  If you
    do this, then the collction view will assume the drop operation is 
    SC.DROP_BEFORE.
    
    If an insertion is NOT allowed, you should return -1 as the insertion 
    point.  In this case, the drop operation will be ignored.
    
    @param loc {Point} the mouse location.
    @param dropOperation {DropOp} the preferred drop operation.
    @returns {Array} [proposed drop index, drop operation] 
  */
  insertionIndexForLocation: function(loc, dropOperation) { 
    return -1; 
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private - when we become visible, reload if needed. */
  _cv_isVisibleInWindowDidChange: function() {
    if (this.get('isVisibleInWindow')) {
      if (this._invalidIndexes) this.invokeOnce(this.reloadIfNeeded);
      if (this._invalidSelection) {
        this.invokeOnce(this.reloadSelectionIndexesIfNeeded);
      } 
    }
  }.observes('isVisibleInWindow'),


  /**
    Default delegate method implementation, returns YES if isSelectable
    is also true.
  */
  collectionViewShouldSelectItem: function(view, item) {
    return this.get('isSelectable') ;
  },
  
  _TMP_DIFF1: SC.IndexSet.create(),
  _TMP_DIFF2: SC.IndexSet.create(),
  
  /** @private
  
    Whenever the nowShowing range changes, update the range observer on the 
    content item and instruct the view to reload any indexes that are not in
    the previous nowShowing range.

  */
  _cv_nowShowingDidChange: function() {
    var nowShowing  = this.get('nowShowing'),
        last        = this._sccv_lastNowShowing,
        diff, diff1, diff2;

    // find the differences between the two
    // NOTE: reuse a TMP IndexSet object to avoid creating lots of objects
    // during scrolling
    if (last !== nowShowing) {
      if (last && nowShowing) {
        diff1 = this._TMP_DIFF1.add(last).remove(nowShowing);
        diff2 = this._TMP_DIFF2.add(nowShowing).remove(last);
        diff = diff1.add(diff2);
      } else diff = last || nowShowing ;
    }

    // if nowShowing has actually changed, then update
    if (diff && diff.get('length') > 0) {
      this._sccv_lastNowShowing = nowShowing ? nowShowing.frozenCopy() : null;
      this.updateContentRangeObserver();
      this.reload(diff);
    }
    
    // cleanup tmp objects
    if (diff1) diff1.clear();
    if (diff2) diff2.clear();
    
  }.observes('nowShowing'),
  
  init: function() {
     arguments.callee.base.apply(this,arguments);
     if (this.useFastPath) this.mixin(SC.CollectionFastPath);
     if (this.get('canReorderContent')) this._cv_canReorderContentDidChange();
     this._sccv_lastNowShowing = this.get('nowShowing').clone();
     if (this.content) this._cv_contentDidChange();
     if (this.selection) this._cv_selectionDidChange();
  },
  
  /** @private
    Become a drop target whenever reordering content is enabled.
  */
  _cv_canReorderContentDidChange: function() {
    if (this.get('canReorderContent')) {
      if (!this.get('isDropTarget')) this.set('isDropTarget', YES);
      SC.Drag.addDropTarget(this);
    }
  }.observes('canReorderContent'),
  
  /** @private
    Fires an action after a selection if enabled.
    
    if actOnSelect is YES, then try to invoke the action, passing the 
    current selection (saved as a separate array so that a change in sel
    in the meantime will not be lost)
  */
  _cv_performSelectAction: function(view, ev, delay, clickCount) {
    var sel;
    if (delay === undefined) delay = 0 ;
    if (clickCount === undefined) clickCount = 1;
    if ((clickCount>1) || this.get('actOnSelect')) {
      if (this._cv_reselectTimer) this._cv_reselectTimer.invalidate() ;
      sel = this.get('selection');
      sel = sel ? sel.toArray() : [];
      if (this._cv_actionTimer) this._cv_actionTimer.invalidate();
      this._cv_actionTimer = this.invokeLater(this._cv_action, delay, view, ev, sel) ;
    }
  },
  
  /** @private
    Perform the action.  Supports legacy behavior as well as newer style
    action dispatch.
  */
  _cv_action: function(view, evt, context) {
    var action = this.get('action');
    var target = this.get('target') || null;

    this._cv_actionTimer = null;
    if (action) {
      // if the action is a function, just call it
      if (SC.typeOf(action) === SC.T_FUNCTION) return this.action(view, evt) ;
      
      // otherwise, use the new sendAction style
      var pane = this.get('pane') ;
      if (pane) {
        pane.rootResponder.sendAction(action, target, this, pane, context);
      }
      // SC.app.sendAction(action, target, this) ;
      
    // if no action is specified, then trigger the support action,
    // if supported.
    } else if (!view) {
      return ; // nothing to do
      
    // if the target view has its own internal action handler,
    // trigger that.
    } else if (SC.typeOf(view._action) == SC.T_FUNCTION) {
      return view._action(evt) ;
      
    // otherwise call the action method to support older styles.
    } else if (SC.typeOf(view.action) == SC.T_FUNCTION) {
      return view.action(evt) ;
    }
  }
  
  
});

/* >>>>>>>>>> BEGIN source/views/date_field.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Shared */

/** @class

  A Date field add behaviour to the Text Field to support date management, 
  for example, disabling deletion, and special behaviour to tabs commands.
  
  This field view is tighly inregrated with SC.DateTime
  
  By default the Date Field View show Date only, but if you need to show the Time do:
  
  {{{
    dateAndTime: Shared.DateFieldView.design({
      showTime: YES,
      valueBinding: '...'
    }),
  }}}
  
  and if you only need to show time: 
  
  {{{
    timeOnly: Shared.DateFieldView.design({
      showTime: YES,
      showDate: NO,
      valueBinding: '...'
    })
  }}}
  
  The default format are:
  - formatTime: '%I:%M %p',
  - formatDate: '%d/%m/%Y',
  - formatDateTime: '%d/%m/%Y %I:%M %p',
  
  Example usage with special format:

  specialDate: Shared.DateFieldView.design({
    formatDate: '%d %b of %Y',
    valueBinding: '...'
  }),
  
  You can override these format as you like, but has some limitations,
  actually only support these KEY from SC.DateTime:
  
  %a %b %d %H %I %j %m %M %p %S %U %W %y %Y
  
  These are keys that has FIXED length, so we can control the selection and tabing.
  
  @extends SC.TextFieldView
  @since SproutCore 1.0
  @author Juan Pablo Goldfinger
*/
SC.DateFieldView = SC.TextFieldView.extend(
/** @scope SC.DateFieldView.prototype */
{

  value: null,
  
  // Default Behaviour
  showDate: YES,
  showTime: NO,
  
  // Default formats to choose depending of the behaviour.
  formatTime: '%I:%M %p',
  formatDate: '%d/%m/%Y',
  formatDateTime: '%d/%m/%Y %I:%M %p',
  
  // DateTime constants (with fixed width, like numbers or abbs with fixed length)
  // original: '%a %A %b %B %c %d %h %H %i %I %j %m %M %p %S %U %W %x %X %y %Y %Z %%'.w(),
  // NOTE: I think that %a and %b areb't useful because is more adecuato to represente day
  // with 1..31 without zeros at start, but causes the lenght not to be fixed)
  _dtConstants: '%a %b %d %H %I %j %m %M %p %S %U %W %y %Y'.w(),
  // Width constants for each representation %@.
  _wtConstants: [3,3,2,2,2,3,2,2,2,2,2,2,2,4],
  
  // PRIVATE ATTRIBUTES
  activeSelection: 0,

  /*
  FUTURE: DatePickerSupport.
  createChildViews: function() {
    arguments.callee.base.apply(this,arguments);
    if (SC.browser.safari) {
      // ON MOZILLA DON'T WORK
      var view = Shared.DatePickerView.extend({
        layout: { right: 0, centerY: 0, width: 18, height: 15 }
      });
      view.bind('value', [this, 'value']);
      view.bind('isVisible', [this, 'isEnabled']);
      this.set('rightAccessoryView', view);
    }
  },
  */
  
  /**
    The current format to apply for Validator and to show.
    
    @property
    @type {String}
  */
  format: function() {
    var st = this.get('showTime');
    var sd = this.get('showDate');
    if (st === YES && sd === YES) return this.get('formatDateTime');
    if (st === YES) return this.get('formatTime');
    return this.get('formatDate');
  }.property('showTime', 'showDate').cacheable(),
  
  /**
    The current validator to format the Date to the input field and viceversa.
    
    @property
    @type {SC.Validator.DateTime}
  */
  validator: function() {
    return SC.Validator.DateTime.extend({ format: this.get('format') });
  }.property('format').cacheable(),
  
  /**
    Array of Key/TextSelection found for the current format.
    
    @property
    @type {SC.Array}
  */  
  tabsSelections: function() {
    var arr = [];
    var ft = this.get('format');
    var _dt = this.get('_dtConstants');
    var _wt = this.get('_wtConstants');
    
    // Parse the string format to retrieve and build 
    // a TextSelection array ordered to support tabs behaviour
    if (SC.empty(ft)) {
      throw 'The format string is empty, and must be a valid string.';
    }
    
    var pPos, key, keyPos, startAt = 0, nPos = 0, oPos = 0;
    while(startAt < ft.length && ft.indexOf('%', startAt) !== -1) {
      pPos = ft.indexOf('%', startAt);
      key = ft.substring(pPos, pPos + 2);
      startAt = pPos + 2;
      
      keyPos = _dt.indexOf(key);
      if (keyPos === -1) {
        throw "SC.DateFieldView: The format's key '%@' is not supported.".fmt(key); 
      }
      nPos = nPos + pPos - oPos;
      arr.push(SC.Object.create({
        key: key,
        textSelection: SC.TextSelection.create({ start: nPos, end: nPos + _wt[keyPos] })
      }));
      nPos = nPos + _wt[keyPos];
      oPos = startAt;   
    }
    pPos = key = keyPos = null;
    
    return arr;
  }.property('format').cacheable(),
  
  /** @private
    If the activeSelection changes or the value changes, update the "TextSelection" to show accordingly.
   
  */
  updateTextSelecitonObserver: function() {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    if (this.get('isEditing')) {
      this.selection(null, ts[as].get('textSelection'));
    }
  }.observes('activeSelection', 'value'),
  
  /** @private
    Updates the value according the key.
   
  */
  updateValue: function(key, upOrDown) {
    // 0 is DOWN - 1 is UP
    var newValue = (upOrDown === 0) ? -1 : 1;
    var value = this.get('value'), hour;
    switch(key) {
      case '%a': case '%d': case '%j': this.set('value', value.advance({ day: newValue })); break;
      case '%b': case '%m': this.set('value', value.advance({ month: newValue })); break;
      case '%H': case '%I': this.set('value', value.advance({ hour: newValue })); break;
      case '%M': this.set('value', value.advance({ minute: newValue })); break;
      case '%p': {
        hour = value.get('hour') >= 12 ? -12 : 12;
        this.set('value', value.advance({ hour: hour }));
        break;
      }
      case '%S': this.set('value', value.advance({ second: newValue })); break;
      case '%U': this.set('value', value.advance({ week1: newValue })); break;
      case '%W': this.set('value', value.advance({ week0: newValue })); break;
      case '%y': case '%Y': this.set('value', value.advance({ year: newValue })); break;
    } 
  },
  
  _selectRootElement: function() {
    // TODO: This is a solution while I don't found how we 
    // receive the last key from the last input.
    // (to see if is entering with Tab or backTab)
    /*if (this.get('activeSelection') === -1) {
    }*/
  },

  /*_textField_fieldDidFocus: function(evt) {
    SC.RunLoop.begin();
    //console.log(evt);
    //console.log(event);
    //console.log(evt.originalEvent);
    this.fieldDidFocus();
    SC.RunLoop.end();
  },*/
  
  /////////////////////////
  // KEY EVENTS SUPPORTS
  /////////////////////////
  
  keyDown: function(evt) {
    if (this.interpretKeyEvents(evt)) {
      evt.stop();
      return YES;
    }
    return arguments.callee.base.apply(this,arguments);
  },
  
  ctrl_a: function() {
    return YES;
  },

  moveUp: function(evt) {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 1);
    return YES;
  },

  moveDown: function(evt) {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 0);
    return YES;
  },

  insertText: function(evt) {
    return YES;
  },

  moveRight: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns === ts.length) {
      ns = 0;
    }
    this.set('activeSelection', ns);
    return YES;
  },
    
  moveLeft: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') - 1;
    if (ns === -1) {
      ns = ts.length - 1;
    }
    this.set('activeSelection', ns);
    return YES;
  },

  insertTab: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns < ts.length) { 
      this.set('activeSelection', ns);
      return YES;   
    }
    return NO;
  },

  insertBacktab: function(evt) {
    var ns = this.get('activeSelection') - 1;
    if (ns !== -1) { 
      this.set('activeSelection', ns);
      return YES;   
    }
    return NO;
  },

  mouseUp: function(evt) {
    var ret = arguments.callee.base.apply(this,arguments);
    var cs = this.get('selection');
    if (SC.none(cs)) {
      this.set('activeSelection', 0);
    } else {
      var caret = cs.get('start');
      var ts = this.get('tabsSelections');
      var _tsLen = ts.length, cts;
      for(var i=0; i<_tsLen; i++) {
        cts = ts[i].get('textSelection');
        if (caret >= cts.get('start') && caret <= cts.get('end')) {
          this.set('activeSelection', i);
        }
      }
    }
    return ret;
  },

  deleteBackward: function(evt) {
    return YES;
  },

  deleteForward: function(evt) {
    return YES;
  }

});

/* >>>>>>>>>> BEGIN source/views/disclosure.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Disclosure triangle button. As a subclass of SC.ButtonView, this view
  takes a lot of the same properties as a button:
  
  - isEnabled: whether disclosure triangle is clickable or not
  - value: YES or NO (where YES implies expanded/open)
  
  @extends SC.ButtonView
  @since SproutCore
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {
  
  classNames: ['sc-disclosure-view'],
  
  theme: 'disclosure',
  buttonBehavior: SC.TOGGLE_BEHAVIOR,
  
  /**
    This is the value that will be set when the disclosure triangle is toggled
    open.
  */
  toggleOnValue: YES,
  
  /**
    The value that will be set when the disclosure triangle is toggled closed.
  */
  toggleOffValue: NO,
  
  /** @private */
  valueBindingDefault: SC.Binding.bool() ,
  
  /** @private */
  render: function(context, firstTime) {
    var title = this.get('displayTitle');
    if(firstTime) {
      context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
      if(this.get('needsEllipsis')) {
        context.push('<span class="ellipsis sc-button-label">',title,'</span>');
      }
      else {
        context.push('<span class="sc-button-label">', title,'</span>');  
      }
    }
    else {
      this.$('label').text(title);
    }
  },
  
  /**
    Allows toggling of the value with the right and left arrow keys. 
    Extends the behavior inherted from SC.ButtonView.
    
    @param evt
  */
  keyDown: function(evt) {
    if (evt.which === 37 || evt.which === 38) {  
      this.set('value', this.get('toggleOffValue')) ;
      return YES;
    }
    if (evt.which === 39 || evt.which === 40) {  
      this.set('value', this.get('toggleOnValue')) ;
      return YES;
    }
    arguments.callee.base.apply(this,arguments);
  }
  
});

/* >>>>>>>>>> BEGIN source/views/list.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection');
sc_require('mixins/collection_row_delegate');

/** @class
  
  A list view renders vertical lists of items.  It is a specialized form of
  collection view that is simpler than the table view, but more refined than
  a generic collection.
  
  You can use a list view just like a collection view, except that often you
  also should provide a default rowHeight.  Setting this value will allow 
  the ListView to optimize its rendering.
  
  h2. Variable Row Heights

  Normally you set the row height through the rowHeight property.  You can 
  also support custom row heights by implementing the 
  contentCustomRowHeightIndexes property to return an index set.
  
  h2. Using ListView with Very Large Data Sets
  
  ListView implements incremental rendering, which means it will only render
  HTML for the items that are current visible on the screen.  You can use it
  to efficiently render lists with 100K+ items very efficiently.  
  
  If you need to work with very large lists of items, however, be aware that
  calculate variable rows heights can become very expensive since the list 
  view will essentially have to iterate over every item in the collection to
  collect its row height.  
  
  To work with very large lists, you should consider making your row heights
  uniform.  This will allow the list view to efficiently render content 
  without worrying about the overall performance.
  
  Alternatively, you may want to consider overriding the 
  offsetForRowAtContentIndex() and heightForRowAtContentIndex() methods to 
  perform some faster calculations that do not require inspecting every 
  item in the collection.
  
  Note that row heights and offsets are cached so once they are calculated
  the list view will be able to display very quickly.
  
  (Can we also have an 'estimate row heights' property that will simply 
  cheat for very long data sets to make rendering more efficient?)
  
  @extends SC.CollectionView
  @extends SC.CollectionRowDelegate
  @since SproutCore 1.0
*/
SC.ListView = SC.CollectionView.extend(
  SC.CollectionRowDelegate,
/** @scope SC.ListView.prototype */ {
  
  classNames: ['sc-list-view'],

  acceptsFirstResponder: YES,
  
  /**
  * If set to YES, the default theme will show alternating rows
  * for the views this ListView created through exampleView property.
  *
  * @property {Boolean} 
  */
  showAlternatingRows: NO,
  
  // ..........................................................
  // METHODS
  //
  
  render: function(context, firstTime) {
    context.setClass('alternating', this.get('showAlternatingRows'));
    
    return arguments.callee.base.apply(this,arguments);
  },

  // ..........................................................
  // COLLECTION ROW DELEGATE SUPPORT
  // 
  
  
  /**
    Returns the current collectionRowDelegate.  This property will recompute
    everytime the content changes.
  */
  rowDelegate: function() {
    var del     = this.delegate,
        content = this.get('content');
    return this.delegateFor('isCollectionRowDelegate', del, content);
  }.property('delegate', 'content').cacheable(),
  
  /** @private 
    Whenever the rowDelegate changes, begin observing important properties
  */
  _sclv_rowDelegateDidChange: function() {
    var last = this._sclv_rowDelegate,
        del  = this.get('rowDelegate'),
        func = this._sclv_rowHeightDidChange,
        func2 = this._sclv_customRowHeightIndexesDidChange;
        
    if (last === del) return this; // nothing to do
    this._sclv_rowDelegate = del; 

    // last may be null on a new object
    if (last) {
      last.removeObserver('rowHeight', this, func);
      last.removeObserver('customRowHeightIndexes', this, func2);
    }
    
    if (!del) {
      throw "Internal Inconsistancy: ListView must always have CollectionRowDelegate";
    }
    
    del.addObserver('rowHeight', this, func);
    del.addObserver('customRowHeightIndexes', this, func2);
    this._sclv_rowHeightDidChange()._sclv_customRowHeightIndexesDidChange();
    return this ;
  }.observes('rowDelegate'),

  /** @private 
    called whenever the rowHeight changes.  If the property actually changed
    then invalidate all row heights.
  */
  _sclv_rowHeightDidChange: function() {
    var del = this.get('rowDelegate'),
        height = del.get('rowHeight'), 
        indexes;
        
    if (height === this._sclv_rowHeight) return this; // nothing to do
    this._sclv_rowHeight = height;

    indexes = SC.IndexSet.create(0, this.get('length'));
    this.rowHeightDidChangeForIndexes(indexes);
    return this ;
  },

  /** @private 
    called whenever the customRowHeightIndexes changes.  If the property 
    actually changed then invalidate affected row heights.
  */
  _sclv_customRowHeightIndexesDidChange: function() {
    var del     = this.get('rowDelegate'),
        indexes = del.get('customRowHeightIndexes'), 
        last    = this._sclv_customRowHeightIndexes,
        func    = this._sclv_customRowHeightIndexesContentDidChange;
        
    // nothing to do
    if ((indexes===last) || (last && last.isEqual(indexes))) return this;

    // if we were observing the last index set, then remove observer
    if (last && this._sclv_isObservingCustomRowHeightIndexes) {
      last.removeObserver('[]', this, func);
    }
    
    // only observe new index set if it exists and it is not frozen.
    if (this._sclv_isObservingCustomRowHeightIndexes = indexes && !indexes.get('isFrozen')) {
      indexes.addObserver('[]', this, func);
    }
    
    this._sclv_customRowHeightIndexesContentDidChange();
    return this ;
  },

  /** @private
    Called whenever the customRowHeightIndexes set is modified.
  */
  _sclv_customRowHeightIndexesContentDidChange: function() {
    var del     = this.get('rowDelegate'),
        indexes = del.get('customRowHeightIndexes'), 
        last    = this._sclv_customRowHeightIndexes, 
        changed;

    // compute the set to invalidate.  the union of cur and last set
    if (indexes && last) {
      changed = indexes.copy().add(last);
    } else changed = indexes || last ;
    this._sclv_customRowHeightIndexes = indexes ? indexes.frozenCopy() : null; 

    // invalidate
    this.rowHeightDidChangeForIndexes(changed);
    return this ;
  },
  
  // ..........................................................
  // ROW PROPERTIES
  // 
  
  /**
    Returns the top offset for the specified content index.  This will take
    into account any custom row heights and group views.
    
    @param {Number} idx the content index
    @returns {Number} the row offset
  */
  rowOffsetForContentIndex: function(idx) {
    if (idx === 0) return 0 ; // fastpath

    var del       = this.get('rowDelegate'),
        rowHeight = del.get('rowHeight'),
        rowSpacing, ret, custom, cache, delta, max, content ;
        
    ret = idx * rowHeight;

    rowSpacing = this.get('rowSpacing');
		if(rowSpacing){ 
      ret += idx * rowSpacing; 
    } 

    if (del.customRowHeightIndexes && (custom=del.get('customRowHeightIndexes'))) {
      
      // prefill the cache with custom rows.
      cache = this._sclv_offsetCache;
      if (!cache) {
        cache = [];
        delta = max = 0 ;
        custom.forEach(function(idx) {
          delta += this.rowHeightForContentIndex(idx)-rowHeight;
          cache[idx+1] = delta;
          max = idx ;
        }, this);
        this._sclv_max = max+1;
        // moved down so that the cache is not marked as initialized until it actually is
        this._sclv_offsetCache = cache;
      }
      
      // now just get the delta for the last custom row before the current 
      // idx.
      delta = cache[idx];
      if (delta === undefined) {
        delta = cache[idx] = cache[idx-1];
        if (delta === undefined) {
          max = this._sclv_max;
          if (idx < max) max = custom.indexBefore(idx)+1;
          delta = cache[idx] = cache[max] || 0;
        }
      }

      ret += delta ;
    }
    
    return ret ;
  },
  
  /**
    Returns the row height for the specified content index.  This will take
    into account custom row heights and group rows.
    
    @param {Number} idx content index
    @returns {Number} the row height
  */
  rowHeightForContentIndex: function(idx) {
    var del = this.get('rowDelegate'),
        ret, cache, content, indexes;
    
    if (del.customRowHeightIndexes && (indexes=del.get('customRowHeightIndexes'))) {
      cache = this._sclv_heightCache ;
      if (!cache) {
        cache = [];
        content = this.get('content');
        indexes.forEach(function(idx) {
          cache[idx] = del.contentIndexRowHeight(this, content, idx);
        }, this);
        // moved down so that the cache is not marked as initialized until it actually is
        this._sclv_heightCache = cache;
      }
      
      ret = cache[idx];
      if (ret === undefined) ret = del.get('rowHeight');
    } else ret = del.get('rowHeight');
    
    return ret ;
  },
  
  /**
    Call this method whenever a row height has changed in one or more indexes.
    This will invalidate the row height cache and reload the content indexes.
    Pass either an index set or a single index number.

    This method is called automatically whenever you change the rowHeight
    or customRowHeightIndexes properties on the collectionRowDelegate.
    
    @param {SC.IndexSet|Number} indexes 
    @returns {SC.ListView} receiver
  */  
  rowHeightDidChangeForIndexes: function(indexes) {
    var len     = this.get('length');

    // clear any cached offsets
    this._sclv_heightCache = this._sclv_offsetCache = null;
    
    // find the smallest index changed; invalidate everything past it
    if (indexes && indexes.isIndexSet) indexes = indexes.get('min');
    this.reload(SC.IndexSet.create(indexes, len-indexes));
    return this ;
  },
  
  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  // 
  
  /**
    The layout for a ListView is computed from the total number of rows 
    along with any custom row heights.
  */
  computeLayout: function() {
    // default layout
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'));
    this.set('calculatedHeight',ret.minHeight);
    return ret ;
  },
  
  /**
  
    Computes the layout for a specific content index by combining the current
    row heights.
  
  */
  layoutForContentIndex: function(contentIndex) {
    return {
      top:    this.rowOffsetForContentIndex(contentIndex),
      height: this.rowHeightForContentIndex(contentIndex),
      left:   0, 
      right:  0
    };
  },
  
  /**
    Override to return an IndexSet with the indexes that are at least 
    partially visible in the passed rectangle.  This method is used by the 
    default implementation of computeNowShowing() to determine the new 
    nowShowing range after a scroll.
    
    Override this method to implement incremental rendering.
    
    The default simply returns the current content length.
    
    @param {Rect} rect the visible rect or a point
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function(rect) {
    var rowHeight = this.get('rowDelegate').get('rowHeight'),
        top       = SC.minY(rect),
        bottom    = SC.maxY(rect),
        height    = rect.height || 0,
        len       = this.get('length'),
        offset, start, end;

    // estimate the starting row and then get actual offsets until we are 
    // right.
    start = (top - (top % rowHeight)) / rowHeight;
    offset = this.rowOffsetForContentIndex(start);
    
    // go backwards until top of row is before top edge
    while(start>0 && offset>top) {
      start--;
      offset -= this.rowHeightForContentIndex(start);
    }
    
    // go forwards until bottom of row is after top edge
    offset += this.rowHeightForContentIndex(start);
    while(start<len && offset<=top) {
      start++;
      offset += this.rowHeightForContentIndex(start);
    }
    if (start<0) start = 0;
    if (start>=len) start=len;
    
    
    // estimate the final row and then get the actual offsets until we are 
    // right. - look at the offset of the _following_ row
    end = start + ((height - (height % rowHeight)) / rowHeight) ;
    if (end > len) end = len;
    offset = this.rowOffsetForContentIndex(end);
    
    // walk backwards until top of row is before or at bottom edge
    while(end>=start && offset>=bottom) {
      end--;
      offset -= this.rowHeightForContentIndex(end);
    }
    
    // go forwards until bottom of row is after bottom edge
    offset += this.rowHeightForContentIndex(end);
    while(end<len && offset<bottom) {
      end++;
      offset += this.rowHeightForContentIndex(end);
    }
    
    end++; // end should be after start
    
    // if height is greater than 0, on some platforms we should just render
    // to specific windows in order to minimize render time.
    // if (height > 0 && !SC.browser.msie) {
    //   start = start - (start % 50);
    //   if (start < 0) start = 0 ;
    //   end   = end - (end % 50) + 50;
    // }
    
    if (end<start) end = start;
    if (end>len) end = len ;
    
    // convert to IndexSet and return
    return SC.IndexSet.create(start, end-start);
  },
  
  // ..........................................................
  // DRAG AND ROP SUPPORT
  // 
  
  
  /**
    Default view class used to draw an insertion point.  The default 
    view will show a vertical line.  Any view you create
    should expect an outlineLevel property set, which should impact your left
    offset.
    
    @property 
    @type {SC.View}
  */
  insertionPointView: SC.View.extend({
    classNames: 'sc-list-insertion-point',
    
    render: function(context, firstTime) {
      if (firstTime) context.push('<div class="anchor"></div>');
    }
    
  }),

  /**
    Default implementation will show an insertion point
  */
  showInsertionPoint: function(itemView, dropOperation) {
    var view = this._insertionPointView;
    if (!view) {
      view = this._insertionPointView 
           = this.get('insertionPointView').create();
    }
    
    var index  = itemView.get('contentIndex'),
        len    = this.get('length'),
        layout = SC.clone(itemView.get('layout')),
        level  = itemView.get('outlineLevel'),
        indent = itemView.get('outlineIndent') || 0,
        group;

    // show item indented if we are inserting at the end and the last item
    // is a group item.  This is a special case that should really be 
    // converted into a more general protocol.
    if ((index >= len) && index>0) {
      group = this.itemViewForContentIndex(len-1);
      if (group.get('isGroupView')) {
        level = 1;
        indent = group.get('outlineIndent');
      }
    }
    
    if (SC.none(level)) level = -1;
    
    if (dropOperation & SC.DROP_ON) {
      this.hideInsertionPoint();
      itemView.set('isSelected', YES);
      this._lastDropOnView = itemView;
    } else {

      if (this._lastDropOnView) {
        this._lastDropOnView.set('isSelected', NO);
        this._lastDropOnView = null;
      }
      
      if (dropOperation & SC.DROP_AFTER) layout.top += layout.height;
      
      layout.height = 2;
      layout.right  = 0;
      layout.left   = ((level+1) * indent) + 12;
      delete layout.width;

      view.set('layout', layout);
      this.appendChild(view);
    }
  },
  
  hideInsertionPoint: function() {
    if (this._lastDropOnView) {
      this._lastDropOnView.set('isSelected', NO);
      this._lastDropOnView = null;
    }
    
    var view = this._insertionPointView;
    if (view) view.removeFromParent().destroy();
    this._insertionPointView = null;
  },

  /**
    Compute the insertion index for the passed location.  The location is 
    a point, relative to the top/left corner of the receiver view.  The return
    value is an index plus a dropOperation, which is computed as such:
    
    - if outlining is not used and you are within 5px of an edge, DROP_BEFORE
      the item after the edge.
      
    - if outlining is used and you are within 5px of an edge and the previous
      item has a different outline level then the next item, then DROP_AFTER
      the previous item if you are closer to that outline level.
      
    - if dropOperation = SC.DROP_ON and you are over the middle of a row, then
      use DROP_ON.
  */
  insertionIndexForLocation: function(loc, dropOperation) {
    var locRect = {x:loc.x, y:loc.y, width:1, height:1},
        indexes = this.contentIndexesInRect(locRect),
        index   = indexes.get('min'),
        len     = this.get('length'),
        min, max, diff, clevel, cindent, plevel, pindent, itemView, pgroup;

    // if there are no indexes in the rect, then we need to either insert
    // before the top item or after the last item.  Figure that out by 
    // computing both.
    if (SC.none(index) || index<0) {
      if ((len===0) || (loc.y <= this.rowOffsetForContentIndex(0))) index = 0;
      else if (loc.y >= this.rowOffsetForContentIndex(len)) index = len;
    }

    // figure the range of the row the location must be within.
    min = this.rowOffsetForContentIndex(index);
    max = min + this.rowHeightForContentIndex(index);
    
    // now we know which index we are in.  if dropOperation is DROP_ON, figure
    // if we can drop on or not.
    if (dropOperation == SC.DROP_ON) {
      // editable size - reduce height by a bit to handle dropping
      if (this.get('isEditable')) diff=Math.min(Math.floor((max-min)*0.2),5);
      else diff = 0;
      
      // if we're inside the range, then DROP_ON
      if (loc.y >= (min+diff) || loc.y <= (max+diff)) {
        return [index, SC.DROP_ON];
      }
    }
    
    
    
    // ok, now if we are in last 10px, go to next item.
    if ((index<len) && (loc.y >= max-10)) index++;
    
    // finally, let's decide if we want to actually insert before/after.  Only
    // matters if we are using outlining.
    if (index>0) {

      itemView = this.itemViewForContentIndex(index-1);
      pindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
      plevel   = itemView ? itemView.get('outlineLevel') : 0;
      
      if (index<len) {
        itemView = this.itemViewForContentIndex(index);
        clevel   = itemView ? itemView.get('outlineLevel') : 0;
        cindent  = (itemView ? itemView.get('outlineIndent') : 0) || 0;
        cindent  *= clevel;
      } else {
        clevel = itemView.get('isGroupView') ? 1 : 0; // special case...
        cindent = pindent * clevel;  
      }

      pindent  *= plevel;

      // if indent levels are different, then try to figure out which level 
      // it should be on.
      if ((clevel !== plevel) && (cindent !== pindent)) {
        
        // use most inner indent as boundary
        if (pindent > cindent) {
          index--;
          dropOperation = SC.DROP_AFTER;
        }
      }
    }

    // we do not support dropping before a group item.  If dropping before 
    // a group item, always try to instead drop after the previous item.  If
    // the previous item is also a group then, well, dropping is just not 
    // allowed.  Note also that dropping at 0, first item must not be group
    // and dropping at length, last item must not be a group
    //
    if (dropOperation === SC.DROP_BEFORE) {
      itemView = (index<len) ? this.itemViewForContentIndex(index) : null;
      if (!itemView || itemView.get('isGroupView')) {
        if (index>0) {
          itemView = this.itemViewForContentIndex(index-1);
          
          // don't allow a drop if the previous item is a group view and we're
          // insert before the end.  For the end, allow the drop if the 
          // previous item is a group view but OPEN.
          if (!itemView.get('isGroupView') || (itemView.get('disclosureState') === SC.BRANCH_OPEN)) {
            index = index-1;
            dropOperation = SC.DROP_AFTER;
          } else index = -1;

        } else index = -1;
      }
      
      if (index<0) dropOperation = SC.DRAG_NONE ;
    } 
    
    // return whatever we came up with
    return [index, dropOperation];
  },
  
  mouseWheel: function(evt) {
    // The following commits changes in a list item that is being edited,
    // if the list is scrolled.
    var inlineEditor = SC.InlineTextFieldView.editor;
    if(inlineEditor && inlineEditor.get('isEditing')){
      if(inlineEditor.get('delegate').get('displayDelegate')===this){
        SC.InlineTextFieldView.commitEditing();
      }
    }
    return NO ;  
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._sclv_rowDelegateDidChange();
  }  
  
});

/* >>>>>>>>>> BEGIN source/views/grid.js */
// ==========================================================================
// SC.GridView
// ==========================================================================

require('views/list') ;

/** @class

  A grid view renders a collection of items in a grid of rows and columns.

  @extends SC.CollectionView
  @author    Charles Jolley  
  @version 1.0
*/
SC.GridView = SC.ListView.extend(
/** @scope SC.GridView.prototype */ {
    classNames: ['sc-grid-view'],
  
  layout: { left:0, right:0, top:0, bottom:0 },

  /** 
    The common row height for grid items.
    
    The value should be an integer expressed in pixels.
  */
  rowHeight: 48,
  
  /**
    The minimum column width for grid items.  Items will actually
    be laid out as needed to completely fill the space, but the minimum
    width of each item will be this value.
  */
  columnWidth: 64,

  /**
    The default example item view will render text-based items.
    
    You can override this as you wish.
  */
  exampleView: SC.LabelView,
  
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,
  
  /** @private */
  itemsPerRow: function() {
    var f = this.get('frame'),
        columnWidth = this.get('columnWidth') || 0 ;

    return (columnWidth <= 0) ? 1 : Math.floor(f.width / columnWidth) ;
  }.property('clippingFrame', 'columnWidth').cacheable(),
  
  /** @private
    Find the contentIndexes to display in the passed rect. Note that we 
    ignore the width of the rect passed since we need to have a single
    contiguous range.
  */
  contentIndexesInRect: function(rect) {
    var rowHeight = this.get('rowHeight') || 48 ,
        itemsPerRow = this.get('itemsPerRow'),
        min = Math.floor(SC.minY(rect) / rowHeight) * itemsPerRow,
        max = Math.ceil(SC.maxY(rect) / rowHeight) * itemsPerRow ;
    return SC.IndexSet.create(min, max-min);
  },
  
  /** @private */
  layoutForContentIndex: function(contentIndex) {
    var rowHeight = this.get('rowHeight') || 48,
        frameWidth = this.get('clippingFrame').width,
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = Math.floor(frameWidth/itemsPerRow),
        row = Math.floor(contentIndex / itemsPerRow),
        col = contentIndex - (itemsPerRow*row) ;
    return { 
      left: col * columnWidth,
      top: row * rowHeight,
      height: rowHeight,
      width: columnWidth
    };
  },
  
  /** @private
    Overrides default CollectionView method to compute the minimim height
    of the list view.
  */
  computeLayout: function() {
    var content = this.get('content'),
        count = (content) ? content.get('length') : 0,
        rowHeight = this.get('rowHeight') || 48,
        itemsPerRow = this.get('itemsPerRow'),
        rows = Math.ceil(count / itemsPerRow) ;
  
    // use this cached layout hash to avoid allocing memory...
    var ret = this._cachedLayoutHash ;
    if (!ret) ret = this._cachedLayoutHash = {};
    
    // set minHeight
    ret.minHeight = rows * rowHeight ;
    this.calculatedHeight = ret.minHeight;
    return ret; 
  },
  
  insertionPointClass: SC.View.extend({
    classNames: ['grid-insertion-point'],
    
    render: function(context, firstTime) {
      if (firstTime) context.push('<span class="anchor"></span>') ;
    }

  }),
  
  showInsertionPoint: function(itemView, dropOperation) {
    if (!itemView) return ;
    
    // if drop on, then just add a class...
    if (dropOperation === SC.DROP_ON) {
      if (itemView !== this._dropOnInsertionPoint) {
        this.hideInsertionPoint() ;
        //itemView.addClassName('drop-target') ;
        this._dropOnInsertionPoint = itemView ;
      }
      
    } else {
      
      if (this._dropOnInsertionPoint) {
        //this._dropOnInsertionPoint.removeClassName('drop-target') ;
        this._dropOnInsertionPoint = null ;
      }
    
      if (!this._insertionPointView) {
        this._insertionPointView = this.insertionPointClass.create() ;
      }
    
      var insertionPoint = this._insertionPointView ;
      var itemViewFrame = itemView.get('frame') ;
      var f = { height: itemViewFrame.height - 6, 
            x: itemViewFrame.x, 
            y: itemViewFrame.y + 6, 
            width: 0 
          };

      if (!SC.rectsEqual(insertionPoint.get('frame'), f)) {
        insertionPoint.set('frame', f) ;
      }

      if (insertionPoint.parentNode !== itemView.parentNode) {
        itemView.parentNode.appendChild(insertionPoint) ;
      }
    }
    
  },
    
  hideInsertionPoint: function() {
    var insertionPoint = this._insertionPointView ;
    if (insertionPoint) insertionPoint.removeFromParent() ;

    if (this._dropOnInsertionPoint) {
      //this._dropOnInsertionPoint.removeClassName('drop-target') ;
      this._dropOnInsertionPoint = null ;
    }
  },
  
  // // We can do this much faster programatically using the rowHeight
  insertionIndexForLocation: function(loc, dropOperation) {  
    var f = this.get('frame'),
        sf = this.get('clippingFrame'),
        itemsPerRow = this.get('itemsPerRow'),
        columnWidth = Math.floor(f.width / itemsPerRow),
        row = Math.floor((loc.y - f.y - sf.y) / this.get('rowHeight')) ;

    var retOp = SC.DROP_BEFORE,
        offset = (loc.x - f.x - sf.x),
        col = Math.floor(offset / columnWidth),
        percentage = (offset / columnWidth) - col ;
    
    // if the dropOperation is SC.DROP_ON and we are in the center 60%
    // then return the current item.
    if (dropOperation === SC.DROP_ON) {
      if (percentage > 0.80) col++ ;
      if ((percentage >= 0.20) && (percentage <= 0.80)) {
        retOp = SC.DROP_ON;
      }
    } else {
      if (percentage > 0.45) col++ ;
    }
    
    // convert to index
    var ret= (row*itemsPerRow) + col ;
    return [ret, retOp] ;
  },

  /** @private
    If the size of the clipping frame changes, all of the item views
    on screen are potentially in the wrong position.  Update all of their
    layouts if different.
  */
  _gv_clippingFrameDidChange: function() {
    var nowShowing = this.get('nowShowing'), itemView, idx, len;
    this.notifyPropertyChange('itemsPerRow');

    len = nowShowing.get('length');

    for (idx=0; idx < len; idx++) {
      itemView = this.itemViewForContentIndex(idx);
      itemView.adjust(this.layoutForContentIndex(idx));
    }
  }.observes('clippingFrame')
}) ;

/* >>>>>>>>>> BEGIN source/views/scroller.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays a horizontal or vertical scroller.  You will not usually need to
  work with scroller views directly, but you may override this class to
  implement your own custom scrollers.

  Because the scroller uses the dimensions of its constituent elements to
  calculate layout, you may need to override the default display metrics.

  You can either create a subclass of ScrollerView with the new values, or
  provide your own in your theme:

{{{
  SC.mixin(SC.ScrollerView.prototype, {
    scrollbarThickness: 14,
    capLength: 18,
    capOverlap: 14,
    buttonOverlap: 11,
    buttonLength: 41
  });
}}}

  You can change whether scroll buttons are displayed by setting the
  hasButtons property.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollerView = SC.View.extend(
/** @scope SC.ScrollerView.prototype */ {

  classNames: ['sc-scroller-view'],

  // ..........................................................
  // PROPERTIES
  //
  
  /**
    If YES, a click on the track will cause the scrollbar to scroll to that position.
    Otherwise, a click on the track will cause a page down.
    
    In either case, alt-clicks will perform the opposite behavior.
  */
  shouldScrollToClick: NO,
  
  
  /**
    @private
    The in-touch-scroll value.
  */
  _touchScrollValue: NO,

  /**
    The value of the scroller.

    The value represents the position of the scroller's thumb.

    @property {Number}
  */
  value: function(key, val) {
    var minimum = this.get('minimum');
    if (val !== undefined) {
      this._scs_value = val;
    }

    val = this._scs_value || minimum; // default value is at top/left
    return Math.max(Math.min(val, this.get('maximum')), minimum) ;
  }.property('maximum', 'minimum').cacheable(),
  
  displayValue: function() {
    var ret;
    if (this.get("_touchScrollValue")) ret = this.get("_touchScrollValue");
    else ret = this.get("value");
    return ret;
  }.property("value", "_touchScrollValue").cacheable(),

  /**
    The portion of the track that the thumb should fill. Usually the
    proportion will be the ratio of the size of the scroll view's content view
    to the size of the scroll view.

    Should be specified as a value between 0.0 (minimal size) and 1.0 (fills
    the slot). Note that if the proportion is 1.0 then the control will be
    disabled.

    @property {Number}
  */
  proportion: 0,

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    When set less than the height of the scroller, the scroller is disabled.

    @property {Number}
  */
  maximum: 100,

  /**
    The minimum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    @property {Number}
  */
  minimum: 0,

  /**
    YES to enable scrollbar, NO to disable it.  Scrollbars will automatically
    disable if the maximum scroll width does not exceed their capacity.

    @property
  */
  isEnabled: YES,

  /**
    Determine the layout direction.  Determines whether the scrollbar should
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect.

    @property
  */
  layoutDirection: SC.LAYOUT_VERTICAL,

  /**
    Whether or not the scroller should display scroll buttons

    @property {Boolean}
    @default YES
  */
  hasButtons: YES,

  // ..........................................................
  // DISPLAY METRICS
  //

  /**
    The width (if vertical scroller) or height (if horizontal scroller) of the 
    scrollbar.

    @property {Number}
  */
  scrollbarThickness: 14,
  
  /**
    The width or height of the cap that encloses the track.

    @property {Number}
  */
  capLength: 18,

  /**
    The amount by which the thumb overlaps the cap.

    @property {Number}
  */
  capOverlap: 14,

  /**
    The width or height of the up/down or left/right arrow buttons. If the
    scroller is not displaying arrows, this is the width or height of the end
    cap.

    @property {Number}
  */
  buttonLength: 41,

  /**
    The amount by which the thumb overlaps the arrow buttons. If the scroller
    is not displaying arrows, this is the amount by which the thumb overlaps
    the end cap.

    @property {Number}
  */
  buttonOverlap: 11,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'thumbPosition thumbLength isEnabled controlsHidden'.w(),

  /**
    Generates the HTML that gets displayed to the user.

    The first time render is called, the HTML will be output to the DOM.
    Successive calls will reposition the thumb based on the value property.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @private
  */
  render: function(context, firstTime) {
    var classNames = {},
        buttons = '',
        thumbPosition, thumbLength, thumbCenterLength, thumbElement,
        value, max, scrollerLength, length, pct;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        classNames['sc-vertical'] = YES;
        break;
      case SC.LAYOUT_HORIZONTAL:
        classNames['sc-horizontal'] = YES;
        break;
    }

    // The appearance of the scroller changes if disabled
    classNames['disabled'] = !this.get('isEnabled');
    // Whether to hide the thumb and buttons
    classNames['controls-hidden'] = this.get('controlsHidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.setClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      if (this.get('hasButtons')) {
        buttons = '<div class="button-bottom"></div><div class="button-top"></div>';
      } else {
        buttons = '<div class="endcap"></div>';
      }

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb" style="height: '+thumbLength+'px; top: ' + thumbPosition + 'px;">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-bottom"></div></div>');
        break;
        case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb" style="width: '+thumbLength+'px; left: ' + thumbPosition + 'px;">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-bottom"></div></div>');
      }
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  },

  /**
  @private
  */
  touchScrollDidStart: function(value) {
    this.set("_touchScrollValue", value);
  },
  
  touchScrollDidEnd: function(value) {
    this.set("_touchScrollValue", NO);
  },
  
  touchScrollDidChange: function(value) {
    this.set("_touchScrollValue", value);
  },

  // ..........................................................
  // THUMB MANAGEMENT
  //
  /**
    Adjusts the thumb (for backwards-compatibility calls adjustThumbPosition+adjustThumbSize by default)
  */
  adjustThumb: function(thumb, position, length) {
    this.adjustThumbPosition(thumb, position);
    this.adjustThumbSize(thumb, length);
  },

  /**
    Updates the position of the thumb DOM element.

    @param {Number} position the position of the thumb in pixels
    @private
  */
  adjustThumbPosition: function(thumb, position) {
    // Don't touch the DOM if the position hasn't changed
    if (this._thumbPosition === position) return;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        thumb.css('top', position);
        break;
      case SC.LAYOUT_HORIZONTAL:
        thumb.css('left', position);
        break;
    }

    this._thumbPosition = position;
  },

  adjustThumbSize: function(thumb, size) {
    // Don't touch the DOM if the size hasn't changed
    if (this._thumbSize === size) return;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        thumb.css('height', Math.max(size, 20));
        break;
      case SC.LAYOUT_HORIZONTAL:
        thumb.css('width', Math.max(size,20));
        break;
    }

    this._thumbSize = size;
  },

  // ..........................................................
  // SCROLLER DIMENSION COMPUTED PROPERTIES
  //

  /**
    Returns the total length of the track in which the thumb sits.

    The length of the track is the height or width of the scroller, less the
    cap length and the button length. This property is used to calculate the
    position of the thumb relative to the view.

    @property
    @private
  */
  trackLength: function() {
    var scrollerLength = this.get('scrollerLength');

    // Subtract the size of the top/left cap
    scrollerLength -= this.capLength - this.capOverlap;
    // Subtract the size of the scroll buttons, or the end cap if they are
    // not shown.
    scrollerLength -= this.buttonLength - this.buttonOverlap;

    return scrollerLength;
  }.property('scrollerLength').cacheable(),

  /**
    Returns the height of the view if this is a vertical scroller or the width
    of the view if this is a horizontal scroller. This is used when scrolling
    up and down by page, as well as in various layout calculations.

    @property {Number}
    @private
  */
  scrollerLength: function() {
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        return this.get('frame').height;
      case SC.LAYOUT_HORIZONTAL:
        return this.get('frame').width;
    }

    return 0;
  }.property('frame').cacheable(),

  /**
    The total length of the thumb. The size of the thumb is the
    length of the track times the content proportion.

    @property
    @private
  */
  thumbLength: function() {
    var length;

    length = Math.floor(this.get('trackLength') * this.get('proportion'));
    length = isNaN(length) ? 0 : length;

    return Math.max(length,20);
  }.property('trackLength', 'proportion').cacheable(),

  /**
    The position of the thumb in the track.

    @property {Number}
    @isReadOnly
    @private
  */
  thumbPosition: function() {
    var value = this.get('displayValue'),
        max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), position;
        
    position = (value/max)*(trackLength-thumbLength);
    position += capLength - capOverlap; // account for the top/left cap

    return Math.floor(isNaN(position) ? 0 : position);
  }.property('displayValue', 'maximum', 'trackLength', 'thumbLength').cacheable(),

  /**
    YES if the maximum value exceeds the frame size of the scroller.  This
    will hide the thumb and buttons.

    @property {Boolean}
    @isReadOnly
    @private
  */
  controlsHidden: function() {
    return this.get('proportion') >= 1;
  }.property('proportion').cacheable(),

  // ..........................................................
  // MOUSE EVENTS
  //
  
  /**
    Returns the value for a position within the scroller's frame.
    
    @private
  */
  valueForPosition: function(pos) {
    var max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), value; 
    
    value = pos - (capLength - capOverlap);
    value = value / (trackLength - thumbLength);
    value = value * max;
    return value;
  },

  /**
    Handles mouse down events and adjusts the value property depending where
    the user clicked.

    If the control is disabled, we ignore all mouse input.

    If the user clicks the thumb, we note the position of the mouse event but
    do not take further action until they begin to drag.

    If the user clicks the track, we adjust the value a page at a time, unless
    alt is pressed, in which case we scroll to that position.

    If the user clicks the buttons, we adjust the value by a fixed amount, unless
    alt is pressed, in which case we adjust by a page.

    If the user clicks and holds on either the track or buttons, those actions
    are repeated until they release the mouse button.

    @param evt {SC.Event} the mousedown event
    @private
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO;
    
    // keep note of altIsDown for later.
    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;

    var target = evt.target,
        thumbPosition = this.get('thumbPosition'),
        value, clickLocation, clickOffset,
        scrollerLength = this.get('scrollerLength');
        
    // Determine the subcontrol that was clicked
    if (target.className.indexOf('thumb') >= 0) {
      // Convert the mouseDown coordinates to the view's coordinates
      clickLocation = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });

      clickLocation.x -= thumbPosition;
      clickLocation.y -= thumbPosition;

      // Store the starting state so we know how much to adjust the
      // thumb when the user drags
      this._thumbDragging = YES;
      this._thumbOffset = clickLocation;
      this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
      this._thumbPositionAtDragStart = this.get('thumbPosition');
      this._valueAtDragStart = this.get("value");
    } else if (target.className.indexOf('button-top') >= 0) {
      // User clicked the up/left button
      // Decrement the value by a fixed amount or page size
      this.decrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-top');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollUp');
      this._isScrollingUp = YES;
    } else if (target.className.indexOf('button-bottom') >= 0) {
      // User clicked the down/right button
      // Increment the value by a fixed amount
      this.incrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-bottom');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollDown');
      this._isScrollingDown = YES;
    } else {
      // User clicked in the track
      var scrollToClick = this.get("shouldScrollToClick");
      if (evt.altKey) scrollToClick = !scrollToClick;
      
      var trackLength = this.get('trackLength'),
          thumbLength = this.get('thumbLength'),
          frame = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY }),
          mousePosition;

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          this._mouseDownLocation = mousePosition = frame.y;
          break;
        case SC.LAYOUT_HORIZONTAL:
          this._mouseDownLocation = mousePosition = frame.x;
          break;
      }
      
      if (scrollToClick) {
        this.set('value', this.valueForPosition(mousePosition - (thumbLength / 2)));
        
        // and start a normal mouse down
        thumbPosition = this.get('thumbPosition');
        
        this._thumbDragging = YES;
        this._thumbOffset = {x: frame.x - thumbPosition, y: frame.y - thumbPosition };
        this._mouseDownLocation = {x:evt.pageX, y:evt.pageY};
        this._thumbPositionAtDragStart = thumbPosition;
        this._valueAtDragStart = this.get("value");
      } else {
        // Move the thumb up or down a page depending on whether the click
        // was above or below the thumb
        if (mousePosition < thumbPosition) {
          this.decrementProperty('value',scrollerLength);
          this.startMouseDownTimer('page');
        } else {
          this.incrementProperty('value', scrollerLength);
          this.startMouseDownTimer('page');
        }
      }
      
    }

    return YES;
  },

  /**
    When the user releases the mouse button, remove any active
    state from the button controls, and cancel any outstanding
    timers.

    @param evt {SC.Event} the mousedown event
    @private
  */
  mouseUp: function(evt) {
    var active = this._scs_buttonActive, ret = NO, timer;

    // If we have an element that was set as active in mouseDown,
    // remove its active state
    if (active) {
      active.removeClass('active');
      ret = YES;
    }

    // Stop firing repeating events after mouseup
    timer = this._mouseDownTimer;
    if (timer) {
      timer.invalidate();
      this._mouseDownTimer = null;
    }

    this._thumbDragging = NO;
    this._isScrollingDown = NO;
    this._isScrollingUp = NO;

    return ret;
  },

  /**
    If the user began the drag on the thumb, we calculate the difference
    between the mouse position at click and where it is now.  We then
    offset the thumb by that amount, within the bounds of the track.
    
    If the user began scrolling up/down using the buttons, this will track
    what component they are currently over, changing the scroll direction.

    @param evt {SC.Event} the mousedragged event
    @private
  */
  mouseDragged: function(evt) {
    var value, length, delta, thumbPosition,
        target = evt.target,
        thumbPositionAtDragStart = this._thumbPositionAtDragStart,
        isScrollingUp = this._isScrollingUp,
        isScrollingDown = this._isScrollingDown,
        active = this._scs_buttonActive,
        timer;

    // Only move the thumb if the user clicked on the thumb during mouseDown
    if (this._thumbDragging) {
      
      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          delta = (evt.pageY - this._mouseDownLocation.y);
          break;
        case SC.LAYOUT_HORIZONTAL:
          delta = (evt.pageX - this._mouseDownLocation.x);
          break;
      }
      
      // if we are in alt now, but were not before, update the old thumb position to the new one
      if (evt.altKey) {
        if (!this._altIsDown || (this._shiftIsDown !== evt.shiftKey)) {
          thumbPositionAtDragStart = this._thumbPositionAtDragStart = thumbPositionAtDragStart+delta;
          delta = 0;
          this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
          this._valueAtDragStart = this.get("value");
        }
        
        // because I feel like it. Probably almost no one will find this tiny, buried feature.
        // Too bad.
        if (evt.shiftKey) delta = -delta;
        
        this.set('value', Math.round(this._valueAtDragStart + delta * 2));
      } else {
        thumbPosition = thumbPositionAtDragStart + delta;
        length = this.get('trackLength') - this.get('thumbLength');
        this.set('value', Math.round( (thumbPosition/length) * this.get('maximum')));
      }
    
    } else if (isScrollingUp || isScrollingDown) {
      var nowScrollingUp = NO, nowScrollingDown = NO;
      
      var topButtonRect = this.$('.button-top')[0].getBoundingClientRect();
      var bottomButtonRect = this.$('.button-bottom')[0].getBoundingClientRect();
      
      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          if (evt.pageY < topButtonRect.bottom) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
        case SC.LAYOUT_HORIZONTAL:
          if (evt.pageX < topButtonRect.right) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
      }
      
      if ((nowScrollingUp || nowScrollingDown) && nowScrollingUp !== isScrollingUp){
        //
        // STOP OLD
        //
        
        // If we have an element that was set as active in mouseDown,
        // remove its active state
        if (active) {
         active.removeClass('active');
        }

        // Stop firing repeating events after mouseup
        this._mouseDownTimerAction = nowScrollingUp ? "scrollUp" : "scrollDown";
        
        if (nowScrollingUp) {
          this.makeButtonActive('.button-top');
        } else if (nowScrollingDown) {
          this.makeButtonActive('.button-bottom');
        }
        
         this._isScrollingUp = nowScrollingUp;
         this._isScrollingDown = nowScrollingDown;
      }
    }
    
    
    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;
    return YES;
  },

  /**
    Starts a timer that fires after 300ms.  This is called when the user
    clicks a button or inside the track to move a page at a time. If they
    continue holding the mouse button down, we want to repeat that action
    after a small delay.  This timer will be invalidated in mouseUp.
    
    Specify "immediate" as YES if it should not wait.

    @private
  */
  startMouseDownTimer: function(action, immediate) {
    var timer;

    this._mouseDownTimerAction = action;
    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: immediate ? 0 : 300
    });
  },

  /**
    Called by the mousedown timer.  This method determines the initial
    user action and repeats it until the timer is invalidated in mouseUp.

    @private
  */
  mouseDownTimerDidFire: function() {
    var scrollerLength = this.get('scrollerLength'),
        mouseLocation = SC.device.get('mouseLocation'),
        thumbPosition = this.get('thumbPosition'),
        thumbLength = this.get('thumbLength'),
        timerInterval = 50;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        mouseLocation = this.convertFrameFromView(mouseLocation).y;
        break;
      case SC.LAYOUT_HORIZONTAL:
        mouseLocation = this.convertFrameFromView(mouseLocation).x;
        break;
    }

    switch (this._mouseDownTimerAction) {
      case 'scrollDown':
        this.incrementProperty('value', this._altIsDown ? scrollerLength : 30);
        break;
      case 'scrollUp':
        this.decrementProperty('value', this._altIsDown ? scrollerLength : 30);
        break;
      case 'page':
        timerInterval = 150;
        if (mouseLocation < thumbPosition) {
          this.decrementProperty('value', scrollerLength);
        } else if (mouseLocation > thumbPosition+thumbLength) {
          this.incrementProperty('value', scrollerLength);
        }
    }

    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: timerInterval
    });
  },

  /**
    Given a selector, finds the corresponding DOM element and adds
    the 'active' class name.  Also stores the returned element so that
    the 'active' class name can be removed during mouseup.

    @param {String} the selector to find
    @private
  */
  makeButtonActive: function(selector) {
    this._scs_buttonActive = this.$(selector).addClass('active');
  }
});

// TO BE EVENTUALLY REPLACED W/RENDERERS FROM QUILMES
SC.TouchScrollerView = SC.ScrollerView.extend({
  classNames: ['sc-touch-scroller-view'],
  scrollbarThickness: 12,
  capLength: 5,
  capOverlap: 0,
  hasButtons: NO,
  buttonOverlap: 36,
  
  adjustThumb: function(thumb, position, length) {
    var thumbInner = this.$('.thumb-inner');
    var max = this.get("scrollerLength") - this.capLength, min = this.get("minimum") + this.capLength;
    
    if (position + length > max) {
      position = Math.min(max - 20, position);
      length = max - position;
    }
    
    if (position < min) {
      length -= min - position;
      position = min;
    }
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(0px,' + position + 'px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(0px,' + Math.round(length - 1044) + 'px,0px)');
        }
        break;
      case SC.LAYOUT_HORIZONTAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(' + position + 'px,0px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(' + Math.round(length - 1044) + 'px,0px,0px)');
        }
        break;
    }

    this._thumbPosition = position;
    this._thumbSize = length;
  },
  
  render: function(context, firstTime) {
    var classNames = [],
        buttons = '',
        thumbPosition, thumbLength, thumbCenterLength, thumbElement,
        value, max, scrollerLength, length, pct;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        classNames.push('sc-vertical');
        break;
      case SC.LAYOUT_HORIZONTAL:
        classNames.push('sc-horizontal');
        break;
    }

    // The appearance of the scroller changes if disabled
    if (!this.get('isEnabled')) classNames.push('disabled');
    // Whether to hide the thumb and buttons
    if (this.get('controlsHidden')) classNames.push('controls-hidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.addClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      if (this.get('hasButtons')) {
        buttons = '<div class="button-bottom"></div><div class="button-top"></div>';
      } else {
        buttons = '<div class="endcap"></div>';
      }

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateY('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
        break;
        case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateX('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
      }
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  }
  
});

/* >>>>>>>>>> BEGIN source/views/scroll.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroller');
sc_require('mixins/border');

SC.NORMAL_SCROLL_DECELERATION = 0.95;
SC.FAST_SCROLL_DECELERATION = 0.85;

/** @class

  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.
  
  Important Events:
  
  - contentView frame size changes (to autoshow/hide scrollbar - adjust scrollbar size)
  - horizontalScrollOffset change
  - verticalScrollOffsetChanges
  - scroll wheel events
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend(SC.Border, {
  /** @scope SC.ScrollView.prototype */
  classNames: ['sc-scroll-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  isScrollable: YES,
  
  /** 
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.
  */
  contentView: null,
  
  /**
    The horizontal alignment for non-filling content inside of the ScrollView.
  */
  horizontalAlign: SC.ALIGN_LEFT,
  
  /**
    The vertical alignment for non-filling content inside of the ScrollView.
  */
  verticalAlign: SC.ALIGN_TOP,

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the horizontal scroller, if there is one.
  */
  horizontalScrollOffset: function(key, value) {
    if (value !== undefined) {
      var minOffset = this.minimumHorizontalScrollOffset(),
          maxOffset = this.get('maximumHorizontalScrollOffset');
      this._scroll_horizontalScrollOffset = Math.max(minOffset,Math.min(maxOffset, value)) ;
    }

    return this._scroll_horizontalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    The current vertical scroll offset.  Changing this value will update both the contentView and the vertical scroller, if there is one.
  */
  verticalScrollOffset: function(key, value) {
    if (value !== undefined) {
      var minOffset = this.get('minimumVerticalScrollOffset'),
          maxOffset = this.get('maximumVerticalScrollOffset');
      this._scroll_verticalScrollOffset = Math.max(minOffset,Math.min(maxOffset, value)) ;
    }

    return this._scroll_verticalScrollOffset||0;
  }.property().cacheable(),
  
  /**
    @private
    Calculates the maximum offset given content and container sizes, and the
    alignment.
  */
  maximumScrollOffset: function(contentSize, containerSize, align) {
    // if our content size is larger than or the same size as the container, it's quite
    // simple to calculate the answer. Otherwise, we need to do some fancy-pants
    // alignment logic (read: simple math)
    if (contentSize >= containerSize) return contentSize - containerSize;
    
    // alignment, yeah
    if (align === SC.ALIGN_LEFT || align === SC.ALIGN_TOP) {
      // if we left-align something, and it is smaller than the view, does that not mean
      // that it's maximum (and minimum) offset is 0, because it should be positioned at 0?
      return 0;
    } else if (align === SC.ALIGN_MIDDLE || align === SC.ALIGN_CENTER) {
      // middle align means the difference divided by two, because we want equal parts on each side.
      return 0 - Math.round((containerSize - contentSize) / 2);
    } else {
      // right align means the entire difference, because we want all that space on the left
      return 0 - (containerSize - contentSize);
    }
  },
  
  /**
    @private
    Calculates the minimum offset given content and container sizes, and the
    alignment.
  */
  minimumScrollOffset: function(contentSize, containerSize, align) {
    // if the content is larger than the container, we have no need to change the minimum
    // away from the natural 0 position.
    if (contentSize > containerSize) return 0;
    
    // alignment, yeah
    if (align === SC.ALIGN_LEFT || align === SC.ALIGN_TOP) {
      // if we left-align something, and it is smaller than the view, does that not mean
      // that it's maximum (and minimum) offset is 0, because it should be positioned at 0?
      return 0;
    } else if (align === SC.ALIGN_MIDDLE || align === SC.ALIGN_CENTER) {
      // middle align means the difference divided by two, because we want equal parts on each side.
      return 0 - Math.round((containerSize - contentSize) / 2);
    } else {
      // right align means the entire difference, because we want all that space on the left
      return 0 - (containerSize - contentSize);
    }
  },
  
  /**
    The maximum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0.
    
    @property {Number}
  */
  maximumHorizontalScrollOffset: function() {
    var view = this.get('contentView'),
        contentWidth = 0, calculatedWidth = 0;
        
    if (view && view.get('frame')) contentWidth = view.get('frame').width;
    if (view) calculatedWidth = view.calculatedWidth || 0;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view && view.calculatedWidth && view.calculatedWidth!==0){
      contentWidth = view.calculatedWidth; 
    }
    contentWidth *= this._scale;
    
    var containerWidth = this.get('containerView').get('frame').width ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this.maximumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),
  
  /**
    The maximum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  maximumVerticalScrollOffset: function() {
    var view = this.get('contentView'),
        contentHeight = 0, calculatedHeight = 0;
        
    if (view && view.get('frame')) contentHeight = view.get('frame').height;
    if (view) calculatedHeight = view.calculatedHeight || 0;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view && view.calculatedHeight && view.calculatedHeight!==0){
      contentHeight = view.calculatedHeight; 
    }
    contentHeight *= this._scale;
    
    var containerHeight = this.get('containerView').get('frame').height ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this.maximumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),
  
  
  /**
    The minimum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  minimumHorizontalScrollOffset: function() {
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view && view.calculatedWidth && view.calculatedWidth!==0){
      contentWidth = view.calculatedWidth; 
    }
    contentWidth *= this._scale;
    
    var containerWidth = this.get('containerView').get('frame').width ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollHorizontal')) contentWidth = Math.min(contentWidth, containerWidth);
    return this.minimumScrollOffset(contentWidth, containerWidth, this.get("horizontalAlign"));
  }.property(),
  
  /**
    The minimum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0 (or whatever alignment dictates).
    
    @property {Number}
  */
  minimumVerticalScrollOffset: function() {
    var view = this.get('contentView') ;
    var contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view && view.calculatedHeight && view.calculatedHeight!==0){
      contentHeight = view.calculatedHeight; 
    }
    contentHeight *= this._scale;
    
    var containerHeight = this.get('containerView').get('frame').height ;
    
    // we still must go through minimumScrollOffset even if we can't scroll
    // because we need to adjust for alignment. So, just make sure it won't allow scrolling.
    if (!this.get('canScrollVertical')) contentHeight = Math.min(contentHeight, containerHeight);
    return this.minimumScrollOffset(contentHeight, containerHeight, this.get("verticalAlign"));
  }.property(),
  
  
  
  /** 
    Amount to scroll one vertical line.
  
    Used by the default implementation of scrollDownLine() and scrollUpLine().  
    Defaults to 20px.
  */
  verticalLineScroll: 20,
  
  /**
    Amount to scroll one horizontal line.
  
    Used by the default implementation of scrollLeftLine() and 
    scrollRightLine(). Defaults to 20px.
  */
  horizontalLineScroll: 20,
  
  /**
    Amount to scroll one vertical page.
    
    Used by the default implementation of scrollUpPage() and scrollDownPage(). 
    Defaults to current frame height.
  */
  verticalPageScroll: function() {
    return this.get('frame').height ;
  }.property('frame'),
  
  /**
    Amount to scroll one horizontal page.
    
    Used by the default implementation of scrollLeftPage() and 
    scrollRightPage().  Defaults to current innerFrame width.
  */
  horizontalPageScroll: function() {
    return this.get('frame').width ;  
  }.property('frame'),
    
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view should maintain a horizontal scroller.   This property 
    must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: YES,
  
  /**
    The horizontal scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasHorizontalScroller is 
    NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.ScrollerView,
  
  /**
    The horizontal scroller view for touch. This will be replaced with a view
    instance when touch is enabled when the ScrollView is created unless 
    hasHorizontalScroller is NO.
  */
  horizontalTouchScrollerView: SC.TouchScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this 
    property value anytime to show or hide the horizontal scroller.  If you 
    do not want to use a horizontal scroller at all, you should instead set 
    hasHorizontalScroller to NO to avoid creating a scroller view in the 
    first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollHorizontal: function() {
    return !!(this.get('hasHorizontalScroller') && 
      this.get('horizontalScrollerView') && 
      this.get('isHorizontalScrollerVisible')) ;
  }.property('isHorizontalScrollerVisible').cacheable(),
  
  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES 
    for this property to have any effect.  
  */
  autohidesHorizontalScroller: YES,
  
  /** 
    YES if the view shuld maintain a vertical scroller.   This property must 
    be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.ScrollerView,
  
  /**
    The vertical touch scroller view class. This will be replaced with a view
    instance when the ScrollView is created.
  */
  verticalTouchScrollerView: SC.TouchScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  You can change this 
    property value anytime to show or hide the vertical scroller.  If you do 
    not want to use a vertical scroller at all, you should instead set 
    hasVerticalScroller to NO to avoid creating a scroller view in the first 
    place.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollVertical: function() {
    return !!(this.get('hasVerticalScroller') && 
      this.get('verticalScrollerView') && 
      this.get('isVerticalScrollerVisible')) ;
  }.property('isVerticalScrollerVisible').cacheable(),

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES 
    for this property to have any effect.  
  */
  autohidesVerticalScroller: YES,
  
  /**
    Use this property to set the 'bottom' offset of your vertical scroller, 
    to make room for a thumb view or other accessory view. Default is 0.
    
    @property {Number}
  */
  verticalScrollerBottom: 0,
  
  /**
    Use this to overlay the vertical scroller.
    
    This ensures that the container frame will not resize to accomodate the
    vertical scroller, hence overlaying the scroller on top of 
    the container.
  
    @property {Boolean}
  */
  verticalOverlay: function() {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),
  
  /**
    Use this to overlay the horizontal scroller.
    
    This ensures that the container frame will not resize to accomodate the
    horizontal scroller, hence overlaying the scroller on top of 
    the container
    
    @property {Boolean}
  */
  horizontalOverlay: function() {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),
  
  /**
    Use to control the positioning of the vertical scroller.  If you do not
    set 'verticalOverlay' to YES, then the content view will be automatically
    sized to meet the left edge of the vertical scroller, wherever it may be.
    This allows you to easily, for example, have “one pixel higher and one
    pixel lower” scroll bars that blend into their parent views.
    
    If you do set 'verticalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { top: -1, bottom: -1, right: 0 }
  */
  verticalScrollerLayout: null,
  
  /**
    Use to control the positioning of the horizontal scroller.  If you do not
    set 'horizontalOverlay' to YES, then the content view will be
    automatically sized to meet the top edge of the horizontal scroller,
    wherever it may be.
    
    If you do set 'horizontalOverlay' to YES, then the scroller view will
    “float on top” of the content view.
    
    Example: { left: 0, bottom: 0, right: 0 }
  */
  horizontalScrollerLayout: null,
  
  // ..........................................................
  // CUSTOM VIEWS
  // 
  
  /**
    The container view that will contain your main content view.  You can 
    replace this property with your own custom subclass if you prefer.
    
    @type {SC.ContainerView}
  */
  containerView: SC.ContainerView.extend({

  }),
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Scrolls the receiver to the specified x,y coordinate.  This should be the
    offset into the contentView you want to appear at the top-left corner of
    the scroll view.
    
    This method will contrain the actual scroll based on whether the view
    can scroll in the named direction and the maximum distance it can
    scroll.
    
    If you only want to scroll in one direction, pass null for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} the x scroll location
    @param y {Number} the y scroll location
    @returns {SC.ScrollView} receiver
  */
  scrollTo: function(x,y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    if (!SC.none(x)) {
      x = Math.max(this.get('minimumHorizontalScrollOffset'),Math.min(this.get('maximumHorizontalScrollOffset'), x)) ;
      this.set('horizontalScrollOffset', x) ;
    }
    
    if (!SC.none(y)) {
      y = Math.max(this.get('minimumVerticalScrollOffset'),Math.min(this.get('maximumVerticalScrollOffset'), y)) ;
      this.set('verticalScrollOffset', y) ;
    }
    
    return this ;
  },
  
  /**
    Scrolls the receiver in the horizontal and vertical directions by the 
    amount specified, if allowed.  The actual scroll amount will be 
    constrained by the current scroll view settings.
    
    If you only want to scroll in one direction, pass null or 0 for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} change in the x direction (or hash)
    @param y {Number} change in the y direction
    @returns {SC.ScrollView} receiver
  */
  scrollBy: function(x , y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    // if null, undefined, or 0, pass null; otherwise just add current offset
    x = (x) ? this.get('horizontalScrollOffset')+x : null ;
    y = (y) ? this.get('verticalScrollOffset')+y : null ;
    return this.scrollTo(x,y) ;
  },
  
  /**
    Scroll the view to make the view's frame visible.  For this to make sense,
    the view should be a subview of the contentView.  Otherwise the results
    will be undefined.
    
    @param {SC.View} view view to scroll or null to scroll receiver visible
    @returns {Boolean} YES if scroll position was changed
  */
  scrollToVisible: function(view) {
    
    // if no view is passed, do default
    if (arguments.length === 0) return arguments.callee.base.apply(this,arguments); 
    
    var contentView = this.get('contentView') ;
    if (!contentView) return NO; // nothing to do if no contentView.

    // get the frame for the view - should work even for views with static 
    // layout, assuming it has been added to the screen.
    var vf = view.get('frame');
    if (!vf) return NO; // nothing to do
    
    // convert view's frame to an offset from the contentView origin.  This
    // will become the new scroll offset after some adjustment.
    vf = contentView.convertFrameFromView(vf, view.get('parentView')) ;
    
    return this.scrollToRect(vf);
  },
  
  /**
    Scroll to the supplied rectangle.
    @param {rect} Rectangle to scroll to.
    @returns {Boolean} YES if scroll position was changed.
  */
  scrollToRect: function(rect) {
    // find current visible frame.
    var vo = SC.cloneRect(this.get('containerView').get('frame')) ;
    
    vo.x = this.get('horizontalScrollOffset') ;
    vo.y = this.get('verticalScrollOffset') ;

    var origX = vo.x, origY = vo.y;
    
    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(rect)) ;
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(rect)) ;
    
    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(rect) - SC.maxY(vo)) ;
    vo.x += Math.max(0, SC.maxX(rect) - SC.maxX(vo)) ;
    
    // scroll to that origin.
    if ((origX !== vo.x) || (origY !== vo.y)) {
      this.scrollTo(vo.x, vo.y);
      return YES ;
    } else return NO;
  },
  
  
  /**
    Scrolls the receiver down one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver up one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, 0-this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver right one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver left one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(0-this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver down one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollDownPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, this.get('verticalPageScroll')*pages) ;
  },
  
  /**
    Scrolls the receiver up one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollUpPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, 0-(this.get('verticalPageScroll')*pages)) ;
  },
  
  /**
    Scrolls the receiver right one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollRightPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(this.get('horizontalPageScroll')*pages, null) ;
  },
  
  /**
    Scrolls the receiver left one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollLeftPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(0-(this.get('horizontalPageScroll')*pages), null) ;
  },
  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    // get horizontal scroller/determine if we should have a scroller
    var hscroll = this.get('hasHorizontalScroller') ? this.get('horizontalScrollerView') : null ;
    var hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible');
    
    // get vertical scroller/determine if we should have a scroller
    var vscroll = this.get('hasVerticalScroller') ? this.get('verticalScrollerView') : null ;
    var hasVertical = vscroll && this.get('isVerticalScrollerVisible') ;
    
    // get the containerView
    var clip = this.get('containerView') ;
    var clipLayout = { left: 0, top: 0 } ;
    var t, layout, vo, ho, vl, hl;
    
    var ht = ((hasHorizontal) ? hscroll.get('scrollbarThickness') : 0) ;
    var vt = (hasVertical) ?   vscroll.get('scrollbarThickness') : 0 ;
    
    if (hasHorizontal) {
      hl     = this.get('horizontalScrollerLayout');
      layout = { 
        left: (hl ? hl.left : 0), 
        bottom: (hl ? hl.bottom : 0), 
        right: (hl ? hl.right + vt-1 : vt-1), 
        height: ht 
      };
      hscroll.set('layout', layout) ;
      ho = this.get('horizontalOverlay');
      clipLayout.bottom = ho ? 0 : (layout.bottom + ht) ;
    } else {
      clipLayout.bottom = 0 ;
    }
    if (hscroll) hscroll.set('isVisible', hasHorizontal) ;
    
    if (hasVertical) {
      ht     = ht + this.get('verticalScrollerBottom') ;
      vl     = this.get('verticalScrollerLayout');
      layout = { 
        top: (vl ? vl.top : 0), 
        bottom: (vl ? vl.bottom + ht : ht), 
        right: (vl ? vl.right : 0), 
        width: vt 
      };
      vscroll.set('layout', layout) ;
      vo = this.get('verticalOverlay');
      clipLayout.right = vo ? 0 : (layout.right + vt) ;
    } else {
      clipLayout.right = 0 ;
    }
    if (vscroll) vscroll.set('isVisible', hasVertical) ;

    clip.adjust(clipLayout) ;
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),
  
  // ..........................................................
  // SCROLL WHEEL SUPPORT
  // 
  
  /** @private */ _scroll_wheelDeltaX: 0,
  /** @private */ _scroll_wheelDeltaY: 0,
  
  // save adjustment and then invoke the actual scroll code later.  This will
  // keep the view feeling smooth.
  mouseWheel: function(evt) {
    var deltaAdjust = (SC.browser.safari && SC.browser.version > 533.0) ? 120 : 1;
    
    this._scroll_wheelDeltaX += evt.wheelDeltaX / deltaAdjust;
    this._scroll_wheelDeltaY += evt.wheelDeltaY / deltaAdjust;
    this.invokeLater(this._scroll_mouseWheel, 10) ;
    return this.get('canScrollHorizontal') || this.get('canScrollVertical') ;  
  },

  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY > 0) {
      this._scroll_wheelDeltaY = Math.floor(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.max(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else if (SC.WHEEL_MOMENTUM && this._scroll_wheelDeltaY < 0){
      this._scroll_wheelDeltaY = Math.ceil(this._scroll_wheelDeltaY*0.950);
      this._scroll_wheelDeltaY = Math.min(this._scroll_wheelDeltaY, 0);
      this.invokeLater(this._scroll_mouseWheel, 10) ;
    } else {
      this._scroll_wheelDeltaY = 0;
      this._scroll_wheelDeltaX = 0;
    }
  },
  
  /*..............................................
    SCALING SUPPORT
  */
  
  /**
    Determines whether scaling is allowed.
  */
  canScale: NO,
  
  /**
    The current scale.
  */
  _scale: 1.0,
  scale: function(key, value) {
    if (value !== undefined) {
      this._scale = Math.min(Math.max(this.get("minimumScale"), value), this.get("maximumScale"));
    }
    return this._scale;
  }.property().cacheable(),
  
  /**
    The minimum scale.
  */
  minimumScale: 0.25,
  
  /**
    The maximum scale.
  */
  maximumScale: 2.0,
  
  /**
    Whether to automatically determine the scale range based on the size of the content.
  */
  autoScaleRange: NO,
  
  _scale_css: "",
  
  updateScale: function(scale) {
    var contentView = this.get("contentView");
    if (!contentView) return;
    
    if (contentView.isScalable) {
      this.get("contentView").applyScale(scale);
      this._scale_css = "";
    } else {
      this._scale_css = "scale3d(" + scale + ", " + scale + ", 1)";
    }
  },
  
  /*..............................................
    TOUCH SUPPORT
  */
  acceptsMultitouch: YES,
  
  /**
    The scroll deceleration rate.
  */
  decelerationRate: SC.NORMAL_SCROLL_DECELERATION,
  
  /**
    If YES, bouncing will always be enabled in the horizontal direction, even if the content
    is smaller or the same size as the view. NO by default.
  */
  alwaysBounceHorizontal: NO,
  
  /**
    If NO, bouncing will not be enabled in the vertical direction when the content is smaller
    or the same size as the scroll view. YES by default.
  */
  alwaysBounceVertical: YES,
  
  /**
    Whether to delay touches from passing through to the content.
  */
  delaysContentTouches: YES,
  
  /**
    @private
    If the view supports it, this 
  */
  _touchScrollDidChange: function() {
    if (this.get("contentView").touchScrollDidChange) {
      this.get("contentView").touchScrollDidChange(
        this._scroll_horizontalScrollOffset,
        this._scroll_verticalScrollOffset
      );
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidChange) {
      this.verticalScrollerView.touchScrollDidChange(this._scroll_verticalScrollOffset);
    }
    
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidChange) {
      this.horizontalScrollerView.touchScrollDidChange(this._scroll_horizontalScrollOffset);
    }
  },
  
  _touchScrollDidStart: function() {
    if (this.get("contentView").touchScrollDidStart) {
      this.get("contentView").touchScrollDidStart(this._scroll_horizontalScrollOffset, this._scroll_verticalScrollOffset);
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidStart) {
      this.verticalScrollerView.touchScrollDidStart(this._touch_verticalScrollOffset);
    }
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidStart) {
      this.horizontalScrollerView.touchScrollDidStart(this._touch_horizontalScrollOffset);
    }
  },
  
  _touchScrollDidEnd: function() {
    if (this.get("contentView").touchScrollDidEnd) {
      this.get("contentView").touchScrollDidEnd(this._scroll_horizontalScrollOffset, this._scroll_verticalScrollOffset);
    }
    
    // tell scrollers
    if (this.verticalScrollerView && this.verticalScrollerView.touchScrollDidEnd) {
      this.verticalScrollerView.touchScrollDidEnd(this._touch_verticalScrollOffset);
    }
    
    if (this.horizontalScrollerView && this.horizontalScrollerView.touchScrollDidEnd) {
      this.horizontalScrollerView.touchScrollDidEnd(this._touch_horizontalScrollOffset);
    }
  },
  
  _applyCSSTransforms: function(layer) {
    var transform = "";
    this.updateScale(this._scale);
    transform += 'translate3d('+ -this._scroll_horizontalScrollOffset +'px, '+ -Math.round(this._scroll_verticalScrollOffset)+'px,0) ';
    transform += this._scale_css;
    layer.style.webkitTransform = transform;
    layer.style.webkitTransformOrigin = "top left";
  },
  
  captureTouch: function(touch) {
    return YES;
  },
  
  touchGeneration: 0,
  touchStart: function(touch) {
    var generation = ++this.touchGeneration;
    if (!this.tracking && this.get("delaysContentTouches")) {
      this.invokeLater(this.beginTouchesInContent, 150, generation);
    } else if (!this.tracking) {
      // NOTE: We still have to delay because we don't want to call touchStart
      // while touchStart is itself being called...
      this.invokeLater(this.beginTouchesInContent, 1, generation);
    }
    this.beginTouchTracking(touch, YES);
    return YES;
  },

  beginTouchesInContent: function(gen) {
    if (gen !== this.touchGeneration) return;
    
    var touch = this.touch, itemView;
    if (touch && this.tracking && !this.dragging && !touch.touch.scrollHasEnded) {
      // try to capture the touch
      touch.touch.captureTouch(this, YES);
      
      if (!touch.touch.touchResponder) {
        // if it DIDN'T WORK!!!!!
        // then we need to take possession again.
        touch.touch.makeTouchResponder(this);
      } else {
        // Otherwise, it did work, and if we had a pending scroll end, we must do it now
        if (touch.needsScrollEnd) {
          this._touchScrollDidEnd();
        }
      }
    }
  },

  /**
    Initializes the start state of the gesture.

    We keep information about the initial location of the touch so we can
    disambiguate between a tap and a drag.

    @param {Event} evt
  */
  beginTouchTracking: function(touch, starting) {
    var avg = touch.averagedTouchesForView(this, starting);
    
    var verticalScrollOffset = this._scroll_verticalScrollOffset || 0,
        horizontalScrollOffset = this._scroll_horizontalScrollOffset || 0,
        startClipOffsetX = horizontalScrollOffset,
        startClipOffsetY = verticalScrollOffset,
        needsScrollEnd = NO;
    
    if (this.touch && this.touch.timeout) {
      // clear the timeout
      clearTimeout(this.touch.timeout);
      this.touch.timeout = null;
      
      // get the scroll offsets
      startClipOffsetX = this.touch.startClipOffset.x;
      startClipOffsetY = this.touch.startClipOffset.y;
      needsScrollEnd = YES;
    }
    
    // calculate container+content width/height
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0,
        contentHeight = view ? view.get('frame').height : 0;
    
    if(view.calculatedWidth && view.calculatedWidth!==0) contentWidth = view.calculatedWidth;
    if (view.calculatedHeight && view.calculatedHeight !==0) contentHeight = view.calculatedHeight;
    
    var containerWidth = this.get('containerView').get('frame').width,
        containerHeight = this.get('containerView').get('frame').height;
    

    // calculate position in content
    var globalFrame = this.convertFrameToView(this.get("frame"), null),
        positionInContentX = (horizontalScrollOffset + (avg.x - globalFrame.x)) / this._scale,
        positionInContentY = (verticalScrollOffset + (avg.y - globalFrame.y)) / this._scale;
    
    this.touch = {
      startTime: touch.timeStamp,
      notCalculated: YES,
      
      enableScrolling: { 
        x: contentWidth * this._scale > containerWidth || this.get("alwaysBounceHorizontal"), 
        y: contentHeight * this._scale > containerHeight || this.get("alwaysBounceVertical") }, // TODO: get from class properties
      scrolling: { x: NO, y: NO },
      
      // offsets and velocities
      startClipOffset: { x: startClipOffsetX, y: startClipOffsetY },
      lastScrollOffset: { x: horizontalScrollOffset, y: verticalScrollOffset },
      startTouchOffset: { x: avg.x, y: avg.y },
      scrollVelocity: { x: 0, y: 0 },
      
      startTouchOffsetInContent: { x: positionInContentX, y: positionInContentY },
      
      containerSize: { width: containerWidth, height: containerHeight },
      contentSize: { width: contentWidth, height: contentHeight },
      
      startScale: this._scale,
      startDistance: avg.d,
      canScale: this.get("canScale"),
      minimumScale: this.get("minimumScale"),
      maximumScale: this.get("maximumScale"),
      
      globalFrame: globalFrame,
      
      // cache some things
      layer: this.get("contentView").get('layer'),

      // some constants
      resistanceCoefficient: 0.998,
      resistanceAsymptote: 320,
      decelerationFromEdge: 0.05,
      accelerationToEdge: 0.1,
      
      // how much percent of the other drag direction you must drag to start dragging that direction too.
      scrollTolerance: { x: 15, y: 15 },
      scaleTolerance: 5,
      secondaryScrollTolerance: 30,
      scrollLock: 500,
      
      decelerationRate: this.get("decelerationRate"),

      // general status
      lastEventTime: touch.timeStamp,      
      
      // the touch used
      touch: (starting ? touch : (this.touch ? this.touch.touch : null)),
      
      // needsScrollEnd will cause a scrollDidEnd even if this particular touch does not start a scroll.
      // the reason for this is because we don't want to say we've stopped scrolling just because we got
      // another touch, but simultaneously, we still need to send a touch end eventually.
      // there are two cases in which this will be used:
      // 
      //    1. If the touch was sent to content touches (in which case we will not be scrolling)
      //    2. If the touch ends before scrolling starts (no scrolling then, either)
      needsScrollEnd: needsScrollEnd
    };

    if (!this.tracking) {
      this.tracking = YES;
      this.dragging = NO;
    }
  },
  
  _adjustForEdgeResistance: function(offset, minOffset, maxOffset, resistanceCoefficient, asymptote) {
    var distanceFromEdge;
    
    // find distance from edge
    if (offset < minOffset) distanceFromEdge = offset - minOffset;
    else if (offset > maxOffset) distanceFromEdge = maxOffset - offset;
    else return offset;
    
    // manipulate logarithmically
    distanceFromEdge = Math.pow(resistanceCoefficient, Math.abs(distanceFromEdge)) * asymptote;
    
    // adjust mathematically
    if (offset < minOffset) distanceFromEdge = distanceFromEdge - asymptote;
    else distanceFromEdge = -distanceFromEdge + asymptote;
    
    // generate final value
    return Math.min(Math.max(minOffset, offset), maxOffset) + distanceFromEdge;
  },
  
  touchesDragged: function(evt, touches) {
    var avg = evt.averagedTouchesForView(this);
    this.updateTouchScroll(avg.x, avg.y, avg.d, evt.timeStamp);
  },
  
  updateTouchScroll: function(touchX, touchY, distance, timeStamp) {
    // get some vars
    var touch = this.touch,
        touchXInFrame = touchX - touch.globalFrame.x,
        touchYInFrame = touchY - touch.globalFrame.y,
        offsetY,
        maxOffsetY,
        offsetX,
        maxOffsetX,
        minOffsetX, minOffsetY;
        
    // calculate new position in content
    var positionInContentX = ((this._scroll_horizontalScrollOffset||0) + touchXInFrame) / this._scale,
        positionInContentY = ((this._scroll_verticalScrollOffset||0) + touchYInFrame) / this._scale;
    
    // calculate deltas
    var deltaX = positionInContentX - touch.startTouchOffset.x,
        deltaY = positionInContentY - touch.startTouchOffset.y;
    
    var isDragging = touch.dragging;
    if (!touch.scrolling.x && Math.abs(deltaX) > touch.scrollTolerance.x && touch.enableScrolling.x) {
      // say we are scrolling
      isDragging = YES;
      touch.scrolling.x = YES;
      touch.scrollTolerance.y = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.x = touchX;
      deltaX = 0;
    }
    if (!touch.scrolling.y && Math.abs(deltaY) > touch.scrollTolerance.y && touch.enableScrolling.y) {
      // say we are scrolling
      isDragging = YES;
      touch.scrolling.y = YES;
      touch.scrollTolerance.x = touch.secondaryScrollTolerance;
      
      // reset position
      touch.startTouchOffset.y = touchY;
      deltaY = 0;
    }
    
    // handle scroll start
    if (isDragging && !touch.dragging) {
      touch.dragging = YES;
      this.dragging = YES;
      this._touchScrollDidStart();
    }
    
    // calculate new offset
    if (!touch.scrolling.x && !touch.scrolling.y && !touch.canScale) return;
    if (touch.scrolling.x && !touch.scrolling.y) {
      if (deltaX > touch.scrollLock && !touch.scrolling.y) touch.enableScrolling.y = NO;
    }
    if (touch.scrolling.y && !touch.scrolling.x) {
      if (deltaY > touch.scrollLock && !touch.scrolling.x) touch.enableScrolling.x = NO;
    }
    
    // handle scaling
    if (touch.canScale) {
      
      var startDistance = touch.startDistance, dd = distance - startDistance;
      if (Math.abs(dd) > touch.scaleTolerance) {
        touch.scrolling.y = YES; // if you scale, you can scroll.
        touch.scrolling.x = YES;
        
        // we want to say something that was the startDistance away from each other should now be
        // distance away. So, if we are twice as far away as we started...
        var scale = touch.startScale * (distance / Math.max(startDistance, 50));

        var newScale = this._adjustForEdgeResistance(scale, touch.minimumScale, touch.maximumScale, touch.resistanceCoefficient, touch.resistanceAsymptote);
        this.dragging = YES;
        this._scale = newScale;
        var newPositionInContentX = positionInContentX * this._scale,
            newPositionInContentY = positionInContentY * this._scale;
      }
    }
    

    minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    // (offsetY + touchYInFrame) / this._scale = touch.startTouchOffsetInContent.y
    // offsetY + touchYInFrame = touch.startTouchOffsetInContent.y * this._scale;
    // offsetY = touch.startTouchOffset * this._scale - touchYInFrame
    offsetX = touch.startTouchOffsetInContent.x * this._scale - touchXInFrame;
    offsetY = touch.startTouchOffsetInContent.y * this._scale - touchYInFrame;
    
    
    // update immediately, without consulting anyone else.
    offsetX = this._adjustForEdgeResistance(offsetX, minOffsetX, maxOffsetX, touch.resistanceCoefficient, touch.resistanceAsymptote);
    offsetY = this._adjustForEdgeResistance(offsetY, minOffsetY, maxOffsetY, touch.resistanceCoefficient, touch.resistanceAsymptote);
    
    if (touch.scrolling.x) this._scroll_horizontalScrollOffset = offsetX;
    if (touch.scrolling.y) this._scroll_verticalScrollOffset = offsetY;
    
    this._applyCSSTransforms(touch.layer);
    this._touchScrollDidChange();
    
    if (timeStamp - touch.lastEventTime >= 1 || touch.notCalculated) {
      touch.notCalculated = NO;
      var horizontalOffset = this._scroll_horizontalScrollOffset;
      var verticalOffset = this._scroll_verticalScrollOffset;
      
      touch.scrollVelocity.x = ((horizontalOffset - touch.lastScrollOffset.x) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.scrollVelocity.y = ((verticalOffset - touch.lastScrollOffset.y) / Math.max(1, timeStamp - touch.lastEventTime)); // in px per ms
      touch.lastScrollOffset.x = horizontalOffset;
      touch.lastScrollOffset.y = verticalOffset;
      touch.lastEventTime = timeStamp;
    }
  },

  touchEnd: function(touch) {
    var touchStatus = this.touch,
        avg = touch.averagedTouchesForView(this);
    
    touch.scrollHasEnded = YES;
    if (avg.touchCount > 0) {
      this.beginTouchTracking(touch, NO);
    } else {
      if (this.dragging) {
        touchStatus.dragging = NO;

        // reset last event time
        touchStatus.lastEventTime = touch.timeStamp;

        this.startDecelerationAnimation();
      } else {
        // well. The scrolling stopped. Let us tell everyone if there was a pending one that this non-drag op interrupted.
        if (touchStatus.needsScrollEnd) this._touchScrollDidEnd();
        
        // this part looks weird, but it is actually quite simple.
        // First, we send the touch off for capture+starting again, but telling it to return to us
        // if nothing is found or if it is released.
        touch.captureTouch(this, YES);
        
        // if we went anywhere, did anything, etc., call end()
        if (touch.touchResponder && touch.touchResponder !== this) {
          touch.end();
        } else if (!touch.touchResponder || touch.touchResponder === this) {
          // if it was released to us or stayed with us the whole time, or is for some
          // wacky reason empty (in which case it is ours still). If so, and there is a next responder,
          // relay to that.
          
          if (touch.nextTouchResponder) touch.makeTouchResponder(touch.nextTouchResponder);
        } else {
          // in this case, the view that captured it and changed responder should have handled
          // everything for us.
        }
        
        this.touch = null;
      }
      
      this.tracking = NO;
      this.dragging = NO;
    }
  },
  
  touchCancelled: function(touch) {
    var touchStatus = this.touch,
        avg = touch.averagedTouchesForView(this);
    
    // if we are decelerating, we don't want to stop that. That would be bad. Because there's no point.
    if (!this.touch || !this.touch.timeout) {
      this.beginPropertyChanges();
      this.set("scale", this._scale);
      this.set("verticalScrollOffset", this._scroll_verticalScrollOffset);
      this.set("horizontalScrollOffset", this._scroll_horizontalScrollOffset);
      this.endPropertyChanges();
      this.tracking = NO;
    
      if (this.dragging) {
        this._touchScrollDidEnd();
      }
    
      this.dragging = NO;
      this.touch = null;
    }
  },

  startDecelerationAnimation: function(evt) {
    var touch = this.touch;
    touch.decelerationVelocity = {
      x: touch.scrollVelocity.x * 10,
      y: touch.scrollVelocity.y * 10
    };
    
    this.decelerateAnimation();
  },
  
  /**
    @private
    Does bounce calculations, adjusting velocity.
    
    Bouncing is fun. Functions that handle it should have fun names,
    don'tcha think?
    
    P.S.: should this be named "bouncityBounce" instead?
  */
  bouncyBounce: function(velocity, value, minValue, maxValue, de, ac, additionalAcceleration) {
    // we have 4 possible paths. On a higher level, we have two leaf paths that can be applied
    // for either of two super-paths.
    //
    // The first path is if we are decelerating past an edge: in this case, this function must
    // must enhance that deceleration. In this case, our math boils down to taking the amount
    // by which we are past the edge, multiplying it by our deceleration factor, and reducing
    // velocity by that amount.
    //
    // The second path is if we are not decelerating, but are still past the edge. In this case,
    // we must start acceleration back _to_ the edge. The math here takes the distance we are from
    // the edge, multiplies by the acceleration factor, and then performs two additional things:
    // First, it speeds up the acceleration artificially  with additionalAcceleration; this will
    // make the stop feel more sudden, as it will still have this additional acceleration when it reaches
    // the edge. Second, it ensures the result does not go past the final value, so we don't end up
    // bouncing back and forth all crazy-like.
    if (value < minValue) {
      if (velocity < 0) velocity = velocity + ((minValue - value) * de);
      else {
        velocity = Math.min((minValue-value) * ac + additionalAcceleration, minValue - value - 0.01);
      }
    } else if (value > maxValue) {
      if (velocity > 0) velocity = velocity - ((value - maxValue) * de);
      else {
        velocity = -Math.min((value - maxValue) * ac + additionalAcceleration, value - maxValue - 0.01);
      }
    }
    return velocity;
  },

  decelerateAnimation: function() {
    // get a bunch of properties. They are named well, so not much explanation of what they are...
    // However, note maxOffsetX/Y takes into account the scale;
    // also, newX/Y adds in the current deceleration velocity (the deceleration velocity will
    // be changed later in this function).
    var touch = this.touch,
        scale = this._scale,
        minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign")),
        minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign")),
        maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign")),
        maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign")),
        
        now = Date.now(),
        t = Math.max(now - touch.lastEventTime, 1),
        
        newX = this._scroll_horizontalScrollOffset + touch.decelerationVelocity.x * (t/10),
        newY = this._scroll_verticalScrollOffset + touch.decelerationVelocity.y * (t/10);
    
    var de = touch.decelerationFromEdge, ac = touch.accelerationToEdge;
    
    // determine if position was okay before adjusting scale (which we do, in
    // a lovely, animated way, for the scaled out/in too far bounce-back).
    // if the position was okay, then we are going to make sure that we keep the
    // position okay when adjusting the scale.
    //
    // Position OKness, here, referring to if the position is valid (within
    // minimum and maximum scroll offsets)
    var validXPosition = newX >= minOffsetX && newX <= maxOffsetX;
    var validYPosition = newY >= minOffsetY && newY <= maxOffsetY;
    
    // We are going to change scale in a moment, but the position should stay the
    // same, if possible (unless it would be more jarring, as described above, in
    // the case of starting with a valid position and ending with an invalid one).
    //
    // Because we are changing the scale, we need to make the position scale-neutral.
    // we'll make it non-scale-neutral after applying scale.
    //
    // Question: might it be better to save the center position instead, so scaling
    // bounces back around the center of the screen?
    newX /= this._scale;
    newY /= this._scale;
    
    // scale velocity (amount to change) starts out at 0 each time, because 
    // it is calculated by how far out of bounds it is, rather than by the
    // previous such velocity.
    var sv = 0;
    
    // do said calculation; we'll use the same bouncyBounce method used for everything
    // else, but our adjustor that gives a minimum amount to change by and (which, as we'll
    // discuss, is to make the stop feel slightly more like a stop), we'll leave at 0 
    // (scale doesn't really need it as much; if you disagree, at least come up with 
    // numbers more appropriate for scale than the ones for X/Y)
    sv = this.bouncyBounce(sv, scale, touch.minimumScale, touch.maximumScale, de, ac, 0);
    
    // add the amount to scale. This is linear, rather than multiplicative. If you think
    // it should be multiplicative (or however you say that), come up with a new formula.
    this._scale = scale = scale + sv;
    
    // now we can convert newX/Y back to scale-specific coordinates...
    newX *= this._scale;
    newY *= this._scale;
    
    // It looks very weird if the content started in-bounds, but the scale animation
    // made it not be in bounds; it causes the position to animate snapping back, and,
    // well, it looks very weird. It is more proper to just make sure it stays in a valid
    // position. So, we'll determine the new maximum/minimum offsets, and then, if it was
    // originally a valid position, we'll adjust the new position to a valid position as well.
    
    
    // determine new max offset
    minOffsetX = this.minimumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    minOffsetY = this.minimumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    maxOffsetX = this.maximumScrollOffset(touch.contentSize.width * this._scale, touch.containerSize.width, this.get("horizontalAlign"));
    maxOffsetY = this.maximumScrollOffset(touch.contentSize.height * this._scale, touch.containerSize.height, this.get("verticalAlign"));
    
    // see if scaling messed up the X position (but ignore if 'tweren't right to begin with).
    if (validXPosition && (newX < minOffsetX || newX > maxOffsetX)) {
      // Correct the position
      newX = Math.max(minOffsetX, Math.min(newX, maxOffsetX));
    }
    
    // now the y
    if (validYPosition && (newY < minOffsetY || newY > maxOffsetY)) {
      // again, correct it...
      newY = Math.max(minOffsetY, Math.min(newY, maxOffsetY));
    }
    
    
    // now that we are done modifying the position, we may update the actual scroll
    this._scroll_horizontalScrollOffset = newX;
    this._scroll_verticalScrollOffset = newY;
    
    this._applyCSSTransforms(touch.layer); // <- Does what it sounds like.

    SC.RunLoop.begin();
    this._touchScrollDidChange();
    SC.RunLoop.end();
    
    // Now we have to adjust the velocities. The velocities are simple x and y numbers that
    // get added to the scroll X/Y positions each frame.
    // The default decay rate is .950 per frame. To achieve some semblance of accuracy, we
    // make it to the power of the elapsed number of frames. This is not fully accurate,
    // as this is applying the elapsed time between this frame and the previous time to
    // modify the velocity for the next frame. My mind goes blank when I try to figure out
    // a way to fix this (given that we don't want to change the velocity on the first frame),
    // and as it seems to work great as-is, I'm just leaving it.
    var decay = touch.decelerationRate;
    touch.decelerationVelocity.y *= Math.pow(decay, (t / 10));
    touch.decelerationVelocity.x *= Math.pow(decay, (t / 10));
    
    // We have a bouncyBounce method that adjusts the velocity for bounce. That is, if it is
    // out of range and still going, it will slow it down. This step is decelerationFromEdge.
    // If it is not moving (or has come to a stop from decelerating), but is still out of range, 
    // it will start it moving back into range (accelerationToEdge)
    // we supply de and ac as these properties.
    // The .3 artificially increases the acceleration by .3; this is actually to make the final
    // stop a bit more abrupt.
    touch.decelerationVelocity.x = this.bouncyBounce(touch.decelerationVelocity.x, newX, minOffsetX, maxOffsetX, de, ac, 0.3);
    touch.decelerationVelocity.y = this.bouncyBounce(touch.decelerationVelocity.y, newY, minOffsetY, maxOffsetY, de, ac, 0.3);
 
    // if we ain't got no velocity... then we must be finished, as there is no where else to go.
    // to determine our velocity, we take the absolue value, and use that; if it is less than .01, we
    // must be done. Note that we check scale's most recent velocity, calculated above using bouncyBounce,
    // as well.
    var absXVelocity = Math.abs(touch.decelerationVelocity.x);
    var absYVelocity = Math.abs(touch.decelerationVelocity.y);
    if (absYVelocity < 0.01 && absXVelocity < 0.01 && Math.abs(sv) < 0.01) {
      // we can reset the timeout, as it will no longer be required, and we don't want to re-cancel it later.
      touch.timeout = null;
      this.touch = null;
      
      // we aren't in a run loop right now (see below, where we trigger the timer)
      // so, we must start one.
      SC.RunLoop.begin();
      
      // trigger scroll end
      this._touchScrollDidEnd();
      
      // set the scale, vertical, and horizontal offsets to what they technically already are,
      // but don't know they are yet. This will finally update things like, say, the clipping frame.
      this.beginPropertyChanges();
      this.set("scale", this._scale);
      this.set("verticalScrollOffset", this._scroll_verticalScrollOffset);
      this.set("horizontalScrollOffset", this._scroll_horizontalScrollOffset);
      this.endPropertyChanges();
      
      // and now we're done, so just end the run loop and return.
      SC.RunLoop.end();
      return;
    }
    
    // We now set up the next round. We are doing this as raw as we possibly can, not touching the
    // run loop at all. This speeds up performance drastically--keep in mind, we're on comparatively
    // slow devices, here. So, we'll just make a closure, saving "this" into "self" and calling
    // 10ms later (or however long it takes). Note also that we save both the last event time
    // (so we may calculate elapsed time) and the timeout we are creating, so we may cancel it in future.
    var self = this;
    touch.lastEventTime = Date.now();
    this.touch.timeout = setTimeout(function(){
      self.decelerateAnimation();
    }, 10);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function() {
    var childViews = [] , view; 
       
    // create the containerView.  We must always have a container view. 
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;
    
    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView,
      isScrollContainer: YES
    }));
    
    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');
    
    // create a horizontal scroller view if needed...
    view = SC.platform.touch ? this.get("horizontalTouchScrollerView") : this.get("horizontalScrollerView");
    if (view) {
      if (this.get('hasHorizontalScroller')) {
        view = this.horizontalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_HORIZONTAL,
          valueBinding: '*owner.horizontalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.horizontalScrollerView = null ;
    }
    
    // create a vertical scroller view if needed...
    view = SC.platform.touch ? this.get("verticalTouchScrollerView") : this.get("verticalScrollerView");
    if (view) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_VERTICAL,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.verticalScrollerView = null ;
    }
    
    // set childViews array.
    this.childViews = childViews ;
    
    this.contentViewDidChange() ; // setup initial display...
    this.tile() ; // set up initial tiling
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call 
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView') ;
    var contentView = this._scroll_contentView ;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange) ;
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll() ;
  },
  
  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function() {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),
  
  /** @private
    Whenever the contentView is changed, we need to observe the content view's
    frame to be notified whenever it's size changes.
  */
  contentViewDidChange: function() {
    var newView = this.get('contentView'),
        oldView = this._scroll_contentView,
        frameObserver = this.contentViewFrameDidChange,
        layerObserver = this.contentViewLayerDidChange;

    if (newView !== oldView) {
      
      // stop observing old content view
      if (oldView) {
        oldView.removeObserver('frame', this, frameObserver);
        oldView.removeObserver('layer', this, layerObserver);
      }
      
      // update cache
      this._scroll_contentView = newView;
      if (newView) {
        newView.addObserver('frame', this, frameObserver);
        newView.addObserver('layer', this, layerObserver);
      }
      
      // replace container
      this.containerView.set('contentView', newView);
      
      this.contentViewFrameDidChange();
    }
  }.observes('contentView'),

  /** @private
    If we redraw after the initial render, we need to make sure that we reset
    the scrollTop/scrollLeft properties on the content view.  This ensures
    that, for example, the scroll views displays correctly when switching
    views out in a ContainerView.
  */
  render: function(context, firstTime) {
    this.invokeLast(this.adjustElementScroll);
    if (firstTime) {
      context.push('<div class="corner"></div>');
    }
    return arguments.callee.base.apply(this,arguments);
  },

  /** @private
    Invoked whenever the contentView's frame changes.  This will update the 
    scroller maxmimum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.

    @param {Boolean} force (optional)  Re-calculate everything even if the contentView’s frame didn’t change size
  */

  oldMaxHOffset: 0,
  oldMaxVOffset: 0,

  contentViewFrameDidChange: function(force) {
    var view   = this.get('contentView'), 
        f      = (view) ? view.get('frame') : null,
        scale  = this._scale,
        width  = (f) ? f.width  * scale : 0,
        height = (f) ? f.height * scale : 0,
        dim, dimWidth, dimHeight;
    
    // cache out scroll settings...
    if (!force && (width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return ;
    this._scroll_contentWidth  = width;
    this._scroll_contentHeight = height;

    dim       = this.getPath('containerView.frame');
    dimWidth  = dim.width;
    dimHeight = dim.height;
    
    if (this.get('hasHorizontalScroller') && (view = this.get('horizontalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesHorizontalScroller')) {
        this.set('isHorizontalScrollerVisible', width > dimWidth);
      }
      view.setIfChanged('maximum', width-dimWidth) ;
      view.setIfChanged('proportion', dimWidth/width);
    }
    
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView'))) {
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dimHeight);
      }
      view.setIfChanged('maximum', height-dimHeight) ;
      view.setIfChanged('proportion', dimHeight/height);
    }
    
    // If there is no vertical scroller and auto hiding is on, make
    // sure we are at the top if not already there
    if (!this.get('isVerticalScrollerVisible') && (this.get('verticalScrollOffset') !== 0) && 
       this.get('autohidesVerticalScroller')) {
      this.set('verticalScrollOffset', 0);
    }
    
    // Same thing for horizontal scrolling.
    if (!this.get('isHorizontalScrollerVisible') && (this.get('horizontalScrollOffset') !== 0) && 
       this.get('autohidesHorizontalScroller')) {
      this.set('horizontalScrollOffset', 0);
    }
    
    // This forces to recalculate the height of the frame when is at the bottom
    // of the scroll and the content dimension are smaller that the previous one
    var mxVOffSet   = this.get('maximumVerticalScrollOffset'),
        vOffSet     = this.get('verticalScrollOffset'),
        mxHOffSet   = this.get('maximumHorizontalScrollOffset'),
        hOffSet     = this.get('horizontalScrollOffset'),
        forceHeight = mxVOffSet < vOffSet,
        forceWidth  = mxHOffSet < hOffSet;
    if (forceHeight || forceWidth) {
      this.forceDimensionsRecalculation(forceWidth, forceHeight, vOffSet, hOffSet);
    }
  },

  /** @private
    If our frame changes, then we need to re-calculate the visiblility of our
    scrollers, etc.
  */
  frameDidChange: function() {
    this.contentViewFrameDidChange(YES);
  }.observes('frame'),

  /** @private
    If the layer of the content view changes, we need to readjust the
    scrollTop and scrollLeft properties on the new DOM element.
  */
  contentViewLayerDidChange: function() {
    // Invalidate these cached values, as they're no longer valid
    if (this._verticalScrollOffset !== 0) this._verticalScrollOffset = -1;
    if (this._horizontalScrollOffset !== 0) this._horizontalScrollOffset = -1;
    this.invokeLast(this.adjustElementScroll);
  },

  /** @private
    Whenever the horizontal scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_horizontalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('horizontalScrollOffset'),
  
  /** @private
    Whenever the vertical scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_verticalScrollOffsetDidChange: function() {
    this.invokeLast(this.adjustElementScroll);
  }.observes('verticalScrollOffset'),

  /** @private
    Called at the end of the run loop to actually adjust the scrollTop
    and scrollLeft properties of the container view.
  */
  adjustElementScroll: function() {
    var container = this.get('containerView'),
        content = this.get('contentView'),
        verticalScrollOffset = this.get('verticalScrollOffset'),
        horizontalScrollOffset = this.get('horizontalScrollOffset');

    // We notify the content view that its frame property has changed
    // before we actually update the scrollTop/scrollLeft properties.
    // This gives views that use incremental rendering a chance to render
    // newly-appearing elements before they come into view.
    if (content) {
      SC.RunLoop.begin();
      content._viewFrameDidChange();
      SC.RunLoop.end();

      // Use accelerated drawing if the browser supports it
      if (SC.platform.touch) {
        this._applyCSSTransforms(content.get('layer'));
      }
    }

    if (container && !SC.platform.touch) {
      container = container.$()[0];
      
      if (container) {
        if (verticalScrollOffset !== this._verticalScrollOffset) {
          container.scrollTop = verticalScrollOffset;
          this._verticalScrollOffset = verticalScrollOffset;
        }

        if (horizontalScrollOffset !== this._horizontalScrollOffset) {
          container.scrollLeft = horizontalScrollOffset;
          this._horizontalScrollOffset = horizontalScrollOffset;
        }
      }
    }
  },

  forceDimensionsRecalculation: function (forceWidth, forceHeight, vOffSet, hOffSet) {
    var oldScrollHOffset = hOffSet;
    var oldScrollVOffset = vOffSet;
    this.scrollTo(0,0);
    if(forceWidth && forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), this.get('maximumVerticalScrollOffset'));
    }
    if(forceWidth && !forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), oldScrollVOffset);
    }
    if(!forceWidth && forceHeight){
      this.scrollTo(oldScrollHOffset ,this.get('maximumVerticalScrollOffset'));
    }
  },

  _scroll_verticalScrollOffset: 0,
  _scroll_horizontalScrollOffset: 0
  
});

/* >>>>>>>>>> BEGIN source/views/menu_scroll.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroll');

/** @class

  Implements a complete scroller view for menus.  This class implements the
  arrows displayed in a menu to scroll.
  
  The main difference with SC.ScrollerView is that there is only vertical 
  scrollers. Value Syncing between SC.MenuScrollView and SC.MenuScrollerView
  is done using valueBinding.
  
  @extends SC.ScrollerView
  @since SproutCore 1.0
*/

SC.MenuScrollerView = SC.ScrollerView.extend({
  classNames: ['sc-menu-scroller-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
   Used to set the scrolling direction of the scroller.
  */
  scrollDown: NO,
  
  /** 
    The scroller offset value.  This value will adjust between the minimum
    and maximum values that you set. Default is 0.
    
    @property
  */
  value: function(key, val) {
    if (val !== undefined) {
      // Don't enforce the maximum now, because the scroll view could change
      // height and we want our content to stay put when it does.
      this._value = val ;
    } else {
      var value = this._value || 0 ; // default value is at top/left
      return Math.min(value, this.get('maximum')) ;
    }
  }.property('maximum').cacheable(),
  
  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself. It is not necessarily
    the same as the height of a scroll view's content view.
    
    When set less than the height of the scroller, the scroller is disabled.
    
    @property {Number}
  */
  maximum: 0,
  
  /**
    YES if enable scrollbar, NO to disable it.  Scrollbars will automatically 
    disable if the maximum scroll width does not exceed their capacity.
    
    @property
  */
  isEnabled: YES,
  
  /**
    Determine the layout direction.  Determines whether the scrollbar should 
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect.
    
    @property
  */
  layoutDirection: SC.LAYOUT_VERTICAL,
  
  /** 
     Amount to scroll one vertical line.
     Defaults to 20px.
  */
  verticalLineScroll: 20,

  /**
    This function overrides the default function in SC.Scroller as 
    menus only have vertical scrolling.
    
    @property {String}
  */
  ownerScrollValueKey: function() {
    return 'verticalScrollOffset' ;  
  }.property('layoutDirection').cacheable(),

  // ..........................................................
  // INTERNAL SUPPORT
  //

  init: function() {
    // Set the scrollerThickness based on controlSize
    switch (this.get('controlSize')) {
      case SC.TINY_CONTROL_SIZE:
        this.set('scrollerThickness', SC.MenuScrollerView.TINY_SCROLLER_THICKNESS);
        break;
      case SC.SMALL_CONTROL_SIZE:
        this.set('scrollerThickness', SC.MenuScrollerView.SMALL_SCROLLER_THICKNESS);
        break;
      case SC.REGULAR_CONTROL_SIZE:
        this.set('scrollerThickness', SC.MenuScrollerView.REGULAR_SCROLLER_THICKNESS);
        break;
      case SC.LARGE_CONTROL_SIZE:
        this.set('scrollerThickness', SC.MenuScrollerView.LARGE_SCROLLER_THICKNESS);
        break;
      case SC.HUGE_CONTROL_SIZE:
        this.set('scrollerThickness', SC.MenuScrollerView.HUGE_SCROLLER_THICKNESS);
        break;
    }

    return arguments.callee.base.apply(this,arguments);
  },
  
  render: function(context, firstTime) {
    context.addClass('sc-vertical') ;
    context.addClass(this.get('controlSize'));
    if (firstTime) {
      var direction = this.get('scrollDown') ? 'arrowDown' : 'arrowUp' ;
      context.push('<span class="scrollArrow '+direction+'">&nbsp;</span>') ;
    } 
    context.setClass('disabled', !this.get('isEnabled')) ;
  },
  
  didCreateLayer: function() {
    // var callback, amt, layer;
    // 
    // callback = this._sc_scroller_scrollDidChange ;
    // SC.Event.add(this.$(), 'scroll', this, callback) ;
    // 
    // // set scrollOffset first time
    // amt = this.get('value') ;
    // layer = this.get('layer') ;
    // 
    // layer.scrollTop = amt ;
  },
  
  willDestroyLayer: function() {
    var callback = this._sc_scroller_scrollDidChange ;
    SC.Event.remove(this.$(), 'scroll', this, callback) ;
  },
  
  mouseEntered: function(evt) {
    this.set('isMouseOver', YES);
    this._invokeScrollOnMouseOver();
  },
  
  mouseExited: function(evt) {
    this.set('isMouseOver', NO);
  },
  
  /** @private */
  
  /**
    This function overrides the default function in SC.Scroller. 
    SC.MenuScroller and SC.MenuScroll use valueBinding so this function is
    not neccesary.
  */
  _sc_scroller_valueDidChange: function() {
    
  }.observes('value'),
  

  // after 50msec, fire event again
  _sc_scroller_armScrollTimer: function() {
    if (!this._sc_scrollTimer) {
      SC.RunLoop.begin() ;
      var method = this._sc_scroller_scrollDidChange ;
      this._sc_scrollTimer = this.invokeLater(method, 50) ;
      SC.RunLoop.end() ;
    }
  },
  
  _sc_scroller_scrollDidChange: function() {
    var now = Date.now(), 
        last = this._sc_lastScroll, 
        layer = this.get('layer'), 
        scroll = 0 ;
    
    if (last && (now-last)<50) return this._sc_scroller_armScrollTimer() ;
    this._sc_scrollTimer = null ;
    this._sc_lastScroll = now ;
    
    SC.RunLoop.begin();
    
    if (!this.get('isEnabled')) return ; // nothing to do.
    
    this._sc_scrollValue = scroll = layer.scrollTop ;
    this.set('value', scroll) ; // will now enforce minimum and maximum
    
    SC.RunLoop.end();
  },
  
  
  /**
    Scroll the menu if it is is an up or down arrow. This is called by
    the function that simulates mouseOver.
  */
  _scrollMenu: function(){
    var val = this.get('value'), newval;
    if(this.get('scrollDown')) {
      newval = val+this.verticalLineScroll;
      if(newval<=this.get('maximum')){
        this.set('value', newval);
      }
    }
    else {
      newval = val-this.verticalLineScroll;
      if(newval>=0){
        this.set('value', newval);
      }else if(val<=this.verticalLineScroll && val>0){
        this.set('value', 0);
      }
    }
    return YES;
  },
  
  /**
    We use this function to simulate mouseOver. It checks for the flag 
    isMouseOver which is turned on when mouseEntered is called and turned off
    when mouseExited is called. 
  */
  _invokeScrollOnMouseOver: function(){
    this._scrollMenu();
    if(this.get('isMouseOver')){
      this.invokeLater(this._invokeScrollOnMouseOver, 100);
    }
  }
  
});

/**
  Default metrics for scroller size.
*/
SC.MenuScrollerView.REGULAR_SCROLLER_THICKNESS = 18;
SC.MenuScrollerView.TINY_SCROLLER_THICKNESS    = 10;
SC.MenuScrollerView.SMALL_SCROLLER_THICKNESS   = 14;
SC.MenuScrollerView.LARGE_SCROLLER_THICKNESS   = 23;
SC.MenuScrollerView.HUGE_SCROLLER_THICKNESS    = 26;


/** @class

  Implements a scroll view for menus.  This class extends SC.ScrollView for 
  menus. 
  
  The main difference with SC.ScrollView is that there is only vertical 
  scrolling. Value Syncing between SC.MenuScrollView and SC.MenuScrollerView
  is done using valueBinding.
  
  @extends SC.ScrollView
  @since SproutCore 1.0
*/
SC.MenuScrollView = SC.ScrollView.extend({

  classNames: ['sc-menu-scroll-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  
  /**
    The maximum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0.
    
    @property {Number}
  */
  maximumHorizontalScrollOffset: 0,
    
       
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view should maintain a horizontal scroller.   This property 
    must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: NO,
  
  /**
    The horizontal scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasHorizontalScroller is 
    NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.MenuScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this 
    property value anytime to show or hide the horizontal scroller.  If you 
    do not want to use a horizontal scroller at all, you should instead set 
    hasHorizontalScroller to NO to avoid creating a scroller view in the 
    first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: NO,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollHorizontal: NO,
   
  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES 
    for this property to have any effect.  
  */
  autohidesHorizontalScroller: NO,
  
  /** 
    YES if the view shuld maintain a vertical scroller.   This property must 
    be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.MenuScrollerView,
  verticalScrollerView2: SC.MenuScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  For SC.MenuScroll the
    vertical scroller is always there we just hide the arrows to scroll.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,

  
  canScrollVertical: YES,

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES 
    for this property to have any effect.  
  */
  autohidesVerticalScroller: YES,
  
  /**
    Use this property to set the 'bottom' offset of your vertical scroller, 
    to make room for a thumb view or other accessory view. Default is 0.
    
    @property {Number}
  */
  verticalScrollerBottom: 0,
  
  
  // ..........................................................
  // CUSTOM VIEWS
  // 

  /**
    Control Size for Menu content: change verticalLineScroll
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,
  
  /**
    The container view that will contain your main content view.  You can 
    replace this property with your own custom subclass if you prefer.
    
    @type {SC.ContainerView}
  */
  containerView: SC.ContainerView,
  
  // ..........................................................
  // METHODS
  // 

  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    // get vertical scroller/determine if we should have a scroller
    var hasScroller, vscroll, vscroll2, hasVertical, clip, clipLayout, viewportHeight;
    hasScroller = this.get('hasVerticalScroller');
    vscroll = hasScroller ? this.get('verticalScrollerView') : null ;
    vscroll2 = hasScroller ? this.get('verticalScrollerView2') : null ;
    hasVertical = vscroll && this.get('isVerticalScrollerVisible') ;
    
    // get the containerView
    clip = this.get('containerView') ;
    clipLayout = { left: 0, top: 0 } ;
    
    if (hasVertical) {
      viewportHeight =0;
      var scrollerThickness = vscroll.get('scrollerThickness') || vscroll2.get('scrollerThickness');
      var view   = this.get('contentView'), view2, 
            f      = (view) ? view.get('frame') : null, 
            height = (f) ? f.height : 0,
            elem = this.containerView.$()[0],
            verticalOffset = this.get('verticalScrollOffset'),
            topArrowInvisible = { height: 0, top: 0, right: 0, left: 0 },
            topArrowVisible = { height: scrollerThickness, top: 0, right: 0, left: 0 },
            bottomArrowVisible = { height: scrollerThickness, bottom: 0, right: 0, left: 0 },
            bottomArrowInvisible = { height: 0, bottom: 0, right: 0, left: 0 };
      
      if(elem) viewportHeight = elem.offsetHeight;
      
      if(verticalOffset===0){
        clipLayout.top = 0 ;
        clipLayout.bottom = scrollerThickness;
        vscroll.set('layout', topArrowInvisible) ;
        vscroll2.set('layout', bottomArrowVisible) ;
      }else if(verticalOffset>=(height-viewportHeight-scrollerThickness)){
        clipLayout.top = scrollerThickness ;
        clipLayout.bottom = 0 ;
        vscroll.set('layout', topArrowVisible) ;
        vscroll2.set('layout', bottomArrowInvisible) ;
      }else{
        clipLayout.top = scrollerThickness ;
        clipLayout.bottom = scrollerThickness ;
        vscroll.set('layout', topArrowVisible) ;
        vscroll2.set('layout', bottomArrowVisible) ;
      }
    } 
    if (vscroll){
     vscroll.set('isVisible', hasVertical) ;
     vscroll2.set('isVisible', hasVertical) ;
    }
    clip.set('layout', clipLayout) ;
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible', 'verticalScrollOffset'),
    
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function() {
    var childViews = [], view, view2, controlSize = this.get('controlSize') ;
    
    // create the containerView.  We must always have a container view. 
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;
    
    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView
    }));
    
    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');
    
    // create a vertical scroller 
    if ((view=this.verticalScrollerView) && (view2=this.verticalScrollerView2)) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layout: {top: 0, left: 0, right: 0},
          controlSize: controlSize,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view);
        view2 = this.verticalScrollerView2 = this.createChildView(view2, {
          scrollDown: YES,
          layout: {bottom: 0, left: 0, right: 0 },
          controlSize: controlSize,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view2);
      } else {
        this.verticalScrollerView = null ;
        this.verticalScrollerView2 = null ;
      }
    }
    
    // set childViews array.
    this.childViews = childViews ;
    
    this.contentViewFrameDidChange() ; // setup initial display...
    this.tile() ; // set up initial tiling
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call 
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView') ;
    var contentView = this._scroll_contentView ;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange) ;
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll() ;
  },
  
  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function() {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),
  
  /** @private
    Invoked whenever the contentView's frame changes.  This will update the 
    scroller maxmimum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.
  */
  contentViewFrameDidChange: function() {
    var view   = this.get('contentView'), view2, 
        f      = (view) ? view.get('frame') : null,
        width  = (f) ? f.width : 0,
        height = (f) ? f.height : 0,
        dim    = this.get('frame'),
        viewportHeight, elem ;
        
    // cache out scroll settings...
    //if ((width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return ;
    this._scroll_contentWidth = width;
    this._scroll_contentHeight = height ;
    
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView')) && (view2 = this.get('verticalScrollerView2'))) {
      height -= 1 ; // accurately account for our layout
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dim.height);
      }
      height -= this.get('verticalScrollerBottom') ;
      viewportHeight = 0;
      elem = this.containerView.$()[0];
      if(elem) viewportHeight = elem.offsetHeight;
      height = height - viewportHeight;
      view.setIfChanged('maximum', height) ;
      view2.setIfChanged('maximum', height) ;
    }
  },
  
  /** @private
    Whenever the horizontal scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_horizontalScrollOffsetDidChange: function() {},
   
  /** @private
    Whenever the vertical scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_verticalScrollOffsetDidChange: function() {
    var offset = this.get('verticalScrollOffset') ;
    
    // update the offset for the contentView...
    var contentView = this.get('contentView');
    if (contentView) contentView.adjust('top', 0-offset) ;
    
  }.observes('verticalScrollOffset')

});

/* >>>>>>>>>> BEGIN source/views/popup_button.js */
sc_require('views/button');

/**
  Describes the time after which "click and hold" behavior will replace the
  standard "click and release" behavior.
*/


/** @class

  SC.PopupButtonView displays a pop-up menu when clicked, from which the user
  can select an item.

  To use, create the SC.PopupButtonView as you would a standard SC.ButtonView,
  then set the menu property to an instance of SC.MenuPane. For example:

{{{
SC.PopupButtonView.design({
  layout: { width: 200, height: 18 },
  menuBinding: 'MyApp.menuController.menuPane'
});
}}}

  You would then have your MyApp.menuController return an instance of the menu
  to display.

  @extends SC.ButtonView
  @author Santosh Shanbhogue
  @author Tom Dale
  @copyright 2008-2010, Sprout Systems, Inc. and contributors.
  @version 1.0
*/
SC.PopupButtonView = SC.ButtonView.extend(
/** @scope SC.PopupButtonView.prototype */ {
  classNames: ['sc-popup-button'],

  // ..........................................................
  // PROPERTIES
  //

  /**
    The prefer matrix to use when displaying the menu.

    @property
  */
  preferMatrix: null,

  /**
    The SC.MenuPane that should be displayed when the button is clicked.

    @type {SC.MenuPane}
    @default null
  */
  menu: null,
  
  /**
    If YES and the menu is a class, this will cause a task that will instantiate the menu
    to be added to SC.backgroundTaskQueue.
  */
  shouldLoadInBackground: NO,

  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  /**
    @private
    If necessary, adds the loading of the menu to the background task queue.
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._setupMenu();
    if (this.get('shouldLoadInBackground')) {
      SC.backgroundTaskQueue.push(SC.PopupButtonMenuLoader.create({ popupButton: this }));
    }
  },
  
  /**
    @private
    Sets up binding on the menu, removing any old ones if necessary.
  */
  _setupMenu: function() {
    var menu = this.get('instantiatedMenu');
    
    // clear existing bindings
    if (this.isActiveBinding) this.isActiveBinding.disconnect();
    this.isActiveBinding = null;
    
    // if there is a menu
    if (menu && !menu.isClass) {
      this.isActiveBinding = this.bind('isActive', menu, 'isVisibleInWindow');
    }
  },
  
  /**
    Setup the bindings for menu...
  */
  _popup_menuDidChange: function() {
    this._setupMenu();
  }.observes('menu'),

  /** @private
    isActive is NO, but when the menu is instantiated, it is bound to the menu's isVisibleInWindow property.
  */
  isActive: NO,
  
  /**
    @private
    Instantiates the menu if it is not already instantiated.
  */
  _instantiateMenu: function() {
    // get menu
    var menu = this.get('menu');
    
    // if it is already instantiated or does not exist, we cannot do anything
    if (!menu.isClass || !menu) return;
    
    // create
    this.menu = menu.create();
    
    // setup
    this._setupMenu();
  },
  
  acceptsFirstResponder: YES,
  
  /**
    The guaranteed-instantiated menu.
  */
  instantiatedMenu: function() {
    // get the menu
    var menu = this.get('menu');
    
    // if it is a class, we need to instantiate it
    if (menu && menu.isClass) {
      // do so
      this._instantiateMenu();
      
      // get the new version of the local
      menu = this.get('menu');
    }
    
    // return
    return menu;
  }.property('menu').cacheable(),

  /** @private
    Displays the menu.

    @param {SC.Event} evt
  */
  action: function(evt)
  {
    var menu = this.get('instantiatedMenu') ;

    if (!menu) {
      //@ if (debug)
      SC.Logger.warn("SC.PopupButton - Unable to show menu because the menu property is set to %@.".fmt(menu));
      //@ endif
      return NO ;
    }

    menu.popup(this, this.get('preferMatrix')) ;
    return YES;
  },

  /** @private
    On mouse down, we set the state of the button, save some state for further
    processing, then call the button's action method.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseDown: function(evt) {
    // If disabled, handle mouse down but ignore it.
    if (!this.get('isEnabled')) return YES ;

    this._isMouseDown = YES;

    this._action() ;

    // Store the current timestamp. We register the timestamp at the end of
    // the runloop so that the menu has been rendered, in case that operation
    // takes more than a few hundred milliseconds.

    // One mouseUp, we'll use this value to determine how long the mouse was
    // pressed.
    this.invokeLast(this._recordMouseDownTimestamp);

    this.becomeFirstResponder();

    return YES ;
  },

  /** @private
    Records the current timestamp. This is invoked at the end of the runloop
    by mouseDown. We use this value to determine the delay between mouseDown
    and mouseUp.
  */
  _recordMouseDownTimestamp: function() {
    this._menuRenderedTimestamp = new Date().getTime();
  },

  /** @private
    Because we responded YES to the mouseDown event, we have responsibility
    for handling the corresponding mouseUp event.

    However, the user may click on this button, then drag the mouse down to a
    menu item, and release the mouse over the menu item. We therefore need to
    delegate any mouseUp events to the menu's menu item, if one is selected.

    We also need to differentiate between a single click and a click and hold.
    If the user clicks and holds, we want to close the menu when they release.
    Otherwise, we should wait until they click on the menu's modal pane before
    removing our active state.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseUp: function(evt) {
    var timestamp = new Date().getTime(),
        previousTimestamp = this._menuRenderedTimestamp,
        menu = this.get('instantiatedMenu'),
        touch = SC.platform.touch,
        targetMenuItem;

    if (menu) {
      // Get the menu item the user is currently hovering their mouse over
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      if (targetMenuItem) {
        // Have the menu item perform its action.
        // If the menu returns NO, it had no action to
        // perform, so we should close the menu immediately.
        if (!targetMenuItem.performAction()) menu.remove();
      } else {
        // If the user waits more than certain amount of time between
        // mouseDown and mouseUp, we can assume that they are clicking and
        // dragging to the menu item, and we should close the menu if they
        //mouseup anywhere not inside the menu.
        if (!touch && (timestamp - previousTimestamp > SC.ButtonView.CLICK_AND_HOLD_DELAY)) {
          menu.remove();
        }
      }
    }

    // Reset state.
    this._isMouseDown = NO;
    arguments.callee.base.apply(this,arguments);
    return YES;
  },

  /** @private
    Overrides ButtonView's mouseExited method to remove the behavior where the
    active state is removed on mouse exit. We want the button to remain active
    as long as the menu is visible.

    @param {SC.Event} evt
    @returns {Boolean}
  */
  mouseExited: function(evt) {
    return YES;
  },

  /** @private
    Overrides performKeyEquivalent method to pass any keyboard shortcuts to
    the menu.

    @param {String} charCode string corresponding to shortcut pressed (e.g.,
    alt_shift_z)
    @param {SC.Event} evt
  */
  performKeyEquivalent: function( charCode, evt )
  {
    if (!this.get('isEnabled')) return NO ;
    var menu = this.get('instantiatedMenu') ;
    return (!!menu && menu.performKeyEquivalent(charCode, evt)) ;
  },

  /** @private */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled')

});

/**
  @private
  Handles lazy instantiation of popup button menu.
*/
SC.PopupButtonMenuLoader = SC.Task.extend({
  popupButton: null,
  run: function() {
    if (this.popupButton) this.popupButton._instantiateMenu();
  }
});


/* >>>>>>>>>> BEGIN source/views/progress.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Displays a progress bar.  You can display both a defined and an 
  indeterminate progressbar.  The progress bar itself is designed to be styled
  using CSS classes with the following structure:
  
  <div class="sc-progress-view"><div class="inner"></div></div>
  
  The outer can form the boundary of the bar while the inner will be adjusted 
  to fit the percentage of the progress.
  
  Creating a ProgressView accepts a number of properties, for example:
  {
    value: 50, 
    minimum: 0, 
    maximum: 100,
    isIndeterminate: NO,
    isEnabled: YES
  }
  
  Default isEnabled value is YES.

  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.ProgressView = SC.View.extend(SC.Control, {
  
  // ........................................
  // PROPERTIES
  //

  /**
    Bind this to the current value of the progress bar.  Note that by default 
    an empty value will disable the progress bar and a multiple value will make 
    it indeterminate.
  */
  value: 0.50,
  valueBindingDefault: SC.Binding.single().notEmpty(),
  
  /**
    The minimum value of the progress.
  */ 
  minimum: 0,
  minimumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the minimum progress value 
    from the content object.  If this is set to null then the minimum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMinimumKey: null,
  
  /**
    The maximum value of the progress bar.
  */
  maximum: 1.0,
  maximumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    The value of the progress inner offset range. Should be the same as width 
    of image. Default it to 24

    @type Integer
  */
  offsetRange: 24,

  /**
    Optionally specify the key used to extract the maximum progress value 
    from the content object.  If this is set to null then the maximum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMaximumKey: null,

  /** 
    Set to true if the item in progress is indeterminate.  This may be 
    overridden by the actual value.
    @returns {Boolean} 
  */
  isIndeterminate: NO,
  isIndeterminateBindingDefault: SC.Binding.bool(),

  /**
    Set to YES when the process is currently running.  This will cause the 
    progress bar to animate, especially if it is indeterminate.  
  */
  isRunning: NO,
  isRunningBindingDefault: SC.Binding.bool(),

  /** 
    Set to the matrix used for background image position for animation.
    [1st image y-location, offset, total number of images]
    @property {Array}
  */
  animatedBackgroundMatrix: [],
  
  /**
    Optionally specify the key used to extract the isIndeterminate value 
    from the content object.  If this is set to null then the isIndeterminate 
    value will not be derived from the content object.
    
    @property {String}
  */
  contentIsIndeterminateKey: null,

  // ........................................
  // STRUCTURE
  //

  classNames: 'sc-progress-view',
  
  // ........................................
  // INTERNAL SUPPORT
  //

  _backgroundOffset: 0,
  _currentBackground: 1,
  _nextBackground: 1,
  
  // start animating at the end of the init() method.  note that we call this
  // here because we want this to make sure this function is called anytime 
  // the progress view is instantiated.
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.animateProgressBar(); // start animating...  
  },
  
  // start/stop running animation based on isRunning state.
  animateProgressBar: function() {
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this._animateProgressBar(500); // wait to start to avoid probs
    }
  }.observes('isRunning', 'isVisibleInWindow'),

  _animateProgressBar: function(delay) {  
    if (delay===0) delay = 1000/30;
    if (this.get('isRunning') && this.get('isVisibleInWindow')) {
      this.displayDidChange();
      this.invokeLater(this._animateProgressBar, delay, 600);
    }
  },
  
  displayProperties: 'value minimum maximum isIndeterminate'.w(),
  
  render: function(context, firstTime) {
    var inner, animatedBackground, value, cssString, backPosition,
        isIndeterminate = this.get('isIndeterminate'),
        isRunning = this.get('isRunning'),
        isEnabled = this.get('isEnabled'),
        offsetRange = this.get('offsetRange'),
        offset = (isIndeterminate && isRunning) ? 
                (Math.floor(Date.now()/75)%offsetRange-offsetRange) : 0;
  
    // compute value for setting the width of the inner progress
    if (!isEnabled) {
      value = "0%" ;
    } else if (isIndeterminate) {
      value = "120%";
    } else {
      value = (this.get("_percentageNumeric") * 100) + "%";
    }

    var classNames = {
      'sc-indeterminate': isIndeterminate,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    };
    
    if(firstTime) {
      var classString = this._createClassNameString(classNames);
      context.push('<div class="sc-inner ', classString, '" style="width: ', 
                    value, ';left: ', offset, 'px;">',
                    '<div class="sc-inner-head">','</div>',
                    '<div class="sc-inner-tail"></div></div>',
                    '<div class="sc-outer-head"></div>',
                    '<div class="sc-outer-tail"></div>');
    }
    else {
      context.setClass(classNames);
      inner = this.$('.sc-inner');
      animatedBackground = this.get('animatedBackgroundMatrix');
      cssString = "width: "+value+"; ";
      cssString = cssString + "left: "+offset+"px; ";
      if (animatedBackground.length === 3 ) {
        inner.css('backgroundPosition', '0px -'+ 
                (animatedBackground[0] + 
                animatedBackground[1]*this._currentBackground)+'px');
        if(this._currentBackground===animatedBackground[2]-1
           || this._currentBackground===0){
          this._nextBackground *= -1;
        }
        this._currentBackground += this._nextBackground;
        
        cssString = cssString + "backgroundPosition: "+backPosition+"px; ";
        //Instead of using css() set attr for faster perf.
        inner.attr('style', cssString);
      }else{
        inner.attr('style', cssString);
      }
    }
    
  },
  
  contentPropertyDidChange: function(target, key) {
    var content = this.get('content');
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  },
  
  _percentageNumeric: function(){
    var minimum = this.get('minimum') || 0.0,
        maximum = this.get('maximum') || 1.0,
        value = this.get('value') || 0.0;
    value = (value - minimum) / (maximum - minimum);
    if (value > 1.0) value = 1.0;

    if(isNaN(value)) value = 0.0;
    // cannot be smaller then minimum
    if(value<minimum) value = 0.0;
    // cannot be larger then maximum
    if(value>maximum) value = 1.0;
    return value;
  }.property('value').cacheable(),
  
  _createClassNameString: function(classNames) {
    var classNameArray = [], key;
    for(key in classNames) {
      if(!classNames.hasOwnProperty(key)) continue;
      if(classNames[key]) classNameArray.push(key);
    }
    return classNameArray.join(" ");
  }
  
}) ;

/* >>>>>>>>>> BEGIN source/views/radio.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

  A RadioView is used to create a group of radio buttons.  The user can use
  these buttons to pick from a choice of options.
  
  This view renders simulated radio buttons that can display a mixed state and 
  has other features not found in platform-native controls.
  
  The radio buttons themselves are designed to be styled using CSS classes with
  the following structure:
  
  <label class="sc-radio-button">
  <img class="button" src="some_image.gif"/>
  <input type="radio" name="<sc-guid>" value=""/>
  <span class="sc-button-label">Label for button1</span>
  </label>
  
  Setting up a RadioView accepts a number of properties, for example:
  {
    items: [{ title: "Red", 
              value: "red", 
              enabled: YES, 
              icon: "button_red" },
            { title: "Green", 
              value: "green", 
              enabled: YES, 
              icon: 'button_green' }],
    value: 'red',
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemIconKey: 'icon',
    itemIsEnabledKey: 'enabled',
    isEnabled: YES,
    layoutDirection: SC.LAYOUT_HORIZONTAL
  }
  
  Default layoutDirection is vertical. 
  Default isEnabled is YES.
  
  The value property can be either a string, as above, or an array of strings
  for pre-checking multiple values.
  
  The items array can contain either strings, or as in the example above a 
  hash. When using a hash, make sure to also specify the itemTitleKey
  and itemValueKey you are using. Similarly, you will have to provide 
  itemIconKey if you are using icons radio buttons. The individual items 
  enabled property is YES by default, and the icon is optional.
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.RadioView = SC.View.extend(SC.Control,
/** @scope SC.RadioView.prototype */
{

  // HTML design options
  classNames: ['sc-radio-view'],

  /**
    The value of the currently selected item, and which will be checked in the 
    UI. This can be either a string or an array with strings for checking 
    multiple values.
  */
  value: null,

  /**
    This property indicates how the radio buttons are arranged.
  */
  layoutDirection: SC.LAYOUT_VERTICAL,

  // escape the HTML in label text
  escapeHTML: YES,

  /** 
    The items property can be either an array with strings, or a
    hash. When using a hash, make sure to also specify the appropriate
    itemTitleKey, itemValueKey, itemIsEnabledKey and itemIconKey.
  */
  items: [],

  /** 
    If items property is a hash, specify which property will function as
    the title with this itemTitleKey property.
  */
  itemTitleKey: null,
  
  /**
    If items property is a hash, specify which property will function as
    the item width with this itemWidthKey property. This is only used when
    layoutDirection is set to SC.LAYOUT_HORIONZTAL and can be used to override
    the default value provided by the framework or theme CSS.
    
    @property {String}
    @default null
  */
  itemWidthKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemValueKey property.
  */
  itemValueKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemIsEnabledKey property.
  */
  itemIsEnabledKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemIconKey property.
  */
  itemIconKey: null,

  /** 
    If the items array itself changes, add/remove observer on item... 
  */
  itemsDidChange: function() {
    if (this._items) {
      this._items.removeObserver('[]', this, this.itemContentDidChange);
    }
    this._items = this.get('items');
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange);
    }
    this.itemContentDidChange();
  }.observes('items'),

  /** 
    Invoked whenever the item array or an item in the array is changed.
    This method will regenerate the list of items.
  */
  itemContentDidChange: function() {
    // Force regeneration of buttons
    this._renderAsFirstTime = YES;
  
    this.notifyPropertyChange('_displayItems');
  },

  // ..........................................................
  // PRIVATE SUPPORT
  // 
  /** 
    The display properties for radio buttons are the value and _displayItems.
  */
  displayProperties: ['value', '_displayItems'],

  render: function(context, firstTime) {
    var items = this.get('_displayItems'),
        value = this.get('value'),
        isArray = SC.isArray(value),
        item, idx, icon, name, width, itemsLength, url,
        className, disabled, sel, labelText,
        selectionState, selectionStateClassNames;

    context.addClass(this.get('layoutDirection'));

    // isArray is set only when there are two active checkboxes 
    // which can only happen with mixed state
    if (isArray && value.length <= 0) {
      value = value[0];
      isArray = NO;
    }

    // if necessary, regenerate the radio buttons
    if (this._renderAsFirstTime) {
      firstTime = YES;
      this._renderAsFirstTime = NO;
    }

    if (firstTime) {
      context.attr('role', 'radiogroup');
      // generate tags from this.
      name = SC.guidFor(this); // name for this group
      itemsLength = items.length;
      for (idx = 0; idx < itemsLength; idx++) {
        item = items[idx];

        // get the icon from the item, if one exists...
        icon = item[3];
        if (icon) {
          url = (icon.indexOf('/') >= 0) ? icon: SC.BLANK_IMAGE_URL;
          className = (url === icon) ? '': icon;
          icon = '<img src="' + url + '" class="icon ' + className + '" alt="" />';
        } else icon = '';

        if (item) {
          sel = (isArray) ? (value.indexOf(item[1]) >= 0) : (value === item[1]);
        } else {
          sel = NO;
        }
        selectionStateClassNames = this._getSelectionStateClassNames(item, sel, value, isArray, false);

        labelText = this.escapeHTML ? SC.RenderContext.escapeHTML(item[0]) : item[0];
        
        width = item[4];
        
        context.push('<div class="sc-radio-button ',
                    selectionStateClassNames, '" ',
                    width ? 'style="width: ' + width + 'px;" ' : '',
                    'aria-checked="', sel ? 'true':'false','" ',
                    'role="radio"' , ' index="', idx,'">',
                    '<span class="button"></span>',
                    '<span class="sc-button-label">', 
                    icon, labelText, '</span></div>');
      }

    } else {
      // update the selection state on all of the DOM elements.  The options are
      // sel or mixed.  These are used to display the proper setting...
      this.$('.sc-radio-button').forEach(function(button) {

        button = this.$(button);
        idx = parseInt(button.attr('index'), 0);
        item = (idx >= 0) ? items[idx] : null;

        if (item) {
          sel = (isArray) ? (value.indexOf(item[1]) >= 0) : (value === item[1]);
        } else {
          sel = NO;
        }
        
        width = item[4];
        if (width) button.width(width);
        
        selectionState = this._getSelectionStateClassNames(item, sel, value, isArray, true);
        button.attr('aria-checked', sel ? 'true': 'false');
        // set class of label
        button.setClass(selectionState);

        // avoid memory leaks
        idx = selectionState = null;
      },
      this);
    }
  },

  /** @private - 
    Will iterate the items property to return an array with items that is 
    indexed in the following structure:
      [0] => Title (or label)
      [1] => Value
      [2] => Enabled (YES default)
      [3] => Icon (image URL)
  */
  _displayItems: function() {
    var items = this.get('items'), 
        loc = this.get('localize'),
        titleKey = this.get('itemTitleKey'),
        valueKey = this.get('itemValueKey'),
        widthKey = this.get('itemWidthKey'),
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL,
        isEnabledKey = this.get('itemIsEnabledKey'), 
        iconKey = this.get('itemIconKey'),
        ret = [], max = (items)? items.get('length') : 0,
        item, title, width, value, idx, isArray, isEnabled, icon;
    
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx); 
      
      // if item is an array, just use the items...
      if (SC.typeOf(item) === SC.T_ARRAY) {
        title = item[0];
        value = item[1];

        // otherwise, possibly use titleKey,etc.
      } else if (item) {
        // get title.  either use titleKey or try to convert the value to a 
        // string.
        if (titleKey) {
          title = item.get ? item.get(titleKey) : item[titleKey];
        } else title = (item.toString) ? item.toString() : null;
        
        if (widthKey && isHorizontal) {
          width = item.get ? item.get(widthKey) : item[widthKey];
        }
        
        if (valueKey) {
          value = item.get ? item.get(valueKey) : item[valueKey];
        } else value = item;

        if (isEnabledKey) {
          isEnabled = item.get ? item.get(isEnabledKey) : item[isEnabledKey];
        } else isEnabled = YES;

        if (iconKey) {
          icon = item.get ? item.get(iconKey) : item[iconKey];
        } else icon = null;

        // if item is nil, use somedefaults...
      } else {
        title = value = icon = null;
        isEnabled = NO;
      }

      // localize title if needed
      if (loc) title = title.loc();
      ret.push([title, value, isEnabled, icon, width]);
    }

    return ret; // done!
  }.property('items', 'itemTitleKey', 'itemWidthKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey').cacheable(),

  /** @private - 
    Will figure out what class names to assign each radio button.
    This method can be invoked either as part of render() either when:
    1. firstTime is set and we need to assign the class names as a string
    2. we already have the DOM rendered but we just need to update class names
       assigned to the the input field parent
  */
  _getSelectionStateClassNames: function(item, sel, value, isArray, shouldReturnObject) {
    var classNames, key;

    // now set class names
    classNames = {
      sel: (sel && !isArray),
      mixed: (sel && isArray),
      disabled: (!item[2])
    };

    if (shouldReturnObject) {
      return classNames;
    } else {
      // convert object values to string
      var classNameArray = [];
      for (key in classNames) {
        if (!classNames.hasOwnProperty(key)) continue;
        if (classNames[key]) classNameArray.push(key);
      }
      return classNameArray.join(" ");
    }
  },

  /**
    If the user clicks on of the items mark it as active on mouseDown unless
    is disabled.

    Save the element that was clicked on so we can remove the active state on
    mouseUp.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES;
    var target = evt.target;
    while (target) {
      if (target.className && target.className.indexOf('sc-radio-button') > -1) break;
      target = target.parentNode;
    }
    if (!target) return NO;

    target = this.$(target);
    if (target.hasClass('disabled')) return YES;
    target.addClass('active');
    this._activeRadioButton = target;
    // even if radiobuttons are not set to get firstResponder, allow default 
    // action, that way textfields loose focus as expected.
    evt.allowDefault();
    return YES;
  },

  /**
    If we have a radio element that was clicked on previously, make sure we
    remove the active state. Then update the value if the item clicked is 
    enabled.
  */
  mouseUp: function(evt) {
    if (!this.get('isEnabled')) return YES;
    var active = this._activeRadioButton,
    target = evt.target,
    items = this.get('_displayItems'),
    index,
    item;

    if (active) {
      active.removeClass('active');
      this._activeRadioButton = null;
    } else return YES;

    while (target) {
      if (target.className && target.className.indexOf('sc-radio-button') > -1) break;
      target = target.parentNode;
    }
    target = this.$(target);
    if (target[0] !== active[0] || target.hasClass('disabled')) return YES;

    index = parseInt(target.attr('index'), 0);
    item = items[index];
    this.set('value', item[1]);
  },

  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
});

/* >>>>>>>>>> BEGIN source/views/scene.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays several views as scenes that can slide on and off the screen.  The
  scene view is a nice way to provide a simple effect of moving from a 
  higher level screen to a more detailed level screen.  You will be able to
  optionally choose the kind of animation used to transition the two scenes 
  as well if supported on the web browser.
  
  h1. Using The View
  
  To setup the scene view, you should define the 'scenes' property with an 
  array of scene names.  These will be the properties on the scene view that
  you can shift in an out of view as needed.  You can edit the scenes property
  at any time.  It will only be used when you start to transition from one
  scene to another.
  
  Next you should set your nowShowing property to the name of the scene you 
  would like to display.  This will cause the view to transition scenes if it
  is visible on screen.  Otherwise, it will simply make the new scene view 
  the current content view and that's it.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SceneView = SC.ContainerView.extend(
  /** @scope SC.SceneView.prototype */ {

  /**
    Array of scene names.  Scenes will slide on and off screen in the order
    that you specifiy them here.  That is, if you shift from a scene at index
    2 to a scene at index 1, the scenes will animation backwards.  If you
    shift to a scene at index 3, the scenes will animate forwards.
    
    The default scenes defined are 'master' and 'detail'.  You can replace or 
    augment this array as you like.
    
    @property {Array}
  */
  scenes: ['master', 'detail'],

  /**
    The currently showing scene.  Changing this property will cause the 
    scene view to transition to the new scene.  If you set this property to 
    null, an empty string, or a non-existant scene, then the scene will appear
    empty.
  */
  nowShowing: null,
  
  /**
    Speed of transition.  Should be expressed in msec.
  */
  transitionDuration: 200,
  
  _state: 'NO_VIEW', // no view

  /** @private
  
    Whenever called to change the content, save the nowShowing state and 
    then animate in by adjusting the layout.
    
  */
  replaceContent: function(content) {
    if (content && this._state===this.READY) this.animateScene(content);
    else this.replaceScene(content);
    return this ;
  },

  /** @private
  
    Invoked whenever we just need to swap the scenes without playing an
    animation.
  */
  replaceScene: function(newContent) {
    var oldContent = this._targetView,
        layout     = this.STANDARD_LAYOUT,
        scenes     = this.get('scenes'),
        idx        = scenes ? scenes.indexOf(this.get('nowShowing')) : -1;

    // cleanup animation here too..
    this._targetView = newContent ;
    this._targetIndex  = idx;
    
    if (this._timer) this._timer.invalidate();
    this._leftView = this._rightView = this._start = this._end = null;
    this._timer = null;
    
    
    this.removeAllChildren();

    if (oldContent) oldContent.set('layout', layout);
    if (newContent) newContent.set('layout', layout);
    
    if (newContent) this.appendChild(newContent);
    this._state = newContent ? this.READY : this.NO_VIEW ;
  },

  /** @private
  
    Invoked whenever we need to animate in the new scene.
  */
  animateScene: function(newContent) {
    var oldContent = this._targetView,
        outIdx     = this._targetIndex,
        scenes     = this.get('scenes'),
        inIdx      = scenes ? scenes.indexOf(this.get('nowShowing')) : -1,
        layout;

    if (outIdx<0 || inIdx<0 || outIdx===inIdx) {
      return this.replaceScene(newContent);
    }

    this._targetView = newContent ;
    this._targetIndex = inIdx; 
    
    // save some info needed for animation
    if (inIdx > outIdx) {
      this._leftView  = oldContent;
      this._rightView = newContent;
      this._target    = -1;
    } else {
      this._leftView  = newContent ;
      this._rightView = oldContent ;
      this._target    = 1 ;
    }

    // setup views
    this.removeAllChildren();

    if (oldContent) this.appendChild(oldContent)
    if (newContent) this.appendChild(newContent);

    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this.tick();
  },

  /** @private - called while the animation runs.  Compute the new layout for
    the left and right views based on the portion completed.  When we finish
    call replaceScene().
  */
  tick: function() {  
    this._timer = null ; // clear out
    
    var now    = Date.now(),
        pct    = (now-this._start)/(this._end-this._start),
        target = this._target,
        left   = this._leftView,
        right  = this._rightView,
        layout, adjust;
        
    if (pct<0) pct = 0;
    
    // if we're done or the view is no longer visible, just replace the 
    // scene.
    if (!this.get('isVisibleInWindow') || (pct>=1)) {
      return this.replaceScene(this._targetView);
    }

    // ok, now let's compute the new layouts for the two views and set them
    layout = SC.clone(this.get('frame'));
    adjust = Math.floor(layout.width * pct);
    
    // set the layout for the views, depending on the direction
    if (target>0) {
      layout.left = 0-(layout.width-adjust);
      left.set('layout', layout);

      layout = SC.clone(layout);
      layout.left = adjust ;
      right.set('layout', layout);
      
    } else {
      layout.left = 0-adjust ;
      left.set('layout', layout);
      
      layout = SC.clone(layout);
      layout.left = layout.width-adjust;
      right.set('layout', layout);
    }

    this._timer = this.invokeLater(this.tick, 20);
    return this;
  },
  

  // states for view animation
  NO_VIEW: 'NO_VIEW',
  ANIMATING: 'ANIMATING',
  READY: 'READY',

  /** @private - standard layout assigned to views at rest */
  STANDARD_LAYOUT: { top: 0, left: 0, bottom: 0, right: 0 }
  
  
});

/* >>>>>>>>>> BEGIN source/views/segmented.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  SegmentedView is a special type of button that can display multiple
  segments.  Each segment has a value assigned to it.  When the user clicks
  on the segment, the value of that segment will become the new value of 
  the control.
  
  You can also optionally configure a target/action that will fire whenever
  the user clicks on an item.  This will give your code an opportunity to take
  some action depending on the new value.  (of course, you can always bind to
  the value as well, which is generally the preferred approach.)
  
  h1. Defining Your Segments
  
  You define your segments by providing a items array, much like you provide
  to a RadioView.  Your items array can be as simple as an array of strings 
  or as complex as full model objects.  Based on how you configure your
  itemKey properties, the segmented view will read the properties it needs 
  from the array and construct the button.
  
  You can define the following properties on objects you pass in:
  
  | *itemTitleKey* | the title of the button |
  | *itemValueKey* | the value of the button |
  | *itemWidthKey* | the preferred width. if omitted, it autodetects |
  | *itemIconKey*  | an icon |
  | *itemActionKey* | an optional action to fire when pressed |
  | *itemTargetKey* | an optional target for the action |

  @extends SC.View
  @since SproutCore 1.0
*/
SC.SegmentedView = SC.View.extend(SC.Control,
/** @scope SC.SegmentedView.prototype */ {
  
  classNames: ['sc-segmented-view'],
  
  theme: 'square',
  
  /**
    The value of the segmented view.
    
    The SegmentedView's value will always be the value of the currently
    selected button.  Setting this value will change the selected button. 
    If you set this value to something that has no matching button, then
    no buttons will be selected.
    
    @field {Object}
  */
  value: null,

  /**
    Set to YES to enabled the segmented view, NO to disabled it.
  */
  isEnabled: YES, 

  /**
    If YES, clicking a selected button again will deselect it, setting the
    segmented views value to null.  Defaults to NO.
  */
  allowsEmptySelection: NO,  
  
  /**
    If YES, then clicking on a tab will not deselect the other segments, it
    will simply add or remove it from the selection.
  */
  allowsMultipleSelection: NO,

  /**
    If YES, titles will be localized before display.
  */
  localize: YES,
  
  align: SC.ALIGN_CENTER,
  
  /**
    Change the layout direction to make this a vertical set of tabs instead
    of horizontal ones.
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  // ..........................................................
  // SEGMENT DEFINITION
  //
   
  /**
    The array of items to display.  This can be a simple array of strings,
    objects or hashes.  If you pass objects or hashes, you must also set the
    various itemKey properties to tell the SegmentedView how to extract the
    information it needs.
    
    @property {Array}
  */
  items: [],

  /** 
    The key that contains the title for each item.
    
    @property {String}
  */
  itemTitleKey: null,
  
  /** 
    The key that contains the value for each item.
    
    @property {String}
  */
  itemValueKey: null,
  
  /** 
    A key that determines if this item in particular is enabled.  Note if the
    control in general is not enabled, no items will be enabled, even if the
    item's enabled property returns YES.
    
    @property {String}
  */
  itemIsEnabledKey: null,

  /** 
    The key that contains the icon for each item.  If omitted, no icons will
    be displayed.
    
    @property {String}
  */
  itemIconKey: null,

  /** 
    The key that contains the desired width for each item.  If omitted, the
    width will autosize.
  
    @property {String}
  */
  itemWidthKey: null,
  
  /** 
    The key that contains the action for this item.  If defined, then 
    selecting this item will fire the action in addition to changing the 
    value.  See also itemTargetKey.
    
    @property {String}
  */
  itemActionKey: null,

  /** 
    The key that contains the target for this item.  If this and itemActionKey
    are defined, then this will be the target of the action fired. 
    
    @property {String}
  */
  itemTargetKey: null,

  /** 
    The key that contains the key equivalent for each item.  If defined then
    pressing that key equivalent will be like selecting the tab.  Also, 
    pressing the Alt or Option key for 3 seconds will display the key 
    equivalent in the tab.
  */
  itemKeyEquivalentKey: null,

  /**
    The array of itemKeys that will be searched to build the displayItems
    array.  This is used internally by the class.  You will not generally
    need to access or edit this array.
    
    @property {Array}
  */
  itemKeys: 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey'.w(),
  
  /**
    This computed property is generated from the items array based on the 
    itemKey properties that you set.  The return value is an array of arrays
    that contain private information used by the SegmentedView to render. 
    
    You will not generally need to access or edit this property.
    
    @property {Array}
  */
  displayItems: function() {
    var items = this.get('items'), loc = this.get('localize'),
      keys=null, itemType, cur, ret = [], max = items.get('length'), idx, 
      item, fetchKeys = SC._segmented_fetchKeys, fetchItem = SC._segmented_fetchItem;
    
    // loop through items and collect data
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx) ;
      if (SC.none(item)) continue; //skip is null or undefined
      
      // if the item is a string, build the array using defaults...
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        cur = [item.humanize().titleize(), item, YES, null, null,  null, idx] ;
        
      // if the item is not an array, try to use the itemKeys.
      } else if (itemType !== SC.T_ARRAY) {
        // get the itemKeys the first time
        if (keys===null) {
          keys = this.itemKeys.map(fetchKeys,this);
        }
        
        // now loop through the keys and try to get the values on the item
        cur = keys.map(fetchItem, item);
        cur[cur.length] = idx; // save current index
        
        // special case 1...if title key is null, try to make into string
        if (!keys[0] && item.toString) cur[0] = item.toString(); 
        
        // special case 2...if value key is null, use item itself
        if (!keys[1]) cur[1] = item;
        
        // special case 3...if isEnabled is null, default to yes.
        if (!keys[2]) cur[2] = YES ; 
      }
      
      // finally, be sure to loc the title if needed
      if (loc && cur[0]) cur[0] = cur[0].loc();

      // finally, be sure to loc the toolTip if needed
      if (loc && cur[5] && SC.typeOf(cur[5]) === SC.T_STRING) cur[5] = cur[5].loc();
      
      // add to return array
      ret[ret.length] = cur;
    }
    
    // all done, return!
    return ret ;
  }.property('items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey', 'itemWidthKey', 'itemToolTipKey'),
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() { 
    if (this._items) {
      this._items.removeObserver('[]',this,this.itemContentDidChange) ;
    } 
    this._items = this.get('items') ;
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange) ;
    }
    
    this.itemContentDidChange();
  }.observes('items'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    this.set('renderLikeFirstTime', YES);
    this.notifyPropertyChange('displayItems');
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.itemsDidChange() ;
  },

  
  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  
  displayProperties: ['displayItems', 'value', 'activeIndex'],
  
  
  render: function(context, firstTime) { 
    
    // collect some data 
    var items = this.get('displayItems');
    
    var theme = this.get('theme');
    if (theme) context.addClass(theme);
    if (firstTime || this.get('renderLikeFirstTime')) {
      this._seg_displayItems = items; // save for future
      this.renderDisplayItems(context, items) ;
      context.addStyle('text-align', this.get('align'));
      this.set('renderLikeFirstTime',NO);
    }else{
    // update selection and active state
      var activeIndex = this.get('activeIndex'),
          value = this.get('value'),
          isArray = SC.isArray(value);
      if (isArray && value.get('length')===1) {
        value = value.objectAt(0); isArray = NO ;
      }
      var names = {}, // reuse  
          loc = items.length, cq = this.$('.sc-segment'), item;
      while(--loc>=0) {
        item = items[loc];
        names.sel = isArray ? (value.indexOf(item[1])>=0) : (item[1]===value);
        names.active = (activeIndex === loc);
        names.disabled = !item[2];
        SC.$(cq[loc]).setClass(names);
      }
      names = items = value = items = null; // cleanup
    }
  },
  
  /**
    Actually generates the segment HTML for the display items.  This method 
    is called the first time a view is constructed and any time the display
    items change thereafter.  This will construct the HTML but will not set
    any "transient" states such as the global isEnabled property or selection.
  */
  renderDisplayItems: function(context, items) {
    var value       = this.get('value'),
        isArray     = SC.isArray(value),
        activeIndex = this.get('activeIndex'),
        len         = items.length,
        title, icon, url, className, ic, item, toolTip, width, i, stylesHash,
        classArray;

    for(i=0; i< len; i++){
      ic = context.begin('a').attr('role', 'button');
      item=items[i];
      title = item[0]; 
      icon = item[3];
      toolTip = item[5];
      
      stylesHash = {};
      classArray = [];

      if (this.get('layoutDirection') == SC.LAYOUT_HORIZONTAL) {
        stylesHash['display'] = 'inline-block' ;
      }

      classArray.push('sc-segment');
      
      if(!item[2]){
        classArray.push('disabled');
      }
      if(i===0){
        classArray.push('sc-first-segment');
      }
      if(i===(len-1)){
        classArray.push('sc-last-segment');
      }
      if(i!==0 && i!==(len-1)){
        classArray.push('sc-middle-segment');
      }      
      if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
        classArray.push('sel');
      }
      if(activeIndex === i) {
        classArray.push('active') ;
      }
      if(item[4]){
        width=item[4];
        stylesHash['width'] = width+'px';
      }
      ic.addClass(classArray);
      ic.addStyle(stylesHash);
      if(toolTip) {
        ic.attr('title', toolTip) ;
      }

      if (icon) {
        url = (icon.indexOf('/')>=0) ? icon : SC.BLANK_IMAGE_URL;
        className = (url === icon) ? '' : icon ;
        icon = '<img src="'+url+'" alt="" class="icon '+className+'" />';
      } else {
        icon = '';
      }
      ic.push('<span class="sc-button-inner"><label class="sc-button-label">',
              icon+title, '</label></span>');
      ic.end();
    }   
  },  
  
  // ..........................................................
  // EVENT HANDLING
  // 
  
  /** 
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function(evt) {
    return this.displayItemIndexForPosition(evt.pageX, evt.pageY);
  },
  
  /**
    Determines an item index based on a position. The position does not have to be within the view's
    bounding rectangle. If no item is at that position, this will return -1.
    
    NOTE: Eventually, this sort of function should be implemented in a renderer.
  */
  displayItemIndexForPosition: function(pageX, pageY) {
    // find the segments
    var segments = this.$('.sc-segment'), len = segments.length, idx, segment, r;
    
    // loop through them (yes, this comment is mostly because it looks nice in TextMate)
    for (idx = 0; idx < len; idx++) {
      // get the segment
      segment = segments[idx];
      
      // get its rectangle
      r = segment.getBoundingClientRect();
      
      // based on orientation, check the position left-to-right or up-to-down.
      if (this.get('layoutDirection') == SC.LAYOUT_VERTICAL) {
        // if it fits, return it right away
        if (pageY > r.top && pageY < r.bottom) return idx;
      }
      else {
        // if it fits, return it right away.
        if (pageX > r.left && pageX < r.right) return idx;
      }
    }
    
    // if we didn't find anything, return the old standard -1 for "not found."
    return -1;
  },
  
  keyDown: function(evt) {
    // handle tab key
    var i, item, items, len, value, isArray;
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (!this.get('allowsMultipleSelection') && !this.get('allowsEmptySelection')){
      items = this.get('displayItems');
      len = items.length;
      value = this.get('value');
      isArray = SC.isArray(value);
      if (evt.which === 39 || evt.which === 40) {  
        for(i=0; i< len-1; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
            this.triggerItemAtIndex(i+1);
          }
        }
        return YES ; // handled
      }
      else if (evt.which === 37 || evt.which === 38) {
        for(i=1; i< len; i++){
          item=items[i];
          if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
            this.triggerItemAtIndex(i-1);
          }
        }
        return YES ; // handled
      }
    }
    return YES; 
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES; // nothing to do
    var idx = this.displayItemIndexForEvent(evt);
    
    // if mouse was pressed on a button, then start detecting pressed events
    if (idx>=0) {
      this._isMouseDown = YES ;
      this.set('activeIndex', idx);
    }
    
    return YES ;
  },
  
  mouseUp: function(evt) {
    var idx = this.displayItemIndexForEvent(evt);
    // if mouse was pressed on a button then detect where we where when we
    // release and use that one.
    if (this._isMouseDown && (idx>=0)) this.triggerItemAtIndex(idx);
    
    // cleanup
    this._isMouseDown = NO ;
    this.set('activeIndex', -1);
    return YES ;
  },
  
  mouseMoved: function(evt) {
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    }
    return YES;
  },
  
  mouseExited: function(evt) {
    // if mouse was pressed down initially, start detection again
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    }
    return YES;
  },
  
  mouseEntered: function(evt) {
    // if mouse was down, hide active index
    if (this._isMouseDown) {
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', -1);
    }
    return YES ;
  },
  
  
  
  touchStart: function(touch) {
    if (!this.get('isEnabled')) return YES; // nothing to do
    var idx = this.displayItemIndexForEvent(touch);
    
    // if mouse was pressed on a button, then start detecting pressed events
    if (idx>=0) {
      this._isTouching = YES ;
      this.set('activeIndex', idx);
    }
    
    return YES ;
  },
  
  touchEnd: function(touch) {
    var idx = this.displayItemIndexForEvent(touch);
    // if mouse was pressed on a button then detect where we where when we
    // release and use that one.
    if (this._isTouching && (idx>=0)) this.triggerItemAtIndex(idx);
    
    // cleanup
    this._isTouching = NO ;
    this.set('activeIndex', -1);
    return YES ;
  },
  
  touchesDragged: function(evt, touches) {
    var isTouching = this.touchIsInBoundary(evt);

    if (isTouching) {
      if (!this._isTouching) {
        this._touchDidEnter(evt);
      }
      var idx = this.displayItemIndexForEvent(evt);
      this.set('activeIndex', idx);
    } else {
      if (this._isTouching) this._touchDidExit(evt);
    }
    
    this._isTouching = isTouching;
    
    return YES;
  },
  
  _touchDidExit: function(evt) {
    var idx = this.displayItemIndexForEvent(evt);
    this.set('activeIndex', -1);

    return YES;
  },
  
  _touchDidEnter: function(evt) {
    // if mouse was down, hide active index
    var idx = this.displayItemIndexForEvent(evt);
    this.set('activeIndex', idx);

    return YES ;
  },

  /** 
    Simulates the user clicking on the segment at the specified index. This
    will update the value if possible and fire the action.
  */
  triggerItemAtIndex: function(idx) {
    var items = this.get('displayItems'),
        item  = items.objectAt(idx),
        sel, value, val, empty, mult;
        
    if (!item[2]) return this; // nothing to do!

    empty = this.get('allowsEmptySelection');
    mult = this.get('allowsMultipleSelection');
    
    
    // get new value... bail if not enabled. Also save original for later.
    sel = item[1];
    value = val = this.get('value') ;
    if (!SC.isArray(value)) value = [value]; // force to array
    
    // if we do not allow multiple selection, either replace the current
    // selection or deselect it
    if (!mult) {
      // if we allow empty selection and the current value is the same as
      // the selected value, then deselect it.
      if (empty && (value.get('length')===1) && (value.objectAt(0)===sel)){
        value = [];
      
      // otherwise, simply replace the value.
      } else value = [sel] ;
      
    // if we do allow multiple selection, then add or remove item to the
    // array.
    } else {
      if (value.indexOf(sel) >= 0) {
        if (value.get('length')>1 || (value.objectAt(0)!==sel) || empty) {
          value = value.without(sel);
        }
      } else value = value.concat([sel]) ;
    }
    
    // normalize back to non-array form
    switch(value.get('length')) {
      case 0:
        value = null;
        break;
      case 1:
        value = value.objectAt(0);
        break;
      default:
        break;
    }
    
    // also, trigger target if needed.
    var actionKey = this.get('itemActionKey'),
        targetKey = this.get('itemTargetKey'),
        action, target = null,
        resp = this.getPath('pane.rootResponder');

    if (actionKey && (item = this.get('items').objectAt(item[6]))) {
      // get the source item from the item array.  use the index stored...
      action = item.get ? item.get(actionKey) : item[actionKey];
      if (targetKey) {
        target = item.get ? item.get(targetKey) : item[targetKey];
      }
      if (resp) resp.sendAction(action, target, this, this.get('pane'));
    }

    // Only set value if there is no action and a value is defined.
    if(!action && val !== undefined) {
      this.set('value', value);
    }
    
    // if an action/target is defined on self use that also
    action =this.get('action');
    if (action && resp) {
      resp.sendAction(action, this.get('target'), this, this.get('pane'));
    }
  },
  
  /** tied to the isEnabled state */
   acceptsFirstResponder: function() {
     if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
     else return NO;
   }.property('isEnabled'),

   willBecomeKeyResponderFrom: function(keyView) {
     // focus the text field.
     if (!this._isFocused) {
       this._isFocused = YES ;
       this.becomeFirstResponder();
       if (this.get('isVisibleInWindow')) {
         this.$()[0].focus();
       }
     }
   },
   
   willLoseKeyResponderTo: function(responder) {
     if (this._isFocused) this._isFocused = NO ;
   }
    
}) ;

// Helpers defined here to avoid creating lots of closures...
SC._segmented_fetchKeys = function(k) { return this.get(k); };
SC._segmented_fetchItem = function(k) { 
  if (!k) return null;
  return this.get ? this.get(k) : this[k]; 
};





/* >>>>>>>>>> BEGIN source/views/select.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  SelectView has a functionality similar to that of SelectField

  Clicking the SelectView button displays a menu pane with a
  list of items. The selected item will be displayed on the button.
  User has the option of enabling checkbox for the selected menu item.

  I AM CHANGING THIS AND BREAKING APIs, so I have renamed it (and put it in a more
  logical place) so that I don't break anyone else's current use of SelectButtonView...
  even though I have a suspiscion that no one uses it.
  
  @extends SC.ButtonView
  @version 1.0
  @author Alex Iskander, Mohammed Ashik
*/
sc_require('views/button');

SC.SelectView = SC.ButtonView.extend(
/** @scope SC.SelectView.prototype */ {

  /**
    An array of items that will be form the menu you want to show.

    @property
    @type {Array}
  */
  items: [],

  /**
    Binding default for an array of items

    @property
    @default SC.Binding.multiple()
  */
  itemsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each
    menu item will be pulled from the object using the named property.
    if this is null, the collection items themselves will be used.

    @property
    @type {String}
    @default: null
  */
  itemTitleKey: null,

  /**
    If you set this to a non-null value, then the value of this key will
    be used to sort the items.  If this is not set, then itemTitleKey will
    be used.

    @property
    @type: {String}
    @default: null
  */
  itemSortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of items
     as the value for the options popup.  If you don't set this, then the
     items themselves will be used as the value.

     @property
     @type {String}
     @default null
  */
  itemValueKey: null,

  /**
     Key used to extract icons from the items array
  */
  itemIconKey: null,
  
  /**
    Key to use to identify separators.
  */
  itemSeparatorKey: "separator",

  /**
    If true, the empty name will be localized.

    @property
    @type {Boolean}
    @default YES
  */
  localize: YES,

  /**
    if true, it means that no sorting will occur, items will appear
    in the same order as in the array

    @property
    @type {Boolean}
    @default YES
  */
  disableSort: YES,

  /**

    @property
    @default ['sc-select-button']
  */
  classNames: ['sc-select-view'],

  /**
    List of actual menu items, handed off to the menu view.

    @property
    @private
    @type:{Array}
  */
  _itemList: [],

  /**
    Current selected menu item

    @property
    @private
    @default null
  */
  _currentSelItem: null,

  /**
    Property to set the index of the selected menu item. This in turn
    is used to calculate the preferMatrix.

    @property
    @type {Number}
    @default null
    @private
  */
  _itemIdx: null,

  /**
     Current Value of the selectButton

     @property
     @default null
  */
  value: null ,

  /**
    if this property is set to 'YES', a checbox is shown next to the
    selected menu item.

    @private
    @default YES
  */
  showCheckbox: YES,

  /**
    Default value of the select button.
     This will be the first item from the menu item list.

    @private
  */
  _defaultVal: null,

  /**
    Default title of the select button.
     This will be the title corresponding to the _defaultVal.

    @private
  */
  _defaultTitle: null,

  /**
    Default icon of the select button.
     This will be the icon corresponding to the _defaultVal.

    @private
  */
  _defaultIcon: null,

  /**
    @private

    The button theme will be popup
  */
  theme: 'popup',

  /**
    Render method gets triggered when these properties change

    @property
    @type{SC.Array}
  */
  displayProperties: ['icon', 'value','controlSize','items'],

  /**
    Prefer matrix to position the select button menu such that the
    selected item for the menu item will appear aligned to the
    the button. The value at the second index(0) changes based on the
    postion(index) of the menu item in the menu pane.

    @property
    @type {Array}
    @default null

  */
  preferMatrix: null,

  /**
    Property to set the menu item height. This in turn is used for
    the calculation of prefMatrix.

    @property
    @type {Number}
    @default 20
  */
  CUSTOM_MENU_ITEM_HEIGHT: 20,

  /**
    Binds the button's selection state to the menu's visibility.

    @private
  */
  isSelectedBinding: '*menu.isVisibleInWindow',

  /**
    If this property is set to 'YES', the menu pane will be positioned
    below the anchor.

    @private
    @default NO
  */
  positionMenuBelow: NO,

  /**
    lastMenuWidth is the width of the last menu which was created from
    the items of this select button.

    @private
  */
  lastMenuWidth: null,

  /**
    Example view used for menu items.
  */
  exampleView: null,
  
  /**
    customView menu offset width
  */
  customViewMenuOffsetWidth: 0,

  /**
    This is a property for enabling/disabling ellipsis

    @private
    @default YES
  */
  needsEllipsis: YES,

  /**
    This property allows you at add extra padding to the height
    of the menu pane.

    @default 0
    @property {Number} heightPadding for menu pane.
  */
  menuPaneHeightPadding: 0,
  
  /**
  The amount of space to add to the calculated width of the menu item strings to
  determine the width of the menu pane.
  */
  menuItemPadding: 35,
  
  /**
    Disable context menu.
  */
  isContextMenuEnabled: NO,
  

  /**
    Left Alignment based on the size of the button

    @private
  */
  leftAlign: function() {
    var val = 0, controlSize = this.get('controlSize') ;
    
    // what. the. heck?
    // no, I don't want to shift the menu to the left. Yet.
    if(controlSize === SC.SMALL_CONTROL_SIZE) val = -14 ;
    if(controlSize === SC.REGULAR_CONTROL_SIZE) val = -16 ;
    
    return val;
  }.property('controlSize'),

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param{SC.Array} objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    if(!this.get('disableSort')){
      var nameKey = this.get('itemSortKey') || this.get('itemTitleKey') ;
      objects = objects.sort(function(a,b) {
        if (nameKey) {
          a = a.get ? a.get(nameKey) : a[nameKey] ;
          b = b.get ? b.get(nameKey) : b[nameKey] ;
        }
        return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
      }) ;
    }
    return objects ;
  },

  /**
    render method

    @private
  */
  render: function(context,firstTime) {
    arguments.callee.base.apply(this,arguments);
    var layoutWidth, items, len, nameKey, iconKey, valueKey, separatorKey, showCheckbox,
      currentSelectedVal, shouldLocalize, isSeparator, itemList, isChecked,
      idx, name, icon, value, item;

    items = this.get('items') ;
    items = this.sortObjects(items) ;
    len = items.length ;

    //Get the namekey, iconKey and valueKey set by the user
    nameKey = this.get('itemTitleKey') ;
    iconKey = this.get('itemIconKey') ;
    valueKey = this.get('itemValueKey') ;
    separatorKey = this.get('itemSeparatorKey');
    showCheckbox = this.get('showCheckbox') ;

    //get the current selected value
    currentSelectedVal = this.get('value') ;

    // get the localization flag.
    shouldLocalize = this.get('localize') ;

    //itemList array to set the menu items
    itemList = [] ;

    //to set the 'checkbox' property of menu items
    isChecked = YES ;

    //index for finding the first item in the list
    idx = 0 ;

    items.forEach(function(object) {
    if (object) {

      //Get the name value. If value key is not specified convert obj
      //to string
      name = nameKey ? (object.get ?
        object.get(nameKey) : object[nameKey]) : object.toString() ;

      // localize name if specified.
      name = shouldLocalize? name.loc() : name ;

      //Get the icon value
      icon = iconKey ? (object.get ? 
        object.get(iconKey) : object[iconKey]) : null ;
      if (SC.none(object[iconKey])) icon = null ;

      // get the value using the valueKey or the object
        value = (valueKey) ? (object.get ?
        object.get(valueKey) : object[valueKey]) : object ;

      if (!SC.none(currentSelectedVal) && !SC.none(value)){
        if( currentSelectedVal === value ) {
          this.set('title', name) ;
          this.set('icon', icon) ;
        }
      }

      //Check if the item is currentSelectedItem or not
      if(value === this.get('value')) {

        //set the _itemIdx - To change the prefMatrix accordingly.
        this.set('_itemIdx', idx) ;
        isChecked = !showCheckbox ? NO : YES ;
      }
      else {
        isChecked = NO ;
      }
      
      // get the separator
      isSeparator = separatorKey ? (object.get ? object.get(separatorKey) : object[separatorKey]) : NO;

      //Set the first item from the list as default selected item
      if (idx === 0) {
        this._defaultVal = value ;
        this._defaultTitle = name ;
        this._defaultIcon = icon ;
      }

      var item = SC.Object.create({
        separator: isSeparator,
        title: name,
        icon: icon,
        value: value,
        isEnabled: YES,
        checkbox: isChecked,
        action: this.displaySelectedItem
      }) ;

      //Set the items in the itemList array
      itemList.push(item);

    }

    idx += 1 ;

    this.set('_itemList', itemList) ;
    }, this ) ;

    if(firstTime) {
      this.invokeLast(function() {
        var value = this.get('value') ;
        if(SC.none(value)) {
          this.set('value', this._defaultVal) ;
          this.set('title', this._defaultTitle) ;
          this.set('icon', this._defaultIcon) ;
        }
      });
    }

    //Set the preference matrix for the menu pane
    this.changeSelectButtonPreferMatrix(this._itemIdx) ;

  },

  /**
    Button action handler

    @private
    @param {DOMMouseEvent} evt mouseup event that triggered the action
  */
  _action: function( evt )
  {
    var buttonLabel, menuWidth, scrollWidth, lastMenuWidth, offsetWidth,
      items, elementOffsetWidth, largestMenuWidth, item, element, idx,
      currSel, itemList, menuControlSize, menuHeightPadding, customView,
      customMenuView, menu, itemsLength;
      
    buttonLabel = this.$('.sc-button-label')[0] ;
    // Get the length of the text on the button in pixels
    menuWidth = this.get('layer').offsetWidth ;
    scrollWidth = buttonLabel.scrollWidth ;
    lastMenuWidth = this.get('lastMenuWidth') ;
    if(scrollWidth) {
       // Get the original width of the label in the button
       offsetWidth = buttonLabel.offsetWidth ;
       if(scrollWidth && offsetWidth) {
          menuWidth = menuWidth + scrollWidth - offsetWidth ;
       }
    }
    if (!lastMenuWidth || (menuWidth > lastMenuWidth)) {
      lastMenuWidth = menuWidth ;
    }

    items = this.get('_itemList') ;

    var customViewClassName = this.get('customViewClassName') ;
    var customViewMenuOffsetWidth = this.get('customViewMenuOffsetWidth') ;
    var className = 'sc-view sc-pane sc-panel sc-palette sc-picker sc-menu select-button sc-scroll-view sc-menu-scroll-view sc-container-view menuContainer sc-button-view sc-menu-item sc-regular-size' ;
    className = customViewClassName ? (className + ' ' + customViewClassName) : className ;
    
    SC.prepareStringMeasurement("", className);
    for (idx = 0, itemsLength = items.length; idx < itemsLength; ++idx) {
      //getting the width of largest menu item
      item = items.objectAt(idx) ;
      elementOffsetWidth = SC.measureString(item.title).width;

      if (!largestMenuWidth || (elementOffsetWidth > largestMenuWidth)) {
        largestMenuWidth = elementOffsetWidth ;
      }
    }
    SC.teardownStringMeasurement();

    lastMenuWidth = (largestMenuWidth + this.menuItemPadding > lastMenuWidth) ?
                      largestMenuWidth + this.menuItemPadding : lastMenuWidth ;

    // Get the window size width and compare with the lastMenuWidth.
    // If it is greater than windows width then reduce the maxwidth by 25px
    // so that the ellipsis property is enabled by default
    var maxWidth = SC.RootResponder.responder.get('currentWindowSize').width;
    if(lastMenuWidth > maxWidth) {
      lastMenuWidth = (maxWidth - 25) ;
    }

    this.set('lastMenuWidth',lastMenuWidth) ;
    currSel = this.get('_currentSelItem') ;
    itemList = this.get('_itemList') ;
    menuControlSize = this.get('controlSize') ;
    menuHeightPadding = this.get('menuPaneHeightPadding') ;

    // get the user defined custom view
    customView = this.get('exampleView') ;
    customMenuView = customView ? customView : SC.MenuItemView ;

    menu  = SC.MenuPane.create({

      /**
        Class name - select-button-item
      */
      classNames: ['select-button'],

      /**
        The menu items are set from the itemList property of SelectButton

        @property
      */
      items: itemList,

      /**
        Example view which will be used to create the Menu Items

        @default SC.MenuItemView
        @type SC.View
      */
      exampleView: customMenuView,

      /**
        This property enables all the items and makes them selectable.

        @property
      */
      isEnabled: YES,

      menuHeightPadding: menuHeightPadding,

      preferType: SC.PICKER_MENU,
      itemHeightKey: 'height',
      layout: { width: lastMenuWidth },
      controlSize: menuControlSize,
      itemWidth: lastMenuWidth,
      contentView: SC.View.extend({
      })
    }) ;

    // no menu to toggle... bail...
    if (!menu) return NO ;
    menu.popup(this, this.preferMatrix) ;
    menu.set('currentSelectedMenuItem', currSel) ;
    return YES ;
  },

  /**
     Action method for the select button menu items

  */
  displaySelectedItem: function() {
    var menuView, currSel, itemViews, title, val, itemIdx = 0, button, object,
      len, found = null, objTmp;
    
    //Get MenuPane, currentSelectedMenuItem & menuItemView
    // Get the main parent view to show the menus
      
    menuView = this.parentMenu() ;
    currSel = menuView.get('currentSelectedMenuItem') ;
    itemViews = menuView.menuItemViews ;
    
    //  Fetch the index of the current selected item
    if (currSel && itemViews) {
      itemIdx = itemViews.indexOf(currSel) ;
    }

    // Get the select button View
    button = menuView.get('anchor') ;

    // set the value and title
    object = menuView.get('items') ;
    len = object.length ;

    while (!found && (--len >= 0)) {
      objTmp = object[len];
      title = !SC.none(objTmp.title) ? objTmp.title: object.toString() ;
      val =  !SC.none(objTmp.value) ? objTmp.value: title ;

      if (title === this.get('value') && (itemIdx === len)) {
        found = object ;
        button.set('value', val) ;
        button.set('title', title) ;
      }
    }

    // set the icon, currentSelectedItem and itemIdx
    button.set('icon', this.get('icon')).set('_currentSelItem', currSel).
      set('_itemIdx', itemIdx) ;
  },

  /**
     Set the "top" attribute in the prefer matrix property which will
     position menu such that the selected item in the menu will be
     place aligned to the item on the button when menu is opened.
  */
  changeSelectButtonPreferMatrix: function() {
    var preferMatrixAttributeTop = 0 ,
      itemIdx = this.get('_itemIdx') ,
      leftAlign = this.get('leftAlign'), defPreferMatrix, tempPreferMatrix ;

    if(this.get('positionMenuBelow')) {
      defPreferMatrix = [leftAlign, 4, 3] ;
      this.set('preferMatrix', defPreferMatrix) ;
    }
    else {
      if(itemIdx) {
        preferMatrixAttributeTop = itemIdx * this.CUSTOM_MENU_ITEM_HEIGHT ;
      }
      tempPreferMatrix = [leftAlign, -preferMatrixAttributeTop, 2] ;
      this.set('preferMatrix', tempPreferMatrix) ;
    }
  },

  /**
    @private

    Holding down the button should display the menu pane.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    this.becomeFirstResponder() ;
    this._action() ;
    return YES ;
  },

  /**
    @private

    Handle Key event - Down arrow key
  */
  keyDown: function(event) {
    if ( this.interpretKeyEvents(event) ) {
      return YES;
    }
    else {
      arguments.callee.base.apply(this,arguments);
    }
  },

  /**
    @private

    Pressing the Up or Down arrow key should display the menu pane
  */
  interpretKeyEvents: function(event) {
    if (event) {
      if ((event.keyCode === 38 || event.keyCode === 40)) {
        this._action() ;
      }
      else if (event.keyCode === 27) {
        this.resignFirstResponder() ;
      }
    }
    return arguments.callee.base.apply(this,arguments);
  }

}) ;


/* >>>>>>>>>> BEGIN source/views/select_field.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  @class

  SelectFieldView displays browser-native popup menu.  To use this view,
  you should either bake into the HTML the preset list of options, or 
  you can set the -objects property to an array of items to show.  The
  value is current value of the select.
  
  @extends SC.FieldView
  @author Charles Jolley
  @author Mike Ball
  @since SproutCore 1.0
*/
SC.SelectFieldView = SC.FieldView.extend(
/** @scope SC.SelectFieldView.prototype */ {

  tagName: 'select',
  classNames: ['sc-select-field-view'],
 
  /**
    An array of items that will form the menu you want to show.
  */ 
  objects: [],
  
  /**
    Binding default for an array of objects
  */ 
  objectsBindingDefault: SC.Binding.multiple(),

  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  nameKey: null,

  /**
   If you set this to a non-null value, then the value of this key will
   be used to sort the objects.  If this is not set, then nameKey will
   be used.
  */ 
  sortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */ 
  valueKey: null,

  /**
    set this to non-null to place an empty option at the top of the menu.   
  */
  emptyName: null,

  /**
    if true, the empty name will be localized.
  */
  localize: false,
  
  /**
    if true, it means that the nameKey, valueKey or objects changed
  */
  cpDidChange: YES,
  
  /**
    if true, it means that no sorting will occur, objects will appear 
    in the same order as in the array
  */
  disableSort: NO,
  
  
  
  /**
    override this to change the enabled/disabled state of menu items as they
    are built.  Return false if you want the menu item to be disabled.
    
    @param itemValue the value for the item to validate
    @param itemName the name of the menu item to validate
    @returns YES if the item should be enabled, NO otherwise
  */  
  validateMenuItem: function(itemValue, itemName) {
    return true ;
  },

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey
    
    @param objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    if(!this.get('disableSort')){
      var nameKey = this.get('sortKey') || this.get('nameKey') ;
      if(nameKey) objects = objects.sortProperty(nameKey);
      else{
        objects = objects.sort(function(a,b) {
          if (nameKey) {
            a = a.get ? a.get(nameKey) : a[nameKey] ;
            b = b.get ? b.get(nameKey) : b[nameKey] ;
          }
          return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
        }) ;
      }
    }
    return objects ;
  },

  render: function(context, firstTime) {
    if (this.get('cpDidChange')) {
      this.set('cpDidChange', NO);
      // get list of objects.
      var nameKey = this.get('nameKey') ;
      var valueKey = this.get('valueKey') ;
      var objects = this.get('objects') ;
      var fieldValue = this.get('value') ;
      var el, selectElement;

      if ( !this.get('isEnabled') ) context.attr('disabled','disabled');
        
      // get the localization flag.
      var shouldLocalize = this.get('localize'); 
   
      // convert fieldValue to guid, if it is an object.
      if (!valueKey && fieldValue) fieldValue = SC.guidFor(fieldValue) ;
      if ((fieldValue === null) || (fieldValue === '')) fieldValue = '***' ;
    
      if (objects) {
        objects = this.sortObjects(objects) ; // sort'em.
        // var html = [] ;       
        if(!firstTime){
          selectElement=this.$input()[0];
          selectElement.innerHTML='';
        } 
      
        var emptyName = this.get('emptyName') ;
        if (emptyName) {
          if (shouldLocalize) emptyName = emptyName.loc() ;
          if(firstTime){
            context.push('<option value="***">'+emptyName+'</option>',
                          '<option disabled="disabled"></option>') ;
          }else{
            el=document.createElement('option');
            el.value="***";
            el.innerHTML=emptyName;
            selectElement.appendChild(el);
            el=document.createElement('option');
            el.disabled="disabled";
            selectElement.appendChild(el);
          }
        }
   
          // generate option elements.
        objects.forEach(function(object, index) {
        if (object) {
          // either get the name from the object or convert object to string.
          var name = nameKey ? (object.get ? object.get(nameKey) : object[nameKey]) : object.toString() ;
   
          // localize name if specified.
          if(shouldLocalize)
          {
            name = name.loc();
          }
   
          // get the value using the valueKey or the object if no valueKey.
          // then convert to a string or use _guid if one of available.
          var value = (valueKey) ? (object.get ? object.get(valueKey) : object[valueKey]) : object ;
          // if there is no emptyName and no preselected value 
          // then the value should be the value of the first element in the list
          if (!emptyName && index === 0 && fieldValue === '***') {
            this.set('value', value);
          }
          if (value) value = (SC.guidFor(value)) ? SC.guidFor(value) : value.toString() ;
   
          // render HTML
          var disable = (this.validateMenuItem && this.validateMenuItem(value, name)) ? '' : 'disabled="disabled" ' ;
          if(firstTime){
            context.push('<option '+disable+'value="'+value+'">'+name+'</option>') ;
          } else{
            el=document.createElement('option');
            el.value=value;
            el.innerHTML=name;
            if(disable.length>0) el.disable="disabled";
            selectElement.appendChild(el);
          }
        // null value means separator.
        } else {
          if(firstTime){
            context.push('<option disabled="disabled"></option>') ;
          }else{
            el=document.createElement('option');
            el.disabled="disabled";
            selectElement.appendChild(el);
          }
        }
      }, this );
   
      this.setFieldValue(fieldValue);
   
      } else {
        this.set('value',null);
      }
    }
  },
  
  displayProperties: ['objects','nameKey','valueKey','isEnabled'],

  _objectsObserver: function() {
    this.set('cpDidChange', YES);
  }.observes('objects'),

  _objectArrayObserver: function() {
    this.set('cpDidChange', YES);
    this.propertyDidChange('objects');
  }.observes('*objects.[]'),
    
  _nameKeyObserver: function() {
    this.set('cpDidChange', YES);
  }.observes('nameKey'),
   
  _valueKeyObserver: function() {
    this.set('cpDidChange', YES);
  }.observes('valueKey'),
    
  acceptsFirstResponder: function() {
    return this.get('isEnabled');
  }.property('isEnabled'),
   
  // .......................................
  // PRIVATE
  //
   
  $input: function() { return this.$(); },
   
  /* @private */
  mouseDown: function(evt) {
    
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return arguments.callee.base.apply(this,arguments);
  },
   
  // when fetching the raw value, convert back to an object if needed...
  /** @private */
  getFieldValue: function() {
    var value = arguments.callee.base.apply(this,arguments); // get raw value... 
    var valueKey = this.get('valueKey') ;
    var objects = this.get('objects') ;
    var found = null; // matching object goes here.
    var object;
    
    // Handle empty selection.
    if (value == '***') {
      value = null ;
    
    // If no value key was set and there are objects then match back to an
    // object.
    } else if (value && objects) {
      // objects = Array.from(objects) ;
      
      var loc = (SC.typeOf(objects.length) === SC.T_FUNCTION) ? objects.length() : objects.length;
      
      while(!found && (--loc >= 0)) {
        object = objects.objectAt? objects.objectAt(loc) : objects[loc] ;
        if (!object) continue; // null means placeholder; just skip
      
        // get value using valueKey if there is one or use object
        // map to _guid or toString.
        if (valueKey) object = (object.get) ? object.get(valueKey) : object[valueKey] ;
        var ov = (object) ? (SC.guidFor(object) ? SC.guidFor(object) : object.toString()) : null ;
      
        // use this object value if it matches.
        if (value == ov) found = object ;
      }
    }
    
    return (valueKey || found) ? found : value;
  },
  
  setFieldValue: function(newValue) {
    if (SC.none(newValue)) { 
      newValue = '***' ; 
    } else {
      newValue = ((newValue) ? (SC.guidFor(newValue) ? SC.guidFor(newValue) : newValue.toString()) : null );
    }
    this.$input().val(newValue);
    return this ;
  },
  
  
  
 
  
  fieldDidFocus: function() {
    var isFocused = this.get('isFocused');
    if (!isFocused) this.set('isFocused', true);
  },

  fieldDidBlur: function() {
    var isFocused = this.get('isFocused');
    if (isFocused) this.set('isFocused', false);
  },


  
  _isFocusedObserver: function() {
    this.$().setClass('focus', this.get('isFocused'));
  }.observes('isFocused'),

  didCreateLayer: function() {
    var input = this.$input();
    if (this.get('isEnabled') === false) this.$()[0].disabled = true;
    SC.Event.add(input, 'blur', this, this.fieldDidBlur);
    SC.Event.add(input, 'focus',this, this.fieldDidFocus);
    return arguments.callee.base.apply(this,arguments);
  },
  
  willDestroyLayer: function() {
    var input = this.$input();
    SC.Event.remove(input, 'focus', this, this.fieldDidFocus);
    SC.Event.remove(input, 'blur', this, this.fieldDidBlur);
    return arguments.callee.base.apply(this,arguments);
  }
 
});

/* >>>>>>>>>> BEGIN source/views/slider.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  A SliderView shows a horizontal slider control that you can use to set 
  variable values.

  You can use a slider view much like you would any other control.  Simply
  set the value or content/contentValueKey to whatever value you want to 
  display.  You can also set the maximumValue and minValue properties to 
  determine the mapping of the control to its children.
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
  @test in progress
*/
SC.SliderView = SC.View.extend(SC.Control,
/** @scope SC.SliderView.prototype */ {
  
  classNames: 'sc-slider-view',
  
  /** 
    The DOM element that displays the handle.  This element will have its
    top-left corner updated to reflect the current state of the slider.  Use
    margin-offsets to properly position your handle over this location.
  */
  handleSelector: 'img.sc-handle',
  
  /**
    Bind this to the current value of the progress bar.  Note that by default 
    an empty value will disable the progress bar and a multiple value too make 
    it indeterminate.
  */
  value: 0.50,
  valueBindingDefault: SC.Binding.single().notEmpty(),
  
  /**
    The minimum value of the progress.
  */ 
  minimum: 0,
  minimumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the minimum progress value 
    from the content object.  If this is set to null then the minimum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMinimumKey: null,
  
  /**
    The maximum value of the progress bar.
  */
  maximum: 1.0,
  maximumBindingDefault: SC.Binding.single().notEmpty(),

  /**
    Optionally specify the key used to extract the maximum progress value 
    from the content object.  If this is set to null then the maximum value
    will not be derived from the content object.
    
    @property {String}
  */
  contentMaximumKey: null,
  
  /**
    Optionally set to the minimum step size allowed.
    
    All values will be rounded to this step size when displayed.
  */
  step: 0.1,

  // ..........................................................
  // INTERNAL PROPERTIES
  // 
  
  displayProperties: 'value minimum maximum'.w(),
  
  render: function(context, firstTime) {
    arguments.callee.base.apply(this,arguments);
    
    var min = this.get('minimum'),
        max = this.get('maximum'),
        value = this.get('value'),
        step = this.get('step');

    // determine the constrained value.  Must fit within min & max
    value = Math.min(Math.max(value, min), max);

    // limit to step value
    if (!SC.none(step) && step !== 0) {
      value = Math.round(value / step) * step;
    }
    
    // determine the percent across
    if(value!==0) value = Math.floor((value - min) / (max - min) * 100);
    
    if(firstTime) {
      var blankImage = SC.BLANK_IMAGE_URL;
      context.push('<span class="sc-inner">',
                    '<span class="sc-leftcap"></span>',
                    '<span class="sc-rightcap"></span>',
                    '<img src="', blankImage, 
                    '" class="sc-handle" style="left: ', value, '%" />',
                    '</span>');
    }
    else {
      this.$(this.get('handleSelector')).css('left', value + "%");
    }
    
  },
  
  _isMouseDown: NO,
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES; // nothing to do...
    this.set('isActive', YES);
    this._isMouseDown = YES ;
    return this._triggerHandle(evt, true);
  },
  
  // mouseDragged uses same technique as mouseDown.
  mouseDragged: function(evt) { 
    return this._isMouseDown ? this._triggerHandle(evt) : YES; 
  },
  
  // remove active class
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO);
    var ret = this._isMouseDown ? this._triggerHandle(evt) : YES ;
    this._isMouseDown = NO;
    return ret ;
  },
  
  mouseWheel: function(evt) {
    if (!this.get('isEnabled')) return YES;
    var min = this.get('minimum'),
        max = this.get('maximum'),
        newVal = this.get('value')+((evt.wheelDeltaX+evt.wheelDeltaY)*0.01),
        step = this.get('step'),
        value = Math.round(newVal / step) * step ;
    if (newVal< min) this.setIfChanged('value', min);
    else if (newVal> max) this.setIfChanged('value', max);
    else this.setIfChanged('value', newVal);
    return YES ;  
  },
  
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchesDragged: function(evt){
    return this.mouseDragged(evt);
  },
  
  /** @private
    Updates the handle based on the mouse location of the handle in the
    event.
  */
  _triggerHandle: function(evt, firstEvent) {
    var width = this.get('frame').width,
        min = this.get('minimum'), max=this.get('maximum'),  
        step = this.get('step'), v=this.get('value'), loc;
        
    if(firstEvent){    
      loc = this.convertFrameFromView({ x: evt.pageX }).x;
      this._evtDiff = evt.pageX - loc;
    }else{
      loc = evt.pageX-this._evtDiff;
    }
    
    // constrain loc to 8px on either side (left to allow knob overhang)
    loc = Math.max(Math.min(loc,width-8), 8) - 8;
    width -= 16 ; // reduce by margin
    
    // convert to percentage
    loc = loc / width ;
    
    // convert to value using minimum/maximum then constrain to steps
    loc = min + ((max-min)*loc);
    if (step !== 0) loc = Math.round(loc / step) * step ;

    // if changes by more than a rounding amount, set v.
    if (Math.abs(v-loc)>=0.01) this.set('value', loc); // adjust 
    return YES ;
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  },
  
  keyDown: function(evt) {

     // handle tab key
     if (evt.which === 9) {
       var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
       if(view) view.becomeFirstResponder();
       else evt.allowDefault(); 
       return YES ; // handled
     }
     
     if (evt.which === 37 || evt.which === 38 || evt.which === 39 || evt.which === 40){
       var min = this.get('minimum'),max=this.get('maximum'),
          step = this.get('step'),
          size = max-min, val=0, calculateStep;
     
       if (evt.which === 37 || evt.which === 38 ){
         if(step === 0){
           if(size<100){
             val = this.get('value')-1;
           }else{
             calculateStep = Math.abs(size/100);
             if(calculateStep<2) calculateStep =2;
             val = this.get('value')-Math.abs(size/100);
           }
         }else{
           val = this.get('value')-step;
         }
       }
       if (evt.which === 39 || evt.which === 40 ){
           if(step === 0){
              if(size<100){
                val = this.get('value') + 2;
              }else{
                calculateStep = Math.abs(size/100);
                if(calculateStep<2) calculateStep =2;
                val = this.get('value')+calculateStep;
              }
            }else{
              val = this.get('value')+step;
            }       
       }
       if(val>=min && val<=max) this.set('value', val);
     }
     //handle arrows

     // validate keyDown...
     // if (this.performValidateKeyDown(evt)) {
     //    this._isKeyDown = YES ;
     //    evt.allowDefault(); 
     //  } else {
     //    evt.stop();
     //  }
     SC.RunLoop.begin().end();
     return YES; 
   },

  contentPropertyDidChange: function(target, key) {
    var content = this.get('content');
    this.beginPropertyChanges()
      .updatePropertyFromContent('value', key, 'contentValueKey', content)
      .updatePropertyFromContent('minimum', key, 'contentMinimumKey', content)
      .updatePropertyFromContent('maximum', key, 'contentMaximumKey', content)
      .updatePropertyFromContent('isIndeterminate', key, 'contentIsIndeterminateKey', content)
    .endPropertyChanges();
  }  
  
});

/* >>>>>>>>>> BEGIN source/views/source_list_group.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/collection_group');
sc_require('views/disclosure');

/**
  @class
  
  Displays a group view in a source list.  Handles displaying a disclosure
  triangle which can be used to show/hide children.
  
  @extends SC.View
  @extends SC.Control
  @author Charles Jolley
  @author Erich Ocean
  @version 1.0
  @since 0.9
*/

SC.SourceListGroupView = SC.View.extend(SC.Control, SC.CollectionGroup,
/** @scope SC.SourceListGroupView.prototoype */ {
  
  classNames: ['sc-source-list-group'],
  
  // ..........................................................
  // KEY PROPERTIES
  // 
  
  /**
    The content object the source list group will display.
    
    @type SC.Object
  */
  content: null,
  
  /**
    The current group visibility.  Used by the source list to determine the 
    layout size of the group.
    
    @type Boolean
  */
  isGroupVisible: YES,
  
  /** 
    YES if group is showing its titlebar.
    
    Group views will typically hide their header if the content is set to 
    null.  You can also override this method to always hide the header if 
    you want and the SourceListView will not leave room for it.
    
    @type Boolean
  */
  hasGroupTitle: YES,
  
  /**
    The content property key to use as the group view's title.
    
    @type String
  */
  groupTitleKey: null,
  
  /**
    The content property key to use to determine if the group's children are 
    visible or not.
    
    @type String
  */
  groupVisibleKey: null,
  
  render: function(context, firstTime) {
    context.push('<div role="button" class="sc-source-list-label sc-disclosure-view sc-button-view button disclosure no-disclosure">',
              '<img src="'+SC.BLANK_IMAGE_URL+'" class="button" />',
              '<span class="label"></span></div>') ;
  },
  
  /** @private */
  createChildViews: function() {
    
  },
  
  /** @private */
  contentPropertyDidChange: function(target, key) {
    var content = this.get('content') ;
    var labelView = this.outlet('labelView') ;
    
    // hide labelView if content is null.
    if (content === null) {
      labelView.setIfChanged('isVisible', NO) ;
      this.setIfChanged('hasGroupTitle', NO) ;
      return ;
    } else {
      labelView.setIfChanged('isVisible', YES) ;
      this.setIfChanged('hasGroupTitle', YES) ;
    }
    
   // set the title if that changed.
    var groupTitleKey = this.getDelegateProperty('groupTitleKey', this.displayDelegate) ;
    if ((key == '*') || (groupTitleKey && (key == groupTitleKey))) {
      var title = (content && content.get && groupTitleKey) ? content.get(groupTitleKey) : content;
      if (title != this._title) {
        this._title = title ;
        if (title) title = title.capitalize() ;
        labelView.set('title', title) ;
      }
    }
    
    // set the group visibility if changed
    var groupVisibleKey = this.getDelegateProperty('groupVisibleKey', this.displayDelegate) ;
    if ((key == '*') || (groupVisibleKey && (key == groupVisibleKey))) {
      if (groupVisibleKey) {
        labelView.removeClassName('no-disclosure') ;
        
        var isVisible = (content && content.get) ?
          !!content.get(groupVisibleKey) :
          YES ;
        if (isVisible != this.get('isGroupVisible')) {
          this.set('isGroupVisible', isVisible) ;
          labelView.set('value', isVisible) ;
        }
      } else labelView.addClassName('no-disclosure') ;
    }
  },
  
  /** @private
    Called when the user clicks on the disclosure triangle
  */
  disclosureValueDidChange: function(newValue) {
    if (newValue == this.get('isGroupVisible')) return; // nothing to do
    
    // update group if necessary
    var group = this.get('content') ;
    var groupVisibleKey = this.getDelegateProperty('groupVisibleKey', this.displayDelegate) ;
    if (group && group.set && groupVisibleKey) {
      group.set(groupVisibleKey, newValue) ;
    }
    
    // update my own value and then update my collection view.
    this.set('isGroupVisible', newValue) ;
    if (this.owner && this.owner.updateChildren) this.owner.updateChildren(true) ;
    
  },
  
  /** @private */
  labelView: SC.DisclosureView.extend({
    
    /** 
      Always default to open disclosures.
      
      @type Boolean
    */
    value: YES,
    
    /** @private
      If the disclosure value changes, call the owner's method.  Note
      normally you would do this with a binding, but since this is a semi-
      private class anyway, there is no reason to go to all that trouble.
    */
    _valueObserver: function() {
      if (this.owner) this.owner.disclosureValueDidChange(this.get('value')) ;
    }.observes('value')
    
  })
  
});

/* >>>>>>>>>> BEGIN source/views/source_list.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/list') ;
sc_require('views/source_list_group');

SC.BENCHMARK_SOURCE_LIST_VIEW = YES ;

/** @class
  
  Displays a source list like the source list in iTunes.  SourceList views
  are very similar to ListView's but come preconfigured with the correct
  appearance and default behaviors of a source list.
  
  @extends SC.ListView
  @since SproutCore 1.0
*/
SC.SourceListView = SC.ListView.extend(
/** @scope SC.SourceListView.prototype */ {

  /**
    Add class name to HTML for styling.
  */
  classNames: ['sc-source-list'],
  
  /**
    Default row height for source list items is larger.
  */
  rowHeight: 32,

  /**
    By default source lists should not select on mouse down since you will
    often want to drag an item instead of selecting it.
  */
  selectOnMouseDown: NO,
  
  /**
    By default, SourceListView's trigger any action you set whenever the user
    clicks on an item.  This gives the SourceList a "menu" like behavior.
  */
  actOnSelect: YES

});

/* >>>>>>>>>> BEGIN source/views/split.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.RESIZE_BOTH = 'resize-both';
SC.RESIZE_TOP_LEFT = 'resize-top-left';
SC.RESIZE_BOTTOM_RIGHT = 'resize-bottom-right';

/**
  @class
  
  A split view is used to show views that the user can resize or collapse.
  To use a split view you need to set a topLeftView, a bottomRightView and,
  optionally, a splitDividerView.  You can also set various other properties
  to control the minimum and maximum thickness allowed for the flexible views.
  
  h2. Example
  
  {{{
    SC.SplitView.design({
      
      // the left view...
      topLeftView: SC.View.design({
        // view contents
      }),
      
      // the right view
      bottomRightView: SC.View.design({
        // view contents
      })
      
    })
  }}}
  
  When the user clicks and drags on a split divider view, it will
  automatically resize the views immediately before and after the split
  divider view. You can constrain the resizing allowed by the split view
  either by setting a minThickness and maxThickness property on the views
  themselves or by implementing the method splitViewConstrainThickness on
  a delegate object.
  
  In addition to resizing views, users can also collapse views by double
  clicking on a split divider view.  When a view is collapsed, it's isVisible
  property is set to NO and its space it removed from the view.  Double
  clicking on a divider again will restore a collapsed view.  A user can also
  start to drag the divider to show the collapsed view.
  
  You can programmatically control collapsing behavior using various 
  properties on either the split view or its child views, and/or by 
  implementing the method splitViewCanCollapse on a delegate object.
  
  Finally, SplitViews can layout their child views either horizontally or
  vertically.  To choose the direction of layout set the layoutDirection
  property on the view (or the :direction option with the view helper).
  This property should be set when the view is created. Changing it
  dynamically will have an unknown effect.
  
  @property {Boolean} layoutDirection Either SC.HORIZONTAL or SC.VERTICAL.
  Defaults to SC.HORIZONTAL. Use the :direction option with the split_view
  viewhelper.
  
  @property {Boolean} canCollapseViews Set to NO when you don't want any of
  the child views to collapse. Defaults to YES. 
  
  In addition, the top/left and bottom/right child views can have these
  properties:
  
  @extends SC.View
  @since SproutCore 1.0
  
  @author Charles Jolley
  @author Lawrence Pit
  @author Erich Ocean
*/
SC.SplitView = SC.View.extend(
/** @scope SC.SplitView.prototype */ {
  
  classNames: ['sc-split-view'],
  
  displayProperties: ['layoutDirection'],
  
  /**
    delegate for controlling split view behavior.
  */
  delegate: null,
  
  /**
    Direction of layout.  Must be SC.LAYOUT_HORIZONTAL or SC.LAYOUT_VERTICAL.
    
    @property {String}
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  /**
    Set to NO to disable collapsing for all views.
  */
  canCollapseViews: YES,
  
  /*
    Configure which view(s) you want to autoresize when this split view's 
    layout changes.  Possible options are:
    
    | SC.RESIZE_BOTTOM_RIGHT | (default) resizes bottomRightView |
    | SC.RESIZE_TOP_LEFT | resized topLeftView |
    
  */
  autoresizeBehavior: SC.RESIZE_BOTTOM_RIGHT,
  
  /**
    Specifies how much space the fixed view should use when the view is setup.
    A number less than one will be treated as a percentage, while a number 
    greater than one will be treated as a pixel width.
    
    The thickness will be applied to the opposite view defined by 
    autoresizeBehavior.
    
    @property {Number}
  */
  defaultThickness: 0.5,
  
  /**
    Yes, we're a split view.
  */
  isSplitView: YES,
  
  // add default views
  topLeftView: SC.View,
  dividerView: SC.SplitDividerView,
  bottomRightView: SC.View,
  
  /**
    The current thickness for the topLeftView
  */
  topLeftThickness: function() {
    var view = this.get('topLeftView');
    return view ? this.thicknessForView(view) : 0;
  }.property('topLeftView').cacheable(),

  /**
    The current thickness for the bottomRightView
  */
  bottomRightThickness: function() {
    var view = this.get('bottomRightView');
    return view ? this.thicknessForView(view) : 0;
  }.property('bottomRightView').cacheable(),
  
  /**
    @property {SC.Cursor} the cursor thumb view should use for themselves
  */
  thumbViewCursor: null,
  
  /**
    Used by split divider to decide if the view can be collapsed.
  */
  canCollapseView: function(view) {
    return this.invokeDelegateMethod(this.delegate, 'splitViewCanCollapse', 
      this, view) ;
  },
  
  /**
    Returns the thickness for a given view.
    
    @param {SC.View} view the view to get.
    @returns the view with the width.
  */
  thicknessForView: function(view) {
    var direction = this.get('layoutDirection') ,
        ret = view.get('frame') ;
    return (direction === SC.LAYOUT_HORIZONTAL) ? ret.width : ret.height ;
  },
  
  createChildViews: function() {
    var childViews = [] ,
        viewAry = ['topLeftView', 'dividerView', 'bottomRightView'] ,
        view, idx, len ;
    
    for (idx=0, len=viewAry.length; idx<len; ++idx) {
      if (view = this.get(viewAry[idx])) {
        view = this[viewAry[idx]] = this.createChildView(view, {
          layoutView: this,
          rootElementPath: [idx]
        }) ;
        childViews.push(view) ;
      }
    }
    
    this.set('childViews', childViews) ;
    return this ; 
  },
  
  /**
    Layout the views.
    
    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will set up the views so
    that they can resize appropriately.
  */
  updateChildLayout: function() {
    var topLeftView = this.get('topLeftView') ,
        bottomRightView = this.get('bottomRightView') ,
        dividerView = this.get('dividerView') ,
        direction = this.get('layoutDirection') ,
        topLeftThickness = this._desiredTopLeftThickness ;
    var dividerThickness = this.get('dividerThickness') ;
        dividerThickness = (!SC.none(dividerThickness)) ? dividerThickness : 7 ;
    var splitViewThickness = (direction === SC.LAYOUT_HORIZONTAL) ? this.get('frame').width : this.get('frame').height ,
        bottomRightThickness = splitViewThickness - dividerThickness - topLeftThickness ,
        autoresizeBehavior = this.get('autoresizeBehavior') ,
        layout , isCollapsed ;
    
    
    // top/left view
    isCollapsed = topLeftView.get('isCollapsed') || NO ;
    topLeftView.setIfChanged('isVisible', !isCollapsed) ;
    layout = SC.clone(topLeftView.get('layout'));
    if (direction === SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.left = 0 ;
      layout.bottom = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.right = bottomRightThickness + dividerThickness ;
          delete layout.width ;
          break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          delete layout.right ;
          delete layout.height ;
          layout.width = topLeftThickness ;
          break ;
      }
    } else {
      layout.top = 0;
      layout.left = 0 ;
      layout.right = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.bottom = bottomRightThickness + dividerThickness ;
          delete layout.height ;
          break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          delete layout.bottom ;
          delete layout.width ;
          layout.height = topLeftThickness ;
          break ;
      }
    }
    topLeftView.set('layout', layout);
    
    // split divider view
    if (dividerView) {
      layout = SC.clone(dividerView.get('layout'));
      if (direction === SC.LAYOUT_HORIZONTAL) {
        layout.width = dividerThickness;
        delete layout.height ;
        layout.top = 0 ;
        layout.bottom = 0 ;
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.left ;
            // delete layout.right ;
            // layout.centerX = topLeftThickness + (dividerThickness / 2) ;
            // delete layout.centerY ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            delete layout.left ;
            layout.right = bottomRightThickness ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.left = topLeftThickness ;
            delete layout.right ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
        }
      } else {
        delete layout.width ;
        layout.height = dividerThickness ;
        layout.left = 0 ;
        layout.right = 0 ;
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.top ;
            // delete layout.bottom ;
            // delete layout.centerX ;
            // layout.centerY = topLeftThickness + (dividerThickness / 2) ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            delete layout.top ;
            layout.bottom = bottomRightThickness ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.top = topLeftThickness ;
            delete layout.bottom ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
        }
      }
      dividerView.set('layout', layout);
    }
    
    // bottom/right view
    isCollapsed = bottomRightView.get('isCollapsed') || NO ;
    bottomRightView.setIfChanged('isVisible', !isCollapsed) ;
    layout = SC.clone(bottomRightView.get('layout'));
    if (direction === SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.bottom = 0 ;
      layout.right = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          //break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.left = topLeftThickness + dividerThickness ;
          delete layout.width ;
          break ;
        case SC.RESIZE_TOP_LEFT:
          delete layout.left ;
          layout.width = bottomRightThickness ;
          break ;
      }
    } else {
      layout.left = 0 ;
      layout.right = 0 ;
      layout.bottom = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          //break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.top = topLeftThickness + dividerThickness ;
          delete layout.height ;
          break ;
        case SC.RESIZE_TOP_LEFT:
          delete layout.top ;
          layout.height = bottomRightThickness ;
          break ;
      }
    }
    bottomRightView.set('layout', layout);
    
    this.notifyPropertyChange('topLeftThickness')
        .notifyPropertyChange('bottomRightThickness');
  },
  
  /** @private */
  renderLayout: function(context, firstTime) {
    if (firstTime || this._recalculateDivider) {
      if (!this.get('thumbViewCursor')) {
        this.set('thumbViewCursor', SC.Cursor.create()) ;
      }
      
      var layoutDirection = this.get('layoutDirection') ,
          fr = this.get('frame'),
          splitViewThickness, elemRendered = this.$(),
          desiredThickness = this.get('defaultThickness') ,
          autoResizeBehavior = this.get('autoresizeBehavior') ;
      var dividerThickness = this.get('dividerThickness') ;
      dividerThickness = (!SC.none(dividerThickness)) ? dividerThickness : 7 ;
      // Turn a flag on to recalculate the spliting if the desired thickness
      // is a percentage
      if(this._recalculateDivider===undefined && desiredThickness<1) {
        this._recalculateDivider=YES;
      }
      else if(this._recalculateDivider) this._recalculateDivider=NO;
      
      
      if(elemRendered[0]) {
        splitViewThickness = (layoutDirection === SC.LAYOUT_HORIZONTAL) ? 
              elemRendered[0].offsetWidth : elemRendered[0].offsetHeight ;
      }else{
        splitViewThickness = (layoutDirection === SC.LAYOUT_HORIZONTAL) ? 
              fr.width : fr.height ;
      }
      // if default thickness is < 1, convert from percentage to absolute
      if (SC.none(desiredThickness) || 
        (desiredThickness > 0 && desiredThickness < 1)) {
        desiredThickness =  Math.floor((splitViewThickness - 
                            (dividerThickness))* (desiredThickness || 0.5)) ;
      }
      if (autoResizeBehavior === SC.RESIZE_BOTTOM_RIGHT) {
        this._desiredTopLeftThickness = desiredThickness ;
      } else { // (autoResizeBehavior === SC.RESIZE_TOP_LEFT)
        this._desiredTopLeftThickness =  splitViewThickness 
                                      - dividerThickness - desiredThickness ;
      }
      
      // make sure we don't exceed our min and max values, and that collapse 
      // settings are respected
      // cached values are required by _updateTopLeftThickness() below...
      this._topLeftView = this.get('topLeftView') ;
      this._bottomRightView = this.get('bottomRightView') ;
      this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
      this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
      this._dividerThickness = this.get('dividerThickness') ;
      this._layoutDirection = this.get('layoutDirection') ;
      
      // this handles min-max settings and collapse parameters
      this._updateTopLeftThickness(0) ;
      
      // update the cursor used by thumb views
      this._setCursorStyle() ;
      
      // actually set layout for our child views
      this.updateChildLayout() ;
    }
    arguments.callee.base.apply(this,arguments) ;
  },
  
  /** @private */
  render: function(context, firstTime) {
    arguments.callee.base.apply(this,arguments) ;
    
    if (this._inLiveResize) this._setCursorStyle() ;
    
    var dir = this.get('layoutDirection') ;
    if (dir===SC.LAYOUT_HORIZONTAL) context.addClass('sc-horizontal') ;
    else context.addClass('sc-vertical') ;
  },
  
  /**
    Update the split view's layout based on mouse movement.
    
    Call this method in the mouseDown: method of your thumb view. The split view
    will begin tracking the mouse and will update its own layout to reflect the movement 
    of the mouse. As a result, the position of your thumb view will also be updated.
    
    @returns {Boolean}
  */
  mouseDownInThumbView: function(evt, thumbView) {
    var responder = this.getPath('pane.rootResponder') ;
    if (!responder) return NO ; // nothing to do
      
    // we're not the source view of the mouseDown:, so we need to capture events manually to receive them
    responder.dragDidStart(this) ;
    
    // cache for later
    this._mouseDownX = evt.pageX ;
    this._mouseDownY = evt.pageY ;
    this._thumbView = thumbView ;
    this._topLeftView = this.get('topLeftView') ;
    this._bottomRightView = this.get('bottomRightView') ;
    this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
    this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
    this._dividerThickness = this.get('dividerThickness') ;
    this._layoutDirection = this.get('layoutDirection') ;
    
    this.beginLiveResize() ;
    this._inLiveResize = YES ;
    
    return YES ;
  },
  
  mouseDragged: function(evt) {
    var offset = (this._layoutDirection === SC.LAYOUT_HORIZONTAL) ? evt.pageX 
                - this._mouseDownX : evt.pageY - this._mouseDownY ;
    this._updateTopLeftThickness(offset) ;
    return YES;
  },
  
  mouseUp: function(evt) {
    if (this._inLiveResize === YES) {
    	this._thumbView = null ; // avoid memory leaks
    	this._inLiveResize = NO ;
    	this.endLiveResize() ;
    	return YES ;
		}
		
		return NO ;
  },
  
  touchesDragged: function(evt){
    return this.mouseDragged(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  
  doubleClickInThumbView: function(evt, thumbView) {
    var view = this._topLeftView,
        isCollapsed = view.get('isCollapsed') || NO ;
    if (!isCollapsed && !this.canCollapseView(view)) {
      view = this._bottomRightView ;
      isCollapsed = view.get('isCollapsed') || NO ;
      if (!isCollapsed && !this.canCollapseView(view)) return NO;
    }
    
    if (!isCollapsed) {
      // remember thickness in it's uncollapsed state
      this._uncollapsedThickness = this.thicknessForView(view)  ;
      // and collapse
      // this.setThicknessForView(view, 0) ;
      if (view === this._topLeftView) {
        this._updateTopLeftThickness(this.topLeftThickness()*-1) ;
      } else {
        this._updateBottomRightThickness(this.bottomRightThickness()*-1) ;
      }
      
      // if however the splitview decided not to collapse, clear:
      if (!view.get("isCollapsed")) {
        this._uncollapsedThickness = null;
      }
    } else {
      // uncollapse to the last thickness in it's uncollapsed state
      if (view === this._topLeftView) {
        this._updateTopLeftThickness(this._uncollapsedThickness) ;
      } else {
        this._updateBottomRightThickness(this._uncollapsedThickness) ;
      }
      view._uncollapsedThickness = null ;
    }
    this._setCursorStyle() ;
    return true ;
  },
  
  /** @private */
  _updateTopLeftThickness: function(offset) {
    var topLeftView = this._topLeftView ,
        bottomRightView = this._bottomRightView,
        // the current thickness, not the original thickness
        topLeftViewThickness = this.thicknessForView(topLeftView), 
        bottomRightViewThickness = this.thicknessForView(bottomRightView),
        minAvailable = this._dividerThickness ,
        maxAvailable = 0,
        proposedThickness = this._topLeftViewThickness + offset,
        direction = this._layoutDirection,
        bottomRightCanCollapse = this.canCollapseView(bottomRightView),
        thickness = proposedThickness,
        // constrain to thickness set on top/left
        max = this.get('topLeftMaxThickness'),
        min = this.get('topLeftMinThickness'),
        bottomRightThickness, tlCollapseAtThickness, brCollapseAtThickness;
    
    if (!topLeftView.get("isCollapsed")) {
      maxAvailable += topLeftViewThickness ;
    }
    if (!bottomRightView.get("isCollapsed")) {
      maxAvailable += bottomRightViewThickness ;
    }
    
    if (!SC.none(max)) thickness = Math.min(max, thickness) ;
    if (!SC.none(min)) thickness = Math.max(min, thickness) ;
    
    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness') ;
    min = this.get('bottomRightMinThickness') ;
    bottomRightThickness = maxAvailable - thickness ;
    if (!SC.none(max)) {
      bottomRightThickness = Math.min(max, bottomRightThickness) ;
    }
    if (!SC.none(min)) {
      bottomRightThickness = Math.max(min, bottomRightThickness) ;
    }
    thickness = maxAvailable - bottomRightThickness ;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 
      'splitViewConstrainThickness', this, topLeftView, thickness) ;
    
    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable) ;
    
    // cannot be less than zero
    thickness = Math.max(0, thickness) ;
    
    tlCollapseAtThickness = topLeftView.get('collapseAtThickness') ;
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0 ;
    brCollapseAtThickness = bottomRightView.get('collapseAtThickness') ;
    brCollapseAtThickness = SC.none(brCollapseAtThickness) ?
                      maxAvailable : (maxAvailable - brCollapseAtThickness);
    
    if ((proposedThickness <= tlCollapseAtThickness) && 
          this.canCollapseView(topLeftView)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = bottomRightView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0 ;
      }
    } else if (proposedThickness >= brCollapseAtThickness && 
              this.canCollapseView(bottomRightView)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = topLeftView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }
    
    // now apply constrained value
    if (thickness != this.thicknessForView(topLeftView)) {
      this._desiredTopLeftThickness = thickness ;
      
      // un-collapse if needed.
      topLeftView.set('isCollapsed', thickness === 0) ;
      bottomRightView.set('isCollapsed', thickness >= maxAvailable) ;
      
      this.updateChildLayout(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },
  
  
  _updateBottomRightThickness: function(offset) {
    var topLeftView = this._topLeftView ,
        bottomRightView = this._bottomRightView,
        topLeftViewThickness = this.thicknessForView(topLeftView), // the current thickness, not the original thickness
        bottomRightViewThickness = this.thicknessForView(bottomRightView),
        minAvailable = this._dividerThickness ,
        maxAvailable = 0,
        proposedThickness = this._topLeftViewThickness + offset,
        direction = this._layoutDirection,
        bottomRightCanCollapse = this.canCollapseView(bottomRightView),
        thickness = proposedThickness,
        // constrain to thickness set on top/left
        max = this.get('topLeftMaxThickness'),
        min = this.get('topLeftMinThickness'),
        bottomRightThickness, tlCollapseAtThickness, brCollapseAtThickness;
    
    if (!topLeftView.get("isCollapsed")) maxAvailable += topLeftViewThickness ;
    if (!bottomRightView.get("isCollapsed")) maxAvailable += bottomRightViewThickness ;
    
    if (!SC.none(max)) thickness = Math.min(max, thickness) ;
    if (!SC.none(min)) thickness = Math.max(min, thickness) ;
    
    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness') ;
    min = this.get('bottomRightMinThickness') ;
    bottomRightThickness = maxAvailable - thickness ;
    if (!SC.none(max)) bottomRightThickness = Math.min(max, bottomRightThickness) ;
    if (!SC.none(min)) bottomRightThickness = Math.max(min, bottomRightThickness) ;
    thickness = maxAvailable - bottomRightThickness ;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainThickness', this, topLeftView, thickness) ;
    
    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable) ;
    
    // cannot be less than zero
    thickness = Math.max(0, thickness) ;
    
    tlCollapseAtThickness = topLeftView.get('collapseAtThickness') ;
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0 ;
    brCollapseAtThickness = bottomRightView.get('collapseAtThickness') ;
    brCollapseAtThickness = SC.none(brCollapseAtThickness) ? maxAvailable : (maxAvailable - brCollapseAtThickness);
    
    if ((proposedThickness <= tlCollapseAtThickness) && this.canCollapseView(topLeftView)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = bottomRightView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0 ;
      }
    } else if (proposedThickness >= brCollapseAtThickness && this.canCollapseView(bottomRightView)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = topLeftView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }
    
    // now apply constrained value
    if (thickness != this.thicknessForView(topLeftView)) {
      this._desiredTopLeftThickness = thickness ;
      
      // un-collapse if needed.
      topLeftView.set('isCollapsed', thickness === 0) ;
      bottomRightView.set('isCollapsed', thickness >= maxAvailable) ;
      
      this.updateChildLayout(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },
  
  /** 
    This observes 'layoutDirection' to update the cursor style immediately
    after the value of the layoutDirection of Split view is changed

    @private 
  */
  _setCursorStyle: function() {
    var topLeftView = this._topLeftView,
        bottomRightView = this._bottomRightView,
        thumbViewCursor = this.get('thumbViewCursor'),
        // updates the cursor of the thumb view that called 
        // mouseDownInThumbView() to reflect the status of the drag
        tlThickness = this.thicknessForView(topLeftView),
        brThickness = this.thicknessForView(bottomRightView);
    this._layoutDirection = this.get('layoutDirection') ;
    if (topLeftView.get('isCollapsed') || 
      tlThickness === this.get("topLeftMinThickness") || 
      brThickness == this.get("bottomRightMaxThickness")) {
      thumbViewCursor.set('cursorStyle', 
        this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "e-resize" : "s-resize") ;
    } else if (bottomRightView.get('isCollapsed') || 
      tlThickness === this.get("topLeftMaxThickness") || 
      brThickness == this.get("bottomRightMinThickness")) {
      thumbViewCursor.set('cursorStyle', 
        this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "w-resize" : "n-resize") ;
    } else {
      if(SC.browser.msie) {
        thumbViewCursor.set('cursorStyle', 
          this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "e-resize" : "n-resize") ;
      }
      else {
        thumbViewCursor.set('cursorStyle', 
          this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "ew-resize" : "ns-resize") ;
      }
    }
  }.observes('layoutDirection'),
  
  /**
    (DELEGATE) Control whether a view can be collapsed.
    
    The default implemention returns NO if the split view property
    canCollapseViews is set to NO or when the given view has
    property canCollapse set to NO, otherwise it returns YES.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view we want to collapse.
    @returns {Boolean} YES to allow collapse.
  */
  splitViewCanCollapse: function(splitView, view) {
    if (splitView.get('canCollapseViews') === NO) return NO ;
    if (view.get('canCollapse') === NO) return NO ;
    return YES ;
  },
  
  /**
    (DELEGATE) Constrain a views allowed thickness.
    
    The default implementation allows any thickness.  The view will
    automatically constrain the view to not allow views to overflow the
    visible area.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view in question
    @param {Number} proposedThickness the proposed thickness.
    @returns the allowed thickness
  */
  splitViewConstrainThickness: function(splitView, view, proposedThickness) {
    return proposedThickness;
  },
  
  /* Force to rendering once the pane is attached */
  _forceSplitCalculation: function(){
    this.updateLayout(); 
  }.observes('*pane.isPaneAttached'),

  /**
    This method is invoked on the split view when the view resizes due to a layout
    change or due to the parent view resizing. It forces an update on topLeft and
    bottomRight thickness.

    @returns {void}
  */
  viewDidResize: function() {
     arguments.callee.base.apply(this,arguments);
     this.notifyPropertyChange('topLeftThickness')
         .notifyPropertyChange('bottomRightThickness');
   }.observes('layout')

});

/* >>>>>>>>>> BEGIN source/views/split_divider.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/split');

/**
  @class

  A SplitDividerView displays a divider between two views within a SplitView.
  Clicking and dragging the divider will change the thickness of each view
  either to the top/left or bottom/right of the divider.

  Double-clicking on the SplitDividerView will try to collapse the first
  view within the SplitView that has property canCollapse set to true,
  so it is not visible, unless you have canCollapse disabled on the SplitView.

  This view must be a direct child of the split view it works with. It must
  be surrounded by two other views.

  @extends SC.View

  @author Charles Jolley
  @author Lawrence Pit
  @author Erich Ocean
  @test in split
*/
SC.SplitDividerView = SC.View.extend(
/** @scope SC.SplitDividerView.prototype */ {

  classNames: ['sc-split-divider-view'],
  
  /** @private */
  prepareContext: function(context, firstTime) {
    var splitView = this.get('splitView') ;
    if (splitView) this.set('cursor', splitView.get('thumbViewCursor')) ;
    return arguments.callee.base.apply(this,arguments) ;
  },
  
  mouseDown: function(evt) {
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : arguments.callee.base.apply(this,arguments);
  },
  
  doubleClick: function(evt) {
    var splitView = this.get('splitView');
    return (splitView) ? splitView.doubleClickInThumbView(evt, this) : arguments.callee.base.apply(this,arguments);
  },
  
  touchStart: function(evt){
    return this.mouseDown(evt);
  }
  
});

/* >>>>>>>>>> BEGIN source/views/stacked.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/collection') ;

/**
  @class 

  A StackedView is a CollectionView that expects its content to use static 
  layout to stack vertically.  This type of collection view is not designed 
  for use with large size collections, but it can be very useful for 
  collections with complex displays and variable heights such as comments or
  small notification queues.
  
  h2. Static Layout
  
  This view makes no attempt to size or position your child views.  It assumes
  you are using StaticLayout for your child views.  If you don't enable static
  layout your views will probably overlay on top of eachother and will look 
  incorrect.

  Note also that the default layout for this view set's the height to "auto".
  This is usually the behavior you will want. 
  
  @extends SC.CollectionView
  @since SproutCore 0.9
*/
SC.StackedView = SC.CollectionView.extend( 
/** SC.StackedView.prototype */ {
  
  classNames: ['sc-stacked-view'],
  
  /** 
    Default layout for a stacked view will fill the parent view but auto-
    adjust the height of the view.
  */
  layout: { top: 0, left: 0, right: 0, height: 1 },
  
  /**
    Return full range of its indexes for nowShowing
    
    @returns {SC.IndexSet} full range of indexes
  */
  computeNowShowing: function(rect) {
    return this.get('allContentIndexes');
  },  

  /**
    Updates the height of the stacked view to reflect the current content of 
    the view.  This is called automatically whenever an item view is reloaded.
    You can also call this method directly if the height of one of your views
    has changed.
    
    The height will be recomputed based on the actual location and dimensions
    of the last child view.
    
    Note that normally this method will defer actually updating the height
    of the view until the end of the run loop.  You can force an immediate 
    update by passing YES to the "immediately" parameter.
    
    @param {Boolean} immediately YES to update immedately
    @returns {SC.StackedView} receiver
  */
  updateHeight: function(immediately) {
    if (immediately) this._updateHeight();
    else this.invokeLast(this._updateHeight);
    // ^ use invokeLast() here because we need to wait until all rendering has 
    //   completed.
    
    return this;
  },
  
  _updateHeight: function() {
    
    var childViews = this.get('childViews'),
        len        = childViews.get('length'),
        view, layer, height;
        
    if (len === 0) {
      height = 1; 
    } else {
      view = childViews.objectAt(len-1);
      layer = view ? view.get('layer') : null ;
      height = layer ? (layer.offsetTop + layer.offsetHeight) : 1 ;
      layer = null ; // avoid memory leaks
    }
    this.adjust('height', height);
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private
    Whenever the collection view reloads some views, reset the cache on the
    frame as well so that it will recalculate.
  */
  didReload: function(set) { return this.updateHeight(); },

  /** @private
    When layer is first created, make sure we update the height using the 
    newly calculated value.
  */
  didCreateLayer: function() { return this.updateHeight(); }
  
});

/* >>>>>>>>>> BEGIN source/views/static_content.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  StaticContentView allows you to display arbitrary HTML content inside your
  view hierarchy.

  Normally, views in SproutCore are absolutely positioned. Their width and
  height are either pre-determined, or specified relative to their enclosing
  view. Occasionally, you may want to display content that is layed out by
  the browser. For example, if you were writing a documentation browser, you
  may want to display the table of contents as an SC.ListView, but the actual
  pages as HTML content.

  This class is most useful when placed inside a ScrollView.

  To use it, simply set the @content@ property to a string of the HTML you
  would like to display.

  @extends SC.View
  @since SproutCore 1.2
  @author Tom Dale
*/

SC.StaticContentView = SC.View.extend(SC.StaticLayout, {
/** @scope SC.StaticContentView.prototype */
  classNames: ['sc-static-content-view'],

  displayProperties: ['content'],

  // ..........................................................
  // PROPERTIES
  //

  /**
    The HTML content you wish to display. This will be inserted directly into
    the DOM, so ensure that any user-generated content has been escaped.

    @type String
  */
  content: null,

  // ..........................................................
  // METHODS
  //

  /**
    Because SproutCore has no way of knowing when the size of the content
    inside a StaticContentView has changed, you should call this method
    whenever an event that may change the size of the content occurs.

    Note that if you change the content property, this will be recalculated
    automatically.
  */
  contentLayoutDidChange: function() {
    this._viewFrameDidChange();
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private
    Disable SproutCore management of view positioning.
  */
  useStaticLayout: YES,

  /** @private
    Overrides SC.View's frame computed property, and returns a value from the
    DOM. This value is cached to improve performance.

    If the size of the content inside the view changes, you should call
    contentLayoutDidChange().

    @property
  */
  frame: function() {
    var layer = this.get('layer'), rect;

    if (!layer) return { x: 0, y: 0, width: 0, height: 0 };

    if (layer.getBoundingClientRect) {
      rect = layer.getBoundingClientRect();

      return { x: 0, y: 0, width: rect.width, height: rect.height };
    } else {
      return { x: 0, y: 0, width: layer.clientWidth, height: layer.clientHeight };
    }
  }.property('content').cacheable(),

  /** @private
    Recalculate content frame if our parent view resizes.
  */
  parentViewDidResize: function() {
    this.contentLayoutDidChange();
  },

  /** @private
    If the layer changes, make sure we recalculate the frame.
  */
  didCreateLayer: function() {
    this.contentLayoutDidChange();
  },

  /** @private
    Outputs the content property to the DOM.

    @param {SC.RenderContext} context
    @param {Boolean} firstTime
  */
  render: function(context, firstTime) {
    var content = this.get('content');

    if (content) {
      context.push(content||'');
    }
  },
  
  touchStart: function(evt){
    evt.allowDefault();
    return YES;
  },
  
  touchEnd: function(evt){
    evt.allowDefault();
    return YES;
  }
  
});
/* >>>>>>>>>> BEGIN source/views/tab.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/segmented');

SC.TOP_LOCATION = 'top';
SC.TOP_TOOLBAR_LOCATION = 'top-toolbar';
SC.BOTTOM_LOCATION = 'bottom';

/** 
  @class

  Incorporates a segmented view and a container view to display the selected
  tab.  Provide an array of items, which will be passed onto the segmented
  view.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.TabView = SC.View.extend(
/** @scope SC.TabView.prototype */ {

  classNames: ['sc-tab-view'],
  
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  // 

 /** 
    Set nowShowing with the page you want to display.
  */
  nowShowing: null,
  
  items: [],
  
  isEnabled: YES,
  
  itemTitleKey: null,
  itemValueKey: null,
  itemIsEnabledKey: null,
  itemIconKey: null,
  itemWidthKey: null,
  itemToolTipKey: null,
  tabHeight: SC.REGULAR_BUTTON_HEIGHT,
  
  tabLocation: SC.TOP_LOCATION,
  
  /** 
    If set, then the tab location will be automatically saved in the user
    defaults.  Browsers that support localStorage will automatically store
    this information locally.
  */
  userDefaultKey: null,
  
  
  // ..........................................................
  // FORWARDING PROPERTIES
  // 
  
  // forward important changes on to child views
  _tab_nowShowingDidChange: function() {
    var v = this.get('nowShowing');
    this.get('containerView').set('nowShowing',v);
    this.get('segmentedView').set('value',v);
    return this ;
  }.observes('nowShowing'),

  _tab_saveUserDefault: function() {
    // if user default is set, save also
    var v = this.get('nowShowing');
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      SC.userDefaults.set([defaultKey,'nowShowing'].join(':'), v);
    }
  }.observes('nowShowing'),
  
  _tab_itemsDidChange: function() {
    this.get('segmentedView').set('items', this.get('items'));
    return this ;    
  }.observes('items'),

  /** @private
    Restore userDefault key if set.
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._tab_nowShowingDidChange()._tab_itemsDidChange();
  },

  awake: function() {
    arguments.callee.base.apply(this,arguments);  
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      defaultKey = [defaultKey,'nowShowing'].join(':');
      var nowShowing = SC.userDefaults.get(defaultKey);
      if (!SC.none(nowShowing)) this.set('nowShowing', nowShowing);
    }

  },
  
  createChildViews: function() {
    var childViews  = [], view, containerView, layout,
        tabLocation = this.get('tabLocation'),
        tabHeight   = this.get('tabHeight');
    
    layout = (tabLocation === SC.TOP_LOCATION) ?
             { top: tabHeight/2+1, left: 0, right: 0, bottom: 0 } :
             (tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { top: tabHeight+1, left: 0, right: 0, bottom: 0 } :
             { top: 0, left: 0, right: 0, bottom: tabHeight-1 } ;
    
    containerView = this.containerView.extend(SC.Border, {
      layout: layout,
      borderStyle: SC.BORDER_BLACK
    });

    view = this.containerView = this.createChildView(containerView) ;
    childViews.push(view);
    
    //  The segmentedView managed by this tab view.  Note that this TabView uses
    //  a custom segmented view.  You can access this view but you cannot change
    // it.
    layout = (tabLocation === SC.TOP_LOCATION || 
              tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { height: tabHeight, left: 0, right: 0, top: 0 } :
             { height: tabHeight, left: 0, right: 0, bottom: 0 } ;

    this.segmentedView = this.get('segmentedView').extend({
      layout: layout,

      /** @private
        When the value changes, update the parentView's value as well.
      */
      _sc_tab_segmented_valueDidChange: function() {
        var pv = this.get('parentView');
        if (pv) pv.set('nowShowing', this.get('value'));

        // FIXME: why is this necessary? 'value' is a displayProperty and should
        // automatically cause displayDidChange() to fire, which should cause 
        // the two lines below to execute in the normal course of things...
        this.set('layerNeedsUpdate', YES) ;
        this.invokeOnce(this.updateLayerIfNeeded) ;
      }.observes('value'),

      init: function() {
        // before we setup the rest of the view, copy key config properties 
        // from the owner view...
        var pv = this.get('parentView');
        if (pv) {
          SC._TAB_ITEM_KEYS.forEach(function(k) { this[k] = pv.get(k); }, this);
        }
        return arguments.callee.base.apply(this,arguments);
      }
    });
    
    view = this.segmentedView = this.createChildView(this.segmentedView) ;
    childViews.push(view);
    
    this.set('childViews', childViews);
    return this; 
  },
  
  // ..........................................................
  // COMPONENT VIEWS
  // 

  /**
    The containerView managed by this tab view.  Note that TabView uses a 
    custom container view.  You can access this view but you cannot change 
    it.
  */
  containerView: SC.ContainerView,
  
  segmentedView: SC.SegmentedView
  
}) ;

SC._TAB_ITEM_KEYS = 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemActionKey itemTargetKey'.w();

/* >>>>>>>>>> BEGIN source/views/thumb.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ThumbView works in concert with SC.SplitView to adjust the divider 
  position from an arbitrary subview of the SplitView. Simply make an
  instance of ThumbView a child somewhere in the childViews (or 
  descendants) of the split view and add the path to the ThumbView to the
  SplitView's thumbViews array.
  
  SplitView will automatically set the splitView property of the views in
  its thumbViews array.

  @extends SC.View
  @author Erich Ocean
  @test in split
*/
SC.ThumbView = SC.View.extend(
/** @scope SC.ThumbView.prototype */ {

  classNames: ['sc-thumb-view'],
  
  /**
    Enable this thumb view to control its parent split view.
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /** @private */
  prepareContext: function(context, firstTime) {
    var splitView = this.get('splitView') ;
    if (splitView) this.set('cursor', splitView.get('thumbViewCursor')) ;
    return arguments.callee.base.apply(this,arguments) ;
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO ;
    
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : arguments.callee.base.apply(this,arguments);
  },
  
  touchStart: function(evt) {
    return this.mouseDown(evt);
  }
    
});

/* >>>>>>>>>> BEGIN source/views/toolbar.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  A toolbar view can be anchored at the top or bottom of the window to contain
  your main toolbar buttons.  The default implementation assumes you may have
  a leftView, rightView, and centerView, which will be properly laid out.
  
  You can also override the layout property yourself or simply set the 
  anchorLocation to SC.ANCHOR_TOP or SC.ANCHOR_BOTTOM.  This will configure
  the layout of your toolbar automatically when it is created.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ToolbarView = SC.View.extend(
  /** @scope SC.ToolbarView.prototype */ {

  classNames: ['sc-toolbar-view'],
  
  /**
    Default anchor location.  This will be applied automatically to the 
    toolbar layout if you set it.
  */
  anchorLocation: null,

  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private */
  layout: { left: 0, height: 32, right: 0 },
  
  /** @private */
  init: function() {
    // apply anchor location before setting up the rest of the view.
    if (this.anchorLocation) {
      this.layout = SC.merge(this.layout, this.anchorLocation);
    }
    arguments.callee.base.apply(this,arguments); 
  }

});


/* >>>>>>>>>> BEGIN source/views/web.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

  Used to display an iframe. The source, (specified by the value property) of 
  the iFrame should be from the same domain. (i.e. the src / value should be 
  from the same domain) if you want to access the contents of the iframe.

  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0
*/
SC.WebView = SC.View.extend(SC.Control, {
/** @scope SC.WebView.prototype */
  classNames: 'sc-web-view',
  displayProperties: ['value', 'shouldAutoResize'],

  /**
  The content of the iframe can be bigger than the size specifed when creating
  the view. If you want the view to be auto-resized to the dimensions of the 
  iframe, then set the value of this property to YES.
  The web view can be auto resized only if the contents are from the same
  domain as the parent domain.
  @property{Boolean}
  */
  shouldAutoResize: NO,

  render: function(context, firstTime) {
    var src = this.get('value');
    if (firstTime) {
      context.push('<iframe src="' + src + 
      '" style="position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;"></iframe>');
    } else {
      var iframe = this.$('iframe');
      // clear out the previous src, to force a reload
      iframe.attr('src', 'javascript:;');
      iframe.attr('src', src);
    }
  },

  /**
  Called when the layer gets created. 
  */
  didCreateLayer: function() {
    var f = this.$('iframe');
    // Attach an onload event to the iframe.
    SC.Event.add(f, 'load', this, this.iframeDidLoad);
  },


  /** 
  Called when iframe onload event is fired.
  1. Resizes the view to fit the contents of the iframe using the 
  scroll width and scroll height of the contents of the iframe
  
  The iframe contents can be accessed only when the src is from the same
  domain as the parent document
  @returns {void}
  */
  iframeDidLoad: function() {
    //fit the iframe to size of the contents.
    if (this.get('shouldAutoResize') === YES){
      var contentWindow;
      var iframeElt = this.$('iframe')[0];
      if(iframeElt && iframeElt.contentWindow){
        contentWindow = iframeElt.contentWindow;
        if(contentWindow && contentWindow.document && contentWindow.document.documentElement){
          var docElement = contentWindow.document.documentElement;
          // setting the width before the height gives more accurate results.. 
          // atleast for the test iframe content i'm using.
          //TODO: try out document flows other than top to bottom.
          if (!SC.browser.isIE){
            this.$().width(docElement.scrollWidth);
            this.$().height(docElement.scrollHeight);          
          } else {
            this.$().width(docElement.scrollWidth + 12);
            this.$().height(docElement.scrollHeight + 5);          
          }
        }
      }
    }
  }
});

/* >>>>>>>>>> BEGIN source/views/well.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Constants
SC.WELL_CONTAINER_PADDING=15;

/** @class

  A WellView is a ContainerView with a border. It's useful when you want to
  group a set of views. It allows you to easily switch its contents too.
  
  It has a default contentLayout that will replace the layout of the contentView.
  
  @extends SC.ContainerView
  @since SproutCore 1.0
  @test in progress
*/
SC.WellView = SC.ContainerView.extend(
/** @scope SC.WellView.prototype */ {
  
  classNames: 'sc-well-view',
  
  /**
    Layout for the content of the container view.
    @property {Object}
  */
  contentLayout: {
    top:SC.WELL_CONTAINER_PADDING, bottom:SC.WELL_CONTAINER_PADDING,
    left:SC.WELL_CONTAINER_PADDING, right:SC.WELL_CONTAINER_PADDING},
  
  
  /**
     Overrides createChildViews and replaces the layout of the contentView
     with the one in contentLayout.
   */
  
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.get('contentView') ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      view.set('layout', this.contentLayout);
      this.childViews = [view] ;
    } 
  },
  
  /**
     The render method for the WellView simply add the html necessary for
     the border.
     
   */
  
  render: function(context, firstTime) {
    if(firstTime){
     context.push("<div class='top-left-edge'></div>",
       "<div class='top-edge'></div>",
       "<div class='top-right-edge'></div>",
       "<div class='right-edge'></div>",
       "<div class='bottom-right-edge'></div>",
       "<div class='bottom-edge'></div>",
       "<div class='bottom-left-edge'></div>",
       "<div class='left-edge'></div>",
       "<div class='content-background'></div>");
     }    
     arguments.callee.base.apply(this,arguments);
  },
  
  /**
     Invoked whenever the content property changes.  This method will simply
     call replaceContent and set the contentLayout in the new contentView.
     
     Override replaceContent to change how the view is
     swapped out.
   */
  contentViewDidChange: function() {
    var view = this.get('contentView');
    view.set('layout', this.contentLayout);
    this.replaceContent(view);
  }.observes('contentView')
  
}) ;

/* >>>>>>>>>> BEGIN bundle_loaded.js */
; if ((typeof SC !== 'undefined') && SC && SC.bundleDidLoad) SC.bundleDidLoad('sproutcore/desktop');
