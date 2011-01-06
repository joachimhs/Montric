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

    addnewInstrumentationGroup: function() {
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.InstrumentationGroupModel, {name: this.get('newInstrumentationGroupName')});
        this.set('newInstrumentationGroupName', '');
    },

    updateInstrumentationGroups: function() {
        this.set('content', EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationGroupModel));
    },

    observesSelection: function(){
        if (this.getPath('selection.firstObject.name')  != undefined) {
            this.set('showEditInstrumentationGroupView', YES);
            EurekaJView.instumentationGroupChartController.populate();
        } else {
            this.set('showEditInstrumentationGroupView', NO);
        }
    }.observes('selection')

});
