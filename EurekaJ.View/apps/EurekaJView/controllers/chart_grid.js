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

    init: function() {
        var fromDate = this.get('selectedChartFrom').advance({minute: -10});
        if (fromDate) {
            this.set('selectedChartFrom', fromDate);
        }
        this.generateChartStrings();
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

    /*observeChartFromChange: function() {
        var parsedDate = SC.DateTime.parse(this.get('selectedChartFromString'), this.get('dateFormat'));
        SC.Logger.log('From Date parsed to: ' + parsedDate.get('milliseconds') + ' alreadyselectedDate: ' + this.get('selectedChartFrom').get('milliseconds'));
        if (parsedDate && parsedDate.get('milliseconds') <= this.get('selectedChartTo').get('milliseconds')) {
            this.set('selectedChartFrom', parsedDate);
            //this.refreshData();
        } else {
            this.generateChartStrings();
        }
    }.observes('selectedChartFromString'),

    observeChartToChange: function() {
        var parsedDate =  SC.DateTime.parse(this.get('selectedChartToString'), this.get('dateFormat'));
        SC.Logger.log('To Date parsed to: ' + parsedDate);
        if (parsedDate && parsedDate.get('milliseconds') >= this.get('selectedChartFrom').get('milliseconds')) {
            this.set('selectedChartTo', parsedDate);
            //this.refreshData();
        } else {
            this.generateChartStrings();
        }
    }.observes('selectedChartToString'), */

    generateChartStrings: function() {
        this.set('selectedChartFromString', this.generateChartString(this.get('selectedChartFrom')));
        this.set('selectedChartToString', this.generateChartString(this.get('selectedChartTo')));
    },

    selectedChartFromMsProperty: function() {
        this.get('selectedChartFrom').get('milliseconds');
    }.property(),

    selectedChartToMsProperty: function() {
        this.get('selectedChartTo').get('milliseconds');
    }.property(),

    generateChartString: function(date) {
        var fmt = this.get('dateFormat') || '%m/%d/%Y';
        var dateString = date ? date.toFormattedString(fmt) : "";
        return dateString;
    },

    refreshDataFromTimer: function() {
        if (this.get('showHistoricalData') === NO) {
            this.refreshData();
        }
    },

    refreshData: function() {
        if (this.get('content')) {
            this.get('content').forEach(function(item, index, enumerable) {
                item.refresh();
            });
        }
    },

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
