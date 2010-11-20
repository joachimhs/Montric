// ==========================================================================
// Project:   EurekaJView.chartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.chartController = SC.ArrayController.create(
/** @scope EurekaJView.chartController.prototype */ {

//  	chartSeries: [{label: "set1", data: [[3,1],[2,2],[1,3]]}],
//	options: SC.Object.create({xaxis: {mode: "time"}}),
	timer: null,
	
	refreshData: function() {
		var nodes = EurekaJView.instrumentationChartDataStore.find(EurekaJView.INSTRUMENTATION_CHART_DATA_QUERY);//.refresh();
		nodes.refresh();
	},
	
	triggerTimer: function() {
		if (this.get('timer')) {
			SC.Logger.log('Timer already started');
		} else {
			var timer = SC.Timer.schedule({
				target: EurekaJView.chartController,
				action: 'refreshData',
				interval: 15000,
				repeats: YES
			});
			this.set('timer', timer)
		}
	}
});
