EurekaJView.mixin( {

    /*showTimeperiodPane: function() {
        SC.Logger.log('showing Time Period Panel');
        EurekaJView.statechart.gotoState('showTopMenu.showTimePeriodPanel');
    } */

    addNewAlertAction: function() {
        SC.Logger.log('EurekaJView.mixin Adding new Alert');
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: EurekaJView.alertAdministrationController.get('newAlertName')});
        EurekaJView.alertAdministrationController.set('newAlertName', '');
    },

    updateAlertsAction: function() {
        EurekaJView.alertAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.AlertModel));
    },

    saveAlertsAction: function() {
        EurekaJView.EurekaJStore.commitRecords();
    },

    addnewInstrumentationGroupAction: function() {
        EurekaJView.EurekaJStore.createRecord(EurekaJView.InstrumentationGroupModel, {instrumentaionGroupName: EurekaJView.instrumentationGroupAdminController.get('newInstrumentationGroupName')});
        EurekaJView.instrumentationGroupAdminController.set('newInstrumentationGroupName', '');
    },

    updateInstrumentationGroupsAction: function() {
        EurekaJView.instrumentationGroupAdminController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationGroupModel));
    },

    saveInformationGroupsAction: function() {
        EurekaJView.EurekaJStore.commitRecords();
    },

    addNewEmailGroupAction: function() {
        SC.Logger.log('EurekaJView.mixin Adding new Email Group');
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailGroupModel, {emailGroupName: EurekaJView.emailAdministrationController.get('newEmailGroupName')});
        EurekaJView.emailAdministrationController.set('newEmailGroupName', '');
    },

    updateEmailGroupsAction: function() {
        EurekaJView.emailAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
    },

    addNewEmailRecipientAction: function() {
        newEmailRecipient = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailRecipientModel, {emailAddress: EurekaJView.emailRecipientsController.get('newEmailRecipent')});
        EurekaJView.alertAdministrationController.set('newAlertName', '');
        EurekaJView.editEmailGroupController.get('emailAddresses').addObject(newEmailRecipient);
    }

});