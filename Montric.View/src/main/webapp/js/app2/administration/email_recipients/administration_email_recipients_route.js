Montric.AdministrationEmailRecipientsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('emailGroupModel');
    },

    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('emailRecipients');
        }
    }
});
