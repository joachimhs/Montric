Montric.MainIndexRoute = Ember.Route.extend({
    redirect: function() {
        console.log('redirecting to Charts!');
        this.transitionTo('main.charts');
    }
});