// ==========================================================================
// Project:   EurekaJView.instrumentationTreeController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.instrumentationTreeController = SC.TreeController.create(
/** @scope EurekaJView.instrumentationTreeController.prototype */ {
	
	selectedInstrumentationTreePath: null,
	treeItemIsGrouped: YES,

	populate: function() {
		var rootNode = SC.Object.create({
			treeItemIsExpanded: YES,
			name: "Instrumentations",
			treeItemChildren: function() {
				var query = SC.Query.local(EurekaJView.instrumentationTree, 'parentPath = {parentPath}', {parentPath : null})
				var nodes = EurekaJView.instrumentationTreeStore.find(query);
				//var query = EurekaJView.INSTRUMENTATION_TREE_QUERY.copy().set('parentPath: null');
				//var nodes = EurekaJView.store.find(query);
				return nodes;
			}.property()
		});
		
		this.set('content', rootNode)
	},
	
	observesSelection: function(){
	        if (this.didChangeFor('selectionDidChange', 'selection')){
	            this.set('selectedInstrumentationTreePath', this.getPath('selection.firstObject.guiPath'));
	        }
	    }.observes('selection')

}) ;
