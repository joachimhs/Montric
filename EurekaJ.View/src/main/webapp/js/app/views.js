EurekaJ.ApplicationView = Ember.View.extend({
    elementId: 'mainArea',
    templateName: 'application'
});

EurekaJ.LoginView = Ember.View.extend({
    elementId: 'loginArea',
    templateName: 'login-page'
});

EurekaJ.MainView = Ember.View.extend({
    elementId: 'mainContentArea',
    templateName: 'main'
});

EurekaJ.MenuView = Ember.View.extend({
    elementId: 'menuArea',
    templateName: 'main-menu'
});

EurekaJ.HeaderView = Ember.View.extend({
    elementId: 'headerArea',
    templateName: 'header',
    tagName: 'div'
});

EurekaJ.AdminView = Ember.View.extend({
    elementId: 'adminArea',
    templateName: 'admin'
});

EurekaJ.AdminTabContentView = Ember.View.extend({
    elementId: 'adminTabContentArea',
    templateName: 'adminTabContent'
});

EurekaJ.AdminAlertView = Ember.View.extend({
    elementId: 'alertTabView',
    templateName: 'alertTabContent'
});

EurekaJ.AdminChartGroupView = Ember.View.extend({
    elementId: 'chartGroupTabView',
    templateName: 'chartGroupTabContent'
});

EurekaJ.AdminEmailGroupView = Ember.View.extend({
    elementId: 'emailRecipientsTabView',
    templateName: 'emailRecipientsTabContent'
});

EurekaJ.AdminTabContentView = Ember.View.extend({
    elementId: 'menuAdminTabView',
    templateName: 'menuAdminTabContent'
});


EurekaJ.BrowserView = Ember.View.extend({
    templateName: 'browser-template'
});

EurekaJ.BrowserListView = Ember.View.extend({
    templateName: 'browser-list-template'
});

EurekaJ.BrowserItemView = Ember.View.extend({
    templateName: 'browser-item-template'
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

/** Bootstrap Views **/
EurekaJ.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['button'],
    disabled: false,

    click: function() {
        if (!this.get('disabled')) {
            this.triggerAction();
        }
    },

    template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});

EurekaJ.ChartOptionsButton = EurekaJ.BootstrapButton.extend({
    click: function() {
        $("#chartOptionsModal").modal({show: true});
    }
})

EurekaJ.AdministrationButton = EurekaJ.BootstrapButton.extend({
    click: function() {
        EurekaJ.log('EurekaJ.AdministrationButton');
        EurekaJ.get('router').send('doAdmin')
    }
});
//** //Bootstrap Views **/