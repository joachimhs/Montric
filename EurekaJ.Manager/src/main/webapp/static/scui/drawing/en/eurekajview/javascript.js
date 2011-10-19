/* >>>>>>>>>> BEGIN source/views/drawing.js */
/*globals G_vmlCanvasManager*/

/** @class

  This is a Drawing View:
  If you want to draw a new shape you can pass in the information:
  For a Line:
    {
      +shape: SCUI.LINE,
      +start: {x: 0, y: 0},
      +end: {x: 100, y: 100},
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Rectangle:
    {
      +shape: SCUI.RECT,
      +start: {x: 0, y: 0},
      +size: {width: 100, height: 100},
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Circle:
    {
      +shape: SCUI.CIRCLE,
      +center: {x: 0, y: 0},
      +radius: 20,
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  For a Polygon:
    {
      +shape: SCUI.POLY
      +path: [
        +{x: 0, y: 0},
        +{x: 10, y: 10},
        ?{x: 0, y: 50}
      ],
      ?type: SCUI.FILL | SCUI.STROKE
      ?style: {
        ?width: 5,
        ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
        ?transparency: 0.2
      }
    }
  
  @extends SC.View
  @since SproutCore 1.0
*/
SCUI.LINE = 'line';
SCUI.RECT = 'rect';
SCUI.CIRCLE = 'circle';
SCUI.POLY = 'poly';

SCUI.FILL = 'fill';
SCUI.STROKE = 'stroke';


SCUI.DrawingView = SC.View.extend({
  
  classNames: 'scui-drawing-view',
  
  shapes: [],
  
  _drawingManager: {},
  
  shapesDidChange: function(){
    this.set('layerNeedsUpdate', YES);
    this.updateLayerIfNeeded();
  }.observes('*shapes.[]'),
  
  init: function(){
    arguments.callee.base.apply(this,arguments);
    
    // Register Basic Shapes
    
    // Drawing a Line
    this.registerShapeDrawing( SCUI.LINE, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      ctx.moveTo(params.start.x, params.start.y);
      ctx.lineTo(params.end.x, params.end.y);
      ctx.stroke();
    });
    
    // Drawing a Rectangle
    this.registerShapeDrawing( SCUI.RECT, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      switch(params.type){
        case SCUI.FILL:
          ctx.fillRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        case SCUI.STROKE:
          ctx.strokeRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        default:
          ctx.clearRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
      }
    });
    
    // Drawing a Circle
    this.registerShapeDrawing( SCUI.CIRCLE, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      ctx.arc(params.center.x,params.center.y,params.radius,0,Math.PI*2,true);
      if (params.type === SCUI.FILL) ctx.fill();
      else ctx.stroke();
    });
    
    // Drawing a Polygon
    this.registerShapeDrawing( SCUI.POLY, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      var len = params.path ? params.path.length : 0;
      if (len < 2) return;
      
      var path = params.path, curr;
      ctx.moveTo(path[0].x, path[0].y);
      for(var i = 1; i < len; i++){
        curr = path[i];
        ctx.lineTo(curr.x, curr.y);
      }
      ctx.lineTo(path[0].x, path[0].y);
      if (params.type === SCUI.FILL) ctx.fill();
      else ctx.stroke();
    });
  },
  
  render: function(context, firstTime) {
    //console.log('%@.render()'.fmt(this));
    var frame = this.get('frame');
    if (firstTime) {
      if (!SC.browser.msie) {
        context.push('<canvas class="base-layer" width="%@" height="%@"></canvas>'.fmt(frame.width, frame.height));
      }
    }
    else {
      var canvasElem = this.$('canvas.base-layer');
      if (canvasElem) {
        canvasElem.attr('width', frame.width);
        canvasElem.attr('height', frame.height);
        if (canvasElem.length > 0) {
          var cntx = canvasElem[0].getContext('2d'); // Get the actual canvas object context
          if (cntx) {
            cntx.clearRect(0, 0, frame.width, frame.height);
            this._drawShapes(cntx);
          }
          else {
            console.error("SCUI.DrawingView.render(): Canvas object context is not accessible.");
          }
        }
        else {
          console.error("SCUI.DrawingView.render(): Canvas element array length is zero.");
        }
      }
      else {
        console.error("SCUI.DrawingView.render(): Canvas element is not accessible.");
      }
    }
    
    return arguments.callee.base.apply(this,arguments);
  },
  
  registerShapeDrawing: function(name, drawingFunction){
    if (!name) {
      console.error('Can\'t register this drawing paradigm because name is null');
      return NO;
    }
    
    // OK, create the drawing paradigm
    this._drawingManager[name] = drawingFunction;
    this.set('layerNeedsUpdate', YES);
    this.updateLayerIfNeeded();
    return YES;
  },
  
  /**
    @private 
    
    Function for actually drawing the shapes that we have listed
  */
  _drawShapes: function(cntx){
    var curr;
    var shapes = this.get('shapes') || [];
    var drawingFunc;
    for (var i=0,len=shapes.length;i<len;i++){
      curr = shapes[i];
      drawingFunc = this._drawingManager[curr.shape];
      if (drawingFunc) drawingFunc(cntx, curr);
    }
  },
  
  didCreateLayer: function(){
    if (SC.browser.msie) {
      var frame = this.get('frame');
      var canvas = document.createElement('CANVAS');
      canvas.className = 'base-layer';
      canvas.width = frame.width;
      canvas.height = frame.height;
      this.$().append(canvas);
      canvas = G_vmlCanvasManager.initElement(canvas);
      this._canvasie = canvas;
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/mixins/snap_lines.js */
// ========================================================================
// SCUI SnapLines
// ========================================================================
sc_require('views/drawing');
/**
  @mixin
  @author Mike Ball
  
  Add this Mixin to any View and it gives you an API to draw snap lines for
  all the child views
*/

//the number of pixles that will cause a snap line (factor of 2?)
SCUI.SNAP_ZONE = 2;

SCUI.SNAP_LINE = {
  shape: SCUI.LINE,
  start: {x: 0, y: 0},
  end: {x: 0, y: 0},
  style: {
    width: 0.5,
    color: '#00c6ff'
    //transparency: 0.2
  }
};


SCUI.SnapLines = {
  
  hasSnapLines: YES,
  
  
  
  /*
    This method will setup the datastructure required to draw snap lines
    it should be called in dragStarted if using with an SC.Drag or on mouseDown
    if using it with a move
  
    @param {Array} ignoreViews array of views to not include
    sets up the data structure used for the line drawing
  */
  setupData: function(ignoreViews){
    if(!ignoreViews) ignoreViews = [];
    this.removeLines(); //can't have any existing lines
    this._xPositions = {};
    this._yPositions = {}; 
    
    var xPositions = this._xPositions, yPositions = this._yPositions, children = this.get('childViews'), 
        that = this, parentView, frame, minX, midX, maxX, minY, midY, maxY, factor = (SCUI.SNAP_ZONE*2);
    
    
    // little insert utility
    var insert = function(min, mid, max, child, positions){
      var origMin = min, origMid = mid, origMax = max;
      min = Math.floor(min/factor);
      mid = Math.floor(mid/factor);
      max = Math.floor(max/factor);
      if(positions[min]){
        positions[min].push({value: origMin, child: child});
      }
      else{
        positions[min] = [{value: origMin, child: child}];
      }
      
      if(positions[mid]){
        positions[mid].push({value: origMid, child: child});
      }
      else{
        positions[mid] = [{value: origMid, child: child}];
      }
      
      if(positions[max]){
        positions[max].push({value: origMax, child: child});
      }
      else{
        positions[max] = [{value: origMax, child: child}];
      }
    };

    var parent = this;    
    children.forEach(function(child){
      if(ignoreViews.indexOf(child) < 0){
        frame = parent ? parent.convertFrameToView(child.get('frame'), null) : child.get('frame');
      
        minX = frame.x;
        midX = SC.midX(frame);
        maxX = frame.x + frame.width;
        insert(minX, midX, maxX, child, xPositions);
      
      
        minY = frame.y;
        midY = SC.midY(frame);
        maxY = frame.y + frame.height;
        insert(minY, midY, maxY, child, yPositions);
      }
    });

    //add the parent
    parent = this.get('parentView');
    frame = parent ? parent.convertFrameToView(this.get('frame'), null) : this.get('frame');
    this._globalFrame = frame;
    minX = frame.x;
    midX = SC.midX(frame);
    maxX = frame.x + frame.width;
    insert(minX, midX, maxX, this, xPositions);
    
    
    minY = frame.y;
    midY = SC.midY(frame);
    maxY = frame.y + frame.height;
    insert(minY, midY, maxY, this, yPositions);
    
    
  },
  
  /**
    This method will check the passed views position with the other child views
    and draw any lines.  It should be called in dragUpdated if using SC.Drag
    or in mouseMoved if using a move.  it will also return a hash of the snapped coords
    in local and global coodinates
    
  */
  drawLines: function(view, eventX, eventY, mouseDownX, mouseDownY, offset){
    if(!this._xPositions || !this._yPositions) return;
    if(!this._drawingView){
      this._drawingView = this.createChildView(SCUI.DrawingView.design({
        shapes: [],
        mouseDown: function(evt){
          this.removeFromParent(); //sometimes the lines still stick around... if they do this gives you an out!
          return YES;
        }
      }));
      this.appendChild(this._drawingView);
    }
    //set offset to 0 if not provided
    if(!offset) offset = {x: 0, y: 0};
    var factor = (SCUI.SNAP_ZONE*2), shapes = [], xline, yline, frame, parent, rMinX, rMidX, rMaxX,
        rMinY, rMidY, rMaxY, rMinXMod, rMidXMod, rMaxXMod, rMinYMod, rMidYMod, rMaxYMod, xHit, yHit,
        moveDirection = this._dragDirection(eventX, eventY, mouseDownX, mouseDownY), xValues, yValues, 
        that = this, xHitVals, yHitVals, ret;
    //get the frame and all the relavent points of interest
    parent = view.get('parentView');
    frame = parent ? parent.convertFrameToView(view.get('frame'), null) : view.get('frame');
    frame.x = frame.x - offset.x;
    frame.y = frame.y - offset.y;
    rMinX = SC.minX(frame);
    rMidX = SC.midX(frame);
    rMaxX = SC.maxX(frame);
    rMinY = SC.minY(frame);
    rMidY = SC.midY(frame);
    rMaxY = SC.maxY(frame);
    rMinXMod = Math.floor(rMinX/factor);
    rMidXMod = Math.floor(rMidX/factor);
    rMaxXMod = Math.floor(rMaxX/factor);
    rMinYMod = Math.floor(rMinY/factor);
    rMidYMod = Math.floor(rMidY/factor);
    rMaxYMod = Math.floor(rMaxY/factor);
    
    //array of tuples containing the mod and the value you need to add to the resulting position
    xValues = moveDirection.UP ? [{mod: rMinXMod, val: 0}, {mod: rMidXMod, val: frame.width/2}, {mod: rMaxXMod, val: frame.width}] : [{mod: rMaxXMod, val: frame.width}, {mod: rMidXMod, val: frame.width/2}, {mod: rMinXMod, val: 0}];
    //compute the three possible line positions
    xValues.forEach(function(xVal){
      if(that._xPositions[xVal.mod]){
        xHitVals = xVal;
        xHit = that._xPositions[xVal.mod][0].value - that._globalFrame.x;
        return;
      }
    });
    if(!SC.none(xHit)){
      xline = SC.copy(SCUI.SNAP_LINE);
      xline.start = {x: xHit, y: 0};
      xline.end = {x: xHit, y: this._globalFrame.height};
      shapes.push(xline);
    }
    
    yValues = moveDirection.LEFT ? [{mod: rMinYMod, val: 0}, {mod: rMidYMod, val: frame.height/2}, {mod: rMaxYMod, val: frame.height}] : [{mod: rMaxYMod, val: frame.height}, {mod: rMidYMod, val: frame.height/2}, {mod: rMinYMod, val: 0}];
    //compute the three possible line positions
    yValues.forEach(function(yVal){
      if(that._yPositions[yVal.mod]){
        yHitVals = yVal;
        yHit = that._yPositions[yVal.mod][0].value - that._globalFrame.y;
        return;
      }
    });
    if(!SC.none(yHit)){
      yline = SC.copy(SCUI.SNAP_LINE);
      yline.start = {y: yHit, x: 0};
      yline.end = {y: yHit, x: this._globalFrame.width};
      shapes.push(yline);
    }
    this._drawingView.set('shapes', shapes);
    ret = {pageX: xHit + this._globalFrame.x, pageY: yHit + this._globalFrame.y, frameX: xHit, frameY: yHit};
    if(xHitVals){
      ret.pageX -= xHitVals.val;
      ret.frameX -= xHitVals.val;
    }
    if(yHitVals){
      ret.pageY -= yHitVals.val;
      ret.frameY -= yHitVals.val;
    }
    return ret;
  },
  
  /*
    called to cleanup the lines...
    This method should be called in mouseUp if doing a move and in dragEnded if using a SC.Drag
  */
  removeLines: function() {
    this._xPositions = null;
    this._yPositions = null;
    this._globalFrame = null;
    if(this._drawingView) {
      this._drawingView.destroy();
      this._drawingView = null;
    }
  },
  
  /*
    takes the event x, y and mouseDown x, y and computes a direction
  */
  _dragDirection: function(eventX, eventY, mouseDownX, mouseDownY){
    var deltaX = eventX - mouseDownX, deltaY = eventY - mouseDownY, ret = {};
    ret.UP = deltaX > 0 ? NO : YES;
    ret.DOWN = deltaX > 0 ? YES : NO;
    ret.LEFT = deltaY > 0 ? NO : YES;
    ret.RIGHT = deltaY > 0 ? YES : NO;
    return ret;
  }
};


/* >>>>>>>>>> BEGIN source/panes/drawing.js */

/** @class

  This is a Drawing Pane:
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SCUI.DrawingPane = SC.Pane.extend({
  
  classNames: 'scui-drawing-pane',
  
  /** @private cover the entire screen */
  layout: { top: 0, left: 0, bottom: 0, right: 0 }
  
});


/* >>>>>>>>>> BEGIN source/views/drag_link.js */
// ==========================================================================
// SCUI.DragLinkView
// ==========================================================================

sc_require('views/drawing');

/** @class

  This is the canvas tag that draws the link on the screen

  @extends SC.DrawingView
  @author Evin Grano
  @version 0.1
*/

SCUI.DragLinkView = SCUI.DrawingView.extend(
/** @scope SCUI.DragLinkView.prototype */ {

  classNames: ['scui-draglink'],
  
  /**
   * @property
   * Property for the start of the link
   */
  startPoint: null,
  
  /**
   * @property
   * Property for the end of the link
   */
  endPoint: null,
  
  /**
   * Default Styling
   */
  linkParams: {
    shape: SCUI.LINE,
    style: {
      color: 'black',
      width: 2
    }
  },
  
  _pointsDidChange: function(){
    var sp = this.get('startPoint'),
        ep = this.get('endPoint'),
        xDiff, yDiff, newLink;
    
    xDiff = Math.abs(sp.x - ep.x);
    yDiff = Math.abs(sp.y - ep.y);
    if (xDiff > 5 || yDiff > 5){
      newLink = this.createLinkShape();
      this.setIfChanged('shapes', [newLink]);
    }    
  }.observes('startPoint', 'endPoint', 'linkParams'),
  
  /**
   * Override this function with the particular shape that you want to draw.
   * @returns OBJECT
   */
  createLinkShape: function(startPoint, endPoint){
    var dp = this.get('linkParams');
    
    dp.shape = dp.shape || SCUI.LINE;
    dp.start = {x: startPoint.x, y: startPoint.y};
    dp.end = {x: endPoint.x, y: endPoint.y};
    dp.style = dp.style || { color: 'black', width: 2 };
    
    return dp;
  }  
});


