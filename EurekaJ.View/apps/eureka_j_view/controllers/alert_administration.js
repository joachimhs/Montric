// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertAdministrationController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newAlertName: null,
    showEditAlertView: NO,

    addnewAlert: function() {
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: this.get('newAlertName')});
        this.set('newAlertName', '');

        var alerts = EurekaJView.EurekaJStore.find(EurekaJView.AlertModel);
        this.set('content', alerts);
    },

    observesSelection: function(){
        if (this.getPath('selection.firstObject.alertName')  != undefined) {
            this.set('showEditAlertView', YES);
        } else {
            this.set('showEditAlertView', NO);
        }
    }.observes('selection'),

    saveAlert: function() {
        EurekaJView.EurekaJStore.commitRecords();
    }
});
