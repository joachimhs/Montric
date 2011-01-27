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

    primaryKey: 'guiPath',
    guiPath: SC.Record.attr(String),

    name: SC.Record.attr(String),
    isSelected: SC.Record.attr(Boolean),
    parentPath: SC.Record.attr(String),
    hasChildren: SC.Record.attr(Boolean),
    treeItemIsExpanded: NO,
    childrenNodes: SC.Record.toMany('EurekaJView.InstrumentationTreeModel'),
	chartGrid: SC.Record.toMany('EurekaJView.ChartGridModel'),
    nodeType: SC.Record.attr(String),

    treeItemChildren: function() {
        if (this.get('childrenNodes').toArray().length === 0) {
            return null;
        } else {
            return this.get('childrenNodes');
        }
    }.property(),

    itemIcon: function() {
        if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "chart") == 0) {
            return static_url('images/ej_chart_16.png');
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "alert") == 0) {
            return static_url('images/ej_chart_alert_16.png');
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "groupedStatistics") == 0) {
            return static_url('images/ej_groupedstats_16.png');
        } else {
            return null;
        }
    }.property(),

    checkboxKey: function() {
        if (!this.get('hasChildren')) {
            return 'isSelected';
        } else {
            return null;
        }
    }.property()


});
