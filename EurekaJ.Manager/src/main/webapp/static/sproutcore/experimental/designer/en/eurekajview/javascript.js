/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** Default namespace for designer-specific classes */
SC.Designer = SC.Object.extend({
  
});

// Don't want to register these for now...
// SC.mixin(SC.Designer,{
//   pages: [],
//   
//   controllers: [],
//   
//   registerPage: function(page){
//     SC.Designer.pages.pushObject(page);
//   },
//   
//   registerController: function(controller){
//     SC.Designer.controllers.pushObject(controller);
//   }
//   
// });

/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/coders/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**

  Generic base class to encode a view hierarchy.  `ViewCoder`s are used to
  collect the properties that may be included in a view design and then to 
  serialize that design to a JavaScript string that can be evaled.  
  
  To encode a view with a `ViewCoder`, simply call `SC.ViewCoder.encode(view)`.
  Most of the time, however, you will not initiate coding directly but instead
  work with the coder while designing an `SC.DesignerView` subclass.

  ## Using a Coder

  When you are passed an instance of a coder, you can simply write attributes
  into the coder using one of the many encoding methods defined on the view.
  Encoding methods are defined for most primitive view types.
  
      coder.string("firstName" , "Charles").string('lastName', 'Jolley');
  
  @extends SC.Object
*/
SC.ObjectCoder = SC.Object.extend({
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /** The `className` used to emit the design. */
  className: 'SC.Object',
  
  /** 
    The method to be used to create the class or object. 
  */
  extendMethodName: 'extend',
  
  /** 
    The default encoding method.  If an object defines this method, then a new
    coder will be created to encode that object.
  */
  encodeMethodName: 'encode',
  
  /** 
    The attributes that will be emitted.  The values all must be strings. Use 
    one of the encoding methods defined below to actually encode attributes.
  */
  attributes: null,
  
  // ..........................................................
  // ENCODING METHODS
  // 
  // Call these methods to encode various types of attributes.  They all take
  // the same basic params: (key, value)...

  /**
    Utility method transforms the passed value with the passed function.  
    Handles both Arrays and individual items.
  */
  transform: function(val, func) {
    
    // for an array, transform each value with the func and then return a
    // combined array.
    if (SC.typeOf(val) === SC.T_ARRAY) {
      val = val.map(function(x) { return this.transform(x, func); }, this);
      val = '['+val+']';
      
    // otherwise, just call transform function on the value
    } else {
      val = func.call(this, val);
    }
    return val;
  },
  
  /**
    Encodes a string of raw JavaScript.  This is the most primitive method. 
    You are expected to prep the value yourself.  You can pass an array to
    this or any other method and it will be encoded as a full array.

    This method also automatically handles null and undefined values.  Null
    values are included in the output.  Undefined values are ignored.
    
    @param key {String} the key to set
    @param val {String} the JavaScript
    @param transform {Function} optional transform function to apply to val
    @returns {SC.ObjectCoder} receiver
  */
  js: function(key, val, transform) {
    
    // normalize
    if (val===undefined) { val=key; key = undefined; }
    val = this.transform(val, function(x) {
      return (x===null) ? "null" : transform ? transform.call(this, x) : x ;
    });
    
    // save if needed.  Undefined values are ignored
    if (key !== undefined && (val !== undefined)) {
      this.attributes[key] = val;
      return this ;
    } else return val ;
  },

  /**
    Encodes a string, wrapping it in quotes.
    
    @param key {String} the key to set
    @param val {String} the value
    @returns {SC.ObjectCoder} receiver
  */
  string: function(key, val) {
    return this.js(key, val, function(x) {
      return '"' + x.replace(/"/g, '\\"') + '"' ;
    });
  },
  
  /**
    Encodes a number, wrapping it in quotes.
    
    @param key {String} the key to set
    @param val {Number} the value
    @returns {SC.ObjectCoder} receiver
  */
  number: function(key, val) {
    return this.js(key, val, function(x) { return x.toString(); });
  },
  
  /**
    Encodes a bool, mapped as `YES` or `NO`
    
    @param key {String} the key to set
    @param val {Boolean} the value
    @returns {SC.ObjectCoder} receiver
  */
  bool: function(key, val) {
    return this.js(key, val, function(x) { return x ? "true" : "false"; });
  },

  /**
    Encodes an object.  This will do its best to autodetect the type of the
    object.  You can pass an optional processing function that will be used 
    on object members before processing to allow you to normalize.  The 
    method signature must be:
    
        function convert(value, rootObject, key);

    The rootObject and key will be set to give you the context in the 
    hierarchy.
    
    Generally this method will work for encoding simple value only.  If your 
    object graph may contain SproutCore objects, you will need to encode it
    yourself.
    
    @param key {String} the key to set
    @param val {Object} the value
    @param func {Function} optional transform func
    @returns {SC.ObjectCoder} receiver
  */
  encode: function(key, val, func) {
    // normalize params
    if (func===undefined && val instanceof Function) {
      func = val; val = key; key = undefined; 
    }

    return this.js(key, val, function(cur) { 
      if (func) cur = func.call(this, cur, null, null);
      switch(SC.typeOf(cur)) {
      case SC.T_STRING:
        cur = this.string(cur);
        break;

      case SC.T_NUMBER:
        cur = this.number(cur);
        break;

      case SC.T_BOOL:
        cur = this.bool(cur);
        break;

      case SC.T_ARRAY:
        cur = this.array(cur, func) ;
        break;

      case SC.T_HASH:
        cur = this.hash(cur, func);
        break ;
        
      default:
        // otherwise, if the object has a designer attached, try to encode
        // view.
        cur = cur ? this.object(cur) : this.js(cur);
      }
      return cur ;
    });
  },
  
  /**
    Encodes a hash of objects.  The object values must be simple objects for
    this method to work.  You can also optionally pass a processing function
    that will be invoked for each value, giving you a chance to convert the
    value first.  The signature must be `(key, value, rootObject)`.
    
    @param key {String} the key to set
    @param val {Object} the value
    @param func {Function} optional transform func
    @returns {SC.ObjectCoder} receiver
  */
  hash: function(key, val, func) {
    
    // normalize params
    if (func===undefined && val instanceof Function) {
      func = val; val = key; key = undefined; 
    }
    
    return this.js(key, val, function(x) { 
      var ret = [] ;
      for(var key in x) {
        if (!x.hasOwnProperty(key)) continue; // only include added...
        ret.push("%@: %@".fmt(this.encode(key), this.encode(x[key], func)));
      }
      return "{%@}".fmt(ret.join(","));
    });
  },

  /**
    Encodes a array of objects.  The object values must be simple objects for
    this method to work.  You can also optionally pass a processing function
    that will be invoked for each value, giving you a chance to convert the
    value first.  The signature must be `(index, value, rootObject)`.
    
    @param key {String} the key to set
    @param val {Object} the value
    @param func {Function} optional transform func
    @returns {SC.ObjectCoder} receiver
  */
  array: function(key, val, func) {
    
    // normalize params
    if (func===undefined && val instanceof Function) {
      func = val; val = key; key = undefined; 
    }

    val = val.map(function(x) { return this.encode(x, func); }, this);
    val = "[%@]".fmt(val.join(","));

    return this.js(key, val);
  },
  
  /**
    Attempts to encode an object.  The object must implement the 
    encodeMethodName for this encoder, or else an exception will be raised.
    
    @param key {String} the key to set
    @param val {Object} the object to encode
    @returns {SC.ObjectCoder} receiver
  */
  object: function(key, val) {
    return this.js(key, val, function(x) {
      return this.constructor.encode(x, this);
    });
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  spaces: function() {
    var spaces = this.context ? this.context.get('spaces') : '' ;
    spaces = spaces + '  ';  
    return spaces ;
  }.property().cacheable(),
  
  /** 
    Emits the final JavaScript output for this coder based on the current
    attributes.
  */
  emit: function() {
    
    // return undefined if the encoding was rejected...
    if (this.invalid) return undefined ;
    
    var ret = [], attrs = this.attributes, key ;
    var methodName = this.get('extendMethodName');
    var spaces = this.get('spaces');
    
    // compute attribute body...
    for(key in attrs) {
      if (!attrs.hasOwnProperty(key)) continue ;
      ret.push("%@: %@".fmt(key, attrs[key]));
    }
    
    if (ret.length <= 0) {
      return "%@1%@2.%@3({})".fmt(spaces, this.className, methodName);
    } else {
      // handle NO class formatting..
      ret = ret.join(",");
      return "%@2.%@3({%@4})".fmt(spaces, this.className, methodName, ret);
    }
  },
  
  /**
    Begins encoding with a particular object, setting the className to the 
    object's `className`.  This is used internally by the `encode()` method.
  */
  begin: function(object) {
    var methodName = this.get('encodeMethodName');
    if (SC.typeOf(object[methodName]) !== SC.T_FUNCTION) {
      throw SC.$error("Cannot encode %@ because it does not respond to %@()".fmt(object, methodName)) ;
    } 
    
    // save className for later coding
    this.set('className', SC._object_className(object.constructor));

    // then call encode method...
    var ret = object[methodName](this);
    
    // if encoding method returns NO, then encoding is not allowed.
    // note that returning void should count as YES.
    this.invalid = ret === NO ;
    
    // and return this
    return this ;
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.set('attributes', {});
  },
  
  destroy: function() {
    arguments.callee.base.apply(this,arguments);
    this.context = this.className = this.attributes = null ; // cleanup
  }
  
});

SC.ObjectCoder.encode = function(object, context) {
  // create coder and emit code...
  var coder = this.create({ context: context });
  var ret = coder.begin(object).emit();
  
  // cleanup and return
  coder.destroy();
  return ret ;
} ;

/* >>>>>>>>>> BEGIN source/coders/design.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/* evil:true */

sc_require('coders/object');

/** @class

  A DesignCoder encodes specifically the design for a set of views.
  
  @extends SC.ObjectCoder
*/
SC.DesignCoder = SC.ObjectCoder.extend({
  extendMethodName: 'design',
  encodeMethodName: 'encodeDesign'  
});
/* >>>>>>>>>> BEGIN source/controllers/controllers.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// // ==========================================================================
// Project:   SC.controllersController
// ==========================================================================
/*globals SC */

/** @class

  in suppressMain mode all controllers files register with this array controller

  @extends SC.Object
*/
SC.controllersController = SC.ArrayController.create(
/** @scope SC.controllersController.prototype */ {
  
  
}) ;

/* >>>>>>>>>> BEGIN source/controllers/design.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ==========================================================================
// Project:   SC.designController
// ==========================================================================
/*globals SC */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
SC.designController = SC.ObjectController.create(
/** @scope SC.designController.prototype */ {

  contentBinding: 'SC.designsController.selection',
  contentBindingDefault: SC.Binding.single(),
  
  viewSelected: function(){
    var c = this.get('content'), pane, designer, pageController;
    if(c){
      pane = c.get('view');
      if(pane.kindOf && pane.kindOf(SC.View)){
        pageController = SC.designsController.getPath('page.designController');
        designer = pane.get('designer');
        //make this designer the rootDesigner
        if(pageController && designer) {
          designer.set('designIsEnabled', NO);
          pageController.makeRootDesigner(designer);
        }
      }
      else if(SC._Greenhouse){
        SC._Greenhouse.designController.set('content', pane.get('designer'));
        SC._Greenhouse.sendAction('floatInspector');
      }
    }
  }
}) ;

/* >>>>>>>>>> BEGIN source/controllers/designs.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ==========================================================================
// Project:   SC.designsController
// ==========================================================================
/*globals SC */
/*jslint evil: true*/

/** @class

  (Document Your Controller Here)
  
  this controller is used by Greenhouse to list all of the views in a page files

  @extends SC.Object
*/
SC.designsController = SC.ArrayController.create(SC.CollectionViewDelegate,
/** @scope SC.designsController.prototype */ {
  
  setDesigns: function(page, iframe){
    var designs = [];
    
    for(var v in page){
      if(page.hasOwnProperty(v)){
        if(v !== '__sc_super__' && page[v] && page[v].kindOf){
          if(page[v].kindOf(iframe.SC.Pane)){
            designs.push(SC.Object.create({type: 'pane', view: page.get(v), name: v}));
          }
          else if(page[v].kindOf(iframe.SC.View)){
            designs.push(SC.Object.create({type: 'view', view: page.get(v), name: v}));
          }
          else if(page[v].kindOf(iframe.SC.Page)){
            designs.push(SC.Object.create({type: 'page', view: page.get(v), name: v}));
          }
          else if(page[v].kindOf(iframe.SC.Controller)){
            designs.push(SC.Object.create({type: 'controller', name: v, view: page.get(v)}));
          }
          else if(page[v].kindOf(iframe.SC.Object) && !page[v].isPageDesignController){
            designs.push(SC.Object.create({type: 'controller', name: v, view: page.get(v)}));
          }

        }
      }
    }
    this.set('content', designs);
    this.set('page', page);
  },
  
  // ..........................................................
  // Drop Target
  // 
  
  collectionViewComputeDragOperations: function(view, drag, op){
    return SC.DRAG_ANY;
  },
  /**
    Called by the collection view during a drag to let you determine the
    kind and location of a drop you might want to accept.
    
    You can override this method to implement fine-grained control over how
    and when a dragged item is allowed to be dropped into a collection view.

    This method will be called by the collection view both to determine in 
    general which operations you might support and specifically the operations
    you would support if the user dropped an item over a specific location.
    
    If the `proposedDropOperation` parameter is `SC.DROP_ON` or
    `SC.DROP_BEFORE`, then the `proposedInsertionPoint` will be a
    non-negative value and you should determine the specific operations you
    will support if the user dropped the drag item at that point.
    
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
    var data = drag.dataForType('SC.Object');
    if(data){
      return SC.DRAG_ANY;
    }
    else{
      // don't allow dropping on by default
      return (proposedDropOperation & SC.DROP_ON) ? SC.DRAG_NONE : op ;
    }
  },
  
  /**
    Called by the collection view to actually accept a drop.  This method will
    only be invoked *AFTER* your `validateDrop` method has been called to
    determine if you want to even allow the drag operation to go through.
    
    You should actually make changes to the data model if needed here and
    then return the actual drag operation that was performed.  If you return
    SC.DRAG_NONE and the dragOperation was `SC.DRAG_REORDER`, then the default
    reorder behavior will be provided by the collection view.
    
    @param view {SC.CollectionView}
    @param drag {SC.Drag} the current drag object
    @param op {Number} proposed logical OR of allowed drag operations.
    @param proposedInsertionIndex {Number} an index into the content array representing the proposed insertion point.
    @param proposedDropOperation {String} the proposed drop operation.  Will be one of SC.DROP_ON, SC.DROP_BEFORE, or SC.DROP_ANY.
    @returns the allowed drag operation.  Defaults to proposedDragOperation
  */
  collectionViewPerformDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
    var data = drag.dataForType('SC.Object'),
        page = this.get('page'),
        scClass,
        that = this;
    if(data){
      var actionObj = SC.Object.create({
        data: data,
        addItemToPage: function(name){
          scClass = eval(this.getPath('data.scClass'));
          var type = SC.kindOf(scClass, SC.View) ? 'view' : 'controller';
          
          page[name] = scClass.design().create({page: page});
          that.pushObject(SC.Object.create({type: type, view: page.get(name), name: name}));
        }
      });
      
      SC._Greenhouse.sendAction('newPageElement', actionObj);
      return SC.DRAG_ANY;
    }
    return SC.DRAG_NONE ;
  }
}) ;

/* >>>>>>>>>> BEGIN source/controllers/page_design.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class
  An instance of this controller is created for every page where designers 
  are involved.  The Designer's themselves will register with the 
  controller so that you can hook to the controller to manage the views and
  their editors.
  
  Among other things, this controller implements global selection support for
  the designers.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.PageDesignController = SC.Object.extend({
  
  isPageDesignController: YES,
  
  // ..........................................................
  // SELECTION
  // 
  
  /** The current view builder selection. */
  selection: null,
  
  /** 
    Updates the selection either by adding the item or by reseting the 
    selection.  Calling this method with no parameters will reset the 
    selection.
    
    The passed selection must be a Designer object.
  */
  select: function(sel, extend) {
    var base = this.get('selection');
    if (!base || !extend || !base.contains(sel)) {
      base = (!extend || !base) ? SC.CoreSet.create() : base.copy();
      base.add(sel);
      this.set('selection', base.freeze()) ;
      //make the designPane the firstResponder
      SC.designPage.getPath('designMainPane.container').becomeFirstResponder();
    }
    return this ;
  },
  
  /**
    Removes the passed items from the current selection.
    
    The passed selection must be a Designer object.
  */
  deselect: function(sel) {
    
    var base = this.get('selection');
    if (base && base.contains(sel)) {
      base = base.copy();
      base.remove(sel);
      this.set('selection', base.freeze());
    }
    return this;
  },
  /**
    Invoked whenever the selection changes.  Updates the selection states 
    on the old and new views.
  */
  selectionDidChange: function() {
    var sel = this.get('selection'),
        oldSel = this._selection ;

    // save old selection for next time
    this._selection = sel ;
    
    // set the isSelected state on new selection.
    if (sel) sel.setEach('designIsSelected', YES);
    
    // remove the isSelected state for old selection not in new selection.
    if (oldSel) {
      oldSel.forEach(function(s){ 
        if (!sel || !sel.contains(s)) s.set('designIsSelected', NO);
      }, this);
    }
    
  }.observes('selection'),
  
  
  /**
    Called by a view to reposition the current selection during a mouse 
    drag.
  */
  repositionSelection: function(evt, info) {
    var sel = this.get('selection');
    if (sel) sel.invoke('mouseReposition', evt, info);  
  },
  
  /**
    Called by a view to prepare all views in selection for repositioning
  */
  prepareReposition: function(info) {
    var sel = this.get('selection');
    if (sel) sel.invoke('prepareReposition', info);
  },
  /**
    removes all views in the selection from their parent view
  */
  deleteSelection: function(){
    var sel = this.get('selection'), first, parentView;
    
    if(sel && sel.get('length') > 0){
      //TODO: delete multi selection
      //this.beginPropertyChanges();
      //while(sel.get('length') > 0){
        first = sel.firstObject();
        this.deselect(first);
        first = first.get('view');
        parentView = first.get('parentView');
        first.removeFromParent();
        if(parent.displayDidChange) parent.displayDidChange();
        first = null;
      //}
      //this.endPropertyChanges();
    }
  },
  
  
  // ..........................................................
  // DESIGNERS
  // 
  
  /** All of the designers on the current page. */
  designers: null,

  /**  
    Called by each designer when it is created to register itself with the
    controller.  You can use this to know which designers are currently in 
    the document to delete them as needed.
  */
  registerDesigner: function(designer) {
    this.get('designers').add(designer);
  },
  
  // ..........................................................
  // ROOT DESIGNER
  // 
  rootDesigner: null,
  
  makeRootDesigner: function(designer){
    var currRoot = this.get('rootDesigner');
    
    if(currRoot) currRoot.set('isRootDesigner', NO);
    
    this.deselect(designer);
    designer.set('isRootDesigner', YES);
    designer.set('prevRootDesigner', currRoot);
    //TODO: allow greenhouse to hightlight the root view!
    this.set('rootDesigner', designer);
  },
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  init: function() {
    this.designers = SC.Set.create();
    this.sel = [];
    arguments.callee.base.apply(this,arguments);
  }
  
}) ;
/* >>>>>>>>>> BEGIN source/controllers/page_files.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ==========================================================================
// Project:   SC.pageFilesController
// ==========================================================================
/*globals SC */

/** @class

  in `suppressMain` mode all page files register with this array controller

  @extends SC.Object
*/
SC.pageFilesController = SC.ArrayController.create(
/** @scope SC.pageFilesController.prototype */ {
  
}) ;
SC.pageFilesController.mixin({
  pages: [],
  
  register: function(page){
    SC.pageFilesController.pages.pushObject(page);
  }
});
/* >>>>>>>>>> BEGIN source/css/css_style.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.CSSStyle

  A css style object represents a css style that is part of a single css rule 
  in a single css style sheet.
  
  @extends SC.Object
*/
SC.CSSStyle = SC.Object.extend(
/** @scope SC.CSSStyle.prototype */ {
  
  /**
    @property {String} a css string representing the style property
  */
  style: '',
  
  /**
    @property {SC.CSSRule} the rule this style is part of
  */
  rule: null
  
});

/* >>>>>>>>>> BEGIN source/css/css_rule.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('css/css_style') ;

/**
  @class SC.CSSRule

  A css rule object represents a css rule that is part of a style sheet 
  object. You can create your own rules and add insert them in style sheets at
  runtime.
  
  @extends SC.Object
*/
SC.CSSRule = SC.Object.extend(
/** @scope SC.CSSRule.prototype */ {
  
});

/* >>>>>>>>>> BEGIN source/css/css_style_sheet.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('css/css_rule') ;

/**
  @class SC.CSSStyleSheet

  A style sheet object wraps a document style sheet object. `C.CSSStyleSheet`
  will re-use stylesheet objects as needed.
  
  @extends SC.Object
*/
SC.CSSStyleSheet = SC.Object.extend(
/** @scope SC.CSSStyleSheet.prototype */ {
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    
    var ss = this.styleSheet ;
    if (!ss) {
      // create the stylesheet object the hard way (works everywhere)
      ss = this.styleSheet = document.createElement('style') ;
      ss.type = 'text/css' ;
      var head = document.getElementsByTagName('head')[0] ;
      if (!head) head = document.documentElement ; // fix for Opera
      head.appendChild(ss) ;
    }
    
    // cache this object for later
    var ssObjects = this.constructor.styleSheets ;
    if (!ssObjects) ssObjects = this.constructor.styleSheets = {} ;
    ssObjects[SC.guidFor(ss)] ;
    
    // create rules array
    var rules = ss.rules || SC.EMPTY_ARRAY ;
    var array = SC.SparseArray.create(rules.length) ;
    array.delegate = this ;
    this.rules = array ;
    
    return this ;
  },
  
  /**
    @property {Boolean} YES if the stylsheet is enabled.
  */
  isEnabled: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.disabled = !val ;
    }
    return !this.styleSheet.disabled ;
  }.property(),
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /**
    **DO NOT MODIFY THIS OBJECT DIRECTLY!!!!** Use the methods defined on this
    object to update properties of the style sheet; otherwise, your changes 
    will not be reflected.
    
    @property {CSSStyleSheet} RO
  */
  styleSheet: null,
  
  /**
    @property {String}
  */
  href: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.href = val ;
    }
    else return this.styleSheet.href ;
  }.property(),
  
  /**
    @property {String}
  */
  title: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.title = val ;
    }
    else return this.styleSheet.title ;
  }.property(),
  
  /**
    @property {SC.Array} contains SC.CSSRule objects
  */
  rules: null,
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  insertRule: function(rule) {
    var rules = this.get('rules') ;
  },
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  deleteRule: function(rule) {
    var rules = this.get('rules') ;
    rules.removeObject(rule) ;
  },
  
  // TODO: implement a destroy method
  
  /**
    @private
    
    Invoked by the sparse array whenever it needs a particular index 
    provided.  Provide the content for the index.
  */
  sparseArrayDidRequestIndex: function(array, idx) {
    // sc_assert(this.rules === array) ;
    var rules = this.styleSheet.rules || SC.EMPTY_ARRAY ;
    var rule = rules[idx] ;
    if (rule) {
      array.provideContentAtIndex(idx, SC.CSSRule.create({ 
        rule: rule,
        styleSheet: this
      })); 
    }
  },
  
  /** @private synchronize the browser's rules array with our own */
  sparseArrayDidReplace: function(array, idx, amt, objects) {
    var cssRules = objects.collect(function(obj) { return obj.rule; }) ;
    this.styleSheet.rules.replace(idx, amt, cssRules) ;
  }
  
});

SC.mixin(SC.CSSStyleSheet,
/** SC.CSSStyleSheet */{
  
  /**
    Find a stylesheet object by name or href. If by name, `.css` will be
    appended automatically.
    
        var ss = SC.CSSStyleSheet.find('style.css') ;
        var ss2 = SC.CSSStyleSheet.find('style') ; // same thing
        sc_assert(ss === ss2) ; // SC.CSSStyleSheet objects are stable
    
    @param {String} nameOrUrl a stylsheet name or href to find
    @returns {SC.CSSStyleSheet} null if not found
  */
  find: function(nameOrUrl) {
    var isUrl = nameOrUrl ? nameOrUrl.indexOf('/') >= 0 : NO ;
    
    if (!nameOrUrl) return null ; // no name or url? fail!
    
    if (!isUrl && nameOrUrl.indexOf('.css') == -1) {
      nameOrUrl = nameOrUrl + '.css' ;
    }
    
    // initialize styleSheet cache
    var ssObjects = this.styleSheets ;
    if (!ssObjects) ssObjects = this.styleSheets = {} ;
    
    var styleSheets = document.styleSheets ;
    var ss, ssName, ssObject, guid ;
    for (var idx=0, len=styleSheets.length; idx < len; ++idx) {
      ss = styleSheets[idx] ;
      if (isUrl) {
        if (ss.href === nameOrUrl) {
          guid = SC.guidFor(ss) ;
          ssObject = ssObjects[guid] ;
          if (!ssObject) {
            // cache for later
            ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
          }
          return ssObject ;
        }
      }
      else {
        if (ssName = ss.href) {
          ssName = ssName.split('/') ; // break up URL
          ssName = ssName[ssName.length-1] ; // get last component
          if (ssName == nameOrUrl) {
            guid = SC.guidFor(ss) ;
            ssObject = ssObjects[guid] ;
            if (!ssObject) {
              // cache for later
              ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
            }
            return ssObject ;
          }
        }
      }
    }
    return null ; // stylesheet not found
  },
  
  styleSheets: null
  
});

/* >>>>>>>>>> BEGIN source/views/high_light.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// ========================================================================

/**
  This View is used by Greenhouse when application is in design mode
  It darkens the area around the `rootDesigner`
*/
SC.RootDesignerHighLightView = SC.View.extend(
/** @scope SC.RootDesignerHighLight.prototype */ {

  /**
    The designer that owns this highlight
  */
  designer: null,
  
  classNames: 'high-light',
  
  render: function(context, firstTime) {
    var targetFrame = this.get('targetFrame');
    // render shadows
    context
    .begin('div').classNames(['top', 'cover']).addStyle({top: 0, height: targetFrame.y, left:0, right: 0}).end()
    .begin('div').classNames(['bottom', 'cover']).addStyle({top: targetFrame.y + targetFrame.height, bottom:0, left: 0, right:0}).end()
    .begin('div').classNames(['left', 'cover']).addStyle({left: 0, width: targetFrame.x, top: targetFrame.y, height: targetFrame.height}).end()
    .begin('div').classNames(['right', 'cover']).addStyle({left: targetFrame.x + targetFrame.width, right:0, top: targetFrame.y, height: targetFrame.height}).end();
    
  }

  // ..........................................................
  // EVENT HANDLING
  // 
  
  // mouseDown: function(evt){
  //   return this._handle_click_event(evt);
  // },
  // 
  // mouseUp: function(evt) {
  //   return this._handle_click_event(evt);
  // },
  // 
  // mouseMoved: function(evt) {
  //   return this._handle_click_event(evt);
  // },
  // 
  // mouseDragged: function(evt) {
  //   return this._handle_click_event(evt);
  // },
  // 
  // 
  // _handle_click_event: function(evt) {
  //   var d = this.designer,
  //       targetFrame = this.get('targetFrame');    
  //   if(this.clickInside(targetFrame, evt) && d){
  //     return (d && d.mouseDown) ? d.mouseDown(evt) : null;
  //   }
  //   else if(d){
  //     d.resignRootDesigner();
  //     return YES;
  //   }
  //   else{
  //     return NO;
  //   }
  // }
  
});
/* >>>>>>>>>> BEGIN source/designers/view_designer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/*global ViewBuilder */
sc_require('views/high_light');
/** @class

  A Designer class provides the core editing functionality you need to edit
  a view in the UI.  When your app loads in `design.mode`, a peer Designer
  instance is created for every view using the class method Designer or
  `SC.ViewDesigner` if the view class does not define a Designer class.

  Whenever you put your app into design mode, all events will be routed first
  to the peer designer for an object, which will have an opportunity to
  prosent a design UI.

  Likewise, the designer palettes provided by the view builder will focus on
  the designer instead of the view itself.

  ## Designer UI

  The basic ViewDesigner class automatically handles the UI interaction for
  layout.  You can also double click on the view to perform a default action.

  For views with `isContainerView` set to `YES`, double clicking on the view will
  automatically "focus" the view.  This allows you to select the view's
  children instead of the view itself.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.ViewDesigner = SC.Object.extend(
/** @scope SC.ViewDesigner.prototype */ {

  /** The view managed by this designer. */
  view: null,

  /** The class for the design.  Set when the view is created. */
  viewClass: null,

  /** Set to YES if the view is currently selected for editing. */
  designIsSelected: NO,

  /** Set to YES if this particular designer should not be enabled. */
  designIsEnabled: YES,

  /**
    The current page.  Comes from the view.

    @property {SC.Page}
  */
  page: function() {
    var v = this.get('view');
    return (v) ? v.get('page') : null;
  }.property('view').cacheable(),

  /**
    The design controller from the page.  Comes from page

    @property {SC.PageDesignController}
  */
  designController: function() {
    var p = this.get('page');
    return (p) ? p.get('designController') : null ;
  }.property('page').cacheable(),

  /**
    If set to NO, the default childView encoding will not run.  You can use
    this option, for example, if your view creates its own childViews.

    Alternatively, you can override the `encodeChildViewsDesign()` and
    `encodeChildViewsLoc()` methods.

    @property {Boolean}
  */
  encodeChildViews: YES,

  concatenatedProperties: ['designProperties', 'localizedProperties', 'excludeProperties'],


  // ..........................................................
  // SIZE AND POSITIONING SUPPORT
  //

  /**
    Set to `NO` to hide horizontal resize handles
  */
  canResizeHorizontal: YES,

  /**
    Set to `NO` to resize vertical handles
  */
  canResizeVertical: YES,

  /**
    Allows moving.
  */
  canReposition: YES,

  /**
    Determines the minimum allowed width
  */
  minWidth: 10,

  /**
    Determines the minimum allowed height
  */
  minHeight: 10,

  /**
    Determines maximum allowed width.  `null` means no limit
  */
  maxWidth: 100000000,

  /**
    Determines maximum allowed height.  `null` means no limit
  */
  maxHeight: 100000000,

  /**
    Returns the current layout for the view.  Set this property to update
    the layout.  Direct properties are exposed a well. You will usually want
    to work with those instead.

    @property
    @type {Hash}
  */
  layout: function(key, value) {
    var view = this.get('view');
    if (!view) return null;

    if (value !== undefined) view.set('layout', value);
    return view.get('layout');
  }.property('view').cacheable(),

  /**
    The current anchor location.  This determines which of the other dimension
    metrics are actually used to compute the layout.  The value may be one of:

       TOP_LEFT, TOP_CENTER, TOP_RIGHT, TOP_HEIGHT,
       CENTER_LEFT, CENTER_CENTER, CENTER_RIGHT, CENTER_HEIGHT
       BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT, BOTTOM_HEIGHT,
       WIDTH_LEFT, WIDTH_CENTER, WIDTH_RIGHT, WIDTH_HEIGHT,
       null

    @property
    @type {Number}
  */
  anchorLocation: function(key, value) {
    var layout = this.get('layout'),
        K      = SC.ViewDesigner,
        h, v, frame, view, pview, pframe, ret;

    if (!layout) return null;

    // update to refelct new anchor locations...
    if (value !== undefined) {

      ret    = {};
      view   = this.get('view');
      frame  = view.get('frame');
      pview  = view.get('parentView');
      pframe = pview ? pview.get('frame') : null;
      if (!pframe) pframe = SC.RootResponder.responder.computeWindowSize();

      // compute new layout in each direction
      if (value & K.ANCHOR_LEFT) {
        ret.left = frame.x;
        ret.width = frame.width;

      } else if (value & K.ANCHOR_RIGHT) {
        ret.right = (pframe.width - SC.maxX(frame));
        ret.width = frame.width;

      } else if (value & K.ANCHOR_CENTERX) {
        ret.centerX = Math.round(SC.midX(frame) - (pframe.width/2)) ;
        ret.width = frame.width;

      } else if (value & K.ANCHOR_WIDTH) {
        ret.left = frame.x;
        ret.right = (pframe.width - SC.maxX(frame));
      }

      // vertical
      if (value & K.ANCHOR_TOP) {
        ret.top = frame.y;
        ret.height = frame.height;

      } else if (value & K.ANCHOR_BOTTOM) {
        ret.bottom = (pframe.height - SC.maxY(frame));
        ret.height = frame.height;

      } else if (value & K.ANCHOR_CENTERY) {
        ret.centerY = Math.round(SC.midY(frame) - (pframe.height/2)) ;
        ret.height = frame.height;

      } else if (value & K.ANCHOR_HEIGHT) {
        ret.top = frame.y;
        ret.bottom = (pframe.height - SC.maxY(frame));
      }

      this.set('layout', ret);
      layout = ret ;
    }

    if (!SC.none(layout.left)) {
      h = SC.none(layout.width) ? K.ANCHOR_WIDTH : K.ANCHOR_LEFT;
    } else if (!SC.none(layout.right)) h = K.ANCHOR_RIGHT;
    else if (!SC.none(layout.centerX)) h = K.ANCHOR_CENTERX;
    else h = 0;

    if (!SC.none(layout.top)) {
      v = SC.none(layout.height) ? K.ANCHOR_HEIGHT : K.ANCHOR_TOP;
    } else if (!SC.none(layout.bottom)) v = K.ANCHOR_BOTTOM ;
    else if (!SC.none(layout.centerY)) v = K.ANCHOR_CENTERY ;
    else v = 0;

    return v | h;
  }.property('layout').cacheable(),

  _layoutProperty: function(key, value) {
    var layout = this.get('layout');
    if (!layout) return null;

    if (!SC.none(layout) && (value !== undefined)) {
      layout = SC.copy(layout);
      layout[key] = value;
      this.set('layout', layout);
    }

    return layout[key];
  },

  /**
    Returns the top offset of the current layout or `null` if not defined
  */
  layoutTop: function(key, value) {
    return this._layoutProperty('top', value);
  }.property('layout').cacheable(),

  /**
    Returns the bottom offset of the current layout or `null` if not defined
  */
  layoutBottom: function(key, value) {
    return this._layoutProperty('bottom', value);
  }.property('layout').cacheable(),

  /**
    Returns the centerY offset of the current layout or `null` if not defined
  */
  layoutCenterY: function(key, value) {
    return this._layoutProperty('centerY', value);
  }.property('layout').cacheable(),

  /**
    Returns the height offset of the current layout or null if not defined
  */
  layoutHeight: function(key, value) {
    return this._layoutProperty('height', value);
  }.property('layout').cacheable(),

  /**
    Returns the top offset of the current layout or `null` if not defined
  */
  layoutTop: function(key, value) {
    return this._layoutProperty('top', value);
  }.property('layout').cacheable(),

  /**
    Returns the left offset of the current layout or `null` if not defined
  */
  layoutLeft: function(key, value) {
    return this._layoutProperty('left', value);
  }.property('layout').cacheable(),

  /**
    Returns the right offset of the current layout or `null` if not defined
  */
  layoutRight: function(key, value) {
    return this._layoutProperty('right', value);
  }.property('layout').cacheable(),

  /**
    Returns the centerX offset of the current layout or `null` if not defined
  */
  layoutCenterX: function(key, value) {
    return this._layoutProperty('centerX', value);
  }.property('layout').cacheable(),

  /**
    Returns the width offset of the current layout or `null` if not defined
  */
  layoutWidth: function(key, value) {
    return this._layoutProperty('width', value);
  }.property('layout').cacheable(),

  // ..........................................................
  // GENERIC PROPERTIES
  //
  // Adds support for adding generic properties to a view.  These will
  // overwrite whatever you write out using specifically supported props.

  // ..........................................................
  // HANDLE ENCODING OF VIEW DESIGN
  //

  /**
    Encodes any simple properties that can just be copied from the view onto
    the coder.  This is used by `encodeDesignProperties()` and
    `encodeLocalizedProperties()`.
  */
  encodeSimpleProperties: function(props, coder) {
    var view = this.get('view'), proto = this.get('viewClass').prototype ;
    props.forEach(function(prop) {
      var val = view[prop] ; // avoid get() since we don't want to exec props

      //handle bindings
      if (prop.length > 7 && prop.slice(-7) === "Binding" && val !== undefined){
        coder.js(prop,val.encodeDesign());
      }
      else{
        if (val !== undefined && (val !== proto[prop])) {
          coder.encode(prop, val) ;
        }
      }
    }, this);
  },


  /**
    Array of properties that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the design
    without added code.  These properties will be encoded by
    `encodeDesignProperties()`.

    You can add to this array in your subclasses.
  */
  designProperties: ['layout', 'isVisible', 'isEnabled', 'styleClass'],


  /*
    Array of properties specifically not displayed in the editable properties
    list
  */

  excludeProperties: ['layout', 'childViews'],


  /*
    Array of properties avaliaible to edit in greenhouse

  */
  editableProperties: function(){

    var con = this.get('designAttrs'),
        view = this.get('view'),
        ret = [],
        designProperties = this.get('designProperties'),
        excludeProperties = this.get('excludeProperties');
    if(con) con = con[0];
    for(var i in con){
      if(con.hasOwnProperty(i) && excludeProperties.indexOf(i) < 0){
        if(!SC.none(view[i])) ret.pushObject(SC.Object.create({value: view[i], key: i, view: view}));
      }
    }
    designProperties.forEach(function(k){
      if(excludeProperties.indexOf(k) < 0){
        ret.pushObject(SC.Object.create({value: view[k], key: k, view: view}));
      }
    });

    return ret;
  }.property('designProperties').cacheable(),


  /**
    Invoked by a design coder to encode design properties.  The default
    implementation invoked `encodeDesignProperties()` and
    `encodeChildViewsDesign()`.  You can override this method with your own
    additional encoding if you like.
  */
  encodeDesign: function(coder) {
    coder.set('className', SC._object_className(this.get('viewClass')));
    this.encodeDesignProperties(coder);
    this.encodeDesignAttributeProperties(coder);
    this.encodeChildViewsDesign(coder);
    return YES ;
  },

  /**
    Encodes the design properties for the view.  These properties are simply
    copied from the view onto the coder.  As an optimization, the value of
    each property will be checked against the default value in the class. If
    they match, the property will not be emitted.
  */
  encodeDesignProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('designProperties'), coder);
  },


  encodeDesignAttributeProperties: function(coder){
    var designProps = this.get('designProperties'),
        designAttrs = this.get('designAttrs'),
        simpleProps = [];

    if(designAttrs) designAttrs = designAttrs[0];

    for(var attr in designAttrs){
      if(designAttrs.hasOwnProperty(attr) && designProps.indexOf(attr) < 0 && attr !== 'childViews'){
        simpleProps.push(attr);
      }
    }
    return this.encodeSimpleProperties(simpleProps, coder);
  },

  /**
    Encodes the design for child views.  The default implementation loops
    through child views.  If you store your child views elsewhere in your
    config (for example as named properties), then you may want to override
    this method with your own encoding.
  */
  encodeChildViewsDesign: function(coder) {
    if (!this.get('encodeChildViews')) return;
    var view = this.view, childViews = view.get('childViews');
    if (childViews.length>0) coder.object('childViews', childViews);
  },

  /**
    Array of localized that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the
    localization without added code.  These properties will be encoded by
    `encodeLocalizedProperties()`.

    You can add to this array in your subclasses.
  */
  localizedProperties: [],

  /**
    Invoked by a localization coder to encode design properties.  The default
    implementation invoked `encodeLocalizedProperties()` and
    `encodeChildViewsLoc()`.  You can override this method with your own
    additional encoding if you like.
  */
  encodeLoc: function(coder) {
    coder.set('className', SC._object_className(this.get('viewClass')));
    this.encodeLocalizedProperties(coder);
    this.encodeChildViewsLoc(coder);
    return YES ;
  },

  /**
    Encodes the localized properties for the view.  These properties are
    simply copied from the view onto the coder.  As an optimization, the value
    of  each property will be checked against the default value in the class.
    If they match, the property will not be emitted.
  */
  encodeLocalizedProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('localizedProperties'),coder);
  },

  /**
    Encodes the design for child views.  The default implementation loops
    through child views.  If you store your child views elsewhere in your
    config (for example as named properties), then you may want to override
    this method with your own encoding.
  */
  encodeChildViewsLoc: function(coder) {
    if (!this.get('encodeChildViews')) return;
    var view = this.view, childViews = view.childViews;
    if (childViews.length>0) coder.object('childViews', childViews);
  },

  /**
    This method is invoked when the designer is instantiated.  You can use
    this method to reload any state saved in the view.  This method is called
    before any observers or bindings are setup to give you a chance to
    configure the initial state of the designer.
  */
  awakeDesign: function() {},


  /**
    over-ride this method in your designers to customies drop operations
    default just calls appendChild

    TODO: Come up with a better name for this method.
  */
  addView: function(view){
    this.view.appendChild(view);
  },

  // ..........................................................
  // VIEW RELAYING
  //
  // View property changes relay automatically...

  /**
    Invoked whenever the view changes.  This will observe all property
    changes on the new view.
  */
  viewDidChange: function() {
    var view = this.get('view'), old = this._designer_view ;
    if (view === old) return; // nothing to do

    var func = this.viewPropertyDidChange ;
    if (old) old.removeObserver('*', this, func);
    this._designer_view = view ;
    if (view) view.addObserver('*', this, func);
    this.viewPropertyDidChange(view, '*', null, null);
  }.observes('view'),

  /**
    Invoked whenever a property on the view has changed.  The passed key will
    be '*' when the entire view has changed.  The default implementation here
    will notify the property as changed on the receiver if the
    property value is undefined on the receiver.

    It will notify all properties changed for '*'.  You may override this
    method with your own behavior if you like.
  */
  viewPropertyDidChange: function(view, key) {
    if (key === '*') this.allPropertiesDidChange();
    else if (this[key] === undefined) this.notifyPropertyChange(key) ;

    if ((key === '*') || (key === 'layout')) {
      if (this.get('designIsSelected') && this._handles) {
        this._handles.set('layout', SC.clone(view.get('layout')));
      }
    }
  },

  /**
    The `unknownProperty` handler will pass through to the view by default.
    This will often provide you the support you need without needing to
    customize the Designer.  Just make sure you don't define a conflicting
    property name on the designer itself!
  */
  unknownProperty: function(key, value) {
    if (value !== undefined) {
      this.view.set(key, value);
      return value ;
    } else return this.view.get(key);
  },

  // ......................................
  // PRIVATE METHODS
  //

  init: function() {

    // setup design from view state...
    this.awakeDesign();

    // setup bindings, etc
    arguments.callee.base.apply(this,arguments);

    // now add observer for property changes on view to relay change out.
    this.viewDidChange();

    // and register with designController, if defined...
    var c= this.get('designController');
    if (c) c.registerDesigner(this) ;

  },

  destroy: function() {
    arguments.callee.base.apply(this,arguments);
    this.set('view', null); // clears the view observer...
  },

  designIsSelectedDidChange: function() {
    if (SC.kindOf(this.view, SC.Pane)) return this ;

    var isSel = this.get('designIsSelected');
    var handles = this._handles;

    if (isSel) {

      if (!handles) {
        handles = this._handles = SC.SelectionHandlesView.create({
          designer: this
        });
      }

      var parent = this.view.get('parentView');
      if (!handles.get('parentView') !== parent) parent.appendChild(handles);
      handles.set('layout', this.view.get('layout'));
    } else if (handles) {
      if (handles.get('parentView')) handles.removeFromParent();
    }
  }.observes('designIsSelected'),

  tryToPerform: function(methodName, arg1, arg2) {
    // only handle event if we are in design mode
    var page = this.view ? this.view.get('page') : null ;
    var isDesignMode = page ? page.get('needsDesigner') || page.get('isDesignMode') : NO ;

    // if we are in design mode, route event handling to the designer
    // otherwise, invoke default method.
    if (isDesignMode) {
      return arguments.callee.base.apply(this,arguments);
    } else {
      return SC.Object.prototype.tryToPerform.apply(this.view, arguments);
    }
  },

  // ..........................................................
  // DRAWING SUPPORT
  //

  /**
    Update the layer to add any design-specific marking
  */
  didCreateLayer: function() {},

  /**
    Update the layer to add any design-specific marking
  */
  didUpdateLayer: function() {},

  /**
    Update the layer to add any design-specific marking
  */
  willDestroyLayer: function() {},

  // ..........................................................
  // ROOT DESIGNER SUPPORT
  //

  parentDesignerIsRoot: function(){
    var dc = this.get('designController'), view = this.get('view');
    return dc.get('rootDesigner') === view.getPath('parentView.designer');
  }.property(),

  /**
    set this property to `YES` if you want your designer to become Root
  */
  acceptRootDesigner: NO,

  isRootDesigner: NO,

  isRootDesignerDidChange: function() {

    var isRoot = this.get('isRootDesigner'),
        highLight = this._highLight;

    if (isRoot && this.get('designIsEnabled')) {

      if (!highLight) {
        highLight = this._highLight = SC.RootDesignerHighLightView.create({
          designer: this
        });
      }

      var parent = this.view.get('parentView');
      highLight.set('targetFrame', this.view.get('frame'));

      if (!highLight.get('parentView') !== parent) parent.insertBefore(highLight,this.view);
    }
    else if (highLight) {
      if (highLight.get('parentView')) highLight.removeFromParent();
    }
  }.observes('isRootDesigner'),

  resignRootDesigner: function(){
    var prevRoot = this.get('prevRootDesigner');
    if(this.get('isRootDesigner') && prevRoot){
      var dc = this.get('designController');
      if(dc) dc.makeRootDesigner(prevRoot);
    }
  },

  shouldReleaseRootDesigner: function(evt){
    var frame = this.view.get('frame');
    if(this.get('isRootDesigner') && !SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame)){
      this.resignRootDesigner();
      return YES;
    }
    return NO;
  },

  // ..........................................................
  // MOUSE HANDLING
  //

  HANDLE_MARGIN: 10,

  /**
    Select on `mouseDown`.  If `metaKey` or `shiftKey` is pressed, add to
    selection.  Otherwise just save starting info for dragging
  */
  mouseDown: function(evt) {
    this.shouldReleaseRootDesigner(evt);
    if (!this.get('designIsEnabled') || !this.get('parentDesignerIsRoot')) return NO ;

    // save mouse down info
    var view = this.get('view'),
        info, vert, horiz, repos, frame, pview, margin, canH, canV;

    if (!view) return NO; // nothing to do

    // save mouse down state for later use
    this._mouseDownInfo = info = {
      layout:   SC.copy(view.get('layout')),
      selected: this.get('designIsSelected'),
      dragged:  NO,
      metaKey:  evt.metaKey || evt.shiftKey,
      source:   this,
      x: evt.pageX, y: evt.pageY
    };
    info.hanchor = info.vanchor = info.reposition = NO;

    // detect what operations are available.
    repos = this.get('canReposition');
    horiz = vert = NO ;
    if (info.selected) {
      frame = view.get('frame');
      pview = view.get('parentView');
      if (frame && pview) frame = pview.convertFrameToView(frame, null);

      margin = this.HANDLE_MARGIN;

      // detect if we are in any hotzones
      if (frame) {
        if (Math.abs(info.x - SC.minX(frame)) <= margin) {
          horiz = "left";
        } else if (Math.abs(info.x - SC.maxX(frame)) <= margin) {
          horiz = "right";
        }

        if (Math.abs(info.y - SC.minY(frame)) <= margin) {
          vert = "top";
        } else if (Math.abs(info.y - SC.maxY(frame)) <= margin) {
          vert = "bottom";
        }
      }

      canH = this.get('canResizeHorizontal');
      canV = this.get('canResizeVertical');

      // look for corners if can resize in both directions...
      if (canH && canV) {
        if (!vert || !horiz) vert = horiz = NO ;

      // if can only resize horizonal - must be in middle vertical
      } else if (canH) {
        vert = NO ;
        if (Math.abs(info.y - SC.midY(frame)) > margin) horiz = NO;

      // if can only resize vertical - must be in middle horizontal
      } else if (canV) {
        horiz = NO ;
        if (Math.abs(info.x - SC.midX(frame)) > margin) vert = NO ;

      // otherwise, do not allow resizing
      } else horiz = vert = NO ;
    }

    // now save settings...
    if (horiz) info.hanchor = horiz ;
    if (vert) info.vanchor = vert ;
    if (!horiz && !vert && repos) info.reposition = YES ;

    // if not yet selected, select item immediately.  This way future events
    // will be handled properly
    if (!info.selected) {
      this.get('designController').select(this, info.metaKey);
    }

    // save initial info on all selected items
    if (info.reposition) this.get('designController').prepareReposition(info);

    return YES ;
  },

  prepareReposition: function(info) {
    var view = this.get('view'),
        layout = view ? SC.copy(view.get('layout')) : {};
    info[SC.keyFor('layout', SC.guidFor(this))] = layout;
    return this ;
  },

  /**
    mouse dragged will resize or reposition depending on the settings from
    mousedown.
  */
  mouseDragged: function(evt) {
    if (!this.get('designIsEnabled') || !this.get('parentDesignerIsRoot')) return NO ;
    var info = this._mouseDownInfo,
        view = this.get('view'),
        layout, startX, startY;
    //do some binding!!!
    if(evt.altKey && SC._Greenhouse){
      startX = evt.pageX;
      startY = evt.pageY;

      var dragLink = SC.DrawingView.create({
        layout: {left: 0, top: 0, right: 0, bottom: 0},
        startPoint: {x: startX, y: startY},
        endPoint: {x: startX, y: startY},
        // private update
        _pointsDidChange: function(){
          var sp = this.get('startPoint'),
              ep = this.get('endPoint'),
              xDiff, yDiff, newLink;

          xDiff = Math.abs(sp.x - ep.x);
          yDiff = Math.abs(sp.y - ep.y);
          if (xDiff > 5 || yDiff > 5){
            newLink = {};
            newLink.shape = SC.LINE;
            newLink.start = {x: sp.x, y: sp.y};
            newLink.end = {x: ep.x, y: ep.y};
            newLink.style = { color: 'green', width: 3 };
            this.setIfChanged('shapes', [newLink]);
          }
        }.observes('startPoint', 'endPoint')
      });
      SC.designPage.get('designMainPane').appendChild(dragLink);

      SC.Drag.start({
        event: evt,
        source: this,
        dragLink: dragLink,
        dragView: SC.View.create({ layout: {left: 0, top: 0, width: 0, height: 0}}),
        ghost: NO,
        slideBack: YES,
        dataSource: this,
        anchorView: view
      });
    }
    //normal drag
    else{
      if (view && (info.hanchor || info.vanchor)) {
        layout = SC.copy(this.get('layout'));
        if (info.hanchor) this._mouseResize(evt, info, this.HKEYS, layout);
        if (info.vanchor) this._mouseResize(evt, info, this.VKEYS, layout);
        this.set('layout', layout);

      } else if (info.reposition) {
        this.get('designController').repositionSelection(evt, info);
      }
    }

  },

  // ..........................................................
  // Drag source and drag data source
  //
  dragDataTypes: ['SC.Binding'],

  dragDataForType: function(drag, dataType) {
    return dataType === 'SC.Binding' ? this.get('view') : null;
  },

  /**
    On `mouseUp` potentially change selection and cleanup.
  */
  mouseUp: function(evt) {
    if (!this.get('designIsEnabled') || !this.get('parentDesignerIsRoot')) return NO ;

    var info = this._mouseDownInfo;

    // if selected on mouse down and we didn't do any dragging, then deselect.
    if (info.selected && !info.dragged) {

      // is the mouse still inside the view?  If not, don't do anything...
      var view = this.get('view'),
          frame = view ? view.get('frame') : null,
          pview = view.get('parentView');

      if (frame && pview) frame = pview.convertFrameToView(frame, null);

      if (!frame || SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame)) {
        var controller = this.get('designController');
        if (info.metaKey) controller.deselect(this);
        else controller.select(this, NO);
      }
    }
    //double click
    if(SC._Greenhouse && evt.clickCount === 2){
      var dc = this.get('designController');
      if(this.acceptRootDesigner && dc) {
        dc.makeRootDesigner(this);
      }
      else{
        //TODO: [MB] decide if this is the functionality I want...
        SC._Greenhouse.sendAction('openInspector', view);
      }
    }

    this._mouseDownInfo = null;

    return YES ;
  },

  /**
    Called by `designerController` to reposition the view
  */
  mouseReposition: function(evt, info) {
    var layout = SC.copy(this.get('layout'));
    this._mouseReposition(evt, info, this.HKEYS, layout);
    this._mouseReposition(evt, info, this.VKEYS, layout);
    this.set('layout', layout);
    return this;
  },

  HKEYS: {
    evtPoint: "pageX",
    point:    "x",
    min:      "minWidth",
    max:      "maxWidth",
    head:     "left",
    tail:     "right",
    center:   "centerX",
    size:     "width",
    anchor:   "hanchor"
  },

  VKEYS: {
    evtPoint: "pageY",
    point:    "y",
    min:      "minHeight",
    max:      "maxHeight",
    head:     "top",
    tail:     "bottom",
    center:   "centerY",
    size:     "height",
    anchor:   "vanchor"
  },

  /**
    Generic resizer.  Must pass one set of keys: VKEYS, HKEYS
  */
  _mouseResize: function(evt, info, keys, ret) {

    var delta  = evt[keys.evtPoint] - info[keys.point],
        layout = info.layout,
        view   = this.get('view'),
        min    = this.get(keys.min),
        max    = this.get(keys.max),

        headKey   = keys.head,
        tailKey   = keys.tail,
        centerKey = keys.center,
        sizeKey   = keys.size,

        hasHead   = !SC.none(layout[keys.head]),
        hasTail   = !SC.none(layout[keys.tail]),
        hasCenter = !SC.none(layout[keys.center]),
        hasSize   = !SC.none(layout[keys.size]),
        w;

    if (info[keys.anchor] === headKey) {

      // if left aligned, adjust left size and width if set.
      if (hasHead) {
        if (hasSize) {
          w = layout[sizeKey];
          ret[sizeKey] = Math.min(max, Math.max(min, Math.floor(layout[sizeKey] - delta)));
          min = (layout[headKey]+w) - min;
          max = (layout[headKey]+w) - max;

          ret[headKey] = Math.max(max, Math.min(min, Math.floor(layout[headKey]+delta)));

        } else {
          ret[headKey] = Math.floor(layout[headKey]+delta);
        }

      // if right aligned or centered, adjust the width...
      } else if (hasTail || hasCenter) {
        if (hasCenter) delta *= 2;
        ret[sizeKey] = Math.max(min, Math.min(max, Math.floor((layout[sizeKey]||0)-delta)));

      // otherwise, adjust left
      } else ret[headKey] = Math.floor((layout[headKey]||0)+delta);

    } else if (info[keys.anchor] === tailKey) {

      // reverse above
      if (hasTail) {

        if (hasSize) {
          w = layout[sizeKey];
          ret[sizeKey] = Math.min(max, Math.max(min, Math.floor(layout[sizeKey] + delta)));
          min = (layout[tailKey]+w)-min;
          max = (layout[tailKey]+w)-max;

          ret[tailKey] = Math.max(max, Math.min(min, Math.floor(layout[tailKey]-delta)));

        } else {
          ret[tailKey] = Math.floor(layout[tailKey]-delta);
        }

      } else {
        if (hasCenter) delta *= 2;
        ret[sizeKey] = Math.max(min, Math.min(max, Math.floor((layout[sizeKey]||0)+delta)));
      }
    }

    return this;
  },

  _mouseReposition: function(evt, info, keys, ret) {
    var delta  = evt[keys.evtPoint] - info[keys.point],
        layout = info[SC.keyFor('layout', SC.guidFor(this))],
        view   = this.get('view'),

        headKey   = keys.head,
        tailKey   = keys.tail,
        centerKey = keys.center,
        sizeKey   = keys.size,

        hasHead   = !SC.none(layout[headKey]),
        hasTail   = !SC.none(layout[tailKey]),
        hasCenter = !SC.none(layout[centerKey]),
        hasSize   = !SC.none(layout[sizeKey]),
        w;

    // auto-widths can't be repositioned
    if (hasHead && hasTail && !hasSize) return NO ;

    // left/top aligned, just adjust top/left location
    if (hasHead) {
      ret[headKey] = layout[headKey]+delta;

    // right/bottom aligned, adjust bottom/right location
    } else if (hasTail) {
      ret[tailKey] = layout[tailKey]-delta;

    } else if (hasCenter) {
      ret[centerKey] = layout[centerKey]+delta;

    } else ret[headKey] = (layout[headKey]||0)+delta;

    return YES ;
  },

  // ..........................................................
  // Drag data source (for binding lines)
  //
  /**
    This method must be overridden for drag operations to be allowed.
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value.

    @param {SC.View} dropTarget The proposed target of the drop.
    @param {SC.Drag} drag The SC.Drag instance managing this drag.

  */
  dragSourceOperationMaskFor: function(drag, dropTarget) {
    return SC.DRAG_LINK;
  },

  /**
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receiver is the source of the
    drag.

    @param {SC.Drag} drag The Drag instance managing this drag.

    @param {Point} loc The point in *window* coordinates where the drag
      began.  You can use convertOffsetFromView() to convert this to local
      coordinates.
  */
  dragDidBegin: function(drag, loc) {
  },

  /**
    This method is called whenever the drag image is moved.  This is
    similar to the `dragUpdated()` method called on drop targets.

    @param {SC.Drag} drag The Drag instance managing this drag.

    @param {Point} loc  The point in *window* coordinates where the drag
      mouse is.  You can use convertOffsetFromView() to convert this to local
      coordinates.
  */
  dragDidMove: function(drag, loc) {
    var dragLink = drag.dragLink;
    var endX, endY, pv, frame, globalFrame;
    if (dragLink) {
      // if using latest SproutCore 1.0, loc is expressed in browser window coordinates
      pv = dragLink.get('parentView');
      frame = dragLink.get('frame');
      globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      if (globalFrame) {
        endX = loc.x - globalFrame.x;
        endY = loc.y - globalFrame.y;
        dragLink.set('endPoint', {x: endX , y: endY});
      }
    }
  },

  /**
    This method is called when the drag ended. You can use this to do any
    cleanup.  The operation is the actual operation performed on the drag.

    @param {SC.Drag} drag The drag instance managing the drag.

    @param {Point} loc The point in WINDOW coordinates where the drag
      ended.

    @param {DragOp} op The drag operation that was performed. One of
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.

  */
  dragDidEnd: function(drag, loc, op) {
    var dragLink = drag.dragLink;
    if (dragLink) dragLink.destroy();
  }
}) ;

// Set default Designer for view
if (!SC.View.Designer) SC.View.Designer = SC.ViewDesigner ;

// ..........................................................
// DESIGN NOTIFICATION METHODS
//
// These methods are invoked automatically on the designer class whenever it
// is loaded.

SC.ViewDesigner.mixin({

  ANCHOR_LEFT:    0x0001,
  ANCHOR_RIGHT:   0x0002,
  ANCHOR_CENTERX: 0x0004,
  ANCHOR_WIDTH:   0x0010,

  ANCHOR_TOP:     0x0100,
  ANCHOR_BOTTOM:  0x0200,
  ANCHOR_CENTERY: 0x0400,
  ANCHOR_HEIGHT:  0x1000,

  /**
    Invoked whenever a designed view is loaded.  This will save the design
    attributes for later use by a designer.
  */
  didLoadDesign: function(designedView, sourceView, attrs) {
    designedView.isDesign = YES ; // indicates that we need a designer.
    designedView.designAttrs = attrs;
    //designedView.sourceView = sourceView; TODO: not sure we need this...
  },

  /**
    Invoked whenever a location is applied to a designed view.  Saves the
    attributes separately for use by the design view.
  */
  didLoadLocalization: function(designedView, attrs) {
    // nothing to do for now.
  },

  /**
    Invoked whenver a view is created.  This will create a peer designer if
    needed.
  */
  didCreateView: function(view, attrs) {
    // add designer if page is in design mode
    var page = view.get('page'), design = view.constructor;

    if (design.isDesign && page && page.get('needsDesigner')) {

      // find the designer class
      var cur = design, origDesign = design;
      while(cur && !cur.Designer) cur = cur.superclass;
      var DesignerClass = (cur) ? cur.Designer : SC.View.Designer;

      // next find the first superclass view that is not a design (and a real
      // class).  This is important to make sure that we can determine the
      // real name of a view's class.
      while (design && design.isDesign) design = design.superclass;
      if (!design) design = SC.View;

      view.designer = DesignerClass.create({
        view: view,
        viewClass: design,
        designAttrs: origDesign.designAttrs
        //sourceView: origDesign.sourceView TODO: not sure we need this...
      });
    }
  }

});


// ..........................................................
// FIXUP SC.View
//

SC.View.prototype._orig_respondsTo = SC.View.prototype.respondsTo;
SC.View.prototype._orig_tryToPerform = SC.View.prototype.tryToPerform;
SC.View.prototype._orig_createLayer = SC.View.prototype.createLayer;
SC.View.prototype._orig_updateLayer = SC.View.prototype.updateLayer;
SC.View.prototype._orig_destroyLayer = SC.View.prototype.destroyLayer;

/**
  If the view has a designer, then patch respondsTo...
*/
/*SC.View.prototype.respondsTo = function( methodName ) {
  var ret = !!(SC.typeOf(this[methodName]) === SC.T_FUNCTION);
  if (this.designer) ret = ret || this.designer.respondsTo(methodName);
  return ret ;
} ;*/
SC.View.prototype.respondsTo = function( methodName ) {
  if (this.designer) {
    var ret = !!(SC.typeOf(this[methodName]) === SC.T_FUNCTION);
    ret = ret || this.designer.respondsTo(methodName);
    return ret;
  }
  else {
    return this._orig_respondsTo(methodName);
  }
};

/**
  If the view has a designer, give it an opportunity to handle an event
  before passing it on to the main view.
*/
/*SC.View.prototype.tryToPerform = function(methodName, arg1, arg2) {
  if (this.designer) {
    return this.designer.tryToPerform(methodName, arg1, arg2);
  } else {
    return this._orig_respondsTo(methodName) && this[methodName](arg1, arg2);
  }
} ;*/
SC.View.prototype.tryToPerform = function(methodName, arg1, arg2) {
  if (this.designer) {
    return this.designer.tryToPerform(methodName, arg1, arg2);
  }
  else {
    return this._orig_tryToPerform(methodName, arg1, arg2);
  }
};


/*
  If the view has a designer, also call designers didCreateLayer method to
  allow drawing.
*/
SC.View.prototype.createLayer = function() {
  var ret = this._orig_createLayer.apply(this, arguments);
  if (this.designer) this.designer.didCreateLayer();
  return ret ;
};

/*
  If the view has a designer, also call the designer's didUpdateLayer method
  to allow drawing.
*/
SC.View.prototype.updateLayer = function() {
  var ret = this._orig_updateLayer.apply(this, arguments);
  if (this.designer) this.designer.didUpdateLayer();
  return ret ;
};

/**
  If the view has a designer, also call the designers willDestroyLayer
  method.
*/
SC.View.prototype.destroyLayer = function() {
  if (this.designer) this.designer.willDestroyLayer();
  return this._orig_destroyLayer.apply(this, arguments);
};

/* >>>>>>>>>> BEGIN source/mixins/button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.Button.Designer = {

  designProperties: ['title']
  
};
/* >>>>>>>>>> BEGIN source/designers/button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('designers/view_designer');
sc_require('mixins/button');

SC.ButtonView.Designer = SC.ViewDesigner.extend( SC.Button.Designer,
/** @scope SC.ButtonView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: ['theme', 'buttonBehavior', 'href', 'isDefault'],
  
  canResizeVertical: NO,
  
  canResizeHorizontal: YES
  
});
/* >>>>>>>>>> BEGIN source/designers/label.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('designers/view_designer');

SC.LabelView.Designer = SC.ViewDesigner.extend(
/** @scope SC.LabelView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: ['value', 'escapeHTML']
  
});
/* >>>>>>>>>> BEGIN source/designers/object_designer.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global SC */

/** @class
  This is a basic designer used for all `SC.Object`s that are created in
  design mode.
  
  FIXME: have `SC.ViewDesigner` subclass this designer.....

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.ObjectDesigner = SC.Object.extend(
/** @scope SC.ViewDesigner.prototype */ {

  /** The object managed by this designer. */
  object: null,
  
  /** The class for the design.  Set when the object is created. */
  objectClass: null,
  
  /** Set to `YES` if the object is currently selected for editing. */
  designIsSelected: NO,

  /** Set to `YES` if this particular designer should not be enabled. */
  designIsEnabled: YES,
  
  /**
    The current page.  Comes from the object.
    
    @property {SC.Page}
  */
  page: function() {
    var v = this.get('object');
    return (v) ? v.get('page') : null;
  }.property('object').cacheable(),
  
  /**
    The design controller from the page.  Comes from page
    
    @property {SC.PageDesignController}
  */
  designController: function() {
    var p = this.get('page');
    return (p) ? p.get('designController') : null ;  
  }.property('page').cacheable(),
  
  
  concatenatedProperties: ['designProperties', 'localizedProperties', 'excludeProperties'],

  // ..........................................................
  // GENERIC PROPERTIES
  // 
  // Adds support for adding generic properties to a object.  These will
  // overwrite whatever you write out using specifically supported props.
    
  // ..........................................................
  // HANDLE ENCODING OF VIEW DESIGN
  // 

  /**
    Encodes any simple properties that can just be copied from the object onto
    the coder.  This is used by encodeDesignProperties() and 
    encodeLocalizedProperties().
  */
  encodeSimpleProperties: function(props, coder) {
    var object = this.get('object'), proto = this.get('objectClass').prototype ;
    props.forEach(function(prop) {
      var val = object[prop] ; // avoid get() since we don't want to exec props
      if (val !== undefined && (val !== proto[prop])) {
        coder.encode(prop, val) ;
      }
    }, this);
  },
  

  /** 
    Array of properties that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the design
    without added code.  These properties will be encoded by 
    `encodeDesignProperties()`.
    
    You can add to this array in your subclasses.
  */
  designProperties: [],
  
  /*
    Array of properties specifically not displayed in the editable properties
    list
  */
  
  excludeProperties: [],
  
  
  /*
    Array of properties avaliaible to edit in greenhouse
    
  */
  editableProperties: function(){

    var con = this.get('designAttrs'), 
        obj = this.get('object'),
        ret = [],
        designProperties = this.get('designProperties'),
        excludeProperties = this.get('excludeProperties');
    if(con) con = con[0];
    for(var i in con){
      if(con.hasOwnProperty(i) && excludeProperties.indexOf(i) < 0){
        if(!SC.none(obj[i])) ret.pushObject(SC.Object.create({value: obj[i], key: i, view: obj}));
      }
    }
    designProperties.forEach(function(k){
      if(excludeProperties.indexOf(k) < 0){
        ret.pushObject(SC.Object.create({value: obj[k], key: k, view: obj}));
      }
    });
    
    return ret; 
  }.property('designProperties').cacheable(),
  
  /** 
    Invoked by a design coder to encode design properties.  The default 
    implementation invoked `encodeDesignProperties()` and
    `encodeChildViewsDesign()`.  You can override this method with your own
    additional encoding if you like.
  */
  encodeDesign: function(coder) {
    coder.set('className', SC._object_className(this.get('objectClass')));
    this.encodeDesignProperties(coder);
    return YES ;
  },

  /**
    Encodes the design properties for the object.  These properties are simply
    copied from the object onto the coder.  As an optimization, the value of 
    each property will be checked against the default value in the class. If
    they match, the property will not be emitted.
  */
  encodeDesignProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('designProperties'), coder);
  },
  
  /** 
    Array of localized that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the 
    localization without added code.  These properties will be encoded by 
    `encodeLocalizedProperties()`.
    
    You can add to this array in your subclasses.
  */
  localizedProperties: [],
  
  /** 
    Invoked by a localization coder to encode design properties.  The default 
    implementation invoked `encodeLocalizedProperties()` and
    `encodeChildViewsLoc()`.  You can override this method with your own
    additional encoding if you like.
  */
  encodeLoc: function(coder) {
    coder.set('className', SC._object_className(this.get('objectClass')));
    this.encodeLocalizedProperties(coder);
    return YES ;
  },

  /**
    Encodes the localized properties for the object.  These properties are 
    simply copied from the object onto the coder.  As an optimization, the value 
    of  each property will be checked against the default value in the class. 
    If they match, the property will not be emitted.
  */
  encodeLocalizedProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('localizedProperties'),coder);
  },

  /**
    This method is invoked when the designer is instantiated.  You can use 
    this method to reload any state saved in the object.  This method is called
    before any observers or bindings are setup to give you a chance to 
    configure the initial state of the designer.
  */
  awakeDesign: function() {},
  
  /**
    The `unknownProperty` handler will pass through to the object by default.
    This will often provide you the support you need without needing to 
    customize the Designer.  Just make sure you don't define a conflicting
    property name on the designer itself!
  */
  unknownProperty: function(key, value) {
    if (value !== undefined) {
      this.object.set(key, value);
      return value ;
    } else return this.object.get(key);
  },
  
  // ......................................
  // PRIVATE METHODS
  //
  
  init: function() {
    
    // setup design from object state...
    this.awakeDesign();
    
    // setup bindings, etc
    arguments.callee.base.apply(this,arguments);
        
    // and register with designController, if defined...
    var c= this.get('designController');
    if (c) c.registerDesigner(this) ;
    
  },

  destroy: function() {
    arguments.callee.base.apply(this,arguments);
    this.set('object', null); // clears the object observer...  
  },
    
  tryToPerform: function(methodName, arg1, arg2) {
    // only handle event if we are in design mode
    var page = this.object ? this.object.get('page') : null ;
    var isDesignMode = page ? page.get('needsDesigner') || page.get('isDesignMode') : NO ;

    // if we are in design mode, route event handling to the designer
    // otherwise, invoke default method.
    if (isDesignMode) {
      return arguments.callee.base.apply(this,arguments);
    } else {
      return SC.Object.prototype.tryToPerform.apply(this.object, arguments);
    }
  }
}) ;

// Set default Designer for object
if (!SC.Object.Designer) SC.Object.Designer = SC.ObjectDesigner ;

// ..........................................................
// DESIGN NOTIFICATION METHODS
//
// These methods are invoked automatically on the designer class whenever it 
// is loaded.

SC.ObjectDesigner.mixin({
  /**
    Invoked whenever a designed object is loaded.  This will save the design
    attributes for later use by a designer.
  */
  didLoadDesign: function(designedObject, sourceObject, attrs) {
    designedObject.isDesign = YES ; // indicates that we need a designer.
    designedObject.designAttrs = attrs;
    //designedObject.sourceObject = sourceObject; TODO: don't need this..
  },

  /**
    Invoked whenever a location is applied to a designed object.  Saves the 
    attributes separately for use by the design object.
  */
  didLoadLocalization: function(designedObject, attrs) {
    // nothing to do for now.
  },
  
  /**
    Invoked whenver a object is created.  This will create a peer designer if 
    needed.
  */
  didCreateObject: function(object, attrs) {
    // add designer if page is in design mode
    var page = object.get('page'), design = object.constructor;
    
    if (design.isDesign && page && page.get('needsDesigner')) {
      
      // find the designer class
      var cur = design, origDesign = design;
      while(cur && !cur.Designer) cur = cur.superclass;
      var DesignerClass = (cur) ? cur.Designer : SC.Object.Designer;
      
      // next find the first superclass object that is not a design (and a real
      // class).  This is important to make sure that we can determine the 
      // real name of a object's class.
      while (design && design.isDesign) design = design.superclass;
      if (!design) design = SC.Object;
      
      object.designer = DesignerClass.create({
        object: object,
        objectClass: design,
        designAttrs: origDesign.designAttrs
        //sourceObject: origDesign.sourceObject TODO: don't need this
      });
    }
  }
  
});

/* >>>>>>>>>> BEGIN source/designers/tab.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('designers/view_designer');

SC.TabView.Designer = SC.ViewDesigner.extend(
/** @scope SC.TabView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  acceptRootDesigner: YES,
  
  designProperties: ['nowShowing', 'items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'itemIconKey', 'itemWidthKey', 'tabLocation', 'userDefaultKey']
  
});
/* >>>>>>>>>> BEGIN source/designers/text_field.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('designers/view_designer');

SC.TextFieldView.Designer = SC.ViewDesigner.extend(
/** @scope SC.TabView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: ['isPassword', 'isTextArea', 'hint']
});
/* >>>>>>>>>> BEGIN source/ext/binding.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SproutCore -- JavaScript Application Framework
// ========================================================================

/** 
  Extend SC.Binding with properites that make it easier to detect bindings
  in the inspector
*/
SC.Binding.isBinding = true;


SC.Binding.displayValue = function(){
  var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot,this._fromPropertyPath) : this._fromPropertyPath;

  var to = this._toPropertyPath;

  var oneWay = this._oneWay ? '[oneWay]' : '';
  return "%@ -> %@ %@".fmt(from, to, oneWay);

};


SC.Binding.encodeDesign = function(coder){
  var ret = "SC.Binding";
  
  if(this._fromPropertyPath){
    ret= ret+".from('"+this._fromPropertyPath+"')";
  }
  if(this._oneWay){
    ret = ret+".oneWay()";
  }
  return ret;//coder.js(key,ret);
};

/* >>>>>>>>>> BEGIN source/ext/object.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  Patch SC.Object to respond to design
  
*/
SC.Object.prototype.emitDesign = function() {
  
  // get design...
  var ret = SC.ObjectCoder.encode(this);
  
  return ret ;
};


/** 
  Patch `SC.Object` to respond to `encodeDesign()`.  This will proxy to the
  paired designer, if there is one.  If there is no paired designer, returns
  `NO`.
*/
SC.Object.prototype.encodeDesign = function(coder) {
  return this.designer ? this.designer.encodeDesign(coder) : NO ;
};

/* >>>>>>>>>> BEGIN source/ext/page.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** 
  Extend `SC.Page` to emit a design document for the entire page.
*/
SC.Page.prototype.emitDesign = function() {

  // awake all views.  this is needed to emit the design for them.
  this.awake();

  // the pageName must be set on the page so we can emit properly
  var pageName = this.get('pageName');
  
  // now encode the page.
  var ret = SC.DesignCoder.encode(this);
  
  // and add some wrapper
  ret = ['// SproutCore ViewBuilder Design Format v1.0',
    '// WARNING: This file is automatically generated.  DO NOT EDIT.  Changes you',
    '// make to this file will be lost.', '',
    '%@ = %@;'.fmt(pageName, ret),''].join("\n");
  
  return ret ;
};

/**
  Extend `SC.Page` to create a `PageDesignController` on demand.
  
  @property {SC.PageDesignController}
*/
SC.Page.prototype.designController = function() {
  if (!this._designController) {
    this._designController = SC.PageDesignController.create({ page: this });
  }
  return this._designController ;
}.property().cacheable();

/** @private implement support for encoders */
SC.Page.prototype.encodeDesign = function(c) {
  // step through and find all views.  encode them.
  for(var key in this) {
    if(!this.hasOwnProperty(key)) continue;
    var view = this[key];
    if (key !== '__sc_super__' && key !== '_designController' &&
        (view instanceof SC.View || view instanceof SC.Controller || view instanceof SC.Object)){
     c.js(key, view.emitDesign());      
    }
  }
  
  // save page name;
  c.string('pageName', this.get('pageName'));
};
  


/* >>>>>>>>>> BEGIN source/ext/view.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/*jslint evil:true */

/** 
  Extend `SC.View` with `emitDesign()` which will encode the view and all of its
  subviews then computes an empty element to attach to the design.
*/
SC.View.prototype.emitDesign = function() {
  
  // get design...
  var ret = SC.DesignCoder.encode(this);
  
  return ret ;
};

/** 
  Patch `SC.View` to respond to `encodeDesign()`.  This will proxy to the
  paired designer, if there is one.  If there is no paired designer, returns
  `NO`.
*/
SC.View.prototype.encodeDesign = function(coder) {
  return this.designer ? this.designer.encodeDesign(coder) : NO ;
};

/* >>>>>>>>>> BEGIN source/views/drawing.js */
/** @class
  This View is used by Greenhouse when application is in design mode
  This is a Drawing View:
  If you want to draw a new shape you can pass in the information:
  For a Line:

      {
        +shape: SC.LINE,
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
        +shape: SC.RECT,
        +start: {x: 0, y: 0},
        +size: {width: 100, height: 100},
        ?type: SC.FILL | SC.STROKE
        ?style: {
          ?width: 5,
          ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
          ?transparency: 0.2
        }
      }

  For a Circle:

      {
        +shape: SC.CIRCLE,
        +center: {x: 0, y: 0},
        +radius: 20,
        ?type: SC.FILL | SC.STROKE
        ?style: {
          ?width: 5,
          ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
          ?transparency: 0.2
        }
      }

  For a Polygon:

      {
        +shape: SC.POLY
        +path: [
          +{x: 0, y: 0},
          +{x: 10, y: 10},
          ?{x: 0, y: 50}
        ],
        ?type: SC.FILL | SC.STROKE
        ?style: {
          ?width: 5,
          ?color: 'orange' | '#FFA500' | 'rgb(255,165,0)' | 'rgba(255,165,0,1)'
          ?transparency: 0.2
        }
      }
  
  @author Evin Grano 
  @extends SC.View
  @since SproutCore 1.0
*/
SC.LINE = 'line';
SC.RECT = 'rect';
SC.CIRCLE = 'circle';
SC.POLY = 'poly';

SC.FILL = 'fill';
SC.STROKE = 'stroke';


SC.DrawingView = SC.View.extend({
  
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
    this.registerShapeDrawing( SC.LINE, function(ctx, params){
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
    this.registerShapeDrawing( SC.RECT, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      switch(params.type){
        case SC.FILL:
          ctx.fillRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        case SC.STROKE:
          ctx.strokeRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
        default:
          ctx.clearRect(params.start.x, params.start.y, params.size.width, params.size.height);
          break;
      }
    });
    
    // Drawing a Circle
    this.registerShapeDrawing( SC.CIRCLE, function(ctx, params){
      if (params.style){
        if (params.style.width) ctx.lineWidth = params.style.width;
        if (params.style.color) ctx.fillStyle =  ctx.strokeStyle = params.style.color;
        if (params.style.transparency) ctx.globalAlpha = params.style.transparency;
      }
      ctx.beginPath();
      ctx.arc(params.center.x,params.center.y,params.radius,0,Math.PI*2,true);
      if (params.type === SC.FILL) ctx.fill();
      else ctx.stroke();
    });
    
    // Drawing a Polygon
    this.registerShapeDrawing( SC.POLY, function(ctx, params){
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
      if (params.type === SC.FILL) ctx.fill();
      else ctx.stroke();
    });
  },
  
  render: function(context, firstTime) {
    //console.log('%@.render()'.fmt(this));
    var frame = this.get('frame');
    if (firstTime) {
      if (!SC.browser.msie) {
        context.push('<canvas class="base-layer" width="%@" height="%@">You can\'t use canvas tags</canvas>'.fmt(frame.width, frame.height));
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
            SC.Logger.error("SC.DrawingView.render(): Canvas object context is not accessible.");
          }
        }
        else {
          SC.Logger.error("SC.DrawingView.render(): Canvas element array length is zero.");
        }
      }
      else {
        SC.Logger.error("SC.DrawingView.render(): Canvas element is not accessible.");
      }
    }
    
    return arguments.callee.base.apply(this,arguments);
  },
  
  registerShapeDrawing: function(name, drawingFunction){
    if (!name) {
      SC.Logger.error('Can\'t register this drawing paradigm because name is null');
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
    var shapes = this.get('shapes');
    var drawingFunc;
    for (var i=0,len=shapes.length;i<len;i++){
      curr = shapes[i];
      drawingFunc = this._drawingManager[curr.shape];
      if (drawingFunc) drawingFunc(cntx, curr);
    }
  }
});

/* >>>>>>>>>> BEGIN source/mixins/snap_lines.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC SnapLines
// ========================================================================
sc_require('views/drawing');
/**
  @mixin
  @author Mike Ball
  
  Add this Mixin to any View and it gives you an API to draw snap lines for
  all the child views
*/

//the number of pixles that will cause a snap line (factor of 2?)
SC.SNAP_ZONE = 2;

SC.SNAP_LINE = {
  shape: SC.LINE,
  start: {x: 0, y: 0},
  end: {x: 0, y: 0},
  style: {
    width: 0.5,
    color: '#00c6ff'
    //transparency: 0.2
  }
};


SC.SnapLines = {
  
  hasSnapLines: YES,
  
  
  
  /*
    This method will setup the datastructure required to draw snap lines
    it should be called in dragStarted if using with an `SC.Drag` or on
    `mouseDown` if using it with a move
  
    @param {Array} ignoreViews array of views to not include
    sets up the data structure used for the line drawing
  */
  setupData: function(ignoreViews){
    if(!ignoreViews) ignoreViews = [];
    this.removeLines(); //can't have any existing lines
    this._xPositions = {};
    this._yPositions = {}; 
    
    var xPositions = this._xPositions, yPositions = this._yPositions, children = this.get('childViews'), 
        that = this, parentView, frame, minX, midX, maxX, minY, midY, maxY, factor = (SC.SNAP_ZONE*2);
    
    
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

    parent = this;    
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
    and draw any lines.  It should be called in `dragUpdated` if using `SC.Drag`
    or in `mouseMoved` if using a move.  it will also return a hash of the
    snapped coords in local and global coodinates
    
  */
  drawLines: function(view, eventX, eventY, mouseDownX, mouseDownY){
    if(!this._drawingView){
      this._drawingView = this.createChildView(SC.DrawingView.design({
        shapes: []
      }));
      this.appendChild(this._drawingView);
    }
    var factor = (SC.SNAP_ZONE*2), shapes = [], xline, yline, frame, parent, rMinX, rMidX, rMaxX,
        rMinY, rMidY, rMaxY, rMinXMod, rMidXMod, rMaxXMod, rMinYMod, rMidYMod, rMaxYMod, xHit, yHit,
        moveDirection = this._dragDirection(eventX, eventY, mouseDownX, mouseDownY), xValues, yValues, 
        that = this, xHitVals, yHitVals, ret;
    //get the frame and all the relavent points of interest
    parent = view.get('parentView');
    frame = parent ? parent.convertFrameToView(view.get('frame'), null) : view.get('frame');
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
      xline = SC.copy(SC.SNAP_LINE);
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
      yline = SC.copy(SC.SNAP_LINE);
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
    This method should be called in `mouseUp` if doing a move and in
    `dragEnded` if using a `SC.Drag`.
  */
  removeLines: function() {
    this._xPositions = null;
    this._yPositions = null;
    this._globalFrame = null;
    if(this._drawingView) {
      this.removeChild(this._drawingView);
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


/* >>>>>>>>>> BEGIN source/views/designer_drop_target.js */
// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals SC */
/*jslint evil: true*/
/** 
  @class
  This View is used by Greenhouse when application is in design mode
  
  
  @extends SC.ContainerView
*/
SC.DesignerDropTarget = SC.ContainerView.extend(
  /** @scope SC.DesignerDropTarget.prototype */ {
  
  inGlobalOffset: YES,
  
  // ..........................................................
  // Key Events
  // 
  acceptsFirstResponder: YES,
  
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt);
  },
  
  keyUp: function(evt) {
    return YES; 
  },
  
  deleteForward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },
  
  deleteBackward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },

  moveLeft: function(sender, evt) {
    return YES;
  },
  
  moveRight: function(sender, evt) {   
    return YES;
  },
  
  moveUp: function(sender, evt) {
    return YES;
  },
  
  moveDown: function(sender, evt) {
    return YES;
  },

  // ..........................................................
  // Drag and drop code
  // 
  isDropTarget: YES,
  
  targetIsInIFrame: YES,
  
  dragStarted: function(drag, evt) {
  },
  
  dragEntered: function(drag, evt) {
  },
  
  dragUpdated: function(drag, evt) {},
  
  dragExited: function(drag, evt) {},
  
  dragEnded: function(drag, evt) {},
  

  computeDragOperations: function(drag, evt) { 
    return SC.DRAG_ANY; 
  },
  

  acceptDragOperation: function(drag, op) { 
    var data = drag.dataForType('SC.Object'),
        scClass = eval(data.get('scClass'));
    return scClass.kindOf(SC.View);
  },
  
  /**
    Called to actually perform the drag operation.
    
    Overide this method to actually perform the drag operation.  This method
    is only called if you returned `YES` in `acceptDragOperation()`.
    
    Return the operation that was actually performed or `SC.DRAG_NONE` if the
    operation was aborted.
    
    The default implementation returns `SC.DRAG_NONE`
    
    @param {SC.Drag} drag The drag instance managing this drag
    @param {DragOp} op The proposed drag operation. A drag constant.
    
    @return {DragOp} Drag Operation actually performed
  */
  performDragOperation: function(drag, op) {
    var data = drag.dataForType('SC.Object'),
        cv = this.get('contentView'),
        loc = drag.get('location'),
        iframeOffset = drag.globalTargetOffset,
        design, size, newView, defaults, layout;
    var page = cv.get('page');
    var designController = page.get('designController'),
        rootDesigner = designController.get('rootDesigner');
    var rootDesignerFrame = rootDesigner.get('frame');
    //TODO: [MB] should we move most of this into the designer's addView?
    //size and location
    size = data.get('size');
    loc.x = loc.x - iframeOffset.x - rootDesignerFrame.x;
    loc.y = loc.y - iframeOffset.y - rootDesignerFrame.y;
    //setup design (use eval to make sure code comes from iframe)
    //TODO use new Function("return "+data.get('scClass))() ?...
    design = eval(data.get('scClass'));
    defaults = data.get('defaults') || {};
    layout = defaults.layout || {};
    layout = SC.merge(layout, {top: loc.y, left: loc.x});
    //pull width and height from ghost if none exists form defaults
    if(!layout.width) layout.width = drag.getPath('ghostView.layout').width;
    if(!layout.height) layout.height = drag.getPath('ghostView.layout').height;
    defaults.layout = layout;
    design = design.design(defaults);
    //drop it in the root designer
    newView = design.create({page: page});
    if(rootDesigner && newView){
      rootDesigner.addView(newView);
      //cv.appendChild(newView);
    }
    page.get('designController').select(newView.get('designer'));
    return SC.DRAG_ANY; 
  }
  
  
});

/* >>>>>>>>>> BEGIN source/views/page_item_view.js */
// ==========================================================================
// SC.pageItemView
// ==========================================================================
/*globals SC */

/** @class
  This View is used by Greenhouse when application is in design mode
  Used for displaying page items

  @extends SC.ListItemVIew
  @author Mike Ball
  
*/

SC.pageItemView = SC.ListItemView.extend(
/** @scope SC.ListItemView.prototype */ { 
  isDropTarget: YES,

  dragEntered: function(drag, evt) {
    this.$().addClass('highlight');
  },

  dragExited: function(drag, evt) {
    this.$().removeClass('highlight');
 
  },

  dragEnded: function(drag, evt) {
    this.$().removeClass('highlight');
 
  },

  /**
   Called when the drag needs to determine which drag operations are
   valid in a given area.

   Override this method to return an OR'd mask of the allowed drag 
   operations.  If the user drags over a droppable area within another 
   droppable area, the drag will latch onto the deepest view that returns one 
   or more available operations.

   The default implementation returns `SC.DRAG_NONE`

   @param {SC.Drag} drag The current drag object
   @param {SC.Event} evt The most recent mouse move event.  Use to get 
     location 
   @returns {DragOps} A mask of all the drag operations allowed or 
     SC.DRAG_NONE
  */
  computeDragOperations: function(drag, evt) { 
    if(drag.hasDataType('SC.Binding')){
      return SC.DRAG_LINK;
    }
    return SC.DRAG_NONE; 
  },

  /**
   Called when the user releases the mouse.

   This method gives your drop target one last opportunity to choose to 
   accept the proposed drop operation.  You might use this method to
   perform fine-grained checks on the drop location, for example.
   Return true to accept the drop operation.

   The default implementation returns `YES`.

   @param {SC.Drag} drag The drag instance managing this drag
   @param {DragOp} op The proposed drag operation. A drag constant

   @return {Boolean} YES if operation is OK, NO to cancel.
  */  
  acceptDragOperation: function(drag, op) { return YES; },

  /**
   Called to actually perform the drag operation.

   Overide this method to actually perform the drag operation.  This method
   is only called if you returned `YES` in `acceptDragOperation()`.

   Return the operation that was actually performed or `SC.DRAG_NONE` if the
   operation was aborted.

   The default implementation returns `SC.DRAG_NONE`

   @param {SC.Drag} drag The drag instance managing this drag
   @param {DragOp} op The proposed drag operation. A drag constant.

   @return {DragOp} Drag Operation actually performed
  */
  performDragOperation: function(drag, op) { 
    var data = drag.dataForType('SC.Binding'), that = this;
    if(data && SC._Greenhouse){
      var actionObj = SC.Object.create({
        type: 'Binding', 
        source: data,
        target: that.get('content'),
        addItem: function(from, to, designAttrs){
          var view = this.getPath('source');
          var value = that._propertyPathForProp(this.getPath('target.view.page'),this.getPath('target.view'));
          view[from+"Binding"] = designAttrs[from+"Binding"] = value+"."+to;
          view.propertyDidChange(from+"Binding");
          
          var designer = view.get('designer');
          if(designer){
            designer.designProperties.pushObject(from+"Binding");
            designer.propertyDidChange('editableProperties');
          }
          if(view.displayDidChange) view.displayDidChange();
        }
      });

      SC._Greenhouse.sendAction('newBindingPopup', actionObj);

      return SC.DRAG_LINK;
    }
    else{
      return SC.DRAG_NONE; 
    }
  },
  
  _propertyPathForProp: function(page, prop){
    for(var key in page){
      if(page.hasOwnProperty(key)){
        if(page[key] === prop) return page.get('pageName')+"."+key.toString();
      }
    }
  }
   
});


/* >>>>>>>>>> BEGIN source/views/selection_handles.js */
// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2011, Strobe Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  This View is used by Greenhouse when application is in design mode
  This view draws selection handles for a given designer.  It will also 
  forward any mouse events to the underlying designer.
*/
SC.SelectionHandlesView = SC.View.extend(
/** @scope SC.SelectionHandlesView.prototype */ {

  /**
    The designer that owns this selection.  mouse and keyboard events are 
    forwarded to this.
  */
  designer: null,
  
  classNames: 'handles',
  
  render: function(context, firstTime) {
    var designer = this.get('designer'),
        vertical = designer ? designer.get('canResizeVertical') : NO,
        horizontal = designer ? designer.get('canResizeHorizontal') : NO,
        handles ;
        
    // render handles
    if (firstTime || (vertical !== this._vertical) || (horizontal === this._horizontal)) {
      this._vertical = vertical ;
      this._horizontal = horizontal;

      if (vertical && horizontal) {
        handles = ['top left', 'top right', 'bottom left','bottom right'];
      } else if (vertical) {
        handles = ['top', 'bottom'];
      } else if (horizontal) {
        handles = ['left', 'right'];
      } else handles = [];


      handles.forEach(function(classNames) {
        context.begin('span')
          .classNames(SC.String.w(classNames))
          .addClass('handle')
          .end();
      }, this);
    }
    
  },

  // ..........................................................
  // EVENT HANDLING
  // 
  // By default just forward to designer
  
  mouseDown: function(evt) {
    var d = this.designer;
    return (d && d.mouseDown) ? d.mouseDown(evt) : null;
  },
  
  mouseUp: function(evt) {
    var d = this.designer;
    return (d && d.mouseUp) ? d.mouseUp(evt) : null;
  },
  
  mouseMoved: function(evt) {
    var d = this.designer;
    return (d && d.mouseMoved) ? d.mouseMoved(evt) : null;
  },
  
  mouseDragged: function(evt) {
    var d = this.designer;
    return (d && d.mouseDragged) ? d.mouseDragged(evt) : null;
  }
  
});
/* >>>>>>>>>> BEGIN source/lproj/design_page.js */
// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals SC */
sc_require('views/designer_drop_target');
sc_require('views/page_item_view');
SC.designPage = SC.Page.create({
  // ..........................................................
  // Views used inside iframe...
  // 
  designMainPane: SC.MainPane.design({
    classNames: ['workspace'],
    childViews: ['rotated', 'container', 'viewList'],
    
    container: SC.DesignerDropTarget.design({
      layout: {top: 20, left: 20, right: 20, bottom: 83},
      classNames: ['design'],
      contentViewBinding: SC.Binding.transform(function(value, binding){
        return value && value.kindOf && value.kindOf(SC.View) ? value : null;
      }).from('SC.designController.view')
    }),
    
    rotated: SC.View.design({
      layout: {top: 20, left: 20, right: 20, bottom: 83},
      classNames: ['rotated-page']
    }),
    
    viewList: SC.ScrollView.design({
      layout: {left:0, right: 0, bottom: 0, height: 63},
      classNames: ['dock'],
      hasBorder: NO,
      hasVerticalScroller: NO,
      contentView: SC.GridView.design({
        contentIconKey: 'type',
        exampleView: SC.pageItemView,
        rowHeight: 63,
        columnWidth: 100,
        hasContentIcon: YES,
        //contentBinding: 'SC.designsController',
        delegate: SC.designsController,
        selectionBinding: 'SC.designsController.selection',
        contentValueKey: 'name',
        isDropTarget: YES,
        canEditContent: YES,
        canReorderContent: YES,
        canDeleteContent: YES,
        actOnSelect: YES,
        targetIsInIFrame: YES,
        target: 'SC.designController',
        action: 'viewSelected'
      })
    })
  })
});

