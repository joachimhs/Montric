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
				SC.Logger.log('instrumentationChartController observesSelection');
				SC.Logger.log(this.get('selectedInstrumentationTypePath'));
				var nodes = EurekaJView.instrumentationChartDataStore.find(EurekaJView.INSTRUMENTATION_CHART_DATA_QUERY);//.refresh();
				nodes.refresh();
				//EurekaJView.chartController.set('chartSeries', nodes);
				SC.Logger.log('Chart content set');
	        }
	    }.observes('selection')

}) ;
