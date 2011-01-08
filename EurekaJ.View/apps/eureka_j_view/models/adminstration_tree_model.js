// ==========================================================================
// Project:   EurekaJView.AdminstrationTreeModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.AdminstrationTreeModel = SC.Record.extend(
/** @scope EurekaJView.AdminstrationTreeModel.prototype */
{

    primaryKey: 'guiPath',
    guiPath: SC.Record.attr(String),

    name: SC.Record.attr(String),
    isSelected: SC.Record.attr(Boolean),
    parentPath: SC.Record.toOne('EurekaJView.AdminstrationTreeModel', {isMaster: YES }),

    hasChildren: SC.Record.attr(Boolean),
    treeItemIsExpanded: NO,

    childrenNodes: SC.Record.toMany('EurekaJView.AdminstrationTreeModel'),
	chartGrid: SC.Record.toMany('EurekaJView.ChartGridModel'),

    treeItemChildren: function() {
        if (this.get('childrenNodes').toArray().length === 0) {
            return null;
        } else {
            return this.get('childrenNodes');
        }
    }.property()

}) ;
