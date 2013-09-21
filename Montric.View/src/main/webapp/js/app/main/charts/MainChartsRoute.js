Montric.MainChartsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('mainMenu');
    }
});