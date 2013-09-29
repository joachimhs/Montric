Montric.AdminIndexRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('alerts');
    }
})