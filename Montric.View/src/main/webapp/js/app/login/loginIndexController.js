Montric.LoginIndexController = Ember.Controller.extend({
    needs: ['user'],

    isLoggedIn: function() {
        return this.get('controllers.user.isLoggedIn')
    }.property('controllers.user.isLoggedIn'),

    isLoggingIn: function() {
        return this.get('controllers.user.isLoggingIn')
    }.property('controllers.user.isLoggingIn')
});