Montric.AdminRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('alerts');
    }
});