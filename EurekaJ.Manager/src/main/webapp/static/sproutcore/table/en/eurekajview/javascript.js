/* >>>>>>>>>> BEGIN source/mixins/table_delegate.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  A delegate for table resize operations.
*/
SC.TableDelegate = {
  /**
    Walk like a duck.
  */
  isTableDelegate: YES,
  
  /**
    Called just before a table resizes a column to a proposed width.  You
    can use this method to constrain the allowed width.  The default 
    implementation uses the minWidth and maxWidth of the column object.
  */
  tableShouldResizeColumnTo: function(table, column, proposedWidth) {
    var min = column.get('minWidth') || 0,
        max = column.get('maxWidth') || proposedWidth;
    
    proposedWidth = Math.max(min, proposedWidth);
    proposedWidth = Math.min(max, proposedWidth);
    
    return proposedWidth;
  },
  
  tableShouldResizeWidthTo: function(table, proposedWidth) {
    var min = table.get('minWidth') || 0,
        max = table.get('maxWidth') || proposedWidth;
        
    proposedWidth = Math.max(min, proposedWidth);
    proposedWidth = Math.min(max, proposedWidth);
    
    return proposedWidth;
  }
};

/* >>>>>>>>>> BEGIN source/system/table_column.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.SORT_ASCENDING  = 'ascending';
SC.SORT_DESCENDING = 'descending';

/** @class

  An abstract object that manages the state of the columns behind a
  `SC.TableView`.
  
  @extends SC.Object
  @since SproutCore 1.1
*/

SC.TableColumn = SC.Object.extend({
/** @scope SC.TableColumn.prototype */
  
  /**
    The internal name of the column. `SC.TableRowView` objects expect their
    `content` to be an object with keys corresponding to the column's keys.
    
    @property
    @type String
  */
  key: null,
  
  /**
    The display name of the column. Will appear in the table header for this
    column.
    
    @property
    @type String
  */
  title: null,
  
  /**
    Width of the column.
    
    @property
    @type Number
  */
  width: 100,
  
  /**
    How narrow the column will allow itself to be.
    
    @property
    @type Number
  */
  minWidth: 16,
  
  /**
    How wide the column will allow itself to be.
    
    @property
    @type Number
  */
  maxWidth: 700,
  
  escapeHTML: NO,

  formatter: null,

  
  isVisible: YES,
  
  /**
    Whether the column gets wider or narrower based on the size of the
    table. Only one column in a TableView is allowed to be flexible.
    
    @property
    @type Boolean
  */
  isFlexible: NO,
  
  /**
    Whether the column can be drag-reordered.
    
    @property
    @type Boolean
  */
  isReorderable: YES,
  
  /**
    Whether the column can be sorted.
    
    @property
    @type Boolean
  */
  isSortable: YES,

  /**
    Reference to the URL for this column's icon. If `null`, there is no
    icon associated with the column.
    @property
  */
  icon: null,
  
  tableHeader: null,

  /**
    The sort state of this particular column. Can be one of
    SC.SORT_ASCENDING, SC.SORT_DESCENDING, or `null`. For instance, if
    SC.SORT_ASCENDING, means that the table is being sorted on this column
    in the ascending direction. If `null`, means that the table is sorted
    on another column.
    
    @property
  */
  sortState: null,
  
  /**
    The content property of the controlling SC.TableView. This is needed
    because the SC.TableHeader views use this class to find out how to
    render table content (when necessary).
  */
  tableContent: null
  
});

/* >>>>>>>>>> BEGIN source/views/table_header.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/table');

/** @class
  The views that make up the column header cells in a typical `SC.TableView`.
  
  In addition, this view is in charge of rendering the _entire_ table column
  (both header and body) when the table is in the "drag-reorder" state. This
  is the state that occurs when the user clicks and holds on a table header,
  then drags that header horizontally.

  @extends SC.View
  @since SproutCore 1.1
*/
SC.TableHeaderView = SC.View.extend({
  
  classNames: ['sc-table-header'],
  
  displayProperties: ['sortState', 'isInDragMode'],
  
  acceptsFirstResponder: YES,
  
  isInDragMode: NO,
  
  hasHorizontalScroller: NO,
  hasVerticalScroller: NO,
  
  childViews: ['dragModeView'],
  
  
  /**
    The view that is visible when the column is in drag mode.
  */
  dragModeView: SC.ListView.extend({
    isVisible: NO,
    
    layout: { left: 0, right: 0, bottom: 0 },
    
    init: function() {
      arguments.callee.base.apply(this,arguments);

      var tableHeaderView = this.get('parentView');
      
      if (tableHeaderView) {
        tableHeaderView.addObserver('isInDragMode', this,
            '_scthv_dragModeDidChange');
      }
      
    },
    
    _scthv_dragModeDidChange: function() {
      // var isInDragMode = this.get('tableHeaderView').get('isInDragMode');
      // this.set('isVisible', isInDragMode);
    }
  }),

  /**
    The SC.TableColumn object this header cell is bound to.
  */
  column:  null,
  
  render: function(context, firstTime) {
    var column = this.get('column'), icon = column.get('icon'), html;
    var span = context.begin('span');
    if (icon) {
      html = '<img src="%@" class="icon" />'.fmt(icon);
      span.push(html);
    } else {
      span.push(this.get('label'));
    }
    span.end();
  },
    
  // ========================================================
  // = For the column we look after, set up some observers. =
  // ========================================================
  init: function() {
    arguments.callee.base.apply(this,arguments);

    var column = this.get('column');
    column.addObserver('width',     this, '_scthv_layoutDidChange');
    column.addObserver('maxWidth',  this, '_scthv_layoutDidChange');
    column.addObserver('minWidth',  this, '_scthv_layoutDidChange');
    column.addObserver('sortState', this, '_scthv_sortStateDidChange');
    column.addObserver('tableContent', this, '_scthv_tableContentDidChange');
    
    // var tableContent = column.get('tableContent');
    // var columnContent = this._scthv_columnContentFromTableContent(tableContent);
    // this.set('content', columnContent);
  },
  
  /**
    The sortState of the header view's column.
  */
  sortState: function() {
    return this.get('column').get('sortState');
  }.property(),
  
  mouseDown: function(evt) {
    var tableView = this.get('tableView');    
    return tableView ? tableView.mouseDownInTableHeaderView(evt, this) :
     arguments.callee.base.apply(this,arguments);
  },
  
  mouseUp: function(evt) {
    var tableView = this.get('tableView');
    return tableView ? tableView.mouseUpInTableHeaderView(evt, this) :
     arguments.callee.base.apply(this,arguments);
  },
  
  mouseDragged: function(evt) {
    var tableView = this.get('tableView');
    return tableView ? tableView.mouseDraggedInTableHeaderView(evt, this) :
     arguments.callee.base.apply(this,arguments);
  },
  
  _scthv_dragViewForHeader: function() {
    var dragLayer = this.get('layer').cloneNode(true);
    var view = SC.View.create({ layer: dragLayer, parentView: this });
    
    // cleanup weird stuff that might make the drag look out of place
    SC.$(dragLayer).css('backgroundColor', 'transparent')
      .css('border', 'none')
      .css('top', 0).css('left', 0);      
    
    return view;
  },
  
  _scthv_enterDragMode: function() {
    this.set('isInDragMode', YES);
  },
  
  _scthv_exitDragMode: function() {
    this.set('isInDragMode', NO);
  },
  
  // _scthv_hideViewInDragMode: function() {    
  //   var shouldBeVisible = !this.get('isInDragMode'), layer = this.get('layer');
  //   console.log('should be visible: %@'.fmt(!this.get('isInDragMode')));
  //   SC.RunLoop.begin();
  //   SC.$(layer).css('display', shouldBeVisible ? 'block' : 'none');
  //   SC.RunLoop.end();
  // }.observes('isInDragMode'),
  
  // _scthv_setupDragMode: function() {
  //   var isInDragMode = this.get('isInDragMode');
  //   if (isInDragMode) {
  //     });      
  //   } else {
  //     //
  //   }
  //   
  //   
  // }.observes('isInDragMode'),
  
  _scthv_dragModeViewDidChange: function() {
    var dragModeView = this.get('dragModeView');
    if (dragModeView && dragModeView.set) {
      dragModeView.set('tableHeadView', this);
      dragModeView.set('tableView', this.get('tableView'));
    }
  }.observes('dragModeView'),
  
  _scthv_layoutDidChange: function(sender, key, value, rev) {
    var pv = this.get('parentView');
    pv.invokeOnce(pv.layoutChildViews);
    
    // Tell the container view how tall the header is so that it can adjust
    // itself accordingly.
    var layout = this.get('layout');    
    //this.get('dragModeView').adjust('top', layout.height);
  },
  
  // When our column's tableContent property changes, we need to go back and get our column content
  _scthv_tableContentDidChange: function() {
    var tableContent = this.get('column').get('tableContent');    
    var columnContent = this.get('parentView')._scthv_columnContentFromTableContent(tableContent, this.get('columnIndex'));
    this.set('content', columnContent);
  },
  
  _scthv_sortStateDidChange: function() {
    SC.RunLoop.begin();
    var sortState  = this.get('column').get('sortState');
    var classNames = this.get('classNames');
    
    classNames.removeObject('sc-table-header-sort-asc');
    classNames.removeObject('sc-table-header-sort-desc');
    classNames.removeObject('sc-table-header-sort-active');
    
    if (sortState !== null) {
      classNames.push('sc-table-header-sort-active');
    }
    
    if (sortState === SC.SORT_ASCENDING) {
      classNames.push('sc-table-header-sort-asc');
    }
    
    if (sortState === SC.SORT_DESCENDING) {
      classNames.push('sc-table-header-sort-desc');
    }
    
    // TODO: Figure out why it's not enough to simply call
    // `displayDidChange` here.
    this.displayDidChange();
    this.invokeOnce('updateLayer');
    SC.RunLoop.end();
  }
});

/* >>>>>>>>>> BEGIN source/views/table_head.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/table');
sc_require('views/table_header');

/** @class

  The head of a `SC.TableView`. It's a special row of the table that holds
  the column header cells.
  
  @extends SC.View
  @since SproutCore 1.1
*/
SC.TableHeadView = SC.View.extend({  
/** @scope SC.TableHeadView.prototype */
  
  layout: { height: 18, left: 0, right: 0, top: 0 },

  classNames: ['sc-table-head'],

  cells: [],
  
  acceptsFirstResponder: YES,

  dragOrder: null,
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._scthv_handleChildren();
  },
    
  columns: function() {
    return this.get('parentView').get('columns');
  }.property(),  
  
  renderChildViews: function(context, firstTime) {
    var cells = this.get('cells'), cell, idx;
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      context = context.begin(cell.get('tagName'));
      cell.prepareContext(context, firstTime);
      context = context.end();
    }
    return context;
  },
  
  layoutChildViews: function() {
    var cells = this.get('cells'), cell, idx;
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      cell.adjust(this._scthv_layoutForHeaderAtColumnIndex(idx));
      cell.updateLayout();
    }
  },

  
  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  _scthv_enterDragMode: function() {
    var order = [], columns = this.get('columns'), idx;
    
    for (idx = 0; idx < columns.get('length'); idx++) {
      order.push(columns.objectAt(idx).get('key'));
    }
    
    this.set('dragOrder', order);
  },
  
  _scthv_changeDragOrder: function(draggedColumnIndex, leftOfIndex) {
    var dragOrder = this.get('dragOrder'),
     draggedColumn = dragOrder.objectAt(draggedColumnIndex);
    
    dragOrder.removeAt(idx);
    dragOrder.insertAt(leftOfIndex, draggedColumn);
  },
  
  _scthv_reorderDragColumnViews: function() {
    
  }.observes('dragOrder'),
  
  
  _scthv_columnContentFromTableContent: function(tableContent, columnIndex) {
    var column = this.get('columns').objectAt(columnIndex),
        key = column.get('key'),
        ret = [],
        idx;
        
    if (!tableContent) return ret;
        
    var tableView = this.get('parentView'),
        length = tableContent.get('length');
        // visibleIndexes = tableView.contentIndexesInRect(
        //     tableView.get('frame')).toArray();
            
    for (idx = 0; idx < length; idx++) {
      //visibleIndex = visibleIndexes.objectAt(idx);
      ret.push(tableContent.objectAt(idx).get(key));
    }
    
    return ret;
  },
  
  _scthv_layoutForHeaderAtColumnIndex: function(index) {
    var columns = this.get('columns'),
        rowHeight = this.get('parentView').get('rowHeight'),
        layout = {},
        left = 0, idx;
        
    for (idx = 0; idx < index; idx++) {
      left += columns.objectAt(idx).get('width');
    }
    
    return {
      left:   left,
      width:  columns.objectAt(index).get('width'),
      height: rowHeight
    };
  },
  
  _scthv_handleChildren: function() {
    var columns = this.get('columns');
    var tableView = this.get('parentView');
    var tableContent = tableView.get('content');
    
    var column, key, label, content, cells = [], cell, idx;
    for (idx = 0; idx < columns.get('length'); idx++) {
      column = columns.objectAt(idx);
      key    = column.get('key');
      label  = column.get('label');
      content = this._scthv_columnContentFromTableContent(tableContent, idx);
      cell   = this._scthv_createTableHeader(column, label, content, idx);
      cells.push(cell);
    }
    this.set('cells', cells);
    if (cells.length > 0)
      this.replaceAllChildren(cells);
  },
  
  _scthv_createTableHeader: function(column, label, content, idx) {
    var tableView = this.get('parentView');
    var cell = SC.TableHeaderView.create({
      column:  column,
      label: label,
      content: content,
      tableView: tableView,
      columnIndex: idx
    });
    return cell;
  }
});


/* >>>>>>>>>> BEGIN source/views/table.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/table_delegate');
sc_require('views/table_head');

/** @class
  
  A table view renders a two-dimensional grid of data.
  
  TODO: More documentation.
  
  @extends SC.ListView
  @extends SC.TableDelegate
  @since SproutCore 1.1
*/

SC.TableView = SC.ListView.extend(SC.TableDelegate, {
  /** @scope SC.TableView.prototype */  
  
  // ..........................................................
  // PROPERTIES
  // 
  
  classNames: ['sc-table-view'],
  
  childViews: "tableHeadView scrollView".w(),
  
  scrollView: SC.ScrollView.extend({
    isVisible: YES,
    layout: {
      left:   -1,
      right:  0,
      bottom: 0,
      top:    19
    },
    hasHorizontalScroller: NO,
    borderStyle: SC.BORDER_NONE,
    contentView: SC.View.extend({
    }),
    
    // FIXME: Hack.
    _sv_offsetDidChange: function() {
      this.get('parentView')._sctv_scrollOffsetDidChange();
    }.observes('verticalScrollOffset', 'horizontalScrollOffset')
  }),

  hasHorizontalScroller: NO,
  hasVerticalScroller: NO,
  
  selectOnMouseDown: NO,
  
  // FIXME: Charles originally had this as an outlet, but that doesn't work.
  // Figure out why.
  containerView: function() {
    var scrollView = this.get('scrollView');
    return (scrollView && scrollView.get) ? scrollView.get('contentView') : null;
    //return this.get('scrollView').get('contentView');
  }.property('scrollView'),
  
  layout: { left: 0, right: 0, top: 0, bottom: 0 },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);

    window.table = this; // DEBUG
    //this._sctv_columnsDidChange();
  },
  
  
  canReorderContent: NO,
  
  isInDragMode: NO,
  
  // ..........................................................
  // EVENT RESPONDERS
  // 
  
  mouseDownInTableHeaderView: function(evt, header) {
    var column = header.get('column');
    
    if (!column.get('isReorderable') && !column.get('isSortable')) {
      return NO;
    }
    
    // Save the mouseDown event so we can use it for mouseUp/mouseDragged.
    this._mouseDownEvent = evt;
    // Set the timer for switching from a sort action to a reorder action.
    this._mouseDownTimer = SC.Timer.schedule({
      target: this,
      action: '_scthv_enterDragMode',
      interval: 300
    });
    
    return YES;
  },
  
  mouseUpInTableHeaderView: function(evt, header) {
    var isInDragMode = this.get('isInDragMode');
    // Only sort if we're not in drag mode (i.e., short clicks).
    if (!isInDragMode) {
      var column = header.get('column');
      // Change the sort state of the associated column.
      this.set('sortedColumn', column);

      var sortState = column.get('sortState');
      var newSortState = sortState === SC.SORT_ASCENDING ?
       SC.SORT_DESCENDING : SC.SORT_ASCENDING;

      column.set('sortState', newSortState);
    }
    
    // Exit drag mode (and cancel any scheduled drag modes).
    // this._scthv_exitDragMode();
    this._dragging = false;
    if (this._mouseDownTimer) {
      this._mouseDownTimer.invalidate();
    }
    
  },
  
  mouseDraggedInTableHeaderView: function(evt, header) {
    SC.RunLoop.begin();
    var isInDragMode = this.get('isInDragMode');
    if (!isInDragMode) return NO;
    
    if (!this._dragging) {
      SC.Drag.start({
        event:  this._mouseDownEvent,
        source: header,
        dragView: this._scthv_dragViewForHeader(),
        ghost: YES
        //anchorView: this.get('parentView')
      });
      this._dragging = true;
    }
    
    return arguments.callee.base.apply(this,arguments);
    SC.RunLoop.end();
  },
  
  
  // ..........................................................
  // COLUMN PROPERTIES
  //
  
  /**
    A collection of `SC.TableColumn` objects. Modify the array to adjust the
    columns.
    
    @property
    @type Array
  */
  columns: [],
  
  /**
    Which column will alter its size so that the columns fill the available
    width of the table. If `null`, the last column will stretch.
    
    @property
    @type SC.TableColumn
  */
  flexibleColumn: null,
  
  /**
    Which column is currently the "active" column for sorting purposes.
    Doesn't say anything about sorting direction; for that, read the
    `sortState` property of the sorted column.
    
    @property
    @type SC.TableColumn
  */
  sortedColumn: null,

  // ..........................................................
  // HEAD PROPERTIES
  // 

  /**
    if YES, the table view will generate a head row at the top of the table
    view.
    
    @property
    @type Boolean
  */
  hasTableHead: YES,
    
  /**
    The view that serves as the head view for the table (if any).
    
    @property
    @type SC.View
  */
  tableHeadView: SC.TableHeadView.extend({
    layout: { top: 0, left: 0, right: 0 }
  }),
  
  /**
    The height of the table head in pixels.
    
    @property
    @type Number
  */
  tableHeadHeight: 18,
  

  // ..........................................................
  // ROW PROPERTIES
  //

  /**
    Whether all rows in the table will have the same pixel height. If so, we
    can compute offsets very cheaply.
    
    @property
    @type Boolean
  */
  hasUniformRowHeights: YES,
  
  /**
    How high each row should be, in pixels.
    
    @property
    @type Number
  */
  rowHeight: 18,
  
  /**
    Which view to use for a table row.
    
    @property
    @type SC.View
  */
  exampleView: SC.TableRowView,
  
  // ..........................................................
  // DRAG-REORDER MODE
  // 
  
  isInColumnDragMode: NO,
  
    
  
  // ..........................................................
  // OTHER PROPERTIES
  // 
  
  filterKey: null,
  
  
  /**
    Returns the top offset for the specified content index.  This will take
    into account any custom row heights and group views.
    
    @param {Number} idx the content index
    @returns {Number} the row offset in pixels
  */
  
  rowOffsetForContentIndex: function(contentIndex) {
    var top = 0, idx;
    
    if (this.get('hasUniformRowHeights')) {
      return top + (this.get('rowHeight') * contentIndex);
    } else {
      for (idx = 0; idx < contentIndex; i++) {
        top += this.rowHeightForContentIndex(idx);
      }
      return top;
    }    
  },
  
  /**
    Returns the row height for the specified content index.  This will take
    into account custom row heights and group rows.
    
    @param {Number} idx content index
    @returns {Number} the row height in pixels
  */
  rowHeightForContentIndex: function(contentIndex) {
    if (this.get('hasUniformRowHeights')) {
      return this.get('rowHeight');
    } else {
      // TODO
    }
  },
  
  
  /**  
    Computes the layout for a specific content index by combining the current
    row heights.
    
    @param {Number} index content index
  */
  layoutForContentIndex: function(index) {
    return {
      top:    this.rowOffsetForContentIndex(index),
      height: this.rowHeightForContentIndex(index),
      left:   0,
      right:  0
    };
  },
  
  createItemView: function(exampleClass, idx, attrs) {
    // Add a `tableView` attribute to each created row so it has a way to
    // refer back to this view.
    attrs.tableView = this;
    return exampleClass.create(attrs);
  },
  
  clippingFrame: function() {
    var cv = this.get('containerView'),
        sv = this.get('scrollView'),
        f  = this.get('frame');
        
    if (!sv.get) {
      return f;
    }

    return {
      height: f.height,
      width:  f.width,
      x:      sv.get('horizontalScrollOffset'),
      y:      sv.get('verticalScrollOffset')
    };
    
  }.property('frame', 'content').cacheable(),
   
  _sctv_scrollOffsetDidChange: function() {
    this.notifyPropertyChange('clippingFrame');
  },


  // ..........................................................
  // SUBCLASS IMPLEMENTATIONS
  //
  
  
  computeLayout: function() {
    var layout = arguments.callee.base.apply(this,arguments),
        containerView = this.get('containerView'),
        frame = this.get('frame');
        
    var minHeight = layout.minHeight;
    delete layout.minHeight;
        

    // FIXME: In the middle of initialization, the TableView needs to be
    // reloaded in order to become aware of the proper display state of the
    // table rows. This is currently the best heuristic I can find to decide
    // when to do the reload. But the whole thing is a hack and should be
    // fixed as soon as possible.
    // var currentHeight = containerView.get('layout').height;
    // if (currentHeight !== height) {
    //   this.reload();
    // }
    
    containerView.adjust('minHeight', minHeight);
    containerView.layoutDidChange();

    //containerView.adjust('height', height);
    //containerView.layoutDidChange();
    
    this.notifyPropertyChange('clippingFrame');    
    return layout;
  },
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  // When the columns change, go through all the columns and set their tableContent to be this table's content
  // TODO: should these guys not just have a binding of this instead?
  _sctv_columnsDidChange: function() {

    var columns = this.get('columns'), 
        content = this.get('content'),
        idx;
    
    for (idx = 0; idx < columns.get('length'); idx++) {
      columns.objectAt(idx).set('tableContent', content);
    }
    this.get('tableHeadView')._scthv_handleChildren();
    this.reload();

  }.observes('columns'),
  
  // Do stuff when our frame size changes.
  _sctv_adjustColumnWidthsOnResize: function() {

    var width   = this.get('frame').width;
    var content = this.get('content'),
        del = this.delegateFor('isTableDelegate', this.delegate, content);
    
    if (this.get('columns').length == 0) return;
    width = del.tableShouldResizeWidthTo(this, width);
    
    var columns = this.get('columns'), totalColumnWidth = 0, idx;
    
    for (var idx = 0; idx < columns.length; idx++) {
      totalColumnWidth += columns.objectAt(idx).get('width');
    }
    
    if (width === 0) width = totalColumnWidth;
    var flexibleColumn = this.get('flexibleColumn') ||
      this.get('columns').objectAt(this.get('columns').length - 1);
    var flexibleWidth = flexibleColumn.get('width') +
     (width - totalColumnWidth);
     
    flexibleColumn.set('width', flexibleWidth);    
  }.observes('frame'),
    
  // =============================================================
  // = This is all terrible, but will have to do in the interim. =
  // =============================================================
  _sctv_sortContent: function() {
    var sortedColumn = this.get('sortedColumn');
    var sortKey = sortedColumn.get('key');
    this.set('orderBy', sortKey);
  },
  
  _sctv_sortedColumnDidChange: function() {
    var columns = this.get('columns'),
        sortedColumn = this.get('sortedColumn'),
        column, idx;
    
    for (idx = 0; idx < columns.get('length'); idx++) {
      column = columns.objectAt(idx);
      if (column !== sortedColumn) {
        column.set('sortState', null);
      }
    }
    
    this.invokeOnce('_sctv_sortContent');
  }.observes('sortedColumn')    
});

/* >>>>>>>>>> BEGIN source/views/table_row.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  
  The default example view for a table row. Belongs to a SC.TableView.

  @extends SC.View
  @since SproutCore 1.1
*/

SC.TableRowView = SC.View.extend({
/** @scope SC.TableRowView.prototype */ 

  //layout: { height: 18, left: 0, right: 0, top: 0 },
  
  // ..........................................................
  // PROPERTIES
  //
  
  classNames: ['sc-table-row'],
  
  cells: [],

  acceptsFirstResponder: YES,
  
  /**
    A reference to the row's encompassing TableView.
    
    @property
    @type SC.TableView
  */
  tableView: null,
  
  // ..........................................................
  // METHODS
  // 
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this._sctrv_handleChildren();
  },
  
  /**
    A collection of `SC.TableColumn` objects.
    
    @property
    @type Array
  */
  columns: function() {
    return this.get('tableView').get('columns');
  }.property(),
  
  prepareContext: function(context, firstTime) {
    arguments.callee.base.apply(this,arguments);
    context.setClass('sel', this.get('isSelected'));
  },
  
  render: function(context, firstTime) {
    var classArray = [];
    
    classArray.push((this.get('contentIndex')%2 === 0) ? 'even' : 'odd');
    context.addClass(classArray);
    
    arguments.callee.base.apply(this,arguments);
  },
  
  renderChildViews: function(context, firstTime) {
    var cells = this.get('cells'), cell, idx;
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      context = context.begin(cell.get('tagName'));
      cell.prepareContext(context, firstTime);
      context = context.end();
    }
    return context;
  },
  
  layoutChildViews: function() {
    var cells = this.get('cells'), columns = this.get('columns'),
        cell, column, idx;
    var left = 0, width, rowHeight = this.get('tableView').get('rowHeight');
    
    for (idx = 0; idx < cells.get('length'); idx++) {
      cell = cells.objectAt(idx);
      column = columns.objectAt(idx);
      width = column.get('width');
      
      cell.adjust({
        left: left,
        width: width,
        height: rowHeight
      });
      
      left += width;
      cell.updateLayout();
    }
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  _sctrv_layoutForChildAtColumnIndex: function(index) {
    var columns = this.get('columns'),
        rowHeight = this.get('tableView').get('rowHeight'),
        layout = {},
        left = 0, idx;
        
    for (idx = 0; idx < index; idx++) {
      left += columns.objectAt(idx).get('width');
    }
    
    return {
      left:   left,
      width:  columns.objectAt(index).get('width'),
      height: rowHeight
    };
  },  
  
  _sctrv_createTableCell: function(column, value) {
    var cell = SC.TableCellView.create({
      column:  column,
      content: value
    });
    return cell;
  },
  
  // The row needs to redraw when the selection state changes.
  _sctrv_handleSelection: function() {
    this.displayDidChange();
  }.observes('isSelected'),
  
  _sctrv_handleChildren: function() {
    var content = this.get('content'), columns = this.get('columns');
    
    this.removeAllChildren();
    var column, key, value, cells = [], cell, idx;
    for (idx = 0; idx < columns.get('length'); idx++) {
      column = columns.objectAt(idx);
      key    = column.get('key');
      value  = content ? content.getPath(key) : "";
      cell   = this._sctrv_createTableCell(column, value);
      cells.push(cell);
      this.appendChild(cell);
    }
    
    this.set('cells', cells);
  }
});


/* >>>>>>>>>> BEGIN source/views/table_cell.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/table_row');

SC.TableCellView = SC.View.extend({
  
  classNames: ['sc-table-cell'],
  
  column: null,
  escapeHTMLBinding: SC.Binding.oneWay('.column.escapeHTML'),
  formatter: SC.Binding.oneWay('.column.formatter'),
  
  displayValue: function() {
    var value = this.get('content') ;
    
    // 1. apply the formatter
    var formatter = this.get('column').get('formatter');
    if (formatter) {
      var formattedValue = (SC.typeOf(formatter) === SC.T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (!SC.none(formattedValue)) value = formattedValue ;
    }
    
    if (SC.typeOf(value) === SC.T_ARRAY) {
      var ary = [];
      for(var idx=0;idx<value.get('length');idx++) {
        var x = value.objectAt(idx) ;
        if (!SC.none(x) && x.toString) x = x.toString() ;
        ary.push(x) ;
      }
      value = ary.join(',') ;
    }
    
    if (!SC.none(value) && value.toString) value = value.toString() ;
    
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    
    return value ;
  }.property('content', 'escapeHTML', 'formatter').cacheable(),
  
  render: function(context, firstTime) {
    context.push(this.get('displayValue'));
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);

    var column = this.get('column');
    
    column.addObserver('width',    this, '_sctcv_layoutDidChange');
    column.addObserver('maxWidth', this, '_sctcv_layoutDidChange');
    column.addObserver('minWidth', this, '_sctcv_layoutDidChange');
  },
    
  _sctcv_layoutDidChange: function(sender, key, value, rev) {
    var pv = this.get('parentView');
    SC.run( function() { pv.layoutChildViews(); });
  }
});

