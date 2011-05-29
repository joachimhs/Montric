EurekaJView.mixin( {

	/** Statechart actions */
	showAdministrationPaneAction: function() {
		EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
        EurekaJView.EurekaJStore.find(EurekaJView.ADMINISTRATION_TREE_QUERY);
        EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_GROUPS_QUERY);
        EurekaJView.EurekaJStore.find(EurekaJView.EMAIL_GROUPS_QUERY);

        EurekaJView.updateAlertsAction();
        EurekaJView.updateInstrumentationGroupsAction();
        EurekaJView.updateEmailGroupsAction();

		EurekaJView.statechart.sendEvent('showAdministrationPaneAction');
	},
	
	hideAdministrationPaneAction: function() {
        EurekaJView.statechart.sendEvent('hideAdministrationPaneAction');
    },	
	/** //Statechart actions */

    addNewAlertAction: function() {
        newAlert = EurekaJView.EurekaJStore.createRecord(EurekaJView.AlertModel, {alertName: EurekaJView.alertAdministrationController.get('newAlertName')});
        EurekaJView.alertAdministrationController.set('newAlertName', '');
    },

    updateAlertsAction: function() {
        EurekaJView.alertAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.AlertModel));
        EurekaJView.alertNotificationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
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
            EurekaJView.editEmailGroupController.get('emailAddresses').pushObject(newEmailRecipient);
        } else {
            EurekaJView.editEmailGroupController.set('emailAddresses', [ newEmailRecipient ])
        }
    },

    saveEmailAction: function() {
        EurekaJView.EurekaJStore.commitRecords();
    },

    addSelectedChartsToChartGroup: function() {
        var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'isSelected = {isSelected}', {isSelected: YES});
        var selectedCharts = EurekaJView.EurekaJStore.find(query);
        var selectedChartsContentArray = [];

        selectedCharts.forEach(function(chart) {
            if (chart.instanceOf(EurekaJView.AdminstrationTreeModel) && !EurekaJView.selectedInstrumentationGroupController.get('content').contains(chart)) {
                chart.set('isSelected', NO);
                EurekaJView.selectedInstrumentationGroupController.get('content').pushObject(chart);
            }
        }, this);
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