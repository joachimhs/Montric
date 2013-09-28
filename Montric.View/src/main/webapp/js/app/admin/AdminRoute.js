Montric.AdminRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('alerts');
    },

    model: function() {
        console.log('Montric.AdminRoute model');
        return this.store.find('adminMenu');
    }
});