EurekaJ.AdministrationRoute = Ember.Route.extend({
    events: {
        adminAlertsSelected: function() {
            console.log('adminAlertsSelected');
            this.transitionTo('administration.alerts');
        },
        adminChartGroupsSelected: function() {
            console.log('adminChartGroupsSelected');
            this.transitionTo('administration.chartGroups');
        },
        adminEmailRecipientsSelected: function() {
            console.log('adminEmailRecipientsSelected');
            this.transitionTo('administration.emailRecipients');
        },
        adminMenuAdminSelected: function() {
            console.log('adminMenuAdminSelected');
            this.transitionTo('administration.menuAdmin');
        }
    },

    setupController : function(controller) {
        this._super(controller);
        var content = [];

        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'alerts',
            tabName : 'Alerts',
            tabState : 'administration.alerts',
            target : "controller",
            action : "adminAlertsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'chartGroups',
            tabName : 'Chart Group',
            tabState : 'administration.chartGroups',
            target : "controller",
            action : "adminChartGroupsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'emailRecipients',
            tabName : 'EmailRecipients',
            tabState : 'administration.emailRecipients',
            target : "controller",
            action : "adminEmailRecipientsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'menuAdmin',
            tabName : 'Main Menu Admin',
            tabState : 'administration.menuAdmin',
            target : "controller",
            action : "adminMenuAdminSelected"
        }));
        controller.set('content', content);
        controller.resetSelectedTab();

        var adminMenuController = this.controllerFor('administrationMenu');
        EurekaJ.AdminMenuModel.find();
        var mainMenu = EurekaJ.store.filter(EurekaJ.AdminMenuModel, function(data) {
            if (data.get('parent') === null) {
                return true;
            }
        });

        adminMenuController.set('rootNodes', mainMenu);
        adminMenuController.set('content', EurekaJ.AdminMenuModel.find());
    }
});