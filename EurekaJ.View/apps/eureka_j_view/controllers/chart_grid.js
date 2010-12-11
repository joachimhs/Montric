// ==========================================================================
// Project:   EurekaJView.chartGridController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.chartGridController = SC.ArrayController.create(
/** @scope EurekaJView.chartGridController.prototype */
{

    timer: null,
	selectedChartTimespan: 10,
	selectedChartResolution: 15, 

    refreshData: function() {
        for (var i = 0; i < this.get('content').length; i++) {
				this.get('content').objectAt(i).refresh();
        }
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.chartGridController,
                action: 'refreshData',
                interval: 15000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    },

	observesChartTimespan: function() {
		this.refreshData();
	}.observes('selectedChartTimespan'),
	
	observesChartResolution: function() {
		this.refreshData();
	}.observes('selectedChartResolution')

});
