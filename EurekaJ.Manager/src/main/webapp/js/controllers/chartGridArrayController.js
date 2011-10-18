EurekaJView.chartGridArrayController = SC.ArrayProxy.create({
	timer: null,
    selectedChartTimespan: 10,
    selectedChartResolution: 15,
    selectedChartFrom: null, //SC.DateTime.create(),
    selectedChartTo: null, //SC.DateTime.create(),
    selectedChartFromString: null,
    selectedChartToString: null,
    dateFormat: '%d/%m/%Y %H:%M',
    showHistoricalData: false,
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
        /*var fromDate = this.get('selectedChartFrom').advance({minute: -10});
        if (fromDate) {
            this.set('selectedChartFrom', fromDate);
        }
        this.generateChartStrings();

        this.set('selectedTimeZoneOffset', (-1 * new Date().getTimezoneOffset() / 60));*/
    },
    
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
        return dateString;
    },
});