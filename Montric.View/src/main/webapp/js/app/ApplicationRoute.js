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
        console.log('APP ROUTE REDIRECT');

        var cookieUuid = Montric.readCookie("uuidToken");
        console.log('READING COOKIE: ' + cookieUuid);

        if (!cookieUuid) {
            this.transitionTo('login');
        }
    }
});