EurekaJ.AdministrationMenuAdminRoute = Ember.Route.extend({
    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('menuAdmin');
        }
    }
});