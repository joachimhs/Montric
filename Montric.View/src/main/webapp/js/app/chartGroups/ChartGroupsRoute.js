Montric.ChartGroupsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('chartGroup');
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        console.log('ChartGroupsRoute setupController!');
        controller.resetSelectedNodes();
    }
});