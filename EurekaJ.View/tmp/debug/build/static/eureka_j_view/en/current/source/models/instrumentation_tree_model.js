// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationTreeModel = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTreeModel.prototype */
{

    guid: SC.Record.attr(String),
    name: SC.Record.attr(String),
    isSelected: SC.Record.attr(Boolean),
    parentPath: SC.Record.attr(String),
    guiPath: SC.Record.attr(String),
    hasChildren: SC.Record.attr(Boolean),
    treeItemIsExpanded: NO,
	availableCharts: SC.Record.toMany('EurekaJView.ChartSelectorModel', { inverse: 'parentTreeNode', isMaster: YES }),
	
    treeItemChildren: function() {
        var query = SC.Query.local(EurekaJView.InstrumentationTreeModel, 'parentPath = {parentPath}', {
            parentPath: this.get('guiPath')
        })
        var nodes = EurekaJView.EurekaJStore.find(query);
        if (nodes.toArray().length === 0) {
            return null;
        } else {
            return nodes;
        }
    }.property(),
});
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');