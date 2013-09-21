Montric.ApplicationRoute = Ember.Route.extend({
    actions: {
        doLogout: function() {
            console.log('Logging out!');
            navigator.id.logout();
        },

        navigateToAdmin: function() {
            console.log('Navigating to Admin');
            this.transitionTo('admin');
        }
    },

    redirect: function(controller) {
        Montric.set('appInitialized', true);
        this.transitionTo('login');
    }
});