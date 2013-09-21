Montric.AdministrationChartGroupsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('chartGroupModel');
    },

    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('chartGroups');
        }
    }
});