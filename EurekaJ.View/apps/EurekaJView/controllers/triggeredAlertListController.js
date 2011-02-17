// ==========================================================================
// Project:   EurekaJView.instrumentationGroupAdminController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.triggeredAlertListController = SC.ArrayController.create(
    /** @scope EurekaJView.triggeredAlertListController.prototype */ {

    timer: null,

    refreshData: function() {
        SC.Logger.log('Refreshing Instrumentation Menu');
        EurekaJView.EurekaJStore.find(EurekaJView.TRIGGERED_ALERTS_QUERY).refresh();
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.triggeredAlertListController,
                action: 'refreshData',
                interval: 15000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    }
});
