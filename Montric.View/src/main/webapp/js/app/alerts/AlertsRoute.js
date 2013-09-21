Montric.AlertsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('alert');
    }
});