Montric.AdministrationAccessTokensRoute = Ember.Route.extend({
    model: function() {
        return Montric.AccessToken.findAll();
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('accesTokenAdmin');
        }
    }
});