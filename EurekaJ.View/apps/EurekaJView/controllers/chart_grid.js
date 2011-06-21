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
		
		this.set('selectedTimeZoneOffset', (-1 * new Date().getTimezoneOffset() / 60));},

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
