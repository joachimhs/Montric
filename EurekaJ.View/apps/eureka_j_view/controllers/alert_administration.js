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
    selectedAlert: null,
    selectedAlertName: null,
    selectedAlertActivated: null,
    selectedAlertInstrumentationNode: null,
    selectedAlertWarningValue: null,
    selectedAlertErrorValue: null,
    selectedAlertType: null,
    selectedAlertDelay: null,

    addnewAlert: function() {
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: this.get('newAlertName')});
        this.set('newAlertName', '');

        var alerts = EurekaJView.EurekaJStore.find(EurekaJView.AlertModel);
        this.set('content', alerts);
    },

    observesSelection: function(){
        if (this.getPath('selection.firstObject.alertName')  != undefined) {
            var selectedA = EurekaJView.EurekaJStore.find(EurekaJView.AlertModel, this.getPath('selection.firstObject.alertName'));
            SC.Logger.log('selectedA: ' + selectedA.get('alertName'));
            this.set('selectedAlert', selectedA);
            SC.Logger.log('selectedA2: ' + this.get('selectedAlert').get('alertName'));

            this.set('showEditAlertView', YES);
            this.set('selectedAlertName', this.getPath('selection.firstObject.alertName'));
            this.set('selectedAlertActivated', this.getPath('selection.firstObject.selectedAlertActivated'));
            this.set('selectedAlertInstrumentationNode', this.getPath('selection.firstObject.selectedAlertInstrumentationNode'));
            this.set('selectedAlertWarningValue', this.getPath('selection.firstObject.selectedAlertWarningValue'));
            this.set('selectedAlertErrorValue', this.getPath('selection.firstObject.selectedAlertErrorValue'));
            this.set('selectedAlertType', this.getPath('selection.firstObject.selectedAlertType'));
            this.set('selectedAlertDelay', this.getPath('selection.firstObject.selectedAlertDelay'));
            SC.Logger.log('selectedAlert:' + this.get('selectedAlertName'));
        } else {
            this.set('showEditAlertView', NO);
            this.set('selectedAlert', null);
        }
    }.observes('selection'),

    saveAlert: function() {
        EurekaJView.EurekaJStore.commitRecords();
    }
});
