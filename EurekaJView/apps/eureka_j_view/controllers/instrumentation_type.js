// ==========================================================================
// Project:   EurekaJView.instrumentationTreeController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/

EurekaJView.instrumentationTypeController = SC.TreeController.create(
/** @scope EurekaJView.instrumentationTreeController.prototype */ {
	
	selectedInstrumentationTypePath: null,
	treeItemIsGrouped: YES,
	allowsMultipleSelection: NO,

	populate: function() {
		var rootNode = SC.Object.create({
			treeItemIsExpanded: YES,
			name: "Instrumentations",
			treeItemChildren: function() {
				var query = SC.Query.local(EurekaJView.instrumentationTypeTree, 'parentPath = {parentPath}', {parentPath : null})
				return EurekaJView.instrumentationTypeStore.find(query);
			}.property()
		});
		
		this.set('content', rootNode)
	},
	
	observesSelection: function(){
	        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.guiPath')){
	            this.set('selectedInstrumentationTypePath', this.getPath('selection.firstObject.guiPath'));
				//alert('instrumentationTypeController observesSelection: ' + this.get('selectedInstrumentationTypePath'));
				//var nodes = EurekaJView.instrumentationTreeStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY);//.refresh();
				SC.Logger.log('instrumentationTypeController observesSelection');
				var nodes = EurekaJView.instrumentationLeafStore.find(EurekaJView.INSTRUMENTATION_LEAFS_QUERY);//.refresh();
				SC.Logger.log(nodes);
				nodes.refresh();
				EurekaJView.instrumentationChartController.set('content', nodes);
	        }
	    }.observes('selection')
}) ;
