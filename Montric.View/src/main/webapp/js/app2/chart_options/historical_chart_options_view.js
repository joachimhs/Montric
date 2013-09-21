Montric.HistoricalChartOptionsView = Ember.View.extend(Ember.TargetActionSupport, {
    templateName: 'historical-chart-options',
    click: function() {
        this.triggerAction();
    }

});