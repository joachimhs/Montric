// ==========================================================================
// Project:   EurekaJView.alertChartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertChartController = SC.ArrayController.create(
    /** @scope EurekaJView.alertChartController.prototype */ {

    allowsMultipleSelection: NO,


    populate: function() {
        var query = SC.Query.local(EurekaJView.InstrumentationTreeModel, 'hasChildren = {hasChildren}', {hasChildren: false});
        this.set('content', EurekaJView.EurekaJStore.find(query));
    },

     observesSelection: function() {
        SC.Logger.log('alertChartController observesSelection: ' + this.get('selection'));
        //this.set('selection', EurekaJView.editAlertController.get('alertInstrumentationNode'));
    }.observes('selection')

});
