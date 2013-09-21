Montric.AccountController = Ember.ObjectController.extend({
    accountTypeObserver: function() {
        var accountType = this.get('accountType');

        if (accountType === 'new') {
            this.transitionToRoute('main.activation');
        }
    }.observes('content.accountType', 'Montric.userRegistered')
});