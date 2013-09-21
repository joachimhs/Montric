Montric.AdministrationAccountsRoute = Ember.Route.extend({
    model: function() {
        return Montric.Account.findAll();
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('accounts');
        }
    }
});