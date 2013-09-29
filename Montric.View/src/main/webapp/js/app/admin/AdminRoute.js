Montric.AdminRoute = Ember.Route.extend({
    model: function() {
        console.log('Montric.AdminRoute model');
        return this.store.find('adminMenu');
    }
});