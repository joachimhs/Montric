EurekaJ.ApplicationController = Ember.Controller.extend({
    init: function() {
        EurekaJ.log('Application Controller: init');
    }

});

EurekaJ.MainController = Ember.ArrayController.extend({
    content: [],
    chartTimerId: null,

    selectNode: function(node) {
        if (this.get('content').indexOf(node) === -1) {
            this.get('content').pushObject(node);
        }
    },

    deselectNode: function(node) {
        var index = this.get('content').indexOf(node);
        if (index >= 0) {
            this.get('content').removeObject(node);
        }
    },

    contentObserver: function() {
        EurekaJ.log('MainController: selected nodes: length: ' + this.get('content').get('length'));
        var content = this.get('content');
        if (content.get('length') > 0 && this.get('chartTimerId') == null) {
            //start timer
            var intervalId = setInterval(function() {
                if (EurekaJ.appValuesController.get('showLiveCharts')) {
                    content.forEach(function (node) {
                        node.get('chart').reload();
                    });
                }
            }, 15000);

            this.set('chartTimerId', intervalId);
        } else if (content.get('length') == 0) {
            //stop timer if started
            if (this.get('chartTimerId') != null) {
                EurekaJ.log('stopping timer');
                clearInterval(this.get('chartTimerId'));
                this.set('chartTimerId', null);
            }
        }
    }.observes('content.length'),

    reloadCharts: function() {
        this.get('content').forEach(function (node) {
            node.get('chart').reload();
        });
    }
});


EurekaJ.MenuController = Ember.ArrayController.extend({
    content: [],

    contentObserver: function() {
        EurekaJ.log('MenuController: selected nodes: length: ' + this.get('content').get('length'));
    }.observes('content.length')
});

EurekaJ.AdminMenuController = Ember.ArrayController.extend({
    content: [],
    selectedNodes: [],

    selectNode: function(node) {
        if (this.get('selectedNodes').indexOf(node) === -1) {
            this.get('selectedNodes').pushObject(node);
        }
    },

    deselectNode: function(node) {
        var index = this.get('selectedNodes').indexOf(node);
        if (index >= 0) {
            this.get('selectedNodes').removeObject(node);
        }
    },

    deselectAllNodes: function() {
        //Implemented as a WHILE loop, as nopt all nodes become unchecked
        //during first pass, for unknown reasons
        while (this.get('selectedNodes').get('length') > 0) {
            this.get('selectedNodes').forEach(function(node) {
                node.set('isSelected', false);
            });
        }
    },

    revealNodeAndCloseOthers: function(id) {
        console.log('start');
        var item = EurekaJ.store.find(EurekaJ.AdminMenuModel, id);
        console.log('item');
        console.log(item);
        var reversedItems = [];

        if (item != null) {
            reversedItems.pushObject(item);
            var parentNode = item.get('parentPath');

            while (parentNode) {
                reversedItems.pushObject(parentNode);
                parentNode = parentNode.get('parentPath');
            }
        }

        console.log('reversing nodes');
        reversedItems.forEach(function (node) {
            node.set('isExpanded', true);
        });

        console.log('finished');
    }
});


EurekaJ.HeaderController = Ember.Controller.extend({
    content: null
});

EurekaJ.AdminController = Ember.Controller.extend({
    content: null
});

EurekaJ.TabBarController = Ember.ArrayController.extend({
    content: [],
    selectedTab: null,

    resetSelectedTab: function() {
        this.set('selectedTab', this.get('content').objectAt(0));
    },

    selectTabWithId: function(tabId) {
        var selectedTab = null;

        this.get('content').forEach(function(tab) {
            if (tab.get('tabId') === tabId) {
                selectedTab = tab;
            }
        });

        this.set('selectedTab', selectedTab);
    }
});

EurekaJ.adminTabBarController = EurekaJ.TabBarController.create({
    content: [],
    selectedTab: null,

    init: function() {
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'alerts', tabName: 'Alerts', tabState: 'alerts'}));
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'chartGroups', tabName: 'Chart Group', tabState: 'chartGroups'}));
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'emailRecipients', tabName: 'EmailRecipients', tabState: 'emailRecipients'}));
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'menuAdmin', tabName: 'Main Menu Admin', tabState: 'menuAdmin'}));

        this.resetSelectedTab();
    }
});

EurekaJ.AdminAlertController = Ember.ArrayController.extend({
    content: [],
    adminMenuController: null,
    newAlertName: '',
    selectedItem: null,
    alertTypes: [ {"key": "greater_than", "value": "Greater than"},
        {"key": "less_than", "value": "Less than"},
        {"key": "equals", "value": "Equal to"}
    ],

    sortAscending: true,
    sortProperties: ['alertName'],

    newAlertIsValid: function() {
        var newNameIsValid = (this.get('newAlertName') && this.get('newAlertName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(alert) {
            if (alert.get('alertName') === this.get('newAlertName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewAlert: function() {
        if (this.newAlertIsValid()) {
            var newAlert = EurekaJ.store.createRecord(EurekaJ.AlertModel, {id: this.get('newAlertName')});
            EurekaJ.store.commit();
        } else {
            EurekaJ.log('New Alert Name Not Valid!');
        }
    }
});

EurekaJ.AdminChartGroupController = Ember.ArrayController.extend({
    content: [],
    newChartGroupName: '',
    adminMenuController: null,

    newChartGroupIsValid: function() {
        var newNameIsValid = (this.get('newChartGroupName') && this.get('newChartGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(chartGroup) {
            if (chartGroup.get('id') === this.get('newChartGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewChartGroup: function() {
        if (this.newChartGroupIsValid()) {
            EurekaJ.store.createRecord(EurekaJ.ChartGroupModel, {"id": this.get('newChartGroupName')});
            EurekaJ.store.commit();
            this.set('newChartGroupName', '');
        } else {
            EurekaJ.log('New Chart Group Not Valid!');
        }
    },

    doAddCheckedNodes: function() {
        console.log('doAddCheckedNodes');
        var selectedChartGroup = this.get('selectedItem');
        var chartGroups = [];

        var selectedNodes = this.get('adminMenuController.selectedNodes');
        if (selectedChartGroup) {
            chartGroups.pushObjects(selectedChartGroup.get('chartGroups'));

            selectedNodes.forEach(function(node) {
                var addGroup = true;
                chartGroups.forEach(function(existingGroup) {
                    if (existingGroup.get('id') === node.get('id')) addGroup = false;
                });
                if (addGroup)
                    chartGroups.pushObject(Ember.Object.create({id: node.get('id')} ));
            });

            selectedChartGroup.set('chartGroupPath', '["' + chartGroups.getEach('id').join('","') + '"]');
        } else {
            console.log('NO SELECTED CHART GROUP');
        }

        this.get('adminMenuController').deselectAllNodes();

        selectedNodes.setEach('isSelected', true);
    },

    deleteSelectedChartPathGroup: function() {
        var selectedChartGroup = this.get('selectedItem');

        var selectedChartGroupPath = this.get('selectedChartGroupPath');
        if (selectedChartGroupPath) {
            console.log('selectedChartGroupPath: ' + selectedChartGroupPath);
            selectedChartGroup.get('chartGroups').removeObject(selectedChartGroupPath);
            selectedChartGroup.set('chartGroupPath', '["' + selectedChartGroup.get('chartGroups').getEach('id').join('","') + '"]');
        }
    }
});

EurekaJ.AdminTabContentController = Ember.ArrayController.extend({
    contentBinding: 'adminMenuController.content',
    adminMenuController: null
});

EurekaJ.AdminEmailGroupController = Ember.ArrayController.extend({
    content: [],
    newEmailGroupName: '',
    newEmailRecipient: '',
    adminMenuController: null,

    newEmailGroupIsValid: function() {
        var newNameIsValid = (this.get('newEmailGroupName') && this.get('newEmailGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(chartGroup) {
            if (chartGroup.get('id') === this.get('newEmailGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewEmailGroup: function() {
        if (this.newEmailGroupIsValid()) {
            EurekaJ.store.createRecord(EurekaJ.EmailGroupModel, {
                "id": this.get('newEmailGroupName'),
                "smtpHost": "",
                "smtpUsername": "",
                "smtpPassword": "",
                "smtpPort": 465,
                "smtpUseSSL": true,
                "emailAddresses": "[]"});
            this.set('newEmailGroupName', '');
        } else {
            EurekaJ.log('New Email Group Not Valid!');
        }
        //EurekaJ.store.commit();
    },

    deleteSelectedEmailGroup: function() {
        var selectedEmailGroup = this.get('selectedItem');
        if (selectedEmailGroup) {
            selectedEmailGroup.deleteRecord();
        }
        EurekaJ.store.commit();
        this.set('selectedItem', null);
    },

    doAddEmailRecipient: function() {
        console.log('doAddEmailRecipient');
        var emailRecipient = this.get('newEmailRecipient');
        var selectedEmailGroup = this.get('selectedItem');

        var oldEmailAddresses = selectedEmailGroup.get('emailRecipients');
        oldEmailAddresses.pushObject(Ember.Object.create({id: emailRecipient}));

        var newAddresses = [];

        oldEmailAddresses.forEach(function(address) {
            newAddresses.pushObject(address.get('id'));
        });

        selectedEmailGroup.set('emailAddresses', '["' + newAddresses.join('","') + '"]');

        console.log(newAddresses);

        this.set('newEmailRecipient', '');
    },

    deleteSelectedEmailRecipient: function() {
        var newAddresses = [];

        var selectedEmailRecipient = this.get('selectedEmailRecipient');
        if (selectedEmailRecipient) {
            this.get('selectedItem.emailRecipients').forEach(function(emailRecipient) {
                if (emailRecipient.get('id') !== selectedEmailRecipient.get('id')) {
                    newAddresses.pushObject(emailRecipient.get('id'));
                }
            });
        }

        this.get('selectedItem').set('emailAddresses', '["' + newAddresses.join('","') + '"]');
    }
});

EurekaJ.SelectedChartGroupController = Ember.ObjectController.extend({
    contentBinding: 'adminChartGroupController.selectedItem',
    adminChartGroupController: null
});

EurekaJ.chartOptionsTabBarController = EurekaJ.TabBarController.create({
    content: [],

    init: function() {
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'live', tabName: 'Live', tabState: null, tabView: EurekaJ.LiveChartOptionsView, target: "EurekaJ.router", action: "liveChartsSelected"}));
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'historical', tabName: 'Historical', tabView: EurekaJ.HistoricalChartOptionsView, target: "EurekaJ.router", action: "historicalChartsSelected"}));

        this.resetSelectedTab();
    }
});

EurekaJ.appValuesController = Ember.Controller.create({
    timezones: [],
    selectedTimezone: null,
    chartTimespans: [],
    selectedChartTimespan: null,
    chartResolutions: [],
    selectedChartResolution: null,
    selectedChartFromString: null,
    selectedChartToString: null,
    selectedChartFrom: new Date(new Date().getTime() - (10 * 60 * 1000)),
    selectedChartTo: new Date(),
    dateFormat: 'dd.mm.yy HH:MM',
    showLiveCharts: true,

    init: function() {
        var fromDate = new Date(this.get('selectedChartTo') - (10 * 60 * 1000));
        if (fromDate) {
            this.set('selectedChartFrom', fromDate);
        }
        this.generateChartStrings();

        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-12', timezoneName: 'UTC-12'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-11', timezoneName: 'UTC-11'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-10', timezoneName: 'UTC-10'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-9', timezoneName: 'UTC-9'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-8', timezoneName: 'UTC-8'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-7', timezoneName: 'UTC-7'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-6', timezoneName: 'UTC-6'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-5', timezoneName: 'UTC-5'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-4', timezoneName: 'UTC-4'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-3', timezoneName: 'UTC-3'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-2', timezoneName: 'UTC-2'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '-1', timezoneName: 'UTC-1'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '0', timezoneName: 'UTC0'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '1', timezoneName: 'UTC+1'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '2', timezoneName: 'UTC+2'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '3', timezoneName: 'UTC+3'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '4', timezoneName: 'UTC+4'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '5', timezoneName: 'UTC+5'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '6', timezoneName: 'UTC+6'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '7', timezoneName: 'UTC+7'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '8', timezoneName: 'UTC+8'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '9', timezoneName: 'UTC+9'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '10', timezoneName: 'UTC+10'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '11', timezoneName: 'UTC+11'}))
        this.get('timezones').pushObject(Ember.Object.create({timezoneValue: '12', timezoneName: 'UTC+12'}))

        var timezoneOffsetIndex = (-1 * new Date().getTimezoneOffset() / 60) + 12;
        this.set('selectedTimezone', this.get('timezones').objectAt(timezoneOffsetIndex));

        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '10 Minutes', timespanValue: '10'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '20 Minutes', timespanValue: '20'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '30 Minutes', timespanValue: '30'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '1 hour', timespanValue: '60'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '2 hours', timespanValue: '120'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '6 hours', timespanValue: '360'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '12 hours', timespanValue: '720'}))
        this.get('chartTimespans').pushObject(Ember.Object.create({timespanName: '24 hours', timespanValue: '1440'}))

        this.set('selectedChartTimespan', this.get('chartTimespans').objectAt(0));


        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '15 seconds', chartResolutionValue: '15'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '30 seconds', chartResolutionValue: '30'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '45 seconds', chartResolutionValue: '45'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '1 minute', chartResolutionValue: '60'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '3 minutes', chartResolutionValue: '180'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '10 minutes', chartResolutionValue: '600'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '20 minutes', chartResolutionValue: '1200'}))
        this.get('chartResolutions').pushObject(Ember.Object.create({chartResolutionName: '40 minutes', chartResolutionValue: '2400'}))

        this.set('selectedChartResolution', this.get('chartResolutions').objectAt(0));
    },

    updateChartDates: function() {
        this.set('selectedChartFrom', Date.fromString(this.get('selectedChartFromString')));
        this.set('selectedChartTo', Date.fromString(this.get('selectedChartToString')));
    },

    generateChartStrings: function() {
        this.set('selectedChartFromString', this.generateChartString(this.get('selectedChartFrom')));
        this.set('selectedChartToString', this.generateChartString(this.get('selectedChartTo')));
    },

    generateChartString: function(date) {
        var fmt = this.get('dateFormat') || 'dd.mm.yy';


        var dateString = date ? dateFormat(date, fmt) : "";
        return dateString;
    }


});