Montric.AdministrationAccountsController = Ember.ArrayController.extend({
    validAccountTypes: [],

    init: function() {
        var accountTypes = [];
        accountTypes.pushObject('unregistered');
        accountTypes.pushObject('new');
        accountTypes.pushObject('beta');

        this.set('validAccountTypes', accountTypes);
    },

    updateAccount: function(model) {
        if (model) {
            Montric.Account.updateRecord(model);
        }
    }
});