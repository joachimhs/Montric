EurekaJView.mixin( {

	/** Statechart actions */
	showAdministrationPaneAction: function() {
		EurekaJView.statechart.sendEvent('showAdministrationPaneAction');
	},
	
	hideAdministrationPaneAction: function() {
        EurekaJView.statechart.sendEvent('hideAdministrationPaneAction');
    },	
	/** //Statechart actions */

    addNewAlertAction: function() {
        if (EurekaJView.alertAdministrationController.newAlertIsValid()) {
            newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: EurekaJView.alertAdministrationController.get('newAlertName')});
            EurekaJView.alertAdministrationController.set('newAlertName', '');
        } else {
            SC.AlertPane.warn({
              message: "Unable to create new Alert",
              description: "The Alert name must be unique, and contain at least one character.",
              caption: "Try changing the name of the Alert."
            });
        }
    },

    updateAlertsAction: function() {
        EurekaJView.alertAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.AlertModel));
        EurekaJView.alertNotificationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
    },

    saveAlertsAction: function() {
        //Commmit all changes to alerts
        EurekaJView.alertAdministrationController.get('content').forEach(function(alert) {
            alert.commitRecord();
        }, this);
    },

    addnewInstrumentationGroupAction: function() {
        if (EurekaJView.chartGroupsAdminController.newChartGroupIsValid()) {
            EurekaJView.EurekaJStore.createRecord(EurekaJView.InstrumentationGroupModel, {instrumentaionGroupName: EurekaJView.chartGroupsAdminController.get('newInstrumentationGroupName')});
            EurekaJView.chartGroupsAdminController.set('newInstrumentationGroupName', '');
        } else {
            SC.AlertPane.warn({
              message: "Unable to create new Chart Group",
              description: "The Chart Group name must be unique, and contain at least one character.",
              caption: "Try changing the name of the Chart Group."
            });
        }
    },

    updateInstrumentationGroupsAction: function() {
        EurekaJView.chartGroupsAdminController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationGroupModel));
    },

    saveInformationGroupsAction: function() {
        //Commit all changes to Chart Groups
        EurekaJView.chartGroupsAdminController.get('content').forEach(function(chartGroup) {
            chartGroup.commitRecord();
        }, this);
    },

    addNewEmailGroupAction: function() {
        if (EurekaJView.emailAdministrationController.newEmailRecipientIsValid()) {
            newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailGroupModel, {emailGroupName: EurekaJView.emailAdministrationController.get('newEmailGroupName'), emailAddresses: []});
            EurekaJView.emailAdministrationController.set('newEmailGroupName', '');
        } else {
            SC.AlertPane.warn({
              message: "Unable to create new Email Recipient Group",
              description: "The Email Recipient Group name must be unique, and contain at least one character.",
              caption: "Try changing the name of the Email Recipient Group."
            });
        }
    },

    updateEmailGroupsAction: function() {
        EurekaJView.emailAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
    },

    addNewEmailRecipientAction: function() {
        var newEmailRecipient = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailRecipientModel, {emailAddress: EurekaJView.emailRecipientsController.get('newEmailRecipent')});
        EurekaJView.emailRecipientsController.set('newEmailRecipent', '');

        if (SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.ManyArray) ||
                SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.Array) ) {
            EurekaJView.editEmailGroupController.get('emailAddresses').pushObject(newEmailRecipient);
        } else {
            EurekaJView.editEmailGroupController.set('emailAddresses', [ newEmailRecipient ])
        }
    },

    saveEmailAction: function() {
        //Commit all email Recipients that have changed
        EurekaJView.emailRecipientsController.get('content').forEach(function(emailRecipient) {
            emailRecipient.commitRecord();
        }, this);
    },

    addSelectedChartsToChartGroup: function() {
        var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'isSelected = {isSelected}', {isSelected: YES});
        var selectedCharts = EurekaJView.EurekaJStore.find(query);
        var selectedChartsContentArray = [];

        selectedCharts.forEach(function(chart) {
            if (chart.instanceOf(EurekaJView.AdminstrationTreeModel) && !EurekaJView.selectedChartGroupChartsController.get('content').contains(chart)) {
                chart.set('isSelected', NO);
                EurekaJView.selectedChartGroupChartsController.get('content').pushObject(chart);
            }
        }, this);

        //var selectedInstrumentationGroup = EurekaJView.instrumentationGroupAdminController.selection;
        //selectedInstrumentationGroup.set('instrumentationGroupPath', EurekaJView.selectedInstrumentationGroupController.get('content'));
    },

    // Applying changes to historical time ranges.
    applyHistoricalChanges: function() {
        var parsedFromDate = SC.DateTime.parse(EurekaJView.chartGridController.get('selectedChartFromString'), EurekaJView.chartGridController.get('dateFormat'));
        var parsedToDate = SC.DateTime.parse(EurekaJView.chartGridController.get('selectedChartToString'), EurekaJView.chartGridController.get('dateFormat'));

        //If dates are parseable and the from-date is before or equal to the to-date, then change the dates
        if (parsedFromDate && parsedToDate && parsedFromDate.get('milliseconds') <= parsedToDate.get('milliseconds')) {
            EurekaJView.chartGridController.set('selectedChartFrom', parsedFromDate);
            EurekaJView.chartGridController.set('selectedChartTo', parsedToDate);
        }

        //Generate new strings for the GUI and refresh the chart
        EurekaJView.chartGridController.generateChartStrings();
        EurekaJView.chartGridController.refreshData();
    }

});