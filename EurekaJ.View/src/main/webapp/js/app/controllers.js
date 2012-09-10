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
                content.forEach(function (node) {
                    EurekaJ.log('refresh-time!!');
                    node.get('chart').reload();
                }) }, 15000);
            this.set('chartTimerId', intervalId);
        } else if (content.get('length') == 0) {
            //stop timer if started
            if (this.get('chartTimerId') != null) {
                EurekaJ.log('stopping timer');
                clearInterval(this.get('chartTimerId'));
                this.set('chartTimerId', null);
            }
        }
    }.observes('content.length')
});


EurekaJ.MenuController = Ember.ArrayController.extend({
    content: [],

    contentObserver: function() {
        EurekaJ.log('MenuController: selected nodes: length: ' + this.get('content').get('length'));
    }.observes('content.length')
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
    newAlertName: '',
    selectedItem: null,
    alertTypes: [ {"key": "gt", "value": "Greater than"},
        {"key": "lt", "value": "Less than"},
        {"key": "eq", "value": "Equal to"}
    ],

    sortAscending: true,
    sortProperties: ['alertName'],

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
});

EurekaJ.chartOptionsTabBarController = EurekaJ.TabBarController.create({
    content: [],
    selectedTab: null,

    init: function() {
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'live', tabName: 'Live', tabState: null, tabView: EurekaJ.LiveChartOptionsView}));
        this.get('content').pushObject(EurekaJ.TabModel.create({tabId: 'historical', tabName: 'Historical', tabState: null}));

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

    init: function() {
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

    }
});