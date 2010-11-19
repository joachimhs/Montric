// ==========================================================================
// Project:   EurekaJView.instrumentationChart
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.instrumentationChartController = SC.ArrayController.create(
/** @scope EurekaJView.instrumentationChart.prototype */ {

	selectedInstrumentationTypePath: null,
	allowsMultipleSelection: NO,
	
  	observesSelection: function(){
	        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.guiPath')){
	            this.set('selectedInstrumentationTypePath', this.getPath('selection.firstObject.guiPath'));
				//alert('instrumentationTypeController observesSelection: ' + this.get('selectedInstrumentationTypePath'));
				//var nodes = EurekaJView.instrumentationTreeStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY);//.refresh();
				SC.Logger.log('instrumentationTypeController observesSelection');
				SC.Logger.log(this.get('selectedInstrumentationTypePath'));
				//var nodes = EurekaJView.instrumentationLeafStore.find(EurekaJView.INSTRUMENTATION_LEAFS_QUERY);//.refresh();
				//SC.Logger.log(nodes);
				//nodes.refresh();
				//EurekaJView.instrumentationChartController.set('content', nodes);
	        }
	    }.observes('selection')

}) ;
