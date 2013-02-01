EurekaJ.HeaderView = Ember.View.extend({
    elementId: 'headerArea'
});

EurekaJ.MainDashboardView = Ember.View.extend({
    elementId: 'mainContentArea'
});

EurekaJ.ChartsView = Ember.View.extend({
    elementId: 'chartsArea',
    templateName: 'charts'
});

EurekaJ.ChartMenuView = Ember.View.extend({
    elementId: 'menuArea'
});

EurekaJ.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['button', 'btn-info', 'btn-mini'],
    disabled: false,

    click: function() {
        if (!this.get('disabled')) {
            this.triggerAction();
        }
    },

    template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});

EurekaJ.ChartOptionsModalView = Ember.View.extend({
    elementId: "chartOptionsModal",
    classNames: ["modal",  "hide"]
});

EurekaJ.LiveChartOptionsView = Ember.View.extend(Ember.TargetActionSupport, {
    templateName: 'live-chart-options',
    click: function() {
        this.triggerAction();
    }
});

EurekaJ.HistoricalChartOptionsView = Ember.View.extend(Ember.TargetActionSupport, {
    templateName: 'historical-chart-options',
    click: function() {
        this.triggerAction();
    }

});

EurekaJ.Select = Ember.Select.extend({
    //JHS: The following overrides the Ember.Select code. Fixes a bug in 1.0-pre
    //where the selection would always be the first item in the list when the
    //view is first rendered. This will be fixed in 1.0-final
    _triggerChange: function() {
        var selection = this.get('selection');
        var value = this.get('value');

        if (selection) { this.selectionDidChange(); }
        if (value) { this.valueDidChange(); }

        this._change();
    }
});