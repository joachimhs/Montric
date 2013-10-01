Montric.ChartOptionsComponent = Ember.Component.extend({
    activeTab: 'live',

    classNames: ["modal", "fade"],

    actions: {
        saveChartOptions: function() {
            console.log('savingChartOptions');
            this.sendAction('action');
        },

        showLiveCharts: function() {
            this.set('activeTab', 'live');
            this.sendAction('showLiveCharts');
        },

        showHistoricCharts: function() {
            this.set('activeTab', 'historic');
            this.sendAction('showHistoricCharts');
        }
    },

    liveTabClass: function() {
        if (this.get('isLiveActive')) {
            return "btn btn-primary";
        } else {
            return "btn btn-default";
        }
    }.property('isLiveActive'),

    historicTabClass: function() {
        if (this.get('isHistoricActive')) {
            return "btn btn-primary";
        } else {
            return "btn btn-default";
        }
    }.property('isHistoricActive'),

    isLiveActive: function() {
        return this.get('activeTab') === 'live';
    }.property('activeTab'),

    isHistoricActive: function() {
        return this.get('activeTab') === 'historic';
    }.property('activeTab')
});