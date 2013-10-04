Montric.AdminAccountsController = Ember.ArrayController.extend({
    sortProperties: ['id'],
    sortAscending: true,

    actions: {
        updateAccount: function(account) {
            if (account) {
                account.save();
            }
        }
    },

    init: function() {
        this._super();

        var accountTypes = [];
        accountTypes.pushObject('unregistered');
        accountTypes.pushObject('new');
        accountTypes.pushObject('beta');

        this.set('validAccountTypes', accountTypes);
    }
});