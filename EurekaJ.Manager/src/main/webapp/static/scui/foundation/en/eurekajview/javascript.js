/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// SCUI Framework - Buildfile
// copyright (c) 2009 - Evin Grano, and contributors
// ==========================================================================

// ........................................
// BOOTSTRAP
// 
// The root namespace and some common utility methods are defined here. The
// rest of the methods go into the mixin defined below.

/**
  @namespace
  
  The SCUI namespace.  All SCUI methods and functions are defined
  inside of this namespace.  You generally should not add new properties to
  this namespace as it may be overwritten by future versions of SCUI.
  
  You can also use the shorthand "SCUI" instead of "Scui".
*/
window.Scui = window.Scui || SC.Object.create();
window.SCUI = window.SCUI || window.Scui ;

// Upload Constants
SCUI.READY = 'READY';
SCUI.BUSY = 'BUSY';
SCUI.DONE = 'DONE';
SCUI.ERROR = 'ERROR'; // has to be set manually depending on the response written to the iframe


// ..........................................................
// Disclosed View Constants
// 
SCUI.DISCLOSED_STAND_ALONE    = 'standAlone';
SCUI.DISCLOSED_LIST_DEPENDENT = 'listDependent';
SCUI.DISCLOSED_OPEN = 'open';
SCUI.DISCLOSED_CLOSED = 'closed';
// ..........................................................
// State Constants
// 
SCUI.DEFAULT_TREE = 'default';


/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/controllers/searchable.js */
/*globals SCUI */

SCUI.Searchable = {  
  isSearchable: YES,
  
  /* Params */
  search: null,
  searchResults: [],
  searchKey: 'name',
  minSearchLen: null,
  searchPause: null,
  
  _lastTime: null,
  
  initMixin: function() {
    // init some functions
    this.minSearchLen = this.minSearchLen || 1;
    this.searchPause = this.searchPause || 100;
    this.set('searchResults', []);
    this._runSearch();
  },
  
  _searchDidChange: function(){
    var sp = this.searchPause, c,
        s = this.get('search') || "",
        mc = this.minSearchLen;
        
    // Check for min length
    if (s.length < mc) {
      c = this.get('content') || [];
      this.set('searchResults', c);
      return;
    }
    
    if (sp > 0) {
      this._setSearchInterval(sp);
    }
    else {
      this._runSearch();
    }
    
   }.observes('search', 'content'),
   
   _setSearchInterval: function(pause){
     var that = this;
     if(this._searchTimer) {
       this._searchTimer.invalidate();
       delete this._searchTimer;
     }
     this._searchTimer = SC.Timer.schedule({
       interval: pause,
       action: function(){ that._runSearch(); }
     });
   },

  _sanitizeSearchString: function(str){
    var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    this._cachedRegex = this._cachedRegex || new RegExp('(\\' + specials.join('|\\') + ')', 'g');
    return str.replace(this._cachedRegex, '\\$1');
  },
  
  _runSearch: function(){
    var sr = this.get('searchResults'), 
        sk, search = this.get('search'),
        c = this.get('content');
        
    if (c && !SC.none(search)) {
      if (sr) delete sr;
      search = this._sanitizeSearchString(search).toLowerCase();
      this._lastSearch = search;
      sk = this.get('searchKey');
      sr = this.runSearch(search, c, sk);
    }
    else if (!c) {
      sr = [];
    }
    this.set('searchResults', sr);
  },

  /* OVERRIDE to give the custom searching functionality */
  runSearch: function(search, content, searchKey){
    return content;
  }
};


/* >>>>>>>>>> BEGIN source/controllers/searchable_array.js */
//============================================================================
// SCUI.SearchableArrayController
//============================================================================
sc_require('controllers/searchable');
/**

  This is an implementation of searchable for plain ArrayControllers
  *****This is a hybrid of the collection controller stack*****
  
  @extends SC.ArrayController
  @author Joshua Holt
  @author Evin Grano
  @version 0.5
  @since 0.5

*/

SCUI.SearchableArrayController = SC.ArrayController.extend( SCUI.Searchable,
  /* @scope SCUI.SearchableArrayController.prototype */{
  
  runSearch: function(search, content, searchKey){
    var curObj, searchField, searchTokens, 
        searchResults = [], token, tokenLen,
        searchRegex = new RegExp(search,'i');
    for (var i=0, len = content.get('length'); i < len; i++) {
      curObj = content.objectAt(i);
      searchField = curObj.get(searchKey);
      if (!searchField) continue;
      if ( searchField.toLowerCase().match(searchRegex) ){
        searchResults.push(curObj);
      }
    }

    return searchResults;
  }
  
});


/* >>>>>>>>>> BEGIN source/controllers/searchable_tree.js */
// ==========================================================================
// SCUI.SearchableTreeController
// ==========================================================================
sc_require('controllers/searchable');
/** @class
  
  An tree controller that is searchable and creates a flat search results like
  OSX Finder and Windows Explorer
  
  @extends SC.TreeController
  @author Evin Grano
  @author Brandon Blatnick
  @version 0.5
  @since 0.5
*/

SCUI.SearchableTreeController = SC.TreeController.extend( SCUI.Searchable,
/** @scope SCUI.SearchableTreeController.prototype */ 
{
  
  /*  This can be an array or single */
  store: null,
  orderBy: 'name ASC',
  baseSearchQuery: null,
  baseSearchArray: null,
  
  _baseArray: null,
  
  runSearch: function(search, content, searchKey){
    var searchResults, searchRegex = new RegExp(search,'i');
    
    this._baseArray = this.get('baseSearchArray') || this._createRecordArray();
    searchResults = this._searchInternalArray(searchRegex, this._baseArray, searchKey);
        
    // create the root search tree
    // TODO: [EG] Potential optimization, use the same SC.Object
    var searchedTree = SC.Object.create({
      treeItemIsExpanded: YES,
      treeItemChildren: searchResults
    });
    
    return searchedTree;
  },
  
  _createRecordArray: function(){
    var query, params = {}, store = this.get('store'),
        bsq = this.get('baseSearchQuery'), ret = [];
    if (store && bsq) ret = store.find(bsq);
    return ret;
  },
  
  _searchInternalArray: function(search, content, searchKey){
    var searchField, searchResults = [];
  
    content.forEach( function(x){
      searchField = x.get(searchKey);
      if ( searchField && searchField.match(search) ){
        searchResults.push(x);
      }
    });
  
    return searchResults;
  }
});


/* >>>>>>>>>> BEGIN source/mixins/custom_actions.js */

/**
 The SCUI.CustomActions mixin allows actions and custom mouse events for any
 element that has an id or class on it.
 Useful for when you have a custom render method.

 Example:

 {{{
   SC.View.extend(SCUI.classActions, {

     actions: {
       "#my-search": {  // Match on ID
         target: 'Orion.globalSearchRecord',
         action: 'show'
       },
       // Or match on Class
       ".help":   {target: 'Orion.helpController', action: 'show'},
       ".logout": {
         action: 'logout',
         mouseMoved: function(evt) {
           // We can also have any of the mouse actions too
           // mouseUp,mouseDown,mouseEntered,mouseExited,mouseMoved
         }
       }
     },

     render: function(context, firstTime) {
       context.push(
         "<div id='my-search' class='search' title='", "_Search".loc(),"'></div>",
         "<div class='help' "_Help".loc(),"'></div>",
         "<div class='logout' "_Logout".loc(),"'></div>"
       );
     }

   })
 }}}

 */
SCUI.CustomActions = {
  actions:{},

  hoverClass: 'hover',
  activeClass: 'active',
  _isContinuedMouseDown: NO,
  _mouseDownClass: null,
  _mouseOverClass: null,

  /**
   * Loop through the classActions object to get the keys, which will be class
   * names that need actions.
   */
  _getClassNames: function() {
    var classNames = this._classNames,
        actions, name;
    if(classNames) {
      return classNames;
    }

    classNames = this._classNames = [];

    actions = this.actions;
    for(name in actions){
      if(actions.hasOwnProperty(name)) {
        classNames.push(name);
      }
    }
    return classNames;
  },

  _isInsideNamedClass: function(evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do

    var classNames = this._getClassNames(),
        el = SC.$(evt.target), i,
        clength = classNames.length,
        ret = NO ;

    while(!ret && el.length>0 && (el[0] !== layer)) {
      i = clength;
      while(!ret && ((i--)>=0) ) {
        if (el.is(classNames[i])) ret = classNames[i] ;
      }
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },

  _setDetails: function(classDetails) {
    if(classDetails.set) {classDetails.set('layer', this);}
    else {classDetails['layer'] = this;}
  },

  mouseDown: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className];

    if(classDetails) {
      this._mouseDown(className, evt, classDetails);
      return YES;
    }
  },

  mouseUp: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className];

    if(classDetails) {
      this._mouseUp(className, evt, classDetails);
      return YES;
    }
  },

//  mouseEntered: function(evt) {
//    console.log("Entered!");
//  },

  mouseExited: function(evt) {
    var overClass = this._mouseDownClass;
    if(overClass) {
      this._mouseExited(overClass, evt);
    }
    this._mouseDownClass = null;
  },

  /**
   * Event Dispatchers to subviews.
   */
  _mouseDown: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];
    this._setDetails(classDetails);
    this._isContinuedMouseDown = YES;
    this._mouseDownClass = className;
    this.$(className).addClass(this.activeClass);
    if (classDetails.mouseDown) classDetails.mouseDown(evt);
  },

  _mouseUp: function(className, evt, classDetails) {
    var target, action;
    if(!classDetails) classDetails = this.actions[className];
    if (this._mouseDownClass == className) {
      // Trigger the action
      if (classDetails.get){
        target = classDetails.get('target') || null;
        action = classDetails.get('action');
      } else {
        target = classDetails['target'] || null;
        action = classDetails['action'];
      }
      console.log("Calling Action ", action, "on target", target);
      if (target === undefined && SC.typeOf(action) === SC.T_FUNCTION) {
        action.call(this, evt);
      }
      else if (target !== undefined && SC.typeOf(action) === SC.T_FUNCTION) {
        action.apply(target, [evt]);
      } else {
        this.getPath('pane.rootResponder')
            .sendAction(action, target, this, this.get('pane'));
      }

    }
    this.$(className).removeClass(this.activeClass);
    this._isContinuedMouseDown = NO;
    this._mouseDownClass = null;
  },

  _mouseEntered: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];

    this.$(className).addClass(this.hoverClass);
    if (this._isContinuedMouseDown && this._mouseDownClass == className) {
      this.$(className).addClass(this.activeClass);
    }
    if (classDetails.mouseEntered) classDetails.mouseEntered(evt);
    this._mouseOverClass = className;
  },

  _mouseExited: function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];

    this.$(className).removeClass(this.hoverClass).removeClass(this.activeClass);
    if (classDetails.mouseExited) classDetails.mouseExited(evt);
    this._mouseOverClass = null;
  },

  _mouseMoved:function(className, evt, classDetails) {
    if(!classDetails) classDetails = this.actions[className];
    if (classDetails.mouseMoved) classDetails.mouseMoved(evt);
  },

  mouseMoved: function(evt) {
    var className = this._isInsideNamedClass(evt),
        classDetails = this.actions[className],
        overClass = this._mouseOverClass;
    if(classDetails) {
      if(className !== overClass) {
        if(overClass) this._mouseExited(overClass, evt, classDetails);
        this._mouseEntered(className, evt, classDetails);
      }
      this._mouseMoved(className, evt, classDetails);
    } else if(overClass) {
      this._mouseExited(overClass, evt, classDetails);
    }
  },

//  mouseDragged: function(evt) {
//    console.log('mouseDragged');
//  },

  // ..........................................................
  // touch support
  //
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
  }

};
/* >>>>>>>>>> BEGIN source/mixins/drop_down.js */
// ==========================================================================
// SCUI.DropDown
// ==========================================================================

/*globals SCUI*/

/** @mixin
  This mixin allows a toggling view to show/hide a drop-down when the view
  is toggled.  The user should set the 'dropDown' property to a SC.PickerPane or descendant
  class.  When the view is toggled on, an instance of the dropDown will be
  created and shown.
  
  NOTE: This mixin must be used in conjunction with the SCUI.SimpleButton mixin or
        on a SC.ButtonView or descendant.  It needs the target and action properties to work.

  @author Jonathan Lewis
  @author Brandon Blatnick

*/

SCUI.DropDown = {  
  
  isShowingDropDown: NO,
  
  /**
    params
  */
  target: null,
  action: null,
  closeTarget: null,
  closeAction: null,
  
  /**
    @private
    Reference to the drop down instance that gets created in init().
  */
  _dropDownPane: null,
  
  dropDown: SC.MenuPane.design({ /* an example menu */
    layout: { width: 100, height: 0 },
    contentView: SC.View.design({}),
    items: ["_item".loc('1'), "_item".loc('2')] // Changed to an array for Localization purposes.
  }),
  
  dropDownType: SC.PICKER_MENU,
  
  initMixin: function() {
    var target, action, cTarget, cAction, dropDown;
    // Try to create a new menu instance
    dropDown = this.get('dropDown');
    if (dropDown && SC.typeOf(dropDown) === SC.T_CLASS) {
      this._dropDownPane = dropDown.create();
      this.set('dropDown', this._dropDownPane); // set as pointer to instance for convenience
      if (this._dropDownPane) {
        this.bind('isShowingDropDown', '._dropDownPane.isPaneAttached');
      }
    }

    // Set up the action that gets called on the trigger event
    target = this.target || this;
    action = this.action || 'toggle';
    this.set('target', target);
    this.set('action', action);
    
    // Set up an observer if picker is closed and you want an external event
    if (!SC.none(this.closeAction)){
      this.addObserver('isShowingDropDown', this, this._isShowingDropDownChanged); 
    }
  },
  
  /**  
    Hides the attached drop down if present.  This is called automatically when
    the button gets toggled off.
  */
  hideDropDown: function() {
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.remove) === SC.T_FUNCTION) {
      this._dropDownPane.remove();
      this.set('isShowingDropDown', NO);
    }
  },

  /**
    Shows the menu.  This is called automatically when the button is toggled on.
  */
  showDropDown: function() {
    // If a menu already exists, get rid of it
    this.hideDropDown();

    // Now show the menu
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.popup) === SC.T_FUNCTION) {
      var dropDownType = this.get('dropDownType'),
          view = this.get('layer') || this,
          anchor = this.get('anchor') || this;
      if(SC.typeOf(anchor) === SC.T_STRING) {
        anchor = view.$(anchor).firstObject();
        this.set('anchor', anchor); // cache the DOM reference, as this shouldn't change
      }
      this._dropDownPane.popup(anchor, dropDownType); // show the drop down
      this.set('isShowingDropDown', YES);
    }
  },
  
  /**
    Toggles the menu on/off accordingly
  */
  toggle: function() {
    if (this.get('isShowingDropDown')){
      this.hideDropDown();
    }
    else {
      this.showDropDown();
    }
  },
  
  /**
    this only gets called if there are special external close actions
  */
  _isShowingDropDownChanged: function(){
    var t, a, st = this.get('isShowingDropDown');
    if (st === NO){
      t = this.get('closeTarget') || this.get('target') || this;
      a = this.get('closeAction');
      this.getPath('pane.rootResponder').sendAction(a, t, this, this.get('pane'));
    } 
  }
};


/* >>>>>>>>>> BEGIN source/mixins/dynamic_collections/collection_view_dynamic_delegate.js */
// ==========================================================================
// SCUI.CollectionViewDynamicDelegate
// ==========================================================================

/** @mixin
  
  TODO: [EG] Add Documentation
  
  NOTE: This mixin must be used in conjunction with the SC.CollectionRowDelegate, SCUI.DynamicListItem mixin on the 
        list item views and SCUI.DynamicCollection on the view.

  @author Evin Grano
*/

SCUI.CollectionViewDynamicDelegate = {
  
  isCollectionViewDynamicDelegate: YES,
  
  /**
    This method returns an exampleView class for the passed content
    
    
    @param {SC.CollectionView} view the collection view
    @param {SC.Object} the content for this view
    @returns {SC.View} Instance of the view you'd like to use
  */
  collectionViewContentExampleViewFor: function(view, content, contentIndex) {
    return null ;
  },
  
  /**
    ControllerForContentIndex should accept the index [Number]
    of an item in a recordArray. It should then determine what type of 
    Object controller it should create for the contentItem and return it.
    
    @param content [Object]
    @returns controller [SC.ObjectContrller]
  */
  controllerForContent: function(content){
    return null;
  },
  
  customRowViewMetadata: null,
  
  contentViewMetadataForContentIndex: function(view, contentIndex){
    //console.log('CollectionViewDynamicDelegate(%@): contentViewMetadataForContentIndex for (%@)'.fmt(this, contentIndex));
    var data = null;
    if (view && view.get('isDynamicCollection')){
      var metadata = view.get('customRowViewMetadata');
      if (!SC.none(metadata)) {
        data = metadata.objectAt(contentIndex);
      }
    }
    return data;
  },
  
  contentViewDidChangeForContentIndex: function(view, contentView, content, contentIndex){
    //console.log('CollectionViewDynamicDelegate(%@): contentViewDidChangeForContentIndex for (%@)'.fmt(this, contentIndex));
    // Add it to the customRowHeightIndexes
    if (view && view.isDynamicCollection && contentView && contentView.isDynamicListItem){
      this.collectionViewSetMetadataForContentIndex(view, contentView.get('viewMetadata'), contentIndex);
    }
  },
  
  collectionViewInsertMetadataForContentIndex: function(view, newData, contentIndex){
    var metadata = view.get('customRowViewMetadata');
    if (SC.none(metadata)) return;
    
    var len = metadata.get('length');
    console.log('Before Insert Length: %@'.fmt(len) );
    if (len < 1) metadata = [newData];
    else metadata.replace(contentIndex, 0, [newData]);
    console.log('After Insert Length: %@'.fmt(metadata.length) );
    view.set('customRowViewMetadata', metadata);
    view.rowHeightDidChangeForIndexes(contentIndex);
  },
  
  collectionViewSetMetadataForContentIndex: function(view, newData, contentIndex){
    console.log('\nCollectionViewDynamicDelegate(%@): collectionViewSetMetadataForContentIndex for (%@)'.fmt(this, contentIndex));
    if (view && view.get('isDynamicCollection')){
      var indexes = view.get('customRowHeightIndexes');
      if (SC.none(indexes)) indexes = SC.IndexSet.create();
      indexes.add(contentIndex, 1);
      view.set('customRowHeightIndexes', indexes);
      
      var metadata = view.get('customRowViewMetadata');
      if (SC.none(metadata)) metadata = SC.SparseArray.create();
      metadata.replace(contentIndex, 1, [newData]);
      view.set('customRowViewMetadata', metadata);
      view.rowHeightDidChangeForIndexes(contentIndex);
    }
        
    return newData;
  }
  
};


/* >>>>>>>>>> BEGIN source/mixins/dynamic_collections/dynamic_collection.js */
// ==========================================================================
// SCUI.DropDown
// ==========================================================================

/** 
  @mixin:
  
  TODO: [EG] Add Documentation...
  
  NOTE: This mixin must be used in conjunction with the SCUI.DynamicListItem mixin on the 
        list item views and SCUI.CollectionViewDynamicDelegate on the delegate.

  @author Evin Grano
*/

SCUI.DynamicCollection = {
  
  isDynamicCollection: YES,
  
  customRowViewMetadata: null,
  
  initMixin: function() {
    this.set('customRowViewMetadata', SC.SparseArray.create());
    this.set('rowDelegate', this);
  },
  
  /**
    @property
  */
  rowMargin: 0, 
  
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
    // return from cache if possible
    var content   = this.get('content'),
        itemViews = this._sc_itemViews,
        item = content.objectAt(idx),
        contentDel  = this.get('contentDelegate'),
        del = this.get('delegate'),
        groupIndexes = contentDel.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId, rootController;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 

    // otherwise generate...

    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);
    if (isGroupView) isGroupView = contentDel.contentIndexIsGroup(this, item, idx);
    if (isGroupView) {
      key  = this.get('contentGroupExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('groupExampleView') || this.get('exampleView');

    } else {
      E = this.invokeDelegateMethod(del, 'collectionViewContentExampleViewFor', this, item, idx);
      //try the exampleViewKey
      if(!E){
        key  = this.get('contentExampleViewKey');
        if (key && item) E = item.get(key);
      }
      //use the standard example view
      if (!E) E = this.get('exampleView');
    }
    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.contentIndex = idx;
    attrs.content      = item ;
    attrs.owner        = attrs.displayDelegate = this;
    attrs.parentView   = this.get('containerView') || this ;
    attrs.page         = this.page ;
    attrs.layerId      = this.layerIdFor(idx, item);
    attrs.isEnabled    = contentDel.contentIndexIsEnabled(this, item, idx);
    attrs.isSelected   = contentDel.contentIndexIsSelected(this, item, idx);
    attrs.outlineLevel = contentDel.contentIndexOutlineLevel(this, item, idx);
    attrs.disclosureState = contentDel.contentIndexDisclosureState(this, item, idx); // TODO: [EG] Verify that this is still necessary...
    attrs.isGroupView  = isGroupView;
    attrs.isVisibleInWindow = this.isVisibleInWindow;
    if (isGroupView) attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES;
    else attrs.classNames = this._COLLECTION_CLASS_NAMES;
    
    // generate the customRowHeightIndexes for this view
    layout = this.layoutForContentIndex(idx);
    if (layout) {
      attrs.layout = layout;
    } else {
      delete attrs.layout ;
    }
    
    /** 
      This uses the controllerForContent method in CollectionViewExtDelegate
      below. It will add a rootController property to your itemView if you
      have implemented the controllerForContent method in your controller.
      Otherwise this property will not show up on your view.
    */
    
    /* 
      [JH2] I changed this method invocation to a direct call instead of a 
      call through the invokeDelegateMethod because it was always returning 
      null
    */
    rootController = del.controllerForContent(item);
    if (rootController) {
      attrs.rootController = rootController;
    }else{
      delete attrs.rootController;
    }
    
    /**
      Add the Dynamic delegate if the Example view is A DynamicListItem
    */
    attrs.dynamicDelegate = del;
    var viewMetadata = this.invokeDelegateMethod(del, 'contentViewMetadataForContentIndex', this, idx);
    if (viewMetadata) {
      attrs.viewMetadata = viewMetadata;
    } else {
      delete attrs.viewMetadata ;
    } 

    ret = this.createItemView(E, idx, attrs);
    if (!viewMetadata) {
      viewMetadata = this.invokeDelegateMethod(del, 'collectionViewSetMetadataForContentIndex', this, ret.get('viewMetadata'), idx);
      //console.log('Store Metadata for (%@): with height: %@'.fmt(idx, viewMetadata.height));
    }
    itemViews[idx] = ret ;
    
    return ret ;
  },
  
  /**
  
    Computes the layout for a specific content index by combining the current
    row heights.
  
  */
  layoutForContentIndex: function(contentIndex) {
    var margin = this.get('rowMargin');
    return {
      top:    this.rowOffsetForContentIndex(contentIndex),
      height: this.rowHeightForContentIndex(contentIndex),
      left:   margin, 
      right:  margin
    };
  },
  
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
    //console.log('DynamicCollection(%@): contentIndexRowHeight for (%@)'.fmt(this, contentIndex));
    var height = this.get('rowHeight');
    if (view && view.get('isDynamicCollection')){
      var metadata = view.get('customRowViewMetadata');
      if (!SC.none(metadata)) {
        var currData = metadata.objectAt(contentIndex);
        if (currData && currData.height) height = currData.height;
      }
    }
    //console.log('Returning Height: %@'.fmt(height));
    return height;
  }
};


/* >>>>>>>>>> BEGIN source/mixins/dynamic_collections/dynamic_list_item.js */
// ==========================================================================
// SCUI.DynamicListItem
// ==========================================================================

/** @mixin
  This mixin allows for dynamic root controllers and dynamic root heights
  
  This mixin must be used in conjunction with the SCUI.DynamicCollection mixin on the 
        collection view and SCUI.CollectionViewDynamicDelegate on the delegate.

  @author Evin Grano
*/

SCUI.DynamicListItem = {
  
  /** walk like a duck */
  isDynamicListItem: YES,
  
  /**
    @property: {SC.Object} The dynamic delegate that is called to do adjustments
  */
  dynamicDelegate: null,
  
  /**
    @property {SC.ObjectController | SC.ArrayController}
  */
  rootController: null,
  
  /**
    @property {Object}
  */
  viewMetadata: null,
  
  viewMetadataHasChanged: function(){
    //console.log('\n\nDynamicListItem: viewMetadataHasChanged...');
    var del = this.get('dynamicDelegate');
    this.invokeDelegateMethod(del, 'contentViewDidChangeForContentIndex', this.owner, this, this.get('content'), this.contentIndex);
  }
};


/* >>>>>>>>>> BEGIN source/mixins/mobility.js */
// ==========================================================================
// SCUI.Mobility
// ==========================================================================

/** @class
  
  Mixin to allow for object movement...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.Mobility = {
/* Mobility Mixin */
  viewThatMoves: null,
  
  mouseDown: function(evt) {
    var v, i; 
    // save mouseDown information...
    v = this.get('viewThatMoves') || this;
    if (!v) return YES; // nothing to do...
    
    i = SC.clone(v.get('layout'));
    i.pageX = evt.pageX; i.pageY = evt.pageY ;
    this._mouseDownInfo = i;
    return YES ;
  },
  
  _adjustViewLayoutOnDrag: function(view, curZone, altZone, delta, i, headKey, tailKey, centerKey, sizeKey) {
    // collect some useful values...
    var head = i[headKey], tail = i[tailKey], center = i[centerKey], size = i[sizeKey];
    
    //this block determines what layout coordinates you have (top, left, centerX, centerY, right, bottom)
    //and adjust the view depented on the delta
    if (!SC.none(size)) {
      if (!SC.none(head)) {
        view.adjust(headKey, head + delta);
      } else if (!SC.none(tail)) {
        view.adjust(tailKey, tail - delta) ;
      } else if (!SC.none(center)) {
        view.adjust(centerKey, center + delta);
      }
    }
  },
  
  mouseDragged: function(evt) {
    // adjust the layout...
    var i = this._mouseDownInfo ;
    if(i){
      var deltaX = evt.pageX - i.pageX, deltaY = evt.pageY - i.pageY;
      var view = this.get('viewThatMoves') || this;
    
      this._adjustViewLayoutOnDrag(view, i.zoneX, i.zoneY, deltaX, i, 'left', 'right', 'centerX', 'width') ;
      this._adjustViewLayoutOnDrag(view, i.zoneY, i.zoneX, deltaY, i, 'top', 'bottom', 'centerY', 'height') ;
      return YES ;
    }
    return NO;
  }
};


/* >>>>>>>>>> BEGIN source/mixins/permissible.js */
/*globals SCUI */

/** 

  A mixin to render unauthorized items differently (e.g., change background color or draw a lock icon).
  This is used to differentiate items that are disabled owing to permission issues).
  
  A user of this mixin must set the binding to the 'isPermitted' property.
  When 'isPermitted' is false, the class 'unauthorized' is added.
  
	@author Suvajit Gupta
*/
SCUI.Permissible = {
  
  isPermitted: null,
  isPermittedBindingDefault: SC.Binding.oneWay().bool(),

  displayProperties: ['isPermitted', 'tooltipSuffix'],
  
  /**
    @optional
    What to append to the tooltip when unauthorized
  */
  tooltipSuffix: "(unauthorized)".loc(),
  
  _isPermittedDidChange: function() {
    if(this.get('isPermitted')) {
      if(!SC.none(this._tooltip)) this.setIfChanged('toolTip', this._tooltip);
    }
    else {
      this._tooltip = this.get('toolTip');
      this.set('toolTip', (!(SC.none(this._tooltip)) ? (this._toolTip  + " ") : "") + this.get('tooltipSuffix'));
    }
  }.observes('isPermitted'),

  renderMixin: function(context, firstTime) {
    context.setClass('unauthorized', !this.get('isPermitted'));
  }
  
};


/* >>>>>>>>>> BEGIN source/mixins/recurrent.js */
// ==========================================================================
// SCUI.Recurrent
// ==========================================================================

/**
  @namespace
  
  Implements a SC.Timer pool for complex validation and function invokation
  
  @author: Evin Grano
  @version: 0.5
  @since: 0.5
*/
SCUI.RECUR_ONCE = 'once';
SCUI.RECUR_REPEAT = 'repeat';
SCUI.RECUR_SCHEDULE = 'schedule';
SCUI.RECUR_ALWAYS = 'always';

SCUI.Recurrent = {
  
  isRecurrent: YES,
  
  _timer_pool: {},
  _guid_for_timer: 1,
  
  /*
    Register a single fire of function with: fireOnce(methodName, interval, *validateMethodName, *args)
    
    @param methodName,
    @param interval (in msec),
    @param validateMethodName (*optional, but must be set if using args),
    @param args (*optional)
    @return name to cancel
  */
  fireOnce: function(methodName, interval, validateMethodName){
    if (interval === undefined) interval = 1 ;
    var f = methodName, valFunc = validateMethodName, args, func;
    
    // Check to see if there is a validating function
    if (!validateMethodName) valFunc = function(){ return YES; };
    if (SC.typeOf(validateMethodName) === SC.T_STRING) valFunc = this[validateMethodName];
    
    // name 
    var timerName = this._name_builder(SCUI.RECUR_ONCE, methodName);
    
    // if extra arguments were passed - build a function binding.
    if (arguments.length > 3) {
      args = SC.$A(arguments).slice(3);
      if (SC.typeOf(f) === SC.T_STRING) f = this[methodName] ;
      func = f ;
      f = function() {
        delete this._timer_pool[timerName];
        if (valFunc.call(this)) return func.apply(this, args); 
      } ;
    }

    // schedule the timer
    var timer = SC.Timer.schedule({ target: this, action: f, interval: interval });
    
    this._timer_pool[timerName] = timer;
    return timerName;
  },
  
  _name_builder: function(type, method){
    var name ="%@_%@_%@".fmt(type, method, this._guid_for_timer);
    this._guid_for_timer += 1;
    return name;
  }
  
};
/* >>>>>>>>>> BEGIN source/mixins/resizable.js */
// ==========================================================================
// SCUI.Resizable
// ==========================================================================

/** @class
  
  Mixin to allow for object movement...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/
SCUI.Resizable = {
/* Resizable Mixin */
  viewToResize: null,
  verticalMove: YES,
  horizontalMove: YES,
  maxHeight: null,
  minHeight: null,
  maxWidth: null,
  minWidth: null,
  
  mouseDown: function(evt) {
    var v, i = {};
    // save mouseDown information...
    v = this.get('viewToResize') || this.get('parentView');
    if (!v) return YES; // nothing to do...
    i.resizeView = v;
    var frame = v.get('frame');
    i.width = frame.width;
    i.height = frame.height;
    i.top = frame.y;
    i.left = frame.x;
    //save mouse down
    i.pageX = evt.pageX; i.pageY = evt.pageY;
    this._mouseDownInfo = i;
    return YES ;
  },

  mouseDragged: function(evt) {
    var i = this._mouseDownInfo ;
    if (!i) return YES;
    
    var deltaX = evt.pageX - i.pageX, deltaY = evt.pageY - i.pageY;
    
    if (deltaX === 0 && deltaY === 0) return YES;
    
    var view = i.resizeView;
    var layout = SC.clone(view.get('layout'));
    
    //adjust width
    var hMove = this.get('horizontalMove');
    if (hMove){
      var width = i.width + deltaX;
      var maxWidth = this.get('maxWidth');
      var minWidth = this.get('minWidth');
      if (!SC.none(maxWidth) && width > maxWidth) width = maxWidth;
      else if (!SC.none(minWidth) && width < minWidth) width = minWidth;
      layout.width = width;
    }
    //adjust height
    var vMove = this.get('verticalMove');
    if (vMove){
      var height = i.height + deltaY;
      var maxHeight = this.get('maxHeight');
      var minHeight = this.get('minHeight');
      if (!SC.none(maxHeight) && height > maxHeight) height = maxHeight;
      else if (!SC.none(minHeight) && height < minHeight) height = minHeight;
      layout.height = height;
    }
    // reset top for centerX coords
    layout.top = i.top; 
    // reset left for centerY coords
    layout.left = i.left;
    
    view.set('layout', layout);
    view.updateLayout();
    
    return YES ;
  }
};


/* >>>>>>>>>> BEGIN source/mixins/simple_button.js */
/*globals SCUI*/
/*jslint evil: true */

/** @class
  
  Mixin to allow for simple button actions...
  
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

// Constants - reference SC button mixin constants for plugability
SCUI.ACTION_BEHAVIOR = SC.PUSH_BEHAVIOR;
SCUI.TOGGLE_BEHAVIOR = SC.TOGGLE_BEHAVIOR;
SCUI.RADIO_BEHAVIOR = "radio";

SCUI.SimpleButton = {
/* SimpleButton Mixin */

  target: null,
  action: null,
  hasHover: NO,
  inState: NO,
  buttonBehavior: SCUI.ACTION_BEHAVIOR, // uses constants above
  _hover: NO,
  stateClass: 'state',
  hoverClass: 'hover',
  activeClass: 'active', // Used to show the button as being active (pressed)
  alwaysEnableToolTip: NO,  
  _isMouseDown: NO,
  _isContinuedMouseDown: NO, // This is so we can maintain a held state in the case of mousing out behavior
  _canFireAction: NO,
  
  displayProperties: ['inState', 'isEnabled'],

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    //console.log('SimpleButton#mouseDown()...');
    if (!this.get('isEnabledInPane')) return YES ; // handled event, but do nothing
    this._isMouseDown = this._isContinuedMouseDown = this._canFireAction = YES;
    this.displayDidChange();
    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    //console.log('SimpleButton#mouseExited()...');
    if (this.get('hasHover')) {
      this._hover = NO;
    }
    if (this._isMouseDown) {
      this._isMouseDown = NO;
      this._canFireAction = NO;
    }
    this.displayDidChange();
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    //console.log('SimpleButton#mouseEntered()...');
    if ( this.get('hasHover') ){
      this._hover = YES; 
    }
    if ( this._isContinuedMouseDown ) { 
      this._isMouseDown = YES;
      this._canFireAction = YES;
    }
    this.displayDidChange();
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    var bb;
    this._isMouseDown = this._isContinuedMouseDown = false;
    if (!this.get('isEnabledInPane')) return YES;
    
    // Button Behavior parsing to see what actions should occur 
    bb = this.get('buttonBehavior'); 
    if (bb === SCUI.RADIO_BEHAVIOR){
      if (this.get('inState')) {
        this._canFireAction = false;
        this.displayDidChange();
        return YES;
      }
      else {
        this.set('inState', YES);
      }
    }
    else if (bb === SCUI.TOGGLE_BEHAVIOR ){
      this.set('inState', !this.get('inState'));
    }
    
    //console.log('SimpleButton#mouseUp()...');
    // Trigger the action
    var target = this.get('target') || null;
    var action = this.get('action');    
    // Support inline functions
    if (this._canFireAction) {
      if (this._hasLegacyActionHandler()) {
        // old school... 
        this._triggerLegacyActionHandler(evt);
      } else {
        // newer action method + optional target syntax...
        this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
      }
    }
    this._canFireAction = false;
    this.displayDidChange(); 
    return YES;
  },
  
  // ..........................................................
  // touch support
  // 
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
  
  renderMixin: function(context, firstTime) {
    if (this.get('hasHover')) { 
      var hoverClass = this.get('hoverClass');
      context.setClass(hoverClass, this._hover && !this._isMouseDown); // addClass if YES, removeClass if NO
    }
    
    if (this.get('buttonBehavior') !== SCUI.ACTION_BEHAVIOR) {
      var stateClass = this.get('stateClass');
      context.setClass(stateClass, this.inState); // addClass if YES, removeClass if NO
    }
    
    var activeClass = this.get('activeClass');
    context.setClass(activeClass, this._isMouseDown);
    
    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    
    // if SCUI.SimpleButton.alwaysEnableToolTip is YES and toolTip is null
    // get and use title if available.
    if(this.get('alwaysEnableToolTip') && !toolTip) {
      toolTip = this.get('title');
    }
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc();
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }
  },  
  
  /**
    @private
    From ButtonView 
    Support inline function definitions
   */
  _hasLegacyActionHandler: function(){
    var action = this.get('action');
    if (action && (SC.typeOf(action) === SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) === SC.T_STRING) && (action.indexOf('.') !== -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function(evt){
    var target = this.get('target');
    var action = this.get('action');

    // TODO: [MB/EG] Review: MH added the else if so that the action executes
    // in the scope of the target, if it is specified.
    if (target === undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      this.action(evt);
    }
    else if (target !== undefined && SC.typeOf(action) === SC.T_FUNCTION) {
      action.apply(target, [evt]);
    }
    
    if (SC.typeOf(action) === SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  },
  
  _hasStateProperty: function(key, value) {
    SC.Logger.warn("Deprecation: hasState replaced by buttonBehavior.");

    if (value !== undefined) {
      this.set('buttonBehavior', value ? SCUI.TOGGLE_BEHAVIOR : SCUI.ACTION_BEHAVIOR);
    } else {
      value = this.get('buttonBehavior') !== SCUI.ACTION_BEHAVIOR;
    }
    return value;
  },
  
  initMixin: function() {
    var hasStateProperty = this.hasState;

    // assign computed property
    this.hasState = this._hasStateProperty.property('buttonBehavior').cacheable();

    // now continue initialization - force through that function to get deprecation warning
    if (hasStateProperty !== undefined) {
      this.set('hasState', hasStateProperty);
    }
  }

};


/* >>>>>>>>>> BEGIN source/mixins/status_changed.js */
// ==========================================================================
// SCUI.StatusChanged
// ==========================================================================

/**
  @namespace
  
  Implements common status observation.
  
  @author: Mike Ball
  @version: 0.5
  @since: 0.5
*/
SCUI.StatusChanged = {
  
  notifyOnContentStatusChange: YES,
  
  /**
    Override this method to do any error or success handeling in your own controllers or views...
  */
  contentStatusDidChange: function(status){
    
  },
  
  /**
    what property on this object has a status
    @property
  */
  contentKey: 'content',
  
  /**
    @private
  
    observers the content property's status (if it exists) and calls 
    statusDidChange so you have an oppertunity to take action 
    (eg display an error message) in UI when a record's status changes
  */
  _sc_content_status_changed: function(){
    var status, content, last = this._last_status || 0, that = this;
    if(this.get('contentKey') && this.get) content = this.get(this.get('contentKey'));
    if(content && content.get) status = content.get('status');
    if (last === status) return;
    this._last_status = status;
    if(this.get('notifyOnContentStatusChange') && status && last !== status && this.contentStatusDidChange ) this.invokeLast(function(){ that.contentStatusDidChange(status); });
  },
  
  initMixin: function(){
    if(this.get('notifyOnContentStatusChange') && this.addObserver) {
      var path;
      if(this.get('contentKey')) path = '%@.status'.fmt(this.get('contentKey'));
      if(path && this.addObserver) this.addObserver(path, this, this._sc_content_status_changed); 
    }
  }
};


/* >>>>>>>>>> BEGIN source/mixins/tooltip.js */
/*globals SCUI*/

/**
  @namespace
  
  A render mixin that adds tooltip attributes to the layer DOM.
  
  @author: Michael Harris
  @author: Jonathan Lewis
*/
SCUI.ToolTip = {
  
  toolTip: '',

  /*
    We only want to set the alt attribute if this is mixed-in to an image
    otherwise the alt attribute is useless and pollutes the DOM.
  */
  isImage: NO,
  
  displayProperties: ['toolTip'],

  renderMixin: function(context, firstTime){
    var toolTip = this.get('toolTip');
    var isImage = this.get('isImage'), attr;
    
    // Create a tooltip if alwaysEnableToolTip is YES
    if ( this.get('alwaysEnableToolTip') && !toolTip ) {
      toolTip = this.get('title');
    }
    
    // make sure the tooltip is a string, and don't allow any double quote characters
    toolTip = (SC.typeOf(toolTip) === SC.T_STRING) ? SC.RenderContext.escapeHTML(toolTip).replace(/\"/g, '\'') : '';
    
    if (isImage) {
      attr = {
        title: toolTip,
        alt: toolTip
      };
    } else {
      attr = {
        title: toolTip
      };
    }

    context = context.attr(attr);
  }
};


/* >>>>>>>>>> BEGIN source/mixins/undoable.js */
// ==========================================================================
// SCUI.Undoable
// ==========================================================================

/**
  @namespace
  
  The SCUI.Undoable mixin makes it easy to automatically register undo operations
  on your view whenever relevant properties change.  To use this mixin, include 
  it in your view and then add the names of the properties you want to trigger 
  an undo register when they change..
  
  h2. Example
  
  {{{
    MyApp.MyViewClass = SC.View.extend(SCUI.Undoable, { 
      undoableProperties: 'title height width'.w(),
      ...
    });
  }}}
*/
SCUI.Undoable = {
  
  /** 
    Add an array with the names of any property on the view that should register 
    an undo of the same property on the undo manager for your view. 
    
    @property {Array}
  */
  undoableProperties: [],

  /** @private
    Register undoable property observer...
  */
  initMixin: function() {
    var valueCache, up = this.get('undoableProperties') ; 
    var idx = up.length ;
    valueCache = this._undoableProperty_didChange_valueCache = {};
    while (--idx >= 0) {
      var key = up[idx];
      this.addObserver(key, this, this.undoablePropertyDidChange);
      valueCache[key] = this.get(key);
    }
  },
  
  /**
   * Remove undoable property observer...
   * @private
   */
  destroyMixin: function () {
    var up = this.get('undoableProperties');
    var idx = up.length;
    while (--idx >= 0) {
      var key = up[idx];
      this.removeObserver(key, this, this.undoablePropertyDidChange);
    } 
    
    this._undoableProperty_didChange_valueCache = null;
  },

  /**
    This method is invoked whenever an undoable property changes.  It will register 
    the undo of the value that the property was set to.
  */
  undoablePropertyDidChange: function(target, key) {
    var newValue = this.get(key);
    var valueCache = this._undoableProperty_didChange_valueCache ;
    var oldValue = valueCache[key];
    
    if (this.undoablePropertyShouldRegisterUndo(key, oldValue, newValue)) {
      // register undo operation with old value
      var undoManager = this.get('undoManager');
      if (undoManager) {
        undoManager.registerUndo(function() {
          this.set(key, oldValue);
        }, this);
      }
      // update the cache
      valueCache[key] = newValue; 
    }
  },
  
  /**
  
    Called just before registering the undo operation to give you and 
    opportunity to decide if the register should be allowed.  Override
    for more fine-grained control
    
    The default implementation returns YES if the value changes.
    
    @param key {String} the property to register undo
    @param oldValue old value of property
    @param newValue new value of property
    @returns {Boolean} YES to alow, NO to prevent it
  */
  undoablePropertyShouldRegisterUndo: function(key, oldValue, newValue) {
    return (newValue !== oldValue);
  }
};

/* >>>>>>>>>> BEGIN source/panes/context_menu_pane.js */
// ========================================================================
// SCUI.ContextMenuPane
// ========================================================================

/**

  Extends SC.MenuPane to position a right-click menu pane.

  How to use:
    
    In your view, override mouseDown() or mouseUp() like this:
  
    {{{
      mouseDown: function(evt) {
        var menuOptions = [
          { title: "Menu Item 1", target: null, 
            action: '', isEnabled: YES },
          { isSeparator: YES },
          { title: "Menu Item 2", 
            target: '', action: '', isEnabled: YES }
        ];    
  
        var pane = SCUI.ContextMenuPane.create({
          contentView: SC.View.design({}),
          layout: { width: 194, height: 0 },
          itemTitleKey: 'title',
          itemTargetKey: 'target',
          itemActionKey: 'action',
          itemSeparatorKey: 'isSeparator',
          itemIsEnabledKey: 'isEnabled',
          items: menuOptions
        });
  
        pane.popup(this, evt); // pass in the mouse event so the pane can figure out where to put itself

        return arguments.callee.base.apply(this,arguments); // or whatever you want to do
      }  
    }}}

  @extends SC.MenuPane
  @author Josh Holt
  @author Jonathan Lewis


*/

SCUI.ContextMenuPane = SC.MenuPane.extend({
  
  /**
    This flag is for the special case when the anchor view is using static
    layout, i.e ( SC.StackedView, or mixn SC.StaticLayout).
  */
  usingStaticLayout: NO,
  
  /**
    If evt is a right-click, this method pops up a context menu next to the mouse click.
    Returns YES if we popped up a context menu, otherwise NO.
    
    AnchorView must be a valid SC.View object.
  */
  popup: function(anchorView, evt) {
    var items = this.get('items');
    if (!items || items.get('length') <= 0) return NO;
    if ((!anchorView || !anchorView.isView) && !this.get('usingStaticLayout')) return NO;
  
    if (evt && evt.button && (evt.which === 3 || (evt.ctrlKey && evt.which === 1))) {
  
      
      // prevent the browsers context meuns (if it has one...). (SC does not handle oncontextmenu event.)
      document.oncontextmenu = function(e) {
        if (evt.preventDefault) {
          evt.preventDefault();
        } else { 
          evt.stop();
        }
        evt.returnValue = false;
        evt.stopPropagation();
        return false;
      };
      
      // calculate offset needed from top-left of anchorViewOrElement to position the menu
      // pane next to the mouse click location
      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;  
      var gFrame = SC.viewportOffset(anchor);
      var offsetX = evt.pageX - gFrame.x;
      var offsetY = evt.pageY - gFrame.y;

      // Popup the menu pane
      this.beginPropertyChanges();
      var it = this.get('displayItems');
      this.set('anchorElement', anchor) ;
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU) ;
      this.endPropertyChanges();
      
      return arguments.callee.base.apply(this,[anchorView, [offsetX + 2, offsetY + 2, 1] ]);
    }
    else {
      //document.oncontextmenu = null; // restore default browser context menu handling
    }
    return NO;
  },

  /**
    Override remove() to restore the default browser context menus when this pane goes away.
  */
  remove: function() {
   //this.invokeLater(function(){document.oncontextmenu = null; console.log('removing contextmenu event');}); //invoke later to ensure the event is over...
    return arguments.callee.base.apply(this,arguments);
  },
  
  
  /**
   * The following events are receiving the event argument as the second 
   * argument so we are capturing both args and then pass the evt on to the 
   * super (menu pane) to be handled or not.
   *  
   * This also handles the case where the the event is actually sent correctly
   * and thus pass on the sender as the event b/c in correct situations the 
   * sender argument is the event...
   */
  
  keyUp: function(sender, evt) {
    if (evt && evt.commandCodes) {
      return arguments.callee.base.apply(this,[evt]);
    }
    else if (sender && sender.commandCodes) {
      return arguments.callee.base.apply(this,[sender]);
    }
    else {
     return NO; 
    }
  },
  
  keyDown: function(sender, evt) {
    if (evt && evt.commandCodes) {
      return arguments.callee.base.apply(this,[evt]);
    }
    else if (sender && sender.commandCodes) {
      return arguments.callee.base.apply(this,[sender]);
    }
    else {
     return NO; 
    }

  },
  
  exampleView: SC.MenuItemView.extend({
    keyUp: function(sender, evt) {
      if (evt && evt.commandCodes) {
        return arguments.callee.base.apply(this,[evt]);
      }
      else if (sender && sender.commandCodes) {
        return arguments.callee.base.apply(this,[sender]);
      }
      else {
       return NO; 
      }
    },

    keyDown: function(sender, evt) {
      if (evt && evt.commandCodes) {
        return arguments.callee.base.apply(this,[evt]);
      }
      else if (sender && sender.commandCodes) {
        return arguments.callee.base.apply(this,[sender]);
      }
      else {
       return NO; 
      }
    }
  })
  

});


/* >>>>>>>>>> BEGIN source/panes/modal_pane.js */
// ========================================================================
// SCUI.ModalPane
// ========================================================================

/**

  Picker pane with bottom right resizable thumb.

  @extends SC.PickerPane
  @author Josh Holt
  @author Jonathan Lewis


*/

SCUI.ModalPane = SC.PalettePane.extend({
  
  maxHeight: null,
  minHeight: null,
  maxWidth: null,
  minWidth: null,
  
  title: '',
  titleIcon: null,
  titleBarHeight: 24,
  
  footerHeight: 40,

  /**
    The footer view.  Override to provide a custom view, or set to null
    to exclude.  (Default is empty).
  */
  footerView: null,
  
  isResizable: YES,
  margin: 20, // override if you need to
  
  isModal: YES,
  
  nowShowing: null,
  
  /**
    The modal pane to place behind this pane if this pane is modal.  This 
    must be a subclass or an instance of SC.ModalPane.
  */
  modalPane: SC.ModalPane.extend({
    classNames: 'for-sc-panel'
  }),
  
  _containerView: null,
  
  _isFullscreened: NO,
  
  mouseDown: function(evt) { 
    if (this._titleBarClicked === YES) {
      arguments.callee.base.apply(this,arguments);
    }
    return YES;
  },

  mouseDragged: function(evt) {
    if(this._titleBarClicked === YES) {
      arguments.callee.base.apply(this,arguments);
    }
    return YES;
  },
  
  mouseUp: function(evt) {  
    this._titleBarClicked = NO;
    return arguments.callee.base.apply(this,arguments);
  },
  
  replaceContent: function(newContent) {
    this._containerView.replaceContent(newContent);
  },
  
  _fullscreen: function() {
    if (this._isFullscreened === NO) {
      this._prevLayout = this.get('layout');
      
      var margin = this.get('margin');
      var layout = { top: margin, bottom: margin, left: margin, right: margin };
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
      
      var maxWidth = this.get('maxWidth');
      if (maxWidth && maxWidth < layout.width) {
        layout.width = maxWidth;
        delete layout.left;
        delete layout.right;
        layout.centerX = 0;
      }
      
      var maxHeight = this.get('maxHeight');
      if (maxHeight && maxHeight < layout.height) {
        layout.height = maxHeight;
        delete layout.top;
        delete layout.bottom;
        layout.centerY = 0;
      }

      this.set('layout', layout);
    }
    else {
     this.set('layout', this._prevLayout); 
    }
    
    this.updateLayout();
    
    this._isFullscreened = !this._isFullscreened;
  },
  
  createChildViews: function() {    
    var childViews = [];
    var view = null;
    
    var titleBarHeight = this.get('titleBarHeight');
    var that = this;

    // header
    view = this.createChildView(
      SC.View.design({
        classNames: ['header'],
        layout: { top: 0, left: 0, right: 0, height: titleBarHeight },
        mouseDown: function(evt) {
          that._titleBarClicked = YES;
          return NO;
        },
        childViews: 'closeButton fullScreenButton title'.w(),
        closeButton: SC.View.design(SCUI.SimpleButton, {
          layout: { left: 5, centerY: 0, width: 16, height: 16 },
          classNames: ['modal-close-icon'],
          target: this,
          action: 'remove'
        }),
        fullScreenButton: SC.View.design(SCUI.SimpleButton, {
          layout: { left: 25, centerY: 0, width: 16, height: 16 },
          classNames: ['modal-fullscreen-icon'],
          target: this,
          action: '_fullscreen',
          isVisibleBinding: SC.binding('.isResizable', this)
        }),
        title: SC.LabelView.design({
          layout: { left: 45, right: 45, top: 0, bottom: 0 },
          valueBinding: SC.Binding.from('title', this).oneWay(),
          textAlign: SC.ALIGN_CENTER,
          fontWeight: SC.BOLD_WEIGHT,
          classNames: ['modal-title'],
          icon: this.get('titleIcon')
        })
      })
    );
    childViews.push(view);
    
    var footerView = this.get('footerView');
    var footerHeight = this.get('footerHeight');
    
    // body
    view = this.createChildView(SC.ContainerView.design({
        layout: { top: titleBarHeight, bottom: footerView ? footerHeight : 0, left: 0, right: 0 },
        classNames: 'body',
        nowShowingBinding: SC.Binding.from('nowShowing', this),
        contentView: this.get('contentView')
      })
    );
    
    this._containerView = view;
    this.contentView = this._containerView.contentView;
    childViews.push(view);
    
    // footer
    if (SC.kindOf(footerView, SC.View) && footerView.isClass) {
      view = this.createChildView(footerView, {
        classNames: 'footer',
        layout: { left: 0, right: 0, bottom: 0, height: footerHeight }
      });
      this.set('footerView', view);
      childViews.push(view);
    }
    else {
      this.set('footerView', null);
    }

    // thumb
    view = this.createChildView(
      SC.View.design(SCUI.Resizable, {
        classNames: ['picker-resizable-handle'],
        layout: {bottom: 0, right: 0, height: 16, width: 16 },
        viewToResizeBinding: SC.Binding.oneWay('.parentView'),
        maxHeight: this.get('maxHeight'),
        maxWidth: this.get('maxWidth'),
        minHeight: this.get('minHeight'),
        minWidth: this.get('minWidth'),
        isVisibleBinding: SC.binding('.isResizable', this)
      })
    );
    childViews.push(view);
    this.set('childViews', childViews);
  }
});


/* >>>>>>>>>> BEGIN source/system/dictionary.js */
/*globals SCUI*/

/*
  Defines an enumerable hash-table-like set data structure that stores key-value pairs, enumerates
  over values, and where addition, removal, and lookup are constant time operations.  It's a useful
  data structure when enumeration is required along with fast searching, or when a set must allow
  no duplication on a certain property.

  Insertion, removal, and lookup are done via keys.  A key may only be mapped to one value,
  so inserting a key-value pair a second time will be refused.  Calling set(key, value) will
  allow overwriting of the value associated with that key, however.  Supports get(key) for
  value retrieval.

  @class
  @extends SC.Object, SC.Enumerable
  @author Jonathan Lewis
*/
SCUI.Dictionary = SC.Object.extend(SC.Enumerable, {

  // PUBLIC PROPERTIES

  /**
    @read-only
  */
  length: 0,
  
  /*
    @read-only
  */
  keys: null,
  
  // PUBLIC METHODS

  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._index = {};
    this.set('keys', SC.Set.create());
  },

  nextObject: function(index, previousObject, context) {
    var value, node;

    if (this.get('length') > 0) {
      if (index === 0) {
        node = this._root;
      }
      else {
        node = context.previousNode ? context.previousNode.nextNode : null;
      }

      value = node ? node.value : undefined;
      context.previousNode = node;
    }

    return value;
  },
  
  /**
    Does nothing and returns false if the key already exists.
  */
  add: function(key, value) {
    var node, ret = NO;

    if (!this._index[key]) {
      // make a new node for the linked list
      node = {
        key: key,
        value: value
      };

      // add to the index
      this._index[key] = node;
      this.get('keys').add(key);
      
      if (!this._tail) { // if this is the first node
        this._root = node; // this node becomes the root and the tail
      }
      else { // otherwise append to the tail
        node.previousNode = this._tail;
        this._tail.nextNode = node;
      }
      this._tail = node; // becomes tail
      
      this.set('length', (this.get('length') || 0) + 1); // increment length
      this.enumerableContentDidChange(); // notify observers
      ret = YES;
    }
    
    return ret;
  },
  
  remove: function(key) {
    var node = this._index[key];
    var prev, next;
    var ret = NO;
    
    if (node) {
      prev = node.previousNode;
      next = node.nextNode;

      if (prev) { // skip over the deleted node
        prev.nextNode = next;
      }
      
      if (next) { // skip over the deleted node going the other direction too
        next.previousNode = prev;
      }
      
      if (node === this._root) { // if node was the root, set a new root
        this._root = next;
      }

      if (node === this._tail) { // if node was the tail, set a new tail
        this._tail = prev;
      }

      delete this._index[key]; // remove from the index
      this.get('keys').remove(key);
      
      this.set('length', this.get('length') - 1); // decrement length
      this.enumerableContentDidChange(); // notify observers
      ret = YES;
    }

    return ret;
  },
  
  clear: function() {
    this._index = {};
    this.get('keys').clear();
    this._root = null;
    this._tail = null;
    this.set('length', 0);
    this.enumerableContentDidChange(); // notify observers
  },

  contains: function(key) {
    return this._index[key] ? YES : NO;
  },

  unknownProperty: function(key, value) {
    if (value !== undefined) {
      if (this.contains(key)) {
        this._index[key].value = value; // reassign value mapped to this key
        this.enumerableContentDidChange(); // notify observers
      }
      else {
        this.add(key, value);
      }
    }
    else {
      value = this._index[key] ? this._index[key].value : undefined;
    }
    
    return value;
  },

  isEqual: function(dictionary) {
    var nodeA = this._root;
    var nodeB = dictionary._root;
    var ret = NO, count = 0, length = this.get('length');
    
    if (length === dictionary.get('length')) {

      // compare each pair of nodes for same key and value
      while(nodeA && nodeB && (nodeA.value === nodeB.value) && (nodeA.key === nodeB.key)) {
        nodeA = nodeA.nextNode;
        nodeB = nodeB.nextNode;
        count = count + 1;
      }
      
      // If we traversed the whole chain without stopping, the chains were the same.
      // Note this also holds for length === 0.
      ret = (count === length) ? YES : NO;
    }
    
    return ret;
  },

  diff: function(dictionary, toAdd, toRemove) {
    var node;

    toAdd = (SC.typeOf(toAdd) === SC.T_ARRAY) ? toAdd : [];
    toRemove = (SC.typeOf(toRemove) === SC.T_ARRAY) ? toRemove : [];

    if (dictionary) {
      node = dictionary._root;

      while (node) {
        if (!this.contains(node.key)) {
          toAdd.push(node.value);
        }

        node = node.nextNode;
      }
    }

    node = this._root;
    while (node) {
      if (!dictionary.contains(node.key)) {
        toRemove.push(node.value);
      }
      
      node = node.nextNode;
    }
  },

  // PRIVATE PROPERTIES
  
  _index: null,
  _root: null,
  _tail: null
  
});

SCUI.Dictionary.mixin({

  createFromEnumerable: function(enumerable, keyGenerator) {
    var ret = SCUI.Dictionary.create();

    if (enumerable && enumerable.isEnumerable && (SC.typeOf(keyGenerator) === SC.T_FUNCTION)) {
      enumerable.forEach(function(item) {
        ret.add(keyGenerator(item), item);
      });
    }

    return ret;
  }
  
});


/* >>>>>>>>>> BEGIN source/system/state.js */
// ==========================================================================
// SCUI.State
// ==========================================================================
/*globals SCUI */

/**
  @class
  This defines a state for use with the SCUI.Statechart state machine
  
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @version: 0.1
  @since: 0.1
*/
SCUI.State = SC.Object.extend({
  
  
  /**
    Called when the state chart is started up.  Use this method to init
    your state
    
    @returns {void}
  */
  initState: function(){},
  
  /**
    Called when this state, or one of its children is becoming the current
    state.  Do any state setup in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  enterState: function(context){},
  
  /**
    Called when this state, or one of its children is losing its status as the 
    current state.  Do any state teardown in this method
    
    @param {Object} context optional additonal context info
    @returns {void}
  */
  exitState: function(context){},
  
  /**
    the parallel statechart this state is a member of.  Defaults to 'default'
    @property {String}
  */
  parallelStatechart: SCUI.DEFAULT_TREE,
  /**
    The parent state.  Null if none
    
    @property {String}
  */
  parentState: null,
  
  /**
   * The history state. Null if no substates
   * @property {String}
   */
  history: null,
  
  /**
    Identifies the optional substate that should be entered on the 
    statechart start up.
    if null it is assumed this state is a leaf on the response tree

    @property {String}
  */
  initialSubState: null,
  
  /**
    the name of the state.  Set by the statemanager

    @property {String}
  */
  name: null,
  
  /**
    returns the current state for the parallel statechart this state is in.
    
    use this method in your events to determin if specific behavior is needed
    
    @returns {SCUI.State}
  */
  state: function(){
    var sm = this.get('stateManager');
    if(!sm) throw 'Cannot access the current state because state does not have a state manager';
    return sm.currentState(this.get('parallelStatechart'));
  },
  
  /**
    transitions the current parallel statechart to the passed state
    
    
    @param {String}
    @returns {void}
  */
  goState: function(name){
    var sm = this.get('stateManager');
    if(sm){
      sm.goState(name, this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  /**
    transitions the current parallel statechart to the passed historystate
    
    
    @param {String}
    @param {Bool}
    @returns {void}
  */
  goHistoryState: function(name, isRecursive){
    var sm = this.get('stateManager');
    if(sm){
      sm.goHistoryState(name, this.get('parallelStatechart'), isRecursive);
    }
    else{
      throw 'Cannot goState cause state does not have a stateManager!';
    }
  },
  
  enterInitialSubState: function(tree) {
    var initialSubState = this.get('initialSubState');
    if (initialSubState) {
      if(!tree[initialSubState]) throw 'Cannot find initial sub state: %@ defined on state: %@'.fmt(initialSubState, this.get('name'));
      this.set('history', initialSubState);
      var subState = tree[initialSubState];
      return this.goState(initialSubState, tree);
    }
    return this;
  },
  
  /**
    pretty printing
  */
  toString: function(){
    return this.get('name');
  },
  
  /**
    returns the parent states object
    @returns {SCUI.State}
  */
  parentStateObject: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm.parentStateObject(this.get('parentState'), this.get('parallelStatechart'));
    }
    else{
      throw 'Cannot access parentState cause state does not have a stateManager!';
    }
  }.property('parentState').cacheable(),
  
  /**
    returns an array of parent states if any
    
    @returns {SC.Array}
    
  */
  trace: function(){
    var sm = this.get('stateManager');
    if(sm){
      return sm._parentStates(this);
    }
    else{
      throw 'Cannot trace cause state does not have a stateManager!';
    }
  }.property()
 
});


/* >>>>>>>>>> BEGIN source/system/statechart.js */
// ==========================================================================
// SCUI.Statechart
// ==========================================================================
/*globals SCUI */

require('system/state');
/**
  @namespace
  
  A most excellent statechart implementation
  
  @author: Mike Ball
  @author: Michael Cohen
  @author: Evin Grano
  @author: Jonathan Lewis
  @version: 0.1
  @since: 0.1
*/

SCUI.Statechart = {
  
  isStatechart: true,
  
  /**
    Log level bit field definitions.  Combine these in any way desired
    using bitwise operations and apply to 'logLevel'.
  */
  LOG_NONE: 0,
  LOG_STATE_CHANGES: 1,
  LOG_SENT_EVENTS: 2,
  LOG_HANDLED_EVENTS: 4,
  LOG_UNHANDLED_EVENTS: 8,
  LOG_ALL_EVENTS: 14,
  LOG_ALL: 15,

  logLevel: 0,
  
  initMixin: function(){
    //setup data
    this._all_states = {};
    this._all_states[SCUI.DEFAULT_TREE] = {};
    this._current_state = {};
    this._current_state[SCUI.DEFAULT_TREE] = null;
    this._goStateLocked = NO;
    this._sendEventLocked = NO;
    this._pendingStateTransitions = [];
    this._pendingActions = [];
    //alias sendAction
    this.sendAction = this.sendEvent;
    if(this.get('startOnInit')) this.startupStatechart();
  },
  
  startOnInit: YES,
  
  statechartIsStarted: NO,
  
  startupStatechart: function(){
    //add all unregistered states
    if (!this.get('statechartIsStarted')) {
      var key, tree, state, trees, startStates, startState, currTree;
      for(key in this){
        if(this.hasOwnProperty(key) && SC.kindOf(this[key], SCUI.State) && this[key].get && !this[key].get('beenAddedToStatechart')){
          state = this[key];
          this._addState(key, state);
        }
      }
      trees = this._all_states;
      //init the statechart
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          tree = trees[key];
          //for all the states in this tree
          for(state in tree){
            if(tree.hasOwnProperty(state)){
              tree[state].initState();
            }
          }
        }
      }
      //enter the startstates
      startStates = this.get('startStates');
      if(!startStates) throw 'Please add startStates to your statechart!';
      
      for(key in trees){  
        if(trees.hasOwnProperty(key)){
          startState = startStates[key];
          currTree = trees[key];
          if(!startState) console.error('The parallel statechart %@ must have a start state!'.fmt(key));
          if(!currTree) throw 'The parallel statechart %@ does not exist!'.fmt(key);
          if(!currTree[startState]) throw 'The parallel statechart %@ doesn\'t have a start state [%@]!'.fmt(key, startState);
          this.goState(startState, key);
        }
      }
    }
    this.setIfChanged('statechartIsStarted', YES);
  },
  
  
  /**
    Adds a state to a state manager
    
    if the stateManager and stateName objects are blank it is assumed
    that this state will be picked up by the StateManger's init
    
    @param {Object} the state definition
    @param {SC.Object} Optional: Any SC.Object that mixes in SCUI.Statechart 
    @param {String} Optional: the state name
    @returns {SCUI.State} the state object
  */
  registerState: function(stateDefinition, stateManager, stateName){
    
    var state, tree;
    //create the state object
    state = SCUI.State.create(stateDefinition);
    
    //passed in optional arguments
    if(stateManager && stateName){
      if(stateManager.isStatechart){

        stateManager._addState(stateName, state);
        state.initState();
      }
      else{
        throw 'Cannot add state: %@ because state manager does not mixin SCUI.Statechart'.fmt(state.get('name'));
      }
    }
    else{
      state.set('beenAddedToStatechart', NO);
    }
    //push state onto list of states
    
    return state;
  },
  
  goHistoryState: function(requestedState, tree, isRecursive){
    var allStateForTree = this._all_states[tree],
        pState, realHistoryState;
    if(!tree || !allStateForTree) throw 'State requesting go history does not have a valid parallel tree';
    pState = allStateForTree[requestedState];
    if (pState) realHistoryState = pState.get('history') || pState.get('initialSubState');

    if (!realHistoryState) {
      if (!isRecursive) console.warn('Requesting History State for [%@] and it is not a parent state'.fmt(requestedState));
      realHistoryState = requestedState;
      this.goState(realHistoryState, tree);
    }
    else if (isRecursive) {
      this.goHistoryState(realHistoryState, tree, isRecursive);
    }
    else {
      this.goState(realHistoryState, tree);
    }
  },
  
  goState: function(requestedStateName, tree) {
    var currentState = this._current_state[tree],
        enterStates = [],
        exitStates = [],
        enterMatchIndex,
        exitMatchIndex,
        requestedState, pivotState, pState, cState,
        i, logLevel = this.get('logLevel'), loggingStr;
             
    if (!tree) throw '#goState: State requesting go does not have a valid parallel tree';
    
    requestedState = this._all_states[tree][requestedStateName];
    
    if (!requestedState) throw '#goState: Could not find the requested state: %@'.fmt(requestedStateName);

    if (this._goStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        requestedState: requestedState,
        tree: tree
      });

      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        console.info('%@: added [%@] to pending state transitions queue for [%@]'.fmt(this, requestedState, tree));
      }

      return;
    }

    // do nothing if we're already in the requested state
    if (currentState === requestedState) {
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._goStateLocked = YES;

    // Get the parent states for the current state and the registered state. We will
    // use them to find a common parent state. 
    enterStates = this._parentStates_with_root(requestedState);
    exitStates = currentState ? this._parentStates_with_root(currentState) : [];
  
    // Continue by finding the common parent state for the current and requested states
    //
    // At most, this takes O(m^2) time, where m is the maximum depth from the
    // root of the tree to either the requested state or the current state. 
    // Will always be less than or equal to O(n^2), where n is the number of 
    // states in the tree.
    pivotState = exitStates.find(function(item,index){
      exitMatchIndex = index;
      enterMatchIndex = enterStates.indexOf(item);
      if (enterMatchIndex >= 0) return YES;
    });
      
    // Looks like we were unable to find a common parent state. This means that we
    // must enter from the root state in the tree
    if (!enterMatchIndex) enterMatchIndex = enterStates.length - 1;
    
    // Now, from the current state, exit up the parent states to the common parent state, 
    // but don't exit the common parent itself since you are technically still in it.
    loggingStr = "";
    for (i = 0; i < exitMatchIndex; i += 1) {
      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        loggingStr += 'Exiting State: [%@] in [%@]\n'.fmt(exitStates[i], tree);
      }

      exitStates[i].exitState();
    }
    
    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      console.info(loggingStr);
    }
    
    // Finally, from the the common parent state, but not including the parent state, enter the 
    // sub states down to the requested state. If the requested state has an initial sub state
    // then we must enter it too.
    loggingStr = "";
    for (i = enterMatchIndex-1; i >= 0; i -= 1) {
      //TODO call initState?
      cState = enterStates[i];
      
      // Logging
      if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
        loggingStr += 'Entering State: [%@] in [%@]\n'.fmt(cState, tree);
      }

      pState = enterStates[i+1];
      if (pState && SC.typeOf(pState) === SC.T_OBJECT) pState.set('history', cState.name);
      cState.enterState();

      if (cState === requestedState) {
        // Make sure to enter the requested state's initial sub state!
        cState.enterInitialSubState(this._all_states[tree || SCUI.DEFAULT_TREE]);
      }
    }

    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      console.info(loggingStr);
    }
    
    // Set the current state for this state transition
    this._current_state[tree] = requestedState;
            
    // Okay. We're done with the current state transition. Make sure to unlock the
    // goState and let other pending state transitions execute.
    this._goStateLocked = NO;
    this._flushPendingStateTransition();
    
    // Once pending state transitions are flushed then go ahead and start flush pending
    // actions
    this._flushPendingActions();
  },
  
  /** @private
  
    Called by goState to flush a pending state transition at the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    var logLevel = this.get('logLevel');
    var pending = this._pendingStateTransitions.shift();
    var msg;

    if (!pending) return;

    // Logging
    if (logLevel & SCUI.Statechart.LOG_STATE_CHANGES) {
      msg = '%@: performing pending state transition for requested state [%@] in [%@]';
      console.info(msg.fmt(this, pending.requestedState, pending.tree));
    }

    this.goState(pending.requestedState, pending.tree);
  },
  
  currentState: function(tree){
    tree = tree || SCUI.DEFAULT_TREE;
    return this._current_state[tree];
  },
  
  isInState: function(state, tree){
    tree = tree || SCUI.DEFAULT_TREE;
    var allStates = this._all_states[tree],
        currState = this.currentState(tree),
        ret = NO;
    var currStack = this._parentStates(currState) || [];
    if (SC.typeOf(state) === SC.T_STRING) state = allStates[state];
    currStack.forEach( function(item){
      if (!ret && item === state) ret = YES;
    });
    return ret;
  },
  
  //Walk like a duck
  isResponderContext: YES,
  
  /**
    Sends the event to all the parallel state's current state
    and walks up the graph looking if current does not respond
    
    @param {String} action name of action
    @param {Object} sender object sending the action
    @param {Object} context optional additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(action, sender, context) {
    var logLevel = this.get('logLevel'),
        handled = NO,
        currentStates = this._current_state,
        responder;
    
    if (this._sendEventLocked || this._goStateLocked) {
      // Want to prevent any actions from being processed by the states until 
      // they have had a chance to handle handle the most immediate action or 
      // completed a state transition
      this._pendingActions.push({
        action: action,
        sender: sender,
        context: context
      });
      
      // Logging
      if (logLevel & SCUI.Statechart.LOG_SENT_EVENTS) {
        console.info('%@: added %@ to pending actions queue'.fmt(this, action));
      }

      return;
    }
    
    this._sendEventLocked = YES;
    
    if (logLevel & SCUI.Statechart.LOG_SENT_EVENTS) {
      console.info("%@: begin action '%@' (%@, %@)".fmt(this, action, sender, context));
    }
    
    for(var tree in currentStates){
      if(currentStates.hasOwnProperty(tree)){
        handled = NO;
        
        responder = currentStates[tree];
        
        if (!responder.get) continue;
       
        while(!handled && responder){
          if(responder.tryToPerform){
            try{
              handled = responder.tryToPerform(action, sender, context);
            } catch(exp){
              console.error("Exception occurred while trying perform action: %@ \n %@".fmt(action,exp));
              if (SC.ExceptionHandler) {
                SC.ExceptionHandler.handleException(exp);
              }
            }
          }
          if(!handled) responder = responder.get('parentState') ? this._all_states[tree][responder.get('parentState')] : null;
        }
        
        // Logging
        if (!handled && (logLevel & SCUI.Statechart.LOG_UNHANDLED_EVENTS)) {
          console.info("%@:  action '%@' NOT HANDLED in tree %@".fmt(this,action, tree));
        }
        else if (handled && (logLevel & SCUI.Statechart.LOG_HANDLED_EVENTS)) {
          console.info("%@: action '%@' handled by %@ in tree %@".fmt(this, action, responder.get('name'), tree));
        }
      }
    }
    
    // Now that all the states have had a chance to process the 
    // first action, we can go ahead and flush any pending actions.
    this._sendEventLocked = NO;
    this._flushPendingActions();
    
    return responder ;
  },
  
  /** @private

     Called by sendEvent to flush a pending actions at the front of the pending
     queue
   */
  _flushPendingActions: function() {
    var pending = this._pendingActions.shift();

    if (!pending) return;
    
    // Logging
    if (this.get('logLevel') & SCUI.Statechart.LOG_SENT_EVENTS) {
      console.info('%@: firing pending action %@'.fmt(this, pending.action));
    }
    else{
      this.toString(); //HACK: [MB] prevents crashes for now...
    }

    this.sendEvent(pending.action, pending.sender, pending.context);
  },

  _addState: function(name, state){
    state.set('stateManager', this);
    state.set('name', name);
    var tree = state.get('parallelStatechart') || SCUI.DEFAULT_TREE;
    state.setIfChanged('parallelStatechart', tree);
    
    if(!this._all_states[tree]) this._all_states[tree] = {};
    if(this._all_states[tree][name]) throw 'Trying to add state %@ to state tree %@ and it already exists'.fmt(name, tree);
    this._all_states[tree][name] = state;
    
    state.set('beenAddedToStatechart', YES);
  },
  
  
  _parentStates: function(state){
    var ret = [], curr = state;
    
    //always add the first state
    ret.push(curr);
    curr = curr.get('parentStateObject');
    
    while(curr){
      ret.push(curr);
      curr = curr.get('parentStateObject');
    }
    return ret;
  },
  
  _parentStates_with_root: function(state){
    var ret = this._parentStates(state);
    //always push the root
    ret.push('root');
    return ret;
  },
  
  parentStateObject: function(name, tree){
    if(name && tree && this._all_states[tree] && this._all_states[tree][name]){
      return this._all_states[tree][name];
    }
    return null;
  }
};


/* >>>>>>>>>> BEGIN source/views/cascading_combo.js */
//============================================================================
// SCUI.MasterDetailComboView
//============================================================================

/**

  This view will display two combo boxes with labels.
  One combo box feeds off of the other, hence the master/detail...
  
  To use this view you will need to supply a settings hash combo boxes.
  The hash should follow the following example:
  
  {{{
  
    propertiesHash: {
      contentPath: 'path.to.some.arraycontroller.contnet', // *** REQUIRED ***
      filterPath: 'path.to.some.external.source', // OPTIONAL
      useExternalFilter: YES | NO // OPTIONAL  (set to use if you supplied the filter path.)
      masterValueKey: 'name', // *** REQUIRED ***
      detailValueKey: 'name', // *** REQUIRED ***
      rootItemKey: 'someKey', // *** REQUIERD *** (the property on the model that should be set by the selection of the first combo box)
      childItemKey: 'someKey', // *** REQUIERD *** (the property on the model that should be set by the selection of the second combo box)
      relationKey: 'parentModelKey.childModelKey' // *** REQUIRED *** How to get the relation between the two models.
    }
    
  
  }}}
  
  @extends SC.View
  @author Josh Holt [JH2], Jonathan Lewis [JL]
  @version Beta1.1
  @since FR4

*/

SCUI.CascadingComboView = SC.View.extend({
  
  // PUBLIC PROPERTIES

  /*
    This is a reference to the model object that you are using this
    master detail view to set properties.
  */
  content: null,
  
  propertiesHash: null,
  
  masterLabel: null,
  
  detailLabel: null,

  // PUBLIC METHODS  
  createChildViews: function() {
    var childViews = [], view;
    var required = ['contentPath', 'masterValueKey', 'detailValueKey', 
                    'rootItemKey', 'childItemKey', 'relationKey'];
    var meetsRequirements = null;
    var props = this.get('propertiesHash');
    var content = this.get('content');
    
    
    // make sure the required props are there or complain.
    if (props) {
      required.forEach(function(key){
      if (!SC.none(props[key]) && props[key] !== '') {
        meetsRequirements = YES;
      }else{
        meetsRequirements = null;
      }});
    }
    
    if (meetsRequirements) {    
      view = this.createChildView(
        SC.LabelView.design({
          layout: { left: 20, top: 10, right: 20, height: 22 },
          isEditable: NO,
          value: this.get('masterLabel').loc()
        })
      );
      childViews.push(view);

      var str = '*content.%@'.fmt(props.rootItemKey);

      this.masterCombo = view = this.createChildView(
        SCUI.ComboBoxView.design({
          layout: { left: 20 , right: 20, top: 32, height: 22 },
          objectsBinding: props.contentPath,
          nameKey: props.masterValueKey,
          valueBinding: SC.Binding.from('*content.%@'.fmt(props.rootItemKey), this)
        })
      );
      childViews.push(view);

      view = this.createChildView(
        SC.LabelView.design({
          layout: { left: 50, top: 64, right: 20, height: 22 },
          isEditable: NO,
          value: this.get('detailLabel').loc(),
          isEnabled: NO,
          isEnabledBinding: SC.Binding.from('*masterCombo.selectedObject', this).oneWay()
        })
      );
      childViews.push(view);

      view = this.createChildView(
        SCUI.ComboBoxView.design({
          layout: { left: 50, right: 20, top: 86, height: 22 },
          objectsBinding: SC.Binding.from('*content.%@'.fmt(props.relationKey), this).oneWay(),
          nameKey: props.detailValueKey,
          isEnabled: NO,
          isEnabledBinding: SC.Binding.from('*masterCombo.selectedObject', this).oneWay(),
          valueBinding: SC.Binding.from('*content.%@'.fmt(props.childItemKey), this)
        })
      );
      childViews.push(view);
      this.set('childViews', childViews);
    } else {
      view = this.createChildView(SC.View.design({
        layout: { top: 0, left: 0, bottom: 0, right: 0},
        childViews: [
          SC.LabelView.design({
            layout: { centerX: 0 , centerY: 0, width: 300, height: 18 },
            value: meetsRequirements ? "No Content." : 'Setup did not meet requirements.'
          })
        ]
      }));
      childViews.push(view);
      this.set('childViews',childViews);
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/views/collapsible.js */
// ==========================================================================
// SCUI.CollapsibleView
// ==========================================================================

/** @class

  This is a really simple view that toggles between two view for an expanded and a collapsed view

  @extends SC.ContainerView
  @author Evin Grano
  @version 0.1
  @since 0.1
*/

SCUI.CollapsibleView = SC.ContainerView.extend(
/** @scope SCUI.CollapsibleView.prototype */ {
  
  classNames: ['scui-collapsible-view'],
  
  /**
    This is the reference to the expanded view...
    This view will show when the CollapsedView is expanded
    
    @field {String, SC.View}
  */
  expandedView: null,
  /**
    This is the reference to the collapsed view...
    This view will show when the CollapsedView is collapsed
    
    @field {String, SC.View}
  */
  collapsedView: null,
  
  // Private Elements
  _isCollapsed: NO,
  _expandedView: null,
  _collapsedView: null,
  
  displayProperties: ['expandedView', 'collapsedView'],
  
  createChildViews: function(){
    var expandedView = this.get('expandedView');
    this._expandedView = this._createChildViewIfNeeded(expandedView);
    
    var collapsedView = this.get('collapsedView');
    this._collapsedView = this._createChildViewIfNeeded(collapsedView);
    
    // On Init show the expandedView
    this.set('nowShowing', this._expandedView);
    var view = this.get('contentView');
    this._adjustView(view);
  },
  
  // Actions
  expand: function(){
    if (this._expandedView){
      this.set('nowShowing', this._expandedView);
      var view = this.get('contentView');
      this._isCollapsed = NO;
      this.displayDidChange();
      this._adjustView(view);
    }
  },
  
  collapse: function(){
    if (this._collapsedView){
      this.set('nowShowing', this._collapsedView);
      var view = this.get('contentView');
      this._isCollapsed = YES;
      this.displayDidChange();
      this._adjustView(view);
    }
  },
  
  toggle: function(){
    if (this._isCollapsed){
      this.expand();
    }
    else{
      this.collapse();
    }
  },
  
  /**
    Invoked whenever expandedView is changed and changes out the view if necessary...
  */
  _expandedViewDidChange: function() {
    var expandedView = this.get('expandedView');
    console.log('%@._expandableViewDidChange(%@)'.fmt(this, expandedView));
    this._expandedView = this._createChildViewIfNeeded(expandedView);
    if (!this._isCollapsed) this.expand();
  }.observes('expandedView'),
  
  /**
    Invoked whenever collapsedView is changed and changes out the view if necessary...
  */
  _collapsedViewDidChange: function() {
    var collapsedView = this.get('collapsedView');
    console.log('%@._collapsedViewDidChange(%@)'.fmt(this, collapsedView));
    this._collapsedView = this._createChildViewIfNeeded(collapsedView);
    if (this._isCollapsed) this.collapse();
  }.observes('collapsedView'),
  
  // Private functions
  _adjustView: function(view){
    if (view){
      var frame = view.get('frame');
      var layout = this.get('layout');
      console.log('CollapsibleView: Frame for (%@): width: %@, height: %@'.fmt(view, frame.height, frame.width));
      layout = SC.merge(layout, {height: frame.height, width: frame.width});
      this.adjust(layout);
    }
  },
  
  _createChildViewIfNeeded: function(view){
    if (SC.typeOf(view) === SC.T_CLASS){
      return this.createChildView(view);
    }
    else{
      return view;
    }
  }
});


/* >>>>>>>>>> BEGIN source/views/combo_box.js */
/*globals SCUI sc_static*/

sc_require('mixins/simple_button');

/** @class

  This view creates a combo-box text field view with a dropdown list view
  for type ahead suggestions; useful as a search field.
  
  'objects' should be set to an array of candidate items.
  'value' will be the item selected, just like any SC.Control.

  @extends SC.View, SC.Control, SC.Editable
  @author Jonathan Lewis
  @author Peter Bergström
*/

SCUI.ComboBoxView = SC.View.extend( SC.Control, SC.Editable, {

  // PUBLIC PROPERTIES

  classNames: 'scui-combobox-view',
  
  isEditable: function() {
    return this.get('isEnabled');
  }.property('isEnabled').cacheable(),

  /*
    The item selected in the combo box.  Every time a different item is chosen in
    the drop-down list, this property will be updated.

    This property may be used in conjunction with 'valueKey', in which case this
    property will be equal to 'selectedObject[valueKey]' when an item is selected
    in the drop-down list.
    
    If no 'valueKey' is set, then 'value' will be equal to the selected item 'selectedObject'
    itself.
  */
  value: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */
  valueKey: null,

  /**
    An array of items that will form the menu you want to show.
  */
  objects: null,
  
  objectsBindingDefault: SC.Binding.oneWay(),

  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  nameKey: null,

  /*
    @optional
    If set to a number, will truncate the item display names in the drop-down
    list to this length.  No truncation if null.
  */
  maxNameLength: null,

  /**
    If this is non-null, the drop down list will add an icon for each
    object in the list.
  */
  iconKey: null,

  /**
   If you set this to a non-null value, then the value of this key will
   be used to sort the objects.  If this is not set, then nameKey will
   be used.
  */
  sortKey: null,
  
  /**
    if true, it means that no sorting will occur, objects will appear 
    in the same order as in the array
  */  
  disableSort: NO,
  
  /**
    if true, the object list names will be localized.
  */
  localize: NO,
  
  /**
    Bound to the hint property on the combo box's text field view.
  */
  hint: null,

  /**
    Search string being used to filter the 'objects' array above.
    Unless you explicitly set it, it is always whatever was _typed_
    in the text field view (text that is a result of key presses).
    Note that this is not always the same as the text in the field, since
    that can also change as a result of 'value' (the selected object)
    changing, or the user using arrow keys to highlight objects in the
    drop down list.  You want to see the names of these objects in the text
    field, but you don't want to trigger a filter change in those cases,
    so it doesn't.
  */
  filter: null,

  /**
    If you do not want to use the combo box's internal filtering
    algorithm, set this to YES.  In this case, if you want to filter
    'objects' in your own way, you would need to watch the 'filter'
    property and update 'objects' as desired.
  */
  useExternalFilter: NO,
  
  /**
    If you want to highlight the filtered text, then set this to YES.
  */
  highlightFilterOnListItem: NO,
  
  /**
    Bound internally to the status of the 'objects' array, if present
  */
  status: null,

  /**
    True if ('status' & SC.Record.BUSY).
  */
  isBusy: function() {
    return (this.get('status') & SC.Record.BUSY) ? YES : NO;
  }.property('status').cacheable(),

  /**
    Row height for each item.
  */
  rowHeight: 18,

  /**
    The drop down pane resizes automatically.  Set the minimum allowed height here.
  */
  minListHeight: 18,

  /**
    The drop down pane resizes automatically.  Set the maximum allowed height here.
  */
  maxListHeight: 194, // 10 rows at 18px, plus 7px margin on top and bottom
  
  /**
    If a custom class name is desired for the picker, add it here.
  */
  customPickerClassName: null,
  
  /**
    The drop down pane width
  */
  dropDownMenuWidth: null,
  

  /**
    When 'isBusy' is true, the combo box shows a busy indicator at the bottom of the
    drop down pane.  Set its height here.
  */
  statusIndicatorHeight: 20,

  /**
    True allows the user to clear the value by deleting all characters in the textfield.  False will reset the textfield to the last entered value.
  */
  canDeleteValue: NO,

  /**
    'objects' above, filtered by 'filter', then optionally sorted.
    If 'useExternalFilter' is YES, this property does nothing but
    pass 'objects' through unchanged.
  */
  filteredObjects: function() {
    var ret, objects, nameKey, name, that, shouldLocalize;
    var filter = this.get('filter');

    if (this.get('useExternalFilter') || !filter) {
      ret = this.get('objects');
    }
    else {
      objects = this.get('objects') || [];
      nameKey = this.get('nameKey');

      filter = this._sanitizeFilter(filter) || '';
      filter = filter.toLowerCase();

      shouldLocalize = this.get('localize');

      ret = [];
      that = this;

      objects.forEach(function(obj) {
        name = that._getObjectName(obj, nameKey, shouldLocalize);

        if ((SC.typeOf(name) === SC.T_STRING) && (name.toLowerCase().search(filter) >= 0)) {
          ret.push(obj);
        }
      });
    }

    return this.sortObjects(ret);
  }.property('objects', 'filter').cacheable(),

  /*
    The actual item from the 'objects' list that was selected, mainly for internal use,
    though it is bindable if desired.
    
    If 'valueKey' is in use, then when 'value' is changed, this property will attempt
    to update itself by searching the 'objects' list for an object P where P[valueKey]
    equals 'value'.  Otherwise, this property just makes sure that 'selectedObject' and
    'value' are always the same.
    
    Note that when using 'value' in conjunction with 'valueKey', 'selectedObject' will be null
    if an appropriate object in 'objects' cannot be found.
  */
  selectedObject: function(key, value) {
    var objects, comboBoxValue, valueKey;

    if (value !== undefined) {
      this.setIfChanged('value', this._getObjectValue(value, this.get('valueKey')));
    }
    else {
      if (this.get('valueKey')) {
        comboBoxValue = this.get('value');
        valueKey = this.get('valueKey');
        
        if (this._getObjectValue(this._lastSelectedObject, valueKey) !== comboBoxValue) {
          objects = this.get('objects');
          if (objects && objects.isEnumerable) {
            value = objects.findProperty(valueKey, comboBoxValue);
          }
        }
        else {
          value = this._lastSelectedObject;
        }
      }
      else {
        value = this.get('value');
      }
    }

    this._lastSelectedObject = value;

    return value;
  }.property('value').cacheable(),

  selectedObjectName: function() {
    return this._getObjectName(this.get('selectedObject'), this.get('nameKey'), this.get('localize'));
  }.property('selectedObject').cacheable(),

  selectedObjectIcon: function() {
    return this._getObjectIcon(this.get('selectedObject'), this.get('iconKey'));
  }.property('selectedObject').cacheable(),

  /**
    The text field child view class.  Override this to change layout, CSS, etc.
  */
  textFieldView: SC.TextFieldView.extend({
    classNames: 'scui-combobox-text-field-view',
    layout: { top: 0, left: 0, height: 22, right: 28 },
    spellCheckEnabled: NO
  }),

  /**
    The drop down button view class.  Override this to change layout, CSS, etc.
  */
  dropDownButtonView: SC.ButtonView.extend({
    layout: { top: 0, right: 0, height: 24, width: 28 },
    icon: 'caret'
  }),
  
  /*
    Set at design time only.  Should be a view class specified at design time.
    At run time, if used, it will be replaced with an instance of the type as a
    convenience shortcut for testing purposes.  This property will not be used
    unless you set 'iconKey' above, indicating that you want to show icons for
    your list items and your selected item.
  */
  iconView: SC.ImageView.extend({
    layout: { left: 7, top: 4, width: 16, height: 16 }
  }),

  /*
    @private
  */
  leftAccessoryView: function() {
    var view = this.get('iconView');

    if (SC.kindOf(view, SC.View)) {
      view = view.create();
    }
    else {
      view = null;
    }
    this.set('iconView', view);

    return view;
  }.property().cacheable(), // only run once, then cache
  
  displayProperties: ['isEditing'],

  // PUBLIC METHODS
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._createListPane();
    this.bind('status', SC.Binding.from('*objects.status', this).oneWay());
  },
  
  willDestroyLayer: function() {
    if (this._listPane) {
      this._listPane.destroy();
    }

    arguments.callee.base.apply(this,arguments);
  },

  createChildViews: function() {
    var childViews = [], view;
    var isEnabled = this.get('isEnabled');
    
    view = this.get('textFieldView');
    if (SC.kindOf(view, SC.View) && view.isClass) {
      view = this.createChildView(view, {
        isEnabled: isEnabled,
        hintBinding: SC.Binding.from('hint', this),
        editableDelegate: this, // pass SC.Editable calls up to the owner view
        keyDelegate: this, // the text field will be the key responder, but offer them to the owner view first

        // Override key handlers to first offer them to the delegate.
        // Only call base class implementation if the delegate refuses the event.
        keyDown: function(evt) {
          var del = this.get('keyDelegate');
          return (del && del.keyDown && del.keyDown(evt)) || arguments.callee.base.apply(this,arguments);
        },
        
        keyUp: function(evt) {
          var del = this.get('keyDelegate');
          return (del && del.keyUp && del.keyUp(evt)) || arguments.callee.base.apply(this,arguments);
        },
        
        beginEditing: function() {
          var del = this.get('editableDelegate');
          var ret = arguments.callee.base.apply(this,arguments);
          if (ret && del && del.beginEditing) {
            del.beginEditing();
          }
          return ret;
        },
        
        commitEditing: function() {
          var del = this.get('editableDelegate');
          var ret = arguments.callee.base.apply(this,arguments);
          if (ret && del && del.commitEditing) {
            del.commitEditing();
          }
          return ret;
        }
      });
      childViews.push(view);
      this.set('textFieldView', view);
    }
    else {
      this.set('textFieldView', null);
    }

    view = this.get('dropDownButtonView');
    if (SC.kindOf(view, SC.View) && view.isClass) {
      view = this.createChildView(view, {
        isEnabled: isEnabled,
        target: this,
        action: 'toggleList'
      });
      childViews.push(view);
      this.set('dropDownButtonView', view);
    }
    else {
      this.set('dropDownButtonView', null);
    }

    this.set('childViews', childViews);
  },

  // for styling purposes, add a 'focus' CSS class when
  // the combo box is in editing mode
  renderMixin: function(context, firstTime) {
    context.setClass('focus', this.get('isEditing'));
  },

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey

    @param objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    var nameKey;

    if (!this.get('disableSort') && objects) {
      if (!objects.sort && objects.toArray) {
        objects = objects.toArray();
      }
      if (objects.sort) {
        nameKey = this.get('sortKey') || this.get('nameKey');

        objects = objects.sort(function(a, b) {
          if (nameKey) {
            a = a.get ? a.get(nameKey) : a[nameKey];
            b = b.get ? b.get(nameKey) : b[nameKey];
          }

          a = (SC.typeOf(a) === SC.T_STRING) ? a.toLowerCase() : a;
          b = (SC.typeOf(b) === SC.T_STRING) ? b.toLowerCase() : b;

          return (a < b) ? -1 : ((a > b) ? 1 : 0);
        });
      }
    }
    return objects;
  },

  /**
    This may be called directly, or triggered by the
    text field beginning editing.
  */
  beginEditing: function() {
    var textField = this.get('textFieldView');

    if (!this.get('isEditable')) {
      return NO;
    }
    
    if (this.get('isEditing')) {
      return YES;
    }
    
    this.set('isEditing', YES);
    this.set('filter', null);
    
    if (textField && !textField.get('isEditing')) {
      textField.beginEditing();
    }

    return YES;
  },

  /**
    This may be called directly, or triggered by the
    text field committing editing.
  */
  commitEditing: function() {
    var textField = this.get('textFieldView');

    if (this.get('isEditing')) {
      // sync text field value with name of selected object
      this._selectedObjectNameDidChange();

      this.set('isEditing', NO);
      // in IE, as soon as you the user browses through the results in the picker pane by 
      // clicking on the scroll bar or the scroll thumb, the textfield loses focus causing 
      // commitEditing to be called and subsequently hideList which makes for a very annoying 
      // experience. With this change, clicking outside the pane will hide it (same as original behavior), 
      // however, if the user directly shifts focus to another text field, then the pane 
      // won't be removed. This behavior is still buggy but less buggy than it was before.
      if (!SC.browser.msie) {
        this.hideList();
      }
    }

    if (textField && textField.get('isEditing')) {
      textField.commitEditing();
    }
    
    return YES;
  },

  toggleList: function() {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.hideList();
    }
    else {
      this.showList();
    }
  },

  // Show the drop down list if not already visible.
  showList: function() {
    if (this._listPane && !this._listPane.get('isPaneAttached')) {
      this.beginEditing();

      this._updateListPaneLayout();
      this._listPane.popup(this, SC.PICKER_MENU);
    }
  },

  // Hide the drop down list if visible.
  hideList: function() {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this._listPane.remove();
    }
  },
  
  // The following key events come to us from the text field
  // view.  It is the key responder, but we are its delegate.
  keyDown: function(evt) {
    this._keyDown = YES;
    this._shouldUpdateFilter = NO; // only goes to true if typing text, which we'll discover below
    return this.interpretKeyEvents(evt) ? YES : NO;
  },

  keyUp: function(evt) {
    var ret = NO;

    // If the text field is empty, the browser doesn't always
    // send a keyDown() event, only a keyUp() event for arrow keys in Firefox, for example.
    // To avoid double key handling, check to be sure we didn't get a keyDown()
    // before attempting to use the event.
    if (!this._keyDown) {
      this._shouldUpdateFilter = NO;
      ret = this.interpretKeyEvents(evt) ? YES : NO;
    }

    this._keyDown = NO;
    return ret;
  },
  
  insertText: function(evt) {
    this._shouldUpdateFilter = YES; // someone typed something
    this.showList();
    return NO;
  },
  
  _checkDeletedAll: function(delBackward) {
    if (!this.get('canDeleteValue')) return;
    var value = this.get('textFieldView').get('value'),
        selection = this.get('textFieldView').get('selection'),
        wouldDeleteLastChar = NO;
    if (!value || !value.length) {
      wouldDeleteLastChar = YES;
    } else if (value.length === selection.length()) {
      wouldDeleteLastChar = YES;
    } else if (value.length === 1 && selection.start === (delBackward ? 1 : 0)) {
      wouldDeleteLastChar = YES;
    }

    if (wouldDeleteLastChar) {
      this.set('selectedObject', null);
      this.set('value', null);
    }
  },

  deleteBackward: function(evt) {
    this._checkDeletedAll(YES);
    this._shouldUpdateFilter = YES; // someone typed something
    this.showList();
    return NO;
  },
  
  deleteForward: function(evt) {
    this._checkDeletedAll(NO);
    this._shouldUpdateFilter = YES;
    this.showList();
    return NO;
  },

  // Send this event to the drop down list
  moveDown: function(evt) {
    if (this._listPane && this._listView) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveDown(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  // Send this event to the drop down list
  moveUp: function(evt) {
    if (this._listPane && this._listView) {
      if (this._listPane.get('isPaneAttached')) {
        this._listView.moveUp(evt);
      }
      else {
        this.showList();
      }
    }
    return YES;
  },

  // Send this event to the drop down list to trigger
  // the default action on the selection.
  insertNewline: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      return this._listView.insertNewline(evt); // invokes default action on ListView, same as double-click
    }
    return NO;
  },

  insertTab: function(evt) {
    var ret = NO;

    // If the drop-down list is open, make a tab event be an 'accept' event
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.invokeOnce('_selectListItem'); // same action that a 'newline' event eventually triggers
      ret = YES; // absorb the event
    }
    
    return ret;
  },

  // escape key handler
  cancel: function(evt) {
    if (this._listPane && this._listPane.get('isPaneAttached')) {
      this.hideList();
    }
    return NO; // don't absorb it; let the text field have fun with this one
  },
  
  // PRIVATE PROPERTIES

  _isEnabledDidChange: function() {
    var view;
    var isEnabled = this.get('isEnabled');
    
    if (!isEnabled) {
      this.commitEditing();
    }
    
    view = this.get('textFieldView');
    if (view && view.set) {
      view.set('isEnabled', isEnabled);
    }
    
    view = this.get('dropDownButtonView');
    if (view && view.set) {
      view.set('isEnabled', isEnabled);
    }
  }.observes('isEnabled'),

  // Have to add an array observer to invalidate 'filteredObjects'
  // since in some cases the entire 'objects' array-like object doesn't
  // get replaced, just modified.
  _objectsDidChange: function() {
    //console.log('%@._objectsDidChange(%@)'.fmt(this, this.get('objects')));

    this.notifyPropertyChange('filteredObjects'); // force a recompute next time 'filteredObjects' is asked for
    this.notifyPropertyChange('selectedObject');
  }.observes('*objects.[]'),

  _filteredObjectsLengthDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('*filteredObjects.length'),

  _isBusyDidChange: function() {
    this.invokeOnce('_updateListPaneLayout');
  }.observes('isBusy'),

  /*
    Triggered by arrowing up/down in the drop down list -- show the name
    of the highlighted item in the text field.
  */
  _listSelectionDidChange: function() {
    var selection = this.getPath('_listSelection.firstObject');
    var name;
    
    if (selection && this._listPane && this._listPane.get('isPaneAttached')) {
      name = this._getObjectName(selection, this.get('nameKey'), this.get('localize'));
      this.setPathIfChanged('textFieldView.value', name);
      this._setIcon(this._getObjectIcon(selection, this.get('iconKey')));
    }
  }.observes('_listSelection'),

  // If the text field value changed as a result of typing,
  // update the filter.
  _textFieldValueDidChange: function() {
    if (this._shouldUpdateFilter) {
      this._shouldUpdateFilter = NO;
      this.setIfChanged('filter', this.getPath('textFieldView.value'));
    }
  }.observes('*textFieldView.value'),

  _selectedObjectDidChange: function() {
    var selectedObject = this.get('selectedObject');

    if (this.getPath('_listSelection.firstObject') !== selectedObject) {
      this.setPath('_listSelection', selectedObject ? SC.SelectionSet.create().addObject(selectedObject) : SC.SelectionSet.EMPTY);
    }
  }.observes('selectedObject'),

  /*
    Observer added dynamically in init() fires this function
  */
  _selectedObjectNameDidChange: function() {
    this.setPathIfChanged('textFieldView.value', this.get('selectedObjectName'));
  }.observes('selectedObjectName'),

  _selectedObjectIconDidChange: function() {
    this._setIcon(this.get('selectedObjectIcon'));
  }.observes('selectedObjectIcon'),

  _createListPane: function() {
    var isBusy = this.get('isBusy');
    var spinnerHeight = this.get('statusIndicatorHeight');
    var csv = this.get('customScrollView') || SC.ScrollView;

    var classNames = ['scui-combobox-list-pane', 'sc-menu'],
        customPickerClassName = this.get('customPickerClassName');
    
    if(customPickerClassName) {
      classNames.push(customPickerClassName);
    }

    this._listPane = SC.PickerPane.create({
      classNames: classNames,
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,

      contentView: SC.View.extend({
        layout: { left: 0, right: 0, top: 4, bottom: 4 },
        childViews: 'listView spinnerView'.w(),
        
        listView: csv.extend({
          classNames: 'scui-combobox-list-scroll-view',
          layout: { left: 0, right: 0, top: 0, bottom: isBusy ? spinnerHeight : 0 },
          hasHorizontalScroller: NO,
        
          contentView: SC.ListView.design({
            classNames: 'scui-combobox-list-view',
            layout: { left: 0, right: 0, top: 0, bottom: 0 },
            allowsMultipleSelection: NO,
            target: this,
            rowHeight: this.get('rowHeight'),
            action: '_selectListItem', // do this when [Enter] is pressed, for example
            contentBinding: SC.Binding.from('filteredObjects', this).oneWay(),
            contentValueKey: this.get('nameKey'),
            hasContentIcon: this.get('iconKey') ? YES : NO,
            contentIconKey: this.get('iconKey'),
            selectionBinding: SC.Binding.from('_listSelection', this),
            localizeBinding: SC.Binding.from('localize', this).oneWay(),
            actOnSelect: SC.platform.touch,

            // A regular ListItemView, but with localization added
            exampleView: SC.ListItemView.extend({
              maxNameLength: this.get('maxNameLength'),
              localize: this.get('localize'),
              
              displayProperties: ['highlightSpan'],

              highlightFilteredSpan: this.get('highlightFilterOnListItem'),

              comboBoxView: this,

              renderLabel: function(context, label) {
                
                var maxLength = this.get('maxNameLength');
                
                if (!SC.none(maxLength)) {
                  label = this.truncateMaxLength(label, maxLength);
                }

                if(this.get('highlightFilteredSpan')) {
                  var comboBoxView = this.get('comboBoxView');
                  
                  if(comboBoxView) {
                    var filter = comboBoxView.get('filter'),
                        regex;

                    if(filter.length > 1) {
                      regex = new RegExp('(' + comboBoxView._sanitizeFilter(filter) + ')', 'gi');
                      label = label.replace(regex, '<span class="highlight-filtered-text">$1</span>');
                    }
                  }
                }
                
                context.push('<label>', label || '', '</label>');

              },
              
              truncateMaxLength: function(str, maxLength) {
                var i, frontLength, endLength, ret = str;

                if ((SC.typeOf(str) === SC.T_STRING) && (str.length > maxLength)) {
                  // split character budget between beginning and end of the string
                  frontLength = Math.max(Math.ceil((maxLength - 3) / 2), 0);
                  endLength = Math.max(maxLength - 3 - frontLength, 0);

                  // grab segment from front of string
                  ret = str.substring(0, frontLength);

                  // Add up to three ellipses
                  for (i = 0; (i < 3) && ((i + frontLength) < maxLength); i++) {
                    ret = ret + '.';
                  }

                  // append segment from end of string
                  ret = ret + str.substring(str.length - endLength);
                }

                return ret;
              }
            }),
          
            // transparently notice mouseUp and use it as trigger
            // to close the list pane
            mouseUp: function() {
              var ret = arguments.callee.base.apply(this,arguments);
              var target = this.get('target');
              var action = this.get('action');
              if (target && action && target.invokeLater) {
                target.invokeLater(action);
              }
              return ret;
            }
          })
        }),

        spinnerView: SC.View.extend({
          classNames: 'scui-combobox-spinner-view',
          layout: { centerX: 0, bottom: 0, width: 100, height: spinnerHeight },
          isVisibleBinding: SC.Binding.from('isBusy', this).oneWay(),
          childViews: 'imageView messageView'.w(),
          
          imageView: SCUI.LoadingSpinnerView.extend({
            layout: { left: 0, top: 0, bottom: 0, width: 18 },
            theme: 'darkTrans',
            callCountBinding: SC.Binding.from('isBusy', this).oneWay().transform(function(value) {
              value = value ? 1 : 0;
              return value;
            })
          }),
          
          messageView: SC.LabelView.extend({
            layout: { left: 25, top: 0, bottom: 0, right: 0 },
            valueBinding: SC.Binding.from('status', this).oneWay().transform(function(value) {
              value = (value === SC.Record.BUSY_LOADING) ? "Loading...".loc() : "Refreshing...".loc(); // this view is only visible when status is busy
              return value;
            })
          })
        })
      })
    });

    this._listView = this._listPane.getPath('contentView.listView.contentView');
    this._listScrollView = this._listPane.getPath('contentView.listView');
  },

  /**
    Invoked whenever the contents of the drop down pane change.  This method
    autosizes the pane appropriately.
  */
  _updateListPaneLayout: function() {
    var rowHeight, length, width, height, frame, minHeight, maxHeight, spinnerHeight, isBusy;

    if (this._listView && this._listPane && this._listScrollView) {
      frame = this.get('frame');
      width = this.get('dropDownMenuWidth') ? this.get('dropDownMenuWidth') : frame ? frame.width : 200;

      isBusy = this.get('isBusy');
      spinnerHeight = this.get('statusIndicatorHeight');
      rowHeight = this._listView.get('rowHeight') || this.get('rowHeight');

      // even when list is empty, show at least one row's worth of height,
      // unless we're showing the busy indicator there
      length = this.getPath('filteredObjects.length') || (isBusy ? 0 : 1);

      height = (rowHeight * length) + (isBusy ? spinnerHeight : 0) + 14; // content view of pane is inset by a total of 7px top and bottom, so accounting for that
      height = Math.min(height, this.get('maxListHeight')); // limit to max height
      height = Math.max(height, this.get('minListHeight')); // but be sure it is always at least the min height

      this._listScrollView.adjust({ bottom: isBusy ? spinnerHeight : 0 });
      this._listPane.adjust({ width: width, height: height });
      this._listPane.updateLayout(); // force pane to re-render layout
      this._listPane.positionPane(); // since size has changed, force pane to recompute its position on the screen
    }
  },

  // default action for the list view
  _selectListItem: function() {
    var len = this.getPath('filteredObjects.length'),
        lv = this._listView,
        selection = lv ? lv.getPath('selection.firstObject') : null;
    
    if (lv && len === 1) {
      var filter = this.get('filter'),
          obj = lv.getPath('content').objectAt(0),
          value = obj.get ? obj.get(this.get('nameKey')) : obj[this.get('nameKey')];
          
      if (filter && value && (value.toLowerCase() === filter.toLowerCase())) {
        selection = obj;
      } 
    }
    
    if (selection) this.setIfChanged('selectedObject', selection);
    this.hideList();
  },

  _sanitizeFilter: function(str){
    return str ? str.replace(this._sanitizeRegEx, '\\$1') : str;
  },

  _setIcon: function(icon) {
    if (icon) {
      this.setPathIfChanged('leftAccessoryView.value', icon);
      this.setPathIfChanged('textFieldView.leftAccessoryView', this.get('leftAccessoryView'));
    }
    else {
      this.setPathIfChanged('textFieldView.leftAccessoryView', null);
    }
  },

  _getObjectName: function(obj, nameKey, shouldLocalize) {
    var name = obj ? (nameKey ? (obj.get ? obj.get(nameKey) : obj[nameKey]) : obj) : null;

    // optionally localize
    if (shouldLocalize && name && name.loc) {
      name = name.loc();
    }
    
    return name;
  },

  _getObjectIcon: function(obj, iconKey) {
    var ret = null;

    if (obj && iconKey) {
      ret = (obj.get ? obj.get(iconKey) : obj[iconKey]) || '/static/sproutcore/foundation/en/eurekajview/source/resources/blank.gif';
    }
    
    return ret;
  },

  _getObjectValue: function(obj, valueKey) {
    return obj ? (valueKey ? (obj.get ? obj.get(valueKey) : obj[valueKey]) : obj) : null;
  },

  // PRIVATE PROPERTIES
  
  _lastSelectedObject: null,
  
  _listPane: null,
  _listScrollView: null,
  _listView: null,
  _listSelection: null,
  
  _keyDown: NO,
  _shouldUpdateFilter: NO,
  
  /**
    Do this once here so we don't have to spend cpu time recreating this every time the search filter changes
  */
  _sanitizeRegEx: new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g')

});


/* >>>>>>>>>> BEGIN source/views/content_editable.js */
// ==========================================================================
// SCUI.ContentEditableView
// ==========================================================================
/*globals NodeFilter SC SCUI sc_require */

sc_require('panes/context_menu_pane');

/** @class

  This view provides rich text editor functionality (RTE). It's a variation of
  the SC webView. It works be setting the body of the iframe to be 
  ContentEditable as well as attaching a mouseup, keyup and paste events on the 
  body of the iframe to detect the current state of text at the current mouse 
  position.

  @extends SC.WebView
  @author Mohammed Taher
  @author Joe Shelby
  @version 0.930

  ==========
  = v.930 =
  ==========
  - siginificant fixes to selection, architecture, bug fixes
  - selected image src now available as calculated property
  - ctrl-a / cmd-a triggers querySelection

  ==========
  = v.920 =
  ==========
  - Added new functionality related to images. Users can bind to the currently
  selected image's width, height or alt/label property. I also added a function
  to reset the dimensions of the (selected) image.

  ==========
  = v.914 =
  ==========
  - Added indentOnTab option. This works by inserting white space
  according to the value on the tabSize option
  - Commented out querying indent/outdent as it's a buggy implemention.
  Querying them now will always return NO

  ==========
  = v.9131 =
  ==========
  - No longer explicity setting the scrolling attribute if allowScrolling is 
  YES (scroll bars were being rendered at all times) - COMMIT HAS BEEN REVERTED

  ==========
  = v0.913 =
  ==========
  - Improved inserHTML() function
  - Improved focus() function
  - New selectContent() function
  - Ability to attach a stylesheet to editor

  ==========
  = v0.912 =
  ==========
  - Better variable names
  - Querying indent/outdent values now works in FF
  - Slightly more optimized. (In the selectionXXXX properties, 
    this._document/this._editor was being accessed multiple times, 
    now it happens once at the beginning).
  - New helper functions. Trying to push browser code branching to such 
    functions.
    a. _getFrame
    b. _getDocument
    c. _getSelection
    d. _getSelectedElement
  - Reversed isOpaque value

*/

SCUI.ContentEditableView = SC.WebView.extend(SC.Editable,
/** @scope SCUI.ContentEditableView.prototype */
{

  /**
    Value of the HTML inside the body of the iframe.
  */
  value: '',

  /** @private */
  valueBindingDefault: SC.Binding.single(),

  /**
    Set to NO to prevent scrolling in the iframe.
  */
  allowScrolling: YES,

  /**
    Set to NO when the view needs to be transparent.
  */
  isOpaque: YES,

  /**
    Current selected content in the iframe.
  */
  selection: '',

  /**
    Read-only value
    The currently selected image
  */
  selectedImage: null,

  /**
    Read-only value
    The currently selected hyperlink
  */

  selectedHyperlink: null,

  /**
    Read-only value
    The currently selected hyperlink
  */

  selectedText: null,

  /**
    A view can be passed that grows/shrinks in dimensions as the ContentEditableView
    changes dimensions.
  */
  attachedView: null,

  /**
    Read-only value
    OffsetWidth of the body of the iframe.
  */
  offsetWidth: null,

  /**
    Read-only value.
    OffsetHeight of the body of the iframe.
  */
  offsetHeight: null,

  /**
    Set to NO to allow dimensions of the view to change according to the HTML.
  */
  hasFixedDimensions: YES,

  /**
    A set of values to be applied to the editor when it loads up.
    Styles can be dashed or camelCase, both are acceptable.

    For example,

    { 'color': 'blue',
      'background-color': 'red' }

    OR

    { 'color': 'orange',
      'backgroundColor': 'green' }
  */
  inlineStyle: {},

  /**
    If set to YES, then HTML from iframe will be saved everytime isEditing is set
    to YES
  */
  autoCommit: NO,

  /**
    Set to NO to prevent automatic cleaning of text inserted into editor
  */
  cleanInsertedText: YES,

  /**
    Replaces '\n' with '&#13;' and '\r' with '&#10;'
  */
  encodeNewLine: NO,

  /**
    CSS to style the edit content
  */
  styleSheetCSS: '',

  /**
    An array of link strings. Each string is expected to be a fully formed link tag, eg.

      '<link href="http://link/to/stylshee.css" rel="stylesheet" type="text/css" />'
  */
  styleSheetsLinks: [],

  /**
    List of menu options to display on right click
  */
  rightClickMenuOptionsWithoutSelection: [],

  /**
    List of menu options to display on right click with selection
  */
  rightClickMenuOptionsWithSelection: [],

  docType: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

  /*
	  returns right click menu options
	*/
  rightClickMenuOptions: function() {
    //get
    var ret = [];
    var wos = this.get('rightClickMenuOptionsWithoutSelection'),
    ws = this.get('rightClickMenuOptionsWithSelection');
    if (this.get('selectedText') && this.get('selectedText').length > 0) {
      ws.forEach(function(j) {
        ret.pushObject(j);
      });
    }
    wos.forEach(function(i) {
      ret.pushObject(i);
    });

    return ret;
  }.property('rightClickMenuOptionsWithoutSelection', 'rightClickMenuOptionsWithSelection', 'selection').cacheable(),
  /**
	  Used specifically for encoding special characters in an anchor tag's
	  href attribute. This is mostly an edge case.
	    (<) - %3C
	    (>) - %3E
	    ( ) - %20
	    (&) - &amp;
	    (') - %27
	*/
  encodeContent: YES,

  /**
	  Tab options
	*/
  indentOnTab: YES,
  tabSize: 2,

  /*
	  receives actions on click to insert event...
	*/
  insertTarget: null,

  /*
    permits right-click menu when no menu options provided
  */
  allowsDefaultRightClickMenu: YES,

  isFocused: NO,

  selectionSaved: NO,

  displayProperties: ['value'],

  render: function(context, firstTime) {
    var value = this.get('value');
    var isOpaque = !this.get('isOpaque');
    var allowScrolling = this.get('allowScrolling') ? 'yes': 'no';
    var frameBorder = isOpaque ? '0': '1';
    var styleString = 'position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;';

    if (firstTime) {
      context.push('<iframe frameBorder="', frameBorder, '" name="', this.get('frameName'));
      context.push('" scrolling="', allowScrolling);
      context.push('" src="" allowTransparency="', isOpaque, '" style="', styleString, '"></iframe>');
    } else if (this._document) {
      var html = this._document.body.innerHTML;

      if (this.get('encodeContent')) {
        html = this._encodeValues(html);
      }

      if (this.get('encodeNewLine')) {
        html = html.replace(/\r/g, '&#13;');
        html = html.replace(/\n/g, '&#10;');
      }

      if (value !== html) {
        this._document.body.innerHTML = value;
      }
    }
  },

  didCreateLayer: function() {
    arguments.callee.base.apply(this,arguments);
    var f = this.$('iframe');
    SC.Event.add(f, 'load', this, this.editorSetup);
  },

  displayDidChange: function() {
    var doc = this._document;
    if (doc) {
      doc.body.contentEditable = this.get('isEnabled');
    }
    arguments.callee.base.apply(this,arguments);
  },

  _attachEventHandlers: function(doc, docBody) {
    SC.Event.add(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.add(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.add(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.add(docBody, 'keyup', this, this.keyUp);
    SC.Event.add(docBody, 'paste', this, this.paste);
    SC.Event.add(docBody, 'dblclick', this, this.doubleClick);
    SC.Event.add(docBody, 'mouseout', this, this.mouseOut);
    if (this.get('indentOnTab')) SC.Event.add(docBody, 'keydown', this, this.keyDown);
    // there are certian cases where the body of the iframe won't have focus
    // but the user will be able to type... this happens when the user clicks on
    // the white space where there's no content. This event handler
    // ensures that the body will receive focus when the user clicks on that area.
    SC.Event.add(doc, 'click', this, this.focus);
    SC.Event.add(doc, 'mouseup', this, this.docMouseUp);
    SC.Event.add(doc, 'contextmenu', this, this.contextmenu);
  },

  _removeEventHandlers: function(doc, docBody) {
    if (this.get('indentOnTab')) SC.Event.remove(docBody, 'keydown', this, this.keyDown);
    SC.Event.remove(docBody, 'focus', this, this.bodyDidFocus);
    SC.Event.remove(docBody, 'blur', this, this.bodyDidBlur);
    SC.Event.remove(docBody, 'mouseup', this, this.mouseUp);
    SC.Event.remove(docBody, 'keyup', this, this.keyUp);
    SC.Event.remove(docBody, 'paste', this, this.paste);
    SC.Event.remove(docBody, 'dblclick', this, this.doubleClick);
    SC.Event.remove(docBody, 'mouseout', this, this.mouseOut);
    SC.Event.remove(doc, 'click', this, this.focus);
    SC.Event.remove(doc, 'mouseup', this, this.docMouseUp);
    SC.Event.remove(doc, 'contextmenu', this, this.contextmenu);
    SC.Event.remove(this.$('iframe'), 'load', this, this.editorSetup);
  },

  willDestroyLayer: function() {
    var doc = this._document;
    var docBody = doc.body;
    this._removeEventHandlers(doc, docBody);
    arguments.callee.base.apply(this,arguments);
  },

  editorSetup: function() {
    // store the document property in a local variable for easy access
    this._iframe = this._getFrame();
    this._document = this._getDocument();
    if (SC.none(this._document)) {
      console.error('Curse your sudden but inevitable betrayal! Can\'t find a reference to the document object!');
      return;
    }

    var doc = this._document;

    doc.open();
    doc.write(this.get('docType'));
    doc.write('<html><head>');

    var styleSheetsLinks = this.get('styleSheetsLinks'),
    styleSheetLink;
    if (styleSheetsLinks.length && styleSheetsLinks.length > 0) {
      for (var i = 0,
      j = styleSheetsLinks.length; i < j; i++) {
        styleSheetLink = styleSheetsLinks[i];
        if (styleSheetLink.match(/\<link.*?>/)) {
          doc.write(styleSheetsLinks[i]);
        }
      }
    }

    doc.write('</head><body></body></html>');
    doc.close();

    var styleSheetCSS = this.get('styleSheetCSS');
    if (! (SC.none(styleSheetCSS) || styleSheetCSS === '')) {
      var head = doc.getElementsByTagName('head')[0];
      if (head) {
        var el = doc.createElement("style");
        el.type = "text/css";
        head.appendChild(el);
        if (SC.browser.msie) {
          el.styleSheet.cssText = styleSheetCSS;
        } else {
          el.innerHTML = styleSheetCSS;
        }
        el = head = null;
        //clean up memory
      }
    }

    // set contentEditable to true... this is the heart and soul of the editor
    var value = this.get('value');
    var docBody = doc.body;
    docBody.contentEditable = true;

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }

    if (!this.get('isOpaque')) {
      docBody.style.background = 'transparent';
      // the sc-web-view adds a gray background to the WebView... removing in the
      // case isOpaque is NO
      this.$().setClass('sc-web-view', NO);
    }

    var inlineStyle = this.get('inlineStyle');
    var docBodyStyle = this._document.body.style;
    for (var key in inlineStyle) {
      if (inlineStyle.hasOwnProperty(key)) {
        docBodyStyle[key.toString().camelize()] = inlineStyle[key];
      }
    }

    docBody.innerHTML = value;

    // set min height beyond which ContentEditableView can't shrink if hasFixedDimensions is set to false
    if (!this.get('hasFixedDimensions')) {
      var height = this.get('layout').height;
      if (height) {
        this._minHeight = height;
      }

      var width = this.get('layout').width;
      if (width) {
        this._minWidth = width;
      }
    }

    this._attachEventHandlers(doc, docBody);

    // call the SC.WebView iframeDidLoad function to finish setting up
    this.iframeDidLoad();
    this.focus();

    // When body.innerHTML is used to insert HTML into the iframe, it results in a bug
    // (if you select-all then try and delete, it won't have any effect). This
    // is a hack for that problem
    doc.execCommand('inserthtml', false, ' ');
    doc.execCommand('undo', false, null);
  },

  bodyDidFocus: function(evt) {
    this.set('isFocused', YES);

  },

  bodyDidBlur: function(evt) {
    this.set('isFocused', NO);
  },

  contextmenu: function(evt) {
    var menuOptions = this.get('rightClickMenuOptions');
    var numOptions = menuOptions.get('length');

    if (menuOptions.length > 0) {

      var pane = this.contextMenuView.create({
        defaultResponder: this.get('rightClickMenuDefaultResponder'),
        layout: {
          width: 200
        },
        itemTitleKey: 'title',
        itemTargetKey: 'target',
        itemActionKey: 'action',
        itemSeparatorKey: 'isSeparator',
        itemIsEnabledKey: 'isEnabled',
        items: menuOptions
      });

      pane.popup(this, evt);
    }

    if ((menuOptions.length > 0) || (!this.get('allowsDefaultRightClickMenu'))) {
      if (evt.preventDefault) {
        evt.preventDefault();
      } else {
        evt.stop();
      }
      evt.returnValue = false;
      evt.stopPropagation();
      return NO;
    }
  },

  // Can't do this on the body mouseup function (The body mouse
  // function is not always triggered, e.g, when the mouse cursor is behind
  // a border)
  docMouseUp: function(evt) {
    var that = this;
    this.invokeLast(function() {
      var image = that.get('selectedImage');
      if (image) {
        image.style.width = image.width + 'px';
        image.style.height = image.height + 'px';
        that.set('isEditing', YES);
      }
    });
  },

  /**
	  Override this method to execute an action on double click. This was done
	  this way (as opposed to passing target/action) to be able to pass down
	  the evt parameter to the event handler.
	  
	  @params evt
  */
  doubleClick: function(evt) {
    SC.RunLoop.begin();
    // do your thing...
    SC.RunLoop.end();
  },

  contextMenuView: SCUI.ContextMenuPane.extend({
    popup: function(anchorView, evt) {
      if ((!anchorView || !anchorView.isView) && !this.get('usingStaticLayout')) return NO;

      var anchor = anchorView.isView ? anchorView.get('layer') : anchorView;

      // prevent the browsers context meuns (if it has one...). (SC does not handle oncontextmenu event.)
      document.oncontextmenu = function(e) {
        var menuOptions = anchorView.get('rightClickMenuOptions');
        var numOptions = menuOptions.get('length');

        if (menuOptions.length > 0) {
          if (evt.preventDefault) {
            evt.preventDefault();
          } else {
            evt.stop();
          }
          evt.returnValue = false;
          evt.stopPropagation();
          return false;
        }
      };

      // Popup the menu pane
      this.beginPropertyChanges();
      var it = this.get('displayItems');
      this.set('anchorElement', anchor);
      this.set('anchor', anchorView);
      this.set('preferType', SC.PICKER_MENU);
      this.endPropertyChanges();
// TODO [JS]: this is putting the pop-up at quite a distance from the click, OR-7463
      return arguments.callee.base.base.apply(this, [anchorView, [evt.pageX + 5, evt.pageY + 5, 1]]);
    },

    exampleView: SC.MenuItemView.extend({
      renderLabel: function(context, label) {
        if (this.get('escapeHTML')) {
          label = SC.RenderContext.escapeHTML(label);
        }
        context.push("<span class='value ellipsis' unselectable='on'>" + label + "</span>");
      }
    })

  }),

  keyUp: function(event) {
    SC.RunLoop.begin();

    switch (SC.FUNCTION_KEYS[event.keyCode]) {
    case 'left':
    case 'right':
    case 'up':
    case 'down':
    case 'home':
    case 'end':
    case 'return':
      this.querySelection();
      break;
    }
    // [JS] control-A on windows/linux, or cmd-a on mac, selects all automatically, and should update selection
    // jquery hack send meta AND ctrl if ctrl was pressed, which means we'd get triggered on ctrl even if select-all didn't happen, so look for meta without control
    // complaint reported in 2008, but it is still there in jquery now, and in sproutcore's corequery base
    if (event.keyCode === 65 && ((SC.browser.mac && event.metaKey && !event.ctrlKey) || (!SC.browser.mac && event.ctrlKey))) {
      this.querySelection();
    }

    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isEditing', YES);

    SC.RunLoop.end();
  },

  _tabKeyDown: function(event) {
    // insert spaces instead of actual tab character
    var tabSize = this.get('tabSize'),
    spaces = [];
    if (SC.typeOf(tabSize) !== SC.T_NUMBER) {
      // tabSize is not a number. Bail out and recover gracefully
      return;
    }

    for (var i = 0; i < tabSize; i++) {
      spaces.push('\u00a0');
    }

    event.preventDefault();
    this.insertHTML(spaces.join(''), NO);
  },

  keyDown: function(event) {
    SC.RunLoop.begin();
    if ((SC.FUNCTION_KEYS[event.keyCode] === 'tab') && this.get('indentOnTab')) {
      this._tabKeyDown(event);
    }

    if (SC.browser.msie) {
      // IE workaround - return key might do the wrong thing
      var element = this._getSelectedElement();

      if (SC.FUNCTION_KEYS[event.keyCode] === 'return' && element.nodeName !== 'LI') {
        var range = this._iframe.document.selection.createRange();
        range.pasteHTML('<br>');
        range.collapse(false);
        range.select();
        event.preventDefault();
      }
    }

    SC.RunLoop.end();
  },

  mouseOut: function(evt) {
    this.querySelection();
  },

  mouseUp: function(evt) {
    this._mouseUp = true;
    SC.RunLoop.begin();
    if (this.get('insertInProgress')) {
      this.set('insertInProgress', NO);
      this.get('insertTarget').sendAction('insert');
    }
    this.querySelection();

    //attempting to help webkit select images...
    if (evt.target && evt.target.nodeName === "IMG") {
      var sel = this._iframe.contentWindow.getSelection(),
      range = this._iframe.contentWindow.document.createRange();

      range.selectNode(evt.target);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }

    this.set('isEditing', YES);
    SC.RunLoop.end();
  },

  paste: function() {
    SC.RunLoop.begin();

    this.querySelection();
    if (!this.get('hasFixedDimensions')) {
      this.invokeLast(this._updateLayout);
    }
    this.set('isEditing', YES);

    SC.RunLoop.end();
    return YES;
  },

  /** @property String */
  frameName: function() {
    return this.get('layerId') + '_frame';
  }.property('layerId').cacheable(),

  editorHTML: function(key, value) {
    var doc = this._document;
    if (!doc) return NO;

    if (value !== undefined) {
      doc.body.innerHTML = value;
      return YES;
    } else {
      if (this.get('cleanInsertedText')) {
        return this.cleanWordHTML(doc.body.innerHTML);
      } else {
        return doc.body.innerHTML;
      }
    }
  }.property(),

  selectionRange: function() {
    var selection = this.get('selection'),
    range = null;
    if (SC.none(selection)) {
      return null;
    }
    if (SC.browser.msie) {
      range = selection.createRange();
    } else {
      // *should* never be 0 if there's a selection active
      range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    }
    return range;
  }.property('selection'),

  selectionPlainText: function() {
    var selection = this.get('selection');
    return SC.none(selection) ? '': selection.toString();
  }.property('selection').cacheable(),

  // [JS]: Firefox throws exceptions under certain circumstances
  // 1) justify being queried if an iframe is not actually rendered on the screen
  // 2) query for font or color and the CSS state is different from the tags
  //    e.g., if the color is set by div.style = { color: ... }, an exception will fire if it first sees the older <span color=>
  // there are enough of these oddities that will show up in imported (and migrated) pages to make it worth catching for now and addressing later
  // rather than letting the exception destabilize the system
  _queryCommandState: function(doc, prop) {
    var e = null;
    try {
      return doc.queryCommandState(prop);
    } catch (e) {
      SC.Logger.warn("queryCommandState got exception for property " + prop);
      return NO;
    }
  },

  _queryCommandValue: function(doc, prop) {
    var e = null;
    try {
      return doc.queryCommandValue(prop);
    } catch (e) {
      SC.Logger.warn("queryCommandState got exception for property " + prop);
      return null;
    }
  },

  _selectionIsSomething: function(key, val, something) {
    var doc = this._document;
    if (!doc) return NO;

    if (val !== undefined) {
      if (doc.execCommand(something, false, val)) {
        this.set('isEditing', YES);
      }
    }

    return this._queryCommandState(doc, something);
  },

  selectionIsBold: function(key, val) {
    return this._selectionIsSomething(key, val, 'bold');
  }.property('selection').cacheable(),

  selectionIsItalicized: function(key, val) {
    return this._selectionIsSomething(key, val, 'italic');
  }.property('selection').cacheable(),

  selectionIsUnderlined: function(key, val) {
    return this._selectionIsSomething(key, val, 'underline');
  }.property('selection').cacheable(),

  selectionIsStrikedThrough: function(key, val) {
    return this._selectionIsSomething(key, val, 'strikeThrough');
  }.property('selection').cacheable(),

  _selectionIsJustified: function(key, val, justify) {
    var doc = this._document, e = null;
    if (!doc) return NO;

    if (val !== undefined) {
      if (SC.browser.msie) {
        this._alignContentForIE(justify);
      } else {
        doc.execCommand(justify, false, val);
      }
      // since DOM is significantly altered, selection needs to be refreshed
      this.querySelection();
      this.set('isEditing', YES);
    }
    return this._queryCommandState(doc, justify);
  },

  selectionIsCenterJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifycenter');
  }.property('selection').cacheable(),

  selectionIsRightJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyright');
  }.property('selection').cacheable(),

  selectionIsLeftJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyleft');
  }.property('selection').cacheable(),

  selectionIsFullJustified: function(key, val) {
    this._selectionIsJustified(key, val, 'justifyfull');
  }.property('selection').cacheable(),

  // TODO: [JS] - Clean some of this code up
  _alignContentForIE: function(justify) {
    var doc = this._document;
    var elem = this._getSelectedElement();
    var range = doc.selection.createRange();
    var html, newHTML;
    var alignment;
    switch (justify) {
    case 'justifycenter':
      alignment = 'center';
      break;
    case 'justifyleft':
      alignment = 'left';
      break;
    case 'justifyright':
      alignment = 'right';
      break;
    case 'justifyfull':
      alignment = 'justify';
      break;
    }

    // if it's an image, use the native execcommand for alignment for consistent
    // behaviour with FF
    if (elem.nodeName === 'IMG') {
      doc.execCommand(justify, false, null);
    } else if (elem.nodeName !== 'DIV' || elem.innerText !== range.text) {
      html = range.htmlText;
      newHTML = '<div align="%@" style="text-align: %@">%@</div>'.fmt(alignment, alignment, html);
      range.pasteHTML(newHTML);
    } else {
      elem.style.textAlign = alignment;
      elem.align = alignment;
    }
  },

  selectionIsOrderedList: function(key, val) {
    var doc = this._document;
    if (!doc) return NO;

    if (val !== undefined) {
      if (SC.browser.msie && val === YES) {
        this._createListForIE('ol');
      } else {
        if (doc.execCommand('insertorderedlist', false, val)) {
          this.querySelection();
        }
      }
      this.set('isEditing', YES);
    }

    return this._queryCommandState(doc, 'insertorderedlist');
  }.property('selection').cacheable(),

  selectionIsUnorderedList: function(key, val) {
    var doc = this._document;
    if (!doc) return NO;

    if (val !== undefined) {
      if (SC.browser.msie && val === YES) {
        this._createListForIE('ul');
      } else {
        if (doc.execCommand('insertunorderedlist', false, val)) {
          this.querySelection();
        }
      }
      this.set('isEditing', YES);
    }

    return this._queryCommandState(doc, 'insertunorderedlist');
  }.property('selection').cacheable(),

  _createListForIE: function(tag) {
    var html = '';
    var doc = this._document;
    var range = this._iframe.document.selection.createRange();
    var text = range.text;
    var textArray = text.split('\n');
    var elem = this._getSelectedElement();

    if (elem.nodeName === 'LI') {
      elem = elem.parentNode;
    }

    if (elem.nodeName === 'OL' || elem.nodeName === 'UL') {
      var newEl = doc.createElement(tag);
      newEl.innerHTML = elem.innerHTML;
      elem.parentNode.replaceChild(newEl, elem);
      this.querySelection();
      return;
    }

    if (textArray.length > 1) {
      for (var i = 0; i < textArray.length; i++) {
        html += '<li>%@</li>'.fmt(textArray[i]);
      }
    } else {
      html = '<li>%@<li>'.fmt(text);
    }
    range.pasteHTML('<%@>%@<%@>'.fmt(tag, html, tag));
  },

  // indent/outdent have some sort of problem with every
  // browser. Check,
  //
  // http://www.quirksmode.org/dom/execCommand.html
  //
  // I would avoid using these for now and go with
  // indentOnTab
  selectionIsIndented: function(key, val) {
    var doc = this._document;
    if (!doc) return NO;

    if (val !== undefined) {
      if (doc.execCommand('indent', false, val)) {
        this.set('isEditing', YES);
      }
    }

    if (SC.browser.msie) {
      return doc.queryCommandState('indent');
    } else {
      /*
	      [MT] - Buggy... commeting out for now
	      var elem = this._getSelectedElemented();
	      if (!SC.none(elem)) {
	        if (elem.style['marginLeft'] !== '') {
	          return YES;
	        }
	      }
	      */
      return NO;
    }
  }.property('selection').cacheable(),

  selectionIsOutdented: function(key, val) {
    var doc = this._document;
    if (!doc) return NO;

    if (val !== undefined) {
      if (doc.execCommand('outdent', false, val)) {
        this.set('isEditing', YES);
      }
    }

    if (SC.browser.msie) {
      return doc.queryCommandState('outdent');
    } else {
      /*
	      [MT] - Buggy... commeting out for now
	      var elem = this._getSelectedElemented();
	      if (!SC.none(elem)) {
	        if (elem.style['marginLeft'] === '') {
	          return YES;
	        }
	      }
	      */
      return NO;
    }
  }.property('selection').cacheable(),

  selectionIsSubscript: function(key, val) {
    return this._selectionIsSomething(key, val, 'subscript');
  }.property('selection').cacheable(),

  selectionIsSuperscript: function(key, val) {
    return this._selectionIsSomething(key, val, 'superscript');
  }.property('selection').cacheable(),

  selectionFontName: function(key, val) {
    var doc = this._document;
    if (!doc) return '';
    var ret;

    if (val !== undefined) {
      var identifier = '%@%@'.fmt(this.get('layerId'), '-ce-font-temp');

      if (doc.execCommand('fontname', false, identifier)) {
        var fontTags = doc.getElementsByTagName('font');
        for (var i = 0,
        j = fontTags.length; i < j; i++) {
          var fontTag = fontTags[i];
          if (fontTag.face === identifier) {
            fontTag.face = '';
            fontTag.style.fontFamily = val;
          }
        }

        this.set('isEditing', YES);
      }
    } else {
      var elm = this._findFontTag(this._getSelectedElement(), "fontFamily");
      if (elm && elm.nodeName.toLowerCase() === 'font') {
        ret = elm.style.fontFamily;
      } else {
        ret = null;
      }
      return ret;
    }
  }.property('selection').cacheable(),

  selectionFontSize: function(key, value) {
    var frame = this._iframe;
    var doc = this._document;
    if (!doc) return '';
    var ret;

    if (value !== undefined) {
      var identifier = '%@%@'.fmt(this.get('layerId'), '-ce-size-temp');

      // apply unique string to font size to act as identifier
      if (doc.execCommand('fontname', false, identifier)) {

        // get all newly created font tags
        var fontTags = doc.getElementsByTagName('font');
        for (var i = 0,
        j = fontTags.length; i < j; i++) {
          var fontTag = fontTags[i];
          if (fontTag.face === identifier) {
            fontTag.face = '';
            fontTag.style.fontSize = value;
          }
        }
        this.set('isEditing', YES);
        return value;
      }
    } else {
      var elm = this._findFontTag(this._getSelectedElement(), "fontSize");
      if (elm && elm.nodeName.toLowerCase() === 'font') {
        ret = elm.style.fontSize;
      } else {
        ret = null;
      }
      return ret;
    }
  }.property('selection').cacheable(),

  _findFontTag: function(elem, property) {
    while (elem && elem.nodeName !== 'BODY') {
      if (elem.nodeName === 'FONT' && elem.style && elem.style[property]) {
        return elem;
      } else {
        elem = elem.parentNode;
      }
    }
    return null;
  },

  selectionFontColor: function(key, value) {
    var ret = '';
    if (!this.get('isVisibleInWindow')) return ret;

    var doc = this._document;
    if (!doc) return ret;

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, true);
    }

    if (value !== undefined) {
      if (this.get('selectionSaved') === YES) {
        this.restoreSelection();
      }
      if (doc.execCommand('forecolor', false, value)) {
        this.saveSelection();
        this.set('isEditing', YES);
        this._last_font_color_cache = value;
      }
    }

    if (this._last_font_color_cache) {
      ret = this._last_font_color_cache;
    } else {
      var color = this._queryCommandValue(doc, 'forecolor');
      if (color) {
        this._last_font_color_cache = SC.browser.msie ? this.convertBgrToHex(color) : SC.parseColor(color);
        ret = this._last_font_color_cache;
      }
    }

    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }

    return ret;
  }.property('selection').cacheable(),

  selectionBackgroundColor: function(key, value) {
    var ret = '';
    if (!this.get('isVisibleInWindow')) return ret;

    var doc = this._document;
    if (!doc) return ret;

    var prop = SC.browser.msie ? 'backcolor': 'hilitecolor';
    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, true);
    }

    if (value !== undefined) {
      if (this.get('selectionSaved') === YES) {
        this.restoreSelection();
      }
      // TODO: this sets it on the whole DIV block, if the object is inside a DIV for alignment reasons
      // fix by inserting a span into the div around the div's contents, if the selection is only one div element
      // setting THAT to the selection, and then execute the command.  ick.
      // BTW, this is a BUG in FF, where the spec says it should NOT update the whole div
      // only do this on FF because WebKit gets it right.
      if (doc.execCommand(prop, false, value)) {
        this.saveSelection();
        this.set('isEditing', YES);
        this._last_background_color_cache = value;
      }
    }

    if (this._last_background_color_cache) {
      ret = this._last_background_color_cache;
    } else {
      var color = this._queryCommandValue(doc, prop);
      if (color !== 'transparent') {
        color = SC.browser.msie ? this.convertBgrToHex(color) : SC.parseColor(color);
        if (color) {
          this._last_background_color_cache = color;
          ret = this._last_background_color_cache;
        }
      }
    }
    
    if (!SC.browser.msie) {
      doc.execCommand('styleWithCSS', false, false);
    }

    return ret;
  }.property('selection').cacheable(),

  hyperlinkValue: function(key, value) {
    var hyperlink = this.get('selectedHyperlink');
    if (!hyperlink) return '';

    if (!SC.none(value)) {
      hyperlink.href = value;
      this.set('isEditing', YES);
      return value;
    } else {
      return hyperlink.href;
    }
  }.property('selectedHyperlink').cacheable(),

  hyperlinkHoverValue: function(key, value) {
    var hyperlink = this.get('selectedHyperlink');
    if (!hyperlink) return '';

    if (value !== undefined) {
      hyperlink.title = value;
      this.set('isEditing', YES);
      return value;
    } else {
      return hyperlink.title;
    }
  }.property('selectedHyperlink').cacheable(),

  /**
    imageAlignment doesn't need to be updated everytime the selection changes... only 
    when the current selection is an image
  */
  imageAlignment: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      image.align = value;
      this.set('isEditing', YES);
      return value;

    } else {
      return image.align;

    }
  }.property('selectedImage').cacheable(),

  imageWidth: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      this.set('isEditing', YES);
      image.width = value * 1;
      image.style.width = value + "px";
      return value;

    } else {
      return image.clientWidth;

    }
  }.property('selectedImage').cacheable(),

  imageHeight: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      this.set('isEditing', YES);
      image.height = value * 1;
      image.style.height = value + "px";
      return value;

    } else {
      return image.clientHeight;

    }
  }.property('selectedImage').cacheable(),

  imageDescription: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      this.set('isEditing', YES);
      image.title = value;
      image.alt = value;
      return value;

    } else {
      return image.alt;

    }
  }.property('selectedImage').cacheable(),

  imageBorderWidth: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      this.set('isEditing', YES);
      image.style.borderWidth = value;
      return value;

    } else {
      return image.style.borderWidth;

    }
  }.property('selectedImage').cacheable(),

  imageBorderColor: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      this.set('isEditing', YES);

      image.style.borderColor = value;
      return value;

    } else {
      var color = image.style.borderColor;
      if (color !== '') {
        return SC.parseColor(color);
      } else {
        return '';
      }

    }
  }.property('selectedImage').cacheable(),

  imageBorderStyle: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';
    
    if (value !== undefined) {
      this.set('isEditing', YES);
      image.style.borderStyle = value;
      if (value === 'none') { 
        image.style.border = 0; // blow away the border to be safe.
      }
      else {
        delete image.style.border;
      }
      return value;

    } else {
      return image.style.borderStyle;
  
    }
  }.property('selectedImage').cacheable(),

  imageSource: function(key, value) {
    var image = this.get('selectedImage');
    if (!image) return '';

    if (value !== undefined) {
      image.src = value;
      this.set('isEditing', YES);      
      return value;

    } else {
      return image.src;

    }
  }.property('selectedImage').cacheable(),

  resetImageDimensions: function() {
    var image = this.get('selectedImage');
    if (!image) return NO;

    image.style.width = '';
    image.style.height = '';
    image.removeAttribute('width');
    image.removeAttribute('height');

    this.set('isEditing', YES);
    this.notifyPropertyChange('selectedImage');

    return image;
  },

  focus: function() {
    if (!SC.none(this._document)) {
      this._document.body.focus();
      this.querySelection();
    }
  },

  querySelection: function() {
    var selection = this._getSelection();

    this._resetColorCache();

    // The DOM actually only has one selection object (per document) that never really changes, so
    // SproutCore's detection of whether or not the selection changed won't actually work - the object is the same
    // hence, why this code explicitly calls will and did change
    this.propertyWillChange('selection');
    this.set('selection', selection);
    this.propertyDidChange('selection');
  },

  canCreateLink: function() {
    var selectedText = this.get('selectedText');
    var rv = (selectedText && selectedText.length > 0) || !SC.none(this.get('selectedImage'));
    return rv;
  }.property('selectedText', 'selectedImage'),

  createLink: function(value) {
    var doc = this._document;
    var frame = this._iframe;
    if (! (doc && frame)) return NO;
    if (SC.none(value) || value === '') return NO;
    
    if (!this.get('selectedText').length && !this.get('selectedImage')) {
      return NO;
    }

    if (doc.execCommand('createlink', false, value)) {
      this.querySelection();
      this.set('isEditing', YES);
      return YES;
    } else {
      return NO;
    }

  },

  _removeLinkCompletely: function(doc) {
    // taken from an older DOJO's editor code
		var selection = this.get('selection');
		var selectionRange = selection.getRangeAt(0);
		var selectionStartContainer = selectionRange.startContainer;
		var selectionStartOffset = selectionRange.startOffset;
		var selectionEndContainer = selectionRange.endContainer;
		var selectionEndOffset = selectionRange.endOffset;
		var returnValue = YES;
		// select our link and unlink
		var range = doc.createRange();
		var a = this.get('selectedHyperlink');
		if (a) {
		  range.selectNode(a);
		  selection.removeAllRanges();
		  selection.addRange(range);
		  returnValue = doc.execCommand("unlink", false, null);
		  if (returnValue) {
		    // clear the selection - Firefox Bug sometimes adds to the selection after an unlink, which is not desired
		    selection.removeAllRanges();
	    }
	  }

		this.querySelection();
    this.set('isEditing', YES);

    return returnValue;
  },

  removeLink: function() {
    var doc = this._document;
    if (!doc) return NO;

    if (SC.browser.mozilla || SC.browser.chrome) {
      // issue - it should unlink, but it only unlinks correctly if you selected the WHOLE link
      return this._removeLinkCompletely(doc);
    }
    if (doc.execCommand('unlink', false, null)) {
      this.set('selectedHyperlink', null);
      this.set('isEditing', YES);
      return YES;
    }

    return NO;
  },

  // HACK: [JS] Should do something similar to what's being done on
  // image creation (Assigning the newly created image to the selectedImage
  // property)
  // "fixed"? [JS] if no real selection, then selection returns next element
  // so if the image is inserted after the cursor, it should be the selectedImage now
  insertImage: function(value) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;

    if (doc.execCommand('insertimage', false, value)) {
      this.set('isEditing', YES);
      this.querySelection();
      return YES;
    }

    return NO;
  },

  /**
    Inserts a snippet of HTML into the editor at the cursor location. If the
    editor is not in focus then it appens the HTML at the end of the document.

    @param {String} HTML to be inserted
  */
  insertHTML: function(value) {
    var doc = this._document;
    if (!doc) return NO;
    if (SC.none(value) || value === '') return NO;

    if (SC.browser.msie) {
      if (!this.get('isFocused')) {
        this.focus();
      }
      doc.selection.createRange().pasteHTML(value);
      this.set('isEditing', YES);
      return YES;

    } else {
      // Firefox bug workaround - add a space so the cursor is outside of the inserted selection (field_merge) else the next user action might delete it
      value += '\u00a0';
      if (doc.execCommand('inserthtml', false, value)) {
        // Firefox bug workaround pt 2 - remove that added space
        doc.execCommand('delete', false, null);
        this.set('isEditing', YES);
        return YES;
      }
      return NO;
    }
  },

  /**
    Inserts a SC view into the editor by first converting the view into html
    then inserting it using insertHTML(). View objects, classes
    or path are all acceptable.

    For example,

    SC.View.design({
    })

    OR

    SC.View.create({
    })

    OR

    appName.pageName.viewName

    @param {View} SC view to be inserted
  */
  insertView: function(view) {
    if (SC.typeOf(view) === SC.T_STRING) {
      // if nowShowing was set because the content was set directly, then
      // do nothing.
      if (view === SC.CONTENT_SET_DIRECTLY) return;

      // otherwise, if nowShowing is a non-empty string, try to find it...
      if (view && view.length > 0) {
        if (view.indexOf('.') > 0) {
          view = SC.objectForPropertyPath(view, null);
        } else {
          view = SC.objectForPropertyPath(view, this.get('page'));
        }
      }
    } else if (SC.typeOf(view) === SC.T_CLASS) {
      view = view.create();
    }

    var context = SC.RenderContext(view);
    context = context.begin('span');
    view.prepareContext(context, YES);
    context = context.end();
    context = context.join();

    var html;
    if (SC.browser.msie) {
      html = '<span contenteditable=false unselectable="on">' + context + '</span>';
    } else {
      html = '<span contenteditable=false style="-moz-user-select: all; -webkit-user-select: all;">' + context + '</span>';
    }

    this.insertHTML(html);
  },

  /**  
    Filters out junk tags when copying/pasting from MS word. This function is called
    automatically everytime the users paste into the editor. 

    To prevent this, set cleanInsertedText to NO/false.

    @param {String} html html to be cleaned up and pasted into editor
    @returns {Boolean} if operation was successul or not 
  */
  cleanWordHTML: function(html) {
    // remove o tags
    html = html.replace(/\<o:p>\s*<\/o:p>/g, '');
    html = html.replace(/\<o:p>[\s\S]*?<\/o:p>/g, '&nbsp;');

    // remove w tags
    html = html.replace(/\s*<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '');
    html = html.replace(/\s*<w:[^>]*\/?>/gi, '');
    html = html.replace(/\s*<\/w:[^>]+>/gi, '');

    // remove m tags
    html = html.replace(/\s*<m:[^>]*>[\s\S]*?<\/m:[^>]*>/gi, '');
    html = html.replace(/\s*<m:[^>]*\/?>/gi, '');
    html = html.replace(/\s*<\/m:[^>]+>/gi, '');

    // remove mso- styles
    html = html.replace(/\s*mso-[^:]+:[^;"]+;?/gi, '');
    html = html.replace(/\s*mso-[^:]+:[^;]+"?/gi, '');

    // remove crappy MS styles
    html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*;/gi, '');
    html = html.replace(/\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"");
    html = html.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, '');
    html = html.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, "\"");
    html = html.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"");
    html = html.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"");
    html = html.replace(/\s*tab-stops:[^;"]*;?/gi, '');
    html = html.replace(/\s*tab-stops:[^"]*/gi, '');

    // remove xml declarations
    html = html.replace(/\<\\?\?xml[^>]*>/gi, '');

    // remove lang and language tags
    html = html.replace(/\<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");
    html = html.replace(/\<(\w[^>]*) language=([^ |>]*)([^>]*)/gi, "<$1$3");

    // remove onmouseover and onmouseout events
    html = html.replace(/\<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
    html = html.replace(/\<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");

    // remove xstr non-xml attribute in table tags
    html = html.replace(/\<(\w[^>]*) xstr([^>]*)/gi, "<$1$2");

    // remove meta and link tags
    html = html.replace(/\<(meta|link)[^>]+>\s*/gi, '');

    return html;
  },

  /**
    Persists HTML from editor back to value property and sets
    the isEditing flag to false

    @returns {Boolean} if the operation was successul or not
  */
  commitEditing: function() {
    var doc = this._document;
    if (!doc) return NO;

    var value = doc.body.innerHTML;
    if (this.get('cleanInsertedText')) {
      value = this.cleanWordHTML(value);
    }

    if (this.get('encodeNewLine')) {
      value = value.replace(/\r/g, '&#13;');
      value = value.replace(/\n/g, '&#10;');
    }

    if (this.get('encodeContent')) {
      value = this._encodeValues(value);
    }

    this.set('value', value);
    this.set('isEditing', NO);
    return YES;
  },

  /**
    Selects the current content in editor

    @returns {Boolean} if the operation was successful or not
  */
  selectContent: function() {
    var doc = this._document,
    rv;
    if (!doc) return NO;
    rv = doc.execCommand('selectall', false, null);
    if (rv) {
      this.querySelection();
    }
    return rv;
  },

  _findAncestor: function(o, tag) {
    for (tag = tag.toLowerCase(); o = o.parentNode;)
    if (o.tagName && o.tagName.toLowerCase() === tag) {
      return o;
    }
    return null;
  },

  /**
    Adding an observer that checks if the current selection is an image
    or within a hyperlink.
  */
  selectionDidChange: function() {

    //SC.Logger.warn('selectionDidChange');

    var node, range, currentImage = null,
    currentHyperlink = null,
    currentText = '',
    selection = this.get('selection');
    if (SC.none(selection)) {
      this.set('selectedImage', currentImage);
      this.set('selectedHyperlink', currentHyperlink);
      this.set('selectedText', currentText);
      return;
    }
    range = this.get('selectionRange');
    if (range) {
      /*
    
      The quest for the selected hyperlink is a nasty one, all based on whether or not you just created the link, because
      it manipulates the selection range in different ways depending on what was selected.
    
      If you only selected an image, the IMG is the node unless it is wrapped in an A, in which case the A is the node and you have
      to look for its child to get the image.
    
      If you selected a range of text, then several different things are possible
      * if you did not just create a link, then you are in a text node and the link is
      ** the range's common ancestor
      ** or an ancestor of it
    
      * if you DID just create a link, the range may be
      ** the start/end container (this is what it usually is on Chrome/Webkit)
      ** the one and only object between the start and end nodes - (beginning and middle of a line) this was REALLY tricky
      *** it happens to be the next node of the start (which is the previous text block or node)
      *** and an ancestor of the end (which is itself the actual content inside the link)
      *** but ONLY if those two are the same.  otherwise, it'll likely be one of the above cases
      ** the previous child to a <BR> tag if the BR tag is at the end of the selection
    
      * TODO [JS] still to test/fix:
      ** fix link colors (handle with fixing the rest of the firefox color problems)

      BTW if a link failure happened (create link when you shouldn't have, as in there's no text selected or the browser thought there wasn't)
      that is a MAJOR KISS YOUR ASS GOODBYE BUG - the content editable ceases to react properly, and selections are just hosed from that point on.

      * TODO [JS] fix image border when image is inside link
      when an image is inside a link, the border needs to be set to 0.  
      HOWEVER, when the border is set to 0, you can't change it to 0 (SC doesn't detect a change)
      Workaround set the border to 1, then to 0, and it goes away.

      */
      if (SC.browser.msie) {
        // [JS] I'm concerned that this doesn't do "the right thing", but we're not focusing on IE in great detail yet.
        if (range.length === 1) node = range.item();
        if (range.parentElement) node = range.parentElement();
        currentHyperlink = this._findAncestor(node, 'A');

      } else {
        // TODO [JS]: remove all logging statements when i'm finally sure it is all working right
        /*
        SC.Logger.log(range.startContainer);
        SC.Logger.log(range.startOffset);
        SC.Logger.log(range.endContainer);
        SC.Logger.log(range.endOffset);

        SC.Logger.log(range.startContainer.childNodes[range.startOffset]);
        SC.Logger.log(range.endContainer.childNodes[range.endOffset]);
        */
        node = range.startContainer.childNodes[range.startOffset];
        if (!node && (range.startContainer === range.endContainer)) {
          node = range.startContainer;
        }
        // this situation happens when in the beginning and middle of a line
        // startContainer is modified to being the text node BEFORE the link
        // endContainer is the deepest textnode at the end of the selection, so you need to climb up it to find the 'A' 
        if (!node && (range.startContainer.nextSibling === this._findAncestor(range.endContainer, 'A'))) {
          node = range.startContainer.nextSibling;
        }
        // this situation happens when at the END of a line, in front of the BR tag
        // endContainer is the BODY, endContainer's offset child is the BR tag, the previous sibling from that is your 'A'
        // also works for end of the document, where there's an implicit BR created automatically for you
        // fortunately, this works even if the selected range was styled, because the a tag went around the styles
        if (!node && (range.endContainer.childNodes[range.endOffset] && range.endContainer.childNodes[range.endOffset].previousSibling && range.endContainer.childNodes[range.endOffset].previousSibling.tagName === 'A')) {
          node = range.endContainer.childNodes[range.endOffset].previousSibling;
        }
      }

      if (node) {
        //SC.Logger.log("node " + node);
        currentImage = node.nodeName === 'IMG' ? node: null;
        currentHyperlink = node.nodeName === 'A' ? node : this._findAncestor(node, 'A');
      
        // immediately after a selection & link of an IMG, the A tag becomes the node so we have to dig to find the IMG
        if (currentHyperlink && currentHyperlink.childNodes.length === 1) {
          currentImage = currentHyperlink.firstChild.nodeName === 'IMG' ? currentHyperlink.firstChild : null;
        }
      } else {
        //SC.Logger.log("commonAncestor " + range.commonAncestorContainer);
        currentHyperlink = range.commonAncestorContainer.nodeName === 'A' ? range.commonAncestorContainer : this._findAncestor(range.commonAncestorContainer, 'A');
      }

      try {
        currentText = selection.toString();
      } catch (e) {
        SC.Logger.dir(e);
      }
    
      //SC.Logger.log(currentImage);
      //SC.Logger.log(currentHyperlink);
      //SC.Logger.log(currentText);
    }
    this.set('selectedImage', currentImage);
    this.set('selectedHyperlink', currentHyperlink);
    this.set('selectedText', currentText);
  }.observes('selection'),

  isEditingDidChange: function() {
    if (this.get('autoCommit')) {
      this.commitEditing();
    }
  }.observes('isEditing'),

  /** @private */
  _updateAttachedViewLayout: function() {
    var width = this.get('offsetWidth');
    var height = this.get('offsetHeight');

    var view = this.get('attachedView');
    var layout = view.get('layout');
    layout = SC.merge(layout, {
      width: width,
      height: height
    });
    view.adjust(layout);
  },

  /** @private */
  _updateLayout: function() {
    var doc = this._document;
    if (!doc) return;

    var width, height;
    if (SC.browser.msie) {
      width = doc.body.scrollWidth;
      height = doc.body.scrollHeight;
    } else {
      width = doc.body.offsetWidth;
      height = doc.body.offsetHeight;
    }

    // make sure height/width doesn't shrink beyond the initial value when the
    // ContentEditableView is first created
    if (height < this._minHeight) height = this._minHeight;
    if (width < this._minWidth) width = this._minWidth;

    this.set('offsetWidth', width);
    this.set('offsetHeight', height);

    if (this.get('attachedView')) {
      this._updateAttachedViewLayout();
    }

    if (!this.get('hasFixedDimensions')) {
      var layout = this.get('layout');
      layout = SC.merge(layout, {
        width: width,
        height: height
      });

      this.propertyWillChange('layout');
      this.adjust(layout);
      this.propertyDidChange('layout');
    }
  },

  /** @private */
  _getFrame: function() {
    var frame;
    if (SC.browser.msie) {
      frame = document.frames(this.get('frameName'));
    } else {
      frame = this.$('iframe').firstObject();
    }

    if (!SC.none(frame)) return frame;
    return null;
  },

  /** @private */
  _getDocument: function() {
    var frame = this._getFrame();
    if (SC.none(frame)) return null;

    var editor;
    if (SC.browser.msie) {
      editor = frame.document;
    } else {
      editor = frame.contentDocument;
    }

    if (SC.none(editor)) return null;
    return editor;
  },

  /** @private */
  _getSelection: function() {
    var frame = this._getFrame();
    if (SC.none(frame)) return null;

    var selection;
    if (SC.browser.msie) {
      selection = this._getDocument().selection;
    } else if(frame.contentWindow){
      selection = frame.contentWindow.getSelection();
    }
    return selection;
  },

  _encodeValues: function(html) {
    var hrefs = html.match(/href=".*?"/gi);
    if (hrefs) {
      var href, decodedHref;

      for (var i = 0,
      j = hrefs.length; i < j; i++) {
        href = decodedHref = hrefs[i];

        html = html.replace(/\%3C/gi, '<');
        html = html.replace(/\%3E/gi, '>');
        html = html.replace(/\%20/g, ' ');
        html = html.replace(/\&amp;/gi, '&');
        html = html.replace(/\%27/g, "'");

        html = html.replace(href, decodedHref);
      }
    }
    return html;
  },

  _getSelectedElement: function() {
    var sel = this.get('selection'),
    range = this.get('selectionRange'),
    elm;
    var doc = this._document;

    if (range) {
      if (SC.browser.msie) {
        elm = range.item ? range.item(0) : range.parentElement();
      } else {
        if (sel.anchorNode && (sel.anchorNode.nodeType === 3)) {
          if (sel.anchorNode.parentNode) {
            //next check parentNode
            elm = sel.anchorNode.parentNode;
          }
          if (sel.anchorNode.nextSibling !== sel.focusNode.nextSibling) {
            elm = sel.anchorNode.nextSibling;
          }
        }

        if (!elm) {
          elm = range.commonAncestorContainer;

          if (!range.collapsed) {
            if (range.startContainer === range.endContainer) {
              if (range.startOffset - range.endOffset < 2) {
                if (range.startContainer.hasChildNodes()) {
                  elm = range.startContainer.childNodes[range.startOffset];
                }
              }
            }
          }
        }
      }
    }
  return elm;
  },

  _resetColorCache: function() {
    this._last_font_color_cache = null;
    this._last_background_color_cache = null;
    this.set('selectionSaved', NO);
  },

  saveSelection: function() {
    this.set('selectionSaved', YES);

    if (SC.browser.msie) {
      var win = this._getFrame().window;
      var doc = win.document;
      var sel = win.getSelection ? win.getSelection() : doc.selection;
      var range;

      if (sel) {
        if (sel.createRange) {
          range = sel.createRange();
        } else if (sel.getRangeAt) {
          range = sel.getRangeAt(0);
        } else if (sel.anchorNode && sel.focusNode && doc.createRange) {
          // Older WebKit browsers
          range = doc.createRange();
          range.setStart(sel.anchorNode, sel.anchorOffset);
          range.setEnd(sel.focusNode, sel.focusOffset);

          // Handle the case when the selection was selected backwards (from the end to the start in the
          // document)
          if (range.collapsed !== sel.isCollapsed) {
            range.setStart(sel.focusNode, sel.focusOffset);
            range.setEnd(sel.anchorNode, sel.anchorOffset);
          }
        }
      }
      this._range = range;
    }
  },

  restoreSelection: function() {
    this.set('selectionSaved', NO);

    if (SC.browser.msie) {
      var win = this._getFrame().window;
      var doc = win.document;
      var sel = win.getSelection ? win.getSelection() : doc.selection;
      var range = this._range;

      if (sel && range) {
        if (range.select) {
          range.select();
        } else if (sel.removeAllRanges && sel.addRange) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  },

  convertBgrToHex: function(value) {
    value = ((value & 0x0000ff) << 16) | (value & 0x00ff00) | ((value & 0xff0000) >>> 16);
    value = value.toString(16);
    return "#000000".slice(0, 7 - value.length) + value;
  }

});

/* >>>>>>>>>> BEGIN source/views/disclosed.js */
// ===========================================================================
// SCUI.DisclosedView
// ===========================================================================
require('core');
/** @class

  This is a view that gives you the ability to collapse a containerView with a 
  slim disclosure titlebar.
  
  @author Josh Holt [JH2]

*/

SCUI.DisclosedView = SC.View.extend({
  /** @scope SCUI.DisclosedView.prototype */ 
  
  // ..........................................................
  //  KEY PROPERTIES
  // 
  
  classNames: ['scui-disclosed-view'],
  
  displayProperties: ['isOpen', 'statusIconName'],
  
  /* This is the view for the when we aren't collapsed. */
  contentView: null,
  
  /* The text displayed in the titlebar */
  title: '',
  
  /* The Description under the title */
  description: '',
  
  /* The Extra Icon that will sit beside the disclosure view */
  iconCSSName: '',
  
  /* The Extra Icon that will sit beside the disclosure view */
  statusIconName: '',
  
  // private version
  _contentView: null,
  
  /* This is the view for the when we are collapsed. */
  _collapsedView: SC.View,
  
  isOpen: YES,
  
  /* This is the default view for the titlebar */
  titleBar: SC.DisclosureView,
  
  /* The container to hold the content to be collapsed */
  containerView: SC.ContainerView,
  
  /* The default collapsed height (the titlebar will be set to the same height) */
  collapsedHeight: 44,
  
  /* The default expanded height */
  expandedHeight: 300,
  
  /* 
    The mode of operation for this view 
    You may specify one of the following modes:
    -- SCUI.DISCOLSED_STAND_ALONE * (Default)
    -- SCUI.DISCLOSED_LIST_DEPENDENT
  */
  mode: SCUI.DISCLOSED_STAND_ALONE,
  
  // ..........................................................
  // Methods
  // 
  
  init: function(){
    arguments.callee.base.apply(this,arguments);
    // this._setupView();
  },
  
  createChildViews: function(){
    var views=[], view;
    var contentView = this.get('contentView');
    var collapsibleContainerView;
    var that = this;
    
    view = this._titleBar = this.createChildView(this.titleBar.extend({
      layout: {top:0, left:5, right:5, height: that.get('collapsedHeight')},
      titleBinding: SC.binding('.title',this),
      descriptionBinding: SC.binding('.description',this),
      iconCSSNameBinding: SC.binding('.iconCSSName',this),
      statusIconNameBinding: SC.binding('.statusIconName',this),
      value: this.get('isOpen'),
      displayProperties: 'statusIconName'.w(),
      render: function(context, firstTime){
          context = context.begin('div').addClass('disclosure-inner');
          context = context.begin('div').addClass('disclosure-label');
          context = context.begin('img').attr({ src: SC.BLANK_IMAGE_URL, alt: "" }).addClass('button').end();
          context = context.begin('img').attr({ src: SC.BLANK_IMAGE_URL, alt: "" }).addClass('icon').addClass(this.iconCSSName).end();
          context = context.begin('img').attr({src: SC.BLANK_IMAGE_URL, alt: ""}).addClass('status').addClass(this.statusIconName).end();
          context = context.begin('span').addClass('title').push(this.get('displayTitle')).end();
          context.attr('title', this.description);
          context.attr('alt', this.description);
          context = context.end();
          context = context.end();
      },
      
      mouseDown: function(evt){
        if (evt.target.className !== 'button') return NO;
        else return YES;
      },
      
      _valueObserver: function() {
        if (this.owner && this.owner.toggle) this.owner.toggle(this.get('value'));
      }.observes('value')
      
      /*
        [JH2]
        Leaving this here in the event that we want to 
        auto close a disabled step.
      */
      
      // _statusObserver: function() {
      //   if (this.get('statusIconName') === 'never') {
      //     this.set('value',NO);
      //   }
      // }.observes('statusIconName')
      
    }),{rootElementPath: [0]});
    views.push(view);
    
    // setup the containerview for the contentView
    contentView = this.createChildView(contentView, {
      classNames: 'processing-step-settings'.w(), 
      layout: {top: that.get('collapsedHeight')-5, left: 5, right: 5},
      render: function(context, firstTime){
        arguments.callee.base.apply(this,arguments);
        if (firstTime) {
          context = context.begin('div').addClass('bottom-left-edge').push('').end();
          context = context.begin('div').addClass('bottom-right-edge').push('').end();
        }
      }
    });
    views.push(contentView);
    
    this.set('childViews',views);
    return this;
  },
  
  render: function(context, firstTime){
    this._setupView();
    arguments.callee.base.apply(this,arguments);
  },
  
  // ..........................................................
  // Actions ( Used when this view is in standalone mode )
  // 
  
  /*
    This method toggles between expanded and collapsed and is fired
    by an observer inside the extended disclosure view.
    
  */
  toggle: function(toggleValue){
    if (!toggleValue){
      this.set('isOpen',NO);
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) {
        this._updateHeight(YES);
      } else if (this.owner && this.owner.collapse) {
        this.owner.collapse();
      } 
    }else{
      this.set('isOpen',YES);
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) { 
        this._updateHeight();
      } else if (this.owner && this.owner.expand){
        this.owner.expand();
      }
    }
  },
  
  updateHeight: function(immediately, forceDefault) {
    if (immediately) this._updateHeight(forceDefault);
    else this.invokeLast(this._updateHeight);
    return this;
  },
  
  _updateHeight: function(forceDefault) {
    var height;
    if (!forceDefault) {        
      height = this.get('expandedHeight');
    } else {
      height = this.get('collapsedHeight');
    }
    this.adjust('height', height);
  },
  
  /*
    Setup the contentView that you pass in as a child view of this view.
  */
  _createChildViewIfNeeded: function(view){
    if (SC.typeOf(view) === SC.T_CLASS){
      return this.createChildView(view);
    }
    else{
      return view;
    }
  },
  
  _setupView: function(){
    var isOpen = this.get('isOpen');
    var mode = this.get('mode');
    if (isOpen) {
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) this.updateHeight();
    }else{
      if (this.get('mode') === SCUI.DISCLOSED_STAND_ALONE) this._updateHeight(YES);
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/views/loading_spinner.js */
// ========================================================================
// SCUI.LoadingSpinnerView
// ========================================================================

/**

  Implements a PNG based animated loading spinner.
  The animation is simulated, offering the benefit of using a PNG sprite for
  the actual image so that more than 256 colors and transparency may be used.

  @extends SC.View
  @author Mike Ball

*/

SCUI.LoadingSpinnerView = SC.View.extend({
  
  //SCUI includes the following themes by default: darkTrans, lightTrans, darkSolidAqua, darkSolidWhite, lightSolidBlack, lightSolidGreen.
  //You can add your own themes by creating a CSS class with the name of the theme and specifying a background-image with the sprite
  //containing all the animation frames.
  theme: 'lightTrans',
  
  //Number of frames in the PNG sprite
  totalFrames: 28,
  
  //+1 for every append call, -1 for every remove call
  callCount: 0,
  
  //determines if the view is playing
  isPlaying: false,
  
  //if we decided that its taking too long we should do something
  stopIfTakingTooLong: false,
  
  //pass a target and action to be calld if taking too long
  stopIfSlowTarget: null,
  
  stopIfSlowAction: null,
  
  render: function(context, firstTime){
    var theme = this.get('theme') || 'lightTrans';
    
    if(firstTime){
      var classNames = ['loadingSpinner', theme];
      context.begin('div').addClass(classNames).addStyle({width: 18, height: 18, position: 'absolute'}).end();
    }
  },
  
  
  animate: function(){
    var currentFrame = this._currentFrame || 0;
    
    var offsetY= 0-18*currentFrame;
    this.$('div.loadingSpinner').css('background-position','0px %@px'.fmt(offsetY));
    //schedule next frame if animation is still supposed to play
    if(this.get('isPlaying')){
      this.invokeLater(this.animate, 150);
      if(this.get('stopIfTakingTooLong') && 
          this._startTime && (Date.now() - this._startTime) >= 30000){//if its been more than 30 seconds its taking too long!

        var target = this.get('stopIfSlowTarget'), action = this.get('stopIfSlowAction');
        if(target && target.sendEvent && action) target.sendEvent(action);
        this._startTime = Date.now();
      }
    }
    
    currentFrame+=1;
    if(currentFrame === this.get('totalFrames')) currentFrame = 0;
    this._currentFrame = currentFrame;
  },
  
  
  //starts the animation if callCount >= 0
  callCountDidChange: function(){
    //If spinner is in a page start the animation (if needed)
    var that = this, isPlaying = this.get('isPlaying');
    if (!isPlaying && this.get('callCount') > 0){
      this.invokeOnce(function(){
        that.set('isVisible',true);
        that.set('isPlaying', true);
        that.animate();
        if(this.get('stopIfTakingTooLong')) that._startTime = Date.now();
      });
    
    }
    else if(isPlaying && this.get('callCount') <= 0){
      this.invokeOnce(function(){
        if(that.get('stopIfTakingTooLong')) that._startTime = null;
        that.set('isPlaying', false);
        that.set('isVisible', false);
      });
    }
  }.observes('callCount')
});


/* >>>>>>>>>> BEGIN source/views/multi_select.js */
/*globals SCUI*/

sc_require('views/combo_box');

/*
  @class
  @extends SC.View
  @author Jonathan Lewis
  
  MultiSelectView is a composite view control that provides an interface for
  selecting multiple items from a list.  The control consists of a combo box for
  selecting an item, an 'add' button, and a list view showing the currently selected
  items.  'Remove' and 'Clear' buttons handle item deselection.

*/

SCUI.MultiSelectView = SC.View.extend({

  // PUBLIC PROPERTIES

  classNames: 'scui-multi-select-view',

  /*
    Enumerable pool of items that can be multi-selected.  Becomes the content
    of the combo box.
  */
  objects: null,

  /*
    @optional
    Specifies the property on each item in 'objects' that contains the display name for the item.
  */
  nameKey: null,
  
  /*
    An SC.SelectionSet containing the list of items selected from 'objects'
    via the 'add' button on the view.
  */
  selection: null,

  /*
    @read-only
    Pointer to the combo box view inside this control.
  */
  comboBoxView: null,

  /*
    The currently selected item in the combo box.
  */
  comboBoxSelectedObject: null,
  
  /*
    @read-only
  */
  listContent: function() {
    var sel = this.get('selection');
    var ret = (sel && sel.isEnumerable) ? sel.toArray() : [];
    ret.set('allowsMultipleSelection', YES); // ugly, but SC.ListView looks to its content for this setting.
    return ret;
  }.property('selection').cacheable(),

  /*
    The current selection on the list view.
  */
  listSelection: null,
  
  // PUBLIC METHODS

  clearSelection: function(obj) {
    this.set('selection', SC.SelectionSet.EMPTY);
    this.set('listSelection', SC.SelectionSet.EMPTY);
  },

  createChildViews: function() {
    var childViews = [], view, nameKey = this.get('nameKey');

    view = this.createChildView(SCUI.ComboBoxView, {
      layout: { left: 0, right: 85, top: 0, height: 24 },
      objectsBinding: SC.Binding.from('objects', this).oneWay(),
      selectedObjectBinding: SC.Binding.from('comboBoxSelectedObject', this),
      nameKey: nameKey
    });
    childViews.push(view);
    this.set('comboBoxView', view);

    view = this.createChildView(SC.ButtonView, {
      layout: { right: 0, top: 0, width: 80, height: 24 },
      title: "Add".loc(),
      target: this,
      action: '_addSelectedObject',
      isEnabledBinding: SC.Binding.from('comboBoxSelectedObject', this).bool().oneWay()
    });
    childViews.push(view);

    view = this.createChildView(SC.ScrollView, {
      layout: { left: 0, right: 0, top: 29, bottom: 29 },
      contentView: SC.ListView.extend({
        contentBinding: SC.Binding.from('listContent', this),
        selectionBinding: SC.Binding.from('listSelection', this),
        contentValueKey: nameKey,
        allowDeselectAll: YES,
        allowsMultipleSelection: YES
      })
    });
    childViews.push(view);

    view = this.createChildView(SC.ButtonView, {
      layout: { left: 0, bottom: 0, width: 80, height: 24 },
      title: "Remove".loc(),
      target: this,
      action: '_removeSelectedObjects',
      isEnabled: NO,
      isEnabledBinding: SC.Binding.from('*listSelection.length', this).bool().oneWay()
    });
    childViews.push(view);
    
    view = this.createChildView(SC.ButtonView, {
      layout: { right: 0, bottom: 0, width: 80, height: 24 },
      title: "Clear".loc(),
      target: this,
      action: 'clearSelection',
      isEnabled: NO,
      isEnabledBinding: SC.Binding.from('*listContent.length', this).bool().oneWay()
    });
    childViews.push(view);

    this.set('childViews', childViews);
  },

  // PRIVATE METHODS
  
  _addSelectedObject: function() {
    var sel, temp;
    var obj = this.get('comboBoxSelectedObject');
    
    if (obj) {
      sel = this.get('selection');

      if (!sel) {
        sel = SC.SelectionSet.create();
        sel.addObject(obj);
        this.set('selection', sel);
      }
      else if (sel.get('isFrozen')) { // SC.SelectionSet.EMPTY, for example
        temp = sel;
        sel = SC.SelectionSet.create();
        sel.beginPropertyChanges();
        sel.addObjects(temp);
        sel.addObject(obj);
        sel.endPropertyChanges();
        this.set('selection', sel);
      }
      else {
        sel.addObject(obj);
        this.notifyPropertyChange('listContent');
      }
    }
  },

  _removeSelectedObjects: function() {
    var listSelection = this.get('listSelection');
    var sel = this.get('selection');
    
    if (listSelection && sel) {
      sel.removeObjects(listSelection);
      this.notifyPropertyChange('listContent');
      this.set('listSelection', SC.SelectionSet.EMPTY);
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/views/select_field.js */
/*globals SCUI */

/** @class

  Adds multi select capability to SC.SelectFieldView

  @extends SC.SelectFieldView
*/


SCUI.SelectFieldView = SC.SelectFieldView.extend({
  
  multiple: NO,
  
  render: function(context, firstTime) {
    if (this.get('cpDidChange')) 
    {
      this.set('cpDidChange', NO);
      
      var nameKey = this.get('nameKey') ;
      var valueKey = this.get('valueKey') ;
      var objects = this.get('objects') ;
      var fieldValue = this.get('value') ;
      var el, selectElement;
      var multiple = this.get('multiple');
      var shouldLocalize = this.get('localize');

      if (multiple) 
      {
        context.attr('multiple', NO);
      }
      
      if (!valueKey && fieldValue) 
      {
        fieldValue = (fieldValue.get && fieldValue.get('primaryKey') && fieldValue.get(fieldValue.get('primaryKey'))) ? fieldValue.get(fieldValue.get('primaryKey')) : SC.guidFor(fieldValue) ;
      }
      if ((fieldValue === null) || (fieldValue === '')) fieldValue = '***' ;

      if (objects) 
      {
        objects = this.sortObjects(objects);
      
        if(!firstTime) 
        {
          selectElement=this.$input()[0];
          selectElement.innerHTML='';
        }
        var emptyName = this.get('emptyName') ;
        if (emptyName) 
        {
          if (shouldLocalize) emptyName = emptyName.loc() ;
          if (firstTime)
          {
            context.push('<option value="***">'+emptyName+'</option><option disabled="disabled"></option>') ;
          } 
          else
          {
            el = document.createElement('option');
            el.value = "***";
            el.innerHTML = emptyName;
            selectElement.appendChild(el);
            el=document.createElement('option');
            el.disabled = "disabled";
            selectElement.appendChild(el);
          }
        }
        objects.forEach(function(object) {
        if (object) 
        {
          var name = nameKey ? (object.get ? object.get(nameKey) : object[nameKey]) : object.toString();
          if (shouldLocalize) 
          {
            name = name.loc();
          }
          var value = (valueKey) ? (object.get ? object.get(valueKey) : object[valueKey]) : object ;
          if (value) 
          {
            value = SC.guidFor(value) ? SC.guidFor(value) : value.toString() ;
          } 

          var disable = (this.validateMenuItem && this.validateMenuItem(value, name)) ? '' : 'disabled="disabled" ' ;
          if (firstTime)
          {
            context.push('<option '+disable+'value="'+value+'">'+name+'</option>') ;
          } else
          {
            el = document.createElement('option');
            el.value = value;
            el.innerHTML = name;
            if (disable.length > 0) el.disable="disabled";
            selectElement.appendChild(el);
          }
        } else 
        {
          if (firstTime) 
          {
            context.push('<option disabled="disabled"></option>') ;
          } 
          else
          {
            el = document.createElement('option');
            el.disabled = "disabled";
            selectElement.appendChild(el);
          }
        }
      }, this);
      
      this.setFieldValue(fieldValue);
      
      } 
      else 
      {
        this.set('value',null);
        
      }
    }
  },
  
  getFieldValue: function() {
    var value = this.$input().val();
    var valueKey = this.get('valueKey');
    var objects = this.get('objects');
    var found, object;
    var multiple = this.get('multiple');

    if (multiple) 
    {
      found = [];
    }

    if (value === '***') 
    {
      value = null;
      
    } 
    else 
    if (value && objects) 
    {
      var loc = (SC.typeOf(objects.length) === SC.T_FUNCTION) ? objects.length() : objects.length;

      if (!multiple) 
      { 
        found = null;
      }

      while (--loc >= 0) 
      {
        object = objects.objectAt? objects.objectAt(loc) : objects[loc] ;

        if (valueKey) object = (object.get) ? object.get(valueKey) : object[valueKey];
        var ov;
        if (object && object.get && object.get('primaryKey') && object.get(object.get('primaryKey'))) 
        {
          ov = SC.guidFor(object.get(object.get('primaryKey')));
        } 
        else 
        if (object && SC.guidFor(object)) 
        {
            ov = SC.guidFor(object);
        } 
        else 
        if(object)
        {
            ov = object.toString();
        } 
        else 
        {
          ov = null;
        }
        
        if (multiple) 
        {
          for (var i = 0, j = value.length; i < j; i++) 
          {
            if (value[i] === ov) 
            {
              found.push(object);
            }
          }
        } else 
        {
          if (value === ov) 
          {
            found = object;
          }
        } 
      }
    }
    
    return (valueKey || found) ? found : value;
  },

  setFieldValue: function(newValue) {
    if (this.get('multiple')) 
    {
      if (SC.none(newValue)) { newValue = '' ; }
      else 
      {
        if (SC.typeOf(newValue) === 'string') 
        {
          newValue = newValue.split("::");
        }
          
        var currValue;
        var selected = [];
          
        for (var i = 0, j = newValue.length; i < j; i++) {
          currValue = newValue[i];

          if(currValue && currValue.get && currValue.get('primaryKey') && currValue.get(currValue.get('primaryKey')))
          {
            currValue = SC.guidFor(currValue.get(currValue.get('primaryKey')));
            selected.push(currValue);
          }
          else 
          if (currValue && SC.guidFor(currValue) && currValue !== '***') 
          {
            currValue = SC.guidFor(currValue);
            selected.push(currValue);
          } 
          else 
          if (currValue) 
          {
            currValue = currValue.toString();
            selected.push(currValue);
          } 
          else 
          {
            currValue = null;
          }
        }
        this.$input().val(selected);
        return this ;
      }
    } else 
    {
      if (SC.none(newValue)) { newValue = '' ; }
      else 
      {
        if (newValue && newValue.get && newValue.get('primaryKey') && newValue.get(newValue.get('primaryKey'))) 
        {
          newValue = SC.guidFor(newValue.get(newValue.get('primaryKey')));
        } 
        else 
        if (newValue && SC.guidFor(newValue) && newValue !== '***') 
        {
          newValue = SC.guidFor(newValue);
        } 
        else 
        if (newValue)
        {
          newValue = newValue.toString();
        } 
        else 
        {
          newValue = null;
        }
      }
      this.$input().val(newValue);
      return this ;
    }
  }
});


/* >>>>>>>>>> BEGIN source/views/select_field_tab.js */
// ==========================================================================
// Project:   SCUI.SelectFieldTab 
// ==========================================================================
/*globals SCUI */

/** @class

  this view acts just like tab view but instead of a segmented button
  uses a select field view to switch views....

  
  @extends SC.View
*/

SCUI.SelectFieldTab = SC.View.extend(
/** @scope SCUI.SelectFieldTab.prototype */ {
  
  classNames: ['scui-select-field-tab-view'],
  
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  // 

  nowShowing: null,

  items: [],

  isEnabled: YES,

  itemTitleKey: null,
  itemValueKey: null,
  itemIsEnabledKey: null,
  itemIconKey: null,
  itemWidthKey: null,
  itemToolTipKey: null,

  // ..........................................................
  // FORWARDING PROPERTIES
  // 

  // forward important changes on to child views
  _tab_nowShowingDidChange: function() {
    var v = this.get('nowShowing');
    this.get('containerView').set('nowShowing',v);
    this.get('selectFieldView').set('value',v);
    return this ;
  }.observes('nowShowing'),

  _tab_itemsDidChange: function() {
    this.get('selectFieldView').set('items', this.get('items'));
    return this ;    
  }.observes('items'),

  _isEnabledDidChange: function() {
    var isEnabled = this.get('isEnabled');

    if (this.containerView && this.containerView.set) {
      this.containerView.set('isEnabled', isEnabled);
    }
    
    if (this.selectFieldView && this.selectFieldView.set) {
      this.selectFieldView.set('isEnabled', isEnabled);
    }
  }.observes('isEnabled'),

  /** @private
    Restore userDefault key if set.
  */
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._tab_nowShowingDidChange()._tab_itemsDidChange();

    // propagate classNames to the selectFieldView (e.g., 'dark')
    var classNames = this.get('classNames'), sfClassNames = this.selectFieldView.get('classNames');
    classNames = classNames.without('sc-view').without('scui-select-field-tab-view');
    sfClassNames = sfClassNames.uniq();
    sfClassNames.pushObjects(classNames);
    this.selectFieldView.set('classNames', sfClassNames);
  },

  createChildViews: function() {
    var childViews = [], view, ContainerView ;
    var isEnabled = this.get('isEnabled');

    ContainerView = this.containerView.extend({
      layout: { top:24, left:0, right:0, bottom: 0 }
    });

    view = this.containerView = this.createChildView(ContainerView, { isEnabled: isEnabled }) ;
    childViews.push(view);

    view = this.selectFieldView = this.createChildView(this.selectFieldView, { isEnabled: isEnabled }) ;
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

  /**
    The selectFieldView managed by this tab view.  Note that this TabView uses
    a custom segmented view.  You can access this view but you cannot change
    it.
    
    --Updated this to a selectButton view to remove the select element. [jcd]
  */
  selectFieldView: SC.SelectButtonView.extend({
    layout: { left: 4, right: 0, height: 24 },
    //litte items => objects alias so I can use the same properties as a tab view...
    items: function(key, value){
      if(value === undefined){
        return this.get('objects');
      }
      else{
        return this.set('objects', value);
      }
    }.property('objects').cacheable(),
    
    itemTitleKey: function(key, value){
      if(value === undefined){
        return this.get('nameKey');
      }
      else{
        return this.set('nameKey', value);
      }
    }.property('nameKey').cacheable(),

    itemValueKey: function(key, value){
      if(value === undefined){
        return this.get('valueKey');
      }
      else{
        return this.set('valueKey', value);
      }
    }.property('valueKey').cacheable(),

    /** @private
      When the value changes, update the parentView's value as well.
    */
    _scui_select_field_valueDidChange: function() {
      var pv = this.get('parentView');
      if (pv) pv.set('nowShowing', this.get('value'));
      this.set('layerNeedsUpdate', YES) ;
      this.invokeOnce(this.updateLayerIfNeeded) ;
    }.observes('value'),

    init: function() {
      // before we setup the rest of the view, copy key config properties 
      // from the owner view...
      var pv = this.get('parentView');
      if (pv) {
        SC._TAB_ITEM_KEYS.forEach(function(k) { this[SCUI._SELECT_TAB_TRANSLATOR[k]] = pv.get(k); }, this);
      }
      return arguments.callee.base.apply(this,arguments);
    }
  })
});

SCUI._SELECT_TAB_TRANSLATOR = {itemTitleKey: 'nameKey', itemValueKey: 'valueKey', items: 'objects'};


/* >>>>>>>>>> BEGIN source/views/stepper.js */
// ==========================================================================
// SCUI.StepperView
// ==========================================================================

/** @class

  This view renders a stepper control button for incrementing/decrementing 
  values in a bound text field.
  
  To use bind the value of this view to the value of text field or label.

  @extends SC.View
  @author Brandon Blatnick
*/

SCUI.StepperView = SC.View.extend(
  /** @scope SC.CheckboxView.prototype */ {

  layout: { top: 0, left: 0, width: 19, height: 27 },
  
  /* Value to be binded to apprioprate label or text field */
  value: 0,
  
  /* amount to increment or decrement upon clicking stepper */
  increment: 1,
  
  /* max value allowed, infinity if not set */
  max: null,
  
  /* min value allowed, neg infinity if not set */
  min: null,
  
  /* if value should wraparound to the min if max is reached (and vise versa) */
  valueWraps: NO,

  createChildViews: function() {
    var childViews = [];
    var value = this.get('value');
    var increment = this.get('increment');
    var that = this;

    var view = this.createChildView(SC.ButtonView.design({
      classNames: ['scui-stepper-view-top'],
      layout: { top: 0, left: 0, width: 19, height: 13 },
      mouseUp: function() {
        arguments.callee.base.apply(this,arguments);
        var value = that.get('value');
        value = value - 0; // make sure its a number
        var max = that.get('max');
        value = value + increment;
        var wraps = that.get('valueWraps');
        
        if (max === null || value <= max) that.set('value', value); // should == to check for null and undefined
        else if (wraps) {
          var min = that.get('min');
          if (min !== null) { // should be != to check for null and undefined
            value = value - max - increment;
            value = value + min;
            that.set('value', value);
          }
        }
      }
    }));
    childViews.push(view);

    view = this.createChildView(SC.ButtonView.design({
      classNames: ['scui-stepper-view-bottom'],
      layout: { top: 14, left: 0, width: 19, height: 13 },
      mouseUp: function() {
        arguments.callee.base.apply(this,arguments);
        var value = that.get('value');
        value = value - 0; // make sure its a number
        var min = that.get('min');
        value = value - increment;
        var wraps = that.get('valueWraps');
        
        if (min === null || value >= min) that.set('value', value); // should be == to check for null and undefined
        else if (wraps) {
          var max = that.get('max');
          if (max !== null) { // should be != to check for null and undefined
            value = min - value - increment;
            value = max - value;
            that.set('value', value);
          }
        }
      }
    }));
    childViews.push(view);

    this.set('childViews', childViews);
  }
});


/* >>>>>>>>>> BEGIN source/views/time_selector.js */
//============================================================================
// SCUI.TimeSelectorFieldView
//============================================================================
/*globals SCUI*/

/**

  TODO
  @extends SC.View
  @author Jason Dooley
  @author Jonathan Lewis
  @version GA
  @since GA

  Example:

  timeSelector: SCUI.TimeSelectorFieldView.design({
   layout: { left: 0, top: 0, height: 24 },
   valueBinding: 'App.yourController.timeField'
  })

  {@value expects SC.DateTime}


*/

SCUI.TimeSelectorFieldView = SC.View.extend({
   
  // PUBLIC PROPERTIES

  classNames: ['scui-timeselector'],

  // this can be styled, but for the time being, need a
  // min width and height to fit everything in conveniently
  layout: { minHeight: 24, minWidth: 100 },
  
  /*
    The SC.DateTime instance being manipulated by this view.  If not set to anything,
    the view will be empty.  If someone tries to enter a time value in the view when
    'value' is null, the view will create an SC.DateTime instance and set it here.  Otherwise
    it will just modify the value already set here.
  */
  value: null,

  /*
    Hour component of 'value', in 12-hour format.  Non-numeric data will be ignored.
  */
  hour: function(key, value) {
    var time = this.get('value');
    var newHour, lastHour, lastMinute, meridian;

    if (value !== undefined) {
      if (!time) { // only create from scratch if we have to, to avoid losing any time zone data already stored in an existing value
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      lastHour = time.toFormattedString('%i') * 1; // in 12 hour format, as if someone typed it in
      lastMinute = time.get('minute') * 1;
      meridian = time.toFormattedString('%p');

      newHour = (isNaN(value * 1) || value === '') ? lastHour : Math.abs(value * 1); // revert to last hour if invalid input

      if (newHour > 12) {
        newHour = newHour % 10; // just take the last digit
      }
      
      if (meridian === 'PM') {
        if (newHour < 12) { // convert to 24-hour time
          newHour = newHour + 12;
        }
      }
      else { // AM
        if (newHour === 12) { // special case for entering 12AM
          newHour = 0;
        }
      }

      // wrap this set call to make sure that every change causes a notification
      // for proper formatting, even if two equivalent time values are entered.
      this.propertyWillChange('value');
      this.set('value', time.adjust({ hour: newHour, minute: lastMinute })); // have to preserve minute as well -- setting hour resets minute
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%i') : null; // 12-hour format
    }
    
    return value;
  }.property('value').cacheable(),

  /*
    Minute component of 'value'.  Non-numeric data will be ignored.
  */
  minute: function(key, value) {
    var time = this.get('value');
    var lastMinute, newMinute;
    
    if (value !== undefined) {
      if (!time) { // only create from scratch if we have to, to avoid losing any time zone data already stored in an existing value
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      lastMinute = time.get('minute') * 1;
      newMinute = (isNaN(value * 1) || value === '') ? lastMinute : Math.abs(value * 1); // revert to last minute value if input is invalid

      if (newMinute > 59) {
        newMinute = newMinute % 10; // just take the last digit
      }

      this.propertyWillChange('value');
      this.set('value', time.adjust({ minute: newMinute }));
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%M') : null; // two-digit minute format
    }
    
    return value;
  }.property('value').cacheable(),
  
  /*
    Meridian component of 'value', either 'AM' or 'PM'.  If set to any string containing
    an 'a', it will switch to 'AM', otherwise defaults to 'PM'.
  */
  meridian: function(key, value) {
    var time = this.get('value');
    var hour, minute, newMeridian;

    if (value !== undefined) {
      if (!time) {
        time = SC.DateTime.create();
        time = time.adjust({hour: 12, minute: 0});
      }

      hour = time.toFormattedString('%H') * 1; // in 24-hour format
      minute = time.get('minute') * 1;
      newMeridian = (SC.typeOf(value) === SC.T_STRING) && (value.search(/a/i) >= 0) ? 'AM' : 'PM';

      if (hour < 12 && newMeridian === 'PM') {
        time = time.adjust({ hour: hour + 12, minute: minute });
      }
      else if (hour >= 12 && newMeridian === 'AM') {
        time = time.adjust({ hour: hour - 12, minute: minute });
      }

      this.propertyWillChange('value');
      this.set('value', time);
      this.propertyDidChange('value');
    }
    else {
      value = time ? time.toFormattedString('%p') : null;
    }

    return value;
  }.property('value').cacheable(),
  
  // base hour text field settings
  hourView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-hour'],
    layout: {width: 24,top: 0,bottom: 0,left: 0},
    textAlign: SC.ALIGN_right
  }),
  
  // the colon!
  colonView: SC.LabelView.design({
    classNames: ['scui-timeselector-colon'],
    layout: { width: 5, top: 0, bottom: 0, left: 26},
    textAlign: SC.ALIGN_CENTER,
    value: ':'
  }),
  
  // base minute text field settings
  minuteView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-minute'],
    layout: { width: 24, top: 0, bottom: 0, left: 28},
    textAlign: SC.ALIGN_RIGHT
  }),
  
  // base 'AM' 'PM'
  meridianView: SC.TextFieldView.design({
    classNames: ['scui-timeselector-meridian'],
    layout: { width: 30, top: 0,bottom: 0, left: 58},
    textAlign: SC.ALIGN_CENTER,
    hint: 'PM'
  }),
  
  // PUBLIC METHODS
  
  // setup the entire view
  createChildViews: function () {
    var childViews = [], view;
    var that = this;
    
    // Hour view
    view = this.get('hourView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('hour', this),
        isEnabledBinding: SC.Binding.from('isEnabled',this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('hourView', view);
    
    // Colon Label
    view = this.get('colonView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        isEnabledBinding: SC.Binding.from('isEnabled',this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('colonView', view);
    
    // Minute View
    view = this.get('minuteView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('minute', this),
        isEnabledBinding: SC.Binding.from('isEnabled', this)
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('minuteView', view);
    
    // Meridian View
    view = this.get('meridianView');
    if (SC.kindOf(view, SC.View)) {
      view = this.createChildView(view, {
        valueBinding: SC.Binding.from('meridian', this),
        isEnabledBinding: SC.Binding.from('isEnabled',this),
        mouseDown: function () {
          that._toggleMeridian();
        }
      });
      childViews.push(view);
    }
    else {
      view = null;
    }
    this.set('meridianView', view);
    
    this.set('childViews', childViews);
  },

  // PRIVATE METHODS
  
  // convenience function to toggle meridian on click
  _toggleMeridian: function () {
    if (this.get('meridian') === 'AM') {
      this.set('meridian', 'PM');
    }
    else {
      this.set('meridian', 'AM');
    }
  }

});


/* >>>>>>>>>> BEGIN source/views/upload.js */
// ========================================================================
// SCUI.UploadView
// ========================================================================
/*globals SCUI FormData*/

/** @class

  A simple view that allows the user to upload a file to a specific service.
  
  @extends SC.View
  @author Mohammed Taher
  @author Evin Grano
*/

SCUI.UploadView = SC.View.extend(
/** @scope Scui.Upload.prototype */ {
  
  /**
    Read-only value of the current selected file. In IE, this will include
    the full path whereas with all other browsers, it will only be the name of 
    the file. If no file is selected, this will be set to null.
  */
  value: null,
  
  /**
    URI of service/page the file is being uploaded to
  */
  uploadTarget: null,
  
  /**
    A read-only status of the current upload. Can be one of 3 values,
      1. 'READY'
      2. 'BUSY'
      3. 'DONE'
  */
  status: '',
  
  /**
    The value that will be assigned to the name attribute of the input
  */
  inputName: "Filedata",

  /**
    An instance of an SC.Request object to use as a prototype.  If degradeList says use xhr, this property will be the request object to use, unless it is null.
  */
  requestPrototype: SC.Request,

  /**
    Array containing the upload approaches and the order in which to attempt them.  webkit based browsers will use xhr unless requestPrototype is set to null.
  */
  degradeList: ['xhr', 'iframe'],

  /**
    The server return value from the upload.  Will be set to null as the upload is started.
  */
  serverResponse: null,

  displayProperties: 'uploadTarget'.w(),
  
  /*
    If set to a value, then the view will attempt to use the CSS rule to style 
    the input=file. The CSS rule needs to define a,
      - width (pixels)
      - height (pixels)
      - background image
  */
  cssImageClass: null,

  render: function(context, firstTime) {
    var frameId = this.get('layerId') + 'Frame';
    var uploadTarget = this.get('uploadTarget');
    var label = this.get('label');
    var inputName = this.get('inputName');
    var cssImageClass = this.get('cssImageClass');
    
    if (firstTime) {
      // This hack is needed because the iframe onload event fires twice in IE, when the
      // view is first created and after the upload is done. Since I'm using the onload
      // event to signal when the upload is done, I want to suppress its action the first
      // time around
      this._firstTime = YES;
      
      if (cssImageClass) {
        context.begin('form')
                  .attr('method', 'post')
                  .attr('enctype', 'multipart/form-data')
                  .attr('action', uploadTarget)
                  .attr('target', frameId)
        
                  .begin('label')
                    .setClass(cssImageClass, YES)
                    .styles({ 'display': 'block',
                              'cursor': 'pointer',
                              'overflow': 'hidden'  })
        
                    .begin('input')
                      .attr('type', 'file')
                      .attr('name', inputName)
                      .setClass('hidden-upload-input', YES)
                    .end()
                  .end()
                .end()
        
                .begin('iframe')
                  .attr('frameBorder', 0)
                  .attr('src', '#')
                  .attr('id', frameId)
                  .attr('name', frameId)
                  .styles({ 'width': 0, 'height': 0 })
                .end();
                
      } else {
        
        context .begin('form')
                  .attr('method', 'post')
                  .attr('enctype', 'multipart/form-data')
                  .attr('action', uploadTarget)
                  .attr('target', frameId)
        
                  .begin('input')
                    .attr('type', 'file')
                    .attr('name', inputName)
                  .end()
        
                .end()
        
                .begin('iframe')
                  .attr('frameBorder', 0)
                  .attr('src', '#')
                  .attr('id', frameId)
                  .attr('name', frameId)
                  .styles({ 'width': 0, 'height': 0 })
                .end();
        
      }
      
    } else {
      var f = this._getForm();
      if (f) f.action = uploadTarget;
    }
    arguments.callee.base.apply(this,arguments);
  },
  
  mouseDown: function(evt) {
    if (evt.target.nodeName === 'LABEL') {
      this.$('input')[0].click();
    }
  },
  
  didCreateLayer: function() {
    arguments.callee.base.apply(this,arguments);
    var frame = this.$('iframe');
    var input = this.$('input');
    
    SC.Event.add(frame, 'load', this, this._uploadFetchIFrameContent);
    SC.Event.add(input, 'change', this, this._checkInputValue);
    
    this.set('status', SCUI.READY);
  },
  
  willDestroyLayer: function() {
    var frame = this.$('iframe');
    var input = this.$('input');
    
    SC.Event.remove(frame, 'load', this, this._uploadFetchIFrameContent);
    SC.Event.remove(input, 'change', this, this._checkInputValue);
    arguments.callee.base.apply(this,arguments);
  },
  
  _startUploadXHR: function(f) {
    SC.Logger.log("using XHR");
    var rp, input, file, fd, xhr;
    rp = this.get('requestPrototype');
    input = f[this.get('inputName')];
    file = input.files[0];
    fd = new FormData();
    fd.append(this.get('inputName'), file);
    xhr = rp.copy();
    xhr.set('isJSON', false);
    xhr.set('isXML', false);
    xhr.set('address', this.get('uploadTarget'));
    xhr.notify(this, this._uploadCheck, null).send(fd);
  },

  _startUploadIframe: function (f) {
    SC.Logger.log("Using iframe target");
    f.submit();
  },

  /**
    Starts the file upload (by submitting the form) and alters the status from READY to BUSY.
  */
  startUpload: function() {
    var i, listLen, handler, f;
    this.set('serverResponse', null);
    
    f = this._getForm();
    if (!f) {
      return;
    }
    for(i=0, listLen = this.degradeList.length; i<listLen; i++){
      switch(this.degradeList[i]){
        case 'xhr':
          if ((SC.browser.safari || SC.browser.chrome) && (this.get('requestPrototype'))) {
            handler = this._startUploadXHR.bind(this);
          }
        break;
        case 'iframe':
          handler = this._startUploadIframe.bind(this);
        break;
      }
      if (handler) {
        break;
      }
    }
    if (!handler) {
      SC.Logger.warn("No upload handler found!");
      return;
    }
    handler(f);
    this.set('status', SCUI.BUSY);
  },
  /**
    Clears the file upload by regenerating the HTML. This is guaranateed
    to work across all browsers. Also resets the status to READY.
  */
  clearFileUpload: function() {
    var f = this._getForm();
    this.set('value', null);
    if (f) {
      
      // remove event before calling f.innerHTML = f.innerHTML
      var input = this.$('input');
      SC.Event.remove(input, 'change', this, this._checkInputValue);
        
      f.innerHTML = f.innerHTML;
      this.set('status', SCUI.READY);
      this.set('value', null);
      
      // readd event
      input = this.$('input');
      SC.Event.add(input, 'change', this, this._checkInputValue);
    }
  },
  
  /**
    Returns true if a file has been chosen to be uploaded, otherwise returns
    false.
    
    @returns {Boolean} YES if a file is selected, NO if not
  */
  validateFileSelection: function() {
    var value = this.get('value');
    if (value) {
      return YES;
    }
    return NO;
  },

  _uploadCheck: function(response) {
    this.set('fullServerResponse', response);
    this.set('serverResponse', response.get('body'));
    this._uploadDone();
  },

  _uploadFetchIFrameContent: function() {
    var frame, response, win, doc;

    // get the json plain text from the iframe
    if (SC.browser.msie) {
      var frameId = '%@%@'.fmt(this.get('layerId'), 'Frame');
      frame = document.frames(frameId);
      doc = frame.document;
      if (doc) {
        if (doc.body.childNodes.length > 0) {
          response = frame.document.body.childNodes[0].innerHTML;
        }
      }
    } else {
      frame = this.$('iframe').get(0);
      win = frame.contentWindow;
      if (win) response = win.document.body.childNodes[0].innerHTML;
    }
    this.set('serverResponse', response);
    this._uploadDone();
  },

  /**
    This function is called when the upload is done and the iframe loads. It'll
    change the status from BUSY to DONE.
  */
  _uploadDone: function() {
    if (SC.browser.msie) {
      if (!this._firstTime) {
        SC.RunLoop.begin();
        this.set('status', SCUI.DONE);
        SC.RunLoop.end();
      }
      this._firstTime = NO;
    } else {
      SC.RunLoop.begin();
      this.set('status', SCUI.DONE);
      SC.RunLoop.end();
    }
  },
  
  /**
    This function is called when the value of the input changes (after the user hits the browse
    button and selects a file).
  */
  _checkInputValue: function() {
    SC.RunLoop.begin();
    var input = this._getInput();
    this.set('value', input.value);
    SC.RunLoop.end();
  },
  
  _getForm: function(){
    var forms = this.$('form');
    if (forms && forms.length > 0) return forms.get(0);
    return null;
  },
  
  _getInput: function() {
    var inputs = this.$('input');
    if (inputs && inputs.length > 0) return inputs.get(0);
    return null;
  }

});


