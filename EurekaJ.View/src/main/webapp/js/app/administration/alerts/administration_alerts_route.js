EurekaJ.AdministrationAlertsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.AlertModel.find();
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('alerts');
        }
        
        controller.set('emailGroups', EurekaJ.EmailGroupModel.find());
    }
});