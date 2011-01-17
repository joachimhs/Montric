// ==========================================================================
// Project:   EurekaJView.instrumentationGroupAdminController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.instrumentationGroupAdminController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {

    newInstrumentationGroupName: null,
    allowsMultipleSelection: NO,
    showEditInstrumentationGroupView: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.instrumentaionGroupName')  != undefined) {
            this.set('showEditInstrumentationGroupView', YES);
            EurekaJView.instumentationGroupChartController.populate();
        } else {
            this.set('showEditInstrumentationGroupView', NO);
        }
    }.observes('selection')

});
