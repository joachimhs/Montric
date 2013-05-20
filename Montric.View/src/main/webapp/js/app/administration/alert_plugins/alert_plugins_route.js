Montric.AdministrationAlertPluginsRoute = Ember.Route.extend({
    model: function() {
        return Montric.AlertPlugin.findAll();
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('alertPlugins');
        }
    }
});