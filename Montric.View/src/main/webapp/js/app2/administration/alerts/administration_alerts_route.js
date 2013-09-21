Montric.AdministrationAlertsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('alertModel');
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('alerts');
        }
        
        controller.set('alertRecipients', Montric.AlertRecipient.findAll());
    }
});