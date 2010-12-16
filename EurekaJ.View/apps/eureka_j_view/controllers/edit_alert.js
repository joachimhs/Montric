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
        SC.Logger.log('selectedInstrumentationNode: ' + this.get('content').get('alertInstrumentationNode'));
        var instrumentationNode = EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationTreeModel, this.getPath('content.alertInstrumentationNode'));
        if (instrumentationNode) {
            SC.Logger.log('Node: ' + instrumentationNode.get('availableCharts').toArray());
            EurekaJView.alertChartController.set('content', instrumentationNode.get('availableCharts'));
        }
    }.observes('*content.alertInstrumentationNode')
});
