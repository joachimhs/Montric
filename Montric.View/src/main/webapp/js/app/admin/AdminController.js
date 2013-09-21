Montric.AdminController = Ember.Controller.extend({
    actions: {
        navigateToAdminAlerts: function() {
            this.transitionToRoute('admin.alerts');
        },
        navigateToAdminChartGroups: function () {
            this.transitionToRoute('admin.chartGroups');
        },
        navigateToAdminAlertRecipients: function () {
            this.transitionToRoute('admin.alertRecipients');
        },
        navigateToAdminMainMenu: function () {
            this.transitionToRoute('admin.mainMenu');
        },
        navigateToAdminAccessTokens: function () {
            this.transitionToRoute('admin.accessTokens');
        },
        navigateToAdminAccounts: function () {
            this.transitionToRoute('admin.accounts');
        }
    }
});