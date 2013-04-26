EurekaJ.AdministrationEmailRecipientsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.EmailGroupModel.find();
    },

    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('emailRecipients');
        }
    }
});
