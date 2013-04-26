EurekaJ.ApplicationController = Ember.Controller.extend({
    timezones: null,
    selectedTimezone: null,
    chartTimespans: null,
    selectedChartTimespan: null,
    chartResolutions: null,
    selectedChartResolution: null,
    selectedChartFromString: null,
    selectedChartToString: null,
    selectedChartFrom: null,
    selectedChartTo: null,
    dateFormat: 'dd mmmm yyyy HH:MM',
    showLiveCharts: null,
    needs: ['charts'],

    init: function() {
        this._super();
        this.set('showLiveCharts', true);
        this.set('timezones', []);
        this.set('chartTimespans', []);
        this.set('chartResolutions', []);
        this.set('selectedChartTo', new Date());
        var fromDate = new Date(this.get('selectedChartTo').getTime() - (10 * 60 * 1000));
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

    selectedTimezoneObserver: function() {
        EurekaJ.set('selectedTimezone', this.get('selectedTimezone.timezoneValue'))
    }.observes('selectedTimezone'),

    selectedChartTimespanObserver: function() {
        EurekaJ.set('selectedChartTimespan', this.get('selectedChartTimespan.timespanValue'))
    }.observes('selectedChartTimespan'),

    selectedChartResolutionObserver: function() {
        EurekaJ.set('selectedChartResolution', this.get('selectedChartResolution.chartResolutionValue'))
    }.observes('selectedChartResolution'),

    showLiveChartsObserver: function() {
        EurekaJ.set('showLiveCharts', this.get('showLiveCharts'))
    }.observes('showLiveCharts'),

    selectedChartFromObserver: function() {
        EurekaJ.set('selectedChartFromMs', this.get('selectedChartFrom').getTime())
    }.observes('selectedChartFrom'),

    selectedChartToObserver: function() {
        EurekaJ.set('selectedChartToMs', this.get('selectedChartTo').getTime())
    }.observes('selectedChartTo'),

    historicalChartsSelected: function() {
        this.set('showLiveCharts', false);
    },

    liveChartsSelected: function() {
        this.set('showLiveCharts', true);
    },

    updateChartDates: function () {
        console.log('updateChartDates');
        var fromDate = Date.fromString(this.get('selectedChartFromString'));
        var toDate = Date.fromString(this.get('selectedChartToString'));

        if (toDate != null && toDate.getYear() != 1970) {
            this.set('selectedChartTo', toDate);
        } else {
            this.set('selectedChartFrom', new Date());
        }

        if (fromDate != null && fromDate.getYear() != 1970) {
            this.set('selectedChartFrom', fromDate);
        } else {
            var fromDate = new Date(this.get('selectedChartFrom').getTime() - (10 * 60 * 1000));
            this.set('selectedChartFrom', fromDate);
        }

        var chartsController = this.get('controllers.charts');
        console.log('chartsController');
        console.log(chartsController);

        if (chartsController) {
            chartsController.reloadCharts();
        }
    },

    generateChartStrings: function () {
        this.set('selectedChartFromString', this.generateChartString(this.get('selectedChartFrom')));
        this.set('selectedChartToString', this.generateChartString(this.get('selectedChartTo')));
    },

    generateChartString: function (date) {
        var fmt = this.get('dateFormat') || 'dd.mm.yy';

        var dateString = date ? dateFormat(date, fmt) : "";
        return dateString;
    },

    showModal: function() {
        console.log('showModal');
        $("#chartOptionsModal").modal({show: true});
    }
});