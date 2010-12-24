// ==========================================================================
// Project:   EurekaJView.editAlertController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.editAlertController = SC.ObjectController.create(
    /** @scope EurekaJView.editAlertController.prototype */ {

    contentBinding: 'EurekaJView.alertAdministrationController.selection',


    observesInstrumentationNodeSelection: function() {
        SC.Logger.log('editAlertController observesInstrumentationNodeSelection selectedInstrumentationNode: ' + this.get('alertInstrumentationNode'));
    }.observes('content')

    /*observeContent: function() {
        SC.Logger.log('editAlertController contentObserver: ' + this.get('content').get('alertInstrumentationNode'));

        var instrumentationNode = this.getPath('content.alertInstrumentationNode');
        if (instrumentationNode) {
            SC.Logger.log('editAlertController contentObserver Setting selection: ' + instrumentationNode);
            //EurekaJView.alertChartController.populate();
            //EurekaJView.alertChartController.set('selection', instrumentationNode);
        }
    }.observes('content')*/



});
