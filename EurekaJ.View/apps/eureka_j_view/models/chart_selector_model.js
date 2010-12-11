// ==========================================================================
// Project:   EurekaJView.ChartSelectorModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.ChartSelectorModel = SC.Record.extend(
/** @scope EurekaJView.ChartSelectorModel.prototype */ {

  	guid: SC.Record.attr(String),
  	name: SC.Record.attr(String),
	isSelected: SC.Record.attr(Boolean),
	parentPath: SC.Record.attr(String),
	guiPath: SC.Record.attr(String),
	
	parentTreeNode: SC.Record.toOne('EurekaJView.InstrumentationTreeModel', {inverse: 'availableCharts', isMaster: NO }),
	chartGrid: SC.Record.toOne('EurekaJView.ChartGridModel', {isMaster: YES }),
});
