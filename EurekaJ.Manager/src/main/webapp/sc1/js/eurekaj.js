// ==========================================================================
// Project:   EurekaJView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @namespace

 My cool new app.  Describe your application.

 @extends SC.Object
 */
EurekaJView = SC.Application.create(
    /** @scope EurekaJView.prototype */ {

    NAMESPACE: 'EurekaJView',
    VERSION: '0.1.0',

    //Create the EurekaJ Store
    EurekaJStore: SC.Store.create({commitRecordsAutomatically: NO}).from('EurekaJView.EurekaJDataSource')
    //EurekaJStore: SC.Store.create().from(SC.Record.fixtures)
});


/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/controllers/administration_pane.js */
// ==========================================================================
// Project:   EurekaJView.administrationPaneController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.administrationPaneController = SC.ObjectController.create(
    /** @scope EurekaJView.administrationPaneController.prototype */ {

    alertTypes: [
        {'typeName': 'Greater Than', 'alertType': 'greater_than'},
        {'typeName': 'Equals', 'alertType': 'equals'},
        {'typeName': 'Less Than', 'alertType': 'less_than'}
    ]
});

/* >>>>>>>>>> BEGIN source/controllers/alert_administration.js */
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
    allowsMultipleSelection: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.alertName')  != undefined) {
            this.set('showEditAlertView', YES);
            EurekaJView.alertChartController.populate();
            //SC.Logger.log('alertAdministrationController Setting selection: ' + this.getPath('selection.firstObject.alertInstrumentationNode'));
       } else {
            this.set('showEditAlertView', NO);
        }
    }.observes('selection'),

    newAlertIsValid: function() {
        var newNameIsValid = (this.get('newAlertName') && this.get('newAlertName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(alert) {
            if (alert.get('alertName') == this.get('newAlertName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            EurekaJView.deleteSelectedAlertApprovedAction();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }
});

/* >>>>>>>>>> BEGIN source/controllers/alert_chart.js */
// ==========================================================================
// Project:   EurekaJView.alertChartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertChartController = SC.TreeController.create(
    /** @scope EurekaJView.alertChartController.prototype */ {

    allowsMultipleSelection: NO,

    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    }

});

/* >>>>>>>>>> BEGIN source/controllers/alert_notification.js */
// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertNotificationController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    allowsMultipleSelection: YES
})
;

/* >>>>>>>>>> BEGIN source/controllers/alert_selection_delegate.js */
// ==========================================================================
// Project:   EurekaJView.alertSelectionDelegateController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.alertSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        var getObjectAt = indexes.firstObject();
        var selectedItem = view.get('content').objectAt(getObjectAt);
        SC.Logger.log('EurekaJView.alertSelectionDelegate collectionViewShouldSelectIndexes selectedItem: ' + selectedItem);

        if (selectedItem.instanceOf(EurekaJView.AlertModel)) {
            this.closeOpenTreeNodes(view);


            //Set selected Instrumentation Node
            SC.Logger.log('Selected item is Alert Model!!');
            var instrumentationNodeForSelect = selectedItem.get('alertInstrumentationNode');
            SC.Logger.log('alertInstrumentationNode for select: ' + instrumentationNodeForSelect);

            var selectionSet = SC.SelectionSet.create();
            selectionSet.addObject(instrumentationNodeForSelect);
            selectionSet.forEach(function(adminTreeNode) {
                this.markNodeAndParentsAsExpanded(adminTreeNode, YES);
            }, this);

            EurekaJView.alertChartController.set('selection', selectionSet);

            //Set selected Email Notifications
            var emailNotificationsForSelect = selectedItem.get('alertNotifications');
            SC.Logger.log('emailNotificationsForSelect: ' + emailNotificationsForSelect);

            var emailNotificationSelectionSet = SC.SelectionSet.create();
            emailNotificationSelectionSet.addObjects(emailNotificationsForSelect);

            EurekaJView.alertNotificationController.set('selection', emailNotificationSelectionSet);
        }

        if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
            this.setSelectedChartNodes(view, indexes);
        }

        if (selectedItem.instanceOf(EurekaJView.EmailGroupModel)) {
            this.setSelectedEmailNotifications(view, indexes);
        }

        return indexes;
    },

    setSelectedChartNodes: function(view, indexes) {
        indexes.forEach(function(o) {
            SC.Logger.log('setSelectedChartNodes indexes o: '+ 0)
            var selectedItem = view.get('content').objectAt(o);
            SC.Logger.log('setSelectedChartNodes selectedItem: '+ selectedItem)
            if (selectedItem.instanceOf(EurekaJView.AdminstrationTreeModel)) {
                SC.Logger.log('Seting alertInstrumentationNode');
                EurekaJView.editAlertController.set('alertInstrumentationNode', selectedItem);
            }
        }, this);

    },

    setSelectedEmailNotifications: function(view, indexes){
        var selectionArray = [];

        indexes.forEach(function(o) {
            var selectedItem = view.get('content').objectAt(o);
            if (selectedItem.instanceOf(EurekaJView.EmailGroupModel)) {
                selectionArray.pushObject(selectedItem);
            }
        }, this);

        EurekaJView.editAlertController.set('alertNotifications', selectionArray);
    },

    markNodeAndParentsAsExpanded: function(treeModel, setExpanded) {
        if (treeModel != null) {
            parentNode = treeModel.get('parentPath');

            while (parentNode) {
                parentNode.set('treeItemIsExpanded', setExpanded);
                parentNode = parentNode.get('parentPath');
            }
        }
    },

    closeOpenTreeNodes: function(view) {
        SC.Logger.log(view.get('content'));
        SC.Logger.log(view.get('content').get('content'));

        SC.Logger.log(EurekaJView.alertAdministrationController.get('content'));

        view.get('content').get('content').forEach(function(adminTreeNode) {
            SC.Logger.log('adminTreeNode: ' + adminTreeNode);
            this.markNodeAndParentsAsExpanded(adminTreeNode.get('alertInstrumentationNode'), NO);
        }, this);
    }

});

/* >>>>>>>>>> BEGIN source/controllers/chart_grid.js */
// ==========================================================================
// Project:   EurekaJView.chartGridController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGridController = SC.ArrayController.create(
/** @scope EurekaJView.chartGridController.prototype */
{

    timer: null,
    selectedChartTimespan: 10,
    selectedChartResolution: 15,
    selectedChartFrom: SC.DateTime.create(),
    selectedChartTo: SC.DateTime.create(),
    selectedChartFromString: null,
    selectedChartToString: null,
    dateFormat: '%d/%m/%Y %H:%M',
    showHistoricalData: NO,
    nowShowingTab: null,
    orderBy: 'name',

    selectedTimeZoneOffset: null,
	selectedTimeZoneOffset: null,
	timezones: [
		{'timezoneName': 'UTC-12', 'timezoneValue': -12},
		{'timezoneName': 'UTC-11', 'timezoneValue': -11},
		{'timezoneName': 'UTC-10', 'timezoneValue': -10},
		{'timezoneName': 'UTC-9', 'timezoneValue': -9},
		{'timezoneName': 'UTC-8', 'timezoneValue': -8},
		{'timezoneName': 'UTC-7', 'timezoneValue': -7},
		{'timezoneName': 'UTC-6','timezoneValue': -6},
		{'timezoneName': 'UTC-5','timezoneValue': -5},
		{'timezoneName': 'UTC-4','timezoneValue': -4},
		{'timezoneName': 'UTC-3','timezoneValue': -3},
		{'timezoneName': 'UTC-2','timezoneValue': -2},
		{'timezoneName': 'UTC-1','timezoneValue': -1},
		{'timezoneName': 'UTC0','timezoneValue': 0},
		{'timezoneName': 'UTC+1','timezoneValue': 1},
		{'timezoneName': 'UTC+2','timezoneValue': 2},
		{'timezoneName': 'UTC+3','timezoneValue': 3},
		{'timezoneName': 'UTC+4','timezoneValue': 4},
		{'timezoneName': 'UTC+5','timezoneValue': -5},
		{'timezoneName': 'UTC+6','timezoneValue': 6},
		{'timezoneName': 'UTC+7','timezoneValue': -7},
		{'timezoneName': 'UTC+8','timezoneValue': -8},
		{'timezoneName': 'UTC+9','timezoneValue': -9},
		{'timezoneName': 'UTC+10','timezoneValue': 10},
		{'timezoneName': 'UTC+11','timezoneValue': 11},
		{'timezoneName': 'UTC+12','timezoneValue': 12}
	],

    init: function() {
        var fromDate = this.get('selectedChartFrom').advance({minute: -10});
        if (fromDate) {
            this.set('selectedChartFrom', fromDate);
        }
        this.generateChartStrings();

        this.set('selectedTimeZoneOffset', (-1 * new Date().getTimezoneOffset() / 60));
    },

    nowShowingTabChange: function() {
        SC.Logger.log('TAB CHANGED TO: ' + this.get('nowShowingTab'));
        if (this.get('nowShowingTab') === 'EurekaJView.HistoricalStatisticsOptionsView') {
            this.set('showHistoricalData', YES);
        } else if (this.get('nowShowingTab') === 'EurekaJView.LiveStatisticsOptionsView') {
            this.set('showHistoricalData', NO);
        }

        this.refreshData();
    }.observes('nowShowingTab'),

    generateChartStrings: function() {
        this.set('selectedChartFromString', this.generateChartString(this.get('selectedChartFrom')));
        this.set('selectedChartToString', this.generateChartString(this.get('selectedChartTo')));},

    selectedChartFromMsProperty: function() {
        this.get('selectedChartFrom').get('milliseconds');
    }.property(),

    selectedChartToMsProperty: function() {
        this.get('selectedChartTo').get('milliseconds');
    }.property(),

    generateChartString: function(date) {
        var fmt = this.get('dateFormat') || '%m/%d/%Y';
        var dateString = date ? date.toFormattedString(fmt) : "";
        return dateString;},

    refreshDataFromTimer: function() {
        if (this.get('showHistoricalData') === NO) {
            this.refreshData();
        }},

    refreshData: function() {
        if (this.get('content')) {
            this.get('content').forEach(function(item, index, enumerable) {
                item.refresh();
                if (item.get('table')) {
                	item.get('table').forEach(function(tableNode) {
                		tableNode.refresh();
                	}, this);
                }
            });
        }},

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.chartGridController,
                action: 'refreshDataFromTimer',
                interval: 15000,
                repeats: YES
            });
            this.set('timer', timer)
        }
	},

    observesChartTimespan: function() {
        if (this.get('showHistoricalData') === NO) {
            this.refreshData();
        }
    }.observes('selectedChartTimespan'),

    observesChartResolution: function() {
        if (this.get('showHistoricalData') === NO) {
            this.refreshData();
        }
    }.observes('selectedChartResolution')
});

/* >>>>>>>>>> BEGIN source/controllers/chart_groups/chart_group_selection_delegate.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGroupSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.alertSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        SC.Logger.log('EurekaJView.chartGroupSelectionDelegate collectionViewShouldSelectIndexes');
        var getObjectAt = indexes.firstObject();
        var selectedItem = view.get('content').objectAt(getObjectAt);

        //Select an Instrumentation Group
        if (selectedItem.instanceOf(EurekaJView.InstrumentationGroupModel)) {
            this.closeOpenTreeNodes(view);
        }

        return indexes;
    },

    markNodeAndParentsAsExpanded: function(treeModel, setExpanded) {
        parentNode = treeModel.get('parentPath');

        while (parentNode) {
            parentNode.set('treeItemIsExpanded', setExpanded);
            parentNode = parentNode.get('parentPath');
        }
    },

    closeOpenTreeNodes: function(view) {
        //Deselecting all selected nodes and closing parent nodes
        view.get('content').forEach(function(node) {
            selectedNodes = node.get('instrumentationGroupPath');
            selectedNodes.forEach(function(adminTreeNode) {
                SC.Logger.log('Deselecting: ' + adminTreeNode.get('guiPath'));
                //adminTreeNode.set('isSelected', NO);
                this.markNodeAndParentsAsExpanded(adminTreeNode, NO);
            }, this);
        }, this);
    }


});

/* >>>>>>>>>> BEGIN source/controllers/chart_groups/chart_groups_admin_controller.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGroupsAdminController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {

    newInstrumentationGroupName: null,
    allowsMultipleSelection: NO,
    showEditInstrumentationGroupView: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.instrumentaionGroupName')  != undefined) {
            this.set('showEditInstrumentationGroupView', YES);
            EurekaJView.chartGroupChartsTreeController.populate();
        } else {
            this.set('showEditInstrumentationGroupView', NO);
        }
    }.observes('selection'),

    newChartGroupIsValid: function() {
        var newNameIsValid = (this.get('newInstrumentationGroupName') && this.get('newInstrumentationGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(chartGroup) {
            if (chartGroup.get('instrumentaionGroupName') == this.get('newInstrumentationGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            EurekaJView.deleteSelectedChartGroupApprovedAction();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }

});

/* >>>>>>>>>> BEGIN source/controllers/chart_groups/chartGroupChartsTreeController.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGroupChartsTreeController = SC.TreeController.create(
    /** @scope EurekaJView.instumentationGroupChartController.prototype */ {

    allowsMultipleSelection: YES,


    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    }

});

/* >>>>>>>>>> BEGIN source/controllers/chart_groups/selectedChartGroupChartsController.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.selectedChartGroupChartsController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {
    contentBinding: 'EurekaJView.selectedChartGroupController.instrumentationGroupPath'
});
/* >>>>>>>>>> BEGIN source/controllers/chart_groups/selectedChartGroupController.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.selectedChartGroupController = SC.ObjectController.create(
    /** @scope EurekaJView.editInstrumentationGroupController.prototype */ {

    contentBinding: 'EurekaJView.chartGroupsAdminController.selection'

});

/* >>>>>>>>>> BEGIN source/controllers/edit_alert.js */
// ==========================================================================
// Project:   EurekaJView.editAlertController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.editAlertController = SC.ObjectController.create(
    /** @scope EurekaJView.editAlertController.prototype */ {

    contentBinding: 'EurekaJView.alertAdministrationController.selection'
});

/* >>>>>>>>>> BEGIN source/controllers/edit_email_group.js */
// ==========================================================================
// Project:   EurekaJView.editAlertController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.editEmailGroupController = SC.ObjectController.create(
    /** @scope EurekaJView.editAlertController.prototype */ {

    contentBinding: 'EurekaJView.emailAdministrationController.selection'
});

/* >>>>>>>>>> BEGIN source/controllers/email_administration.js */
// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.emailAdministrationController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newEmailGroupName: null,
    showEditAlertView: NO,
    allowsMultipleSelection: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.emailGroupName')  != undefined) {
            this.set('showEditAlertView', YES);
       } else {
            this.set('showEditAlertView', NO);
        }
    }.observes('selection'),

    newEmailRecipientIsValid: function() {
        var newNameIsValid = (this.get('newEmailGroupName') && this.get('newEmailGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(emailRecipient) {
            if (emailRecipient.get('emailGroupName') == this.get('newEmailGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            EurekaJView.deleteSelectedEmailGroupApprovedAction();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }
});

/* >>>>>>>>>> BEGIN source/controllers/email_recipients.js */
// ==========================================================================
// Project:   EurekaJView.alertAdministrationController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.emailRecipientsController = SC.ArrayController.create(
    /** @scope EurekaJView.alertAdministrationController.prototype */ {

    newEmailRecipent: null,

    contentBinding: 'EurekaJView.editEmailGroupController.emailAddresses',
    
    newEmailRecipientIsValid: function() {
        var newEmailIsValid = (this.get('newEmailRecipent') && this.get('newEmailRecipent').length >= 5);

        var unique = true;
        this.get('content').forEach(function(emailAddress) {
            if (emailAddress.get('emailAddress') == this.get('newEmailRecipent')) {
                unique = false;
            }
        }, this);

        return unique && newEmailIsValid;
    }
})
;

/* >>>>>>>>>> BEGIN source/controllers/instrumentation_tree.js */
// ==========================================================================
// Project:   EurekaJView.instrumentationTreeController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.InstrumentationTreeController = SC.TreeController.create(
/** @scope EurekaJView.instrumentationTreeController.prototype */
{
    timer: null,
    selectedInstrumentationTypePath: null,
    treeItemIsGrouped: YES,
    allowsMultipleSelection: YES,

    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.InstrumentationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    },

    observesSelection: function() {
        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.guiPath')) {
            this.set('selectedInstrumentationTypePath', this.getPath('selection.firstObject.guiPath'));
            SC.Logger.log('InstrumentationTreeController observesSelection: ' + this.getPath('selection.firstObject.guiPath'));
			SC.Logger.log('Available Chart grids: ' + this.getPath('selection').getEach('chartGrid'));
            //EurekaJView.chartGridController.set('content', this.getPath('selection').getEach('chartGrid'));
        }
    }.observes('selection'),

    refreshData: function() {
        SC.Logger.log('Refreshing Instrumentation Menu');
        EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY).refresh();
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.InstrumentationTreeController,
                action: 'refreshData',
                interval: 60000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    }
});

/* >>>>>>>>>> BEGIN source/controllers/instumentation_group_chart.js */
// ==========================================================================
// Project:   EurekaJView.instumentationGroupChartController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.instumentationGroupChartController = SC.TreeController.create(
    /** @scope EurekaJView.instumentationGroupChartController.prototype */ {

    allowsMultipleSelection: YES,


    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    }

});

/* >>>>>>>>>> BEGIN source/controllers/tree_menu_selection_delegate.js */
// ==========================================================================
// Project:   EurekaJView.treeMenuSelectionDelegate
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.treeMenuSelectionDelegate = SC.Object.create(SC.CollectionViewDelegate,
    /** @scope EurekaJView.treeMenuSelectionDelegate.prototype */ {

    collectionViewShouldSelectIndexes: function (view, indexes, extend) {
        SC.Logger.log('SELECTING: ' + view.get('selection').get('length'));

        this.showSelectedCharts(view, indexes);

        return indexes;
    },

    collectionViewShouldDeselectIndexes: function (view, indexes) {
        SC.Logger.log('DESELECTING: ' + view.get('selection').get('length'));

        if (view.get('selection').get('length') > 1) {
            //this.showSelectedCharts(view, indexes);
        } else {
            EurekaJView.chartGridController.set('content', SC.SelectionSet.create());
        }

        return indexes;

    },

    showSelectedCharts: function(view, indexes) {
        var selectionSet = SC.SelectionSet.create();

            indexes.forEach(function(o) {
                SC.Logger.log('forEach: ' + o);
                var selectedItem = view.get('content').objectAt(o);
                if (selectedItem.instanceOf(EurekaJView.InstrumentationTreeModel)) {
                    var chartGridForSelect = selectedItem.get('chartGrid');
                    if (chartGridForSelect) {
                        selectionSet.addObjects(chartGridForSelect);
                    }
                }
            }, this);

        EurekaJView.chartGridController.set('content', selectionSet);
    }


});

/* >>>>>>>>>> BEGIN source/controllers/triggeredAlertListController.js */
// ==========================================================================
// Project:   EurekaJView.triggeredAlertListController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.triggeredAlertListController = SC.ArrayController.create(
    /** @scope EurekaJView.triggeredAlertListController.prototype */ {

    timer: null,

    refreshData: function() {
        EurekaJView.EurekaJStore.find(EurekaJView.TRIGGERED_ALERTS_QUERY).refresh();
    },

    triggerTimer: function() {
        SC.Logger.log('Triggering timer');
        if (this.get('timer')) {
            SC.Logger.log('Timer already started');
        } else {
            this.set('content', EurekaJView.EurekaJStore.find(EurekaJView.TRIGGERED_ALERTS_QUERY));
            SC.Logger.log('Starting Timer');
            var timer = SC.Timer.schedule({
                target: EurekaJView.triggeredAlertListController,
                action: 'refreshData',
                interval: 15000,
                repeats: YES
            });
            this.set('timer', timer)
        }
    },

    observesContent: function() {
        SC.Logger.log('triggeredAlertListController observesContent: ' + this.get('content') + 'size: ' + this.get('content').toArray().length)

        this.get('content').forEach(function(triggeredAlert) {
            SC.Logger.log('triggeredAlert: ' + triggeredAlert);
        });
    }//.observes('content')
});

/* >>>>>>>>>> BEGIN source/controllers/user/user_controller.js */
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.userController = SC.ObjectController.create(
        /** @scope EurekaJView.administrationPaneController.prototype */ {

            username: null,
            userRole: null,

            isAdmin: function() {
                SC.Logger.log('userRole: ' + this.get('userRole'));

                if (this.get('userRole') != null && this.get('userRole') == 'admin') {
                    return YES;
                } else {
                    return NO;
                }
            }.property().cacheable(),

            observesUserRole: function() {
                if (this.get('isAdmin')) {
                    EurekaJView.mainPage.get('topView').get('administrationButtonView').set('isVisible', YES);
                    EurekaJView.mainPage.get('topView').get('administrationLabelView').set('isVisible', YES);
                }
            }.observes('userRole')
        });

/* >>>>>>>>>> BEGIN source/core_action.js */
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
/* >>>>>>>>>> BEGIN source/core_statechart.js */
/*globals EurekaJView */

EurekaJView.statechart = SC.Statechart.create({

    rootState: SC.State.design({
        substatesAreConcurrent: YES,

        enterState: function() {
            EurekaJView.EurekaJStore.find(EurekaJView.LOGGED_IN_USER_QUERY);
        },

        showingTreePanel: SC.State.plugin('EurekaJView.showingTreePanel'),

		showingChartPanel: SC.State.plugin('EurekaJView.showingChartPanel'),

        showingInformationPanel: SC.State.plugin('EurekaJView.showingInformationPanel'),

        showingTopPanel: SC.State.plugin('EurekaJView.showingTopPanel')
    })
});
/* >>>>>>>>>> BEGIN source/models/instrumentation_tree_model.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationTreeModel = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTreeModel.prototype */
{

    primaryKey: 'guiPath',
    guiPath: SC.Record.attr(String),

    name: SC.Record.attr(String),
    isSelected: SC.Record.attr(Boolean),
    parentPath: SC.Record.attr(String),
    hasChildren: SC.Record.attr(Boolean),
    treeItemIsExpanded: NO,
    childrenNodes: SC.Record.toMany('EurekaJView.InstrumentationTreeModel'),
	chartGrid: SC.Record.toMany('EurekaJView.ChartGridModel'),
    nodeType: SC.Record.attr(String),

    treeItemChildren: function() {
        if (this.get('childrenNodes').toArray().length === 0) {
            return null;
        } else {
            return this.get('childrenNodes');
        }
    }.property(),

    itemIcon: function() {
        if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "chart") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_chart_16.png';
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "alert") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_chart_alert_16.png';
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "groupedStatistics") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_groupedstats_16.png';
        } else {
            return null;
        }
    }.property(),

    checkboxKey: function() {
        if (this.get('parentPath')) {
            return 'isSelected';
        } else {
            return null;
        }
    }.property()


});

/* >>>>>>>>>> BEGIN source/models/triggered_alert_model.js */
// ==========================================================================
// Project:   EurekaJView.TriggeredAlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.TriggeredAlertModel = SC.Record.extend(
/** @scope EurekaJView.TriggeredAlertModel.prototype */ {

    primaryKey: 'generatedID',
    generatedID: SC.Record.attr(Number),
    alertName: SC.Record.attr(String),
    triggeredDate: SC.Record.attr(Number),
    errorValue: SC.Record.attr(Number),
    warningValue: SC.Record.attr(Number),
    triggeredValue: SC.Record.attr(Number),
    
    formattedTriggeredDate: function() {
    	var datetime = SC.DateTime.create(this.get('triggeredDate'));
    	return datetime.toFormattedString("%d/%m/%Y %H:%M:%S");
    }.property('triggeredDate'),
    
    alertType: function() {
    	var alertType = 'NORMAL';
        if (this.get('triggeredValue') >= this.get('errorValue')) {
            alertType = 'CRITICAL';
        } else if (this.get('triggeredValue') >= this.get('warningValue')) {
            alertType = 'WARNING';
        }
        
        return alertType;
    }.property('triggeredValue'),
    
    summaryContent: function() {
        var datetime = SC.DateTime.create(this.get('triggeredDate'));
        var alertType = this.get('alertType');
        return  this.get('alertName') + ' ' + alertType + " " + datetime.toFormattedString("%d/%m/%Y %H:%M:%S") + " " + this.get('errorValue') + " " + this.get('warningValue') + " " + this.get('triggeredValue');
    }.property('generatedID').cacheable()
});

/* >>>>>>>>>> BEGIN source/data_sources/eureka_j.js */
// ==========================================================================
// Project:   EurekaJView.EurekaJDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Data Source Here)

 @extends SC.DataSource
 */
sc_require('models/instrumentation_tree_model.js');
sc_require('models/triggered_alert_model.js');
EurekaJView.INSTRUMENTATION_TREE_QUERY = SC.Query.local(EurekaJView.InstrumentationTreeModel, {
    orderby: 'guiPath'
});
EurekaJView.ADMINISTRATION_TREE_QUERY = SC.Query.local(EurekaJView.AdminstrationTreeModel, {
    orderby: 'guiPath'
});

EurekaJView.ALERTS_QUERY = SC.Query.local(EurekaJView.AlertModel, {
    orderby: 'alertName'
});

EurekaJView.INSTRUMENTATION_GROUPS_QUERY = SC.Query.local(EurekaJView.InstrumentationGroupModel, {
    orderby: 'instrumentaionGroupName'
});

EurekaJView.EMAIL_GROUPS_QUERY = SC.Query.local(EurekaJView.EmailGroupModel, {
    orderby: 'emailGroupName'
});

EurekaJView.TRIGGERED_ALERTS_QUERY = SC.Query.local(EurekaJView.TriggeredAlertModel, {
    orderby: 'triggeredDate'
});

EurekaJView.INSTRUMENTATION_TABLE_QUERY = SC.Query.local(EurekaJView.InstrumentationTableModel, {
    orderby: 'name'
});

EurekaJView.LOGGED_IN_USER_QUERY = SC.Query.local(EurekaJView.UserModel, {});

EurekaJView.EurekaJDataSource = SC.DataSource.extend(
/** @scope EurekaJView.EurekaJDataSource.prototype */
{

    // ..........................................................
    // QUERY SUPPORT
    // 
    fetch: function(store, query) {
        SC.Logger.log('Calling fetch... ' + query.conditions);
        if (query === EurekaJView.INSTRUMENTATION_TREE_QUERY) {
            SC.Logger.log('fetching the tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'instrumentationMenu',
                'includeCharts': true
            };

            SC.Request.postUrl('/instrumentationMenu').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ADMINISTRATION_TREE_QUERY) {
            SC.Logger.log('fetching the Administration tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'administrationMenu',
                'includeCharts': true,
                'nodeType' : 'chart'
            };

            SC.Request.postUrl('/instrumentationMenu').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAdminTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ALERTS_QUERY) {
            SC.Logger.log('fetching alerts...');
            var requestStringJson = {
                'getAlerts': true
            };

            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAlerts', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.INSTRUMENTATION_GROUPS_QUERY) {
            SC.Logger.log('fetching instrumentation groups...');
            var requestStringJson = {
                'getInstrumentationGroups': true
            };

            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationGroups', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.EMAIL_GROUPS_QUERY) {
            SC.Logger.log('fetching email groups...');
            var requestStringJson = {
                'getEmailGroups': true
            };

            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchEmailGroups', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.TRIGGERED_ALERTS_QUERY) {
            SC.Logger.log('fetching triggered alerts...');
            var requestStringJson = {
                'getTriggeredAlerts': true
            };

            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchTriggeredAlerts', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.LOGGED_IN_USER_QUERY) {
            SC.Logger.log('fetching logged in user...');
            var requestStringJson = {
                'getLoggedInUser': true
            };

            SC.Request.postUrl('/user').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchLoggedInUser', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.INSTRUMENTATION_TABLE_QUERY) {
            SC.Logger.log('fetching instrumentation Table...');
            var requestStringJson = {
                'getLoggedInUser': true
            };

            SC.Request.postUrl('/user').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchLoggedInUser', store, query).send(requestStringJson);

            return YES;
        }


        return NO; // return YES if you handled the query
    },

    performFetchInstrumentationTreeMenu: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Tree menu fetched');
            store.loadRecords(EurekaJView.InstrumentationTreeModel, response.get('body').instrumentationMenu);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchAdminTreeMenu: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Admin tree fetched');
            store.loadRecords(EurekaJView.AdminstrationTreeModel, response.get('body').administrationMenu);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchAlerts: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Alerts Fetched');
            store.loadRecords(EurekaJView.AlertModel, response.get('body').alerts);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchInstrumentationGroups: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Instrumentation Groups Fetched');
            store.loadRecords(EurekaJView.InstrumentationGroupModel, response.get('body').instrumentationGroups);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchEmailGroups: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Email Groups Fetched');
            store.loadRecords(EurekaJView.EmailGroupModel, response.get('body').emailGroups);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchTriggeredAlerts: function(response, store, query) {
        if (SC.ok(response)) {
            store.loadRecords(EurekaJView.TriggeredAlertModel, response.get('body').triggeredAlerts);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchLoggedInUser: function(response, store, query) {
        SC.Logger.log(response.body);
        var results = "";
        if (SC.ok(response) && SC.ok(results = response.get('body'))) {
            SC.Logger.log('user: ' + response.get('body'));
            SC.Logger.log('results: ' + results);
            EurekaJView.userController.set('username', response.get('body').loggedInUser.username);
            EurekaJView.userController.set('userRole', response.get('body').loggedInUser.userRole);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    // ..........................................................
    // RECORD SUPPORT
    // 
    retrieveRecord: function(store, storeKey) {
        var recordType = SC.Store.recordTypeFor(storeKey);
        SC.Logger.log('Calling retrieveRecord for...' + recordType + ' with storeKey: ' + storeKey);

        if (recordType === EurekaJView.ChartGridModel) {
            SC.Logger.log("Getting Chart Grid Model");
            var requestStringJson = {};

            if (EurekaJView.chartGridController.get('showHistoricalData') === NO) {
                requestStringJson = {
                    'getInstrumentationChartData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartTimespan': EurekaJView.chartGridController.selectedChartTimespan,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            } else {
                var fromMs = EurekaJView.chartGridController.selectedChartFrom.get('milliseconds');
                var toMs = EurekaJView.chartGridController.selectedChartTo.get('milliseconds');
                requestStringJson = {
                    'getInstrumentationChartData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartFrom': fromMs,
                        'chartTo': toMs,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            }

            SC.Request.postUrl('/chart').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveChartGridRecord, {
                                                                            store: store,
                                                                            storeKey: storeKey
                                                                        }).send(requestStringJson);

            return YES;

        }

        if (recordType === EurekaJView.EmailRecipientModel) {
            SC.Logger.log("Getting Email Recipient Model");
            var requestStringJson = {
                'getEmailRecipient': SC.Store.idFor(storeKey)
            };

            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveEmailRecipientRecord, {
                                                                                 store: store,
                                                                                 storeKey: storeKey
                                                                             }).send(requestStringJson);

            return YES;
        }

        if (recordType === EurekaJView.InstrumentationTableModel) {
            SC.Logger.log("Getting Instrumentation Table Model...");
            var requestStringJson = {};

            if (EurekaJView.chartGridController.get('showHistoricalData') === NO) {
                requestStringJson = {
                    'getInstrumentationTableData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartTimespan': EurekaJView.chartGridController.selectedChartTimespan,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            } else {
                var fromMs = EurekaJView.chartGridController.selectedChartFrom.get('milliseconds');
                var toMs = EurekaJView.chartGridController.selectedChartTo.get('milliseconds');
                requestStringJson = {
                    'getInstrumentationTableData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartFrom': fromMs,
                        'chartTo': toMs,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            }

            SC.Request.postUrl('/table').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveTableRecord, {
                                                                                 store: store,
                                                                                 storeKey: storeKey
                                                                             }).send(requestStringJson);

            return YES;
        }

        return NO; // return YES if you handled the storeKey
    },

    performRetrieveChartGridRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading ChartGridRecord');
            //SC.Logger.log(response.get('body').data);
            EurekaJView.chartGridController.triggerTimer();
            store.dataSourceDidComplete(storeKey, response.get('body'));
            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    performRetrieveTableRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading Instrumentation Table');
            //SC.Logger.log(response.get('body').data);
            EurekaJView.chartGridController.triggerTimer();
            store.dataSourceDidComplete(storeKey, response.get('body'));
            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    performRetrieveEmailRecipientRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading Email Recipient');
            store.dataSourceDidComplete(storeKey, response.get('body'));

            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    createRecord: function(store, storeKey) {
        SC.Logger.log('Calling createRecord... ');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.InstrumentationGroupModel)) {
            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateInstrumentationGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.EmailGroupModel)) {
            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateEmailGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        return NO; // return YES if you handled the storeKey
    },

    didCreateAlert: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didCreateInstrumentationGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didCreateEmailGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    updateRecord: function(store, storeKey) {
        SC.Logger.log('Calling updateRecord...');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.InstrumentationGroupModel)) {
            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateInstrumentationGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.EmailGroupModel)) {
            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateEmailGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        return NO; // return YES if you handled the storeKey
    },

    didUpdateAlert: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
            store.dataSourceDidComplete(storeKey, data);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didUpdateInstrumentationGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
            store.dataSourceDidComplete(storeKey, data);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didUpdateEmailGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
            store.dataSourceDidComplete(storeKey, data);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    destroyRecord: function(store, storeKey) {
        SC.Logger.log('Calling destroyRecord...');
        
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
        	var requestStringJson = {
                    'deleteAlert': store.idFor(storeKey)
                };
        	
        	SC.Request.postUrl("/alert").header({
                'Accept': 'application/json'
            }).json().notify(this, this.didDestroyAlert, store, storeKey).send(requestStringJson);
    
        	
        	return YES;
        }
        
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.InstrumentationGroupModel)) {
        	var requestStringJson = {
                    'deleteChartGroup': store.idFor(storeKey)
                };
        	
        	SC.Request.postUrl("/instrumentationGroup").header({
                'Accept': 'application/json'
            }).json().notify(this, this.didDestroyAlert, store, storeKey).send(requestStringJson);
    
        	
        	return YES;
        }
        
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.EmailGroupModel)) {
        	var requestStringJson = {
                    'deleteEmailGroup': store.idFor(storeKey)
                };
        	
        	SC.Request.postUrl("/email").header({
                'Accept': 'application/json'
            }).json().notify(this, this.didDestroyAlert, store, storeKey).send(requestStringJson);
    
        	
        	return YES;
        }
        
        
        return NO; // return YES if you handled the storeKey
    },
    
    didDestroyAlert: function(response, store, storeKey) {
    	if (SC.ok(response)) {
    		store.dataSourceDidDestroy(storeKey);
    	} else {
    		store.dataSourceDidError(response);
    	}
	}

});

/* >>>>>>>>>> BEGIN source/models/adminstration_tree_model.js */
// ==========================================================================
// Project:   EurekaJView.AdminstrationTreeModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.AdminstrationTreeModel = SC.Record.extend(
/** @scope EurekaJView.AdminstrationTreeModel.prototype */
{

    primaryKey: 'guiPath',
    guiPath: SC.Record.attr(String),
    nodeType: SC.Record.attr(String),

    name: SC.Record.attr(String),
    isSelected: SC.Record.attr(Boolean),
    parentPath: SC.Record.toOne('EurekaJView.AdminstrationTreeModel', {isMaster: YES }),

    hasChildren: SC.Record.attr(Boolean),
    treeItemIsExpanded: NO,

    childrenNodes: SC.Record.toMany('EurekaJView.AdminstrationTreeModel'),
	chartGrid: SC.Record.toMany('EurekaJView.ChartGridModel'),

    treeItemChildren: function() {
        if (this.get('childrenNodes').toArray().length === 0) {
            return null;
        } else {
            return this.get('childrenNodes');
        }
    }.property(),

    itemIcon: function() {
        if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "chart") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_chart_16.png';
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "alert") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_chart_alert_16.png';
        } else if (!this.get('hasChildren') && SC.compare(this.get('nodeType'), "groupedStatistics") == 0) {
            return '/static/EurekaJView/en/eurekajview/source/resources/images/ej_groupedstats_16.png';
        } else {
            return null;
        }
    }.property(),

    checkboxKey: function() {
        if (!this.get('hasChildren')) {
            return 'isSelected';
        } else {
            return null;
        }
    }.property()

}) ;

/* >>>>>>>>>> BEGIN source/models/alert_model.js */
// ==========================================================================
// Project:   EurekaJView.AlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.AlertModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'alertName',
    alertName: SC.Record.attr(String),
    alertActivated: SC.Record.attr(Boolean),
    alertInstrumentationNode: SC.Record.toOne('EurekaJView.AdminstrationTreeModel', {isMaster: YES }),
    alertNotifications: SC.Record.toMany('EurekaJView.EmailGroupModel', {isMaster: YES}),
    alertWarningValue: SC.Record.attr(Number),
    alertErrorValue: SC.Record.attr(Number),
    alertType: SC.Record.attr(String),
    alertDelay: SC.Record.attr(Number)
}) ;

/* >>>>>>>>>> BEGIN source/models/chart_data_model.js */
// ==========================================================================
// Project:   EurekaJView.ChartGridModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.ChartDataModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'chartDataKey',
    chartDataKey: SC.Record.attr(String),
    chartDataX: SC.Record.attr(Number),
    chartDataY: SC.Record.attr(Number),

    flotData: function() {
        SC.Logger.log('building up flotData JSON');
        var flotDataArray = [];
        flotDataArray.push(this.get('chartDataX'));
        flotDataArray.push(this.get('chartDataY'));
    }.property('chartDataX', 'chartDataY').cacheable()

}) ;

/* >>>>>>>>>> BEGIN source/models/chart_grid_model.js */
// ==========================================================================
// Project:   EurekaJView.ChartGridModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.ChartGridModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'instrumentationNode',
    chart: SC.Record.attr(Array),
    instrumentationNode: SC.Record.attr(String),
    table: SC.Record.toMany('EurekaJView.InstrumentationTableModel'),

    isChart:  function() {
        SC.Logger.log("isChart: " + this.get('chart'))
        if ((this.get('chart'))) {
            return true;
        }

        return false;
    }.property(),

    isTable:  function() {
        SC.Logger.log("isTable: " + this.get('table'))
        var isTableBoolean = false;
        this.get('table').forEach(function(o) {
            isTableBoolean = true;
        }, this);

        return isTableBoolean;
    }.property()
});

/* >>>>>>>>>> BEGIN source/models/chart_series_model.js */
// ==========================================================================
// Project:   EurekaJView.ChartGridModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.ChartSeriesModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'label',
    data: SC.Record.attr(Array, {defaultValue: []}),
    label: SC.Record.attr(String, {defaultValue: 'Series Loading...'}),

    flotSeries: [{'label': 'Series Loading'}],

    observesData: function() {
        SC.Logger.log('building up flotSeries JSON: ' + this.get('data'));
        /*var dataArray = [];

        this.get('data').forEach(function(currData) {
            dataArray.push(currData.get('flotData'));
        }, this);*/

        var flotSeriesJson = {   'label': this.get('label'),
                                'data': this.get('data')
                             };
        this.set('flotSeries', flotSeriesJson);
    }.observes('data')

}) ;

/* >>>>>>>>>> BEGIN source/models/email_group_model.js */
// ==========================================================================
// Project:   EurekaJView.AlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.EmailGroupModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'emailGroupName',
    emailGroupName: SC.Record.attr(String),
    smtpHost: SC.Record.attr(String),
    smtpUsername: SC.Record.attr(String),
    smtpPassword: SC.Record.attr(String),
    smtpPort: SC.Record.attr(Number),
    smtpUseSSL: SC.Record.attr(Boolean),
    emailAddresses: SC.Record.toMany('EurekaJView.EmailRecipientModel', {isMaster: YES })
});

/* >>>>>>>>>> BEGIN source/models/email_recipient_model.js */
// ==========================================================================
// Project:   EurekaJView.AlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.EmailRecipientModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'emailAddress',
    emailAddress: SC.Record.attr(String)
});

/* >>>>>>>>>> BEGIN source/models/instrumentation_group_model.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationGroupModel
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document your Model here)

 @extends SC.Record
 @version 0.1
 */
EurekaJView.InstrumentationGroupModel = SC.Record.extend(
    /** @scope EurekaJView.InstrumentationGroupModel.prototype */ {

    primaryKey: 'instrumentaionGroupName',
    instrumentaionGroupName: SC.Record.attr(String),
    instrumentationGroupPath: SC.Record.toMany('EurekaJView.AdminstrationTreeModel', {isMaster: YES })

});

/* >>>>>>>>>> BEGIN source/models/instrumentation_table_model.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationTableModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationTableModel = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTableModel.prototype */
{

    primaryKey: 'columnId',
    columnId: SC.Record.attr(String),
    name: SC.Record.attr(String),
    value: SC.Record.attr(Number),

    listValue: function() {
        return this.get('name') + ' avg: ' + this.get('value');
    }.property()
});

/* >>>>>>>>>> BEGIN source/resources/date.js */
/**
 * Version: 1.0 Alpha-1 
 * Build Date: 13-Nov-2007
 * Copyright (c) 2006-2007, Coolite Inc. (http://www.coolite.com/). All rights reserved.
 * License: Licensed under The MIT License. See license.txt and http://www.datejs.com/license/. 
 * Website: http://www.datejs.com/ or http://www.coolite.com/datejs/
 */
Date.CultureInfo={name:"en-US",englishName:"English (United States)",nativeName:"English (United States)",dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],abbreviatedDayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],shortestDayNames:["Su","Mo","Tu","We","Th","Fr","Sa"],firstLetterDayNames:["S","M","T","W","T","F","S"],monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],abbreviatedMonthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],amDesignator:"AM",pmDesignator:"PM",firstDayOfWeek:0,twoDigitYearMax:2029,dateElementOrder:"mdy",formatPatterns:{shortDate:"M/d/yyyy",longDate:"dddd, MMMM dd, yyyy",shortTime:"h:mm tt",longTime:"h:mm:ss tt",fullDateTime:"dddd, MMMM dd, yyyy h:mm:ss tt",sortableDateTime:"yyyy-MM-ddTHH:mm:ss",universalSortableDateTime:"yyyy-MM-dd HH:mm:ssZ",rfc1123:"ddd, dd MMM yyyy HH:mm:ss GMT",monthDay:"MMMM dd",yearMonth:"MMMM, yyyy"},regexPatterns:{jan:/^jan(uary)?/i,feb:/^feb(ruary)?/i,mar:/^mar(ch)?/i,apr:/^apr(il)?/i,may:/^may/i,jun:/^jun(e)?/i,jul:/^jul(y)?/i,aug:/^aug(ust)?/i,sep:/^sep(t(ember)?)?/i,oct:/^oct(ober)?/i,nov:/^nov(ember)?/i,dec:/^dec(ember)?/i,sun:/^su(n(day)?)?/i,mon:/^mo(n(day)?)?/i,tue:/^tu(e(s(day)?)?)?/i,wed:/^we(d(nesday)?)?/i,thu:/^th(u(r(s(day)?)?)?)?/i,fri:/^fr(i(day)?)?/i,sat:/^sa(t(urday)?)?/i,future:/^next/i,past:/^last|past|prev(ious)?/i,add:/^(\+|after|from)/i,subtract:/^(\-|before|ago)/i,yesterday:/^yesterday/i,today:/^t(oday)?/i,tomorrow:/^tomorrow/i,now:/^n(ow)?/i,millisecond:/^ms|milli(second)?s?/i,second:/^sec(ond)?s?/i,minute:/^min(ute)?s?/i,hour:/^h(ou)?rs?/i,week:/^w(ee)?k/i,month:/^m(o(nth)?s?)?/i,day:/^d(ays?)?/i,year:/^y((ea)?rs?)?/i,shortMeridian:/^(a|p)/i,longMeridian:/^(a\.?m?\.?|p\.?m?\.?)/i,timezone:/^((e(s|d)t|c(s|d)t|m(s|d)t|p(s|d)t)|((gmt)?\s*(\+|\-)\s*\d\d\d\d?)|gmt)/i,ordinalSuffix:/^\s*(st|nd|rd|th)/i,timeContext:/^\s*(\:|a|p)/i},abbreviatedTimeZoneStandard:{GMT:"-000",EST:"-0400",CST:"-0500",MST:"-0600",PST:"-0700"},abbreviatedTimeZoneDST:{GMT:"-000",EDT:"-0500",CDT:"-0600",MDT:"-0700",PDT:"-0800"}};
Date.getMonthNumberFromName=function(name){var n=Date.CultureInfo.monthNames,m=Date.CultureInfo.abbreviatedMonthNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s){return i;}}
return-1;};Date.getDayNumberFromName=function(name){var n=Date.CultureInfo.dayNames,m=Date.CultureInfo.abbreviatedDayNames,o=Date.CultureInfo.shortestDayNames,s=name.toLowerCase();for(var i=0;i<n.length;i++){if(n[i].toLowerCase()==s||m[i].toLowerCase()==s){return i;}}
return-1;};Date.isLeapYear=function(year){return(((year%4===0)&&(year%100!==0))||(year%400===0));};Date.getDaysInMonth=function(year,month){return[31,(Date.isLeapYear(year)?29:28),31,30,31,30,31,31,30,31,30,31][month];};Date.getTimezoneOffset=function(s,dst){return(dst||false)?Date.CultureInfo.abbreviatedTimeZoneDST[s.toUpperCase()]:Date.CultureInfo.abbreviatedTimeZoneStandard[s.toUpperCase()];};Date.getTimezoneAbbreviation=function(offset,dst){var n=(dst||false)?Date.CultureInfo.abbreviatedTimeZoneDST:Date.CultureInfo.abbreviatedTimeZoneStandard,p;for(p in n){if(n[p]===offset){return p;}}
return null;};Date.prototype.clone=function(){return new Date(this.getTime());};Date.prototype.compareTo=function(date){if(isNaN(this)){throw new Error(this);}
if(date instanceof Date&&!isNaN(date)){return(this>date)?1:(this<date)?-1:0;}else{throw new TypeError(date);}};Date.prototype.equals=function(date){return(this.compareTo(date)===0);};Date.prototype.between=function(start,end){var t=this.getTime();return t>=start.getTime()&&t<=end.getTime();};Date.prototype.addMilliseconds=function(value){this.setMilliseconds(this.getMilliseconds()+value);return this;};Date.prototype.addSeconds=function(value){return this.addMilliseconds(value*1000);};Date.prototype.addMinutes=function(value){return this.addMilliseconds(value*60000);};Date.prototype.addHours=function(value){return this.addMilliseconds(value*3600000);};Date.prototype.addDays=function(value){return this.addMilliseconds(value*86400000);};Date.prototype.addWeeks=function(value){return this.addMilliseconds(value*604800000);};Date.prototype.addMonths=function(value){var n=this.getDate();this.setDate(1);this.setMonth(this.getMonth()+value);this.setDate(Math.min(n,this.getDaysInMonth()));return this;};Date.prototype.addYears=function(value){return this.addMonths(value*12);};Date.prototype.add=function(config){if(typeof config=="number"){this._orient=config;return this;}
var x=config;if(x.millisecond||x.milliseconds){this.addMilliseconds(x.millisecond||x.milliseconds);}
if(x.second||x.seconds){this.addSeconds(x.second||x.seconds);}
if(x.minute||x.minutes){this.addMinutes(x.minute||x.minutes);}
if(x.hour||x.hours){this.addHours(x.hour||x.hours);}
if(x.month||x.months){this.addMonths(x.month||x.months);}
if(x.year||x.years){this.addYears(x.year||x.years);}
if(x.day||x.days){this.addDays(x.day||x.days);}
return this;};Date._validate=function(value,min,max,name){if(typeof value!="number"){throw new TypeError(value+" is not a Number.");}else if(value<min||value>max){throw new RangeError(value+" is not a valid value for "+name+".");}
return true;};Date.validateMillisecond=function(n){return Date._validate(n,0,999,"milliseconds");};Date.validateSecond=function(n){return Date._validate(n,0,59,"seconds");};Date.validateMinute=function(n){return Date._validate(n,0,59,"minutes");};Date.validateHour=function(n){return Date._validate(n,0,23,"hours");};Date.validateDay=function(n,year,month){return Date._validate(n,1,Date.getDaysInMonth(year,month),"days");};Date.validateMonth=function(n){return Date._validate(n,0,11,"months");};Date.validateYear=function(n){return Date._validate(n,1,9999,"seconds");};Date.prototype.set=function(config){var x=config;if(!x.millisecond&&x.millisecond!==0){x.millisecond=-1;}
if(!x.second&&x.second!==0){x.second=-1;}
if(!x.minute&&x.minute!==0){x.minute=-1;}
if(!x.hour&&x.hour!==0){x.hour=-1;}
if(!x.day&&x.day!==0){x.day=-1;}
if(!x.month&&x.month!==0){x.month=-1;}
if(!x.year&&x.year!==0){x.year=-1;}
if(x.millisecond!=-1&&Date.validateMillisecond(x.millisecond)){this.addMilliseconds(x.millisecond-this.getMilliseconds());}
if(x.second!=-1&&Date.validateSecond(x.second)){this.addSeconds(x.second-this.getSeconds());}
if(x.minute!=-1&&Date.validateMinute(x.minute)){this.addMinutes(x.minute-this.getMinutes());}
if(x.hour!=-1&&Date.validateHour(x.hour)){this.addHours(x.hour-this.getHours());}
if(x.month!==-1&&Date.validateMonth(x.month)){this.addMonths(x.month-this.getMonth());}
if(x.year!=-1&&Date.validateYear(x.year)){this.addYears(x.year-this.getFullYear());}
if(x.day!=-1&&Date.validateDay(x.day,this.getFullYear(),this.getMonth())){this.addDays(x.day-this.getDate());}
if(x.timezone){this.setTimezone(x.timezone);}
if(x.timezoneOffset){this.setTimezoneOffset(x.timezoneOffset);}
return this;};Date.prototype.clearTime=function(){this.setHours(0);this.setMinutes(0);this.setSeconds(0);this.setMilliseconds(0);return this;};Date.prototype.isLeapYear=function(){var y=this.getFullYear();return(((y%4===0)&&(y%100!==0))||(y%400===0));};Date.prototype.isWeekday=function(){return!(this.is().sat()||this.is().sun());};Date.prototype.getDaysInMonth=function(){return Date.getDaysInMonth(this.getFullYear(),this.getMonth());};Date.prototype.moveToFirstDayOfMonth=function(){return this.set({day:1});};Date.prototype.moveToLastDayOfMonth=function(){return this.set({day:this.getDaysInMonth()});};Date.prototype.moveToDayOfWeek=function(day,orient){var diff=(day-this.getDay()+7*(orient||+1))%7;return this.addDays((diff===0)?diff+=7*(orient||+1):diff);};Date.prototype.moveToMonth=function(month,orient){var diff=(month-this.getMonth()+12*(orient||+1))%12;return this.addMonths((diff===0)?diff+=12*(orient||+1):diff);};Date.prototype.getDayOfYear=function(){return Math.floor((this-new Date(this.getFullYear(),0,1))/86400000);};Date.prototype.getWeekOfYear=function(firstDayOfWeek){var y=this.getFullYear(),m=this.getMonth(),d=this.getDate();var dow=firstDayOfWeek||Date.CultureInfo.firstDayOfWeek;var offset=7+1-new Date(y,0,1).getDay();if(offset==8){offset=1;}
var daynum=((Date.UTC(y,m,d,0,0,0)-Date.UTC(y,0,1,0,0,0))/86400000)+1;var w=Math.floor((daynum-offset+7)/7);if(w===dow){y--;var prevOffset=7+1-new Date(y,0,1).getDay();if(prevOffset==2||prevOffset==8){w=53;}else{w=52;}}
return w;};Date.prototype.isDST=function(){console.log('isDST');return this.toString().match(/(E|C|M|P)(S|D)T/)[2]=="D";};Date.prototype.getTimezone=function(){return Date.getTimezoneAbbreviation(this.getUTCOffset,this.isDST());};Date.prototype.setTimezoneOffset=function(s){var here=this.getTimezoneOffset(),there=Number(s)*-6/10;this.addMinutes(there-here);return this;};Date.prototype.setTimezone=function(s){return this.setTimezoneOffset(Date.getTimezoneOffset(s));};Date.prototype.getUTCOffset=function(){var n=this.getTimezoneOffset()*-10/6,r;if(n<0){r=(n-10000).toString();return r[0]+r.substr(2);}else{r=(n+10000).toString();return"+"+r.substr(1);}};Date.prototype.getDayName=function(abbrev){return abbrev?Date.CultureInfo.abbreviatedDayNames[this.getDay()]:Date.CultureInfo.dayNames[this.getDay()];};Date.prototype.getMonthName=function(abbrev){return abbrev?Date.CultureInfo.abbreviatedMonthNames[this.getMonth()]:Date.CultureInfo.monthNames[this.getMonth()];};Date.prototype._toString=Date.prototype.toString;Date.prototype.toString=function(format){var self=this;var p=function p(s){return(s.toString().length==1)?"0"+s:s;};return format?format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g,function(format){switch(format){case"hh":return p(self.getHours()<13?self.getHours():(self.getHours()-12));case"h":return self.getHours()<13?self.getHours():(self.getHours()-12);case"HH":return p(self.getHours());case"H":return self.getHours();case"mm":return p(self.getMinutes());case"m":return self.getMinutes();case"ss":return p(self.getSeconds());case"s":return self.getSeconds();case"yyyy":return self.getFullYear();case"yy":return self.getFullYear().toString().substring(2,4);case"dddd":return self.getDayName();case"ddd":return self.getDayName(true);case"dd":return p(self.getDate());case"d":return self.getDate().toString();case"MMMM":return self.getMonthName();case"MMM":return self.getMonthName(true);case"MM":return p((self.getMonth()+1));case"M":return self.getMonth()+1;case"t":return self.getHours()<12?Date.CultureInfo.amDesignator.substring(0,1):Date.CultureInfo.pmDesignator.substring(0,1);case"tt":return self.getHours()<12?Date.CultureInfo.amDesignator:Date.CultureInfo.pmDesignator;case"zzz":case"zz":case"z":return"";}}):this._toString();};
Date.now=function(){return new Date();};Date.today=function(){return Date.now().clearTime();};Date.prototype._orient=+1;Date.prototype.next=function(){this._orient=+1;return this;};Date.prototype.last=Date.prototype.prev=Date.prototype.previous=function(){this._orient=-1;return this;};Date.prototype._is=false;Date.prototype.is=function(){this._is=true;return this;};Number.prototype._dateElement="day";Number.prototype.fromNow=function(){var c={};c[this._dateElement]=this;return Date.now().add(c);};Number.prototype.ago=function(){var c={};c[this._dateElement]=this*-1;return Date.now().add(c);};(function(){var $D=Date.prototype,$N=Number.prototype;var dx=("sunday monday tuesday wednesday thursday friday saturday").split(/\s/),mx=("january february march april may june july august september october november december").split(/\s/),px=("Millisecond Second Minute Hour Day Week Month Year").split(/\s/),de;var df=function(n){return function(){if(this._is){this._is=false;return this.getDay()==n;}
return this.moveToDayOfWeek(n,this._orient);};};for(var i=0;i<dx.length;i++){$D[dx[i]]=$D[dx[i].substring(0,3)]=df(i);}
var mf=function(n){return function(){if(this._is){this._is=false;return this.getMonth()===n;}
return this.moveToMonth(n,this._orient);};};for(var j=0;j<mx.length;j++){$D[mx[j]]=$D[mx[j].substring(0,3)]=mf(j);}
var ef=function(j){return function(){if(j.substring(j.length-1)!="s"){j+="s";}
return this["add"+j](this._orient);};};var nf=function(n){return function(){this._dateElement=n;return this;};};for(var k=0;k<px.length;k++){de=px[k].toLowerCase();$D[de]=$D[de+"s"]=ef(px[k]);$N[de]=$N[de+"s"]=nf(de);}}());Date.prototype.toJSONString=function(){return this.toString("yyyy-MM-ddThh:mm:ssZ");};Date.prototype.toShortDateString=function(){return this.toString(Date.CultureInfo.formatPatterns.shortDatePattern);};Date.prototype.toLongDateString=function(){return this.toString(Date.CultureInfo.formatPatterns.longDatePattern);};Date.prototype.toShortTimeString=function(){return this.toString(Date.CultureInfo.formatPatterns.shortTimePattern);};Date.prototype.toLongTimeString=function(){return this.toString(Date.CultureInfo.formatPatterns.longTimePattern);};Date.prototype.getOrdinal=function(){switch(this.getDate()){case 1:case 21:case 31:return"st";case 2:case 22:return"nd";case 3:case 23:return"rd";default:return"th";}};
(function(){Date.Parsing={Exception:function(s){this.message="Parse error at '"+s.substring(0,10)+" ...'";}};var $P=Date.Parsing;var _=$P.Operators={rtoken:function(r){return function(s){var mx=s.match(r);if(mx){return([mx[0],s.substring(mx[0].length)]);}else{throw new $P.Exception(s);}};},token:function(s){return function(s){return _.rtoken(new RegExp("^\s*"+s+"\s*"))(s);};},stoken:function(s){return _.rtoken(new RegExp("^"+s));},until:function(p){return function(s){var qx=[],rx=null;while(s.length){try{rx=p.call(this,s);}catch(e){qx.push(rx[0]);s=rx[1];continue;}
break;}
return[qx,s];};},many:function(p){return function(s){var rx=[],r=null;while(s.length){try{r=p.call(this,s);}catch(e){return[rx,s];}
rx.push(r[0]);s=r[1];}
return[rx,s];};},optional:function(p){return function(s){var r=null;try{r=p.call(this,s);}catch(e){return[null,s];}
return[r[0],r[1]];};},not:function(p){return function(s){try{p.call(this,s);}catch(e){return[null,s];}
throw new $P.Exception(s);};},ignore:function(p){return p?function(s){var r=null;r=p.call(this,s);return[null,r[1]];}:null;},product:function(){var px=arguments[0],qx=Array.prototype.slice.call(arguments,1),rx=[];for(var i=0;i<px.length;i++){rx.push(_.each(px[i],qx));}
return rx;},cache:function(rule){var cache={},r=null;return function(s){try{r=cache[s]=(cache[s]||rule.call(this,s));}catch(e){r=cache[s]=e;}
if(r instanceof $P.Exception){throw r;}else{return r;}};},any:function(){var px=arguments;return function(s){var r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){r=null;}
if(r){return r;}}
throw new $P.Exception(s);};},each:function(){var px=arguments;return function(s){var rx=[],r=null;for(var i=0;i<px.length;i++){if(px[i]==null){continue;}
try{r=(px[i].call(this,s));}catch(e){throw new $P.Exception(s);}
rx.push(r[0]);s=r[1];}
return[rx,s];};},all:function(){var px=arguments,_=_;return _.each(_.optional(px));},sequence:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;if(px.length==1){return px[0];}
return function(s){var r=null,q=null;var rx=[];for(var i=0;i<px.length;i++){try{r=px[i].call(this,s);}catch(e){break;}
rx.push(r[0]);try{q=d.call(this,r[1]);}catch(ex){q=null;break;}
s=q[1];}
if(!r){throw new $P.Exception(s);}
if(q){throw new $P.Exception(q[1]);}
if(c){try{r=c.call(this,r[1]);}catch(ey){throw new $P.Exception(r[1]);}}
return[rx,(r?r[1]:s)];};},between:function(d1,p,d2){d2=d2||d1;var _fn=_.each(_.ignore(d1),p,_.ignore(d2));return function(s){var rx=_fn.call(this,s);return[[rx[0][0],r[0][2]],rx[1]];};},list:function(p,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return(p instanceof Array?_.each(_.product(p.slice(0,-1),_.ignore(d)),p.slice(-1),_.ignore(c)):_.each(_.many(_.each(p,_.ignore(d))),px,_.ignore(c)));},set:function(px,d,c){d=d||_.rtoken(/^\s*/);c=c||null;return function(s){var r=null,p=null,q=null,rx=null,best=[[],s],last=false;for(var i=0;i<px.length;i++){q=null;p=null;r=null;last=(px.length==1);try{r=px[i].call(this,s);}catch(e){continue;}
rx=[[r[0]],r[1]];if(r[1].length>0&&!last){try{q=d.call(this,r[1]);}catch(ex){last=true;}}else{last=true;}
if(!last&&q[1].length===0){last=true;}
if(!last){var qx=[];for(var j=0;j<px.length;j++){if(i!=j){qx.push(px[j]);}}
p=_.set(qx,d).call(this,q[1]);if(p[0].length>0){rx[0]=rx[0].concat(p[0]);rx[1]=p[1];}}
if(rx[1].length<best[1].length){best=rx;}
if(best[1].length===0){break;}}
if(best[0].length===0){return best;}
if(c){try{q=c.call(this,best[1]);}catch(ey){throw new $P.Exception(best[1]);}
best[1]=q[1];}
return best;};},forward:function(gr,fname){return function(s){return gr[fname].call(this,s);};},replace:function(rule,repl){return function(s){var r=rule.call(this,s);return[repl,r[1]];};},process:function(rule,fn){return function(s){var r=rule.call(this,s);return[fn.call(this,r[0]),r[1]];};},min:function(min,rule){return function(s){var rx=rule.call(this,s);if(rx[0].length<min){throw new $P.Exception(s);}
return rx;};}};var _generator=function(op){return function(){var args=null,rx=[];if(arguments.length>1){args=Array.prototype.slice.call(arguments);}else if(arguments[0]instanceof Array){args=arguments[0];}
if(args){for(var i=0,px=args.shift();i<px.length;i++){args.unshift(px[i]);rx.push(op.apply(null,args));args.shift();return rx;}}else{return op.apply(null,arguments);}};};var gx="optional not ignore cache".split(/\s/);for(var i=0;i<gx.length;i++){_[gx[i]]=_generator(_[gx[i]]);}
var _vector=function(op){return function(){if(arguments[0]instanceof Array){return op.apply(null,arguments[0]);}else{return op.apply(null,arguments);}};};var vx="each any all".split(/\s/);for(var j=0;j<vx.length;j++){_[vx[j]]=_vector(_[vx[j]]);}}());(function(){var flattenAndCompact=function(ax){var rx=[];for(var i=0;i<ax.length;i++){if(ax[i]instanceof Array){rx=rx.concat(flattenAndCompact(ax[i]));}else{if(ax[i]){rx.push(ax[i]);}}}
return rx;};Date.Grammar={};Date.Translator={hour:function(s){return function(){this.hour=Number(s);};},minute:function(s){return function(){this.minute=Number(s);};},second:function(s){return function(){this.second=Number(s);};},meridian:function(s){return function(){this.meridian=s.slice(0,1).toLowerCase();};},timezone:function(s){return function(){var n=s.replace(/[^\d\+\-]/g,"");if(n.length){this.timezoneOffset=Number(n);}else{this.timezone=s.toLowerCase();}};},day:function(x){var s=x[0];return function(){this.day=Number(s.match(/\d+/)[0]);};},month:function(s){return function(){this.month=((s.length==3)?Date.getMonthNumberFromName(s):(Number(s)-1));};},year:function(s){return function(){var n=Number(s);this.year=((s.length>2)?n:(n+(((n+2000)<Date.CultureInfo.twoDigitYearMax)?2000:1900)));};},rday:function(s){return function(){switch(s){case"yesterday":this.days=-1;break;case"tomorrow":this.days=1;break;case"today":this.days=0;break;case"now":this.days=0;this.now=true;break;}};},finishExact:function(x){x=(x instanceof Array)?x:[x];var now=new Date();this.year=now.getFullYear();this.month=now.getMonth();this.day=1;this.hour=0;this.minute=0;this.second=0;for(var i=0;i<x.length;i++){if(x[i]){x[i].call(this);}}
this.hour=(this.meridian=="p"&&this.hour<13)?this.hour+12:this.hour;if(this.day>Date.getDaysInMonth(this.year,this.month)){throw new RangeError(this.day+" is not a valid value for days.");}
var r=new Date(this.year,this.month,this.day,this.hour,this.minute,this.second);if(this.timezone){r.set({timezone:this.timezone});}else if(this.timezoneOffset){r.set({timezoneOffset:this.timezoneOffset});}
return r;},finish:function(x){x=(x instanceof Array)?flattenAndCompact(x):[x];if(x.length===0){return null;}
for(var i=0;i<x.length;i++){if(typeof x[i]=="function"){x[i].call(this);}}
if(this.now){return new Date();}
var today=Date.today();var method=null;var expression=!!(this.days!=null||this.orient||this.operator);if(expression){var gap,mod,orient;orient=((this.orient=="past"||this.operator=="subtract")?-1:1);if(this.weekday){this.unit="day";gap=(Date.getDayNumberFromName(this.weekday)-today.getDay());mod=7;this.days=gap?((gap+(orient*mod))%mod):(orient*mod);}
if(this.month){this.unit="month";gap=(this.month-today.getMonth());mod=12;this.months=gap?((gap+(orient*mod))%mod):(orient*mod);this.month=null;}
if(!this.unit){this.unit="day";}
if(this[this.unit+"s"]==null||this.operator!=null){if(!this.value){this.value=1;}
if(this.unit=="week"){this.unit="day";this.value=this.value*7;}
this[this.unit+"s"]=this.value*orient;}
return today.add(this);}else{if(this.meridian&&this.hour){this.hour=(this.hour<13&&this.meridian=="p")?this.hour+12:this.hour;}
if(this.weekday&&!this.day){this.day=(today.addDays((Date.getDayNumberFromName(this.weekday)-today.getDay()))).getDate();}
if(this.month&&!this.day){this.day=1;}
return today.set(this);}}};var _=Date.Parsing.Operators,g=Date.Grammar,t=Date.Translator,_fn;g.datePartDelimiter=_.rtoken(/^([\s\-\.\,\/\x27]+)/);g.timePartDelimiter=_.stoken(":");g.whiteSpace=_.rtoken(/^\s*/);g.generalDelimiter=_.rtoken(/^(([\s\,]|at|on)+)/);var _C={};g.ctoken=function(keys){var fn=_C[keys];if(!fn){var c=Date.CultureInfo.regexPatterns;var kx=keys.split(/\s+/),px=[];for(var i=0;i<kx.length;i++){px.push(_.replace(_.rtoken(c[kx[i]]),kx[i]));}
fn=_C[keys]=_.any.apply(null,px);}
return fn;};g.ctoken2=function(key){return _.rtoken(Date.CultureInfo.regexPatterns[key]);};g.h=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2]|[1-9])/),t.hour));g.hh=_.cache(_.process(_.rtoken(/^(0[0-9]|1[0-2])/),t.hour));g.H=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3]|[0-9])/),t.hour));g.HH=_.cache(_.process(_.rtoken(/^([0-1][0-9]|2[0-3])/),t.hour));g.m=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.minute));g.mm=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.minute));g.s=_.cache(_.process(_.rtoken(/^([0-5][0-9]|[0-9])/),t.second));g.ss=_.cache(_.process(_.rtoken(/^[0-5][0-9]/),t.second));g.hms=_.cache(_.sequence([g.H,g.mm,g.ss],g.timePartDelimiter));g.t=_.cache(_.process(g.ctoken2("shortMeridian"),t.meridian));g.tt=_.cache(_.process(g.ctoken2("longMeridian"),t.meridian));g.z=_.cache(_.process(_.rtoken(/^(\+|\-)?\s*\d\d\d\d?/),t.timezone));g.zz=_.cache(_.process(_.rtoken(/^(\+|\-)\s*\d\d\d\d/),t.timezone));g.zzz=_.cache(_.process(g.ctoken2("timezone"),t.timezone));g.timeSuffix=_.each(_.ignore(g.whiteSpace),_.set([g.tt,g.zzz]));g.time=_.each(_.optional(_.ignore(_.stoken("T"))),g.hms,g.timeSuffix);g.d=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1]|\d)/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.dd=_.cache(_.process(_.each(_.rtoken(/^([0-2]\d|3[0-1])/),_.optional(g.ctoken2("ordinalSuffix"))),t.day));g.ddd=g.dddd=_.cache(_.process(g.ctoken("sun mon tue wed thu fri sat"),function(s){return function(){this.weekday=s;};}));g.M=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d|\d)/),t.month));g.MM=_.cache(_.process(_.rtoken(/^(1[0-2]|0\d)/),t.month));g.MMM=g.MMMM=_.cache(_.process(g.ctoken("jan feb mar apr may jun jul aug sep oct nov dec"),t.month));g.y=_.cache(_.process(_.rtoken(/^(\d\d?)/),t.year));g.yy=_.cache(_.process(_.rtoken(/^(\d\d)/),t.year));g.yyy=_.cache(_.process(_.rtoken(/^(\d\d?\d?\d?)/),t.year));g.yyyy=_.cache(_.process(_.rtoken(/^(\d\d\d\d)/),t.year));_fn=function(){return _.each(_.any.apply(null,arguments),_.not(g.ctoken2("timeContext")));};g.day=_fn(g.d,g.dd);g.month=_fn(g.M,g.MMM);g.year=_fn(g.yyyy,g.yy);g.orientation=_.process(g.ctoken("past future"),function(s){return function(){this.orient=s;};});g.operator=_.process(g.ctoken("add subtract"),function(s){return function(){this.operator=s;};});g.rday=_.process(g.ctoken("yesterday tomorrow today now"),t.rday);g.unit=_.process(g.ctoken("minute hour day week month year"),function(s){return function(){this.unit=s;};});g.value=_.process(_.rtoken(/^\d\d?(st|nd|rd|th)?/),function(s){return function(){this.value=s.replace(/\D/g,"");};});g.expression=_.set([g.rday,g.operator,g.value,g.unit,g.orientation,g.ddd,g.MMM]);_fn=function(){return _.set(arguments,g.datePartDelimiter);};g.mdy=_fn(g.ddd,g.month,g.day,g.year);g.ymd=_fn(g.ddd,g.year,g.month,g.day);g.dmy=_fn(g.ddd,g.day,g.month,g.year);g.date=function(s){return((g[Date.CultureInfo.dateElementOrder]||g.mdy).call(this,s));};g.format=_.process(_.many(_.any(_.process(_.rtoken(/^(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?)/),function(fmt){if(g[fmt]){return g[fmt];}else{throw Date.Parsing.Exception(fmt);}}),_.process(_.rtoken(/^[^dMyhHmstz]+/),function(s){return _.ignore(_.stoken(s));}))),function(rules){return _.process(_.each.apply(null,rules),t.finishExact);});var _F={};var _get=function(f){return _F[f]=(_F[f]||g.format(f)[0]);};g.formats=function(fx){if(fx instanceof Array){var rx=[];for(var i=0;i<fx.length;i++){rx.push(_get(fx[i]));}
return _.any.apply(null,rx);}else{return _get(fx);}};g._formats=g.formats(["yyyy-MM-ddTHH:mm:ss","ddd, MMM dd, yyyy H:mm:ss tt","ddd MMM d yyyy HH:mm:ss zzz","d"]);g._start=_.process(_.set([g.date,g.time,g.expression],g.generalDelimiter,g.whiteSpace),t.finish);g.start=function(s){try{var r=g._formats.call({},s);if(r[1].length===0){return r;}}catch(e){}
return g._start.call({},s);};}());Date._parse=Date.parse;Date.parse=function(s){var r=null;if(!s){return null;}
try{r=Date.Grammar.start.call({},s);}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};Date.getParseFunction=function(fx){var fn=Date.Grammar.formats(fx);return function(s){var r=null;try{r=fn.call({},s);}catch(e){return null;}
return((r[1].length===0)?r[0]:null);};};Date.parseExact=function(s,fx){return Date.getParseFunction(fx)(s);};

/* >>>>>>>>>> BEGIN source/statechart/showingChartPanel/showingChartPanel.js */
EurekaJView.showingChartPanel = SC.State.extend({
	enterState: function() {
		EurekaJView.mainPage.get('flotChartGrid').set('isVisible', YES);
	    EurekaJView.chartGridController.init();
	},
	
	exitState: function() {
		EurekaJView.mainPage.get('flotChartGrid').set('isVisible', NO);
	}
});
/* >>>>>>>>>> BEGIN source/statechart/showingInformationPanel/showingInformationPanel.js */
EurekaJView.showingInformationPanel = SC.State.extend({
	enterState: function() {
		//Below: Ugly gode for observing tab changes. 
	    EurekaJView.mainPage.get('informationPanelView').get('informationPanelTabView').addObserver('nowShowing', function(tabView) {
	        EurekaJView.chartGridController.set('nowShowingTab', tabView.get('nowShowing'));
	    });
	
        EurekaJView.mainPage.get('informationPanelView').set('isVisible', YES);
        EurekaJView.triggeredAlertListController.triggerTimer();
        EurekaJView.triggeredAlertListController.timer.set('isPaused', NO);
    },

    exitState: function() {
        EurekaJView.mainPage.get('informationPanelView').set('isVisible', NO);
        EurekaJView.triggeredAlertListController.timer.set('isPaused', YES);
    }
});
/* >>>>>>>>>> BEGIN source/statechart/showingTopPanel/showingAdminPanel.js */
EurekaJView.showingAdminPanel = SC.State.extend({
	hideAdministrationPaneAction: function() {
        this.gotoState('ready');
    },

	enterState: function() {
        EurekaJView.mainPage.get('adminPanelView').append();
    },

    exitState: function() {
        EurekaJView.mainPage.get('adminPanelView').remove();
    }
});
/* >>>>>>>>>> BEGIN source/statechart/showingTopPanel/showingTopPanel.js */
EurekaJView.showingTopPanel = SC.State.extend({
    initialSubstate: 'ready',

    enterState: function() {
        EurekaJView.mainPage.get('topView').set('isVisible', YES);
        SC.Logger.log('entered showTopMenu');
    },

    exitState: function() {
        EurekaJView.mainPage.get('topView').set('isVisible', NO);
        SC.Logger.log('exited showTopMenu');
    },

    ready: SC.State.design({
        showAdministrationPaneAction: function() {
            EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.ADMINISTRATION_TREE_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_GROUPS_QUERY);
            EurekaJView.EurekaJStore.find(EurekaJView.EMAIL_GROUPS_QUERY);

            EurekaJView.updateAlertsAction();
            EurekaJView.updateInstrumentationGroupsAction();
            EurekaJView.updateEmailGroupsAction();
            this.gotoState('showingAdminPanel');
        }
    }),

    showingAdminPanel: SC.State.plugin('EurekaJView.showingAdminPanel')
});
/* >>>>>>>>>> BEGIN source/statechart/showingTreePanel/showingTreePanel.js */
EurekaJView.showingTreePanel = SC.State.extend({
	enterState: function() {
        EurekaJView.EurekaJStore.find(EurekaJView.INSTRUMENTATION_TREE_QUERY);
        EurekaJView.InstrumentationTreeController.populate();

        EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', YES);
        EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', YES);
        EurekaJView.InstrumentationTreeController.triggerTimer();
        EurekaJView.InstrumentationTreeController.timer.set('isPaused', NO);
    },

    exitState: function() {
        EurekaJView.mainPage.get('instrumentationTreeView').set('isVisible', NO);
        EurekaJView.mainPage.get('instrumentationTreeScrollView').set('isVisible', NO);
        EurekaJView.InstrumentationTreeController.timer.set('isPaused', YES);
    }
});
/* >>>>>>>>>> BEGIN source/views/administration/administration_pane.js */
// ==========================================================================
// Project:   EurekaJView.AdministrationPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.AdministrationPaneView = SC.SheetPane.extend(
    /** @scope EurekaJView.AdministrationPaneView.prototype */ {
    defaultResponder: EurekaJView,

    contentView: SC.View.extend({


        childViews: 'administrationContentView hideAdministrationPanelButtonView'.w(),
        layout: { top: 0, left: 0, bottom: 0, right: 0 },

        administrationToolbarView: SC.ToolbarView.extend({
            childViews: 'labelView'.w(),
            layout: {top: 0, left: 0, right: 0, height: 40 },
            anchorLocation: SC.ANCHOR_TOP,

            labelView: SC.LabelView.extend({
                layout: {centerY: 0, centerX:0, height: 40, top: 10, width: 250 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.BOLD_WEIGHT,
                value: 'EurekaJ Administration'
            }).classNames('whitelabel')
        }),

        administrationContentView: SC.TabView.design({
            layout: {
                top: 10,
                bottom: 50,
                left: 10,
                right: 10
            },
            nowShowing: 'EurekaJView.AlertAdministrationView',
            itemTitleKey: 'title',
            itemValueKey: 'value',
            items: [
                {title: 'Alerts', value: 'EurekaJView.AlertAdministrationView'},
                {title: 'Chart Groups', value: 'EurekaJView.InstrumentationGroupsAdministrationView'},
                {title: 'Email Recipients', value: 'EurekaJView.EmailRecipientsAdministrationView'},
                {title: 'Instrumentation Menu', value: 'EurekaJView.TreeMenuAdministrationView'}
            ]

        }),

        hideAdministrationPanelButtonView: SC.ButtonView.extend({
            layout: {
                width: 80,
                bottom: 20,
                height: 24,
                centerX: 0
            },
            title: "Close",
            action: "hideAdministrationPaneAction"
        })
    })

});

/* >>>>>>>>>> BEGIN source/views/administration/alert_administration.js */
// ==========================================================================
// Project:   EurekaJView.AlertAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.AlertAdministrationView = SC.View.extend(
    /** @scope EurekaJView.AlertAdministrationView.prototype */ {

    childViews: 'newAlertView alertSelectionScrollView deleteAlertButtonView alertContentView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    newAlertView : SC.View.design({
        childViews: 'newAlertTextFieldView newAlertButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newAlertTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.alertAdministrationController.newAlertName'
        }),

        newAlertButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addNewAlertAction'
        })
    }).classNames('thinBlackBorder'),

    alertSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 25, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
        	allowsMultipleSelection: NO,
        	
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.alertAdministrationController.arrangedObjects',
            selectionBinding: 'EurekaJView.alertAdministrationController.selection',
            contentValueKey: "alertName",
            selectionDelegate: EurekaJView.alertSelectionDelegate,
        })
    }),
    
    deleteAlertButtonView: SC.ButtonView.extend({
        layout: {left: 0, width: 200, height: 24, centerX: 0, bottom: 0, centerY: 0},
        title: "Delete Selected Alert",
        action: 'EurekaJView.deleteSelectedAlertAction'
    }),

    alertContentView: SC.View.extend({
        childViews: 'activeLabelView activeCheckboxView errorLabelView errorTextfieldView warningLabelView warningTextfieldView alertTypeLabelView alertTypeSelectFieldView delayLabelView delayTextfieldView alertSourceLabelView saveAlertButtonView alertNotificationLabelView alertNotificationSelectFieldView alertChartSelectScrollView'.w(),
        isVisibleBinding: 'EurekaJView.alertAdministrationController.showEditAlertView',
        layout: {top: 20, bottom: 0, right: 0, left: 215},

        activeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Activated:'
        }).classNames('blacklabel'),

        activeCheckboxView: SC.CheckboxView.extend({
            layout: {left: 90, width: 20, top: 0, height: 20},
            contentBinding: 'EurekaJView.editAlertController',
            contentValueKey: "alertActivated"
        }),


        errorLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Error Value:'
        }).classNames('blacklabel'),

        errorTextfieldView: SC.TextFieldView.extend({
            layout: {left: 90, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editAlertController',
            contentValueKey: "alertErrorValue",
			validator: SC.Validator.Number 
        }),

        warningLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Warning Value:'
        }).classNames('blacklabel'),

        warningTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editAlertController',
            contentValueKey: "alertWarningValue",
			validator: SC.Validator.Number 
        }),

        alertTypeLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 80, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Type:'
        }).classNames('blacklabel'),

        alertTypeSelectFieldView: SC.SelectButtonView.extend({
            layout: {left: 90, width: 150, top: 50, height: 25},
            theme: 'square',
            nameKey: 'typeName',
            valueKey: 'alertType',

            objectsBinding: 'EurekaJView.administrationPaneController.alertTypes',
            contentBinding: 'EurekaJView.editAlertController',
            contentValueKey: 'alertType',
            disableSort: YES,
            acceptsFirstResponder: function() {
                return this.get('isEnabled');
            }.property('isEnabled')
        }),

        delayLabelView: SC.LabelView.extend({
            layout: {left: 220, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Delay:'
        }).classNames('blacklabel'),

        delayTextfieldView: SC.TextFieldView.extend({
            layout: {left: 330, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editAlertController',
            contentValueKey: "alertDelay",
			validator: SC.Validator.Number 
        }),

        alertSourceLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Source:'
        }).classNames('blacklabel'),


        alertChartSelectScrollView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 95, height: 150},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,

            contentView: SC.SourceListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                contentBinding: 'EurekaJView.alertChartController.arrangedObjects',
                selectionBinding: 'EurekaJView.alertChartController.selection',
                selectionDelegate: EurekaJView.alertSelectionDelegate
            })
        }),

        alertNotificationLabelView: SC.LabelView.extend({
            layout: {left: 10, right: 20, top: 250, height: 25},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Alert Notification:'
        }).classNames('blacklabel'),

        alertNotificationSelectFieldView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 280, bottom: 40},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,


            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                contentBinding: 'EurekaJView.alertNotificationController.arrangedObjects',
                selectionBinding: 'EurekaJView.alertNotificationController.selection',
                contentValueKey: "emailGroupName",
                selectionDelegate: EurekaJView.alertSelectionDelegate,


                acceptsFirstResponder: function() {
                    return this.get('isEnabled');
                }.property('isEnabled')
            })
        }),

        saveAlertButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 150, bottom: 10, height: 25},
            title: "Save All Alert Changes",
            action: "EurekaJView.saveAlertsAction"
        })

    })

});

/* >>>>>>>>>> BEGIN source/views/administration/email_recipients_administration.js */
// ==========================================================================
// Project:   EurekaJView.EmailRecipientsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.EmailRecipientsAdministrationView = SC.View.extend(
    /** @scope EurekaJView.EmailRecipientsAdministrationView.prototype */ {

    childViews: 'newEmailGroupView emailGroupSelectionScrollView deleteAlertButtonView emailContentView'.w(),
    layout: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },

    newEmailGroupView : SC.View.design({
        childViews: 'newEmailGroupTextFieldView newEmailGroupButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newEmailGroupTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.emailAdministrationController.newEmailGroupName'
        }),

        newEmailGroupButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addNewEmailGroupAction'
        })
    }).classNames('thinBlackBorder'),

    emailGroupSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 25, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.emailAdministrationController.arrangedObjects',
            selectionBinding: 'EurekaJView.emailAdministrationController.selection',
            contentValueKey: 'emailGroupName'
            //selectionDelegate: EurekaJView.alertSelectionDelegate
        })
    }),
    
    deleteAlertButtonView: SC.ButtonView.extend({
        layout: {left: 0, width: 200, height: 24, centerX: 0, bottom: 0, centerY: 0},
        title: "Delete Selected Email Recipient",
        action: 'EurekaJView.deleteSelectedEmailGroupAction'
    }),

    emailContentView: SC.View.extend({
        childViews: 'smtpHostLabelView smtpHostTextfieldView smtpUsernameLabelView smtpUsernameTextfieldView smtpPasswordLabelView smtpPasswordTextfieldView smtpPortLabelView smtpPortTextfieldView smtpSSLLabelView smtpSSLTextfieldView emailRecipieltsHeadlineLabelView emailRecipientsView saveEmailButtonView'.w(),
        isVisibleBinding: 'EurekaJView.emailAdministrationController.showEditAlertView',
        layout: {top: 20, bottom: 0, right: 0, left: 215},


        smtpHostLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 0, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Host:'
        }).classNames('blacklabel'),

        smtpHostTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, right: 10, top: 0, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpHost"
        }),

        smtpUsernameLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Username:'
        }).classNames('blacklabel'),

        smtpUsernameTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpUsername"
        }),

        smtpPasswordLabelView: SC.LabelView.extend({
            layout: {left: 230, width: 100, top: 25, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Password:'
        }).classNames('blacklabel'),

        smtpPasswordTextfieldView: SC.TextFieldView.extend({
            layout: {left: 350, width: 100, top: 25, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpPassword",
            isPassword: YES
        }),

        smtpPortLabelView: SC.LabelView.extend({
            layout: {left: 10, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Port:'
        }).classNames('blacklabel'),

        smtpPortTextfieldView: SC.TextFieldView.extend({
            layout: {left: 110, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpPort",
			validator: SC.Validator.Number 
        }),

        smtpSSLLabelView: SC.LabelView.extend({
            layout: {left: 230, width: 100, top: 50, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'SMTP Use SSL ?:'
        }).classNames('blacklabel'),

        smtpSSLTextfieldView: SC.CheckboxView.extend({
            layout: {left: 350, width: 100, top: 50, height: 20},
            contentBinding: 'EurekaJView.editEmailGroupController',
            contentValueKey: "smtpUseSSL"
        }),

        emailRecipieltsHeadlineLabelView: SC.LabelView.design({
            layout: {left: 10, width: 200, top: 75, height: 30},
            controlSize: SC.REGULAR_CONTROL_SIZE,
            value: 'Email Recipients:'
        }).classNames('blacklabel'),

        emailRecipientsView: SC.View.design({
            childViews: 'newEmailRecipientGroupView emailRecipientsScrollView'.w(),
            layout: {left: 10, right: 20, top: 100, bottom: 40},
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF",


            newEmailRecipientGroupView : SC.View.design({
                childViews: 'newEmailRecipeintTextFieldView newEmailRecipeintButtonView'.w(),
                layout: {top: 0, height: 30, left: 0, right: 0 },
                backgroundColor: "#ffffff",

                newEmailRecipeintTextFieldView : SC.TextFieldView.design({
                    layout: {top: 2, height: 24, centerY:0, right: 100, left: 2 },
                    valueBinding: 'EurekaJView.emailRecipientsController.newEmailRecipent'
                }),

                newEmailRecipeintButtonView: SC.ButtonView.extend({
                    layout: {width: 90, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
                    title: "Add",
                    action: 'EurekaJView.addNewEmailRecipientAction'
                })
            }).classNames('thinBlackBorder'),

            emailRecipientsScrollView: SC.ScrollView.design({
                layout: {top: 35, bottom: 0, left: 0, right: 0 },
                hasHorizontalScroller: YES,
                hasVerticalScroller: YES,

                contentView: SC.ListView.extend({
                    backgroundColor: '#F0F8FF',
                    contentBinding: 'EurekaJView.emailRecipientsController.arrangedObjects',
                    selectionBinding: 'EurekaJView.emailRecipientsController.selection',
                    contentValueKey: 'emailAddress',
                    canDeleteContent: YES

                    //selectionDelegate: EurekaJView.alertSelectionDelegate
                })
            })
        }),

        saveEmailButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 300, bottom: 10, height: 25},
            title: "Save All Email Group Changes",
            action: "EurekaJView.saveEmailAction"
        })
    })

});

/* >>>>>>>>>> BEGIN source/views/administration/tree_menu_administration.js */
// ==========================================================================
// Project:   EurekaJView.AlertAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/**
 * @class
 * 
 * (Document Your View Here)
 * 
 * @extends SC.View
 */
EurekaJView.TreeMenuAdministrationView = SC.View.extend(
		/** @scope EurekaJView.TreeMenuAdministrationView.prototype */ {
	childViews : 'deleteLabelView'.w(),
	layout : {
		top : 0,
		bottom : 0,
		left : 0,
		right : 0
	},

	deleteLabelView : SC.LabelView.design({
		layout: {left: 10, width: 80, top: 0, height: 30},
        controlSize: SC.REGULAR_CONTROL_SIZE,
        value: 'Delete Tree Menus'
	})
});
/* >>>>>>>>>> BEGIN source/views/calendar.js */
// ==========================================================================
// Project:   EurekaJView.Calendar
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.Calendar = SC.View.extend(
/** @scope XT.Calendar.prototype */ {
    // TODO: use localization to properly render Month and WOD names
    nomeMesi:["January","February","March","April","May","June","July","August","September","October","November","December"],
    nomiGiorni:["Mo","Tu","We","Th","Fr","Sa","Su"],

    theDate: null,
    // save the first date of the period shown in the calendar
    firstOfPeriod:null,

    displayProperties: ["theDate"],

    render: function(context, firstTime) {
        var theDate=null;
        theDate=this.get("theDate");
        if (!theDate) {
            theDate=Date.today();
            this.theDate=theDate;
        }

        var firtsOfMonth=Date.parse((1900+theDate.getYear())+"/"+(theDate.getMonth()+1)+"/"+1);
        var daysToPreviousSunday=firtsOfMonth.getDay()==0 ? 6 : firtsOfMonth.getDay()-1;
        var firstOfPeriod=firtsOfMonth.add(-1*(daysToPreviousSunday)).days();
        this.saveFirstOfPeriod(theDate);
        
        var mese=this.get("nomeMesi")[theDate.getMonth()];
        var anno=1900+theDate.getYear();

        context=context.begin("table").attr("border","0").classNames(["calendar"]);
        // table head
        context=context.begin("tr").begin("td").id("previous").classNames(["header"]).push("&lt;").end().begin("td").classNames(["header"]).attr("colspan","5").attr("align","center").push(mese+" "+anno).end().begin("td").id("next").classNames(["header"]).push("&gt;").end().end();

        var day=0;
        for(var i=1;i<7;i++) {
            context=context.begin("tr");
            for(var j=1;j<8;j++) {
                day++;
                var id="day"+day;
                //console.log(firstOfPeriod+" == "+Date.today()+ " ? "+ firstOfPeriod==Date.today());
                if (firstOfPeriod.getMonth()!=theDate.getMonth()) {
                    context=context.begin("td").id(id).classNames(["not-this-month"]).push(firstOfPeriod.getDate()).end();
                } else if (firstOfPeriod.equals(theDate)) {
                    context=context.begin("td").id(id).classNames(["the-date"]).push(firstOfPeriod.getDate()).end();
                } else if (firstOfPeriod.equals(Date.today())) {
                    context=context.begin("td").id(id).classNames(["today"]).push(firstOfPeriod.getDate()).end();
                } else {
                    context=context.begin("td").id(id).push(firstOfPeriod.getDate()).end();
                }
                firstOfPeriod.add(1).days();
            }
            context=context.end();
        }
        context=context.begin("tr");
        for(var j=0;j<7;j++) {
            // show day of week
            context=context.begin("td").classNames(["day-of-week"]).push(this.get("nomiGiorni")[j]).end();
        }
        context=context.end();

        context.end();// close table        
    },

    saveFirstOfPeriod: function(d) {
        var firtsOfMonth=Date.parse((1900+d.getYear())+"/"+(d.getMonth()+1)+"/"+1);
        this.set("firstOfPeriod",firtsOfMonth.add(-1*(firtsOfMonth.getDay()-1)).days());
    },

    mouseDown: function(evt) {
        return YES;
    },

    mouseUp: function(evt) {
        if (evt.srcElement && evt.srcElement.id) {
            if (evt.srcElement.id=="previous") {
                var d=new Date(this.get("theDate").getTime());
                this.set("theDate",d.add(-1).months());
            }
            if (evt.srcElement.id=="next") {
                var d=new Date(this.get("theDate").getTime());
                this.set("theDate",d.add(1).months());
            }
            if (evt.srcElement.id.substr(0,3)=="day") {
                //console.log("    on "+evt.srcElement.id);
                var days=parseInt(evt.srcElement.id.substr(3))-1;
                //console.log(this.get("firstOfPeriod"));
                var newDate=this.get("firstOfPeriod").add(days).days();
                //console.log(" + "+days+" = " + newDate);
                this.set("theDate", newDate);
            }
        }
        return YES;
    },

    touchEnd: function(touch) {
        if (touch.event) this.mouseUp(touch.event);
    }
});

/* >>>>>>>>>> BEGIN source/views/chart/chart_view.js */
// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.ChartView = SC.View.extend(
/** @scope EurekaJView.ChartViewTwo.prototype */
{
	contentDisplayProperties: 'content'.w(),
    childViews: 'chartLabel chart table'.w(),

    chartLabel: SC.LabelView.design({
        layout: {
			centerX: 0,
			left: 5,
			top: 5,
			right: 5,
			height: 30
        },
        controlSize: SC.LARGE_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
		textAlign: SC.ALIGN_CENTER,
        valueBinding: '.parentView.content.instrumentationNode'
    }),

	chart: Flot.GraphView.design({
        isVisibleBinding: '.parentView.content.isChart',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },
		seriesBinding: '.parentView.content',
		//data: [SC.Object.create({label: 'set1', data:[[1,1], [2,2]]})],
		debugInConsole: NO,
		showTooltip: YES
	}),

    table: SC.TableView.design({
        isVisibleBinding: '.parentView.content.isTable',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },

        columns: [
            SC.TableColumn.create({
                key: 'name',
                label: 'Name',
                width: 150
            }),
			SC.TableColumn.create({
                key: 'value',
                label: 'Value',
                width: 150
            })
        ],

        contentBinding: '.parentView.content.table',
		exampleView: SC.TableRowView,
        recordType: EurekaJView.ChartGridModel

    })

    /*table: SC.ListView.design({
        isVisibleBinding: '.parentView.content.isTable',
        layout: { top: 30, right: 5, bottom: 5, left: 5 },
        backgroundColor: '#F0F8FF',
        contentValueKey: "listValue",
        rowHeight: 18,
        borderStyle: SC.BORDER_NONE,
        isSelectable: YES,

        contentBinding: '.parentView.content.table'
    }),   */

    /*table: SCTable.TableView.design({
      isVisibleBinding: '.parentView.content.isTable',
      layout: { top: 30, right: 5, bottom: 5, left: 5 },

      contentBinding: '.parentView.content.table',

      columnsBinding: 'EurekaJView.chartGridController.tableDataColumns'
    })*/

});

/* >>>>>>>>>> BEGIN source/views/chart/chart_grid.js */
// ==========================================================================
// Project:   EurekaJView.EmailRecipientsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
sc_require('views/chart/chart_view');
EurekaJView.ChartGrid = SC.GridView.extend(
{
	contentBinding: 'EurekaJView.chartGridController.arrangedObjects',
    selectOnMouseDown: NO,
    exampleView: EurekaJView.ChartView,
    recordType: EurekaJView.ChartGridModel,
    itemsPerRow: 1,
    isSelectable: NO,

    //extending Grid View to enable dynamic grid-height
    layoutForContentIndex: function(contentIndex) {
        var frameHeight = this.get('clippingFrame').height;
        var rowHeight = (frameHeight / this.get('content').get('length'));
        SC.Logger.log('frameHeight: ' + frameHeight + ' content.length: ' + this.get('content').get('length') + ' rowHeight: ' + rowHeight);
        var frameWidth = this.get('clippingFrame').width;
        var itemsPerRow = this.get('itemsPerRow');
        var columnWidth = Math.floor(frameWidth / itemsPerRow);

        var row = Math.floor(contentIndex / itemsPerRow);
        var col = contentIndex - (itemsPerRow * row);
        return {
            left: col * columnWidth,
            top: row * rowHeight,
            height: rowHeight,
            width: columnWidth
        };
    }
});

/* >>>>>>>>>> BEGIN source/views/informationPanel/historical_statistics_options.js */
// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.HistoricalStatisticsOptionsView = SC.View.extend(
/** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'chartOptionsHeadlineLabelView fromLabelView chartTimezoneLabelView chartTimezoneFieldView fromTextFieldView selectFromButtonView toLabelView toTextFieldView selectToButtonView chartResolutionLabelView chartResolutionFieldView applyHistoricalChangesButtonView '.w(),

    chartOptionsHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 15,
            left: 10,
            right: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'HISTORICAL CHART'
    }).classNames(['greylabel', 'underlined']),

	chartTimezoneLabelView: SC.LabelView.design({
		layout: {left: 5, height: 30, top: 45, width: 60},
		controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Timezone: '
	}).classNames('blacklabel'),
	
	chartTimezoneFieldView: SC.SelectFieldView.design({
        layout: {left: 70, height: 30, top: 45, right: 10},
        disableSort: YES,
		
        objectsBinding: 'EurekaJView.chartGridController.timezones',
        nameKey: 'timezoneName',
        valueKey: 'timezoneValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedTimeZoneOffset'
    }),

    fromLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 100,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'From: '
    }).classNames('blacklabel'),

    fromTextFieldView : SC.TextFieldView.design({
        layout: {bottom: 100, height: 17, centerY:0, right: 30, left: 50 },
        valueBinding: 'EurekaJView.chartGridController.selectedChartFromString'
    }).classNames('smallTextfield'),

    selectFromButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {bottom: 101, height: 16, centerY:0, right: 10, width: 16 },
        value: '/static/EurekaJView/en/eurekajview/source/resources/images/ej_select_calenar_icon_16.png',
        toolTip: 'Select From Date'
        //title: 'Administration',
        //action: 'showAdministrationPaneAction'
    }),

    toLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 70,
            width: 40
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        textAlign: SC.ALIGN_LEFT,
        value: 'To: '
    }).classNames('blacklabel'),

    toTextFieldView : SC.TextFieldView.design({
        layout: {bottom: 70, height: 17, centerY:0, right: 30, left: 50 },
        valueBinding: 'EurekaJView.chartGridController.selectedChartToString'
    }).classNames('smallTextfield'),

    selectToButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {bottom: 70, height: 16, centerY:0, right: 10, width: 16 },
        value: '/static/EurekaJView/en/eurekajview/source/resources/images/ej_select_calenar_icon_16.png',
        toolTip: 'Select From Date'
        //title: 'Administration',
        //action: 'showAdministrationPaneAction'
    }),

    chartResolutionLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 35,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Resolution: '
    }).classNames('blacklabel'),

    chartResolutionFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 35,
            height: 30,
            left: 70,
            right: 5
        },
        disableSort: YES,

        objects: [
            {
                'chartResolutionName': '15 seconds',
                'chartResolutionValue': 15
            },
            {
                'chartResolutionName': '30 seconds',
                'chartResolutionValue': 30
            },
            {
                'chartResolutionName': '45 seconds',
                'chartResolutionValue': 45
            },
            {
                'chartResolutionName': '1 minute',
                'chartResolutionValue': 60
            },
            {
                'chartResolutionName': '3 minutes',
                'chartResolutionValue': 180
            },
            {
                'chartResolutionName': '10 minutes',
                'chartResolutionValue': 600
            },
            {
                'chartResolutionName': '20 minutes',
                'chartResolutionValue': 1200
            },
            {
                'chartResolutionName': '40 minutes',
                'chartResolutionValue': 2400
            }
        ],
        nameKey: 'chartResolutionName',
        valueKey: 'chartResolutionValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedChartResolution'
    }),

    applyHistoricalChangesButtonView: SC.ButtonView.extend({
        layout: {
            bottom: 5,
            height: 30,
            left: 70,
            right: 5
        },
        title: "Apply Changes",
        action: "EurekaJView.applyHistoricalChanges"
    })




});

/* >>>>>>>>>> BEGIN source/views/informationPanel/information_panel.js */
// ==========================================================================
// Project:   EurekaJView.AdministrationPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
sc_require('views/calendar')
EurekaJView.InformationPanelView = SC.View.extend(
/** @scope EurekaJView.AdministrationPaneView.prototype */ {
    defaultResponder: EurekaJView,
    childViews: 'informationPanelTabView triggeredAlertHeadlineLabelView triggeredAlertScrollView'.w(),
    isVisible: NO,

    informationPanelTabView: SC.TabView.design({
        layout: {
            top: 0,
            height: 200,
            left: 5,
            right: 5
        },
        nowShowing: 'EurekaJView.LiveStatisticsOptionsView',
        itemTitleKey: 'title',
        itemValueKey: 'value',
        // itemActionKey: 'action',
        items: [
            {action: 'testAction', title: 'Live', value: 'EurekaJView.LiveStatisticsOptionsView'},
            {action: 'testAction', title: 'Historical', value: 'EurekaJView.HistoricalStatisticsOptionsView'}
        ]

    }),

    triggeredAlertHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 210,
            left: 5,
            right: 5
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'TRIGGERED ALERTS'
    }).classNames(['greylabel', 'underlined']),

    triggeredAlertScrollView: SC.ScrollView.design({
        layout: {
            top: 230,
            bottom: 25,
            left: 5,
            right: 5
        },

        contentView: SC.TableView.design({
            layout: {
                width: 450
            },
            exampleView: SC.TableRowView,
            recordType: EurekaJView.TriggeredAlertModel,
            contentBinding: 'EurekaJView.triggeredAlertListController.arrangedObjects',
            
            columns: [
                      SC.TableColumn.create({
                          key: 'formattedTriggeredDate',
                          label: 'Triggered Date',
                          width: 120
                      }),
                      SC.TableColumn.create({
                          key: 'alertType',
                          label: 'Alert Type',
                          width: 75
          			}),
          			SC.TableColumn.create({
                          key: 'triggeredValue',
                          label: 'Triggered Value',
                          width: 75
          			}),
          			SC.TableColumn.create({
                        key: 'alertName',
                        label: 'Alert Name',
                        width: 75
        			})
                   ]
        })


    })

});

/* >>>>>>>>>> BEGIN source/views/informationPanel/live_statistics_options.js */
// ==========================================================================
// Project:   EurekaJView.TimePeriodPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.LiveStatisticsOptionsView = SC.View.extend(
    /** @scope EurekaJView.TimePeriodPaneView.prototype */ {

    defaultResponder: EurekaJView,
    childViews: 'timePeriodContainerView'.w(),

    childViews: 'chartOptionsHeadlineLabelView chartTimezoneLabelView chartTimezoneFieldView chartOptionsLabelView chartTimespanFieldView chartResolutionLabelView chartResolutionFieldView'.w(),

    chartOptionsHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 15,
            left: 10,
            right: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'LIVE CHART'
    }).classNames(['greylabel', 'underlined']),

	chartTimezoneLabelView: SC.LabelView.design({
		layout: {left: 10, height: 30, top: 45, width: 60},
		controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Timezone: '
	}).classNames('blacklabel'),
	
	chartTimezoneFieldView: SC.SelectFieldView.design({
        layout: {left: 70, height: 30, top: 45, right: 10},
        disableSort: YES,
		
        objectsBinding: 'EurekaJView.chartGridController.timezones',
        nameKey: 'timezoneName',
        valueKey: 'timezoneValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedTimeZoneOffset'
    }),

    chartOptionsLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 35,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Timespan: '
    }).classNames('blacklabel'),

    chartTimespanFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 35,
            height: 30,
            left: 70,
            right: 5
        },
        disableSort: YES,

        objects: [
            {
                'timespanName': '10 minutes',
                'timespanValue': 10
            },
            {
                'timespanName': '20 minutes',
                'timespanValue': 20
            },
            {
                'timespanName': '30 minutes',
                'timespanValue': 30
            },
            {
                'timespanName': '1 hour',
                'timespanValue': 60
            },
            {
                'timespanName': '2 hours',
                'timespanValue': 120
            },
            {
                'timespanName': '6 hours',
                'timespanValue': 360
            },
            {
                'timespanName': '12 hours',
                'timespanValue': 720
            },
            {
                'timespanName': '24 hours',
                'timespanValue': 1440
            }
        ],
        nameKey: 'timespanName',
        valueKey: 'timespanValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedChartTimespan'
    }),

    chartResolutionLabelView: SC.LabelView.design({
        layout: {
            left: 5,
            height: 17,
            bottom: 5,
            width: 65
        },
        controlSize: SC.NORMAL_CONTROL_SIZE,
        //				fontWeight: SC.NORMAL_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'Resolution: '
    }).classNames('blacklabel'),

    chartResolutionFieldView: SC.SelectFieldView.design({
        layout: {
            bottom: 5,
            height: 30,
            left: 70,
            right: 5
        },
        disableSort: YES,

        objects: [
            {
                'chartResolutionName': '15 seconds',
                'chartResolutionValue': 15
            },
            {
                'chartResolutionName': '30 seconds',
                'chartResolutionValue': 30
            },
            {
                'chartResolutionName': '45 seconds',
                'chartResolutionValue': 45
            },
            {
                'chartResolutionName': '1 minute',
                'chartResolutionValue': 60
            },
            {
                'chartResolutionName': '3 minutes',
                'chartResolutionValue': 180
            },
            {
                'chartResolutionName': '10 minutes',
                'chartResolutionValue': 600
            },
            {
                'chartResolutionName': '20 minutes',
                'chartResolutionValue': 1200
            },
            {
                'chartResolutionName': '40 minutes',
                'chartResolutionValue': 2400
            }
        ],
        nameKey: 'chartResolutionName',
        valueKey: 'chartResolutionValue',

        acceptsFirstResponder: function() {
            return this.get('isEnabled');
        }.property('isEnabled'),

        valueBinding: 'EurekaJView.chartGridController.selectedChartResolution'
    })


});

/* >>>>>>>>>> BEGIN source/views/instrumentationTree/instrumentation_group_list_item.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeListItem
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.InstrumentationGroupListItem = SC.ListItemView.extend(
    /** @scope EurekaJView.InstrumentationTreeListItem.prototype */ {

    contentCheckboxKeyBinding: '.content.checkboxKey',
    selectedNodes: []
});

/* >>>>>>>>>> BEGIN source/views/instrumentationTree/instrumentation_groups_administration.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationGroupsAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.InstrumentationGroupsAdministrationView = SC.View.extend(
/** @scope EurekaJView.InstrumentationGroupsAdministrationView.prototype */ {

    childViews: 'newInstrumentationGroupView instrumentationGroupSelectionScrollView deleteAlertButtonView instrumentationGroupContentView'.w(),
    layout: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },

    newInstrumentationGroupView : SC.View.design({
        childViews: 'newInstrumentationGroupTextFieldView newInstrumentationGroupButtonView'.w(),
        layout: {top: 20, height: 30, left: 0, width: 200 },
        backgroundColor: "#ffffff",

        newInstrumentationGroupTextFieldView : SC.TextFieldView.design({
            layout: {top: 2, height: 24, centerY:0, width: 120, left: 2 },
            valueBinding: 'EurekaJView.chartGroupsAdminController.newInstrumentationGroupName'
        }),

        newInstrumentationGroupButtonView: SC.ButtonView.extend({
            layout: {left: 125, right: 2, height: 24, centerY: 0, top: 2, centerY: 0},
            title: "Add",
            action: 'EurekaJView.addnewInstrumentationGroupAction'
        })
    }).classNames('thinBlackBorder'),

    instrumentationGroupSelectionScrollView: SC.ScrollView.design({
        layout: {top: 50, bottom: 25, left: 0, width: 200 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
            backgroundColor: '#F0F8FF',
            contentBinding: 'EurekaJView.chartGroupsAdminController.arrangedObjects',
            selectionBinding: 'EurekaJView.chartGroupsAdminController.selection',
            contentValueKey: "instrumentaionGroupName",
            selectionDelegate: EurekaJView.chartGroupSelectionDelegate,
        })
    }),
    
    deleteAlertButtonView: SC.ButtonView.extend({
        layout: {left: 0, width: 200, height: 24, centerX: 0, bottom: 0, centerY: 0},
        title: "Delete Selected Chart Group",
        action: 'EurekaJView.deleteSelectedChartGroupAction'
    }),

    instrumentationGroupContentView: SC.View.extend({
        childViews: ['instrumentationGroupChartSelectScrollView', 'addSelectedChartsButtonView', 'chartGroupSelectionScrollView', 'saveInstrumentationGroupButtonView'],
        isVisibleBinding: 'EurekaJView.chartGroupsAdminController.showEditInstrumentationGroupView',

        layout: {top: 20, bottom: 0, right: 0, left: 215},

        instrumentationGroupChartSelectScrollView: SC.ScrollView.design({
            layout: {left: 10, right: 20, top: 0, height: 180},
            hasHorizontalScroller: YES,
            hasVerticalScroller: YES,

            contentView: SC.ListView.extend({
                allowsMultipleSelection: NO,
                backgroundColor: '#F0F8FF',
                contentValueKey: "name",
                rowHeight: 18,
                isSelectable: YES,

                contentBinding: 'EurekaJView.chartGroupChartsTreeController.arrangedObjects',
                exampleView: EurekaJView.InstrumentationGroupListItem,
                recordType: EurekaJView.AdminstrationTreeModel,
                action: 'EurekaJView.addSelectedChartsToChartGroup'
            })
        }),

        addSelectedChartsButtonView: SC.ButtonView.design({
            layout: {left: 10, width: 200, top: 190, height: 25},
            title: "Add selected charts to group",
            action: "EurekaJView.addSelectedChartsToChartGroup"
        }),

        chartGroupSelectionScrollView: SC.ScrollView.design({
           layout: {left: 10, right: 20, top: 220, bottom: 40},
           hasHorizontalScroller: YES,
           hasVerticalScroller: YES,


           contentView: SC.ListView.extend({
               allowsMultipleSelection: NO,
               backgroundColor: '#F0F8FF',
               contentValueKey: "guiPath",
               rowHeight: 18,
               canDeleteContent: YES,
               contentBinding: 'EurekaJView.selectedChartGroupChartsController.arrangedObjects',
               selectionBinding: 'EurekaJView.selectedChartGroupChartsController.selection'
           })
       }),

        saveInstrumentationGroupButtonView: SC.ButtonView.design({
            layout: {right: 10, width: 300, bottom: 10, height: 25},
            title: "Save Changes to all Chart Groups",
            action: "EurekaJView.saveInformationGroupsAction"
        })
    })

});

/* >>>>>>>>>> BEGIN source/views/instrumentationTree/instrumentation_tree_list_item.js */
// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeListItem
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.InstrumentationTreeListItem = SC.ListItemView.extend(
    /** @scope EurekaJView.InstrumentationTreeListItem.prototype */ {

    iconBinding: '.content.itemIcon',
    contentCheckboxKeyBinding: '.content.checkboxKey',
    selectedNodes: [],

    observeIsSelected: function() {
        var contentHasChanged = NO;

        if (this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) == -1) {
            this.get('selectedNodes').pushObject(this.get('content'));
            contentHasChanged = YES;
        } else if (!this.get('content').get('isSelected') && this.get('selectedNodes').indexOf(this.get('content')) != -1) {
            this.get('selectedNodes').removeObject(this.get('content'));
            contentHasChanged = YES;
        }

        if (contentHasChanged) {
            this.showSelectedCharts();
        }
    }.observes('.content.isSelected'),


    showSelectedCharts: function() {
        var selectionSet = SC.SelectionSet.create();

        this.get('selectedNodes').forEach(function(currentTreeNode) {
            var chartGridForSelect = currentTreeNode.get('chartGrid');
            if (chartGridForSelect) {
                selectionSet.addObjects(chartGridForSelect);
            }
        }, this);

        EurekaJView.chartGridController.set('content', selectionSet);
    }

});

/* >>>>>>>>>> BEGIN source/views/instrumentationTree/instrumentation_tree_view.js */
// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.InstrumentationTreeView = SC.View.extend(
/** @scope EurekaJView.ChartViewTwo.prototype */
{
	childViews: 'instrumentationTreeLabelView instrumentationTreeScrollView'.w(),
    instrumentationTreeLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            height: 30,
            top: 5,
            left: 10
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_LEFT,
        value: 'INSTRUMENTATION MENU'
    }).classNames(['greylabel', 'underlined']),

	instrumentationTreeScrollView: SC.ScrollView.extend({
        layout: {
            top: 25,
            bottom: 0,
            left: 2,
            width: 299
        },
        canScrollHorizontally: YES,
        hasHorizontalScroller: YES,

        contentView: SC.ListView.extend({
            layout: {
                width: 450
            },
            backgroundColor: '#F0F8FF',
            contentValueKey: "name",
            rowHeight: 18,
            borderStyle: SC.BORDER_NONE,
            isSelectable: NO,

            contentBinding: 'EurekaJView.InstrumentationTreeController.arrangedObjects',
            exampleView: EurekaJView.InstrumentationTreeListItem,
            recordType: EurekaJView.InstrumentationTreeModel
        })
    })
}).classNames(['thinBlackRightborder']);
/* >>>>>>>>>> BEGIN source/views/top_view.js */
// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.TopView = SC.View.extend(
{
	childViews: 'logoView administrationButtonView administrationLabelView'.w(),
	logoView: SC.ImageView.design({
        layout: {left: 10, width: 430, height: 60, top: 5},
        value: '/static/EurekaJView/en/eurekajview/source/resources/images/eurekaj_logo_w_text_60x60.png',
        toolTip: 'EurekaJ Profiler',
    }),
    
    administrationButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {right: 25, width: 49, height: 49, top: 5},
        value: '/static/EurekaJView/en/eurekajview/source/resources/images/ej_tools_49.png',
        toolTip: 'Administration',
        action: 'showAdministrationPaneAction',
        isVisible: false
    }),

    administrationLabelView: SC.LabelView.design(SCUI.SimpleButton, {
        layout: {right: 10, width: 100, height: 25, top: 55},
        value: 'Administration',
        textAlign: SC.ALIGN_RIGHT,
        action: 'showAdministrationPaneAction',
        fontWeight: SC.BOLD_WEIGHT,
        isVisible: false
    }).classNames('greylabel')
	
});
/* >>>>>>>>>> BEGIN source/resources/main_page.js */
// ==========================================================================
// Project:   EurekaJView - mainPage
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This page describes the main user interface for your application.
sc_require('views/informationPanel/information_panel');
sc_require('views/chart/chart_view');
sc_require('views/administration/administration_pane');
sc_require('views/instrumentationTree/instrumentation_tree_list_item');

EurekaJView.mainPage = SC.Page.design({

    // The main pane is made visible on screen as soon as your app is loaded.
    // Add childViews to this pane for views to display immediately on page 
    // load.

    instrumentationTreeView: SC.outlet('mainPane.instrumentationTreeView'),
    instrumentationTreeScrollView: SC.outlet('mainPane.instrumentationTreeView'),
    topView: SC.outlet('mainPane.topView'),

    flotChartGrid: SC.outlet('mainPane.flotChartGrid'),
    informationPanelView: SC.outlet('mainPane.informationPanelView'),

    mainPane: SC.MainPane.design({
        defaultResponder: EurekaJView,
        childViews: 'flotChartGrid topView instrumentationTreeView informationPanelView'.w(),

        topView: EurekaJView.TopView.design({
            isVisible: NO,
            layout: {top: 0, left: 0, right: 0, height: 77 },
            anchorLocation: SC.ANCHOR_TOP
        }).classNames('toolbarGradient'),

        flotChartGrid: EurekaJView.ChartGrid.design({
			isVisible: NO,
            layout: { top: 77, right: 200, bottom: 0, left: 306 }
        }).classNames(['whiteBackground']),

        informationPanelView: EurekaJView.InformationPanelView.design({
            layout: {top: 77, bottom: 0, right: 0, width: 199 },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF"
        }).classNames(['thinBlackLeftborder']),

        instrumentationTreeView: EurekaJView.InstrumentationTreeView.design({
            isVisible: NO,
            layout: {top: 77, bottom: 0, left: 0, width: 305 },
            anchorLocation: SC.ANCHOR_TOP,
            backgroundColor: "#F0F8FF"
    	}).classNames('thinBlackRightborder')
	}),

	adminPanelView: EurekaJView.AdministrationPaneView.design({
    	layout: { width: 700, centerX: 0, height: 500 }
	})
});

/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   EurekaJView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//

EurekaJView.main = function main() {
	//Set up the main pane of the application and initialize the statechart. 
    EurekaJView.getPath('mainPage.mainPane').append();
    EurekaJView.statechart.initStatechart();
};

function main() {
    EurekaJView.main();
}