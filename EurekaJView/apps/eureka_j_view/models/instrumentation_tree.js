// ==========================================================================
// Project:   EurekaJView.InstrumentationTree
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.instrumentationTree = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTree.prototype */ {

  	guid: SC.Record.attr(Number),
  	name: SC.Record.attr(String),
	isSelected: SC.Record.attr(Boolean),
	parentPath: SC.Record.attr(String),
	guiPath: SC.Record.attr(String),
	treeItemIsExpanded: NO,
	//instrumentationType: SC.Record.toOne("EurekaJView.instrumentationTypeTree", {inverse: 'instrumentationTreeNodes', isMaster: NO}),
	
	treeItemChildren: function() {
		var query = SC.Query.local(EurekaJView.instrumentationTree, 'parentPath = {parentPath}', {parentPath : this.get('guiPath')})
		return EurekaJView.instrumentationTreeStore.find(query);
	}.property()//'guid').cacheable()

}) ;
