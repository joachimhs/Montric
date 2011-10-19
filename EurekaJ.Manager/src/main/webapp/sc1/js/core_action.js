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
    
    deleteSelectedAlertAction: function() {
    	SC.AlertPane.warn({
            message: "Are you sure you want to delete the selected Alert ?",
            description: "The alert will be permanently removed from the application. This action cannot be undone!",
            buttons: [ { title: "Delete" }, { title: "Cancel" } ],
            delegate: EurekaJView.alertAdministrationController
          });
    },
    
    deleteSelectedAlertApprovedAction: function() {
    	SC.Logger.log('Deleting selected Alert');
    	selectedAlerts = EurekaJView.alertAdministrationController.selection();
    	if (selectedAlerts) {
    		selectedAlerts.forEach(function(selectedAlert) {
    			SC.Logger.log('destroying selected alert'); 
    			selectedAlert.destroy();
    			selectedAlert.commitRecord();
    		}, this)
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
    
    deleteSelectedChartGroupAction: function() {
    	SC.AlertPane.warn({
            message: "Are you sure you want to delete the selected Chart Group ?",
            description: "The Chart Group will be permanently removed from the application. This action cannot be undone!",
            buttons: [ { title: "Delete" }, { title: "Cancel" } ],
            delegate: EurekaJView.chartGroupsAdminController
          });
    },
    
    deleteSelectedChartGroupApprovedAction: function() {
    	SC.Logger.log('Deleting selected Chart Group');
    	selectedGroups = EurekaJView.chartGroupsAdminController.selection();
    	if (selectedGroups) {
    		selectedGroups.forEach(function(selectedGroup) {
    			SC.Logger.log('destroying selected chart group'); 
    			selectedGroup.destroy();
    			selectedGroup.commitRecord();
    		}, this)
    	}
    },

    updateInstrumentationGroupsAction: function() {
        EurekaJView.chartGroupsAdminController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.InstrumentationGroupModel));
    },
    
    updateTreeMenuAdminAction: function() {
    	SC.Logger.log('updateTreeMenuAdminAction');
    	EurekaJView.instrumentationTreeAdminTreeController.populate();
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
    
    deleteSelectedEmailGroupAction: function() {
    	SC.AlertPane.warn({
            message: "Are you sure you want to delete the selected Email Recipient ?",
            description: "The Email Recipient will be permanently removed from the application. This action cannot be undone!",
            buttons: [ { title: "Delete" }, { title: "Cancel" } ],
            delegate: EurekaJView.emailAdministrationController
          });
    },
    
    deleteSelectedEmailGroupApprovedAction: function() {
    	SC.Logger.log('Deleting selected Email Group');
    	selectedEmailGroups = EurekaJView.emailAdministrationController.selection();
    	if (selectedEmailGroups) {
    		selectedEmailGroups.forEach(function(selectedGroup) {
    			SC.Logger.log('destroying selected chart group'); 
    			selectedGroup.destroy();
    			selectedGroup.commitRecord();
    		}, this)
    	}
    },
    
    deleteTreeMenuItemButtonAction: function() {
    	SC.Logger.log('Deleting selected items from the treemenu');
    	var hasNodes = NO;
    	var nodes = EurekaJView.instrumentationTreeAdminTreeController.getSelectedNodes();
    	
    	var nodesForDeletionText = "";
    	
    	nodes.forEach(function(node) {
    		hasNodes = YES;
    		nodesForDeletionText = nodesForDeletionText + "* " + node.get('guiPath') + "\n"; 
    	}, this);
    	
    	if (hasNodes) {
    		var description = "The Item will be permanently removed from the application along with its related data. \nThis action cannot be undone!\nThe following nodes and its subnodes will be deleted:\n" + nodesForDeletionText;
    		
	    	SC.AlertPane.warn({
	            message: "Are you sure you want to delete the selected Items from the Instrumentation Menu?",
	            description: description,
	            buttons: [ { title: "Delete" }, { title: "Cancel" } ],
	            delegate: EurekaJView.instrumentationTreeAdminTreeController
	          });
    	} else {
    		SC.AlertPane.warn({
	            message: "You must select at least one node to delete.",
	            buttons: [ { title: "Cancel" } ],
	          });
    	}
    },
    
    confirmDeleteSelectedInstrumentationNodes: function() {
    	SC.Logger.log('confirmDeleteSelectedInstrumentationNodes');
    	var nodesForDeletion = [];
    	var nodes = EurekaJView.instrumentationTreeAdminTreeController.getSelectedNodes();
    	
    	nodes.forEach(function(node) {
    		nodesForDeletion.push(node.get('guiPath'));
    		node.set('isSelected', NO);
    	}, this);
    	
    	if (nodesForDeletion.length > 0) {
    		var requestStringJson = {
                'deleteInstrumentationMenuNodes': nodesForDeletion
            };

    		SC.Logger.log('confirmDeleteSelectedInstrumentationNodes: ' + requestStringJson);
    		
            SC.Request.postUrl('/instrumentationMenu').header({
                'Accept': 'application/json'
            }).json().send(requestStringJson);
    	}    	
    },

    updateEmailGroupsAction: function() {
        EurekaJView.emailAdministrationController.set('content', EurekaJView.EurekaJStore.find(EurekaJView.EmailGroupModel));
    },

    addNewEmailRecipientAction: function() {
        if (EurekaJView.emailRecipientsController.newEmailRecipientIsValid()) {
           var newEmailRecipient = EurekaJView.EurekaJStore.createRecord(EurekaJView.EmailRecipientModel, {emailAddress: EurekaJView.emailRecipientsController.get('newEmailRecipent')});
           EurekaJView.emailRecipientsController.set('newEmailRecipent', '');

           if (SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.ManyArray) ||
                SC.kindOf(EurekaJView.editEmailGroupController.get('emailAddresses'), SC.Array) ) {
               EurekaJView.editEmailGroupController.get('emailAddresses').pushObject(newEmailRecipient);
           } else {
               EurekaJView.editEmailGroupController.set('emailAddresses', [ newEmailRecipient ])
           }
        } else {
            SC.AlertPane.warn({
              message: "Unable to create new Email Address",
              description: "The Email Address must be unique for this Email Recipient Group, and contain at least 5 characters.",
              caption: "Try changing the Email Address."
            });	
        }
    },

    saveEmailAction: function() {
        //Commit all email Recipients that have changed
        EurekaJView.emailAdministrationController.get('content').forEach(function(emailRecipient) {
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