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
EurekaJView.instrumentationTypeTree = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTree.prototype */ {

	guid: SC.Record.attr(Number),
  	name: SC.Record.attr(String),
	isSelected: SC.Record.attr(Boolean),
	parentPath: SC.Record.attr(String),
	guiPath: SC.Record.attr(String),
	hasChildren: SC.Record.attr(Boolean),
	treeItemIsExpanded: NO,
	//instrumentationTreeNodes: SC.Record.toMany("EurekaJView.InstrumentationTree", {inverse: "instrumentationType", isMaster: YES}),
	
	treeItemChildren: function() {
		var query = SC.Query.local(EurekaJView.instrumentationTypeTree, 'parentPath = {parentPath}', {parentPath : this.get('guiPath')})
		var nodes = EurekaJView.instrumentationTypeStore.find(query);
		if (nodes.toArray().length === 0) {
			SC.Logger.log('Node ' + this.get('guiPath') + ' has no children');
//			this.set('hasChildren', NO);
			return null;
		} else {
//			this.set('hasChildren', YES);
			return nodes;
		}
	}.property(),//'guid').cacheable()
	
}) ;
