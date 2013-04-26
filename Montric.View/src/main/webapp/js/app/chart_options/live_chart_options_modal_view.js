EurekaJ.LiveChartOptionsView = Ember.View.extend(Ember.TargetActionSupport, {
    templateName: 'live-chart-options',
    click: function() {
        this.triggerAction();
    }
});