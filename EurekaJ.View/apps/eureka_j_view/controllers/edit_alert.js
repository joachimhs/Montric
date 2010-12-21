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

    contentBinding: 'EurekaJView.alertAdministrationController*selection.firstObject',


    observesInstrumentationNodeSelection: function() {
        SC.Logger.log('editAlertController observesInstrumentationNodeSelection selectedInstrumentationNode: ' + this.get('content').get('alertInstrumentationNode'));
    }.observes('*content.alertInstrumentationNode'),

    observeContent: function() {
        SC.Logger.log('editAlertController contentObserver: ' + this.get('content').get('alertInstrumentationNode'));
        var instrumentationNode = EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationTreeModel, this.getPath('content.alertInstrumentationNode'));
        if (instrumentationNode) {
            SC.Logger.log('editAlertController contentObserver Setting selection: ' + instrumentationNode.get('guiPath'));

            EurekaJView.alertChartController.set('selection', instrumentationNode.get('guiPath'));
        }
    }.observes('content')



});
