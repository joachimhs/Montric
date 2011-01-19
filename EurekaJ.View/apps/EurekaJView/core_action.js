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
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailGroupModel, {emailGroupName: EurekaJView.emailAdministrationController.get('newEmailGroupName'), emailAddresses: []});
        EurekaJView.emailAdministrationController.set('newEmailGroupName', '');
    },

    updateEmailGroupsAction: function() {
        EurekaJView.emailAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
    },

    addNewEmailRecipientAction: function() {
        var newEmailRecipient = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailRecipientModel, {emailAddress: EurekaJView.emailRecipientsController.get('newEmailRecipent')});
        EurekaJView.emailRecipientsController.set('newEmailRecipent', '');

        if (SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.ManyArray) ||
                SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.Array) ) {
            SC.Logger.log('Adding new email address to existing list');
            EurekaJView.editEmailGroupController.get('emailAddresses').pushObject(newEmailRecipient);
        } else {
            SC.Logger.log('Adding new email address.');
            EurekaJView.editEmailGroupController.set('emailAddresses', [ newEmailRecipient ])
            SC.Logger.log('new email addresses: ' + EurekaJView.editEmailGroupController.get('emailAddresses'));
        }

    },

    saveEmailAction: function() {
        EurekaJView.EurekaJStore.commitRecords();
    }

});