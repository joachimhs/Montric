EurekaJ.ApplicationController = Ember.Controller.extend({
    init: function() {
        console.log('Application Controller: init');
    }

});

EurekaJ.MainController = Ember.ArrayController.extend({
    content: [],

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
        console.log('MainController: selected nodes: length: ' + this.get('content').get('length'));
    }.observes('content.length')
});


EurekaJ.MenuController = Ember.ArrayController.extend({
    content: []
});


EurekaJ.HeaderController = Ember.Controller.extend({
    content: null
});

EurekaJ.AdminController = Ember.Controller.extend({
    content: null
});

EurekaJ.adminTabBarController = Ember.ArrayController.create({
    content: [],
    selectedTabId: 'alerts',

    init: function() {
        this.get('content').pushObject(EurekaJ.AdminTabModel.create({tabId: 'alerts', tabName: 'Alerts', tabState: 'alerts'}));
        this.get('content').pushObject(EurekaJ.AdminTabModel.create({tabId: 'chartGroups', tabName: 'Chart Group', tabState: 'chartGroups'}));
        this.get('content').pushObject(EurekaJ.AdminTabModel.create({tabId: 'emailRecipients', tabName: 'EmailRecipients', tabState: 'emailRecipients'}));
        this.get('content').pushObject(EurekaJ.AdminTabModel.create({tabId: 'menuAdmin', tabName: 'Main Menu Admin', tabState: 'menuAdmin'}));
    }
})